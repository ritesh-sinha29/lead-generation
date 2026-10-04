import { GoogleGenAI, Type, Schema } from '@google/genai';
import { Lead, SalesPitchKit, ServiceGap, WebsiteAudit } from '@/types/lead';
import { getSettings } from './db';

// Problem-Solving Pitch Generator using Google Gemini
export async function generateRelatablePitchWithGemini(
  lead: Partial<Lead>,
  customPrompt?: string,
  providedApiKey?: string
): Promise<SalesPitchKit | null> {
  const settings = getSettings();
  const apiKey = providedApiKey || process.env.GEMINI_API_KEY || settings.geminiApiKey || '';

  if (!apiKey) {
    console.warn('No Gemini API key provided, falling back to deterministic problem-solving engine.');
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const currency = 'INR';
    const currencySymbol = '₹';

    const systemInstruction = `You are an elite, consultative sales strategist for a modern AI & Web engineering agency (${settings.agencyName}).
Your task is to write hyper-relatable, consultative sales copy for decision-makers that feels 100% personalized, empathetic, and problem-focused.

CRITICAL REQUIREMENTS:
1. ALWAYS CALCULATE AND QUOTE IN INDIAN RUPEES (INR / ₹): Strictly format ALL prices, estimated revenue leaks, quotes, tiers, and financial figures in Indian Rupees (e.g., ₹45,000 setup + ₹12,000/mo retainer, ₹25,000, ₹85,000, ₹1.5 Lakhs). NEVER use dollars ($) or any non-rupee currency.
2. COMPETITOR BENCHMARKING: Identify who their 2 top local competitors in ${lead.city || 'their area'} are (or likely direct category rivals), explain why those competitors are growing / what makes them win (e.g. 24/7 instant WhatsApp response, higher review count, better search ranking), and provide the exact tactical playbook showing how our AI/Web upgrade will help this business leapfrog and beat them.
3. Focus 100% on the exact customer pain point: what friction or revenue leakage their business is experiencing right now in ₹.
4. Make the prospect feel: "This person actually took time to audit my exact site, understands my niche, analyzed my competitors, and has a concrete fix for my lost revenue."
5. Every cold call opener must be a polite pattern-interrupt with specific reference to their business.
6. Every smoking gun must point to a real, diagnosed flaw (e.g. after-hours lost bookings, missed phone calls bouncing to competitors, slow mobile load times, invisible on AI search).
7. Every email, WhatsApp pitch, and objection handler must be consultative, low-pressure, and conversational.`;

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

Generate a complete SalesPitchKit JSON object including competitorAnalysis.`;

    const pitchSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        coldCallOpener: { type: Type.STRING, description: 'Pattern interrupt cold call opener mentioning their business name and niche' },
        coldCallSmokingGun: { type: Type.STRING, description: 'The exact diagnosed problem/flaw and how it leaks money' },
        coldCallValueProposition: { type: Type.STRING, description: 'Consultative solution and how it recaptures lost customer inquiries' },
        coldCallMicroClose: { type: Type.STRING, description: 'Low friction call to action asking for 10 minutes or sending a video breakdown' },
        emailSubjectLines: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: '3 high-open, lowercase, non-spammy subject lines'
        },
        emailBody: { type: Type.STRING, description: 'Short, personalized consultative cold email body' },
        whatsappMessage: { type: Type.STRING, description: 'Casual, high-converting WhatsApp message ready to send' },
        recommendedPackageName: { type: Type.STRING, description: 'Tailored turnkey package name' },
        estimatedPrice: { type: Type.STRING, description: `Price range formatted in ${currencySymbol} (e.g. ${currencySymbol}35,000 - ${currencySymbol}65,000 setup)` },
        deliveryTimeline: { type: Type.STRING, description: 'Implementation timeframe' },
        estimatedRoi: { type: Type.STRING, description: 'Conservative projected return' },
        affordability: {
          type: Type.OBJECT,
          description: 'Pricing strategy and exact quote recommendations tailored to client budget',
          properties: {
            clientBudgetTier: { type: Type.STRING, description: 'e.g. High-Ticket, Mid-Market, Starter' },
            recommendedSweetSpotPrice: { type: Type.STRING, description: `e.g. ${currencySymbol}45,000 setup + ${currencySymbol}12,000/mo retainer` },
            minWalkawayPrice: { type: Type.STRING, description: `e.g. ${currencySymbol}25,000 setup` },
            maxUpsellPrice: { type: Type.STRING, description: `e.g. ${currencySymbol}95,000 full system` },
            roiBreakEvenMath: { type: Type.STRING, description: 'e.g. Just 1 new client booked covers the full cost' },
            quoteOptions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tierName: { type: Type.STRING },
                  price: { type: Type.STRING },
                  description: { type: Type.STRING },
                  isRecommended: { type: Type.BOOLEAN }
                },
                required: ['tierName', 'price', 'description']
              }
            }
          },
          required: ['clientBudgetTier', 'recommendedSweetSpotPrice', 'minWalkawayPrice', 'maxUpsellPrice', 'roiBreakEvenMath', 'quoteOptions']
        },
        competitorAnalysis: {
          type: Type.OBJECT,
          description: 'Detailed analysis of local competitors, why they are growing, and how we help this business outperform them',
          properties: {
            ourDifferentiationStrategy: { type: Type.STRING, description: 'Strategic narrative on how our upgrade makes them the undisputed #1 choice in their city' },
            estimatedTimeToOvertake: { type: Type.STRING, description: 'e.g. 30 to 45 Days post-launch' },
            topCompetitors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  competitorName: { type: Type.STRING, description: 'Name of the rival local business' },
                  whyTheyAreWinning: { type: Type.STRING, description: 'What advantages they currently have (e.g. 24/7 WhatsApp response, 300+ reviews, top AI search ranking)' },
                  marketAdvantage: { type: Type.STRING, description: 'e.g. Capturing 40% of evening searches' },
                  howWeBeatThem: { type: Type.STRING, description: 'Concrete technological edge we deploy to leapfrog them' }
                },
                required: ['competitorName', 'whyTheyAreWinning', 'marketAdvantage', 'howWeBeatThem']
              }
            }
          },
          required: ['ourDifferentiationStrategy', 'estimatedTimeToOvertake', 'topCompetitors']
        },
        objections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              objection: { type: Type.STRING },
              whyTheySayIt: { type: Type.STRING },
              exactResponseScript: { type: Type.STRING },
              pivotToClose: { type: Type.STRING }
            },
            required: ['objection', 'whyTheySayIt', 'exactResponseScript', 'pivotToClose']
          }
        }
      },
      required: [
        'coldCallOpener',
        'coldCallSmokingGun',
        'coldCallValueProposition',
        'coldCallMicroClose',
        'emailSubjectLines',
        'emailBody',
        'whatsappMessage',
        'recommendedPackageName',
        'estimatedPrice',
        'deliveryTimeline',
        'estimatedRoi',
        'objections'
      ]
    };

    // Text/generation models only (exclude specialized audio, realtime, tts, embedding)
    const isSpecializedModel = (name: string) => {
      const lower = name.toLowerCase();
      return (
        lower.includes('live') ||
        lower.includes('audio') ||
        lower.includes('tts') ||
        lower.includes('embed') ||
        lower.includes('realtime') ||
        lower.includes('image') ||
        lower.includes('customtools') ||
        lower.includes('robotics') ||
        lower.includes('clip')
      );
    };

    let candidateModels = [
      'gemini-flash-latest',
      'gemini-3.5-flash',
      'gemini-3-flash-preview',
      'gemini-3.1-pro-preview',
      'gemini-flash-lite-latest',
      'gemini-pro-latest',
      'gemini-2.5-flash',
      'gemini-2.5-pro'
    ];

    try {
      const modelPager = await ai.models.list();
      const discovered: string[] = [];
      if (modelPager) {
        for await (const m of modelPager) {
          const rawName = (m.name || '').replace(/^models\//, '');
          if (rawName && !isSpecializedModel(rawName)) {
            const methods = (m as any).supportedGenerationMethods || (m as any).supportedActions;
            if (!methods || methods.includes('generateContent')) {
              if (rawName.includes('flash')) {
                discovered.unshift(rawName);
              } else {
                discovered.push(rawName);
              }
            }
          }
        }
      }
      if (discovered.length > 0) {
        candidateModels = Array.from(new Set([...discovered, ...candidateModels]));
      }
    } catch (e) {
      console.warn('Model auto-discovery skipped, using latest text model aliases');
    }

    let response: any = null;

    for (const model of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: pitchSchema,
            temperature: 0.7,
          }
        });
        if (response && response.text) {
          break;
        }
      } catch (err) {
        console.warn(`Pitch model ${model} failed, trying next candidate...`, err instanceof Error ? err.message : err);
      }
    }

    if (response && response.text) {
      const parsed = JSON.parse(response.text) as SalesPitchKit;
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('Gemini Pitch Generation Error:', err);
    return null;
  }
}
