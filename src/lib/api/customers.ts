import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where, updateDoc, addDoc } from 'firebase/firestore';
import { Customer, MonthlyQuota } from '@/types/schema';

export const customerApi = {
  async getCustomer(id: string): Promise<Customer> {
    const docRef = doc(db, 'customers', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Customer not found');
    }
    
    return { id: docSnap.id, ...docSnap.data() } as Customer;
  },

  async getCustomerByAadhaar(aadhaarNumber: string): Promise<Customer> {
    const q = query(
      collection(db, 'customers'),
      where('aadhaarNumber', '==', aadhaarNumber)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Customer not found');
    }
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Customer;
  },

  async updateCustomer(id: string, data: Partial<Customer>): Promise<void> {
    const docRef = doc(db, 'customers', id);
    await updateDoc(docRef, data);
  },

  async createCustomer(data: Omit<Customer, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'customers'), data);
    return docRef.id;
  },

  async getMonthlyQuota(rationCardType: string): Promise<MonthlyQuota> {
    const docRef = doc(db, 'monthlyQuotas', rationCardType);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Monthly quota not found');
    }
    
    return docSnap.data() as MonthlyQuota;
  }
}; 