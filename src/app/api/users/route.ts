
import { NextResponse } from 'next/server';
import { collection, getDocs, doc, setDoc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/firebase/admin-config'; // Use the admin config
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
  } catch (e: any) {
    console.error("Error in GET /api/users: ", e.message);
    return NextResponse.json({ error: 'Failed to fetch users', details: e.message }, { status: 500 });
  }
}

// POST a new user (create profile after signup)
export async function POST(request: Request) {
  try {
    const { id, firstName, lastName, email, role } = await request.json();

    if (!id || !firstName || !lastName || !email || !role) {
        console.error("Missing required fields for profile creation");
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
    
    await setDoc(doc(db, "users", id), dataToSave);
    
    return NextResponse.json({ id, ...dataToSave }, { status: 201 });
  } catch (e: any) {
    console.error("Error in POST /api/users: ", e.message);
    return NextResponse.json({ error: 'Failed to create user profile in Firestore', details: e.message }, { status: 500 });
  }
}
