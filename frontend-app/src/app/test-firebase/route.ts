import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const db = getFirestoreDb();
    const testDoc = await db.collection('test').doc('connection').set({
      timestamp: new Date(),
      status: 'success'
    });
    
    return NextResponse.json({ success: true, message: 'Firebase connection successful' });
  } catch (error) {
    console.error('Firebase connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to connect to Firebase' },
      { status: 500 }
    );
  }
}
