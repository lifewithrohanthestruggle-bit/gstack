# ग GStack Agents

> **Open Source All-Grok Multi-Agent AI System** — तुमची पूर्ण AI team एका विनंतीवर.
> 🎨 Design · 📣 Marketing · 💼 Business · 💻 Coding · 🧪 Critic

तू designer असल्यामुळे ही team तुझ्यासाठी: एक goal लिहा — orchestrator plan
बनवतो, चार specialists एकमेकांचं काम वापरून आपापलं काम करतात, critic quality
check घेतो, आणि एकत्रित final answer मिळतो. **सगळं live streaming मध्ये.**

```
User → Orchestrator → 🎨 Design → 📣 Marketing → 💼 Business → 💻 Coding
                     → 🧪 Critic (score + gaps) → 🏁 Final Answer → 💾 Memory
```

## ✨ Features

- **All-Grok ready** — `XAI_API_KEY` टाकली की तीच team Grok वर चालते
- **Free-first** — कोणतीही key नसताना **Offline Demo mode** मध्ये पूर्ण pipeline चालतो
- **Ollama support** — 100% free local models (Termux/mobile सह)
- **Agent-to-agent communication** — blackboard + handoff notes + critic feedback loop
- **Long-term memory** — प्रत्येक run नंतर system ला तुमचं project आठवतं
- **Live UI** — प्रत्येक agent चं output word-by-word stream होतं (SSE)
- **CLI mode** — browser न लागता terminal मध्येच पूर्ण team
- **Mobile-first** — Android/Termux वर पूर्ण development शक्य
- **₹0 stack** — Vite + React · Express · JSONL → (Supabase roadmap)

## 🚀 Quick start

```bash
cd gstack-agents

npm run setup        # server + web dependencies
npm run dev          # API :8787 + Frontend :5173
```

मग browser मध्ये **http://localhost:5173** उघडा.

**Grok वर चालवायचं असेल:**
```bash
cp server/.env.example server/.env
# server/.env मध्ये: XAI_API_KEY=xai-xxxxx  (https://console.x.ai)
```

**Terminal मध्येच (Termux-friendly):**
```bash
npm run demo                          # नमुना run
npm run cli "माझ्या studio साठी logo + pricing plan हवं"
npm run cli "portfolio website code" --agents coding
```

**Tests:**
```bash
npm test
```

## 📁 Structure

```
gstack-agents/
├── docs/BLUEPRINT.md    # पूर्ण architecture blueprint (15 sections)
├── docs/TERMUX.md       # Android development setup
├── docs/DEPLOYMENT.md   # free deployment guide
├── server/              # Express API + orchestrator + agents + memory
├── web/                 # React (Vite) frontend
└── scripts/             # dev runner + termux setup
```

## 🤖 Agents

| Agent | काय देतो |
|---|---|
| 🎨 Design | Creative direction, color palette (hex), typography, logo concepts, deliverables checklist |
| 📣 Marketing | Positioning, 7-day content calendar, 5 copy-paste captions, hashtags, metrics |
| 💼 Business | ₹ pricing tiers, client onboarding flow, revenue streams, 30-day target |
| 💻 Coding | Free tech stack, project structure, code snippets, deploy steps, security |
| 🧪 Critic | Score /10, strengths, gaps/risks, priority next actions (+ auto-revision round) |

## 🛠️ Providers

| Provider | काय | कधी |
|---|---|---|
| **Grok (xAI)** | grok-4.5 (किंवा 4.6 / 4.20-multi-agent / code-fast) | `XAI_API_KEY` असेल तर auto |
| **Ollama** | qwen2.5, llama3.2, deepseek… local | `ollama serve` चालू असेल तर auto |
| **Offline Demo** | deterministic agent templates | नेहमी (fallback) |

## 📚 Docs

- **[docs/BLUEPRINT.md](docs/BLUEPRINT.md)** — पूर्ण project blueprint (architecture, DB schema, security, roadmap)
- **[docs/TERMUX.md](docs/TERMUX.md)** — मोबाईलवर setup
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — Render/Vercel/Docker/Termux deploy

## 🗺️ Roadmap

- **v0.2** — Supabase (Postgres + Auth + pgvector memory), 🎬 Video agent, OpenRouter, WhatsApp bot
- **v0.3** — LLM DAG planner (parallel agents), debate mode, tools (search/image-gen), PWA
- **v1.0** — multi-user mode, team workspaces

---

License: **MIT** — fork करा, बदला, तुमचं बनवा. 🚀
