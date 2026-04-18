import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    let seniors;
    if (accountId) {
      seniors = await db.senior.findMany({
        where: { familyAccounts: { some: { id: accountId } } },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      seniors = await db.senior.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }
    return NextResponse.json({ success: true, seniors });
  } catch (error) {
    console.error('Error listing seniors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seniors' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      dateOfBirth,
      city,
      preferredCallTime,
      timezone,
      profileData,
      aiName,
      accountId,
    } = body as {
      name: string;
      dateOfBirth?: string;
      city?: string;
      preferredCallTime?: string;
      timezone?: string;
      profileData?: string;
      aiName?: string;
      accountId?: string;
    };

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const senior = await db.senior.create({
      data: {
        name,
        dateOfBirth: dateOfBirth || null,
        city: city || null,
        preferredCallTime: preferredCallTime || '09:00',
        timezone: timezone || 'America/New_York',
        profileData: profileData || null,
        aiName: aiName || 'Clara',
      },
    });

    if (accountId) {
      await db.familyAccount.update({
        where: { id: accountId },
        data: { seniorId: senior.id },
      });
    }

    return NextResponse.json({ success: true, senior }, { status: 201 });
  } catch (error) {
    console.error('Error creating senior:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create senior profile' },
      { status: 500 }
    );
  }
}
