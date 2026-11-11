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
