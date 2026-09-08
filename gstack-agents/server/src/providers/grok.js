/**
 * Provider interface (सगळे providers हेच contract follow करतात):
 *
 *   provider.id    — 'grok' | 'ollama' | 'mock'
 *   provider.label — display नाव
 *   provider.chat({ messages, ctx, temperature, signal })
 *       → async generator जो { delta } yield करतो (streaming)
 *
 * ctx मध्ये orchestrator ची extra माहिती असते (agentId, goal, blackboard) —
 * फक्त mock provider ती template बनवायला वापरतो; Grok/Ollama ती ignore करतात.
 */

export function createGrokProvider(cfg) {
  return {
    id: 'grok',
    label: `Grok (${cfg.xaiModel})`,
    async *chat({ messages, temperature = 0.7, signal }) {
      const res = await fetch(`${cfg.xaiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${cfg.xaiApiKey}`,
        },
        body: JSON.stringify({
          model: cfg.xaiModel,
          messages,
          temperature,
          stream: true,
        }),
        signal,
      })

      if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(`Grok API ${res.status}: ${body.slice(0, 300)}`)
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
          if (!line.startsWith('data:')) continue
          const payload = line.slice(5).trim()
          if (payload === '[DONE]') return
          try {
            const json = JSON.parse(payload)
            const delta = json.choices?.[0]?.delta?.content
            if (delta) yield { delta }
          } catch {
            /* partial JSON — पुढच्या chunk मध्ये पूर्ण येईल */
          }
        }
      }
    },
  }
}
