# Device testing (iPhone, iPad, Android, desktop)

Two layers catch phone/tablet bugs before a deploy. A third, manual, layer covers what only a real iOS device shows.

| Layer | Command | Time | What it catches |
|---|---|---|---|
| Static guard tests | `npm test` (runs `node tests/device-guards.cjs`) | ~3 s | CSS/TSX patterns that break on iOS: long-press callout, stale `100dvh`, small tap targets, input zoom, safe areas |
| Playwright device suite | `npm run test:devices` / `npm run test:devices:ios` | ~15–25 min for all 6 projects | Real layout and input flows on WebKit and Chromium device profiles |
| Manual check | real iPhone + iPad (checklist below) | ~10 min | iOS system UI that no emulator has |

## 1. Static guard tests: `tests/device-guards.cjs`

It parses every CSS file in `app/` and `components/` (media queries evaluated for iPhone SE/15 and iPad, portrait and landscape, with a coarse pointer and no hover) and the TSX with the TypeScript compiler. It follows `className` (CSS modules and global classes), JSX ancestors and the places each component is used. The checks are:

0. **Invalid selectors.** A rule the browser would drop entirely, for example text left outside a `/* comment */`.
1. **Long-press callout and selection.** Every game control and canvas needs `-webkit-touch-callout:none` and `user-select:none`, on its own class or on an ancestor rule. The controls are found by pattern, not from a list, so new ones are covered: `<canvas>`, `onPointerDown` with a hold (pointer-up/cancel, `setPointerCapture`, hold/charge, a `preventDefault` press), spread pointer props (`{...hold(0)}`), and refs that get a canvas appended or pointer/touch listeners attached. `--verbose` lists everything it found.
2. **Stale `100dvh` overlays.** It fails when a fixed/absolute full-screen layer has 100vh/dvh/svh as its only height source, with no `inset:0` or top+bottom. **2b** (also an error) flags a viewport-unit `height` next to an inset when it is the height that wins on a touch device after the whole cascade. The box is then over-constrained, CSS ignores `bottom`, and a stale dvh still decides the height (this was bug b). A module's `height:100dvh` that the global phone rule `dialog[open]{height:auto!important}` overrides does not count.
3. **Tap targets of at least 44×44 px**, where the cascade gives a static width/height/min-* (importance, specificity and source order are resolved per device). An invisible hit area counts too: an absolutely positioned `::before`/`::after` with a negative `inset` on the button. Buttons sized by content are counted as "not static"; `--verbose` lists them.
4. **Text inputs at 16px or more**, including an inherited size and the ~13px form default when no size is set.
5. **`viewport-fit=cover`** in `app/layout.tsx`, and `env(safe-area-inset-*)` on fixed top and bottom bars (including through custom properties such as `--control-bottom`).
6. **Hover-only reveals** (a warning): `:hover` rules that show content without a `:focus-visible`, `:focus-within`, `:active` or state-class twin.
7. **`user-scalable=no` / `maximum-scale=1`** in the same route as a small input (a warning).

Each failure prints the file:line, the selector or element, why it breaks and how to fix it. Intentional exceptions and known bugs live in `tests/device-guards.allowlist.json`, matched by `{check, file, key}` (the key allows `*`). Each entry needs a `reason`. `bug:true` marks a real violation waiting for a fix; these are summarised on every run. Remove the entry once the fix lands; unmatched entries are reported as stale. Flags: `--verbose`, `--json out.json`.

## 2. Playwright device suite: `tests/e2e/`

Config: `playwright.config.ts`. It uses the dev server at `http://localhost:8092`: a running server is reused (never restarted); if none is running, `npm run dev` is started. `FI_URL=https://…` points it at another build. The suite blocks the HMR websocket, so edits made by other agents don't reload the page mid-test.

Projects: `iphone-se` (iPhone SE 3rd gen), `iphone-15`, `ipad-gen7`, `ipad-pro-11` (WebKit); `pixel-7` (Chromium); `desktop-chromium` (1280×800).

```
npm run test:devices                          # everything
npm run test:devices:ios                      # WebKit phones/tablets only
npx playwright test --project=pixel-7 tests/e2e/cards.spec.ts
npx playwright show-report test-results/devices-report
```

| Spec | Covers |
|---|---|
| `island.spec.ts` | Boots with no console or page errors. HUD controls (Paths, Settings, travel, map, Shoot, juggle, joystick, minimap) are visible, inside the viewport and not overlapping. A 1 s press-and-hold on Shoot (walk mode) shows the charge, then fires; there is no allowed `contextmenu`, no text selection, and the callout/user-select guards are in the computed style. Long presses on the 3D view and joystick. Portrait → landscape → portrait with no overflow. |
| `paths.spec.ts` | Paths reaches the viewport bottom (±1px), including while the viewport height grows and shrinks like the Safari toolbar. **Stale-dvh simulation**: every dvh/vh length in the stylesheets is rewritten to `innerHeight − 80px`, as after a toolbar collapse, and Paths must still reach the bottom. Bottle open/close. A ball-hunt lesson card stepped to "Got it". A play stepped to "Quiz Yourself", then the quiz answered by tapping the marked routes on the 3D pitch. The tap points come from the app's own picker (`games.pickQuiz`) and are hit-tested so they are not under the card. When no live pick target exists (the sleeping loop, or a later question type), it falls back to `fieldSession.onAnswer` and the report notes "quiz tap fallback". It also annotates any answer route that sits entirely under the quiz card. |
| `cards.spec.ts` | Binder: turn a page; search with the viewport cut to 55% (the soft keyboard), keeping the field and first result above it; open the card, flip and tilt-drag. Card offer via `?cards=earn` with a seeded offer: three face-down cards, pick, reveal; "Added to your binder!" must not overlap the card, and the card is saved. On phones and tablets, the binder and the card offer also get the stale-dvh check. |
| `pass-puzzles.spec.ts` | Opens the arcade, picks Pass Puzzles, draws a stroke from the ball and checks the predicted path (`__passPuzzle.scene.debug()`). |

