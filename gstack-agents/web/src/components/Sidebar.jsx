import { getJSON, postJSON } from '../api.js'

const fmtDate = (ts) =>
  new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function Sidebar({ open, sessions, knowledge, onPickSession, activeSessionId, onRefresh, onClearMemory }) {
  const handleClear = async () => {
    if (!confirm('Long-term memory पूर्ण wipe करूया का? (sessions राहतील)')) return
    try {
      await postJSON('/api/knowledge/clear', {})
      onRefresh()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'show' : ''}`} onClick={() => onPickSession(null, true)} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <section className="side-section">
          <h3>📁 Sessions</h3>
          {sessions.length === 0 && <p className="side-empty">अजून कोणताही run नाही</p>}
          <ul className="session-list">
            {sessions.map((s) => (
              <li key={s.id}>
                <button
                  className={`session-item ${s.id === activeSessionId ? 'active' : ''}`}
                  onClick={() => getJSON(`/api/sessions/${s.id}`).then((d) => onPickSession(d, false)).catch(() => {})}
                >
                  <span className="session-goal">{s.goal}</span>
                  <span className="session-meta">
                    {fmtDate(s.ts)} · {s.agents.length} agents
                    {s.criticScore != null && <span className="score-mini"> · {s.criticScore}/10</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="side-section grow">
          <h3>
            🧠 Memory
            <span className="count-pill">{knowledge.length}</span>
            {knowledge.length > 0 && (
              <button className="link-btn" onClick={handleClear} title="memory clear करा">
                forget all
              </button>
            )}
          </h3>
          {knowledge.length === 0 && (
            <p className="side-empty">प्रत्येक run नंतर system ला तुमचं project आठवतं — memory इथे build होते</p>
          )}
          <ul className="memory-list">
            {knowledge.slice(0, 12).map((k) => (
              <li key={k.id} className="memory-item">
                <span className="memory-goal">{k.goal}</span>
                <span className="memory-tags">
                  {(k.tags || []).map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="side-footer">
          <span>Open Source · MIT</span>
          <a href="https://github.com" target="_blank" rel="noreferrer" onClick={(e) => e.preventDefault()} title="repo docs/ पहा">
            GitHub
          </a>
        </footer>
      </aside>
    </>
  )
}
