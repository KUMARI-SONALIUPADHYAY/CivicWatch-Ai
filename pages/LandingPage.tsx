
import React from 'react';
import { DashboardStats } from '../types';

interface LandingPageProps {
  onStartReport: () => void;
  stats: DashboardStats | null;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartReport, stats }) => {
  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-10 pt-6">
        <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-[0.9] flex flex-col">
          <span>CIVIC</span>
          <span className="text-blue-600">WATCH AI</span>
        </h1>
        <p className="text-slate-500 mt-4 font-bold text-xs uppercase tracking-[0.3em] opacity-80">Infrastructure Defense System</p>
      </div>

      <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-blue-900/20 mb-10 relative overflow-hidden group">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <span className="bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Network Analytics</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-500 text-[9px] font-black uppercase tracking-tighter">Live System</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="border-r border-white/10 pr-4">
              <p className="text-slate-500 text-[9px] font-black uppercase mb-1 tracking-widest">Active Threats</p>
              <h2 className="text-4xl font-black italic">{stats?.totalReports || 0}</h2>
            </div>
            <div className="pl-4">
              <p className="text-slate-500 text-[9px] font-black uppercase mb-1 tracking-widest">City Safe %</p>
              <h2 className="text-4xl font-black italic">
                {stats && stats.totalReports > 0 ? Math.round((stats.resolvedCount / stats.totalReports) * 100) : 100}
              </h2>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
             <div className="flex flex-col">
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Optimization State</span>
                <span className="text-[10px] text-blue-400 font-black">AI SECTOR CALIBRATED</span>
             </div>
             <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-3/4 animate-pulse"></div>
             </div>
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] group-hover:bg-blue-600/20 transition-all duration-1000"></div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-10">
        <button 
          onClick={onStartReport}
          className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-xl flex flex-col items-center gap-4 active:scale-95 transition-all group hover:border-red-100"
        >
          <div className="w-14 h-14 bg-red-600 rounded-[20px] flex items-center justify-center shadow-lg shadow-red-100 group-hover:rotate-12 transition-transform">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </div>
          <div className="text-center">
            <span className="block text-sm font-black text-slate-900 tracking-tight">Rapid Report</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Instant AI Audit</span>
          </div>
        </button>
        <button className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-xl flex flex-col items-center gap-4 active:scale-95 transition-all group hover:border-blue-100">
          <div className="w-14 h-14 bg-blue-600 rounded-[20px] flex items-center justify-center shadow-lg shadow-blue-100 group-hover:-rotate-12 transition-transform">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="text-center">
            <span className="block text-sm font-black text-slate-900 tracking-tight">Safe Navigator</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">AR ARMORED VIEW</span>
          </div>
        </button>
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-black text-slate-400 flex justify-between items-center px-2 uppercase tracking-[0.2em]">
          Priority Alerts
          <span className="text-blue-600 cursor-pointer">Explore All</span>
        </h3>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-[30px] border border-slate-100 flex gap-5 items-center shadow-lg shadow-slate-100 group hover:translate-x-2 transition-transform">
            <div className="flex-shrink-0 w-3 h-3 rounded-full bg-red-600 animate-ping"></div>
            <div className="flex-grow">
              <p className="text-sm font-black text-slate-900 leading-none mb-1">Critical Hazard: Sector 7 Bridge</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reported by AI Audit #4282</p>
            </div>
            <svg className="w-5 h-5 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="bg-white p-6 rounded-[30px] border border-slate-100 flex gap-5 items-center shadow-lg shadow-slate-100 group hover:translate-x-2 transition-transform">
            <div className="flex-shrink-0 w-3 h-3 rounded-full bg-orange-500"></div>
            <div className="flex-grow">
              <p className="text-sm font-black text-slate-900 leading-none mb-1">Monsoon Warning: Low-lying Roads</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Predictive Trend Active</p>
            </div>
            <svg className="w-5 h-5 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
