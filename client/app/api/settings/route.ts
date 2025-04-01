import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreDb, collections } from '@/lib/firebase';
import { getCurrentUser } from '@/lib/auth';
import * as firebase from 'firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { 
      jiraEmail, 
      jiraDomain, 
      jiraApiToken, 
      prSummariesEnabled, 
      jiraTicketEnabled,
      systemInstructions,
      prAnalysisPrompt
    } = await request.json();
    
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
      systemInstructions?: string | null;
      prAnalysisPrompt?: string | null;
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
    
    // Handle prompt templates, allowing null for deletion
    if (systemInstructions === null) {
      // Firebase requires a different approach to delete fields
      await db.collection(collections.settings).doc(userId).update({
        systemInstructions: firebase.firestore.FieldValue.delete()
      });
    } else if (systemInstructions !== undefined) {
      updateData.systemInstructions = systemInstructions;
    }
    
    if (prAnalysisPrompt === null) {
      // Firebase requires a different approach to delete fields
      await db.collection(collections.settings).doc(userId).update({
        prAnalysisPrompt: firebase.firestore.FieldValue.delete()
      });
    } else if (prAnalysisPrompt !== undefined) {
      updateData.prAnalysisPrompt = prAnalysisPrompt;
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

export async function GET(request: NextRequest) {
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

    // Check if we're requesting default templates or feature flags
    const { searchParams } = new URL(request.url);
    const getDefaults = searchParams.get('defaults') === 'true';
    const getFeatureFlags = searchParams.get('featureFlags') === 'true';

    if (getDefaults) {
      const defaultTemplatesDoc = await db
        .collection('config')
        .doc('default_templates')
        .get();

      if (!defaultTemplatesDoc.exists) {
        return NextResponse.json({
          success: false,
          error: 'Default templates not found'
        }, { status: 404 });
      }

      const data = defaultTemplatesDoc.data();
      return NextResponse.json({
        success: true,
        systemInstructions: data?.systemInstructions,
        prAnalysisPrompt: data?.prAnalysisPrompt
      });
    }

    if (getFeatureFlags) {
      const defaultFlagsDoc = await db
        .collection('config')
        .doc('default_feature_flags')
        .get();

      if (!defaultFlagsDoc.exists) {
        return NextResponse.json({
          success: false,
          error: 'Default feature flags not found'
        }, { status: 404 });
      }

      const data = defaultFlagsDoc.data();
      return NextResponse.json({
        success: true,
        prSummariesEnabled: data?.prSummariesEnabled !== false,
        jiraTicketEnabled: data?.jiraTicketEnabled === true
      });
    }

    // Regular settings retrieval
    const settingsDoc = await db.collection(collections.settings).doc(userId).get();

    if (!settingsDoc.exists) {
      // Get default feature flags if no user settings exist
      const defaultFlagsDoc = await db
        .collection('config')
        .doc('default_feature_flags')
        .get();

      const defaultFlags = defaultFlagsDoc.exists ? defaultFlagsDoc.data() : null;

      return NextResponse.json({
        exists: false,
        prSummariesEnabled: defaultFlags?.prSummariesEnabled !== false,
        jiraTicketEnabled: defaultFlags?.jiraTicketEnabled === true
      });
    }

    const settings = settingsDoc.data();
    return NextResponse.json({
      exists: true,
      jiraEmail: settings?.jiraEmail,
      jiraDomain: settings?.jiraDomain,
      hasJiraToken: !!settings?.jiraApiToken,
      prSummariesEnabled: settings?.prSummariesEnabled !== false,
      jiraTicketEnabled: settings?.jiraTicketEnabled === true,
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