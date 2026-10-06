import { test, expect, type Page } from '@playwright/test';
import { isTouch } from './helpers';
import { bootAt, where } from './gap-helpers';

/* Walk-in History Museum (Oct 3 2026): the island door prompt → /museum → the free first case (facts) → the next case's
   hands-on exhibit (blow the referee's whistle) → a locked case's "collect" copy → the Your Collection wing (ball pegboard,
   cards) → Back → Done walks out to the island, at the museum door, on foot. Node: tests/museum-room.cjs. Run with --workers=1 (other agents share the machine).
   Screenshots: FI_MUSEUM_SHOTS=<dir> saves the entrance, a zoomed case, the locked case and the exit. */

/** lib/museum/museumDoors.ts MUSEUM_DOOR */
const DOOR = { x: 168 - 30 * 0.26, front: 181 + 4.5 + 0.2 };
/** Ten real ball-hunt spots (lib/town/coinQuest.ts) collected: the penalty case (10 balls) opens, the cards case (25) does not. */
const TEN_BALLS = JSON.stringify({ version: 5, rewardUnlocked: false, revealed: [], hint: null, celebrated: false,
  collected: ['store', 'coaches', 'garden', 'market', 'museum', 'terrace', 'roof', 'ferry', 'beach', 'north'] });
const SHOTS = process.env.FI_MUSEUM_SHOTS;

// (Headless software rendering walks slowly: the walk across the hall into the wing can take ~30 s there.)
const arrived = (page: Page, id: string) => page.waitForFunction(i => { const m = (window as any).__museum; return m?.state.zoom?.id === i && m.state.zoom.arrived && !m.state.zooming; }, id, { timeout: 75_000 });

