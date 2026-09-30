# Island vending machines

September 27, 2026. Local only: not committed and not deployed.

The Store is gone as a place to shop. Eight Japanese-style vending machines stand around the island. Every machine sells the
same regular stock in rows, and each one also has a **Specials** row with items sold only at that machine. Players pay with
the arcade coins they earn in the arcade. Coins are never bought with real money.

## Where they are

Five face the island camera; the pier, garden and Club Grounds machines (moved Sep 27 2026 at the user's request) sit between
buildings, against a wall or on a street corner and face their walk-up side, with the glass front still visible from the default view. Positions were checked against the live
world with `scripts/check-vending-browser.cjs`: no overlap with roads, buildings or props, a clear space to stand in front, and
reachable on foot from Island Square (the rooftop machine is reached by the garage ramp).

| Machine | Where | Colour | Specials (only here) | Lesson on the machine |
|---|---|---|---|---|
| Island Square | Next to the old Store door (89.5, −49) | Red | Black & white TV ball · All-time greats pack | The 1970 TV ball and all-time legends |
| Palm Coast Rooftop | On the rooftop futsal court (11, −7.8, roof level 6) | Teal | Futsal ball · Futsal pack | Futsal: 5-a-side, hard court, small low-bounce ball |
| Old Town Ground | Beside the 7v7 pitch (11, −48) | Green | Grassroots ball · Wingers pack | 7v7 plays a 2–3–1; fewer players, more touches |
| Club Grounds | On the street corner by the 9v9 pitch (132.8, −69.8), facing the corner | Orange | Winter hi-vis ball · Defenders pack | 9v9's 3–2–3 back three |
| Eleven Park | On the 11v11 touchline (96, 115) | Navy | Size 5 match ball · Midfield pack | Full-size ball and the 4–3–3 midfield three |
| Beach Kitchen | By the surf shop on the west beach (−60, 92) | Pink | Beach soccer ball · Strikers pack | Beach soccer: 5-a-side, barefoot, soft sand |
| Pier Cafés | Between the Pier Bakery and Coast Café (108.5, 183.6), facing the plaza | White | Laced leather ball · Goalkeepers pack | Pre-1960s laced leather balls got heavy in the rain |
| High School Rooftop | Highest central school roof (135, 8), elevation 17.23 m; walk up the east-side stairs | Purple | Panna street ball · Two eras pack | Panna street football and close control |

What the specials teach (shown on the item):

- **Black & white TV ball**: the 1970 World Cup ball had 32 black and white panels so it showed up on black-and-white TV.
- **Futsal ball**: size 4, low bounce, so it stays on the court and rewards sole-of-the-foot control.
- **Grassroots ball**: small-sided games like 7v7 give every player more touches than 11v11.
- **Winter hi-vis ball**: a bright yellow ball for snow, fog and low winter light.
- **Size 5 match ball**: the full-size ball (68–70 cm around) set in the Laws of the Game.
- **Beach soccer ball**: beach soccer is 5-a-side and barefoot, so the ball is soft and slightly lighter.
- **Laced leather ball**: before the 1960s most balls were laced leather and got heavy when wet.
- **Panna street ball**: panna means a nutmeg; cage games reward close control.
- **Themed 3-card packs** draw only from cards already in the roster, filtered by role or era (futsal roles, wingers, defenders,
  midfielders, strikers, goalkeepers; the six mental-strength legends plus all-time players; one all-time great with two
  current players). Each one guarantees one card from its "legend" pool, like the existing 3-card pack.

New cosmetic items: the eight special balls only (`lib/town/specialBalls.ts`, skins in `lib/graphics/specialBallSkins.ts`).
They reuse the equipped-ball pipeline and fall back to the classic ball's trail and hit effects. No new ride models or costumes.

## Using a machine (in the world, no modal)

Sep 27 2026, at the user's request ("it should be interacting with the machine and not a modal"). The visual side is Astra's
next pass; the contract is in [vending-visuals-HANDOFF.md](vending-visuals-HANDOFF.md).

- **Hover** (desktop): the machine gets the same edge glow and rising wash as the buildings (`buildingGlow` kind `vending`),
  the scene hover sound plays once, and a **Go** prompt appears above it in the building prompt style. Walking up to the front, or
  flying close, shows the same prompt. **Tap** (phones) opens it directly, like buildings.
- **Go / click**: the camera eases (cubic in-out, 1 s in, 0.8 s out) to a straight-on view of the machine front, at the distance
  where the face fills the screen (≥93% of a 390 px portrait width; the full height of an 844×390 landscape phone; face plus the
  lit sign where the face still gets ≥380 px). The player is hidden for the second half of the move. Reduced motion jumps
  straight there. From far away (Settings, quests, `?store=` links) the camera flies over to the nearest machine.
- **The machine face is the UI.** Once the camera arrives, `VendingFace` is pinned onto the face rectangle with a CSS matrix3d
  from its four projected corners, laid out at its real on-screen size (crisp text ≥12 px, taps ≥44 px). The 3D front is painted
  from the same layout (`lib/graphics/vendingFaceLayout.ts`), so it is the same machine, just closer:
  - **Glass**: a shelf header (◀ page · row label · page ▶; tapping the label jumps to the next row) and six product slots per page
    (specials first, then packs, balls, rides, island animals). Each slot shows the item's miniature (`StorePreviews` /
    `CostumePreviews` / a mystery card back), its name and a lit push button with the price. Specials glow gold with "Only here".
  - **Press a slot** once: its button lights and the LED shows the price ("Press again, or tap the coin slot"). **Press again**
    (or the **coin slot**) to buy: coins drop into the slot with a clink, the item leaves the shelf and falls into the tray with a
    thunk. **Tap the tray** to take it: it pops out over the glass with its lesson and **Use it / Wear it**; packs reveal their
    cards (the wallet's pack flow, with the legend's mental-strength note).
  - Owned items: a second press equips them (costumes toggle on and off). Locked, sold out and not-enough-coins presses show a
    friendly LED line ("Need 5 more coins. Try an island job!") with a soft buzz. Costumes keep the full club story and quiz
    (**Read the … club story**, shown on the machine over the glass).
  - Sticker beside the tray: "n/8 found" (counted when a machine is used; no rewards attached) and "No real money".
