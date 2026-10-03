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
  linkedinDm: string;
  
  // Objection Handlers
  objections: ObjectionHandler[];
  
  // Offer & ROI
  recommendedPackageName: string;
  estimatedPrice: string;
  estimatedRoi: string;
  deliveryTimeline: string;
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
  lastContactedAt?: string;
  createdAt: string;
}

export interface GenerateLeadsRequest {
  niche: string;
  city: string;
  country?: string;
  count: number; // 10 to 20
  targetServices?: ServiceCategory[];
  useOllama?: boolean;
  ollamaModel?: string;
}

export interface OllamaModelInfo {
  name: string;
  size?: number;
  modified_at?: string;
}
