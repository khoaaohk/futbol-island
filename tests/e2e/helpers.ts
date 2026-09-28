import { expect, type Locator, type Page, type TestInfo } from '@playwright/test';

/* Shared helpers for the device suite (docs/testing-devices.md). */

type Box = { x: number; y: number; width: number; height: number };
export type Issues = { errors: string[]; known: string[] };

/**
 * Console errors that are real but already reported, so every test does not fail on them. Each entry needs a reason;
 * delete it once fixed. Unknown errors still fail the test.
 */
export const KNOWN_CONSOLE: { pattern: RegExp; reason: string }[] = [
  // The IslandOverview hydration mismatch and the CardOffer `inert` warning were fixed on 2026-09-25.
  { pattern: /ResizeObserver loop completed with undelivered notifications/, reason: 'benign browser layout notice (no user impact)' },
];

/** Stops dev-server HMR from reloading the page mid-test while other agents edit files. */
async function freezeHmr(page: Page) {
  await page.routeWebSocket(/webpack-hmr|_next\/.*hmr/, () => { /* accept and stay silent */ });
}

/**
 * Opens the island and waits for the HUD. Collects page errors and console errors into the returned object.
 * `query` is appended to the URL (e.g. '?cards=earn'); `storage` seeds localStorage before any app code runs.
 */
