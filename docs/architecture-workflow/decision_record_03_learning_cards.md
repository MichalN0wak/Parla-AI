## Decision Record – Learning Card Engine

- **Category:** Real-time learning feedback
- **Decision:** Client-only reactive store (Zustand) manages transcripts and Learning Cards locally.
- **Affects FR categories:** Learning Cards & Real-Time Feedback, User Interface & Experience, Data & Privacy.
- **Rationale:** Keeps all learning insights in the browser (aligns with privacy promise), delivers instant UI updates, and minimizes infrastructure. Zustand provides simple hooks for components to subscribe to card updates without prop drilling.
- **Implementation notes:** 
  - Maintain a `useLearningCardsStore` with arrays for vocabulary cards, correction cards, and transcript snippets.
  - Stream AI insights into the store as soon as they arrive.
  - Use lightweight virtualization if the list grows, and clear state on session end to avoid leaking past data.

