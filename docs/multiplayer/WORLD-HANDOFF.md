# Public worlds: relay handoff (relay v2.0, Nov 11 2026, Agent A)

Built in `multiplayer/**` only, not deployed. Private parties work exactly as before: a party socket is still offered `S.Caps 255` and never sees any of this. Shared constants live in `multiplayer/protocol/*`; import them from there and never copy the numbers.

## Routes (worker `multiplayer/relay/src/index.ts`; dev relay serves the same ones)
- `GET /world[?in=N]` → `{open:true, shard, n}` or `{open:false}`. `n` = members in that world now, not counting the caller (for "N on now"). `in=N` = the world I am rejoining: the lobby keeps me there while that world exists, also when it is full (I usually still hold a seat: the room resumes it, and refuses a fresh join with Full; then ask once without `in`). Without `in`, the lobby picks the fullest world under `WORLD_SOFT`, and opens a new one only when every world is at the soft cap. It never returns names, ids or positions. `open:false` means public play is off, not configured (an old relay answers 404: treat any non-200 the same way), or all 64 worlds are full. In every one of those cases, go to Just me quietly.
- `GET /world/:shard/ws`: the WebSocket. It has the same origin allow-list as party sockets and is rate limited per daily IP hash. When public play is off, it opens and closes at once with `CloseCode.WorldOff`.
- `GET /control` / `POST /control {"public":true|false}`: owner only (server-to-server, `Authorization: Bearer <CONTROL_TOKEN>`, no CORS). Both reply `{public, tokenSet, shards:[{shard,n}], total}`. They answer 404 while the secret is unset.
- Rate limits per IP hash and minute: 60 lookups and 30 world sockets. They use the `WORLD_RL` binding when it exists, otherwise in-isolate buckets. Party joins use `JOIN_RL` when it exists. Over the limit, the reply is 429 and the `rl:world_rate` counter goes up.

## Socket flow (world)
1. `C.Hello [0, 1, look, resumeToken|null, null]`. Send the 5-element form: the relay ignores any host key, drops a nick unread, and never refuses one in a world.
2. `S.Welcome [20, 1, you, token, 0, 0, 0, members]`. `members` = me plus only those I can see now. Each row has 5 elements `[id, [colour, animal], look, 0, pose]` with no nick slot.
3. `S.Caps [32, CAPS_WORLD]`. Answer `C.Caps [11, myBits & relayBits]`. Never send a bit the relay did not offer: an old relay's parser takes 0..255 only.
4. From then on, others arrive as `S.Joined` when they come into sight and leave as `S.Left [id, LeaveReason.Far]` when they go out of it. Upsert by id. A Far member may come back.
5. A resume (stored token within the grace) keeps the slot and the name. A fresh join always rolls a new name and a new token.

## New and changed messages (all integers)
| Frame | Layout | Notes |
|---|---|---|
| `C.Report` = 60 | `[60, memberId, ReportReason]` | Only when S.Caps has `Cap.Report`. Hide the player locally at once. The relay answers with `S.Left [id, Far]` and the two of you never see each other again this connection. Client ids are 0..19 and 60+; server ids are 20..59. |
| `S.Quiet` = 41 | `[41, near]` | `Cap.Quiet`. `near` = others in sight within `QUIET_RANGE_M`. Sent after C.Caps and on change (checked at 1 Hz). When `near` is 0 you may send poses at 2 Hz. |
| `S.World` = 42 | `[42, n]` | `Cap.World`. Members in my world, me included (0..30). Sent after C.Caps and on change. |
| `S.Left` | reason 4 = `LeaveReason.Far` | Out of sight (distance, another room, a report, quarantine or the following guard: you are never told which). Fade them out with no "left" message. |
| `NameIdx` | `[colour, animal]` | In a world, slot 1 indexes `WORLD_ANIMALS`. Show it with `worldNameFor(idx)` ("Teal Otter"). `nameFor` (colour only) still works, and old clients show just the colour. |
| `S.Caps` / `C.Caps` | 0..`CAPS_MAX` | Parser widened. A party still gets exactly 255. |
| Batch limits | Welcome / Poses / Live / Match roster up to `WORLD_HARD` (30) | They used to be capped at `PARTY_MAX` 20. |

