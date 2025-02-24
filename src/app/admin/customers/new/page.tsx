'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import type { RationCardType } from '@/types/schema';
import { logger } from '@/lib/logger';

const CARD_TYPES = [
  { type: 'YELLOW' as RationCardType, label: 'Yellow - Antyodaya Anna Yojana (AAY)' },
  { type: 'PINK' as RationCardType, label: 'Pink - Priority (BPL)' },
  { type: 'BLUE' as RationCardType, label: 'Blue - Non-Priority (APL with Subsidy)' }
];

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    aadhaarNumber: '',
    address: '',
    rationCardType: 'YELLOW' as RationCardType,
    rationCardNumber: '',
    familyMembers: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      logger.info('NewCustomerPage', 'Creating new customer', formData);

      // Create customer document in Firestore
      const customerRef = await addDoc(collection(db, 'customers'), {
        ...formData,
        createdAt: new Date(),
        monthlyQuota: {
          rice: 0,
          wheat: 0,
          sugar: 0,
          kerosene: 0
        }
      });

      toast.success('Customer created successfully');
      router.push('/admin/customers');
    } catch (error) {
      logger.error('NewCustomerPage', 'Error creating customer', error);
      toast.error('Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-6 sm:space-y-5">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              New Customer
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Add a new customer to the system
            </p>
          </div>

          <div className="space-y-6 sm:space-y-5">
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
              <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Full Name
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="max-w-lg block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
              <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Email
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="max-w-lg block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
              <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Phone Number
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="max-w-lg block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
              <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Aadhaar Number
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  type="text"
                  name="aadhaarNumber"
                  required
                  value={formData.aadhaarNumber}
                  onChange={handleInputChange}
                  className="max-w-lg block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
              <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Address
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="max-w-lg block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
              <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Ration Card Type
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <select
                  name="rationCardType"
                  required
                  value={formData.rationCardType}
                  onChange={handleInputChange}
                  className="max-w-lg block focus:ring-blue-500 focus:border-blue-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                >
                  {CARD_TYPES.map(({ type, label }) => (
                    <option key={type} value={type}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
              <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Ration Card Number
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  type="text"
                  name="rationCardNumber"
                  required
                  value={formData.rationCardNumber}
                  onChange={handleInputChange}
                  className="max-w-lg block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 