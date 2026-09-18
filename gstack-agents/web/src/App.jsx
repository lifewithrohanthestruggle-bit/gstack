import { useEffect, useState } from 'react'

const navItems = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'scan', label: 'Scan', icon: 'scan' },
  { id: 'queue', label: 'Queue', icon: 'queue' },
  { id: 'chat', label: 'Chat', icon: 'chat' },
  { id: 'profile', label: 'Me', icon: 'user' },
]

const quickActions = [
  { id: 'scan', label: 'Skin Scan', description: 'Check in with your skin', icon: 'scan', tone: 'peach' },
  { id: 'chat', label: 'AI Chat', description: 'Ask a skin question', icon: 'chat', tone: 'lavender' },
  { id: 'queue', label: 'Doctor', description: 'Talk to a specialist', icon: 'doctor', tone: 'blue' },
  { id: 'routine', label: 'My Routine', description: 'Stay on top of your care', icon: 'routine', tone: 'yellow' },
]

const routineItems = [
  { id: 1, time: 'Morning', name: 'Gentle cleanser', detail: 'Wash with lukewarm water', icon: 'droplet' },
  { id: 2, time: 'Morning', name: 'Daily sunscreen', detail: 'SPF 30 or higher', icon: 'sun' },
  { id: 3, time: 'Evening', name: 'Hydrating serum', detail: 'Two to three drops', icon: 'sparkle' },
  { id: 4, time: 'Evening', name: 'Moisturizer', detail: 'Lock in the good stuff', icon: 'leaf' },
]

const doctors = [
  {
    name: 'Dr. Aditi Mehra',
    specialty: 'Clinical Dermatologist',
    experience: '12 years experience',
    initials: 'AM',
    color: 'rose',
    next: 'Today · 6:30 PM',
  },
  {
    name: 'Dr. Kabir Shah',
    specialty: 'Cosmetic Dermatologist',
    experience: '9 years experience',
    initials: 'KS',
    color: 'sage',
    next: 'Tomorrow · 11:00 AM',
  },
]

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-6h6v6" /></>,
    scan: <><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M16 3h3a2 2 0 0 1 2 2v3" /><path d="M8 21H5a2 2 0 0 1-2-2v-3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /><circle cx="12" cy="12" r="4.25" /><path d="M12 10v4M10 12h4" /></>,
    queue: <><path d="M7 3h10v18H7z" /><path d="M9.5 7h5M9.5 11h5M9.5 15h3" /><path d="m4 7-1 1 1 1M4 13l-1 1 1 1" /></>,
    chat: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.4 8.4 0 0 1-3.5-.75L4 20l1.35-3.55A7.2 7.2 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 8 7Z" /><path d="M8.5 12h.01M12 12h.01M15.5 12h.01" strokeWidth="2.5" /></>,
    user: <><circle cx="12" cy="8" r="3.25" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    arrow: <><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></>,
    arrowUp: <><path d="M6 18 18 6" /><path d="M8 6h10v10" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    doctor: <><path d="M9 4.5a3 3 0 0 0-3 3v2.25a6 6 0 0 0 12 0V9" /><path d="M15 4.5v3a2 2 0 1 0 4 0v-1" /><path d="M9 4.5a2 2 0 0 1 4 0v.75" /><path d="M12 16v4" /><path d="M9 20h6" /></>,
    routine: <><path d="M6 4h12v17H6z" /><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h3" /></>,
    shield: <><path d="M12 21s8-3.75 8-10.5V5l-8-3-8 3v5.5C4 17.25 12 21 12 21Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
    camera: <><path d="M4 7h3l1.4-2h7.2L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="3.5" /></>,
    upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></>,
    sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
    droplet: <><path d="M12 3.5S6.5 9.5 6.5 14.25a5.5 5.5 0 0 0 11 0C17.5 9.5 12 3.5 12 3.5Z" /><path d="M9.5 15.5a2.8 2.8 0 0 0 2.5 1.7" /></>,
    leaf: <><path d="M20 4C10 4 5 8.5 5 14.5A5.5 5.5 0 0 0 10.5 20C16.5 20 20 14 20 4Z" /><path d="M4 21c2.2-4.3 5.2-7.3 10-10" /></>,
    sparkle: <><path d="m12 3 1.25 4.75L18 9l-4.75 1.25L12 15l-1.25-4.75L6 9l4.75-1.25L12 3Z" /><path d="m19 15 .6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6L19 15Z" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    send: <><path d="m21 3-7.5 18-3.5-7-7-3.5L21 3Z" /><path d="M10 14 21 3" /></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8.5 21h7" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.75 9a2.35 2.35 0 1 1 3.95 1.7c-.9.8-1.7 1.15-1.7 2.55" /><path d="M12 17h.01" strokeWidth="2.4" /></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
  }

  return <svg {...common}>{paths[name] || paths.help}</svg>
}

