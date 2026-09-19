# Futbol Island

The maintained Futbol Island app: Next.js 14, React 18 and Three.js. Production: https://futbolisland.app.

## Develop

```sh
npm ci
npm run dev
```

Open http://localhost:8092. Development output lives in `.next-dev`; production output in `.next`.

```sh
npm run typecheck
npm test
npm run build
npm start
```

The complete regression suite is `node --test --test-concurrency=2 tests/*.cjs`. At the September 19 consolidation audit, 87 of 92 passed; see [the audit](docs/consolidation-audit-2026-09-19.md) for the five known failures.

## Configuration and deployment

Local `.env.local`, `.vercel`, dependencies and build caches are intentionally untracked. Configure integration secrets locally or in Vercel; do not commit them. The existing production Vercel project is named `futbol-island`.

## Project history and offline authoring

This directory was formerly `futbol-island2`. Historical browser storage keys are retained to preserve player progress. Older implementations are kept in private local recovery archives, outside this repository.

The running app and build are self-contained. Five legacy lesson-import/narration scripts require an optional restored original project under `../project-archives/restored/futbol-island`. See the consolidation audit before using these tools. Recovery archives may contain private configuration and must not be committed. Existing production assets are included here.

Read [AGENTS.md](AGENTS.md), [PROJECT.md](PROJECT.md), and [the performance guide](docs/performance-guide.md) before changing game behavior. Third-party authoring references retain their upstream license under `vendor/`.