export async function openIsland(page: Page, { query = '', storage = {} as Record<string, string> } = {}): Promise<Issues> {
  const issues: Issues = { errors: [], known: [] };
  const add = (text: string) => {
    const known = KNOWN_CONSOLE.find(k => k.pattern.test(text));
    const short = text.replace(/[-\d., ]{80,}/g, '<numbers>').slice(0, 600);
    (known ? issues.known : issues.errors).push(known ? `${short.slice(0, 120)} — ${known.reason}` : short);
  };
  page.on('pageerror', e => add(`pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') add(`console.error: ${m.text()}`); });
  await freezeHmr(page);
  await page.addInitScript(seed => {
    localStorage.setItem('fi2-welcome-v1', 'completed');
    for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, v);
    // Record long-press side effects for the hold tests.
    const w = window as unknown as { __deviceProbe: { contextmenu: number; contextmenuAllowed: number; selections: string[] } };
    w.__deviceProbe = { contextmenu: 0, contextmenuAllowed: 0, selections: [] };
    window.addEventListener('contextmenu', e => {
      w.__deviceProbe.contextmenu++;
      // Checked after every handler ran.
      setTimeout(() => { if (!e.defaultPrevented) w.__deviceProbe.contextmenuAllowed++; }, 0);
    }, true);
    document.addEventListener('selectionchange', () => {
      const s = document.getSelection()?.toString() ?? '';
      if (s.trim()) w.__deviceProbe.selections.push(s.slice(0, 80));
    });
  }, storage);
  // The shared dev server recompiles while other work edits files; a boot can hit a transient ChunkLoadError or stall.
  // Retry the boot (not the test) up to 3 times, and only keep errors from the successful boot.
  for (let attempt = 1; ; attempt++) {
    issues.errors.length = 0; issues.known.length = 0;
    try {
      await page.goto(`/${query}`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => {
        if (document.body?.innerText.includes('ChunkLoadError')) throw new Error('ChunkLoadError (dev server recompiling)');
        return (window as unknown as { __fi2?: { games?: { entries?: unknown[] } } }).__fi2?.games?.entries?.length;
      }, null, { timeout: 120_000, polling: 500 });
      await page.locator('.travel-actions').waitFor({ state: 'visible', timeout: 120_000 });
      break;
    } catch (error) {
      if (attempt >= 3) throw error;
      await page.waitForTimeout(3000);
    }
  }
  // Let the arrival animation and the HUD settle.
  await page.waitForTimeout(1200);
  return issues;
}

/** Fails on unknown errors; known ones become annotations on the test report. */
export function expectNoErrors(issues: Issues, info: TestInfo) {
  for (const k of [...new Set(issues.known)]) info.annotations.push({ type: 'known issue', description: k });
  expect(issues.errors, 'console/page errors').toEqual([]);
}

export const isTouch = (info: TestInfo) => !!info.project.use.hasTouch;
export const isChromium = (info: TestInfo) => (info.project.use.defaultBrowserType ?? 'chromium') === 'chromium';

/** Tap on touch projects, click elsewhere. */
export async function press(loc: Locator, info: TestInfo) {
  await loc.scrollIntoViewIfNeeded().catch(() => {});
  if (isTouch(info)) await loc.tap({ timeout: 30_000 }); else await loc.click({ timeout: 30_000 });
}

/**
 * A pointer that can be held and dragged. Chromium touch projects use real CDP touches (pointerType "touch");
 * WebKit has no touch-move API in Playwright, so it (and desktop) use the mouse, which still drives the same pointer
 * handlers (pointerdown/move/up, setPointerCapture).
 */
export async function pointer(page: Page, info: TestInfo) {
  if (isTouch(info) && isChromium(info)) {
    const cdp = await page.context().newCDPSession(page);
    let last = { x: 0, y: 0 };
    return {
      kind: 'touch' as const,
      down: async (x: number, y: number) => { last = { x, y }; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }); },
      move: async (x: number, y: number) => { last = { x, y }; await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y, id: 1 }] }); },
      up: async () => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); void last; },
      dispose: async () => { await cdp.detach().catch(() => {}); },
    };
  }
  return {
    kind: 'mouse' as const,
    down: async (x: number, y: number) => { await page.mouse.move(x, y); await page.mouse.down(); },
    move: async (x: number, y: number) => { await page.mouse.move(x, y, { steps: 2 }); },
    up: async () => { await page.mouse.up(); },
    dispose: async () => {},
  };
}

/** Drags from a to b in `steps` moves. */
export async function drag(page: Page, info: TestInfo, a: { x: number; y: number }, b: { x: number; y: number }, steps = 12, holdMs = 0) {
  const p = await pointer(page, info);
  await p.down(a.x, a.y);
  if (holdMs) await page.waitForTimeout(holdMs);
  for (let i = 1; i <= steps; i++) { await p.move(a.x + (b.x - a.x) * i / steps, a.y + (b.y - a.y) * i / steps); await page.waitForTimeout(16); }
  await p.up();
  await p.dispose();
}

export const center = (b: Box) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });

/** The page never scrolls sideways. */
export async function expectNoHorizontalScroll(page: Page, where: string) {
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth, iw: innerWidth, sx: scrollX }));
  expect(m.sw, `${where}: document scrollWidth ${m.sw} > innerWidth ${m.iw}`).toBeLessThanOrEqual(m.iw);
  expect(m.bw, `${where}: body scrollWidth ${m.bw} > innerWidth ${m.iw}`).toBeLessThanOrEqual(m.iw);
  expect(m.sx, `${where}: page is scrolled sideways`).toBe(0);
}

/** Bottom edge of the open dialog and its first panel against innerHeight. */
export async function openDialogBottom(page: Page) {
  return page.evaluate(() => {
    const d = document.querySelector('dialog[open]');
    if (!d) return null;
    const panel = d.querySelector(':scope > section') ?? d;
    return { dialog: d.getBoundingClientRect().bottom, panel: panel.getBoundingClientRect().bottom, top: d.getBoundingClientRect().top, inner: innerHeight };
  });
}

/**
 * Simulates iPhone Safari's stale dynamic viewport unit: after the toolbar collapses, 100dvh can stay at the smaller
 * toolbar-expanded height. Rewrites every dvh/vh/svh length in the page's stylesheets to a fixed px value based on
 * (innerHeight - `toolbar`). Layout that depends on dvh for its height then stops short of the bottom, as on a phone.
 */
export async function simulateStaleDvh(page: Page, toolbar = 80) {
  return page.evaluate(toolbarPx => {
    const unit = (innerHeight - toolbarPx) / 100;
    let changed = 0;
    const fix = (v: string) => v.replace(/(-?\d*\.?\d+)(dvh|svh|lvh|vh)\b/g, (_, n) => `${(parseFloat(n) * unit).toFixed(2)}px`);
    const walk = (rules: CSSRuleList) => {
      for (const r of Array.from(rules)) {
        if (r instanceof CSSStyleRule) {
          for (const prop of Array.from(r.style)) {
            const v = r.style.getPropertyValue(prop);
            if (/\d(dvh|svh|lvh|vh)\b/.test(v)) { r.style.setProperty(prop, fix(v), r.style.getPropertyPriority(prop)); changed++; }
          }
        }
        if ('cssRules' in r && (r as CSSGroupingRule).cssRules) walk((r as CSSGroupingRule).cssRules);
      }
    };
    for (const sheet of Array.from(document.styleSheets)) { try { walk(sheet.cssRules); } catch { /* cross-origin */ } }
    return changed;
  }, toolbar);
}

/** With a stale 100dvh simulated, the open dialog still starts at the top and reaches innerHeight (±1px). Phones/tablets only. */
export async function expectDialogSurvivesStaleDvh(page: Page, label: string) {
  await simulateStaleDvh(page, 80);
  await page.waitForTimeout(250);
  const b = await openDialogBottom(page);
  expect(b, `${label}: a dialog is open`).not.toBeNull();
  expect(Math.abs(b!.top), `${label} (stale dvh): dialog top`).toBeLessThanOrEqual(1);
  expect(Math.abs(b!.dialog - b!.inner), `${label} (stale dvh): dialog bottom ${b!.dialog} vs innerHeight ${b!.inner}`).toBeLessThanOrEqual(1);
}

/** Axis-aligned overlap area of two boxes. */
export const overlap = (a: Box, b: Box) => Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));

/**
 * Captures a screenshot as a test artifact. With FI_VISUAL=1 it is also compared against the baseline in
 * tests/e2e/__screenshots__ (create baselines with --update-snapshots once the bean characters land).
 */
export async function capture(page: Page, info: TestInfo, name: string, mask: Locator[] = []) {
  const body = await page.screenshot({ animations: 'disabled', mask });
  await info.attach(`${name}.png`, { body, contentType: 'image/png' });
  if (process.env.FI_VISUAL === '1') await expect(page).toHaveScreenshot(`${name}.png`, { mask: [page.locator('canvas'), ...mask] });
}

/** Closes any open dialogs with Escape (up to n presses). */
export async function closeDialogs(page: Page, n = 4) {
  for (let i = 0; i < n && await page.locator('dialog[open]').count(); i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(350); }
}
