# Arcade AAA rebuild: builder handoff (foundation, Nov 10 2026)

Goal: each of the five arcade games gets its own visual and audio identity. Only the back-to-arcade button stays common.
The foundation pass changed structure only: every game looks and plays as before, but now owns disjoint files.

## 1. Who owns what

**Current room (Nov 10 2026 touch-up): six games, one comic-print house style** (`components/games/comic/*` HUD kit,
`lib/arcade/comic/*` shading kit; this supersedes "own identity per game"). Kit Rush (`kitrush`), Squad Snake (`snake`),
Breakaway Run (`runner`), Futbol Tennis (`tennis`), Futbol Pinball (`pinball`), Pass Puzzles (`puzzle`). Deep links:
`/arcade?game=<id>`. **Island Strikers (`live`) is retired from the arcade room; its code stays** (row kept below for reference).
The two games added after the foundation pass are 2D canvas games with their own React shells:

| Game (id) | Look + skin | Shell / view / audio | Rules |
|---|---|---|---|
| Kit Rush (`kitrush`) | `components/games/skins/kitrush.module.css`, `KitRushGame.module.css` | `components/games/KitRushGame.tsx`, `KitRushScores.tsx`, `lib/arcade/kitrush/*` (view, audio) | `lib/arcade/kitrush/*` (core); `tests/kitrush-core.cjs`, `scripts/check-kitrush-browser.cjs` |
| Squad Snake (`snake`) | `components/games/skins/snake.module.css`, `SquadSnakeGame.module.css` | `components/games/SquadSnakeGame.tsx`, `SquadSnakeScores.tsx`, `lib/arcade/snake/*` (view, audio) | `lib/arcade/snake/*` (core); `tests/snake-core.cjs`, `scripts/check-snake-browser.cjs` |

Shared by all six (never restyle per game): the Arcade back button (its face is pinned on `.bar.bar` in
`components/arcade/ArcadeTopBar.module.css`; `tests/arcade-chrome-shared.cjs` asserts it), the results-first high-score strip and
entry (`components/arcade/HighScoreEntry.tsx`; a results card may host it with a `data-hs-slot` element, otherwise it docks
just under the score bar), the drawn board pictures (`components/arcade/BoardIcon.tsx`) and the comic turn-your-phone card
(`components/RotateLock.module.css`, scoped by `[data-arcade-kind]`).

One builder per game. Edit only your column. "Rules" files hold game logic/physics: leave them alone unless your brief says otherwise.

| Game (id) | Look + skin (yours) | Scene / runtime / audio / cards (yours) | Rules (do not restyle) |
|---|---|---|---|
| Island Strikers (`live`) | `lib/arcade/looks/strikers.ts`, `components/games/skins/strikers.module.css` | `lib/arcade/strikerScene.ts`, `strikerCinema.ts`, `strikerCelebrate.ts`, `strikerAudio.ts`, `components/LiveArcadeMatch.tsx` + `.module.css` | `lib/arcade/strikerMatch.ts`, `strikerTiers.ts`, `strikerCoach.ts` |
| Breakaway Run (`runner`) | `looks/runner.ts`, `skins/runner.module.css` | `lib/arcade/games/runnerGame3d.ts`, `lib/arcade/runnerFx.ts`, `runnerTrack.ts`, `runnerWeather.ts`, `runnerCinema.ts`, `runnerHud.ts`, `components/games/runnerAudio.ts`, `RunnerControls.*`, `RunnerMenu.*`, `RunnerMissionCard.*` | `lib/arcade/runnerGame.ts`, `runnerModes.ts`, `runnerMissions.ts`, `runnerCoach.ts`, `components/games/runnerPhysics.ts`, `runnerRoute.ts` |
| Futbol Tennis (`tennis`) | `looks/tennis.ts`, `skins/tennis.module.css` | `lib/arcade/games/tennisGame.ts`, `lib/arcade/tennisArena.ts`, `tennisCamera.ts`, `tennisCinema.ts`, `tennisPowerFx.ts`, `tennisBounceSpot.ts`, `tennisFirstTouch.ts`, `tennisAudio.ts`, `tennisFeel.ts` (juice + match-point/wind reads), `components/games/TennisCard.tsx`, `TennisCourtPicker.*` | `lib/games/soccerTennis.ts`, `tennisPower.ts` |
| Futbol Pinball (`pinball`) | `looks/pinball.ts`, `skins/pinball.module.css` | `lib/arcade/games/pinballGame.ts`, `lib/games/soccerPinballTableView.ts`, `soccerPinballFx.ts`, `soccerPinballCamera.ts`, `soccerPinballCinema.ts`, `soccerPinballHype.ts`, `soccerPinballCrew.ts`, `soccerPinballMerge.ts`, `soccerPinballAudio.ts`, `components/games/PinballCard.*` | `lib/games/soccerPinball.ts`, `soccerPinballFeel.ts`, `soccerPinballTable.ts`, `soccerPinballTiers.ts`, `soccerPinballPatterns.ts`, `soccerPinballMissions.ts` |
| Pass Puzzles (`puzzle`) | `looks/puzzle.ts`, `skins/puzzle.module.css` (comic house style: shares `lib/arcade/comic/*` and `components/games/comic/*` with the other comic games) | `lib/arcade/passPuzzleScene.ts`, `puzzleComic.ts` (was `puzzlePaper.ts`), `passPuzzleAudio.ts`, `components/games/PassPuzzleGame.tsx` + `.module.css` | `lib/passPuzzle/*` |

