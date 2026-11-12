/**
 * The public island's holdout arm (phase 1, docs/multiplayer-public-island-plan-2026-11-11.md: "a 10% holdout arm is wired but its
 * reading waits for legal sign-off"). About 1 in 10 devices start in "Just me" instead of "With other players". The arm changes
 * ONLY the default mode: any player can still switch with one tap, and the grown-up lock still wins.
 *
 * The arm comes from a random seed made once on this device and kept in the device key `fi2-holdout-v1` (16 random bytes as hex;
 * lib/saves/snapshot.ts DEVICE_KEYS: never synced). The seed never leaves the device: it is not the analytics install id (that one
 * is sent, as `pi`, for player counts), and multiplayer code never imports analytics or saves (tests/mp-isolation.cjs). The only
 * thing that leaves is a total per arm (mp:pub_arm_on / mp:pub_arm_hold, lib/analytics/publicEvents.ts, counted by the caller).
 * Clearing site data makes a new seed (and so a new draw), like every other device key.
 */
export const HOLDOUT_KEY = 'fi2-holdout-v1';
/** Share of devices in the holdout, in tenths of a percent (100 = 10%). */
export const HOLDOUT_PER_MILLE = 100;
export type HoldoutArm = 'on' | 'hold';
const SEED_RE = /^[0-9a-f]{32}$/;

/** FNV-1a over a fixed label + the seed: the same seed always gives the same arm; seeds spread evenly over 0..999. */
export function holdoutArmFor(seed: string): HoldoutArm {
  let h = 0x811c9dc5;
  const s = 'futbol-island public holdout v1|' + seed;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  h = Math.imul((h ^ (h >>> 16)) >>> 0, 0x45d9f3b) >>> 0; h = (h ^ (h >>> 16)) >>> 0;
  return h % 1000 < HOLDOUT_PER_MILLE ? 'hold' : 'on';
}

type Store = Pick<Storage, 'getItem' | 'setItem'>;
function defaultStore(): Store | null {
  try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch { return null; }
}
function randomHex(): string {
  const b = new Uint8Array(16);
  try { crypto.getRandomValues(b); } catch { return ''; }
  return Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
}

let memo: HoldoutArm | null = null;
/** Phase 2: the seed was already on this device when this tab started (a returning device), or made by this tab (its first visit
 *  since public play). Read for the holdout reading's "returning visits per arm" total only; never sent as such. */
let seedWasStored = false;
export const holdoutReturning = (): boolean => seedWasStored;
/**
 * This device's arm. Reads (or makes, once) the seed. Without storage or randomness the device is in 'on' (today's default)
 * and nothing is written. Memoised for the tab.
 */
export function holdoutArm(store: Store | null = defaultStore(), random: () => string = randomHex): HoldoutArm {
  if (memo) return memo;
  if (!store) return 'on';
  let seed = '';
  try { seed = store.getItem(HOLDOUT_KEY) || ''; } catch { return 'on'; }
  seedWasStored = SEED_RE.test(seed);
  if (!seedWasStored) {
    seed = random();
    if (!SEED_RE.test(seed)) return 'on';
    try { store.setItem(HOLDOUT_KEY, seed); } catch { return 'on'; }
  }
  return (memo = holdoutArmFor(seed));
}

/** The mode a player starts in when nothing else decides (no stored choice, no party, lock = all). */
export const holdoutDefaultMode = (arm: HoldoutArm = holdoutArm()): 'public' | 'solo' => (arm === 'hold' ? 'solo' : 'public');

/** Tests: forget the memo. */
export function resetHoldout(): void { memo = null; seedWasStored = false; }
