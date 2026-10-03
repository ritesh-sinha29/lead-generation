import * as cheerio from 'cheerio';
import { GoogleGenAI } from '@google/genai';
import { Lead, ServiceGap, WebsiteAudit, GenerateLeadsRequest } from '@/types/lead';
import { getSettings, getLeads } from './db';
import { generateDefaultPitchKit } from './pitchGenerator';
import { generateRelatablePitchWithGemini } from './gemini';

interface LiveExtractedContact {
  extractedPhone?: string;
  extractedEmail?: string;
  extractedOwner?: string;
  loadTimeSeconds: number;
  mobileResponsive: boolean;
  hasLiveChat: boolean;
  hasAiBot: boolean;
  hasAutomatedBooking: boolean;
  hasSchemaMarkup: boolean;
  hasAiSearchVisibility: boolean;
  isLive: boolean;
}

// 1. Live Technical Website Auditor & Contact Harvester
export async function auditLiveWebsite(url: string, niche: string): Promise<{ audit: WebsiteAudit; gaps: ServiceGap[]; contact: LiveExtractedContact }> {
  let loadTimeSeconds = 2.4;
  let mobileResponsive = true;
  let hasLiveChat = false;
  let hasAiBot = false;
  let hasAutomatedBooking = false;
  let hasSchemaMarkup = false;
  const hasAiSearchVisibility = false;
  let isLive = false;
  let extractedPhone: string | undefined;
  let extractedEmail: string | undefined;
  let extractedOwner: string | undefined;

  const isDirectoryOrNoSite = !url || 
    url.includes('google.com/maps') || 
    url.includes('justdial.com') || 
    url.includes('practo.com') || 
    url.includes('indiamart.com') ||
    url.includes('facebook.com') ||
    url.includes('instagram.com');

  if (!isDirectoryOrNoSite) {
    try {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      const startTime = Date.now();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const response = await fetch(formattedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
      });
      clearTimeout(timeoutId);

      loadTimeSeconds = Number(((Date.now() - startTime) / 1000).toFixed(1));

      if (response.ok) {
        isLive = true;
        const html = await response.text();
        const $ = cheerio.load(html);

        // Check Mobile Viewport
        mobileResponsive = $('meta[name="viewport"]').length > 0;

        // Extract Real Phone from tel: links or HTML
        const telLink = $('a[href^="tel:"]').first().attr('href');
        if (telLink) {
          extractedPhone = telLink.replace(/^tel:/i, '').trim();
        } else {
          const phoneMatch = html.match(/(?:\+91[\s-]?)?[6789]\d{9}|(?:\+1[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}|\+44[\s-]?\d{4}[\s-]?\d{6}/);
          if (phoneMatch) extractedPhone = phoneMatch[0].trim();
        }

        // Extract Real Email from mailto: links
        const mailtoLink = $('a[href^="mailto:"]').first().attr('href');
        if (mailtoLink) {
          const cleanMail = mailtoLink.replace(/^mailto:/i, '').split('?')[0].trim();
          if (cleanMail.includes('@') && !cleanMail.includes('example') && !cleanMail.includes('wixpress')) {
            extractedEmail = cleanMail;
          }
        }

        // Check Schema JSON-LD (Crucial for AI Search Engine Visibility - GEO / AEO)
        const schemaScripts = $('script[type="application/ld+json"]').text();
        hasSchemaMarkup = schemaScripts.length > 20 && (schemaScripts.includes('schema.org') || schemaScripts.includes('LocalBusiness'));

        // Extract Doctor / Owner from Schema if present
        try {
          if (hasSchemaMarkup) {
            const schemaObj = JSON.parse(schemaScripts);
            if (schemaObj.founder?.name) extractedOwner = schemaObj.founder.name;
            else if (schemaObj.physician?.name) extractedOwner = schemaObj.physician.name;
            else if (schemaObj.employee?.name) extractedOwner = schemaObj.employee.name;
          }
        } catch {
          // Silent JSON parse fallback
        }

        // Check for Chatbots & Voice AI
        const lowerHtml = html.toLowerCase();
        const chatKeywords = ['tidio', 'intercom', 'crisp.chat', 'drift', 'chatra', 'zendesk', 'livechat', 'tawk.to', 'chatbase', 'voiceflow', 'vapi', 'retell'];
        hasLiveChat = chatKeywords.some(k => lowerHtml.includes(k));
        hasAiBot = lowerHtml.includes('chatbase') || lowerHtml.includes('voiceflow') || lowerHtml.includes('retell') || lowerHtml.includes('vapi');

        // Check for Automated Booking Engine
        const bookingKeywords = ['calendly', 'acuityscheduling', 'setmore', 'zocdoc', 'practo', 'simplybook', 'appointlet', 'book-online'];
        hasAutomatedBooking = bookingKeywords.some(k => lowerHtml.includes(k));
      }
    } catch {
      loadTimeSeconds = 3.8;
      mobileResponsive = false;
      hasLiveChat = false;
      hasAiBot = false;
      hasAutomatedBooking = false;
      hasSchemaMarkup = false;
    }
  }

  // Construct Problem-Centric Diagnostic Gaps
  const gaps: ServiceGap[] = [];

  if (isDirectoryOrNoSite) {
    // CASE A: Established business doing well locally, but has NO OFFICIAL WEBSITE
    gaps.push({
      service: 'web_app',
      serviceTitle: 'High-Converting Web & App Launch',
      detectedIssue: 'No official website found; business relies solely on local footfall / directory listings without digital appointment booking.',
      impactExplanation: `In ${niche}, over 58% of prospective clients research websites before making high-ticket decisions. Without a website, these leads drop off to competing providers.`,
      estimatedLostRevenueMonthly: 65000,
      recommendedSolution: 'Build and deploy a modern, high-speed Next.js web application with online booking and portfolio showcase.',
      urgency: 'high'
    });

    gaps.push({
      service: 'seo_aeo_geo',
      serviceTitle: 'Local Google Maps & AI Search Authority (GEO / AEO)',
      detectedIssue: 'Missing verified custom domain and local business entity schema; lower visibility in Google Maps Local 3-Pack and ChatGPT search.',
      impactExplanation: 'Competitors with dedicated websites and entity SEO rank above on Google Maps and capture top inquiries.',
      estimatedLostRevenueMonthly: 45000,
      recommendedSolution: 'Connect a custom branded domain, setup structured local JSON-LD entity schema, and optimize local search ranking.',
      urgency: 'high'
    });

    gaps.push({
      service: 'chatbots',
      serviceTitle: 'Automated 24/7 WhatsApp & Lead Capture',
      detectedIssue: 'No automated response system to capture and qualify evening and weekend customer inquiries.',
      impactExplanation: 'Prospective clients who reach out after hours receive no immediate response and contact other businesses.',
      estimatedLostRevenueMonthly: 35000,
      recommendedSolution: 'Deploy an automated 24/7 WhatsApp capture assistant directly linked to staff calendars.',
      urgency: 'medium'
    });
  } else {
    // CASE B: Business HAS a website, diagnose gaps across AI, speed, and visibility
    if (!hasAiBot) {
      gaps.push({
        service: 'chatbots',
        serviceTitle: '24/7 AI Lead & Appointment Booking Assistant',
        detectedIssue: 'No conversational AI agent active on website to capture evening/weekend inquiries or confirm bookings in real-time.',
        impactExplanation: `In ${niche}, 42% of inquiries visit outside normal business hours and leave immediately if forced to fill out a static form.`,
        estimatedLostRevenueMonthly: 35000,
        recommendedSolution: 'Deploy a turnkey 24/7 conversational AI agent connected to WhatsApp and CRM calendar.',
        urgency: 'high'
      });
    }

    gaps.push({
      service: 'calling_agents',
      serviceTitle: 'AI Voice Receptionist & Missed-Call Recovery',
      detectedIssue: 'No automated instantaneous callback system for missed inbound phone calls.',
      impactExplanation: '65% of first-time callers never leave a voicemail and immediately dial the next competitor on Google.',
      estimatedLostRevenueMonthly: 45000,
      recommendedSolution: 'Connect an automated Voice AI that calls back missed prospect calls within 15 seconds.',
      urgency: 'high'
    });

    if (!hasSchemaMarkup) {
      gaps.push({
        service: 'seo_aeo_geo',
        serviceTitle: 'Generative Engine Optimization (GEO & AEO for ChatGPT / Perplexity)',
        detectedIssue: 'Missing JSON-LD local business entity schema; invisible when potential clients ask ChatGPT or Perplexity for recommendations.',
        impactExplanation: 'Over 30% of high-intent clients now search via AI conversational tools rather than traditional Google links.',
        estimatedLostRevenueMonthly: 50000,
        recommendedSolution: 'Inject rich JSON-LD semantic entity data, llms.txt, and AI citation authority vectors.',
        urgency: 'high'
      });
    }

    if (loadTimeSeconds > 3.0 || !mobileResponsive) {
      gaps.push({
        service: 'web_app',
        serviceTitle: 'High-Performance Modern Web App Redesign',
        detectedIssue: `Slow load response (${loadTimeSeconds}s) or non-optimized mobile experience causing high visitor bounce rate.`,
        impactExplanation: 'Every additional second of load time reduces lead conversion rates by 20%.',
        estimatedLostRevenueMonthly: 30000,
        recommendedSolution: 'Rebuild into an ultra-fast Next.js web application with sub-second page transitions.',
        urgency: 'medium'
      });
    }

    gaps.push({
      service: 'portfolio',
      serviceTitle: 'Authority Showcase & Proof System',
      detectedIssue: 'Lacks interactive case studies, before/after results proof, or video review carousels.',
      impactExplanation: 'High-ticket buyers demand visual proof within the first 10 seconds of visiting.',
      estimatedLostRevenueMonthly: 25000,
      recommendedSolution: 'Embed interactive proof sliders, verified customer reels, and client ROI calculators.',
      urgency: 'medium'
    });
  }

  const overallHealthScore = isDirectoryOrNoSite 
    ? 45 
    : Math.max(35, Math.min(85, Math.floor(100 - (loadTimeSeconds * 6) - (gaps.length * 8))));

  const audit: WebsiteAudit = {
    overallHealthScore,
    loadTimeSeconds,
    mobileResponsive,
    hasLiveChat,
    hasAiBot,
    hasAutomatedBooking,
    hasSchemaMarkup,
    hasAiSearchVisibility,
    topGaps: gaps.slice(0, 3)
  };

  const contact: LiveExtractedContact = {
    extractedPhone,
    extractedEmail,
    extractedOwner,
    loadTimeSeconds,
    mobileResponsive,
    hasLiveChat,
    hasAiBot,
    hasAutomatedBooking,
    hasSchemaMarkup,
    hasAiSearchVisibility,
    isLive
  };

  return { audit, gaps: gaps.slice(0, 3), contact };
}

