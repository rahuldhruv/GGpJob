
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import { User } from '@/lib/types';


export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const userDocRef = db.collection('users').doc(id);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        const user = { id: userDoc.id, ...userDoc.data() } as User;

        // Fetch location if locationId exists
        if (user.locationId) {
            try {
                const locationsSnap = await db.collection('locations').where('id', '==', parseInt(user.locationId)).limit(1).get();
                if (!locationsSnap.empty) {
                    const locationDoc = locationsSnap.docs[0].data();
                    user.location = `${locationDoc.name}, ${locationDoc.country}`;
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
        
        const userDocRef = db.collection('users').doc(id);
        
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

        await userDocRef.update(dataToUpdate);

        const updatedUserDoc = await userDocRef.get();
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
        await db.collection('users').doc(id).delete();
        // Note: This does NOT delete the Firebase Auth user. That requires the Admin SDK.
        return NextResponse.json({ message: 'User profile deleted successfully' }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
