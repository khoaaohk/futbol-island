# Heat audit, whole codebase — September 26, 2026 (read-only)

User report: the iPhone gets warm, even when the child just stands still and watches a live match. This audit read `app/`, `components/`, `lib/` and `public/` from end to end, after heat passes 1–3 in `docs/performance-guide.md` and `docs/flight-performance-2026-09-14.md`. No app code was changed. "Heat pass 4" (`lib/graphics/heatTier.ts`, `lib/graphics/islandHeat.ts`, wired into `components/Town.tsx`) was being built at the same time. Its items are marked **(pass 4)** below so they are not duplicated.

**Evidence levels.** "Code" means the claim was checked by reading the code path end to end. "Emulation" means headless Chrome on the Mac at 390×844, DPR 3, touch, with a 4× CPU throttle unless noted, against the dev server on :8092. Emulation numbers are reduced-work measurements. **They are not iPhone temperatures.** The desktop GPU timer is noisy (about ±20% at 1–2 ms), so only interleaved A/B runs from one session are compared. Scripts are in the session scratchpad under `audit5/` (`census.mjs`, `up.mjs`, `lever.mjs`, `lesson.mjs`, `radar.mjs`). The pitch-side and watch-view baselines are heat pass 4's `heat4/watch-before.txt`.

Line numbers refer to the tree as read on September 26 around 15:00. `Town.tsx` was being edited by pass 4 during the audit, so its line numbers can be off by a few lines; each finding also names the function or symbol.

---

## 1. The short answer

While the child stands still, nothing on the island sleeps, by design: townsfolk, traffic, water and four live matches keep moving (pass 3 proved no island view is still). So the island renders 30 fps all the time. Standing still is also, by design, its **sharpest** state: DPR 2 with MSAA, and a 2048² PCF-soft sun shadow map redrawn every frame. Dynamic resolution only lowers DPR to 1.5 while the camera or player moves. The isolated watch view counts as moving, so it stays at 1.5.

On top of that:
- The audio thread never suspends while the page is visible.
- Near-silent music (4%) streams and loops through Web Audio for the whole session.

A few specific leaks add GPU and compositor work while watching:
- The pitch radar blurs a backdrop over the live canvas and has its own unsynchronised loop.
- Teaching plays upload about 484 KB of vertex buffers every frame.
- Camera drags re-wake the HUD CSS loops.

The measured levers that would cut the most steady GPU work (DPR, shadow map) all carry a visual trade-off. Pass 4's tiers apply them only after the phone has already slowed down.

## 2. What runs, per scene (from the code)

