/**
 * Ollama provider — 100% free, local, open-source models
 * (qwen2.5, llama3.2, deepseek-r1, gemma2 …).
 * Termux/mobile वरही चालते (qwen2.5:3b सारखा small model घ्या).
 */

export function createOllamaProvider(cfg) {
  return {
    id: 'ollama',
    label: `Ollama (${cfg.ollamaModel})`,
    async *chat({ messages, temperature = 0.7, signal }) {
      const res = await fetch(`${cfg.ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: cfg.ollamaModel,
          messages,
          stream: true,
          options: { temperature },
        }),
        signal,
      })

      if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(`Ollama ${res.status}: ${body.slice(0, 300)}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        let nl
        while ((nl = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, nl).trim()
          buf = buf.slice(nl + 1)
          if (!line) continue
          try {
            const json = JSON.parse(line)
            const delta = json.message?.content
            if (delta) yield { delta }
            if (json.done) return
          } catch {
            /* partial line */
          }
        }
      }
    },
  }
}