function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`}>
      <span className="brand-mark"><Icon name="sparkle" size={19} strokeWidth={2.2} /></span>
      {!compact && (
        <span className="brand-wordmark">
          Dermasaathi <span>AI</span>
        </span>
      )}
    </div>
  )
}

function Avatar({ initials = 'R', size = 'small' }) {
  return <span className={`avatar avatar-${size}`}>{initials}</span>
}

function Sidebar({ activeView, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <Brand />
        <span className="sidebar-tagline">Your skin, understood.</span>
      </div>
      <nav className="sidebar-nav" aria-label="Primary navigation">
        <span className="nav-label">Workspace</span>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`side-nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <Icon name={item.icon} size={19} />
            <span>{item.label}</span>
            {item.id === 'queue' && <span className="nav-badge">2</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-note">
        <span className="note-icon"><Icon name="shield" size={17} /></span>
        <div>
          <strong>Your data is safe</strong>
          <span>Private by design</span>
        </div>
      </div>
      <button className="sidebar-profile" onClick={() => onNavigate('profile')}>
        <Avatar initials="R" />
        <span><strong>Rohan</strong><small>My profile</small></span>
        <Icon name="chevron" size={16} />
      </button>
    </aside>
  )
}

function Topbar({ onNotify, onProfile, onNavigate }) {
  return (
    <header className="topbar">
      <div className="topbar-mobile-brand"><Brand compact /></div>
      <div className="breadcrumb"><span>Home</span><span className="breadcrumb-dot">/</span><strong>Overview</strong></div>
      <div className="topbar-actions">
        <button className="icon-button notification-button" aria-label="Notifications" onClick={onNotify}>
          <Icon name="bell" size={19} />
          <span className="notification-dot" />
        </button>
        <span className="topbar-divider" />
        <button className="topbar-profile" onClick={onProfile}>
          <Avatar initials="R" />
          <span>Rohan</span>
          <Icon name="chevron" size={14} />
        </button>
      </div>
    </header>
  )
}

function ScanArtwork() {
  return (
    <div className="scan-artwork" aria-hidden="true">
      <span className="scan-orbit scan-orbit-one" />
      <span className="scan-orbit scan-orbit-two" />
      <span className="scan-orbit scan-orbit-three" />
      <div className="face-illustration">
        <span className="face-hair" />
        <span className="face-shape" />
        <span className="face-eye face-eye-left" />
        <span className="face-eye face-eye-right" />
        <span className="face-brow face-brow-left" />
        <span className="face-brow face-brow-right" />
        <span className="face-nose" />
        <span className="face-mouth" />
        <span className="face-glow face-glow-one" />
        <span className="face-glow face-glow-two" />
      </div>
      <span className="scan-corner corner-one" />
      <span className="scan-corner corner-two" />
      <span className="scan-corner corner-three" />
      <span className="scan-corner corner-four" />
      <span className="art-sparkle sparkle-one"><Icon name="sparkle" size={16} /></span>
      <span className="art-sparkle sparkle-two"><Icon name="sparkle" size={11} /></span>
    </div>
  )
}

