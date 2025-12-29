# SentinelAI Product Roadmap 2024-2025

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

- [x] **WebRTC Transition:** Migrate from HLS to WebRTC using `go2rtc` for sub-500ms latency. (Complete in Phase 4)
- [x] **Automated Inference Loop:** Background workers to process keyframes every 5-10 seconds automatically. (Implemented via Auto-Guard)
- [x] **Notification Engine:** Webhooks for Slack/Microsoft Teams integration on CRITICAL alerts.
- [x] **Edge Connectivity:** MQTT Broker setup for handling IoT triggers (Door sensors, Motion detectors).

## Phase 3: Advanced Computer Vision (Q4 2024) - [COMPLETED]
**Focus:** Specialized AI tasks and Search.

- [x] **Vector Search:** Implement `pgvector` to allow natural language search of video archives (e.g., "Show me a red truck from yesterday").
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
- [x] **Reporting Suite:** Automated PDF reports for weekly security summaries.