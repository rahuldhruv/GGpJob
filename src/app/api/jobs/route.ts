
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import type { Job } from '@/lib/types';
import type { firestore as adminFirestore } from 'firebase-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobsRef = db.collection('jobs');
    let query: adminFirestore.Query = jobsRef;

    // String-based filters
    if (searchParams.get('isReferral') !== null) {
      query = query.where('isReferral', '==', searchParams.get('isReferral') === 'true');
    }
    const recruiterId = searchParams.get('recruiterId');
    if (recruiterId) {
      query = query.where('recruiterId', '==', recruiterId);
    }
    const employeeId = searchParams.get('employeeId');
    if (employeeId) {
      query = query.where('employeeId', '==', employeeId);
    }
    // Note: Firestore does not support full-text search on its own.
    // This basic prefix search works for simple cases.
    // A production app would use a dedicated search service like Algolia or Typesense.
    if (searchParams.get('search')) {
        const search = searchParams.get('search') as string;
        query = query.orderBy('title').startAt(search).endAt(search + '\uf8ff');
    }
    if (searchParams.get('experience')) {
        query = query.where('experienceLevel', '==', searchParams.get('experience'));
    }

    // Date filter
    if (searchParams.get('posted')) {
        const days = parseInt(searchParams.get('posted') as string, 10);
        if (!isNaN(days)) {
            const date = new Date();
            date.setDate(date.getDate() - days);
            query = query.where('postedAt', '>=', date.toISOString());
        }
    }

    // Array-based filters ('in' queries) - Firestore is limited to one 'in' query per request.
    // This example will prioritize locations if multiple are present. A real app might need to fetch
    // IDs client-side and do multiple queries, or restructure data.
    const locations = searchParams.getAll('location').filter(l => l && l !== 'all');
    if (locations.length > 0) {
        query = query.where('locationId', 'in', locations);
    }

    const domains = searchParams.getAll('domain').filter(d => d && d !== 'all');
    if (domains.length > 0 && locations.length === 0) { // Only apply if no location filter
        query = query.where('domainId', 'in', domains);
    }

    const jobTypes = searchParams.getAll('jobType').filter(jt => jt && jt !== 'all');
    if (jobTypes.length > 0 && locations.length === 0 && domains.length === 0) { // Only apply if no other 'in' filter
        query = query.where('jobTypeId', 'in', jobTypes);
    }

    // Order and limit - only apply default sort if not filtering by recruiter or employee
    if (!searchParams.get('search') && !recruiterId && !employeeId) {
        if (searchParams.get('posted')) {
             query = query.orderBy('postedAt', 'desc');
        } else {
             query = query.orderBy('postedAt', 'desc');
        }
    }
    
    if (searchParams.get('limit')) {
        query = query.limit(parseInt(searchParams.get('limit') as string, 10));
    }

    const snapshot = await query.get();
    const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(jobs);
  } catch (e: any) {
    console.error('[API_JOBS_GET] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch jobs', details: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newJobData = await request.json();

    const jobToCreate: Partial<Job> = {
        ...newJobData,
        postedAt: newJobData.postedAt || new Date().toISOString(),
    };
    
    const docRef = await db.collection('jobs').add(jobToCreate);
    const newJob = { id: docRef.id, ...jobToCreate };

    return NextResponse.json(newJob, { status: 201 });
  } catch (e: any) {
    console.error('[API_JOBS_POST] Error:', e);
    return NextResponse.json({ error: 'Failed to create job', details: e.message }, { status: 500 });
  }
}