## Capability bits
`Cap.World` 256, `Cap.Quiet` 512, `Cap.Report` 1024. `CAPS_WORLD` = Live | Ball | EmoteAsk | Kit | Match | World | Quiet | Report (1995): no Rename, NameLock or Hit. Detect world support with `GET /world`: a 200 with `open:true` means it is supported, anything else means fall back to Just me. `PROTOCOL_VERSION` stays 1.

## Constants to import (`multiplayer/protocol`)
`WORLD_SOFT` 26, `WORLD_HARD` 30 (raised from 20 / 24, owner, Nov 12 2026; member ids stay 0..31 with `WORLD_ID_SPARE` 2 spare, and seat holders count toward the cap), `WORLD_MAX_SHARDS` 64, `WORLD_SEE_M` 160 / `WORLD_SEE_BACK_M` 150, `QUIET_RANGE_M` 40, `WORLD_AWAY_GRACE_MS` 2 min, `WORLD_IDLE_MS` 5 min, `FOLLOW`, `REPORT` (window 10 min, 2 distinct reporters, hold 1 h, reporter bucket 0.1/s burst 3), `ReportReason` {Following 0, InMyWay 1, TooManyWaves 2, SomethingElse 3}, `REPORT_REASON_IDS`, `WORLD_ANIMALS` (32 reviewed), `WORLD_COLOUR_ORDER`, `worldNameFor`, `pickWorldName`, `CloseCode`, `CAPS_WORLD`, `CAPS_MAX`, `LeaveReason.Far`.

## Lobby counts (Nov 12 2026, live stress test fix)
- WorldLobby stores `counts` (`[shard, n, at]` rows, counts and times only) next to `public`: written on a change at most every 5 s and refreshed every 45 s while a world is known; reloaded on start (rows older than 90 s are dropped). A lobby restart no longer answers a full world as `n:0`.
- A world that refuses a fresh join with Full pushes its count at once (at most 1/s). A plain lookup never picks a shard at `WORLD_SOFT` or above; `?in=N` still keeps a seat holder on a full world (the room resumes the seat or refuses with Full, then the client asks once without `in`).
- The dev relay mirrors both, plus the 30 s heartbeat (it used to report on change only, so a stable world was pruned after 90 s).
- Clients draw a remote's swim / dive pose only off land and a jetpack only 1 m or more above the ground (`drawnAs` in `lib/graphics/remoteAvatars.ts`); the wire is unchanged.

## Close codes on a world socket (what the client does)
- `4007 WorldOff`: public play was switched off. Go to Just me quietly. Do not retry until a later `GET /world` (on the next visit or the next real input; never poll).
- `4008 Idle`: no real movement, or away, for 5 min. Go to Just me quietly, and reconnect through `GET /world?in=<shard>` on the next real input.
- `4006 Refused` + `S.Error Full`: the world is full (30). Call `GET /world` again once, without `in`. The room pushes its count to the lobby when it refuses, so that retry goes to another world.
- These are unchanged from parties: `4005 Replaced`, `4002 Flood`, `4001 BadMessages`, `4000 HelloTimeout`, `1000` after your own Leave.

## What the relay enforces in world mode
- It silently refuses Kick, Lock, Rotate, End, NameLock, Rename, Ping (FollowMe/MeetHere), Hit and ResetName. Nothing is sent back and nothing counts as a bad frame. There is no host, no code and no expiry.
- Interest: nobody farther than 160 m is ever sent (no 1 Hz beacon), and someone who left sight comes back at 150 m. Indoors, you only see members in the same room code; a legacy door pose is visible to nobody. Within sight, the party rules apply: the nearest 12 at 5 Hz, 4 within 40 m at 10 Hz, and the 1 Hz beacon. Emotes, kits, balls and duets go only to those who can see the sender.
- Following guard (1 Hz): if A stays within 4 m of B for more than 45 s while B walks more than 30 m, B stops receiving A. It is released after A has been more than 15 m away for 30 s. When two kids walk together, the rule holds both ways, so a chaser also loses sight of the one being chased.
- Asks: after one No (or a card that timed out) from B, A cannot ask B again this connection. Asks need mutual sight.
- Report: one reporter can never quarantine anyone. A second report from the same reporter, or from another tab in the same home (same IP hash), is ignored. 2 distinct reporters within 10 min quarantine the target for that connection: nobody receives their poses, emotes, asks, kit, ball or match frames, they are not told, and they still see everyone. Their IP hash is held for 1 h in WorldLobby memory, so a fresh join lands in quarantine again. Stats are only the daily counters `rl:report_<reason>` and `rl:quarantine`.
- Slots: 60 s after a plain drop, 2 min after an announced away (room page, menu, background), then the slot is freed. A connected member who is idle or away for 5 min is closed with 4008.

