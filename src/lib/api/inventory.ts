import { 
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import type { InventoryItem } from '@/types/schema';

export const inventoryApi = {
  async getItem(id: string): Promise<InventoryItem> {
    const docRef = doc(db, 'inventory', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Inventory item not found');
    }
    
    return { id: docSnap.id, ...docSnap.data() } as InventoryItem;
  },

  async getAllItems(): Promise<InventoryItem[]> {
    const querySnapshot = await getDocs(collection(db, 'inventory'));
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as InventoryItem[];
  },

  async getLowStockItems(): Promise<InventoryItem[]> {
    const items = await this.getAllItems();
    return items.filter(item => item.quantity <= item.minimumStock);
  },

  async updateItem(id: string, data: Partial<InventoryItem>): Promise<void> {
    const docRef = doc(db, 'inventory', id);
    await updateDoc(docRef, {
      ...data,
      lastUpdated: serverTimestamp()
    });
  },

  async updateStock(id: string, quantity: number): Promise<void> {
    const docRef = doc(db, 'inventory', id);
    await updateDoc(docRef, {
      quantity,
      lastUpdated: serverTimestamp()
    });
  }
}; 