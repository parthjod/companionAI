import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.reminder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Reminder not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { type, description, frequency, nextDue, active } = body as {
      type?: string;
      description?: string;
      frequency?: string;
      nextDue?: string;
      active?: boolean;
    };

    const reminder = await db.reminder.update({
      where: { id },
      data: {
        ...(type !== undefined && { type }),
        ...(description !== undefined && { description }),
        ...(frequency !== undefined && { frequency }),
        ...(nextDue !== undefined && { nextDue }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json({ success: true, reminder });
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update reminder' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.reminder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Reminder not found' },
        { status: 404 }
      );
    }

    await db.reminder.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Reminder deleted' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
}
