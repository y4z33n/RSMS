import { Timestamp } from '@firebase/firestore';

export type RationCardType = 'YELLOW' | 'PINK' | 'BLUE';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  aadhaarNumber: string;
  rationCardType: RationCardType;
  rationCardNumber: string;
  otpGeneratedAt?: Timestamp | null;
  otp?: string;
}

export interface FamilyMember {
  name: string;
  aadhaarNumber: string;
  relationship: string;
  age: number;
}

export interface CardTypeQuota {
  id: string;
  description: string;
  monthlyQuota: Record<string, number>;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minimumStock: number;
  prices: {
    YELLOW: number;
    PINK: number;
    BLUE: number;
  };
  lastUpdated?: Timestamp;
}

export interface Order {
  id: string;
  customerId: string;
  rationCardType: Customer['rationCardType'];
  items: {
    itemId: string;
    name: string;
    quantity: number;
    price: number;
    unit: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  orderDate: Timestamp;
}

export interface CustomerIssue {
  id: string;
  customerId: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  response?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
} 