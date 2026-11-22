// Diagnoses why the browser can't open a Live session. Never prints the key.
// Run from the project folder: node scripts/check-live.mjs
import { readFileSync } from 'node:fs'

const env = readFileSync('.env.local', 'utf8')
const key = (env.match(/^GEMINI_API_KEY=(.*)$/m)?.[1] ?? '').trim().replace(/^["']|["']$/g, '')
const model = process.argv[2] ?? 'gemini-3.8-live'
const host = 'generativelanguage.googleapis.com'
const hide = (s) => s.split(key).join('<key>')

console.log(`Node ${process.version}, model ${model}, key ${key ? 'found' : 'MISSING'}\n`)

async function rest(label, url, headers = {}) {
  try {
    const r = await fetch(url, { headers })
    const body = await r.text()
    let note = ''
    try {
      const j = JSON.parse(body)
      note = j.error ? `${j.error.status}: ${j.error.message}` : `${(j.models ?? []).length} models`
    } catch {
      note = body.slice(0, 120)
    }
    console.log(`${label.padEnd(44)} HTTP ${r.status}  ${hide(note).slice(0, 220)}`)
  } catch (e) {
    console.log(`${label.padEnd(44)} FAILED ${e.cause?.code ?? e.message}`)
  }
}

function live(label, url) {
  return new Promise((resolve) => {
    const ws = new WebSocket(url)
    let finished = false
    const done = (msg) => {
      if (finished) return
      finished = true
      console.log(`${label.padEnd(44)} ${hide(msg).slice(0, 220)}`)
      try { ws.close() } catch {}
      resolve()
    }
    const timer = setTimeout(() => done('TIMEOUT (no setupComplete in 10s)'), 10000)
    ws.onopen = () =>
      ws.send(JSON.stringify({ setup: { model: `models/${model}`, generationConfig: { responseModalities: ['AUDIO'] } } }))
    ws.onmessage = async (e) => {
      const text = typeof e.data === 'string' ? e.data : await new Response(e.data).text()
      if (text.includes('setupComplete')) { clearTimeout(timer); done('OK, setupComplete') }
    }
    ws.onclose = (e) => { clearTimeout(timer); done(`CLOSED ${e.code} ${e.reason}`) }
    ws.onerror = () => {}
  })
}

const wsPath = (v, method = 'BidiGenerateContent') =>
  `${host}/ws/google.ai.generativelanguage.${v}.GenerativeService.${method}`

console.log('REST')
await rest('list models, key in header', `https://${host}/v1beta/models`, { 'x-goog-api-key': key })
await rest('list models, key in URL (?key=)', `https://${host}/v1beta/models?key=${key}`)

console.log('\nWebSocket handshake as plain HTTPS (shows the error body)')
for (const v of ['v1', 'v1beta', 'v1alpha']) await rest(`handshake ${v}, ?key=`, `https://${wsPath(v)}?key=${key}`)

console.log('\nLive session, key in URL (what the browser does)')
for (const v of ['v1', 'v1beta', 'v1alpha']) await live(`live ${v}, ?key=`, `wss://${wsPath(v)}?key=${key}`)

console.log('\nLive session via ephemeral token (the phase 1 approach)')
try {
  const r = await fetch(`https://${host}/v1alpha/auth_tokens`, {
    method: 'POST',
    headers: { 'x-goog-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ uses: 1 }),
  })
  const j = await r.json()
  if (!j.name) {
    console.log(`${'create token'.padEnd(44)} HTTP ${r.status}  ${hide(JSON.stringify(j.error ?? j)).slice(0, 220)}`)
  } else {
    console.log(`${'create token'.padEnd(44)} OK`)
    await live('live v1alpha, ephemeral token', `wss://${wsPath('v1alpha', 'BidiGenerateContentConstrained')}?access_token=${j.name}`)
  }
} catch (e) {
  console.log(`${'create token'.padEnd(44)} FAILED ${e.message}`)
}
