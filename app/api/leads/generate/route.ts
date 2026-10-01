import { NextResponse } from 'next/server';
import { scrapeDailyLeads } from '@/lib/scraper';
import { addLeads } from '@/lib/db';
import { GenerateLeadsRequest } from '@/types/lead';

export async function POST(req: Request) {
  try {
    const body: GenerateLeadsRequest = await req.json();
    
    // Scrape & audit the batch of 10-20 leads
    const freshLeads = await scrapeDailyLeads(body);
    
    // Save to persistent local storage
    const allLeads = await addLeads(freshLeads);

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${freshLeads.length} qualified leads for ${body.niche} in ${body.city}!`,
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
