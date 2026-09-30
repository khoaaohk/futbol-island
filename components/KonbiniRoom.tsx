'use client';
import {useEffect,useMemo,useRef,useState,type PointerEvent as ReactPointerEvent,type ReactNode} from 'react';
import {useModalFocus} from '@/lib/konbini/useModalFocus';
import {gearPreviewLayers} from '@/lib/konbini/previewArt';
import dynamic from 'next/dynamic';
import {NavigationButton} from './DoneButton';
import KonbiniReveal,{revealItemFor,type RevealItem} from './KonbiniReveal';
import KonbiniDoorSlide from './KonbiniDoorSlide';
import VendingCardReveal from './VendingCardReveal';
import {Icon} from './Icon';
import styles from './KonbiniRoom.module.css';
// The coin balance is a read-only HUD display: the island's cream coin card (IslandJobs), not a gold button.
import jobStyles from './IslandJobs.module.css';
import {paintJoystick} from '@/lib/town/joystickFeedback';
import {useJoystickBounds} from '@/lib/town/useJoystickBounds';
import {useArcadeWallet,readArcadeWallet} from '@/lib/arcade/arcadeWallet';
import {buyVendingItem,useVending} from '@/lib/town/vendingWallet';
import {VENDING_STARTERS} from '@/lib/town/vendingLedger';
import {vendingItem,type VendingItem} from '@/lib/town/vendingCatalog';
import {LEARN_COINS_EARNED,learnToastTitle,type LearnCoinsEarned} from '@/lib/town/learnCoins';
// Side effect: the outdoor drink machines register their consumables (own daily limit) and collection group on this page too.
import '@/lib/town/drinkMachines';
import {parseKonbiniDoor,refreshKonbiniDeparture,KONBINI_RETURN_URL,type KonbiniDoor} from '@/lib/konbini/konbiniDoors';
import {FOOD_PER_DAY,POUCH_SIZE,FUELLED_UP,SHOP_NAMES,foodItem,foodNote,type FoodPurchase} from '@/lib/konbini/food';
import {buyFood,resolveFood,newPurchaseId,useKonbini,useKonbiniCollection,stampMagazine,foodBoughtToday} from '@/lib/konbini/foodStore';
import {SHELF_LESSONS,MAGAZINES,STAMP_CARD_SIZE,DECOR_INFO,cashierNpc,type Magazine,type ShelfId} from '@/lib/konbini/konbiniContent';
import {createPurchaseGate} from '@/lib/konbini/purchaseGate';
import {createKonbiniMusic,type KonbiniMusic,type MusicContext} from '@/lib/konbini/konbiniMusic';
import {konbiniAudioContext,konbiniSfx} from '@/lib/konbini/konbiniSound';
import {collectionProgress} from '@/lib/konbini/food';
import {isDrinkItem} from './KonbiniReveal';
import {isSoundEnabled} from '@/lib/games/sound';
import type {KonbiniScene,KonbiniPoi,KonbiniSlotView,KonbiniZoomView} from '@/lib/konbini/konbiniScene';
const NpcConversation=dynamic(()=>import('./NpcConversation'),{ssr:false});

/**
 * The walk-in Konbini (user, Sep 29 2026). A separate document like the Arcade: /konbini?door=main|cay. The island is not loaded
 * here; the scene module is lazy-loaded when the page mounts.
 * Browsing is IN-WORLD (the vending-machine pattern): "Look" zooms the camera onto the real shelf, products are tapped where they
 * sit (≥ 44 px targets over the 3D items), ← → move between sections, Back zooms out. Only the purchase reveal, a magazine's
 * lesson and the ATM read-out are overlays; the cashier talks in the island's NPC slide-out.
 * Everything teaches football: magazines (Laws, history, beach soccer), fridge (hydration), shelves (match-day fuel), cashier.
 */
type Overlay={kind:'magazine';id:string}|{kind:'atm'}|{kind:'stamps'};
type Reveal={item:RevealItem;purchase?:FoodPurchase;firstTime?:boolean;status?:string};
type Selected={slot:KonbiniSlotView}|null;

/** Long balances read as thousands in the header (e.g. 48133 → 48k); the exact figure stays in the aria-label and the ATM. */
const compactCoins=(n:number)=>n>=10000?`${Math.floor(n/1000)}k`:String(n);
export default function KonbiniRoom(){
 const [door,setDoor]=useState<KonbiniDoor|null>(null);
 useEffect(()=>{setDoor(parseKonbiniDoor(location.search));},[]);
 return door?<KonbiniInterior door={door}/>:<main className={styles.root} aria-label="Konbini"><KonbiniDoorSlide mode="arrive" ready={false}/></main>;
}

