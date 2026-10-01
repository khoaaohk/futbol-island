'use client';
import {useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {DoneButton} from './DoneButton';
import DrinkArt from './DrinkArt';
import {facePlacement} from './VendingMachine';
import {VendingFace,type VendingFaceView,type VendingPhase,type VendingSlotState} from './VendingFace';
import {recordExploreActivity} from '@/lib/town/exploreActivity';
import {VENDING_MACHINES,vendingMachine,type VendingMachineId} from '@/lib/town/vendingCatalog';
import {markMachineFound,useVending} from '@/lib/town/vendingWallet';
import {FACE_SIZE,VENDING_FACE_LAYOUT,VENDING_TIMING} from '@/lib/graphics/vendingFaceLayout';
import {drinkRevealLayers} from '@/lib/graphics/drinkArt';
import KonbiniReveal from './KonbiniReveal';
import type {VendingMachines} from '@/lib/graphics/vendingMachines';
import {DRINKS_FULL,DRINKS_PER_DAY,DRINK_COLLECTION_GROUP,drinkSources,drinksAt,isDrinkMachine,type Drink} from '@/lib/town/drinkMachines';
import {buyDrink,chooseDrinkFate,keepDrink,drinksBoughtToday,newPurchaseId,pouchCount,useKonbini,POUCH_SIZE} from '@/lib/town/drinkShop';
import jobStyles from './IslandJobs.module.css';
import vendStyles from './VendingMachine.module.css';
import styles from './DrinkMachine.module.css';

/**
 * Drink machine CONTROLLER (Sep 29 2026; lib/town/drinkMachines.ts, docs/vending-machines.md "Drink machines").
 * Same in-world machine as the snack/gear machines: Town zooms onto the face (lib/graphics/vendingMachines.ts), and the shared
 * visual module (components/VendingFace.tsx) is pinned onto it. Only the stock and the purchase differ:
 *   idle ─press slot→ armed ─press again / coin slot→ coins → drop → tray ─tap tray→ REVEAL → drink now / Snacks pouch → idle
 * Drinks are Konbini consumables (lib/town/drinkShop.ts adapter): repeat-safe (one purchase id per deliberate buy, so a double
 * tap or retry never charges twice), 3 a day, and the first of each joins the Konbini Collection's "Drink machines" group.
 * The reveal is the Konbini's (components/KonbiniReveal.tsx, STABLE API) fed with drink layers (lib/graphics/drinkArt.ts):
 * bottle → label wrap → cap → condensation sparkle, the drink's one hydration line and its sources.
 * Leaving before choosing is safe: dismissing the reveal (Done, Escape, another slot) or closing the machine puts the drink in the
 * Snacks pouch, or drinks it now when the pouch is full, and says so (keepDrink). The ledger's settle() is only the tab-closed backstop.
 * Heat: mounted only while the machine is in use (the island sleeps: storeOpen is in Town's pause list); one-shot CSS only.
 */
type Point={x:number;y:number};
type Reveal={drink:Drink;purchaseId:string;firstTime:boolean;choice?:'eat'|'pouch';
 /** Drink now (Oct 1 2026): saved first, then the reveal drains it in 4 sips with words and the "ahh" (KonbiniReveal `eating`). */
 drinking?:boolean};
const cue=(name:'select'|'insert'|'confirm'|'coin'|'thunk'|'pop'|'buzz'|'equip')=>{try{document.dispatchEvent(new CustomEvent('fi2-vending-cue',{detail:name}));}catch{}};
const reducedMotion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const SOURCE_SHORT:Record<string,string>={'NHS':'NHS','American':'AAP (HealthyChildren.org)','Sports':'Sports Dietitians Australia','FIFA':'FIFA','Cleveland':'Cleveland Clinic'};
const shortSource=(title:string)=>SOURCE_SHORT[title.split(' ')[0]]??title.split(' · ')[0];

export default function DrinkMachine({open,machineId,onOpenChange,machines}:{open:boolean;machineId:VendingMachineId;onOpenChange:(open:boolean)=>void;machines?:()=>VendingMachines|null}){
 const machine=vendingMachine(machineId)??VENDING_MACHINES[0];
 const drinks=useMemo(()=>isDrinkMachine(machine.id)?drinksAt(machine.id):[],[machine.id]);
 const vending=useVending(),konbini=useKonbini();
 const [quad,setQuad]=useState<Point[]|null>(null);
 const [armedId,setArmedId]=useState<string|null>(null),[cursor,setCursor]=useState(0),[phase,setPhase]=useState<VendingPhase>('idle');
 const [led,setLed]=useState<{msg:string;sub?:string;tone?:'warn'|'ok'}|null>(null),[coinDrop,setCoinDrop]=useState<{n:number;key:number}|null>(null);
 // Tray how-to note (coin slot taps): shows in the tray, then fades after a few seconds.
 const [trayNote,setTrayNote]=useState<{text:string;key:number}|null>(null),trayNoteTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const showTrayNote=(text:string)=>{if(trayNoteTimer.current)clearTimeout(trayNoteTimer.current);setTrayNote({text,key:Date.now()});trayNoteTimer.current=setTimeout(()=>setTrayNote(null),3600);};
 useEffect(()=>()=>{if(trayNoteTimer.current)clearTimeout(trayNoteTimer.current);},[]);
 const [dispense,setDispense]=useState<{drink:Drink;key:number}|null>(null),[reveal,setReveal]=useState<Reveal|null>(null),[vendingSlot,setVendingSlot]=useState<string|null>(null);
 const [faceEntrance,setFaceEntrance]=useState(true);
 const exitButton=useRef<HTMLButtonElement>(null),faceEl=useRef<HTMLDivElement>(null);
 const visit=useRef(0),busy=useRef(false),inHand=useRef<{purchaseId:string;drink:Drink}|null>(null),pending=useRef<{id:string;purchaseId:string}|null>(null),timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const later=(fn:()=>void,ms:number)=>{const t=setTimeout(()=>{timers.current=timers.current.filter(x=>x!==t);fn();},ms);timers.current.push(t);};
 const today=drinksBoughtToday(konbini),inPouch=pouchCount(konbini),full=today>=DRINKS_PER_DAY;
 const armed=armedId?drinks.find(d=>d.id===armedId)??null:null;

 // ---- Face placement (same as the vending controller): the zoom camera's projected corners, else a centred rectangle. ----
 useEffect(()=>{
  if(!open){setQuad(null);return;}
  const fallback=():Point[]=>{const W=innerWidth,H=innerHeight,ratio=FACE_SIZE.w/FACE_SIZE.h,h=Math.min(H*.92,W*.94/ratio),w=h*ratio,x=(W-w)/2,y=(H-h)/2;return [{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}];};
  const toScreen=(ndc:Point[])=>{const host=document.querySelector('.town-scene')?.getBoundingClientRect();const r=host&&host.width>0?host:{left:0,top:0,width:innerWidth,height:innerHeight};
   return ndc.map(p=>({x:Math.round((r.left+(p.x+1)/2*r.width)*2)/2,y:Math.round((r.top+(1-p.y)/2*r.height)*2)/2}));};
  const place=(next:Point[])=>setQuad(prev=>prev&&prev.every((p,i)=>Math.abs(p.x-next[i].x)<.6&&Math.abs(p.y-next[i].y)<.6)?prev:next);
  const v=machines?.();const off=v?.watchFace(ndc=>place(toScreen(ndc)));
  const now=v?.faceNow();place(now?toScreen(now):fallback());
  const resize=()=>{if(!machines?.()?.faceNow())place(fallback());};window.addEventListener('resize',resize);
  return()=>{off?.();window.removeEventListener('resize',resize);};
 },[open,machines]);
 // Real depth (Sep 30 2026): the same CSS 3D camera placement as the shop machines, so drinks stand in the real bay.
 // Includes the per-slot parallax shifts (bug audit B1): without them drinks sat left of their price rails on the angled view.
 const placement=useMemo(()=>facePlacement(quad,machines,machine.id),[quad,machines,machine.id]);

 // ---- Open / close ----
 useEffect(()=>{
  visit.current++;
  if(open){recordExploreActivity('store');markMachineFound(machine.id);setLed(null);setFaceEntrance(true);setDispense(null);setReveal(null);setCoinDrop(null);setVendingSlot(null);setPhase('idle');setArmedId(null);setCursor(0);busy.current=false;pending.current=null;}
  else{timers.current.forEach(clearTimeout);timers.current=[];}
  return()=>{visit.current++;timers.current.forEach(clearTimeout);timers.current=[];keepInHand();};
 },[open,machine.id]);
 const focusSlot=(index:number)=>requestAnimationFrame(()=>faceEl.current?.querySelector<HTMLButtonElement>(`[data-slot-index="${index}"]`)?.focus({preventScroll:true}));
 const placed=Boolean(placement);
 useLayoutEffect(()=>{if(open&&placed&&!faceEl.current?.contains(document.activeElement))focusSlot(cursor);},[open,placed]);// eslint-disable-line react-hooks/exhaustive-deps

 function status(d:Drink):{kind:VendingSlotState;note:string}{
  if(full)return {kind:'buy',note:DRINKS_FULL};
  const short=Math.max(0,d.price-vending.balance);
  return short>0?{kind:'short',note:`Need ${short} more coin${short===1?'':'s'}. Try an island job!`}:{kind:'buy',note:`${d.price} coins`};
 }
 /** A paid drink not yet chosen goes to the pouch (or is drunk when the pouch is full). Returns the LED line to show. */
 function keepInHand(){const h=inHand.current;inHand.current=null;if(!h)return null;const k=keepDrink(h.purchaseId);if(!k.ok)return null;
  return k.fate==='pouch'?{msg:`${h.drink.label} saved in your Snacks pouch`,sub:'Open your Backpack → Snacks to drink it later.',tone:'ok' as const}
   :{msg:`Your pouch was full, so you drank the ${h.drink.label} now`,sub:h.drink.lesson,tone:'ok' as const};}
 function dismissReveal(){const kept=keepInHand();if(kept)setLed(kept);setPhase('idle');setDispense(null);setReveal(null);focusSlot(cursor);return kept;}
 function press(d:Drink,index:number){
  if(phase==='coins'||phase==='drop')return;
  let kept:ReturnType<typeof keepInHand>=null;
  if(phase==='reward'){kept=dismissReveal();}else if(phase==='tray'){setLed({msg:'Take your drink from the tray first',tone:'warn'});cue('buzz');return;}
  if(armedId!==d.id){cue('select');setArmedId(d.id);setLed(kept);setCursor(index);pending.current=null;return;}
  act(d);
 }
 function act(d:Drink){
  const s=status(d);
  if(full){setLed({msg:'Plenty for today!',sub:DRINKS_FULL,tone:'warn'});cue('buzz');return;}
  if(s.kind==='short'){setLed({msg:s.note,tone:'warn'});cue('buzz');return;}
  void purchase(d);
 }
 // Coin slot (user, Oct 1 2026): it never buys. Only the button under a drink does; the coins show how-to in the tray, which fades.
 function coinSlot(){
  if(phase==='coins'||phase==='drop')return;
  cue('insert');showTrayNote(phase==='tray'?'Tap the tray to take your drink':'Tap the button under a drink, then tap it again to buy');
 }
 async function purchase(d:Drink){
  if(busy.current)return;const purchaseVisit=visit.current;busy.current=true;cue('confirm');const quick=reducedMotion(),t=VENDING_TIMING;
  // One purchase id per deliberate buy: a retry of the same armed drink reuses it, so the wallet can't charge twice.
  if(pending.current?.id!==d.id)pending.current={id:d.id,purchaseId:newPurchaseId()};const purchaseId=pending.current.purchaseId;
  setCoinDrop({n:1,key:Date.now()});setPhase('coins');setLed({msg:`${d.price} coins in…`,sub:`${d.label} · ${d.jp}`});later(()=>cue('coin'),quick?0:t.coinAt(0));
  try{
   const [result]=await Promise.all([buyDrink(d.id,purchaseId),new Promise(r=>setTimeout(r,quick?0:t.coinsDone(1)))]);
   if(purchaseVisit!==visit.current)return;
   if(!result.ok){setPhase('idle');setCoinDrop(null);setLed({msg:result.limit?'Plenty for today!':result.reason,sub:result.limit?DRINKS_FULL:undefined,tone:'warn'});cue('buzz');if(result.limit)pending.current=null;return;}
   pending.current=null;inHand.current={purchaseId:result.purchase.id,drink:d};
   setVendingSlot(d.id);setDispense({drink:d,key:Date.now()});setReveal({drink:d,purchaseId:result.purchase.id,firstTime:result.firstTime});setPhase('drop');setLed({msg:'Thank you! ありがとう',sub:'Your drink is dropping… ガコン!',tone:'ok'});
   later(()=>{cue('thunk');setPhase('tray');setVendingSlot(null);setCoinDrop(null);setLed({msg:'Tap the tray to take it',sub:`${d.label} is in the tray.`,tone:'ok'});},quick?0:t.drop);
  }finally{if(purchaseVisit===visit.current)busy.current=false;}
 }
 function take(){if(phase!=='tray'||!dispense)return;cue('pop');setPhase('reward');setLed(null);}
 function choose(fate:'eat'|'pouch'){
  if(!reveal||reveal.choice)return;const r=chooseDrinkFate(reveal.purchaseId,fate);
  if(!r.ok){setLed({msg:r.reason??'Try again',tone:'warn'});cue('buzz');return;}
  inHand.current=null;cue('equip');setReveal({...reveal,choice:fate,drinking:fate==='eat'});
  setLed(fate==='eat'?{msg:`Glug glug! ${reveal.drink.label} ✓`,sub:reveal.drink.lesson,tone:'ok'}:{msg:'Saved in your Snacks pouch',sub:'Open your Backpack → Snacks to drink it later.',tone:'ok'});
 }

 // ---- Keyboard: arrows / 1–6 pick, Enter buys, T takes, Esc leaves (WASD walks away). ----
 const keyState=useRef({cursor,phase});keyState.current={cursor,phase};
 useEffect(()=>{if(!open)return;
  const onKey=(e:KeyboardEvent)=>{const s=keyState.current;if(e.metaKey||e.ctrlKey||e.altKey)return;const key=e.key,lower=key.toLowerCase(),stop=()=>{e.preventDefault();e.stopPropagation();};
   if(key==='Escape'){stop();if(s.phase==='reward'){dismissReveal();return;}exitButton.current?.click();return;}
   if(s.phase==='reward')return;
   if(['w','a','s','d'].includes(lower)){stop();exitButton.current?.click();return;}
   const cols=VENDING_FACE_LAYOUT.cols,count=drinks.length,move=(n:number)=>{stop();const i=(n+count)%count;cue('select');setArmedId(drinks[i].id);setCursor(i);setLed(null);focusSlot(i);};
   if(key==='ArrowRight')return move(s.cursor+1);if(key==='ArrowLeft')return move(s.cursor-1);if(key==='ArrowDown')return move(s.cursor+cols);if(key==='ArrowUp')return move(s.cursor-cols);
   if(/^[1-6]$/.test(key)){const i=Number(key)-1;if(i<count){stop();cue('select');setArmedId(drinks[i].id);setCursor(i);setLed(null);focusSlot(i);}return;}
   if((key==='Enter'||key===' '||lower==='t')&&s.phase==='tray'){stop();take();return;}
   if((key==='Enter'||key===' ')&&!(e.target instanceof HTMLButtonElement)){stop();const d=drinks[s.cursor];if(d)press(d,s.cursor);}
  };
  window.addEventListener('keydown',onKey,true);return()=>window.removeEventListener('keydown',onKey,true);
 });

 // Memoized per purchase: KonbiniReveal rebuilds (replays its layers) whenever `item` changes identity.
 const revealKey=reveal?.purchaseId,revealItem=useMemo(()=>reveal?{id:reveal.drink.id,label:reveal.drink.label,jp:reveal.drink.reading?`${reveal.drink.jp}（${reveal.drink.reading}）`:reveal.drink.jp,blurb:reveal.drink.blurb,note:reveal.drink.lesson,
  layers:drinkRevealLayers(reveal.drink.art),eyebrow:reveal.firstTime?undefined:'DRINK MACHINE'}:null,[revealKey]);// eslint-disable-line react-hooks/exhaustive-deps
 if(!open)return null;
 const found=vending.found.length;
 const picture=(d:Drink)=><span className={styles.pic} data-temp={d.temp}><DrinkArt art={d.art} base={.74} height={.66}/><i className={styles.temp} title={d.temp==='hot'?'あったか～い (hot)':'つめた～い (cold)'}>{d.temp==='hot'?'HOT':'COLD'}</i></span>;
 const armedStatus=armed?status(armed):null;
 const ledView=led??(armed&&armedStatus?{msg:full?'Plenty for today!':armedStatus.kind==='buy'?`${armed.label} ${armed.jp} · ${armed.price} coins`:armedStatus.note,
  sub:full?DRINKS_FULL:armedStatus.kind==='buy'?'Press the button again to buy':armed.blurb,tone:full||armedStatus.kind==='short'?'warn' as const:undefined}
  :{msg:'いらっしゃいませ!',sub:`Pick a drink · ${Math.max(0,DRINKS_PER_DAY-today)} of ${DRINKS_PER_DAY} left today`});
 const fontSize=placement?Math.max(14,Math.min(18,Math.round(placement.w/29))):12;
 const view:VendingFaceView|null=placement&&{trayNote,placement,fontSize,compact:placement.h<430,
  machine:{id:machine.id,name:machine.name,color:machine.color,light:machine.light,ink:machine.ink},
  header:{label:'Drinks',page:1,pages:1,special:false},
  slots:drinks.map((d,index)=>{const s=status(d);return {id:d.id,label:d.label,price:d.price,state:s.kind,special:false,lit:d.id===armedId,vending:vendingSlot===d.id,kind:'drink',picture:picture(d),
   ariaLabel:`${index+1}. ${d.label}, ${d.jp}, ${d.temp==='hot'?'hot':'cold'}. ${s.kind==='buy'?`${d.price} coins`:s.note}`};}),
  cursor,led:ledView,balance:vending.balance,found:{short:`${found}/${VENDING_MACHINES.length} found`,label:`${found}/${VENDING_MACHINES.length} machines found`},phase,coinDrop,
  tray:dispense?{key:dispense.key,id:dispense.drink.id,label:dispense.drink.label,kind:'drink',picture:<DrinkArt art={dispense.drink.art}/>}:null};
 const r=reveal,sources=r?`Checked with: ${drinkSources(r.drink).map(x=>shortSource(x.title)).join(' · ')}`:'';
 return <div className={`${vendStyles.root} ${styles.root}`} data-vending-machine={machine.id} data-drink-machine={machine.id} data-vending-phase={phase} data-card-reveal={phase==='reward'&&Boolean(reveal)||undefined}>
  <div className={vendStyles.hudDone}><DoneButton ref={exitButton} onDone={()=>onOpenChange(false)}/></div>
  <div className={`${jobStyles.wallet} ${vendStyles.hudCoins}`} aria-live="polite" data-vending-coins={vending.balance}><span className={jobStyles.coin} aria-hidden="true"/><b>{vending.balance}</b><small>coins</small></div>
  {phase==='reward'&&r&&revealItem&&<KonbiniReveal key={r.purchaseId} item={revealItem} firstTime={r.firstTime} onDone={dismissReveal} eating={!!r.drinking} onEaten={()=>setReveal(v=>v&&{...v,drinking:false})}
   onEat={r.choice?undefined:()=>choose('eat')} onSave={r.choice?undefined:()=>choose('pouch')} saveDisabled={inPouch>=POUCH_SIZE}
   status={r.drinking?undefined:r.choice==='eat'?`Glug glug! Nicely hydrated. ${sources}`:r.choice==='pouch'?`Saved in your Snacks pouch (Backpack → Snacks). ${sources}`:inPouch>=POUCH_SIZE?`Your Snacks pouch is full (${POUCH_SIZE}). ${sources}`:sources}/>}
  {view&&<VendingFace ref={faceEl} view={view} entrance={faceEntrance} inactive={phase==='reward'&&Boolean(r)}
   events={{onSlot:i=>{const d=drinks[i];if(d)press(d,i);},onSlotFocus:setCursor,onCoin:coinSlot,onTray:take,onFlip:()=>{},onNextRow:()=>{}}}/>}
 </div>;
}
