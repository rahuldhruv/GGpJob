import { NextResponse } from 'next/server';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';

export async function GET() {
  try {
    const levelsCol = collection(db, 'experience_levels');
    const q = query(levelsCol, orderBy('id'));
    const levelSnapshot = await getDocs(q);
    const experienceLevels = levelSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(experienceLevels);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch experience levels' }, { status: 500 });
  }
}
