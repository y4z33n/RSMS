'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { logger } from '@/lib/logger';
import { useAuth } from '@/contexts/auth-context';
import { useNavigation } from '@/services/navigation';
import { Sidebar } from '@/components/admin/sidebar';
import { Home, Users, Package, ShoppingBag, CreditCard, ShoppingCart, MessageSquare } from 'lucide-react';

const SIDEBAR_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/inventory', label: 'Inventory', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/card-quotas', label: 'Card Quotas', icon: CreditCard },
  { href: '/admin/customer-issues', label: 'Customer Issues', icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state } = useAuth();
  const { navigateToLogin } = useNavigation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (state.loading) return;

        // Allow access to login page without authentication
        if (pathname === '/admin/login') {
          if (state.isAdmin) {
            logger.debug('AdminLayout', 'Admin already authenticated, redirecting to dashboard');
            navigateToLogin(true);
          }
          return;
        }

        // Redirect to login if not authenticated or not admin
        if (!state.user || !state.isAdmin) {
          logger.debug('AdminLayout', 'User not authenticated or not admin, redirecting to login');
          navigateToLogin(true);
          return;
        }

        logger.debug('AdminLayout', 'User authenticated and is admin');
      } catch (error) {
        logger.error('AdminLayout', 'Auth check error', error);
        navigateToLogin(true);
      }
    };

    checkAuth();
  }, [pathname, state.loading, state.user, state.isAdmin, navigateToLogin]);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Only render layout if user is authenticated and admin
  if (!state.user || !state.isAdmin || pathname === '/admin/login') {
    return children;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-8">
        {children}
      </main>
    </div>
  );
} 