function ScanCard({ onStart }) {
  return (
    <section className="scan-card">
      <div className="scan-card-copy">
        <span className="eyebrow eyebrow-light"><Icon name="sparkle" size={13} /> AI skin scan</span>
        <h2>Analyze your skin<br /><em>safely.</em></h2>
        <p>Get a clearer view of what your skin needs today with a safe, gentle AI check-in.</p>
        <div className="scan-card-meta"><span><Icon name="clock" size={14} /> Takes 60 seconds</span><span><Icon name="lock" size={14} /> Private &amp; secure</span></div>
        <button className="primary-button light-button" onClick={onStart}>
          Start scan <Icon name="arrow" size={17} />
        </button>
      </div>
      <ScanArtwork />
      <span className="scan-card-decoration decoration-one" />
      <span className="scan-card-decoration decoration-two" />
    </section>
  )
}

function QuickAccess({ onNavigate }) {
  return (
    <section className="section-block quick-section">
      <div className="section-heading">
        <div><span className="section-kicker">Make it easy</span><h2>Quick access</h2></div>
        <span className="section-count">4 tools</span>
      </div>
      <div className="quick-grid">
        {quickActions.map((action) => (
          <button key={action.id} className={`quick-card quick-${action.tone}`} onClick={() => onNavigate(action.id)}>
            <span className="quick-icon"><Icon name={action.icon} size={21} /></span>
            <span className="quick-copy"><strong>{action.label}</strong><small>{action.description}</small></span>
            <span className="quick-arrow"><Icon name="arrowUp" size={16} /></span>
          </button>
        ))}
      </div>
    </section>
  )
}

function SkinSnapshot({ onNavigate }) {
  return (
    <section className="snapshot-grid">
      <div className="snapshot-card insight-card">
        <div className="card-topline"><span className="section-kicker">Your skin journey</span><button className="text-button" onClick={() => onNavigate('scan')}>View history <Icon name="arrow" size={14} /></button></div>
        <div className="insight-main">
          <div className="score-ring"><span>—</span><small>last scan</small></div>
          <div className="insight-copy"><h3>Your first scan is waiting.</h3><p>Start a simple baseline so Dermasaathi can help you spot changes over time.</p><button className="inline-link" onClick={() => onNavigate('scan')}>Begin your journey <Icon name="arrow" size={14} /></button></div>
        </div>
      </div>
      <div className="snapshot-card care-card">
        <span className="care-icon"><Icon name="leaf" size={20} /></span>
        <span className="section-kicker">Today&apos;s care note</span>
        <h3>Small steps, steady skin.</h3>
        <p>Don&apos;t forget to reapply sunscreen if you&apos;re heading outside.</p>
        <span className="care-footer"><Icon name="sun" size={14} /> SPF is self-care</span>
      </div>
    </section>
  )
}

function HomeView({ onNavigate, onNotify }) {
  return (
    <div className="page home-page">
      <section className="welcome-row">
        <div>
          <span className="welcome-overline">Wednesday, 18 September 2026 <span className="status-dot" /></span>
          <h1>Good afternoon, <span>Rohan</span></h1>
          <p>Let&apos;s understand your skin, one gentle step at a time.</p>
        </div>
        <button className="help-link" onClick={onNotify}><Icon name="help" size={16} /> How it works</button>
      </section>
      <ScanCard onStart={() => onNavigate('scan')} />
      <QuickAccess onNavigate={onNavigate} />
      <SkinSnapshot onNavigate={onNavigate} />
      <section className="privacy-strip"><Icon name="shield" size={17} /><span><strong>Built for mindful skin care.</strong> Dermasaathi offers guidance, not a diagnosis. Always consult a dermatologist for concerns.</span><button onClick={onNotify}>Learn more <Icon name="arrow" size={14} /></button></section>
    </div>
  )
}

