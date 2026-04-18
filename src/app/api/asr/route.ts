import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { audioBase64 } = body as {
      audioBase64: string;
    };

    if (!audioBase64) {
      return NextResponse.json(
        { success: false, error: 'audioBase64 is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();
    const response = await zai.audio.asr.create({ file_base64: audioBase64 });

    return NextResponse.json({ success: true, text: response.text });
  } catch (error) {
    console.error('ASR error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
