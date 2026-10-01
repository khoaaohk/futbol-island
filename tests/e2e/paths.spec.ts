import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { capture, closeDialogs, expectNoErrors, expectNoHorizontalScroll, isTouch, openDialogBottom, openIsland, press, simulateStaleDvh } from './helpers';
import formatPaths from '../../lib/paths/formatPaths.json';

/* Paths (the full-screen journey dialog) and what opens from it: bottle, ball-hunt lesson card, a play's quiz. */

async function openPaths(page: Page, info: TestInfo, name: string | RegExp = 'Paths') {
  const btn = page.getByRole('button', { name, exact: typeof name === 'string' });
  await expect(btn).toBeVisible();
  // No click fallback: a retry at the button's spot would land on the bottle logo of the dialog that just opened.
  await press(btn, info);
  await expect(page.locator('dialog[open]')).toBeVisible();
  await page.waitForTimeout(700);
  await expect(page.locator('[data-bottle-overlay]'), 'opening Paths does not also open the bottle').toHaveCount(0);
}

async function expectReachesBottom(page: Page, label: string) {
  const b = await openDialogBottom(page);
  expect(b, `${label}: a dialog is open`).not.toBeNull();
  expect(Math.abs(b!.top), `${label}: dialog starts at the top`).toBeLessThanOrEqual(1);
  expect(Math.abs(b!.dialog - b!.inner), `${label}: dialog bottom ${b!.dialog} vs innerHeight ${b!.inner}`).toBeLessThanOrEqual(1);
  expect(Math.abs(b!.panel - b!.inner), `${label}: panel bottom ${b!.panel} vs innerHeight ${b!.inner}`).toBeLessThanOrEqual(1);
}

test('Paths fills the viewport to the bottom, also after the toolbar collapses and expands', async ({ page }, info) => {
  const issues = await openIsland(page);
  await openPaths(page, info);
  await expectReachesBottom(page, 'Paths');
  await capture(page, info, 'paths');
  await expectNoHorizontalScroll(page, 'Paths');
  const vp = page.viewportSize()!;
  if (info.project.use.isMobile) {
    // Safari's toolbar: taller viewport when it collapses on scroll, shorter when it comes back.
    for (const h of [vp.height + 80, vp.height, vp.height + 40, vp.height - 60, vp.height]) {
      await page.setViewportSize({ width: vp.width, height: h });
      await page.waitForTimeout(400);
      await expectReachesBottom(page, `Paths at height ${h}`);
    }
  }
  expectNoErrors(issues, info);
});

test('Paths still reaches the bottom when 100dvh is stale (iPhone toolbar collapse)', async ({ page }, info) => {
  test.skip(!info.project.use.isMobile, 'the stale-dvh case is a phone/tablet Safari behaviour');
  await openIsland(page);
  await openPaths(page, info);
  const changed = await simulateStaleDvh(page, 80);
  expect(changed).toBeGreaterThan(0);
  await page.waitForTimeout(300);
  await capture(page, info, 'paths-stale-dvh');
  await expectReachesBottom(page, 'Paths with 100dvh = innerHeight - 80px');
});

test('message in a bottle opens and closes', async ({ page }, info) => {
  const issues = await openIsland(page);
  await openPaths(page, info);
  const open = page.getByRole('button', { name: /message in a bottle/i }).first();
  await expect(open).toBeVisible();
  await press(open, info);
  const overlay = page.locator('[data-bottle-overlay]');
  await expect(overlay).toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(1500);
  await capture(page, info, 'bottle-open');
  await expectNoHorizontalScroll(page, 'bottle');
  const close = overlay.getByRole('button', { name: /close|done|back|put .* back/i }).first();
  if (await close.count()) await press(close, info); else await page.keyboard.press('Escape');
  await expect(overlay).toBeHidden({ timeout: 20_000 });
  await expect(page.locator('dialog[open]'), 'Paths is still open behind the bottle').toBeVisible();
  expectNoErrors(issues, info);
});

