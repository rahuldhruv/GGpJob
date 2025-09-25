
import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { User } from '@/lib/types';


export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const userDocRef = doc(db, 'users', id);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        const user = { id: userDoc.id, ...userDoc.data() } as User;

        // Fetch location if locationId exists
        if (user.locationId) {
            try {
                const locationDoc = await getDoc(doc(db, 'locations', String(user.locationId)));
                if (locationDoc.exists()) {
                    user.location = locationDoc.data().name;
                }
            } catch(e) {
                console.error("Could not fetch location for user", e);
            }
        }
        
        return NextResponse.json(user);

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}


export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { firstName, lastName, email, phone, headline, locationId, domainId } = await request.json();
        
        if (!firstName || !lastName || !email || !phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        const userDocRef = doc(db, 'users', id);
        
        const dataToUpdate: Partial<User> = {
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            email,
            phone,
            headline: headline || '',
            locationId: locationId || null,
            domainId: domainId || null,
        };

        await updateDoc(userDocRef, dataToUpdate);

        const updatedUserDoc = await getDoc(userDocRef);
        const updatedUser = { id: updatedUserDoc.id, ...updatedUserDoc.data() };


        return NextResponse.json(updatedUser, { status: 200 });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}


export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        await deleteDoc(doc(db, 'users', id));
        // Note: This does NOT delete the Firebase Auth user. That requires the Admin SDK.
        return NextResponse.json({ message: 'User profile deleted successfully' }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
