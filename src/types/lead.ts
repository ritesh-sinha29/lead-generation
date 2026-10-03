export type ServiceCategory = 
  | 'web_app' 
  | 'chatbots' 
  | 'calling_agents' 
  | 'portfolio' 
  | 'seo_aeo_geo';

export type LeadStatus = 
  | 'new' 
  | 'to_call' 
  | 'to_email' 
  | 'contacted' 
  | 'meeting_booked' 
  | 'closed_won' 
  | 'not_interested';

export type DateFilterOption = 
  | 'all' 
  | 'today' 
  | 'yesterday' 
  | 'last_7_days' 
  | 'last_30_days' 
  | 'this_month';

export interface ServiceGap {
  service: ServiceCategory;
  serviceTitle: string;
  detectedIssue: string;
  impactExplanation: string;
  estimatedLostRevenueMonthly: number;
  recommendedSolution: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface WebsiteAudit {
  loadTimeSeconds: number;
  mobileResponsive: boolean;
  hasLiveChat: boolean;
  hasAiBot: boolean;
  hasAutomatedBooking: boolean;
  hasSchemaMarkup: boolean;
  hasAiSearchVisibility: boolean; // AEO & GEO (Perplexity/ChatGPT)
  overallHealthScore: number; // 0 to 100
  topGaps: ServiceGap[];
}

export interface ObjectionHandler {
  objection: string;
  whyTheySayIt: string;
  exactResponseScript: string;
  pivotToClose: string;
}

export interface PricingTierOption {
  tierName: string;
  price: string;
  description: string;
  isRecommended?: boolean;
}

export interface AffordabilityStrategy {
  clientBudgetTier: string; // e.g. "High-Ticket ($$$)", "Mid-Market ($$)", "Starter ($)"
  recommendedSweetSpotPrice: string; // e.g. "$1,500 setup + $250/mo"
  minWalkawayPrice: string; // e.g. "$850 setup"
  maxUpsellPrice: string; // e.g. "$3,500 complete system"
  roiBreakEvenMath: string; // e.g. "Their avg ticket is $2,500. Just 1 single booked patient covers the full fee."
  quoteOptions: PricingTierOption[];
}

export interface CompetitorIntel {
  competitorName: string;
  website?: string;
  googleRating?: number;
  googleReviewsCount?: number;
  whyTheyAreWinning: string; // Key edge: e.g. 24/7 instant WhatsApp booking, 350+ reviews, top AI search ranking
  marketAdvantage: string; // e.g. Capturing 45% of after-hours inbound search traffic
  howWeBeatThem: string; // Specific tactical upgrade to leapfrog them
}

export interface CompetitorBenchmark {
  topCompetitors: CompetitorIntel[];
  ourDifferentiationStrategy: string; // High-converting pitch narrative on how our upgrade makes the prospect #1 in their city
  estimatedTimeToOvertake: string; // e.g. "30 to 45 Days post-launch"
}

export interface SalesPitchKit {
  // Cold Calling
  coldCallOpener: string;
  coldCallSmokingGun: string; // The specific technical flaw that shocks them
  coldCallValueProposition: string;
  coldCallMicroClose: string; // Low friction CTA: "Can I send you a 60-second video demo?"
  
  // Cold Email
  emailSubjectLines: string[];
  emailBody: string;
  
  // WhatsApp / SMS
  whatsappMessage: string;
  
  // LinkedIn / DM
  linkedinDm?: string;
  
  // Objection Handlers
  objections: ObjectionHandler[];
  
  // Offer & ROI
  recommendedPackageName: string;
  estimatedPrice: string;
  estimatedRoi: string;
  deliveryTimeline: string;

  // Exact Client Affordability & Quote Strategy
  affordability?: AffordabilityStrategy;

  // Local Competitor Benchmark & Outperform Blueprint
  competitorAnalysis?: CompetitorBenchmark;
}

export interface Lead {
  id: string;
  businessName: string;
  niche: string;
  category: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  decisionMakerName: string;
  decisionMakerRole: string;
  googleRating: number;
  googleReviewsCount: number;
  estimatedRevenue: string;
  employeeCount: string;
  
  // Audit & Gaps
  audit: WebsiteAudit;
  
  // AI Sales Battlecard
  pitchKit: SalesPitchKit;
  
  // CRM Tracking
  status: LeadStatus;
  starred: boolean;
  notes: string[];
  customDealValue?: number;
  lastContactedAt?: string;
  createdAt: string;
}

export function getLeadDealValue(lead: Lead): number {
  if (typeof lead.customDealValue === 'number' && !isNaN(lead.customDealValue) && lead.customDealValue > 0) {
    return lead.customDealValue;
  }
  const priceStr = lead.pitchKit?.affordability?.recommendedSweetSpotPrice || lead.pitchKit?.estimatedPrice || '';
  const match = priceStr.match(/₹?([0-9,]+)/);
  if (match) {
    const parsed = parseInt(match[1].replace(/,/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 45000;
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function sanitizeToINR(text: string | undefined | null): string {
  if (!text) return '';
  let res = text;
  
  // Replace tiers ($$$) -> (₹₹₹)
  res = res.replace(/\$\$\$/g, '₹₹₹').replace(/\$\$/g, '₹₹').replace(/\(\$\)/g, '(₹)');

  // Replace USD / Dollar amounts (e.g., "$1,500", "1,500 USD", "$950", "950 USD", "$300/mo", "300 USD/mo")
  res = res.replace(/\$([0-9,]+(?:\.\d+)?)\s*(USD)?/gi, (_match, numStr) => {
    const rawNum = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(rawNum)) return '₹45,000';
    const inrVal = Math.round((rawNum * 80) / 1000) * 1000;
    return `₹${inrVal.toLocaleString('en-IN')}`;
  });

  res = res.replace(/([0-9,]+)\s*USD/gi, (_match, numStr) => {
    const rawNum = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(rawNum)) return '₹45,000';
    const inrVal = Math.round((rawNum * 80) / 1000) * 1000;
    return `₹${inrVal.toLocaleString('en-IN')}`;
  });

  // Clean up any remaining USD / dollar mentions
  res = res.replace(/\bUSD\b/gi, 'INR');

  return res;
}

export function sanitizeLeadPricing(lead: Lead): Lead {
  if (!lead.pitchKit) return lead;
  const pk = lead.pitchKit;
  const aff = pk.affordability;
  return {
    ...lead,
    pitchKit: {
      ...pk,
      estimatedPrice: sanitizeToINR(pk.estimatedPrice),
      affordability: aff ? {
        ...aff,
        clientBudgetTier: sanitizeToINR(aff.clientBudgetTier),
        recommendedSweetSpotPrice: sanitizeToINR(aff.recommendedSweetSpotPrice),
        minWalkawayPrice: sanitizeToINR(aff.minWalkawayPrice),
        maxUpsellPrice: sanitizeToINR(aff.maxUpsellPrice),
        roiBreakEvenMath: sanitizeToINR(aff.roiBreakEvenMath),
        quoteOptions: (aff.quoteOptions || []).map(opt => ({
          ...opt,
          price: sanitizeToINR(opt.price),
          description: sanitizeToINR(opt.description)
        }))
      } : undefined
    }
  };
}


export interface GenerateLeadsRequest {
  niche: string;
  city: string;
  country?: string;
  count: number; // 10 to 20
  targetServices?: ServiceCategory[];
}