test('ball-hunt lesson card steps through to Got it', async ({ page }, info) => {
  // One found ball so "Watch tip again" is offered.
  const issues = await openIsland(page, { storage: { 'fi2-matchday-coins-v1': JSON.stringify({ version: 4, collected: ['store'], revealed: ['store'] }) } });
  await openPaths(page, info);
  await press(page.getByRole('button', { name: /Ball hunt/ }).first(), info);
  const replay = page.getByRole('button', { name: 'Watch tip again' });
  await expect(replay).toBeVisible();
  await press(replay, info);
  const primary = page.locator('dialog[open] [data-lesson-primary]');
  await expect(primary).toBeVisible();
  const labels: string[] = [];
  for (let i = 0; i < 12 && (await primary.getAttribute('data-lesson-primary')) !== 'done'; i++) {
    labels.push((await primary.innerText()).trim());
    await press(primary, info);
    await page.waitForTimeout(700);
  }
  await expect(primary).toHaveAttribute('data-lesson-primary', 'done');
  await expect(primary).toHaveText(/Got it/);
  await capture(page, info, 'ball-hunt-got-it');
  await expectNoHorizontalScroll(page, 'ball-hunt lesson');
  // The last step is visible above the button: nothing important is pushed off-screen.
  const b = (await primary.boundingBox())!;
  expect(b.y + b.height, 'Got it is inside the viewport').toBeLessThanOrEqual(page.viewportSize()!.height + 1);
  // Oct 1 2026 (user): Got it overflowed past the right edge. Its right inset now matches the arrow's left inset.
  const arrow = (await page.locator('dialog[open] [data-lesson-previous]').boundingBox())!, vw = page.viewportSize()!.width;
  expect(b.x + b.width, 'Got it stays inside the screen').toBeLessThanOrEqual(vw);
  expect(Math.abs((vw - (b.x + b.width)) - arrow.x), 'right padding equals the arrow\'s left padding').toBeLessThanOrEqual(3);
  await press(primary, info);
  await expect(page.locator('dialog[open] [data-lesson-primary]')).toHaveCount(0, { timeout: 15_000 });
  info.annotations.push({ type: 'steps', description: labels.join(' → ') });
  expectNoErrors(issues, info);
});

