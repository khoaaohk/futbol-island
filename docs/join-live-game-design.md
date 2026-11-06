# Join a live game (7v7 first): research + design

Nov 4 2026. Read-only research; no game code changed. Owner ask: walk onto the 7v7 field with your ball, the ball
disappears, you join the live NPC match; simple offence/defence actions; clear "you're about to play" moment and
attack direction; brighter bibs; later 9v9, 11v11, futsal; then several friends in the same match (multiplayer).

## 1. How it works today

**The live matches.** `lib/town/fieldRuntime.ts` `createFieldRuntime()` (l.48) builds one `MatchSim` per venue in
`LIVE_VENUES` (l.55; seed `270+i*41`), steps it inside `update()` (l.70) and poses pooled rigs (l.128-140).
Fields far from the player go dormant (l.86-93, heat pass 5). `LIVE_GAME_SPEED=.32` (l.24-25; futsal and beach .48).
Venues: `lib/town/venues.ts` l.7 (7v7 "Old Town Ground", x 11 z -80, 34.3 x 52.3 m, `2-3-1`); sim space is 270 x 400
(`liveWorldX/Z`, `liveFieldPoint` map both ways). `LiveMatchView` (fieldRuntime l.47) feeds `components/FieldRadar.tsx`.

**The sim already has a human driver, unused.** `lib/town/match/matchSim.ts`:
- `enableUser(team)` l.705, `setUserInput(mx,my,shoot,act,{sprint,through,switchReq,shootPower,jockey})` l.711-721,
  `resetMatch()` l.708. `grep` finds **no caller** anywhere (left over from the old Play game; `git log -S` → deploy 6).
- `updateUserPlayer()` l.759-789 is FIFA-style auto-switching (control jumps to the carrier / nearest player).
- With the ball (l.1878-1893): `shoot` → `doUserShot`, `act` → pass to where you aim (`userPassTarget` l.725,
  direction-weighted, leads runners), `through` → driven through ball; AI never auto-passes for the human.
- Without the ball: `act` = lunge tackle (l.1853-1862, 82 % in range), `jockey` = contain goal-side (l.818, l.3052).
- `passTargetId` (l.1553) already names who a Pass would reach (made for a receiver marker).
- 7v7 build-out retreat already applies to the human (l.1567-1572; rules in `lib/town/match/sevenAI.ts`).
- Gold attacks sim y 8 (`atkGoalY`/`dirY` l.643-645, `GY_TOP` l.67) = world north.

**Speeds line up.** Sim sprint `P.runSpeed` 84 u/s (l.73) x .32 on the 7v7 (0.1375 m/u) = **3.70 m/s**, exactly the
walk `maxSpeed` 3.7 (`lib/town/travelModes.ts`). Futsal 3.7 m/s too; 9v9 4.9 m/s; 11v11 **7.1 m/s** (faster than
walking, and above the relay's walk speed check `MAX_SPEED_MS` 6.3 in `multiplayer/protocol/limits.ts`).

**Camera.** Fixed diagonal follow (`walkCameraOffset`, `lib/town/walkControl.ts` l.18-25, looks along -x -z), no
orbit. So north is always "up the screen": a joiner on the north-attacking team always attacks up-screen.

**Walking onto a pitch today.** `lib/town/fieldCollision.ts` makes field players solid (push-out + bump, sim never
touched); the walk ball (`lib/town/walkBall.ts`) can hit and freeze players (`ballReactions`, Town l.1639).

**Best precedent: Rooftop Knockout** (`lib/graphics/liveKnockout.ts`). Walk in = joined, walk out = left (l.125-127);
Town hides the walk ball (`if(liveKnockout.joined)ball.visible=false`, Town l.1910), resets `walkBall` and remaps
Space to kick (l.1435), relabels the action cluster via `data-knockout` on `.travel-actions` (l.1912), dresses the
avatar in team kit (`mainPlayerDress(...,inTeam,...)`, l.1679), disables `fieldBump` (l.1415), shows a status pill
(`[data-knockout-status]`, `app/globals.css` l.548, hud-stack task slot l.694-707). Every gate in Town that checks
`liveKnockout.joined` (emotes l.937/965, knocks l.1023, chat l.1837, walking ball l.1862) needs the same check.

**Controls/HUD.** Desktop: Space kick (hold = charged shot), J keep-ups, Shift sprint, E interact (Town l.1162-1166).
Phone: floating stick + `.travel-actions` cluster (Town l.2275) with `touch-shoot` / `touch-juggle`; lessons already
relabel `touch-shoot` "Call for pass". Prompts go through the HUD arbiter (`lib/ui/hudStack.ts` `createFocusArbiter`
l.47, Town l.571; `docs/ui/HUD_STACK.md`).

**Kits.** `lib/town/beanLooks.ts`: `TEAM_PALETTES` l.23-31 (live default gold `#edb957` vs teal `#356478`,
`lib/graphics/beanLook.ts` l.47-48), `KEEPER_PALETTES` l.33-40, `kitsClash` (CIE76 ΔE < 35) l.57-59,
`teamBodyColour` (whole bean tinted by team), `matchKits()`, `BEACH_MATCH_KITS` l.91 (the per-venue override path
fieldRuntime already uses, l.129 `fieldTokenDress(..., v.sand?BEACH_MATCH_KITS:undefined)`). Rendering:
`lib/graphics/playerBatch.ts` instanced batches; kit colours are **per-instance data rows** (l.38, l.100-117), so a
recolour costs **zero draw calls / materials / textures**.

**Multiplayer today** (`multiplayer/protocol/types.ts`, relay `multiplayer/relay/src/partyRoom.ts`): the relay only
forwards poses (10 Hz near, `S.Live`), a visual-only ball (`C.Ball`), emotes, emote asks/duets (relay hands out a
shared `seed`, `SDuet`), hits, kits. Party max 20, grown-up-gated joining. **No shared NPCs or shared match**: every
client runs its own `MatchSim`, so two friends watching the 7v7 see different games. Presence `Activity` codes in
`multiplayer/protocol/presence.ts` l.9-16 (no "Match" yet); interpolation in `lib/multiplayer/liveClock.ts` (230-500 ms).

**Tests to extend:** `tests/ai-7v7.cjs`, `nine-match-ai.cjs`, `live-field-frame.cjs`, `match-update-clock.cjs`,
`field-collision.cjs`, `bean-looks.cjs`, `knockout-controls.cjs`, `live-knockout-work.cjs`, `mp-kit-relay.cjs`.

## 2. Design

### (a) Trigger, ball, exit, the replaced NPC
- **Zone:** the playing rectangle of a live venue (`liveHalfX/Z`), on foot (`rideRef==='walk'`), not in a lesson,
  job, quiz, ride or emote; match in open play or a restart. A 1.5 m "edge band" outside the touchline arms the card.
- **Ball:** on join the walk ball is hidden and `walkBall.reset` (knockout pattern); a tiny "puff into the kit bag
  on the bench" plus the line "One ball per match!" On leave it is reset at your feet.
- **You take a real slot (no 8th player).** Pick the non-GK on your team nearest your entry point (Law 3: a
  substitution). His rig **becomes you**: `rig.setBeanLook(yourLook, teamOutfit)` (your face, hair, skin; team bib),
  and the main avatar is hidden while joined. All existing posing (receives, wind-ups, dribble rhythm, combos) then
  works for free. The sim is authoritative for position; Town copies the slot's world position into `location` so
  the camera, minimap and multiplayer pose follow (knockout `playerPosition()` pattern). A sub board flashes
  "No. 7 off, YOU on" (teaches substitutions). On leave the NPC look is restored and the AI takes the slot back.
- **Exit:** a Back button "Leave match" (desktop Esc). Not walking off: the sim keeps players on the pitch, and a
  kid chasing a ball to the line must not drop out by accident. Leaving puts you on the touchline at your slot.
- **Locked control:** add `lockUser(id)` so `updateUserPlayer` never switches (you are always you).

### (b) The pre-join moment (kids 7-12, one thumb)
Auto-join with a visible 2-second countdown; no reading or tapping required, no accidental joins.
1. In the edge band: the touchline segment in front of you glows in your team colour and a small chip appears.
2. Cross the line: the **Join card** drops in at the top (under the score chip: the player in mid-screen and both thumbs stay clear) with
   your bib colour, the attack arrow and a 2 s ring. Tap = join now. Walk back out = cancel ("Maybe later").
3. Ring completes: card shrinks into the match chip (score + "YOU: Yellow ↑"), compass ring appears at your feet.
After 3 joins the card is skipped (chip + 1 s ring only). Reduced motion: no slide/pulse, same text.

```
 ┌──────────────────────────────────────┐
 │  [yellow bib]  You're joining YELLOW  │
 │                                       │
 │          ▲  Score in the top goal     │
 │          │                            │
 │   ◔ 2…   Tap to play now · step back  │
 │          to wait                      │
 └──────────────────────────────────────┘
```
Static phone mock: `/private/tmp/claude-501/-Users-khoado/56516d72-bcc7-4587-91aa-511817371dd2/scratchpad/join-mock.html` (+ `.png`).

### (c) Attack direction
| Option | Verdict |
|---|---|
| Arrow painted on the pitch / centre circle | off-screen most of the time on a 52 m pitch |
| Goal net pulse | good confirmation, invisible from the other half |
| Banner "You attack this way" | needs reading, clutters if permanent |
| Minimap / radar arrow | radar is closed by default on phones |
| **Compass ring at your feet** | always in view (camera follows you), one mesh |
```
        ▼   <- team-colour head chevron (section f)
       (•)  <- you
     .-^-.  <- compass ring at the feet; the ^ chevron points at the goal you attack (up-screen)
     '---'
```
**Primary: the compass ring.** Your highlight ring (team colour) carries one chevron that points at the goal you
attack; it is the "who am I" marker and the direction in one object, so nothing extra on screen. Plus the camera
rule: the solo joiner always takes the north team, so the chevron points up-screen. **Fallback:** a small edge-of-
screen goal badge (bib colour + net icon) that appears only when the target goal is off-screen, and the 2 s goal-net
pulse at join and after each kick-off. Cost: 1 ring + 1 chevron (one merged geometry, `MeshBasicMaterial`, 1 draw
call; knockout `rings` l.33 and `lessonCues` are the templates); the badge is DOM, updated on the HUD tick.

### (d) Actions (two buttons, contextual; stick = move/dribble, push fully = sprint)
| State | A (Space / `touch-shoot`) | B (J / `touch-juggle`) | Sim input | Lesson shown once |
|---|---|---|---|---|
| You have the ball | **Pass** (to who you face; receiver ring = `passTargetId`) | **Shoot** (hold = power, existing charge ring) | `act` / `shoot`+`shootPower` | "Look up: pass to the open teammate" / "Shoot low, aim for the corners" |
| Teammate has it | **Call** ("Here!") | hidden | new `call`: carrier's `bestPass` prefers you if the lane is open, else coach line "Not open: move into space" | "Show for the ball: find a gap" |
| Opponent has it | **Tackle** | **Stay** (hold = jockey) | `act` / `jockey` | "Time your tackle" / "Stay goal-side, don't dive in" |
| Ball loose | **Go!** (sprint to it) | hidden | `sprint` | "First to the ball" |
| Goalkeeper (phase 2) | **Save** (dive toward stick) | **Roll it out** (pass) | new `dive`; `act` | "Keeper starts attacks: play it out (build-out line)" |
Desktop through-ball (`through`) stays an extra on K; no player switching. Restarts: phase 1 the AI walks your slot
into position and takes restarts for you (chip: "Throw-in: get ready"); phase 2 you take throw-ins/corners.

### (e) Bibs (and the "you" ring)
Training bibs read better than muted kits: "one light warm vs one dark cool" keeps the yellow-blue axis that
deutan/protan kids (about 1 in 12 boys) still see, plus an L* gap for greyscale. ΔE (CIE76, sim via Machado):
| Pair | L* | ΔE | deutan | protan | tritan | vs grass (deutan) |
|---|---|---|---|---|---|---|
| today gold `#edb957` / teal `#356478` | 78/40 | 83 | 85 | 78 | 71 | 51/34 |
| **7v7 + futsal: yellow `#ffd23f` / royal `#2459e0`** | 86/43 | 157 | 155 | 152 | 65 | 69/88 |
| **9v9: orange `#ff8a1f` / purple `#5b3fd1`** | 69/39 | 145 | 146 | 138 | 85 | 63/85 |
| **11v11: cyan `#22c3e6` / orange `#ff7a1a`** | 73/66 | 122 | 103 | 89 | 112 | 44/62 |
| rejected: pink / navy | 61/23 | 74 | 64 | **35** | 97 | **12** (vanishes on grass) |
Implement as `LIVE_BIB_KITS: Record<LiveFormat, MatchKits>` beside `BEACH_MATCH_KITS`, built through `matchKits`-style
keeper picks (keepers keep `KEEPER_PALETTES`; volt keeper must be skipped next to yellow, `kitsClash` does it). Shorts
stay dark/neutral so the bib colour owns the silhouette. Per-instance colours only: **no new materials, textures or
draw calls**. A real bib shape (sleeveless over a white undershirt) is optional later as a flag texel in the bean
skin row (shader branch, still 0 draw calls), not a new mesh. Teaching line on the card: "Bibs help you find your
teammates with one quick look."

### (f) "Which one is me?" marker
Already in the code: the main avatar's foot ring (`player-foot-ring`, Town l.691) and the "you are here" pin
(`lib/graphics/hiddenPlayerMarker.ts`: a 4-sided down cone, `MeshBasicMaterial`, `depthTest:false`, no per-frame
allocation) shown when a building hides you. Friends: `lib/graphics/remoteAvatars.ts` gives each friend one name-label
Sprite (CanvasTexture made once; nearest 8 within 25 m) plus a member-colour ground ring (one shared draw call).
| Option | Verdict |
|---|---|
| Ring at the feet only | hidden under bodies in a crowd of 14; already used as the compass |
| "YOU" text tag | needs reading; a texture; bigger on a phone screen |
| **Down chevron above the head** | reads at a glance in a crowd, kid-proof, reuses the pin |
**Recommend:** reuse the hidden-player pin as an always-on **team-colour chevron** above your head while joined
(colour set once on join, gentle 1 Hz bob; still in reduced motion / battery saver), together with the compass ring at
your feet. Cost: the one existing mesh made visible (1 draw call, no new texture, no allocation; position written into
the existing object). Visibility: always on while joined (depthTest off so teammates never hide it), hidden during a
goal-celebration close-up and when the HUD hides for a lesson; it is the one thing never culled by distance because
the camera follows you. **Friends in the same match:** no chevron (only you get one, so "the arrow is me" stays
true); they keep their existing name label, with its rim tinted their bib colour while joined, and their member-colour
ground ring is hidden on the pitch (the bib already says the team). Their labels follow the existing nearest-8 rule.

## 3. Edge cases, multiplayer, perf/heat

**Solo edge cases.** Mid-play entry: allowed; you inherit the slot's place, the sim keeps running (no pause). If
your entry is offside-sensitive or in your own box nothing special: you are just a player. Game "full": never (you
replace someone). Rejoin: leave/rejoin freely; 5 s cooldown on the card. Beach full time / goal celebrations: the
card waits. Battery saver / heat tier 3: join still works, no glow/pulse, no goal-net pulse. Lesson or quiz opens:
auto-leave first. Island ball hits and truck collisions on the joined field: off while joined (`fieldBump` off).

**Multiplayer: several friends in the same match.**
- *Representation:* each joiner replaces an NPC slot (same rule as solo), so 7v7 stays 7v7 and other clients just
  see "that player is my friend" (their look on that slot rig + name tag). Max humans = outfield slots (6 per team in
  7v7); a 13th friend gets "Match full: next one starts in 1:20" and watches.
- *Authority:* today nobody owns a shared match. Proposal: **one client is the match owner** (the first joiner of
  that field); the relay records `fieldOwner[format]` (tiny state in `partyRoom.ts`) so two simultaneous first joins
  resolve by arrival order. The owner runs the only `MatchSim` for that field; every other party client near that
  field **stops its local sim** for it and renders owner snapshots (less heat for them). Not lockstep: the sim's
  floats and frame `dt` are not deterministic across phones. Not relay-side sim: the relay is a thin forwarder and
  moving `MatchSim` into the Worker is a bigger change (keep as phase 4 option if owner migration feels bad).
- *Messages (new, behind `Cap.Match`):* `C.MatchJoin(format, teamPref)` → owner assigns `S.MatchSlot(member, slot)`;
  `C.MatchIn(seq, mx, my, buttons)` 10 Hz + immediately on a button press (~20 B); owner sends
  `C.MatchSnap` 10 Hz: per player x/y int16 + anim byte, ball x/y/h, owner id, score, recent touch events (7v7
  ~300 B JSON, 11v11 ~450 B; ≈3-4.5 KB/s per viewer). Rate cap like `RATE.pose` (12/s, burst 16). Viewers
  interpolate with `liveClock` (≈240 ms). Your own slot is **predicted locally** (move with `ROLE_MOVEMENT`, soft
  reconcile), and your kick animation starts on press while the ball leaves on the owner's confirmation (~150-300 ms;
  validate on real phones). Joined members send pose with `Mode.Busy` + new `Activity.Match` (force field: no ball
  hits/asks from outsiders), which also skips the 6.3 m/s walk speed check for 11v11.
