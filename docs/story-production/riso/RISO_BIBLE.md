# Riso story rebuild — art bible and engine contract

September 20, 2026. This supersedes every earlier story-visual document in `docs/story-production/` (ART_DIRECTION.md, FORWARD_PASSAGE.md, the per-story rebuild ledgers). The user rejected the previous visuals in full. **Keep only: the scripts (narration text + captions), the recorded voice files, and the playback UI at the bottom (`StoryPlaybackBar`).** Everything drawn is rebuilt.

Reference skill: `hand-drawn-canvas-animation` (alesha-pro/tools), copied to the session scratchpad at
`/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/alesha-tools/skills/hand-drawn-canvas-animation/`
Read `references/style.md` (Riso section), `references/palettes.md` (risoPop, plates), `references/architecture.md` (Riso plates, pitfalls, cache pattern), `references/motion.md`, `references/scenes.md` (Riso look recipes N–S), and `assets/core.js` lines 270–320 (`surface`, `dotScreen`, `plate`, `printPlate`, `paper`). Our runtime engine is a TypeScript re-implementation of that vocabulary tuned for phones.

## 1. What every story must be

- **Look: risograph print.** `risoPop` family. Cream paper stock always visible; 3–4 ink plates printed in order with multiply overprint (blue × yellow = green, pink × blue = purple, pink × yellow = orange); halftone dot screens for tone; restrained registration offset (each plate shifted 1–2.5 px in a stable direction, re-seeded only per chapter = a new print); low-frequency mottling in large ink fields; paper shows through everywhere (coverage cap ≈ 0.8, ink alpha ≈ 0.9).
- **Textured backgrounds.** No flat colour holds. Backgrounds are ink fields with visible screen, mottling and paper grain, torn/wobbly edges, gradients only as dot-size ramps.
- **Abstract imagery that represents the narration.** Big, legible, cropped, recognizable forms: football (5-panel), boot, cupped hand, eye, ear, speech bubble, goal frame, chalk line, thread, kite, radio dial, water ripple, lantern, sail, shirt, seed/root/fruit, pressure walls, arrows/lanes. **No full-body figures, no faces with expressions, no portrait characters, no tiny icon grids.** Each story owns one dominant material metaphor and develops it.
- **Many interactions per scene.** Each chapter (narration paragraph) is one continuous composition with **at least four visible cue-aligned actions** (something changes because of the words) and **at least three camera moves** (push, pan, drift, rotate). Cameras move with purpose: reveal, follow, isolate. Never idle wobble.
- **Scenes go into one another.** Every chapter seam is a **forward passage**: the camera travels into a painted material of the outgoing composition (a ball panel, a pigment field, a speaker cone, a lantern glass, water) and the next composition is revealed inside it and continues forward. Never zoom in then shrink back out. Never hard-cut between chapters. Within a chapter, use continuous pans across one world.
- **JavaScript + Canvas 2D**, runtime, mobile-first, phone-heat aware (see §6). No video files, no images (except the existing cached grain tile is replaced by a generated one).
- **Voice + script unchanged.** Narration audio files and caption text stay exactly as shipped. Cue timings: reuse the word onsets in `lib/paths/films/phraseFilmScores.ts` (`at` values are aligned to the shipped audio) and `lib/paths/films/narrationTiming.json` (chapter durations). For the three former video films use their cue json (`public/stories/films/{futsl,regulate}/timeline.json`, `public/stories/films/grit/narration-cues.json`) on media time.

## 1b. User-supplied texture reference (mandatory look target)

The user supplied three frames as the sample of the **texture backgrounds** they want: `docs/story-production/riso/reference/texture-01-fear-arches.png`, `texture-02-frustration-channel.png`, `texture-03-ribbons-scribble.png` (open them with the Read tool). What they establish:

- **Whole-frame ink fields with visible speckled grain everywhere** (fine stochastic speckle in the ink, not only on paper), tonal steps as nested bands (the concentric arches: 5–6 bands of the same blue at stepped coverage), each band its own flat print with grain.
- **Fields cut by torn / hand-cut edges**: a navy channel with jagged edges running between an orange field and a pink field; the edge is irregular, not a straight line or a smooth curve.
- **Broad diagonal ribbons** of 4–5 inks (navy, blue, orange, pink, green) crossing the entire frame edge to edge, with a large cream disc printed over them and multi-ink scribble lines (orange, pink, yellow) inside the disc.
- Motifs are **huge**: the star outline fills the channel; the disc is ~45 % of frame height; the arches fill the frame. Small confetti fragments (cream, blue) float in the field as secondary accents.
- Headline lettering is chunky brush type in cream with a yellow underline (that lives in HTML; the canvas provides room for it at the top of the safe region).

