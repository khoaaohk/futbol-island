# Deploy and test checklist: Play with friends (Oct 22 2026)

Everything here is on the local branch `integrate-dive-bugs-sealife` and NOT pushed. The owner runs the steps marked **OWNER**.
Order matters: **relay first, then the game, then the switches.**

## 0. Before anything
- [ ] Decide where the two-device test runs: (a) your own machine on the LAN (dev relay + dev server), or (b) a Vercel preview link
      plus the deployed relay. (b) is the real test; (a) needs no deploy.
- [ ] Legal review of the privacy policy text (PrivacyPolicy.tsx `[LAWYER]` comment lists the changed sections: 1, 7, 7a, use, 13, retention)
      before real children use it or any sponsor number is shared. The Sponsor report is an internal draft until then.
- [ ] Confirm the music credit (About > Story music: "Welcome" from Towball's Crossing, CC BY 4.0) against the original download.

## 1. Deploy the relay (OWNER, Cloudflare Workers Paid)
Files: `multiplayer/relay/wrangler.toml`. Carries: 20-player cap, persistence grace (10 min for indoors/busy/background), relay stats
counters (`/stats`), relay v1.1 (room bounds, implicit room warp, same-room interest, away rule, resume look).
1. `cd multiplayer/relay`
2. Stats secret (16+ random characters; keep a copy, the admin site needs the same value): `npx wrangler secret put STATS_TOKEN`
3. Allowed origins: edit `MP_ALLOWED_ORIGINS` in `wrangler.toml` to include every site that will use the relay
   (production: `https://futbolisland.app,https://www.futbolisland.app`; a Vercel preview: its exact origin or a pattern with one `*`).
4. `npx wrangler deploy` (applies migration tag `v2`: the new RelayStats object. `v1` PartyRoom stays untouched.)
5. Note the worker URL (`https://futbol-party-relay.<account>.workers.dev`).
6. Check: `curl -s -X POST https://<worker>/party -H "Origin: https://futbolisland.app"` returns `{"code":...}` (201);
   `curl -H "Authorization: Bearer $STATS_TOKEN" https://<worker>/stats` returns JSON.
- Rollback: `npx wrangler rollback` (see docs/multiplayer-rooms-design.md "Relay v1.1 status" for the v2 migration fallback).

## 2. Configure the game (OWNER, Vercel project env)
| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_MULTIPLAYER` | `1` | turns Play with friends on (Production, and Preview if you want to test there) |
| `NEXT_PUBLIC_MULTIPLAYER_URL` | `https://<worker>` | the worker URL from step 1.5 (https, no trailing slash) |
| `RELAY_STATS_URL` | `https://<worker>/stats` | server-only, for the admin Health block |
| `RELAY_STATS_TOKEN` | the `STATS_TOKEN` value | server-only |
| `NEXT_PUBLIC_ANALYTICS_PARTY_RETENTION` | leave UNSET | Phase C stays off until legal sign-off (the Supabase migration is already applied) |
Then redeploy (NEXT_PUBLIC_ values are inlined at build time).

## 3. Two-device test (about 20 minutes)
1. Device A (host): open the game > people button > type a first name > Start a party > answer the grown-up question.
   Expect the one "Your party" card (Code tab: code, Share link, New code, Close to new friends; List tab).
2. Device B (guest): open the invite link or Join with a code > first name > grown-up question.
   Expect A to see B join ("... joined"), B's ring (same size as A's own ring), name labels.
3. Walk around together; emote near each other (wave, high five, dance, Show off); A flies with the jetpack: B sees A's ring tilt.
4. A opens a lesson or Settings: B sees the green force field + "Taking a lesson"/"In Settings"; kick the ball at the field: it bounces.
5. A walks into the Konbini, then the Museum, then the Arcade (and the Kit Shop): the party stays on; B sees "In the Konbini" etc.,
   the "N in the Konbini" door hint; B follows: both are visible inside, the chip says "N here", Leave only.
6. Reload A's tab: the party resumes by itself (same colour). Replay the walkthrough: the party stays on.
7. A taps New code: the old code stops working, B stays. A taps Close to new friends, a third device cannot join. A removes B: B sees
   "You left the party". A taps End party for everyone (small red link on the List tab): everything ends, the ring disappears.
8. Heat: 10 minutes with 3+ players on an iPhone (Battery saver off, then on); note warmth and frame rate. Report to the agent team.

## 4. After the test
- [ ] Admin portal: Engagement > "Friends & parties" and "Emotes" fill in (the first days show "<10"); Health block shows relay counters.
- [ ] Decide on Phase C (retention): set `NEXT_PUBLIC_ANALYTICS_PARTY_RETENTION=1` only after the legal sentence is approved.
- [ ] Push to main when you are happy (nothing has been pushed).
