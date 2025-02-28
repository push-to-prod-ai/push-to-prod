import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
export function initializeFirebase() {
  if (getApps().length === 0) {
    const app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
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
}; 