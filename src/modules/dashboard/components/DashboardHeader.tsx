'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutGrid, 
  Download, 
  RefreshCw, 
  Plus, 
  Menu, 
  X,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  FileCode
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
  statusFilter?: string;
  selectedNiche?: string;
  searchQuery?: string;
}

export function DashboardHeader({
  aiOnline,
  activeModel,
  isLoading,
  onRefresh,
  onOpenGenerator,
  mobileMenuOpen,
  setMobileMenuOpen,
  statusFilter,
  selectedNiche,
  searchQuery,
}: DashboardHeaderProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExportOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setExportOpen(false);
      }
    }
    if (exportOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [exportOpen]);

  const handleExport = (format: 'pdf' | 'csv' | 'json') => {
    const params = new URLSearchParams();
    params.set('format', format);
    if (statusFilter && statusFilter !== 'all') {
      params.set('status', statusFilter);
    }
    if (selectedNiche && selectedNiche !== 'All') {
      params.set('niche', selectedNiche);
    }
    if (searchQuery && searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    window.open(`/api/export?${params.toString()}`, '_blank');
    setExportOpen(false);
  };

  const hasFilters = (statusFilter && statusFilter !== 'all') || (selectedNiche && selectedNiche !== 'All') || !!(searchQuery && searchQuery.trim());

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

          {/* Export Dropdown Button (PDF & CSV / Excel) */}
          <div className="relative hidden sm:inline-block" ref={dropdownRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportOpen(!exportOpen)}
              className={`h-8 px-2.5 text-xs bg-zinc-950 border text-zinc-300 hover:bg-zinc-900 hover:text-white rounded-lg cursor-pointer transition-colors ${
                exportOpen ? 'border-zinc-700 bg-zinc-900 text-white' : 'border-zinc-800'
              }`}
              title="Export leads to PDF or CSV"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
              <span>Export</span>
              <ChevronDown className={`w-3 h-3 ml-1 text-zinc-500 transition-transform duration-150 ${exportOpen ? 'rotate-180 text-zinc-300' : ''}`} />
            </Button>

            {/* Dropdown Menu Popup */}
            {exportOpen && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl p-1.5 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 duration-100">
                <div className="px-2.5 py-1.5 border-b border-zinc-850/80 mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Export Options
                  </span>
                  {hasFilters && (
                    <span className="text-[9px] font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-1.5 py-0.2 rounded">
                      Filtered
                    </span>
                  )}
                </div>

                {/* Option 1: PDF Document */}
                <button
                  type="button"
                  onClick={() => handleExport('pdf')}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-900/90 flex items-start gap-2.5 transition-colors group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-md bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-rose-500/20 group-hover:border-rose-500/30 transition-colors">
                    <FileText className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-white flex items-center justify-between">
                      <span>Export PDF</span>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">.pdf</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                      Formatted executive report with metrics & tables
                    </p>
                  </div>
                </button>

                {/* Option 2: Excel / CSV Spreadsheet */}
                <button
                  type="button"
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-900/90 flex items-start gap-2.5 transition-colors group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-colors">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-white flex items-center justify-between">
                      <span>Export CSV / Excel</span>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">.csv</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                      Spreadsheet data with all contact & pitch fields
                    </p>
                  </div>
                </button>

                {/* Option 3: JSON */}
                <button
                  type="button"
                  onClick={() => handleExport('json')}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-900/90 flex items-start gap-2.5 transition-colors group cursor-pointer border-t border-zinc-850/60 mt-1 pt-1.5"
                >
                  <div className="w-7 h-7 rounded-md bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-sky-500/20 transition-colors">
                    <FileCode className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-white flex items-center justify-between">
                      <span>Export JSON</span>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">.json</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">
                      Full raw lead objects for API & integrations
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

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

          {/* Mobile Export Actions */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-850">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold px-2">Export Data</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  handleExport('pdf');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-rose-400" />
                <span>Export PDF</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleExport('csv');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
