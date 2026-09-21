# Riso engine — builder's guide (`lib/paths/riso/`)

Read `RISO_BIBLE.md` first (the contract), then this page, then `lib/paths/riso/stories/chalk-line.ts` (the reference implementation). Those three are all you need. You own exactly one file: `lib/paths/riso/stories/<id>.ts` (plus your storyboard). Do not edit the engine.

## 1. How a story file is built

```ts
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {apertureDisc} from '../passage';
import {twos,sm,easeOut,key,camKeys,anticipate,settle,clamp,lerp,blob,polyPath,type Pt} from '../motion';
import {contour,dust,field,confetti} from '../shapes';

const ch1:Scene={
 draw(s,t,c){                      // s = sheet, t = seconds since the chapter began, c = {cue,cueTime,seconds,reduced,chapter}
  camKeys(s,t,[[0,0,0,1],[2.6,40,-30,1.05],[9,80,-60,1.2]]);   // camera keys [t, x, y, zoom, rot?] — sample with continuous t
  s.field('blue',1,.4);                                        // whole-sheet ink with speckle (press) and mottle
  s.tone('navy',polyPath(blob(0,0,900,900,3),true),.3);        // halftone at a coverage step (0.1 … 0.88)
  const tt=twos(t);                                            // pose drawn objects on twos; keep cameras on t
  const grow=sm(1.94,2.6,t,easeOut);                           // cue action: 0..1 between two times
  contour(s,'navy',blob(0,0,220*grow,220*grow,7),14,{close:true,seed:7,pressure:.6,gaps:[[.5,.56]]});
  s.knockout(polyPath(blob(-60,-70,40,40,9),true));            // paper highlight on every plate
 },
 aperture:t=>apertureDisc(0,0,120,12),                          // the material the camera enters at the seam (convex polygon in this scene's world)
};
export const story:RisoStory={
 id:'my-story',format:'7v7',title:'…',theme:'…',ageNote:'…',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',green:'#00a95c',navy:'#22366b'},order:['yellow','orange','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},          // or {mode:'track',src:'/stories/films/x/narration.m4a',duration:64.73} with chapter.start set
 chapters:[{label:'…',headline:'NEXT',narration:'… verbatim …',seconds:10,audio:'/stories/narration/…/01.m4a',cues:[{at:0,words:'…'},{at:3.2,words:'…'}]}, …],
 draw(f){playChapters(story,f,[ch1,ch2,…]);},
 touch(s,x,y,age,seed){ /* optional micro-interaction, see §7 */ },
};
```

Rules that keep the seams pixel-exact: a scene reads only `t` and `c` (never `c.frame.chapterTime`); every random value is seeded (`rng`, `hash`, `noise1`, shape `seed` options), never `Math.random`; the scene sets its camera once with `camKeys`/`s.camera` and wraps local transforms in `s.save()/s.restore()`; `aperture(t)` returns a **convex** polygon built with `aperture(points)` or `apertureDisc(...)` that lies inside painted material of *this* scene at time `t`.

`playChapters` does the rest: chapter durations are merged from `narrationTiming.json` by the registry, the arrival scale (.88 → 1 over .72 s) is applied for every chapter after the first, the last .65 s of a chapter runs `forwardPassage` into the next scene, the registration offset re-seeds per chapter (eased across the passage), and reduced motion draws one still per chapter at `scene.still ?? seconds*.55`.

## 2. Sheet API (`sheet.ts`)

`W H` sheet size in units (short side 1080) · `cx cy` the safe-region centre · `safe {x,y,w,h}` art region in units (above the tray on phones, left of it in short landscape) · `unit` css px per unit · `fit` compact-viewport scale (≤ 1; on short phones and short landscape the nominal 1080-unit square is scaled inside `camera()` so it clears the title/headline band and the tray — world units visible in safe = `safe.w/fit × safe.h/fit`) · `levels` the halftone coverage steps.

