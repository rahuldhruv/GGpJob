
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

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
            u.headline as applicantHeadline,
            u.id as applicantId
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

export async function POST(request: Request) {
    try {
        const { jobId, userId } = await request.json();
        
        if (!jobId || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = await getDb();

        const job = await db.get('SELECT title, companyName FROM jobs WHERE id = ?', jobId);
        if (!job) {
             return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        const existingApplication = await db.get('SELECT id FROM applications WHERE jobId = ? AND userId = ?', jobId, userId);
        if (existingApplication) {
            return NextResponse.json({ error: 'You have already applied for this job' }, { status: 409 });
        }

        const newApplication = {
            id: uuidv4(),
            jobId,
            jobTitle: job.title,
            companyName: job.companyName,
            userId,
            statusId: 1, // 'Applied'
            appliedAt: new Date().toISOString(),
        };

        const result = await db.run(
            'INSERT INTO applications (id, jobId, jobTitle, companyName, userId, statusId, appliedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            newApplication.id,
            newApplication.jobId,
            newApplication.jobTitle,
            newApplication.companyName,
            newApplication.userId,
            newApplication.statusId,
            newApplication.appliedAt
        );

        return NextResponse.json(newApplication, { status: 201 });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }
}
