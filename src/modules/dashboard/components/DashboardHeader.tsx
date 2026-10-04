'use client';

import React from 'react';
import Link from 'next/link';
import { 
  LayoutGrid, 
  Download, 
  RefreshCw, 
  Plus, 
  Menu, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  aiOnline: boolean;
  activeModel: string;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenGenerator: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function DashboardHeader({
  aiOnline,
  activeModel,
  isLoading,
  onRefresh,
  onOpenGenerator,
  mobileMenuOpen,
  setMobileMenuOpen,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-850 bg-[#09090B]/95 backdrop-blur-md">
      <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2 font-medium text-zinc-200">
            <LayoutGrid className="w-4 h-4 text-zinc-400" />
            <span>Dashboard</span>
          </div>
        </div>

        {/* Right: Actions and Status */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Engine Status Dot */}
          <div 
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono ${
              aiOnline 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-zinc-950 border-zinc-800 text-zinc-400'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${aiOnline ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
            <span>{aiOnline ? `AI Online (${activeModel})` : 'Convex Active'}</span>
          </div>

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/api/export?format=csv', '_blank')}
            className="hidden sm:inline-flex h-8 px-2.5 text-xs bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white rounded-lg cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
            <span>Export</span>
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="hidden sm:inline-flex h-8 w-8 p-0 bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white rounded-lg shrink-0 cursor-pointer"
            title="Refresh leads"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </Button>

          {/* Generate CTA Button */}
          <Button
            size="sm"
            onClick={onOpenGenerator}
            className="h-8 px-3 text-xs bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg shadow-sm cursor-pointer shrink-0 transition-transform active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 sm:mr-1.5 text-zinc-800" />
            <span className="hidden sm:inline">Add Lead Batch</span>
            <span className="sm:hidden">Add Leads</span>
          </Button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-8 w-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>

      </div>

      {/* Mobile Menu Drawer (when opened on small screens) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold px-2">Navigation</span>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-xs font-semibold text-white bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm"
              >
                Dashboard
              </Link>
              <Link 
                href="/proposals" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-900 rounded-lg transition-colors"
              >
                Proposals
              </Link>
              <Link 
                href="/settings" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-900 rounded-lg transition-colors"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
