# Player photo sources (free licences only)

Research for the 123 player cards that had no photo on Sep 26 2026 (roster 388,
`lib/town/cardRoster.json`, against every `lib/town/playerPhotos*.json` shard).
The script that implements this search is `scripts/fetch-player-photos-deep.py`;
per-player results are at the end of this file.

## House rules (unchanged)

- **Licence**: CC0, public domain, CC BY, CC BY-SA only, including government
  works published that way. Record the exact licence, author and source URL (the
  card back prints the credit). No NC/ND, no agency, club or press photos, no
  "fair use", and nothing scraped from image search.
- **In kit, playing**: a match, training, warm-up or team photo. No suits, press
  conferences, award ceremonies or retired-era shots.
- **Right person**: the file's title, description or `depicts` (P180) names the
  player; SFace similarity against every infobox face found; a person looks at
  each crop. Group shots are cropped to the named player's face.
- **Politeness**: one runner, at most 1 request every 4 s to any Wikimedia host
  (commons, upload, *.wikipedia, wikidata), with the same gap for Openverse and
  Flickr. A 429 backs off 20 s, doubling, and widens the gap for the session.
  The throttle is a lock file shared by every process, so probes queue behind
  the runner instead of adding load.

## Sources evaluated

Ranked by the usable hits they produced in this audit (see "Results").

### 1. Commons structured data: `depicts` (P180)

- Endpoint: `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=haswbstatement:P180=Q531814&gsrlimit=50&prop=imageinfo&iiprop=extmetadata|url|size&iiurlwidth=960`
  (one request returns 50 files with licence, author, date and description).
- Finds files that name the player only in structured data, including files in
  match categories that no Wikipedia links to. Kaká: 149 files, Jordi Alba: 150.
- Licence: per file (`extmetadata.LicenseShortName`). Identity is strong because
  P180 names the Q-id, but a group photo also lists team-mates, so the face
  must still be matched and the crop checked.

### 2. The player's Commons category tree

- `Category:<P373 value>` from Wikidata, plus name guesses
  (`<article>`, `<name> (footballer)`, `<name> (futsal player)`, aliases).
- Subcategories are ranked, then walked two levels deep with a budget of about
  22 requests: `"<Player> with <Club>"`, `"<Player> in 2018"`,
  `"<Player> with the <Country> national football team"`, `"... by year"`
  containers. Statues, art, signatures, coaching, ceremonies and post-career
  events are skipped by name.
- Endpoint: `action=query&generator=categorymembers&gcmtitle=Category:X&gcmtype=file&gcmlimit=50&prop=imageinfo...`
  and `list=categorymembers&cmtype=subcat` for the tree.
- Tournament and match categories (`Category:FIFA World Cup 2018 matches`,
  `Category:Brazil national football team in 2002`,
  `Category:UEFA Euro 2016 Final`) hold many free photos, but scanning them per
  player is expensive (hundreds of files, mostly other players). They are
  reached through the player tree and the P180 search instead: files there
  that name the player are usually either depicts-tagged or also in
  the player's own category.

### 3. Wikidata item

- `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=Q1|Q2|...&props=claims|sitelinks`
  (50 items per call).
- `P18` (image) is usually the same file as the en infobox, but not always.
  `P373` (Commons category) is the reliable way into the category tree when the
  category name differs from the article (futsal players, married names,
  diacritics). The other image properties (P2716 collage, P6802 related image,
  P1442 grave) are no use for in-kit portraits.
- Sitelinks drive the other-language infobox lookup (next).

### 4. Other-language Wikipedia infoboxes

- `https://<lang>.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=name&pilicense=free&titles=A|B|...`
  (50 titles per call per language; `pilicense=free` drops local fair-use
  files). 30 languages checked: pt es it fr de ru ko ja nl tr ca uk pl ar fa kk
  hr sr bg ro cs sv no da hu el he id eu gl.
- Often a different photo from en (pt/es for Brazilian and Spanish players, ko
  for Korean, tr for Turkish, ru/kk for futsal). These photos are also used as
  **extra reference faces** for the identity check, which helps most with
  legends whose en infobox photo is from retirement.

### 5. Government and agency sets on Commons (CC-licensed at source)

These are not queried separately: their files sit in player and match
categories and carry P180, so the searches above find them. Licence notes, for
review:

