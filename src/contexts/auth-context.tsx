'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { handleFirebaseError } from '@/lib/error-handling';
import { logger } from '@/lib/logger';

// Enhanced auth state to include more detailed loading states
interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  initializing: boolean;  // Separate flag for initial loading
  authenticating: boolean; // Flag for login process
  signingOut: boolean;    // Flag for logout process
  error: Error | null;
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    loading: true,
    initializing: true,
    authenticating: false,
    signingOut: false,
    error: null,
  });

  // Clear error method
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  useEffect(() => {
    logger.info('AuthProvider', 'Initializing auth state listener');
    let mounted = true;
    
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (!mounted) return;

        if (user) {
          // Force token refresh to get latest claims
          const token = await user.getIdToken(true);
          const tokenResult = await user.getIdTokenResult();
          const isAdmin = tokenResult.claims.admin === true;

          // Set session cookie
          document.cookie = `session=${token}; path=/; max-age=3600; samesite=strict`;

          logger.info('AuthProvider', 'User authenticated', {
            userId: user.uid,
            isAdmin,
            email: user.email,
          });

          setState({
            user,
            isAdmin,
            loading: false,
            initializing: false,
            authenticating: false,
            signingOut: false,
            error: null,
          });
        } else {
          // Clear session cookie
          document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

          logger.info('AuthProvider', 'No user authenticated');
          setState({
            user: null,
            isAdmin: false,
            loading: false,
            initializing: false,
            authenticating: false,
            signingOut: false,
            error: null,
          });
        }
      } catch (error) {
        if (!mounted) return;

        logger.error('AuthProvider', 'Auth state change error', error);
        setState(prev => ({
          ...prev,
          loading: false,
          initializing: false,
          authenticating: false,
          signingOut: false,
          error: handleFirebaseError(error),
        }));
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
      logger.debug('AuthProvider', 'Cleaned up auth state listener');
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ 
        ...prev, 
        loading: true, 
        authenticating: true, 
        error: null 
      }));
      
      logger.debug('AuthProvider', 'Attempting login', { email });
      
      // Sign in with credentials
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Force token refresh to get latest claims
      const token = await userCredential.user.getIdToken(true);
      const tokenResult = await userCredential.user.getIdTokenResult();
      
      if (!tokenResult.claims.admin) {
        logger.warn('AuthProvider', 'Non-admin tried to access admin portal', { email });
        throw new Error('User does not have admin privileges');
      }

      // Set session cookie
      document.cookie = `session=${token}; path=/; max-age=3600; samesite=strict`;
      
      logger.info('AuthProvider', 'Login successful', { email });
      
      setState(prev => ({
        ...prev,
        user: userCredential.user,
        isAdmin: true,
        loading: false,
        authenticating: false,
        error: null,
      }));
    } catch (error) {
      // Clear session cookie on error
      document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      logger.error('AuthProvider', 'Login failed', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        authenticating: false,
        error: handleFirebaseError(error),
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setState(prev => ({ 
        ...prev, 
        loading: true, 
        signingOut: true, 
        error: null 
      }));
      
      logger.info('AuthProvider', 'Logging out user', { 
        userId: state.user?.uid,
        email: state.user?.email 
      });
      
      // Clear session cookie
      document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Clear any stored customer data
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
      
      await auth.signOut();
      
      setState({
        user: null,
        isAdmin: false,
        loading: false,
        initializing: false,
        authenticating: false,
        signingOut: false,
        error: null,
      });

      logger.info('AuthProvider', 'Logout successful');
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      logger.error('AuthProvider', 'Logout failed', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        signingOut: false,
        error: handleFirebaseError(error),
      }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ state, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 