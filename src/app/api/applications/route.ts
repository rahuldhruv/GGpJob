
import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const jobId = searchParams.get('jobId');

    const applicationsRef = collection(db, 'applications');
    let q = query(applicationsRef);
    
    if (userId) {
        q = query(applicationsRef, where('userId', '==', userId));
    }
    if (jobId) {
        q = query(applicationsRef, where('jobId', '==', jobId));
    }

    // This is less efficient than separate queries but works for combined filters.
    if (userId && jobId) {
        q = query(applicationsRef, where('userId', '==', userId), where('jobId', '==', jobId));
    }

    const querySnapshot = await getDocs(q);
    
    // In a real app, you would fetch related data (user name, job title etc) here if needed,
    // or denormalize it upon application creation.
    // For now, we will return the basic application data.
    const applications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(applications);

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const { jobId, userId } = await request.json();
        
        if (!jobId || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if user has already applied
        const applicationsRef = collection(db, 'applications');
        const q = query(applicationsRef, where('jobId', '==', jobId), where('userId', '==', userId));
        const existingApplication = await getDocs(q);

        if (!existingApplication.empty) {
            return NextResponse.json({ error: 'You have already applied for this job' }, { status: 409 });
        }

        const newApplication = {
            jobId,
            userId,
            statusId: 1, // 'Applied'
            appliedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'applications'), newApplication);

        return NextResponse.json({ id: docRef.id, ...newApplication }, { status: 201 });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }
}
