import { Drone, DroneStatus } from '../types';

const MOCK_DRONES: Drone[] = [
    { id: 'dji_mavic_3_pro_1', name: 'Alpha-1', status: 'standby', zoneId: 'zone_a', battery: 98 },
    { id: 'dji_mavic_3_pro_2', name: 'Alpha-2', status: 'standby', zoneId: 'zone_b', battery: 100 }
];

let drones: Drone[] = [...MOCK_DRONES];

export const getDrones = async (): Promise<Drone[]> => {
    return [...drones];
};

export const dispatchDrone = async (zoneId: string): Promise<Drone | null> => {
    const availableDrone = drones.find(d => d.zoneId === zoneId && d.status === 'standby');
    if (!availableDrone) return null;

    // Simulate dispatch
    availableDrone.status = 'enroute';
    setTimeout(() => {
        if(availableDrone.status === 'enroute') {
            availableDrone.status = 'patrolling';
        }
    }, 5000); // 5s to reach destination

    return { ...availableDrone };
};

export const returnDrone = async (droneId: string): Promise<Drone | null> => {
    const drone = drones.find(d => d.id === droneId);
    if (!drone) return null;

    drone.status = 'returning';
    setTimeout(() => {
        if(drone.status === 'returning') {
            drone.status = 'standby';
        }
    }, 5000); // 5s to return

    return { ...drone };
};
