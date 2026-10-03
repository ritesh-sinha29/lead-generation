import { NextResponse } from 'next/server';
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

    const result = await generateCustomPitchWithOllama(lead, customInstructions, preferredModel);

    // Persist regenerated pitch to lead if it exists in DB
    if (lead.id) {
      await updateLead(lead.id, { pitchKit: result.pitchKit });
    }

    return NextResponse.json({
      success: true,
      pitchKit: result.pitchKit,
      usedModel: result.usedModel,
      source: result.source
    });
  } catch (error) {
    console.error('Failed to generate AI pitch:', error);
    return NextResponse.json({ success: false, error: 'AI generation failed' }, { status: 500 });
  }
}
