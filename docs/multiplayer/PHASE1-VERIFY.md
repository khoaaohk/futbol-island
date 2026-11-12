# Public island phase 1: integration verify (Nov 11 2026)

Setup: dev relay (`multiplayer/dev-relay/server.mjs`, world mode, port 8793, `/control` token set), Next DEV server on 8144
(`NEXT_DIST_DIR=.next-agent-mpverify`, `NEXT_PUBLIC_MULTIPLAYER=1 NEXT_PUBLIC_PUBLIC_WORLD=1`), a flag-off DEV server on 8145, headless
Chrome (playwright, `--mute-audio`), world bots `multiplayer/bots/bot.mjs --world` (now with `--room` and `--in`), raw-socket puppets for
reports and the following guard. The verify scripts lived in the session scratchpad (not committed); the repo checks reused are named below.
Note: during this pass this pass's dev servers (8144, 8145) were stopped every ~10 min (at :x6) by something outside this work (other
agents shared the machine; the owner's 8092 also restarted once), so long browser runs were split and retried; never touched by this pass.

## Matrix
| # | Check | Result | Evidence (one line) |
|---|---|---|---|
| A1 | No free text in any world frame (in or out) | PASS | 2,990 world frames over a 6.5 min session with 22 others: no string except the resume token |
| A2 | Typed party name never sent in a world | PASS | First name "Zelda" set for a party earlier in the session: 2 party frames carry it, 0 world frames; world Hello is 5 elements |
| A3 | No Ping / Hit / Rename / Kick / ResetName sent | PASS | 0 such frames out of the browser |
| A4 | Strangers never on the map | PASS | Final pass (browser, phone): map opened with 3 world strangers drawn 6-10 m away: 0 `[data-friend-dot]`; then a party started from "With friends" and a raw party friend joined: 1 dot (`tests/mp-avatars.cjs`, `mp-public-draw.cjs` as before) |
| A5 | Following guard | PASS | Puppet A 2 m behind B walking 1 m/s: both still see each other at 45 s, neither at 50 s (relay rule both ways) |
| A6 | Emote spam capped on screen | PASS | 20 bots waving every 1.5 s (relay passes up to 10/min): the scene accepted at most 6 per minute per sender |
| A7 | Two reporters quarantine, one does not | PASS | Observer kept T after 1 report and after a 2nd report from the same home; lost T (S.Left Far) after a 2nd distinct reporter |
| A8 | Hidden player never reappears until Show again | PASS | Hidden bot stayed under "Hidden this visit" for 6 min, its emotes stopped; Show again brought it back (two-client run) |
| A9 | Reported player never reappears, never under Show again | PASS (after fix) | Reported id absent from roster and Hidden list for the rest of the session; Show again cannot undo a report |
| B1 | solo -> public -> solo, no reload | PASS | `check-mp-public-browser.cjs` phone 390x664: 15/15 checks (also 390x844 and desktop 10/10 each) |
| B2 | public -> friends (create party) -> end -> remembered choice | PASS | Party started (party socket), ended, island back in "With other players" (new world socket) |
| B3 | Switch during a shared live match (warning, match plays on) | PASS (after fix) | Final pass: two real contexts (desktop A, phone B) in world 1 joined the live 7v7 through the pitch bar (`liveJoin.press('play')` then `'start'`, the buttons' own path); B chose Just me: "You’ll leave this match." shown, B still joined and playing, A's 7v7 back to 1 human. Defect 11: B's line said "Lost your friends’ match" (fixed) |
| B4 | Switch while swimming / flying / boat / in a room | PASS | Final pass (phone, raw world puppet 7 m ahead): swim, jetpack at 14-28 m and standing on the deep-sea boat deck: the puppet saw mode Swim (8, zone Sea) / Jetpack (5) / Idle; Just me: stranger faded, puppet got S.Left; back: puppet sees the same mode again; ride, swim state and spot unchanged; no page errors. Room: as before |
| B5 | Tab hidden 20 s and back | PASS (simulated) | visibilitychange faked in-page: no alert or toast; one new world socket after the first input on return |
| B6 | Relay killed and restarted | PASS | No alert while down; quiet reconnect (new socket) after restart and input |
| B7 | `/control` closes public, reopens | PASS (after fix) | Silent drop to Just me; panel line "Other players aren't here right now..."; after reopen one tap reconnects at once (defect 2) |
| B8 | World full (24) | PASS (relay) | Filled world 1 to 24: a fresh lookup is sent to world 2; a forced join gets 4006 + S.Error Full; client fallback in `mp-presence.cjs` |
| B9 | "Just me" fades others out over ~1 s, then sleeps | PASS (after fix) | `docs/qa/public-verify-switch-fade.png`: 6 leaving at +200..815 ms, gone and layer hidden at +1.1 s |
| B10 | Grown-up lock: Friends only while connected | PASS | Closes public at once; reason line now "A grown-up chose Friends only. A grown-up can change this in Settings." |
| B11 | Grown-up lock: Off while connected | PASS | World closed, people button gone; back to "all": reconnects on input once the 2-min slow retry allows |
| B12 | Flag OFF: UI, policy and behaviour as today | PASS | Final pass on a flag-off DEV server (8150): `check-mp-public-browser.cjs --profile=off` 2/2 (today's "Play with friends" button, menu, Allowed / Off toggle, no errors), `check-mp-player-tap.cjs --profile=off` 2/2 (no card on taps, no errors) |
| C1 | New player: no connection or presence UI before the tour ends, first card once | PASS | `check-mp-public-browser.cjs` new: no socket, today's label until the tour ends; phone/tall/desktop: card once, never with Welcome back |
| D1 | Two real browsers see each other, different generated names | PASS | Desktop "Gold Octopus" and phone "Navy Gecko" in world 1; `docs/qa/public-verify-two-clients.png` |
| D2 | Wave | PASS (split) | The emote wheel's Wave goes out as `[2,0]` (an integer only); receiving strangers' waves on screen shown in A6 |
| D3 | Hide / Show again / Report between them | PASS | B hid A (listed, Show again restored), reported A: `[60,0,1]` sent, A got S.Left Far, neither lists the other |
| D4 | Same drop-in match | PASS | Final pass: see B3 (both screens show 2 humans on the 7v7; B's join event counted 1 other) |
| R1 | Strangers indoors: Arcade, Museum, Shop, Konbini | PASS | Arcade / Museum / Shop: 10 room bots each, chip "10 players here", roster 10 with Hide + Report, at most 5-6 drawn (cap 6), island bots never listed; Konbini: 2 (the world was full, see note); `public-verify-arcade-strangers.png`, `-museum-` |
| R2 | Personal-space fade near the player in rooms | PASS | 2 bots standing at the player: 1-4 rigs at the 40% alpha (`ghosts`) per room |
| R3 | Leaving a room keeps the world | PASS | Entry and exit lookups both `/world?in=1`; no new assignment (see note on a full world) |
| R4 | Direct link into a room without the island first | PASS | `/arcade` in a fresh tab: no socket, no chip, no console error: the room simply shows nobody |
| R5 | Tap on a stranger in rooms (card, Wave / Hide / Report, objects keep priority, card placement) | PASS (Konbini FIXED Nov 12, see below) | Final pass, raw world puppets placed in each room: Arcade / Museum / Shop on phone 390x664 and desktop: card with the generated name, Wave reached the others in the room, Hide removed them, Report sheet (no typing) hid at once + thanks; card inside the screen and clear of the stick / buttons (phone 45-345 x 360-480). Arcade: stranger body 37 px from a tap on a cabinet: walked to the cabinet, no card; Museum: exhibit tap kept (stranger 63 px off); Konbini: shelves behind every stranger took every tap (old FAIL). FIXED Nov 12 (owner: in the Konbini the nearer thing wins): a stranger whose tapped body point is nearer the camera than the shelf the tap hits opens their card, the shelf pick does not run; a shelf with no one in front works exactly as before. `scripts/check-mp-konbini-tap.cjs` phone 390x664 + desktop: card opened on a stranger in front of a shelf, a clear shelf tap still went to the shelf (no card), flag-off: every tap to the shelf pick, no card; `public-konbini-card-phone.png`, `-desktop` |
| R6 | Islander priority on the island | PASS | Final pass, phone: islander Ben with a puppet 3 m behind him on the camera ray (body 23 px from the tap): conversation opened, no card; the puppet moved 5 m clear: card opened (`docs` screenshot in the scratchpad only) |
| E | Heat and data, real sockets | PASS (see table) | Matches the synthetic figures; ~10 MB/h at 23 near |
| G8 | Dev "7 errors" overlay | NOT REPRODUCED | Re-ran `check-mp-public-heat.cjs` (now also records console errors): 0 errors, no overlay; see below |
| F | Regression | PASS | Full suite 1024/1025 (only `oct1-ui.cjs`, the known parked coach copy); all 24 `tests/mp-*.cjs` pass; `tsc --noEmit` and `tsc -p multiplayer/relay` clean; `npm run lint` 0 errors (83 old warnings); `check-mp-e2e.cjs` NOT RUN then (final pass: row P1); final pass: full suite 1024/1025 again (only `oct1-ui.cjs`), `tsc --noEmit` (6 GB heap) and `tsc -p multiplayer/relay` clean, lint 0 errors (83 old warnings) |
| P1 | Private parties end to end (`check-mp-e2e.cjs`, two clients in a party) | PARTIAL | Final pass on DEV servers (no production build: the coordinator holds the build window), relay in world mode. Flag OFF (8150): 59 PASS; steps 1-4 (start, name filter, gate, join by code and link, rings, labels, Wave / High five / Dance / Show off both ways, jetpack) pass except 2.7 / 2.11 ring size read during the ring's pop-in (0.04-0.24 of 0.54, growing) and 3.13 / 3.14 / 3.16 Pass it / Juggle (the ask + accept flow since relay v1.4; party code path unchanged here); steps 6-10 crashed on dev-server timeouts (door walk, clicks) and cascaded; 11.3 needs `FI_VISITS_LOCAL` (production only). Flag ON (8149), steps 1-3 after the script fix (defect 13): 40 PASS, same 2.7 and 3.13 only. Not run end to end on a production build |

## Heat and data (phone 390x844, CPU x4, real world sockets, DEV build)
| Case | Draw calls | Triangles | Layer update ms | Rigs | KB/s in | KB/s out | MB/h |
|---|---|---|---|---|---|---|---|
| Alone in a world (idle) | 121 | 101k | 0.06 | 0 | 0.003 | 0.005 | ~0 |
| 5 near | 132 | 126k | 0.67 | 5 | 0.92 | 0.003 (still) | 3.3 |
| 12 near | 134 | 132k | 0.75 | 5 | 1.90 | 0.003 | 6.8 |
| 23 near, tier 0 | 134 | 122k | 0.77 | 5 | 2.67 | 0.003 | 9.6 |
| 23 near, tier 1 / 2 / 3 / 4 | 138 / 128 / 123 / 122 | 122k / 107k / 94k / 88k | 0.68 / 0.42 / 0.33 / 0.14 | 5 / 3 / 1 / 0 | 2.7 | 0.003 | 9.7 |
| Arcade, 0 / 6 strangers | 54 / 57 | 148k / 163k | 0.05 / 0.30 | 0 / 6 drawn | 0.003 / 1.06 | 0.003 | ~0 / 3.8 |
Synthetic re-run (same day, `check-mp-public-heat.cjs`): 0 / 5 / 12 / 23 strangers 131 / 143 / 142 / 149 calls, 0.09 / 1.49 / 0.48 / 0.44 ms;
Arcade 0 / 6 / 10 sent: 49 / 67 / 68 calls, 0.10 / 0.62 / 0.80 ms. Idle send rate alone: 0.1 pose frames/s (the 5 s beat; at most 2 Hz
under S.Quiet when moving); no timers added. A moving player sends ~5 frames/s (~0.6 MB/h). The policy's "about 15 MB an hour" stays: it is
a conservative upper figure (measured ~10 MB/h with everyone near); not changed. No claim about real phone temperature.

## Defects found and fixed
1. `lib/multiplayer/strangers.ts`, `publicWorld.ts`, `components/party/PresenceChoice.tsx`, `RoomPublicChip.tsx`: a reported player was
   only hidden, so "Show again" could undo a report. Now reported ids are kept apart, `unhideStranger` refuses them and neither roster
   lists them under Hidden (`tests/mp-presence.cjs` asserts it).
2. `components/party/PresenceChoice.tsx`: after the owner closed public play (or the relay was unreachable), tapping the already-marked
   "With other players" did nothing, so the "a tap retries at once" path in `publicWorld.setMode` was unreachable (the kid waited up
   to 2 min of input). The tap now retries when the mode is not on for reason closed / unavailable.
3. `components/party/party.module.css`: two impure selectors (`[data-presence-panel]`, added during the day by the panel-scroll change)
   broke the CSS-modules build of `/play` (HTTP 500 in dev; the production build would fail too). Scoped to `.menuCard[data-presence-panel]`.
4. Gap 1: world bots could not enter rooms: `bot.mjs` gains `--room R [--room-at x,z]` (room poses: Zone.Indoors, room band, entry
   Warp + one retry) and `--in S` (fill one world past the soft cap).
5. Gap 2: `townBridge.ts` / `roomParty.ts`: when not live but `avatars.fading`, keep updating (rooms stay awake) until the 1 s
   fade-out ends; then the old flush hides the layer and the loop sleeps (reduced motion: at once, as before).
6. Gaps 3-5 copy (`publicCopy.ts`): roster line "Others are further away." when the world count is larger than the list; the Friends-only
   reason adds "A grown-up can change this in Settings."; the report sheet says "A report can't be undone. Hide can."
7. Gap 6: `lib/site/learnFeatures.ts` (trust points, "does not have", the controls feature, two FAQs) and `lib/site/aboutCopy.ts`
   (privacy line) are flag-aware; flag-off output pinned in `tests/mp-public-copy.cjs` (new `site` key; `--update` run once for this
   intended addition; the policy, safety and /play hashes are unchanged). Old -> new in `PUBLIC-COPY-REVIEW.md`.
8. Gap 7: `WORLD-HANDOFF.md` `CAPS_WORLD` is 1995.
9. Full suite: the new tab key `fi2-world-session-v1` was unclassified (`tests/game-saves.cjs`): added to the device keys in
   `lib/saves/snapshot.ts` and table B of `docs/accounts-design.md` (never synced). Three source-shape pins broken by the drawing / UI
   agents' equivalent code (`tests/remote-rides.cjs`, `friend-bump.cjs`, `admin-analytics-party.cjs`: the ghost batch and `publicFrame`
   now sit between the pinned calls) accept the new shape. `tests/mp-public-copy.cjs` pins only the /learn entries the flag can change
   (another agent's Arcade copy edit broke a whole-hub pin); policy / safety / /play pins unchanged.
10. `scripts/check-mp-public-heat.cjs` also records console errors (the dev overlay counts them).
11. Final pass: `components/party/publicNear.ts` `strangerJoin`: after "Just me" mid-match the world socket closes BEFORE matchLink says
    its teardown line, so `isPublic()` was already false and a kid who had played with strangers read "Lost your friends’ match". The
    wrapper now keeps the `isPublic()` sampled on each roster change (`friendsChanged`) while the shared match was live; browser re-run:
    "The other players left the match: the game plays on here." (pin in `tests/mp-public-ui.cjs`).
12. Final pass, low item (a): `multiplayer/relay/src/worldLobbyCore.ts` `assign(in)` keeps a returning member in its world while that world
    exists, also at 24 (walking through a door, or a reconnect, usually still holds a seat: the room resumes it). A fresh join is still
    refused at 24 by the room (4006 + Full) and the client then asks once without `in` (unchanged). No wire, default or safety change;
    `tests/mp-world.cjs` pins it (lobby keeps `in` at 24, a newcomer goes elsewhere, a gone world assigns like a newcomer; a seat holder
    resumes into a full room while a newcomer gets Full). `WORLD-HANDOFF.md` updated.
13. Final pass: `scripts/check-mp-e2e.cjs` entered the game at `/` (now the tour site) and, on a flag-on build, the people button opens the
    three choices first: it now enters at `/play`, taps "With friends" when the choices show, and clicks the VISIBLE "Join with a code"
    (a flag-on page has a second, hidden one). No check changed.

## Defects found and NOT fixed
- (Low, FIXED in this pass: defect 12) A room entered while your world is full (24) could land in another world.
- (Low, left as designed) After `/control` reopens, an idle player only reconnects on input once the 2-min slow retry has passed (a tap
  on "With other players" retries at once). Not trivial to change without a timer or a poll (heat rule: no polling); left as is.
- (Medium, FIXED Nov 12) Konbini: a stranger could almost never be tapped (the shelf boxes behind every floor spot took the tap).
  Owner decision: in the Konbini only, the nearer thing wins. `konbiniScene.shelfDepth()` gives the depth of the shelf a tap hits (moves
  nothing), `roomTapPlayerNearer` (RoomPlayerTap.tsx, synchronous: the tap module is preloaded with the card) opens the card only when
  the stranger's tapped body point is nearer (`remotePick.playerNearer`); otherwise the shelf pick runs exactly as before. Arcade /
  Museum / Shop unchanged. Pinned by `tests/mp-player-tap.cjs`; browser: `scripts/check-mp-konbini-tap.cjs` (phone, desktop, off).
- (Info) Arcade: a tap on a stranger opens the card AND the floor tap-to-walk still runs (the Arcade calls `pick` before checking
  `cabinetAt`), so you walk toward the player you tapped. Harmless; other rooms do not walk.
- (Info) In a joined live match the island HUD (people button) is hidden, so "switch mid-match" is only reachable if the panel is
  already open (the final pass opened it by script); a kid leaves the match with X first. The warning itself works (B3).
- (Info) Two teleports within 5 s: the relay keeps one Warp per 5 s, so the second jump is dropped and others see you at the old spot
  until the client's Warp retry (5.5 s later). Party behaviour since relay v1; only debug teleports hit it in practice.
- (Info) Gap 8: the "7 errors" overlay in the old `public-island-outdoor-23.png` did not reproduce (0 page or console errors, flag on,
  synthetic and real sockets). The likeliest source was a dev hot-reload error from files being edited during that run (like defect 3);
  nothing points at public-island runtime code. The screenshot was refreshed by the re-run.
- (Info) Gap 9: a room page opened by direct link joins no world (no socket, no chip, no error). Documented, not changed.

## Before switching on for real players
- Owner steps in `PUBLIC-OWNER-STEPS.md` (relay v3 deploy with `CONTROL_TOKEN`, Vercel flags, billing alert, admin kill switch check).
- Lawyer answers on default-on and the copy in `PUBLIC-COPY-REVIEW.md` (now including the /learn and About rows).
- Set `POLICY_UPDATED_PUBLIC`; decide whether "about 15 MB an hour" stays as the upper figure (measured ~10).
- Never tested here: real Cloudflare (Durable Objects, rate-limit bindings, eviction), real phones (heat, battery, data), real children,
  mobile networks, more than one relay region, the production build end to end with the flag on. (A drop-in match between strangers
  and switching while swimming / flying / on a boat were run in the final pass, on DEV builds.)


## Phase 1 sign-off (final pass, Nov 11 2026)

**Proven locally** (dev relay in world mode, Next DEV servers flag on and flag off, headless Chrome phone 390x664 and desktop, raw world
puppets and bots): strangers see each other with generated names only; Wave / Hide / Report on the island and in the Arcade, Museum and
Shop (card on screen, clear of the thumb controls, objects and islanders keep priority); switching Just me / With other players while
walking, swimming, flying and on a boat (others fade, state unchanged, others see the right mode again); a live drop-in match shared by
two strangers and a mid-match switch (warning, match plays on, the slot goes back to the computer); map without stranger dots and with
party dots; flag OFF unchanged in the browser; the relay's lobby, caps, reports, quarantine, following guard and kill switch (unit and
socket tests); full suite, both typechecks and lint (see F).

**Only provable after the owner's steps:** the real Cloudflare relay (Durable Objects, the v3 migration, rate-limit bindings, eviction,
more than one region), a production build with the flag on, two real phones on mobile networks (heat, battery, data per hour), real
children, the lawyer's answers. The Konbini tap item (Medium, above) is fixed (Nov 12).

**Owner's checklist, in order** (details: [PUBLIC-OWNER-STEPS.md](PUBLIC-OWNER-STEPS.md)):
1. Lawyer: the seven questions, the copy in `PUBLIC-COPY-REVIEW.md`, then set `POLICY_UPDATED_PUBLIC`.
2. Release the batch in `PHASE1-RELEASE-FILES.md` with the flag OFF (nothing visible changes; the relay code ships closed).
3. Relay: `wrangler deploy --dry-run`, `wrangler secret put CONTROL_TOKEN`, `wrangler deploy`; check `GET /world` answers `{"open":false}`
   and parties still work.
4. Vercel: the flag on a preview only; billing alert; the /admin kill switch closes and reopens.
5. Family beta with two phones (the ten steps in section 6), including the 20-minute warmth and battery note.
6. Only then: `POST /control {"public":true}` and the flag on in production; rollback = close with `/control`, then `wrangler rollback`.
