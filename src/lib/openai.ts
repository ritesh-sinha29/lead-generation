import OpenAI from 'openai';
import { Lead, SalesPitchKit, GenerateLeadsRequest } from '@/types/lead';
import { getSettings } from './db';
import { auditLiveWebsite } from './liveScraper';
import { generateDefaultPitchKit } from './pitchGenerator';

/**
 * Problem-Solving Pitch Generator using OpenAI (gpt-4o-mini / gpt-4o)
 */
export async function generateRelatablePitchWithOpenAI(
  lead: Partial<Lead>,
  customPrompt?: string,
  providedApiKey?: string
): Promise<SalesPitchKit | null> {
  const settings = getSettings();
  const apiKey = providedApiKey || process.env.OPENAI_API_KEY || settings.openaiApiKey || '';

  if (!apiKey) {
    console.warn('No OpenAI API key provided, skipping OpenAI pitch generation.');
    return null;
  }

  try {
    const openai = new OpenAI({ apiKey });

    const systemInstruction = `You are an elite, consultative sales strategist for a modern AI & Web engineering agency (${settings.agencyName}).
Your task is to write hyper-relatable, consultative sales copy for decision-makers that feels 100% personalized, empathetic, and problem-focused.

CRITICAL REQUIREMENTS:
1. ALWAYS CALCULATE AND QUOTE IN INDIAN RUPEES (INR / ₹): Strictly format ALL prices, estimated revenue leaks, quotes, tiers, and financial figures in Indian Rupees (e.g., ₹45,000 setup + ₹12,000/mo retainer, ₹25,000, ₹85,000, ₹1.5 Lakhs). NEVER use dollars ($) or any non-rupee currency.
2. COMPETITOR BENCHMARKING: Identify who their 2 top local competitors in ${lead.city || 'their area'} are (or likely direct category rivals), explain why those competitors are growing / what makes them win, and provide the exact tactical playbook showing how our AI/Web upgrade will help this business leapfrog and beat them.
3. Focus 100% on the exact customer pain point: what friction or revenue leakage their business is experiencing right now in ₹.
4. Make the prospect feel: "This person actually audited my exact site, understands my niche, analyzed my competitors, and has a concrete fix for my lost revenue."
5. Every cold call opener must be a polite pattern-interrupt with specific reference to their business.
6. Every smoking gun must point to a real, diagnosed flaw.
7. Return a strict JSON response.`;

    const prompt = `Business Details:
- Name: ${lead.businessName}
- Niche/Industry: ${lead.niche}
- City: ${lead.city}, ${lead.country}
- Decision Maker: ${lead.decisionMakerName} (${lead.decisionMakerRole})
- Phone: ${lead.phone}
- Website: ${lead.website}
- Currency: INR (₹)
- Diagnosed Vulnerabilities: ${JSON.stringify(lead.audit?.topGaps || [])}
- Overall Tech Readiness Score: ${lead.audit?.overallHealthScore}/100

Custom Goal/Instruction: ${customPrompt || 'Analyze their local competitors, diagnose what they lack, how we can help, how much it takes, and formulate the exact pitch to beat their competition. All pricing strictly in Indian Rupees (₹).'}

Generate a complete SalesPitchKit JSON object.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content) as SalesPitchKit;
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('OpenAI Pitch Generation Error:', err);
    return null;
  }
}

/**
 * Real-Time Lead Discovery Engine using OpenAI (gpt-4o-mini)
 */
export async function scrapeLiveLeadsWithOpenAI(
  req: GenerateLeadsRequest,
  existingLeads: Lead[] = [],
  providedApiKey?: string
): Promise<Lead[]> {
  const { niche, city, count = 10, country = 'India' } = req;
  const settings = getSettings();
  const apiKey = providedApiKey || process.env.OPENAI_API_KEY || settings.openaiApiKey || '';

  if (!apiKey) {
    throw new Error('OpenAI API Key is missing. Please configure it in Settings.');
  }

  const existingNormNames = new Set(
    existingLeads.map(l => l.businessName.toLowerCase().replace(/[^a-z0-9]/g, ''))
  );
  const existingDomains = new Set(
    existingLeads
      .filter(l => l.website)
      .map(l => {
        try {
          const url = l.website.startsWith('http') ? l.website : `https://${l.website}`;
          return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
        } catch {
          return '';
        }
      })
      .filter(Boolean)
  );

  const openai = new OpenAI({ apiKey });

  const prompt = `Search for REAL, active businesses operating in "${city}", "${country || 'India'}" within the niche/industry "${niche}".

Identify ${Math.min(count + 5, 20)} distinct, real local businesses.

For each business:
1. Provide their REAL official business name.
2. Provide their website URL (or Justdial/Practo/Google Maps profile if no standalone site).
3. Provide their phone number with area/country code.
4. Provide the Doctor / Owner / Founder name if available.
5. Provide their Google Rating and Review count if verified; otherwise return 0 (do not fabricate ratings or reviews).

Return a JSON object with a "businesses" array containing objects with keys:
- businessName (string)
- website (string)
- phone (string)
- email (string)
- decisionMakerName (string)
- decisionMakerRole (string)
- googleRating (number, or 0 if unverified)
- googleReviewsCount (number, or 0 if unverified)`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert market intelligence and lead generation research engine. Return only strict, valid JSON with accurate factual business data. Use 0 for unverified rating or review counts.'
      },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error('OpenAI returned an empty response during lead discovery.');
  }

  const parsed = JSON.parse(raw);
  const parsedBusinesses: Array<{
    businessName: string;
    website?: string;
    phone?: string;
    email?: string;
    decisionMakerName?: string;
    decisionMakerRole?: string;
    googleRating?: number;
    googleReviewsCount?: number;
  }> = Array.isArray(parsed.businesses) ? parsed.businesses : (Array.isArray(parsed) ? parsed : []);

  // Deduplication
  const uniqueCandidates: typeof parsedBusinesses = [];
  const seenBatchNormNames = new Set<string>();

  for (const b of parsedBusinesses) {
    if (!b.businessName) continue;
    const rawName = b.businessName.trim();
    const normName = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!normName || seenBatchNormNames.has(normName) || existingNormNames.has(normName)) continue;

    if (b.website) {
      try {
        const urlStr = b.website.startsWith('http') ? b.website : `https://${b.website}`;
        const domain = new URL(urlStr).hostname.replace(/^www\./, '').toLowerCase();
        if (domain && existingDomains.has(domain)) continue;
      } catch {}
    }

    seenBatchNormNames.add(normName);
    uniqueCandidates.push(b);
  }

  const finalCandidates = uniqueCandidates.slice(0, count);

  // Run live website audits and pitch generation concurrently
  const leads = await Promise.all(
    finalCandidates.map(async (b, idx) => {
      const siteUrl = b.website || '';
      const { audit, contact } = await auditLiveWebsite(siteUrl, niche);

      const finalPhone = contact.extractedPhone || b.phone || '';
      const finalEmail = contact.extractedEmail || b.email || '';
      const finalWebsite = siteUrl || '';
      const finalDecisionMaker = contact.extractedOwner || b.decisionMakerName || 'Owner / Decision Maker';
      const finalRating = typeof b.googleRating === 'number' && !isNaN(b.googleRating) ? Math.max(0, b.googleRating) : 0;
      const finalReviews = typeof b.googleReviewsCount === 'number' && !isNaN(b.googleReviewsCount) ? Math.max(0, Math.round(b.googleReviewsCount)) : 0;

      const partialLead: Partial<Lead> = {
        businessName: b.businessName,
        niche,
        city,
        country,
        website: finalWebsite,
        phone: finalPhone,
        email: finalEmail,
        decisionMakerName: finalDecisionMaker,
        decisionMakerRole: b.decisionMakerRole || 'Owner / Founder',
        audit
      };

      let pitchKit = await generateRelatablePitchWithOpenAI(partialLead, undefined, apiKey);
      if (!pitchKit) {
        pitchKit = generateDefaultPitchKit({
          businessName: b.businessName,
          niche,
          city,
          decisionMakerName: finalDecisionMaker,
          website: finalWebsite,
          topGaps: audit.topGaps,
          primaryService: audit.topGaps[0]?.service || 'chatbots'
        });
      }

      return {
        id: `lead-${Date.now()}-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
        businessName: b.businessName,
        niche,
        category: niche,
        city,
        country: country || 'India',
        website: finalWebsite,
        phone: finalPhone,
        email: finalEmail,
        decisionMakerName: finalDecisionMaker,
        decisionMakerRole: b.decisionMakerRole || 'Owner / Founder',
        googleRating: finalRating,
        googleReviewsCount: finalReviews,
        estimatedRevenue: 'Verified via Live Audit',
        employeeCount: 'Local Business',
        status: 'new' as const,
        starred: idx < 2,
        notes: [
          finalRating > 0
            ? `Audited live for ${city} ${niche} outreach via OpenAI.`
            : `Audited live for ${city} ${niche} outreach via OpenAI (Rating unverified, set to 0).`
        ],
        createdAt: new Date().toISOString(),
        audit,
        pitchKit
      };
    })
  );

  return leads;
}