| Scene | Island loop | Resolution | Other work while idle |
|---|---|---|---|
| **Standing still in town** (walk or hover) | 30 fps. The rAF chain fires at 60/s (every other callback returns at `frameCapSlot`). No sleep. | **DPR 2 (780×1688) after 0.5 s still**, MSAA | Shadow map redrawn every frame (about 121–356 depth draws). All traffic advances. NPC routines run, and only on-screen NPCs are posed. 4 match sims: the visible one steps every frame, the others every 100 ms. Water, ferry and waves move. HUD CSS loops rest after 6 s. AudioContext running, music streaming. |
| **Pitch-side, watching from the town camera** | 30 fps | DPR 2 when still | As above, plus rig solves for the players on screen. Pass 4 baseline, 11v11 pitch-side at 4×: 98 colour / 39 shadow draws, `animate` 9.5 ms, task 318 ms/s, 17 KB/frame bean pose uploads. |
| **Isolated watch view** (field card → watch) | 30 fps | **DPR 1.5 constant** ("learning && !quiz" counts as moving, `Town.tsx` `motionResolution.update`) | Town hidden; traffic update skipped; NPC routines still advance (not posed). 3 other matches step every 100 ms. 22 rigs solved. Shadows still drawn (5 draws). `FieldTranscript` polls at 2 Hz even when closed. Music not ducked. Pass 4 baseline, 11v11 at 4×: 24/4 draws, `animate` 5.8 ms, task 194 ms/s, 18 KB/frame. |
| **Teaching play** (a lesson playing) | 30 fps | 1.5 | Plus about **484 KB/frame** of vertex buffer uploads (measured, see F4), a per-frame rebuild of the markings and cues, and the `FieldVisualBeat` 120 ms interval. |
| **Quiz waiting or answered** | Sleeps after 1.2 s settle (0 fps) | sharp | — |
| **Menus** (Paths, binder, store, settings, map, customizer, card offer, conversations, arcade menu) | Sleeps (0 rAF) | frozen frame | Menu's own loops: the Paths art rests after 6 s. **The bottle waves run at 24 fps with no idle rest** while the bottle is open (F9). The binder is quiet. The card viewer scenery rests after 6 s. The card offer stars rest after 6 s. |
| **Card films** | Asleep | — | 24 fps canvas draws. The rAF runs at display rate. Card DPR 2, dropping once to 1.5 if drawing is slow. The riso JS engine takes about 75% of a throttled core (known, see the performance guide). |
| **Onboarding (first run)** | **Keeps running** (`paused=(map\|\|settings)&&!onboardingRef`) | as in town | Step 0 adds a second WebGL context (CharacterPreview, DPR 2, PCF-soft 512) at 24 fps. The 100 ms and 350 ms intervals cause re-renders and a forced layout (F10). |
| **Arcade games, Pass Puzzles, Strikers** | Asleep | arcade stage DPR ≤1.5 on phones | 30 fps phone cap. Each sleeps when paused, idle or hidden. Strikers joystick: see F13. |
| **Page hidden** | rAF stops (iOS). Loop returns on `document.hidden`. | — | AudioContext suspended, music paused. |

## 3. Ranked findings

Cost: **High** means a steady GPU, compositor or CPU cost in a common idle or watching scene. **Med** means scene-specific or a smaller steady cost. **Low** means negligible, or rare. "Kid sees" asks whether the proposed fix would be visible.

