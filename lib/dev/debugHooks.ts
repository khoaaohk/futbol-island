/**
 * Play-test hooks that MOVE the player (Nov 8 2026 security pass). components/Town.tsx publishes `window.__fi2` for the
 * headless checks (tests/e2e, scripts/check-*-browser.cjs). Most of it is read-only probing, but `__fi2.teleport`, the live
 * `location` / `velocity` objects, `rooftop` (its reset places the player) and `emoteTest.location/velocity` let a console
 * user put the player anywhere, which then goes out to friends over the multiplayer relay. Those members are left off on a
 * production host; everywhere else (localhost, 127.0.0.1, a LAN IP for phone checks, a production build under `next start`)
 * they stay, so every existing test and QA script keeps working. The game's own moves (Summit kick spot, Ball Cannon seat,
 * ride arrivals) call their teleport ports directly inside Town.tsx and never go through __fi2.
 * Pure (no window access) so tests/debug-hooks.cjs can check it.
 */
export const PRODUCTION_HOSTS:readonly string[]=['futbolisland.app','www.futbolisland.app'];
/** True on the live site and on Vercel deployments (preview or production): the move hooks are left off there. */
export function isProductionHost(hostname:string):boolean{
 const h=hostname.toLowerCase().replace(/\.$/,'');
 return PRODUCTION_HOSTS.includes(h)||h.endsWith('.vercel.app');
}
/** Whether `window.__fi2` may carry the player-moving helpers on this host. */
export function debugMoveHooksAllowed(hostname:string):boolean{
 return !isProductionHost(hostname);
}
