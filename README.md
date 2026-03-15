# IntentConnect MVP

Connect people based on **intent**, not swipes.

## Project Structure

```
intent-dating-mvp/
├── backend/                  Rails 8 API
│   ├── app/
│   │   ├── channels/         ActionCable (ConversationChannel, NotificationsChannel)
│   │   ├── controllers/api/v1/
│   │   │   ├── auth_controller.rb
│   │   │   ├── profiles_controller.rb
│   │   │   ├── connections_controller.rb
│   │   │   ├── messages_controller.rb
│   │   │   ├── groups_controller.rb
│   │   │   ├── safety_controller.rb
│   │   │   ├── notifications_controller.rb
│   │   │   └── admin/reports_controller.rb
│   │   ├── models/           users, profiles, connections, messages, groups...
│   │   ├── services/         Auth::SignupService, Auth::TokenService, UserMatcherService
│   │   ├── jobs/             OtpDeliveryJob, NotificationJob, MatchCacheWarmupJob
│   │   └── serializers/      JSONAPI serializers for all resources
│   ├── config/routes.rb
│   ├── db/migrate/           9 migrations (users → notifications)
│   └── Dockerfile
│
├── frontend/                 React 18 + Vite + TailwindCSS
│   ├── src/
│   │   ├── App.tsx           Router + auth guard
│   │   ├── pages/            Signup, Onboarding, Discover, ...
│   │   ├── components/shared/ UserCard, IntentBadge, ChatWindow, ReportModal
│   │   ├── store/            Zustand (authStore)
│   │   ├── services/         Axios service layer
│   │   ├── hooks/            useActionCable (WebSocket)
│   │   └── lib/api.ts        Axios instance + JWT refresh interceptor
│   └── Dockerfile
│
├── infra/
│   └── docker-compose.yml    db + redis + api + sidekiq + web
│
├── docs/
│   ├── architecture.md
│   ├── schema.md
│   ├── deployment.md
│   └── growth_and_retention.md
│
└── .env.example
```

## Quick Start

```bash
cp .env.example .env
# Edit .env with your credentials

cd infra && docker compose up -d
docker compose exec api bundle exec rails db:create db:migrate
```

- API: http://localhost:3000
- Frontend: http://localhost:8080
- Sidekiq web: http://localhost:3000/sidekiq (admin only)

## API Summary

```
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
POST   /api/v1/auth/verify_otp
POST   /api/v1/auth/refresh

GET    /api/v1/profiles/suggestions
GET    /api/v1/profiles/:id
POST   /api/v1/profiles
PATCH  /api/v1/profiles/me

GET    /api/v1/connections
GET    /api/v1/connections/requests
POST   /api/v1/connections
POST   /api/v1/connections/:id/accept
POST   /api/v1/connections/:id/reject

GET    /api/v1/messages/:connection_id
POST   /api/v1/messages

GET    /api/v1/groups
POST   /api/v1/groups
POST   /api/v1/groups/:id/join

POST   /api/v1/reports
POST   /api/v1/blocks

GET    /api/v1/notifications
PATCH  /api/v1/notifications/read_all

PATCH  /api/v1/admin/users/:id/suspend
```

## Matching Algorithm

`UserMatcherService` scores candidates:

| Signal           | Points |
|------------------|--------|
| Same city        | +40    |
| Compatible intent| +30    |
| Shared interests | +5 each (max +40) |
| Age within 5y    | +10    |

Returns top 10 per day, cached in Redis for 24h. Refreshed nightly by `MatchCacheWarmupJob`.
