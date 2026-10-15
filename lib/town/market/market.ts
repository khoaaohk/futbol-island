/**
 * Farmers-market basket and selling rules, shared by the community garden (island jobs) and fishing.
 * Pure core (createMarket) + browser storage. Coins are paid through an injected `credit` port (see
 * lib/town/jobs/islandWallet.ts), so the market never touches the arcade wallet's internals.
 * Kid-safe: fixed prices, no odds, no haggling timers; a gentle daily soft cap halves prices after
 * MARKET_FULL_PRICE_COINS coins of sales in a day and resets at local midnight.
 *
 * Oct 14 2026 (docs/economy.md): the numbers live in lib/economy.ts (MARKET). The allowance is 30 (was 40), and a same-kind ladder
 * was added: "Rosa already has plenty of mangoes today". The first MARKET.ladder.fullEach of one good sold today fetch full price,
 * then less (at least 1 coin); rare and legendary goods are exempt. `byGood` counts today's sales per good in this same synced key
 * (fi2-market-v1), so it resets at local midnight with soldToday and follows the player across devices. Old saves without it start
 * at 0 sold: nothing already earned changes.
 */
import {GOODS,goodById,isGood,ladderExempt,type Good,type GoodKind} from './goods';
import {MARKET,marketUnitValue,payFromTally,ladderFactor} from '../../economy';
export const MARKET_STORAGE_KEY='fi2-market-v1';
export const BASKET_LIMIT=MARKET.basket;
export const MARKET_FULL_PRICE_COINS=MARKET.allowance;
export type MarketState={version:1;day:string;basket:Record<string,number>;soldToday:number;sales:number;lifetime:number;
 /** Today's sales per good id (the same-kind ladder). Absent = none sold today. */
 byGood?:Record<string,number>;
 /** Today's part-coin tally per good id (0 ≤ t < 1, eighths): "2 for 1 coin" pays on every second item. Absent = 0. */
 tally?:Record<string,number>;
 /** Keys of one-off basket grants already given (e.g. a Harvest day shift's farmer's share), newest last; kept across days. */
 granted?:string[]};
/** How many grant keys are remembered (a shift key is unique per day, so this only needs to outlive a reload). */
export const GRANT_MEMORY=40;
export type SaleLine={id:string;name:string;count:number;coins:number};
export type SaleResult={ok:true;coins:number;credited:number;lines:SaleLine[];halfPrice:boolean;message:string}|{ok:false;reason:string};
/** Rosa's kind line when the ladder lowered a price: "Rosa already has plenty of mangoes today, so they fetch a bit less." */
export function plentyLine(ids:readonly string[]):string{
 const names=ids.map(id=>goodById(id)?.plural.toLowerCase()).filter(Boolean) as string[];if(!names.length)return '';
 const list=names.length===1?names[0]:`${names.slice(0,-1).join(', ')} and ${names[names.length-1]}`;
 return `Rosa already has plenty of ${list} today, so ${names.length===1?'they fetch':'those fetch'} a bit less. Try selling something different!`;
}
const whole=(v:unknown,max=1e9)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
export const emptyMarket=(day=''):MarketState=>({version:1,day,basket:{},soldToday:0,sales:0,lifetime:0});
export function sanitizeMarket(value:unknown,day:string):MarketState{
 const v=value&&typeof value==='object'?value as Partial<MarketState>:{},out=emptyMarket(day);let total=0;
 if(v.basket&&typeof v.basket==='object')for(const [id,n]of Object.entries(v.basket))if(isGood(id)){const c=Math.min(whole(n,BASKET_LIMIT),BASKET_LIMIT-total);if(c>0){out.basket[id]=c;total+=c;}}
 out.soldToday=v.day===day?whole(v.soldToday):0;out.sales=whole(v.sales);out.lifetime=whole(v.lifetime);
 if(v.day===day&&v.byGood&&typeof v.byGood==='object'){const by:Record<string,number>={};for(const [id,n]of Object.entries(v.byGood))if(isGood(id)){const c=whole(n,9999);if(c)by[id]=c;}if(Object.keys(by).length)out.byGood=by;}
 if(v.day===day&&v.tally&&typeof v.tally==='object'){const t:Record<string,number>={};for(const [id,n]of Object.entries(v.tally))if(isGood(id)&&typeof n==='number'&&Number.isFinite(n)&&n>0&&n<1)t[id]=Math.round(n*8)/8;for(const id in t)if(!t[id])delete t[id];if(Object.keys(t).length)out.tally=t;}
 if(Array.isArray(v.granted)){const keys=v.granted.filter((k):k is string=>typeof k==='string'&&k.length>0&&k.length<=80).slice(-GRANT_MEMORY);if(keys.length)out.granted=keys;}
 return out;
}
export const basketCount=(s:MarketState)=>Object.values(s.basket).reduce((a,b)=>a+b,0);
export function addToBasket(s:MarketState,id:string,n=1):{state:MarketState;added:number}{
 if(!isGood(id))return {state:s,added:0};const added=Math.max(0,Math.min(whole(n),BASKET_LIMIT-basketCount(s)));
 return added?{state:{...s,basket:{...s.basket,[id]:(s.basket[id]??0)+added}},added}:{state:s,added:0};
}
export type GrantLine={id:string;count:number};
/**
 * Add a one-off set of goods under a unique `key` (idempotent: a key already granted adds nothing, so a replayed payday or a
 * reload never duplicates it). Adds what fits in the basket; the key is recorded even when the basket is full.
 */
