/**
 * Futbol Island economy: EVERY tunable coin number in one place (Oct 14 2026 rebalance, docs/economy.md).
 *
 * User (Oct 14 2026): "improve the economy to make it harder to buy things since it's easier to find, shake, and fish now".
 * Fishing got 16 spots and farther casts, Summit Isle added fruit trees and Summit Kick, and beachcombing is
 * on its way, so coins came faster than the things to buy them with. This module is the one place to tune that:
 *
 *  - FAUCETS (what pays): learning coins, the daily kick-off, island jobs, the Training meter (the one daily soft cap over every
 *    repeatable earning), the farmers market (sell values per fish / produce / beach find, the daily full-price allowance and the
 *    "Rosa has plenty of mangoes today" same-kind ladder), foraging, Summit Kick, arcade payouts, card trade-ins.
 *  - SINKS (what costs): vending prices, card packs, books, the Kit Shop studios, arcade plays.
 *
 * The game modules re-export these (lib/town/learnCoins.ts LEARN_COINS, lib/town/jobs/jobEconomy.ts JOB_BASE_PAY, lib/shop/*.ts
 * PRICE, …), so existing imports keep working and every screen shows the same number. This file imports nothing, so any module
 * (and the plain-node tests' TypeScript loaders) can read it without an import cycle.
 *
 * Save safety (never take coins or items away): every coin ever paid is a saved wallet run with its own `paid` amount and every
 * purchase stores its own cost, so changing a number here only changes FUTURE earning and spending. Two rules keep that true:
 *  1. ARCADE_COIN_CAPS and LEARN_RUN_CAP are also the clamps sanitizeArcadeWallet applies to saved runs: raise them freely,
 *     never lower them (that would shrink old receipts). Lower an arcade payout with a separate payout rule instead.
 *  2. DAILY_PLAY_COINS may go down because the wallet clamps old daily-play receipts to LEGACY_DAILY_PLAY_MAX (lib/town/dailyPlay.ts).
 *
 * Kid-safe rules kept from the 28 Sep pass (docs/economy/ECONOMY_PROPOSAL.md): fixed prices, no odds shown, no expiry, nothing is
 * ever blocked (soft caps lower pay, then a 1-coin thank-you tip), learning pays best and is never metered, friendly copy.
 */

// ==== FAUCETS ==================================================================================================================

/**
 * Learning coins, paid once ever per lesson / ball / story / stage / item / path (idempotent `learn:<kind>:<id>` wallet runs,
 * never metered). Oct 14 2026: quiz 12 → 15 and hidden ball 10 → 12, so learning stays the best pay per minute after the
 * rebalance (docs/economy.md §4): a lesson quiz ≈ 4.7 coins a minute, a hidden ball ≈ 3.4, every fish / fruit / beach find ≤ 2.6.
 * Forward-only: lessons and balls already paid keep their saved amount (creditOnce never pays an id twice).
 */
export const LEARN_COINS={quiz:15,quizPerfect:6,ball:12,story:10,journey:8,explore:5,path:75,review:2,book:5} as const;
/** The wallet's per-run cap for learning runs (also its save clamp: never lower it). */
export const LEARN_RUN_CAP=75;

/** Welcome coins, once: exactly one 3-card pack. */
export const STARTER_COINS=40;
/** The daily kick-off: once a local day after 30 s of active play. Oct 14 2026: 30 → 20, still more than a job shift and about a
 *  third of a typical 15-minute session (the old 30- and 40-coin receipts are kept whole by LEGACY_DAILY_PLAY_MAX in
 *  lib/town/dailyPlay.ts). */
export const DAILY_PLAY_COINS=20;

/**
 * The Training meter (lib/town/dailyMeter.ts): ONE gentle daily budget across every repeatable earning (jobs, market sales,
 * arcade payouts, Summit Kick, card trade-ins). Full pay until TRAINING.full coins have been paid today, then half pay until
 * TRAINING.half, then a TRAINING.tip thank-you per earning. Oct 14 2026: 60 / 120 → 40 / 80 (the grinder's daily ceiling drops
 * from about 120 + tips to 80 + tips; a casual player rarely reaches the full line).
 */
export const TRAINING={full:40,half:80,tip:1} as const;

