# Phase 2: profiles and Mandarin topic mode

Back to [PLAN.md](PLAN.md)

## Goal

The app knows what the Mandarin learner knows, keeps conversations inside it, and adds a few new words each session.

## In scope

- User profiles stored in D1
- Topics with core word sets
- Per-word tracking from transcripts
- Session prompts built from the learner's knowledge
- Translation line per tutor turn

## Out of scope

- English dictionary and feedback cards (phase 3)
- Review screens and progress charts (phase 4)

## Tasks

### Data

- [ ] D1 schema: `users`, `topics`, `words`, `user_topics`, `user_words`, `sessions`, `turns`
- [ ] Worker API for profile, topics, vocabulary and session save
- [ ] Identify the user from the Cloudflare Access login

### Profiles

- [ ] Profile settings: target language, support language, mode
- [ ] Replace the phase 1 language toggle with the profile

### Topics and seeding

- [ ] Topic list with a core word set per topic (start with about 10 topics, 20 to 40 words each, HSK 1 to 2 weighted)
- [ ] Map of neighbouring topics (food to shopping, family to describing people)
- [ ] Onboarding: pick the topics you can already handle, their core words start as known

### Tracking

- [ ] Save every turn's transcript at session end
- [ ] Split transcripts into words and match against the lexicon
- [ ] Update word state and strength from evidence: used correctly (strong), heard and replied (weak), Explain or dictionary tap (negative)
- [ ] Strength decays with time since last seen

### Steering

- [ ] Build the session prompt from: chosen topic, known topics, weak words to revisit, 2 or 3 new target words
- [ ] Pick new words from inside a known topic first, then from a neighbouring topic once a topic is solid
- [ ] Background check after each tutor turn: share of words outside the learner's vocabulary
- [ ] If the tutor drifts too hard, send a "simplify" text message into the session
- [ ] "I'm stuck" fallback: say it in English, the tutor gives the Mandarin to repeat

### Translation line

- [ ] Background text model translates each tutor turn into the support language
- [ ] Hidden by default, tap to reveal per line

## Things to measure

| Question | How |
|---|---|
| Does it stay inside what you know? | Share of tutor words that are known, target about 95% |
| Are new words sticking? | Target words from one session used correctly in a later one |
| Is the tracking right? | Spot check 20 words marked known |

## Done when

- A new session opens on a topic you know and introduces 2 or 3 new words without you asking.
- Words you tapped or asked about come back in a later session.
- Each user sees only their own profile and vocabulary.