| call | does |
|---|---|
| `camera(x,y,zoom,rot)` | world (x,y) → safe centre; multiplies `arrival` (engine-managed) |
| `save/restore/translate/scale/rotate/clip` | forwarded to every plate |
| `fill(ink,path,cov?,rule?)` | solid ink (cov ≥ .95) or a halftone tint at the nearest level |
| `stroke(ink,path,width,cov?)` | plain stroke (prefer `contour` ribbons for drawn lines) |
| `tone(ink,path,density,box?,rule?)` | number → one halftone level; function `(x,y)=>0..1` → a dot-size ramp quantized into bands (cost: a grid over `box`; keep boxes small) |
| `knockout(path,cov?,rule?)` | paper on every plate (highlights, chalk, gaps); cov<1 = dotted paper |
| `field(ink,cov?,mottle?)` | whole-sheet ink with low-frequency mottling |
| `press(seed)` | **player only** — paper, speckle inside every ink, plates multiplied with registration offsets, final grain |

Print order = `spec.order` (lightest first, navy last). Screens rotate per plate index (14°, 76°, 0°, 45°). Overprints in this engine (alpha .9 on cream): blue×yellow ≈ #18721a green, pink×blue ≈ #182c7e purple, pink×yellow ≈ #f04c10 orange, pink×green = muddy (avoid: knock out beneath). Check a pair with `overprint(a,b)`.

## 3. Shape library (`shapes.ts`) — the print-language kit

The library is a language, not a cast: edges, fields, bands, marks, halftone, arrows, one football construction. Author your lead objects (kite, lantern, dial, thread, shirt, tide line…) in your own file from these primitives, the way `chalk-line.ts` builds `chalkStick`, `chalkBall`, `chalkEye`, `mass`.

Marks · `contour(s,ink,pts,width,{close,seed,pressure,taper,gaps,wobble,cov})` pressure-varied wobbling ribbon · `contourPath(pts,width,o)` the same as a Path2D · `dust(s,ink|null,x,y,r,count,{seed,size,cov})` speckle fragments (null = paper) · `chalkStroke(s,pts,width,{seed,progress,cov,dust,close,step})` paper line with dusty edge · `laneArrow(s,ink,a,b,width,{dashed,head,seed,progress})` · `sparkBurst(s,ink,x,y,r,{n,seed,g})` · `speedLines(s,ink,x,y,dir,{n,seed,len})` · `scribble(s,inks,x,y,r,{seed,width,loops,progress})` · `thread(s,ink,pts,width,{seed,ticks,progress})`.

Edges & fields · `handCut(pts,seed,amp,step)` jagged scissor edge · `tornRect(x,y,w,h,seed,amp)` · `field(s,ink,'torn'|'wave'|'arch'|'wall',box,{cov,seed,amp})` · `ring(x,y,r0,r1)` annulus path · `crescent(x,y,r,light)`.

Background composables (paths/points you fill in your own order and coverage steps — every story composes its own construction; the bible forbids two stories sharing one) · `arches(cx,cy,r0,step,count,legs)` nested arch bands · `tornChannel(x,width,seed,{y0,y1,amp,step,lean})` · `ribbons(cx,cy,angle,widths,{wobble})` edge-to-edge bands · `strata(box,count,seed,amp)` torn layers · `contourRings(cx,cy,r0,step,count,seed,amp)` map contours / ripples · `lattice(box,gap,angle,seed)` stripes for a weave · `windStreaks(box,count,seed,{len,lift})` · `glowDisc(s,ink,x,y,r,{steps,glow})` stepped halo · `ripple(s,ink,x,y,r,count,{progress})` · `confetti(s,inks|'paper',box,count,seed,{size})` · `pressureWalls(s,ink,x,y,gap,{height,thick,lean,seed})` · `disc(s,ink|'paper',x,y,r,{cov,seed})`.

Football · `footballPanels(s,x,y,r,{rot,key,shadow,seed})` the 5-panel ball (paper, key panels, one halftone crescent) · `goalFrame(s,ink,x,y,w,h,{depth,net})`.

