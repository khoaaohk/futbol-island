/**
 * Market stand helpers (fishing agent; UI in components/MarketStand.tsx). Adds "sell one" on top of the shared market
 * rules in ./market.ts (island jobs agent) WITHOUT duplicating them: the price of one item comes from quoteSale, so the
 * same fixed prices and the same daily soft cap (MARKET_FULL_PRICE_COINS, then half price) apply to one item or all.
 * Pure planners are exported for tests; `sellOneGood` is the browser executor.
 */
import {GOODS,goodById,type GoodKind} from './goods';
import {MARKET_FULL_PRICE_COINS,MARKET_STORAGE_KEY,localMarketDay,quoteSale,sanitizeMarket,type MarketState,type SaleResult} from './market';

/** Coins the NEXT item of this good would fetch right now (full price, or half after today's allowance). */
export function unitPrice(s:MarketState,id:string){const g=goodById(id);if(!g)return 0;return s.soldToday>=MARKET_FULL_PRICE_COINS?Math.max(1,Math.floor(g.price/2)):g.price;}
/** Basket lines of one kind, in registry order. */
export function basketLines(s:MarketState,kind:GoodKind){return GOODS.filter(g=>g.kind===kind&&(s.basket[g.id]??0)>0).map(g=>({good:g,count:s.basket[g.id],each:unitPrice(s,g.id)}));}
/** Plan selling exactly one item: the new state and the coins, or null when there is none. */
export function planSellOne(s:MarketState,id:string):{next:MarketState;coins:number;name:string}|null{
 const have=s.basket[id]??0,g=goodById(id);if(!g||have<1)return null;
 const q=quoteSale({...s,basket:{[id]:1}});if(!q.coins)return null;
 const basket={...s.basket};if(have>1)basket[id]=have-1;else delete basket[id];
 return {next:{...s,basket,soldToday:s.soldToday+q.coins,sales:s.sales+1,lifetime:s.lifetime+q.coins},coins:q.coins,name:g.name};
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
 const credited=await ports.credit(`market:${plan.next.day}:${plan.next.sales}`,plan.coins,`Farmers market · 1 ${plan.name}`.slice(0,110));
 const half=s.soldToday>=MARKET_FULL_PRICE_COINS;
 return {ok:true,coins:plan.coins,credited,lines:[{id,name:plan.name,count:1,coins:plan.coins}],halfPrice:half,message:plan.next.soldToday>=MARKET_FULL_PRICE_COINS?'Great trading today! More sales today earn half price; prices reset tomorrow.':`Full prices until you have sold ${MARKET_FULL_PRICE_COINS} coins of goods today.`};
}
export {MARKET_STORAGE_KEY};
