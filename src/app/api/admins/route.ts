// This endpoint is no longer needed as admin creation will be handled differently with Firebase Auth (e.g., via the Firebase Console or a protected admin SDK function).
// For simplicity in this migration, we are removing it.
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    return NextResponse.json({ error: 'This endpoint is deprecated after Firebase migration.' }, { status: 410 });
}
