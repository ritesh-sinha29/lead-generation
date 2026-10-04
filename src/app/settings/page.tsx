'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings as SettingsIcon, 
  Save, 
  Cpu, 
  Building, 
  Check, 
  Key,
  Menu,
  X
} from 'lucide-react';
import { AppSettings } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DashboardSidebar } from '@/modules/dashboard';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
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
    openaiApiKey: '',
    grokApiKey: '',
    currency: 'INR'
  });

  const [aiOnline, setAiOnline] = useState(false);
  const [activeModel, setActiveModel] = useState('gemini-flash');
  const [hasEnvGeminiKey, setHasEnvGeminiKey] = useState(false);
  const [hasEnvOpenAIKey, setHasEnvOpenAIKey] = useState(false);
  const [hasEnvGrokKey, setHasEnvGrokKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
          setHasEnvGeminiKey(!!data.hasEnvGeminiKey);
          setHasEnvOpenAIKey(!!data.hasEnvOpenAIKey);
          setHasEnvGrokKey(!!data.hasEnvGrokKey);
        }
      });

    fetch('/api/ai/models')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.isOnline) {
          setAiOnline(true);
          setActiveModel(data.model || 'gemini-flash');
        }
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#EDEDED] font-sans antialiased flex selection:bg-indigo-500/30 selection:text-white">
      
      {/* 1. Left Sidebar (Shared layout) */}
      <DashboardSidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header / Breadcrumb Bar */}
        <header className="sticky top-0 z-40 w-full border-b border-zinc-850 bg-[#09090B]/95 backdrop-blur-md">
          <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Link href="/" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="font-medium text-zinc-200 flex items-center gap-1.5">
                <SettingsIcon className="w-3.5 h-3.5 text-indigo-400" />
                Settings & Engine
              </span>
            </div>

            {/* Right Status */}
            <div className="flex items-center gap-2">
              <div 
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono ${
                  aiOnline 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-zinc-950 border-zinc-850 text-zinc-400'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${aiOnline ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                <span>{aiOnline ? `AI Engine Online (${activeModel})` : 'AI Engine Offline'}</span>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden h-8 w-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>

          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl px-4 py-4 space-y-3">
              <div className="grid grid-cols-3 gap-1.5">
                <Link 
                  href="/" 
                  className="text-center py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-900 rounded-lg"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/proposals" 
                  className="text-center py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-900 rounded-lg"
                >
                  Proposals
                </Link>
                <Link 
                  href="/settings" 
                  className="text-center py-2 text-xs font-semibold text-white bg-zinc-900 border border-zinc-800 rounded-lg"
                >
                  Settings
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* Main Body Content */}
        <main className="p-4 sm:p-6 space-y-6 max-w-[1200px] w-full">
          
          {/* Header */}
          <div className="space-y-1 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <SettingsIcon className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
                System & AI Engine Preferences
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">
              Configure your consultative sales persona, AI model provider (Gemini / Ollama / Grok), and live search grounding.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            
            {/* Section 1: AI Engine Selection */}
            <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-850 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">AI Pitch & Audit Engine</h3>
                </div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase">
                  Problem-Solving Mode
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1.5">Primary AI Provider</label>
                  <Select
                    value={settings.aiProvider || 'gemini'}
                    onValueChange={(val) => setSettings({ ...settings, aiProvider: val as 'gemini' | 'openai' | 'grok' })}
                  >
                    <SelectTrigger className="h-9 text-xs bg-zinc-900 border-zinc-800 text-white rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white text-xs">
                      <SelectItem value="openai">OpenAI (gpt-4o-mini — Recommended for High Speed & Reliability)</SelectItem>
                      <SelectItem value="gemini">Google Gemini (Gemini Flash — Live Google Search Grounding)</SelectItem>
                      <SelectItem value="grok">xAI Grok-2 (Direct & Conversational)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* OpenAI API Key */}
                {settings.aiProvider === 'openai' && (
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-2">
                    <label className="block text-zinc-300 font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-zinc-400" />
                        <span>OpenAI API Key</span>
                        {hasEnvOpenAIKey && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
                            ✓ Private in .env.local
                          </span>
                        )}
                      </span>
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-zinc-400 hover:text-white underline underline-offset-2"
                      >
                        Get OpenAI Key &rarr;
                      </a>
                    </label>
                    <Input
                      type="password"
                      value={settings.openaiApiKey || ''}
                      onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                      placeholder={hasEnvOpenAIKey ? "•••••••••••••••• (Protected in .env.local)" : "sk-proj-..."}
                      className="h-8 text-xs bg-zinc-950 border-zinc-800 text-white font-mono placeholder-zinc-500 rounded-lg"
                    />
                    <p className="text-[11px] text-zinc-500">
                      Uses <span className="text-zinc-300 font-mono">gpt-4o-mini</span> (~₹0.50 per 10 leads) for fast, stable discovery & audits.
                    </p>
                  </div>
                )}

                {/* Gemini API Key */}
                {(settings.aiProvider === 'gemini' || !settings.aiProvider) && (
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-2">
                    <label className="block text-zinc-300 font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Google Gemini API Key</span>
                        {hasEnvGeminiKey && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
                            ✓ Private in .env.local
                          </span>
                        )}
                      </span>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-zinc-400 hover:text-white underline underline-offset-2"
                      >
                        Get Free API Key &rarr;
                      </a>
                    </label>
                    <Input
                      type="password"
                      value={settings.geminiApiKey || ''}
                      onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                      placeholder={hasEnvGeminiKey ? "•••••••••••••••• (Protected in .env.local)" : "AIzaSy..."}
                      className="h-8 text-xs bg-zinc-950 border-zinc-800 text-white font-mono placeholder-zinc-500 rounded-lg"
                    />
                    <p className="text-[11px] text-zinc-500">
                      Powers live Google Search Grounding for real operating businesses and empathetic AI sales pitch kits.
                    </p>
                  </div>
                )}

                {/* Grok API Key */}
                {settings.aiProvider === 'grok' && (
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-2">
                    <label className="block text-zinc-300 font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-zinc-400" />
                        xAI Grok API Key
                      </span>
                      <a
                        href="https://console.x.ai"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-zinc-400 hover:text-white underline underline-offset-2"
                      >
                        xAI Console &rarr;
                      </a>
                    </label>
                    <Input
                      type="password"
                      value={settings.grokApiKey || ''}
                      onChange={(e) => setSettings({ ...settings, grokApiKey: e.target.value })}
                      placeholder="xai-..."
                      className="h-8 text-xs bg-zinc-950 border-zinc-800 text-white font-mono placeholder-zinc-600 rounded-lg"
                    />
                  </div>
                )}


              </div>
            </div>

            {/* Section 2: Agency Persona */}
            <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-850 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-850">
                <Building className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Agency & Persona Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Agency Name</label>
                  <Input
                    type="text"
                    value={settings.agencyName}
                    onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })}
                    className="h-8 text-xs bg-zinc-900 border-zinc-800 text-white rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Sender Name (Your Name)</label>
                  <Input
                    type="text"
                    value={settings.senderName}
                    onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
                    className="h-8 text-xs bg-zinc-900 border-zinc-800 text-white rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Direct Phone / WhatsApp</label>
                  <Input
                    type="text"
                    value={settings.senderPhone}
                    onChange={(e) => setSettings({ ...settings, senderPhone: e.target.value })}
                    className="h-8 text-xs bg-zinc-900 border-zinc-800 text-white rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Agency Email</label>
                  <Input
                    type="email"
                    value={settings.senderEmail}
                    onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })}
                    className="h-8 text-xs bg-zinc-900 border-zinc-800 text-white rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              className="w-full h-10 font-semibold text-xs bg-white text-black hover:bg-zinc-200 shadow-sm cursor-pointer rounded-xl transition-colors"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 mr-1.5 text-black" />
                  <span>Preferences Saved Successfully!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
                  <span>Save All Settings</span>
                </>
              )}
            </Button>

          </form>

        </main>

      </div>

    </div>
  );
}
