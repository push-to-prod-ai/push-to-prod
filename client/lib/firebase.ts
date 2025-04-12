import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
export function initializeFirebase() {
  if (getApps().length === 0) {
    const app = initializeApp({
      credential: process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
        ? cert({
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            projectId: process.env.FIREBASE_PROJECT_ID,
          })
        : undefined,
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    
    console.log(`Firebase initialized with project ID: ${process.env.FIREBASE_PROJECT_ID}`);
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