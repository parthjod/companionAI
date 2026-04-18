import { db } from "@/lib/db";

/**
 * Get the last N conversation summaries for a senior.
 * Returns parsed summary objects (from JSON).
 */
export async function getRecentMemories(
  seniorId: string,
  limit: number = 3
): Promise<any[]> {
  const summaries = await db.conversationSummary.findMany({
    where: { seniorId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return summaries.map((s) => {
    let parsed: any;
    try {
      parsed = JSON.parse(s.summary);
    } catch {
      parsed = { raw: s.summary };
    }
    return {
      ...s,
      parsedSummary: parsed,
    };
  });
}

/**
 * Store a conversation summary for a senior.
 * summaryData will be serialized to JSON.
 */
export async function storeSummary(
  seniorId: string,
  callLogId: string,
  summaryData: any
): Promise<void> {
  const summaryStr =
    typeof summaryData === "string"
      ? summaryData
      : JSON.stringify(summaryData);

  await db.conversationSummary.create({
    data: {
      seniorId,
      callLogId,
      summary: summaryStr,
    },
  });
}

/**
 * Get active reminders for a senior.
 */
export async function getDueReminders(seniorId: string): Promise<any[]> {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

  const reminders = await db.reminder.findMany({
    where: {
      seniorId,
      active: true,
      OR: [
        // Daily reminders are always due
        { frequency: "daily" },
        // Weekly reminders — due today (simplified check)
        { frequency: "weekly", nextDue: todayStr },
        // One-time reminders that are due
        { frequency: "once", nextDue: { lte: todayStr } },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  return reminders;
}
