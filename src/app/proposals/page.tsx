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
  Printer, 
  IndianRupee, 
  Calendar, 
  Share2, 
  MapPin, 
  User, 
  Briefcase,
  Zap,
  ArrowLeft,
  Menu,
  X,
  Download
} from 'lucide-react';
import { Lead, sanitizeToINR } from '@/types/lead';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DashboardSidebar } from '@/modules/dashboard';

function ProposalsContent() {
  const searchParams = useSearchParams();
  const leadIdParam = searchParams.get('leadId');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const totalMonthlyLeak = currentLead?.audit?.topGaps?.reduce(
    (acc, g) => acc + (g.estimatedLostRevenueMonthly || 0), 
    0
  ) || 0;

  const affordability = currentLead?.pitchKit?.affordability;
  const sweetSpotPrice = affordability?.recommendedSweetSpotPrice || currentLead?.pitchKit?.estimatedPrice || '₹45,000 + ₹12,000/mo';
  const breakEvenMath = affordability?.roiBreakEvenMath || 'Client recovers total investment with just 1-2 newly captured bookings.';
  const quoteOptions = affordability?.quoteOptions || [];

  const handleCopySummary = () => {
    if (!currentLead) return;
    const gapsList = (currentLead.audit?.topGaps || [])
      .map((g, i) => `${i + 1}. ${g.serviceTitle}: -₹${g.estimatedLostRevenueMonthly.toLocaleString('en-IN')}/mo (${g.detectedIssue})`)
      .join('\n');

    const text = `📊 EXECUTIVE AUDIT & GROWTH DIAGNOSTIC
Client: ${currentLead.businessName} (${currentLead.city})
Prepared For: ${currentLead.decisionMakerName} (${currentLead.decisionMakerRole})
Health Score: ${currentLead.audit?.overallHealthScore || 65}/100

🚨 DETECTED REVENUE LEAKAGES (~₹${totalMonthlyLeak.toLocaleString('en-IN')}/mo total):
${gapsList}

💡 TURNKEY SOLUTION: ${currentLead.pitchKit?.recommendedPackageName || 'AI Sales & Lead Capture Acceleration'}
• Recommended Quote: ${sweetSpotPrice}
• Expected ROI: ${currentLead.pitchKit?.estimatedRoi || '300-500%'}
• Delivery: ${currentLead.pitchKit?.deliveryTimeline || '5-7 Days'} (100% Done-For-You)
• Break-Even Math: ${breakEvenMath}

Verified & Prepared by AI Growth Systems`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleCopyPitch = () => {
    if (!currentLead) return;
    const text = `Hi ${currentLead.decisionMakerName}, I ran a technical diagnostic on ${currentLead.businessName}'s web setup and found ~₹${totalMonthlyLeak.toLocaleString('en-IN')}/mo in potential missed inquiries from missing 24/7 AI response & SEO capture. We prepared a 1-page breakdown showing how to capture this revenue within ${currentLead.pitchKit?.deliveryTimeline || '5-7 days'}. Mind if I send the 1-page PDF over?`;
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const cleanPhone = (currentLead?.phone || '').replace(/[^0-9+]/g, '');

  return (
    <div className="min-h-screen bg-[#09090B] text-[#EDEDED] font-sans antialiased flex selection:bg-indigo-500/30 selection:text-white print:bg-white print:text-black">
      
      {/* 1. Left Sidebar (Shared layout) */}
      <DashboardSidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header / Breadcrumb Bar - Hidden in Print */}
        <header className="sticky top-0 z-40 w-full border-b border-zinc-850 bg-[#09090B]/95 backdrop-blur-md print:hidden">
          <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Link href="/" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="font-medium text-zinc-200 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                Pitch Kits & Teasers
              </span>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPitch}
                className="hidden sm:inline-flex h-8 px-2.5 text-xs bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg cursor-pointer"
              >
                {copiedPitch ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />}
                <span>{copiedPitch ? 'Copied Outreach' : 'Copy Outreach Hook'}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedLeadId) {
                    window.open(`/api/export?format=pdf&leadId=${selectedLeadId}`, '_blank');
                  }
                }}
                className="hidden sm:inline-flex h-8 px-2.5 text-xs bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg cursor-pointer"
                title="Download formatted PDF proposal"
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
                <span>Download PDF</span>
              </Button>

              <Button
                size="sm"
                onClick={() => window.print()}
                className="h-8 px-3 text-xs bg-white text-black hover:bg-zinc-200 font-semibold rounded-lg cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Print / Save 1-Page PDF</span>
                <span className="sm:hidden">Print PDF</span>
              </Button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden h-8 w-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>

          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl px-4 py-4 space-y-3">
              <div className="grid grid-cols-3 gap-1.5">
                <Link 
                  href="/" 
                  className="text-center py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-900 rounded-lg"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/proposals" 
                  className="text-center py-2 text-xs font-semibold text-white bg-zinc-900 border border-zinc-800 rounded-lg"
                >
                  Proposals
                </Link>
                <Link 
                  href="/settings" 
                  className="text-center py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-900 rounded-lg"
                >
                  Settings
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* Main Body Content */}
        <main className="p-4 sm:p-6 space-y-6 max-w-[1600px] w-full print:p-0 print:m-0 print:max-w-none">
          
          {/* Dashboard Heading & Action Pills - Hidden in Print */}
          <div className="space-y-3 print:hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
                Pitch Kits & Client Teasers
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">
              1-Page executive diagnostic sheets, client revenue leak breakdowns, and sales closer battlecards.
            </p>

            {/* Action Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPitch}
                className="h-8 px-3 rounded-full text-xs font-medium bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800 hover:border-zinc-700 cursor-pointer"
              >
                {copiedPitch ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />}
                <span>{copiedPitch ? 'Copied Hook' : 'Copy Outreach Hook'}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySummary}
                className="h-8 px-3 rounded-full text-xs font-medium bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800 hover:border-zinc-700 cursor-pointer"
              >
                {copiedSummary ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />}
                <span>{copiedSummary ? 'Copied Summary' : 'Copy Full Summary'}</span>
              </Button>

              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
                <span>Back to Pipeline</span>
              </Link>
            </div>
          </div>

          {/* 5 Metric Summary Cards for the Active Lead Diagnostic - Hidden in Print */}
          {currentLead && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 print:hidden">
              
              {/* Card 1: Missed Pipeline */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-850 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider text-rose-400 uppercase">
                    MONTHLY LEAK
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <TrendingDown className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl font-extrabold text-rose-400 tracking-tight font-mono">
                    -₹{totalMonthlyLeak.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 font-mono">
                    Estimated lost inquiries
                  </div>
                </div>
              </div>

              {/* Card 2: Recommended Quote */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-850 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                    RECOMMENDED QUOTE
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                    ₹
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl font-extrabold text-white tracking-tight font-mono truncate">
                    {sweetSpotPrice.split('+')[0].trim()}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 font-mono truncate">
                    Turnkey package quote
                  </div>
                </div>
              </div>

              {/* Card 3: Turnaround Timeline */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-850 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                    DELIVERY TIME
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl font-extrabold text-white tracking-tight font-sans truncate">
                    {currentLead.pitchKit?.deliveryTimeline || '5-7 Days'}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 font-mono">
                    100% Done-For-You
                  </div>
                </div>
              </div>

              {/* Card 4: Projected Client ROI */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-850 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
                    PROJECTED ROI
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl font-extrabold text-emerald-400 tracking-tight font-mono">
                    {currentLead.pitchKit?.estimatedRoi || '300-500%'}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 font-mono">
                    Client return multiple
                  </div>
                </div>
              </div>

              {/* Card 5: Readiness Score */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-850 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                    HEALTH SCORE
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl font-extrabold text-white tracking-tight font-mono">
                    {currentLead.audit?.overallHealthScore || 65}/100
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 font-mono">
                    Technical readiness
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Main Printable 1-Page Client Diagnostic Card Container */}
          <div className="bg-zinc-950/80 border border-zinc-850 rounded-2xl p-4 sm:p-6 space-y-6 shadow-sm print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
            
            {/* Lead Selector Header - Hidden in Print */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-850 print:hidden">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-sans">
                  Executive Performance Diagnostic Sheet
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Print to PDF or share directly with decision makers to present verified technical gaps and exact ROI math.
                </p>
              </div>

              {/* Lead Selector */}
              {leads.length > 0 && (
                <div className="w-full sm:w-72">
                  <Select value={selectedLeadId} onValueChange={(val) => { if (val) setSelectedLeadId(val); }}>
                    <SelectTrigger className="h-9 w-full text-xs font-medium bg-zinc-900 border-zinc-800 text-white rounded-lg focus:ring-0 focus:border-zinc-700">
                      <SelectValue placeholder="Select a business" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white text-xs">
                      {leads.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.businessName} ({l.city})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Diagnostic Content */}
            {currentLead ? (
              <div className="space-y-6 print:space-y-4">
                
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
                        {currentLead.audit?.overallHealthScore || 65}<span className="text-xs font-normal text-zinc-500">/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diagnosed Technical Leakages */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5 print:text-black">
                      <span>Diagnosed Digital Friction Points ({(currentLead.audit?.topGaps || []).length})</span>
                    </h3>
                    <span className="text-[11px] text-zinc-500">Live technical telemetry</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(currentLead.audit?.topGaps || []).map((gap, i) => (
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
                <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/80 border border-zinc-850 space-y-3 print:bg-zinc-50 print:border-zinc-300">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Recommended Turnkey Architecture</span>
                      <h4 className="text-sm font-bold text-white print:text-black">{currentLead.pitchKit?.recommendedPackageName || 'Turnkey AI Lead Engine'}</h4>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-zinc-500 block uppercase">Projected Client ROI</span>
                      <span className="text-xs font-mono font-black text-emerald-400">{currentLead.pitchKit?.estimatedRoi || '300-500%'}</span>
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

                  {/* Pricing Tiers Breakdown */}
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
                          <div className="text-sm font-bold text-zinc-200 font-mono print:text-black">{sanitizeToINR(tier.price)}</div>
                          <p className="text-[10px] text-zinc-400 line-clamp-2 print:text-zinc-600">{sanitizeToINR(tier.description)}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Market Comparison Table */}
                  <div className="pt-3 border-t border-zinc-850 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Market Rate Comparison & Value Arbitrage</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded print:border-zinc-400 print:text-black">
                        Save 65–75% vs Traditional Agency
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 print:bg-white print:border-zinc-300">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[10px] font-mono text-zinc-400 uppercase print:bg-zinc-100 print:text-black print:border-zinc-300">
                            <th className="py-2 px-3 font-semibold">Scope & Deliverable</th>
                            <th className="py-2 px-3 font-semibold text-zinc-500 print:text-zinc-600">Traditional Agency</th>
                            <th className="py-2 px-3 font-semibold text-zinc-500 print:text-zinc-600">Freelancer / DIY</th>
                            <th className="py-2 px-3 font-semibold text-emerald-400 bg-zinc-900/90 border-l border-zinc-800 print:bg-zinc-200 print:text-black print:border-zinc-300">Our Done-For-You AI Engine</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-850 text-[11px] print:divide-zinc-200">
                          <tr>
                            <td className="py-2 px-3 font-medium text-zinc-300 print:text-black">Setup Investment</td>
                            <td className="py-2 px-3 font-mono text-zinc-500 print:text-zinc-600">₹1,80,000 - ₹3,50,000</td>
                            <td className="py-2 px-3 font-mono text-zinc-500 print:text-zinc-600">₹35,000 - ₹65,000</td>
                            <td className="py-2 px-3 font-mono font-bold text-white bg-zinc-900/40 border-l border-zinc-800 print:bg-zinc-50 print:text-black print:border-zinc-300">
                              {sweetSpotPrice.split('+')[0].trim()}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-medium text-zinc-300 print:text-black">Turnaround Speed</td>
                            <td className="py-2 px-3 text-zinc-500 print:text-zinc-600">6 to 10 Weeks</td>
                            <td className="py-2 px-3 text-zinc-500 print:text-zinc-600">3 to 6 Weeks</td>
                            <td className="py-2 px-3 font-semibold text-emerald-400 bg-zinc-900/40 border-l border-zinc-800 print:bg-zinc-50 print:text-black print:border-zinc-300">
                              {currentLead.pitchKit?.deliveryTimeline || '5-7 Days'} Turnkey
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-medium text-zinc-300 print:text-black">24/7 AI Voice & Chatbot</td>
                            <td className="py-2 px-3 text-zinc-500 print:text-zinc-600">❌ Not Included (+₹80k)</td>
                            <td className="py-2 px-3 text-zinc-500 print:text-zinc-600">⚠️ Static Web Form</td>
                            <td className="py-2 px-3 text-white bg-zinc-900/40 border-l border-zinc-800 print:bg-zinc-50 print:text-black print:border-zinc-300">
                              ✅ Custom Trained & Included
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-medium text-zinc-300 print:text-black">GEO AI Search (ChatGPT/Perplexity)</td>
                            <td className="py-2 px-3 text-zinc-500 print:text-zinc-600">❌ Basic Google SEO</td>
                            <td className="py-2 px-3 text-zinc-500 print:text-zinc-600">❌ Ignored</td>
                            <td className="py-2 px-3 text-white bg-zinc-900/40 border-l border-zinc-800 print:bg-zinc-50 print:text-black print:border-zinc-300">
                              ✅ Fully Structured & Indexed
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-medium text-zinc-300 print:text-black">Ongoing SLA & Retainer</td>
                            <td className="py-2 px-3 text-zinc-500 print:text-zinc-600">₹35,000/mo (₹2.5k/hr)</td>
                            <td className="py-2 px-3 text-zinc-500 print:text-zinc-600">Zero Ongoing SLAs</td>
                            <td className="py-2 px-3 font-mono text-zinc-200 bg-zinc-900/40 border-l border-zinc-800 print:bg-zinc-50 print:text-black print:border-zinc-300">
                              ₹8,000 - ₹12,000/mo
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-medium text-zinc-300 print:text-black">Estimated Payback</td>
                            <td className="py-2 px-3 text-zinc-500 print:text-zinc-600">6 to 9 Months</td>
                            <td className="py-2 px-3 text-zinc-500 print:text-zinc-600">Unpredictable</td>
                            <td className="py-2 px-3 font-bold text-emerald-400 bg-zinc-900/40 border-l border-zinc-800 print:bg-zinc-50 print:text-black print:border-zinc-300">
                              First 1–2 Bookings
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
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
                      className="font-medium bg-white text-black hover:bg-zinc-200 text-xs h-8 px-3 inline-flex items-center justify-center rounded-lg transition-colors print:hidden"
                    >
                      <PhoneCall className="w-3.5 h-3.5 mr-1.5" />
                      <span>Call {currentLead.decisionMakerName} ({currentLead.phone})</span>
                    </a>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500 text-xs">
                <FileText className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                <p className="text-sm">No lead selected. Pick a lead from the dropdown above.</p>
              </div>
            )}

          </div>

        </main>

      </div>

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
