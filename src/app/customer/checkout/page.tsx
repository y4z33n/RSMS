'use client';

// @ts-nocheck
/* eslint-disable */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';
import { Loader2 } from 'lucide-react';
import type { Customer } from '@/types/schema';
import { useCartStore } from '@/lib/store/cart';

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const { items: cart, clearCart, getTotal } = useCartStore();

  useEffect(() => {
    // Get customer data from session storage
    const customerData = sessionStorage.getItem('customer');

    if (!customerData || cart.length === 0) {
      toast.error('Please select items before checkout');
      router.push('/customer/shop');
      return;
    }

    try {
      const parsedCustomer = JSON.parse(customerData);
      setCustomer(parsedCustomer);
    } catch (error) {
      logger.error('CheckoutPage', 'Error parsing customer data', error);
      toast.error('Error loading checkout data');
      router.push('/customer/shop');
    }
  }, [router, cart.length]);

  const handlePlaceOrder = async () => {
    if (loading || !customer) return;
    setLoading(true);

    try {
      // Create order document
      const orderRef = await addDoc(collection(db, 'orders'), {
        customerId: customer.id,
        rationCardType: customer.rationCardType,
        items: cart.map(({ item, quantity }) => ({
          itemId: item.id,
          name: item.name,
          quantity,
          price: item.prices[customer.rationCardType],
          unit: item.unit
        })),
        totalAmount: getTotal(customer.rationCardType),
        status: 'pending',
        orderDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        customerName: customer.name || 'Unknown',
        customerPhone: customer.phone || 'N/A',
        customerAddress: customer.address || 'N/A'
      });

      logger.info('CheckoutPage', 'Order placed successfully', {
        orderId: orderRef.id,
        items: cart.length,
        total: getTotal(customer.rationCardType)
      });

      // Clear cart
      clearCart();
      toast.success('Order placed successfully');
      router.push('/customer/orders');
    } catch (error) {
      logger.error('CheckoutPage', 'Error placing order', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!customer || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        
        <div className="space-y-4">
          {cart.map(({ item, quantity }) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-500">
                  {quantity} {item.unit} × ₹{item.prices[customer.rationCardType]}
                </p>
              </div>
              <span className="font-medium">
                ₹{(item.prices[customer.rationCardType] * quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between items-center font-semibold">
            <span>Total Amount</span>
            <span>₹{getTotal(customer.rationCardType).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Placing Order...
          </span>
        ) : (
          'Place Order'
        )}
      </button>
    </div>
  );
} 