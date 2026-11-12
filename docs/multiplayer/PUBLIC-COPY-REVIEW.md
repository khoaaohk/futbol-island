# Public island: every sentence that changes when the flag is on (for legal review)

Nov 11 2026. Phase 1 of `docs/multiplayer-public-island-plan-2026-11-11.md`. Nothing below is live: these sentences appear only when the build flags `NEXT_PUBLIC_MULTIPLAYER=1` and `NEXT_PUBLIC_PUBLIC_WORLD=1` are both set (`lib/multiplayer/publicFlag.ts`). With the flag off, every page reads exactly as it does today; `tests/mp-public-copy.cjs` checks this against a stored copy.

"Old" is today's text. "New" is the text shown with the flag on. "(added)" means there is no old sentence.

## Privacy policy (`components/privacy/PrivacyPolicy.tsx`, /privacy and the title-screen Privacy sheet)

| Where | Old | New |
|---|---|---|
| Date at the top | Last updated November 11, 2026. | Last updated `POLICY_UPDATED_PUBLIC`. **Set this to the day the flag is switched on** (it is November 11, 2026 for now). |
| Contents, 7a | Play with friends (optional) | Other players and Play with friends |
| 1. Short version, second bullet | No ads, no free-text chat with other players, no tracking cookies, and no third-party analytics or advertising tools. Friends in a party can only use preset emotes. | No ads, no free-text chat with other players, no tracking cookies, and no third-party analytics or advertising tools. Other players and friends in a party can only use preset emotes. |
| 1. Short version, new bullet | (added) | **Other players can be seen, unless you change it.** Other children playing at the same time can see each other on the island, with a name the game makes up, their outfit's colours and shirt number, and preset waves and cheers. This is on by default once a new player has finished the welcome tutorial. One tap on the people button (*Just me*) hides everyone, any player can hide or report another, and a grown-up can choose *Friends only* or *Off* in Settings (section 7a). |
| 2. Children and grown-ups, first paragraph | … we collect only what the game needs to work plus the anonymous usage totals described in section 7, we keep privacy-protective settings on by default, and we do not nudge children to share more. | … we collect only what the game needs to work plus the anonymous usage totals described in section 7, we keep privacy-protective settings on by default except one, seeing other players on the island, which is on by default and is explained in section 7a with how to switch it off, and we do not nudge children to share more. |
| 3. What stays on the device, new paragraph | (added) | **Other players:** the device remembers which choice was made on the people button (*Just me*, *With other players* or *With friends*) and whether the one-time card about other players has been shown. About 1 in 10 devices start as *Just me* instead of *With other players*, picked once on the device from its random install number (section 7) so we can compare, in totals only, how the island is used with and without other players; any player can still switch with one tap. These choices stay on the device and are not part of a save code. |
| 7. Usage data, new bullet (after the Play with friends counts) | (added) | counts from playing with other players, from fixed lists: how often the island started with others shown or as *Just me* (the 1-in-10 comparison in section 3), connections made, visits in which another player was seen, minutes played with others around, switches to *Just me* and back, players hidden, reports by their reason (Following, In my way, Too many waves, Something else), how often the service was full or could not be reached, matches joined with others, and how often the one-time card was shown. Never a name or made-up name, which shared island, or who was near whom; |
| 7a. Heading | 7a. Play with friends (optional) | 7a. Other players and Play with friends |
| 7a. New paragraph | (added) | **Other players:** children playing Futbol Island at the same time can see each other on the island, outdoors and in the Arcade, the Shop, the Museum and the Konbini. A shared island holds about 20 players; when it is full, new arrivals start another one. This is on by default (*With other players* on the people button) once a new player has finished the welcome tutorial. Players in a private party see only their party. |
| 7a. New paragraph | (added) | **What other players see:** a name the game makes up (a colour and an animal), which changes every visit; the outfit's colours and shirt number; where the player is and how they move; and preset waves, cheers and football calls. They never see the first name typed for a party, any drawing, crest or printed name from the Kit Shop, or anything from a save. There is no free-text chat, no voice, no photos and no way to send a link or a message. Other players are not shown on the map and cannot send map pings to each other. |
| 7a. New paragraph | (added) | **Hide and Report:** any player can hide another player for the rest of the visit, or report them for one of four reasons: Following, In my way, Too many waves, or Something else. Reporting also hides that player straight away. If different players report the same player within a few minutes, that player is hidden from everyone for a while, and the service stops showing a player to someone they keep following. A report keeps no name, no made-up name and no message: the service keeps only how many reports were made each day for each reason. To make a short hide work, it keeps a scrambled, day-specific version of that connection's internet address in memory for about an hour; it is never stored. |
| 7a. New paragraph | (added) | **Turning it off:** a player can tap the people button and choose *Just me* at any time. In Settings, behind the grown-up check, a grown-up can choose *Other players and friends* (the default), *Friends only* (private parties by code, other players never shown) or *Off* (no other players and no parties). |
| 7a. New paragraph | (added) | **What we keep:** nothing about who the players are. Movement and emotes pass through the same Cloudflare service as parties while players are on and are not stored. It keeps only daily totals, such as how many players connected, how many shared islands were open, and reports by reason, with no name, made-up name or internet address. We also count, as anonymous totals from fixed lists, how playing with others is used (section 7). |
| 7a. New paragraph | (added) | **Mobile data:** while other players are near, seeing them uses about 15 MB of mobile data an hour (our estimate; it depends on how many players are near). *Just me* uses none for this. |
| 7a. Existing party paragraphs | unchanged | unchanged (they now describe private parties, below the new paragraphs) |
| 12. Services, Cloudflare | **Cloudflare** runs the party service for *Play with friends*: messages pass through it while a party is in use and are not stored afterwards. | **Cloudflare** runs the service for *Play with friends* and for seeing other players: messages (movement, outfit colours and preset emotes) pass through it while players are on and are not stored afterwards. |
| 14. Retention, new row | (added) | Reports about another player · Keeping shared play pleasant · Only daily counts by reason; no names, made-up names or messages are kept |
| 14. Retention, new row | (added) | Scrambled internet address of a player many others reported · Hiding that player for a short time · In memory for about an hour; never stored |
| 16. Your choices, new bullet | (added) | **stop other players being shown:** tap the people button and choose *Just me*, or, in Settings behind the grown-up check, choose *Friends only* or *Off*; |

