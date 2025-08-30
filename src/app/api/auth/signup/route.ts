import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { User } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phone, role, password } = await request.json();

    if (!firstName || !lastName || !email || !phone || !role || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();

    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const newUser: User = {
      id: uuidv4(),
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      phone,
      role,
      password, // In a real app, hash this password!
    };
    
    await db.run(
      'INSERT INTO users (id, firstName, lastName, name, email, phone, role, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      newUser.id,
      newUser.firstName,
      newUser.lastName,
      newUser.name,
      newUser.email,
      newUser.phone,
      newUser.role,
      newUser.password
    );
    
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
