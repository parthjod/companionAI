import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_API_KEY = "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";

async function callQwen(messages: Array<{ role: string; content: string }>) {
  const response = await fetch(NVIDIA_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      model: "qwen/qwen3.5-397b-a17b",
      messages,
      max_tokens: 16384,
      temperature: 0.6,
      top_p: 0.95,
      top_k: 20,
      presence_penalty: 0,
      repetition_penalty: 1,
      stream: false,
      chat_template_kwargs: { enable_thinking: false },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seniorId, callLogId, messages } = body as {
      seniorId: string;
      callLogId: string;
      messages: Array<{ role: string; content: string }>;
    };

    if (!seniorId || !callLogId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'seniorId, callLogId, and messages array are required' },
        { status: 400 }
      );
    }

    // Verify call log exists
    const callLog = await db.callLog.findUnique({ where: { id: callLogId } });
    if (!callLog) {
      return NextResponse.json(
        { success: false, error: 'Call log not found' },
        { status: 404 }
      );
    }

    // Build a conversation transcript for summarization
    const transcript = messages
      .map((m) => `${m.role === 'user' ? 'Senior' : 'Companion'}: ${m.content}`)
      .join('\n');

    // Use Qwen to generate a summary
    const summaryMessages = [
      {
        role: 'system',
        content: `You are a helpful assistant that summarizes conversations between a senior and their AI companion. 
Create a JSON summary with these fields:
- mood: The senior's apparent mood (happy, sad, confused, anxious, content, etc.)
- topics: Array of main topics discussed
- facts: Array of important facts or personal details mentioned by the senior
- follow_ups: Array of things to follow up on in future conversations
- highlights: A brief 2-3 sentence narrative summary of the conversation

Return ONLY valid JSON, no markdown formatting.`,
      },
      {
        role: 'user',
        content: `Please summarize this conversation:\n\n${transcript}`,
      },
    ];

    const summaryResponse = await callQwen(summaryMessages);

    // Parse and store the summary
    let summaryJson: string;
    try {
      // Try to parse to validate it's proper JSON
      JSON.parse(summaryResponse);
      summaryJson = summaryResponse;
    } catch {
      // If the response isn't valid JSON, wrap it
      summaryJson = JSON.stringify({
        highlights: summaryResponse,
        mood: 'unknown',
        topics: [],
        facts: [],
        follow_ups: [],
      });
    }

    // Store the summary in ConversationSummary table
    await db.conversationSummary.upsert({
      where: { callLogId },
      update: { summary: summaryJson },
      create: {
        seniorId,
        callLogId,
        summary: summaryJson,
      },
    });

    // Update the callLog status to "completed"
    await db.callLog.update({
      where: { id: callLogId },
      data: {
        status: 'completed',
        endedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, summary: summaryJson });
  } catch (error) {
    console.error('Chat end error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to end chat session' },
      { status: 500 }
    );
  }
}
