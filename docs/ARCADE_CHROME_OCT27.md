# Arcade chrome: one score bar, one pause card (Oct 27 2026)

Owner: "match the score bar at the top for all the games that make sense. if they have the same relative size use the same
pattern so it matches. keep the bar simple as possible" and "also do the same for the pause modal. keep them consistent as possible".

## 1. Audit (before)

### Top bars

| Game | Container | Left | Centre | Right | Sizes / colours | Safe area / landscape |
|---|---|---|---|---|---|---|
| Strikers (`LiveArcadeMatch.tsx`) | in-flow flex `<header>` above the pitch | BackButton "Arcade" | `GOLD <b>n</b> <time>clock</time> <b>n</b> BLUE`, no pill box; numbers 26 px (20 px phone) `#fff08a` / `#83dfff`, clock 16 px (13) in a `#26223d` chip, words 12 px (9) | round gold Pause 44 px, aria `Pause` / `Resume` | padding 20/24 desktop, 16/18 phone | `env()` insets; 6/16 px coarse landscape; 8/14 px framed 4:3 |
| Tennis (`ArcadeGame3D.tsx`) | absolute grid `90px 1fr 90px` (76/1fr/48 phone) | BackButton "Arcade" | `.headerScore` pill `#171d35`, border `#65dfda`, radius 16, padding 8/12, `strong` 28 px (24) + detail span 11 px (hidden for tennis by CSS) | round gold Pause 44 px, aria `Pause game` / `Resume game` | — | `.header>div` hidden at max-height 520 then re-shown for `.headerScore`; 8/14 px tennis landscape |
| Pinball (`ArcadeGame3D.tsx`) | same as Tennis | same | same pill + second line `n goals · 3 balls` | same | same | same |
| Breakaway (`RunnerTopBar.tsx`) | ArcadeGame3D header + `.bar` | BackButton | `<p>` pill `#26223d`, border `#65dfda`, radius 20, padding 7/16, `b` 26 px (22 short) `#fff08a` + `PTS` 11 px | same Pause | — | 10 px + inset top, 6 px short |
| Pass Puzzles (`PassPuzzleGame.tsx`) | arcade header, grid `84px 1fr 118px`, z 6 | BackButton | pill: count 28 px (23) + `passes · try a/b` 11 px (10), gold border when met | mint "Puzzles" button + round hint button; **no pause** | — | 16/18 phone; nav re-shown at max-height 520 |

### Pause cards

| Game | Title | Score line | Primary | Small row | Keycaps | Look |
|---|---|---|---|---|---|---|
| Strikers | eyebrow `ROUND n · name`, h2 "Paused" | `Gold n – n Blue · m:ss left` 16 px | "Resume match" | Arcade | desktop | neon card `#151a30`, pink border, radius 20 |
| Tennis (`TennisCard`) | "Time out" | score 34 px + sets | Resume (icon) | icon buttons: Arcade | none | Tennis court card |
| Pinball (`PinballCard`) | badge TIME OUT, h3 "Paused" | none | Resume (icon) | Options (nudge toggle), Back | none | Pinball cabinet card |
| Breakaway (`RunnerMenu`) | eyebrow route, "Paused" 30 px | `n pts · n m` | Resume 56 px | Arcade + Restart (48 px pills) | desktop | Strikers neon card |
| Pass Puzzles | — (no pause) | | | | | |

## 2. After

- **`components/arcade/ArcadeTopBar.tsx`** (+ module CSS): Back left, ONE centre pill, Pause right. Grid `1fr auto 1fr`; pill `#26223d`,
  border `#65dfda`, radius 20, padding 7/16, value 26 px `#fff08a`, word 11 px caps `#b5c7dc`; Pause = shared round gold 44 px button.
  Padding `14px + inset-top` / `18px + inset-sides`; at max-height 520 (phones sideways, short frames) `6px + inset-top`, value 22 px.
  `overlay` floats it over full-screen canvases (ArcadeGame3D, Pass Puzzles); Strikers keeps it in flow (`overlay={false}`).
  - Strikers: `GOLD n clock n BLUE` in the same pill (pens text replaces the clock in a shoot-out). aria `Pause` / `Resume` kept.
  - Tennis: `you : rival` (no word). Pinball: score + `PTS`. Breakaway: points + `PTS`. aria `Pause game` / `Resume game` kept.
  - Pass Puzzles: pass count `1/2` + `PASSES`; tries moved to the pause card and the brief / result cards. Hint button docks under Pause.
