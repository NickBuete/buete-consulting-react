# AWS Deployment Guide for Buete Consulting React App

## Architecture Overview

### Recommended AWS Services

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────┐      ┌──────────────────┐                  │
│  │   CloudFront   │──────│   S3 Bucket      │ (Frontend)       │
│  │   (CDN)        │      │   React Build    │                   │
│  └────────┬───────┘      └──────────────────┘                   │
│           │                                                       │
│           │ HTTPS                                                │
│           │                                                       │
│  ┌────────▼───────────────────────────────────────────┐         │
│  │   API Gateway (REST API)                            │         │
│  │   - Custom domain                                   │         │
│  │   - Rate limiting                                   │         │
│  │   - Request validation                              │         │
│  └────────┬────────────────────────────────────────────┘         │
│           │                                                       │
│           │                                                       │
│  ┌────────▼───────────────────────────────────────────┐         │
│  │   Application Load Balancer (ALB)                   │         │
│  │   - Health checks                                   │         │
│  │   - SSL termination                                 │         │
│  └────────┬────────────────────────────────────────────┘         │
│           │                                                       │
│           │                                                       │
│  ┌────────▼───────────────────────────────────────────┐         │
│  │   ECS Fargate (Backend)                             │         │
│  │   - Express + Node.js                               │         │
│  │   - Auto-scaling (2-10 tasks)                       │         │
│  │   - Private subnet                                  │         │
│  └────────┬────────────────────────────────────────────┘         │
│           │                                                       │
│           │                                                       │
│  ┌────────▼───────────────────────────────────────────┐         │
│  │   RDS PostgreSQL                                    │         │
│  │   - Multi-AZ deployment                             │         │
│  │   - Automated backups                               │         │
│  │   - Read replicas (optional)                        │         │
│  │   - Private subnet                                  │         │
│  └─────────────────────────────────────────────────────┘         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │   AWS Bedrock (Claude 3.5 Sonnet)                    │       │
│  │   - Already integrated                                │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │   Secrets Manager                                     │       │
│  │   - DATABASE_URL                                      │       │
│  │   - JWT_SECRET                                        │       │
│  │   - AWS credentials                                   │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │   CloudWatch                                          │       │
│  │   - Logs aggregation                                  │       │
│  │   - Metrics & alarms                                  │       │
│  │   - Performance monitoring                            │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Cost-Optimized Alternative (Startup/MVP)

For a more cost-effective deployment:

```
Frontend: S3 + CloudFront ($5-20/month)
Backend: Lightsail Container (512MB-1GB) ($10-20/month)
Database: RDS PostgreSQL (t4g.micro) ($15-25/month)
Total: ~$30-65/month
```

---

## Deployment Checklist

### Phase 1: Pre-Deployment Preparation

#### 1.1 Environment Configuration

Create environment variable templates:

**Backend (.env.example):**

```env
# Database
DATABASE_URL=postgresql://username:password@hostname:5432/database_name

# Server
PORT=4000
NODE_ENV=production

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# AWS Bedrock
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
BEDROCK_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
BEDROCK_MAX_TOKENS=4096
BEDROCK_TEMPERATURE=0.3

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional: Error Tracking
SENTRY_DSN=https://your-sentry-dsn
```

**Frontend (.env.production):**

```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_VERSION=$npm_package_version
```

#### 1.2 Backend Modifications

**Update CORS configuration** (`server/src/app.ts`):

```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:5173',
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)
```

**Add health check endpoint** (`server/src/routes/healthRoutes.ts`):

```typescript
import { Router } from 'express'
import { prisma } from '../db/prisma'

const router = Router()

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version,
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Database connection failed',
    })
  }
})

router.get('/ready', async (req, res) => {
  try {
    // Check if server is ready to accept requests
    await prisma.$queryRaw`SELECT 1`
    res.status(200).send('OK')
  } catch (error) {
    res.status(503).send('Not Ready')
  }
})

export default router
```

#### 1.3 Add Dockerfile for Backend

**Create `server/Dockerfile`:**

```dockerfile
# Multi-stage build for optimal image size
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npm run prisma:generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run database migrations and start server
CMD ["sh", "-c", "npm run prisma:deploy && npm start"]
```

**Create `server/.dockerignore`:**

