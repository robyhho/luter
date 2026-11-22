# Luter

Voice conversation language tutor. See [PROJECT.md](PROJECT.md) for what and why, and [PLAN.md](PLAN.md) for the phases.

Personal project: personal GitHub, personal Google account, personal Cloudflare. Nothing work-related.

## Run the phase 0 spike

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
   Open http://localhost:5173 in Chrome or Safari, allow the mic, press Start. Use headphones.

The key is only injected by the dev server. `npm run build` always gets an empty key, so it can never end up in `dist/`.

## Testing phase 0

Run each check from [PHASEZERO.md](PHASEZERO.md):

- Latency (end of your speech to first audio) appears live under the controls.
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
