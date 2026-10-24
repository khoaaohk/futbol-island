# Landscape audit: phones in landscape as a supported mode (Oct 23 2026)

Owner decision: phone landscape becomes a **supported** mode; portrait stays the default. This is an audit only (no game code changed).
Build: production, `NEXT_PUBLIC_MULTIPLAYER=1`, the dev relay with 3 scripted friends, base `integrate-dive-bugs-sealife` @ d9b5ec20.
Driver: `scripts/audit-landscape.cjs` (Chrome 155 headless, isMobile + touch + DPR 3, **safe areas emulated** through CDP
`Emulation.setSafeAreaInsetsOverride`, so `env(safe-area-inset-*)` resolves like an iPhone: 59 px left/right + 21 px home bar on
iPhone 15 / Pro Max landscape, 59/34 top/bottom in portrait). Rotation = CDP device metrics + viewport + insets + `orientationchange`.
Screenshots (25, ≤ 165 KB): `docs/ui/landscape/<screen>-<size>.png`.

## 1. Summary and verdict

**Verdict: landscape is close to shippable on phones; 1 day of fixes (batches 1-2) makes it supportable, batch 3 makes it good.**

- The island itself works: HUD row (all 4 counters in the stretched bar on every phone size), joystick, the 4 action buttons, minimap,
  emote bar, toasts and lesson cards all sit inside the emulated notch/home-bar safe areas; nothing on the island HUD is off-screen,
  covered or under 44 px. The 42 existing `orientation:landscape` rules + ~115 `max-height` rules already do most of the work.
