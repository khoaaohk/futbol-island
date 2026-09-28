# Authoring pop-up book spreads (contract)

Every player book is a paper pop-up book rendered by one engine. The reference implementation is the Messi book in `lib/books/bookDiorama.ts`. Read it fully before you author anything.

## Files and ownership

- Engine (do not edit): `lib/books/popupEngine.ts`, `popupPlates.ts`, `popupScenery.ts`, `components/PlayerBookScene.tsx` and `components/PlayerPopUpBook.tsx`.
- Stories (do not edit the text, because narration audio is hashed from it): `lib/books/stories/<id>.ts`.
- Narration cues (read only): `public/voice/books/<id>/narration.json`. Each page has `cues[{text,start,duration}]` in seconds.
- **You own exactly one file: `lib/books/spreads/<id>.ts`.** It exports `SPREADS: Record<pageId, SpreadDef>` with one spread per page id of that book. Any page missing from it falls back to a plain generic spread.
- You may add book-specific plate painters inside your own file. Build them with `spec`-style `PlateSpec` objects `{key,w,h,paint(k)}` using the `Kit` API from `popupPlates.ts`. Keys must be unique and prefixed with your book id (e.g. `falcao-court-...`).

## Art direction (the user's reference: real paper pop-up books)

- Thin printed paper cutouts in the riso style: flat inks, halftone `dots`, `hatch` screens and navy key linework. Every plate gets the cream die-cut rim automatically. No rounded 3D shapes.
- Layer every spread: a V-fold backdrop (`B.vfold`) across the gutter, middle-ground stands (layer 1–2) and foreground stands (layer 3), all on the page prints. Aim for 12–25 pieces per spread, so it reads as detailed and full.
- Page prints (`left(k)` and `right(k)`) set the ground: pitch, court, street, sand or water, with chalk lines, paths, footprints and big printed words. Page coordinates run x from −5 to 0 on the left page and 0 to 5 on the right, with `y = z + 3.2`. Use `Z(z)` as in the Messi file.
- Use the brad-jointed characters: `B.person(key,x,z,h,{shirt,hair,skin,number,face,legs,holdL,holdR,adult,layer})` returns `{body,armL,armR,leg?}`. The available shirts are `arg | ger | keeper | coach | casual | bib | navy | fan`. Choose kits that fit the player's real teams without copying club badges, e.g. `navy` with a stripe, or `bib` in a colour. Don't copy real logos or crests.
- Mechanisms available:
  - `stand` (folds flat when the spread closes);
  - `flat` hinged pieces (drawbridge);
  - `piece.flap(spec,x,y,{anchor:'top'|'bottom'|'bl'|'br',axis:'x'|'y'})` for lift-flaps, flip cards and doors;
  - `piece.arm(spec,x,y)` for pivots and swing arms (e.g. the paper plane on a strip);
  - `piece.add(spec,x,y)` for rigid attachments you can slide, scale or show;
  - `B.slot(x,z,x2,z2)` prints a slot for sliders;
  - `vfold.add(spec,'L'|'R',along,up)` puts pieces on the backdrop (sun, clouds, stars, banners).
- Honest paper motion only: rotate about hinges and pins, slide in slots, lift, flip and scale-pop from zero like unfolding. Don't squash pieces, and don't make them float freely unless they're on a pin or strip.

## Story and timing

- `build(B)` returns `pose(beat)`, a **pure function** of `beat.t` (Coach Bella's narration time in seconds) and `beat.action` (0–1, the reader's tap action; stepped pages go 0, 1/n, … 1). Never keep state between calls. This is what makes pause, seek and replay correct.
- Author meaningful beats for **every narration sentence** of the page, using the cue times in `narration.json`. Figures pop up, gesture, the ball moves, flaps open, scoreboards flip and the composition changes. Keep the scene evolving for the whole track. Use the helpers `beat(t,a,b)`, `pulse(t,a,b)` and `wave(t,a,b,hz)`.
- When `beat.narrated` is false (no narration), the scene is posed at `rest`, where `rest` is the time of the complete scene just before the main action. The page's action (`beat.action`) must then visibly perform the page prompt from `lib/books/stories/<id>.ts` (e.g. "Flip the scoreboard"). The action must also work while narrated.
- Return a camera focus from `pose`: −1 left page, 0 whole spread, 1 right page, eased with `beat()`. On narrow phones the camera follows it. Keep it at 0 unless a beat clearly lives on one page.
- Facts shown in print must match the story text exactly: years, scores and names. Don't invent anything else (no quotes, no extra stats).

## Gates

- `npx tsc --noEmit` passes. Don't edit other files.
- Paint check: every plate paints without throwing, and spreads build in under about 60 ms each.
- Visual check (required): open your book in the real app and look at the screenshots at 1280×800 and 390×844, for every page at rest, at 3 or more narration times, and after its action. Harness: the scratchpad `book/open.mjs` has `openBook(mode,{book})`. Fix overlaps, clipped text, pieces outside the page and unreadable scale.
