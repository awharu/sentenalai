import React, { useMemo } from 'react';
import { useDrones } from '../contexts/DroneStateContext';
import { MAP_ZONES } from '../services/mapService';
import { Zap, BatteryCharging, CheckCircle, Send } from 'lucide-react';
import { MapZone } from '../types';

interface DroneOverlayProps {
    activeZone: MapZone | null;
}

export const DroneOverlay: React.FC<DroneOverlayProps> = ({ activeZone }) => {
    const { drones } = useDrones();

    const visibleDrones = useMemo(() => {
        if (!activeZone) return [];
        return drones.filter(d => d.zoneId === activeZone.id);
    }, [drones, activeZone]);

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'enroute':
            case 'patrolling':
                return <Zap size={14} className="text-yellow-400" fill="currentColor" />;
            case 'returning':
                return <CheckCircle size={14} className="text-green-400" />;
            case 'charging':
                return <BatteryCharging size={14} className="text-blue-400" />;
            default:
                return <Send size={14} className="text-slate-400" />;
        }
    };

    // Simple layout for demo - in a real app, this would be tied to map coordinates
    const getDronePosition = (droneId: string, zoneId: string) => {
        const zone = MAP_ZONES.find(z => z.id === zoneId);
        if (!zone) return { top: '50%', left: '50%' };

        // Mock positions within the zone
        switch(droneId) {
             case 'dji_mavic_3_pro_1': return { top: '30%', left: '70%' };
             case 'dji_mavic_3_pro_2': return { top: '60%', left: '40%' };
             default: return { top: '50%', left: '50%' };
        }
    };

    if (visibleDrones.length === 0) return null;

    return (
        <div className="absolute inset-0 z-20 pointer-events-none">
            {visibleDrones.map(drone => (
                <div
                    key={drone.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group/marker"
                    style={getDronePosition(drone.id, drone.zoneId)}
                >
                    <div className="relative w-10 h-10 rounded-full flex items-center justify-center bg-slate-900/80 border-2 border-purple-500 shadow-lg">
                        {getStatusIcon(drone.status)}
                    </div>
                     {drone.status === 'patrolling' && (
                        <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-75"></div>
                    )}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg p-2 shadow-xl opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none scale-95 group-hover/marker:scale-100 origin-bottom">
                       <p className="text-xs font-bold text-white truncate">{drone.name}</p>
                       <p className="text-[10px] text-slate-400 capitalize">{drone.status}...</p>
                       <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                           <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${drone.battery}%` }}></div>
                       </div>
                   </div>
                </div>
            ))}
        </div>
    );
};
