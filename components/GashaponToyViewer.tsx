'use client';
/**
 * The full-screen gashapon toy viewer (round 3A, Nov 8 2026; round 3B kinds, Nov 9 2026; docs/gashapon-design.md). Opened through
 * lib/gashapon/gashaponBrowser.ts `openToyViewer(toyId, source)` from the spin result card or the Toy Shelf, for a toy you own.
 * The 3D part is lib/gashapon/toyViewer.ts (loaded on open, freed on close); pointers go through lib/gashapon/toyGestures.ts:
 *  - drag: spin the table (throw inertia), two fingers / wheel: zoom;
 *  - press-and-hold on the toy: squeeze (it springs back on let-go, however the finger leaves); a wind-up winds instead;
 *  - drag a piece / key / capsule (round 3B kinds): pull it apart, wind it, twist it open; tap: poke.
 * Let-go safety (owner, Nov 9 2026): up / cancel are WINDOW listeners (a finger lifted outside the canvas still lets go), plus
 * lost pointer capture, blur, a hidden tab and the last touch ending all release everything.
 * Keyboard: ←/→ spin, +/− zoom, Space/Enter poke, hold S squeeze, A / R take a piece off / put one back, hold W wind, F spin,
 * B bump, O open the capsule, M work the next part (↑ / ↓ move it), C swing a charm, P next pose, V star pose, Escape closes. Every kind also has visible buttons and a polite live status line (screen readers).
 * Haptics through navigator.vibrate where it exists. While it is open the island sleeps (lib/videoPlayback.ts holdIslandCover).
 */
import {useEffect,useRef,useState,useCallback,type PointerEvent as ReactPointerEvent} from 'react';
import {NavigationButton} from './DoneButton';
import {gashaponToy,type GashaponToy} from '@/lib/gashapon/toys';
import {useGashapon,type ToyViewSource} from '@/lib/gashapon/gashaponBrowser';
import {holdIslandCover} from '@/lib/videoPlayback';
import {countToyViewed,createInteractCounter,type InteractKind} from '@/lib/analytics/gashaponEvents';
import {TOY_KINDS,type ToyKind} from '@/lib/gashapon/toyKinds';
import {createToyGestures,type ToyGestures} from '@/lib/gashapon/toyGestures';
import type {ToyViewer,ToyAction,ToyKindInfo,ToyViewerOpts} from '@/lib/gashapon/toyViewer';
import type {KindEvent} from '@/lib/gashapon/toyInteract';
import styles from './GashaponToyViewer.module.css';

const RARITY_LABEL={common:'Common',uncommon:'Uncommon',rare:'Rare'} as const;
type MechInfo=NonNullable<ToyKindInfo['can']>['mechs'][number];
/** A working part's button: what pressing it will do now. */
const mechLabel=(m:MechInfo)=>m.type==='hinge'?`${m.open?'Close':'Open'} ${m.label}`:m.type==='lever'?`Pull ${m.label}`:m.type==='slider'?`Push ${m.label}`:m.type==='crank'?`Crank ${m.label}`:`Push ${m.label}`;
const buzz=(p:number|number[])=>{try{if(typeof navigator!=='undefined'&&typeof navigator.vibrate==='function')navigator.vibrate(p);}catch{/* not allowed */}};
const HAPTIC:Partial<Record<KindEvent,number|number[]>>={snap:[10,30,18],pop:12,complete:[20,40,20,40,60],ratchet:4,reveal:[15,30,15,30,40],dent:6,run:10,drop:5,twist:6,blocked:[8,40,8]};
/** Per-viewer conveniences (never needed state): which kind hints were used, which secret capsules were opened. */
const HINTS_KEY='fi2-toy-hints-v1',OPENED_KEY='fi2-toy-opened-v1';
const readSet=(k:string)=>{try{return new Set<string>(JSON.parse(localStorage.getItem(k)??'[]'));}catch{return new Set<string>();}};
const addTo=(k:string,v:string)=>{try{const s=readSet(k);s.add(v);localStorage.setItem(k,JSON.stringify([...s]));}catch{/* storage off */}};
/** Which events count as "used" for each kind's hint chip. */
const USED:Partial<Record<ToyKind,KindEvent[]>>={puzzle:['pop','snap'],windup:['run'],capsule:['reveal'],spintop:['spin'],mechanism:['open','push','fire','roll','ratchet','shut'],charm:['swing'],figure:['pose']};
/** Which kind each kind event belongs to (analytics gs:act_<kind>, counted when it is the toy's kind or bonus). */
const ACT:Partial<Record<KindEvent,ToyKind>>={pop:'puzzle',snap:'puzzle',run:'windup',spin:'spintop',reveal:'capsule',open:'mechanism',push:'mechanism',fire:'mechanism',roll:'mechanism',shut:'mechanism',swing:'charm',pose:'figure'};

