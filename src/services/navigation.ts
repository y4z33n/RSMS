import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { logger } from '@/lib/logger';

export const useNavigation = () => {
  const router = useRouter();
  const { state } = useAuth();

  const navigateBasedOnAuth = useCallback(() => {
    if (state.loading) return;

    try {
      if (state.isAdmin) {
        logger.debug('Navigation', 'Redirecting to admin dashboard');
        router.replace('/admin/dashboard');
      } else if (state.user) {
        logger.debug('Navigation', 'Redirecting to customer shop');
        router.replace('/customer/shop');
      } else {
        logger.debug('Navigation', 'Redirecting to home');
        router.replace('/');
      }
    } catch (error) {
      logger.error('Navigation', 'Navigation error', error);
    }
  }, [state.loading, state.isAdmin, state.user, router]);

  const navigateToLogin = useCallback((isAdmin: boolean = false) => {
    try {
      const path = isAdmin ? '/admin/login' : '/customer/login';
      logger.debug('Navigation', `Redirecting to ${path}`);
      router.replace(path);
    } catch (error) {
      logger.error('Navigation', 'Navigation error', error);
    }
  }, [router]);

  return {
    navigateBasedOnAuth,
    navigateToLogin,
  };
}; 