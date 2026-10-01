'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  RefreshCw, 
  PhoneCall, 
  Mail, 
  MessageSquare, 
  ExternalLink, 
  Star, 
  Download, 
  Settings, 
  Sparkles, 
  Search, 
  ChevronRight, 
  Trash2, 
  Check, 
  TrendingUp, 
  Layers, 
  Filter 
} from 'lucide-react';
import { Lead, LeadStatus, ServiceCategory } from '@/types/lead';
import SalesBattlecardModal from '@/components/SalesBattlecardModal';
import DailyGeneratorModal from '@/components/DailyGeneratorModal';
import ServiceGapBadge from '@/components/ServiceGapBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function AdminConsoleDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Console Navigation Tabs
  const [consoleTab, setConsoleTab] = useState<'OVERVIEW' | 'ADVANCED VIEW' | 'ALL LEADS'>('OVERVIEW');
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '1M'>('7D');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [serviceFilter, setServiceFilter] = useState<ServiceCategory | 'all'>('all');
  const [selectedNiche, setSelectedNiche] = useState('All');

  // Modals
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedLeadForBattlecard, setSelectedLeadForBattlecard] = useState<Lead | null>(null);

  // Ollama status
  const [ollamaOnline, setOllamaOnline] = useState(false);

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
      setOllamaOnline(!!data.isOnline);
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

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    setLeads((prev) => prev.filter((l) => l.id !== id));
    try {
      await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  // Metrics Calculations
  const totalLeads = leads.length;
  const chatbotCount = leads.filter((l) => l.audit.topGaps.some((g) => g.service === 'chatbots')).length;
  const voiceCount = leads.filter((l) => l.audit.topGaps.some((g) => g.service === 'calling_agents')).length;
  const geoCount = leads.filter((l) => l.audit.topGaps.some((g) => g.service === 'seo_aeo_geo')).length;
  const webCount = leads.filter((l) => l.audit.topGaps.some((g) => g.service === 'web_app')).length;

  const toCallCount = leads.filter((l) => ['new', 'to_call'].includes(l.status)).length;
  const contactedCount = leads.filter((l) => ['contacted', 'to_email'].includes(l.status)).length;
  const meetingsCount = leads.filter((l) => l.status === 'meeting_booked').length;
  const wonCount = leads.filter((l) => l.status === 'closed_won').length;

  const filteredLeads = leads.filter((lead) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        lead.businessName.toLowerCase().includes(q) ||
        lead.decisionMakerName.toLowerCase().includes(q) ||
        lead.phone.toLowerCase().includes(q) ||
        lead.city.toLowerCase().includes(q) ||
        lead.niche.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
    if (serviceFilter !== 'all' && !lead.audit.topGaps.some((g) => g.service === serviceFilter)) return false;
    if (selectedNiche !== 'All' && lead.niche !== selectedNiche) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans p-6 sm:p-10 selection:bg-zinc-800 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Console */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full border border-zinc-500 inline-block" />
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                Admin Console
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Overviewing system metrics, client tech leakages, and active daily outreach.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLeads}
              className="h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/api/export?format=csv', '_blank')}
              className="h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export
            </Button>

            <Button
              size="sm"
              onClick={() => setIsGeneratorOpen(true)}
              className="h-8 text-xs bg-white text-black hover:bg-zinc-200 font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Generate Leads
            </Button>
          </div>
        </div>

        {/* Console Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-zinc-800/80 pb-2 text-xs font-semibold tracking-wider uppercase">
          {(['OVERVIEW', 'ADVANCED VIEW', 'ALL LEADS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setConsoleTab(tab)}
              className={`pb-2 border-b-2 transition-all cursor-pointer ${
                consoleTab === tab
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Top 4 KPI Dark Bento Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Leads */}
          <div className="p-6 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex flex-col justify-between min-h-[140px]">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              TOTAL LEADS
            </div>
            <div className="text-4xl font-extrabold text-white tracking-tight">
              {totalLeads}
            </div>
            <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {toCallCount} ready to dial today
            </div>
          </div>

          {/* Card 2: Services Breakdown */}
          <div className="p-6 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex flex-col justify-between min-h-[140px] text-xs">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              SERVICES BREAKDOWN
            </div>
            <div className="space-y-1 mt-2">
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-400">AI Chatbots</span>
                <span className="font-bold text-white">{chatbotCount}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-400">Voice Agents</span>
                <span className="font-bold text-white">{voiceCount}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-400">GEO / AEO Search</span>
                <span className="font-bold text-white">{geoCount}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-400">Web / App Dev</span>
                <span className="font-bold text-white">{webCount}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Outreach Check */}
          <div className="p-6 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex flex-col justify-between min-h-[140px] text-xs">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              OUTREACH CHECK
            </div>
            <div className="space-y-1.5 mt-2">
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-400">To Call Queue</span>
                <span className="font-bold text-white">{toCallCount}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-400">In Conversation</span>
                <span className="font-bold text-white">{contactedCount}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-400">Booked Meetings</span>
                <span className="font-bold text-emerald-400">{meetingsCount}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Won Deals */}
          <div className="p-6 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex flex-col justify-between min-h-[140px]">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              CLOSED DEALS (WON)
            </div>
            <div className="text-4xl font-extrabold text-white tracking-tight">
              {wonCount}
            </div>
            <div className="text-[11px] text-zinc-500">
              High-ticket client closures
            </div>
          </div>

        </div>

        {/* Subheader: Performance Analytics Bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            PERFORMANCE ANALYTICS
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs">
            {(['24H', '7D', '1M'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                  timeRange === t
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Dark Analytics Chart Cards (Matching user screenshot) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Chart 1: Growth Trend (Bell Curve Wave) */}
          <div className="p-6 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex flex-col justify-between min-h-[220px]">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              LEAD GROWTH TREND (SPIKES - {timeRange})
            </div>

            <div className="relative h-32 flex items-center justify-center my-2">
              <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="bellGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 10 75 Q 80 75 100 15 Q 120 75 190 75"
                  fill="url(#bellGradient)"
                />
                <path
                  d="M 10 75 Q 80 75 100 15 Q 120 75 190 75"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
              <span>0.5</span>
              <span>1.0</span>
              <span>1.5</span>
              <span>2.0</span>
            </div>
          </div>

          {/* Chart 2: Total Cumulative Leads (Bar Chart) */}
          <div className="p-6 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex flex-col justify-between min-h-[220px]">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              TOTAL CUMULATIVE LEADS ({timeRange})
            </div>

            <div className="h-32 flex items-end justify-between gap-2 px-2 my-2">
              {[70, 70, 70, 70, 70].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-mono text-zinc-300 font-bold">{val}</span>
                  <div className="w-full bg-white rounded-t-sm h-20" />
                </div>
              ))}
            </div>

            <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
              <span>68.5</span>
              <span>69.0</span>
              <span>69.5</span>
              <span>70.0</span>
            </div>
          </div>

          {/* Chart 3: Outreach vs Meetings (Dual Curve) */}
          <div className="p-6 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex flex-col justify-between min-h-[220px]">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              CALLS VS BOOKINGS ({timeRange})
            </div>

            <div className="relative h-32 flex items-center justify-center my-2">
              <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                {/* White curve */}
                <path
                  d="M 10 75 Q 80 75 100 15 Q 120 75 190 75"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                {/* Green step/wave */}
                <path
                  d="M 10 65 L 40 75 L 80 45 L 140 45 L 160 75 L 190 75"
                  fill="rgba(16,185,129,0.15)"
                  stroke="#10b981"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
              <span className="text-white">Calls (Peak)</span>
              <span className="text-emerald-400">Bookings (Active)</span>
            </div>
          </div>

        </div>

        {/* Main Leads Table & Closer Directory */}
        <div className="p-6 rounded-xl bg-zinc-900/90 border border-zinc-800/80 space-y-4">
          
          {/* Table Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="relative w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lead name, owner, city..."
                  className="pl-8 h-8 text-xs bg-black border-zinc-800 text-white placeholder-zinc-500"
                />
              </div>

              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="h-8 w-36 text-xs bg-black border-zinc-800 text-zinc-300">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="to_call">To Call</SelectItem>
                  <SelectItem value="to_email">To Email</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="meeting_booked">Meeting Booked</SelectItem>
                  <SelectItem value="closed_won">Closed Won</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-xs text-zinc-400">
              Showing <strong className="text-white">{filteredLeads.length}</strong> of {totalLeads} leads
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800/80 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Business & Owner</th>
                  <th className="py-3 px-3">Location & Niche</th>
                  <th className="py-3 px-3">Diagnosed Vulnerability</th>
                  <th className="py-3 px-3">Readiness</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Closer Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {filteredLeads.map((lead) => {
                  const primaryGap = lead.audit.topGaps[0];
                  const cleanPhone = lead.phone.replace(/[^0-9+]/g, '');

                  return (
                    <tr key={lead.id} className="hover:bg-zinc-800/30 transition-colors group">
                      
                      {/* Business & Owner */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white tracking-tight">{lead.businessName}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {lead.decisionMakerName} • <span className="text-zinc-500">{lead.decisionMakerRole}</span>
                        </div>
                      </td>

                      {/* Location & Niche */}
                      <td className="py-3.5 px-3">
                        <Badge variant="outline" className="text-[10px] bg-black border-zinc-800 text-zinc-300">
                          {lead.niche}
                        </Badge>
                        <div className="text-[11px] text-zinc-500 mt-1">{lead.city}</div>
                      </td>

                      {/* Diagnosed Gap */}
                      <td className="py-3.5 px-3 max-w-xs">
                        {primaryGap && (
                          <div>
                            <div className="font-semibold text-zinc-200 truncate">{primaryGap.serviceTitle}</div>
                            <div className="text-[11px] text-zinc-500 truncate">{primaryGap.detectedIssue}</div>
                          </div>
                        )}
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-zinc-300">
                          {lead.audit.overallHealthScore}/100
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <Select
                          value={lead.status}
                          onValueChange={(val) => handleUpdateStatus(lead.id, val as LeadStatus)}
                        >
                          <SelectTrigger className="h-7 w-32 text-[11px] bg-black border-zinc-800 text-zinc-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 text-white text-xs">
                            <SelectItem value="new">New Lead</SelectItem>
                            <SelectItem value="to_call">To Call</SelectItem>
                            <SelectItem value="to_email">To Email</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="meeting_booked">Meeting Booked</SelectItem>
                            <SelectItem value="closed_won">Won</SelectItem>
                            <SelectItem value="not_interested">Not Interested</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs bg-black border-zinc-800 text-zinc-300 hover:text-white"
                          >
                            <a href={`tel:${cleanPhone}`} onClick={() => handleUpdateStatus(lead.id, 'to_call')}>
                              <PhoneCall className="w-3 h-3 mr-1" />
                              Dial
                            </a>
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => setSelectedLeadForBattlecard(lead)}
                            className="h-7 text-xs bg-white text-black hover:bg-zinc-200 font-bold"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            Battlecard
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-500 hover:text-red-400"
                            onClick={() => handleDeleteLead(lead.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* Modals */}
      <DailyGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onSuccess={() => fetchLeads()}
        ollamaOnline={ollamaOnline}
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
