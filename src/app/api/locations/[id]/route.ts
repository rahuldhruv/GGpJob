

import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { name, country } = await request.json();
    if (!name || !country) {
      return NextResponse.json({ error: 'Name and country are required' }, { status: 400 });
    }

    const locationsRef = db.collection('locations');
    const snapshot = await locationsRef.where('id', '==', parseInt(id)).limit(1).get();

    if (snapshot.empty) {
        return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    const docRef = snapshot.docs[0].ref;
    await docRef.update({ name, country });

    const updatedDoc = await docRef.get();

    return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() }, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update location', details: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        
        const locationsRef = db.collection('locations');
        const snapshot = await locationsRef.where('id', '==', parseInt(id)).limit(1).get();

        if (snapshot.empty) {
            return NextResponse.json({ error: 'Location not found' }, { status: 404 });
        }
        
        const docRef = snapshot.docs[0].ref;
        await docRef.delete();

        return NextResponse.json({ message: 'Location deleted successfully' }, { status: 200 });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete location', details: e.message }, { status: 500 });
    }
}
