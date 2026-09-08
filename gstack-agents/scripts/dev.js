#!/usr/bin/env node
/**
 * Zero-dep dev runner — API server + Vite frontend एकाच command मध्ये.
 * (concurrently/npm-run-all सारखं package न घेता)
 */

import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const children = []

function run(label, cmd, args, cwd, color) {
  const p = spawn(cmd, args, { cwd, env: process.env })
  children.push(p)
  const tag = `${color}[${label}]\x1b[0m`
  p.stdout.on('data', (d) =>
    process.stdout.write(d.toString().split('\n').filter(Boolean).map((l) => `${tag} ${l}`).join('\n') + '\n')
  )
  p.stderr.on('data', (d) =>
    process.stderr.write(d.toString().split('\n').filter(Boolean).map((l) => `${tag} ${l}`).join('\n') + '\n')
  )
  p.on('exit', (code) => {
    console.log(`${tag} exited (${code})`)
  })
}

console.log(`
  ⚡ GStack Agents — dev mode
     API      → http://localhost:8787
     Frontend → http://localhost:5173  (Ctrl+C ने दोन्ही बंद)
`)

run('api', process.execPath, ['--watch', 'src/index.js'], path.join(root, 'server'), '\x1b[36m')
run('web', npm, ['run', 'dev'], path.join(root, 'web'), '\x1b[35m')

const bye = () => {
  for (const c of children) {
    try {
      c.kill('SIGTERM')
    } catch {}
  }
  process.exit(0)
}
process.on('SIGINT', bye)
process.on('SIGTERM', bye)
