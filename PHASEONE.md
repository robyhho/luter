# Phase 1: conversation app

Back to [PLAN.md](PLAN.md)

## Goal

Turn the phase 0 spike into a real app: both users hold a 10 minute spoken conversation on their iPhones, with a live transcript, dictionary and Explain.

## In scope

- Live transcript with pinyin
- Tap a word for dictionary lookup
- Explain button
- Topic picker (prompt only, no stored vocabulary yet)
- Reconnect handling and idle timeout
- Deployed behind login, installed on the phone

## Out of scope

- Stored vocabulary and tracking (phase 2)
- Profiles in a database (phase 2). The language pair is a simple toggle for now
- Translation lines (phase 2)
- English feedback cards and English dictionary (phase 3)

## Tasks

### UI foundation

- [ ] Add Tailwind and shadcn/ui to the Vite app
- [ ] Add ElevenLabs UI components (conversation, message, voice button, a visualiser) and drive them from the Live session state
- [ ] Mobile-first layout: transcript fills the screen, main button within thumb reach
- [ ] Static mascot as the tutor avatar (light CSS idle motion at most, full animation is phase 5)

### Hosting, tokens and login

- [ ] Cloudflare Pages project and one Worker
- [ ] Worker endpoint that mints a short-lived Gemini token (API key stored as a Worker secret)
- [ ] Switch the app from the local API key to Worker tokens
- [ ] Cloudflare Access in front of the site and Worker, allow list of two emails

### Session management

- [ ] Context window compression enabled
- [ ] Handle GoAway and reconnect with session resumption
- [ ] Fallback when resumption fails: new session seeded with topic and the last few turns as text
- [ ] Idle timeout after about a minute of silence
- [ ] Clear message when the free tier refuses a session
- [ ] Visible states: connecting, listening, speaking, reconnecting

### Transcript

- [ ] Streaming transcript of both sides, styled as a conversation
- [ ] Pinyin above Chinese characters (`pinyin-pro`, ruby text)
- [ ] Split text into tappable words (`Intl.Segmenter`)

### Dictionary and Explain

- [ ] Bundle CC-CEDICT, loaded into IndexedDB on first run
- [ ] Tap a word: popover with pinyin and meaning
- [ ] Explain button in the popover: sends a text message into the session asking for an explanation in the support language, then continue

### Prompts and topics

- [ ] Tidy the phase 0 prompts into a topic mode prompt and a fluency mode prompt
- [ ] Topic picker with a starter list (food, classes, family, plus a few more)
- [ ] Language pair toggle

### PWA

- [ ] Manifest using the mascot icons in `public/icons/`, install to iPhone home screen
- [ ] Confirm mic permission and audio playback work in the installed app
- [ ] Keep the screen awake during a session

## Things to measure

| Question | How |
|---|---|
| Is it still fluent on a phone over mobile data? | Time from end of speech to first audio. Phase 0 baseline on the Mac: median 940ms with VAD silence at 600ms. Try 500ms if it feels slow |
| Does a session survive a reconnect? | Run a session past 10 minutes |
| Does it stay on topic and simple? | Count words per session you had to look up |
| Does the free tier hold up? | Note any refusals over a week of use |

## Done when

- Both users have completed a 10 minute session on their phones.
- A session survives a reconnect without losing the thread.
- Tapping a word and pressing Explain both work mid-conversation.
