'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  MapPin, 
  Building2, 
  Layers, 
  Zap, 
  Cpu 
} from 'lucide-react';
import { GenerateLeadsRequest } from '@/types/lead';

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
  const [useOllama, setUseOllama] = useState(ollamaOnline);
  const [ollamaModel, setOllamaModel] = useState(availableModels[0] || 'deepseek-v4-pro:cloud');
  
  const [isLoading, setIsLoading] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

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
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
      setProgressStage('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-card text-card-foreground border border-border rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary via-accent to-secondary p-[1.5px] shadow-sm">
            <div className="w-full h-full bg-background rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Generate Today's Fresh Lead Batch</h2>
            <p className="text-xs text-muted-foreground">Discover 10–20 high-intent clients with diagnosed flaws & ready sales scripts</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Zap className="absolute inset-0 m-auto w-6 h-6 text-accent animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">Generating High-Ticket Leads...</h3>
              <p className="text-sm text-primary animate-pulse font-medium">{progressStage}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="space-y-6">
            
            {/* Field 1: Industry / Niche */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary" />
                Target Industry / Niche
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                {PRESET_NICHES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => { setNiche(item); setCustomNiche(''); }}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all border cursor-pointer ${
                      niche === item && !customNiche
                        ? 'bg-primary/20 border-primary text-foreground font-bold shadow-xs'
                        : 'bg-background border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Or enter custom niche (e.g. Solar Installers, Wedding Photographers...)"
                value={customNiche}
                onChange={(e) => setCustomNiche(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground placeholder-muted-foreground text-xs focus:outline-none focus:border-primary"
              />
            </div>

            {/* Field 2: Target City / Location */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-secondary" />
                Target Location (City)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                {PRESET_CITIES.map((c) => (
                  <button
                    key={c.city}
                    type="button"
                    onClick={() => { setSelectedCityObj(c); setCustomCity(''); }}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all border cursor-pointer ${
                      selectedCityObj.city === c.city && !customCity
                        ? 'bg-secondary/20 border-secondary text-foreground font-bold shadow-xs'
                        : 'bg-background border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="font-semibold">{c.city}</div>
                    <div className="text-[10px] text-muted-foreground">{c.country}</div>
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Or enter custom city (e.g. Pune, Chicago, Sydney...)"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground placeholder-muted-foreground text-xs focus:outline-none focus:border-primary"
              />
            </div>

            {/* Field 3: Quantity Slider */}
            <div className="p-4 rounded-2xl bg-background border border-border flex items-center justify-between gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-accent" />
                  Daily Batch Size
                </label>
                <p className="text-[11px] text-muted-foreground">Recommended: 15 qualified leads per day to call & email</p>
              </div>

              <div className="flex items-center gap-2">
                {[10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCount(num)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      count === num
                        ? 'bg-accent text-accent-foreground border-accent shadow-xs'
                        : 'bg-card text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    {num} Leads
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-primary hover:opacity-90 text-primary-foreground font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>Generate {count} Leads Now (With Call Scripts & Audits)</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