- *Teams and direction:* friends join the **same team by default** (the north team, attacking up-screen). The card
  shows a second, smaller choice "Play against" when a friend is already on the pitch; it puts you on the south team.
  For south joiners the compass ring points down-screen; optionally flip that client's camera 180° while joined so
  everyone attacks up (needs a visual check of occlusion probes/shadows; default off in slice 1). Auto-balance only
  when one side would exceed its outfield slots.
- *Leave/disconnect:* `S.Left` or `C.MatchLeave` → owner unlocks the slot, the NPC look returns, AI takes over from
  the same spot. Owner leaves: relay hands ownership to the earliest remaining joiner; it rebuilds a sim from the
  last snapshot (positions, score) and restarts with a **dropped ball** (Law 8, a free teaching beat). Nobody left:
  every client goes back to its own attract match.
- *Safety:* no chat or typing in matches; preset emotes only (existing set: celebrate, thumbs-up); party joining
  stays behind the existing grown-up gate and party code, so only party members can share a match. Tackles are ball
  steals: no knock-downs on human slots (fieldCollision rule). Names: party nicknames only.
- *Solo vs party:* solo needs no relay and is the first release. In a party with an old relay (no `Cap.Match`),
  each kid plays their own local match and friends see them as "Playing a match" (busy pill), never a broken mix.

**Heat budget (AGENTS.md).** Added: one ring mesh, the existing head pin made visible, a DOM card for ~2 s, chip text on score change, per-frame input
write. Removed while joined: walk ball and main avatar draw, field-bump checks. The joined field must not be throttled
(`matchUpdateClock` immediate) and the other fields stay dormant. Multiplayer owner: +10 Hz snapshot encode (cheap);
viewers: one fewer sim. No timers or polling outside the match; the card listens on the HUD tick.
**Validate on a real iPhone:** 10-min joined vs 10-min watching (frame time, temperature, battery); thumb reach and
overlap of card/stick/buttons in portrait and landscape; the bib colours in sunlight; kick latency in a 2-phone party.

## 4. Phased plan

**Slice 1: 7v7 solo (≈3 build sessions + 1 verify).**
1. Sim (Opus, 1): `lockUser/releaseUser`, multi-human-ready input map (`humans: Map<slotId,Input>` even if one),
   `call` input, restart auto-pilot for the human slot. Tests: new `tests/live-join-sim.cjs` (lock never switches,
   pass/shoot/tackle/call, release hands back to AI, build-out retreat).
2. Runtime + Town (Opus, 1): new pure `lib/town/liveJoin.ts` (states outside/edge/countdown/joined, slot pick, gates;
   `tests/live-join.cjs`); fieldRuntime `join/leave/slotWorldPose`, slot rig dressed as you; Town wiring at the knockout
   lines (1244, 1415, 1435, 1679, 1862, 1909) and every `liveKnockout.joined` gate; button relabel on `.travel-actions`.
3. UI + bibs (Sonnet, 1, load `design-taste-frontend`): `components/LiveJoinCard.tsx` + module CSS, match chip in the
   hud-stack task slot, compass ring (`lib/graphics/joinCompass.ts`), `LIVE_BIB_KITS` (+ `tests/bean-looks.cjs` clash
   and ΔE checks), touchline glow.
4. Verify (Sonnet/Haiku, low): `npm run test:quiet`, `build:quiet`, one phone + one desktop screenshot.

**Slice 2 (≈2):** goalkeeper option, you take throw-ins/corners, sub-board jog-off, light Passport stats
(`recordExploreActivity`, no coins). **Slice 3 rollout (≈1 each):** futsal (rooftop elevation 6, speed already 3.7),
9v9, 11v11 (7.1 m/s: test feel; maybe cap the human slot near 5 m/s), beach optional. **Slice 4 multiplayer (≈4-5):**
`Cap.Match` protocol + relay owner table + validation tests (1-2), owner snapshot/inputs + prediction (2), party UX,
leave/migration, real 2-phone test (1). **Minimum multiplayer first release:** 7v7 only, friends on the same team by
default plus "Play against", owner = first joiner, NPC takes slots back, no camera flip, no GK for humans.

**Open questions (recommended default):**
1. Auto-join after a 2 s countdown, or always tap to confirm? → auto-join, tap to skip, step back to cancel.
2. Which team does a solo kid join? → always the north team (attacks up-screen, yellow bibs on 7v7).
3. Can kids play in goal in the first release? → no, outfield only; "Go in goal" in slice 2.
4. Should match goals/assists/tackles count toward Passport or quests? → yes, lightweight activity counts, no coins.
5. Ship solo first and multiplayer as the next release, or wait and ship both together? → solo first (slice 1),
   multiplayer slice 4 right after, so the sim API is built multi-human-ready from day one.

## 5. Implemented in slice 1 (Nov 4 2026)

