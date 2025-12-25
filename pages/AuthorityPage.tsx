
import React, { useEffect, useState } from 'react';
import { getEmailLogs, getAuthorityDirectory } from '../services/mockDatabase';
import { EmailLog, AuthorityDirectoryEntry } from '../types';

const AuthorityPage: React.FC = () => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [directory, setDirectory] = useState<AuthorityDirectoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'LOGS' | 'DIRECTORY'>('LOGS');

  useEffect(() => {
    setLogs(getEmailLogs());
    setDirectory(getAuthorityDirectory());
  }, []);

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Authority Portal</h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Routing & Dispatch Audit</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('LOGS')}
          className={`flex-grow py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            activeTab === 'LOGS' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'
          }`}
        >
          Recent Dispatches
        </button>
        <button 
          onClick={() => setActiveTab('DIRECTORY')}
          className={`flex-grow py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            activeTab === 'DIRECTORY' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'
          }`}
        >
          Routing Directory
        </button>
      </div>
      
      {activeTab === 'LOGS' ? (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            Live Audit Trail
          </h3>
          
          {logs.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 p-12 rounded-[30px] text-center">
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No dispatches recorded</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-xl shadow-slate-100/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest mb-2 inline-block">
                      {log.status}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 leading-tight">{log.subject}</h4>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(log.timestamp).toLocaleTimeString()}</p>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mb-4 italic">Sent to: {log.recipients.join(", ")}</p>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Authority Routing Collection</h3>
          <div className="grid grid-cols-1 gap-4">
            {directory.map((entry) => (
              <div key={entry.id} className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex justify-between items-center group hover:border-blue-200 transition-all">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                      {entry.region}
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                      → {entry.category}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900">{entry.authorityName}</h4>
                  <p className="text-[10px] font-bold text-slate-400 truncate max-w-[200px]">{entry.emails.join(", ")}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                   </svg>
                </div>
              </div>
            ))}
          </div>
          <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100 text-center">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Sync Status</p>
            <p className="text-xs font-bold text-slate-600">This directory is mirrored from the Firestore <code className="bg-white px-1 rounded">authority_directory</code> collection for edge-routing.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityPage;
