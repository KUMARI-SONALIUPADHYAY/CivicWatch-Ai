
import React, { useState, useMemo } from 'react';
import { Report, IssueStatus, Location } from '../types';
import MapModal from '../components/MapModal';
import ActionTimeline from '../components/ActionTimeline';
import VerificationCard from '../components/VerificationCard';
import AIReInspection from '../components/AIReInspection';

interface DashboardPageProps {
  reports: Report[];
  onUpdateStatus: (id: string, status: IssueStatus) => void;
  onBack: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ reports, onUpdateStatus, onBack }) => {
  const [filter, setFilter] = useState<IssueStatus | 'ALL'>('ALL');
  const [mapState, setMapState] = useState<{ isOpen: boolean; location: Location | null; category: string }>({
    isOpen: false,
    location: null,
    category: ''
  });

  const [refreshTick, setRefreshTick] = useState(0);

  const displayReports = useMemo(() => {
    let list = [...reports];
    if (filter !== 'ALL') {
      list = list.filter(r => r.status === filter);
    }
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }, [reports, filter, refreshTick]);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-400 text-slate-900';
      default: return 'bg-green-500 text-white';
    }
  };

  const openMap = (location: Location, category: string) => {
    setMapState({ isOpen: true, location, category });
  };

  const shouldShowVerification = (report: Report) => {
    return report.status !== IssueStatus.RESOLVED && report.status !== IssueStatus.REJECTED;
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-2xl mx-auto pb-20">
      <MapModal 
        isOpen={mapState.isOpen} 
        onClose={() => setMapState(prev => ({ ...prev, isOpen: false }))} 
        location={mapState.location} 
        category={mapState.category}
      />

      <div className="mb-8 flex justify-between items-end px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Public Audit</h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Live Registry • {reports.length} Reports</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar px-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
            filter === 'ALL' ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'
          }`}
        >
          All (Latest)
        </button>
        {Object.values(IssueStatus).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              filter === s ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-10 px-2">
        {displayReports.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No reports found in registry</p>
          </div>
        ) : (
          displayReports.map((report) => (
            <div key={report.id} className={`bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-slate-200/40 border transition-all hover:-translate-y-1 ${report.isOverdue ? 'border-red-200 ring-2 ring-red-100' : 'border-slate-50'}`}>
              <div className="relative h-72">
                <img src={report.image} className="w-full h-full object-cover" alt="Hazard Evidence" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                
                <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${getSeverityStyles(report.analysis?.severity || 'LOW')}`}>
                    {report.analysis?.severity || 'PENDING'}
                  </span>
                  <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-lg">
                    {report.analysis?.category.replace('_', ' ') || 'NEW'}
                  </span>
                  {report.aiVerifiedResolution && (
                    <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      AI Verified Resolution
                    </span>
                  )}
                  {report.isOverdue && (
                    <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Overdue
                    </span>
                  )}
                  {report.status === IssueStatus.ESCALATED && (
                    <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                      Escalated to Oversight
                    </span>
                  )}
                </div>

                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-xl">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div className="text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{report.city || 'Bhilai'}</p>
                    <p className="text-[9px] font-bold opacity-60">
                      {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="mb-6">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
                    Citizen Statement
                  </h4>
                  <p className="text-slate-900 text-sm font-bold bg-slate-50 p-5 rounded-3xl border border-slate-100 leading-relaxed shadow-inner italic">
                    "{report.description || 'No statement provided.'}"
                  </p>
                </div>

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

                {shouldShowVerification(report) && (
                  <div className="mb-8">
                    <AIReInspection report={report} onComplete={() => setRefreshTick(t => t + 1)} />
                  </div>
                )}

                {shouldShowVerification(report) && (
                  <div className="mb-8">
                    <VerificationCard report={report} onVote={() => setRefreshTick(t => t + 1)} />
                  </div>
                )}

                <div className="mb-8">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">AI Diagnostic (v3.0)</h4>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    {report.analysis?.description || 'Deep neural network analysis in progress...'}
                  </p>
                </div>

                <ActionTimeline report={report} />

                <div className="pt-6 mt-8 border-t border-slate-50 flex flex-col gap-4">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Confidence</span>
                        <span className="text-xs font-black text-slate-900">{report.analysis?.confidenceScore || 0}% AI Verified</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Status</span>
                        <span className={`text-xs font-black ${report.status === IssueStatus.ESCALATED ? 'text-orange-600' : 'text-blue-600'}`}>{report.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => openMap(report.location, report.analysis?.category || 'Hazard')}
                      className="flex items-center justify-center gap-2 px-4 py-4 bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Inspect Site
                    </button>
                    <button 
                      onClick={onBack}
                      className="flex items-center justify-center gap-2 px-4 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 0118 0z" />
                      </svg>
                      Back Home
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
