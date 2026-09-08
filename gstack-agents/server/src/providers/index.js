/**
 * Provider registry + auto-routing.
 *
 * Priority (auto mode):
 *   1. Grok (xAI)  — XAI_API_KEY असेल तर
 *   2. Ollama      — local server reachable असेल तर (free, open-source)
 *   3. Mock        — नेहमी उपलब्ध (offline demo)
 *
 * युजर UI मधून explicit select करू शकतो.
 */

import { createGrokProvider } from './grok.js'
import { createOllamaProvider } from './ollama.js'
import { createMockProvider } from './mock.js'

let ollamaCache = { at: 0, ok: false, models: [] }
const OLLAMA_CACHE_MS = 30_000

export async function probeOllama(cfg) {
  if (Date.now() - ollamaCache.at < OLLAMA_CACHE_MS) return ollamaCache
  let result = { at: Date.now(), ok: false, models: [] }
  try {
    const res = await fetch(`${cfg.ollamaUrl}/api/tags`, {
      signal: AbortSignal.timeout(1500),
    })
    if (res.ok) {
      const json = await res.json()
      result = {
        at: Date.now(),
        ok: true,
        models: (json.models || []).map((m) => m.name),
      }
    }
  } catch {
    /* not running */
  }
  ollamaCache = result
  return result
}

export async function providerStatus(cfg) {
  const ollama = await probeOllama(cfg)
  return {
    grok: {
      id: 'grok',
      available: Boolean(cfg.xaiApiKey),
      model: cfg.xaiModel,
      label: `Grok (${cfg.xaiModel})`,
    },
    ollama: {
      id: 'ollama',
      available: ollama.ok,
      model: cfg.ollamaModel,
      label: `Ollama (${cfg.ollamaModel})`,
      url: cfg.ollamaUrl,
      models: ollama.models,
    },
    mock: {
      id: 'mock',
      available: true,
      label: 'Offline Demo',
    },
  }
}

export function resolveProvider(cfg, status, requested = 'auto') {
  const order = {
    auto: ['grok', 'ollama', 'mock'],
    grok: ['grok', 'mock'],
    ollama: ['ollama', 'mock'],
    mock: ['mock'],
  }
  const wanted = order[requested] ? requested : 'auto'
  for (const id of order[wanted]) {
    if (status[id].available) {
      const factories = {
        grok: () => createGrokProvider(cfg),
        ollama: () => createOllamaProvider(cfg),
        mock: () => createMockProvider(cfg),
      }
      return {
        provider: factories[id](),
        requested,
        id,
        note:
          id === 'mock' && wanted !== 'mock'
            ? 'fallback → Offline Demo (requested provider उपलब्ध नाही)'
            : null,
      }
    }
  }
  return { provider: createMockProvider(cfg), requested: 'auto', id: 'mock', note: null }
}
