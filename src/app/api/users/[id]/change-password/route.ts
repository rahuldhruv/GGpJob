// This endpoint is no longer needed with Firebase Authentication. 
// Password changes will be handled by the Firebase Auth SDK on the client.
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    return NextResponse.json({ error: 'This endpoint is deprecated. Use Firebase Authentication on the client.' }, { status: 410 });
}
