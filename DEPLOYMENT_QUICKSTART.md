# AWS Deployment Quick Start Guide

This is a condensed guide to get you up and running quickly. For full details, see [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md).

## Pre-Deployment Checklist

### 1. Local Testing with Docker

Test your containerized application locally:

```bash
# Build and start containers
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Test health endpoint
curl http://localhost:4000/api/health

# Stop containers
docker-compose down
```

### 2. Prepare Environment Variables

Copy the example files and fill in your values:

```bash
# Backend
cp server/.env.example server/.env
# Edit server/.env with your production values

# Frontend
cp .env.example .env.production
# Edit .env.production with your production API URL
```

### 3. AWS Account Setup

Required AWS services:

- ✅ RDS PostgreSQL
- ✅ ECS Fargate
- ✅ ECR (Container Registry)
- ✅ S3 + CloudFront
- ✅ Secrets Manager
- ✅ IAM Roles
- ✅ VPC with public/private subnets

## Deployment Options

### Option A: AWS Console (Beginner-Friendly)

1. **Create RDS Database**

   - Go to RDS Console → Create Database
   - Engine: PostgreSQL 16
   - Template: Dev/Test (for cost savings)
   - Instance: db.t4g.micro
   - Storage: 20GB
   - Multi-AZ: Optional (adds cost but increases availability)
   - **Important**: Note down the endpoint and credentials

2. **Store Secrets**

   - Go to Secrets Manager → Store a new secret
   - Create secret for:
     - `prod/buete-consulting/database-url`
     - `prod/buete-consulting/jwt-secret`
     - `prod/buete-consulting/aws-credentials`

3. **Create ECR Repository**

   - Go to ECR Console → Create repository
   - Name: `buete-consulting/backend`
   - Enable scan on push

4. **Push Docker Image**

   ```bash
   # Get ECR login
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

   # Build and push
   cd server
   docker build -t buete-consulting/backend .
   docker tag buete-consulting/backend:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/buete-consulting/backend:latest
   docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/buete-consulting/backend:latest
   ```

5. **Create ECS Cluster**

   - Go to ECS Console → Create cluster
   - Name: `buete-consulting-cluster`
   - Infrastructure: AWS Fargate

6. **Create Task Definition**

   - Go to Task Definitions → Create new
   - Launch type: Fargate
   - Task size: 0.5 vCPU, 1GB memory
   - Container definition:
     - Name: `backend`
     - Image: Your ECR image URI
     - Port: 4000
     - Environment variables: Load from Secrets Manager

7. **Create ALB**

   - Go to EC2 → Load Balancers → Create
   - Type: Application Load Balancer
   - Scheme: Internet-facing
   - Create target group (port 4000, health check: `/api/health`)

8. **Create ECS Service**

   - In your cluster → Create service
   - Task definition: Select your task
   - Desired tasks: 2
   - Load balancer: Select your ALB
   - Auto-scaling: Min 2, Max 10

9. **Deploy Frontend**
   - Create S3 bucket (disable public access, use CloudFront)
   - Build frontend: `npm run build`
   - Upload to S3: `aws s3 sync build/ s3://your-bucket`
   - Create CloudFront distribution pointing to S3
   - Configure custom domain (optional)

### Option B: AWS CLI (Automated)

Follow the comprehensive commands in [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) sections 2.1-2.3.

### Option C: GitHub Actions (Recommended for CD)

1. **Setup GitHub Secrets**

   Go to your repo → Settings → Secrets and variables → Actions

   Add these secrets:

   ```
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   REACT_APP_API_URL
   CLOUDFRONT_DISTRIBUTION_ID
   ```

2. **Update workflow file**

   Edit `.github/workflows/deploy.yml`:

   - Replace `yourdomain.com` with your actual domain
   - Update S3 bucket name
   - Update ECS cluster/service names

3. **Push to main branch**

   ```bash
   git add .
   git commit -m "feat: add AWS deployment configuration"
   git push origin main
   ```

   GitHub Actions will automatically deploy!

## Cost Optimization Tips

### Minimal Setup (~$30-50/month)

