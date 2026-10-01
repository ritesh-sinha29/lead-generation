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
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
    <Card className="hover:border-primary/50 transition-all duration-200 flex flex-col justify-between group shadow-xs">
      
      <CardHeader className="p-5 pb-3 space-y-2">
        {/* Top Badges & Meta */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="text-[10px] font-bold">
              {lead.niche}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              {lead.city}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleStar(lead.id, !lead.starred)}
              className="p-1 text-muted-foreground hover:text-accent transition-colors cursor-pointer"
              title={lead.starred ? 'Starred' : 'Mark as high priority'}
            >
              <Star className={`w-3.5 h-3.5 ${lead.starred ? 'fill-accent text-accent' : ''}`} />
            </button>

            <Badge variant={score < 50 ? "destructive" : score < 70 ? "secondary" : "outline"} className="text-[10px] font-bold">
              {score}/100
            </Badge>
          </div>
        </div>

        {/* Business Name & Decision Maker */}
        <div>
          <h3 className="text-base font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
            {lead.businessName}
          </h3>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <span className="text-foreground font-semibold">{lead.decisionMakerName}</span>
            <span>•</span>
            <span className="truncate">{lead.decisionMakerRole}</span>
          </div>
        </div>

        {/* Service Gaps */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {lead.audit.topGaps.map((gap, i) => (
            <ServiceGapBadge key={i} service={gap.service} />
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-5 py-0 space-y-3">
        {/* Diagnosed Vulnerability Box */}
        {primaryGap && (
          <div className="p-3 rounded-xl bg-background border border-border text-xs space-y-1">
            <div className="font-bold text-foreground flex items-center justify-between">
              <span className="text-primary truncate">{primaryGap.serviceTitle}</span>
              <span className="text-destructive font-black shrink-0">-${primaryGap.estimatedLostRevenueMonthly}/mo</span>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-2">
              {primaryGap.detectedIssue}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-3 flex flex-col gap-2.5">
        <Separator className="mb-1" />

        {/* Quick Contact Buttons */}
        <div className="grid grid-cols-4 gap-1.5 w-full">
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="h-8 text-xs font-semibold"
          >
            <a href={`tel:${cleanPhone}`} onClick={() => onUpdateStatus(lead.id, 'to_call')}>
              <Phone className="w-3 h-3 mr-1" />
              Call
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold"
          >
            <a href={`mailto:${lead.email}?subject=${encodeURIComponent(lead.pitchKit.emailSubjectLines[0])}&body=${encodeURIComponent(lead.pitchKit.emailBody)}`} onClick={() => onUpdateStatus(lead.id, 'to_email')}>
              <Mail className="w-3 h-3 mr-1" />
              Email
            </a>
          </Button>

          <Button
            asChild
            variant="secondary"
            size="sm"
            className="h-8 text-xs font-semibold"
          >
            <a href={`https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(lead.pitchKit.whatsappMessage)}`} target="_blank" rel="noreferrer" onClick={() => onUpdateStatus(lead.id, 'contacted')}>
              <MessageSquare className="w-3 h-3 mr-1" />
              WA
            </a>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 text-xs font-semibold"
          >
            <a href={lead.website} target="_blank" rel="noreferrer">
              <ExternalLink className="w-3 h-3 mr-1" />
              Site
            </a>
          </Button>
        </div>

        {/* Sales Closer Battlecard Button */}
        <Button
          onClick={() => onOpenBattlecard(lead)}
          className="w-full h-9 font-bold text-xs"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          <span>Sales Closer Battlecard</span>
          <ChevronRight className="w-3.5 h-3.5 ml-auto" />
        </Button>

        {/* Status Dropdown & Action Controls */}
        <div className="flex items-center justify-between gap-1.5 w-full">
          <Select
            value={lead.status}
            onValueChange={(val) => onUpdateStatus(lead.id, val as LeadStatus)}
          >
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New Lead</SelectItem>
              <SelectItem value="to_call">To Call 📞</SelectItem>
              <SelectItem value="to_email">To Email ✉️</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="meeting_booked">Meeting Booked 📅</SelectItem>
              <SelectItem value="closed_won">Closed Won 🏆</SelectItem>
              <SelectItem value="not_interested">Not Interested</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowNotes(!showNotes)}
            title="Notes"
          >
            <FileText className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(lead.id)}
            title="Delete Lead"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Notes Drawer */}
        {showNotes && (
          <div className="w-full pt-2 border-t border-border space-y-2">
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {lead.notes.map((n, i) => (
                <div key={i} className="text-[11px] text-muted-foreground bg-background p-1.5 rounded border border-border">
                  • {n}
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNoteSubmit} className="flex gap-1">
              <Input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add call outcome / note..."
                className="h-8 text-xs flex-1"
              />
              <Button type="submit" size="sm" className="h-8 px-2.5">
                Save
              </Button>
            </form>
          </div>
        )}

      </CardFooter>

    </Card>
  );
}
