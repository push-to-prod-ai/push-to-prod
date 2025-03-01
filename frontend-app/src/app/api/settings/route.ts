import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreDb, collections } from '@/lib/firebase';
import { getAuth } from '@/utils/auth'; 

export async function POST(request: NextRequest) {
  try {
    const session = await getAuth(); 
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { jiraEmail, jiraDomain, jiraApiToken } = await request.json();
    
    // Use the user's ID as the document ID instead of organization ID
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      );
    }
    
    const db = getFirestoreDb();
    
    // Create update object with required fields
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
    
    await db.collection(collections.settings).doc(userId).set(updateData, { merge: true });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getAuth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Use the user's ID as the document ID
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      );
    }

    const db = getFirestoreDb();
    const settingsDoc = await db.collection(collections.settings).doc(userId).get();

    if (!settingsDoc.exists) {
      return NextResponse.json({ exists: false });
    }

    const settings = settingsDoc.data();
    return NextResponse.json({
      exists: true,
      jiraEmail: settings?.jiraEmail,
      jiraDomain: settings?.jiraDomain,
      // Don't return the API token for security reasons
      hasJiraToken: !!settings?.jiraApiToken,
    });
  } catch (error) {
    console.error('Error retrieving settings:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve settings' },
      { status: 500 }
    );
  }
}