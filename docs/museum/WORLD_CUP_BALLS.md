# FIFA World Cup Match Balls 1930-2026: Museum Dossier

Research dossier for the Futbol Island football-history museum. It covers 30 men's World Cup balls (including the two 1930 final balls and the 6 special final/knockout balls from 2006 to 2026), plus an optional Women's World Cup section.

**How to use this:** each entry has a procedural *design recipe*: base, motifs, where they sit on the panel layout, and hex colours estimated from photos. Recreate the surface without logos or wordmarks. Facts are short and checked against Wikipedia unless a note says otherwise. Reference images are private designer references (not for shipping) in `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/`.

Main source: [List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls). Machine-readable version: `docs/museum/world-cup-balls.json`.

## Panel-layout cheat sheet

| Era | Layout | Notes |
|---|---|---|
| 1930-1938 | 11-13 laced leather strips / T-panels | Laced slit, brown leather |
| 1950-1966 | 12-25 strip panels, valve | No laces from 1950; 18-panel 'volleyball' from 1954; yellow/orange leathers appear |
| 1970-2002 | 32 panels (12 pentagons + 20 hexagons) | Telstar black/white; Tango 'triad' family 1978-1998; Fevernova 2002 |
| 2006 | 14 panels (6 propellers + 8 triangles) | Thermally bonded from now on |
| 2010 | 8 moulded 3D panels | Tetrahedral layout |
| 2014-2018 | 6 panels (cube topology, pinwheel/propeller) | |
| 2022 | 20 panels (8 triangles + 12 long panels) | |
| 2026 | 4 panels (tetrahedral) | Fewest ever |

## Contents

