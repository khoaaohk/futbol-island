# Sell stand: Fish · Produce · Cards

Written 27 Sep 2026. Local only: nothing has been committed or deployed.

## Where selling happens

The user asked for "the store to sell items, like fish, fruits, and even cards, to make money", then decided: **"the store can just be a stand at the farmers market."**

So there is **one sell stand**, at the East Coast Farmers Market. It has one UI with three sections: Fish, Produce and Cards.

- **The stand and its Fish and Produce sections** belong to the fishing agent: `components/FishMarket.tsx` and `lib/town/fishing/*`. The goods come from the shared registry `lib/town/market/goods.ts`, and the basket and selling rules are in `lib/town/market/market.ts`, which is owned by the jobs agent.
- **The Cards section** is owned by this sell-shop work:
  - `lib/town/market/cardSelling.ts`: the pure rules, the flag and the loop checks;
  - `lib/town/market/cardSellingStore.ts`: the browser binding;
  - `components/MarketCardsSection.tsx` and its `.module.css`: the section UI.
- **The Store building** in the square stays as plain scenery. The vending agent is removing its buy entry points, because the 8 vending machines are now where you buy things. It gets no Sell prompt.

### How the stand renders the Cards section

```tsx
import MarketCardsSection from '@/components/MarketCardsSection';
// …inside the stand's dialog, as the third tab:
<MarketCardsSection active={tab==='cards'} onSold={(coins,name)=>{/* optional: refresh the stand's coin total / play the coin sound */}}/>
```

While `active` is false, the section renders nothing and reads nothing. It has no timers. The coin burst is a one-shot CSS animation, and it is hidden when the viewer prefers reduced motion.

## 1. Fish and produce prices (recommendation)

**Recommendation: one stand, one price per good, and one daily soft cap.**

Every price comes from `goods.ts`. The stand keeps no second item list. `market.ts` pays each good's registry price until the day's sales reach `MARKET_FULL_PRICE_COINS` (40 coins). After that, goods pay half price (at least 1 coin), and the cap resets at local midnight.

The brief asked whether to have a "market pays better for fresh goods" place and a separate "buys anything" shop. Now that the Store is a market stand, there is no second shop, so that question goes away.

- A single price is easy for a child to learn: an orange is worth 3.
- There is no reason to walk between two buyers to get the better deal.
- Nobody can earn two soft caps' worth of coins in one day.

**Decision for the user:** if a second buyer ever returns, give it the same prices and let it share the same `soldToday` cap.

## 2. Selling cards (the delicate part)

Cards are earned by learning. The binder holds no duplicates, and an offer only ever contains missing cards (`docs/card-rewards.md`). Selling a card therefore removes it from the collection. I compared three options:

| Option | Verdict |
| --- | --- |
| **(a) Only duplicate "spares"** | This is the cleanest idea, but today spares are not tracked. The arcade wallet's pack draw (`purchaseMysteryPack` in Astra's `lib/arcade/arcadeWalletCore.ts`) can fall back to a card you already have once a pool runs out. That repeat silently does nothing (`addToCollection` dedupes). To make spares real, Astra's wallet would need to record them, and the "no duplicates" promise in the card-reward docs would change. **I did not build this. It is a decision for the user and for Astra.** |
| **(b) Sell any card at a real value** | This undermines the learning collection. It turns cards into currency and rewards emptying the binder. **Rejected.** |
| **(c) Protected "trade-in" at a low flat value** | **Recommended, and implemented behind a flag that ships off.** |

### The recommended trade-in rules (option c)

