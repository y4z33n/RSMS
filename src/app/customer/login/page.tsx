'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { logger } from '@/lib/logger';
import { toast } from 'react-hot-toast';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      logger.info('CustomerLoginPage', 'Verifying customer details', { email, aadhaar });

      // Check if customer exists with given email and Aadhaar
      const customersRef = collection(db, 'customers');
      const q = query(
        customersRef,
        where('email', '==', email),
        where('aadhaarNumber', '==', aadhaar)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        logger.warn('CustomerLoginPage', 'Customer not found', { email, aadhaar });
        setError('No customer found with these details. Please contact the admin.');
        setLoading(false);
        return;
      }

      // Configure action code settings
      const actionCodeSettings = {
        url: `${window.location.origin}/customer/verify`,
        handleCodeInApp: true
      };

      // Send sign-in link
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);

      // Save the email and aadhaar for verification
      window.localStorage.setItem('emailForSignIn', email);
      window.localStorage.setItem('aadhaarForSignIn', aadhaar);

      logger.info('CustomerLoginPage', 'Sign-in link sent successfully', { email });
      setMessage('A sign-in link has been sent to your email. Please check your inbox and spam folder.');
      toast.success('Login link sent! Check your email.');

    } catch (err: any) {
      logger.error('CustomerLoginPage', 'Login error', err);
      let errorMessage = 'Failed to send login link. Please try again.';
      
      if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email link sign-in is not enabled. Please contact support.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/invalid-dynamic-link-domain') {
        errorMessage = 'Invalid configuration. Please contact support.';
      } else if (err.code === 'permission-denied') {
        errorMessage = 'Access denied. Please make sure you have the correct permissions.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <button
            onClick={() => {
              logger.debug('CustomerLoginPage', 'Navigating back to home');
              router.push('/');
            }}
            className="mb-8 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </button>
          
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Customer Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your registered email and Aadhaar number
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {message && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{message}</div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="aadhaar" className="sr-only">
                Aadhaar Number
              </label>
              <input
                id="aadhaar"
                name="aadhaar"
                type="text"
                required
                pattern="[0-9]{12}"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
                placeholder="Aadhaar Number (12 digits)"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800"
              disabled={loading}
            >
              {loading ? 'Sending login link...' : 'Send Login Link'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 