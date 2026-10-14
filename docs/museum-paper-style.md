# Museum Paper style (Oct 12 2026)

The user asked for every museum exhibit except the penalty kick to be a full-screen interactive mini-game in the "anatomy"
isometric technical-illustration style, Paper theme (the `anatomy` skill; reference https://skills.wheresryan.sh/anatomy):
"these games should not be the pixel style. only the penalty kick should be pixel game", "it needs to be larger and fill the
entire screen", "the rest of the game should be in this style".

- **Paper exhibits (11):** telstar-1970, laced-leather, shirts, stadiums, var-2018, boots, laws-1863, futsal-1989,
  wwc-1991, hall-of-fame (the Trophy room), timeline. (Oct 12 2026: stadiums replaced cards-1970, boots replaced
  backpass-1992; stadiums draws its models with its own geometry.ts on iso-kit and uses `usePaperLoop`.)
- **Not Paper:** penalty-1891 is the pixel arcade cabinet (`docs/museum-pixel-iso.md`); worldcup-1930 and the World Cup balls
  display keep their own looks.

## The shared kit: `components/museum/experiences/anatomy/`

| File | What it is | Used by |
|---|---|---|
| `iso-kit.ts`, `draw.tsx`, `live.tsx` | The anatomy skill's kit: projection, `fitProjection`, solids with four-tone shading, painter's depth, `ISO_CSS`; React `Solid` / `Line` / `Dots` | all eleven |
| `paper-loop.ts` | **The one frame loop.** `createPaperLoop` plus thin hook adapters: `usePaperLoop`, `useFrames`, `useFrameLoop`, `useRaf` | all but shirts (no loop) |
| `paper-kit.tsx` | `PAPER_CSS` / `<PaperStyle/>` (the Paper tokens), `useBox`, `fit`, `toFloor`, shared parts (base plate, peg, ball, ruler, goal, dial) | laws, futsal, wwc; `useBox` also via PaperStage |
| `PaperRoom.tsx`, `paper.module.css` | The room: wall label, one big card, dock, history below the fold; `PaperCard`, `Banner`, `Intro`, `ScoreCover`, `noteSpace` | laws, futsal, wwc |
| `PaperStage.tsx`, `PaperStage.module.css` | The sibling room for the figure exhibits: `Room`, `Corners`, `Sheet`, `Parts`, `Items`, `PaperDefs` | cards, var, backpass |
| `figure.ts` | Paper mannequins (capsule bodies, poses, runs, ball, depth sort) | cards, var, backpass |
| `bench.tsx` | Frames (wide / tall model orientation), `Base`, `Tint`, `Sphere`, `LabelPlate`, `useBox(ref)`, `useLive` | telstar, laced-leather, shirts |
| `hooks.ts` | `useSize` (an element's live px size) | hall-of-fame, timeline |

Hall-of-fame and timeline keep their own `Draw.tsx` (their display lists differ); everything else that was copied between
exhibits now lives here. Two room components remain (`PaperRoom`, `PaperStage`): they share tokens and behaviour but differ in
layout details, and merging them was not worth the risk.

## Rules

1. **The first screen is the game.** Wall label beside Back, ONE rounded paper card taking the rest of `100dvh`, the controls
   under it. History, sources and the ending scroll below. No horizontal scroll at 390 px.
2. **The drawing fills the card.** The SVG viewBox is the card's own pixel size (`useBox` / `useSize`), and the camera is fitted
   to the action, not to empty plate. On a phone, frame the action (the plate may run past the card's edges) and steepen the
   camera rather than leave paper above and below.
3. **Paper tokens, the same everywhere** (`tests/museum-paper-kit.cjs` checks them): card ground `#e0e0db`; solids `#f7f7f3`
   (sides `#d3d3ce` / `#dcdcd7` / `#e3e3de` / `#e9e9e4`, lit from the top left); hairlines `#3a3a3c` / `#6f6f72` / `#98989a` /
   `#c2c2bd` at `.8px`; one soft halo under each base (`#4a4a44` at .34, `blur(14px)`, 6 px down); room ground `#ecebe6`.
4. **One accent per exhibit,** only for the idea (red `#e4322b`, blue `#2a5bd7`, yellow `#f2c230`, green `#1f8a5b`). Real
   colours only where colour is the subject (kits, dyes, turf, leather).
5. **Text on the card never covers the scene.** Corner captions are short mono labels (Fig · title · hint · live readout); on a
   phone they wrap to two lines or the hint hides. A note card sits in a corner on wide cards (`data-wide-note`) or across the
   top on narrow ones, and the scene is fitted below it (`noteSpace`).
6. **Heat.** One loop, `paper-loop.ts`; no `requestAnimationFrame` anywhere else. It runs only after `wake()` and only while
   the tick returns true (0 rAF at rest), parks while the card is off-screen (IntersectionObserver) or the tab is hidden,
   resumes where it was, and is disposed on unmount. A wake from inside a tick never starts a second chain. Drawing is SVG,
   redrawn on change.
7. **Reduced motion** is a complete static or turn-based version: the loop runs its tick to the end synchronously.
8. **Keep the contract:** `role="dialog"`, Back (`ExperienceBack`) and Escape, `data-museum-experience`, the best-score key,
   `onComplete` once at the real end, verified facts and sources.

## Checks

`tests/museum-paper-kit.cjs` (one loop, its behaviour, tokens, no duplicates) and `tests/museum-exp-<id>.cjs` per exhibit, all in
`npm test`. Dev labs: `/museum-lab/<id>`.
