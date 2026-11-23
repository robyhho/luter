import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'

// One Cloudflare Worker serves the built app and /api (worker/index.ts), and
// `npm run dev` runs both locally. The Gemini key only ever lives in the Worker:
// locally wrangler reads it from .env.local, in production it's a Worker secret.
// Vite never exposes it to the browser because it has no VITE_ prefix.
export default defineConfig({
  plugins: [react(), cloudflare()],
})
