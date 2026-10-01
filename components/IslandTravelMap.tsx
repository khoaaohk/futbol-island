'use client';
import {DoneButton} from './DoneButton';
import shell from './ModalShell.module.css';
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties,type KeyboardEvent,type PointerEvent} from 'react';
import {Icon} from './Icon';
import IslandOverview,{type MapDestination,type MapFootprint} from './IslandOverview';
import {FLIGHT_BOUNDS} from '@/lib/town/simulation';
import {CAY_SHORE} from '@/lib/town/coralCay';
import {LEGEND_TIPS,legendTipText,type MapMarkKind} from '@/lib/town/mapMarkers';
import styles from './IslandTravelMap.module.css';
type Props={position:{x:number;z:number};open:boolean;onOpenChange:(open:boolean)=>void;onSelect:(destination:MapDestination)=>void;roads:MapFootprint[];buildings:MapFootprint[]};
type Direction='up'|'right'|'down'|'left';
// The overview's viewBox (flight bounds plus its 8-unit rim). The map is drawn to cover the frame, so it overflows on one axis and pans.
const MAP_X=FLIGHT_BOUNDS.minX-8,MAP_Z=FLIGHT_BOUNDS.minZ-8,MAP_W=FLIGHT_BOUNDS.maxX-FLIGHT_BOUNDS.minX+16,MAP_H=FLIGHT_BOUNDS.maxZ-FLIGHT_BOUNDS.minZ+16;
const STEP=.6,DRAG_SLOP=8;
/** The right pan stops at the easternmost land (Coral Cay's shore plus room for its beach and labels), not at the far edge of
 *  the flight area's empty south-east lobe: on a phone the last taps used to push CORAL CAY and HOSTEL off the left edge. */
const CONTENT_EAST=Math.min(FLIGHT_BOUNDS.maxX+8,Math.max(...CAY_SHORE.map(p=>p.x))+24);
const ARROWS:{dir:Direction;label:string;rotate:number}[]=[{dir:'up',label:'Move map up',rotate:0},{dir:'right',label:'Move map right',rotate:90},{dir:'down',label:'Move map down',rotate:180},{dir:'left',label:'Move map left',rotate:270}];
/** Map key (G-13, Sep 30 2026): the same marks the map draws (IslandOverview), so a child can read V / F / J / W at a glance.
 *  The marks on the map are plain drawings; tapping V, F or J here shows what it is (Sep 30 2026, user: "the legend above is
 *  enough"). Rosa's market and "Places: tap to travel" left the key (the market and places keep their labels on the map). */
const LEGEND:{mark:string;fill:string;label:string;ring?:boolean;tip?:MapMarkKind}[]=[
 {mark:'V',fill:'#fff8e5',label:'Vending',tip:'vending'},{mark:'F',fill:'#b9e1df',label:'Fishing',tip:'fishing'},{mark:'J',fill:'#f4cc7c',label:'Jobs',tip:'job'},
 {mark:'',fill:'#7b4fd6',label:'You',ring:true}];
