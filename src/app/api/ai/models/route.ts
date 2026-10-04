import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = getSettings();
    const hasGemini = !!(process.env.GEMINI_API_KEY || settings.geminiApiKey);
    const hasOpenAI = !!(process.env.OPENAI_API_KEY || settings.openaiApiKey);
    const isOnline = hasGemini || hasOpenAI;

    const provider = settings.aiProvider === 'openai' && hasOpenAI ? 'openai' : (hasGemini ? 'gemini' : (hasOpenAI ? 'openai' : 'gemini'));
    const model = provider === 'openai' ? 'gpt-4o-mini' : 'gemini-flash';

    return NextResponse.json({
      success: true,
      isOnline,
      provider,
      model
    });
  } catch (error) {
    console.error('Failed to get AI status:', error);
    return NextResponse.json({ success: false, isOnline: false });
  }
}