**What works (solo, 7v7 only; engine keyed by human id for N humans).** Walk onto the Old Town Ground carrying your
ball → the Join card drops in under the coins bar (your bib colour, "You're joining Yellow", "▲ Score in the top
goal", a 2 s ring, **Play now** skips it); stepping back off the pitch cancels. On join the ball goes to the kit bag
(walk ball hidden), the nearest outfield NPC of your team gives you his slot (his rig wears your look in the team bib;
the main avatar is hidden) and a pooled copy of him jogs to the nearest touchline and cheers on a 7 s rhythm (again
after a goal). On **Leave match** (Esc) he walks back on from there, the AI takes the slot from the same spot, and
your avatar and ball appear where you were. Walking to the touchline is not leaving. Team: fewer humans, tie → the
team whose own goal is nearest where you stepped on (party preference argument ready). Any slot incl. keeper; no stats,
Passport, quests or coins. Feet compass ring (bib colour, one chevron at the goal you attack), always-on bib-colour
chevron above your head (the hidden-player pin, `pinAt`), off-screen goal badge as the fallback. Two contextual
buttons replace the travel cluster while joined: on the ball **Pass** + **Shoot** (in range) / **Forward** (out of
range); teammate on the ball **Call**; opponent on the ball **Tackle** + **Stay** (hold = jockey); loose **Go!**
(hold = sprint). Desktop: Space = A, J = B (hold J for shot power), K = forward pass, Shift sprint. Each action shows
its one-line lesson the first time (remembered per device; "Not open: move into space" when a call is not on).
Control is locked to your slot (the FIFA-style auto-switching is removed). Bibs: yellow `#ffd23f` vs royal `#2459e0`
on the 7v7 (per-instance kit rows, keepers picked to clash with neither), config ready for futsal / 9v9 / 11v11.

**Passing assist (owner addition).** `lib/town/match/passAssist.ts`, all tunables in `PASS_ASSIST`: a cone pick
round the stick (open space, progress, blocked-lane penalty; no stick → the most open teammate ahead), hysteresis
(`switchMargin`, `minHold`) so the receiver ring never flickers, a lead point and pace so the ball arrives with
controllable speed (a human's pass is never misplaced), Forward = a through ball into the space ahead of a runner
(prefers `runners`; offside judged where the receiver stands), shot aim nudged at most 9 units toward the corner away
from the keeper (never decides the outcome), tackle reach +3.4 units, jockey goal-side gap. Markers: a ring at the
Pass target, a small compass at the Forward runner. No assist work when no human is on the ball.

**Smarter teammates + forward passes (owner addition).** `lib/town/match/offBallRuns.ts` on the existing staggered
think clock (one pick per 0.28-0.45 s per player): run in behind (forwards and wide mids when the carrier has time;
more often for a human carrier), check to the ball, hold width, make space (peel off the carrier and off a human
teammate). Offsets add to the formation target; the onside cap still applies. The AI teams use them too, so the
seeded live-match fixture (`tests/fixtures/live-match-summary.json`) was regenerated on purpose; the 7v7, 9v9, 11v11,
futsal and beach balance tests still pass. Moved to **slice 1b** for size: AI carriers weighting forward runners in
`bestPass` (the AI keeps its existing through-ball / combination logic in combos.ts).

**Files.** Pure: `lib/town/liveJoin.ts` (format switch `LIVE_JOIN_FORMATS`, countdown machine, team + slot pick,
sit-out walker), `lib/town/match/humanInputs.ts`, `lib/town/match/passAssist.ts`, `lib/town/match/offBallRuns.ts`,
`LIVE_BIB_KITS` / `liveMatchKits` / `bibColour` in `lib/town/beanLooks.ts`. Sim: `MatchSim.humans`, `lockHuman /
releaseHuman / humanInput / placePlayer / humanTarget / isRestart`, call for the ball (`callerFor`, `lastCall`).
Runtime: `fieldRuntime.joinMatch / leaveMatch / humanInput / humanView` (the joined field is never dormant or
throttled; bench rigs pooled and drawn in the same batch), `lib/town/liveJoinRuntime.ts` (Town glue, HUD writes),
`lib/graphics/joinMarkers.ts`, `hiddenPlayerMarker.pinAt`. UI: `components/LiveJoinHud.tsx` + `.module.css`,
`app/globals.css` (travel cluster and pitch lesson card hidden while joined). Town: the knockout lines (position
override, steer, field bump, walk ball, avatar visibility, emote / knock / chat gates, hover inspect off).

**Validation.** `tests/join-live-game.cjs` (in `npm test`): countdown, team / slot for N humans, sit-out walker, input
map, assist (cone, lane, hysteresis, lead, pace, offside, shot aim), runs, two humans in one sim (locked, pass, shoot,
tackle, call, release), bibs ΔE and keeper clash, Town wiring and heat gates. `npx tsc --noEmit` clean;
`npm run test:quiet` run once. Headless Chrome on the dev server, desktop 1440×900 and phone 390×844: countdown card,
join, compass + head chevron + pass / forward markers, contextual buttons, leave; no page errors.

**Heat.** Away from a joinable pitch: one rectangle test per frame and no DOM writes. Joined: ≤ 3 marker draw calls
plus the existing pin, bench rig(s) in the existing batch (no new draw calls or textures), HUD attributes written only
on change, the joined field kept awake (it is the one on screen anyway); the walk ball and main avatar are not drawn.

**Still needs a real phone.** Thumb reach of the two buttons against the stick in portrait and landscape (and the
left-handed flip), whether the minimap crowds the B button on small phones, the bibs in sunlight, a 10-minute joined
session's frame time and temperature against watching, the feel of the 2 s countdown for 7-year-olds, and whether
"idle = hold your spot" (no AI drift) feels right.

**Owner decisions, Nov 4 2026 (supersede §2b's countdown and the Join card).** No auto-join and no countdown. On a
live-joinable pitch the existing pitch lesson bar (`components/FieldPathCard.tsx`, `data-live-bar`, full width on phones)
reads gold **Learn** (the lesson; hidden when the path has none) + outlined **Play**; other pitches keep **Go →**. The bar
also shows while riding or flying: Play / Learn call `liveJoin.ground` (animal ride let go, `selectRide('walk')`, i.e. the
existing dismount and jetpack landing). Play opens **Pick your side**, the party modal grown out of the Play button
(`lib/ui/growFrame.ts`, shared with Join with a code): Back, a Yellow / Blue segmented toggle (bib swatch + humans on that
side; a full side is disabled), a **Position** dropdown of every slot of that side named from the sim's slot ids
(`slotName`; humans' slots disabled; default = nearest free outfield slot) and Start. Start joins as soon as the player is
grounded and on foot (`canJoin`; the button reads "Landing…" meanwhile); stepping off the pitch or Back / Esc closes it
(shrinks back into Play). The pick feeds `fieldRuntime.joinMatch(..., {team, slot})`, the path slice 2 reuses for friends;
a picked slot starts where that player stands. **Goalkeeper** is pickable (human keepers, below). Also: Pass and Shoot charge while held and strike on
release (pass up to `PASS_POWER_MAX` 1.5 x pace, same assisted target; a ring grows on the button); Sprint is a held button
or Shift (never the stick's magnitude, which flickered), x`SPRINT_BOOST` 1.42 top speed eased in over 0.35 s and out over
0.3 s, the rig keeps ~80 % of the run posture until sprinting.

**Human keeper (owner, Nov 4 2026: "you can even play as goalie now").** `MatchSim.humanKeepers` is on, `lockHuman`
takes the keeper slot, tunables in `HUMAN_KEEPER` (matchSim.ts). Stick moves him inside his box (|x−135| ≤ 44, ≤ 46 off
his line; no sprint in goal). **Save** (A) dives: with a shot coming it aims where the ball crosses his line (whatever
the stick says), lands before the ball (≤ 0.14 sim s; superseded Nov 5 2026 by a real push-off + flight, see "Goalkeeper feel + body moves") and adds 3.5 units of reach at full stretch, so a timed press
saves a corner shot that beats a keeper standing still; pressed just before the strike it is buffered; at an opponent's
feet it is a smother (80 %); else a short dive along the stick. A shot at him is caught without a press. The AI never
pre-decides a goal against a human keeper (`shotIsGoal` false: his position and dive decide it). On the ball: **Throw**
(A, hands; Pass at his feet) = the short pass assist, **Kick** (B or K) = the Forward pass assist with at least 0.6
power; past six real seconds (Law 12) the AI distributes for him. The Forward button is hidden in goal. Keeper kit +
gloves through the join dress (`dressFor(..., keeper)` → `matchPlayerDress(..., keeper)`); the replaced AI keeper walks
to the touchline and cheers like any replaced NPC and walks back into goal on leave. One lesson, first Save or joining
in goal: "Stay on your line, dive at the shot." Per-team caps now count the keeper (7v7: 7). Cost: zero for AI-only
matches (`humanKeeperOf` returns at once without humans; seeded fixture unchanged); with a human keeper, a loop over
≤ 2 stretch timers per step, no new draw calls. Tests: `tests/join-live-game.cjs` §9b.

**Slice 1b.** AI carriers preferring forward runners; the sub-board flash and goal-net pulse at join; the touchline
glow in the edge band; skipping the card after 3 joins; a shot-power ring on the B button.

**Slice 2 (multiplayer) must add.** The `Cap.Match` protocol (`C.MatchJoin`, `S.MatchSlot`, `C.MatchIn`,
`C.MatchSnap`), the relay's `fieldOwner[format]` table and owner migration, remote humans fed through
`fieldRuntime.joinMatch / humanInput` (already keyed by human id; `pickJoinTeam(..., prefer)` for friends), viewers
stopping their local sim and interpolating snapshots, local prediction of your own slot, `Activity.Match` presence,
and friend name tags tinted by bib.

**Camera angle button (owner, Nov 4 2026: "a camera button placed on the top left ... change between different camera
angles").** While joined, a 44px gold circle (icon only, `aria-label` "Camera angle", title "Change camera · C") sits
top-left opposite Leave, in the paths / friends buttons' place (hidden mid-match). Each tap (or C) cycles
**Broadcast** (today's follow view) → **Behind you** (low chase view on the attack axis, looking at the goal you attack:
it follows the axis, never your facing, so it never swings while you turn) → **Wide** (high tactical view from behind
your own goal, attack up the screen, the whole pitch in frame: the football lesson is teammate spacing, and its first
use shows "Wide: keep space between you and your teammates.") → **Close** (Broadcast's direction at 55% of the follow
distance). A short toast names the angle. The choice is kept for the browser session (sessionStorage `fi2-join-cam-v1`)
and across joins: a player who likes Wide gets it next match; a new visit starts on Broadcast. Transitions ease (0.6 s
smoothstep weight + the follow camera's exponential rate); reduced motion is instant; leaving eases back to Broadcast.
**Controls:** the stick stays screen-relative in every angle (`liveJoinRuntime.steer` turns Town's fixed screen → world
map by the camera's yaw change); an angle change while the stick is pushed keeps the old mapping until the stick is
released (3 s cap, then it eases over), so you never reverse mid-run. Pass / Shoot are unchanged: the sim aims passes and
shots from your world facing at the goal you attack, never from screen directions. Code: `lib/town/liveJoinCamera.ts`
(pure maths), `liveJoinRuntime.cameraApply / cameraRestore` (Town calls restore before its follow lerp and apply after its
lookAt), `components/LiveJoinHud.tsx` (`data-join-cam`). Tests: `tests/join-live-game.cjs` (camera section).
Also fixed: the hud line that wrote the B button's label / title / mode had been swallowed by a `//` comment.
**Side angle (owner, Nov 4 2026, "like the FIFA broadcast view").** Fifth angle, second in the cycle (Broadcast → Side →
Behind you → Wide → Close): from the touchline at 30°, looking across the pitch with the goal you attack on the RIGHT of
the screen, tracking you along the length with the follow lag (stops short of the ends), the whole width in frame (fit to
the near touchline; a portrait phone backs off to show ~24 m of length, landscape ~36 m). Stick stays screen-relative
(the mapping turns ~90°), with the same hold-until-released on switching in or out; pass / shot aim is unchanged (world
facing at the attack goal). A touchline tree can stand in the foreground on the 7v7 (seen in the desktop shot).

### Trick, Press together, easier tackling, long ball, snappier controls (owner, Nov 4 2026)
**Action cluster.** Pass (88 px) stays in the corner; four 58 px buttons sit on one arc round it (radius 120 px from
Pass's centre at 184° / 152° / 120° / 88°, at least 8 px apart, a 194 px box under the right thumb). Offense: Shoot
(coral) · **Trick** (sky) · Forward (lilac) · Sprint (mint). Defense: Stay · **Press** (pink, the same slot) · Sprint.
A keeper and "team" / "loose" possession show neither. The fifth button is one element (`data-join-t`) whose mode,
colour and title follow possession, so offense and defense keep one geometry.
**Trick** (L): only with the ball. Stick pulled back = drag-back; otherwise each tap plays the next of stepover →
La Croqueta → drag-back, to the stick's side. The authored skill-move poses and ball path play on your rig
(`combos.ts trick`, `skillMoves.ts`) in 0.68 s; the ball stays at your feet. For 0.6 s nobody can steal it (AI or a
human tackle) and opponents within 16 units are bamboozled: their legs run at 35% and their speed drops to 30% at the
tap (they wobble on the pitch), then you get a 1.4 s burst at +15% pace. Cooldown 1.2 s, shown as a ring that shrinks
away. The juice: the ball touch sound + a soft kick "whoosh", the pooled impact sparkle at the feet, a toast word
(Step-over! / La Croqueta! / Drag-back!), and (not with reduced motion) ~0.55 s of slow motion at 0.3× for the field
runtime (Town scales only `games.update`'s dt by `liveJoin.timeScale`) with the camera moved 36% of the way to you,
easing back over 0.3 s. Lesson: "Fake out the defender: a quick trick, then go past him."
**Press** (P): only when the other side has it. The two NPC teammates nearest the carrier (never you, never the keeper)
hunt him for 4 s: the first closes the near side goal-side of him, the second cuts off the pass to his nearest
teammate, so they arrive from two angles instead of bunching. They sprint (×1.14, no ease-in, not shouldered off) and a
tackle roll by a presser is ×2.6 when both are on him (×1.5 alone). The press ends early when your side wins it or
the ball goes dead, then they resume their roles. Cooldown 8 s from the tap (ring). Lesson: "Press together: two
defenders win the ball back." Scripted check: 37/40 carriers lose it within ~7.5 s with Press, 29/40 without.
**Easier tackling:** reach × 1.4 (7.6 → 10.6 units), auto-aimed at the carrier, 85% when roughly facing him (70%
turned away), a 0.35 s recovery after a miss, nothing from range (0/40 beyond reach; 30/40 at 9 units, outside the old reach).
**Long ball:** hold Pass past 250 ms and it becomes a lofted long ball; the charge grows to 700 ms (distance wanted
70 → 170 units, peak 1.8 → 3.6 m). The target is the best teammate at that distance (open, ahead, a runner, the stick's
side), led into his run, flight timed to land at him (the beach lifted-pass flight), cut out only a quarter as often as
a ground pass; nobody suitable → into the space toward goal. Its loft gives the match trail its purple; the Pass ring
turns purple when the hold becomes long. A tap is the ground pass as before. Lesson: "Hold Pass for a long ball over the defenders."
**Snappier controls (humans only):** stick convergence 12 → 18 /s (90% pace in 0.38 s real instead of ~0.60 s), dribble
attach .05 → .035 s, first-touch settle .11 → .075 s, loose first touch × .45 → × .2, rig turn × 1.35 below sprint
pace, assist cone cos .42 → .30, shot aim nudge 9 → 12. Every change is gated on a human (`humans.size`, a human id or a
human-triggered set), so AI-only matches are byte-identical (`tests/fixtures/live-match-summary.json`, all formats).
Code: `lib/town/match/humanInputs.ts` (TRICK, PRESS, TACKLE, LONG_BALL, HUMAN_FEEL), `matchSim.ts` (humanTrick,
humanMovesStep, pressSpot, pressBoost, humanLongBall), `fieldRuntime.ts`, `combos.ts`, `liveJoinRuntime.ts`,
`components/LiveJoinHud.*`. Tests: `tests/join-live-game.cjs` (Trick / Press / tackling / long ball / snappier section).

### Shooting, shot slow motion, passing help, hard to be tackled (owner, Nov 4 2026: kids, fun, not competitive)
**Aimed corners + power shots.** Hold Shoot (past 180 ms) and five soft glowing marks appear on the goal mouth you attack
(top-left, top-right, low-left, low-right, centre; one InstancedMesh of camera-facing glows in `joinMarkers.aim`). The
stick, or a drag on the Shoot button itself (`joinAim` store written by the HUD while the button holds the pointer),
picks one: judged on SCREEN against where the marks are drawn (`pickAimMark`), so "left" is the kid's left in every
camera angle; sideways = the low corner ("shoot low"), up-and-sideways = the top corner, straight up / back = centre, no
push = the existing auto-aim. Release fires at the mark, always inside the posts (60% of the goal half-width at a tap's
charge → 80% at full: the accuracy forgiveness), at its height (`lastKick.shotHeight` .92 / .5 / .16). A quick tap is
unchanged: the auto-aimed shot. The B ring turns flame orange and throbs at full charge (`data-full`, transform only);
a full charge is the **power shot** (`POWER_SHOT`): ×1.08 pace, "Power shot!", a louder strike layered on the kick, the
pooled sparkle, and the existing ball trail at full power in flame orange with its 'solar' rings (`sim.powerShot`).
**Shot slow motion.** A power or aimed shot of yours from the shooting zone: the match runs at 0.3× for 1.2 s real while
the ball flies, then eases back over 0.3 s; the camera eases (0.35 s) to a low view 7.5 m behind where you struck it,
looking at the goal. Ends early on any tap / key, a save or any touch, or a goal (the score bar's goal shake then
plays). Its own track in `liveJoinRuntime` beside the trick's `fx` / `slowMo()` hook: Town's one `liveJoin.timeScale`
is the min of both (no second multiplier). Reduced motion: no slow motion and no camera move. AI shots never trigger it.
**Passing help.** A stick pointing at nobody now falls back to a ~105° cone, then to the most open teammate ahead, so
the Pass ring always shows and the pass always goes to it (`PASS_HELP`, `loosePick`). The ring is bigger (0.6-0.86 m)
and brighter with a soft pulsing halo. A pass to the highlighted target (Pass ring or Forward marker) is cut out half
as often. While you have the ball your two nearest NPC teammates come to 24-52 units of you and step sideways out of
a lane a defender blocks (`offBallRuns.supportOffset`, on the existing think clock, no rng).
**Hard to be tackled.** An AI tackle on you succeeds a third as often (scripted: 16/60 lost vs 45/60 at the old rate);
a roll that would have won before is a near miss: "Slipped away!" and a quick side-step wobble (the authored croqueta,
0.42 s), at most every 1.4 s; for 0.8 s after you get the ball nobody can tackle you. The other agent's own tackle
(TACKLE) is untouched. Every change is gated on a human, so AI-only matches are byte-identical (fixture unchanged).
Code: `humanInputs.ts` (AIM_MARKS, SHOT_AIM, POWER_SHOT, SHOT_FX, HUMAN_GUARD, PASS_HELP, pickAimMark, shotPace),
`matchSim.ts` (doUserShot, slipOrTackle, loosePick, interception help, supporters), `offBallRuns.ts`, `passAssist.ts`
(`coneCos` override), `fieldRuntime.ts`, `matchEffects.ts`, `joinMarkers.ts`, `liveJoinRuntime.ts`, `LiveJoinHud.*`.
Tests: `tests/join-live-game.cjs` (shooting / slow motion / passing help / hard to be tackled section).

### Multiplayer slice 2: friends play the SAME match (Nov 4 2026, code-complete, relay not deployed)
**What it does.** Party friends on the same live pitch (7v7, futsal, 9v9, beach) pick the same or the opposite side in
**Pick your side** and play one shared match. Each slot holds one human: the Position dropdown disables a friend's slot and
shows their party nickname instead of "Taken", and the side counts include them. A friend renders on their slot in their own
look + the bib (`ownKitLook` via `matchPlayerDress('mp'+id)`, `joinedRig`) with a small name tag; their island avatar hides
meanwhile (`roomParty.setMatchFriends`). Kids first: no goals, coins or stats are recorded for anyone; no chat, nicknames only.
**Authority.** The first joiner of a field owns it: their phone runs the only `MatchSim`. Everyone else's sim for that field
becomes a **puppet** (`MatchSim.enterPuppet`, never stepped): `lib/town/match/matchNet.ts` encodes ~12 Hz snapshots on the owner
(per player x/y ×10 + kick, ball x/y/height/owner, score, restart / goal / keeper-hands / period flags, each human's pass and
forward assist targets: a 9v9 with two humans is ~300 B, inside the 512 B client frame) and samples a 3-frame ring on the friend
(interpolated 110 ms behind; your own slot drawn from the newest frame plus its velocity, ≤ 0.18 s lead). Friends' controls go to
the owner as `C.Match In` (sim-space stick, held + one-shot buttons OR-ed until sent so a tap is never lost, ~12 Hz while the stick
moves, a 2 Hz keepalive when it is held, at once on a press) and enter the owner's sim through the normal `humanInput` buffer.
All controls work (pass / long ball / shoot + aim / Forward / sprint / trick / tackle / press / keeper save). Slow motion (trick,
shot) is off on a shared field (it would slow everyone's game).
**Leaving.** A friend leaving (Leave, a dropped socket, a kick, a timeout) frees the slot: the NPC comes back and the others read
"Ben left the match. A teammate takes their place." The owner leaving: the relay hands the field to the earliest remaining joiner,
whose phone plays on from the last snapshot with a dropped ball ("Your friend left: the match is on your phone now. Play on!").
Racing a friend into the same slot: the relay keeps the first; the second steps off with "Ana just took that spot. Tap Play to pick
another!". A lost connection: "Lost your friends' match: the game plays on here" and the local AI takes the friends' slots.
**Wire (relay v1.8, `Cap.Match = 128`, `CAPS_ALL = 255`).** One client frame `C.Match` (19) and one server frame `S.Match` (40),
each `[code, MatchKind, ...ints]`: Join `[field, team, slot]` / Leave / In / Snap; the server's kind 0 is the roster
`[field, owner, ...(member, team, slot)]`, sent to every Cap.Match member on a change and after C.Caps. The relay
(`roomCore.matchMsg`) keeps memory-only rosters (one human per slot, first come; owner = earliest joiner), forwards In only to
the owner and Snap only from the owner to that field's members, rate-limits both (`MATCH_RATE` 16/s burst 24, Join/Leave 0.5/s
burst 4; dropped silently, never `bad()`). **Backward compatible:** an old client never answers Cap.Match (it masks with its own
CAPS_ALL 127), so it never gets S.Match; a new client on an old relay never sends C.Match, and everyone keeps a local match (slice 1).
**Code.** `multiplayer/protocol/{types,validate,limits}.ts`, `multiplayer/relay/src/roomCore.ts`, `lib/town/match/matchNet.ts`,
`lib/multiplayer/matchLink.ts` (the glue; Town calls `update()` after `liveJoin.update`), `lib/multiplayer/connection.ts`
(`sendMatch`), `lib/multiplayer/roomParty.ts` (`setMatchFriends`), `lib/town/fieldRuntime.ts` (`addFriend` / `dropFriend` /
`setPuppet` / `pushSnap` / `encodeSnap` / `friendInput` / `netInput`, name tags), `lib/town/liveJoin.ts` (`slotOptions` /
`defaultSlot` friends overlay, `sideCounts`), `lib/town/liveJoinRuntime.ts` (`friends`, `say`, shared-field time scale),
`lib/town/match/matchSim.ts` (`enterPuppet` / `leavePuppet`, additive: AI-only and solo matches are byte-identical,
`tests/fixtures/live-match-summary.json` and the beach fixture unchanged). Tests: `tests/join-live-mp.cjs` (protocol, relay roster,
codec, two and three clients over the real RoomCore).
**Heat.** Owner: one encode + JSON per 83 ms only while a friend is on the field (alone: nothing). Friend: one lerp per player per
frame and no AI step (less work than watching). No timers or polling; no per-frame allocation (reused arrays, a preallocated ring).
**Deploy.** `cd multiplayer/relay && npx wrangler deploy` (no migration: memory-only state). Until then everyone plays locally.
**Watching + popups (Nov 5 2026).** A party friend in the room who has NOT joined sees the real shared match: while that field is
awake on their phone (`fieldRuntime.awake`, the dormant test; held 8 s after it sleeps) `matchLink` puts it in puppet mode with the
players on their slots (no controls, no In frames) and sends `C.Match Watch [19, 4, field]` (-1 = stop, debounced 2 s; one watched
field per member); the relay forwards that field's Snaps to its watchers too and tells the owner `S.Match Watch [40, 4, field, n]`,
so an owner alone on the field snapshots only while someone watches. The match ending (empty roster) or the field sleeping puts the
local sim back. Each Snap now ends with one packed value per listed human (`matchNet SNAP_EVENTS`: trick / shot / slip serials mod 8,
trick kind + side, power, aimed; 4 numbers a human, 11v11 rotates 10 a frame), so the trick word, "Power shot!", "Slipped away!" and
the trick move play on every phone; older readers stop after the targets. The keeper's hands pose follows the Snap's hands flag.
Slow motion stays off on shared fields. Joined matches also hide the townsfolk name tag over the pitch (Lua above the beach court).
Heat: a watcher pays the puppet lerp (no AI step) only while the field is awake; the relay sends no extra frames otherwise.
**Open / next.** True own-slot prediction with reconcile (today: newest frame + velocity, ~150-300 ms kick latency for friends;
validate on two real phones); owner migration resumes from the last snapshot (a 110 ms rewind of the ball); real 2-phone test and
heat check (watching included).

### 11v11 rollout: Eleven Park, the ADULT-tuned format (Nov 5 2026)
**What changed.** `LIVE_JOIN_FORMATS['11v11']` is enabled (11 humans a side, keeper included, `humanSpeedCap` null). Eleven Park
(the only 11v11 pitch, `VENUES` id `11v11`, x 135 z 100) shows Learn + Play on its pitch bar (`FieldPathCard` `data-live-bar`; the
11v11 lesson path exists, so Learn shows until the path is done, then Play only). The picker reads **Cyan / Orange** (its bibs,
`TEAM_NAMES` in `liveJoinRuntime.ts`), the dropdown lists all 11 slots (gk lb lcb rcb rb lcm cm rcm lw st rw), Goalkeeper first.
**Adult tuning (owner, Nov 5 2026: 11v11 is for adults, not kids).** The other formats keep every kid help unchanged. On the 11v11
the human runs at the full-size pace and AI chasers on a human carrier run at full speed (`MatchSim.humanChaseMul` 1; kids × 0.82).
The only pace limit is the pose relay: the kids' `SPRINT_BOOST` 1.42 would sprint 9.82 m/s, over the relay's walk check
(`MAX_SPEED_MS` 6.29 × 1.5 = 9.44), so `MatchSim.humanSprintBoost` is 1.3 there (a real adult sprint). Tackle reach, the
anti-tackle guard and the pass help stay as on the 9v9 (all in sim units, so they already scale with the pitch). Pass, long-ball
and shot pace are in sim units too, so they scale with the 100 m pitch: nothing extra was needed for range.
Measured (human, live speed 0.32; 9v9 → 11v11): run 4.82 → 6.91 m/s (6.93 % of the pitch length per s on both), sprint 6.85 →
8.99 m/s (was 9.82 uncapped), dribble 4.37 → 6.27 m/s, full-charge shot 32.4 → 46.5 m/s (47 % of the length per s on both), ground
pass full charge rolls ≤ 68 m of 69.5 / ≤ 61 m of 99.8 (the long ball covers the rest: 18-45 m lofted). Keeper box 22.2 × 12.1 m
(inside the 40.3 × 16.5 m area). Aim marks land within 0.05 m on the 11v11.
**Camera.** Wide on a pitch over 80 m may pull back to 150 m (the 100 m pitch needs ~145 m to keep both goal lines in frame; the
95 m cap stays for every smaller pitch); Side, Behind you and Close fit unchanged.
**Multiplayer.** A 22-player + 2-human 11v11 snapshot is 306 B of the 512 B client frame (85 numbers). With more than 14 humans
(a big party) the frame would pass `MATCH_SNAP_MAX` 120 (the 9v9 past 17), so `encodeSnap` now writes as many humans' pass targets
as fit and rotates the rest by seq (a puppet keeps a missing human's last targets): 22 humans = 121 numbers, 417 B
(`tests/join-live-mp.cjs`, `SNAP_MAX_LEN` = `MATCH_SNAP_MAX` + 3 checked).
**AI-only determinism.** All changes are human-only fields (`humanChaseMul` is read only with a human carrier, `humanSprintBoost`
only for a human): `tests/fixtures/live-match-summary.json` unchanged. **Heat.** Two number fields; no allocations, no new work for
AI-only matches. Tests: `tests/join-live-game.cjs` (the futsal + 9v9 section now loops 11v11 too: slots, pick, control, pass /
shoot / rejoin + goal / tackle / call / trick / press, keeper, aim marks, pace vs relay, chaser pace, camera fit, AI fixture).
### Pace ladder: the 11v11 speed of play on futsal, 9v9 and beach (Nov 5 2026)
**Owner ask.** The 11v11's speed of play and ball movement (full-speed chasers, sprint boost 1.3, pace that scales with the
pitch) on the other adult-paced formats, as a ladder of the 11v11 human (run 6.91 m/s, sprint 8.99, dribble 6.27, shot 46.5):
9v9 90 %, futsal 80 %, beach 70 % (sand). **7v7 keeps the kid tuning exactly** (chasers × 0.82, SPRINT_BOOST 1.42, pace 1).
**How.** Two human-only `MatchSim` fields set per format in the constructor: `humanPace` (the human's top speed: run, dribble,
sprint, jockey; and every opponent chasing a human carrier, with `humanChaseMul` 1, so chasers stay level with him as on the
11v11) and `humanBallPace` (a human's ground pass, lifted pass, long ball and shot). 9v9 1.29 / 1.29, futsal 1.40 / 1.075, beach
1.39 / 1.08; all three `humanSprintBoost` 1.3, `humanChaseMul` 1. Staying on small pitches: futsal ground passes still sit under
`humanPassCap` 1.6; the 9v9 gets `humanPassCap` 1.95 (= 1.3 × PASS_POWER_MAX, the old full charge: a tap is quicker, the full
charge rolls no further than before, ≤ 68 m of 69.5); a human lifted pass or long ball that leaves quicker than the AI's pace
lands soft via `landCap` (now also on the long ball into space). Roll, spin and kick sounds read the real ball speed, so they
scale on their own. Pass assist, tackle ease, AI tackles on a human 1/3, aim marks and slow motion are unchanged on every format.
Measured (human, before → after, m/s; tap/full = ground pass in the test layout, long = long-ball launch):

| format | run | sprint | dribble | shot (full) | pass tap / full | long ball |
|---|---|---|---|---|---|---|
| 7v7 (unchanged) | 3.62 | 5.14 | 3.19 | 24.4 | 14.6 / 21.9 | 14.5 |
| futsal (80 %) | 3.95 → 5.53 | 5.61 → 7.19 | 3.65 → 5.09 | 34.6 → 37.2 | 32.0 / 32.3 → 32.3 / 32.3 (cap) | 15.8 → 17.0 |
| 9v9 (90 %) | 4.82 → 6.22 | 6.85 → 8.08 | 4.37 → 5.64 | 32.4 → 41.9 | 32.0 / 48.0 → 41.2 / 48.0 | 19.3 → 24.9 |
| beach (70 %) | 3.48 → 4.84 | 4.94 → 6.29 | 3.20 → 4.45 | 30.2 → 32.7 | 15.0 / 22.4 → 16.1 / 24.2 | 15.0 → 16.2 |
| 11v11 (reference) | 6.91 | 8.99 | 6.27 | 46.5 | 28.5 / 42.7 | 27.7 |

Every sprint stays under the pose relay (`MAX_SPEED_MS` 6.29 × 1.5 = 9.44). No long ball left the court (4 seeds each).
**AI-only determinism.** Both fields are read only for a human or with a human carrier: `tests/fixtures/live-match-summary.json`
unchanged (not regenerated). **Heat.** Two number fields and a multiply; no allocations, nothing new for AI-only matches.
Tests: `tests/join-live-game.cjs` pins the ladder (futsal + 9v9 pace, a new beach pace block, chaser + sprint per format, the 7v7
kid values, the 9v9 pass cap, the beach shot ×1.2 × 1.08).

### Analytics (Nov 5 2026)

Admin "Live matches" tab: per format pitch visits, joins, join rate, players (tab sessions), matches per player, minutes,
average / median match length, longest band, friends on the match and how matches ended. Events in
`lib/analytics/liveMatchEvents.ts` (see `docs/analytics-roadmap.md` "Live matches"): the runtime raises `api.onMatch`
(`{type:'join',format,role,others}`, `{type:'others',others}`, `{type:'leave',reason,others}`) at the join callback, on
`friendsChanged()` and on `ev==='leave'` (reason `leave` for Leave / Esc / a refused spot, `forced` when Town pulls the player
off); Town binds it to `liveMatch.on`, counts a pitch visit when a `data-live-bar` bar goes hidden → shown, and books a match
still open at pagehide (`watchLiveMatchEnd`). Transitions only: no per-frame work, one visibilitychange listener while joined.

### Quick goal reset (owner, Nov 5 2026)
Owner: "once a goal is scored have the ball fade and show up in the center so the game can quickly be restarted… the same blue
animation for loading the player for the ball." Human matches only (any match with a joined human, all 5 formats); AI-only matches
keep the fetch-and-carry kick-off (`tests/fixtures/live-match-summary.json` byte-identical).
- Sim (`matchSim.ts` `GOAL_RESET`, real seconds): the celebration is 1.4 s (was 1.8 SIM s = 5.6 real s at the 0.32 live speed, then
  a fetch from the net and a carry: 15–24 real s goal → kick-off before). `goalReset.hidden` 0.45 s after the goal, then on the
  hold's end the ball lands on the centre spot (`goalReset.serial++`) and `stageQuickKickoff` stages a `quick` kick-off: the
  conceding outfielder nearest the spot (picked when the goal goes in, so he walks there during the celebration; a human too: the
  AI walks him, then the ball is his for Pass / Forward) takes it after a 0.75 s beat, the both-halves check waits at most 0.45 s.
  Now ~2.7 real s goal → kick-off on every format. The "Restart: get ready" bar reads `isRestart`, so it clears as it is taken.
  Throw-ins, goal kicks, corners, beach period / full-time kick-offs and penalties are unchanged.
- View (`lib/town/ballReset.ts`, one per pitch): fade out over 0.35 s (opacity + a slight shrink on a per-pitch material clone made
  on the first reset), then the character arrival (`lib/graphics/characterArrival.ts`: same rings, beam, sparks, materials and
  0.12 → 1 pop) at 0.6 × scale over 1.1 s. Reduced motion: a plain fade out / in. The character arrival has no sound, so neither
  does this. Transform / opacity only, no per-frame allocation.
- Multiplayer (`matchNet.ts`): `SNAP_FLAG.ballHidden` (128) and the serial mod 4 at bits 8–9 of the flags number; no extra number
  in the frame, an older reader masks them away. The puppet snaps the ball to the spot on landing (no slide across the pitch).
- Tests: `tests/join-live-game.cjs` "quick goal reset" (5 formats, taker, human taker passes at once, AI-only path + fixture),
  `tests/join-live-mp.cjs` (the friend fades and lands it once, frame length unchanged).

### Tackle assist + 7v7 pace tests (owner, Nov 5 2026: "assist with the tackles … get the ball back")
Humans only (every rng draw and branch is behind a human check; AI-only matches and `tests/fixtures/live-match-summary.json` unchanged). Constants: `TACKLE_ASSIST` in `lib/town/match/humanInputs.ts`; code in `MatchSim.ballLogicStep` (human tackle), `pokeAway`, `applyHumanTargets`, the loose-ball claim loop.
- **Lunge (magnetism):** Tackle pressed with the carrier within `assistR` 24 units (reach is still 10.6) or while he is still protected: the human runs straight at the carrier's next step at ×1.3 pace for up to 1.2 real s, overriding stick and jockey, with the press kept armed until he is in reach. The lunge ends if the carrier gets 1.3 × assistR away (outrun: the AI beat him).
- **Front / side:** the carrier's heading (or his attacking direction when standing) against carrier → tackler, cos ≥ -0.45: a clean win at 95 %; a failed roll **pokes the ball loose** toward the tackler (±35°, 41–60 u/s, carrier barred) instead of a miss. From behind: 75 %, a miss costs 0.15 real s (was 0.35). No fouls or cards for the human (the sim has none).
- **Get it back:** an AI tackle on a human opens a 2.5 real s window: his next tackle wins at 97 % and ignores the winner's 0.55 s protection ("Got it back!").
- **Loose balls:** a human outfielder's claim reach is +3.5 units (counted closer in the nearest pick), and a loose ground ball within 20 units pulls him onto it when the stick points at it (cos ≥ 0.55), or within 9 units when idle.
- **Measured** (scripted single tap within 8–20 units from front / side / behind, 40 seeds, before → after): 7v7 86 → 95 %, futsal 88 → 98 %, 9v9 73 → 97 %, 11v11 75 → 98 %, beach 82 → 98 %. Get it back (tapped at 0.2 and 0.5 s after the loss) 22–36/40 → 40/40. Heat: no new per-frame allocation (the lunge / magnet targets replace the stick target object the same frame).
- **Marker flicker fix:** a pass target found by the loose fallback (wide cone / no aim) was scored in the strict cone for hysteresis, so it counted as invalid every frame and the marker flipped between fallback picks. Exposed by the faster 7v7 human running past all his teammates in 1 s; `scoreAtTier` now scores the shown target in the same tier (0 → 1 flip in the test, with or without the wobble).
- **7v7 pace test pins** updated to `humanPace` 1.72 / `humanBallPace` 1.5 / sprint ×1.3 / chasers ×1 (pass pace ceiling × humanBallPace, sprint ratio ≥ 1.27, beach shot ratio over the 7v7 human's ×1.5; the human keeper "caught without a press" trial now has an idle stick, since a held stick runs the faster keeper off the line).

### Goal replays (owner, Nov 5 2026: "do the replays for scores")
- **What:** in a live match I am on (7v7, futsal, 9v9, 11v11, beach; solo, my match with friends, or a friend's match), every goal is shown again: after the ball-flies-in beat (`GOAL_REPLAY.delay` 0.4 s, before the scored ball fades) the last 1.7 match s up to 0.3 s after the goal play at 0.55× (~3.1 s) from the TV **Side** camera (`liveJoinCamera` `joinCamFrame('side')` on the replayed ball, the scoring side attacking left → right), with a **REPLAY** tag + **Skip** under the score bar (the trick word's spot). A tap anywhere, any key or Skip ends it (not in its first 0.15 s: that tap is the shot). The lesson: the build-up — see the pass and the space that made the goal.
- **Recording** (`lib/town/goalReplay.ts`): one preallocated `Float32Array` ring per field (≈4.2 s at 18 Hz: ball x/y/vx/vy, rendered height, owner, lofted, shot offset; each player x/y/vx/vy/kick — the same fields a friend's puppet gets from `matchNet` snapshots), filled by `fieldRuntime` only on the field I am on, so friends' matches record from their snapshots. AI-only matches never record (fixture unchanged).
- **Playback:** the field runtime stashes the live state, writes the interpolated replay frame into the sim, draws the field (rigs at `dt × rate`: true slow motion), then restores the live state before anything else reads it (the owner's `encodeSnap`, the HUD score, the AI). The quick-reset view is paused (`ballReset.show`) while it plays and carries on after.
- **Solo:** the sim holds (the field clock is not run) and the quick goal reset continues exactly where it paused. **Shared** (a friend runs the match or plays on mine): the sim never holds, nothing is sent (protocol, relay and snapshots unchanged; a test checks the owner's snapshots are byte-identical to a phone without replays); the replay is shorter (1.1 match s at 0.7×, ≤ 1.6 s) and cuts back at the live kick-off. **Reduced motion:** real speed, 1.2 s, the camera cuts instead of easing.
- **Setting:** Island settings → Live matches → **Goal replays** (default on, `localStorage fi2-goal-replays-v1`).
- **Heat:** no allocation after the ring is made, no extra draw calls, render targets or passes; one small copy at 18 Hz while joined.
- **Tests:** `tests/join-live-game.cjs` (ring fills, all 5 formats solo / skip / shared / off, live state + score untouched, quick reset still happens), `tests/join-live-mp.cjs` (owner + friend replay locally, owner snapshots unchanged, friend's replay over by the kick-off). Not checked on a real phone or in a browser yet.
- **Replay camera + polish (Nov 5 2026, after a screenshot review: on a 390x844 phone the old side camera showed a tilted crowd mid-pitch, the goal cut
  off at the edge, the ball a dot, and the live GOAL! card still up 1.2 s into the replay on desktop).**
  - **Camera** (`liveJoinCamera.ts replayCamFrame`, driven by `liveJoinRuntime replayCam`): a broadcast replay angle from behind the scorer on the TV
    side, turned 22° off the attack axis on a portrait phone (goal top-right) up to 58° on a wide screen (goal on the right), 36°-28° down; fixed for
    the whole replay so it never swings. The eye backs off just far enough (closed-form fit per point in the camera's axes, HUD bands kept clear)
    that both posts and the bar, the back of the net, the ball and (before the shot) the shooter are in frame. The finish (after the shot, at least
    0.5 s in, or the last ~1.1 s) eases to goal + ball only, nearer (`repTight`); eye and look follow at 1 − e^(−3.2 dt). Reduced motion / calm:
    two held shots (build-up, finish), cut, no easing. Per goal side and per venue from `liveWorldX/Z/Yaw` + `goalWidth/Height` + elevation, so the
    quarter-turned beach court and the raised futsal roof frame the same way.
  - **Scorer + ball:** `goalReplay` finds the shooter (the last owner before the goal inside the clip: `shotT`, `shooterX/Y` at the playhead).
    The existing compass marker rings him (scoring side's colour, chevron at the goal); once the ball leaves his feet the existing Pass ring + halo
    sit under the ball. One ring at a time, reused meshes (no new draw calls), transform / opacity only; my bib colour comes back after.
  - **Overlays:** while it plays the field's GOAL! card, its light burst and the goal-mouth rings are hidden (`matchEffects.quiet()`, which also ends
    that celebration so it does not pop back after the replay); the trick pop, tip, goal badge, aim marks, Pass / Forward markers and the head pin
    are off; the action buttons fade (opacity, taps off: a tap anywhere skips) and the stick fades (inline opacity: it is Town's). All back after.
    Skip: 72x44 px (the 44 px min-height holds; same pill as before).
  - **Checked:** `tests/join-live-game.cjs` now plays a natural goal per format (I dribble in from halfway and shoot, keeper drawn away): the shooter is
    found and is me; every replay frame's camera target holds the ball + the whole goal mouth at 390x844, 844x390 and 1280x800 (worst |ndc| ≈ 0.87);
    the eased portrait camera keeps the ball on screen (≤ 0.59) and ends with the goal mouth in frame; eye 11-48 m. Headless Chrome screenshots
    (natural shot, mid-replay): 9v9 phone + desktop, beach + futsal phone. Still open: on a portrait phone the shooter sits low (≈ 75% down) with
    empty pitch between him and the goal early in the build-up; the keeper was drawn away in the test goals, so a goal past a diving keeper is
    unchecked; not seen on a real phone.

### Phone tuning pass (Nov 5 2026: no physical phone; headless Chrome emulation + sim runs)
**Measured vs inferred.** Everything below is headless Chrome (touch, DPR 3, iPhone safe-area insets through CDP
`Emulation.setSafeAreaInsetsOverride`, 4x CPU throttle) or the node sim. None of it is iPhone heat or touch feel: those stay real-phone questions.
- **Layout** (390x844, 360x640, iPad 820x1180, desktop 1280x800; on the ball and on defense; 844x390 on a phone is the "Turn your phone upright" lock): every control >= 44 px (Pass 88,
  the arc 58, camera / Leave 44), inside the insets (portrait top row at 63 = 47 + 16, Pass bottom 782 = 844 - 28 - 34; the HUD under the
  landscape lock also respects 47 px side insets), no overlaps, arc gaps >= 7.5 px. Press sits evenly between Stay and Sprint: 97.1 / 97.3 px centre to centre.
  **Fixed:** the trick / "Slipped away!" pop rendered at top 0-12 px, over the score bar: the runtime wrote its `--tip-top` in HUD-stack
  units but the pop sits outside the stack (offsetParent = the app). It is now measured from its own parent (`liveJoinRuntime.ts`
  dock block). The replay tag (`[data-join-replay]`, same line) gets the same stack-unit value and likely needs the same fix.
  Real-phone question: on 360-390 px portrait the joystick's rest ring ends 11 px left of Shoot (different thumbs, but close).
- **Perf** (iPhone 390x844 portrait, 4x CPU, production build, 20 s with two goal resets): 60 fps on all five formats, frame p50
  15-19 ms, p95 25-27 ms, 0-2 frames > 34 ms per 20 s (worst 52 ms, beach, in the first goal window), goal windows max 25-33 ms
  otherwise; draw calls 83-121, 137-216k triangles; 58-150 layouts and 181-257 style recalcs per 20 s (51-89 ms), no layout thrash.
  (A first run in landscape measured the portrait-lock screen, ~60 style recalcs/s from it; discarded.) Heap sampling (portrait):
  a joined 7v7 allocates 14.3 MB/s (the island outside a match 16.1 MB/s); top allocators the character rig update + its per-leg
  closure in `lib/graphics/player.ts` (2.8 + 1.6 MB/s, ~75 KB per frame across the rigs), then `obstacleGrid.query` (new Set + spread per call, 0.6 MB/s); nothing in the match HUD or sim stands out. The bar's `width` transition
  (`.chip`, 0.35 s on a message) is kept: it runs a few times a minute and the whole 20 s run has 58-150 layouts (6-24 ms).
- **Feel** (sim, real-time steps at the live speed, a scripted human mid chasing the ball and tapping Tackle within 14 units; 10 seeds
  x 3 min per format; "won" = his side has it within 1.5 s). TACKLE_ASSIST unchanged after this pass:

| format | won per tap (assist / old values) | in-reach clean win | possession gold, human / AI-only | goals/min gold-blue (AI-only) |
|---|---|---|---|---|
| 7v7 | 35 % / 7 % | 86 % | 39 / 54 % | 0.47-0.10 (0.13-0.23) |
| futsal | 36 % / 13 % | 79 % | 43 / 50 % | 1.23-0.30 (0.77-0.33) |
| 9v9 | 39 % / 10 % | 85 % | 47 / 51 % | 0.50-0.23 (0.20-0.17) |
| 11v11 | 27 % / 3 % | 72 % | 68 / 54 % | 0.23-0.13 (0.20-0.10) |
| beach | 43 % / 18 % | 85 % | 43 / 52 % | 0.60-0.03 (0.23-0.30) |

  Clearly helpful (3-9x the old values) and well under ~70 % per tap on the 9v9 / 11v11; not an auto-win at match level (his side's
  possession does not rise over the AI-only match). Once in reach from the front it is close to certain by design (95 % or a poke-away).
  Pace vs the pose governor (9.34 m/s + 1 m, relay 9.44 + 2 m), sprint held + lunge, 12 seeds: sprint 7v7 8.09, futsal 7.34, 9v9 8.08,
  11v11 8.98, beach 6.42 m/s; peak over 0.1 s 9.32 m/s (7v7 lunge); no 1 s window over the governor. 7v7 still runs at the 9v9 pace.
- **Friends / latency** (owner sim -> encodeSnap every 83 ms -> SnapBuffer on a puppet, 4 x 2 min per format, two scripted humans):
  goals, quick-reset landings and kick rises match the owner exactly at 0, 150, 300 ms and 150-300 ms (no double goal / reset / kick).
  Fixed latency or +-20 ms jitter: the ball is smooth (puppet step <= the owner's). Jitter is the problem, not latency: with in-order
  (WebSocket) delivery and 100-150 ms spread the puppet ball steps up to 2x the owner's per-frame move (frames bunch; `INTERP_MS` 110
  and arrival-time stamps). Fix later if friends see it: stamp frames by seq x SNAP_GAP_MS with an adaptive delay (not a tiny change).

### Easier controls (owner, Nov 5 2026: kids first; A, B, C approved, auto-switching on defence REJECTED: you are always your slot)
- **Where:** `lib/town/liveControls.ts` (pure: `joinModes`, `tackleNear`, `stickSprint`, `runEffort`, `tapShotCorner`, the setting store), used by `lib/town/liveJoinRuntime.ts`; `HumanView` gained `carrierD/X/Z`, `simX`, `keeperX` (view only, no sim change: the AI-only fixture is byte-identical).
- **A. Only the buttons that make sense now** (at most three): on the ball **Pass** (88 px, corner) + **Shoot** (68 px) in the shooting zone, which becomes **Forward** (the through ball, J/K) out of it (settled for 0.2 s so it never flickers; latched at the press) + a small **Trick** (52 px). The separate Forward button is gone. Defending: ONE big button, **Tackle** within the tackle assist's lunge reach (`TACKLE_ASSIST.assistR`, hysteresis ×1.15), **Press** further (pink): a tap starts the press together, and held you run at the carrier (steered at him while the stick is idle, sprinting) and it tackles once he is in reach. **Stay** stays as the small secondary (52 px, Trick's slot): hold = jockey is the "stay goal-side, don't dive in" lesson, and the small slot keeps the rule "big = the main action, small = the careful one". A teammate has it: **Call** only; loose: **Go!**; keepers unchanged (Save / Throw + Kick). Keys unchanged (P still presses).
- **Layout:** one 45° arc round Pass's centre: small slot 186° r 108, Shoot 141° r 118, Sprint 96° r 120 (only with the setting off); ≥ 8 px apart in every state. Each button is placed by `--x/--y` from the cluster's outer edge, so **Flip controls** mirrors it exactly (cluster 14 px from the left edge). The stick's rest ring now has 27 px to the nearest button at 390 px (was 11), 24+ at 360-375 (test).
- **B. Push the stick to sprint** (Island settings → Live matches, default on, `localStorage fi2-stick-sprint-v1`, a device preference): the RAW touch-stick deflection ≥ 0.95 (knob pinned on the ring) sprints, < 0.88 stops (no flicker at the rim); the full run pace now comes at 0.85 (`runEffort`), so running flat out below the ring never sprints. The ring fills with a solid mint band (`data-sprint`, opacity + transform, written on change). On: no Sprint button; off: today's layout. Shift and the keyboard unchanged; sprint speeds and the pose governor unchanged (same `SPRINT_BOOST`).
- **C. Tap to shoot:** released before `SHOT_AIM.minHoldMs` (0.18 s) the shot is aimed at the LOW corner away from the keeper (keeper on the middle or none: the far post), sent through the frame's existing `aimX/aimH` (multiplayer: no protocol / relay change; a friend's phone reads the keeper from its mirrored sim). A hold keeps the power ring, the corner marks + drag aim, the slow motion.
- **Tests:** `tests/join-live-game.cjs` "easier controls" (states incl. keeper / restart, Tackle vs Press in the sim on all 5 formats 8/8, sprint thresholds + trembling-thumb hysteresis + setting, tap shot away from the keeper on all 5, net frame carries the aim, geometry + mirror + stick room, fixture). Screenshots (dev server, headless Chrome, 390x844 + 1280x800): ball, defence (sprint ring set by the script), mirrored. Not tried on a real phone; touch feel of the 0.95 ring and the Press chase are real-phone questions.

### Kick effects (owner, Nov 5 2026: "improve the tackling, passing, shooting mechanics. make the tricks slow motion even better along with the shot slow motion. add trails, effects, and make this feel more premium")

Approved defaults: team-coloured trails (the kicker's bib colour, lifted toward white), purple kept for lofted long balls, flame kept for the power shot, a moderate flash. All five formats, solo and with friends. The sim, the protocol and the AI fixture are untouched: every effect is drawn from the touch ring or the drawn ball.

- **One source for every phone** (`lib/town/kickFx.ts`). Effects read `MatchSim.touches`. A friend's puppet sim never steps, so `lib/town/match/puppetTouches.ts` writes the same events into the puppet's own ring from what the snapshots already carry: owner changes, ball velocity, the lofted flag and the score. A kick is owner → nobody at 45 u/s or more; a tackle is a change of side, or a slow knock-loose followed by a pickup; a goal is a score change. Choreo slides and stumbles, the combos view's block and poke tackles, goal celebrations and the ball sounds now play on friends' screens too. Over 60 s of play, a puppet sees 13-23 kicks against the owner's 13-24 (tests/join-live-mp.cjs).
- **Shooting / passing**: the trail (`lib/graphics/ballEffects.ts`, extended: `shape.ribbon` swaps the line for a camera-facing additive ribbon over the same 20 points, `shape.ghosts` caps the ghost balls) scales with the ball's live speed. A soft pass gets a thin streak with 2-4 ghosts; a hard shot gets the full ribbon with up to 14. There is a flare ring at the foot (plus a dust ring on hard strikes). A lofted ball shows a pulsing landing ring where it will come down: a ballistic estimate from the drawn ball (g 13, smoothed), so it also works on puppets and in replays. The receiver gets a "got it" ring that closes on his feet. A goal billows the existing net (`propReactions.hit`, a vertex sway, no new mesh). A parry flashes at the ball so the keeper's dive reads.
- **Tackling**: a human's lunge starts with the rig's `plant` impulse (the wind-up dip), then choreo's slide / block / poke and the loser's stumble (now on puppets too). A clean win spawns an impact ring in the winner's colour, a dust ring and a sparkle, with a 70 ms hit pause (solo, `SLOW_MO.hitScale`) and a tiny camera shake when I am the winner or the loser. A poke-away gets one sharp small ring at the ball and a lighter shake. `TACKLE_ASSIST` is unchanged.
- **Slow motion** (`lib/town/slowMo.ts`): the trick and the shot ease in over 120 ms (no hard snap) and out over 180 ms, ending at exactly 1. A shot first freezes for 35 ms at contact. A hard shot of mine punches the camera in (`SLOW_MO.punch`) with a small decaying shake. A CSS vignette (`[data-join-vignette]`, opacity only, written in 20 cached steps) follows the slow motion. A short "time dips" cue plays (`islandSound.match('slow')`: a falling tone under a low-passed whoosh, a one-shot with no bus filter). Local only: `timeScale` stays 1 on a shared match, as before, while the camera and the vignette still play.
- **Sound** (`lib/town/liveBallSound.ts` → `islandSound.match`): a low thump under strikes of 13 m/s or more (scaled by power), a light tick on softer kicks, a thud on a clean tackle, a poke flick, and the net swish plus a crowd swell on a goal. Same tone / noise kit, modest gains, per-kind throttles.
- **Settings**: reduced motion (calm) = no trail, flares, shake, punch, hit pause or slow motion; only the still information rings (landing, got it). **Island settings → Live matches → Match effects: Full / Light** (`fi2-match-fx-v1`, a device key, default Full). Light keeps the thin ball line and the information rings and drops the ribbon, ghosts and flares.
- **Heat**: all the rings are ONE `InstancedMesh` (`lib/graphics/matchFxRings.ts`, a 12-slot pool, additive with soft vertex-colour bands, so a ring fades through its instance colour). That is one draw call while any ring lives and none at rest. The ribbon replaces the line (same draw count). Pending events sit in a fixed 8-slot ring, and nothing is allocated per frame. Measured in headless Chrome (dev server, phone 390×844 DPR 3, 4× CPU throttle, 20 s joined match, a scripted pass / shoot / tackle every 0.7 s, before = the same build with `window.__fi2FxOff`):

| | frame p50 / p95 (ms) | draw calls mean / max | effect objects drawn mean / max | heap growth |
|---|---|---|---|---|
| 9v9 before | 23.1 / 29.3 | 93.4 / 134 | 4.97 / 16 | 12.41 MB/s |
| 9v9 after | 22.5 / 28.9 | 94.1 / 123 | 2.98 / 7 | 12.33 MB/s |
| beach before | 21.7 / 28.1 | 81.6 / 109 | 5.17 / 16 | 10.23 MB/s |
| beach after | 17.7 / 28.5 | 80.8 / 108 | 3.64 / 17 | 10.29 MB/s |

  Fewer effect draws on average, because passes no longer show all 14 ghosts. The heap growth is the dev build's baseline and does not change. This is desktop emulation, not a measurement of iPhone heat.

### Match focus: the island holds still while you play (owner, Nov 5 2026: "make sure to pause everything else on the island while playing the game to not draw additional heat")

**Where:** `lib/town/matchFocus.ts` (one flag + the held dt), read in `components/Town.tsx` right after the fishing focus block; `lib/graphics/islandNpcs.ts` `setFocus({…,r:-1,still:true})`. The flag is `liveJoin.joined` (phase `joined` with a slot) and nothing else, so every exit clears it on the next frame: the Leave button, a forced leave (lesson / menu / ride), a friend-match drop (matchLink presses Leave), a failed join. Spectators are not joined and are not touched. `?matchfocus=0` turns it off for A/B runs. A debug `__fi2.teleport` while joined keeps you in the match (the match owns your position), so focus correctly stays on.

**Audit first (measured, not guessed).** Headless Chrome, 390x844 DPR 3, touch, 4x CPU throttle, production build, 20 s joined 9v9 and beach, a CPU profile (CDP Profiler) plus a timer wrapped round each `__fi2` system's per-frame method, plus a per-draw attribution (`renderBufferDirect` charged to its top-level scene root). The phone loop renders at its 30 fps cap. Cost outside the match, ms per rendered frame at 4x, ranked:

| # | system (not the match) | 9v9 | beach | note |
|---|---|---|---|---|
| 1 | townsfolk `islandNpcs.update` (158 people: distances, emote ages, routines, poses) | 0.57-0.65 | 0.53-0.65 | the only big one; also most of the rig allocation churn |
| 2 | island part of the render walk (matrix refresh 0.64, frustum projection 0.61, shadow traversal; includes the match) | within noise | within noise | off-screen units are already skipped by `viewGate`; skipping the frozen roots' matrix refresh measured inside run-to-run noise, so not done |
| 3 | street traffic | 0.05-0.09 | 0.05-0.09 | |
| 4 | ball hunt (coins), 1-2 draws | 0.04-0.06 | 0.05-0.06 | coins never count in a match |
| 5 | coach wall + volleyball groups | 0-0.04 | 0-0.01 | |
| 6 | open-sea whales / rays, Coral Cay sharks / mantas | 0.04 | 0.05 | already sleep far / off screen |
| 7 | fishing boats, beach finds, shore foam, dive preview, ferry, lighthouse, bugs, vending, summit | <=0.02 each | <=0.02 each | |
| - | not costs today | | | other matches already dormant (fieldRuntime heat pass 5: 4 of 5 asleep); remote avatars already range + frustum culled with a rig cap; 0 React HUD renders and 0 `setInterval`s in 10 s of play; no ambient loop runs on dry land (the water bed starts only in the sea); island music is one media element; the water clock is a uniform (0 CPU) and its shading costs the same moving or still |

Draws that are the island inside a joined 9v9 view (per frame): static chunks 37 + 5 shadow, townsfolk 4.8 + 1 shadow + the NPC shadow batch 3, clear-water window 5, cars 2.7 (shadow), jobs 3, coins 2, manhole covers 2. The rest is the pitch, the players' batch and the HUD markers.

**What it does.** Holds still, exactly where they are (nothing hidden, nobody teleports): every townsperson (one held pass so the name tag hides, then the update returns at once), traffic, the volleyball and coach-wall groups, the ferry, the lighthouse beam, sea life, bugs, Summit fruit trees and beach finds (the fishing focus `backgroundFrozen` gates, reused with `MATCH_FOCUS_LIVE` = only the matches live). The ball hunt sleeps (coins never count in a match). **Kept:** the match sim + render, matchNet / matchLink / presence pose sending and its governor, saves, analytics beats, match sound, the Leave flow, `characterArrival`, the goal replay, the water clock + lighting, shadows every frame (the players move: half-rate shadows would trail them), the pixel ratio and the heat governor. **Resume:** held systems never accumulate time; the first 3 frames after leaving take dt <= 1/30 s (`MATCH_FOCUS_RESUME_DT`), so a long leave frame (rig rebuild, arrival restart) is never one big catch-up step. No per-frame allocation.

**Heat proof** (same build, `?matchfocus=0` = before; three alternating 20 s runs each, mean; desktop Chrome emulation, not an iPhone):

| | rAF p50 / p95 (ms) | draw calls | triangles | heap growth | main-thread script / 20 s | profiled CPU busy |
|---|---|---|---|---|---|---|
| 9v9 before | 16.1 / 26.7 | 93 | 153k | 14.0 MB/s | 4671 ms | 29.6 % |
| 9v9 after | 14.9 / 25.7 | 84 | 145k | 10.9 MB/s | 4211 ms (-10 %) | 27.5 % |
| beach before | 15.5 / 25.9 | 80 | 214k | 10.3 MB/s | 4168 ms | 24.4 % |
| beach after | 16.0 / 24.7 | 79 | 216k | 8.9 MB/s | 3448 ms (-17 %) | 20.7 % |

Per system the held work is 0.7-0.85 ms of the ~7 ms the loop spends per rendered frame at 4x. Frame pacing does not move much because the phone loop is already capped at 30 fps; the saving is idle main-thread time (less heat), not more frames. Match-to-match play varies the match's own cost by +-15 %, which is why the runs alternate. **Leave check** (scripted, `__fi2`): beside the pitch 3-7 townsfolk moving, 11/11 cars, water clock +4 s per 4 s; joined: 0/158 townsfolk, 0/11 cars, sea life still, coins asleep, the water still animating; after Leave: 4-8 townsfolk moving again, 11/11 cars, beach-side sea life moving again, coins back, 1 resume clamp. Not tried on a real phone; real heat is a device question.

**Not paused, and why:** the water surface (no CPU cost; freezing would change the pitch-side look for nothing), shadows (the players move), the pixel ratio (pitch quality), the island music (one decoded stream; the owner's audio choice), matrix refresh of frozen units (no measurable gain), the clear-water window by the beach court (part of the beach view), daily play / explore checklist tickers (a comparison each frame).

**Tests:** `tests/join-live-game.cjs` "match focus": set on join / cleared on Leave, forced leave, disconnect and a failed join in all 5 formats, dt 0 while joined, the clamped resume dt, `?matchfocus=0`, Town's gates per system, kept systems (no half-rate shadows, no pixel ratio change, water / party / matchLink), the townsfolk `still` early return.

### Bot fill + teammates call for the ball (owner, Nov 5 2026: "the AI fills every other slot … make runs, call for the ball so passing feels like a team game")
**What already existed (audit).** Bot fill was mostly there from slice 1 / 2: a solo Start locks one slot and the AI plays every
other one (all 5 formats); `MatchSim.lockHuman` keeps the player's spot, role and the ball (a picked slot is never re-placed in
`fieldRuntime.joinMatch`), `releaseHuman` hands it back where he stands; the relay roster keeps one human per slot, first come
(the second picker steps off with "Ana just took that spot. Tap Play to pick another!"); the owner leaving hands the field to the
earliest remaining joiner (`matchLink`: "Your friend left: the match is on your phone now"), who plays on from the last snapshot
with a dropped ball (`leavePuppet`; host migration proper stays out of scope: safe, a ~110 ms rewind, nobody's ball). Off-ball
runs (`offBallRuns.pickOffBallRun`: in behind ×1.35 for a human carrier, check, width, space) and the two nearest supporters'
lane-clearing step (`supportOffset`) were in too.
**Gaps filled.** (1) A FRIEND leaving now hands the slot to the bot IN PLACE with the ball at his feet (`liveJoin.handBack(sim,
slot, null)` from `fieldRuntime.dropFriend` → `leaveMatch(…, inPlace)`); before, the slot player jumped to the touchline spot and
the ball was dropped. My own Leave keeps the old exit (ball on the grass, the NPC jogs back on). The touchline NPC of a friend's
slot hides as the bot takes over. (2) The Position dropdown reads **Bot** under every AI-held slot (`SLOT_BOT_NOTE`), a friend's
name under theirs, "Taken" for any other human. (3) **Calls:** while a human has the ball, the most open AI teammate (onside, a
clear lane ≥ 8 u, nobody within 14 u, 14-150 u away, level or ahead; a runner in behind scores higher; `offBallRuns.TEAM_CALL`)
CALLS: his arm goes up (choreo's existing `called` pose) and a ring pings out round his head (`joinMarkers.callPing`, bib-tinted,
opacity/scale only, +1 draw call per caller, at most 2) for 0.8 s, rests 0.7 s, calls again while still open; a closed lane ends it
at once. `MatchSim.updateCalls` runs on a 0.25 s think clock, only with a human carrier, pure geometry (no rng): a friend's
puppet runs the same call from the snapshot positions (`fieldRuntime` puppet branch), so no protocol or relay change. A caller also
keeps his lane open (the supporters' `supportOffset`). (4) **Assist:** `PASS_ASSIST.wCall` 16 on a caller in either pass mode,
so he wins a near tie (the 12-point marker hysteresis still holds a clearly better shown target; aim still dominates). (5) Two
human-pass fixes the harness found: a pass to a runner is led for the pace it really leaves at (`leadPoint(…, paceMul)`: the
base-pace lead put the zippier human ball in front of him too early), and a human's ground pass keep-out ends once the ball is
~30 u out (`ballFlight = min(0.16, 30 / speed)`): the flat 0.16 sim s let a short pass run past a teammate's feet before he was
allowed to take it (7v7: 0/6 short passes to an open teammate received before, 6/6 after). Both read only for a human passer.
**Measured** (scratchpad `team.cjs`, a scripted human mid carrying, passing on pressure / after 1.1 s, shooting in range; 3 min × 12
seeds, "aim" = stick toward goal / "tap" = no stick; before → after):

| format | pass completion aim | tap | gold poss (aim) | goals/min gold-blue (aim) | AI-only goals/min |
|---|---|---|---|---|---|
| 7v7 | 36 → 91 % | 30 → 95 % | 44 → 55 % | 0.42-0.11 → 1.17-0.03 | unchanged |
| futsal | 80 → 86 % | 84 → 91 % | 46 → 42 % | 1.08-0.17 → 1.22-0.17 | unchanged |
| 9v9 | 46 → 76 % | 55 → 89 % | 49 → 55 % | 0.47-0.19 → 0.78-0.19 | unchanged |
| 11v11 | 73 → 95 % | 82 → 98 % | 55 → 58 % | 0.33-0.08 → 0.31-0.28 | unchanged |
| beach | 55 → 84 % | 63 → 87 % | 38 → 43 % | 0.42-0.00 → 0.64-0.06 | unchanged |

Most of the gain is the two pass fixes (a received pass instead of one run past the receiver); calls alone moved completion
within noise and put ~10 % of passes on a caller (80-95 % of those completed). Kids' formats got easier (the 7v7 most: it had the
worst bug); the adult 11v11's scoring rate is unchanged (0.31 vs 0.33 a minute) and the AI still wins the ball back by tackles and
interceptions. AI-only matches never call and never read the pass fixes: `tests/fixtures/live-match-summary.json` unchanged (not
regenerated). **Heat:** a 0.25 s think over ≤ 11 teammates × ≤ 11 foes only while a human has the ball, a Set of existing ids and
a number per player (no allocation), two ring meshes created once with the markers. **Tests:** `tests/join-live-game.cjs` "bot fill +
calls" (solo start + bots in all 5, handover with / without the ball, no teleport, leave / re-join, Bot notes, calls within 1 s,
AI-only / AI carrier never call, the arm pose, assist tie to a caller, real-pace lead, short pass received in all 5, fixture);
`tests/join-live-mp.cjs` 4c (a friend takes the bot's slot on the ball and gives it back in place with the ball, the picker's
names + Bots on a third phone, re-join, two friends racing for one slot in the same frame, the owner leaving with two friends on,
calls on the friend's puppet, twin owners' snapshot bytes identical).

### Goalkeeper feel + body moves (owner, Nov 5 2026: "improve dive and save feel … make it unmistakable when you're the keeper"; "players get more freedom for moves")

**Audit (before).** A human keeper's Save dived to where the shot crossed his line and landed BEFORE the ball, whatever the timing
(`diveTime` clamp), with +3.5 units of stretch reach: a scripted kid pressing Save 0.2-0.5 s after any AI strike saved 83-100 % of
on-target shots in every format (9v9 89 %, 11v11 85 % at 0.35 s). The stick was ignored with a shot on, catch / parry was the AI's
20 % roll, there was no keeper indicator beyond the kit, the button said Save, and no save effect. Forward hidden, Throw / Kick and
the six-second hand-back (Law 12) worked and are unchanged.

**Keeper (sim: `HUMAN_KEEPER` in `lib/town/match/matchSim.ts`, humans only).**
- A real dive: a push-off of `diveLag` 0.12 real s (`readLag` 0.05 when the stick already leans the shot's way: he read it), then the
  flight at `diveSpeed` 30 sim units per real s × `diveBy` (futsal / beach 1.5, 7v7 0.55: the small courts' units are shorter). A late
  press on a corner is beaten; a timed one saves it. Tap Dive = the auto-dive to the shot's line (easy for kids); Dive with the stick
  pushed hard the OTHER way (≥ 0.6, ≥ 4 units off) dives the stick's way: a wrong guess is beaten. Smother and loose-ball dives as before.
- Catch vs parry by where the ball meets him (its path's distance off his body): within `catchR` 7 units he holds it, further he
  parries it wide ("Punched clear!"), a high one is tipped over. A full-stretch save is "big" (`saveBig`).
- AI shots at a human keeper: at least `cornerShare` 0.4 go for a corner, the one AWAY from him `awaySide` 70 % of the time when he
  is off centre (positioning is the lesson). AI-only matches: `cp === xg`, the side roll unchanged: the fixture is byte-identical.
- `HumanInput` gained `diveSerial / diveSide / saveSerial / saveKind / saveBig` (the view's pose, rings, sound, hit pause).

**Save rate** (`scratchpad/gk/keeper.cjs`: 10 seeds × 6 real min per format at live pace; the scripted keeper tracks the ball across
his line and taps Dive N s after each strike; on target = inside the posts, under the bar):

| on-target saved | 7v7 | futsal | 9v9 | 11v11 | beach |
|---|---|---|---|---|---|
| AI keeper (reference) | 72 % | 79 % | 52 % | 77 % | 86 % |
| before, react 0.2 / 0.35 / 0.5 s | 96 / 98 / 100 | 97 / 93 / 76 | 93 / 89 / 92 | 85 / 85 / 83 | 97 / 95 / 90 |
| after, never dives | 26 | 38 | 33 | 38 | 27 |
| **after, react 0.2 / 0.35 / 0.5 s** | 90 / 77 / 61 | 74 / 65 / 51 | 67 / **67** / 57 | 76 / **65** / 50 | 82 / 68 / 51 |

Default skill (a ~0.35 s reaction) lands 9v9 / 11v11 at 65-67 % (target 55-70 %); quick hands save more, a late dive concedes. 7v7
stays the easiest (77 %). Samples are 40-120 shots per cell: ±7 points of noise.

**Keeper indicator (view).** `lib/graphics/keeperMarkers.ts` (4 meshes built once; ≤ 4 draw calls only while you are the keeper, no
allocation per frame): a double ring in your bib colour (it replaces the outfield attack compass), a white glove badge over your head
(one sprite, a canvas drawn once), a soft green goal-mouth glow, and your dive-reach arc (save reach at full stretch + a quarter-second
dive) that fades in while an opponent can shoot. "You're the keeper / Dive at the shot, then throw it out" for 2.1 s under the score bar
on joining in goal and at each kick-off after a goal (`[data-join-keeper]`, opaque, transform / opacity only; a tip waits under it).
Buttons: **Dive** (green) turns **Catch** (cream) when the shot comes at his body (`liveBodyFx.fillMoveView` catchable; the same
press, the sim decides), **Throw** / **Kick** in his hands. One-time tips: "Tap Dive when they shoot. The stick picks a side." on
joining in goal; "Stick at a teammate, then Throw. Six seconds max in your hands!" the first time he holds it (Law 12). The picker
shows a keeper line under the position when Goalkeeper is picked (`[data-join-pick-keeper]`).

**Save feel (view, `lib/town/liveBodyFx.ts` + `kickFx.burst`).** The dive plays choreo's full-stretch dive pose at the press (and on
friends' screens); a catch closes a "got it" ring on the hands, a parry / tip flashes a white burst, a big save adds the dust ring +
sparkle, a glove thud and the crowd swell; the word ("Great catch!", "Punched clear!", "Tipped over!", "What a save!"); a big save of
mine: a 0.11 s hit pause, a short slow motion (0.35× for 0.32 s, small zoom) and a tiny shake (solo; a shared match stays 1×).

**Body moves (sim: `TRICK_KINDS`, `TRICK_MOVES`, `TRICK_BEAT`, `HUMAN_BODY` in `lib/town/match/humanInputs.ts`).** No new button: the
Trick reads the stick against the ATTACKING direction (a run-relative read always came out "forward": the run follows the stick within
a step): stick back = **drag-back**, stick left / right = **spin turn** (roulette) that way, Sprint held = **flick-up** (choreo's
flickUp with the ball lift), otherwise **step-over** / **La Croqueta** alternate. Five moves. Each beats the NEAREST defender within
`TRICK.radius` with its own chance (step-over / croqueta 0.6, drag-back 0.55, spin 0.7, flick 0.65): he stumbles for 0.4 real s at
0.1× pace (choreo stumble + a ring at his feet); the others near him are bamboozled as before. Measured (`scratchpad/gk/body.cjs`, 40
runs at a defender 9 units ahead, separation after 1.2 s): no move 0.4-1.1 m, sprint only 1.7-2.4 m, a move 2.3-6.1 m; beaten 40-78 %
(the in-game test: 20-31 of 40 per format). Speed cap: the move's burst never passes his own full sprint (it used to: sprint + Trick
on the 11v11 reached 9.6 m/s); sprint + flick-up peaks at 9.14 m/s (11v11), under the 9.34 client / 9.44 server pose limit.
- **Shield:** a human carrier with an opponent within 8 units BEHIND him (back turned) holds him off: AI tackles × 0.5, the authored
  shield pose plays. **Shoulder:** hold Stay with the stick at an AI carrier within 6.5 units: 40 % knocks it loose (the poke-away),
  else he loses a step (0.3 s); 1.6 s cooldown, the shoulderCharge pose. **Momentum:** a sharp cut (heading past cos 0.6 against
  ~0.25 s ago, ≥ 30 u/s) keeps it tight for 0.35 s (AI tackles × 0.75, the ball drawn 35 % closer, the rig's plant dip); at full
  sprint it runs looser (× 1.25, the ball drawn further ahead). **Lean:** humans bank × 1.6 into turns (up to 0.28 rad) and a little
  more into the sprint (`PlayerMotion.leanBoost`). `TACKLE_ASSIST` is unchanged. Headers / volleys: the existing jump for any lofted
  ball's target already plays for humans; nothing new added.
- Reduced motion and Match effects: Light trim the rings (kickFx levels) and the hit pause / slow motion; the move, the stumble and the
  poses always play.

**Multiplayer.** No protocol or relay change. The snapshot carries ONE more packed number per listed human after the popup values
(`matchNet.SNAP_BODY`: the trick kind's high bit (flick = 4), beat, dive serial + side, save serial + kind + big, shoulder serial,
shield), every number far inside the relay's ±100 000 check; an older reader stops before it, an older owner's frame bumps nothing (a
flick then reads as a step-over). A friend's screen names the beaten defender (its nearest opponent outfielder) and the shouldered
carrier from its own puppet. Cost: 5 numbers a human instead of 4, so a big party rotates sooner (11v11 lists 8 humans a frame, was
10; 9v9 11, was 13); the 11v11 frame stays 314 B of 512.

**Tests.** `tests/join-live-game.cjs` 9b (dive semantics, push-off timing, dive speed, wrong way, corner) and "keeper feel + body
moves" (all 5 formats: indicator data, catch / parry / tip, Dive saves the corner, wrong way beaten, throw-out, six seconds; moves by
stick on all 5, stumble rate + length, speed cap, shield, shoulder, cut, the SNAP_BODY round trip, the view's poses with / without
reduced motion, HUD wiring, mirrored controls, fixture). `tests/join-live-mp.cjs` (a real minute per format with a human keeper and a
tricking friend: dives 20/20, saves 10/10, tricks 29-30/29-30 with their kinds, beaten defenders and shoulders equal on both phones;
an older owner's frame). `npx tsc --noEmit` clean, `npm run test:quiet` 379/379.

**Screenshots** (dev server, headless Chrome, 390×844 DPR 3 + 1280×800; scripted shot + Space / the Trick press):
`scratchpad/gk/keeper-*.png` (banner, glove badge over the "you" pin, the double ring, the green goal-mouth glow + reach arc, the
keeper mid-dive, Dive / Catch) and `move-*.png` (the spin turn at ~25 % with "Spin turn! Got past!"). Seen: the moves read small on the
phone at the default camera; island prompts ("Talk to …", the explore "Something shimmers" card) can still show over a joined match
(pre-existing, not touched). Not tried on a real phone: dive timing by touch and the glow's contrast in sunlight are device questions.

### QA round 1 (multiplayer, Nov 5 2026: node harness over the real RoomCore, no phones)
**Checked** (`tests/join-live-mp.cjs` + scratchpad probes, all 5 formats): a friend joins a bot slot with / without the ball, the
keeper slot, the owner's side or the other one, mid-play, during the goal hold (score mirrored, one reset landing, the owner's kick-off on
time); two friends racing one slot; a friend's Leave and an abrupt tab close (the bot takes over in place with the ball, the picker on a
third phone reads Bot at once); the owner leaving with two friends on (earliest joiner runs it, score kept, one sim, no stall); everyone
leaving (watchers back to their own match); keeper dives / saves, body moves, kick effects and calls once per event on friends; owner
snapshot bytes identical with and without replays / effects; AI-only fixture unchanged.
**Fixed.**
- **Owner migration froze the friends who stayed** (`matchLink.ts`, `fieldRuntime.resetSnaps`): the new owner's snapshot seq starts at
  its own count, so a friend's buffer dropped every frame until it passed the old owner's (20 s of play = 20 s frozen; an hour = an
  hour). A roster with a new owner now clears the puppet's buffer (seq, popup and reset serials: no phantom "trick!" / reset arrival).
- **Jitter** (`matchNet.ts` `JITTER`, `matchLink` send schedule): frames were stamped on arrival, so frames bunched behind a slow one
  made the friend's ball step 2x. The owner now sends on a fixed 83 ms schedule and its seq counts skipped gaps (seq × 83 ms = its
  clock); a friend stamps frames with that plus the lower envelope of arrival − seq × 83 (may creep 2 %), draws INTERP_MS + the recent
  lateness behind (decaying peak, ≤ +300 ms, grows 20 % / shrinks 4 % of real time), and keeps 8 frames. A steady link (any fixed
  latency) is unchanged (110 ms, ≤ 2 frames of grid). Also fixes the old schedule's 100 ms gaps on a 30-45 fps owner, and the own-slot
  velocity spike from two frames arriving 1 ms apart. Measured (scratchpad `mpqa/lat3.cjs`, 4 seeds × 60 s, in-order delivery):
  | link | ball steps > 1.6x the owner's (before → after) | step change, friend / owner | delay |
  |---|---|---|---|
  | 0 / 150 / 300 ms fixed | 4-0 → 4-0 (restart placements) | = owner | 110 ms |
  | 150-250 ms | 24-74 → 0-4 per format | 0.11-0.24 → 0.02-0.04 (owner 0.01-0.04) | 173 ms |
  | 150-300 ms | 89-333 → 1-6 | 0.22-0.50 → 0.02-0.05 | 206 ms |
  Goals, quick resets and kicks match the owner exactly as before. Trade-off: under jitter friends see the others ~60-100 ms later
  (their own slot is still the newest frame + velocity).
- **A frame over 512 B** (`matchNet.encodeSnap`, `SNAP_MAX_BYTES`): the count cap alone let a 9v9 with 11+ humans reach ~514-522 B in
  worst frames (every slot ≥ 100 u from the line, kicks and serial bits set), which `encode` refuses: a frozen match. The listed humans
  are now also fitted by bytes (at the costliest human's size), so the 11v11 / 9v9 rotate a little sooner only in such frames
  (worst now 492-495 B; tested in all 5 formats with every slot human).
- **Lost taps** (`matchLink` `IN_MIN_GAP_MS` 64): a kid mashing Tackle while steering sent ~20 In/s, over the relay's 16/s, and ~1 tap
  in 6 was dropped. Urgent sends now wait at least 64 ms (taps stay OR-ed): 13 In/s, 100/100 taps.
- **A stalled friend ran away** (`matchLink` `IN_STALE_MS` 1.2 s): the owner kept a stalled friend's last stick, so a 5 s socket stall
  ran his player ~100 u across the pitch. The owner now lets go after 1.2 s without In (2 keepalives missed); the next In takes over.
- **Phantom GOAL!** (`matchEffects.syncScore`, `fieldRuntime` `puppetFresh`): walking up to (watching) or joining a friends' match
  whose score is ahead of my local one popped the GOAL! card + announcement, and the replay history of my old match was kept. The
  first snapshot now syncs the card's score and cancels the old replay history.
**Not changed (by design / reported).** The pose governor: friends send In ≥ 2 Hz and owners snapshot while anyone plays or watches,
so `live` holds in shared matches; a party member alone on a field with nobody watching is capped at Run (only visible far away, where
no one watches). A backgrounded / locked owner freezes the friends until its hidden socket closes (`HIDDEN_CLOSE_MS` 15 s), then the
relay migrates; a "waiting for Ana" hint or a faster hand-off is a design call. Beach toasts (restart reasons, full time lines) come from
the owner's sim notes and are not mirrored. **Relay:** no change needed (frames, kinds, limits and rate buckets unchanged; owner-side
schedule and friend-side stamping only). **Two real phones still needed for:** iOS background / lock while owning, real jitter shape
on cellular (WebSocket head-of-line blocking after a loss), and the touch latency of a friend's taps (+≤ 64 ms).

### QA round 2 (multiplayer, Nov 5 2026: node harness over the real RoomCore, jitter + loss, no phones)
**Closed the two round-1 gaps.**
- **Owner backgrounded / locked** (`matchLink.ts` `handOff`, `visibilitychange` hidden + `pagehide`): the owner's phone sends its last
  snapshot, then the existing **Leave**: the relay hands the field to the earliest remaining joiner at once (no 15 s freeze) and a bot
  plays his slot. It does **not** re-join while hidden (a sleeping phone back on the roster would be made the owner again when the
  others leave: frozen friends). Back on screen it Joins its slot as the last joiner: a friend of the new owner ("Ben kept the match
  going while you were away"), or told kindly if a friend took the slot. My roster copy drops me at once (a stale copy confirmed me
  again). Only with a friend on the field. The relay only ever has one owner, so no split brain (tested: owner returns as a friend,
  the others leaving never hand the field back to the sleeping phone, one owner after). A Leave dropped by the Join / Leave bucket
  keeps the old 15 s path.
- **Friend-side hint** (`STALL_HINT_MS` 2 s): a friend whose owner's snapshots stop sees "Waiting for Ana…" in the tip spot under the
  score bar (re-said each frame for 0.25 s, so it fades as frames resume; the string is built once per owner). **Friend-side
  promotion after 6 s: not done.** No client frame can take ownership; any client-only version would be two owners. It needs a relay
  change (below); the client already handles either way (an owner who finds itself a non-owner in a roster becomes a puppet).
- **Beach toasts on friends** (`matchNet` `createSnapBuffer.sample`, `liveJoinRuntime`): derived from data every frame carries, once per
  new frame, into the puppet's `humanNote` / `results` the HUD already reads: the restart flag ending with my slot on the ball at the
  centre spot (kick-off) or the touchline (kick-in; corners and goal clearances never toast), and the period reaching 5 (full time,
  the frame's score; extra time from period 4). A level game is a shoot-out whose score only the owner knows: the friend reads
  "Penalties! Level after extra time: five kicks each decide it" (marker: level `pens`). Not mirrored (sim-internal, no snapshot
  trace): the "4 seconds up: the pass was played for you" and "No goal: …straight in" toasts. No wire change.
**Chaos pass #2** (`tests/join-live-mp.cjs` "QA2 chaos", seeds 3301 / 4409 / 5521 / 6637 / 7741, 200 s each, 5 players + 1 watcher,
30 fps, in-order delivery with 0-300 ms jitter each way, 5 % Snap / In loss): ~80 events per format (joins, a stale-picker join of a
held slot, leaves, slot swaps, owner leaves, backgrounds, phones that freeze without a hand-off, owner and friend socket stalls with
the burst after). Invariants per frame / at ~30 settle points per format: one owner (= the relay's), one stepping sim on the field,
no slot twice (relay and owner sim), no stale human on the owner, joined = on the roster, watchers never on the roster nor counted,
the shared score never goes back (beach: only to 0-0 after full time) and equals the owner's on every screen, no frame over 512 B /
120 numbers (worst 361 B / 101), nothing thrown, no client acting as owner > 1.5 s after the relay moved it, and a friend frozen past
2.1 s only during a deliberate owner freeze / stall, always with the hint (never after a hand-off).
**Fixed (found by the chaos pass).**
- A refused re-join (`matchLink`, "X just took that spot") left the link's owner flag, friends and puppet in place (harmless on a
  first join; after a hand-off it watched with stale friends locked on my sim): it now tears down to my own match.
- Leaving and joining another slot before the link's next update kept my old slot on the relay (local slot ≠ roster slot): a changed
  local slot is now a Leave + re-join. Not reachable through today's picker (several frames), kept as a cheap guard (one map lookup).
**Reported, not changed: the relay's flood guard vs a stalled socket.** `RATE.closeAbovePerSec` (30 frames in one second → close)
counts arrivals, so a phone whose link stalls ≥ ~1.5 s (cellular dead spot) and then flushes its backlog (poses ~10 Hz + match frames
12-13 Hz) is closed with `CLOSE.Flood` and reconnects (seen 2-12 times per 200 s run with match frames alone). The match survives it
(owner: migration at the drop; friend: bot in place, re-join after the resume), but the kid sees a reconnect. **Relay change suggested,
not deployed** (relay untouched this round): make the flood guard a token bucket with burst headroom (e.g. 30/s, burst 90-120),
and, for the friend-side promotion, track the owner's last Snap per field and, when a friend's In arrives > 6 s after it, move the
owner to the earliest other joiner and re-append the old owner (`slots.delete` + `set`) with a roster: the relay stays the only
arbiter (no split brain) and the old owner's phone becomes a puppet on its next roster, as tested here. **Relay redeploy: not needed for
this round's client changes** (frames, kinds, limits unchanged). **Phones still needed for:** iOS delivering the hand-off frames from
`visibilitychange` / `pagehide` before suspension, real stall shapes vs the flood guard.

### Relay: burst guard + silent-owner promotion (NOT deployed, Nov 5 2026)
Code + tests only; the live relay is still version `03b5d3cc-1ebe-425f-b9fd-b7dfc8c1ea40`. Closes the two relay items QA round 2 reported.
- **Burst guard** (`roomCore.ts` `message`, `protocol/limits.ts` `FLOOD_BURST`): the flood guard is a per-socket `TokenBucket`
  (`RATE.closeAbovePerSec` 30/s sustained, unchanged; burst `FLOOD_BURST` 120) instead of "> 30 frames in one fixed second". A phone
  flushing ~5 s of backlog after a stall passes; 200 frames/s is still closed after ~0.7 s, thousands at once after ≤ 120 frames. The
  per-kind buckets (pose, ball, emote, ping, control, `MATCH_RATE`, Join / Leave / Watch), size caps and validation are unchanged.
- **Silent-owner promotion** (`roomCore.ts` `promoteSilentOwners`, 5 Hz tick; `MATCH_OWNER_SILENT_MS` 6 s): a field owner who sent no
  C.Match frame for 6 s while another joiner is on the field (and that joiner sent a C.Match frame within the same 6 s) is taken off
  the field through the existing `matchDrop` (= a Leave): the earliest remaining joiner owns it, everyone gets the roster, the AI plays
  his slot. His socket stays open; his late Snaps / In are ignored (`matchField` -1) until he Joins again as the last joiner (a friend):
  one owner, the relay the only arbiter. The clock restarts on a new owner and on an alone owner's first friend's Join (he did not
  need to snapshot before). Alone, or with only silent friends: nothing happens. Clients without Cap.Match are untouched.
- **Client** (`matchLink.ts`, safe on the old relay too): an owner the relay drops from the roster (new relay: promotion; any relay:
  his socket dropped) is treated like his own hand-off: no Join while the page is hidden, then "Ben kept the match going while you
  were away". Friends: unchanged (roster with a new owner → snap buffer reset, the new owner "the match is on your phone now",
  "Waiting for Ana…" fades). On the old relay the frozen owner simply stays the owner (the 15 s path), as before.
- **Tests:** `tests/join-live-mp.cjs` 3 new checks (burst 100 / 1 s and 100 at once accepted, 200/s closed ≤ 1 s, 5000 at once closed
  ≤ 120, `MATCH_RATE` still drops; promotion at 6 s not 5.8 s, roster + split brain + re-join as friend, alone / silent friend / first
  friend; client+new relay and client+old relay); `world2` now runs the relay's 5 Hz tick and the chaos line prints promotions;
  `tests/mp-room-core.cjs` flood check now: 40 at once pass, 240 close. `multiplayer/bots/bot.mjs` flood bot sends 300 (past the
  burst); `scripts/mp-relay-smoke.mjs` ok. **Chaos pass #2** (same 5 seeds, 200 s each): flood closes 5 / 12 / 6 / 8 / 2 (33) →
  0 / 0 / 0 / 0 / 0; invariants all hold. A scratch variant with longer owner freezes (4-14 s) had 12 promotions, 0 closes, all invariants.
- **Deploy (owner approves):** `cd multiplayer/relay && npx wrangler deploy` (no migration: fields are memory-only; parties in progress
  reconnect and resume). Check: `npx wrangler deployments list` shows the new version; two phones in a match, lock the owner's phone
  without leaving the page: the friend sees "Waiting for …" then plays on after ~6 s. Client and relay can ship in either order.
  **Rollback:** `cd multiplayer/relay && npx wrangler rollback 03b5d3cc-1ebe-425f-b9fd-b7dfc8c1ea40` (the client works with both).

### QA round 1 (solo: one human + AI, Nov 5 2026)

Scripted humans (idle / "kid": slow, sloppy, 35-50 % tackle presses / "pro": the feel harness) on all five formats as keeper,
defender, midfielder and striker: the pure sim (3 min x 3-4 seeds per format and side) and headless Chrome on the dev server (portrait
390x844 DPR 3, 360x640, iPad 820x1180, desktop 1280x800, each also with "Switch control sides"), driving the real runtime
(`liveJoin.steer` / `press`, so the HUD modes, tap shot and assists are in the loop). Scripts live in the agent scratchpad only.

- **Fixed: a kid parked on a dead ball froze the match.** (1) The half-time / new-period kick-off waits for everyone in his half and the
  other side out of the circle and had no failsafe, so a human standing on the centre spot (or over halfway) stopped it for good
  (145 s of a 3-min futsal run). (2) Standing on a throw-in / corner / goal-kick spot kept the taker off it until the 4 s failsafe
  (12.5 real s at the 7v7's live speed; 16-17 s restarts in 7v7, 9v9, 11v11). `MatchSim.applyHumanTargets`: during a kick-off his stick
  target stays in his own half and out of the circle on the other side's kick-off (Law 8); on any other restart it is kept 18 u off the
  spot, along the line from the spot through where he stands (into the field when he is on it). `restartLogic`: a human match's kick-off
  also goes 1.5 real s after its beat however he stands. Humans only: the AI-only fixture is byte-identical. Max dead-ball time with a
  scripted kid is now 3.6-9.4 s in most runs (AI-only 14-20 s, which is the goal celebration + fetch); the few 11-18 s left are the beach
  period break or a script that re-aims at the ball under its feet every frame and wiggles on the spot (the 4 s failsafe still ends it). Regression:
  `tests/join-live-game.cjs` "QA round 1 (solo)" (fails on the old code).
- **Checked, fine:** picker (slot names incl. futsal Fixo / Ala / Pivot, keeper line, side names per format; Bot / Taken labels only
  appear with friends, the multiplayer pass covers them), Start, Leave (match focus off, HUD hidden, no humans left in any sim), leave
  then re-join another format and side, reload mid-match (clean, not joined). No in-match travel UI exists (only Camera, Leave and the
  actions), so "teleport away" cannot happen from the HUD. Buttons per state for every position (Throw / Kick / Dive / Call in goal;
  Pass + Shoot or Forward + Trick on the ball; Tackle or Press + Stay defending; Call; Go!). Layout: no overlaps, every target >= 44 px,
  inside the safe areas on all four views, mirrored correctly when flipped. Desktop keys: Space pass, J shoot, K through ball, L trick,
  P press on defence, Shift sprint, C camera, Esc leave. Goal -> replay (tag 14 px under the score bar, Skip works from 1.6 s, controls fade
  out and come straight back) -> quick reset -> kick-off in 3.9 s (skipped) / 6.2 s (full replay); replays off, reduced motion and
  "Match effects: Light" all run without errors. 3 real minutes per format in the browser: 0 page errors / console errors / unhandled
  rejections, ball never out of bounds or NaN, no AI outfielder still > 10 s in open play, no ball resting in a net, keeper holds <= 6 s.
- **Balance (not changed, owner call):** goals / min human side vs AI side, 7v7 midfielder: idle human 0.08-0.11 vs 0.42-0.44 (his side
  plays a man short), kid 0.17-0.44 vs 0.00-0.17, pro 0.83-1.33 vs 0.00 (the browser bot: 5-0 in 3 min). A sloppy kid gets a close, winnable
  game; a skilled player beats the 7v7 AI easily. 11v11 human pass completion 96 % of 48 passes (14 seeds; 7v7 95 %, 9v9 77 %, beach 82 %).
  Tackles are not auto-wins: 33-51 % of tackle presses win the ball (feel harness). Human top speeds (14-frame windows): sprint <= 9.16 m/s,
  carry / lunge peaks 9.44-9.46 m/s on the 11v11 for under half a second, which the pose governor's +1 m per pose absorbs.
- **Perf** (dev server, portrait 390x844, 4x CPU, 20 s with two goal resets): 60 fps all five; frame p50 / p95 7v7 18.1 / 25.1, futsal
  14.7 / 26.3, 9v9 13.6 / 26.6, 11v11 16.4 / 26.7, beach 19.4 / 26.6 ms; max frame 30-36 ms; draw calls 95 / 112 / 90 / 109 / 81; heap
  growth 6.6-9.7 MB/s. No regression against the earlier passes (9v9 ~94 draw calls, p50 15-23 ms, 10-14 MB/s). Desktop emulation, not
  phone heat.
- **Needs a real phone:** thumb reach of the 52 px Trick / Stay on the arc when flipped, the keeper's stick being held at the box edge
  (by design) reading as "stuck" to a kid, and the real-device heat of a full match.

### QA round 2 (balance, Nov 6 2026: scripted humans in the pure sim, no phones)

Four scripted humans in the midfield slot (idle; kid: 0.35 s reactions, ±40° stick noise, 42 % of close tackles pressed, shoots from far
with the 1-tap shot; average: 0.18 s, ±17°, 1-tap shots; skilled: 0.08 s, sprints and hunts the ball, Press, tricks, aimed corner shots),
20 seeds x 3 real minutes per format x profile at live pace, alternating sides, plus the teammate harness ("pro" passer, 14 seeds) and the
keeper harness. An "exploit" bot (instant through balls / long balls every touch) scores less than the skilled one everywhere (no cheap line).
**What changed** (`lib/town/match/humanDefence.ts`, read only with a human joined: AI-only matches byte-identical, fixture md5 ca9034fe…):
per-format multipliers on the existing engine. `intercept` / `lane`: a defender reads a human's assisted pass more often and from further
off the lane (11v11 ×2.4 / ×1.8, so PASS_HELP's halving no longer applies to adults; kids' formats ×1.4-1.6 / ×1.15-1.2). `read`: an AI
carrier treats a human closing within 12 u × read as pressure and releases it. `attack`: × the AI's shooting instinct near a human-defended
goal. `keeper`: × the AI keeper's reach against a human's AIMED shot only (the corner pick is never wide; the kids' 1-tap shot is
untouched): futsal 1.35, 9v9 / beach 1.3, 11v11 1.15, 7v7 1.1. `tackle`: 11v11 only, HUMAN_GUARD.tackleMul × 1.2. Strength ramps from the
first human's join (7v7: 35 % -> 100 % over 4 real min, no spike at kick-off; others 0.5-0.8 over 2 min; 11v11 30 s) and, on the kids'
formats only, a 3-goal band since the join: 3+ behind × 0.4-0.5 (defenders sit off), 3+ ahead × 1.25-1.35; off with humans on both sides.
TACKLE_ASSIST, human speeds and pose limits unchanged. Regression: `tests/join-live-game.cjs` "QA round 2 (balance)".

| format / profile | goals for-against / min before -> after | human pass completion | tackles won |
|---|---|---|---|
| 7v7 kid / avg / skilled | 0.23-0.17, 0.33-0.10, 0.77-0.03 -> 0.20-0.12, 0.45-0.05, 0.60-0.10 | 99/73/78 -> 94/72/77 % | 40/49/46 -> 46/55/38 % |
| 7v7 skilled, 8 min | 6.3-0.5 a game (max 11-0) -> 4.9-0.6 (max 7-0) | 78 -> 76 % | 46 -> 33 % |
| futsal kid / avg / skilled | 0.62-0.55, 1.05-0.35, 1.35-0.17 -> 0.73-0.67, 0.97-0.43, 1.02-0.27 | 93/77/77 -> 92/72/74 % | 55/46/45 -> 48/40/41 % |
| 9v9 kid / avg / skilled | 0.17-0.35, 0.33-0.13, 0.82-0.15 -> 0.18-0.35, 0.37-0.12, 0.62-0.13 | 92/79/81 -> 87/74/79 % | 40/39/40 -> 30/37/38 % |
| 11v11 kid / avg / skilled | 0.25-0.22, 0.20-0.22, 0.42-0.18 -> 0.18-0.20, 0.27-0.23, 0.32-0.12 | 88/79/84 -> 89/81/75 % ("pro" passer 96 -> 87 %) | 25/36/35 -> 0(n=10)/26/37 % |
| beach kid / avg / skilled | 0.53-0.35, 0.75-0.15, 0.92-0.10 -> 0.42-0.30, 0.63-0.12, 0.78-0.15 | 89/82/80 -> 92/83/79 % | 38/48/45 -> 32/45/45 % |

Idle humans unchanged (his side plays a man short: 0.05-0.15 vs 0.22-0.68). The skilled bot's aimed-shot conversion: futsal 63 -> 28 %,
9v9 67 -> 56 %, beach 46 -> 33 %, 7v7 39 -> 25 %. Human keeper saves (react 0.3 s) 65-80 % -> 67-85 % (noise); AI keeper vs AI shots
unchanged; teammate calls ("to caller" passes completed 90-100 %) unchanged. ±0.1 goals / min is seed noise at this sample size.
- **Not reached:** the skilled bot still concedes only 0.10-0.15 / min (target ~0.3): it wins the ball ~3 times a minute with the
  (kept) tackle assist, so the AI rarely reaches his third; the 11v11 goal targets (0.5-0.9 for / 0.3-0.6 against) would need a more
  open game than the AI's own (0.2 per side per min), which tuning the defence cannot give.
- **Needs a real kid / adult:** whether the 7v7's late "read" (carriers letting it go as he closes) feels like smart opponents or like
  the ball "running away" from a kid's tackle; whether the AI keeper's extra reach on aimed shots reads as a great save or as unfair;
  whether adults find 11v11 passing now honest (75-87 %) and whether the 3-goal band is invisible over a 10-minute session.

### QA round 2 (robustness + soak, Nov 6 2026: headless Chrome on a dev server + the node relay harness, no phones)

Adversarial input, lifecycle and soak runs on all five formats (phone 390x844 DPR 3, 360x640, iPad 820x1180, desktop 1280x800; real CDP
multi-touch on the HUD and stick; 4x CPU throttle for the soak). Scripts live in the agent scratchpad only.

- **Fixed: a held button stayed held after a tab switch / phone call / page hide.** Holding Sprint and then hiding the page (visibilitychange
  hidden + blur, no touchend arrives) left sprint on after resume; Pass / Shoot holds kept their press times, so the Stay jockey or a late
  release could fire. `liveJoinRuntime` now has `release()` (clears the holds, the press times and modes, the Press chase and the Shoot drag
  WITHOUT firing anything), called on window `blur` (RotateLock's wrong-orientation blur included), `pagehide` and a hidden page; removed in
  `dispose`. Town's own keys were already cleared by its blur. `LiveJoinHud`: Pass and Shoot also let go on `lostpointercapture`, as Sprint
  always did (an iOS capture lost without pointerup / pointercancel; Chrome delivers pointerup to a hidden captured button, checked).
- **Fixed: a solo match kept playing behind "Turn your phone upright".** RotateLock promises "the game waits behind it", but a phone held
  sideways mid-match let the AI play on (3 s sideways: 1 sim s; a goal could go in on a kid who cannot see). `liveJoin.timeScale` is 0 while
  the card's own query (`wrongOrientationQuery('portrait')`, one MediaQueryList made once, a property read per frame) matches and I am
  joined; a shared match keeps real time (friends' phones). Upright again: back to exactly 1 at once.
  Regression: `tests/join-live-game.cjs` "QA round 2 (robustness + soak)" (fails on the old code); the shared timeScale assertions in both join tests follow the new getter.
- **Checked, fine:** 60-frame mash with three fingers (stick + Pass + Shoot) and touchcancel; pointercancel / release outside the window;
  keyboard + mouse together (Space held + clicking Pass); hold Shoot then rotate / resize / flip push-to-sprint and Match effects Light, then
  lose the ball (button hidden) and release: no stuck jockey or sprint; camera 20x; Skip spam; 12 forced goals in a row (replay ring and pop
  bounded, the effects log capped at 80); replays off mid-replay; reduced motion mid-replay; Leave / Esc during a replay, a slow motion and a
  keeper dive (controls opacity back, replay tag hidden, timeScale 1, match focus off); 50 leave + rejoin cycles across all five formats in
  under 1 s each (0 failures, one human on one field afterwards, the bench pool stays at 1 per field); Start pressed three times; Start then
  Leave inside the shrink; a teleport onto another pitch with the picker up (cancelled, as designed); 30 s hidden mid slow motion (no player
  or ball jump; the slow motion carries on and ends at 1); WebGL context lost and restored (renders again, no errors); reload mid-replay (clean,
  not joined); sprint into the corner flag for 45 s on 7v7 / 11v11 / beach (clamped, no NaN, at most 6 s of dead ball); 12-letter friend
  names in the picker (nicks are 2-12 letters, no emoji possible: `normalizeNick`), no overflow at 360 px; all controls on screen on every view.
- **Soak** (15 real min per format, phone, 4x CPU, a scripted kid who wanders and mashes buttons and the camera, plus 3 forced goals every
  90 s; 7v7 midfielder and futsal keeper idle for the first 5 min). Heap after GC, dev build: minute 1 to minute 15 was +10.6 / +12.2 / +15.5 / +4.8 /
  +21.7 MB for 7v7 / futsal / 9v9 / 11v11 / beach. Geometries +31 / +34 / +23 / +37 / +14 and textures +12 / +10 / +8 / +13 / +29 come
  from first-time loads (replays, effects, camera angles) and stop growing by about minute 10. DOM nodes held at 2073 and window + document
  listeners at 291 throughout; frame p50 / p95 were 16.7 / 16.8 ms in every sample (headless vsync bound). Draw calls were 62-95 on Broadcast,
  with peaks of 190-272 when the kid had cycled to Wide / Behind. 0 page errors, 0 console errors, 0 warnings, and timeScale was 1 at the end.
  After Leave: match focus off, DOM back to 2088, listeners 290, heap 36-75 MB above the pre-join island baseline (that format's first-time assets stay loaded; 1-15 MB below the in-match peak).
  Node relay harness (3 humans, 150 ms jitter, 3 % loss, 10 match-minutes on 9v9 and 11v11): heap +0.9 to +2.3 MB over
  10 min, slowly levelling off (the harness keeps its own send logs). Puppet rings stayed at 8 frames and no sim array grew. 8 humans on 11v11 for 2 min: roster 8,
  one owner, frames <= 405 B / 116 numbers, every screen showed the owner's score.
- **Not fixed (outside this lane):** Town reads `prefers-reduced-motion` once at mount, so turning it on mid-match only takes effect on
  the next visit (the slow-motion hook reads it live). CDP page freeze does not stop rAF in headless Chrome, so a real freeze / resume was
  not reproduced (a hidden page is handled: Town resets its clock and the dt clamp holds).
- **Needs a real phone:** iOS Safari's pointer capture when a held button is hidden or the page goes to the background (the fixes cover
  both paths, but untested on a device); a phone call or Control Centre swipe over a held Sprint; the rotate card's pause as the phone is
  actually turned; and the heat of a full 15-minute match.
