'use client';

// @ts-nocheck
/* eslint-disable */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, Customer } from '@/types/schema';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';
import { Loader2 } from 'lucide-react';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      // Get customer data from session storage
      const customerData = sessionStorage.getItem('customer');
      if (!customerData) {
        logger.info('CustomerOrdersPage', 'No customer data found, redirecting to login');
        router.push('/customer/login');
        return;
      }

      const parsedCustomer = JSON.parse(customerData);
      setCustomer(parsedCustomer);

      // Fetch orders from Firestore
      const q = query(
        collection(db, 'orders'),
        where('customerId', '==', parsedCustomer.id),
        orderBy('orderDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];

      logger.info('CustomerOrdersPage', 'Fetched orders', { count: ordersData.length });
      setOrders(ordersData);
    } catch (error) {
      logger.error('CustomerOrdersPage', 'Error fetching orders', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [router]);

  const handleCancelOrder = async (orderId: string) => {
    if (cancellingOrderId) return;
    
    try {
      setCancellingOrderId(orderId);
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'cancelled',
        lastUpdated: serverTimestamp()
      });
      
      logger.info('CustomerOrdersPage', 'Order cancelled successfully', { orderId });
      toast.success('Order cancelled successfully');
      
      // Update the local state to reflect the change
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'cancelled' }
            : order
        )
      );
    } catch (error) {
      logger.error('CustomerOrdersPage', 'Error cancelling order', error);
      toast.error('Failed to cancel order. Please try again.');
    } finally {
      setCancellingOrderId(null);
    }
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
      <h1 className="text-2xl font-bold mb-8">Order History</h1>

      {orders.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No orders found</p>
          <button
            onClick={() => router.push('/customer/shop')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Go to Shop
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Order #{order.id.slice(-6).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.orderDate.toDate()).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrderId === order.id}
                        className={`text-sm text-red-600 hover:text-red-800 disabled:opacity-50 ${
                          cancellingOrderId === order.id ? 'cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        {cancellingOrderId === order.id ? (
                          <span className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Cancelling...
                          </span>
                        ) : (
                          'Cancel Order'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} {item.unit} × ₹{item.price}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="text-lg font-medium text-gray-900">₹{order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 