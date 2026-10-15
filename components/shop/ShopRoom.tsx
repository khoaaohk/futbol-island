'use client';
import {useCallback,useEffect,useRef,useState,type PointerEvent as ReactPointerEvent} from 'react';
import dynamic from 'next/dynamic';
import {NavigationButton} from '../DoneButton';
import CoinPill from './CoinPill';
import ShopDoorSlide from './ShopDoorSlide';
import styles from './ShopRoom.module.css';
import {BallStudio,BootStudio,JerseyStudio,type StudioProps} from './studios';
import {useModalFocus} from '@/lib/konbini/useModalFocus';
import {useArcadeWallet,spendArcadeCoins} from '@/lib/arcade/arcadeWallet';
import {refreshShopDeparture,SHOP_RETURN_URL} from '@/lib/shop/shopDoors';
import {buyDesign,loadOwned,writeOwned,KIND_LABEL,SHOP_KINDS,SHOP_OWNED_KEY,type OwnedItem,type ShopKind,type ShopOwned} from '@/lib/shop/shopPurchases';
import {jerseyPrice,validateJersey,JERSEY_BASE_PRICE,type JerseyDesign} from '@/lib/shop/jersey';
import {bootPrice,validateBoots,PRICE as BOOT_PRICE,type BootDesign} from '@/lib/shop/boots';
import {ballPrice,validateBall,PRICE as BALL_PRICE} from '@/lib/shop/ball';
import {paintJoystick} from '@/lib/town/joystickFeedback';
import {useJoystickBounds} from '@/lib/town/useJoystickBounds';
import type {NpcDefinition} from '@/lib/town/npcDialogues';
import type {ShopScene} from '@/lib/shop/shopScene';
import type {ShopPoi,ShopStation} from '@/lib/shop/shopLayout';
import {SHOP_CLERK,SHOW_ME,shopNpcDefs} from '@/lib/shop/shopCast';
import {createShopAmbience,shopClickCue,shopSfx,unlockShopAudio,type ShopAmbience} from '@/lib/shop/shopSound';
import {countStudioOpen,countMyKitOpen,countPurchase} from '@/lib/analytics/shopEvents';
import {enterActivity} from '@/lib/analytics/tracker';
const NpcConversation=dynamic(()=>import('../NpcConversation'),{ssr:false});

/**
 * The walk-in Kit Shop (Oct 12 2026, users: "turn the community hall building into a futbol shop … you have two options in this
 * shop, to customize a jersey and also boots", then "customize balls too"). A separate document like the Museum, the Konbini and the
 * Arcade (/shop): the island is not loaded here. The interior scene (lib/shop/shopScene.ts) is lazy-loaded on mount and sleeps at
 * rest; each studio is its own lazy chunk (components/shop/studios.tsx) and the shop scene stops drawing while one is open.
 *
 * Walk-in (Oct 12 2026, user: "for the boots store, player should be able to walk inside. there should be npcs here along with
 * clerk"): the Museum's controls. You walk in through the glass doors (WASD / arrows, the joystick, or tap where to go); standing
 * at a wall shows its prompt ("Design a jersey", "Design boots", "Design a ball"), and the prompt, E or Enter opens that studio;
 * closing it leaves you on the same spot. Femi the clerk at the till and five shoppers talk football kit in the island's NPC
 * slide-out (components/NpcConversation.tsx); the clerk's "Show me" replies walk you to a studio. Walking out of the doors, Done
 * or Escape goes back to the island at the shop door (/?from=shop). The station cards stay as a direct shortcut.
 *
 * Football learning: every station names a real piece of kit knowledge (why teams wear numbers and contrasting colours, how studs
 * match the surface, how ball panels changed) and the studios teach it as you design. Buying uses island coins only, through the
 * shared wallet's idempotent spend (never real money): one charge per design, recorded in fi2-shop-owned-v1 (synced).
 */
