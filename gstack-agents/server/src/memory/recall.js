/**
 * Long-term memory recall — keyword-overlap retrieval (MVP).
 *
 * वर्झन 2 मध्ये: embeddings + pgvector (Supabase) — interface तेवढीच राहील.
 * Strategy: query चे tokens जुळणारे knowledge entries + recency boost.
 */

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'this', 'that', 'have', 'from', 'your', 'you',
  'are', 'was', 'will', 'can', 'how', 'what', 'make', 'want', 'need', 'please',
  'आणि', 'हा', 'ही', 'हे', 'माझं', 'माझा', 'मला', 'आहे', 'आहेत', 'करू', 'करा',
  'करायचं', 'कसं', 'काय', 'तयार', 'एक', 'म्हणजे', 'चा', 'ची', 'चे', 'ला', 'ना',
])

export function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t))
}

export function recallScore(queryTokens, entry, now = Date.now()) {
  const hay = tokenize(`${entry.goal} ${entry.summary || ''} ${(entry.tags || []).join(' ')}`)
  const set = new Set(hay)
  let overlap = 0
  for (const t of queryTokens) if (set.has(t)) overlap++
  const recency = 1 / (1 + (now - (entry.ts || 0)) / (1000 * 60 * 60 * 24 * 14)) // 2-week half-life
  return overlap * 10 + recency
}

export async function recallKnowledge(knowledgeStore, query, k = 3) {
  const entries = await knowledgeStore.all()
  if (!entries.length) return []
  const qTokens = tokenize(query)
  if (!qTokens.length) return []
  return entries
    .map((e) => ({ entry: e, score: recallScore(qTokens, e) }))
    .filter((r) => r.score > 10.05) // निदान एक token जुळला पाहिजे
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((r) => r.entry)
}
