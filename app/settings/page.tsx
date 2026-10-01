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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
    <div className="min-h-screen bg-background text-foreground font-sans">
      
      {/* Top Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-xs">
            <Link href="/">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <Badge variant="outline" className="text-xs font-bold">
            Settings
          </Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-2 text-xs font-semibold">
            <Settings className="w-3.5 h-3.5 mr-1" />
            <span>Agency & AI Preferences</span>
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">System Settings</h1>
          <p className="text-xs text-muted-foreground">Configure your agency credentials, default niches, and local Ollama model.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: Agency Profile */}
          <Card className="p-6 space-y-4 shadow-xs">
            <CardHeader className="p-0">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                Your Agency Details (Auto-filled in pitches)
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1.5">Agency / Company Name</label>
                <Input
                  type="text"
                  value={settings.agencyName}
                  onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1.5">Your Name (Sender)</label>
                <Input
                  type="text"
                  value={settings.senderName}
                  onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1.5">Your Direct Phone / WhatsApp</label>
                <Input
                  type="text"
                  value={settings.senderPhone}
                  onChange={(e) => setSettings({ ...settings, senderPhone: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1.5">Your Agency Email</label>
                <Input
                  type="email"
                  value={settings.senderEmail}
                  onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Ollama Local LLM Configuration */}
          <Card className="p-6 space-y-4 shadow-xs">
            <CardHeader className="p-0 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-secondary" />
                Local Ollama AI Integration
              </CardTitle>

              <Badge variant={ollamaOnline ? "secondary" : "outline"} className="text-xs font-bold">
                {ollamaOnline ? '● Ollama Online (Port 11434)' : '○ Offline Engine'}
              </Badge>
            </CardHeader>

            <CardContent className="p-0 text-xs space-y-3">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1.5">Select Active LLM Model</label>
                {availableModels.length > 0 ? (
                  <Select
                    value={settings.ollamaModel}
                    onValueChange={(val) => setSettings({ ...settings, ollamaModel: val })}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
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
                    className="h-9 text-xs"
                  />
                )}
              </div>

              <p className="text-muted-foreground">
                You pulled: <code className="text-primary font-mono">kimi-k2.7-code:cloud</code> and <code className="text-primary font-mono">deepseek-v4-pro:cloud</code>. Both generate hyper-persuasive objection handlers and cold pitches.
              </p>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            type="submit"
            className="w-full h-11 font-bold text-xs"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 mr-1.5 text-secondary" />
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
