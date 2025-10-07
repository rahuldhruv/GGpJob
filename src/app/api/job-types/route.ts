import { NextResponse } from 'next/server';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';

export async function GET() {
  try {
    const typesCol = collection(db, 'job_types');
    const q = query(typesCol, orderBy('id'));
    const typeSnapshot = await getDocs(q);
    const jobTypes = typeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(jobTypes);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch job types' }, { status: 500 });
  }
}