## Safety facts (`lib/site/safety.ts`: the parents' guide, About, lesson hubs, llms.txt, FAQ JSON-LD)

| Where | Old | New |
|---|---|---|
| SAFE_FACTS "No open chat" | There is no free-text chat with other players and no voice chat. Friends in a private party can only use preset emotes, and islanders talk through preset topics a child taps. | There is no free-text chat with other players and no voice chat. Other kids playing at the same time, and friends in a private party, can only use preset emotes, and islanders talk through preset topics a child taps. |
| SAFE_FACTS "Grown-ups stay in charge" | Play with friends works only after a grown-up check, and a grown-up can switch it off in Settings. Links that leave the game and donations sit behind the same check. | Other kids playing at the same time can be seen on the island unless a grown-up changes it: in Settings, behind a grown-up check, a grown-up can choose Other players and friends, Friends only, or Off. A child can also tap the people button to play alone. Play with friends works only after a grown-up check. Links that leave the game and donations sit behind the same check. |
| SAFE_FAQ "Can my child chat with strangers?" | No. There is no free-text chat and no voice chat. Friends in a private party, started by a grown-up and joined by code, can only use preset emotes. | No. There is no free-text chat and no voice chat. Other kids playing at the same time can appear on the island, but they see only a name the game makes up, an outfit and preset waves and cheers. A child can hide or report another player, or tap the people button to play alone, and a grown-up can switch other players off in Settings. |
| HUB_COMMON_FAQ "Is it safe for kids?" | Yes, it is made for kids aged 7 to 12: no ads, no accounts and no open chat. Friends can only use preset emotes. | Yes, it is made for kids aged 7 to 12: no ads, no accounts and no open chat. Other players and friends can only use preset emotes, and a grown-up can switch other players off. |

The "Yes" and the question wording "Is it safe for kids?" are today's (the SEO pages ask it). Please confirm the lawyer is content with a plain "Yes" once strangers are visible.

## For grown-ups sheet (`components/GrownUps.tsx`, Privacy list)

| Old | New |
|---|---|
| No ads and no chat with other players. Printing a report or plan happens on this device. | No ads and no free-text chat with other players. Other children playing at the same time can appear on the island with a name the game makes up and preset waves and cheers; in Settings you can choose Friends only or Off. Printing a report or plan happens on this device. |

## /play page description (`app/play/page.tsx`, search results and link previews)

| Old | New |
|---|---|
| Start your island or continue with your save code. Learn 7v7, 9v9, 11v11 and futsal in short lessons, play with friends using safe emotes. No ads. | Start your island or continue with your save code. Learn 7v7, 9v9, 11v11 and futsal in short lessons. Wave and cheer with other players. No ads. |

