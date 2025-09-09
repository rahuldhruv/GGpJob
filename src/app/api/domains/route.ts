import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const domains = await db.all('SELECT * FROM domains ORDER BY name');
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

    const db = await getDb();
    
    const result = await db.run('INSERT INTO domains (name) VALUES (?)', name);
    
    const newDomain = {
      id: result.lastID,
      name,
    };
    
    return NextResponse.json(newDomain, { status: 201 });
  } catch (e) {
     if (e.message.includes('UNIQUE constraint failed')) {
        return NextResponse.json({ error: 'Domain name already exists' }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Failed to create domain' }, { status: 500 });
  }
}
