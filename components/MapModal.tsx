
import React, { useEffect, useRef } from 'react';
import { Location } from '../types';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
  category: string;
}

const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, location, category }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);

  useEffect(() => {
    if (isOpen && location && mapContainerRef.current) {
      const L = (window as any).L;
      if (!L) return;

      // Small delay to ensure modal transition finishes
      const timer = setTimeout(() => {
        if (leafletMap.current) leafletMap.current.remove();

        leafletMap.current = L.map(mapContainerRef.current, {
          center: [location.lat, location.lng],
          zoom: 18,
          zoomControl: false
        });

        // Use high-res Satellite/Hybrid tiles from Esri (Open Source Alternative)
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }).addTo(leafletMap.current);

        // Add a technical hazard marker
        const hazardIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="w-8 h-8 bg-red-600 rounded-full border-4 border-white shadow-xl animate-pulse"></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        L.marker([location.lat, location.lng], { icon: hazardIcon }).addTo(leafletMap.current);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, location]);

  const openGoogleMaps = () => {
    if (!location) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen || !location) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/95 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-white/10 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-blue-600 px-8 py-6 flex justify-between items-center shadow-lg relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">Site Audit Mode</span>
            </div>
            <h3 className="text-white text-xl font-black tracking-tight leading-none">
              {category.replace('_', ' ')} Hazard Location
            </h3>
          </div>
          
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all group active:scale-90"
            title="Return to CivicWatch AI"
          >
            <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Map Frame */}
        <div className="flex-grow bg-[#0f172a] relative">
           <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
           <div className="absolute inset-0 pointer-events-none border-[20px] border-white/5 z-20"></div>
           
           {/* External Navigation Toggle */}
           <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2">
              <button 
                onClick={openGoogleMaps}
                className="bg-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-100 hover:bg-slate-50 transition-all active:scale-95 group pointer-events-auto"
              >
                <img src="https://www.gstatic.com/images/branding/product/1x/maps_64dp.png" alt="Google Maps" className="w-5 h-5" />
                <span className="text-[11px] font-black uppercase text-slate-800 tracking-widest">Open in Google Maps</span>
                <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
           </div>
        </div>

        {/* Footer Info */}
        <div className="bg-white px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
             <div className="bg-slate-100 px-4 py-2 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Coordinates</p>
                <p className="text-xs font-black text-slate-900">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
             </div>
             <p className="text-[10px] font-bold text-slate-400 italic max-w-xs md:max-w-none">
               Internal GIS viewer active. Use the HUD button to launch Google Maps for real-time navigation.
             </p>
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-2 group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 19l-7-7 7-7" />
            </svg>
            Return to CivicWatch AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
