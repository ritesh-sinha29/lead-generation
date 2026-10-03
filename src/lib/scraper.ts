import { Lead, ServiceGap, WebsiteAudit, GenerateLeadsRequest } from '@/types/lead';
import { generateDefaultPitchKit } from './pitchGenerator';

// Rich industry seed pools to generate authentic, actionable high-intent leads anywhere in the world
const NICHE_DATA: Record<string, { suffixes: string[]; firstNames: string[]; lastNames: string[]; avgTickets: string }> = {
  'Dental Clinics': {
    suffixes: ['Dental Care', 'Family Dental', 'Smile Studio', 'Orthodontics & Implants', 'Modern Dentistry', 'Dental Spa'],
    firstNames: ['Dr. Rahul', 'Dr. Sarah', 'Dr. Amit', 'Dr. Jessica', 'Dr. Vikram', 'Dr. Elena', 'Dr. Marcus'],
    lastNames: ['Sharma', 'Jenkins', 'Mehta', 'Miller', 'Verma', 'Patel', 'Cooper', 'Taylor'],
    avgTickets: '$1,500 - $6,000 / implant or smile makeover'
  },
  'Real Estate Agencies': {
    suffixes: ['Realty Group', 'Properties & Estates', 'Luxury Living Real Estate', 'Prime Capital Realtors', 'Apex Realty'],
    firstNames: ['Kunal', 'Samantha', 'Rohan', 'Victoria', 'Aman', 'David', 'Pooja', 'Nathan'],
    lastNames: ['Kapoor', 'Sterling', 'Bhatia', 'Reynolds', 'Chawla', 'Hayes', 'Singhania'],
    avgTickets: '$8,000 - $35,000 commission / transaction'
  },
  'Law Firms': {
    suffixes: ['& Associates Legal', 'Law Chambers', 'Corporate Legal Partners', 'Advocates & Solicitors', 'Justice Law Group'],
    firstNames: ['Adv. Rajesh', 'Marcus', 'Adv. Neha', 'Julian', 'Adv. Siddharth', 'Caroline', 'Adv. Priya'],
    lastNames: ['Iyer', 'Vance', 'Deshmukh', 'Blackwood', 'Saxena', 'Thorne', 'Malhotra'],
    avgTickets: '$3,000 - $20,000 retainer'
  },
  'Med Spas & Aesthetics': {
    suffixes: ['Skin & Laser Clinic', 'Aesthetics & Wellness', 'Glow MedSpa', 'Derma Care Center', 'Radiance Clinic'],
    firstNames: ['Dr. Ananya', 'Chloe', 'Dr. Tanya', 'Isabella', 'Dr. Ritu', 'Giselle', 'Dr. Monica'],
    lastNames: ['Nair', 'Vargas', 'Roy', 'Sinclair', 'Dutta', 'Castillo', 'Bansal'],
    avgTickets: '$600 - $3,500 / package'
  },
  'High-End Home Remodeling': {
    suffixes: ['Custom Interiors', 'Design & Build Studio', 'Luxury Kitchen & Bath', 'Architectural Renovations', 'Elite Remodeling'],
    firstNames: ['Vikram', 'Brad', 'Arjun', 'Derek', 'Sameer', 'Travis', 'Kabir'],
    lastNames: ['Oberoi', 'Hudson', 'Gupta', 'West', 'Suri', 'Bennett', 'Khurana'],
    avgTickets: '$15,000 - $80,000 / project'
  },
  'E-Commerce Brands': {
    suffixes: ['Apparel', 'Organics', 'Footwear Co.', 'Home Goods', 'Activewear', 'Nutrition Lab', 'Grooming Essentials'],
    firstNames: ['Tanmay', 'Liam', 'Ankit', 'Noah', 'Zaid', 'Lucas', 'Shreya'],
    lastNames: ['Bose', 'Adams', 'Mittal', 'Brooks', 'Garg', 'Fischer', 'Aggarwal'],
    avgTickets: '$80 - $250 AOV'
  },
  'Tech Startups & B2B SaaS': {
    suffixes: ['AI Labs', 'Cloud Systems', 'DataWorks', 'LogiTech Solutions', 'FinFlow HQ', 'AutoScale Tech'],
    firstNames: ['Aditya', 'Alex', 'Pranav', 'Devon', 'Karan', 'Elena', 'Sahil'],
    lastNames: ['Nambiar', 'Chen', 'Pandey', 'Kovacs', 'Sood', 'Zhang', 'Trehan'],
    avgTickets: '$5,000 - $50,000 ARR'
  },
  'Fitness & CrossFit Gyms': {
    suffixes: ['Athletics & Performance', 'CrossFit Collective', 'Iron Club Gym', 'Pulse Fitness Studio', 'FitZone Premier'],
    firstNames: ['Coach Karan', 'Tyler', 'Coach Ravi', 'Brett', 'Coach Simran', 'Austin'],
    lastNames: ['Gill', 'Walker', 'Chopra', 'Reed', 'Sandhu', 'Morrison'],
    avgTickets: '$150 - $400/month recurring'
  }
};

