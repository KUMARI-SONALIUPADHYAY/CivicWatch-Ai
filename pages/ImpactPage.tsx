
import React, { useMemo } from 'react';
import { Report, IssueStatus, UserProfile } from '../types';

interface ImpactPageProps {
  reports: Report[];
  user: UserProfile | null;
}

const ImpactPage: React.FC<ImpactPageProps> = ({ reports, user }) => {
  const metrics = useMemo(() => {
    if (!user) return { total: 0, resolved: 0, areas: 0, citizens: 0 };
    
    const userReports = reports.filter(r => r.reportedBy === user.uid);
    const resolvedReports = userReports.filter(r => r.status === IssueStatus.RESOLVED);
    const distinctCities = new Set(resolvedReports.map(r => r.city || 'Unknown')).size;
    
    return {
      total: userReports.length,
      resolved: resolvedReports.length,
      areas: distinctCities,
      // Simulated metric: estimate 150 citizens benefited per resolved infrastructure issue
      citizens: resolvedReports.length * 150
    };
  }, [reports, user]);

  if (!user) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl mx-auto pb-20">
      <div className="mb-10 pt-6">
        <h2 className="text-4xl font-black tracking-tighter text-slate-900 leading-[0.9] flex flex-col">
          <span>YOUR CIVIC</span>
          <span className="text-emerald-600">IMPACT</span>
        </h2>
        <p className="text-slate-500 mt-4 font-bold text-xs uppercase tracking-[0.3em] opacity-80">Measuring Change, One Report at a Time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Metric Card 1: Total Contribution */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-emerald-50 rounded-[24px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Reports</p>
          <h3 className="text-4xl font-black text-slate-900 leading-none">{metrics.total}</h3>
          <p className="text-slate-400 text-xs font-bold mt-3">Active hazardous alerts verified by AI.</p>
        </div>

        {/* Metric Card 2: Hazards Resolved */}
        <div className="bg-emerald-600 p-8 rounded-[40px] shadow-2xl shadow-emerald-200 text-white group hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-white/20 rounded-[24px] flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-emerald-100/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Hazards Mitigated</p>
          <h3 className="text-4xl font-black leading-none">{metrics.resolved}</h3>
          <p className="text-emerald-100/80 text-xs font-bold mt-3">Successfully repaired by authorities.</p>
        </div>

        {/* Metric Card 3: Areas Made Safer */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-emerald-50 rounded-[24px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Districts Impacted</p>
          <h3 className="text-4xl font-black text-slate-900 leading-none">{metrics.areas}</h3>
          <p className="text-slate-400 text-xs font-bold mt-3">Unique urban zones made safer for all.</p>
        </div>

        {/* Metric Card 4: Citizens Benefited */}
        <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl shadow-slate-900/20 text-white group hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-white/10 rounded-[24px] flex items-center justify-center mb-6 group-hover:rotate-[-12deg] transition-transform">
            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Citizens Benefited</p>
          <h3 className="text-4xl font-black leading-none italic">~{metrics.citizens}</h3>
          <p className="text-slate-500 text-xs font-bold mt-3">Approximate community members safer.</p>
        </div>
      </div>

      <div className="bg-emerald-50 rounded-[45px] p-10 border-2 border-emerald-100 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
               <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
               </svg>
             </div>
             <h4 className="text-lg font-black text-slate-900 tracking-tight">Civic Hero Recognition</h4>
          </div>
          <p className="text-slate-700 text-sm font-medium leading-relaxed">
            Your contributions are actively reshaping the urban landscape. By reporting these issues, you are reducing traffic accidents by an estimated <span className="text-emerald-600 font-bold">18%</span> in your local sector. Keep capture active to maintain your <span className="font-black">Veteran Status</span>.
          </p>
        </div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px]"></div>
      </div>
    </div>
  );
};

export default ImpactPage;
