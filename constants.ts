export const APP_NAME = "SentinelAI";
export const API_BASE_URL = "http://localhost:8080/api/v1"; // Placeholder for real backend

// Using LocalStorage keys for the 'Simulated' persistence layer in this specific frontend artifact
// In production, these would be handled via secure HttpOnly cookies and backend databases.
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'sentinel_auth_token',
  USER: 'sentinel_user',
  STREAMS: 'sentinel_streams',
  ALERTS: 'sentinel_alerts'
};
