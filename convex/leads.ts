import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const getLeads = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('leads').order('desc').collect();
  },
});

export const getLead = query({
  args: { id: v.id('leads') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const addLead = mutation({
  args: {
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
    createdAt: v.string(),
    lastContactedAt: v.optional(v.string()),
    audit: v.any(),
    pitchKit: v.any()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('leads', args);
  }
});

export const addLeads = mutation({
  args: {
    leads: v.array(v.any())
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('leads').collect();
    const existingNormNames = new Set(
      existing.map(doc => (doc.businessName || '').toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean)
    );
    const existingPhones = new Set(
      existing.map(doc => (doc.phone || '').replace(/[^0-9]/g, '')).filter(p => p.length >= 8)
    );

    const insertedIds = [];
    for (const lead of args.leads) {
      const { _id, _creationTime, id, ...rest } = lead;
      const bName = (rest.businessName || '').trim();
      const normName = bName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const rawPhone = (rest.phone || '').replace(/[^0-9]/g, '');

      // Prevent duplicate insertion if already exists in Convex
      if (normName && existingNormNames.has(normName)) {
        continue;
      }
      if (rawPhone && rawPhone.length >= 8 && existingPhones.has(rawPhone)) {
        continue;
      }

      const docId = await ctx.db.insert('leads', {
        businessName: bName || 'Business',
        niche: rest.niche || 'General',
        category: rest.category,
        city: rest.city || 'Vapi',
        country: rest.country || 'India',
        website: rest.website || '',
        phone: rest.phone || 'No Tel',
        email: rest.email || 'Not Listed',
        decisionMakerName: rest.decisionMakerName || 'Founder / Owner',
        decisionMakerRole: rest.decisionMakerRole || 'Owner',
        decisionMakerLinkedin: rest.decisionMakerLinkedin,
        googleRating: rest.googleRating,
        googleReviewsCount: rest.googleReviewsCount,
        estimatedRevenue: rest.estimatedRevenue,
        employeeCount: rest.employeeCount,
        status: rest.status || 'new',
        starred: !!rest.starred,
        notes: Array.isArray(rest.notes) ? rest.notes : [],
        createdAt: rest.createdAt || new Date().toISOString(),
        lastContactedAt: rest.lastContactedAt,
        audit: rest.audit || {},
        pitchKit: rest.pitchKit || {}
      });

      if (normName) existingNormNames.add(normName);
      if (rawPhone && rawPhone.length >= 8) existingPhones.add(rawPhone);
      insertedIds.push(docId);
    }
    return insertedIds;
  }
});

export const updateLead = mutation({
  args: {
    id: v.string(),
    updates: v.any()
  },
  handler: async (ctx, args) => {
    // Check if args.id is a direct Convex Id
    let targetDoc = null;
    try {
      targetDoc = await ctx.db.get(args.id as any);
    } catch {
      targetDoc = null;
    }

    if (!targetDoc) {
      // Find all and search
      const all = await ctx.db.query('leads').collect();
      targetDoc = all.find(doc => doc._id === args.id || (doc as any).id === args.id);
    }

    if (!targetDoc) return null;

    const { _id, _creationTime, id, ...patchData } = args.updates;
    await ctx.db.patch(targetDoc._id, patchData);
    return await ctx.db.get(targetDoc._id);
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
    id: v.string()
  },
  handler: async (ctx, args) => {
    let targetDoc = null;
    try {
      targetDoc = await ctx.db.get(args.id as any);
    } catch {
      targetDoc = null;
    }

    if (!targetDoc) {
      const all = await ctx.db.query('leads').collect();
      targetDoc = all.find(doc => doc._id === args.id || (doc as any).id === args.id);
    }

    if (targetDoc) {
      await ctx.db.delete(targetDoc._id);
      return true;
    }
    return false;
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

