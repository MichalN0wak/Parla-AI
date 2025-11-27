## Decision Record – Local Storage Boundaries

- **Category:** Data & privacy
- **Decision:** Store session metadata and Learning Cards in `sessionStorage` only; wipe on session end or manual “Forget session.”
- **Affects FR categories:** Data & Privacy, Session Management, Learning Cards.
- **Rationale:** Provides resilience against accidental refresh while keeping data confined to the current tab, reinforcing the “no stored conversations” promise.
- **Implementation notes:** 
  - Mirror `useLearningCardsStore` state into `sessionStorage` (serialize minimal fields).
  - Watch for `beforeunload` to clean up, and offer a UI action to clear the session immediately.
  - Never persist raw audio; only store structured card data and current topic/level.