```
node_modules
dist
npm-debug.log
.env
.env.*
.git
.gitignore
*.md
coverage
.vscode
.idea
```

#### 1.4 Add Docker Compose for Local Testing

**Create `docker-compose.yml` in root:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: buete_consulting
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - '4000:4000'
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/buete_consulting
      JWT_SECRET: dev-jwt-secret-change-in-production
      NODE_ENV: production
      AWS_REGION: ${AWS_REGION}
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test:
        [
          'CMD',
          'node',
          '-e',
          "require('http').get('http://localhost:4000/api/health')",
        ]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
```

---

### Phase 2: AWS Infrastructure Setup

#### 2.1 Database Setup (RDS PostgreSQL)

**Option A: Production (RDS)**

1. **Create RDS PostgreSQL instance:**

   ```bash
   # Via AWS Console:
   - Engine: PostgreSQL 16.x
   - Template: Production (or Dev/Test for lower cost)
   - Instance class: db.t4g.micro (1 vCPU, 1GB RAM) - $13/month
   - Storage: 20GB gp3 SSD (auto-scaling enabled)
   - Multi-AZ: Yes (for high availability)
   - VPC: Create new or use existing
   - Public access: No
   - Automated backups: 7 days retention
   - Backup window: Off-peak hours
   - Maintenance window: Off-peak hours
   ```

2. **Security Group Configuration:**

   ```
   Inbound Rules:
   - PostgreSQL (5432) from ECS security group
   - PostgreSQL (5432) from your IP (for initial setup only)

   Outbound Rules:
   - All traffic (or specific to needs)
   ```

3. **Store credentials in AWS Secrets Manager:**
   ```bash
   aws secretsmanager create-secret \
     --name prod/buete-consulting/database \
     --description "Database credentials for Buete Consulting" \
     --secret-string '{
       "username": "dbadmin",
       "password": "GENERATE-STRONG-PASSWORD",
       "engine": "postgres",
       "host": "your-rds-endpoint.region.rds.amazonaws.com",
       "port": 5432,
       "dbname": "buete_consulting"
     }'
   ```

**Option B: Cost-Optimized (Aurora Serverless v2)**

For variable workloads with auto-scaling:

```
- Engine: Aurora PostgreSQL Serverless v2
- Min capacity: 0.5 ACU (~$43/month when running 24/7)
- Max capacity: 2 ACU
- Auto-pause: After 5 minutes of inactivity (dev only)
```

#### 2.2 Backend Setup (ECS Fargate)

**2.2.1 Create ECR Repository:**

```bash
aws ecr create-repository \
  --repository-name buete-consulting/backend \
  --region us-east-1

# Get login credentials
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

**2.2.2 Build and Push Docker Image:**

```bash
cd server

# Build
docker build -t buete-consulting/backend:latest .

# Tag for ECR
docker tag buete-consulting/backend:latest \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/buete-consulting/backend:latest

# Push
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/buete-consulting/backend:latest
```

**2.2.3 Create ECS Cluster:**

```bash
aws ecs create-cluster \
  --cluster-name buete-consulting-cluster \
  --region us-east-1
```

**2.2.4 Create Task Definition:**

Save as `server/ecs-task-definition.json`:

```json
{
  "family": "buete-consulting-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::<account-id>:role/buete-consulting-task-role",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/buete-consulting/backend:latest",
      "portMappings": [
        {
          "containerPort": 4000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "4000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:prod/buete-consulting/database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:prod/buete-consulting/jwt-secret"
        },
        {
          "name": "AWS_ACCESS_KEY_ID",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:prod/buete-consulting/aws-access-key"
        },
        {
          "name": "AWS_SECRET_ACCESS_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:prod/buete-consulting/aws-secret-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/buete-consulting-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:4000/api/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

**Register task definition:**

```bash
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json
```

**2.2.5 Create Application Load Balancer (ALB):**

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name buete-consulting-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx \
  --scheme internet-facing \
  --type application

# Create Target Group
aws elbv2 create-target-group \
  --name buete-consulting-backend-tg \
  --protocol HTTP \
  --port 4000 \
  --vpc-id vpc-xxx \
  --target-type ip \
  --health-check-path /api/health \
  --health-check-interval-seconds 30 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3

# Create Listener
aws elbv2 create-listener \
  --load-balancer-arn <alb-arn> \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=<acm-certificate-arn> \
  --default-actions Type=forward,TargetGroupArn=<target-group-arn>
```

