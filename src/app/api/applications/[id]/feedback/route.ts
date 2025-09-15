
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { rating, feedback } = await request.json();

    if (!rating) {
      return NextResponse.json({ error: 'Rating is required' }, { status: 400 });
    }

    const db = await getDb();
    
    const result = await db.run(
      'UPDATE applications SET rating = ?, feedback = ? WHERE id = ?',
      rating,
      feedback,
      id
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    const updatedApplication = await db.get('SELECT * FROM applications WHERE id = ?', id);

    return NextResponse.json(updatedApplication, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
