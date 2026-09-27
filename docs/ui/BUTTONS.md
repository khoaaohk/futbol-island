# Island buttons: families, tokens and audit

Audit date: 26 September 2026. It is local only: nothing was committed or deployed.

The shared tokens are the `--btn-*` custom properties in `app/globals.css`, in the `:root` block just above "Tactile gold controls". `--island-control-face` and `--island-control-shadow` are now aliases of those tokens.

When you write a new button, use a shared component or these tokens. Do not use raw hex values.

## Families

The textured gold face is `var(--btn-gold) var(--btn-grain) center/128px 128px`, with a `var(--btn-rim-width) solid var(--btn-rim)` border (3px `#fff2cd`). The "edge" is the solid `0 Npx 0` drop shadow in the face's darker colour. Pressing a button moves it down (`translate: 0 var(--btn-press)`) and shortens the edge. Focus shows the global `button:focus-visible` outline, or `var(--btn-focus)` inside components.

| Family | Use | Tokens / component | Size | Face | Edge | Label pattern |
| --- | --- | --- | --- | --- | --- | --- |
| **Navigation** | Back, Done, Next, Skip, Flip, Choose plays, Previous step | `NavigationButton` / `DoneButton` / `BackButton` (`components/DoneButton.tsx`) | 76×44 pill (`--btn-nav-width`, `--btn-height`), 14px/600. It collapses to a 44px circle before it navigates. | textured gold | `--btn-shadow-gold` (5px `#a8863d` plus a 4px rim halo) | `Back`, `Done`, `Next`, `Skip`. Never Close, ×, ← or Previous for leaving a view. |
| **Primary, gold** | The main action on a surface: Open this card, See it in my binder, Play, Kick off, Freeze the moment, Quiz yourself, Watch again, Enter, Talk to … | tokens (`CardOffer.module.css .primary` is the reference) | at least 48px tall (`--btn-height-lg`) for card CTAs, 44px for HUD prompts; pill; 14–16px/700–800 | textured gold | `--btn-shadow-gold` | a sentence-case verb phrase |
| **Primary, green** | The main action inside cream panels: Equip, Keep this focus, Next question, Love Futsal, Try again | `--btn-green`, `--btn-ink-on-dark`, `--btn-green-edge` | 44px or more; pill; 12–14px/700 | `#244d40` | 4px `#17352b` (none on landing CTAs) | a sentence-case verb |
| **Secondary, mint** | The alternative next to a primary: Choose a new focus, Watch tip again, Practice idea, Show me, Watch again (puzzles), Remove costume, Thanks, see you around. | `--btn-mint`, `--btn-mint-edge` | 44px; pill | `#beded1` | 4px `#8bac9d` | sentence case |
| **Tertiary text** | A quiet way out under a primary: Back to arcade, All puzzles, Show a hint | tokens (`ArcadeGame3D .exit`) | 44px tap height; no face | transparent, `--btn-ink` text | none | `Back to <place>` |
| **Round icon** | HUD Settings, game Pause, hint toggle, camera, transcript, radar, lesson transport, card-offer arrows | `.triggers .circle`, `.town-app` travel actions, `ArcadeGame3D .pause` | 44px circle (`--btn-icon`); HUD action buttons and transport are 58px | textured gold, or a grain colour per action (green ride, blue map, coral shoot, lilac juggle, pink transcript) | 5px edge in the matching colour, plus the halo | needs an `aria-label` (Pause / Resume game, Show hint) and a `data-tip` where the icon alone is not enough |
| **Badge** | Paths trigger, bottle and island logo | `IslandSettings .questsTrigger`, `IslandBottle .logo` | 44px rounded square (radius 14) | pink or coral grain | 5px edge | aria-label only |
| **Chip / tab** | Store categories, play categories, puzzle format, NPC ranking tabs, binder Futbol/Futsal | `--btn-gold-bright` or `--btn-cream` face; `--btn-pink` when selected | 44px; pill, or `--btn-radius-tile` in plays | bright gold `#f9d665` on cream panels, cream `#fff1d3` on patterned grounds | 4px `--btn-gold-bright-edge` / `--btn-cream-edge`; pink `--btn-pink-edge` when selected | noun, `aria-pressed` |
| **Toggle** | Character Male/Female, settings switches | `CharacterToggle`, `IslandSettings .toggle` | 44px (switch row 80px) | cream track with a sliding thumb; the settings row is a textured gold card | 4px edge | `aria-pressed` |
| **Tile** | Big card buttons: settings entries, time of day, travel destinations, Paths side quests, arcade/coach cards, puzzle levels | tile faces use the same palette tokens (bright gold, mint, pink, cream) | 64px or more; irregular "island" radii | flat palette colour | translucent dark `#183b3438`–`#173e3755` lift | title plus a small line |
| **Destructive** | End plan, Delete note, Remove costume | secondary (mint) look. The game has no red family. The note delete is a 32px × with a 44px hit area. | – | – | – | an explicit verb ("End plan", "Delete note from …") |

