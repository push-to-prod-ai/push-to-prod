import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
export function initializeFirebase() {
  if (getApps().length === 0) {
    // Use Application Default Credentials when running on Google Cloud
    const app = initializeApp({
      // Even when using ADC, project ID is required
      projectId: process.env.FIREBASE_PROJECT_ID || 'pushtoprod-5b295',
    });
    console.log(`Firebase initialized with project ID: ${process.env.FIREBASE_PROJECT_ID || 'pushtoprod-5b295'}`);
    return app;
  }
  return getApps()[0];
}

// Get Firestore instance
export function getFirestoreDb() {
  const app = initializeFirebase();
  return getFirestore(app);
}

// Firestore collections
export const collections = {
  organizations: 'organizations',
  settings: 'settings',
  users: 'users',
  newsletter: 'newsletter_subscribers',
}; 