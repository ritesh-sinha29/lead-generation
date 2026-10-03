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
  Calendar
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
      {/* Container Header: Title + View Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-sans">
            Lead Pipeline & Conversion
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Track qualified agency deal volume alongside outreach conversion velocity.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 overflow-x-auto scrollbar-none">
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

      {/* Filter and Search Bar inside the container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by business name, city, or niche..."
            className="pl-9 h-8 text-xs bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 rounded-lg focus:border-zinc-500 focus:ring-0"
          />
        </div>

        {/* Starred Filter & Clear Counter */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOnlyStarred(!onlyStarred)}
            className={`h-8 text-xs px-2.5 rounded-lg cursor-pointer ${
              onlyStarred ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-transparent border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Star className={`w-3 h-3 mr-1 ${onlyStarred ? 'fill-white text-white' : ''}`} />
            <span>Starred</span>
          </Button>

          <span className="text-zinc-500 font-mono text-[11px]">
            {filteredCount} of {totalLeads}
          </span>

          {totalLeads > 0 && onClearAllLeads && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAllLeads}
              className="h-8 text-xs px-2.5 rounded-lg border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-800/60 hover:bg-red-950/20 cursor-pointer transition-colors"
              title="Delete all leads in database"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              <span>Mass Delete</span>
            </Button>
          )}

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 ml-1 cursor-pointer transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Responsive 4-Dropdown Filter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
        <Select value={selectedNiche} onValueChange={(val) => { if (val) setSelectedNiche(val); }}>
          <SelectTrigger className="h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-300 rounded-lg">
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
          <SelectTrigger className="h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-300 rounded-lg">
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
          <SelectTrigger className="h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-300 rounded-lg">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800 text-white text-xs">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="to_call">To Call</SelectItem>
            <SelectItem value="to_email">To Email</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="meeting_booked">Meeting Booked</SelectItem>
            <SelectItem value="closed_won">Deal Fix</SelectItem>
            <SelectItem value="not_interested">Lost</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={(v) => { if (v) setDateFilter(v as DateFilterOption); }}>
          <SelectTrigger className="h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-300 rounded-lg flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <SelectValue placeholder="All Time" />
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
  );
}
