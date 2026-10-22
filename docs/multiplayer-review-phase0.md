# Multiplayer Phase 0: security + sync review (Oct 22 2026, read-only Opus review)

Repo @ `integrate-dive-bugs-sealife` 4bcbde9c. Verdict: **safe to enable behind the flag for a two-device test on the dev relay or a
private preview once #4, #8 (button) and #9 are fixed**; during that test avoid "New code" and reload-and-rejoin. **No public relay
deploy until #1-#3 are fixed; #5-#7 before real children use it.** Status of each item is tracked in the "Fix status" column
(updated by the fix pass).

| # | Sev | Where | Problem | Fix | Fix status |
|---|---|---|---|---|---|
| 1 | P0 | connection.ts:143-164; partyRoom.ts:45; dev-relay/server.mjs:53 | After Rotate the old code is retired at once; the client ignores `S.Code`, guests never learn the new code, any reconnect dials the retired code and gets 404 | RoomCore keeps `retiredCodes`: /ws accepts current or retired, a retired code admits only a Hello with a valid resume token or hostKey; client updates `code` + session on `S.Code` | open |
| 2 | P0 (public deploy) | partyRoom.ts:84-122; roomCore.ts:52-62 | DO storage holds only {name, createdAt, hostKey}: eviction revives ended parties, rotated codes, undoes lock/kick revocations | persist {code, codeIssuedAt, locked, ended, revoked}; deleteAll + tombstone on End; load() refuses ended/expired; serializeAttachment for members | open |
| 3 | P1 | partyRoom.ts:137 | alarm reset on every frame (billed write per pose); with one socket the tick never runs (no grace expiry, host migration, 4 h cap) | set the alarm only when none is pending | open |
| 4 | P1 (before test) | Town.tsx:1848 + townBridge.ts:24 + PartyHost.tsx:75 | bindConnection runs twice: messages applied twice, poses pushed twice (blinking friends), doubled emotes | remove PartyHost's bind effect or WeakSet guard | open |
| 5 | P1 | store.ts:39-92; PartyHost.tsx:236 | host never sees the party as locked (locked only read from Welcome) | optimistic store update or server echo | open |
| 6 | P1 | roomCore.ts:145-150; PartyHost.tsx:229 | a kicked child can rejoin at once with the same code | post-kick "New code / Lock" prompt (needs #1) or server auto-lock 60 s | open |
| 7 | P1 | connection.ts:246; roomCore.ts:219-226,280 | lastSeq kept on resume but client restarts seq at 0 (frozen avatar); `seq & 0xffff` wraps after ~3.6 h | lastSeq=-1 on resume; drop the mask | open |
| 8 | P1 | invite.ts:115; IslandSettings.tsx | nothing calls `openPartyMenu` (no way to start a party); gated Settings switch (`fi2-multiplayer-allowed-v1`) missing | action-grid "Play with friends" button; gated Settings toggle | open |
| 9 | P1 (test blocker) | invite.ts:43-45 | partyLink always uses SITE_URL (links/QR from localhost/preview open production, flag off) | use location.origin for dev/preview origins | open |
| 10 | P2 | relay/src/index.ts:13 | Vercel regex matches any futbol-island-* project; localhost allowed in prod; missing Origin allowed | pin to team suffix; localhost dev only | open |
| 11 | P2 | index.ts:19-47 | isolate-memory buckets; limits.clear() at >5000 keys resets lockouts; school NAT shares limits | Rate Limiting binding (Phase 1); LRU meanwhile | open |
| 12 | P2 | index.ts:86; dev-relay/server.mjs:40 | decodeURIComponent throws -> 500 | try/catch -> 404 | open |
| 13 | P2 | partyRoom.ts:107-111 | Rotate alias: no collision check, fire-and-forget write, never cleaned | await alias write; refuse if saved exists; TTL | open |
| 14 | P2 | partyRoom.ts:21,89 | raw hostKey bytes stored | store SHA-256, compare digests | open |
| 15 | P2 | connection.ts:139 | close codes ignored; duplicated tab loops on Replace (4005) | 4003/4004/4005 terminal | open |
| 16 | P2 | PartyHost.tsx:120-123 | Kicked -> status error, "You left the party" toast never shows | handle error+Kicked | open |
| 17 | P2 | connection.ts:238-239; townBridge.ts:39-43 | Hidden flag never sent, Indoors never produced; 8 s dim, 10-min warning, Rejoin chip, "join as X", spawn at host zone missing | send Hidden on hide, Indoors on pagehide; rest Phase 1 | open |
| 18 | P2 | limits.ts:37-57; townBridge.ts:39-40 | Parachute/Zipline/AnimalRide/Fishing never set, cannon flights report Run (speed check drops poses); OOB poses count as bad (5 => close 4001) | map modes; clamp to WORLD_BOUNDS client-side; server drops OOB without counting bad | open |
| 19 | P2 | invite.ts:86-108; PartyHost.tsx:137-142 | ?party= stays in the URL until intro ends, never stripped with flag off; pending code has no TTL | strip on mount; 30-min TTL; referrer meta strict-origin | open |
| 20 | P2 | Town.tsx:22 | static imports put multiplayer code in the bundle with the flag off | next/dynamic / dynamic import | open |
| 21 | P2 | townBridge.ts:20-26,111-115 | singleton socket outlives Town on client navigation | on unmount/pagehide send Indoors and close | open |
| 22 | P2 | remoteAvatars.ts:168 | emote age only advances on screen | advance before the visibility early-outs | open |
| 23 | P2 | partyRoom.ts:69-76; /party/:code | no reciprocal ws.close(); info endpoint reveals party size | close in handler; return {open, full} only | open |
| 24 | P2 | roomCore.ts:231-234 | a member away > 60 s cannot return after lock/2 h | document or extend resume to the 4 h cap | open |

Checked and OK: no free text or identifier is relayed (names are server-picked colour+animal; Look = 12 ints; Emote/Ping enums); tokens
go only to their owner; no saves/install id/analytics touched; session storage holds only {code, resumeToken, hostKey, at} (30 min TTL)
plus the pending code; the parent gate covers create, join by code and join by link; wire validation is tight (512 B cap before parse,
arrays only, integer checks, CSPRNG codes + blocklist, constant-time compares); flood handling and token buckets; interpolation clock
shared (performance.now()); hot paths allocate nothing; Town dispose order kept; flag-off runtime cost zero.
