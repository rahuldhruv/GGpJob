import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const locations = await db.all('SELECT * FROM locations ORDER BY name');
    return NextResponse.json(locations);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

    