In riso terms: reproduce this with `field()` + stepped `tone()` bands + torn-edge paths + ribbons, all carrying grain, and then add what these frames lack: overprint mixing, halftone screens in gradients, and registration offset. Every chapter background must be at this texture level; a flat fill is a defect.

**Backgrounds are unique per story (user rule).** The texture *level* is shared; the *construction* is not. Each story designs its own background world that grows out of its metaphor and tone, and no two stories may reuse the same background construction (e.g. only one story may use nested arches; only one may use the torn channel; only one may use diagonal ribbons). Examples of the intended variety: a chalk court surface with dust and stepped court markings for The Chalk Line; a woven weft/warp lattice for The Woven Court; wind-streaked sky bands with a torn horizon for The Kite That Turned; overlapping colour plates that only complete the picture together for A Place in the Picture; concentric speaker-wave rings for The Pocket Radio; water ripple bands between two shores for The Signal Across the Water; tide lines on a shore for Different Tides; a night harbour with lantern halftone glow for The Harbour at Night; pencilled map contours for The Unfinished Map; a dark room pierced by one lantern's stepped light for The Quiet Lantern; weather fronts and sail cloth for The Boat and the Weather; shirt fabric weave and a growing outline for More Than a Shirt; underground strata for Grit; a bending branch in wind bands for Mental Toughness; settling ripples for After the Final Whistle. The storyboard must name the story's background construction for each chapter and state how it differs from the neighbouring stories in the same path; the art-director critics check uniqueness across all eighteen.

**Imagery is distinct per story too (user rule).** Do not reuse the same imagery across stories; the films must not feel repetitive. The shared shape library exists so the *print language* matches, not so every story shows the same ball-boot-eye-bubble sequence. Rules: each story has its own metaphor objects as the leads (kite, thread, radio dial, lantern, sail, map, seed/root, shirt, tide line, chalk, pigment plates, ripple signal, branch, whistle/scoreboard…); football objects appear only when the narration names a football action and never the same way twice across stories (a ball may be a chalk-drawn circle in one story, a woven knot in another, a lantern-lit sphere in a third); the generic eye/ear/hand/bubble are used at most once per story and drawn in that story's material (an eye is a pigment blot here, a lantern glass there, or omitted). The storyboard lists the story's lead imagery and the critics reject any two stories whose lead imagery or cue-action vocabulary overlaps.

## 1c. Less abstract: kids must clearly see the message (user rule, after the first full build)

The style and the speed are approved. What changes: the imagery gets **less abstract** so a child (roughly 7–12) can see the message and understand what the pictures are without the narration. Rules:

