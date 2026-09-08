/**
 * Mock provider — "Offline Demo" mode.
 *
 * API key नसतानाही पूर्ण multi-agent pipeline चालते: प्रत्येक agent ला
 * agent-specific, goal-aware template output मिळते (word-by-word stream होते,
 * म्हणून UI ला खरी live feeling येते).
 *
 * नंतर XAI_API_KEY टाकली की त्याच orchestrator Grok वर चालू लागतो —
 * code बदलायची गरज नाही.
 */

const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(t)
      reject(signal.reason || new Error('aborted'))
    }, { once: true })
  })

// Deterministic hash — एकच goal नेहमी एकच "random" पर्याय देईल
function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}
const pick = (seed, arr) => arr[seed % arr.length]

const PALETTES = [
  [
    ['#FF6B35', 'Primary — energy, creativity'],
    ['#1A1A2E', 'Deep base — premium feel'],
    ['#F5F5F0', 'Neutral canvas'],
    ['#00C9A7', 'Accent — CTA / highlights'],
    ['#FFD23F', 'Accent 2 — badges, arrows'],
  ],
  [
    ['#7C3AED', 'Primary — modern tech'],
    ['#0F172A', 'Deep navy base'],
    ['#F8FAFC', 'Light neutral'],
    ['#22D3EE', 'Cyan accent'],
    ['#F472B6', 'Pink accent'],
  ],
  [
    ['#0EA5E9', 'Primary — trust, clarity'],
    ['#111827', 'Charcoal base'],
    ['#FAFAF9', 'Warm neutral'],
    ['#F59E0B', 'Amber accent'],
    ['#10B981', 'Success green'],
  ],
]

const HOOKS = [
  '“Design जो बोलतो — customer ना बोलावं लागत नाही”',
  '“Your brand, एका सेकंदात ओळखलं जाईल असं”',
  '“स्वस्त नाही — योग्य. आणि योग्य म्हणजे पैसे वाचवणारं”',
  '“बाकी सगळे template विकतात — आपण system देतो”',
  '“From idea to identity in 7 days”',
]

const TAGLINES = [
  'Design that sells.',
  'ब्रँड जो लोकांच्या लक्षात राहतो.',
  'Pixels with purpose.',
  'तुमचा brand, तुमच्या भाषेत.',
]

function trimGoal(goal, n = 90) {
  const g = goal.replace(/\s+/g, ' ').trim()
  return g.length > n ? g.slice(0, n - 1) + '…' : g
}

const isMarathi = (s) => /[\u0900-\u097F]/.test(s)

// ---------------------------------------------------------------- templates

function designTemplate(ctx) {
  const seed = hash(ctx.goal)
  const palette = pick(seed, PALETTES)
  const tagline = pick(seed + 7, TAGLINES)
  const mo = isMarathi(ctx.goal)
  const L = (mr, en) => (mo ? mr : en)
  return `## 🎨 ${L('Design Agent — Visual Direction', 'Design Agent — Visual Direction')}

**${L('उद्दिष्ट', 'Brief')}:** ${trimGoal(ctx.goal)}

### 1) ${L('क्रिएटिव्ह दिशा', 'Creative Direction')}
- **${L('ब्रँड मूड', 'Brand mood')}:** ${pick(seed + 1, ['Bold + approachable — ठसठसीत पण मैत्रीचं', 'Premium minimal — कमी शब्द, जास्त परिणाम', 'Playful energetic — रंगीत, तरुण audience साठी'])}
- **${L('टॅगलाइन ऑप्शन्स', 'Tagline options')}:** “${tagline}”
- **${L('व्हिज्युअल मेटाफर', 'Visual metaphor')}:** ${pick(seed + 2, ['ग्रिड → order: chaos मधून clarity', 'अ‍ॅरो/growth marks → प्रगतीची भावना', 'geometric monogram → भरवशेदार, timeless'])}

### 2) ${L('कलर पॅलेट', 'Color Palette')}
| ${L('भूमिका', 'Role')} | Hex | ${L('वापर', 'Usage')} |
|---|---|---|
${palette.map((p) => `| ${(p[1] || '').split(' — ')[0] || '•'} | \`${p[0]}\` | ${(p[1] || '').split(' — ')[1] || ''} |`).join('\n')}

