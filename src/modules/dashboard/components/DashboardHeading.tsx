'use client';

import React from 'react';
import { 
  LayoutGrid, 
  Plus, 
  Phone, 
  Zap,
  Kanban 
} from 'lucide-react';
import { LeadStatus } from '@/types/lead';
import { ViewMode } from './DashboardSidebar';

interface DashboardHeadingProps {
  statusFilter: LeadStatus | 'all';
  viewMode: ViewMode;
  onOpenGenerator: () => void;
  onFilterToCall: () => void;
  onToggleCards: () => void;
  onToggleKanban?: () => void;
}

export function DashboardHeading({
  statusFilter,
  viewMode,
  onOpenGenerator,
  onFilterToCall,
  onToggleCards,
  onToggleKanban,
}: DashboardHeadingProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
          <LayoutGrid className="w-4 h-4" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Dashboard</h1>
      </div>
      <p className="text-xs sm:text-sm text-zinc-400">
        Overview of agency pipeline value, qualified leads, outreach velocity, and flaw diagnostics.
      </p>

      {/* Quick Action Pill Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={onOpenGenerator}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-zinc-300" />
          <span>Add Lead Batch</span>
        </button>

        <button
          onClick={onFilterToCall}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
            statusFilter === 'to_call'
              ? 'bg-zinc-800 text-white border-zinc-600'
              : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <Phone className="w-3.5 h-3.5 text-zinc-400" />
          <span>Pending Calls</span>
        </button>

        {onToggleKanban && (
          <button
            onClick={onToggleKanban}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
              viewMode === 'kanban'
                ? 'bg-zinc-800 text-white border-zinc-600'
                : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <Kanban className="w-3.5 h-3.5 text-zinc-400" />
            <span>Pipeline Board</span>
          </button>
        )}

        <button
          onClick={onToggleCards}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
            viewMode === 'cards'
              ? 'bg-zinc-800 text-white border-zinc-600'
              : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-zinc-400" />
          <span>Lead Cards</span>
        </button>
      </div>
    </div>
  );
}