- **`components/arcade/ArcadePauseCard.tsx`** (+ module CSS): "Paused", optional one-line score, ONE big Resume (56 px), small row
  Arcade + (Pass Puzzles: Puzzles) + Restart, keycaps from the game's list on `pointer:fine` only. Fixed full-window backdrop `#04050dcc`
  (no blur), neon card `#151a30`, pink border, radius 20, width ≤ 380 px.
  - Restart: Strikers replays the round / cup tie (paid entry, stays paused if refused); Tennis / Pinball / Breakaway start a fresh run
    (`change('ready'); start()`, as Breakaway did); Pass Puzzles reloads the puzzle from try 1.
  - Pass Puzzles gained a real pause: Pause button / Esc / P; the draw loop sleeps while paused and the pitch ignores strokes.
- Start and full-time cards stay game-specific. Removed: `RunnerTopBar.*`, Runner / Tennis pause branches, Strikers' paused branch,
  Pass Puzzles' header strip (`.passScore`, `.navigation`). Pinball's start card no longer shows while paused (the nudge option stays on
  the start card).
- Heat: no new loops; the only motion is the one-shot score bump on a value change (off under reduced motion).
- Tests: `tests/arcade-chrome-shared.cjs` (in the `npm test` chain); updated breakaway-clean-ui, pass-puzzle-clean-play, arcade-start-card,
  pinball-r3, striker-celebrate, strikers-portrait; removed pass-puzzle-arcade-header (the strip it guarded is gone).

## 3. Consistency audit (Oct 27 2026, afternoon)

Owner: "do another audit on the different arcade games. make sure all the modals, buttons, joystick position and size are all
consistent. Make sure buttons are placed in the right position. For example, on the Strikers game the Arcade button is off on the
horizontal view."

**Method.** `scripts/measure-arcade-chrome.cjs` (headless Chrome, `getBoundingClientRect`) walks start → playing → paused → end in each
game at 844×390 and 932×430 (notch emulated with `Emulation.setSafeAreaInsetsOverride`: 47 px left/right, 21 px bottom) for the sideways
games, 390×844 (47 top / 34 bottom) for the upright games, and 1280×800 desktop. Numbers: `x,y w×h`, `r` = gap to the right edge,
`b` = gap to the bottom edge. Run: `FUTBOL_BASE_URL=http://localhost:<port> node scripts/measure-arcade-chrome.cjs`.

**Strikers' Arcade button.** Measured in this build (and on futbolisland.app) it sits where every other game puts it: 844×390
`16,6 76×44`, 932×430 with a notch `63,6` (16 + 47 inset), desktop `18,14`; computed styles identical to Breakaway's; a tap leaves to the
arcade in start and play; only the pause card covers it (the card has its own Arcade button). What was off around it sideways: the Arcade
button (x 16) and the stick (x 20), and Pause (r 16) and Shoot (r 14), sat on different gutters; the stick was 160–164 px (Breakaway 150,
Tennis 148) and sized from `100vh` (too big on iOS Safari, where 100vh is the tall viewport). The Strikers sheet also still carried
`.root>.header.header` landscape / 4:3-frame paddings and `.root .header>.pause.pause` rules from before the shared bar; nothing has those
classes any more, so they were dead code hiding where the real numbers come from. They are removed; the bar's gutters come from the tokens.

**One standard: `components/arcade/arcadeChrome.css`** (global, imported in `app/layout.tsx`; CSS modules cannot declare `:root`):

| Token | Tall / desktop | Sideways (max-height 520) | Used by |
|---|---|---|---|
| `--arcade-edge-x` (+ side inset) | 18 | 16 | bar sides, stick left, thumb cluster right, Pinball pads, Pass Puzzles hint / undo / clock |
| `--arcade-edge-top` (+ top inset) | 14 | 6 | bar top |
| `--arcade-edge-bottom` (+ home-bar inset) | 12 | 12 | stick, thumb cluster, Tennis buttons, Pinball pads |
| `--arcade-bar-h` / `--arcade-bar-clear` | 44 / 64 | 44 / 56 | Back + Pause; stick zones, hint dock, Breakaway card top |
| `--arcade-stick` | clamp(132, 100dvh − 238, 152) | 152 at 390 tall | Strikers, Breakaway, Tennis (≤ 128 under 350 px wide) |
| `--arcade-btn-main` / `-btn` / `-btn-sm` / `-btn-gap` | 92 / 72 / 64 / 10 | same | Shoot; Pass, Jump, Slide, Tennis desktop; Through, Sprint, Switch, Skill, Tennis phone (56 under 350 px wide) |
| `--arcade-card-w` / `-card-wide` / `-card-r` | 380 / 440 / 20 | same | pause card; start / full-time cards; all cards |
| `--arcade-card-pad` / `-card-title` | 20 22 / 32 | 14 18 / 26 | all cards |
| `--arcade-primary-h` / `-small-h` | 56 / 48 | 48 / 44 | primary button; small row (Arcade, Restart, Missions, …) |

