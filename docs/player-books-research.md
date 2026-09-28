# Player pop-up books — September 27, 2026

## Direction
A child opens a real-feeling paper object, then unfolds a football lesson. Original riso artwork, cream #f0ece2, blue #0078bf, navy #22366b, yellow #ffe800 and restrained pink #ff48b0 for setbacks. Creases, paper tabs and overlapping ink are the signature. Each page has one meaningful action, visible consequence, a short historical passage and a distinct practical takeaway. No fabricated quotes, private thoughts or claims that grit guarantees winning. Ending: teammates and support matter, not just trophies.

This is a purchased interactive book, not a replacement for the existing narrated path-film system. Follow its riso visual language. Use original code/native artwork. Phone 390×844 readable; page controls and interactions >=44px. No autoplay, video, WebGL context, idle rAF or continuous CSS animation. Mount only while opened, release resources on close, respect reduced motion, pause the underlying island, preserve ownership and reading progress without polling.

## GitHub research
- https://github.com/Nodlik/StPageFlip — page-turn library, HTML/canvas content and mobile input; useful references for hard-cover/soft-page separation. Do not add a dependency just for one book.
- https://github.com/codrops/BookBlock — CSS-driven page folding, configurable shadows and navigation; older jQuery architecture unsuitable for this React app. Borrow the physical fold concept, not its runtime or artwork.
- https://github.com/codrops/BookPreview — shelf-to-reader context and fullscreen reading. Keep a clear return to the vending machine.
- https://github.com/EricKnocklein/animated_book_css — articulated CSS book opening; reference for transform origins and layered covers. No assets/code copied.
Decision: original finite CSS paper transitions and original riso scenes, event-driven interactions, no added package. These references provide page mechanics, not a ready-made riso pop-up story.

## Historical sources (accessed September 27, 2026)
- FC Barcelona, “Messi, his arrival at Barça”: https://www.fcbarcelona.com/en/news/1120152/messi-his-arrival-at-barca — at 13, left Rosario for Barcelona. Supports moving far from home; avoid invented dialogue or feelings.
- FIFA, “Messi calls time on international career”: https://inside.fifa.com/tournaments/mens/worldcup/2018russia/news/messi-calls-time-on-international-career-2803995 — 2014 World Cup and 2007/2015/2016 Copa América final defeats; 2016 retirement announcement. Do not imply he had never won with Argentina: youth world title 2005 and Olympic gold 2008 predate these.
- CONMEBOL, “Copa América 2021: Argentina reaches glory after 28 years”: https://copaamerica.com/en/news/copa-america-2021-argentina-champions-after-28-years — Argentina beat Brazil 1–0; Di María scored; Messi four goals and five assists. Team achievement.
- FIFA, “A tribute to Messi”: https://vod.fifa.com/tournaments/mens/worldcup/qatar2022/news/messi-overhauls-peles-long-standing-landmark — setbacks then 2021 senior international title.
- FIFA, Qatar 2022 at a glance: https://ipt.fifa.com/tournament-organisation/world-cup-2022-in-numbers/fifa-world-cup-qatar-2022-at-a-glance — 2022 tournament record/context.
- FIFA, “La historia de Lionel Messi en la Copa Mundial: Catar 2022”: https://www.fifa.com/es/articles/lionel-messi-catar-2022-copa-mundial — 2022 final and Argentina’s shootout victory.
Historical scope deliberately ends in 2022. Coaching reflections and interactions are ours, not historical reenactments or Messi quotations. No external photos, club badges, licensed game characters, or medical-treatment advice.

## Integration
Keep existing `display:plaza:book` ID and 450-coin price. Only a known story/item pair bypasses the home-decoration preview gate. Existing shared wallet records debit+ownership atomically. Reopening an owned book never spends again. Other books remain previews until written. My Home remains hidden.

## Original pop-up artwork implementation (local, September 27)
The art pass reviewed StPageFlip and BookBlock's GitHub documentation directly. Useful lessons were distinct hard/soft paper behavior, fold origins, and portrait input handling. No repository code, dependency, artwork or licenses were imported. Unlike an always-running page simulation, this reader keeps one spread mounted and uses finite native CSS transforms after a user action.

Six separately composed SVG paper scenes use cream stock, restrained registration, navy dot screens, ink speckle, cut edges, abstract Argentina-shirt figures and layered paper bases:
- Rosario to Barcelona: a folded skyline rises and a paper plane crosses the water.
- Close control: each of three taps makes a short cushioned ball touch; the player moves with the ball and the space markers fill.
- The 2014 final: a hinged score flap opens to reveal a reassurance print underneath.
- Returning: an accordion bridge unfolds to a waiting teammate; the returning player then crosses toward support.
- The 2021 team: a diagonal yellow passing lane, moving paneled ball and unfolding receiver communicate the assist.
- The 2022 team: a trophy rises between three teammates as their arms lift and paper confetti opens out.

The reader supports direct artwork taps/Enter/Space, the yellow action tab, keyboard left/right, and deliberate horizontal swipes over the picture (vertical scrolling is left to the browser; canceled pointers do not turn pages). Paper turns have directional origins. Existing close/Escape, focus trap, owned-book checks and bookmark remain. Short landscape layouts keep the illustration pinned alongside scrolling prose; phone layouts retain normal document scrolling. All scene animations stop within 950ms; reduced motion removes transitions, touch bounce and page animation. There is no renderer, rAF, timer, new media, idle animation or new asset fetch in this art pass.

