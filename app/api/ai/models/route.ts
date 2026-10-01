import { NextResponse } from 'next/server';
import { checkOllamaStatus } from '@/lib/ollama';

export async function GET() {
  try {
    const status = await checkOllamaStatus();
    return NextResponse.json({ success: true, ...status });
  } catch (error) {
    console.error('Failed to get Ollama status:', error);
    return NextResponse.json({ success: false, isOnline: false, models: [] });
  }
}
