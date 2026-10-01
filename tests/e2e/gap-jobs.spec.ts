import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { expectNoErrors, isTouch } from './helpers';
import { bootAt, teleport, hudCoins, savedJson, hit, clearOffers } from './gap-helpers';
import { jobById } from '../../lib/town/jobs/jobCatalog';

/* Island jobs end to end (docs/island-jobs.md): sign → Start job → the job's own buttons → payday card → coins on the bar;
   leaving the job area stops the shift with no pay; free garden picking fills the basket. The rules are covered by
   tests/island-jobs.cjs; the HUD, the button cluster and the wallet bridge had no browser test. */

type Btn = { slot: string; key: string; id: string; enabled: boolean; hold?: boolean };
const view = (page: Page) => page.evaluate(() => (window as any).__fi2Jobs?.getView());

/** Press one of the running job's buttons: its key on desktop, a tap on touch. */
async function pressJobButton(page: Page, info: TestInfo, b: Btn) {
  const sel = `.travel-actions [data-job-action="${b.id}"]`;
  if (isTouch(info) && await page.locator(sel).first().isVisible()) { await page.locator(sel).first().tap(); return; }
  await page.keyboard.press(b.key === 'Space' ? 'Space' : b.key.toLowerCase());
}

/**
 * Work the running job like a player: stand on the next goal, wait for a button to arm, press it. Returns the step log.
 * Jobs with hold buttons are not driven here.
 */
async function workJob(page: Page, info: TestInfo, maxSteps = 40) {
  const log: string[] = [];
  for (let step = 0; step < maxSteps; step++) {
    if (await page.locator('[data-job-done]').count()) return log;
    const goal = await page.evaluate(() => (window as any).__fi2Jobs.goals()[0] ?? null);
    if (goal) await teleport(page, goal.x, goal.z, 500);
    let armed: Btn | undefined;
    for (let i = 0; i < 20 && !armed; i++) {
      const v = await view(page);
      armed = (v?.active?.buttons as Btn[] | null)?.find(b => b.enabled && !b.hold);
      if (!armed) { if (await page.locator('[data-job-done]').count()) return log; await page.waitForTimeout(150); }
    }
    if (!armed && !(await view(page))?.active) {
      // Finished: the "Finish an island job" card offer opens first and holds the payday card back until it closes.
      log.push(`${step}:finished`); await page.waitForTimeout(800); await clearOffers(page); return log;
    }
    if (!armed) { log.push(`step ${step}: no armed button at ${JSON.stringify(goal)} (${JSON.stringify((await view(page))?.active)})`); break; }
    log.push(`${step}:${armed.id}`);
    await pressJobButton(page, info, armed);
    await page.waitForTimeout(450);
  }
  return log;
}

async function startJob(page: Page, info: TestInfo, id: string) {
  const offer = page.locator(`[data-job-offer="${id}"]`);
  await expect(offer, `the ${id} sign offers the job`).toBeVisible({ timeout: 20_000 });
  await hit(page, `[data-job-offer="${id}"]`, info);
  const intro = page.locator(`[data-job-intro="${id}"]`);
  await expect(intro).toBeVisible();
  await expect(intro).toContainText(/Pays \d+ coins/);
  await intro.getByRole('button', { name: 'Start job' }).click();
  await expect(page.locator(`[data-job-active="${id}"]`)).toBeVisible({ timeout: 10_000 });
}