export function grantGoods(s:MarketState,key:string,items:GrantLine[]):{state:MarketState;added:GrantLine[];already:boolean}{
 if(!key||s.granted?.includes(key))return {state:s,added:[],already:true};
 let next=s;const added:GrantLine[]=[];
 for(const it of items){const r=addToBasket(next,it.id,it.count);next=r.state;if(r.added)added.push({id:it.id,count:r.added});}
 return {state:{...next,granted:[...(s.granted??[]),key].slice(-GRANT_MEMORY)},added,already:false};
}
/** How many of this good were sold today. */
export const soldOfGood=(s:MarketState,id:string)=>s.byGood?.[id]??0;
/** What the NEXT item of good `g` is worth now (may be part of a coin): the same-kind ladder, then half past the allowance. */
export function nextUnitValue(s:Pick<MarketState,'soldToday'|'byGood'>,g:Good,extraSold=0,soldCoins=s.soldToday){
 return marketUnitValue(g.price,(s.byGood?.[g.id]??0)+extraSold,soldCoins,ladderExempt(g));
}
/** Whether Rosa already has plenty of this good today (its next one sells below full price because of the ladder). */
export const plentyToday=(s:Pick<MarketState,'byGood'>,g:Good)=>ladderFactor(s.byGood?.[g.id]??0,ladderExempt(g))<1;
export type SaleQuote={lines:SaleLine[];coins:number;halfPrice:boolean;
 /** Goods whose price the same-kind ladder lowered in this sale. */
 plenty:string[];
 /** Today's per-good counts and part-coin tallies after this sale (saved with it). */
 byGood:Record<string,number>;tally:Record<string,number>};
/**
 * Price every item in order: each good's value goes down the same-kind ladder, everything is worth half once today's full-price
 * allowance is used, and part-coins add to the good's tally (whole coins are paid as they fill: "2 for 1 coin"). Selling one at a
 * time or all together pays exactly the same.
 */
