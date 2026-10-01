'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Building2, 
  Layers, 
  Zap,
  AlertCircle
} from 'lucide-react';
import { GenerateLeadsRequest } from '@/types/lead';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
  ollamaOnline?: boolean;
  availableModels?: string[];
}

const PRESET_NICHES = [
  'Dental Clinics',
  'Real Estate Agencies',
  'Law Firms',
  'Med Spas & Aesthetics',
  'High-End Home Remodeling',
  'E-Commerce Brands',
  'Tech Startups & B2B SaaS',
  'Fitness & CrossFit Gyms'
];

const PRESET_CITIES = [
  { city: 'Mumbai', country: 'India' },
  { city: 'Delhi', country: 'India' },
  { city: 'Bengaluru', country: 'India' },
  { city: 'Dubai', country: 'UAE' },
  { city: 'London', country: 'United Kingdom' },
  { city: 'New York', country: 'United States' },
  { city: 'Toronto', country: 'Canada' },
  { city: 'Singapore', country: 'Singapore' }
];

export default function DailyGeneratorModal({
  isOpen,
  onClose,
  onSuccess,
  ollamaOnline = false,
  availableModels = []
}: Props) {
  const [niche, setNiche] = useState('Dental Clinics');
  const [customNiche, setCustomNiche] = useState('');
  const [selectedCityObj, setSelectedCityObj] = useState(PRESET_CITIES[0]);
  const [customCity, setCustomCity] = useState('');
  const [count, setCount] = useState(15);
  const useOllama = ollamaOnline;
  const ollamaModel = availableModels[0] || 'deepseek-v4-pro:cloud';
  
  const [isLoading, setIsLoading] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const targetNiche = customNiche.trim() || niche;
    const targetCity = customCity.trim() || selectedCityObj.city;
    const targetCountry = customCity.trim() ? 'International' : selectedCityObj.country;

    const payload: GenerateLeadsRequest = {
      niche: targetNiche,
      city: targetCity,
      country: targetCountry,
      count,
      useOllama,
      ollamaModel
    };

    try {
      setProgressStage('1/3: Discovering qualified local businesses...');
      await new Promise(r => setTimeout(r, 600));

      setProgressStage('2/3: Auditing websites & 5-service vulnerabilities...');
      
      const res = await fetch('/api/leads/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lead generation failed');
      }

      setProgressStage('3/3: Crafting sales battlecards & cold scripts...');
      await new Promise(r => setTimeout(r, 400));

      onSuccess(data.newLeads?.length || count);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    } finally {
      setIsLoading(false);
      setProgressStage('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-6 sm:p-8 bg-zinc-950 border-zinc-800 text-zinc-100 shadow-2xl rounded-2xl">
        
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-white">
                Generate Fresh Lead Batch
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Discover 10–20 high-intent clients with diagnosed flaws & ready sales scripts
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-4 border-zinc-800 border-t-indigo-500 animate-spin" />
              <Zap className="absolute inset-0 m-auto w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">Generating High-Ticket Leads...</h3>
              <p className="text-xs text-indigo-400 animate-pulse font-medium">{progressStage}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="space-y-5">
            
            {/* Field 1: Industry / Niche */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                Target Industry / Niche
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
                {PRESET_NICHES.map((item) => (
                  <Button
                    key={item}
                    type="button"
                    variant={niche === item && !customNiche ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setNiche(item); setCustomNiche(''); }}
                    className={`h-8 text-[11px] justify-start px-2 font-medium ${
                      niche === item && !customNiche 
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{item}</span>
                  </Button>
                ))}
              </div>

              <Input
                type="text"
                placeholder="Or enter custom niche (e.g. Solar Installers, Gyms...)"
                value={customNiche}
                onChange={(e) => setCustomNiche(e.target.value)}
                className="h-8 text-xs bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500"
              />
            </div>

            {/* Field 2: Target City / Location */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Target Location (City)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
                {PRESET_CITIES.map((c) => (
                  <Button
                    key={c.city}
                    type="button"
                    variant={selectedCityObj.city === c.city && !customCity ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setSelectedCityObj(c); setCustomCity(''); }}
                    className={`h-8 text-[11px] justify-start px-2 font-medium ${
                      selectedCityObj.city === c.city && !customCity
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{c.city}</span>
                  </Button>
                ))}
              </div>

              <Input
                type="text"
                placeholder="Or enter custom city (e.g. Pune, Chicago...)"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                className="h-8 text-xs bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500"
              />
            </div>

            {/* Field 3: Quantity Buttons */}
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4">
              <div>
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Daily Batch Size
                </label>
                <p className="text-[11px] text-zinc-400">Recommended: 15 qualified leads per day</p>
              </div>

              <div className="flex items-center gap-1.5">
                {[10, 15, 20].map((num) => (
                  <Button
                    key={num}
                    type="button"
                    size="sm"
                    onClick={() => setCount(num)}
                    className={`h-8 px-3 text-xs font-bold ${
                      count === num
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 font-bold text-xs bg-white text-zinc-950 hover:bg-zinc-200 shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-zinc-950" />
              <span>Generate {count} Qualified Leads Now</span>
            </Button>

          </form>
        )}

      </DialogContent>
    </Dialog>
  );
}
