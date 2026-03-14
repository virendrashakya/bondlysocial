# IntentConnect MVP — Project Memory

## What was built
Full MVP scaffold for IntentConnect — a purpose-driven connection platform.
All files are production-quality scaffolds, not pseudocode.

## Key paths
- Architecture doc: docs/architecture.md
- DB schema doc: docs/schema.md
- Deployment guide: docs/deployment.md
- Growth playbook: docs/growth_and_retention.md
- Rails API: backend/
- React frontend: frontend/
- Docker: infra/docker-compose.yml

## Tech stack
- Rails 8 API-only, PostgreSQL 16, Redis 7, Sidekiq 7
- JWT auth (Auth::TokenService), bcrypt passwords
- ActionCable for WebSocket messaging + notifications
- ActiveStorage + S3 for avatars/selfies
- React 18 + Vite, TailwindCSS, Zustand, React Query, React Hook Form + Zod

## Key architectural decisions
- JWT access token (24h) + refresh token (30d) rotation
- OTP verified before any access (phone_verified flag on users)
- Selfie upload stored in S3 for manual admin review in MVP
- Matching: UserMatcherService scores by city+intent+interests+age, cached in Redis 24h
- Intent compatibility map in Profile::COMPATIBLE_INTENTS (e.g. serious_relationship matches marriage)
- Block system destroys existing connections automatically
- Rack::Attack rate limits on auth endpoints
- Admin controllers require admin role check via require_admin! before_action

## User flow
signup → OTP verify → profile create (3-step onboarding) → discover → connect → chat

## Intents supported
friendship, activity_partner, networking, emotional_support, serious_relationship, marriage

## DB tables
users, profiles, connections, messages, groups, group_memberships, reports, blocks, notifications