Texture target (bible §1b): every field carries speckle (automatic in `press`), tonal steps are stepped flat prints (`tone` at levels, or ink + navy `tone` bands), edges are hand-cut or torn, motifs are huge (≥ 60 % of the safe region), confetti and scribble are secondary accents.

## 4. Motion helpers (`motion.ts`) — use for

`twos(t)` pose exposure at 12 Hz · `twosIndex(t)` reseed marks only while moving · `sm(a,b,t,ease)` 0..1 between times · `key(t,keys,ease)` numeric keys (a key may carry its own ease) · `keyPath` Catmull-Rom keys · `camKeys(sheet,t,keys)` camera through keys · `anticipate(a,b,t,{back,hold})` wind up against the move, then go · `settle(t,t0,{amp,freq,decay,phase})` damped follow-through after a stop or landing (phase π/2 = starts at full squash) · `spring(t,freq,damp)` overshooting step · `squash(k)` volume-kept [sx,sy] · `smearPose(pts,dir,amount,pivot)` directional smear for a rush (2–3 frames, then settle) · `pressPts(pts,dir,amount,wall)` a pushed shape sags against a wall and bulges (pressure) · `breathe(t,period)` slow inhale/exhale 0..1 (scale a whole composition) · `follow(t,target,lag,overshoot)` camera trailing a target with lag and overshoot · `lean(v)` rotation into travel · `arc(a,b,u,lift)` ballistic path · `blob/torn/wob/smoothPts/ribbon/partial/along/polyPath/curvePath/circlePath/rectPath` geometry · `rng/hash/noise1/drift` seeded randomness. Easings: `easeIO easeOut easeIn easeOutQuint easeInOutSine easeOutBack easeInBack linear`.

Enact the words: "pressure" = a mass pushes and the object deforms (`pressPts` or `squash`), "breathe" = the composition expands (`breathe` on the camera zoom), "rush" = `smearPose` + `settle`, "look" = the camera pans (`follow`, `camKeys`). Nothing linear, nothing idle. Cue rhythm: anticipation ≈ .2 s, action .3–.8 s, result readable ≥ .8 s.

## 5. Passages (`passage.ts`)

`aperture(points)` / `apertureDisc(x,y,r,n)` build the material polygon; `forwardPassage(sheet,{aperture,from,to},progress,tOut,tIn)` is called for you by `playChapters`. The outgoing scene keeps drawing (its cue actions continue) while an accelerating zoom sends the aperture's inscribed circle past every canvas corner; inside it the outgoing ink is knocked out and the next scene is drawn at scale .68 → .88; the next chapter then arrives .88 → 1 over .72 s. At progress 1 the frame equals the next chapter at time 0 — the review script diffs those two renders and fails on a single differing pixel. Never zoom in and back out; a chapter's zoom keys should be monotone or panning.

## 6. Performance rules

≤ 4 plates + the main canvas, allocated once per size; DPR ≤ 1.5; 24 fps cap; no work while paused/hidden/offscreen. Per frame aim for ≤ ~150 plate ops (the review sheet prints `ops` per frame; a passage frame draws two scenes, so keep each scene ≈ 100). Every `knockout` costs one op per plate. Long straight lines: pass a large `step` to `chalkStroke`/`ribbon`. Function-density `tone` only with a small `box`. Chalk-line measures: median 3.2 ms, p95 15.5 ms (passage frames), max 16 ms at 390×850 DPR 1.5 in headless Chrome. `touch` reactions must stay ≤ 1 ms.

## 7. Player, headline, micro-interactions

`components/StoryFilmPlayer.tsx` plays any `RisoStory`: one canvas, one `Audio`, chapters mode (per-chapter audio, chapter dots) or track mode (one src, `media.currentTime` is the clock, seek slider, captions by `chapter.start`), the kept `StoryPlaybackBar`, the origin entry circle (generated riso disc, no images), focus trap, Space/Escape, sleep on pause/hide/offscreen, full media cleanup. `chapter.headline` (1–2 words, most chapters none; track mode may set `cue.headline`) renders as cream brush lettering with a navy/first-ink misregistered echo that pops into register and drifts off when it leaves. Nothing is lettered on canvas.

