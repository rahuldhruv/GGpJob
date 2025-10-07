import { NextResponse } from 'next/server';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';

export async function GET() {
  try {
    const locationsCol = collection(db, 'locations');
    const q = query(locationsCol, orderBy('name'));
    const locationSnapshot = await getDocs(q);
    const locations = locationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(locations);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}