### Coordinator-only files (builders: read, never edit; ask the coordinator)

- `lib/arcade/arcadeGames.ts` (dispatcher only now), `arcadeGameTypes.ts` (`ArcadeKind`, `ArcadeInput`, `ArcadeHUD`)
- `lib/arcade/arcadeStage.ts`, `looks/stageLook.ts`, `looks/neonCabinet.ts`, `neonPalette.ts`, `neonSpill.ts`, `glassFloor.ts`
- `lib/arcade/islandArcadePlayer.ts`, `arcadePlayerMotion.ts` (the shared bean rigs), `arcadeFeedback.ts` (haptics + fallback tones)
- `components/games/ArcadeGame3D.tsx` + `ArcadeGame3D.module.css` (React shell of tennis, pinball and runner), `components/games/skins/index.ts`
- `components/arcade/*` (top bar with the back button, pause card, boards, results, `arcadeChrome.css`), wallet / leaderboard / records libs, `arcadeCatalog.ts`, `app/arcade/page.tsx`

## 2. The look seam (3D)

`createArcadeStage(canvas, look)` no longer hard-codes any appearance. `look: ArcadeStageLook` (`lib/arcade/looks/stageLook.ts`) carries:

```ts
id; renderer{antialias,powerPreference,pixelRatioCap{mobile,desktop},shadows,shadowType,toneMapping,exposure};
background; fog{color,near,far}; camera{fov,near,far}; hemi{sky,ground,intensity};
sun{color,intensity,position,shadowMapSize{mobile,desktop},frustum,normalBias,bias,radius};
surface{color(c),emissive(c),roughness,emissiveIntensity}; // every stage.box/sphere/cylinder/ring colour goes through this
ball{base,patch}; sparks{color}; environment(kit) => {scenery, dispose}
```

Each `looks/<game>.ts` is `{...NEON_CABINET_LOOK, id}` today, so all five still render the old neon cabinet. To diverge, override
fields in YOUR look file, or write your own `environment(kit)` there (ground + backdrop; `kit` gives `scene`, `mat`, `box`,
`sphere`, `cylinder`, `mobile`, `reduced`; return the group the stage exposes as `stage.scenery`). Copy from `neonCabinet.ts`,
`neonPalette.ts` or `glassFloor.ts` into your own files instead of editing them: the other four games still use them.
Everything game-specific in the scene (court, table, track, props, trails, camera beats) already lives in your scene/runtime file.

## 3. The skin seam (HUD)