- **HUD**: only **Leave** (top left) and the coin pill (top right); the rest of the island HUD steps aside. **Keyboard**: arrows or
  1–6 select, Enter buys (Enter again takes from the tray), PageUp/PageDown flip, Esc leaves, WASD walks away.
- The island sleeps while the machine is in use (`storeOpen` stays in Town's pause list) and card offers wait (`storeOpen` still
  blocks `CardOfferHost`).

Kid-safety rules kept: no odds or rarity numbers anywhere in the vending UI, no duplicate cards (see Packs), in-game coins
only, and no purchase prompts outside the machines.

## Economy

> **Economy pass applied 28 Sep 2026** ([ECONOMY_PROPOSAL.md](economy/ECONOMY_PROPOSAL.md)): prices below raised about 30–50%; books stay **100** (user decision). Packs: **3 a local day** across all machines
> ("This machine restocks at midnight."); a pack stays on sale while its own pool still has **one** missing card, empty slots
> are topped up with other missing cards (never a duplicate, and a pack may hold fewer cards when fewer are new), so the binder
> can always be finished; **light Icon gate**: until the tier gate opens (`tierGate(progress,'quiz').icon`, 80% of a path),
> Icon cards are left out of every slot except the guaranteed mental-strength legend (`vendingLedger.packFreshness`).

