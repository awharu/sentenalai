import React, { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, ZoomIn, ZoomOut, Layers, Video, X, Maximize2, Thermometer } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { MapZone, CameraStream, SecurityAlert, HeatmapPoint } from '../types';
import { getZones, getStreamsByZone } from '../services/mapService';
import { getHeatmapData } from '../services/analyticsService';
import { StreamPlayer } from '../components/StreamPlayer';
import { DroneOverlay } from '../components/DroneOverlay';

export default function Geospatial() {
  const [zones, setZones] = useState<MapZone[]>([]);
  const [activeZone, setActiveZone] = useState<MapZone | null>(null);
  const [streams, setStreams] = useState<CameraStream[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedStream, setSelectedStream] = useState<CameraStream | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeZone) {
      loadStreams(activeZone.id);
      if (showHeatmap) {
          loadHeatmap(activeZone.id);
      }
    }
  }, [activeZone]);

  useEffect(() => {
      if (showHeatmap && activeZone) {
          loadHeatmap(activeZone.id);
      }
  }, [showHeatmap]);

  // Draw Heatmap
  useEffect(() => {
      if (!canvasRef.current || !showHeatmap || heatmapData.length === 0) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear previous
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw points
      heatmapData.forEach(point => {
          const x = (point.x / 100) * canvas.width;
          const y = (point.y / 100) * canvas.height;
          const radius = 60; 

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          gradient.addColorStop(0, `rgba(255, 0, 0, ${point.intensity * 0.6})`);
          gradient.addColorStop(0.5, `rgba(255, 165, 0, ${point.intensity * 0.3})`);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
      });

  }, [heatmapData, showHeatmap, zoomLevel]);

  const loadInitialData = async () => {
    const zonesData = await getZones();
    setZones(zonesData);
    if (zonesData.length > 0) setActiveZone(zonesData[0]);
  };

  const loadStreams = async (zoneId: string) => {
    const streamsData = await getStreamsByZone(zoneId);
    setStreams(streamsData);
  };

  const loadHeatmap = async (zoneId: string) => {
      const data = await getHeatmapData(zoneId);
      setHeatmapData(data);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(Math.max(prev + delta, 1), 3));
  };

  const handleAlert = (alert: SecurityAlert) => {
    console.log("Alert from map view:", alert);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <PageHeader 
        title="Geospatial View"
        description="Interactive camera map and zone management."
        icon={MapIcon}
        actions={
          <div className="flex gap-4">
            <button 
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${showHeatmap ? 'bg-orange-900/50 border-orange-500 text-orange-200' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
            >
                <Thermometer size={16} />
                <span className="text-sm font-medium">Density Heatmap</span>
            </button>

            <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                <Layers size={16} className="text-slate-500 ml-2" />
                <select 
                    className="bg-transparent text-white text-sm font-medium focus:outline-none border-none pr-8 py-1"
                    value={activeZone?.id || ''}
                    onChange={(e) => {
                        const zone = zones.find(z => z.id === e.target.value);
                        if (zone) setActiveZone(zone);
                    }}
                >
                    {zones.map(z => (
                        <option key={z.id} value={z.id} className="bg-slate-900">{z.name}</option>
                    ))}
                </select>
            </div>
        </div>
        }
      />

      {/* Map Container */}
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative shadow-2xl group">
          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-slate-900/90 backdrop-blur-sm p-2 rounded-lg border border-slate-700 shadow-lg">
              <button onClick={() => handleZoom(0.2)} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors" title="Zoom In">
                  <ZoomIn size={20} />
              </button>
              <div className="h-px bg-slate-700 w-full"></div>
              <button onClick={() => handleZoom(-0.2)} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors" title="Zoom Out">
                  <ZoomOut size={20} />
              </button>
              <div className="h-px bg-slate-700 w-full"></div>
              <button onClick={() => setZoomLevel(1)} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors" title="Reset">
                  <Maximize2 size={20} />
              </button>
          </div>

          {/* Map Surface */}
          <div className="w-full h-full overflow-hidden relative bg-[#0a0a0a]">
               {/* Grid Pattern Background */}
               <div 
                  className="absolute inset-0 opacity-20 pointer-events-none" 
                  style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}
               />
               
               {activeZone && (
                   <div 
                        className="w-full h-full relative transition-transform duration-300 ease-out origin-center"
                        style={{ transform: `scale(${zoomLevel})` }}
                   >
                       <DroneOverlay activeZone={activeZone} />

                       {/* Map Image */}
                       <div className="absolute inset-4 md:inset-12 border-2 border-slate-800/50 rounded-lg overflow-hidden bg-slate-900">
                           <img 
                                src={activeZone.imageUrl} 
                                alt="Map" 
                                className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-700"
                           />
                           
                           {/* Heatmap Canvas Layer */}
                           {showHeatmap && (
                               <canvas 
                                    ref={canvasRef}
                                    width={1600} 
                                    height={900}
                                    className="absolute inset-0 w-full h-full pointer-events-none opacity-70 mix-blend-screen animate-in fade-in duration-500"
                               />
                           )}
                       </div>

                       {/* Camera Markers */}
                       {!showHeatmap && streams.map(stream => (
                           <div 
                                key={stream.id}
                                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group/marker z-10"
                                style={{ 
                                    left: `${stream.coordinates?.x || 50}%`, 
                                    top: `${stream.coordinates?.y || 50}%` 
                                }}
                                onClick={() => setSelectedStream(stream)}
                           >
                               {/* Pulse Effect */}
                               {stream.status === 'online' && (
                                   <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                               )}
                               
                               {/* Marker Icon */}
                               <div className={`relative w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 transition-transform hover:scale-110 ${
                                   stream.status === 'online' 
                                     ? 'bg-slate-900 border-green-500 text-green-500' 
                                     : 'bg-slate-900 border-red-500 text-red-500'
                               }`}>
                                   <Video size={14} fill="currentColor" />
                               </div>

                               {/* Tooltip */}
                               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg p-2 shadow-xl opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none scale-95 group-hover/marker:scale-100 origin-bottom">
                                   <div className="relative aspect-video bg-black rounded overflow-hidden mb-1">
                                       {stream.status === 'online' ? (
                                           <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                                <span className="text-[10px] text-slate-500">Live Preview</span>
                                           </div>
                                       ) : (
                                           <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-600 text-[10px]">Offline</div>
                                       )}
                                   </div>
                                   <p className="text-xs font-bold text-white truncate">{stream.name}</p>
                                   <p className="text-[10px] text-slate-400 truncate">{stream.location}</p>
                               </div>
                           </div>
                       ))}
                   </div>
               )}
          </div>
      </div>

      {/* Stream Modal */}
      {selectedStream && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedStream(null)} />
              <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                  <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950">
                      <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${selectedStream.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <div>
                              <h2 className="text-lg font-bold text-white leading-none">{selectedStream.name}</h2>
                              <p className="text-xs text-slate-500 mt-1">{selectedStream.location} • {activeZone?.name}</p>
                          </div>
                      </div>
                      <button onClick={() => setSelectedStream(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="flex-1 bg-black min-h-[400px]">
                       <StreamPlayer 
                           stream={selectedStream}
                           onAlertGenerated={handleAlert}
                       />
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}