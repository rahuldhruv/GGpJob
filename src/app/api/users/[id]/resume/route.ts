
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { User } from '@/lib/types';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { resumeUrl } = await request.json();
        
        const db = await getDb();
        
        const result = await db.run(
            'UPDATE users SET resumeUrl = ? WHERE id = ?',
            resumeUrl,
            id
        );

        if (result.changes === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updatedUser: Partial<User> = await db.get('SELECT resumeUrl FROM users WHERE id = ?', id);

        return NextResponse.json(updatedUser, { status: 200 });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to update resume' }, { status: 500 });
    }
}
