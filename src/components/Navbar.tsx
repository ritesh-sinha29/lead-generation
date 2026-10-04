'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Plus, 
  Download, 
  Settings, 
  Cpu, 
  Flame, 
  LayoutDashboard, 
  FileText 
} from 'lucide-react';

interface NavbarProps {
  onOpenGenerator?: () => void;
  aiOnline?: boolean;
  activeModel?: string;
  totalLeadsCount?: number;
}

export default function Navbar({
  onOpenGenerator,
  aiOnline = false,
  activeModel = 'gemini-flash',
  totalLeadsCount = 0
}: NavbarProps) {
  const pathname = usePathname();

  const handleExport = (format: 'csv' | 'json') => {
    window.open(`/api/export?format=${format}`, '_blank');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary via-accent to-secondary p-[1.5px] shadow-sm group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-card rounded-[10px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-foreground tracking-tight">LeadPulse</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  Daily Engine
                </span>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">AI Tech Solutions Agency Closer</p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link 
              href="/" 
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                pathname === '/' 
                  ? 'bg-card text-foreground shadow-xs border border-border' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Leads Feed
              {totalLeadsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs bg-primary/20 text-primary font-bold">
                  {totalLeadsCount}
                </span>
              )}
            </Link>

            <Link 
              href="/proposals" 
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                pathname === '/proposals' 
                  ? 'bg-card text-foreground shadow-xs border border-border' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Pitch Teasers
            </Link>

            <Link 
              href="/settings" 
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                pathname === '/settings' 
                  ? 'bg-card text-foreground shadow-xs border border-border' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </nav>
        </div>

        {/* Status Indicators & Action Buttons */}
        <div className="flex items-center gap-3">
          
          {/* AI Status Badge */}
          <div 
            className={`hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${
              aiOnline 
                ? 'bg-secondary/15 border-secondary/30 text-secondary' 
                : 'bg-muted border-border text-muted-foreground'
            }`}
            title={aiOnline ? `AI Engine Online (${activeModel})` : 'Using built-in expert sales engine'}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="font-semibold">
              {aiOnline ? `AI: ${activeModel.split(':')[0]}` : 'Offline Engine'}
            </span>
            <span className={`w-2 h-2 rounded-full ${aiOnline ? 'bg-secondary' : 'bg-primary'}`} />
          </div>

          {/* Export Button */}
          <button
            onClick={() => handleExport('csv')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-card hover:bg-muted text-foreground border border-border shadow-xs transition-colors"
            title="Export all leads to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* 1-Click Generate Daily Leads */}
          {onOpenGenerator && (
            <button
              onClick={onOpenGenerator}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-primary hover:opacity-90 text-primary-foreground shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Get Daily Leads</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
