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

    const callLogs = await db.callLog.findMany({
      where: { seniorId: id },
      include: {
        conversationSummary: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, callLogs });
  } catch (error) {
    console.error('Error fetching call logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch call logs' },
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
    const { status } = body as { status?: string };

    const callLog = await db.callLog.create({
      data: {
        seniorId: id,
        scheduledAt: new Date(),
        status: status || 'scheduled',
      },
    });

    return NextResponse.json({ success: true, callLog }, { status: 201 });
  } catch (error) {
    console.error('Error creating call log:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create call log' },
      { status: 500 }
    );
  }
}
