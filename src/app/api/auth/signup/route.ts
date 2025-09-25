// This endpoint is no longer needed with Firebase Authentication. 
// The client will interact directly with the Firebase Auth SDK.
// User profile creation in Firestore will be handled by a separate API call after successful signup.
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    return NextResponse.json({ error: 'This endpoint is deprecated. Use Firebase Authentication on the client.' }, { status: 410 });
}
