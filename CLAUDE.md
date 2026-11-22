# Luter: rules for Claude

## Secrets

- Never read, open, cat, grep, stage, copy or print `.env`, `.env.local` or any other `.env*` file, and never inspect its values in any way, including length or prefix. `.env.example` is the only exception.
- Never run a command or script that outputs anything derived from a key or token.
- If a task seems to need the key (for example, debugging auth), ask Robbie to run the check himself and paste the output.

## Project

- Personal project. Use only personal accounts: GitHub `robyhho`, a personal Google account, personal Cloudflare. Nothing work-related.
- Decisions and design are in PROJECT.md, phases in PLAN.md and the PHASE*.md files.

## UI and UX

- Reference for look and feel: [ElevenLabs UI](https://ui.elevenlabs.io), an open source shadcn/ui registry of voice and agent components. Match its clean, calm, voice-first style.
- Stack for UI: Tailwind CSS and shadcn/ui. Add ElevenLabs components from the registry, so the source lands in `src/components/ui` and can be edited:
  `npx shadcn@latest add https://ui.elevenlabs.io/r/<component>.json`
- Likely components: `bar-visualizer` (tutor audio), `live-waveform` (mic), `conversation` and `message` (transcript), `voice-button`, `mic-selector`, `voice-picker`, `shimmering-text` (connecting states).
- Use the components for display only, driven by our own Gemini Live state. Never add the ElevenLabs agents SDK or an ElevenLabs account.
- Mobile first: it's an iPhone home screen app. Design for one hand, a thumb-reachable main button and a readable transcript.
- Keep the first load small.

## Mascot

- The mascot (orange persimmon blob with a leaf) is the tutor's face and the app icon. Use it instead of the ElevenLabs `orb`.
- Source art: `design/mascot-original.png` (transparent PNG). In the app: `public/mascot.png`, icons in `public/icons/`, `public/favicon.png`.
- Until phase 5 it's a static image, at most with light CSS motion. Phase 5 (PHASEFIVE.md) makes it fully animated and talking.
- Keep its look: rounded blob, soft highlights, big dark glossy eyes, green leaf, warm orange. Don't redraw or restyle it without asking.
