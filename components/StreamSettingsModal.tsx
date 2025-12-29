import React, { useState, useEffect } from 'react';
import { CameraStream } from '../types';
import { Button } from './Button';
import { startTranscodingSession } from '../services/transcodingService';
import { logAction } from '../services/auditService';
import { X, MapPin, Link as LinkIcon, Video, Trash2, Plus, Server, RefreshCw, Zap, Clock } from 'lucide-react';

interface StreamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedStream: CameraStream) => void;
  onDelete: (streamId: string) => void;
  stream: CameraStream | null;
  isNew?: boolean;
}

export const StreamSettingsModal: React.FC<StreamSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  stream,
  isNew = false
}) => {
  const [formData, setFormData] = useState<Partial<CameraStream>>({});
  const [sourceUrl, setSourceUrl] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);

  useEffect(() => {
    if (stream) {
      setFormData({
        name: stream.name,
        location: stream.location,
        url: stream.url,
        rtspUrl: stream.rtspUrl,
        latencyMode: stream.latencyMode || 'STANDARD'
      });
      // Prefer showing the RTSP source if it exists, otherwise the HTTP URL
      setSourceUrl(stream.rtspUrl || stream.url || '');
    }
  }, [stream]);

  if (!isOpen || !stream) return null;

  const isRtsp = sourceUrl.trim().startsWith('rtsp://');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProvisioning(true);

    try {
        let finalPlaybackUrl = sourceUrl;
        let finalRtspUrl = undefined;
        const mode = formData.latencyMode || 'STANDARD';

        if (isRtsp) {
            // Logic: User provided an RTSP URL, we need to "provision" it via the backend
            finalRtspUrl = sourceUrl;
            // Call the mock backend service
            finalPlaybackUrl = await startTranscodingSession(sourceUrl, mode);
        }

        const updatedStream = { 
            ...stream, 
            ...formData, 
            url: finalPlaybackUrl,
            rtspUrl: finalRtspUrl,
            // If it was a new stream, ensure status is online after provisioning
            status: 'online'
        } as CameraStream;

        onSave(updatedStream);
        
        // Audit Log
        const actionType = isNew ? 'CREATE_STREAM' : 'UPDATE_STREAM';
        await logAction(actionType, `Stream: ${updatedStream.name}`, `Source: ${isRtsp ? 'RTSP' : 'Direct URL'}, Mode: ${mode}`);
        
        onClose();
    } catch (error) {
        console.error("Failed to provision stream:", error);
        alert("Failed to connect to RTSP source. Please check the URL and network.");
    } finally {
        setIsProvisioning(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this camera stream? This action cannot be undone.")) {
      onDelete(stream.id);
      await logAction('DELETE_STREAM', `Stream: ${stream.name}`, `ID: ${stream.id} removed from tenant.`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {isNew ? <Plus className="text-blue-500" size={24} /> : <Video className="text-blue-500" size={24} />}
            {isNew ? 'Add New Stream' : 'Configure Stream'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Camera Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              placeholder="e.g. Main Entrance"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Location / Zone</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={16} className="text-slate-600" />
              </div>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                placeholder="e.g. Building A, Lobby"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Source URL</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isRtsp ? <Server size={16} className="text-purple-500" /> : <LinkIcon size={16} className="text-slate-600" />}
              </div>
              <input
                type="text"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className={`w-full bg-slate-950 border text-white rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${isRtsp ? 'border-purple-500/50 focus:border-purple-500' : 'border-slate-800 focus:border-transparent'}`}
                placeholder="rtsp://... or https://..."
                required
              />
            </div>
            {isRtsp ? (
                <div className="mt-2 flex items-center gap-2 text-[10px] text-purple-400 bg-purple-900/20 p-2 rounded border border-purple-500/20">
                    <RefreshCw size={12} className="animate-spin-slow" />
                    <span>RTSP detected. Backend transcoder will be provisioned.</span>
                </div>
            ) : (
                <p className="text-[10px] text-slate-500 mt-1">
                  Enter an RTSP stream (will be transcoded) or a direct HLS/MP4 URL.
                </p>
            )}
          </div>

          {isRtsp && (
              <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-2">Latency Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                      <div 
                        onClick={() => setFormData(prev => ({...prev, latencyMode: 'STANDARD'}))}
                        className={`cursor-pointer rounded-lg border p-3 flex flex-col items-center justify-center text-center gap-2 transition-all ${formData.latencyMode === 'STANDARD' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                      >
                          <Clock size={20} />
                          <div>
                              <div className="text-xs font-bold">Standard (HLS)</div>
                              <div className="text-[10px] opacity-70">10-15s Latency</div>
                          </div>
                      </div>
                      <div 
                        onClick={() => setFormData(prev => ({...prev, latencyMode: 'LOW_LATENCY'}))}
                        className={`cursor-pointer rounded-lg border p-3 flex flex-col items-center justify-center text-center gap-2 transition-all ${formData.latencyMode === 'LOW_LATENCY' ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                      >
                          <Zap size={20} />
                          <div>
                              <div className="text-xs font-bold">Ultra Low (WebRTC)</div>
                              <div className="text-[10px] opacity-70">{"< 500ms Latency"}</div>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          <div className="flex items-center gap-3 pt-6 mt-2 border-t border-slate-800">
            {!isNew && (
                <Button 
                    type="button" 
                    variant="danger" 
                    onClick={handleDelete}
                    className="flex items-center gap-2"
                    title="Delete Stream"
                    disabled={isProvisioning}
                >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Delete</span>
                </Button>
            )}
            <div className="flex-1"></div>
            <Button type="button" variant="outline" onClick={onClose} disabled={isProvisioning}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isProvisioning}>
              {isProvisioning ? 'Provisioning...' : (isNew ? 'Add Stream' : 'Save Changes')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};