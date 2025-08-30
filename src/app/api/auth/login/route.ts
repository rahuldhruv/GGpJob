import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ? AND role = ?', email, role);

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // In a real app, you'd return a JWT or session cookie here.
    // For this demo, we'll return the user object.
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({ user: userWithoutPassword }, { status: 200 });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
