# Island UI spec: the canonical chrome

Adopted 30 September 2026 from the overnight UI audit (§3, "Proposed canonical spec"), with the owner's decisions on gutters and
titles. Every value here is an existing token in `app/globals.css` or an existing shared component. Do not add one-off values:
reuse these. The button families themselves are described in [BUTTONS.md](BUTTONS.md); the column under the coins bar is
described in [HUD_STACK.md](HUD_STACK.md).

`tests/ui-spec.cjs` (part of `npm test`) greps for regressions of the rules marked **[guarded]**.

## 1. Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--phone-gutter` | `18px` | **[guarded]** The one phone side gutter: headers, the HUD row, the HUD stack column, cards, edge controls, the onboarding card, the book's page arrows and story tray. |
| `--btn-focus` / `--btn-focus-offset` | `3px solid #ffd451` / `3px` | **[guarded]** The one focus ring. The global `a,button:focus-visible` default uses it, and so does every component rule. |
| `--btn-press` | `3px` | **[guarded]** The press depth: `translate:0 var(--btn-press)` (or `translateY(var(--btn-press))` where a transform is already in use), with the edge shortened to `0 1–2px 0 <edge>`. Never a hard-coded `2px`. |
| `--btn-height` / `--btn-height-lg` | `44px` / `48px` | Minimum tap target / card CTA height. A smaller drawn control keeps a 44px hit area through an invisible `::before` (Male/Female toggle, skin swatches, number chips). |
| `--btn-nav-width` | `76px` | Back / Done width, and the header's side columns. |

## 2. Headers

* **Grid.** `ModalShell` `.shell>.header`: `76px minmax(0,1fr) 76px`. The minimum height is 76px on phones and 84px on desktop.
  Components do not override the header height or padding (the travel map and Make it yours no longer do).
* **Anchors.**
  * Desktop: 24px side, 20px top.
  * Phones and touch screens, under the one query `@media (max-width:600px),(pointer:coarse)`: `var(--phone-gutter)` side, 16px
    top, each plus its `env(safe-area-inset-*)`. **[guarded]** Custom HUD headers (vending, Konbini, arcade games, the pop-up book
    reader, fishing) use the same query; a `max-width` query alone misses landscape phones (844×390), which was the cause of
    the book, vending and arcade drift.
* **Left cell.** Back on any sub-view (anything opened from another dialog: About, binder, Ball hunt, Explore, Choose plays, the
  book reader, the quiz, and **For grown-ups when Settings opened it**: `openGrownUps({from:'settings'})`). The coins pill on shop
  and room surfaces. The island badge on Paths. Otherwise empty.
* **Right cell.** Done closes the whole surface. Game and room HUDs put a round icon (Pause, Settings) here. Back and Pause sit on
  the anchor row (`align-self:start`), never centred against a taller scoreboard.
* **Title.** **[guarded]** Centred in column 2, IslandBrush 400, `font-size: clamp(24px,3vw,38px)` on every modal and reader
  title, with `text-wrap: balance`. On a 390px phone a long title ("Make it your island") wraps to two balanced lines rather than
  shrinking below 24px. An eyebrow line (chapter name, "Your collection") stacks above it, also centred. The For grown-ups title
  keeps Arial 700 (an adult voice) at the same size.
* **Pop-up book, landscape phones.** The chapter title is centred in the header row like every other title. The page action
  (pink chip) is not in the header: it stacks just above the Next arrow at the right edge, beside the book, so the book keeps
  its height.

## 3. Buttons (summary; see BUTTONS.md)

