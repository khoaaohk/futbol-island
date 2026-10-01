import {PLAYER_BOOKS,STARTER_BOOKS} from '../books/catalog';
import {CARD_ENTRIES} from './cardCollection';
import {getCostume} from './costumes';
import {getIslandCostume} from './islandCostumes';
import {STORE_ITEMS,type StoreCategory} from './store';
import {VENDING_SPECIALS} from './vendingCatalog';
import {VENDING_STARTERS} from './vendingLedger';
import {consumable} from '../konbini/food';

/**
 * Backpack (user, Sep 28 2026: "Make it yours → Backpack shows everything you own"). Pure model; browser wiring in
 * backpackStore.ts, UI in components/Backpack.tsx, tests in tests/backpack.cjs.
 *
 * The backpack is a VIEW, not a second ledger. Every item is derived from the ownership source that already exists:
 *  - gear (balls, rides), island animals and home items: the vending ledger (vendingWallet.ts, incl. its free starters);
 *  - player cards: the card collection (cardCollection.ts CARD_STORAGE_KEY), packs from the arcade wallet date them;
 *  - pop-up books: the vending ledger (each book's `itemId`) or the one-time starter kit.
 * The only thing the backpack stores itself (BACKPACK_KEY) is the starter-kit receipt (so the kit is granted once per save and
 * never again, even after a starter card is sold at the market) and which items the player has already seen ("New" badges).
 *
 * Scalable: each item kind is a registered category (label, order, empty hint, `collect`). A new kind plugs in with
 * registerBackpackCategory() here and an art/action renderer in components/Backpack.tsx; nothing else changes.
 */
export type BackpackKind='book'|'card'|'ride'|'ball'|'costume'|'display'|(string&{});
export type BackpackSource='starter'|'bought'|'reward';
export type BackpackItem={
 /** Unique across kinds: the vending id for gear/costumes/home items (`scooter:classic`), `book:<id>`, `card:<name>`. */
 id:string;kind:BackpackKind;
 /** The id inside its own system: a PlayerBookId, a card name, a vending/store id. */
 ref:string;label:string;
 /** One short teaching line (a card's position, a ride's category…). */
 detail?:string;source:BackpackSource;
 /** ms epoch; 0 when the source has no date (old saves, free starters). */
 acquiredAt:number;
};
/** Everything the categories read. The browser store fills it from the live ownership stores; tests pass plain data. */
export type BackpackSources={
 /** Vending-owned ids (ledger `owned`); free starters are added by the model. */
 owned:readonly string[];
 /** Vending purchase history (id + time). */
 history:readonly {id:string;at:number}[];
 /** Cards in this device's collection. */
 cards:readonly string[];
 /** Card packs opened (arcade wallet). */
 packs:readonly {cards?:string[];player:string;at:number}[];
 starter:StarterReceipt|null;
 /** Konbini (Sep 29 2026): snacks saved in the Snacks pouch, and the Konbini Collection (lib/konbini/foodStore.ts). */
 snacks?:readonly {id:string;item:string;at:number}[];konbini?:{items:Readonly<Record<string,number>>};
 /** Lane 2 (Sep 30 2026): graduation certificates for the Trophy shelf (lib/endgame/backpackTrophies.ts). */
 trophies?:readonly {id:string;label:string;detail:string;at:number}[];
};
export type BackpackCategory={kind:BackpackKind;label:string;order:number;
 /** Where to get more (shown when the category is empty, and under its heading). */
 emptyHint:string;
 /** Why it matters for football (one line under the heading). */
 lesson:string;
 collect:(sources:BackpackSources)=>BackpackItem[]};
export type BackpackGroup={kind:BackpackKind;label:string;lesson:string;emptyHint:string;items:BackpackItem[]};

