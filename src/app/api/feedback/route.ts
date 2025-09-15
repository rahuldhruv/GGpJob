
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const db = await getDb();
        const feedback = await db.all(`
            SELECT pf.*, u.name as userName, u.email as userEmail
            FROM portal_feedback pf
            JOIN users u ON pf.userId = u.id
            ORDER BY pf.submittedAt DESC
        `);
        return NextResponse.json(feedback);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch portal feedback' }, { status: 500 });
    }
}


export async function POST(request: Request) {
  try {
    const { userId, rating, feedback } = await request.json();

    if (!userId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    
    const result = await db.run(
      'INSERT INTO portal_feedback (userId, rating, feedback, submittedAt) VALUES (?, ?, ?, ?)',
      userId,
      rating,
      feedback,
      new Date().toISOString()
    );
    
    const newFeedback = {
      id: result.lastID,
      userId,
      rating,
      feedback,
    };
    
    return NextResponse.json(newFeedback, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
