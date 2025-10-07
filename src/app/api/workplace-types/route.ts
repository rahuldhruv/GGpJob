import { NextResponse } from 'next/server';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';

export async function GET() {
  try {
    const typesCol = collection(db, 'workplace_types');
    const q = query(typesCol, orderBy('id'));
    const typeSnapshot = await getDocs(q);
    const workplaceTypes = typeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(workplaceTypes);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch workplace types' }, { status: 500 });
  }
}
