# Deployment Guide

## Local Development

```bash
# 1. Clone and enter project
cd intent-dating-mvp

# 2. Copy env file
cp .env.example .env
# Fill in POSTGRES_PASSWORD, SECRET_KEY_BASE, Twilio keys, AWS keys

# 3. Start all services
cd infra && docker compose up -d

# 4. Run migrations
docker compose exec api bundle exec rails db:create db:migrate

# 5. Access
#   API:      http://localhost:3000
#   Frontend: http://localhost:8080
```

## AWS Production Setup

### Services used:
| Service        | Purpose                          |
|----------------|----------------------------------|
| ECS Fargate    | Rails API container              |
| ECS Fargate    | Sidekiq worker container         |
| RDS PostgreSQL | Managed database                 |
| ElastiCache    | Managed Redis                    |
| S3             | Media storage                    |
| ALB            | Load balancer / SSL termination  |
| CloudFront     | CDN for frontend + media         |
| ACM            | Free SSL certificates            |
| Route53        | DNS                              |
| ECR            | Docker image registry            |

### Minimal deployment steps:

**1. Push images to ECR**
```bash
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin <ACCOUNT>.dkr.ecr.ap-south-1.amazonaws.com

docker build -t intentconnect-api ./backend
docker tag intentconnect-api:latest <ECR_URI>/intentconnect-api:latest
docker push <ECR_URI>/intentconnect-api:latest
```

**2. Create RDS (PostgreSQL 16)**
```
Engine: PostgreSQL 16
Instance: db.t3.micro (MVP)
Storage: 20 GB gp3
Multi-AZ: No (enable post-launch)
```

**3. Create ElastiCache (Redis)**
```
Engine: Redis 7
Node type: cache.t3.micro
```

**4. Create ECS Task Definitions**
- API task: 512 CPU / 1024 MB RAM
- Sidekiq task: 256 CPU / 512 MB RAM

**5. Create ECS Services behind ALB**

**6. Deploy frontend to S3 + CloudFront**
```bash
cd frontend && npm run build
aws s3 sync dist/ s3://intentconnect-web --delete
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```

## Environment Variables (Production)

```
RAILS_ENV=production
DATABASE_URL=postgres://...rds.amazonaws.com/intentconnect_production
REDIS_URL=redis://...cache.amazonaws.com:6379/0
SECRET_KEY_BASE=<64 char hex>
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
S3_BUCKET=intentconnect-media
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
RAILS_LOG_TO_STDOUT=true
FORCE_SSL=true
```

## CI/CD (GitHub Actions skeleton)

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and push to ECR
        run: |
          aws ecr get-login-password | docker login ...
          docker build -t api ./backend
          docker push <ECR_URI>/api:${{ github.sha }}
      - name: Update ECS service
        run: |
          aws ecs update-service --cluster intentconnect \
            --service api --force-new-deployment
```
