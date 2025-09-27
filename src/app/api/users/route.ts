
import { NextResponse } from 'next/server';
import { collection, getDocs, doc, setDoc, query, where, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { User, Role } from '@/lib/types';


// GET all users OR a specific user by UID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (uid) {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
        } else {
            // If user exists in Auth but not in Firestore, create a default profile.
            // This can happen if profile creation failed during signup.
            // We'll create a basic "Job Seeker" profile.
            console.warn(`User with UID ${uid} not found in Firestore. Creating default profile.`);
            const defaultProfile: Omit<User, 'id'> = {
                firstName: 'New',
                lastName: 'User',
                name: 'New User',
                email: 'user@example.com', // This should be updated by the client
                phone: '0000000000',
                role: 'Job Seeker' as Role,
                headline: '',
            };
            
            await setDoc(doc(db, "users", uid), defaultProfile);
            
            return NextResponse.json({ id: uid, ...defaultProfile });
        }
    }

    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const users = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(users);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST a new user (create profile after signup)
export async function POST(request: Request) {
  try {
    const userData: User = await request.json();
    const { id, ...profileData } = userData;

    if (!id) {
        return NextResponse.json({ error: 'Firebase UID (id) is required' }, { status: 400 });
    }

    await setDoc(doc(db, "users", id), profileData);

    return NextResponse.json({ id, ...profileData }, { status: 201 });
  } catch (e: any) {
    console.error("Error adding document: ", e);
    return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
  }
}
