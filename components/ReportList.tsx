
import React from 'react';
import { Report, IssueStatus } from '../types';

interface ReportListProps {
  reports: Report[];
  onUpdateStatus: (id: string, status: IssueStatus) => void;
}

const ReportList: React.FC<ReportListProps> = ({ reports, onUpdateStatus }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStatusIcon = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.RESOLVED: return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
      case IssueStatus.IN_PROGRESS: return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      );
      default: return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  return (
    <div className="space-y-4">
      {reports.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <p className="text-slate-400">No reports found. Be the first to secure our roads!</p>
        </div>
      ) : (
        reports.map((report) => (
          <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row gap-4 p-4 hover:shadow-md transition-shadow">
            <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0">
              <img src={report.image} alt="Issue" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-grow space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{report.analysis.category.replace('_', ' ')}</h3>
                  <p className="text-xs text-slate-400">ID: {report.id.substring(0,8)} • {new Date(report.timestamp).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold border ${getSeverityColor(report.analysis.severity)}`}>
                  {report.analysis.severity}
                </span>
              </div>
              
              <p className="text-slate-600 text-sm line-clamp-2">{report.analysis.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-2 rounded">
                  <span className="block text-slate-400 uppercase font-semibold">Repair Cost Est.</span>
                  <span className="text-slate-800 font-medium">{report.analysis.estimatedRepairCost}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <span className="block text-slate-400 uppercase font-semibold">Safety Impact</span>
                  <span className="text-slate-800 font-medium truncate">{report.analysis.publicSafetyImpact}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  {getStatusIcon(report.status)}
                  {report.status.replace('_', ' ')}
                </div>
                
                <div className="flex gap-2">
                  {report.status !== IssueStatus.RESOLVED && (
                    <button 
                      onClick={() => onUpdateStatus(report.id, IssueStatus.RESOLVED)}
                      className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 font-bold transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {report.status === IssueStatus.REPORTED && (
                    <button 
                      onClick={() => onUpdateStatus(report.id, IssueStatus.IN_PROGRESS)}
                      className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-bold transition-colors"
                    >
                      Start Work
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReportList;
