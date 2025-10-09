
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import { serverTimestamp } from 'firebase/firestore';

export async function GET(request: Request) {
    try {
        const feedbackSnapshot = await db.collection('portal_feedback').orderBy('submittedAt', 'desc').get();
        
        // Note: Firestore doesn't perform SQL-like JOINs.
        // We'll fetch users separately or denormalize data if needed.
        // For now, we fetch feedback and user details separately for simplicity.
        const feedbackList = await Promise.all(feedbackSnapshot.docs.map(async (doc) => {
            const feedbackData = doc.data();
            let userName = 'Anonymous';
            let userEmail = '';

            if (feedbackData.userId) {
                try {
                    const userDoc = await db.collection('users').doc(feedbackData.userId).get();
                    if (userDoc.exists) {
                        userName = userDoc.data()?.name || 'Anonymous';
                        userEmail = userDoc.data()?.email || '';
                    }
                } catch (userError) {
                    console.error(`Failed to fetch user ${feedbackData.userId}`, userError);
                }
            }

            return {
                id: doc.id,
                ...feedbackData,
                userName,
                userEmail,
                // Ensure submittedAt is a string
                submittedAt: feedbackData.submittedAt?.toDate ? feedbackData.submittedAt.toDate().toISOString() : new Date().toISOString(),
            };
        }));
        
        return NextResponse.json(feedbackList);
    } catch (e: any) {
        console.error('[API_FEEDBACK_GET] Error:', e);
        return NextResponse.json({ error: 'Failed to fetch portal feedback', details: e.message }, { status: 500 });
    }
}


export async function POST(request: Request) {
  try {
    const { userId, rating, feedback } = await request.json();

    if (!userId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newFeedback = {
      userId,
      rating,
      feedback: feedback || '',
      submittedAt: serverTimestamp(),
    };
    
    const docRef = await db.collection('portal_feedback').add(newFeedback);
    
    return NextResponse.json({ id: docRef.id, ...newFeedback }, { status: 201 });
  } catch (e: any) {
    console.error('[API_FEEDBACK_POST] Error:', e);
    return NextResponse.json({ error: 'Failed to submit feedback', details: e.message }, { status: 500 });
  }
}
