
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
            return NextResponse.json({ error: 'User not found in Firestore' }, { status: 404 });
        }
    }

    // This part of the function gets all users and is typically for admin purposes.
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
    const body = await request.json();
    const { id, ...profileData } = body;

    if (!id) {
        return NextResponse.json({ error: 'Firebase UID (id) is required' }, { status: 400 });
    }
    
    const dataToSave: Omit<User, 'id'> = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        name: `${profileData.firstName} ${profileData.lastName}`,
        email: profileData.email,
        phone: profileData.phone,
        role: profileData.role,
        headline: profileData.headline || '',
        // Initialize other optional fields if needed
        resumeUrl: '',
        domainId: null,
        locationId: null,
    };

    await setDoc(doc(db, "users", id), dataToSave);

    return NextResponse.json({ id, ...dataToSave }, { status: 201 });
  } catch (e: any) {
    console.error("Error adding document: ", e);
    return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
  }
}
