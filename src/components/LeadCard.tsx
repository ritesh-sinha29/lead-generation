'use client';

import React, { useState } from 'react';
import { 
  ExternalLink, 
  Star, 
  Trash2, 
  FileText
} from 'lucide-react';
import { Lead, LeadStatus } from '@/types/lead';
import ServiceGapBadge from './ServiceGapBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  lead: Lead;
  onOpenBattlecard: (lead: Lead) => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onToggleStar: (id: string, starred: boolean) => void;
  onDelete: (id: string) => void;
  onAddNote: (id: string, note: string) => void;
}

export default function LeadCard({
  lead,
  onOpenBattlecard,
  onUpdateStatus,
  onToggleStar,
  onDelete,
  onAddNote
}: Props) {
  const [showNotes, setShowNotes] = useState(false);
  const [newNote, setNewNote] = useState('');

  const primaryGap = lead.audit.topGaps[0];
  const cleanPhone = (lead.phone || '').replace(/[^0-9+]/g, '');
  const cleanWhatsAppPhone = cleanPhone.replace(/^\+/, '');

  const score = lead.audit.overallHealthScore;

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(lead.id, newNote.trim());
    setNewNote('');
  };

  return (
    <div className="rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col justify-between p-4 space-y-3">
      
      {/* Top Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
              {lead.niche}
            </span>
            <span className="text-[11px] text-zinc-500 capitalize">
              {lead.city}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleStar(lead.id, !lead.starred)}
              className="text-zinc-600 hover:text-white transition-colors cursor-pointer"
            >
              <Star className={`w-3.5 h-3.5 ${lead.starred ? 'fill-white text-white' : ''}`} />
            </button>

            <span className="text-[10px] font-mono text-zinc-400">
              {score}/100
            </span>
          </div>
        </div>

        {/* Business Name */}
        <div>
          <h3 className="text-sm font-medium text-white tracking-tight flex items-center justify-between">
            <span className="truncate">{lead.businessName}</span>
            {lead.website && (
              <a
                href={lead.website}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-600 hover:text-zinc-300 ml-2"
                title="Visit Website"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </h3>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {lead.decisionMakerName} · {lead.decisionMakerRole}
          </div>
        </div>

        {/* Service Gaps */}
        <div className="flex flex-wrap gap-1">
          {lead.audit.topGaps.map((gap, i) => (
            <ServiceGapBadge key={i} service={gap.service} />
          ))}
        </div>
      </div>

      {/* Vulnerability */}
      {primaryGap && (
        <div className="p-2.5 rounded bg-zinc-900/50 border border-zinc-900 text-xs space-y-0.5">
          <div className="text-zinc-200 font-medium flex items-center justify-between text-[11px]">
            <span className="truncate">{primaryGap.serviceTitle}</span>
            <span className="font-mono text-zinc-400 shrink-0">-${primaryGap.estimatedLostRevenueMonthly}/mo</span>
          </div>
          <p className="text-[11px] text-zinc-500 line-clamp-2">
            {primaryGap.detectedIssue}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2 pt-2 border-t border-zinc-900">
        
        <div className="grid grid-cols-4 gap-1 w-full text-[11px]">
          <a
            href={`tel:${cleanPhone}`}
            onClick={() => onUpdateStatus(lead.id, 'to_call')}
            className="h-7 text-[11px] inline-flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded"
          >
            Call
          </a>

          <a
            href={`mailto:${lead.email}?subject=${encodeURIComponent(lead.pitchKit.emailSubjectLines[0] || '')}&body=${encodeURIComponent(lead.pitchKit.emailBody)}`}
            onClick={() => onUpdateStatus(lead.id, 'to_email')}
            className="h-7 text-[11px] inline-flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded"
          >
            Email
          </a>

          <a
            href={`https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(lead.pitchKit.whatsappMessage)}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => onUpdateStatus(lead.id, 'contacted')}
            className="h-7 text-[11px] inline-flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded"
          >
            WA
          </a>

          <a
            href={lead.website}
            target="_blank"
            rel="noreferrer"
            className="h-7 text-[11px] inline-flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded"
          >
            Site
          </a>
        </div>

        <Button
          onClick={() => onOpenBattlecard(lead)}
          className="w-full h-7 text-xs bg-white text-black hover:bg-zinc-200 font-medium rounded shadow-none"
        >
          Pitch Kit
        </Button>

        <div className="flex items-center justify-between gap-1 w-full">
          <Select
            value={lead.status}
            onValueChange={(val) => { if (val) onUpdateStatus(lead.id, val as LeadStatus); }}
          >
            <SelectTrigger className="h-7 text-[11px] flex-1 bg-zinc-900 border-zinc-800 text-zinc-200 rounded">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-white text-xs">
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="to_call">To Call</SelectItem>
              <SelectItem value="to_email">To Email</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="meeting_booked">Meeting Booked</SelectItem>
              <SelectItem value="closed_won">Closed Won</SelectItem>
              <SelectItem value="not_interested">Not Interested</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className={`h-7 w-7 bg-zinc-900 border-zinc-800 rounded ${showNotes ? 'text-white' : 'text-zinc-500'}`}
            onClick={() => setShowNotes(!showNotes)}
            title="Notes"
          >
            <FileText className="w-3 h-3" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 rounded"
            onClick={() => onDelete(lead.id)}
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        {/* Notes */}
        {showNotes && (
          <div className="w-full pt-2 border-t border-zinc-900 space-y-1.5">
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {(lead.notes || []).length === 0 ? (
                <p className="text-[10px] text-zinc-600 italic">No notes.</p>
              ) : (
                lead.notes.map((n, i) => (
                  <div key={i} className="text-[10px] text-zinc-400 bg-black p-1 rounded border border-zinc-900">
                    {n}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddNoteSubmit} className="flex gap-1">
              <Input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log note..."
                className="h-6 text-[10px] flex-1 bg-black border-zinc-900 text-white rounded"
              />
              <Button type="submit" size="sm" className="h-6 px-2 text-[10px] bg-zinc-800 text-white rounded">
                Save
              </Button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
}
