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
    const domain = searchParams.get('domain');

    let query = `
      SELECT 
        j.*,
        jt.name as type,
        wt.name as workplaceType,
        el.name as experienceLevel,
        d.name as domain
      FROM jobs j
      LEFT JOIN job_types jt ON j.jobTypeId = jt.id
      LEFT JOIN workplace_types wt ON j.workplaceTypeId = wt.id
      LEFT JOIN experience_levels el ON j.experienceLevelId = el.id
      LEFT JOIN domains d ON j.domainId = d.id
    `;
    const conditions = [];
    const params: (string | number | boolean)[] = [];

    if (isReferral !== null) {
      conditions.push('j.isReferral = ?');
      params.push(isReferral === 'true' ? 1 : 0);
    }
    if (recruiterId) {
      conditions.push('j.recruiterId = ?');
      params.push(Number(recruiterId));
    }
    if (employeeId) {
      conditions.push('j.employeeId = ?');
      params.push(Number(employeeId));
    }
    if (search) {
      const searchCondition = '(j.title LIKE ? OR j.companyName LIKE ? OR j.description LIKE ?)';
      conditions.push(searchCondition);
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    if (posted) {
        const days = parseInt(posted, 10);
        if (!isNaN(days)) {
            const date = new Date();
            date.setDate(date.getDate() - days);
            conditions.push('j.postedAt >= ?');
            params.push(date.toISOString());
        }
    }
    if (location && location !== 'all') {
        conditions.push('j.location = ?');
        params.push(location);
    }
    if (experience && experience !== 'all') {
        conditions.push('el.name = ?');
        params.push(experience);
    }
    if (domain && domain !== 'all') {
        conditions.push('d.name = ?');
        params.push(domain);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY j.postedAt DESC';

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
      'INSERT INTO jobs (id, title, companyName, location, description, vacancies, contactEmail, contactPhone, salary, isReferral, employeeId, postedAt, jobTypeId, workplaceTypeId, experienceLevelId, domainId, employeeLinkedIn) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
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
        newJob.jobTypeId,
        newJob.workplaceTypeId,
        newJob.experienceLevelId,
        newJob.domainId,
        newJob.employeeLinkedIn
    );
    await stmt.finalize();

    return NextResponse.json(newJob, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
