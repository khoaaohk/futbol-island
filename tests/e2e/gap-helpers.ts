import { expect, type Page, type TestInfo } from '@playwright/test';
import { openIsland, isTouch, type Issues } from './helpers';

/*
 * Helpers for the coverage-gap specs (gap-*.spec.ts, Sep 30 2026 overnight audit). They build on helpers.ts:
 *  - storage is seeded ONCE per tab (a sessionStorage flag), so a reload keeps what the game saved instead of re-seeding;
 *  - `bootAt` spawns the player at a world point (the island's own return-position record + `?from=konbini`, the same path the
 *    Konbini and the arcade use when you walk back out), on foot by default;
 *  - small readers for the coins bar, the fuel counter and the saved stores.
 * Audio: run these with the muted wrapper config (storageState + --mute-audio); the seeds below also keep sound off.
 */

export const MUTED: Record<string, string> = {
  'fi2-audio-mix': '4-50-v1', 'fi2-sound-muted': 'true', 'fi2-sound-volume': '0',
  'fi2-music-enabled': 'false', 'fi2-music-volume': '0', 'fi2-voice-enabled': 'false',
};

/** The game's local play day (lib/town/dailyPlay.ts localPlayDay), for `offsetDays` from today. */
export function playDay(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const fuelSave = (fuel: number, day = playDay()) => JSON.stringify({ version: 1, fuel, day });
export const marketSave = (basket: Record<string, number>, extra: Record<string, unknown> = {}) =>
  JSON.stringify({ version: 1, day: playDay(), basket, soldToday: 0, sales: 0, lifetime: 0, ...extra });
/** An arcade wallet holding `coins` (granted runs; the island's 40 welcome coins come on top on a first boot). */
export function walletSave(coins: number) {
  const runs: Record<string, unknown> = {};
  for (let i = 0; i * 20 < coins; i++) runs[`gap-test-grant-${i}`] = { game: 'island', paid: Math.min(20, coins - i * 20), reason: 'test grant', at: 1 };
  return JSON.stringify({ version: 1, runs, spends: {}, packs: [], best: {}, attempts: {}, visits: {} });
}

/** Seed localStorage once per tab (reloads keep the game's own saves). */
export async function seedOnce(page: Page, storage: Record<string, string>, session: Record<string, string> = {}) {
  await page.addInitScript(({ storage, session }) => {
    if (sessionStorage.getItem('gap-seeded')) return;
    sessionStorage.setItem('gap-seeded', '1');
    for (const [k, v] of Object.entries(storage)) localStorage.setItem(k, v);
    for (const [k, v] of Object.entries(session)) sessionStorage.setItem(k, v);
  }, { storage: { ...MUTED, ...storage }, session });
}

/**
 * Boot the island with the player at (x, z). `ride` 'walk' stands on the ground; 'jetpack' hovers `flightHeight` m up.
 * Storage is seeded once (see seedOnce).
 */
export async function bootAt(page: Page, { x, z, yaw = Math.PI, ride = 'walk', flightHeight = 0, storage = {} as Record<string, string> }:
  { x: number; z: number; yaw?: number; ride?: string; flightHeight?: number; storage?: Record<string, string> }): Promise<Issues> {
  await seedOnce(page, storage, { 'fi2-arcade-departure-v1': JSON.stringify({ version: 1, x, z, yaw, ride, flightHeight }) });
  const issues = await openIsland(page, { query: '?from=konbini' });
  await page.locator('[data-island-return-loading]').waitFor({ state: 'detached', timeout: 60_000 }).catch(() => {});
  return issues;
}

/** Plain boot at the usual spawn, storage seeded once. */
export async function boot(page: Page, storage: Record<string, string> = {}): Promise<Issues> {
  await seedOnce(page, storage);
  return openIsland(page);
}

/** Move the player (the same `location` object Town's frame loop reads) and let a few HUD ticks run. */
export async function teleport(page: Page, x: number, z: number, settle = 700) {
  await page.evaluate(([x, z]) => { const f = (window as any).__fi2; f.location.x = x; f.location.z = z; f.velocity.x = 0; f.velocity.z = 0; }, [x, z]);
  await page.waitForTimeout(settle);
}

export const where = (page: Page) => page.evaluate(() => { const f = (window as any).__fi2; return { x: f.location.x as number, z: f.location.z as number, ride: f.rideRef?.current as string }; });

/** Coins on the coins bar. */
export async function hudCoins(page: Page) {
  return Number((await page.locator('[data-job-wallet] > b').first().textContent())?.replace(/\D/g, '') ?? NaN);
}
/** The number on the fuel counter and its level. */
export async function hudFuel(page: Page) {
  const el = page.locator('[data-job-wallet] [data-fuel]');
  return { fuel: Number(await el.getAttribute('data-fuel')), level: await el.getAttribute('data-fuel-level') };
}
export const savedJson = (page: Page, key: string) => page.evaluate(k => JSON.parse(localStorage.getItem(k) ?? 'null'), key);
/** Coin balance straight from the saved wallet (runs paid − spends). */
export const savedCoins = (page: Page) => page.evaluate(() => {
  const w = JSON.parse(localStorage.getItem('fi2-arcade-wallet-v1') ?? 'null'); if (!w) return 0;
  return Object.values(w.runs ?? {}).reduce((n: number, r: any) => n + (r.paid ?? 0), 0) - Object.values(w.spends ?? {}).reduce((n: number, s: any) => n + (s.cost ?? 0), 0);
});

/** Tap on touch projects, click elsewhere, no scrolling dance (HUD buttons are fixed). */
export async function hit(page: Page, selector: string, info: TestInfo) {
  const loc = page.locator(selector).first();
  if (isTouch(info)) await loc.tap({ timeout: 20_000 }); else await loc.click({ timeout: 20_000 });
}

/** Hold an arrow key to move (keyboard works on every project; phones also have the joystick). */
export async function holdKey(page: Page, key: string, ms: number) {
  await page.keyboard.down(key); await page.waitForTimeout(ms); await page.keyboard.up(key);
}

/** Dismiss card offers / first-run notes that would cover the HUD (they are tested elsewhere). */
export async function clearOffers(page: Page) {
  for (let i = 0; i < 3; i++) {
    const offer = page.getByRole('button', { name: 'Open this card' });
    if (!(await offer.count())) return;
    await offer.first().click(); await page.waitForTimeout(3500);
    const done = page.getByRole('button', { name: 'Done', exact: true }); if (await done.count()) await done.last().click();
    await page.waitForTimeout(1500);
  }
}

export async function expectToast(page: Page, re: RegExp, timeout = 15_000) {
  await expect(page.locator('[data-hud-slot="toast"]').filter({ hasText: re }).first()).toBeVisible({ timeout });
}
