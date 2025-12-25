
import React from 'react';
import { View } from '../App';
import { UserRole } from '../types';

interface BottomNavProps {
  activeView: View;
  onViewChange: (view: View) => void;
  userRole?: UserRole;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onViewChange, userRole }) => {
  const tabs: { id: View; label: string; icon: React.ReactNode; roles?: UserRole[] }[] = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> 
    },
    { 
      id: 'heatmap', 
      label: 'Heatmap', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /> 
    },
    { 
      id: 'report', 
      label: 'Report', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /> 
    },
    { 
      id: 'analytics', 
      label: 'Data', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> 
    },
    { 
      id: 'history', 
      label: 'History', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> 
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-100 z-50 safe-bottom">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-4">
        {tabs.map((tab) => {
          if (tab.roles && (!userRole || !tab.roles.includes(userRole))) return null;
          
          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`relative flex flex-col items-center justify-center w-full h-full transition-all group ${
                tab.id === 'report' ? '-mt-10 mb-2' : ''
              }`}
            >
              {tab.id === 'report' ? (
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-200 border-4 border-white active:scale-95 transition-all">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {tab.icon}
                  </svg>
                </div>
              ) : (
                <div className={`flex flex-col items-center gap-1 ${activeView === tab.id ? 'tab-active' : 'text-slate-400'}`}>
                  <svg className={`w-6 h-6 transition-transform group-active:scale-90 ${activeView === tab.id ? 'text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {tab.icon}
                  </svg>
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${activeView === tab.id ? 'text-blue-600' : ''}`}>{tab.label}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