/**
 * Island jobs (lib/town/jobs/jobEconomy.ts). Per job per day: FULL_PAY_PER_DAY shifts at full pay, HALF_PAY_PER_DAY at half,
 * then a TIP; FIRST_JOB_BONUS the first time ever; all under the Training meter. Oct 14 2026: pay cut about a third (band 7–10 →
 * 4–7, wall rebounds 26 → 16) so every job pays LESS per minute than a lesson quiz (≈ 4.7) and the median job (≈ 3.8 a minute)
 * sits just above a hidden ball. Minutes per shift: JOB_MINUTES + overhead in jobEconomy.ts.
 */
export const JOBS={fullPerDay:2,halfPerDay:2,tip:1,firstBonus:4} as const;
export const JOB_PAY={'leaf-rake':6,'wall-rebounds':16,'ball-kid':7,'cone-setup':4,'line-painter':5,'court-cleanup':5,'offside-flag':6,
 'ball-pump':6,'goal-anchor':5,'farm-harvest':6,'match-day-snacks':5,'garden-shift':6,'trail-cleanup':5} as const;
/** The short-job pay band the tests keep every job except wall rebounds (a 4-minute drill) inside. */
export const JOB_PAY_BAND=[4,7] as const;

/**
 * Farmers market (lib/town/market/market.ts): what Rosa (and Mele's Coral Cay farm stand, the same state) pays.
 *  - allowance: full prices until this many coins of goods were sold today, then half price. 40 → 30 (Oct 14 2026).
 *  - ladder: "Rosa already has plenty of mangoes today". The first `fullEach` of ONE kind sold today fetch full price, the next
 *    `fullEach` fetch `second` of it, the rest `third`. Rare and legendary catches and finds are exempt: rare items stay valuable.
 *  - Fractions: a cheap good at half or a quarter price is worth ½ or ¼ coin, so Rosa keeps a TALLY per good per day ("2 for 1
 *    coin", "4 for 1 coin"): each item adds its value to the tally and whole coins are paid as they fill. Nothing is rounded away
 *    and nothing is rounded up, so selling one at a time never pays more than selling all at once (the old "at least 1 coin per
 *    item" floor let 1-coin goods dodge every soft cap). The counts and tallies are saved per good per local day in the market
 *    state (fi2-market-v1, synced: switching devices does not reset them).
 *  - basket: how many goods fit in the basket (unchanged, not a price).
 */
export const MARKET={allowance:30,halfFactor:.5,basket:20,ladder:{fullEach:4,second:.5,third:.25}} as const;

/** Fish sell value = the catalogue's species value (lib/town/fishing/fishCatalog.ts `price`, which sets each species' place in the
 *  pecking order) × this factor for its rarity, rounded, at least 1. Commons are halved, rarer catches keep more of their value. */
export const FISH_SELL_FACTOR={common:.5,uncommon:.6,rare:.7,legendary:.8} as const;
/** Rarities the same-kind ladder never lowers. */
export const LADDER_EXEMPT_RARITY:readonly string[]=['rare','legendary'];
export type SellRarity=keyof typeof FISH_SELL_FACTOR;
/** The coins Rosa pays for one fish at full price. */
export function fishSellValue(f:{price:number;rarity:string}):number{
 const k=(FISH_SELL_FACTOR as Record<string,number>)[f.rarity]??FISH_SELL_FACTOR.common;
 return Math.max(1,Math.round((Number.isFinite(f.price)?f.price:1)*k));
}

/**
 * Produce sell values (lib/town/market/goods.ts reads these; its own `price:` literals are only the fallback for a good that is not
 * listed here yet). Oct 14 2026: everyday garden and orchard fruit and veg 1 coin, the bigger island fruit 2. Fruit is fuel first
 * (eat it from the pocket, lib/town/fuel.ts); shaking trees and picking stay a treat, not a farm.
 * FRUIT-TREE AGENT: add every new fruit kind here (1 for everyday fruit, 2 for a big or rarer island fruit); goods.ts picks it up.
 */
export const PRODUCE_SELL:Record<string,number>={
 orange:1,cherry:1,strawberry:1,tomato:1,carrot:1,banana:1,pepper:1,greens:1,'sweet-potato':1,lime:1,
 mango:2,coconut:2,papaya:2,guava:2,avocado:2,
};
/** A produce good not in PRODUCE_SELL yet: half its declared price, 1–2 coins. */
export function produceSellValue(id:string,declared:number):number{
 const v=PRODUCE_SELL[id];if(typeof v==='number')return v;
 return Math.max(1,Math.min(2,Math.round((Number.isFinite(declared)?declared:1)/2)));
}

