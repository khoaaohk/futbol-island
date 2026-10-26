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
| 5 | P1 | Android back | The browser/Android back button with the map, settings or pocket open leaves the game (history has no in-game entry), instead of closing the sheet | Open the map, press back | see below |

## Scenarios played

