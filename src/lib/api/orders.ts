import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  runTransaction
} from '@firebase/firestore';
import { db } from '../firebase';
import { inventoryApi } from './inventory';
import { customerApi } from './customers';
import type { Order, OrderItem } from '@/types/schema';

export const orderApi = {
  async createOrder(data: Omit<Order, 'id' | 'orderDate' | 'status'>): Promise<string> {
    return await runTransaction(db, async (transaction) => {
      // Validate customer exists
      const customer = await customerApi.getCustomer(data.customerId);
      
      // Check and update inventory
      for (const item of data.items) {
        const inventoryItem = await inventoryApi.getItem(item.itemId);
        if (inventoryItem.quantity < item.quantity) {
          throw new Error(`Insufficient stock for item: ${inventoryItem.name}`);
        }
        
        // Update inventory
        const inventoryRef = doc(db, 'inventory', item.itemId);
        transaction.update(inventoryRef, {
          quantity: inventoryItem.quantity - item.quantity,
          lastUpdated: serverTimestamp()
        });
      }
      
      // Create order
      const orderRef = await addDoc(collection(db, 'orders'), {
        ...data,
        status: 'pending',
        orderDate: serverTimestamp()
      });
      
      return orderRef.id;
    });
  },

  async getOrder(id: string): Promise<Order> {
    const docRef = doc(db, 'orders', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Order not found');
    }
    
    return { id: docSnap.id, ...docSnap.data() } as Order;
  },

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    const q = query(
      collection(db, 'orders'),
      where('customerId', '==', customerId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<void> {
    const docRef = doc(db, 'orders', id);
    await updateDoc(docRef, { status });
  }
}; 