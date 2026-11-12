# Public island phase 3: build + verify (Nov 12 2026)

Scope (`PHASE3-HANDOFF.md`): 1. the shimmer overlap; 2. phase 3 = Match o'clock, the island-wide daily goal, activity glows. Not
built (not approved): stranger duets, the Arcade room in the world; Air Futbol online is dropped (owner). Working tree only, nothing
committed, pushed or deployed. Everything sits behind the existing flags (`NEXT_PUBLIC_MULTIPLAYER=1` + `NEXT_PUBLIC_PUBLIC_WORLD=1`)
and only acts while the player is really in a public world ("With other players"). Files: [PHASE3-RELEASE-FILES.md](PHASE3-RELEASE-FILES.md).

**Relay deploy: unchanged.** The island goal adds code to the relay (`roomCore.ts`, `partyRoom.ts`, protocol), but it ships in the SAME
`wrangler deploy` of relay v3 as `PUBLIC-OWNER-STEPS.md` step 2: no new binding, migration, secret, route or env var. A world Durable
Object now keeps one more storage key, `goal` = `{day, n}` (a number for today, nothing else).

## 1. The shimmer overlap (fixed)
Cause: the "Something shimmers over there" hint DID use the one-message lane. When it closed it released the lane at once, but the HUD
stack keeps a fading copy on screen for 260 ms (+80 ms until removed, `components/HudStack.tsx`). The public first-time card took the
lane in that moment and opened over the fading copy. Fix: `toastLane.settle(id)` (`lib/ui/toastLane.ts`): false while the last note
left less than `EXIT_GAP_MS` (340 ms) ago, with one short quiet hold that re-asks when it ends. The first-time card, the people-button
hint and the new island note call it before they take the lane. Other lane users are unchanged (flag-off timing is the same).

## 2. Phase 3
- **Match o'clock.** The first 10 minutes of every hour (UTC, so everyone in a world meets at the same time; local o'clock in
  whole-hour time zones). One live pitch per hour, in turn: 7v7, Sharks Beach Court, Palm Coast Rooftop (futsal), 9v9 (11v11 is too
  big to find each other on). Nothing new is scheduled on the relay: the shared live match that already exists in worlds (Cap.Match,
  first kid on a pitch owns it, others drop in) does the playing. What is new: a note through the one-message lane, once per hour per
  visit, never during a match, lesson, quiz or menu: "It's Match o'clock! Kids are meeting at Sharks Beach Court. Follow the gold
  light and join the match." plus the island goal line when known, else a football tip (four, one per hour: space, passing, keepers,
  moving after a pass). The meeting pitch glows.
- **Island goal (per world, counts only).** Each goal a kid's team scores in a live match (solo or shared) sends `C.Goal [61]`
  (Cap.Goal, world sockets only). The world counts goals for today (UTC day), max 9999, each member rate-limited to one per 10 s
  (burst 3), never from a quarantined member. `S.Goal [43, n]` goes out on the existing 1 Hz hint pass, only when it changed. The panel
  ("Who's here?") shows "Island goal today: 23 of 50 goals"; reaching 50 shows "Island goal done! Kids on this island scored 50 goals
  today. Great teamwork!" once per day per visit. No ids, names or positions are kept or sent; a world keeps `{day, n}` only.
- **Activity glows.** A soft gold column with a ring at the centre spot of a live pitch where another kid in my world is playing now
  (from the S.Match rosters every world member already receives: ids only), and over the Match o'clock pitch while it runs. Never over
  the pitch I am playing on; never on the map; nothing outside a world.

Heat: no new timer, interval, rAF, poll or fetch. The clock is read from Town's existing public frame at most once a second; counts
arrive on the socket; glows are static meshes built on first use (2 meshes per lit pitch, one shared texture) and touched only when
the list changes; the note uses one hide timeout while it shows (like the shimmer hint).

