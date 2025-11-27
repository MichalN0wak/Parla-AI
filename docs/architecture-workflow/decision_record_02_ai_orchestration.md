## Decision Record – AI Conversation Orchestration

- **Category:** AI orchestration & session state
- **Decision:** Use OpenAI Realtime API (GPT-4o mini or equivalent) for streaming Italian responses, with lightweight client-managed session context.
- **Version:** GPT-4o mini Realtime (verify exact build once web search resumes normal results).
- **Affects FR categories:** Voice Interaction & Conversation, AI & Processing, Learning Cards.
- **Rationale:** Realtime API keeps latency low (<3s target), supports bilingual context, and lets us coordinate both transcription and response generation over a single channel. Client-side session state aligns with the no-login requirement and avoids storing user speech server-side.
- **Implementation notes:** Maintain a conversational state object in the client (topic, proficiency, recent turns). Send concise summaries with each request to respect token limits. Handle cost controls by capping session length and providing a “new session” reset.

