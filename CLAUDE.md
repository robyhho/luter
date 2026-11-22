# Luter: rules for Claude

## Secrets

- Never read, open, cat, grep, stage, copy or print `.env`, `.env.local` or any other `.env*` file, and never inspect its values in any way, including length or prefix. `.env.example` is the only exception.
- Never run a command or script that outputs anything derived from a key or token.
- If a task seems to need the key (for example, debugging auth), ask Robbie to run the check himself and paste the output.

## Project

- Personal project. Use only personal accounts: GitHub `robyhho`, a personal Google account, personal Cloudflare. Nothing work-related.
- Decisions and design are in PROJECT.md, phases in PLAN.md and the PHASE*.md files.
