import NodeCache from 'node-cache'

// 5 minute TTL for shared resources
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 })

export const getCached = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  const cached = cache.get<T>(key)
  if (cached !== undefined) {
    return cached
  }

  const fresh = await fetchFn()
  if (ttl !== undefined) {
    cache.set(key, fresh, ttl)
  } else {
    cache.set(key, fresh)
  }
  return fresh
}

export const invalidateCache = (pattern: string) => {
  const keys = cache.keys()
  keys.forEach((key) => {
    if (key.includes(pattern)) {
      cache.del(key)
    }
  })
}

export const clearCache = () => {
  cache.flushAll()
}
