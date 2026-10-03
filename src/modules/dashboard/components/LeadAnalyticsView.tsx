'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface LeadAnalyticsViewProps {
  nicheRevenueLeakData: { niche: string; leak: number }[];
  serviceDistributionData: { name: string; value: number; color: string }[];
  pipelineStageData: { stage: string; count: number }[];
}

export function LeadAnalyticsView({
  nicheRevenueLeakData,
  serviceDistributionData,
  pipelineStageData,
}: LeadAnalyticsViewProps) {
  return (
    <div className="space-y-4">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Chart 1: Revenue Leak with Vibrant Indigo Bars */}
        <div className="p-5 border border-zinc-800 rounded-xl bg-zinc-950/70 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white tracking-tight">Revenue Leak by Market Niche</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Estimated monthly client loss</p>
            </div>
            <span className="text-xs font-mono text-zinc-500">INR (₹) / mo</span>
          </div>

          <div className="h-60 w-full min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={nicheRevenueLeakData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="nicheGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818CF8" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#27272A" vertical={false} />
                <XAxis dataKey="niche" stroke="#71717A" fontSize={11} tickLine={false} axisLine={{ stroke: '#27272A' }} />
                <YAxis stroke="#71717A" fontSize={11} tickLine={false} axisLine={{ stroke: '#27272A' }} tickFormatter={(val: number) => `₹${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  formatter={(val: number | string | readonly (string | number)[] | undefined) => [`₹${Number(val).toLocaleString('en-IN')}/mo`, 'Leak']}
                />
                <Bar dataKey="leak" fill="url(#nicheGradient)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Vibrant Multi-Color Donut Chart */}
        <div className="p-5 border border-zinc-800 rounded-xl bg-zinc-950/70 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white tracking-tight">Service Gap Distribution</h3>
              <p className="text-xs text-zinc-500 mt-0.5">5 High-Ticket Services</p>
            </div>
            <span className="text-xs font-mono text-zinc-500">Breakdown</span>
          </div>

          <div className="h-60 w-full min-w-0 min-h-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={serviceDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {serviceDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#09090B" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#A1A1AA', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Funnel Chart with Emerald / Teal Glow */}
      <div className="p-5 border border-zinc-800 rounded-xl bg-zinc-950/70 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white tracking-tight">Pipeline Stage Conversion Funnel</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Lead progression velocity</p>
          </div>
          <span className="text-xs font-mono text-zinc-500">Stages</span>
        </div>

        <div className="h-56 w-full min-w-0 min-h-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={pipelineStageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="emeraldArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="#27272A" vertical={false} />
              <XAxis dataKey="stage" stroke="#71717A" fontSize={11} tickLine={false} axisLine={{ stroke: '#27272A' }} />
              <YAxis stroke="#71717A" fontSize={11} tickLine={false} axisLine={{ stroke: '#27272A' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2.5} fill="url(#emeraldArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
