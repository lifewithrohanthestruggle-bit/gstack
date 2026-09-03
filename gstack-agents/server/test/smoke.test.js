import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { planRun } from '../src/orchestrator/planner.js'
import { runPipeline } from '../src/orchestrator/orchestrator.js'
import { createMockProvider } from '../src/providers/mock.js'
import { createStores } from '../src/memory/store.js'
import { recallKnowledge } from '../src/memory/recall.js'
import config from '../src/config.js'

function tempStores() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gstack-test-'))
  return { dir, stores: createStores(dir) }
}

test('planner: logo goal → design agent route होतो', () => {
  const plan = planRun({ goal: 'माझ्यासाठी logo आणि brand identity हवं' })
  assert.ok(plan.agents.includes('design'))
  assert.equal(plan.mode, 'auto')
})

test('planner: काहीही जुळलं नाही → पूर्ण team', () => {
  const plan = planRun({ goal: 'hello world xyz' })
  assert.equal(plan.agents.length, 4)
})

test('planner: manual selection ला priority', () => {
  const plan = planRun({ goal: 'logo design', selected: ['coding'] })
  assert.deepEqual(plan.agents, ['coding'])
  assert.equal(plan.mode, 'manual')
})

test('pipeline: mock provider वर पूर्ण run चालतो (design→critic→final)', async () => {
  const { stores } = tempStores()
  const events = []
  const session = await runPipeline({
    goal: 'freelance design studio साठी brand identity हवी',
    selectedAgents: ['design'],
    provider: createMockProvider({ ...config, mockDelayMs: 0 }),
    providerId: 'mock',
    cfg: { ...config, mockDelayMs: 0 },
    stores,
    emit: (type, data) => events.push({ type, data }),
  })

  const types = events.map((e) => e.type)
  assert.ok(types.includes('meta'))
  assert.ok(types.includes('agent_start'))
  assert.ok(types.includes('agent_delta'))
  assert.ok(types.includes('agent_done'))
  assert.ok(types.includes('critic_score'))
  assert.ok(types.includes('final_delta'))
  assert.ok(types.includes('saved'))
  assert.equal(types.at(-1), 'done')

  assert.ok(session.outputs.design.length > 100, 'design output substantial आहे')
  assert.ok(session.outputs.critic.length > 50, 'critic output आले')
  assert.ok(session.final.length > 50, 'final आला')
  assert.ok(session.criticScore >= 0 && session.criticScore <= 10)
})

test('memory: run नंतर knowledge save होतो आणि recall ला सापडतो', async () => {
  const { stores } = tempStores()
  await runPipeline({
    goal: 'coffee shop branding project सुरू करायचं',
    selectedAgents: ['design'],
    provider: createMockProvider({ ...config, mockDelayMs: 0 }),
    providerId: 'mock',
    cfg: { ...config, mockDelayMs: 0 },
    stores,
    emit: () => {},
  })

  const entries = await stores.knowledge.all()
  assert.equal(entries.length, 1)

  const hits = await recallKnowledge(stores.knowledge, 'coffee shop ब्रँडिंग कशी करू?', 3)
  assert.ok(hits.length >= 1, 'recall ने जुनी entry शोधली')
})

test('provider router: auto → mock (key नाही, ollama नाही)', async () => {
  const { providerStatus, resolveProvider } = await import('../src/providers/index.js')
  const status = await providerStatus(config)
  if (!status.grok.available && !status.ollama.available) {
    const r = resolveProvider(config, status, 'auto')
    assert.equal(r.id, 'mock')
  }
})
