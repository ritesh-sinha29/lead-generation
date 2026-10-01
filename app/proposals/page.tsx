'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ExternalLink, 
  Sparkles, 
  TrendingDown, 
  CheckCircle, 
  Share2, 
  Copy, 
  Check, 
  ShieldCheck, 
  DollarSign, 
  PhoneCall, 
  Send 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Lead } from '@/types/lead';
import ServiceGapBadge from '@/components/ServiceGapBadge';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar totalLeadsCount={leads.length} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Client-Facing Audit Teaser & Proof Sheet</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              1-Page Client Teaser Generator
            </h1>
            <p className="text-xs text-slate-400">
              Share this visual technical breakdown with decision makers to prove where they are losing revenue.
            </p>
          </div>

          {/* Lead Selector */}
          <div className="flex items-center gap-3">
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.businessName} ({l.city})
                </option>
              ))}
            </select>

            <button
              onClick={handleCopyPitch}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/30"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Teaser' : 'Copy Teaser Link'}</span>
            </button>
          </div>
        </div>

        {/* Visual Client Proposal Card */}
        {currentLead && (
          <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-white/15 shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                  Confidential Tech & AI Performance Audit
                </span>
                <h2 className="text-3xl font-black text-white tracking-tight">
                  {currentLead.businessName}
                </h2>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>Prepared for: <strong className="text-slate-200">{currentLead.decisionMakerName}</strong> ({currentLead.decisionMakerRole})</span>
                  <span>•</span>
                  <span>{currentLead.city}, {currentLead.country}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-center">
                  <div className="text-2xl font-black text-amber-400">{currentLead.audit.overallHealthScore}/100</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Tech Readiness</div>
                </div>
              </div>
            </div>

            {/* Key Diagnosed Vulnerabilities */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                Critical Revenue Leakages Detected
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentLead.audit.topGaps.map((gap, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-white text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                        {gap.serviceTitle}
                      </div>
                      <span className="text-xs font-black text-red-400">
                        -${gap.estimatedLostRevenueMonthly}/mo
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {gap.detectedIssue}
                    </p>

                    <div className="pt-2 border-t border-white/5 text-[11px] text-indigo-300 font-medium">
                      <strong>Recommended Fix:</strong> {gap.recommendedSolution}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Action Plan */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950 border border-indigo-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Turnkey Solution Package</span>
                  <h4 className="text-lg font-bold text-white">{currentLead.pitchKit.recommendedPackageName}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Estimated ROI</span>
                  <span className="text-sm font-black text-emerald-400">{currentLead.pitchKit.estimatedRoi}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                  <div className="text-slate-400 font-medium">Setup Timeline</div>
                  <div className="text-white font-bold">{currentLead.pitchKit.deliveryTimeline}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                  <div className="text-slate-400 font-medium">Integration Effort</div>
                  <div className="text-white font-bold">100% Done-For-You</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                  <div className="text-slate-400 font-medium">Capture Rate Boost</div>
                  <div className="text-emerald-400 font-bold">+35% to +50%</div>
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified by Apex Tech & AI Solutions Agency</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${currentLead.phone}`}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call {currentLead.decisionMakerName}</span>
                </a>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
