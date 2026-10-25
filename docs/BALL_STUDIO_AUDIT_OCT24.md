# Ball studio audit (Oct 24 2026): drawing on the ball

Read-only audit of the Kit Shop ball studio's Draw step, on `integrate-dive-bugs-sealife` @ bbd6123e. Owner report: drawing on the
ball glitches because the ball spins, and a line can't be continued. Files: `components/shop/BallStudio.tsx` (gestures, tools,
undo), `lib/shop/ballPaint.ts` (paint engine), `lib/shop/ballStage.ts` (three.js stage, picking, uploads), `lib/shop/ball.ts`
(storage). Evidence comes from reading the code plus two scratch experiments, run outside the repo: painter timing in Node, and
drawing encode sizes in headless Chrome. I did not run the app.

## What is already right (the painter is not the problem)
- The strokes are painted on the sphere, not on the UV map (`ballPaint.ts:8-13`). Each pick is a ball-space direction
  (`ballStage.ts:207-209`, an analytic ray/sphere hit, not a mesh raycast). Each move is drawn as a slerp-subdivided capsule of
  at most 0.06 rad (`ballPaint.ts:117-120`). Columns wrap with modulo (`:112`), so there is no seam break at u=0/1, no pole
  pinch, and no gap between samples. The canvas is a DataTexture, so there is no devicePixelRatio mismatch.
- Cost is tiny (Node, M-series): a medium brush is 0.047 ms per move, a big ×5 brush 0.079 ms. `begin` is 0.9 ms (a 2 MB
  copy) and `end` 1.2 ms. A phone at 5–8× slower is still under 0.6 ms per move. Uploads cover only the dirty rect
  (`ballStage.ts:139-145`).
- `touch-action:none` is set on the stage (`BallStudio.module.css:18`) and pointer capture is taken on down (`BallStudio.tsx:301`).
  The loop sleeps when idle; the perf guide measures idle / spin / draw at 0 / 44 / 26 fps (`docs/performance-guide.md:281`).

## Root causes
1. **The ball keeps spinning under the finger (main glitch).** The paint branch of `onDown` (`BallStudio.tsx:304-306`)
   never calls `st.grab()`, which is the only thing that zeroes `omega` and the preview (`ballStage.ts:236`). The rotate
   branch does call it (`:309`). So any motion that is still running carries on through the stroke:
   - a flick release (inertia up to 14 rad/s, decaying `e^-2.6t`, about 1.7 s; `ballStage.ts:153,243`);
   - the 2.4 s opening spin (`BallStudio.tsx:214`);
   - the spin after a preset, Surprise me or loading a slot (`:372,373,380`);
   - the kick.

   With the finger held still, no pointermove fires, so no ink is laid. On the next move, `to()` draws a chord from the
   stale ball-space point to the new one. Measured: the opening spin smears 0.6–1.3 brush widths per event; a flick at the
   cap smears 2.7–5.5 widths (0.22–0.46 rad). A kid who touches the ball to *stop* it gets a long streak around the ball instead.
2. **A second finger or a palm deletes the stroke.** `painter.cancel()` (`BallStudio.tsx:311`, `ballPaint.ts:158`) restores
   the pre-stroke pixels, so the line the kid was drawing vanishes.
3. **Lifting one of two fingers wrecks the view.** `onUp` stays in `pinch` mode when one finger is left (`:330`). With one
   point, `pdist()` returns 1 and `pmid()` returns {0,0} (`:297-298`). So the next move calls `zoomBy(1/d0)`, which snaps to
   the 0.72 minimum zoom, and `drag(-mx,-my)`, which flips the ball by about 1.5–3 rad (`:317-319`). After that the remaining
   finger does nothing until every finger is up. This feels like "the line won't continue".
4. **A stroke can't go round the ball.** Off the silhouette `pick()` returns null and the pen lifts (`:322-323`). Near the
   rim, a small finger move maps to a big ball-space angle (grazing). To keep going, a kid has to lift, turn the ball (Spin
   toggle, two fingers, an off-ball drag, or right-drag on desktop; none of these can be seen) and start a new stroke that
   doesn't join the old one.
5. **Ink lags 33–66 ms on phones.** The two throttles stack: the 30 ms upload throttle plus its setTimeout
   (`ballStage.ts:140,144-145`) on top of the 33 ms frame-cap slot (`:150`). Only the raw event is used; there are no
   `getCoalescedEvents()`, so a 120 Hz screen or a stylus loses samples, and fast curves turn into polylines.
6. **Brushes are tiny for a finger.** `BRUSH_SIZES=[.02,.042,.08]` rad (`ballPaint.ts:28`). On-screen diameter is
   `r·R·2` (`BallStudio.tsx:403`). On a phone ball of R≈130 px that is about 5 / 11 / 21 px, against a 40 px fingertip,
   and the cursor ring is mouse-only (`:315`).
