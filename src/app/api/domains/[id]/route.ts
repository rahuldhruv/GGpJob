import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Domain name is required' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.run('UPDATE domains SET name = ? WHERE id = ?', name, Number(id));

    if (result.changes === 0) {
        return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }
    
    const updatedDomain = await db.get('SELECT * FROM domains WHERE id = ?', Number(id));

    return NextResponse.json(updatedDomain, { status: 200 });
  } catch (e) {
     if (e.message.includes('UNIQUE constraint failed')) {
        return NextResponse.json({ error: 'Domain name already exists' }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Failed to update domain' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const db = await getDb();
        
        const result = await db.run('DELETE FROM domains WHERE id = ?', Number(id));
        
        if (result.changes === 0) {
            return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Domain deleted successfully' }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete domain' }, { status: 500 });
    }
}
