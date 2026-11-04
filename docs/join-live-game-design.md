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