## In-game words (`lib/multiplayer/publicCopy.ts`, shown only with the flag on)

Panel "Who's on your island?": *Just me* (Only you and the islanders.) / *With other players · 8 on now* (Kids playing right now. Wave, cheer and play matches. Nobody can chat.) / *With friends* (Friends you know join with a code.). Count: "8 on now", "lots on now" above 24, "Nobody else right now". First-time card: "Other kids are here! These are other kids playing right now. You can wave, cheer and play matches together. Nobody can chat, and the game makes up their names. To play on your own, tap the people button." Report: "What's wrong?" with They keep following me / They keep getting in my way / Too many waves or cheers / Something else; then "Thanks for telling us. You won't see them again this visit. If something upset you, tell a grown-up." Grown-up lock: *Other players and friends* / *Friends only* / *Off*, one line each.

## /learn hub and About (added by the verify pass, Nov 11 2026: `lib/site/learnFeatures.ts`, `lib/site/aboutCopy.ts`)

Flag off: byte-identical to today (pinned in `tests/mp-public-copy.cjs`, key `site`).

| Where | Old | New |
|---|---|---|
| Play together trust points | Grown-ups can switch Play with friends off in Settings, behind the same check. | In Settings, behind the same check, a grown-up can choose Other players and friends, Friends only, or Off. |
| Play together trust points | Private parties by code, never with strangers: no lobbies and no friend lists. | Other kids playing at the same time can be seen, with names the game makes up. Parties are private, by code. No friend lists. |
| What Play together does not have | No public lobbies, matchmaking or browsing other parties | No browsing or joining other parties: a party joins by code only |
| Feature "Grown-ups stay in charge", where | Settings, behind the grown-up check: Play with friends, Allowed or Off. | Settings, behind the grown-up check: Other players and friends, Friends only, or Off. |
| FAQ "Can strangers join, or can kids message each other?" | Parties are private and join by code only: there are no public lobbies, matchmaking or friend lists. A code takes new friends for 8 hours, and the host can make a new code or remove someone at any time. There is no free-text chat; friends use preset football calls and emotes. | Other kids playing at the same time can appear on the island, with a name the game makes up, and can wave, cheer and play matches. Nobody can type messages or talk. A child can hide or report another player or tap the people button to play alone, and a grown-up can choose Friends only or Off in Settings. Parties stay private and join by code only: there are no friend lists. A code takes new friends for 8 hours, and the host can make a new code or remove someone at any time. |
| FAQ "Can I turn Play with friends off?" | Yes. In Settings, behind the grown-up check, Play with friends can be set to Allowed or Off. A first name typed for a party is shown only to that party and is never stored. | Yes. In Settings, behind the grown-up check, a grown-up can choose Other players and friends, Friends only, or Off. A first name typed for a party is shown only to that party and is never stored; other players see only a name the game makes up. |
| About, Privacy (after the first-name sentence) | (added) | Other kids playing at the same time can be seen on the island with a name the game makes up and preset waves and cheers; a grown-up can switch that off in Settings. |

Still only incomplete (true with the flag on, not changed): the FAQ "Can my child chat with other people?" (mentions only Play with friends), the "Play with friends" highlight ("Private parties by code"), `components/landing/Landing.tsx` screen-reader summary.

## In-game lines added by the verify pass (`lib/multiplayer/publicCopy.ts`)
- Lock reason (Friends only): "A grown-up chose Friends only." → "A grown-up chose Friends only. A grown-up can change this in Settings."
- Roster, when the world count is larger than the list: (added) "Others are further away."
- Report sheet, above the reasons: (added) "A report can’t be undone. Hide can."

## Pages NOT changed by this work (now partly done: see the /learn and About section above) that would become untrue when the flag is on

These files belong to other areas and were left alone; they must be updated (flag-aware, the same way) before the flag is switched on:
- `lib/site/learnFeatures.ts`: "Private parties by code, never with strangers: no lobbies and no friend lists." (line ~78); the FAQ "Can strangers join, or can kids message each other?" ("Parties are private and join by code only: there are no public lobbies, matchmaking or friend lists…", ~459); "Can I turn Play with friends off?" ("Allowed or Off", ~460); the safety card "Allowed or Off" (~290); "Grown-ups can switch Play with friends off…" (~75).
- `lib/site/aboutCopy.ts` privacy line (~12): first name "shown only to the friends in the same party" is still true, but it does not mention other players.
- `components/landing/Landing.tsx` screen-reader summary (~34) mentions only play with friends (still true, incomplete).
