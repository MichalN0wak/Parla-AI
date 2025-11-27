## Decision Record – PWA & Offline Strategy

- **Category:** PWA/offline experience
- **Decision:** Minimal PWA shell that precaches UI chrome and shows an offline-friendly screen explaining that conversations require connectivity.
- **Affects FR categories:** Browser & Platform Support, User Interface & Experience, Data & Privacy.
- **Rationale:** Satisfies “basic offline functionality” by letting users load the landing screen and review local notes while being transparent that AI conversations need internet. Keeps implementation simple and avoids storing sensitive speech data offline.
- **Implementation notes:**
  - Use Next.js `app/manifest.json` + `next-pwa` (or custom service worker) to precache static assets and the landing page.
  - Provide an offline route that displays a friendly message and any locally cached Learning Cards from the current session.
  - Clear cached Learning Cards when the session ends to maintain privacy.