Validation: `npx tsc --noEmit` passed. `scripts/check-player-book-browser.cjs` passed phone390×844, desktop1280×800 and landscape844×390 for purchase, all six actions, bookmark, one debit, 44px controls, sleeping underlying island and desktop reduced-motion. Phone and desktop screenshots visually reviewed. Short-wide layout was subsequently refined after spotting a cropped illustration in the first landscape capture; a follow-up browser run passed landscape844×390 and smallphone320×568, and the new landscape screenshot shows the whole bridge illustration beside the prose. The small phone retains scrolling; the artwork itself is directly interactive so a reader can operate it while fully in view. Final consolidated checks run after shared-agent edits settle. Physical iPhone temperature and native gesture feel remain unmeasured. Not committed or deployed by this art pass.

## Paper pop-up engine rebuild (September 27, local, not deployed)
The user's reference images (a paper V-fold kitchen and a layered white paper forest) replaced the earlier rounded "toy diorama" look. The rounded Three.js sculptures and squash-fold have been removed from the reader. Everything is original code and art, and no dependencies were added.

- `lib/books/popupPlates.ts` paints die-cut riso plates in Canvas 2D:
  - a colour drum and a navy key drum, printed out of register and multiplied;
  - halftone screens, ink grain, pinholes and density drift;
  - a cream die-cut rim with a darker cut edge.
  - Characters are armless bodies with separate brad-jointed arm and leg plates. The gold split pin is printed at each pivot.
- `lib/books/popupScenery.ts` contains the scenery plates: trees, houses, goals, scoreboards and flaps, trophies, bunting, fireworks, bridge decks, flip cards, bubbles, icons, banners and so on.
- `lib/books/popupEngine.ts` has the mechanics:
  - Pages are rigid or curling leaves on the spine.
  - A **stand** piece is glued on a hinge line. It rises as its spread opens and folds backward flat as the spread closes, staggered by layer. The closing page also presses tall pieces flat before it can touch them.
  - A **V-fold** backdrop across the gutter is solved exactly from both page angles, with a 90° paper corner.
  - **Flat** hinged pieces are used for the drawbridge.
  - Pieces can carry brad arms and legs, hinged flaps, slot sliders (with printed slots) and lifts.
  - Glue tabs are printed under every glued piece.
  - A cut-out's back renders as cream stock, not a mirrored print.
- `lib/books/bookDiorama.ts` now holds the six spreads. Each spread has page prints, a V-fold backdrop, pieces and `pose(beat)`.
  - The pose is a pure function of Coach Bella's media time and the reader's own action, so pause, seek and replay all agree.
  - Every narration sentence has visible paper beats. Pieces rise mid-scene, and arms, sliders, flaps, flip cards and swing arms move.
  - Without narration, a spread shows its `rest` moment: the full scene just before its main action, which the action tab then performs.
- `components/PlayerBookScene.tsx` handles the book itself:
  - cloth boards, printed page-block edges, cover art, and a curling double-printed page leaf;
  - the opening, where the cover lifts and pieces rise;
  - page turns, where the old scenery folds away, the page curls across and the new scene unfolds in layers;
  - the close on Back, played after the shared shrinking exit animation.
  - Narrow screens get a closer camera that follows each beat's focus (left page, spread or right page).
- `components/PlayerPopUpBook.tsx` and its CSS lay out the reader:
  - Back is at 24/20 on desktop and 18/16 on phones, measured.
  - The chapter title sits at the top. Previous, action and Next sit in one row above the shared StoryPlaybackBar, and prose stays in Read.
  - The book takes most of the screen.
- `bookPaper.ts` and `bookIllustrations.ts` are no longer imported by the reader. They were left in place from the earlier pass.

Browser evidence, local :8092: `scripts/check-player-book-browser.cjs` (phone, desktop, landscape), `check-book-diorama-browser.cjs` (updated for the 3 s turn and the Back close), `check-book-narration-browser.cjs` (updated: the paper animates while narrating and sleeps when paused) and `check-vending-preview-browser.cjs` pass. Screenshots of the opening, mid-turn, open, narration seeks on two spreads and the close were reviewed by eye at 1280×800 and 390×844.

## Seven more books (September 27, local, not deployed)
Every machine's book display is now readable. `lib/books/catalog.ts` maps a book to each machine, `vendingCatalog` gives each one a `storyId` and a blurb, and the price and ownership flow are the same as Messi's.

| Book | Machine | Theme |
|---|---|---|
| Falcão | rooftop | futsal, quick feet |
| Marta | oldtown | find space |
| Maldini | clubgrounds | defend together |
| Zidane | eleven | look up, then play |
| Ronaldinho | beach | play with joy |
| Pelé | pier | calm finishing |
| Cruyff | market | move into space |

- **Stories** live in `lib/books/stories/<id>.ts` (six pages each, typed by `lib/books/types.ts`). Facts were checked against FIFA, Britannica, Guinness, FC Barcelona, History.com and the Cruyff Foundation; the sources are listed per book. Coaching sentences are ours and are marked as practice or metaphor.
- **Registry and loading:** `lib/books/library.ts` is the text registry. `loadSpreads(id)` imports that book's spread chunk only when the book opens.
- **Spreads** are `lib/books/spreads/<id>.ts`, one owner per file, following `docs/player-books/SPREADS.md`. A page without authored art falls back to `lib/books/genericSpread.ts`.
- **Narration:** Coach Bella tracks are generated by `node scripts/build-book-narration.cjs <id>` into `public/voice/books/<id>/`. Pages run 34–43 s. `useBookNarration(pageId, bookId)` picks the book's manifest.
- **Reading progress:** the bookmark keeps a separate page per book (the saved object merges instead of being overwritten).
- **Tests:** `tests/book-narration.cjs` checks every book's hashes, cues, assets and the catalog mapping.
