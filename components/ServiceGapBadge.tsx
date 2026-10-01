import React from 'react';
import { ServiceCategory } from '@/types/lead';

interface Props {
  service: ServiceCategory;
  showLabel?: boolean;
}

export const SERVICE_CONFIG: Record<ServiceCategory, { label: string; short: string; bg: string; text: string; border: string }> = {
  chatbots: {
    label: '24/7 AI Chatbot',
    short: 'Chatbot',
    bg: 'bg-indigo-500/15',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30'
  },
  calling_agents: {
    label: 'AI Calling Agent',
    short: 'Voice Agent',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30'
  },
  web_app: {
    label: 'Web/App Redesign',
    short: 'Web/App',
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30'
  },
  seo_aeo_geo: {
    label: 'SEO / AEO / GEO',
    short: 'GEO/SEO',
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/30'
  },
  portfolio: {
    label: 'High-Ticket Portfolio',
    short: 'Portfolio',
    bg: 'bg-pink-500/15',
    text: 'text-pink-400',
    border: 'border-pink-500/30'
  }
};

export default function ServiceGapBadge({ service, showLabel = true }: Props) {
  const config = SERVICE_CONFIG[service] || SERVICE_CONFIG.chatbots;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${config.bg} ${config.text} ${config.border}`}
      title={`Vulnerability: ${config.label}`}
    >
      {showLabel ? config.short : config.label}
    </span>
  );
}