**2.2.6 Create ECS Service:**

```bash
aws ecs create-service \
  --cluster buete-consulting-cluster \
  --service-name backend-service \
  --task-definition buete-consulting-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=<target-group-arn>,containerName=backend,containerPort=4000" \
  --health-check-grace-period-seconds 60
```

**2.2.7 Configure Auto Scaling:**

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/buete-consulting-cluster/backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy (CPU-based)
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/buete-consulting-cluster/backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleOutCooldown": 60,
    "ScaleInCooldown": 180
  }'
```

#### 2.3 Frontend Setup (S3 + CloudFront)

**2.3.1 Create S3 Bucket:**

```bash
# Create bucket
aws s3 mb s3://buete-consulting-frontend --region us-east-1

# Configure for static website hosting
aws s3 website s3://buete-consulting-frontend \
  --index-document index.html \
  --error-document index.html
```

**Create bucket policy** (`s3-bucket-policy.json`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::buete-consulting-frontend/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::<account-id>:distribution/<distribution-id>"
        }
      }
    }
  ]
}
```

**2.3.2 Create CloudFront Distribution:**

```bash
# Create Origin Access Control (OAC)
aws cloudfront create-origin-access-control \
  --origin-access-control-config '{
    "Name": "buete-consulting-oac",
    "SigningProtocol": "sigv4",
    "SigningBehavior": "always",
    "OriginAccessControlOriginType": "s3"
  }'
```

Save as `cloudfront-distribution.json`:

```json
{
  "CallerReference": "buete-consulting-2025",
  "Comment": "Buete Consulting Frontend Distribution",
  "Enabled": true,
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-buete-consulting-frontend",
        "DomainName": "buete-consulting-frontend.s3.us-east-1.amazonaws.com",
        "OriginAccessControlId": "<oac-id>",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-buete-consulting-frontend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "CachedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "Compress": true,
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    }
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "ViewerCertificate": {
    "CloudFrontDefaultCertificate": false,
    "ACMCertificateArn": "<acm-certificate-arn>",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  },
  "Aliases": {
    "Quantity": 1,
    "Items": ["yourdomain.com"]
  },
  "PriceClass": "PriceClass_100"
}
```

---

### Phase 3: CI/CD Pipeline

#### 3.1 GitHub Actions Workflow

**Create `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to AWS

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: buete-consulting/backend
  ECS_CLUSTER: buete-consulting-cluster
  ECS_SERVICE: backend-service
  S3_BUCKET: buete-consulting-frontend
  CLOUDFRONT_DISTRIBUTION: <distribution-id>

jobs:
  deploy-backend:
    name: Deploy Backend to ECS
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push image to Amazon ECR
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd server
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Update ECS task definition
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: server/ecs-task-definition.json
          container-name: backend
          image: ${{ steps.build-image.outputs.image }}

      - name: Deploy to Amazon ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true

  deploy-frontend:
    name: Deploy Frontend to S3/CloudFront
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build frontend
        env:
          REACT_APP_API_URL: https://api.yourdomain.com
        run: npm run build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Sync to S3
        run: |
          aws s3 sync build/ s3://${{ env.S3_BUCKET }} \
            --delete \
            --cache-control "public, max-age=31536000, immutable" \
            --exclude "index.html" \
            --exclude "service-worker.js"

          aws s3 cp build/index.html s3://${{ env.S3_BUCKET }}/index.html \
            --cache-control "no-cache, no-store, must-revalidate"

          aws s3 cp build/service-worker.js s3://${{ env.S3_BUCKET }}/service-worker.js \
            --cache-control "no-cache, no-store, must-revalidate"

      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ env.CLOUDFRONT_DISTRIBUTION }} \
            --paths "/*"
```

**Add GitHub Secrets:**

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

---

### Phase 4: Database Migration Strategy

#### 4.1 Initial Database Setup

**Run migrations from local machine:**

```bash
# Connect to RDS via bastion host or VPN
export DATABASE_URL="postgresql://username:password@rds-endpoint:5432/dbname"

# Run migrations
cd server
npm run prisma:deploy

# Create admin user
npm run seed:admin
```

