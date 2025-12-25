
import React, { useMemo } from 'react';
import { DashboardStats, Report, IssueCategory, IssueStatus } from '../types';
import { 
  BarChart, Bar, ResponsiveContainer, Cell, XAxis, YAxis, Tooltip, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Legend 
} from 'recharts';
import { getReports } from '../services/mockDatabase';

interface AnalyticsPageProps {
  stats: DashboardStats | null;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ stats }) => {
  const reports = useMemo(() => getReports(), []);

  // Derived Data for Advanced Analytics
  const seasonalData = [
    { month: 'May', reports: 12, monsoonRisk: 5 },
    { month: 'Jun', reports: 25, monsoonRisk: 45 },
    { month: 'Jul', reports: 48, monsoonRisk: 85 },
    { month: 'Aug', reports: 52, monsoonRisk: 90 },
    { month: 'Sep', reports: 30, monsoonRisk: 60 },
    { month: 'Oct', reports: 15, monsoonRisk: 20 },
  ];

  const routeRiskData = [
    { category: 'Industrial', risk: 78, damageFreq: 85, color: '#ef4444' },
    { category: 'Residential', risk: 32, damageFreq: 20, color: '#10b981' },
    { category: 'Commercial', risk: 55, damageFreq: 60, color: '#3b82f6' },
  ];

  const accidentZones = [
    { name: 'Intersection A', severity: 'CRITICAL', frequency: 12 },
    { name: 'Highway Exit 4', severity: 'HIGH', frequency: 8 },
    { name: 'Sector 12 Bridge', severity: 'MEDIUM', frequency: 5 },
  ];

  if (!stats) return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Calibrating City Intelligence...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Mission Control</h2>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Predictive Risk & Infrastructure Analytics</p>
      </div>

      {/* 1. Heatmap Simulation & Risk Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">Live Heatmap</h3>
                <p className="text-2xl font-bold">Hazard Density Matrix</p>
              </div>
              <div className="bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                <span className="text-[10px] font-black uppercase tracking-tighter text-blue-300">Updated: Just Now</span>
              </div>
            </div>
            
            {/* Heatmap Visualization */}
            <div className="relative h-64 bg-slate-800/50 rounded-3xl border border-slate-700 overflow-hidden flex items-center justify-center">
              {/* Simulated Map Background */}
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
              
              {/* Heatmap Blobs */}
              <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-red-600/40 blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-orange-600/30 blur-3xl animate-pulse delay-700"></div>
              <div className="absolute top-1/2 right-1/2 w-24 h-24 bg-blue-600/30 blur-2xl animate-pulse delay-1000"></div>
              
              <div className="z-10 grid grid-cols-6 grid-rows-4 gap-2 w-full h-full p-4">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`rounded-lg border border-white/5 flex items-center justify-center transition-all hover:bg-white/10 cursor-crosshair group ${
                      i % 7 === 0 ? 'bg-red-500/20 border-red-500/30' : 
                      i % 5 === 0 ? 'bg-orange-500/10 border-orange-500/20' : ''
                    }`}
                  >
                    {i % 7 === 0 && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]"></div>}
                  </div>
                ))}
              </div>
              
              {/* Map Controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <button className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-600">+</button>
                <button className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-600">-</button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Accident-Prone Zones */}
        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl">
          <h3 className="text-sm font-black uppercase tracking-widest text-red-600 mb-6 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Accident Zones
          </h3>
          <div className="space-y-6">
            {accidentZones.map((zone, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="flex justify-between items-end mb-2">
                  <p className="font-black text-slate-800 text-sm group-hover:text-red-600 transition-colors">{zone.name}</p>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${
                    zone.severity === 'CRITICAL' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {zone.severity}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${zone.severity === 'CRITICAL' ? 'bg-red-600' : 'bg-orange-500'}`}
                    style={{ width: `${(zone.frequency / 15) * 100}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">Frequency Index: {zone.frequency} Alerts/Mo</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Monsoon Damage Trends & Route Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Monsoon/Seasonal Trends */}
        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Seasonal Insight</h3>
              <p className="text-xl font-bold text-slate-900">Monsoon Damage Projection</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seasonalData}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#cbd5e1" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="monsoonRisk" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" name="Risk Index" />
                <Area type="monotone" dataKey="reports" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReports)" name="Report Volume" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest">
            Data correlates precipitation with infrastructure fatigue
          </p>
        </div>

        {/* Route Risk Profiling */}
        <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-xl">
          <h3 className="text-sm font-black uppercase tracking-widest text-green-400 mb-8">Route Risk Profiling</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeRiskData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} width={80} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="risk" radius={[0, 10, 10, 0]} barSize={20} name="Risk Factor">
                  {routeRiskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">High Risk Zones</p>
              <p className="text-xl font-bold text-red-500">Industrial</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Safest Routes</p>
              <p className="text-xl font-bold text-green-500">Residential</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Infrastructure Fatigue Score */}
      <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={351.8} strokeDashoffset={351.8 * 0.3} strokeLinecap="round" className="text-blue-600" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-slate-900 leading-none">72</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Safety Score</span>
          </div>
        </div>
        <div className="flex-grow">
          <h4 className="text-lg font-black text-slate-900 mb-2">City Infrastructure Fatigue Report</h4>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            The overall city safety score has improved by <span className="text-green-600 font-bold">4.2%</span> since automated notifications were deployed. 
            However, <span className="text-red-500 font-bold">Industrial Corridors</span> remain at a critical risk level due to heavy cargo load and monsoon-related waterlogging.
          </p>
          <div className="flex gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase">Blue: Active Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-600"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase">Red: Priority Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-600"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase">Green: Safe/Restored</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
