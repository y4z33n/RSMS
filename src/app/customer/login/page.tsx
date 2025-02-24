'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithCustomToken } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Function to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export default function CustomerLoginPage() {
  const router = useRouter();
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAadhaarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      // Query customer by Aadhaar number
      const customersRef = collection(db, 'customers');
      const q = query(customersRef, where('aadhaarNumber', '==', aadhaarNumber));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error('Customer not found');
        return;
      }

      const customerDoc = querySnapshot.docs[0];
      const customerData = customerDoc.data();

      // Generate and store OTP
      const newOTP = generateOTP();
      await updateDoc(doc(db, 'customers', customerDoc.id), {
        currentOTP: newOTP,
        otpGeneratedAt: serverTimestamp()
      });

      // In a real application, send OTP via SMS
      console.log('OTP:', newOTP); // For development only

      // Store customer ID for verification
      sessionStorage.setItem('tempCustomerId', customerDoc.id);

      setShowOtpInput(true);
      toast.success('OTP sent successfully');
    } catch (error) {
      logger.error('CustomerLoginPage', 'Error in Aadhaar verification', error);
      toast.error('Failed to verify Aadhaar number');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      const customerId = sessionStorage.getItem('tempCustomerId');
      if (!customerId) {
        throw new Error('Customer ID not found');
      }

      // Verify OTP
      const customerDoc = await getDocs(query(
        collection(db, 'customers'),
        where('aadhaarNumber', '==', aadhaarNumber),
        where('currentOTP', '==', otp)
      ));

      if (customerDoc.empty) {
        toast.error('Invalid OTP');
        return;
      }

      // Get custom token from your backend
      const response = await fetch('/api/auth/customer-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerId,
          aadhaarNumber 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get authentication token');
      }

      const { token } = await response.json();

      // Sign in with custom token
      await signInWithCustomToken(auth, token);

      // Store customer data
      const customer = customerDoc.docs[0].data();
      sessionStorage.setItem('customer', JSON.stringify({
        id: customerDoc.docs[0].id,
        ...customer
      }));

      // Clear temporary data
      sessionStorage.removeItem('tempCustomerId');

      // Clear OTP from database
      await updateDoc(doc(db, 'customers', customerId), {
        currentOTP: null,
        otpGeneratedAt: null
      });

      toast.success('Login successful');
      router.push('/customer/shop');
    } catch (error) {
      logger.error('CustomerLoginPage', 'Error in OTP verification', error);
      toast.error('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Customer Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter your Aadhaar number to continue
          </p>
        </div>

        <div className="mt-8">
          {!showOtpInput ? (
            <form onSubmit={handleAadhaarSubmit} className="space-y-6">
              <div>
                <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700">
                  Aadhaar Number
                </label>
                <input
                  id="aadhaar"
                  name="aadhaar"
                  type="text"
                  required
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter 12-digit Aadhaar number"
                  pattern="[0-9]{12}"
                  maxLength={12}
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                disabled={loading || aadhaarNumber.length !== 12}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  'Get OTP'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter 6-digit OTP"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  'Verify OTP'
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setShowOtpInput(false);
                  setOtp('');
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-500"
              >
                Change Aadhaar Number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 