# Player moves: a catalogue for "complete footballers" (Sep 25 2026)

User brief: "Research more futbol movements for the player, like the body feint, that can be added to make the players feel more like complete players. Look into other body movements and fine-tune each." Also add the **rainbow flick**.

This catalogue lists moves by priority for kids learning the game, per AGENTS.md: every move has to teach something. The implemented ones live in `lib/graphics/skillMoves.ts`, driven by `PlayerMotion.skill = {type, progress, side}`. The API, hooks and status are at the end and in `docs/bean-characters/CONTRACT.md` under "Skill moves lane".

Lane B already owns these, so they are **not** repeated here: bicycle kick, airborne scissor kick, diving header, volleys, back heel, the futsal sole roll and flick-up, keeper save types, the keeper dive, the jumping header and the slide.

## Conventions

- `side` (`s`) is the **active foot** (−1 = the rig's `left-*` leg, +1 = `right-*`). `o = −s` is the other foot.
- Rig frame: +z forward, +x is the side of the `side = +1` leg, y up, in metres. The ball radius is 0.19 (the island ball).
- Phases use the four-beat animation model: **anticipation → action → follow-through → recovery**. Progress runs from 0 to 1. The numbers below are the milestones used in code (`SKILL_MOVES[type].phases`).
- "Priority" measures how much the move teaches a young player: **P1** is core, taught at U7–U10; **P2** is taught at U10–U13; **P3** is flair or advanced.

## Sources used

These are coaching references, not motion capture. The shapes are authored to match what a coach demonstrates.

- **England Football Learning / The FA** (the "Four Corner Model"; 1v1 attacking: "change of direction, change of pace"; 1v1 defending: "jockey, get side-on, show them one way, stay on your feet").
- **Coerver Coaching** pyramid (ball mastery → receiving and passing → **moves 1v1** → speed → finishing → group play). It is the classic source for the stepover, scissors, Matthews feint, Cruyff turn, drag-back and La Croqueta as named, repeatable "moves".
- **US Youth Soccer** and the **US Soccer Grassroots** licence (the play–practice–play model; age-appropriate skills: the dribbling feints and turns listed here are the U8–U12 core).
- **UEFA C/B licence** manuals: body shape when receiving ("open body, back foot receive"), and scanning ("check your shoulder before the ball arrives").
- **Geir Jordet** (Norwegian School of Sport Sciences) on visual exploration (scanning). Elite midfielders make roughly 0.5–0.6 head turns per second in the 10 s before receiving, and players who scan more complete more forward passes.
- **IFAB Laws of the Game, Law 12**: a *fair charge* is shoulder to shoulder, with the ball within playing distance and arms kept in, and it must not be careless, reckless or with excessive force.
- **Historic, verified moves** (real history, for the teaching cards):
  - **Sir Stanley Matthews**: the "Matthews feint", a drop of the shoulder followed by the outside-of-the-foot burst.
  - **Johan Cruyff**: the Cruyff turn, v Sweden (Jan Olsson), 1974 World Cup.
  - **Ferenc Puskás**: the drag-back that beat Billy Wright, England 3–6 Hungary, Wembley 1953.
  - **Rivelino**: the elastico ("flip-flap"), which he credited to Sérgio Echigo; later made famous again by Ronaldinho.
  - **Michael Laudrup and Andrés Iniesta**: La Croqueta.
  - **Zinedine Zidane and Diego Maradona**: the roulette, or Marseille turn.
  - **Ronaldo Nazário and Cristiano Ronaldo**: the stepover ("pedalada").
  - **The rainbow flick**: called the *lambreta* in Brazil, and done in top matches by players such as Jay-Jay Okocha and Neymar.

## A. Dribbling feints and turns

| Move | Priority | Phases (anticipation · action · follow-through · recovery) | Key joint targets | In-game trigger | Teaching line |
|---|---|---|---|---|---|
| **Body feint / shoulder drop** (Matthews) `bodyFeint` | P1 | 0–.16 settle, eyes up · .16–.46 dip the shoulder and a fake step with `s` toward `s` (weight really goes there) · .46–.66 push off `s`; the outside of the `o` boot takes the ball toward `o` (contact .56) · .66–1 accelerate away | torso roll 16° toward `s`, pelvis drop 6 cm, head follows the dip; `s` boot steps out 0.34 m; `o` boot at the ball; exit heading +0.55 rad toward `o` | a dribbler meets a defender square on, ~1.5–3 m away | "Sell it with your body: make the defender lean, then go the other way." |
| **Stepover** (pedalada) `stepover` | P1 | 0–.14 weight onto `o` · .14–.44 the `s` boot circles over the top of the ball from inside to outside and lands beside it; body dips toward `s` · .44–.64 push off `s`; the outside of the `o` boot takes the ball toward `o` (contact .58) · .64–1 burst | `s` sole passes ≥ 5 cm over the ball; lands at x = s·0.36; torso roll/yaw toward `s`; exit heading toward `o` | 1v1 at walking/jogging pace, defender in front | "Your foot goes round the ball, not on it." |
| **Scissors** `scissors` | P2 | 0–.14 · .14–.44 the `s` boot swings round the **front** of the ball the other way (outside → inside) and lands across it; the body leans across · .44–.62 the weight goes back onto `o` and the **same** `s` boot takes the ball out with its outside (contact .6) · .62–1 burst toward `s` | the legs cross in front of the ball; torso roll/yaw toward `o`, then toward `s`; exit heading +0.5 rad toward `s` | same as stepover; a defender who has already bought one stepover | "Swing round the front and across, then take it out the other way." Coaching sources name the two circles differently; ours is defined by direction (stepover goes over the top inside → out and exits with the other foot; scissors goes round the front outside → in and exits with the same foot). |
| **Cruyff turn** `cruyffTurn` | P1 | 0–.2 shape to pass or cross (arms out, the `s` leg winds back) · .2–.48 instead of kicking, the inside of the `s` boot drags the ball back behind the standing leg (contact .36) · .48–.72 pivot 180° on the standing foot toward `o` · .72–1 drive away | `s` leg back-swing (foot z −0.28, lift 0.2), then foot to ball, then behind the standing heel (x = −s·0.2, z −0.2); heading −s·π | winger pressed from in front / defender blocking a cross | "Fake the kick, hide the ball behind your standing leg, turn away." |
| **Drag-back / pull-back** (Puskás) `dragBack` | P1 | 0–.14 · .14–.34 the `s` sole on top of the ball (sole contacts .26 and .46) · .34–.6 roll it back under the body while stepping back · .6–1 turn and go (heading −2.9 rad toward `o`) | sole at ball top + 5 cm, toe up; pelvis goes back 0.3 m; hops back on `o` | a defender lunges in; the carrier needs to change direction or protect | "Sole on top, pull it back, the defender's tackle hits nothing." |
| **La Croqueta** `croqueta` | P2 | 0–.2 · .2–.5 the inside of the `s` boot pushes the ball across to `o` (contact .3) · .5–.7 the inside of the `o` boot collects it (contact .56) · .7–1 away on the new line | quick one-two between the feet; travel x = o·0.45; low hips | tight space, two defenders closing | "Fast feet: the ball goes from one foot to the other, past the tackle." |
| **Elastico** (flip-flap) `elastico` | P3 | 0–.14 · .14–.4 the outside of the `s` boot pushes the ball toward `s` (contact .28) · .4–.62 the ankle whips round and the inside of the same boot snaps it back toward `o` (contact .5) · .62–1 | one boot, two touches; big torso lean toward `s`, then `o` | flair; not in live matches for young ages | "Out, then in, with the same foot. Needs soft ankles." |
| **Roulette** (Marseille turn) `roulette` | P3 | 0–.12 · .12–.36 the `s` sole drags the ball back while spinning (back to the defender) · .36–.62 plant `s`; the `o` sole drags it on round the spin · .62–1 exit (heading +s·2π; full spin, travel toward `s`) | two sole contacts (.26, .52); arms out wide; body turns a full circle | a defender comes in from the side; shielding while turning | "Keep your body between the ball and the defender while you spin." |
| **Rainbow flick** (lambreta) `rainbowFlick` | P3 | 0–.1 the `s` boot steps ahead, the ball sits behind its heel · .1–.42 the `o` toes get behind the ball (toe contact .14) and roll it up the back of the `s` calf (toe-lift contact .36, ball at 0.4 m) · .42–.56 the `o` boot lands and takes the weight; the `s` heel flicks up behind (flick contact .43): the ball pops up the back, clear of the round body, and drops forward over the head (apex ~2.4 m) · .56–1 the chest comes up to watch it, the ball lands ~0.45 m in front (.96) and he steps on to it | `o` toe from the grass to 0.28 m ankle height; the `s` knee folds and the heel rises to 0.54 m behind; torso pitch +20° at the flick, −9° while watching the ball; 2.4 s, the slowest move, so a child can follow it | flair; the ball at the feet, running straight at a defender who is standing still | "A trick for fun and for a lot of practice; in a match it only works when the defender is flat-footed." |

## B. Shielding and receiving

| Move | Priority | Phases | Key joint targets | Trigger | Teaching line |
|---|---|---|---|---|---|
| **Shield (hold-up)** `shield` | P1 | in .0–.2 · hold .2–.8 (the host may freeze progress at .5) · out .8–1 | low hips (−9 cm), wide base (feet 0.5 m apart), back/side to the defender (torso yaw s·0.5), arm out on the defender side (shoulder abduction 1.1 rad, elbow bent), the far boot on the ball | carrier under pressure from behind; a striker holding the ball up | "Get low, make yourself big, arm out (don't push), the ball on the far foot." |
| **Open body receive** | P1 | *(existing `receive` pose; see fine-tunes)* | open the hips to the pitch, receive on the back foot | every forward receive | "Open up so you can see the whole pitch." |
| **Check-away run** | P2 | *(a movement pattern for the combinations agent: two steps away, plant, sprint back to show)* | uses the rig's plant + brake | a receiver being marked | "Go away to come back: make space to receive." |
| **First touch into space** | P1 | *(existing receive + dribble; host moves the ball out of the feet)* | — | every receive with space ahead | "Your first touch sets up your next action." |

## C. Off-ball movement

| Move | Priority | Phases | Key joint targets | Trigger | Teaching line |
|---|---|---|---|---|---|
| **Scan / shoulder check** `scan` | P1 | .0–.12 · look over the `s` shoulder .12–.38 · back to the ball .38–.5 · look over the `o` shoulder .5–.76 · back .76–1 | head yaw ±1.05 rad (past the existing `scanYaw` clamp), a 0.3 rad chest turn to go with it, a slight lift of the chin | ~1 s before a pass arrives; the midfielder when the ball is far away | "Look before you get it: know where your teammates and the space are." |
| Pointing / calling | P1 | *(existing `called` pose)* | — | receiver asks for the ball | — |
| **Jockey / defensive stance** | P1 | *(existing `jockey`, `ready`, `backpedal`)*; a new one-shot **jockey feint lunge** was not added: it teaches "diving in", which the FA tells kids not to do | — | — | "Stay on your feet, side-on, show them one way." |
| Press sprint + decelerate | P1 | *(existing brake/plant; see fine-tunes: deceleration lean)* | — | pressing trigger | "Sprint to close, slow down to stop them." |
| Recovery run / blindside run | P2 | *(sprint gait + head checks: use `scan` while running)* | — | lost possession / run behind the full-back | — |

## D. Passing and shooting variety

The strike itself belongs to `lib/graphics/strikeMotion.ts` (pass/shot/loft), which is not this lane's file. The notes are for its owner and for the combinations agent.

| Variety | Priority | What changes on the body | Notes |
|---|---|---|---|
| Driven pass (laces, low) | P1 | knee over the ball, ankle locked, toe down, short follow-through | `shot` with low power reads close |
| Lofted pass / cross | P1 | plant foot slightly behind and beside the ball, lean back, strike under the ball, long follow-through | existing `loft` |
| Chip | P2 | stab under the ball, almost no follow-through, lean back | future `strikeMotion` kind |
| Outside of the foot (trivela) | P3 | toe pointed in, ankle turned, strike with the outside; body leans over | future |
| Toe-poke | P2 | quick jab, no back-lift (futsal finishing) | future |
| Finesse curl | P2 | open the hips, wrap the inside of the foot round the ball, the body leans away, the arm opposite the kicking foot goes up | future |
| Laces power shot | P1 | body over the ball, land on the kicking foot | existing `shot` + `powerKick` |

## E. Contact

| Move | Priority | Phases | Key joint targets | Trigger | Teaching line |
|---|---|---|---|---|---|
| **Shoulder-to-shoulder challenge** (fair charge) `shoulderCharge` | P2 | .0–.25 lower the hips and lean the `s` shoulder into the opponent (arm kept in, tucked against the side) · .25–.45 contact at .35 (both feet on the ground) · .45–.7 push through on the far foot · .7–1 upright | torso roll 18° toward `s`, torso yaw s·0.25, `s` arm tucked (shoulder abduction ≤ 0.2, elbow −1.4), wide stance, head up | two players racing side by side for a loose ball | "Shoulder to shoulder, arms in, ball close: that is a fair challenge (Law 12)." |
| Stumble that recovers | P1 | *(existing `stumble` reaction; see fine-tunes: add the catch step)* | — | heavy touch or a fair charge | "Stay on your feet." |

## Fine-tuning the current motions

I measured these with a headless probe of the classic joints (`scratchpad/skills/probe-base.cjs`) and checked them on burst strips.

| # | Motion | Issue observed | Evidence | Fix |
|---|---|---|---|---|
| 1 | **Run: arm counter-swing** | The arms swung **with** the same-side leg (a "pacing" gait): when the left foot reached forward, the left hand came forward too. The chest coil was already correct, so the arms fought the chest. | corr(left hand z, left ankle z) = +0.92 at 5–7 m/s, and −0.88 with the right ankle | Arm phase shifted by half a cycle, so each arm swings with the **opposite** leg and with the chest coil (all arm-phase terms in the walking arm block). |
| 2 | **Pass/shot plant foot** | The support boot stayed where it happened to be when the kick started, so at contact it stood 0.5–0.75 m **behind** the ball (a lunge). Coaches teach the plant foot **beside** the ball, pointing at the target. | support ankle z −0.19 vs ball +0.65 at contact (moving approach); 0 vs 0.6 standing | At the start of the kick the support boot takes a short plant step to beside the ball (see the contract note on how large the change is). |
| 3 | **Coming to rest from a walk** | When a slow walk (0.3–1.2 m/s) stops, a planted boot loses its gait lock and snaps to its rest spot in one frame. This is visible on the island's walking character and on every NPC. | worst one-frame boot jump 0.11–0.21 m (probe `creep.cjs`) | A planted boot that loses its lock at rest steps to its spot (a 0.16 s arc). |
| 3b | Deceleration lean | A hard stop sits the chest back to −9° and dwells ~0.4 s. | probe "stop" table | No change: this is body-mechanics' tuned dwell, which its tests lock. |
| 4 | **Head stability** | Already good: head bob 1.2–1.8 cm and pitch SD 1.0–1.6° across speeds. | probe | No change. |
| 5 | **Turn: head/hip lead** | Already reads well: in a 90° cut the head leads the chest by 10–15°, the chest leads the pelvis, and the bank is 20–30°. | probe "turn" table | No change. |
| 6 | **Idle** | Breathing 2.8 mm and a slow head wander of 0.8°; the arms hang stiffly (elbow −0.3). | probe | No change (the heat budget: no new idle work). |

Fixes 1–3 intentionally change classic output that lane B's parity fixture locks. See the contract for the fixture update and why.

### Fine-tunes as implemented (Sep 26 2026)

| # | Fix | Where (`lib/graphics/player.ts`) | Before → after |
|---|---|---|---|
| 1 | **Arm counter-swing.** The arm phase is `(1-index)·π` (was `index·π`) in the shoulder bob, swing, abduction wobble, elbow and forearm/wrist follow. The shoulder yaw stays coil-driven as before (`player-teaching-expression` locks its excursion). The swing amplitude is `.34+.4·sprint` (was `.42+.5·sprint`), because the chest coil now adds to the swing instead of cancelling it. | walking arm block + arm detail loop | corr(left hand, right ankle) −0.88 → **+0.87** at 5–7 m/s; hand travel 0.60 → 0.91 m at a sprint (the coil now helps) |
| 2 | **Plant step.** At the start of every kick the support boot steps (0.1 s) to ~0.3 m beside the ball and 0.4 m behind its centre (0.46 for a loft), and the hips move up to 0.12 m forward over it. The toe ends level with the back of the ball; stepping further made the release after the shot skid past `motion-study`'s recovery budget. | `kickHold` block + pelvis z | support ankle at contact: 0.6–0.75 m behind the ball → 0.25 m behind the ball centre, beside it |
| 3 | **Coming to rest.** When a slow walk stops, a boot that loses its gait lock now steps to its rest spot (0.16 s arc) instead of snapping there in one frame. Boots already at their spot stay put, so there are no idle bumps. | after the lift-off block in the leg loop | worst one-frame boot jump when stopping from 0.3–1.2 m/s: 0.11–0.21 m → **0.010–0.026 m** |

Considered and left alone: the deceleration sit-back dwell (a tuned body-mechanics look that `player-body-mechanics` locks), head stability, turn lead and idle (see the table above).

## Implemented (Sep 26 2026)

Twelve moves are in `lib/graphics/skillMoves.ts`: bodyFeint, stepover, scissors, cruyffTurn, dragBack, croqueta, elastico, roulette, **rainbowFlick**, shield, shoulderCharge and scan. Each has a teaching line, verified history where there is one, a trigger context and a priority (`SKILL_MOVES[type]`). Not implemented: the check-away run and first touch into space (these are movement patterns for the combinations agent), the passing and shooting variety (that belongs to `strikeMotion.ts`), and a jockey lunge (it would teach diving in).

**API** (for the combinations agent and lane B's choreo):

```ts
motion.skill = {type: SkillMove, progress: 0..1, side: -1|1};  // side = the active foot
applySkill(motion, type, progress, side, start:{x,z,yaw}, root:{x,z}, ball?:{x,y,z}, scale?) // sets skill, facing, turnSmoothing; writes root + ball
skillFrame(type, p, side) → {x, z, heading}   // root travel + facing offset in the start frame
skillBall(type, p, side)  → {x, y, z} | false  // ball centre in the start frame
skillToWorld(start, local, scale, out)
SKILL_MOVES[type] → {label, seconds, phases, contacts[{p, leg, surface}], priority, teach, history?, trigger, ball, holdWindow?}
```

The host owns the root and the ball. Clear `motion.skill` when `applySkill` returns false: the pose fades out over ~0.15 s. `shield` may be held by freezing progress inside `holdWindow` (0.2–0.8). `scan` has no leg targets, so it overlays any gait (tested while jogging). Bean faces live on the torso, so every "look" is carried by chest yaw/pitch (head yaw alone does not show in bean style).

**Demo:** `http://localhost:8092/skill-lab?skill=feint` (aliases: feint, stepover, scissors, cruyff, dragback, croqueta, elastico, roulette, rainbow, shield, charge, scan; `&side=-1` for the left foot; `&view=side|q|front|back|top`; `?base=run|turn|stop|pass|shot|idle` for the base motions). It is a dev page (noindex, not linked from the island). It renders only while playing, stops after three loops and pauses when hidden. `window.__fiSkill.shot(type, p, side, view)` poses one frame for strips.

## F. Batch 2: turns, finishing, defending, goalkeeping and celebrations (Sep 26 2026)

User brief: "Add more moves to this preview and then also add it to the plays, live game and quizzes. Research other moves that we can add."

### How the candidates were ranked

Each candidate was scored on three things, in this order:
1. **Teaching value for kids**: is it in the FA / US Youth Soccer / Coerver core for U8–U12, and does it teach a decision, not only a trick?
2. **Visual clarity on the bean characters**: does the idea read from a match camera on a round body with short limbs? A move that lives in the ankle (heel-to-heel flick, sombrero) does not.
3. **A live-game context**: does the match sim produce the situation, so the move can appear in the right place?

| Candidate | Verdict | Why |
|---|---|---|
| Inside cut (inside hook) | **Added** P1 | Coerver/FA core "change of direction"; the whole-body turn reads well. |
| Outside cut (outside hook) | **Added** P1 | Its pair: "keep your body between the defender and the ball". |
| Fake shot (shot fake, then cut inside) | **Added** P1 | Teaches selling a strike; very readable (full back-swing, foot stops over the ball). |
| Nutmeg | **Added** P2 | Teaches reading the defender's feet; the ball through the legs is instantly readable. |
| Ronaldo chop | Not added | Reads as a Cruyff turn at pace on the round body; the Cruyff turn and the inside cut already teach it. |
| Matthews feint, roulette / Maradona turn, elastico / flip-flap (Rivelino), Cruyff variations, Puskás drag-back | Already in batch 1 | `bodyFeint`, `roulette`, `elastico`, `cruyffTurn`, `dragBack`. |
| Heel-to-heel flick, sombrero, "the V" (roll + stepover) | Not added | Ankle-level tricks that don't read on the bean; the rainbow flick already covers flair. |
| Chip shot | **Added** P2 | A real decision ("the keeper is off his line"), and a big, readable arc. |
| Curled (finesse) shot | **Added** P2 | "Aim outside the post and let it bend back in"; the bend is visible. |
| Trivela (outside of the foot) | **Added** P3 | The swerve the other way; the body shape (toes in, strike with the outside) is distinctive. |
| Toe poke | **Added** P2 | The futsal finish: "no back-lift, quick beats pretty". |
| Knuckleball | **Added** P3 | Stab with the laces, no follow-through; the flight wobbles. For long shots. |
| Driven low shot, lob pass, first-time pass, chest-to-volley, thigh control, cushioned header | Already covered | The rig's `shot`/`loft` strikes, lane B's volley, and the chest/thigh/header reactions. |
| Panenka penalty | Not added | The same pose as the chip; there are no penalties in the live sim. |
| Block tackle (standing tackle) | **Added** P1 | FA: "stay on your feet"; weight through the ball. |
| Poke tackle | **Added** P1 | The patient defender's tackle: "poke it away when it leaves the dribbler's foot". |
| Jockey / backpedal, block with sidestep, interception stretch | Already covered | Body-mechanics `jockey`, `backpedal`, `ready`, and the `deflect`/`slide` reactions. |
| Keeper overarm throw | **Added** P1 | FA goalkeeper distribution; very readable. |
| Keeper roll-out | **Added** P1 | The safest distribution to a close defender; the sim's own "quick roll-out". |
| Keeper punt | **Added** P2 | Long clearance. US Youth Soccer bans punts and drop-kicks in 7v7, so it is 9v9 and 11v11 only. |
| Smother, high catch, dives, tips | Already in lane B | `dive` kinds and outcomes. |
| Goal kick | Not added | A normal lofted strike (the rig's `loft`). |
| Celebrations: airplane, knee slide, thank the passer | **Added** (3) | Wholesome variety for the preview and the scorer. "Thank the passer" teaches that every goal is a team goal. |

Sources: as in the batch 1 list above (The FA / England Football Learning, Coerver Coaching, US Youth Soccer and US Soccer Grassroots, UEFA C/B). Also the IFAB Laws of the Game: futsal Law 16 (a goal clearance is thrown by the goalkeeper). Also the US Youth Soccer small-sided rules (7v7, under-10s: no punts or drop-kicks). Verified history is only on moves where it is well documented: Ronaldinho's toe poke against Chelsea (2005 Champions League); Juninho Pernambucano's knuckleball free kicks; the trivela of Ricardo Quaresma and Luka Modrić.

### The moves (all in `lib/graphics/skillMoves.ts`, same API as batch 1)

Phases are anticipation · action · follow-through · recovery (progress 0–1). `side` is the active foot (for throws, the throwing hand's side).

| Move | Group | P | Seconds | Phases and contact | Key joints | Ball |
|---|---|---|---|---|---|---|
| `insideCut` | dribble | 1 | 1.0 | plant `o` beside the ball (.08–.21) · the `s` boot reaches round and hooks it with the inside (.42) · lands, leans into the new line · away (heading −1.2·s) | torso roll toward `o`, pelvis drop 10 cm | across the body, ~70° |
| `outsideCut` | dribble | 1 | 1.0 | weight on `o` · the `s` boot crosses in front and pushes with the outside (.40) · lands, bursts (heading +1.05·s) | torso roll toward `s` | away with the outside |
| `fakeShot` | dribble | 1 | 1.35 | plant (.06–.14) · full back-swing (.3, ankle 0.4 m back and 0.36 m up) · the swing stops over the ball and lands in front of it (.47, no touch) · the inside cuts it back across (.56) · away (heading −1.45·s) | arms out in the shooting shape, chest over the ball | still until the cut |
| `nutmeg` | dribble | 2 | 1.6 | a dip (.1) · side-foot slot straight on (.34) · runs round the defender (lateral 0.88 m) and collects it (1.0) | toe up, foot turned out | 2.3 m straight on, through the legs |
| `chipShot` | shoot | 2 | 2.0 | plant · short back-swing · toe stabs under the ball (.30) · leans back, watches it | torso pitch −0.18 after contact | gravity arc, apex ~2.1 m, lands ~8 m out |
| `finesseShot` (curled shot) | shoot | 2 | 1.9 | plant wide and behind (hips open) · swing in from outside, inside of the boot wraps the ball (.32) · the arm opposite the kicking foot up | pelvis yaw opens then closes | bows toward `s`, curls back across |
| `trivela` | shoot | 3 | 1.9 | plant wide · swing across inside → outside, toes turned in, outside of the boot (.32) · lean over the ball | torso roll toward `o` | bows toward `o`, swerves to `s` |
| `toePoke` | shoot | 2 | 0.9 | no plant, no back-lift (the boot never goes behind the hips) · knee lift and jab with the toe (.30) | quick | low and hard (apex < 0.5 m) |
| `knuckleball` | shoot | 3 | 1.9 | plant close · back-swing · laces through the middle, ankle locked, toes down (.32) · the leg stops short (a stab) | boot stays below 0.4 m after contact | one gravity arc whose line darts side to side |
| `blockTackle` | defend | 1 | 1.3 | step in and plant · get low (pelvis −13 cm) · inside of the boot blocks the rolling ball (.36), weight through it · recover | torso pitch +0.3, toes up | arrives at ~4 m/s, stops dead |
| `pokeTackle` | defend | 1 | 1.2 | low patient stance · the front boot lunges and pokes with the toe (.34) · recover the balance | standing boot planted | poked away sideways |
| `keeperThrow` | keeper | 1 | 1.6 | ball at the chest (from the keeper's own hold) · side-on, the far arm points at the target, the ball goes back behind the head (.32–.44) · the arm whips over the top and releases high (.50) · the back leg follows through | torso yaw +0.55 → −0.35 | on the hand (authored from the solved rig), then a ~10 m flight |
| `keeperRoll` | keeper | 1 | 1.5 | long step toward the target · bend low (pelvis −30 cm, chest pitch 0.62) · the arm swings back then forward like a bowler · lets go by the front foot (.46) | | on the hand, then along the grass without bouncing |
| `keeperPunt` | keeper | 2 | 1.6 | ball held out in front · step · drop it (.30) · laces meet it at knee height before the bounce (.42) · big follow-through | lift 0.92 m | in both hands, falls, kicked up and away |
| `airplane` | celebrate | 3 | 2.6 | arms out level, banking round a small circle | torso roll −0.3 | — |
| `kneeSlide` | celebrate | 3 | 2.6 | quick steps · drop onto both knees and slide 0.4 m with the arms up · get up | pelvis −0.46, shins on the grass | — |
| `thankPasser` | celebrate | 1 | 2.2 | turn toward the passer · point with both arms · two claps | | — |

A hand-carried ball has no boot contact to pin, so the keeper paths are authored from the solved rig's hands (`scratchpad/moves2/fit.cjs`, the ball at the end of the forearm), and the tests check it stays within 0.3 m of a hand until the release. The skill driver now fades a move in over ~0.08 s when it is joined part-way (a live tackle), so it never pops.

### Where each move appears

| Move | Preview (Make it yours) | Live game (`lib/town/match/combos.ts`) | Plays (lessons) | Quiz replays |
|---|---|---|---|---|
| Inside / outside cut | Dribbles; inside cut in the Skills showcase | 1v1 beat-man (sim) | 7v7 `next7_dribbleroom` S4 ("changes direction and carries inside") | — |
| Fake shot | Dribbles; in the showcase | 1v1 beat-man in shooting range, defender in the way (sim) | — | — |
| Nutmeg | Dribbles | 1v1 beat-man against a close, square defender (sim) | — | — |
| Chip, curl, trivela, toe poke, knuckleball | Shooting | the shot's style from its context (view): keeper off his line → chip (loops over him on goals); angle → trivela / curl; long and central → knuckleball (darts); crowded and close → toe poke | — | — |
| Block / poke tackle | Defending | every standing tackle (view): front-on → block, from the side → poke | 7v7 `gap7_lostball` S1 ("Blue cuts out the pass": block) | — |
| Keeper throw / roll / punt | Goalkeeping | every keeper distribution (view): short → roll, long → throw, loft/clear → punt (9v9, 11v11) | 9v9 `next9_shortcornerbudget` S11, futsal `bld_f_splitcb` S2 (roll-outs) | futsal `bld_f_splitcb` Q1 |
| Celebrations | Celebrations | the scorer (view): assisted → thank the passer, else airplane or knee slide | — | — |
| Cruyff turn, drag-back, shield (batch 1) | — | — | 7v7 `learn7_receive` S3, 11v11 `trn_11_recover` S6 (Cruyff); futsal `f_pivot` S3 (drag-back); futsal `bld_f_passtofeet` S7 (shield, then the pass) | 7v7 `learn7_receive` Q1, futsal `f_pivot` Q1, futsal `bld_f_passtofeet` Q2 |

"View" picks are render-only: the sim and its random stream are untouched, so they cannot change balance. The beat-man versions are picked from the combos' existing roll, so no extra random number is drawn. They only change which pose, and so the pose's lead time. Balance for that change is in the contract.

### Futsal: the creative game (Sep 26 2026)

User brief: "update the futsal live games to incorporate these new moves. It's supposed to be a creative game and we should apply these new moves here."

Futsal matches use the whole library, behind `comboSettings.futsalCreative` (on by default; off gives the batch-2 game, for before/after reports). Grass formats are byte-identical either way (tested).

- **Take-ons (sim, `startTakeOn`).** A close defender (3.5–11 u, not behind) at a decision beat, 30% of the time. The carrier keeps the ball with a skill, standing over it until the touch and then going the way the move exits, away from the defender:
  - against a square defender: stepover, croqueta, elastico, scissors or body feint;
  - in shooting range, the feint becomes a fake shot;
  - against a defender at his side: roulette, pull-back (drag-back) or Cruyff turn.
  - Nothing is decided by the move: after the touch the sim's own duel can still tackle him, exactly as after the sole roll.
- **1v1 beat-man (sim).** When the sim's duel lets a dribbler knock it past his man, the pose is picked from drag-back, croqueta, stepover (a nutmeg on a close, square defender), inside/outside cut, elastico, roulette, Cruyff turn and feint (a fake shot in range). The pose now exits to the side the sim knocks the ball.
- **Flick and volley (sim).** A flick-up won within ~13 m of goal is volleyed before it bounces (lane B's volley, via the acrobatic finish). It is rare.
- **The rainbow flick** stays a rare showpiece against a flat-footed defender (45% of those flicks, about 0.2 a game).
- **Finishing (view).** Toe poke close in with a defender near (the classic futsal finish), chip over an advanced keeper, knuckleball from distance, trivela or a curl to the far post from an angle.
- **Pivô (view).** After holding it up with the shield, the lay-off to a runner behind him is a back heel (lane B).
- **Keepers (view).** Futsal keepers roll it out or throw it overarm (futsal Law 16: goal clearances are thrown), never punt.
- **Celebrations** as for every format.
- **Teaching feed.** Every take-on and shot style has a line (why a toe poke, why the sole under pressure, why the curl). Lines are spaced: take-on lines at most one per team every 7 s, shot lines at most one every 6 s.

## G. Freestyle tricks for the island's freestylers (Oct 4 2026)

User brief: "Add more moves for the characters … in the main square area next to the Konbini they do tricks. Have them do more types of tricks, like sitting on the ground juggling, and more different types of tricks."

**Where:**
- The four freestylers on the pocket futsal court beside the Konbini: Teo, Zuri, Kei and Iza.
- Lua and Tavi on Coral Cay.
- Ollie on the East Pier.

Each freestyler plays a seeded routine of about 2.5–3 minutes made of named tricks, idle "scanning" beats (shoulder checks) and, on the court, **pair tricks**. The pairs are Teo with Kei and Zuri with Iza, who stand about 5 m apart. Every trick ends where the next one starts, so the routine loops with no visible repeat.

**Sources:**
- WFFA (World Freestyle Football Association) judging criteria: "All-Round" covers Uppers, Lowers, Sitdowns, Transitions, Acrobatics and Ground Moves.
- Wikipedia, "Freestyle football": the five styles, plus around the world, crossover, hop the world and neck stall.
- Red Bull, "Freestyle football tricks for beginners": the neck stall, and "sit downs" as tricks done sitting or lying down.
- The FA, England DNA Foundation Phase ("love the ball"): ball mastery means toe taps, sole rolls, inside–outside touches and juggling.

| Trick (id) | Group | Football purpose (shown in the lab and in the "What tricks are you practising?" topic) |
|---|---|---|
| Keep-ups (`keepUps`) | lower | Soft touches with a firm ankle: the base of every good first touch. |
| Toe stall (`toeStall`) | lower | Stop the ball dead on your foot: the perfect first touch. |
| Instep catch (`instepCatch`) | lower | Give with the foot to cushion a dropping ball. |
| Around the world (`aroundWorld`) | lower | Fast feet that circle the ball and come back underneath: footwork for close control. |
| Inside around the world (`aroundWorldIn`) | lower | Circling the other way trains balance and footwork on both sides of the ball. |
| Crossover (`crossover`) | lower | The other leg goes around the ball: balance and coordination on one foot. |
| Heel flick-up (`heelFlick`) | lower | Lift a ball off the ground without your hands, even from behind you. |
| Thigh juggles (`kneeJuggles`) | lower | Cushion a bouncing pass with the flat top of the thigh. |
| Thigh–foot combo (`thighFoot`) | lower | Choose the surface that fits the ball's height. |
| Head juggles (`headJuggles`) | upper | Meet the ball with your forehead, eyes open and knees soft. |
| Head stall (`headStall`) | upper | Find the middle of the ball: the same skill that makes headers accurate. |
| Chest juggles (`chestJuggles`) | upper | Lean back and cushion a high ball on your chest. |
| Neck stall (`neckStall`) | upper | Keep your eyes on the ball and stay soft as it lands on you. |
| Shoulder roll (`shoulderRoll`) | upper | Move your body under the ball to keep it balanced. |
| Sitting juggles (`sitJuggle`) | sit-down | Tiny touches with a soft ankle: the same cushion that settles a pass. |
| Sit-down instep catch (`sitCatch`) | sit-down | Cushion a dropping ball so it stops dead on your foot. |
| Lying-down juggles (`lieJuggle`) | sit-down | Both feet can control the ball, even from the ground. |
| Sit-up transition (`sitToStand`) | sit-down | Keep control while you get back up, like recovering after a fall. |
| Sole rolls (`soleRolls`) | ground | Roll the ball with your sole to keep it close and shielded. |
| Toe taps (`toeTaps`) | ground | Quick, light feet: stay on your toes, ready to move. |
| Inside–outside touches (`insideOutside`) | ground | Change direction with the ball glued to your foot. |
| Keep-up passes (`pairVolley`) | pair | Control a lofted pass, then pass it back in two touches. |
| Header rally (`pairHeader`) | pair | Head with your forehead, eyes open, aiming at your partner. |
| Pass and flick-up (`pairGround`) | pair | Pass along the ground with the inside of the foot; your partner receives it softly. |

**How it works:**
- `lib/graphics/freestyleTricks.ts` holds the data and the maths. Each trick is a list of beats; a beat is a contact plus an optional hold.
  - **Posture contacts** (laces, thigh, chest, neck, head) put the body part in a fixed posture; the ball sits on it.
  - **Ball contacts** (sole, inside, outside, heel, flick) put the ball at an authored spot; the boot is placed on it.
  - Stances: stand, low, head, lean, bow, sit and lie.
- `lib/graphics/freestyleRoutine.ts` builds the seeded routines and the shared pair timelines.
- `lib/graphics/courtFreestyle.ts` is the runtime per NPC: the same single ball mesh as before.
- `lib/graphics/trickPose.ts` and `PlayerMotion.trick` are an **optional** rig pose. The rig applies pelvis, torso, head, both legs and both arms over its finished solve.
  - Both legs use the same analytic two-bone solve the trick maths uses, so boot and ball meet by construction.
  - The ground guard runs only for sit, lie and bow poses.
  - With `trick` absent the rig is unchanged.

**Where it shows:**
- The NPC name tag shows the live trick name. Each court freestyler has a "What tricks are you practising?" topic listing its tricks and their purposes.
- `/skill-lab?skill=<id>` (for example `sitJuggle`, `neckStall`, `pairVolley`) previews every trick. Pair tricks show the partner.

**Tests:** `tests/freestyle-tricks.cjs` (in `npm test`) checks every trick on both feet:
- the ball path is continuous and above the floor, and starts and ends on the sole;
- every contact meets the ball on the solved bean townsperson rig (gap within ±5 cm);
- the ball never sinks into the body capsules by more than 7 cm;
- the ground guard lifts the pose by less than 2 cm;
- the routines tile with no gaps and loop;
- the pair windows align on both partners;
- the partner fallback, reduced motion and determinism on the shared clock all hold.
