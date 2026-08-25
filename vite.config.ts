import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import type { Plugin } from 'vite'
import { CSP_META_VALUE } from './src/lib/csp.ts'

/**
 * Suntik tag meta CSP ke dalam binaan production sahaja (§11.3).
 * Pelayan pembangunan dikecualikan kerana Vite memerlukan skrip sebaris dan
 * sambungan WebSocket untuk HMR.
 */
function cspMetaPlugin(): Plugin {
  return {
    name: 'posterprompt-csp-meta',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<head>',
        `<head>
    <meta http-equiv="Content-Security-Policy" content="${CSP_META_VALUE}" />`,
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cspMetaPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Pool 'threads' digunakan kerana pool 'forks' gagal memulakan worker pada
    // laluan Windows yang mengandungi ruang.
    pool: 'threads',
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          pool: 'threads',
          // Enjin prompt tulen — tiada DOM diperlukan, jadi jauh lebih pantas.
          // Fail .ts dalam features/ turut termasuk (contohnya penjana rawak
          // yang menerima rng sebagai parameter); ujian komponen kekal .tsx.
          environment: 'node',
          include: ['src/{lib,data,schemas,features}/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'ui',
          pool: 'threads',
          environment: 'jsdom',
          // Ujian peringkat integrasi: satu ujian menaip berpuluh ketukan
          // kekunci melalui borang penuh, jadi had 5 saat lalai terlalu ketat
          // pada mesin yang sibuk.
          testTimeout: 30000,
          setupFiles: ['./src/tests/setup.ts'],
          include: ['src/**/*.test.tsx'],
        },
      },
    ],
  },
})