| Type | Look |
| --- | --- |
| Navigation (Back, Done, Next, Skip) | `NavigationButton`: 76×44 textured gold pill, `--btn-shadow-gold`. |
| Primary, gold | Card CTA ≥48px / HUD prompt 44px, textured gold, `--btn-shadow-gold`, 16/700 for HUD prompts (Talk to … included). |
| Primary, green | `--btn-green` face, `--btn-ink-on-dark`, 3px `--btn-rim`, `0 4px 0 var(--btn-green-edge)`. |
| **Secondary, mint** | `--btn-mint` face, `--btn-ink`, **3px `--btn-rim`**, `0 4px 0 var(--btn-mint-edge)`, 15/700. Every "Later", "Your playbook", "Go back", "Give me a clue". No transparent outlined pills. |
| Chip / tab | 44px, cream or bright gold, edge 4px; **`--btn-pink` / `--btn-pink-edge` when selected** (`aria-pressed=true`, or an open search). |
| Round icon | 44px (`--btn-icon`), HUD actions 58 phone / 72 desktop, `translate .16s, box-shadow .16s` press. |
| Tile | Settings-style tile: palette face (mint for grown-up entries), `--btn-radius-tile`-family island radii, `0 6px 0 #173e3755` lift. |

Disabled: `opacity:.5`, edge removed.

## 4. Motion

Only two modal motions:

| Motion | Timing | Source |
| --- | --- | --- |
| Drawer (side sheet: Pocket, NPC, Warm-up, Fishbook) | backdrop `.14s ease-out`, then panel slide `.24s ease-in-out` (delay `.14s`); out `.24s ease-in-out` | `DrawerSlide.module.css` |
| Full-screen / centred modal (Settings, Paths, Make it yours, travel map, Market, card offer, Ball hunt) | fade (or fade + small rise) `.26s ease-out`; out `.2s ease-in` | `IslandSettings.module.css` `.fullModal` |

Other motion:

* Button press: `translate .16s, box-shadow .16s`, depth `--btn-press`.
* Navigation-button collapse: label fade 160ms, width 220ms, navigate at 240ms (`DoneButton`).
* **One toast timing:** every toast and HUD-stack piece enters over `.3s ease` (the HUD stack sets `animation-duration` and
  `animation-timing-function` beside `hudStackIn`, so pieces cannot keep their own). Dwell 5.2s (2.6s while a queue drains).
* Reveals and celebrations (card reveal, Konbini) are free-form game moments, outside the chrome spec.
* Reduced motion: no animation (pseudo-elements and `::backdrop` included), no transition, no collapse delay.
* **Heat [guarded]:** a full-screen, opaque menu (Settings and Paths `.fullModal`, Make it yours, Coaches Centre, PositionGuide,
  Choose plays) has **no backdrop blur** while open: its entrance fades the tint only (`fullTintIn`, `playsTintIn`), because a
  held `backdrop-filter` costs GPU every frame on phones and is never seen through an opaque sheet. Side drawers that leave the
  island visible (NPC, Pocket) keep the `.14s` blur-in.

## 5. Open items (not changed in the Sep 30 pass)

Files owned by other work at the time; apply the same rules when they are next edited:

* `components/IslandBalanceDrawer.module.css:5`: Pocket title `clamp(23px,4vw,32px)` → `clamp(24px,3vw,38px)` (desktop shows 32px).
* `components/PlaysPicker.module.css`: title `clamp(24px,3vw,34px)` → `38px` max (`:24`); header grid 88/1fr/88 → 76 (`:61`);
  focus `#c47b33` → token (`:15`); 2px press → `--btn-press` (`:54`); open `.24s` → `.26s ease-out` (`:22`).
* `components/FieldLearning.module.css`: focus rings `:13,44,50,63` → token; 2px presses `:125,130,131`; Choose plays transition
  (`:108`) gains `translate .16s,box-shadow .16s`; quiz camera (`:92`) → 44px circle; `.endActions` CTAs (`:44`) → 48px, second
  action mint.
* `components/IslandJobs.module.css`: "Stop job" (`:37`) → mint secondary 14–15/700; focus `:15` drop the fallback, `:81` → token;
  job panel card (r18, 2px rim, 4px edge) → r22 / 3px / 5px like the other stack cards.
* `components/StoryFilmPlayer.module.css` (story engine): centre the title in a 76/1fr/76 header; focus `:12,33` → token.
  `components/StoryPlaybackBar.module.css` (kept bar): Replay 32×44 and chapter dots 33×24 → 44px targets; focus `:6` → token.
* Product decisions: arcade "Exit" / "Arcade" labels vs "Back", and the arcade coins pill on the right (H13).
