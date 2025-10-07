
import { NextResponse } from 'next/server';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
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
            return NextResponse.json({ error: 'User profile not found in database.' }, { status: 404 });
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
    const { id, firstName, lastName, email, role } = body;

    if (!id || !firstName || !lastName || !email || !role) {
        return NextResponse.json({ error: 'Missing required fields for profile creation' }, { status: 400 });
    }
    
    const dataToSave: Omit<User, 'id'> = {
        firstName: firstName,
        lastName: lastName,
        name: `${firstName} ${lastName}`,
        email: email,
        role: role,
        // Initialize other optional fields to ensure document structure is consistent
        phone: '',
        headline: '',
        resumeUrl: '',
        domainId: null,
        locationId: null,
    };

    await setDoc(doc(db, "users", id), dataToSave);

    return NextResponse.json({ id, ...dataToSave }, { status: 201 });
  } catch (e: any) {
    console.error("Error adding document: ", e);
    return NextResponse.json({ error: 'Failed to create user profile in Firestore' }, { status: 500 });
  }
}
