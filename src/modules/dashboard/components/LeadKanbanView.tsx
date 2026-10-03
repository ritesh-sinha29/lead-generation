'use client';

import React, { useState } from 'react';
import { 
  ArrowRight,
  GripVertical
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5 pb-4 select-none">
      {kanbanColumns.map((col) => {
        const colDealSum = col.leads.reduce((sum, l) => sum + getLeadDealValue(l), 0);

        const isOver = dragOverColumn === col.status;

        return (
          <div 
            key={col.status} 
            onDragOver={handleDragOver}
            onDragEnter={() => handleDragEnter(col.status)}
            onDrop={(e) => handleDrop(e, col.status)}
            className={`border rounded-xl p-2.5 flex flex-col min-h-[520px] shadow-xs transition-all duration-150 ${
              isOver 
                ? 'bg-zinc-900/80 border-zinc-500 ring-2 ring-zinc-500/40' 
                : 'border-zinc-800 bg-zinc-950/80'
            }`}
          >
            
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
              <div className="min-w-0 pr-1">
                <div className="text-xs font-semibold text-zinc-200 truncate">{col.title}</div>
                <div className="text-[10px] text-zinc-500 font-mono">₹{(colDealSum / 1000).toFixed(0)}k pipe</div>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 shrink-0">
                {col.leads.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-2 flex-1 overflow-y-auto">
              {col.leads.length === 0 ? (
                <div className={`h-24 border border-dashed rounded-lg flex items-center justify-center text-center p-2 transition-colors ${
                  isOver ? 'border-zinc-500 bg-zinc-900/50 text-zinc-300' : 'border-zinc-900 text-zinc-600'
                }`}>
                  <span className="text-[11px]">
                    {isOver ? 'Drop lead here' : 'No leads in this stage'}
                  </span>
                </div>
              ) : (
                col.leads.map((lead) => {
                  const primaryGap = lead.audit.topGaps[0];
                  const cleanPhone = (lead.phone || '').replace(/[^0-9+]/g, '');
                  const isBeingDragged = draggedLeadId === lead.id;
                  const dealValue = getLeadDealValue(lead);

                  return (
                    <div 
                      key={lead.id} 
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={handleDragEnd}
                      className={`p-2.5 rounded-lg border space-y-2 transition-all cursor-grab active:cursor-grabbing ${
                        isBeingDragged
                          ? 'opacity-40 border-dashed border-zinc-500 bg-zinc-900/20 scale-[0.98]'
                          : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
                      }`}
                    >
                      
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-start gap-1 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5 -ml-1 cursor-grab" />
                          <div className="min-w-0">
                            <div className="font-medium text-white text-xs line-clamp-1">
                              {lead.businessName}
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-0.5 truncate">
                              {lead.decisionMakerName}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                          {lead.audit.overallHealthScore}/100
                        </span>
                      </div>

                      {/* Diagnosed Vulnerability & Lost Revenue Leak */}
                      {primaryGap && (
                        <div className="flex items-center justify-between gap-1 text-[10px] border-t border-zinc-900 pt-1.5">
                          <ServiceGapBadge service={primaryGap.service} />
                          <span className="font-mono text-zinc-400 text-[10px]" title="Monthly Revenue Leak">
                            -₹{primaryGap.estimatedLostRevenueMonthly.toLocaleString('en-IN')}/mo
                          </span>
                        </div>
                      )}

                      {/* Deal Quote / Ask */}
                      <div className="flex items-center justify-between gap-1 text-[11px] pt-0.5">
                        <span className="text-zinc-500 font-mono text-[10px] uppercase">Deal Quote</span>
                        <EditableDealAmount
                          leadId={lead.id}
                          value={dealValue}
                          onUpdate={onUpdateDealValue}
                          variant="badge"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-zinc-900">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPitchKit(lead);
                          }}
                          className="h-6 px-2 text-[10px] bg-white text-black hover:bg-zinc-200 font-medium rounded shadow-none cursor-pointer"
                        >
                          Pitch Kit
                        </Button>

                        <div className="flex items-center gap-1">
                          {cleanPhone ? (
                            <a
                              href={`tel:${cleanPhone}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(lead.id, 'to_call');
                              }}
                              className="h-6 px-2 text-[10px] inline-flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded transition-colors"
                              title={`Call ${cleanPhone}`}
                            >
                              Call
                            </a>
                          ) : (
                            <span
                              className="h-6 px-1.5 text-[10px] inline-flex items-center justify-center bg-zinc-950 border border-zinc-900 text-zinc-600 rounded cursor-not-allowed"
                              title="No phone detected"
                            >
                              No Tel
                            </span>
                          )}

                          {col.status !== 'closed_won' && col.status !== 'not_interested' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-zinc-500 hover:text-white cursor-pointer"
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
                              <ArrowRight className="w-3 h-3" />
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
