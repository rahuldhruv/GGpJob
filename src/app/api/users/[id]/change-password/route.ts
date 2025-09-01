import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { User } from '@/lib/types';
import bcrypt from 'bcrypt';

const saltRounds = 10;

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { oldPassword, newPassword } = await request.json();

        if (!oldPassword || !newPassword) {
            return NextResponse.json({ error: 'Old and new passwords are required' }, { status: 400 });
        }
        
        const db = await getDb();

        const user: User | undefined = await db.get('SELECT * FROM users WHERE id = ?', id);

        if (!user || !user.password) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid old password' }, { status: 401 });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        const result = await db.run(
            'UPDATE users SET password = ? WHERE id = ?',
            hashedNewPassword,
            id
        );
        
        if (result.changes === 0) {
            return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
    }
}
