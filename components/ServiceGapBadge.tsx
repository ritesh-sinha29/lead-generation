import React from 'react';
import { ServiceCategory } from '@/types/lead';
import { Bot, PhoneCall, Globe, Search, Briefcase } from 'lucide-react';

interface Props {
  service: ServiceCategory;
  urgency?: 'high' | 'medium' | 'low';
  showLabel?: boolean;
}

export const SERVICE_CONFIG: Record<ServiceCategory, { label: string; short: string; icon: any; color: string; bg: string; border: string }> = {
  chatbots: {
    label: '24/7 AI Chatbot',
    short: 'Chatbot',
    icon: Bot,
    color: 'text-cyan-400',
    bg: 'bg-cyan-950/40',
    border: 'border-cyan-500/30'
  },
  calling_agents: {
    label: 'AI Calling Agent',
    short: 'Voice Agent',
    icon: PhoneCall,
    color: 'text-amber-400',
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/30'
  },
  web_app: {
    label: 'Web/App Redesign',
    short: 'Web/App',
    icon: Globe,
    color: 'text-purple-400',
    bg: 'bg-purple-950/40',
    border: 'border-purple-500/30'
  },
  seo_aeo_geo: {
    label: 'SEO / AEO / GEO',
    short: 'AI Search/GEO',
    icon: Search,
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/30'
  },
  portfolio: {
    label: 'High-Ticket Portfolio',
    short: 'Portfolio',
    icon: Briefcase,
    color: 'text-pink-400',
    bg: 'bg-pink-950/40',
    border: 'border-pink-500/30'
  }
};

export default function ServiceGapBadge({ service, showLabel = true }: Props) {
  const config = SERVICE_CONFIG[service] || SERVICE_CONFIG.chatbots;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.color} ${config.border} transition-all duration-200 hover:scale-105`}
      title={`Vulnerability detected: ${config.label}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {showLabel && <span>{config.short}</span>}
    </span>
  );
}
