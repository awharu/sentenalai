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