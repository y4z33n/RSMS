// @ts-nocheck
/* eslint-disable */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InventoryItem, RationCardType } from '@/types/schema';

interface CartItem {
  item: InventoryItem;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: InventoryItem, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: (rationCardType: RationCardType) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.item.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.item.id === item.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { item, quantity }] };
        });
      },
      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.item.id !== itemId),
        }));
      },
      updateQuantity: (itemId, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.item.id === itemId ? { ...i, quantity } : i
          ),
        }));
      },
      clearCart: () => {
        set({ items: [] });
      },
      getTotal: (rationCardType) => {
        return get().items.reduce(
          (total, { item, quantity }) => total + item.prices[rationCardType] * quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
); 