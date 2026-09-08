# 📱 Termux Setup — मोबाईलवरच पूर्ण development

फोन (Android) + Termux = विनामूल्य dev server. PC नाही, cloud नाही — तरीही पूर्ण
multi-agent system चालवा.

## 1) Termux install करा

- **F-Droid** मधून Termux install करा (Play Store version जुना आहे — F-Droid वापरा)
- उघडा आणि:

```bash
pkg update && pkg upgrade -y
pkg install -y nodejs-lts git
```

## 2) Project setup

```bash
git clone <तुमचा-repo-url>
cd gstack-agents

# एकाच command मध्ये सगळं:
bash scripts/setup-termux.sh

# किंवा manual:
npm run setup
```

## 3) चालवा

### CLI mode (सर्वात हलका — फोनला सोयीचा)

```bash
npm run demo
npm run cli "माझ्या design studio साठी brand identity हवी"
npm run cli "website code plan" --agents coding
```

### Full web UI

```bash
npm run dev
# फोनच्या browser मध्ये: http://localhost:5173
```

## 4) (Optional) Ollama — फोनवरच खरं local LLM

```bash
pkg install -y wget
curl -fsSL https://ollama.com/install.sh | bash   # Termux build जरीक चालू शकतो
ollama serve &                                    # दुसऱ्या session मध्ये
ollama pull qwen2.5:3b                            # हलका model — RAM 4GB+ साठी
```

`.env` मध्ये:
```env
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:3b
```

**लक्षात ठेवा:** फोनच्या RAM/CPU नुसार model निवडा — `qwen2.5:1.5b` किंवा
`0.5b` पण चालतात. Battery आणि heating बघा. जड वाटलं तर Offline Demo mode
वापरा — तो फोनवर विनातोड चालतो.

## 5) (Optional) Grok API

```bash
cp server/.env.example server/.env
nano server/.env      # XAI_API_KEY=xai-xxxxx
```

Key नंतरही घालता येते — Offline Demo तोवर सगळं चालू राहतं.

## टिप्स

- `termux-wake-lock` — screen बंद होऊनही server चालू राहतो
- `termux-setup-storage` — फोनच्या storage access साठी
- Session बंद केल्यावर processes थांबतात — मोठ्या run साठी wake-lock घ्या
- PC नंतर मिळाला तर तोच repo clone करा — सगळं sync मध्ये राहतं (data/ वगळे)
