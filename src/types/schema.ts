import { Timestamp } from '@firebase/firestore';

export type RationCardType = 'WHITE' | 'YELLOW' | 'GREEN' | 'SAFFRON' | 'RED';

export interface Customer {
  id: string;
  aadhaarNumber: string;
  name: string;
  phone: string;
  address: string;
  rationCardType: RationCardType;
  rationCardNumber: string;
  familyMembers: FamilyMember[];
  monthlyQuota: MonthlyQuota;
}

export interface FamilyMember {
  name: string;
  aadhaarNumber: string;
  relationship: string;
  age: number;
}

export interface MonthlyQuota {
  rice: number;
  wheat: number;
  sugar: number;
  kerosene: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  prices: Record<RationCardType, number>;
  unit: string;
  minimumStock: number;
  lastUpdated: Timestamp;
}

export interface Order {
  id: string;
  customerId: string;
  rationCardType: RationCardType;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  orderDate: Timestamp;
}

export interface OrderItem {
  itemId: string;
  quantity: number;
  priceAtTime: number;
} 