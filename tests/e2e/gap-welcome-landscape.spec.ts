import { test, expect, type Locator, type Page } from '@playwright/test';
import { expectNoErrors, overlap } from './helpers';
import { bootAt, playDay, hit } from './gap-helpers';
import { jobById } from '../../lib/town/jobs/jobCatalog';

/* The welcome-back card ("guide" tier of the HUD stack, docs/ui/HUD_STACK.md) on a landscape phone (844×390). Before the Sep 30
   fix it sat centred over the player and, with a job running, over the docked job panel and its Stop job button. Now a running
   job owns the stack (the card waits until the shift ends) and, in landscape, the card docks compactly at the top-left edge.
   Oct 1 2026: the card is a note with no buttons; a tap hides it, and it hides on its own after 6 s on screen (the dwell
   restarts when it comes back after a job). */

test.use({ viewport: { width: 844, height: 390 } });

const box = async (loc: Locator) => (await loc.count()) && (await loc.first().isVisible()) ? loc.first().boundingBox() : null;
/** The player stands at the screen centre; a centre band (±40 px) must stay clear. */
async function clearOfCentre(page: Page, loc: Locator, label: string) {
  const b = await box(loc); expect(b, `${label} is on screen`).not.toBeNull();
  const vp = page.viewportSize()!;
  const centre = { x: vp.width / 2 - 40, y: vp.height / 2 - 40, width: 80, height: 80 };
  expect(overlap(b!, centre), `${label} ${JSON.stringify(b)} covers the screen centre`).toBe(0);
  return b!;
}

test('landscape phone: the welcome-back card never covers the screen centre or the running job panel', async ({ page }, info) => {
  await page.addInitScript(() => { (window as unknown as { __fi2WelcomeMs: number }).__fi2WelcomeMs = 60_000; }); // hold the card while the test interacts (dev-only hook)
  const def = jobById('cone-setup')!;
  const issues = await bootAt(page, { x: def.board.x, z: def.board.z + 2.2, ride: 'walk', storage: { 'fi2-last-visit-day-v1': playDay(-1) } });
  const card = page.locator('[data-welcome-back]');
  await expect(card, 'welcome-back card on a new day').toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(500);
  const docked = await clearOfCentre(page, card, 'welcome-back card');
  // Docked compactly under the Paths button, above the stick. No buttons inside (Oct 1 2026): the card itself is the tap target.
  expect(docked.x, 'docked at the left edge').toBeLessThan(40);
  expect(docked.y + docked.height, 'clear of the joystick').toBeLessThanOrEqual(page.viewportSize()!.height - 140);
  await expect(card.locator('button'), 'no buttons on the card').toHaveCount(0);
  await expect(card).not.toContainText(/My football|Later/);
  // The job sign's offer (focus slot, centred) does not collide with it.
  const offer = page.locator(`[data-job-offer="${def.id}"]`);
  await expect(offer).toBeVisible({ timeout: 20_000 });
  expect(overlap(docked, (await box(offer))!), 'welcome card vs job offer').toBe(0);

  // Start the job: the task owns the column, so the guide card waits and Stop job is free to tap.
  await hit(page, `[data-job-offer="${def.id}"]`, info);
  await page.locator(`[data-job-intro="${def.id}"]`).getByRole('button', { name: 'Start job' }).click();
  const panel = page.locator(`[data-job-active="${def.id}"]`);
  await expect(panel).toBeVisible({ timeout: 10_000 });
  await expect(card, 'the guide card waits while a job runs').toBeHidden();
  await clearOfCentre(page, panel, 'job panel');
  const stop = panel.getByRole('button', { name: 'Stop job' });
  const stopBox = (await box(stop))!;
  const topAtStop = await page.evaluate(({ x, y }) => (document.elementFromPoint(x, y) as HTMLElement | null)?.closest('button')?.getAttribute('aria-label') ?? (document.elementFromPoint(x, y) as HTMLElement | null)?.closest('button')?.textContent?.trim() ?? null, { x: stopBox.x + stopBox.width / 2, y: stopBox.y + stopBox.height / 2 });
  expect(topAtStop, 'nothing covers Stop job (the faded chip\'s × is labelled Stop job)').toMatch(/Stop job/);

  // Stopping the job brings the card back, still docked clear of the centre.
  await stop.click();
  await expect(panel).toBeHidden();
  await expect(card, 'the card returns after the job').toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(400);
  await clearOfCentre(page, card, 'welcome-back card after the job');
  // A tap hides it.
  await card.click();
  await expect(card).toBeHidden();
  expectNoErrors(issues, info);
});

test('the welcome-back card hides on its own after about 6 s', async ({ page }, info) => {
  // Measured in the page (Oct 1 2026): the test's own clock starts after the boot helper's waits, so it under-counted the dwell.
  await page.addInitScript(() => { const w = window as unknown as { __wb: { shown?: number; hidden?: number } }; w.__wb = {};
    const mo = new MutationObserver(() => { const on = !!document.querySelector('[data-welcome-back]'); if (on && w.__wb.shown === undefined) w.__wb.shown = performance.now(); if (!on && w.__wb.shown !== undefined && w.__wb.hidden === undefined) w.__wb.hidden = performance.now(); });
    mo.observe(document, { childList: true, subtree: true }); });
  const issues = await bootAt(page, { x: 103, z: -8, ride: 'walk', storage: { 'fi2-last-visit-day-v1': playDay(-1) } });
  const card = page.locator('[data-welcome-back]');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __wb: { shown?: number } }).__wb.shown !== undefined), { timeout: 20_000, message: 'welcome-back card on a new day' }).toBe(true);
  await expect(card).toBeHidden({ timeout: 12_000 });
  const dwell = await page.evaluate(() => { const w = (window as unknown as { __wb: { shown: number; hidden: number } }).__wb; return Math.round(w.hidden - w.shown); });
  expect(dwell, `dwell ${dwell} ms`).toBeGreaterThan(5000);
  expect(dwell).toBeLessThan(9000);
  expectNoErrors(issues, info);
});
