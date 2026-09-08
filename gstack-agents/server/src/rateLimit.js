/**
 * छोटा in-memory rate limiter (per-IP sliding window) — zero-dep.
 * Production मध्ये: Redis/Upstash किंवा reverse-proxy level वर limit.
 */

export function rateLimit({ windowMs = 60_000, max = 40 } = {}) {
  const hits = new Map()
  setInterval(() => {
    const now = Date.now()
    for (const [k, arr] of hits) {
      const keep = arr.filter((t) => now - t < windowMs)
      if (keep.length) hits.set(k, keep)
      else hits.delete(k)
    }
  }, windowMs).unref()

  return (req, res, next) => {
    const key = req.ip || 'unknown'
    const now = Date.now()
    const arr = (hits.get(key) || []).filter((t) => now - t < windowMs)
    if (arr.length >= max) {
      return res.status(429).json({ error: 'खूप जास्त requests — काही वेळाने पुन्हा try करा' })
    }
    arr.push(now)
    hits.set(key, arr)
    next()
  }
}
