const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_API_KEY =
  "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";

const QWEN_MODEL = "qwen/qwen3.5-397b-a17b";

interface ChatMessage {
  role: string;
  content: string;
}

/**
 * Build the full system prompt for the AI companion conversation.
 */
export function buildSystemPrompt(
  senior: {
    name: string;
    city?: string | null;
    aiName?: string;
    profileData?: string | null;
  },
  memories: Array<{ summary: string }>,
  reminders: Array<{ type: string; description: string }>,
  promptContent?: string
): string {
  const aiName = senior.aiName || "Clara";

  // Parse profile data if available
  let profile: Record<string, unknown> = {};
  try {
    if (senior.profileData) {
      profile = JSON.parse(senior.profileData);
    }
  } catch {
    // If parsing fails, leave profile empty
  }

  const parts: string[] = [];

  // ── AI Persona ──────────────────────────────────────────────
  parts.push(
    `You are ${aiName}, a warm, patient, and caring AI companion for seniors. ` +
      `You speak slowly and clearly, using warm, gentle language. ` +
      `You never mention being an AI unless the senior directly asks. ` +
      `You are here to listen, chat, and brighten their day. ` +
      `If the senior seems distressed, confused, or upset, gently suggest they call a family member or loved one.`
  );

  // ── Senior Profile ──────────────────────────────────────────
  parts.push(`\n## Senior's Profile`);
  parts.push(`Name: ${senior.name}`);
  if (senior.city) parts.push(`City: ${senior.city}`);

  const family = profile.family as string | undefined;
  if (family) parts.push(`Family: ${family}`);

  const career = profile.career as string | undefined;
  if (career) parts.push(`Career: ${career}`);

  const interests = profile.interests as string | undefined;
  if (interests) parts.push(`Interests: ${interests}`);

  const topicsToAvoid = profile.topicsToAvoid as string | undefined;
  if (topicsToAvoid) {
    parts.push(
      `\nIMPORTANT — Topics to avoid: ${topicsToAvoid}. Never bring these up.`
    );
  }

  // ── Recent Conversation Summaries ───────────────────────────
  if (memories.length > 0) {
    parts.push(`\n## Recent Conversations (last ${memories.length})`);
    memories.forEach((mem, i) => {
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(mem.summary);
      } catch {
        parsed = { raw: mem.summary };
      }
      parts.push(
        `${i + 1}. Date: ${parsed.date || "unknown"} | Mood: ${parsed.mood || "unknown"} | Topics: ${JSON.stringify(parsed.topics_discussed || [])}`
      );
    });
  }

  // ── Today's Reminders ───────────────────────────────────────
  if (reminders.length > 0) {
    parts.push(`\n## Today's Reminders to Deliver`);
    parts.push(
      `Gently bring these up during the conversation when it feels natural:`
    );
    reminders.forEach((r) => {
      parts.push(`- [${r.type}] ${r.description}`);
    });
  }

  // ── Engagement Prompt ───────────────────────────────────────
  if (promptContent) {
    parts.push(`\n## Suggested Engagement Content`);
    parts.push(
      `Use the following prompt to spark conversation when the moment feels right:`
    );
    parts.push(promptContent);
  }

  // ── Guidelines ──────────────────────────────────────────────
  parts.push(`\n## Guidelines`);
  parts.push(`- Speak slowly and clearly, as if talking to a dear friend.`);
  parts.push(
    `- Use warm, encouraging language. Celebrate their stories and experiences.`
  );
  parts.push(
    `- Never mention being an AI or a machine unless the senior directly asks.`
  );
  parts.push(
    `- If the senior seems distressed or confused, gently suggest calling a family member.`
  );
  parts.push(
    `- Keep responses concise — aim for 2-4 sentences unless telling a story.`
  );
  parts.push(
    `- Ask open-ended questions to encourage the senior to share.`
  );
  parts.push(
    `- Be patient. Pause naturally. Never rush the conversation.`
  );

  return parts.join("\n");
}

