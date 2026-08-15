/**
 * In-memory sliding-window limiter.
 *
 * Vercel instances do not share this map. That is acceptable for MVP abuse
 * protection; a shared store can replace this later without changing callers.
 */

type Bucket = { timestamps: number[] }

const buckets = new Map<string, Bucket>()

const MAX_KEYS = 20_000

export type RateLimitResult = {
  ok: boolean
  remaining: number
  retryAfterSeconds: number
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  let bucket = buckets.get(key)
  if (!bucket) {
    if (buckets.size > MAX_KEYS) {
      // Cheap eviction of the oldest inserted key.
      const first = buckets.keys().next().value
      if (first) buckets.delete(first)
    }
    bucket = { timestamps: [] }
    buckets.set(key, bucket)
  }
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs)
  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    }
  }
  bucket.timestamps.push(now)
  return {
    ok: true,
    remaining: Math.max(0, limit - bucket.timestamps.length),
    retryAfterSeconds: 0,
  }
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip') || 'unknown'
}

export const limits = {
  auth: { limit: 10, windowMs: 60_000 },
  api: { limit: 120, windowMs: 60_000 },
  public: { limit: 60, windowMs: 60_000 },
}
