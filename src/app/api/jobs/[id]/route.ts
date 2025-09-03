import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Job } from '@/lib/types';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const db = await getDb();
    
    const job = await db.get('SELECT * FROM jobs WHERE id = ?', id);
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const updatedJobData = await request.json();
        const db = await getDb();
        
        const stmt = await db.prepare(
            'UPDATE jobs SET title = ?, companyName = ?, locationId = ?, description = ?, vacancies = ?, contactEmail = ?, contactPhone = ?, salary = ?, jobTypeId = ?, workplaceTypeId = ?, experienceLevelId = ?, domainId = ?, employeeLinkedIn = ? WHERE id = ?'
        );

        await stmt.run(
            updatedJobData.title,
            updatedJobData.companyName,
            updatedJobData.locationId,
            updatedJobData.description,
            updatedJobData.vacancies,
            updatedJobData.contactEmail,
            updatedJobData.contactPhone,
            updatedJobData.salary,
            updatedJobData.jobTypeId,
            updatedJobData.workplaceTypeId,
            updatedJobData.experienceLevelId,
            updatedJobData.domainId,
            updatedJobData.employeeLinkedIn,
            id
        );
        await stmt.finalize();

        const updatedJob = await db.get('SELECT * FROM jobs WHERE id = ?', id);
        
        return NextResponse.json(updatedJob, { status: 200 });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
    }
}


export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const db = await getDb();
        
        const result = await db.run('DELETE FROM jobs WHERE id = ?', id);
        
        if (result.changes === 0) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Job deleted successfully' }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
    }
}

    