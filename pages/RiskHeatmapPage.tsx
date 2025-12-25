
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Report, IssueCategory, IssueStatus } from '../types';

interface RiskHeatmapPageProps {
  reports: Report[];
}

type CategoryFilter = 'ALL' | IssueCategory;
type TimeFilter = 'TODAY' | '7DAYS' | '30DAYS' | 'ALL_TIME';
type MapTheme = 'light' | 'dark';

const RiskHeatmapPage: React.FC<RiskHeatmapPageProps> = ({ reports }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  
  const [filter, setFilter] = useState<CategoryFilter>('ALL');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('ALL_TIME');
  const [mapTheme, setMapTheme] = useState<MapTheme>(() => 
    (localStorage.getItem('civic_map_theme') as MapTheme) || 'light'
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(13);

  // Persistence
  useEffect(() => {
    localStorage.setItem('civic_map_theme', mapTheme);
  }, [mapTheme]);

  // Filtered reports based on category and time window
  const filteredReports = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    return reports.filter(r => {
      // Category Match
      const categoryMatch = filter === 'ALL' ? true : r.analysis?.category === filter;
      
      // Time Match
      let timeMatch = true;
      if (timeFilter === 'TODAY') timeMatch = (now - r.createdAt) <= dayMs;
      else if (timeFilter === '7DAYS') timeMatch = (now - r.createdAt) <= (7 * dayMs);
      else if (timeFilter === '30DAYS') timeMatch = (now - r.createdAt) <= (30 * dayMs);
      
      return categoryMatch && timeMatch;
    });
  }, [reports, filter, timeFilter]);

  const stats = useMemo(() => {
    const total = filteredReports.length;
    const critical = filteredReports.filter(r => r.analysis?.severity === 'CRITICAL').length;
    return { total, critical };
  }, [filteredReports]);

  // Group reports by proximity to simulate a "cluster" or "density" node
  const densityNodes = useMemo(() => {
    const clusters: { [key: string]: { 
      lat: number; 
      lng: number; 
      count: number; 
      maxSeverity: string; 
      reports: Report[] 
    } } = {};

    filteredReports.forEach(r => {
      const key = `${r.location.lat.toFixed(3)}_${r.location.lng.toFixed(3)}`;
      if (!clusters[key]) {
        clusters[key] = { lat: r.location.lat, lng: r.location.lng, count: 0, maxSeverity: 'LOW', reports: [] };
      }
      clusters[key].count++;
      clusters[key].reports.push(r);
      
      const sevOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      const currentSev = r.analysis?.severity || 'LOW';
      if (sevOrder[currentSev as keyof typeof sevOrder] > sevOrder[clusters[key].maxSeverity as keyof typeof sevOrder]) {
        clusters[key].maxSeverity = currentSev;
      }
    });

    return Object.values(clusters);
  }, [filteredReports]);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const L = (window as any).L;
    if (!L) return;

    const center: [number, number] = reports.length > 0 
      ? [reports[0].location.lat, reports[0].location.lng] 
      : [21.1926, 81.3119];

    leafletMap.current = L.map(mapRef.current, {
      center: center,
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    const tileUrl = mapTheme === 'light' 
      ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 20
    }).addTo(leafletMap.current);

    leafletMap.current.on('zoomend', () => {
      setZoomLevel(leafletMap.current.getZoom());
    });

    setIsLoaded(true);

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Update Tile Layer URL on theme change
  useEffect(() => {
    if (tileLayerRef.current) {
      const tileUrl = mapTheme === 'light' 
        ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      tileLayerRef.current.setUrl(tileUrl);
    }
  }, [mapTheme]);

  // Render Heatmap Nodes
  useEffect(() => {
    if (!leafletMap.current) return;
    const L = (window as any).L;
    const map = leafletMap.current;

    map.eachLayer((layer: any) => {
      if (layer instanceof L.Circle || layer instanceof L.Marker || layer instanceof L.LayerGroup) {
        map.removeLayer(layer);
      }
    });

    const baseRadius = Math.max(10, (20 - zoomLevel) * 15);

    densityNodes.forEach(node => {
      let color = '#34C759'; 
      if (node.maxSeverity === 'CRITICAL') color = '#FF3B30'; 
      else if (node.maxSeverity === 'HIGH' || node.maxSeverity === 'MEDIUM') color = '#FF9500'; 

      L.circle([node.lat, node.lng], {
        radius: baseRadius * (1 + node.count * 0.2),
        fillColor: color,
        fillOpacity: mapTheme === 'light' ? 0.25 : 0.15,
        color: 'transparent',
        className: 'heatmap-node-glow'
      }).addTo(map);

      const core = L.circle([node.lat, node.lng], {
        radius: Math.max(5, 15 - (zoomLevel - 13) * 2),
        fillColor: color,
        fillOpacity: 0.9,
        color: '#fff',
        weight: 2,
        className: node.maxSeverity === 'CRITICAL' ? 'heatmap-pulse-critical' : ''
      }).addTo(map);

      core.bindTooltip(`
        <div class="p-3 min-w-[140px] bg-white rounded-2xl shadow-xl border border-slate-100">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Zone Scan</span>
            <span class="text-[9px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-600">${node.count} Reports</span>
          </div>
          <p class="text-[10px] font-bold text-slate-500 mb-1">Peak Severity:</p>
          <p class="text-sm font-black tracking-tight ${
            node.maxSeverity === 'CRITICAL' ? 'text-red-600' : 'text-orange-500'
          }">${node.maxSeverity}</p>
        </div>
      `, {
        direction: 'top',
        className: 'custom-heatmap-tooltip',
        permanent: false,
        sticky: true
      });
    });

    if (densityNodes.length > 0 && (filter !== 'ALL' || timeFilter !== 'ALL_TIME')) {
      const group = new L.featureGroup(densityNodes.map(n => L.marker([n.lat, n.lng])));
      map.fitBounds(group.getBounds().pad(0.3));
    }
  }, [densityNodes, isLoaded, zoomLevel, filter, timeFilter, mapTheme]);

  const getTimeLabel = () => {
    switch(timeFilter) {
      case 'TODAY': return 'Last 24h';
      case '7DAYS': return 'Last 7 Days';
      case '30DAYS': return 'Last 30 Days';
      default: return 'All Time';
    }
  };

  const getCategoryLabel = () => {
    if (filter === 'ALL') return 'All Incidents';
    return filter.charAt(0) + filter.slice(1).toLowerCase().replace('_', ' ');
  };

  return (
    <div className="animate-in fade-in duration-700 h-[calc(100vh-180px)] relative">
      <style>{`
        .heatmap-node-glow {
          filter: blur(25px);
          mix-blend-mode: ${mapTheme === 'light' ? 'multiply' : 'screen'};
        }
        .heatmap-pulse-critical {
          animation: criticalPulse 2s infinite;
        }
        @keyframes criticalPulse {
          0% { stroke-width: 2; stroke-opacity: 1; }
          50% { stroke-width: 10; stroke-opacity: 0.2; }
          100% { stroke-width: 2; stroke-opacity: 1; }
        }
        .custom-heatmap-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .custom-heatmap-tooltip::before { display: none !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header & Filter Indicator */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Risk Command</h2>
            <div className="bg-blue-600/10 px-3 py-1 rounded-full border border-blue-600/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest whitespace-nowrap">
                Filtered: {getCategoryLabel()} • {getTimeLabel()}
              </span>
            </div>
          </div>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Neural Infrastructure Density Matrix</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 text-center">
              <span className="block text-[8px] font-black text-slate-400 uppercase">Filtered Events</span>
              <span className="text-sm font-black text-slate-900">{stats.total}</span>
           </div>
           <div className="bg-red-50 px-4 py-2 rounded-2xl shadow-sm border border-red-100 text-center">
              <span className="block text-[8px] font-black text-red-400 uppercase">High Risk</span>
              <span className="text-sm font-black text-red-600">{stats.critical}</span>
           </div>
        </div>
      </div>

      {/* Control Panel: Filters */}
      <div className="space-y-4 mb-6 px-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All Incidents', color: 'bg-slate-900' },
            { id: IssueCategory.POTHOLE, label: 'Potholes', color: 'bg-blue-600' },
            { id: IssueCategory.ACCIDENT, label: 'Accidents', color: 'bg-red-600' },
            { id: IssueCategory.WATERLOGGING, label: 'Waterlogging', color: 'bg-cyan-600' },
            { id: IssueCategory.CRACK, label: 'Road Damage', color: 'bg-amber-600' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilter(chip.id as CategoryFilter)}
              className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 border ${
                filter === chip.id 
                  ? `${chip.color} text-white shadow-xl scale-105 border-transparent` 
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
          {[
            { id: 'TODAY', label: 'Today' },
            { id: '7DAYS', label: '7 Days' },
            { id: '30DAYS', label: '30 Days' },
            { id: 'ALL_TIME', label: 'All Time' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeFilter(t.id as TimeFilter)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                timeFilter === t.id 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-full rounded-[45px] overflow-hidden border-4 border-white shadow-2xl">
        {!isLoaded && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-100 text-slate-900 p-8">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Booting GIS Engine...</p>
          </div>
        )}
        
        <div ref={mapRef} className="w-full h-full z-10" />
        
        {/* Theme Toggle - Top Right */}
        <div className="absolute top-6 right-6 z-20 flex bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 p-1 shadow-xl">
          <button 
            onClick={() => setMapTheme('light')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              mapTheme === 'light' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
            Light
          </button>
          <button 
            onClick={() => setMapTheme('dark')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              mapTheme === 'dark' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            Dark
          </button>
        </div>
        
        {/* Heatmap Legend */}
        <div className={`absolute bottom-10 left-10 p-6 rounded-[35px] border backdrop-blur-xl max-w-[220px] shadow-2xl z-20 transition-colors duration-500 ${
          mapTheme === 'light' 
            ? 'bg-white/80 border-slate-200 text-slate-900' 
            : 'bg-black/60 border-white/10 text-white'
        }`}>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-blue-500 underline underline-offset-8">Risk Heat Signature</h4>
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-[#FF3B30] shadow-[0_0_15px_#FF3B30]"></div>
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black uppercase leading-none ${mapTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>Critical Hazard</span>
                  <span className={`text-[7px] font-bold uppercase ${mapTheme === 'light' ? 'text-slate-400' : 'text-white/40'}`}>High Intensity Nodes</span>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-[#FF9500] shadow-[0_0_10px_#FF9500]"></div>
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black uppercase leading-none ${mapTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>Moderate Risk</span>
                  <span className={`text-[7px] font-bold uppercase ${mapTheme === 'light' ? 'text-slate-400' : 'text-white/40'}`}>Medium Density Zone</span>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-[#34C759] shadow-[0_0_8px_#34C759]"></div>
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black uppercase leading-none ${mapTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>Low Activity</span>
                  <span className={`text-[7px] font-bold uppercase ${mapTheme === 'light' ? 'text-slate-400' : 'text-white/40'}`}>Safe Verified Zone</span>
                </div>
             </div>
          </div>
          <div className={`mt-6 pt-4 border-t ${mapTheme === 'light' ? 'border-slate-100' : 'border-white/10'}`}>
             <p className={`text-[8px] font-black leading-tight uppercase italic ${mapTheme === 'light' ? 'text-slate-400' : 'text-white/60'}`}>
               * Color intensity derived from local hazard density and AI-calculated severity metrics.
             </p>
          </div>
        </div>

        {/* Scanline Effect */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20 opacity-10">
          <div className="w-full h-[1px] bg-blue-500/40 shadow-[0_0_20px_#3b82f6] animate-[scan_6s_linear_infinite]"></div>
        </div>
      </div>
    </div>
  );
};

export default RiskHeatmapPage;
