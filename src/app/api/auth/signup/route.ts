
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { User } from '@/lib/types';
import bcrypt from 'bcrypt';

const saltRounds = 10;

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phone, role, password } = await request.json();

    if (!firstName || !lastName || !email || !phone || !role || !password) {
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
      '' // Provide a default empty headline
    );
    
    const newUser: Partial<User> = {
      id: result.lastID,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      phone,
      role,
      headline: '',
    };

    return NextResponse.json(newUser, { status: 201 });
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
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
