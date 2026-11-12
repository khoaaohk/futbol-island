# Public island: client handoff (Nov 11 2026, Agent B)

Built in `lib/multiplayer/**`, `lib/multiplayerAllowed.ts`, `components/party/useRoomParty.ts`, `lib/arcade/arcadeRoomParty.ts`. Off unless `publicWorldEnabled()` (both build flags). Tests: `tests/mp-presence.cjs` (in `TEST_CORE_CHAIN`), `tests/mp-client.cjs`. Relay contract: `WORLD-HANDOFF.md`.

## Presence (`lib/multiplayer/presenceMode.ts`)
- `type PresenceMode = 'solo' | 'public' | 'party'`, `type PresenceChoice = 'solo' | 'public'` (stored in `fi2-presence-mode-v1` as `'solo'|'others'`; nothing stored = `holdoutDefaultMode()`).
- `usePresence(): PresenceState` (React) / `presence.get()` / `presence.subscribe(fn)`. `PresenceState` = `{ choice, defaulted, mode, reason, lock, flag, tutorialDone, relay, party, connected, count, sharedMatch }`.
- `mode` is the EFFECTIVE mode; `choice` is what the switch shows selected. `reason` (why mode differs): `'flag' | 'locked-friends' | 'locked-off' | 'tutorial' | 'closed' | 'unavailable' | null`. Order: lock off > party > flag > lock friends > own choice > tutorial > relay closed / unavailable.
- `resolvePresence(inputs)` is the pure table; `worldResumeAllowed()` (flag && lock all && choice public) is what room pages use.
- `presence.onEvent(fn)` → `PresenceEvent`: `arm{arm}`, `connect`, `seen`, `switch{to}`, `hide`, `report{reason: 'following'|'inmyway'|'waves'|'other'}`, `fallback{why: 'full'|'unreachable'}`, `match_join`.

