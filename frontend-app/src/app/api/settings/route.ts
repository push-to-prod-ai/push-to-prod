import { getFirestoreDb, collections } from '@/lib/firebase';
import { withAuth, apiSuccess, apiError, validateBody } from '@/lib/api-handlers';

// Interface for settings data
interface SettingsData {
  jiraEmail: string;
  jiraDomain: string;
  jiraApiToken?: string;
}

// GET handler to retrieve user settings
export const GET = withAuth(async (req, { userId }) => {
  const db = getFirestoreDb();
  
  // Fetch user settings from Firestore
  const docRef = await db.collection(collections.settings).doc(userId).get();
  
  if (!docRef.exists) {
    return apiSuccess({ exists: false });
  }
  
  const data = docRef.data();
  return apiSuccess({
    exists: true,
    jiraEmail: data?.jiraEmail,
    jiraDomain: data?.jiraDomain,
    hasJiraToken: !!data?.jiraApiToken,
    // Don't return actual token for security
  });
});

// POST handler to update user settings
export const POST = withAuth(async (req, { userId }) => {
  const db = getFirestoreDb();
  
  // Parse and validate request body
  const body = await validateBody<SettingsData>(req, ['jiraEmail', 'jiraDomain']);
  if (!body) {
    return apiError('Missing required fields');
  }
  
  const { jiraEmail, jiraDomain, jiraApiToken } = body;
  
  // Prepare data for update
  const updateData: {
    jiraEmail: string;
    jiraDomain: string;
    updatedAt: Date;
    updatedBy: string;
    jiraApiToken?: string;
  } = {
    jiraEmail,
    jiraDomain,
    updatedAt: new Date(),
    updatedBy: userId,
  };
  
  // Only include jiraApiToken if it was provided in the request
  if (jiraApiToken !== undefined) {
    updateData.jiraApiToken = jiraApiToken;
  }
  
  // Update settings in Firestore
  await db.collection(collections.settings).doc(userId).set(updateData, { merge: true });
  
  return apiSuccess();
});