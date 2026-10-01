'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  TrendingDown, 
  Copy, 
  Check, 
  ShieldCheck, 
  PhoneCall, 
  ArrowLeft,
  Printer
} from 'lucide-react';
import { Lead } from '@/types/lead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ProposalsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.leads?.length > 0) {
          setLeads(data.leads);
          setSelectedLeadId(data.leads[0].id);
        }
      });
  }, []);

  const currentLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  const handleCopyPitch = () => {
    if (!currentLead) return;
    const text = `Hi ${currentLead.decisionMakerName}, I audited ${currentLead.businessName}'s website and prepared a quick technical summary showing how you can capture an extra $${currentLead.audit.topGaps.reduce((acc, g) => acc + g.estimatedLostRevenueMonthly, 0)}/mo in missed inquiries with automated 24/7 AI lead capture & GEO search optimization. Check the full breakdown: ${currentLead.website}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-white">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#09090B]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900">
              <Link href="/">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Leads</span>
              </Link>
            </Button>
            <div className="h-4 w-px bg-zinc-800" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Client Audit Teaser Sheet
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print / Save PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <Badge variant="outline" className="mb-2 text-xs font-semibold bg-indigo-500/10 border-indigo-500/30 text-indigo-400">
              <FileText className="w-3.5 h-3.5 mr-1" />
              <span>1-Page Client Diagnostic Proof Sheet</span>
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Client Audit Teaser Generator
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Send this visual technical summary to decision makers to demonstrate their missed revenue.
            </p>
          </div>

          {/* Lead Selector & Copy CTA */}
          <div className="flex items-center gap-2">
            {leads.length > 0 && (
              <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                <SelectTrigger className="h-9 w-60 text-xs font-semibold bg-zinc-900 border-zinc-800 text-white">
                  <SelectValue placeholder="Select a lead" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white text-xs">
                  {leads.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.businessName} ({l.city})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              onClick={handleCopyPitch}
              size="sm"
              className="h-9 font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              <span>{copied ? 'Copied Teaser' : 'Copy Teaser Pitch'}</span>
            </Button>
          </div>
        </div>

        {/* Visual Client Proposal Card */}
        {currentLead && (
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-6 shadow-xl print:bg-white print:text-black print:border-none">
            
            {/* Header section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                  Confidential Performance & AI Audit
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {currentLead.businessName}
                </h2>
                <div className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                  <span>Prepared for: <strong className="text-zinc-200">{currentLead.decisionMakerName}</strong> ({currentLead.decisionMakerRole})</span>
                  <span>•</span>
                  <span>{currentLead.city}, {currentLead.country}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl text-center bg-zinc-950 border border-zinc-800">
                <div className="text-2xl font-black text-indigo-400">{currentLead.audit.overallHealthScore}/100</div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold">Tech Readiness</div>
              </div>
            </div>

            {/* Key Diagnosed Vulnerabilities */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                Critical Revenue Leakages Detected
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentLead.audit.topGaps.map((gap, i) => (
                  <div key={i} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        {gap.serviceTitle}
                      </div>
                      <span className="text-xs font-black text-rose-400">
                        -${gap.estimatedLostRevenueMonthly}/mo
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {gap.detectedIssue}
                    </p>

                    <div className="pt-2 border-t border-zinc-800/60 text-[10px] text-indigo-400 font-medium">
                      <strong>Recommended Fix:</strong> {gap.recommendedSolution}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Action Plan */}
            <div className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Turnkey Solution Package</span>
                  <h4 className="text-base font-bold text-white">{currentLead.pitchKit.recommendedPackageName}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block">Estimated ROI</span>
                  <span className="text-xs font-black text-emerald-400">{currentLead.pitchKit.estimatedRoi}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-zinc-800 text-xs">
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="text-zinc-500 text-[10px]">Setup Timeline</div>
                  <div className="font-bold text-white">{currentLead.pitchKit.deliveryTimeline}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="text-zinc-500 text-[10px]">Integration Effort</div>
                  <div className="font-bold text-white">100% Done-For-You</div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="text-zinc-500 text-[10px]">Capture Boost</div>
                  <div className="font-bold text-emerald-400">+35% to +50%</div>
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="text-zinc-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified by Apex Tech & AI Solutions Agency</span>
              </div>

              <Button asChild className="font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8">
                <a href={`tel:${currentLead.phone}`}>
                  <PhoneCall className="w-3.5 h-3.5 mr-1.5" />
                  <span>Call {currentLead.decisionMakerName} ({currentLead.phone})</span>
                </a>
              </Button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
