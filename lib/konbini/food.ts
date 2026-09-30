/**
 * Konbini to-go food (user, Sep 29 2026: "allow buying different types of Japanese to-go items, like different variations of spam
 * musubis"; "each Konbini has unique items and you can try to buy them all and add to the backpack"). Pure rules; browser wiring
 * in foodStore.ts, layered art in foodArt.ts, tests in tests/konbini.cjs, prices and reasoning in
 * docs/economy/ECONOMY_UPDATE_2026-09-29.md §7.
 *
 * - Food is CONSUMABLE and repeat-purchasable: every purchase is its own idempotent wallet spend `konbini:food:<item>:<purchase id>`
 *   (the arcade wallet's spend() never charges the same id twice, so a double tap or a retry can't double-charge). Nothing here
 *   uses the vending ledger's owned-once rule.
 * - Cheap everyday coin sink (3–11 coins; a casual player earns ~81 a day, books cost 100) with a daily "tummy full" limit of
 *   FOOD_PER_DAY items, so food never competes with books or learning rewards.
 * - Each Konbini sells its own menu (a couple of staples are in both). The first purchase of each item joins the permanent
 *   Konbini Collection (its own save key); finishing a Konbini's set, and then both, pays a small one-off learning reward.
 * - Every food teaches one football-nutrition line (the same sources as the Coral Cay farm, lib/town/coralCayNpcs.ts):
 *   carbohydrate = energy before training, protein = recovery after, water first for hydration, sweets = an occasional treat.
 *   Positive, food as fuel; no diet rules and nothing about weight.
 * - No gameplay perk (decision): a paid stamina boost would be pay-to-win for coins, so eating is a lesson plus a bite animation.
 */
export type KonbiniShop='main'|'cay';
export type FoodGroup='carb'|'protein'|'hydration'|'treat'|'balanced';
export type FoodSection='musubi'|'onigiri'|'sando'|'hot'|'bento'|'sweets'|'drinks';
/**
 * STABLE API (Sep 29 2026) for other features that sell consumables the same way (e.g. the outdoor drink machines):
 *  - `Consumable` + `registerConsumables(items)`: repeat-purchasable items with their own price, nutrition note and daily limit key;
 *  - `buy()` on the ledger (foodStore.buyConsumable in the browser): repeat-safe wallet key `konbini:food:<item>:<purchase id>`,
 *    the daily limit per `limit.key`, then the Snacks pouch via `resolve(id,'pouch')`;
 *  - `registerCollectionGroup(group)` + collection `collect()`: a group of items on the backpack's Konbini Collection page.
 *  - Reveal art: `FoodLayer[]` (foodArt.ts) shown by components/KonbiniReveal.tsx.
 */
export type Consumable={id:string;label:string;
 /** Japanese name in kana/kanji (common konbini/menu spelling). */
 jp?:string;price:number;group:FoodGroup;
 /** One-line description on the shelf tag and the reveal. */
 blurb:string;
 /** A item-specific nutrition line; otherwise FOOD_NOTES[group]. */
 note?:string;
 /** Daily limit bucket (default: the shared food limit, FOOD_PER_DAY). */
 limit?:{key:string;perDay:number}};
export type FoodItem=Consumable&{jp:string;section:FoodSection;shops:KonbiniShop[];
 /** Atlas cell (lib/konbini/konbiniAtlas.ts). */
 cell:number};

export const FOOD_PER_DAY=3;
export const POUCH_SIZE=3;
export const FUELLED_UP="You're fuelled up for today! Come back tomorrow for another snack.";
export const SHOP_NAMES:Record<KonbiniShop,string>={main:'Island Square Konbini',cay:'Coral Cay Konbini'};

