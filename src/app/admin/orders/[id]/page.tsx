'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { orderApi } from '@/lib/api/orders';
import { customerApi } from '@/lib/api/customers';
import { inventoryApi } from '@/lib/api/inventory';
import type { Order, Customer, InventoryItem } from '@/types/schema';

interface OrderWithDetails extends Order {
  customer: Customer;
  items: (OrderItem & { item: InventoryItem })[];
}

export default function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const orderData = await orderApi.getOrder(params.id);
        const customer = await customerApi.getCustomer(orderData.customerId);
        
        const itemsWithDetails = await Promise.all(
          orderData.items.map(async (item) => {
            const inventoryItem = await inventoryApi.getItem(item.itemId);
            return { ...item, item: inventoryItem };
          })
        );

        setOrder({
          ...orderData,
          customer,
          items: itemsWithDetails,
        });
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [params.id]);

  const handleStatusChange = async (status: Order['status']) => {
    if (!order) return;

    try {
      await orderApi.updateOrderStatus(order.id, status);
      setOrder({ ...order, status });
      toast.success('Order status updated');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Order Details
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Order ID: {order.id}
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{order.customer.name}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Ration Card</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {order.customer.rationCardNumber} ({order.customer.rationCardType})
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Order Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(order.orderDate.toDate()).toLocaleString()}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value as Order['status'])}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Order Items
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity} {item.item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{item.priceAtTime.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{(item.quantity * item.priceAtTime).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                  Total Amount:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ₹{order.totalAmount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 