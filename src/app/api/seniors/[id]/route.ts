import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const senior = await db.senior.findUnique({
      where: { id },
      include: {
        reminders: {
          where: { active: true },
          orderBy: { createdAt: 'desc' },
        },
        callLogs: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!senior) {
      return NextResponse.json(
        { success: false, error: 'Senior not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, senior });
  } catch (error) {
    console.error('Error fetching senior:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch senior profile' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      dateOfBirth,
      city,
      preferredCallTime,
      timezone,
      profileData,
      aiName,
    } = body as {
      name?: string;
      dateOfBirth?: string;
      city?: string;
      preferredCallTime?: string;
      timezone?: string;
      profileData?: string;
      aiName?: string;
    };

    const existing = await db.senior.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Senior not found' },
        { status: 404 }
      );
    }

    const senior = await db.senior.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(dateOfBirth !== undefined && { dateOfBirth }),
        ...(city !== undefined && { city }),
        ...(preferredCallTime !== undefined && { preferredCallTime }),
        ...(timezone !== undefined && { timezone }),
        ...(profileData !== undefined && { profileData }),
        ...(aiName !== undefined && { aiName }),
      },
    });

    return NextResponse.json({ success: true, senior });
  } catch (error) {
    console.error('Error updating senior:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update senior profile' },
      { status: 500 }
    );
  }
}
