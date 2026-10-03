import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  leads: defineTable({
    businessName: v.string(),
    niche: v.string(),
    city: v.string(),
    country: v.string(),
    website: v.string(),
    phone: v.string(),
    email: v.string(),
    decisionMakerName: v.string(),
    decisionMakerRole: v.string(),
    decisionMakerLinkedin: v.optional(v.string()),
    status: v.union(
      v.literal('new'),
      v.literal('to_call'),
      v.literal('to_email'),
      v.literal('contacted'),
      v.literal('meeting_booked'),
      v.literal('closed_won'),
      v.literal('not_interested')
    ),
    starred: v.boolean(),
    notes: v.array(v.string()),
    createdAt: v.string(),
    lastContactedAt: v.optional(v.string()),
    audit: v.object({
      overallHealthScore: v.number(),
      hasLiveChat: v.boolean(),
      hasAiBot: v.boolean(),
      hasAutomatedBooking: v.boolean(),
      hasSchemaMarkup: v.boolean(),
      hasAiSearchVisibility: v.boolean(),
      mobileResponsive: v.boolean(),
      loadTimeSeconds: v.number(),
      topGaps: v.array(
        v.object({
          service: v.union(
            v.literal('chatbots'),
            v.literal('calling_agents'),
            v.literal('web_app'),
            v.literal('seo_aeo_geo'),
            v.literal('portfolio')
          ),
          serviceTitle: v.string(),
          detectedIssue: v.string(),
          impactExplanation: v.string(),
          estimatedLostRevenueMonthly: v.number(),
          recommendedSolution: v.string(),
          urgency: v.union(v.literal('low'), v.literal('medium'), v.literal('high'))
        })
      )
    }),
    pitchKit: v.object({
      coldCallOpener: v.string(),
      coldCallSmokingGun: v.string(),
      coldCallValueProposition: v.string(),
      coldCallMicroClose: v.string(),
      emailSubjectLines: v.array(v.string()),
      emailBody: v.string(),
      whatsappMessage: v.string(),
      recommendedPackageName: v.string(),
      estimatedPrice: v.string(),
      deliveryTimeline: v.string(),
      estimatedRoi: v.string(),
      objections: v.array(
        v.object({
          objection: v.string(),
          whyTheySayIt: v.string(),
          exactResponseScript: v.string(),
          pivotToClose: v.string()
        })
      )
    })
  })
    .index('by_status', ['status'])
    .index('by_starred', ['starred'])
    .index('by_niche', ['niche']),

  settings: defineTable({
    agencyName: v.string(),
    senderName: v.string(),
    senderPhone: v.string(),
    senderEmail: v.string(),
    portfolioUrl: v.string(),
    defaultNiche: v.string(),
    defaultCity: v.string(),
    defaultBatchSize: v.number(),
    aiProvider: v.string(),
    geminiApiKey: v.optional(v.string()),
    grokApiKey: v.optional(v.string()),
    ollamaModel: v.string(),
    currency: v.string()
  })
});
