# Fishing and Rosa's market stand

Written 27 Sep 2026. Local only: nothing has been committed or deployed.

User request: "Add fishing-related elements along the island to catch fish to sell at the farmers market for money."

## What it teaches (AGENTS.md)

- **Every species is linked to a real club** whose nickname, home port or fan culture comes from the sea. The catch label shows one verified fact, labelled **Real football fact**; the Fishbook shows it again with a plain-text source credit (for example "Source: Wikipedia"). Kids never see clickable external links (decided Sep 27 2026); the URLs stay in `fishCatalog.ts` and the table below, and `tests/fishing.cjs` asserts the fishing and market UI has no anchors or hrefs.
- **The beats of a catch teach goalkeeper timing** (`KEEPER_LESSONS` in `fishCatalog.ts`, shown as a small toast):
  - Cast: set your stance.
  - Nibbles: a nibble is a feint. Stay set like a keeper who doesn't dive early. The source is Bar-Eli et al. (2007), who studied 286 penalties and found that keepers nearly always dive, although staying in the middle would have saved the most.
  - Tapping on a nibble: "Dived too early", like being sold a striker's dummy.
  - Tapping late: "A touch too late". Keepers wait on their toes, ready to spring.
- **Game fiction is labelled separately.** The spot names, their blurbs and which fish live where are original fiction, shown as **Island story** in the Fishbook.

## Species and club links

Facts were checked on 27 Sep 2026 with web searches whose results agreed across club, FAO and journal pages.

| Fish | Rarity word | Coins | Club and link | Source |
| --- | --- | --- | --- | --- |
| Brown Shrimp | Common | 3 | **Southend United**, "The Shrimpers". Named after Leigh-on-Sea's shrimp boats; a shrimp is on the badge. | https://en.wikipedia.org/wiki/Southend_United_F.C. |
| Sardine | Common | 3 | **Santos FC**, "Peixe". In 1933 rival fans called them "fishmongers" and Santos fans adopted the name. Pelé played there from 1956 to 1974. | https://en.wikipedia.org/wiki/Santos_FC |
| Mackerel | Common | 4 | **Celta Vigo**. Vigo is Europe's biggest fishing port. | https://www.fao.org/newsroom/story/Not-business-as-usual-in-Europe-s-largest-fishing-port/en |
| Sea Bass | Common | 4 | **Olympique de Marseille**, "Les Phocéens". Named after the Greek founders of Marseille; OM were the first French Champions League winners, in 1993. | https://en.wikipedia.org/wiki/Olympique_de_Marseille |
| Herring | Good | 5 | **FC St. Pauli**. From Hamburg's harbour district; fans adopted the skull-and-crossbones in the 1980s. | https://en.wikipedia.org/wiki/Skull_and_crossbones_(fraternities_and_sports) |
| Cod | Good | 6 | **Fleetwood Town**, "The Cod Army". Fleetwood was a deep-sea fishing port. | https://en.wikipedia.org/wiki/Fleetwood_Town_F.C. |
| Haddock | Good | 6 | **Grimsby Town**, "The Mariners". Fans wave the inflatable "Harry Haddock", a tradition from the 1989 FA Cup games. | https://gtfc.co.uk/the-return-of-harry-haddock/ |
| Bluefin Tuna | Rare | 9 | **Yokohama F. Marinos**. "Marinos" means sailors, after the port of Yokohama; the mascot is the seagull Marinos-kun. | https://www.f-marinos.com/en/club |
| Little Shark | Rare | 10 | **Junior de Barranquilla**, "Los Tiburones". | https://en.wikipedia.org/wiki/Atl%C3%A9tico_Junior |
| Octopus | Legendary | 12 | **Paul the Octopus** (football culture). Picked 8 of 8 results at the 2010 World Cup. | https://en.wikipedia.org/wiki/Paul_the_Octopus |

Wording choices made on purpose:
- Marseille were the "first" French winners, not the "only" ones: PSG won in 2025.
- Vigo is "Europe's" biggest fishing port, not the world's.
- Harry Haddock dates from 1989, not "the late 1980s".

Researched but not used: Morecambe "The Shrimps", Pescara "I Delfini", and Cádiz "Submarino Amarillo" (a submarine, not a sea creature).

## Spots