| Row | Price | Unlock rule (unchanged) |
|---|---|---|
| Card packs | 40 (3 cards) · 60 (5 cards) | none (the arcade wallet's own prices) |
| Themed special packs | 40 (3 cards) | none |
| Balls | 20 | none |
| Special balls | 35 | none |
| Scooters | 30 | finish paths (`rideUnlocks.ts`) |
| Bikes | 40 | finish paths |
| Mopeds | 50 | finish paths |
| Flight | 70 | finish paths |
| Island animals | 30 | find hidden balls (`coinQuest.ts`, 3 costumes per 10 balls) |
| Books | 100 | a finished story |

For scale: an arcade round pays 7–20 coins at most (`ARCADE_COIN_CAPS`), so a ball is about one good round, a flight pack two
or three.

Rules:

- **Free starters**: the classic ball, the first ride in each category and "no costume".
- **Locked items** show their unlock requirement ("Finish a path to unlock", "Find 20 hidden balls to unlock") and can't be
  bought. Once unlocked they cost coins.
- **No re-locking**: the first time the ledger loads it records everything the player already has: every ride they had
  unlocked, every costume they had earned, and whatever ball, rides and costume they had equipped. Those stay theirs for free.
  The ride-grant memory in `rideUnlocks.ts` is untouched.
- **Packs** are bought through the arcade wallet's own `purchaseMysteryPack`, the same flow the old pack store used. The pack
  cost is recorded in the wallet as before. The only difference is that the candidates are first filtered to cards the player
  doesn't have yet, so no pack can hand out a duplicate. When there aren't enough new cards left, the pack shows "ALL GOT"
  instead of selling a duplicate.
- **Coins for gear** are recorded in a separate ledger (`fi2-vending-v1`). The spendable balance is the arcade balance minus
  what the machines charged. Purchases take the wallet's own cross-tab lock name.

### Decisions for you

1. **Prices** above. Everything is flat per row except the specials.
2. **Balls were free before.** Existing players keep only the ball they had equipped. The others now cost 15 each. The
   alternative is to grandfather every ball for players who already had a save.
3. **Newly unlocked rides and costumes now cost coins** after the path or ball milestone unlocks them. The unlock toasts now
   say "find them in the vending machines". The alternative is to make each unlock free (a milestone reward) and charge only
   for balls, specials and packs.
4. **The Store building** still stands as scenery with its STORE / BALLS · RIDES · GEAR signs, and the Island Square machine
   stands at its door. The signs are easy to change in `lib/town/world.ts` (for example to "BOOT ROOM", with a football
   history hook), but that file is shared, so it wasn't touched. Coin-hunt clues still use "the Store" as a landmark name.
5. **Map**: the Store destination is now labelled SHOP / "Vending machine" and still takes you to the Store door, next to the
   Island Square machine. Since Sep 27 2026 every machine also has a small "V" badge (cream circle, dark-green ring and letter)
   on the corner minimap and the full travel map, at its x/z (the rooftop machine included), shown whether found or not so kids
   can hunt for them. The Island Square badge takes the SHOP pin's dot. The badges are static SVG inside the memoized map terrain
   (`components/IslandOverview.tsx`), so the minimap does no extra per-frame work.

## Store removal

- Removed: the Store "Enter" prompt, Store hover/tap highlight and entry, and the `IslandStore` dialog (`components/IslandStore.tsx`
  deleted; its CSS module stays because `PathStoryModal` uses it).
- Redirected to the nearest machine: Settings/quest "Store" actions (`openStore`), the ball-hunt "costume" button, the passport
  item links, and `?store=` / `?store=packs` URLs (including the arcade's "Visit store" button, which lands on the Island Square
  machine with the 3-card pack selected).
- Copy updated: NPC ride question, "Make it yours" quest, "Visit a vending machine" explore item, ride-unlock toast, all-balls
  lesson, coin-quest button, passport notes, community ball-hunt lesson.
- The customizer's costume menu only offers owned costumes ("At the island vending machines" for earned but not bought).
  `Town` runs every saved or changed look through `enforceVendingOwnership` after `enforceRideUnlocks`.

## Performance

- One merged mesh per machine (one draw call, one shadow caster), frustum-culled. All eight share one `MeshStandardMaterial`
  and one 512×1024 canvas atlas, used as both the colour and the emissive map, so the sign, shelves and SPECIALS strip glow
  without lights. About 280 vertices per machine.
- One hover glow for all eight, moved to the targeted machine.
- Per frame when idle: eight distance checks and, only on desktop hover, eight ray/box tests. Measured 0.39 µs per idle
  `update` and 0.03 µs per idle `applyCamera` (desktop Chrome, `scripts/check-vending-browser.cjs`). The glow updates only while a
  machine is targeted or fading; the prompt is placed only while shown; the camera blend runs only while zooming.
- Draw calls at Island Square: 197 with the machine vs 196 without (+1 colour draw).
- Using a machine puts the island to sleep like the old Store (`storeOpen` stays in the pause list). The HTML face exists only
  while a machine is in use (no extra meshes or textures at all); it is re-pinned only on awake frames (resize), so a machine in
  use costs nothing per frame. Miniatures render once per
  visit in one temporary WebGL context (gear) and use the existing costume preview cache. The only animations are one-shot (coins, drop, pop). There's no backdrop blur.
- Desktop emulation only. No iPhone thermal measurement.

## Files

- `lib/town/vendingCatalog.ts`: machines, rows, prices, specials, lessons.
- `lib/town/vendingLedger.ts` (pure rules) and `lib/town/vendingWallet.ts` (browser wiring to the arcade wallet).
- `lib/town/specialBalls.ts`, `lib/graphics/specialBallSkins.ts`: special balls.
- `lib/graphics/vendingMachines.ts`: 3D machines, hover/Go, straight-on face zoom, face corners for the HTML face.
- `components/VendingMachine.tsx` + `.module.css`: the controller (state machine, rules, placement, HUD, keyboard).
- `components/VendingFace.tsx` + `.module.css`, `lib/graphics/vendingFaceLayout.ts`: the machine face visuals and shared layout.
- Edited: `components/Town.tsx`, `lib/graphics/buildingGlow.ts` (`vending` kind), `lib/graphics/ballAppearance.ts`,
  `lib/town/customization.ts`, `components/CostumeCollection.tsx` (optional ownership gate), `components/CharacterCustomizer.tsx`,
  and the copy files listed above.
- Tests: `tests/vending-machines.cjs` (in `npm test`), `scripts/check-vending-browser.cjs`.

## For the arcade (Astra) — not changed here

- `ArcadeCoinsPanel` and `LegendPackStore` show "25% chance of two legends", which is an odds line. The vending UI doesn't
  show it.
- The wallet has no generic "spend" call, so gear spending lives in `fi2-vending-v1`. `ArcadeCoinsPanel` therefore shows the
  arcade balance *before* vending spending. A `spendCoins(id, amount, reason)` in `arcadeWalletCore` would let one balance serve
  both.
- `scripts/check-arcade-isolation-browser.cjs` expects a dialog named "The Store" after "Visit store"; there is no dialog now:
  the arcade's "Visit store" lands on the Island Square machine in the world (camera zooms in, 3-card pack selected).

## Four book machines (Sep 29 2026)

North Beach (`northbeach`, Cafu), Causeway Stop (`causeway`, Nadim), Coconut Café (`cayplaza`, Kanté) and Sharks Beach (`sharks`, Oshoala) sell the regular rows plus one pop-up book each (100 coins, item ids `display:<machine>:book`). They have no exclusive ball or pack: all eight special balls already have a machine. The three Coral Cay spots are computed from Coral Cay's anchors in `lib/town/vendingPlaces.ts`; see `docs/books-2026-09-29.md`.

## Drink machines (Sep 29 2026)

User: "Outside, add a vending machine next to the stores for different types of drinks. The drinks will show how hydration helps
the body. The drinks machine will be next to the other machines. There should only be two drink vending machines."

**Exactly two**, each standing side by side with its Konbini's vending machine: same facing, a 12 cm gap, on the side away from
the sliding doors. Placed from the neighbour's spot (`drinkSpotBeside` in `lib/town/drinkMachines.ts`), never hard-coded.

| Machine | Beside | Spot (x, z, yaw) |
|---|---|---|
| `drinksplaza` · Drinks · Island Square | `plaza` (Island Square Konbini) | 74.91, −52.16, 0 |
| `drinkscay` · Drinks · Coral Cay | `caykonbini` (from `CAY_KONBINI` via `cayVendingSpots.konbini()`) | 527.91, −177.16, 0 |

Both Konbini pairs stand **flush against the shopfront** (user, Sep 29 2026): `konbiniMachineSpot(store)` in
`lib/town/vendingPlaces.ts` puts each Konbini machine 3.2 m east of the store centre with its back 0.03 m in front of the window
ledges and pillars (0.25 m proud of the glass line), for Island Square (`ISLAND_SQUARE_KONBINI`, x 71, front −53: `plaza` now
73.1, −52.16) and Coral Cay (`CAY_KONBINI`: `caykonbini` now 526.1, −177.16). The drink machines follow their neighbour.

Look: a cool blue/white Japanese drink machine on the shared mesh and material (one draw call each). Its glass is a new atlas
panel (`drawDrinkTile`, `lib/graphics/drinkArt.ts`): icy glass, rows of bottles and cans, a lit price button under each, and the
blue つめた～い COLD / red あったか～い HOT strip (red on the warm can). The two panels use the free 256×152 strip under the third
glass row (y 872–1024), so the 1024² atlas did not grow. The close-up is the shared `VendingFace` with a drink controller
(`components/DrinkMachine.tsx`).

### Drinks and what each one teaches

Every drink is a Konbini **consumable** (the Konbini agent's STABLE API in `lib/konbini/food.ts`): repeat-purchasable, one
idempotent wallet spend per purchase id (`konbini:food:<item>:<purchase id>`), **3 machine drinks a day** in their own bucket
(`drinks`, separate from the food "tummy full" limit), the Snacks pouch, and a **"Drink machines"** group on the backpack's
Konbini Collection (first purchase of each). Buying opens the Konbini's layered reveal (`KonbiniReveal`) built bottle → label
wrap → cap → condensation sparkle, with the drink's hydration line and its sources.

| Machine | Drink | Japanese | Coins | Hydration line | Sources |
|---|---|---|---|---|---|
| Island Square | Water | 水 (みず) | 3 | Water keeps your blood flowing and your body cool. Drink before, during and after you play. | SDA, AAP |
| | Green tea | 緑茶 (りょくちゃ) | 3 | Sip before you feel thirsty. Pack a full bottle in your kit bag and top it up at every break. | AAP, SDA |
| | Barley tea | 麦茶 (むぎちゃ) | 3 | When you don't drink enough, running feels harder and it gets tough to concentrate. Keep sipping. | SDA, NHS (dehydration) |
| | Milk | 牛乳 (ぎゅうにゅう) | 4 | Water and milk are the best drinks for kids. After a game, milk gives you fluid plus protein for your muscles. | NHS, AAP, FIFA |
| | Sports drink | スポーツドリンク | 5 | Sports drinks are for long, hot, hard sessions over an hour. For everyday training, water is all you need. | AAP, SDA |
| | Hot cocoa (warm row) | ホットココア | 5 | Cocoa is milk with added sugar: a warm treat on a cold day. Plain milk and water are the everyday drinks. | AAP, NHS |
| Coral Cay | Coconut water | ココナッツウォーター | 5 | Coconut water has potassium, a mineral your body uses. Still, plain water is the best way to hydrate every day. | Cleveland Clinic, AAP |
| | Water | 水 (みず) | 3 | Check your pee: pale yellow means you're well hydrated. Dark yellow means drink some water. | NHS, AAP |
| | Sports drink | スポーツドリンク | 5 | Sweat takes water and a little salt out of your body. On a hot day of play over an hour, a sports drink plus water can help. | AAP, SDA |
| | Pineapple juice | パイナップルジュース | 4 | Juice is sweet and sugary. Keep it to one small glass a day with a meal, and make water your main drink. | NHS, AAP |
| | Lemon water | レモン水 (れもんすい) | 4 | Sweating cools you down, so drink to replace that water. A slice of lemon adds flavour without sugar. | SDA, NHS, AAP |
| | Yoghurt soda | ヨーグルトソーダ | 6 | Fizzy sweet drinks are a sometimes treat: the sugar is hard on your teeth. Water is what refills you after play. | NHS, SDA |

Sources (checked 29 Sep 2026; wording kept to what they say, no medical or weight claims, generic names and art only):

- NHS, Water, drinks and hydration: https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/water-drinks-nutrition/
  (pee a clear pale yellow; best drinks for children are water and milk; juice max one small 150 ml glass a day with a meal;
  water is the best way to replace fluid lost to sweat; add a slice of lemon or lime; sugary drinks can damage teeth).
- NHS, Dehydration: https://www.nhs.uk/conditions/dehydration/ (dark yellow pee, feeling tired).
- American Academy of Pediatrics, HealthyChildren.org, Choose Water for Healthy Hydration:
  https://www.healthychildren.org/English/healthy-living/nutrition/Pages/Choose-Water-for-Healthy-Hydration.aspx (water and milk
  are all the drinks kids need; drink water before, during and after practices or games; drink before thirsty; limit sports
  drinks, juice and flavoured milk with added sugar; urine very light yellow; infuse water with lemon).
- Sports Dietitians Australia, Hydration in Junior Sport: https://www.sportsdietitians.com.au/factsheets/children/hydration-junior-sport/
  (water maintains blood volume and regulates body temperature; dehydration makes activity feel harder and brings mental fatigue
  that affects concentration; water keeps the body cool and replaces sweat; sports drinks aren't a healthy everyday choice for
  kids; sweat loses fluid and salt; pack a water bottle). The live SDA site now redirects old factsheet URLs; the text was read
  from the Internet Archive copy.
- FIFA, Nutrition for Football: https://digitalhub.fifa.com/m/16e433eb11621446/original/ukbqfkkxw2o8s1gyjria-pdf.pdf (milk as
  an everyday protein food; dark urine as a sign to drink more).
