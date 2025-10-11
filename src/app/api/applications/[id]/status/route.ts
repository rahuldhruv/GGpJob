
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';

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
    
    const currentApp = docSnap.data();

    // If status is being viewed for the first time, update it to 'Profile Viewed'
    // Assuming statusId 1 is 'Applied' and we want to move it to 2 'Profile Viewed'
    if (currentApp?.statusId === 1 && statusId !== 1) { 
         await applicationRef.update({ statusId: 2 }); // Mark as 'Profile Viewed'
         // Then, if a final status is being set (e.g. Selected/Not Suitable), update it again.
         if (statusId !== 2) {
            await applicationRef.update({ statusId });
         }
    } else {
        await applicationRef.update({ statusId });
    }

    // Fetch the updated application along with the status name
    const updatedDoc = await applicationRef.get();
    const updatedData = updatedDoc.data();

    let statusName = 'N/A';
    if (updatedData?.statusId) {
        // This assumes you have an 'application_statuses' collection where docs have a numeric `id` field
        const statusQuery = await db.collection('application_statuses').where('id', '==', updatedData.statusId).limit(1).get();
        if (!statusQuery.empty) {
            statusName = statusQuery.docs[0].data().name;
        }
    }

    return NextResponse.json({ ...updatedData, id: updatedDoc.id, statusName }, { status: 200 });
  } catch (e: any) {
    console.error('[API_APP_STATUS] Error:', e);
    return NextResponse.json({ error: 'Failed to update application status', details: e.message }, { status: 500 });
  }
}
