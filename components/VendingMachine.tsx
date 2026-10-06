'use client';
import dynamic from 'next/dynamic';
import {readableBook,type PlayerBookId} from '@/lib/books/catalog';
import {isVendingPreview} from '@/lib/town/vendingPreview';
import {HOME_DECOR_ENABLED} from '@/lib/town/homeFeature';
import {useEffect,useLayoutEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {BackButton} from './BackButton';
import {DoneButton} from './DoneButton';
import VendingCardReveal from './VendingCardReveal';
import CostumeCollection from './CostumeCollection';
import VendingProductArt from './VendingProductArt';
import {BallPicture,StorePreview,useStorePreviews} from './StorePreviews';
import {useCostumePreviews} from './CostumePreviews';
import {VendingFace,type VendingFaceView,type VendingPhase,type VendingSlotState} from './VendingFace';
import {recordExploreActivity} from '@/lib/town/exploreActivity';
import {recordQuestEvent} from '@/lib/town/questProgress';
import {equipStoreItem} from '@/lib/town/store';
import {getIslandCostume} from '@/lib/town/islandCostumes';
import {getCostume} from '@/lib/town/costumes';
import {costumeEarned,costumeUnlockBalls,costumeUnlockHint} from '@/lib/town/coinQuest';
import {useCoinProgress} from '@/lib/town/coinProgress';
import {isRideCategory,rideUnlockHint,useRideUnlocks} from '@/lib/town/rideUnlocks';
import {useArcadeWallet} from '@/lib/arcade/arcadeWallet';
import {VENDING_MACHINES,machineStock,vendingLockLed,vendingMachine,type VendingItem,type VendingMachineId} from '@/lib/town/vendingCatalog';
import {buyVendingItem,markMachineFound,packFreshness,useVending} from '@/lib/town/vendingWallet';
import {FACE_SIZE,VENDING_FACE_LAYOUT,VENDING_SLOTS_PER_PAGE,VENDING_TIMING} from '@/lib/graphics/vendingFaceLayout';
import type {VendingMachines} from '@/lib/graphics/vendingMachines';
import type {CharacterCustomization} from '@/lib/town/customization';
import type {TravelMode} from '@/lib/town/travelModes';
import jobStyles from './IslandJobs.module.css';
import styles from './VendingMachine.module.css';

/**
 * Vending machine CONTROLLER, used in the world (user, Sep 27 2026: "interacting with the machine and not a modal";
 * docs/vending-machines.md, visual contract in docs/vending-visuals-HANDOFF.md).
 *
 * Town zooms the camera straight onto the machine front (lib/graphics/vendingMachines.ts). This component pins the machine face
 * (components/VendingFace.tsx, the swappable visual module) onto that exact rectangle and runs the state machine:
 *   idle ─press slot→ armed (lit button, price on the LED) ─press again / coin slot→ coins → drop → tray ─tap tray→ reward → idle
 * with the wallet, ledger, specials and unlock rules deciding what a press does. Minimal HUD: the coin pill (top-left) + Done (top-right). Keyboard:
 * arrows / 1–6 select, Enter buys, PageUp/PageDown flip, Esc leaves (WASD walks away).
 * Heat: nothing is mounted until the machine is in use; the island sleeps meanwhile (`storeOpen` stays in Town's pause list, which
 * also blocks card offers); only one-shot CSS animations, no loops, no backdrop blur.
 */
export type VendingMachineProps={open:boolean;machineId:VendingMachineId;onOpenChange:(open:boolean)=>void;value:CharacterCustomization;
 onChange:(value:CharacterCustomization)=>void;onEquipRide:(mode:TravelMode)=>void;itemRequest?:{id:string;nonce:number}|null;
 /** The 3D machines: the face follows their zoom camera. */
 machines?:()=>VendingMachines|null};
const PlayerPopUpBook=dynamic(()=>import('./PlayerPopUpBook'),{ssr:false});
type Status={kind:VendingSlotState;note:string;short?:string;need?:number};
type Point={x:number;y:number};
/** Gear miniatures are the island's own vehicle and ball meshes, rendered once per visit by StorePreviews and kept for the session. */
let gearCache:Record<string,string>|null=null;
const ROW_SHORT:Record<string,string>={special:'Specials',books:'Books',packs:'Packs',ball:'Balls',scooter:'Scooters',bike:'Bikes',moped:'Mopeds',jetpack:'Flight',costume:'Animals'};
const cue=(name:'select'|'previous'|'next'|'category'|'insert'|'confirm'|'equip'|'coin'|'thunk'|'pop'|'buzz')=>{try{document.dispatchEvent(new CustomEvent('fi2-vending-cue',{detail:name}));}catch{}};
const reducedMotion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;

/** CSS matrix3d that maps a w×h box onto the quad a,b,c,d (top-left, top-right, bottom-right, bottom-left): Heckbert's square→quad. */
export function quadMatrix(w:number,h:number,[a,b,c,d]:Point[]){
 const sx=a.x-b.x+c.x-d.x,sy=a.y-b.y+c.y-d.y;let g=0,k=0;
 if(Math.abs(sx)>1e-6||Math.abs(sy)>1e-6){const dx1=b.x-c.x,dx2=d.x-c.x,dy1=b.y-c.y,dy2=d.y-c.y,den=dx1*dy2-dx2*dy1||1e-9;g=(sx*dy2-dx2*sy)/den;k=(dx1*sy-sx*dy1)/den;}
 const m=[(b.x-a.x+g*b.x)/w,(b.y-a.y+g*b.y)/w,0,g/w,(d.x-a.x+k*d.x)/h,(d.y-a.y+k*d.y)/h,0,k/h,0,0,1,0,a.x,a.y,0,1];
 return `matrix3d(${m.map(v=>+v.toFixed(6)).join(',')})`;
}

/** The face's true CSS 3D placement from the zoom camera (products stand in the real bay behind the glass), or null. */
export function faceDepthMatrix(machines:(()=>VendingMachines|null)|undefined,w:number,h:number){
 const host=typeof document==='undefined'?null:document.querySelector('.town-scene')?.getBoundingClientRect(),r=host&&host.width>0?host:{left:0,top:0,width:innerWidth,height:innerHeight};
 return machines?.()?.faceCssMatrix?.(w,h,r)??null;
}
/** Shared by the shop and drink machines (bug audit B1, Sep 30 2026): the face box keeps FACE_SIZE proportions, sits in true CSS
 *  3D depth when the zoom camera is known, and carries the per-slot parallax `shifts` (VendingMachines.productShift) plus the
 *  `widen` foreshortening correction, so every machine's products line up over their price rails. */
export function facePlacement(quad:Point[]|null,machines:(()=>VendingMachines|null)|undefined,machineId:VendingMachineId){
 if(!quad)return null;const [a,b,c,d]=quad,h=Math.max(200,Math.round(Math.hypot(d.x-a.x,d.y-a.y))),w=Math.max(160,Math.round(h*FACE_SIZE.w/FACE_SIZE.h)),across=(Math.hypot(b.x-a.x,b.y-a.y)+Math.hypot(c.x-d.x,c.y-d.y))/2,down=(Math.hypot(d.x-a.x,d.y-a.y)+Math.hypot(c.x-b.x,c.y-b.y))/2;const depth=faceDepthMatrix(machines,w,h);
 return {w,h,transform:depth??quadMatrix(w,h,quad),depth:Boolean(depth),shifts:depth?machines?.()?.productShift?.(machineId)??[]:[],views:depth?machines?.()?.productView?.(machineId)??[]:[],widen:Math.min(1.25,Math.max(1,down*FACE_SIZE.w/FACE_SIZE.h/Math.max(1,across)))};
}
export default function VendingMachine({open,machineId,onOpenChange,value,onChange,onEquipRide,itemRequest,machines}:VendingMachineProps){
 const preview=isVendingPreview();
 const machine=vendingMachine(machineId)??VENDING_MACHINES[0];
 const vending=useVending(),wallet=useArcadeWallet(),rides=useRideUnlocks(),coins=useCoinProgress();
 const stock=useMemo(()=>machineStock(machine.id),[machine.id]);
 const all=useMemo(()=>stock.flatMap(r=>r.items),[stock]);
 /** The stock row each item is shown in here (a book's own row is 'special' at its home machine, but it sits in Books). */
 const rowOf=useMemo(()=>new Map(stock.flatMap(r=>r.items.map(i=>[i.id,r.row] as const))),[stock]);
 /** Specials first, then the regular rows, six slots per page (VENDING_FACE_LAYOUT.slots). */
 const pages=useMemo(()=>{const out:VendingItem[][]=[];for(let i=0;i<all.length;i+=VENDING_SLOTS_PER_PAGE)out.push(all.slice(i,i+VENDING_SLOTS_PER_PAGE));return out;},[all]);
 const [book,setBook]=useState<PlayerBookId|null>(null),[faceEntrance,setFaceEntrance]=useState(true);
 const [quad,setQuad]=useState<Point[]|null>(null);
 const [pickupOrigin,setPickupOrigin]=useState<{x:number;y:number}|null>(null);
 const [armedId,setArmedId]=useState<string|null>(null),[cursor,setCursor]=useState(0),[pageIndex,setPageIndex]=useState(0);
 const [phase,setPhase]=useState<VendingPhase>('idle'),[led,setLed]=useState<{msg:string;sub?:string;tone?:'warn'|'ok'}|null>(null),[story,setStory]=useState<string|null>(null);
 // Tray how-to note (coin slot taps): shows in the tray, then fades after a few seconds.
 const [trayNote,setTrayNote]=useState<{text:string;key:number}|null>(null),trayNoteTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const showTrayNote=(text:string)=>{if(trayNoteTimer.current)clearTimeout(trayNoteTimer.current);setTrayNote({text,key:Date.now()});trayNoteTimer.current=setTimeout(()=>setTrayNote(null),3600);};
 useEffect(()=>()=>{if(trayNoteTimer.current)clearTimeout(trayNoteTimer.current);},[]);
 const [dispense,setDispense]=useState<{item:VendingItem;key:number;packId?:string}|null>(null),[coinDrop,setCoinDrop]=useState<{n:number;key:number}|null>(null),[vendingSlot,setVendingSlot]=useState<string|null>(null);
 const exitButton=useRef<HTMLButtonElement>(null);
 const visit=useRef(0),busy=useRef(false),timers=useRef<ReturnType<typeof setTimeout>[]>([]),restore=useRef<HTMLElement|null>(null),faceEl=useRef<HTMLDivElement>(null);
 const later=(fn:()=>void,ms:number)=>{const t=setTimeout(()=>{timers.current=timers.current.filter(x=>x!==t);fn();},ms);timers.current.push(t);};
 const fresh=useStorePreviews(open&&!book&&!gearCache,undefined,true);if(!gearCache&&Object.keys(fresh).length)gearCache=fresh;const gear=gearCache??fresh;
 const costumes=useCostumePreviews(open&&!book,value);
 const owned=useMemo(()=>new Set(vending.owned),[vending.owned]);
 const isOwned=(id:string)=>id==='costume:none'||['ball','scooter','bike','moped','jetpack'].some(k=>id===`${k}:classic`)||owned.has(id);
 const page=pages[Math.min(pageIndex,pages.length-1)]??[];
 const armed=armedId?all.find(i=>i.id===armedId)??null:null;
 const pageOf=(id:string)=>pages.findIndex(p=>p.some(i=>i.id===id));

 // ---- Where the face sits: the zoom camera's projected corners (fallback: a centred machine-shaped rectangle). ----
 useEffect(()=>{
  if(!open){setQuad(null);return;}
  const fallback=():Point[]=>{const W=innerWidth,H=innerHeight,ratio=FACE_SIZE.w/FACE_SIZE.h,h=Math.min(H*.92,W*.94/ratio),w=h*ratio,x=(W-w)/2,y=(H-h)/2;return [{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}];};
  const toScreen=(ndc:Point[])=>{const host=document.querySelector('.town-scene')?.getBoundingClientRect();const r=host&&host.width>0?host:{left:0,top:0,width:innerWidth,height:innerHeight};
   return ndc.map(p=>({x:Math.round((r.left+(p.x+1)/2*r.width)*2)/2,y:Math.round((r.top+(1-p.y)/2*r.height)*2)/2}));};
  const place=(next:Point[])=>setQuad(prev=>prev&&prev.every((p,i)=>Math.abs(p.x-next[i].x)<.6&&Math.abs(p.y-next[i].y)<.6)?prev:next);
  const v=machines?.();const off=v?.watchFace(ndc=>place(toScreen(ndc)));
  const now=v?.faceNow();place(now?toScreen(now):fallback());
  // A resize wakes the island for a frame, which re-fits the camera and calls watchFace; without a zoom, re-centre.
  const resize=()=>{if(!machines?.()?.faceNow())place(fallback());};window.addEventListener('resize',resize);
  return()=>{off?.();window.removeEventListener('resize',resize);};
 },[open,machines]);
 // The face box keeps the real front panel's proportions (FACE_SIZE); the matrix then adds only perspective. Sizing the box
 // from the projected (foreshortened) top edge made every shelf item look stretched sideways (egg-shaped balls, wide books).
 // `widen`: how much the angled close-up foreshortens the face's width; round balls are widened back so they stay round (user,
 // Sep 30 2026: "fix the perspective of the balls").
 const placement=useMemo(()=>facePlacement(quad,machines,machineId),[quad,machines,machineId]);

 // ---- Open / close ----
 useEffect(()=>{
  visit.current++;
  if(open){if(!preview){recordExploreActivity('store');markMachineFound(machine.id);}restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
   setLed(null);setStory(null);setBook(null);setFaceEntrance(true);setDispense(null);setCoinDrop(null);setVendingSlot(null);setPhase('idle');setArmedId(null);setPageIndex(0);setCursor(0);busy.current=false;}
  else{timers.current.forEach(clearTimeout);timers.current=[];restore.current?.focus?.({preventScroll:true});}
  return()=>{visit.current++;timers.current.forEach(clearTimeout);timers.current=[];};
 },[open,machine.id]);
 useEffect(()=>()=>{timers.current.forEach(clearTimeout);},[]);
 useEffect(()=>{if(!open||!itemRequest)return;const item=all.find(i=>i.id===itemRequest.id);if(!item)return;const p=pageOf(item.id);
  setArmedId(item.id);setLed(null);if(p>=0){setPageIndex(p);setCursor(pages[p].findIndex(i=>i.id===item.id));}},[itemRequest,open,all]);// eslint-disable-line react-hooks/exhaustive-deps
 const focusSlot=(index:number)=>requestAnimationFrame(()=>faceEl.current?.querySelector<HTMLButtonElement>(`[data-slot-index="${index}"]`)?.focus({preventScroll:true}));
 const placed=Boolean(placement);
 useLayoutEffect(()=>{if(open&&placed&&!faceEl.current?.contains(document.activeElement))focusSlot(cursor);},[open,placed]);// eslint-disable-line react-hooks/exhaustive-deps

 // ---- Rules: what a press means for this item (wallet, ledger, specials, unlocks). ----
 function status(item:VendingItem):Status{
  if(preview){
   if(readableBook(item))return {kind:'owned',note:'Testing preview · Press again to read. Nothing is purchased.'};
   if(item.kind==='display')return {kind:'preview',note:'Coming soon · This pop-up book is still being written.'};
   if(item.kind==='pack')return {kind:'owned',note:'Testing preview · Open sample cards. Nothing is saved.'};
   return {kind:'owned',note:'Testing preview · Press again to try it. Nothing is purchased.'};
  }
  if(readableBook(item))return isOwned(item.id)?{kind:'owned',note:'Yours! Press again to read your pop-up book.'}:item.price>vending.balance?{kind:'short',note:`${item.price-vending.balance} more coins to open this story.`}:{kind:'buy',note:`${item.price} coins · Yours to read again`};
  if(item.kind==='display'&&!HOME_DECOR_ENABLED)return {kind:'preview',note:'Coming soon · This pop-up book is still being written.'};
  if(item.kind==='display')return isOwned(item.id)?{kind:'owned',note:'In your home collection. Open Settings → My home to place it.'}:item.price>vending.balance?{kind:'short',note:`${item.price-vending.balance} more coins to collect this for your home.`}:{kind:'buy',note:`${item.price} coins`};
  const short=Math.max(0,item.price-vending.balance);
  const buyable=():Status=>short>0?{kind:'short',note:`Need ${short} more coin${short===1?'':'s'}. Try an island job!`}:{kind:'buy',note:`${item.price} coins`};
  if(item.kind==='pack'&&item.pack){const fresh=packFreshness(item.pack);if(!fresh.available)return {kind:'soldout',note:fresh.restock?'This machine restocks at midnight.':'You have every card in this pack'};return buyable();}
  if(item.kind==='costume'&&item.costume){const id=item.costume;
   if(value.costume===id&&isOwned(item.id))return {kind:'equipped',note:'Wearing it. Press again to take it off'};if(isOwned(item.id))return {kind:'owned',note:'Yours! Press again to wear it'};
   if(!costumeEarned(coins,id)){const h=costumeUnlockHint(coins,id);return {kind:'locked',note:h.text,short:h.short,need:h.need};}return buyable();}
  const s=item.storeItem!;if(isOwned(item.id))return value[s.category]===s.option.id?{kind:'equipped',note:'Equipped'}:{kind:'owned',note:'Yours! Press again to use it'};
  if(isRideCategory(s.category)&&!rides.isUnlocked(s.category,s.option.id)){const h=rideUnlockHint(s.category,s.option.id,rides.finished,rides.total);return {kind:'locked',note:h.text,short:h.short,need:h.need};}
  return buyable();
 }
 /** `slot`: the picture stands on a shelf slot of the in-use face (its base anchored on the slab top, VendingProductArt `stand`). */
 function picture(item:VendingItem,big=false,slot=false){
  if(item.kind==='display')return <VendingProductArt id={item.id} kind={item.kind} stand={slot&&Boolean(placement?.depth)}/>;
  // A real card pack (the foil pack art the machine front shows), standing on the shelf (Sep 30 2026: not a flat card back).
  if(item.kind==='pack')return <VendingProductArt id={item.id} kind="pack" stand={slot&&Boolean(placement?.depth)}/>;
  if(item.kind==='costume'){const src=costumes[item.costume!];const island=getIslandCostume(item.costume!);return src?<img src={src} alt="" width={320} height={280} draggable={false}/>:<span className={styles.placeholder} style={{color:`#${island.kitColor.toString(16).padStart(6,'0')}`}}>{island.animalLabel}</span>;}
  if(item.storeItem?.category==='ball')return <BallPicture item={item.storeItem} src={gear[item.id]}/>;
  return <StorePreview item={item.storeItem!} src={gear[item.id]}/>;
 }
 const kindOf=(item:VendingItem)=>item.storeItem?.category??item.kind;

 // ---- State machine ----
 function arm(item:VendingItem,index?:number){cue('select');setArmedId(item.id);setLed(null);if(index!==undefined)setCursor(index);}
 function dismissReward(){setPhase('idle');setDispense(null);focusSlot(cursor);}
 function locatePickup(){const r=faceEl.current?.querySelector('[data-vending-tray]')?.getBoundingClientRect();setPickupOrigin(r?{x:r.left+r.width*.28,y:r.top+r.height*.5}:null);}
 /** A slot's push button: first press lights it (price on the LED), second press buys / equips. */
 function press(item:VendingItem,index:number){
  if(phase==='coins'||phase==='drop')return;
  if(phase==='reward')dismissReward();else if(phase==='tray'){setLed({msg:'Take your item from the tray first',tone:'warn'});cue('buzz');return;}
  if(armedId!==item.id){arm(item,index);return;}
  act(item);
 }
 function act(item:VendingItem){
  const s=status(item);
  if(s.kind==='buy'){void purchase(item);return;}
  if(s.kind==='owned'||s.kind==='equipped'){if(s.kind==='equipped'&&item.kind!=='costume'){setLed({msg:`${item.label} is on`,sub:'Leave the machine to try it.',tone:'ok'});return;}equip(item);return;}
  setLed(vendingLockLed({label:item.label,status:s},[])??{msg:s.note,tone:'warn'});cue('buzz');
 }
 // Coin slot (user, Oct 1 2026): it never buys. Only the button under an item does; the coins show how-to in the tray, which fades.
 function coinSlot(){
  if(phase==='coins'||phase==='drop')return;
  cue('insert');showTrayNote(phase==='tray'?'Tap the tray to take your item':'Tap the button under an item, then tap it again to buy');
 }
 async function purchase(item:VendingItem){
  if(preview){equip(item);return;}
  if(busy.current)return;const purchaseVisit=visit.current;busy.current=true;cue('confirm');const quick=reducedMotion(),t=VENDING_TIMING;
  const n=Math.min(3,Math.max(1,Math.ceil(item.price/15)));setCoinDrop({n,key:Date.now()});setPhase('coins');setLed({msg:`${item.price} coins in…`,sub:item.label});
  for(let i=0;i<n;i++)later(()=>cue('coin'),quick?0:t.coinAt(i));
  try{
   const [result]=await Promise.all([buyVendingItem(item),new Promise(r=>setTimeout(r,quick?0:t.coinsDone(n)))]);
   // A saved purchase survives closing; an old visit must not animate in a newly opened machine.
   if(purchaseVisit!==visit.current)return;
   if(!result.ok){setPhase('idle');setCoinDrop(null);setLed({msg:result.reason,tone:'warn'});cue('buzz');return;}
   setVendingSlot(item.id);setDispense({item,key:Date.now(),packId:result.packId});setPhase('drop');setLed({msg:'Thank you! ありがとう',sub:'Your item is dropping…',tone:'ok'});
   later(()=>{cue('thunk');setPhase('tray');setVendingSlot(null);setCoinDrop(null);setLed({msg:'Tap the tray to take it',sub:item.kind==='pack'?'Your pack is in the tray.':`${item.label} is in the tray.`,tone:'ok'});},quick?0:t.drop);
  }finally{if(purchaseVisit===visit.current)busy.current=false;}
 }
 function take(){if(phase!=='tray'||!dispense)return;locatePickup();cue('pop');setPhase('reward');setLed(null);}
 function equip(item:VendingItem){
  if(!preview&&!isOwned(item.id))return;cue('equip');
  if(preview&&item.kind==='pack'){locatePickup();setDispense({item,key:Date.now(),packId:'preview'});setPhase('reward');return;}
  const storyBook=readableBook(item);if(storyBook){setFaceEntrance(false);setBook(storyBook);return;}
  if(item.kind==='display'){setLed({msg:'Saved in your home collection',sub:'Leave the machine, then Settings → My home to decorate.',tone:'ok'});return;}
  if(item.kind==='costume'){const next=value.costume===item.costume?'none':item.costume!;onChange({...value,costume:next});if(!preview)recordQuestEvent({type:'equip'});setLed({msg:next==='none'?'Costume off':`${getIslandCostume(next).name} is on`,sub:next==='none'?'Your own character is back.':'Your character and ride stay yours.',tone:'ok'});return;}
  const result=equipStoreItem(value,item.id);if(!result)return;onChange(result.value);onEquipRide(result.mode);if(!preview)recordQuestEvent({type:'equip'});setLed({msg:`${item.label} equipped`,sub:'Leave the machine to try it.',tone:'ok'});
 }
 const goPage=(next:number,index=0)=>{setPageIndex(next);setCursor(index);setArmedId(null);setLed(null);focusSlot(index);};
 const flip=(dir:1|-1)=>{cue(dir===1?'next':'previous');goPage((Math.min(pageIndex,pages.length-1)+dir+pages.length)%pages.length);};
 /** Row label: jump to the page where the next row (category) starts. */
 const nextRow=()=>{cue('category');const at=rowOf.get(page[page.length-1]?.id);const start=all.findIndex(i=>rowOf.get(i.id)!==at&&all.indexOf(i)>all.indexOf(page[page.length-1]));const target=start<0?all[0]:all[start];const p=pageOf(target.id);goPage(p,pages[p].indexOf(target));};
 const leave=()=>{if(book){setBook(null);return;}if(story){setStory(null);return;}exitButton.current?.click();};

 // ---- Keyboard ----
 const keyState=useRef({page,cursor,phase,story,book});keyState.current={page,cursor,phase,story,book};
 useEffect(()=>{if(!open)return;
  const onKey=(e:KeyboardEvent)=>{const s=keyState.current;if(s.book)return;if(e.metaKey||e.ctrlKey||e.altKey)return;const key=e.key,lower=key.toLowerCase(),stop=()=>{e.preventDefault();e.stopPropagation();};
   if(key==='Escape'){stop();if(s.phase==='reward'){dismissReward();return;}leave();return;}
   if(s.story||s.phase==='reward')return;
   if(['w','a','s','d'].includes(lower)){stop();leave();return;}
   const cols=VENDING_FACE_LAYOUT.cols,count=s.page.length;
   const move=(next:number)=>{stop();if(next<0||next>=count){flip(next<0?-1:1);return;}arm(s.page[next],next);focusSlot(next);};
   if(key==='ArrowRight')return move(s.cursor+1);if(key==='ArrowLeft')return move(s.cursor-1);
   if(key==='ArrowDown')return move(s.cursor+cols<count?s.cursor+cols:count);if(key==='ArrowUp')return move(s.cursor-cols>=0?s.cursor-cols:-1);
   if(key==='PageDown'||key===']'){stop();flip(1);return;}if(key==='PageUp'||key==='['){stop();flip(-1);return;}
   if(/^[1-9]$/.test(key)){const i=Number(key)-1;if(i<count){stop();arm(s.page[i],i);focusSlot(i);}return;}
   if((key==='Enter'||key===' ')&&s.phase==='tray'){stop();take();return;}// Enter again takes the item, wherever focus is
   if((key==='Enter'||key===' ')&&!(e.target instanceof HTMLButtonElement)){stop();const item=s.page[s.cursor];if(item)press(item,s.cursor);return;}
   if(lower==='t'&&s.phase==='tray'){stop();take();}
  };
  window.addEventListener('keydown',onKey,true);return()=>window.removeEventListener('keydown',onKey,true);
 });

 if(!open)return null;
 const found=vending.found.length;
 const receipt=preview&&dispense?.packId==='preview'?{packSize:3,player:'Pelé',cards:['Pelé','Marta','Johan Cruyff']}:dispense?.packId?wallet.packs.find(p=>p.id===dispense.packId):undefined;
 const armedStatus=armed?status(armed):null;
 const club=armed?.kind==='costume'?getCostume(armed.costume):undefined;
 // LED: an explicit message wins, else the armed item's price or state, else the greeting with the machine's lesson.
 // Locked (Sep 30 2026): the armed item's unlock hint, or, with nothing armed on an all-locked page, the nearest unlock.
 const lockLed=vendingLockLed(armed&&armedStatus?{label:armed.label,status:armedStatus}:null,page.map(status));
 const ledView=led??lockLed??(armed&&armedStatus?{msg:armedStatus.kind==='buy'?`${armed.label} · ${armed.price} coins`:armedStatus.kind==='short'?armedStatus.note:`${armed.label}: ${armedStatus.note}`,
  sub:armedStatus.kind==='buy'?'Press the button again to buy':armed.blurb,tone:armedStatus.kind==='short'||armedStatus.kind==='locked'||armedStatus.kind==='soldout'?'warn' as const:armedStatus.kind==='buy'?undefined:'ok' as const}
  :{msg:'いらっしゃいませ!',sub:'Pick an item'});// greeting only: Japanese on top, the ask below (user, Sep 30 2026)
 const rowsOnPage=[...new Set(page.map(i=>rowOf.get(i.id)??i.row))];
 const fontSize=placement?Math.max(14,Math.min(18,Math.round(placement.w/29))):12;
 const view:VendingFaceView|null=placement&&{trayNote,placement,fontSize,compact:placement.h<430,
  machine:{id:machine.id,name:machine.name,color:machine.color,light:machine.light,ink:machine.ink},
  header:{label:rowsOnPage.map(r=>ROW_SHORT[r]??r).join(' · '),page:Math.min(pageIndex,pages.length-1)+1,pages:pages.length,special:rowsOnPage.includes('special')},
  slots:page.map((item,index)=>{const s=status(item);return {id:item.id,label:item.label,price:item.price,state:s.kind,special:rowOf.get(item.id)==='special',lit:item.id===armedId,vending:vendingSlot===item.id,kind:kindOf(item),picture:picture(item,false,true),
   ariaLabel:`${index+1}. ${item.label}. ${s.kind==='buy'||s.kind==='short'?`${item.price} coins`:s.note}${item.machine?'. Only here':''}`};}),
  cursor,led:ledView,balance:vending.balance,found:{short:`${found}/${VENDING_MACHINES.length} found`,label:`${found}/${VENDING_MACHINES.length} machines found`},phase,coinDrop,
  tray:dispense?{key:dispense.key,id:dispense.item.id,label:dispense.item.label,kind:kindOf(dispense.item),picture:picture(dispense.item)}:null};
 const overlay=story?<section className={styles.story} aria-label="Club story">
   <div className={styles.storyBar}><BackButton autoFocus onBack={()=>setStory(null)}/><strong>Football history</strong></div>
   <div className={styles.storyBody} data-modal-scroll><CostumeCollection active={story} onStoryChange={id=>setStory(id)} open={open} value={value} onChange={onChange} onNotice={msg=>setLed({msg,tone:'ok'})}
    isOwned={id=>isOwned(`costume:${id}`)} lockedText={id=>costumeEarned(coins,id)?'Buy it in the machine':`Unlocks at ${costumeUnlockBalls(id)} balls`}/></div>
  </section>
  :phase==='reward'&&dispense&&!receipt?<section className={styles.reward} data-vending-reward={dispense.item.id} aria-label="Your item" aria-live="polite">
    <div className={styles.rewardArt} data-kind={kindOf(dispense.item)}>{picture(dispense.item,true)}</div>
    <p className={styles.rewardTitle}>{dispense.item.label} is yours!</p>
    <p className={styles.rewardNote}>{dispense.item.blurb}</p>
    <div className={styles.rewardActions}>
     {status(dispense.item).kind==='owned'&&<button type="button" className={jobStyles.primary} autoFocus onClick={()=>{equip(dispense.item);dismissReward();}}>{readableBook(dispense.item)?'Read my book':dispense.item.kind==='display'?'In my collection':dispense.item.kind==='costume'?'Wear it':'Use it'}</button>}
     {dispense.item.kind==='costume'&&getCostume(dispense.item.costume)&&<button type="button" className={jobStyles.secondary} onClick={()=>{setStory(dispense.item.costume!);dismissReward();}}>Club story</button>}
     <button type="button" className={jobStyles.secondary} onClick={dismissReward}>Keep shopping</button>
    </div>
  </section>
  :club&&!preview?<button type="button" className={styles.storyChip} onClick={()=>setStory(armed!.costume!)}>Read the {club.club} club story</button>:null;

 return <div className={styles.root} data-preview={preview||undefined} data-reading-book={book||undefined} data-vending-machine={machine.id} data-vending-phase={phase} data-card-reveal={phase==='reward'&&Boolean(receipt)||undefined}>
  <div className={styles.hudDone}><DoneButton ref={exitButton} onDone={()=>onOpenChange(false)}/></div>
  <div className={`${jobStyles.wallet} ${styles.hudCoins}`} aria-live="polite" data-vending-coins={vending.balance}><span className={jobStyles.coin} aria-hidden="true"/><b>{vending.balance}</b><small>{preview?'coins · Preview':'coins'}</small></div>
  {phase==='reward'&&receipt&&<VendingCardReveal key={dispense?.key} cards={receipt.cards??[receipt.player]} preview={preview} origin={pickupOrigin} onClose={dismissReward}/>}
  {book&&<PlayerPopUpBook bookId={book} onClose={()=>{setBook(null);focusSlot(cursor);}}/>}
  {view&&!book&&<VendingFace ref={faceEl} view={view} entrance={faceEntrance} inactive={phase==='reward'&&Boolean(receipt)} overlay={overlay}
   events={{onSlot:i=>{const item=page[i];if(item)press(item,i);},onSlotFocus:setCursor,onCoin:coinSlot,onTray:take,onFlip:flip,onNextRow:nextRow}}/>}
 </div>;
}
