
import React from 'react';
import { Report, IssueStatus } from '../types';

interface ActionTimelineProps {
  report: Report;
}

const ActionTimeline: React.FC<ActionTimelineProps> = ({ report }) => {
  const steps = [
    {
      id: 1,
      label: 'Report Submitted',
      status: IssueStatus.REPORTED,
      timestamp: report.createdAt,
      description: 'Hazard captured and AI verification initiated.'
    },
    {
      id: 2,
      label: 'Email Sent to Authority',
      status: IssueStatus.EMAILED,
      timestamp: report.emailedAt,
      description: 'Formal maintenance request dispatched to municipality.'
    },
    {
      id: 3,
      label: 'Authority Acknowledged',
      status: IssueStatus.ACKNOWLEDGED,
      timestamp: report.acknowledgedAt,
      description: 'Department of Infrastructure has received the alert.'
    },
    {
      id: 4,
      label: 'Repair In Progress',
      status: IssueStatus.IN_PROGRESS,
      timestamp: report.startedAt,
      description: 'Maintenance crew dispatched for remediation.'
    },
    {
      id: 5,
      label: 'Resolved',
      status: IssueStatus.RESOLVED,
      timestamp: report.resolvedAt,
      description: 'Hazard mitigated and final verification complete.'
    }
  ];

  // Logic to inject Escalation step if it happened
  if (report.status === IssueStatus.ESCALATED || report.escalatedAt) {
    const escalationStep = {
      id: 6,
      label: 'Escalated to Oversight',
      status: IssueStatus.ESCALATED,
      timestamp: report.escalatedAt,
      description: `Threshold exceeded. Escalate to: ${report.escalatedTo || 'City Commissioner'}.`
    };
    // Inject before Resolved if not resolved, or just after In Progress
    const insertIdx = steps.findIndex(s => s.status === IssueStatus.RESOLVED);
    steps.splice(insertIdx, 0, escalationStep);
  }

  const getStatusIndex = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.REPORTED: return 0;
      case IssueStatus.EMAILED: return 1;
      case IssueStatus.ACKNOWLEDGED: return 2;
      case IssueStatus.IN_PROGRESS: return 3;
      case IssueStatus.ESCALATED: return steps.findIndex(s => s.status === IssueStatus.ESCALATED);
      case IssueStatus.RESOLVED: return steps.length - 1;
      default: return -1;
    }
  };

  const currentIdx = getStatusIndex(report.status);

  return (
    <div className="mt-8">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Accountability Timeline
      </h4>
      
      <div className="space-y-6">
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIdx;
          const isActive = idx === currentIdx;
          const isPending = idx > currentIdx;
          const isAuthorityUpdate = isCompleted && report.updatedBy === 'AUTHORITY' && idx === currentIdx;
          const isEscalation = step.status === IssueStatus.ESCALATED;

          return (
            <div key={`${step.id}-${idx}`} className="relative pl-8 group">
              {/* Vertical Line */}
              {idx !== steps.length - 1 && (
                <div className={`absolute left-3 top-6 bottom-0 w-0.5 transition-all duration-700 ${isCompleted ? (isEscalation ? 'bg-orange-500' : 'bg-green-500') : 'bg-slate-100'}`}></div>
              )}

              {/* Step Circle */}
              <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 z-10 flex items-center justify-center transition-all duration-500 ${
                isCompleted ? (isEscalation ? 'bg-orange-500 border-orange-500 shadow-orange-100' : 'bg-green-500 border-green-500 shadow-lg shadow-green-100') : 
                isActive ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100 scale-110' : 'bg-white border-slate-200'
              }`}>
                {isCompleted ? (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isActive ? (
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                ) : null}
              </div>

              {/* Content */}
              <div className={`transition-all duration-500 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <h5 className={`text-xs font-black uppercase tracking-tight ${isEscalation ? 'text-orange-600' : isCompleted ? 'text-green-600' : isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                      {step.label}
                    </h5>
                    {isAuthorityUpdate && (
                      <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">
                        Source: Authority Confirmation
                      </span>
                    )}
                  </div>
                  {step.timestamp && (
                    <span className={`bg-slate-100 text-[8px] font-black ${isEscalation ? 'text-orange-600 bg-orange-50' : 'text-slate-500'} px-2 py-0.5 rounded uppercase tracking-tighter`}>
                      {new Date(step.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-bold leading-tight mt-1">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActionTimeline;
