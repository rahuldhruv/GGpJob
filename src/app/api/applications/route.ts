import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const jobId = searchParams.get('jobId');
    
    let applications;
    const baseQuery = `
        SELECT 
            a.*,
            s.name as statusName,
            u.name as applicantName,
            u.email as applicantEmail,
            u.headline as applicantHeadline
        FROM applications a
        LEFT JOIN application_statuses s ON a.statusId = s.id
        LEFT JOIN users u ON a.userId = u.id
    `;
    const conditions = [];
    const params: (string | number)[] = [];

    if (userId) {
      conditions.push('a.userId = ?');
      params.push(Number(userId));
    }

    if (jobId) {
        conditions.push('a.jobId = ?');
        params.push(jobId);
    }
    
    let query = baseQuery;
    if(conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY a.appliedAt DESC'

    applications = await db.all(query, ...params);
      
    return NextResponse.json(applications);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
