# Beachcombing (14 October 2026)

User: "research what we can do to have the player find on the beach like star fish, sea shells, and other related animals to fish
so they can sell. stagger that throughout the mountain island and other islands."

## Design (summary)

**The loop.** Walk the beaches → a soft sparkle shows a find on the sand → "Pick up the scallop shell" (the same world-anchored
`store-enter-prompt` as Enter / Shake the tree, chosen by the HUD focus arbiter) → the character crouches (`gpick` job pose) and
the shell hops into the basket → sell it at **Rosa's market stand** (new **Beach** tab, same fixed prices and daily full-price
allowance as fish and fruit) → every find is recorded in the **Shellbook** (a Fishbook-style drawer) with a sea fact and a
football tip. Nothing new is invented: the finds are basket goods (`lib/town/market/goods.ts`, kind `beach`), so the island
pocket, the stand, the soft cap, the Training meter and the save all work as they do for fish.

**What you find** (one table, `BEACH_FINDS` in `lib/town/beachcombing.ts`; every value lives there):

| Find | Rarity | Beaches | Care | Football link (tip) |
|---|---|---|---|---|
| Scallop shell | common | sandy, coral | sell | ridges fan out like a team spreading wide in attack |
| Spiral shell | common | sandy, rocky | sell | a shell adds a ring at a time: daily practice adds up |
| Sea glass | common | sandy, rocky | sell | waves smooth it like practice smooths your first touch |
| Driftwood | common | sandy | sell | goals were wooden posts and a tape before crossbars |
| Mussel shell | common | rocky | sell | hold on tight like marking at a corner |
| Shore crab | common | sandy, rocky, coral | **put back** | defenders shuffle sideways, side-on, like a crab |
| Cowrie shell | uncommon | coral | sell | smooth and simple passing keeps the ball |
| Sand dollar (empty) | uncommon | sandy, coral | sell | a ball is round: 68–70 cm around for size 5 (Law 2) |
| Starfish | uncommon | sandy, coral | **put back** | five arms, one star: the team works together |
| Hermit crab | uncommon | coral, sandy | **put back** | tries shells until one fits, like trying positions |
| Conch shell | rare | coral, rocky | sell | call loud like a conch horn: "Man on!", "Time!" |
| Sea urchin | rare | rocky | **look only** | spines protect it; shin pads protect you (Law 4) |
| Golden cowrie | legendary | coral, rocky | sell | rare like the Golden Boot (at most one a day) |

