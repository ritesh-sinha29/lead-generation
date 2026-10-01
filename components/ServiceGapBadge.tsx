import React from 'react';
import { ServiceCategory } from '@/types/lead';
import { Badge } from '@/components/ui/badge';
import { Bot, PhoneCall, Globe, Search, Briefcase } from 'lucide-react';

interface Props {
  service: ServiceCategory;
  showLabel?: boolean;
}

export const SERVICE_CONFIG: Record<ServiceCategory, { label: string; short: string; icon: any; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  chatbots: {
    label: '24/7 AI Chatbot',
    short: 'Chatbot',
    icon: Bot,
    variant: 'secondary'
  },
  calling_agents: {
    label: 'AI Calling Agent',
    short: 'Voice Agent',
    icon: PhoneCall,
    variant: 'secondary'
  },
  web_app: {
    label: 'Web/App Redesign',
    short: 'Web/App',
    icon: Globe,
    variant: 'outline'
  },
  seo_aeo_geo: {
    label: 'SEO / AEO / GEO',
    short: 'AI Search/GEO',
    icon: Search,
    variant: 'secondary'
  },
  portfolio: {
    label: 'High-Ticket Portfolio',
    short: 'Portfolio',
    icon: Briefcase,
    variant: 'outline'
  }
};

export default function ServiceGapBadge({ service, showLabel = true }: Props) {
  const config = SERVICE_CONFIG[service] || SERVICE_CONFIG.chatbots;
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold transition-all hover:opacity-80 cursor-default"
      title={`Vulnerability: ${config.label}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {showLabel && <span>{config.short}</span>}
    </Badge>
  );
}
