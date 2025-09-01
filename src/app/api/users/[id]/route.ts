import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { User } from '@/lib/types';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { firstName, lastName, email, phone, headline } = await request.json();
        
        if (!firstName || !lastName || !email || !phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = await getDb();
        
        const result = await db.run(
            'UPDATE users SET firstName = ?, lastName = ?, name = ?, email = ?, phone = ?, headline = ? WHERE id = ?',
            firstName,
            lastName,
            `${firstName} ${lastName}`,
            email,
            phone,
            headline,
            id
        );

        if (result.changes === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updatedUser: Omit<User, 'password' | 'role'> = await db.get('SELECT id, firstName, lastName, name, email, phone, role, headline FROM users WHERE id = ?', id);

        return NextResponse.json(updatedUser, { status: 200 });

    } catch (e: any) {
        if (e.message.includes('UNIQUE constraint failed')) {
            if (e.message.includes('users.email')) {
                return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
            }
            if (e.message.includes('users.phone')) {
                return NextResponse.json({ error: 'User with this phone number already exists' }, { status: 409 });
            }
        }
        console.error(e);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}


export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const db = await getDb();
        
        const result = await db.run('DELETE FROM users WHERE id = ?', id);
        
        if (result.changes === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
