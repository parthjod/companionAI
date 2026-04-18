import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const senior = await db.senior.findUnique({ where: { id } });
    if (!senior) {
      return NextResponse.json(
        { success: false, error: 'Senior not found' },
        { status: 404 }
      );
    }

    const reminders = await db.reminder.findMany({
      where: { seniorId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, reminders });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const senior = await db.senior.findUnique({ where: { id } });
    if (!senior) {
      return NextResponse.json(
        { success: false, error: 'Senior not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { type, description, frequency, nextDue } = body as {
      type: string;
      description: string;
      frequency?: string;
      nextDue?: string;
    };

    if (!type || !description) {
      return NextResponse.json(
        { success: false, error: 'Type and description are required' },
        { status: 400 }
      );
    }

    const reminder = await db.reminder.create({
      data: {
        seniorId: id,
        type,
        description,
        frequency: frequency || 'daily',
        nextDue: nextDue || null,
      },
    });

    return NextResponse.json({ success: true, reminder }, { status: 201 });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}
