import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  leads: defineTable({
    businessName: v.string(),
    niche: v.string(),
    category: v.optional(v.string()),
    city: v.string(),
    country: v.string(),
    website: v.string(),
    phone: v.string(),
    email: v.string(),
    decisionMakerName: v.string(),
    decisionMakerRole: v.string(),
    decisionMakerLinkedin: v.optional(v.string()),
    googleRating: v.optional(v.number()),
    googleReviewsCount: v.optional(v.number()),
    estimatedRevenue: v.optional(v.string()),
    employeeCount: v.optional(v.string()),
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
    customDealValue: v.optional(v.number()),
    createdAt: v.string(),
    lastContactedAt: v.optional(v.string()),
    audit: v.any(),
    pitchKit: v.any()
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

