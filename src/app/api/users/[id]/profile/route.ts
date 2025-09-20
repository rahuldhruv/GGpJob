
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

type Section = 'education' | 'projects' | 'employment' | 'languages' | 'skills';
const tableMap: Record<Section, string> = {
    education: 'user_education',
    projects: 'user_projects',
    employment: 'user_employment',
    languages: 'user_languages',
    skills: 'user_skills'
};

const getTableName = (section: string | null): string | null => {
    if (section && Object.keys(tableMap).includes(section)) {
        return tableMap[section as Section];
    }
    return null;
}

// GET handler
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const section = searchParams.get('section');
        
        const db = await getDb();
        
        if (section) {
             const tableName = getTableName(section);
             if (!tableName) {
                return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
            }
            const data = await db.all(`SELECT * FROM ${tableName} WHERE userId = ? ORDER BY id DESC`, id);
            return NextResponse.json(data);
        }
        
        // If no section, fetch all profile data
        const [education, projects, employment, languages, skills] = await Promise.all([
            db.all('SELECT * FROM user_education WHERE userId = ? ORDER BY id DESC', id),
            db.all('SELECT * FROM user_projects WHERE userId = ? ORDER BY id DESC', id),
            db.all('SELECT * FROM user_employment WHERE userId = ? ORDER BY id DESC', id),
            db.all('SELECT * FROM user_languages WHERE userId = ? ORDER BY language', id),
            db.all('SELECT * FROM user_skills WHERE userId = ? ORDER BY name', id)
        ]);

        return NextResponse.json({ education, projects, employment, languages, skills });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch profile data' }, { status: 500 });
    }
}

// POST handler
export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id: userId } = params;
        const { searchParams } = new URL(request.url);
        const section = searchParams.get('section');
        const body = await request.json();

        const tableName = getTableName(section);
        if (!tableName) {
            return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
        }

        const db = await getDb();
        const columns = Object.keys(body).join(', ');
        const placeholders = Object.keys(body).map(() => '?').join(', ');
        const values = Object.values(body);
        
        const result = await db.run(
            `INSERT INTO ${tableName} (userId, ${columns}) VALUES (?, ${placeholders})`,
            userId, ...values
        );
        
        const newItem = await db.get(`SELECT * FROM ${tableName} WHERE id = ?`, result.lastID);

        return NextResponse.json(newItem, { status: 201 });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: `Failed to create item in ${section}` }, { status: 500 });
    }
}


// PUT handler
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id: userId } = params;
        const { searchParams } = new URL(request.url);
        const section = searchParams.get('section');
        const body = await request.json();
        const { id, ...dataToUpdate } = body;

        const tableName = getTableName(section);
        if (!tableName) {
            return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
        }

        const db = await getDb();
        const setClause = Object.keys(dataToUpdate).map(key => `${key} = ?`).join(', ');
        const values = Object.values(dataToUpdate);

        const result = await db.run(
            `UPDATE ${tableName} SET ${setClause} WHERE id = ? AND userId = ?`,
            ...values, id, userId
        );
        
        if (result.changes === 0) {
            return NextResponse.json({ error: 'Item not found or user unauthorized' }, { status: 404 });
        }
        
        const updatedItem = await db.get(`SELECT * FROM ${tableName} WHERE id = ?`, id);

        return NextResponse.json(updatedItem, { status: 200 });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: `Failed to update item in ${section}` }, { status: 500 });
    }
}


// DELETE handler
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id: userId } = params;
        const { searchParams } = new URL(request.url);
        const section = searchParams.get('section');
        const { id } = await request.json();

        const tableName = getTableName(section);
        if (!tableName) {
            return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
        }

        const db = await getDb();
        const result = await db.run(
            `DELETE FROM ${tableName} WHERE id = ? AND userId = ?`,
            id, userId
        );

        if (result.changes === 0) {
            return NextResponse.json({ error: 'Item not found or user unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: `Failed to delete item from ${section}` }, { status: 500 });
    }
}
