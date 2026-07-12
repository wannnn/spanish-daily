# CLAUDE.md

## Purpose

`spanish-daily` is a personal Spanish learning automation system. It generates one Spanish vocabulary lesson per day, with AI-written explanations and examples, and keeps a record of what has been learned.

## Long-term vision

The finished system should, without manual effort:

- Select words from a curated vocabulary dataset.
- Generate a daily lesson using the Claude API — explanations, word variations, and example sentences.
- Store learning records so past lessons and progress are queryable.
- Publish each lesson to Notion.
- Send a daily notification through Telegram.
- Run on a schedule via GitHub Actions.

This is the destination, not the current state. Nothing above is built yet.

## Current stage

The repository is initialized and nothing more. There is no application code, no `src/` directory, and no integrations. The next step is deciding and building the first slice of learning logic — not wiring up Notion, Telegram, or Actions.

## Technology stack

**In use now**

- Node.js with TypeScript (strict mode, ES2022, NodeNext modules, ESM)
- npm for package management
- Dev dependencies are limited to `typescript` and `@types/node`

**Planned, not yet added**

- Claude API, used to generate the daily lessons
- Notion, Telegram, and GitHub Actions integrations

Anything not listed above is undecided. The vocabulary dataset format, the storage layer, and the lesson schema are open questions — do not assume an answer to them.

## Development principles

- Build one capability at a time and keep it working before starting the next.
- Prefer the simplest thing that solves the problem at hand. This is a personal project, not a platform.
- Add a dependency only when it is needed for the feature being built.
- Defer decisions until the code forces them. An undecided detail is better than a wrong abstraction.

## Rules for changes

- Do not add integrations (Notion, Telegram, GitHub Actions) ahead of the learning logic they are meant to carry.
- Do not create directories or scaffolding for features that do not exist yet.
- Do not install packages that the current step does not require.
- When a design decision is genuinely open, ask rather than guessing and building on the guess.
- Keep `README.md` as the short public description; keep planning and context in this file.