function CaptureStep({ activeSide, capturedViews, onSelectSide, onCapture }) {
  const sides = ['front', 'left', 'right']
  const sideLabels = { front: 'Front', left: 'Left', right: 'Right' }
  const currentIndex = sides.indexOf(activeSide)
  const isCurrentCaptured = capturedViews.includes(activeSide)

  return (
    <div className="capture-panel">
      <div className="capture-heading"><h3>Capture your skin</h3><span>{capturedViews.length} of 3 photos</span></div>
      <div className="capture-viewport">
        <span className="camera-corner camera-corner-tl" /><span className="camera-corner camera-corner-tr" />
        <span className="camera-corner camera-corner-bl" /><span className="camera-corner camera-corner-br" />
        <div className="capture-face"><span className="capture-hair" /><span className="capture-eye capture-eye-left" /><span className="capture-eye capture-eye-right" /><span className="capture-nose" /><span className="capture-mouth" /></div>
        <span className="capture-focus"><Icon name="scan" size={17} /></span>
      </div>
      <ul className="capture-checklist"><li><span><Icon name="check" size={12} /></span>Remove glasses</li><li><span><Icon name="check" size={12} /></span>Natural lighting</li><li><span><Icon name="check" size={12} /></span>No beauty filter</li></ul>
      <button className="capture-button" onClick={onCapture} disabled={isCurrentCaptured}><Icon name="camera" size={17} /> {isCurrentCaptured ? `${sideLabels[activeSide]} captured` : 'Capture'}</button>
      <div className="capture-sides" aria-label="Choose capture angle">{sides.map((side, index) => <button key={side} className={`${activeSide === side ? 'active' : ''} ${capturedViews.includes(side) ? 'captured' : ''}`} onClick={() => onSelectSide(side)}><span>{capturedViews.includes(side) ? <Icon name="check" size={11} /> : index + 1}</span>{sideLabels[side]}</button>)}</div>
      <p className="capture-helper">{isCurrentCaptured ? (currentIndex < sides.length - 1 ? `Turn slightly to your ${sides[currentIndex + 1]} side.` : 'All angles are ready. We will start your scan next.') : 'Keep your face inside the frame and look straight ahead.'}</p>
    </div>
  )
}

function ScanView({ onBack, status, onStart, onReset, selectedPhoto, onPhoto, activeSide, capturedViews, onSelectSide, onCapture, onSafetyCheck }) {
  const statusCopy = status === 'scanning'
    ? { eyebrow: 'Analyzing gently', title: 'Looking a little closer…', detail: 'Keep still while we check your skin. This usually takes less than a minute.' }
    : status === 'complete'
      ? { eyebrow: 'Your scan is ready', title: 'A helpful first look.', detail: 'We found a few patterns to help you build a more mindful routine.' }
      : status === 'safety'
        ? { eyebrow: 'Safety check', title: 'Let’s keep your skin safe.', detail: 'A few quick questions help us make the next step more responsible.' }
        : status === 'capture'
        ? { eyebrow: 'Camera capture', title: 'Ready when you are.', detail: 'We will capture three quick angles so your skin gets the attention it deserves.' }
        : { eyebrow: 'AI skin scan', title: "Let's check in with your skin.", detail: 'A well-lit, makeup-free photo helps us give you the most useful guidance.' }

  return (
    <div className="page tool-page scan-page">
      <PageHeader eyebrow="Skin scan" title="A gentle check-in" description="Understand your skin today, without the guesswork." onBack={onBack} />
      <div className={`scan-workspace status-${status}`}>
        <div className="scan-stage">
          {status === 'complete' ? <div className="complete-illustration"><span><Icon name="check" size={34} /></span><i /><i /><i /></div> : <ScanArtwork />}
          {status === 'scanning' && <span className="scan-line" />}
          <div className="scan-stage-copy"><span className="eyebrow"><Icon name={status === 'complete' ? 'sparkle' : 'scan'} size={13} /> {statusCopy.eyebrow}</span><h2>{status === 'ready' ? <>Let&apos;s understand<br />your skin.</> : statusCopy.title}</h2><p>{statusCopy.detail}</p></div>
        </div>
        <div className="scan-options">
          {status === 'complete' ? <ResultSummary onReset={onReset} onSafetyCheck={onSafetyCheck} /> : status === 'safety' ? <SafetyCheck /> : status === 'scanning' ? <ScanProgress /> : status === 'capture' ? <CaptureStep activeSide={activeSide} capturedViews={capturedViews} onSelectSide={onSelectSide} onCapture={onCapture} /> : <>
            <div className="scan-option-heading"><h3>Choose how to scan</h3><span>Step 1 of 2</span></div>
            <button className="scan-option" onClick={onStart}><span className="option-icon option-camera"><Icon name="camera" size={21} /></span><span><strong>Use my camera</strong><small>Best for a live, guided scan</small></span><Icon name="chevron" size={17} /></button>
            <label className="scan-option" htmlFor="photo-upload"><span className="option-icon option-upload"><Icon name="upload" size={21} /></span><span><strong>Upload a photo</strong><small>{selectedPhoto ? selectedPhoto : 'Use a clear photo from your device'}</small></span><Icon name="chevron" size={17} /><input id="photo-upload" type="file" accept="image/*" onChange={onPhoto} /></label>
            <div className="scan-tip"><span><Icon name="sun" size={16} /></span><p><strong>Quick tip</strong> Face a window for soft, natural light. No filters needed.</p></div>
          </>}
        </div>
      </div>
      <div className="tool-safety"><Icon name="shield" size={17} /><span>Your photo is processed securely and is never shared without your permission.</span><button>Privacy policy <Icon name="arrow" size={13} /></button></div>
    </div>
  )
}

