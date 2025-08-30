import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Job } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { jobs as localJobs } from '@/lib/data';

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const { searchParams } = new URL(request.url);

    const limit = searchParams.get('limit');
    const isReferral = searchParams.get('isReferral');
    const recruiterId = searchParams.get('recruiterId');
    const employeeId = searchParams.get('employeeId');

    const query: any = {};
    if (isReferral !== null) {
      query.isReferral = isReferral === 'true';
    }
    if (recruiterId) {
      query.recruiterId = recruiterId;
    }
    if (employeeId) {
      query.employeeId = employeeId;
    }

    let jobsQuery = db.collection<Job>('jobs').find(query).sort({ postedAt: -1 });

    if (limit) {
      jobsQuery = jobsQuery.limit(parseInt(limit, 10));
    }
    
    const jobs = await jobsQuery.toArray();
    
    return NextResponse.json(jobs || []);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newJobData = await request.json();
    
    const newJob: Job = {
      id: uuidv4(),
      ...newJobData,
    };

    localJobs.unshift(newJob);

    return NextResponse.json(newJob, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
