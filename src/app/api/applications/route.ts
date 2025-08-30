import { NextResponse } from 'next/server';
import { applications } from '@/lib/data';
import type { Application } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    let userApplications = applications;
    if (userId) {
      userApplications = applications.filter(app => app.userId === userId);
    }
      
    return NextResponse.json(userApplications);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
