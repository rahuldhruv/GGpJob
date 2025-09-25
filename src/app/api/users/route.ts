
import { NextResponse } from 'next/server';
import { collection, getDocs, doc, setDoc, query, where, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { User } from '@/lib/types';


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
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