1. **Kid test per chapter.** With the sound off, a 9-year-old must be able to say in one sentence what is happening on screen and it must match the storyboard's "meaning". If the storyboard needs a sentence to explain what a shape stands for, the shape is too abstract.
2. **Name-it-at-a-glance objects.** Every lead object is instantly nameable: a kite looks like a kite (diamond, spars, bow tail), a lantern like a lantern (frame, glass, flame), a radio like a radio (box, speaker grille, dial, needle), a boat like a boat (hull, mast, sail), a map like a map (coastline, path, X marks), a tree like a tree (trunk, roots, leaves, fruit), a shirt like a shirt. No symbolic stand-ins that need decoding (a flag as "the ask", a knot as "the reset word", a paper lens as "attention"). Where a concept has no object, show a person doing the thing.
3. **Football things look like football things.** When the narration names a ball, goal, boot, pass, teammate, coach, whistle or scoreboard, show it recognizably: a round ball with visible panels (the panel pattern, size and colour may vary per story for the anti-repetition rule, but it must always read as a football), a goal with two posts, a bar and a net, a boot shape, a pass as the ball travelling from one player to another.
4. **People are allowed, but abstract, not full-scale realistic people (user clarification).** Where the narration talks about a player, teammate, coach or "you", draw an **abstract riso figure**: a few cut-paper shapes that read as a person at a glance (a disc head + a torso block + two leg strokes; or a torn-paper blob with a head disc; or a chunky pictogram like a sports-poster mark), NOT an anatomically proportioned full-body silhouette, no hands/feet detail, no hair, no clothing detail, no face. Think riso poster pictograms and paper cut-outs: 3–6 shapes per figure, one or two inks, edges wobbly or torn, printed with halftone like everything else. Proportions may be exaggerated (big head disc, short legs) so they stay toy-like and clearly drawn. Emotion and action show through the whole pose and through the environment (shoulders block tilts down, arms as two strokes lifting, a lean toward a teammate; walls, weather, light), never facial expression. Keep figures big and few (1–3 on screen). The test: a kid says "that's a player" instantly, and an adult says "that's a paper cut-out", never "that's a person".
5. **One thing at a time, big and centred.** The object the sentence is about is the largest thing on screen and sits in the centre of the safe region; supporting elements are smaller and fewer. Cause → effect is staged so the eye is never guessing where to look. Remove decorative clutter that competes.
6. **Headline must match the picture.** If the headline says PRESSURE, a child must see something being pressed; if it says LISTEN, a child must see someone listening (head turned, hand to ear, or a silhouette leaning in).
7. **The metaphor is shown next to the football.** When a chapter maps a metaphor onto football ("in futsal, that means…"), show the football version of the same idea in the same frame or immediately after through the seam, so the child sees the connection, not just the metaphor.

Texture, print language, motion enactment, passages and headlines all stay exactly as specified; only the legibility of the subject matter changes.

## 2. Palette system

Paper for all stories: `#f0ece2` (cream stock). Key ink for all stories: navy `#22366b` (prints last, darkest). Path ink families (pick three per story + navy; two stories in a path may not use the identical triple):

| Path | Inks available |
|---|---|
| Futsal | fluorescent pink `#ff48b0`, blue `#0078bf`, yellow `#ffe800`, green `#00a95c` |
| 7v7 | orange `#ff6c2f`, green `#00a95c`, yellow `#ffe800`, pink `#ff48b0` |
| 9v9 | blue `#0078bf`, bright red `#ff665e`, yellow `#ffe800`, teal `#00838a` |
| 11v11 | purple `#765ba7`, orange `#ff6c2f`, yellow `#ffe800`, blue `#0078bf` |

Night/dark scenes are printed: a heavy navy (or purple+blue overprint) field with halftone letting paper through; never a flat #000 fill. A "duotone beat" (one chapter in two inks only) is allowed once per story as a strong moment. Text on canvas: none (labels live in HTML).

Role colours must stay consistent inside a story (e.g. the ball is always paper-white with navy panels; "pressure/opponent" is always the same ink; "support/teammate" always another).

## 3. Drawing vocabulary (shared library, `lib/paths/riso/shapes.ts`)

All stories draw from one library so the eighteen films read as one print run. Functions take world coordinates and an ink name; internals use seeded wobble (`wob`) for edges, occasional gaps, torn edges for fields, and knockouts (paper) for highlights. Minimum set (engine agent implements; builders may add story-specific shapes to their own file, not to the library):

`ball(s, rot)`, `boot(s, angle, mirror)`, `hand(s, angle, open)` (cupped, abstract), `eye(s, look, blink)`, `ear(s)`, `bubble(w,h, tail)`, `goal(w,h, depth)`, `coneLine/laneArrow(a→b, width, dashed)`, `chalkStroke(points, width)`, `thread(points, width)`, `field(kind: torn|wave|arch|wall, …)`, `ripple(r, count)`, `leaf`, `seed`, `sun/lantern disc(r, glow)`, `kite`, `sail`, `dial(r, angle)`, `shirt`, `pressureWalls(gap)`, `sparkBurst`, `speedLines`.

Line language: pressure-varied contours (thicker on the shadow side), taper at ends, deliberate gaps at overlaps. Hatching only as halftone (`tone`), never pen hatching (one finish per film).

## 4. Scene and camera grammar

