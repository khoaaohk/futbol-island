# Boot studio silhouettes (Oct 12 2026)

The Boot Studio (`/shop-lab/boots`, shop wall "Design boots") offers 15 boot **models**, each a different 3D silhouette. 14 of them
follow the side profile of a famous boot of the past, traced from a reference photo the user supplied; the 15th (Indoor Classic)
is a generic indoor shoe. This page is the **internal** record of which real boot inspired which shape, how the shapes were
measured, and the sources. Nothing here is rendered in the game.

## Legal line (keep it)

- We copy **shape and function only**: proportions, toe shape, tongue type, collar height, lacing position, fins, lace covers,
  plate and stud type.
- No brand names, model names, players, logos, stripes, swooshes, formstrips, cat marks, wordmarks or signature graphics (for
  example the circular strike-zone graphic or a tongue logo). No exact brand-identified colourways: presets use generic era colour
  pairs.
- Rendered names and blurbs are original (`lib/shop/boots.ts` MODELS). `tests/shop-boots.cjs` scans every studio source file and
  every rendered string (model names, eras, blurbs, preset names and colourway labels, hints, stud lines) for brand, model and
  player names. Internal ids were chosen so they never echo a product name (for example `longflap`, not the product's name).

## Which boot inspired which model

| Model (rendered name) | id | Inspired by (internal only) | Key shape traits we copied |
|---|---|---|---|
| Modern Speed | speed | Mercurial Vapor II (2004) | slim pointed speed boot, tall thin tongue, low heel dip, SG screw-ins; the studio default |
| Retro Leather | retro | Puma King (1968, 1982 Top) | low black leather, a long fold-over tongue flap over the laces, moulded studs, stitched side panel (plain, no stripe) |
| Classic Kangaroo | classic | adidas Copa Mundial (1979) | full rounded leather toe with quilting, a fold-over tongue, centred lacing, thicker sole, screw-in SG studs |
| Featherlight Leather | feather | Mizuno Wave Cup (2002), also R10 (2005) and Morelia | round toe, quilted soft vamp, a tall tongue standing up, soft heel |
| Power Fins | fins | adidas Predator (1994/1998) | chunky, high instep, huge fold-over tongue, rubber fins over the strike zone (geometry), bladed studs |
| Track Sprinter | track | Nike Mercurial (R9, 1998) | low, slim, track-spike toe, centred laces, upright tongue |
| Long Tongue Control | longflap | adidas Predator Mania (2002) | an extra-long fold-over tongue to the forefoot, pebbled rubber pads (relief), leather |
| Off-Centre Striker | offset | Nike Total 90 III (2004) | lacing swept far to the outside, clean instep with a strike pad, padded heel |
| Speed Cage | cage | Nike Total 90 Laser (2007; also the 2004 lace-cover speed boots) | offset laces under a raised cover (geometry), tall heel, smooth front |
| Ultralight Wrap | wrap | adidas F50 adiZero (2010) | the thinnest upper and plate, sharp toe, asymmetric laces, triangular studs |
| Pro Leather | pro | adidas 11Pro (2013) | soft quilted leather vamp, rounded toe, padded high heel |
| Knit Control | knit | Nike Magista Obra (2014) | textured knit with a mid-high sock collar and laces |
| Sock Striker | sock | Nike Mercurial Superfly V (2016) | tall knit sock collar, close low-volume upper, pointed toe |
| Laceless Control | laceless | adidas Nemeziz (2017/18) | bandage-wrap relief (same colour), low knit collar, no laces |
| Indoor Classic | indoor | generic futsal/indoor shoes | flat gum sole, tall round toe box, toe cap |

## How the shapes were measured (traced profiles)

1. **Trace**: the user's reference image ("Most iconic boot?", 15 side views) was cut per boot and segmented (GrabCut seeded by a
   colour-difference mask over a fitted background plane; white leather filled in from the colour mask). The top outline per
   column gives the side profile; stud tips give the ground line. Scripts: scratchpad `shop-boots-v3/trace.py`, `fit.py`.
2. **Fit**: `fitter.cjs` builds each 3D model (upper, tongue, collar, plate, studs, laces), projects it like a product photo (side
   view, camera about 15° above), and iteratively adjusts the loft knots until its top line matches the trace: the section heights
   from s = 0.5 to 0.85 (instep to toe box; the throat and the toe tip follow them), the collar line under the ankle, the tongue
   height and the sock or mid collar height. The result is `lib/shop/bootProfiles.ts` (generated; regenerate after a geometry
   change). The plan (top view) widths and toe taper per model come from the research below (the reference shows side views only).
