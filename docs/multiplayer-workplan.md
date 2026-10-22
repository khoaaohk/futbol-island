# Multiplayer Phase 0 workplan (overnight, no deploy)

Source of truth: `docs/multiplayer-design.md` (§4.4 protocol types and §5.1 client API are **the contract**: copy them, do not
redesign them). Branch base: `multiplayer-design`. Nothing is pushed or deployed. Flag `NEXT_PUBLIC_MULTIPLAYER` stays **off**
by default, so with the flag off the game must behave exactly as today.

## Rules for every task
- Own only the files listed for your task. Need a change elsewhere? Write it in your report; do not edit.
- Grep + line ranges; never read `components/Town.tsx` whole (1,846 lines).
- Tests are `tests/*.cjs` in the repo style (load TS with `ts.transpileModule`, see `tests/parent-gate.cjs:1-5`). **Do not
  edit `package.json`**: Task F registers all new tests. Run your own tests with `node tests/<file>.cjs`.
- No new npm dependencies. QR: the existing `qrcode` package (dynamic import, `lib/saves/printCard.ts:42`). WebSocket server
  for the dev relay: hand-rolled on `node:http` (no `ws`). Client WebSocket in Node: `node --experimental-websocket` (Node 20.20).
- No enums: `as const` objects + union types (design §4.4 note).
- Ports: dev relay uses `MP_PORT` (default **8790**; tests pick a random free port). Never touch 8092 or `.next-dev`. Kill only
  your own PIDs. No `next dev` is needed for Phase 0. If you build, use your own `NEXT_DIST_DIR`.
- Commit on your branch with the last line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push.
- Report under 40 lines: files, tests run + results, anything you could not do.
- Machine rule: if the Mac/Warp is slow, run one task at a time (the default order below).

## Order and parallelism
```
A (protocol) ──► B (relay + dev relay)       ┐
             ├─► C (client lib) ──► E (avatars + Town glue) ──► F (registration, docs, verify)
             └─► D (invite/join UI)          ┘
```
A first (~0.5 day). B, C, D can run in parallel after A merges (they only import `multiplayer/protocol`). E needs C's API
(it may start in parallel against the §5.1 types and merge after C). F is last.

| Task | Model / effort | Est. | Owns |
|---|---|---|---|
| A protocol | Sonnet / medium | 0.5 d | `multiplayer/protocol/**`, `tests/mp-protocol.cjs` |
| B relay | Sonnet / medium | 1 d | `multiplayer/relay/**`, `multiplayer/dev-relay/**`, `multiplayer/bots/**`, `tests/mp-room-core.cjs`, `scripts/mp-relay-smoke.mjs`, `tsconfig.json` (exclude lines only) |
| C client | Sonnet / medium | 0.75 d | `lib/multiplayer/{config,connection,store,interp,look,index}.ts`, `tests/mp-client.cjs` |
| D UI | Sonnet / medium | 1 d | `lib/multiplayer/invite.ts`, `components/party/**`, `tests/mp-ui.cjs` |
| E avatars + glue | Sonnet / medium | 1 d | `lib/graphics/remoteAvatars.ts`, `lib/multiplayer/townBridge.ts`, `components/Town.tsx` (4 edits only), `tests/mp-avatars.cjs` |
| F verify + docs | Haiku / low | 0.25 d | `package.json` (test list), `tests/mp-isolation.cjs`, `docs/multiplayer-*.md` status lines, `.env.example` if present |
| Review | Opus / default | 0.25 d | read-only security + sync review of A-E diffs; findings list, no edits |

---

## Task A: `multiplayer/protocol` (Sonnet)
**Inputs:** design §3.3 (codes), §3.4 (limits), §4.4 (types + function signatures), §4.5.
**Files:** `multiplayer/protocol/{types,codes,names,validate,limits,index}.ts`, `tests/mp-protocol.cjs`.
**Must:**
- Pure TS. Imports only between these files (relative paths, no `@/`), no DOM, no Node APIs, no `lib/**`. The worker and the
  Node dev relay import it too.
- Export every constant, type and function in design §4.4 with those names and numeric values.
- `generateCode(rand)` takes a random-bytes function (CSPRNG injected; rejection sampling, no modulo bias) and skips blocklisted
  codes. `normalizeCode` strips spaces/dashes, uppercases, returns null for wrong length or any char outside the alphabet.