test('a play: step through, then answer the quiz', async ({ page }, info) => {
  // The play runs a live 3D pitch; stepping through ~20 beats is slow under parallel load.
  test.setTimeout(480_000);
  const issues = await openIsland(page);
  await openPaths(page, info);
  await press(page.getByRole('button', { name: /^1\. / }).first(), info);
  const next = page.getByRole('button', { name: 'Next step' });
  await expect(next).toBeVisible({ timeout: 60_000 });
  const quiz = page.getByRole('button', { name: 'Quiz yourself' });
  for (let i = 0; i < 40 && !(await quiz.isVisible()); i++) {
    // A DOM click (no wait for a painted frame): the busy WebGL pitch can starve headless Chromium's frame production.
    if (await next.isEnabled()) await next.dispatchEvent('click');
    await page.waitForTimeout(400);
  }
  await expect(quiz).toBeVisible();
  await quiz.dispatchEvent('click');
  await expect(page.getByText(/Question 1 \/ \d/i)).toBeVisible({ timeout: 20_000 });
  // Quiz answers are tapped on the 3D pitch. Find the screen points the app's own picker accepts (the same
  // games.pickQuiz + viewport maths as Town's chooseFieldTarget), then tap there with real input.
  const targets = () => page.evaluate(() => {
    type V = { x: number; y: number; z: number; w: number };
    const d = (window as unknown as { __fi2: { fieldSession: { current: { quiz?: unknown; answer: unknown } | null }; renderer: { domElement: HTMLCanvasElement; getViewport(v: unknown): V }; games: { pickQuiz(p: { x: number; y: number }, c: unknown): number | undefined }; camera: unknown } }).__fi2;
    const s = d.fieldSession.current;
    if (!s?.quiz || s.answer !== null) return null;
    const r = d.renderer.domElement.getBoundingClientRect();
    const v = { x: 0, y: 0, z: 0, w: 0, copy(o: V) { Object.assign(this, { x: o.x, y: o.y, z: o.z, w: o.w }); return this; }, multiplyScalar(k: number) { this.x *= k; this.y *= k; this.z *= k; this.w *= k; return this; }, floor() { return this; } };
    const view = d.renderer.getViewport(v), top = r.height - view.y - view.w;
    // Per answer: grid points the picker accepts, split into tappable (the canvas is the top element there, so a real
    // tap reaches Town's pointerup handler) and covered (by the quiz card, HUD or buttons).
    const hits: Record<string, { pts: { x: number; y: number }[]; covered: number; cx: number; cy: number; n: number }> = {};
    for (let gx = 0; gx < 40; gx++) for (let gy = 0; gy < 60; gy++) {
      const cx = r.left + (gx + .5) / 40 * r.width, cy = r.top + (gy + .5) / 60 * r.height;
      const a = d.games.pickQuiz({ x: (cx - r.left - view.x) / view.z * 2 - 1, y: 1 - (cy - r.top - top) / view.w * 2 }, d.camera);
      if (a === undefined) continue;
      const h = hits[a] ??= { pts: [], covered: 0, cx: 0, cy: 0, n: 0 };
      h.cx += cx; h.cy += cy; h.n++;
      if (document.elementFromPoint(cx, cy) === d.renderer.domElement) h.pts.push({ x: cx, y: cy }); else h.covered++;
    }
    return Object.entries(hits).map(([answer, h]) => {
      const mx = h.cx / h.n, my = h.cy / h.n;
      const best = h.pts.sort((p, q) => Math.hypot(p.x - mx, p.y - my) - Math.hypot(q.x - mx, q.y - my))[0] ?? null;
      return { answer: Number(answer), x: best?.x ?? mx, y: best?.y ?? my, tappable: !!best, covered: h.covered, total: h.n };
    });
  });
  const tapAt = async (x: number, y: number) => { if (isTouch(info)) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); };
  const log: string[] = [];
  let answered = 0, tried = new Set<number>();
  const covered = new Set<string>();
  let fallbacks = 0;
  const finish = page.getByRole('button', { name: 'Back to Paths' });
  for (let round = 0; round < 20; round++) {
    const next = page.getByRole('button', { name: 'Next question' }), again = page.getByRole('button', { name: 'Try again' });
    if (await finish.isVisible()) break;
    if (await next.isVisible()) { await next.dispatchEvent('click'); tried = new Set(); await page.waitForTimeout(900); continue; }
    if (await again.isVisible()) { await again.dispatchEvent('click'); await page.waitForTimeout(900); continue; }
    const qLabel = (await page.getByText(/Question \d+ \/ \d/i).first().innerText().catch(() => '?')).trim();
    let how = 'tap';
    const section = page.locator('section[aria-label="Pitch quiz"]');
    const checkOrder = page.getByRole('button', { name: 'Check order' });
    if (await checkOrder.isVisible().catch(() => false)) {
      // Order question (QA11 gap audit): submit the steps as dealt; right or "try again", either way the feedback shows.
      // The dealt order is never the answer, so the first check shows "try again"; then solve it through the session.
      if (!tried.has(-1)) { how = 'check order'; tried.add(-1); await press(checkOrder, info); }
      else {
        how = 'order → session.onAnswer(correct)';
        await page.evaluate(() => { type S = { question: number; lesson: { questions: { correct: number }[] }; onAnswer?: (a: number) => void }; const s = (window as unknown as { __fi2: { fieldSession: { current: S | null } } }).__fi2.fieldSession.current; s?.onAnswer?.(s.lesson.questions[s.question].correct); });
      }
    } else if (await section.evaluate(el => el.hasAttribute('data-visual')).catch(() => false)) {
      // Visual question: the choices are drawn in the card itself.
      how = 'card choice';
      const choices = section.getByRole('button').filter({ hasNotText: /read along|hide transcript/i }).and(section.locator(':not([aria-label^="Change camera"])'));
      const n = await choices.count();
      expect(n, `${qLabel}: the visual question offers choices`).toBeGreaterThan(0);
      let idx = 0; while (idx < n - 1 && tried.has(100 + idx)) idx++;
      tried.add(100 + idx);
      await press(choices.nth(idx), info);
    } else {
      // Route markers appear once the quiz camera settles and the (sleeping) loop has drawn them: wake and poll.
      const wake = () => page.evaluate(() => window.dispatchEvent(new Event('resize')));
      await wake();
      let t = await targets();
      for (let w = 0; w < 16 && t && t.length < 2; w++) { await wake(); await page.waitForTimeout(500); t = await targets(); }
      if (answered === 0 && t && t.length) await capture(page, info, 'quiz-question');
      for (const x of t ?? []) if (!x.tappable) covered.add(`${qLabel}: route ${x.answer} is entirely under the quiz card/HUD (${x.covered}/${x.total} pick points covered)`);
      const open = (t ?? []).filter(x => x.tappable);
      const pick = open.find(x => !tried.has(x.answer)) ?? open[0];
      if (pick) {
        tried.add(pick.answer);
        for (let attempt = 0; attempt < 3 && !(await next.or(again).or(finish).isVisible()); attempt++) {
          await tapAt(pick.x, pick.y);
          await next.or(again).or(finish).waitFor({ timeout: 2_500 }).catch(() => {});
        }
      }
      if (!(await next.or(again).or(finish).isVisible())) {
        // No live pick target (emulation timing): answer through the session so the rest of the quiz UI still runs.
        how = pick ? 'tap missed → session.onAnswer' : 'no live pick targets → session.onAnswer';
        const answer = pick?.answer ?? [0, 1].find(x => !tried.has(x)) ?? 0;
        tried.add(answer);
        await page.evaluate(ans => (window as unknown as { __fi2: { fieldSession: { current: { onAnswer?: (a: number) => void } | null } } }).__fi2.fieldSession.current?.onAnswer?.(ans), answer);
      }
    }
    await expect(next.or(again).or(finish), `feedback appears after answering ${qLabel}`).toBeVisible({ timeout: 10_000 });
    if (/session/.test(how)) fallbacks++;
    answered++;
    log.push(`${qLabel} (${how}): ${await again.isVisible() ? 'try again' : 'right'}`);
    if (answered === 1) await capture(page, info, 'quiz-feedback');
  }
  info.annotations.push({ type: 'quiz', description: log.join('; ') });
  // Fixed 2026-09-25: the card passes taps through while it waits for a pitch answer (FieldLearning data-pitch-pick).
  expect([...covered], 'every marked answer route can be tapped (none hidden under the quiz card)').toEqual([]);
  expect(answered, 'answered at least two questions').toBeGreaterThanOrEqual(2);
  await expect(finish, 'the quiz reaches its end ("Back to Paths")').toBeVisible();
  await expect(page.getByText(/Quiz done:/)).toBeVisible();
  const fb = (await finish.boundingBox())!;
  expect(fb.y + fb.height, '"Back to Paths" is inside the viewport').toBeLessThanOrEqual(page.viewportSize()!.height + 1);
  if (fallbacks) info.annotations.push({ type: 'quiz tap fallback', description: `${fallbacks}/${answered} answers used session.onAnswer instead of a pitch tap` });
  await capture(page, info, 'quiz-end');
  await expectNoHorizontalScroll(page, 'quiz');
  await closeDialogs(page);
  expectNoErrors(issues, info);
});