7. **Drawings are lost or blurred when saved, worst on iPhone.** `encodeDrawing` (`ballPaint.ts:191-202`) must fit in
   `DRAW_MAX_CHARS=16000` (`ball.ts:24`). Safari can't encode WebP, so it falls back to posterised PNG. Measured with
   synthetic kid drawings (random-walk strokes, 8 colours):

   | drawing | Chrome result | Safari-path result |
   |---|---|---|
   | 8 medium strokes | 512×256 | 256×128 |
   | 25 medium strokes | 256×128 | 192×96 |
   | 40+ strokes | 192×96 | null: "too busy to save", the drawing is not saved |

   The live painter is 1024×512, so the kid only finds out on reopening.
8. **Undo goes out of sync after 40 strokes.** The studio keeps 60 Draw steps (`BallStudio.tsx:249`) but the painter keeps
   only `HISTORY_STEPS=40` / 24 MB (`ballPaint.ts:33`). Old steps become silent no-op undos, and their redos replay the wrong
   patches.
9. **The bought ball is never seen in play.** `wearing.ball` is written by My kit (`ShopRoom.tsx`), but nothing outside
   `components/shop` reads it, so the island ball never shows the design.

## Proposed control model (one rule a 6-year-old can learn)
- **Finger on the ball = paint, and the ball freezes at once.** Finger off the ball = turn the ball. Two fingers = turn and
  zoom. Two always-visible 52 px turn arrows (◀ ▶) and a ▲▼ pair at the stage edges turn the ball 30° with an ease.
  Desktop: drag on the ball paints; drag off it, right-drag, arrow keys or the arrows turn it.
- **No auto-spin in the Draw step.** Spin only in the show-off view, on design steps, or when idle for 8 s outside Draw.
- **Strokes continue round the ball.** While painting with the finger in the outer 15% of the radius (or past the rim, up to
  1.3R), the ball turns *toward the finger* at up to 1.4 rad/s, and ink keeps flowing each frame. Past the rim the pick is
  clamped to the rim instead of lifting the pen. That gives a controlled "draw while it turns" without the random spin.
- **Retire the Paint / Spin toggle** once the arrows exist. If it stays, rename it to Paint / Turn.

## P0: fix the broken strokes (one Sonnet agent, about 5 h, then a separate verify agent)
| # | Fix | Files / exact change | Impact | Effort | Risk |
|---|---|---|---|---|---|
| P0.1 | Freeze on touch | `BallStudio.tsx:304-306`: call `st.grab()` before `G.mode='tap'` and `'paint'`. In `onUp` for paint and tap (`:332-334`) call `st.release(0,0)`. In `goto('draw')` (`:263`) call `grab()`+`release(0,0)` to kill any spin. In the Draw step skip `st.preview()` (`:372,373,380`; pass a `noSpin` flag) | Fixes the streaks completely | 0.5 h | Low; `held` also stops the rAF chain, and uploads still render through `invalidate()` |
| P0.2 | A palm keeps the line | `:311`: if the stroke is older than 150 ms or has `G.moved`, call `p.end()` + `drawPush({px:true})` + `scheduleEncode()` instead of `cancel()`. Only cancel a stroke under 150 ms old (a deliberate two-finger start) | No vanished lines | 0.5 h | Low |
| P0.3 | Pinch-lift fix | `:330`: when 1 point is left, set `G.mode='rotate'`, seed `G.lx/ly/lt` from the remaining point, `st.grab()`, `G.vx=G.vy=0`. Also guard `onMove` pinch with `if(G.pts.size<2)return` (`:317`) | No zoom snap or flip; the remaining finger turns the ball | 0.5 h | Low |
| P0.4 | Edge auto-turn + rim clamp | Stage: `pickClamped(x,y)` (nearest rim point when the ray misses, up to 1.3R) and `turnToward(dir,rate)` with an `onFrame` hook. Studio: each frame while painting with the finger at r>0.85R, call `turnToward` (max 1.4 rad/s, ease-in over 200 ms) then `p.to(pickClamped(last))`. Reduced motion: rim clamp only | Lines go all the way round | 2.5 h | Medium: tune the speed with kids. Runs at the 30 fps cap only while held at the edge |
| P0.5 | Save the drawing at full res | New format `data:application/x-fi-draw;base64,` + `[n, palette n×RGB, deflate-raw(index + 2-bit alpha)]` at 512×256, via `CompressionStream('deflate-raw')` (Safari ≥16.4). Fall back to today's ladder. Extend `DRAW_URL`/`isDrawUrl` and `decodeDrawing`. Custom `<input type=color>` colours go in the palette (≤ 63). Measured: 8 strokes 3.9k, 25 strokes 9.3k, 60 strokes 16.2k, 120 big 15.4k chars, against PNG failing at 40+ | No lost iPhone drawings, sharp on reopen | 3 h | Medium: a storage format change; keep old URLs decodable and extend `tests/shop-ball.cjs` round-trips |