function LegendMark({mark,fill,ring}:{mark:string;fill:string;ring?:boolean}){return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">{ring?<><circle cx="12" cy="12" r="9" fill={fill} stroke="#294f43" strokeWidth="2"/><circle cx="12" cy="12" r="3.4" fill="#fff7db"/></>:<><circle cx="12" cy="12" r="10" fill={fill} stroke="#294f43" strokeWidth="1.8"/><text x="12" y="16.6" textAnchor="middle" fill="#294f43" fontSize="13" fontWeight="900">{mark}</text></>}</svg>;}
/** One key tooltip at a time, in dialog px: `x` the mark's centre, `top`/`bottom` its edges (above, or below if no room). */
type Tip={kind:MapMarkKind;x:number;top:number;bottom:number};
const TIP_GAP=10,TIP_PAD=8;
const KEYS:Record<string,Direction>={ArrowUp:'up',ArrowRight:'right',ArrowDown:'down',ArrowLeft:'left'};
export default function IslandTravelMap({position,open,onOpenChange,onSelect,roads,buildings}:Props){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null);
 useEffect(()=>{const el=dialog.current;if(!el)return;let timer:ReturnType<typeof setTimeout>|undefined;if(open&&!el.open){restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;el.showModal();close.current?.focus({preventScroll:true});}else if(!open&&el.open){const finish=()=>{el.close();restore.current?.focus({preventScroll:true});};if(matchMedia('(prefers-reduced-motion: reduce)').matches)finish();else timer=setTimeout(finish,240);}return()=>clearTimeout(timer);},[open]);
 // Pan state. Heat: no animation loop — arrows/keys set one CSS transform that eases on the compositor; drags write the transform
 // straight to the stage per pointer event; the frame is measured by a ResizeObserver that exists only while the dialog is open.
 const view=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null);
 const [size,setSize]=useState({w:0,h:0}),[pan,setPan]=useState({x:0,y:0}),[eased,setEased]=useState(false);
 const panRef=useRef(pan);panRef.current=pan;
 // Key tooltip: CSS-only motion (one 160 ms fade + rise), placed once per tap; nothing runs while it is open.
 const [tip,setTip]=useState<Tip|null>(null),tipEl=useRef<HTMLDivElement>(null),tipAnchor=useRef<HTMLElement|null>(null);
 const showTip=(kind:MapMarkKind,button:HTMLElement)=>{const r=(button.querySelector('svg')??button).getBoundingClientRect(),d=dialog.current?.getBoundingClientRect();tipAnchor.current=button;
  setTip(t=>t?.kind===kind?t:{kind,x:r.left+r.width/2-(d?.left??0),top:r.top-(d?.top??0),bottom:r.bottom-(d?.top??0)});};
 const needsCenter=useRef(true),drag=useRef<{id:number;sx:number;sy:number;x:number;y:number;last:{x:number;y:number};moved:boolean}|null>(null),swallowClick=useRef(false);
 useEffect(()=>{if(open)return;const d=drag.current;drag.current=null;swallowClick.current=false;stage.current?.removeAttribute('data-dragging');if(d&&view.current?.hasPointerCapture(d.id))view.current.releasePointerCapture(d.id);},[open]);
 const scale=size.w&&size.h?Math.max(size.w/MAP_W,size.h/MAP_H):0,stageW=MAP_W*scale,stageH=MAP_H*scale;
 const maxX=Math.max(0,Math.floor(Math.min(stageW,(CONTENT_EAST-MAP_X)*scale)-size.w)),maxY=Math.max(0,Math.floor(stageH-size.h));
 const clamp=(x:number,y:number)=>({x:Math.round(Math.min(maxX,Math.max(0,x))),y:Math.round(Math.min(maxY,Math.max(0,y)))});
 useEffect(()=>{if(!open){needsCenter.current=true;return;}const el=view.current;if(!el)return;const measure=()=>{const w=el.clientWidth,h=el.clientHeight;setSize(s=>s.w===w&&s.h===h?s:{w,h});};measure();const observer=new ResizeObserver(measure);observer.observe(el);return()=>observer.disconnect();},[open]);
 // Open centred on the player; after a resize just keep the view inside the map.
 useLayoutEffect(()=>{if(!open||!scale)return;if(needsCenter.current){needsCenter.current=false;setEased(false);setPan(clamp((position.x-MAP_X)*scale-size.w/2,(position.z-MAP_Z)*scale-size.h/2));}else setPan(p=>{const c=clamp(p.x,p.y);return c.x===p.x&&c.y===p.y?p:c;});},[open,scale,size.w,size.h]);// eslint-disable-line react-hooks/exhaustive-deps
 const move=(dir:Direction)=>{const p=panRef.current,dx=dir==='left'?-1:dir==='right'?1:0,dy=dir==='up'?-1:dir==='down'?1:0;const next=clamp(p.x+dx*size.w*STEP,p.y+dy*size.h*STEP);if(next.x===p.x&&next.y===p.y)return;setEased(true);setPan(next);
  // An arrow that is about to disable itself would drop focus to the page: hand it to the map so arrow keys keep working.
  const atEdge=dir==='up'?next.y<=0:dir==='left'?next.x<=0:dir==='down'?next.y>=maxY:next.x>=maxX,active=document.activeElement;
  if(atEdge&&active instanceof HTMLElement&&active.dataset.dir===dir)view.current?.focus({preventScroll:true});};
 const can:Record<Direction,boolean>={up:pan.y>0,left:pan.x>0,down:pan.y<maxY,right:pan.x<maxX};
 const hidden=(dir:Direction)=>dir==='up'||dir==='down'?maxY<1:maxX<1;
 const onKeyDown=(e:KeyboardEvent)=>{const dir=KEYS[e.key];if(!dir)return;e.preventDefault();move(dir);};
 // Phones (Sep 30 2026, user): a finger never drags the map; taps on places and marks still work and the edge arrows pan.
 // A mouse still drags on desktop. touch-action stays none so a swipe cannot scroll or zoom the page behind the dialog.
 const onPointerDown=(e:PointerEvent<HTMLDivElement>)=>{if(!e.isPrimary||drag.current||e.button!==0||e.pointerType==='touch'||e.pointerType==='pen')return;swallowClick.current=false;const p=panRef.current;drag.current={id:e.pointerId,sx:e.clientX,sy:e.clientY,x:p.x,y:p.y,last:p,moved:false};
  // Capture is only taken past the drag slop, so a press released off the map (or on a pan arrow) never reached endDrag and the
  // map then followed a hovering mouse (code review finding 11). Any release anywhere ends a drag that never started moving.
  const id=e.pointerId,release=(ev:globalThis.PointerEvent)=>{if(ev.pointerId!==id)return;window.removeEventListener('pointerup',release,true);window.removeEventListener('pointercancel',release,true);const d=drag.current;if(d&&d.id===id&&!d.moved)drag.current=null;};
  window.addEventListener('pointerup',release,true);window.addEventListener('pointercancel',release,true);};
 const onPointerMove=(e:PointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.sx,dy=e.clientY-d.sy;
  if(!d.moved){if(Math.hypot(dx,dy)<DRAG_SLOP)return;d.moved=true;view.current?.setPointerCapture(e.pointerId);stage.current?.setAttribute('data-dragging','true');}
  const next=clamp(d.x-dx,d.y-dy);d.last=next;if(stage.current)stage.current.style.transform=`translate3d(${-next.x}px,${-next.y}px,0)`;};
 const endDrag=(e:PointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;drag.current=null;if(!d.moved)return;
  // Cancellation and lost capture may have no useful coordinates. Keep the last painted position.
  const next=e.type==='pointerup'?clamp(d.x-(e.clientX-d.sx),d.y-(e.clientY-d.sy)):clamp(d.last.x,d.last.y);
  stage.current?.removeAttribute('data-dragging');swallowClick.current=true;setEased(false);panRef.current=next;setPan(next);
  if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);};
 // Keep a keyboard-focused place in view (the frame uses overflow:clip so the browser never scrolls it behind the transform).
 const onFocus=(e:React.FocusEvent<HTMLDivElement>)=>{const el=view.current,target=e.target as Element;if(!el||target===el||!target.closest('.map-destination'))return;el.scrollTop=el.scrollLeft=0;const v=el.getBoundingClientRect(),r=target.getBoundingClientRect();
  if(r.left>=v.left&&r.right<=v.right&&r.top>=v.top&&r.bottom<=v.bottom)return;const p=panRef.current;setEased(true);setPan(clamp(p.x+(r.left+r.width/2)-(v.left+v.width/2),p.y+(r.top+r.height/2)-(v.top+v.height/2)));};
 // Keep the bubble on screen: clamp it sideways (its arrow still points at the mark) and flip it below the mark when there
 // is no room above. One measurement per tap; no loop.
 useLayoutEffect(()=>{const el=tipEl.current;if(!el||!tip)return;el.style.setProperty('--tip-shift','0px');el.removeAttribute('data-below');
  const bw=el.offsetWidth,bh=el.offsetHeight,right=dialog.current?.clientWidth??innerWidth;
  const from=tip.x-bw/2,to=Math.min(Math.max(from,TIP_PAD),Math.max(TIP_PAD,right-TIP_PAD-bw));
  el.style.setProperty('--tip-shift',`${Math.round(to-from)}px`);if(tip.top-bh-TIP_GAP<TIP_PAD)el.setAttribute('data-below','');
  const anchor=tipAnchor.current;anchor?.setAttribute('aria-describedby','map-tip');return()=>anchor?.removeAttribute('aria-describedby');},[tip]);
 // Tap elsewhere (anything but a key entry) or Escape closes it; closing the map or resizing it (the key may reflow) drops it.
 useEffect(()=>{if(!open)setTip(null);},[open]);
 useEffect(()=>setTip(null),[size.w,size.h]);
 useEffect(()=>{if(!tip)return;const down=(e:globalThis.PointerEvent)=>{const t=e.target;if(t instanceof Element&&t.closest('[data-legend-tip]'))return;setTip(null);};
  window.addEventListener('pointerdown',down,true);return()=>window.removeEventListener('pointerdown',down,true);},[tip]);
 const onTipBlur=(e:React.FocusEvent)=>{const next=e.relatedTarget;if(next instanceof Element&&next.closest('[data-legend-tip]'))return;setTip(null);};
 const stageStyle:CSSProperties=scale?{width:stageW,height:stageH,transform:`translate3d(${-pan.x}px,${-pan.y}px,0)`}:{visibility:'hidden'};
 return <dialog ref={dialog} className={`${styles.dialog} ${open?styles.entering:styles.leaving}`} aria-labelledby="town-dialog-title" onCancel={e=>{e.preventDefault();if(tip){setTip(null);return;}onOpenChange(false);}} onClick={e=>{if(e.target===e.currentTarget)onOpenChange(false);}} onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'&&tip){e.preventDefault();setTip(null);}}} onKeyUp={e=>e.stopPropagation()}>
 <section className={`${styles.panel} ${shell.shell} ${shell.white}`}><header className={shell.header}><div><h2 id="town-dialog-title">Pick your patch</h2></div><DoneButton ref={close} onDone={()=>onOpenChange(false)}/></header>
 <div className={`${shell.body} ${styles.body}`}><ul className={styles.legend} aria-label="Map key" data-map-legend>{LEGEND.map(({tip:kind,...item})=><li key={item.label}>{kind?<button type="button" className={styles.legendTip} data-legend-tip={kind} aria-label={legendTipText(kind)} onClick={e=>showTip(kind,e.currentTarget)} onFocus={e=>showTip(kind,e.currentTarget)} onBlur={onTipBlur}><LegendMark {...item}/><span>{item.label}</span></button>:<><LegendMark {...item}/><span>{item.label}</span></>}</li>)}</ul><div className={styles.frame} onKeyDown={onKeyDown}>
  <div ref={view} className={styles.map} tabIndex={0} role="region" aria-label="Island map. Tap a place to travel there; use the arrow keys to move the map." onFocus={onFocus} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} onClickCapture={e=>{if(swallowClick.current&&e.detail!==0){swallowClick.current=false;e.preventDefault();e.stopPropagation();}}}>
   <div ref={stage} className={styles.stage} data-eased={eased?'true':undefined} style={stageStyle}><IslandOverview markerPosition={position} roads={roads} buildings={buildings} onSelect={onSelect}/></div>
  </div>
  {ARROWS.map(({dir,label,rotate})=><button key={dir} type="button" className={styles.arrow} data-dir={dir} hidden={!scale||hidden(dir)} disabled={!can[dir]} aria-label={label} data-tip={label} onClick={()=>move(dir)}><Icon name="up" size={22} style={rotate?{transform:`rotate(${rotate}deg)`}:undefined}/></button>)}
 </div></div></section>
 {tip&&<div key={tip.kind} ref={tipEl} id="map-tip" role="tooltip" className={styles.tip} data-tip-kind={tip.kind} style={{left:tip.x,'--tip-top':`${tip.top}px`,'--tip-bottom':`${tip.bottom}px`} as CSSProperties}><strong>{LEGEND_TIPS[tip.kind].title}</strong> <span>{LEGEND_TIPS[tip.kind].text}</span></div>}
 </dialog>;
}
