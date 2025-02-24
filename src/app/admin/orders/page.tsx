'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, orderBy, doc, updateDoc, runTransaction, getDoc, serverTimestamp } from '@firebase/firestore';
import { db } from '@/lib/firebase';
import { orderApi } from '@/lib/api/orders';
import { customerApi } from '@/lib/api/customers';
import type { Order, Customer } from '@/types/schema';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';
import { Loader2 } from 'lucide-react';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const ordersQuery = query(collection(db, 'orders'), orderBy('orderDate', 'desc'));
      const ordersSnapshot = await getDocs(ordersQuery);
      
      const ordersData = ordersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          customerName: data.customerName || 'Unknown'
        } as Order;
      });

      setOrders(ordersData);
    } catch (error) {
      logger.error('AdminOrdersPage', 'Error fetching orders', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, 'orders', orderId);
        const orderDoc = await transaction.get(orderRef);
        
        if (!orderDoc.exists()) {
          throw new Error('Order not found');
        }

        const orderData = orderDoc.data() as Order;

        // If cancelling or rejecting an approved order, restore inventory
        if ((newStatus === 'cancelled' || newStatus === 'rejected') && orderData.status === 'approved') {
          for (const item of orderData.items) {
            const itemRef = doc(db, 'inventory', item.itemId);
            const itemDoc = await transaction.get(itemRef);
            
            if (itemDoc.exists()) {
              transaction.update(itemRef, {
                quantity: itemDoc.data().quantity + item.quantity
              });
            }
          }
        }

        // Update order status
        transaction.update(orderRef, { 
          status: newStatus,
          lastUpdated: serverTimestamp(),
          ...(newStatus === 'cancelled' ? { cancelledAt: serverTimestamp() } : {})
        });
      });

      // Refresh orders list
      await fetchOrders();
      toast.success('Order status updated');
    } catch (error) {
      logger.error('AdminOrdersPage', 'Error updating order status', error);
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Orders</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.customerName}
                  <br />
                  <span className="text-gray-500">{order.rationCardType}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {order.items.map((item, index) => (
                    <div key={index}>
                      {item.name}: {item.quantity} {item.unit}
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{order.totalAmount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'approved')}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'rejected')}
                        className="text-red-600 hover:text-red-900 mr-2"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {order.status === 'approved' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'completed')}
                        className="text-green-600 hover:text-green-900 mr-2"
                      >
                        Mark Completed
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 