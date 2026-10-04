'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Lead, LeadStatus } from '@/types/lead';
import LeadCard from '@/components/LeadCard';
import { Button } from '@/components/ui/button';

interface LeadCardsViewProps {
  leads: Lead[];
  onOpenPitchKit: (lead: Lead) => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onToggleStar: (id: string, starred: boolean) => void;
  onDeleteLead: (id: string) => void;
  onAddNote: (id: string, note: string) => void;
  onUpdateDealValue?: (id: string, value: number) => void;
}

const PAGE_SIZE = 10;

export function LeadCardsView({
  leads,
  onOpenPitchKit,
  onUpdateStatus,
  onToggleStar,
  onDeleteLead,
  onAddNote,
  onUpdateDealValue = () => {},
}: LeadCardsViewProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(leads.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [leads.length, totalPages, currentPage]);

  const startIndex = leads.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE;
  const currentLeads = leads.slice(startIndex, startIndex + PAGE_SIZE);
  const displayStart = leads.length === 0 ? 0 : startIndex + 1;
  const displayEnd = Math.min(startIndex + PAGE_SIZE, leads.length);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  if (leads.length === 0) {
    return (
      <div className="py-12 text-center text-zinc-500 text-xs bg-zinc-950/70 border border-zinc-800 rounded-xl">
        No leads found matching current criteria.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {currentLeads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onOpenBattlecard={onOpenPitchKit}
            onUpdateStatus={onUpdateStatus}
            onToggleStar={onToggleStar}
            onDelete={onDeleteLead}
            onAddNote={onAddNote}
            onUpdateDealValue={onUpdateDealValue}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {leads.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 px-1 overflow-x-auto max-w-full">
          <div className="text-zinc-400 font-mono text-xs shrink-0">
            Showing <span className="text-white font-semibold">{displayStart}</span>–<span className="text-white font-semibold">{displayEnd}</span> of <span className="text-white font-semibold">{leads.length}</span> leads
          </div>

          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto max-w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-8 px-2.5 text-xs bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg cursor-pointer flex items-center gap-1 shrink-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((p, i) =>
                typeof p === 'number' ? (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(p)}
                    className={`h-8 min-w-[32px] px-2 text-xs font-mono font-medium rounded-lg transition-colors cursor-pointer ${
                      currentPage === p
                        ? 'bg-white text-black font-semibold shadow-xs'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {p}
                  </button>
                ) : (
                  <span key={i} className="px-1 text-zinc-600 font-mono text-xs">
                    {p}
                  </span>
                )
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-2.5 text-xs bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