| Set | Commons licence tag | Notes |
| --- | --- | --- |
| kremlin.ru (Presidential Press and Information Office) | CC BY 4.0 (`{{Kremlin.ru}}`) | 2018 World Cup matches and team visits. Many are ceremony or reception shots: reject those. |
| soccer.ru | CC BY-SA 3.0 (`{{Soccer.ru}}`) | Russian Premier League and 2018 WC match photos. Good in-kit action. |
| Agência Brasil (EBC) | CC BY 3.0 BR (`{{Agência Brasil}}`) | Brazil national team, Brasileirão and futsal. Strong for Brazilian players; license-review tags on Commons. |
| Casa Rosada (Argentina) | CC BY 2.5 AR (`{{Casa Rosada}}`) | Mostly receptions (suits, trophies). Few in-kit photos. |
| Tasnim / Mehr / Fars (Iran) | CC BY 4.0: each site states it publishes under CC BY 4.0; Commons files go through `{{LicenseReview}}` (`{{subst:Tasnim/subst}}`) | Good for the Iran national team and Asian club matches; accept only files that passed licence review. |
| Korean government (korea.kr, KOGL) | `KOGL Type 1` (attribution only) | Not literally CC BY. The pipeline accepts it only when the file is also tagged CC BY / BY-SA, so a KOGL-only photo is listed for a human decision, not used. |
| US government (DoD, State Dept, USAID) | Public domain (`{{PD-USGov}}`) | Military team and visit photos. Rarely pro players in kit. |
| Government of Catalonia (CATPRESS) | CC0 / CC BY | Barça pre-season tours. Many are tourism events: in-kit check needed. |
| Presidency of Russia / Ukraine / Kazakhstan | CC BY 4.0 (varies) | Mostly ceremonies. |

### 6. Commons full-text search

- `action=query&generator=search&gsrnamespace=6&gsrsearch="Name" OR "Alias" filetype:bitmap`
- Catches files that are named but neither categorised nor depicts-tagged. A
  single-word name (Cafu, Zico, Edu, Neto, Pito) is used only when the file
  is also in the player's tree or depicts the Q-id.

### 7. Flickr (through Openverse)

- The Flickr API needs a key; Openverse indexes Flickr's CC photos with no key:
  `https://api.openverse.org/v1/images/?q=<name>&license=cc0,pdm,by,by-sa&excluded_source=wikimedia`.
- Each hit's licence is re-checked on the Flickr photo page (`rel="license"`),
  and so is the "Taken on" date; NC/ND and unconfirmed pages are refused. The
  Flickr URL and owner go into the manifest (`source: openverse/flickr`).
- Photographers who license freely and cover football: Ronnie Macdonald
  (Scottish football, CC BY 2.0), Steindy and Ailura (Austrian Bundesliga and
  internationals, uploading straight to Commons under CC BY-SA 3.0 AT/DE),
  Кирилл Венедиктов / soccer.ru (Commons), and many NWSL/USWNT fan
  photographers (CC BY 2.0). Most usable Flickr photos are already mirrored to
  Commons (via Flickr2Commons with a licence review). The Commons copy is
  preferred because its categories and P180 make identity verifiable.

### 8. Futsal

- Commons: `Category:Futsal players from Brazil|Spain|Portugal|...`, national
  futsal team categories (`Category:Portugal national futsal team`), the
  FIFA Futsal World Cup 2016/2021/2024 and UEFA Futsal Euro categories.
- Agência Brasil covers the Brazil futsal team (CC BY 3.0 BR). Some Spanish and
  Portuguese regional governments and clubs publish CC BY sets (Xunta de Galicia,
  Câmara Municipal photos), as do Kazakh sources (Kairat, Akorda) and Russian
  ones (the AMFR, via soccer.ru-style uploads).
- In practice futsal is thin: few players have a Commons category, and most
  pages in pt/es/ru Wikipedia use no image or a local non-free one.

### 9. Women's game

- Commons: `Category:2015|2019|2023 FIFA Women's World Cup` match
  subcategories, `Category:Football at the 20xx Summer Olympics – Women's
  tournament`, UEFA Women's Euro 2017/2022/2025 categories, and SheBelieves
  Cup and NWSL match categories.
- Flickr: NWSL and USWNT fan photographers (CC BY 2.0), mostly mirrored on
  Commons already.