| # | Item | file:line | Est. cost (why) | Kid sees fix? | Proposed fix | Risk |
|---|---|---|---|---|---|---|
| F1 | **Standing still is the sharpest, most expensive state.** DPR 2 after 0.5 s still, MSAA, 30 fps, with no idle reduction, because ambience always moves. | `lib/graphics/quality.ts:3` (`graphicsQuality` min(DPR,2)), `quality.ts` `MotionResolution`; `Town.tsx` `motionResolution.update` (~l.969) | **High.** 1.78× the pixels of the moving state, in exactly the scene the user reports. Frozen-frame GPU (emulation, no throttle): pitch-side 3.01 ms at DPR 2 vs 2.35 at 1.5 (−22%) and 2.03 at 1.25 (−32%); spawn hover 4.07 vs 3.22 (−21%) and 2.94 (−28%). A fill-bound phone GPU likely gains more; unproven. | Yes: softer edges and sign text when still | Cap phones at DPR 1.5 always, i.e. make pass 4's tier 1 resolution the phone default (big lever L2). Needs the user's decision. | Low technically; visible |
| F2 | **Sun shadow map redrawn every frame**: 2048², PCF-soft, `autoUpdate` on, including while standing still, where the only moving casters are characters, cars and balls | `Town.tsx` renderer setup (~l.267 `PCFSoftShadowMap`, l.273 `mapSize`); `lib/graphics/staticShadowCache.ts` (mobile cache off) | **High.** Frozen frame: 1024² −33% (pitch-side) / −15% (spawn); shadows off −23% / −32%. Swapping PCF-soft for PCF: −1% (no gain). | Yes (1024²: acne and softer edges, per pass 3). Every-2nd-frame refresh: shadows of moving players lag by one frame at 30 fps. | Pass 4 tiers 2 and 3 refresh every 2nd or 3rd frame, and at 1024² in tier 3. Consider a phone default of "static casters every N frames, dynamic every frame". That needs a split map, which is its own project. Don't retry the mobile framebuffer shadow cache (rejected, 10.2 ms vs 7.5). | Med |
| F3 | **Pitch radar over the live match**: `backdrop-filter: blur(5px)` on a 210×280 frame, plus its own rAF chain (60 Hz, work at 30 Hz, not aligned to the island's frames) that rewrites `cx`/`cy`/`fill` on ~22 SVG circles every tick | `components/IslandMapFrame.module.css:2`; `components/FieldRadar.tsx:13-19`; the allowlist in `tests/heat-pass3.cjs:57` wrongly treats it as over a paused view | **High while open.** Measured, watch view 11v11 at 4×, radar closed → open: swaps 30.2 → 42.2/s, GPU passes 3.4 → 9.4 ms per 4 s, paint 0 → 14 ms, layouts 0 → 89 per 4 s, rAF 60 → 120/s. Back to baseline when closed. | No, with a solid background of the same tint | A solid `rgba()` background, as the pass 3 transcript fix did. Drive the markers from `positionStore.subscribeFrame` (island frames), or at 10 Hz. Set `fill` once, and write `cx`/`cy` only on change. Remove it from the allowlist. | Low |
| F4 | **Teaching plays re-upload their entire vertex buffers every frame**: ground markings 2 × 196,608 B, cue lines 2 × 49,152 B, `needsUpdate` with no update range | `lib/town/teachingGround.ts:5,14` (`finish`); `lib/town/lessonCues.ts:137` | **High during plays.** Measured: live watch 5.7 KB/frame of buffers vs **484.1 KB/frame** in the "Can You Turn?" play (about 14.5 MB/s at 30 fps). Shadow-pass GPU also rose 0.63 → 1.39 ms in that sample. | No (pixel-identical) | `attr.clearUpdateRanges(); attr.addUpdateRange(0,count)` before `needsUpdate` (three r169 supports this on BufferAttribute). Skip the upload when the geometry is unchanged. | Very low |
| F5 | **AudioContext never suspends while visible**, even when muted, at volume 0 or with music off. Every tap calls `unlock()` → `resume()`. | `lib/audio/islandSound.ts:44-47,176-178`; `lib/audio/islandMusic.ts:24`; `Town.tsx` `sound.unlock()` | **Med.** It keeps the audio render thread and hardware awake for the whole session, in town and in the watch view. The performance guide's "the shared context runs only for music" is not accurate. | No | Suspend when no music is playing, no sources or hums are live, and ~2 s have passed since the last one-shot. `ui()` already resumes on demand. | Low–med (an iOS resume needs a gesture; the input handlers already call unlock) |
| F6 | **Music at 4% loops for the whole session** through `createMediaElementSource`: MP3 decode, resample and graph. It is ducked only for the field catalog/lesson, bottle and video, **not in the watch view**. `audioSession.type='playback'` ignores the silent switch. | `lib/audio/islandMusic.ts:4,39,66`; `Town.tsx` `setDucked(Boolean(fieldCatalog\|\|lesson))`; `islandSound.ts:44` | **Low–med.** Continuous decode work for near-inaudible music, and it is what keeps F5 running. | Yes (product choice) | Pause music after ~60–90 s with no input and resume on the next input; or duck it in the watch view; or default it off. Consider `'ambient'` so the silent switch really silences. | Low (product) |
| F7 | **HUD loops wake on canvas camera drags.** `hudHold` covers only joystick and action buttons, and `pointermove` is a wake event, so each drag or pinch on the canvas restarts the Paths shake, sparkle and blur icon swap for 6 s. | `components/IslandSettings.tsx:26` (`HUD_HOLD_SELECTOR`); `lib/sceneryRest.ts:8` | **Med–high while dragging.** Same mechanism as pass 3 finding 1: the compositor goes back to display rate over the 30 fps canvas. Not measured here. | Only that the loops wait until the child stops dragging | Add the island canvas (`.town-scene canvas`) to `HUD_HOLD_SELECTOR`, or drop `pointermove` from the HUD's wake events. | Low |
| F8 | **`playerBatch.draw` walks hidden classic meshes.** `root.updateMatrixWorld(true)` and the per-mesh visibility walk still cover the ~25–45 classic body meshes the bean skin only hides. | `lib/graphics/playerBatch.ts:39,44-47`; `lib/graphics/beanSkin.ts:981-983` | **Med CPU while watching.** Pass 3 measured "batch matrices 42 ms/s" (4×) for 22 rigs; this is a likely large share of it. | No | With the bean skin active, cache `collect()` as the bean and costume meshes only, and detach or gate the hidden classic subtree. Re-attach it for `?characters=classic` and costumes. | Med (costume and classic switching) |
| F9 | **The bottle waves never idle**: a full-screen 2D canvas (DPR ≤2) at 24 fps, 65-point polygons, style writes each frame, still running after the note is open | `components/IslandBottle.tsx:71` | **Med–high while the bottle is open.** The island is asleep. Pass 1 removed the grain fill but not the loop. | Yes: the sea stops moving after N s (or once the note is open) | Rest the waves after ~6 s without input, or once the quote shows (`useSceneryRest`-style freeze on a settled frame). | Low |
| F10 | **Onboarding runs over the live island.** Step 0: a second WebGL context (CharacterPreview, DPR 2, shadows). Step 3: a 100 ms `setInterval` sets new state each tick, and a `200vmax` box-shadow spotlight is re-positioned with left/top. Steps 1–5: a 350 ms interval does `querySelectorAll` + `getBoundingClientRect` + setState (a forced layout 3×/s). | `components/Town.tsx` `paused=…&&!onboardingRef` (~l.662); `components/IslandOnboarding.tsx:32,39,62,67`; `IslandOnboarding.module.css:44` | **Med**, first run only (**high** at step 0: two GL contexts) | Slightly: island ambience freezes behind step 0 | Pause the island during step 0. Set state only on change. Move the spotlight with `translate`. | Low |
| F11 | **`FieldTranscript` 2 Hz poll runs while the panel is closed**, for the whole watch session (a new `LiveMatchView` object means a re-render every 500 ms) | `components/FieldTranscript.tsx:24`; always rendered at `FieldLearning.tsx:97` | **Low–med** (listed as 2 Hz in pass 1; that it also runs while closed is new) | No | Gate the effect on `mounted`/`open`, and compare the score/event count before `setMatch`. | None |
| F12 | **Teaching markings and cues are rebuilt from scratch each frame**: `triangle()` spreads colour arrays, and `line`/`arrow`/`dashedLine`/`outline` allocate 2–4 `Vector3` per segment. Label placement runs a 9-candidate penalty search each frame. The pose sampling builds new Maps and Sets. | `teachingGround.ts:9-13`; `lessonCues.ts:51-60,125-135`; `teachingMotion.ts:49,52`; `fieldRuntime.ts:70,98-100,223` | **Med** (teaching only): thousands of short-lived objects per frame | No | Write scalars straight into the Float32Array and use scratch vectors. Cache markings and label placement per (lesson, step, beat), and redraw only the parts that move. | Low–med (label parity) |
| F13 | **Strikers joystick** writes `--stick` and calls `getBoundingClientRect` on every pointermove (60–120 Hz style work over a 30 fps game). It also re-renders its HUD at 10 Hz and writes `canvas.dataset.frames` every frame. | `components/LiveArcadeMatch.tsx:41-44,52` | **Med** during Strikers | No (the thumb moves at 30 fps) | Apply the pass 3 fix: coalesce the thumb paint into the game frame and cache the rect on pointerdown. `setView` only on change; drop `data-frames` outside tests. | Low |
| F14 | **Field card pulse animates `box-shadow`** (a paint every frame) while awake | `app/globals.css:465-467` | **Med while awake**; rests after 6 s (`globals.css:626`), hidden in the watch view | No | Put the glow on a `::after` and animate its opacity. | Low |
| F15 | **The Paths icon swap animates `filter: blur`** on three spans (paints on WebKit) | `components/IslandSettings.module.css:257-263` | **Low–med** while the HUD is awake | Slightly (crossfade without blur) | Opacity/scale crossfade only. | Low |
| F16 | Arcade stage `dispose()` without `forceContextLoss()` | `lib/arcade/arcadeStage.ts` (~l.10) | **Low** (memory until GC). Already listed as not safe in the shared stage (pass 1). | No | Only where the canvas is created fresh. | Med |
| F17 | Every hum and oscillator is stopped properly except the jetpack hum, which runs while hovering still in flight (by design) | `islandSound.ts:124` | Low | Yes (silence while hovering) | Stop it after 1 s at speed < 0.3 without input. | Low |
| F18 | Mini-game AudioContexts are not suspended on pause or hide. Pinball's `playClick` creates a new context per click. | `LiveArcadeMatch.tsx:18,30`, `ArcadeGame3D.tsx:20`, `PassPuzzleGame.tsx:48`, `lib/games/sound.ts:6` | Low | No | `suspend()` on pause and blur; reuse one context. | Low |
| F19 | Knockout arena: `computeBoundingSphere()` on every visible batch mesh every frame (walks every instance), plus a motion literal and closure per rig, whenever the arena is within 120 m and on screen | `lib/graphics/liveKnockout.ts:57,60` | Low–med near the arena | No | Assign one arena-sized sphere once; reuse the motion object. | Low |
| F20 | Ball-flight ghosts: 14 separate transparent meshes per field, drawn during every pass | `lib/graphics/ballEffects.ts:8,21` | Low–med (up to +15 draws on a 17–24-draw watch frame, while the ball flies) | No | One InstancedMesh. | Low |
| F21 | Bean hair and hat geometries hold every style and collapse the unused ones in the vertex shader; the hat does this in the shadow pass too | `lib/graphics/beanSkin.ts:~795-858,897` | Low–med vertex work | No / hat shadow | Split by style group, or no hat shadow. | Low |
| F22 | Small per-frame allocations. In `Town.tsx` `animate`: `buildingTargets` and `entries` array literals each frame, a `[…].join(':')` key each learning frame, `new Vector3` while hovering an NPC. In lib: bean `sync()` 2 `Vector3` per rig (`beanSkin.ts:928,930`), sim target objects and Sets per step (`matchSim.ts:2279,2344,2572`), NPC/traffic literals, quiz-label `new RegExp` (`fieldRuntime.ts:218`). | as listed | Low (pass 2: GC 1.9 ms/s, not measurable) | No | Hoist and reuse objects when touching these files. | None |
| F23 | `liveFrame.sync` runs for all 4 fields every frame, even when the sim did not step | `lib/town/fieldRuntime.ts:83` | Low | No | Only when `matchDt>0`, or when a field becomes visible. | Low |
| F24 | Canvas `style.cursor` written 1–3× per frame; debug `dataset` writes per frame (ArcadeGame3D:48, PassPuzzle:92, LiveArcade:41, CardFilmPlayer:74, IslandBottle `swell`) | `Town.tsx` ~l.788/927/931 | Low (same-value writes; `dataset` writes do invalidate style) | No | Write on change; drop the debug attributes in production. | None |
| F25 | Dead code that would be expensive if re-wired: `Pitch.tsx`/`Academy.tsx` (uncapped rAF, `high-performance`), the Babylon `BreakawayRun`/`SoccerPinballGame`/`SoccerTennisGame` (and their backdrop blurs), `lib/usePhoneController.ts` (100 ms interval + LAN fetch), `.town-vignette`/`.town-overlay` CSS, a hidden 1536-float `LineSegments` (`fieldRuntime.ts:50,281`) | — | None today | — | Delete, or leave with a note. | None |

**Checked and fine (no action):**
- No polling. `island-news`/`island-clips` are fetched only when a conversation or card highlights open (5 min client cache).
- No service worker, analytics, IndexedDB or EventSource.
- No GLB or texture downloads for the island; everything is procedural. The largest runtime textures are the 1120×640 face atlas and canvases ≤768 px, plus the 2048² shadow map.
- No `decodeAudioData`.
- No JSON parsing or deep cloning on per-frame paths.
- Canvas textures repaint only on events.
- `:has()` rules toggle only on open, mount and rest (writes are change-guarded, field cards checked at 10 Hz).
- `will-change` is not misused over the canvas.
- No mix-blend or grain layer over the island.
- Every WebGL canvas outside Town sleeps and disposes.
- `frustumCulled=false` is justified everywhere (hidden or empty pools, and playerBatch culls per rig).
- Static scenery is merged into chunks with `matrixAutoUpdate=false`.
- The 4 pitch spot lights leave the shader outside night (pass 2).
- The phone 30 fps slot cap holds.
- Fields that are hidden or far skip all rig work.

## 4. Big levers (mobile defaults with a visual trade-off)

Frozen-frame GPU per render: the same scene and camera rendered under each configuration, interleaved 5×12, with the Chromium/Metal timer on the Mac (`audit5/lever.mjs`, no CPU throttle). **This is emulation, not an iPhone.** The watch-view rows sit inside the timer noise (its "1.5" row equals the baseline yet reads +22%).

| Configuration | Pitch-side idle (town camera, base DPR 2) | Spawn hover (base DPR 2) | Watch view 11v11 (base DPR 1.5) |
|---|---|---|---|
| Current | 3.01 ms | 4.07 ms | 1.47 ms |
| DPR 1.5 | −22% | −21% | (= current; noise ±20%) |
| DPR 1.25 | −32% | −28% | −7% |
| DPR 1.0 | −41% | −32% | −14% |
| PCF instead of PCF-soft | −1% | −1% | noise |
| Shadow map 1024² | −33% | −15% | −7% |
| No shadows | −23% | −32% | −18% |
| DPR 1.5 + 1024² + PCF | −24% | −32% | −7% |

- **L1. 30 fps cap everywhere.** Phones are already capped at 30 (`frameCapSlot`). Only desktop and fine-pointer tablets run uncapped. On iPhone this lever is **already on**. Pass 4 tier 1 extends it to every device. Trade-off: none on phones.
- **L2. Max DPR 1.5 on phones at all times** (or 1.25). This is the largest single steady GPU cut for the "standing still / pitch-side" case: about −21% at 1.5 and about −30% at 1.25, frozen frame. The watch view is already at 1.5. Trade-off: the 0.5 s "sharpen when still" goes away. Edges, pitch lines, sign text and shirt numbers look noticeably softer on a 460 ppi screen when still, most at 1.25. Pass 4 tier 1 does this only after the governor detects a slowdown. Because the governor reacts to throttling, the phone is already hot by the time it acts; a default would prevent the heat instead.
- **L3. Cheaper shadows.** 1024² saves −15% to −33%. The cost, per pass 3's visual review: diagonal acne stripes on flat roofs, softer bench and balcony shadows, blurrier lampposts and palms. Refreshing every 2nd frame (pass 4 tier 2) roughly halves the shadow pass. The cost: shadows under moving players and cars step at 15 Hz, so they visibly lag the feet a little when running. PCF-soft → PCF buys nothing (−1%), so don't bother. Blob shadows for characters with baked static shadows would be the real cheap technique, but that is a large project and changes the look.
- **L4. Lambert instead of Standard.** 930 visible meshes use `MeshStandardMaterial` (the scene census). No Lambert, Toon or Physical is used. Pass 2 measured "not measurable to −16%" and was inconsistent. Trade-off: flatter shading, and highlights and roughness cues are lost; the bean body shader extends Standard, so it would need its own port. **Not recommended without a real-device measurement**; on this evidence it is the weakest lever.
- **L5. Fewer ambient NPCs and cars on phones.** CPU: `islandNpcs.update` about 42–52 ms/s and `canTravel`/`isWalkable` about 17 ms/s at 4× even when idle (pass 4 profile). GPU: townsfolk are the bulk of town colour and depth draws. Pass 4 tier 3 stops drawing NPCs beyond 40 m and traffic beyond 60 m, but their routines still run. Trade-off: an emptier-looking town from the high camera; distant life disappears. Halving the population would also cut the CPU.
- **L6. Pause off-camera match sims entirely.** Today, 3 unseen matches step every 100 ms, with choreo/combo/ball bookkeeping for all 4 fields every frame. That is cheap: `matchSim` is about 16–23 ms/s at 4×. Freezing them saves a little CPU. The trade-off is that the scores and positions of the other fields freeze while unseen and then jump or resume. Low value; not recommended ahead of L2 and L3.
- **Also possible:** `antialias:false` on phones when DPR ≥1.5. It needs a context re-create, and can't be A/B'd at runtime here. The trade-off is jaggies on pitch lines, poles and outlines. Tile GPUs resolve MSAA on-chip, so the gain is uncertain.

## 5. Already done (do not redo)

- **Heat pass 1** (Sep 25): bottle grain as a static CSS layer; the bottle loop stops with its dialog; covered Paths art rests; HUD loops pause under Strikers; HUD loops and the field-card pulse rest 6 s after input; no field-card backdrop blur; card-offer stars rest; no lesson-beat timer without a lesson.
- **Heat pass 2** (Sep 25): pitch spot pool out of the shader by day; dynamic shadow-caster culling; rooftop landing index; **dynamic resolution (1.5 moving, sharp after 0.5 s still)**.
- **Heat pass 3** (Sep 26): HUD loops rest while steering (`hudHold`); the minimap moves on island frames; joystick thumb coalesced; transcript panel without blur; backdrop-filter allowlist test. Rejected as not indistinguishable: 20 fps idle, pose LOD, 1024² shadows.
- **Phone 30 fps slot cap** (`lib/town/frameCap.ts`).
- **Island sleep** under every menu, quiz (waiting and after the replay), draw-the-pass aim, card offer and video.
- **Hidden and far fields** skip rig work; distant matches use the 100 ms match clock.
- **Offscreen NPC posing skipped**; traffic yielding checks at 10 Hz when far.
- **Static chunks, shadow batching, shadow-volume culling, hidden-transform gate**; mobile framebuffer shadow cache **rejected**; 25 m chunks **rejected**.
- **Bean skin**: 4 draws per character; pose rows ~18 KB/frame. Partial texture uploads need a three upgrade.
- **Card films**: 24 fps; DPR 2 stepping to 1.5; memoised portrait; stable caption nodes; riso engine fast paths; tiles shared.
- **Card and binder**: live scenery composited and resting; prebuilt page turn; tilt without repaint; no viewer blur.
- **Audio**: no ocean loop; no idle clicks; hums fade and stop; zero volume stops sources.
- **In progress, heat pass 4**: `ThermalGovernor` tiers 0–3 (30 fps everywhere, DPR ≤1.5, then 1.25, shadows every 2nd or 3rd frame at 1024², NPC/traffic draw distance, static water) and a Battery saver setting. Tier 0 changes nothing, so L2 and L3 only take effect after a slowdown or by opt-in.

## 6. Suggested order for the lead

1. **Pixel-identical, low risk, do now:** F4 (update ranges), F3 (radar solid background and island-frame markers), F11 (transcript poll gate), F7 (canvas in `HUD_HOLD_SELECTOR`), F13 (Strikers thumb). None of these changes the look.
2. **Audio idle** (F5, F6): suspend a silent context, and a music idle pause or watch-view duck. Needs a product nod for the music.
3. **Scene-specific loops**: F9 (bottle rest), F10 (onboarding), F14 and F15 (compositor-only HUD loops).
4. **CPU, medium effort**: F8 (batch walk of hidden classic meshes), F12 (teaching rebuild).
5. **User decision on the defaults**: L2 (DPR 1.5 always on phones) is the lever with the best measured ratio; then L3. Present both with the pass 3 comparison sheets.
6. **Real-device check before any thermal claim**: a 5-minute Safari Web Inspector timeline on the iPhone, standing pitch-side and in the watch view, day, music on/off, before and after.
