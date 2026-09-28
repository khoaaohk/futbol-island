/**
 * Farmers-market basket and selling rules, shared by the community garden (island jobs) and fishing.
 * Pure core (createMarket) + browser storage. Coins are paid through an injected `credit` port (see
 * lib/town/jobs/islandWallet.ts), so the market never touches the arcade wallet's internals.
 * Kid-safe: fixed prices, no odds, no haggling timers; a gentle daily soft cap halves prices after
 * MARKET_FULL_PRICE_COINS coins of sales in a day and resets at local midnight.
 */
import {GOODS,goodById,isGood,type Good,type GoodKind} from './goods';
export const MARKET_STORAGE_KEY='fi2-market-v1';
export const BASKET_LIMIT=20;
export const MARKET_FULL_PRICE_COINS=40;
export type MarketState={version:1;day:string;basket:Record<string,number>;soldToday:number;sales:number;lifetime:number};
export type SaleLine={id:string;name:string;count:number;coins:number};
export type SaleResult={ok:true;coins:number;credited:number;lines:SaleLine[];halfPrice:boolean;message:string}|{ok:false;reason:string};
const whole=(v:unknown,max=1e9)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
export const emptyMarket=(day=''):MarketState=>({version:1,day,basket:{},soldToday:0,sales:0,lifetime:0});
export function sanitizeMarket(value:unknown,day:string):MarketState{
 const v=value&&typeof value==='object'?value as Partial<MarketState>:{},out=emptyMarket(day);let total=0;
 if(v.basket&&typeof v.basket==='object')for(const [id,n]of Object.entries(v.basket))if(isGood(id)){const c=Math.min(whole(n,BASKET_LIMIT),BASKET_LIMIT-total);if(c>0){out.basket[id]=c;total+=c;}}
 out.soldToday=v.day===day?whole(v.soldToday):0;out.sales=whole(v.sales);out.lifetime=whole(v.lifetime);return out;
}
export const basketCount=(s:MarketState)=>Object.values(s.basket).reduce((a,b)=>a+b,0);
export function addToBasket(s:MarketState,id:string,n=1):{state:MarketState;added:number}{
 if(!isGood(id))return {state:s,added:0};const added=Math.max(0,Math.min(whole(n),BASKET_LIMIT-basketCount(s)));
 return added?{state:{...s,basket:{...s.basket,[id]:(s.basket[id]??0)+added}},added}:{state:s,added:0};
}
/** Price every item in order; items after the day's full-price allowance earn half (at least 1 coin). */
export function quoteSale(s:MarketState,kind?:GoodKind):{lines:SaleLine[];coins:number;halfPrice:boolean}{
 let sold=s.soldToday,coins=0,half=false;const lines:SaleLine[]=[];
 for(const g of GOODS){const count=s.basket[g.id]??0;if(!count||kind&&g.kind!==kind)continue;let lineCoins=0;
  for(let i=0;i<count;i++){const p=sold>=MARKET_FULL_PRICE_COINS?Math.max(1,Math.floor(g.price/2)):g.price;if(sold>=MARKET_FULL_PRICE_COINS)half=true;lineCoins+=p;sold+=p;}
  lines.push({id:g.id,name:count===1?g.name:g.plural,count,coins:lineCoins});coins+=lineCoins;}
 return {lines,coins,halfPrice:half};
}
export function localMarketDay(now=Date.now()){const d=new Date(now);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
type Ports={read:()=>unknown;write:(v:MarketState)=>void;credit:(id:string,amount:number,reason:string)=>Promise<number>;now?:()=>number};
export function createMarket(ports:Ports){
 const now=ports.now??(()=>Date.now()),listeners=new Set<()=>void>();let snapshot:MarketState|null=null;
 const load=()=>{let raw:unknown=null;try{raw=ports.read();}catch{}return sanitizeMarket(raw,localMarketDay(now()));};
 const save=(s:MarketState)=>{snapshot=s;try{ports.write(s);}catch{}listeners.forEach(f=>f());return s;};
 const read=()=>{const day=localMarketDay(now());if(!snapshot||snapshot.day!==day)snapshot=load();return snapshot;};
 function gather(id:string,n=1){const r=addToBasket(load(),id,n);if(r.added)save(r.state);return r.added;}
 async function sell(kind?:GoodKind):Promise<SaleResult>{
  const s=load(),q=quoteSale(s,kind);if(!q.coins)return {ok:false,reason:'Your basket is empty. Gather something first!'};
  const basket={...s.basket};for(const l of q.lines)delete basket[l.id];
  const sale=s.sales+1,next=save({...s,basket,soldToday:s.soldToday+q.coins,sales:sale,lifetime:s.lifetime+q.coins});
  const credited=await ports.credit(`market:${next.day}:${sale}`,q.coins,`Farmers market · ${q.lines.map(l=>`${l.count} ${l.name}`).join(', ')}`.slice(0,110));
  const message=next.soldToday>=MARKET_FULL_PRICE_COINS?'Great trading today! More sales today earn half price; prices reset tomorrow.':'Full prices all day until you have sold '+MARKET_FULL_PRICE_COINS+' coins of goods.';
  return {ok:true,coins:q.coins,credited,lines:q.lines,halfPrice:q.halfPrice,message};
 }
 return {read,gather,sell,quote:(kind?:GoodKind)=>quoteSale(read(),kind),refresh:()=>{snapshot=null;listeners.forEach(f=>f());},subscribe:(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};}};
}
export type {Good};
export {goodById};
