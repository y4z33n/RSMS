'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { logger } from '@/lib/logger';

export default function VerifyPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    async function verifyEmailLink() {
      try {
        logger.info('VerifyPage', 'Checking email sign-in link');

        if (isSignInWithEmailLink(auth, window.location.href)) {
          let email = window.localStorage.getItem('emailForSignIn');
          
          if (!email) {
            logger.warn('VerifyPage', 'No email found in localStorage');
            setError('No email found. Please try logging in again.');
            setVerifying(false);
            return;
          }

          logger.debug('VerifyPage', 'Signing in with email link', { email });
          
          await signInWithEmailLink(auth, email, window.location.href);
          
          // Clear email from storage
          window.localStorage.removeItem('emailForSignIn');
          
          logger.info('VerifyPage', 'Sign in successful, redirecting to shop');
          router.push('/customer/shop');
        } else {
          logger.warn('VerifyPage', 'Invalid sign-in link');
          setError('Invalid sign-in link. Please try logging in again.');
          setVerifying(false);
        }
      } catch (err) {
        logger.error('VerifyPage', 'Error verifying email link', err);
        setError('Failed to verify email link. Please try logging in again.');
        setVerifying(false);
      }
    }

    verifyEmailLink();
  }, [router]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <h2 className="text-center text-xl font-medium text-gray-900">
              Verifying your login...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Verification Failed
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => router.push('/customer/login')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 