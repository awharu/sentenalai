import { PlateRecord, VehicleAccessLog } from "../types";

// Registered License Plate Registry
const AUTHORIZED_PLATES: PlateRecord[] = [
  { plateNumber: 'ABC-1234', ownerName: 'Company Fleet #1', status: 'ALLOWED', vehicleType: 'Ford Transit' },
  { plateNumber: 'XYZ-9876', ownerName: 'John Smith', status: 'ALLOWED', vehicleType: 'Tesla Model 3' },
  { plateNumber: 'BAD-6666', ownerName: 'Unknown', status: 'BLOCKED', vehicleType: 'Black SUV', notes: 'Suspicious vehicle reported 3 times.' },
  { plateNumber: 'DLV-5544', ownerName: 'Daily Delivery', status: 'ALLOWED', vehicleType: 'Box Truck' }
];

// Persistent logs (in-memory for runtime)
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
  return [...AUTHORIZED_PLATES];
};

export const registerVehicleEntry = async (streamId: string, plateNumber: string, thumbnail?: string): Promise<VehicleAccessLog> => {
  const record = AUTHORIZED_PLATES.find(p => p.plateNumber === plateNumber);
  
  const status = record?.status === 'ALLOWED' ? 'GRANTED' 
               : record?.status === 'BLOCKED' ? 'DENIED' 
               : 'FLAGGED';

  const newLog: VehicleAccessLog = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    streamId,
    plateNumber,
    status,
    direction: 'ENTRY',
    confidence: 0.85 + Math.random() * 0.14,
    thumbnailUrl: thumbnail
  };

  accessLogs.unshift(newLog);
  
  if (accessLogs.length > 100) accessLogs.pop();

  return newLog;
};

// Logic for plate detection events
export const processPlateDetection = async (detectedPlate: string): Promise<string | null> => {
    // Validate if the detected string matches any authorized or known plates
    const match = AUTHORIZED_PLATES.find(p => p.plateNumber === detectedPlate);
    return match ? match.plateNumber : detectedPlate;
};

export const addPlateRecord = async (record: PlateRecord) => {
    AUTHORIZED_PLATES.push(record);
};

export const deletePlateRecord = async (plate: string) => {
    const idx = AUTHORIZED_PLATES.findIndex(p => p.plateNumber === plate);
    if (idx !== -1) AUTHORIZED_PLATES.splice(idx, 1);
};