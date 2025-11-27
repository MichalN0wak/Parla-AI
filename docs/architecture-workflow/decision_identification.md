## Decision Identification

### Facilitation Mode
- Config indicates user_skill_level = beginner → Mode set to **BEGINNER** with plain-language explanations and protective pacing.

### Loaded decision intelligence
- Decision catalog + architecture patterns loaded from `.bmad/bmm/workflows/3-solutioning/architecture`.
- Starter already covers: TypeScript, routing, styling pipeline, linting, testing scaffold, base structure. Remaining focus is on AI/audio capabilities, PWA setup, and privacy constraints.

### Critical decisions (blockers)
1. **Speech + transcription stack:** Web Speech API + fallback strategy for browsers without native support; choose streaming provider for Italian/Polish transcription (e.g., OpenAI Realtime API).
2. **AI conversation orchestration:** Model selection (GPT-4o mini / Realtime), session state management, and cost controls given no backend persistence.
3. **Learning Card engine:** Real-time detection pipeline, state store, rendering strategy to keep UI responsive.
4. **Hosting + deployment:** Vercel edge/runtime model, environment secret strategy (since no backend sessions).

### Important decisions (shape architecture)
- **PWA/offline strategy:** assets caching, audio worklets, handling offline UI gracefully.
- **State management:** global state (Zustand/Redux) vs. React Query for streaming updates vs. server actions.
- **Local storage boundary:** what (if anything) is stored locally for session summaries without violating privacy promise.
- **Streaming transport:** SSE/WebRTC vs. simple fetch for voice segments.
- **Error handling + observability:** structured logging, toast strategy, fallback UI when AI or transcription fails.

### Nice-to-have (can defer)
- Multi-language extensibility framework.
- Future analytics hooks (privacy-preserving).
- Advanced accessibility tooling (axe automation vs. manual checklist).

### Plan for Michal
Great! I analyzed your requirements and found **12 key technical choices** we still need to make. The starter template handles the base React/Next/Tailwind setup, so we’ll focus on the remaining **8 decisions** that impact AI voice flows, Learning Cards, privacy, and deployment. I’ll walk you through each one in friendly language and explain why it matters before we lock it in together.

