# 🚢 Deployment — विनामूल्य पर्याय

MVP ची गरज: एक backend (Node) + एक static frontend. दोन्ही ₹0 मध्ये.

## Option A — Render (backend) + Vercel (frontend) ⭐ recommended

### Backend → Render free tier

1. https://render.com → GitHub ने sign in → **New → Web Service**
2. Repository connect करा
3. Settings:
   - **Root Directory:** `gstack-agents/server`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
   - **Instance Type:** Free
4. Environment variables:
   - `XAI_API_KEY` (optional — नसेल तर Offline Demo mode)
   - `AUTH_TOKEN` (public URL वर हा नक्की ठेवा!)
   - `NODE_ENV=production`
5. Deploy → `https://<तुमचं-नाव>.onrender.com/api/health`

**Note:** Free tier मध्ये 15 min निष्क्रियतेवर sleep येतो — पहिली request थोडी
उशीर येते. हे ठीक आहे MVP साठी.

### Frontend → Vercel free

1. https://vercel.com → GitHub ने sign in → **Add New Project**
2. Settings:
   - **Root Directory:** `gstack-agents/web`
   - Framework preset: Vite (auto-detect)
3. API कडे जाण्यासाठी दोन पर्याय:
   - **पर्याय 1 (सोपा):** `web/vite.config.js` मध्ये proxy ऐवजी — build सध्या
     same-origin `/api` वापरतो, म्हणून Render वर single-server mode better (खाली पहा)
   - **पर्याय 2:** `web/.env` मध्ये `VITE_API_URL=https://<render-url>` +
     `api.js` मध्ये base URL logic

## Option B — Single server (सोपा, एकच URL) ⭐ MVP साठी best

`web/` build केल्यावर `server` तोच serve करतो:

```bash
cd gstack-agents
(cd web && npm install && npm run build)    # web/dist तयार होतो
cd server && npm install
node src/index.js                           # http://localhost:8787 — UI + API एकत्र
```

Render वर हेच करायचं असेल तर Start Command:
`cd ../web && npm install && npm run build && cd ../server && node src/index.js`
— किंवा Docker वापरा (खाली).

## Option C — Docker (कोठेही)

```bash
# frontend build (dist server image मध्ये हवा)
(cd web && npm install && npm run build)
cp -r web/dist server/web-dist

cd server
docker build -t gstack-agents .
docker run -d -p 8787:8787 \
  -v $(pwd)/data:/app/data \
  -e XAI_API_KEY=xai-xxxxx \
  --name gstack-agents gstack-agents
```

Fly.io वर (`fly launch` → Dockerfile auto-detect) किंवा कोणत्याही VPS वर.

## Option D — Termux (शून्य खर्च + पूर्ण privacy)

पहा: **[TERMUX.md](TERMUX.md)** — कोणताही cloud नाही. Ollama local model सह
data तुमच्याकडेच राहतं.

## Deployment checklist

- [ ] `AUTH_TOKEN` set केला आहे (public URL वर आवश्यक)
- [ ] `XAI_API_KEY` secrets मध्येच आहे (repo मध्ये कधीच नाही)
- [ ] `/api/health` वरून smoke test: providers + version तपासा
- [ ] Data backup: `server/data/*.jsonl` (किंवा Supabase — blueprint §4)
- [ ] UptimeRobot free ping ठेवा (Render sleep टाळण्यासाठी)
- [ ] HTTPS आहे याची खात्री (Render/Vercel/Fly automatic)

## भविष्यातील scale (जेव्हा खरीच गरज लागेल)

- **Supabase** — Postgres + Auth + pgvector + Storage (free tier पुरेसा)
- **Upstash Redis** — rate limiting + queues (free tier)
- **GitHub Actions** — CI मध्ये `npm test` auto-run
