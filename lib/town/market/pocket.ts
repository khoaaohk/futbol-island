/**
 * The island pocket's basket model (Sep 30 2026, user: "Make sure the fruits, veggies and fish items you have correctly show in
 * your island pocket"). Pure: UI in components/IslandBalanceDrawer.tsx, tests in tests/island-pocket.cjs.
 *
 * The pocket is a VIEW of the shared farmers-market basket (./market.ts), never a second ledger: every good in ./goods.ts
 * (garden produce, Coral Cay Harvest day produce and every fish, incl. the Deep Sea Boat and East Jetty catches) is read
 * generically from the registry, so a new good shows up here with no edit. Garden and farm produce share the same good ids
 * (an orange is an orange), so they merge into one row and are never counted twice.
 *
 * Scope: fish + fruit + veggies in the basket (sold at Rosa's market stand or the Coral Cay farm stand). Snacks from the
 * Konbini, cards and gear live in the Backpack (lib/town/backpack.ts), not here.
 */
import {GOODS,type Good,type GoodKind} from './goods';
import {BASKET_LIMIT,MARKET_FULL_PRICE_COINS,basketCount,quoteSale,type MarketState} from './market';

export type PocketCategory='fish'|'fruit'|'veg';
/**
 * Fruit vs veggies (kitchen sense, the way a kid sorts a lunchbox: tomatoes and peppers are veggies). A good may carry its own
 * optional `category` ('fruit'|'veg'); otherwise this list decides, and any other produce counts as veggies. The list already
 * names the tropical fruit Coral Cay may grow, so they land in Fruit the day they are added to goods.ts.
 */
export const FRUIT_IDS:ReadonlySet<string>=new Set(['orange','cherry','strawberry','banana','mango','pineapple','coconut','papaya',
 'melon','watermelon','guava','passion-fruit','lime','lemon','apple','pear','peach','plum','grape','grapes','kiwi','blueberry','raspberry','lychee','avocado']);
export function pocketCategory(g:Good):PocketCategory{
 if(g.kind==='fish')return 'fish';
 const own=(g as Good&{category?:unknown}).category;
 if(own==='fruit'||own==='veg')return own;
 return FRUIT_IDS.has(g.id)?'fruit':'veg';
}
export const POCKET_LABEL:Record<PocketCategory,string>={fish:'Fish',fruit:'Fruit',veg:'Veggies'};

/** Coins one more item of `g` fetches right now (the stand's rule: full price, then half after today's allowance, at least 1). */
const each=(s:MarketState,g:Good)=>s.soldToday>=MARKET_FULL_PRICE_COINS?Math.max(1,Math.floor(g.price/2)):g.price;
/** What these goods would fetch if sold together now (same order and soft cap as the stand's "Sell all"). */
const worth=(s:MarketState,ids:readonly string[])=>{const basket:Record<string,number>={};for(const id of ids)if(s.basket[id])basket[id]=s.basket[id];return quoteSale({...s,basket}).coins;};

export type PocketRow={id:string;good:Good;category:PocketCategory;count:number;name:string;each:number;value:number};
export type PocketGroup={category:PocketCategory;label:string;rows:PocketRow[];count:number;value:number};
export type PocketView={
 fish:PocketGroup;fruit:PocketGroup;veg:PocketGroup;
 /** The HUD coins-bar counters: fish, and fruit + veggies together. */
 hud:{fish:number;produce:number};
 total:number;limit:number;full:boolean;value:number;
};

/** The HUD counter rule (components/IslandJobs.tsx `useBasket`): every basket good of that kind, by the registry. */
export function hudCount(s:MarketState,kind:GoodKind){return GOODS.reduce((n,g)=>n+(g.kind===kind?s.basket[g.id]??0:0),0);}

export function pocketView(s:MarketState):PocketView{
 const rows:PocketRow[]=[];
 for(const g of GOODS){const count=s.basket[g.id]??0;if(count<1)continue;
  rows.push({id:g.id,good:g,category:pocketCategory(g),count,name:count===1?g.name:g.plural,each:each(s,g),value:worth(s,[g.id])});}
 const group=(category:PocketCategory):PocketGroup=>{const list=rows.filter(r=>r.category===category);
  return {category,label:POCKET_LABEL[category],rows:list,count:list.reduce((n,r)=>n+r.count,0),value:worth(s,list.map(r=>r.id))};};
 const fish=group('fish'),fruit=group('fruit'),veg=group('veg'),total=basketCount(s);
 return {fish,fruit,veg,hud:{fish:hudCount(s,'fish'),produce:hudCount(s,'produce')},total,limit:BASKET_LIMIT,full:total>=BASKET_LIMIT,value:quoteSale(s).coins};
}