**Animal welfare (the kids' rule: "Only take empty shells").** Living animals are never sold or kept. The crab, starfish and
hermit crab are lifted gently, shown, and put back where they live ("Put the crab back gently"): the animal scuttles or slides
back to the waterline and a small **Kind to sea life** reward (`value`, 1 coin) is paid once per animal per day. The sea urchin is
**look only** ("Look at the sea urchin": spiny, so you look, never touch; no coins, it goes in the Shellbook). Why: real beach codes
say leave living things, a child can't tell a live starfish from a dead one, and paying a little for kindness teaches the right
habit without making animals into goods. Hermit crabs need empty shells, which the Shellbook says too.

**Where (daily rotation).** Fixed candidate spots are sampled along each beach's sand band (tide line, 30–75% of the way in from
the water, so the swash never covers them), validated once against the real world (on sand, not in water, off paths, roads,
courts and colliders, clear of fishing posts), then each **local day** a seeded shuffle (`hash(day, zone)`) picks that day's spots
at least 8 m apart, and `hash(day, spot)` picks each spot's find from the zone's beach type. Same finds on every device; new places
tomorrow; a picked spot stays empty until tomorrow (the save remembers today's taken spots only).

| Island | Zone | Beach type | Finds a day |
|---|---|---|---|
| Summit Isle | sandy beach ring | sandy | 5 |
| Summit Isle | the three boulder coves (by its fishing posts) | rocky | 4 |
| Summit Sandbar | the walk to Coral Cay | sandy | 1 |
| Coral Cay | its sandy shore | coral | 7 |
| Main island | North Beach | sandy | 4 |
| Main island | South Beach (west of the pier) | sandy | 2 |
| **Total** | | | **23** |

Summit Isle gets the most (10 with its sandbar), as asked; the urchin and most mussels only live in its rocky coves, the cowrie and
most conches on Coral Cay, and the golden cowrie only on the cay or the summit coves.

**Selling.** At Rosa's stand (Beach tab, Sell 1 / Sell all) through the shared market rules. Placeholder prices sit just under
fish of similar rarity because a find takes less effort than a catch: common 2, uncommon 3, rare 5, golden 10; put-back reward 1.
The **economy agent** owns the numbers. Since the Oct 14 2026 economy pass, `BEACH_FINDS[].value` is filled from
`lib/economy.ts` `beachFindValue` (common 1, uncommon 2, rare 4, golden 8, put-back 1), and goods, the pocket, the stand and the
Shellbook all read `value`, so nothing else hard-codes a price (guarded in `tests/beachcombing.cjs`).

**Collection.** The Shellbook (`components/Shellbook.tsx`, the Fishbook's look and drawer): every find, found or "not found yet",
how many, where it lives, its care rule, the sea fact and the football tip. Opened from the pocket's Beach finds card, from the
stand's Beach tab, and from the first-find note.

**HUD.** No new coins-bar pill: the bar already carries coins, fish, fruit and fuel and is `max-width: calc(100% - 156px)` (234 px
on a 390 px phone), so a fourth counter would crowd it. Finds live in the basket and show in the island pocket's new **Beach
finds** card (and the stand). Notes go through the shared toast lane (one note at a time, `HudSlot` toast slot).

**Heat plan.**
- One merged, vertex-coloured mesh per island for that day's finds (≤ 3 draw calls in the world, only the near island's is
  visible: hidden past 160 m from its box, frustum-culled), plus one instanced sparkle mesh (≤ 12 instances, the finds within 45 m;
  hidden otherwise). A pickup adds one tiny mesh for 0.4–1 s. Budget: **≤ 2 draw calls at a beach, ≤ 3 during a pickup**.
- No shadows, no textures, no transparency. Built lazily per island the first time the player comes near (candidate checks run
  once, spread one zone per frame); a picked find is collapsed in place (a vertex range write), never a rebuild.
- No timers, no rAF of its own: `update()` is called from Town's frame; far from every beach it is three box tests. The sparkles
  twinkle only while the player is within 45 m of a find. `?beach=0` turns the feature off for A/B heat runs.

**Save.** `fi2-beachcomb-v1` (SYNC): the day, today's taken spot keys, the Shellbook counts (found / sold / put back), the tip
flag. Basket goods are in `fi2-market-v1` as before.

## Build notes

- Rules, table, zones, rotation, save, HUD store: `lib/town/beachcombing.ts`.
- Runtime (meshes, sparkles, prompt, pickup animation): `lib/graphics/beachFinds.ts`.
- UI: `components/BeachcombHud.tsx` (prompt, notes, Shellbook host), `components/Shellbook.tsx`, `components/BeachFindArt.tsx`;
  the Beach tab in `components/MarketStand.tsx`; the Beach finds card in `components/IslandBalanceDrawer.tsx`.
- Market: `GoodKind` gains `'beach'`; `BEACH_GOODS` is generated from `BEACH_FINDS` (sellable ones) in `goods.ts`; the pocket
  gains a `beach` category.
- Town: one create / update / dispose hook, one HUD candidate line, one `<BeachcombHud/>` render.
- Tests: `tests/beachcombing.cjs`.

## Results (14 October 2026)

- **Finds a day:** Summit Isle 10 (beach 5, coves 4, sandbar 1), Coral Cay 7, main island 6 (North Beach 4, South Beach 2): 23.
  Valid candidate spots after the world checks: Summit beach ~330, coves ~80, sandbar ~20, Coral Cay ~250, North Beach ~65,
  South Beach ~155.
- **Size:** finds are drawn at 1.7× life size; at 1.1× they were specks from the follow camera in phone screenshots.
- **Heat (phone profile 390×844 at 3×, headless Chromium with Metal ANGLE, standing on a Summit Isle beach, 6 s, GPU timer queries):**
  with the feature off (`?beach=0`), 41 draw calls, CPU render 2.6 ms median (a noisy run), GPU 2.61 ms. With it on (two runs), 43 draw calls,
  CPU 0.6–0.8 ms, GPU 2.10–2.32 ms. That is +2 draw calls (one merged island mesh and the sparkles), and CPU and GPU time stay within run-to-run noise.
  This is desktop emulation: there is no claim about iPhone temperature.
- **Tests:** `tests/beachcombing.cjs` (in `npm test`). Additive updates were made to `tests/island-pocket.cjs` (the groups now include beach) and
  `tests/island-jobs.cjs` (a good may be of kind `beach`).