#### 4.2 Add Migration Script to Container

**Update `server/package.json`:**

```json
{
  "scripts": {
    "migrate:deploy": "prisma migrate deploy",
    "postinstall": "prisma generate",
    "start:prod": "npm run migrate:deploy && node dist/index.js"
  }
}
```

**Update Dockerfile CMD:**

```dockerfile
CMD ["npm", "run", "start:prod"]
```

---

### Phase 5: Monitoring & Observability

#### 5.1 CloudWatch Alarms

**Create alarms for critical metrics:**

```bash
# Backend CPU Utilization
aws cloudwatch put-metric-alarm \
  --alarm-name backend-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ServiceName,Value=backend-service Name=ClusterName,Value=buete-consulting-cluster

# Database Connections
aws cloudwatch put-metric-alarm \
  --alarm-name rds-high-connections \
  --alarm-description "Alert when DB connections exceed 80%" \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=DBInstanceIdentifier,Value=buete-consulting-db

# ALB Target Health
aws cloudwatch put-metric-alarm \
  --alarm-name alb-unhealthy-targets \
  --alarm-description "Alert when targets are unhealthy" \
  --metric-name UnHealthyHostCount \
  --namespace AWS/ApplicationELB \
  --statistic Average \
  --period 60 \
  --evaluation-periods 2 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold
```

#### 5.2 CloudWatch Dashboard

Create a custom dashboard to monitor:

- ECS CPU & Memory utilization
- RDS CPU, Connections, Storage
- ALB Request count, Latency, 5xx errors
- CloudFront Cache hit ratio, Requests

---

## Cost Estimation

### Production Setup (Medium Traffic)

| Service                       | Configuration                        | Monthly Cost       |
| ----------------------------- | ------------------------------------ | ------------------ |
| **RDS PostgreSQL**            | db.t4g.micro, 20GB storage, Multi-AZ | $25-40             |
| **ECS Fargate**               | 2-4 tasks (0.5 vCPU, 1GB RAM)        | $30-60             |
| **Application Load Balancer** | Standard                             | $16-20             |
| **S3**                        | 10GB storage, 1M requests            | $1-3               |
| **CloudFront**                | 50GB data transfer                   | $5-10              |
| **Secrets Manager**           | 5 secrets                            | $2                 |
| **CloudWatch Logs**           | 5GB logs                             | $2-5               |
| **Bedrock (Claude)**          | Usage-based                          | Variable           |
| **Route 53**                  | Hosted zone                          | $0.50              |
| **ACM Certificate**           | SSL/TLS                              | Free               |
| **Data Transfer**             | Outbound                             | $5-15              |
| **TOTAL**                     |                                      | **~$90-160/month** |

### Cost-Optimized Setup (Low Traffic)

| Service                       | Configuration                 | Monthly Cost      |
| ----------------------------- | ----------------------------- | ----------------- |
| **RDS PostgreSQL**            | db.t4g.micro, Single-AZ       | $13-18            |
| **ECS Fargate**               | 1 task (0.25 vCPU, 0.5GB RAM) | $8-12             |
| **Application Load Balancer** | Standard                      | $16               |
| **S3 + CloudFront**           | Minimal usage                 | $2-5              |
| **Other AWS Services**        |                               | $5-10             |
| **TOTAL**                     |                               | **~$44-61/month** |

---

## Security Checklist

- [ ] Enable RDS encryption at rest
- [ ] Enable RDS automated backups (7-30 days)
- [ ] Store all secrets in AWS Secrets Manager
- [ ] Enable VPC Flow Logs
- [ ] Configure WAF rules for CloudFront
- [ ] Enable CloudTrail for audit logging
- [ ] Implement least-privilege IAM roles
- [ ] Enable MFA for AWS root account
- [ ] Configure security groups with minimal access
- [ ] Enable AWS GuardDuty for threat detection
- [ ] Implement rate limiting at ALB level
- [ ] Use HTTPS everywhere (TLS 1.2+)
- [ ] Enable CloudFront signed URLs for sensitive content
- [ ] Implement CORS properly
- [ ] Regular security patching of containers
- [ ] Enable RDS Performance Insights
- [ ] Configure backup and disaster recovery

---

## Domain & SSL Setup

