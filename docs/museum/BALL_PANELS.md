# World Cup ball panel geometry: sources and build notes

Research date: 2026-10-05. Companion to `WORLD_CUP_BALLS.md` and `world-cup-balls.json`.

The goal is exact panel counts and panel shapes for the 3D gallery. Every claim below carries its source. Where sources disagree, each one is listed and none is chosen. Anything I could not check against a primary or strong secondary source is marked **unverified**. Lines marked **(derived)** are my geometric reading of a cited source, written for the programmer. They are not quotes.

Drawings saved for designers (small PNGs rendered from the official patent PDFs):
`/private/tmp/claude-501/-Users-khoado/d994bee9-c5bd-4e49-9115-a24243431a1d/scratchpad/patents/`

## How strong is each source?

1. **Design patents / registered designs** (USPTO, EUIPO). These are the drawings the maker filed, so the lines show the true seam layout. They exist only for the adidas balls from 2006 onward.
2. **Utility patents** that describe the panels in words (Jabulani: US 8,529,386 B2).
3. **Maker press releases** (news.adidas.com) and **FIFA**. FIFA's historic text is the archived footballs.fifa.com "FIFA World Cup Footballs" page. Its pre-1970 text is hedged ("would have been").
4. **Museums**: National Football Museum (NFM) Manchester, plus the University of Manchester CT-scan release of July 2026.
5. **Peer-reviewed aerodynamics papers** (Hong, Asai, Goff). These give seam lengths.
6. **Collector references**: balones-oficiales.com by Renato Matteo / René Sopp (archived), museodefutbol.com, worldcupballs.info, and When Saturday Comes (Paul Brown, 2018).

No design patents were found for any ball from 1930 to 2002. Those balls were made before modern design filings, or by small local makers, or they used the public-domain 32-panel layout.

Search limits: Google Patents began rate-limiting me (HTTP "Sorry…") partway through. The adidas EU design registrations EM 008546212, 003187947, 003504364, 015033334 and 015059781 were found in the listing, but I could not open their pages or dates. They are listed at the end as leads.

---

## Patent and design index (verified on Google Patents / USPTO)

| Ball | Number | Title | Applicant / inventor | Priority / filed / granted | Drawings (PDF) |
|---|---|---|---|---|---|
| Teamgeist 2006 | **US D527,432 S** | Ball | adidas International Marketing BV / Anatol Rainer Just, Scott Tomlinson | 2005-01-27 / 2005-01-27 / 2006-08-29 | https://patentimages.storage.googleapis.com/b3/1a/7e/c9c1cded37040e/USD527432.pdf |
| Teamgeist 2006 | **US D529,107 S** | Decorated panel assembly for a ball | same | 2005-01-27 / 2005-01-27 / 2006-09-26 | https://patentimages.storage.googleapis.com/1b/ef/6b/5400d8fb4a30c5/USD529107.pdf |
| Teamgeist 2006 | **US D520,086 S** | Surface decoration for a ball or a ball panel | same | 2005-01-27 / 2005-01-27 / 2006-05-02 | https://patentimages.storage.googleapis.com/95/91/34/84a69e7e54dfcf/USD520086.pdf |
| Jabulani 2010 | **US 8,529,386 B2** (utility) | Ball | adidas AG / Nürnberg, Gordon, Lucas, Geyer, van Oorschot | 2009-04-03 / 2010-04-01 / 2013-09-10 | https://patentimages.storage.googleapis.com/a4/e9/67/d02a0696b222fe/US8529386.pdf |
| Jabulani 2010 | **US D613,354 S** | Ball (graphic) | adidas Int'l Marketing BV / Janneke van Oorschot | EM 001035562 2008-11-07 / 2008-11-14 / 2010-04-06 | https://patentimages.storage.googleapis.com/b5/49/71/ac877a1a303f49/USD613354.pdf |
| Jabulani 2010 | **US D613,356 S** | Ball (divisional of D613,354) | same | 2008-11-07 / 2009-04-15 / 2010-04-06 | https://patentimages.storage.googleapis.com/9b/e6/d6/863403f940d813/USD613356.pdf |
| Brazuca 2014 | **US D696,737 S** | Sports ball | adidas AG / Julia Otto | 2012-12-19 / 2013-01-02 / 2013-12-31 | https://patentimages.storage.googleapis.com/b6/7f/62/1e37057885f54f/USD696737.pdf |
| Brazuca 2014 | **US D696,738 S** | Sports ball | adidas AG / Julia Otto | 2012-12-19 / 2013-01-29 / 2013-12-31 | https://patentimages.storage.googleapis.com/77/b4/61/18bfc073774724/USD696738.pdf |
| Brazuca 2014 | **US D697,150 S** | Sports ball | adidas AG / Julia Otto, Raphael Curet | 2012-12-19 / 2013-01-29 / 2014-01-07 | https://patentimages.storage.googleapis.com/26/3c/b2/1b45e23ca4594c/USD697150.pdf |
| Brazuca 2014 | **US D702,301 S** (colour) | Sports ball | adidas AG / Julia Otto | EM 002156083-0001 2012-12-19 / 2013-01-29 / 2014-04-08 | https://patentimages.storage.googleapis.com/72/a1/2e/1c0d7bbfea3abf/USD702301.pdf |
| Telstar 18 | **US D816,786 S** | Sports ball (pixel graphic; seams in broken lines) | adidas AG / Franziska Löffelmann | 2016-12-07 / 2017-06-07 / 2018-05-01 | https://patentimages.storage.googleapis.com/8a/65/21/d2612697f4fadb/USD816786.pdf |
| Telstar 18 (probable) | **US D804,595 S** | Ball (seam layout only) | adidas AG / Löffelmann, Bichler, Walker, Juckelandt | 2016-12-12 / 2016-12-30 / 2017-12-05 | https://patentimages.storage.googleapis.com/41/a5/25/ff30f184cd58c0/USD804595.pdf |
| 20-panel construction (Al Rihla family) | **US D1,105,320 S** | Ball | adidas AG / Franziska-Maria Eva Löffelmann | EM 015014861-0001…0004, 2023-03-17 / 2023-09-15 / 2025-12-09 | https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/D1105320 |
| Trionda 2026 | **US D1,100,082 S** | Ball | adidas AG / Abdu Galal (Nuremberg) | EM 015017152-0001…0004, 2023-04-05 / 2023-10-04 / 2025-10-28 (Appl. 29/913,559) | https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/D1100082 |

