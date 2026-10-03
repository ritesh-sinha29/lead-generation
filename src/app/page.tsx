'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  RefreshCw, 
  ExternalLink, 
  Star, 
  Download, 
  Plus,
  Zap,
  Briefcase,
  Search, 
  Trash2, 
  Table as TableIcon,
  Kanban,
  LayoutGrid,
  BarChart3,
  FileText,
  ArrowRight,
  X,
  Flame,
  Phone,
  MessageSquare,
  Menu
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Lead, LeadStatus, ServiceCategory } from '@/types/lead';
import SalesBattlecardModal from '@/components/SalesBattlecardModal';
import DailyGeneratorModal from '@/components/DailyGeneratorModal';
import LeadCard from '@/components/LeadCard';
import ServiceGapBadge from '@/components/ServiceGapBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ViewMode = 'table' | 'kanban' | 'cards' | 'analytics';

// Vibrant Chart Color Palette (Indigo, Emerald, Cyan, Amber, Rose, Purple)
const DONUT_COLORS: Record<string, string> = {
  'Chatbots': '#6366F1', // Vibrant Indigo
  'Voice AI': '#10B981', // Vibrant Emerald
  'GEO / AEO': '#F59E0B', // Vibrant Amber
  'Web / Apps': '#06B6D4', // Vibrant Cyan
  'Portfolio': '#EC4899', // Vibrant Rose Pink
};

const STATUS_COLOR_CONFIG: Record<LeadStatus, { label: string; text: string; bg: string; border: string }> = {
  new: { label: 'New', text: 'text-zinc-300', bg: 'bg-zinc-900', border: 'border-zinc-800' },
  to_call: { label: 'To Call', text: 'text-zinc-300', bg: 'bg-zinc-900', border: 'border-zinc-800' },
  to_email: { label: 'To Email', text: 'text-zinc-300', bg: 'bg-zinc-900', border: 'border-zinc-800' },
  contacted: { label: 'Contacted', text: 'text-zinc-300', bg: 'bg-zinc-900', border: 'border-zinc-800' },
  meeting_booked: { label: 'Meeting', text: 'text-zinc-300', bg: 'bg-zinc-900', border: 'border-zinc-800' },
  closed_won: { label: 'Won', text: 'text-zinc-200', bg: 'bg-zinc-800', border: 'border-zinc-700' },
  not_interested: { label: 'Closed', text: 'text-zinc-500', bg: 'bg-zinc-900', border: 'border-zinc-800' },
};