Every game root now carries `data-game="<id>"` and the class from `components/games/skins/<game>.module.css` (`.skin`).
Write HUD restyles there as `.skin ...` rules. For tennis, pinball and runner the markup lives in the shared `ArcadeGame3D.tsx`,
whose own CSS module classes are hashed: target elements by their data attributes (`[data-pinball-hud]`, `[data-tennis-action]`,
`[data-runner-skill]`, `[data-arcade-kind]` ...) or tags, e.g. `.skin [data-pinball-pad]{...}`. The existing
`data-arcade-kind` attribute and the rules in `ArcadeGame3D.module.css` are pinned by tests: leave them, override from the skin.
Button font rule (AGENTS.md): no button text in IslandBrush; regular UI sans, weight 800.

## 4. Baseline budget (phone profile, headless Chrome, production build)

Viewport 390x844 touch, device DPR 3 (the stage clamps to 1.5), measured during live play. Runner and Strikers force landscape
(844x390). Counts are per rendered frame at the GL level, so they include the shadow pass. `cpu` is JS time between the first and
last draw call of a frame on an M-series Mac: a relative number, not a phone frame time. All games are capped at 30 fps in play
and render nothing on their menus.

| Game | Canvas | Draw calls (median / max) | Triangles (median / max) | Live GL textures | cpu ms |
|---|---|---|---|---|---|
| Strikers | 1266x504 | 178 / 188 | 127.5k / 128.4k | 9 | 1.8 |
| Breakaway Run | 1266x585 | 56-59 / 64 | 45-48k / 54k | 11 | 1.2 |
| Futbol Tennis | 585x1266 | 62 / 66 | 29.7k / 30.0k | 12 | 1.2 |
| Futbol Pinball | 585x1266 | 93 / 95 in open play; 106 / 107 during a goal beat | 34.6k; 48k during a goal beat | 11-12 | 1.4 |
| Pass Puzzles | 585x1266 | 95 / 95 | 63.9k / 63.9k | 15 | 1.5 (on-demand: 4 frames in 5 s idle) |

The foundation split was A/B checked against the old single factory with these counts (identical for tennis, pinball, runner).
Re-measure with `scripts/measure-arcade-games.cjs` (see its header). Stay near these numbers; a richer look should pay for itself
by merging or instancing, not by adding passes.

## 5. Heat rules that apply (AGENTS.md, quoted)

> "For every feature and change, keeping phone heat down is a primary concern. Prefer on-demand loading, bounded work, shared
> assets, cached requests and sleeping off-screen or inactive content. Avoid background polling, autoplay, unnecessary animation
> loops and simultaneous video players. Preserve visual quality and responsive controls; document added runtime costs and
> validate relevant performance behavior. Do not claim reduced iPhone temperature without real-device evidence."

> "Before changing rendering, movement, traffic, effects, audio, mobile controls, maps or previews, read the performance
> reference (docs/performance-guide.md). Preserve its implemented optimizations and interaction guarantees..."

> "Everything we add or change should have the intention of teaching the game of football."

In practice for the arcade: keep `powerPreference:'low-power'`, the 1.5 mobile pixel-ratio cap, one shadow-casting sun, no
postprocessing chain, `needsFrames()` sleeping (menus draw 0 frames), the 30 fps cap, pooled particles, reduced-motion paths,
and dispose everything you create (`stage.dispose()` walks the scene; anything outside it is yours to free).

## 6. Running one game

- Direct URLs: `/arcade?game=live | runner | tennis | pinball | puzzle` (plain `/arcade` is the hub room).
- Orientation on a phone profile: Strikers and Breakaway are landscape-only, Tennis, Pinball and Pass Puzzles are upright. In the
  wrong orientation a full-screen "turn your phone" overlay covers the game and automated clicks land on "Back to arcade".
- Every arcade game is free to play (owner, Nov 11 2026: ARCADE_PLAY_COST=0); plays still earn coins. Dev builds on localhost: open `/play?preview=all&testCoins=50000` once.
  Headless: seed `localStorage['fi2-arcade-wallet-v1']` (see the measure script).
- Agents: own port and `NEXT_DIST_DIR=.next-agent-<name>`; never port 8092 or `.next-dev`. Next adds your dist dir to
  `tsconfig.json` `include`: remove that line when you finish.
