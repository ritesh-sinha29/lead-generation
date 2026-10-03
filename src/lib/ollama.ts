import { SalesPitchKit, Lead } from '@/types/lead';
import { generateDefaultPitchKit } from './pitchGenerator';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

export interface OllamaGenerateResponse {
  pitchKit: SalesPitchKit;
  usedModel: string;
  source: 'ollama' | 'fallback_engine';
}

export async function checkOllamaStatus(): Promise<{ isOnline: boolean; models: string[] }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { isOnline: false, models: [] };
    }

    const data = await res.json();
    const models = (data.models || []).map((m: { name: string }) => m.name);
    return { isOnline: true, models };
  } catch {
    return { isOnline: false, models: [] };
  }
}

export async function generateCustomPitchWithOllama(
  lead: Lead,
  customInstructions?: string,
  preferredModel?: string
): Promise<OllamaGenerateResponse> {
  const { isOnline, models } = await checkOllamaStatus();
  
  // Pick the best model available or requested
  const targetModel = preferredModel || (models.length > 0 ? models[0] : 'deepseek-v4-pro:cloud');

  if (!isOnline) {
    // Return high-converting expert deterministic battlecard
    const defaultKit = generateDefaultPitchKit({
      businessName: lead.businessName,
      niche: lead.niche,
      city: lead.city,
      decisionMakerName: lead.decisionMakerName,
      website: lead.website,
      topGaps: lead.audit.topGaps,
      primaryService: lead.audit.topGaps[0]?.service || 'chatbots'
    });
    return {
      pitchKit: defaultKit,
      usedModel: 'Built-in Expert Engine',
      source: 'fallback_engine'
    };
  }

  const primaryGap = lead.audit.topGaps[0] || {
    serviceTitle: '24/7 AI Lead & Booking Chatbot',
    detectedIssue: 'No 24/7 automated inquiry capture',
    impactExplanation: 'Losing after-hours clients'
  };

  const prompt = `
You are a world-class agency sales closer selling high-value Tech & AI Solutions:
1. Web & App Development
2. AI Chatbots (24/7 booking & inquiry)
3. AI Voice Calling Agents (Missed call auto-recovery)
4. High-converting Portfolio Websites
5. SEO, AEO (Answer Engine Optimization) & GEO (Generative AI Search - ChatGPT, Perplexity)

Target Lead Details:
- Business: ${lead.businessName}
- Decision Maker: ${lead.decisionMakerName} (${lead.decisionMakerRole})
- Industry / Niche: ${lead.niche} in ${lead.city}
- Website: ${lead.website}
- Diagnosed Critical Gap: ${primaryGap.serviceTitle} - ${primaryGap.detectedIssue}
- Client Impact: ${primaryGap.impactExplanation}
${customInstructions ? `- Special Custom Instruction: ${customInstructions}` : ''}

Generate a hyper-persuasive, high-ticket closer kit. Respond ONLY in valid JSON with this exact structure:
{
  "coldCallOpener": "30-second permission-based hook addressing the owner by first name",
  "coldCallSmokingGun": "Specific technical observation explaining why they are losing high-ticket customers right now",
  "coldCallValueProposition": "Clear statement on how our tech captures those clients on autopilot",
  "coldCallMicroClose": "Low-friction ask (e.g. Can I text you a 60-second video demo showing how it works on your site?)",
  "emailSubjectLines": ["Subject Line 1", "Subject Line 2", "Subject Line 3"],
  "emailBody": "High-converting cold email body with personalized greeting, specific flaw, solution, and soft CTA",
  "whatsappMessage": "Short, punchy WhatsApp message with emojis",
  "linkedinDm": "Professional direct message hook",
  "objections": [
    {
      "objection": "We already have an agency / web person",
      "whyTheySayIt": "Defensive reflex",
      "exactResponseScript": "Word-for-word script showing we integrate specialized AI alongside their existing web person",
      "pivotToClose": "Offer a 60-second Loom preview"
    },
    {
      "objection": "We get all our business by word of mouth",
      "whyTheySayIt": "They think referrals don't need digital capture",
      "exactResponseScript": "Script explaining that referred clients still Google them and drop off if after-hours capture is missing",
      "pivotToClose": "Emphasize closing 100% of warm referrals"
    },
    {
      "objection": "AI is too expensive / complicated",
      "whyTheySayIt": "Fear of tech overhead",
      "exactResponseScript": "Script explaining turnkey done-for-you delivery with zero maintenance",
      "pivotToClose": "Show rapid payback with 1-2 clients"
    },
    {
      "objection": "Send me an email",
      "whyTheySayIt": "Polite brush-off",
      "exactResponseScript": "Agreement script with qualifying question to lock in specific follow-up",
      "pivotToClose": "Lock in email & follow-up time"
    },
    {
      "objection": "We tried this before and it didn't work",
      "whyTheySayIt": "Past bad experience with old static bots",
      "exactResponseScript": "Script distinguishing modern generative AI from old clunky tools",
      "pivotToClose": "Offer interactive sandbox preview"
    }
  ],
  "recommendedPackageName": "e.g. 24/7 AI Lead & Booking System",
  "estimatedPrice": "e.g. ₹28,000 - ₹55,000",
  "estimatedRoi": "e.g. +10 to +20 booked appointments/mo",
  "deliveryTimeline": "e.g. 7 Days Turnkey",
  "affordability": {
    "clientBudgetTier": "e.g. High-Ticket (₹₹₹) or Mid-Market (₹₹)",
    "recommendedSweetSpotPrice": "e.g. ₹45,000 setup + ₹12,000/mo",
    "minWalkawayPrice": "e.g. ₹25,000 setup",
    "maxUpsellPrice": "e.g. ₹95,000 full system",
    "roiBreakEvenMath": "e.g. Just 1 single client covers the entire ₹45,000 investment.",
    "quoteOptions": [
      {
        "tierName": "Starter Setup",
        "price": "₹25,000",
        "description": "Core 24/7 AI booking bot"
      },
      {
        "tierName": "Growth Package",
        "price": "₹45,000 + ₹12,000/mo",
        "description": "AI Voice + WhatsApp Booking Assistant",
        "isRecommended": true
      },
      {
        "tierName": "Full Authority System",
        "price": "₹85,000 + ₹20,000/mo",
        "description": "Comprehensive AI suite + Full GEO optimization"
      }
    ]
  }
}
CRITICAL: All prices and monetary amounts MUST strictly be formatted in Indian Rupees (₹), NEVER in dollars ($) or USD.
`;

  try {
    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: targetModel,
        prompt: prompt,
        stream: false,
        format: 'json'
      })
    });

    if (!res.ok) {
      throw new Error(`Ollama returned status ${res.status}`);
    }

    const data = await res.json();
    const parsed = JSON.parse(data.response) as SalesPitchKit;

    return {
      pitchKit: parsed,
      usedModel: targetModel,
      source: 'ollama'
    };
  } catch (err) {
    console.warn('Ollama generation fallback triggered:', err);
    const fallbackKit = generateDefaultPitchKit({
      businessName: lead.businessName,
      niche: lead.niche,
      city: lead.city,
      decisionMakerName: lead.decisionMakerName,
      website: lead.website,
      topGaps: lead.audit.topGaps,
      primaryService: lead.audit.topGaps[0]?.service || 'chatbots'
    });
    return {
      pitchKit: fallbackKit,
      usedModel: targetModel,
      source: 'fallback_engine'
    };
  }
}
