'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { addDoc, collection, serverTimestamp } from '@firebase/firestore';
import { db } from '@/lib/firebase';
import type { InventoryItem, RationCardType } from '@/types/schema';

const rationCardTypes: RationCardType[] = ['WHITE', 'YELLOW', 'GREEN', 'SAFFRON', 'RED'];

export default function NewInventoryItemPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<Omit<InventoryItem, 'id' | 'lastUpdated'>>({
    name: '',
    quantity: 0,
    unit: '',
    minimumStock: 0,
    prices: {
      WHITE: 0,
      YELLOW: 0,
      GREEN: 0,
      SAFFRON: 0,
      RED: 0,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      const docRef = await addDoc(collection(db, 'inventory'), {
        ...item,
        lastUpdated: serverTimestamp(),
      });
      toast.success('Item added successfully');
      router.push('/admin/inventory');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  const updatePrice = (type: RationCardType, price: number) => {
    setItem({
      ...item,
      prices: {
        ...item.prices,
        [type]: price,
      },
    });
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

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Item name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={item.name}
                  onChange={(e) => setItem({ ...item, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                  Unit
                </label>
                <input
                  type="text"
                  name="unit"
                  id="unit"
                  required
                  value={item.unit}
                  onChange={(e) => setItem({ ...item, unit: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., kg, L"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Initial quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  required
                  min="0"
                  value={item.quantity}
                  onChange={(e) => setItem({ ...item, quantity: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="minimumStock" className="block text-sm font-medium text-gray-700">
                  Minimum stock level
                </label>
                <input
                  type="number"
                  name="minimumStock"
                  id="minimumStock"
                  required
                  min="0"
                  value={item.minimumStock}
                  onChange={(e) => setItem({ ...item, minimumStock: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Prices by Ration Card Type
            </h3>
            <div className="grid grid-cols-2 gap-6">
              {rationCardTypes.map((type) => (
                <div key={type}>
                  <label htmlFor={`price-${type}`} className="block text-sm font-medium text-gray-700">
                    {type}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      name={`price-${type}`}
                      id={`price-${type}`}
                      required
                      min="0"
                      step="0.01"
                      value={item.prices[type]}
                      onChange={(e) => updatePrice(type, parseFloat(e.target.value))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-7 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Adding...' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
} 