- Logical units: the sheet is `1080` units on its short side (like the skill); compositions are authored in world units around the chapter's centre. Engine exposes `sheet.W/H` in units and `sheet.safe` (art region above the caption tray on phones).
- Each chapter: authored **composition** (large forms occupying ≥ 60 % of the safe region) → **cue actions** (anticipation ≈ 0.2 s, action 0.3–0.8 s, result readable for ≥ 0.8 s, next action connected) → **camera plan** (keys at cue times) → **seam passage** (last 0.65 s of the chapter, material named).
- Exposure: drawn objects update on **twos** (12 Hz, `twos(t)`) so poses read as redrawn; camera, light and passages sample every frame. Randomness is seeded per drawing, never per frame. A held drawing holds its marks.
- Football meaning must be correct (pass = 0.65–0.8 s ball flight, receiver cushions; pressure closes toward the ball; support offers an angle).
- Reduced motion: one stable representative print per chapter, hard cuts, no camera travel.

### 4b. Motion is expressive and fluid (user rule)

Motion must *perform* the words, not illustrate next to them. When a narrated word carries force, the drawing physically enacts that force on something:

| Word family | What the motion does |
|---|---|
| pressure, press, squeeze, closing, tight | a large mass PUSHES into another object; the pushed object deforms (squash, sag, bend), the gap visibly narrows, edges crumple |
| rush, fast, quick, arrive | overshoot with a smear-on-twos, then a settle; the camera is dragged along a beat late |
| breathe, breathe out, room, space, loosen | the whole composition expands: fields retreat, the gap widens, tension in a line slackens, tempo slows to a long ease-out |
| stuck, frozen, wait | motion stops dead on a held drawing, the camera still creeps so the hold has weight |
| shout, anger, noise | violent spike, jagged edges shake in place, ink splatters/confetti burst outward |
| connect, support, share, together | two separate forms travel toward each other and physically join (knot, overlap that overprints into a third colour, a strand looping through another) |
| lose, miss, drop, break | a form slips and falls with gravity, a thread snaps and recoils, the camera drops with it |
| look, notice, scan | the camera itself turns/pans as the "look"; the noticed object is revealed by the pan, not by fading in |
| adjust, turn, change angle | a rotation with anticipation (small counter-turn first), the object rotates as one mass |
| grow, reach, return | organic ease-in growth from an existing base along a curve, tips leading |

Rules: every cue action has anticipation (0.15–0.3 s counter-move) → main action with a real easing curve (never linear) → overshoot/settle → consequence on something else. Objects have mass: heavy masses accelerate slowly and stop with a bounce; light things flutter. Forces propagate: when a wall pushes, the thing behind it bends, then the thing behind that shifts. The camera participates (leans into pushes, is pulled by fast things, breathes out on "breathe"). Drawn objects on twos, camera on ones. Nothing drifts idly; if nothing is spoken, a slow moving hold continues the last force (a residual sway that decays). Critics reject any cue where the word says push/pressure/rush/breathe and the frame does not visibly enact it.

### 4c. Words on screen (user rule)

The caption tray at the bottom already reads the narration. Do **not** put sentences in the visuals. Each chapter may show **one or two words at most** as a headline (e.g. "PRESSURE", "BREATHE", "NEXT", "LOOK UP"), and only when a word carries the beat; many chapters show none. The headline is the HTML label overlay (not drawn on canvas), set in the **loading-screen font**: `IslandLoadingBrush` = `/stories/films/assets/Knewave-Regular.ttf` (see `components/IslandLoading.module.css`), cream `#fff2d3` with a navy misregistered echo, chunky, one line, sized like the loading screen's heading. Chapter `label` strings in story files therefore become one or two words (keep the full sentence labels for the transcript/Read panel via a separate `transcriptLabel` if needed). No captions, sentences, arrows-with-text, or lettering drawn into the artwork.

Words appear **only to highlight key points**: the one idea the viewer must keep from that chapter (the reset word, the force, the instruction). If a chapter has no single key word, it shows none. A headline is never a title, a summary or a caption of what is on screen.

### 4d. Micro-interactions for delight (user rule)

Small, bounded, joyful responses that never change narration, timing or teaching:

1. **Touch the print.** A tap/click (or pointer move on desktop) on the canvas produces a story-material reaction at that point for ≤ 0.8 s: chalk puff and a fresh chalk tick (Chalk Line), a plucked thread that twangs (Woven Court), a gust ripple across the kite string, a ripple ring on water, a dial click and a waveform blip, a lantern flare, a spray of leaves, a pigment blot that overprints with what it lands on, a strata crack. Each story defines its own `touch(sheet, x, y, age)` in its file using the story's inks; the engine routes pointer events (pointer capture, passive listeners, max 6 live touches, oldest recycled). While paused, a touch triggers one short bounded burst then the canvas sleeps again.
2. **Headline arrival.** The one-or-two-word headline pops in with a misregistration settle (pink/navy echo overshoots 3 px and snaps into register over 0.35 s) and leaves by drifting off-register. CSS only.
3. **Seam tick.** At every chapter seam a subtle haptic (`navigator.vibrate(8)` where supported, respects reduced motion) and a tiny paper "flip" grain change (new registration seed) so the new print feels physically placed.
4. **Playback bar feedback.** Chapter dots swell and print a tiny ink dot when hovered/pressed; the play button squashes on press; seek slider thumb leaves a short ink trail (CSS/SVG only, no canvas cost). Existing `playClick` sound on buttons.
5. **Secondary motion everywhere.** Confetti fragments, dust, spray and small loose marks react to the main action (they scatter when something is pushed, settle after) and to touches, with seeded, bounded lifetimes.
6. **End card.** On completion the last composition holds while the story's lead objects do one small celebratory settle (not confetti explosions), and the Replay button gets a printed-stamp appearance.

Constraints: no timers or loops while idle; touch bursts are the only thing that can wake the canvas while paused, and they self-terminate; total extra per-frame cost ≤ 1 ms; everything respects `prefers-reduced-motion` (touch reaction becomes a single static mark).

## 5. Engine contract (`lib/paths/riso/`) — implemented by the engine agent, used by every story

```ts
// sheet.ts
export type InkSet = Record<string,string>;                 // name → hex
export type SheetSpec = {paper:string; inks:InkSet; order:string[]; registration?:number /*px, default 1.8*/; alpha?:number /*.9*/};
export type Sheet = {
  W:number; H:number; cx:number; cy:number; unit:number;    // logical units (short side 1080) and px per unit
  safe:{x:number;y:number;w:number;h:number};               // art region in units (above tray on phones, left of tray in short landscape)
  // transforms — forwarded to every plate
  save():void; restore():void; translate(x:number,y:number):void; scale(sx:number,sy?:number):void; rotate(a:number):void;
  camera(x:number,y:number,zoom:number,rot?:number):void;   // world (x,y) → safe-region centre
  clip(path:Path2D):void;
  // marks (ink = key of inks; cov 0..1: 1 = solid, <1 = halftone tint in sheet space)
  fill(ink:string,path:Path2D,cov?:number):void;
  stroke(ink:string,path:Path2D,width:number,cov?:number):void;
  tone(ink:string,path:Path2D,density:number|((x:number,y:number)=>number)):void; // dot-size ramp
  knockout(path:Path2D):void;                               // paper on all plates (highlights, gaps)
  field(ink:string,cov?:number,mottle?:number):void;        // whole-sheet ink field with mottling (backgrounds)
  press(seed:number):void;                                  // paper + grain, plates multiplied with registration offsets; seed = chapter index
};
export function acquireSheet(ctx:CanvasRenderingContext2D,width:number,height:number,dpr:number,spec:SheetSpec,tray:{bottom:number;right:number}):Sheet; // plates cached per canvas/size
// shapes.ts — §3 library; every function signature (sheet, ink, ...geometry)
// motion.ts — twos, ease, key(t, keys), camKeys, anticipate, settle, wob(points, amp, seed), blob(seed), torn(seed)
// passage.ts
export type Passage = {aperture:Path2D /* in outgoing world space, convex */; from:(t:number)=>void; to:(t:number)=>void};
export function forwardPassage(sheet:Sheet,p:Passage,progress:number,tOut:number,tIn:number):void; // 0..1: accelerates into aperture, reveals `to` inside it at scale .68→1, both move forward; at 1 the frame equals `to` drawn normally
// story.ts
export type Cue = {at:number; words:string};
export type Chapter = {label:string; narration:string; seconds:number; audio?:string; start?:number; cues:Cue[]};
export type RisoFrame = {sheet:Sheet; time:number; chapter:number; chapterTime:number; progress:number; cue:number; cueTime:number; reducedMotion:boolean; width:number; height:number};
export type RisoStory = {id:string; format:'futsal'|'7v7'|'9v9'|'11v11'; title:string; theme:string; ageNote:string;
  spec:SheetSpec; audio:{mode:'chapters'}|{mode:'track'; src:string; duration:number};
  chapters:Chapter[]; draw:(f:RisoFrame)=>void};
// registry.ts
export function loadRisoStory(id:string):Promise<RisoStory>; // dynamic import per story file lib/paths/riso/stories/<id>.ts
```