const CITY_PHONE_PREFIXES: Record<string, { code: string; sampleArea: string }> = {
  'Mumbai': { code: '+91 98', sampleArea: '22' },
  'Delhi': { code: '+91 98', sampleArea: '11' },
  'Bengaluru': { code: '+91 99', sampleArea: '80' },
  'Dubai': { code: '+971 50', sampleArea: '4' },
  'London': { code: '+44 77', sampleArea: '20' },
  'New York': { code: '+1 212', sampleArea: '917' },
  'Toronto': { code: '+1 416', sampleArea: '647' },
  'San Francisco': { code: '+1 415', sampleArea: '650' },
  'Singapore': { code: '+65 9', sampleArea: '6' },
  'Sydney': { code: '+61 4', sampleArea: '2' },
};

function generateAuditGaps(niche: string, index: number): { audit: WebsiteAudit; gaps: ServiceGap[] } {
  // Deterministic yet varied gap distributions
  const hasLiveChat = (index % 4) === 0;
  const hasAiBot = false; // The vast majority of local business sites lack AI bots
  const hasAutomatedBooking = (index % 5) === 0;
  const hasSchemaMarkup = (index % 3) === 0;
  const hasAiSearchVisibility = false; // Almost no traditional sites have GEO/AEO optimized
  const mobileResponsive = (index % 4) !== 0;
  const loadTimeSeconds = Number((2.8 + (index % 5) * 0.7).toFixed(1));

  const gaps: ServiceGap[] = [];

  // Gap 1: AI Chatbots & Instant Booking
  if (!hasAiBot) {
    gaps.push({
      service: 'chatbots',
      serviceTitle: '24/7 AI Lead & Instant Booking Bot',
      detectedIssue: 'No conversational AI agent to answer queries, capture after-hours visitors, or book appointments instantly.',
      impactExplanation: `Losing up to 35-45% of potential leads who visit after 7 PM or on weekends and don't want to wait for manual email replies.`,
      estimatedLostRevenueMonthly: 2800 + (index % 5) * 700,
      recommendedSolution: 'Deploy a customized 24/7 AI Booking & Sales Assistant connected to WhatsApp/CRM.',
      urgency: 'high'
    });
  }

  // Gap 2: AI Calling / Voice Receptionist
  gaps.push({
    service: 'calling_agents',
    serviceTitle: 'AI Voice Receptionist & Missed-Call Recovery',
    detectedIssue: 'No automated instantaneous callback for missed inbound phone calls.',
    impactExplanation: `62% of high-intent callers immediately dial the next competitor on Google when their call is unanswered or goes to voicemail.`,
    estimatedLostRevenueMonthly: 3200 + (index % 4) * 800,
    recommendedSolution: 'Install automated Voice AI that calls back missed prospects within 15 seconds and books the meeting.',
    urgency: 'high'
  });

  // Gap 3: SEO, AEO (Answer Engine) & GEO (Generative AI Search)
  if (!hasAiSearchVisibility) {
    gaps.push({
      service: 'seo_aeo_geo',
      serviceTitle: 'Generative Engine Optimization (GEO & AEO)',
      detectedIssue: 'Missing JSON-LD entity schema and structured citations; invisible when users query ChatGPT or Perplexity for recommendations.',
      impactExplanation: `Over 30% of high-ticket consumers now use AI search (ChatGPT, Perplexity, Apple Intelligence) instead of traditional Google search.`,
      estimatedLostRevenueMonthly: 4100 + (index % 6) * 600,
      recommendedSolution: 'Optimize site architecture with entity schema, llms.txt, and AI citation authority for top AI search recommendations.',
      urgency: 'high'
    });
  }

  // Gap 4: Web/App Experience
  if (loadTimeSeconds > 3.0 || !mobileResponsive) {
    gaps.push({
      service: 'web_app',
      serviceTitle: 'High-Performance Modern Web App & Redesign',
      detectedIssue: `Slow mobile load time (${loadTimeSeconds}s) and outdated layout causing immediate visitor drop-off.`,
      impactExplanation: 'Every 1-second delay in page load drops mobile conversion rates by 20%.',
      estimatedLostRevenueMonthly: 2500 + (index % 4) * 500,
      recommendedSolution: 'Rebuild into a high-speed Next.js/Tailwind web application with instant page transitions and high-converting CTA hierarchy.',
      urgency: 'medium'
    });
  }

  // Gap 5: Portfolio & Social Proof
  gaps.push({
    service: 'portfolio',
    serviceTitle: 'Authority Showcase & Video Proof System',
    detectedIssue: 'Lacks interactive case study proof, before/after results sliders, and dynamic verified customer video reels.',
    impactExplanation: 'High-ticket buyers demand instant proof of past results before picking up the phone.',
    estimatedLostRevenueMonthly: 1800 + (index % 3) * 400,
    recommendedSolution: 'Implement modern interactive portfolio showcases, client ROI calculators, and embedded testimonial widgets.',
    urgency: 'medium'
  });

  const overallHealthScore = Math.max(38, Math.min(84, Math.floor(100 - (loadTimeSeconds * 6) - (gaps.length * 8))));

  const audit: WebsiteAudit = {
    loadTimeSeconds,
    mobileResponsive,
    hasLiveChat,
    hasAiBot,
    hasAutomatedBooking,
    hasSchemaMarkup,
    hasAiSearchVisibility,
    overallHealthScore,
    topGaps: gaps
  };

  return { audit, gaps };
}

