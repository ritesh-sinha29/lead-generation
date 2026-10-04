'use client';

import React from 'react';
import { 
  Search, 
  Star, 
  X, 
  Table as TableIcon, 
  Kanban, 
  LayoutGrid, 
  BarChart3,
  Trash2,
  Calendar,
  Building2,
  Layers,
  CircleDot,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LeadStatus, ServiceCategory, DateFilterOption } from '@/types/lead';
import { ViewMode } from './DashboardSidebar';

interface DashboardFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedNiche: string;
  setSelectedNiche: (n: string) => void;
  serviceFilter: ServiceCategory | 'all';
  setServiceFilter: (s: ServiceCategory | 'all') => void;
  statusFilter: LeadStatus | 'all';
  setStatusFilter: (st: LeadStatus | 'all') => void;
  dateFilter: DateFilterOption;
  setDateFilter: (df: DateFilterOption) => void;
  onlyStarred: boolean;
  setOnlyStarred: (st: boolean) => void;
  filteredCount: number;
  totalLeads: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onClearAllLeads?: () => void;
  allNiches: string[];
  viewMode: ViewMode;
  setViewMode: (vm: ViewMode) => void;
}

const SERVICE_LABELS: Record<string, string> = {
  all: 'All Gaps',
  chatbots: 'AI Chatbots',
  calling_agents: 'Voice Calling Agents',
  seo_aeo_geo: 'GEO / AEO Search',
  web_app: 'Web & Apps',
  portfolio: 'Portfolio Proof',
};

const STATUS_LABELS: Record<string, string> = {
  all: 'All Stages',
  new: 'New',
  to_call: 'To Call',
  to_email: 'To Email',
  contacted: 'Contacted',
  meeting_booked: 'Meeting',
  closed_won: 'Deal Fix',
  not_interested: 'Lost',
};

const DATE_LABELS: Record<string, string> = {
  all: 'All Time',
  today: 'Added Today',
  yesterday: 'Added Yesterday',
  last_7_days: 'Last 7 Days',
  last_30_days: 'Last 30 Days',
  this_month: 'This Month',
};

