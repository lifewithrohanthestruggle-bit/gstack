import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const serverRoot = path.resolve(__dirname, '..')

// Tiny .env loader (zero-dep, Termux friendly).
// Format: KEY=value  |  # comments  |  quotes optional
function loadEnvFile(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8')
    for (const line of raw.split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const eq = t.indexOf('=')
      if (eq <= 0) continue
      const key = t.slice(0, eq).trim()
      let val = t.slice(eq + 1).trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      if (!(key in process.env)) process.env[key] = val
    }
  } catch {
    /* no .env — that's fine, everything has defaults */
  }
}

loadEnvFile(path.join(serverRoot, '.env'))

const env = (k, d) => (process.env[k] !== undefined && process.env[k] !== '' ? process.env[k] : d)

export const config = {
  version: '0.1.0',
  env: env('NODE_ENV', 'development'),

  host: env('HOST', '0.0.0.0'),
  port: Number(env('PORT', 8787)),

  // Auth (optional in MVP — single shared token; Supabase Auth is the v2 path)
  authToken: env('AUTH_TOKEN', ''),

  // Provider: Grok (xAI)
  xaiApiKey: env('XAI_API_KEY', ''),
  xaiModel: env('XAI_MODEL', 'grok-4.5'),
  xaiBaseUrl: env('XAI_BASE_URL', 'https://api.x.ai/v1'),

  // Provider: Ollama (free / local)
  ollamaUrl: env('OLLAMA_URL', 'http://127.0.0.1:11434'),
  ollamaModel: env('OLLAMA_MODEL', 'qwen2.5:7b'),

  // Tuning
  mockDelayMs: Number(env('MOCK_DELAY_MS', 14)),
  runTimeoutMs: Number(env('RUN_TIMEOUT_MS', 240000)),
  dataDir: path.resolve(serverRoot, env('DATA_DIR', './data')),

  // Web dist (production single-server mode: server serves the built frontend)
  webDist: path.resolve(serverRoot, '../web/dist'),
}

export default config