export const FOOD_SECTIONS:{id:FoodSection;label:string}[]=[
 {id:'musubi',label:'Spam musubi'},{id:'onigiri',label:'Onigiri'},{id:'sando',label:'Sandos'},{id:'hot',label:'Hot counter'},
 {id:'bento',label:'Bento'},{id:'sweets',label:'Sweets'},{id:'drinks',label:'Drinks'},
];
const M:KonbiniShop[]=['main'],C:KonbiniShop[]=['cay'],B:KonbiniShop[]=['main','cay'];
// "Spam musubi" is the dish's common name; the art is a generic slice of luncheon meat, never the can or its logo.
export const FOOD_MENU:FoodItem[]=[
 // Island Square: the classic konbini case.
 {id:'musubi-classic',label:'Classic Spam musubi',jp:'スパムむすび',section:'musubi',price:5,group:'carb',shops:M,blurb:'Rice, a grilled slice of luncheon meat and a nori wrap.',cell:0},
 {id:'musubi-tamago',label:'Tamago Spam musubi',jp:'たまごスパムむすび',section:'musubi',price:6,group:'carb',shops:M,blurb:'With a layer of sweet rolled egg.',cell:1},
 {id:'musubi-furikake',label:'Furikake Spam musubi',jp:'ふりかけスパムむすび',section:'musubi',price:5,group:'carb',shops:M,blurb:'Rice sprinkled with sesame and seaweed.',cell:3},
 {id:'onigiri-salmon',label:'Salmon onigiri',jp:'鮭おにぎり',section:'onigiri',price:4,group:'carb',shops:M,blurb:'A rice triangle with flaked salmon.',cell:6},
 {id:'onigiri-tuna',label:'Tuna-mayo onigiri',jp:'ツナマヨおにぎり',section:'onigiri',price:4,group:'carb',shops:M,blurb:'Creamy tuna in the middle.',cell:7},
 {id:'onigiri-ume',label:'Umeboshi onigiri',jp:'梅おにぎり',section:'onigiri',price:3,group:'carb',shops:M,blurb:'A tangy pickled plum inside.',cell:8},
 {id:'onigiri-kombu',label:'Kombu onigiri',jp:'昆布おにぎり',section:'onigiri',price:3,group:'carb',shops:M,blurb:'Sweet-savoury simmered seaweed.',cell:9},
 {id:'sando-tamago',label:'Tamago sando',jp:'たまごサンド',section:'sando',price:5,group:'protein',shops:M,blurb:'Soft bread with a creamy egg filling.',cell:10},
 {id:'hot-karaage',label:'Karaage',jp:'からあげ',section:'hot',price:6,group:'protein',shops:M,blurb:'Crispy Japanese fried chicken bites.',cell:12},
 {id:'hot-nikuman',label:'Nikuman',jp:'肉まん',section:'hot',price:5,group:'balanced',shops:M,blurb:'A fluffy steamed bun with a savoury filling, from the steamer case.',cell:13},
 {id:'hot-oden',label:'Oden skewer',jp:'おでん',section:'hot',price:5,group:'balanced',shops:M,blurb:'Egg, radish and fish cake from the simmering pot.',cell:14},
 {id:'bento-small',label:'Island bento',jp:'弁当',section:'bento',price:10,group:'balanced',shops:M,blurb:'Rice, chicken, egg and vegetables in one box.',cell:15},
 {id:'sweet-melonpan',label:'Melon pan',jp:'メロンパン',section:'sweets',price:4,group:'treat',shops:M,blurb:'A sweet bun with a crunchy cookie top.',cell:16},
 {id:'sweet-daifuku',label:'Daifuku',jp:'大福',section:'sweets',price:4,group:'treat',shops:M,blurb:'Soft mochi with a sweet bean filling.',cell:17},
 {id:'hot-yakiimo',label:'Yaki imo',jp:'焼き芋',section:'hot',price:4,group:'carb',shops:M,blurb:'A whole sweet potato, slow-roasted on hot stones.',cell:52,
  note:'Sweet potato is a slow-release carbohydrate: steady energy for a long training session.'},
 {id:'hot-cupnoodles',label:'Cup noodles',jp:'カップ麺',section:'hot',price:5,group:'treat',shops:M,blurb:'Noodles, egg, shrimp and green onion. Add hot water at the counter!',cell:53,
  note:'A warm cup after a cold, rainy session is a fine treat. Water and real meals with rice, protein and vegetables come first.'},
 {id:'drink-greentea',label:'Green tea',jp:'緑茶',section:'drinks',price:3,group:'hydration',shops:M,blurb:'Unsweetened bottled green tea.',cell:19},
 {id:'drink-milk',label:'Milk',jp:'牛乳',section:'drinks',price:3,group:'protein',shops:M,blurb:'A small carton of cold milk.',cell:21},
 // Coral Cay: the special musubis and a tropical, Hawaiian-leaning case.
 {id:'musubi-teriyaki',label:'Teriyaki Spam musubi',jp:'照り焼きスパムむすび',section:'musubi',price:6,group:'carb',shops:C,blurb:'Glazed with a shiny teriyaki sauce.',cell:2},
 {id:'musubi-katsu',label:'Katsu Spam musubi',jp:'カツスパムむすび',section:'musubi',price:7,group:'carb',shops:C,blurb:'A crispy golden crumb on the slice.',cell:4},
 {id:'musubi-double',label:'Double-decker Spam musubi',jp:'ダブルスパムむすび',section:'musubi',price:8,group:'carb',shops:C,blurb:'Two slices and two layers of rice.',cell:5},
 {id:'sando-tropical',label:'Tropical fruit sando',jp:'フルーツサンド',section:'sando',price:6,group:'treat',shops:C,blurb:'Mango, pineapple and cream in soft bread.',cell:11},
 {id:'bento-locomoco',label:'Loco moco bento',jp:'ロコモコ弁当',section:'bento',price:11,group:'balanced',shops:C,blurb:'Rice, a small patty, gravy and an egg, with salad.',cell:23},
 {id:'sweet-mangomochi',label:'Mango mochi',jp:'マンゴー大福',section:'sweets',price:5,group:'treat',shops:C,blurb:'Soft mochi wrapped around sweet mango.',cell:44},
 {id:'sweet-dorayaki',label:'Dorayaki',jp:'どら焼き',section:'sweets',price:4,group:'treat',shops:C,blurb:'Two fluffy pancakes around sweet red bean paste.',cell:54},
 {id:'sweet-malasada',label:'Malasada',jp:'マラサダ',section:'sweets',price:5,group:'treat',shops:C,blurb:'A sugary island doughnut, fresh and fluffy.',cell:45},
 {id:'drink-pineapple',label:'Pineapple juice',jp:'パイナップルジュース',section:'drinks',price:4,group:'treat',shops:C,blurb:'A little carton of pineapple juice.',cell:22},
 {id:'drink-coconut',label:'Coconut water',jp:'ココナッツウォーター',section:'drinks',price:4,group:'hydration',shops:C,blurb:'Light and refreshing, in a tall can.',cell:46},
 // Staples in both.
 {id:'drink-water',label:'Water',jp:'水',section:'drinks',price:3,group:'hydration',shops:B,blurb:'The number one drink for players.',cell:18},
 {id:'drink-sports',label:'Sports drink',jp:'スポーツドリンク',section:'drinks',price:4,group:'hydration',shops:B,blurb:'For long, hot sessions. Water comes first.',cell:20},
];
export const foodItem=(id:string)=>FOOD_MENU.find(f=>f.id===id);
const EXTRA=new Map<string,Consumable>();
/** Register more consumables (ids must not clash with the menu). Idempotent per id. */
export function registerConsumables(items:readonly Consumable[]){for(const i of items)if(!foodItem(i.id)&&/^[a-z0-9-]{2,60}$/.test(i.id)&&Number.isInteger(i.price)&&i.price>0&&i.price<=12)EXTRA.set(i.id,i);}
export const consumable=(id:string):Consumable|undefined=>foodItem(id)??EXTRA.get(id);
const limitOf=(c:Consumable)=>c.limit??{key:'food',perDay:FOOD_PER_DAY};
export const shopMenu=(shop:KonbiniShop)=>FOOD_MENU.filter(f=>f.shops.includes(shop));

