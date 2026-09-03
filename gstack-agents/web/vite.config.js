import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API = process.env.API_URL || 'http://localhost:8787'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 0.0.0.0 — Termux/lan/preview वरून access
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': { target: API, changeOrigin: true },
    },
  },
  preview: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': { target: API, changeOrigin: true },
    },
  },
})