export function DashboardFilters({
  searchQuery,
  setSearchQuery,
  selectedNiche,
  setSelectedNiche,
  serviceFilter,
  setServiceFilter,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  onlyStarred,
  setOnlyStarred,
  filteredCount,
  totalLeads,
  hasActiveFilters,
  onClearFilters,
  onClearAllLeads,
  allNiches,
  viewMode,
  setViewMode,
}: DashboardFiltersProps) {
  return (
    <div className="space-y-4">
      {/* 1. Header: Section Title + View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-sans">
            Lead Pipeline & Conversion
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Filter and track qualified agency deal pipeline alongside conversion velocity.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 overflow-x-auto scrollbar-none self-start sm:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
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
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
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
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
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
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              viewMode === 'analytics'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Insights</span>
          </button>
        </div>
      </div>

      {/* 2. Top Controls Row: Search Input + Action Badges & Buttons */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        {/* Search Input */}
        <div className="flex-1 relative min-w-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search business name, city, decision maker, or notes..."
            className="pl-9 h-9 text-xs bg-zinc-900/80 border-zinc-800 text-white placeholder-zinc-500 rounded-xl focus:border-zinc-500 focus:ring-0 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Action Button Group */}
        <div className="flex items-center gap-2 shrink-0 justify-between md:justify-end overflow-x-auto pb-1 md:pb-0">
          {/* Starred Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOnlyStarred(!onlyStarred)}
            className={`h-9 text-xs px-3 rounded-xl cursor-pointer transition-colors shrink-0 ${
              onlyStarred 
                ? 'bg-zinc-800 text-white border-zinc-600' 
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Star className={`w-3.5 h-3.5 mr-1.5 ${onlyStarred ? 'fill-white text-white' : ''}`} />
            <span>Starred</span>
          </Button>

          {/* Lead Count Badge */}
          <div className="h-9 px-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-1.5 font-mono text-[11px] text-zinc-400 shrink-0">
            <span className="font-semibold text-white">{filteredCount}</span>
            <span>of {totalLeads} leads</span>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-9 text-xs px-2.5 rounded-xl border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 bg-zinc-900/80 cursor-pointer shrink-0 flex items-center gap-1"
              title="Reset all active filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </Button>
          )}

          {/* Mass Delete Button */}
          {totalLeads > 0 && onClearAllLeads && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAllLeads}
              className="h-9 text-xs px-3 rounded-xl border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-900/60 hover:bg-red-950/20 bg-zinc-900/80 cursor-pointer transition-colors shrink-0 flex items-center gap-1.5"
              title="Delete all leads in database"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Mass Delete</span>
            </Button>
          )}
        </div>
      </div>

      {/* 3. Organized Filter Dropdowns Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-0.5">
        
        {/* Filter 1: Target Niche */}
        <div className="space-y-1">
          <label 
            htmlFor="niche-filter-trigger"
            className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1 px-1 cursor-pointer"
          >
            <Building2 className="w-3 h-3 text-zinc-500" />
            <span>Target Niche</span>
          </label>
          <Select 
            value={selectedNiche} 
            onValueChange={(val) => { if (val) setSelectedNiche(val); }}
          >
            <SelectTrigger 
              id="niche-filter-trigger"
              className={`h-9 text-xs bg-zinc-900 border text-zinc-200 rounded-xl transition-colors ${
                selectedNiche !== 'All' ? 'border-zinc-500 font-medium' : 'border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="truncate">{selectedNiche === 'All' ? 'All Niches' : selectedNiche}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-white text-xs max-h-64">
              <SelectItem value="All">All Niches</SelectItem>
              {allNiches.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter 2: Service Vulnerability */}
        <div className="space-y-1">
          <label 
            htmlFor="service-gap-filter-trigger"
            className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1 px-1 cursor-pointer"
          >
            <Layers className="w-3 h-3 text-zinc-500" />
            <span>Service Gap</span>
          </label>
          <Select 
            value={serviceFilter} 
            onValueChange={(v) => { if (v) setServiceFilter(v as ServiceCategory | 'all'); }}
          >
            <SelectTrigger 
              id="service-gap-filter-trigger"
              className={`h-9 text-xs bg-zinc-900 border text-zinc-200 rounded-xl transition-colors ${
                serviceFilter !== 'all' ? 'border-zinc-500 font-medium' : 'border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="truncate">{SERVICE_LABELS[serviceFilter] || 'All Service Gaps'}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-white text-xs">
              <SelectItem value="all">All Service Gaps</SelectItem>
              <SelectItem value="chatbots">AI Chatbots</SelectItem>
              <SelectItem value="calling_agents">Voice Calling Agents</SelectItem>
              <SelectItem value="seo_aeo_geo">GEO / AEO Search</SelectItem>
              <SelectItem value="web_app">Web & Apps</SelectItem>
              <SelectItem value="portfolio">Portfolio Proof</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter 3: Pipeline Stage */}
        <div className="space-y-1">
          <label 
            htmlFor="pipeline-stage-filter-trigger"
            className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1 px-1 cursor-pointer"
          >
            <CircleDot className="w-3 h-3 text-zinc-500" />
            <span>Pipeline Stage</span>
          </label>
          <Select 
            value={statusFilter} 
            onValueChange={(v) => { if (v) setStatusFilter(v as LeadStatus | 'all'); }}>
            <SelectTrigger 
              id="pipeline-stage-filter-trigger"
              className={`h-9 text-xs bg-zinc-900 border text-zinc-200 rounded-xl transition-colors ${
                statusFilter !== 'all' ? 'border-zinc-500 font-medium' : 'border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="truncate">{STATUS_LABELS[statusFilter] || 'All Statuses'}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-white text-xs">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="to_call">To Call</SelectItem>
              <SelectItem value="to_email">To Email</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="meeting_booked">Meeting</SelectItem>
              <SelectItem value="closed_won">Deal Fix</SelectItem>
              <SelectItem value="not_interested">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter 4: Date Added */}
        <div className="space-y-1">
          <label 
            htmlFor="date-range-filter-trigger"
            className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1 px-1 cursor-pointer"
          >
            <Calendar className="w-3 h-3 text-zinc-500" />
            <span>Date Range</span>
          </label>
          <Select 
            value={dateFilter} 
            onValueChange={(v) => { if (v) setDateFilter(v as DateFilterOption); }}>
            <SelectTrigger 
              id="date-range-filter-trigger"
              className={`h-9 text-xs bg-zinc-900 border text-zinc-200 rounded-xl transition-colors ${
                dateFilter !== 'all' ? 'border-zinc-500 font-medium' : 'border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="truncate">{DATE_LABELS[dateFilter] || 'All Time'}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-white text-xs">
              <SelectItem value="all">All Dates (All Time)</SelectItem>
              <SelectItem value="today">Added Today</SelectItem>
              <SelectItem value="yesterday">Added Yesterday</SelectItem>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>
    </div>
  );
}
