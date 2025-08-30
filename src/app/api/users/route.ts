import { NextResponse } from 'next/server';
import { users } from '@/lib/data';

export async function GET() {
  try {
    return NextResponse.json(users);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
