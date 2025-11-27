## Cross-Cutting Decisions

### Error handling & messaging
- Global toast system with encouraging tone (“We lost the connection—trying again now”).  
- ARIA live regions announce the same message for screen reader users.  
- Conversation view shows inline status banners only when needed (no modals mid-session).

### Logging & observability
- Client logs: redact user speech; capture mic state transitions, AI errors, Learning Card pipeline events.  
- Edge logs: request ID + error classification; forward to Vercel observability sink.  
- All logs tagged with session-safe IDs (no PII).

### Date/time & localization
- Timestamps displayed as relative (“Just now”, “1 min ago”) using `date-fns`.  
- Internally store ISO strings (UTC) for any cached notes.  
- Future language expansion: wrap all copy in `next-intl`, but MVP uses English UI with Italian/Polish content.

### Naming conventions
- Components: `PascalCase` (e.g., `LearningCard`).  
- Files: `learning-card.tsx`.  
- State stores: `useXStore`.  
- API routes: `/api/conversation/start`, `/api/conversation/token`.  
- Events: `conversation:start`, `learningCard:add`.

### Testing strategy
- Unit tests via Jest/RTL for stores and components.  
- Playwright for E2E happy paths (start session, show cards, end session).  
- Add mocked WebRTC tests to ensure fallback UI when connection fails.

### Accessibility consistency
- All interactive controls ≥44px, visible focus rings, keyboard-first flows.  
- Learning Cards announced via polite ARIA live region when added.  
- Respect `prefers-reduced-motion` for animations.

