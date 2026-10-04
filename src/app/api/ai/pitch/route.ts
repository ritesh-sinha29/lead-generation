import { NextResponse } from 'next/server';
import { generateRelatablePitchWithGemini } from '@/lib/gemini';
import { generateRelatablePitchWithOpenAI } from '@/lib/openai';
import { generateDefaultPitchKit } from '@/lib/pitchGenerator';
import { updateLead, getSettings } from '@/lib/db';
import { Lead } from '@/types/lead';

export async function POST(req: Request) {
  try {
    const { lead, customInstructions } = await req.json() as {
      lead: Lead;
      customInstructions?: string;
    };

    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead is required' }, { status: 400 });
    }

    const settings = getSettings();
    let pitchKit = null;
    let source = 'deterministic';

    // 1. Try configured provider first (OpenAI or Gemini)
    if (settings.aiProvider === 'openai') {
      pitchKit = await generateRelatablePitchWithOpenAI(lead, customInstructions);
      if (pitchKit) source = 'openai-gpt-4o-mini';
    } else {
      pitchKit = await generateRelatablePitchWithGemini(lead, customInstructions);
      if (pitchKit) source = 'gemini-flash';
    }

    // 2. If preferred provider failed or not configured, try alternative provider
    if (!pitchKit) {
      if (settings.aiProvider === 'openai') {
        pitchKit = await generateRelatablePitchWithGemini(lead, customInstructions);
        if (pitchKit) source = 'gemini-flash';
      } else {
        pitchKit = await generateRelatablePitchWithOpenAI(lead, customInstructions);
        if (pitchKit) source = 'openai-gpt-4o-mini';
      }
    }

    // 3. Fallback to deterministic high-converting pitch engine
    if (!pitchKit) {
      pitchKit = generateDefaultPitchKit({
        businessName: lead.businessName,
        niche: lead.niche,
        city: lead.city,
        decisionMakerName: lead.decisionMakerName,
        website: lead.website,
        topGaps: lead.audit?.topGaps || [],
        primaryService: lead.audit?.topGaps[0]?.service || 'chatbots'
      });
      source = 'deterministic-engine';
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
