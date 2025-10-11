
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import type { User } from '@/lib/types';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { resumeUrl } = await request.json();
        
        if (!resumeUrl) {
            return NextResponse.json({ error: 'Resume URL is required' }, { status: 400 });
        }

        const userRef = db.collection('users').doc(id);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        await userRef.update({ resumeUrl });

        const updatedUser = { resumeUrl };

        return NextResponse.json(updatedUser, { status: 200 });

    } catch (e: any) {
        console.error('[API_RESUME_PUT] Error:', e);
        return NextResponse.json({ error: 'Failed to update resume', details: e.message }, { status: 500 });
    }
}
