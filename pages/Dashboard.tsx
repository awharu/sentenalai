import React, { useState, useMemo, useEffect } from 'react';
import { CameraStream, SecurityAlert, IoTDevice } from '../types';
import { StreamPlayer } from '../components/StreamPlayer';
import { StreamSettingsModal } from '../components/StreamSettingsModal';
import { Bell, Search, Grid, List, Plus, Activity, Thermometer, DoorOpen } from 'lucide-react';
import { Button } from '../components/Button';

// Initial Data
const INITIAL_STREAMS: CameraStream[] = [
  {
    id: '1',
    name: 'Main Entrance (WebRTC)',
    url: 'mock-webrtc://stream-01', // Simulate WebRTC initially
    status: 'online',
    location: 'Building A',
    tenantId: 'tenant-alpha-001',
    latencyMode: 'LOW_LATENCY'
  },
  {
    id: '2',
    name: 'Perimeter HLS',
    // Public HLS Test Stream (Big Buck Bunny) - Validates HLS/H.264 Support
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', 
    status: 'online',
    location: 'Exterior',
    tenantId: 'tenant-alpha-001',
    latencyMode: 'STANDARD'
  },
  {
    id: '3',
    name: 'Server Room Hallway',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    status: 'online',
    location: 'Building B',
    tenantId: 'tenant-alpha-001',
    latencyMode: 'STANDARD'
  },
  {
    id: '4',
    name: 'Loading Dock',
    url: '', // Intentionally empty to show offline state
    status: 'offline',
    location: 'Rear',
    tenantId: 'tenant-alpha-001'
  }
];

// Initial IoT Devices (Phase 2 Edge Connectivity)
const INITIAL_SENSORS: IoTDevice[] = [
  { id: 'iot_1', name: 'Front Door Contact', type: 'SENSOR_DOOR', status: 'idle', value: 'CLOSED', linkedStreamId: '1', location: 'Building A', lastUpdate: Date.now() },
  { id: 'iot_2', name: 'Server Room Temp', type: 'SENSOR_TEMP', status: 'active', value: '21°C', linkedStreamId: '3', location: 'Building B', lastUpdate: Date.now() },
  { id: 'iot_3', name: 'Loading Dock Motion', type: 'SENSOR_MOTION', status: 'idle', value: 'CLEAR', linkedStreamId: '4', location: 'Rear', lastUpdate: Date.now() }
];

