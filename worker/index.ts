import { createRemoteJWKSet, jwtVerify } from 'jose'

interface Env {
  ASSETS: Fetcher
  GEMINI_API_KEY: string
  ACCESS_TEAM_DOMAIN: string // e.g. https://<team>.cloudflareaccess.com
  ACCESS_AUD: string // Access application audience tag
}

const TOKEN_URL = 'https://generativelanguage.googleapis.com/v1alpha/auth_tokens'
const TOKEN_LIFETIME_MS = 30 * 60_000 // how long a session can run on one token
const NEW_SESSION_WINDOW_MS = 60_000 // the session must start within this

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/token') {
      if (request.method !== 'POST') return json({ error: 'Use POST' }, 405)
      const denied = await checkAccess(request, env, url)
      if (denied) return json({ error: denied }, 401)
      return mintToken(env)
    }
    if (url.pathname.startsWith('/api/')) return json({ error: 'Not found' }, 404)

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>

/**
 * Cloudflare Access already blocks anyone not on the allow list before the
 * request gets here. This checks the Access JWT as well, so the token endpoint
 * stays closed if Access is ever switched off by mistake. Returns an error
 * message, or null if the caller is allowed.
 */
async function checkAccess(request: Request, env: Env, url: URL): Promise<string | null> {
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) {
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    return local ? null : 'Access is not configured on this Worker'
  }
  const jwt = request.headers.get('cf-access-jwt-assertion')
  if (!jwt) return 'Not signed in'
  const issuer = env.ACCESS_TEAM_DOMAIN.replace(/\/$/, '')
  jwks ??= createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`))
  try {
    await jwtVerify(jwt, jwks, { issuer, audience: env.ACCESS_AUD })
    return null
  } catch {
    return 'Sign-in expired'
  }
}

/** Mints a one-use, short-lived Gemini Live token. The API key never leaves the Worker. */
async function mintToken(env: Env): Promise<Response> {
  if (!env.GEMINI_API_KEY) return json({ error: 'GEMINI_API_KEY is not set on the Worker' }, 500)
  const now = Date.now()
  let r: Response
  try {
    r = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'x-goog-api-key': env.GEMINI_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        uses: 1,
        expireTime: new Date(now + TOKEN_LIFETIME_MS).toISOString(),
        newSessionExpireTime: new Date(now + NEW_SESSION_WINDOW_MS).toISOString(),
      }),
    })
  } catch {
    return json({ error: 'Could not reach Gemini to get a token' }, 502)
  }
  const body = (await r.json().catch(() => ({}))) as { name?: string; error?: { status?: string } }
  if (!r.ok || !body.name) {
    const reason = body.error?.status ? `, ${body.error.status}` : ''
    return json({ error: `Gemini refused the token request (${r.status}${reason})` }, 502)
  }
  return json({ token: body.name })
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}