Every gutter is `calc(gutter + env(safe-area-inset-*))`, so notches and the home bar are always cleared (Pinball's and Pass Puzzles'
`max(gutter, inset)` control edges are now additive too).

**Before → after (measured).**

| Item | Before | After |
|---|---|---|
| Back / Pause (all games) | 16,6 / r16 sideways; 18,14 / r18 desktop; + inset with a notch | unchanged (already shared), now from tokens |
| Stick ring, 844×390 | Strikers 160 @ x20 b10; Breakaway 150 @ x20 b16 | both 152 @ x16 b12 (x63 b33 with the notch) |
| Stick ring, Tennis 390×844 | 148 @ x24 b62 (the island's `.touch-controls` size leaking in) | 152 @ x18 b46 (12 + 34 inset) |
| Stick ring, Tennis desktop | 132 @ x24 b24 | 152 @ x18 b12 |
| Shoot, 844×390 | Strikers 92 @ r14 b10; Breakaway 96 @ r16 b18 | both 92 @ r16 b12 |
| Other thumb buttons | Strikers Pass 76, others 66; Breakaway Jump / Slide 76, Skill 68 | Pass / Jump / Slide 72; Through / Sprint / Switch / Skill 64 |
| Tennis phone buttons | Serve 80, Lob / Drop 58, r18 b28 + inset | Serve 84, Lob / Drop 64, r18 b12 + inset |
| Tennis desktop buttons | 72, gap 12, r24 b24 | 72, gap 10, r18 b12 |
| Pinball pads 390×844 | 91×120, sides 10 | 83×120, sides 18 (pad height unchanged: camera band) |
| Pause card | 380 (358 on phone), pad 20/22 (14/18), r20, Resume 56 (48) | same numbers, from tokens; the card scrolls if taller than the window |
| Strikers start card | 430 sideways / 460 desktop; pad 10–12/16–18 sideways, 32 desktop; title 22–24 / 30; Kick off 48–52 / 56 | 430 / 440; pad 14/18 / 20/22; title 26 / 32; Kick off 48 / 56 |
| Strikers full-time card | (not measured before) | 430×276 sideways, 440×346 desktop; Try again 48 / 56; Arcade / More / Leaderboard 44 / 48 |
| Breakaway menu card | **cream** card, r24, Play 64, small 52; 844×390: 640×406 from y56, bottom row (incl. Arcade) 40 px off-screen | **neon** card like the others, r20, Play 48 / 56, small 44 / 48; 844×390: 640×267 from y85, fits (Play and the small row share the last row) |
| Pinball card | 350–400, r28, pad 20/18/14, title 30, Play 80, icons 52 | 350–440, r20, pad 20/22, title 32, Play 56 (48), icons 48 (44) |
| Tennis card | pad 22/20/18, title 32 / 24, Play 64 / 52, icons 56 / 48 | pad 20/22 (14/18), title 32 / 26, Play 56 / 48, icons 48 / 44 |

**Not changed / not verified.** Start and full-time cards keep their game-specific content (route picker, court picker, division
ladder, Strikers goals). Tennis / Pinball / Pass Puzzles full-time cards could not be forced from a dev hook in headless Chrome (the forced
state did not end the run); they are the same components and classes as the start cards measured above. Pass Puzzles' pass-type chips
(52 px) and its start menu (a page, not a card) were left as they are. No real iPhone was used: notches are emulated.

Tests: `tests/arcade-consistency.cjs` (in the `npm test` chain: tokens defined and global, all five games use them, 56+ px buttons in every
media override, every gutter plus its inset, cards scroll, no animation in the token sheet); shared reader `tests/fixtures/arcadeTokens.cjs`;
updated arcade-chrome-shared, strikers-landscape-controls, strikers-landscape-joystick, breakaway-clean-ui-oct27, runner-r3-routes,
pinball-r3-oct26. Heat: static tokens only; no new animation or loop.
