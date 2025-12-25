
import React, { useMemo, useState } from 'react';
import { Report, IssueStatus, UserProfile, Location } from '../types';
import MapModal from '../components/MapModal';
import ActionTimeline from '../components/ActionTimeline';

interface MyReportsPageProps {
  reports: Report[];
  user: UserProfile | null;
  onBack: () => void;
}

const MyReportsPage: React.FC<MyReportsPageProps> = ({ reports, user, onBack }) => {
  const [mapState, setMapState] = useState<{ isOpen: boolean; location: Location | null; category: string }>({
    isOpen: false,
    location: null,
    category: ''
  });

  const myReports = useMemo(() => {
    if (!user) return [];
    return reports
      .filter(r => r.reportedBy === user.uid)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [reports, user]);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-400 text-slate-900';
      default: return 'bg-green-500 text-white';
    }
  };

  const getTrustLabel = (score: number) => {
    if (score >= 71) return { text: 'VETERAN STATUS', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    if (score >= 31) return { text: 'VERIFIED CITIZEN', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
    return { text: 'PROBATION PERIOD', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
  };

  const openMap = (location: Location, category: string) => {
    setMapState({ isOpen: true, location, category });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl mx-auto pb-20">
      <MapModal 
        isOpen={mapState.isOpen} 
        onClose={() => setMapState(prev => ({ ...prev, isOpen: false }))} 
        location={mapState.location} 
        category={mapState.category}
      />

      <div className="mb-10 px-2 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">My Activity</h2>
          <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mt-3">Personal Impact Ledger</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-tighter">
            {myReports.length} Records
          </span>
        </div>
      </div>

      {/* Citizen Reputation Card */}
      {user && (
        <div className={`mb-10 mx-2 p-8 rounded-[40px] border-2 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row items-center gap-8 ${getTrustLabel(user.trustScore).bg} ${getTrustLabel(user.trustScore).border}`}>
           <div className="relative">
              <svg className="w-24 h-24 transform -rotate-90">
                 <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200" />
                 <circle 
                  cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={251.2} 
                  strokeDashoffset={251.2 * (1 - user.trustScore / 100)} 
                  strokeLinecap="round" 
                  className={getTrustLabel(user.trustScore).color} 
                 />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-slate-900">
                {user.trustScore}
              </div>
           </div>
           <div className="flex-grow text-center md:text-left">
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${getTrustLabel(user.trustScore).color}`}>
                {getTrustLabel(user.trustScore).text}
              </p>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Citizen Reputation Score</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-md">
                Your score reflects your civic reliability. Accurate AI-verified reports increase your standing, while authority acknowledgments unlock higher impact tiers.
              </p>
           </div>
        </div>
      )}

      {myReports.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[45px] border-2 border-dashed border-slate-100 shadow-sm mx-2">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-400 font-black text-sm uppercase tracking-widest leading-none mb-4">No reports recorded</p>
          <p className="text-slate-300 text-xs font-bold px-12">Capture a hazard to start contributing to city safety.</p>
        </div>
      ) : (
        <div className="space-y-8 px-2">
          {myReports.map((report) => (
            <div key={report.id} className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-slate-200/30 border border-slate-50 transition-all group">
              <div className="relative h-60">
                <img src={report.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Hazard evidence" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-transparent to-transparent"></div>
                
                <div className="absolute top-6 left-6 flex gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getSeverityStyles(report.analysis?.severity || 'LOW')}`}>
                    {report.analysis?.severity || 'PENDING'}
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                   <h3 className="text-white font-black text-xl leading-none mb-2">
                      {report.analysis?.category.replace('_', ' ') || 'Incident Report'}
                   </h3>
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                      <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase">
                        {new Date(report.timestamp).toLocaleString()}
                      </p>
                   </div>
                </div>
              </div>

              <div className="p-8">
                <div className="mb-8">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/></svg>
                    Your Statement
                  </h4>
                  <p className="text-slate-800 text-sm font-bold bg-slate-50 p-5 rounded-3xl border border-slate-100 leading-relaxed shadow-inner italic">
                    "{report.description || 'No description provided.'}"
                  </p>
                </div>

                {/* AI Safety Insight Section */}
                {report.analysis?.safetyInsight && (
                  <div className="mb-8 p-6 bg-blue-50/50 border-l-4 border-blue-600 rounded-r-3xl rounded-l-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest">AI Safety Insight</span>
                    </div>
                    <p className="text-slate-800 text-sm font-semibold leading-relaxed italic">
                      {report.analysis.safetyInsight}
                    </p>
                  </div>
                )}

                {/* Accountability Timeline Integration */}
                <ActionTimeline report={report} />

                <div className="grid grid-cols-2 gap-4 pt-6 mt-8 border-t border-slate-50 mb-8">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Dispatch Target</span>
                    <span className="text-[10px] font-bold text-slate-700 truncate">{report.emailedTo || 'Queuing...'}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Audit</span>
                    <span className="text-[10px] font-bold text-slate-700">{report.analysis?.confidenceScore || 0}% Confident</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => openMap(report.location, report.analysis?.category || 'Hazard')}
                    className="flex items-center justify-center gap-2 px-4 py-4 bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Inspect Site
                  </button>
                  <button 
                    onClick={onBack}
                    className="flex items-center justify-center gap-2 px-4 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 0118 0z" />
                    </svg>
                    Back Home
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReportsPage;
