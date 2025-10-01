# Security Testing Guide

Quick reference for testing all security implementations.

## Prerequisites

1. **Server must be running**:

   ```bash
   cd server
   npm run build
   npm start
   ```

2. **Get an auth token** (replace with your actual credentials):

   ```bash
   TOKEN=$(curl -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"your-password"}' \
     -s | jq -r '.token')

   echo $TOKEN
   ```

---

## 1. Test Rate Limiting

### Auth Rate Limit (5 requests / 15 minutes)

```bash
# Should succeed for first 5, then get 429 Too Many Requests
for i in {1..7}; do
  echo "Request $i:"
  curl -X POST http://localhost:4000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -s -w "\nHTTP Status: %{http_code}\n\n"
done
```

**Expected**:

- Requests 1-5: 401 Unauthorized (wrong password)
- Requests 6-7: 429 Too Many Requests

### AI Rate Limit (10 requests / 5 minutes)

```bash
# Replace with your token
for i in {1..12}; do
  echo "AI Request $i:"
  curl -X POST http://localhost:4000/api/ai/recommendations \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"reviewId":1}' \
    -s -w "\nHTTP Status: %{http_code}\n\n"
  sleep 1
done
```

**Expected**:

- Requests 1-10: 200 OK or 400/404 (depending on data)
- Requests 11-12: 429 Too Many Requests

---

## 2. Test CORS

### Unauthorized Origin (Should FAIL)

```bash
curl -X GET http://localhost:4000/api/health \
  -H "Origin: https://malicious-site.com" \
  -v 2>&1 | grep -E "(< HTTP|< Access-Control)"
```

**Expected**: No `Access-Control-Allow-Origin` header

### Authorized Origin (Should SUCCEED)

```bash
curl -X GET http://localhost:4000/api/health \
  -H "Origin: http://localhost:3000" \
  -v 2>&1 | grep -E "(< HTTP|< Access-Control)"
```

**Expected**:

```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: http://localhost:3000
```

---

## 3. Test Security Headers (Helmet)

```bash
curl -I http://localhost:4000/api/health
```

**Expected Headers**:

```
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 0
```

---

## 4. Test Compression

### Check for Gzip Encoding

```bash
curl -X GET http://localhost:4000/api/clinics \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept-Encoding: gzip" \
  -v 2>&1 | grep -E "(< HTTP|< Content-Encoding|< Content-Length)"
```

**Expected**:

```
< HTTP/1.1 200 OK
< Content-Encoding: gzip
< Content-Length: [smaller number]
```

### Compare Compressed vs Uncompressed Size

```bash
# Uncompressed
curl -X GET http://localhost:4000/api/clinics \
  -H "Authorization: Bearer $TOKEN" \
  -s -w "\nUncompressed: %{size_download} bytes\n" \
  -o /dev/null

# Compressed
curl -X GET http://localhost:4000/api/clinics \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept-Encoding: gzip" \
  -s -w "\nCompressed: %{size_download} bytes\n" \
  -o /dev/null
```

**Expected**: Compressed size should be ~30-70% smaller

---

## 5. Test Caching

### First Request (Cache MISS - slower)

```bash
echo "First request (cache miss):"
time curl -X GET http://localhost:4000/api/clinics \
  -H "Authorization: Bearer $TOKEN" \
  -s -o /dev/null
```

### Second Request (Cache HIT - faster)

```bash
echo "Second request (cache hit):"
time curl -X GET http://localhost:4000/api/clinics \
  -H "Authorization: Bearer $TOKEN" \
  -s -o /dev/null
```

**Expected**: Second request should be 10-100x faster (real time ~0.002s vs ~0.050s)

### Test Cache Invalidation

```bash
# Create a new clinic (invalidates cache)
curl -X POST http://localhost:4000/api/clinics \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Clinic","address":"123 Main St"}'

# Next GET should be slow again (cache rebuilt)
time curl -X GET http://localhost:4000/api/clinics \
  -H "Authorization: Bearer $TOKEN" \
  -s -o /dev/null
```

---

## 6. Test Structured Logging

### Check Server Logs

The server console should show pretty-printed logs in development:

```
[15:30:45] INFO: Server listening
    port: 4000

[15:31:12] ERROR (database): Database connection failed
    error: {
      "message": "Connection timeout",
      "code": "ETIMEDOUT"
    }

[15:32:05] ERROR (auth): Login failed
    email: "user@example.com"
    reason: "Invalid password"
```

