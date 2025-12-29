export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER'
}

export enum PlanTier {
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string;
  token: string;
}

export interface Tenant {
  id: string;
  name: string;
  plan: PlanTier;
  maxStreams: number;
  aiEnabled: boolean;
}

export interface CameraStream {
  id: string;
  name: string;
  url: string; // HLS or WebRTC http stream url
  rtspUrl?: string; // Original RTSP source
  status: 'online' | 'offline' | 'error';
  location: string;
  tenantId: string;
  // Phase 3: Geospatial
  coordinates?: { x: number; y: number }; // Percentage 0-100 relative to map
  zoneId?: string;
  // Phase 4: WebRTC
  latencyMode?: 'STANDARD' | 'LOW_LATENCY';
}

export interface MapZone {
    id: string;
    name: string;
    imageUrl: string;
    width: number;
    height: number;
}

export interface AnalysisResult {
  detectedObjects: string[];
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  description?: string;
  licensePlates?: string[];
  facesDetected?: number;
}

export interface SecurityAlert {
  id: string;
  streamId: string;
  timestamp: number;
  type: 'PERSON' | 'VEHICLE' | 'LPR' | 'FACE_MATCH' | 'UNAUTHORIZED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  thumbnail?: string; // Base64
}

// Phase 2: Edge Connectivity
export interface IoTDevice {
  id: string;
  name: string;
  type: 'SENSOR_DOOR' | 'SENSOR_MOTION' | 'SENSOR_TEMP' | 'ACCESS_CONTROLLER';
  status: 'active' | 'triggered' | 'idle' | 'offline';
  value?: string | number; // e.g. "21°C" or "OPEN"
  linkedStreamId?: string; // If this sensor triggers, which camera is relevant?
  location: string;
  lastUpdate: number;
}

// Phase 3: Vector Search
export interface ArchiveEvent {
  id: string;
  timestamp: number;
  streamId: string;
  streamName: string;
  description: string;
  confidence: number; // 0-1
  thumbnailUrl: string;
  tags: string[];
}

// Phase 3: Identity Management
export type IdentityCategory = 'EMPLOYEE' | 'VIP' | 'BLACKLISTED' | 'CONTRACTOR';

export interface PersonIdentity {
  id: string;
  name: string;
  category: IdentityCategory;
  imageUrl: string;
  notes?: string;
  lastSeen?: number;
}

// Phase 3: License Plate Recognition (LPR)
export interface PlateRecord {
  plateNumber: string;
  ownerName: string;
  status: 'ALLOWED' | 'BLOCKED' | 'UNKNOWN';
  vehicleType: string; // e.g., "Sedan", "Truck"
  notes?: string;
}

export interface VehicleAccessLog {
  id: string;
  timestamp: number;
  streamId: string;
  plateNumber: string;
  status: 'GRANTED' | 'DENIED' | 'FLAGGED';
  direction: 'ENTRY' | 'EXIT';
  thumbnailUrl?: string; // Base64
  confidence: number;
}

// Phase 4: Enterprise Compliance & Audit
export type AuditAction = 'LOGIN' | 'LOGOUT' | 'CREATE_STREAM' | 'DELETE_STREAM' | 'UPDATE_STREAM' | 'ADD_IDENTITY' | 'REMOVE_IDENTITY' | 'ADD_PLATE' | 'REMOVE_PLATE' | 'EXPORT_DATA' | 'CONFIG_SSO' | 'DEVICE_PAIRING';

export interface AuditLogEntry {
    id: string;
    timestamp: number;
    actorId: string;
    actorEmail: string;
    action: AuditAction;
    resource: string; // e.g. "Stream: Main Entrance"
    details: string;
    ipAddress: string;
    hash: string; // Simulated SHA-256 for immutability
}

// Phase 4: SSO & Mobile
export type SSOType = 'OIDC' | 'SAML';

export interface IdentityProvider {
    id: string;
    name: string;
    type: SSOType;
    issuerUrl: string;
    clientId: string;
    status: 'ACTIVE' | 'INACTIVE';
    lastSync?: number;
}

export interface MobileDevice {
    id: string;
    name: string; // e.g. "John's iPhone"
    os: 'iOS' | 'Android';
    appVersion: string;
    lastActive: number;
    status: 'AUTHORIZED' | 'REVOKED';
    ownerEmail: string;
}

// Phase 5: Predictive Analytics
export interface HeatmapPoint {
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  intensity: number; // 0-1
}

export interface PredictiveInsight {
  id: string;
  type: 'LOITERING' | 'CROWD_SURGE' | 'UNUSUAL_ACCESS';
  location: string;
  probability: number; // 0-100
  timeWindow: string; // e.g. "02:00 - 04:00"
  description: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface SecurityReport {
  id: string;
  title: string;
  generatedAt: number;
  type: 'WEEKLY_SUMMARY' | 'INCIDENT_REPORT' | 'ACCESS_AUDIT';
  status: 'READY' | 'GENERATING';
  downloadUrl?: string;
}