- Debug hooks (dev only): `window.__arcade3d` (`runtime.stage.renderer.info`, `runtime.state`), `window.__fi2Live`, `window.__passPuzzle`.

## 7. Tests

One test: `node -r ./scripts/test-ts-cache.cjs tests/<name>.cjs` (plain `node tests/<name>.cjs` also works; `.mjs` tests run with plain `node`). Whole suite: `npm run test:quiet`; a subset: `npm run test:quiet -- tennis pinball`.
Many tests grep source text, so they pin exact snippets of the dense one-line style: keep the formatting, and when you move
code, move the test's path/grep with it rather than deleting the expectation.

- Strikers: `tests/striker-*`, `strikers-*`, `live-*`; browser: `scripts/check-island-strikers-browser.cjs`
- Breakaway: `tests/runner-*`, `breakaway-*`; browser: `scripts/check-breakaway-browser.cjs`
- Tennis: `tests/tennis-*`; browser: `scripts/check-soccer-tennis-browser.cjs`
- Pinball: `tests/pinball-*`, `scripts/check-soccer-pinball.mjs`; browser: `scripts/check-soccer-pinball-browser.cjs`
- Pass Puzzles: `tests/pass-puzzle-*`, `puzzle-polish-nov8`
- Shared (run these too): `tests/arcade-*` (stage dispose, chrome, consistency, results, start card)

## 8. Traps

1. **Dev server + tennis/pinball/runner: "The pitch couldn't load."** `reactStrictMode` mounts `ArcadeGame3D`'s effect twice in
   dev; the first cleanup calls `stage.dispose()` → `renderer.forceContextLoss()` (added Nov 10), and the second mount then gets
   a dead WebGL context on the same canvas (`Cannot read properties of null (reading 'precision')`, swallowed by the catch).
   Production is fine. Until the coordinator fixes this in `ArcadeGame3D.tsx`/`arcadeStage.ts`, test those three games against a
   production build (`NEXT_DIST_DIR=... next build && next start -p <port>`). Strikers and Pass Puzzles work in dev.
2. `next build` ran out of heap in the type-check step on this 16 GB Mac; `NODE_OPTIONS=--max-old-space-size=6144` fixed it.
3. `ArcadeGame3D.tsx` reads `game.state.tennis`, `.pinball` and `.runner` for every kind, so each of the three runtimes still
   builds idle rule states for the other two and returns the same object shape. Do not drop those fields.
4. `stage.fit(width, length, runner, tennis, pinball)` in `arcadeStage.ts` still holds the per-game camera framing constants
   (HUD margins, tilt). Changing framing is a coordinator edit; camera beats and follow cams are in your own files.
5. `PassPuzzleGame.tsx` also uses the `.game` class from `ArcadeGame3D.module.css`. `strikerScene.ts` imports `neonColor`
   directly. All five scenes call `createGlassFloor` (shared): replace the call in your scene, do not edit the module.
6. `tests/tennis-hold-power.cjs` fails if it finishes in under 150 ms (a haptics rate limit that starts at time 0), which
   happens with a warm `-r ./scripts/test-ts-cache.cjs` preload. Run it plain. `tests/gashapon-viewer.cjs` is flaky under load.
7. `tests/strikers-portrait-tip.cjs` assumes fov 38 for Strikers: if the Strikers look changes fov, update that test's maths.
8. The split runtime files keep a few harmless leftovers from the mechanical split (double parentheses, comments that mention
   the other games). Tidy only inside your own file.

## 9. Not done in the foundation pass

- `ArcadeGame3D.tsx` (HUD markup, controls, sound routing for three games) is still one shared component. Skins cover styling;
  markup or sound-routing changes for tennis/pinball/runner must go through the coordinator, one at a time.
- No per-game audio seam was added: tennis, pinball, runner, Strikers and puzzles already have their own audio modules (listed
  above); only `arcadeFeedback.ts` (haptics + small fallback tones) is shared.
- Goal-net colour and the `stage.goal()` / `stage.ring()` shapes are still fixed in `arcadeStage.ts`.
