'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h1 className="text-3xl font-bold text-center text-gray-900">
            Ration Shop Management System
          </h1>
          <p className="mt-2 text-center text-gray-600">
            Please select your login type
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => router.push('/customer/login')}
            className="w-full py-6 text-lg"
          >
            Customer Login
          </Button>

          <Button
            onClick={() => router.push('/admin/login')}
            variant="outline"
            className="w-full py-6 text-lg"
          >
            Admin Login
          </Button>
        </div>
      </div>
    </div>
  );
} 