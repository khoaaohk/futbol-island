# Bug sweep, Oct 22 2026 (branch `qa-bugsweep`, from `integrate-dive-bugs-sealife` 0477c1e3)

Scope: the last two days of work, `git log da0a7f18..0477c1e3` (345 commits, 528 files): multiplayer (protocol, relay, dev relay,
client lib, party UI), rooms, presence / force field, emotes, analytics A/B/C + admin + privacy rewrite, keep-up counter, title /
Konbini UI, island path fixes, persistence / rejoin. Not edited (another agent's heat lane): `lib/graphics/remoteAvatars.ts`,
`lib/multiplayer/roomParty.ts`, the Arcade / Kit Shop room loops, emote allocation.

## What was checked

| Check | Result |
|---|---|
| `npx tsc --noEmit` (root) and `-p multiplayer/relay` | clean |
| `scripts/mp-relay-smoke.mjs` (6 bots + 20-bot party, 21st Full, cheat, flood, v1.1 rooms) | PASS |
| Relay edge script (dev relay, raw sockets: invalid codes, fuzzed frames, names, kick + rejoin, host leave, rotate, End) | 26/27 PASS (see note 1) |
| `scripts/check-mp-e2e.cjs` (two-device test, prod build with FI_VISITS_LOCAL=1) | 135/135 PASS |
| Browser checks (one browser at a time, same build) | see table below |
| Focused unit tests (mp-client, mp-protocol, mp-room-core, mp-relay-stats, mp-rooms, mp-ui, mp-isolation, mp-avatars, emote-contexts, keepup-counter, konbini, island-connectivity, admin-analytics-party, privacy-page-font) | PASS |
| Full `npm run test:quiet` (end of sweep) | 268/269 (one midnight flake, see bottom) |

| Browser check (prod build: NEXT_PUBLIC_MULTIPLAYER=1, FI_VISITS_LOCAL=1, dev relay MP_DEV=1) | Result | Time |
|---|---|---|
| check-mp-e2e | 135/135 PASS | ~25 min |
| check-party-rejoin | PASS | 173 s |
| check-party-persist | PASS (no page errors) | 274 s |
| check-mp-presence | PASS | 77 s |
| check-mp-rooms | PASS | 124 s |
| check-mp-rooms-end (End / kick / Battery saver inside rooms) | PASS | 67 s |
| check-mp-rooms-cross | PASS | 216 s |
| check-konbini-emote-rule | PASS | 92 s |
| check-mp-rooms-museum | PASS | 121 s |
| check-mp-rooms-shop | PASS | 114 s |
| check-mp-rooms-arcade | PASS | 201 s |
| check-gate-invite | PASS with `START=1 RELAY_URL=<relay>` (without them the script stops at the title: setup, not a bug) | ~2 min |

Not run (outside this sweep's scope, unchanged areas, ~80 older browser scripts for lessons, arcade games, stories, vending, etc.;
running all of them one browser at a time would take hours on the owner's Mac): every other `scripts/check-*`. Not run either:
check-mp-heat-recheck / check-mp-rooms-heat (the heat agent's lane, measured there).

Note 1: the "20 more joiners" probe got no Welcome and no Full because the relay's per-address join limit (10 / min) refused the
upgrades first: expected behaviour. The 21st-joiner Full is covered by the smoke test (20-bot party) and `tests/mp-room-core.cjs`.

Code read critically: `lib/multiplayer/connection.ts`, `store.ts`, `roomParty.ts` (read only), `townBridge.ts`, `invite.ts`,
`presence.ts` (entry warp), `components/party/useRoomParty.ts`, `components/MuseumRoom.tsx` party wiring,
`multiplayer/relay/src/roomCore.ts`, `partyRoom.ts`, `index.ts`, `relayStats*.ts`, `multiplayer/protocol/validate.ts`, the three new
admin routes, `supabase/migrations/20261022_analytics_party_retention.sql`, `lib/analytics/partyRetentionEvents.ts`, the privacy
policy diff, the keep-up / Konbini ball diff, the island path diff, `__fi2` hooks and leftover debug lines in the diff.

## Fixed (each with a test, each its own commit)

1. **Medium: a party that ends or refuses while the tab is hidden came back as "Reconnecting"** (`lib/multiplayer/connection.ts`).
   The 15 s hidden-close timer kept running after `S.Ended` / `S.Error` (Kicked, Expired, ...): it set status `reconnecting` and
   `pendingResume`, and on return the page opened sockets to a finished party (up to 12 attempts). Repro: be in a party, switch apps,
   host ends the party within 15 s, come back. Fix: those handlers clear the timers and the pending resume; the timer ignores a
   finished status. Test: `tests/mp-client.cjs` "bug sweep Oct 22: the party ends / refuses while the tab is hidden".
2. **Low: a Web Lock granted after Leave / a newer Join / dispose was never released** (`connection.ts`). The page then held
   `fi2-party-holder` while idle, so another tab's resume read "elsewhere". Fix: a stale grant releases the lock at once. Test:
   "a lock granted after Leave / a newer Join is let go".
3. **Low (privacy accuracy): an expired stored party session was ignored but never removed** (`connection.ts` readSession). The
   policy says it is removed after 12 h at most. Fix: removed when read past the cap. Test assertion in "rejoin: the session lives in
   device storage".
4. **Low (privacy accuracy): policy 7a said only whoever STARTS a party has the host controls.** The relay hands them to the
   longest-present player when the starter leaves or stays disconnected. Sentence corrected, `[LAWYER]` note added
   (`components/privacy/PrivacyPolicy.tsx`).
5. **Low: island friend layer kept a departed friend's last island spot** (`lib/multiplayer/townBridge.ts`). Member ids are reused
   after a leave; a newcomer first heard inside a room could fade in at the old friend's door. Fix: prune on every sync, clear when
   the party ends.

## Checked, no bug found

- Relay: resume before lock / expiry checks; lapsed resume Hello (empty name slot) -> BadName; kicked token revoked + 60 s kick lock;
  host leave migrates at once to the oldest member; retired codes admit only resume / host key; End -> 4004 + tombstone; `/init` and
  `/alias` are not reachable from the worker routes; stats carry counts only (no code, name, IP, token); `/stats` bearer-only, no CORS.
- Protocol: fuzzed frames (bad JSON, wrong lengths, out-of-range ints, 1e309) are refused; 5 bad frames close with 4001; a full
  20-member Welcome with 12-letter accented names is far under the 8 KB server cap.
- Names: accents accepted ("Émilie"), empty / blank / over 12 letters refused with BadName; the UI filters to letters and 12 chars.
- Analytics: Phase C sends nothing unless `NEXT_PUBLIC_ANALYTICS_PARTY_RETENTION=1`; admin routes all check the admin session; SQL
  functions are `security definer`, revoked from public / anon / authenticated, granted to service_role only; RLS on the weekly table;
  every output count under 10 is null. The party session key and `fi2-mp-firsts-v1` are DEVICE keys (never in a save code).
- `window.__fi2` additions are local game objects only (no codes, tokens, host keys). No new console.log / TODO / debugger in the diff.
- Dead code: no party QR, no animal identity, no Space emote id, no e10-e18 ride ids left in lib / components / analytics allowlists.

## Left (not fixed: owner / other lane / by design)

- **Low, privacy wording:** the stored party session's `at` is refreshed on every Welcome, so after a resume late in a 12 h party the
  record can stay up to ~12 h past the party's end if the device never opens the game again (it is removed on the next read). The
  policy says "after 12 hours at most". Option: store the party's end time (Welcome `partyEndsAt`) instead. Needs a decision.
- **Low, analytics (Phase C, off):** `watchPartyAway` closes the away stretch on `pagehide`; a page kept in the back/forward cache
  loses the rest of that stretch. Undercounts only.
- **Low, SQL small cells:** `analytics_party_retention` shows a D1 / D7 rate whenever 10+ players are eligible, so a rate of 0.1 on 10
  players implies 1 player. Matches the documented rule; worth a lawyer note before Phase C goes on.
- **Info, Konbini keep-up:** `press()` returns true for a press that is only pending (in the window above the foot); no caller
  counts it as a touch today.
- **Heat lane (not edited):** none found in `roomParty.ts`; `createFriendCore.dispose()` keeps a no-op `void unbind` line.

## Full suite

`npm run test:quiet`: **268/269 passed**; the one failure is `tests/admin-analytics-day.cjs` line 234 (`live.sessions` 4 !== 1),
a pre-existing time-of-day flake, not from this sweep: the test places "today" sessions at 0.1 / 0.5 / 1 h after Pacific midnight,
and the run happened at 00:02 PDT, so those sessions counted as live. It passes outside the first ~70 minutes after Pacific
midnight. Suggested fix (left for the analytics owner): place the test's "today" sessions relative to `now() - interval '2 hours'`.

