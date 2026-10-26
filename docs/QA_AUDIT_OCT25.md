# End-to-end QA audit, Oct 25 2026

Driven in headless Chrome (real GPU via ANGLE/Metal) against a dev server, phone portrait 390x844 touch first, then 320x568,
a foldable (700x840), a portrait tablet (820x1180) and a desktop pass. Relay off (no `NEXT_PUBLIC_MULTIPLAYER`), local saves on.
Layout sweeps use `scripts/audit-landscape.cjs` (portrait sizes `s320`, `fold`, `tab` added Oct 25).

Severity: **P0** blocks play, **P1** a kid will hit it and be confused, **P2** polish, **P3** cosmetic / dev-only.
Status: FIXED (commit), OPEN (reason), NOT A BUG (re-verified).

## Findings

| # | Sev | Area | Finding | Repro | Status |
|---|-----|------|---------|-------|--------|
| 1 | P3 | Minimap | React dev warning on every island visit: `transition` shorthand mixed with `transitionDuration` on `.minimap-layer` (components/IslandOverview.tsx) | Open the island, watch the console | FIXED: frame-driven style uses `transitionDuration:'0ms'` |
| 2 | — | Kit Shop / Museum | Layout sweep reported Done / My kit "covered" by the door slide | `audit-landscape.cjs places` presses Escape before measuring, which starts the leave doors | NOT A BUG (artifact of the script; rooms open fine) |
| 3 | — | Moped | Moped "did not move" in the travel sweep | It was wedged between the Konbini vending machine and the cage fence; steering out works | NOT A BUG |
| 4 | P2 | Reload | Reloading mid-ride goes back to the title (Play), then the player arrives by jet at the start spot; ride and position are not kept | Ride the bike, reload | OPEN (design: arrival on every new session looks intended) |
| 5 | P1 | Android back | The browser/Android back button with Settings, Paths or the pocket open left the game (no history entry of its own at `/`; no popstate handling anywhere) instead of closing the sheet | Open Settings, press back | FIXED 8ada388d: `lib/town/backCloses.ts` keeps one guard entry while the island is mounted; back closes the topmost dialog (Escape keydown, or `cancel` on a native modal `<dialog>` such as the pocket drawer); with nothing open back leaves as before. Test `tests/back-closes.cjs`; browser-verified (Settings, Paths, pocket each closed by back, bare back leaves) |
| 6 | P1 | First visit, 320 px | Save-code sheet: centred "Print code" (x 116..204) ran 16 px under "I saved it" (188..292): the first screen a new player sees on an SE-1 / small Android | 320x568, Start → Get my code | FIXED 9e6aa848: below 350 px Print code takes its own centred row (dialog still fits, 125..558 of 568) |
| 7 | P2 | Settings, 320 px | Title truncated to "Make it your…" | 320x568, open Settings | FIXED 9e6aa848: below 360 px the title wraps onto two 22 px lines inside the 44 px header row |
| 8 | P3 | Map | Legend chips (Vending, Fishing, Jobs, Explore, Fly there) are 22 px tall tap targets; a marker is half cut at the right edge of the card | Open the travel map | OPEN (legend reads as a key, not a control; left for the map owner) |
| 9 | — | Map | "Travel to Summit / Coral Cay" reported off-screen | They are the next pages of the arrows carousel | NOT A BUG |
| 10 | — | Dive | Holding W while diving seemed not to move | The dive keeps its own position (`diveSession` state.x/z); `__fi2.location` is not the dive position | NOT A BUG (probe was wrong) |
| 11 | — | Emotes | Emote button missing while walking alone | By design: hidden when nobody is near to emote with (`emoteButtonState`) | NOT A BUG |
| 12 | P2 | Swim / dive | The "Pace yourself" / "Pace your breath" coaching card covers the top 100 px of the view (18..372 x 74..173) while swimming | Swim off the east jetty | OPEN (design: teaching card; could auto-fade after a few seconds) |
| 13 | P1 | Flaky / offline network | No error boundary anywhere: going offline after load, then tapping Settings (or any lazy HUD part: cards, CoinQuest, pocket) threw "Loading CSS chunk … failed" and the whole island went blank (body text empty) with no way back | Load the island, go offline, tap Settings | FIXED: `app/error.tsx` shows "No internet right now … Your island is saved." with Try again (disabled until back online); a chunk failure reloads (title → Play → island from the save), other errors re-render in place. Test `tests/game-error-screen.cjs`; browser-verified |
| 14 | P2 | Open sea | 5-minute soak: walking west/south-west off the island the swimmer reached open sea around (-126, -274) and stopped moving for two samples (~14 s of holding forward) with nothing in view and no hint to turn back | Swim far south-west of the island | OPEN (not re-verified before the disk filled; check whether this is the sea edge clamp and add a "turn back" nudge) |
| 15 | — | Soak | Heap 225-250 MB after the first GC over 3 min of wandering (all rides, keep-ups, Settings open/close), DOM 3.9-5.2 k nodes, listeners oscillating 750-2650 (no monotonic growth), geometries 1107 → 1254 as new areas lazy-load, textures 28 → 53, programs 44 → 69; no console errors | 5 min soak (stopped at 3 min: the Mac's disk filled) | NOT A BUG so far (no leak signal) |
| 16 | — | Desktop 1280x800 | Arcade (Exit, Scores, Coins, 4 together-emotes), Kit Shop (Done, My kit, "Design your own kit"), Museum (Done) load and lay out; no console errors | `/arcade`, `/shop`, `/museum` | NOT A BUG |
| 17 | P3 | Dev only | First "Get my code" on a cold dev server waits ~30 s for `/api/save` to compile; scripts that click on a timer miss it | Fresh dev server | NOT A BUG (dev compile) |

## Not covered (ran out of disk / rounds)

The Mac's disk filled twice during the run (other agents' builds plus this dev server's 2.7-4.8 GB webpack cache), which killed the
dev server and the soak; the remaining lanes were not played end to end and are left for the next QA pass: the five arcade
cabinets one by one, Kit Shop ball studio drawing, vending / market stand / bait, pitches (7v7, 9v9, futsal, 11v11) as matches,
ball hunt balls (island, Coral Cay, Summit, East Jetty, reef chests), cards / backpack, rides (animal rides), sound / music / mute
toggles, slow-3G first load, multiplayer UI states with the relay off (the friends button is hidden when the flag is off), the
foldable and tablet journey screens (only the title rendered before the server died) and a full desktop journey.

## Scenarios played

1. First visit: title → Start → "Before you start" → save code → I saved it → loader → Pick your player → Skip → arrival (390 and 320).
2. Character picker Skip; tutorial skip.
3. Travel modes walk / scooter / bike / moped / jetpack / walk, each driven 2 s; travel button tap from the jet (lands to Walk).
4. Blast up + parachute, switch to walk mid-air (lands, pending ride clears).
5. Moped wedged between vending machine and cage fence (steer out works).
6. Reload mid-ride (title → Play → arrival; #4).
7. Back / forward from the game; back with Settings, Paths, pocket open (#5).
8. Tab hidden / visible (render loop and audio); see soak notes.
9. Escape closes pocket, Settings, Paths.
10. Keep-ups by tapping Juggle (streak counter), sky keep-up by holding J (mode sky, lands, streak continues).
11. Paths → Start here → lesson 1 steps; rotate to landscape mid-lesson (RotateLock "Turn your phone upright to play"), back to portrait (lesson continues).
12. Fishing: enter, aim/cast hint, cast, reel step, Back out.
13. Swim off the east jetty, dive, breath HUD, try a ride in the water (refused, stays swimming).
14. Konbini: enter, walk, Done → back to the island (return loader).
15. Kit Shop and Museum rooms load (doors open, NPC greeting, Done/My kit reachable).
16. Layout sweeps (audit-landscape journey + places) at 393x852, 320x568, 700x840, 820x1180: title, welcome, save code, tutorial, island, pocket, Paths, lesson, minimap, map, settings.
17. 5-minute soak wandering on all rides with keep-ups and Settings open/close (heap, DOM nodes, listeners, three.js geometries/textures).
18. Offline after load: riding still works; Settings while offline (#13); navigating to a room offline (browser offline page, expected).
19. Desktop 1280x800: Arcade, Kit Shop, Museum rooms.
20. 320x568 save-code footer and Settings title, before and after the fixes (#6, #7).

