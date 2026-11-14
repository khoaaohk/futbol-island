'use client';
/**
 * The island gashapon machine as its own interface (round 5, owner Nov 9 2026: "the gashapon spin and price should be part of the
 * machine and zoom in on that and not a modal. like the vending machine"; "the machine needs to interact to show the gashapon
 * being dropped down"). After the camera zooms onto the machine (lib/graphics/gashaponPrompt.ts) there is no dialog: small
 * controls are pinned onto the machine's front, projected from its 3D points every time the camera moves
 * (lib/gashapon/gashaponFace.ts):
 *  - the turn-knob is the Spin button (a ring round the real 3D knob, its label beside it); the coin plate under it shows the
 *    price, and "not enough coins" / "that's today's capsules" show as a small tag by it;
 *  - a spin turns the 3D knob, rattles the cabinet, tumbles the capsules and drops one down the chute into the tray
 *    (lib/graphics/gashaponLive.ts); the capsule then waits in the tray: tap it to crack it open;
 *  - the toy's card is a compact card beside the machine (desktop) or a strip at the bottom (phone), with Look closer (the
 *    full-screen 3D toy viewer) and Spin again;
 *  - the machine's name sits over its topper; one top row: Toy Shelf (left), ONE status pill (capsule icon, "2/6", a short
 *    second fact: "None left" / "3 left" / "Need coins", lib/gashapon/statusLine.ts; the six dots only with room), Done (right,
 *    the shared DoneButton) (owner, Nov 10 2026: "simplify this to fit between Toy Shelf and Done btn on mobile"); Done or Escape
 *    zooms out;
 *  - the knob turns by hand too (owner, Nov 10 2026): press on it and drag round it (or swipe across it), it follows the finger
 *    1:1; three quarters of a turn in one go runs the same spin as a tap (lib/gashapon/knobTurn.ts), let go earlier and it
 *    springs back, nothing charged. One pointer (pointer capture, touch-action none on the knob), mouse too; keys keep the tap.
 * Spin rules, the store, keys and focus: components/useGashaponSpin.ts (unchanged economy). Heat: no timers or loops while idle;
 * the anchors only write CSS variables when the camera moved. Reduced motion: no travel (the capsule is straight in the tray).
 */
import {DoneButton} from './DoneButton';
import {CapsuleIcon} from './CapsuleIcon';
import ToyIcon from './ToyIcon';
import {useEffect,useRef,useState,type CSSProperties,type PointerEvent as ReactPointerEvent} from 'react';
import {gashaponMachine,islandGashaponMachines,stadiumCabinetOnLeft,type GashaponMachine} from '@/lib/gashapon/machines';
import {GASHAPON_PRICE,GASHAPON_REFUND,GASHAPON_SPINS_PER_DAY} from '@/lib/gashapon/store';
import {openToyShelf,openToyViewer,useGashaponPanel} from '@/lib/gashapon/gashaponBrowser';
import {gashaponFace,gashaponFx,type FacePoint} from '@/lib/gashapon/gashaponFace';
import {gashaponStatus} from '@/lib/gashapon/statusLine';
import {createKnobTurn} from '@/lib/gashapon/knobTurn';
import {useGashaponSpin,RARITY_LABEL} from './useGashaponSpin';
import styles from './GashaponMachineFace.module.css';

export default function GashaponMachineFace(){
 const id=useGashaponPanel(),machine=id?gashaponMachine(id):undefined;
 return machine?<Face key={machine.id} machine={machine}/>:null;
}

/**
 * QA Nov 9 2026: a Konbini pair stands 0.92 m apart, so the knob's label (left of the knob) and the coins / cap tag sat over the
 * neighbouring machine's cabinet and tray. A machine with a neighbour on its left (seen from the front) puts its label above
 * the knob and the tag under the coin plate instead, both on its own cabinet.
 */
/** The one-time "Turn the knob" hint: seen once the player spun by either way (the toy viewer's hint store, a device key). */
const HINTS_KEY='fi2-toy-hints-v1',KNOB_HINT='knob';
const hintSeen=()=>{try{return (JSON.parse(localStorage.getItem(HINTS_KEY)??'[]') as string[]).includes(KNOB_HINT);}catch{return true;}};
const markHint=()=>{try{const s=new Set<string>(JSON.parse(localStorage.getItem(HINTS_KEY)??'[]'));s.add(KNOB_HINT);localStorage.setItem(HINTS_KEY,JSON.stringify([...s]));}catch{/* storage off */}};
const reducedMotion=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{return false;}};

export function hasLeftNeighbour(m:{id:string;x:number;z:number;yaw:number}){const c=Math.cos(m.yaw),s=Math.sin(m.yaw);
 return stadiumCabinetOnLeft(m.id)||islandGashaponMachines().some(o=>{if(o.id===m.id)return false;const dx=o.x-m.x,dz=o.z-m.z,lx=dx*c-dz*s;return Math.hypot(dx,dz)<1.6&&lx<0;});}