### Navigation placement rules

* Modal headers: logo or Back on the outer left, Done on the outer right (`ModalShell.module.css` reserves 76px columns).
* Back and Next are the same size. Next is always on the right (onboarding Skip / Next, Ball hunt Previous step / Next).
* Card views: the binder viewer and PositionGuide use a Back / Play (centred) / Flip bar. The card reveal uses Done in place of Back, because it closes the offer (user decision, 25 Sep 2026).
* A game shell has Back on the left and a round Pause or hint control on the right.

## Audit method

* **Static inventory.** Every `<button>`, `role=button`, `NavigationButton`/`DoneButton`/`BackButton` and button-styled link in `components/` and `app/`: 324 elements in 61 files. The generating script is `scratchpad/buttons/inventory.cjs`.
* **Runtime.** A headless Chromium session at :8092, at 390×844 (iPhone 15 profile) and 1280×800. It recorded the computed styles (size, radius, face, edge, border, font) of every visible, topmost button on 45 surfaces:
  * HUD, settings and its sub-pages, travel map, onboarding;
  * Paths, bottle, binder, card viewer, Ball hunt;
  * Store (all six tabs), Coaches Centre and IDP, Museum, Make it yours, NPC;
  * Arcade and each game, plus in-game controls;
  * Pass Puzzles (level list and brief);
  * field lesson, lesson end, quiz;
  * card offer and reveal.

  The story film surface could not be scripted (the path stop is off-screen after the offer).
* **Unreachable code.** `IslandPassport`, `PassportPitch`, `QuestCelebration`, `LearningJourneys`, `CoinCostumeReward`, `Academy`, `PlayerPortrait` and the old `BreakawayRun`, `SoccerPinballGame` and `SoccerTennisGame` are imported by nothing reachable. They were inventoried but not migrated.

## Deviations found

48 deviations on reachable surfaces. The Status column says what happened to each one:

* Fixed: migrated to the shared tokens or components in this pass.
* Kept: an intentional exception, with the reason given.
* Open: reported, not changed.

