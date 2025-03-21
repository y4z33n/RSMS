'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithCustomToken } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';
import { Loader2, ArrowLeft, Shield, KeyRound, User, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { FancyButton } from '@/components/ui/fancy-button';
import { SlideUp, SlideRight } from '@/components/ui/motion';

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

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4">
        <Link href="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main content */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header Image/Gradient */}
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white">
              <SlideUp>
                <h1 className="text-2xl font-bold">Customer Login</h1>
              </SlideUp>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6 text-center"
              >
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  {!showOtpInput ? (
                    <User className="h-8 w-8 text-blue-600" />
                  ) : (
                    <KeyRound className="h-8 w-8 text-blue-600" />
                  )}
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {!showOtpInput ? 'Enter Your Aadhaar Number' : 'Verify OTP'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {!showOtpInput 
                    ? 'We\'ll send you a one-time password to authenticate' 
                    : 'Enter the 6-digit code we sent to your registered mobile'}
                </p>
              </motion.div>

              {!showOtpInput ? (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onSubmit={handleAadhaarSubmit}
                  className="space-y-6"
                >
                  <div>
                    <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhaar Number
                    </label>
                    <div className="relative">
                      <input
                        id="aadhaar"
                        name="aadhaar"
                        type="text"
                        required
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="Enter 12-digit Aadhaar number"
                        pattern="[0-9]{12}"
                        maxLength={12}
                        disabled={loading}
                      />
                      <Shield className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Your 12-digit Aadhaar identification number
                    </p>
                  </div>

                  <FancyButton
                    type="submit"
                    disabled={loading || aadhaarNumber.length !== 12}
                    fullWidth
                    size="lg"
                    variant="gradient"
                    gradientFrom="from-blue-600"
                    gradientTo="to-indigo-600"
                    icon={ChevronRight}
                    iconPosition="right"
                  >
                    {loading ? 'Sending OTP...' : 'Get OTP'}
                  </FancyButton>
                </motion.form>
              ) : (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onSubmit={handleOtpSubmit}
                  className="space-y-6"
                >
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                      One-Time Password
                    </label>
                    <div className="relative">
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="Enter 6-digit OTP"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        disabled={loading}
                      />
                      <KeyRound className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Enter the verification code sent to your phone
                    </p>
                  </div>

                  <FancyButton
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    fullWidth
                    size="lg"
                    variant="gradient"
                    gradientFrom="from-blue-600"
                    gradientTo="to-indigo-600"
                    icon={ChevronRight}
                    iconPosition="right"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </FancyButton>

                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpInput(false);
                      setOtp('');
                    }}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-800 transition-colors py-2"
                  >
                    Change Aadhaar Number
                  </button>
                </motion.form>
              )}
            </div>
          </motion.div>

          <SlideRight delay={0.5}>
            <p className="text-center text-gray-500 text-sm mt-8">
              © {new Date().getFullYear()} eServe. All rights reserved.
            </p>
          </SlideRight>
        </div>
      </div>
    </div>
  );
} 