import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Drone } from '../types';
import * as droneService from '../services/droneService';

interface DroneContextType {
    drones: Drone[];
    dispatchDrone: (zoneId: string) => Promise<Drone | null>;
    returnDrone: (droneId: string) => Promise<Drone | null>;
}

const DroneContext = createContext<DroneContextType | undefined>(undefined);

export const DroneProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [drones, setDrones] = useState<Drone[]>([]);

    useEffect(() => {
        const fetchDrones = async () => {
            const dronesData = await droneService.getDrones();
            setDrones(dronesData);
        };
        fetchDrones();

        const interval = setInterval(async () => {
             const dronesData = await droneService.getDrones();
             setDrones(dronesData);
        }, 5000); // Refresh drone status every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const handleDispatch = async (zoneId: string) => {
        const drone = await droneService.dispatchDrone(zoneId);
        if (drone) {
            setDrones(prev => prev.map(d => d.id === drone.id ? drone : d));
        }
        return drone;
    };

    const handleReturn = async (droneId: string) => {
        const drone = await droneService.returnDrone(droneId);
        if (drone) {
             setDrones(prev => prev.map(d => d.id === drone.id ? drone : d));
        }
        return drone;
    };

    return (
        <DroneContext.Provider value={{ drones, dispatchDrone: handleDispatch, returnDrone: handleReturn }}>
            {children}
        </DroneContext.Provider>
    );
};

export const useDrones = (): DroneContextType => {
    const context = useContext(DroneContext);
    if (!context) {
        throw new Error('useDrones must be used within a DroneProvider');
    }
    return context;
};
