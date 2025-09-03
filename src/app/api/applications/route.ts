import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    let applications;
    const baseQuery = `
        SELECT 
            a.*,
            s.name as statusName
        FROM applications a
        LEFT JOIN application_statuses s ON a.statusId = s.id
    `;

    if (userId) {
      applications = await db.all(`${baseQuery} WHERE a.userId = ? ORDER BY a.appliedAt DESC`, Number(userId));
    } else {
      applications = await db.all(`${baseQuery} ORDER BY a.appliedAt DESC`);
    }
      
    return NextResponse.json(applications);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
