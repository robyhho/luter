import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Phase 0 only: the Gemini API key is read from .env.local and injected
// into the dev server. Production builds always get an empty string, so the
// key can never end up in dist/. Phase 1 replaces this with Worker tokens.
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devKey = command === 'serve' ? (env.GEMINI_API_KEY ?? '') : ''
  return {
    plugins: [react()],
    define: { __GEMINI_API_KEY__: JSON.stringify(devKey) },
  }
})
