'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, doc, getDoc, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';
import { Loader2 } from 'lucide-react';
import type { Customer, CustomerIssue, InventoryItem, CardTypeQuota } from '@/types/schema';

export default function CustomerProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [issues, setIssues] = useState<CustomerIssue[]>([]);
  const [newIssue, setNewIssue] = useState('');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [quotas, setQuotas] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get customer data from session storage
      const customerData = sessionStorage.getItem('customer');
      if (!customerData) {
        router.push('/customer/login');
        return;
      }

      const parsedCustomer = JSON.parse(customerData);
      setCustomer(parsedCustomer);

      // Fetch inventory items
      const inventorySnapshot = await getDocs(collection(db, 'inventory'));
      const items = inventorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];
      setInventory(items);

      // Fetch quotas for customer's ration card type
      const quotaDoc = await getDoc(doc(db, 'cardQuotas', parsedCustomer.rationCardType));
      if (quotaDoc.exists()) {
        const quotaData = quotaDoc.data() as CardTypeQuota;
        setQuotas(quotaData.monthlyQuota);
      }

      // Fetch customer issues
      const issuesQuery = query(
        collection(db, 'customerIssues'),
        where('customerId', '==', parsedCustomer.id)
      );
      const issuesSnapshot = await getDocs(issuesQuery);
      const issuesData = issuesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CustomerIssue[];
      setIssues(issuesData);
    } catch (error) {
      logger.error('CustomerProfilePage', 'Error fetching data', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !newIssue.trim()) return;

    try {
      await addDoc(collection(db, 'customerIssues'), {
        customerId: customer.id,
        description: newIssue.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setNewIssue('');
      toast.success('Issue submitted successfully');
      fetchData(); // Refresh issues list
    } catch (error) {
      logger.error('CustomerProfilePage', 'Error submitting issue', error);
      toast.error('Failed to submit issue');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600">Name</p>
            <p className="text-lg font-medium">{customer.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Phone</p>
            <p className="text-lg font-medium">{customer.phone || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-600">Ration Card Type</p>
            <p className="text-lg font-medium">{customer.rationCardType}</p>
          </div>
          <div>
            <p className="text-gray-600">Ration Card Number</p>
            <p className="text-lg font-medium">{customer.rationCardNumber}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-600">Address</p>
            <p className="text-lg font-medium">{customer.address || 'Not provided'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Monthly Quota</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map((item) => {
            const quota = quotas[item.id] || 0;
            return (
              <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-600">
                  Quota: {quota} {item.unit}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6">Report an Issue</h2>
        <form onSubmit={handleSubmitIssue} className="space-y-4">
          <div>
            <label htmlFor="issue" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="issue"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={newIssue}
              onChange={(e) => setNewIssue(e.target.value)}
              placeholder="Describe your issue..."
            />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit Issue
          </button>
        </form>

        {issues.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Previous Issues</h3>
            <div className="space-y-4">
              {issues.map((issue) => (
                <div key={issue.id} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900">{issue.description}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full
                      ${issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        issue.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {issue.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {issue.createdAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  {issue.response && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="font-medium">Response:</p>
                      <p>{issue.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 