- [1930 Tiento (first half of the final)](#1930-tiento)
- [1930 T-Model (second half of the final)](#1930-t-model)
- [1934 Federale 102](#1934-federale-102)
- [1938 Allen](#1938-allen)
- [1950 Duplo T (Super Duplo T)](#1950-duplo-t)
- [1954 Swiss World Champion](#1954-swiss-world-champion)
- [1958 Top Star](#1958-top-star)
- [1962 Crack](#1962-crack)
- [1966 Challenge 4-Star](#1966-challenge-4-star)
- [1970 Telstar](#1970-telstar)
- [1974 Telstar Durlast (and Chile Durlast)](#1974-telstar-durlast)
- [1978 Tango (Tango Durlast / Tango River Plate)](#1978-tango)
- [1982 Tango España](#1982-tango-espana)
- [1986 Azteca (Azteca Mexico)](#1986-azteca)
- [1990 Etrusco Unico](#1990-etrusco-unico)
- [1994 Questra](#1994-questra)
- [1998 Tricolore](#1998-tricolore)
- [2002 Fevernova](#2002-fevernova)
- [2006 +Teamgeist](#2006-teamgeist)
- [2006 +Teamgeist Berlin (final ball)](#2006-teamgeist-berlin)
- [2010 Jabulani](#2010-jabulani)
- [2010 Jo'bulani (final ball)](#2010-jobulani)
- [2014 Brazuca](#2014-brazuca)
- [2014 Brazuca Final Rio (final ball)](#2014-brazuca-final-rio)
- [2018 Telstar 18](#2018-telstar-18)
- [2018 Telstar Mechta (knockout/final ball)](#2018-telstar-mechta)
- [2022 Al Rihla](#2022-al-rihla)
- [2022 Al Hilm (semi-final/third-place/final ball)](#2022-al-hilm)
- [2026 Trionda](#2026-trionda)
- [2026 Trionda Final (semi-final/third-place/final ball)](#2026-trionda-final)
- [Women's World Cup balls (optional)](#womens-world-cup-balls-optional)

<a id="1930-tiento"></a>

## 1930: Tiento (first half of the final)

- **Host:** Uruguay
- **Maker:** Unknown Argentine maker (supplied by Argentina)
- **Panels:** about 12 (count varies by source)
- **Construction:** Hand-stitched brown leather strip panels around a rubber bladder, closed with a laced slit; no valve. Smaller and lighter than the T-Model.

**Visual design:** Worn mid-brown leather, mottled and matte, no print. Long, gently curved strip panels arranged in groups (like a volleyball), with one panel carrying a short slit closed by leather laces. Make the seams slightly sunken grooves; surface lumpy rather than perfectly round.

Motifs:

- Lace slit: one ~6 cm slot on a single panel with 5-6 pairs of stitch holes either side; the laces on the museum ball are missing, so show dark holes and an open slot (#2a1d14).
- Seams: thin dark grooves (#4a3526) between panels, no colour contrast.
- Wear: lighter scuffs (#a08a72) on the high points of each panel.

Palette: `leather` #8a7560, `leather_shadow` #5e4c3d, `seam` #4a3526, `lace_slot` #2a1d14, `scuff` #a08a72

**Kid-friendly facts:**

- The 1930 final used TWO balls! Argentina and Uruguay could not agree, so Argentina's ball was used in the first half and Uruguay's in the second.
- Argentina led 2-1 at half-time with their ball. After the switch to Uruguay's bigger, heavier ball, Uruguay won 4-2 to become the first world champions.
- Old leather balls soaked up rain, so they could get much heavier when wet.

**Notes / uncertainty:** Wikipedia gives no panel count or maker for the Tiento. Panel count of 12 is commonly quoted on fan/collector sites and is not verified here. Museum ball: National Football Museum, Preston.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: 1930 FIFA World Cup final](https://en.wikipedia.org/wiki/1930_FIFA_World_Cup_final) · [Wikimedia Commons: File:1930 World Cup Final ball Argentina.jpg](https://commons.wikimedia.org/wiki/File:1930_World_Cup_Final_ball_Argentina.jpg) · [Wikimedia Commons: File:Giant balls.jpg](https://commons.wikimedia.org/wiki/File:Giant_balls.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/1930-tiento.jpg`

---

<a id="1930-t-model"></a>

## 1930: T-Model (second half of the final)

- **Host:** Uruguay
- **Maker:** Unknown Uruguayan maker (supplied by Uruguay)
- **Panels:** about 11 (count varies by source)
- **Construction:** Hand-stitched leather, interlocking T-shaped panels, leather-laced slit, no valve. Bigger and heavier than the Tiento.

**Visual design:** Pale grey-brown, crackled leather (looks dusty and dry). The panels are T-shaped: each T's 'bar' runs along the ball and its 'stem' fits into the next T, so the seams make a T and upside-down-T zigzag around the ball.

Motifs:

- Interlocking T panels: stem width about one third of the bar length. Seams are deep, slightly darker grooves (#6b5d4e).
- Lace strip: 5 criss-cross leather laces (#7a6a4a) across a slit on one panel, raised like a little ladder.
- Craquelure: fine network of light cracks (#c4b8a6) all over the leather.

Palette: `leather` #a39684, `leather_shadow` #776a5b, `seam` #6b5d4e, `lace` #7a6a4a, `crack` #c4b8a6

**Kid-friendly facts:**

- It's called the T-Model because its leather panels are shaped like the letter T.
- Uruguay's ball was used in the second half of the very first World Cup final, and Uruguay scored three goals with it to win 4-2.

**Notes / uncertainty:** Panel count (11) is from collector sources, not Wikipedia. Wikipedia only says it was larger and heavier.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: 1930 FIFA World Cup final](https://en.wikipedia.org/wiki/1930_FIFA_World_Cup_final) · [Wikimedia Commons: File:1930 World Cup Final Ball Uruguay.jpg](https://commons.wikimedia.org/wiki/File:1930_World_Cup_Final_Ball_Uruguay.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/1930-t-model.jpg`

---

<a id="1934-federale-102"></a>

## 1934: Federale 102

- **Host:** Italy
- **Maker:** ECAS (Ente Centrale Approvvigionamento Sportivi), Rome
- **Panels:** 13 (per collector sources; Wikipedia leaves it blank)
- **Construction:** Hand-stitched leather panels, laced slit (cotton laces), no valve.

**Visual design:** Rich red-brown leather. A wide horizontal band around the 'equator' made of long strips; the central strip carries the laces. Above and below the band, wedge/T-shaped panels close the poles, so the ball looks like an orange cut into segments around a laced belt.

Motifs:

- Lace strip: 6 short, wide pale-tan laces (#d9a85a) crossing a slot in the middle strip, each lace ~1/6 of the slot length, evenly spaced.
- Polar panels: 4-5 wedge panels per pole meeting in short T junctions; seams dark (#3e2416).
- No printed logo is visible on the reference.

Palette: `leather` #7a4a30, `leather_light` #9a6444, `seam` #3e2416, `lace` #d9a85a

**Kid-friendly facts:**

- Italy hosted and won the 1934 World Cup, playing with this Rome-made ball.
- The name 'Federale' comes from the Italian football federation of the time.

**Notes / uncertainty:** Name/maker per Wikipedia list (ECAS, Rome). Some sources call it the 'Federale 102' and some just 'Federale'. Panel count and cotton laces are from balones-oficiales.com (cited by Wikipedia), not stated in the article.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikimedia Commons: File:Federale 102.jpg](https://commons.wikimedia.org/wiki/File:Federale_102.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/1934-federale-102.jpg`

---

<a id="1938-allen"></a>

## 1938: Allen

- **Host:** France
- **Maker:** Allen, Paris
- **Panels:** 13
- **Construction:** Leather, hand-stitched. White cotton laces on a separate, thin lace panel (per Wikipedia). No valve.

**Visual design:** Warm orange-brown (tan) leather with a slight shine. Three long horizontal panels make a wide belt around the middle; short trapezoid panels close the top and bottom. The ball carries big black capital lettering across the belt on the reference (omit, or use as plain dark bands).

Motifs:

- Belt: 3 stacked long panels, each about as tall as 1/6 of the circumference, seams #5a2e14.
- Lace panel: a separate narrow panel with off-white cotton laces (#efe6d2) (not visible on the reference photo).
- Optional printed text band in near-black (#2a1a10) across two belt panels (original reads 'Coupe du Monde / Allen Officiel').

Palette: `leather` #a85a2e, `leather_light` #c47a46, `seam` #5a2e14, `lace` #efe6d2, `print` #2a1a10

**Kid-friendly facts:**

- The 1938 ball was made in Paris and had white cotton laces on its own thin panel.
- Italy won again in 1938, becoming the first team to win two World Cups in a row.

**Notes / uncertainty:** Wikipedia: 13 panels, white cotton laces on a separate thin panel.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikimedia Commons: File:Allen-1938.jpg](https://commons.wikimedia.org/wiki/File:Allen-1938.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/1938-allen.jpg`

---

<a id="1950-duplo-t"></a>

## 1950: Duplo T (Super Duplo T)

- **Host:** Brazil
- **Maker:** Superball (Brazil)
- **Panels:** 12
- **Construction:** Leather, hand-stitched. First World Cup ball with NO laces: inflated through a valve with a syringe-type needle.

**Visual design:** Pale sandy-beige leather (much lighter than the 1930s balls). Panels are long curved strips: three horizontal strips form a belt, with T-shaped/interlocking strips at top and bottom. Smooth, round, no lace bump.

Motifs:

- No lace slit at all - a smooth surface with a tiny valve hole (#3a2e22, ~4 mm) on one panel.
- Seams: fine darker lines (#8a7458).
- Optional dark-brown print (#3a2a1e) in the middle of the belt (maker's script and 'DUPLO T').

Palette: `leather` #c9ae8a, `leather_shadow` #a88f6c, `seam` #8a7458, `print` #3a2a1e

**Kid-friendly facts:**

- This was the first World Cup ball without laces. No more painful lace bumps when heading the ball!
- It was pumped up with a needle through a valve, like modern balls.
- In the deciding match, Uruguay surprised hosts Brazil 2-1 at the giant Maracanã stadium.

**Notes / uncertainty:** Name varies: 'Duplo T' (Wikipedia list) vs 'Super Duplo T' (balones-oficiales.com).

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikimedia Commons: File:Duplo T-1950.jpg](https://commons.wikimedia.org/wiki/File:Duplo_T-1950.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/1950-duplo-t.jpg`

---

<a id="1954-swiss-world-champion"></a>

## 1954: Swiss World Champion

- **Host:** Switzerland
- **Maker:** Kost Sport, Basel
- **Panels:** 18
- **Construction:** Leather, hand-stitched, valve (no laces). First 18-panel World Cup ball: 6 groups of 3 parallel strips (like a volleyball / cube layout).

**Visual design:** Golden-yellow/ochre leather with soft shading. 18 strip panels in 6 groups of 3; each group of 3 parallel strips covers one 'face' of an imaginary cube, and neighbouring groups are turned 90 degrees, giving the classic zigzag-strip look.

Motifs:

- Strip groups: 6 groups x 3 strips; seams darker ochre (#8a5a12).
- Small Swiss cross badge (white cross on dark square) on one strip near a pole (optional; #c8102e/#ffffff for a colour version, appears dark on the reference).
- Optional large engraved-style lettering across the middle group in brown (#5a3a10).

Palette: `leather` #d9a033, `leather_shadow` #a8761e, `seam` #8a5a12, `print` #5a3a10

**Kid-friendly facts:**

- The first World Cup ball made from 18 panels - a pattern used for decades afterwards.
- West Germany beat the favourites Hungary 3-2 in the final, a match called the 'Miracle of Bern'.

**Notes / uncertainty:** Wikipedia list: 18 panels, 'the first 18-panel ball'.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikimedia Commons: File:Swiss World Champion-1954.jpg](https://commons.wikimedia.org/wiki/File:Swiss_World_Champion-1954.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/1954-swiss-world-champion.jpg`

---

<a id="1958-top-star"></a>

## 1958: Top Star

- **Host:** Sweden
- **Maker:** Sydsvenska Läder och Remfabriken ('Remmen'/'Sydläder'), Ängelholm
- **Panels:** 24 (per collector sources; Wikipedia leaves it blank)
- **Construction:** Leather, hand-stitched, valve, zigzag strip layout.

**Visual design:** Bright lemon-yellow leather. Strip panels in groups around a horizontal belt, with zigzag joins at the poles, similar to the 1954 ball but with narrower strips.

Motifs:

- Narrow strips in groups, seams slightly darker yellow-brown (#a8861a).
- Optional dark print (#2a2418) across the belt ('TOP-STAR' style lettering) and two small badges near the top.

Palette: `leather` #e3c21a, `leather_shadow` #b89a14, `seam` #a8861a, `print` #2a2418

**Kid-friendly facts:**

- The Top Star was picked from 102 different balls in a blind test by four FIFA officials.
- A 17-year-old called Pelé scored twice in the final with it, as Brazil won their first World Cup.

**Notes / uncertainty:** Panel count not in Wikipedia; 24 is the commonly quoted figure. Brown versions were also made; the reference shows yellow.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikimedia Commons: File:Top Star-1958.jpg](https://commons.wikimedia.org/wiki/File:Top_Star-1958.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/1958-top-star.jpg`

---

<a id="1962-crack"></a>

## 1962: Crack

- **Host:** Chile
- **Maker:** Custodio Zamora H., San Miguel, Chile (Wikipedia's Crack article says Curtiembres Salvador Caussade)
- **Panels:** 18 (12 hexagonal + 6 rectangular)
- **Construction:** Leather, hand-stitched, valve.

**Visual design:** Light tan/caramel leather (the reference is a black-and-white photo, so the colour is an estimate). 6 rounded-rectangle panels, one per cube face, each surrounded by 2 long hexagons per side, so a big rectangle sits in the middle of a ring of hexagons.

Motifs:

- 6 rounded-rectangle panels (about 1.6:1), each with a big oval area holding the maker's logo on the original. Show them plain or with a darker oval outline (#5a3e24).
- 12 elongated hexagons filling the gaps, seams #6a4c30.
- Small printed stamp text along hexagons (optional).

Palette: `leather` #b8875a, `leather_shadow` #8e6440, `seam` #6a4c30, `print` #3a2614

**Kid-friendly facts:**

- The referee of the opening game, Ken Aston, didn't like the Chilean ball and sent for a European one. It arrived in the second half.
- Ken Aston later came up with the idea for yellow and red cards!
- The Crack was the last World Cup ball not made by a big international company.

**Notes / uncertainty:** Maker disputed: the Wikipedia list says 'Señor Custodio Zamora H.' (the reference ball reads 'Fabricante C Zamora H'); the Crack article says Curtiembres Salvador Caussade. Some 1962 games used European balls (e.g. Top Star).

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Crack (ball)](https://en.wikipedia.org/wiki/Crack_%28ball%29) · [Wikimedia Commons: File:Crack-1962.jpg](https://commons.wikimedia.org/wiki/File:Crack-1962.jpg) · [Wikimedia Commons: File:Balon mundial 1962.jpg](https://commons.wikimedia.org/wiki/File:Balon_mundial_1962.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/1962-crack.jpg`

---

<a id="1966-challenge-4-star"></a>

## 1966: Challenge 4-Star

- **Host:** England
- **Maker:** Slazenger
- **Panels:** 25
- **Construction:** Leather, hand-stitched, valve. 25 rectangular panels.

**Visual design:** Bright orange leather (yellow versions were also used). 25 rectangular panels in strip groups (like a basket weave): long rectangles in parallel groups with alternating directions.

Motifs:

- Rectangular panels in groups; seams darker orange-brown (#a8441a).
- Optional print in near-black (#1e1410): maker name, the number 25, a row of 4 small stars, 'CHALLENGE'. The real match ball had no markings according to Wikipedia, so the plain version is more accurate.

Palette: `leather` #e0661f, `leather_light` #f08a3c, `seam` #a8441a, `print` #1e1410, `alt_yellow` #e8c23a

**Kid-friendly facts:**

- The ball was chosen in a blind test at the English FA's headquarters in Soho Square, London.
- Geoff Hurst scored a hat-trick in the final as England won 4-2 against West Germany.
- German player Helmut Haller took the final ball home. It came back to England 30 years later, in 1996.

**Notes / uncertainty:** Wikipedia says the match ball 'had no markings or branding'. The Commons reference is a printed (replica-style) version.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Slazenger Challenge 4-Star](https://en.wikipedia.org/wiki/Slazenger_Challenge_4-Star) · [Wikimedia Commons: File:Challenge 4-star-1966.jpg](https://commons.wikimedia.org/wiki/File:Challenge_4-star-1966.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/1966-challenge-4-star.jpg`

---

<a id="1970-telstar"></a>

## 1970: Telstar

- **Host:** Mexico
- **Maker:** Adidas
- **Panels:** 32 (12 pentagons + 20 hexagons, truncated icosahedron)
- **Construction:** Hand-stitched leather, valve.

**Visual design:** White hexagons + black pentagons: the classic football. Truncated icosahedron: 12 black pentagons, 20 white hexagons; every pentagon is surrounded by 5 hexagons and no two pentagons touch.

Motifs:

- 12 solid black pentagons (#111111).
- 20 plain white hexagons (#f4f1e8, slightly creamy leather).
- Thin stitched seams in a light grey (#c8c4b8) with small stitch dimples.
- Optional gold or black lettering on 2-3 hexagons (Adidas/Telstar text), no logo needed.

Palette: `hexagon_white` #f4f1e8, `pentagon_black` #111111, `seam` #c8c4b8, `gold_text` #b8862b

**Kid-friendly facts:**

- The first World Cup ball with black and white patches, so people watching on black-and-white TVs could see it easily.
- It's named after the Telstar satellite, which looked a bit like a ball with patches.
- Only 20 Telstars were supplied for the whole tournament, and some matches even used a brown ball.

**Notes / uncertainty:** The downloaded reference shows a Telstar Durlast-type ball with gold '1970' text. Shape and colours match the 1970 ball.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Telstar](https://en.wikipedia.org/wiki/Adidas_Telstar) · [Wikimedia Commons: File:Adidas Telstar Mexico 1970 Official ball.jpg](https://commons.wikimedia.org/wiki/File:Adidas_Telstar_Mexico_1970_Official_ball.jpg) · [Wikimedia Commons: File:Exposición “¿De qué color pinta el verde? - El Colegio Nacional - 02.jpg](https://commons.wikimedia.org/wiki/File:Exposici%C3%B3n_%E2%80%9C%C2%BFDe_qu%C3%A9_color_pinta_el_verde%3F_-_El_Colegio_Nacional_-_02.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/1970-telstar.jpg`

---

<a id="1974-telstar-durlast"></a>

## 1974: Telstar Durlast (and Chile Durlast)

- **Host:** West Germany
- **Maker:** Adidas
- **Panels:** 32 (12 pentagons + 20 hexagons)
- **Construction:** Hand-stitched leather with a polyurethane 'Durlast' coating (waterproof, scuff-resistant), valve.

**Visual design:** Same geometry as 1970: 12 black pentagons, 20 white hexagons, but the surface is glossier because of the plastic coating. Lettering is black instead of gold.

Motifs:

- 12 black pentagons (#141414), 20 bright white hexagons (#f7f7f4).
- Light gloss highlight (specular) to show the PU coating.
- Optional navy/black text (#1c1c2a) on 3 hexagons.
- Variant: the all-white 'Chile Durlast' (#f7f7f4, no black panels) was the second official ball.

Palette: `hexagon_white` #f7f7f4, `pentagon_black` #141414, `seam` #cfcfc8, `text` #1c1c2a

**Kid-friendly facts:**

- It was the first World Cup ball with a waterproof plastic coating.
- There were two official balls: the black-and-white Telstar Durlast and the all-white Chile Durlast.
- Hosts West Germany won the final 2-1 against the Netherlands.

**Notes / uncertainty:** Differs from 1970 mainly by its coating and black (not gold) lettering.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Telstar](https://en.wikipedia.org/wiki/Adidas_Telstar) · [Wikimedia Commons: File:Telstar Durlast.jpg](https://commons.wikimedia.org/wiki/File:Telstar_Durlast.jpg) · [Wikimedia Commons: File:Fifaworldcup1974.JPG](https://commons.wikimedia.org/wiki/File:Fifaworldcup1974.JPG)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/1974-telstar-durlast.jpg`

---

<a id="1978-tango"></a>

## 1978: Tango (Tango Durlast / Tango River Plate)

- **Host:** Argentina
- **Maker:** Adidas
- **Panels:** 32 (12 pentagons + 20 hexagons)
- **Construction:** Hand-stitched leather with shiny waterproof coating, valve.

**Visual design:** All-white panels (pentagons are white too). Each of the 20 hexagons has one black 'triad', and together the triads make the illusion of 12 white circles, one around each pentagon.

Motifs:

- Triad (x20, one per hexagon): a black curved triangle with 3 concave sides. Each concave side is an arc of a circle centred on one of the 3 pentagons touching that hexagon (circle radius ~ 1.55x the pentagon's circumradius). The 3 tips point at the hexagon's 3 hexagon-to-hexagon edges and meet the tips of neighbouring triads across the seam.
- Outline arc: a thin black line (~1/12 of the triad width) runs parallel to each concave side, separated by a white gap about the same width. These lines link up across seams into 12 complete thin circles.
- Result: 12 'circles' (white disc + thin black ring + thick black triad edges) centred on the 12 pentagons.
- Pentagons and the middle of the circles: plain white.

Palette: `base_white` #f6f6f3, `triad_black` #121212, `seam` #d4d4ce

**Kid-friendly facts:**

- The Tango's 20 black 'triads' trick your eyes into seeing 12 circles.
- The Tango design was used for 20 years, from 1978 to 1998, with new decorations each time.
- Hosts Argentina won the World Cup for the first time.

**Notes / uncertainty:** Wikipedia: 'twenty identical hexagonal panels with triads creating the impression of 12 circles around the pentagons'. The geometry ratios are estimates from photos.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Tango](https://en.wikipedia.org/wiki/Adidas_Tango) · [Wikimedia Commons: File:Adidas Tango.jpg](https://commons.wikimedia.org/wiki/File:Adidas_Tango.jpg) · [Wikimedia Commons: File:Adidas Tango Argentina (River Plate) 1978 cup Official ball.jpg](https://commons.wikimedia.org/wiki/File:Adidas_Tango_Argentina_%28River_Plate%29_1978_cup_Official_ball.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/1978-tango.jpg`

---

<a id="1982-tango-espana"></a>

## 1982: Tango España

- **Host:** Spain
- **Maker:** Adidas
- **Panels:** 32 (12 pentagons + 20 hexagons)
- **Construction:** Leather with polyurethane coating, rubberised (sealed) seams for water resistance, valve.

**Visual design:** Almost the same as the 1978 Tango: white ball, 20 black triads making 12 circles. The triads look a bit heavier and the outline arcs a bit thicker.

Motifs:

- Same triad as 1978 (x20), black #111111. The thin outline arc is ~1.3x thicker than on the 1978 ball.
- Optional black lettering on 1-2 pentagons ('Tango España'), no logo.

Palette: `base_white` #f5f5f2, `triad_black` #111111, `seam` #cfcfc8

**Kid-friendly facts:**

- The last real leather ball used at a World Cup.
- Its new rubbery seams wore out quickly, so balls sometimes had to be swapped during a match.
- Italy won the 1982 World Cup, their third title.

**Notes / uncertainty:** Visually close to the 1978 Tango. Change the label/thickness, not the pattern.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Tango](https://en.wikipedia.org/wiki/Adidas_Tango) · [Wikimedia Commons: File:Adidas Tango España.jpg](https://commons.wikimedia.org/wiki/File:Adidas_Tango_Espa%C3%B1a.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/1982-tango-espana.jpg`

---

<a id="1986-azteca"></a>

## 1986: Azteca (Azteca Mexico)

- **Host:** Mexico
- **Maker:** Adidas
- **Panels:** 32 (12 pentagons + 20 hexagons)
- **Construction:** First fully synthetic World Cup ball (synthetic leather layers), hand-stitched, valve.

**Visual design:** White ball with the Tango layout (20 triads around 12 white circles), but each triad is filled with Aztec stepped patterns instead of solid black.

Motifs:

- Triad (x20): same outer curved-triangle shape as the Tango. Inside, a small solid black triangle at the centre.
- Along each of the 3 concave sides: a band of black step/fret ('Greek key') patterns, like an Aztec mural border.
- At each of the 3 tips: a small black stepped-pyramid / temple shape.
- Thin black outline arcs as on the Tango, forming 12 circles round the pentagons.
- Colours stay black on white only.

Palette: `base_white` #f7f7f5, `motif_black` #141414, `seam` #d6d6d0

**Kid-friendly facts:**

- The first World Cup ball made completely from synthetic (man-made) materials, so it stayed good in rain and at high altitude.
- Its patterns come from Aztec buildings and murals in Mexico.
- Diego Maradona scored the famous 'Goal of the Century' against England with this ball.

**Notes / uncertainty:** The Wikipedia list also says 'first hand-sewed ball', which is doubtful because earlier balls were hand-stitched too. Treat that claim with caution.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Azteca](https://en.wikipedia.org/wiki/Adidas_Azteca) · [Wikimedia Commons: File:Adidas Azteca.jpg](https://commons.wikimedia.org/wiki/File:Adidas_Azteca.jpg) · [Wikimedia Commons: File:Adidas Azteca Mexico 1986 Official ball.jpg](https://commons.wikimedia.org/wiki/File:Adidas_Azteca_Mexico_1986_Official_ball.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/1986-azteca.jpg`

---

<a id="1990-etrusco-unico"></a>

## 1990: Etrusco Unico

- **Host:** Italy
- **Maker:** Adidas
- **Panels:** 32 (12 pentagons + 20 hexagons)
- **Construction:** Fully synthetic, hand-stitched, with an internal layer of black polyurethane foam (a first), valve.

**Visual design:** White ball, Tango layout. Each of the 20 triads is black with 3 white Etruscan lion heads, and its edges are decorated with a wave/scroll border.

Motifs:

- Triad (x20): black curved triangle (#131313) with a white running-wave/spiral border along each concave side (a little row of white curls).
- 3 white lion heads per triad (60 in total): one lion profile in each of the triad's 3 arms, facing outward toward a tip.
- Thin black outline arcs forming 12 circles around the white pentagons, like the Tango.
- Black on white only.

Palette: `base_white` #f6f6f3, `triad_black` #131313, `lion_white` #f0f0ec, `seam` #d4d4ce

**Kid-friendly facts:**

- Each black triad has three lion heads copied from ancient Etruscan art. That's 60 lions on one ball!
- It was the first ball with a layer of black foam inside, which made it more springy.
- West Germany won the 1990 final 1-0 against Argentina.

**Notes / uncertainty:** Wikipedia: 'Three Etruscan lion heads decorate each of the 20 Tango triads.'

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Etrusco Unico](https://en.wikipedia.org/wiki/Adidas_Etrusco_Unico) · [Wikimedia Commons: File:Etrusco Unico 1990 Fifa World Cup Italy Official Match Ball.jpg](https://commons.wikimedia.org/wiki/File:Etrusco_Unico_1990_Fifa_World_Cup_Italy_Official_Match_Ball.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/1990-etrusco-unico.jpg`

---

<a id="1994-questra"></a>

## 1994: Questra

- **Host:** United States
- **Maker:** Adidas
- **Panels:** 32 (12 pentagons + 20 hexagons)
- **Construction:** Synthetic, hand-stitched, with a polystyrene foam layer (5 materials), so it was lighter, softer and faster. Valve.

**Visual design:** White ball, Tango layout. The triads are black 'outer space' shapes with white stars, and the circles are drawn as several thin 'orbit' lines.

Motifs:

- Triad (x20): black curved triangle (#151515) filled with a starfield: small white 4-point sparkles and dots (#ffffff), plus a few hollow circles like planets.
- Orbit lines: 2-3 thin black concentric lines parallel to each concave side (instead of the single Tango line), forming 12 ringed circles around the white pentagons.
- Black on white only (some photos look navy, #1a1f3a).

Palette: `base_white` #f7f7f5, `triad_black` #151515, `star_white` #ffffff, `alt_navy` #1a1f3a

**Kid-friendly facts:**

- 'Questra' comes from 'quest for the stars', and stars are on the US flag.
- Its space design celebrated 25 years since the Apollo 11 Moon landing.
- Brazil won the first World Cup final decided by a penalty shoot-out.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Questra](https://en.wikipedia.org/wiki/Adidas_Questra) · [Wikimedia Commons: File:1994 Questra.jpg](https://commons.wikimedia.org/wiki/File:1994_Questra.jpg) · [Wikimedia Commons: File:Adidas Questra USA 1994 Official ball.jpg](https://commons.wikimedia.org/wiki/File:Adidas_Questra_USA_1994_Official_ball.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/1994-questra.jpg`

---

<a id="1998-tricolore"></a>

## 1998: Tricolore

- **Host:** France
- **Maker:** Adidas
- **Panels:** 32 (12 pentagons + 20 hexagons)
- **Construction:** Synthetic with syntactic foam, hand-stitched, valve.

**Visual design:** Off-white panels with a faint honeycomb texture. Tango layout, but the triads are blue (French flag colours) with red accents and a white rooster-feather swirl.

Motifs:

- Triad (x20): curved triangle in deep blue-violet (#2f2f8f), fading to a halftone dot pattern (white/pink dots) toward the centre.
- Inside each triad: a white/pink curved swirl like a rooster's tail feathers (#f4d6e0), turning around the triad centre.
- Red accent (#d7263d): thin red lines at each of the 3 tips of the triad.
- Outline: thin blue arcs (#2f2f8f) forming 12 circles round the white pentagons.
- Base texture: subtle hexagon honeycomb in light grey (#e6e6ea) on #f7f7f8.

Palette: `base_white` #f7f7f8, `honeycomb` #e6e6ea, `triad_blue` #2f2f8f, `accent_red` #d7263d, `swirl_pink` #f4d6e0

**Kid-friendly facts:**

- The first multi-coloured World Cup ball: blue, white and red like the French flag.
- The Gallic rooster, a symbol of France, is hidden in its swirls.
- France won their first World Cup at home, 3-0 against Brazil.

**Notes / uncertainty:** Wikipedia mentions a TGV train as another design idea. It is not identifiable on the ball, so leave it out.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Tricolore](https://en.wikipedia.org/wiki/Adidas_Tricolore) · [Wikimedia Commons: File:1998 - Tricolore (France) (4170715889).jpg](https://commons.wikimedia.org/wiki/File:1998_-_Tricolore_%28France%29_%284170715889%29.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/1998-tricolore.jpg`

---

<a id="2002-fevernova"></a>

## 2002: Fevernova

- **Host:** South Korea and Japan
- **Maker:** Adidas
- **Panels:** 32 (12 pentagons + 20 hexagons)
- **Construction:** Synthetic, 11 layers (~3 mm) with syntactic foam (gas-filled micro-balloons), 3-layer knitted chassis, hand-stitched, valve.

**Visual design:** Pearly cream/ivory with a fine hexagon texture. Instead of 20 small triads there are just 4 BIG triangular motifs (spaced like the corners of a tetrahedron) that cross several panels, so the ball no longer reads as 12 circles.

Motifs:

- 4 large 'shuriken' triangles: dark-gold/khaki body (#b39a4a) with slightly curved, hooked arms. Each one is centred on a hexagon and its arms reach into the neighbouring panels.
- Each triangle has a thick dark-green outline (#1e5b45) and a darker teal-green core (#14463a).
- At each of the 3 arms: a red (#c8202f) brush-stroke flame streak, curving like calligraphy.
- Base: ivory #ece6d6 with a faint grey honeycomb (#d9d2c0).

Palette: `base_ivory` #ece6d6, `honeycomb` #d9d2c0, `gold` #b39a4a, `green_outline` #1e5b45, `green_core` #14463a, `flame_red` #c8202f

**Kid-friendly facts:**

- The first World Cup ball since 1978 not to use the Tango 'triad' pattern.
- Its swirling gold shape looks like a 'tomoe' and its red streaks like brush strokes, inspired by Asian art.
- Ronaldo scored both goals in the final as Brazil won their fifth World Cup.

**Notes / uncertainty:** Wikipedia's list says 'grey triangles bordered in gold'. Photos show gold/khaki triangles with green outlines. Colours here follow the photos.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Fevernova](https://en.wikipedia.org/wiki/Adidas_Fevernova) · [Wikimedia Commons: File:Fevernova (4592803569).jpg](https://commons.wikimedia.org/wiki/File:Fevernova_%284592803569%29.jpg) · [Wikimedia Commons: File:Deutsches Fußballmuseum 2015 2-Fevernova.jpg](https://commons.wikimedia.org/wiki/File:Deutsches_Fu%C3%9Fballmuseum_2015_2-Fevernova.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/2002-fevernova.jpg`

---

<a id="2006-teamgeist"></a>

## 2006: +Teamgeist

- **Host:** Germany
- **Maker:** Adidas (developed with Molten)
- **Panels:** 14 (6 propeller panels + 8 rounded triangles; truncated-octahedron topology)
- **Construction:** Thermally bonded (glued, not stitched) synthetic panels, valve. Fewer seams: 24 three-panel junctions instead of 60.

**Visual design:** White with a faint pinstripe. 6 curvy hourglass/'propeller' panels sit like the 6 faces of a cube, and 8 rounded triangles fill the corners. Each propeller is outlined by a thick black curvy band. From any side you see a white hourglass with black edges plus black/gold 'discs' at the ends.

Motifs:

- Propeller outline (x6): a thick black band (#151515) tracing the hourglass shape of each propeller panel, waist about 40% of the end width.
- Gold pinstripe (#c9a227): a thin gold line inside the black band, all the way around.
- Discs: where a propeller's rounded end meets the next panel, the end lobe shows as a black oval with a gold rim, 12 lobes in all (2 per propeller).
- Fine grey hatch/pinstripes (#d7d7d7) on the white triangles near the bands.
- Each real match ball was also printed with the teams, date, stadium and kick-off time (skip for the exhibit, or show as small grey text).

Palette: `base_white` #f5f5f5, `band_black` #151515, `gold_line` #c9a227, `hatch` #d7d7d7

**Kid-friendly facts:**

- The first World Cup ball with only 14 panels. They were glued together with heat, not stitched.
- Every single match ball had that game's teams, date and stadium printed on it.
- 'Teamgeist' means 'team spirit' in German.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Teamgeist](https://en.wikipedia.org/wiki/Adidas_Teamgeist) · [Wikimedia Commons: File:Teamgeist Ball World Cup 2006 Brazil vs. Croatia.jpg](https://commons.wikimedia.org/wiki/File:Teamgeist_Ball_World_Cup_2006_Brazil_vs._Croatia.jpg) · [Wikimedia Commons: File:Teamgeist-STG-CRO-AUS.jpg](https://commons.wikimedia.org/wiki/File:Teamgeist-STG-CRO-AUS.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/2006-teamgeist.jpg`

---

<a id="2006-teamgeist-berlin"></a>

## 2006: +Teamgeist Berlin (final ball)

- **Host:** Germany
- **Maker:** Adidas
- **Panels:** 14
- **Construction:** Same as +Teamgeist: thermally bonded 14-panel.

**Visual design:** Same layout as the +Teamgeist, but the inside of each black hourglass band and every end disc is filled with metallic gold. White triangles keep gold pinstripes.

Motifs:

- Propeller hourglass areas (x6) filled metallic gold (#c9a43a with lighter #e3c977 sheen), framed by the thick black band (#141414).
- 12 end discs: gold ovals with a black rim and a thin white inner line.
- Gold hatch pinstripes (#d9c27a) on the white triangles.
- Black text 'FINAL' and the date (09 July 2006) on the original. Optional.

Palette: `base_white` #f4f2ea, `gold` #c9a43a, `gold_light` #e3c977, `band_black` #141414, `hatch_gold` #d9c27a

**Kid-friendly facts:**

- The very first special golden ball made just for a World Cup final.
- Italy beat France on penalties in Berlin's Olympic Stadium to win the 2006 World Cup.

**Notes / uncertainty:** Used only in the 9 July 2006 final.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Teamgeist](https://en.wikipedia.org/wiki/Adidas_Teamgeist) · [Wikimedia Commons: File:Teamgeist Ball World Cup 2006 Finale.jpg](https://commons.wikimedia.org/wiki/File:Teamgeist_Ball_World_Cup_2006_Finale.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/2006-teamgeist-berlin.jpg`

---

<a id="2010-jabulani"></a>

## 2010: Jabulani

- **Host:** South Africa
- **Maker:** Adidas
- **Panels:** 8 (3D spherically moulded panels)
- **Construction:** 8 thermally bonded, spherically moulded EVA/TPU panels with 'Grip 'n' Groove' surface grooves, latex bladder.

**Visual design:** Glossy white. 4 big triangular design elements spaced like a tetrahedron. Each is made of 3 rounded lobes (like curved shields) on the panel edges, hatched with a fine multicolour pattern, with a black edge and thin gold line.

Motifs:

- 4 triangular elements, each made of 3 rounded lobes (12 lobes in all). Each lobe is a long rounded shape ~1/4 of the circumference.
- Lobe fill: fine diagonal triangle/zigzag hatch in 11 colours on a dark ground (#2a2a2a): orange #f08a1c, red #d7262e, green #1f9d55, blue #1e6fbf, yellow #f4c81e, teal #1aa3a3, purple #6a3d9a, pink #e85a9b, brown #8b5a2b, light green #8cc63f, black #111111.
- Lobe outline: black band (#111111) with a thin gold/yellow inner line (#d9a520).
- Inner 'window': a pale grey/white rounded shape inside each lobe (#e8e8e8).
- Rest of ball: white (#fafafa) with faint groove lines.

Palette: `base_white` #fafafa, `outline_black` #111111, `gold_line` #d9a520, `orange` #f08a1c, `red` #d7262e, `green` #1f9d55, `blue` #1e6fbf, `yellow` #f4c81e

**Kid-friendly facts:**

- 11 colours stand for the 11 players in a team, South Africa's 11 official languages and 11 communities.
- 'Jabulani' means 'be happy!' in Zulu.
- Players said it swerved strangely. NASA scientists studied it and found a 'knuckleball' wobble.

**Notes / uncertainty:** Exact panel shapes (8 panels in two alternating shapes) are from photos. Wikipedia only says '8 thermally bonded, 3D panels'.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Jabulani](https://en.wikipedia.org/wiki/Adidas_Jabulani) · [Wikimedia Commons: File:Adidas Jabulani Official World Cup 2010 (4158450149).jpg](https://commons.wikimedia.org/wiki/File:Adidas_Jabulani_Official_World_Cup_2010_%284158450149%29.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/2010-jabulani.jpg`

---

<a id="2010-jobulani"></a>

## 2010: Jo'bulani (final ball)

- **Host:** South Africa
- **Maker:** Adidas
- **Panels:** 8
- **Construction:** Same as Jabulani.

**Visual design:** Same as the Jabulani, but each of the 12 lobes is metallic gold with a black rim. The white inner window has thin black/grey contour lines. Rest of ball white.

Motifs:

- 12 gold lobes (#c8a84b, sheen #e6cf7a) with fine gold diamond hatch (#a8893a).
- Black lobe outline (#111111), thick on the outer edge.
- Inner window: white/silver (#e9e9e9) with 3-4 thin dark contour lines (#444444), like a target.
- Fine gold/grey groove texture on the white parts (#d8d0b0).

Palette: `base_white` #f7f7f5, `gold` #c8a84b, `gold_light` #e6cf7a, `outline_black` #111111, `window` #e9e9e9

**Kid-friendly facts:**

- Named after 'Jo'burg', a nickname for Johannesburg, where the final was played. Johannesburg is also called the 'City of Gold'.
- Spain beat the Netherlands 1-0 in the final to win their first World Cup.

**Notes / uncertainty:** Used only in the 11 July 2010 final.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Jabulani](https://en.wikipedia.org/wiki/Adidas_Jabulani) · [Wikimedia Commons: File:Jo'bulani.jpg](https://commons.wikimedia.org/wiki/File:Jo%27bulani.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/2010-jobulani.jpg`

---

<a id="2014-brazuca"></a>

## 2014: Brazuca

- **Host:** Brazil
- **Maker:** Adidas (made by Forward Sports, Sialkot, Pakistan)
- **Panels:** 6 (identical propeller/pinwheel panels, cube topology)
- **Construction:** 6 thermally bonded polyurethane panels with a small-nub textured surface.

**Visual design:** White. 6 identical 4-armed 'propeller' panels interlock like a cube's faces. Colourful ribbon swirls run along every seam, like Brazilian wish bracelets.

Motifs:

- Seam ribbons: along each panel's curvy outline, parallel bands from the seam inward: thick black (#111111), then orange (#f18a21), then blue (#1e5aa8), with green (#27a046) and red (#d42a2a) on some arms. Ribbons are ~6-8% of the circumference wide.
- Each panel's 4 arms curl like a pinwheel. Ribbon colours swap from arm to arm, so neighbouring arms show different colour orders.
- The middle of every panel stays white (#f8f8f6).
- Surface: tiny raised nubs (micro bump texture).

Palette: `base_white` #f8f8f6, `ribbon_black` #111111, `orange` #f18a21, `blue` #1e5aa8, `green` #27a046, `red` #d42a2a

**Kid-friendly facts:**

- The name was voted for by over a million Brazilian fans; 'Brazuca' won with 77.8% of the votes.
- Only 6 panels! Fewer seams made it fly more predictably than the Jabulani.
- Germany won the World Cup in Brazil.

**Notes / uncertainty:** Few free close-up images exist: a hidden note in the Wikipedia article says the ball's design is copyrightable. The downloaded reference is small (268 px).

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Brazuca](https://en.wikipedia.org/wiki/Adidas_Brazuca) · [Wikimedia Commons: File:Brazil and Colombia match at the FIFA World Cup 2014-07-04 (15) (cropped).jpg](https://commons.wikimedia.org/wiki/File:Brazil_and_Colombia_match_at_the_FIFA_World_Cup_2014-07-04_%2815%29_%28cropped%29.jpg) · [Wikimedia Commons: File:Iran vs. Argentina match, 2014 FIFA World Cup 47.jpg](https://commons.wikimedia.org/wiki/File:Iran_vs._Argentina_match%2C_2014_FIFA_World_Cup_47.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/2014-brazuca.jpg`

---

<a id="2014-brazuca-final-rio"></a>

## 2014: Brazuca Final Rio (final ball)

- **Host:** Brazil
- **Maker:** Adidas
- **Panels:** 6
- **Construction:** Same as Brazuca.

**Visual design:** Same 6-panel pinwheel layout as the Brazuca. The ribbons are metallic gold, green and black on white.

Motifs:

- Seam ribbons: thick black outer band (#111111), metallic gold main band (#c9a04a, sheen #e2c27a), bright green inner accent (#2fbf4a), plus a thin darker green (#137a35) line.
- Panel centres white (#f7f7f4) with a faint dimple texture.
- Black areas gather where 3 panel arms meet.

Palette: `base_white` #f7f7f4, `gold` #c9a04a, `gold_light` #e2c27a, `green` #2fbf4a, `dark_green` #137a35, `black` #111111

**Kid-friendly facts:**

- Green and gold are Brazil's colours, and gold matches the World Cup trophy.
- Mario Götze scored in extra time to win the final 1-0 for Germany against Argentina.

**Notes / uncertainty:** Used only in the 13 July 2014 final (Maracanã, Rio).

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Brazuca](https://en.wikipedia.org/wiki/Adidas_Brazuca) · [Wikimedia Commons: File:Deutsches Fußballmuseum 2015 3.jpg](https://commons.wikimedia.org/wiki/File:Deutsches_Fu%C3%9Fballmuseum_2015_3.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/2014-brazuca-final-rio.jpg`

---

<a id="2018-telstar-18"></a>

## 2018: Telstar 18

- **Host:** Russia
- **Maker:** Adidas (made by Forward Sports, Pakistan)
- **Panels:** 6 (textured, glued panels)
- **Construction:** 6 thermally bonded panels with a NFC chip, seamless glued construction.

**Visual design:** White, an update of the 1970 Telstar. The black pentagons are replaced by pixel-mosaic shapes that stretch out into square 'pixels' that fade toward white.

Motifs:

- Mosaic shapes (about 12, two on each of the 6 panels, set in the panel arms where the old pentagons would be). Each one is a stretched, slanted pentagon/parallelogram made of square tiles.
- Tile colours: black (#141414), charcoal (#3a3d44), grey (#6c717b) and light grey-blue (#a9b3c1), randomly mixed and getting lighter and sparser toward the shape's edges (a pixel gradient).
- Tile size: ~1/40 of the circumference.
- Rest of ball white (#f4f4f2) with fine embossed texture.

Palette: `base_white` #f4f4f2, `black` #141414, `charcoal` #3a3d44, `grey` #6c717b, `light_grey` #a9b3c1, `gold_text` #c97a2b

**Kid-friendly facts:**

- A tribute to the first Telstar from 1970, but with pixels instead of pentagons.
- One Telstar 18 went to space on the International Space Station before the tournament.
- France won the 2018 World Cup.

**Notes / uncertainty:** Used for the 48 group-stage matches. The mosaic count of about 12 is estimated from photos and was not found in any written source.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Telstar 18](https://en.wikipedia.org/wiki/Adidas_Telstar_18) · [Wikimedia Commons: File:Adidas Telstar 18 in Russia vs. Argentina.jpg](https://commons.wikimedia.org/wiki/File:Adidas_Telstar_18_in_Russia_vs._Argentina.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/2018-telstar-18.jpg`

---

<a id="2018-telstar-mechta"></a>

## 2018: Telstar Mechta (knockout/final ball)

- **Host:** Russia
- **Maker:** Adidas
- **Panels:** 6
- **Construction:** Same as Telstar 18.

**Visual design:** Same as the Telstar 18, but the pixel mosaics are red, a nod to Russia's colours.

Motifs:

- About 12 pixel-mosaic shapes, same placement as Telstar 18.
- Tile colours: crimson (#c8102e), red-orange (#e8433a), coral/pink (#f38b8b), black (#141414) and dark maroon (#5a0d1a), fading out at the edges.

Palette: `base_white` #f5f5f3, `crimson` #c8102e, `red_orange` #e8433a, `coral` #f38b8b, `maroon` #5a0d1a, `black` #141414

**Kid-friendly facts:**

- 'Mechta' means 'dream' in Russian.
- It was used for all 16 knockout matches, including the final where France beat Croatia 4-2.

**Notes / uncertainty:** Unlike the other 'final balls', Mechta was used for the WHOLE knockout stage (16 matches), not just the final.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Telstar 18](https://en.wikipedia.org/wiki/Adidas_Telstar_18) · [Wikimedia Commons: File:Adidas Telstar Mechta Ball.jpg](https://commons.wikimedia.org/wiki/File:Adidas_Telstar_Mechta_Ball.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/2018-telstar-mechta.jpg`

---

<a id="2022-al-rihla"></a>

## 2022: Al Rihla

- **Host:** Qatar
- **Maker:** Adidas (made by Forward Sports, Pakistan)
- **Panels:** 20 (8 triangles + 12 elongated 'propeller' panels)
- **Construction:** 20 thermally bonded PU panels, 'Speedshell' debossed macro/micro texture, connected-ball sensor (IMU) suspended in the bladder, water-based inks and glues.

**Visual design:** Pearly white. Bold brush streaks in blue, red and yellow-green sweep along the seams of the 12 long panels, like sails or flags flying fast. The 8 triangle panels stay mostly white.

Motifs:

- Streak bands along panel seams: a dark blue core (#1f4fbf) blending to light blue (#4aa3ff), next to a red (#d7263d) / orange (#f26b3a) band, with yellow-green (#d6e44a) highlights.
- Each band breaks up at its ends into many thin parallel dashes (like speed lines), tapering toward the triangle panels.
- Triangles: plain white (#f6f6f8) with a fine diamond deboss texture (#e3e3ea).
- Overall: 12 swooshes, one per long panel, all curving the same way like a spinning sail.

Palette: `base_white` #f6f6f8, `texture` #e3e3ea, `blue` #1f4fbf, `light_blue` #4aa3ff, `red` #d7263d, `orange` #f26b3a, `lime` #d6e44a

**Kid-friendly facts:**

- 'Al Rihla' means 'the journey' in Arabic.
- A sensor inside tracked the ball 500 times per second to help the video referees.
- Two Al Rihla balls flew on a SpaceX rocket booster before the World Cup.

**Notes / uncertainty:** The 500 times per second sensor rate is from FIFA/Adidas press material, not the Wikipedia article. The panel split (8 triangles + 12 long panels) is from photos/press, while Wikipedia only says 20 panels. If you want strictly Wikipedia-sourced facts, use the first-ever water-based inks and glues fact instead.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Al Rihla](https://en.wikipedia.org/wiki/Adidas_Al_Rihla) · [Wikimedia Commons: File:Al-Rihla (cropped).jpg](https://commons.wikimedia.org/wiki/File:Al-Rihla_%28cropped%29.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/2022-al-rihla.jpg`

---

<a id="2022-al-hilm"></a>

## 2022: Al Hilm (semi-final/third-place/final ball)

- **Host:** Qatar
- **Maker:** Adidas
- **Panels:** 20
- **Construction:** Same as Al Rihla.

**Visual design:** Same 20-panel layout and streak shapes as Al Rihla, but on a metallic gold base with burgundy/maroon and red streaks (Qatar's colours).

Motifs:

- Base: pale metallic gold (#d9c79a, sheen #efe3bf) with diamond deboss texture.
- Streak bands: burgundy/maroon (#7a1f2e) core with crimson (#c0283a) edges, breaking into thin dashes like Al Rihla.
- Fine dark lettering bands (#3a2a1e) along some seams (words in several languages).

Palette: `base_gold` #d9c79a, `gold_sheen` #efe3bf, `burgundy` #7a1f2e, `crimson` #c0283a, `text` #3a2a1e

**Kid-friendly facts:**

- 'Al Hilm' means 'the dream' in Arabic: every nation's dream of lifting the trophy.
- It was used for the 2022 final, when Lionel Messi's Argentina beat France on penalties after a 3-3 draw.

**Notes / uncertainty:** Used for the 2 semi-finals, the third-place match and the final (4 matches).

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Al Rihla](https://en.wikipedia.org/wiki/Adidas_Al_Rihla) · [Wikimedia Commons: File:Predio Deportivo Lionel Andrés Messi - BugWarp 04 (cropped).jpg](https://commons.wikimedia.org/wiki/File:Predio_Deportivo_Lionel_Andr%C3%A9s_Messi_-_BugWarp_04_%28cropped%29.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/2022-al-hilm.jpg`

---

<a id="2026-trionda"></a>

## 2026: Trionda

- **Host:** United States, Mexico and Canada
- **Maker:** Adidas (made by Forward Sports, Pakistan)
- **Panels:** 4 (fewest ever; tetrahedral layout)
- **Construction:** 4 thermally bonded PU panels with debossed texture on the icons, connected-ball IMU chip mounted in the side of one panel.

**Visual design:** White with deep curved seams. Three big 'wave' panels, one for each host country: red with a maple leaf (Canada), green with an eagle (Mexico), blue with a star (USA). Thin gold lines trim each colour wave.

Motifs:

- Red wave (#d52b1e) with a lighter red (#e8584a) maple-leaf outline and fine zigzag/pinstripe line texture.
- Green wave (#1f9d4a) with a lighter green (#3fbf5f) eagle-head silhouette and fine line texture.
- Blue wave (#1f5fbf) with a light blue (#4a90e2) five-point star and fine line texture.
- Each wave is a rounded triangular patch filling most of its panel and sweeping across the seam. Edges trimmed with a thin gold line (#c9a24a) and a dark band (#5a1a1a / #0f4a2a / #12306a).
- 4th panel area and gaps between waves: white (#f7f7f5).

Palette: `base_white` #f7f7f5, `canada_red` #d52b1e, `mexico_green` #1f9d4a, `usa_blue` #1f5fbf, `gold_trim` #c9a24a

**Kid-friendly facts:**

- Only 4 panels: the fewest of any World Cup ball ever.
- 'Trionda' means 'three waves', one for each host country: Canada, Mexico and the USA.
- A small chip in one panel sends data to the video referees in seconds.

**Notes / uncertainty:** The reference photo is a 'League' replica (shop photo), not the match 'Pro' ball, but the graphics match.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Trionda](https://en.wikipedia.org/wiki/Adidas_Trionda) · [Wikimedia Commons: File:Trionda (cropped).jpg](https://commons.wikimedia.org/wiki/File:Trionda_%28cropped%29.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/2026-trionda.jpg`

---

<a id="2026-trionda-final"></a>

## 2026: Trionda Final (semi-final/third-place/final ball)

- **Host:** United States, Mexico and Canada
- **Maker:** Adidas
- **Panels:** 4
- **Construction:** Same as Trionda.

**Visual design:** Same 4-panel wave layout, with gold and black waves on white instead of red/green/blue. The host-city names (semi-finals, third-place match, final) are printed in gold inside the black waves.

Motifs:

- Waves: black (#141414) patches with metallic gold (#c9a24a, sheen #e6c977) trims and gold lettering/pattern.
- Gold curved stripes follow the deep seams.
- Red accents (#c8102e) are mentioned by Wikipedia but are small and hard to see in the free photo.
- Base white (#f7f7f5).

Palette: `base_white` #f7f7f5, `black` #141414, `gold` #c9a24a, `gold_light` #e6c977, `accent_red` #c8102e

**Kid-friendly facts:**

- Announced on 6 July 2026 for the last four matches of the tournament.
- It has the names of the host cities printed on it.

**Notes / uncertainty:** Wikipedia's list article says 'gold, white and black' while the Trionda article says 'gold, black, and red'. The reference photo is a deflated ball, so its shape is distorted.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Trionda](https://en.wikipedia.org/wiki/Adidas_Trionda) · [Wikimedia Commons: File:Trionda Final.jpg](https://commons.wikimedia.org/wiki/File:Trionda_Final.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/2026-trionda-final.jpg`

---

## Women's World Cup balls (optional)

These are shorter entries. The 1991 and 1995 Women's World Cups used men's-type balls (the Etrusco Unico was the 1991 ball per Wikipedia). The 1999 Icon was the first ball made just for a Women's World Cup. Designs marked 'not verified' are from text only.

<a id="wwc-1999-icon"></a>

### 1999: Icon

- **Host:** United States
- **Maker:** Adidas
- **Panels:** 32
- **Construction:** Same technology as the Tricolore (hand-stitched, syntactic foam).

**Visual design:** White, Tango-family layout with coloured triads (exact artwork not verified).

Motifs:

- 20 triads with coloured artwork, 12 circles around pentagons

Palette: `base_white` #f6f6f3

**Kid-friendly facts:**

- The first ball made specially for a Women's World Cup.

**Notes / uncertainty:** WARNING: the Commons photo listed for the Icon shows a ball signed 'USA Gold 96' with city-scene triads. It looks like the 1996 Olympic 'Questra Olympia', not the Icon. Do not use it as an Icon reference.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: 1999 FIFA Women's World Cup](https://en.wikipedia.org/wiki/1999_FIFA_Women%27s_World_Cup) · [Wikimedia Commons: File:National Football Museum displays 19.jpg](https://commons.wikimedia.org/wiki/File:National_Football_Museum_displays_19.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/w1999-icon.jpg`

---

<a id="wwc-2003-fevernova"></a>

### 2003: Fevernova (Women's World Cup version)

- **Host:** United States
- **Maker:** Adidas
- **Panels:** 32
- **Construction:** Same as 2002 Fevernova.

**Visual design:** Fevernova layout with a different colour scheme (not verified).

**Kid-friendly facts:**

- Technically identical to the 2002 men's ball.

**Notes / uncertainty:** No free image found.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Fevernova](https://en.wikipedia.org/wiki/Adidas_Fevernova)

**Local reference image:** none (no free image found)

---

<a id="wwc-2007-teamgeist-blue"></a>

### 2007: Teamgeist Blue 2007 China

- **Host:** China
- **Maker:** Adidas
- **Panels:** 14
- **Construction:** Same as +Teamgeist.

**Visual design:** +Teamgeist layout with blue in place of black/gold (not verified from an image).

Palette: `blue` #1e5aa8

**Kid-friendly facts:**

- Same performance as the 2006 men's ball, different colours.

**Notes / uncertainty:** No image downloaded.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Teamgeist](https://en.wikipedia.org/wiki/Adidas_Teamgeist)

**Local reference image:** none (no free image found)

---

<a id="wwc-2011-speedcell"></a>

### 2011: SpeedCell

- **Host:** Germany
- **Maker:** Adidas
- **Panels:** 8
- **Construction:** Same as Jabulani.

**Visual design:** Jabulani layout. Lobes in teal/blue-green hatch (#1f8a8a) with lime-yellow (#d6e04a) and black outlines on white.

Motifs:

- 12 lobes, teal hatch, lime and black rims

Palette: `base_white` #f7f7f5, `teal` #1f8a8a, `lime` #d6e04a, `black` #111111

**Kid-friendly facts:**

- Technically identical to the Jabulani.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Jabulani](https://en.wikipedia.org/wiki/Adidas_Jabulani) · [Wikimedia Commons: File:Speedcell.jpg](https://commons.wikimedia.org/wiki/File:Speedcell.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/w2011-speedcell.jpg`

---

<a id="wwc-2015-conext15"></a>

### 2015: Conext 15

- **Host:** Canada
- **Maker:** Adidas
- **Panels:** 6
- **Construction:** Brazuca technology (6 bonded panels).

**Visual design:** White with a wavy figure-8 band in black with red, green and blue accents.

Motifs:

- Wavy 8-shaped black ribbon with red/green/blue streaks

Palette: `base_white` #f7f7f5, `black` #111111, `red` #d42a2a, `green` #27a046, `blue` #2a5bd7

**Kid-friendly facts:**

- Based on the Brazuca's 6-panel design.

**Notes / uncertainty:** Reference photo is a Conext 15 from Ecuador's league (same graphic family).

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Conext](https://en.wikipedia.org/wiki/Adidas_Conext) · [Wikimedia Commons: File:BALON DEL CAMPEONATO (15774583044).jpg](https://commons.wikimedia.org/wiki/File:BALON_DEL_CAMPEONATO_%2815774583044%29.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/w2015-conext15.jpg`

---

<a id="wwc-2015-conext15-final-vancouver"></a>

### 2015: Conext 15 Final Vancouver

- **Host:** Canada
- **Maker:** Adidas
- **Panels:** 6
- **Construction:** Same as Conext 15.

**Visual design:** Final variant of Conext 15 (colours not verified).

**Kid-friendly facts:**

- The first ball made specially for a Women's World Cup final.

**Notes / uncertainty:** No free image.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Conext](https://en.wikipedia.org/wiki/Adidas_Conext)

**Local reference image:** none (no free image found)

---

<a id="wwc-2019-conext19"></a>

### 2019: Conext 19

- **Host:** France
- **Maker:** Adidas
- **Panels:** 6
- **Construction:** Telstar 18 technology.

**Visual design:** White with a 'glitched' triangle graphic in red-orange, yellow, green and blue.

Motifs:

- Glitch triangles inspired by the 1998 Tricolore

Palette: `base_white` #f5f5f3, `red` #e8402a, `yellow` #f4d21e, `green` #8cc63f, `blue` #1e5aa8

**Kid-friendly facts:**

- Used in 36 group-stage matches.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Conext](https://en.wikipedia.org/wiki/Adidas_Conext) · [Wikimedia Commons: File:Chile v Colombia 20190519 28.jpg](https://commons.wikimedia.org/wiki/File:Chile_v_Colombia_20190519_28.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/w2019-conext19.jpg`

---

<a id="wwc-2019-tricolore19"></a>

### 2019: Tricolore 19

- **Host:** France
- **Maker:** Adidas
- **Panels:** 6
- **Construction:** Same as Conext 19.

**Visual design:** White with blue-and-red glitch graphic (Tricolore homage).

Motifs:

- Blue/red glitch triangles

Palette: `base_white` #f5f5f3, `blue` #2a3a9f, `red` #d7263d

**Kid-friendly facts:**

- Used for the whole knockout stage.

**Notes / uncertainty:** Knockout-stage ball (not final-only).

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: 2019 FIFA Women's World Cup](https://en.wikipedia.org/wiki/2019_FIFA_Women%27s_World_Cup) · [Wikimedia Commons: File:2019 Women's World Cup Ball.jpg](https://commons.wikimedia.org/wiki/File:2019_Women%27s_World_Cup_Ball.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/w2019-tricolore19.jpg`

---

<a id="wwc-2023-oceaunz"></a>

### 2023: Oceaunz

- **Host:** Australia and New Zealand
- **Maker:** Adidas
- **Panels:** 20
- **Construction:** Al Rihla technology (20 bonded panels, connected-ball sensor).

**Visual design:** White with big black swirls edged in sky blue and lime, and blue-patterned triangle panels.

Motifs:

- Black wave swirls with light-blue (#3fa9f5) and lime (#c6e03a) edges
- Triangles with blue lattice/flower pattern

Palette: `base_white` #f5f5f3, `black` #141414, `sky_blue` #3fa9f5, `lime` #c6e03a

**Kid-friendly facts:**

- 'Oceaunz' joins 'ocean' with AU (Australia) and NZ (New Zealand).

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Oceaunz](https://en.wikipedia.org/wiki/Adidas_Oceaunz) · [Wikimedia Commons: File:2023-07-07 Fussball, Frauen, Länderspiel, Deutschland - Sambia 1DX 6938 by Stepro (cropped).jpg](https://commons.wikimedia.org/wiki/File:2023-07-07_Fussball%2C_Frauen%2C_L%C3%A4nderspiel%2C_Deutschland_-_Sambia_1DX_6938_by_Stepro_%28cropped%29.jpg)

**Local reference image:** `/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/ballrefs/w2023-oceaunz.jpg`

---

<a id="wwc-2023-oceaunz-final-pro"></a>

### 2023: Oceaunz Final Pro

- **Host:** Australia and New Zealand
- **Maker:** Adidas
- **Panels:** 20
- **Construction:** Same as Oceaunz.

**Visual design:** Oceaunz layout in orange and gold (Sydney sunsets).

Palette: `orange` #f07a1a, `gold` #c9a24a

**Kid-friendly facts:**

- Used for the final four matches.

**Notes / uncertainty:** No free image.

**Sources:** [Wikipedia: List of FIFA World Cup official match balls](https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls) · [Wikipedia: Adidas Oceaunz](https://en.wikipedia.org/wiki/Adidas_Oceaunz)

**Local reference image:** none (no free image found)

---

## Open questions and disputed points

- **1930:** Tiento and T-Model panel counts (12 and 11) are from collector sites. Wikipedia gives none.
- **1934 / 1938 / 1950 names:** 'Federale 102' (sometimes just 'Federale'); 'Allen' (sometimes 'Allen Officiel'); 'Duplo T' vs 'Super Duplo T'. Panel counts for 1934 (13) and 1958 (24) are not in Wikipedia.
- **1962 maker:** Custodio Zamora (list article, and the ball's own stamp) vs Curtiembres Salvador Caussade (Crack article).
- **1966:** Wikipedia says the match ball had no markings; the reference image is a printed version.
- **1986:** the 'first hand-sewn ball' claim in the list article is doubtful.
- **2002:** list article says grey triangles with gold border; photos show gold triangles with green outline.
- **2018:** Telstar Mechta was a knockout-stage ball (16 matches), not final-only.
- **2026 Trionda Final:** colours given as gold/white/black (list) vs gold/black/red (Trionda article).
- **1999 Icon:** the Commons image linked from Wikipedia appears to be a different ball (Questra Olympia 1996).