export function quoteSale(s:MarketState,kind?:GoodKind):SaleQuote{
 let sold=s.soldToday,coins=0,half=false;const lines:SaleLine[]=[],plenty:string[]=[],byGood={...(s.byGood??{})},tally={...(s.tally??{})};
 for(const g of GOODS){const count=s.basket[g.id]??0;if(!count||kind&&g.kind!==kind)continue;let lineCoins=0,t=tally[g.id]??0;const n0=byGood[g.id]??0;
  for(let i=0;i<count;i++){if(sold>=MARKET_FULL_PRICE_COINS)half=true;if(ladderFactor(n0+i,ladderExempt(g))<1&&!plenty.includes(g.id))plenty.push(g.id);
   const r=payFromTally(t,nextUnitValue(s,g,i,sold));t=r.tally;lineCoins+=r.coins;sold+=r.coins;}
  byGood[g.id]=n0+count;if(t>0)tally[g.id]=t;else delete tally[g.id];
  lines.push({id:g.id,name:count===1?g.name:g.plural,count,coins:lineCoins});coins+=lineCoins;}
 return {lines,coins,halfPrice:half,plenty,byGood,tally};
}
/** The state with a quote's per-good counts and tallies (empty maps dropped, so old-shaped saves stay old-shaped). */
export function withTallies(s:MarketState,q:Pick<SaleQuote,'byGood'|'tally'>):MarketState{
 const {byGood:_b,tally:_t,...rest}=s,next:MarketState={...rest};if(Object.keys(q.byGood).length)next.byGood=q.byGood;if(Object.keys(q.tally).length)next.tally=q.tally;return next;
}
export function localMarketDay(now=Date.now()){const d=new Date(now);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
type Ports={read:()=>unknown;write:(v:MarketState)=>void;credit:(id:string,amount:number,reason:string)=>Promise<number>;now?:()=>number};
export function createMarket(ports:Ports){
 const now=ports.now??(()=>Date.now()),listeners=new Set<()=>void>();let snapshot:MarketState|null=null;
 const load=()=>{let raw:unknown=null;try{raw=ports.read();}catch{}return sanitizeMarket(raw,localMarketDay(now()));};
 const save=(s:MarketState)=>{snapshot=s;try{ports.write(s);}catch{}listeners.forEach(f=>f());return s;};
 const read=()=>{const day=localMarketDay(now());if(!snapshot||snapshot.day!==day)snapshot=load();return snapshot;};
 function gather(id:string,n=1){const r=addToBasket(load(),id,n);if(r.added)save(r.state);return r.added;}
 /** One-off goods (a job's share) under a unique key; see grantGoods. Returns what was actually added. */
 function grant(key:string,items:GrantLine[]){const r=grantGoods(load(),key,items);if(!r.already)save(r.state);return r.added;}
 /** Take goods back out of the basket (eating a banana from the island pocket refuels: lib/town/fuel.ts). Returns how many. */
 function take(id:string,n=1){const s=load(),have=s.basket[id]??0,k=Math.min(have,Math.max(0,Math.floor(n)));if(!k)return 0;
  const basket={...s.basket};if(have-k>0)basket[id]=have-k;else delete basket[id];save({...s,basket});return k;}
 async function sell(kind?:GoodKind):Promise<SaleResult>{
  const s=load(),q=quoteSale(s,kind);if(!q.lines.length)return {ok:false,reason:'Your basket is empty. Gather something first!'};
  const basket={...s.basket};for(const l of q.lines)delete basket[l.id];
  const sale=s.sales+1,next=save(withTallies({...s,basket,soldToday:s.soldToday+q.coins,sales:sale,lifetime:s.lifetime+q.coins},q));
  // A sale worth under a coin (its value went on Rosa's tally) pays nothing now: no wallet run.
  const credited=q.coins?await ports.credit(`market:${next.day}:${sale}`,q.coins,`Farmers market · ${q.lines.map(l=>`${l.count} ${l.name}`).join(', ')}`.slice(0,110)):0;
  const message=(q.plenty.length?plentyLine(q.plenty)+' ':'')+(next.soldToday>=MARKET_FULL_PRICE_COINS?'Great trading today! More sales today earn half price; prices reset tomorrow.':'Full prices all day until you have sold '+MARKET_FULL_PRICE_COINS+' coins of goods.');
  return {ok:true,coins:q.coins,credited,lines:q.lines,halfPrice:q.halfPrice,message};
 }
 return {read,gather,grant,take,sell,quote:(kind?:GoodKind)=>quoteSale(read(),kind),refresh:()=>{snapshot=null;listeners.forEach(f=>f());},subscribe:(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};}};
}
export type {Good};
export {goodById};
