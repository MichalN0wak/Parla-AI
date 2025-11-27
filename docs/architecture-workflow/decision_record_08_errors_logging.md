## Decision Record – Error Handling, Logging & Observability

- **Category:** Cross-cutting concerns
- **Decision:** Structured client logging + Edge Function error tracing, surfaced through user-friendly toasts and fallback UI.
- **Affects FR categories:** Voice Interaction & Conversation, AI & Processing, Data & Privacy, Accessibility.
- **Rationale:** Ensures every failure (mic permissions, AI response timeout, network drop) is handled gracefully, users see encouraging guidance, and developers have enough telemetry (without storing user speech) to debug issues.
- **Implementation notes:**
  - Client: use a lightweight logger (e.g., Logtail or custom console adapter) that redacts sensitive content; emit events for mic state changes, AI session errors, and Learning Card pipeline failures.
  - UI: show non-judgmental toasts (“Connection hiccup—retrying now”) and provide “Retry” or “Switch to text mode” options.
  - Edge Functions: capture structured logs (request ID, error type, timestamp) and forward to Vercel Observability or a privacy-conscious log sink.
  - Accessibility: ensure error messages are announced via ARIA live regions so keyboard users get the same guidance.

