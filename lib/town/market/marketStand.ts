/**
 * Market stand helpers (fishing agent; UI in components/MarketStand.tsx). Adds "sell one" on top of the shared market
 * rules in ./market.ts (island jobs agent) WITHOUT duplicating them: the price of one item comes from quoteSale, so the
 * same fixed prices and the same daily soft cap (MARKET_FULL_PRICE_COINS, then half price) apply to one item or all.
 * Pure planners are exported for tests; `sellOneGood` is the browser executor.
 */
import {GOODS,goodById,type GoodKind} from './goods';
import {MARKET_FULL_PRICE_COINS,MARKET_STORAGE_KEY,localMarketDay,quoteSale,sanitizeMarket,nextUnitValue,plentyToday,plentyLine,withTallies,type MarketState,type SaleResult} from './market';
import {MARKET_BUYERS,perItemText,type MarketBuyer} from '../../economy';
import {FISH_SPOTS,MARKET_STAND} from '../fishing/fishCatalog';
import {DEEP_SEA_BOATS} from '../fishing/deepSeaBoatData';

/** What the NEXT item of this good is worth right now (full price, lowered by the same-kind ladder, halved after today's
 *  allowance). May be part of a coin (½, ¼): Rosa keeps a tally, see perItemText ("2 for 1 coin"). */
export function unitPrice(s:MarketState,id:string){const g=goodById(id);if(!g)return 0;return nextUnitValue(s,g);}
/** The catch card's coins (Nov 6 2026): what Rosa pays now for the NEWEST `id` in the basket (the one just landed), from the same
 *  market rules as selling it (nextUnitValue: the same-kind ladder for the ones already sold today and in the basket before it,
 *  half price past today's allowance). `null` when it is not in the basket (basket full): the card then says "up to" full price. */
export function newestUnitValue(s:MarketState,id:string):number|null{const g=goodById(id),have=s.basket[id]??0;if(!g||have<1)return null;return nextUnitValue(s,g,have-1);}
/** How the catch card says that value: "2 coins", "1 coin", or a part-coin the stand's way ("2 for 1 coin"). */
export function coinsText(value:number):string{return Number.isInteger(value)?`${value} coin${value===1?'':'s'}`:perItemText(value);}
/** Basket lines of one kind, in registry order. `each` is the next item's value (maybe a part-coin), `eachText` how the stand
 *  says it ("2 coins each", "2 for 1 coin"), `full` its full price, `plenty`: Rosa already has plenty of this good today. */
export function basketLines(s:MarketState,kind:GoodKind){return GOODS.filter(g=>g.kind===kind&&(s.basket[g.id]??0)>0).map(g=>{const each=unitPrice(s,g.id);
 return {good:g,count:s.basket[g.id],each,eachText:perItemText(each),full:g.price,plenty:plentyToday(s,g)};});}
/** The stand's kind note for a good Rosa has plenty of: "Rosa already has plenty of mangoes today: 1 coin each." */
export function plentyNote(s:MarketState,id:string,seller='Rosa'):string{const g=goodById(id);if(!g||!plentyToday(s,g))return '';
 return `${seller} already has plenty of ${g.plural.toLowerCase()} today: ${perItemText(unitPrice(s,id))}. Fresh tomorrow!`;}
/** Plan selling exactly one item: the new state and the coins (0 when it only fills Rosa's tally), or null when there is none. */
export function planSellOne(s:MarketState,id:string):{next:MarketState;coins:number;name:string;plenty:boolean}|null{
 const have=s.basket[id]??0,g=goodById(id);if(!g||have<1)return null;
 const q=quoteSale({...s,basket:{[id]:1}});
 const basket={...s.basket};if(have>1)basket[id]=have-1;else delete basket[id];
 return {next:withTallies({...s,basket,soldToday:s.soldToday+q.coins,sales:s.sales+1,lifetime:s.lifetime+q.coins},q),coins:q.coins,name:g.name,plenty:q.plenty.length>0};
}
/** Share of today's full-price allowance used (0..1) — the stand shows it as a friendly meter, never a countdown. */
export const allowanceUsed=(s:MarketState)=>Math.min(1,s.soldToday/MARKET_FULL_PRICE_COINS);

