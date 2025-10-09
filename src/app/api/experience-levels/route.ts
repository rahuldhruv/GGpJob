
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';

export async function GET() {
  try {
    const levelsCol = db.collection('experience_levels');
    const q = levelsCol.orderBy('id');
    const levelSnapshot = await q.get();
    const experienceLevels = levelSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(experienceLevels);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch experience levels', details: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    const snapshot = await db.collection('experience_levels').orderBy('id', 'desc').limit(1).get();
    let newId = 1;
    if (!snapshot.empty) {
      newId = snapshot.docs[0].data().id + 1;
    }
    
    const docRef = await db.collection("experience_levels").add({ id: newId, name });
    
    return NextResponse.json({ id: docRef.id, name, newId }, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create experience level', details: e.message }, { status: 500 });
  }
}