Player: `components/StoryFilmPlayer.tsx` replaces `AnimatedPathFilm`, `GritFilm`, `RegulatingEmotionsFilm`, `LoveFutslFilm`, `MentalToughnessFilm`. It keeps `StoryPlaybackBar` unchanged (chapter dots for `chapters` mode, seek slider for `track` mode), the title header + `DoneButton`, the optional origin entry circle, the chapter label overlay restyled as riso lettering (navy ink with a 1.5 px pink misregistered echo). One canvas, one `Audio`, 24 fps cap, DPR ≤ 1.5, sleeps when paused / hidden / offscreen, full media cleanup on close (same guarantees as the current player, see `AnimatedPathFilm.tsx`).

## 6. Phone heat and performance budget

- ≤ 4 plate canvases + main canvas, allocated once per size. DPR ≤ 1.5. 24 fps cap, no work while paused/hidden.
- Halftone = cached pattern tiles per (ink, density level ∈ {.15,.3,.5,.7}) in sheet space via `pattern.setTransform`; never per-dot arcs per frame.
- Grain/mottling = cached tiles. `press()` is ≤ 6 `drawImage` calls.
- Per frame ≤ ~350 path operations; static heavy compositions may be cached into a layer per chapter (invalidate on resize/chapter).
- Measure: `data-draws` counter and a `scripts/riso-perf.mjs` frame-time sample at 390×850; report ms/frame in the story ledger. No thermal claims without a device.

## 7. Story file layout and ownership (one agent per file, never shared)

```
lib/paths/riso/sheet.ts shapes.ts motion.ts passage.ts story.ts registry.ts   ← engine agent only
lib/paths/riso/stories/<story-id>.ts                                          ← the story's builder only
docs/story-production/riso/storyboards/<story-id>.md                          ← storyboard, then ledger updates
scripts/review-riso-story.mjs  scripts/riso-perf.mjs                           ← engine agent
components/StoryFilmPlayer.tsx (+ .module.css), PathStoryModal.tsx, UpcomingStory.tsx ← engine agent
```

Story ids and groups: **Futsal** chalk-line (pilot), woven-court, kite-turned, futsl (Love Futsl, track 54.57 s, 22 cues). **7v7** place-picture, pocket-radio, signal-water, empathy. **9v9** different-tides, harbour-night, unfinished-map, grit (track 64.73 s, 33 cues; media time from `narration-cues.json`). **11v11** quiet-lantern, boat-weather, more-shirt, regulate (track 66.64 s, 19 cues). **Legacy 11v11** reset, loss.

## 8. Storyboard format (write before drawing)

Per chapter a table: `cue time + words | composition (what fills the frame) | cue action: cause → visible result | camera key | phone safe-region note`, then one line naming the **seam passage material** and what the next composition reveals inside it. Then: role colours, inks chosen, one-sentence football truth check per chapter.

## 9. Review gates (art director)

A story passes only when, on live app captures at 390×850, 320×568, 844×390 and 1440×850:
1. It reads as a riso print (visible screen, overprint colours, paper through, registration) and not as flat vector.
2. Muted playback still explains the narration; each cue has a visible consequence.
3. ≥ 4 actions and ≥ 3 camera moves per chapter; every seam is a forward passage that reveals a **different** composition.
4. Object identity, scale and colour roles persist across seams; no reverse zoom; no flat holds > 1.5 s.
5. Important forms stay inside `safe` above the tray at every viewport; nothing important hides behind the title.
6. Typecheck, build, `scripts/check-path-films-browser.mjs` (updated for the new player), zero page errors, plates sleep when paused.
7. Frame time at 390×850 ≤ 8 ms median on desktop Chrome (proxy for phone budget).
