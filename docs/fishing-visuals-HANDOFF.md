# Fishing visuals: hand-off to Astra

Written 27 Sep 2026. Local only: nothing has been committed or deployed.

The fishing mechanics are finished and tested. The in-world art is **placeholder**: a simple rod and line, a float, ring splashes, oval shadows, a held-up blob fish and a foam band. Astra owns the final look. All of it sits behind one module, so you can replace the art without touching the game logic.

The framing target is the user's reference, copied to [`docs/fishing-visuals-ref.png`](fishing-visuals-ref.png):
- a low, close camera along the shore;
- the angler at the water's edge in the upper-left third, rod in hand;
- the float out on the water with ripples, and a dark fish shadow below the surface;
- layered water with a lacy foam edge at the shoreline.

This file is original art only: no Nintendo assets, names, sounds or UI copy.

## What you own

| File | Owner | Notes |
| --- | --- | --- |
| `lib/town/fishing/fishingVisuals.ts` | **Astra** | Every fishing mesh, material, texture and animation. Replace it freely, but keep the `FishingVisuals` interface and the behaviour contract below. |
| New helper files for visuals (textures, shaders, GLBs under `public/`) | **Astra** | Import them only from `fishingVisuals.ts`. |
| `components/FishingHost.module.css` | Shared | The HUD and catch-label look. You may restyle it; keep the class names and the no-blur rule. |
| `lib/town/fishing/fishingCore.ts` | Fishing (mechanics) | **Do not touch.** The state machine, timings, catch roll, cast point and shadow spawn. |
| `lib/town/fishing/fishingSession.ts`, `fishingStore.ts` | Fishing | **Do not touch.** The HUD bridge, Fishbook, basket landing and sound cues. |
| `lib/town/fishing/fishingWorld.ts` | Fishing | **Do not touch.** The driver maps the state machine to your interface, handles the visuals lifecycle, and holds the posts, glows and prompts. |
| `lib/town/fishing/fishingCamera.ts` | Fishing | **Do not touch the code.** Ask if the framing numbers need to change; they're described below. |
| `lib/town/fishing/fishCatalog.ts` | Fishing | Species data, club facts, lessons and spots. `color`, `belly`, `shape` and `shadow` are there for you to read. |
| `components/FishingHost.tsx`, `Fishbook.tsx`, `FishArt.tsx` | Fishing | The HUD logic and Fishbook. `FishArt.tsx` is the 2D Fishbook art; you can redraw it, keeping the props `{fish, hidden, size}`. |
| `components/MarketStand.tsx`, `lib/town/market/*` | Fishing / jobs / sell-shop | **Do not touch**: economy and market. |
| `components/Town.tsx` fishing hooks | Shared file | **Do not touch** these lines: `createFishingWorld(scene,player.root,fishingSession)`, `fishing.applyCamera(...)`, `fishing.update({...})`, `fishing.dispose()`, `<FishingHost .../>`, and `fishingOpen` / `fishingDialog`. |

## The interface (`FishingVisuals` in `lib/town/fishing/fishingVisuals.ts`)

`createFishingVisuals(scene, player)` returns an object with the members below.

**Lifecycle**
- **`begin(stand, cast, dir)`**: a session starts.
  - `stand` is the angler's position; `cast` is the world point where the float lands. Both are `{x,z}`.
  - `dir` is the unit casting direction, stand → water.
  - Show the rod, line and float.
- **`end()`**: the session ends. Hide the session props; the rings may finish fading.
- **`frame(dt, elapsed, reduced)`**: per-frame animation. It is called **only while `busy` is true**.
  - `dt` is in seconds and clamped; `elapsed` is the island clock.
  - When `reduced` is true (reduced motion), avoid decorative motion.
- **`busy`** (read-only): true while a session is active or effects are still fading. When it is false, you get no `frame()` calls.
- **`dispose()`**: free every geometry, material and texture.

**Driven every frame of a session** (idempotent; set the same value every frame)
- **`setPose(pose)`** sets the angler's arm and rod pose:
  - `'hold'`: waiting or nibbles;
  - `'windup'`: the first 0.25 s of the cast;
  - `'cast'`: the rest of the cast;
  - `'strike'`: the bite window;
  - `'holdUp'`: showing the catch. The rod is hidden and both arms are up.
- **`setBobber(state)`** sets where the float is:
  - `{kind:'hanging'}`: at the rod tip, before the cast;
  - `{kind:'flying', progress}`: in the cast arc, with `progress` going from 0 to 1 over `CAST_TIME` = 0.7 s;
  - `{kind:'floating'}`: on the water at `cast`;
  - `{kind:'under'}`: pulled under during the bite;
  - `{kind:'hidden'}`: after the catch.
- **`showShadow({size, pos, heading, alpha} | null)`** draws the fish shadow, or hides it with `null`:
  - `size`: `'small' | 'medium' | 'large' | 'huge'`. The lengths are `SHADOW_LENGTH` in `fishCatalog.ts`: 0.45, 0.7, 1.0 and 1.45 m.
  - `pos`: `{x,z}` relative to the float.
  - `heading`: a yaw, with the fish facing the float while it approaches.
  - `alpha`: 0..1. It fades in on approach and out when the fish flees.
- **`holdUpFish({color, lengthCm} | null)`**: the caught fish held above the head. The species is in `fishCatalog`, but you get the colour and the length in cm.
- **`setCoastVisible(visible)`**: the shoreline foam and ripples near the spots. It is true within 45 m of a spot or while fishing.