/** The one-line football-nutrition note shown when a food is revealed or eaten. Sources: FOOD_SOURCES (same as the Coral Cay farm). */
export const FOOD_NOTES:Record<FoodGroup,string>={
 carb:'Rice is a carbohydrate: football’s main fuel. A rice snack an hour or two before training gives your legs energy to run.',
 protein:'Protein helps your muscles recover after playing. Egg, fish, chicken and milk are all good after a game.',
 hydration:'Drink before, during and after you play. Water comes first for young players; a sports drink is only for long, hot sessions.',
 treat:'A sweet treat now and then is part of enjoying food. Balance it with fuel like rice, fruit and water on training days.',
 balanced:'A mix of rice or bread, some protein and vegetables is a great meal a few hours before a match, or to refuel after one.',
};
export type Source={title:string;url:string};
export const FOOD_SOURCES:Source[]=[
 {title:'FIFA · Nutrition for Football',url:'https://digitalhub.fifa.com/m/16e433eb11621446/original/ukbqfkkxw2o8s1gyjria-pdf.pdf'},
 {title:'Better Health Channel (Victoria) · Sporting performance and food',url:'https://www.betterhealth.vic.gov.au/health/healthyliving/sporting-performance-and-food'},
 {title:'Sports Dietitians Australia · What to eat before, during and after exercise',url:'https://www.sportsdietitians.com.au/factsheets/fuelling-recovery/'},
 {title:'American Academy of Pediatrics (2011) · Climatic heat stress and exercising children and adolescents',url:'https://publications.aap.org/pediatrics/article/128/3/e741/30624/Climatic-Heat-Stress-and-Exercising-Children-and'},
];
export const foodNote=(id:string)=>{const f=consumable(id);return f?f.note??FOOD_NOTES[f.group]:'';};

