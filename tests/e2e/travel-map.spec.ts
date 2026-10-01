import { test, expect } from '@playwright/test';
import { openIsland, expectNoErrors, pointer, isTouch, isChromium, press } from './helpers';
import { JOBS } from '../../lib/town/jobs/jobCatalog';

/** Silent island (the map tests never need audio). */
const MUTED = { 'fi2-audio-mix': '4-50-v1', 'fi2-sound-muted': 'true', 'fi2-music-enabled': 'false', 'fi2-voice-enabled': 'false' };

test('travel map keeps its position when a drag is interrupted and accepts the next drag', async ({ page }, info) => {
  const issues = await openIsland(page, { storage: MUTED });
  await page.keyboard.press('m');
  const map = page.getByRole('region', { name: /^Island map\./ });
  await expect(map).toBeVisible();
  const stage = map.locator(':scope > div');
  await page.waitForTimeout(400);
  const box = (await map.boundingBox())!;
  const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const p = await pointer(page, info);
  // Phones: a finger never drags the map (Sep 30 2026). Real touches only exist on Chromium; WebKit phones drive the mouse.
  test.skip(p.kind === 'touch', 'finger drag is off on phones (see the no-finger-drag test)');
  await p.down(start.x, start.y);
  await p.move(start.x + 30, start.y + 30);
  await expect(stage).toHaveAttribute('data-dragging', 'true');
  const before = await stage.evaluate(el => el.style.transform);
  // A second contact must not replace the pointer already moving the map.
  await map.dispatchEvent('pointerdown', { pointerId: 99, pointerType: 'touch', isPrimary: false, clientX: start.x, clientY: start.y });
  // OS/browser cancellation need not carry the final pointer coordinates.
  await map.evaluate(el => {
    let id = 1;
    for (let candidate = 0; candidate < 32; candidate++) if (el.hasPointerCapture(candidate)) id = candidate;
    el.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: id }));
  });
  await expect(stage).not.toHaveAttribute('data-dragging', 'true');
  await expect.poll(() => stage.evaluate(el => el.style.transform)).toBe(before);
  await p.up();
  await p.down(start.x, start.y);
  await p.move(start.x - 30, start.y - 30);
  await expect(stage).toHaveAttribute('data-dragging', 'true');
  const beforeCaptureLoss = await stage.evaluate(el => el.style.transform);
  await map.evaluate(el => {
    for (let id = 0; id < 32; id++) if (el.hasPointerCapture(id)) el.releasePointerCapture(id);
  });
  // The browser delivers lostpointercapture before the next pointer event.
  await p.up();
  await expect(stage).not.toHaveAttribute('data-dragging', 'true');
  await expect.poll(() => stage.evaluate(el => el.style.transform)).toBe(beforeCaptureLoss);
  await expect(page.getByRole('heading', { name: 'Pick your patch' })).toBeVisible();
  await p.dispose();
  await page.keyboard.press('Escape');
  await expect(map).not.toBeVisible();
  expectNoErrors(issues, info);
});

test('phones: a finger drag does not move the map; the arrows still pan', async ({ page }, info) => {
  test.skip(!(isTouch(info) && isChromium(info)), 'real touch input needs a Chromium touch project');
  const issues = await openIsland(page, { storage: MUTED });
  await page.keyboard.press('m');
  const map = page.getByRole('region', { name: /^Island map\./ });
  await expect(map).toBeVisible();
  const stage = map.locator(':scope > div');
  await page.waitForTimeout(400);
  const box = (await map.boundingBox())!;
  const before = await stage.evaluate(el => el.style.transform);
  const p = await pointer(page, info);
  await p.down(box.x + box.width / 2, box.y + box.height / 2);
  for (let i = 1; i <= 8; i++) await p.move(box.x + box.width / 2 - i * 14, box.y + box.height / 2 - i * 10);
  await p.up();
  await p.dispose();
  await page.waitForTimeout(300);
  await expect(stage).not.toHaveAttribute('data-dragging', 'true');
  expect(await stage.evaluate(el => el.style.transform)).toBe(before);
  await expect(map).toBeVisible();
  const arrow = page.locator('button[data-dir]:not([hidden]):not([disabled])').first();
  await press(arrow, info);
  await expect.poll(() => stage.evaluate(el => el.style.transform)).not.toBe(before);
  expectNoErrors(issues, info);
});