// ---- Starter kit ----------------------------------------------------------------------------------------------------------
/** The island intro pop-up book (lib/books/catalog.ts id `island`, listed in its STARTER_BOOKS). */
export const STARTER_BOOK:string=STARTER_BOOKS[0]??'island';
/** Three starter cards, fixed (never drawn at random) so every save starts the same: the spine of a team, one standard-tier
 *  current player each: a goalkeeper, a playmaking midfielder and a striker (tests/backpack.cjs checks the roles). */
export const STARTER_CARDS=['Mary Earps','Martin Ødegaard','Ada Hegerberg'] as const;
/** The base ride in every ride category. They are the vending ledger's free starters (VENDING_STARTERS) and need no path
 *  (rideUnlocks.ts pathsNeeded = 0), so they are owned and usable already; the kit only labels them as starter gear. */
export const STARTER_RIDES=['scooter:classic','bike:classic','moped:classic','jetpack:classic'] as const;
export const STARTER_KIT_IDS:readonly string[]=[`book:${STARTER_BOOK}`,...STARTER_CARDS.map(n=>`card:${n}`),...STARTER_RIDES];
export type StarterReceipt={at:number;book:string;cards:string[]};
export type BackpackState={version:1;starter:StarterReceipt|null;seen:string[]};
export const emptyBackpack=():BackpackState=>({version:1,starter:null,seen:[]});
const text=(v:unknown,max=160):v is string=>typeof v==='string'&&v.length>0&&v.length<=max;
const MAX_SEEN=4000;
export function sanitizeBackpack(raw:unknown):BackpackState{
 if(!raw||typeof raw!=='object')return emptyBackpack();const v=raw as Partial<BackpackState>;if(v.version!==1)return emptyBackpack();
 const s=v.starter as Partial<StarterReceipt>|null|undefined;
 const starter:StarterReceipt|null=s&&typeof s==='object'&&Number.isFinite(Number(s.at))&&Number(s.at)>0?{at:Math.floor(Number(s.at)),book:text(s.book,60)?s.book:STARTER_BOOK,
  cards:[...new Set(Array.isArray(s.cards)?s.cards.filter((n:unknown):n is string=>text(n,80)):[])].slice(0,12)}:null;
 const seen=[...new Set(Array.isArray(v.seen)?v.seen.filter((id:unknown):id is string=>text(id)):[])].slice(-MAX_SEEN);
 return {version:1,starter,seen};
}
/** Adds ids to `seen` (no-op → same object, so callers can skip the write). */
export function markSeen(state:BackpackState,ids:Iterable<string>):BackpackState{
 const seen=new Set(state.seen),before=seen.size;for(const id of ids)if(text(id))seen.add(id);
 return seen.size===before?state:{...state,seen:[...seen].slice(-MAX_SEEN)};
}
/**
 * Grant plan: what the starter kit still has to do. `null` once granted (idempotent). The first grant also marks everything the
 * player ALREADY owns as seen, so an existing save only sees the kit (and later arrivals) as New, never its whole history.
 */
export function planStarterKit(state:BackpackState,sources:BackpackSources,now:number):{state:BackpackState;addCards:string[]}|null{
 if(state.starter)return null;
 const have=new Set(sources.cards),addCards=STARTER_CARDS.filter(n=>!have.has(n));
 const kit=new Set(STARTER_KIT_IDS),before=allItems({...sources,starter:null}).map(i=>i.id).filter(id=>!kit.has(id));
 return {state:markSeen({...state,starter:{at:now,book:STARTER_BOOK,cards:[...addCards]}},before),addCards};
}