const STATIONS:{id:ShopStation;kind:ShopKind;title:string;line:string;from:number}[]=[
 {id:'jersey',kind:'jersey',title:'Jersey studio',line:'Numbers help referees and teammates spot you fast.',from:JERSEY_BASE_PRICE},
 {id:'boots',kind:'boots',title:'Boot studio',line:'Pick studs that grip your pitch: grass, turf or indoor.',from:BOOT_PRICE.base},
 {id:'ball',kind:'ball',title:'Ball studio',line:'Fewer panels make a rounder, truer ball.',from:BALL_PRICE.base},
];
const STUDIO:Record<ShopStation,React.ComponentType<StudioProps>>={jersey:JerseyStudio,boots:BootStudio,ball:BallStudio};
type Toast={tone:'ok'|'warn';text:string};

/** A swatch for an owned design: its main colours, read defensively (the design came from storage). */
function swatch(item:OwnedItem):string[]{
 const d=item.design as Record<string,unknown>|null;const pick=(...v:unknown[])=>v.filter((x):x is string=>typeof x==='string'&&/^#[0-9a-f]{6}$/i.test(x)).slice(0,3);
 if(!d)return [];if(item.kind==='jersey')return pick(d.primary,d.secondary,d.accent);
 const c=d.colors as Record<string,unknown>|undefined;return item.kind==='boots'?pick(c?.toe,c?.mid,c?.soleplate):pick(c?.a,c?.b,c?.c);
}

function MyKit({owned,onWear,onClose}:{owned:ShopOwned;onWear:(item:OwnedItem)=>void;onClose:()=>void}){
 const ref=useRef<HTMLElement>(null);useModalFocus(ref,onClose);
 return <section ref={ref} tabIndex={-1} className={styles.panel} role="dialog" aria-modal="true" aria-label="My kit" data-shop-mykit>
  <header className={styles.panelHead}><h2>My kit</h2><button type="button" className={styles.close} onClick={onClose} aria-label="Close my kit">×</button></header>
  {owned.items.length===0?<p className={styles.empty}>Nothing bought yet. Design something in a studio, save it, then buy it with island coins.</p>:
   SHOP_KINDS.map(kind=>{const items=owned.items.filter(i=>i.kind===kind);if(!items.length)return null;return <div key={kind} className={styles.kindGroup}>
    <h3>{KIND_LABEL[kind]}</h3>
    <ul>{items.slice().reverse().map(item=>{const wearing=owned.wearing[kind]===item.id;return <li key={item.id} data-owned={item.id}>
     <span className={styles.swatch} aria-hidden="true">{swatch(item).map((c,i)=><i key={i} style={{background:c}}/>)}</span>
     <span className={styles.itemName}>{item.name}<small>{item.price} coins</small></span>
     {wearing?<span className={styles.wearing}>Your pick</span>:<button type="button" className={styles.secondary} onClick={()=>onWear(item)}>Pick this</button>}
    </li>;})}</ul></div>;})}
  {/* Oct 12 2026 (user: "Don't show on player"): bought kit stays in the shop; nothing on the island reads fi2-shop-owned-v1. */}
  <p className={styles.note}>Your kit lives here in the Kit Shop and is saved with your save code.</p>
 </section>;
}

export default function ShopRoom(){
 const canvas=useRef<HTMLCanvasElement>(null),room=useRef<ShopScene|null>(null),joy=useRef<HTMLDivElement>(null),pointer=useRef<number|null>(null),promptRef=useRef<HTMLButtonElement>(null),tap=useRef<{x:number;y:number}|null>(null);
 const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[firstFrame,setFirstFrame]=useState(false),[leaving,setLeaving]=useState(false);
 const [near,setNear]=useState<ShopPoi|null>(null),[studio,setStudio]=useState<ShopStation|null>(null),[talking,setTalking]=useState<NpcDefinition|null>(null),[greeting,setGreeting]=useState(false),[hint,setHint]=useState(true);
 const [myKit,setMyKit]=useState(false),[toast,setToast]=useState<Toast|null>(null),[owned,setOwned]=useState<ShopOwned>(()=>({v:1,items:[],wearing:{}}));
 const wallet=useArcadeWallet(),leavingRef=useRef(false),buying=useRef(false),toastTimer=useRef<ReturnType<typeof setTimeout>>();
 const ambience=useRef<ShopAmbience|null>(null);
 useEffect(()=>{setOwned(loadOwned());const sync=(e:StorageEvent)=>{if(e.key===SHOP_OWNED_KEY)setOwned(loadOwned());};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
 const say=useCallback((t:Toast)=>{setToast(t);clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(null),t.tone==='ok'?3600:4800);},[]);
 useEffect(()=>()=>clearTimeout(toastTimer.current),[]);
 useEffect(()=>studio?enterActivity('kit_studio'):undefined,[studio]);// admin analytics: time designing in a studio (module variable, no render); the rest of /shop is 'kit_shop'
 const covered=!!studio||myKit||!!talking;
 const joyRect=useJoystickBounds(joy,ready&&!covered);

 // Done (or walking out of the doors) exits straight away: door slide, then the island at the shop door, like the Museum.
 const leave=useCallback(()=>{if(leavingRef.current)return;leavingRef.current=true;setStudio(null);setMyKit(false);setTalking(null);room.current?.clearInput();refreshShopDeparture();setLeaving(true);
  ambience.current?.fadeOut(.4);setTimeout(()=>ambience.current?.dispose(),420);
  setTimeout(()=>window.location.assign(SHOP_RETURN_URL),matchMedia('(prefers-reduced-motion:reduce)').matches?60:520);},[]);
 /** Open a studio (the prompt, E / Enter, arriving at a tapped wall, or a station card). Closing it leaves you where you stood. */
 const open=useCallback((s:ShopStation)=>{if(leavingRef.current)return;setTalking(null);setStudio(s);countStudioOpen(STATIONS.find(x=>x.id===s)!.kind);},[]);
 const closeStudio=useCallback(()=>{setStudio(null);canvas.current?.focus({preventScroll:true});},[]);
 /** Act on a spot: a wall opens its studio, a person opens the chat. */
 const act=useCallback((p:ShopPoi)=>{if(leavingRef.current)return;if(p.kind==='station'&&p.station){open(p.station);return;}
  const def=p.npc==='clerk'?SHOP_CLERK.def:shopNpcDefs().find(d=>d.id===p.npc);if(def){if(p.npc==='clerk')room.current?.greet();setTalking(def);}},[open]);
 const actRef=useRef(act);actRef.current=act;
 // The chat keeps showing who you talked to while its drawer slides out.
 const lastTalk=useRef<NpcDefinition|null>(null);if(talking)lastTalk.current=talking;

 useEffect(()=>{if(!canvas.current)return;let canceled=false;const node=canvas.current;
  import('@/lib/shop/shopScene').then(({createShopScene})=>{if(canceled)return;try{
   const scene=createShopScene(node,{onFirstFrame:()=>setFirstFrame(true),onNear:setNear,onArrive:p=>actRef.current(p),onExit:()=>leave(),
    onPrompt:(x,y,visible)=>{const b=promptRef.current;if(b){const half=(b.offsetWidth||160)/2,vw=window.innerWidth,l=`${Math.round(Math.max(half+8,Math.min(vw-half-8,x))*2)/2}px`,t=`${Math.round(Math.max(56,y)*2)/2}px`,v=visible?'visible':'hidden';if(b.style.left!==l)b.style.left=l;if(b.style.top!==t)b.style.top=t;if(b.style.visibility!==v)b.style.visibility=v;}}});
   room.current=scene;(window as unknown as {__shop?:unknown}).__shop={scene,get room(){return {studio:studioRef.current,myKit:myKitRef.current,talking:talkingRef.current?.id??null};}};setReady(true);
  }catch(err){console.error('kit shop scene failed',err);setFailed(true);}}).catch(()=>!canceled&&setFailed(true));
  return()=>{canceled=true;room.current?.dispose();room.current=null;delete (window as unknown as {__shop?:unknown}).__shop;};},[leave]);
 const studioRef=useRef(studio),myKitRef=useRef(myKit),talkingRef=useRef(talking);studioRef.current=studio;myKitRef.current=myKit;talkingRef.current=talking;
 // While a studio, My kit or a chat covers the store, its scene draws nothing (and the joystick lets go).
 useEffect(()=>{room.current?.setCovered(covered);if(covered)stop();},[covered,ready]);
 // The store ambience (lib/shop/shopSound.ts): lazy — nothing is constructed until a real tap/key wakes it (iOS autoplay rules).
 // Ducks under a studio, fades + suspends when the tab is hidden, stops and disposes on leaving (the Museum's gallery loop pattern).
 useEffect(()=>{const a=createShopAmbience();ambience.current=a;(window as unknown as {__shopAmbience?:unknown}).__shopAmbience=a;
  const vis=()=>a.visibility();document.addEventListener('visibilitychange',vis);
  return()=>{document.removeEventListener('visibilitychange',vis);a.dispose();ambience.current=null;delete (window as unknown as {__shopAmbience?:unknown}).__shopAmbience;};},[]);
 useEffect(()=>{ambience.current?.duck(covered);},[covered]);
 // Arrival: the clerk waves and says hello as the doors slide open.
 useEffect(()=>{if(!firstFrame)return;room.current?.greet();setGreeting(true);const a=setTimeout(()=>setGreeting(false),4200),b=setTimeout(()=>setHint(false),9000);return()=>{clearTimeout(a);clearTimeout(b);};},[firstFrame]);
 // Keyboard: E / Enter acts on the prompted spot; Escape walks back out to the island (WASD / arrows walk, in the scene).
 useEffect(()=>{if(covered)return;const key=(e:KeyboardEvent)=>{if(e.repeat||leavingRef.current)return;
  if(e.key==='Escape'){e.preventDefault();leave();return;}
  if((e.code==='Enter'||e.code==='KeyE')&&near&&!(e.target instanceof HTMLButtonElement)&&!(e.target instanceof HTMLInputElement)){e.preventDefault();act(near);}};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[covered,near,leave,act]);

 // ---- Joystick (the Museum / Konbini control) ----
 const stop=(e?:{pointerId:number})=>{if(e&&e.pointerId!==pointer.current)return;const id=pointer.current;pointer.current=null;joyRect.current=null;if(id!==null&&joy.current?.hasPointerCapture(id))joy.current.releasePointerCapture(id);room.current?.setStick(0,0);paintJoystick(joy.current,0,0);};
 const move=(e:ReactPointerEvent<HTMLDivElement>)=>{if(pointer.current!==e.pointerId)return;e.preventDefault();const r=joyRect.current??(joyRect.current=e.currentTarget.getBoundingClientRect()),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,scale=Math.min(1,36/Math.max(1,Math.hypot(dx,dy))),x=dx*scale,y=dy*scale;room.current?.setStick(x/36,y/36);paintJoystick(joy.current,x,y);};

 /** onBuy from a studio: price it from the design module, spend island coins (idempotent per design) and record ownership. */
 const buy=useCallback(async(kind:ShopKind,raw:unknown)=>{
  if(buying.current)return;buying.current=true;
  try{let design:unknown,price:number,name:string;
   if(kind==='jersey'){const d:JerseyDesign=validateJersey(raw).design;design=d;price=jerseyPrice(d);name=d.name?`${d.name}${d.number!=null?' '+d.number:''}`:'My jersey';}
   else if(kind==='boots'){const d:BootDesign=validateBoots(raw);design=d;price=bootPrice(d);name=d.name||'My boots';}
   else{const d=validateBall(raw);design=d;price=ballPrice(d);name='My ball';}
   const result=await buyDesign(kind,design,price,spendArcadeCoins,{name});
   if(!result.ok){say({tone:'warn',text:result.reason});return;}
   shopSfx.chaChing();
   setOwned(loadOwned());
   if(!result.already)countPurchase(kind,price);// admin analytics: a real purchase (coins charged), not re-picking an owned design
   say({tone:'ok',text:result.already?`You already own ${kind==='boots'?'these boots':`this ${KIND_LABEL[kind].toLowerCase()}`}. ${kind==='boots'?'They’re':'It’s'} your pick again.`:`Bought for ${price} coins! Find it in My kit.`});
  }finally{buying.current=false;}
 },[say]);
 const wear=(item:OwnedItem)=>{const next={...owned,wearing:{...owned.wearing,[item.kind]:item.id}};writeOwned(next);setOwned(next);};

 const Studio=studio?STUDIO[studio]:null,kind=studio?STATIONS.find(s=>s.id===studio)!.kind:null;
 const clerkActions=talking?.id===SHOP_CLERK.def.id?STATIONS.map(s=>({label:SHOW_ME[s.id],onClick:()=>{setTalking(null);room.current?.walkTo(s.id);}})):undefined;
 // Any tap or key in the room wakes resting shoppers (the scene rests them after 60 s with no input) and, on the very first one,
 // unlocks and starts the store ambience (iOS autoplay rules: only a real gesture may start audio).
 const wake=()=>{room.current?.poke();unlockShopAudio();ambience.current?.input();};
 return <main className={styles.root} aria-label="Kit Shop" data-shop-room data-ready={ready} onPointerDownCapture={wake} onKeyDownCapture={wake}
  onClickCapture={e=>{const cue=shopClickCue(e.target);if(cue)shopSfx[cue]();}}>
  <canvas ref={canvas} className={styles.canvas} tabIndex={0} aria-label="Walkable Kit Shop: jersey wall, boot wall, ball wall and the till. Use WASD or the arrow keys to walk, then E or Enter at a wall to design. Tap a wall or a person to walk there." data-shop-canvas
   onPointerDown={e=>{tap.current={x:e.clientX,y:e.clientY};}} onPointerCancel={()=>{tap.current=null;}}
   onPointerUp={e=>{const p=tap.current;tap.current=null;if(p&&Math.hypot(e.clientX-p.x,e.clientY-p.y)<12)room.current?.pick(e.clientX,e.clientY);}}/>
  {!studio&&<header className={styles.top}>
   <NavigationButton className={styles.doneRight} label="Done" data-shop-done onNavigate={leave}/>
   <p className={styles.title}><b>KIT SHOP</b><span>Design your own kit</span></p>
   <div className={styles.topRight}>
    <CoinPill balance={wallet.balance} data-shop-coins/>
    <button type="button" className={styles.myKitButton} onClick={()=>{setMyKit(true);countMyKitOpen();}} data-shop-mykit-open>My kit{owned.items.length?<b>{owned.items.length}</b>:null}</button>
   </div>
  </header>}
  {/* The studio cards along the bottom were removed (user, Oct 12 2026: "remove this"): walk to a wall, or ask Femi. */}
  {near&&!covered&&!leaving&&<button ref={promptRef} type="button" className={`store-enter-prompt ${styles.prompt}`} data-shop-prompt={near.id} onClick={()=>act(near)}>{near.label}</button>}
  {greeting&&!covered&&<p className={styles.greeting} data-shop-greeting role="status"><b>{SHOP_CLERK.def.name}:</b> {SHOP_CLERK.def.greeting}</p>}
  {!covered&&ready&&hint&&!greeting&&<p className={styles.hint} aria-hidden="true"><span className={styles.hintDesk}>Walk with WASD or the arrow keys · E to design</span><span className={styles.hintTouch}>Walk with the stick · tap a wall or a person</span></p>}
  {!covered&&!leaving&&<div className="touch-controls"><div className="joystick" data-edge="false" ref={joy} draggable={false} onDragStart={e=>e.preventDefault()} onContextMenu={e=>e.preventDefault()} role="group" aria-label="Move around the Kit Shop" data-shop-joystick
   onPointerDown={e=>{if(pointer.current!==null||!ready)return;e.preventDefault();pointer.current=e.pointerId;joyRect.current=null;e.currentTarget.setPointerCapture(e.pointerId);move(e);}} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}><i className="joystick-contact" aria-hidden="true"><i className="joystick-contact-arc"/></i><span aria-hidden="true"/></div></div>}
  {Studio&&kind&&<div className={styles.studio} data-shop-studio={studio}><Studio onClose={closeStudio} onBuy={d=>{void buy(kind,d);}}/></div>}
  {myKit&&<MyKit owned={owned} onWear={wear} onClose={()=>setMyKit(false)}/>}
  <NpcConversation npc={talking??lastTalk.current} open={!!talking} onOpenChange={o=>{if(!o)setTalking(null);}} practice={false} actions={clerkActions}/>
  {toast&&<p className={styles.toast} data-tone={toast.tone} role="status" data-shop-toast>{toast.text}</p>}
  {failed&&<p className={styles.failed} role="alert">The shop lights didn’t switch on. <button type="button" onClick={leave}>Back to the island</button></p>}
  {leaving?<ShopDoorSlide mode="leave"/>:<ShopDoorSlide mode="arrive" ready={firstFrame||failed}/>}
 </main>;
}
