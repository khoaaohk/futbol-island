# Arcade continuity and coins — September 26, 2026

Local implementation; not deployed.

## Design and research

Coins reward football actions and improvement, not time spent idle. The motivation model in [Przybylski, Rigby and Ryan (2010)](https://selfdeterminationtheory.org/SDT/documents/2010_PrzybylskiRigbyRyan_ROGP.pdf) supports competence, autonomy and relatedness. [Lucas Blair’s achievement design discussion](https://www.gamedeveloper.com/design/the-cake-is-not-a-lie-how-to-design-effective-achievements) supports meaningful, attainable challenges and useful progress feedback. These informed rewarding goals, controlled touches, passing and better puzzle solutions. Exact numbers below are initial tuning choices, not research findings or measured playtime guarantees.

- Breakaway: 2 per goal, 1 per five collected footballs, at most 12 per run.
- Pinball: 3 per goal, 2 per completed passing move, at most 15 per run.
- Tennis: 1 per three clean returns, 2 per point, 4 per win, at most 18 per match.
- Strikers: 1 per three passes, 3 per goal, 5 for finishing and 3 more for winning, at most 20. User engagement is required.
- Puzzles: 4 for a first solve and 1 per new best star. Repeated solves pay 1, at most six repeats per visit. Watching a replay earns nothing.

The Coins slideout replaces Games and shows balance, lifetime earnings, earnings per machine, recent play and game shortcuts. It links to the store’s Mystery packs tab through the arcade return transition. Thirty coins buys one of six legends, with equal chances among the remaining legends and no repeats in this series. The selected card and debit are saved together before reveal. A completed series stops further purchases. Canonical card collection grants recover from the stored receipt. Notes are original coaching prompts; FIFA and UEFA sources separately support the historical context.

## Continuity and implementation

Exit reuses NavigationButton, so its label collapses to the back icon before the black room fade. A separate server-painted “Back to the island” loader waits for the actual island render, skips the startup splash and returns walking outside the arcade. South-door walking uses the same return flow. Entry fades to black. The header has no gradient.

The room uses the island’s exact circular joystick styling and paint helper, plus four actions in the island’s exact two-by-two layout: Look around, Celebrate, Wave and Jump. Scanning and celebration use existing native skill poses, with no radar. Main-character/NPC body separation applies both ways. The prize counter has a separate rear shelf collision and a clear attendant aisle. A distinct original arcade music loop uses the room’s existing audio context, sleeps hidden and disposes with the room.

Wallet writes occur only when a milestone increases, not every frame. Purchases serialize through a browser tab lock. Store equipment previews are disabled for the packs category. The slideout and card reveal use finite CSS transitions and reduced-motion overrides. The room remains a separate document from the island.

## Evidence

- Shared joystick computed styles match the island on the 390×844 touch viewport. Actual touch Jump/Wave and NPC approach/cancel passed; closest body distance was 0.8459 m against the 0.84 m target.
- Ordinary Breakaway touch play earned three coins from a goal and collected-ball milestone. Exiting the game, opening Coins and reloading preserved the balance. No gameplay state or wallet was seeded for this check.
- Wallet correctness fixtures cover monotonic credit, puzzle deduplication, concurrent purchases, failed storage, grant recovery and six unique packs.
- Entry and separate return loader passed browser checks; actual Exit button collapse and icon were observed before navigation.
- `npm test` passed. Mobile pack purchase/reload/unique-card/insufficient-funds checks passed. Mobile isolation verified the separate arcade music plays, disposes on game launch, and no island resources load in the arcade.

Touch viewport checks are desktop emulation, not physical-phone temperature or battery measurements.

Desktop integration found a return-to-store timing race with pending card offers. The server now supplies the requested pack-store state before the first ready render; the store starts directly on packs and defers other reward offers until it closes.

Final integration: desktop and mobile pack purchase flows passed with no page errors; a second pack was unique, reload kept the first receipt, and spending the balance disabled further purchases. Portrait and landscape real-touch tests matched the island’s four action controls exactly (positions, sizes, surface and spacing) and triggered all four native animations. Settled Coins drawer fits390×844 exactly. TypeScript and wallet/audio checks passed.

## Follow-up: audio ownership, return treatment and idle work

Applaud replaces Look around, using the native thank-the-passer point-and-clap pose. Removed the aisle instruction. The return loader now shares the main loading screen’s blue paper grain, brush type and small animated loading track; it still skips splash cast assets and waits for actual readiness.

Entering the arcade immediately deactivates island music, disposes the island effects context and stops registered detached narration elements from card plays, story films and lessons. Late play completions re-check ownership before staying audible. The music scene gate also prevents visibility/input callbacks from restarting the old soundtrack. Narration and music ownership fixtures passed; the mobile entry check confirmed music paused before navigation.

The arcade room now sleeps behind Coins, clears held controls and resumes on closing; auto-walk destinations survive that resume. Settled mobile drawer check confirmed zero new room draws while open. Hidden-tab sleep and separate-document isolation remain required. Physical phone temperature is not established by these tests.

Arcade entry now has its own server-painted loading screen, with the main splash’s heading/loading-track composition, a dark static grain background, three simplified cabinets and football characters at their controls. The illustration is inline static SVG; it imports no game scene, player rig, film or island artwork. It fades off only after the room has rendered. Font fallback remains visible while the shared brush font loads. Desktop and mobile entry checks passed.

Return-position follow-up saves tab-local coordinates, facing, travel mode, altitude and camera from Town’s live scene before departure. A restored jetpack uses its saved cruise height; a new takeoff keeps the normal default. Missing/invalid storage still returns safely at the arcade door. The snapshot helper covers all five travel modes and restricted storage; round-trip fixtures separately exercise walking and flying through real entry/exit handlers.

## Two-card-pack offers (local follow-up)

The store now shows two offers and no owned-legend gallery: 3 cards for 30 coins (exactly one legend), or 5 cards for 50 coins (one guaranteed legend, 25% chance of a second). Remaining cards come from current-player entries excluding the six coaching legends. No duplicate names within a pack; new names are preferred across previous receipts, with repeats allowed after that pool is exhausted. Every legend reveals its original mental-strength note. A newly opened pack shows all contents; reopening the store shows the offers while cards remain in the player collection.

A multi-card receipt stores the exact cards, legends, size and one coin debit before collection grants. Existing single-card receipts remain readable. Cross-tab locking, insufficient-funds and save-failure behavior are preserved; partial collection grants retry without rerolling or spending again. Tests cover both sizes/prices, the 25% boundary, duplicate prevention, reload, concurrent purchases and partial recovery. Browser walkthroughs use isolated seeded test coins and real store buttons. Local only.
