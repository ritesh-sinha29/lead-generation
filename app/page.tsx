'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  Flame, 
  PhoneCall, 
  Mail, 
  MessageSquare, 
  ExternalLink, 
  Star, 
  Download, 
  Settings, 
  ChevronRight, 
  Trash2, 
  FileText, 
  ChevronDown, 
  Plus, 
  Minus, 
  Check, 
  Copy, 
  Send, 
  Cpu, 
  Calendar as CalendarIcon, 
  Layers, 
  Zap, 
  Bot, 
  ShieldCheck, 
  TrendingUp, 
  Globe, 
  Briefcase 
} from 'lucide-react';
import { Lead, LeadStatus, ServiceCategory } from '@/types/lead';
import SalesBattlecardModal from '@/components/SalesBattlecardModal';
import DailyGeneratorModal from '@/components/DailyGeneratorModal';

export default function ProfessionalDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters & Sidebar State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'to_call' | 'to_email' | 'meeting_booked' | 'closed_won'>('all');
  const [serviceFilter, setServiceFilter] = useState<ServiceCategory | 'all'>('all');
  const [selectedNiche, setSelectedNiche] = useState('All Niches');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [starredOnly, setStarredOnly] = useState(false);

  // Modals & Active Lead
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedLeadForBattlecard, setSelectedLeadForBattlecard] = useState<Lead | null>(null);

  // Daily Goal Counter
  const [dailyCallGoal, setDailyCallGoal] = useState(15);
  
  // Ollama status
  const [ollamaOnline, setOllamaOnline] = useState(false);
  const [activeModel, setActiveModel] = useState('deepseek-v4-pro:cloud');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    fetchLeads();
    checkOllama();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success && data.leads) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkOllama = async () => {
    try {
      const res = await fetch('/api/ai/models');
      const data = await res.json();
      if (data.success && data.isOnline) {
        setOllamaOnline(true);
        setAvailableModels(data.models || []);
        if (data.models?.[0]) setActiveModel(data.models[0]);
      }
    } catch {
      setOllamaOnline(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status, lastContactedAt: new Date().toISOString() } : l))
    );

    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, lastContactedAt: new Date().toISOString() })
      });
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  const handleToggleStar = async (id: string, starred: boolean) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, starred } : l)));
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred })
      });
    } catch (err) {
      console.error('Failed to update star state:', err);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to remove this lead?')) return;
    setLeads((prev) => prev.filter((l) => l.id !== id));
    try {
      await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        lead.businessName.toLowerCase().includes(q) ||
        lead.decisionMakerName.toLowerCase().includes(q) ||
        lead.phone.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.city.toLowerCase().includes(q) ||
        lead.niche.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (activeTab !== 'all' && lead.status !== activeTab) {
      return false;
    }

    if (serviceFilter !== 'all') {
      const hasGap = lead.audit.topGaps.some((g) => g.service === serviceFilter);
      if (!hasGap) return false;
    }

    if (selectedNiche !== 'All Niches' && lead.niche !== selectedNiche) {
      return false;
    }

    if (selectedCity !== 'All Cities' && lead.city !== selectedCity) {
      return false;
    }

    if (starredOnly && !lead.starred) {
      return false;
    }

    return true;
  });

  const calledCount = leads.filter((l) => ['contacted', 'meeting_booked', 'closed_won'].includes(l.status)).length;
  const meetingsCount = leads.filter((l) => l.status === 'meeting_booked').length;
  const wonCount = leads.filter((l) => l.status === 'closed_won').length;
  const totalPipelineRevenue = leads.reduce((sum, l) => sum + l.audit.topGaps.reduce((gSum, g) => gSum + g.estimatedLostRevenueMonthly, 0), 0);

  const niches = ['All Niches', ...Array.from(new Set(leads.map((l) => l.niche)))];
  const cities = ['All Cities', ...Array.from(new Set(leads.map((l) => l.city)))];

  const nextLeadToCall = leads.find((l) => l.status === 'new' || l.status === 'to_call') || leads[0];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col selection:bg-primary selection:text-primary-foreground">
      
      {/* Top Application Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-40">
        
        {/* Left: Brand + Environment Picker */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            </div>
            <Link href="/" className="font-extrabold text-sm text-foreground tracking-tight ml-2 flex items-center gap-1.5 hover:opacity-80">
              <span>LeadPulse</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                Closer OS
              </span>
            </Link>
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
            <span>Workspace:</span>
            <span className="font-semibold text-foreground">Apex Agency HQ</span>
          </div>
        </div>

        {/* Center: Quick Batch Status */}
        <div className="hidden md:flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-background border border-border text-xs flex items-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-muted-foreground">Daily Queue:</span>
            <strong className="text-foreground">{leads.length} Leads Ready</strong>
          </div>
        </div>

        {/* Right Toolbar */}
        <div className="flex items-center gap-2">
          
          {/* Ollama Status */}
          <div 
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border ${
              ollamaOnline 
                ? 'bg-secondary/10 border-secondary/30 text-secondary' 
                : 'bg-muted border-border text-muted-foreground'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="font-medium">{ollamaOnline ? `Ollama Active` : 'Local Engine'}</span>
          </div>

          <button
            onClick={() => window.open('/api/export?format=csv', '_blank')}
            className="px-3 py-1.5 rounded-lg bg-card hover:bg-muted text-foreground border border-border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => setIsGeneratorOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-primary hover:opacity-90 text-primary-foreground text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Leads</span>
          </button>

          <Link
            href="/settings"
            className="p-2 rounded-lg bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </Link>

        </div>
      </header>

      {/* Main Studio Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Sidebar (Discovery & Filtering Dock) */}
        <aside className="w-full md:w-64 lg:w-72 border-r border-border bg-card p-4 flex flex-col gap-4 shrink-0 overflow-y-auto">
          
          {/* Top Pill Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-background rounded-xl border border-border text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('all'); setServiceFilter('all'); }}
              className="py-1.5 rounded-lg bg-primary text-primary-foreground shadow-2xs text-center cursor-pointer"
            >
              All Leads
            </button>
            <button
              onClick={() => setActiveTab('to_call')}
              className="py-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground text-center cursor-pointer"
            >
              To Call
            </button>
            <button
              onClick={() => setActiveTab('meeting_booked')}
              className="py-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground text-center cursor-pointer"
            >
              Booked
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads, phone, city..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground text-xs focus:outline-none focus:border-primary"
            />
          </div>

          {/* Accordion 1: Industry Niche */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
              Target Niche
            </div>
            <div className="space-y-0.5">
              {niches.map((n) => (
                <button
                  key={n}
                  onClick={() => setSelectedNiche(n)}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-colors cursor-pointer ${
                    selectedNiche === n
                      ? 'bg-primary/15 text-foreground font-bold border border-primary/30'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span className="truncate">{n}</span>
                  {selectedNiche === n && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion 2: Target City */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
              Location / City
            </div>
            <div className="space-y-0.5">
              {cities.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-colors cursor-pointer ${
                    selectedCity === c
                      ? 'bg-secondary/15 text-foreground font-bold border border-secondary/30'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span className="truncate">{c}</span>
                  {selectedCity === c && <span className="w-1.5 h-1.5 rounded-full bg-secondary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion 3: Service Gap Angle */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
              Diagnosed Gap
            </div>
            <div className="space-y-0.5 text-xs">
              {[
                { id: 'all', label: 'All 5 Services', color: 'bg-muted' },
                { id: 'chatbots', label: '🤖 AI Chatbots', color: 'bg-accent/20' },
                { id: 'calling_agents', label: '📞 Voice Agents', color: 'bg-secondary/20' },
                { id: 'web_app', label: '🌐 Web/App Dev', color: 'bg-primary/20' },
                { id: 'seo_aeo_geo', label: '🔍 GEO / AI Search', color: 'bg-secondary/20' },
                { id: 'portfolio', label: '💼 High-Ticket Showcase', color: 'bg-accent/20' },
              ].map((gap) => (
                <button
                  key={gap.id}
                  onClick={() => setServiceFilter(gap.id as any)}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between transition-colors cursor-pointer ${
                    serviceFilter === gap.id
                      ? 'bg-card border border-border text-foreground font-bold shadow-2xs'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span>{gap.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Starred Only Toggle */}
          <div className="pt-2 border-t border-border">
            <button
              onClick={() => setStarredOnly(!starredOnly)}
              className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                starredOnly
                  ? 'bg-accent/20 border-accent text-foreground'
                  : 'bg-background border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${starredOnly ? 'fill-accent text-accent' : ''}`} />
              <span>{starredOnly ? 'Showing High Priority' : 'Filter High Priority'}</span>
            </button>
          </div>

        </aside>

        {/* Right Canvas / Main Working Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-background">
          
          {/* Top Section: tweakcn-style Bento Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Bento Card 1: Total Revenue Pipeline & Health */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Client Revenue Leak Pipeline
                </div>
                <div className="text-3xl font-black text-foreground tracking-tight mt-1">
                  ${(totalPipelineRevenue / 1000).toFixed(1)}k<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
                <p className="text-xs text-secondary font-medium mt-0.5">
                  Across {leads.length} audited businesses
                </p>
              </div>

              {/* Sparkline curve */}
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Average monthly leak:</span>
                <span className="font-bold text-foreground">${(totalPipelineRevenue / Math.max(1, leads.length)).toFixed(0)}/client</span>
              </div>
            </div>

            {/* Bento Card 2: Outreach Activity & Daily Target */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daily Outreach Goal</div>
                  <div className="text-xs text-muted-foreground">Set your target calls today</div>
                </div>
                
                <div className="flex items-center gap-1.5 bg-background p-1 rounded-lg border border-border">
                  <button
                    onClick={() => setDailyCallGoal(Math.max(5, dailyCallGoal - 5))}
                    className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-foreground px-1">{dailyCallGoal}</span>
                  <button
                    onClick={() => setDailyCallGoal(dailyCallGoal + 5)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Activity Progress Bars */}
              <div className="my-3 space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Calls Made: {calledCount}/{dailyCallGoal}</span>
                  <span className="text-primary font-bold">{Math.round((calledCount / dailyCallGoal) * 100)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-background overflow-hidden border border-border">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (calledCount / dailyCallGoal) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                <span className="text-muted-foreground">Meetings Booked:</span>
                <span className="font-bold text-secondary">{meetingsCount} 📅</span>
              </div>
            </div>

            {/* Bento Card 3: Next Up Closer / Immediate Action Lead */}
            {nextLeadToCall ? (
              <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between relative overflow-hidden group">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Next Lead Up</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      ★ {nextLeadToCall.googleRating}
                    </span>
                  </div>
                  
                  <h4 className="text-base font-bold text-foreground truncate">{nextLeadToCall.businessName}</h4>
                  <p className="text-xs text-muted-foreground truncate">{nextLeadToCall.decisionMakerName} ({nextLeadToCall.decisionMakerRole})</p>
                </div>

                <div className="my-2 p-2.5 rounded-xl bg-background border border-border text-[11px] text-muted-foreground line-clamp-2 italic">
                  "{nextLeadToCall.pitchKit.coldCallSmokingGun.slice(0, 110)}..."
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <a
                    href={`tel:${nextLeadToCall.phone.replace(/[^0-9+]/g, '')}`}
                    onClick={() => handleUpdateStatus(nextLeadToCall.id, 'to_call')}
                    className="flex-1 py-1.5 rounded-lg bg-secondary text-secondary-foreground font-bold text-xs flex items-center justify-center gap-1 shadow-2xs hover:opacity-90 transition-opacity"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Call Now</span>
                  </a>

                  <button
                    onClick={() => setSelectedLeadForBattlecard(nextLeadToCall)}
                    className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-1 shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Battlecard</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center text-center">
                <p className="text-xs text-muted-foreground">All leads contacted! Generate a fresh batch.</p>
              </div>
            )}

          </div>

          {/* Subheader: Filter Pill Bar + Leads Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-foreground tracking-tight">
                Daily Lead Feed
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {filteredLeads.length} leads
              </span>
            </div>

            {/* Quick Status Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'to_call', label: 'To Call' },
                { id: 'to_email', label: 'To Email' },
                { id: 'meeting_booked', label: 'Booked 📅' },
                { id: 'closed_won', label: 'Won 🏆' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-2xs'
                      : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Leads Grid */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-xs text-muted-foreground font-medium">Loading qualified daily leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 rounded-2xl bg-card border border-border text-center space-y-3 max-w-md mx-auto">
              <div className="w-12 h-12 mx-auto rounded-xl bg-muted flex items-center justify-center text-foreground">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground">No leads match your current filter</h3>
              <p className="text-xs text-muted-foreground">Reset your search filters or generate a fresh batch of 15 leads.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveTab('all'); setServiceFilter('all'); setSelectedNiche('All Niches'); }}
                className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLeads.map((lead) => {
                const primaryGap = lead.audit.topGaps[0];
                const cleanPhone = lead.phone.replace(/[^0-9+]/g, '');
                const cleanWhatsApp = cleanPhone.replace(/^\+/, '');

                return (
                  <div
                    key={lead.id}
                    className="p-5 rounded-2xl bg-card text-card-foreground border border-border shadow-2xs hover:border-primary/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                            {lead.niche}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {lead.city}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleStar(lead.id, !lead.starred)}
                            className="p-1 text-muted-foreground hover:text-accent cursor-pointer"
                            title="Star lead"
                          >
                            <Star className={`w-3.5 h-3.5 ${lead.starred ? 'fill-accent text-accent' : ''}`} />
                          </button>

                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">
                            {lead.audit.overallHealthScore}/100
                          </span>
                        </div>
                      </div>

                      {/* Business Name & Decision Maker */}
                      <h3 className="text-base font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {lead.businessName}
                      </h3>
                      
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">{lead.decisionMakerName}</span>
                        <span>•</span>
                        <span className="truncate">{lead.decisionMakerRole}</span>
                      </div>

                      {/* Diagnosed Vulnerability Box */}
                      {primaryGap && (
                        <div className="mt-3 p-3 rounded-xl bg-background border border-border text-xs space-y-1">
                          <div className="font-bold text-foreground flex items-center justify-between">
                            <span className="text-primary truncate">{primaryGap.serviceTitle}</span>
                            <span className="text-destructive font-black shrink-0">-${primaryGap.estimatedLostRevenueMonthly}/mo</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {primaryGap.detectedIssue}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Toolbar */}
                    <div className="mt-4 pt-3 border-t border-border space-y-2">
                      
                      {/* Contact Quick Buttons */}
                      <div className="grid grid-cols-4 gap-1 text-xs font-semibold">
                        <a
                          href={`tel:${cleanPhone}`}
                          onClick={() => handleUpdateStatus(lead.id, 'to_call')}
                          className="py-1 px-2 rounded-lg bg-secondary/15 hover:bg-secondary/30 text-secondary border border-secondary/30 flex items-center justify-center gap-1 transition-colors"
                          title="Call Lead"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Call</span>
                        </a>

                        <a
                          href={`mailto:${lead.email}?subject=${encodeURIComponent(lead.pitchKit.emailSubjectLines[0])}&body=${encodeURIComponent(lead.pitchKit.emailBody)}`}
                          onClick={() => handleUpdateStatus(lead.id, 'to_email')}
                          className="py-1 px-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 flex items-center justify-center gap-1 transition-colors"
                          title="Email Lead"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Email</span>
                        </a>

                        <a
                          href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(lead.pitchKit.whatsappMessage)}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => handleUpdateStatus(lead.id, 'contacted')}
                          className="py-1 px-2 rounded-lg bg-secondary/15 hover:bg-secondary/30 text-secondary border border-secondary/30 flex items-center justify-center gap-1 transition-colors"
                          title="WhatsApp Chat"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WA</span>
                        </a>

                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noreferrer"
                          className="py-1 px-2 rounded-lg bg-muted hover:bg-background text-foreground border border-border flex items-center justify-center gap-1 transition-colors"
                          title="Visit Website"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Site</span>
                        </a>
                      </div>

                      {/* Main Closer Battlecard Button */}
                      <button
                        onClick={() => setSelectedLeadForBattlecard(lead)}
                        className="w-full py-2 px-3 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Sales Closer Battlecard</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      {/* Status Selector + Delete */}
                      <div className="flex items-center justify-between gap-1.5 pt-1">
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateStatus(lead.id, e.target.value as LeadStatus)}
                          className="flex-1 py-1 px-2 rounded-lg bg-background border border-border text-foreground text-[11px] font-medium cursor-pointer"
                        >
                          <option value="new">New Lead</option>
                          <option value="to_call">To Call 📞</option>
                          <option value="to_email">To Email ✉️</option>
                          <option value="contacted">Contacted</option>
                          <option value="meeting_booked">Meeting Booked 📅</option>
                          <option value="closed_won">Closed Won 🏆</option>
                          <option value="not_interested">Not Interested</option>
                        </select>

                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1.5 rounded-lg bg-background text-destructive hover:bg-muted border border-border cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>

      {/* Modals */}
      <DailyGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onSuccess={() => fetchLeads()}
        ollamaOnline={ollamaOnline}
        availableModels={availableModels}
      />

      <SalesBattlecardModal
        lead={selectedLeadForBattlecard}
        isOpen={!!selectedLeadForBattlecard}
        onClose={() => setSelectedLeadForBattlecard(null)}
        onUpdateStatus={handleUpdateStatus}
        ollamaOnline={ollamaOnline}
      />

    </div>
  );
}
