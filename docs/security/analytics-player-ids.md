# Analytics player ids (Nov 10 2026)

Code: `lib/analytics/playerHash.ts` (device), `lib/analytics/playerId.ts` (server), `lib/analytics/core.ts` validateEvent, tests `tests/privacy-nov10.cjs`, `tests/admin-analytics-day.cjs`.

## What leaves the device
A session start carries ONE of:
- `ph`: SHA-256("futbol-island analytics player v1|" + active save code), 64 hex, computed in the browser. The raw code is never sent.
- `pi`: the random install id (`fi2-install-v1`, 32 hex) when no code is active.

A `pc` (raw code) from an old cached page is dropped unread by `validateEvent` (the visit still counts, no player id is made). Any path, referrer or utm value shaped like a save code refuses the event (`code-shaped`).

## Server
`player_id = HMAC(periodKey, "h:"+ph | "i:"+pi)[0..32]`, `periodKey = HMAC(ANALYTICS_PLAYER_SALT, "player id period " + floor(UTC days since 1970 / 90))`.
The salt is unchanged (`ANALYTICS_PLAYER_SALT`, else derived from `SAVE_CODE_PEPPER`). The save pepper is no longer needed for a code's player id.

## Consumers (all work within one 90-day period)
- `analytics_sessions.player_id` (20261019_analytics_day_sessions.sql): the day view's `pid` (a further hash) and `/api/admin/player` per-player view: a player's history shows only the current period.
- Party retention (20261022 / 20261108_party_retention_exact.sql): cohorts by `min(day)` per player_id; D1/D7 returns compare sessions of the same id.
- Return-visit / "players" counts in `/admin` (distinct player_id in a range).

## What breaks at a period boundary
- Every player gets a new id: "new players" spike and returning-player counts restart on the first day of a period; a range spanning a boundary counts one child twice.
- Party-retention cohorts that started within 7 days before a boundary under-count D7 returns.
- The per-player admin view cannot follow a player across a boundary (by design).
- Period starts (UTC): 2026-09-04 (current), 2026-12-03, 2027-03-03, 2027-06-01, ... (`periodStart()` in playerId.ts).

## One-time restart at deploy
Ids made before this change (HMAC of the save store's code hash, no period) can never match the new ids. At deploy, every player's history restarts once: returning-player and retention numbers for ranges that span the deploy day are not comparable.