export default function GashaponToyViewer({toyId,source,onClose,lab}:{toyId:string;source:ToyViewSource;onClose:()=>void;
 /** Dev labs only (/toy-lab sample models): the sample toy and its builder hooks. */
 lab?:{toy:GashaponToy}&NonNullable<ToyViewerOpts['lab']>}){
 const toy=lab?.toy??gashaponToy(toyId),save=useGashapon(),owned=lab?1:save.owned[toyId]?.n??0;
 const canvas=useRef<HTMLCanvasElement>(null),viewer=useRef<ToyViewer|null>(null),root=useRef<HTMLElement>(null),card=useRef<HTMLDivElement>(null),closeRef=useRef<HTMLButtonElement>(null),gest=useRef<ToyGestures|null>(null);
 const [failed,setFailed]=useState(false),[touched,setTouched]=useState(false),[info,setInfo]=useState<ToyKindInfo|null>(null),[status,setStatus]=useState(''),[hintUsed,setHintUsed]=useState(false);
 const interact=useRef(createInteractCounter(toyId));
 const closeNow=useRef(onClose);closeNow.current=onClose;
 const viewable=!!toy&&owned>0;
 const refresh=useCallback(()=>{const k=viewer.current?.kind()??null;setInfo(k&&k.live?{...k,can:k.can?{...k.can}:null}:null);},[]);
 const markUsed=useCallback((kind:ToyKind)=>{setHintUsed(true);addTo(HINTS_KEY,kind);},[]);
 // Frame the toy in the space between the header and the name card (it grows with the action row and status line).
 const fitInsets=useCallback(()=>{const r=root.current,c=card.current,v=viewer.current;if(!r||!c||!v)return;const rb=r.getBoundingClientRect(),cb=c.getBoundingClientRect();
  v.setInsets(Math.max(56,(r.querySelector('header')?.getBoundingClientRect().bottom??56)-rb.top),Math.max(0,rb.bottom-cb.top+8));},[]);
 useEffect(()=>{if(!viewable||!card.current||typeof ResizeObserver==='undefined')return;const ro=new ResizeObserver(fitInsets);ro.observe(card.current);if(root.current)ro.observe(root.current);return()=>ro.disconnect();},[viewable,fitInsets]);

 // Not found (or unknown): nothing to show.
 useEffect(()=>{if(!viewable)closeNow.current();},[viewable]);
 // The island sleeps under the viewer; focus moves in and comes back on close.
 useEffect(()=>{if(!viewable)return;const release=holdIslandCover(),before=document.activeElement as HTMLElement|null;closeRef.current?.focus({preventScroll:true});countToyViewed(toyId,source);
  return()=>{release();before?.focus?.({preventScroll:true});};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[viewable]);
 useEffect(()=>{if(!viewable||!canvas.current)return;let cancelled=false;const node=canvas.current;
  import('@/lib/gashapon/toyViewer').then(({createToyViewer})=>{if(cancelled)return;try{
   const v=createToyViewer(node,{reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,coarse:matchMedia('(pointer: coarse)').matches,
    opened:id=>readSet(OPENED_KEY).has(id),lab:lab?{build:lab.build,plan:lab.plan}:undefined,
    onEvent:(e,detail)=>{const h=HAPTIC[e];if(h)buzz(h);const k=v.kind();if(k&&USED[k.kind]?.includes(e))markUsed(k.kind);
     const ak=ACT[e]??(e==='ratchet'&&k?.kind==='mechanism'?'mechanism':null);if(k&&ak&&(ak===k.kind||ak===k.bonus))interact.current(`act_${ak}` as InteractKind);
     if(e==='reveal')addTo(OPENED_KEY,toyId);
     if(e==='complete')setStatus('All back together!');else if(e==='snap'&&detail)setStatus(`${detail.charAt(0).toUpperCase()+detail.slice(1)} clicks back in.`);
     else if(e==='pop'&&detail)setStatus(`${detail.charAt(0).toUpperCase()+detail.slice(1)} comes off.`);else if(e==='blocked'&&detail)setStatus(`Put the inside pieces back first.`);
     else if(e==='reveal')setStatus('A secret toy pops out!');else if(e==='stop')setStatus('');
     else if(e==='pose'&&detail)setStatus(`${detail} pose.`);else if(e==='fire'&&detail)setStatus('Pop! Up it comes.');else if(e==='shut'&&detail)setStatus(`${detail.charAt(0).toUpperCase()+detail.slice(1)} shut.`);
     if(e==='snap'||e==='pop'||e==='complete'||e==='reveal'||e==='close'||e==='stop'||e==='run'||e==='open'||e==='shut'||e==='pose'||e==='fire')refresh();}});
   viewer.current=v;(window as unknown as {__toyViewer?:unknown}).__toyViewer=v;
   if(!v.show(toyId)){setFailed(true);return;}v.happy();buzz([12,40,12]);
   const k=v.kind();if(k?.live&&readSet(HINTS_KEY).has(k.kind))setHintUsed(true);refresh();fitInsets();
  }catch(err){console.error('toy viewer failed',err);setFailed(true);}}).catch(()=>!cancelled&&setFailed(true));
  return()=>{cancelled=true;gest.current?.cancelAll();viewer.current?.dispose();viewer.current=null;delete (window as unknown as {__toyViewer?:unknown}).__toyViewer;};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[viewable,toyId,refresh,markUsed,fitInsets]);

 // Gestures: one state machine for the canvas; up / cancel from the window so nothing is ever left squeezed.
 useEffect(()=>{if(!viewable)return;
  const g=createToyGestures(()=>viewer.current,{onHold:()=>{interact.current('squeeze');buzz(14);setTouched(true);const k=viewer.current?.kind();if(k&&(k.kind==='squish'||k.kind==='jelly'))markUsed(k.kind);},
   onTap:t=>{interact.current(t.kind);buzz(t.kind==='tap'?[8,30,8]:8);setTouched(true);const k=viewer.current?.kind();if(k?.kind==='bobble'||k?.kind==='charm')markUsed(k.kind);refresh();},
   onGrab:()=>setTouched(true),onSpin:()=>setTouched(true),onMove:()=>setTouched(true),onRelease:()=>{buzz(10);refresh();}});
  gest.current=g;
  const up=(e:PointerEvent)=>g.up(e.pointerId,e.clientX,e.clientY,e.type!=='pointerup');
  const all=()=>g.cancelAll();const hidden=()=>{if(document.hidden)g.cancelAll();};
  const touchEnd=(e:TouchEvent)=>{if(e.touches.length===0&&g.active().pointers>0)g.cancelAll();};
  window.addEventListener('pointerup',up,true);window.addEventListener('pointercancel',up,true);window.addEventListener('blur',all);document.addEventListener('visibilitychange',hidden);
  window.addEventListener('touchend',touchEnd,true);window.addEventListener('touchcancel',touchEnd,true);
  return()=>{g.cancelAll();gest.current=null;window.removeEventListener('pointerup',up,true);window.removeEventListener('pointercancel',up,true);window.removeEventListener('blur',all);
   document.removeEventListener('visibilitychange',hidden);window.removeEventListener('touchend',touchEnd,true);window.removeEventListener('touchcancel',touchEnd,true);};
 },[viewable,markUsed]);

 const act=useCallback((a:ToyAction)=>{const s=viewer.current?.action(a);if(s){setStatus(s);setTouched(true);buzz(8);const k=viewer.current?.kind();if(k)markUsed(k.kind);
  if(k&&a==='bump'&&(k.kind==='bobble'||k.bonus==='bobble'))interact.current('act_bobble');}
  // Working parts settle after the action: refresh again once they have (open / shut labels on the buttons).
  refresh();window.setTimeout(refresh,700);},[refresh,markUsed]);
 /** The squishy hint chip counts the S key and the Squeeze button as used too, not only a press-and-hold (QA Nov 9 2026). */
 const squeezeUsed=useCallback(()=>{const k=viewer.current?.kind();if(k&&(k.kind==='squish'||k.kind==='jelly'))markUsed(k.kind);},[markUsed]);
 /** A one-press squeeze (button / tap-free): hold for ~0.6 s, then let go. */
 const pulseSqueeze=useCallback(()=>{const v=viewer.current;if(!v)return;v.holdStart();interact.current('squeeze');squeezeUsed();buzz(14);setTouched(true);setStatus('Squeezed. It puffs back.');window.setTimeout(()=>viewer.current?.holdEnd(),600);},[squeezeUsed]);

 // Keys: the viewer owns them while open (capture phase, so the machine panel underneath never sees Escape or Tab).
 useEffect(()=>{if(!viewable)return;const key=(e:KeyboardEvent)=>{
   if(e.type==='keyup'){if(e.code==='KeyS'||e.code==='KeyW'){viewer.current?.holdEnd();}e.stopPropagation();return;}
   const v=viewer.current;
   if(e.key==='Escape'){e.preventDefault();closeNow.current();}
   else if(e.key==='Tab'){const f=[...(root.current?.querySelectorAll<HTMLElement>('button,canvas[tabindex]')??[])];if(f.length){const i=f.indexOf(document.activeElement as HTMLElement),n=e.shiftKey?(i<=0?f.length-1:i-1):(i<0||i===f.length-1?0:i+1);e.preventDefault();f[n].focus();}}
   else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();v?.release(e.key==='ArrowLeft'?-900:900,0);setTouched(true);}
   else if((e.key==='ArrowUp'||e.key==='ArrowDown')&&v?.kind()?.can?.mechs.length){e.preventDefault();act(e.key==='ArrowUp'?'more':'less');}
   else if(e.key==='+'||e.key==='='){v?.zoom(1.15);}else if(e.key==='-'){v?.zoom(1/1.15);}
   else if((e.key===' '||e.key==='Enter')&&document.activeElement===canvas.current){e.preventDefault();const r=canvas.current!.getBoundingClientRect();const t=v?.tap(r.left+r.width/2,r.top+r.height*.45);if(t){interact.current(t.kind);buzz(8);}setTouched(true);}
   else if((e.code==='KeyS'||e.code==='KeyW')&&!e.repeat){v?.holdStart();if(e.code==='KeyS'){interact.current('squeeze');squeezeUsed();}buzz(14);setTouched(true);}
   else if(!e.repeat&&!e.metaKey&&!e.ctrlKey&&!e.altKey){const a=({KeyA:'apart',KeyR:'together',KeyF:'spin',KeyB:'bump',KeyO:'open',KeyC:'swing',KeyM:'work',KeyP:'pose',KeyV:'star'} as Record<string,ToyAction>)[e.code];if(a)act(a);}
   e.stopPropagation();};
  // A held S / W whose keyup never arrives (the window lost focus mid-squeeze) would leave the toy squashed: let go on blur (QA Nov 8 2026).
  const blur=()=>viewer.current?.holdEnd();
  window.addEventListener('keydown',key,true);window.addEventListener('keyup',key,true);window.addEventListener('blur',blur);
  return()=>{window.removeEventListener('keydown',key,true);window.removeEventListener('keyup',key,true);window.removeEventListener('blur',blur);};},[viewable,act,squeezeUsed]);
 // Wheel zoom (not passive, so the page never scrolls under it).
 useEffect(()=>{const el=canvas.current;if(!el||!viewable)return;const on=(e:WheelEvent)=>{e.preventDefault();viewer.current?.zoom(Math.exp(-Math.max(-60,Math.min(60,e.deltaY))*.004));};
  el.addEventListener('wheel',on,{passive:false});return()=>el.removeEventListener('wheel',on);},[viewable]);

 const down=(e:ReactPointerEvent<HTMLCanvasElement>)=>{try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* not capturable */}gest.current?.down(e.pointerId,e.clientX,e.clientY);};
 const move=(e:ReactPointerEvent<HTMLCanvasElement>)=>gest.current?.move(e.pointerId,e.clientX,e.clientY);
 const lost=(e:ReactPointerEvent<HTMLCanvasElement>)=>gest.current?.up(e.pointerId,e.clientX,e.clientY,true);

 if(!viewable||!toy)return null;
 const kind=info?.kind,ki=kind?TOY_KINDS[kind]:null,can=info?.can;
 const buttons:{label:string;on:()=>void;primary?:boolean}[]=[];
 if(kind==='puzzle'&&can){buttons.push({label:'Take a piece off',on:()=>act('apart'),primary:can.apart});if(can.together)buttons.push({label:'Put one back',on:()=>act('together'),primary:!can.apart});}
 else if(kind==='windup')buttons.push({label:'Wind up',on:()=>act('wind'),primary:true});
 else if(kind==='capsule'&&can)buttons.push({label:can.opened?'Pack it back':'Twist open',on:()=>act('open'),primary:!can.opened});
 // Round 3C: one button per working part (Open lid / Close lid, Pull lever, Push button, Crank handle, Push wheels), poses, swing.
 if(can?.mechs.length&&(kind==='mechanism'||info?.bonus==='mechanism'))can.mechs.slice(0,kind==='mechanism'?3:1).forEach((m,i)=>buttons.push({label:mechLabel(m),on:()=>act(`work${i}`),primary:kind==='mechanism'&&i===0}));
 if(kind==='figure'&&can?.poses.length){buttons.push({label:'Next pose',on:()=>act('pose'),primary:true});if(can.poses.includes('star'))buttons.push({label:can.pose==='star'?'Rest pose':'Star pose',on:()=>act('star')});}
 if(kind==='charm'||info?.bonus==='charm')buttons.push({label:'Swing',on:()=>act('swing'),primary:kind==='charm'});
 if(kind==='squish'||kind==='jelly'||(kind==='capsule'&&can?.opened)||info?.bonus==='squish')buttons.push({label:'Squeeze',on:pulseSqueeze,primary:kind==='squish'||kind==='jelly'});
 if(kind==='spintop'||info?.bonus==='spintop')buttons.push({label:'Spin',on:()=>act('spin')});
 if(info?.bonus==='bobble'||kind==='bobble')buttons.push({label:'Bump',on:()=>act('bump')});
 const hint=info?.hint??ki?.hint;
 const help=ki?`${hint}. ${ki.keys}. Drag to spin the table.`:'Drag to spin, hold to squeeze, tap to poke. Arrow keys spin, Space pokes, S squeezes.';
 return <section ref={root} className={styles.root} role="dialog" aria-modal="true" aria-labelledby="toy-viewer-name" data-toy-viewer={toy.id} data-rarity={toy.rarity} data-toy-kind={kind}
  style={{'--body':toy.colors[0],'--trim':toy.colors[1]} as React.CSSProperties}>
  <header className={styles.header}><NavigationButton ref={closeRef} back label="Back" data-toy-viewer-close onNavigate={()=>closeNow.current()}/></header>
  <canvas ref={canvas} className={styles.canvas} tabIndex={0} aria-label={`${toy.name}. ${help}`}
   onPointerDown={down} onPointerMove={move} onLostPointerCapture={lost} onContextMenu={e=>e.preventDefault()}/>
  {failed&&<p className={styles.error}>This toy couldn’t load on this device.</p>}
  {ki&&<p className={styles.chip} data-toy-hint={kind} data-used={hintUsed||undefined} aria-hidden="true">{hint}</p>}
  <div ref={card} className={styles.card}>
   <h2 id="toy-viewer-name" className={styles.name}>{toy.name}</h2>
   <p className={styles.meta}><span className={styles.rarity}>{RARITY_LABEL[toy.rarity]}</span>{ki&&<span className={styles.kind}>{ki.label}</span>}<span data-toy-owned={owned}>{owned} owned</span></p>
   <p className={styles.line}>{toy.personality}</p>
   {buttons.length>0&&<div className={styles.actions} data-toy-actions>{buttons.slice(0,3).map(b=><button key={b.label} type="button" className={styles.act} data-primary={b.primary||undefined} onClick={b.on}>{b.label}</button>)}</div>}
   <p className={styles.status} role="status" aria-live="polite" data-toy-status>{status}</p>
   {!ki&&<p className={styles.hint} data-touched={touched||undefined}>Drag to spin · Hold to squeeze · Tap to poke</p>}
  </div>
 </section>;
}
