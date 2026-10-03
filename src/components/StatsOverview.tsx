import React from 'react';
import { Lead } from '@/types/lead';
import { 
  Users, 
  TrendingUp, 
  PhoneCall, 
  Bot, 
  CheckCircle2, 
  DollarSign, 
  Globe 
} from 'lucide-react';

interface Props {
  leads: Lead[];
}

export default function StatsOverview({ leads }: Props) {
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const contacted = leads.filter((l) => ['contacted', 'to_call', 'to_email'].includes(l.status)).length;
  const meetingsBooked = leads.filter((l) => l.status === 'meeting_booked').length;
  const closedWon = leads.filter((l) => l.status === 'closed_won').length;

  const totalPipelineValue = leads.reduce((acc, lead) => {
    const monthlyLoss = lead.audit.topGaps.reduce((sum, g) => sum + (g.estimatedLostRevenueMonthly || 0), 0);
    return acc + monthlyLoss;
  }, 0);

  const chatbotGaps = leads.filter((l) => l.audit.topGaps.some((g) => g.service === 'chatbots')).length;
  const voiceAgentGaps = leads.filter((l) => l.audit.topGaps.some((g) => g.service === 'calling_agents')).length;
  const geoGaps = leads.filter((l) => l.audit.topGaps.some((g) => g.service === 'seo_aeo_geo')).length;
  const webAppGaps = leads.filter((l) => l.audit.topGaps.some((g) => g.service === 'web_app')).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* Card 1: Total Leads */}
      <div className="p-5 rounded-2xl bg-card text-card-foreground border border-border shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Leads in CRM</span>
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-foreground tracking-tight">{totalLeads}</span>
          {newLeads > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/20 text-foreground border border-accent/40">
              +{newLeads} new
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          Ready for outreach today
        </p>
      </div>

      {/* Card 2: Outreach Pipeline */}
      <div className="p-5 rounded-2xl bg-card text-card-foreground border border-border shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Outreach & Meetings</span>
          <div className="p-2 rounded-xl bg-secondary/15 text-secondary border border-secondary/30">
            <PhoneCall className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-foreground tracking-tight">{meetingsBooked}</span>
          <span className="text-xs text-secondary font-semibold">meetings booked</span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{contacted} in conversation</span>
          <span>•</span>
          <span className="text-secondary font-medium">{closedWon} won</span>
        </div>
      </div>

      {/* Card 3: Potential Client Leaks */}
      <div className="p-5 rounded-2xl bg-card text-card-foreground border border-border shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client Revenue Leaks</span>
          <div className="p-2 rounded-xl bg-accent/20 text-foreground border border-accent/40">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-foreground tracking-tight">
            ${(totalPipelineValue / 1000).toFixed(0)}k<span className="text-base font-normal text-muted-foreground">/mo</span>
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Total detected revenue clients lose monthly to fixable tech gaps
        </p>
      </div>

      {/* Card 4: Top Opportunities */}
      <div className="p-5 rounded-2xl bg-card text-card-foreground border border-border shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Service Pitch Angles</span>
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <Bot className="w-3.5 h-3.5 text-accent" />
            <span>{chatbotGaps} Chatbots</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <PhoneCall className="w-3.5 h-3.5 text-secondary" />
            <span>{voiceAgentGaps} Voice AI</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span>{webAppGaps} Web Dev</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
            <span>{geoGaps} GEO/SEO</span>
          </div>
        </div>
      </div>

    </div>
  );
}