// ---- Collection ------------------------------------------------------------------------------------------------------------
/** Completion rewards: one-off learning coins through the wallet's creditOnce (`learn:explore:<id>`, never metered, never
 *  paid twice). Small next to the cost of the sets (§7 of the economy update). */
export const COLLECTION_REWARDS=[
 {id:'konbini-set-main',coins:10,label:'Island Square Konbini collection complete',done:(have:ReadonlySet<string>)=>shopMenu('main').every(f=>have.has(f.id))},
 {id:'konbini-set-cay',coins:10,label:'Coral Cay Konbini collection complete',done:(have:ReadonlySet<string>)=>shopMenu('cay').every(f=>have.has(f.id))},
 {id:'konbini-set-all',coins:10,label:'Every Konbini item collected',done:(have:ReadonlySet<string>)=>FOOD_MENU.every(f=>have.has(f.id))},
] as const;
export type CollectionEntry={id:string;label:string;jp?:string;
 /** Where to find it (shown on the silhouette). */
 hint:string};
export type CollectionGroup={id:string;label:string;items:CollectionEntry[]};
const shopGroup=(shop:KonbiniShop):CollectionGroup=>({id:shop,label:SHOP_NAMES[shop],items:shopMenu(shop).map(f=>({id:f.id,label:f.label,jp:f.jp,hint:f.shops.length>1?'Sold at both Konbinis':`Sold at the ${SHOP_NAMES[shop]}`}))});
const GROUPS=new Map<string,CollectionGroup>([['main',shopGroup('main')],['cay',shopGroup('cay')]]);
/** Add (or replace) a group on the Konbini Collection page, e.g. {id:'drink-machines',label:'Drink machines',items}. */
export function registerCollectionGroup(group:CollectionGroup){if(group.id!=='main'&&group.id!=='cay')GROUPS.set(group.id,group);}
export const collectionGroups=()=>[...GROUPS.values()];
const collectable=(id:string)=>[...GROUPS.values()].some(g=>g.items.some(i=>i.id===id));
export type CollectionState={version:1;items:Record<string,number>;rewards:string[]};
export const emptyCollection=():CollectionState=>({version:1,items:{},rewards:[]});
export function sanitizeCollection(raw:unknown):CollectionState{
 if(!raw||typeof raw!=='object')return emptyCollection();const v=raw as Partial<CollectionState>;if(v.version!==1)return emptyCollection();
 const items:Record<string,number>={};for(const [id,at] of Object.entries(v.items??{}))if(/^[a-z0-9-]{2,60}$/.test(id)&&typeof at==='number'&&Number.isFinite(at)&&at>0)items[id]=Math.floor(at);
 const ids=new Set<string>(COLLECTION_REWARDS.map(r=>r.id));
 return {version:1,items,rewards:[...new Set(Array.isArray(v.rewards)?v.rewards.filter((r):r is string=>typeof r==='string'&&ids.has(r)):[])]};
}
/** Adds an item (first purchase time kept); returns the rewards that became due. */
export function collect(s:CollectionState,item:string,at:number):{state:CollectionState;due:typeof COLLECTION_REWARDS[number][]}{
 if(!collectable(item))return {state:s,due:[]};
 const items=s.items[item]?s.items:{...s.items,[item]:at};const have=new Set(Object.keys(items));
 const due=COLLECTION_REWARDS.filter(r=>!s.rewards.includes(r.id)&&r.done(have));
 return {state:items===s.items&&!due.length?s:{...s,items},due};
}
/** Progress over every registered group (an item sold in two places counts once in the total). */
export function collectionProgress(s:CollectionState){
 const have=new Set(Object.keys(s.items)),all=new Set(collectionGroups().flatMap(g=>g.items.map(i=>i.id)));
 return {have:[...all].filter(id=>have.has(id)).length,total:all.size,groups:collectionGroups().map(g=>({id:g.id,label:g.label,have:g.items.filter(i=>have.has(i.id)).length,total:g.items.length}))};
}