- Retired legends (Mia Hamm, Michelle Akers, Kristine Lilly, Sun Wen) are the
  hardest cases: free photos of them are mostly from later events, not
  from their playing days.

## Sources rejected

- Getty, AP, Reuters, club media, league media and agency photos: copyrighted.
- Google Images / Bing scraping, "fair use" infobox images hosted locally on
  en.wikipedia: not reusable.
- Unsplash, Pexels and Pixabay: permissive, but not CC. Almost no identifiable
  pro players, and the identity metadata is unreliable.
- Flickr CC BY-NC / BY-ND photos: refused (house rule).

## Article-body scan (first source, added Sep 26 2026)

`https://<lang>.wikipedia.org/api/rest_v1/page/media-list/<Title>` (fallback
`action=query&prop=images&imlimit=max`) for the en article and the player's
native-language articles (from Wikidata P1532/P27). Logos, crests, flags, maps,
signatures, kits, stadiums, statues and SVG/GIF/audio are dropped by filename.
Licence, author, date and size come from Commons imageinfo, so a file hosted only
locally (non-free) drops out there. A caption naming the player (the surname is
enough, e.g. "Pickford playing for England at the 2018 FIFA World Cup") counts as
identity, and "playing / during / against / training" in the caption adds to the score.

First five stars scanned: Donnarumma 12 body images (11 captioned), Pickford 5 (4),
Reece James 5 (4), Kim Min-jae 4 (3), Son Heung-min 13 (12). The depicts search
found 26 to 150 files each for the same players, so it is the larger pool. The body
captions are the best evidence of identity and kit.

## Results (in progress, stopped for the day Sep 26 2026 12:24)

Photo-less cards: **123 before, 101 now** (22 applied). Every crop was looked at by eye. Each
decision is recorded in `PICKS` / `BLOCK` in `scripts/fetch-player-photos-deep.py`, and the batch scripts keep
entries with `source: wikimedia/deep-audit`.

| Player | File | Found via | Licence, author |
| --- | --- | --- | --- |
| Kaká | Kaka of AC Milan, April 19, 2009.jpg | depicts + category | CC BY 2.0, Tsutomu Takasu |
| Jordi Alba | Jordi Alba NE Revolution Inter Miami 7.9.25-047 (cropped).jpg | depicts / infobox | CC BY-SA 4.0, Bryan Berlin |
| Gianluigi Donnarumma | Norway Italy - June 2025 B 33 - Gianluigi Donnarumma (close-up).jpg | article body | CC BY 4.0, MichaelEmilio / Danyele |
| Jordan Pickford | Jordan Pickford England v Ghana 23 June 2026-049.jpg | depicts | CC BY-SA 4.0, Bryan Berlin |
| Reece James | Reece James England v Ghana 23 June 2026-248.jpg | article body | CC BY-SA 4.0, Bryan Berlin |
| Kim Min-jae | FC Red Bull Salzburg gegen Bayern München (2025-01-06 Testspiel) 26.jpg | article body | CC BY-SA 4.0, Werner100359 |
| Cody Gakpo | Austria U-18 vs. Netherlands U-18 2017-03-23 (078).jpg | article body | CC BY 3.0, Steindy |
| Rodrigo De Paul | Rodrigo De Paul Argentina v Spain 19 July 2026-159.jpg | article body | CC BY-SA 4.0, Bryan Berlin |
| Son Heung-min | Son Heung-min 2016.jpg | article body | CC BY-SA 3.0, Дмитрий Голубович |
| Kaoru Mitoma | Kaoru Mitoma (2022).jpg | article body | CC BY 2.0, jamesboyes |
| Karim Adeyemi | FC RB Salzburg gegen SK Sturm Graz (24. Oktober 2021) 70.jpg | article body (de) | CC BY-SA 4.0, Werner100359 |
| Vozinha | Vozinha Fifa World Cup 2026 Saudia Arabia vs Cabo Verde (cropped).jpg | article body | CC BY 4.0, Petsbikes |
| Kyle Walker | Kyle Walker 2021-12-07 1.jpg | article body | CC BY-SA 4.0, Steffen Prößdorf (crop Mattythewhite) |
| İlkay Gündoğan | 2021-12-07 ... RB Leipzig - Manchester City FC 1DX 2686 by Stepro.jpg | article body | CC BY-SA 4.0, Steffen Prößdorf |
| Karim Benzema | Karim Benzema vs. FC Schalke 04 (16647992937).jpg | article body | CC BY 2.0, Chris Deahr |
| Ryan Gravenberch | 2022-07-30 ... DFL-Supercup ... 1DX 3342 by Stepro (cropped).jpg | article body (nl) | CC BY-SA 4.0, Steffen Prößdorf (crop Sepguilherme) |
| Fermín López | Fermín López (cropped).jpg | category | CC BY 4.0, Biso |
| Stanley Matthews | Stanley Matthews 1962 (crop).jpg | article body | CC0, Harry Pot / Anefo |
| Marcelo | RealM-Shahter15 (7).jpg | article body | CC BY-SA 3.0, Богдан Заяц |
| Lilian Thuram | Lilian Thuram - 001.jpg | article body | Public domain, Mutari |
| Giacinto Facchetti | UEFA Euro 1968 Final - Italy v Yugoslavia - Ilija Petković and Giacinto Facchetti.jpg | depicts | Public domain, unknown (restoration Danyele, Skblzz1) |
| Zico | Coppa Italia 1983-84 - Triestina vs Udinese - Zico e Franco De Falco.jpg | article body | Public domain, Enzo Lasorte / Il Piccolo |