- **Rotation is clean**: portrait <-> landscape mid-party, mid-lesson, mid-fishing, with the emote bar open, and in Strikers: canvas,
  camera aspect, joystick bounds and HUD all follow (Town's ResizeObserver + `visualViewport` resize); nothing stuck, no page errors.
- **Breaks** (fix before announcing): Strikers start card runs off the bottom (no scroll), the Pick-your-player onboarding step hides its
  Male/Female choice under the footer, the party List hides friend actions under the sticky footer, the travel map crops the island
  (History Museum pin unreachable without the arrows), title "For grown-ups / Privacy" scroll off on iPhone SE.
- **Camera/heat is the real cost**: the camera keeps a fixed 40° vertical FOV at the desktop distance, so landscape shows **4.7x the
  horizontal world** of portrait: the player is **20 px tall vs 42 px**, draw calls are **1.6-2.4x**, triangles **1.2-3.2x**, people in
  view **2-4x**, and the same 1536² shadow map is stretched over **~3x the area** (blurrier shadows). Expect a warmer phone in landscape.

## 2. Screens x sizes

Sizes: **SE** 667x375 (no notch), **15** 852x393, **Max** 932x430, **iPad** 1024x768 (touch). OK / minor / **broken**.

| Screen | SE | 15 | Max | iPad | Defect (one line) |
|---|---|---|---|---|---|
| Title | minor | OK | OK | OK | Start/save buttons sit over the cast art; SE "saving break" page scrolls 9 px: For grown-ups + Privacy below the fold |
| Join friends (guest code) | OK | OK | OK | OK | 520x242 dialog, fits |
| Welcome / save code | minor | OK | OK | OK | same SE page scroll as title |
| Onboarding "Pick your player" + Shuffle | **broken** | **broken** | minor | OK | body scrolls 163/209 px: Male/Female toggle half under the Back/Next footer (overlaps Back on 15) |
| Island HUD row + coins bar | OK | OK | OK | OK | all 4 counters, inside 59 px notch insets; iPad uses the desktop bar (correct) |
| Joystick + 4 action buttons | OK | OK | OK | OK | inside home-bar inset; bottom ~45 % of SE height is controls |
| Toasts / hud-stack (Welcome +40) | minor | minor | OK | OK | centred toast covers ~25-30 % of the height and the area above the player |
| Lesson card ("Continue lesson") | OK | OK | OK | OK | |
| Emote bar (party, friend near) | minor | minor | minor | minor | 10-per-page strip crosses mid-screen over the player; pager arrows 24x44 (< 44); last chip overlaps "More" |
| Emote ask card | OK | OK | OK | OK | stacks under the lesson card, centre |
| Minimap (+ friend dots) | OK | OK | OK | OK | small 110 px circle above the action buttons |
| Travel map | **broken** | minor | minor | minor | crop shows ~half the island; History Museum pin off-screen; legend chips 22 px tall |
| Paths list | minor | minor | minor | OK | header eats ~100 px; ~2 cards per screen; "01..04" step numbers clipped |
| Lesson (field view) + quiz controls | OK | OK | OK | OK | re-frames on rotate; Shoot sits under the radar button (also portrait) |
| Pocket (backpack) sheet | minor | minor | OK | OK | HUD row stays on top: 231-249 px body on phones |
| Settings | OK | OK | OK | minor | full-screen sheet scrolls; iPad: Day/Sunset/Night segment in the home-bar inset |
| Grown-ups gate (party) | OK | OK | OK | OK | 560x343, scrolls 4 px |
| Party: name / Code tab | OK | OK | OK | OK | 560x340 sheet scrolls 246/407 |
| Party: List tab | **broken** | **broken** | **broken** | minor | sticky foot + "End party" cover the friend row's Mute/Hide/Lock; on 15 "Remove" in the right inset |
| Island in a party (3 friends) | minor | minor | minor | OK | friends ~20 px tall; name tags fine |
| Konbini / Museum / Arcade hub | OK | OK | OK | OK | landscape rules exist (`--control-bottom`) |
| Kit Shop | minor | minor | minor | minor | door slide still covers Done / My kit at 10 s; Done in right inset on 15/Max; SE screenshot timed out (heavy) |
| Strikers (arcade) | **broken** | **broken** | minor | n/a | start card 78..486 px of 375/393, overflow visible, no scroll: stars line cut; Team shape / Rounds 35 px tall; card overlaps touch buttons |
| Strikers rotate prompt | OK | OK | OK | n/a | portrait shows the rotate prompt; back to landscape resumes |
| Fishing | minor | minor | minor | minor | Back overlapped by the Play-with-friends button (**also in portrait**); reel/lure fine |
| Swim / Dive | minor | minor | OK | OK | "Pace your breath" card covers the centre; dive draws 22 calls either way |
| Zipline / jetpack HUD | OK | OK | OK | OK | jet "Blast" buttons fine; zipline ride not driven (see 6) |
| Rotate mid-play (all of the above) | OK | OK | OK | OK | aspect/canvas/HUD follow both ways; no stuck state |

## 3. Code risks and likely bugs (ranked)

1. **Camera framing ignores landscape** - `components/Town.tsx:524` (`PerspectiveCamera(40,…)`, fixed vertical FOV) +
   `lib/town/walkControl.ts:22` (`walkCameraOffset`: aspect ≥ 1.3 gets the desktop offset 18/30). Same distance (42 m) as portrait,
   so the player shrinks to 46 % on screen and the world widens 4.7x. Needs a landscape dolly-in or a horizontal-FOV cap.
2. **Wider frustum = more work** - `lib/graphics/viewGate.ts:42` and `lib/graphics/islandShadows.ts:16` fit chunks and the shadow
   box to the view ("phones ~110 m" assumes portrait): landscape box 128x124 m vs 116x46 m at the same 1536² map. NPC / traffic
   LOD and the friend rig cap (`lib/graphics/rigCap.ts`) are distance-based, not frustum-width-based, so more of them get drawn.
3. **Width-only "phone" detection** (landscape phones are 667-956 wide, so they get the DESKTOP branch):
   `lib/shop/studioSheet.ts:23` `(max-width:899px)` (Pro Max 932/956 gets the desktop studio at 430 px tall);
   `components/QuestLearningPath.tsx:91` (desktop path art, larger downloads); `components/CardCollection.tsx:382,397`;
   `components/CharacterPreview.tsx:59` `(max-width:700px)`; and **123 CSS rules** `@media(max-width:600px)` with no
   `pointer:coarse`/height alternative (most in `IslandJourney.module.css` 11, `IslandSettings.module.css` 10,
   `CharacterCustomizer.module.css` 9, `PositionGuide`, `PassPuzzleGame`, `ArcadeGame3D` 5 each).
4. **Strikers start card** - `components/LiveArcadeMatch.module.css` (card has no max-height/overflow in
   `(pointer:coarse) and (orientation:landscape)`, lines 15-18/85). Strikers is landscape-only, so this hits every phone player today.
5. **Party List foot** - `components/party/party.module.css:92` `.panelFoot` / `:103` `.endLink` sit over the scrolling list
   (`.dialogWide` max-height `:14`); friend actions under it are unreachable without precise scrolling.
6. **Onboarding showcase threshold** - `components/IslandOnboarding.module.css:68` hides `.showcase` at `max-height:430px`: 15 (393)
   and Pro Max (430) hide it, iPhone 17 Pro Max (440) does not; the step body still scrolls 163/209 px with the gender toggle cut.
7. **Thresholds between 430 and 520 px** - ~115 `max-height` rules use 500/520/560 (good for all phones) but 7 use 480, 4 use
   450/430/420 and 2 use 350 (`app/globals.css:412` minimap). iPhone 17 Pro Max landscape (956x440) falls between them: test it.
8. **Mid-lesson rotate** - `lib/town/learningView.ts:24-25` rolls `camera.up` for the landscape top angle; `Town.tsx:1782` only frames
   the lesson for aspect < .85. Rotating mid-lesson worked here, but `camera.up` is only reset on lesson exit (`Town.tsx:1817`).
9. **Mid-emote / mid-party rotate** - emote camera (`lib/town/shotCamera.ts:29`) re-aims on aspect change: OK. Emote bar layout
   is being reworked by another agent: re-run `journey` after it lands.
10. **Keyboard-open** (name field, save code) - `Town.tsx:1066` listens to `visualViewport` resize but sizes from `parent.clientWidth/Height`,
    so the canvas does not thrash; the 340 px party sheet with a landscape keyboard (~200 px tall) leaves ~150 px: not reproducible headless.
11. **Orientation locks / portrait assumptions** - only `app/controller/Controller.tsx:22` locks (landscape, the TV controller: fine).
    Portrait-only branches that are correct as is: `BallHuntLesson.tsx:45`, `globals.css:170`, `Pitch.tsx:102`, `BreakawayRun.tsx:1065`,
    `PlayerBookScene.tsx:108`, `PaintEasel.tsx:37` (aspect-based, good). `LiveArcadeMatch.tsx:57` gates portrait with a rotate prompt.
12. **Safe areas** - 262 `safe-area-inset-left/right` uses; landscape gaps found: party List "Remove" button (right inset on 15),
    Kit Shop Done (right inset on 15/Max), iPad Settings day/night segment (home bar). Island HUD is clean.

**Existing landscape rules** (42 `orientation:landscape` occurrences in 18 files): `app/globals.css` 8 (lines 36, 47, 75, 84, 412, 464,
698, 777), FishingHost 4, LiveArcadeMatch 4, IslandJobs 3 (102, 125, 161), PassPuzzleGame 3, KonbiniRoom 2, KonbiniReveal 2, and 1 each in
VendingCardReveal, FishingLureButton, ArcadeRoom, MuseumRoom, ShopRoom, CardOffer, WelcomeBack, StoryPlaybackBar, StoryFilmPlayer,
ArcadeLoading, SoccerPinballGame. Portrait-only: `globals.css:170`, `BallHuntLesson.module.css:123`, `BallHuntLesson.tsx:45`.

**Tests/scripts that assume portrait** (would need a landscape twin): Playwright projects in `playwright.config.ts:40-45` are all
portrait (iPhone SE, iPhone 15, iPad gen 7, iPad Pro 11, Pixel 7) - only `tests/e2e/gap-welcome-landscape.spec.ts` is landscape.
Node tests with portrait-only viewports: `ball-cannon, beachcombing, card-collection, coaches-idp-browser, mobile-camera-audit,
pass-puzzle-challenges-browser, pass-puzzle-arcade, paint-easel, shop-sheet, summit-kick, summit-tree-kick, summit-forage, zipline`
(13 in `tests/`) and 66 `scripts/check-*` (already landscape-aware: `check-hud-row`, `check-fishing-browser`, `hud-stack`, `ui-spec`,
`oct1-ui`, `device-guards`, `emote-contexts`, `fishing`, `vending-machines` + 15 more).

## 4. Perf / heat (headless Chrome, ANGLE/Metal, same pose, rotated in place; `perf` scene)

| Spot | Size | Draw calls | Triangles | Objects in frustum | People in view | Shadow box | Player px |
|---|---|---|---|---|---|---|---|
| Plaza | 15 land / port | **203** / 109 | 201k / 156k | 182 / 89 | 4 / 2 | 128x124 m / 116x46 m | **20** / 42 |
| Harbour | 15 land / port | **258** / 135 | 272k / 155k | 239 / 114 | 12 / 4 | 128x124 / 116x46 | 20 / 42 |
| Old town | 15 land / port | **314** / 131 | 283k / 87k | 291 / 119 | 13 / 3 | 126x124 / 116x46 | 20 / 42 |
| Old town | SE land / port | 286 / 132 | 236k / 88k | 270 / 119 | 13 / 3 | 124x106 / 116x46 | 19 / 42 |
| Party of 4 (plaza) | 15 / Max / iPad / port | 222 / 219 / 156 / 122 | 220k / 219k / 186k / 174k | 202 / 201 / 141 / 90 | | | |
| Dive (reef room) | 15 / SE / iPad | 22 / 21 / 21 | 49k / 48k / 48k | | | | |

- Pixel count is identical (canvas 1491x687 vs 687x1491 at the 1.75 phone ratio), so the extra cost is **scene work, not fill**: draw
  calls +65-140 %, triangles +28-225 %, the CPU inside `renderer.render` 0.9-1.8x (1.1-3.3 ms vs 0.9-3.3 ms per render here; noisy on a desktop CPU).
- Frame time is capped at 60 fps on this Mac in both (16.7 ms p50/p90), so it is **not** a heat measure; on a phone the governor
  (`lib/graphics/heatTier.ts`) will reach tier 1-2 sooner in landscape. iPad landscape (aspect 1.33) is in between (156 calls).
- Particles/sprites in view: 0-3 either way; the shadow map stays 1536² but covers ~3x the area (texel density /3).
- **Camera**: vertical context is the same in metres (fixed vertical FOV), so landscape does not show "too little vertical context";
  it shows **too much world sideways** at half the character size. A landscape dolly-in to ~30 m (player ~30 px) would cut the
  frustum area ~50 % and most of the draw-call gap.

**Batch 2 after (Oct 23 2026, same script/pose, `PERF_SHOTS=1 … perf i15,se,max`)**: phone landscape dollies in
(`lib/town/walkControl.ts` `cameraDollyFor`: visible width ≈ 2.0× portrait, `maxDolly` 2.4, eased ~0.4 s on rotate) and caps its shadow
box (`lib/graphics/islandShadows.ts` `shadowAreaCap`). Before = the re-run on 70c55011 (matches the table above).

| Spot | Size | Draw calls before → after (port) | Triangles before → after (port) | People | Shadow box | Player px | Cam dist |
|---|---|---|---|---|---|---|---|
| Plaza | 15 land | 203 → **96** (108) | 201k → 146k (156k) | 4 → 0 (2) | 128x124 → 70x78 m | 20 → **48** | 42 → 18 m |
| Harbour | 15 land | 258 → **147** (133) | 273k → 192k (151k) | 12 → 6 (4) | 128x124 → 70x76 m | 20 → 48 | 42 → 18 m |
| Old town | 15 land | 314 → **170** (134) = 1.27x | 283k → 161k (94k) | 11 → 2 (3) | 126x124 → 68x76 m | 20 → 48 | 42 → 18 m |
| Old town | SE land | 290 → **163** (133) = 1.23x | 257k → 111k (89k) | 13 → 2 (3) | 124x106 → 78x66 m | 19 → 38 | 42 → 22 m |
| Old town | Max land | (not run) → 169 (134) | → 161k (93k) | 2 (3) | 68x76 m | 53 | 18 m |

Portrait rows unchanged (108-134 calls, 42 px, 43 m). Target (landscape ≤ 1.3x portrait draw calls) met at every spot; old-town
triangles stay 1.7x (the closer camera picks nearer LODs). Friend / NPC caps are distance-based (rigCap, tier caps), not frustum-width
based, so the closer camera cannot raise them; people in view dropped. Not a thermal measurement.

## 5. Ranked fix list (batches)

**Batch 1 - blockers (S-M, ~3 agent-hours, Sonnet)**
- Strikers start card: `max-height:calc(100dvh - 90px - env(safe-area-inset-bottom)); overflow:auto` + 44 px Team shape/Rounds in
  `LiveArcadeMatch.module.css` landscape block. Test: `tests/striker-polish.cjs` + a landscape assertion (card bottom ≤ innerHeight).
- Party List: move `.panelFoot` out of the scroller or give the list `padding-bottom` = foot height (`party.module.css:92-103`);
  keep "Remove" inside the right inset. Test: extend `tests/mp-ui.cjs` / `scripts/check-hud-row.cjs` style check at 852x393.
- Onboarding Pick-your-player: in `max-height:500px` landscape put the showcase beside the form (2 columns) and drop the 430 rule
  (`IslandOnboarding.module.css:68`). Test: `tests/new-player-flow.cjs` landscape run, Male/Female fully visible without scroll.
- Title/welcome on SE: shrink the vertical gaps under `max-height:400px` (`components/landing/Title.module.css`). Test: `tests/landing.cjs` 667x375.

**Batch 2 - camera + heat (M, ~4 agent-hours, Opus)**
- Landscape framing in `lib/town/walkControl.ts:22` (dolly-in / lower FOV cap by aspect > 1.3 on coarse pointers, keep desktop as is);
  same for the swim/dive and ride cameras that use it (`Town.tsx:1777`). Keep `tests/walk-control.cjs` and add aspect 2.17 cases.
- Shadow fit: cap the shadow box width by aspect or raise phone landscape to 2048² only at tier 0 (`lib/graphics/islandShadows.ts`,
  `lib/graphics/quality.ts`). Tests: `tests/heat-tiers.cjs`, `tests/heat-pass6.cjs`, `tests/quality-pass.cjs` with a landscape case.
- Re-run `node scripts/audit-landscape.cjs … perf i15,se` (target: landscape draw calls ≤ 1.3x portrait).

**Batch 3 - polish (M, ~4 agent-hours, Sonnet)**
- Width-only phone checks -> `(max-width:600px),(pointer:coarse) and (max-height:500px)`: `studioSheet.ts:23`, `QuestLearningPath.tsx:91`,
  `CardCollection.tsx:382,397`, `CharacterPreview.tsx:59`; then sweep the 123 `max-width:600px` CSS rules file by file (top 6 first).
- Travel map landscape: fit the whole island (contain, not cover) under `max-height:500px` (`IslandTravelMap.module.css:71`); legend
  chips to 44 px hit areas. Test: `tests/e2e/travel-map.spec.ts` landscape project.
- Toast / Pace-your-breath / emote bar: in landscape dock toasts top-right (extend `globals.css:698` beyond job-running), keep the
  centre band (±40 px) clear like `gap-welcome-landscape.spec.ts`; emote pager arrows 44 px (`EmoteWheel` - coordinate with the rework).
- Pocket/Paths headers compact in landscape; Kit Shop Done inside the right inset; fishing Back vs friends button (portrait too).

**Batch 4 - test net (S, ~2 agent-hours, Haiku/Sonnet)**
- Add `iphone-15-landscape` / `iphone-se-landscape` projects to `playwright.config.ts` (`devices['iPhone 15 landscape']`) and run the
  e2e suite there; add `scripts/audit-landscape.cjs journey,places` to the pre-release checklist (it exits 0; read the defect lines).
- Landscape twins for the 13 portrait-only node tests listed above where they assert screen positions.

## 6. Not verified

- **Real iPhone safe areas**: insets were emulated (59/21 px); Safari's collapsing toolbars, the Dynamic Island side and the
  landscape home-indicator auto-hide were not. Notch-side flips (landscape left vs right) not tested.
- **Real heat / battery**: numbers are headless on an M-series Mac at 60 fps cap; no thermal tier changes observed. Needs a 10-minute
  phone session per orientation with `__fi2.heat` logging.
- **WebKit**: runs used Chromium with mobile emulation; the WebKit descriptors were not driven (WebGL in headless WebKit is too slow here).
- **Keyboard-open** in landscape (party name, save code), **zipline/jetpack rides mid-rotate**, vending/book popups, quizzes beyond
  lesson 1 step 2, the guest side of a live party (only the guest code dialog), and the **reworked emote bar** (in flight).
- iPad Strikers (navigation aborted in the run) and the Kit Shop SE screenshot (timed out).
