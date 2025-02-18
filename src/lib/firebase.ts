'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyCUbkQTBp_dtgqpa58KAkcrHhJwVvQZKIw",
  authDomain: "ration-shop-ver1.firebaseapp.com",
  projectId: "ration-shop-ver1",
  storageBucket: "ration-shop-ver1.appspot.com",
  messagingSenderId: "848903603585",
  appId: "1:848903603585:web:511e7ef16294eb023a1480"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

export { app, auth, db, functions };
