# Luter

Voice conversation language tutor. See [PROJECT.md](PROJECT.md) for what and why, and [PLAN.md](PLAN.md) for the phases.

Personal project: personal GitHub, personal Google account, personal Cloudflare. Nothing work-related.

## Run locally

1. **Gemini API key (personal Google account).** Sign in to [Google AI Studio](https://aistudio.google.com/apikey) with your personal Google account, create a project called `luter`, and create an API key in it. Don't add billing.
2. **Install and configure.**
   ```sh
   npm install
   cp .env.example .env.local   # paste the key after GEMINI_API_KEY=
   ```
3. **Run.**
   ```sh
   npm run dev
   ```
   Open http://localhost:5173, allow the mic, press Start. Use headphones.

`npm run dev` runs the app and the Worker together (Cloudflare Vite plugin). The browser asks the Worker's `/api/token` for a one-use Gemini token, and the Worker reads the key from `.env.local`. The key never reaches the browser or `dist/client`.

## Deploy (personal Cloudflare account)

One Worker serves the app and `/api/token`. Cloudflare Access sits in front so only the two of us can open it.

First time:

1. **Log in to Cloudflare** with your personal account: `npx wrangler login`
2. **Deploy once**: `npm run deploy`. Note the `https://luter.<subdomain>.workers.dev` URL.
3. **Add the Gemini key as a Worker secret** (run it yourself, it prompts for the key): `npx wrangler secret put GEMINI_API_KEY`
4. **Turn on Cloudflare Access.** In the dashboard: Workers & Pages → luter → Settings → Domains & Routes → workers.dev → enable Cloudflare Access. If it asks you to set up Zero Trust first, pick a team name and the Free plan.
5. **Allow the two emails.** Zero Trust → Access → Applications → the luter app → policy: Include → Emails → both addresses. Login method: one-time PIN. Set the session duration to 1 month so the phone app rarely asks you to sign in.
6. **Give the Worker the Access details.** From the Access app, copy the team domain (`https://<team>.cloudflareaccess.com`) and the Application Audience (AUD) tag into `vars` in `wrangler.jsonc`, then `npm run deploy` again. Until these are set, `/api/token` refuses every request that isn't from localhost.

After that, `npm run deploy` is all you need.

## Install on the iPhone

Open the workers.dev URL in Safari, sign in with the email code, then Share → Add to Home Screen. Open Luter from the home screen, allow the mic, press Start.

## Testing

- Latency (end of your speech to first audio) appears live under the controls. Phase 0 baseline on the Mac: median 940ms.
- Use **Copy report** at the end of a session to paste the settings, latency figures and transcript into notes.
- If the voice or latency fails, try another voice or model from the dropdowns first. Then try `vadSilenceMs` in `src/config.ts` (lower is snappier, but you may get cut off mid-sentence).

## UI

The look and feel follows [ElevenLabs UI](https://ui.elevenlabs.io), an open source set of voice and agent components built on shadcn/ui. We use Tailwind and shadcn/ui, and add its components into `src/components/ui`:

```sh
npx shadcn@latest add https://ui.elevenlabs.io/r/orb.json
```

They're used for display only. All the voice runs on Gemini Live, not ElevenLabs. Rules for this are in CLAUDE.md.

The tutor's face is the mascot, an orange persimmon blob: source art in `design/`, app copies in `public/`. It's static for now and becomes animated in phase 5 ([PHASEFIVE.md](PHASEFIVE.md)).

## Where things are

| File | What |
|---|---|
| `src/config.ts` | Model, voices, audio settings, VAD silence |
| `src/prompts.ts` | Rough topic (Mandarin) and fluency (English) prompts |
| `src/live/tutor.ts` | Live session: connect, stream mic, play audio, transcript, latency |
| `src/live/token.ts` | Gets a one-use Gemini token from the Worker |
| `src/device.ts` | Screen wake lock and iOS audio session |
| `worker/index.ts` | The Worker: `/api/token` (checks Access, mints the token) and serves the app |
| `wrangler.jsonc` | Worker config, Access vars |
| `src/audio/` | Mic capture (16kHz PCM), playback queue (24kHz PCM) |
| `public/pcm-capture-worklet.js` | AudioWorklet that resamples the mic to 16kHz |

## Personal GitHub

Repo: `robyhho/luter` (private), pushed over the `github-personal` SSH alias like the other personal projects.

The global git identity on this Mac is the work email, so this repo sets its own:

```sh
git config user.name  "Robbie Ho"
git config user.email "69515266+robyhho@users.noreply.github.com"
```

First push, after creating an empty private repo called `luter` on github.com as robyhho:

```sh
git init -b main
git config user.name  "Robbie Ho"
git config user.email "69515266+robyhho@users.noreply.github.com"
git add .
git commit -m "Luter: plan and phase 0 spike"
git remote add origin git@github-personal:robyhho/luter.git
git push -u origin main
```
