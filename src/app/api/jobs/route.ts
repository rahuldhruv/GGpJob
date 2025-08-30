import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Job } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

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
    // This functionality is temporarily disabled to debug read operations with Atlas SQL.
    return NextResponse.json({ error: 'Job creation is temporarily disabled.' }, { status: 403 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
