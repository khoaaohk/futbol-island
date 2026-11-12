/**
 * The public island's build flag (phase 1, docs/multiplayer-public-island-plan-2026-11-11.md). ONE helper for every agent:
 * client (lib/multiplayer/connection.ts), UI (components/party/*), drawing, copy (lib/site/safety.ts, components/privacy/*,
 * components/GrownUps.tsx, app/play/page.tsx) and analytics (lib/analytics/publicEvents.ts).
 *
 * On only when BOTH build flags are set on Vercel: NEXT_PUBLIC_MULTIPLAYER=1 (the party relay, today's switch) and
 * NEXT_PUBLIC_PUBLIC_WORLD=1 (players who do not know each other may share an island). Unset = off, and then every public-world
 * sentence, counter and admin block is inert and the policy reads exactly as it does today (tests/mp-public-copy.cjs).
 * NEXT_PUBLIC_* must be read literally so Next inlines it at build time (static pages are rebuilt when the flag changes).
 * The relay's own kill switch (POST /control, the admin button) closes public worlds at run time without a rebuild; the copy
 * still describes the feature, which stays true ("when it is open"). Owner steps: docs/multiplayer/PUBLIC-OWNER-STEPS.md.
 */
export function publicWorldEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MULTIPLAYER === '1' && process.env.NEXT_PUBLIC_PUBLIC_WORLD === '1';
}

/**
 * Phase 2 (Nov 12 2026): the holdout READING (docs/multiplayer/PHASE2-VERIFY.md). The 10% holdout arm itself is wired with the
 * public flag (lib/multiplayer/holdout.ts); this second switch adds the per-arm outcome totals (island minutes and returning
 * visits per arm, lib/analytics/publicEvents.ts) and the admin card that compares the arms (lib/analytics/holdoutReport.ts).
 * OFF until legal sign-off (lawyer question 5: is a holdout arm "profiling"?): set NEXT_PUBLIC_PUBLIC_HOLDOUT_READING=1 on top
 * of the two public flags. Counts only; no new personal data either way.
 */
export function holdoutReadingEnabled(): boolean {
  return publicWorldEnabled() && process.env.NEXT_PUBLIC_PUBLIC_HOLDOUT_READING === '1';
}
