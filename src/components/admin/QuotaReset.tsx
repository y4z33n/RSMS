import { useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';
import type { Customer, Order, CardTypeQuota } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface QuotaResetProps {
  selectedProduct?: string;
}

export default function QuotaReset({ selectedProduct }: QuotaResetProps) {
  const [loading, setLoading] = useState(false);

  const resetQuotas = async () => {
    setLoading(true);
    try {
      // 1. Get all customers
      const customersSnapshot = await getDocs(collection(db, 'customers'));
      const customers = customersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];

      // 2. Process each customer
      for (const customer of customers) {
        try {
          // Get card type quota
          const cardQuotaDoc = await getDoc(doc(db, 'cardQuotas', customer.rationCardType));
          if (!cardQuotaDoc.exists()) {
            logger.warn('QuotaReset', `No quota found for card type ${customer.rationCardType}`);
            continue;
          }

          const cardQuota = cardQuotaDoc.data() as CardTypeQuota;
          const customerRef = doc(db, 'customers', customer.id);

          if (selectedProduct) {
            // Reset specific product quota
            await updateDoc(customerRef, {
              [`remainingQuota.${selectedProduct}`]: cardQuota.monthlyQuota[selectedProduct] || 0
            });
          } else {
            // Reset all quotas
            await updateDoc(customerRef, {
              remainingQuota: { ...cardQuota.monthlyQuota }
            });
          }

          logger.info('QuotaReset', `Reset quotas for customer ${customer.id}`, {
            cardType: customer.rationCardType,
            quotas: selectedProduct ? { [selectedProduct]: cardQuota.monthlyQuota[selectedProduct] } : cardQuota.monthlyQuota
          });
        } catch (error) {
          logger.error('QuotaReset', `Error resetting quotas for customer ${customer.id}`, error);
        }
      }

      toast.success('Quotas have been reset successfully');
    } catch (error) {
      logger.error('QuotaReset', 'Error resetting quotas', error);
      toast.error('Failed to reset quotas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={resetQuotas}
      disabled={loading}
      className="flex items-center gap-2"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      Reset Quotas {selectedProduct ? `for ${selectedProduct}` : ''}
    </Button>
  );
}