`story.touch(sheet,x,y,age,seed)` runs after `draw` for every live touch (ring buffer of 6, 0.8 s life, world coordinates through the transform `draw` left active, pointer events passive with `touch-action:none` on the canvas only). While paused a touch wakes a bounded 0.8 s burst, then the canvas sleeps (`data-draws` stops). Reduced motion passes `age = 0` — draw one static mark. Chalk-line: a chalk puff, a fresh chalk tick and a yellow spark. Seam tick: `navigator.vibrate(8)` on chapter change while playing (not under reduced motion). Tray micro-feedback (dot swell + ink dot, play squash, printed-stamp Replay, slider thumb trail) lives in `StoryFilmPlayer.module.css` via `:global` selectors — `StoryPlaybackBar.tsx` is untouched.

Dev hooks (non-production): `node.filmControls = {play,pause,seek,seekTime,redraw}` on the dialog root and `window.__risoFrame(t)` which seeks to story time `t` and paints synchronously.

## 8. Scripts

- `node scripts/review-riso-story.mjs --id <id> [--out dir]` — contact sheet PNG per story at 390×850 and 1440×850 (start, each cue +0.9 s, settled, mid-passage, seam pair) with narration and op counts, plus seam pixel diffs; fails on any page error, draw error or seam diff. Default out: session scratchpad `riso/review/`.
- `node scripts/riso-perf.mjs <id> [--frames 120]` — median / p95 / max ms per frame at 390×850 DPR 1.5, and op counts.
- `node scripts/check-riso-films-browser.mjs [--title "…"] [--format Futsal] [--out dir]` — opens the running app (`FUTBOL_BASE_URL`, default :8092) at 390×850, 320×568, 844×390, 1440×850; asserts the riso player, tray fit, chapter dots, playback, pause sleep, touch burst then sleep, transcript, close cleanup, zero page errors; saves screenshots.
- Story ids the registry knows: `RISO_STORY_IDS` in `registry.ts`. A story becomes live the moment `lib/paths/riso/stories/<id>.ts` exports `story`; until then the old film keeps loading (`resolveRisoStory` returns null).

## 9. Self-critique of the pilot (read before you copy it)

