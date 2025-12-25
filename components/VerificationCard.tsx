
import React from 'react';
import { Report } from '../types';
import { castVerificationVote } from '../services/mockDatabase';
import { getCurrentUser } from '../services/authService';

interface VerificationCardProps {
  report: Report;
  onVote: () => void;
}

const VerificationCard: React.FC<VerificationCardProps> = ({ report, onVote }) => {
  const user = getCurrentUser();
  if (!user || report.reportedBy === user.uid) return null;

  const hasVoted = report.verificationVotes?.yes.includes(user.uid) || report.verificationVotes?.no.includes(user.uid);
  const yesCount = report.verificationVotes?.yes.length || 0;
  const noCount = report.verificationVotes?.no.length || 0;

  const handleVote = (isResolved: boolean) => {
    castVerificationVote(report.id, user.uid, isResolved);
    onVote();
  };

  if (hasVoted) {
    return (
      <div className="bg-slate-50 p-6 rounded-[30px] border border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Community Consensus</p>
          <p className="text-xs font-bold text-slate-700">Thank you for your feedback!</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <span className="block text-[8px] font-black text-emerald-600 uppercase">Fixed</span>
            <span className="text-xs font-black">{yesCount}</span>
          </div>
          <div className="text-center">
            <span className="block text-[8px] font-black text-rose-500 uppercase">Active</span>
            <span className="text-xs font-black">{noCount}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50/50 p-6 rounded-[30px] border border-blue-100/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h5 className="text-[11px] font-black text-blue-700 uppercase tracking-widest">Community Verification Required</h5>
      </div>
      
      <p className="text-slate-700 text-xs font-bold mb-5 px-1 leading-relaxed">
        City authorities flagged this as "{report.status.toLowerCase()}". Has this hazard been successfully removed or repaired?
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => handleVote(true)}
          className="flex flex-col items-center justify-center py-3 bg-white border border-emerald-100 rounded-2xl hover:bg-emerald-50 transition-all group"
        >
          <span className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">Yes, Resolved</span>
          <span className="text-[8px] text-slate-400 font-bold mt-0.5">{yesCount} Verifications</span>
        </button>
        <button 
          onClick={() => handleVote(false)}
          className="flex flex-col items-center justify-center py-3 bg-white border border-rose-100 rounded-2xl hover:bg-rose-50 transition-all group"
        >
          <span className="text-rose-500 font-black text-[10px] uppercase tracking-widest">No, Still Active</span>
          <span className="text-[8px] text-slate-400 font-bold mt-0.5">{noCount} Reports</span>
        </button>
      </div>
    </div>
  );
};

export default VerificationCard;