export default function AdminConsoleDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [serviceFilter, setServiceFilter] = useState<ServiceCategory | 'all'>('all');
  const [selectedNiche, setSelectedNiche] = useState('All');
  const [onlyStarred, setOnlyStarred] = useState(false);

  // Modals & Navigation
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedLeadForKit, setSelectedLeadForKit] = useState<Lead | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ollama status
  const [ollamaOnline, setOllamaOnline] = useState(false);
  const [activeModel, setActiveModel] = useState('deepseek-v4-pro:cloud');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Expanded notes state for table
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const loadData = () => {
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.leads) {
          setLeads(data.leads);
        }
      })
      .catch((err) => console.error(err));

    fetch('/api/ai/models')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setOllamaOnline(!!data.isOnline);
          if (data.models && data.models.length > 0) {
            setAvailableModels(data.models);
            setActiveModel(data.models[0]);
          }
        }
      })
      .catch(() => setOllamaOnline(false));
  };

  useEffect(() => {
    let isMounted = true;
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.leads) {
          setLeads(data.leads);
        }
      })
      .catch((err) => console.error(err));

    fetch('/api/ai/models')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data) {
          setOllamaOnline(!!data.isOnline);
          if (data.models && data.models.length > 0) {
            setAvailableModels(data.models);
            setActiveModel(data.models[0]);
          }
        }
      })
      .catch(() => {
        if (isMounted) setOllamaOnline(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    loadData();
    setTimeout(() => setIsLoading(false), 500);
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
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, starred } : l))
    );
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred })
      });
    } catch (err) {
      console.error('Failed to toggle star:', err);
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

  const handleAddNote = async (id: string, note: string) => {
    if (!note.trim()) return;
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    const updatedNotes = [...(lead.notes || []), note.trim()];

    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, notes: updatedNotes } : l))
    );
    setNoteInput('');

    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: updatedNotes })
      });
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  // Metrics Calculations
  const totalLeads = leads.length;
  const toCallCount = leads.filter((l) => ['new', 'to_call'].includes(l.status)).length;
  const contactedCount = leads.filter((l) => ['contacted', 'to_email'].includes(l.status)).length;
  const meetingsCount = leads.filter((l) => l.status === 'meeting_booked').length;
  const wonCount = leads.filter((l) => l.status === 'closed_won').length;
  const verifiedPhonesCount = leads.filter((l) => !!l.phone && l.phone.trim().length > 5).length;

  // Total Agency Deal Potential (Value of quotes that Ixion Labs can close)
  const agencyPipelineValue = useMemo(() => {
    return leads.reduce((acc, lead) => {
      const priceStr = lead.pitchKit?.affordability?.recommendedSweetSpotPrice || lead.pitchKit?.estimatedPrice || '';
      const match = priceStr.match(/₹?([0-9,]+)/);
      let val = 45000;
      if (match) {
        val = parseInt(match[1].replace(/,/g, ''), 10) || 45000;
      }
      return acc + val;
    }, 0);
  }, [leads]);

  const avgAgencyDealSize = useMemo(() => {
    return leads.length > 0 ? Math.round(agencyPipelineValue / leads.length) : 45000;
  }, [leads, agencyPipelineValue]);

  // Top In-Demand Service diagnosed across the current batch
  const topDemandedService = useMemo(() => {
    const counts: Record<ServiceCategory, number> = {
      calling_agents: 0,
      chatbots: 0,
      seo_aeo_geo: 0,
      web_app: 0,
      portfolio: 0
    };
    leads.forEach((l) => {
      (l.audit?.topGaps || []).forEach((g) => {
        if (counts[g.service] !== undefined) {
          counts[g.service] += 1;
        }
      });
    });
    let maxSvc: ServiceCategory = 'calling_agents';
    let maxCount = 0;
    (Object.keys(counts) as ServiceCategory[]).forEach((svc) => {
      if (counts[svc] > maxCount) {
        maxCount = counts[svc];
        maxSvc = svc;
      }
    });
    const labelMap: Record<ServiceCategory, string> = {
      calling_agents: 'Voice Calling Agents',
      chatbots: '24/7 AI Chatbots',
      seo_aeo_geo: 'SEO & Search Ranking',
      web_app: 'Web & App Revamp',
      portfolio: 'Proof & Portfolio'
    };
    return {
      service: maxSvc,
      label: labelMap[maxSvc] || 'AI Calling Agents',
      count: maxCount
    };
  }, [leads]);

  const totalMonthlyLeak = useMemo(() => {
    return leads.reduce((acc, lead) => {
      const leadLeak = (lead.audit?.topGaps || []).reduce((sum, g) => sum + (g.estimatedLostRevenueMonthly || 0), 0);
      return acc + leadLeak;
    }, 0);
  }, [leads]);

  const avgHealthScore = useMemo(() => {
    if (leads.length === 0) return 0;
    const sum = leads.reduce((acc, l) => acc + (l.audit?.overallHealthScore || 0), 0);
    return Math.round(sum / leads.length);
  }, [leads]);

  // Unique Niches
  const allNiches = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.niche) set.add(l.niche);
    });
    return Array.from(set);
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (onlyStarred && !lead.starred) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const hasNoSite = !lead.website || lead.website.includes('google.com') || lead.website.includes('justdial.com') || lead.website.includes('practo.com');
        const siteQueryMatch = (q === 'no site' || q === 'no website' || q === 'no-site') && hasNoSite;
        const gapsMatch = (lead.audit?.topGaps || []).some(
          (g) => g.serviceTitle.toLowerCase().includes(q) || g.detectedIssue.toLowerCase().includes(q) || g.service.toLowerCase().includes(q)
        );
        const notesMatch = (lead.notes || []).some((n) => n.toLowerCase().includes(q));

        const match =
          siteQueryMatch ||
          gapsMatch ||
          notesMatch ||
          lead.businessName.toLowerCase().includes(q) ||
          lead.decisionMakerName.toLowerCase().includes(q) ||
          lead.phone.toLowerCase().includes(q) ||
          lead.city.toLowerCase().includes(q) ||
          lead.niche.toLowerCase().includes(q) ||
          (lead.website && lead.website.toLowerCase().includes(q));
        if (!match) return false;
      }

      if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
      if (serviceFilter !== 'all' && !lead.audit.topGaps.some((g) => g.service === serviceFilter)) return false;
      if (selectedNiche !== 'All' && lead.niche !== selectedNiche) return false;

      return true;
    });
  }, [leads, searchQuery, statusFilter, serviceFilter, selectedNiche, onlyStarred]);

  // Chart Data Calculations
  const serviceDistributionData = useMemo(() => {
    const counts: Record<string, number> = {
      'Chatbots': 0,
      'Voice AI': 0,
      'GEO / AEO': 0,
      'Web / Apps': 0,
      'Portfolio': 0
    };
    leads.forEach((l) => {
      l.audit.topGaps.forEach((g) => {
        if (g.service === 'chatbots') counts['Chatbots']++;
        else if (g.service === 'calling_agents') counts['Voice AI']++;
        else if (g.service === 'seo_aeo_geo') counts['GEO / AEO']++;
        else if (g.service === 'web_app') counts['Web / Apps']++;
        else if (g.service === 'portfolio') counts['Portfolio']++;
      });
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      name, 
      value,
      color: DONUT_COLORS[name] || '#6366F1'
    }));
  }, [leads]);

  const nicheRevenueLeakData = useMemo(() => {
    const leakByNiche: Record<string, number> = {};
    leads.forEach((l) => {
      const niche = l.niche || 'Other';
      const leak = l.audit.topGaps.reduce((sum, g) => sum + (g.estimatedLostRevenueMonthly || 0), 0);
      leakByNiche[niche] = (leakByNiche[niche] || 0) + leak;
    });
    return Object.entries(leakByNiche)
      .map(([niche, totalLeak]) => ({
        niche: niche.length > 14 ? niche.substring(0, 12) + '..' : niche,
        leak: totalLeak
      }))
      .sort((a, b) => b.leak - a.leak)
      .slice(0, 6);
  }, [leads]);

  const pipelineStageData = useMemo(() => {
    return [
      { stage: 'New', count: leads.filter((l) => l.status === 'new').length },
      { stage: 'To Call', count: leads.filter((l) => l.status === 'to_call').length },
      { stage: 'Contacted', count: leads.filter((l) => ['contacted', 'to_email'].includes(l.status)).length },
      { stage: 'Meetings', count: leads.filter((l) => l.status === 'meeting_booked').length },
      { stage: 'Won', count: leads.filter((l) => l.status === 'closed_won').length }
    ];
  }, [leads]);

  // Kanban Columns with Vibrant Column Accent Bars
  const kanbanColumns: { status: LeadStatus; title: string; color: string; border: string; leads: Lead[] }[] = [
    {
      status: 'new',
      title: 'New Discovered',
      color: 'text-sky-400',
      border: 'border-t-2 border-t-sky-500',
      leads: filteredLeads.filter((l) => l.status === 'new')
    },
    {
      status: 'to_call',
      title: 'Ready to Dial',
      color: 'text-amber-400',
      border: 'border-t-2 border-t-amber-500',
      leads: filteredLeads.filter((l) => l.status === 'to_call')
    },
    {
      status: 'contacted',
      title: 'In Dialogue',
      color: 'text-purple-400',
      border: 'border-t-2 border-t-purple-500',
      leads: filteredLeads.filter((l) => ['contacted', 'to_email'].includes(l.status))
    },
    {
      status: 'meeting_booked',
      title: 'Meeting Booked',
      color: 'text-emerald-400',
      border: 'border-t-2 border-t-emerald-500',
      leads: filteredLeads.filter((l) => l.status === 'meeting_booked')
    },
    {
      status: 'closed_won',
      title: 'Closed Won',
      color: 'text-emerald-300',
      border: 'border-t-2 border-t-emerald-400',
      leads: filteredLeads.filter((l) => l.status === 'closed_won')
    }
  ];

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setServiceFilter('all');
    setSelectedNiche('All');
    setOnlyStarred(false);
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || serviceFilter !== 'all' || selectedNiche !== 'All' || onlyStarred;

  return (
    <div className="min-h-screen bg-[#09090B] text-[#EDEDED] font-sans antialiased selection:bg-indigo-500/30 selection:text-white">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#09090B]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
          
          {/* Brand & Desktop Navigation */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 text-white font-semibold tracking-tight shrink-0">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight">LeadPulse</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden sm:flex items-center gap-1 text-xs font-medium border-l border-zinc-800/80 pl-4">
              <Link 
                href="/" 
                className="px-2.5 py-1 rounded-md text-white bg-zinc-900 border border-zinc-800 text-xs font-medium"
              >
                Pipeline
              </Link>

              <Link 
                href="/proposals" 
                className="px-2.5 py-1 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors text-xs font-medium"
              >
                Teasers
              </Link>

              <Link 
                href="/settings" 
                className="px-2.5 py-1 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors text-xs font-medium"
              >
                Settings
              </Link>
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Desktop Engine Status Dot */}
            <div 
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono ${
                ollamaOnline 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${ollamaOnline ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
              <span>{ollamaOnline ? activeModel.split(':')[0] : 'engine'}</span>
            </div>

            {/* Desktop Export Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/api/export?format=csv', '_blank')}
              className="hidden sm:inline-flex h-8 px-2.5 text-xs bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white rounded-lg cursor-pointer"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
              <span>Export</span>
            </Button>

            {/* Desktop Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="hidden sm:inline-flex h-8 w-8 p-0 bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white rounded-lg shrink-0 cursor-pointer"
              title="Refresh leads"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            </Button>

            {/* Generate CTA Button (Always visible) */}
            <Button
              size="sm"
              onClick={() => setIsGeneratorOpen(true)}
              className="h-8 px-3 text-xs bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg shadow-sm cursor-pointer shrink-0 transition-transform active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 sm:mr-1.5 text-zinc-800" />
              <span className="hidden sm:inline">Generate Leads</span>
              <span className="sm:hidden">Generate</span>
            </Button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden h-8 w-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>

        {/* Mobile Slide-Down Menu Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-150">
            
            {/* Nav Links */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold px-2">Navigation</span>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <Link 
                  href="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold text-white bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm"
                >
                  Pipeline
                </Link>
                <Link 
                  href="/proposals" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-900 rounded-lg transition-colors"
                >
                  Teasers
                </Link>
                <Link 
                  href="/settings" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-900 rounded-lg transition-colors"
                >
                  Settings
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-1.5 pt-1 border-t border-zinc-900">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold px-1">Actions & Status</span>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleRefresh();
                    setMobileMenuOpen(false);
                  }}
                  className="h-8 px-2.5 text-xs inline-flex items-center justify-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors font-medium"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Leads</span>
                </button>

                <button
                  onClick={() => {
                    window.open('/api/export?format=csv', '_blank');
                    setMobileMenuOpen(false);
                  }}
                  className="h-8 px-2.5 text-xs inline-flex items-center justify-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors font-medium"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Status Pill in Mobile Menu */}
              <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-850 flex items-center justify-between text-[11px] font-mono mt-2">
                <span className="text-zinc-400">Database & Engine:</span>
                <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Convex Cloud
                </span>
              </div>
            </div>

          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-3.5 sm:py-6 space-y-3.5 sm:space-y-6">
        
        {/* KPI Strip (Actionable Agency Sales Pipeline) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          
          {/* Card 1: Qualified Pipeline */}
          <button 
            onClick={() => clearAllFilters()}
            className={`p-3 sm:p-4 rounded-xl border text-left flex flex-col justify-between shadow-sm transition-all cursor-pointer ${
              !hasActiveFilters
                ? 'border-zinc-800/80 bg-zinc-950/80 hover:border-zinc-700 hover:bg-zinc-900/50'
                : 'bg-zinc-900 border-zinc-700 hover:bg-zinc-900/80'
            }`}
            title="Click to reset filters and view all qualified leads"
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">Qualified Leads</span>
            <div className="text-xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 font-mono">
              {totalLeads} <span className="text-xs font-normal text-zinc-400">Leads</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-zinc-400 mt-1 font-mono truncate">
              {verifiedPhonesCount} verified phones →
            </div>
          </button>

          {/* Card 2: Estimated Agency Deal Value */}
          <button 
            onClick={() => { setViewMode('table'); }}
            className="p-3 sm:p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/80 hover:border-amber-500/40 hover:bg-zinc-900/50 text-left flex flex-col justify-between shadow-sm transition-all cursor-pointer"
            title="Total potential agency contract revenue you can close from this batch"
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500/90 font-semibold">Est. Deal Value</span>
            <div className="text-xl sm:text-3xl font-extrabold text-amber-400 tracking-tight mt-1 font-mono">
              ₹{(agencyPipelineValue / 100000).toFixed(2)}L
            </div>
            <div className="text-[10px] sm:text-[11px] text-zinc-400 mt-1 font-mono truncate">
              Avg deal: ₹{(avgAgencyDealSize / 1000).toFixed(0)}k / client
            </div>
          </button>

          {/* Card 3: Outreach Progress / Velocity */}
          <button 
            onClick={() => setStatusFilter(statusFilter === 'to_call' ? 'all' : 'to_call')}
            className={`p-3 sm:p-4 rounded-xl border text-left flex flex-col justify-between shadow-sm transition-all cursor-pointer ${
              statusFilter === 'to_call' 
                ? 'bg-zinc-900 border-zinc-500 ring-1 ring-zinc-500' 
                : 'border-zinc-800/80 bg-zinc-950/80 hover:border-zinc-700 hover:bg-zinc-900/50'
            }`}
            title="Click to view leads pending outreach"
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">Outreach Progress</span>
            <div className="text-xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 font-mono">
              {contactedCount + meetingsCount + wonCount} <span className="text-xs font-normal text-zinc-500">/ {totalLeads}</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-zinc-400 mt-1 font-mono truncate">
              {toCallCount} ready · {meetingsCount} booked →
            </div>
          </button>

          {/* Card 4: Top In-Demand Service */}
          <button 
            onClick={() => setServiceFilter(serviceFilter === topDemandedService.service ? 'all' : topDemandedService.service)}
            className={`p-3 sm:p-4 rounded-xl border text-left flex flex-col justify-between shadow-sm transition-all cursor-pointer ${
              serviceFilter === topDemandedService.service 
                ? 'bg-zinc-900 border-emerald-500 ring-1 ring-emerald-500' 
                : 'border-zinc-800/80 bg-zinc-950/80 hover:border-emerald-500/40 hover:bg-zinc-900/50'
            }`}
            title={`Click to filter leads that need ${topDemandedService.label}`}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500/90 font-semibold">Top Agency Service</span>
            <div className="text-base sm:text-lg font-bold text-emerald-400 tracking-tight mt-1 font-sans truncate">
              {topDemandedService.label}
            </div>
            <div className="text-[10px] sm:text-[11px] text-zinc-400 mt-1 font-mono truncate">
              {topDemandedService.count} clients need this →
            </div>
          </button>

        </div>

        {/* View Switcher & Star Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-zinc-800/80 pb-3">
          
          {/* View Mode Segmented Controls */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                viewMode === 'table'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                viewMode === 'kanban'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>

            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                viewMode === 'cards'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>

            <button
              onClick={() => setViewMode('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                viewMode === 'analytics'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Insights</span>
            </button>
          </div>

          {/* Starred Filter & Clear Counter */}
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOnlyStarred(!onlyStarred)}
              className={`h-7 text-xs px-2.5 rounded-lg cursor-pointer ${
                onlyStarred ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-transparent border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Star className={`w-3 h-3 mr-1 ${onlyStarred ? 'fill-white text-white' : ''}`} />
              <span>Starred</span>
            </Button>

            <span className="text-zinc-500 font-mono text-[11px]">
              {filteredLeads.length} of {totalLeads}
            </span>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 ml-1 cursor-pointer transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

        </div>

        {/* Compact Search & Filter Grid */}
        <div className="space-y-2">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads by business name, city, or niche..."
              className="pl-9 h-8 text-xs bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 rounded-lg focus:border-zinc-500 focus:ring-0"
            />
          </div>

          {/* Responsive 3-Dropdown Filter Row */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            
            <Select value={selectedNiche} onValueChange={(val) => { if (val) setSelectedNiche(val); }}>
              <SelectTrigger className="h-8 text-xs bg-zinc-950 border-zinc-800 text-zinc-300 rounded-lg">
                <SelectValue placeholder="All Niches" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-white text-xs">
                <SelectItem value="All">All Niches</SelectItem>
                {allNiches.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={serviceFilter} onValueChange={(v) => { if (v) setServiceFilter(v as ServiceCategory | 'all'); }}>
              <SelectTrigger className="h-8 text-xs bg-zinc-950 border-zinc-800 text-zinc-300 rounded-lg">
                <SelectValue placeholder="All Gaps" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-white text-xs">
                <SelectItem value="all">All Service Gaps</SelectItem>
                <SelectItem value="chatbots">AI Chatbots</SelectItem>
                <SelectItem value="calling_agents">Voice Calling Agents</SelectItem>
                <SelectItem value="seo_aeo_geo">GEO / AEO Search</SelectItem>
                <SelectItem value="web_app">Web & Apps</SelectItem>
                <SelectItem value="portfolio">Portfolio</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => { if (v) setStatusFilter(v as LeadStatus | 'all'); }}>
              <SelectTrigger className="h-8 text-xs bg-zinc-950 border-zinc-800 text-zinc-300 rounded-lg">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-white text-xs">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="to_call">To Call</SelectItem>
                <SelectItem value="to_email">To Email</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="meeting_booked">Meeting Booked</SelectItem>
                <SelectItem value="closed_won">Closed Won</SelectItem>
                <SelectItem value="not_interested">Closed / Uninterested</SelectItem>
              </SelectContent>
            </Select>

          </div>

        </div>

        {/* VIEW 1: CLOSER TABLE (DESKTOP) + DEDICATED MOBILE CARDS (PHONE) */}
        {viewMode === 'table' && (
          <div className="space-y-3">
            
            {/* A. MOBILE-OPTIMIZED LEAD CARDS (< 768px) */}
            <div className="block md:hidden space-y-3">
              {filteredLeads.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs bg-zinc-950/70 border border-zinc-800 rounded-xl">
                  No leads found matching current criteria.
                </div>
              ) : (
                filteredLeads.map((lead) => {
                  const primaryGap = lead.audit.topGaps[0];
                  const cleanPhone = (lead.phone || '').replace(/[^0-9+]/g, '');
                  const cleanWhatsAppPhone = cleanPhone.replace(/^\+/, '');

                  return (
                    <div 
                      key={lead.id} 
                      className="p-3.5 bg-zinc-950/90 border border-zinc-800/90 hover:border-zinc-700/80 rounded-xl space-y-3 shadow-sm transition-all"
                    >
                      {/* Top Row: Star + Name + Website + Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <button
                            onClick={() => handleToggleStar(lead.id, !lead.starred)}
                            className="mt-0.5 text-zinc-600 hover:text-white transition-colors cursor-pointer shrink-0"
                          >
                            <Star className={`w-4 h-4 ${lead.starred ? 'fill-white text-white' : ''}`} />
                          </button>
                          <div className="min-w-0">
                            <div className="font-semibold text-white tracking-tight flex items-center gap-1.5 text-sm">
                              <span className="truncate">{lead.businessName}</span>
                              {lead.website && (
                                <a
                                  href={lead.website}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-zinc-500 hover:text-zinc-300 shrink-0"
                                  title="Open Website"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <div className="text-xs text-zinc-400 mt-0.5 truncate">
                              <span>{lead.decisionMakerName}</span> · <span className="text-zinc-500">{lead.decisionMakerRole}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Select */}
                        <Select
                          value={lead.status}
                          onValueChange={(val) => { if (val) handleUpdateStatus(lead.id, val as LeadStatus); }}
                        >
                          <SelectTrigger className="h-6 w-24 text-[11px] font-medium bg-zinc-900 border-zinc-800 text-zinc-300 rounded-md shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-950 border-zinc-800 text-white text-xs">
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="to_call">To Call</SelectItem>
                            <SelectItem value="to_email">To Email</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="meeting_booked">Meeting</SelectItem>
                            <SelectItem value="closed_won">Won</SelectItem>
                            <SelectItem value="not_interested">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Middle Row: Niche + City + Vulnerability Badge & Revenue Leak */}
                      <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80 text-xs space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="text-zinc-400 font-medium truncate">{lead.niche} · <span className="capitalize">{lead.city}</span></span>
                          <span className="font-mono text-zinc-400 shrink-0">Health: {lead.audit.overallHealthScore}/100</span>
                        </div>
                        {primaryGap && (
                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <ServiceGapBadge service={primaryGap.service} />
                            <span className="text-amber-400 font-mono text-[11px] font-semibold shrink-0">
                              -₹{primaryGap.estimatedLostRevenueMonthly.toLocaleString('en-IN')}/mo
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Row: Mobile 1-Tap Buttons */}
                      <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                        {cleanPhone ? (
                          <a
                            href={`tel:${cleanPhone}`}
                            onClick={() => handleUpdateStatus(lead.id, 'to_call')}
                            className="h-8 px-2 text-xs inline-flex items-center justify-center gap-1.5 bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 rounded-lg transition-colors font-medium active:scale-95"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Call</span>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="h-8 px-2 text-xs inline-flex items-center justify-center gap-1.5 bg-zinc-950 border border-zinc-900 text-zinc-600 rounded-lg cursor-not-allowed font-medium"
                          >
                            <Phone className="w-3.5 h-3.5 text-zinc-700" />
                            <span>No Tel</span>
                          </button>
                        )}

                        {cleanWhatsAppPhone ? (
                          <a
                            href={`https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(lead.pitchKit.whatsappMessage)}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => handleUpdateStatus(lead.id, 'contacted')}
                            className="h-8 px-2 text-xs inline-flex items-center justify-center gap-1.5 bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 rounded-lg transition-colors font-medium active:scale-95"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            <span>WhatsApp</span>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="h-8 px-2 text-xs inline-flex items-center justify-center gap-1.5 bg-zinc-950 border border-zinc-900 text-zinc-600 rounded-lg cursor-not-allowed font-medium"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-zinc-700" />
                            <span>No WA</span>
                          </button>
                        )}

                        <Button
                          size="sm"
                          onClick={() => setSelectedLeadForKit(lead)}
                          className="h-8 px-2 text-xs bg-white text-black hover:bg-zinc-200 font-semibold rounded-lg shadow-none flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-zinc-800" />
                          <span>Pitch Kit</span>
                        </Button>
                      </div>

                      {/* Expandable Notes toggle */}
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-900">
                        <button
                          onClick={() => setExpandedNotesId(expandedNotesId === lead.id ? null : lead.id)}
                          className="hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>{(lead.notes || []).length} notes logged</span>
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="text-zinc-600 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>

                      {/* Mobile Expanded Notes */}
                      {expandedNotesId === lead.id && (
                        <div className="p-2.5 bg-zinc-900/80 rounded-lg border border-zinc-800 space-y-2 mt-2">
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {(lead.notes || []).length === 0 ? (
                              <p className="text-[11px] text-zinc-500 italic">No notes logged yet.</p>
                            ) : (
                              lead.notes.map((note, idx) => (
                                <div key={idx} className="text-[11px] text-zinc-300 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                                  {note}
                                </div>
                              ))
                            )}
                          </div>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleAddNote(lead.id, noteInput);
                            }}
                            className="flex gap-1.5"
                          >
                            <input
                              type="text"
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              placeholder="Add call note..."
                              className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none"
                            />
                            <Button type="submit" size="sm" className="h-7 text-xs bg-white text-black hover:bg-zinc-200">
                              Save
                            </Button>
                          </form>
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>

            {/* B. DESKTOP FULL TABLE (Tablets & Desktops: >= 768px) */}
            <div className="hidden md:block border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/70 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[720px]">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/60 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3 font-semibold">Business / Decision Maker</th>
                      <th className="py-2.5 px-3 font-semibold">Niche & City</th>
                      <th className="py-2.5 px-3 font-semibold">Diagnosed Vulnerability</th>
                      <th className="py-2.5 px-3 font-semibold">Score</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-zinc-500 text-xs">
                          No leads found matching current criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => {
                        const primaryGap = lead.audit.topGaps[0];
                        const cleanPhone = (lead.phone || '').replace(/[^0-9+]/g, '');
                        const cleanWhatsAppPhone = cleanPhone.replace(/^\+/, '');
                        return (
                          <React.Fragment key={lead.id}>
                            <tr className="hover:bg-zinc-900/40 transition-colors group">
                              
                              {/* Business & Decision Maker */}
                              <td className="py-3 px-3">
                                <div className="flex items-start gap-2">
                                  <button
                                    onClick={() => handleToggleStar(lead.id, !lead.starred)}
                                    className="mt-0.5 text-zinc-600 hover:text-white transition-colors cursor-pointer shrink-0"
                                  >
                                    <Star className={`w-3.5 h-3.5 ${lead.starred ? 'fill-white text-white' : ''}`} />
                                  </button>
                                  <div>
                                    <div className="font-medium text-white tracking-tight flex items-center gap-1.5">
                                      <span className="group-hover:text-zinc-200 transition-colors">{lead.businessName}</span>
                                      {lead.website && (
                                        <a
                                          href={lead.website}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-zinc-600 hover:text-zinc-300 shrink-0"
                                          title="Open Website"
                                        >
                                          <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-zinc-500 mt-0.5">
                                      <span>{lead.decisionMakerName}</span> · {lead.decisionMakerRole}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Niche & Location */}
                              <td className="py-3 px-3">
                                <span className="text-[11px] text-zinc-300 font-medium">{lead.niche}</span>
                                <div className="text-[11px] text-zinc-500 capitalize">{lead.city}</div>
                              </td>

                              {/* Diagnosed Vulnerability with Tag */}
                              <td className="py-3 px-3 max-w-xs">
                                {primaryGap ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <ServiceGapBadge service={primaryGap.service} />
                                      <span className="text-zinc-400 font-mono text-[11px] shrink-0">-₹{primaryGap.estimatedLostRevenueMonthly.toLocaleString('en-IN')}/mo</span>
                                    </div>
                                    <div className="text-[11px] text-zinc-500 truncate">{primaryGap.detectedIssue}</div>
                                  </div>
                                ) : (
                                  <span className="text-zinc-600">None detected</span>
                                )}
                              </td>

                              {/* Score */}
                              <td className="py-3 px-3">
                                <span className="text-[11px] font-mono text-zinc-400">
                                  {lead.audit.overallHealthScore}/100
                                </span>
                              </td>

                              {/* Status Pill Dropdown */}
                              <td className="py-3 px-3">
                                <Select
                                  value={lead.status}
                                  onValueChange={(val) => { if (val) handleUpdateStatus(lead.id, val as LeadStatus); }}
                                >
                                  <SelectTrigger className="h-6 w-28 text-[11px] font-medium bg-zinc-900 border-zinc-800 text-zinc-300 rounded">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-zinc-950 border-zinc-800 text-white text-xs">
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="to_call">To Call</SelectItem>
                                    <SelectItem value="to_email">To Email</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="meeting_booked">Meeting</SelectItem>
                                    <SelectItem value="closed_won">Won</SelectItem>
                                    <SelectItem value="not_interested">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  
                                  {cleanPhone ? (
                                    <a
                                      href={`tel:${cleanPhone}`}
                                      onClick={() => handleUpdateStatus(lead.id, 'to_call')}
                                      className="h-6 px-2 text-[11px] inline-flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded transition-colors"
                                      title={`Call ${cleanPhone}`}
                                    >
                                      <Phone className="w-3 h-3 mr-1 text-zinc-400" />
                                      Call
                                    </a>
                                  ) : (
                                    <span
                                      className="h-6 px-2 text-[11px] inline-flex items-center justify-center bg-zinc-950 border border-zinc-900 text-zinc-600 rounded cursor-not-allowed"
                                      title="No phone detected on website / Google"
                                    >
                                      <Phone className="w-3 h-3 mr-1 text-zinc-700" />
                                      No Tel
                                    </span>
                                  )}

                                  {cleanWhatsAppPhone ? (
                                    <a
                                      href={`https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(lead.pitchKit.whatsappMessage)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={() => handleUpdateStatus(lead.id, 'contacted')}
                                      className="h-6 px-2 text-[11px] inline-flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded transition-colors"
                                      title={`WhatsApp ${cleanWhatsAppPhone}`}
                                    >
                                      <MessageSquare className="w-3 h-3 mr-1 text-zinc-400" />
                                      WA
                                    </a>
                                  ) : (
                                    <span
                                      className="h-6 px-2 text-[11px] inline-flex items-center justify-center bg-zinc-950 border border-zinc-900 text-zinc-600 rounded cursor-not-allowed"
                                      title="No WhatsApp phone available"
                                    >
                                      <MessageSquare className="w-3 h-3 mr-1 text-zinc-700" />
                                      No WA
                                    </span>
                                  )}

                                  <Button
                                    size="sm"
                                    onClick={() => setSelectedLeadForKit(lead)}
                                    className="h-6 px-2.5 text-[11px] bg-white text-black hover:bg-zinc-200 font-medium rounded shadow-none"
                                  >
                                    Pitch Kit
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-6 w-6 rounded ${expandedNotesId === lead.id ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    onClick={() => setExpandedNotesId(expandedNotesId === lead.id ? null : lead.id)}
                                    title="Notes"
                                  >
                                    <FileText className="w-3 h-3" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-zinc-600 hover:text-zinc-300 rounded"
                                    onClick={() => handleDeleteLead(lead.id)}
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>

                                </div>
                              </td>

                            </tr>

                            {/* Notes Row */}
                            {expandedNotesId === lead.id && (
                              <tr className="bg-zinc-950 border-b border-zinc-800">
                                <td colSpan={6} className="p-3 space-y-2">
                                  <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                                    <span>Call Log · {lead.businessName}</span>
                                    <span>{lead.phone}</span>
                                  </div>

                                  <div className="space-y-1 max-h-24 overflow-y-auto">
                                    {(lead.notes || []).length === 0 ? (
                                      <p className="text-[11px] text-zinc-600 italic">No notes logged yet.</p>
                                    ) : (
                                      lead.notes.map((note, idx) => (
                                        <div key={idx} className="text-[11px] text-zinc-300 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                                          {note}
                                        </div>
                                      ))
                                    )}
                                  </div>

                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      handleAddNote(lead.id, noteInput);
                                    }}
                                    className="flex gap-1.5 pt-1"
                                  >
                                    <Input
                                      type="text"
                                      value={noteInput}
                                      onChange={(e) => setNoteInput(e.target.value)}
                                      placeholder="Add quick note..."
                                      className="h-7 text-xs bg-zinc-900 border-zinc-800 text-white flex-1 rounded"
                                    />
                                    <Button type="submit" size="sm" className="h-7 px-3 text-xs bg-zinc-800 text-white hover:bg-zinc-700 rounded">
                                      Save
                                    </Button>
                                  </form>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: KANBAN WITH CLEAN MINIMAL HEADERS */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 pb-4">
            {kanbanColumns.map((col) => {
              const colRevenueSum = col.leads.reduce((sum, l) => {
                const leak = l.audit.topGaps.reduce((acc, g) => acc + (g.estimatedLostRevenueMonthly || 0), 0);
                return sum + leak;
              }, 0);

              return (
                <div key={col.status} className="border border-zinc-800 rounded-xl bg-zinc-950/80 p-3 flex flex-col min-h-[480px] shadow-sm">
                  
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">{col.title}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">₹{(colRevenueSum / 1000).toFixed(0)}k/mo</div>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                      {col.leads.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {col.leads.map((lead) => {
                      const primaryGap = lead.audit.topGaps[0];
                      const cleanPhone = (lead.phone || '').replace(/[^0-9+]/g, '');

                      return (
                        <div key={lead.id} className="p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 space-y-2 transition-colors">
                          
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <div className="font-medium text-white text-xs line-clamp-1">
                                {lead.businessName}
                              </div>
                              <div className="text-[10px] text-zinc-500 mt-0.5">
                                {lead.decisionMakerName}
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400">
                              {lead.audit.overallHealthScore}/100
                            </span>
                          </div>

                          {primaryGap && (
                            <div className="text-[10px] text-zinc-400 border-t border-zinc-900 pt-1.5 flex items-center justify-between">
                              <ServiceGapBadge service={primaryGap.service} />
                              <span className="font-mono text-zinc-400">-₹{primaryGap.estimatedLostRevenueMonthly.toLocaleString('en-IN')}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-zinc-900">
                            <Button
                              size="sm"
                              onClick={() => setSelectedLeadForKit(lead)}
                              className="h-6 px-2 text-[10px] bg-white text-black hover:bg-zinc-200 font-medium rounded shadow-none"
                            >
                              Pitch Kit
                            </Button>

                            <div className="flex items-center gap-1">
                              {cleanPhone ? (
                                <a
                                  href={`tel:${cleanPhone}`}
                                  onClick={() => handleUpdateStatus(lead.id, 'to_call')}
                                  className="h-6 px-2 text-[10px] inline-flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded"
                                  title={`Call ${cleanPhone}`}
                                >
                                  Call
                                </a>
                              ) : (
                                <span
                                  className="h-6 px-1.5 text-[10px] inline-flex items-center justify-center bg-zinc-950 border border-zinc-900 text-zinc-600 rounded cursor-not-allowed"
                                  title="No phone detected"
                                >
                                  No Tel
                                </span>
                              )}

                              {col.status !== 'closed_won' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-zinc-500 hover:text-white"
                                  onClick={() => {
                                    const nextMap: Record<LeadStatus, LeadStatus> = {
                                      new: 'to_call',
                                      to_call: 'contacted',
                                      to_email: 'contacted',
                                      contacted: 'meeting_booked',
                                      meeting_booked: 'closed_won',
                                      closed_won: 'closed_won',
                                      not_interested: 'new'
                                    };
                                    handleUpdateStatus(lead.id, nextMap[lead.status]);
                                  }}
                                  title="Advance"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </Button>
                              )}
                            </div>

                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 3: CARDS */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onOpenBattlecard={(l) => setSelectedLeadForKit(l)}
                onUpdateStatus={handleUpdateStatus}
                onToggleStar={handleToggleStar}
                onDelete={handleDeleteLead}
                onAddNote={handleAddNote}
              />
            ))}
          </div>
        )}

        {/* VIEW 4: VIBRANT COLORFUL CHARTS */}
        {viewMode === 'analytics' && (
          <div className="space-y-4">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Chart 1: Revenue Leak with Vibrant Indigo Bars */}
              <div className="p-5 border border-zinc-800 rounded-xl bg-zinc-950/70 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white tracking-tight">Revenue Leak by Market Niche</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Estimated monthly client loss</p>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">INR (₹) / mo</span>
                </div>

                <div className="h-60 w-full min-w-0 min-h-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart data={nicheRevenueLeakData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="nicheGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#818CF8" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 2" stroke="#27272A" vertical={false} />
                      <XAxis dataKey="niche" stroke="#71717A" fontSize={11} tickLine={false} axisLine={{ stroke: '#27272A' }} />
                      <YAxis stroke="#71717A" fontSize={11} tickLine={false} axisLine={{ stroke: '#27272A' }} tickFormatter={(val: number) => `₹${val / 1000}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                        formatter={(val: number | string | readonly (string | number)[] | undefined) => [`₹${Number(val).toLocaleString('en-IN')}/mo`, 'Leak']}
                      />
                      <Bar dataKey="leak" fill="url(#nicheGradient)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Vibrant Multi-Color Donut Chart */}
              <div className="p-5 border border-zinc-800 rounded-xl bg-zinc-950/70 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white tracking-tight">Service Gap Distribution</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">5 High-Ticket Services</p>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">Breakdown</span>
                </div>

                <div className="h-60 w-full min-w-0 min-h-0 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                      <Pie
                        data={serviceDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {serviceDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#09090B" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', color: '#A1A1AA', paddingTop: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Funnel Chart with Emerald / Teal Glow */}
            <div className="p-5 border border-zinc-800 rounded-xl bg-zinc-950/70 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white tracking-tight">Pipeline Stage Conversion Funnel</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Lead progression velocity</p>
                </div>
                <span className="text-xs font-mono text-zinc-500">Stages</span>
              </div>

              <div className="h-56 w-full min-w-0 min-h-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={pipelineStageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="emeraldArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" stroke="#27272A" vertical={false} />
                    <XAxis dataKey="stage" stroke="#71717A" fontSize={11} tickLine={false} axisLine={{ stroke: '#27272A' }} />
                    <YAxis stroke="#71717A" fontSize={11} tickLine={false} axisLine={{ stroke: '#27272A' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2.5} fill="url(#emeraldArea)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Modals */}
      <DailyGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onSuccess={handleRefresh}
        ollamaOnline={ollamaOnline}
        availableModels={availableModels}
      />

      <SalesBattlecardModal
        lead={selectedLeadForKit}
        isOpen={!!selectedLeadForKit}
        onClose={() => setSelectedLeadForKit(null)}
        onUpdateStatus={handleUpdateStatus}
        ollamaOnline={ollamaOnline}
      />

    </div>
  );
}
