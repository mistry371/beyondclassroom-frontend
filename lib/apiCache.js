const cache = new Map()
const DEFAULT_TTL = 60 * 1000
const MAX_ENTRIES = 200 // cap so a long-lived tab can't grow the cache unbounded

export function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expires) {
    cache.delete(key)
    return null
  }
  return entry.data
}

export function setCached(key, data, ttlMs = DEFAULT_TTL) {
  // Refresh recency: re-inserting moves the key to the newest slot.
  cache.delete(key)
  cache.set(key, { data, expires: Date.now() + ttlMs })
  // Evict oldest entries (Map preserves insertion order) once over the cap.
  while (cache.size > MAX_ENTRIES) {
    cache.delete(cache.keys().next().value)
  }
}

export function invalidateCache(prefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}