All spots use `lib/town/fishing/fishCatalog.ts` (`FISH_SPOTS`).

| Spot | Where | Fish |
| --- | --- | --- |
| South Pier Fishing Station | (217, 212.6) at the old fishing station | sardine, mackerel, sea bass, tuna, octopus |
| Lifebuoy Point | (63, 212.6), beside the western boardwalk lifebuoy | shrimp, sardine, herring, shark, octopus |
| Harbour Wall | (237.2, 66), behind the farmers market | cod, haddock, herring, mackerel, tuna |
| North Beach Rocks | (60, −238) | shrimp, sea bass, sardine, octopus, shark |
| West Cove | (−95.5, 24) | cod, haddock, sea bass, shark, tuna |

Each spot has a small fishing post (tackle chest, a notice board with a fish emblem, a roof and rods) and a red float in the water. Walk within about 6 m, or point at the post on desktop, to see the building glow and the **Fish** prompt (the `.store-enter-prompt` pattern). Hovering a post shows the prompt from a distance, as buildings do.

## Live fishing (no dialog)

Fishing plays **in the 3D island view**. There is no modal; the only UI is a small HUD (`components/FishingHost.tsx`): Reel, Stop, a Fishbook button, a one-line hint and a short lesson toast.

1. **Start.** Walk up to a post and tap **Fish**. The camera eases (0.9 s orbit) to a low shoreline shot, as in the reference `docs/fishing-visuals-ref.png`: the angler sits upper-left, the float is in the lower half and the sea fills the bottom. Portrait phones look straight back along the line so both the angler and the float fit. The line casts on its own when the camera arrives.
2. **Wait.** The float lands with a splash ring. After 1.2–3.5 s a fish **shadow** appears along the shore and swims to the float. The shadow's size (small, medium, large, huge) is the only clue to the species.
3. **Nibbles.** The fish nibbles 1–4 times (legendary fish 2–4, and faster). Each nibble is a small bob, a ripple ring and a soft tick.
4. **Bite.** The float is pulled under, with a big splash and a plunge sound. You have one tap to react (Reel, Space/Enter, or a tap on the water): 1.0 s for common fish, 0.9 s for good catches, 0.8 s for rare and 0.7 s for legendary, plus 0.35 s with reduced motion.
   - Tapping on a nibble or while the shadow approaches scares the fish off.
   - Tapping late means it swims off.
   - Either way another shadow comes along after a moment. Nothing is lost.
5. **Catch.** The angler holds the fish up. A floating label next to them shows the name, the rarity word, the size, the coin value and the club with its fact line. **Keep fishing** casts again; **Stop** (or Escape) ends the session.
- **Leaving.** Walking more than 1.3 m away, flying, a lesson or an overlay also ends the session, and the camera eases back.
- **Idle.** If three fish in a row swim off with no tap at all, the line is reeled in (`IDLE_ESCAPES`), so the session never cycles forever.
- **Card offers** and other pop-ups wait while fishing (`fishingOpen` in the `Town.tsx` blocked lists). The island loop and the joystick keep running, because fishing is not in `settingsRef`; only the Fishbook and market dialogs pause the island.
- **Sound.** Sounds reuse the island sound system's document cues (`fi2-path-cue`, `fi2-story-cue`), so fishing opens no new audio context.

The **Fishbook** (`components/Fishbook.tsx`) records caught and not-yet-caught species, the count, the biggest size and the shadow size, plus the club fact with a plain-text source credit and the keeper study credit (no links). It is saved in localStorage under `fi2-fishbook-v1` and merges across tabs.

Kid safety:
- No odds or percentages are shown anywhere.
- Prices are fixed per species, never set by size or luck.
- A missed fish costs nothing.

## Economy

This section fits the jobs economy in `lib/town/jobs/jobEconomy.ts` and `docs/island-jobs.md`, and the shared market rules in `lib/town/market/market.ts`.

- **Prices:**
  - Common fish: 3–4 coins.
  - Good catches: 5–6 coins.
  - Rare fish: 9–10 coins.
  - The octopus: 12 coins, the priciest item at the stand.