function ScanProgress() {
  const checks = ['Face quality', 'Visible redness', 'Texture', 'Pigmentation']

  return <div className="scan-progress analysis-progress"><div className="analysis-heading"><span className="eyebrow"><Icon name="scan" size={13} /> AI screening</span><h3>Analyzing your images...</h3><p>We&apos;re looking at a few gentle signals in your skin.</p></div><div className="analysis-content"><div className="analysis-list">{checks.map((item) => <div className="analysis-row" key={item}><span>{item}</span><span className="analysis-check"><Icon name="check" size={13} /></span></div>)}</div><div className="analysis-score"><strong>68<span>%</span></strong><small>complete</small></div></div><div className="progress-track analysis-track"><span /></div><div className="analysis-footer"><Icon name="shield" size={15} /><span>AI screening <b>≠</b> medical diagnosis</span></div></div>
}

const screeningMetrics = [
  { label: 'Pigmentation', level: 3, note: 'Visible signs' },
  { label: 'Redness', level: 2, note: 'Mild appearance' },
  { label: 'Texture', level: 3, note: 'Some unevenness' },
  { label: 'Oiliness', level: 4, note: 'Appears elevated' },
]

function ScreeningDots({ level }) {
  return <span className="screening-dots" aria-label={`${level} out of 5`}>
    {Array.from({ length: 5 }, (_, index) => <i className={index < level ? 'filled' : ''} key={index} />)}
  </span>
}

function ResultSummary({ onReset, onSafetyCheck }) {
  return <div className="result-summary screening-result"><div className="screening-result-head"><div><span className="eyebrow"><Icon name="sparkle" size={13} /> Your skin screening</span><h3>YOUR SKIN SCREENING</h3><p>Here&apos;s what we noticed in your images.</p></div><span className="result-check"><Icon name="check" size={18} /></span></div><div className="screening-list">{screeningMetrics.map((metric) => <div className="screening-row" key={metric.label}><strong>{metric.label}</strong><div className="screening-reading"><ScreeningDots level={metric.level} /><span>{metric.note}</span></div></div>)}</div><div className="result-note"><Icon name="shield" size={16} /><p><strong>AI screening is not a medical diagnosis.</strong> Use these observations as a starting point for your skin-care journey.</p></div><button className="primary-button screening-continue" onClick={onSafetyCheck}>Continue <Icon name="arrow" size={15} /></button><button className="secondary-button" onClick={onReset}>Run another scan <Icon name="arrow" size={15} /></button></div>
}

const safetyQuestions = ['Severe swelling', 'Blisters', 'Eye involvement', 'Breathing difficulty', 'Rapidly worsening symptoms']

