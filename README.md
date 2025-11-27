## Parla-AI Monorepo

This repository hosts the planning artifacts that live in `docs/` (PRD, product brief, architecture notes, BMAD workflow outputs) plus the actual Next.js implementation under `web/`.

### Structure

- `docs/` – Planning source of truth (PRD, product/architecture briefs, workflow outputs)
- `web/` – Next.js App Router project (Story 1.1 foundation and onward)
- `.github/workflows/` – GitHub Actions pipelines

### Getting started

```bash
cd web
npm install
cp .env.example .env.local  # populate secrets locally
npm run dev
```

See `web/README.md` for detailed environment guidance, scripts, and CI expectations.

