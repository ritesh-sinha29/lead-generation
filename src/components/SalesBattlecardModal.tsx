'use client';

import React, { useState } from 'react';
import { 
  PhoneCall, 
  Copy, 
  Check, 
  ExternalLink, 
  Send, 
  RefreshCw
} from 'lucide-react';
import { Lead, ObjectionHandler, LeadStatus, SalesPitchKit } from '@/types/lead';
import ServiceGapBadge from './ServiceGapBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: LeadStatus) => void;
  ollamaOnline?: boolean;
}

export default function SalesBattlecardModal({
  lead,
  isOpen,
  onClose,
  onUpdateStatus,
}: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState(0);
  
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratedKit, setRegeneratedKit] = useState<SalesPitchKit | null>(null);

  if (!lead) return null;

  const currentPitch: SalesPitchKit = regeneratedKit || lead.pitchKit;

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
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-black border-zinc-800 text-zinc-100 rounded-lg shadow-2xl">
        
        {/* Header */}
        <DialogHeader className="p-5 pb-3 border-b border-zinc-800 bg-zinc-950">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400">
                  {lead.niche} · {lead.city}
                </span>
                <span className="text-xs text-zinc-500">
                  {lead.decisionMakerName} ({lead.decisionMakerRole})
                </span>
              </div>
              
              <DialogTitle className="text-xl font-semibold tracking-tight text-white flex items-center gap-2.5">
                <span>{lead.businessName}</span>
                {lead.website && (
                  <a 
                    href={lead.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs font-normal text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                  >
                    Visit <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </DialogTitle>

              {/* Service Gaps */}
              <div className="flex flex-wrap items-center gap-1 mt-2">
                {lead.audit.topGaps.map((gap, i) => (
                  <ServiceGapBadge key={i} service={gap.service} />
                ))}
              </div>
            </div>

            {/* Quick Dial Action */}
            <div className="flex items-center gap-2">
              <a
                href={`tel:${cleanPhone}`}
                onClick={() => onUpdateStatus?.(lead.id, 'to_call')}
                className="inline-flex items-center justify-center bg-white text-black hover:bg-zinc-200 font-medium text-xs h-8 px-3 rounded transition-colors"
              >
                <PhoneCall className="w-3 h-3 mr-1.5" />
                Dial {lead.phone}
              </a>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Navigation & Body */}
        <Tabs defaultValue="call" className="flex-1 flex flex-col overflow-hidden">
          
          <div className="px-5 border-b border-zinc-800 bg-black">
            <TabsList className="bg-transparent h-10 p-0 gap-1">
              <TabsTrigger value="call" className="text-xs data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-400 rounded-none border-b-2 border-transparent data-[state=active]:border-white">
                Cold Call
              </TabsTrigger>
              <TabsTrigger value="email" className="text-xs data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-400 rounded-none border-b-2 border-transparent data-[state=active]:border-white">
                Email
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="text-xs data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-400 rounded-none border-b-2 border-transparent data-[state=active]:border-white">
                WhatsApp
              </TabsTrigger>
              <TabsTrigger value="objections" className="text-xs data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-400 rounded-none border-b-2 border-transparent data-[state=active]:border-white">
                Objections
              </TabsTrigger>
              <TabsTrigger value="proposal" className="text-xs data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-400 rounded-none border-b-2 border-transparent data-[state=active]:border-white">
                ROI
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-400 rounded-none border-b-2 border-transparent data-[state=active]:border-white">
                AI Fine-Tune
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-5">
            
            {/* TAB 1: COLD CALL SCRIPT */}
            <TabsContent value="call" className="mt-0 space-y-3">
              
              <div className="p-3.5 rounded border border-zinc-800 bg-zinc-950 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    1 · Pattern Interrupt Opener
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] text-zinc-400 hover:text-white"
                    onClick={() => handleCopy(currentPitch.coldCallOpener, 'opener')}
                  >
                    {copiedKey === 'opener' ? <Check className="w-3 h-3 text-white mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copiedKey === 'opener' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <p className="text-xs font-mono leading-relaxed text-zinc-200">
                  {currentPitch.coldCallOpener}
                </p>
              </div>

              <div className="p-3.5 rounded border border-zinc-800 bg-zinc-950 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    2 · Diagnosed Vulnerability Hook
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] text-zinc-400 hover:text-white"
                    onClick={() => handleCopy(currentPitch.coldCallSmokingGun, 'gun')}
                  >
                    {copiedKey === 'gun' ? <Check className="w-3 h-3 text-white mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copiedKey === 'gun' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <p className="text-xs font-mono leading-relaxed text-zinc-200">
                  {currentPitch.coldCallSmokingGun}
                </p>
              </div>

              <div className="p-3.5 rounded border border-zinc-800 bg-zinc-950 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    3 · Value Proposition
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] text-zinc-400 hover:text-white"
                    onClick={() => handleCopy(currentPitch.coldCallValueProposition, 'val')}
                  >
                    {copiedKey === 'val' ? <Check className="w-3 h-3 text-white mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copiedKey === 'val' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <p className="text-xs font-mono leading-relaxed text-zinc-200">
                  {currentPitch.coldCallValueProposition}
                </p>
              </div>

              <div className="p-3.5 rounded border border-zinc-800 bg-zinc-950 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    4 · Low-Friction Micro-Close
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] text-zinc-400 hover:text-white"
                    onClick={() => handleCopy(currentPitch.coldCallMicroClose, 'close')}
                  >
                    {copiedKey === 'close' ? <Check className="w-3 h-3 text-white mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copiedKey === 'close' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <p className="text-xs font-mono font-medium leading-relaxed text-white">
                  {currentPitch.coldCallMicroClose}
                </p>
              </div>

            </TabsContent>

            {/* TAB 2: COLD EMAIL */}
            <TabsContent value="email" className="mt-0 space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1.5">
                  Subject Lines:
                </label>
                <div className="space-y-1">
                  {(currentPitch.emailSubjectLines || []).map((subj: string, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => { setSelectedSubjectIdx(idx); handleCopy(subj, `subj-${idx}`); }}
                      className={`p-2 rounded border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        selectedSubjectIdx === idx
                          ? 'bg-zinc-900 border-zinc-600 text-white'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="font-mono text-[11px]">{subj}</span>
                      <span className="text-[10px] text-zinc-500">
                        {copiedKey === `subj-${idx}` ? 'Copied' : 'Copy'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded border border-zinc-800 bg-zinc-950 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-xs font-mono text-zinc-400">To: {lead.email}</span>
                  
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-[11px] bg-black border-zinc-800 rounded"
                      onClick={() => handleCopy(currentPitch.emailBody, 'email-body')}
                    >
                      {copiedKey === 'email-body' ? 'Copied' : 'Copy Body'}
                    </Button>

                    <a
                      href={`mailto:${lead.email}?subject=${encodeURIComponent(currentPitch.emailSubjectLines[selectedSubjectIdx] || '')}&body=${encodeURIComponent(currentPitch.emailBody)}`}
                      onClick={() => onUpdateStatus?.(lead.id, 'to_email')}
                      className="h-6 px-2 text-[11px] inline-flex items-center justify-center bg-white text-black hover:bg-zinc-200 rounded font-medium transition-colors"
                    >
                      <Send className="w-2.5 h-2.5 mr-1" /> Open Mail
                    </a>
                  </div>
                </div>

                <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {currentPitch.emailBody}
                </pre>
              </div>
            </TabsContent>

            {/* TAB 3: WHATSAPP */}
            <TabsContent value="whatsapp" className="mt-0 space-y-3">
              <div className="p-3.5 rounded border border-zinc-800 bg-zinc-950 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-xs font-mono text-zinc-400">
                    WhatsApp: {lead.phone}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-[11px] bg-black border-zinc-800 rounded text-zinc-300 hover:text-white"
                      onClick={() => handleCopy(currentPitch.whatsappMessage, 'wa-msg')}
                    >
                      {copiedKey === 'wa-msg' ? 'Copied' : 'Copy'}
                    </Button>

                    <a
                      href={`https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(currentPitch.whatsappMessage)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => onUpdateStatus?.(lead.id, 'contacted')}
                      className="h-6 px-2 text-[11px] inline-flex items-center justify-center bg-white text-black hover:bg-zinc-200 rounded font-medium transition-colors"
                    >
                      <Send className="w-2.5 h-2.5 mr-1" /> Open Web
                    </a>
                  </div>
                </div>

                <div className="text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap">
                  {currentPitch.whatsappMessage}
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: OBJECTIONS */}
            <TabsContent value="objections" className="mt-0 space-y-2.5">
              {(currentPitch.objections || []).map((obj: ObjectionHandler, idx: number) => (
                <div key={idx} className="p-3.5 rounded border border-zinc-800 bg-zinc-950 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-medium text-white">
                      {obj.objection}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 text-[10px] text-zinc-500 hover:text-white"
                      onClick={() => handleCopy(obj.exactResponseScript, `obj-${idx}`)}
                    >
                      {copiedKey === `obj-${idx}` ? 'Copied' : 'Copy'}
                    </Button>
                  </div>

                  <p className="text-[11px] text-zinc-500">
                    Reason: {obj.whyTheySayIt}
                  </p>

                  <div className="p-2.5 rounded bg-black border border-zinc-900 text-xs text-zinc-200 font-mono leading-relaxed">
                    {obj.exactResponseScript}
                  </div>

                  <div className="text-[10px] text-zinc-500">
                    Pivot: {obj.pivotToClose}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* TAB 5: ROI */}
            <TabsContent value="proposal" className="mt-0 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-3 rounded border border-zinc-800 bg-zinc-950">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">Package</span>
                  <strong className="text-xs text-white font-medium">{currentPitch.recommendedPackageName}</strong>
                </div>

                <div className="p-3 rounded border border-zinc-800 bg-zinc-950">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">Pricing</span>
                  <strong className="text-xs text-white font-mono">{currentPitch.estimatedPrice}</strong>
                </div>

                <div className="p-3 rounded border border-zinc-800 bg-zinc-950">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">Timeline</span>
                  <strong className="text-xs text-white font-medium">{currentPitch.deliveryTimeline}</strong>
                </div>
              </div>

              <div className="p-3.5 rounded border border-zinc-800 bg-zinc-950 space-y-2">
                <span className="text-[10px] font-mono uppercase text-zinc-500">
                  Client Leakage Audit
                </span>

                <div className="space-y-1">
                  {lead.audit.topGaps.map((gap, i) => (
                    <div key={i} className="p-2 rounded bg-black border border-zinc-900 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-zinc-200">{gap.serviceTitle}</div>
                        <div className="text-[11px] text-zinc-500">{gap.detectedIssue}</div>
                      </div>
                      <div className="font-mono text-zinc-400">-${gap.estimatedLostRevenueMonthly}/mo</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* TAB 6: AI */}
            <TabsContent value="ai" className="mt-0 space-y-3">
              <div className="p-3.5 rounded border border-zinc-800 bg-zinc-950 space-y-2.5">
                <span className="text-xs font-medium text-white">
                  Ollama Custom Re-synthesis
                </span>

                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Custom instruction (e.g. emphasize 24/7 AI Voice after-hours capture)..."
                  rows={3}
                  className="text-xs bg-black border-zinc-800 text-white placeholder-zinc-600 rounded"
                />

                <Button
                  onClick={handleRegenerateWithOllama}
                  disabled={isRegenerating}
                  className="w-full text-xs bg-white text-black hover:bg-zinc-200 font-medium h-8 rounded"
                >
                  {isRegenerating ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    'Regenerate Pitch'
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
