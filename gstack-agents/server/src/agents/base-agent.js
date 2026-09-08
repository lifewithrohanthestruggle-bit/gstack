import { AGENTS, CRITIC_ID } from './definitions.js'

/**
 * BaseAgent — provider-agnostic runner.
 *
 * buildMessages() हे खरं heart आहे: येथे agent-to-agent communication होते —
 *   goal + long-term memory + आधीच्या agents चं output (blackboard)
 *   एकत्र होऊन पुढच्या agent च्या context मध्ये जातं.
 */

const BLACKBOARD_CHAR_LIMIT = 1800 // per-agent truncation (token discipline)

function truncate(text, n) {
  if (!text) return ''
  return text.length <= n ? text : text.slice(0, n / 2) + '\n\n[…trimmed…]\n\n' + text.slice(-n / 2)
}

export class BaseAgent {
  constructor(def) {
    Object.assign(this, def)
  }

  buildMessages({ goal, blackboard = [], memories = [], extraInstruction = '' }) {
    const parts = []

    parts.push(`## User चा Goal\n${goal}`)

    if (memories.length) {
      parts.push(
        `## Memory — या workspace बद्दल आधीचा संदर्भ (long-term memory)\n` +
          memories
            .map((m, i) => `${i + 1}. [${new Date(m.ts).toLocaleDateString('en-IN')}] ${m.goal} → ${(m.summary || '').slice(0, 160)}`)
            .join('\n')
      )
    }

    if (blackboard.length) {
      parts.push(
        `## Team Blackboard — तुमच्या आधीच्या agents चं output\n` +
          blackboard
            .map((b) => `### ${b.name}\n${truncate(b.text, BLACKBOARD_CHAR_LIMIT)}`)
            .join('\n\n')
      )
    }

    if (extraInstruction) parts.push(`## Extra instruction\n${extraInstruction}`)

    parts.push(`## तुमचं काम\n${this.taskInstruction}`)

    return [
      { role: 'system', content: this.systemPrompt },
      { role: 'user', content: parts.join('\n\n') },
    ]
  }
}

export const agentInstances = {}
for (const [id, def] of Object.entries(AGENTS)) {
  agentInstances[id] = new BaseAgent(def)
}

export function getAgentInstance(id) {
  return agentInstances[id] || null
}

export function isCritic(id) {
  return id === CRITIC_ID
}
