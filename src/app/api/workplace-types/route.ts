import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const workplaceTypes = await db.all('SELECT * FROM workplace_types ORDER BY id');
    return NextResponse.json(workplaceTypes);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch workplace types' }, { status: 500 });
  }
}
