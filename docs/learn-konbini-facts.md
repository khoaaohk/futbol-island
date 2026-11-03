# Konbini, eating and fuel: the facts behind the /learn "Fuel up" chapter (Nov 3 2026)

What the game does today, read from the code. The /learn copy may only claim what is listed here.

## Fuel (the "energy")
- Fuel is a 0-100 number with a gold lightning bolt in the island coins bar, beside coins, fish and fruit (`components/FuelCount.tsx`).
  Tapping the bar opens the island pocket, whose Fuel card shows the number, a fill meter and Eat buttons (`components/IslandBalanceDrawer.tsx` ~l.65-69).
- Only optional fast travel uses fuel: flying most, then moped, bike, scooter, then a Shift sprint; walking uses almost none and
  always works, even at 0 (`lib/town/fuel.ts` FUEL_RATE, canUse, FUEL_COPY.cost). At 0 the jetpack, rides and sprint rest until
  the player eats or drinks; walking carries on.
- Learning never costs fuel (`activityCost()` = 0). No offline drain, no timers. Each new local day starts full ("breakfast", FUEL_NEW_DAY = 100).
- There is no separate stamina or sprint-speed boost from food: eating only refills this fuel number (`lib/konbini/food.ts` header: "No gameplay perk").

## What eating does
- Eating or drinking a Konbini item adds fuel by nutrition group (`lib/town/fuel.ts` FUEL_BY_GROUP): balanced meal 100, carb 50,
  protein 30, drink (hydration) 25, sweet treat 15; bentos 100, yaki imo 55, sports drink 30 (FUEL_BY_ITEM). Capped at 100.
- Pocket fruit and veg from the free Community Garden also refuel (PRODUCE_FUEL, e.g. banana 30, orange 25).
- Every path that ends in "eaten" (Eat now in the shop, a full pouch, eating from the Snacks pouch, the drink machines) adds fuel
  once and appends "+N fuel." to the nutrition note (`lib/konbini/foodStore.ts` l.44-54). The shop shows "Yum! <note> +N fuel."
  (`components/KonbiniRoom.tsx` finishEat).

## Buying
- Two Konbinis (Island Square, Coral Cay), each with its own menu: musubi, onigiri, sandos, hot counter, bentos, sweets, drinks
  (`lib/konbini/food.ts` FOOD_MENU). Prices 3-11 coins, earned in the game.
- After paying, a reveal offers Eat now or the Snacks pouch (holds 3, POUCH_SIZE), eaten later from the backpack.
- Daily "tummy full" limit: 3 Konbini foods a day (FOOD_PER_DAY); then "You're fuelled up for today!" (FUELLED_UP). Drink
  machines have their own 3 a day (`lib/town/drinkMachines.ts` DRINKS_PER_DAY).
- First purchase of each item joins the Konbini Collection.

## Nutrition notes (shown when a food is revealed or eaten; `lib/konbini/food.ts` FOOD_NOTES)
- carb: rice is a carbohydrate, football's main fuel; a rice snack an hour or two before training gives your legs energy.
- protein: protein helps muscles recover after playing (egg, fish, chicken, milk).
- hydration: drink before, during and after you play; water comes first for young players; a sports drink only for long, hot sessions.
- treat: a sweet treat now and then is part of enjoying food; balance it with rice, fruit and water on training days.
- balanced: rice or bread, some protein and vegetables is a great meal before a match or to refuel after one.
- Each drink-machine drink carries one kid-level hydration line (`lib/town/drinkMachines.ts`).
- Wording rule (drinkMachines.ts header, food.ts header): only what the sources say, kid words, no medical claims, no weight
  talk, no diet rules, no "energy drink", generic names.

## Sources cited in the code
- Food (FOOD_SOURCES): FIFA Nutrition for Football; Better Health Channel (Victoria) Sporting performance and food; Sports
  Dietitians Australia fuelling/recovery factsheet; American Academy of Pediatrics (2011) heat stress and exercising children.
- Drinks (DRINK_SOURCES): NHS Water, drinks and hydration; NHS Dehydration; AAP HealthyChildren.org Choose Water; Sports
  Dietitians Australia Hydration in Junior Sport; FIFA Nutrition for Football; Cleveland Clinic coconut water.

## Safe page claims
- "Snacks from the Konbini refill your fuel" (true: refill by group). "Each one shows a football nutrition tip" (true: FOOD_NOTES / drink lessons).
- "Water comes first" (hydration note). "Tips from real sources" (FIFA, NHS, SDA, AAP listed above).
- Not allowed: food makes you faster/stronger in the game, health or medical advice, weight, diets.
