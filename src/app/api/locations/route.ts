

import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import { serverTimestamp } from 'firebase/firestore';

export async function GET() {
  try {
    const locationsCol = db.collection('locations');
    const q = locationsCol.orderBy('id');
    const locationSnapshot = await q.get();
    const locations = locationSnapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
    return NextResponse.json(locations);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, country } = await request.json();
    if (!name || !country) {
      return NextResponse.json({ error: 'Name and country are required' }, { status: 400 });
    }

    const snapshot = await db.collection('locations').orderBy('id', 'desc').limit(1).get();
    let newId = 1;
    if (!snapshot.empty) {
        newId = (snapshot.docs[0].data().id || 0) + 1;
    }

    const docRef = db.collection("locations").doc();
    await docRef.set({ id: newId, name, country });
    
    return NextResponse.json({ id: newId, docId: docRef.id, name, country }, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create location', details: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }
        
        const locationsRef = db.collection('locations');
        const snapshot = await locationsRef.where('id', '==', id).limit(1).get();

        if (snapshot.empty) {
            return NextResponse.json({ error: 'Location not found to delete' }, { status: 404 });
        }
        
        await snapshot.docs[0].ref.delete();

        return NextResponse.json({ message: 'Location deleted successfully' }, { status: 200 });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete location', details: e.message }, { status: 500 });
    }
}
