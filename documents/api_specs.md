# SentinelAI API Specification v1.1

**Base URL:** `https://api.sentinel.ai/v1`
**Content-Type:** `application/json`

## Authentication
**Header:** `Authorization: Bearer <access_token>`

### 1. Login
`POST /auth/login`
**Request:**
```json
{
  "email": "admin@corp.com",
  "password": "secure_password"
}
```
**Response (200 OK):**
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "usr_123",
    "role": "ADMIN",
    "tenantId": "tnt_abc"
  }
}
```

---

## Streams & Transcoding

### 2. Provision Transcoder
*Initiates a background job to connect to an RTSP source and begin transcoding.*

`POST /streams/provision`

**Request:**
```json
{
  "rtspUrl": "rtsp://admin:1234@192.168.1.50:554/h264",
  "latencyMode": "LOW_LATENCY", // Optional: "STANDARD" (HLS) or "LOW_LATENCY" (WebRTC)
  "persistent": true
}
```

**Response (202 Accepted):**
```json
{
  "streamId": "str_888",
  "status": "provisioning",
  "playbackUrl": "http://stream.sentinel.ai/stream/whep",
  "estimatedReadyTimeMs": 2500
}
```

### 3. List Streams
`GET /streams`
**Query Params:** `?status=online&limit=10`
**Response:**
```json
[
  {
    "id": "str_555",
    "name": "Main Lobby",
    "status": "online",
    "url": "https://stream.sentinel.ai/hls/str_555/index.m3u8",
    "latencyMode": "STANDARD",
    "location": "Building A"
  }
]
```

### 4. Register Camera (Legacy)
`POST /streams`
**Request:**
```json
{
  "name": "Back Door",
  "rtspUrl": "rtsp://admin:pass@192.168.1.50:554/stream1",
  "location": "Warehouse"
}
```

---

## Intelligence

### 5. Analyze Frame (Manual Trigger)
`POST /ai/analyze`
**Request:**
```json
{
  "streamId": "str_555",
  "imageData": "data:image/jpeg;base64,/9j/4AAQSk..."
}
```
**Response:**
```json
{
  "threatLevel": "HIGH",
  "detectedObjects": ["Person", "Crowbar"],
  "description": "Individual detected attempting forced entry.",
  "timestamp": 1625244000
}
```

### 6. Get Alerts
`GET /alerts`
**Query Params:** `?severity=HIGH`
**Response:**
```json
[
  {
    "id": "alt_999",
    "type": "UNAUTHORIZED",
    "severity": "HIGH",
    "description": "Unrecognized face in restricted area",
    "thumbnailUrl": "https://s3.bucket..."
  }
]
```