function SafetyCheck() {
  const [selected, setSelected] = useState([])
  const [submitted, setSubmitted] = useState(false)

  const toggleQuestion = (question) => setSelected((current) => current.includes(question) ? current.filter((item) => item !== question) : [...current, question])

  if (submitted) {
    return <div className="safety-panel safety-confirmed"><span className="safety-confirm-icon"><Icon name="check" size={22} /></span><span className="eyebrow">Safety check saved</span><h3>Thank you for checking in.</h3><p>{selected.length > 0 ? 'Because you selected a warning sign, please contact a medical professional before trying anything new.' : 'No warning signs selected. We’ll keep your next steps gentle and simple.'}</p><button className="secondary-button" onClick={() => setSubmitted(false)}>Review answers <Icon name="arrow" size={15} /></button></div>
  }

  return <div className="safety-panel"><div className="safety-mode"><span className="safety-warning">⚠</span><span>SKIN REACTION MODE</span></div><h3>Your symptoms may need extra care.</h3><p>Before recommending anything,<br />let&apos;s check a few safety questions.</p><strong className="safety-question-label">Do you have:</strong><div className="safety-list">{safetyQuestions.map((question) => <label className={`safety-option ${selected.includes(question) ? 'selected' : ''}`} key={question}><input type="checkbox" checked={selected.includes(question)} onChange={() => toggleQuestion(question)} /><span className="safety-box"><Icon name="check" size={12} /></span><span>{question}</span></label>)}</div><button className="primary-button safety-continue" onClick={() => setSubmitted(true)}>Continue <Icon name="arrow" size={15} /></button><p className="safety-footnote"><Icon name="shield" size={14} /> If symptoms are severe or worsening, seek urgent medical care.</p></div>
}

