# IntentConnect — System Architecture

## Overview

IntentConnect is a purpose-driven connection platform. Users choose a single intent and are matched
with others who share compatible intent, location, and interests. It is NOT a swipe-based dating app.

---

## System Components

```
┌─────────────────────────────────────────────────────────┐
│                      Cloudflare CDN                      │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
   ┌──────▼──────┐               ┌──────▼──────┐
   │  React SPA  │               │  Rails API  │
   │  (Vite)     │               │  (port 3000)│
   └─────────────┘               └──────┬──────┘
                                        │
              ┌─────────────────────────┼──────────────────┐
              │                         │                  │
       ┌──────▼──────┐          ┌───────▼──────┐   ┌──────▼──────┐
       │  PostgreSQL │          │    Redis     │   │     S3      │
       │  (primary)  │          │  (sessions,  │   │  (avatars,  │
       └─────────────┘          │   jobs,      │   │   selfies)  │
                                │   ActionCable│   └─────────────┘
                                └──────┬───────┘
                                       │
                                ┌──────▼──────┐
                                │   Sidekiq   │
                                │  (workers)  │
                                └─────────────┘
```

---

## Tech Stack

| Layer          | Technology                      | Why                                    |
|----------------|---------------------------------|----------------------------------------|
| API            | Rails 8 (API mode)              | Mature, fast to build, excellent gems  |
| Database       | PostgreSQL 16                   | JSON fields, full-text search, reliable|
| Cache / PubSub | Redis 7                         | ActionCable, Sidekiq queues            |
| Background     | Sidekiq 7                       | OTP expiry, notifications, matches     |
| Auth           | JWT + Devise                    | Stateless API tokens                   |
| File Storage   | S3 (via ActiveStorage)          | Avatars, selfie verification           |
| WebSockets     | ActionCable over Redis          | Real-time messaging                    |
| Frontend       | React 18 + Vite                 | Fast dev cycle, SPA                    |
| Styling        | TailwindCSS 3                   | Utility-first, consistent design       |
| State          | Zustand                         | Lightweight, no boilerplate            |
| Data Fetching  | React Query (TanStack)          | Caching, background refetch            |
| CDN            | Cloudflare                      | DDoS protection, media caching         |
| Container      | Docker + Docker Compose         | Local parity, AWS ECS ready            |

---

## Security Architecture

- Phone OTP verification on signup (Twilio / MSG91)
- Selfie upload for human verification (manual review in MVP)
- JWT tokens with 24h expiry + refresh token rotation
- All media served via signed S3 URLs (not public)
- Block / Report system at DB level
- Rate limiting on auth endpoints (Rack::Attack)
- Admin-only suspension endpoints with audit trail

---

## Data Flow: Match Discovery

```
User requests /profiles/suggestions
        │
        ▼
UserMatcherService.call(current_user)
        │
        ├─ Filter: same city
        ├─ Filter: compatible intent
        ├─ Filter: not already connected / blocked
        ├─ Score: shared interests (+20 each, max 40)
        ├─ Score: age proximity (+10 if within 5y)
        ├─ Sort by score DESC
        └─ Return top 10, cached in Redis for 24h
```

---

## Data Flow: Messaging

```
User A sends message
        │
        ▼
POST /messages  (REST, persists to DB)
        │
        ▼
ActionCable broadcasts to channel "conversation_#{connection_id}"
        │
        ▼
User B's frontend receives via WebSocket subscription
        │
        ▼
Sidekiq job: NotificationJob → push notification / in-app alert
```

---

## Deployment Target (AWS)

```
Route53 → Cloudflare → ALB
                         │
               ┌─────────┴────────┐
               │                  │
        ECS (Rails)         ECS (Sidekiq)
               │
        RDS (PostgreSQL)
        ElastiCache (Redis)
        S3 (media)
```

---

## MVP Scope Boundaries

**In scope:**
- Phone + email signup with OTP
- Profile with intent selection
- Selfie verification (upload only, manual admin review)
- Daily match suggestions (10/day)
- Connection request → accept/reject
- Text messaging (post-connection only)
- Activity groups (create / join)
- Block, report, hide profile
- Push / in-app notifications
- Admin: suspend, review reports

**Out of scope (post-MVP):**
- AI/ML matching
- Video calls
- Events marketplace
- Advanced ML moderation
- Mobile native app (use PWA first)
