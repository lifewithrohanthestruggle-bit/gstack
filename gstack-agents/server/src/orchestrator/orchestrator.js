/**
 * Orchestrator — पूर्ण pipeline चा conductor.
 *
 * Flow:
 *   goal → planner → [agent → agent → …] (blackboard passing)
 *        → critic (score/gaps) → (optional revision round)
 *        → final synthesis → save session + knowledge
 *
 * emit(type, data) callback वर सगळे events जातात (SSE किंवा CLI printer).
 */

import crypto from 'node:crypto'
import { getAgentInstance } from '../agents/base-agent.js'
import { CRITIC_ID } from '../agents/definitions.js'
import { recallKnowledge } from '../memory/recall.js'
import { planRun } from './planner.js'

const SCORE_RE = /\*{0,2}\s*(?:score|स्कोअर)\s*:?\s*\*{0,2}\s*(\d+(?:\.\d+)?)\s*\/\s*10/i

function parseScore(criticText) {
  const m = criticText.match(SCORE_RE)
  if (!m) return null
  const n = Number(m[1])
  return n >= 0 && n <= 10 ? n : null
}

export async function runPipeline({ goal, selectedAgents = [], provider, providerId, revision = false, cfg, stores, emit, signal }) {
  const sessionId = crypto.randomUUID()
  const t0 = Date.now()

  const plan = planRun({ goal, selected: selectedAgents })
  const agentIds = plan.agents
  const checkAbort = () => {
    if (signal?.aborted) {
      const e = new Error('Run थांबवला गेला (client disconnect / timeout)')
      e.aborted = true
      throw e
    }
  }

  emit('meta', {
    sessionId,
    goal,
    provider: providerId,
    providerLabel: provider.label,
    plan: { agents: agentIds, mode: plan.mode, reason: plan.reason },
    revision,
  })

  // ---- 1) Long-term memory recall --------------------------------------
  let memories = []
  try {
    memories = await recallKnowledge(stores.knowledge, goal, 3)
  } catch {
    /* memory चा bug आडवा येऊ नये मुख्य run ला */
  }
  if (memories.length) emit('recall', { memories })

  // ---- 2) Agent team (sequential, blackboard passing) -------------------
  const blackboard = []
  const outputs = {}
  const streamAgent = async ({ id, key = id, extraInstruction = '' }) => {
    checkAbort()
    const agent = getAgentInstance(id)
    if (!agent) return
    const t = Date.now()
    emit('agent_start', { agent: key, name: agent.name, emoji: agent.emoji, color: agent.color })
    let text = ''
    try {
      const messages = agent.buildMessages({ goal, blackboard, memories, extraInstruction })
      for await (const { delta } of provider.chat({
        messages,
        ctx: { agentId: id, goal, blackboard, sessionId },
        signal,
      })) {
        text += delta
        emit('agent_delta', { agent: key, delta })
      }
    } catch (err) {
      if (text) {
        emit('agent_delta', { agent: key, delta: `\n\n> ⚠️ stream तुटला: ${err.message}` })
      } else {
        text = `> ⚠️ **${agent.name} चालू शकला नाही:** ${err.message}`
        emit('agent_delta', { agent: key, delta: text })
      }
    }
    outputs[key] = text
    blackboard.push({ agent: id, name: agent.name, text })
    emit('agent_done', { agent: key, ms: Date.now() - t, chars: text.length })
  }

  for (const id of agentIds) {
    await streamAgent({ id })
  }

  // ---- 3) Critic — quality gate -----------------------------------------
  await streamAgent({ id: CRITIC_ID })
  const criticText = outputs[CRITIC_ID] || ''
  const score = parseScore(criticText)
  if (score !== null) emit('critic_score', { score })

  // ---- 4) Revision round (optional) -------------------------------------
  if (revision && score !== null && score < 7.5 && agentIds.length) {
    emit('revision_start', { agent: agentIds[0], score })
    await streamAgent({
      id: agentIds[0],
      key: `${agentIds[0]}:v2`,
      extraInstruction: `Critic Agent ने एकूण score ${score}/10 दिला. त्याचं feedback खाली आहे. तुमचं output नव्याने, जास्त specific आणि जास्त actionable करून लिहा (v2):\n\n${criticText.slice(0, 1200)}`,
    })
  }

  // ---- 5) Final synthesis -------------------------------------------------
  checkAbort()
  emit('final_start', {})
  let finalText = ''
  try {
    if (providerId === 'mock') {
      // Offline mode मध्ये compiled final — खरं LLM synthesizer नाही
      const { mockFinal } = await import('./mock-final.js')
      for await (const chunk of mockFinal(cfg, goal, blackboard)) {
        finalText += chunk
        emit('final_delta', { delta: chunk })
      }
    } else {
      const messages = [
        {
          role: 'system',
          content:
            'You are the Orchestrator — the team lead who delivers the final answer. Same language as the user. Clean Markdown. No new ideas — synthesize what the team produced into one decisive, prioritized action plan. Max ~400 words.',
        },
        {
          role: 'user',
          content:
            `## Goal\n${goal}\n\n## Team outputs\n` +
            blackboard.map((b) => `### ${b.name}\n${b.text.slice(0, 1500)}`).join('\n\n') +
            '\n\n## तुमचं काम\nएक executive summary + execution order (काय आधी, काय नंतर) + पहिल्या 30 दिवसांचे milestones.',
        },
      ]
      for await (const { delta } of provider.chat({
        messages,
        ctx: { agentId: 'final', goal, blackboard, sessionId },
      })) {
        finalText += delta
        emit('final_delta', { delta })
      }
    }
  } catch (err) {
    finalText = finalText || `> ⚠️ Final synthesis अयशस्वी: ${err.message}`
    emit('final_delta', { delta: finalText })
  }
  emit('final_done', { chars: finalText.length })

  // ---- 6) Persist: session + knowledge -----------------------------------
  const durationMs = Date.now() - t0
  const session = {
    id: sessionId,
    ts: Date.now(),
    goal,
    provider: providerId,
    agents: agentIds,
    planMode: plan.mode,
    status: 'done',
    durationMs,
    outputs,
    criticScore: score,
    final: finalText,
  }
  let knowledgeId = null
  try {
    await stores.sessions.append(session)
    knowledgeId = (
      await stores.knowledge.append({
        ts: Date.now(),
        goal,
        tags: agentIds,
        provider: providerId,
        summary: finalText.replace(/[#*>`|-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300),
      })
    ).id
  } catch (err) {
    emit('warning', { message: `save अयशस्वी: ${err.message}` })
  }

  emit('saved', { sessionId, knowledgeId })
  emit('done', {
    sessionId,
    durationMs,
    agents: agentIds.length + 1,
    chars: Object.values(outputs).reduce((a, t) => a + t.length, 0) + finalText.length,
    score,
  })

  return session
}
