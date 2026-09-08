/**
 * Planner — कोणते agents चालवायचे ते ठरवतो.
 *
 * MVP: heuristic keyword routing (Marathi + English).
 * v0.3 roadmap: LLM planner (Grok ला विचारून dynamic plan — interface तयार आहे).
 */

import { CORE_AGENT_IDS } from '../agents/definitions.js'

const KEYWORDS = {
  design: [
    'logo', 'logotype', 'brand', 'branding', 'identity', 'color', 'colour', 'palette',
    'poster', 'banner', 'thumbnail', 'thumbnail', 'ui', 'ux', 'design', 'typography',
    'font', 'graphic', 'visual', 'mockup', ' illustration', 'portfolio',
    'लोगो', 'ब्रँड', 'ब्रांड', 'रंग', 'पोस्टर', 'बॅनर', 'थंबनेल', 'डिझाइन', 'डिझायन',
    'ग्राफिक', 'फॉन्ट', 'मुख्यपृष्ठ', 'ओळख',
  ],
  marketing: [
    'marketing', 'social', 'instagram', 'reel', 'reels', 'youtube', 'seo', 'ads',
    'campaign', 'caption', 'hashtag', 'followers', 'audience', 'promote', 'growth',
    'viral', 'content calendar', 'launch',
    'मार्केटिंग', 'सोशल', 'इन्स्टाग्राम', 'रील', 'जाहिरात', 'प्रमोशन', 'कॅप्शन',
    'फॉलोअर', 'ओळख', 'प्रसिद्ध', 'ग्रोथ', 'लाँच',
  ],
  business: [
    'price', 'pricing', 'client', 'clients', 'revenue', 'income', 'business', 'proposal',
    'invoice', 'quotation', 'quote', 'strategy', 'monetize', 'freelance', 'retainer',
    'package', 'packages', 'earn', 'money',
    'किंमत', 'दर', 'क्लायंट', 'ग्राहक', 'इनकम', 'उत्पन्न', 'व्यवसाय', 'प्रपोजल',
    'बिल', 'धोरण', 'योजना', 'फ्रीलान्स', 'पैसा', 'कमाई',
  ],
  coding: [
    'code', 'coding', 'app', 'website', 'web', 'react', 'next', 'node', 'api', 'bug',
    'script', 'automation', 'python', 'javascript', 'deploy', 'database', 'sql',
    'backend', 'frontend', 'server', 'git', 'github', 'termux',
    'कोड', 'अ‍ॅप', 'अॅप', 'वेबसाइट', 'संकेतस्थळ', 'स्क्रिप्ट', 'ऑटोमेशन', 'डेटाबेस',
  ],
}

function normalize(text) {
  return ' ' + (text || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ') + ' '
}

export function planRun({ goal, selected = [] }) {
  // 1) युजरने explicit agents निवडले तर planner ला काहीच बोलता येत नाही
  const clean = selected.filter((a) => CORE_AGENT_IDS.includes(a))
  if (clean.length) {
    return { agents: clean, mode: 'manual', reason: 'युजर-निवडलेले agents' }
  }

  // 2) heuristic routing
  const norm = normalize(goal)
  const matched = []
  for (const [id, words] of Object.entries(KEYWORDS)) {
    if (words.some((w) => norm.includes(w.toLowerCase()))) matched.push(id)
  }

  if (matched.length) {
    return {
      agents: matched,
      mode: 'auto',
      reason: `keyword routing: ${matched.join(' + ')}`,
    }
  }

  // 3) काहीही जुळलं नाही → पूर्ण team
  return {
    agents: [...CORE_AGENT_IDS],
    mode: 'auto',
    reason: 'कोणतेही keyword जुळले नाही — पूर्ण team चालवली',
  }
}
