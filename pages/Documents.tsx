import React, { useState } from 'react';
import { FileText, Map, Code, DollarSign, ChevronRight } from 'lucide-react';

// Content Mirrors (To ensure runtime availability in preview without build steps)
const CONTENT = {
  roadmap: `# SentinelAI Product Roadmap 2024-2025

## Vision
To become the global standard for AI-native Video Management Systems (VMS), transforming passive surveillance into proactive security intelligence.

## Phase 1: Foundation & Core Stability (Q2 2024) - [COMPLETED]
**Focus:** Infrastructure, Multi-tenancy, and Basic Streaming.

- [x] **Core Architecture:** React 19 + TypeScript frontend with secure JWT authentication.
- [x] **Multi-Tenancy:** Row-Level Security (RLS) implementation in Postgres.
- [x] **Video Pipeline:** HLS playback support for standard IP Cameras.
- [x] **Basic AI:** On-demand frame analysis using Gemini 2.5 Flash.
- [x] **Admin Portal:** Tenant management and user role provisioning.

## Phase 2: Real-Time Intelligence & Latency (Q3 2024) - [COMPLETED]
**Focus:** Reducing latency and automating detection.

- [x] **WebRTC Transition:** Migrate from HLS to WebRTC using \`go2rtc\` for sub-500ms latency. (Complete in Phase 4)
- [x] **Automated Inference Loop:** Background workers to process keyframes every 5-10 seconds automatically. (Implemented via Auto-Guard)
- [x] **Notification Engine:** Webhooks for Slack/Microsoft Teams integration on CRITICAL alerts.
- [x] **Edge Connectivity:** MQTT Broker setup for handling IoT triggers (Door sensors, Motion detectors).

## Phase 3: Advanced Computer Vision (Q4 2024) - [COMPLETED]
**Focus:** Specialized AI tasks and Search.

- [x] **Vector Search:** Implement \`pgvector\` to allow natural language search of video archives (e.g., "Show me a red truck from yesterday").
- [x] **Facial Recognition:** Authorized personnel white-listing vs. Unknown threat detection.
- [x] **License Plate Recognition (LPR):** Specialized model pipeline for vehicle access control with Gatehouse Dashboard.
- [x] **Geospatial View:** Map-based camera navigation for large campuses and multi-site zones.

## Phase 4: Enterprise & Compliance (Q1 2025) - [COMPLETED]
**Focus:** Governance, Security, and Scale.

- [x] **Compliance Dashboard:** SOC2 Type II readiness checks and HIPAA compliance status.
- [x] **Audit Logs:** Immutable cryptographic logs for all operator actions (Chain of Custody).
- [x] **SSO Integration:** SAML/OIDC support for Enterprise clients (Okta, Azure AD).
- [x] **Mobile App:** Device pairing, MDM authorization, and App Store landing page.
- [x] **WebRTC Streaming Engine:** Ultra-low latency playback (< 500ms) with WHEP support.

## Phase 5: Predictive Security & Analytics (Q2 2025) - [IN PROGRESS]
**Focus:** Data-driven insights and forecasting.

- [x] **Heatmaps:** Crowd density and dwelling time visualization on Geospatial maps.
- [x] **Anomaly Detection:** Behavioral analysis to predict incidents before they happen (e.g., loitering patterns).
- [x] **Reporting Suite:** Automated PDF reports for weekly security summaries.`,

  blueprint: `# SentinelAI Technical Blueprint v2.1

## 1. System Architecture
SentinelAI utilizes a **Hybrid Microservices Architecture** to separate high-throughput video processing from standard CRUD management operations.

### High-Level Components
1.  **Client Layer:** React 19 SPA (Single Page Application).
2.  **API Gateway:** NGINX / Traefik (Load Balancing, SSL Termination).
3.  **Management Service (Node.js/NestJS):** Handles Auth, Tenants, Billing, and Metadata.
4.  **Transcoding Engine (MediaMTX + FFmpeg):** Dynamic container orchestration for RTSP ingestion.
5.  **AI Worker (Python/FastAPI):** Consumes frame queues and interfaces with Google Gemini API.

## 2. Video Pipeline Architecture

### A. RTSP Transcoding (The "Provisioning" Layer)
Browsers cannot natively play RTSP streams. We utilize a Just-in-Time (JIT) provisioning system.

1.  **Ingest:** User provides \`rtsp://user:pass@ip:554/stream\`.
2.  **Provisioning:** The backend spins up an ephemeral Docker container running **MediaMTX**.
3.  **Transcoding:** 
    *   **Input:** Raw RTSP (H.264/H.265).
    *   **Process:** FFmpeg sidecar converts stream to HLS (m3u8) segments (.ts).
    *   **Latency:** Tuned for Low-Latency HLS (LL-HLS) with 2s segment sizes.
4.  **Delivery:** 
    *   HLS Manifests and Segments are written to an ephemeral RAM disk or S3-compatible MinIO bucket.
    *   Nginx serves these static assets to the frontend.

### B. AI Inference (Async Path)
1.  \`Video Engine\` extracts keyframe (JPEG) every N seconds via FFmpeg snapshot.
2.  Pushes image to \`Message Queue\` (RabbitMQ/Redis).
3.  \`AI Worker\` pulls image -> Calls \`Gemini 2.5 Flash\`.
4.  Result parsed -> If Threat > Medium -> Stored in \`Postgres\` & Pushed via \`WebSocket\` to Client.

## 3. Technology Stack

### Frontend
-   **Framework:** React 19
-   **State:** Zustand (Global), React Query (Server)
-   **UI:** Tailwind CSS, Lucide Icons
-   **Player:** HLS.js with fallback to native video element.

### Backend & Infrastructure
-   **API:** Node.js (TypeScript)
-   **Database:** PostgreSQL 16 (with RLS for Tenant Isolation)
-   **Video Engine:** MediaMTX (RTSP Server) + FFmpeg
-   **Vector DB:** pgvector (for Face Embeddings)
-   **Storage:** AWS S3 (Video Archives)

## 4. Security Model
-   **Stream Obfuscation:** Transcoded HLS URLs are signed short-lived tokens, preventing unauthorized hotlinking.
-   **Tenant Isolation:** Enforced at the database level via Postgres Row-Level Security policies.
-   **Data Privacy:** All video data encrypted at rest (AES-256).

## 5. Deployment Strategy
-   **Containerization:** Docker Multi-stage builds.
-   **Orchestration:** Kubernetes (EKS/GKE).
-   **Scaling:** KEDA scalers based on active stream count.`,

  api: `# SentinelAI API Specification v1.1

**Base URL:** \`https://api.sentinel.ai/v1\`
**Content-Type:** \`application/json\`

## Authentication
**Header:** \`Authorization: Bearer <access_token>\`

### 1. Login
\`POST /auth/login\`
**Request:**
\`\`\`json
{
  "email": "admin@corp.com",
  "password": "secure_password"
}
\`\`\`

---

## Streams & Transcoding

### 2. Provision Transcoder
*Initiates a background job to connect to an RTSP source and begin transcoding.*

\`POST /streams/provision\`

**Request:**
\`\`\`json
{
  "rtspUrl": "rtsp://admin:1234@192.168.1.50:554/h264",
  "latencyMode": "LOW_LATENCY", // Optional: "STANDARD" (HLS) or "LOW_LATENCY" (WebRTC)
  "persistent": true
}
\`\`\`

**Response (202 Accepted):**
\`\`\`json
{
  "streamId": "str_888",
  "status": "provisioning",
  "playbackUrl": "http://stream.sentinel.ai/stream/whep",
  "estimatedReadyTimeMs": 2500
}
\`\`\`

### 3. List Streams
\`GET /streams\`
**Query Params:** \`?status=online&limit=10\`
**Response:**
\`\`\`json
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
\`\`\`

---

## Intelligence

### 5. Analyze Frame (Manual Trigger)
\`POST /ai/analyze\`
**Request:**
\`\`\`json
{
  "streamId": "str_555",
  "imageData": "data:image/jpeg;base64,/9j/4AAQSk..."
}
\`\`\`
**Response:**
\`\`\`json
{
  "threatLevel": "HIGH",
  "detectedObjects": ["Person", "Crowbar"],
  "description": "Individual detected attempting forced entry.",
  "timestamp": 1625244000
}
\`\`\`

### 6. Get Alerts
\`GET /alerts\`
**Query Params:** \`?severity=HIGH\`
**Response:**
\`\`\`json
[
  {
    "id": "alt_999",
    "type": "UNAUTHORIZED",
    "severity": "HIGH",
    "description": "Unrecognized face in restricted area",
    "thumbnailUrl": "https://s3.bucket..."
  }
]
\`\`\``,

  sales: `# SentinelAI: The Future of Security

## Executive Summary
Security isn't about watching screens—it's about actionable intelligence. SentinelAI transforms your existing camera infrastructure into a proactive security guard that never sleeps, blinks, or gets tired.

## The Problem
- **Human Error:** Security operators miss 95% of screen activity after just 20 minutes of monitoring.
- **High Costs:** 24/7 human guarding is expensive and unscalable.
- **Reactive:** Traditional CCTV is only useful *after* a crime has occurred.

## The SentinelAI Solution
We use state-of-the-art Generative AI (Gemini 2.5) to analyze video feeds in real-time.
1.  **Instant Detection:** Identifies weapons, fights, or unauthorized access instantly.
2.  **Natural Language Search:** "Find the man in the red jacket from 2 PM."
3.  **Hardware Agnostic:** Works with the IP cameras you already own.

## Pricing Tiers

### Starter ($19/camera/mo)
*Perfect for small retail and offices.*
- 7-Day Cloud Retention
- Basic Motion Detection
- Mobile App Access
- 5 User Accounts

### Professional ($49/camera/mo)
*For warehouses, factories, and corporate campuses.*
- 30-Day Cloud Retention
- **AI Threat Detection** (Person/Vehicle)
- License Plate Recognition
- API Access
- Priority Support

### Enterprise (Custom)
*For government, airports, and city surveillance.*
- Unlimited Retention
- Facial Recognition & Watchlist
- On-Premise / Hybrid Deployment
- SSO & Audit Logs
- Dedicated Success Manager

## Contact Sales
Ready to upgrade your security?
Email: sales@sentinel.ai
Phone: +1 (888) 555-0199`
};

