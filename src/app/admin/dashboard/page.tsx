'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  totalCustomers: number;
  totalOrders: number;
  lowStockItems: number;
}

export default function AdminDashboardPage() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalOrders: 0,
    lowStockItems: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    logger.debug('AdminDashboardPage', 'Checking auth state', {
      isAdmin: !!admin,
      loading
    });

    if (!loading && !admin) {
      logger.info('AdminDashboardPage', 'Unauthorized access, redirecting to login');
      router.push('/admin/login');
    }
  }, [admin, loading, router]);

  useEffect(() => {
    async function fetchStats() {
      if (!admin) return;
      
      try {
        setIsLoading(true);
        setError(null);

        // Fetch customers count
        const customersSnapshot = await getDocs(collection(db, 'customers'));
        const totalCustomers = customersSnapshot.size;

        // Fetch orders count
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const totalOrders = ordersSnapshot.size;

        // Fetch low stock items
        const inventorySnapshot = await getDocs(collection(db, 'inventory'));
        const lowStockItems = inventorySnapshot.docs.filter(doc => {
          const data = doc.data();
          return data.quantity <= data.minimumStock;
        }).length;

        setStats({
          totalCustomers,
          totalOrders,
          lowStockItems
        });
      } catch (err) {
        logger.error('AdminDashboardPage', 'Error fetching stats', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [admin]);

  if (loading || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Admin Dashboard</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Quick Stats</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? 'Loading...' : stats.totalCustomers}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? 'Loading...' : stats.totalOrders}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? 'Loading...' : stats.lowStockItems}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Recent Activity</h2>
          <div className="space-y-4">
            <p className="text-gray-600">Loading recent activities...</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h2>
          <div className="space-y-4">
            <Button 
              onClick={() => router.push('/admin/customers/new')}
              className="w-full bg-gray-900 hover:bg-gray-800"
            >
              Add New Customer
            </Button>
            <Button 
              onClick={() => router.push('/admin/inventory/new')}
              className="w-full bg-gray-900 hover:bg-gray-800"
            >
              Add Inventory Item
            </Button>
            <Button 
              onClick={() => router.push('/admin/orders')}
              className="w-full bg-gray-900 hover:bg-gray-800"
            >
              View Orders
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 