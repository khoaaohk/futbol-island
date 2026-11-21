# Pop-up target game (working id `popup`): direction (Nov 21 2026)

Owner: "make the game have depth where targets can come out from many areas and the object is to flick a ball or multiple balls to
knock them out or down"; "these next two games need to have more dimension and not be so flat". It will replace Hold the Line later.
Until then it is unplaced: `/arcade?game=popup` only (`arcadeUnplaced`), board id `popup`, analytics key `arcade_popup`.

## What it is, and how it differs from Flick It
A FAST shooting gallery with a football. Targets pop out of windows, bins, hedges, boats, a bus, a tunnel, the stands; they hide again
after a moment. You flick ball after ball (a rack of five that refills) for 50 seconds. Flick It (the sibling) is calm: one careful
curled flick per stage, physics objects to topple, stars per level. Here nothing waits for you: the clock, the combo and the streak
are the game. No stages, no stars, no stacking physics.

## It teaches (AGENTS.md)
"Look up. Pick the target. Strike." Scanning before the ball arrives, quick decisions, the closest open target first, accuracy under
pressure, and not hitting the wrong thing (the coach and the referee pop up too). Each results card gives one tip tied to the run.

## Arenas (one three.js scene, data in `lib/arcade/popup/arenas.ts`; the rules and the view read the same boxes)
| id | place | camera | depth |
| --- | --- | --- | --- |
| plaza | Town plaza: shop windows, a bus, bins, planters | street level, eye height 1.7 m | near bins, mid bus, far windows on two floors |
| harbour | Harbour: crates, boats, ducks on the water, warehouse | high on the quay (4.6 m), looking down | near crates, mid boats, far warehouse doors |
| training | Training ground: mannequin wall, tyre stacks, shed, goal | very low (1 m), looking along the grass | near tyres, mid wall, far shed and goal |
| beach | Beach: huts, lifeguard tower, umbrellas, a boat | off to the left (x -3.4, 2.7 m), looking across | a diagonal row of huts: every hut is at a different depth |
| stands | Stadium stands: boards, tunnel, three tiers, scoreboard | low (1.3 m), looking UP | boards near and low, tiers far and high |
Daily Arena: the day picks the arena and the seed (same on every device), 60 seconds.

## Targets (cartoon, friendly; instanced)
Dummy 100 · Cut-out defender (quick peek) 150 · Armoured dummy with a bin lid (2 hits) 250 · Balloon (floats up and away) 120 ·
Runner on a rail (trolley, duck, boat) 200 · Gold mascot (rare, quick) 400 and gives **Triple** (the next 5 flicks send 3 balls) ·
Ball bag 50 and gives **Quick rack** (the rack refills at once for 7 s) · Coach / referee: do NOT hit (streak and combo lost).
Far targets x1.5, mid x1.2. Knock-downs: dummies flip back on their hinge, cut-outs spin away, balloons pop, runners tumble.

## Flick
Swipe anywhere: the direction (from the ball) is the aim, the speed is the power (how far up the screen the ball reaches and how fast
it flies), a bent swipe curls the ball. A generous aim help picks the open target nearest the swipe line. Balls fly true 3D arcs,
bounce off walls and the ground. Rapid flicks are the point: no wind-up, no wait.

## Scoring
Points x depth x combo (hits within 2.4 s; to x3). SNAP +50 for a hit in the first 0.7 s a target is up. Streak (hits without a wasted
flick): 8 = on fire, +50%. Two or more knock-downs inside 0.35 s = a multi-knock bonus and slow motion. End: accuracy bonus and a
Fair Play bonus for never hitting the coach or referee. One all-time top-20 board (`popup`); no daily board.

## Fairness (pinned in tests/popup-core.cjs)
Never more than 5 targets out (2 at the start). The first targets stay up 3.2 s (a 7-year-old needs about 2.5 s to see, choose and
flick); the stay shortens to 1.5 s by the end. No coach, referee or peeker in the first 10 s. One friendly figure at a time.

## Look (Breakaway comic house style: lib/arcade/comic)
Banded light, violet halftone shadows, ink hulls baked into the geometry, cream paper UI. Each arena has its own sky and ground colours:
plaza warm afternoon (#f6a968 sky, #d9c7a3 paving), harbour morning teal (#8fd4ee, water #1f8f96), training fresh green (#4fb85c),
beach bright noon (sand #f2d28a, sea #2b9fd0), stands floodlit dusk (#3a2f6a sky, #2f8f5a pitch). Sun #ffc83a, red #f0452e,
teal #19b5a5, ink #231a2e. Depth cues: big near props that cut the frame, haze fog toward the back, targets drawn larger than life.

## Camera, motion, sound
Camera fixed per arena with a small nudge toward each hit, hit-stop on big hits (60-110 ms), slow motion (0.35x, 0.7 s) on a
multi-knock, confetti pieces and ink stars, score words in comic bursts that fly to the score. Sound: a boot thump per flick (pitch by
power), wooden clack for dummies, cardboard slap, tin clang for armour, balloon pop, a slide whistle for pop-ups, a referee whistle
for the wrong target, a marimba that climbs with the combo. All WebAudio one-shots, one limiter.

## Heat
One scene, one renderer; static scenery merged into ONE geometry per arena; one InstancedMesh per target kind, one for balls, blob
shadows, pieces and stars; no shadow maps, no post-processing; one directional light + hemisphere; pixel ratio 1.5 on phones;
30 fps on phones; the loop sleeps on menu, pause, results and a hidden tab; pools only, no per-frame allocation.
