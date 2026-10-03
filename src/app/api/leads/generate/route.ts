import { NextResponse } from 'next/server';
import { scrapeLiveLeadsWithGemini } from '@/lib/liveScraper';
import { scrapeDailyLeads } from '@/lib/scraper';
import { addLeads } from '@/lib/db';
import { GenerateLeadsRequest, Lead } from '@/types/lead';

export async function POST(req: Request) {
  try {
    const body: GenerateLeadsRequest = await req.json();
    
    // 1. Try Live Gemini Google Search Grounding & Live Website HTML Auditor
    let freshLeads: Lead[] = await scrapeLiveLeadsWithGemini(body);

    // 2. Fallback to High-Precision Discovery Engine if Gemini Key is not present or returns empty
    if (!freshLeads || freshLeads.length === 0) {
      freshLeads = await scrapeDailyLeads(body);
    }
    
    // 3. Save to persistent database
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
