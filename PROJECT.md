# Luter

Luter (short for "lang tutor") is a voice conversation language app. This file is the single source of truth for what we are building and why. Phases live in [PLAN.md](PLAN.md).

Last updated: 2026-11-22

## What it is

A web app you talk to. It talks back like a real person in the language you are practising, shows a live transcript, and explains words on request. It keeps the conversation inside what the learner already knows, plus a small stretch.

## Users

Two users, each with their own profile.

| | Learner A | Learner B |
|---|---|---|
| Practises | Mandarin | English |
| Explanations in | English | Mandarin |
| Level | Beginner. Can go back and forth on known topics (food, classes, family) | Working level |
| Mode | Topic mode | Fluency mode |

## Decisions

| # | Decision | Why |
|---|---|---|
| 1 | Speech-to-speech over a streaming connection, not record/upload/wait | Fluency is the product. Response time is around 300ms and you can interrupt |
| 2 | Gemini Live API, connected directly from the browser | Free tier, speech-to-speech, returns transcripts of both sides |
| 3 | Start on the free tier, switch to paid only if it causes problems | Paid is roughly 10p per 10 minute session, and the switch is a billing change with no code change |
| 4 | Web app installed to the iPhone home screen (PWA), no native app | Cheapest path. Mic and WebSockets work in iOS home screen apps |
| 5 | No LiveKit or other voice framework | Not needed for two users |
| 6 | Cloudflare Pages (hosting), one Worker (tokens and API), D1 (data), Access (login) | All free at this scale. Access gives email login with no auth code to write |
| 7 | Each profile has a target language and a support language | One engine covers Mandarin with English help and English with Mandarin help |
| 8 | Two modes: topic mode and fluency mode | A beginner and a working-level speaker need opposite things |
| 9 | Mandarin knowledge is modelled by topic, with words tagged by topic | "Talk about ordering food, plus these 3 new words" is far easier for the model to obey than a strict word list |
| 10 | Explain is a button, plus tap a word for dictionary lookup | Cleaner than detecting spoken questions, and gives a clear "not known yet" signal |
| 11 | Live transcript always visible, pinyin above Chinese characters | Core learning aid |
| 12 | Translation line per tutor turn, tap to reveal, from a cheap text model in the background | Never slows the voice. Hidden by default so it does not replace listening |
| 13 | No browser built-in speech recognition | Unreliable in iOS home screen apps and poor with learner Mandarin |
| 14 | Skip Gemini Live Translate | It is an interpreter, we want a conversation partner |
| 15 | Plan and docs live in the repo as markdown | Personal project, kept out of work Notion and Drive |

## Stack

| Layer | Choice |
|---|---|
| Frontend | Vite, React, TypeScript, PWA manifest |
| Voice | Gemini Live API over WebSocket (`@google/genai`), model name held in config |
| Background text | Gemini Flash (translations, feedback cards, vocabulary checks) |
| Auth to Gemini | Short-lived tokens minted by the Worker, API key never in the browser |
| Backend | One Cloudflare Worker |
| Database | Cloudflare D1 |
| Login | Cloudflare Access (email code) |
| Pinyin | `pinyin-pro`, in the browser |
| Word splitting | `Intl.Segmenter`, in the browser |
| Dictionaries | CC-CEDICT (Chinese to English), ECDICT (English to Chinese, with frequency ranks and word forms) |

## How the modes work

### Topic mode (Mandarin learner)

- **Seeding:** pick the topics you can already handle. Each topic has a core word set that starts as known.
- **Conversation:** all Mandarin, short turns, inside known topics. English only on Explain or when stuck.
- **Stretch:** 2 or 3 new words per session, first from inside a known topic, then from a neighbouring topic once one is solid.
- **Display:** pinyin on, translation one tap away.

### Fluency mode (English learner)

- **Conversation:** natural speed, UK voice, no word limits, scenario based (meetings, small talk, calls).
- **Feedback cards:** after each learner turn, a background model suggests a more natural phrasing, explained in Mandarin. It never interrupts.
- **Tracking:** only words and idioms that were looked up or corrected, resurfaced in later sessions.

## Vocabulary model

- **Storage:** one row per user per word, tagged with topic, with a state (unseen, introduced, learning, known) and a strength that decays over time.
- **Evidence:** using a word correctly is strong evidence, hearing it and replying sensibly is weak evidence, Explain or a dictionary tap is negative evidence.
- **Steering:** the session prompt carries the topic, level and target new words. Corrections during a session go in as text messages, because system instructions cannot change mid-session.
- **Checking:** runs in the background after each tutor turn, never on the audio path.

## Gemini Live constraints we design around

| Constraint | Handling |
|---|---|
| Connection resets at about 10 minutes | Handle GoAway, reconnect with session resumption |
| Resumption can fail, especially with short-lived tokens | Fallback: start a fresh session seeded with topic, target words and the last few turns as text |
| Audio sessions cap at 15 minutes uncompressed | Context window compression on from day one |
| Compression drops older turns | Fine, long-term memory is the vocabulary database |
| Free tier limits concurrent sessions per project | Second free API key if both users clash |
| Free tier data is used to improve Google products | Accepted for now, goes away on paid |
| Live models are renamed and retired often | Model name in config |

Sessions are designed to be about 10 minutes, one scenario each, so most never need the reconnect.

## Cost guardrails

- Idle timeout: end the session after about a minute of silence.
- Clear on-screen message when the free tier refuses a session.
- If we move to paid: monthly budget alert in Google Cloud.
- Paid reference rates (November 2026): $0.005 per minute audio in, $0.018 per minute audio out.

## Known limits

- English feedback covers wording and grammar, not accent. Transcription tidies up speech and pronunciation scoring is not reliable.
- The transcript can lag slightly behind the audio.

## Open questions

- Does the Live model stay inside a topic and simple vocabulary well enough? Tested in phase zero.
- Is the Mandarin voice quality and tone accuracy good enough for a learner? Tested in phase zero.
- ~~Which current Live model has free tier access?~~ Answered 2026-11-22: `gemini-3.8-live` (Google's recommended Live model) is free of charge on the free tier. Fallbacks in config: `gemini-3.1-flash-live-preview`, `gemini-2.5-flash-native-audio-preview-12-2025`. Rate limits are per project and shown in AI Studio.

