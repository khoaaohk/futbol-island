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
the stick says), lands before the ball (≤ 0.14 sim s) and adds 3.5 units of reach at full stretch, so a timed press
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
