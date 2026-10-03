import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = getSettings();
    return NextResponse.json({ 
      success: true, 
      settings,
      hasEnvGeminiKey: !!process.env.GEMINI_API_KEY,
      hasEnvGrokKey: !!process.env.GROK_API_KEY
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = saveSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Settings save error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
}
