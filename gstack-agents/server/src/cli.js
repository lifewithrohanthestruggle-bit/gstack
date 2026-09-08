#!/usr/bin/env node
/**
 * GStack Agents — CLI mode (Termux/mobile friendly!)
 *
 * Browser न लागता थेट terminal मध्ये पूर्ण agent team चालवा:
 *
 *   node src/cli.js "माझ्या design studio साठी brand + pricing plan हवं"
 *   node src/cli.js "portfolio website कॉड" --agents coding
 *   node src/cli.js --demo
 *   node src/cli.js "goal" --provider mock --no-stream
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import config from './config.js'
import { createStores } from './memory/store.js'
import { providerStatus, resolveProvider } from './providers/index.js'
import { runPipeline } from './orchestrator/orchestrator.js'

const args = process.argv.slice(2)
const flags = {}
const positional = []
for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if (a.startsWith('--')) {
    if (a === '--demo') flags.demo = true
    else if (a === '--no-stream') flags.noStream = true
    else if (a === '--agents') flags.agents = (args[++i] || '').split(',').map((s) => s.trim()).filter(Boolean)
    else if (a === '--provider') flags.provider = args[++i]
    else if (a === '--revision') flags.revision = true
  } else positional.push(a)
}

const DEMO_GOAL = 'मी freelance graphic designer आहे. माझ्या design studio साठी brand identity, Instagram marketing plan आणि pricing packages हवे.'

const goal = flags.demo ? DEMO_GOAL : positional.join(' ').trim()
if (!goal) {
  console.log(`
  ⚡ GStack Agents — CLI

  वापर:
    node src/cli.js "<goal>" [options]

  Options:
    --agents design,marketing   कोणते agents (default: auto-routing)
    --provider mock|grok|ollama provider निवड (default: auto)
    --revision                  critic score कमी असेल तर v2 round
    --no-stream                 एकाच वेळी पूर्ण output
    --demo                      demo goal वर run

  उदाहरण:
    node src/cli.js --demo
    node src/cli.js "logo design करायचं" --agents design,business
`)
  process.exit(0)
}

// CLI साठी temp data dir — main data दूषित होऊ नये... खरंतर
// memory reuse हवी असेल तर DATA_DIR env default वापरा. Demo सोडता defaultच.
const useTemp = process.env.CLI_TEMP === '1'
const dataDir = useTemp ? fs.mkdtempSync(path.join(os.tmpdir(), 'gstack-agents-')) : config.dataDir
const stores = createStores(dataDir)

const status = await providerStatus(config)
const { provider, id } = resolveProvider(config, status, flags.provider || 'auto')

const hexToAnsi = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16)
  return `\x1b[38;2;${(n >> 16) & 255};${(n >> 8) & 255};${n & 255}m`
}
const C = { dim: '\x1b[2m', bold: '\x1b[1m', reset: '\x1b[0m', green: '\x1b[32m' }

console.log(`\n${C.bold}⚡ GStack Agents${C.reset} ${C.dim}· provider: ${provider.label}${C.reset}`)
console.log(`${C.dim}🎯 Goal: ${goal}${C.reset}\n`)

await runPipeline({
  goal,
  selectedAgents: flags.agents || [],
  provider,
  providerId: id,
  revision: Boolean(flags.revision),
  cfg: config,
  stores,
  emit(type, data) {
    switch (type) {
      case 'meta':
        console.log(`${C.dim}📋 Plan: ${data.plan.agents.join(' → ')} → critic → final${C.reset}\n`)
        break
      case 'recall':
        console.log(`${C.dim}📦 Memory recall: ${data.memories.length} जुनी entries${C.reset}\n`)
        break
      case 'agent_start':
        process.stdout.write(`\n${hexToAnsi(data.color)}${C.bold}${data.emoji} ${data.name} ${C.reset}${C.dim}…${C.reset}\n`)
        break
      case 'agent_delta':
        if (!flags.noStream) process.stdout.write(data.delta)
        break
      case 'agent_done':
        if (flags.noStream) {
          // handled in agent_delta skip — print full text at done
        }
        console.log(`\n${C.dim}[${data.chars} chars · ${(data.ms / 1000).toFixed(1)}s]${C.reset}`)
        break
      case 'critic_score':
        console.log(`\n${C.bold}${C.green}🧪 Score: ${data.score}/10${C.reset}`)
        break
      case 'final_start':
        process.stdout.write(`\n${C.bold}🏁 Final Answer${C.reset}\n`)
        break
      case 'final_delta':
        if (!flags.noStream) process.stdout.write(data.delta)
        break
      case 'saved':
        console.log(`\n${C.dim}💾 session + memory save झाल्या${C.reset}`)
        break
      case 'done':
        console.log(`\n${C.dim}⏱ ${(data.durationMs / 1000).toFixed(1)}s · ${data.agents} agents · ${data.chars} chars${C.reset}\n`)
        break
      case 'error':
        console.log(`\n❌ ${data.message}\n`)
        break
    }
  },
})
