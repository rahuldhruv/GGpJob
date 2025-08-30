import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const { searchParams } = new URL(request.url);

    const query: any = {};
    const limit = searchParams.get('limit');
    const isReferral = searchParams.get('isReferral');
    const recruiterId = searchParams.get('recruiterId');
    const employeeId = searchParams.get('employeeId');

    if (isReferral !== null) {
      query.isReferral = isReferral === 'true';
    }
    if (recruiterId) {
      query.recruiterId = recruiterId;
    }
    if (employeeId) {
      query.employeeId = employeeId;
    }
    
    let jobsQuery = db.collection('jobs').find(query).sort({ postedAt: -1 });

    if (limit) {
      jobsQuery = jobsQuery.limit(parseInt(limit, 10));
    }

    const jobs = await jobsQuery.toArray();

    return NextResponse.json(jobs);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const jobData = await request.json();

    const newJob = {
      id: uuidv4(),
      ...jobData,
    };

    const result = await db.collection('jobs').insertOne(newJob);

    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
