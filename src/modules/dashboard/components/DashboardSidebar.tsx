'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Flame, 
  LayoutGrid, 
  Zap, 
  Users, 
  BarChart3, 
  Settings as SettingsIcon,
  ShieldCheck
} from 'lucide-react';
import { LeadStatus } from '@/types/lead';

export type ViewMode = 'table' | 'kanban' | 'cards' | 'analytics';

interface DashboardSidebarProps {
  viewMode?: ViewMode;
  hasActiveFilters?: boolean;
  statusFilter?: LeadStatus | 'all';
  onNavigateDashboard?: () => void;
  onNavigateAnalytics?: () => void;
  onOpenGenerator?: () => void;
  onFilterToCall?: () => void;
}

export function DashboardSidebar({
  viewMode = 'table',
  hasActiveFilters = false,
  statusFilter = 'all',
  onNavigateDashboard,
  onNavigateAnalytics,
  onOpenGenerator,
  onFilterToCall,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === '/';
  const isSettings = pathname.startsWith('/settings');

  const handleDashboardClick = () => {
    if (onNavigateDashboard) {
      onNavigateDashboard();
    } else {
      router.push('/');
    }
  };

  const handleAnalyticsClick = () => {
    if (onNavigateAnalytics) {
      onNavigateAnalytics();
    } else {
      router.push('/?view=analytics');
    }
  };

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-r border-zinc-850 bg-[#09090B] sticky top-0 h-screen overflow-y-auto print:hidden">
      <div className="p-4 space-y-6">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 px-2 py-1 text-white font-semibold tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xs">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white">
              LeadPulse
            </span>
            <span className="text-[10px] text-zinc-500 font-mono -mt-0.5">Admin Suite</span>
          </div>
        </Link>

        {/* Section: Management */}
        <div className="space-y-1">
          <div className="text-[10px] font-semibold text-zinc-500 tracking-wider uppercase px-2.5 pb-2">
            Management
          </div>

          {/* Nav Items */}
          <nav className="space-y-0.5 text-xs font-medium">
            <button
              onClick={handleDashboardClick}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left cursor-pointer ${
                isHome && viewMode === 'table' && !hasActiveFilters
                  ? 'bg-zinc-900 text-white border border-zinc-800 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-zinc-300 shrink-0" />
              <span>Dashboard</span>
            </button>

            {onOpenGenerator ? (
              <button
                onClick={onOpenGenerator}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors text-left cursor-pointer"
              >
                <Zap className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Live AI Discovery</span>
              </button>
            ) : (
              <Link
                href="/"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors text-left"
              >
                <Zap className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Live AI Discovery</span>
              </Link>
            )}

            {onFilterToCall ? (
              <button
                onClick={onFilterToCall}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left cursor-pointer ${
                  statusFilter === 'to_call'
                    ? 'bg-zinc-900 text-white border border-zinc-800 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                <Users className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Verified Leads</span>
              </button>
            ) : (
              <Link
                href="/?status=to_call"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors text-left"
              >
                <Users className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Verified Leads</span>
              </Link>
            )}

            <button
              onClick={handleAnalyticsClick}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left cursor-pointer ${
                isHome && viewMode === 'analytics'
                  ? 'bg-zinc-900 text-white border border-zinc-800 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>Insights & Analytics</span>
            </button>

            <Link
              href="/settings"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${
                isSettings
                  ? 'bg-zinc-900 text-white border border-zinc-800 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <SettingsIcon className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>Settings & Engine</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Pinned Bottom Status / Access Control */}
      <div className="p-4 border-t border-zinc-850">
        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-medium text-[11px]">Access Control</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>
      </div>
    </aside>
  );
}
