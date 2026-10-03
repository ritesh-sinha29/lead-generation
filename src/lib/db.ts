import fs from 'fs';
import path from 'path';
import { Lead } from '@/types/lead';
import { scrapeDailyLeads } from './scraper';

const DATA_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

export interface AppSettings {
  agencyName: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  portfolioUrl: string;
  defaultNiche: string;
  defaultCity: string;
  defaultBatchSize: number;
  aiProvider: 'gemini' | 'grok' | 'ollama';
  geminiApiKey?: string;
  grokApiKey?: string;
  ollamaModel: string;
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
  geminiApiKey: '',
  grokApiKey: '',
  ollamaModel: 'deepseek-v4-pro:cloud',
  currency: 'INR'
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function getLeads(): Promise<Lead[]> {
  ensureDataDir();
  if (!fs.existsSync(LEADS_FILE)) {
    saveLeads([]);
    return [];
  }

  try {
    const raw = fs.readFileSync(LEADS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading leads file:', e);
    return [];
  }
}

export function saveLeads(leads: Lead[]): void {
  ensureDataDir();
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
}

export async function addLeads(newLeads: Lead[]): Promise<Lead[]> {
  const current = await getLeads();
  // Prepend new leads so latest batch shows at top
  const combined = [...newLeads, ...current];
  saveLeads(combined);
  return combined;
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  const leads = await getLeads();
  const index = leads.findIndex((l) => l.id === id);
  if (index === -1) return null;

  leads[index] = { ...leads[index], ...updates };
  saveLeads(leads);
  return leads[index];
}

export async function deleteLead(id: string): Promise<boolean> {
  const leads = await getLeads();
  const filtered = leads.filter((l) => l.id !== id);
  saveLeads(filtered);
  return true;
}

export function getSettings(): AppSettings {
  ensureDataDir();
  if (!fs.existsSync(SETTINGS_FILE)) {
    try {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing default settings:', e);
    }
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  ensureDataDir();
  let current = DEFAULT_SETTINGS;
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      current = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      current = DEFAULT_SETTINGS;
    }
  }
  const updated = { ...current, ...settings };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}
