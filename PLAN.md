# Luter plan

Decisions and design detail are in [PROJECT.md](PROJECT.md). This file only tracks the phases.

| Phase | File | Goal | Status |
|---|---|---|---|
| 0 | [PHASEZERO.md](PHASEZERO.md) | Spike: talk to it on the Mac, decide if latency and voice are good enough | Done |
| 1 | [PHASEONE.md](PHASEONE.md) | Talk to it on your phone: voice loop, live pinyin transcript, dictionary, Explain | Not started |
| 2 | [PHASETWO.md](PHASETWO.md) | Profiles and Mandarin topic mode: it knows what you know and stretches it | Not started |
| 3 | [PHASETHREE.md](PHASETHREE.md) | English fluency mode with feedback cards | Not started |
| 4 | [PHASEFOUR.md](PHASEFOUR.md) | Review, progress and polish | Not started |
| 5 | [PHASEFIVE.md](PHASEFIVE.md) | Living mascot: animated, reacts to the session and looks like it's talking | Not started |

## Order and reasoning

1. **Phase 1 first** because it answers the two open risks: is the conversation fluent enough, and is the Mandarin voice good enough. If either fails, we change the voice provider before building anything on top.
2. **Phase 2 next** because topic mode is the hardest part and the main idea of the app.
3. **Phase 3 after** because fluency mode reuses everything from phases 1 and 2 and mostly adds a second dictionary and feedback cards.
4. **Phase 4 next** because review features only matter once there is real usage data.
5. **Phase 5 last** because the animated mascot is polish on top of a working tutor. Until then the mascot appears as a static image.

## Rules

- Each phase ends with something both users can actually use.
- Update the status column here and tick tasks in the phase file as they are done.
- New decisions go in PROJECT.md, not in phase files.
