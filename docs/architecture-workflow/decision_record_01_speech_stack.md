## Decision Record – Speech Capture & Transcription

- **Category:** Real-time audio & transcription
- **Decision:** Use Web Audio API capture + OpenAI Realtime API for all transcription (Option B)
- **Version:** OpenAI Realtime API (latest stable, will re-verify exact version once search feed stabilizes)
- **Affects FR categories:** Voice Interaction & Conversation, Code-Switching Support, Learning Cards
- **Rationale:** Delivers consistent bilingual accuracy across browsers, keeps latency predictable, and avoids fragmented experiences caused by the varying quality of native Web Speech API implementations.
- **Implementation notes:** Stream microphone audio via WebRTC/SSE to OpenAI Realtime, maintain resilient connection handling, and mirror transcripts into the Learning Card engine. Handle reconnection gracefully to honor “safe, no-login” UX.

