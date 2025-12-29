# SentinelAI Technical Blueprint v2.1

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

1.  **Ingest:** User provides `rtsp://user:pass@ip:554/stream`.
2.  **Provisioning:** The backend spins up an ephemeral Docker container running **MediaMTX**.
3.  **Transcoding:** 
    *   **Input:** Raw RTSP (H.264/H.265).
    *   **Process:** FFmpeg sidecar converts stream to HLS (m3u8) segments (.ts).
    *   **Latency:** Tuned for Low-Latency HLS (LL-HLS) with 2s segment sizes.
4.  **Delivery:** 
    *   HLS Manifests and Segments are written to an ephemeral RAM disk or S3-compatible MinIO bucket.
    *   Nginx serves these static assets to the frontend.

### B. AI Inference (Async Path)
1.  `Video Engine` extracts keyframe (JPEG) every N seconds via FFmpeg snapshot.
2.  Pushes image to `Message Queue` (RabbitMQ/Redis).
3.  `AI Worker` pulls image -> Calls `Gemini 2.5 Flash`.
4.  Result parsed -> If Threat > Medium -> Stored in `Postgres` & Pushed via `WebSocket` to Client.

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
    *   `CREATE POLICY tenant_isolation ON streams USING (tenant_id = current_setting('app.current_tenant'));`
-   **Data Privacy:** All video data encrypted at rest (AES-256).

## 5. Deployment Strategy
-   **Containerization:** Docker Multi-stage builds.
-   **Orchestration:** Kubernetes (EKS/GKE).
-   **Scaling:** KEDA scalers based on active stream count.