/**
 * Beachcombing (lib/town/beachcombing.ts BEACH_FINDS, Oct 14 2026). Its `value` reads beachFindValue() below, so this is the one
 * table: a sellable find's full basket price, or, for a living animal put back (care 'putBack'), its one-off "Kind to sea life"
 * thank-you; 0 for look-only. Oct 14 2026: the placeholders (2 / 3 / 5 / 10) cut to 1 / 2 / 4 / 8, a little under a fish of the
 * same rarity: a find is less effort than a catch. The natural daily cap is the rotation itself (23 finds a day over three
 * islands, BEACH_ZONES perDay). Sold at Rosa's through the same allowance, ladder (rare finds exempt) and Training meter.
 */
export const BEACH_FIND_VALUE_BY_RARITY={common:1,uncommon:2,rare:4,legendary:8} as const;
export const BEACH_FIND_VALUE:Record<string,number>={
 'scallop-shell':1,'spiral-shell':1,'sea-glass':1,driftwood:1,'mussel-shell':1,'cowrie-shell':2,'sand-dollar':2,'conch-shell':4,'golden-cowrie':8,
 // living animals: a one-off kindness thank-you for putting them back, not a sale; look-only finds pay nothing
 'shore-crab':1,starfish:1,'hermit-crab':1,'sea-urchin':0,
};
/** One find's coins: its own row above, else by care and rarity (a new find the beach agent adds is priced sensibly by default). */
export function beachFindValue(f:{id?:string;rarity:string;care?:string}):number{
 if(f.id&&typeof BEACH_FIND_VALUE[f.id]==='number')return BEACH_FIND_VALUE[f.id];
 if(f.care==='look')return 0;if(f.care==='putBack')return 1;
 return (BEACH_FIND_VALUE_BY_RARITY as Record<string,number>)[f.rarity]??BEACH_FIND_VALUE_BY_RARITY.common;
}

/** Summit Isle fruit trees (lib/town/summitForage.ts FORAGE.dailyCap): fruit a player can forage per local day. Unchanged at 8:
 *  the cut is in what fruit sells for (1–2 coins), so a day of shaking is worth about 10 coins, not 24. */
export const FORAGE_DAILY_CAP=8;

/** Summit Kick (lib/town/summitKick.ts): coins per hoop hit and the bonus for all five; metered as `summit-kick:` island runs.
 *  Oct 14 2026: 2 + 4 (max 14) → 1 + 3 (max 8). A round is a 90-second shooting game, so it pays like an arcade round. */
export const SUMMIT_KICK_COINS={perHoop:1,perfect:3} as const;

/** Arcade (lib/arcade/arcadeWalletCore.ts). Plays stay cheap: 3 coins (Pass Puzzles free). Payout caps per round; these are also
 *  the wallet's save clamps, so NEVER lower them (raise only). The Training meter is what limits a day of arcade earning. */
export const ARCADE_PLAY_COST=3;
export const ARCADE_COIN_CAPS={runner:12,pinball:15,tennis:18,live:20,puzzle:8,island:20,learn:LEARN_RUN_CAP} as const;
export const PUZZLE_FIRST_SOLVE_COINS=5;

/** Card trade-ins at Rosa's stand (lib/town/market/cardSelling.ts), metered. */
export const CARD_TRADE={coins:2,perDay:3} as const;

// ==== SINKS ====================================================================================================================

/** Vending machine prices (lib/town/vendingCatalog.ts). Unchanged Oct 14 2026: the cut in faucets already makes these about a third
 *  dearer in play time, and a 3-card pack stays a one-session treat. */
export const VENDING_PRICES={ball:20,specialBall:35,scooter:30,bike:40,moped:50,jetpack:70,costume:30} as const;
/** Card packs (lib/arcade/legendPacks.ts): a 3-card pack, a 5-card pack, and how many a day. */
export const PACK_PRICES={pack3:40,pack5:60,legend:40} as const;
export const PACKS_PER_DAY=3;
/** Every pop-up book (lib/books/catalog.ts). User decision (28 Sep 2026): 100. */
export const BOOK_PRICE=100;

