import { Router } from 'express'
import { providerStatus, resolveProvider } from './providers/index.js'
import { AGENTS, CORE_AGENT_IDS, CRITIC_ID } from './agents/definitions.js'
import { runPipeline } from './orchestrator/orchestrator.js'

export function buildApiRouter({ cfg, stores }) {
  const router = Router()

  // --- Health + provider availability -----------------------------------
  router.get('/health', async (req, res) => {
    const status = await providerStatus(cfg)
    res.json({
      ok: true,
      name: 'GStack Agents API',
      version: cfg.version,
      providers: status,
      authRequired: Boolean(cfg.authToken),
    })
  })

  // --- Agent roster -------------------------------------------------------
  router.get('/agents', (req, res) => {
    res.json({
      core: CORE_AGENT_IDS.map((id) => AGENTS[id]),
      critic: AGENTS[CRITIC_ID],
    })
  })

  // --- Sessions (run history) --------------------------------------------
  router.get('/sessions', async (req, res) => {
    const rows = await stores.sessions.latest(50)
    // फक्त list metadata — heavy outputs नाही
    res.json(
      rows.map((s) => ({
        id: s.id,
        ts: s.ts,
        goal: s.goal,
        provider: s.provider,
        agents: s.agents,
        criticScore: s.criticScore,
        durationMs: s.durationMs,
      }))
    )
  })

  router.get('/sessions/:id', async (req, res) => {
    const rows = await stores.sessions.all()
    const s = rows.find((r) => r.id === req.params.id)
    if (!s) return res.status(404).json({ error: 'session सापडली नाही' })
    res.json(s)
  })

  // --- Long-term memory / knowledge --------------------------------------
  router.get('/knowledge', async (req, res) => {
    res.json(await stores.knowledge.latest(30))
  })

  router.post('/knowledge/clear', async (req, res) => {
    await stores.knowledge.clear()
    res.json({ ok: true })
  })

  // --- Main run endpoint (SSE stream) ------------------------------------
  router.post('/run', async (req, res) => {
    const { goal, agents, provider: requested = 'auto', revision = false } = req.body || {}

    if (!goal || typeof goal !== 'string' || goal.trim().length < 3) {
      return res.status(400).json({ error: 'goal द्या (कमीत कमी ३ अक्षरे)' })
    }
    if (goal.length > 4000) {
      return res.status(400).json({ error: 'goal खूप मोठा आहे (max 4000 chars)' })
    }

    const status = await providerStatus(cfg)
    const { provider, id, note } = resolveProvider(cfg, status, requested)

    res.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    })
    if (typeof res.flushHeaders === 'function') res.flushHeaders()

    const send = (event, data) => {
      try {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
      } catch {
        /* client गायब — उर्वरित events गाळता येतात */
      }
    }

    const ac = new AbortController()
    req.on('close', () => ac.abort()) // browser tab बंद → tokens वाचवा
    const timer = setTimeout(() => ac.abort(), cfg.runTimeoutMs)

    try {
      await runPipeline({
        goal: goal.trim(),
        selectedAgents: Array.isArray(agents) ? agents : [],
        provider,
        providerId: id,
        revision: Boolean(revision),
        cfg,
        stores,
        signal: ac.signal,
        emit: send,
      })
    } catch (err) {
      send('error', { message: err.message })
    } finally {
      clearTimeout(timer)
      try {
        res.end()
      } catch {
        /* noop */
      }
    }
  })

  return router
}