- Cleveland Clinic, The health benefits of coconut water:
  https://health.clevelandclinic.org/the-health-benefits-of-coconut-water (potassium and other electrolytes; "Water is still the
  best way to hydrate").

The Australian Institute of Sport hydration page (Performance Nutrition HQ) is a JavaScript app that could not be read from here,
so it is not cited.

### Economy and heat

Prices 3–6 coins; 50 coins buys all twelve (23 at Island Square, 27 at Coral Cay), less than one casual day's income (~81). The
3-a-day limit makes the full "Drink machines" set take at least 4 play days, and about 1–2 weeks for a casual player who doesn't
reach Coral Cay every day. No collection reward (no new coin source). See
`docs/economy/ECONOMY_UPDATE_2026-09-29.md` §"Drink machines" and `tests/economy.cjs` §6.

Heat: two more merged meshes on the shared material (one draw call each, measured +2 draws in view at Island Square), no new
texture, loop or light. The idle controller update is the same distance check per machine (15 now). The drink face is mounted only
while the machine is in use (the island sleeps). The reveal's rAF runs only while the four layers build (~1.5 s), then stops.

Files: `lib/town/drinkMachines.ts` (data, placement, Konbini registration), `lib/town/drinkShop.ts` (browser adapter to
`lib/konbini/foodStore.ts`), `lib/graphics/drinkArt.ts`, `components/DrinkMachine.tsx` + `.module.css`, `components/DrinkArt.tsx`;
small edits to `lib/town/vendingCatalog.ts` (id type, the two machines appended, `nearestVendingMachine` skips drink machines),
`lib/graphics/vendingMachines.ts` (drink glass panel) and `components/Town.tsx` (opens `DrinkMachine` for drink ids). Tests:
`tests/drink-machines.cjs`, `tests/vending-machines.cjs` (15 machines, 2b placement).


> **Sep 29 2026 (later):** both Konbini pairs shifted 1.1 m west (`KONBINI_MACHINE_EAST` 3.2 → 2.1) so the snack and drinks machines sit inside the 10 m shopfront, flush against the glass, instead of the drinks machine overhanging the east corner.