- RDS: db.t4g.micro, Single-AZ
- ECS: 1 task, 0.25 vCPU, 0.5GB RAM
- S3 + CloudFront: Minimal traffic
- No NAT Gateway (use public subnets with proper security)

### Production Setup (~$90-160/month)

- RDS: db.t4g.micro, Multi-AZ
- ECS: 2-4 tasks, 0.5 vCPU, 1GB RAM each
- ALB for high availability
- CloudWatch monitoring
- Automated backups

### Cost Saving Strategies

1. **Use Reserved Instances** for RDS (save 30-40%)
2. **Enable auto-scaling** - scale down during off-hours
3. **Use Fargate Spot** for non-critical workloads (save 70%)
4. **CloudFront caching** - reduce origin requests
5. **S3 Intelligent-Tiering** - automatic cost optimization
6. **Set up billing alerts** - avoid surprise charges

## Post-Deployment Verification

### 1. Backend Health Check

```bash
curl https://api.yourdomain.com/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-02T...",
  "uptime": 123.45,
  "environment": "production",
  "database": "connected"
}
```

### 2. Frontend Check

```bash
curl -I https://yourdomain.com
```

Expected: `200 OK` with CloudFront headers

### 3. Database Migration Check

```bash
# Connect to RDS via bastion or VPN
export DATABASE_URL="postgresql://user:pass@rds-endpoint:5432/db"

# Check migrations
cd server
npx prisma migrate status
```

### 4. Test Authentication Flow

```bash
# Login
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"yourpassword"}'

# Should return JWT token
```

## Monitoring

### CloudWatch Dashboard

1. Go to CloudWatch → Dashboards → Create dashboard
2. Add widgets for:
   - ECS CPU/Memory utilization
   - RDS connections and CPU
   - ALB request count and latency
   - CloudFront cache hit ratio

### Set Up Alarms

```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name backend-high-cpu \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold

# Database connections alarm
aws cloudwatch put-metric-alarm \
  --alarm-name rds-high-connections \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

## Troubleshooting

### Backend won't start

```bash
# Check ECS task logs
aws logs tail /ecs/buete-consulting-backend --follow

# Check task definition
aws ecs describe-tasks --cluster buete-consulting-cluster --tasks TASK_ID
```

### Database connection failed

```bash
# Verify security group allows ECS access
# Check DATABASE_URL format in Secrets Manager
# Test connection from ECS task:
docker run --rm -it postgres:16-alpine psql "YOUR_DATABASE_URL"
```

### Frontend shows blank page

```bash
# Check S3 bucket policy
aws s3api get-bucket-policy --bucket buete-consulting-frontend

# Check CloudFront origin settings
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID

# Verify REACT_APP_API_URL is correct in build
```

## Rollback Procedure

### Backend Rollback

```bash
# List task definitions
aws ecs list-task-definitions --family-prefix buete-consulting-backend

# Rollback to previous version
aws ecs update-service \
  --cluster buete-consulting-cluster \
  --service backend-service \
  --task-definition buete-consulting-backend:PREVIOUS_REVISION
```

### Frontend Rollback

```bash
# Re-deploy previous build
aws s3 sync backup-build/ s3://buete-consulting-frontend --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

## Next Steps

1. ✅ **Set up custom domain** with Route 53
2. ✅ **Configure SSL certificate** with ACM
3. ✅ **Enable CloudWatch logs** aggregation
4. ✅ **Set up automated backups** for RDS
5. ✅ **Configure WAF** for CloudFront (optional)
6. ✅ **Enable GuardDuty** for security monitoring
7. ✅ **Create staging environment** (recommended)
8. ✅ **Set up CI/CD pipeline** with GitHub Actions

## Support & Resources

- **Full Documentation**: [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)
- **AWS Support**: https://console.aws.amazon.com/support/
- **Docker Documentation**: https://docs.docker.com/
- **Prisma Docs**: https://www.prisma.io/docs/
- **AWS Well-Architected Framework**: https://aws.amazon.com/architecture/well-architected/

---

**Questions?** Review the comprehensive [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) for detailed explanations and advanced configurations.
