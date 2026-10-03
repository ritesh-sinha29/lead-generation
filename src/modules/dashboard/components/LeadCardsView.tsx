'use client';

import React from 'react';
import { Lead, LeadStatus } from '@/types/lead';
import LeadCard from '@/components/LeadCard';

interface LeadCardsViewProps {
  leads: Lead[];
  onOpenPitchKit: (lead: Lead) => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onToggleStar: (id: string, starred: boolean) => void;
  onDeleteLead: (id: string) => void;
  onAddNote: (id: string, note: string) => void;
}

export function LeadCardsView({
  leads,
  onOpenPitchKit,
  onUpdateStatus,
  onToggleStar,
  onDeleteLead,
  onAddNote,
}: LeadCardsViewProps) {
  if (leads.length === 0) {
    return (
      <div className="py-12 text-center text-zinc-500 text-xs bg-zinc-950/70 border border-zinc-800 rounded-xl">
        No leads found matching current criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {leads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          onOpenBattlecard={onOpenPitchKit}
          onUpdateStatus={onUpdateStatus}
          onToggleStar={onToggleStar}
          onDelete={onDeleteLead}
          onAddNote={onAddNote}
        />
      ))}
    </div>
  );
}