const DOC_METADATA = {
  roadmap: { title: "Product Roadmap", icon: Map },
  blueprint: { title: "Technical Blueprint", icon: Code },
  api: { title: "API Specifications", icon: FileText },
  sales: { title: "Sales Literature", icon: DollarSign }
};

export default function Documents() {
  const [activeDoc, setActiveDoc] = useState<keyof typeof CONTENT>('roadmap');

  return (
    <div className="flex h-full bg-slate-950 text-slate-300">
      {/* Doc Sidebar */}
      <div className="w-64 border-r border-slate-800 bg-slate-900 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white">Documentation</h1>
          <p className="text-xs text-slate-500 mt-1">Project Resources</p>
        </div>
        <div className="flex-1 p-4 space-y-1">
          {(Object.keys(CONTENT) as Array<keyof typeof CONTENT>).map((key) => {
            const Icon = DOC_METADATA[key].icon;
            const isActive = activeDoc === key;
            return (
              <button
                key={key}
                onClick={() => setActiveDoc(key)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{DOC_METADATA[key].title}</span>
                </div>
                {isActive && <ChevronRight size={14} />}
              </button>
            );
          })}
        </div>
        <div className="p-4 border-t border-slate-800">
            <div className="text-[10px] text-slate-500 text-center">
                Last Updated: {new Date().toLocaleDateString()}
            </div>
        </div>
      </div>

      {/* Content Viewer */}
      <div className="flex-1 overflow-y-auto bg-slate-950 p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-300">
                {CONTENT[activeDoc]}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}