function ChatView({ onBack }) {
  const [input, setInput] = useState('')
  const [conversation, setConversation] = useState(false)
  const [listening, setListening] = useState(false)
  const [messages, setMessages] = useState([])
  const topics = ['Acne', 'Dark spots', 'Redness', 'Reaction', 'Dryness', 'Something else']

  const sendMessage = (value = input) => {
    const clean = value.trim()
    if (!clean) return
    setConversation(true)
    setMessages((current) => [...current, { from: 'user', text: clean }, { from: 'ai', text: 'Thanks for sharing that. I can help you understand what you are noticing and suggest a gentle next step.' }])
    setInput('')
  }

  const speak = () => {
    setListening(true)
    window.setTimeout(() => setListening(false), 2200)
  }

  return <div className="page tool-page assistant-page"><div className="assistant-topbar"><button className="assistant-back" onClick={onBack}><Icon name="arrow" size={17} /><span>Back home</span></button><div className="assistant-wordmark"><strong>DERMASAATHI <b>AI</b></strong><span>SkinCare Assistant</span></div><span className="assistant-online"><i /> Online</span></div><div className={`assistant-shell ${conversation ? 'conversation-mode' : ''}`}>{!conversation ? <div className="assistant-welcome"><div className="assistant-sparkle"><Icon name="sparkle" size={22} /></div><h1>What is happening<br />with your skin?</h1><p>Choose a topic to help me understand what you&apos;re noticing.</p><div className="topic-grid">{topics.map((topic) => <button key={topic} onClick={() => sendMessage(topic)}>{topic}<Icon name="arrowUp" size={14} /></button>)}</div></div> : <div className="assistant-conversation"><div className="conversation-heading"><div className="assistant-sparkle small"><Icon name="sparkle" size={17} /></div><div><strong>Tell me what&apos;s going on.</strong><span>I&apos;m listening, Rohan.</span></div></div><div className="assistant-messages">{messages.map((message, index) => <div className={`assistant-message ${message.from}`} key={`${message.from}-${index}`}>{message.from === 'ai' && <span className="mini-ai"><Icon name="sparkle" size={11} /></span>}<div>{message.text}</div></div>)}</div></div>}<div className="assistant-divider" /><div className="assistant-compose-row"><button className={`assistant-speak ${listening ? 'listening' : ''}`} onClick={speak}><span><Icon name="mic" size={17} /></span><strong>{listening ? 'Listening…' : 'Speak'}</strong></button><form className="assistant-form" onSubmit={(event) => { event.preventDefault(); sendMessage() }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Type message..." aria-label="Type message" /><button type="submit" aria-label="Send message"><Icon name="send" size={17} /></button></form></div></div><p className="assistant-disclaimer"><Icon name="shield" size={13} /> Your conversations are private. AI guidance is not a medical diagnosis.</p></div>
}
function QueueView({ onBack }) {
  const [booked, setBooked] = useState(false)
  return <div className="page tool-page queue-page"><PageHeader eyebrow="Care queue" title="Talk to a doctor." description="Expert care is just a few taps away when you need it." onBack={onBack} /><div className="queue-banner"><span className="queue-banner-icon"><Icon name="doctor" size={24} /></span><div><strong>Not sure what your skin needs?</strong><p>A dermatologist can help you move forward with confidence.</p></div><Icon name="arrowUp" size={18} /></div><div className="queue-heading"><div><span className="section-kicker">Available for you</span><h3>Recommended specialists</h3></div><button className="filter-button"><Icon name="plus" size={14} /> Filters</button></div><div className="doctor-list">{doctors.map((doctor) => <article className="doctor-card" key={doctor.name}><div className={`doctor-avatar ${doctor.color}`}>{doctor.initials}</div><div className="doctor-main"><div className="doctor-title"><div><h3>{doctor.name}</h3><p>{doctor.specialty}</p></div><button className="icon-button subtle"><Icon name="more" size={17} /></button></div><span className="doctor-meta"><Icon name="check" size={13} /> {doctor.experience}</span><div className="doctor-footer"><span><Icon name="calendar" size={14} /> {doctor.next}</span><button className={`book-button ${booked ? 'booked' : ''}`} onClick={() => setBooked(true)}>{booked ? <><Icon name="check" size={14} /> Requested</> : 'Book a slot'}</button></div></div></article>)}</div><div className="queue-note"><Icon name="help" size={16} /><span>For urgent symptoms or sudden changes, please contact a local medical professional.</span></div></div>
}

function RoutineView({ onBack }) {
  const [completed, setCompleted] = useState([1, 2])
  const toggle = (id) => setCompleted((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  return <div className="page tool-page routine-page"><PageHeader eyebrow="Your routine" title="Small steps, daily." description="A simple rhythm made for your skin and your real life." onBack={onBack} /><div className="routine-progress-card"><div><span className="section-kicker">Wednesday&apos;s progress</span><h3>{completed.length} of {routineItems.length} steps complete</h3><div className="routine-progress"><span style={{ width: `${(completed.length / routineItems.length) * 100}%` }} /></div></div><div className="routine-percent">{Math.round((completed.length / routineItems.length) * 100)}<small>%</small></div></div><div className="routine-list">{routineItems.map((item) => <button key={item.id} className={`routine-item ${completed.includes(item.id) ? 'completed' : ''}`} onClick={() => toggle(item.id)}><span className="routine-check"><Icon name="check" size={14} /></span><span className="routine-item-icon"><Icon name={item.icon} size={18} /></span><span className="routine-item-copy"><small>{item.time}</small><strong>{item.name}</strong><span>{item.detail}</span></span><Icon name="chevron" size={17} /></button>)}</div><button className="add-step-button"><Icon name="plus" size={17} /> Add a step</button><div className="routine-encouragement"><span><Icon name="sparkle" size={17} /></span><p><strong>Consistency over perfection.</strong><br />Missing a day doesn&apos;t undo your progress. Just come back to your next step.</p></div></div>
}

function ProfileView({ onBack }) {
  return <div className="page tool-page profile-page"><PageHeader eyebrow="Your space" title="Hi, Rohan." description="Make Dermasaathi work better for you." onBack={onBack} /><div className="profile-hero"><Avatar initials="R" size="large" /><div><h2>Rohan Mehta</h2><p>Member since September 2026</p></div><button className="secondary-button">Edit profile</button></div><div className="profile-section"><span className="section-kicker">Preferences</span><button className="settings-row"><span><Icon name="bell" size={18} /><span><strong>Reminders</strong><small>Gentle nudges for your routine</small></span></span><span className="toggle on"><i /></span></button><button className="settings-row"><span><Icon name="lock" size={18} /><span><strong>Privacy &amp; data</strong><small>Your information stays yours</small></span></span><Icon name="chevron" size={17} /></button><button className="settings-row"><span><Icon name="help" size={18} /><span><strong>Help &amp; support</strong><small>We&apos;re always here to listen</small></span></span><Icon name="chevron" size={17} /></button></div><div className="profile-signout"><button>Sign out</button><span>Dermasaathi AI · v1.0.0</span></div></div>
}

function PageHeader({ eyebrow, title, description, onBack }) {
  return <div className="page-header"><button className="back-button" onClick={onBack}><Icon name="arrow" size={17} /><span>Back home</span></button><span className="section-kicker">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
}

function BottomNav({ activeView, onNavigate }) {
  return <nav className="bottom-nav" aria-label="Mobile navigation">{navItems.map((item) => <button key={item.id} className={activeView === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)}><span className="bottom-icon"><Icon name={item.icon} size={20} /></span><span>{item.label}</span>{item.id === 'queue' && <i className="bottom-badge">2</i>}</button>)}</nav>
}

function Toast({ message, onClose }) {
  return <div className="toast" role="status"><span><Icon name="check" size={15} /></span><p>{message}</p><button onClick={onClose}><Icon name="close" size={15} /></button></div>
}

export default function App() {
  const [activeView, setActiveView] = useState('home')
  const [scanStatus, setScanStatus] = useState('ready')
  const [captureSide, setCaptureSide] = useState('front')
  const [capturedViews, setCapturedViews] = useState([])
  const [selectedPhoto, setSelectedPhoto] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 3400)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (scanStatus !== 'scanning') return undefined
    const timer = window.setTimeout(() => setScanStatus('complete'), 3200)
    return () => window.clearTimeout(timer)
  }, [scanStatus])

  const navigate = (view) => {
    setActiveView(view)
    if (view === 'scan') {
      setScanStatus('ready')
      setCaptureSide('front')
      setCapturedViews([])
    } else {
      setScanStatus('ready')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const beginCameraCapture = () => {
    setCaptureSide('front')
    setCapturedViews([])
    setScanStatus('capture')
  }

  const captureCurrentSide = () => {
    const sides = ['front', 'left', 'right']
    const nextViews = capturedViews.includes(captureSide) ? capturedViews : [...capturedViews, captureSide]
    setCapturedViews(nextViews)
    const nextSide = sides[sides.indexOf(captureSide) + 1]
    if (nextSide) setCaptureSide(nextSide)
    else setScanStatus('scanning')
  }

  const notify = () => setToast('You’re all caught up. We’ll gently remind you when it’s time for your next check-in.')
  const handlePhoto = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedPhoto(file.name)
      setToast('Photo added. You can start your scan when you’re ready.')
    }
  }

  let content
  if (activeView === 'home') content = <HomeView onNavigate={navigate} onNotify={notify} />
  if (activeView === 'scan') content = <ScanView onBack={() => navigate('home')} status={scanStatus} onStart={beginCameraCapture} onReset={() => { setScanStatus('ready'); setCaptureSide('front'); setCapturedViews([]) }} onSafetyCheck={() => setScanStatus('safety')} selectedPhoto={selectedPhoto} onPhoto={handlePhoto} activeSide={captureSide} capturedViews={capturedViews} onSelectSide={setCaptureSide} onCapture={captureCurrentSide} />
  if (activeView === 'chat') content = <ChatView onBack={() => navigate('home')} />
  if (activeView === 'queue') content = <QueueView onBack={() => navigate('home')} />
  if (activeView === 'routine') content = <RoutineView onBack={() => navigate('home')} />
  if (activeView === 'profile') content = <ProfileView onBack={() => navigate('home')} />

  return <div className="app-shell"><Sidebar activeView={activeView} onNavigate={navigate} /><main className="main-area"><Topbar onNotify={notify} onProfile={() => navigate('profile')} />{content}</main><BottomNav activeView={activeView} onNavigate={navigate} />{toast && <Toast message={toast} onClose={() => setToast('')} />}</div>
}