## Dev relay and bots (port 8790; kill by PID or `lsof -ti :8790 | xargs kill`)
- `MP_PORT=8790 MP_DEV=1 MP_WORLD_OPEN=1 node multiplayer/dev-relay/server.mjs`. `MP_WORLD_OPEN=1` opens public play locally (without it, the world starts closed, like production). `MP_CONTROL_TOKEN=<16+ chars>` enables `/control`. With `MP_DEV=1`, `?devip=<label>` on `/world` and `/ws` stands in for a distinct IP (needed so reports from bots count as distinct reporters), and `GET /dev/metrics` shows frames, the largest frame, tick ms and shard counts.
- `node --experimental-websocket multiplayer/bots/bot.mjs --world --n 30 --ms 60000 --devip p1 --emote-every 7000 [--spread 3000] [--speed 1.5] [--follow 2] [--report] [--nick Emma] [--summary]`. Use a different `--devip` per process.
- Open or close locally: `curl -X POST -H "Authorization: Bearer $MP_CONTROL_TOKEN" -d '{"public":false}' http://127.0.0.1:8790/control`.

## Owner: deploy steps (in order; nothing has been run)
1. `cd multiplayer/relay && npx wrangler deploy --dry-run` to check that `[[ratelimits]]` parses. Older wranglers need the same two bindings as `[[unsafe.bindings]] type = "ratelimit"`. You can delete both blocks: the code then falls back to in-isolate buckets.
2. `npx wrangler secret put CONTROL_TOKEN` (32+ random chars; keep it next to `STATS_TOKEN`).
3. `npx wrangler deploy`. This applies migration `v3` (new class `WorldLobby`, binding `LOBBY`; v1 and v2 are unchanged) and the rate-limit bindings. Public play is still CLOSED.
4. Check: `curl https://<relay>/world -H 'Origin: https://futbolisland.app'` → `{"open":false}`; parties still work.
5. To open, when the owner says go: `curl -X POST https://<relay>/control -H "Authorization: Bearer $CONTROL_TOKEN" -H 'content-type: application/json' -d '{"public":true}'`. Check counts with `curl https://<relay>/control -H "Authorization: Bearer $CONTROL_TOKEN"`. To close: the same POST with `false` closes every world at once (and each world closes itself within 30 s on its next count report).
6. Rollback: close with `/control` first, then `wrangler rollback` to the previous version. Keep the v3 migration: a deleted class needs a `deleted_classes` migration, so do not remove it. Removing `CONTROL_TOKEN` also forces public play closed.

## Client agents must not assume
- That every member is in the roster: you only know those in sight. Use `S.World` for the count, never the roster size.
- That `S.Left` means "left the island": Far is common and silent. Expect ids to be reused after a Left.
- That a name is stable across visits, or that a nick, host, code, expiry or lock exists in a world (Welcome carries 0s).
- That a report is acknowledged beyond the Far, or that you will learn whether anyone was quarantined.
- That `S.Quiet` arrives faster than 1 Hz, or that the relay enforces the 2 Hz rate (only the existing buckets apply).
- That hides, reports, follow pairs or holds survive a relay restart or eviction (only the quarantine flag rides the socket attachment), or that the lobby's counts are exact (they lag by up to a report and a 15 s reservation).
- That matches are off: `Cap.Match` is offered in worlds (the plan says "play matches"). Match rosters are ids only and go to every Cap.Match member of the world. Ask the coordinator if strangers' shared matches should wait for phase 3.
