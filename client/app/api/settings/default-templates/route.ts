import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firebase';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const db = getFirestoreDb();
    
    // Try to get default templates from the config collection
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
  } catch (error) {
    console.error('Error retrieving default templates:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve default templates' },
      { status: 500 }
    );
  }
} 