import { NextRequest } from 'next/server';
import { getFirestoreDb, collections } from '@/lib/firebase';
import { getAuth } from '@/lib/auth'; // Import helper, not config

export async function POST(request: NextRequest) {
  try {
    const session = await getAuth(); // Use the helper function
    // Your logic here
  } catch (error) {
    // Error handling
  }
} 