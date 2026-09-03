import { useMemo } from 'react'
import { renderMarkdown } from '../markdown.js'

export default function AgentCard({ slot }) {
  const html = useMemo(() => renderMarkdown(slot.text || ''), [slot.text])
  const isCritic = slot.agentId === 'critic'
  const scoreMatch = slot.text?.match(/(\d+(?:\.\d+)?)\s*\/\s*10/)
  const score = isCritic && slot.status === 'done' && scoreMatch ? scoreMatch[0] : null

  return (
    <div className={`agent-card st-${slot.status}`} style={{ '--ac': slot.color || '#8b94a7' }}>
      <div className="agent-rail">
        <span className="agent-dot">{slot.emoji}</span>
        <span className="agent-line" />
      </div>

      <div className="agent-body">
        <div className="agent-head">
          <span className="agent-name">{slot.name}</span>
          {slot.key.endsWith(':v2') && <span className="chip v2">v2</span>}
          {score && (
            <span className={`score-badge ${parseFloat(score) >= 8.5 ? 'good' : parseFloat(score) >= 7.5 ? 'ok' : 'bad'}`}>
              {score}
            </span>
          )}
          <span className="agent-status">
            {slot.status === 'running' && <span className="pulse">काम करत आहे…</span>}
            {slot.status === 'done' && (
              <span className="done-meta">
                ✓ {slot.ms ? `${(slot.ms / 1000).toFixed(1)}s · ` : ''}
                {slot.text.length} chars
              </span>
            )}
            {slot.status === 'error' && <span className="err">✗ अयशस्वी</span>}
          </span>
        </div>

        {(slot.text || slot.status === 'running') && (
          <div className="agent-md">
            <div dangerouslySetInnerHTML={{ __html: html }} />
            {slot.status === 'running' && <span className="cursor">▍</span>}
          </div>
        )}
      </div>
    </div>
  )
}
