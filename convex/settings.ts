import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query('settings').first();
    return records;
  },
});

export const saveSettings = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('settings').first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      return await ctx.db.insert('settings', args);
    }
  }
});