## Results
| Check | Result |
|---|---|
| `tests/mp-public-phase3.cjs` (new, in `TEST_CORE_CHAIN`): 8 groups (shimmer gap, protocol, relay count / rate / quarantine / day / restore, Match o'clock, islandLife, the note + copy, wiring + heat) | PASS |
| Related suites: `one-message`, `calm-hud`, `mp-public-phase2`, `mp-public-ui` (dispose pin widened for `offLife();`), `mp-world`, `mp-presence`, `mp-ui`, `ui-spec`, `mp-public-copy`, `mp-player-tap`, `mp-protocol`, `mp-room-core`, `mp-client`, `join-live-mp`, `reef-discovery`, `admin-analytics-live-matches` | all PASS |
| `NODE_OPTIONS=--max-old-space-size=6144 npx tsc --noEmit`; `npx tsc --noEmit -p multiplayer/relay` | clean; clean |
| `npm run lint` | 0 errors (83 old warnings, same count) |
| `npm run test:quiet -- --timeout 900` | 1026/1027: only the known `oct1-ui.cjs` ("My football"); `game-saves.cjs` flaky once, passed on its retry |
| Browser, flag ON (dev relay 8805 world mode; Next dev 8156, then 8157 / 8158 after outside kills; headless Chrome `--mute-audio`; page clock moved to 2 min past the next hour; one scripted stranger scores 3 goals and takes a slot on that hour's pitch) `scripts/check-mp-phase3-browser.cjs --profile=phone` and `--profile=desktop` | 7/7 and 7/7: in the world; the Match o'clock note names the pitch (with a tip, see findings); one message at a time; only the Match o'clock pitch glows; panel "Island goal today: N of 50 goals" (N >= 3); glow stays after the stranger leaves (Match o'clock); 0 console errors |
| Browser, flag OFF (Next dev 8159, `NEXT_PUBLIC_MULTIPLAYER=1` only) `--profile=off` | 2/2: today's "Play with friends" button, no count, no note, no glow objects, no goal line, 0 errors. (The phase 1/2 `check-mp-public-browser.cjs --profile=off` run was cut short: the server was killed from outside mid-boot) |

Screenshots: `docs/qa/phase3-match-oclock-phone.png`, `phase3-match-oclock-desktop.png`, `phase3-goal-panel-phone.png`,
`phase3-goal-panel-desktop.png`, `phase3-glow-phone.png`, `phase3-glow-desktop.png`. The glow was first additive and vanished over sand;
it is now normal-blended (beam 0.6 fading upward, ring 0.5).

## Findings not fixed
- (Info) Dev only: React StrictMode mounts HUD notes twice, so the HUD stack's exit copy shows a faint double of a note for 0.3 s in
  `next dev` (all HUD notes, not new). Production mounts once.
- (Low) The Match o'clock note can be decided a moment before the first `S.Goal` arrives; it then shows the football tip instead of
  the goal line (the panel always has the count).
- (Info) A world that empties keeps its count in storage; the lobby may later reopen a different shard number, so "per world" means
  per shard: a kid moved to `pub-2` sees `pub-2`'s count.
- (Info) The dev server was killed from outside four times during the browser runs (as in phases 1 and 2); each run was repeated on a new port.
- (Info) The browser script stores "With other players" before boot: a fresh device is otherwise in the 10% holdout (Just me) one time in ten.

## Owner steps
1. Copy review: add the Match o'clock note, the four tips, the island goal line and the goal-done note (all in `lib/multiplayer/publicCopy.ts`, `allPublicCopy()`) to `PUBLIC-COPY-REVIEW.md` sign-off.
2. Lawyer (no new question expected): the relay now keeps one count per world per day (`{day, n}`), no personal data; mention it with question 3 (counts only).
3. Release with phases 1 and 2 per the release files; the relay deploy step is unchanged.
4. Family beta: at a Match o'clock, check both phones get the note once, see the gold light at the pitch, play the same match, and the panel's goal count goes up for both after a goal.