- `names.ts`: 16 colours x 32 animals, kid-friendly, reviewed (no animals that are insults: no "Rat", "Pig", "Donkey",
  "Snake", "Slug", "Worm", "Weasel"); `pickName` returns an unused pair.
- `parseClient`/`parseServer`: reject > `MAX_INBOUND_BYTES` (client side only for parseClient), non-array, unknown opcode,
  wrong arity, non-integers, out-of-range enums/look values, tokens not matching `/^[A-Za-z0-9_-]{16,32}$/`, code not valid.
  Never throws.
- `clampPose` rejects (null) outside `WORLD_BOUNDS`, bad mode/zone, yaw outside 0-255, speed outside 0-255, flags > 3.
- `speedOk(prev,next,dtMs)`: distance (m) <= `MAX_SPEED_MS[next mode] * 1.5 * dt + 2`; always true when `next` has Warp
  (caller limits Warp to 1 per 5 s).
- `TokenBucket` with injected time.
**Acceptance (`node tests/mp-protocol.cjs` passes):**
- 10,000 generated codes: length 6, only alphabet chars, no vowels, none blocklisted, roughly uniform per position (chi-square loose bound).
- normalize: `'k7m-q4r '`->`'K7MQ4R'`; `'K7MQ4'`, `'K7MQ4O'`, `'K7MQ4RR'` -> null.
- round trip `parseClient(encode(m))` deep-equals for one valid example of every client message; same for server messages.
- a table of >= 30 malformed inputs all return null (strings inside pose, floats, NaN, nested objects, 600-byte payload, extra fields).
- `WORLD_BOUNDS` contains main island (`ISLAND_BOUNDS` in `lib/town/simulation.ts:9`, read the numbers by regex from the file),
  Cay centre (612,-160) and Summit centre (640,130) with 100 m margin (all x10 for dm).
- No exported type contains a free `string` field except tokens/code (source regex check on `types.ts`).

## Task B: relay (Cloudflare Worker code + local dev relay + bots) (Sonnet)
**Inputs:** design §4.2, §4.3 (endpoints, origin, auth), §4.5, §4.6; Task A exports.
**Files:**
- `multiplayer/relay/src/roomCore.ts`: **pure** room logic, no Cloudflare or Node APIs. Interface:
  ```ts
  export interface Peer { send(text: string): void; close(code: number): void }
  export interface RoomClock { now(): number }
  export class RoomCore {
    constructor(opts: { code: string; createdAt: number; clock: RoomClock; random: (n: number) => Uint8Array });
    readonly hostKey: string;                       // issued at creation, returned by POST /party
    connect(peer: Peer): void;                       // waits for Hello (5 s timeout -> close)
    message(peer: Peer, raw: string): void;          // parseClient + rules
    disconnect(peer: Peer): void;                    // starts RESUME_GRACE_MS
    tick(): void;                                    // 5 Hz: batch dirty poses, expiries, host migration, empty close
    info(): { open: boolean; size: number; full: boolean };
    rotate(): string;                                // new code (worker re-registers)
    readonly ended: boolean;
  }
  ```
- `multiplayer/relay/src/partyRoom.ts`: Durable Object wrapping RoomCore with `ctx.acceptWebSocket`, `webSocketMessage`,
  `webSocketClose`, attachments for member slot (<= 2 KB), tick via `setInterval` only while >= 2 sockets.
  Rotate: the new code maps to a new DO name; the old DO answers `NotFound`/`Expired` to new joins and forwards nothing
  (simplest: Rotate in v1 = host ends the current DO's code admission and the worker creates a fresh party; members stay in
  the old object. Document what you chose).
- `multiplayer/relay/src/index.ts`: routes `POST /party`, `GET /party/:code`, `GET /party/:code/ws`; origin allow-list;
  IP-hash token buckets (in-memory per isolate is acceptable for Phase 0; note Phase 1 should use the Rate Limiting binding).
- `multiplayer/relay/src/cf.d.ts` (minimal type shims, so no `@cloudflare/workers-types` install), `tsconfig.json`,
  `wrangler.toml` (DO binding `PARTY`, migration tag, no secrets, `workers_dev = true`).