### 1. Request SSL Certificate (ACM)

```bash
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names www.yourdomain.com api.yourdomain.com \
  --validation-method DNS \
  --region us-east-1
```

### 2. Configure Route 53

```bash
# Create hosted zone
aws route53 create-hosted-zone \
  --name yourdomain.com \
  --caller-reference $(date +%s)

# Add A record for CloudFront
aws route53 change-resource-record-sets \
  --hosted-zone-id <zone-id> \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "yourdomain.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "<cloudfront-distribution>.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'

# Add A record for ALB (API)
aws route53 change-resource-record-sets \
  --hosted-zone-id <zone-id> \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.yourdomain.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "<alb-zone-id>",
          "DNSName": "<alb-dns-name>",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'
```

---

## Post-Deployment Tasks

### 1. Verify Deployment

```bash
# Check backend health
curl https://api.yourdomain.com/api/health

# Check frontend
curl -I https://yourdomain.com

# Test authentication
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### 2. Load Testing

Use tools like:

- **Apache Bench**: `ab -n 1000 -c 10 https://api.yourdomain.com/api/health`
- **Artillery**: For complex scenarios
- **AWS Load Testing**: Via CloudWatch Synthetics

### 3. Performance Optimization

- Enable CloudFront compression
- Configure proper cache headers
- Optimize Prisma queries
- Enable RDS query performance insights
- Review CloudWatch metrics weekly

### 4. Backup Verification

```bash
# Create manual RDS snapshot
aws rds create-db-snapshot \
  --db-instance-identifier buete-consulting-db \
  --db-snapshot-identifier manual-backup-$(date +%Y%m%d)

# Test restore process (in non-prod)
```

---

## Rollback Strategy

### Backend Rollback

```bash
# Revert to previous task definition
aws ecs update-service \
  --cluster buete-consulting-cluster \
  --service backend-service \
  --task-definition buete-consulting-backend:<previous-revision>
```

### Frontend Rollback

```bash
# Re-deploy previous build from local
aws s3 sync build-backup/ s3://buete-consulting-frontend --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/*"
```

---

## Maintenance Windows

### Database Maintenance

- **Preferred window**: Sunday 2:00-4:00 AM (local time)
- **Duration**: 30-60 minutes
- **Automated backups**: Daily at 3:00 AM

### Application Updates

- **Blue/Green Deployment**: Use ECS to deploy new version alongside old
- **Gradual rollout**: Update 50% of tasks, monitor, then update remaining
- **Rollback plan**: Keep previous task definition ready

---

## Troubleshooting Guide

### Backend Won't Start

1. Check CloudWatch logs: `/ecs/buete-consulting-backend`
2. Verify environment variables in Secrets Manager
3. Test database connectivity from ECS task
4. Check security group rules

### Database Connection Issues

1. Verify security group allows ECS access
2. Check RDS instance status
3. Verify DATABASE_URL format
4. Check connection pool settings in Prisma

### High Latency

1. Enable RDS Performance Insights
2. Check slow query logs
3. Review CloudWatch ECS CPU/Memory metrics
4. Consider adding read replicas
5. Enable CloudFront caching for API (if applicable)

---

## Next Steps

1. **Complete Pre-Deployment Prep**:

   - [ ] Create `.env.example` files
   - [ ] Add health check endpoints
   - [ ] Create Dockerfile
   - [ ] Test Docker build locally

2. **Setup AWS Infrastructure**:

   - [ ] Create RDS instance
   - [ ] Setup ECS cluster
   - [ ] Configure ALB
   - [ ] Create S3 bucket
   - [ ] Setup CloudFront

3. **Configure CI/CD**:

   - [ ] Add GitHub Actions workflow
   - [ ] Configure GitHub secrets
   - [ ] Test deployment pipeline

4. **Go Live**:
   - [ ] Point domain to CloudFront
   - [ ] Verify SSL certificate
   - [ ] Run smoke tests
   - [ ] Monitor for 24 hours

---

## Support Resources

- **AWS Support**: https://console.aws.amazon.com/support/
- **Prisma Docs**: https://www.prisma.io/docs/
- **ECS Best Practices**: https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/
- **CloudFront Optimization**: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/

---

_Document Version: 1.0_  
_Last Updated: October 2, 2025_