### Trigger Different Log Types

```bash
# Health check (should log INFO)
curl http://localhost:4000/api/health

# Failed login (should log ERROR with authLogger)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'

# AI request (should log with aiLogger)
curl -X POST http://localhost:4000/api/ai/recommendations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reviewId":999}'
```

---

## 7. Combined Security Test

### The "Evil Hacker" Test

```bash
#!/bin/bash
# Simulates an attacker trying multiple vectors

echo "=== Evil Hacker Test ==="

# 1. Try to brute force login
echo "\n1. Attempting brute force login..."
for i in {1..10}; do
  curl -X POST http://localhost:4000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"password'$i'"}' \
    -s -w " [%{http_code}]" -o /dev/null
done

# 2. Try unauthorized origin
echo "\n\n2. Attempting CORS bypass..."
curl -X GET http://localhost:4000/api/health \
  -H "Origin: https://evil-hacker.com" \
  -s -w " [%{http_code}]" -o /dev/null

# 3. Try XSS injection
echo "\n\n3. Attempting XSS injection..."
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"<script>alert(1)</script>@test.com","password":"test","name":"Hacker"}' \
  -s -w " [%{http_code}]" -o /dev/null

# 4. Try to spam AI endpoints
echo "\n\n4. Attempting AI endpoint spam..."
for i in {1..15}; do
  curl -X POST http://localhost:4000/api/ai/recommendations \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"reviewId":1}' \
    -s -w " [%{http_code}]" -o /dev/null
done

echo "\n\n=== Test Complete ==="
echo "Check server logs for security events"
```

**Expected Results**:

- Brute force: Blocked after 5 attempts (429)
- CORS: Rejected (no CORS header)
- XSS: Email validation should fail
- AI spam: Blocked after 10 requests (429)

---

## 8. Performance Benchmarking

### Apache Bench (if installed)

```bash
# Test concurrent requests with caching
ab -n 1000 -c 10 \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/clinics
```

**Expected**:

- Requests per second: 200-500+ (with caching)
- Time per request: 2-5ms (with caching)

### Response Time Comparison

```bash
# Without caching (first request or after 5 min)
time curl -X GET http://localhost:4000/api/clinics \
  -H "Authorization: Bearer $TOKEN" \
  -s -o /dev/null

# Clear cache and try again
curl -X POST http://localhost:4000/api/clinics/_clear_cache \
  -H "Authorization: Bearer $TOKEN"

time curl -X GET http://localhost:4000/api/clinics \
  -H "Authorization: Bearer $TOKEN" \
  -s -o /dev/null
```

---

## 9. Monitoring & Alerts

### Watch Logs in Real-Time

```bash
# In server directory
npm start | grep -E "(ERROR|WARN|rate limit)"
```

### Check for Rate Limit Events

```bash
# Filter logs for rate limiting
npm start 2>&1 | grep -i "too many requests"
```

---

## Troubleshooting

### Server Not Starting

```bash
# Check if port is in use
lsof -i :4000

# Check environment variables
cd server && cat .env

# Regenerate Prisma client
npx prisma generate

# Rebuild
npm run build
```

### Rate Limiting Not Working

- Check that requests are coming from the same IP
- Wait 15 minutes and try again
- Verify rate limiter middleware is applied:
  ```bash
  grep -r "authLimiter" server/src/routes/
  ```

### CORS Issues

- Check `FRONTEND_URL` in `.env`
- Verify origin header matches whitelist
- Check browser console for CORS errors

### Compression Not Working

- Verify `Accept-Encoding: gzip` header is sent
- Check response headers for `Content-Encoding: gzip`
- Ensure response is large enough (>1KB)

### Cache Not Working

- Check logs for cache hits/misses
- Verify cache TTL hasn't expired (5 minutes)
- Check cache invalidation logic

---

## Success Criteria

✅ **Rate Limiting**: Requests blocked after limits exceeded
✅ **CORS**: Unauthorized origins rejected
✅ **Security Headers**: All Helmet headers present
✅ **Compression**: Response size reduced by 30-70%
✅ **Caching**: Second request 10-100x faster
✅ **Logging**: Structured JSON logs with context

---

## Next Steps After Testing

1. Update production `.env` with real `FRONTEND_URL`
2. Set `NODE_ENV=production` for production deployment
3. Configure CloudWatch log collection
4. Set up monitoring alerts for rate limit events
5. Review logs for security events

---

_Last updated: January 2025_
