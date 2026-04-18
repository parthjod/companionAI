import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const decade = searchParams.get('decade') || undefined;
    const seniorId = searchParams.get('seniorId') || undefined;

    // Build the where clause
    const where: Prisma.PromptLibraryWhereInput = { active: true };

    if (type) {
      where.type = type;
    }
    if (decade) {
      where.decade = decade;
    }

    // If seniorId provided, exclude prompts already in PromptUsage for that senior
    if (seniorId) {
      const usedPromptIds = await db.promptUsage.findMany({
        where: { seniorId },
        select: { promptId: true },
      });
      const usedIds = usedPromptIds.map((p) => p.promptId);

      if (usedIds.length > 0) {
        where.id = { notIn: usedIds };
      }
    }

    const prompts = await db.promptLibrary.findMany({
      where,
      orderBy: { type: 'asc' },
    });

    return NextResponse.json({ success: true, prompts });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}
