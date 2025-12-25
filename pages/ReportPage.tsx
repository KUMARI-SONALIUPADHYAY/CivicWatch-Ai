
import React, { useState, useRef, useEffect } from 'react';
import { analyzeRoadIssue } from '../services/geminiService';
import { saveReport } from '../services/mockDatabase';
import { executeCompleteBackendFlow } from '../services/emailService';
import { Report, IssueStatus, Location } from '../types';
import { getCurrentUser } from '../services/authService';

interface ReportPageProps {
  onSubmitted: () => void;
}

const ReportPage: React.FC<ReportPageProps> = ({ onSubmitted }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = getCurrentUser();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      );
    }
  }, []);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!mediaPreview) return;
    if (!description.trim()) {
      setError("Please provide a brief description of the issue.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      setCurrentStep('AI Vision Analysis...');
      const analysis = await analyzeRoadIssue(mediaPreview);
      
      if (!analysis.isValidIssue) {
        setError(analysis.rejectionReason || "AI failed to verify a road hazard.");
        setIsProcessing(false);
        return;
      }

      const now = Date.now();
      const newReport: Report = {
        id: crypto.randomUUID(),
        timestamp: now,
        createdAt: now, // Critical for schema alignment
        image: mediaPreview,
        city: 'Bhilai',
        description: description,
        location: location || { lat: 0, lng: 0 },
        analysis,
        status: IssueStatus.REPORTED,
        reportedBy: user?.uid || "Anonymous",
        synced: true,
        mediaType: 'image',
        emailSent: false
      };

      saveReport(newReport);
      setCurrentStep('Dispatching to Authority...');
      await executeCompleteBackendFlow(newReport);

      onSubmitted();
    } catch (err) {
      console.error(err);
      setError("Critical backend pipeline failure. Please retry.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom duration-500 max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Report Hazard</h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Autonomous Civic Dispatch</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3 animate-bounce">
          <p className="text-xs font-bold text-red-900">{error}</p>
        </div>
      )}

      <div 
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative h-[380px] w-full rounded-[40px] overflow-hidden border-4 border-dashed transition-all flex items-center justify-center cursor-pointer shadow-xl ${
          mediaPreview ? 'border-transparent ring-4 ring-blue-500/20' : 'border-slate-200 bg-white hover:border-blue-50'
        }`}
      >
        {mediaPreview ? (
          <>
            <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
            {isProcessing && (
              <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center text-white">
                <div className="scanning-line absolute w-full top-0"></div>
                <div className="w-12 h-12 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <h4 className="font-black text-lg uppercase tracking-widest">{currentStep}</h4>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-10">
            <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-100">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <p className="text-slate-900 font-black">Upload Evidence</p>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Issue Description</label>
        <textarea
          disabled={isProcessing}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-6 py-5 rounded-[28px] bg-white border border-slate-100 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none resize-none shadow-sm min-h-[120px]"
          placeholder="What happened? Briefly explain the issue..."
        ></textarea>

        <button
          onClick={handleSubmit}
          disabled={!mediaPreview || isProcessing}
          className={`w-full py-6 rounded-[28px] font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
            !mediaPreview || isProcessing ? 'bg-slate-100 text-slate-300' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'
          }`}
        >
          {isProcessing ? 'Processing Pipeline...' : 'Initiate Safety Audit'}
        </button>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleCapture} />
    </div>
  );
};

export default ReportPage;