/**
 * Call the NVIDIA Qwen API for a chat completion.
 */
export async function chatWithQwen(
  messages: ChatMessage[],
  stream: boolean = false
): Promise<Response> {
  const body = {
    model: QWEN_MODEL,
    messages,
    max_tokens: 16384,
    temperature: 0.6,
    top_p: 0.95,
    top_k: 20,
    stream,
    chat_template_kwargs: { enable_thinking: true },
  };

  const response = await fetch(NVIDIA_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
      Accept: stream ? "text/event-stream" : "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `NVIDIA API error (${response.status}): ${errorText}`
    );
  }

  return response;
}

/**
 * Generate a structured JSON conversation summary using Qwen.
 */
export async function generateSummary(
  messages: ChatMessage[]
): Promise<string> {
  const summaryPrompt: ChatMessage = {
    role: "system",
    content: `You are a helpful assistant that summarizes conversations between an AI companion and a senior citizen.
Given the conversation below, produce a JSON object with exactly these fields:
- "date": today's date in ISO format
- "duration_minutes": estimated duration in minutes (integer)
- "mood": the senior's overall mood (e.g., "happy", "neutral", "sad", "anxious", "energetic")
- "topics_discussed": array of topic strings
- "new_facts_learned": array of new facts learned about the senior
- "reminders_confirmed": array of any reminders the senior acknowledged
- "follow_up_prompts": array of suggested topics or questions for the next conversation

Output ONLY valid JSON. No markdown, no explanation, just the JSON object.`,
  };

  const allMessages = [summaryPrompt, ...messages];

  const response = await chatWithQwen(allMessages, false);
  const data = await response.json();

  const content =
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content returned from Qwen summary generation");
  }

  // Try to extract JSON from the response — Qwen may wrap it in ```json ... ```
  let jsonStr = content;
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // Validate that it's valid JSON
  try {
    JSON.parse(jsonStr);
  } catch {
    // If the raw content is valid JSON, use that; otherwise wrap it
    try {
      JSON.parse(content);
      jsonStr = content;
    } catch {
      // Return as-is and let the caller handle it
      jsonStr = content;
    }
  }

  return jsonStr;
}

/**
 * Get a random engagement prompt (reminiscence or trivia) from the prompt library
 * that matches the senior's era.
 */
export async function getEngagementPrompt(
  senior: { dateOfBirth?: string | null }
): Promise<string | null> {
  // Dynamically import db to avoid circular dependencies at module level
  const { db } = await import("@/lib/db");

  // Determine the decade based on date of birth
  let decade: string | null = null;
  if (senior.dateOfBirth) {
    try {
      const birthYear = new Date(senior.dateOfBirth).getFullYear();
      // Their formative years (age 10-30) — that's when memories are strongest
      const formativeStart = birthYear + 10;
      const formativeDecade = Math.floor(formativeStart / 10) * 10;
      decade = `${formativeDecade}s`;
    } catch {
      // If parsing fails, decade stays null
    }
  }

  // Find matching prompts
  const where = decade
    ? {
        type: { in: ["reminiscence", "trivia"] },
        decade,
        active: true,
      }
    : {
        type: { in: ["reminiscence", "trivia"] },
        active: true,
      };

  const count = await db.promptLibrary.count({ where });

  if (count === 0) {
    // Fallback: try without decade filter
    const fallbackCount = await db.promptLibrary.count({
      where: { type: { in: ["reminiscence", "trivia"] }, active: true },
    });
    if (fallbackCount === 0) return null;

    const skip = Math.floor(Math.random() * fallbackCount);
    const prompt = await db.promptLibrary.findFirst({
      where: { type: { in: ["reminiscence", "trivia"] }, active: true },
      skip,
    });
    return prompt?.content ?? null;
  }

  const skip = Math.floor(Math.random() * count);
  const prompt = await db.promptLibrary.findFirst({ where, skip });
  return prompt?.content ?? null;
}
