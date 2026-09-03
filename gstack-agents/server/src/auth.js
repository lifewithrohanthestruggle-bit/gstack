/**
 * MVP auth — optional shared Bearer token.
 * v0.2 roadmap: Supabase Auth (email OTP / Google) + per-user RLS.
 */

export function authMiddleware(cfg) {
  return (req, res, next) => {
    if (!cfg.authToken) return next()
    if (req.path === '/api/health') return next() // health check नेहमी public
    const header = req.headers.authorization || ''
    if (header === `Bearer ${cfg.authToken}`) return next()
    return res.status(401).json({ error: 'Unauthorized — valid Bearer token लागतो' })
  }
}
