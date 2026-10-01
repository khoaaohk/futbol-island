'use client';
import {useEffect,useMemo,useState,type ReactNode} from 'react';
import {bookReadable,type BackpackItem,type BackpackKind} from '@/lib/town/backpack';
import {markBackpackSeen,useBackpack} from '@/lib/town/backpackStore';
import {PLAYER_BOOKS} from '@/lib/books/catalog';
import {CARD_ENTRIES} from '@/lib/town/cardCollection';
import {getIslandCostume} from '@/lib/town/islandCostumes';
import {STORE_ITEMS,type StoreCategory} from '@/lib/town/store';
import {vendingItem} from '@/lib/town/vendingCatalog';
import type {CharacterCustomization} from '@/lib/town/customization';
import MiniCard from './MiniCard';
import VendingProductArt from './VendingProductArt';
import {BallPicture,StorePreview,useStorePreviews} from './StorePreviews';
import {useCostumePreviews} from './CostumePreviews';
import styles from './Backpack.module.css';
import {KonbiniCollection,snackRenderer} from './KonbiniCollection';
import {trophyRenderer} from './TrophyShelf';

/**
 * Make it yours → Backpack (user, Sep 28 2026): everything the player owns, grouped by category (lib/town/backpack.ts registry).
 * Each kind has a renderer here: its art (reusing the vending/store/card art) and its tap action (read, equip, wear, view).
 * A new item kind = registerBackpackCategory() in the model + one entry in RENDERERS (or it falls back to a plain tile).
 * Heat: static tiles; the gear/costume snapshots are the existing one-shot preview batches, cached for the session.
 */
export type BackpackActions={
 value:CharacterCustomization;
 /** Equip a ball or ride (the customizer's own choose(): saves the look and switches the ride). */
 onEquip:(category:StoreCategory,id:string)=>void;
 onWear:(costume:string)=>void;
 onOpenBook:(bookId:string)=>void;
 onShowCard:(name:string)=>void;
};
type Art={gear:Record<string,string>;costumes:Record<string,string>};
type Action={verb:string;active?:boolean;run:()=>string|void};
type Renderer={art:(item:BackpackItem,art:Art)=>ReactNode;action?:(item:BackpackItem,ctx:BackpackActions)=>Action|null};

const storeItem=(id:string)=>STORE_ITEMS.find(i=>i.id===id);
const BOOK_META=PLAYER_BOOKS as unknown as Record<string,{itemId?:string;title:string}>;
function BookCover({item}:{item:BackpackItem}){
 const itemId=BOOK_META[item.ref]?.itemId;
 if(itemId&&vendingItem(itemId)?.display)return <VendingProductArt id={itemId} kind="display"/>;
 return <span className={styles.cover} aria-hidden="true"><small>Pop-up story</small><strong>{item.label.split(':')[0]}</strong><span className={styles.coverStar}>★</span></span>;
}
const CARD_BY_NAME=new Map(CARD_ENTRIES.map(c=>[c.name,c]));
const gearEquipped=(item:BackpackItem,value:CharacterCustomization)=>{const g=storeItem(item.ref);return !!g&&value[g.category]===g.option.id;};

const RENDERERS:Record<string,Renderer>={
 book:{art:item=><BookCover item={item}/>,
  action:(item,ctx)=>({verb:'Read',run:()=>{if(!bookReadable(item.ref))return 'This book is still at the printer. It will open here soon.';ctx.onOpenBook(item.ref);}})},
 card:{art:item=>{const c=CARD_BY_NAME.get(item.ref);return c?<MiniCard name={c.name} number={c.number} era={c.era} got thumb className={styles.miniCard}/>:null;},
  action:(item,ctx)=>({verb:'See in binder',run:()=>ctx.onShowCard(item.ref)})},
 ride:{art:(item,art)=>{const g=storeItem(item.ref);return g?<StorePreview item={g} src={art.gear[g.id]}/>:null;},
  action:(item,ctx)=>{const g=storeItem(item.ref);if(!g)return null;const on=gearEquipped(item,ctx.value);
   return {verb:on?'Equipped':'Ride',active:on,run:()=>{ctx.onEquip(g.category,g.option.id);return `${item.label} is on. Close Make it yours to ride.`;}};}},
 // Same baked ball picture the vending machine shows (BallPicture), so a ball looks identical in both places.
 ball:{art:(item,art)=>{const g=storeItem(item.ref);return g?<BallPicture item={g} src={art.gear[g.id]}/>:<span className={styles.ballArt}><VendingProductArt id={item.ref} kind="ball"/></span>;},
  action:(item,ctx)=>{const g=storeItem(item.ref);if(!g)return null;const on=gearEquipped(item,ctx.value);
   return {verb:on?'Equipped':'Use',active:on,run:()=>{ctx.onEquip(g.category,g.option.id);return `${item.label} ball is at your feet.`;}};}},
 costume:{art:(item,art)=>{const src=art.costumes[item.ref];const island=getIslandCostume(item.ref);return src?<img src={src} alt="" width={320} height={280} draggable={false}/>:<span className={styles.fallback} style={{color:`#${island.kitColor.toString(16).padStart(6,'0')}`}}>{island.animalLabel}</span>;},
  action:(item,ctx)=>{const on=ctx.value.costume===item.ref;return {verb:on?'Wearing':'Wear',active:on,run:()=>{ctx.onWear(on?'none':item.ref);return on?'Costume off: your own character is back.':`${item.label} is on. Your character stays underneath.`;}};}},
};
/** Plug in art/actions for a new kind (the model side is registerBackpackCategory). */
export function registerBackpackRenderer(kind:BackpackKind,renderer:Renderer){RENDERERS[kind]=renderer;}
registerBackpackRenderer('snack',snackRenderer);
// Lane 2 (Sep 30 2026): graduation certificates on the Trophy shelf.
registerBackpackRenderer('trophy',trophyRenderer);
const FALLBACK:Renderer={art:item=><span className={styles.fallback}>{item.label.slice(0,1)}</span>};

