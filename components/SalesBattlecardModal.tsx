'use client';

import React, { useState } from 'react';
import { 
  PhoneCall, 
  Mail, 
  MessageSquare, 
  ShieldAlert, 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  TrendingUp, 
  Send, 
  Cpu, 
  RefreshCw 
} from 'lucide-react';
import { Lead, ObjectionHandler } from '@/types/lead';
import ServiceGapBadge from './ServiceGapBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: any) => void;
  ollamaOnline?: boolean;
}

export default function SalesBattlecardModal({
  lead,
  isOpen,
  onClose,
  onUpdateStatus,
  ollamaOnline = false
}: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState(0);
  
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratedKit, setRegeneratedKit] = useState<any>(null);

  if (!lead) return null;

  const currentPitch = regeneratedKit || lead.pitchKit;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRegenerateWithOllama = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch('/api/ai/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          customInstructions: customPrompt
        })
      });
      const data = await res.json();
      if (data.success && data.pitchKit) {
        setRegeneratedKit(data.pitchKit);
      }
    } catch (err) {
      console.error('Failed to regenerate pitch:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const cleanPhone = (lead.phone || '').replace(/[^0-9+]/g, '');
  const cleanWhatsAppPhone = cleanPhone.replace(/^\+/, '');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
        
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="outline" className="text-xs font-bold">
                  {lead.niche} • {lead.city}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Decision Maker: <strong className="text-foreground">{lead.decisionMakerName}</strong> ({lead.decisionMakerRole})
                </span>
              </div>
              
              <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                <span>{lead.businessName}</span>
                <a 
                  href={lead.website} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs font-normal text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  Visit Site <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </DialogTitle>

              {/* Service Gaps */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-xs text-muted-foreground mr-1">Diagnosed Gaps:</span>
                {lead.audit.topGaps.map((gap, i) => (
                  <ServiceGapBadge key={i} service={gap.service} />
                ))}
              </div>
            </div>

            {/* Quick Dial Action */}
            <div className="flex items-center gap-2">
              <Button asChild variant="secondary" className="font-bold text-xs">
                <a href={`tel:${cleanPhone}`} onClick={() => onUpdateStatus?.(lead.id, 'to_call')}>
                  <PhoneCall className="w-3.5 h-3.5 mr-1" />
                  Dial {lead.phone}
                </a>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Navigation & Body */}
        <Tabs defaultValue="call" className="flex-1 flex flex-col overflow-hidden">
          
          <div className="px-6 border-b border-border bg-muted/30">
            <TabsList className="bg-transparent h-12 p-0 gap-2">
              <TabsTrigger value="call" className="text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs">
                <PhoneCall className="w-3.5 h-3.5 mr-1.5" /> Cold Call Script
              </TabsTrigger>
              <TabsTrigger value="email" className="text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs">
                <Mail className="w-3.5 h-3.5 mr-1.5" /> Cold Email
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> WhatsApp / SMS
              </TabsTrigger>
              <TabsTrigger value="objections" className="text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs">
                <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> Objection Annihilator (5)
              </TabsTrigger>
              <TabsTrigger value="proposal" className="text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs">
                <FileText className="w-3.5 h-3.5 mr-1.5" /> ROI & Proposal
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-xs">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI Tuner
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6">
            
            {/* TAB 1: COLD CALL SCRIPT */}
            <TabsContent value="call" className="mt-0 space-y-4">
              
              <div className="p-4 rounded-xl bg-background border border-primary/30 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Step 1: 30-Second Pattern Interrupt Opener
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleCopy(currentPitch.coldCallOpener, 'opener')}
                  >
                    {copiedKey === 'opener' ? <Check className="w-3.5 h-3.5 text-secondary mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copiedKey === 'opener' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <p className="text-sm font-medium leading-relaxed italic text-foreground">
                  {currentPitch.coldCallOpener}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-accent/15 border border-accent/40 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Step 2: The "Smoking Gun" (Diagnosed Flaw)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleCopy(currentPitch.coldCallSmokingGun, 'gun')}
                  >
                    {copiedKey === 'gun' ? <Check className="w-3.5 h-3.5 text-secondary mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copiedKey === 'gun' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <p className="text-sm font-medium leading-relaxed text-foreground">
                  {currentPitch.coldCallSmokingGun}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    Step 3: Value Proposition
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleCopy(currentPitch.coldCallValueProposition, 'val')}
                  >
                    {copiedKey === 'val' ? <Check className="w-3.5 h-3.5 text-secondary mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copiedKey === 'val' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <p className="text-sm font-medium leading-relaxed italic text-foreground">
                  {currentPitch.coldCallValueProposition}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-secondary/15 border border-secondary/30 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    Step 4: Low-Friction Micro-Close (No Pressure)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleCopy(currentPitch.coldCallMicroClose, 'close')}
                  >
                    {copiedKey === 'close' ? <Check className="w-3.5 h-3.5 text-secondary mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copiedKey === 'close' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <p className="text-sm font-bold leading-relaxed italic text-foreground">
                  {currentPitch.coldCallMicroClose}
                </p>
              </div>

            </TabsContent>

            {/* TAB 2: COLD EMAIL */}
            <TabsContent value="email" className="mt-0 space-y-4">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Subject Lines:
                </label>
                <div className="space-y-1.5">
                  {currentPitch.emailSubjectLines.map((subj: string, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => { setSelectedSubjectIdx(idx); handleCopy(subj, `subj-${idx}`); }}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all ${
                        selectedSubjectIdx === idx
                          ? 'bg-primary/15 border-primary text-foreground font-bold'
                          : 'bg-background border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span>{subj}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        {copiedKey === `subj-${idx}` ? <Check className="w-3 h-3 text-secondary" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === `subj-${idx}` ? 'Copied' : 'Copy'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-xs font-bold text-primary">To: {lead.email}</span>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleCopy(currentPitch.emailBody, 'email-body')}
                    >
                      {copiedKey === 'email-body' ? <Check className="w-3.5 h-3.5 text-secondary mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      Copy Body
                    </Button>

                    <Button asChild size="sm" className="h-7 text-xs font-bold">
                      <a href={`mailto:${lead.email}?subject=${encodeURIComponent(currentPitch.emailSubjectLines[selectedSubjectIdx])}&body=${encodeURIComponent(currentPitch.emailBody)}`} onClick={() => onUpdateStatus?.(lead.id, 'to_email')}>
                        <Send className="w-3 h-3 mr-1" /> Open Mail App
                      </a>
                    </Button>
                  </div>
                </div>

                <pre className="text-xs text-foreground font-sans whitespace-pre-wrap leading-relaxed">
                  {currentPitch.emailBody}
                </pre>
              </div>

            </TabsContent>

            {/* TAB 3: WHATSAPP / SMS */}
            <TabsContent value="whatsapp" className="mt-0 space-y-4">
              <div className="p-4 rounded-xl bg-secondary/15 border border-secondary/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-secondary/20">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-secondary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                      WhatsApp Pitch: {lead.phone}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleCopy(currentPitch.whatsappMessage, 'wa-msg')}
                    >
                      {copiedKey === 'wa-msg' ? <Check className="w-3.5 h-3.5 text-secondary mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      Copy Text
                    </Button>

                    <Button asChild variant="secondary" size="sm" className="h-7 text-xs font-bold">
                      <a href={`https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(currentPitch.whatsappMessage)}`} target="_blank" rel="noreferrer" onClick={() => onUpdateStatus?.(lead.id, 'contacted')}>
                        <Send className="w-3 h-3 mr-1" /> Open WhatsApp Web
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-background border border-border text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {currentPitch.whatsappMessage}
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: OBJECTION ANNIHILATOR */}
            <TabsContent value="objections" className="mt-0 space-y-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-foreground flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
                <span>Word-for-word scripts to demolish the top 5 common client pushbacks on a live call:</span>
              </div>

              {(currentPitch.objections || []).map((obj: ObjectionHandler, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-background border border-border space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-foreground">
                      “{obj.objection}”
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[11px]"
                      onClick={() => handleCopy(obj.exactResponseScript, `obj-${idx}`)}
                    >
                      {copiedKey === `obj-${idx}` ? <Check className="w-3 h-3 text-secondary mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                      Copy
                    </Button>
                  </div>

                  <p className="text-[11px] text-muted-foreground italic">
                    Psychology: {obj.whyTheySayIt}
                  </p>

                  <div className="p-3 rounded-lg bg-card border border-border text-xs text-foreground font-medium leading-relaxed">
                    {obj.exactResponseScript}
                  </div>

                  <div className="text-[11px] text-secondary font-semibold">
                    Pivot Goal: <span className="text-muted-foreground font-normal">{obj.pivotToClose}</span>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* TAB 5: ROI & PROPOSAL */}
            <TabsContent value="proposal" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-background border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Package</span>
                  <strong className="text-xs text-foreground">{currentPitch.recommendedPackageName}</strong>
                </div>

                <div className="p-3.5 rounded-xl bg-background border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Investment</span>
                  <strong className="text-xs text-secondary font-bold">{currentPitch.estimatedPrice}</strong>
                </div>

                <div className="p-3.5 rounded-xl bg-background border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Timeline</span>
                  <strong className="text-xs text-primary font-bold">{currentPitch.deliveryTimeline}</strong>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-secondary" />
                  Client Leakage Breakdown
                </h3>

                <div className="space-y-1.5">
                  {lead.audit.topGaps.map((gap, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-card border border-border flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-foreground">{gap.serviceTitle}</div>
                        <div className="text-[11px] text-muted-foreground">{gap.detectedIssue}</div>
                      </div>
                      <div className="text-destructive font-bold">-${gap.estimatedLostRevenueMonthly}/mo</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* TAB 6: AI TUNER */}
            <TabsContent value="ai" className="mt-0 space-y-3">
              <div className="p-4 rounded-xl bg-background border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Fine-Tune Pitch with Ollama Local LLM
                  </span>
                </div>

                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Enter custom pitch instruction for Ollama (e.g. Focus 100% on AI Voice Callbacks)..."
                  rows={3}
                  className="text-xs"
                />

                <Button
                  onClick={handleRegenerateWithOllama}
                  disabled={isRegenerating}
                  className="w-full font-bold text-xs"
                >
                  {isRegenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Regenerating with Ollama...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Regenerate Pitch Kit
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

          </ScrollArea>

        </Tabs>

      </DialogContent>
    </Dialog>
  );
}