Strong: the print language holds at every viewport — visible screen, speckle inside the ink, paper through the solids, registration echo on the lettering, clean pink on paper, navy-on-pink duotone in chapter 5, green-tinted yellow lanes in chapter 6; every seam is a real forward passage into a named material (dust, the ball's circle, the pressure ink) and all five seams are pixel-exact; each chapter has ≥ 4 cue actions and ≥ 3 camera keys; chapter 4 physically enacts pressure (masses lean, push, the ball squashes, camera shakes) and chapter 6 breathes.

What a builder should avoid (I got these wrong first): (0) monotony and sparseness — the second pass showed the same court at the same scale in five chapters with 60 % empty green and the pink/yellow plates barely used; plan six different views (macro, far above, close, large motif, duotone, whole-world small) and give every chapter weight in all three inks so overprints actually happen; (1) drawing lead objects at "sensible" sizes — the first pass had a 260-unit chalk stick and a 120-unit ball and the sheet read as a court map; everything had to grow ×1.5 and the camera had to come closer before it read as a print; (2) letting a background marking share the frame centre with the lead object (the court's centre circle competed with the chalk ball until it was pushed off-centre); (3) placing a support point where an opponent mass is painted (chapter 4's first version passed the ball into the pressure ink — the football truth check catches this, so run it per cue, not per chapter); (4) pink over green: it prints mud, knock the field out under pink; (5) the mid-passage op count doubles, so a 200-op scene becomes 400 at the seam — keep scenes near 100 ops.

Known limitations: the halftone levels are quantized to seven steps (a slow coverage pulse steps visibly — use it deliberately); `tone` with a function density is a device-grid scan and should be bounded with `box`; the passage's aperture is measured through the last `camera()` call of the outgoing scene, so parallax layers with separate cameras should set the main camera last; p95 frame time on passage frames is ~15 ms in headless Chrome (well under the 42 ms budget of 24 fps but above the 8 ms median target — passage frames are ~4 % of playback); the yellow support lane on the green court has less contrast than the storyboard hoped (yellow×green prints a yellow-green), so chapter 6's lanes are read mostly by their arrowheads and sparks.

## 10. Track mode with visual chapters (engine fix pass)

A track-mode story declares `visualChapters:[{start, headline?, cues?, label?}, …]` (media seconds). The player then resolves every frame on the **visual** chapters — `f.chapter`, `f.chapterTime`, `f.seconds`, `f.cue`, the headline, the registration seed (`press(visual index)`) and passages — and uses `story.chapters` only for captions and the transcript; `f.captionChapter` carries the caption index. Adopt it with one line in `draw`:

```ts
draw(f){const v=trackChapters(story,f);playChapters(v.story,v.frame,SCENES);}
```

`trackChapters` returns the visual story (`visualStory(story)`, stable identity) and the frame; when the frame already came from the player on visual chapters it passes through, otherwise (older players, scripts) it remaps from `f.time`. The private `sheet._passage.blend` path still works for stories that drive their own visual chapters (futsl, grit, regulate) until they adopt the helper. `resolveFrame(story,time,chapter?)` is the single call the player and the review/perf scripts use; `playbackChapters(story)` lists what playback runs on; `headlineAt(chapter,t)` resolves `string | {text, at}` and cue headlines.

## Changelog

- 2026-09-20 · engine frozen for builders. Pilot reworked for variety/density in `stories/chalk-line.ts` only; no engine change.
- 2026-09-20 · engine fix pass (all additive, signature-compatible):
  - `motion.ts`: `padKeys(keys, defaults)`; `key`, `keyPath` and `camKeys` pad mixed-length keys, so keys with and without rot never produce NaN transforms. In `camKeys` a missing zoom is 1 and a missing rot is 0; in generic `key`/`keyPath` a missing component holds the previous key's value. `camKeys` also guards non-finite values. Cost: ≈5 µs per call.
  - `story.ts`: `HeadlineSpec = string | {text, at}` for `Chapter.headline` and `VisualChapter.headline`; `RisoStory.visualChapters`; `RisoFrame.captionChapter`; `touch(sheet,x,y,age,seed,frame?)` gets the drawn frame as an optional 6th argument; new `visualStory`, `playbackChapters`, `headlineAt`, `resolveFrame`, `trackChapters`.
  - `StoryFilmPlayer.tsx`: frames resolved through `resolveFrame` (visual chapters when declared); caption from `captionChapter`; headline resolved per frame (supports `{text, at}` and visual-chapter headlines); touch receives the frame.
  - `review-riso-story.mjs`, `riso-perf.mjs`: render through `resolveFrame` and iterate playback chapters (visual when declared), so the seam test checks visual seams for visual-chapter stories.
  - `check-riso-films-browser.mjs`: `--chapters N`, `--track [--paragraphs N]` (seek slider, no dots, screenshots by `filmControls.seekTime`), `--title`, `--format`, `--out` — one script for all 18; the per-story `scripts/check-riso-<id>.mjs` copies keep working.
  - Verified: typecheck clean; review for all 18 stories → 0 seam diffs, 0 errors; browser check PASS ×4 for chalk-line and for futsl (`--track --title "Smaller court. Bigger game." --paragraphs 22`).
  - Who should adopt what: **futsl, grit, regulate** → declare `visualChapters` and replace their hand-rolled visual-chapter/blend code with `trackChapters`; any story with mixed-length camera keys can drop its padding workaround; stories that want a headline to appear mid-chapter use `headline:{text:'…',at:2.4}`; stories whose touch reaction depends on the chapter read the 6th `frame` argument.
- 2026-09-20 · engine defect pass (critics' engine-level findings; all additive):
  1. **Headline crossfade** (`StoryFilmPlayer.tsx` + `.module.css`): a leaving word now drifts off-register and fades over .2 s *before* the incoming word pops (`data-wait` delays the pop by .22 s), so two words never overprint; a seek (`seek`, `seekTime`, `__risoFrame`) cuts the outgoing headline instantly. Evidence: normal-play burst across regulate's FRUSTRATION→FEAR seam — `scratchpad/riso/defects/headline-burst.png` (leaving word at opacity .9 → .38 → gone, then FEAR at .67 → 1; no frame with both).
  2. **Never a transparent canvas**: `paint()` wraps `story.draw`/`touch` in try/catch so `press()` always lays paper (a draw error sets `data-riso-error` on the canvas and logs in dev; the browser check asserts it is absent); the film root no longer fades in as a whole — a paper cover (`.film::after`) fades out instead, so nothing behind the film can show through. Live probes of the reported seams (harbour-night 9.5–11.5 s, different-tides 9.6–10.2 s at 390×850 DPR 2) found 0 pixels with alpha < 255 and root opacity 1 both before and after; the review script now also counts transparent pixels at every seam (0 across all 18).
  3. **Seam equality in normal play**: the chapters-mode player used to hold at `next − .001` while narration finished, which rendered the passage at progress .9985 — the .88 arrival scale and the registration blend were a hair off and the half-pixel offset rounding could hop a whole plate by .5 px for that held frame (measured: up to 1.7 % of samples, max diff 188 in more-shirt/regulate/boat-weather). The player now holds at exactly `next` (the forced chapter index keeps the chapter; `frameFor` clamps chapterTime) and `forwardPassage` snaps the last 2‰ of progress to 1. The review script adds a **held-seam** diff (seconds − .001 vs next frame 0) asserted for chapters mode: now 0.000 % for all 15 chapters-mode stories. The harbour-night "flash" is not a wrong-plate blend: mean luminance 93 (ch1) → 122 at passage progress .6 → 84 at ch2 frame 0 — the outgoing yellow lantern glass fills the frame as the camera enters it (story material choice; 9v9 review's "cap the glass at .6" stands).
  4. **Compact viewports** (`sheet.ts`): new `sheet.fit` — at ≤ 600×740 and short landscape (< 520 tall) the camera scales the nominal square by `clamp(safe.h/2 / (540·unit) × 1.05, .68, 1)` (≈ .70 at 320×568, ≈ .72 at 844×390; 1 at 390×850 and desktop) so the top of the composition clears the header + headline band (measured bands: 320×568 header 0–88, headline 80–125, tray from 407; 844×390 header 0–74, headline 64–104, tray from 253 on the right). Verified on chalk-line ch3/ch4 captures at both sizes.
  5. **Touch gate** (`check-riso-films-browser.mjs`): samples a 120 css-px box around the touch point before and 0.3 s after the click and requires ≥ 2 % of its pixels to change (channel delta > 40). Results: chalk-line 13–23 %, regulate 13–86 % → PASS; **futsl 1.3 % → FAIL** (its roller dab is invisible, as the futsal critic reported — story fix for its owner).
  6. **Halftone pitch** (`sheet.ts`): dot cell 6·dpr → 4.5·dpr device px (25 % finer); coverage levels ≥ .7 print as a flat solid with stochastic paper speckle holes instead of touching dots (the reference's grained flats). Tiles stay cached; per-frame cost unchanged.
  - Gates: typecheck clean; `review-riso-story.mjs` all 18 → 0 exact-seam diffs, 0 held-seam diffs (chapters mode), 0 transparent seam pixels, 0 errors; browser check PASS ×4 for chalk-line and for regulate (`--track --title "When the game feels unfair." --format 7v7 --paragraphs 19`); futsl fails only the new touch-visibility gate.