Google Patents pages are at `https://patents.google.com/patent/<number>/en`, for example https://patents.google.com/patent/USD1100082S1/en.

The CDS-Luthi IP article (https://cds-luthi.com/news/eyes-on-the-ball-world-cup-match-footballs-advancement-by-design/) also lists:

- Teamgeist: EP 1 578 504 B1, EP 1 080 745 B2, EP 1 424 105 B1.
- Jabulani: EP 2 883 580 B1.
- Telstar: US trademark 3,508,598.
- Trionda: US trademark 8,225,622.
- Trionda: an EUIPO invalidation action filed October 2025.

I did not open these documents, so they are **unverified**. The US 8,529,386 text does confirm that EP 1 424 105 A1 (adidas with Molten) covers the moulded 3D panels. CDS-Luthi also gives **D1,105,320 for Al Rihla**. That attribution is doubtful: its priority date (2023-03-17) is a year after Al Rihla was unveiled (March 2022). See the Al Rihla section.

---

## 1930 — Tiento (Argentina's ball, first half) — `1930-tiento`

**Panel count. Sources agree on 12; none of them is a maker or design record.**
- When Saturday Comes (Paul Brown, 18 Jun 2018), https://www.wsc.co.uk/stories/hell-for-leather-mystery-surrounds-the-first-ever-world-cup-final-ball/: "a more traditional model, with **12 rectangular-shaped panels**". It also says the ball was "an imported Players brand made in Scotland" and is "on display at the National Football Museum in Manchester". Brown argues the Tiento may have been used for the whole final.
- balones-oficiales.com 1930 page (archived): "La pelota Argentina de **12 paneles**" ("12 gajos o paneles").
- museodefutbol.com: the Argentine "Players" model had "12 sections/gores".
- FIFA archive: "The 1930 ball would have been a **12-piece construction**" (hedged).

**Geometry.** No source describes how the 12 rectangular panels are arranged, so the layout is **unverified**. In the NFM photo (`ballrefs/1930-tiento.jpg`) the panels are long, slightly curved rectangles in groups of parallel strips. One panel carries the lace slit, with 6 hole-pairs either side.

**(Derived, unverified)** The usual 12-panel layout has cube topology: 6 groups of 2 parallel strips, one group per cube face, each group turned 90° from its neighbours, like a volleyball with 2 strips per face instead of 3. Check this against the NFM photo before building.

## 1930 — T-Model (Uruguay's ball, second half) — `1930-t-model`

**Panel count. Sources disagree:**
- WSC / Paul Brown 2018: "a distinctive T-model, with **11 interlocking T-shaped panels**". It is thought to be an English "Wembley" ball by J. Salter & Son, Aldershot.
- museodefutbol.com (https://museodefutbol.com/1930-t-shape-uruguay-30/): "Its **12 panels** have form of letter 'T'".
- FIFA archive: generic "12-piece".

**Geometry.** The panels are T-shaped and interlock. Each T's crossbar sits against the stem of the next T, rotated 90°. The NFM photo (`ballrefs/1930-t-model.jpg`) shows this clearly, and the lace slit runs along one crossbar. Because 11 vs 12 is unresolved, the exact tiling is **unverified**. Build from the NFM photo with a single lace panel.

## 1934 — Federale 102 — `1934-federale-102`

**Panel count. Sources disagree:**
- museodefutbol.com (https://museodefutbol.com/1934-federale-102-italia-34/): "**13 paneles poligonales**". Most balls of the time had 12. It had brown cotton laces and "a separate panel" for the lacing.
- worldcupballs.info history: "composed by 13 polygonal panels which were cut and perfectly fitted together by hand sewing"; laces on a separate panel.
- FIFA archive: "the 12-panel ball would have come from local suppliers" (hedged, generic).
- balones-oficiales.com 1934: gives no count. It says the 1934 balls were bought from Tossolini, Valbonesi, Polo & Cía (the Argentine "Superball" makers). This conflicts with the ECAS attribution.

**Geometry.** The two counts reconcile as 12 polygonal shell panels plus a narrow 13th lace strip **(derived)**. In `ballrefs/1934-federale-102.jpg` the lace panel is a long horizontal strip, bounded by strips with angled, house-shaped ends that interlock above and below. The panel shapes are **unverified** beyond the photo.

## 1938 — Allen — `1938-allen`

**Panel count. Sources disagree:**
- Wikipedia list: **13**, "white cotton laces on a separate, thin panel".
- worldcupballs.info: "consisted of 13 panels"; the cotton laces were white.
- FIFA archive: "the 12-panel ball … of brown leather" (hedged).

**Geometry.** The same reconciliation as 1934 applies: 12 shell panels plus a thin lace panel **(derived)**. The exact layout is **unverified**. `ballrefs/1938-allen.jpg` shows long horizontal strips printed "COUPE DU MONDE / ALLEN OFFICIEL".

## 1950 — Duplo T (Super Duplo T, Superball) — `1950-duplo-t`

**Panel count: 12 in every source found.**
- Wikipedia list: 12. "First ball to have no laces and introduce the syringe valve."
- worldcupballs.info: "**12 identical panels** but the edges of these panels were more curved".
- FIFA archive: "the traditional 12-panel ball, but with curved edges to create less stress on the seams".

**Geometry.** 12 identical panels with curved edges, no lace slit, and a valve. **(Derived, unverified)** Likely the same cube-based 6×2 strip topology as the 1930s 12-panel balls, with the straight strip ends replaced by curves. `ballrefs/1950-duplo-t.jpg` matches this.

## 1954 — Swiss World Champion — `1954-swiss-world-champion`

**Panel count: 18 in every source found.**
- Wikipedia list: 18, "The first 18-panel ball".
- balones-oficiales.com (archived): "18 paneles, color anaranjado".
- worldcupballs.info: "**18 panels with zigzag edges, perfectly interlocked to each other**", hand-sewn, no laces, yellow or light orange.
- FIFA archive: "The 18-panel ball … made its first appearance here and was used, in various forms, until 1966."

**Geometry (derived from the photo plus the 18-panel description).** Cube topology. There are 6 groups of 3 parallel strips, one group per cube face, and adjacent groups are rotated 90°. Where a group meets its neighbour, the strip ends are cut in a zig-zag (stepped) line that interlocks with the side of the perpendicular group, instead of a straight volleyball seam. Three groups meet at each of the 8 cube corners. `ballrefs/1954-swiss-world-champion.jpg` shows three horizontal strips ("SWISS WORLD / CHAMPION / MATCH BALL") meeting vertical strips at stepped ends.

## 1958 — Top Star — `1958-top-star`

**Panel count. Sources disagree:**
- balones-oficiales.com 1958 (archived; René Sopp / Peter Pesti): "**24 paneles**". "The winner's ball had 24 panels and this was simply the detail that made the difference." It was chosen from 102 entries.
- museodefutbol.com: "**24 paneles rectangulares** … entrelazadas en zigzag".
- worldcupballs.info: "long and short panels … **two short panels in the midst of two long panels**".
- FIFA archive, 1958 section: "The **18-panel** ball was designed with zig-zag interlocking seams…". This sentence may be generic text about the 18-panel era.
- Wikipedia list: blank. It cites Norlin, *1958: När Folkhemmet Fick Fotbolls-VM* (2008), pp. 130–6, which I have not seen.

**Geometry (derived from worldcupballs.info and the photo).** Cube topology with 6 groups. Each group has 4 pieces: two long outer strips, with the middle strip split crosswise into two short pieces. 6 × 4 = 24. `ballrefs/1958-top-star.jpg` shows "TOP-STAR" printed across a middle strip that is cut by a vertical seam. Treat 24 as the best-supported count. The 18-panel reading from FIFA's text is the dissent.

## 1962 — Crack — `1962-crack`

**Panel count: 18 = 12 hexagonal + 6 rectangular.**
- museodefutbol.com (https://museodefutbol.com/1962-crack/): "dieciocho paneles de cuero amarillo … **doce hexagonales y seis rectangulares**".
- worldcupballs.info: "18 irregular polygonal panels, having two different shapes: hexagonal curved and rectangular".
- balones-oficiales.com crack1962 (archived): "18 paneles de cuero cromo amarillo, con válvula", made by Custodio Zamora Honorato, Santiago.
- Wikipedia (Crack): 18 panels, 12 hexagonal and 6 rectangular. Wikipedia credits the leather to Curtiembres Salvador Caussade.

**Geometry (derived).** 18 panels in cube topology. Each of the 6 cube faces carries one rectangle (the centre strip) flanked by two elongated hexagons (outer strips with pointed or chamfered ends). That gives 6 × (1 rectangle + 2 hexagons) = 6 + 12. The hexagons' pointed ends fit into the sides of the perpendicular neighbouring groups. `ballrefs/1962-crack.jpg` shows a central rounded rectangle printed "CRACK" between hexagonal panels. A 3-way junction at each of the 8 cube corners is **unverified**.

## 1966 — Slazenger Challenge 4-Star — `1966-challenge-4-star`

**Panel count. Sources disagree:**
- University of Manchester / NFM CT-scan news release (30 Jul 2026; https://www.manchester.ac.uk/about/news/sixty-years-on-the-ball-that-won-england-the-world-cup-gives-up-its-secrets/): "**25-panel** hand-stitched leather exterior". This was said of the actual final ball, now at the NFM.
- Wikipedia: "25 rectangular panels". museodefutbol.com: "25 panels de cuero rectangulares". balones-oficiales.com: "25 segments". worldcupballs.info: 25.
- FIFA archive, quoting Slazenger stitcher Malcolm Wainwright, who made the sample ball: "They were **24-panel balls**, which meant that there were six panels made up of three long strips of leather but the centre panels of these three strips had a further seam at right angles just to give more strength."

**Geometry.** The Wainwright quote gives the clearest layout. Cube topology with 6 groups of 3 parallel long strips. In each group, the centre strip is cut by one crosswise seam. That makes 4 pieces per group, 24 in total. The NFM photo (`scratchpad/ball1966.jpg`, from Google Arts & Culture) shows this: groups of 3 strips, one strip in each group crossed by a short perpendicular seam. What the 25th panel is (perhaps a valve patch) is **unverified**. Use 24 pieces in the 6×(3 strips, centre split) layout. If the museum's 25 must be honoured, the extra piece's identity is unknown.

---

## 1970–2002 — the 32-panel adidas balls

Balls: `1970-telstar`, `1974-telstar-durlast`, `1978-tango`, `1982-tango-espana`, `1986-azteca`, `1990-etrusco-unico`, `1994-questra`, `1998-tricolore`, `2002-fevernova`, `wwc-1999-icon`, `wwc-2003-fevernova`.

**Panel count: 32 = 12 pentagons + 20 hexagons.**
- FIFA archive: "The 32-panel leather ball with white hexagons and black pentagons" (Telstar).
- Wikipedia list: "32 (20 hexagons and 12 pentagons)" for 1970–2002. It notes Fevernova "retains the underlying truncated icosahedron structure". Icon 1999 is "technically identical to the Tricolore", and the 2003 Women's ball is "technically identical to the Fevernova".
- worldcupballs.info: "32 panels (20 white regular hexagonal and 12 black regular pentagonal)".
- Hong & Asai, *Sci. Rep.* 4:5068 (2014): "Soccer balls are typically constructed from 32 pentagonal and hexagonal panels."

**Geometry (standard; exact).** Truncated icosahedron (Archimedean solid), projected onto the sphere:
- 12 regular pentagons and 20 regular hexagons.
- 90 seams and 60 vertices. At every vertex 3 panels meet: 1 pentagon and 2 hexagons.
- Each pentagon is surrounded by 5 hexagons. Each hexagon alternates pentagon and hexagon neighbours.
- Seams are great-circle arcs on the inflated ball. They were hand-stitched for all of these balls; Azteca 1986 was the first fully synthetic hand-sewn ball (Wikipedia).
- No design patents exist for this layout.

**Printing:** from 1978 to 1998 the "triad" graphic sat on top of the 32 panels. FIFA archive: "a printed design of interconnected curved-edge triangles known as 'triads'". Wikipedia: Etrusco has "three Etruscan lions decorating the twenty typical triangles of the Tango ball". **(Derived)** 20 triads means one triad per hexagon. Their curved arms join across the seams to form 12 circles, one centred on each pentagon. The triads are print, not panels, so do not cut the mesh along them.

---

**WWC 1999 Icon and WWC 2003 Fevernova (measured Oct 6 2026).** Both keep the shared 32-panel geometry (audit 32/32). Their print is now six cube-face decals (`scripts/wwc-balls/wwc-1999-2003/`). The 2003 motif uses the 2002 layout (4 identical motifs, each core on a hexagon at a tetrahedron vertex) but is a new print: navy cores, gold arms with a navy keyline, red flames. On the Icon the circle edge sits about 0.512 rad from each pentagon centre (measured on a photo of the original), with the double lines at 0.468 and 0.491 rad.

## 2006 — +Teamgeist / Teamgeist Berlin (and WWC 2007 Teamgeist Blue) — `2006-teamgeist`, `2006-teamgeist-berlin`, `wwc-2007-teamgeist-blue`

**Panel count: 14.** Sources: US D529,107 ("six of the panel element shown in FIG. 1, four of … FIG. 2, and four of … FIG. 3"), the FIFA archive ("revolutionary 14-panel ball configuration"), and Hong & Asai 2014. Wikipedia says the 2007 Women's ball was "identical in performance" with a different graphic.

**Strongest source: US D529,107 S** (decorated panel assembly). It shows each panel type separately:
- **FIG. 1 — 6 × "dumbbell" (figure-eight / peanut) panel.** A long panel with two round lobes and a pinched waist.
- **FIG. 2 — 4 × three-armed "propeller" panel.** A triangle with three concave sides whose three arms end in short straight cuts.
- **FIG. 3 — 4 × the mirror image of FIG. 2.** So there are 4 left-handed and 4 right-handed propellers.

US D527,432 S (Ball) shows the assembled seam layout. FIG. 1 shows a dumbbell lying horizontally, with a short straight seam running from the middle of its waist, top and bottom, to the round lobe of the next dumbbell.

**Geometry (derived from the drawings; counts check out).**
- The topology is a **truncated octahedron**: 6 squares become the 6 dumbbells, and 8 hexagons become the 8 propellers. soccerpost.com independently says "eight hexagons and six squares".
- The 6 dumbbells lie on the 6 faces of a cube. Their long axes are arranged like the seam on a tennis ball, so opposite faces are parallel and adjacent faces are perpendicular.
- The 8 propellers sit at the 8 cube corners. Left- and right-handed propellers alternate, so each handedness occupies one of the two tetrahedral sets of corners.
- Propeller arms meet end-to-end in pairs: 24 arms make 12 short straight seams, which matches 6 dumbbells × 2 waist seams.
- Every vertex is a 3-panel junction: 2 propeller arm-ends + 1 dumbbell.
- The long seams are smooth curves (concave on the propeller, convex on the dumbbell lobes). The only straight seams are the 12 short waist seams.

Saved drawings:
- `2006-teamgeist-1.png` (D527,432 FIG. 1, seams)
- `2006-teamgeist-2.png` (D520,086, dumbbell decoration)
- `2006-teamgeist-3.png` (D529,107 FIGs 1–3, the three panel shapes)
- `2006-teamgeist-4.png` (D529,107 FIGs 4–5, assembly)

**WWC 2007 Teamgeist Blue (Oct 6 2026).** The one photo found (Flickr ykyeco, all rights reserved) registers onto the shared 14-panel Teamgeist geometry to within 0.2°, and the propeller lobes sit on its seams. Straight grey seam lines on the white areas sit about 0.19 rad from the modelled triangle seams. That is either photo perspective or a small error in the shared geometry; a second photo would settle it.

## 2010 — Jabulani / Jo'bulani (and WWC 2011 SpeedCell) — `2010-jabulani`, `2010-jobulani`, `wwc-2011-speedcell`

**Panel count: 8 = 4 + 4.** Strongest source is **US 8,529,386 B2** (utility; adidas AG):
- "the overall outer shell may be made from only eight panels 30, 40, four of which have the shape of the above explained panels 30 and four of which have the shape of the above explained panels 40."
- "Panels 30 of the first group have a substantially rounded triangular shape, wherein not only the corners of the triangle are rounded but wherein also the three side edges are provided with a convex curvature."
- "Panels 40 of the second group have six corners, which are connected via alternating concave and substantially straight edges."
- Convex edges 31 of panel 30 meet concave edges 41 of panel 40 in "the long, slightly curved seam 50". FIG. 5 shows the unfolded net.
- Pseudo-seams: "three pseudo-seams 60 may extend in an arcuate manner over the surface of the panel 40", which divides it into four sub-panels. Panel 30 may carry one closed pseudo-seam parallel to its edge. The panels are pre-moulded 3D domes (EP 1 424 105 A1, adidas with Molten).

Other sources: Wikipedia list (8, and SpeedCell is "technically identical to the Jabulani"); Hong & Asai 2014. CDS-Luthi's wording "four rounded triangles and four other triangles" is loose; the patent text above is authoritative.

**Geometry (derived; counts check out).**
- **Truncated tetrahedron**: 4 triangles become the 4 rounded triangles (panel 30), and 4 hexagons become the six-cornered panels (panel 40).
- There are 18 seams: 12 curved triangle-to-hexagon seams (convex/concave) and 6 nearly straight hexagon-to-hexagon seams.
- There are 12 vertices, each a 3-panel junction of 1 triangle and 2 hexagons.
- Pseudo-seam grooves have the same cross-section as real seams. Model them as grooves, not as panel splits.
- Total seam length: 1.98 m (Goff, Hong & Asai, via search extract; full text not opened).

Saved drawings:
- `2010-jabulani-1.png` (US 8,529,386 FIGs 2a/2b/3/4)
- `2010-jabulani-2.png` (FIG. 5 unfolded net + FIG. 6)
- `2010-jabulani-3.png` (D613,356)

**WWC 2011 SpeedCell (measured Oct 6 2026).** SpeedCell uses the Jabulani construction, with the triangle size measured on two registered CC photos:
- each triangle's corners sit about 41° from its centre;
- the short hexagon-to-hexagon seam is about 27° long;
- triangle offset −.95, against −.85 in `2010-jabulani.ts`, which fits those photos 2–3° worse.

The fit error dropped from 3.9° to 1.55° (Matheson photo) and from 5.45° to 2.85° (Speedcell.jpg). The geometry is ball-local (`wwc-2011-speedcell.ts`). The men's Jabulani should be checked against its own photos.

## 2014 — Brazuca / Brazuca Final Rio (and WWC 2015 Conext15 / Final Vancouver) — `2014-brazuca`, `2014-brazuca-final-rio`, `wwc-2015-conext15`, `wwc-2015-conext15-final-vancouver`

**Panel count: 6 identical panels.** Sources:
- Wikipedia list: "six polyurethane panels which have been thermally bonded". Conext 15 is "Based on the technology introduced in the Brazuca".
- Hong & Asai 2014: "Brazuca, was produced from six panels".
- soccerpost.com: "based on a cube, using six identical panels that meet at eight fixed vertices".
- Science4All (Lê Nguyên Hoang, 2014): the corners of the square-like panels are 120°, so three panels meet flat at each corner.

**Design patents:** US D696,737 / D696,738 / D697,150 (line drawings) and D702,301 (colour). All are by Julia Otto, priority EM 002156083 (2012-12-19). They show the graphic and seam layout. Each panel is a **four-armed "plus"/pinwheel shape**, and every arm is curved the same way, which gives the swirl.

**Geometry (derived).**
- **Cube topology** with octahedral rotation symmetry and no mirror symmetry (the pinwheel is chiral).
- 6 identical panels, one centred on each cube face. Each panel's 4 arms reach out toward the 4 neighbouring faces and interlock with their arms.
- 12 seams and 8 vertices. Each vertex is a 3-panel junction at about 120°.
- Each seam is a long S-curve replacing a straight cube edge.
- Total seam length: 3.27 m (Goff et al. 2018) or 3.32 m (Goff et al. 2026 extract). Both values are reported and I have not resolved them.

Saved drawings: `2014-brazuca-1.png` (D696,737 FIG. 1), `2014-brazuca-2.png` (D702,301, colour).

**WWC 2015 Conext15 / Final Vancouver (measured Oct 6 2026).** I traced 12 seam runs on the two CC ANDES photos and fitted them jointly from the panel junctions. The Conext15 seams are single odd S-curves along the 12 cube edges, q0 = 0.503·sin(2πu) rad, which fits to 0.98° rms. The Brazuca D696,737 plus outline (`BZ_CORE`) misses the same traces by 2.8–3.4° rms. So the balls have six identical panels and 8 plain Y-junctions. The geometry is ball-local (`C15_CORE` in `wwc-2015-conext15.ts`). The print keeps a D4 subgroup (a 4-fold axis through two panel centres, ±y), not the full cube group.

## 2018 — Telstar 18 / Telstar Mechta (and WWC 2019 Conext 19, Tricolore 19) — `2018-telstar-18`, `2018-telstar-mechta`, `wwc-2019-conext19`, `wwc-2019-tricolore19`

**Panel count: 6.** Sources:
- Physics Today (J. E. Goff, 21 Nov 2022): "Telstar 18's panel count matched Brazuca's … vastly different panel shapes led to a significantly longer total seam length."
- soccerpost.com: "six identical panels with eight corner points, where three panels met".
- Wikipedia list: Conext 19 "shares the same seamless, mono-panel design as the Telstar 18". Tricolore 19 uses "the same template as the Conext 19".
- Total seam length 4.32 m and seam width 3.3 mm (Goff, Hong & Asai, via the Trionda paper's search extract).

**Design patents:**
- **US D816,786 S** (Löffelmann; priority 2016-12-07) is the Telstar 18 pixel graphic. The seams are drawn as broken lines. FIG. 1 shows three seams meeting at a Y-junction in the middle of a white area, with a pixel-pattern patch on each panel.
- **US D804,595 S** (Löffelmann, Bichler, Walker, Juckelandt; priority 2016-12-12) shows a seam layout that matches: nearly straight seam segments, Y-junctions (FIG. 3), and a pinwheel of 4 seams around a small quadrilateral (FIG. 2). The filing does not name the ball, so the link to Telstar 18 is **probable but unverified**.

**Geometry (derived).**
- 6 identical panels with cube topology: 8 three-panel vertices and 12 seams. This is the same topology as Brazuca.
- The seams are built from mostly straight (great-circle) segments with corners, not S-curves.
- Each panel is an elongated polygon. This is why the seams are about 30% longer than Brazuca's.
- Exact vertex coordinates should be traced from the D804,595 drawings. I have not measured them.

Saved drawings: `2018-telstar-18-1.png` (D816,786 FIG. 1), `2018-telstar-18-2/3/4.png` (D804,595 FIGs 1–3).

**WWC 2019 Conext19 / Tricolore 19 (measured Oct 6 2026 on three CC BY-SA Conext19 photos).** Each of the 12 seams is a Z of four great-circle arcs: corner → a point 19.8° from face centre A toward B → edge midpoint → a point 19.8° from B toward A → corner. The middle arc splits the white print rectangle lengthwise, and the diagonals reach the Y-junctions through the coloured arms. The shared Telstar 18 warp has no Z. Conext19 and Tricolore 19 now use a ball-local copy (`CX_GEOM` in `wwc-2019-conext19.ts`); Telstar 18 itself very likely needs the same fix. The panel print repeats under a 3-fold symmetry about one cube diagonal, measured by cross-panel correlation.

## 2022 — Al Rihla / Al Hilm (and WWC 2023 Oceaunz / Oceaunz Final Pro) — `2022-al-rihla`, `2022-al-hilm`, `wwc-2023-oceaunz`, `wwc-2023-oceaunz-final-pro`

**Panel count: 20 = 8 triangles + 12 larger panels.** Sources:
- adidas press release (news.adidas.com, March 2022): "SPEEDSHELL – The ball's polyurethane (PU) skin featuring micro and macro textures and a new 20-piece panel shape".
- Physics Today (Goff 2022): "20 panels, 8 of them triangular and 12 that resemble the outline of a Drumstick ice cream cone."
- soccerpost.com: "The eight triangular and 12 kite-shaped diamond panels create a **truncated rhombic dodecahedron**."
- CDS-Luthi: "twelve large and eight small triangles".
- Oceaunz uses the same 20-piece SPEEDSHELL (adidas / footyheadlines, 2022–23).
- Total seam length 3.52 m, seam width 5.8 mm, depth 1.6 mm (Goff, Hong & Asai, extract).

**Design patent:** I could not identify Al Rihla's own registration (see "Leads"). **US D1,105,320 S** (Löffelmann; priority EM 015014861, 2023-03-17) shows a 20-panel ball of the same construction: small triangles with dot texture and large panels with concentric-ripple texture. Its priority date is after Al Rihla's launch, so it is most likely a later adidas ball on the same construction. Which ball it is remains **unverified** (Euro 2024 "Fussballliebe" is a guess, not checked). Use it only as a drawing of the construction.

**Geometry (derived from the polyhedron soccerpost names; counts check out).**
- Start from a rhombic dodecahedron: 12 rhombi and 14 vertices, of which 8 have 3 edges and 6 have 4.
- Truncate the 8 three-edged vertices. Each cut becomes one small **triangle** (8 total).
- Each rhombus loses its two obtuse corners and becomes an elongated six-sided "kite/diamond" panel (12 total), with two sharp tips.
- The 6 four-edged vertices survive as points where **4 large panels meet tip-to-tip**. These are 6 octahedral points.
- Triangle edges are 3-panel junctions (1 triangle + 2 large panels).
- 8 + 12 = 20 ✓.
- Physics Today's "Drumstick cone" wording suggests one end is more pointed than the other. Check the panel's exact outline against D1,105,320 FIGs 1–3 or photos. The seam curvature is **unverified**.

Saved drawing: `2022-al-rihla-construction-D1105320.png` (FIG. 1).

**WWC 2023 Oceaunz / Oceaunz Final Pro (measured Oct 6 2026).** On the registered Stepro photo the untextured triangle panel ends about 24.5° from its centre. So the triangles are small (CDS-Luthi: "eight small triangles"), and the Oceaunz build uses triangle weight .92 instead of the Al Rihla build's 1.0 (about 37°); audit 20/20. The rounded-triangle print patch is the same on all 8 triangles, but the two tetrahedral orbits are turned 66° against each other (the print is chiral). The swirl repeats with tetrahedral symmetry: rotations in T agree to 0.06–0.15 in the cross-photo test, the other octahedral turns to 0.35–0.6. Registering three views of the Final ball onto the Oceaunz map shows the same layout, with every mark and triangle pattern in the same place.

## 2026 — Trionda / Trionda Final — `2026-trionda`, `2026-trionda-final`

**Panel count: 4. The coloured fields are NOT the panels.** All four panels are identical, and each panel carries all three host colours.

Sources:
- adidas press release (news.adidas.com, 2 Oct 2025): "brand new four-panel ball construction … **Each panel features the country colours of red, blue and green which connect in a form of a triangle in the center of the panel**".
- Same release: "intentionally deep seams and strategically placed debossed lines alongside embossed country icons", "a Star for the USA, a Maple Leaf for Canada and an Eagle for Mexico", "gold embellishments … and detailing that outlines the motifs", and "The 500Hz IMU motion sensor chip now sits inside a specially created layer in one of the four panels."
- Scientific American: "The ball is stitched together from just four panels … based on a platonic solid—the tetrahedron—which is made of four triangles, three of which meet at every point. Though they have three points like a typical triangle, the panels' edges are curves that fit together to give the ball a more rounded exterior." Also: "meandering seams". (The panels are in fact thermally bonded, not stitched.)
- CDS-Luthi: "four panels are identical and based on a tetrahedron … The triangular sides became curves".
- J. E. Goff, The Conversation (13 May 2026): "intentionally deep seams, **three pronounced grooves on each panel** and fine surface texturing"; panels "thermally bonded".
- Goff, Hong, Liu & Asai, *Applied Sciences* 16(6):2808 (14 Mar 2026), doi:10.3390/app16062808. The search-engine extract gives total seam length **2.50 m**. I could not open the full text (HTTP 403), so this figure is unverified.
- Wikipedia (Adidas Trionda): "four thermally bonded polyurethane panels"; red with maple leaf, green with golden eagle's head, blue with five-pointed star; made by Forward Sports, Sialkot.

**Design patent: US D1,100,082 S** "Ball", adidas AG, inventor Abdu Galal. Filed 2023-10-04, granted 2025-10-28. Priority EM 015017152-0001…0004 (2023-04-05). Seven views (perspective, right, left, front, rear, top, bottom), grayscale. Its link to Trionda comes from CDS-Luthi. It also fits the 4-panel, tetrahedral, wave-seam description.

What the drawings show (my reading of FIG. 1, 3 and 6):
1. Long **meandering S-wave lines** crossing the ball. These are the panel seams.
2. **U-shaped / rounded-rectangle loops** that are open at one end and run into the long wave lines.

The drawing uses one line style for everything, so it does not separate true seams from debossed grooves. The "three grooves per panel" (Goff) most likely match these loops, 3 per panel and 12 in all, but that is **unverified**.

**Geometry for the programmer (derived).**
- **Topology.** Tetrahedron: 4 identical panels, 6 seams (one per tetrahedron edge) and 4 vertices. At each vertex 3 panels meet (Scientific American).
- **Symmetry.** The design has the rotation symmetry of the tetrahedron (12 rotations): a 3-fold axis through each panel centre and through each vertex, and a 2-fold axis through each seam midpoint. Each seam is an S-wave, and an S-wave is symmetric under the 2-fold rotation but not under a mirror. So the layout is chiral (rotations only), like Brazuca.
- **Panel shape.** A spherical triangle covering 1/4 of the sphere, whose 3 sides are replaced by S-shaped "wave" curves. Each wave bulges into one neighbour along half of the edge and into the other neighbour along the other half. The 3 corners are rounded points where 3 panels meet.
- **Graphics on each panel.** A central white curved triangle, which is the triangle where the three colours meet (adidas). From it, three coloured fields (red, blue, green) run out toward the panel's three lobes or corners. Each field ends in a wave-shaped tail that follows the seams. Each field carries its icon: maple leaf on red, star(s) on blue, eagle on green. Each field is outlined by gold detailing and debossed lines.
- **Totals.** 4 panels × 3 fields = 12 coloured fields: 4 red, 4 blue, 4 green **(derived)**.
- **Logos.** soccerpost.com says the adidas logo sits on a red field, the FIFA World Cup 26 logo on a blue field and the "TRIONDA" name on a green field. The Commons photos confirm this placement on one panel (adidas on red with maple leaf, FIFA 26 on blue with stars, TRIONDA on green with eagle). Whether all four panels repeat the logos is **unverified**. The photos suggest the other panels carry only the icons.
- **Seam depth.** The seams are deep grooves (adidas: "intentionally deep seams"). Model them as visibly deep, wider than Al Rihla's.

**Common build mistakes to avoid.**
- Do not make 3 panels, one per colour.
- Do not add a separate 4th panel.
- Do not use straight tetrahedron edges.
- Do not let colour boundaries follow the seams. The colour fields are print that flows across each panel, and the seams are wave curves between the four identical panels.

**Trionda Final.** It uses the same 4-panel construction:
- Fox Sports (6 Jul 2026): "four-panel construction"; "a gold, black and white color scheme"; "names of the four final host cities: Dallas, Atlanta, Miami and New York/New Jersey".
- Wikipedia instead says "gold, black, and red". This conflict is unresolved.

Saved drawings: `2026-trionda-1.png` (FIG. 1 perspective), `2026-trionda-3.png` (FIG. 3), `2026-trionda-6.png` (FIG. 6 top). Photos: `scratchpad/trionda_photo1.jpg` (Commons "Adidas Trionda ball.jpg", Pro ball) and `trionda_photo2.jpg` (Commons "Trionda.jpg", League replica showing the three-field triangle with adidas, FIFA 26 and TRIONDA).

---

## Leads not yet checked (Google Patents rate-limited)

adidas EU registered designs titled "Balls for sports", found in a Google Patents assignee listing. I could not open them, so dates and which ball each belongs to are unknown:
- EM 008546212-0001…0008 (Ullrich Nadrau). Possibly Al Rihla (by EUIPO number range, about 2021); **unverified**.
- EM 003187947-0001…0004 and EM 003504364-0001…0008 (Franziska Löffelmann). Possibly the 2016–17 Telstar 18 family; **unverified**.
- EM 015033334-… (Nadrau) and EM 015059781-… (Christoph Juckelandt), 2023 range. Possibly the Trionda Final, Oceaunz or later balls; **unverified**.
- EM 015017152-0001…0004 (Abdu Galal): Trionda (priority of US D1,100,082).
- EM 015014861-0001…0004 (Löffelmann): priority of US D1,105,320.

View them at EUIPO eSearch: `https://euipo.europa.eu/eSearch/#details/designs/<number>`.

Also unchecked: US D973,797 and D936,766 (Löffelmann, priority 2019-10-10), D805,143 (2016) and D872,201 (2017). These are adidas ball designs that do not obviously belong to a World Cup ball.
