# Vercel Optimization Guide

## Current Architecture
- **Single serverless function**: All 95+ API routes → `/api/index.js`
- **576 Prisma database queries** across the codebase
- **Good**: Already using connection pooling, compression, CORS caching

## High-Impact Optimizations

### 1. Add Edge Caching for Public Routes (Reduces 40-60% invocations)

Public booking info is frequently accessed but rarely changes. Add cache headers:

```typescript
// server/src/routes/bookingRoutes.ts
router.get(
  '/public/:bookingUrl',
  asyncHandler(async (req, res) => {
    // Add cache headers for Vercel Edge Network
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    const bookingUrl = req.params.bookingUrl;
    const info = await getPublicBookingInfo(bookingUrl);
    res.json(info);
  })
);
```

**Impact**:
- Public booking pages cache for 5 minutes
- Stale content served while revalidating for 10 minutes
- Reduces ~50% of function invocations for booking pages

### 2. Optimize Database Queries (Connection Pooling)

Update Prisma configuration for serverless:

```typescript
// server/src/db/prisma.ts
const prismaClient = globalThis.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Add connection pool settings for Supabase
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Add connection pool timeout
prismaClient.$connect();
```

Update `DATABASE_URL` to use Supabase Session Pooler (already done ✅):
```
postgresql://postgres.jkhhcenobqxmssbebrcf:...@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
```

### 3. Implement Request Deduplication

For frequently accessed data (user profiles, settings), add in-memory cache:

```typescript
// server/src/utils/requestCache.ts
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

export const withCache = <T>(
  key: string,
  fn: () => Promise<T>,
  ttl = CACHE_TTL
): Promise<T> => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return Promise.resolve(cached.data);
  }

  return fn().then(data => {
    cache.set(key, { data, timestamp: Date.now() });
    // Auto-cleanup after TTL
    setTimeout(() => cache.delete(key), ttl);
    return data;
  });
};
```

Use in routes:
```typescript
router.get('/settings', authenticate, asyncHandler(async (req, res) => {
  const settings = await withCache(
    `settings:${req.user!.id}`,
    () => getOrCreateBookingSettings(req.user!.id),
    60000 // 1 minute cache
  );
  res.json(settings);
}));
```

### 4. Batch Database Operations

Reduce N+1 queries by using Prisma's `include`:

```typescript
// ❌ BAD: Multiple queries
const reviews = await prisma.hmrReview.findMany({ where: { ownerId } });
for (const review of reviews) {
  review.patient = await prisma.patient.findUnique({ where: { id: review.patientId } });
}

// ✅ GOOD: Single query with include
const reviews = await prisma.hmrReview.findMany({
  where: { ownerId },
  include: {
    patient: true,
    medications: true,
  },
});
```

### 5. Add Vercel Edge Config for Feature Flags

Instead of database queries for feature flags, use Vercel Edge Config (free tier: 100 reads/sec):

```bash
vercel env add EDGE_CONFIG
```

```typescript
import { get } from '@vercel/edge-config';

// Cached at edge, no function invocation
const maintenanceMode = await get('maintenance_mode');
```

### 6. Optimize vercel.json Settings

```json
{
  "buildCommand": "npm run build && cd server && npm install --include=dev && npm run prisma:generate && npm run build",
  "outputDirectory": "build",
  "functions": {
    "api/index.js": {
      "maxDuration": 30,  // Reduce from 60s to 30s (cheaper tier)
      "memory": 512       // Reduce from 1024MB if possible
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/index.js"
    }
  ],
  "headers": [
    {
      "source": "/api/booking/public/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=300, stale-while-revalidate=600"
        }
      ]
    },
    {
      "source": "/api/health",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60"
        }
      ]
    }
  ]
}
```

### 7. Frontend Optimizations (Reduce Unnecessary API Calls)

**Add React Query for automatic caching:**

```bash
npm install @tanstack/react-query
```

```typescript
// src/hooks/useBookingInfo.ts
import { useQuery } from '@tanstack/react-query';

export const useBookingInfo = (bookingUrl: string) => {
  return useQuery({
    queryKey: ['bookingInfo', bookingUrl],
    queryFn: () => getPublicBookingInfo(bookingUrl),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

**Impact**: Prevents duplicate API calls when components re-render

### 8. Move Static Assets to Vercel Edge Network

Ensure all static files are served from CDN, not serverless functions:

```json
// vercel.json - add static routes
{
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": { "Cache-Control": "public, max-age=31536000, immutable" },
      "continue": true
    }
  ]
}
```

## Cost Monitoring

### Current Usage Estimate:
- 95 API routes × ~10 requests/min = 950 invocations/min
- 1,368,000 invocations/day
- **~41M invocations/month**

### With Optimizations:
1. Edge caching (50% reduction on public routes): **~25M invocations**
2. React Query caching (30% reduction): **~17M invocations**
3. Request deduplication (10% reduction): **~15M invocations**

**Estimated savings: 60-70% reduction in function invocations**

## Free Tier Limits (Hobby Plan):
- **100GB bandwidth/month** ✅
- **100 GB-hours compute/month** ⚠️
- **Unlimited invocations** ✅

## Pro Plan ($20/month):
- **1TB bandwidth**
- **1,000 GB-hours compute**
- **Better for production workloads**

## Implementation Priority:

1. ⭐ **Week 1**: Add edge caching headers (vercel.json)
2. ⭐ **Week 1**: Install React Query for frontend caching
3. ⚡ **Week 2**: Optimize Prisma queries (batch operations)
4. ⚡ **Week 2**: Add request deduplication cache
5. 🔧 **Week 3**: Reduce function memory/duration
6. 🔧 **Week 4**: Migrate feature flags to Edge Config

## Monitoring Commands:

```bash
# View function invocations
vercel logs buete-consulting-react --since 24h

# Check function duration
vercel inspect <deployment-url> --logs

# Monitor bandwidth
vercel domains --json | jq '.[].bandwidth'
```
