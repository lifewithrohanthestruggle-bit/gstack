/**
 * Zero-dep JSONL store — MVP database.
 *
 * एक file = एक collection, एक line = एक JSON record.
 * नंतर Supabase/Postgres कडे जायचं असेल तर हेच interface
 * (`all/append/find/latest/clear`) SQL मध्ये implement करा —
 * बाकीचा code बदलून घेता येणार नाही. (docs/BLUEPRINT.md §4 पहा)
 */

import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

export class JsonlStore {
  constructor(file) {
    this.file = file
    this.cache = null
  }

  async ensure() {
    await fsp.mkdir(path.dirname(this.file), { recursive: true })
    if (!fs.existsSync(this.file)) await fsp.writeFile(this.file, '', 'utf8')
  }

  async all() {
    if (this.cache) return this.cache
    await this.ensure()
    let raw = ''
    try {
      raw = await fsp.readFile(this.file, 'utf8')
    } catch {
      return []
    }
    this.cache = raw
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => {
        try {
          return JSON.parse(l)
        } catch {
          return null
        }
      })
      .filter(Boolean)
    return this.cache
  }

  async append(record) {
    await this.ensure()
    const line = JSON.stringify({ id: record.id || crypto.randomUUID(), ...record })
    await fsp.appendFile(this.file, line + '\n', 'utf8')
    if (this.cache) this.cache.push(JSON.parse(line))
    return JSON.parse(line)
  }

  async find(pred) {
    return (await this.all()).filter(pred)
  }

  async latest(n, filterFn) {
    const rows = await this.all()
    const out = filterFn ? rows.filter(filterFn) : rows
    return out.slice(-n).reverse()
  }

  async clear() {
    await this.ensure()
    await fsp.writeFile(this.file, '', 'utf8')
    this.cache = []
  }
}

export function createStores(dataDir) {
  return {
    sessions: new JsonlStore(path.join(dataDir, 'sessions.jsonl')),
    knowledge: new JsonlStore(path.join(dataDir, 'knowledge.jsonl')),
  }
}
