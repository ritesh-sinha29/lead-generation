import { Lead, GenerateLeadsRequest } from '@/types/lead';
import { scrapeLiveLeadsWithGemini } from './liveScraper';

/**
 * Pure Real-Time Lead Discovery Engine
 * Strictly performs live Google Search Grounding and real-time website auditing.
 * ZERO mock data or pre-seeded templates.
 */
export async function scrapeDailyLeads(req: GenerateLeadsRequest): Promise<Lead[]> {
  return scrapeLiveLeadsWithGemini(req);
}