3. **Gaps in the trace**: the white leather forefoot of the Wave Cup and the 11Pro drops out of the mask. Their forefoot curves
   were borrowed from the closest traced leather boot (T90 III and Copa) and scaled at the instep. The R10 was traced but not
   used (its shape is the Wave Cup's family).

Mean top-line error after fitting (|reference − our projected boot|, as a fraction of boot length):

```
speed     mean |Δtop| 1.24% of length
retro     mean |Δtop| 1.71% of length
classic   mean |Δtop| 2.49% of length
feather   mean |Δtop| 1.87% of length
fins      mean |Δtop| 1.30% of length
track     mean |Δtop| 1.59% of length
longflap  mean |Δtop| 1.64% of length
cage      mean |Δtop| 1.09% of length
offset    mean |Δtop| 0.96% of length
wrap      mean |Δtop| 1.53% of length
pro       mean |Δtop| 1.37% of length
knit      mean |Δtop| 2.73% of length
sock      mean |Δtop| 2.12% of length
laceless  mean |Δtop| 2.30% of length
```

Fitted knots (dm on a 2.7 dm boot; s from heel 0 to toe 1). Section height at s = .4/.5/.62/.74/.85/.93/1, collar line at
s = 0/.03/.1/.2, tongue top, collar top:

| id | section heights | collar line | tongue | collar |
|---|---|---|---|---|
| speed | 1.07 / 0.93 / 0.76 / 0.58 / 0.40 / 0.29 / 0.17 | 0.85 / 0.86 / 0.75 / 0.62 | 1.21 | – |
| retro | 0.77 / 0.67 / 0.54 / 0.41 / 0.30 / 0.23 / 0.13 | 0.76 / 0.77 / 0.56 / 0.36 | 0.83 | – |
| classic | 0.73 / 0.68 / 0.62 / 0.53 / 0.43 / 0.32 / 0.18 | 0.83 / 0.83 / 0.64 / 0.51 | 1.01 | – |
| feather | 1.06 / 0.93 / 0.78 / 0.58 / 0.49 / 0.37 / 0.21 | 0.76 / 0.77 / 0.72 / 0.53 | 1.10 | – |
| fins | 1.03 / 0.86 / 0.65 / 0.56 / 0.38 / 0.28 / 0.16 | 0.90 / 0.90 / 0.72 / 0.54 | 1.07 | – |
| track | 1.00 / 0.86 / 0.68 / 0.53 / 0.39 / 0.28 / 0.16 | 0.91 / 0.91 / 0.88 / 0.55 | 1.04 | – |
| longflap | 0.85 / 0.73 / 0.58 / 0.45 / 0.31 / 0.23 / 0.13 | 0.78 / 0.78 / 0.73 / 0.41 | 0.90 | – |
| cage | 0.91 / 0.79 / 0.64 / 0.50 / 0.35 / 0.26 / 0.15 | 0.86 / 0.86 / 0.77 / 0.53 | 0.94 | – |
| offset | 1.06 / 0.94 / 0.79 / 0.59 / 0.50 / 0.37 / 0.21 | 0.80 / 0.81 / 0.73 / 0.67 | 1.10 | – |
| wrap | 0.89 / 0.81 / 0.70 / 0.58 / 0.41 / 0.30 / 0.17 | 0.90 / 0.90 / 0.41 / 0.58 | 0.93 | – |
| pro | 0.85 / 0.75 / 0.62 / 0.52 / 0.42 / 0.31 / 0.18 | 0.87 / 0.87 / 0.78 / 0.49 | 0.89 | – |
| knit | 0.88 / 0.77 / 0.64 / 0.54 / 0.45 / 0.33 / 0.19 | 0.63 / 0.64 / 0.56 / 0.47 | 0.76 | 1.31 |
| sock | 0.81 / 0.72 / 0.60 / 0.48 / 0.34 / 0.26 / 0.14 | 0.63 / 0.64 / 0.56 / 0.47 | 0.76 | 1.32 |
| laceless | 0.88 / 0.79 / 0.67 / 0.53 / 0.47 / 0.35 / 0.20 | 0.63 / 0.64 / 0.56 / 0.47 | 0.76 | 0.97 (mid) |

Comparison screenshots (reference crop with the traced line in green and our projected line in magenta, next to our render):
scratchpad `shop-boots-v3/final-desktop/compare-reference-vs-ours.png`.

## Research notes (silhouettes, eras, studs)

- Copa Mundial (1979): kangaroo-leather, best-selling boot; fold-over tongue, simple quilted toe; long a staple of grass football.
- Puma King (1968; King Top 1982): kangaroo leather, padded collar and a classic **fold-over tongue**.
- Predator (1994 debut at the US World Cup): **rubber ridges/fins** on the upper for spin and grip, a large fold-over tongue;
  1998 Accelerator: more focused rubber strike zone; 2002 Mania: very long tongue, leather.
- Mercurial (1998, R9): ultralight (about 250 g) synthetic microfibre, track-spike inspired, sleek and low.
- Mizuno Morelia (1985) and the Wave Cup: lightweight kangaroo leather, barefoot feel.
- Mercurial Vapor (2002 onward): fully synthetic, slim; Vapor IV (2008) had a lace cover and a carbon-fibre sole.
- Total 90 (2000s): **off-centre lacing** to free a clean strike surface; the Laser (2007/08) added a rubber strike grid.
- F50 (2004): hid the laces under a cover (TUNIT customisation in 2006); F50 adiZero (2010): ultra-light single-layer synthetic,
  asymmetric parallel lacing, triangular studs.
- Superfly / Magista (2014): Flyknit with a sock-like "Dynamic Fit" collar; Ace 16+ (2016) and Nemeziz (2017): laceless or
  bandage-like wraps with a knit collar.

Sources:
[90min: the best football boots of all time](https://www.90min.com/features/best-football-boots-all-time),
[90min: greatest football boots ranked](https://www.90min.com/posts/greatest-football-boots-all-time-ranked),
[Bleacher Report: top 10 football boots of all time](https://bleacherreport.com/articles/743381-the-top-10-football-boots-of-all-time),
[Goal: best football boots of all time](https://www.goal.com/en-au/lists/best-football-boots-all-time/blt3672419e9978aa2d),
[Planet Football: twenty years of World Cup boots](https://www.planetfootball.com/quick-reads/twenty-years-of-spectacular-world-cup-boots-r9s-predators-puma-tricks),
[SoccerBible: why the Predator Accelerator is still the best](https://backoffice.soccerbible.com/performance/football-boots/2023/04/25-years-on-why-the-predator-accelerator-is-still-the-best-adidas-boot-of-all-time),
[SoccerBible: F50 adiZero](https://www.soccerbible.com/performance/football-boots/2011/01/adidas-f50-adizero-leather-football-boots-black-white-electricity/),
[balls.ie: a tribute to the F50](https://www.balls.ie/football/a-tribute-to-the-adidas-f50-294461),
[SoccerBible: remembering R9's World Cup boots](https://backoffice.soccerbible.com/performance/football-boots/2020/05/remembering-r9s-world-cup-boots-1998-2006/),
[Captain Creps: the R9 returns](https://captaincreps.com/nike-cryoshot-mercurial-vapor-r9-1998-world-cup-grail-returns/),
[PUMA: King Top](https://us.puma.com/us/en/pd/king-top-tt-soccer-shoes/105734),
[SoccerBible: King Top 1982](https://www.soccerbible.com/performance/football-boots/2011/06/puma-king-top-1982-k-di-football-boots-black-white-gold/),
[Mizuno: Morelia history](https://mizuno.com/football/moment/morelia/),
[The Sole Supplier: Flyknit Superfly](https://thesolesupplier.co.uk/shop/nike-flyknit-mercurial-superfly-0apz00a),
and the user's reference image (`images/81.png` in the session).

## Heat (measured Oct 12 2026)

Production build, headless Chrome/Metal on a Mac, 390×844 @3× (rendered at 1.5×), 4× CPU throttle, GPU timer queries:
- at rest: 0 rAF calls and 0 frames in 2 s (also after an edit);
- spinning: Power Fins 0.71 ms GPU median (1.45 p90), 0.6 ms render CPU, 5 draw calls, 18.4k triangles; Sock Striker 0.57 ms GPU
  (one 3.4 ms p90 spike), 0.7 ms CPU, 5 calls, 18.8k; Speed Cage 0.57 ms GPU (0.67 p90), 0.5 ms CPU, 4 calls, 14.9k. The pair
  doubles the boot (10 calls, about 36k triangles on phones, a toggle);
- switching model: the first visit to a model builds its upper, plate and studs once (40–90 ms CPU at 4× throttle, one frame, on a
  tap); switching back is cached (about 1.5 ms). Uppers are kept in a 6-entry cache and plate+studs in a 6-entry cache.
Desktop emulation only: not an iPhone thermal claim.

## Soles, sides and materials (Oct 13 2026)

User: "fix the boots. all the soles of the styles are so flat ... all the boots look plastic and shiny, they need to look more
natural", then "look at the sides of the boots too. give more shape to it". Shape and material only: no logos, stripes, marks or
technology names are rendered (the brand scan in `tests/shop-boots.cjs` now also blocks plate and upper technology names).

### Sole research (per inspiration, internal only)

| id | Inspired by | Soleplate (research) | What we model (`SOLES` in `bootGeometry.ts`) |
|---|---|---|---|
| retro | King (1968 / 1982) | thin leather/rubber sole sewn or cemented to the upper; screw-ins early, later ~12–14 moulded round studs in a ring | `rubber`, 5.5 mm edge, stitched welt ledge, low 4.5 mm heel wrap, ring of 13 round studs, round blades |
| classic | Copa Mundial (1979) | dual-density PU sole, moulded round studs in a traditional ring (~15 cited), upper cemented and riveted, low internal heel counter | `rubber`, 5.5 mm edge, welt, 15-stud ring (4 heel + 11), quilted toe |
| feather | Wave Cup / Morelia, also R10 | light plate with a midfoot bridge, cushioning unit visible at the heel; R10: 14 moulded studs | `plate`, deep arch bridge, a wavy heel wall, 13-stud ring |
| fins | Predator (1994/1998) | solid rubber/TPU plate, 12–13 multi-directional studs, raised heel | `plate`, 4.5 mm edge, raised heel block, short slim blades |
| track | Mercurial (1998) | thin glass-filled nylon speed plate, light conical cluster, shallow heel cup | thin `plate`, tall heel clip |
| longflap | Predator Mania (2002) | moulded plate with swappable studs, aggressive forefoot, raised heel block | `plate`, the deepest heel block, slim blades |
| speed | Mercurial Vapor II (2004) | contoured glass-filled nylon plate, conical/bladed hybrid, raised heel block, tall heel tab | `chassis` (ribs, two small windows), SG screw-ins by default |
| offset | Total 90 III (2004) | cushioned midsole plate with spine bars, round studs, flex grooves, external heel counter | `chassis` with a spine bar, 4.5 mm edge, raised strike pad on the upper |
| cage | Total 90 Laser (2007) | TPU plate, conical and oblong studs, spine bars, raised heel | `chassis`, the tallest heel clip |
| wrap | F50 adiZero (2010) | ultra-thin glass-fibre frame plate with triangular studs | `frame` with big fore/heel windows, 3.2 mm edge, deep arch |
| pro | 11Pro (2013) | TPU chassis with a forefoot flex zone and a skeleton, cushioned round studs | `chassis`, round-stud ring |
| knit | Magista Obra (2014) | nylon/TPU plate with an all-conical layout for rotation | `plate`, 14 round studs incl. two centre studs |
| sock | Superfly V (2016) | compressed nylon anatomical plate, chevron studs angled by zone | thin `chassis` |
| laceless | Nemeziz 17 (2017) | flexible frame plate, mostly triangular studs | `frame` |
| indoor | generic indoor/futsal | flat gum cupsole with foxing and a toe bumper | `gum`: 7 mm toe bumper, herringbone/futsal tread |

How the plate is built (`buildSoleGeometry`): one lofted mesh, row by row heel → toe, each row one loop: the inside wall (standing
off the upper from a top lip, flaring into a cup at the heel), the edge (a stitched welt ledge on the classics, a vertical face, a
rounded bevel), the underside across, and back up the outside. So every plate has a real edge (3.2–5.9 mm), a side wall that
wraps up the boot (4.5 mm on the 1960s–70s leather boots, 9–27 mm heel counters on the modern plates, a toe bumper), a raised heel
block with a crisp heel breast, an arch cut-out (the underside rises under the midfoot, more on the inside, and the edge scoops
in there), a flex groove across the forefoot and a slight rocker, and it follows the boot's heel lift and toe spring. Studs stand
on the underside where they are (`underAt`) and tilt square to the plate (so the toe studs lean with the toe spring); round studs
have a flange that blends into the plate and a convex taper; SG studs sit on a threaded boss with a hex collar and a metal tip;
blades come in three era styles (rounded moulded blades, slim 1990s–2000s blades, modern blades), plus chevrons and triangles.
Each model has its own stud ring (`studSet`); the 12 stud choices re-use it, so a choice changes the layout but never the plate.
The flat detail is the plate's normal map (tread, ribbed waist, chassis ribs, spine bars, windows, carbon twill, stud collars,
welt stitches) with roughness in its alpha.

### Side research (uppers)

- King / Copa: soft kangaroo-style leather, quilted or box-stitched vamp, fold-over tongue, padded collar, centred 6-eyelet
  lacing, a puffy natural-leather volume. Wave Cup / R10 / 11Pro: very soft leather, stitched padding on the vamp that puffs
  between the rows, padded collars. Predator 1994–2002: moulded rubber fins and pebbled pads raised over the leather vamp, a big
  fold-over tongue. Total 90 III / Laser: a quilted or raised strike pad, offset lacing, external heel counter. Mercurial R9 /
  Vapor II: a thin synthetic skin, slim, low volume. F50 adiZero: a single thin layer with a 3D grip panel on the toe and a lace
  cage. Magista / Superfly V: one-piece knit with a coated grip; the Superfly V's raised ribs run from about 1 mm at the heel to
  2.5 mm on the forefoot; knit collars. Nemeziz: overlapping rubberised bandage strips wrapped round the foot, a knit collar.
- What we model as geometry (`sideRelief`/`reliefSY`, displaced along the outward normal, 2–16 dm·10⁻³): the inside wall is fuller
  and flatter and the outside rounder (`nz`), the forefoot bulges over the toes and the waist pinches in under the arch; toe and
  heel overlays stand 2–6 mm proud with sunken stitched seams; a heel counter cup; a padded collar roll (up to 1.6 mm on the
  leather classics); the eyelet strip is raised with the tongue gap sunk between; quilted toes puff between the stitch rows; soft
  leather pillows over the vamp; the raised strike pad, pebbled pads, side saddle, indoor toe cap, bandage strips (two families,
  one over the other), a lace-cage ridge, knit ribs; fins are taller (2 mm). Tongues are thicker and padded (2.2–2.6 mm). Laces
  criss-cross between real eyelet rings with a flat woven section, and dip into each eyelet.
- In the normal map (bake): leather pebble grain, wrinkles and flex creases behind the toe, double stitch rows on every seam (thread
  in a contrasting tone), quilting stitch lines, knit loops and fibre fuzz, grip dots, rib flanks, bandage-strip edges.
- Decals still project onto the reshaped sides (the zones raycast the real mesh), so stickers and words conform to the bulges;
  the zone round-trip test runs on the relief geometry.

### Materials

`lib/shop/bootMaterials.ts` holds the numbers. The bake writes a per-texel roughness into the normal map's alpha: leather 0.64
(0.47 on the toe: a slight sheen only there), synthetic 0.5 (satin), knit 0.9, rubber fins/pads 0.86–0.88, lining 0.95, thread
0.85. The plate's normal map (a DataTexture) carries its own: satin plate 0.52, rubber sole 0.8, gum 0.78, windows and carbon
0.3–0.36. Knit has a fibre sheen (1.0) with little specular; leather a faint sheen with low specular. The default finish is the
natural one ("Matte"); "Glossy" is a thin clear coat (0.5, roughness 0.14) over the satin base, metallic and iridescent stay.
SG tips are metal (roughness 0.32). Lighting: a prefiltered studio (a gradient dome and three large softboxes) instead of the room
environment, a softer key and rim, occlusion baked from the geometry (seams, quilting grooves, where the upper meets the plate
wall), and a contact shadow drawn in the model's footprint.

### Heat (measured Oct 13 2026)

Production build, headless Chrome/Metal, 390×844 @3× (rendered at 1.5×), 4× CPU throttle, GPU timer queries
(scratchpad `shop-boots-v4/heat.cjs`):

| model (studs) | at rest | spinning GPU median / p90 | render CPU median | draw calls | triangles |
|---|---|---|---|---|---|
| Classic Kangaroo, leather (SG) | 0 rAF, 0 frames / 2 s | 0.71 / 2.05 ms | 0.8 ms | 5 | 19.4k |
| Knit Control, knit (FG) | 0 rAF, 0 frames / 2 s | 0.74 / 2.26 ms | 0.8 ms | 5 | 23.0k |
| Ultralight Wrap, elite plate (carbon) | 0 rAF, 0 frames / 2 s | 0.67 / 0.95 ms | 0.7 ms | 5 | 18.2k |

First build of a model at 4× (upper, laces, plate, studs, plate textures; then the bake and the first frame): 85–130 ms (median
about 100 ms), then cached; the worst phone boot is 26.4k triangles (Power Fins with AG studs; the test caps every model × every
stud type at 30k). Textures stay 1024² on phones (the bake), the plate texture 512×320. Desktop emulation only: not an iPhone
thermal claim.

Screenshots: scratchpad `shop-boots-v4/` (`desktop/`, `phone/` per view: hero, sole, under, outside, inside; `before/`;
`before-after-1.png`, `before-after-2.png`; `closeups.png`).

Sources (soles and sides):
[soccercleats101: King](https://www.soccercleats101.com/?p=164),
[Urban Pitch: King history](https://urbanpitch.com/puma-king-history/),
[SoccerBible: Copa Mundial](https://www.soccerbible.com/performance/football-boots/2008/07/football-boots-adidas-copa-mundial/),
[soccercleats101: Copa Mundial review](https://www.soccercleats101.com/?p=63652),
[footballboots.co.uk: Mundial review](https://www.footballboots.co.uk/review-mundial.html),
[Complex: history of the Predator](https://www.complex.com/sneakers/a/cdaly/the-complete-history-of-the-adidas-predator),
[Wikipedia: Predator](https://en.wikipedia.org/wiki/Adidas_Predator),
[SoccerBible: 1998 Accelerator reissue](https://www.soccerbible.com/performance/football-boots/2018/08/adidas-reissue-the-1998-predator-accelerator-blackwhitered/),
[SoccerBible: R9 1998](https://www.soccerbible.com/performance/football-boots/2013/05/nike-mercurial-r9-1998-the-original/),
[Footy Headlines: Mania 2002](https://amp.footyheadlines.com/893530665839081249),
[Unisport: Morelia II](https://www.unisportstore.com/football-boots/mizuno-morelia-ii-fg-made-in-japan-pearlblackred/142409/),
[Footy Headlines: Morelia Wave remake](https://www.footyheadlines.com/2021/06/mizuno-unveils-remake-of-morelia-wave.html),
[Complex: evolution of the Vapor](https://www.complex.com/sneakers/a/kestiler/the-evolution-of-the-nike-mercurial-vapor),
[SoccerBible: Vapor II & III vault](https://www.soccerbible.com/performance/football-boots/2011/02/nike-mercurial-vapor-r9-ii-amp-iii-football-boots-vault/),
[Footy Headlines: Total 90 III](https://www.footyheadlines.com/2019/04/nike-air-zoom-total-90-iii-football-boots.html),
[soccercleats101: R10](https://www.soccercleats101.com/?p=20277),
[SoccerBible: T90 Laser](https://www.soccerbible.com/performance/football-boots/2009/12/nike-t90-laser-football-boots/),
[Footy Headlines: Laser I closer look](https://www.footyheadlines.com/2019/01/nike-total-90-laser-i-2007-boots-closer-look.html),
[soccercleats101: F50 adiZero](https://www.soccercleats101.com/2011/09/29/adidas-f50-adizero-micoach-released/),
[SoccerBible: 11Pro](https://www.soccerbible.com/performance/football-boots/2012/06/adidas-adipure-11pro-football-boots-white-blue-black/),
[soccercleats101: Magista review](https://soccercleats101.com/2014/03/26/nike-magista-the-complete-review),
[Footy Headlines: Superfly V](https://www.footyheadlines.com/2016/03/next-gen-nike-mercurial-superfly-v.html),
[soccercleats101: Nemeziz 17+ review](https://www.soccercleats101.com/2017/06/19/adidas-nemeziz-17-360agility-complete-boot-review/).
Stud counts for the King, the Copa, the 1994 Predator and the Laser are commonly cited approximations.

## Soles, second pass (Oct 13 2026)

User (approving "another pass to make the soles a bigger difference"): the soleplates still looked too similar across the 15
models, and the blade studs looked crude (boxy extruded blocks with faceted normals). Shape only, as always: no marks, words or
technology names are drawn or written in code (the brand scan also blocks plate technology names, so the code says `swirl`,
`rotor`, `bridge` and so on).

### What each sole is now (`SOLES` in `bootGeometry.ts`, `PLATE_ART` in `bootScene.ts`)

| model | inspired by (internal) | research (soleplate) | what we draw / build |
|---|---|---|---|
| retro | King (1968) | flat dark rubber outsole, ~12–13 round studs, moulded heel stack | `stacked`: full rubber sole, diamond tread, separate stacked heel block in the second colour (layered edges), stitch line + welt, 13 studs, the widest waist |
| classic | Copa Mundial (1979) | thick flat PU sole, ~12–15 round studs, rivets at the toe, no heel block | `ladder`: recessed centre panel with ladder ribs, a lighter dual-density waist insert (see-through zone), crescent heel ribs, second-colour stitches and welt piping |
| fins | Predator Accelerator (1998) | the first anatomical multi-directional plate: asymmetric small blades by zone, a spine between heel and forefoot | `swirl`: horseshoe heel in the second colour round a dark cavity, a see-through hourglass shank with ribs, a raised ring with radial grooves; 19 studs: 9 small blades along the edge + 6 swirling round the ball |
| track | Mercurial R9 (1998) | thin low TPU plate, narrow, continuous | `bridge`: the slimmest waist (12 mm inside / 6.5 mm outside scoop) and a narrow heel plate, the arch bridge raised in the second colour, a centre groove, speed lines; 11 round studs |
| longflap | Predator Mania (2002) | black screw-in plate, rectangular studs, heel block | `diagonal`: a two-tone plate split corner to corner, a dark X brace over a see-through arch, the deepest heel block, slim blades |
| feather | Wave Cup / Morelia (2002) | a heel window showing a wave-shaped cushioning plate; slim waist | `wave`: a scalloped plate edge (3.2 mm), a see-through heel window with wave ribs, the forefoot split into flexing segments by dark gaps, a wavy second-colour line along the edges |
| speed | Mercurial Vapor II (2004) | thin, narrow racing plate (low-confidence source) | `gloss`: a glossy plate (roughness 0.24), a big dark open arch window with a see-through fin, a second-colour rim stripe, fine forefoot ribs |
| offset | Total 90 III (2004) | wider power waist, raised spine bars, round studs | `spine`: a wide plate, a central spine in the second colour, 8 rounded triangular windows, cones down the middle and blades round the edge (`mix`), a second-colour heel clip |
| cage | T90 Laser (2007) | power waist, faceted tread, blade/cone studs | `yspine`: a Y-shaped spine, one big see-through triangle window between its arms, a solid second-colour heel and heel clip (the tallest) |
| wrap | F50 adiZero (2010) | narrow tapering frame, ribs, long narrow studs | `skeleton`: five big open windows (two forefoot, arch, two heel), a very thin narrow heel, triangular studs |
| pro | 11Pro (2013) | wide flat control plate, fewer small cones toward the centre, flex grooves | `cup`: a padded heel cupsole in the second colour with pebbled tread that wraps up the heel, a ribbed shank, three flex grooves; 12 smaller cones set inboard |
| knit | Magista Obra (2014) | round studs in a 360° rotational pattern | `pods`: round studs on raised domed pods (a ring of 6 + the hub), a bubble texture, a dark textured (twill) arch panel |
| sock | Superfly V (2016) | dark carbon-look plate, chevron blades, ridged "mountain range" waist | `chevron`: a dark textured arrowhead panel, ridges across the waist, a second-colour rim, chevron blades |
| laceless | Nemeziz 17 (2017) | translucent frame showing ribs, twin spine, 7 forefoot + 4 heel half-moon studs in a rotational ring | `rotor`: a see-through frame with ribs inside, a twin spine and a ring round the ball in the second colour, 7 half-moons in a ring (flat side in) |
| indoor | generic indoor cupsole | gum cupsole, herringbone, a pivot circle | `gum`: herringbone, a pivot circle under the ball and one at the heel, a second-colour toe bumper and heel foxing |

Colour zoning: the plate art writes a third texture (zones). The plate shader mixes in the **second colour** (red zones: the first of
the pattern, heel, stud, side and toe colours that stands apart from the soleplate, so a two-tone plate always reads), a
**see-through** look (blue: a smoky darker or lighter tint, glossier, with ribs drawn inside) and **dark open windows** (green: near
black, or steel on a dark plate). Uniforms only: a colour change never recompiles; the zone texture comes with the plate textures
(cached per model and stud layout). Geometry: each model's waist scoop (`waist`), a narrower heel plate (`heelIn`) and the scalloped
edge (`wave`) change the outline seen from below; the heel block depth differs (2.6 mm on the ultralight to 4.6 mm).

### Studs

Every moulded stud is now a **loft** over a rounded plan outline: blades are superellipses (gently convex sides into round ends),
chevrons, triangles and half-moons are polygons with filleted corners; the outline is resampled so rings line up; rings run from a
concave fillet flange (it meets the plate with a curved bevel, buried 0.6 mm in the plate), down a drafted body (a blade is 76% as
long and 44% as thick at the tip as at the base, with a slight convex belly and a 1.4 mm bow in plan), to a quarter-circle rounded
tip and a domed cap. The ring index wraps, so the normals are shared and smooth. SG studs: a raised boss, a filleted hex collar
(flat faces, soft edges), a cylindrical body with a rounded bottom edge and a domed metal tip. Cones are the same loft round a circle;
the pods add a convex dome. Phones get fewer rings and outline points (18 points, 9 rings). Still one merged mesh per layout.

### Side views of the white leather boots (bonus)

The heel colour block's front edge is now per model (`look.heelLine`, shared by the bake and tap-to-paint): the 2002 lightweight
has a low crescent that sweeps forward along the sole plus a stitched wave line along both walls; the 2013 leather boot a tall block
slanting forward with a collar-coloured, stitched heel tab; the 2004 striker keeps the upright block and now shows a heel clip in
the second colour on its plate.

### Sole difference metric

`tests/shop-boots.cjs` section 14: a top-down raster of every model's outline and stud footprints (with its preset studs) must
differ pairwise by more than 3% (closest now classic/indoor 4.2%), every model draws its own underside, studs taper with a flange
and smooth normals, the heaviest phone stud layout stays under 12k triangles. With `BOOT_SOLE_BASE=http://localhost:PORT` it also
runs the rendered **sole compare**: all 15 Sole views straight from below in the same colours, cropped, shrunk to 128×48 grey,
mean absolute pixel difference per pair, threshold 5%. Before this pass the closest pair (retro/feather) was **1.10%** (median
5.6%); now the closest (fins/pro) is **6.8%** (median 13.4%).

### Heat (measured Oct 13 2026, second pass)

Production build, headless Chrome/Metal, 390×844 @3× (1.5×), 4× CPU throttle: 0 rAF at rest, 5 draw calls; spinning GPU median /
p90: Power Fins 0.82 / 0.90 ms (25.2k triangles), Classic Kangaroo SG 0.72 / 0.81 ms (21.5k), Ultralight Wrap 0.68 / 0.76 ms
(21.6k). First build of an uncached model at 4× (upper, laces, plate, studs, plate + zone textures, bake, first frame): 47–105 ms.
Worst phone boot (test): 26.9k triangles (Power Fins with SG mix). One more texture (the zones, 512×320 on phones), no new draw call.

Screenshots: scratchpad `shop-boots-v5/` (`before-after-soles.png`, `before-after-uniform.png`, `before-after-under.png`,
`close-sheet.png`, `leather-sides.png`, `phone-sole-grid.png`, `phone-hero-grid.png`, `after-hero-grid.png`).

Sources (second pass, opened):
[Wikipedia: Predator](https://en.wikipedia.org/wiki/Adidas_Predator),
[Footy Headlines: Mania 2002 closer look](https://www.footyheadlines.com/2018/11/closer-look-adidas-predator-mania-2002-world-cup-boots.html),
[Unisport: 15 years of the R9](https://www.unisportstore.com/blog/31567-15-years-with-the-mercurial-r9-the-original-faces-off-with-the-heir),
[SoccerBible: Wave Cup Legend](https://www.soccerbible.com/performance/football-boots/2018/11/mizuno-launch-the-wave-cup-legend-whiteblueyellow/),
[Footy Headlines: Total 90 III](https://www.footyheadlines.com/2019/04/nike-air-zoom-total-90-iii-football-boots.html),
[soccercleats101: Air Legend R10](https://www.soccercleats101.com/2015/08/30/cleatology-the-original-nike-air-legend-tiempo-r10/),
[soccercleats101: F50 adiZero leather](https://www.soccercleats101.com/2014/02/03/adidas-f50-adizero-leather-review/),
[soccercleats101: 11Pro review](https://www.soccercleats101.com/2013/12/04/adidas-adipure-11pro-samba-review/),
[soccercleats101: Magista review](https://www.soccercleats101.com/2014/03/26/nike-magista-the-complete-review/),
[soccercleats101: Superfly V review](https://www.soccercleats101.com/2016/07/31/nike-mercurial-superfly-v-boot-review/),
[soccercleats101: Nemeziz 17+ review](https://www.soccercleats101.com/2017/06/19/adidas-nemeziz-17-360agility-complete-boot-review/),
[footballboots.co.uk: Mundial review](https://www.footballboots.co.uk/review-mundial.html),
[soccercleats101: King Ultimate review](https://www.soccercleats101.com/2023/07/25/puma-king-ultimate-fg-complete-boot-review/).
Lower confidence (no dedicated source found): the 1968 King's exact plate, the Vapor II and the 2007 Laser plates, the generic
indoor cupsole; these follow the era's conventions.
