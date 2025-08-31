import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const jobTypes = await db.all('SELECT * FROM job_types ORDER BY id');
    return NextResponse.json(jobTypes);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch job types' }, { status: 500 });
  }
}