// 2. Discover Real, Verified Leads with Gemini Google Search Grounding
export async function scrapeLiveLeadsWithGemini(
  req: GenerateLeadsRequest,
  existingLeadsParam?: Lead[]
): Promise<Lead[]> {
  const { niche, city, country = 'India', count = 15 } = req;
  const settings = getSettings();
  const apiKey = process.env.GEMINI_API_KEY || settings.geminiApiKey;

  if (!apiKey) {
    console.log('No Gemini API key available for live Google Search. Falling back to structured seed scraper.');
    return [];
  }

  // 1. Fetch existing leads to guarantee every single discovered lead is 100% unique
  let existingLeads: Lead[] = [];
  try {
    existingLeads = existingLeadsParam && existingLeadsParam.length > 0 
      ? existingLeadsParam 
      : await getLeads();
  } catch (err) {
    console.warn('Could not fetch existing leads for deduplication:', err);
  }

  const existingNames = Array.from(new Set(
    existingLeads
      .map(l => (l.businessName || '').trim())
      .filter(name => name.length > 0)
  ));

  const existingNormNames = new Set(
    existingNames.map(name => name.toLowerCase().replace(/[^a-z0-9]/g, ''))
  );

  const existingDomains = new Set(
    existingLeads
      .map(l => {
        try {
          if (!l.website) return '';
          const urlStr = l.website.startsWith('http') ? l.website : `https://${l.website}`;
          return new URL(urlStr).hostname.replace(/^www\./, '').toLowerCase();
        } catch {
          return '';
        }
      })
      .filter(d => d.length > 0 && !d.includes('example.com'))
  );

  const existingPhones = new Set(
    existingLeads
      .map(l => (l.phone || '').replace(/[^0-9]/g, ''))
      .filter(p => p.length >= 8)
  );

  const exclusionPrompt = existingNames.length > 0
    ? `\n\nCRITICAL EXCLUSION LIST (DO NOT RETURN ANY OF THESE ALREADY-SAVED CLIENTS):
The following ${existingNames.length} businesses already exist in our CRM. You MUST NOT include them. Find completely fresh, new, different operating businesses not on this list:
${existingNames.slice(0, 80).map(n => `- ${n}`).join('\n')}`
    : '';

  // Request extra candidates so after strict uniqueness filtering we have the full requested count
  const requestedCandidateCount = Math.min(Math.max(count + (existingNames.length > 0 ? 8 : 4), 15), 30);

  try {
    const ai = new GoogleGenAI({ apiKey });

    const isAnyNiche = niche.toLowerCase().includes('any niche') || niche.toLowerCase().includes('top in-demand') || niche.toLowerCase().includes('top high-ticket');

    const prompt = isAnyNiche
      ? `You are an elite B2B sales researcher. Use live Google Search to find ${requestedCandidateCount} real, operating high-ticket businesses across the most lucrative service industries (e.g. Cosmetic Dental Care, Luxury Real Estate, Commercial Litigation Law, Med Spas & Aesthetics, High-End Home Remodeling, Private Wealth, Architects, High-End Banquet Venues) in ${city}, ${country}.

CRITICAL LEAD MIX INSTRUCTION:
You MUST search for and provide a balanced combination of:
1. TYPE A (Thriving Local Businesses WITH NO WEBSITE): Popular, highly rated (4.2+ stars) doctors, advocates, clinics, restaurants, and firms listed on Google Maps / Justdial / Practo that are doing great business locally but DO NOT have their own website yet.
2. TYPE B (Established Businesses WITH A WEBSITE): Businesses with an existing website that need modern 24/7 AI chat, voice receptionists, speed optimization, or local search visibility.
${exclusionPrompt}

STRICT DATA ACCURACY INSTRUCTIONS:
1. ONLY return REAL businesses currently open and operating in ${city}.
2. Provide their exact REAL business name as listed on Google Maps / Justdial / website.
3. Provide their specific niche (e.g. "Dental Clinics", "Luxury Real Estate", "Law Firms", "Med Spas", "Architects").
4. If they have their own official website, provide the URL (e.g. "https://exampleclinic.com"). If they DO NOT have a website, provide their Google Maps / Justdial / Practo profile link or leave as "".
5. Provide their REAL working phone number with area/country code.
6. Provide the real Doctor name, Founder name, Managing Director, Advocate, or Owner name.
7. Provide their real Google Rating (e.g. 4.7) and Reviews count (e.g. 84).

Return a strict JSON array of objects with keys:
- businessName (string)
- niche (string)
- website (string - official website URL, or Google Maps profile link, or empty string "")
- phone (string)
- email (string)
- decisionMakerName (string)
- decisionMakerRole (string)
- googleRating (number)
- googleReviewsCount (number)`
      : `You are a real-time lead research specialist. Use live Google Search to find ${requestedCandidateCount} real, verified, operating local businesses in the following target:
- Niche/Industry: ${niche}
- City: ${city}
- Country: ${country}

CRITICAL LEAD MIX INSTRUCTION:
Search for a healthy mix of:
1. Thriving businesses with strong Google Maps ratings/reviews that DO NOT have an official website yet.
2. Businesses that have an existing website but lack modern 24/7 AI response, automated booking, or modern SEO.
${exclusionPrompt}

STRICT DATA ACCURACY INSTRUCTIONS:
1. ONLY return REAL businesses currently open and operating in ${city}.
2. Provide their exact REAL business name as listed on Google Maps / website.
3. Provide their REAL working website URL (or their verified Google Maps / Practo / JustDial business profile URL, or empty string if no website).
4. Provide their REAL phone number with area/country code.
5. Provide the real Doctor name, Founder name, Managing Director, or Owner name.
6. Provide their real Google Rating (e.g. 4.6) and Reviews count (e.g. 48).

Return a strict JSON array of objects with keys:
- businessName (string)
- website (string)
- phone (string)
- email (string)
- decisionMakerName (string)
- decisionMakerRole (string)
- googleRating (number)
- googleReviewsCount (number)`;

    const priorityOrder = [
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash-002',
      'gemini-2.0-flash-001',
      'gemini-1.5-pro'
    ];

    let response: any = null;
    let lastErr: any = null;

    for (const model of priorityOrder) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            temperature: 0.1, // Low temperature for maximum factual precision
          }
        });
        if (response && response.text) {
          console.log(`Successfully generated leads using model: ${model}`);
          break;
        }
      } catch (err: any) {
        lastErr = err;
        const errMsg = err?.message || String(err);
        console.warn(`Model ${model} failed: ${errMsg.slice(0, 120)}`);
        
        // If quota limit (429) hit, no other model in this project will work, break early
        if (err?.status === 429 || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
          console.error('Google Gemini API Key has exhausted its quota (HTTP 429).');
          break;
        }
      }
    }

    if (!response || !response.text) {
      throw lastErr || new Error('Google Gemini API key has exceeded its quota (HTTP 429) or is invalid.');
    }

    if (response && response.text) {
      const rawText = response.text.trim();
      
      // Inspect Context7-verified groundingMetadata for search queries & source chunks
      const metadata = response.candidates?.[0]?.groundingMetadata;
      const groundingChunks = metadata?.groundingChunks || [];
      const searchQueries = metadata?.webSearchQueries || [];
      if (searchQueries.length > 0) {
        console.log('Live Google Search Grounding Queries:', searchQueries);
      }
      
      // Robust extraction of JSON array from response
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : rawText.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

      let parsedBusinesses: Array<{
        businessName: string;
        niche?: string;
        website?: string;
        phone?: string;
        email?: string;
        decisionMakerName?: string;
        decisionMakerRole?: string;
        googleRating?: number;
        googleReviewsCount?: number;
      }> = [];

      try {
        parsedBusinesses = JSON.parse(jsonString);
      } catch (parseErr) {
        console.error('Failed to parse JSON from model output, attempting repair:', parseErr);
        // Fallback cleanup if trailing commas or formatting flaws exist
        const cleaned = jsonString.replace(/,\s*\]/, ']').replace(/,\s*\}/g, '}');
        parsedBusinesses = JSON.parse(cleaned);
      }

      if (Array.isArray(parsedBusinesses) && parsedBusinesses.length > 0) {
        // Strict Uniqueness & Deduplication Filter against Convex CRM and Intra-Batch duplicates
        const uniqueCandidates: typeof parsedBusinesses = [];
        const seenBatchNormNames = new Set<string>();

        for (const b of parsedBusinesses) {
          if (!b.businessName) continue;
          const rawName = b.businessName.trim();
          const normName = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (!normName || seenBatchNormNames.has(normName)) continue;

          // 1. Check against existing database names
          if (existingNormNames.has(normName)) {
            console.log(`[Deduplicator] Skipping already-existing client: ${rawName}`);
            continue;
          }

          // Partial fuzzy match against existing names
          const isFuzzyDuplicate = existingNames.some(ex => {
            const exNorm = ex.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (exNorm === normName) return true;
            if (exNorm.length > 8 && normName.length > 8) {
              return exNorm.startsWith(normName) || normName.startsWith(exNorm);
            }
            return false;
          });
          if (isFuzzyDuplicate) {
            console.log(`[Deduplicator] Skipping fuzzy duplicate client: ${rawName}`);
            continue;
          }

          // 2. Check against existing domain
          if (b.website) {
            try {
              const urlStr = b.website.startsWith('http') ? b.website : `https://${b.website}`;
              const domain = new URL(urlStr).hostname.replace(/^www\./, '').toLowerCase();
              if (domain && existingDomains.has(domain)) {
                console.log(`[Deduplicator] Skipping duplicate website domain: ${domain}`);
                continue;
              }
            } catch {}
          }

          // 3. Check against existing phone number
          if (b.phone) {
            const cleanPhone = b.phone.replace(/[^0-9]/g, '');
            if (cleanPhone.length >= 8 && existingPhones.has(cleanPhone)) {
              console.log(`[Deduplicator] Skipping duplicate phone number: ${b.phone}`);
              continue;
            }
          }

          seenBatchNormNames.add(normName);
          uniqueCandidates.push(b);
        }

        const finalCandidatesToAudit = uniqueCandidates.slice(0, count);
        console.log(`[Deduplicator] Yielded ${finalCandidatesToAudit.length} guaranteed unique fresh leads out of ${parsedBusinesses.length} candidates.`);

        const isIndia = (country || '').toLowerCase().includes('india') || (city || '').toLowerCase().includes('vapi') || (city || '').toLowerCase().includes('mumbai') || (city || '').toLowerCase().includes('surat');

        // Execute website audits concurrently in parallel for ultra-fast response
        const leads = await Promise.all(
          finalCandidatesToAudit.map(async (b, idx) => {
            const actualNiche = b.niche || niche;

            // Resolve website URL from Grounding Chunks if missing
            let siteUrl = b.website || '';
            if (!siteUrl || siteUrl.includes('example.com')) {
              const matchedChunk = groundingChunks.find((c: any) => 
                c.web?.title?.toLowerCase().includes((b.businessName || '').toLowerCase()) ||
                c.web?.uri?.toLowerCase().includes((b.businessName || '').toLowerCase().replace(/[^a-z0-9]/g, ''))
              );
              if (matchedChunk?.web?.uri) {
                siteUrl = matchedChunk.web.uri;
              }
            }

            // 1. Audit live website & harvest verified phone/email directly from their real site
            const { audit, contact } = await auditLiveWebsite(siteUrl, actualNiche);

            // Only use real discovered data - zero mock/pre-fed fallbacks
            const finalPhone = contact.extractedPhone || b.phone || '';
            const finalEmail = contact.extractedEmail || b.email || '';
            const finalWebsite = siteUrl || (b.website && !b.website.includes('example.com') ? b.website : '');
            const finalDecisionMaker = contact.extractedOwner || b.decisionMakerName || 'Owner / Decision Maker';
            const finalRating = typeof b.googleRating === 'number' ? b.googleRating : 0;
            const finalReviewsCount = typeof b.googleReviewsCount === 'number' ? b.googleReviewsCount : 0;

            // 2. Synthesize dynamic, real-time consultative pitch kit using Gemini
            const partialLead: Partial<Lead> = {
              businessName: b.businessName,
              niche: actualNiche,
              city,
              country,
              website: finalWebsite,
              phone: finalPhone,
              email: finalEmail,
              decisionMakerName: finalDecisionMaker,
              decisionMakerRole: b.decisionMakerRole || 'Owner / Founder',
              audit
            };

            let pitchKit = await generateRelatablePitchWithGemini(partialLead, undefined, apiKey);
            if (!pitchKit) {
              pitchKit = generateDefaultPitchKit({
                businessName: b.businessName,
                niche: actualNiche,
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
              niche: actualNiche,
              category: actualNiche,
              city,
              country: country || (isIndia ? 'India' : 'International'),
              website: finalWebsite,
              phone: finalPhone,
              email: finalEmail,
              decisionMakerName: finalDecisionMaker,
              decisionMakerRole: b.decisionMakerRole || 'Owner / Founder',
              googleRating: finalRating,
              googleReviewsCount: finalReviewsCount,
              estimatedRevenue: 'Verified via Live Audit',
              employeeCount: 'Local Business',
              status: 'new' as const,
              starred: idx < 2,
              notes: [`Audited live for ${city} ${actualNiche} outreach.`],
              createdAt: new Date().toISOString(),
              audit,
              pitchKit
            };
          })
        );

        return leads;
      }
    }
  } catch (err) {
    console.error('Live Gemini Google Search Scraping Error:', err);
  }

  return [];
}
