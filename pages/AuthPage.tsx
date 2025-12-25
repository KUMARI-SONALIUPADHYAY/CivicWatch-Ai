
import React, { useState } from 'react';
import { login, signup, resetPassword } from '../services/authService';
import { UserRole, UserProfile } from '../types';

interface AuthPageProps {
  onAuthenticated: (user: UserProfile) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CITIZEN);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [resetSent, setResetSent] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = isLogin 
        ? await login(email, password) 
        : await signup(email, password, role);
      
      setSuccess(true);
      setTimeout(() => onAuthenticated(user), 1000);
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your identifier first to receive a recovery link.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await resetPassword(email);
      setResetSent(true);
      // Clear success message after 5 seconds
      setTimeout(() => setResetSent(false), 5000);
    } catch (err: any) {
      setError(err.message || "Recovery flow failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className={`w-20 h-20 rounded-[30px] flex items-center justify-center mx-auto mb-6 shadow-2xl transition-all duration-500 ${success || resetSent ? 'bg-green-500 shadow-green-200' : 'bg-blue-600 shadow-blue-200'}`}>
            {success || resetSent ? (
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">
            {resetSent ? 'Recovery Initiated' : (success ? 'Identity Verified' : (isLogin ? 'Access Portal' : 'Citizen Registry'))}
          </h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">
            CivicWatch Security Engine v3.0
          </p>
        </div>

        <div className="bg-white p-8 rounded-[45px] shadow-2xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden">
          {(success || (resetSent && isLoading)) && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center"></div>}
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-0">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-bounce">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-xs font-bold text-red-900 leading-snug">{error}</p>
              </div>
            )}

            {resetSent && (
              <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs font-bold text-green-900 leading-snug">A secure recovery link has been dispatched to your verified email address.</p>
              </div>
            )}

            <div className="space-y-5">
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block group-focus-within:text-blue-600 transition-colors">Credential Identifier</label>
                <div className="relative">
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-6 py-5 rounded-3xl bg-slate-50 border border-slate-100 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    placeholder="name@civic.gov"
                  />
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>

              {isLogin && (
                <div className="flex justify-end pr-4 -mt-2">
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                  >
                    Forgot Access Token?
                  </button>
                </div>
              )}

              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block group-focus-within:text-blue-600 transition-colors">Access Token</label>
                <div className="relative">
                  <input 
                    type="password" 
                    required={!resetSent}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-6 py-5 rounded-3xl bg-slate-50 border border-slate-100 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    placeholder="••••••••"
                  />
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
              </div>

              {!isLogin && (
                <div className="pt-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-4 block text-center">Authorization Level</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setRole(UserRole.CITIZEN)}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        role === UserRole.CITIZEN ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      Citizen
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRole(UserRole.AUTHORITY)}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        role === UserRole.AUTHORITY ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      Authority
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              disabled={isLoading || success}
              className={`w-full py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${
                success ? 'bg-green-500 text-white' : (isLoading ? 'bg-slate-100 text-slate-300' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700')
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                success ? 'Redirecting...' : (isLogin ? 'Verify Identity' : 'Establish Record')
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setResetSent(false);
                setError(null);
              }}
              disabled={isLoading || success}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors"
            >
              {isLogin ? "Need a credential? Establish Record" : "Already registered? Verify Identity"}
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-center text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em]">
            Civil-Encrypted Layer 2.0 • Session Secured
          </p>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center grayscale hover:grayscale-0 cursor-pointer transition-all">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.21 5.39-7.84 5.39-4.84 0-8.79-4.01-8.79-8.92s3.95-8.92 8.79-8.92c2.75 0 4.59 1.14 5.64 2.14l2.58-2.49c-1.66-1.55-3.82-2.5-8.22-2.5-6.13 0-11.11 4.98-11.11 11.11s4.98 11.11 11.11 11.11c6.4 0 10.65-4.5 10.65-10.83 0-.73-.08-1.28-.18-1.83h-10.47z"/></svg>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center grayscale hover:grayscale-0 cursor-pointer transition-all">
              <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
