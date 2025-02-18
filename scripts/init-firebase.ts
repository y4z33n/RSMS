import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as path from 'path';

const serviceAccount = require('../ration-shop-ver1-firebase-adminsdk-fbsvc-e4b2ed8c5d.json');

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const auth = getAuth();

async function initializeCollections() {
  try {
    console.log('Initializing collections...');
    
    // Create collections with an initial document to ensure they exist
    await db.collection('customers').doc('initial').set({
      name: 'Initial Customer',
      aadhaarNumber: '000000000000',
      phone: '0000000000',
      address: 'Initial Address',
      rationCardType: 'WHITE',
      rationCardNumber: 'INITIAL000',
      familyMembers: [],
      monthlyQuota: {
        rice: 0,
        wheat: 0,
        sugar: 0,
        kerosene: 0,
      },
      createdAt: new Date(),
    });

    await db.collection('inventory').doc('initial').set({
      name: 'Initial Item',
      quantity: 0,
      unit: 'kg',
      minimumStock: 0,
      prices: {
        WHITE: 0,
        YELLOW: 0,
        GREEN: 0,
        SAFFRON: 0,
        RED: 0,
      },
      lastUpdated: new Date(),
    });

    await db.collection('orders').doc('initial').set({
      customerId: 'initial',
      items: [],
      totalAmount: 0,
      status: 'completed',
      orderDate: new Date(),
      rationCardType: 'WHITE',
    });

    console.log('Collections initialized successfully');

    // Delete the initial documents
    await Promise.all([
      db.collection('customers').doc('initial').delete(),
      db.collection('inventory').doc('initial').delete(),
      db.collection('orders').doc('initial').delete(),
    ]);

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