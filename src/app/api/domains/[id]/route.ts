import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config'; // Use admin config for server-side operations

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Domain name is required' }, { status: 400 });
    }

    const domainDocRef = db.collection('domains').doc(id);
    await domainDocRef.update({ name });

    const updatedDoc = await domainDocRef.get();

    return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update domain' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        await db.collection('domains').doc(id).delete();
        return NextResponse.json({ message: 'Domain deleted successfully' }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete domain' }, { status: 500 });
    }
}
