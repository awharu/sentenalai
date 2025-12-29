import React, { useRef, useState, useEffect } from 'react';
import { CameraStream, SecurityAlert } from '../types';
import { analyzeFrame } from '../services/geminiService';
import { identifyPersonInFrame } from '../services/identityService';
import { simulatePlateDetection, registerVehicleEntry } from '../services/accessControlService';
import { AlertTriangle, Eye, Settings, Activity, ShieldCheck, ShieldAlert, UserCheck, UserX, Car, Zap, Signal } from 'lucide-react';
import Hls from 'hls.js';

interface StreamPlayerProps {
  stream: CameraStream;
  onAlertGenerated: (alert: SecurityAlert) => void;
  onEdit?: () => void;
}

interface StreamError {
    title: string;
    message: string;
    suggestion?: string;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ stream, onAlertGenerated, onEdit }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<StreamError | null>(null);
  const [isWebRTC, setIsWebRTC] = useState(false);
  const [rtcStats, setRtcStats] = useState<{bitrate: string; rtt: string; fps: number}>({ bitrate: '0', rtt: '0', fps: 0 });
  const [connectionState, setConnectionState] = useState<'new'|'connecting'|'connected'|'failed'>('new');
  
  // Auto-Guard State
  const [autoGuard, setAutoGuard] = useState(false);

  // Initialize Stream (HLS or Native or WebRTC Simulation)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset state
    setError(null);
    setConnectionState('new');
    setIsWebRTC(false);

    // Detect Stream Type
    const isMockRTC = stream.url.startsWith('mock-webrtc://');
    const isRealRTSP = stream.url.startsWith('rtsp://');

    if (isRealRTSP) {
        setError({
            title: "Protocol Unsupported",
            message: "Browsers cannot play raw RTSP streams directly.",
            suggestion: "Use the configuration menu to provision a transcoding backend."
        });
        return;
    } 
    
    if (isMockRTC) {
        setIsWebRTC(true);
        setConnectionState('connecting');
        
        // Simulate WebRTC Connection establishment
        const connectTimer = setTimeout(() => {
            setConnectionState('connected');
            // Play a real video file to visually simulate the stream, even though protocol is mock
            video.src = 'https://media.w3.org/2010/05/sintel/trailer.mp4';
            video.play().catch(console.error);
        }, 800);

        return () => clearTimeout(connectTimer);
    } 
    
    // Standard HLS/MP4
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported() && (stream.url.endsWith('.m3u8') || stream.url.includes('m3u8'))) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      
      hls.loadSource(stream.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
              setError({ title: "Stream Error", message: "HLS playback failed.", suggestion: "Check network." });
          }
      });
      hlsRef.current = hls;
    } else {
      video.src = stream.url;
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [stream.url]);

  // WebRTC Stats Simulator
  useEffect(() => {
      if (isWebRTC && connectionState === 'connected') {
          const interval = setInterval(() => {
              setRtcStats({
                  bitrate: (2.5 + Math.random() * 0.5).toFixed(1) + ' Mbps',
                  rtt: Math.floor(20 + Math.random() * 15) + ' ms', // 20-35ms RTT (Low Latency)
                  fps: 30
              });
          }, 1000);
          return () => clearInterval(interval);
      }
  }, [isWebRTC, connectionState]);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    if (!hlsRef.current && !isWebRTC) {
        setError({ title: "Playback Error", message: "Video source failed to load." });
    }
  };

  const triggerAnalysis = async (isAutoTrigger = false) => {
    if (!videoRef.current || !canvasRef.current) return;
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        
        // 1. Run Gemini Analysis
        const result = await analyzeFrame(base64);
        let alertGenerated = false;

        // 2. Identify Persons
        if (result.detectedObjects.some(obj => obj.toLowerCase().includes('person') || obj.toLowerCase().includes('face'))) {
             const identityMatch = await identifyPersonInFrame();
             if (identityMatch) {
                 const isBlacklisted = identityMatch.category === 'BLACKLISTED';
                 const newAlert: SecurityAlert = {
                     id: crypto.randomUUID(),
                     streamId: stream.id,
                     timestamp: Date.now(),
                     type: 'FACE_MATCH',
                     severity: isBlacklisted ? 'CRITICAL' : 'LOW',
                     description: isBlacklisted 
                        ? `BLACKLIST MATCH: ${identityMatch.name} detected.` 
                        : `Access Granted: ${identityMatch.name} (${identityMatch.category})`,
                     thumbnail: base64
                 };
                 onAlertGenerated(newAlert);
                 alertGenerated = true;
             }
        }

        // 3. Identify Vehicles (LPR)
        if (result.detectedObjects.some(obj => obj.toLowerCase().includes('car') || obj.toLowerCase().includes('vehicle'))) {
            const detectedPlate = await simulatePlateDetection();
            if (detectedPlate) {
                const log = await registerVehicleEntry(stream.id, detectedPlate, base64);
                if (log.status !== 'GRANTED') {
                     const newAlert: SecurityAlert = {
                        id: crypto.randomUUID(),
                        streamId: stream.id,
                        timestamp: Date.now(),
                        type: 'LPR',
                        severity: log.status === 'DENIED' ? 'HIGH' : 'MEDIUM',
                        description: `LPR Alert: Plate ${detectedPlate} is ${log.status}`,
                        thumbnail: base64
                     };
                     onAlertGenerated(newAlert);
                     alertGenerated = true;
                }
            }
        }

        // 4. Fallback
        if (!alertGenerated && (result.threatLevel === 'HIGH' || result.threatLevel === 'MEDIUM')) {
          const newAlert: SecurityAlert = {
            id: crypto.randomUUID(),
            streamId: stream.id,
            timestamp: Date.now(),
            type: result.threatLevel === 'HIGH' ? 'UNAUTHORIZED' : 'VEHICLE',
            severity: result.threatLevel,
            description: result.description || "AI Anomaly Detected",
            thumbnail: base64
          };
          onAlertGenerated(newAlert);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (autoGuard && stream.status === 'online' && !error) {
      const interval = setInterval(() => triggerAnalysis(true), 10000);
      return () => clearInterval(interval);
    }
  }, [autoGuard, stream.status, error]);

  return (
    <div className={`relative bg-slate-900 rounded-lg overflow-hidden border group h-full transition-colors ${autoGuard ? 'border-blue-500/50 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]' : 'border-slate-700'}`}>
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-2 z-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${stream.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-xs font-medium text-white shadow-sm">{stream.name}</span>
          
          {/* Latency Badge */}
          {isWebRTC && connectionState === 'connected' ? (
              <div className="flex items-center gap-1 bg-purple-600/90 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                  <Zap size={8} fill="currentColor" />
                  REAL-TIME
              </div>
          ) : !isWebRTC ? (
              <div className="flex items-center gap-1 bg-slate-700/80 text-slate-300 text-[9px] px-1.5 py-0.5 rounded font-bold">
                  LIVE
              </div>
          ) : null}

          {/* Auto-Guard Badge */}
          {autoGuard && (
             <div className="flex items-center gap-1 bg-blue-600/90 text-white text-[9px] px-1.5 py-0.5 rounded font-bold animate-pulse">
                <ShieldCheck size={10} />
                AUTO
             </div>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
                onClick={() => setAutoGuard(!autoGuard)}
                className={`p-1.5 rounded backdrop-blur-md transition-colors ${autoGuard ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600'}`}
                title={autoGuard ? "Disable Auto-Guard" : "Enable Auto-Guard"}
            >
                {autoGuard ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
            </button>
            <button 
                onClick={() => triggerAnalysis(false)} 
                disabled={isAnalyzing} 
                className="p-1.5 bg-slate-700/80 hover:bg-slate-600 rounded text-white backdrop-blur-md transition-colors" 
                title="Manual Analysis"
            >
                {isAnalyzing ? <Activity size={14} className="animate-spin" /> : <Eye size={14} />}
            </button>
            {onEdit && (
                <button 
                    onClick={onEdit} 
                    className="p-1.5 bg-slate-700/80 hover:bg-slate-600 rounded text-white backdrop-blur-md transition-colors" 
                    title="Configure Stream"
                >
                    <Settings size={14} />
                </button>
            )}
        </div>
      </div>

      {/* WebRTC Loading State */}
      {isWebRTC && connectionState === 'connecting' && (
          <div className="absolute inset-0 z-0 bg-slate-900 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                  <Signal size={24} className="animate-pulse" />
                  <span className="font-bold">Establishing WebRTC Link...</span>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                  <div>ICE Gathering: Complete</div>
                  <div>DTLS Handshake: Pending...</div>
              </div>
          </div>
      )}

      {error ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-black p-6 text-center">
          <AlertTriangle className="mb-3 text-red-500 h-8 w-8" />
          <h3 className="text-white font-semibold text-sm mb-1">{error.title}</h3>
          <p className="text-xs text-slate-400 mb-3 max-w-[250px]">{error.message}</p>
          {error.suggestion && (
            <div className="bg-slate-800/50 border border-slate-700 rounded px-3 py-2 max-w-[280px]">
                <p className="text-[10px] text-blue-300">
                    <span className="font-bold mr-1">Tip:</span> 
                    {error.suggestion}
                </p>
            </div>
          )}
        </div>
      ) : (
        <video
          ref={videoRef}
          className={`w-full h-full object-cover bg-black ${isWebRTC && connectionState !== 'connected' ? 'opacity-0' : 'opacity-100'}`}
          autoPlay
          muted
          loop
          playsInline
          onError={handleVideoError}
        />
      )}

      {/* WebRTC Nerd Stats Overlay */}
      {isWebRTC && connectionState === 'connected' && (
          <div className="absolute bottom-2 left-2 z-10 bg-black/60 backdrop-blur-sm border border-white/10 p-2 rounded text-[9px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Protocol:</span>
                  <span className="text-purple-300">WHEP/WebRTC</span>
              </div>
              <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Bitrate:</span>
                  <span>{rtcStats.bitrate}</span>
              </div>
              <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Latency:</span>
                  <span className="text-green-400">{rtcStats.rtt}</span>
              </div>
              <div className="flex justify-between gap-4">
                  <span className="text-slate-400">FPS:</span>
                  <span>{rtcStats.fps}</span>
              </div>
          </div>
      )}
      
      <canvas ref={canvasRef} className="hidden" />

      {isAnalyzing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 pointer-events-none">
           <div className="flex flex-col items-center animate-in fade-in zoom-in duration-200">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
             <span className="text-xs text-blue-200 font-medium">Analyzing...</span>
           </div>
        </div>
      )}
    </div>
  );
};