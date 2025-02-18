'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import type { InventoryItem } from '@/types/schema';
import { toast } from 'react-hot-toast';

export default function EditInventoryPage({ params }: { params: { id: string } }) {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, loading, router]);

  useEffect(() => {
    async function fetchItem() {
      if (!admin) return;

      try {
        setIsLoading(true);
        setError(null);

        const docRef = doc(db, 'inventory', params.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError('Item not found');
          return;
        }

        setItem({ id: docSnap.id, ...docSnap.data() } as InventoryItem);
      } catch (err) {
        logger.error('EditInventoryPage', 'Error fetching item', err);
        setError('Failed to load item');
      } finally {
        setIsLoading(false);
      }
    }

    fetchItem();
  }, [admin, params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!item) return;

    try {
      setIsSaving(true);
      setError(null);

      const docRef = doc(db, 'inventory', params.id);
      await updateDoc(docRef, {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        minimumStock: item.minimumStock,
        prices: item.prices,
        lastUpdated: new Date()
      });

      toast.success('Item updated successfully');
      router.push('/admin/inventory');
    } catch (err) {
      logger.error('EditInventoryPage', 'Error updating item', err);
      setError('Failed to update item');
      toast.error('Failed to update item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      setIsDeleting(true);
      setError(null);

      const docRef = doc(db, 'inventory', params.id);
      await deleteDoc(docRef);

      toast.success('Item deleted successfully');
      router.push('/admin/inventory');
    } catch (err) {
      logger.error('EditInventoryPage', 'Error deleting item', err);
      setError('Failed to delete item');
      toast.error('Failed to delete item');
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

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Inventory Item</h1>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete Item'}
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600">Loading item...</p>
          </div>
        ) : item ? (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => setItem({ ...item, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:ring-0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => setItem({ ...item, quantity: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:ring-0"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Unit</label>
              <input
                type="text"
                value={item.unit}
                onChange={(e) => setItem({ ...item, unit: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:ring-0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum Stock</label>
              <input
                type="number"
                value={item.minimumStock}
                onChange={(e) => setItem({ ...item, minimumStock: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:ring-0"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prices by Ration Card Type</label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(item.prices).map(([type, price]) => (
                  <div key={type}>
                    <label className="block text-xs font-medium text-gray-600">{type}</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setItem({
                        ...item,
                        prices: { ...item.prices, [type]: Number(e.target.value) }
                      })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:ring-0"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gray-900 hover:bg-gray-800"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
} 