import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import OpenAI from 'openai';

async function callQwen(messages: Array<{ role: string; content: string }>) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy",
    baseURL: process.env.OPENAI_BASE_URL,
  });

  try {
    const completion: any = await openai.chat.completions.create({
      model: "z-ai/glm4.7",
      messages: messages as any,
      temperature: 1,
      top_p: 1,
      max_tokens: 16384,
      chat_template_kwargs: { "enable_thinking": true, "clear_thinking": false },
      stream: true
    } as any);

    let fullResponse = "";
    for await (const chunk of completion) {
      // @ts-ignore
      const reasoning = chunk.choices[0]?.delta?.reasoning_content;
      if (reasoning) process.stdout.write(reasoning);
      const content = chunk.choices[0]?.delta?.content || '';
      process.stdout.write(content);
      fullResponse += content;
    }

    return fullResponse || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
}

function buildSystemPrompt(
  senior: {
    name: string;
    city?: string | null;
    profileData?: string | null;
    aiName?: string;
  },
  memories: Array<{ summary: string }>,
  reminders: Array<{ type: string; description: string }>,
  engagementPrompt?: string
): string {
  const profileData = senior.profileData ? JSON.parse(senior.profileData) : {};
  const aiName = senior.aiName || "Clara";

  let prompt = `You are ${aiName}, a warm and patient companion calling ${senior.name} for their daily chat.\n\n`;
  prompt += `About ${senior.name}:\n`;
  if (senior.city) prompt += `- Lives in: ${senior.city}\n`;
  if (profileData.family) prompt += `- Family: ${profileData.family}\n`;
  if (profileData.career) prompt += `- Career: ${profileData.career}\n`;
  if (profileData.hobbies) prompt += `- Loves to talk about: ${profileData.hobbies}\n`;
  if (profileData.favoriteMusicEra) prompt += `- Favorite music era: ${profileData.favoriteMusicEra}\n`;
  if (profileData.topicsToAvoid) prompt += `- Avoid: ${profileData.topicsToAvoid}\n`;
  if (profileData.hometown) prompt += `- Hometown: ${profileData.hometown}\n`;

  if (memories.length > 0) {
    prompt += `\nRecent memory:\n`;
    memories.forEach((m, i) => {
      prompt += `${i + 1}. ${m.summary}\n`;
    });
  }

  if (reminders.length > 0) {
    prompt += `\nToday's reminders to deliver:\n`;
    reminders.forEach((r) => {
      prompt += `- ${r.type}: ${r.description}\n`;
    });
  }

  if (engagementPrompt) {
    prompt += `\nSuggested topic for today: ${engagementPrompt}\n`;
  }

  prompt += `\nGuidelines:\n`;
  prompt += `- Speak slowly and clearly\n`;
  prompt += `- Use simple, warm language with natural filler phrases like "That's wonderful" and "Tell me more"\n`;
  prompt += `- Never mention that you are an AI unless directly asked\n`;
  prompt += `- Ask follow-up questions and show genuine interest\n`;
  prompt += `- If the senior seems distressed, gently ask if they would like to call a family member\n`;
  prompt += `- Deliver reminders naturally during the conversation\n`;
  prompt += `- Keep responses concise (2-3 sentences typically) to allow for natural turn-taking\n`;
  prompt += `- Answer ANY questions the user asks, just like any general AI assistant or chatbot. Do NOT restrict yourself to only the suggested topic or profile data.\n`;
  prompt += `- Do not use markdown formatting in your responses - speak naturally as in a real phone conversation\n`;

  return prompt;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seniorId, message, callLogId } = body as {
      seniorId: string;
      message: string;
      callLogId?: string;
    };

    if (!seniorId || !message) {
      return NextResponse.json(
        { success: false, error: 'seniorId and message are required' },
        { status: 400 }
      );
    }

    // 1. Get senior profile
    const senior = await db.senior.findUnique({ where: { id: seniorId } });
    if (!senior) {
      return NextResponse.json(
        { success: false, error: 'Senior not found' },
        { status: 404 }
      );
    }

    // 2. Get recent memories (last 3 ConversationSummaries)
    const memories = await db.conversationSummary.findMany({
      where: { seniorId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    // 3. Get due reminders
    const now = new Date().toISOString();
    const reminders = await db.reminder.findMany({
      where: {
        seniorId,
        active: true,
        OR: [
          { nextDue: { lte: now } },
          { nextDue: null },
        ],
      },
    });

    // 4. Get a random engagement prompt not yet used by this senior
    const usedPromptIds = await db.promptUsage.findMany({
      where: { seniorId },
      select: { promptId: true },
    });
    const usedIds = usedPromptIds.map((p) => p.promptId);

    let engagementPrompt: string | undefined;
    const availablePrompts = await db.promptLibrary.findMany({
      where: {
        active: true,
        ...(usedIds.length > 0 && {
          id: { notIn: usedIds },
        }),
      },
    });

    if (availablePrompts.length > 0) {
      const randomIndex = Math.floor(Math.random() * availablePrompts.length);
      engagementPrompt = availablePrompts[randomIndex].content;

      // Record prompt usage
      await db.promptUsage.create({
        data: {
          seniorId,
          promptId: availablePrompts[randomIndex].id,
        },
      });
    }

    // 5. Build system prompt
    const systemPrompt = buildSystemPrompt(senior, memories, reminders, engagementPrompt);

    // 6. Call Qwen via NVIDIA API
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ];

    const aiResponse = await callQwen(messages);

    // 7. Return response
    return NextResponse.json({ success: true, response: aiResponse });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
