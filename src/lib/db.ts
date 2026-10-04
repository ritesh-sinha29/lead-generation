import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';
import { Lead, sanitizeLeadPricing } from '@/types/lead';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://successful-canary-499.convex.cloud';

let clientInstance: ConvexHttpClient | null = null;

function getClient(): ConvexHttpClient | null {
  if (!CONVEX_URL) return null;
  if (clientInstance) return clientInstance;
  try {
    clientInstance = new ConvexHttpClient(CONVEX_URL);
    return clientInstance;
  } catch (e) {
    console.error('Failed to initialize ConvexHttpClient:', e);
    return null;
  }
}

export interface AppSettings {
  agencyName: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  portfolioUrl: string;
  defaultNiche: string;
  defaultCity: string;
  defaultBatchSize: number;
  aiProvider: 'gemini' | 'openai' | 'grok';
  geminiApiKey?: string;
  openaiApiKey?: string;
  grokApiKey?: string;
  currency: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  agencyName: 'Ixion Labs',
  senderName: 'Ritesh Sinha',
  senderPhone: '+91 7211164751',
  senderEmail: 'ritesh@ixionlabs.xyz',
  portfolioUrl: 'https://ixionlabs.xyz',
  defaultNiche: 'Top In-Demand Clients (Any Niche)',
  defaultCity: 'Vapi',
  defaultBatchSize: 15,
  aiProvider: 'gemini',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  grokApiKey: process.env.GROK_API_KEY || '',
  currency: 'INR'
};

// In-memory cache for ultra-fast synchronous reads when needed
let cachedSettings: AppSettings = { ...DEFAULT_SETTINGS };

export async function getLeads(): Promise<Lead[]> {
  const client = getClient();
  if (!client) {
    console.warn('Convex client not configured');
    return [];
  }

  try {
    const docs = await client.query(api.leads.getLeads);
    return (docs || []).map((doc: any) => {
      const leadObj: Lead = {
        ...doc,
        id: doc._id || doc.id,
        notes: Array.isArray(doc.notes) ? doc.notes : []
      };
      return sanitizeLeadPricing(leadObj);
    });
  } catch (e) {
    console.error('Error fetching leads from Convex:', e);
    return [];
  }
}

export async function addLeads(newLeads: Lead[]): Promise<Lead[]> {
  const client = getClient();
  if (!client) return [];

  try {
    await client.mutation(api.leads.addLeads, { leads: newLeads });
    return await getLeads();
  } catch (e) {
    console.error('Error adding leads to Convex:', e);
    return [];
  }
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const updated = await client.mutation(api.leads.updateLead, { id, updates });
    if (!updated) return null;
    const leadObj: Lead = {
      ...(updated as any),
      id: (updated as any)._id || id
    };
    return sanitizeLeadPricing(leadObj);
  } catch (e) {
    console.error('Error updating lead in Convex:', e);
    return null;
  }
}

export async function deleteLead(id: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false;

  try {
    const res = await client.mutation(api.leads.deleteLead, { id });
    return !!res;
  } catch (e) {
    console.error('Error deleting lead in Convex:', e);
    return false;
  }
}

export async function deleteLeads(ids: string[]): Promise<number> {
  const client = getClient();
  if (!client || ids.length === 0) return 0;

  try {
    const res = await client.mutation(api.leads.deleteLeads, { ids });
    return res?.count || 0;
  } catch (e) {
    console.error('Error batch deleting leads in Convex:', e);
    return 0;
  }
}

export async function clearAllLeads(): Promise<number> {
  const client = getClient();
  if (!client) return 0;

  try {
    const res = await client.mutation(api.leads.clearAllLeads, {});
    return res?.count || 0;
  } catch (e) {
    console.error('Error clearing all leads in Convex:', e);
    return 0;
  }
}

export function getSettings(): AppSettings {
  // Sync read using cache + env defaults
  return {
    ...cachedSettings,
    geminiApiKey: cachedSettings.geminiApiKey || process.env.GEMINI_API_KEY || '',
    grokApiKey: cachedSettings.grokApiKey || process.env.GROK_API_KEY || ''
  };
}

export async function getSettingsAsync(): Promise<AppSettings> {
  const client = getClient();
  if (!client) return getSettings();

  try {
    const remote = await client.query(api.settings.getSettings);
    if (remote) {
      cachedSettings = {
        ...DEFAULT_SETTINGS,
        ...(remote as any),
        geminiApiKey: (remote as any).geminiApiKey || process.env.GEMINI_API_KEY || '',
        grokApiKey: (remote as any).grokApiKey || process.env.GROK_API_KEY || ''
      };
    }
  } catch (e) {
    console.error('Error fetching settings from Convex:', e);
  }

  return getSettings();
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  cachedSettings = { ...cachedSettings, ...settings };
  
  // Persist asynchronously to Convex
  const client = getClient();
  if (client) {
    client.mutation(api.settings.saveSettings, {
      agencyName: cachedSettings.agencyName,
      senderName: cachedSettings.senderName,
      senderPhone: cachedSettings.senderPhone,
      senderEmail: cachedSettings.senderEmail,
      portfolioUrl: cachedSettings.portfolioUrl,
      defaultNiche: cachedSettings.defaultNiche,
      defaultCity: cachedSettings.defaultCity,
      defaultBatchSize: cachedSettings.defaultBatchSize,
      aiProvider: cachedSettings.aiProvider,
      geminiApiKey: cachedSettings.geminiApiKey,
      grokApiKey: cachedSettings.grokApiKey,
      currency: cachedSettings.currency
    }).catch(err => {
      console.error('Failed to save settings to Convex:', err);
    });
  }

  return cachedSettings;
}
