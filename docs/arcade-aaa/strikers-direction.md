# Island Strikers: art direction (pass 1, Nov 10 2026)

**One line:** a floodlit night match, seen through a live TV broadcast. The player is the director's main camera.

## References
- Evening league football on TV: the high main-gantry camera, mown stripes under four towers, LED boards round the pitch.
- Broadcast graphics packages of the 2010s-20s: flat slabs, hard edges, condensed caps, one signal colour, a channel ident.
- The telestrator: analysts drawing rings and lanes on the grass. Every coaching overlay in the game is "drawn by the studio".

## Palette (hex)
- Night: sky `#05070d`, haze `#0c1422`, stand concrete `#232936` / riser `#161b25`, rim steel `#39414f`.
- Turf: light band `#2f7d3d`, dark band `#25672f`, lit pool `#49a04f`, worn `#6f7b3c`, apron `#1d4f2a`, chalk `#f2f5ee`.
- Light: floodlight `#f4f7ff`, glare core `#ffffff`, haze beam `#cfe0ff` (Pro: cold `#d8f1ff`, Legend: sodium `#ffd98a`).
- Broadcast: graphite `#0d1015`, slab `#171b22`, paper `#f3f1ea`, signal yellow `#f2d21b`, live red `#e5372b`.
- Teams: Gold `#f0b429`, Blue `#2f7fd6`. Telestrator keeps the taught colours: cyan = open / clean band, orange = covered.

## Type
- Condensed broadcast sans from the system (no network font): "Avenir Next Condensed", "Roboto Condensed", "Arial Narrow".
  Caps, tight tracking for tags; tabular numerals for clock and score. Two weights only (600 / 800).
- Buttons keep the regular UI sans at weight 800 (AGENTS.md). No IslandBrush anywhere in this game.

## Materials
- Turf: one unlit plane with a canvas texture painted once: mown bands, cross-mow sheen, blade grain, worn goalmouths and
  centre spot, four floodlight pools and edge falloff baked in. The largest surface on screen runs the cheapest shader.
- Chalk lines: one merged mesh, slightly broken by the same wear. LED boards: one mesh, one emissive strip texture whose
  "sponsors" are the game's coaching habits (SCAN FIRST, PASS AND MOVE, FIND SPACE, FIRST TOUCH).
- Stands: a stepped concrete bowl in one vertex-coloured mesh with the four lattice towers merged in.
- Crowd: about 1,300 cut-out supporters in ONE instanced draw; sway, bounce and scarf-lift run in the vertex shader.

## Lighting
- No sun: shadow pass removed. Each body and the ball throw four soft shadows away from the four towers (one instanced
  draw), the tell-tale look of a floodlit pitch. Bodies get a cool key and a green bounce from the grass.
- Tower glare (one points draw) and haze cones (one merged draw) swell on a goal; camera flashes sparkle in the stands.

## Camera language
- Play: the existing main-gantry follow camera (framing is pinned by tests and by the thumb controls).
- Goal: hit-stop, flash-bulb sparkle, then a diagonal broadcast wipe into the slow-motion replay with a REPLAY tag, and a
  wipe back out. Kick-off and full time keep the gantry glide.

## HUD concept: "Tide Sport Live"
- Scorebug: a hard-edged slab, channel ident tab, GLD / BLU tags on team-colour blocks, score cells, clock cell on paper.
- Lower third: coach lines slide in from the left as a caption with a yellow key bar and a COACH tag.
- Goal / event banner: a full-width strap with a skewed colour key, not a floating pill.
- Controls: flat matte discs with a single ring, labelled in UI sans; no glow. Start and full-time cards are broadcast
  "match cards": fixture header, formation-style goal list, one yellow primary.

## Sound palette
- Crowd bed: filtered noise through two formant bands, swelling and falling with the match's crowd energy; a surge and a
  roar on chances and goals, a groan on near misses.
- Foley: low leather thump for kicks (pitch-dropped sine + noise click), net swish (band-passed noise sweep), post clang.
- Referee's pea whistle (two detuned squares with tremolo). Broadcast sting: a short brass-like fifth on kick-off and goals.

## Signature moments
1. Kick-off: the bowl hums, the sting plays, the scorebug slides down.
2. A clean strike: thump, the crowd lifts before the ball lands.
3. Goal: net ripple, flashes across the stand, boards scroll, wipe, replay, wipe.
4. Full time: three whistle blasts, the crowd falls to a murmur, the result card comes up as a broadcast full-time graphic.
## Budget after pass 1 (phone profile, measure-arcade-games.cjs, dev build; Mac only, no thermal claim)
Draws 178/188 -> 66/77 · triangles 127.5k -> 53.6k · JS 1.8 -> 1.0 ms · menu 0 frames · textures 9 -> 14 (2048x1024 turf, small atlas, dot, supporter).