> WCAG contrast तपासा: primary वर text असेल तर कमीत कमी 4.5:1.

### 3) Typography
- **Display/Headings:** ${pick(seed + 3, ['Space Grotesk (geometric, techy)', 'Bricolage Grotesque (character-heavy)', 'Clash Display (bold poster energy)'])}
- **Body:** Inter /${' '} Satoshi — screen वर स्वच्छ वाचतं
- **${L('मराठी/देवनागरी pair', 'Devanagari pairing')}:** Mukta किंवा Noto Sans Devanagari — weight sync साठी

### 4) Logo ${L('कॉन्सेप्ट्स (३)', 'Concepts (3)')}
1. **Wordmark + symbol** — नावाच्या पहिल्या अक्षराचं abstract mark, rounded terminals
2. **Badge lockup** — circular frame मध्ये monogram, social avatar साठी perfect
3. **Dynamic mark** — context प्रमाणे रंग बदलणारा gradient orb

### 5) ${L('डिलिव्हरेबल्स क्लिअर', 'Deliverables')}
- [ ] Logo suite (primary, mono, favicon, social kit) — SVG + PNG
- [ ] Brand sheet v1 (colors, type, spacing, do/don't)
- [ ] Instagram grid template (9 posts) + story frames
- [ ] Presentation template + invoice letterhead

### 🔗 Handoff → Marketing Agent
${L('टोन', 'Tone')}: confident + friendly. ${L('मुख्य शब्द', 'Key words')}: *${pick(seed + 4, ['craft, speed, clarity', 'premium, system, growth', 'bold, honest, human)'])}*. ${L('हे रंग आणि शब्द captions मध्ये वापर.', 'Use these colors & words in captions.')}`
}

function marketingTemplate(ctx) {
  const seed = hash(ctx.goal)
  const mo = isMarathi(ctx.goal)
  const L = (mr, en) => (mo ? mr : en)
  return `## 📣 ${L('मार्केटिंग एजंट — Go-to-Market प्लॅन', 'Marketing Agent — Go-to-Market Plan')}

**${L('उद्दिष्ट', 'Brief')}:** ${trimGoal(ctx.goal)}

### 1) ${L('पोझिशनिंग स्टेटमेंट', 'Positioning Statement')}
> ${pick(seed, HOOKS)} — ${L('फॉर', 'for')} ${pick(seed + 1, ['small business owners', 'startups', 'creators & freelancers'])} ${L('ज्यांना', 'who need')} ${pick(seed + 2, ['प्रोफेशनल design, कमी वेळेत', 'a brand system that scales', 'content that actually converts'])}.

### 2) ${L('७ दिवसांचं कॉन्टेंट कॅलेंडर', '7-Day Content Calendar')}
| दिवस | Format | विषय |
|---|---|---|
| 1 | Reel | ${L('आधी/नंतर transformation — problem hook', 'Before/after transformation')} |
| 2 | Carousel | ${L('५ निदर्शक डिझाइन त्रुटी ज्या खर्ची करतात', '5 design mistakes that cost money')} |
| 3 | Story poll | ${L('“कोणतं लोगो बरोबर वाटतं?” A vs B', '“Which logo?” A vs B')} |
| 4 | Reel | ${L('प्रोसेस timelapse + टिप', 'Process timelapse + one tip')} |
| 5 | Post | ${L('केस स्टडी + रिझल्ट नंबर', 'Case study + result numbers')} |
| 6 | Story Q&A | ${L('“प्राइस किती?” चं उत्तर — शेअर करण्यासारखं', 'Price objection answered, shareably')} |
| 7 | Reel | ${L('मजकूर जो लोक सेव्ह करतील', 'Save-worthy checklist')} |

### 3) ${L('५ कॅप्शन्स (कॉपी-पेस्ट)', '5 Captions (copy-paste)')}
1. ${L('हुक', 'Hook')}: ${pick(seed + 3, HOOKS)} — ${L('मग context, मग CTA “DM करा START”', 'then context, then CTA “DM START”.')}
2. ${L('"तुमचं लोगो बरोबर आहे का? ३ सेकंदात तपासा — checklist profile वर."', '“Is your logo right? Check in 3 seconds — checklist on profile.”')}
3. ${L('गोष्ट सांगा: पहिल्या क्लायंटची गोष्ट + शिकणं.', 'Story-time: first client story + the lesson.')}
4. ${L('मागच्या आठवड्याचं काम — एका फ्रेममध्ये.', 'Last week\'s work in one frame.')}
5. ${L('मोफल ऑफर: १० जणांना फ्री ब्रँड ऑडिट.', 'Free offer: brand audit for first 10.')}

**Hashtags:** #graphicdesign #branding #brandidentity #designermarathi #freelancedesigner #logodesign #smallbusiness #madeinindia

### 4) ${L('जाहिरात (पुढे)', 'Ads (later)')}
- **A/B:** ${L('दोन हुक, एकच creative — ३ दिवस, ₹100/day नंतर winner ला budget', 'two hooks, same creative — 3 days, ₹100/day, then fund the winner')}
- **CTA:** “${L('फ्री ब्रँड चेकलिस्ट घ्या', 'Get the free brand checklist')}” → DM automation

### 5) ${L('मेट्रिक्स', 'Metrics to watch')}
Saves + shares (deep signal) · profile visits→DM rate · DM→call book rate · ${L('खरेदी', 'close')} rate

### 🔗 Handoff → Business Agent
${L('लीड फ्लो: Reel → profile → DM → call. Pricing आणि packages आता जुळवा.', 'Lead flow: Reel → profile → DM → call. Now match pricing & packages.')}`
}

function businessTemplate(ctx) {
  const seed = hash(ctx.goal)
  const mo = isMarathi(ctx.goal)
  const L = (mr, en) => (mo ? mr : en)
  return `## 💼 ${L('बिझनेस एजंट — मनी मॉडेल + ऑपरेशन्स', 'Business Agent — Money Model + Operations')}

**${L('उद्दिष्ट', 'Brief')}:** ${trimGoal(ctx.goal)}

### 1) ${L('प्राइसिंग पॅकेजेस (₹)', 'Pricing Packages (₹)')}
| पॅकेज | काय मिळतं | ${L('किंमत', 'Price')} |
|---|---|---|
| **Starter** | Logo + color palette + font kit (5 दिवस) | ₹${pick(seed, [4999, 5999, 6999])} |
| **Growth** ⭐ | Starter + social kit + brand sheet + 1 revision round | ₹${pick(seed + 1, [9999, 12499, 14999])} |
| **Partner** | Full brand system + 30 दिवस support + templates | ₹${pick(seed + 2, [24999, 29999])} |

${L('नियम: 50% advance, २ revision फ्री, नंतर प्रति राउंड ₹1500. “स्वस्त करा” ला scope कमी करून उत्तर द्या — दर कमी करून नाही.', 'Rule: 50% advance, 2 free revisions, then ₹1500/round. Answer “make it cheaper” by reducing scope, never the rate.')}

### 2) ${L('क्लायंट फ्लो (ऑनबोर्डिंग)', 'Client Flow (onboarding)')}
1. **Discovery call (20 min)** — form + ३ प्रश्न: goal, audience, deadline
2. **Proposal 24 तासांत** — ३ पर्याय, scope क्लिअर
3. **50% advance + contract** — त्यानंतरच calendar slot
4. **Week 1:** concepts → Week 2: refine → ${L('डिलिव्हरी + testimonial ask', 'delivery + testimonial ask')}

### 3) ${L('रेव्हेन्यू स्ट्रीम्स', 'Revenue Streams')}
- ${L('प्रोजेक्ट (आता):', 'Projects (now):')} ${pick(seed + 3, [3, 4])} × Growth package = ₹${(pick(seed + 3, [3, 4]) * 12499).toLocaleString('en-IN')}/mo
- ${L('रिकरिंग:', 'Recurring:')} ${L('मेंटेनन्स रिटेनर — ₹5000/महिना (social templates + tweaks)', 'maintenance retainer — ₹5000/mo')}
- ${L('नंतर:', 'Later:')} ${L('कोर्स/टेम्पलेट्स — एकदा बनवा, वारंवार विका', 'course/templates — build once, sell repeatedly')}

### 4) ${L('३० दिवसांचं लक्ष्य', '30-Day Target')}
- ₹${pick(seed + 5, [40000, 50000])} ${L('एकूण', 'total')} · 2 retainer conversations · 1 case study published
- ${L('ट्रॅक करा: दर आठवड्याला pipeline review — रविवारी ३० मिनिटं', 'Track: weekly pipeline review — Sunday, 30 min')}

### 🔗 Handoff → Coding Agent
${L('आता execution system हवी: portfolio site, invoice automation, lead form → sheet.', 'Now build the execution system: portfolio site, invoice automation, lead form → sheet.')}`
}

function codingTemplate(ctx) {
  const seed = hash(ctx.goal)
  const mo = isMarathi(ctx.goal)
  const L = (mr, en) => (mo ? mr : en)
  return `## 💻 ${L('कोडिंग एजंट — टेक एक्झिक्युशन', 'Coding Agent — Tech Execution')}

**${L('उद्दिष्ट', 'Brief')}:** ${trimGoal(ctx.goal)}

### 1) ${L('रेकमेंडेड स्टॅक (फ्री)', 'Recommended Stack (free)')}
| ${L('गरज', 'Need')} | ${L('टूल', 'Tool')} | ${L('का', 'Why')} |
|---|---|---|
| Frontend | React (Vite) | ${L('जलद, Termux/mobile वर चालतं', 'fast, runs on mobile')} |
| Backend | Node.js + Express | zero-cost start |
| DB | SQLite/JSONL → Supabase | ${L('मोफल सुरुवात, नंतर upgrade', 'free start, upgrade later')} |
| Hosting | Vercel + Render free tier | ₹0 |

### 2) ${L('प्रोजेक्ट स्ट्रक्चर', 'Project Structure')}
\`\`\`
project/
├── web/        # React frontend (Vite)
├── server/     # Express API + agents
├── docs/       # blueprint + decisions
└── scripts/    # setup + deploy helpers
\`\`\`

### 3) ${L('कोर कोड स्निपेट', 'Core Snippet')}
\`\`\`js
// server/src/routes/leads.js — lead capture → store
router.post('/leads', async (req, res) => {
  const { name, need, budget } = req.body
  if (!name || !need) return res.status(400).json({ error: 'name + need required' })
  const lead = { id: crypto.randomUUID(), name, need, budget, ts: Date.now() }
  await store.append('leads', lead)      // नंतर: Supabase insert
  res.json({ ok: true, id: lead.id })
})
\`\`\`

### 4) ${L('डिप्लॉय स्टेप्स', 'Deploy Steps')}
1. GitHub repo → Render "New Web Service" → root \`server/\`
2. Env vars: \`PORT\`, \`XAI_API_KEY\` (optional)
3. Frontend: \`npm run build\` → Vercel
4. ${L('डोमेन नंतर: Cloudflare free', 'Domain later: Cloudflare free')}

### 5) ${L('सिक्युरिटी चेकलिस्ट', 'Security Checklist')}
- [ ] Input validation (zod/manual)
- [ ] Rate limit: 20 req/min/IP
- [ ] Secrets \`.env\` मध्येच — repo मध्ये कधीच नाही
- [ ] CORS: फक्त तुमचं domain allow

### 🔗 Handoff → Critic
${L('सगळं ready — quality check घ्या.', 'All set — run the quality check.')}`
}

