'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, User, Clock, LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { handleFirebaseError } from '@/lib/error-handling';
import { Suspense, useEffect } from 'react';

// Loading component for Suspense fallback
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}

// Navigation items configuration
const navItems = [
  { href: '/customer/shop', icon: ShoppingBag, label: 'Shop' },
  { href: '/customer/profile', icon: User, label: 'Profile' },
  { href: '/customer/orders', icon: Clock, label: 'Orders' },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { customer, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !customer && window.location.pathname !== '/customer/login') {
      router.push('/customer/login');
    }
  }, [loading, customer, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // If we're on the login page, render children (the login form)
  if (!customer && window.location.pathname === '/customer/login') {
    return <>{children}</>;
  }

  // If not authenticated and not on login page, show loading (will redirect via useEffect)
  if (!customer) {
    return <LoadingSpinner />;
  }

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/customer/login');
    } catch (error) {
      console.error('Logout error:', handleFirebaseError(error));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/customer/shop" className="text-xl font-bold text-gray-900">
                  Ration Shop
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
} 