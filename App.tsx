
import React, { useState, useEffect, useCallback } from 'react';
import LandingPage from './pages/LandingPage';
import ReportPage from './pages/ReportPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ARPage from './pages/ARPage';
import AuthorityPage from './pages/AuthorityPage';
import AuthPage from './pages/AuthPage';
import MyReportsPage from './pages/MyReportsPage';
import ImpactPage from './pages/ImpactPage';
import RiskHeatmapPage from './pages/RiskHeatmapPage';
import BottomNav from './components/BottomNav';
import { getReports, getStats, updateStatus, updateStatusByToken, checkAndEscalateReports } from './services/mockDatabase';
import { getCurrentUser, logout } from './services/authService';
import { Report, IssueStatus, DashboardStats, UserProfile } from './types';

export type View = 'home' | 'feed' | 'report' | 'analytics' | 'ar' | 'authority' | 'auth' | 'history' | 'impact' | 'heatmap';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('home');
  const [navHistory, setNavHistory] = useState<View[]>(['home']);
  const [user, setUser] = useState<UserProfile | null>(getCurrentUser());
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const refreshData = useCallback(() => {
    checkAndEscalateReports();
    const data = getReports();
    setReports([...data]);
    setStats(getStats());
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const id = params.get('id');
    const token = params.get('token');
    const status = params.get('status') as IssueStatus;

    if (action === 'updateStatus' && id && token && status) {
      const success = updateStatusByToken(id, token, status);
      if (success) {
        alert(`Authority Confirmation Received: Report status updated to ${status}.`);
        refreshData();
        window.history.replaceState({}, document.title, window.location.pathname);
        setActiveView('feed');
      } else {
        alert("Status update failed. Invalid token or report ID.");
      }
    }
  }, [refreshData]);

  const navigateTo = (view: View) => {
    const protectedViews: View[] = ['feed', 'report', 'analytics', 'ar', 'authority', 'history', 'impact', 'heatmap'];
    
    if (!user && protectedViews.includes(view)) {
      setActiveView('auth');
      return;
    }

    if (activeView !== view) {
      setNavHistory(prev => [...prev, view]);
    }

    setActiveView(view);
    if (view === 'feed' || view === 'history' || view === 'impact') refreshData();
  };

  const handleBack = () => {
    if (navHistory.length > 1) {
      const newHistory = [...navHistory];
      newHistory.pop();
      const prevView = newHistory[newHistory.length - 1];
      setNavHistory(newHistory);
      setActiveView(prevView);
    } else {
      setActiveView('home');
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 15000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const handleStatusUpdate = (id: string, status: IssueStatus) => {
    updateStatus(id, status);
    refreshData();
  };

  const handleAuthSuccess = (u: UserProfile) => {
    setUser(u);
    setActiveView('home');
    refreshData();
  };

  const getTrustLabel = (score: number) => {
    if (score >= 71) return { text: 'Veteran', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    if (score >= 31) return { text: 'Verified', color: 'bg-blue-50 text-blue-600 border-blue-100' };
    return { text: 'Probation', color: 'bg-amber-50 text-amber-600 border-amber-100' };
  };

  const renderView = () => {
    if (activeView === 'auth' && !user) {
      return <AuthPage onAuthenticated={handleAuthSuccess} />;
    }

    switch (activeView) {
      case 'home': return <LandingPage onStartReport={() => navigateTo('report')} stats={stats} />;
      case 'feed': return <DashboardPage reports={reports} onUpdateStatus={handleStatusUpdate} onBack={handleBack} />;
      case 'report': return <ReportPage onSubmitted={() => { refreshData(); navigateTo('history'); }} />;
      case 'analytics': return <AnalyticsPage stats={stats} />;
      case 'heatmap': return <RiskHeatmapPage reports={reports} />;
      case 'ar': return <ARPage reports={reports} />;
      case 'authority': return <AuthorityPage />;
      case 'history': return <MyReportsPage reports={reports} user={user} onBack={handleBack} />;
      case 'impact': return <ImpactPage reports={reports} user={user} />;
      default: return <LandingPage onStartReport={() => navigateTo('report')} stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-900 pb-24">
      <header className="fixed top-0 w-full z-40 px-6 py-4 glass-card flex justify-between items-center border-b border-slate-100/50">
        <div className="flex items-center gap-3">
          {activeView !== 'home' && (
            <button 
              onClick={handleBack}
              className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 active:scale-90 transition-all border border-blue-100 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('home')}>
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-extrabold text-lg tracking-tighter hidden sm:block">CIVICWATCH <span className="text-blue-600 uppercase italic">Core</span></span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className={`hidden xs:flex items-center gap-2 px-3 py-1.5 rounded-xl border font-black text-[9px] uppercase tracking-widest transition-colors ${getTrustLabel(user.trustScore).color}`}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.9L9.03 9.069a1 1 0 00.939 0L16.833 4.9A2 2 0 0015 2H4a2 2 0 00-1.834 2.9zM18 8.162l-6.737 4.043a3 3 0 01-2.526 0L2 8.162V14a2 2 0 002 2h12a2 2 0 002-2V8.162z" clipRule="evenodd" />
                </svg>
                {getTrustLabel(user.trustScore).text} ({user.trustScore})
              </div>

              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-900 leading-none mb-0.5">{user.displayName}</p>
                <p className="text-[8px] font-bold text-blue-600 uppercase tracking-widest">{user.role}</p>
              </div>
              <button 
                onClick={logout}
                className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all border border-slate-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigateTo('auth')}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all hover:bg-blue-700"
            >
              Verify Identity
            </button>
          )}
        </div>
      </header>

      <main className="pt-24 md:pt-28 max-w-lg mx-auto md:max-w-4xl px-4">
        {renderView()}
      </main>

      <BottomNav activeView={activeView} onViewChange={navigateTo} userRole={user?.role} />
    </div>
  );
};

export default App;