// ---- Food ledger ----------------------------------------------------------------------------------------------------------
export type FoodFate='hand'|'pouch'|'eaten';
export type FoodPurchase={id:string;item:string;price:number;at:number;paid:boolean;fate:FoodFate};
export type KonbiniState={version:1;purchases:FoodPurchase[];
 /** Magazine lessons read (stamp card). */
 stamps:string[];stampPaid:boolean};
export const emptyKonbini=():KonbiniState=>({version:1,purchases:[],stamps:[],stampPaid:false});
const KEEP=200;
/** Keep the save bounded without ever losing a snack: only the oldest EATEN records are trimmed past KEEP (pouch and in-hand
 *  purchases are always kept; code review finding 14). */
const trim=(list:FoodPurchase[])=>{let drop=list.length-KEEP;if(drop<=0)return list;return list.filter(p=>{if(drop>0&&p.fate==='eaten'){drop--;return false;}return true;});};
const text=(v:unknown,max=120):v is string=>typeof v==='string'&&v.length>0&&v.length<=max;
export function sanitizeKonbini(raw:unknown):KonbiniState{
 if(!raw||typeof raw!=='object')return emptyKonbini();const v=raw as Partial<KonbiniState>;if(v.version!==1)return emptyKonbini();
 const seen=new Set<string>();
 const purchases=(Array.isArray(v.purchases)?v.purchases:[]).filter((p):p is FoodPurchase=>!!p&&text(p.id)&&/^[a-z0-9-]{2,60}$/.test(p.item)&&Number.isInteger(p.price)&&p.price>0&&Number.isFinite(p.at)&&['hand','pouch','eaten'].includes(p.fate))
  .filter(p=>!seen.has(p.id)&&!!seen.add(p.id)).map(p=>({id:p.id,item:p.item,price:p.price,at:p.at,paid:p.paid===true,fate:p.fate}));
 return {version:1,purchases:trim(purchases),stamps:[...new Set(Array.isArray(v.stamps)?v.stamps.filter(s=>text(s,60)):[])],stampPaid:v.stampPaid===true};
}
/** Local calendar day (dailyPlay.localPlayDay in the browser; injected so the tests control it). */
export type Day=(at:number)=>string;
/** Purchases today in one daily-limit bucket (default: the shared food bucket). */
export const boughtToday=(s:KonbiniState,now:number,day:Day,key='food')=>s.purchases.filter(p=>day(p.at)===day(now)&&limitOf(consumable(p.item)??{id:'',label:'',price:1,group:'treat',blurb:''}).key===key).length;
export const pouch=(s:KonbiniState)=>s.purchases.filter(p=>p.paid&&p.fate==='pouch');
export type BuyFoodResult={ok:true;purchase:FoodPurchase;firstTime:boolean;rewards:{id:string;coins:number;paid:number}[]}|{ok:false;reason:string;limit?:boolean;
 /** The wallet was debited before the failure: retry with the SAME purchase id (the idempotent spend won't charge again). */
 charged?:boolean};
