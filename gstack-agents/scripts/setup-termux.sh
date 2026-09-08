#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
# GStack Agents — Termux (Android) setup
# मोबाईलवरच पूर्ण multi-agent system चालवा. कोणतीही paid गोष्ट नाही.
#
# वापर:
#   bash scripts/setup-termux.sh
# ============================================================
set -e

echo ""
echo "🤖 GStack Agents — Termux setup सुरू…"
echo ""

# --- 1) base packages -------------------------------------------------
echo "📦 Node.js + Git install करत आहे…"
pkg update -y
pkg install -y nodejs-lts git

node -v

# --- 2) project deps ---------------------------------------------------
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo ""
echo "📚 npm packages install करत आहे (server + web)…"
(cd server && npm install --no-audit --no-fund)
(cd web && npm install --no-audit --no-fund)

# --- 3) optional: Ollama सल्ला -----------------------------------------
echo ""
echo "🦙 (Optional) खरं local LLM हवं असेल तर:"
echo "     pkg install wget && curl -fsSL https://ollama.com/install.sh | bash"
echo "   Termux वर हलका model:  ollama pull qwen2.5:3b"
echo "   (RAM कमी असेल तर 1.5b/0.5b घ्या)"
echo ""

cat <<'DONE'
✅ Setup पूर्ण!

चालवायला:
  npm run dev      → http://localhost:5173  (फोनच्या browser मध्ये उघडा)
  npm run demo     → terminal मध्येच पूर्ण agent-team demo
  npm run cli "तुमचं goal"  → CLI mode

Grok (xAI) API key असेल तर:
  cp server/.env.example server/.env
  nano server/.env     # XAI_API_KEY टाका
DONE
