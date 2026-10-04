import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ExternalLink, 
  Phone, 
  MessageSquare, 
  Zap, 
  FileText, 
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Lead, LeadStatus, getLeadDealValue } from '@/types/lead';
import ServiceGapBadge from '@/components/ServiceGapBadge';
import EditableDealAmount from '@/components/EditableDealAmount';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LeadTableViewProps {
  leads: Lead[];
  onToggleStar: (id: string, starred: boolean) => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onDeleteLead: (id: string) => void;
  onOpenPitchKit: (lead: Lead) => void;
  onAddNote: (id: string, note: string) => void;
  onUpdateDealValue?: (id: string, value: number) => void;
  onClearAll?: () => void;
}

const PAGE_SIZE = 10;

export function LeadTableView({
  leads,
  onToggleStar,
  onUpdateStatus,
  onDeleteLead,
  onOpenPitchKit,
  onAddNote,
  onUpdateDealValue = () => {},
  onClearAll,
}: LeadTableViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

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

  return (
    <div className="space-y-3">
      
      {/* A. MOBILE-OPTIMIZED LEAD CARDS (< 768px) */}
      <div className="block md:hidden space-y-3">
        {leads.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs bg-zinc-950/70 border border-zinc-800 rounded-xl">
            No leads found matching current criteria.
          </div>
        ) : (
          currentLeads.map((lead) => {
            const primaryGap = lead.audit.topGaps[0];
            const cleanPhone = (lead.phone || '').replace(/[^0-9+]/g, '');
            const cleanWhatsAppPhone = cleanPhone.replace(/^\+/, '');

            return (
              <div 
                key={lead.id} 
                className="p-3.5 bg-zinc-950/90 border border-zinc-800/90 hover:border-zinc-700/80 rounded-xl space-y-3 shadow-sm transition-all"
              >
                {/* Top Row: Star + Name + Website + Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <button
                      onClick={() => onToggleStar(lead.id, !lead.starred)}
                      className="mt-0.5 text-zinc-600 hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                      <Star className={`w-4 h-4 ${lead.starred ? 'fill-white text-white' : ''}`} />
                    </button>
                    <div className="min-w-0">
                      <div className="font-semibold text-white tracking-tight flex items-center gap-1.5 text-sm">
                        <span className="truncate">{lead.businessName}</span>
                        {lead.website && (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-zinc-500 hover:text-zinc-300 shrink-0"
                            title="Open Website"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5 truncate">
                        <span>{lead.decisionMakerName}</span> · <span className="text-zinc-500">{lead.decisionMakerRole}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Select */}
                  <Select
                    value={lead.status}
                    onValueChange={(val) => { if (val) onUpdateStatus(lead.id, val as LeadStatus); }}
                  >
                    <SelectTrigger className="h-6 w-24 text-[11px] font-medium bg-zinc-900 border-zinc-800 text-zinc-300 rounded-md shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white text-xs">
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

                {/* Middle Row: Niche + City + Vulnerability Badge & Revenue Leak */}
                <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-zinc-400 font-medium truncate">{lead.niche} · <span className="capitalize">{lead.city}</span></span>
                    <span className="font-mono text-zinc-400 shrink-0">Health: {lead.audit.overallHealthScore}/100</span>
                  </div>
                  {primaryGap && (
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <ServiceGapBadge service={primaryGap.service} />
                      <span className="text-amber-400 font-mono text-[11px] font-semibold shrink-0">
                        -₹{primaryGap.estimatedLostRevenueMonthly.toLocaleString('en-IN')}/mo
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Row: Mobile 1-Tap Buttons */}
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  {cleanPhone ? (
                    <a
                      href={`tel:${cleanPhone}`}
                      onClick={() => onUpdateStatus(lead.id, 'to_call')}
                      className="h-8 px-2 text-xs inline-flex items-center justify-center gap-1.5 bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 rounded-lg transition-colors font-medium active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Call</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="h-8 px-2 text-xs inline-flex items-center justify-center gap-1.5 bg-zinc-950 border border-zinc-900 text-zinc-600 rounded-lg cursor-not-allowed font-medium"
                    >
                      <Phone className="w-3.5 h-3.5 text-zinc-700" />
                      <span>No Tel</span>
                    </button>
                  )}

                  {cleanWhatsAppPhone ? (
                    <a
                      href={`https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(lead.pitchKit.whatsappMessage)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => onUpdateStatus(lead.id, 'contacted')}
                      className="h-8 px-2 text-xs inline-flex items-center justify-center gap-1.5 bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 rounded-lg transition-colors font-medium active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="h-8 px-2 text-xs inline-flex items-center justify-center gap-1.5 bg-zinc-950 border border-zinc-900 text-zinc-600 rounded-lg cursor-not-allowed font-medium"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-700" />
                      <span>No WA</span>
                    </button>
                  )}

                  <Button
                    size="sm"
                    onClick={() => onOpenPitchKit(lead)}
                    className="h-8 px-2 text-xs bg-white text-black hover:bg-zinc-200 font-semibold rounded-lg shadow-none flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-zinc-800" />
                    <span>Pitch Kit</span>
                  </Button>
                </div>

                {/* Expandable Notes toggle */}
                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-900">
                  <button
                    onClick={() => setExpandedNotesId(expandedNotesId === lead.id ? null : lead.id)}
                    className="hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3 h-3" />
                    <span>{(lead.notes || []).length} notes logged</span>
                  </button>
                  <button
                    onClick={() => onDeleteLead(lead.id)}
                    className="text-zinc-600 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>

                {/* Mobile Expanded Notes */}
                {expandedNotesId === lead.id && (
                  <div className="p-2.5 bg-zinc-900/80 rounded-lg border border-zinc-800 space-y-2 mt-2">
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {(lead.notes || []).length === 0 ? (
                        <p className="text-[11px] text-zinc-500 italic">No notes logged yet.</p>
                      ) : (
                        lead.notes.map((note, idx) => (
                          <div key={idx} className="text-[11px] text-zinc-300 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                            {note}
                          </div>
                        ))
                      )}
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        onAddNote(lead.id, noteInput);
                        setNoteInput('');
                      }}
                      className="flex gap-1.5"
                    >
                      <input
                        type="text"
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        placeholder="Add call note..."
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none"
                      />
                      <Button type="submit" size="sm" className="h-7 text-xs bg-white text-black hover:bg-zinc-200">
                        Save
                      </Button>
                    </form>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* B. DESKTOP FULL TABLE (Tablets & Desktops: >= 768px) */}
      <div className="hidden md:block border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/70 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                <th className="py-2.5 px-3 font-semibold">Business / Decision Maker</th>
                <th className="py-2.5 px-3 font-semibold">Niche & City</th>
                <th className="py-2.5 px-3 font-semibold">Diagnosed Vulnerability</th>
                <th className="py-2.5 px-3 font-semibold">Deal Value</th>
                <th className="py-2.5 px-3 font-semibold">Score</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 text-xs">
                    No leads found matching current criteria.
                  </td>
                </tr>
              ) : (
                currentLeads.map((lead) => {
                  const primaryGap = lead.audit.topGaps[0];
                  const cleanPhone = (lead.phone || '').replace(/[^0-9+]/g, '');
                  const cleanWhatsAppPhone = cleanPhone.replace(/^\+/, '');
                  const dealValue = getLeadDealValue(lead);

                  return (
                    <React.Fragment key={lead.id}>
                      <tr className="hover:bg-zinc-900/40 transition-colors group">
                        
                        {/* Business & Decision Maker */}
                        <td className="py-3 px-3">
                          <div className="flex items-start gap-2">
                            <button
                              onClick={() => onToggleStar(lead.id, !lead.starred)}
                              className="mt-0.5 text-zinc-600 hover:text-white transition-colors cursor-pointer shrink-0"
                            >
                              <Star className={`w-3.5 h-3.5 ${lead.starred ? 'fill-white text-white' : ''}`} />
                            </button>
                            <div>
                              <div className="font-medium text-white tracking-tight flex items-center gap-1.5">
                                <span className="group-hover:text-zinc-200 transition-colors">{lead.businessName}</span>
                                {lead.website && (
                                  <a
                                    href={lead.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-zinc-600 hover:text-zinc-300 shrink-0"
                                    title="Open Website"
                                  >
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-500 mt-0.5">
                                <span>{lead.decisionMakerName}</span> · {lead.decisionMakerRole}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Niche & Location */}
                        <td className="py-3 px-3">
                          <span className="text-[11px] text-zinc-300 font-medium">{lead.niche}</span>
                          <div className="text-[11px] text-zinc-500 capitalize">{lead.city}</div>
                        </td>

                        {/* Diagnosed Vulnerability with Tag */}
                        <td className="py-3 px-3 max-w-xs">
                          {primaryGap ? (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <ServiceGapBadge service={primaryGap.service} />
                                <span className="text-zinc-400 font-mono text-[11px] shrink-0">-₹{primaryGap.estimatedLostRevenueMonthly.toLocaleString('en-IN')}/mo</span>
                              </div>
                              <div className="text-[11px] text-zinc-500 truncate">{primaryGap.detectedIssue}</div>
                            </div>
                          ) : (
                            <span className="text-zinc-600">None detected</span>
                          )}
                        </td>

                        {/* Deal Value (Editable) */}
                        <td className="py-3 px-3">
                          <EditableDealAmount
                            leadId={lead.id}
                            value={dealValue}
                            onUpdate={onUpdateDealValue}
                            variant="table"
                          />
                        </td>

                        {/* Score */}
                        <td className="py-3 px-3">
                          <span className="text-[11px] font-mono text-zinc-400">
                            {lead.audit.overallHealthScore}/100
                          </span>
                        </td>

                        {/* Status Pill Dropdown */}
                        <td className="py-3 px-3">
                          <Select
                            value={lead.status}
                            onValueChange={(val) => { if (val) onUpdateStatus(lead.id, val as LeadStatus); }}
                          >
                            <SelectTrigger className="h-6 w-28 text-[11px] font-medium bg-zinc-900 border-zinc-800 text-zinc-300 rounded">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-800 text-white text-xs">
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="to_call">To Call</SelectItem>
                              <SelectItem value="to_email">To Email</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="meeting_booked">Meeting</SelectItem>
                              <SelectItem value="closed_won">Deal Fix</SelectItem>
                              <SelectItem value="not_interested">Lost</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            
                            {cleanPhone ? (
                              <a
                                href={`tel:${cleanPhone}`}
                                onClick={() => onUpdateStatus(lead.id, 'to_call')}
                                className="h-6 px-2 text-[11px] inline-flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded transition-colors"
                                title={`Call ${cleanPhone}`}
                              >
                                <Phone className="w-3 h-3 mr-1 text-zinc-400" />
                                Call
                              </a>
                            ) : (
                              <span
                                className="h-6 px-2 text-[11px] inline-flex items-center justify-center bg-zinc-950 border border-zinc-900 text-zinc-600 rounded cursor-not-allowed"
                                title="No phone detected on website / Google"
                              >
                                <Phone className="w-3 h-3 mr-1 text-zinc-700" />
                                No Tel
                              </span>
                            )}

                            {cleanWhatsAppPhone ? (
                              <a
                                href={`https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(lead.pitchKit.whatsappMessage)}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => onUpdateStatus(lead.id, 'contacted')}
                                className="h-6 px-2 text-[11px] inline-flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded transition-colors"
                                title={`WhatsApp ${cleanWhatsAppPhone}`}
                              >
                                <MessageSquare className="w-3 h-3 mr-1 text-zinc-400" />
                                WA
                              </a>
                            ) : (
                              <span
                                className="h-6 px-2 text-[11px] inline-flex items-center justify-center bg-zinc-950 border border-zinc-900 text-zinc-600 rounded cursor-not-allowed"
                                title="No WhatsApp phone available"
                              >
                                <MessageSquare className="w-3 h-3 mr-1 text-zinc-700" />
                                No WA
                              </span>
                            )}

                            <Button
                              size="sm"
                              onClick={() => onOpenPitchKit(lead)}
                              className="h-6 px-2.5 text-[11px] bg-white text-black hover:bg-zinc-200 font-medium rounded shadow-none cursor-pointer"
                            >
                              Pitch Kit
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-6 w-6 rounded cursor-pointer ${expandedNotesId === lead.id ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
                              onClick={() => setExpandedNotesId(expandedNotesId === lead.id ? null : lead.id)}
                              title="Notes"
                            >
                              <FileText className="w-3 h-3" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-zinc-600 hover:text-red-400 rounded cursor-pointer"
                              onClick={() => onDeleteLead(lead.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>

                          </div>
                        </td>

                      </tr>

                      {/* Notes Row */}
                      {expandedNotesId === lead.id && (
                        <tr className="bg-zinc-950 border-b border-zinc-800">
                          <td colSpan={8} className="p-3 space-y-2">
                            <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                              <span>Call Log · {lead.businessName}</span>
                              <span>{lead.phone}</span>
                            </div>

                            <div className="space-y-1 max-h-24 overflow-y-auto">
                              {(lead.notes || []).length === 0 ? (
                                <p className="text-[11px] text-zinc-600 italic">No notes logged yet.</p>
                              ) : (
                                lead.notes.map((note, idx) => (
                                  <div key={idx} className="text-[11px] text-zinc-300 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                                    {note}
                                  </div>
                                ))
                              )}
                            </div>

                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                onAddNote(lead.id, noteInput);
                                setNoteInput('');
                              }}
                              className="flex gap-1.5 pt-1"
                            >
                              <Input
                                type="text"
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                placeholder="Add quick note..."
                                className="h-7 text-xs bg-zinc-900 border-zinc-800 text-white flex-1 rounded"
                              />
                              <Button type="submit" size="sm" className="h-7 px-3 text-xs bg-zinc-800 text-white hover:bg-zinc-700 rounded">
                                Save
                              </Button>
                            </form>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* C. PAGINATION CONTROLS (Max 10 per page) */}
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