// ---- Category registry ----------------------------------------------------------------------------------------------------
const REGISTRY=new Map<string,BackpackCategory>();
/** Register (or replace) a category. Order decides the section order. */
export function registerBackpackCategory(category:BackpackCategory){REGISTRY.set(category.kind,category);}
export function backpackCategories():BackpackCategory[]{return [...REGISTRY.values()].sort((a,b)=>a.order-b.order);}
export const backpackCategory=(kind:string)=>REGISTRY.get(kind);
const ownedSet=(s:BackpackSources)=>new Set([...VENDING_STARTERS,...s.owned]);
const boughtAt=(s:BackpackSources)=>{const m=new Map<string,number>();for(const h of s.history)if(!m.has(h.id))m.set(h.id,h.at);return m;};
const newestFirst=(a:BackpackItem,b:BackpackItem)=>b.acquiredAt-a.acquiredAt;
/** Vending-owned gear of some store categories, starter first then by purchase time. */
function gear(s:BackpackSources,categories:StoreCategory[],kind:BackpackKind,detail:(c:StoreCategory)=>string):BackpackItem[]{
 const owned=ownedSet(s),at=boughtAt(s),kit=new Set<string>(STARTER_RIDES);
 return STORE_ITEMS.filter(i=>categories.includes(i.category)&&owned.has(i.id)).map(i=>{
  const starter=VENDING_STARTERS.has(i.id);
  return {id:i.id,kind,ref:i.id,label:i.option.label,detail:detail(i.category),source:starter?'starter' as const:at.has(i.id)?'bought' as const:'reward' as const,
   acquiredAt:starter?(kit.has(i.id)?s.starter?.at??0:0):at.get(i.id)??0};
 }).sort((a,b)=>Number(b.source==='starter')-Number(a.source==='starter')||categories.indexOf(a.ref.split(':')[0] as StoreCategory)-categories.indexOf(b.ref.split(':')[0] as StoreCategory)||a.acquiredAt-b.acquiredAt);
}
type BookMeta={itemId?:string;title:string;player?:string};
const BOOK_META=PLAYER_BOOKS as unknown as Record<string,BookMeta>;
/** Whether a book id can open in the reader (its entry is in lib/books/catalog.ts). */
export const bookReadable=(id:string)=>Object.prototype.hasOwnProperty.call(BOOK_META,id);
export const bookTitle=(id:string)=>BOOK_META[id]?.title??(id===STARTER_BOOK?'Welcome to Futbol Island':id);
const RIDE_DETAIL:Record<string,string>={scooter:'Scooter',bike:'Bike',moped:'Moped',jetpack:'Flight'};

registerBackpackCategory({kind:'book',label:'Books',order:10,
 lesson:'Pop-up books tell true football stories, each with one idea to take into your next game.',
 emptyHint:'Each vending machine sells one player’s pop-up book in its Specials row.',
 collect:s=>{
  const owned=ownedSet(s),at=boughtAt(s),out:BackpackItem[]=[];
  // Starter books (catalog.ts STARTER_BOOKS, the island intro book) belong to every player; the receipt dates them.
  const starters=new Set<string>([...STARTER_BOOKS,...(s.starter?[s.starter.book]:[])]);
  for(const id of starters)out.push({id:`book:${id}`,kind:'book',ref:id,label:bookTitle(id),detail:'Starter book',source:'starter',acquiredAt:s.starter?.at??0});
  for(const [id,meta] of Object.entries(BOOK_META)){if(out.some(i=>i.ref===id)||!meta.itemId||!owned.has(meta.itemId))continue;
   out.push({id:`book:${id}`,kind:'book',ref:id,label:meta.title,detail:meta.player,source:at.has(meta.itemId)?'bought':'reward',acquiredAt:at.get(meta.itemId)??0});}
  return out;
 }});
registerBackpackCategory({kind:'card',label:'Player cards',order:20,
 lesson:'Every card teaches a position: what that player does for the team.',
 emptyHint:'Earn cards on Paths, in the ball hunt and in chats, or buy packs at the vending machines.',
 collect:s=>{
  const entries=new Map(CARD_ENTRIES.map(c=>[c.name,c])),kit=new Set(s.starter?.cards??[]),packAt=new Map<string,number>();
  for(const p of s.packs)for(const n of p.cards??[p.player])if(!packAt.has(n))packAt.set(n,p.at);
  return [...new Set(s.cards)].filter(n=>entries.has(n)).map(n=>{const c=entries.get(n)!;const source:BackpackSource=kit.has(n)?'starter':packAt.has(n)?'bought':'reward';
   return {id:`card:${n}`,kind:'card',ref:n,label:n.replace(/ \(coach\)$/,''),detail:c.roleLabel,source,acquiredAt:source==='starter'?s.starter!.at:packAt.get(n)??0};})
   // Stored order is the order collected; newest first, the starter three together.
   .map((item,index)=>({item,index})).sort((a,b)=>b.index-a.index).map(x=>x.item);
 }});
