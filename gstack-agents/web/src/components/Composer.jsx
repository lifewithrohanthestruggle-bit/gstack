import { AGENT_META, EXAMPLES } from '../agents-meta.js'

const CORE = ['design', 'marketing', 'business', 'coding']

export default function Composer({ goal, setGoal, selected, toggleAgent, provider, setProvider, revision, setRevision, running, onRun, onStop, health }) {
  const providerOptions = [
    { id: 'auto', label: '✨ Auto' },
    { id: 'grok', label: `Grok${health?.providers?.grok?.available ? '' : ' (key नाही)'}` },
    { id: 'ollama', label: `Ollama${health?.providers?.ollama?.available ? '' : ' (off)'}` },
    { id: 'mock', label: 'Offline Demo' },
  ]

  return (
    <div className="composer">
      <div className="composer-head">
        <h2>तुमचं उद्दिष्ट लिहा — team बाकी सांभाळेल</h2>
      </div>

      <textarea
        className="goal-input"
        rows={3}
        value={goal}
        placeholder="उदा. माझ्या design studio साठी नवं brand identity + Instagram launch plan हवं…"
        onChange={(e) => setGoal(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !running) onRun()
        }}
        disabled={running}
      />

      <div className="example-row">
        {EXAMPLES.map((ex, i) => (
          <button key={i} className="example-chip" onClick={() => setGoal(ex)} disabled={running} title={ex}>
            {ex.length > 42 ? ex.slice(0, 42) + '…' : ex}
          </button>
        ))}
      </div>

      <div className="controls">
        <div className="agent-chips">
          <span className="controls-label">Team:</span>
          {CORE.map((id) => {
            const a = AGENT_META[id]
            const on = selected.includes(id)
            return (
              <button
                key={id}
                className={`agent-chip ${on ? 'on' : ''}`}
                style={on ? { borderColor: a.color, background: `${a.color}22`, boxShadow: `inset 0 0 0 1px ${a.color}55` } : {}}
                onClick={() => toggleAgent(id)}
                disabled={running}
                title={a.blurb}
              >
                <span>{a.emoji}</span> {a.name}
              </button>
            )
          })}
          {selected.length === 0 && <span className="auto-note">Auto — planner ने ठरवले ✨</span>}
        </div>

        <div className="right-controls">
          <label className="revision-toggle" title="Critic चा score कमी असेल तर एक improvement round जास्त">
            <input type="checkbox" checked={revision} onChange={(e) => setRevision(e.target.checked)} disabled={running} />
            Auto-revision
          </label>

          <select className="provider-select" value={provider} onChange={(e) => setProvider(e.target.value)} disabled={running}>
            {providerOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          {running ? (
            <button className="run-btn stop" onClick={onStop}>
              ⏹ थांबवा
            </button>
          ) : (
            <button className="run-btn" onClick={onRun} disabled={!goal.trim()}>
              ▶ चालवा
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
