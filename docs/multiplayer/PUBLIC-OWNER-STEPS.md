# Public island: owner steps (phase 1)

Nov 11 2026. Plan: `docs/multiplayer-public-island-plan-2026-11-11.md`. Every sentence that changes for families: `docs/multiplayer/PUBLIC-COPY-REVIEW.md`.

## 1. Before anything: the lawyer
Send the lawyer `PUBLIC-COPY-REVIEW.md` and these questions (from the plan):
1. Is public play on by default for children acceptable under the UK Age Appropriate Design Code standards 7 (default settings) and 11 (parental controls)? Under COPPA, does seeing others with preset phrases and generated names make personal information publicly available? Fallbacks if not: (a) on only after a grown-up allows it once; (b) default "Just me" in the UK/EEA by edge location, on elsewhere; (c) other players shown as rings with no names.
2. Is keeping the typed first name private to parties enough, given it has no block-list?
3. Reports are stored as daily counts only. Is that acceptable, or is an incident record expected (UK Online Safety Act duties)?
4. Does the relay's short quarantine by a daily scrambled internet address count as "support for internal operations"?
5. Is a holdout arm (1 in 10 devices start as "Just me", picked from a random number kept on the device) "profiling"? Note: the arm totals ride the same anonymous visit beats as the player number.
6. Must the DPIA and the policy name the mobile data use and Cloudflare's processing for public worlds? (The draft policy already does.)
7. Is the plain "Yes" to "Is it safe for kids?" (an existing FAQ on the site) still acceptable once other players are visible?

## 2. Relay (Cloudflare)
- `wrangler deploy` the relay v3 (the world rooms and the WorldLobby object), and set its secret `CONTROL_TOKEN` (`wrangler secret put CONTROL_TOKEN`).
- Add a Cloudflare billing alert (the plan estimates about $5-7 a month at 10 players online on average, $35-40 at 100).

## 3. Vercel environment variables
| Name | Where | What it does |
|---|---|---|
| `NEXT_PUBLIC_PUBLIC_WORLD` | Build (Production / Preview) | `1` turns on the public island: the people button's three choices, other players, the public-world counters and the flag-on policy and safety wording. Unset = off (today). Needs `NEXT_PUBLIC_MULTIPLAYER=1` (already used for Play with friends) and a redeploy, because pages read it at build time. |
| `RELAY_CONTROL_TOKEN` | Server only | The same value as the relay's `CONTROL_TOKEN`. Lets the admin's "Close / Open public islands" button work. Never `NEXT_PUBLIC_`. |
| `RELAY_CONTROL_URL` | Server only, optional | The relay's `/control` address. Leave unset: it defaults to `RELAY_STATS_URL` with `/stats` changed to `/control`. |

`RELAY_STATS_URL` and `RELAY_STATS_TOKEN` (already set for party stats) also feed the public-world numbers.

Before switching the flag on, set `POLICY_UPDATED_PUBLIC` in `components/privacy/PrivacyPolicy.tsx` to the switch-on day, and update the site pages listed at the end of `PUBLIC-COPY-REVIEW.md` (they are outside this phase's files).

## 4. The kill switch
/admin → Friends & parties → "Public island (other players)": worlds open, players in public now, today's reports by reason, quarantines, and **Close public islands** / **Open public islands**. Closing calls the relay's `POST /control {public:false}` through `/api/admin/public-world` (admin sign-in required). Players already inside fall back quietly to "Just me"; nothing needs redeploying. The block shows only when the build flag is on.

## 5. Supabase
Nothing to run. The new counters (`mp:pub_*`) pass the existing `analytics_ingest` counts filter (a key-shape check, not a list), and the server allow-list is in the code (`lib/analytics/countIds.ts`).

## 6. Family beta (two phones)
1. Phone A and phone B, both new players: each finishes the welcome tutorial and sees nobody until then; afterwards the "Other kids are here!" card appears once when the other comes near.
2. Check each phone shows the other with a colour-and-animal name (not the typed name), the outfit colours and shirt number, and that waves and cheers arrive. Reload: the made-up name changes.
3. Walk into the Arcade, Shop, Museum and Konbini together: both still see each other.
4. On A tap the people button → *Just me*: B loses A at once; back to *With other players*: A fades in again.
5. On B, Hide A, then Report A (each of the four reasons once over the test): A disappears for B; /admin shows the report counts the next time it loads.
6. Settings → grown-up check → *Friends only*: no other players; *Off*: no people button at all.
7. Start a private party on A with B: they see only each other, with typed first names.
8. Start a live match together, then switch mode on one phone: the "You'll leave this match." line shows.
9. Close public islands in /admin: both phones fall back to playing alone without an error. Open again.
10. Note phone warmth and battery after 20 minutes together (the plan asks for a two-iPhone heat check).

## 7. Rolling back
Unset `NEXT_PUBLIC_PUBLIC_WORLD` (or set it to anything but `1`) and redeploy: the game, the policy and the safety pages go back to today's version exactly. For an immediate stop without a redeploy, use **Close public islands** in /admin first.