registerBackpackCategory({kind:'ride',label:'Rides',order:30,
 lesson:'Rides get you to every pitch on the island. Hop off to play: football is always on foot.',
 emptyHint:'Finish a path to unlock the next ride, then buy it at any vending machine.',
 collect:s=>gear(s,['scooter','bike','moped','jetpack'],'ride',c=>RIDE_DETAIL[c])});
registerBackpackCategory({kind:'ball',label:'Balls',order:40,
 lesson:'Your dribbling ball. Futsal, beach and retro balls each tell how the game is played there.',
 emptyHint:'Buy balls at the vending machines; each machine also sells one special ball.',
 collect:s=>gear(s,['ball'],'ball',()=>'Ball')});
registerBackpackCategory({kind:'costume',label:'Island animals',order:50,
 lesson:'Each animal is a club mascot, with the real story of the club behind it.',
 emptyHint:'Find hidden balls to unlock island animals, then buy them at a vending machine.',
 collect:s=>{const at=boughtAt(s);return s.owned.filter(id=>id.startsWith('costume:')&&id!=='costume:none').map(id=>{const c=id.slice(8),island=getIslandCostume(c),club=getCostume(c);
  return {id,kind:'costume',ref:c,label:island.name,detail:club?club.club:island.animalLabel,source:at.has(id)?'bought' as const:'reward' as const,acquiredAt:at.get(id)??0};}).sort(newestFirst);}});
// Konbini (Sep 29 2026): the Snacks pouch (up to 3 bought snacks, eaten from here) and the permanent Konbini Collection. The
// collection section renders its own page (components/KonbiniCollection.tsx: groups by store, silhouettes, replayable reveals).
registerBackpackCategory({kind:'snack',label:'Snacks',order:60,
 lesson:'Food is fuel: a rice snack an hour or two before training gives your legs energy. Tap a snack to eat it.',
 emptyHint:'Buy a snack at a Konbini and save it to your Snacks pouch (it holds 3).',
 collect:s=>(s.snacks??[]).map(p=>({id:`snack:${p.id}`,kind:'snack',ref:`${p.id}|${p.item}`,label:consumable(p.item)?.label??p.item,detail:/^drink-/.test(p.item)?'Tap to drink':'Tap to eat',source:'bought' as const,acquiredAt:p.at}))});
registerBackpackCategory({kind:'konbini',label:'Konbini Collection',order:70,
 lesson:'Every Konbini sells its own snacks. Try them all: each one teaches how food fuels football.',
 emptyHint:'Buy something at a Konbini to start your collection. Each store has its own menu.',
 collect:s=>Object.entries(s.konbini?.items??{}).map(([id,at])=>({id:`konbini:${id}`,kind:'konbini',ref:id,label:consumable(id)?.label??id,detail:consumable(id)?.jp,source:'bought' as const,acquiredAt:at})).sort(newestFirst)});
// Home items (prints, lamps, trophies) are no longer sold, so there is no Home items category; vending displays are books.


/** Every item in every registered category (section order). */
export function allItems(sources:BackpackSources):BackpackItem[]{return backpackCategories().flatMap(c=>c.collect(sources));}
/** The backpack as sections, empty ones included (they show where to get more). */
export function buildBackpack(sources:BackpackSources):BackpackGroup[]{
 return backpackCategories().map(c=>({kind:c.kind,label:c.label,lesson:c.lesson,emptyHint:c.emptyHint,items:c.collect(sources)}));
}
