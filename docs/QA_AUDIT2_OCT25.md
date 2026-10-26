# QA audit round 2, Oct 25-26 2026: indoor rooms and the economy

Lane: the Arcade and its five cabinets, Kit Shop, Konbini, Museum, vending machines, Rosa's market stand, cards / backpack /
card offers, coins and settings, the first-visit title and tutorial. Round 1 (docs/QA_AUDIT_OCT25.md on the qa branch) covered
back button, offline screen, 320 px sheets, swimming, jobs, bugs and reef balls; those were not repeated.

How: headless Chrome (muted) on a worktree dev server (own port and dist dir), 390x844 touch for nearly everything, 700x840
touch (fold) for Strikers and the Boot Studio, 1280x800 desktop for Strikers. Coins were seeded through the wallet's `runs`
(island jobs). Scripts lived in the scratchpad; screenshots were read for every new screen.

## Findings

| # | Sev | Area | Finding | Repro | Status |
|---|-----|------|---------|-------|--------|
| 1 | P0 | Arcade · Island Strikers | Unplayable on every phone. Strikers showed "Turn sideways to play" on a portrait touch screen, and since Oct 24 a sideways phone shows RotateLock's "Turn your phone upright". A deadlock. | Phone, Arcade, walk to Strikers, Play | FIXED 081ffae5: the portrait block is gone (the pitch already fits portrait: "GOLD ATTACKS ↑"); the thumb controls now hide under the start / pause / full-time card, where they had covered Kick off and Leaderboard. Verified 390x844, 700x840, 1280x800. Test `tests/strikers-portrait.cjs` |
| 2 | P1 | All arcade games | Turning the phone sideways showed the turn-upright card, but the game kept running behind it: Strikers conceded (2:58 → 2:51, Blue scored), Breakaway Run lost a heart. | Start a match, rotate to 844x390 for 8 s, rotate back | FIXED da0d86aa: RotateLock sends a window `blur` when its media query starts matching; the games already pause on blur. Strikers "Match paused" with the clock held, Breakaway "TIME OUT". Test `tests/qa2-rotate-pause.cjs` |
| 3 | P2 | Pass Puzzles | The solved card said "Replay level · 3 coins", but puzzles are free (`useArcadeEntry` never charges them; the Coins panel says "Pass Puzzles are free"). | Solve "Find a Friend" | FIXED 19f06e17: "Replay level · free". Test `tests/qa2-buy-copy.cjs` |
| 4 | P2 | Kit Shop · Boot Studio | "Buy for 265" spent the coins on one tap, with no confirmation (the ball and jersey studios both ask first). | Boot Studio with 400 coins, tap Buy | FIXED 19f06e17: "Buy these boots?" with Not yet / Buy for N; Escape and a tap outside close it; triple-tapping Buy charged once. Verified phone and fold. Test `tests/qa2-buy-copy.cjs` |
| 5 | P3 | Island minimap | React warning on every island load: "Removing a style property during rerender (transition) when a conflicting property is set (transitionDuration)". The minimap layer swapped `transition:'none'` and `transitionDuration` between renders. | Load the island, watch the console | FIXED dc69bc86: the frame-driven branch uses `transitionDuration:'0ms'` (same effect, no shorthand). `tests/heat-pass3.cjs` updated to match |
| 6 | P2 | Kit Shop | Bought boots, balls and kits never appear on the island: nothing outside `lib/shop` / `components/shop` reads the purchases (only the save snapshot). My kit says "Your kit lives here in the Kit Shop". A child pays 170-265 coins for gear only seen in the shop. | Buy boots, leave, look at the player | OPEN (design: wearing shop gear on the island is a feature, not a fix). The new boots confirmation says "They go in My kit" so it does not promise more |
| 7 | P3 | Boot Studio | After buying, the footer still says "Buy for 265"; tapping again only says "You already own these boots" (no second charge). | Buy, tap Buy again | OPEN (needs an `owned` prop through the shared studio contract in `components/shop/studios.tsx`) |
| 8 | P3 | Strikers, portrait | The joystick sits over Gold's own goal mouth and the footer tip line; the Sprint / Shot power / Team spirit meters sit under the right-hand buttons. Playable, but tight. | Strikers on 390x844 | OPEN (layout polish for whoever owns Strikers) |
| 9 | P3 | Breakaway Run | Hidden mission text lists "Set 5/6/7: Island legend ball" three times (screen readers only). | Read the menu's text | OPEN |
| 10 | — | Card offers | An open card offer has no close button. | Earn an offer | NOT A BUG: by design ("an open offer must be answered", CardOffer.tsx); it waits through a reload and two stacked offers open one after the other |
| 11 | — | Kit Shop on a phone | The ball wall is off screen on a phone; tapping the right side walks to the boot wall. | Phone, Kit Shop | NOT A BUG: Femi's "Show me the ball studio" opens it. Worth a look if kids miss the ball studio |
| 12 | — | Save codes | Could not test making and loading a save code: saving is off on a local server (`/api/save/status` → saving:false), so Start shows "Saving is taking a break". | — | NOT COVERED (needs the real backend) |

## Scenarios played (52)

