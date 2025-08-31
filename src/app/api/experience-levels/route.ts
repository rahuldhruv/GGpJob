import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const experienceLevels = await db.all('SELECT * FROM experience_levels ORDER BY id');
    return NextResponse.json(experienceLevels);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch experience levels' }, { status: 500 });
  }
}
