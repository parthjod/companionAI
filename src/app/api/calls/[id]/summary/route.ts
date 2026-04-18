import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const callLog = await db.callLog.findUnique({ where: { id } });
    if (!callLog) {
      return NextResponse.json(
        { success: false, error: 'Call log not found' },
        { status: 404 }
      );
    }

    const summary = await db.conversationSummary.findUnique({
      where: { callLogId: id },
    });

    if (!summary) {
      return NextResponse.json(
        { success: false, error: 'Summary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversation summary' },
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

    const callLog = await db.callLog.findUnique({ where: { id } });
    if (!callLog) {
      return NextResponse.json(
        { success: false, error: 'Call log not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { summary } = body as { summary: string };

    if (!summary) {
      return NextResponse.json(
        { success: false, error: 'Summary content is required' },
        { status: 400 }
      );
    }

    // Upsert the conversation summary
    const conversationSummary = await db.conversationSummary.upsert({
      where: { callLogId: id },
      update: { summary },
      create: {
        seniorId: callLog.seniorId,
        callLogId: id,
        summary,
      },
    });

    return NextResponse.json({ success: true, summary: conversationSummary });
  } catch (error) {
    console.error('Error creating/updating summary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save conversation summary' },
      { status: 500 }
    );
  }
}
