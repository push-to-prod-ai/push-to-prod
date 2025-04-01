import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase
const app = initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID || 'pushtoprod-5b295',
});

const db = getFirestore(app);

// Default feature flags
const defaultFeatureFlags = {
  prSummariesEnabled: true,  // PR summaries enabled by default
  jiraTicketEnabled: false,  // Jira ticket integration disabled by default
  updatedAt: new Date(),
};

async function initDefaultFeatureFlags() {
  console.log('Initializing default feature flags in Firestore...');
  
  try {
    // Store the default feature flags in the config collection
    await db.collection('config').doc('default_feature_flags').set(defaultFeatureFlags);
    
    console.log('Default feature flags successfully stored in Firestore');
  } catch (error) {
    console.error('Error storing default feature flags:', error);
  }
}

initDefaultFeatureFlags();