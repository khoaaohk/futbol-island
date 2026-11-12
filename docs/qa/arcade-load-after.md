# Arcade load after the fixes (Nov 11 2026, local, not deployed)

Same method as [the baseline](arcade-load-baseline.md): `node scripts/check-arcade-load.cjs --port=8148` on a production build,
390x664 phone, cold and cache-disabled, **slow** = 400 kbit/s + 400 ms RTT, **fast** = Fast 4G. Single runs on a busy machine
(±0.3 s noise: a repeat of fast tennis/pinball ×3 gave 2.90-2.97 s).

| URL | profile | playable s before → after | KB by playable before → after | KB total (+3 s) before → after | requests |
|---|---|---|---|---|---|
| `/arcade` | slow | 23.32 → **21.82** | 991 → 930 | 991 → 991 | 54 → 54 |
| `/arcade?game=kitrush` | slow | 21.06 → **11.48** | 691 → 468 | 1011 → 498 | 58 → 58 |
| `/arcade?game=snake` | slow | 21.07 → **11.47** | 695 → 471 | 1014 → 501 | 58 → 58 |
| `/arcade?game=runner` | slow | 26.59 → **23.43** | 1213 → 1042 | 1220 → 1111 | 62 → 63 |
| `/arcade?game=tennis` | slow | 26.61 → **22.97** | 1213 → 1024 | 1220 → 1093 | 62 → 63 |
| `/arcade?game=pinball` | slow | 26.74 → **23.13** | 1220 → 1035 | 1220 → 1103 | 62 → 63 |
| `/arcade?game=puzzle` | slow | 25.02 → **22.48** | 1122 → 1001 | 1130 → 1069 | 64 → 64 |
| `/arcade?game=airhockey` | slow | 20.48 → **11.48** | 690 → 466 | 1009 → 510 | 58 → 58 |
| `/arcade` | fast | 3.82 → 3.90 | 991 → 991 | 991 → 991 | 54 → 54 |
| `/arcade?game=kitrush` | fast | 2.78 → **2.45** | 1011 → 1004 | 1011 → 1011 | 58 → 58 |
| `/arcade?game=snake` | fast | 2.79 → **2.45** | 1014 → 1007 | 1014 → 1015 | 58 → 58 |
| `/arcade?game=runner` | fast | 3.01 → 3.31 (noise; tennis/pinball repeats 2.9) | 1220 → 1172 | 1220 → 1172 | 62 → 63 |
| `/arcade?game=tennis` | fast | 3.02 → 2.90-2.94 (×3) | 1220 → 1154 | 1220 → 1154 | 62 → 63 |
| `/arcade?game=pinball` | fast | 3.05 → 2.94-2.97 (×3) | 1220 → 1165 | 1220 → 1165 | 62 → 63 |
| `/arcade?game=puzzle` | fast | 3.10 → 3.38 (noise) | 1130 → 1131 | 1130 → 1131 | 64 → 64 |
| `/arcade?game=airhockey` | fast | 2.79 → **2.34** | 1009 → 991 | 1009 → 1010 | 58 → 58 |

First paint is unchanged (≈3.0 s slow, ≈0.45 s fast); the waterfall is still 3 generations (HTML → page chunks → game chunks).
The 2D games roughly halve on a slow line; the 3D games and puzzle gain 2.5-3.6 s; the room 1.5 s. On fast 4G a full load of
the 2D games still includes the party layer (it starts on idle once the game's code is in), so their totals are unchanged there.

First Load JS (build output), before → after: `/` 145 → 145 kB, `/play` 161 → 161 kB, `/arcade` 199 → 200 kB (+0.4 kB page:
the deep-link chunk map and the party gate). Shared 101 kB.

## What changed

1. **Party layer mounts late** (`components/ArcadeRoom.tsx`): `useArcadeRoomParty()` moved into a tiny `ArcadePartyLayer` child that
   mounts once the room has drawn (`revealed`) or, on a deep link, once the game's chunk has arrived, then on `requestIdleCallback`
   (2.5 s timeout; 1.2 s timer where there is no idle callback). The layer already supported a late attach
   (`attachArcadeLayer` re-sends the busy flags and attaches to the current host). Friends in a party appear a moment later; nothing
   else changes. Not a busy flag (`tests/mp-rooms-arcade.cjs` still passes).
2. **One 3D game per chunk**: `components/games/{Tennis,Pinball,Runner}Game3D.tsx` each pass their own factory to
   `ArcadeGame3D` (new `create` prop; the dispatcher is now a type-only import there). Chunk `8599` (196 KB, all three) became
   a 108 KB per-game chunk plus shared pieces.
3. **Deep link starts its download at module time**: `ArcadeRoom.tsx` reads `?game=` when its module evaluates and calls the same
   `import()` the `next/dynamic` loader uses (webpack shares the promise), before hydration.

## Not changed (and why)

- **Island data through the shared bean rig** (≈ 85 KB gzip on every three.js load: `player.ts → jobPoses → … → beachcombing`,
  `clubCostume → costumes`, `customization → coinQuest`): fixing it means splitting `lib/graphics/player.ts` / `lib/town/*`, which the
  island also uses; out of scope for an arcade-only change and a /play risk. Best next win for the 3D games (≈ 1.7 s slow).
- **Cross-game CSS** (≈ 31 KB on the 2D games): caused by Next 14's `CssChunkingPlugin` (always on, merges CSS chunks to ≥ 30 KB) plus
  `components/games/skins/index.ts` importing all skins. A global `experimental.cssChunking` change would reorder CSS site-wide;
  per-game skin imports touch every game file (Air Futbol was being edited). Worth ≈ 0.6 s slow.
- **The party layer itself**: `useArcadeRoomParty` imports `lib/arcade/arcadeRoomParty.ts` (three.js + avatars) even with no stored
  party. Skipping the import when no party/world session exists would save ≈ 500 KB on every arcade visit; that is in
  `components/party/**` / multiplayer code, owned by the multiplayer agent.
- `<link rel=preload>` for a deep link's chunks: the page is static HTML and the chunk names are hashed per build; the module-time
  `import()` gets most of the benefit without a server-side query read (which would make `/arcade` dynamic).
- HTML cache headers, the `dpl` query, game behaviour and visuals: untouched. Nothing new runs per frame.

## Checks

- `npx tsc --noEmit`: clean.
- `npm run test:quiet -- arcade kitrush snake airhockey runner tennis pinball pass-puzzle puzzle ui-spec`: all passed after the
  `takeParty/startParty` naming fix for `tests/mp-rooms-arcade.cjs` (96/96).
- New `tests/arcade-load-split.cjs` (in the core chain): 2D games never reach three.js / the room scene / the party layer; the page
  never statically reaches the room scene, the party layer or a game; each 3D entry carries only its own factory; the party layer
  mounts late; the deep link starts early; high-score entry, boards, Today and Gashapon stay lazy.
- `node scripts/check-arcade-load.cjs --port=8148 --smoke` (prod-safe, visible UI only): phone and desktop, every game: Play, 3 s
  of play, the Arcade button back to the room, enter a game from the room: **SMOKE PASS**, no page or console errors (the only 5xx
  was `503 /api/arcade-board/start`, the leaderboard store not configured locally; same before the change).
