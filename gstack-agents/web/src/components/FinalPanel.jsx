import { useMemo } from 'react'
import { renderMarkdown } from '../markdown.js'

export default function FinalPanel({ final, criticScore, stats, saved }) {
  if (!final || (!final.text && final.status !== 'running')) return null
  const html = useMemo(() => renderMarkdown(final.text || ''), [final.text])

  return (
    <div className={`final-panel ${final.status === 'done' ? 'done' : ''}`}>
      <div className="final-glow" />
      <div className="final-head">
        <span className="final-title">🏁 Final Answer</span>
        {criticScore != null && (
          <span className={`score-badge big ${criticScore >= 8.5 ? 'good' : criticScore >= 7.5 ? 'ok' : 'bad'}`}>
            {criticScore}/10
          </span>
        )}
        {final.status === 'running' && <span className="pulse">synthesize होत आहे…</span>}
      </div>

      <div className="final-md">
        <div dangerouslySetInnerHTML={{ __html: html }} />
        {final.status === 'running' && <span className="cursor">▍</span>}
      </div>

      <div className="final-foot">
        {stats && (
          <span>
            ⏱ {(stats.durationMs / 1000).toFixed(1)}s · {stats.agents} agents · {stats.chars.toLocaleString('en-IN')} chars
          </span>
        )}
        {saved && <span className="chip saved-chip">💾 memory मध्ये save झालं</span>}
      </div>
    </div>
  )
}
