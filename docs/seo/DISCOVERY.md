# Discovery, link structure and measurement (Nov 10 2026)

Why: the site had 733 URLs in its sitemap, canonicals, JSON-LD, robots and llms.txt, and still no visible presence in web
search. Everything here works without Google Search Console. Checks: `node tests/seo-discovery.cjs`.

## 1. IndexNow: tell Bing, Yandex, Seznam and Naver after each deploy

IndexNow is an open protocol: one POST tells the taking-part search engines which URLs are new or changed. Bing's index also
feeds DuckDuckGo, Yahoo, Ecosia and Copilot. Google does not take part. No account: the proof of ownership is a key file.

- Key file: `public/6813343b75608f0752c63149e9c7dc12.txt` (served at `https://futbolisland.app/6813343b75608f0752c63149e9c7dc12.txt`;
  the file holds the key and nothing else). Do not rename or delete it. It is not a secret.
- Script: `scripts/indexnow.mjs`. It reads the LIVE sitemap, so run it after the deploy is live.

**After each deploy that changes pages, run one command:**

```bash
node scripts/indexnow.mjs --changed-since 2026-11-10
```

Use the day of the content change (the script sends every URL whose sitemap `<lastmod>` is on or after it; the dates come from
`lib/site/updated.ts`, so bump a section's date when its content really changes). The FIRST time, send everything:

```bash
node scripts/indexnow.mjs
```

- `--dry-run` reads and counts and sends nothing. `--sitemap <url|file>` reads another sitemap.
- It prints one line, for example `indexnow: 733 of 733 sitemap URLs, key file /6813….txt; sent in 1 batch: HTTP 200 (accepted).`
- Before sending it checks that the key file answers on the live site. If it does not (the deploy is not out yet), it sends
  nothing and says so.
- Statuses: 200 OK; 202 accepted, key check pending; 400 bad request; 403 key not valid (the key file is missing or wrong);
  422 a URL is not on futbolisland.app; 429 too many requests (wait, do not loop).
- At most 10,000 URLs per call (the script batches). Do not resend unchanged URLs every day; send after real changes.

## 2. `www` goes to the apex

`https://www.futbolisland.app/…` answered 200 with a full copy of every page. `next.config.mjs` now has `WWW_TO_APEX`, the first
redirect: permanent (308), only when the Host header is exactly `www.futbolisland.app`, to `https://futbolisland.app/<same path>`
(the query is kept). The apex, `*.vercel.app` previews and localhost never match, and the destination cannot match the rule
again, so it cannot loop. After the deploy, check: `curl -sI https://www.futbolisland.app/cards/1 | head -3` shows `308` and
`location: https://futbolisland.app/cards/1`. (If the `www` domain is ever set to "redirect" in the Vercel dashboard, that is
fine too: the result is the same.)

## 3. Pictures on the long-tail pages

| Page | Picture | Why |
|---|---|---|
| `/fish/<id>` | `/fish/<id>/art.png` (920×560): the game's own drawing, as the page's one `<img>` with alt text, width and height. Share picture `/fish/<id>/og.png` (1200×630) with the drawing, the name and the club | The drawing exists (`components/FishArt.tsx`) |
| `/cards/<n>` | Share picture `/cards/<n>/og.png`: card number, position, name, country, iconic play. No `<img>` on the page | The card art is a pair of print masks made from player photographs that the game composites in the browser. It is not a picture a page can show, and putting photo-derived likenesses of real players in image search is a rights question for the owner |
| `/exhibits/<id>` | Share picture `/exhibits/<id>/og.png`: year, title, gallery. No `<img>` on the page | The exhibits' art is interactive canvas and 3D. The World Cup ball maps (`audit/*-map.png`) are unwrapped textures, not pictures of a ball |

All pictures are drawn at build time by route handlers (`force-static` + `generateStaticParams`, `lib/site/ogImage.tsx`), so a
visitor only downloads a PNG: no script, no canvas, no animation. Each page names its own picture in Open Graph, Twitter and
JSON-LD `image`. The two fonts are read from the repo (IslandBrush and the Noto Sans inside Next), so the build fetches nothing.
Build cost: about 770 small PNGs, roughly 0.1 to 0.4 s each.

## 4. Internal links

`lib/site/related.ts` computes, from the same data each page shows: previous and next (the collection's own order, wrapping);
"more like this" groups (cards: same position and era, same country, same club; exhibits: same gallery, next on the timeline;
fish: same fishing spot, same rarity, then player cards from the animal's club or animals from the same country); and one
lesson or topic page that teaches the same football (`ROLE_LESSON`, `EXHIBIT_READING`). Each group takes the next few items
after the current one, so links spread evenly instead of every page pointing at the same famous few. 10 to 15 links in the
page body. `components/site/RelatedLinks.tsx` renders them with the existing index-list styles. Breadcrumbs were already there.

## 5. Card pages: thin-content audit

All 450 cards, measured on Nov 10 2026: the hand-written text per card (blurb + strengths) is 17 to 40 words, median 30; no two
blurbs are the same; 449 of 450 have a club list and all have a country. With the club list a page had roughly 45 to 70 words
that no other page has: thin.

Added from data that already exists (nothing invented): the iconic play and the idea it teaches for the 400 cards that have a
film (`lib/site/cardPlays.generated.json`, copied from the film sources by `scripts/gen-card-plays.mjs`; 5 to 34 words, median
14), the lesson for the card's position with the lesson's own concept text (shared by cards of the same position), and the
related cards. A typical card page now has about 70 to 95 words found on no other page and 170 to 230 words in all.

Honest limit: the unique text still does not reach 120 words per card from existing data. The 50 cards without a film stay
close to where they were. Real depth needs new, checked writing per player (for example two or three sourced sentences on
what to watch in their game), which is content work, not template work. Until then the card pages are best treated as a
supporting collection that links up to lessons, not as pages expected to rank on their own.

## 6. Search arrivals in `/admin` (Marketing tab)

A stand-in for a search console built on what the site already counts: sessions whose first page came from a search engine
(Google, Bing, DuckDuckGo, Yahoo, Ecosia, Brave, Yandex, Baidu, a few smaller ones) or an AI assistant (ChatGPT, Perplexity,
Copilot, Claude, Gemini), by engine and by landing page, per day and per Monday week, with the first day each landing page was
reached. Exact numbers. Code: `lib/analytics/searchIds.ts`, `lib/analytics/searchReport.ts`, `app/admin/SearchSection.tsx`.

What it can and cannot show: it shows visits, not impressions, positions or search words. Search engines do not pass the words
on, and nothing here reads a query string.

**What was added to collection (for the privacy policy):** when a visit starts from a search engine or AI assistant, the site
now counts one more anonymous total per day: *which public page the visit landed on, together with the name of the engine*
(for example "/cards/45 from Google: 3"). Before, a session kept the referring site's host name and only a coarse entry path
(every reading page was "/other"). No new identifier, cookie or storage, no full referring URL, no search words. The engine
name is worked out in the browser from the referring host (already sent) or a link's `utm_source` (already sent). Nothing is
counted under Do-Not-Track or Global Privacy Control, for bots, on previews or from an admin tab, as before. No database
migration: the new ids use the existing counter columns.

The "By referring site" card uses the referrer-host totals that already exist for every tracked day, so it also covers days
before Nov 10 2026 (without landing pages).

## At deploy time

1. Deploy. Check `https://futbolisland.app/6813343b75608f0752c63149e9c7dc12.txt` shows the key, and the `www` check above.
2. Open one of each: `/fish/sea-bass/art.png`, `/fish/sea-bass/og.png`, `/cards/1/og.png`, `/exhibits/telstar-1970/og.png`.
3. Run `node scripts/indexnow.mjs` once (everything), then `--changed-since <day>` after later content changes.
4. Add the search-arrival line above to the privacy policy's list of what is counted.
5. Links from other sites are what gets a new domain crawled by Google: `docs/seo/LISTINGS.md`.

## Game pages (Nov 10 2026)

Seven search pages for the arcade (registry `lib/site/games.ts`, routes `app/(site)/games`, test `tests/seo-games.cjs`). Static reading pages: no game canvas. Not linked from the home page or the game UI; reached from `/games`, each other, "More to learn", the formations and positions hubs, the offside rule and four drill pages. All seven are in `/sitemap.xml`, `/sitemap-images.xml` (screenshots + share pictures), `llms.txt` and `llms-full.txt`; `scripts/indexnow.mjs` reads the live sitemap, so `node scripts/indexnow.mjs --changed-since 2026-11-10` sends them after the deploy. `/arcade` stays noindex with the canonical `/arcade` for every `?game=` deep link.

| URL | Game | Target queries |
| --- | --- | --- |
| `/games` | hub | free soccer games for kids, soccer games online no ads, soccer games for school Chromebook, football games for kids free |
| `/games/soccer-swipe-game` | Kit Rush | soccer swipe game, soccer slice game, soccer reaction game for kids, kit rush game |
| `/games/soccer-snake-game` | Squad Snake | soccer snake game, football snake game, soccer formation game, learn soccer positions game |
| `/games/soccer-runner-game` | Breakaway Run | soccer runner game, endless soccer runner, soccer dribbling game online, football running game |
| `/games/soccer-tennis-game` | Futbol Tennis | soccer tennis game online, football tennis game, what is soccer tennis, first touch game |
| `/games/soccer-pinball` | Futbol Pinball | soccer pinball, football pinball game online, free pinball game no download |
| `/games/soccer-passing-puzzle-game` | Pass Puzzles | soccer puzzle game, soccer passing game, soccer tactics puzzle, offside game for kids |

Pictures: `public/games/` (12 WebP screenshots, 7 share pictures, about 1.1 MB in all), rebuilt with `python3 docs/seo/build-game-images.py` from `docs/arcade-aaa/shots`. Queue for Search Console: `docs/seo/GAME-PAGES-QUEUE.md`.
