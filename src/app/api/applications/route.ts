import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    let applications;
    if (userId) {
      applications = await db.all('SELECT * FROM applications WHERE userId = ? ORDER BY appliedAt DESC', userId);
    } else {
      applications = await db.all('SELECT * FROM applications ORDER BY appliedAt DESC');
    }
      
    return NextResponse.json(applications);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