test('map key: V / F / J explain themselves; one J per job; no flight-area text; Beach Soccer title', async ({ page }, info) => {
  const issues = await openIsland(page, { storage: MUTED });
  await page.keyboard.press('m');
  const map = page.getByRole('region', { name: /^Island map\./ });
  await expect(map).toBeVisible();
  const dialog = page.locator('dialog[open]');
  // One J per job board, and the marks are drawings, not buttons.
  await expect(dialog.locator('[data-job-marker]')).toHaveCount(JOBS.length);
  for (const job of JOBS) await expect(dialog.locator(`[data-job-marker="${job.id}"]`)).toHaveCount(1);
  expect(await dialog.locator('[data-job-marker],[data-vending-marker],[data-fishing-marker]').evaluateAll(gs =>
    gs.filter(g => g.getAttribute('role') || g.hasAttribute('tabindex') || getComputedStyle(g).pointerEvents !== 'none').length)).toBe(0);
  // The key: V, F, J and You only.
  const legend = dialog.locator('[data-map-legend]');
  await expect(legend.locator('li')).toHaveText(['VVending', 'FFishing', 'JJobs', 'You']);
  await expect(legend).not.toContainText('Rosa');
  await expect(legend).not.toContainText('Places');
  expect(await legend.locator('li').evaluateAll(li => new Set(li.map(l => Math.round(l.getBoundingClientRect().top))).size)).toBeLessThanOrEqual(2);
  await expect(dialog.getByText(/flight area/i)).toHaveCount(0);
  await expect(dialog.locator('[data-coral-cay="court"] text')).toHaveText('BEACH SOCCER');
  // Tooltip per kind, above its key entry and on screen; one at a time.
  const tips: [string, string][] = [['vending', 'Vending machines: spend coins on books, packs and gear'], ['fishing', 'Fishing spots: catch fish to sell at Rosa’s market'], ['job', 'Jobs: help out to earn coins']];
  const vw = page.viewportSize()!.width;
  for (const [kind, text] of tips) {
    const button = legend.locator(`[data-legend-tip="${kind}"]`);
    await press(button, info);
    const tip = page.locator('#map-tip');
    await expect(tip).toHaveCount(1);
    await expect(tip).toHaveText(text);
    await expect(tip).toHaveAttribute('role', 'tooltip');
    await page.waitForTimeout(250);
    const t = (await tip.boundingBox())!, b = (await button.locator('svg').boundingBox())!;
    expect(t.y + t.height, `${kind} tooltip sits above its mark`).toBeLessThanOrEqual(b.y + 1);
    expect(t.x).toBeGreaterThanOrEqual(0);
    expect(t.x + t.width).toBeLessThanOrEqual(vw);
    const hit = (await button.evaluate(el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el, '::before'); return { h: r.height - parseFloat(s.top) - parseFloat(s.bottom) }; }));
    expect(hit.h, `${kind} key tap target ≥ 44 px tall`).toBeGreaterThanOrEqual(44);
  }
  // Tap elsewhere closes it; Escape closes it without closing the map.
  await press(page.getByRole('heading', { name: 'Pick your patch' }), info);
  await expect(page.locator('#map-tip')).toHaveCount(0);
  await legend.locator('[data-legend-tip="job"]').focus();
  await expect(page.locator('#map-tip')).toHaveText('Jobs: help out to earn coins');
  await page.keyboard.press('Escape');
  await expect(page.locator('#map-tip')).toHaveCount(0);
  await expect(map).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(map).not.toBeVisible();
  expectNoErrors(issues, info);
});
