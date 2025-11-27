## Parla-AI Decision Architecture

### 1. Executive Summary
Parla-AI is a voice-first Italian conversation companion that lets Polish learners speak freely while receiving real-time Learning Cards. The architecture pairs Next.js 15 + Vercel Edge hosting with OpenAI Realtime streaming to guarantee low-latency, bilingual conversations without storing user data. Consistent state management (Zustand + React Query), client-only Learning Card engine, and privacy-first PWA shell keep the experience fast, safe, and accessible.

### 2. Project Initialization
- **Starter command (first implementation story):**
  ```
  npx create-next-app@latest parla-ai \
    --typescript \
    --tailwind \
    --eslint \
    --app \
    --src-dir \
    --turbopack \
    --use-npm \
    --import-alias "@/*"
  ```
- Starter provides TypeScript, App Router, Tailwind, Jest/RTL, ESLint/Prettier, Turbopack dev server, and the base `src/app` structure.

### 3. Decision Summary Table
| Category | Decision | Version / Notes |
| --- | --- | --- |
| Base stack *(PROVIDED BY STARTER)* | Next.js 15 App Router, TypeScript, Tailwind, Jest/RTL, ESLint/Prettier, Turbopack | `npx create-next-app@latest` pins latest release |
| Speech capture & transcription | Web Audio capture + OpenAI Realtime (WebRTC) | Verify latest Realtime build on execution day |
| AI orchestration | GPT-4o mini Realtime channel, client session context | Re-verify release channel |
| Learning Cards | Client-only Zustand store | Clears on session end |
| Hosting & secrets | Vercel Edge Runtime + env vars | Edge token endpoint mints WebRTC credentials |
| PWA/offline | Minimal shell + offline message | next-pwa/service worker |
| State & streaming | Zustand + React Query; WebRTC transport | Edge Function token |
| Local storage | `sessionStorage` only | Manual “Forget session” |
| Errors/logging | Structured client + Edge logs, friendly toasts | ARIA live regions |

### 4. Project Structure
See `docs/architecture-workflow/project_structure.md` for full tree. Highlights:
- `src/app`: App Router pages + Edge routes (`/api/token`, `/api/health`, offline page).
- `components/voice`, `components/learning-cards`, `components/session`, `components/ui`.
- `hooks`: `useAudioInput`, `useRealtimeConnection`, `useLearningCards`.
- `stores`: `useAppStore`, `useLearningCardsStore`.
- `lib`: logging, date, storage helpers.
- `tests`: Jest unit + Playwright e2e suites.

### 5. FR Category Mapping
- Voice Interaction & Conversation → `useAudioInput`, `useRealtimeConnection`, `components/voice`.
- Code-Switching Support → Code-Switch Interpreter inside `useRealtimeConnection`.
- Learning Cards → `components/learning-cards`, `useLearningCardsStore`, `sessionStorage` helpers.
- Session Management → `components/session`, `useAppStore`, `lib/storage`.
- UI/Accessibility → `components/ui`, global layout, toasts, ARIA patterns.
- Data & Privacy → Edge token route, sessionStorage boundaries, zero server persistence.

### 6. Technology Stack
- Next.js 15 (App Router, React Server Components)
- TypeScript, Tailwind, shadcn/ui
- Vercel Edge Functions + env secrets
- OpenAI Realtime (GPT-4o mini class) via WebRTC
- Zustand + React Query, date-fns
- Jest/RTL, Playwright

### 7. Integration Points
- `/api/conversation/token`: Edge Function that returns a signed credential for WebRTC.
- `useRealtimeConnection`: Connects to OpenAI Realtime using that token, streams audio/transcripts.
- `learning-card` store: receives interpreter events and updates UI/PWA cache.

### 8. Novel Pattern Designs
- **Real-Time Bilingual Conversation Loop** (see `docs/architecture-workflow/novel_pattern_designs.md`): orchestrates audio capture, Realtime streaming, code-switch interpretation, and Learning Card generation without blocking the conversation.

### 9. Implementation Patterns
- Naming, structure, format, communication, lifecycle, location, consistency patterns documented in `docs/architecture-workflow/implementation_patterns.md`.

### 10. Data Architecture
- No server-side persistence. Client holds session metadata + Learning Cards in `sessionStorage`. Logs contain only redacted, non-PII metadata.

### 11. API Contracts
- `/api/conversation/token` (POST): returns `{ success, data: { token, expiresAt }, error? }`.
- `/api/health` (GET): returns `{ success: true, data: { timestamp, env } }`.

### 12. Security & Privacy
- Secrets stored in Vercel env vars; token endpoint issues short-lived WebRTC credentials.
- Client redacts logged content; no audio stored.
- `sessionStorage` cleared at session end or via “Forget session.”

### 13. Performance & Accessibility
- Targets: <2s transcription latency, <3s AI response start, real-time Learning Card updates.
- Accessibility: 44px targets, focus visible, ARIA live regions, `prefers-reduced-motion` respected.

### 14. Deployment & Environment
- Deploy to Vercel production + preview environments.
- Use protected env vars per environment; rotate OpenAI keys periodically.
- Monitor usage via Vercel analytics + structured logs.

### 15. Architecture Decision Records
- SDR-01 Speech Stack
- SDR-02 AI Orchestration
- SDR-03 Learning Cards
- SDR-04 Hosting
- SDR-05 PWA
- SDR-06 State & Streaming
- SDR-07 Local Storage
- SDR-08 Error/Logging
Stored individually under `docs/architecture-workflow/decision_record_*.md`.

