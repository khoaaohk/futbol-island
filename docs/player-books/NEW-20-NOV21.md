# Twenty new hardship pop-up books (Nov 21 2026)

Owner brief: "add 20 more stories about players and the trials, adversity, and teaching about struggles and overcoming it. Research players and build out additional pop up books that will be able to purchase in the vending machines."

This pass wrote **research + story text only** (`lib/books/stories/<id>.ts`, commit `aae32537` on `books-20-nov21`). No spreads, narration, catalog entries or site pages yet, so nothing is visible or sold: the registry generator only makes a book READY when story + spreads + narration all exist, and none of the 20 is in `PLAYER_BOOKS`.

## Rules the stories follow

- Same shape as the 36 shipped books: 6 chapters (tests require 6 for READY books), each two paragraphs with the paper-action sentence (= `prompt` + ".") opening paragraph two, one `lesson` per chapter about the struggle and how to get through it, a short `response`, `steps` on multi-tap actions, `source` index into the book's own `sources`. ~70-80 words a page (shipped books average 83). No Spanish: no shipped story has `es` text and no test asks for it.
- No separate "what you can learn" page: the shipped format has none and READY books must have exactly 6 pages. The last chapter's lesson closes the book; the /books page "What it teaches" cards already list every lesson.
- Real history only, attributed to 2-3 sources per book. No quotations, no invented private thoughts. Lessons and coaching prompts are ours (file headers say so). None of the 20 books contains island fiction; if a spread adds island characters (Coach Bella, island kids) they stay in the art, never in the story text.
- Age 7-12: illness, war and loss are told gently (no injury, treatment or casualty detail). Racism is named as wrong, never quoted. Mental health (Renard, Earps, Caicedo) is framed as "asking for help / looking after your mind". Head injury (Čech) is framed as safety: stop and tell a grown-up; protective gear is smart.

## The 20 players

8 women, 12 men; 9 current or recently retired, 11 legends; 17 countries on 5 continents.

