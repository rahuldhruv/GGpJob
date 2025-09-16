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
    const locations = searchParams.getAll('location');
    const experience = searchParams.get('experience');
    const domains = searchParams.getAll('domain');
    const jobTypes = searchParams.getAll('jobType');

    let query = `
      SELECT 
        j.*,
        jt.name as type,
        wt.name as workplaceType,
        el.name as experienceLevel,
        d.name as domain,
        l.name as location,
        (SELECT COUNT(*) FROM applications WHERE applications.jobId = j.id) as applicantCount
      FROM jobs j
      LEFT JOIN job_types jt ON j.jobTypeId = jt.id
      LEFT JOIN workplace_types wt ON j.workplaceTypeId = wt.id
      LEFT JOIN experience_levels el ON j.experienceLevelId = el.id
      LEFT JOIN domains d ON j.domainId = d.id
      LEFT JOIN locations l ON j.locationId = l.id
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
    if (locations.length > 0 && !locations.includes('all')) {
        conditions.push(`l.id IN (${locations.map(() => '?').join(',')})`);
        params.push(...locations);
    }
    if (experience && experience !== 'all') {
        conditions.push('el.name = ?');
        params.push(experience);
    }
    if (domains.length > 0 && !domains.includes('all')) {
        conditions.push(`d.id IN (${domains.map(() => '?').join(',')})`);
        params.push(...domains);
    }
    if (jobTypes.length > 0 && !jobTypes.includes('all')) {
        conditions.push(`j.jobTypeId IN (${jobTypes.map(() => '?').join(',')})`);
        params.push(...jobTypes);
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
      'INSERT INTO jobs (id, title, companyName, locationId, description, vacancies, contactEmail, contactPhone, salary, isReferral, employeeId, recruiterId, postedAt, jobTypeId, workplaceTypeId, experienceLevelId, domainId, employeeLinkedIn, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    await stmt.run(
        newJob.id,
        newJob.title,
        newJob.companyName,
        newJob.locationId,
        newJob.description,
        newJob.vacancies,
        newJob.contactEmail,
        newJob.contactPhone,
        newJob.salary,
        newJob.isReferral ? 1 : 0,
        newJob.employeeId,
        newJob.recruiterId,
        newJob.postedAt,
        newJob.jobTypeId,
        newJob.workplaceTypeId,
        newJob.experienceLevelId,
        newJob.domainId,
        newJob.employeeLinkedIn,
        newJob.role
    );
    await stmt.finalize();

    return NextResponse.json(newJob, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
