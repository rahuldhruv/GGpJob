
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const snapshot = await db.collection('workplace_types').where('id', '==', parseInt(id)).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Workplace type not found' }, { status: 404 });
    }
    
    const docRef = snapshot.docs[0].ref;
    await docRef.update({ name });

    const updatedDoc = await docRef.get();

    return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() }, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update workplace type', details: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const snapshot = await db.collection('workplace_types').where('id', '==', parseInt(id)).limit(1).get();

        if (snapshot.empty) {
          return NextResponse.json({ error: 'Workplace type not found' }, { status: 404 });
        }
        
        const docRef = snapshot.docs[0].ref;
        await docRef.delete();
        
        return NextResponse.json({ message: 'Workplace type deleted successfully' }, { status: 200 });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete workplace type', details: e.message }, { status: 500 });
    }
}
