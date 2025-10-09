
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';

type Section = 'education' | 'projects' | 'employment' | 'languages' | 'skills';
const subcollectionMap: Record<Section, string> = {
    education: 'education',
    projects: 'projects',
    employment: 'employment',
    languages: 'languages',
    skills: 'skills'
};

const getSubcollectionName = (section: string | null): string | null => {
    if (section && Object.keys(subcollectionMap).includes(section)) {
        return subcollectionMap[section as Section];
    }
    return null;
}

// GET handler
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id: userId } = params;
        const { searchParams } = new URL(request.url);
        const section = searchParams.get('section');
        
        if (section) {
             const subcollectionName = getSubcollectionName(section);
             if (!subcollectionName) {
                return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
            }
            const sectionSnapshot = await db.collection('users').doc(userId).collection(subcollectionName).get();
            const data = sectionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Add sorting if needed, e.g. for skills/languages
            if (subcollectionName === 'skills' || subcollectionName === 'languages') {
                const key = subcollectionName === 'skills' ? 'name' : 'language';
                data.sort((a, b) => a[key].localeCompare(b[key]));
            }

            return NextResponse.json(data);
        }
        
        // If no section, fetch all profile data
        const [educationSnap, projectsSnap, employmentSnap, languagesSnap, skillsSnap] = await Promise.all([
            db.collection('users').doc(userId).collection('education').get(),
            db.collection('users').doc(userId).collection('projects').get(),
            db.collection('users').doc(userId).collection('employment').get(),
            db.collection('users').doc(userId).collection('languages').get(),
            db.collection('users').doc(userId).collection('skills').get()
        ]);

        const education = educationSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const projects = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const employment = employmentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const languages = languagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => a.language.localeCompare(b.language));
        const skills = skillsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => a.name.localeCompare(b.name));

        return NextResponse.json({ education, projects, employment, languages, skills });
    } catch (e: any) {
        console.error("Profile GET Error:", e);
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

        const subcollectionName = getSubcollectionName(section);
        if (!subcollectionName) {
            return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
        }

        const userRef = db.collection('users').doc(userId);
        const subcollectionRef = userRef.collection(subcollectionName);
        
        const docRef = await subcollectionRef.add(body);
        const newItem = { id: docRef.id, ...body };

        return NextResponse.json(newItem, { status: 201 });
    } catch (e: any) {
        console.error("Profile POST Error:", e);
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

        const subcollectionName = getSubcollectionName(section);
        if (!subcollectionName) {
            return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
        }
        
        if (!id) {
            return NextResponse.json({ error: 'Item ID is required for update' }, { status: 400 });
        }
        
        const itemRef = db.collection('users').doc(userId).collection(subcollectionName).doc(id);
        
        // Verify document exists before updating
        const docSnap = await itemRef.get();
        if (!docSnap.exists) {
            return NextResponse.json({ error: 'Item not found or user unauthorized' }, { status: 404 });
        }
        
        await itemRef.update(dataToUpdate);
        
        const updatedItem = { id, ...dataToUpdate };

        return NextResponse.json(updatedItem, { status: 200 });
    } catch (e: any) {
        console.error("Profile PUT Error:", e);
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

        const subcollectionName = getSubcollectionName(section);
        if (!subcollectionName) {
            return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
        }

        if (!id) {
            return NextResponse.json({ error: 'Item ID is required for deletion' }, { status: 400 });
        }
        
        const itemRef = db.collection('users').doc(userId).collection(subcollectionName).doc(id);

        // Verify document exists before deleting
        const docSnap = await itemRef.get();
        if (!docSnap.exists) {
            return NextResponse.json({ error: 'Item not found or user unauthorized' }, { status: 404 });
        }
        
        await itemRef.delete();

        return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
    } catch (e: any) {
        console.error("Profile DELETE Error:", e);
        return NextResponse.json({ error: `Failed to delete item from ${section}` }, { status: 500 });
    }
}
