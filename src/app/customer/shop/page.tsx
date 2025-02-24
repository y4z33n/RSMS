'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, getDocs, doc, getDoc, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { Loader2, ShoppingCart, RefreshCw } from 'lucide-react';
import type { Customer, InventoryItem, Order, CardTypeQuota } from '@/types/schema';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart';

export default function CustomerShopPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [availableItems, setAvailableItems] = useState<InventoryItem[]>([]);
  const [remainingQuotas, setRemainingQuotas] = useState<Record<string, number>>({});
  
  const { items: cart, addItem, removeItem, updateQuantity: updateCartQuantity } = useCartStore();

  useEffect(() => {
    // Get customer data from session storage
    const customerData = sessionStorage.getItem('customer');
    if (!customerData) {
      router.push('/customer/login');
      return;
    }

    try {
      const parsedCustomer = JSON.parse(customerData);
      setCustomer(parsedCustomer);
    } catch (error) {
      logger.error('CustomerShopPage', 'Error parsing customer data', error);
      router.push('/customer/login');
    }
  }, [router]);

  const fetchData = async () => {
    if (!customer) return;
    
    try {
      setRefreshing(true);
      
      // Get card quota
      const quotaDoc = await getDoc(doc(db, 'cardQuotas', customer.rationCardType));
      if (!quotaDoc.exists()) {
        throw new Error('Card quota not found');
      }
      const cardQuota = quotaDoc.data() as CardTypeQuota;

      // Get inventory items
      const inventorySnapshot = await getDocs(collection(db, 'inventory'));
      const items = inventorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];

      // Get this month's orders
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const ordersQuery = query(
        collection(db, 'orders'),
        where('customerId', '==', customer.id),
        where('orderDate', '>=', Timestamp.fromDate(startOfMonth))
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);

      // Calculate remaining quotas
      const quotas: Record<string, number> = {};
      items.forEach(item => {
        const monthlyQuota = cardQuota.monthlyQuota[item.id] || 0;
        const used = orders.reduce((total, order) => {
          const orderItem = order.items.find(i => i.itemId === item.id);
          return total + (orderItem?.quantity || 0);
        }, 0);
        quotas[item.id] = Math.max(0, monthlyQuota - used);
      });

      setAvailableItems(items);
      setRemainingQuotas(quotas);
      
      logger.info('CustomerShopPage', 'Data fetched successfully', {
        items: items.length,
        quotas
      });
    } catch (error) {
      logger.error('CustomerShopPage', 'Error fetching data', error);
      toast.error('Failed to load shop data');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customer) {
      fetchData();
    }
  }, [customer]);

  const addToCart = (item: InventoryItem) => {
    const remainingQuota = remainingQuotas[item.id] || 0;
    const cartItem = cart.find(i => i.item.id === item.id);
    const currentQuantity = cartItem ? cartItem.quantity : 0;

    if (currentQuantity >= remainingQuota) {
      toast.error(`You have reached your quota limit for ${item.name}`);
      return;
    }

    addItem(item, 1);
    toast.success(`Added ${item.name} to cart`);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    const remainingQuota = remainingQuotas[itemId] || 0;
    if (newQuantity > remainingQuota) {
      toast.error('Quantity exceeds your remaining quota');
      return;
    }

    if (newQuantity < 0) {
      toast.error('Quantity cannot be negative');
      return;
    }

    updateCartQuantity(itemId, newQuantity);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Store cart data in session storage
    sessionStorage.setItem('cart', JSON.stringify(cart));
    router.push('/customer/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Shop</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Quotas
          </button>
          <button
            onClick={handleCheckout}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Checkout ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
          </button>
        </div>
      </div>

      {availableItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No items available for your ration card type</p>
          <p className="text-sm text-gray-400 mt-2">Please contact the shop administrator</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableItems.map((item) => {
            const remaining = remainingQuotas[item.id] || 0;
            const inCart = cart.find(cartItem => cartItem.item.id === item.id);

            return (
              <div key={item.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-4">Price: ₹{item.prices[customer.rationCardType]}/{item.unit}</p>
                <p className="text-sm text-gray-500 mb-4">
                  Remaining: {remaining} {item.unit}
                </p>

                {inCart ? (
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      min="0"
                      max={remaining}
                      value={inCart.quantity}
                      onChange={(e) => handleUpdateQuantity(item.id, Number(e.target.value))}
                      className="w-20 px-2 py-1 border rounded"
                    />
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(item)}
                    disabled={remaining <= 0}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 