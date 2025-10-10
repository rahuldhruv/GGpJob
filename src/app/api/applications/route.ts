
import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, addDoc, serverTimestamp, DocumentData } from 'firebase/firestore';
import { db } from '@/firebase/admin-config';
import type { Application, User, Job } from '@/lib/types';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const jobId = searchParams.get('jobId');

    const applicationsRef = db.collection('applications');
    let q: FirebaseFirestore.Query<DocumentData> = applicationsRef;

    if (userId) {
      q = q.where('userId', '==', userId);
    }
    if (jobId) {
      q = q.where('jobId', '==', jobId);
    }

    const querySnapshot = await q.get();

    const applications = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const appData = doc.data() as Application;

        // Fetch user data
        let applicant: User | null = null;
        if (appData.userId) {
          const userDoc = await db.collection('users').doc(appData.userId).get();
          if (userDoc.exists) {
            applicant = { id: userDoc.id, ...userDoc.data() } as User;
          }
        }
        
        // Fetch job data
        let job: Job | null = null;
        if (appData.jobId) {
            const jobDoc = await db.collection('jobs').doc(appData.jobId).get();
            if(jobDoc.exists) {
                job = { id: jobDoc.id, ...jobDoc.data() } as Job;
            }
        }

        // Fetch application status
        let statusName = 'Applied';
        if (appData.statusId) {
            const statusDoc = await db.collection('application_statuses').where('id', '==', appData.statusId).limit(1).get();
            if (!statusDoc.empty) {
                statusName = statusDoc.docs[0].data().name;
            }
        }
        
        const skills = applicant?.headline ?? '';


        return {
          id: doc.id,
          ...appData,
          appliedAt: (appData.appliedAt as any).toDate ? (appData.appliedAt as any).toDate().toISOString() : new Date(appData.appliedAt).toISOString(),
          applicantName: applicant?.name,
          applicantEmail: applicant?.email,
          applicantHeadline: applicant?.headline,
          applicantId: applicant?.id,
          applicantSkills: skills,
          jobTitle: job?.title,
          companyName: job?.companyName,
          statusName,
        };
      })
    );

    return NextResponse.json(applications);

  } catch (e: any) {
    console.error('[API_APPLICATIONS_GET] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch applications', details: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const { jobId, userId } = await request.json();
        
        if (!jobId || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const applicationsRef = db.collection('applications');
        const q = applicationsRef.where('jobId', '==', jobId).where('userId', '==', userId);
        const existingApplication = await q.get();

        if (!existingApplication.empty) {
            return NextResponse.json({ error: 'You have already applied for this job' }, { status: 409 });
        }
        
        const applicationStatuses = await db.collection('application_statuses').where('name', '==', 'Applied').limit(1).get();
        const appliedStatus = applicationStatuses.docs[0];

        const newApplication = {
            jobId,
            userId,
            statusId: appliedStatus ? appliedStatus.data().id : 1, // Default to 1 'Applied'
            appliedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection('applications').add(newApplication);

        return NextResponse.json({ id: docRef.id, ...newApplication }, { status: 201 });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }
}

