'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Lead, LeadStatus, ServiceCategory, DateFilterOption, getLeadDealValue } from '@/types/lead';
import SalesBattlecardModal from '@/components/SalesBattlecardModal';
import DailyGeneratorModal from '@/components/DailyGeneratorModal';
import {
  ViewMode,
  DashboardSidebar,
  DashboardHeader,
  DashboardHeading,
  MetricCardsRow,
  DashboardFilters,
  LeadTableView,
  LeadKanbanView,
  LeadCardsView,
  LeadAnalyticsView,
} from '@/modules/dashboard';

const DONUT_COLORS: Record<string, string> = {
  'Chatbots': '#6366F1',
  'Voice AI': '#10B981',
  'GEO / AEO': '#F59E0B',
  'Web / Apps': '#06B6D4',
  'Portfolio': '#EC4899',
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
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [onlyStarred, setOnlyStarred] = useState(false);

  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Modals & Navigation
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedLeadForKit, setSelectedLeadForKit] = useState<Lead | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // AI engine status
  const [aiOnline, setAiOnline] = useState(false);
  const [activeModel, setActiveModel] = useState('gemini-flash');

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
          setAiOnline(!!data.isOnline);
          if (data.model) {
            setActiveModel(data.model);
          }
        }
      })
      .catch(() => setAiOnline(false));
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
          setAiOnline(!!data.isOnline);
          if (data.model) {
            setActiveModel(data.model);
          }
        }
      })
      .catch(() => {
        if (isMounted) setAiOnline(false);
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

  const handleToggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const visibleIds = filteredLeads.map((l) => l.id);
    const isAll = visibleIds.length > 0 && visibleIds.every((id) => selectedLeadIds.includes(id));
    if (isAll) {
      setSelectedLeadIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedLeadIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBatchDeleteLeads = async (idsToDelete: string[]) => {
    if (!idsToDelete || idsToDelete.length === 0) return;
    
    // Optimistic local state update
    const idSet = new Set(idsToDelete);
    setLeads((prev) => prev.filter((l) => !idSet.has(l.id)));
    setSelectedLeadIds((prev) => prev.filter((id) => !idSet.has(id)));

    try {
      await fetch('/api/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete })
      });
    } catch (err) {
      console.error('Failed to mass delete leads:', err);
    }
  };

  const handleClearAllLeads = async () => {
    if (!confirm('Are you sure you want to permanently clear ALL leads? This action cannot be undone.')) return;
    
    setLeads([]);
    setSelectedLeadIds([]);

    try {
      await fetch('/api/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      });
    } catch (err) {
      console.error('Failed to clear all leads:', err);
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
    setSelectedLeadIds((prev) => prev.filter((item) => item !== id));
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

  const handleUpdateDealValue = async (id: string, customDealValue: number) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, customDealValue } : l))
    );
    if (selectedLeadForKit?.id === id) {
      setSelectedLeadForKit((prev) => (prev ? { ...prev, customDealValue } : null));
    }

    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDealValue })
      });
    } catch (err) {
      console.error('Failed to update deal value:', err);
    }
  };

  // Metrics Calculations
  const totalLeads = leads.length;
  const toCallCount = leads.filter((l) => ['new', 'to_call'].includes(l.status)).length;
  const contactedCount = leads.filter((l) => ['contacted', 'to_email'].includes(l.status)).length;
  const meetingsCount = leads.filter((l) => l.status === 'meeting_booked').length;
  const wonCount = leads.filter((l) => l.status === 'closed_won').length;
  const verifiedPhonesCount = leads.filter((l) => !!l.phone && l.phone.trim().length > 5).length;

  const agencyPipelineValue = useMemo(() => {
    return leads.reduce((acc, lead) => acc + getLeadDealValue(lead), 0);
  }, [leads]);

  const avgAgencyDealSize = useMemo(() => {
    return leads.length > 0 ? Math.round(agencyPipelineValue / leads.length) : 45000;
  }, [leads, agencyPipelineValue]);

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

      if (dateFilter !== 'all') {
        const leadDate = new Date(lead.createdAt || Date.now());
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const startOf7DaysAgo = new Date(startOfToday);
        startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 7);
        const startOf30DaysAgo = new Date(startOfToday);
        startOf30DaysAgo.setDate(startOf30DaysAgo.getDate() - 30);
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        if (dateFilter === 'today' && leadDate < startOfToday) return false;
        if (dateFilter === 'yesterday' && (leadDate < startOfYesterday || leadDate >= startOfToday)) return false;
        if (dateFilter === 'last_7_days' && leadDate < startOf7DaysAgo) return false;
        if (dateFilter === 'last_30_days' && leadDate < startOf30DaysAgo) return false;
        if (dateFilter === 'this_month' && leadDate < startOfThisMonth) return false;
      }

      return true;
    });
  }, [leads, searchQuery, statusFilter, serviceFilter, selectedNiche, onlyStarred, dateFilter]);

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
      { stage: 'To Email', count: leads.filter((l) => l.status === 'to_email').length },
      { stage: 'Contacted', count: leads.filter((l) => l.status === 'contacted').length },
      { stage: 'Meetings', count: leads.filter((l) => l.status === 'meeting_booked').length },
      { stage: 'Deal Fix', count: leads.filter((l) => l.status === 'closed_won').length },
      { stage: 'Lost', count: leads.filter((l) => l.status === 'not_interested').length }
    ];
  }, [leads]);

  const kanbanColumns = [
    {
      status: 'new' as LeadStatus,
      title: 'New',
      color: 'text-sky-400',
      border: 'border-t-2 border-t-sky-500',
      leads: filteredLeads.filter((l) => l.status === 'new')
    },
    {
      status: 'to_call' as LeadStatus,
      title: 'To Call',
      color: 'text-amber-400',
      border: 'border-t-2 border-t-amber-500',
      leads: filteredLeads.filter((l) => l.status === 'to_call')
    },
    {
      status: 'to_email' as LeadStatus,
      title: 'To Email',
      color: 'text-blue-400',
      border: 'border-t-2 border-t-blue-500',
      leads: filteredLeads.filter((l) => l.status === 'to_email')
    },
    {
      status: 'contacted' as LeadStatus,
      title: 'Contacted',
      color: 'text-purple-400',
      border: 'border-t-2 border-t-purple-500',
      leads: filteredLeads.filter((l) => l.status === 'contacted')
    },
    {
      status: 'meeting_booked' as LeadStatus,
      title: 'Meeting',
      color: 'text-indigo-400',
      border: 'border-t-2 border-t-indigo-500',
      leads: filteredLeads.filter((l) => l.status === 'meeting_booked')
    },
    {
      status: 'closed_won' as LeadStatus,
      title: 'Deal Fix',
      color: 'text-emerald-400',
      border: 'border-t-2 border-t-emerald-500',
      leads: filteredLeads.filter((l) => l.status === 'closed_won')
    },
    {
      status: 'not_interested' as LeadStatus,
      title: 'Lost',
      color: 'text-zinc-400',
      border: 'border-t-2 border-t-zinc-600',
      leads: filteredLeads.filter((l) => l.status === 'not_interested')
    }
  ];

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setServiceFilter('all');
    setSelectedNiche('All');
    setDateFilter('all');
    setOnlyStarred(false);
  };

  const hasActiveFilters = !!(searchQuery || statusFilter !== 'all' || serviceFilter !== 'all' || selectedNiche !== 'All' || onlyStarred || dateFilter !== 'all');

  return (
    <div className="min-h-screen bg-[#09090B] text-[#EDEDED] font-sans antialiased flex selection:bg-indigo-500/30 selection:text-white">
      
      {/* 1. Left Sidebar */}
      <DashboardSidebar
        viewMode={viewMode}
        hasActiveFilters={hasActiveFilters}
        statusFilter={statusFilter}
        onNavigateDashboard={() => {
          clearAllFilters();
          setViewMode('table');
        }}
        onNavigateAnalytics={() => setViewMode('analytics')}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
        onFilterToCall={() => {
          setSelectedNiche('All');
          setServiceFilter('all');
          setStatusFilter('to_call');
        }}
      />

      {/* 2. Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Breadcrumb Bar */}
        <DashboardHeader
          aiOnline={aiOnline}
          activeModel={activeModel}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          onOpenGenerator={() => setIsGeneratorOpen(true)}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          statusFilter={statusFilter}
          selectedNiche={selectedNiche}
          searchQuery={searchQuery}
        />

        {/* 3. Main Dashboard Body */}
        <main className={`p-4 sm:p-6 space-y-6 w-full ${viewMode === 'kanban' ? 'max-w-none' : 'max-w-[1600px]'}`}>
          
          {/* Dashboard Header with Icon, Title & Action Pill Buttons */}
          <DashboardHeading
            statusFilter={statusFilter}
            viewMode={viewMode}
            onOpenGenerator={() => setIsGeneratorOpen(true)}
            onFilterToCall={() => setStatusFilter(statusFilter === 'to_call' ? 'all' : 'to_call')}
            onToggleCards={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
            onToggleKanban={() => setViewMode(viewMode === 'kanban' ? 'table' : 'kanban')}
          />

          {/* 4. 5 Metric Cards in a Row */}
          <MetricCardsRow
            agencyPipelineValue={agencyPipelineValue}
            totalLeads={totalLeads}
            verifiedPhonesCount={verifiedPhonesCount}
            avgAgencyDealSize={avgAgencyDealSize}
            funnelCount={contactedCount + meetingsCount + wonCount}
            toCallCount={toCallCount}
            meetingsCount={meetingsCount}
            topDemandedService={topDemandedService}
          />

          {/* 5. Revenue & Orders Container */}
          <div className="bg-zinc-950/80 border border-zinc-850 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
            
            {/* Filter and Search Bar inside container */}
            <DashboardFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedNiche={selectedNiche}
              setSelectedNiche={setSelectedNiche}
              serviceFilter={serviceFilter}
              setServiceFilter={setServiceFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              onlyStarred={onlyStarred}
              setOnlyStarred={setOnlyStarred}
              filteredCount={filteredLeads.length}
              totalLeads={totalLeads}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearAllFilters}
              onClearAllLeads={handleClearAllLeads}
              allNiches={allNiches}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

            {/* View 1: Table */}
            {viewMode === 'table' && (
              <LeadTableView
                leads={filteredLeads}
                onToggleStar={handleToggleStar}
                onUpdateStatus={handleUpdateStatus}
                onDeleteLead={handleDeleteLead}
                onOpenPitchKit={(lead) => setSelectedLeadForKit(lead)}
                onAddNote={handleAddNote}
                onUpdateDealValue={handleUpdateDealValue}
                onClearAll={handleClearAllLeads}
              />
            )}

            {/* View 2: Kanban Pipeline */}
            {viewMode === 'kanban' && (
              <LeadKanbanView
                kanbanColumns={kanbanColumns}
                onOpenPitchKit={(lead) => setSelectedLeadForKit(lead)}
                onUpdateStatus={handleUpdateStatus}
                onUpdateDealValue={handleUpdateDealValue}
              />
            )}

            {/* View 3: Cards */}
            {viewMode === 'cards' && (
              <LeadCardsView
                leads={filteredLeads}
                onOpenPitchKit={(lead) => setSelectedLeadForKit(lead)}
                onUpdateStatus={handleUpdateStatus}
                onToggleStar={handleToggleStar}
                onDeleteLead={handleDeleteLead}
                onAddNote={handleAddNote}
                onUpdateDealValue={handleUpdateDealValue}
              />
            )}

            {/* View 4: Analytics */}
            {viewMode === 'analytics' && (
              <LeadAnalyticsView
                nicheRevenueLeakData={nicheRevenueLeakData}
                serviceDistributionData={serviceDistributionData}
                pipelineStageData={pipelineStageData}
              />
            )}

          </div>

        </main>

      </div>

      {/* Modals */}
      <DailyGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onSuccess={handleRefresh}
      />

      <SalesBattlecardModal
        lead={selectedLeadForKit}
        isOpen={!!selectedLeadForKit}
        onClose={() => setSelectedLeadForKit(null)}
        onUpdateStatus={handleUpdateStatus}
        onUpdateDealValue={handleUpdateDealValue}
      />

    </div>
  );
}
