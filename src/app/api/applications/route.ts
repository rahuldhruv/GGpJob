import { NextResponse } from 'next/server';
import { applications } from '@/lib/data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let filteredApplications = userId ? applications.filter(app => app.userId === userId) : [...applications];
    
    return NextResponse.json(filteredApplications);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
