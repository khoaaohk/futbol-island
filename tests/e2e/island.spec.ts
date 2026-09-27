import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import { capture, center, expectNoErrors, expectNoHorizontalScroll, isTouch, openIsland, overlap, pointer, press, type Issues } from './helpers';

/* The island HUD on each device. One booted island is shared by the tests in this file (booting is the slow part). */

let context: BrowserContext, page: Page, issues: Issues;
test.beforeAll(async ({ browser }, info) => {
  const { baseURL, viewport, userAgent, deviceScaleFactor, isMobile, hasTouch } = info.project.use;
  context = await browser.newContext({ baseURL, viewport, userAgent, deviceScaleFactor, isMobile, hasTouch });
  page = await context.newPage();
  issues = await openIsland(page);
});
test.afterAll(async () => { await context?.close(); });

/** Visible HUD controls that must never overlap each other or the joystick. */
const HUD = [
  ['Paths', '[aria-label="Paths"]'], ['Settings', '[aria-label="Settings"]'],
  ['travel mode', '.travel-mode'], ['map toggle', '.minimap-toggle'], ['shoot', '.touch-shoot'], ['juggle', '.touch-juggle'],
  ['joystick', '.joystick'], ['minimap', '.minimap-content'], ['field card', '.field-learn-card:not([hidden])'],
] as const;

test('boots to the island with no console or page errors', async ({}, info) => {
  await expect(page.locator('.town-scene canvas')).toBeVisible();
  await capture(page, info, 'island-hud');
  expectNoErrors(issues, info);
});

test('HUD controls are visible, inside the viewport and not overlapping', async ({}, info) => {
  const boxes = await page.evaluate(sel => sel.map(([name, s]) => {
    const el = document.querySelector(s);
    if (!el) return { name, box: null };
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    const visible = r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05;
    return { name, box: visible ? { x: r.x, y: r.y, width: r.width, height: r.height } : null };
  }), HUD as unknown as [string, string][]);
  const vp = page.viewportSize()!;
  const shown = boxes.filter(b => b.box) as { name: string; box: { x: number; y: number; width: number; height: number } }[];
  const names = shown.map(b => b.name);
  if (isTouch(info)) for (const need of ['joystick', 'shoot', 'travel mode', 'Paths']) expect(names, `${need} is visible on a touch device`).toContain(need);
  else expect(names).toContain('Paths');
  for (const { name, box } of shown) {
    expect(box.x, `${name} left edge inside viewport`).toBeGreaterThanOrEqual(-1);
    expect(box.y, `${name} top edge inside viewport`).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width, `${name} right edge inside viewport`).toBeLessThanOrEqual(vp.width + 1);
    expect(box.y + box.height, `${name} bottom edge inside viewport`).toBeLessThanOrEqual(vp.height + 1);
  }
  const clashes: string[] = [];
  for (let i = 0; i < shown.length; i++) for (let j = i + 1; j < shown.length; j++) {
    const a = shown[i], b = shown[j], area = overlap(a.box, b.box);
    if (area > 4) clashes.push(`${a.name} ∩ ${b.name} = ${Math.round(area)}px²`);
  }
  expect(clashes, 'overlapping HUD controls').toEqual([]);
});

