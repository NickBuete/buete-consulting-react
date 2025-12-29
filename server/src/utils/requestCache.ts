/**
 * In-memory request cache for serverless functions
 * Reduces duplicate database queries within the same function instance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class RequestCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTL = 30000) {
    // 30 seconds default TTL
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get cached data or execute function and cache result
   */
  async get<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    const cacheTTL = ttl ?? this.defaultTTL;

    // Return cached data if valid
    if (cached && now - cached.timestamp < cacheTTL) {
      return cached.data as T;
    }

    // Execute function and cache result
    const data = await fn();
    this.cache.set(key, { data, timestamp: now });

    // Auto-cleanup after TTL
    setTimeout(() => this.cache.delete(key), cacheTTL);

    return data;
  }

  /**
   * Invalidate specific cache key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const requestCache = new RequestCache();

/**
 * Helper function for wrapping cached queries
 */
export const withCache = <T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  return requestCache.get(key, fn, ttl);
};
