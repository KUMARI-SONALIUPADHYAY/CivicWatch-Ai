
import React, { useState, useRef } from 'react';
import { Report, IssueStatus } from '../types';
import { reInspectHazard } from '../services/geminiService';
import { saveReInspectionResult } from '../services/mockDatabase';
import { getCurrentUser } from '../services/authService';

interface AIReInspectionProps {
  report: Report;
  onComplete: () => void;
}

const AIReInspection: React.FC<AIReInspectionProps> = ({ report, onComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = getCurrentUser();

  if (!user || report.status === IssueStatus.RESOLVED || report.status === IssueStatus.REJECTED) return null;

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startReInspection = async () => {
    if (!preview) return;
    setIsProcessing(true);
    setStatusMessage('AI Comparing Evidence...');

    try {
      const result = await reInspectHazard(report.image, preview);
      
      if (result.isResolved) {
        setStatusMessage('Resolution Confirmed by AI!');
        saveReInspectionResult(report.id, preview, true, user.uid);
        setTimeout(onComplete, 1500);
      } else {
        setStatusMessage('Hazard Still Detected by AI Scan.');
        saveReInspectionResult(report.id, preview, false, user.uid);
        setTimeout(() => {
          setIsProcessing(false);
          setPreview(null);
        }, 2000);
      }
    } catch (error) {
      console.error(error);
      setStatusMessage('Analysis Failed. Retry.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-[35px] p-8 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h5 className="text-[11px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">AI Re-Inspection Engine</h5>
            <p className="text-sm font-bold text-white/80">Verify resolution via visual comparison</p>
          </div>
        </div>

        {preview ? (
          <div className="space-y-4">
            <div className="relative h-48 rounded-3xl overflow-hidden border-2 border-blue-500/30">
              <img src={preview} className="w-full h-full object-cover" alt="Re-inspection preview" />
              {isProcessing && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">{statusMessage}</p>
                </div>
              )}
            </div>
            
            {!isProcessing && (
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setPreview(null)}
                  className="py-4 bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                >
                  Discard
                </button>
                <button 
                  onClick={startReInspection}
                  className="py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
                >
                  Confirm Scan
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-6 border-2 border-dashed border-white/20 rounded-[30px] flex flex-col items-center gap-3 hover:bg-white/5 transition-all active:scale-[0.98]"
          >
            <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Upload Fixed Hazard Photo</span>
          </button>
        )}
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        capture="environment" 
        onChange={handleCapture} 
      />
      
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-[40px] pointer-events-none"></div>
    </div>
  );
};

export default AIReInspection;
