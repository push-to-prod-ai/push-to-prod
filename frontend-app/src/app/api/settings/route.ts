import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreDb, collections } from '@/lib/firebase';
import { getAuth } from '@/lib/auth'; 

export async function POST(request: NextRequest) {
  try {
    const session = await getAuth(); 
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { organizationId, jiraEmail, jiraDomain, jiraApiToken } = await request.json();
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }
    
    const db = getFirestoreDb();
    await db.collection(collections.settings).doc(organizationId).set({
      jiraEmail,
      jiraDomain,
      jiraApiToken,
      updatedAt: new Date(),
      updatedBy: session.user.id,
    }, { merge: true });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAuth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const organizationId = request.nextUrl.searchParams.get('organizationId');
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    const db = getFirestoreDb();
    const settingsDoc = await db.collection(collections.settings).doc(organizationId).get();

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