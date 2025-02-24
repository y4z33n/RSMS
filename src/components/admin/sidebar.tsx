'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Package, ShoppingCart, LogOut, Home, CreditCard, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useNavigation } from '@/services/navigation';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/inventory', label: 'Inventory', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/card-quotas', label: 'Card Quotas', icon: CreditCard },
  { href: '/admin/customer-issues', label: 'Customer Issues', icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { navigateToLogin } = useNavigation();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="flex flex-col w-64 bg-white border-r">
      <div className="flex items-center h-16 px-4 border-b">
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-md',
                pathname === item.href
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
} 