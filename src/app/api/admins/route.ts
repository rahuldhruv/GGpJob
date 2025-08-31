import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { User } from '@/lib/types';
import bcrypt from 'bcrypt';

const saltRounds = 10;

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phone, password } = await request.json();
    const role = 'Admin';

    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await db.run(
      'INSERT INTO users (firstName, lastName, name, email, phone, role, password, headline) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      firstName,
      lastName,
      `${firstName} ${lastName}`,
      email,
      phone,
      role,
      hashedPassword,
      'Platform Administrator'
    );
    
    const newAdmin: Partial<User> = {
      id: result.lastID,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      phone,
      role,
      headline: 'Platform Administrator',
    };

    return NextResponse.json(newAdmin, { status: 201 });
  } catch (e: any) {
    if (e.message.includes('UNIQUE constraint failed')) {
      if (e.message.includes('users.email')) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
      }
      if (e.message.includes('users.phone')) {
        return NextResponse.json({ error: 'User with this phone number already exists' }, { status: 409 });
      }
    }
    console.error(e);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}
