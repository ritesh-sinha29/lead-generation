'use client';

import React, { useState } from 'react';
import { 
  ArrowRight,
  GripVertical,
  Phone,
  MessageSquare,
  Zap
} from 'lucide-react';
import { Lead, LeadStatus, getLeadDealValue } from '@/types/lead';
import ServiceGapBadge from '@/components/ServiceGapBadge';
import { Button } from '@/components/ui/button';
import EditableDealAmount from '@/components/EditableDealAmount';

interface KanbanColumn {
  status: LeadStatus;
  title: string;
  color: string;
  border: string;
  leads: Lead[];
}

interface LeadKanbanViewProps {
  kanbanColumns: KanbanColumn[];
  onOpenPitchKit: (lead: Lead) => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onUpdateDealValue?: (id: string, value: number) => void;
}

const STAGE_DOTS: Record<LeadStatus, string> = {
  new: 'bg-sky-400',
  to_call: 'bg-amber-400',
  to_email: 'bg-blue-400',
  contacted: 'bg-purple-400',
  meeting_booked: 'bg-indigo-400',
  closed_won: 'bg-emerald-400',
  not_interested: 'bg-zinc-500',
};

export function LeadKanbanView({
  kanbanColumns,
  onOpenPitchKit,
  onUpdateStatus,
  onUpdateDealValue = () => {},
}: LeadKanbanViewProps) {
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedLeadId(leadId);
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (status: LeadStatus) => {
    setDragOverColumn(status);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      onUpdateStatus(leadId, targetStatus);
    }
    setDraggedLeadId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="overflow-x-auto pb-6 pt-1 flex gap-4 select-none scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
      {kanbanColumns.map((col) => {
        const colDealSum = col.leads.reduce((sum, l) => sum + getLeadDealValue(l), 0);
        const isOver = dragOverColumn === col.status;
        const dotColor = STAGE_DOTS[col.status] || 'bg-zinc-400';

        return (
          <div 
            key={col.status} 
            onDragOver={handleDragOver}
            onDragEnter={() => handleDragEnter(col.status)}
            onDrop={(e) => handleDrop(e, col.status)}
            className={`w-[320px] min-w-[320px] sm:w-[340px] sm:min-w-[340px] shrink-0 border rounded-2xl p-3.5 flex flex-col min-h-[600px] shadow-sm transition-all duration-150 ${
              isOver 
                ? 'bg-zinc-900/90 border-zinc-500 ring-2 ring-zinc-500/40' 
                : 'border-zinc-850 bg-zinc-950/90'
            }`}
          >
            
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-850">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0 ring-4 ring-zinc-900`} />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white tracking-tight truncate font-sans">
                    {col.title}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    ₹{(colDealSum / 1000).toLocaleString('en-IN', { maximumFractionDigits: 0 })}k pipeline
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-zinc-300 bg-zinc-900 px-2.5 py-0.5 rounded-lg border border-zinc-800 shrink-0">
                {col.leads.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
              {col.leads.length === 0 ? (
                <div className={`h-32 border border-dashed rounded-xl flex items-center justify-center text-center p-3 transition-colors ${
                  isOver ? 'border-zinc-500 bg-zinc-900/50 text-zinc-300' : 'border-zinc-850 text-zinc-600'
                }`}>
                  <span className="text-xs font-medium">
                    {isOver ? 'Drop lead here' : 'No leads in this stage'}
                  </span>
                </div>
              ) : (
                col.leads.map((lead) => {
                  const primaryGap = lead.audit.topGaps[0];
                  const cleanPhone = (lead.phone || '').replace(/[^0-9+]/g, '');
                  const cleanWhatsAppPhone = cleanPhone.replace(/^\+/, '');
                  const isBeingDragged = draggedLeadId === lead.id;
                  const dealValue = getLeadDealValue(lead);

                  return (
                    <div 
                      key={lead.id} 
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={handleDragEnd}
                      className={`p-3.5 rounded-xl border space-y-3 transition-all cursor-grab active:cursor-grabbing ${
                        isBeingDragged
                          ? 'opacity-40 border-dashed border-zinc-500 bg-zinc-900/20 scale-[0.98]'
                          : 'border-zinc-850 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80 shadow-xs'
                      }`}
                    >
                      
                      {/* Business & Decision Maker */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                          <GripVertical className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5 -ml-1 cursor-grab" />
                          <div className="min-w-0 flex-1">
                            <div 
                              className="font-semibold text-white text-sm tracking-tight leading-snug line-clamp-2"
                              title={lead.businessName}
                            >
                              {lead.businessName}
                            </div>
                            <div className="text-xs text-zinc-400 mt-1 truncate flex items-center gap-1">
                              <span className="truncate">{lead.decisionMakerName}</span>
                              {lead.city && <span className="text-zinc-500 shrink-0"> · {lead.city}</span>}
                            </div>
                          </div>
                        </div>
                        <span 
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 font-medium shrink-0" 
                          title="Health Score"
                        >
                          {lead.audit.overallHealthScore}/100
                        </span>
                      </div>

                      {/* Diagnosed Vulnerability & Lost Revenue Leak */}
                      {primaryGap && (
                        <div className="p-2 rounded-lg bg-zinc-950/70 border border-zinc-850 flex items-center justify-between gap-2 text-[11px]">
                          <ServiceGapBadge service={primaryGap.service} />
                          <span 
                            className="font-mono text-amber-400 text-xs font-semibold shrink-0 whitespace-nowrap" 
                            title="Monthly Revenue Leak"
                          >
                            -₹{primaryGap.estimatedLostRevenueMonthly.toLocaleString('en-IN')}/mo
                          </span>
                        </div>
                      )}

                      {/* Deal Quote / Value */}
                      <div className="flex items-center justify-between gap-2 text-xs pt-0.5">
                        <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider whitespace-nowrap font-medium">
                          Deal Quote
                        </span>
                        <EditableDealAmount
                          leadId={lead.id}
                          value={dealValue}
                          onUpdate={onUpdateDealValue}
                          variant="badge"
                        />
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center justify-between gap-1.5 pt-2.5 border-t border-zinc-850">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPitchKit(lead);
                          }}
                          className="h-7 px-2.5 text-xs bg-white text-black hover:bg-zinc-200 font-semibold rounded-lg shadow-none cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
                        >
                          <Zap className="w-3 h-3 text-zinc-800" />
                          <span>Pitch Kit</span>
                        </Button>

                        <div className="flex items-center gap-1">
                          {cleanPhone ? (
                            <a
                              href={`tel:${cleanPhone}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(lead.id, 'to_call');
                              }}
                              className="h-7 px-2 text-xs inline-flex items-center justify-center bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 rounded-lg transition-colors font-medium whitespace-nowrap"
                              title={`Call ${cleanPhone}`}
                            >
                              <Phone className="w-3 h-3 mr-1 text-emerald-400 shrink-0" />
                              <span>Call</span>
                            </a>
                          ) : (
                            <span
                              className="h-7 px-2 text-[10px] inline-flex items-center justify-center bg-zinc-950 border border-zinc-900 text-zinc-600 rounded-lg cursor-not-allowed whitespace-nowrap"
                              title="No phone detected"
                            >
                              No Tel
                            </span>
                          )}

                          {cleanWhatsAppPhone && (
                            <a
                              href={`https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(lead.pitchKit.whatsappMessage)}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="h-7 px-2 text-xs inline-flex items-center justify-center bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 rounded-lg transition-colors font-medium whitespace-nowrap"
                              title={`WhatsApp ${cleanWhatsAppPhone}`}
                            >
                              <MessageSquare className="w-3 h-3 mr-1 text-emerald-400 shrink-0" />
                              <span>WA</span>
                            </a>
                          )}

                          {col.status !== 'closed_won' && col.status !== 'not_interested' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer ml-0.5 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextMap: Record<LeadStatus, LeadStatus> = {
                                  new: 'to_call',
                                  to_call: 'to_email',
                                  to_email: 'contacted',
                                  contacted: 'meeting_booked',
                                  meeting_booked: 'closed_won',
                                  closed_won: 'closed_won',
                                  not_interested: 'new'
                                };
                                onUpdateStatus(lead.id, nextMap[lead.status]);
                              }}
                              title="Advance to next stage"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>

                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
