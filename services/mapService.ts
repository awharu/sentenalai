import { CameraStream, MapZone } from "../types";

// Mock Zones
export const MAP_ZONES: MapZone[] = [
    {
        id: 'zone_a',
        name: 'Headquarters - Building A',
        imageUrl: 'https://images.unsplash.com/photo-1555679427-1f6dfcce943b?auto=format&fit=crop&q=80&w=1600', // Technical Blueprint / Abstract
        width: 1600,
        height: 900
    },
    {
        id: 'zone_b',
        name: 'Logistics Center - Yard',
        imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1600', // Aerial view
        width: 1600,
        height: 900
    }
];

// Mock Streams with Coordinates
const MAPPED_STREAMS: CameraStream[] = [
    {
        id: '1',
        name: 'Main Entrance',
        url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
        status: 'online',
        location: 'Lobby',
        tenantId: 't1',
        coordinates: { x: 45, y: 80 },
        zoneId: 'zone_a'
    },
    {
        id: '3',
        name: 'Server Room Hallway',
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        status: 'online',
        location: 'Secure Corridor',
        tenantId: 't1',
        coordinates: { x: 65, y: 30 },
        zoneId: 'zone_a'
    },
    {
        id: '2',
        name: 'Perimeter HLS',
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        status: 'online',
        location: 'North Fence',
        tenantId: 't1',
        coordinates: { x: 20, y: 20 },
        zoneId: 'zone_b'
    },
    {
        id: '4',
        name: 'Loading Dock',
        url: '',
        status: 'offline',
        location: 'Rear Gate',
        tenantId: 't1',
        coordinates: { x: 80, y: 60 },
        zoneId: 'zone_b'
    }
];

export const getZones = async (): Promise<MapZone[]> => {
    return MAP_ZONES;
};

export const getStreamsByZone = async (zoneId: string): Promise<CameraStream[]> => {
    return MAPPED_STREAMS.filter(s => s.zoneId === zoneId);
};