| # | Type | Where | Deviation | Status |
| --- | --- | --- | --- | --- |
| 1 | colour/radius | `components/games/ArcadeGame3D.module.css:1` `.primary` | Play / Freeze the moment: flat `#efc776`, radius 14/24, rim `#fff8e9`, edge `#a38a55`, 59px | Fixed: gold primary pill (appended rules at the file end) |
| 2 | colour/radius | `ArcadeGame3D.module.css:1` `.pause` | Pause and the hint toggle: 48px rounded square (r18), flat `#efc776` | Fixed: 44px round gold icon |
| 3 | tap target | `ArcadeGame3D.module.css:1` `.exit` | Back to arcade / All puzzles / Show a hint were 21px tall | Fixed: 44px tertiary |
| 4 | font | `ArcadeGame3D.module.css:1` `.game button`; `DoneButton.module.css:13` | Game buttons (and Back inside games) used system-ui; everywhere else uses Arial | Fixed: `--btn-font` |
| 5 | label/shape | `components/LiveArcadeMatch.tsx:55` | Island Strikers Pause was a text pill ("Pause", r15, 52×44); the other games use an icon | Fixed: round icon, aria-label kept as Pause / Resume (keeps `scripts/check-island-strikers-browser.cjs`) |
| 6 | colour | `LiveArcadeMatch.module.css:3` `.card .primary` | Kick off: flat `#efc776`, edge `#a38a55`, r15 | Fixed: gold primary pill |
| 7 | colour/texture | `FieldLearning.module.css:44` `.endActions button` | Quiz / Watch again: flat `#f4cc7c`, 1px `#ecdfb5` rim, 2px 3px soft shadow | Fixed: gold primary pill |
| 8 | label | `components/FieldLearning.tsx:105` | Title case "Quiz Yourself" / "Watch Again" | Fixed: "Quiz yourself" / "Watch again" (`tests/e2e/paths.spec.ts` and the PlaysPicker copy updated) |
| 9 | colour/radius | `FieldLearning.module.css:84` `.quizPrimary/.quizSecondary` | Green r12 without edge; the secondary was transparent with an outline | Fixed: green primary / mint secondary pills |
| 10 | colour/radius, label | `FieldLearning.module.css:12` `.retry`, `components/PlaysPicker.tsx:32`, `FieldLearning.tsx:93` | "Retry" / "Retry lesson" in r12 `#294f43` | Fixed: "Try again", green primary pill |
| 11 | texture | `components/IslandOnboarding.module.css:50` | Skip / Next override dropped the navigation grain (flat `#e9c16b`) | Fixed: shared face incl. grain |
| 12 | press effect | `components/DoneButton.module.css` | Navigation buttons pressed only when a global aria-label rule matched (Back / Done); Next, Skip, Flip, Choose plays and Previous step had no press | Fixed: one `:active` press in the component |
| 13 | placement/size | `components/BallHuntLesson.module.css:36` | Previous step 148px on its own row, Next stretched full width below it | Fixed: equal 148px, Next on the right |
| 14 | colour | `NpcConversation.module.css:57` | Answers `#efcf82` / edge `#a88843` (a near-miss of bright gold) | Fixed: bright-gold tokens |
| 15 | colour | `NpcConversation.module.css:60` | Goodbye `#c2ded1` / `#7b9e91` (a near-miss of mint) | Fixed: mint tokens |
| 16 | colour | `NpcConversation.module.css:62` | News / ranking / clip buttons `#efcf82` / `#ac8d49`; selected rank `#eeb0d5` | Fixed: bright gold / pink tokens |
| 17 | tap target | `NpcConversation.module.css:24` | Refresh 40px | Fixed: 44px |
| 18 | colour | `app/globals.css:385` `.npc-talk-prompt` | "Talk to …" was a flat green chip with a 1px rim; the other HUD prompts (Enter, Hop off) are gold pills | Fixed: gold pill rule after `.field-go` |
| 19 | colour | `IslandStore.module.css:1` `.details button` | Equip `#315845` without edge (a different green) | Fixed: green primary tokens |
| 20 | colour | `IslandStore.module.css:37` | Tabs: selected `#e98acb`, cream `#fff1d3` with a literal edge | Fixed: pink / cream tokens |
| 21 | colour/radius | `CostumeCollection.module.css:1,12` | Equip `#315845` r10→18; Remove costume / story buttons mint r16 without edge | Fixed: green primary / mint secondary pills |
| 22 | colour/radius | `IdpPlan.module.css:7,9` | Primary edge `#183b34`; ghost cream with a 1px outline | Fixed: green primary / mint secondary |
| 23 | colour | `IdpPlan.module.css:44` | Selected format `#f8d651` | Fixed: bright gold |
| 24 | colour/radius | `CoinQuest.module.css:1` | Ball hunt primary `#294f43` r12; secondaries transparent with an outline | Fixed: green / mint pills |
| 25 | tap target | `CoinQuest.module.css:20` | Ball grid cells 43px wide at 390px | Fixed: `minmax(44px,1fr)` |
| 26 | chip drift | `games/PassPuzzleGame.module.css:13` | 7v7/9v9/11v11 were global green `.pixel-btn` squares (r8); the selected one was flat `#f4cc7c` | Fixed: chip family (bright gold, pink when chosen) |
| 27 | secondary drift | `PassPuzzleGame.module.css:40` | Watch again / Replay level / replay Skip were green r8 `.pixel-btn` | Fixed: mint secondary pill |
| 28 | colour | `PlaysPicker.module.css:44` | Categories `#efd58c` (a third gold) / selected `#ed9dce` literal | Fixed: bright-gold / pink tokens |
| 29 | colour | `IslandSettings.module.css:222` | Time of day: edges `#b7953b` / `#b5739c` / `#81a99a`, pink `#efabd4` | Fixed: palette tokens |
| 30 | colour | `IslandSettings.module.css:216` | Walkthrough tile pink `#efabd4`, map tile mint literal | Fixed: tokens |
| 31 | label | `components/IslandSettings.tsx:106` | "See Walkthrough" in title case | Fixed: "See walkthrough" |
| 32 | colour | `IslandJourney.module.css:7` | Explore tile `#b6ddd0` (a mint near-miss) | Fixed: mint token |
| 33 | colour | `IslandTravelMap.module.css:16` | Destinations `#f8d651` / `#bfded1` near-misses | Fixed: bright gold / mint tokens |
| 34 | colour | `CardCollection.module.css:121`, `CardOffer.module.css:3`, `PlayerCard.module.css:52` | The card views used a separate gold `#ffd451` with edge `#a8792b` (page turn, search, offer arrows, Flip / Play on the card) | Fixed: bright-gold face and edge tokens (visually near identical) |
| 35 | tap target | `CardCollection.module.css:125` `.seg button` | Binder Futbol / Futsal 40px | Fixed: 44px |
| 36 | tap target | `CardCollection.module.css:105` `.tab` | Binder role tabs are 18–20px wide | Fixed without a layout change: the tab no longer clips its children and an invisible `::before` widens the hit area to 48px (18px out, 12px in; the pockets stay clear). Measured: 54–60px at 1280. On a 390px phone it is 34px, because the tab sits 4px from the viewport edge. Reaching 44px there needs a binder layout change. |
| 37 | tap target | `IslandTravelMap` map hotspots | Map pins are 15–60px | Kept: every destination is repeated as a large tile under the map |
| 38 | tap target | `LiveArcadeMatch.module.css` `.actions` | Touch actions are 37px in portrait | Kept: portrait is covered by "Turn sideways to play". In landscape they are 44px or more. |
| 39 | label | `CardHighlights.tsx:37`, `NpcClips.tsx:48` | "Close video" | Kept: dismisses an inline embed inside a card or chat, not a view. Done would read as closing the whole panel. |
| 40 | label | `CardCollection.tsx:470,494` | × clears or closes the search field | Kept: an inline field-clear convention with aria-labels "Clear search for …" / "Close search" |
| 41 | label/style | `components/Town.tsx:1030`, `CoachLesson.tsx` | Uppercase monospace `.pixel-button` (TRY AGAIN, SHOW ME THE MOVEMENT) | Kept: the legacy pixel family on the load-failure screen and the neighborhood coach lesson. Documented rather than restyled to keep the shared `Town.tsx` edits minimal. |
| 42 | legacy override | `app/globals.css:540` | A global `button[aria-label^=Close/Dismiss/Done]` rule paints green with `!important`. It is overridden to gold inside `.town-app` and by `DoneButton`. | Open: harmless today; remove once no surface relies on it |
| 43 | family | `StoryPlaybackBar.module.css:4`, `StoryFilmPlayer.module.css` | The riso player uses its own ink/pink transparent buttons | Kept: the riso palette belongs to the film engine (AGENTS.md story continuity) |
| 44 | family | `ArcadeGame3D.module.css` `.controls`, `LiveArcadeMatch .actions`, `Arcade.module.css:1` `.pixel-btn` | In-game action controls use per-action colours and larger circles | Kept: in-game controls need thumb-sized, colour-coded targets (the same scheme as the HUD travel actions) |
| 45 | tap target | `IslandMapFrame.module.css:4` | Radar rotate / drag controls are 28px | Kept: they already have a `::before` hit area (inset −4px) and are hover/focus reveals on desktop only |
| 46 | tap target | `FieldTranscript.module.css:3` | Transcript header buttons are 30px when floating | Kept: 44px when docked (the phone layout) |
| 47 | colour | `components/CharacterCustomizer.module.css` chips | Chips `#efcf82` / edge `#ac8d49`, 13px/400 (other chips are 700); Previous / Next move arrows are flat `#efcf82` circles, not the grain round icon | Open: that file is owned by the layout agent; passed to the lead |
| 48 | radius | `components/CharacterCustomizer.module.css` swatches | Swatches use edge `#ac8d49` instead of `--btn-gold-bright-edge` | Open: as #47 |