function Face({machine}:{machine:GashaponMachine}){
 const root=useRef<HTMLDivElement>(null),knob=useRef<HTMLButtonElement>(null),tray=useRef<HTMLButtonElement>(null);
 const {wallet,save,phase,shown,error,toys,found,left,busy,blocked,close,spin,openCapsule}=useGashaponSpin(machine,{root,spinButton:knob,trayButton:tray,tray:true});
 const status=gashaponStatus({found,total:toys.length,left,blocked});
 // Hand turn: one pointer at a time; the click a drag ends with never spins a second time (the spin itself has one in-flight guard).
 const turn=useRef(createKnobTurn()),dragged=useRef(false),[hint,setHint]=useState(false);
 useEffect(()=>{setHint(!hintSeen());},[]);
 const spinOnce=()=>{if(hint){markHint();setHint(false);}void spin();};
 const knobDown=(e:ReactPointerEvent<HTMLButtonElement>)=>{const el=knob.current;if(!el||el.disabled||!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0))return;
  const r=el.getBoundingClientRect();if(!turn.current.down(e.pointerId,e.clientX,e.clientY,r.left+r.width/2,r.top+r.height/2,r.width/2))return;
  dragged.current=false;try{el.setPointerCapture(e.pointerId);}catch{/* old browsers: the knob still gets its own moves */}};
 const knobMove=(e:ReactPointerEvent<HTMLButtonElement>)=>{const el=knob.current,r=turn.current.move(e.pointerId,e.clientX,e.clientY);if(!el||!r)return;e.preventDefault();
  if(turn.current.moved&&!dragged.current){dragged.current=true;el.dataset.turning='';}
  if(dragged.current){el.style.setProperty('--turn',`${r.angle.toFixed(3)}rad`);gashaponFx.turn(machine.id,r.angle);}
  if(r.commit){el.removeAttribute('data-turning');el.style.removeProperty('--turn');if(el.disabled)gashaponFx.release(machine.id,reducedMotion());else spinOnce();}};
 const knobUp=(e:ReactPointerEvent<HTMLButtonElement>)=>{const el=knob.current,res=turn.current.up(e.pointerId);if(!el||!res)return;
  el.removeAttribute('data-turning');el.style.removeProperty('--turn');if(res==='spring'&&dragged.current)gashaponFx.release(machine.id,reducedMotion());};
 // The island's own controls step aside while the machine is open (app/globals.css html[data-gashapon-open]).
 useEffect(()=>{const h=document.documentElement;h.dataset.gashaponOpen="";return()=>{delete h.dataset.gashaponOpen;};},[]);
 // Pin the controls on the machine: NDC anchors → px, written as CSS variables (no React render per camera move).
 useEffect(()=>gashaponFace.watch(a=>{const el=root.current;if(!el||!a||a.id!==machine.id){el?.setAttribute('data-placed','false');return;}
  const host=document.querySelector('.town-scene')?.getBoundingClientRect(),r=host&&host.width>0?host:{left:0,top:0,width:innerWidth,height:innerHeight};
  const px=(p:FacePoint)=>[r.left+(p.x+1)/2*r.width,r.top+(1-p.y)/2*r.height] as const;
  const set=(k:string,v:number)=>el.style.setProperty(k,`${Math.round(v)}px`);
  const put=(name:string,p:FacePoint)=>{const [x,y]=px(p);set(`--${name}x`,x);set(`--${name}y`,y);return [x,y] as const;};
  const [kx,ky]=put('k',a.knob),[ex,ey]=px(a.knobEdge);set('--kr',Math.max(30,Math.hypot(ex-kx,ey-ky)/Math.SQRT2*1.25));
  put('c',a.coin);const [tx,ty]=put('t',a.tray),[tex,tey]=px(a.trayEdge);set('--tw',Math.max(64,Math.abs(tex-tx)*2+12));set('--th',Math.max(56,Math.abs(tey-ty)*2+16));
  put('m',a.crown);put('r',a.right);put('b',a.base);
  el.dataset.room=String(px(a.right)[0]+330<r.left+r.width-16&&r.width>=760);// room for the card beside the machine
  el.setAttribute('data-placed','true');}),[machine.id]);
 const cardSide=shown&&phase==='reveal';
 const tagKind=error?.kind??blocked;// Nov 10 2026: a blocked spin explains itself before the knob is pressed
 const tag=tagKind?tagKind==='coins'?{head:`You have ${wallet.balance} coins`,body:'Earn more with jobs, games and lessons.'}:tagKind==='cap'?{head:`That's ${GASHAPON_SPINS_PER_DAY} today`,body:'The machines refill tomorrow!'}:{head:error!.retry?'Not saved yet':'Try again',body:error!.text}:null;
 return <div ref={root} className={styles.face} data-gashapon-panel={machine.id} data-gashapon-face="" data-phase={phase} data-placed="false" data-neighbour={hasLeftNeighbour(machine)?'left':undefined} data-keep-focus=""/* the HUD focus rule (lib/town/hudFocus.ts) leaves focus on these controls, like a dialog */
  role="group" aria-label={`${machine.name} capsule machine. Turn the knob to spin for ${GASHAPON_PRICE} coins. Escape leaves.`}
  style={{'--machine':machine.color,'--accent':machine.accent} as CSSProperties}>
  <p className={styles.marquee}><strong id="gashapon-title">{machine.name}</strong><span>{machine.theme}</span></p>
  <button ref={knob} type="button" className={styles.knob} onClick={()=>{if(dragged.current){dragged.current=false;return;}spinOnce();}}
   onPointerDown={knobDown} onPointerMove={knobMove} onPointerUp={knobUp} onPointerCancel={knobUp} onLostPointerCapture={knobUp} data-gashapon-knob-turn=""
   disabled={busy||phase==='tray'||!!blocked} data-gashapon-spin data-blocked={blocked??undefined} data-retry={error?.retry||undefined}
   aria-label={phase==='tray'?'Your capsule is in the tray':blocked==='coins'?`Not enough coins: a spin costs ${GASHAPON_PRICE}`:blocked==='cap'?'No capsules left today':error?.retry?'Try again, no extra coins':`Turn the knob: spin for ${GASHAPON_PRICE} coins`} aria-describedby={tag?'gashapon-tag':hint?'gashapon-hint':undefined}>
   <span className={styles.ring} aria-hidden="true"><i className={styles.grip}/></span><span className={styles.knobLabel}>{phase==='tray'?'Turned!':busy?'Turning…':blocked==='coins'?'Need coins':blocked==='cap'?'Tomorrow':error?.retry?'Try again':`Spin · ${GASHAPON_PRICE}`}</span>
  </button>
  <p className={styles.price} aria-label={`Price ${GASHAPON_PRICE} coins. You have ${wallet.balance}.`}><i className={styles.coin} aria-hidden="true"/><b>{GASHAPON_PRICE}</b><span className={styles.balance} data-gashapon-balance>{wallet.balance}</span></p>
  {!tag&&hint&&phase==='idle'&&<p id="gashapon-hint" className={styles.tag} data-gashapon-hint=""><b>Turn the knob</b> or tap Spin</p>}
  {tag&&<p id="gashapon-tag" className={styles.tag} role="alert" data-gashapon-error={tagKind}><b>{tag.head}</b> {tag.body}</p>}
  <button ref={tray} type="button" className={styles.tray} onClick={openCapsule} hidden={phase!=='tray'} data-gashapon-tray={phase==='tray'?'full':'empty'} aria-label="Open your capsule">
   <span className={styles.trayLabel}>Tap to open</span>
  </button>
  {/* One top row (owner, Nov 10 2026): Toy Shelf, ONE status pill between, Done. The six dots only show with room (CSS). */}
  <div className={styles.bar}>
   <button type="button" className={styles.shelf} onClick={()=>openToyShelf()} disabled={busy} data-gashapon-shelf>Toy Shelf</button>
   <p className={styles.status} data-gashapon-progress={found} data-gashapon-left={left} data-gashapon-status={status.kind??'ok'} role="img" aria-label={status.label}>
    <CapsuleIcon className={styles.statusIcon} top={machine.color} bottom="#fff6e4"/>
    <span className={styles.dots} aria-hidden="true">{toys.map(t=><i key={t.id} data-on={!!save.owned[t.id]} style={{'--dot':t.colors[0]} as CSSProperties}/>)}</span>
    <span className={styles.count} aria-hidden="true">{status.count}</span>
    {status.fact&&<span className={styles.fact} aria-hidden="true">{status.fact}</span>}
   </p>
   <div className={styles.done}><DoneButton onDone={close} disabled={busy} aria-label="Leave the capsule machine" data-gashapon-close/></div>
  </div>
  <div className={styles.dock} data-card={cardSide||undefined}>
   {cardSide&&shown?<section className={styles.card} data-gashapon-result={shown.toy.id} data-rarity={shown.toy.rarity} aria-live="polite" aria-labelledby="gashapon-toy">
     <ToyIcon id={shown.toy.id} size={64} className={styles.art}/>
     <div className={styles.cardText}>
      <h2 id="gashapon-toy" className={styles.toyName}>{shown.toy.name}</h2>
      <p className={styles.meta}><span className={styles.rarity}>{RARITY_LABEL[shown.toy.rarity]}</span>{shown.duplicate
       ?<span className={styles.repeat} data-gashapon-repeat>Repeat ({shown.count} now){shown.refund>0?` · +${shown.refund} coins back`:''}</span>
       :<span className={styles.fresh} data-gashapon-new>New!</span>}</p>
      <p className={styles.blurb}>{shown.toy.personality}</p>
      <div className={styles.cardActions}>
       <button type="button" className={styles.secondary} onClick={()=>openToyViewer(shown.toy.id,'result')} data-gashapon-look>Look closer</button>
       <button type="button" className={styles.again} onClick={()=>void spin()} disabled={!!blocked} data-gashapon-again>{blocked==='coins'?'Need coins':blocked==='cap'?'Back tomorrow':`Spin again · ${GASHAPON_PRICE}`}</button>
      </div>
     </div>
    </section>:null}
   <p className={styles.srOnly}>A repeat toy gives {GASHAPON_REFUND} coins back.</p>
  </div>
 </div>;
}
