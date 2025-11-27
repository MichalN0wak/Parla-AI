## Project Structure & Boundaries

```
parla-ai/
├─ .vscode/
│  └─ settings.json                 # Recommended extensions, formatting
├─ public/
│  ├─ icons/                        # App icons, PWA assets
│  ├─ sounds/                       # Mic chimes (optional)
│  └─ manifest.json                 # Next.js PWA manifest
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                 # Global app shell, theming
│  │  ├─ page.tsx                   # Landing + conversation starter
│  │  ├─ conversation/
│  │  │  ├─ page.tsx                # Main conversation split view
│  │  │  └─ offline/page.tsx        # Offline fallback screen
│  │  └─ api/
│  │     ├─ token/route.ts          # Edge Function: mint WebRTC token
│  │     └─ health/route.ts         # Basic uptime/diagnostics
│  ├─ components/
│  │  ├─ voice/
│  │  │  ├─ MicButton.tsx
│  │  │  ├─ StatusIndicator.tsx
│  │  │  └─ Waveform.tsx
│  │  ├─ learning-cards/
│  │  │  ├─ VocabularyCard.tsx
│  │  │  ├─ CorrectionCard.tsx
│  │  │  └─ CardList.tsx
│  │  ├─ session/
│  │  │  ├─ TopicInput.tsx
│  │  │  ├─ LevelSelector.tsx
│  │  │  └─ SummaryPanel.tsx
│  │  └─ ui/                        # shadcn/ui exports
│  ├─ hooks/
│  │  ├─ useAudioInput.ts
│  │  ├─ useRealtimeConnection.ts
│  │  └─ useLearningCards.ts        # Zustand selector helpers
│  ├─ stores/
│  │  ├─ useAppStore.ts
│  │  └─ useLearningCardsStore.ts
│  ├─ lib/
│  │  ├─ logging.ts
│  │  ├─ date.ts
│  │  ├─ storage.ts                 # sessionStorage helpers
│  │  └─ analytics.ts               # placeholder for future
│  ├─ styles/
│  │  └─ globals.css
│  └─ tests/
│     ├─ unit/
│     │  ├─ stores/
│     │  │  └─ app-store.test.ts
│     │  └─ components/
│     │     └─ learning-card.test.tsx
│     └─ e2e/
│        └─ conversation.spec.ts
├─ playwright.config.ts
├─ next.config.js
├─ package.json
└─ README.md
```

### Requirement Mapping
- **Voice Interaction & Conversation** → `src/hooks/useAudioInput.ts`, `useRealtimeConnection.ts`, `app/api/token/route.ts`.
- **Code-Switching Support** → Implemented inside `useRealtimeConnection` and Learning Card processors.
- **Learning Cards & Real-Time Feedback** → `components/learning-cards`, `stores/useLearningCardsStore.ts`.
- **Session Management** → `components/session`, `stores/useAppStore.ts`, `lib/storage.ts`.
- **User Interface & Experience / Accessibility** → `components/voice`, `components/ui`, `styles/globals.css`.
- **Data & Privacy** → `lib/storage.ts`, `app/api/token/route.ts` (no persistent storage).
- **Browser & Platform Support / PWA** → `public/manifest.json`, `app/conversation/offline/page.tsx`.
- **AI & Processing** → `hooks/useRealtimeConnection.ts`, `app/api/token/route.ts`.
- **Testing** → `src/tests/unit`, `src/tests/e2e`.