| id | Player | Country | Era | W/M | Adversity theme | Why this player |
|---|---|---|---|---|---|---|
| caicedo | Linda Caicedo | Colombia | current | W | Cancer at 15, back days after treatment, World Cup star at 18 | The clearest illness-and-hope story in women's football; only girl at a boys' village club at 5 |
| earps | Mary Earps | England | current | W | Dropped by England, nearly quit, then The Best keeper twice | Being left out is the most common setback kids face |
| hamm | Mia Hamm | USA | legend | W | Club foot, youngest on the team, her brother Garrett's illness and the foundation she built | Turning grief into helping others |
| sawa | Homare Sawa | Japan | legend | W | Contract ended, started over in the US; led Japan to the 2011 title months after the tsunami | Hope for a sad country; first Asian world player of the year |
| sinclair | Christine Sinclair | Canada | legend (ret. 2024) | W | Hat-trick and still lost the 2012 semi; bronze, bronze, then gold | Losing after your best game, and coming back |
| formiga | Formiga | Brazil | legend | W | Born when Brazil banned women's football; family resistance; two lost Olympic finals | Unfair rules change; longevity (7 World Cups + 7 Olympics) |
| renard | Wendie Renard | France | current | W | Lost her father at 8; not chosen at Clairefontaine; left Martinique at 16; protected her mental health | Rejection and leaving home young |
| morgan | Alex Morgan | USA | legend (ret. 2024) | W | Late start at 14, ACL at 17, lost the 2011 final | It's never too late to start |
| son | Son Heung-min | South Korea | current | M | Years of basics only, left home at 16, long wait for a trophy | Patience and practising the basics |
| vinicius | Vinícius Júnior | Brazil | current | M | Poverty, criticism, racism faced by speaking up; school charity | Courage against racism, told safely |
| griezmann | Antoine Griezmann | France | current | M | Turned down by French academies as too small, moved abroad at 14 | "Too small" story (Vardy's cousin, but a teenager) |
| vandijk | Virgil van Dijk | Netherlands | current | M | Washing dishes, "too many limitations", serious illness at 20, late bloomer | Late growth; illness and patience |
| howard | Tim Howard | USA | legend | M | Tourette syndrome and OCD; hiding tics; 15-save World Cup game | Neurodiversity as a strength |
| cech | Petr Čech | Czech Republic | legend | M | Broken leg made him a keeper; skull fracture, back in a headguard | Safety-first comeback |
| baggio | Roberto Baggio | Italy | legend | M | Knee wrecked at 18 (220 stitches); the 1994 penalty miss | "A miss is a moment, not who you are" |
| wright | Ian Wright | England | legend | M | Hard home life, the teacher who taught him to read, rejected, pro at 21 | Trusted adults; late start |
| mahrez | Riyad Mahrez | Algeria | current | M | Father died when he was 15, overlooked as too skinny, £450k signing | Grief and being judged on looks |
| milla | Roger Milla | Cameroon | legend | M | Called back at 38, oldest World Cup scorer at 42 | "Never too old" |
| dzeko | Edin Džeko | Bosnia and Herzegovina | current (Schalke) | M | Childhood in besieged Sarajevo, sold cheaply as "too tall" | Hope after war, told gently |
| bale | Gareth Bale | Wales | legend (ret. 2023) | M | 24 Premier League games without a win ("jinx"), then the world's best | Bad runs end |

Considered and left out: Messi (book exists), Abidal (2021 Hamraoui case coverage), Muamba (cardiac arrest too intense for this format; a first-aid lesson elsewhere is better), Rapinoe and Wambach (adult topics), Maradona, Best, Neymar (adult controversies), Victor Moses and Sterling (parents' violent deaths), Mbappé and Bellingham (thin adversity), Pulisic (thin), Shaqiri, Kudus, Hakimi (good backups for a later batch).

### Facts left out or worded carefully

- Caicedo: the 2023 training collapse is left out (cause never public). Silver Ball (U-17 WC) kept; IFFHS award left out.
- Earps: "dropped in 2019" and "thought about stopping in 2021" are from ESPN/BBC documentary coverage; the contract-pay detail is left out.
- Hamm: Garrett's adoption age differs between sources (left out). "Retired 2004" not verified (left out).
- Sawa: "only girl on the boys' team" not verified (left out); she "learned English" not verified (left out).
- Renard: Clairefontaine trial at 14 or 15 (sources differ) → "as a young teenager". The coach dispute behind the 2023 decision is left out.
- Morgan: ACL timing — her own account (senior year, back in five months) used; Team USA's "delayed until 2008" left out.
- Son: age his father first allowed league matches is 14, 15 or 16 depending on source → "until he was a teenager". Daily training hours (2 vs 6) left out.
- Vinícius: the 2022 final date is wrong in one source → "In May 2022". The effigy incident and court cases left out.
- Griezmann: the Barcelona "too small" claim is single-source (left out).
- Van Dijk: the hospital "will" and weight figures left out (only "lost a lot of weight").
- Howard: diagnosis age 9/10/12 → "as a boy". 15 saves (FIFA's updated count), not 16.
- Čech: injury mechanics left out. "Joined Chelsea in 2004" is common knowledge, not in the two cited pages: build agent should confirm in Wikipedia's Chelsea section.
- Baggio: the 1998 Chile penalty not verified (left out). Buddhism left out.
- Wright: stepfather's abuse → "home was not always a happy or safe place"; his early-1980s spell in prison over driving offences is left out. Broken-leg-before-1990-final not verified (left out). Reunion year 2005 per Wikipedia; other outlets say 2010 or 2019: the page could say "on a BBC programme" if a reviewer prefers.
- Mahrez: the AFCON semi winner is called "the winning goal" (it was a free kick; one source only says "goal").
- Milla: "came on as a substitute" at Italia 90 is common knowledge, not in the fetched pages: confirm. The 6–1 loss in 1994 left out.
- Džeko: the shell on the pitch is told only as "the pitch was hit; Edin was safe at home" (children were killed: left out). "Lamppost" nickname not verified (left out).
- Bale: 24 vs 25 winless games (24 used, most sources).

## What a book needs to be buyable + on /books

1. **Story** `lib/books/stories/<id>.ts` — done (exports `<ID>_BOOK: BookData`; do not edit text after narration: audio is hashed from title + text + lesson).
2. **Spreads** `lib/books/spreads/<id>.ts` exporting `SPREADS` (one per page id; see SPREADS.md).
3. **Narration** `node scripts/build-book-narration.cjs <id>` → `public/voice/books/<id>/narration.json` + audio (Kokoro, Coach Bella `af_bella`, speed 1.0).
4. `node scripts/gen-book-registry.cjs` → the book becomes READY in `lib/books/registry.generated.ts` / `registry.ids.generated.ts` (do not hand-edit).
5. **Catalog** `lib/books/catalog.ts` `PLAYER_BOOKS`: add `<id>: { itemId, title: '<Title>: <subtitle>', player, machine }` using the story's itemId (below). Item ids are permanent once sold.
6. **Vending** `lib/town/vendingCatalog.ts`: (a) `bookShortName` overrides for `vandijk:'Van Dijk'`, `vinicius:'Vinícius'`, `son:'Son'` (the default takes the last word of `player`, which gives "Dijk", "Júnior", "Heung-min"); (b) `MACHINE_BOOKS`: every shop machine currently sells exactly four and the generic rule only picks machines whose `booksForMachine` length is 4, so adding home books to a machine needs an owner decision on shelf size (see below) and an explicit `MACHINE_BOOKS` entry; (c) `displayThemes` covers are reused per index (`covers[i%4]`).
7. **/books page** `lib/site/bookPages/<id>.ts` (summary 30+ words ≤420 chars, ≥4 facts, 3-5 FAQ, `published`, optional `exhibits`) + import in `lib/site/bookPages/index.ts`; spread stills `public/books/spreads/<id>/<chapter>.webp` 960×600; `lib/site/books.ts` `REGION_OF` needs USA, Japan, South Korea, Czech Republic, Wales, Colombia, Algeria, Cameroon, Bosnia and Herzegovina, and a new `'Asia'` region (or owner-chosen grouping) for Sawa and Son; `FALLBACK_COUNTRY` for players without a site card (caicedo Colombia, howard USA, wright England, mahrez Algeria, milla Cameroon, dzeko Bosnia and Herzegovina — check `SITE_CARDS` first).
8. **Tests to update** when switched on: `tests/book-narration.cjs` (37 catalog entries), `tests/vending-machines.cjs` (36 sellable books, exactly 4 per machine, 36 display specials, specials counts per machine), `tests/books-site.cjs` (36 on the shelf / built pages / CollectionPage count), `tests/learn-content.cjs` (every catalog book narrated, so catalog + narration must land together).

Switch each book on only when all of 2-7 exist in the same commit, or the shelf shows "coming soon".

## Vending proposal (price, shelf, rarity)

- **Price:** 100 coins like every book (`BOOK_PRICE`, owner decision Sep 28). There is no rarity tier for books today; proposal: keep it that way (every story equal), optionally flag the 20 as "New" on the shelf for two weeks.
- **Home machines** (encoded in each story's `itemId`, two more per original machine, one more per Sep 29 book machine, themed by the machine's lesson):

| Machine | Theme | New books |
|---|---|---|
| plaza (Konbini, history/legends) | legends | baggio, milla |
| rooftop (futsal, quick feet) | small, skilful | griezmann, son |
| oldtown (7v7, women's shelf) | find space | caicedo, sawa |
| clubgrounds (9v9, defend together) | defenders | vandijk, renard |
| eleven (11v11, scan and pass) | speak up, be helped | vinicius, wright |
| beach (creative play) | flair | formiga, mahrez |
| pier (keepers pack) | goalkeepers | cech, earps |
| market (move into space) | long roads | dzeko, bale |
| northbeach | full shelf of defenders/overlap | hamm |
| causeway (penalties) | penalties | sinclair (Tokyo gold on penalties) |
| cayplaza (win it back) | told no, kept working | howard |
| sharks (strikers time runs) | strikers | morgan |

- **Owner decision needed:** shelves are 4 per machine (user, Sep 30). Options: (A) six books per original machine and five per book machine; (B) keep four on the glass and rotate weekly between home books; (C) a new "Library" book machine near the /library theme. Option A is the smallest code change; the vending atlas does not grow (books are display items).

## Spread plan (6 spreads per book)

Vocabulary from SPREADS.md / popupScenery: `vfold` backdrop, `stand`, `flat`, `flap`, `arm`, `add`, `slot`; scenery `tree bush cloud sun house door cityBlock goal cone ball bench scoreboard scoreFlap noteCard trophy goldenBall bunting firework confetti bridgeDeck flipCard rainbow arrow bubble plane strip icon banner floodlight beam fenceStrip grassStrip birds stars drops post sign lamp suitcaseProp`; figures `B.person` with shirts `arg ger keeper coach casual bib navy fan`. Kits are colour-only (no crests, numbers only when the story gives one). Original stylised figures, never a likeness. Pink only for setbacks (rain cloud plates).

- **caicedo:** village pitch with a boys' team and a gate `flap` that swings open (gate); stadium night `floodlight`, `scoreFlap` 0→1 (scoreboard); bedroom with window, `cloud` on an `arm` lifting to `sun`, helper figures (`coach`, casual adult) (rain cloud); training ground with a 3-step `strip` comeback bar filling and a figure re-appearing (comeback bar); medal `flipCard` silver → "Silver Ball", suitcase to Madrid (medal); World Cup pitch, ball on a `slot` into `goal`, teammates `confetti` (kick).
- **earps:** goalmouth with gloves `add` sliding onto keeper hands, club `sign` row (gloves); empty England bench, `cloud` lift reveals keeper still training with a `cone` (rain cloud); dressing-room `door` flap opens to a pitch, coach figure (door); Wembley-style `cityBlock` stands, `trophy` rises, `bunting` (trophy); final, keeper on an `arm` diving, `ball` stopped, shirt rack `noteCard` with a blank name (dive); award frame `flap` with `goldenBall`-style glove icon, `stars` (frame).
- **hamm:** shoebox `flap` lid opening on small shoes, `plane` on a `strip` between bases (shoebox); 3-step `stand` stairs with campus + "1991" `banner` (steps); family home, `flap` reveals a family of figures holding hands, a `lamp` (flap); `banner` "Garrett Game" rising over a charity match (banner); scoreboard 107→108 (scoreboard); podium with two gold `flipCard`s, team figures (trophy).
- **sawa:** riverside pitch with older boys and a small girl figure, `ball` kick on `slot` (kick); 3-step stairs, "4 goals" `scoreFlap` (steps); `suitcaseProp` opening, `plane` across a sea `vfold` (suitcase); sea wave print (calm, not destructive), team holding a `banner` (banner); night final, penalty spot, `ball` on `slot`, `scoreboard` 3–1 (penalty); `goldenBall` + boot icons in a frame `flap`, six `bunting` flags (frame).
- **sinclair:** junior pitch with tall kids and a small figure (kick); Algarve sunshine, scoreboard "3" (scoreboard); Old Trafford-style stands at dusk, pink `cloud` `arm` lifts to reveal bronze `flipCard` (rain cloud); Rio crowd `cityBlock`, 3-step podium (steps); 3-step goal bar `strip` to 185 + a ribbon `icon` for MS research (goal bar); Tokyo night, gold medal `flap` lifting, `confetti` (medal).
- **formiga:** 1978 street with a "No girls" `sign` flipping to "Everyone plays" (sign); futsal court, mother figure (casual) opening the gate (gate); `flap` reveals a line of paper ants carrying a ball alongside the player (flap); two silver `flipCard`s turning (two medals); 7 `bunting` flags + 7 rings climbing 3 steps (steps); farewell, Brazil-yellow `banner` waving, crowd `fan`s (flag).
- **renard:** Martinique beach pitch, palms (`tree`), sea `vfold` (kick); family figures around a framed photo `flap` (frame, gentle); Clairefontaine gates with a pink `cloud` `arm` (rain cloud); `suitcaseProp`, `plane` over ocean, Lyon `cityBlock` (suitcase); 8 small `trophy` stands popping in sequence (trophy); quiet room, `lamp` switching on, then a pitch with a header goal (lamp).
- **morgan:** park league pitch with a club gate `flap` (gate); physio room, 3-step comeback `strip` (comeback bar); Chile night, ball on `slot` into `goal` (kick); German stadium, pink `cloud` lift, teammates' arms around each other (rain cloud); scoreboard 3–3 → 4–3 with "123'" `noteCard` (scoreboard); bookshelf `flap` opening into a book page with a kid footballer, two World Cup `stars` (book).
- **son:** quiet park, father (coach) and boy, ball tapped 3 times on a `slot` (tap ×3); `suitcaseProp`, `plane` Seoul→Hamburg, German word `bubble`s (suitcase); 3-step stairs with two stadium `sign`s (steps); full-length pitch print, ball on a long `slot` past 5 defender stands (roll ×3); scoreboard flip to a golden boot `icon` (scoreboard); Europa final night, `trophy` rises, `firework` (trophy).
- **vinicius:** São Gonçalo street + futsal court print (kick); uncle's house `door` flap (door); Madrid `cityBlock`, critic `bubble` flap reveals a training figure shooting at `cone`s (flap); Paris final, scoreboard 0→1 (scoreboard); crowd stands with a large anti-racism `banner` rising, players linking arms (banner) — no hostile figures drawn; classroom, a `flipCard` book opening, children figures, school `sign` (book).
- **griezmann:** Mâcon pitch with a small figure among tall ones (kick); 4 academy `door`s on a street, 2 knocks (doors ×2); scout figure revealed under a stand `flap` (flap); `bridgeDeck` unfolding across a border river between "Bayonne" and "San Sebastián" `sign`s (bridge); Euro final, pink `cloud` lift (rain cloud); World Cup final, `trophy`, `confetti` (trophy).
- **vandijk:** restaurant kitchen, plates stacking 3 times on a `slot` (stack ×3); "too many limits" `sign` flipping to a growth ruler with a tall figure (sign); Groningen `door` (door); hospital window, pink `cloud` lift to `sun`, family figures (rain cloud, gentle, no bed detail needed); 3-step stairs Celtic → Southampton → Liverpool in colour-only kits (steps ×3); captain's armband `add`, `trophy` (trophy).
- **howard:** classroom, `flap` opens on a simple explainer card "tics: sudden movements or sounds" (flap); goal frame `flap` opening, keeper figure stepping in (goal); MLS pitch + "Helping kids" `banner` (banner); `suitcaseProp`, `plane` to England (suitcase); World Cup goalmouth, keeper on `arm` diving 3 times, ball stand returning (dive ×3); 3 helper `flipCard`s turning to kids' figures (helper cards).
- **cech:** youth pitch, shirt `flipCard` striker → keeper (shirt); scoreboard ticking minutes "1,025" (scoreboard); match pitch with a pink `cloud` `arm`, medic figure (coach shirt) walking him off; no collision drawn (rain cloud); headguard `add` sliding onto the keeper's head, referee figure checking (headguard); Munich night penalty, keeper `arm` dive ×3 (dive ×3); three `flap`s: ice hockey stick, drum kit, gloves (three flaps).
- **baggio:** Fiorentina-violet `door` flap held open by a club figure (door); calendar `flipCard`s turning 3 times beside a gym `bench` (calendar ×3); frame `flap` with a `goldenBall` (frame); USA stadium, ball `slot` goals (kick); Rose Bowl night, ball flying over the bar on an `arm`, pink `cloud` lift reveals teammates around him (rain cloud); Brescia `banner` + wheat-sheaf `icon` for the FAO role (banner).
- **wright:** terraced street `cityBlock`, school `door` flap (door); classroom, teacher figure with a book, `flap` reveals a reading lesson + a small `plane` on the wall (flap); 2 club `door`s, then a Sunday-league pitch (doors ×2); 3-step stairs: Greenwich → Palace → top league (steps ×3); scoreboard to 185 (scoreboard); TV studio with a photo frame `flap`: teacher and pupil hug (frame).
- **mahrez:** Sarcelles street, ball rolling 3 times along a `slot` past `cone`s (roll ×3); family photo frame `flap`, Algeria-green stadium `sign` (frame, gentle); `signpost` turning Quimper → Le Havre (signpost); `suitcaseProp`, Channel `plane` (suitcase); Leicester-blue `trophy` rising, teammate figure (trophy); AFCON night, free kick on an `arm` curving into `goal`, `confetti` (kick).
- **milla:** railway print, a paper train on a `slot` (pull tab); Douala pitch scoreboard + award `star` (scoreboard); `suitcaseProp`, `plane` to France, then an island `vfold` (suitcase); telephone `flap` reveals the team bus (flap); corner flag on an `arm` swinging, dancing figure (corner flag); 1994 stadium, "42" `noteCard`, `trophy` (trophy).
- **dzeko:** apartment block `cityBlock`, `door` flap opening on many family figures around a table (door); window `flap` closing, child figure inside with a ball; outside only a `cloud`, no damage drawn (window); "too tall" `sign` flipping, Teplice `sign` (sign); Wolfsburg-green `trophy` (trophy); scoreboard flip (scoreboard); Brazil 2014 crowd + Bosnia-blue `banner`, a letter `noteCard` (banner).
- **bale:** six-a-side cage `fenceStrip`, scout figure (kick); school playground, ball tapped 3 times, left boot `icon` crossed (tap ×3); shirt `flipCard` (shirt); Spurs-white kit, scoreboard with a "0 wins" tally, pink `cloud` lift (rain cloud); scoreboard 5–0, arrow moving the figure from defence to wing (scoreboard); Wales-red `banner`, `bunting`, "1958 → 2022" `noteCard` (banner).

## Site fact tiles (draft, for `lib/site/bookPages/<id>.ts`)

Each needs ≥4 `facts`; every value below is in the story text.

- caicedo: Country Colombia · Grew up Candelaria · First club Real Juanchito, at 5 · Back from illness 2020 · World Cup 2023 goal of the tournament
- earps: Country England · First club West Bridgford, at 10 · Euro 2022 every minute · The Best goalkeeper 2022, 2023
- hamm: Country USA · Born Selma, Alabama, 1972 · World champion 1991, 1999 · Foundation 1999
- sawa: Country Japan · First Japan game at 15, 4 goals · World champion 2011 · World Cups 6
- sinclair: Country Canada · International goals 190 · Olympic bronze 2012, 2016 · Olympic gold 2021
- formiga: Country Brazil · Born 1978, Salvador · World Cups 7 · Olympics 7 · Caps 234
- renard: Country France (Martinique) · Joined Lyon at 16 · Champions League 8 · Height 1.87 m
- morgan: Country USA · Club soccer from 14 · Olympic gold 2012 · World Cups won 2015, 2019
- son: Country South Korea · Left home at 16 · Puskás Award · Golden Boot 2021–22 · Europa League 2025
- vinicius: Country Brazil · Grew up São Gonçalo · Champions League final goal 2022 · UNESCO ambassador 2024
- griezmann: Country France · Grew up Mâcon · Real Sociedad at 14 · World champion 2018
- vandijk: Country Netherlands · Teenage job dishwasher · Groningen at 19 · Champions League 2019
- howard: Country USA · Tourette syndrome · 15 saves vs Belgium 2014 · Caps 121
- cech: Country Czech Republic · Became a keeper at 10 · Back in a headguard Jan 2007 · Premier League clean sheets 202
- baggio: Country Italy · Knee injury at 18 · Ballon d’Or 1993 · Serie A goals 205
- wright: Country England · Teacher Mr Pigden · Pro at 21 · Arsenal goals 185
- mahrez: Country Algeria · Grew up Sarcelles · Leicester fee ~£450,000 · PFA Players’ Player 2016 · AFCON 2019
- milla: Country Cameroon · Called back at 38 · Italia 90 goals 4 · Oldest World Cup scorer, 42
- dzeko: Country Bosnia and Herzegovina · Grew up Sarajevo · Sold for €25,000 · First World Cup 2014
- bale: Country Wales · Youngest Wales player 16 y 315 d · Winless run 24 games · Champions League 5

## Build batches (4 × 5)

One build agent per book, two at a time on this Mac (memory rule); verify agents separate. Each batch = spreads + narration + bookPages + webp stills + catalog/vending/site wiring + tests in one commit per batch, after the owner picks a shelf option.

1. **Batch 1 (strongest stories, mixed):** caicedo, vinicius, son, earps, griezmann
2. **Batch 2:** vandijk, hamm, sawa, cech, mahrez
3. **Batch 3:** sinclair, morgan, renard, howard, wright
4. **Batch 4 (legends):** baggio, formiga, milla, dzeko, bale

Sinclair and Morgan share the 2012 semi-final (4–3): ship them in the same batch so the two books cross-link.
