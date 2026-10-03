import React from 'react';
import { Search, Filter, Star, X } from 'lucide-react';
import { LeadStatus, ServiceCategory } from '@/types/lead';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: LeadStatus | 'all';
  onStatusFilterChange: (s: LeadStatus | 'all') => void;
  serviceFilter: ServiceCategory | 'all';
  onServiceFilterChange: (s: ServiceCategory | 'all') => void;
  starredOnly: boolean;
  onStarredOnlyChange: (starred: boolean) => void;
  totalFilteredCount: number;
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  serviceFilter,
  onServiceFilterChange,
  starredOnly,
  onStarredOnlyChange,
  totalFilteredCount
}: FilterBarProps) {
  return (
    <div className="p-4 rounded-2xl bg-card text-card-foreground border border-border shadow-sm mb-6 space-y-4">
      
      {/* Top Row: Search & Fast Filter Buttons */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search business, owner, phone, city..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-background border border-border text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All Leads' },
            { id: 'new', label: 'New' },
            { id: 'to_call', label: 'To Call' },
            { id: 'contacted', label: 'Contacted' },
            { id: 'meeting_booked', label: 'Meetings 📅' },
            { id: 'closed_won', label: 'Won 🏆' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onStatusFilterChange(tab.id as LeadStatus | 'all')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Bottom Row: Service Gap Tags & Starred Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border text-xs">
        
        {/* Service Gap Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            Target Gap:
          </span>

          {[
            { id: 'all', label: 'All Services' },
            { id: 'chatbots', label: '🤖 AI Chatbots' },
            { id: 'calling_agents', label: '📞 Voice Agents' },
            { id: 'web_app', label: '🌐 Web/App Dev' },
            { id: 'seo_aeo_geo', label: '🔍 SEO/GEO' },
            { id: 'portfolio', label: '💼 Portfolio' },
          ].map((gap) => (
            <button
              key={gap.id}
              onClick={() => onServiceFilterChange(gap.id as ServiceCategory | 'all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                serviceFilter === gap.id
                  ? 'bg-secondary text-secondary-foreground shadow-xs'
                  : 'bg-background text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {gap.label}
            </button>
          ))}
        </div>

        {/* Starred Toggle & Counter */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onStarredOnlyChange(!starredOnly)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
              starredOnly
                ? 'bg-accent/30 border-accent text-foreground font-semibold'
                : 'bg-background border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${starredOnly ? 'fill-accent text-accent' : ''}`} />
            <span>High Priority</span>
          </button>

          <span className="text-muted-foreground font-medium">
            Showing <strong className="text-foreground">{totalFilteredCount}</strong> leads
          </span>
        </div>

      </div>

    </div>
  );
}