const CARD_PREVIEW=12;
export default function Backpack({active,...ctx}:BackpackActions&{active:boolean}){
 const {groups,seen,ready}=useBackpack();
 const [filter,setFilter]=useState<string>('all');
 const [allCards,setAllCards]=useState(false);
 const [status,setStatus]=useState('');
 const items=useMemo(()=>groups.flatMap(g=>g.items),[groups]);
 // "New": unseen when the backpack opened (or arriving while it is open). Seen is saved straight away; the badge stays this visit.
 const [fresh,setFresh]=useState<ReadonlySet<string>>(()=>new Set());
 useEffect(()=>{if(!active||!ready)return;const unseen=items.filter(i=>!seen.has(i.id)).map(i=>i.id);if(!unseen.length)return;
  setFresh(prev=>new Set([...prev,...unseen]));markBackpackSeen(unseen);},[active,ready,items,seen]);
 const needsGear=active&&groups.some(g=>g.kind==='ride'&&g.items.length>0);
 const needsCostumes=active&&groups.some(g=>g.kind==='costume'&&g.items.length>0);
 const gear=useGearCache(needsGear),costumes=useCostumePreviews(needsCostumes,ctx.value);
 const art={gear,costumes};
 const total=items.length,shown=filter==='all'?groups:groups.filter(g=>g.kind===filter);
 return <section className={styles.backpack} aria-labelledby="backpack-title" data-backpack>
  <header className={styles.head}>
   <div><h3 id="backpack-title">Your backpack</h3><p>{total} {total===1?'item':'items'}. Everything you collect lands here: tap an item to use it.</p></div>
  </header>
  <div className={styles.filters} role="group" aria-label="Show a category">
   <button type="button" className={styles.chip} aria-pressed={filter==='all'} onClick={()=>setFilter('all')}>All <span>{total}</span></button>
   {groups.map(g=><button key={g.kind} type="button" className={styles.chip} aria-pressed={filter===g.kind} data-backpack-filter={g.kind} onClick={()=>setFilter(g.kind)}>{g.label} <span>{g.items.length}</span></button>)}
  </div>
  <p className={styles.status} role="status" aria-live="polite">{status}</p>
  {shown.map(g=>{const r=RENDERERS[g.kind]??FALLBACK;const cards=g.kind==='card';const list=cards&&!allCards?g.items.slice(0,CARD_PREVIEW):g.items;
   return <section key={g.kind} className={styles.group} data-backpack-group={g.kind} aria-labelledby={`backpack-${g.kind}`}>
    <div className={styles.groupHead}><h4 id={`backpack-${g.kind}`}>{g.label} <span className={styles.count}>{g.items.length}</span></h4>
     {cards&&g.items.length>0&&<button type="button" className={styles.secondary} onClick={()=>ctx.onShowCard(g.items[0].ref)}>Open my binder</button>}</div>
    <p className={styles.lesson}>{g.items.length?g.lesson:g.emptyHint}</p>
    {g.kind==='konbini'?<KonbiniCollection/>:g.items.length?<ul className={styles.grid} role="list">{list.map(item=>{const action=r.action?.(item,ctx)??null;const isNew=fresh.has(item.id);
     const source=item.source==='starter'?'Starter':item.source==='bought'?'Bought':'Earned';
     return <li key={item.id}><button type="button" className={styles.tile} data-backpack-item={item.id} data-kind={item.kind} data-active={action?.active||undefined}
      aria-label={`${item.label}${item.detail?`, ${item.detail}`:''}. ${source}.${isNew?' New.':''}${action?` ${action.verb}.`:''}`}
      onClick={()=>{if(!action)return;const message=action.run();setStatus(message||'');}}>
      <span className={styles.art} aria-hidden="true">{r.art(item,art)}</span>
      {isNew&&<span className={styles.new} aria-hidden="true">New</span>}
      <span className={styles.name}>{item.label}</span>
      <span className={styles.meta}>{action?.active?<>{item.detail}<b>{action.verb}</b></>:item.detail??source}</span>
     </button></li>;})}</ul>
    :<p className={styles.empty} data-backpack-empty={g.kind}>Nothing here yet.</p>}
    {cards&&g.items.length>CARD_PREVIEW&&<button type="button" className={`${styles.chip} ${styles.more}`} aria-expanded={allCards} onClick={()=>setAllCards(v=>!v)}>{allCards?'Show fewer cards':`Show all ${g.items.length} cards`}</button>}
   </section>;})}
 </section>;
}

/** The island's own gear meshes, snapshotted once per session (the vending machine's shelf framing). */
let gearCache:Record<string,string>|null=null;
function useGearCache(open:boolean){
 const fresh=useStorePreviews(open&&!gearCache,undefined,true);
 if(!gearCache&&Object.keys(fresh).length)gearCache=fresh;
 return gearCache??fresh;
}
