import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { User } from '@/lib/types';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    
    // Find user by email only
    const user: User | undefined = await db.get('SELECT * FROM users WHERE email = ?', email);
    
    if (!user || !user.password) {
      // Use a generic error message for security
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
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