**One-shot beats** (called once, on the event)
- **`splash('land')`**: the float lands, 0.7 s after the cast.
- **`nibble()`**: each nibble. Make it a small bob plus a ripple, and keep it short (about 0.25 s).
- **`splash('bite')`**: the real bite. It's the moment to react, so it must read instantly: a big splash, with the float going under.
- **`splash('hook')`**: the player tapped in time.
- **`splash('small')`**: the fish was scared (tapped too early) or escaped (tapped too late).

**For the HUD**
- **`labelAnchor(out)`**: the world point for the floating catch label, above the angler's head. The driver projects it; the label is placed to the right of that point on wide screens, and at the top on narrow phones.

## Events and timings the visuals must respond to

These come from `fishingCore.ts` and are fixed by the mechanics tests:

| Beat | When | Visual |
| --- | --- | --- |
| Cast | Tap (automatic when the camera arrives) | `windup` then `cast`; float `flying` for 0.7 s, then `splash('land')` |
| Waiting | 1.2–3.5 s (1.5–3.8 s after a scare or escape) | float `floating` with a gentle idle bob |
| Shadow appears | `notice` | `showShadow` fades in 1.9–3.2 m along the shore and swims at 0.9, 1.0, 1.2 or 1.5 m/s by rarity |
| Nibbles | 1–4 (legendary 2–4); 0.7–1.3 s apart (legendary 0.45–0.9 s); the first 0.6 s after arrival | `nibble()` each time |
| Bite | After the last nibble | `splash('bite')`, float `under`, pose `strike`; the window is 1.0, 0.9, 0.8 or 0.7 s, plus 0.35 s with reduced motion |
| Hooked | Tap within the window | `splash('hook')`, pose `holdUp`, float `hidden`, `holdUpFish(...)` |
| Scared / escaped | Tap early / no tap | `splash('small')`; the shadow flees (alpha → 0 over 1.3 s) |
| Idle reel-in | 3 escapes with no tap | float `hanging` (phase `ready`) |
| End | Stop, Escape, walking 1.3 m away, flying, a lesson | `end()`; the camera eases out over 0.8 s |

**Camera** (`fishingCamera.ts`, not yours to change, for reference)
- It orbits in over 0.9 s and out over 0.8 s.
- Landscape and desktop: from out over the water and to the side, looking back at the angler.
- Portrait (aspect below 1): straight back along the line, from further and higher.
- The sea sits at y = −0.43. Draw water-surface decals at about y −0.40 to −0.395, with `depthWrite:false` and double-sided. The placeholders use −0.398.

## Constraints

- **Phone heat is a primary requirement** (AGENTS.md, `docs/performance-guide.md`).
  - Create only while fishing or near a spot. The driver already creates your module lazily and disposes it at 80 m; don't allocate at import time.
  - No idle loops and no timers. Animate only in `frame()`, which is called only while `busy`.
  - Merge static meshes, and share materials and textures.
  - Never add a `backdrop-filter` blur over the canvas. `tests/heat-pass3.cjs` fails on any blur in a component CSS module.
  - Don't change the global sea material. Shoreline effects stay local to the spots.
- **Readable at 390×844 portrait and 1280×800.**
  - The bite must be obvious on a small phone.
  - The shadow must be visible against the sea colour.
  - Keep effects clear of the HUD corners, the Reel button (bottom-left on phones, bottom-centre on desktop) and the minimap (bottom-right).
- **Original art only.** No Nintendo art, sounds, names or UI copy.
- **Keep the island's look.** Use the low-poly palette of `lib/town/world.ts` and the colours in `fishCatalog`.

## How to test

- **Mechanics:**
  - `node tests/fishing.cjs` checks timing, nibbles, windows, scared, escaped, idle reel-in, the session bridge, the Fishbook, market selling and the soft cap. It also asserts that `fishingVisuals.ts` has no game logic and no timers.
  - `node tests/heat-pass3.cjs` checks for blur, and `npx tsc --noEmit` type-checks. Also run `npm test`.
- **Jump to a spot.** Open `http://localhost:8092/?from=arcade` with this in sessionStorage:
  `sessionStorage.setItem('fi2-arcade-departure-v1', JSON.stringify({version:1,x:-94.5,z:24,yaw:0,ride:'walk',flightHeight:0}))`.
  Spot stand points:
  - West Cove: (−94.5, 24)
  - South Pier: (217, 211.4)
  - Lifebuoy Point: (63, 211.4)
  - Harbour Wall: (236, 66)
  - North Rocks: (60, −237)
- **Scripted flow with screenshots.** `node scripts/check-fishing-browser.cjs <desktop|mobile|landscape> <spot>` (shots go to `$FISHING_SHOTS`, default `$TMPDIR/fishing-ac/`). It opens the spot, taps Fish, and waits for `data-phase` on `[data-fishing-hud]`: `floating`, `approach`, `nibble`, `bite` (then taps Reel), `caught`, and Stop. It shoots each beat. The phases are exposed on `[data-fishing-hud][data-phase]` and `[data-fish-reel][data-phase]`.
- **Look at the result yourself** at both sizes, in portrait and landscape, and compare it with `docs/fishing-visuals-ref.png`.
- **The dev server is `:8092`.** Don't restart it; the user watches it live. Check that it compiles after each edit.
