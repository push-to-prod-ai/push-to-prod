import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    const db = getFirestoreDb();
    
    // Add to 'newsletter_subscribers' collection with timestamp
    await db.collection('newsletter_subscribers').add({
      email: email,
      subscribedAt: new Date(),
      status: 'active'
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving newsletter subscription:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
} 