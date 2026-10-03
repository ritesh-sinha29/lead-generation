'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Save, 
  Cpu, 
  Building, 
  Check, 
  ArrowLeft,
  Sparkles,
  Key
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
    grokApiKey: '',
    ollamaModel: 'deepseek-v4-pro:cloud',
    currency: 'INR'
  });

  const [ollamaOnline, setOllamaOnline] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [hasEnvGeminiKey, setHasEnvGeminiKey] = useState(false);
  const [hasEnvGrokKey, setHasEnvGrokKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
          setHasEnvGeminiKey(!!data.hasEnvGeminiKey);
          setHasEnvGrokKey(!!data.hasEnvGrokKey);
        }
      });

    fetch('/api/ai/models')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.isOnline) {
          setOllamaOnline(true);
          setAvailableModels(data.models || []);
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
    <div className="min-h-screen bg-[#09090B] text-zinc-100 font-sans antialiased selection:bg-zinc-800 selection:text-white">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-850 bg-[#09090B]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center h-8 gap-1.5 px-2.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Pipeline</span>
            </Link>
            <div className="h-4 w-px bg-zinc-800" />
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              System Settings
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Header */}
        <div className="pb-4 border-b border-zinc-850 space-y-1">
          <h1 className="text-xl font-bold text-white tracking-tight">System & AI Engine Preferences</h1>
          <p className="text-xs text-zinc-400">
            Configure your consultative sales persona, AI model provider (Gemini / Ollama / Grok), and Convex backend.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          
          {/* Section 1: AI Engine Selection */}
          <div className="p-5 rounded-xl bg-[#0C0D0E] border border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zinc-400" />
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
                  onValueChange={(val) => setSettings({ ...settings, aiProvider: val as 'gemini' | 'grok' | 'ollama' })}
                >
                  <SelectTrigger className="h-9 text-xs bg-zinc-950 border-zinc-800 text-white rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-white text-xs">
                    <SelectItem value="gemini">Google Gemini 2.0 Flash (Recommended — Relatable Problem-Centric Pitches)</SelectItem>
                    <SelectItem value="ollama">Local Ollama LLM (Offline / Private Machine)</SelectItem>
                    <SelectItem value="grok">xAI Grok-2 (Direct & Conversational)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gemini API Key */}
              {(settings.aiProvider === 'gemini' || !settings.aiProvider) && (
                <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-850 space-y-2">
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
                    className="h-8 text-xs bg-[#0C0D0E] border-zinc-800 text-white font-mono placeholder-zinc-500 rounded"
                  />
                  <p className="text-[11px] text-zinc-500">
                    Powers live Google Search Grounding for real operating businesses and empathetic AI sales battlecards.
                  </p>
                </div>
              )}

              {/* Grok API Key */}
              {settings.aiProvider === 'grok' && (
                <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-850 space-y-2">
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
                    className="h-8 text-xs bg-[#0C0D0E] border-zinc-800 text-white font-mono placeholder-zinc-600 rounded"
                  />
                </div>
              )}

              {/* Ollama Model Selector */}
              {settings.aiProvider === 'ollama' && (
                <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-850 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-medium">Local Ollama Model</label>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {ollamaOnline ? 'Port 11434 Connected' : 'Offline Fallback'}
                    </span>
                  </div>
                  {availableModels.length > 0 ? (
                    <Select
                      value={settings.ollamaModel}
                      onValueChange={(val) => { if (val) setSettings({ ...settings, ollamaModel: val }); }}
                    >
                      <SelectTrigger className="h-8 text-xs bg-[#0C0D0E] border-zinc-800 text-white rounded">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-zinc-800 text-white text-xs">
                        {availableModels.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type="text"
                      value={settings.ollamaModel}
                      onChange={(e) => setSettings({ ...settings, ollamaModel: e.target.value })}
                      placeholder="deepseek-v4-pro:cloud or qwen3.6"
                      className="h-8 text-xs bg-[#0C0D0E] border-zinc-800 text-white rounded"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Agency Persona */}
          <div className="p-5 rounded-xl bg-[#0C0D0E] border border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-850">
              <Building className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-semibold text-white">Agency & Persona Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Agency Name</label>
                <Input
                  type="text"
                  value={settings.agencyName}
                  onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })}
                  className="h-8 text-xs bg-zinc-950 border-zinc-800 text-white rounded"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Sender Name (Your Name)</label>
                <Input
                  type="text"
                  value={settings.senderName}
                  onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
                  className="h-8 text-xs bg-zinc-950 border-zinc-800 text-white rounded"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Direct Phone / WhatsApp</label>
                <Input
                  type="text"
                  value={settings.senderPhone}
                  onChange={(e) => setSettings({ ...settings, senderPhone: e.target.value })}
                  className="h-8 text-xs bg-zinc-950 border-zinc-800 text-white rounded"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Agency Email</label>
                <Input
                  type="email"
                  value={settings.senderEmail}
                  onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })}
                  className="h-8 text-xs bg-zinc-950 border-zinc-800 text-white rounded"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            type="submit"
            className="w-full h-10 font-semibold text-xs bg-white text-black hover:bg-zinc-200 shadow-sm cursor-pointer rounded-lg transition-colors"
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
  );
}
