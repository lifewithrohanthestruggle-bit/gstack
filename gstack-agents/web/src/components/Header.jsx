export default function Header({ health, onToggleSidebar, running }) {
  const dot = (ok) => <span className={`dot ${ok ? 'dot-ok' : 'dot-off'}`} />

  return (
    <header className="header">
      <button className="icon-btn sidebar-toggle" onClick={onToggleSidebar} aria-label="menu">
        ☰
      </button>

      <div className="brand">
        <span className="brand-mark">ग</span>
        <span className="brand-name">
          GStack <em>Agents</em>
        </span>
        <span className="chip chip-ver">v0.1 · MVP</span>
      </div>

      <div className="header-right">
        {health ? (
          <div className="provider-pill" title="Active model providers">
            {dot(health.providers?.grok?.available)} Grok
            <span className="sep">·</span>
            {dot(health.providers?.ollama?.available)} Ollama
            <span className="sep">·</span>
            {dot(true)} Offline
          </div>
        ) : (
          <span className="provider-pill muted">connecting…</span>
        )}
        {running && <span className="chip chip-live">● LIVE</span>}
      </div>
    </header>
  )
}
