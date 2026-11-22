# Phase 5: living mascot

Back to [PLAN.md](PLAN.md)

## Goal

The mascot is the tutor's face. It feels alive and looks like it's the one talking, so a session feels like chatting with a character rather than an app.

## In scope

- An animatable version of the mascot
- States driven by the Live session: idle, listening, thinking, talking, confused (on Explain or "I'm stuck"), happy (on a correct new word)
- Talking motion synced to the tutor's audio

## Out of scope

- New characters or outfits
- Full lip sync to phonemes. The mascot has no mouth in the base art, so "talking" is body motion plus a simple mouth that appears while speaking

## Tasks

### Art

- [ ] Rebuild the mascot as layered vector art (body, leaf, each eye, highlights, an optional mouth) from `design/mascot-original.png`
- [ ] Pick the animation tool: Rive (state machine with live inputs, small runtime) or hand-built SVG with CSS and JS (no dependency). Decide at the start of the phase

### States

- [ ] Idle: slow breathing squash and stretch, occasional blink, leaf sway
- [ ] Listening: leans in, eyes widen, reacts to the mic level
- [ ] Thinking: eyes glance up while waiting for the first audio
- [ ] Talking: squash and stretch and mouth opening driven by the output audio level
- [ ] Confused and happy reactions for Explain, "I'm stuck" and new words used correctly

### Wiring

- [ ] Expose the tutor's output audio level (RMS of the PCM chunks as they play) and the mic level from the audio layer
- [ ] Map session events (setupComplete, interrupted, turnComplete, Explain) to mascot states
- [ ] Respect "reduce motion" in iOS settings

### Performance

- [ ] Smooth on the iPhone during a session, without adding to voice latency
- [ ] Animation assets lazy loaded, not in the first load

## Done when

- In a 10 minute session the mascot clearly reacts to listening, thinking and talking, and its talking motion lines up with the voice.
- No measurable change to response latency.
