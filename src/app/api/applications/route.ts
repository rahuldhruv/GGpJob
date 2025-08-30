import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Application } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_name);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const query = userId ? { userId: userId } : {};

    const applications = await db
      .collection<Application>('applications')
      .find(query)
      .toArray();
      
    return NextResponse.json(applications || []);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
