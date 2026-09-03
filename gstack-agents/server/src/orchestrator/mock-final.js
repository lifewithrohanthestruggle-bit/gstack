/**
 * Offline (mock) final answer — team च्या outputs मधून compiled unified plan.
 * Async generator: word-chunk streaming, खऱ्या synthesizer सारखं feel.
 */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function firstMeaningfulLine(text) {
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (t && !t.startsWith('#') && !t.startsWith('|') && !t.startsWith('---')) {
      return t.replace(/^[-*>]+\s*/, '').slice(0, 110)
    }
  }
  return '✓ complete'
}

function trimGoal(goal, n = 160) {
  const g = goal.replace(/\s+/g, ' ').trim()
  return g.length > n ? g.slice(0, n - 1) + '…' : g
}

export async function* mockFinal(cfg, goal, blackboard) {
  const mo = /[\u0900-\u097F]/.test(goal)
  const L = (mr, en) => (mo ? mr : en)
  const sections = blackboard
    .filter((b) => b.agent !== 'critic')
    .map((b) => `- **${b.name}** — ${firstMeaningfulLine(b.text)}`)
    .join('\n')
  const critic = blackboard.find((b) => b.agent === 'critic')
  const scoreMatch = critic?.text.match(/(\d+(?:\.\d+)?)\s*\/\s*10/)

  const text = `# 🏁 ${L('फायनल अ‍ॅन्सर — एकत्रित प्लॅन', 'Final Answer — Unified Plan')}

**${L('उद्दिष्ट', 'Goal')}:** ${trimGoal(goal)}

### ${L('संघाने काय दिलं', 'What the team produced')}
${sections || L('(एकही agent नाही — पुन्हा try करा)', '(no agents ran — try again)')}

### 🎯 ${L('एक्झिक्युशन ऑर्डर', 'Execution Order')}
1. **Design** → ${L('identity lock करा (palette + logo)', 'lock the identity (palette + logo)')}
2. **Business** → ${L('pricing पानं live करा', 'put pricing live')}
3. **Marketing** → ${L('7-day calendar चालू करा', 'start the 7-day calendar')}
4. **Coding** → ${L('lead capture + automation', 'lead capture + automation')}

### 📅 ${L('पहिल्या 30 दिवसांचे लक्ष्य', 'First 30 Days')}
| ${L('आठवडा', 'Week')} | ${L('लक्ष्य', 'Target')} |
|---|---|
| 1 | ${L('ब्रँड assets + पोर्टफोलिओ अपडेट', 'Brand assets + portfolio update')} |
| 2 | ${L('कॉन्टेंट engine सुरू — ५ पोस्ट', 'Content engine starts — 5 posts')} |
| 3 | ${L('३ discovery calls बुक', 'Book 3 discovery calls')} |
| 4 | ${L('पहिला paid क्लायंट close', 'Close first paid client')} |

${scoreMatch ? `> 🧪 Critic verdict: **${scoreMatch[0]}** — ${L('वरील gaps लक्षात ठेवा', 'mind the gaps above')}.` : ''}

---
*${L('हा उत्तर memory मध्ये save झालं — पुढच्या run मध्ये system ला हे आठवेल. (Offline demo mode)', 'Saved to memory — future runs will recall it. (Offline demo mode)')}*`

  const words = text.split(/(\s+)/)
  let chunk = ''
  for (let i = 0; i < words.length; i++) {
    chunk += words[i]
    if (i % 3 === 2 || i === words.length - 1) {
      await sleep(cfg.mockDelayMs)
      yield chunk
      chunk = ''
    }
  }
}
