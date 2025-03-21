'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Mail, User, ShieldAlert } from 'lucide-react';
import { logger } from '@/lib/logger';
import { FancyButton } from '@/components/ui/fancy-button';
import { SlideUp, SlideRight, SlideLeft } from '@/components/ui/motion';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const { state, login, clearError } = useAuth();
  const [email, setEmail] = useState('admin@rationshop.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  
  // Immediately use auth state loading indicators
  const isLoggingIn = state.authenticating;

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!state.initializing && !state.loading && state.isAdmin) {
      router.push('/admin/dashboard');
    }
  }, [state.initializing, state.loading, state.isAdmin, router]);

  // Clear error when inputs change
  useEffect(() => {
    if (error) {
      setError('');
      clearError();
    }
  }, [email, password, error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoggingIn) return;
    
    setError('');

    try {
      logger.debug('AdminLoginPage', 'Attempting login', { email });
      await login(email, password);
      
      logger.info('AdminLoginPage', 'Login successful');
      router.push('/admin/dashboard');
    } catch (err: any) {
      logger.error('AdminLoginPage', 'Login failed', err);
      
      let errorMessage = 'Failed to sign in. Please try again.';
      if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      setError(errorMessage);
    }
  };

  // Show loading state while checking auth
  if (state.initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://images.unsplash.com/photo-1592887714077-1c16a667c546?q=80&w=2070&auto=format&fit=crop"
          alt="Wheat field background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>
      
      {/* Header */}
      <header className="relative z-10 w-full py-6 px-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            type="button"
            onClick={() => router.push('/')}
            className="inline-flex items-center text-white hover:text-amber-200 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </button>
        </motion.div>
      </header>
      
      {/* Main content */}
      <div className="relative z-10 flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <SlideUp>
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-amber-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Header */}
              <div className="h-24 bg-gradient-to-r from-amber-700 to-amber-500 flex items-center justify-center text-white">
                <h1 className="text-2xl font-bold">Admin Portal</h1>
              </div>
              
              {/* Form Content */}
              <div className="p-8">
                <div className="mb-6 text-center">
                  <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-amber-600" />
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Admin Sign In
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Sign in with your admin credentials
                  </p>
                </div>
                
                {error && (
                  <SlideLeft>
                    <div className="mb-6 p-4 rounded-lg bg-red-50 flex items-start">
                      <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </SlideLeft>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <SlideRight delay={0.1}>
                    <div>
                      <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                        Email address
                      </label>
                      <div className="relative">
                        <input
                          id="email-address"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          className="block w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white/80"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoggingIn}
                        />
                        <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </SlideRight>
                  
                  <SlideRight delay={0.2}>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          className="block w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white/80"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoggingIn}
                        />
                        <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </SlideRight>
                  
                  <SlideUp delay={0.3}>
                    <FancyButton
                      type="submit"
                      fullWidth
                      size="lg"
                      variant="gradient"
                      gradientFrom="from-amber-700"
                      gradientTo="to-amber-500"
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? (
                        <span className="flex items-center justify-center">
                          <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Signing in...
                        </span>
                      ) : 'Sign in'}
                    </FancyButton>
                  </SlideUp>
                </form>
              </div>
            </motion.div>
          </SlideUp>
          
          <div className="text-center mt-8">
            <SlideUp delay={0.4}>
              <p className="text-white text-sm drop-shadow">
                © {new Date().getFullYear()} eServe. All rights reserved.
              </p>
            </SlideUp>
          </div>
        </div>
      </div>
    </div>
  );
} 