'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Cpu, 
  Building, 
  Check, 
  Sparkles, 
  RefreshCw 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { AppSettings } from '@/lib/db';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .finally(() => setIsLoading(false));

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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar ollamaOnline={ollamaOnline} activeModel={settings.ollamaModel} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Agency & AI Preferences</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">System Settings</h1>
          <p className="text-xs text-slate-400">Configure your agency credentials, default niches, and local Ollama model.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: Agency Profile */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-400" />
              Your Agency Details (Auto-filled in pitches)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">Agency / Company Name</label>
                <input
                  type="text"
                  value={settings.agencyName}
                  onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">Your Name (Sender)</label>
                <input
                  type="text"
                  value={settings.senderName}
                  onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">Your Direct Phone / WhatsApp</label>
                <input
                  type="text"
                  value={settings.senderPhone}
                  onChange={(e) => setSettings({ ...settings, senderPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">Your Agency Email</label>
                <input
                  type="email"
                  value={settings.senderEmail}
                  onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Ollama Local LLM Configuration */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Local Ollama AI Integration
              </h2>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                ollamaOnline 
                  ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30' 
                  : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
              }`}>
                {ollamaOnline ? '● Ollama Online (Port 11434)' : '○ Offline (Using Built-in Heuristics)'}
              </span>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">Select Active LLM Model</label>
                {availableModels.length > 0 ? (
                  <select
                    value={settings.ollamaModel}
                    onChange={(e) => setSettings({ ...settings, ollamaModel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {availableModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={settings.ollamaModel}
                    onChange={(e) => setSettings({ ...settings, ollamaModel: e.target.value })}
                    placeholder="deepseek-v4-pro:cloud or kimi-k2.7-code:cloud"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                )}
              </div>

              <p className="text-slate-400">
                You pulled: <code className="text-cyan-300">kimi-k2.7-code:cloud</code> and <code className="text-cyan-300">deepseek-v4-pro:cloud</code>. Both work seamlessly for generating hyper-persuasive objection handlers and cold pitches.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Preferences Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>

        </form>

      </main>
    </div>
  );
}