- **One flat price:** `CARD_TRADE_COINS = 2` for every tradeable card. A flat price never reveals a card's tier or rarity, so the no-odds and no-rarity rules still hold. It is also small next to a 7–10 coin island job, so cards stay a collection rather than a paycheque.
- **Protected cards are never listed:**
  - Icon-tier cards (the game's greatest players, from `cardTiers.ts`). These are the hardest to earn, because they are gated behind 80% path progress.
  - The six legends (`LEGEND_PACK_CANDIDATES`).
  - Every legend a child bought in a pack (`packs[].legends` in the wallet). Selling a coin-bought card back for a fraction of its price would feel like a trick.
- **A daily limit:** `CARD_TRADES_PER_DAY = 3`. At most 6 coins a day come from cards.
- **Confirmation every time.** The prompt says: "Trade in X for 2 coins? This card will leave your binder. You might find it again in a future card pick, but it is not guaranteed." The buttons are **Keep it** (the autofocused default) and **Trade in**.
- **Honest copy:** the section never promises the card will come back.
- **No buy-back.** The wallet has no general "spend" call. Buying a card back would mean editing Astra's wallet, which is off-limits. I noted it as a future option.
- **Guards:**
  - Trade-ins are off whenever the testing switch that unlocks every card is on (`UNLOCK_ALL_CARDS`), and whenever card rewards are off.
  - If the card cannot be removed, or the trade cannot be saved, nothing is paid and the ledger rolls back.

### Why this is the kid-friendly choice

The learning loop stays intact. You earn a card by learning, and it stays yours unless you choose, twice, to swap it. The swap is worth almost nothing, so there is no incentive to strip the binder. The special cards can't be touched, and there is no pressure: no timers, no odds, and nothing is lost by waiting.

### The flag

`CARD_TRADE_MODE` in `lib/town/market/cardSelling.ts`:

- **`'off'` (shipped default).** The Cards section explains that "Your cards stay in your binder": you earned them by learning, and the stand does not buy cards. It also shows the kit-man's football fact.
- **`'trade-in'`.** This turns on the rules above.

**Waiting on the user:** confirm trade-ins, then change the constant to `'trade-in'`.

To preview in development, open the app with `?cardtrade=on` (and `?cardtrade=off` to switch back). The setting is remembered in localStorage and is ignored in production builds.

The ledger is stored in localStorage under `fi2-card-trade-v1`.

## 3. Prices and the money loop

Shared economy numbers:

- Welcome coins: 25 (`STARTER_COINS`).
- Island jobs pay 7–10 coins, with half pay after two shifts and a 1-coin tip after four.
- The market soft cap is 40 coins a day.
- Card packs cost 30 (3 cards) or 50 (5 cards), with the same prices at the vending machines and in the arcade.
- Vending gear costs 15–40.

**The money loop is closed.** You cannot buy a pack and trade its cards back for more than it cost:

- A 3-card pack trades for at most 3 × 2 = 6 coins against a price of 30.
- A 5-card pack trades for at most 5 × 2 = 10 coins against a price of 50.

Those maximums assume no card is protected. In reality the pack's legend is protected, so the most you can get back is 4 or 8. A whole day of trade-ins (6 coins) is less than the cheapest pack. `noPackLoop()` and `tests/sell-shop.cjs` check this against the wallet's real pack prices.

Card coins are credited as `card-trade:<day>:<n>` runs through the island wallet bridge (`islandJobWallet.credit`, jobs agent). The fixed run id means a retry never pays twice.

Card coins do **not** count toward the goods soft cap. They have their own 3-a-day limit.

## 4. Football tie-in

Remi the kit-man runs the stand's card counter and shares one football-business fact a day. The fact is picked by date, with no timer. There are four facts:

1. **Panini's first World Cup sticker album was Mexico 1970**, which started the "got, got, need" swapping tradition.
   - Source: [SI, "Panini World Cup sticker album history"](https://www.si.com/soccer/2018/06/06/panini-world-cup-sticker-album-history-tradition)
   - Source: [FIFA Collect, Panini 1970 album](https://collect.fifa.com/collectible/2860915209)
2. **Transfer fees.** When a professional player moves to a new club while still under contract, the new club pays the old club a transfer fee. This is general, well-established football knowledge.
3. **FIFA's solidarity rule.** 5% of an international transfer fee is shared with the clubs that trained the player between the ages of 12 and 23.
   - Source: FIFA Regulations on the Status and Transfer of Players, Article 21 and Annex 5
   - Source: [FIFA TMS Help Centre, "Solidarity mechanism"](https://support.fifatms.com/en/support/solutions/articles/7000097497-solidarity-mechanism)
4. **Youth academies.** Clubs earn money from tickets, shirts and TV, and many spend part of it on their youth academy. This is framed as a general statement with "many", so it does not name a club or give a figure.

## Heat

The Cards section has no per-frame work. It renders nothing while its tab is closed. Its store reads localStorage only on render or on a tap. It listens for `fi2-card-added`, `fi2-card-removed` and `storage` only while it is open. A traded card fires `fi2-card-removed`.

## Tests

`node tests/sell-shop.cjs` checks:

- goods sell through the registry, with the wallet credit port and the soft cap;
- the flag ships off;
- protected cards are refused;
- the daily limit, and that run ids are idempotent;
- rollback when the card can't be removed or the trade can't be saved;
- the money-loop invariants;
- source checks on the browser binding and the UI (no timers, a confirmation, no odds or rarity copy).

## Known gaps and coordination

- **The stand is not wired yet.** `components/FishMarket.tsx` did not exist when I wrote this. The fishing agent needs to render `<MarketCardsSection>` as the stand's Cards tab (the snippet is above).
- **Stale card count in the HUD.** After a trade, `CardsSummary`'s count refreshes on its next offer change rather than straight away. The binder re-reads the collection when it opens.
- **Fish in the shared basket.** Fish are sold from the shared basket. The fishing agent adds them to `FISH_GOODS` in `goods.ts`, which is empty today.
