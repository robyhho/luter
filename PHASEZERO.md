# Phase 0: spike

Back to [PLAN.md](PLAN.md)

## Goal

Speak Mandarin to it on the Mac and decide whether the latency and voice are good enough to build on. About a day of work, throwaway UI.

## In scope

- Accounts and keys
- Bare page: connect, mic in, audio out
- Raw transcript text on screen, for checking only

## Out of scope

- Everything else. No pinyin, dictionary, login, deployment or phone install

## Tasks

### Setup

- [x] Create the app with Vite, React, TypeScript
- [x] Push to a private repo on personal GitHub (robyhho/luter)
- [x] Create a Google AI Studio project and API key (personal Google account, steps in README.md)
- [x] Confirm which current Live model has free tier access (`gemini-3.8-live`, see PROJECT.md)
- [x] `config.ts` holding model name and voice
- [x] API key in `.env.local` for local use only, never committed or deployed

### Voice loop

- [x] Mic capture as 16kHz PCM via an AudioWorklet
- [x] Connect to the Live API with input and output transcription enabled
- [x] Play returned audio with a small buffer
- [x] Stop playback immediately when the learner interrupts
- [x] Start and stop button
- [x] Print both sides' transcript as plain text

### Prompts

- [x] Rough topic prompt: Mandarin only, short turns, simple words, one topic (ordering food)
- [x] Rough fluency prompt: natural UK English

## Things to measure

| Question | How | Pass |
|---|---|---|
| Does it feel like a conversation? | Time from end of speech to first audio | Under about 1 second |
| Is the Mandarin voice good enough? | Listen for tone accuracy on words you know | Sounds right to you |
| Does it hear beginner Mandarin? | Compare the transcript of your turns with what you said | Mostly correct |
| Does it stay simple and on topic? | A 5 minute food conversation | You follow most of it |
| Does the English side sound natural? | A 5 minute English chat | The English learner is happy with it |

## Results (2026-11-22)

Setup: `gemini-3.8-live`, default voices, VAD silence 600ms, Mac in the browser.

| Question | Result |
|---|---|
| Does it feel like a conversation? | Yes, just: median 940ms over 15 turns, 60% under 1s, worst 1385ms. About 600ms of that is the VAD silence wait |
| Is the Mandarin voice good enough? | Yes, tones sound right |
| Does it hear beginner Mandarin? | Yes, transcript mostly correct |
| Does it stay simple and on topic? | Yes, followed most of a food chat |
| Does the English side sound natural? | Yes, the English learner is happy |

Verdict: build phase 1 on Gemini Live. No change of voice provider needed.

Gotcha found: the SDK connects Live on the `v1` API by default, which fails. Use `v1beta` (in config). See PROJECT.md.

## Done when

- We have a yes or no on each row above.
- If any is a no, we try another voice or model, or revisit the voice provider, before starting phase 1.
- The open questions in PROJECT.md are updated with the answers.