// Regression (user, Sep 26 2026): passing a lesson's quiz must unlock the next stop on the path, straight away and after a
// reload. The child reaches "Quiz yourself" by tapping Next through the play (no watch-through), as most children do.
test('complete a quiz: the next stop unlocks without a reload, and after a reload', async ({ page }, info) => {
  test.setTimeout(480_000);
  const issues = await openIsland(page);
  await openPaths(page, info);
  const stop = (n: number) => page.locator('dialog[open]').getByRole('button', { name: new RegExp(`^${n}\\. `) }).first();
  await expect(stop(2), 'stop 2 starts locked').toBeDisabled();
  await press(stop(1), info);
  const next = page.getByRole('button', { name: 'Next step' });
  await expect(next).toBeVisible({ timeout: 60_000 });
  const quiz = page.getByRole('button', { name: 'Quiz yourself' });
  for (let i = 0; i < 40 && !(await quiz.isVisible()); i++) {
    if (await next.isEnabled()) await next.dispatchEvent('click');
    await page.waitForTimeout(300);
  }
  await quiz.dispatchEvent('click');
  await expect(page.getByText(/Question 1 \/ \d/i)).toBeVisible({ timeout: 20_000 });
  const finish = page.getByRole('button', { name: 'Back to Paths' });
  const nextQ = page.getByRole('button', { name: 'Next question' });
  let answered = 0;
  for (let round = 0; round < 20 && !(await finish.isVisible()); round++) {
    // Answer through the session with the lesson's correct choice (the pitch-tap path is covered by the test above).
    await page.evaluate(() => {
      type S = { quiz: boolean; question: number; answer: number | null; lesson: { questions: { correct: number }[] }; onAnswer?: (a: number) => void };
      const s = (window as unknown as { __fi2: { fieldSession: { current: S | null } } }).__fi2.fieldSession.current;
      if (s?.quiz && s.answer === null) s.onAnswer?.(s.lesson.questions[s.question].correct);
    });
    await expect(nextQ.or(finish)).toBeVisible({ timeout: 10_000 });
    answered++;
    if (await nextQ.isVisible()) { await nextQ.dispatchEvent('click'); await page.waitForTimeout(400); }
  }
  expect(answered, 'answered every question').toBeGreaterThanOrEqual(2);
  await finish.dispatchEvent('click');
  // "Back to Paths" reopens Paths: stop 1 is complete and stop 2 is open, no reload.
  await expect(stop(1)).toHaveAccessibleName(/Completed/, { timeout: 20_000 });
  await expect(stop(2), 'stop 2 unlocks straight after the quiz').toBeEnabled();
  await expect(page.getByText(/1 \/ 12 starter lessons complete/)).toBeVisible();
  await capture(page, info, 'paths-after-quiz');
  // ...and it survives a reload. A clean 5/5 quiz also earns a card pick, which opens over Paths and again after a reload until
  // picked; mark it set aside (as the binder badge keeps it) so the reload lands on the island. Progress was saved per answer.
  await page.evaluate(() => {
    const key = 'fi2-card-offers-v1', s = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (s?.offers) { s.offers = s.offers.map((o: { seen: boolean }) => ({ ...o, seen: true })); localStorage.setItem(key, JSON.stringify(s)); }
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.travel-actions').waitFor({ state: 'visible', timeout: 120_000 });
  await page.waitForTimeout(1200);
  await openPaths(page, info, /^Paths(, \d+ card picks? waiting)?$/);
  await expect(stop(1)).toHaveAccessibleName(/Completed/);
  await expect(stop(2), 'stop 2 stays unlocked after a reload').toBeEnabled();
  await expect(stop(3), 'stop 3 is still locked').toBeDisabled();
  expectNoErrors(issues, info);
});

// Regression: a play opened from Paths used to stall at the end of step 1 after Play (narration never "finished" because
// the voice element was created by that press and never loaded the line), so Play only worked after pressing Next.
test('a play from Paths starts on the first Play press', async ({ page }, info) => {
  test.setTimeout(360_000);
  const issues = await openIsland(page);
  await openPaths(page, info);
  await press(page.getByRole('button', { name: /^1\. / }).first(), info);
  const play = page.getByRole('button', { name: 'Play', exact: true });
  await expect(play).toBeVisible({ timeout: 60_000 });
  const state = () => page.evaluate(() => {
    const s = (window as unknown as { __fi2: { fieldSession: { current: { step: number; playing: boolean; voicePending: boolean } | null } } }).__fi2.fieldSession.current;
    return s ? { step: s.step, playing: s.playing, voicePending: s.voicePending } : null;
  });
  const before = await state();
  await press(play, info);
  await expect(page.getByRole('button', { name: 'Pause', exact: true }), 'one Play press starts the play').toBeVisible({ timeout: 1_500 });
  // ...and keeps playing into the next step (narration on, the default): no forward-arrow press needed first. The root
  // cause was a narration wait that never cleared, so check that directly, then the step change (slow when the pitch's
  // frame loop is starved by parallel browsers, hence the long timeout).
  await expect.poll(async () => (await state())?.voicePending, { timeout: 30_000, message: 'the first step\'s narration finishes' }).toBe(false);
  await expect.poll(async () => (await state())?.step ?? -1, { timeout: 120_000, message: 'playback moves past the first step' }).toBeGreaterThan(before?.step ?? 0);
  expectNoErrors(issues, info);
});

// Regression: a lesson reopened from Paths resumes straight in its quiz. Its question narration must play without an extra
// tap: the tap that opened it from Paths is the user gesture, so the voice element is primed there (primeLessonVoice).
test('a quiz resumed from Paths narrates its question without another tap', async ({ page }, info) => {
  test.setTimeout(240_000);
  // Every path's first stop has question 1 answered, so reopening it resumes at question 2.
  const started = (formatPaths as { format: string; chapters: { lessons: { id: string }[] }[] }[]).map(p => `${p.format}:${p.chapters[0].lessons[0].id}:0`);
  await page.addInitScript(() => {
    const w = window as unknown as { __voicePlays: string[] }, play = HTMLMediaElement.prototype.play;
    w.__voicePlays = [];
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) { const src = this.currentSrc || this.src, p = play.call(this); p.then(() => { if (src.includes('/voice/')) w.__voicePlays.push(src); }, () => {}); return p; };
  });
  const issues = await openIsland(page, { storage: { 'futbol-island-quiz-progress-v1': JSON.stringify(started), 'futbol-island-quiz-growth-v1': '1' } });
  await openPaths(page, info);
  await press(page.getByRole('button', { name: /^1\. / }).first(), info);
  await expect(page.getByText(/Question 2 \/ \d/i), 'the lesson resumes in its quiz').toBeVisible({ timeout: 60_000 });
  await expect.poll(() => page.evaluate(() => (window as unknown as { __voicePlays: string[] }).__voicePlays.length), { timeout: 15_000, message: 'the question narration plays with no extra tap' }).toBeGreaterThan(0);
  expectNoErrors(issues, info);
});
