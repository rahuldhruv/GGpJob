import { NextResponse } from 'next/server';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export async function GET() {
  try {
    const domainsCol = collection(db, 'domains');
    const domainSnapshot = await getDocs(domainsCol);
    const domains = domainSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort alphabetically by name
    domains.sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json(domains);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Domain name is required' }, { status: 400 });
    }
    
    // Note: Firestore doesn't enforce uniqueness on its own like SQL UNIQUE.
    // A more robust solution might involve a separate lookup document or Cloud Functions.
    // For now, we'll proceed assuming duplicates are handled by the client or are acceptable.
    
    const docRef = await addDoc(collection(db, "domains"), { name });
    
    return NextResponse.json({ id: docRef.id, name }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create domain' }, { status: 500 });
  }
}
