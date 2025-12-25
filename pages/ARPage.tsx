
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Report, IssueStatus } from '../types';

interface ARPageProps {
  reports: Report[];
}

interface ARMarker {
  id: string;
  distance: number;
  bearing: number;
  report: Report;
}

type DriveMode = 'CAR' | 'BIKER';

const ARPage: React.FC<ARPageProps> = ({ reports }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [driveMode, setDriveMode] = useState<DriveMode>('CAR');
  const [activeMarkers, setActiveMarkers] = useState<ARMarker[]>([]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // in metres
  };

  useEffect(() => {
    async function setupAR() {
      // 1. Camera setup
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);
        }
      } catch (err) {
        console.error("Camera access denied", err);
      }

      // 2. Geolocation Watcher
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition((pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }, (err) => console.warn(err), { enableHighAccuracy: true });
        
        return () => navigator.geolocation.clearWatch(watchId);
      }
    }
    setupAR();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Filter and process markers based on proximity (within 1km)
  useEffect(() => {
    if (!userCoords) return;
    
    const near = reports
      .filter(r => r.status !== IssueStatus.RESOLVED && r.analysis?.isValidIssue)
      .map(r => {
        const dist = calculateDistance(userCoords.lat, userCoords.lng, r.location.lat, r.location.lng);
        return {
          id: r.id,
          distance: dist,
          bearing: Math.random() * 360, // Simplified bearing simulation for web AR
          report: r
        };
      })
      .filter(m => m.distance < 1000)
      .sort((a, b) => a.distance - b.distance);

    setActiveMarkers(near);
  }, [userCoords, reports]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-400';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden font-mono select-none">
      {/* 1. Immersive Camera Feed */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className={`w-full h-full object-cover transition-opacity duration-1000 ${hasCamera ? 'opacity-70' : 'opacity-0'}`}
      />
      
      {/* 2. HUD Scanline & Grid Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
      
      {/* 3. AR Spatial Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {activeMarkers.map((marker, idx) => (
          <div 
            key={marker.id}
            className="absolute transition-all duration-500 animate-in zoom-in-50"
            style={{
              transform: `translate(${(idx % 2 === 0 ? 1 : -1) * (idx + 1) * 40}px, ${-idx * 20}px) scale(${Math.max(0.5, 1 - marker.distance/1000)})`,
              opacity: 1 - (marker.distance / 1000)
            }}
          >
            <div className={`p-4 rounded-[20px] backdrop-blur-xl border-2 border-white/20 shadow-2xl ${getSeverityColor(marker.report.analysis?.severity || 'LOW')} text-white min-w-[180px]`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">{marker.report.analysis?.category}</span>
              </div>
              <p className="text-xl font-black italic">{Math.round(marker.distance)}m</p>
              <div className="h-0.5 w-full bg-white/20 my-2"></div>
              <p className="text-[8px] font-bold uppercase leading-tight opacity-90">{marker.report.analysis?.description.substring(0, 40)}...</p>
            </div>
            {/* Visual Pointer */}
            <div className="w-0.5 h-16 bg-gradient-to-t from-white to-transparent mx-auto"></div>
            <div className="w-4 h-4 rounded-full border-2 border-white/50 mx-auto -mt-2 animate-ping"></div>
          </div>
        ))}

        {/* Reticle */}
        <div className={`relative w-64 h-64 border-2 rounded-full flex items-center justify-center transition-all duration-700 ${activeMarkers.length > 0 ? 'border-red-500/30 scale-110' : 'border-blue-500/30'}`}>
          <div className="absolute inset-0 border-t-4 border-blue-400 rounded-full animate-spin duration-[10s]"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          {/* Compass degree markings */}
          {[0, 90, 180, 270].map(deg => (
            <div key={deg} className="absolute text-[8px] font-black text-white/20" style={{ transform: `rotate(${deg}deg) translateY(-110px)` }}>
              {deg === 0 ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : 'W'}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Dashboard HUD Overlay */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
        {/* Top Section */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="bg-black/80 backdrop-blur-md p-4 rounded-3xl border border-white/10 pointer-events-auto">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">Vision Core v2.5</span>
              </div>
              <h1 className="text-white text-xl font-black tracking-tighter">
                {activeMarkers.length > 0 ? `${activeMarkers.length} HAZARDS` : 'CLEAR PATH'}
              </h1>
            </div>
            
            {/* Proximity Warning Alert */}
            {activeMarkers.some(m => m.distance < 100) && (
              <div className="bg-red-600 p-4 rounded-3xl animate-bounce flex items-center gap-3 shadow-2xl shadow-red-600/50">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-white">
                  <p className="text-[10px] font-black uppercase leading-none">IMMEDIATE RISK</p>
                  <p className="text-sm font-black tracking-tight">BRAKE ALERT</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 items-end pointer-events-auto">
            {/* Mode Toggle Buttons */}
            <div className="bg-black/80 backdrop-blur p-1 rounded-2xl border border-white/10 flex">
              <button 
                onClick={() => setDriveMode('CAR')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${driveMode === 'CAR' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
              >
                Car
              </button>
              <button 
                onClick={() => setDriveMode('BIKER')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${driveMode === 'BIKER' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
              >
                Biker
              </button>
            </div>
            <div className="bg-green-600/20 backdrop-blur px-4 py-2 rounded-full border border-green-500/30">
               <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">GPS LOCKED</span>
            </div>
          </div>
        </div>

        {/* Bottom Section - Telemetry */}
        <div className="flex flex-col gap-4">
           {/* Drive Assist HUD - Optimized for Mode */}
           <div className={`grid gap-4 ${driveMode === 'CAR' ? 'grid-cols-3' : 'grid-cols-1 max-w-[150px]'}`}>
              <div className="bg-black/80 backdrop-blur-xl p-5 rounded-[30px] border border-white/10 text-center">
                <p className="text-white/40 text-[8px] font-black uppercase mb-1">Impact Vel.</p>
                <p className="text-white text-2xl font-black italic">00<span className="text-blue-500">.0</span></p>
                <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">KM/H</p>
              </div>
              {driveMode === 'CAR' && (
                <>
                  <div className="bg-black/80 backdrop-blur-xl p-5 rounded-[30px] border border-white/10 text-center">
                    <p className="text-white/40 text-[8px] font-black uppercase mb-1">Local Index</p>
                    <p className="text-white text-2xl font-black italic">8.2</p>
                    <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">SAFETY</p>
                  </div>
                  <div className="bg-black/80 backdrop-blur-xl p-5 rounded-[30px] border border-white/10 text-center">
                    <p className="text-white/40 text-[8px] font-black uppercase mb-1">Reports</p>
                    <p className="text-white text-2xl font-black italic">{activeMarkers.length}</p>
                    <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">ACTIVE</p>
                  </div>
                </>
              )}
           </div>

           <div className="bg-blue-600 text-white py-4 px-6 rounded-[30px] flex justify-between items-center pointer-events-auto">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest">Safe Route Activated</p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-white/20 transition-all"
              >
                Recalibrate
              </button>
           </div>
        </div>
      </div>

      {/* Permissions Check */}
      {!hasCamera && (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-slate-900 z-[100]">
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-blue-600 rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/30">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-white font-black text-2xl mb-4 tracking-tight">AR Vision Requires Camera</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto mb-8">
              To overlay safety markers on the real world, CivicWatch requires environmental camera permissions.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-5 bg-white text-slate-900 rounded-[20px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl"
            >
              Grant Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARPage;
