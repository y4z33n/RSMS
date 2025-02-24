'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import { ShoppingBag, Users } from 'lucide-react';

export function HomePage() {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.error) {
      logger.error('HomePage', 'Auth error:', state.error);
    }
  }, [state.error]);

  // Only redirect if explicitly on the home page and authenticated
  useEffect(() => {
    if (!state.loading && window.location.pathname === '/') {
      if (state.isAdmin) {
        logger.debug('HomePage', 'Admin user detected, redirecting to dashboard');
        router.push('/admin/dashboard');
      } else if (state.user) {
        logger.debug('HomePage', 'Customer user detected, redirecting to shop');
        router.push('/customer/shop');
      }
    }
  }, [state.loading, state.isAdmin, state.user, router]);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full space-y-4 p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="text-gray-600">{state.error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-8">
            Welcome to <span className="text-blue-600">Ration Shop</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your trusted platform for essential commodities distribution and management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:scale-105">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Portal</h2>
            <p className="text-gray-600 mb-6">
              Access your ration card benefits and manage your monthly quota with ease
            </p>
            <Button
              onClick={() => router.push('/customer/login')}
              className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
            >
              Customer Login
            </Button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:scale-105">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
              <Users className="w-8 h-8 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Portal</h2>
            <p className="text-gray-600 mb-6">
              Manage inventory, customers, and monitor distribution efficiently
            </p>
            <Button
              onClick={() => router.push('/admin/login')}
              variant="outline"
              className="w-full py-6 text-lg border-2"
            >
              Admin Login
            </Button>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Ration Shop Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
} 