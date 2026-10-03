import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = getSettings();
    const hasKey = !!(process.env.GEMINI_API_KEY || settings.geminiApiKey);
    return NextResponse.json({
      success: true,
      isOnline: hasKey,
      provider: 'gemini',
      model: 'gemini-2.5-flash'
    });
  } catch (error) {
    console.error('Failed to get AI status:', error);
    return NextResponse.json({ success: false, isOnline: false });
  }
}
