/** Gets a one-use Gemini Live token from our Worker. The API key never reaches the browser. */
export async function fetchLiveToken(): Promise<string> {
  let r: Response
  try {
    // manual: if the Access sign-in has expired, Access answers with a redirect
    // to its login page, which we turn into a clear message instead of a CORS error.
    r = await fetch('/api/token', { method: 'POST', redirect: 'manual' })
  } catch {
    throw new Error('Could not reach the server. Check your connection.')
  }
  if (r.type === 'opaqueredirect' || r.status === 401) {
    throw new Error('Not signed in. Close and reopen the app to sign in again.')
  }
  const body = (await r.json().catch(() => ({}))) as { token?: string; error?: string }
  if (!r.ok || !body.token) throw new Error(body.error ?? `Token request failed (${r.status})`)
  return body.token
}
