# Public island: build plan (Nov 11 2026)

Status: APPROVED TO BUILD by the owner ("go ahead and build"). Phase 1 is built behind flags and stays OFF on the live site until the owner says go. Source: a read-only audit of the multiplayer code plus owner decisions on Nov 11.

## Owner decisions (binding)
1. One island, not two: public and private are the same map and the same save. A presence switch decides whether other players are visible.
2. The switch lives in the existing play-with-friends button (people icon in the island HUD, `components/IslandSettings.tsx:143` → `components/party/PartyHost.tsx`). Three choices: "Just me" / "With other players" (with a count) / "With friends" (today's private party by code). Tapping Play on the site is unchanged.
3. Default is "With other players". "Just me" is one tap away; a grown-up can lock it.
4. A world holds about 16-20 players; when it is full the next player starts another world, and new arrivals always go to the fullest world with room.
5. Build now; legal review of default-on happens before it is switched on for real players.

Coordinator recommendations adopted unless the owner says otherwise: new players finish the tutorial in "Just me" and others appear afterwards with a one-time card; world cap soft 20 / hard 24; generated names are colour + animal and change every visit (strangers only); shirt numbers visible; strangers ARE shown in the Arcade, Shop and Museum in phase 1 (owner, Nov 11: "allow seeing strangers in arcade, shop, and museum for phase 1"; the Konbini follows the same rule unless the owner says otherwise); a 10% holdout arm is wired but its reading waits for legal sign-off; party friends do not also see the public world; the existing grown-up "Off" turns public play off too, with a new middle setting "Friends only".

## What exists (verified in code)
- Relay: Cloudflare Worker `futbol-party-relay` (`multiplayer/relay/`), Durable Objects `PARTY` (PartyRoom) and `STATS` (RelayStats). One DO per party, hibernatable sockets, 10 Hz timer only while 2+ sockets are open. Pure room logic in `multiplayer/relay/src/roomCore.ts` (also used by the Node dev relay `multiplayer/dev-relay/server.mjs`).
- Limits: `PARTY_MAX` 20, member ids 0..31, pose 12/s, emote 0.5/s + 10/min, inbound frame cap 512 B, flood close. Interest: nearest 12 at 5 Hz, nearest 4 within 40 m at 10 Hz, 1 Hz beacon for the rest.
- Client: singleton `lib/multiplayer/connection.ts`; flags `NEXT_PUBLIC_MULTIPLAYER`, `NEXT_PUBLIC_MULTIPLAYER_URL`; remote players in `lib/graphics/remoteAvatars.ts` (animated rigs capped by heat tier 5/5/3/1/0, the rest as a colour ring + label).
- Identity: the only free text is the typed first name (letters, 2-12, no block-list), memory only. Kits sent to others are colours and indexes only (never the drawing, crest or printed name). Emotes and match phrases are integer ids.
- Personal vs shared: ball hunt, fish, beach finds, jobs, vending, gashapon, cards and coins never touch multiplayer code: they are per player. Shared: live-match slots, consent-based duets, ball knock-overs.
- Safety today: grown-up switch `fi2-multiplayer-allowed-v1` (Allowed/Off) hides the button; host tools in parties; local Hide and Mute. No reporting, nothing for strangers, no admin moderation of live players.
- No A/B machinery exists. Party-retention analytics exist but are off pending legal sign-off.
- No real-iPhone heat measurement exists for remote players.

## Architecture
- Three modes on the one connection: Just me (no socket) / With other players (`/world/:shard/ws`) / With friends (`/party/:code/ws`). A pending or stored party always wins.
- World = `PartyRoom`/`RoomCore` with `kind:'world'`, named `pub-1`, `pub-2`...: no host, no code, no expiry; host controls, Rename, Ping (FollowMe/MeetHere) and Hit refused; the nick in Hello is dropped; the relay assigns `[colour, animal]` using the reserved second name slot (old clients show the colour); away grace 2 min, idle > 5 min frees the slot.
- Assignment: `GET /world` → new `WorldLobby` singleton DO (migration v3) with a live count per shard; returns `{shard, n, open}`; fill to soft 20, hard 24; a shard closes when empty.
- Strangers beyond 160 m are not sent at all; strangers never appear on the map. A `Cap.Quiet` hint lets a client send 2 Hz when nobody is within 40 m.
- Connect lazily (after island ready, tutorial done, first input, ~3 s idle). Unreachable, full or switched off: fall back silently to Just me, retry quietly.
- Indoor rooms: the Arcade, Shop and Museum pages (and the Konbini) DO connect in world mode in phase 1 (owner decision). They reconnect through the stored session like party rooms do today (`components/party/useRoomParty.ts`, `lib/arcade/arcadeRoomParty.ts`), to the same world shard. Rooms are small (about 11 x 10 m), so: cap drawn strangers per room (nearest first, e.g. 6 rigs/rings in a room regardless of heat tier headroom), keep the personal-space fade, no stranger duets or knock-overs indoors, and the same Hide/Report from the room's roster. The stranger rules (generated names, no pings, no map) apply unchanged indoors.
- Switching: one tap, no reload; joining sends a first pose with the Warp flag (fade in); leaving sends Leave (fade out); switching during a shared live match is an implicit leave with a one-line warning.

## Safety (must hold with zero opt-in)
- Names: relay-generated in world mode; the client never sends a nick; a test asserts no world frame contains free text.
- Emotes: existing relay buckets plus a client cap of 6 stranger emotes per minute per sender; duet asks from a stranger are blocked for the session after one decline; none to someone who has hidden you.
- Removed between strangers: FollowMe/MeetHere pings, knock-overs, map dots, rename. Personal-space fade: remote rigs within 1.2 m drop to 40% alpha. No collision exists, so no body-blocking.
- Following guard (relay): A within 4 m of B for more than 45 s while B moves more than 30 m → B stops receiving A.
- Hide: local, for the session. Report: `C.Report [id, reason]` (Following / In my way / Too many waves / Something else); the reporter hides the player at once; 2+ distinct reporters in 10 min quarantine that member (invisible to everyone for that connection, 1-hour hold by daily IP hash in memory, never stored). Only daily counts are kept. No names, positions or ids stored.
- Grown-up lock: `fi2-multiplayer-allowed-v1` gains three values: all (default) / friends / off.
- Owner kill switch: `POST /control {public:false}` with bearer `CONTROL_TOKEN`; plus build flag `NEXT_PUBLIC_PUBLIC_WORLD=1`; an admin button.

## UX wording
Panel title "Who's on your island?": "Just me: Only you and the islanders." / "With other players · 8 on now: Kids playing right now. Wave, cheer and play matches. Nobody can chat." / "With friends: Friends you know join with a code." Count: number of others in your world up to 24, then "lots"; 0 reads "Nobody else right now". First-time card when another player first comes within 25 m: "These are other kids playing right now! You can wave, cheer and play matches. Nobody can chat. To play on your own, tap the people button." Device keys: `fi2-presence-mode-v1`, `fi2-public-hint-v1` (classify in `lib/saves/snapshot.ts`).

## Copy that must change before it is switched on
`lib/site/safety.ts` (SAFE_FACTS "No open chat" and "Grown-ups stay in charge", SAFE_FAQ on strangers, HUB_COMMON_FAQ), `components/privacy/PrivacyPolicy.tsx` (summary, section 7a: who can see whom, what strangers see, controls incl. Report and the three-way lock, Cloudflare, new counters, data use about 15 MB/h, reports kept as counts), `components/GrownUps.tsx:156`, `/play` metadata. These edits ship with the flag, not before.

## Cost (assumptions to verify on Cloudflare's pricing page)
About $5-7/month at 10 average concurrent players, $35-40 at 100, about $330 at 1,000 (8 inbound messages per player per second; halved where the Quiet hint applies).

## Phase 1 build split (no shared files)
| Agent | Area | Files |
|---|---|---|
| A | Relay and protocol | `multiplayer/protocol/*`, `multiplayer/relay/src/*`, `multiplayer/dev-relay/server.mjs`, `wrangler.toml` (v3), `multiplayer/bots/bot.mjs` (`--world`), tests `mp-protocol`, `mp-room-core`, new `mp-world.cjs` |
| B | Client | `lib/multiplayer/connection.ts`, new `lib/multiplayer/presenceMode.ts`, `invite.ts`, `lib/multiplayerAllowed.ts`, `tests/mp-client.cjs` |
| C | UI (after B) | `components/party/PartyHost.tsx`, new `PresenceChoice.tsx`, `ReportSheet.tsx`, `party.module.css`, `IslandSettings.tsx`, `tests/mp-ui.cjs`; the only agent that touches `components/Town.tsx` |
| D | Drawing | `lib/graphics/remoteAvatars.ts`, `components/FriendMapDots.tsx`, `tests/mp-avatars.cjs` |
| E | Copy and analytics | policy and safety copy (behind the flag), `lib/analytics/countIds.ts`, new `publicEvents.ts`, `app/admin/RelayHealth.tsx` |
Then a verify pass: relay unit tests, 3 headless clients switching modes, load with 4 × 24 bots on the dev relay, heat with 23 bots on the phone profile.

## Owner tasks before switching on
Lawyer answer on default-on (UK Children's Code standard 7; COPPA; state design codes); `wrangler deploy` of relay v3 with the new DO class and `CONTROL_TOKEN`; two Vercel flags; a Cloudflare billing alert; a two-iPhone heat check; a small family beta.

Owner decision (Nov 11, later): Air Futbol will NOT get online play between two phones ("don't build the multi player if it takes too long. have that be a single player game with high score"). It stays a solo game with its scoreboard; drop the air hockey online item from phase 3 below.

## Later phases
2: default on for everyone, onboarding card, existing-player hint, live count badge, holdout reading. 3: public match fields, "Match o'clock", island-wide daily goal, stranger duets, Arcade room in the world, air hockey online (owner-authoritative, 20 Hz, parties first). 4: second world and regional shards when `pub-1` is regularly full.

## Lawyer questions
1. Public play on by default for children: acceptable under UK AADC standards 7 and 11? Under COPPA, does seeing others with preset phrases and generated names make personal information publicly available? Fallbacks: (a) on only after a grown-up allows it once; (b) default "Just me" in the UK/EEA by edge geo, on elsewhere; (c) strangers shown as rings with no names.
2. Is keeping the typed first name private to parties enough, given it has no block-list?
3. Reports stored as counts only: acceptable, or is an incident record expected (UK Online Safety Act duties)?
4. Does relay-side quarantine by daily IP hash count as internal operations?
5. Is a holdout arm derived from an install id "profiling"?
6. Must the DPIA and policy name data use and Cloudflare's processing for public worlds?
