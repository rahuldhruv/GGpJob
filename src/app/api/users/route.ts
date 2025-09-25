
import { NextResponse } from 'next/server';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

// GET all users
export async function GET() {
  try {
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
    const userData = await request.json();
    const { uid, ...profileData } = userData;

    if (!uid) {
        return NextResponse.json({ error: 'Firebase UID is required' }, { status: 400 });
    }

    // In Firestore, we often use the user's UID as the document ID
    // but for this migration, we'll let Firestore auto-generate an ID
    // and store the UID in a field to keep it simple. A better approach
    // would be to set the doc ID to the UID.
    const docRef = await addDoc(collection(db, "users"), {
        ...profileData,
        id: uid, // Storing UID in the document
    });

    return NextResponse.json({ id: docRef.id, ...profileData }, { status: 201 });
  } catch (e: any) {
    console.error("Error adding document: ", e);
    return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
  }
}
