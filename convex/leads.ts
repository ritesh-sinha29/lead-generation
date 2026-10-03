import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const getLeads = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('leads').order('desc').collect();
  },
});

export const addLead = mutation({
  args: {
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
    audit: v.any(),
    pitchKit: v.any()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('leads', args);
  }
});

export const updateStatus = mutation({
  args: {
    id: v.id('leads'),
    status: v.union(
      v.literal('new'),
      v.literal('to_call'),
      v.literal('to_email'),
      v.literal('contacted'),
      v.literal('meeting_booked'),
      v.literal('closed_won'),
      v.literal('not_interested')
    ),
    lastContactedAt: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      lastContactedAt: args.lastContactedAt || new Date().toISOString()
    });
  }
});

export const toggleStar = mutation({
  args: {
    id: v.id('leads'),
    starred: v.boolean()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { starred: args.starred });
  }
});

export const addNote = mutation({
  args: {
    id: v.id('leads'),
    note: v.string()
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.id);
    if (!lead) return;
    const notes = [...(lead.notes || []), args.note];
    await ctx.db.patch(args.id, { notes });
  }
});

export const deleteLead = mutation({
  args: {
    id: v.id('leads')
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  }
});

export const clearAllLeads = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('leads').collect();
    for (const lead of all) {
      await ctx.db.delete(lead._id);
    }
    return { success: true, count: all.length };
  }
});
