# Game pages: indexing queue (Nov 10 2026)

Put these seven at the FRONT of the Search Console "Request indexing" queue once the deploy is live (the hub first: it links the other six). Then run `node scripts/indexnow.mjs --changed-since 2026-11-10` for Bing and the engines that read IndexNow.

1. https://futbolisland.app/games
2. https://futbolisland.app/games/soccer-pinball
3. https://futbolisland.app/games/soccer-snake-game
4. https://futbolisland.app/games/soccer-runner-game
5. https://futbolisland.app/games/soccer-passing-puzzle-game
6. https://futbolisland.app/games/soccer-tennis-game
7. https://futbolisland.app/games/soccer-swipe-game

Order after the hub: the pages whose head term is the clearest match for an existing search ("soccer pinball", "soccer snake game") go first.

Do NOT request `/arcade` or any `/arcade?game=` URL: the arcade is noindex with the canonical `/arcade`; the pages above are the indexable ones.

Guide pages that gained a link to a game page (already indexed or queued; no new request needed, a recrawl picks the links up): `/learn/soccer-formations`, `/learn/soccer-positions`, `/learn/soccer-rules/offside`, `/learn/soccer-drills/shoulder-check-colors`, `/learn/soccer-drills/wall-passing`, `/learn/soccer-drills/first-touch-gates`, `/learn/soccer-drills/dribble-and-shoot`.

Before requesting: check each URL answers 200 on the live site, and that `https://futbolisland.app/sitemap.xml` lists all seven.

## Nov 17 2026: three new game pages

Request these after the deploy is live (the hub first again: its game list, count and pictures changed), then run
`node scripts/indexnow.mjs --changed-since 2026-11-17`.

1. https://futbolisland.app/games
2. https://futbolisland.app/games/soccer-block-puzzle-game (Line Up!)
3. https://futbolisland.app/games/soccer-merge-game (Trophy Drop)
4. https://futbolisland.app/games/soccer-tap-puzzle-game (Clear the Box)

Guide pages that gained a link to one of them (a recrawl picks it up): `/learn/soccer-drills/pressure-and-cover-2v2`,
`/learn/soccer-drills/toe-taps-and-foundations`, `/learn/soccer-drills/busy-square-dribbling`.

## Nov 17 2026: Street Dash's page (merged with the three above)

Request after the deploy is live (the hub again: its count, description and share picture changed), then run
`node scripts/indexnow.mjs --changed-since 2026-11-17`.

1. https://futbolisland.app/games
2. https://futbolisland.app/games/soccer-side-scroller-game (Street Dash)

Guide page that gained a link to it (a recrawl picks it up): `/learn/soccer-drills/gates-dribbling`.

## Nov 17 2026: Roll It In's page (branch rollball; replaces Clear the Box later, see the coordinator's notes)

Request after the deploy is live (the hub again: its intro, pick list and FAQ changed), then run
`node scripts/indexnow.mjs --changed-since 2026-11-17`.

1. https://futbolisland.app/games
2. https://futbolisland.app/games/soccer-ball-rolling-puzzle-game (Roll It In)

Guide page that gained a link to it: `/learn/soccer-drills/partner-passing-through-gates`. The hub share picture still says the old
count: rebuild it with `python3 docs/seo/build-game-images.py` once the source shots of the other games are in docs/arcade-aaa/shots.

## Adding the next game page (done for Street Dash, `streetdash`, Nov 17 2026; keep as the recipe)

The count words ("ten games", the back-wall sign, /arcade, /games) follow `arcadeCabinets.length` (lib/arcade/arcadeCatalog.ts
ARCADE_GAME_COUNT / ARCADE_GAME_WORD, lib/numberWord.ts): nothing to retype. If the cabinet merges before its page, add the id
to PAGE_PENDING in tests/seo-games.cjs until the page lands. The page itself:

1. `lib/site/games.ts`: add `'streetdash'` to `GameId` and one entry to `GAME_PAGES` (every field, facts from its core and
   direction doc; h1 starts "Soccer ", title 30-60 with "soccer" and "free", description 120-155; 3-5 tips, 4-6 FAQs with the
   free / phone + Chromebook / How do you play / What age questions). Add its kind of game to `GAMES_HUB.description` (keep
   120-155) and `GAMES_HUB.intro`, and a line in `GAMES_HUB.pick` if it fits one.
2. Media: capture on a 390x844 phone at DPR 2 (real play, scripted input) a 10 s clip and three stills; write
   `public/games/clips/streetdash.{mp4,webm,webp}` (332x720, 30 fps, H.264 + VP9, no audio; poster = still 1) and
   `public/games/shots/streetdash-{1,2,3}.webp` (480x1039, WebP q74), and add the sizes to `lib/site/gameMedia.json`.
3. `lib/site/gameMedia.ts`: `GAME_CLIP_DEFS`, `gamePaths`, `STILL_WORDS`, `STILL_CAPS` entries for `streetdash`.
4. `docs/seo/build-game-images.py`: one `GAMES` line (two source PNGs in docs/arcade-aaa/shots), run it with the name prefix:
   two 480 px WebP stills and the 1200x630 share picture in `public/games/`; the hub share picture's count updates itself.
5. One guide page links it: add `gameLink('streetdash')` to `lib/site/drillLinks.ts` and to one drill's `links` (or a rule /
   term page), and the pair to the `inbound` list in tests/seo-games.cjs.
6. tests/seo-games.cjs: its path in `WANT`; the root byte budget (2.0 MB) has room for one more game.
7. This file: its URL in a new queue; `docs/seo/DISCOVERY.md` table row. Then `node scripts/gen-lastmod.cjs` and
   `node scripts/content-dates.cjs`.
