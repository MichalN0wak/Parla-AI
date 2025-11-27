## Decision Record – State Management & Streaming Transport

- **Category:** State management & data transport
- **Decision:** Use Zustand for UI/learning state + React Query for async calls, and stream audio/AI responses via WebRTC to OpenAI Realtime.
- **Affects FR categories:** Voice Interaction & Conversation, Session Management, AI & Processing.
- **Rationale:** Zustand keeps the UI responsive without prop drilling, React Query handles retries/caching for auxiliary requests, and WebRTC delivers the lowest-latency bidirectional stream between the browser and OpenAI’s Realtime endpoint.
- **Implementation notes:**
  - `useAppStore` tracks mic status, session metadata, and ties into `useLearningCardsStore`.
  - React Query manages non-streaming requests (topic suggestions, session summary fetch, health checks).
  - Edge Function mints a short-lived WebRTC token; client establishes the Realtime connection directly. Provide TURN fallback for restrictive networks.

