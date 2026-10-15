# Fishing research: what other games do well, and what Futbol Island should do next

Written 15 Oct 2026. Research only: no code was changed and nothing was committed.

User ask: *"research other fishing games and see what we can do to improve the mechanics and graphics to make that even better."*

Constraints that every recommendation was checked against:
- **Players:** kids aged 7 to 12, mostly on phones.
- **Heat and battery come first** (AGENTS.md, `docs/performance-guide.md`).
- **The economy rebalance** (`lib/economy.ts`, `docs/economy.md`):
  - fish sell for a fixed value per species, `price × FISH_SELL_FACTOR`;
  - Rosa's same-kind ladder: full price for the first 4 of a kind, then ½, then ¼;
  - a 30-coin full-price allowance;
  - the Training meter;
  - `tests/economy.cjs` §3 keeps fishing's coins per minute below a hidden ball (3.43) and a lesson quiz (4.72).
- **Kid-safety rules** (`docs/fishing.md`): no odds or percentages anywhere, no clickable links, nothing is ever lost, and size never sets the price.

> **A note on sources.** The session's web-search budget was already used up, so the observations come from pages fetched directly. Wikipedia, Nookipedia and the official Sea of Thieves wiki could be read, and they are marked **(read)**. Fandom, the Stardew wiki, Bulbapedia and the Zelda wikis refused automated fetches (402/403). The notes on those games come from well-established knowledge of how they play, and their links are given as references marked **(ref)**. None of these notes is used as a kid-facing fact. Anything shown to kids would still go through the polite-fetch verification in `docs/fishing.md`.

---

## 1. Where our fishing is today (short audit)

| Area | What we have | Files |
| --- | --- | --- |
| Spots | 18 spots: the original shore posts, the East Jetty, 6 causeway and Coral Cay posts, Summit Isle's cove and Drop-off Ledge, and 2 deep-sea boats. Each has a reef theme (`REEF_THEMES`) or the deep-sea scene. | `fishCatalog.ts`, `underwater.ts`, `deepSeaScene.ts`, `deepSeaBoat*.ts` |
| Casting | Aimed casting: drag on the water, or drag from the Cast button. The dotted arc preview is one instanced draw. There are 1–3 drifting **hotspots** (drop-off, ripples, birds, reef edge, shadow, bait ball, upwelling), and **spooked water** within 2.5 m of a recent cast. | `fishingAim.ts`, `fishingOverlay.ts`, `fishingOdds.ts` |
| Bite | A shadow sized from small to giant swims in on a planned curved route; rare animals circle the float. There are 1–4 nibbles, then the plunge and a 0.7–1.0 s window (+0.35 s easy or reduced motion). Tapping on a nibble scares the fish; tapping late lets it escape. | `fishingCore.ts` |
| Fight | Tap Reel 2–14 times (sharks 10–14). Big fish pull the meter back after a pause. The reel meter has notches; the hint is "Hold on like a keeper". | `fishingCore.ts`, `fishingSession.ts`, `FishingHost.tsx` |
| Reward | The angler holds the fish up, with a floating label (name, rarity word, size, coins, club fact). The Fishbook has silhouettes, "Found at", the biggest size and the club fact with a plain-text credit. | `FishingHost.tsx`, `Fishbook.tsx`, `FishArt.tsx`, `fishingStore.ts` |
| Economy | Rosa's stand: per-species value × rarity factor, the same-kind ladder, the 30-coin allowance and the Training meter. | `lib/economy.ts`, `lib/town/market/*` |
| Juice | The float rides the swell, the line sag eases, double splash rings and drops, the catch wriggles and drips, fish undulate from the tail and bank into turns, darting reef fish, bubbles, sound cues reused from the island kit, a 14 ms haptic on the bite and a double pulse on the catch. | `fishingVisuals.ts`, `fishingOverlay.ts`, `fishSchools.ts`, `fishingLife.ts` (heat gate: tiers 0–1 only) |
| Teaching | Goalkeeper timing beats (`KEEPER_LESSONS`), a real club fact per species, and "Read the water". | `fishCatalog.ts`, `fishSpecials.ts`, `deepSeaFish.ts` |

**What already exists and can be reused cheaply:**
- **Day, sunset and night.** `TimeOfDay` in `lib/graphics/islandLighting.ts`, chosen in `IslandSettings.tsx` (the default is sunset).
- **The rod already bends** with line tension (`bend` in `fishingVisuals.ts`, a CPU vertex rewrite that runs only when the bend changes).
- **Fishing focus mode** (`lib/graphics/focusMode.ts`) freezes the background while the camera is on the shot.
- **One instanced overlay draw** that can carry new effect kinds for almost nothing.