## Driver + helpers (`lib/multiplayer/publicWorld.ts`; light: no three.js, no analytics)
- `createPublicWorld({ conn, look }): PublicWorld` → `islandReady(on)`, `tutorialDone(on)`, `noteInput()`, `setMode(m)`, `refresh()`, `dispose()` (keeps the socket).
- Module helpers (work on the page's one connection, attached by `roomParty.partyConnection()`):
  `setMode(m: 'solo'|'public')`, `isPublic(): boolean` (socket kind is world), `publicCount(): number | null` (others, not me), `othersNear(): boolean` (S.Quiet > 0), `inSharedMatch(): boolean` (+ `onSharedMatch(fn)` in `sharedMatch.ts`),
  `hideMember(id)`, `unhideMember(id)`, `hidden(): ReadonlySet<MemberId>`, `reportMember(id, reasonWire: ReportReason 0..3): boolean` (hides at once; sends `C.Report` when the relay offered `Cap.Report`).
- Lazy connect: island ready + tutorial done + first input (any time) + 3 s one-shot timer + idle callback. Never blocks paint or input.
- Silent fallback: lobby non-200 / `open:false` / close 4007 / still full → Just me with `reason` set; network or socket drops retry 1/2/4/8/15 s inside the connection; then a retry at most every 2 min ON THE NEXT `noteInput()` (no timer). 4008 idle / 4005: reconnect on the next input, same shard (`?in=`). Tapping "With other players" retries at once.
- Switching: `setMode('solo')` sends `C.Leave` and closes; `setMode('public')` connects (first pose after Welcome is a Warp: others fade me in). `conn.join(code)` (party) sends Leave on the world first. When the party ends / is left, the driver returns to the remembered choice. A pending link (`hasPendingParty()`), a stored party session (not lapsed), or another tab's party all count as `party`.

## Connection (`lib/multiplayer/connection.ts`, additions only)
`joinWorld({look}): boolean`, `kind: 'party'|'world'|null`, `shard`, `worldCount`, `near`, `hasWorldSession()`, `forgetWorld()`, `report(id, reason)`, `onWorld(fn)` (`live | count | quiet | fallback{why}`), `resume({look, world?: boolean})`. In a world: 5-element Hello (never a nick or host key), caps answered `& CAPS_WORLD`, `sendPing`/`sendHit` → false, `rename` → null, `host.*` send nothing, poses at 2 Hz while `near === 0`, ≤ 6 stranger emotes / min / sender and nothing (emote, ask) from a hidden member reach `onMessage`. World slot per TAB in sessionStorage `fi2-world-session-v1` `{shard, resumeToken, at}`, 2 min from the last Welcome / page hide.

## Store (`partyStore` / `usePartyState()`)
`state.kind` (`'party'|'world'|null`). In a world, `member.name` is the generated pair (`worldNameFor`: "Teal Otter"), `nick` is always null, `member.nameIdx = [colour, animal]`; the roster is only who is in sight (use `count`, never the roster size). Leaving a world clears the roster at once.

## Grown-up lock (`lib/multiplayerAllowed.ts`)
`type MultiplayerLock = 'all'|'friends'|'off'`, `multiplayerLock()`, `setMultiplayerLock(v)`, `publicAllowed()`, `parseLock(raw)`, `MULTIPLAYER_LOCKS`. Unchanged: `multiplayerAllowed()` (= lock not off), `setMultiplayerAllowed(on)` (all / off), `subscribeMultiplayerAllowed(fn)`, `ALLOWED_KEY`. Same key; old values read the same ('off' = off, missing = all). Presence re-reads it on change: no extra call needed.

## UI agent (C): exact wiring
**Town.tsx** (only where `multiplayerEnabled() && publicWorldEnabled()`):
1. Once after the scene / `partyConnection()` exist: `const pub = createPublicWorld({ conn: partyConnection(), look: partyLook })`; `pub.dispose()` in the existing disposers.
2. `pub.islandReady(ready && !failed)` (same value PartyHost gets as `islandReady`).
3. `pub.tutorialDone(done)`: the REAL "tutorial / onboarding finished" (not just `!onboardingOpen` on the first render; `shouldShowIslandOnboarding()` false and the card closed).
4. `pub.noteInput()` on discrete inputs: pointerdown on the canvas, keydown, joystick start, HUD taps. Never per frame.
5. Counters: `presence.onEvent(e => …)` → `countPublicArm(e.arm)`, `countPublicConnect()`, `countPublicSeen()`, `countPublicSwitch(e.to)`, `countPublicHide()`, `countPublicReport(e.reason)`, `countPublicFallback(e.why)`, `countPublicMatchJoin()` (`lib/analytics/publicEvents.ts`). In the frame loop next to `partyFrame`: `publicFrame(performance.now(), othersNear())`.
**PartyHost.tsx**: `usePresence()` for the three choices. "Just me" / "With other players" → `setMode('solo'|'public')`; "With friends" → today's create / join flows (they leave the world themselves). Before a switch, if `inSharedMatch()`, show the one-line warning. Count: `presence.count` (0 = "Nobody else right now", > 24 = "lots"). Explain `reason` ('locked-friends': a grown-up chose Friends only; 'tutorial'; 'closed' / 'unavailable': show nothing alarming). Gate EVERY party-only affordance on `partyStore.get().kind === 'party'` (code, invite / share, host tools, Follow me / Meet here, Change name, nick field, party end timer): `status === 'live'` alone is now also true in a world. World roster: Hide (`hideMember`) / Report sheet (`reportMember(id, ReportReason.X)`); hidden ones from `hidden()`.
**RoomPartyChip.tsx** (rooms): same `kind` gate; Hide / Report from the room roster; Leave in a world = `setMode('solo')`.
**IslandSettings.tsx**: the three-way lock with `multiplayerLock()` / `setMultiplayerLock(v)` / `subscribeMultiplayerAllowed`.

## Drawing agent (D) can read
`partyStore.get().members` (`name`, `nameIdx`, `room`, `presence`), `partyStore.get().kind` / `isPublic()`, `hidden()` + `onHiddenStrangers(fn)` (strangers.ts). Hidden strangers are already hidden in the avatar layer (`roomParty` applyFilters unions them while `kind === 'world'`). Map dots: hide when `isPublic()`.

## Heat (timers added)
Solo: none. Driver: one one-shot 3 s timer + one idle callback per page, only while public and waiting for the gate. World socket: the party's existing 5 s beat, backoff retries and 15 s hidden-tab close; one `GET /world` per (re)connect. The 2-min slow retry is input-driven. Quiet halves-to-fifths outgoing poses when nobody is near.

## Local testing
`NEXT_PUBLIC_MULTIPLAYER=1 NEXT_PUBLIC_MULTIPLAYER_URL=http://127.0.0.1:8790 NEXT_PUBLIC_PUBLIC_WORLD=1`, relay `MP_PORT=8790 MP_DEV=1 MP_WORLD_OPEN=1 MP_CONTROL_TOKEN=<16+> node multiplayer/dev-relay/server.mjs`, bots `node --experimental-websocket multiplayer/bots/bot.mjs --world --n 4 --ms 120000 --devip b1 --spread 100`.

## Open points
- Match after a mid-match switch / drop: matchLink tears down the shared link, friends' slots go back to the AI and the local match PLAYS ON from its current state (the last snapshot for a puppet); the line says "Lost your friends' match: the game plays on here" (party wording: C may want a stranger version).
- `WORLD-HANDOFF.md` says `CAPS_WORLD` = 1999; the constant (and what the relay sends) is 1995 (1999 would include Rename).
- Room pages enter a world only through the tab's world slot (the island must have connected first); the Arcade page re-checks the lock only when `allowed` flips (useArcadeRoomParty.ts passes the old boolean).