test('Museum: enter from the island, read the free case, blow the whistle, see a locked case, Done returns to the door', async ({ page }, info) => {
  test.setTimeout(540_000);
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  const shot = async (name: string) => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${info.project.name}-${name}.png` }); };
  const tap = async (sel: string) => { const l = page.locator(sel).first(); if (isTouch(info)) await l.tap(); else await l.click(); };
  await bootAt(page, { x: DOOR.x, z: DOOR.front + 2.4, ride: 'walk', storage: { 'fi2-matchday-coins-v1': TEN_BALLS } });

  const prompt = page.locator('[data-museum-enter]');
  await expect(prompt, 'Enter prompt at the museum door').toBeVisible({ timeout: 20_000 });
  if (isTouch(info)) await prompt.tap({ noWaitAfter: true }); else await prompt.click({ noWaitAfter: true });
  await page.waitForURL(/\/museum$/, { timeout: 120_000 });
  await page.waitForFunction(() => (window as any).__museum, null, { timeout: 90_000 });
  await expect(page.locator('[data-museum-room][data-ready=true]')).toBeVisible();
  expect(await page.evaluate(() => typeof (window as any).__fi2), 'the island is unloaded inside').toBe('undefined');
  // Explore checklist: "Visit the museum" ticks on first entry.
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('fi2-explore-activity-v1') ?? '{}').museum)).toBe(true);
  // The gallery ambience exists (it stays silent here: the audio keys are muted).
  expect(await page.evaluate(() => !!(window as any).__museumAmbience)).toBe(true);
  await page.waitForTimeout(1200);
  await shot('museum-entrance');

  // The free first case is a storytelling exhibit (a meeting-table diorama): walk up, then work it beat by beat. Each action
  // plays one beat (animation + the coach's line in the caption strip); the last is "Take it to your game". No card opens.
  const playStory = async (id: string, choose = 'choose:1') => {
    for (let beat = 0; beat < 8; beat++) {
      const act = page.locator('[data-museum-story-act]').first();
      if (!(await act.count())) break;
      const kind = await act.getAttribute('data-museum-story-act');
      await tap(kind === 'choose:-1' ? `[data-museum-story-act="${choose}"]` : '[data-museum-story-act]');
      await page.waitForFunction(() => !document.querySelector('[data-museum-story][data-playing]'), null, { timeout: 20_000 });
    }
    await expect(page.locator(`[data-museum-story="${id}"][data-done]`)).toBeVisible();
  };
  await page.evaluate(() => (window as any).__museum.walkTo('laws-1863'));
  await arrived(page, 'laws-1863');
  await expect(page.locator('[data-museum-card="laws-1863"]'), 'no card for a story exhibit').toHaveCount(0);
  await tap('[data-museum-story-act]');
  await expect(page.locator('[data-museum-caption]')).toContainText('their own rules');
  await shot('museum-story-beat');
  await page.waitForFunction(() => !document.querySelector('[data-museum-story][data-playing]'), null, { timeout: 20_000 });
  await playStory('laws-1863');
  await expect(page.locator('[data-museum-caption]')).toContainText('Everyone plays by the same Laws');
  // The plaque: the case's facts and sources, a tap away (not a modal).
  await tap('[data-museum-plaque-toggle]');
  await expect(page.locator('[data-museum-plaque="laws-1863"]')).toContainText('Football Association');
  // (External links go through the grown-ups gate, which moves href to data-gated-href.)
  expect(await page.locator('[data-museum-plaque="laws-1863"] a').first().evaluate(a => a.getAttribute('href') || a.getAttribute('data-gated-href'))).toMatch(/wikipedia/);
  await shot('museum-case-open');
  await tap('[data-museum-plaque-toggle]');

  // Next case: the penalty kick (opened by 10 balls): "stand where they stood". Blow the whistle, place the ball, watch the
  // keeper on the line, pick a spot and shoot.
  await tap('[data-museum-next]');
  await arrived(page, 'penalty-1891');
  await tap('[data-museum-story-act]');
  await expect(page.locator('[data-museum-caption]')).toContainText('William McCrum');
  await page.waitForFunction(() => !document.querySelector('[data-museum-story][data-playing]'), null, { timeout: 20_000 });
  await playStory('penalty-1891');
  await shot('museum-interactive');

  // Next: the yellow and red cards case is still covered, and says exactly what to collect.
  await tap('[data-museum-next]');
  await arrived(page, 'cards-1970');
  await expect(page.locator('[data-museum-locked="cards-1970"]')).toContainText('Collect 15 more hidden balls to open this case (10/25).');
  await shot('museum-case-locked');

  // The west wing, "Your Collection": walk through the wide opening to the hidden-ball pegboard (10 of the 100 pegs hold a ball).
  await tap('[data-museum-back]');
  await page.waitForFunction(() => !(window as any).__museum.state.zoom, null, { timeout: 15_000 });
  await page.evaluate(() => (window as any).__museum.walkTo('my-balls'));
  await arrived(page, 'my-balls');
  expect(await page.evaluate(() => (window as any).__museum.state.x), 'standing in the west wing').toBeLessThan(-12);
  await expect(page.locator('[data-museum-card="my-balls"] [data-museum-found="10"]')).toContainText('10 of 100');
  await shot('museum-wing');
  await tap('[data-museum-next]');
  await arrived(page, 'my-cards');
  await expect(page.locator('[data-museum-card="my-cards"]')).toBeVisible();

  // Back out, then Done walks out of the wing, through the hall and the doors to the island, outside the museum door.
  await tap('[data-museum-back]');
  await page.waitForFunction(() => !(window as any).__museum.state.zoom, null, { timeout: 15_000 });
  await tap('header [data-museum-done]');
  await page.waitForURL(u => !/museum/.test(u.pathname), { timeout: 60_000 });
  await page.waitForFunction(() => (window as any).__fi2?.games?.entries?.length, null, { timeout: 120_000 });
  await page.locator('[data-island-return-loading]').waitFor({ state: 'detached', timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await shot('museum-exit');
  const at = await where(page);
  expect(Math.hypot(at.x - DOOR.x, at.z - DOOR.front), `back outside the museum door (at ${at.x.toFixed(1)}, ${at.z.toFixed(1)})`).toBeLessThan(8);
  expect(at.ride).toBe('walk');
  expect(await page.evaluate(() => typeof (window as any).__museumAmbience), 'the ambience is gone with the museum page').toBe('undefined');

  // The Explore checklist shows "Visit the museum" completed.
  await tap('[data-tour="quests"]');
  await tap('button:has(strong:text-is("Explore"))');
  const row = page.locator('[aria-label="Explore checklist"] li', { hasText: 'Visit the museum' });
  await row.scrollIntoViewIfNeeded();
  await expect(row.locator('[data-complete=true]').first()).toBeVisible();
  await expect(page.locator('[aria-label="Explore checklist"]')).toContainText(/\d+ \/ 23 completed/);
  await shot('museum-checklist');
  expect(errors.filter(e => !/ChunkLoadError|Loading chunk/.test(e))).toEqual([]);
});