test('press-and-hold Shoot for 1 s charges and fires with no context menu or text selection', async ({}, info) => {
  const travel = page.locator('.travel-mode');
  test.skip(!(await page.locator('.touch-shoot').isVisible()), 'touch action buttons are hidden on this layout');
  // Walk mode: Shoot becomes a charged shot (jetpack is the default ride).
  // Leaving the jetpack lands first (pendingRide), then the label switches to Walk.
  if (!/walk/i.test((await travel.getAttribute('aria-label')) ?? '')) await press(travel, info);
  await expect(travel).toHaveAttribute('aria-label', /walk/i, { timeout: 45_000 });
  await page.waitForTimeout(600);
  const shoot = page.locator('.touch-shoot');
  // The iOS callout/selection guards are in effect on the control itself.
  const guard = await shoot.evaluate(el => {
    const cs = getComputedStyle(el) as CSSStyleDeclaration & { webkitTouchCallout?: string; webkitUserSelect?: string };
    return { callout: cs.webkitTouchCallout ?? cs.getPropertyValue('-webkit-touch-callout'), select: cs.userSelect || cs.webkitUserSelect, supported: CSS.supports('-webkit-touch-callout', 'none') };
  });
  expect(guard.select).toBe('none');
  if (guard.supported) expect(guard.callout).toBe('none');
  const before = await page.evaluate(() => (window as unknown as { __deviceProbe: { contextmenu: number; contextmenuAllowed: number; selections: string[] } }).__deviceProbe);
  const p = await pointer(page, info), c = center((await shoot.boundingBox())!);
  await p.down(c.x, c.y);
  await page.waitForTimeout(350);
  await expect(shoot, 'Shoot shows the charging state while held').toHaveAttribute('data-charging', 'true');
  await page.waitForTimeout(650);
  await capture(page, info, 'shoot-held');
  await p.up(); await p.dispose();
  await expect(shoot).not.toHaveAttribute('data-charging', 'true');
  // A synthetic long-press menu on the button is cancelled by the app.
  const prevented = await shoot.evaluate(el => { const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); el.dispatchEvent(e); return e.defaultPrevented; });
  expect(prevented, 'contextmenu on Shoot is prevented').toBe(true);
  await page.waitForTimeout(50);
  const after = await page.evaluate(() => (window as unknown as { __deviceProbe: { contextmenu: number; contextmenuAllowed: number; selections: string[] } }).__deviceProbe);
  expect(after.contextmenuAllowed - before.contextmenuAllowed, 'no context menu was allowed to open').toBe(0);
  expect(after.selections.slice(before.selections.length), 'no text got selected').toEqual([]);
  expect(await page.evaluate(() => document.getSelection()?.toString() ?? '')).toBe('');
  expectNoErrors(issues, info);
});

test('long press on the 3D view and joystick opens no menu and selects nothing', async ({}, info) => {
  const probe = () => page.evaluate(() => (window as unknown as { __deviceProbe: { contextmenuAllowed: number; selections: string[] } }).__deviceProbe);
  const before = await probe();
  for (const sel of ['.town-scene canvas', '.joystick']) {
    const el = page.locator(sel);
    if (!(await el.isVisible())) continue;
    const g = await el.evaluate(n => { const cs = getComputedStyle(n) as CSSStyleDeclaration & { webkitTouchCallout?: string }; return { select: cs.userSelect || cs.getPropertyValue('-webkit-user-select'), callout: cs.webkitTouchCallout ?? '', supported: CSS.supports('-webkit-touch-callout', 'none') }; });
    expect(g.select, `${sel} user-select`).toBe('none');
    if (g.supported) expect(g.callout, `${sel} -webkit-touch-callout`).toBe('none');
    const b = (await el.boundingBox())!, p = await pointer(page, info);
    // Upper part of the view, clear of the HUD.
    const at = sel === '.joystick' ? center(b) : { x: b.x + b.width / 2, y: b.y + b.height * 0.3 };
    await p.down(at.x, at.y); await page.waitForTimeout(900); await p.up(); await p.dispose();
  }
  const after = await probe();
  expect(after.contextmenuAllowed - before.contextmenuAllowed).toBe(0);
  expect(after.selections.slice(before.selections.length)).toEqual([]);
  await expectNoHorizontalScroll(page, 'island after long presses');
});

test('portrait → landscape → portrait keeps the layout inside the viewport', async ({}, info) => {
  const vp = page.viewportSize()!;
  test.skip(!info.project.use.isMobile, 'orientation applies to phones and tablets');
  try {
    for (const size of [{ width: vp.height, height: vp.width }, vp]) {
      await page.setViewportSize(size);
      await page.waitForTimeout(900);
      await expectNoHorizontalScroll(page, `${size.width}×${size.height}`);
      const inner = await page.evaluate(() => [innerWidth, innerHeight]);
      expect(inner).toEqual([size.width, size.height]);
      const out = await page.evaluate(() => [...document.querySelectorAll('.travel-actions button, .joystick, [aria-label=Paths], [aria-label=Settings]')]
        .map(el => ({ el: el.getAttribute('aria-label') ?? el.className, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && (r.right > innerWidth + 1 || r.bottom > innerHeight + 1 || r.left < -1 || r.top < -1))
        .map(({ el, r }) => `${el} @ ${Math.round(r.left)},${Math.round(r.top)}–${Math.round(r.right)},${Math.round(r.bottom)}`));
      expect(out, `controls outside the ${size.width}×${size.height} viewport`).toEqual([]);
      if (size.width > size.height) await capture(page, info, 'island-landscape');
    }
  } finally { await page.setViewportSize(vp); }
  expectNoErrors(issues, info);
});
