## Decision Record – Hosting, Deployment & Secrets

- **Category:** Hosting & deployment
- **Decision:** Deploy on Vercel (Edge Runtime) with Vercel-managed environment secrets.
- **Affects FR categories:** AI & Processing, Performance, Security, Deployment.
- **Rationale:** Vercel offers native Next.js support, global edge nodes for low-latency streaming, and built-in secret management that keeps OpenAI keys off the client while honoring the no-login experience.
- **Implementation notes:**
  - Store OpenAI API keys and future service credentials in Vercel Environment Variables (dev/preview/prod scopes).
  - Use a minimal Edge Function to mint short-lived tokens or signed URLs so the browser can initiate Realtime connections without exposing secrets.
  - Monitor Vercel streaming limits; if sessions grow, consider segmenting traffic per region.

