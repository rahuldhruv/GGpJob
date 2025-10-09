
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';

export async function GET() {
  try {
    const typesCol = db.collection('job_types');
    const q = typesCol.orderBy('id');
    const typeSnapshot = await q.get();
    const jobTypes = typeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(jobTypes);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch job types', details: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    // Get the highest current ID to auto-increment
    const snapshot = await db.collection('job_types').orderBy('id', 'desc').limit(1).get();
    let newId = 1;
    if (!snapshot.empty) {
      newId = snapshot.docs[0].data().id + 1;
    }
    
    const docRef = await db.collection("job_types").add({ id: newId, name });
    
    return NextResponse.json({ id: docRef.id, name, newId }, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create job type', details: e.message }, { status: 500 });
  }
}