**Gaps, compared with the games below:**
1. **The fight is the weakest part.** Tapping a counter N times has no decision in it: nothing to read and no risk to manage. Every well-loved fishing game makes the fight a small skill toy (Stardew's bar, Sea of Thieves' counter-steer, Cast n Chill's tension).
2. **There is no reason to come back at different times.** Every fish is available always: no night fish, no weather, no events.
3. **There are no goals beyond the Fishbook.** No legendary hunts, records, requests or trophies.
4. **The catch reveal is understated.** A label next to the angler, with no jump, beat or card moment.
5. **There is no first-time tutorial**, beyond hint text.

---

## 2. What other fishing games do well

### Cozy and kid-friendly

**Animal Crossing: New Horizons (Nintendo, 2020).** [Nookipedia: Fishing](https://nookipedia.com/wiki/Fishing) (read) · [Fish](https://nookipedia.com/wiki/Fish) (read) · [Fishing Tourney](https://nookipedia.com/wiki/Fishing_Tourney) (read) · [Wikipedia](https://en.wikipedia.org/wiki/Animal_Crossing:_New_Horizons) (read)
- **Reading the fish.** "All fish have a shadow size that can be used to roughly identify them", and sharks show a **dorsal fin** above the water, a unique silhouette cue.
- **Bite telegraphing.** Up to 5 nibbles, and the 5th is always a bite. The controller "vibrates each time a fish touches the rod, with a stronger vibration … when the fish bites", and the strength scales with the fish's size. The bite has its own deep *plop* sound.
- **Reward reveal.** The player holds the fish up to the camera with a pun line ("I caught a sea bass! No, wait — it's at least a C+!"). This is the series' signature moment.
- **Variety.** Fish depend on the hour, the month and the hemisphere ("played in real time"), and some only appear in rain.
- **Collection.** 80 fish. The museum, plus the Golden Rod as the reward for catching every fish.
- **Events.** The Fishing Tourney with C.J.: as many fish as possible in **3 minutes**, 1 point a fish plus a bonus for 3 or more; trophies at 100, 200 and 300 cumulative points. C.J. also turns 3 of a fish into a **model** (a trophy).
- **Takeaway:** shadow shape plus haptics plus sound do all the telegraphing, with one button. Kids learn the pattern without text.

**Stardew Valley (ConcernedApe, 2016).** [Stardew Valley Wiki: Fishing](https://stardewvalleywiki.com/Fishing) (ref)
- **Casting.** Hold to charge cast power.
- **Bite.** "Hit!" pops up when a fish bites.
- **Fight.** A vertical bar minigame. You **hold** to lift a green "bobber bar" and release to let it fall, keeping it over a fish icon that moves with a personality (mixed, dart, smooth, sinker, floater). A catch meter fills while the fish is inside and drains while it is outside.
- **Bonuses.** A **treasure chest** sometimes appears during the fight and must be held over too: an optional risk and reward. A "Perfect" catch (never leaving the fish) gives a bonus.
- **Progression.** Bait (faster bites), tackle (a bigger bar, a slower drain) and better rods. Fish depend on season, weather and time.
- **Legendary fish.** One per location, with a lore note. They can be caught once (until a later update) and are much harder.
- **Downside:** many players find the bar too hard early on. It is a classic source of frustration, and the game later added easier tackle. **Lesson for us:** a bar is great, but with forgiving defaults for 7-year-olds.

**Pokémon (main series).** [Bulbapedia: Fishing](https://bulbapedia.bulbagarden.net/wiki/Fishing) (ref)
- **Bite and reaction.** "Oh! A bite!" appears, with one button press to react. Rods progress from Old to Good to Super, each unlocking more species.
- **Chain fishing** (X/Y onward): consecutive successful reels raise the odds of a shiny. A streak reward with no extra input.
- **Takeaway:** a streak bonus suits kids well, if it is cosmetic.

**Dredge (Black Salt Games, 2023).** [Wikipedia](https://en.wikipedia.org/wiki/Dredge_(video_game)) (read)
- **Fight.** Quick-time minigames that differ by equipment. The devs "introduced multiple mini-game variations after playtesters found early versions repetitive." Some critics still found fishing "dull and repetitive".
- **Day and night.** These change the mood and the catch. **Aberrations** (mutated variants) sell for more.
- **Cargo.** A Tetris-style grid that makes loading the catch a small puzzle.
- **Takeaways:** (1) vary the fight by fish type, or it gets stale; (2) night changes the feel as much as the fish list.

**Cast n Chill (Wombat Brawler, 2025).** [Wikipedia](https://en.wikipedia.org/wiki/Cast_n_Chill) (read)
- **Fight.** You "balance fighting the fish with reeling it in; attempting to reel too quickly may result in snapping the fishing line". This is the classic **tension** fight.
- **Progression.** A logbook with **personal records**, selling to a shopkeeper (Rusty), and rods, bait, boats and licences.
- **Art and controls.** Parallax pixel art and an **idle mode**. Reviews praised "simple controls" and accessibility.
- **Takeaway:** tension (hold, but not too hard) is simple to learn. Personal records give cheap long-term goals.

**Webfishing (lamedeveloper, 2024).** [Wikipedia](https://en.wikipedia.org/wiki/Webfishing) (read)
- **Fight.** "Hold down the left mouse button to reel in a catch, occasionally clicking when prompted."
- **Catches.** Catches vary in **size and show proportionally in the world**. You also catch trash and odd items, with quality tiers.
- **Social and reception.** A social sandbox of 1–12 players, 98 % positive on Steam, compared with Club Penguin.
- **Takeaway:** hold to reel with occasional prompts is a phone-friendly input. Funny junk catches are a cheap source of delight.

**A Short Hike (adamgryu, 2019).** [Wikipedia](https://en.wikipedia.org/wiki/A_Short_Hike) (read)
- Fishing is an optional, low-pressure activity. A journal of fish and a few NPCs ask about fish.
- "No time pressure or failure conditions".
- **Takeaway:** NPC requests ("Can you show me a big one?") give fishing a story without any grind.

**Moonstone Island (Studio Supersoft, 2023).** [Wikipedia](https://en.wikipedia.org/wiki/Moonstone_Island) (read; the article does not cover fishing)
- Fishing is a small, simple minigame inside a life sim. It is mentioned only for completeness.

### Arcade and console classics

**Ridiculous Fishing (Vlambeer, 2013).** [Wikipedia](https://en.wikipedia.org/wiki/Ridiculous_Fishing) (read)
- **The loop.** Three phases on a phone: tilt to *avoid* fish on the way down, tilt to *collect* them on the way up, then "tap the screen to shoot the fish out of the sky".
- **Collection.** The Fish-o-pedia gives hints.
- **Reception.** Apple Design Award, Metacritic 91.
- **Takeaway:** phone-native inputs (tilt and tap) and a **post-catch flourish** (fish flung into the air) make the catch itself a celebration.

**Sea of Thieves (Rare).** [Official wiki: Fishing](https://seaofthieves.wiki.gg/wiki/Fishing) (read)
- **Fight.** The fish "attempt to flee, the rod must be aimed in the direction opposite to the direction that the fish is moving." Reel only when it stops struggling. A splintering-wood sound warns that the line is near snapping.
- **Bait and variety.** Bait types (worms, grubs, leeches) favour certain fish. Five colour variants per fish, plus trophy sizes.
- **Takeaway:** **counter-steer left and right** is readable, physical and works with a single drag. The audio warning before failure is an excellent cue.

**Zelda: Link's Awakening and Ocarina of Time fishing ponds.** [Wikipedia: Ocarina of Time](https://en.wikipedia.org/wiki/The_Legend_of_Zelda:_Ocarina_of_Time) (read; the dev note only) · [Zelda Wiki: Fishing Pond](https://zeldawiki.wiki/wiki/Fishing_Pond) (ref)
- **Origin.** The pond began as a developer's "secret programming project". Morita loved fishing.
- **Ocarina's pond.** Fish visibly approach the lure. You twitch the lure to attract them, then reel with tension. The pond has a **record board by weight** and the legendary **Hylian Loach**. Time and weather change which fish appear.
- **Takeaways:** (1) a **record board** ("biggest ever") is a strong, cheap goal; (2) a single named, elusive legendary fish becomes playground folklore.

**Persona 4/5 and the Yakuza series.** [Megami Tensei Wiki: Fishing](https://megamitensei.fandom.com/wiki/Fishing) (ref) · [Yakuza Wiki: Fishing](https://yakuza.fandom.com/wiki/Fishing) (ref)
- **Persona 4.** The "Guardian of the Lake" is a story-legendary fish, and bait is earned from other activities.
- **Yakuza.** A tension gauge: reel while the gauge is safe, ease off when it is in the red.
- **Takeaway:** in a game about something else, fishing works best as **short sessions with a clear goal fish**.

### Mobile hits (tension-bar fighting games)

**Fishing Clash (Ten Square Games), Fishing Strike (Netmarble), Ace Fishing: Wild Catch (Com2uS).** References: [Fishing Clash on Google Play](https://play.google.com/store/apps/details?id=com.tensquaregames.letsfish2) (ref) · [Com2uS (Ace Fishing developer), Wikipedia](https://en.wikipedia.org/wiki/Com2uS) (ref)

These share the same core fight:
- **Input:** **hold to reel, release when the tension bar hits red**, with a swipe or tap to counter jumps and runs.
- **Juice:** a big **3D fish leap** out of the water mid-fight, sometimes with a slow-motion beat, then a full-screen **catch card** showing size and weight, a rarity star burst and a "NEW RECORD" stamp.

They also add tournaments, gear upgrades and legendary events. Their monetisation (energy timers, gear gacha, loot boxes) is **not** suitable for us and should not be copied. The *presentation*, though, is the genre standard that kids will recognise.

**Hooked Inc: Fisher Tycoon (Kolibri Games)** ([Kolibri Games, Wikipedia](https://en.wikipedia.org/wiki/Kolibri_Games), ref) is an idle tycoon game. **Fishing Planet** ([Steam](https://store.steampowered.com/app/380600/Fishing_Planet/), ref) is a realism simulator with drag settings, lures, weather and time of day. Both are out of scope for kids aged 7–12, but they confirm that weather and time are expected in the genre.

**General genre note.** [Wikipedia: Fishing video game](https://en.wikipedia.org/wiki/Fishing_video_game) (read)
- The core is: choose bait or a lure, cast, respond to "on-screen signals" for the hookset, then reel.
- Scores are often based on **weight**, with **trophy** bonuses.

### The patterns that recur

1. **The telegraph is multi-sensory:** a shadow or fin, nibbles, a distinct bite sound, a stronger haptic and a big visual cue. The reaction input is a single button.
2. **The fight is a small skill toy with a gentle failure:**
   - a held tension bar (most mobile games, Cast n Chill, Yakuza);
   - a bar to keep in place (Stardew);
   - left/right counter-steering (Sea of Thieves);
   - and the best ones warn before failing (Sea of Thieves' creak).
3. **The catch is a moment:** a leap or hold-up, a pun, a card, a "NEW" or "RECORD" stamp.
4. **Reasons to return:** time of day, weather, seasons, rotating events and one named legendary fish per place.
5. **Goals:** a complete-the-book reward, records and trophies, NPC requests, timed derbies.
6. **Variety in the fight by fish type**, or it goes stale (Dredge's lesson).

---

## 3. Recommendations for Futbol Island

Key: **Impact** F = fun, L = learning. **Effort** S = under a day, M = 1–3 days, L = about a week or more. **Heat** is the extra cost on a phone while fishing.

### A. Quick wins (S, low heat, no economy impact)

**A1. A sharper bite telegraph: a "!" pop, a stronger haptic that scales with size, a nibble tick.**
- **What:**
  - On the bite, a bold "!" (a shape, not only a colour) pops over the float for the window.
  - Haptics follow Animal Crossing: a 6 ms tick on each nibble, a 14–30 ms pulse on the bite scaled by the shadow size, and nothing with reduced motion.
- **Impact:** F high. This is the biggest clarity gain for 7-year-olds.
- **Effort:** S.
- **Heat:** low. The "!" is one more instance kind in the overlay's existing instanced draw; there are no new draws.
- **Files:** `fishingOverlay.ts` (new KIND), `fishingVisuals.ts` (show it during `bite`), `fishingStore.ts` (`HAPTIC.tick`, size-scaled `plunge`), `fishingSession.ts` (pass the shadow size to the cue).

**A2. Silhouette cues on the shadow, as in Animal Crossing.**
- **What:**
  - Sharks break the surface with a **dorsal fin** and a little V-wake during the approach.
  - Rays read as wide diamonds, eels as long thin S-shapes, and crabs and shellfish as small round blobs.
  - The Fishbook's "Not caught yet" card already shows the shadow size; add the shape word ("finned", "wide", "long").
- **Impact:** F and L ("read the play"). Kids learn to predict the fish.
- **Effort:** S–M.
- **Heat:** low. The fin is one small mesh parented to the existing shadow. The wake is a V-ring in the overlay draw, and the shape comes from the existing silhouette shader.
- **Files:** `fishingVisuals.ts` (shadow), `fishingOverlay.ts` (wake kind), `fishCatalog.ts` (`group` already exists: shark, ray, eel…), `Fishbook.tsx`.

**A3. A first-catch tutorial with a "ghost hand".**
- **What:** on the first ever session, show these steps one at a time:
  1. A dotted hand drags across the water to aim.
  2. "Watch the shadow".
  3. "Wait… wait…" during the nibbles.
  4. "NOW!" on the bite.
  5. The reel steps.

  It runs once, is stored in the Fishbook save (`tutorialDone`), and stays replayable from the Fishbook.
- **Impact:** F high for new or young players.
- **Effort:** S.
- **Heat:** low (DOM, one-shot CSS).
- **Files:** `FishingHost.tsx` and css, `fishingCore.ts` (Fishbook schema plus `sanitizeFishbook`), `fishingSession.ts`.

**A4. A "NEW!" or "BIGGEST!" stamp and a size ruler on the catch label.**
- **What:**
  - `CatchView.isNew` and `isBiggest` already exist; give them a stamp animation.
  - Add a tiny ruler graphic: "62 cm — as long as a football boot × 2". The comparison uses football objects:
    - a ball is 22 cm across;
    - a boot is about 28 cm;
    - a goal is 7.32 m wide.
- **Impact:** F, and L (measurement and football dimensions).
- **Effort:** S.
- **Heat:** low (DOM).
- **Files:** `FishingHost.tsx` and css, a small `sizeCompare()` helper in `fishCatalog.ts`.
- **Economy:** none, because size never sets the price.

**A5. A warning before an escape, like Sea of Thieves' creak.**
- **What:** before the 8 s idle escape, the line twangs at 5 s and the hint says "It's getting away, keep reeling!".
- **Impact:** F (a fairer feel).
- **Effort:** S.
- **Heat:** none.
- **Files:** `fishingCore.ts` (a `warn` event), `fishingSession.ts`, `fishingStore.ts` (reuse an existing cue).

**A6. Colour-blind-safe rarity.**
- **What:** rarity is shown by a word and an icon (1–4 stars or shells) as well as colour, on the label, the Fishbook and Rosa's stand.
- **Impact:** accessibility.
- **Effort:** S.
- **Heat:** none.
- **Files:** `FishingHost.tsx`, `Fishbook.tsx`, `MarketStand.tsx`, `RARITY_LABEL`.

### B. Next sprint (M)

**B1. The new fight: a tension reel (hold and release) with left/right runs. This is the headline change.**
*(Built 15 Oct 2026 and reworked the same day, user decision: the hold-and-swipe input below became a Pokémon GO-style SPIN REEL — a big centred reel the finger circles, its spin rate scaling the winding and tension; a run means "stop spinning and let it tire", with no counter-steer. The derby, photo mode, the record boards and the weather from §C were removed as "too complicated". Current state: docs/fishing.md "The feel of fishing".)*
- **How it plays:**
  - After the hook, a curved **tension arc** sits around the Reel button (green, then yellow, then red).
  - **Hold** Reel to wind in: progress fills and tension rises.
  - **Let go** and the tension falls while the fish takes a little line.
  - Big fish make **runs**: the shadow darts left or right, and the HUD shows a big arrow.
  - **Drag or swipe the opposite way** (or tilt, if allowed) to turn the fish. Holding the counter keeps the tension in check during the run.
  - Commons need about 2 s of holding with no runs; legendary fish need 3–4 runs.
- **Kid-fair failure, so nothing is ever lost:**
  - The line **never snaps**. Too much tension makes the fish "slip": progress drops back one notch, with a twang and a shake of the rod.
  - Only the existing long idle escape can lose the fish, and it is the same gentle "another fish will come".
  - The phrase "snap" is kept out of the copy.
- **Fight personalities** (Stardew and Dredge's lesson against staleness):
  - crabs and shellfish: steady pullers, no runs;
  - mackerel and sardines: zippy, small fast runs;
  - sharks: long, strong runs;
  - rays: hug the bottom (tension spikes at the end);
  - billfish: leap (see C2).

  This is data in `fishCatalog.ts` (`fight: 'steady'|'zippy'|'runner'|'diver'|'leaper'`).
- **One-tap mode stays.** The current tap-to-reel stays as **Easy reel** (a setting, and automatically on with `easy`). It is an accessibility path, not a removal.
- **Football tie-in** (light, in `KEEPER_LESSONS` style):
  - *Weight of the pass*: "Too hard and the pass runs out; too soft and it's cut out. Reel with the right weight."
  - Runs, *jockeying*: "Show it the other way, like a defender showing a winger onto their weaker side."

  These would replace or extend the "Hold on like a keeper" line, which already exists.
- **Impact:** F very high. It turns the fight into a skill with decisions. L medium.
- **Effort:** M.
  - The core state machine: `reeling` becomes continuous `progress` and `tension` instead of whole taps.
  - The HUD arc.
  - The swipe input.
  - Tests in `tests/fishing.cjs` for kid-fairness: never below 0, no loss from tension, commons with no runs.
- **Heat:** low if done right.
  - The tension value changes every frame, but **React must not re-render per frame** (the current rule).
  - The world writes `--tension` and `--progress` CSS variables directly on the HUD element through a ref, at most at the rendered frame rate, and only while reeling. CSS draws the arc as a conic-gradient on one element, so there is no canvas.
  - The rod bend already follows `tension` (`fishingVisuals.ts` `bend`). The shadow's run is the existing shadow transform.
- **Files:**
  - `fishingCore.ts`: `stepSession` `reeling`, `tapSession`, a new `holdSession(on)` and `steerSession(dir)`, and `REEL_*` constants turned into fight profiles;
  - `fishingSession.ts`: commands, and a `tension` getter so the HUD does not have to re-render;
  - `FishingHost.tsx` and css: pointerdown/up hold, horizontal drag, keyboard ←/→ plus Space hold;
  - `fishingVisuals.ts`: the rod bend from tension, line colour and thickness;
  - `fishingWorld.ts`;
  - `fishCatalog.ts` (`fight`);
  - `tests/fishing.cjs`.
- **Economy:** no effect on value per catch. Watch the time per catch: if the new fight is faster than tapping, coins per minute rise. Tune the hold durations so the mean catch takes ≥ the current time, and re-run `scripts/economy-sim.cjs` and `tests/economy.cjs` §3.

**B2. The catch reveal: fish leap, splash, a short "freeze-frame" and a catch card.**
- **What:**
  - On the hook-out, the fish **leaps** out in a short arc (0.6 s) with a big splash ring and drops; the size of the leap scales with the fish.
  - At the apex comes a 150 ms **hold**: only the fish's animation time slows, not the island loop, so the frame cap stays the same. A white radial flash plays as one-shot CSS on the HUD.
  - The fish lands in the angler's hands (the existing hold-up), and a **catch card** slides up:
    - the FishArt picture;
    - the name;
    - a rarity star row;
    - the size with its football comparison (A4);
    - the "NEW" or "RECORD" stamp;
    - the club fact.
  - Legendary fish get a gold card edge and the fanfare cue.
- **Impact:** F very high. This is the moment kids screenshot and tell friends about.
- **Effort:** M.
- **Heat:** low to medium. The leap reuses the held-fish mesh on a parabola, and the splash reuses overlay kinds. There are no new draws and no post-processing; the "slow-mo" is only a time scale on one object. The card is DOM. With reduced motion there is no leap and no flash.
- **Files:** `fishingVisuals.ts` (the leap path, before `holdUp`), `fishingOverlay.ts` (a big splash preset), `FishingHost.tsx` and css (the card replaces or extends the floating label), `FishArt.tsx`.

**B3. Night fish, and the night-water look.**
- **What:**
  - The island already has a **Day, Sunset and Night** setting (`IslandSettings.tsx` → `TimeOfDay`).
  - At night, each main spot gains 1–2 night-only specials, for example a lanternfish-style glow fish at the shore or a squid near the jetty lights. Some day fish rest.
  - We use the player's chosen time rather than the real clock, so kids who only play after school can still find them. The Fishbook says "Comes out at night".
  - **The night water look:**
    - a moon glint path (a uniform-driven highlight in `shoreWater.ts`, using the existing sparkle code);
    - a faint glow on the float (emissive, a uniform);
    - bioluminescent sparkle in the wake of the float and the fish.
- **Impact:** F high (a reason to try again). L via the facts of new species.
- **Effort:** M.
  - The species research is the slow part: each new fish needs a verified club fact under the polite-fetch rules.
  - Some existing deep-sea species (lanternfish, squid, anglerfish) could become "also at night at shore spot X" with no new research.
- **Heat:** low. The night look is uniforms on existing shaders, and the glow is ALU only. Gate the bioluminescent sparkle with `fishingLife` (tiers 0–1).
- **Files:** `fishCatalog.ts` (`when?: 'day'|'night'|'any'`, applied in `rollCatch` weights), `fishingCore.ts` (`rollCatch` takes `timeOfDay`), `fishingWorld.ts` (read the current mode), `shoreWater.ts` and `underwater.ts` (night uniforms), `Fishbook.tsx`.
- **Economy:** price night-only species inside the existing rarity bands, so the mean catch at a spot does not move. Rebalance their weights so each spot's EV per catch stays within the current 3.75–4.26 band, and assert this in `tests/fishing.cjs` as for the causeway spots.

**B4. Fishing requests (quests) from islanders.**
- **What:**
  - Rosa, a harbourmaster or a coach asks for something specific, A Short Hike style:
    - "Bring me a *huge* shadow from Harbour Wall";
    - "Catch 3 different crabs at North Beach Rocks";
    - "Land a fish on a hotspot".
  - Each request finishes with a short football link ("Coaches scout like you read the water…").
  - Three requests are active at a time and rotate daily, shown in the Fishbook.
- **Impact:** F high (goals). L medium.
- **Effort:** M.
- **Heat:** none.
- **Files:** a new `lib/town/fishing/fishingRequests.ts` (pure), `Fishbook.tsx` (a requests tab), `fishingStore.ts` (persisted), and a hook in `landFish`.
- **Economy flag:**
  - Rewards must **not** be extra coins outside the meter.
  - Prefer cosmetic rewards (float skins, rod colours, an angler hat) or a Fishbook sticker.
  - If coins are wanted, pay them through `islandJobWallet.credit` so they count against the **Training meter**, and keep them small (≤ 1 job's pay). Never pay them as learning coins, which are never metered.

**B5. Size records and a record board.**
- **What:**
  - We already store `biggest` per species. Add a **Record Board** at each post: the 3 biggest catches at this spot, shown on the existing notice-board mesh as a DOM overlay when it is tapped, or in the Fishbook.
  - "Personal best!" also appears on the catch card.
- **Impact:** F (Ocarina's weight board, Cast n Chill's records).
- **Effort:** S–M.
- **Heat:** none.
- **Files:** `fishingCore.ts` (Fishbook: `bestBySpot`), `Fishbook.tsx`, `FishingHost.tsx`.
- **Economy:** none.

**B6. Water and graphics polish, all cheap:**
- **Line tension visual:**
  - the line colour lerps from white to warm red, and its thickness, with tension (one uniform or material colour per frame while reeling);
  - the existing sag easing does the rest;
  - add a small "thrum" (high-frequency line vibration) during runs.
- **Rod bend:**
  - it already exists; give it more range and a spring overshoot on a slip;
  - the CPU rewrite already runs only when the bend changes, which is fine at about 40 vertices.
- **Run wake:**
  - during a run, the shadow drags a V-wake and a spray burst at the surface;
  - these are overlay kinds in the same instanced draw.
- **Underwater light shafts at shore spots** (the boats already have them): two soft additive quads with a scrolling noise mask, gated to tiers 0–1. Mark this **medium** heat because of the additive overdraw near the camera, and keep the quads small.
- **Impact:** F medium.
- **Effort:** S each.
- **Heat:** low (the shafts are medium).
- **Files:** `fishingVisuals.ts`, `fishingOverlay.ts`, `underwater.ts`.

### C. Bigger features (L)

**C1. One named legendary fish per spot, with a story ("Island Legends").**
- **What:**
  - Each main spot has one named giant: Stardew's legendary fish, the Hylian Loach, Persona's Guardian. Examples: "Old Captain", the Harbour Wall grouper, or "The Keeper", a huge wobbegong at West Cove that "never lets anything past".
  - It appears only at a certain time, or on a hotspot after the Fishbook's spot section is complete, as a gentle gate.
  - **Clues:** the board shows a story note, and Rosa gossips.
  - **The fight:** 3 runs plus a leap, using the B1 profile "legend". On a slip it doesn't escape; it "rests", and you continue.
  - **The ending:** catch it once to fill the gold Fishbook page, then **release** it back to the sea. The release animation teaches respect for wildlife, and it is a catch-and-release lesson.
- **Football tie-in:** each legend's note pairs with a real "legend" story at the level of the club facts (for example a famous keeper's record). Each fact needs verification.
- **Impact:** F very high (folklore, a long-term goal). L medium.
- **Effort:** L (design, art variants, verified facts, the fight profile, story copy).
- **Heat:** low. The legend reuses the species' 3D model scaled up, with a tint uniform and a rim glow: no new draws, and the model is instanced like other fish.
- **Files:** `fishCatalog.ts` (a `legend` flag), `fishSpecials.ts`, `fishingCore.ts` (spawn gate, fight profile), `fishModels.ts` (scale and tint), `Fishbook.tsx` (a gold page), `FishingHost.tsx`.
- **Economy:** **safe by design.** Legends are **not sellable** (released after the catch), so there is zero coin impact. If the user wants them sellable, price them at the existing legendary cap (18 × 0.8) and limit each to once ever.

**C2. Fishing Derby: a timed 3-minute event with a personal best.**
- **What:**
  - An Animal Crossing Tourney-style mode at one post, available on certain days (for example weekends, or "Derby Day" after a real matchday in the app's match calendar).
  - Catch as many as you can in 3 minutes. Score by **points per fish plus variety**, not by weight, so small kids aren't beaten by luck.
  - Compete against **your own best and a friendly NPC** (Rosa's nephew); there are no online leaderboards.
  - Trophies come at cumulative points, as in Animal Crossing.
- **Football tie-in:** a 3-minute "stoppage time" framing, with a scoreboard styled as a match clock.
- **Impact:** F high (bursty fun, a reason to return).
- **Effort:** M–L.
- **Heat:** medium. It is continuous active play for 3 minutes, but no different from normal fishing; keep it at the same frame cap.
- **Files:** a new `fishingDerby.ts` (pure), `fishingSession.ts` (a derby clock), `FishingHost.tsx` (scoreboard), `Fishbook.tsx` (trophies).
- **Economy flag:** a derby makes many catches quickly. Make **derby catches go to a "derby cooler"** that pays nothing extra; fish still sell through Rosa's ladder, allowance and meter as normal. Do **not** copy C.J.'s 1.5× price. Rewards are trophies and cosmetics.

**C3. Football-themed lures (bait).**
- **What:** 3–4 lures named after real football techniques. Each **changes which kinds of animal come**, not how rare they are. Each lure card carries a short real fact. Examples:
  - **"Panenka" chip lure:** a slow, floaty lure that calm fish (rays, seahorses) like. Fact: Antonín Panenka's chipped penalty, Euro 1976 final.
  - **"Knuckleball" wobble lure:** an erratic lure that predators (sharks, barracuda) chase. Fact: free kicks with no spin "wobble" in the air.
  - **"Rabona" twist lure:** crabs and bottom-dwellers.
  - **"Nutmeg" tiny lure:** small and shy fish.

  How to get them: beachcombing finds (an existing system), request rewards (B4), or a cheap coin sink at the tackle chest. The coin sink suits the rebalance, which wants spending.
- **Impact:** F (choice and strategy), L high (technique names with real history).
- **Effort:** L. Data and UI are easy; verifying the facts and tuning the balance takes the time.
- **Heat:** none, beyond a different lure mesh tint.
- **Files:** `fishCatalog.ts` (lure definitions), `fishingOdds.ts` (group reweighting), `fishingCore.ts` (`rollCatch` takes a lure), `FishingHost.tsx` (lure picker), `fishingStore.ts` (inventory), and the economy and market files if lures are sold.
- **Economy flag (important):**
  - Lures must be **EV-neutral**: they reweight **groups within a rarity**, never raise rarity.
  - If any lure ever boosts rarity, it must multiply under the **existing `BOOST_CAP = 2`** together with the boat and hotspot boosts, not on top of it.
  - Add an assertion in `tests/economy.cjs` that the mean catch value per spot with each lure is within ±3 % of no lure.

**C4. Weather: drizzle and calm days.**
- **What:**
  - Light rain on some sessions. It is decided per real day, so it is the same all day, and it can be turned off in Settings.
  - Rain fish are slightly different (Animal Crossing's rain-only fish). "Fish bite better in the rain" is shown as a hint, never as odds.
- **The rain look:**
  - rain ripples drawn **procedurally in the water shader** (a hashed ring grid, ALU only, no particles);
  - a slightly greyer sky tint (uniforms);
  - a few streaks as one instanced quad draw, on tiers 0–1 only.
- **Impact:** F medium.
- **Effort:** L. There is no weather system in the island today; it would need sky, lighting and audio, beyond fishing.
- **Heat:** medium. Most of the cost is the streak draw and its overdraw. Rain ripples in the shader are cheap. Gate all of it by heat tier, and have a "still" path.
- **Files:** a new `lib/graphics/weather.ts`, `islandLighting.ts`, `shoreWater.ts`, `underwater.ts`, `fishCatalog.ts`.

**C5. Fishbook completion rewards, a trophy wall in the museum, and the Golden Rod.**
- **What:**
  - Completing a spot's section gives a float skin.
  - Completing all fish gives a **Golden Rod** (cosmetic, plus a slightly wider bite window, which is a fairness perk, not money). This follows Animal Crossing's Golden Rod.
  - The island **museum** (`museumBounds` in `world.ts`) gets a fish wall that shows models of species you've caught. A "C.J. model" equivalent can be a display slot you choose to fill.
- **Impact:** F high (long-term goals).
- **Effort:** L.
- **Heat:** medium in the museum only. Use **one InstancedMesh per shared fish geometry family** from `fishModels.ts`, built only while the museum interior is visible; there is nothing on the open island.
- **Files:** `Fishbook.tsx`, `fishingStore.ts`, the museum scene, `fishModels.ts`, costume and cosmetic systems.
- **Economy:** cosmetic only, so none.

**C6. Photo mode (optional).**
- **What:** on the catch card, a "Photo" button freezes the shot and hides the HUD. The kid can tilt the camera a little and save a PNG to the device. There is **no sharing and no upload**, for kid safety.
- **Effort:** M.
- **Heat:** low (one `toBlob` on demand).
- **Files:** `FishingHost.tsx`, `fishingCamera.ts`.
- **Priority:** low.

### Camera work during the fight (applies to B1 and B2)
- **During reeling:** a slow 5–8 % push-in toward the float. On a run, a tiny lateral drift toward the run side, using `fishingCamera.ts` `nudge`.
- **On a slip:** a 120 ms shake, about 2 cm.
- **On the leap:** the camera tilts up slightly to keep the fish in frame.
- **Reduced motion:** none of this.
- **Heat:** low. Focus mode keeps the background frozen. The camera moving does not un-freeze the systems; shadows already refresh at half rate while focused. There are no extra passes.
- **Files:** `fishingCamera.ts`, `fishingWorld.ts`.

### Accessibility checklist (attach to B1 and B2)
- **Easy reel** (the current tap-to-reel), which is automatic in easy mode.
- **One-button mode:** the swipe counter during runs is replaced by "hold during the run".
- **Haptics** follow the existing reduced-motion rule. Add a **Haptics on/off** setting.
- **Colour-blind cues** (A6). The tension arc uses **pattern and position**, not only red and green: a notch marks the danger zone.
- **Reduced motion:** no leap, no camera move, no flash. The card still shows.
- **Text:** keep all hints ≤ 1 line, as now.

### Things we should NOT copy
- **Line snapping and losing the fish or bait.** This breaks "nothing is ever lost".
- **Energy timers, gacha gear and loot boxes** (the mobile games).
- **Idle auto-fishing** (Cast n Chill, Webfishing's buddy). It keeps the GPU rendering in the background, which is bad for heat, and it is bad for the economy.
- **Showing weights or odds.** The kid-safety rule stands. A size in cm is fine; it is already shown.
- **Online leaderboards and sharing.** These need moderation and raise privacy problems for under-13s.
- **Selling price by size.** Keep prices fixed per species.

---

## 4. Economy guard-rails (summary)

| Feature | Risk | How to keep it balanced |
| --- | --- | --- |
| B1 tension fight | A faster fight means more coins per minute | Tune hold times so the mean catch time is ≥ today's. Re-run `scripts/economy-sim.cjs`, `tests/economy.cjs` §3. |
| B3 night fish | A higher EV at night | Price night species within the bands. Keep the per-spot EV in 3.75–4.26 and add the test. |
| B4 requests | Extra coins outside the meter | Cosmetic rewards, or small coins credited through the jobs wallet (Training meter). Never learning coins. |
| C1 legends | Very valuable fish | Released after the catch, not sellable. Otherwise capped at the legendary price, once only. |
| C2 derby | Many catches quickly; Animal Crossing's 1.5× price | No price bonus. The normal ladder, allowance and meter apply. Trophies and cosmetics only. |
| C3 lures | Rarity boost compounding | Reweight groups, not rarity. If rarity is ever boosted, it stays under `BOOST_CAP`. EV ±3 % test. Selling lures is a welcome coin sink. |
| C5 Golden Rod | None if cosmetic | The fairness perk only (bite window), no value perk. |

Rosa's diminishing returns (`MARKET.ladder` fullEach 4, then ½, then ¼) and the 30-coin allowance stay untouched by every recommendation above.

---

## 5. Heat summary

| Item | New draws | Per-frame CPU | Gate |
| --- | --- | --- | --- |
| A1 "!", A2 fin and wake, B6 wake | 0: existing overlay instancing; the fin is 1 tiny mesh | a few instance matrices while fishing | gameplay cues always; spray on tiers 0–1 |
| B1 tension arc | 0 (DOM, a CSS var) | 1–2 `style.setProperty` per rendered frame while reeling | none needed |
| B2 leap and card | 0 (reuses the held fish and overlay) | one parabola | off with reduced motion |
| B3 night look | 0 (uniforms) | none | sparkle on tiers 0–1 |
| B6 light shafts | +1 (additive) | none | tiers 0–1 only, small quads |
| C4 rain | +1 for streaks (tiers 0–1); ripples are shader ALU | none | full still path |
| C5 trophy wall | instanced per family, museum only | none outside the museum | interior only |

Validate on `scripts/check-fishing-browser.cjs` and on a real-phone run of `?heat=1` (`docs/performance-guide.md` checklist).

---

## 6. Recommended top-5 plan

1. **The new fight (B1) and the clearer bite (A1, A5).**
   - Hold-to-reel tension with left/right runs, fight personalities by fish group, slips instead of snaps, and Easy reel kept.
   - This is the biggest fun upgrade and makes every one of the 64+ species feel different.
   - Effort M, heat low.
2. **The catch-reveal moment (B2 and A4).**
   - The fish leap, a short freeze, and a catch card with the size in football units and NEW or RECORD stamps.
   - Cheap, and it is what kids remember.
   - Effort M, heat low.
3. **Silhouette cues and a ghost-hand tutorial (A2, A3, A6).**
   - Shark fins and wakes, shape words in the Fishbook, the first-catch walkthrough, and colour-blind-safe rarity.
   - Effort S–M, heat low.
4. **Night fish and the night-water look (B3), plus records (B5).**
   - A reason to come back, using the existing Day/Sunset/Night setting. EV-neutral pricing, tested.
   - Effort M, heat low.
5. **Island Legends (C1), with fishing requests (B4) as the delivery.**
   - One named, catch-and-release legendary per spot, with clue notes, plus rotating islander requests with cosmetic rewards.
   - This gives long-term goals with zero coin impact.
   - Effort L, heat low.

Later, once those land: football lures (C3, with a verified fact per lure), the Fishing Derby (C2), the museum trophy wall and the Golden Rod (C5), then weather (C4), the largest item, which needs an island-wide weather system.