test('cone set-up: sign → start → place every cone → payday card pays the coins bar once', async ({ page }, info) => {
  const def = jobById('cone-setup')!;
  const issues = await bootAt(page, { x: def.board.x, z: def.board.z + 2.2, ride: 'walk' });
  const before = await hudCoins(page);
  await startJob(page, info, 'cone-setup');
  // Rides wait while a job runs.
  await expect(page.locator('[data-job-onfoot]')).toBeVisible();
  const log = await workJob(page, info);
  const done = page.locator('[data-job-done="cone-setup"]');
  await expect(done, `job finished (steps: ${log.join(' ')})`).toBeVisible({ timeout: 15_000 });
  await expect(done.locator('b').first()).toHaveText(/^\+\d+$/, { timeout: 10_000 });
  const paid = Number((await done.locator('b').first().textContent())!.slice(1));
  expect(paid).toBeGreaterThan(0);
  // The first finished job also ticks the Explore checklist ("Finish an island job", +5 learning coins).
  await expect.poll(async () => [0, 5].includes(await hudCoins(page) - before - paid), { timeout: 20_000 }).toBe(true);
  const extra = await hudCoins(page) - before - paid;
  await expect(done).toContainText(/Football lesson/);
  await done.getByRole('button', { name: 'Nice!' }).click();
  await expect(done).toBeHidden();
  // The ledger remembers the shift (pay tiers and personal best).
  const ledger = await savedJson(page, 'fi2-island-jobs-v1');
  expect(JSON.stringify(ledger)).toContain('cone-setup');
  // Nothing pays twice: no second credit after a short wait.
  await page.waitForTimeout(1500);
  expect(await hudCoins(page)).toBe(before + paid + extra);
  expectNoErrors(issues, info);
});

test('leaving the job area stops the shift with no pay', async ({ page }, info) => {
  const def = jobById('cone-setup')!;
  const issues = await bootAt(page, { x: def.board.x, z: def.board.z + 2.2, ride: 'walk' });
  const before = await hudCoins(page);
  await startJob(page, info, 'cone-setup');
  await teleport(page, 103, -8, 1500);
  await expect(page.locator('[data-job-active]')).toHaveCount(0, { timeout: 10_000 });
  await expect(page.locator('[data-job-done]')).toHaveCount(0);
  expect(await hudCoins(page)).toBe(before);
  // The ride button is back.
  await expect(page.locator('[data-job-onfoot]')).toHaveCount(0);
  expectNoErrors(issues, info);
});

test('garden shift: pick ripe produce, tip the basket in the crate, get paid plus the gardener\'s share', async ({ page }, info) => {
  const def = jobById('garden-shift')!;
  const issues = await bootAt(page, { x: def.board.x, z: def.board.z + 2.2, ride: 'walk' });
  const before = await hudCoins(page);
  await startJob(page, info, 'garden-shift');
  const log = await workJob(page, info, 60);
  const done = page.locator('[data-job-done="garden-shift"]');
  await expect(done, `garden shift finished (steps: ${log.join(' ')})`).toBeVisible({ timeout: 15_000 });
  await expect(done.locator('b').first()).toHaveText(/^\+\d+$/, { timeout: 10_000 });
  const paid = Number((await done.locator('b').first().textContent())!.slice(1));
  await expect.poll(async () => [0, 5].includes(await hudCoins(page) - before - paid), { timeout: 20_000 }).toBe(true);
  await expect(done.locator('[data-job-share]')).toContainText(/now in your basket/);
  expectNoErrors(issues, info);
});

test('free garden picking: walking up to ripe produce puts it in the basket with a note', async ({ page }, info) => {
  const issues = await bootAt(page, { x: 208, z: -12, ride: 'walk' });
  const spot = await page.evaluate(() => { const g = (window as any).__fi2Jobs.garden; return g.find((s: any) => !/tree/i.test(s.id)) ?? g[0]; });
  const wallet = page.locator('[data-job-wallet]');
  await expect(wallet).toHaveAttribute('aria-label', /0 fruit and vegetables/);
  await teleport(page, spot.x, spot.z, 2000);
  await expect(wallet).toHaveAttribute('aria-label', /[1-9]\d* fruit and vegetables/, { timeout: 10_000 });
  await expect(page.locator('[data-island-toast]')).toContainText(/\+\d+ .* basket \d+\/20/, { timeout: 10_000 });
  const market = await savedJson(page, 'fi2-market-v1');
  expect(Object.values(market.basket as Record<string, number>).reduce((a, b) => a + b, 0)).toBeGreaterThan(0);
  expectNoErrors(issues, info);
});
