'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CardTypeQuota, RationCardType, InventoryItem } from '@/types/schema';
import { Loader2 } from 'lucide-react';

const CARD_TYPES = [
  { type: 'YELLOW' as RationCardType, label: 'Yellow - Antyodaya Anna Yojana (AAY)' },
  { type: 'PINK' as RationCardType, label: 'Pink - Priority (BPL)' },
  { type: 'BLUE' as RationCardType, label: 'Blue - Non-Priority (APL with Subsidy)' }
];

export default function CardQuotasPage() {
  const [loading, setLoading] = useState(true);
  const [quotas, setQuotas] = useState<Record<RationCardType, CardTypeQuota>>({} as Record<RationCardType, CardTypeQuota>);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch inventory items
      const inventoryQuery = query(collection(db, 'inventory'), orderBy('name'));
      const inventorySnapshot = await getDocs(inventoryQuery);
      const inventoryItems = inventorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];
      setInventory(inventoryItems);

      // Fetch quotas
      const quotasRef = collection(db, 'cardQuotas');
      const quotasSnapshot = await getDocs(quotasRef);
      
      const quotasData: Record<RationCardType, CardTypeQuota> = {} as Record<RationCardType, CardTypeQuota>;
      
      // Initialize with default values for all card types
      CARD_TYPES.forEach(({ type, label }) => {
        const monthlyQuota: Record<string, number> = {};
        inventoryItems.forEach(item => {
          monthlyQuota[item.id] = 0;
        });

        quotasData[type] = {
          cardType: type,
          description: label,
          monthlyQuota,
          lastUpdated: new Date()
        };
      });

      // Override with existing data from Firestore
      quotasSnapshot.forEach((doc) => {
        const data = doc.data() as CardTypeQuota;
        if (data.cardType) {
          quotasData[data.cardType] = {
            ...data,
            lastUpdated: data.lastUpdated.toDate()
          };
        }
      });

      setQuotas(quotasData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleQuotaUpdate(cardType: RationCardType, itemId: string, value: number) {
    const newQuotas = {
      ...quotas,
      [cardType]: {
        ...quotas[cardType],
        monthlyQuota: {
          ...quotas[cardType].monthlyQuota,
          [itemId]: value
        },
        lastUpdated: new Date()
      }
    };
    setQuotas(newQuotas);

    try {
      setSaving(true);
      await setDoc(doc(db, 'cardQuotas', cardType), newQuotas[cardType]);
      toast.success('Quota updated successfully');
    } catch (error) {
      console.error('Error updating quota:', error);
      toast.error('Failed to update quota');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Card Type Quotas</h1>
      
      <div className="space-y-6">
        {CARD_TYPES.map(({ type, label }) => (
          <div key={type} className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{label}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {inventory.map((item) => (
                <div key={item.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {item.name} ({item.unit}/Month)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quotas[type]?.monthlyQuota[item.id] || 0}
                    onChange={(e) => handleQuotaUpdate(type, item.id, Number(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              Last updated: {quotas[type]?.lastUpdated.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 