Counts by type:

| Type | Count |
| --- | --- |
| Colour / edge drift for the same role | 21 |
| Radius / shape drift | 8 |
| Tap targets under 44px | 10 (6 fixed, 1 open, 3 kept) |
| Labels | 7 (4 fixed, 3 kept) |
| Placement / size | 1 |
| Missing texture | 1 |
| Missing press effect | 1 (6 uses) |
| Font | 1 |
| Legacy override | 1 |

Rows count under every type they involve, so these counts add up to more than 48.

No button was missing a focus-visible style: the global `button:focus-visible` outline covers all raw buttons, and `NavigationButton` shows its own ring on keyboard focus. Disabled states reduce opacity or switch to a muted face everywhere they occur.

## Verification

* `npx tsc --noEmit` passes.
* `npm test` passes, including device-guards (0 errors).
* Playwright, iphone-15 and desktop-chromium (26 Sep, shared dev server under load from other agents): 21 passed, 2 skipped, 5 failed.
  * Every iphone-15 test passed, including cards, the card offer, Pass Puzzles, the ball-hunt steps and the play quiz with the renamed "Quiz yourself".
  * The 5 desktop failures time out waiting for the HUD **Paths** trigger to become "stable", or for a screenshot to load fonts. The Paths trigger runs its existing `pathButtonShake` / `pathSparkle` animation (`IslandSettings.module.css`), which this pass did not touch. In an isolated probe the click succeeds, but only after about 19 s of waiting for stability.
  * Follow-up (done): the Paths attention animation now plays one cycle per wake and then rests on its base frame. See below.
* Before/after contact sheets are in the session scratchpad (`scratchpad/buttons/`).

## Paths button attention (follow-up, 26 Sep)

`IslandSettings.module.css` (end of file) builds on `useSceneryRest` (`lib/sceneryRest.ts`); there is no new timer or hook. The shake, the icon swap (bolt → book → play → bolt) and the sparkle each run once. When the HUD rests (`hudRest`), the animations are removed, so the button stays still on the bolt icon. When the existing wake triggers (input, `SCENERY_WAKE_EVENT`) remove `hudRest`, exactly one cycle restarts. With reduced motion there is no animation at all. `tests/heat-idle.cjs` and `tests/heat-pass3.cjs` still pass.

Desktop-chromium rerun (1 worker, its own output folder): 13 passed, 2 skipped, 0 failed. The earlier failures came from an overloaded machine (load average about 44, with other agents' browsers running). Headless Chromium was producing about one frame every 2–4 s, so Playwright's scroll and screenshot steps stalled. The CSS in this pass was not the cause.