- Root `tsconfig.json`: add `"multiplayer/relay"` and `"multiplayer/dev-relay"` and `"multiplayer/bots"` to `exclude` (only change).
- `multiplayer/dev-relay/{server.mjs,wsLite.mjs,loadTs.cjs}`: same three endpoints and the same RoomCore (loaded from TS
  via `typescript` transpile), CORS for localhost only, `MP_PORT` env, logs counts only.
- `multiplayer/bots/bot.mjs`: `--url --code --n --path circle|line --cheat speed|flood|bounds`, prints a one-line JSON summary.
- `tests/mp-room-core.cjs` (fake peers + fake clock) and `scripts/mp-relay-smoke.mjs` (spawns dev relay on a free port,
  POST /party, 6 bots join, asserts everyone sees 5 others within 2 s, 7th gets `Full`, a speed-cheat bot's poses are not
  relayed, flood bot is closed; kills the server by PID in `finally`).
**Acceptance:**
- `node tests/mp-room-core.cjs`: join, Welcome roster, Joined/Left, Full at 7, Lock, Kick (kicked can't resume), host-only
  ops rejected for non-host (`NotHost`), host migration after 30 s, resume within 60 s keeps id/name, code TTL rejects new
  joins after 2 h, party ends at 4 h and after 2 min empty, batching sends only dirty poses, a peer never receives its own pose,
  no token appears in any message sent to another peer.
- `node --experimental-websocket scripts/mp-relay-smoke.mjs` passes in < 30 s and leaves no process behind.
- `npx tsc -p multiplayer/relay --noEmit` passes **if** `typescript` resolves (it does from the repo root); not deployed.

## Task C: `lib/multiplayer` client (Sonnet)
**Inputs:** design §2.5, §4.3, §4.4 rates/interp, §5.1 (exact API).
**Files:** `lib/multiplayer/{config,connection,store,interp,look,index}.ts`, `tests/mp-client.cjs`.
**Must:**
- `config.ts`: `multiplayerEnabled()` true only if `process.env.NEXT_PUBLIC_MULTIPLAYER==='1'`.
- `connection.ts`: per §5.1; Hello with look + resume token/hostKey from `sessionStorage` (`fi-party-session`: `{code,
  resumeToken, hostKey?, at}`, 30 min TTL); backoff 1,2,4,8,15 s +/-30 % jitter; no retry while hidden; close after 15 s
  hidden; resume on visible; send throttle (5 Hz moving with 0.15 m / 8 deg deltas, mode/zone/emote immediate, idle <= 1 Hz on
  change, `Beat` every 5 s); local emote limit 1 per 2 s; never sends while `hidden` flag set; all timers injected.
- `store.ts`: `partyStore` + `usePartyState()` (`useSyncExternalStore`); emits only on membership/status/emote/ping/error,
  **never on Poses**. Poses go to `interp` directly via a `onPoses(fn)` hook exported from `index.ts`.
- `interp.ts`: 4-slot ring per member, preallocated; Hermite; 250 ms delay; 250 ms extrapolation cap then ease to stop;
  Warp or > 25 m -> `fade` goes 1->0->1 over 300 ms; `sample` allocates nothing (test by counting via a patched constructor or
  by reusing `out`).
- `look.ts`: `lookToWire(c: CharacterCustomization): Look` (12 ints: indexes into `CUSTOMIZATION_OPTIONS` for
  `bodyColor, skinTone, eyes, mouth, hair, hairColor, build, headwear, headwearColor, clothing, character, costume(0 in v1)`;
  unknown -> 0) and `wireToLook(l): CharacterCustomization` (starts from `DEFAULT_CUSTOMIZATION`).
- **Never import** `lib/saves/**`, `lib/analytics/**`, `deviceMarks`, or read `localStorage` keys `fi2-install-v1` /
  `fi2-save-code-v1`.
**Acceptance (`node tests/mp-client.cjs`):** mock WebSocket + fake clock: connect/Hello shape, reconnect schedule with
jitter bounds, resume token reuse, hidden-tab close and no retry while hidden, throttle counts (walking 10 s -> 45-55 poses;
standing 10 s -> <= 3 messages), store emits 0 times for 100 Poses messages, interp error < 0.05 m on a straight walk at 5 Hz,
extrapolation stops after 250 ms, look round trip for `DEFAULT_CUSTOMIZATION` and 3 presets.

## Task D: invite / join UI (Sonnet)
**Inputs:** design §2.1-2.3, §3, §5.3, §5.4; `components/ParentGate.tsx` + `DonationLinks.tsx:19-21` gate pattern;
`docs/ui/HUD_STACK.md` (calm HUD, `toastLane`), `docs/ui/BUTTONS.md`; `components/Icon.tsx` for icons.
**Files:** `lib/multiplayer/invite.ts`, `components/party/{PartyHost,PartyInvite,JoinParty,PartyChip,EmoteWheel}.tsx`,
`components/party/party.module.css`, `tests/mp-ui.cjs`.
**Contract:**
```ts
// lib/multiplayer/invite.ts
export function createParty(): Promise<{ code: string; hostKey: string; expiresAt: number } | { error: 'rate' | 'offline' }>;
export function checkParty(code: string): Promise<{ open: boolean; size: number; full: boolean } | null>;
export function partyLink(code: string): string;            // `${SITE_URL}/?party=${code}` (SITE_URL from lib/site/seo.ts)
export function sharePartyLink(code: string): Promise<'shared' | 'copied' | 'failed'>; // navigator.share, else clipboard
export function partyQr(code: string): Promise<string | null>; // data URL via dynamic import('qrcode'), cached
export function readPendingParty(): string | null;          // from ?party= (then removed from the URL with replaceState) or sessionStorage 'fi-party-pending'
export function clearPendingParty(): void;
// components/party/PartyHost.tsx (Town mounts this once, behind the flag)
export default function PartyHost(props: { islandReady: boolean; introDone: boolean; connection: PartyConnection;
  look: () => Look; onTrack?: (event: 'mp_party_created' | 'mp_party_joined' | 'mp_party_ended' | 'mp_join_failed', bucket?: string) => void }): JSX.Element | null;
```
**Must:** returns `null` when `multiplayerEnabled()` is false; parent gate before create and before join; pending link waits
for `islandReady && introDone`; PartyInvite shows code `XXX-XXX`, Share/Copy, QR, grown-up line, expiry; JoinParty has 6
character boxes accepting only the alphabet, the hint for other characters, Full/NotFound/Expired messages; PartyChip
icon-only, fixed corner, >= 44 px, aria-labels, sheet with members (name + zone icon), Emotes, Invite (host), Remove/Lock/New
code/End (host), Hide/Mute per friend (local only, store in component state), Leave; join/leave notes through
`lib/ui/toastLane.ts` at note priority; no free-text input anywhere except the code boxes; reduced motion respected.
**Acceptance (`node tests/mp-ui.cjs`, source + pure checks like `tests/calm-hud.cjs`):** flag gating; `ParentGate` referenced
before `createParty` and before join; no `<input type="text">` other than the code input with `maxLength` 1 per box and alphabet
filter; `partyLink('K7MQ4R')==='https://futbolisland.app/?party=K7MQ4R'`; `readPendingParty` rejects invalid codes; CSS
targets >= 44 px; toasts go through `toastLane`; `qrcode` imported dynamically only. Do **not** mount in Town (Task E does).

## Task E: remote avatars + Town glue (Sonnet)
**Inputs:** design §2.3, §2.5 (caps, edge cases), §4.7, §5.1 (`RemoteAvatars`, `PartyRuntime`), §5.2 (exact Town edits);
`lib/graphics/islandNpcs.ts:19-46` (heat fixes to copy), `lib/graphics/playerBatch.ts:34`, `lib/graphics/player.ts:353`
(`createPlayer`), `lib/graphics/heatTier.ts:95-100`, `docs/performance-guide.md` (grep "playerBatch", "view gate").
**Files:** `lib/graphics/remoteAvatars.ts`, `lib/multiplayer/townBridge.ts`, `components/Town.tsx` (only: 1 import line, init
after `viewGate` ~line 736, update next to `islandNpcs.update` ~line 1491, dispose in the cleanup ~line 1746, mount
`<PartyHost .../>` in JSX behind the flag), `tests/mp-avatars.cjs`.
**Must:** one `playerBatch` for all remotes (capacity 8); bean skin; release hidden classic geometry; far pose 10 Hz > 20 m,
5 Hz > 60 m, hidden > 160 m; no shadow registration; cap by `remoteCap(effectiveTier(), phone, batterySaverOn())` applied
when a remote is admitted (never removes an already-shown remote on tier change; Battery saver fades all out over 1 s);
name label = one `Sprite` per remote with a `CanvasTexture` made once on upsert, hidden > 40 m; emotes map to existing poses
(`called` for PassToMe/Space, celebration for Cheer/WellPlayed, wave, high-five) for 1.5 s, reduced motion = icon bubble only;
mode -> `PlayerMotion` (walk/run/travelMode/swim/zipline/parachute; vehicles as pose only); `townBridge` does no work at all
when not in a party (one boolean check per frame), allocates nothing per frame; `createPartyRuntime` returns `null` when the
flag is off, so Town does nothing.
**Acceptance:** `node tests/mp-avatars.cjs`: `remoteCap` table (phone 5/5/3/1/0, desktop 5, saver 0); admission-only caps
(tier change does not hide); no reference to `shadowVisibility`/`npcShadows` in the new files; `Town.tsx` diff is <= 6 lines
touching party code (regex count); flag off path returns null. Also run `node tests/dive-edge.cjs`, `node tests/explore-v2.cjs`,
`node tests/view-gate.cjs`, `node tests/heat-tiers.cjs`, `node tests/calm-hud.cjs`, `node tests/hud-stack.cjs` (must pass unchanged).

## Task F: registration, isolation test, docs, final verification (Haiku, low effort)
**Files:** `package.json` (append to the `test` chain only), `tests/mp-isolation.cjs`, status lines in
`docs/multiplayer-design.md` / this file, `.env.example` (only if it exists: add commented `NEXT_PUBLIC_MULTIPLAYER=` and
`NEXT_PUBLIC_MULTIPLAYER_URL=`).
**Steps:**
1. Write `tests/mp-isolation.cjs`: regex over `lib/multiplayer/**`, `components/party/**`, `multiplayer/**`,
   `lib/graphics/remoteAvatars.ts`: no import of `lib/saves`, `lib/analytics`, `deviceMarks`; no `fi2-install-v1` /
   `fi2-save-code-v1` string; no `localStorage` in `multiplayer/**`.
2. Append `node tests/mp-protocol.cjs && node tests/mp-room-core.cjs && node tests/mp-client.cjs && node tests/mp-ui.cjs &&
   node tests/mp-avatars.cjs && node tests/mp-isolation.cjs` to the `test` script.
3. Run `npm run test:quiet`, then (not at the same time as other agents' servers) `npm run build:quiet` with its own
   `NEXT_DIST_DIR`, then `node --experimental-websocket scripts/mp-relay-smoke.mjs`. Report pass/fail lines only.
4. Mark Phase 0 status in both docs (date, what passed, what is left for the owner). Analytics: list the `mp_*` ids in the design
   doc §5.6 status line; do not change the live privacy page.
**Acceptance:** full suite + build green; smoke green; no file outside the list changed (`git diff --stat`).

## Opus review (after E, before F's final run)
Read-only: protocol validation gaps, token handling, rate limits, origin checks, resume/kick races, host migration, interp
allocation, Town glue heat (no new loops). Output: a numbered findings list with file:line and a fix suggestion; the fixes go to
a short Sonnet follow-up task.

## Owner checklist for Phase 1 (not tonight)
1. Cloudflare account (khoa0aohk@gmail.com), Workers Paid $5/mo, $20 billing alert.
2. `npx wrangler login`, then `npx wrangler deploy` from `multiplayer/relay` (an agent can run it once you are logged in).
3. Vercel **preview** env: `NEXT_PUBLIC_MULTIPLAYER=1`, `NEXT_PUBLIC_MULTIPLAYER_URL=https://<worker>.workers.dev`.
4. Two phones on the preview: create, share, join, walk together; then the two-iPhone heat run.
5. Send the privacy draft (design §5.5) to counsel; DPIA.
