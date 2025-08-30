import { NextResponse } from 'next/server';
import { jobs } from '@/lib/data';
import { Job } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const limit = searchParams.get('limit');
    const isReferral = searchParams.get('isReferral');
    const recruiterId = searchParams.get('recruiterId');
    const employeeId = searchParams.get('employeeId');

    let filteredJobs = jobs;

    if (isReferral !== null) {
      filteredJobs = filteredJobs.filter(job => String(job.isReferral) === isReferral);
    }
    if (recruiterId) {
      filteredJobs = filteredJobs.filter(job => job.recruiterId === recruiterId);
    }
    if (employeeId) {
      filteredJobs = filteredJobs.filter(job => job.employeeId === employeeId);
    }

    filteredJobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

    if (limit) {
      filteredJobs = filteredJobs.slice(0, parseInt(limit, 10));
    }
    
    return NextResponse.json(filteredJobs);
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

    jobs.unshift(newJob);

    return NextResponse.json(newJob, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
