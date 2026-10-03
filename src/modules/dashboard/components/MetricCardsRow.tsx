'use client';

import React from 'react';
import { 
  Users, 
  IndianRupee, 
  Phone, 
  Zap 
} from 'lucide-react';
import { ServiceCategory } from '@/types/lead';

interface MetricCardsRowProps {
  agencyPipelineValue: number;
  totalLeads: number;
  verifiedPhonesCount: number;
  avgAgencyDealSize: number;
  funnelCount: number;
  toCallCount: number;
  meetingsCount: number;
  topDemandedService: { service: ServiceCategory; label: string; count: number };
}

export function MetricCardsRow({
  agencyPipelineValue,
  totalLeads,
  verifiedPhonesCount,
  avgAgencyDealSize,
  funnelCount,
  toCallCount,
  meetingsCount,
  topDemandedService,
}: MetricCardsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      
      {/* Card 1: TOTAL PIPELINE */}
      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-850 hover:border-zinc-750 transition-all flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
            EST. PIPELINE
          </span>
          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-xs">
            ₹
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-white tracking-tight font-mono">
            ₹{(agencyPipelineValue / 100000).toFixed(2)}L
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 font-mono">
            Qualified deal potential
          </div>
        </div>
      </div>

      {/* Card 2: TOTAL LEADS */}
      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-850 hover:border-zinc-750 transition-all flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
            TOTAL LEADS
          </span>
          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-white tracking-tight font-mono">
            {totalLeads}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 font-mono">
            {verifiedPhonesCount} with phone number
          </div>
        </div>
      </div>

      {/* Card 3: AVG. DEAL SIZE */}
      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-850 hover:border-zinc-750 transition-all flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
            AVG. DEAL SIZE
          </span>
          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <IndianRupee className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-white tracking-tight font-mono">
            ₹{(avgAgencyDealSize / 1000).toFixed(0)}k
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 font-mono">
            Per closed client
          </div>
        </div>
      </div>

      {/* Card 4: OUTREACH FUNNEL */}
      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-850 hover:border-zinc-750 transition-all flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
            OUTREACH FUNNEL
          </span>
          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <Phone className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-white tracking-tight font-mono">
            {funnelCount}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 font-mono">
            {toCallCount} ready · {meetingsCount} booked
          </div>
        </div>
      </div>

      {/* Card 5: TOP SERVICE GAP */}
      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-850 hover:border-zinc-750 transition-all flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase truncate">
            TOP SERVICE DEMAND
          </span>
          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <Zap className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl font-bold text-white tracking-tight truncate">
            {topDemandedService.label}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 font-mono truncate">
            {topDemandedService.count} leads need this
          </div>
        </div>
      </div>

    </div>
  );
}