Every spec also checks that the document never scrolls sideways (`scrollWidth ≤ innerWidth`).

Input: Chromium touch projects use real CDP touches. Playwright has no touch-move for WebKit, so WebKit holds and drags use the mouse, which drives the same pointer handlers. Taps use `locator.tap()` on every touch project.

Known issues: console errors that are already reported can be listed in `KNOWN_CONSOLE` in `tests/e2e/helpers.ts`, where they become report annotations instead of failures (it is empty now). A known layout bug can be marked `test.fail(...)` with the reason, so Playwright flags the unexpected pass once it is fixed.

### Screenshots and baselines

Every run attaches screenshots of the key screens per device to the HTML report (`test-results/devices-report`). **There are no committed baselines yet**, because the bean characters are being rebuilt. Once they land:

```
FI_VISUAL=1 npx playwright test --update-snapshots   # writes tests/e2e/__screenshots__/<project>/…
FI_VISUAL=1 npm run test:devices                      # compares (2% pixel tolerance, canvases masked)
```

Commit `tests/e2e/__screenshots__/` after reviewing the images. Pixel comparison only runs with `FI_VISUAL=1`.

## 3. What the automated layers cannot catch

WebKit in Playwright is desktop WebKit with a phone viewport and user agent, not iOS Safari. It has no:

- **Long-press callout** ("Save image / Copy / Share"), loupe or text-selection handles. The guard tests check the CSS that prevents them; only a real device shows the system UI.
- **Collapsing Safari toolbar.** `dvh` never goes stale in an emulator. The suite resizes the viewport and simulates a stale dvh, but the real timing is iOS-only.
- **Real on-screen keyboard.** Focus zoom, the keyboard pushing the visual viewport, and the "Done" accessory bar are all missing. The suite shrinks the viewport, and the guard tests check input font sizes.
- **Thermals, GPU and battery.** Desktop GPUs hide phone heat. Never claim a heat fix from these runs (AGENTS.md, docs/performance-guide.md).
- Safe-area insets (the notch, Dynamic Island, home indicator), rotation animation, haptics, audio unlock, and Low Power Mode.
- **Some 3D CSS in headless WebKit.** Playwright's WebKit draws `PlayerCard`'s back face mirrored over the front (backface culling), in the binder viewer and the card reveal. Chromium is correct, and the computed styles are right (`preserve-3d` chain, `backface-visibility:hidden`), so treat this as a headless compositing artifact until a real device shows it. Checklist item 9 covers it.

There is no iOS Simulator/Appium route. These behaviours are covered by the static guards plus the manual pass below, **on a real iPhone and iPad before each deploy**.

## Manual pre-deploy checklist (real iPhone + iPad, Safari)

Use a recent iPhone (ideally a small one, such as an SE or mini) and an iPad. Open the deploy preview in Safari, not a home-screen app, unless you are testing that. Portrait first, then rotate.

1. **Long press.** Hold Shoot for 2 s in walk mode: the shot charges and fires, with no "Save image / Copy / Share" callout, loupe or blue selection. Repeat on the 3D view, the joystick, an arcade game canvas (Pinball, Tennis, Runner), Island Strikers and the Pass Puzzles pitch.
2. **Toolbar collapse.** Open Paths, then Collect cards, the Store and the card offer. Scroll so Safari's toolbar collapses, then tap the bottom edge so it expands. There must be no tan/page-colour band at the bottom, and nothing is cut off.
3. **Keyboard.** Binder search: tap the field. The page must not zoom, and the field and the first result stay above the keyboard. Dismiss the keyboard: the layout returns with no gap. Repeat for the IDP notes and any select (coach voice, play category).
4. **Safe areas.** In landscape, the HUD buttons, Done/Back and the playback bar clear the notch/Dynamic Island and the home indicator.
5. **Rotate** on the island, in the binder and in an arcade game: no sideways scroll and no stuck layout.
6. **Taps.** Small controls (radar rotate/move, the binder search ×, customizer swatches, story dots) are hittable with a child's finger.
7. **Heat.** Play 5 minutes on the island and 3 minutes of an arcade game. Note if the phone gets warm, and compare with the previous deploy. Record any evidence in docs/performance-guide.md.
8. **Audio.** The first tap unlocks sound. Background the tab and come back: audio and loops resume or sleep correctly.
9. **Player cards.** Open a card in the binder and take a card reward. The front (portrait and name) faces you, Flip shows a readable, un-mirrored back, and tilting works.

Note the device, iOS version and results in the deploy notes.
