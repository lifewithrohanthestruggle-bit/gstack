# 🏗️ GStack Agents — Project Blueprint

> **Open Source All-Grok Multi-Agent AI System** — एकल builder साठी पूर्ण AI team.
> तू graphics designer आहेस — म्हणून team तुझ्या दृष्टीने बनवली आहे:
> 🎨 Design + 📣 Marketing + 💼 Business + 💻 Coding + 🧪 Critic.

**मुख्य तत्त्व:** पैसे न भरता पूर्ण MVP उभा → नंतर आवश्यक तेव्हाच API/services जोड.
आजच जे बनवलं ते **zero API keys** सह चालते (Offline Demo mode), आणि
`XAI_API_KEY` टाकली की तीच पाइपलाइन **Grok** वर चालू लागते.

---

## 0) ध्येय आणि Scope

| गोष्ट | निर्णय |
|---|---|
| कोणासाठी | Freelance designer / एकल builder जो design + marketing + business + code सगळं एकटा करतो |
| MVP भाषा | Marathi + English (UI द्विभाषी, agents user च्या भाषेत उत्तर देतात) |
| Cost | ₹0 — फक्त free tier आणि open-source |
| Mobile-first | Termux (Android) वर पूर्ण dev शक्य |
| License | MIT (open source) |

---

## 1) System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER (browser / Termux CLI)                │
│                     React UI  ·  CLI  ·  (future: WhatsApp bot)   │
└───────────────────────────────┬──────────────────────────────────┘
                                │  POST /api/run  (SSE stream)