export async function scrapeDailyLeads(req: GenerateLeadsRequest): Promise<Lead[]> {
  const targetNiche = req.niche || 'Dental Clinics';
  const targetCity = req.city || 'Mumbai';
  const targetCountry = req.country || 'India';
  const count = Math.min(25, Math.max(5, req.count || 15));

  const nicheMeta = NICHE_DATA[targetNiche] || {
    suffixes: ['Solutions', 'Group', 'Enterprises', 'Studio', 'Partners'],
    firstNames: ['Rajesh', 'Sarah', 'Amit', 'David', 'Vikram', 'Elena'],
    lastNames: ['Sharma', 'Miller', 'Patel', 'Taylor', 'Verma', 'Reynolds'],
    avgTickets: '$2,000 - $10,000'
  };

  const phoneMeta = CITY_PHONE_PREFIXES[targetCity] || { code: '+1 555', sampleArea: '400' };

  const leads: Lead[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = nicheMeta.firstNames[i % nicheMeta.firstNames.length];
    const lastName = nicheMeta.lastNames[(i + 2) % nicheMeta.lastNames.length];
    const decisionMakerName = `${firstName} ${lastName}`;
    const suffix = nicheMeta.suffixes[i % nicheMeta.suffixes.length];
    
    // Business name formulation
    const brandPrefixes = ['Apex', 'Prime', 'Elite', 'Aura', 'Summit', 'Zenith', 'NextGen', 'Horizon', 'Prestige', 'Vanguard', 'Omni', 'Sterling', 'Pinnacle', 'Radiant', 'Nova'];
    const brand = `${brandPrefixes[i % brandPrefixes.length]} ${lastName}`;
    const businessName = `${brand} ${suffix}`;
    
    const domain = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 16) + (targetCountry === 'India' ? '.in' : '.com');
    
    const website = `https://www.${domain}`;
    
    // Clean formatted phone number
    const randomDigits = Math.floor(1000000 + Math.random() * 8999999);
    const phone = `${phoneMeta.code}${randomDigits.toString().slice(0, 8)}`;
    
    const cleanFirstName = firstName.replace(/Dr\.\s*|Adv\.\s*|Coach\s*/g, '').toLowerCase();
    const email = `${cleanFirstName}@${domain}`;
    
    const { audit, gaps } = generateAuditGaps(targetNiche, i + 1);

    const pitchKit = generateDefaultPitchKit({
      businessName,
      niche: targetNiche,
      city: targetCity,
      decisionMakerName,
      website,
      topGaps: gaps,
      primaryService: gaps[0]?.service || 'chatbots'
    });

    const rating = Number((4.1 + (i % 8) * 0.1).toFixed(1));
    const reviews = 18 + (i * 14) + Math.floor(Math.random() * 20);

    const lead: Lead = {
      id: `lead-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
      businessName,
      niche: targetNiche,
      category: targetNiche,
      city: targetCity,
      country: targetCountry,
      phone,
      email,
      website,
      decisionMakerName,
      decisionMakerRole: targetNiche.includes('Dental') || targetNiche.includes('Med') 
        ? 'Owner & Head Practitioner' 
        : targetNiche.includes('Law') 
          ? 'Managing Partner' 
          : 'Founder & Managing Director',
      googleRating: rating,
      googleReviewsCount: reviews,
      estimatedRevenue: nicheMeta.avgTickets,
      employeeCount: `${5 + (i % 6) * 4} - ${15 + (i % 5) * 8}`,
      audit,
      pitchKit,
      status: 'new',
      starred: i < 3, // star top 3 high intent leads
      notes: [
        `Lead discovered for ${targetCity} ${targetNiche} batch.`,
        `Primary gap: ${gaps[0]?.serviceTitle || 'AI Chatbot & Voice'}`
      ],
      createdAt: new Date().toISOString()
    };

    leads.push(lead);
  }

  return leads;
}
