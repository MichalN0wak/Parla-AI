## Starter Template Decision

### Primary technology domain
- Real-time, voice-first web app → full-stack React meta-framework with great DX and edge streaming support.

### Selected starter (user approved)
- **`create-next-app@latest` (Next.js 15)** with TypeScript, App Router, Tailwind, Turbopack.
- Why it fits: matches shadcn/ui design system, supports streaming AI interactions, PWA-ready, Vercel-native deployment, and beginner-friendly tooling.
- Note: Live web search returned unrelated results earlier, but Vercel’s Oct 2024 release notes confirm Next.js 15 as current stable. We’ll retry search later if needed.

### Beginner-friendly mental model
Using this starter is like moving into a prefab studio that already has wiring, plumbing, and walls. We can immediately customize Parla’s unique voice UI without wasting time pouring the foundation.

### Initialization command (First implementation story)
```bash
npx create-next-app@latest parla-ai \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --turbopack \
  --use-npm \
  --import-alias "@/*"
```

### Decisions provided by the starter
- Language: TypeScript as default.
- Styling: Tailwind CSS pipeline ready for shadcn/ui tokens.
- Routing/rendering: Next.js App Router + React Server Components.
- Testing: Jest + React Testing Library scaffold (can swap later if desired).
- Linting/formatting: ESLint + Prettier configs tuned for Next.js.
- Build tooling: Turbopack dev server, SWC compiler, Vercel deployment scripts.
- Project structure: `src/app`, `src/components`, `src/lib`, API routes under `app/api`.

### Tracking note
- **First implementation story:** run the command above to lock in the base architecture and conventions for all agents.

