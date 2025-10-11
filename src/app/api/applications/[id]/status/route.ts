
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';

const statusMap: { [key: number]: string } = {
    1: 'Applied',
    2: 'Profile Viewed',
    3: 'Not Suitable',
    4: 'Selected',
};

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { statusId } = await request.json();

    if (!statusId) {
      return NextResponse.json({ error: 'Status ID is required' }, { status: 400 });
    }

    const applicationRef = db.collection('applications').doc(id);

    // Check if the application exists
    const docSnap = await applicationRef.get();
    if (!docSnap.exists) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    await applicationRef.update({ statusId });

    // Fetch the updated application along with the status name
    const updatedDoc = await applicationRef.get();
    const updatedData = updatedDoc.data();
    
    // Use the map to get the status name
    const statusName = statusMap[statusId] || 'N/A';

    return NextResponse.json({ ...updatedData, id: updatedDoc.id, statusName }, { status: 200 });
  } catch (e: any) {
    console.error('[API_APP_STATUS] Error:', e);
    return NextResponse.json({ error: 'Failed to update application status', details: e.message }, { status: 500 });
  }
}
