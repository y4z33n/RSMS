'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import type { RationCardType } from '@/types/schema';

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  aadhaarNumber: string;
  address: string;
  rationCardType: RationCardType;
  rationCardNumber: string;
  familyMembers: Array<{
    name: string;
    aadhaarNumber: string;
    relationship: string;
    age: number;
  }>;
}

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    aadhaarNumber: '',
    address: '',
    rationCardType: 'WHITE',
    rationCardNumber: '',
    familyMembers: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      logger.info('NewCustomerPage', 'Creating new customer', formData);

      // Add customer to Firestore
      const docRef = await addDoc(collection(db, 'customers'), {
        ...formData,
        monthlyQuota: {
          rice: 0,
          wheat: 0,
          sugar: 0,
          kerosene: 0,
        },
        createdAt: new Date(),
      });

      logger.info('NewCustomerPage', 'Customer created successfully', {
        customerId: docRef.id
      });

      router.push('/admin/customers');
    } catch (err) {
      logger.error('NewCustomerPage', 'Error creating customer', err);
      setError('Failed to create customer. Please try again.');
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
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add New Customer</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                pattern="[0-9]{10}"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
              <input
                type="text"
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={handleInputChange}
                required
                pattern="[0-9]{12}"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ration Card Type</label>
              <select
                name="rationCardType"
                value={formData.rationCardType}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="WHITE">White</option>
                <option value="YELLOW">Yellow</option>
                <option value="GREEN">Green</option>
                <option value="SAFFRON">Saffron</option>
                <option value="RED">Red</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ration Card Number</label>
              <input
                type="text"
                name="rationCardNumber"
                value={formData.rationCardNumber}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 