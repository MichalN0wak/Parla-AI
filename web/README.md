# Parla AI · Web App

Voice-first practice space for Polish speakers learning Italian, implemented with Next.js App Router + Tailwind v4.

## Requirements

- Node.js 20.x (aligns with CI runner)
- npm 10+

## Getting started

```bash
cd web
npm install
cp .env.example .env.local  # populate secrets locally
npm run dev
```

The dev server runs on [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_APP_ENV` | `local`, `preview`, or `production` to toggle UX hints |
| `NEXT_PUBLIC_API_BASE_URL` | Future backend/edge endpoint for conversation + transcription |
| `OPENAI_API_KEY` | Secret key for AI orchestration (never committed) |
| `SPEECH_PROVIDER_API_KEY` | Speech vendor credential (Web Speech API fallback until Story 1.2) |

Store secrets in `.env.local` (git-ignored). CI never needs real keys because lint/typecheck/build do not hit external services yet.

## npm scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js in development mode |
| `npm run build` | Production bundle + route type generation |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (Next core web vitals config) |
| `npm run typecheck` | `tsc --noEmit` to guard contracts |

## Project layout

- `src/app` – App Router entry point
- `src/app/page.tsx` – Story 1.1 placeholder shell (landing + conversation + card panes)
- `src/app/globals.css` – Tailwind v4 global tokens
- `public/` – Static assets (icons, logos)
- `src/store/useVoiceStore.ts` – Zustand voice session state (mic status, transcripts)
- `src/store/useSessionStore.ts` – Topic/proficiency/session metadata
- `src/hooks/useMicrophoneController.ts` – Web Audio permission/request logic
- `src/components/session/SessionLanding.tsx` – Story 1.3 intake form w/ validation
- `src/components/voice/VoiceExperience.tsx` – Story 1.4 split layout w/ sticky header + mic status chips

Docs that feed planning live in `../docs` (PRD, product brief, architecture notes).

## CI

`.github/workflows/web-ci.yml` runs `npm install`, `lint`, `typecheck`, and `build` on pushes + PRs targeting `main` or `trunk`. This keeps Story 1.1 acceptance criteria (“repo is safe to ship”) enforced automatically.
