import { useCallback, useEffect, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import Composer from './components/Composer.jsx'
import AgentCard from './components/AgentCard.jsx'
import FinalPanel from './components/FinalPanel.jsx'
import { getJSON, runStream, getToken, setToken } from './api.js'
import { AGENT_META } from './agents-meta.js'

const EMPTY_RUN = null

function slotFromKey(key) {
  const base = key.split(':v2')[0]
  const meta = AGENT_META[base] || { name: key, emoji: '🤖', color: '#8b94a7' }
  return {
    key,
    agentId: base,
    name: meta.name + (key.endsWith(':v2') ? ' v2' : ''),
    emoji: meta.emoji,
    color: meta.color,
    status: 'running',
    text: '',
    ms: null,
  }
}

export default function App() {
  const [health, setHealth] = useState(null)
  const [sessions, setSessions] = useState([])
  const [knowledge, setKnowledge] = useState([])
  const [authNeeded, setAuthNeeded] = useState(false)
  const [tokenInput, setTokenInput] = useState('')

  const [goal, setGoal] = useState('')
  const [selected, setSelected] = useState([])
  const [provider, setProvider] = useState('auto')
  const [revision, setRevision] = useState(false)

  const [run, setRun] = useState(EMPTY_RUN)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const abortRef = useRef(null)
  const scrollRef = useRef(null)
  const nearBottomRef = useRef(true)

  // ---------------------------------------------------------------- data
  const refreshLists = useCallback(async () => {
    try {
      const [s, k] = await Promise.all([getJSON('/api/sessions'), getJSON('/api/knowledge')])
      setSessions(s)
      setKnowledge(k)
    } catch {
      /* silent */
    }
  }, [])

  useEffect(() => {
    getJSON('/api/health')
      .then((h) => {
        setHealth(h)
        setAuthNeeded(Boolean(h.authRequired) && !getToken())
      })
      .catch((e) => {
        if (/401|Unauthorized/i.test(e.message)) setAuthNeeded(true)
      })
    refreshLists()
  }, [refreshLists])

  // ------------------------------------------------- streaming event flow
  const applyEvent = useCallback((type, data) => {
    setRun((prev) => {
      if (!prev) return prev
      switch (type) {
        case 'recall':
          return { ...prev, recall: data.memories }
        case 'agent_start': {
          const slot = slotFromKey(data.agent)
          slot.name = data.name || slot.name
          slot.emoji = data.emoji || slot.emoji
          slot.color = data.color || slot.color
          return { ...prev, slots: [...prev.slots, slot] }
        }
        case 'agent_delta':
          return {
            ...prev,
            slots: prev.slots.map((s) => (s.key === data.agent ? { ...s, text: s.text + data.delta } : s)),
          }
        case 'agent_done':
          return {
            ...prev,
            slots: prev.slots.map((s) => (s.key === data.agent ? { ...s, status: 'done', ms: data.ms } : s)),
          }
        case 'critic_score':
          return { ...prev, criticScore: data.score }
        case 'revision_start':
          return { ...prev, notes: [...(prev.notes || []), `🔁 Score ${data.score}/10 — auto-revision round सुरू`] }
        case 'final_start':
          return { ...prev, final: { status: 'running', text: '' } }
        case 'final_delta':
          return { ...prev, final: { status: 'running', text: (prev.final?.text || '') + data.delta } }
        case 'final_done':
          return { ...prev, final: { status: 'done', text: prev.final?.text || '' } }
        case 'saved':
          return { ...prev, saved: true }
        case 'done':
          return { ...prev, status: 'done', stats: data }
        case 'error':
          return { ...prev, status: 'error', error: data.message }
        default:
          return prev
      }
    })
  }, [])

  // auto-scroll (फक्त जेव्हा user खाली जवळ असतो)
  useEffect(() => {
    const el = scrollRef.current
    if (el && running && nearBottomRef.current) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [run, running])

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 160
  }

  // ---------------------------------------------------------------- run
  const startRun = async () => {
    if (!goal.trim() || running) return
    setError('')
    setSidebarOpen(false)
    setRunning(true)
    nearBottomRef.current = true

    const ac = new AbortController()
    abortRef.current = ac

    setRun({
      id: '…',
      goal: goal.trim(),
      status: 'streaming',
      provider: provider,
      slots: [],
      recall: [],
      notes: [],
      criticScore: null,
      final: null,
      stats: null,
      saved: false,
    })

    try {
      await runStream(
        { goal: goal.trim(), agents: selected, provider, revision },
        { onEvent: applyEvent, signal: ac.signal }
      )
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message)
      setRun((prev) => (prev ? { ...prev, status: prev.status === 'streaming' ? 'stopped' : prev.status } : prev))
    } finally {
      setRunning(false)
      abortRef.current = null
      refreshLists()
    }
  }

  const stopRun = () => abortRef.current?.abort()

  const toggleAgent = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))

  // ------------------------------------------------- past session loading
  const loadSession = (s, closeSidebar = true) => {
    if (closeSidebar) setSidebarOpen(false)
    if (!s) return
    const slots = Object.entries(s.outputs || {}).map(([key, text]) => ({
      ...slotFromKey(key),
      status: 'done',
      text,
      ms: null,
    }))
    setRun({
      id: s.id,
      goal: s.goal,
      status: 'done',
      provider: s.provider,
      providerLabel: s.provider,
      slots,
      recall: [],
      notes: [],
      criticScore: s.criticScore,
      final: { status: 'done', text: s.final || '' },
      stats: { durationMs: s.durationMs, agents: s.agents.length + 1, chars: 0 },
      saved: true,
      ts: s.ts,
    })
    setError('')
  }

  // ---------------------------------------------------------------- render
  return (
    <div className="app">
      <Header health={health} running={running} onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <Sidebar
        open={sidebarOpen}
        sessions={sessions}
        knowledge={knowledge}
        onPickSession={loadSession}
        activeSessionId={run?.id}
        onRefresh={refreshLists}
      />

      <main className="content" ref={scrollRef} onScroll={onScroll}>
        {authNeeded && (
          <div className="auth-banner">
            🔑 हा server password-protected आहे — Bearer token टाका:
            <input
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="AUTH_TOKEN"
            />
            <button
              onClick={() => {
                setToken(tokenInput)
                setAuthNeeded(false)
                window.location.reload()
              }}
            >
              Save
            </button>
          </div>
        )}

        <Composer
          goal={goal}
          setGoal={setGoal}
          selected={selected}
          toggleAgent={toggleAgent}
          provider={provider}
          setProvider={setProvider}
          revision={revision}
          setRevision={setRevision}
          running={running}
          onRun={startRun}
          onStop={stopRun}
          health={health}
        />

        {error && <div className="error-banner">⚠️ {error}</div>}

        {run && (
          <div className="run-view">
            <div className="run-meta">
              <span className="run-goal">{run.goal}</span>
              <span className="chip">
                {run.provider === 'grok' ? '⚡ Grok' : run.provider === 'ollama' ? '🦙 Ollama' : '🧩 Offline Demo'}
              </span>
            </div>

            {run.recall?.length > 0 && (
              <div className="recall-panel">
                📦 <b>Memory recall:</b> या topic वर आधीचे {run.recall.length} runs आठवले —
                agents ला ते context म्हणून मिळालं
              </div>
            )}

            {(run.notes || []).map((n, i) => (
              <div key={i} className="note-banner">
                {n}
              </div>
            ))}

            <div className="pipeline">
              {run.slots.map((slot) => (
                <AgentCard key={slot.key} slot={slot} />
              ))}

              {run.status === 'streaming' && run.slots.length === 0 && (
                <div className="agent-card st-running">
                  <div className="agent-rail">
                    <span className="agent-dot spin">⚙️</span>
                  </div>
                  <div className="agent-body">
                    <div className="agent-head">
                      <span className="agent-name">Orchestrator</span>
                      <span className="pulse">plan बनवत आहे…</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <FinalPanel final={run.final} criticScore={run.criticScore} stats={run.stats} saved={run.saved} />

            {run.status === 'stopped' && <div className="note-banner">⏹ run थांबवला — जे तयार झालं ते वर आहे</div>}
            {run.status === 'error' && <div className="error-banner">⚠️ {run.error}</div>}
          </div>
        )}

        {!run && (
          <div className="hero">
            <div className="hero-logo">ग</div>
            <h1>
              तुमची <span className="grad">AI Team</span> — एका विनंतीवर, एकाच ठिकाणी
            </h1>
            <p className="hero-sub">
              तुमचं goal → Orchestrator plan बनवतो → 🎨 📣 💼 💻 specialists एकमेकांचं काम वापरून
              काम करतात → 🧪 Critic तपासतो → 🏁 एकत्रित final answer.
            </p>
            <div className="hero-agents">
              {Object.values(AGENT_META).map((a) => (
                <div key={a.id} className="hero-agent" style={{ '--ac': a.color }}>
                  <span className="hero-emoji">{a.emoji}</span>
                  <b>{a.name}</b>
                  <span className="hero-blurb">{a.blurb}</span>
                </div>
              ))}
            </div>
            <p className="hero-note">
              आजच default: <b>Offline Demo mode</b> (कोणतीही API key नाही). <code>XAI_API_KEY</code> टाकली की तीच team Grok वर चालते.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
