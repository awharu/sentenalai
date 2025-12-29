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

## Phase 2: Real-Time Intelligence & Latency (Q3 2024) - [IN PROGRESS]
**Focus:** Reducing latency and automating detection.

- [ ] **WebRTC Transition:** Migrate from HLS to WebRTC using `go2rtc` for sub-500ms latency.
- [x] **Automated Inference Loop:** Background workers to process keyframes every 5-10 seconds automatically. (Implemented via Auto-Guard)
- [x] **Notification Engine:** Webhooks for Slack/Microsoft Teams integration on CRITICAL alerts.
- [ ] **Edge Connectivity:** MQTT Broker setup for handling IoT triggers (door sensors, motion detectors).

## Phase 3: Advanced Computer Vision (Q4 2024)
**Focus:** Specialized AI tasks and Search.

- [ ] **Vector Search:** Implement `pgvector` to allow natural language search of video archives (e.g., "Show me a red truck from yesterday").
- [ ] **Facial Recognition:** Authorized personnel white-listing vs. Unknown threat detection.
- [ ] **License Plate Recognition (LPR):** Specialized model pipeline for vehicle access control.
- [ ] **Geospatial View:** Map-based camera navigation for large campuses.

## Phase 4: Enterprise & Compliance (Q1 2025)
**Focus:** Governance, Security, and Scale.

- [ ] **Compliance:** SOC2 Type II readiness and HIPAA compliance features for healthcare tenants.
- [ ] **Audit Logs:** Immutable blockchain-backed logs for all operator actions (Chain of Custody).
- [ ] **SSO Integration:** SAML/OIDC support for Enterprise clients (Okta, Azure AD).
- [ ] **Mobile App:** Native React Native application for field security guards.