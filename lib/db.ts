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
  ollamaModel: string;
  currency: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  agencyName: 'Apex AI & Web Solutions',
  senderName: 'Ritesh Sinha',
  senderPhone: '+91 98765 43210',
  senderEmail: 'ritesh@apexsolutions.dev',
  portfolioUrl: 'https://apexsolutions.dev',
  defaultNiche: 'Dental Clinics',
  defaultCity: 'Mumbai',
  defaultBatchSize: 15,
  ollamaModel: 'deepseek-v4-pro:cloud',
  currency: 'USD'
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function getLeads(): Promise<Lead[]> {
  ensureDataDir();
  if (!fs.existsSync(LEADS_FILE)) {
    // Generate initial initial batch of 15 high-converting leads to get started immediately
    const initialLeads = await scrapeDailyLeads({
      niche: 'Dental Clinics',
      city: 'Mumbai',
      country: 'India',
      count: 15
    });
    saveLeads(initialLeads);
    return initialLeads;
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
    saveSettings(DEFAULT_SETTINGS);
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
  const current = getSettings();
  const updated = { ...current, ...settings };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}