Arcade room
1. Enter at 390x844: Exit, Scores, Coins, 4 emote buttons; loading card, then the room.
2. Coins panel with 0 and with 100 coins (shows 97 after one 3-coin play: balance = earned − spent).
3. Scores panel offline: "The island board can't be reached right now. Your scores still save on this device."
4. Emotes x4 (rainbow flick, scissors, shoot, keep-ups).
5. Rest: 26 s idle → 0 rAF in the next 3 s; a tap wakes it (61 frames in 1 s).
6. Exit → island at the arcade door (103, −48).
7. "Arcade" back button mid-game → back in the room with the cabinet prompt.
Pinball
8. Play with 0 coins: "You need 3 more coins. Island jobs can help you earn them", nothing spent.
9. Play with 200: one 3-coin spend, launch, flippers; coins credited mid-game (+3 on a goal, 12 in a long run, under the 15 cap).
10. Tab hidden → "TIME OUT", Resume.
11. Fast-forward to 90' → full time → "New high score!" entry: typed KID + lion → device board #1.
12. Leaderboard offline (week / all-time tabs) → kind offline note; Done.
13. Play again → second 3-coin spend; pause → Back to arcade.
Tennis
14. Court picker menu, Play (one spend), taps, tab hidden → TIME OUT, rapid pause/resume x6 (ends paused, stable).
15. Idle at the serve: the game waits for the player (no auto-loss).
Breakaway Run
16. Menu with missions; Play; tab hidden; rapid pause/resume.
17. Six taps on Play in 240 ms → exactly one 3-coin spend.
18. Run to full time without input (54 s) → high-score entry → Skip → five fast taps on Play again → one more spend.
19. Rotate sideways mid-run (#2).
Island Strikers
20. Phone portrait (#1), menu card with controls hidden, Kick off, play, tab hidden → "Match paused", rapid pause taps.
21. Fold 700x840 and desktop 1280x800.
22. Rotate sideways mid-match (#2).
Pass Puzzles
23. 0 coins: free to play. Pack, level, brief, hint button, Start puzzle.
24. Wrong pass → "2 tries left" with why; keeper save → coaching line.
25. Solve: ★★★, +8 coins (5 first solve + 3 new stars), high-score entry (#3).
Kit Shop
26. Enter: coins, My kit, Femi's greeting; talk to Femi (6 questions / studios).
27. Boot Studio: Buy with 200 coins (needs 65 more, nothing spent); with 400 (#4, #7); My kit shows the boots.
28. Boot confirm: Not yet, Escape (studio stays open), triple tap on Buy (one spend); fold 700x840.
29. Ball Studio via Femi: draw step coach card, two strokes, Save to a slot, reload, reopen: drawing kept, price 170 → 190.
Konbini
30. Enter (main door): coins, Hana's greeting, keep-ups / shoot buttons.
31. Drinks fridge: item card, four fast taps on Buy → one 4-coin spend, reveal, drink ("Yum!").
32. Daily snack limit: 3 buys, the 4th Buy disabled ("Fuelled up today", 0/3 left).
Museum
33. Enter, tap the TV case → case view 9/23, See exhibit (Telstar), Back, Back.
34. Next case x6 → offside exhibit (its quick check sits behind the machine; not reached).
35. World Cup ball gallery (opens at the nearest ball, 1934 Federale 2/23), story sheet.
Island economy
36. Vending, plaza: 20 coins, tap the 35-coin TV ball → "Need 15 more coins. Try an island job!", nothing spent.
37. Drinks machine: buy water, Done mid-dispense → paid once, drink kept in the Snacks pouch, 2 of 3 left today.
38. Backpack: Snacks 1 after #37; books, cards, rides, balls, collection all listed.
39. Rosa's stand with a seeded basket (6 mangoes, 2 oranges): four fast taps on Sell all → one sale of 12 (+5 learning coins for "Sell to Rosa"); allowance 12/30 shown.
40. Card trade-in list on the Cards tab (2 coins each).
41. Card offer from the sale waits while the stand is open, opens when it closes.
42. Reload with the offer pending → it opens again; Paths badge "1 card pick waiting".
43. Two stacked offers → first opens, card revealed ("Added to your binder"), Done → the second opens; store empty after.
44. Island pocket sheet (coins, how to earn).
Settings and first visit
45. Settings: music off, sound effects off, Night, Battery saver on → reload → all kept; restored.
46. Arcade / Konbini / Shop audio read the same keys (fi2-sound-muted, fi2-music-enabled).
47. Brand new player, 390x844: title → Start → "Saving is taking a break" → Play → Pick your player → 4 tutorial cards → Explore → island with 40 starter coins.
48. Coins bar matches the wallet after every spend above (Arcade 97, Konbini 46/41, Shop 135, vending 17, market 37).
Desktop / fold
49. Strikers desktop: menu, play, pause.
50. Strikers fold: menu, play, pause.
51. Boot Studio fold: confirm flow.
52. React console clean on the island after #5.

## Not covered
Strikers full time and its high-score entry (no fast-forward hook; 3 game minutes run ~6 real minutes headless); tennis game
over; museum quick checks (StepCheck appears after each exhibit's machine); jersey studio; save code create / load (#12);
fishing and bait (round 1 lane and needs the water); energy meter drain; real-phone sound.
