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
    bg: 'bg-zinc-900',
    text: 'text-zinc-300',
    border: 'border-zinc-800'
  },
  calling_agents: {
    label: 'AI Calling Agent',
    short: 'Voice Agent',
    bg: 'bg-zinc-900',
    text: 'text-zinc-300',
    border: 'border-zinc-800'
  },
  web_app: {
    label: 'Web/App Redesign',
    short: 'Web/App',
    bg: 'bg-zinc-900',
    text: 'text-zinc-300',
    border: 'border-zinc-800'
  },
  seo_aeo_geo: {
    label: 'SEO / AEO / GEO',
    short: 'GEO/SEO',
    bg: 'bg-zinc-900',
    text: 'text-zinc-300',
    border: 'border-zinc-800'
  },
  portfolio: {
    label: 'High-Ticket Portfolio',
    short: 'Portfolio',
    bg: 'bg-zinc-900',
    text: 'text-zinc-300',
    border: 'border-zinc-800'
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