function criticTemplate(ctx) {
  const seed = hash(ctx.goal)
  const agents = (ctx.blackboard || []).map((b) => b.name).join(', ')
  const score = (7.8 + (seed % 18) / 10).toFixed(1) // 7.8–9.5
  const mo = isMarathi(ctx.goal)
  const L = (mr, en) => (mo ? mr : en)
  return `## 🧪 ${L('क्रिटिक एजंट — क्वालिटी चेक', 'Critic Agent — Quality Check')}

**${L('रिव्ह्यू केलं', 'Reviewed')}:** ${agents || 'single-agent run'}

### ${L('स्कोअर', 'Score')}: **${score}/10** ${score >= 8.5 ? '🟢' : score >= 7.5 ? '🟡' : '🔴'}

### ✅ ${L('मजबूत बाजू', 'Strengths')}
- ${L('प्रत्येक agent चं output नंतरच्या agent ला context देतं — handoff चेन स्वच्छ', 'Each output feeds the next agent — clean handoff chain')}
- ${L('ॲक्शनेबल आयटम्स: किंमती, calendar, snippets — theory नाही', 'Actionable items: prices, calendar, snippets — not theory')}
- ${L('ब्रँड consistency: रंग/टोन design ↔ marketing मध्ये जुळले', 'Brand consistency: colors/tone aligned between design & marketing')}

### ⚠️ ${L('गॅप्स / रिस्क', 'Gaps / Risks')}
- ${L('व्हर्जन 1 आहे — खऱ्या client data ने टेस्ट करा (mock mode असू शकतो!)', 'This may be offline demo output — verify with a real model run')}
- ${L('प्रायॉरिटी ठरवलेली नाही: आजपासून पहिले ३ आयटम्स निवडा', 'No priorities set — pick your first 3 items today')}
- ${L('लीगल/contract template बाकी', 'Legal/contract template missing')}

### ▶️ ${L('पुढची पाऊलं (प्रायॉरिटी क्रमाने)', 'Next Actions (priority order)')}
1. ${L('आज: palette + logo concept निवडा', 'Today: pick palette + logo concept')}
2. ${L('आठवड्यात: pricing पानं + lead form live', 'This week: pricing page + lead form live')}
3. ${L('३० दिवस: पहिला paid package विका', '30 days: sell first paid package')}

**Verdict:** ${L('पुढे जा — plan चांगला आहे, execution वर लक्ष द्या.', 'Ship it — plan is solid, focus on execution.')}`
}

// ---------------------------------------------------------------- provider

const TEMPLATES = {
  design: designTemplate,
  marketing: marketingTemplate,
  business: businessTemplate,
  coding: codingTemplate,
  critic: criticTemplate,
}

export function createMockProvider(cfg) {
  return {
    id: 'mock',
    label: 'Offline Demo',
    async *chat({ ctx = {}, signal }) {
      const kind = ctx.agentId || 'design'
      const fn = TEMPLATES[kind] || designTemplate
      const text = fn(ctx)

      // word-chunk streaming — खऱ्या LLM सारखं live feel देतं
      const words = text.split(/(\s+)/)
      let chunk = ''
      for (let i = 0; i < words.length; i++) {
        chunk += words[i]
        if (i % 3 === 2 || i === words.length - 1) {
          await sleep(cfg.mockDelayMs, signal)
          yield { delta: chunk }
          chunk = ''
        }
      }
    },
  }
}
