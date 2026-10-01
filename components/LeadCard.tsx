'use client';

import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  ExternalLink, 
  Star, 
  ChevronRight, 
  Trash2, 
  FileText, 
  AlertTriangle, 
  Sparkles 
} from 'lucide-react';
import { Lead, LeadStatus } from '@/types/lead';
import ServiceGapBadge from './ServiceGapBadge';

interface Props {
  lead: Lead;
  onOpenBattlecard: (lead: Lead) => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onToggleStar: (id: string, starred: boolean) => void;
  onDelete: (id: string) => void;
  onAddNote: (id: string, note: string) => void;
}

const STATUS_OPTIONS: { id: LeadStatus; label: string }[] = [
  { id: 'new', label: 'New Lead' },
  { id: 'to_call', label: 'To Call 📞' },
  { id: 'to_email', label: 'To Email ✉️' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'meeting_booked', label: 'Meeting Booked 📅' },
  { id: 'closed_won', label: 'Closed Won 🏆' },
  { id: 'not_interested', label: 'Not Interested' },
];

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

  // Score
  const score = lead.audit.overallHealthScore;
  const scoreColor = score < 50 ? 'text-destructive border-destructive/40 bg-destructive/10' 
    : score < 70 ? 'text-accent border-accent/40 bg-accent/10' 
    : 'text-secondary border-secondary/40 bg-secondary/10';

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(lead.id, newNote.trim());
    setNewNote('');
  };

  return (
    <div className="p-5 rounded-2xl bg-card text-card-foreground border border-border shadow-sm hover:border-primary/50 transition-all duration-200 group flex flex-col justify-between">
      
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border">
                {lead.niche} • {lead.city}
              </span>
              <span className="text-[11px] text-accent font-semibold flex items-center gap-0.5">
                ★ {lead.googleRating} <span className="text-muted-foreground font-normal">({lead.googleReviewsCount})</span>
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
              {lead.businessName}
            </h3>

            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span className="text-foreground font-semibold">{lead.decisionMakerName}</span>
              <span>•</span>
              <span className="text-muted-foreground truncate">{lead.decisionMakerRole}</span>
            </div>
          </div>

          {/* Star & Score Gauge */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleStar(lead.id, !lead.starred)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-accent transition-colors cursor-pointer"
              title={lead.starred ? 'Starred' : 'Mark as high priority'}
            >
              <Star className={`w-4 h-4 ${lead.starred ? 'fill-accent text-accent' : ''}`} />
            </button>

            <div className={`px-2 py-1 rounded-lg border text-xs font-black ${scoreColor}`} title="Website Health Score (Lower score = more sales opportunities)">
              {score}/100
            </div>
          </div>

        </div>

        {/* 5-Service Gap Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {lead.audit.topGaps.map((gap, i) => (
            <ServiceGapBadge key={i} service={gap.service} />
          ))}
        </div>

        {/* Smoking Gun Flaw Preview Box */}
        {primaryGap && (
          <div className="p-3 rounded-xl bg-background border border-border mb-4 text-xs space-y-1">
            <div className="font-bold text-foreground flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>Diagnosed Gap: {primaryGap.serviceTitle}</span>
            </div>
            <p className="text-muted-foreground line-clamp-2">
              {primaryGap.detectedIssue}
            </p>
          </div>
        )}

      </div>

      {/* Bottom Actions & CRM Controls */}
      <div className="pt-3 border-t border-border space-y-3">
        
        {/* Quick Contact Buttons */}
        <div className="grid grid-cols-4 gap-1.5">
          
          {/* Call */}
          <a
            href={`tel:${cleanPhone}`}
            onClick={() => onUpdateStatus(lead.id, 'to_call')}
            className="py-1.5 px-2 rounded-lg bg-secondary/15 hover:bg-secondary/30 border border-secondary/30 text-secondary text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            title={`Call ${lead.phone}`}
          >
            <Phone className="w-3 h-3" />
            <span>Call</span>
          </a>

          {/* Email */}
          <a
            href={`mailto:${lead.email}?subject=${encodeURIComponent(lead.pitchKit.emailSubjectLines[0])}&body=${encodeURIComponent(lead.pitchKit.emailBody)}`}
            onClick={() => onUpdateStatus(lead.id, 'to_email')}
            className="py-1.5 px-2 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            title={`Email ${lead.email}`}
          >
            <Mail className="w-3 h-3" />
            <span>Email</span>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(lead.pitchKit.whatsappMessage)}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => onUpdateStatus(lead.id, 'contacted')}
            className="py-1.5 px-2 rounded-lg bg-secondary/15 hover:bg-secondary/30 border border-secondary/30 text-secondary text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            title="Open WhatsApp chat"
          >
            <MessageSquare className="w-3 h-3" />
            <span>WA</span>
          </a>

          {/* Website */}
          <a
            href={lead.website}
            target="_blank"
            rel="noreferrer"
            className="py-1.5 px-2 rounded-lg bg-muted hover:bg-background border border-border text-foreground text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            title="Visit Website"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Site</span>
          </a>

        </div>

        {/* Master Closer Battlecard Trigger */}
        <button
          onClick={() => onOpenBattlecard(lead)}
          className="w-full py-2.5 px-3 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Open Sales Battlecard & Scripts</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Status Dropdown & Notes Button */}
        <div className="flex items-center justify-between gap-2 text-xs">
          
          <select
            value={lead.status}
            onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
            className="flex-1 py-1 px-2.5 rounded-lg bg-background border border-border text-foreground font-medium focus:outline-none focus:border-primary text-xs cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className="p-1.5 rounded-lg bg-background text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer"
            title="View or add notes"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(lead.id)}
            className="p-1.5 rounded-lg bg-background text-destructive hover:opacity-80 border border-border transition-colors cursor-pointer"
            title="Delete lead"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

        </div>

        {/* Notes Drawer */}
        {showNotes && (
          <div className="pt-2 border-t border-border space-y-2">
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {lead.notes.map((n, i) => (
                <div key={i} className="text-[11px] text-muted-foreground bg-background p-1.5 rounded border border-border">
                  • {n}
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNoteSubmit} className="flex gap-1">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add call outcome / note..."
                className="flex-1 px-2 py-1 rounded bg-background border border-border text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-bold cursor-pointer"
              >
                Save
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
}
