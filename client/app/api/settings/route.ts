import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreDb, collections } from '@/lib/firebase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { jiraEmail, jiraDomain, jiraApiToken, prSummariesEnabled, jiraTicketEnabled } = await request.json();
    
    // Use the user's ID as the document ID
    const userId = user.id;
    
    const db = getFirestoreDb();
    
    // Create update object with required fields
    const updateData: {
      updatedAt: Date;
      updatedBy: string;
      jiraEmail?: string;
      jiraDomain?: string;
      jiraApiToken?: string;
      prSummariesEnabled?: boolean;
      jiraTicketEnabled?: boolean;
    } = {
      updatedAt: new Date(),
      updatedBy: userId,
    };
    
    // Only include fields that were provided in the request
    if (jiraEmail !== undefined) updateData.jiraEmail = jiraEmail;
    if (jiraDomain !== undefined) updateData.jiraDomain = jiraDomain;
    if (jiraApiToken) updateData.jiraApiToken = jiraApiToken;
    if (prSummariesEnabled !== undefined) updateData.prSummariesEnabled = prSummariesEnabled;
    if (jiraTicketEnabled !== undefined) updateData.jiraTicketEnabled = jiraTicketEnabled;
    
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
    const user = await getCurrentUser();
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = user.id;
    
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
      // Include feature flags
      prSummariesEnabled: settings?.prSummariesEnabled !== false, // Default to true if not set
      jiraTicketEnabled: settings?.jiraTicketEnabled === true, // Default to false if not set
      // Include prompt templates if they exist
      systemInstructions: settings?.systemInstructions,
      prAnalysisPrompt: settings?.prAnalysisPrompt,
    });
  } catch (error) {
    console.error('Error retrieving settings:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve settings' },
      { status: 500 }
    );
  }
} 