┌───────────────────────────────▼──────────────────────────────────┐
│                     BACKEND — Node.js + Express                   │
│  ┌────────────┐  ┌───────────────┐  ┌──────────────────────────┐ │
│  │   Auth +   │  │  Rate limit + │  │  Routes (/api/*) + SSE   │ │
│  │  validation│  │  input limits │  └────────────┬─────────────┘ │
│  └────────────┘  └───────────────┘               │               │
│                              ┌───────────────────▼─────────────┐ │
│                              │        AI ORCHESTRATOR          │ │
│                              │  planner → agents → critic →    │ │
│                              │  (revision) → final synthesis   │ │
│                              └───┬──────────────────────┬──────┘ │
│                                  │                      │        │
│                    ┌─────────────▼───────┐   ┌──────────▼──────┐ │
│                    │   AGENT TEAM        │   │  MEMORY ENGINE  │ │
│                    │  🎨 📣 💼 💻 🧪     │◄──►  sessions +     │ │
│                    │  (blackboard bus)   │   │  knowledge +    │ │
│                    └─────────────┬───────┘   │  recall         │ │
│                                  │           └──────────▲──────┘ │
│                    ┌─────────────▼──────────┐          │          │
│                    │   PROVIDER LAYER       │  ┌───────┴───────┐ │
│                    │  Grok · Ollama · Mock  │  │  DATA STORE   │ │
│                    │  (same interface)      │  │ JSONL → PG    │ │
│                    └────────────────────────┘  └───────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

**एक request चा प्रवास:**

1. User goal पाठवतो → validation + rate-limit + auth
2. **Planner** कोणते agents हवे ते ठरवतो (keywords किंवा manual)
3. **Memory recall** — जुन्या runs मधून संदर्भ काढतो
4. **Agents sequence मध्ये** चालतात — प्रत्येकाला goal + memory +
   आधीच्या agents चं output (blackboard) मिळतं
5. **Critic** एकूण score + gaps + next actions देतो
6. (Optional) score कमी असेल तर **revision round** — agent v2
7. **Final synthesis** — एकत्रित action plan
8. सगळं **memory मध्ये save** → पुढच्या वेळी तेच आठवतं

प्रत्येक step **SSE event** म्हणून live UI वर stream होते — user ला खरं जाणवतं
की team काम करतेय.

---

## 2) Frontend — React (Vite)

| निवड | का |
|---|---|
| **Vite + React 18** | जलद dev server, छोटा build, **Termux वर हलकं** |
| Plain CSS (कोणताही UI framework नाही) | Full design control + कमी dependencies |
| Custom mini-markdown renderer | XSS-safe, zero-dep |

**नक्की का Next.js नाही (MVP मध्ये)?** Next.js छान आहे — पण Termux/mobile वर
त्याचा dev server जड पडतो आणि SSR ची गरज आपल्याला आज नाही. Vite ने SPA बनवून
नंतर गरज वाटल्यास Next.js मध्ये migrate करता येतं (components reusable राहतात).
**v0.3 मध्ये** Next.js + SSR + PWA असा upgrade path ठेवला आहे.

**UI मध्ये आज काय आहे:**
- Goal composer + example chips
- Agent team selector (Auto ✨ / manual)
- Provider selector (Auto / Grok / Ollama / Offline)
- Live pipeline view — प्रत्येक agent चं streaming output
- Critic score badge + final answer panel
- Sessions history + Memory panel (sidebar)
- Mobile responsive (फोनवरच पूर्ण वापर)

---

## 3) Backend — Node.js + Express

**का Node?** Frontend सोबत एकच भाषा, npm ecosystem, Termux वर प्रथम-श्रेणी support,
आणि SSE streaming साठी नैसर्गिक करार.

```
server/src/
├── index.js              # Express app — 0.0.0.0:8787
├── config.js             # .env loader (zero-dep) + सगळे defaults
├── auth.js               # Bearer token middleware (optional)
├── rateLimit.js          # per-IP sliding window
├── routes.js             # /api/* endpoints
├── orchestrator/
│   ├── orchestrator.js   # पूर्ण pipeline runner (emit-based)
│   ├── planner.js        # keyword routing (Marathi + English)
│   └── mock-final.js     # offline final compiler
├── agents/
│   ├── definitions.js    # team roster + system prompts
│   └── base-agent.js     # context builder (goal+memory+blackboard)
├── providers/
│   ├── index.js          # registry + auto-routing
│   ├── grok.js           # xAI API (OpenAI-compatible, streaming)
│   ├── ollama.js         # local free models (streaming)
│   └── mock.js           # offline demo templates (streaming)
└── memory/
    ├── store.js          # JSONL store (interface = भविष्यातील PG impl)
    └── recall.js         # keyword retrieval + recency boost
```

**API endpoints:**

| Method | Path | काम |
|---|---|---|
| GET | `/api/health` | server + providers status |
| GET | `/api/agents` | agent roster |
| GET | `/api/sessions` | run history (metadata) |
| GET | `/api/sessions/:id` | पूर्ण session transcript |
| GET | `/api/knowledge` | long-term memory entries |
| POST | `/api/knowledge/clear` | memory wipe |
| POST | `/api/run` | **main endpoint** — SSE stream |
| POST | `/api/run` body | `{goal, agents?, provider?, revision?}` |

**CLI mode (Termux):** `node server/src/cli.js "तुमचं goal"` — browser न लागता
terminal मध्येच पूर्ण team चालते (colors सह).

---

## 4) Database — आज JSONL, उद्या Supabase

**MVP (आज):** zero-dep JSONL file store — `server/data/sessions.jsonl` +
`server/data/knowledge.jsonl`. हे interface ठेवलं आहे:

```js
Store.all() · Store.append(record) · Store.find(pred) · Store.latest(n) · Store.clear()
```

**का?** SQLite पण चालतं, पण Termux वर native module builds कधी कधी त्रास देतात.
JSONL = काहीच install नाही, human-readable, git-friendly नाही (gitignored) पण
backup सोपं. जेव्हा data वाढेल तेव्हा Postgres.

**v0.2 migration — Supabase (free tier) schema:**

```sql
-- runs (एक म्हणजे एक orchestrator run)
create table runs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id),
  goal        text not null,
  provider    text not null,
  plan        jsonb not null,          -- {agents, mode, reason}
  status      text not null default 'running',
  critic_score numeric(3,1),
  duration_ms integer,
  final       text,
  created_at  timestamptz default now()
);

-- agent outputs (run मधील प्रत्येक agent चा output)
create table agent_outputs (
  id      uuid primary key default gen_random_uuid(),
  run_id  uuid references runs(id) on delete cascade,
  agent   text not null,               -- design/marketing/business/coding/critic
  version integer not null default 1,  -- revision v2 = 2
  content text not null,
  ms      integer,
  created_at timestamptz default now()
);

-- long-term memory (knowledge base)
create table knowledge (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  goal    text not null,
  tags    text[] not null default '{}',
  summary text not null,
  embedding vector(768),               -- pgvector: v0.2 मध्ये semantic recall
  created_at timestamptz default now()
);

-- भविष्य: files, tools_runs, a2a_messages (§8 पहा)

alter table runs enable row level security;
alter table agent_outputs enable row level security;
alter table knowledge enable row level security;
-- RLS: प्रत्येक user फक्त आपलंच data पाहू शकतो
create policy "own rows" on runs
  for all using (auth.uid() = user_id);
```

Migration path सोपी आहे कारण `createStores()` च्या आतली implementation बदलून
`SupabaseStore` बनवायची — बाकीचा code (orchestrator, routes) तसाच राहतो.

---

## 5) AI Orchestrator

`orchestrator.js` हा system चा conductor आहे — **emit-based pipeline**
(त्यामुळे तोच code HTTP-SSE आणि CLI दोन्हीकडे चालतो):

```
runPipeline({goal, selectedAgents, provider, revision, stores, emit, signal})
  ├── planRun()              → कोणते agents (manual > keywords > full team)
  ├── recallKnowledge()      → जुना संदर्भ
  ├── for agent in team:     → streamAgent() — buildMessages() → provider.chat()
  ├── critic                 → score parse (regex) + gaps
  ├── [revision if <7.5]     → weakest area पुन्हा v2
  ├── final synthesis        → LLM call किंवा compiled (offline)
  └── persist                → session + knowledge append
```

**महत्त्वाचे design calls:**
- **Sequential, नी parallel का?** प्रत्येक agent ला आधीच्या agent चं output
  हवं असतं (handoff chain). Parallel केलं तर "team" व्हायचं थांबतं.
  v0.3 मध्ये *स्वतंत्र* agents parallel + अवलंबूत agents sequential असा
  DAG planner येईल.
- **Blackboard truncation** — प्रत्येक agent चं output पुढच्याला 1800 chars
  मध्ये trimmed जातं (token discipline — पैसे व काळ वाचवतं).
- **Abort signal** — user ने tab बंद केलं की पाइपलाइन लगेच थांबते
  (Grok tokens वाया जात नाहीत).
- **Timeout** — `RUN_TIMEOUT_MS` (default 4 min) नंतर auto-abort.

**Planner (आज heuristic):** Marathi+English keywords → agent routing.
उदा. "logo कसं काढायचं" → design; "pricing ठरवा" → business; "Instagram वाढवायचं" →
marketing. काहीही जुळलं नाही → पूर्ण team. **v0.3:** LLM planner — Grok लाच
विचारून dynamic DAG बनवणं (interface तयार आहे).

---

## 6) Multiple AI Agents — तुझी Team

| Agent | काम | System prompt ची जिद्द |
|---|---|---|
| 🎨 **Design** | Brand identity, palettes, typography, logo concepts, deliverables | World-class art director — real hex codes, real fonts, Devanagari pairing |
| 📣 **Marketing** | Positioning, 7-day calendar, captions, hashtags, metrics | Growth marketer — copy-paste ready captions, brand-consistent |
| 💼 **Business** | ₹ pricing tiers, client flow, revenue streams, 30-day targets | Indian freelance market चा consultant — नेहमी खरे नंबर |
| 💻 **Coding** | Free stack, structure, code snippets, deploy, security | Senior full-stack — zero-cost, Termux-friendly, open-source प्रथम |
| 🧪 **Critic** | Score /10, strengths, gaps, priority actions | Pitch पुढे असलेला कठोर पण न्यायी creative director |

प्रत्येक agent चं नियम: **user च्या भाषेत उत्तर** (Marathi असेल तर Marathi +
English tech terms), clean Markdown, आणि शेवटी **Handoff note** — पुढच्या agent
ला काय reuse करायचं ते सांगतं.

**नवीन agent जोडायचं असेल तर:** `agents/definitions.js` मध्ये एक entry —
id, name, emoji, color, systemPrompt, taskInstruction. बस. Orchestrator,
planner, UI सगळं auto-pickup करतं. उदा. v0.2 साठी: 🎬 Video Agent,
📈 SEO Agent, ⚖️ Legal Agent.

---

## 7) Model Integration — Grok + Open-Source

तीन providers, **एकच interface** (`async *chat()` जो `{delta}` yield करतो):

### Grok (xAI) — "All-Grok" mode
```env
XAI_API_KEY=xai-xxxxx
XAI_MODEL=grok-4.5        # किंवा grok-4.6, grok-4.20-multi-agent, grok-code-fast-1
```
OpenAI-compatible `/chat/completions` + SSE streaming. Provider auto-detect होतो —
key असेल तर `auto` mode ने Grok निवडला जातो.

### Ollama — 100% free local
```env
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:7b   # Termux वर: qwen2.5:3b
```
`ollama serve` चालू असेल तर auto-detect. नंतर deepseek-r1, llama3.2, gemma2
कोणतेही models `.env` मधून बदलून चालवता येतील.

### Offline Demo (Mock) — आजच default
API key नसतानाही पूर्ण pipeline चालतो — प्रत्येक agent ला goal-aware,
deterministic template output मिळतं (word-by-word stream सह). नवीन user
5 सेकंदात system बघू शकतो.

**Auto-routing:** `grok → ollama → mock` (उपलब्धतेनुसार). UI मधून manual
override कधीही शक्य.

### भविष्यातील providers (interface मध्ये बसतील)
- **OpenRouter** — free models (deepseek, llama) चा एकच API
- **Groq** — झटपट inference (free tier)
- **HuggingFace Inference** — open-source models

---

## 8) Agent-to-Agent Communication

**आज (v0.1) — Blackboard pattern:**

```
Design writes  → [ Blackboard ] → Marketing वाचतो (Design चं output + handoff note)
Marketing writes → [ Blackboard ] → Business वाचतो (दोघांचंही)
… असं chain पुढे
```

- Blackboard = `[{agent, name, text}]` — प्रत्येक agent ला आधीचे सगळे outputs
  context मध्ये मिळतात (truncated).
- **Handoff notes** — प्रत्येक agent शेवटी पुढच्याला सूचना देतो ("हे रंग
  captions मध्ये वापर").
- **Critic feedback → Revision** — critic चा output v2 round मध्ये त्याच
  agent कडे परत जातो. ही खरी feedback loop आहे.

**v0.2/v0.3 roadmap:**
1. **Message bus** — agents एकमेकांना direct messages पाठवतील
   (`a2a_messages` table: from, to, type, payload)
2. **Debate mode** — दोन agents विरुद्ध मतांची वादविवाद, critic judge
3. **DAG execution** — planner dependency graph बनवेल; स्वतंत्र agents parallel
4. **Google A2A protocol** — standard agent interop (जसं येईल तसं evaluate)

---

## 9) Memory + Knowledge Base

| स्तर | काय | कुठे | किती काळ |
|---|---|---|---|
| **Short-term** | Blackboard — सध्याच्या run चं सगळं | RAM (run object) | एक run |
| **Session** | पूर्ण transcript | `sessions.jsonl` → `runs`+`agent_outputs` | कायम |
| **Long-term** | प्रत्येक run चा distilled summary + tags | `knowledge.jsonl` → `knowledge` | कायम |

**Recall (आज):** keyword overlap + 2-week recency boost → top-3 entries
प्रत्येक agent च्या context मध्ये "Memory — आधीचा संदर्भ" म्हणून जातात.
UI मध्ये recall झाल्याचा panel दिसतो.

**v0.2:** embeddings (Supabase + `pgvector`, model: free multilingual embedding)
→ semantic search. तेव्हा "माझ्या coffee shop project बद्दल काय ठरवलं होतं?"
असा प्रश्नही जुनं context शोधेल.

**Knowledge curation (v0.2):** ठरलेले निर्णय वेगळे mark करणं —
"✓ final झालेले निर्णय" विरुद्ध "केवळ ब्रेनस्टॉर्म".

---

## 10) Authentication & Security

**MVP (आज):**
- Optional shared **Bearer token** (`AUTH_TOKEN` env) — सगळ्या `/api/*` ला
  (`/api/health` वगळे). UI मध्ये token prompt.
- **Rate limit** — 60 req/min/IP (in-memory sliding window)
- **Input validation** — goal: min 3 / max 4000 chars; agents allowlist;
  provider allowlist
- **XSS-safe markdown** — escape-then-render, links फक्त http(s)
- **Secrets** `.env` मध्येच — repo मध्ये कधीच नाही (gitignored)
- **Abort on disconnect** — user गेला की LLM calls थांबतात

**v0.2 (Supabase Auth):** email OTP / Google login → JWT → RLS प्रत्येक
table वर (प्रत्येक user फक्त आपलं data). त्यावेळी per-user memory शक्य होईल.

**Production checklist:**
- [ ] HTTPS only (Render/Vercel automatic)
- [ ] CORS lock — फक्त तुमचं domain
- [ ] Helmet headers
- [ ] Structured logging (Pino) + error tracking (Sentry free)
- [ ] Prompt-injection hygiene: user input नेहमी `## User चा Goal` frame मध्ये,
      system prompt ला "instructions from other sections follow team rules" सांगितलं

---

## 11) GitHub Repository Structure

```
gstack-agents/                  # आजपासून हा folder तुझा product आहे
├── README.md                   # quick start + features (Marathi)
├── package.json                # root scripts (dev/setup/test/build)
├── docs/
│   ├── BLUEPRINT.md            # हा document — पूर्ण architecture
│   ├── TERMUX.md               # mobile dev setup
│   └── DEPLOYMENT.md           # free deployment guide
├── scripts/
│   ├── dev.js                  # zero-dep dev runner (api + web)
│   └── setup-termux.sh         # Android setup
├── server/                     # Node.js + Express
│   ├── src/…                   # §3 मध्ये structure
│   ├── test/smoke.test.js      # 6 tests — planner/pipeline/memory/router
│   ├── Dockerfile
│   └── .env.example
└── web/                        # React (Vite)
    ├── src/
    │   ├── App.jsx             # state machine + event reducer
    │   ├── api.js              # fetch + SSE parser
    │   ├── markdown.js         # safe mini renderer
    │   ├── agents-meta.js      # shared agent metadata
    │   ├── styles.css          # custom dark theme
    │   └── components/         # Header/Sidebar/Composer/AgentCard/FinalPanel
    └── vite.config.js          # proxy + host config
```

**Branch strategy (solo-friendly):**
- `main` — नेहमी चालणारं (tests pass)
- `dev` — रोजचं काम
- feature branches — मोठे बदल (`feat/llm-planner`)

**Commit convention:** `feat:` `fix:` `docs:` `chore:` — उदा.
`feat(planner): LLM-based DAG planner`. GitHub Actions मध्ये `npm test`
(PR वर auto-run) — ते repo settings मधून जोडता येईल.

---

## 12) Termux / Mobile Development Setup

```bash
pkg update && pkg install -y nodejs-lts git
git clone <तुझा repo> && cd gstack-agents
npm run setup            # server + web deps
npm run dev              # → फोनच्या browser मध्ये localhost:5173
```

किंवा एका command मध्ये: `bash scripts/setup-termux.sh`

- **CLI mode** फोनवर सर्वात सोपा: `npm run cli "goal"` — browser लागत नाही
- Ollama Termux वर: `qwen2.5:3b` (किंवा 1.5b) — RAM पाहून
- पूर्ण details: **docs/TERMUX.md**

---

## 13) Free / Open-Source Alternatives Table

| गरज | Paid जग | आपला free निवड |
|---|---|---|
| LLM (chat) | OpenAI/Claude API | **Grok** (स्वस्त) + **Ollama** (free, local) + **OpenRouter free models** |
| Frontend hosting | Vercel Pro | **Vercel free** / Netlify free / Cloudflare Pages |
| Backend hosting | AWS | **Render free** / Railway trial / Fly.io / घरचा Termux! |
| Database | AWS RDS | **Supabase free** (500MB, pgvector) / Neon free |
| Auth | Auth0 | **Supabase Auth** (free 50k MAU) |
| File storage | S3 | Supabase Storage (1GB free) |
| Monitoring | Datadog | **Sentry free** + UptimeRobot free |
| Designs/assets | Adobe CC | **Penpot** (open source), Figma free, GIMP/Krita/Inkscape |
| Vector search | Pinecone | **pgvector** (Supabase मध्येच) |
| Error-free deploys | — | Docker + GitHub Actions (free CI) |

**एकूण खर्च MVP वर: ₹0.** जेव्हा Grok API खरीच वापरशील तेव्हाच xAI खाते
(xAI चे pay-as-you-go rates — grok-4.5/min श्रेणी स्वस्त आहे; exact pricing
console.x.ai वर तपास).

---

## 14) Deployment

**Option A — सर्वात सोपं (Render free tier):**
1. GitHub repo push करा
2. render.com → New Web Service → repo निवडा
3. Root: `gstack-agents/server` · Build: `npm install` · Start: `node src/index.js`
4. Env: `XAI_API_KEY` (optional), `AUTH_TOKEN` (ठेवायचं असेल)
5. Frontend: `web/` → Vercel (build: `npm run build`, output: `dist`)
   - `web/.env` मध्ये `VITE_API_URL` किंवा server-side proxy

**Option B — Single server (Docker):**
```bash
cd gstack-agents
(cd web && npm install && npm run build)   # dist/ तयार
cd server && docker build -t gstack-agents .
docker run -p 8787:8787 -v $(pwd)/data:/app/data gstack-agents
```
(Server `web/dist` असेल तर तेही serve करतो — एकच URL, एकच port.)

**Option C — खराच free/privacy mode:** Termux वर चालवा (§12) — कोणताही
cloud नाही, Ollama local model. **₹0 + full privacy.**

पूर्ण details: **docs/DEPLOYMENT.md**

---

## 15) पहिला Working MVP — आज काय तयार आहे ✅

हा blueprint फक्त कागद नाही — **MVP आजपासून चालतो:**

| Feature | Status |
|---|---|
| AI Orchestrator (plan → agents → critic → final) | ✅ |
| 5 agents (🎨📣💼💻🧪) + handoff chain | ✅ |
| Agent-to-agent blackboard communication | ✅ |
| Grok provider (streaming, auto-detect) | ✅ key टाकल्यावर |
| Ollama provider (free local) | ✅ |
| Offline Demo mode (zero keys) | ✅ default |
| Long-term memory + recall | ✅ (keyword; embeddings roadmap) |
| Live SSE streaming UI (React) | ✅ |
| Sessions history + memory panel | ✅ |
| Critic score + auto-revision round | ✅ (toggle) |
| Auth (Bearer) + rate limit + validation | ✅ |
| CLI mode (Termux) | ✅ |
| Tests (6 smoke tests) | ✅ |
| Dockerfile + deploy docs | ✅ |

**चालवायला:**
```bash
cd gstack-agents
npm run setup && npm run dev      # → http://localhost:5173
```

### Roadmap

| Version | काय |
|---|---|
| **v0.2** | Supabase (Postgres + Auth + pgvector semantic memory), 🎬 Video agent, OpenRouter provider, WhatsApp bot prototype |
| **v0.3** | LLM planner (DAG + parallel agents), debate mode, tools (web search, image gen), PWA |
| **v1.0** | Multi-user SaaS mode, team workspaces, usage billing, plugin system |

---

*या blueprint मधला प्रत्येक निर्णय "स्वस्त आणि सोपं आज, बदलता येईल उद्या"
या नियमावर आहे. काही बदलायचं असेल — प्रत्येक section स्वतंत्र बदलू शकतो.*
