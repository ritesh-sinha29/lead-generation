import { NextResponse } from 'next/server';
import { generateRelatablePitchWithGemini } from '@/lib/gemini';
import { generateCustomPitchWithOllama } from '@/lib/ollama';
import { updateLead } from '@/lib/db';
import { Lead } from '@/types/lead';

export async function POST(req: Request) {
  try {
    const { lead, customInstructions, preferredModel } = await req.json() as {
      lead: Lead;
      customInstructions?: string;
      preferredModel?: string;
    };

    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead is required' }, { status: 400 });
    }

    // 1. Try Google Gemini first for highest quality problem-solving pitch
    let pitchKit = await generateRelatablePitchWithGemini(lead, customInstructions);
    let source = 'gemini-2.0-flash';

    // 2. Fallback to Ollama or built-in engine if Gemini isn't configured
    if (!pitchKit) {
      const ollamaRes = await generateCustomPitchWithOllama(lead, customInstructions, preferredModel);
      pitchKit = ollamaRes.pitchKit;
      source = ollamaRes.source;
    }

    // Persist regenerated pitch to lead if it exists in DB
    if (lead.id && pitchKit) {
      await updateLead(lead.id, { pitchKit });
    }

    return NextResponse.json({
      success: true,
      pitchKit,
      source
    });
  } catch (error) {
    console.error('Failed to generate AI pitch:', error);
    return NextResponse.json({ success: false, error: 'AI generation failed' }, { status: 500 });
  }
}
