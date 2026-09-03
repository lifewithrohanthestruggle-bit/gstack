/**
 * GStack Agents — API server entry.
 *
 *   dev:  node --watch src/index.js
 *   prod: node src/index.js     (web/dist असेल तर तेही serve होतं — single server)
 */

import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import cors from 'cors'
import config from './config.js'
import { authMiddleware } from './auth.js'
import { rateLimit } from './rateLimit.js'
import { buildApiRouter } from './routes.js'
import { createStores } from './memory/store.js'

const app = express()
app.set('trust proxy', 1)
app.use(cors({ origin: config.corsOrigin ?? true }))
app.use(express.json({ limit: '1mb' }))
app.use(rateLimit({ windowMs: 60_000, max: 60 }))
app.use(authMiddleware(config))

const stores = createStores(config.dataDir)
app.use('/api', buildApiRouter({ cfg: config, stores }))

// Production mode: built frontend serve करा (web/dist)
if (fs.existsSync(config.webDist)) {
  app.use(express.static(config.webDist))
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(config.webDist, 'index.html'))
  })
}

app.listen(config.port, config.host, () => {
  /* eslint-disable no-console */
  console.log('')
  console.log('  ⚡ GStack Agents — Multi-Agent AI System')
  console.log(`  🛰  API      http://${config.host}:${config.port}/api/health`)
  console.log(`  🤖 Provider ${config.xaiApiKey ? `Grok (${config.xaiModel})` : 'auto → Offline Demo (XAI_API_KEY नाही)'}`)
  console.log(`  💾 Data     ${config.dataDir}`)
  console.log('')
})
