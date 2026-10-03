import { NextResponse } from 'next/server';
import { scrapeLiveLeadsWithGemini } from '@/lib/liveScraper';
import { scrapeDailyLeads } from '@/lib/scraper';
import { addLeads } from '@/lib/db';
import { GenerateLeadsRequest, Lead } from '@/types/lead';

export async function POST(req: Request) {
  try {
    const body: GenerateLeadsRequest = await req.json();
    
    // 1. Live Gemini Google Search Grounding & Live Website HTML Auditor
    const freshLeads: Lead[] = await scrapeLiveLeadsWithGemini(body);

    if (!freshLeads || freshLeads.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No live leads discovered. Please check your Gemini API key in Settings (or .env.local) to enable live Google Search Grounding for real operating businesses.'
      }, { status: 400 });
    }
    
    // 2. Save real verified leads to persistent database
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
