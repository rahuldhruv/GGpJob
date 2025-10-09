
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import type { User } from '@/lib/types';

// GET all users OR a specific user by UID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (uid) {
        const userDoc = await db.collection('users').doc(uid).get();

        if (userDoc.exists) {
            return NextResponse.json({ id: userDoc.id, ...userDoc.data() });
        } else {
             return NextResponse.json({ error: 'User profile not found in database.' }, { status: 404 });
        }
    }

    // This part of the function gets all users and is typically for admin purposes.
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(users);
  } catch (e: any) {
    console.error("[API_USERS_GET] Error:", e.message);
    return NextResponse.json({ error: 'Failed to fetch users', details: e.message }, { status: 500 });
  }
}

// POST a new user (create profile after signup)
export async function POST(request: Request) {
  try {
    const { id, firstName, lastName, email, role } = await request.json();

    if (!id || !firstName || !lastName || !email || !role) {
        return NextResponse.json({ error: 'Missing required fields for profile creation' }, { status: 400 });
    }
    
    const dataToSave: Omit<User, 'id'> = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        role,
        phone: '',
        headline: '',
        resumeUrl: '',
        domainId: null,
        locationId: null,
    };
    
    await db.collection("users").doc(id).set(dataToSave);
    
    return NextResponse.json({ id, ...dataToSave }, { status: 201 });
  } catch (e: any) {
    console.error("[API_USERS_POST] Error:", e);
    return NextResponse.json({ error: 'Failed to create user profile in Firestore', details: e.message }, { status: 500 });
  }
}
