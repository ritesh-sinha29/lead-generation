'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  ExternalLink, 
  Sparkles, 
  TrendingDown, 
  Copy, 
  Check, 
  ShieldCheck, 
  PhoneCall, 
  ArrowLeft 
} from 'lucide-react';
import { Lead } from '@/types/lead';
import ServiceGapBadge from '@/components/ServiceGapBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

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
    <div className="min-h-screen bg-background text-foreground font-sans">
      
      {/* Top Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-xs">
            <Link href="/">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <Badge variant="outline" className="text-xs font-bold">
            Pitch Teasers
          </Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-2 text-xs font-semibold">
              <FileText className="w-3.5 h-3.5 mr-1" />
              <span>Client-Facing Audit Teaser & Proof Sheet</span>
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              1-Page Client Teaser Generator
            </h1>
            <p className="text-xs text-muted-foreground">
              Share this visual technical breakdown with decision makers to prove where they are losing revenue.
            </p>
          </div>

          {/* Lead Selector */}
          <div className="flex items-center gap-2">
            {leads.length > 0 && (
              <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                <SelectTrigger className="h-9 w-60 text-xs font-semibold">
                  <SelectValue placeholder="Select a lead" />
                </SelectTrigger>
                <SelectContent>
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
              className="h-9 font-bold text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-secondary" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              <span>{copied ? 'Copied Teaser' : 'Copy Teaser Pitch'}</span>
            </Button>
          </div>
        </div>

        {/* Visual Client Proposal Card */}
        {currentLead && (
          <Card className="p-6 sm:p-8 space-y-6 shadow-md">
            
            {/* Header section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary block mb-1">
                  Confidential Tech & AI Performance Audit
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {currentLead.businessName}
                </h2>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                  <span>Prepared for: <strong className="text-foreground">{currentLead.decisionMakerName}</strong> ({currentLead.decisionMakerRole})</span>
                  <span>•</span>
                  <span>{currentLead.city}, {currentLead.country}</span>
                </div>
              </div>

              <Card className="p-3 text-center bg-background border-border">
                <div className="text-xl font-black text-primary">{currentLead.audit.overallHealthScore}/100</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold">Tech Readiness</div>
              </Card>
            </div>

            {/* Key Diagnosed Vulnerabilities */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                Critical Revenue Leakages Detected
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentLead.audit.topGaps.map((gap, i) => (
                  <Card key={i} className="p-4 bg-background border-border space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-foreground text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                        {gap.serviceTitle}
                      </div>
                      <span className="text-xs font-black text-destructive">
                        -${gap.estimatedLostRevenueMonthly}/mo
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {gap.detectedIssue}
                    </p>

                    <div className="pt-2 border-t border-border text-[10px] text-primary font-medium">
                      <strong>Recommended Fix:</strong> {gap.recommendedSolution}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recommended Action Plan */}
            <Card className="p-5 bg-muted/40 border-border space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Turnkey Solution Package</span>
                  <h4 className="text-base font-bold text-foreground">{currentLead.pitchKit.recommendedPackageName}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block">Estimated ROI</span>
                  <span className="text-xs font-black text-secondary">{currentLead.pitchKit.estimatedRoi}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-border text-xs">
                <div className="p-2.5 rounded-lg bg-background border border-border">
                  <div className="text-muted-foreground text-[10px]">Setup Timeline</div>
                  <div className="font-bold text-foreground">{currentLead.pitchKit.deliveryTimeline}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-background border border-border">
                  <div className="text-muted-foreground text-[10px]">Integration Effort</div>
                  <div className="font-bold text-foreground">100% Done-For-You</div>
                </div>
                <div className="p-2.5 rounded-lg bg-background border border-border">
                  <div className="text-muted-foreground text-[10px]">Capture Boost</div>
                  <div className="font-bold text-secondary">+35% to +50%</div>
                </div>
              </div>
            </Card>

            {/* Footer action */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-secondary" />
                <span>Verified by Apex Tech & AI Solutions Agency</span>
              </div>

              <Button asChild variant="secondary" size="sm" className="font-bold">
                <a href={`tel:${currentLead.phone}`}>
                  <PhoneCall className="w-3.5 h-3.5 mr-1.5" />
                  <span>Call {currentLead.decisionMakerName}</span>
                </a>
              </Button>
            </div>

          </Card>
        )}

      </main>
    </div>
  );
}
