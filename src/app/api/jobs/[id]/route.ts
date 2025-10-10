
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import type { Job } from '@/lib/types';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const jobDocRef = db.collection('jobs').doc(id);
    const jobDoc = await jobDocRef.get();

    if (!jobDoc.exists) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const jobData = jobDoc.data() as Job;

    // Firestore doesn't support joins. We fetch related data manually.
    // This is not super efficient, and in a production app, this data might be denormalized.
    const [type, workplaceType, experienceLevel, domain, location] = await Promise.all([
        jobData.jobTypeId ? db.collection('job_types').doc(String(jobData.jobTypeId)).get() : Promise.resolve(null),
        jobData.workplaceTypeId ? db.collection('workplace_types').doc(String(jobData.workplaceTypeId)).get() : Promise.resolve(null),
        jobData.experienceLevelId ? db.collection('experience_levels').doc(String(jobData.experienceLevelId)).get() : Promise.resolve(null),
        jobData.domainId ? db.collection('domains').doc(String(jobData.domainId)).get() : Promise.resolve(null),
        jobData.locationId ? db.collection('locations').doc(String(jobData.locationId)).get() : Promise.resolve(null),
    ]);

    const job: Job = {
        id: jobDoc.id,
        ...jobData,
        type: type?.data()?.name || '',
        workplaceType: workplaceType?.data()?.name || '',
        experienceLevel: experienceLevel?.data()?.name || '',
        domain: domain?.data()?.name || '',
        location: location?.data()?.name || '',
    };

    return NextResponse.json(job);
  } catch (e: any) {
    console.error('[API_JOB_ID_GET] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch job', details: e.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const updatedJobData = await request.json();
        const jobDocRef = db.collection('jobs').doc(id);

        // Ensure we don't try to overwrite the id
        delete updatedJobData.id;

        await jobDocRef.update(updatedJobData);

        const updatedDoc = await jobDocRef.get();
        const updatedJob = { id: updatedDoc.id, ...updatedDoc.data() };
        
        return NextResponse.json(updatedJob, { status: 200 });

    } catch (e: any) {
        console.error('[API_JOB_ID_PUT] Error:', e);
        return NextResponse.json({ error: 'Failed to update job', details: e.message }, { status: 500 });
    }
}


export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        
        // Before deleting the job, we might need to delete related applications.
        // For simplicity now, we just delete the job. A production app would handle this more robustly.
        const applicationsSnapshot = await db.collection('applications').where('jobId', '==', id).get();
        const batch = db.batch();
        applicationsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        await db.collection('jobs').doc(id).delete();

        return NextResponse.json({ message: 'Job and related applications deleted successfully' }, { status: 200 });
    } catch (e: any) {
        console.error('[API_JOB_ID_DELETE] Error:', e);
        return NextResponse.json({ error: 'Failed to delete job', details: e.message }, { status: 500 });
    }
}