export default function Dashboard() {
  const [streams, setStreams] = useState<CameraStream[]>(INITIAL_STREAMS);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [sensors, setSensors] = useState<IoTDevice[]>(INITIAL_SENSORS);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingStream, setEditingStream] = useState<CameraStream | null>(null);

  // Group consecutive alerts to reduce noise
  const groupedAlerts = useMemo(() => {
    const groups: (SecurityAlert & { count: number })[] = [];
    if (alerts.length === 0) return groups;

    // Start with the newest alert
    let currentGroup = { ...alerts[0], count: 1 };

    for (let i = 1; i < alerts.length; i++) {
      const nextAlert = alerts[i];
      
      const isSameType = nextAlert.type === currentGroup.type;
      const isSameSeverity = nextAlert.severity === currentGroup.severity;
      const isSameStream = nextAlert.streamId === currentGroup.streamId;

      if (isSameType && isSameSeverity && isSameStream) {
        currentGroup.count++;
      } else {
        groups.push(currentGroup);
        currentGroup = { ...nextAlert, count: 1 };
      }
    }
    groups.push(currentGroup);
    return groups;
  }, [alerts]);

  const handleNewAlert = (alert: SecurityAlert) => {
    setAlerts(prev => [alert, ...prev]);
  };

  const handleSaveStream = (stream: CameraStream) => {
    setStreams(prev => {
        const exists = prev.find(s => s.id === stream.id);
        if (exists) {
            return prev.map(s => s.id === stream.id ? stream : s);
        }
        return [...prev, { ...stream, status: 'online' }]; // Default to online when added
    });
    setEditingStream(null);
  };

  const handleDeleteStream = (streamId: string) => {
    setStreams(prev => prev.filter(s => s.id !== streamId));
    setEditingStream(null);
  };

  const handleAddStream = () => {
    const newStreamTemplate: CameraStream = {
        id: crypto.randomUUID(),
        name: '',
        url: '',
        status: 'offline',
        location: '',
        tenantId: 'tenant-alpha-001',
        latencyMode: 'STANDARD'
    };
    setEditingStream(newStreamTemplate);
  };

  // Simulate IoT Data Stream (Phase 2 Edge Connectivity)
  useEffect(() => {
    const interval = setInterval(() => {
        setSensors(prev => prev.map(sensor => {
            // Randomly flip sensor states
            if (Math.random() > 0.9) {
                if (sensor.type === 'SENSOR_DOOR') {
                    const isOpen = sensor.value === 'CLOSED';
                    return { 
                        ...sensor, 
                        value: isOpen ? 'OPEN' : 'CLOSED', 
                        status: isOpen ? 'triggered' : 'idle',
                        lastUpdate: Date.now()
                    };
                } else if (sensor.type === 'SENSOR_MOTION') {
                    const isMotion = sensor.value === 'CLEAR';
                    return {
                         ...sensor,
                         value: isMotion ? 'DETECTED' : 'CLEAR',
                         status: isMotion ? 'triggered' : 'idle',
                         lastUpdate: Date.now()
                    };
                } else if (sensor.type === 'SENSOR_TEMP') {
                    return { ...sensor, value: (20 + Math.random() * 3).toFixed(1) + '°C', lastUpdate: Date.now() };
                }
            }
            return sensor;
        }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Determine if the current editing stream is a new one (not in the list yet)
  const isNewStream = editingStream && !streams.some(s => s.id === editingStream.id);

  return (
    <div className="flex flex-col h-full gap-6">
      <StreamSettingsModal 
        isOpen={!!editingStream}
        stream={editingStream}
        isNew={!!isNewStream}
        onClose={() => setEditingStream(null)}
        onSave={handleSaveStream}
        onDelete={handleDeleteStream}
      />

      {/* Top Stats / Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Monitoring</h1>
          <p className="text-slate-400 text-sm">Tenant Alpha / {streams.length} Active Streams</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleAddStream} className="hidden md:flex items-center gap-2">
            <Plus size={16} />
            <span>Add Stream</span>
          </Button>

          <div className="bg-slate-800 flex items-center rounded-lg px-3 py-2 border border-slate-700">
            <Search size={18} className="text-slate-500 mr-2" />
            <input type="text" placeholder="Search cameras..." className="bg-transparent border-none text-sm text-white focus:outline-none w-32 lg:w-48" />
          </div>
          
          <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Video Grid */}
        <div className={`flex-1 overflow-y-auto ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4' : 'flex flex-col gap-4'} pr-2`}>
          {streams.length === 0 ? (
             <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
                <p>No streams active.</p>
                <Button variant="outline" onClick={handleAddStream} className="mt-4">Add Camera</Button>
             </div>
          ) : (
            streams.map(stream => (
                <div key={stream.id} className={`${viewMode === 'list' ? 'h-64' : 'aspect-video'} relative`}>
                    <StreamPlayer 
                        stream={stream} 
                        onAlertGenerated={handleNewAlert} 
                        onEdit={() => setEditingStream(stream)}
                    />
                    {/* Visual Overlay if linked sensor is triggered */}
                    {sensors.find(s => s.linkedStreamId === stream.id && s.status === 'triggered') && (
                        <div className="absolute bottom-14 left-4 z-20 bg-red-600/90 text-white text-xs px-2 py-1 rounded animate-pulse border border-red-500 shadow-lg font-bold flex items-center gap-1">
                            <Activity size={12} />
                            {sensors.find(s => s.linkedStreamId === stream.id && s.status === 'triggered')?.value}
                        </div>
                    )}
                </div>
            ))
          )}
        </div>

        {/* Sidebar: Alerts & Sensors */}
        <div className="w-full lg:w-72 flex flex-col gap-4">
            {/* Sensor Widget (IoT / Edge Connectivity) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Activity size={14} className="text-green-500" />
                        IoT Sensors
                    </h3>
                    <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    </div>
                </div>
                <div className="p-3 space-y-2">
                    {sensors.map(sensor => (
                        <div key={sensor.id} className="flex items-center justify-between text-sm bg-slate-800/30 p-2 rounded border border-slate-800">
                            <div className="flex items-center gap-2">
                                {sensor.type === 'SENSOR_TEMP' ? <Thermometer size={14} className="text-slate-400" /> : <DoorOpen size={14} className="text-slate-400" />}
                                <span className="text-slate-300 truncate max-w-[100px]" title={sensor.name}>{sensor.name}</span>
                            </div>
                            <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                                sensor.status === 'triggered' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                                sensor.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                                'text-slate-500'
                            }`}>
                                {sensor.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Live Alerts */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden h-72 lg:h-auto flex-1">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Bell size={16} className="text-blue-500" />
                    Live Alerts
                    </h3>
                    <span className="text-[10px] bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded-full">{alerts.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {groupedAlerts.length === 0 ? (
                    <div className="text-center text-slate-500 py-8 text-xs">
                        System Secure.<br/>No active threats.
                    </div>
                    ) : (
                    groupedAlerts.map(alert => (
                        <div key={alert.id} className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/50 hover:border-slate-600 transition-colors flex gap-2.5 group">
                        {alert.thumbnail && (
                            <div className="relative shrink-0">
                                <img src={alert.thumbnail} alt="Evidence" className="w-16 h-16 object-cover rounded bg-black" />
                                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded pointer-events-none"></div>
                                {alert.count > 1 && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-slate-900">
                                        {alert.count > 99 ? '99+' : `x${alert.count}`}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-1.5">
                                    <span className={`px-1.5 py-px rounded-[3px] text-[9px] font-bold uppercase tracking-wider ${
                                        alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-200 border border-red-500/30' :
                                        alert.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-200 border border-orange-500/30' :
                                        'bg-blue-500/20 text-blue-200 border border-blue-500/30'
                                    }`}>
                                        {alert.type.replace('_', ' ')}
                                    </span>
                                </div>
                                <span className="text-[10px] text-slate-500 whitespace-nowrap ml-1">
                                    {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 line-clamp-2 leading-tight" title={alert.description}>
                                {alert.description}
                            </p>
                        </div>
                        </div>
                    ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}