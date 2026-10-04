import { NextResponse } from 'next/server';
import { scrapeLiveLeadsWithGemini } from '@/lib/liveScraper';
import { scrapeLiveLeadsWithOpenAI } from '@/lib/openai';
import { addLeads, getLeads, getSettings } from '@/lib/db';
import { GenerateLeadsRequest, Lead } from '@/types/lead';

export async function POST(req: Request) {
  try {
    const body: GenerateLeadsRequest = await req.json();
    const settings = getSettings();
    
    // 1. Fetch current Convex leads to ensure 100% uniqueness
    const existingLeads = await getLeads();

    // 2. Discover & Audit fresh leads using configured provider (OpenAI or Gemini)
    let freshLeads: Lead[] = [];
    const hasOpenAI = !!(process.env.OPENAI_API_KEY || settings.openaiApiKey);
    const hasGemini = !!(process.env.GEMINI_API_KEY || settings.geminiApiKey);

    if (settings.aiProvider === 'openai' && hasOpenAI) {
      freshLeads = await scrapeLiveLeadsWithOpenAI(body, existingLeads);
    } else if (hasGemini) {
      try {
        freshLeads = await scrapeLiveLeadsWithGemini(body, existingLeads);
      } catch (geminiErr: any) {
        // Fallback to OpenAI if Gemini quota is exhausted and OpenAI is available
        if (hasOpenAI && (geminiErr?.message?.includes('429') || geminiErr?.status === 429)) {
          console.log('Gemini quota exhausted, falling back to OpenAI...');
          freshLeads = await scrapeLiveLeadsWithOpenAI(body, existingLeads);
        } else {
          throw geminiErr;
        }
      }
    } else if (hasOpenAI) {
      freshLeads = await scrapeLiveLeadsWithOpenAI(body, existingLeads);
    } else {
      throw new Error('No AI Provider configured. Please add an OpenAI or Gemini API key in Settings.');
    }

    if (!freshLeads || freshLeads.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No new unique leads discovered. All matching businesses in this category might already be in your CRM. Try another niche or expanding search scope.'
      }, { status: 400 });
    }
    
    // 3. Save real verified unique leads to Convex database
    const allLeads = await addLeads(freshLeads);

    return NextResponse.json({
      success: true,
      message: `Successfully discovered and audited ${freshLeads.length} leads for ${body.niche} in ${body.city}!`,
      newLeads: freshLeads,
      totalCount: allLeads.length
    });
  } catch (error) {
    console.error('Failed to generate leads:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Lead generation failed'
    }, { status: 500 });
  }
}
