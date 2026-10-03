'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  PhoneCall, 
  Copy, 
  Check, 
  ExternalLink, 
  Send, 
  RefreshCw, 
  MessageSquare, 
  Mail, 
  Phone, 
  ShieldAlert, 
  TrendingUp, 
  SlidersHorizontal,
  Cpu,
  User, 
  MapPin, 
  Building2, 
  IndianRupee, 
  Clock,
  FileText,
  Trophy,
  Target,
  Zap
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
  const formattedCity = lead.city ? lead.city.charAt(0).toUpperCase() + lead.city.slice(1) : '';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl w-full max-h-[88vh] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-[#09090B] border border-zinc-800 text-zinc-100 rounded-2xl shadow-2xl">
        
        {/* Top Header - Minimalist WeKraft Aesthetic */}
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-zinc-850 bg-zinc-950 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Metadata */}
            <div className="space-y-2 min-w-0">
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
                  <Building2 className="w-3 h-3 text-zinc-400" />
                  {lead.niche}
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
                  <MapPin className="w-3 h-3 text-zinc-500" />
                  {formattedCity}
                </span>

                <span className="text-zinc-600 hidden sm:inline">/</span>

                <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-zinc-500" />
                  <strong className="text-zinc-200 font-medium">{lead.decisionMakerName}</strong>
                  <span className="text-zinc-500">({lead.decisionMakerRole})</span>
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
                  {lead.businessName}
                </DialogTitle>
                {lead.website && (
                  <a 
                    href={lead.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs font-normal text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors shrink-0"
                  >
                    <span>Visit Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Service Gaps - Minimalist Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {lead.audit.topGaps.map((gap, i) => (
                  <ServiceGapBadge key={i} service={gap.service} />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex sm:flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/proposals?leadId=${lead.id}`}
                  target="_blank"
                  className="inline-flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-medium text-xs h-9 px-3 rounded-lg shadow-sm transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
                  <span>1-Page PDF</span>
                </Link>

                <a
                  href={`tel:${cleanPhone}`}
                  onClick={() => onUpdateStatus?.(lead.id, 'to_call')}
                  className="inline-flex items-center justify-center bg-white hover:bg-zinc-200 text-black font-medium text-xs h-9 px-4 rounded-lg shadow-sm transition-colors active:scale-95"
                >
                  <PhoneCall className="w-3.5 h-3.5 mr-2 text-black" />
                  <span>Dial {lead.phone}</span>
                </a>
              </div>

              <span className="text-[11px] text-zinc-500 font-mono hidden sm:block">
                Health Score: {lead.audit.overallHealthScore}/100
              </span>
            </div>

          </div>
        </DialogHeader>

        {/* Tab Navigation & Body */}
        <Tabs defaultValue="call" className="flex-1 flex flex-col min-h-0 overflow-hidden">
          
          {/* Minimalist Tabs Header */}
          <div className="px-6 border-b border-zinc-850 bg-black shrink-0">
            <TabsList className="bg-transparent h-11 p-0 gap-3 sm:gap-4 flex overflow-x-auto no-scrollbar">
              <TabsTrigger 
                value="call" 
                className="h-11 px-1 text-xs font-medium data-[state=active]:bg-transparent data-[state=active]:text-white text-zinc-400 rounded-none border-b-2 border-transparent data-[state=active]:border-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-zinc-500" />
                <span>Cold Call Script</span>
              </TabsTrigger>

              <TabsTrigger 
                value="email" 
                className="h-11 px-1 text-xs font-medium data-[state=active]:bg-transparent data-[state=active]:text-white text-zinc-400 rounded-none border-b-2 border-transparent data-[state=active]:border-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span>Cold Email</span>
              </TabsTrigger>

              <TabsTrigger 
                value="whatsapp" 
                className="h-11 px-1 text-xs font-medium data-[state=active]:bg-transparent data-[state=active]:text-white text-zinc-400 rounded-none border-b-2 border-transparent data-[state=active]:border-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                <span>WhatsApp</span>
              </TabsTrigger>

              <TabsTrigger 
                value="objections" 
                className="h-11 px-1 text-xs font-medium data-[state=active]:bg-transparent data-[state=active]:text-white text-zinc-400 rounded-none border-b-2 border-transparent data-[state=active]:border-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-zinc-500" />
                <span>Objections</span>
              </TabsTrigger>

              <TabsTrigger 
                value="proposal" 
                className="h-11 px-1 text-xs font-medium data-[state=active]:bg-transparent data-[state=active]:text-white text-zinc-400 rounded-none border-b-2 border-transparent data-[state=active]:border-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
                <span>ROI Proposal</span>
              </TabsTrigger>

              <TabsTrigger 
                value="competitors" 
                className="h-11 px-1 text-xs font-medium data-[state=active]:bg-transparent data-[state=active]:text-white text-zinc-400 rounded-none border-b-2 border-transparent data-[state=active]:border-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Target className="w-3.5 h-3.5 text-zinc-500" />
                <span>Market Intel</span>
              </TabsTrigger>

              <TabsTrigger 
                value="ai" 
                className="h-11 px-1 text-xs font-medium data-[state=active]:bg-transparent data-[state=active]:text-white text-zinc-400 rounded-none border-b-2 border-transparent data-[state=active]:border-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
                <span>AI Fine-Tune</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Smooth Scrollable Container with Hidden Scrollbar */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
            
            {/* TAB 1: COLD CALL SCRIPT */}
            <TabsContent value="call" className="mt-0 space-y-3.5">
              
              {/* Step 1 */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-[#0C0D0E] space-y-2 hover:border-zinc-700 transition-colors shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-400 font-medium tracking-wide uppercase">
                    01 / Pattern Interrupt Opener
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-md"
                    onClick={() => handleCopy(currentPitch.coldCallOpener, 'opener')}
                  >
                    {copiedKey === 'opener' ? <Check className="w-3.5 h-3.5 text-white mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />}
                    <span>{copiedKey === 'opener' ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
                <p className="text-sm text-zinc-200 leading-relaxed font-sans">
                  &ldquo;{currentPitch.coldCallOpener}&rdquo;
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-[#0C0D0E] space-y-2 hover:border-zinc-700 transition-colors shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-400 font-medium tracking-wide uppercase">
                    02 / Diagnosed Vulnerability Hook (Smoking Gun)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-md"
                    onClick={() => handleCopy(currentPitch.coldCallSmokingGun, 'gun')}
                  >
                    {copiedKey === 'gun' ? <Check className="w-3.5 h-3.5 text-white mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />}
                    <span>{copiedKey === 'gun' ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
                <p className="text-sm text-zinc-200 leading-relaxed font-sans">
                  &ldquo;{currentPitch.coldCallSmokingGun}&rdquo;
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-[#0C0D0E] space-y-2 hover:border-zinc-700 transition-colors shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-400 font-medium tracking-wide uppercase">
                    03 / Value Proposition & Turnkey Fix
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-md"
                    onClick={() => handleCopy(currentPitch.coldCallValueProposition, 'val')}
                  >
                    {copiedKey === 'val' ? <Check className="w-3.5 h-3.5 text-white mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />}
                    <span>{copiedKey === 'val' ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
                <p className="text-sm text-zinc-200 leading-relaxed font-sans">
                  &ldquo;{currentPitch.coldCallValueProposition}&rdquo;
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-[#0C0D0E] space-y-2 hover:border-zinc-700 transition-colors shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-400 font-medium tracking-wide uppercase">
                    04 / Low-Friction Micro-Close (Meeting Pitch)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-md"
                    onClick={() => handleCopy(currentPitch.coldCallMicroClose, 'close')}
                  >
                    {copiedKey === 'close' ? <Check className="w-3.5 h-3.5 text-white mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />}
                    <span>{copiedKey === 'close' ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
                <p className="text-sm font-medium text-white leading-relaxed font-sans">
                  &ldquo;{currentPitch.coldCallMicroClose}&rdquo;
                </p>
              </div>

            </TabsContent>

            {/* TAB 2: COLD EMAIL */}
            <TabsContent value="email" className="mt-0 space-y-4">
              
              {/* Subject Lines */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase text-zinc-500 tracking-wider">
                  Select Subject Line:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(currentPitch.emailSubjectLines || []).map((subj: string, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => { setSelectedSubjectIdx(idx); handleCopy(subj, `subj-${idx}`); }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex flex-col justify-between gap-2 transition-colors ${
                        selectedSubjectIdx === idx
                          ? 'bg-zinc-900 border-zinc-600 text-white'
                          : 'bg-[#0C0D0E] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      <span className="font-medium text-xs leading-snug">{subj}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {copiedKey === `subj-${idx}` ? 'Copied' : 'Click to copy'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Body Card */}
              <div className="p-5 rounded-xl border border-zinc-800 bg-[#0C0D0E] space-y-4 shadow-xs">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-850">
                  <div className="text-xs space-y-1">
                    <div className="text-zinc-400">
                      To: <span className="text-zinc-200">{lead.email}</span>
                    </div>
                    <div className="text-zinc-400">
                      Subject: <span className="text-white">{currentPitch.emailSubjectLines[selectedSubjectIdx] || ''}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white rounded-lg"
                      onClick={() => handleCopy(currentPitch.emailBody, 'email-body')}
                    >
                      {copiedKey === 'email-body' ? <Check className="w-3.5 h-3.5 text-white mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />}
                      <span>{copiedKey === 'email-body' ? 'Copied Body' : 'Copy Body'}</span>
                    </Button>

                    <a
                      href={`mailto:${lead.email}?subject=${encodeURIComponent(currentPitch.emailSubjectLines[selectedSubjectIdx] || '')}&body=${encodeURIComponent(currentPitch.emailBody)}`}
                      onClick={() => onUpdateStatus?.(lead.id, 'to_email')}
                      className="h-8 px-3 text-xs inline-flex items-center justify-center bg-white text-black hover:bg-zinc-200 rounded-lg font-medium transition-colors"
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      <span>Open Mail</span>
                    </a>
                  </div>
                </div>

                <div className="text-sm text-zinc-200 font-sans whitespace-pre-wrap leading-relaxed">
                  {currentPitch.emailBody}
                </div>
              </div>

            </TabsContent>

            {/* TAB 3: WHATSAPP */}
            <TabsContent value="whatsapp" className="mt-0 space-y-4">
              <div className="p-5 rounded-xl border border-zinc-800 bg-[#0C0D0E] space-y-4 shadow-xs">
                
                <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                  <span className="text-xs font-mono text-zinc-400">
                    Recipient WhatsApp: {lead.phone}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white rounded-lg"
                      onClick={() => handleCopy(currentPitch.whatsappMessage, 'wa-msg')}
                    >
                      {copiedKey === 'wa-msg' ? <Check className="w-3.5 h-3.5 text-white mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />}
                      <span>{copiedKey === 'wa-msg' ? 'Copied' : 'Copy'}</span>
                    </Button>

                    <a
                      href={`https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(currentPitch.whatsappMessage)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => onUpdateStatus?.(lead.id, 'contacted')}
                      className="h-8 px-3 text-xs inline-flex items-center justify-center bg-white text-black hover:bg-zinc-200 rounded-lg font-medium transition-colors"
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      <span>Open WhatsApp Web</span>
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 text-sm text-zinc-200 font-sans leading-relaxed whitespace-pre-wrap">
                  {currentPitch.whatsappMessage}
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: OBJECTIONS */}
            <TabsContent value="objections" className="mt-0 space-y-3">
              {(currentPitch.objections || []).map((obj: ObjectionHandler, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-zinc-800 bg-[#0C0D0E] hover:border-zinc-700 transition-colors space-y-2.5 shadow-xs">
                  
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-semibold text-white">
                      &ldquo;{obj.objection}&rdquo;
                    </h4>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-zinc-400 hover:text-white"
                      onClick={() => handleCopy(obj.exactResponseScript, `obj-${idx}`)}
                    >
                      {copiedKey === `obj-${idx}` ? <Check className="w-3.5 h-3.5 text-white mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1 text-zinc-500" />}
                      <span>{copiedKey === `obj-${idx}` ? 'Copied' : 'Copy'}</span>
                    </Button>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    <span className="text-zinc-500 font-mono text-[11px] uppercase block mb-0.5">Underlying Concern:</span>
                    {obj.whyTheySayIt}
                  </p>

                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 text-sm text-zinc-200 font-sans leading-relaxed">
                    <span className="text-zinc-500 font-mono text-[10px] uppercase block mb-1">Your Exact Counter:</span>
                    &ldquo;{obj.exactResponseScript}&rdquo;
                  </div>

                  <div className="text-xs text-zinc-400 flex items-center gap-1.5 pt-1">
                    <span className="text-zinc-500 font-mono text-[11px] uppercase">Pivot:</span>
                    <span>{obj.pivotToClose}</span>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* TAB 5: ROI PROPOSAL */}
            <TabsContent value="proposal" className="mt-0 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-zinc-800 bg-[#0C0D0E] space-y-1">
                  <span className="text-[11px] font-mono uppercase text-zinc-500 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                    Recommended Package
                  </span>
                  <div className="text-sm font-semibold text-white pt-1">{currentPitch.recommendedPackageName}</div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-800 bg-[#0C0D0E] space-y-1">
                  <span className="text-[11px] font-mono uppercase text-zinc-500 flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-zinc-400" />
                    Agency Price
                  </span>
                  <div className="text-sm font-semibold text-white pt-1 font-mono">{currentPitch.estimatedPrice}</div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-800 bg-[#0C0D0E] space-y-1">
                  <span className="text-[11px] font-mono uppercase text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    Delivery Timeline
                  </span>
                  <div className="text-sm font-semibold text-white pt-1">{currentPitch.deliveryTimeline}</div>
                </div>
              </div>

              {/* Client Affordability Strategy & Recommended Quote */}
              <div className="p-5 rounded-xl border border-zinc-800 bg-[#0C0D0E] space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-850">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-zinc-400 block mb-0.5">
                      Client Affordability Index & Quote Strategy
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      How Much Should You Ask? (Optimal Sweet Spot)
                    </h4>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                    {currentPitch.affordability?.clientBudgetTier || 'High-Ticket (₹₹₹)'}
                  </span>
                </div>

                {/* Sweet Spot Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-850 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block">Minimum Walkaway</span>
                    <div className="text-xs font-mono font-medium text-zinc-400">
                      {currentPitch.affordability?.minWalkawayPrice || '₹25,000'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-white font-semibold">Recommended Ask</span>
                      <span className="text-[10px] font-mono text-zinc-400">Sweet Spot</span>
                    </div>
                    <div className="text-sm font-mono font-bold text-white">
                      {currentPitch.affordability?.recommendedSweetSpotPrice || '₹45,000 + ₹12,000/mo'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-850 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block">Max Upsell Ceiling</span>
                    <div className="text-xs font-mono font-medium text-zinc-400">
                      {currentPitch.affordability?.maxUpsellPrice || '₹95,000'}
                    </div>
                  </div>
                </div>

                {/* Break-Even Pitch Logic */}
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 leading-relaxed font-sans">
                  <strong className="text-white block text-[11px] uppercase font-mono mb-0.5">ROI Justification Pitch:</strong>
                  {currentPitch.affordability?.roiBreakEvenMath || 'Closing just 1 single new client or booking pays back the entire investment.'}
                </div>

                {/* Pricing Tiers */}
                {(currentPitch.affordability?.quoteOptions || []).length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                      Recommended Pricing Tiers for Proposal:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {currentPitch.affordability?.quoteOptions.map((opt, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border text-xs flex flex-col justify-between gap-1.5 ${
                            opt.isRecommended
                              ? 'bg-zinc-900 border-zinc-700 text-white'
                              : 'bg-zinc-950 border-zinc-850 text-zinc-400'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white">{opt.tierName}</span>
                              {opt.isRecommended && (
                                <span className="text-[9px] font-mono bg-white text-black px-1.5 py-0.2 rounded font-bold">
                                  BEST
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-mono font-bold text-white mt-1">{opt.price}</div>
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-tight">{opt.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Diagnosed Gaps */}
              <div className="p-5 rounded-xl border border-zinc-800 bg-[#0C0D0E] space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
                  <span className="text-xs font-semibold text-white font-mono uppercase">
                    Diagnosed Revenue Leaks
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    Total: -₹{lead.audit.topGaps.reduce((acc, g) => acc + g.estimatedLostRevenueMonthly, 0).toLocaleString('en-IN')}/mo
                  </span>
                </div>

                <div className="space-y-2">
                  {lead.audit.topGaps.map((gap, i) => (
                    <div key={i} className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-white">{gap.serviceTitle}</div>
                        <div className="text-zinc-400">{gap.detectedIssue}</div>
                      </div>
                      <div className="font-mono text-zinc-300 shrink-0 text-sm">
                        -₹{gap.estimatedLostRevenueMonthly.toLocaleString('en-IN')}/mo
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </TabsContent>

            {/* TAB: COMPETITOR INTEL & OUTPERFORM BLUEPRINT */}
            <TabsContent value="competitors" className="mt-0 space-y-4">
              
              {/* Strategic Leapfrog Header */}
              <div className="p-5 rounded-xl border border-zinc-800 bg-[#0C0D0E] space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-850">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-0.5">
                      Competitive Growth Benchmark
                    </span>
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      How to Outperform & Beat Local Competition in {lead.city}
                    </h4>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-emerald-400">
                    Target: {currentPitch.competitorAnalysis?.estimatedTimeToOvertake || '30 to 45 Days to Lead Market'}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 leading-relaxed font-sans space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                    Our Market-Dominance Strategy:
                  </span>
                  <p>
                    {currentPitch.competitorAnalysis?.ourDifferentiationStrategy || 
                      `Deploying instant 24/7 AI lead capture and Generative Engine Optimization (GEO) allows ${lead.businessName} to capture 100% of evening/weekend search queries before local competitors even wake up.`}
                  </p>
                </div>
              </div>

              {/* Competitors List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white font-mono uppercase">
                    Direct Local Competitors Identified ({currentPitch.competitorAnalysis?.topCompetitors?.length || 2})
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">Live local search audit</span>
                </div>

                {((currentPitch.competitorAnalysis?.topCompetitors && currentPitch.competitorAnalysis.topCompetitors.length > 0)
                  ? currentPitch.competitorAnalysis.topCompetitors
                  : [
                      {
                        competitorName: `Top Ranking ${lead.niche} Rival in ${lead.city}`,
                        whyTheyAreWinning: 'Ranks higher on Google Local Pack due to more active reviews and faster contact forms.',
                        marketAdvantage: 'Captures ~35% of first-time searchers who need urgent consultations.',
                        howWeBeatThem: 'Deploying an instant 24/7 AI Voice & WhatsApp Receptionist converts warm prospects within 15 seconds, recovering callers who bounce off their static contact forms.'
                      },
                      {
                        competitorName: `Established ${lead.niche} Provider in ${lead.city}`,
                        whyTheyAreWinning: 'Aggressive Google Business presence and strong word-of-mouth referral capture.',
                        marketAdvantage: 'High perceived brand trust on desktop Google searches.',
                        howWeBeatThem: 'Injecting structured AI entity schema (GEO & AEO) ensures ChatGPT, Perplexity, and Apple Intelligence recommend our client first when users search for best services in town.'
                      }
                    ]
                ).map((comp, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-zinc-800 bg-[#0C0D0E] space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-zinc-850">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-mono text-zinc-400 font-bold">
                          {idx + 1}
                        </span>
                        <div className="font-semibold text-white text-xs">
                          {comp.competitorName}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        Rival Advantage
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block flex items-center gap-1">
                          <Target className="w-3 h-3 text-rose-400" />
                          Why They Are Growing / Winning:
                        </span>
                        <p className="text-zinc-300 text-[11px] leading-relaxed">
                          {comp.whyTheyAreWinning}
                        </p>
                        <div className="text-[10px] text-zinc-500 pt-1">
                          <strong>Market Edge: </strong>{comp.marketAdvantage}
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-750 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block flex items-center gap-1">
                          <Zap className="w-3 h-3 text-emerald-400" />
                          How We Help Our Client Beat Them:
                        </span>
                        <p className="text-zinc-200 text-[11px] leading-relaxed">
                          {comp.howWeBeatThem}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Copyable Competitor Gap Pitch Hook */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-[#0C0D0E] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold">
                    Competitor-Leverage Outreach Angle (Copy & Send)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-md"
                    onClick={() => {
                      const compName = currentPitch.competitorAnalysis?.topCompetitors?.[0]?.competitorName || `competitors in ${lead.city}`;
                      const pitch = `Hi ${lead.decisionMakerName}, while auditing ${lead.niche.toLowerCase()} services in ${lead.city}, I noticed ${compName} is currently picking up evening inquiries because their response time is faster. We built a 24/7 AI booking assistant tailored for ${lead.businessName} that captures 100% of those inquiries before they can call anyone else. Would you be open to a 60-second video demo?`;
                      handleCopy(pitch, 'comp-pitch');
                    }}
                  >
                    {copiedKey === 'comp-pitch' ? <Check className="w-3.5 h-3.5 text-white mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />}
                    <span>{copiedKey === 'comp-pitch' ? 'Copied Pitch' : 'Copy Pitch'}</span>
                  </Button>
                </div>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  &ldquo;Hi {lead.decisionMakerName}, while auditing {lead.niche.toLowerCase()} services in {lead.city}, I noticed {currentPitch.competitorAnalysis?.topCompetitors?.[0]?.competitorName || `competitors in ${lead.city}`} is currently picking up evening inquiries because their response time is faster. We built a 24/7 AI booking assistant tailored for {lead.businessName} that captures 100% of those inquiries before they can call anyone else. Would you be open to a 60-second video demo?&rdquo;
                </p>
              </div>

            </TabsContent>

            {/* TAB 6: AI FINE-TUNE */}
            <TabsContent value="ai" className="mt-0 space-y-4">
              <div className="p-5 rounded-xl border border-zinc-800 bg-[#0C0D0E] space-y-3 shadow-xs">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
                    AI Script Customizer
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Enter custom context or adjustments to re-synthesize custom sales pitches in real-time.
                  </p>
                </div>

                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Focus on high-end luxury conversions and increase urgency..."
                  rows={4}
                  className="text-xs bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 rounded-lg focus:border-zinc-500"
                />

                <Button
                  onClick={handleRegenerateWithOllama}
                  disabled={isRegenerating}
                  className="w-full text-xs bg-white hover:bg-zinc-200 text-black font-semibold h-9 rounded-lg transition-colors cursor-pointer"
                >
                  {isRegenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />
                      <span>Regenerate Pitch Kit</span>
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

          </div>

        </Tabs>

      </DialogContent>
    </Dialog>
  );
}