/**
 * The Kit Shop studios (lib/shop/jersey.ts, boots.ts, ball.ts read these; the studios only ever call jerseyPrice / bootPrice /
 * ballPrice). User (Oct 12 2026): "pricier (jersey 300+, boots 200+, ball 150+)": those are FLOORS (tests/economy.cjs). Oct 14 2026:
 * base prices up (ball 150 → 160, boots 200 → 240, jersey 300 → 330); extras unchanged. With a typical 15-minute session worth
 * about 70 coins (scripts/economy-sessions.cjs), a plain ball is ~2.2 sessions, boots ~3.3 and a jersey ~4.5 (docs/economy.md §5).
 */
export const KIT_SHOP_MIN={ball:150,boots:200,jersey:300} as const;
export const JERSEY_PRICES={base:330,longSleeves:40,collar:25,print:25,drawing:30};
export const BOOT_PRICES={base:240,finish:{matte:0,glossy:10,metallic:40,iridescent:50},collar:{low:0,mid:15,sock:25},laces:{visible:0,covered:15,laceless:25},
 // the shapes with extra parts (fins, a lace cover, a strike pad, a fold-over tongue) cost a little more
 model:{speed:0,retro:10,classic:15,feather:15,fins:30,track:10,longflap:25,cage:25,offset:20,wrap:15,pro:15,knit:15,sock:10,laceless:10,indoor:0},
 studs:{fg:0,blade:10,hybrid:15,chevron:15,sg:25,sgmix:30,ag:10,turf:0,indoor:0,futsal:5,split:40,carbon:50},
 studFinish:{matte:0,glossy:0,translucent:15,chrome:20,tipped:10},pattern:15,decal:5,name:10,flag:10} as const;
export const BALL_PRICES={base:160,layout:{classic32:0,panel26:25,panel14:25,propeller6:40,panel8:25,leather18:50},
 finish:{gloss:0,matte:0,dimple:25,leather:40,holo:60,metal:50},pattern:25,decal:10,size:{3:0,4:10,5:25},futsal:10,
 /** Hand-drawn art (strokes or filled panels) is printed by hand at the shop, a small extra. */
 drawing:20} as const;

/** Konbini food and drink-machine prices live with their menus (lib/konbini/food.ts, lib/town/drinkMachines.ts: 30 + 12 items, each
 *  with its own nutrition note). They are consumables, not goals; these bands are what the tests hold them to. */
export const KONBINI_PRICE_BAND=[3,12] as const;
export const DRINK_PRICE_BAND=[3,6] as const;

// ==== MARKET LADDER (pure) =====================================================================================================

/** The ladder's share of full price for the `nth` (0-based) item of one kind sold today. */
export function ladderFactor(nth:number,exempt=false):number{
 if(exempt)return 1;const n=Math.max(0,Math.floor(Number.isFinite(nth)?nth:0)),L=MARKET.ladder;
 return n<L.fullEach?1:n<2*L.fullEach?L.second:L.third;
}
/**
 * The value of ONE item (may be a fraction of a coin): its full sell value, lowered by the same-kind ladder (`nth` = how many of
 * this good were already sold today) and halved once today's full-price allowance is used (`soldCoinsToday` ≥ MARKET.allowance).
 * Always a multiple of 1/8 coin, so tallies add up exactly.
 */
export function marketUnitValue(full:number,nth:number,soldCoinsToday:number,exempt=false):number{
 const base=Math.max(1,Math.floor(Number.isFinite(full)?full:1));
 return base*ladderFactor(nth,exempt)*(soldCoinsToday>=MARKET.allowance?MARKET.halfFactor:1);
}
/** Add one item's value to a good's tally: the whole coins it pays now and the tally left (0 ≤ tally < 1). */
export function payFromTally(tally:number,value:number):{coins:number;tally:number}{
 const t=(Number.isFinite(tally)&&tally>0&&tally<1?tally:0)+Math.max(0,value),coins=Math.floor(t+1e-9);
 return {coins,tally:Math.round((t-coins)*8)/8};
}
/** "2 coins each", "1 coin each", "2 for 1 coin", "4 for 3 coins", "8 for 1 coin": a price kids can read (no decimals). */
export function perItemText(value:number):string{
 for(const k of [1,2,4,8]){const c=value*k;if(Math.abs(c-Math.round(c))<1e-9){const n=Math.round(c);
  return k===1?`${n} coin${n===1?'':'s'} each`:`${k} for ${n} coin${n===1?'':'s'}`;}}
 return `${value} coins each`;
}
