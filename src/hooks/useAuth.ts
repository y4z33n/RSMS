'use client';

import { useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { handleFirebaseError } from '@/lib/error-handling';
import { logger } from '@/lib/logger';

interface AuthState {
  customer: User | null;
  admin: User | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    customer: null,
    admin: null,
    loading: true,
    error: null,
  });

  const checkUserClaims = useCallback(async (user: User) => {
    try {
      // Force token refresh to ensure we have the latest claims
      await user.getIdToken(true);
      const token = await user.getIdTokenResult();
      const isAdmin = token.claims.admin === true;

      logger.info('useAuth', 'User authenticated', {
        userId: user.uid,
        isAdmin,
        email: user.email,
      });

      return isAdmin;
    } catch (error) {
      logger.error('useAuth', 'Error getting token claims', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    logger.info('useAuth', 'Initializing auth state listener');

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (!mounted) return;

        logger.debug('useAuth', 'Auth state changed', { 
          userId: user?.uid,
          email: user?.email 
        });

        if (user) {
          try {
            const isAdmin = await checkUserClaims(user);
            
            if (!mounted) return;

            setState({
              customer: isAdmin ? null : user,
              admin: isAdmin ? user : null,
              loading: false,
              error: null,
            });
          } catch (error) {
            if (!mounted) return;

            setState(prev => ({
              ...prev,
              loading: false,
              error: handleFirebaseError(error),
            }));
          }
        } else {
          if (!mounted) return;

          logger.info('useAuth', 'No user authenticated');
          setState({
            customer: null,
            admin: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!mounted) return;

        logger.error('useAuth', 'Auth state change error', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: handleFirebaseError(error),
        }));
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
      logger.debug('useAuth', 'Cleaned up auth state listener');
    };
  }, [checkUserClaims]);

  return state;
} 