Together these fix the owner's report. P0.1–P0.3 are about 20 lines and can ship first on their own.

## P1: better drawing (about 6 h)
| # | Change | Files / values | Impact | Effort | Risk |
|---|---|---|---|---|---|
| P1.1 | Turn arrows (control model) | `BallStudio.tsx` stage overlay: 52 px round buttons calling an eased `st.step()` (30°, 220 ms); keyboard arrows already step | Kids find "turn" without being told | 1.5 h | Low |
| P1.2 | Bigger touch brushes | Coarse pointers: `BRUSH_SIZES` `[.035,.065,.11]`, stamps unchanged. Show a 1 s ghost ring at touch-down so the kid sees the size | Lines that read on a phone | 0.5 h | Low (bigger dirty rects, still under 1 ms) |
| P1.3 | Lower ink lag + smoother curves | `onMove` paint branch: loop `e.nativeEvent.getCoalescedEvents?.()`. `ballStage.ts:140`: on coarse, skip the 30 ms upload throttle and upload in the next capped frame (the cap already limits it to 30/s) | Lag of about 33 ms instead of up to 66 ms; round fast curves | 1 h | Low; same upload count |
| P1.4 | Undo sync | Make the studio cap the same as the painter (`BallStudio.tsx:249` → `HISTORY_STEPS`), and drop the oldest `px` DrawStep when `painter.steps` shrinks | Undo always does something | 0.5 h | Low |
| P1.5 | One-time Draw intro | 3 looping 1.5 s panels (finger paints · drag outside / arrows turn · ×5 magic) the first time, stored in localStorage, 44 px "Got it". Re-show the turn hint after 2 strokes that end at the rim | Self-taught controls | 1.5 h | Low |
| P1.6 | Cursor follows zoom | Compute `brushPx` on zoom and resize, not only on React render (`:403`) | The ring matches the ink | 0.3 h | Low |

## P2: polish and features (about 10 h)
- **Pencil and stylus pressure:** for `pointerType==='pen'` only, size = base·(0.6+0.8·pressure) (`strokeOpts`). 0.5 h, low risk.
- **Optional stabiliser:** an EMA in screen space, α=0.45, for kids' wobble. It only cuts jitter under 6 px and can be turned
  off ("Steady hand" chip). 1 h. Risk: it feels laggy, so test it first.
- **Raster flood fill inside a drawn shape** (today Fill only colours panels): a BFS over the equirect with the wrap, bounded
  to 1024×512. 2 h, medium risk.
- **More stamps:** football, boot, crown, number 10. Make the stamp size follow the brush size control (it already does).
  1 h, low risk.
- **Play with my ball:** read `owned.wearing.ball` in the island ball material, with a lazy texture from the pool and the
  same shader chart. This turns the kick preview into the real thing and teaches that panel count changes flight (the
  station line). 4 h+, medium risk (heat: one 512×256 texture, no loop).
- **Save feedback:** after the debounced encode, flash a small check mark on the save icon. If an encode ever returns null,
  keep the pixels in `artMem` and offer "Make it simpler" rather than losing them. 1 h.

## Keep as is
- The sphere-space painter (capsules, slerp splitting, seam and pole safety), the per-stroke dirty-rect undo with its memory
  cap, and the marker's no-darkening coverage.
- The dirty-rect uploads, no mipmaps, the 30 fps cap on touch, the loop that sleeps when idle and while hidden, and dispose.
- Clear stays one tap: it can be undone and shows the toast "Cleared! Press undo to bring it back" (`:252-253`), so it needs
  no confirm dialog (that would be one more modal for a 6-year-old).
- Mirror and ×5 symmetry, stamps upright on screen, the panel fill, the 44 px+ targets (tools 62 px, stamps 52 px,
  swatches ≥ 44 px), aria labels on every tool and colour, reduced-motion stepping, and `touch-action:none`.

## Verification plan (for the build agent's separate verifier)
- Node: extend `tests/shop-ball.cjs` with
  - the P0.5 encode/decode round-trip (fake CompressionStream via zlib);
  - undo alignment after 45 strokes;
  - rim clamp: `pickClamped` past the edge returns a rim direction.
- Playwright (own port, `PW_CHANNEL=chrome`, phone 390×844 touch via CDP `Input.dispatchTouchEvent`):
  - flick the ball, then touch-draw at once: the ink stays under the finger (add a debug `spinning()` getter on `__fiBallStage`; it must read false);
  - two fingers down, lift one, keep moving: zoom unchanged;
  - draw past the rim and hold for 1 s: the stroke grows round the ball.
- One phone and one desktop screenshot.