## Pass 2 (Nov 10 2026): depth, people, grounding, the finished package
- **Camera:** landscape now uses its own lens in `strikerScene.ts` fit(): phone `LANDSCAPE_TILT 1.7` (about 30 degrees up, was 52), `LANDSCAPE_FOV 50`, lift `.06`, follow zoom 1.16 (was 1.28); desktop `DESKTOP_TILT 1.3`. Portrait is unchanged (fov 38, `-d*.52`). The picture is full-bleed in landscape: the top bar floats over it (skin CSS). Trade: the pitch is about 180 px deep on an 844x390 phone (it used to overflow the frame), bodies are taller (38 px vs 35), and no thumb key covers the pitch except the near right corner.
- **Stadium (`strikerStadium.ts`, still 9 draws):** painted night sky with the island ridge; seven-row bowl with seat rows, aisles and a banner fascia (LOOK UP, PLAY SIMPLE, ONE TOUCH, WIN IT BACK); a far lamp gantry with four banks, lens glare and haze cones; the near stand climbs on as the dark foreground. Chalk is painted into the turf (the line mesh is gone), with overspray and wear; the yellow wear blotches are gone; sheen pools under the gantry.
- **People:** one instanced draw from a 16-cell atlas (8 people x calm / celebrating): supporters, scarves, flags, stewards, photographers by both goals, ball crew, subs on the benches. The shader swaps the shirt key for the instance colour, raises arms with crowd energy, and runs a wave from the scoring end.
- **Grounding:** four tapered shadows per body (clean cross, one instanced draw) plus a contact shadow (one more); a cool back light from the gantry rims bodies and ball.
- **Goals:** own frames (square posts, stanchions) in the bowl mesh and one net mesh whose back panel bulges where the ball hits; `stage.goal()` is no longer called.
- **HUD:** thumb controls are eight-sided vision-mixer keys with a tally bar (pressed: invert and sink; Shoot fills with the charge and takes the gauge zone colour; Sprint drains with stamina, red when low; hints light the key). Scorebug drops in at kick-off, replay wipe closes BEFORE each cut (`data-replay` pre / on / out / off), a FULL TIME lower third over the outro, square match cards for start, pause and results.
- **Feel:** save = punch, shake and flashes; tackle / steal = shake; post = shake; pass = small turf puff.
- **Budget (phone profile, dev build, Mac only, no thermal claim):** draws 66/77 -> 53/63 · triangles 53.6k -> 53.6k (max 54.5k) · JS 1.0 -> 0.9 ms · menu 0 frames · textures 14 -> 18. Added cost: the canvas is 16% larger on a phone (1266x585, was 1266x504) because the picture is full-bleed.

## Pass 3 (Nov 10 2026): the phone frame, kits, markers
- **Foreground:** on phones the near stand is gone. Under the thumbs is the back edge of the TV gantry: a dark deck, a kick plate, one steel handrail. Nothing in it moves or carries colour. Desktop keeps the near stand.
- **Camera (phone landscape):** `LANDSCAPE_TILT 1.4` (about 35 degrees), `LANDSCAPE_FOV 40`, `LANDSCAPE_LIFT -.05`, `LANDSCAPE_X 1`, follow zoom 1.08. Pitch depth 180 -> 225 px on 844x390; the far touchline is 60% as wide as the near one (was 55%; far-side bodies 32 -> 34 px), so up/down passes read larger. Far stand, boards and lamp glare stay in frame in follow play (the gantry sits 1.3 m lower).
- **Goals vs keys:** the follow cam never pans toward the attacked goal (`LANDSCAPE_PAN_RIGHT 0`) and pans freely toward Gold's own; the right goal's near post stays at x >= 762 of 844 (the Sprint key ends at 758) in every follow state. Depth pan is one-sided: near-touchline play lifts the picture clear of the keys.
- **Kits:** Gold `#f0b429` with graphite trim and shorts, Blue `#2f7fd6` with paper trim and navy shorts, keepers red (Gold) and silver-white (Blue); numbers 7, 9, 10 / 4, 6, 8, keepers 1, painted by the shared bean skin (they resolve from about 6 px digit height: replays, charge focus, goal beats).
- **Markers:** selected player = two thin signal-yellow arcs open toward both goals plus a flat pointer tab overhead; pass target = a four-tick reticle on a hairline lane. Scan rings keep the taught cyan / orange.
- **Budget (phone profile, dev build, Mac only, no thermal claim):** draws 53/63 -> 52/59 · triangles 53.6k -> 50.1k (max 51.0k) · JS 0.9 ms · menu 0 frames · textures 18.
