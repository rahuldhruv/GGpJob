import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Job } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);

    const limit = searchParams.get('limit');
    const isReferral = searchParams.get('isReferral');
    const recruiterId = searchParams.get('recruiterId');
    const employeeId = searchParams.get('employeeId');
    const search = searchParams.get('search');
    const posted = searchParams.get('posted');
    const location = searchParams.get('location');
    const experience = searchParams.get('experience');

    let query = 'SELECT * FROM jobs';
    const conditions = [];
    const params = [];

    if (isReferral !== null) {
      conditions.push('isReferral = ?');
      params.push(isReferral === 'true' ? 1 : 0);
    }
    if (recruiterId) {
      conditions.push('recruiterId = ?');
      params.push(Number(recruiterId));
    }
    if (employeeId) {
      conditions.push('employeeId = ?');
      params.push(Number(employeeId));
    }
    if (search) {
      const searchCondition = '(title LIKE ? OR companyName LIKE ? OR description LIKE ?)';
      conditions.push(searchCondition);
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    if (posted) {
        const days = parseInt(posted, 10);
        if (!isNaN(days)) {
            const date = new Date();
            date.setDate(date.getDate() - days);
            conditions.push('postedAt >= ?');
            params.push(date.toISOString());
        }
    }
    if (location && location !== 'all') {
        conditions.push('location = ?');
        params.push(location);
    }
    if (experience && experience !== 'all') {
        conditions.push('experienceLevel = ?');
        params.push(experience);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY postedAt DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit, 10));
    }

    const jobs = await db.all(query, ...params);
    
    return NextResponse.json(jobs);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newJobData = await request.json();
    const db = await getDb();

    const newJob: Job = {
      id: uuidv4(),
      ...newJobData,
    };
    
    const stmt = await db.prepare(
      'INSERT INTO jobs (id, title, companyName, location, description, vacancies, contactEmail, contactPhone, salary, isReferral, employeeId, postedAt, type, experienceLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    await stmt.run(
        newJob.id,
        newJob.title,
        newJob.companyName,
        newJob.location,
        newJob.description,
        newJob.vacancies,
        newJob.contactEmail,
        newJob.contactPhone,
        newJob.salary,
        newJob.isReferral ? 1 : 0,
        newJob.employeeId,
        newJob.postedAt,
        newJob.type,
        newJob.experienceLevel
    );
    await stmt.finalize();

    return NextResponse.json(newJob, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
