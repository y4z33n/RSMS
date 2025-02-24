import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { RationCardType } from '../src/types/schema';
import * as dotenv from 'dotenv';

// Load environment variables from .env and .env.local
dotenv.config({ path: '.env.local' });
dotenv.config();

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = getFirestore(app);
const auth = getAuth(app);

const CARD_TYPES = [
  { type: 'YELLOW' as RationCardType, label: 'Yellow - Antyodaya Anna Yojana (AAY)' },
  { type: 'PINK' as RationCardType, label: 'Pink - Priority (BPL)' },
  { type: 'BLUE' as RationCardType, label: 'Blue - Non-Priority (APL with Subsidy)' }
];

async function initializeCollections() {
  try {
    console.log('Initializing collections...');
    
    // Create initial inventory items if they don't exist
    const inventoryItems = [
      {
        id: '6KQMuTb66w4iiyUgl7Cn',  // Rice ID from database
        name: 'Rice',
        quantity: 1000,
        unit: 'kg',
        minimumStock: 100,
        prices: {
          YELLOW: 3,
          PINK: 5,
          BLUE: 7
        }
      },
      {
        id: 'NN2JnDVsaiPc6ILVUsAH',  // Wheat ID from database
        name: 'Wheat',
        quantity: 1000,
        unit: 'kg',
        minimumStock: 100,
        prices: {
          YELLOW: 2,
          PINK: 4,
          BLUE: 6
        }
      }
    ];

    // Add inventory items
    for (const item of inventoryItems) {
      await db.collection('inventory').doc(item.id).set({
        ...item,
        lastUpdated: new Date()
      });
    }

    // Initialize card quotas for each card type
    for (const { type, label } of CARD_TYPES) {
      const monthlyQuota: Record<string, number> = {};
      inventoryItems.forEach(item => {
        monthlyQuota[item.id] = type === 'YELLOW' ? 10 : type === 'PINK' ? 8 : 6;
      });

      await db.collection('cardQuotas').doc(type).set({
        cardType: type,
        description: label,
        monthlyQuota,
        lastUpdated: new Date()
      });
    }

    // Create initial customer for testing
    await db.collection('customers').doc('initial').set({
      name: 'Initial Customer',
      aadhaarNumber: '000000000000',
      phone: '0000000000',
      address: 'Initial Address',
      rationCardType: 'YELLOW',
      rationCardNumber: 'INITIAL000',
      familyMembers: [],
      remainingQuota: {
        rice: 10,
        wheat: 10
      },
      createdAt: new Date(),
    });

    // Create initial order
    await db.collection('orders').doc('initial').set({
      customerId: 'initial',
      items: [],
      totalAmount: 0,
      status: 'completed',
      orderDate: new Date(),
      rationCardType: 'YELLOW',
    });

    console.log('Collections initialized successfully');

    // Delete the initial order (keep the customer for testing)
    await db.collection('orders').doc('initial').delete();

    console.log('Initial documents cleaned up');
  } catch (error) {
    console.error('Error initializing collections:', error);
  }
}

async function createAdminUser() {
  const adminEmail = 'admin@rationshop.com';
  const adminPassword = 'Admin@123';

  try {
    console.log('Setting up admin user...');
    
    // Check if admin user already exists
    try {
      const userRecord = await auth.getUserByEmail(adminEmail);
      console.log('Admin user already exists:', userRecord.uid);
      
      // Ensure admin claims are set
      await auth.setCustomUserClaims(userRecord.uid, { admin: true });
      console.log('Admin claims updated for existing user');
      
      return;
    } catch (error: any) {
      // If user doesn't exist, continue with creation
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Create new admin user
    const adminUser = await auth.createUser({
      email: adminEmail,
      password: adminPassword,
      emailVerified: true,
      displayName: 'Admin User',
    });

    // Set admin claims
    await auth.setCustomUserClaims(adminUser.uid, { admin: true });

    // Verify claims were set
    const userRecord = await auth.getUser(adminUser.uid);
    console.log('Admin user created successfully:', {
      uid: adminUser.uid,
      email: adminEmail,
      claims: userRecord.customClaims,
    });
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
    throw error;
  }
}

async function main() {
  try {
    await initializeCollections();
    await createAdminUser();
    console.log('Firebase initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

main(); 