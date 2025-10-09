
import { NextResponse } from 'next/server';
import { db, auth } from '@/firebase/admin-config';
import { User } from '@/lib/types';

export async function POST(request: Request) {
    try {
        const { firstName, lastName, email, phone, password } = await request.json();

        if (!firstName || !lastName || !email || !phone || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        // 1. Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`,
        });

        // 2. Set custom claim for Admin role
        await auth.setCustomUserClaims(userRecord.uid, { role: 'Admin' });

        // 3. Create user profile in Firestore
        const userProfile: Omit<User, 'id'> = {
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            email,
            phone,
            role: 'Admin',
            headline: 'Administrator',
        };

        await db.collection('users').doc(userRecord.uid).set(userProfile);

        return NextResponse.json({ uid: userRecord.uid, ...userProfile }, { status: 201 });

    } catch (error: any) {
        console.error('Admin Creation Error:', error);
        let errorMessage = 'Failed to create admin user.';
        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'An account with this email address already exists.';
        } else if (error.code === 'auth/invalid-password') {
            errorMessage = error.message;
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