export type KonbiniPorts={read:()=>unknown;write:(s:KonbiniState)=>void;now:()=>number;day:Day;
 readCollection:()=>unknown;writeCollection:(s:CollectionState)=>void;
 /** Idempotent wallet debit (arcade wallet spend under its cross-tab lock). */
 spend:(id:string,cost:number,reason:string)=>Promise<{ok:true}|{ok:false;reason:string}>;
 /** Idempotent one-off learning credit (arcade wallet creditOnce): resolves to the coins paid now. */
 reward:(id:string,coins:number,reason:string)=>Promise<number>;
 lock:<T>(fn:()=>T|Promise<T>)=>Promise<T>};
export const foodSpendId=(p:{item:string;id:string})=>`konbini:food:${p.item}:${p.id}`;

export function createKonbiniLedger(ports:KonbiniPorts){
 const load=()=>{try{return sanitizeKonbini(ports.read());}catch{return emptyKonbini();}};
 const loadCollection=()=>{try{return sanitizeCollection(ports.readCollection());}catch{return emptyCollection();}};
 const save=(s:KonbiniState)=>{ports.write(s);return s;};
 /** A purchase left "in hand" (tab closed before choosing) goes to the pouch when there is room, otherwise it was eaten. */
 function settle(s:KonbiniState):KonbiniState{
  let room=POUCH_SIZE-pouch(s).length,changed=false;
  const purchases=s.purchases.map(p=>{if(!p.paid||p.fate!=='hand')return p;changed=true;const fate:FoodFate=room>0?'pouch':'eaten';if(fate==='pouch')room--;return {...p,fate};});
  return changed?{...s,purchases}:s;
 }
 /**
  * Buys one food at one shop. `purchaseId` is chosen by the caller once per deliberate Buy (a double tap or retry passes the
  * same id), so the wallet charges once. Order: record the pending purchase (it counts toward the daily limit), debit the
  * wallet with the idempotent id, then mark it paid and add it to the collection. A failed debit removes the pending record.
  */
 async function buy(itemId:string,purchaseId:string,shop?:KonbiniShop):Promise<BuyFoodResult>{
  const menu=foodItem(itemId),item=consumable(itemId);
  if(!item||(menu&&(!shop||!menu.shops.includes(shop))))return {ok:false,reason:'That isn’t on this menu.'};const limit=limitOf(item);
  if(!text(purchaseId,80))return {ok:false,reason:'Invalid purchase.'};
  let charged=false;
  try{return await ports.lock(async()=>{
   let s=settle(load());const now=ports.now();
   const existing=s.purchases.find(p=>p.id===purchaseId);
   if(existing?.paid)return {ok:true,purchase:existing,firstTime:false,rewards:[]} as BuyFoodResult;
   if(!existing&&boughtToday(s,now,ports.day,limit.key)>=limit.perDay)return {ok:false,reason:FUELLED_UP,limit:true} as BuyFoodResult;
   const pending:FoodPurchase=existing??{id:purchaseId,item:item.id,price:item.price,at:now,paid:false,fate:'hand'};
   s=save({...s,purchases:trim([...s.purchases.filter(p=>p.id!==purchaseId),pending])});
   const paid=await ports.spend(foodSpendId(pending),pending.price,`Konbini · ${item.label}`);
   s=load();
   if(!paid.ok){save({...s,purchases:s.purchases.filter(p=>p.id!==purchaseId)});return {ok:false,reason:paid.reason} as BuyFoodResult;}
   charged=true;const done={...pending,paid:true};save({...s,purchases:s.purchases.map(p=>p.id===purchaseId?done:p)});
   const before=loadCollection(),firstTime=!before.items[item.id],rewards:{id:string;coins:number;paid:number}[]=[];
   // The snack is paid and saved: a collection or reward hiccup must not turn it into a failure (the rewards are creditOnce,
   // so they are simply due again on the next purchase).
   try{const {state,due}=collect(before,item.id,now);
    if(state!==before)ports.writeCollection(state);
    for(const r of due){const got=await ports.reward(r.id,r.coins,r.label);rewards.push({id:r.id,coins:r.coins,paid:got});}
    if(due.length){const c=loadCollection();ports.writeCollection({...c,rewards:[...new Set([...c.rewards,...due.map(r=>r.id)])]});}}catch{/* collection retried next time */}
   return {ok:true,purchase:done,firstTime,rewards} as BuyFoodResult;
  });}catch{return charged?{ok:false,reason:'Your coins were spent, but the snack could not be saved. Tap Buy again to collect it (no extra charge).',charged:true}:{ok:false,reason:'Your purchase could not be saved. Your coins were not spent.'};}
 }
 /** The choice after paying: eat now, or put it in the Snacks pouch (only while there is room). */
 function resolve(purchaseId:string,fate:'eat'|'pouch'):{ok:boolean;note?:string;reason?:string}{
  const s=load(),p=s.purchases.find(x=>x.id===purchaseId);
  if(!p||!p.paid||p.fate!=='hand')return {ok:false,reason:'Nothing in your hand.'};
  if(fate==='pouch'&&pouch(s).length>=POUCH_SIZE)return {ok:false,reason:`Your snack pouch holds ${POUCH_SIZE}. Eat one first.`};
  save({...s,purchases:s.purchases.map(x=>x.id===purchaseId?{...x,fate:fate==='eat'?'eaten' as const:'pouch' as const}:x)});
  return {ok:true,note:fate==='eat'?foodNote(p.item):undefined};
 }
 /** Dismissed without choosing (Done, Escape, another slot, closing the machine): into the pouch when there is room, otherwise
  *  eaten/drunk now. A paid item is never left invisible "in hand" (code review finding 5). */
 function keep(purchaseId:string):{ok:boolean;fate?:'pouch'|'eaten';note?:string}{
  const s=load(),p=s.purchases.find(x=>x.id===purchaseId);
  if(!p||!p.paid||p.fate!=='hand')return {ok:false};
  const fate:'pouch'|'eaten'=pouch(s).length<POUCH_SIZE?'pouch':'eaten';
  save({...s,purchases:s.purchases.map(x=>x.id===purchaseId?{...x,fate}:x)});
  return {ok:true,fate,note:fate==='eaten'?foodNote(p.item):undefined};
 }
 /** Eat one snack from the pouch (anywhere: the Backpack's Snacks section). */
 function eatFromPouch(purchaseId:string):{ok:boolean;note?:string;item?:string}{
  const s=settle(load()),p=s.purchases.find(x=>x.id===purchaseId);
  if(!p||!p.paid||p.fate!=='pouch')return {ok:false};
  save({...s,purchases:s.purchases.map(x=>x.id===purchaseId?{...x,fate:'eaten' as const}:x)});
  return {ok:true,note:foodNote(p.item),item:p.item};
 }
 function addStamp(id:string){const s=load();if(s.stamps.includes(id))return s;return save({...s,stamps:[...s.stamps,id]});}
 function markStampPaid(){const s=load();if(!s.stampPaid)save({...s,stampPaid:true});}
 return {read:load,readCollection:loadCollection,buy,resolve,keep,eatFromPouch,addStamp,markStampPaid,settle:()=>{const s=load(),n=settle(s);if(n!==s)save(n);return n;}};
}