New cards 389-400 (Sep 26 2026, work dir `photos3`; legends' career windows added to `CAREER` first, since discovery had
stored the 2023-26 default). Rejected on review: Ian Rush (1988 tracksuit arrival), Laurent Blanc (Bordeaux staff polo),
Filippo Inzaghi (a Beckham file; a 2011 coat-and-scarf shot). Those three stay on drawn art.

| Player | File | Licence, author |
| --- | --- | --- |
| Ronald Koeman | Ronald Koeman 1983.jpg | CC0, Marcel Antonisse / Anefo |
| Ricardo Quaresma | Ricardo Quaresma - Inter Mailand (1).jpg | see manifest (Commons) |
| Bastian Schweinsteiger | CINvCHI 2017-06-28 - Bastian Schweinsteiger (27329406048) (cropped).jpg | see manifest (Commons) |
| Wesley Sneijder | Wesley Sneijder (15487233555) (cropped).jpg | see manifest (Commons) |
| Ruud Gullit | GullitCruijffFeyenoord1983.jpg | CC0, Marcel Antonisse (ANEFO) |
| Peter Crouch | Crouch2.jpg | see manifest (Commons) |
| Freddie Ljungberg | Fredrik Ljungberg 2006.jpg | see manifest (Commons) |
| Robin van Persie | Van Persie (15300483040) (crop).jpg | see manifest (Commons) |
| James Rodríguez | James Rodríguez (cropped).jpg | CC BY 3.0 BR, Copa2014.gov.br |

**Sources ranked by applied photos:** article-body scan 16 of 22 (en plus de/nl native articles),
depicts (P180) 4, player category 2. Other-language infoboxes and Wikidata P18 mostly served as extra
reference faces rather than picks. Openverse/Flickr and match categories: 0 so far.

**Rejected on review:**
- João Pedro (Chelsea): the only named files show a different João Pedro, at PFC Cherno More.
- Bradley Barcola, Pervis Estupiñán: zipped jackets and earphones, arrival shots, not kit.
- Son Heung-min: BFA award-ceremony photos.
- Frenkie de Jong: both candidates too blurred.
- Donnarumma: "June 2025 A", a track top in the stands.
- Gakpo: 06042025, an arrival shot.

**Still to do:**
- Searched, no usable photo in the top 2: Dumfries, de Jong, Leão, Güler, Yıldız, João Pedro, Barcola,
  Estupiñán, Cafu, Yashin, Nílton Santos, Seaman, Campos, Carragher, Vieira, Rivaldo, Stoichkov, Shearer, Weah.
- Searched, images not yet downloaded: Dalglish, Laudrup, Hagi.
- Not yet searched: Rui Costa, Seedorf, Makélélé, Owen, Lineker, Riquelme, Okocha, Bonucci, Cantona,
  17 women and 53 futsal players.

### Rate limits

- API hosts with the OAuth token at about 1 request per second: no 429s in about 400 requests.
- `upload.wikimedia.org`, the image host, which gets no token: 429s even at 1 download every 7 s. There were three
  within an hour, around 12:05, 12:15 and 12:24, so the run stopped for the day.
- Download budget after the top-1/2 rule: about 3 images per player.
