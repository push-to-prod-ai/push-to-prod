import { getFirestore } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

export interface OrgCredentials {
  githubOrgId: number;
  projectManagement: {
    type: 'jira' | 'clickup';
    apiKey: string;
    baseUrl: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export async function getOrgCredentials(orgId: number): Promise<OrgCredentials | null> {
  const doc = await db.collection('organizations').doc(orgId.toString()).get();
  return doc.exists ? doc.data() as OrgCredentials : null;
}

export async function setOrgCredentials(
  orgId: number, 
  credentials: Omit<OrgCredentials, 'createdAt' | 'updatedAt'>
) {
  const ref = db.collection('organizations').doc(orgId.toString());
  await ref.set({
    ...credentials,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp()
  }, { merge: true });
} 