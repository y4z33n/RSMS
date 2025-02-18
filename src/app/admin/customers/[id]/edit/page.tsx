'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { customerApi } from '@/lib/api/customers';
import type { Customer, RationCardType, FamilyMember } from '@/types/schema';

const rationCardTypes: RationCardType[] = ['WHITE', 'YELLOW', 'GREEN', 'SAFFRON', 'RED'];

export default function EditCustomerPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const data = await customerApi.getCustomer(params.id);
        setCustomer(data);
      } catch (error) {
        console.error('Error fetching customer:', error);
        toast.error('Failed to load customer');
      } finally {
        setLoading(false);
      }
    }

    fetchCustomer();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || saving) return;

    try {
      setSaving(true);
      await customerApi.updateCustomer(customer.id, customer);
      toast.success('Customer updated successfully');
      router.push(`/admin/customers/${customer.id}`);
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const addFamilyMember = () => {
    if (!customer) return;
    setCustomer({
      ...customer,
      familyMembers: [
        ...customer.familyMembers,
        {
          name: '',
          aadhaarNumber: '',
          relationship: '',
          age: 0,
        },
      ],
    });
  };

  const removeFamilyMember = (index: number) => {
    if (!customer) return;
    const newMembers = [...customer.familyMembers];
    newMembers.splice(index, 1);
    setCustomer({
      ...customer,
      familyMembers: newMembers,
    });
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string | number) => {
    if (!customer) return;
    const newMembers = [...customer.familyMembers];
    newMembers[index] = {
      ...newMembers[index],
      [field]: value,
    };
    setCustomer({
      ...customer,
      familyMembers: newMembers,
    });
  };

  if (loading) {
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
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone number
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  name="address"
                  id="address"
                  rows={3}
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="rationCardType" className="block text-sm font-medium text-gray-700">
                  Ration card type
                </label>
                <select
                  id="rationCardType"
                  name="rationCardType"
                  value={customer.rationCardType}
                  onChange={(e) => setCustomer({ ...customer, rationCardType: e.target.value as RationCardType })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {rationCardTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="rationCardNumber" className="block text-sm font-medium text-gray-700">
                  Ration card number
                </label>
                <input
                  type="text"
                  name="rationCardNumber"
                  id="rationCardNumber"
                  value={customer.rationCardNumber}
                  onChange={(e) => setCustomer({ ...customer, rationCardNumber: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Family Members
            </h3>
            <div className="mt-6 space-y-4">
              {customer.familyMembers.map((member, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                      placeholder="Name"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={member.relationship}
                      onChange={(e) => updateFamilyMember(index, 'relationship', e.target.value)}
                      placeholder="Relationship"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      value={member.age}
                      onChange={(e) => updateFamilyMember(index, 'age', parseInt(e.target.value))}
                      placeholder="Age"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={member.aadhaarNumber}
                      onChange={(e) => updateFamilyMember(index, 'aadhaarNumber', e.target.value)}
                      placeholder="Aadhaar Number"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFamilyMember(index)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFamilyMember}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Family Member
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 