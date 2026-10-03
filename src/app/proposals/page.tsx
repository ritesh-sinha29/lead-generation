'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  FileText, 
  TrendingDown, 
  Copy, 
  Check, 
  ShieldCheck, 
  PhoneCall, 
  ArrowLeft,
  Printer,
  IndianRupee,
  Calendar,
  Share2,
  MapPin,
  User
} from 'lucide-react';
import { Lead } from '@/types/lead';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function ProposalsContent() {
  const searchParams = useSearchParams();
  const leadIdParam = searchParams.get('leadId');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

  useEffect(() => {
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.leads?.length > 0) {
          setLeads(data.leads);
          if (leadIdParam && data.leads.some((l: Lead) => l.id === leadIdParam)) {
            setSelectedLeadId(leadIdParam);
          } else {
            setSelectedLeadId(data.leads[0].id);
          }
        }
      })
      .catch((err) => console.error('Failed to load leads:', err));
  }, [leadIdParam]);

  const currentLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  const totalMonthlyLeak = currentLead?.audit.topGaps.reduce(
    (acc, g) => acc + (g.estimatedLostRevenueMonthly || 0), 
    0
  ) || 0;

  const affordability = currentLead?.pitchKit.affordability;
  const sweetSpotPrice = affordability?.recommendedSweetSpotPrice || currentLead?.pitchKit.estimatedPrice || '₹45,000 + ₹12,000/mo';
  const breakEvenMath = affordability?.roiBreakEvenMath || 'Client recovers total investment with just 1-2 newly captured bookings.';
  const quoteOptions = affordability?.quoteOptions || [];

  const handleCopySummary = () => {
    if (!currentLead) return;
    const gapsList = currentLead.audit.topGaps
      .map((g, i) => `${i + 1}. ${g.serviceTitle}: -₹${g.estimatedLostRevenueMonthly.toLocaleString('en-IN')}/mo (${g.detectedIssue})`)
      .join('\n');

    const text = `📊 EXECUTIVE AUDIT & GROWTH DIAGNOSTIC
Client: ${currentLead.businessName} (${currentLead.city})
Prepared For: ${currentLead.decisionMakerName} (${currentLead.decisionMakerRole})
Health Score: ${currentLead.audit.overallHealthScore}/100

🚨 DETECTED REVENUE LEAKAGES (~₹${totalMonthlyLeak.toLocaleString('en-IN')}/mo total):
${gapsList}

💡 TURNKEY SOLUTION: ${currentLead.pitchKit.recommendedPackageName}
• Recommended Quote: ${sweetSpotPrice}
• Expected ROI: ${currentLead.pitchKit.estimatedRoi}
• Delivery: ${currentLead.pitchKit.deliveryTimeline} (100% Done-For-You)
• Break-Even Math: ${breakEvenMath}

Verified & Prepared by AI Growth Systems`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleCopyPitch = () => {
    if (!currentLead) return;
    const text = `Hi ${currentLead.decisionMakerName}, I ran a technical diagnostic on ${currentLead.businessName}'s web setup and found ~₹${totalMonthlyLeak.toLocaleString('en-IN')}/mo in potential missed inquiries from missing 24/7 AI response & SEO capture. We prepared a 1-page breakdown showing how to capture this revenue within ${currentLead.pitchKit.deliveryTimeline}. Mind if I send the 1-page PDF over?`;
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const cleanPhone = (currentLead?.phone || '').replace(/[^0-9+]/g, '');

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white print:bg-white print:text-black">
      
      {/* Top Header - Hidden in Print */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#09090B]/90 backdrop-blur-xl print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center h-8 gap-1.5 px-3 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-colors border border-transparent hover:border-zinc-800">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Leads</span>
            </Link>
            <div className="h-4 w-px bg-zinc-800" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              Client Diagnostic Teaser
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPitch}
              className="h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-850"
            >
              {copiedPitch ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />}
              <span>{copiedPitch ? 'Copied Outreach' : 'Copy Outreach Hook'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-8 text-xs bg-white text-black hover:bg-zinc-200 border-transparent font-medium"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              <span>Print / Save 1-Page PDF</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 print:p-0 print:m-0 print:max-w-none">
        
        {/* Controls Bar (Lead Selector & Copy) - Hidden in Print */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80 print:hidden">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Executive Diagnostic Sheet</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                1-Page Proof
              </span>
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Print to PDF or share with decision makers to present verified technical gaps and exact ROI math.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {leads.length > 0 && (
              <Select value={selectedLeadId} onValueChange={(val) => { if (val) setSelectedLeadId(val); }}>
                <SelectTrigger className="h-9 w-64 text-xs font-medium bg-zinc-900 border-zinc-800 text-white focus:ring-0 focus:border-zinc-700">
                  <SelectValue placeholder="Select a business" />
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
              onClick={handleCopySummary}
              size="sm"
              className="h-9 font-medium text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
              <span>{copiedSummary ? 'Copied Summary' : 'Copy Full Summary'}</span>
            </Button>
          </div>
        </div>

        {/* Printable 1-Page Client Diagnostic Card */}
        {currentLead ? (
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-6 shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0 print:space-y-4">
            
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-zinc-850 print:border-zinc-300">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 print:bg-zinc-100 print:border-zinc-300 print:text-zinc-700">
                    Executive Performance Diagnostic
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">
                    REF-{(currentLead.id || 'AUDIT').slice(0, 8).toUpperCase()}
                  </span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight print:text-black">
                  {currentLead.businessName}
                </h2>
                
                <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 print:text-zinc-600">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-zinc-500" />
                    <span>Prepared For: <strong className="text-zinc-200 font-medium print:text-black">{currentLead.decisionMakerName}</strong> ({currentLead.decisionMakerRole})</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-500" />
                    <span>{currentLead.city}, {currentLead.country}</span>
                  </span>
                  {currentLead.website && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-zinc-400 print:text-zinc-700">{currentLead.website.replace(/^https?:\/\//, '')}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Health Score Badge */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 print:bg-zinc-50 print:border-zinc-200">
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block print:text-zinc-500">Tech & Lead Readiness</span>
                  <div className="text-2xl font-black text-white font-mono print:text-black">
                    {currentLead.audit.overallHealthScore}<span className="text-xs font-normal text-zinc-500">/100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Executive Metric Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 print:bg-zinc-50 print:border-zinc-200">
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-rose-400" />
                  Monthly Missed Pipeline
                </div>
                <div className="text-lg sm:text-xl font-black text-rose-400 font-mono mt-1">
                  -₹{totalMonthlyLeak.toLocaleString('en-IN')}<span className="text-xs text-zinc-500 font-normal">/mo</span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">Estimated lost inquiries</div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 print:bg-zinc-50 print:border-zinc-200">
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <IndianRupee className="w-3 h-3 text-emerald-400" />
                  Recommended Quote
                </div>
                <div className="text-lg sm:text-xl font-black text-white font-mono mt-1 print:text-black">
                  {sweetSpotPrice}
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">Turnkey deployment quote</div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 print:bg-zinc-50 print:border-zinc-200">
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-400" />
                  Turnaround Timeline
                </div>
                <div className="text-lg sm:text-xl font-bold text-zinc-200 mt-1 print:text-black">
                  {currentLead.pitchKit.deliveryTimeline}
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">100% Done-For-You</div>
              </div>
            </div>

            {/* Diagnosed Technical Leakages */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5 print:text-black">
                  <span>Diagnosed Digital Friction Points ({currentLead.audit.topGaps.length})</span>
                </h3>
                <span className="text-[11px] text-zinc-500">Live technical telemetry</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentLead.audit.topGaps.map((gap, i) => (
                  <div key={i} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-850 space-y-2 print:bg-white print:border-zinc-300">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-xs flex items-center gap-1.5 print:text-black">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        {gap.serviceTitle}
                      </div>
                      <span className="text-xs font-mono font-bold text-rose-400">
                        -₹{gap.estimatedLostRevenueMonthly.toLocaleString('en-IN')}/mo
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed print:text-zinc-600">
                      {gap.detectedIssue}
                    </p>

                    <div className="pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-300 print:text-zinc-800">
                      <span className="text-zinc-500 font-semibold">Immediate Fix: </span>
                      {gap.recommendedSolution}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ROI Break-Even Math & Turnkey Scope */}
            <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3 print:bg-zinc-50 print:border-zinc-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Recommended Turnkey Architecture</span>
                  <h4 className="text-sm font-bold text-white print:text-black">{currentLead.pitchKit.recommendedPackageName}</h4>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-zinc-500 block uppercase">Projected Client ROI</span>
                  <span className="text-xs font-mono font-black text-emerald-400">{currentLead.pitchKit.estimatedRoi}</span>
                </div>
              </div>

              {breakEvenMath && (
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 leading-relaxed print:bg-white print:border-zinc-200 print:text-zinc-800">
                  <div className="font-bold text-white text-[11px] mb-0.5 flex items-center gap-1.5 print:text-black">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Investment Break-Even Math</span>
                  </div>
                  {breakEvenMath}
                </div>
              )}

              {/* 3 Pricing Tiers Breakdown if available */}
              {quoteOptions.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  {quoteOptions.map((tier, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                        tier.isRecommended 
                          ? 'bg-zinc-900 border-zinc-700 print:bg-zinc-100 print:border-zinc-400' 
                          : 'bg-zinc-950/60 border-zinc-850 print:bg-white print:border-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-[11px] print:text-black">{tier.tierName}</span>
                        {tier.isRecommended && (
                          <span className="text-[9px] font-mono uppercase bg-white text-black px-1.5 py-0.2 rounded font-bold">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-zinc-200 font-mono print:text-black">{tier.price}</div>
                      <p className="text-[10px] text-zinc-400 line-clamp-2 print:text-zinc-600">{tier.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Verification Footer & Call to Action */}
            <div className="pt-3 border-t border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:border-zinc-300">
              <div className="text-zinc-500 flex items-center gap-2 print:text-zinc-600">
                <ShieldCheck className="w-4 h-4 text-zinc-400" />
                <span>AI Technical Diagnostic & Revenue Recovery Framework</span>
              </div>

              {currentLead.phone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="font-medium bg-white text-black hover:bg-zinc-200 text-xs h-8 px-3 inline-flex items-center justify-center rounded-md transition-colors print:hidden"
                >
                  <PhoneCall className="w-3.5 h-3.5 mr-1.5" />
                  <span>Call {currentLead.decisionMakerName} ({currentLead.phone})</span>
                </a>
              )}
            </div>

          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500">
            <FileText className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
            <p className="text-sm">No lead selected. Generate or pick a lead from the dashboard.</p>
          </div>
        )}

      </main>
    </div>
  );
}

export default function ProposalsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090B] text-zinc-400 p-8 flex items-center justify-center text-xs">Loading proposal...</div>}>
      <ProposalsContent />
    </Suspense>
  );
}