/** The magazine / ATM / stamp-card dialog: focus moves in, Escape closes it, Tab stays inside (code review finding 16). */
function OverlayPanel({kind,onClose,children}:{kind:Overlay['kind'];onClose:()=>void;children:ReactNode}){
 const ref=useRef<HTMLElement>(null);useModalFocus(ref,onClose);
 return <section ref={ref} tabIndex={-1} className={styles.panel} role="dialog" aria-modal="true" aria-label={kind==='magazine'?'Konbini magazine':kind==='atm'?'ATM and copier':'Stamp card'} data-konbini-panel={kind}>{children}</section>;
}

function KonbiniInterior({door}:{door:KonbiniDoor}){
 const shop=door;
 const canvas=useRef<HTMLCanvasElement>(null),room=useRef<KonbiniScene|null>(null),joy=useRef<HTMLDivElement>(null),pointer=useRef<number|null>(null),tap=useRef<{x:number;y:number}|null>(null),promptRef=useRef<HTMLButtonElement>(null),swipe=useRef<{x:number;y:number}|null>(null);
 const [firstFrame,setFirstFrame]=useState(false),[greeting,setGreeting]=useState(false),[coins,setCoins]=useState<{key:number;n:number}|null>(null),[shownBalance,setShownBalance]=useState<number|null>(null);
 const walletRef=useRef<HTMLSpanElement>(null);
 const [exitTry,setExitTry]=useState(0);
 const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[near,setNear]=useState<KonbiniPoi|null>(null),[leaving,setLeaving]=useState(false);
 const [zoom,setZoom]=useState<KonbiniZoomView|null>(null),[slots,setSlots]=useState<KonbiniSlotView[]>([]),[selected,setSelected]=useState<Selected>(null);
 const [overlay,setOverlay]=useState<Overlay|null>(null),[talking,setTalking]=useState(false);
 const [reveal,setReveal]=useState<Reveal|null>(null),[packReveal,setPackReveal]=useState<string[]|null>(null),[receipt,setReceipt]=useState<{label:string;price:number;key:number}|null>(null);
 const [busy,setBusy]=useState<string|null>(null),[message,setMessage]=useState(''),[toast,setToast]=useState(''),[answer,setAnswer]=useState<number|null>(null);
 // A synchronous gate held from the Buy tap until the reveal closes (code review finding 1): each Buy makes a fresh purchase id,
 // so a double tap or a held Enter during the receipt must not start a second purchase, receipt or coin shower.
 const gate=useRef(createPurchaseGate()).current;
 const release=()=>{gate.end();setBusy(null);};
 const pending=useRef<{item:string;id:string}|null>(null),leavingRef=useRef(false),music=useRef<KonbiniMusic|null>(null);
 // In-store music: this store's own original loop (lib/konbini/konbiniMusic.ts); starts on entry / first input, idles, stops on exit.
 useEffect(()=>{
  const readSettings=()=>{let enabled=isSoundEnabled(),volume=.04;try{enabled=enabled&&localStorage.getItem('fi2-music-enabled')!=='false';const raw=localStorage.getItem('fi2-music-volume'),v=raw===null?.04:Number(raw);if(Number.isFinite(v))volume=Math.max(0,Math.min(1,v));}catch{}return {enabled,volume};};
  const m=createKonbiniMusic(door,{context:()=>konbiniAudioContext() as unknown as MusicContext|null,settings:readSettings,hidden:()=>document.hidden,now:()=>performance.now(),setTimer:(fn,ms)=>setTimeout(fn,ms),clearTimer:id=>clearTimeout(id as ReturnType<typeof setTimeout>)});
  music.current=m;(window as unknown as {__konbiniMusic?:unknown}).__konbiniMusic=m;m.start();
  const input=(e:Event)=>{if(e.isTrusted)m.input();},vis=()=>m.visibility();
  for(const t of ['pointerdown','keydown','touchstart'])window.addEventListener(t,input,{capture:true,passive:true});document.addEventListener('visibilitychange',vis);
  return()=>{for(const t of ['pointerdown','keydown','touchstart'])window.removeEventListener(t,input,{capture:true});document.removeEventListener('visibilitychange',vis);m.dispose();music.current=null;};
 },[door]);
 const wallet=useArcadeWallet(),vending=useVending(),konbini=useKonbini(),collection=useKonbiniCollection();
 const joyRect=useJoystickBounds(joy,ready&&!zoom&&!overlay&&!reveal);
 const covered=!!overlay||!!reveal||!!packReveal||talking;
 const today=foodBoughtToday(),stamps=konbini.stamps.length,inPouch=konbini.purchases.filter(p=>p.paid&&p.fate==='pouch').length;
 const fuelled=today>=FOOD_PER_DAY;
 const npc=useMemo(()=>cashierNpc(shop,fuelled),[shop,fuelled]);
 const npcName=useRef(npc.name);npcName.current=npc.name;

 const leave=()=>{if(leavingRef.current)return;leavingRef.current=true;setTimeout(()=>music.current?.dispose(),420);setOverlay(null);room.current?.clearInput();refreshKonbiniDeparture(door);setLeaving(true);setTimeout(()=>window.location.assign(KONBINI_RETURN_URL),matchMedia('(prefers-reduced-motion:reduce)').matches?60:520);};
 /** Look at a shelf: zoom onto it. The ATM opens its read-out; the register also opens the cashier's slide-out. */
 const look=(p:KonbiniPoi|ShelfId)=>{const id=typeof p==='string'?p:p.id;setMessage('');setSelected(null);
  if(id==='atm'){setOverlay({kind:'atm'});return;}room.current?.zoomToPoi(id);if(id==='counter'){room.current?.greet();setTalking(true);}};
 useEffect(()=>{if(!canvas.current)return;let canceled=false;const node=canvas.current;
  import('@/lib/konbini/konbiniScene').then(({createKonbiniScene})=>{if(canceled)return;try{
   const scene=createKonbiniScene(node,shop,{onNear:setNear,onArrive:p=>look(p),onExit:()=>leave(),onZoom:v=>{setZoom(v);if(!v)setSelected(null);},onSlots:setSlots,onFirstFrame:()=>{setFirstFrame(true);},onZoomArrive:poi=>konbiniSfx.section(poi),onZoomStep:()=>konbiniSfx.whoosh(),
    onNudge:()=>setToast(`${npcName.current}: Dribble nice and gently in here! No kicking in the shop.`),
    onPrompt:(x,y,visible)=>{const b=promptRef.current;if(b){const half=(b.offsetWidth||160)/2,vw=window.innerWidth;b.style.left=`${Math.max(half+8,Math.min(vw-half-8,x))}px`;b.style.top=`${y}px`;b.style.visibility=visible?'visible':'hidden';}}});
   room.current=scene;(window as unknown as {__konbini?:unknown}).__konbini=scene;setReady(true);}catch{setFailed(true);}}).catch(()=>!canceled&&setFailed(true));
  return()=>{canceled=true;room.current?.dispose();room.current=null;delete (window as unknown as {__konbini?:unknown}).__konbini;};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[shop]);
 useEffect(()=>{room.current?.setCovered(covered);if(covered)stop();},[covered,ready]);
 useEffect(()=>{music.current?.duck(!!reveal||talking);},[reveal,talking]);
 useEffect(()=>{const on=(e:Event)=>{const d=(e as CustomEvent<LearnCoinsEarned>).detail;if(d)setToast(learnToastTitle(d.amount,d.reason));};window.addEventListener(LEARN_COINS_EARNED,on);return()=>window.removeEventListener(LEARN_COINS_EARNED,on);},[]);
 // Arrival (review items 1–2): the door chime as the light fades, and the cashier's greeting bubble pointing at the counter.
 useEffect(()=>{if(!firstFrame)return;room.current?.sound.chime();setGreeting(true);const t=setTimeout(()=>setGreeting(false),3200);return()=>clearTimeout(t);},[firstFrame]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),3600);return()=>clearTimeout(t);},[toast]);
 // Keyboard: Enter/E looks at the prompted shelf; while zoomed Enter buys the selected item (arrows/Escape live in the scene).
 useEffect(()=>{if(overlay||reveal||talking)return;const key=(e:KeyboardEvent)=>{if(e.repeat||e.target instanceof HTMLButtonElement)return;
  if((e.code==='Enter'||e.code==='KeyE')&&!zoom&&near){e.preventDefault();look(near);}else if(e.code==='Enter'&&zoom&&selected){e.preventDefault();void buySelected();}};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[near,zoom,selected,overlay,reveal,talking]);

 // ---- Joystick (the Arcade room's control) ----
 const stop=(e?:{pointerId:number})=>{if(e&&e.pointerId!==pointer.current)return;const id=pointer.current;pointer.current=null;joyRect.current=null;if(id!==null&&joy.current?.hasPointerCapture(id))joy.current.releasePointerCapture(id);room.current?.setStick(0,0);paintJoystick(joy.current,0,0);};
 const move=(e:ReactPointerEvent<HTMLDivElement>)=>{if(pointer.current!==e.pointerId)return;e.preventDefault();const r=joyRect.current??(joyRect.current=e.currentTarget.getBoundingClientRect()),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,scale=Math.min(1,36/Math.max(1,Math.hypot(dx,dy))),x=dx*scale,y=dy*scale;room.current?.setStick(x/36,y/36);paintJoystick(joy.current,x,y);};

 // ---- Tapping a product on the zoomed shelf ----
 /**
  * Hit areas (user, Sep 30 2026: "not all the items are selectable"): one target per placed product, centred on its projected
  * visual centre and grown toward its neighbours (≥ 44 px), and every tap resolves to the NEAREST product centre, so packed
  * shelves have no dead zones and overlapping targets never open the item behind.
  */
 const hitSlots=useMemo(()=>slots.map(s=>{let dx=Infinity,dy=Infinity;for(const o of slots){if(o===s)continue;const ax=Math.abs(o.x-s.x),ay=Math.abs(o.y-s.y);if(ay<ax*.6)dx=Math.min(dx,ax);else if(ax<ay*.6)dy=Math.min(dy,ay);}
  const grow=(d:number)=>Math.max(44,s.size,Math.min(Number.isFinite(d)?d:s.size,s.size*1.8,140));return {...s,w:grow(dx),h:grow(dy)};}),[slots]);
 function nearestSlot(clientX:number,clientY:number,within=Infinity){const r=canvas.current?.getBoundingClientRect(),x=clientX-(r?.left??0),y=clientY-(r?.top??0);let best:KonbiniSlotView|null=null,bd=within;
  for(const s of slots){const d=Math.hypot(s.x-x,s.y-y);if(d<bd){bd=d;best=s;}}return best;}
 // Preview before buying (user, Sep 30 2026): the big iso view in PREVIEW mode. Nothing is charged, collected or pouched here;
 // "Buy" runs the normal purchase flow, "Back" returns to the zoomed shelf with the item still selected.
 const [preview,setPreview]=useState<{item:RevealItem;price:number;gear?:VendingItem}|null>(null);
 function previewFood(id:string){const r=revealItemFor(id,'PREVIEW'),f=foodItem(id);if(r&&f)setPreview({item:r,price:f.price});}
 function previewGear(it:VendingItem){const d=DECOR_INFO[it.kind==='pack'?'pack':'ball'];
  setPreview({item:{id:it.id,label:it.label,jp:it.kind==='pack'?'カードパック':'サッカーボール',blurb:it.blurb,note:d?.blurb??'',layers:gearPreviewLayers(it.id,it.kind),kind:'food',labels:{note:'Football tip'}},price:it.price,gear:it});}
 function choose(slot:KonbiniSlotView){setMessage('');
  if(slot.kind==='magazine'){setSelected({slot});room.current?.highlightSlot(slot.key,true,()=>{setAnswer(null);setOverlay({kind:'magazine',id:slot.ref});room.current?.highlightSlot(null);});return;}
  setSelected({slot});room.current?.highlightSlot(slot.key);konbiniSfx.flick();try{navigator.vibrate?.(10);}catch{/* no haptics */}}
 async function buySelected(){const s=selected?.slot;if(!s)return;if(s.kind==='food'){const f=foodItem(s.ref);if(f)await buy(f.id);}else if(s.kind==='gear'){const it=vendingItem(s.ref);if(it)await buyGear(it);}}
 /** Paying (review items 9–10): coins fly from the wallet to the counter while it counts down, then a ka-ching. DOM only. */
 function payFx(price:number){const from=wallet.balance+price;setCoins({key:Date.now(),n:Math.min(6,Math.max(3,Math.round(price/2)))});konbiniSfx.kaching();for(let i=0;i<4;i++)konbiniSfx.coin(i);
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){setShownBalance(null);return;}const t0=performance.now();const step=()=>{const k=Math.min(1,(performance.now()-t0)/600);setShownBalance(Math.round(from-price*k));if(k<1)requestAnimationFrame(step);else setTimeout(()=>setShownBalance(null),200);};requestAnimationFrame(step);}
 // ---- Buying food (one purchase id per deliberate Buy: a double tap or retry can't charge twice) ----
 async function buy(id:string){
  const f=foodItem(id);if(!f||!gate.begin())return;setMessage('');
  const pid=pending.current?.item===f.id?pending.current.id:newPurchaseId();pending.current={item:f.id,id:pid};setBusy(f.id);
  let r:Awaited<ReturnType<typeof buyFood>>;try{r=await buyFood(f.id,pid,shop);}catch{release();return;}
  if(!r.ok){if(!r.charged)pending.current=null;release();setMessage(r.limit?FUELLED_UP:r.reason);return;}// charged: a retry reuses the same id (no second debit)
  // Paid: the gate (and the disabled Buy) stay held through the receipt and the reveal; closeReveal releases it.
  pending.current=null;payFx(f.price);setReceipt({label:f.label,price:f.price,key:Date.now()});const res=r;
  setTimeout(()=>{setReceipt(null);const item=revealItemFor(f.id,res.firstTime?'NEW IN YOUR KONBINI COLLECTION':SHOP_NAMES[shop].toUpperCase());if(item)setReveal({item,purchase:res.purchase,firstTime:res.firstTime});else release();},matchMedia('(prefers-reduced-motion:reduce)').matches?0:900);
 }
 function closeReveal(fate?:'eat'|'pouch'){
  const r=reveal;if(!r)return;
  if(r.purchase){const still=konbini.purchases.find(p=>p.id===r.purchase!.id)?.fate==='hand';
   if(still){const choice=fate??(inPouch<POUCH_SIZE?'pouch':'eat');const res=resolveFood(r.purchase.id,choice);
    if(res.ok&&choice==='eat'){const cell=foodItem(r.purchase.item)?.cell;setReveal(null);release();setSelected(null);room.current?.highlightSlot(null);room.current?.zoomOut();
     if(cell!==undefined)setTimeout(()=>room.current?.eat(cell),matchMedia('(prefers-reduced-motion:reduce)').matches?30:900);setToast(`Yum! ${res.note??''}`);return;}
    if(res.ok&&choice==='pouch'&&fate==='pouch'){setReveal({...r,status:`Saved to your Snacks pouch (${inPouch+1}/${POUCH_SIZE}). Eat it any time from your backpack.`});return;}
    if(!res.ok&&fate){setReveal({...r,status:res.reason});return;}}}
  setReveal(null);release();
 }
 function doneReveal(){const r=reveal;const still=r?.purchase&&konbini.purchases.find(p=>p.id===r.purchase!.id)?.fate==='hand';closeReveal();
  if(still&&r?.purchase){const drink=isDrinkItem(r.purchase.item);setToast(inPouch<POUCH_SIZE?`Saved to your Snacks pouch (${inPouch+1}/${POUCH_SIZE}). ${drink?'Drink':'Eat'} it any time from your backpack.`:`Your pouch was full, so you ${drink?'drank':'ate'} it now. ${foodNote(r.purchase.item)}`);}}
 // ---- Balls and packs from the gear shelf: the same vending ledger as the machines (owned once, one debit) ----
 async function buyGear(item:VendingItem){
  // Packs are never "owned", so without the gate a double tap opened two packs: it stays held until the pack reveal closes.
  if(!gate.begin())return;setBusy(item.id);setMessage('');
  let r:Awaited<ReturnType<typeof buyVendingItem>>;try{r=await buyVendingItem(item);}catch{release();return;}
  if(!r.ok){release();setMessage(r.reason);return;}payFx(item.price);setReceipt({label:item.label,price:item.price,key:Date.now()});const res=r;
  setTimeout(()=>{setReceipt(null);if(item.kind==='pack'&&res.packId){const p=readArcadeWallet().packs.find(x=>x.id===res.packId);if(p){setPackReveal(p.cards??[p.player]);return;}}else setMessage(`${item.label} is yours! Find it in Make it yours → Backpack.`);release();},900);
 }
 const ownedGear=(it:VendingItem)=>it.kind!=='pack'&&(VENDING_STARTERS.has(it.id)||vending.owned.includes(it.id));
 function Sources({list}:{list:{title:string;url:string}[]}){if(!list.length)return null;return <details className={styles.sources}><summary>Sources</summary><ul>{list.map(s=><li key={s.url+s.title}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul></details>;}

 /** The card under a zoomed shelf: the tapped product's tag (flipped: English + Japanese, price, a one-line note, Buy), or the
  *  section's lesson. */
 function zoomCard(){
  const s=selected?.slot;
  if(s&&s.kind==='food'){const f=foodItem(s.ref);if(f){const got=!!collection.items[f.id];return <div className={styles.tag} data-konbini-tag={f.id}>
   <div className={styles.tagHead}><b>{f.label}</b><small lang="ja">{f.jp}</small><span className={styles.price}>{f.price} coins</span></div>
   <p>{f.blurb} {got&&<em>In your collection.</em>}</p><p className={styles.note}>{foodNote(f.id)}</p>
   <div className={styles.tagActions}><button type="button" className={styles.buy} data-konbini-buy={f.id} disabled={!!busy||fuelled} onClick={()=>void buy(f.id)}>{busy===f.id?'…':fuelled?'Fuelled up today':`Buy · ${f.price} coins`}</button>
    <button type="button" className={styles.secondary} data-konbini-preview={f.id} onClick={()=>previewFood(f.id)}>Preview</button>
    <span className={styles.small}>{Math.max(0,FOOD_PER_DAY-today)}/{FOOD_PER_DAY} snacks left today · pouch {inPouch}/{POUCH_SIZE}</span></div></div>;}}
  if(s&&s.kind==='decor'){const d=DECOR_INFO[s.ref];if(d)return <div className={styles.tag} data-konbini-tag={s.ref}>
   <div className={styles.tagHead}><b>{d.label}</b><small lang="ja">{d.jp}</small><span className={styles.look}>Just looking</span></div>
   <p>{d.blurb}</p>{d.sources&&<Sources list={d.sources}/>}</div>;}
  if(s&&s.kind==='gear'){const it=vendingItem(s.ref);if(it){const owned=ownedGear(it);return <div className={styles.tag} data-konbini-tag={it.id}>
   <div className={styles.tagHead}><b>{it.label}</b><span className={styles.price}>{it.price} coins</span></div><p>{it.blurb}</p>
   <div className={styles.tagActions}><button type="button" className={styles.buy} data-konbini-buy-gear={it.id} disabled={owned||!!busy} onClick={()=>void buyGear(it)}>{owned?'Owned':busy===it.id?'…':`Buy · ${it.price} coins`}</button>
    <button type="button" className={styles.secondary} data-konbini-preview={it.id} onClick={()=>previewGear(it)}>Preview</button></div></div>;}}
  const poi=zoom?.poi;if(!poi)return null;
  if(poi==='counter')return <div className={styles.tag} data-konbini-lesson-card="counter"><div className={styles.tagHead}><b>{npc.name}</b><small>{npc.role}</small></div>
   <div className={styles.tagActions}><button type="button" className={styles.buy} data-konbini-talk onClick={()=>setTalking(true)}>Talk to {npc.name}</button><button type="button" className={styles.secondary} data-konbini-stamps onClick={()=>setOverlay({kind:'stamps'})}>Stamp card {stamps}/{STAMP_CARD_SIZE}</button></div></div>;
  if(poi==='magazines')return <div className={styles.tag} data-konbini-lesson-card="magazines"><div className={styles.tagHead}><b>Magazine table</b><small>Stamp card {stamps}/{STAMP_CARD_SIZE}</small></div><p>Tap a magazine to read it. Every magazine you read gets a stamp: fill the card across both Konbinis!</p></div>;
  const lesson=SHELF_LESSONS[poi as keyof typeof SHELF_LESSONS];if(!lesson)return null;
  return <div className={styles.tag} data-konbini-lesson-card={poi}><div className={styles.tagHead}><b>{lesson.title}</b></div><p>{lesson.lesson}</p><Sources list={lesson.sources}/><p className={styles.small}>Tap an item on the shelf to see it.</p></div>;
 }
 function overlayBody(o:Overlay){
  if(o.kind==='magazine'){const m=MAGAZINES.find(x=>x.id===o.id) as Magazine;return <article className={styles.magazine} data-konbini-lesson={m.id}>
   <header style={{background:m.cover,color:m.ink}}><small>{m.title} · {m.issue}</small><h2>{m.headline}</h2></header>
   <ol>{m.lesson.map(l=><li key={l}>{l}</li>)}</ol>
   <div className={styles.check}><b>{m.check.question}</b><div>{m.check.options.map((opt,i)=><button key={opt} type="button" data-konbini-answer={i} data-state={answer===null?undefined:i===m.check.answer?'right':i===answer?'wrong':undefined} disabled={answer!==null} onClick={()=>{setAnswer(i);if(i===m.check.answer)konbiniSfx.correct();else konbiniSfx.wrong();setTimeout(()=>konbiniSfx.thunk(),420);void stampMagazine(m.id);}}>{opt}</button>)}</div>
    {answer!==null&&<p role="status" data-correct={answer===m.check.answer||undefined}>{answer===m.check.answer?'Correct! ':'Not quite: '}{m.check.options[m.check.answer]}. <span className={styles.stampPop}>★ Stamp!</span></p>}</div>
   <Sources list={m.sources}/></article>;}
  if(o.kind==='stamps')return <><h2>Stamp card</h2><div className={styles.stamps}>{MAGAZINES.map(m=><span key={m.id} data-on={konbini.stamps.includes(m.id)||undefined} title={m.headline}>{konbini.stamps.includes(m.id)?'★':m.shop==='cay'?'CAY':'SQ'}</span>)}</div><p className={styles.small}>{stamps}/{STAMP_CARD_SIZE} stamps (Island Square and Coral Cay magazines). A full card pays 5 learning coins, once.</p></>;
  return <><h2>ATM & copier</h2><p className={styles.lesson}>Your coins: <b data-konbini-balance>{wallet.balance}</b>. Coins come from lessons, the ball hunt, island jobs and the arcade. Learning pays best!</p>
   <p className={styles.small}>Snacks today: {today}/{FOOD_PER_DAY} · Konbini Collection {Object.keys(collection.items).length} items · Stamp card {stamps}/{STAMP_CARD_SIZE}</p>
   <p className={styles.small}>The copier prints your stamp card: {Array.from({length:STAMP_CARD_SIZE},(_,i)=>i<stamps?'★':'☆').join(' ')}</p></>;
 }

 return <main aria-label={SHOP_NAMES[shop]} className={styles.root} data-konbini-room={shop} data-ready={ready} data-shop={shop} data-zoomed={!!zoom}>
  <header className={styles.header}>{zoom?<NavigationButton back label="Back" data-konbini-back onNavigate={()=>{setSelected(null);room.current?.zoomOut();}} immediate/>:<NavigationButton back label="Exit" key={exitTry} onNavigate={()=>{if(room.current){room.current.leave();const n=exitTry;setTimeout(()=>{if(!leavingRef.current)setExitTry(n+1);},5000);}else leave();}}/>}
   {zoom&&<span className={styles.section} data-konbini-section={zoom.poi} aria-live="polite">{zoom.label}</span>}
   <div className={styles.headerActions}><span ref={walletRef} className={`${jobStyles.wallet} ${styles.hudWallet}`} data-konbini-wallet data-paying={shownBalance!==null||undefined} aria-label={`${shownBalance??wallet.balance} coins`}><span className={jobStyles.coin} aria-hidden="true"/><b>{compactCoins(shownBalance??wallet.balance)}</b><small>coins</small></span></div></header>
  <canvas ref={canvas} tabIndex={0} className={styles.canvas} aria-label={`Walkable ${SHOP_NAMES[shop]}. Use WASD or arrow keys to walk, then Enter to look at a shelf. Tap a shelf to walk there.`}
   onPointerDown={e=>{tap.current={x:e.clientX,y:e.clientY};swipe.current=zoom?{x:e.clientX,y:e.clientY}:null;}}
   onPointerUp={e=>{const p=tap.current,sw=swipe.current;tap.current=null;swipe.current=null;
    if(zoom&&sw&&Math.abs(e.clientX-sw.x)>50&&Math.abs(e.clientX-sw.x)>Math.abs(e.clientY-sw.y)){setSelected(null);room.current?.zoomStep(e.clientX<sw.x?1:-1);return;}
    if(zoom&&p&&Math.hypot(e.clientX-p.x,e.clientY-p.y)<12){const n=nearestSlot(e.clientX,e.clientY,72);if(n)choose(n);return;}
    if(!zoom&&p&&Math.hypot(e.clientX-p.x,e.clientY-p.y)<12)room.current?.pick(e.clientX,e.clientY);}}/>
  {failed&&<div className={styles.error}><h2>The Konbini couldn’t load.</h2><button type="button" onClick={leave}>Back to the island</button></div>}
  {near&&!zoom&&!overlay&&!reveal&&<button ref={promptRef} type="button" className={`store-enter-prompt ${styles.prompt}`} data-konbini-prompt={near.id} onClick={()=>look(near)}>{near.verb} · {near.label}</button>}
  {zoom&&<>
   {zoom.arrived&&<div className={styles.slots} aria-label={`${zoom.label}: items on the shelf`}>{hitSlots.map(s=>{const label=s.kind==='food'?foodItem(s.ref)?.label:s.kind==='gear'?vendingItem(s.ref)?.label:s.kind==='decor'?DECOR_INFO[s.ref]?.label:MAGAZINES.find(m=>m.id===s.ref)?.headline;
    return <button key={s.key} type="button" className={styles.slot} data-konbini-slot={s.ref} data-kind={s.kind} data-selected={selected?.slot.key===s.key||undefined} aria-label={label??s.ref} style={{left:s.x-s.w/2,top:s.y-s.h/2,width:s.w,height:s.h}} onClick={e=>choose(e.detail?nearestSlot(e.clientX,e.clientY)??s:s)}/>;})}</div>}
   <button type="button" className={`${styles.arrow} ${styles.prev}`} data-konbini-prev aria-label="Previous section" disabled={zoom.index<=0} onClick={()=>{setSelected(null);room.current?.zoomStep(-1);}}><Icon name="back" size={22}/></button>
   <button type="button" className={`${styles.arrow} ${styles.next}`} data-konbini-next aria-label="Next section" disabled={zoom.index>=zoom.count-1} onClick={()=>{setSelected(null);room.current?.zoomStep(1);}}><Icon name="arrow" size={22}/></button>
   {zoom.arrived&&!reveal&&!preview&&<div className={styles.card}>{zoomCard()}{message&&<p className={styles.message} role="status" data-konbini-message>{message}</p>}</div>}
  </>}
  {receipt&&!reveal&&<div key={receipt.key} className={styles.receipt} data-konbini-receipt aria-live="polite"><b>しま KONBINI</b><span>{receipt.label}</span><span>{receipt.price} coins</span><i>ありがとうございました · Thank you!</i></div>}
  {overlay&&!reveal&&<div className={styles.panelWrap} onPointerDown={e=>{if(e.target===e.currentTarget)setOverlay(null);}}>
   <OverlayPanel kind={overlay.kind} onClose={()=>setOverlay(null)}>
    <NavigationButton className={styles.close} label="Done" onNavigate={()=>setOverlay(null)} immediate/>{overlayBody(overlay)}</OverlayPanel></div>}
  {preview&&!reveal&&<KonbiniReveal key={`preview:${preview.item.id}`} item={preview.item} onDone={()=>setPreview(null)} preview={{price:preview.price,onBack:()=>setPreview(null),
   onBuy:()=>{const p=preview;setPreview(null);if(p.gear)void buyGear(p.gear);else void buy(p.item.id);},
   buyDisabled:preview.gear?ownedGear(preview.gear)||!!busy:fuelled||!!busy,buyLabel:preview.gear?(ownedGear(preview.gear)?'Owned':undefined):fuelled?'Fuelled up today':undefined}}/>}
  {reveal&&<KonbiniReveal item={reveal.item} firstTime={reveal.firstTime} status={reveal.status}
   onEat={reveal.purchase?()=>closeReveal('eat'):undefined} onSave={reveal.purchase?()=>closeReveal('pouch'):undefined}
   saveDisabled={!!reveal.status&&reveal.status.startsWith('Saved')||inPouch>=POUCH_SIZE&&konbini.purchases.find(p=>p.id===reveal.purchase?.id)?.fate==='hand'}
   onDone={doneReveal} collection={reveal.firstTime?(()=>{const p=collectionProgress(collection);return {have:p.have,total:p.total};})():undefined}/>}
  {packReveal&&<VendingCardReveal cards={packReveal} preview={false} origin={null} onClose={()=>{setPackReveal(null);release();}}/>}
  <NpcConversation npc={npc} open={talking} onOpenChange={setTalking} practice={false}
   actions={[{label:'What’s good today? (browse the counter)',onClick:()=>{setTalking(false);room.current?.zoomToPoi('hot');}},{label:`My stamp card (${stamps}/${STAMP_CARD_SIZE})`,onClick:()=>{setTalking(false);setOverlay({kind:'stamps'});}}]}/>
  {toast&&<p className={styles.toast} role="status" data-konbini-toast>{toast}</p>}
  {greeting&&!zoom&&<p className={styles.greeting} data-konbini-greeting data-side={shop==='cay'?'left':'right'} role="status"><b>{npc.name}:</b> Irasshaimase! Welcome in! <span aria-hidden="true">{shop==='cay'?'← counter':'counter →'}</span></p>}
  {coins&&<div key={coins.key} className={styles.coins} aria-hidden="true" onAnimationEnd={e=>{if(e.currentTarget===e.target)setCoins(null);}}>{Array.from({length:coins.n},(_,i)=><i key={i} style={{animationDelay:`${i*60}ms`}}/>)}</div>}
  {!zoom&&<div className="touch-controls"><div className="joystick" data-edge="false" ref={joy} draggable={false} onDragStart={e=>e.preventDefault()} onContextMenu={e=>e.preventDefault()} role="group" aria-label="Move around the Konbini"
   onPointerDown={e=>{if(pointer.current!==null||!ready)return;e.preventDefault();pointer.current=e.pointerId;joyRect.current=null;e.currentTarget.setPointerCapture(e.pointerId);move(e);}} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}><i className="joystick-contact" aria-hidden="true"><i className="joystick-contact-arc"/></i><span aria-hidden="true"/></div></div>}
  <KonbiniDoorSlide mode={leaving?'leave':'arrive'} key={leaving?'leave':'arrive'} ready={firstFrame||failed}/>
 </main>;
}
