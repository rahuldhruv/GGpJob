
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { statusId } = await request.json();

    if (!statusId) {
      return NextResponse.json({ error: 'Status ID is required' }, { status: 400 });
    }

    const db = await getDb();
    
    const result = await db.run(
      'UPDATE applications SET statusId = ? WHERE id = ?',
      statusId,
      id
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Optionally, mark profile as viewed if not already done
    if (statusId !== 2) {
        const currentApp = await db.get('SELECT statusId FROM applications WHERE id = ?', id);
        if(currentApp?.statusId === 1) { // If status was 'Applied'
             await db.run('UPDATE applications SET statusId = 2 WHERE id = ?', id);
        }
    }
    
    const updatedApplication = await db.get(`
        SELECT a.*, s.name as statusName 
        FROM applications a 
        JOIN application_statuses s ON a.statusId = s.id 
        WHERE a.id = ?
    `, id);

    return NextResponse.json(updatedApplication, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update application status' }, { status: 500 });
  }
}
