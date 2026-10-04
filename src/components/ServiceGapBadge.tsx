import React from 'react';
import { ServiceCategory } from '@/types/lead';

interface Props {
  service: ServiceCategory;
  showLabel?: boolean;
  className?: string;
}

export const SERVICE_CONFIG: Record<ServiceCategory, { label: string; short: string }> = {
  chatbots: {
    label: '24/7 AI Chatbot',
    short: 'Chatbot'
  },
  calling_agents: {
    label: 'AI Calling Agent',
    short: 'Voice Agent'
  },
  web_app: {
    label: 'Web / App Redesign',
    short: 'Web / App'
  },
  seo_aeo_geo: {
    label: 'SEO / AEO / GEO',
    short: 'GEO / SEO'
  },
  portfolio: {
    label: 'High-Ticket Portfolio',
    short: 'Portfolio'
  }
};

export default function ServiceGapBadge({ service, showLabel = true, className = '' }: Props) {
  const config = SERVICE_CONFIG[service] || SERVICE_CONFIG.chatbots;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-normal tracking-tight bg-zinc-900/90 text-zinc-300 border border-zinc-800/90 hover:border-zinc-700 transition-colors whitespace-nowrap ${className}`}
      title={`Diagnosed: ${config.label}`}
    >
      {showLabel ? config.short : config.label}
    </span>
  );
}
