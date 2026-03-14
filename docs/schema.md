# IntentConnect — Database Schema Reference

## Entity Relationship Summary

```
users ──────────────── profiles           (1:1)
users ──────────────── connections        (requester / receiver)
connections ────────── messages           (1:many)
users ──────────────── group_memberships  (many:many via groups)
users ──────────────── notifications      (1:many)
users ──────────────── blocks             (blocker / blocked)
users ──────────────── reports            (reporter / reported)
```

## Table: users

| Column           | Type      | Notes                                      |
|------------------|-----------|--------------------------------------------|
| id               | bigint PK |                                            |
| email            | string    | unique, not null                           |
| phone            | string    | unique, not null                           |
| password_digest  | string    | bcrypt via has_secure_password             |
| role             | string    | member \| admin                            |
| status           | string    | pending \| active \| suspended \| deleted  |
| phone_verified   | boolean   | default false                              |
| selfie_verified  | boolean   | default false                              |
| otp_code         | string    | 6-digit, stored hashed                     |
| otp_expires_at   | datetime  | 10 minute TTL                              |
| refresh_token    | string    | for JWT rotation                           |
| last_active_at   | datetime  |                                            |

## Table: profiles

| Column      | Type    | Notes                                                    |
|-------------|---------|----------------------------------------------------------|
| user_id     | bigint  | FK → users, unique                                       |
| name        | string  |                                                          |
| age         | integer |                                                          |
| gender      | string  | male \| female \| non_binary \| prefer_not_to_say        |
| city        | string  | indexed                                                  |
| occupation  | string  |                                                          |
| bio         | text    |                                                          |
| intent      | string  | friendship \| activity_partner \| networking \| ...      |
| interests   | jsonb   | array of strings, GIN indexed                            |
| hidden      | boolean | hides from discovery                                     |
| avatar_key  | string  | S3 key                                                   |
| selfie_key  | string  | S3 key (for verification review)                         |

## Table: connections

| Column       | Type    | Notes                              |
|--------------|---------|------------------------------------|
| requester_id | bigint  | FK → users                         |
| receiver_id  | bigint  | FK → users                         |
| status       | string  | pending \| accepted \| rejected    |

Unique index on (requester_id, receiver_id).

## Table: messages

| Column        | Type    | Notes                          |
|---------------|---------|--------------------------------|
| connection_id | bigint  | FK → connections               |
| sender_id     | bigint  | FK → users                     |
| body          | text    |                                |
| read          | boolean | default false                  |

## Table: groups

| Column      | Type    | Notes                      |
|-------------|---------|----------------------------|
| creator_id  | bigint  | FK → users                 |
| title       | string  |                            |
| description | text    |                            |
| city        | string  | indexed                    |
| max_members | integer | default 20                 |
| status      | string  | active \| archived         |

## Table: group_memberships

| Column   | Type   | Notes                   |
|----------|--------|-------------------------|
| group_id | bigint | FK → groups             |
| user_id  | bigint | FK → users              |
| role     | string | member \| admin         |

Unique index on (group_id, user_id).

## Table: reports

| Column        | Type     | Notes                                              |
|---------------|----------|----------------------------------------------------|
| reporter_id   | bigint   | FK → users                                         |
| reported_id   | bigint   | FK → users                                         |
| reason        | string   | harassment \| fake_profile \| inappropriate \| ... |
| details       | text     |                                                    |
| status        | string   | open \| reviewed \| dismissed                      |
| reviewed_by   | bigint   | FK → users (admin)                                 |
| reviewed_at   | datetime |                                                    |

## Table: blocks

| Column     | Type   | Notes          |
|------------|--------|----------------|
| blocker_id | bigint | FK → users     |
| blocked_id | bigint | FK → users     |

Unique index on (blocker_id, blocked_id).

## Table: notifications

| Column   | Type    | Notes                                          |
|----------|---------|------------------------------------------------|
| user_id  | bigint  | FK → users                                     |
| kind     | string  | connection_request \| message \| group_invite  |
| title    | string  |                                                |
| body     | text    |                                                |
| metadata | jsonb   | arbitrary payload (connection_id, sender, etc) |
| read     | boolean | default false                                  |
