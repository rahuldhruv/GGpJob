import { NextResponse } from 'next/server';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Domain name is required' }, { status: 400 });
    }

    const domainDocRef = doc(db, 'domains', id);
    await updateDoc(domainDocRef, { name });

    const updatedDoc = await getDoc(domainDocRef);

    return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update domain' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        await deleteDoc(doc(db, 'domains', id));
        return NextResponse.json({ message: 'Domain deleted successfully' }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete domain' }, { status: 500 });
    }
}
