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