- **Why these prices.** A realistic catch takes about 30 s and earns about 4 coins on average, which is roughly the 7–10 coins a 1-minute island job pays.
- **Shared daily soft cap.** Fish, produce and (if ever switched on) cards all sell at full price until the day's sales reach `MARKET_FULL_PRICE_COINS`, which is 40 coins. After that everything sells at half price (at least 1 coin), and the cap resets at local midnight.
- **Other limits:**
  - The basket holds 20 items, shared with garden produce.
  - Catching is unlimited, because it's the fun part and it fills the Fishbook. Only selling is capped.
  - With a full basket a fish swims free but is still logged.
- **How coins are paid.** Sales go through `islandJobWallet.credit` (jobs agent) into the shared arcade wallet (Astra, not edited).
  - They arrive as idempotent `market:<day>:<sale>` runs of the `live` source. That source has a 20-coin cap per run, so a bigger sale is split into chunks.
  - Replaying a sale never pays twice.

## Rosa's Market Stand (`components/MarketStand.tsx`)

- **One stall.** The stand is the existing CITRUS & FRUIT stall at (230, 35), the same stall the jobs agent pointed its produce sale at. It gets a "ROSA BUYS · FISH · PRODUCE · CARDS" sign and a fish crate. It adds no new footprint or collision. Walk up or hover it for the **Sell** prompt.
- **Tabs.** The stand has three tabs: **Fish**, **Produce** and **Cards**. The Cards tab is `components/MarketCardsSection.tsx` from the sell-shop agent, which ships switched off.
- **What each tab shows:**
  - The price for each item, **Sell 1** buttons, and a **Sell all · N coins** button.
  - A "full price today" meter and the coin balance.
  - A one-shot coin burst on each sale, hidden with reduced motion.
  - The football lesson of the goods sold.
- **How Sell 1 works.** It lives in `lib/town/market/marketStand.ts` and reuses `quoteSale` from `market.ts`, so one item and "sell all" follow the same prices and cap.
- **Opening the stand from other features:** `window.dispatchEvent(new CustomEvent('fi2-open-market-stand',{detail:{tab:'produce'}}))`.

## Files

- `lib/town/fishing/fishCatalog.ts`: species (with shadow sizes), club facts, spots, keeper lessons, the stand location.
- `lib/town/fishing/fishingCore.ts`: the pure state machine (cast → float → approach → nibble → bite → caught / scared / escaped), plus the catch roll, size, cast point, shadow spawn and Fishbook.
- `lib/town/fishing/fishingSession.ts`: the HUD ↔ island bridge (commands, a snapshot per phase, lessons, cues).
- `lib/town/fishing/fishingStore.ts`: the Fishbook in localStorage, landing fish in the market basket, and the session singleton.
- `lib/town/fishing/fishingWorld.ts`: posts, glows, floats and prompts, and the **driver** that steps the state machine and drives the camera and visuals.
- `lib/town/fishing/fishingCamera.ts`: the low shoreline camera (ease in and out).
- `lib/town/fishing/fishingVisuals.ts`: **placeholder art behind a small interface** (rod, line, float, rings, shadow, held fish, foam). The graphics agent owns this file; see `docs/fishing-visuals-HANDOFF.md`.
- `lib/town/market/marketStand.ts`: Sell 1, unit price and the allowance meter.
- The fish section of `lib/town/market/goods.ts`, generated from the catalogue.
- Components: `FishingHost.tsx` (+ css) for the HUD and prompts, `Fishbook.tsx` (+ css), `MarketStand.tsx` (+ css), `FishArt.tsx`.
- Tests: `tests/fishing.cjs` (in `npm test`).

## Heat

See `docs/performance-guide.md` ("Fishing spots and market stand").

## Decisions for the user

1. **The fish-to-club pairings.** The clubs are verified, but which fish represents Santos, Celta, Marseille, St. Pauli and Yokohama is a teaching choice, because those links are about the port and not a fish nickname. Shrimp–Southend, Cod–Fleetwood, Haddock–Grimsby, Shark–Junior and Octopus–Paul are direct links.
2. ~~Source links in the Fishbook~~ Decided Sep 27 2026: no clickable links for kids. The Fishbook shows plain-text credits; the URLs stay here and in the data.
3. **The soft cap is 40 coins a day** for all market goods (jobs agent's number). Fishing adds no cap of its own. Raise it if fishing and the garden feel too limited together.
4. **Bite window.** The window is 0.7–1.0 s, plus 0.35 s with reduced motion. Say if young players need it wider.
