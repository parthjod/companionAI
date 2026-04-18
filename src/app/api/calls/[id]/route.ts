import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.callLog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Call log not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, answeredAt, endedAt, durationSeconds } = body as {
      status?: string;
      answeredAt?: string;
      endedAt?: string;
      durationSeconds?: number;
    };

    const callLog = await db.callLog.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(answeredAt !== undefined && { answeredAt: new Date(answeredAt) }),
        ...(endedAt !== undefined && { endedAt: new Date(endedAt) }),
        ...(durationSeconds !== undefined && { durationSeconds }),
      },
    });

    // When status changes to "completed", trigger summary generation
    if (status === 'completed' && existing.status !== 'completed') {
      try {
        // Check if summary already exists
        const existingSummary = await db.conversationSummary.findUnique({
          where: { callLogId: id },
        });

        if (!existingSummary) {
          // Create a placeholder summary that can be updated later
          await db.conversationSummary.create({
            data: {
              seniorId: callLog.seniorId,
              callLogId: id,
              summary: JSON.stringify({
                status: 'pending_generation',
                callLogId: id,
                seniorId: callLog.seniorId,
              }),
            },
          });
        }
      } catch (summaryError) {
        console.error('Error creating summary placeholder:', summaryError);
        // Don't fail the call update if summary creation fails
      }
    }

    return NextResponse.json({ success: true, callLog });
  } catch (error) {
    console.error('Error updating call log:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update call log' },
      { status: 500 }
    );
  }
}