type SellPorts={read:()=>unknown;write:(s:MarketState)=>void;credit:(id:string,amount:number,reason:string)=>Promise<number>;refresh:()=>void;now?:()=>number};
/** Sell one item through the same storage key and wallet-run id scheme as market.ts (`market:<day>:<sale>`), so a sale is never paid twice. */
export async function sellOneGood(id:string,ports:SellPorts):Promise<SaleResult>{
 const now=ports.now?.()??Date.now();let raw:unknown=null;try{raw=ports.read();}catch{}
 const s=sanitizeMarket(raw,localMarketDay(now)),plan=planSellOne(s,id);
 if(!plan)return {ok:false,reason:'None of those left in your basket.'};
 try{ports.write(plan.next);}catch{return {ok:false,reason:'This browser could not save the sale, so nothing was sold.'};}
 ports.refresh();
 // Worth under a coin right now: it goes on Rosa's tally (the next one pays the coin), so there is no wallet run to make.
 const credited=plan.coins?await ports.credit(`market:${plan.next.day}:${plan.next.sales}`,plan.coins,`Farmers market · 1 ${plan.name}`.slice(0,110)):0;
 const half=s.soldToday>=MARKET_FULL_PRICE_COINS;
 return {ok:true,coins:plan.coins,credited,lines:[{id,name:plan.name,count:1,coins:plan.coins}],halfPrice:half,message:(plan.coins?'':'Rosa is keeping count of that one: the next one makes a coin. ')+(plan.plenty?plentyLine([id])+' ':'')+(plan.next.soldToday>=MARKET_FULL_PRICE_COINS?'Great trading today! More sales today earn half price; prices reset tomorrow.':`Full prices until you have sold ${MARKET_FULL_PRICE_COINS} coins of goods today.`)};
}
export {MARKET_STORAGE_KEY};

// ---- Sell where you fish (Nov 6 2026): who buys fish, and the nearest buyer to a fishing spot ----
/** Where each buyer stands (world x, z). The farm stand is Coral Cay's FARM.stand (lib/town/coralCay.ts; tests check it). */
export const FARM_STAND_AT={x:611,z:-101.5};
const CAPTAIN_FOR:Record<string,MarketBuyer>={'deep-sea-boat':'marina','deep-sea-boat-west':'kofi'};
export function buyerAt(b:MarketBuyer):{x:number;z:number}{
 if(b==='rosa')return {x:MARKET_STAND.x,z:MARKET_STAND.z};if(b==='farm')return FARM_STAND_AT;
 const boat=DEEP_SEA_BOATS.find(x=>CAPTAIN_FOR[x.spotId]===b)!;return boat.toWorld(boat.captainLocal.x,boat.captainLocal.z);
}
/** The buyer of fish nearest a fishing spot: a boat's own captain on a boat; from the shore, the nearer stand on land (Rosa's or
 *  Mele's), never a captain (the boats are moored out at sea). */
export function nearestFishBuyer(spotId:string):MarketBuyer{
 if(CAPTAIN_FOR[spotId])return CAPTAIN_FOR[spotId];const s=FISH_SPOTS.find(x=>x.id===spotId);if(!s)return 'rosa';
 let best:MarketBuyer='rosa',d=Infinity;for(const b of ['rosa','farm'] as const){const p=buyerAt(b),e=Math.hypot(p.x-s.x,p.z-s.z);if(e<d){d=e;best=b;}}
 return best;
}
/** The "basket full" line for a catch at this spot: it points at the nearest buyer of fish. */
export function basketFullLine(spotId:string):string{const b=nearestFishBuyer(spotId),w=MARKET_BUYERS[b];
 return b==='marina'||b==='kofi'?`Your basket is full, so that one swam free. ${w.who} buys fish right here on the boat: talk to the captain.`:`Your basket is full, so that one swam free. Sell your fish at ${w.where}.`;}
