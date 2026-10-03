'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Save, 
  Cpu, 
  Building, 
  Check, 
  ArrowLeft
} from 'lucide-react';
import { AppSettings } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
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
  });

  const [ollamaOnline, setOllamaOnline] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
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
    <div className="min-h-screen bg-[#09090B] text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-white">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#09090B]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center h-8 gap-1.5 px-3 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Leads</span>
            </Link>
            <div className="h-4 w-px bg-zinc-800" />
            <span className="text-xs font-medium text-zinc-400">
              System Configuration
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="pb-4 border-b border-zinc-800/80">
          <Badge variant="outline" className="mb-2 text-xs font-normal bg-zinc-900 border-zinc-800 text-zinc-300">
            <Settings className="w-3.5 h-3.5 mr-1 text-zinc-400" />
            <span>Agency & Engine Preferences</span>
          </Badge>
          <h1 className="text-2xl font-semibold text-white tracking-tight">System Settings</h1>
          <p className="text-xs text-zinc-500 mt-1">Configure your agency details, default locations, and Ollama local LLM model.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: Agency Profile */}
          <div className="p-6 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <Building className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-medium text-white">Agency Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1.5">Agency / Company Name</label>
                <Input
                  type="text"
                  value={settings.agencyName}
                  onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })}
                  className="h-9 text-xs bg-zinc-950 border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1.5">Your Name (Sender)</label>
                <Input
                  type="text"
                  value={settings.senderName}
                  onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
                  className="h-9 text-xs bg-zinc-950 border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1.5">Your Direct Phone / WhatsApp</label>
                <Input
                  type="text"
                  value={settings.senderPhone}
                  onChange={(e) => setSettings({ ...settings, senderPhone: e.target.value })}
                  className="h-9 text-xs bg-zinc-950 border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1.5">Your Agency Email</label>
                <Input
                  type="email"
                  value={settings.senderEmail}
                  onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })}
                  className="h-9 text-xs bg-zinc-950 border-zinc-800 text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Ollama Local LLM Configuration */}
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Local Ollama AI Integration</h3>
              </div>

              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                ollamaOnline 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}>
                {ollamaOnline ? 'Connected (Port 11434)' : 'Offline Engine Active'}
              </span>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1.5">Active LLM Model</label>
                {availableModels.length > 0 ? (
                  <Select
                    value={settings.ollamaModel}
                    onValueChange={(val) => { if (val) setSettings({ ...settings, ollamaModel: val }); }}
                  >
                    <SelectTrigger className="h-9 text-xs bg-zinc-950 border-zinc-800 text-white">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white text-xs">
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
                    placeholder="deepseek-v4-pro:cloud or kimi-k2.7-code:cloud"
                    className="h-9 text-xs bg-zinc-950 border-zinc-800 text-white"
                  />
                )}
              </div>

              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Connected models generate custom scripts, technical objection counters, and personalized ROI packages on the fly.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <Button
            type="submit"
            className="w-full h-11 font-bold text-xs bg-white text-zinc-950 hover:bg-zinc-200 shadow-md cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 mr-1.5 text-zinc-950" />
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
