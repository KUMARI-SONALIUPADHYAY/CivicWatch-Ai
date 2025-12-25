
import React, { useState, useRef } from 'react';
import { analyzeRoadIssue } from '../services/geminiService';
import { saveReport } from '../services/mockDatabase';
import { Report, IssueStatus, Location } from '../types';

interface ReportFormProps {
  onReportSubmitted: () => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ onReportSubmitted }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  // Fix: Added missing const to initialize the ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => setLocation({ lat: 34.0522, lng: -118.2437 }) // Fallback LA
        );
      }
    }
  };

  const handleSubmit = async () => {
    if (!preview) return;

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeRoadIssue(preview);
      const now = Date.now();
      // Fix: Added missing properties 'createdAt', 'description', 'emailSent' and 'city' to satisfy the Report type requirements
      const newReport: Report = {
        id: crypto.randomUUID(),
        timestamp: now,
        createdAt: now,
        image: preview,
        city: 'Bhilai',
        description: "Automatic hazard report via quick capture.",
        location: location || { lat: 0, lng: 0 },
        analysis,
        status: IssueStatus.REPORTED,
        reportedBy: "Public User",
        synced: true,
        mediaType: 'image',
        emailSent: false
      };

      saveReport(newReport);
      setPreview(null);
      onReportSubmitted();
      alert("Report submitted successfully! The AI has categorized this and notified city officials.");
    } catch (error) {
      console.error(error);
      alert("AI Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Report an Issue</h2>
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`relative h-64 border-2 border-dashed rounded-xl flex flex-items-center justify-center cursor-pointer transition-all ${preview ? 'border-transparent' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'}`}
      >
        {preview ? (
          <img src={preview} alt="Capture preview" className="h-full w-full object-cover rounded-xl" />
        ) : (
          <div className="text-center p-6 mt-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-slate-600 font-medium">Click to capture or upload photo</p>
            <p className="text-slate-400 text-sm">AI will auto-analyze the hazard</p>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          capture="environment"
          onChange={handleCapture}
        />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {location && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!preview || isAnalyzing}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
            !preview || isAnalyzing ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700'
          } flex items-center justify-center gap-2`}
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              AI is Analyzing Infrastructure...
            </>
          ) : (
            'Analyze & Submit Report'
          )}
        </button>
      </div>
    </div>
  );
};

export default ReportForm;
