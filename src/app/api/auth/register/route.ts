import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phoneNumber } = body as {
      email: string;
      password: string;
      name?: string;
      phoneNumber?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if account already exists
    const existing = await db.familyAccount.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const account = await db.familyAccount.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        phoneNumber: phoneNumber || null,
      },
    });

    return NextResponse.json(
      { success: true, accountId: account.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register account' },
      { status: 500 }
    );
  }
}
