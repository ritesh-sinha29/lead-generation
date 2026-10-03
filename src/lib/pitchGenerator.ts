import { SalesPitchKit, ServiceGap, ObjectionHandler, AffordabilityStrategy } from '@/types/lead';
import { getSettings } from './db';

interface GeneratePitchParams {
  businessName: string;
  niche: string;
  city: string;
  decisionMakerName: string;
  website: string;
  topGaps: ServiceGap[];
  primaryService: string;
}

export function generateDefaultPitchKit(params: GeneratePitchParams): SalesPitchKit {
  const { businessName, niche, city, decisionMakerName, topGaps } = params;
  
  const primaryGap = topGaps[0] || {
    service: 'chatbots',
    serviceTitle: '24/7 AI Lead & Booking Chatbot',
    detectedIssue: 'No automated after-hours lead capture or instant booking widget',
    impactExplanation: 'Losing 30-40% of high-intent weekend & evening visitors',
    estimatedLostRevenueMonthly: 3500,
    recommendedSolution: 'Deploy intelligent custom 24/7 voice/chat assistant',
    urgency: 'high'
  };

  const nameGreeting = decisionMakerName && decisionMakerName !== 'Business Owner' 
    ? decisionMakerName.split(' ')[0] 
    : 'there';

  // Specific "Smoking Gun" observation based on primary gap
  let smokingGun = '';
  let offerPackage = '';
  let price = '₹25,000 - ₹65,000';
  let roi = '3x - 5x ROI in 30 days (capturing 8-15 extra high-value clients/mo)';
  let timeline = '7 to 10 Business Days';

  switch (primaryGap.service) {
    case 'chatbots':
      smokingGun = `I tested your website last night at 9:30 PM. I looked for a way to instantly book an appointment or get quick pricing, but there was only a static contact form that takes 24 hours to get a response. In ${niche}, over 42% of inquiries bounce to a competitor if not answered within 5 minutes.`;
      offerPackage = '24/7 Conversational AI Appointment & Lead Intake Bot';
      price = '₹25,000 setup + ₹6,000/mo';
      roi = 'Estimated +12 to +25 extra qualified bookings each month';
      timeline = '5 to 7 Days';
      break;

    case 'calling_agents':
      smokingGun = `When prospective clients call ${businessName} after hours or while your team is on another line, there is no instant AI receptionist to qualify them and book appointments. 4 out of 5 first-time callers never leave a voicemail and immediately dial the next competitor on Google.`;
      offerPackage = 'AI Voice Receptionist & Missed-Call Auto-Recovery System';
      price = '₹45,000 setup + ₹12,000/mo';
      roi = 'Recovers 60-70% of missed inbound calls into booked consultations';
      timeline = '7 to 10 Days';
      break;

    case 'web_app':
      smokingGun = `Your current website takes over 4 seconds to load on mobile devices and the call-to-action is pushed down below the fold. Your competitors are converting 3x higher because modern mobile clients expect lightning-fast single-click action.`;
      offerPackage = 'High-Speed Modern Web App & Conversion Redesign';
      price = '₹35,000 - ₹75,000';
      roi = 'Drops bounce rate by 50% and doubles mobile conversion rates';
      timeline = '10 to 14 Days';
      break;

    case 'seo_aeo_geo':
      smokingGun = `I ran a Generative Engine Optimization (GEO) scan on ChatGPT and Perplexity for "best ${niche.toLowerCase()} in ${city}". Because your site lacks structured schema and AI search indexing, the AI models are recommending 2 of your local competitors instead of ${businessName}.`;
      offerPackage = 'Next-Gen SEO + AEO (Answer Engine) + GEO (AI Search) Engine';
      price = '₹25,000/month';
      roi = 'Captures top rankings across Google Search, ChatGPT, Perplexity & Apple Intelligence';
      timeline = 'Continuous (First results in 14 days)';
      break;

    case 'portfolio':
    default:
      smokingGun = `Your website has great potential, but it lacks interactive case studies, before/after proof sliders, and automated video testimonial carousels. Today's high-ticket clients buy based on tangible proof within the first 10 seconds of landing.`;
      offerPackage = 'High-Converting Authority Showcase & Portfolio Experience';
      price = '₹20,000 - ₹45,000';
      roi = 'Increases lead-to-consultation close rates by 35%';
      timeline = '7 Days';
      break;
  }

  // Client Affordability & Quote Sweet-Spot Calculation
  const isHighTicketNiche = /real estate|remodeling|realty|law|legal|luxury|clinic|aesthetic|implant|surgery/i.test(niche);
  const isMidMarketNiche = /spa|gym|fitness|dental|saas|tech/i.test(niche);

  const affordability: AffordabilityStrategy = isHighTicketNiche
    ? {
        clientBudgetTier: 'High-Ticket — High Buying Power',
        recommendedSweetSpotPrice: '₹45,000 setup + ₹12,000/mo retainer',
        minWalkawayPrice: '₹25,000 one-time setup',
        maxUpsellPrice: '₹95,000 full turnkey ecosystem',
        roiBreakEvenMath: `In ${niche}, their average transaction is high. Closing just 1 single extra client pays back your entire ₹45,000 fee.`,
        quoteOptions: [
          {
            tierName: 'Starter Setup',
            price: '₹25,000',
            description: 'Core 24/7 AI lead capture widget + standard CRM connection.'
          },
          {
            tierName: 'Full Growth Engine (Recommended)',
            price: '₹45,000 + ₹12,000/mo',
            description: 'Complete AI Voice + Chat assistant, GEO AI search optimization, monthly performance reporting.',
            isRecommended: true
          },
          {
            tierName: 'Enterprise Autopilot',
            price: '₹85,000 + ₹20,000/mo',
            description: 'Multi-location automated intake, instant missed-call recovery, full website redesign.'
          }
        ]
      }
    : isMidMarketNiche
    ? {
        clientBudgetTier: 'Mid-Market — Moderate Budget',
        recommendedSweetSpotPrice: '₹28,000 setup + ₹8,000/mo retainer',
        minWalkawayPrice: '₹18,000 setup',
        maxUpsellPrice: '₹60,000 complete system',
        roiBreakEvenMath: `They only need 1–2 extra appointments or bookings to recoup the full investment.`,
        quoteOptions: [
          {
            tierName: 'Essential Bot',
            price: '₹18,000',
            description: 'Standalone 24/7 WhatsApp & web booking widget.'
          },
          {
            tierName: 'Turnkey Pro (Recommended)',
            price: '₹28,000 + ₹8,000/mo',
            description: 'AI Booking Assistant + GEO Schema + Missed-call SMS auto-recovery.',
            isRecommended: true
          },
          {
            tierName: 'Custom Full Stack',
            price: '₹55,000 + ₹15,000/mo',
            description: 'Full web revamp + custom AI voice receptionist.'
          }
        ]
      }
    : {
        clientBudgetTier: 'Starter — Entry Local Business',
        recommendedSweetSpotPrice: '₹18,000 setup + ₹5,000/mo',
        minWalkawayPrice: '₹12,000 setup',
        maxUpsellPrice: '₹35,000',
        roiBreakEvenMath: `Capturing just 2–3 additional customer inquiries easily covers their investment.`,
        quoteOptions: [
          {
            tierName: 'Fast Start',
            price: '₹12,000',
            description: 'Basic interactive lead capture bot.'
          },
          {
            tierName: 'Pro Intake (Recommended)',
            price: '₹18,000 + ₹5,000/mo',
            description: 'Full AI appointment bot with WhatsApp notifications.',
            isRecommended: true
          }
        ]
      };

  // Objections Suite
  const objections: ObjectionHandler[] = [
    {
      objection: "We already have a web person / agency handling this.",
      whyTheySayIt: "Default reflex to protect budget or avoid confrontation.",
      exactResponseScript: `"Totally understand, ${nameGreeting}. Most successful ${niche.toLowerCase()} businesses do. We don't replace your web team—we specifically plug in specialized AI automations (like 24/7 instant booking & AI search visibility) that general web designers don't build. Would you be open to seeing a 60-second video of how it integrates alongside your current setup?"`,
      pivotToClose: "Offer a zero-obligation 60-second Loom video showing the exact integration."
    },
    {
      objection: "We get all our business through word of mouth.",
      whyTheySayIt: "They pride themselves on reputation, but are missing digital capture.",
      exactResponseScript: `"That's awesome—word of mouth is the best proof of quality. But here is what happens: when someone is referred to ${businessName}, they still Google you first. If they land on your site at 8 PM on a Sunday and can't instantly book, half of those warm referrals get distracted and never follow through. We ensure 100% of your referrals get captured immediately."`,
      pivotToClose: "Highlight revenue leakage from existing warm referrals."
    },
    {
      objection: "AI sounds too expensive / too complicated for us.",
      whyTheySayIt: "Fear of high maintenance and steep learning curve.",
      exactResponseScript: `"I hear you completely. We handle 100% of the build, setup, and maintenance. You don't need to learn any software—it automatically sends booked appointments and qualified leads directly to your WhatsApp or phone. Plus, it usually pays for itself with just 1 or 2 new clients."`,
      pivotToClose: "Emphasize zero-effort turnkey delivery with rapid payback."
    },
    {
      objection: "Can you just send me an email with the details?",
      whyTheySayIt: "Polite brush-off to get off the phone.",
      exactResponseScript: `"I'd be happy to send an email! So I don't send you a generic brochure, what's your biggest priority right now—getting more new client inquiries, or automating appointment booking so your team saves time?"`,
      pivotToClose: "Disarm with agreement, ask a qualifying question, then lock in email & follow-up time."
    },
    {
      objection: "We tried something like this before and it didn't work.",
      whyTheySayIt: "Burned by cheap generic freelancers or broken static forms.",
      exactResponseScript: `"I completely understand your frustration. The old-school rule-based bots from 2 years ago were clunky. What we build uses modern generative AI trained specifically on your business services, so it answers questions naturally like an expert sales assistant. If I can prove it to you on a test link with your own branding in 5 minutes, would that be worth a quick look?"`,
      pivotToClose: "Offer an interactive live sandbox with their brand name."
    }
  ];

  return {
    coldCallOpener: `“Hi ${nameGreeting}, this is [Your Name] from [Your Agency]. I know you weren't expecting my call, so I'll be super brief—do you have 30 seconds for why I'm reaching out regarding ${businessName}?”`,
    coldCallSmokingGun: smokingGun,
    coldCallValueProposition: `“We built a solution that automatically captures these high-intent leads and books them directly into your calendar 24/7 without needing extra staff.”`,
    coldCallMicroClose: `“I actually put together a quick 60-second interactive preview for ${businessName}. Can I text or email you the demo link so you can check it out on your own time?”`,
    emailSubjectLines: [
      `Quick observation regarding ${businessName}'s website`,
      `${nameGreeting} - quick question about ${niche} lead intake in ${city}`,
      `Fix for ${businessName}'s missed after-hours inquiries (60-sec preview)`
    ],
    emailBody: `Hi ${nameGreeting},

I came across ${businessName} while researching top ${niche.toLowerCase()} providers in ${city}.

I noticed a specific technical gap on your site that might be costing you warm clients:
→ ${smokingGun}

We specialize in solving this for ${niche.toLowerCase()} businesses by deploying:
✔ ${offerPackage} (Turnkey setup in ${timeline})
✔ Captures leads 24/7 and syncs directly to your phone/WhatsApp
✔ Estimated ROI: ${roi}

I put together a quick 60-second interactive preview showing how this would look on ${businessName}'s website.

Would you be opposed if I sent over the quick preview link?

Best regards,

[Your Name]
Tech Solutions & AI Automation
[Your Phone / WhatsApp] | [Your Portfolio URL]`,

    whatsappMessage: `Hi ${nameGreeting}! 👋 Came across ${businessName} while reviewing top ${niche.toLowerCase()} services in ${city}. 

Noticed a quick gap on your website where after-hours visitors can't instantly book or get immediate responses. 

We built a custom AI Assistant & modern tech setup that captures these leads 24/7 automatically. Built a quick 60-sec demo for ${businessName}—mind if I share the link here?`,

    linkedinDm: `Hi ${nameGreeting}, impressed by your work with ${businessName} in ${city}. 

Did a quick tech audit of your site and noticed an easy opportunity to boost your mobile conversions & AI search visibility (ChatGPT/Google) with modern AI automation. 

Put together a 60-sec proof-of-concept for you. Would you be open to checking it out?`,

    objections,
    recommendedPackageName: offerPackage,
    estimatedPrice: price,
    estimatedRoi: roi,
    deliveryTimeline: timeline,
    affordability
  };
}
