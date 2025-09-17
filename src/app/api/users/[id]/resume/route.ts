
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { User } from '@/lib/types';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { resume } = await request.json();
        
        if (!resume) {
            return NextResponse.json({ error: 'Resume file path is required' }, { status: 400 });
        }

        const db = await getDb();
        
        const result = await db.run(
            'UPDATE users SET resume = ? WHERE id = ?',
            resume,
            id
        );

        if (result.changes === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updatedUser: Partial<User> = await db.get('SELECT resume FROM users WHERE id = ?', id);

        return NextResponse.json(updatedUser, { status: 200 });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to update resume' }, { status: 500 });
    }
}
