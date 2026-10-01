'use client';

import React, { useState } from 'react';
import { 
  X, 
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
  const [activeTab, setActiveTab] = useState<'call' | 'email' | 'whatsapp' | 'objections' | 'proposal' | 'ai'>('call');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState(0);
  
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratedKit, setRegeneratedKit] = useState<any>(null);

  if (!isOpen || !lead) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-background/80 backdrop-blur-lg animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-card text-card-foreground border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border bg-card flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {lead.niche} • {lead.city}
              </span>
              <span className="text-xs text-muted-foreground">
                Decision Maker: <strong className="text-foreground">{lead.decisionMakerName}</strong> ({lead.decisionMakerRole})
              </span>
            </div>
            
            <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
              <span>{lead.businessName}</span>
              <a 
                href={lead.website} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1 inline-flex"
              >
                Visit Site <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </h2>

            {/* Service Gaps */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-xs text-muted-foreground mr-1">Diagnosed Gaps:</span>
              {lead.audit.topGaps.map((gap, i) => (
                <ServiceGapBadge key={i} service={gap.service} />
              ))}
            </div>
          </div>

          {/* Close & Quick Call */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${cleanPhone}`}
              onClick={() => onUpdateStatus?.(lead.id, 'to_call')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary hover:opacity-90 text-secondary-foreground font-bold text-xs shadow-xs transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Dial {lead.phone}</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-border bg-muted/40 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-semibold">
          {[
            { id: 'call', label: '📞 Cold Call Battlecard', icon: PhoneCall },
            { id: 'email', label: '📧 Cold Email Pitch', icon: Mail },
            { id: 'whatsapp', label: '💬 WhatsApp / SMS', icon: MessageSquare },
            { id: 'objections', label: '🛡️ Objection Annihilator (5)', icon: ShieldAlert },
            { id: 'proposal', label: '💰 ROI & Proposal Card', icon: FileText },
            { id: 'ai', label: '✨ Ollama AI Tuner', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-primary text-foreground font-bold bg-card'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: COLD CALL SCRIPT */}
          {activeTab === 'call' && (
            <div className="space-y-5">
              
              {/* Step 1: 30s Permission Opener */}
              <div className="p-4 rounded-2xl bg-background border border-primary/30 relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    Step 1: 30-Second Pattern Interrupt Opener
                  </span>
                  <button
                    onClick={() => handleCopy(currentPitch.coldCallOpener, 'opener')}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-muted cursor-pointer"
                  >
                    {copiedKey === 'opener' ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'opener' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-sm text-foreground font-medium leading-relaxed italic">
                  {currentPitch.coldCallOpener}
                </p>
              </div>

              {/* Step 2: The Smoking Gun */}
              <div className="p-4 rounded-2xl bg-accent/15 border border-accent/40 relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    Step 2: The "Smoking Gun" (Exact Flaw Found on Their Site)
                  </span>
                  <button
                    onClick={() => handleCopy(currentPitch.coldCallSmokingGun, 'gun')}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-muted cursor-pointer"
                  >
                    {copiedKey === 'gun' ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'gun' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-sm text-foreground font-medium leading-relaxed">
                  {currentPitch.coldCallSmokingGun}
                </p>
              </div>

              {/* Step 3: Value Proposition */}
              <div className="p-4 rounded-2xl bg-background border border-border relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                    Step 3: Solution & Automation Value
                  </span>
                  <button
                    onClick={() => handleCopy(currentPitch.coldCallValueProposition, 'val')}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-muted cursor-pointer"
                  >
                    {copiedKey === 'val' ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'val' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-sm text-foreground font-medium leading-relaxed italic">
                  {currentPitch.coldCallValueProposition}
                </p>
              </div>

              {/* Step 4: Low-Friction Micro Close */}
              <div className="p-4 rounded-2xl bg-secondary/15 border border-secondary/30 relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                    Step 4: Low-Friction Micro-Close (No Pressure)
                  </span>
                  <button
                    onClick={() => handleCopy(currentPitch.coldCallMicroClose, 'close')}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-muted cursor-pointer"
                  >
                    {copiedKey === 'close' ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'close' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-sm text-foreground font-bold leading-relaxed italic">
                  {currentPitch.coldCallMicroClose}
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: COLD EMAIL */}
          {activeTab === 'email' && (
            <div className="space-y-5">
              
              {/* Subject Lines Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  High-Open Subject Lines (Click to choose & copy):
                </label>
                <div className="space-y-2">
                  {currentPitch.emailSubjectLines.map((subj: string, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => { setSelectedSubjectIdx(idx); handleCopy(subj, `subj-${idx}`); }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                        selectedSubjectIdx === idx
                          ? 'bg-primary/15 border-primary text-foreground font-bold'
                          : 'bg-background border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span>{subj}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        {copiedKey === `subj-${idx}` ? <Check className="w-3 h-3 text-secondary" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === `subj-${idx}` ? 'Copied' : 'Click to Copy'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Body */}
              <div className="p-5 rounded-2xl bg-background border border-border relative">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    To: {lead.email}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(currentPitch.emailBody, 'email-body')}
                      className="flex items-center gap-1.5 text-xs text-foreground px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'email-body' ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'email-body' ? 'Copied Pitch' : 'Copy Email Body'}</span>
                    </button>

                    <a
                      href={`mailto:${lead.email}?subject=${encodeURIComponent(currentPitch.emailSubjectLines[selectedSubjectIdx])}&body=${encodeURIComponent(currentPitch.emailBody)}`}
                      onClick={() => onUpdateStatus?.(lead.id, 'to_email')}
                      className="flex items-center gap-1.5 text-xs text-primary-foreground font-bold px-3.5 py-1.5 rounded-lg bg-primary hover:opacity-90 transition-colors shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Open in Mail App</span>
                    </a>
                  </div>
                </div>

                <pre className="text-xs text-foreground font-sans whitespace-pre-wrap leading-relaxed">
                  {currentPitch.emailBody}
                </pre>
              </div>

            </div>
          )}

          {/* TAB 3: WHATSAPP / SMS */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-5">
              
              <div className="p-5 rounded-2xl bg-secondary/15 border border-secondary/30">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-secondary/20">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-secondary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                      1-Click WhatsApp Pitch: {lead.phone}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(currentPitch.whatsappMessage, 'wa-msg')}
                      className="flex items-center gap-1 text-xs text-foreground px-3 py-1.5 rounded-lg bg-card border border-border cursor-pointer"
                    >
                      {copiedKey === 'wa-msg' ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'wa-msg' ? 'Copied' : 'Copy Text'}</span>
                    </button>

                    <a
                      href={`https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(currentPitch.whatsappMessage)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => onUpdateStatus?.(lead.id, 'contacted')}
                      className="flex items-center gap-1.5 text-xs text-secondary-foreground font-bold px-4 py-1.5 rounded-lg bg-secondary hover:opacity-90 transition-all shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Open WhatsApp Web</span>
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-background border border-border text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {currentPitch.whatsappMessage}
                </div>
              </div>

              {/* LinkedIn DM */}
              <div className="p-5 rounded-2xl bg-background border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    LinkedIn / DM Pitch
                  </span>
                  <button
                    onClick={() => handleCopy(currentPitch.linkedinDm, 'linkedin-msg')}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-muted cursor-pointer"
                  >
                    {copiedKey === 'linkedin-msg' ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'linkedin-msg' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  {currentPitch.linkedinDm}
                </p>
              </div>

            </div>
          )}

          {/* TAB 4: OBJECTION ANNIHILATOR */}
          {activeTab === 'objections' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-foreground flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
                <span>Word-for-word scripts to demolish the top 5 common client pushbacks during a live call:</span>
              </div>

              <div className="space-y-3">
                {(currentPitch.objections || []).map((obj: ObjectionHandler, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-background border border-border space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <span>“{obj.objection}”</span>
                      </h4>
                      <button
                        onClick={() => handleCopy(obj.exactResponseScript, `obj-${idx}`)}
                        className="text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-muted flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedKey === `obj-${idx}` ? <Check className="w-3 h-3 text-secondary" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === `obj-${idx}` ? 'Copied' : 'Copy Script'}</span>
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground italic">
                      Psychology: {obj.whyTheySayIt}
                    </p>

                    <div className="p-3 rounded-xl bg-card border border-border text-xs text-foreground font-medium leading-relaxed">
                      {obj.exactResponseScript}
                    </div>

                    <div className="text-[11px] text-secondary font-semibold flex items-center gap-1">
                      <span>Pivot Goal:</span>
                      <span className="text-muted-foreground font-normal">{obj.pivotToClose}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ROI & PROPOSAL SNAPSHOT */}
          {activeTab === 'proposal' && (
            <div className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-background border border-border">
                  <span className="text-[11px] uppercase font-bold text-muted-foreground block mb-1">Recommended Solution</span>
                  <strong className="text-sm text-foreground">{currentPitch.recommendedPackageName}</strong>
                </div>

                <div className="p-4 rounded-2xl bg-background border border-border">
                  <span className="text-[11px] uppercase font-bold text-muted-foreground block mb-1">Investment Package</span>
                  <strong className="text-sm text-secondary font-bold">{currentPitch.estimatedPrice}</strong>
                </div>

                <div className="p-4 rounded-2xl bg-background border border-border">
                  <span className="text-[11px] uppercase font-bold text-muted-foreground block mb-1">Turnkey Delivery</span>
                  <strong className="text-sm text-primary font-bold">{currentPitch.deliveryTimeline}</strong>
                </div>
              </div>

              {/* Audit Summary Box */}
              <div className="p-5 rounded-2xl bg-background border border-border space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-secondary" />
                  Client Leakage Audit (What to Show the Client)
                </h3>

                <div className="space-y-2">
                  {lead.audit.topGaps.map((gap, i) => (
                    <div key={i} className="p-3 rounded-xl bg-card border border-border flex items-center justify-between text-xs gap-3">
                      <div>
                        <div className="font-bold text-foreground">{gap.serviceTitle}</div>
                        <div className="text-muted-foreground">{gap.detectedIssue}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-destructive font-bold">-${gap.estimatedLostRevenueMonthly}/mo</div>
                        <div className="text-[10px] text-muted-foreground">Estimated leak</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Estimated Client ROI:</span>
                  <span className="text-xs font-bold text-secondary">{currentPitch.estimatedRoi}</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: OLLAMA AI TUNER */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-background border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Fine-Tune Pitch with Ollama Local LLM
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mb-3">
                  Give custom instructions (e.g. <em>"Make it more urgent"</em>, <em>"Focus 100% on AI Voice Callbacks"</em>, <em>"Add an offer for a free 7-day trial"</em>):
                </p>

                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Enter custom pitch instruction for Ollama..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground text-xs focus:outline-none focus:border-primary mb-3"
                />

                <button
                  onClick={handleRegenerateWithOllama}
                  disabled={isRegenerating}
                  className="w-full py-2.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  {isRegenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Regenerating with Ollama...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Regenerate Pitch Kit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
