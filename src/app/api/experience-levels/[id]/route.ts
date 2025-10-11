
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const levelsRef = db.collection('experience_levels');
    const snapshot = await levelsRef.where('id', '==', parseInt(id)).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Experience level not found' }, { status: 404 });
    }

    const docRef = snapshot.docs[0].ref;
    await docRef.update({ name });

    const updatedDoc = await docRef.get();

    return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() }, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update experience level', details: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const levelsRef = db.collection('experience_levels');
        const snapshot = await levelsRef.where('id', '==', parseInt(id)).limit(1).get();

        if (snapshot.empty) {
          return NextResponse.json({ error: 'Experience level not found' }, { status: 404 });
        }

        const docRef = snapshot.docs[0].ref;
        await docRef.delete();
        
        return NextResponse.json({ message: 'Experience level deleted successfully' }, { status: 200 });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete experience level', details: e.message }, { status: 500 });
    }
}
