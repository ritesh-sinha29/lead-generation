import { NextResponse } from 'next/server';
import { scrapeLiveLeadsWithGemini } from '@/lib/liveScraper';
import { scrapeDailyLeads } from '@/lib/scraper';
import { addLeads, getLeads } from '@/lib/db';
import { GenerateLeadsRequest, Lead } from '@/types/lead';

export async function POST(req: Request) {
  try {
    const body: GenerateLeadsRequest = await req.json();
    
    // 1. Fetch current Convex leads to ensure 100% uniqueness
    const existingLeads = await getLeads();

    // 2. Live Gemini Google Search Grounding & Live Website HTML Auditor (with exclusion list)
    const freshLeads: Lead[] = await scrapeLiveLeadsWithGemini(body, existingLeads);

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
