/**
 * Mini Markdown renderer — zero-dep, XSS-safe.
 *
 * सगळं आधी HTML-escape होतं, मग आमचीच limited syntax generate होतं —
 * म्हणून dangerouslySetInnerHTML देखील safe आहे.
 * Support: headings, bold, italic, inline code, code blocks, links (http/s),
 * tables, lists (-, 1., checkboxes), blockquotes, hr, paragraphs.
 */

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inline(text) {
  // code spans first — आतील content वेगळं राहील
  const codes = []
  let t = text.replace(/`([^`\n]+)`/g, (_, c) => {
    codes.push(`<code>${c}</code>`)
    return `\u0000${codes.length - 1}\u0000`
  })

  t = escapeHtml(t)

  // bold + italic
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  t = t.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>')

  // links — फक्त http(s)
  t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // code placeholders परत जोडा
  t = t.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[Number(i)])
  return t
}

function renderTable(rows) {
  const cells = (r) =>
    r
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((c) => c.trim())
  const head = cells(rows[0])
  const bodyRows = rows
    .slice(1)
    .filter((r) => !/^\|?[\s:-]+\|[\s:|-]*$/.test(r))
    .map(cells)

  return `<div class="md-table-wrap"><table><thead><tr>${head
    .map((h) => `<th>${inline(h)}</th>`)
    .join('')}</tr></thead><tbody>${bodyRows
    .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
    .join('')}</tbody></table></div>`
}

export function renderMarkdown(src) {
  if (!src) return ''

  // code blocks वेगळे काढा
  const blocks = []
  let text = src.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    blocks.push(
      `<pre class="md-code"><div class="md-code-lang">${escapeHtml(lang || 'code')}</div><code>${escapeHtml(code.replace(/\n$/, ''))}</code></pre>`
    )
    return `\u0001${blocks.length - 1}\u0001`
  })

  const lines = text.split('\n')
  const out = []
  let list = null // 'ul' | 'ol'
  let table = null

  const flushList = () => {
    if (list) {
      out.push(`</${list}>`)
      list = null
    }
  }
  const flushTable = () => {
    if (table) {
      out.push(renderTable(table))
      table = null
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, '')

    // code block placeholder — एकटाच line मध्ये असतो
    const ph = line.match(/^\u0001(\d+)\u0001$/)
    if (ph) {
      flushList()
      flushTable()
      out.push(blocks[Number(ph[1])])
      continue
    }

    if (!line.trim()) {
      flushList()
      flushTable()
      continue
    }

    // table rows
    if (/^\s*\|.*\|\s*$/.test(line)) {
      flushList()
      table = table || []
      table.push(line.trim())
      continue
    }
    flushTable()

    // headings
    const h = line.match(/^(#{1,4})\s+(.*)$/)
    if (h) {
      flushList()
      const level = h[1].length
      out.push(`<h${level + 1} class="md-h${level}">${inline(h[2])}</h${level + 1}>`) // h2-h5 (# → h2)
      continue
    }

    // hr
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      flushList()
      out.push('<hr class="md-hr" />')
      continue
    }

    // blockquote
    const q = line.match(/^>\s?(.*)$/)
    if (q) {
      flushList()
      out.push(`<blockquote class="md-quote">${inline(q[1])}</blockquote>`)
      continue
    }

    // checkbox list
    const cb = line.match(/^(\s*)-\s+\[([ xX])\]\s+(.*)$/)
    if (cb) {
      if (list !== 'ul') {
        flushList()
        out.push('<ul class="md-list md-checklist">')
        list = 'ul'
      }
      out.push(
        `<li class="${cb[2].trim() ? 'checked' : ''}"><span class="box">${cb[2].trim() ? '✓' : ''}</span>${inline(cb[3])}</li>`
      )
      continue
    }

    // unordered list
    const ul = line.match(/^(\s*)[-*]\s+(.*)$/)
    if (ul) {
      if (list !== 'ul') {
        flushList()
        out.push('<ul class="md-list">')
        list = 'ul'
      }
      out.push(`<li>${inline(ul[2])}</li>`)
      continue
    }

    // ordered list
    const ol = line.match(/^(\s*)\d+[.)]\s+(.*)$/)
    if (ol) {
      if (list !== 'ol') {
        flushList()
        out.push('<ol class="md-list md-ol">')
        list = 'ol'
      }
      out.push(`<li>${inline(ol[2])}</li>`)
      continue
    }

    // paragraph
    flushList()
    out.push(`<p class="md-p">${inline(line)}</p>`)
  }

  flushList()
  flushTable()
  return out.join('\n')
}
