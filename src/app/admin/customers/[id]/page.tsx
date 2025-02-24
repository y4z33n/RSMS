'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Edit, ArrowLeft } from 'lucide-react';
import { customerApi } from '@/lib/api/customers';
import type { Customer } from '@/types/schema';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { toast } from 'react-hot-toast';

export default function CustomerDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const router = useRouter();
  const { admin, loading } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, loading, router]);

  useEffect(() => {
    async function fetchCustomer() {
      if (!admin || !id) return;

      try {
        setLoadingCustomer(true);
        setError(null);

        const docRef = doc(db, 'customers', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError('Customer not found');
          return;
        }

        setCustomer({ id: docSnap.id, ...docSnap.data() } as Customer);
      } catch (err) {
        logger.error('CustomerDetailsPage', 'Error fetching customer', err);
        setError('Failed to load customer');
      } finally {
        setLoadingCustomer(false);
      }
    }

    fetchCustomer();
  }, [admin, id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customer) return;

    try {
      setIsSaving(true);
      setError(null);

      const docRef = doc(db, 'customers', id);
      await updateDoc(docRef, {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        aadhaarNumber: customer.aadhaarNumber,
        address: customer.address,
        rationCardType: customer.rationCardType,
        rationCardNumber: customer.rationCardNumber,
        familyMembers: customer.familyMembers,
        monthlyQuota: customer.monthlyQuota
      });

      toast.success('Customer updated successfully');
      router.push('/admin/customers');
    } catch (err) {
      logger.error('CustomerDetailsPage', 'Error updating customer', err);
      setError('Failed to update customer');
      toast.error('Failed to update customer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;

    try {
      setIsDeleting(true);
      setError(null);

      const docRef = doc(db, 'customers', id);
      await deleteDoc(docRef);

      toast.success('Customer deleted successfully');
      router.push('/admin/customers');
    } catch (err) {
      logger.error('CustomerDetailsPage', 'Error deleting customer', err);
      setError('Failed to delete customer');
      toast.error('Failed to delete customer');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  if (loadingCustomer) {
    return <div>Loading...</div>;
  }

  if (!customer) {
    return <div>Customer not found</div>;
  }

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
        <button
          onClick={() => router.push(`/admin/customers/${customer.id}/edit`)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Customer
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Customer Information
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {customer.name}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Aadhaar number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {customer.aadhaarNumber}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Phone number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {customer.phone}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {customer.address}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Ration card type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {customer.rationCardType}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Ration card number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {customer.rationCardNumber}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Family Members
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {customer.familyMembers.map((member, index) => (
              <li key={index} className="px-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.relationship}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age: {member.age}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Aadhaar: {member.aadhaarNumber}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Monthly Quota
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Rice</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {customer.monthlyQuota.rice} kg
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Wheat</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {customer.monthlyQuota.wheat} kg
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Sugar</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {customer.monthlyQuota.sugar} kg
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Kerosene</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {customer.monthlyQuota.kerosene} L
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-600 hover:bg-red-700"
        >
          {isDeleting ? 'Deleting...' : 'Delete Customer'}
        </Button>
      </div>
    </div>
  );
} 