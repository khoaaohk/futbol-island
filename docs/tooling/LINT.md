# Lint (ESLint), Nov 10 2026

`npm run lint` runs ESLint 8.57.1 with `eslint-config-next@14.2.15` (matches Next 14.2.15) over `app`, `components` and
`lib` (the same folders `next build` lints), with a cache in `node_modules/.cache/eslint/`. Config: `.eslintrc.json`
(JSON has no comments, so the reason for every rule setting lives here). The codebase was never linted and is written
in a dense one-line style, so the gate keeps **errors for real bugs only**; everything else is a warning or off, and
`npm run lint` exits 0 on the Nov 10 tree with 0 errors and 80 warnings, without any product-code edits.

## Rule settings

| Rule | Level | Why |
|---|---|---|
| `react-hooks/rules-of-hooks` | error | A hook called conditionally or outside a component is a real crash/state bug. |
| `@next/next/no-html-link-for-pages` | error | Kept from `next/core-web-vitals`; only matters for a `pages/` dir (there is none, App Router only), so it never fires today. |
| other `next/core-web-vitals` errors (`@next/next/no-sync-scripts`, `no-head-element`, `no-css-tags`, `react/jsx-key`, `react/no-direct-mutation-state` ...) | default (error) | Zero hits today; kept because each is a real bug. |
| `react-hooks/exhaustive-deps` | warn | 51 hits. Mostly deliberate mount-only effects with stable callbacks; a few look real (see below). Too many to gate on. |
| `@next/next/no-img-element` | warn | 27 hits. Game art uses plain `<img>` on purpose (sprites, canvases, data URLs); performance advice, not a bug. |
| `jsx-a11y/role-supports-aria-props` | warn | 1 hit (`aria-description` on a `<button>`, components/FishingHost.tsx:267); accessibility advice. |
| `import/no-anonymous-default-export` | off | 22 hits, pure style (anonymous default export objects in lib/). |
| plugin `@typescript-eslint` (loaded, no rules on) | - | Loaded only so existing `// eslint-disable ... @typescript-eslint/no-explicit-any` comments resolve instead of erroring "rule not found". TypeScript (`tsc`) already covers types and undefined names. |

## File-scoped exceptions (overrides)

- `react-hooks/rules-of-hooks` **off** in `components/museum/experiences/boots/boot.ts`, `lib/museum/museumBoot.ts`,
  `lib/shop/bootScene.ts`, `lib/town/ballReset.ts`: false positives. They call plain (non-React) helpers named
  `useShape` / `useFade` from three.js build code. The rule stays an error everywhere else. Avoid naming new non-hook
  helpers `useX`: the rule would flag them and fail CI (and `next build`).
- `components/PlayerCard.tsx`: `noInlineConfig`. Line 315 has `// eslint-disable-line react-hooks/exhaustive-deps (refs only)`;
  ESLint reads "(refs only)" as part of the rule name and reports a fatal "rule not found". Remove the override once
  that comment is rewritten as `// eslint-disable-line react-hooks/exhaustive-deps -- refs only`. Until then that file
  shows one extra "has no effect" warning.

## Build-time lint

Next runs ESLint during `next build` once a config exists, and fails the build on **errors** only (warnings print).
With 0 errors today the build is unaffected, so `eslint.ignoreDuringBuilds` is not set. If a future false positive
starts failing Vercel builds, either fix it or add an override here; `ignoreDuringBuilds: true` in `next.config.mjs`
is the fallback (CI still lints).

## Running it

    npm run lint                     # errors fail, warnings print
    npx eslint --ext .ts,.tsx app components lib -f json -o lint.json   # full report for triage
    npm run check                    # typecheck + relay typecheck + lint
