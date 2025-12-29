import { PlateRecord, VehicleAccessLog } from "../types";

// Mock Database of Registered Plates
const PLATE_DATABASE: PlateRecord[] = [
  { plateNumber: 'ABC-1234', ownerName: 'Company Fleet #1', status: 'ALLOWED', vehicleType: 'Ford Transit' },
  { plateNumber: 'XYZ-9876', ownerName: 'John Smith', status: 'ALLOWED', vehicleType: 'Tesla Model 3' },
  { plateNumber: 'BAD-6666', ownerName: 'Unknown', status: 'BLOCKED', vehicleType: 'Black SUV', notes: 'Suspicious vehicle reported 3 times.' },
  { plateNumber: 'DLV-5544', ownerName: 'Daily Delivery', status: 'ALLOWED', vehicleType: 'Box Truck' }
];

// In-memory logs
let accessLogs: VehicleAccessLog[] = [
  {
    id: 'log_1',
    timestamp: Date.now() - 1000 * 60 * 15,
    streamId: '1',
    plateNumber: 'ABC-1234',
    status: 'GRANTED',
    direction: 'ENTRY',
    confidence: 0.98,
    thumbnailUrl: ''
  },
  {
    id: 'log_2',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    streamId: '4',
    plateNumber: 'DLV-5544',
    status: 'GRANTED',
    direction: 'EXIT',
    confidence: 0.95,
    thumbnailUrl: ''
  }
];

export const getAccessLogs = async (): Promise<VehicleAccessLog[]> => {
  return [...accessLogs].sort((a, b) => b.timestamp - a.timestamp);
};

export const getPlateDatabase = async (): Promise<PlateRecord[]> => {
  return [...PLATE_DATABASE];
};

export const registerVehicleEntry = async (streamId: string, plateNumber: string, thumbnail?: string): Promise<VehicleAccessLog> => {
  const record = PLATE_DATABASE.find(p => p.plateNumber === plateNumber);
  
  const status = record?.status === 'ALLOWED' ? 'GRANTED' 
               : record?.status === 'BLOCKED' ? 'DENIED' 
               : 'FLAGGED'; // Unknowns are flagged

  const newLog: VehicleAccessLog = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    streamId,
    plateNumber,
    status,
    direction: 'ENTRY', // Simplified for demo
    confidence: 0.85 + Math.random() * 0.14,
    thumbnailUrl: thumbnail
  };

  accessLogs.unshift(newLog);
  
  // Keep log size manageable
  if (accessLogs.length > 100) accessLogs.pop();

  return newLog;
};

// Simulation Helper
export const simulatePlateDetection = async (): Promise<string | null> => {
  // 25% chance to simulate a plate read if a vehicle is detected
  if (Math.random() > 0.75) {
    const plates = [...PLATE_DATABASE.map(p => p.plateNumber), 'UNK-' + Math.floor(Math.random() * 9000 + 1000)];
    const randomPlate = plates[Math.floor(Math.random() * plates.length)];
    return randomPlate;
  }
  return null;
};

export const addPlateRecord = async (record: PlateRecord) => {
    PLATE_DATABASE.push(record);
};

export const deletePlateRecord = async (plate: string) => {
    const idx = PLATE_DATABASE.findIndex(p => p.plateNumber === plate);
    if (idx !== -1) PLATE_DATABASE.splice(idx, 1);
};