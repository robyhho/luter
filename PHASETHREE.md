# Phase 3: English fluency mode

Back to [PLAN.md](PLAN.md)

## Goal

A working-level English speaker gets natural conversation practice with useful corrections, explained in Mandarin.

## In scope

- English dictionary lookup with Chinese meanings
- Scenario based conversations
- Feedback cards after each learner turn
- Tracking of looked-up and corrected items

## Out of scope

- Pronunciation or accent scoring (not reliable, see PROJECT.md)
- Vocabulary limits (not useful at this level)

## Tasks

### Dictionary

- [ ] Bundle a trimmed ECDICT (common words only, to keep the download small)
- [ ] Tap an English word: popover with Chinese meaning
- [ ] Group word forms so "run", "ran" and "running" count as one word
- [ ] Explain button answers in Mandarin

### Scenarios

- [ ] Scenario list: work meeting, small talk, phone call, disagreeing politely, interview, plus custom
- [ ] Fluency prompt per scenario, with the tutor playing a role
- [ ] UK voice selected in config

### Feedback cards

- [ ] After each learner turn, a background text model reviews the transcript
- [ ] Card shows: what was said, a more natural version, a short reason in Mandarin
- [ ] Only show a card when there is something worth correcting
- [ ] Cards appear beside the transcript and never interrupt the audio
- [ ] End of session summary of the cards

### Tracking

- [ ] Store looked-up words, corrected phrases and new idioms per user
- [ ] Feed a few of them into the next session's prompt so the tutor works them back in

### Translation line

- [ ] Confirm the phase 2 translation line works English to Mandarin

## Things to measure

| Question | How |
|---|---|
| Are the cards useful? | Share of cards the learner agrees with, target most of them |
| Are there too many? | Cards per session, aim for a handful |
| Do corrections stick? | Same mistake repeated in later sessions |

## Done when

- A 10 minute English session produces a short, sensible set of feedback cards.
- Items from earlier sessions come back naturally in later ones.
