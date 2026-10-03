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

    const systemInstruction = `You are an elite, consultative sales strategist for a modern AI & Web engineering agency (${settings.agencyName}).
Your task is to write hyper-relatable, consultative sales copy for decision-makers that feels 100% personalized, empathetic, and problem-focused.

CRITICAL TONE REQUIREMENTS:
1. Avoid generic agency buzzwords ("synergy", "cutting-edge", "game-changer", "unleash").
2. Focus 100% on the exact customer pain point: what friction or revenue leakage their business is experiencing right now.
3. Make the prospect feel: "This person actually took time to audit my exact site, understands my niche, and has a concrete fix for my lost revenue."
4. Every cold call opener must be a polite pattern-interrupt with specific reference to their business.
5. Every smoking gun must point to a real, diagnosed flaw (e.g. after-hours lost bookings, missed phone calls bouncing to competitors, slow mobile load times, invisible on AI search).
6. Every email, WhatsApp pitch, and objection handler must be consultative, low-pressure, and conversational.`;

    const prompt = `Business Details:
- Name: ${lead.businessName}
- Niche/Industry: ${lead.niche}
- City: ${lead.city}, ${lead.country}
- Decision Maker: ${lead.decisionMakerName} (${lead.decisionMakerRole})
- Phone: ${lead.phone}
- Website: ${lead.website}
- Diagnosed Vulnerabilities: ${JSON.stringify(lead.audit?.topGaps || [])}
- Overall Tech Readiness Score: ${lead.audit?.overallHealthScore}/100

Custom Goal/Instruction: ${customPrompt || 'Craft a deeply relatable, empathetic pitch solving their primary technical leak.'}

Generate a complete SalesPitchKit JSON object.`;

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
        estimatedPrice: { type: Type.STRING, description: 'Price range matching niche average tickets' },
        deliveryTimeline: { type: Type.STRING, description: 'Implementation timeframe' },
        estimatedRoi: { type: Type.STRING, description: 'Conservative projected return' },
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: pitchSchema,
        temperature: 0.7,
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text) as SalesPitchKit;
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('Gemini Pitch Generation Error:', err);
    return null;
  }
}
