import React, { useRef, useState, useEffect } from 'react';
import { CameraStream, SecurityAlert } from '../types';
import { analyzeFrame } from '../services/geminiService';
import { AlertTriangle, Eye, Settings, Activity, ShieldCheck, ShieldAlert } from 'lucide-react';
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
  const [streamType, setStreamType] = useState<'MP4' | 'HLS' | 'RTSP'>('MP4');
  
  // Auto-Guard State
  const [autoGuard, setAutoGuard] = useState(false);

  // Initialize Stream (HLS or Native)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset error state on url change
    setError(null);

    // Detect Stream Type
    if (stream.url.startsWith('rtsp://')) {
        setStreamType('RTSP');
        setError({
            title: "Protocol Unsupported",
            message: "Browsers cannot play raw RTSP streams directly.",
            suggestion: "Use the configuration menu to provision a transcoding backend."
        });
        return;
    } else if (stream.url.endsWith('.m3u8') || stream.url.includes('m3u8')) {
        setStreamType('HLS');
    } else {
        setStreamType('MP4');
    }

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // HLS Implementation
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
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("fatal network error encountered, try to recover");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("fatal media error encountered, try to recover");
              hls.recoverMediaError();
              break;
            default:
              console.log("cannot recover");
              hls.destroy();
              
              let errTitle = "Stream Connection Failed";
              let errMessage = "A fatal error occurred during playback.";
              let errSuggestion = "Check your network connection and stream URL.";

              if (data.details === 'manifestLoadError') {
                  errTitle = "Manifest Load Error";
                  errMessage = "Unable to load the stream manifest from the server.";
                  errSuggestion = "Ensure the server is online and supports CORS.";
              } else if (data.details === 'manifestParsingError') {
                  errTitle = "Manifest Parsing Error";
                  errMessage = "The stream manifest is invalid or corrupted.";
                  errSuggestion = "Verify the stream source configuration.";
              } else if (data.details === 'levelLoadError') {
                  errTitle = "Segment Load Error";
                  errMessage = "Failed to load video segments.";
                  errSuggestion = "The camera might be offline or experiencing high latency.";
              }

              setError({
                  title: errTitle,
                  message: errMessage,
                  suggestion: errSuggestion
              });
              break;
          }
        }
      });

      hlsRef.current = hls;
    } 
    // Native HLS Support (Safari)
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream.url;
    } 
    // Standard playback (MP4/WebM)
    else {
      video.src = stream.url;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [stream.url]);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    if (video.error) {
       // Only set error if not already handled by HLS logic
       if (!hlsRef.current) {
          let title = "Playback Error";
          let msg = video.error.message || 'Unknown error occurred';
          let suggestion = "Try refreshing the stream.";

          switch (video.error.code) {
              case 1: // MEDIA_ERR_ABORTED
                  title = "Playback Aborted";
                  msg = "The video playback was aborted.";
                  break;
              case 2: // MEDIA_ERR_NETWORK
                  title = "Network Error";
                  msg = "A network error caused the video download to fail.";
                  suggestion = "Check your internet connection.";
                  break;
              case 3: // MEDIA_ERR_DECODE
                  title = "Decoding Error";
                  msg = "Video data is corrupted or the format is not supported.";
                  suggestion = "The stream encoding (e.g., H.265) might not be supported by this browser.";
                  break;
              case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
                  title = "Format Not Supported";
                  msg = "The video format or MIME type is not supported.";
                  suggestion = "Ensure the URL points to a valid MP4, WebM, or HLS stream.";
                  break;
          }

          setError({ title, message: msg, suggestion });
       }
    }
  };

  const triggerAnalysis = async (isAutoTrigger = false) => {
    if (!videoRef.current || !canvasRef.current) return;
    if (isAnalyzing) return; // Prevent overlapping requests
    
    setIsAnalyzing(true);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current frame
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        
        const result = await analyzeFrame(base64);
        
        // Generate alert if threat detected
        if (result.threatLevel === 'HIGH' || result.threatLevel === 'MEDIUM') {
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
        } else if (!isAutoTrigger) {
           // Provide feedback for manual triggers even if nothing found
           console.log("Analysis complete: No threats detected.");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Automated Inference Loop
  useEffect(() => {
    if (autoGuard && stream.status === 'online' && !error) {
      // Run analysis every 10 seconds
      const interval = setInterval(() => {
        triggerAnalysis(true);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [autoGuard, stream.status, error]);

  return (
    <div className={`relative bg-slate-900 rounded-lg overflow-hidden border group h-full transition-colors ${autoGuard ? 'border-blue-500/50 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]' : 'border-slate-700'}`}>
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-2 z-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${stream.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-xs font-medium text-white shadow-sm">{stream.name}</span>
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
          className="w-full h-full object-cover bg-black"
          autoPlay
          muted
          loop
          playsInline
          onError={handleVideoError}
        />
      )}
      
      <canvas ref={canvasRef} className="hidden" />

      {isAnalyzing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 pointer-events-none">
           <div className="flex flex-col items-center animate-in fade-in zoom-in duration-200">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
             <span className="text-xs text-blue-200 font-medium">Analyzing Frame...</span>
           </div>
        </div>
      )}
    </div>
  );
};