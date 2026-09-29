'use client';
import {DoneButton} from './DoneButton';
import shell from './ModalShell.module.css';
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties,type KeyboardEvent,type PointerEvent} from 'react';
import {Icon} from './Icon';
import IslandOverview,{type MapDestination,type MapFootprint} from './IslandOverview';
import {FLIGHT_BOUNDS} from '@/lib/town/simulation';
import styles from './IslandTravelMap.module.css';
type Props={position:{x:number;z:number};open:boolean;onOpenChange:(open:boolean)=>void;onSelect:(destination:MapDestination)=>void;roads:MapFootprint[];buildings:MapFootprint[]};
type Direction='up'|'right'|'down'|'left';
// The overview's viewBox (flight bounds plus its 8-unit rim). The map is drawn to cover the frame, so it overflows on one axis and pans.
const MAP_X=FLIGHT_BOUNDS.minX-8,MAP_Z=FLIGHT_BOUNDS.minZ-8,MAP_W=FLIGHT_BOUNDS.maxX-FLIGHT_BOUNDS.minX+16,MAP_H=FLIGHT_BOUNDS.maxZ-FLIGHT_BOUNDS.minZ+16;
const STEP=.6,DRAG_SLOP=8;
const ARROWS:{dir:Direction;label:string;rotate:number}[]=[{dir:'up',label:'Move map up',rotate:0},{dir:'right',label:'Move map right',rotate:90},{dir:'down',label:'Move map down',rotate:180},{dir:'left',label:'Move map left',rotate:270}];
const KEYS:Record<string,Direction>={ArrowUp:'up',ArrowRight:'right',ArrowDown:'down',ArrowLeft:'left'};
export default function IslandTravelMap({position,open,onOpenChange,onSelect,roads,buildings}:Props){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null);
 useEffect(()=>{const el=dialog.current;if(!el)return;let timer:ReturnType<typeof setTimeout>|undefined;if(open&&!el.open){restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;el.showModal();close.current?.focus({preventScroll:true});}else if(!open&&el.open){const finish=()=>{el.close();restore.current?.focus({preventScroll:true});};if(matchMedia('(prefers-reduced-motion: reduce)').matches)finish();else timer=setTimeout(finish,240);}return()=>clearTimeout(timer);},[open]);
 // Pan state. Heat: no animation loop — arrows/keys set one CSS transform that eases on the compositor; drags write the transform
 // straight to the stage per pointer event; the frame is measured by a ResizeObserver that exists only while the dialog is open.
 const view=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null);
 const [size,setSize]=useState({w:0,h:0}),[pan,setPan]=useState({x:0,y:0}),[eased,setEased]=useState(false);
 const panRef=useRef(pan);panRef.current=pan;
 const needsCenter=useRef(true),drag=useRef<{id:number;sx:number;sy:number;x:number;y:number;moved:boolean}|null>(null),swallowClick=useRef(false);
 const scale=size.w&&size.h?Math.max(size.w/MAP_W,size.h/MAP_H):0,stageW=MAP_W*scale,stageH=MAP_H*scale;
 const maxX=Math.max(0,Math.floor(stageW-size.w)),maxY=Math.max(0,Math.floor(stageH-size.h));
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
 const onPointerDown=(e:PointerEvent<HTMLDivElement>)=>{if(e.pointerType==='mouse'&&e.button!==0)return;const p=panRef.current;drag.current={id:e.pointerId,sx:e.clientX,sy:e.clientY,x:p.x,y:p.y,moved:false};};
 const onPointerMove=(e:PointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.sx,dy=e.clientY-d.sy;
  if(!d.moved){if(Math.hypot(dx,dy)<DRAG_SLOP)return;d.moved=true;view.current?.setPointerCapture(e.pointerId);stage.current?.setAttribute('data-dragging','true');}
  const next=clamp(d.x-dx,d.y-dy);if(stage.current)stage.current.style.transform=`translate3d(${-next.x}px,${-next.y}px,0)`;};
 const endDrag=(e:PointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;drag.current=null;if(!d.moved)return;
  stage.current?.removeAttribute('data-dragging');swallowClick.current=true;setTimeout(()=>{swallowClick.current=false;},0);setEased(false);setPan(clamp(d.x-(e.clientX-d.sx),d.y-(e.clientY-d.sy)));};
 // Keep a keyboard-focused place in view (the frame uses overflow:clip so the browser never scrolls it behind the transform).
 const onFocus=(e:React.FocusEvent<HTMLDivElement>)=>{const el=view.current,target=e.target as Element;if(!el||target===el||!target.closest('.map-destination'))return;el.scrollTop=el.scrollLeft=0;const v=el.getBoundingClientRect(),r=target.getBoundingClientRect();
  if(r.left>=v.left&&r.right<=v.right&&r.top>=v.top&&r.bottom<=v.bottom)return;const p=panRef.current;setEased(true);setPan(clamp(p.x+(r.left+r.width/2)-(v.left+v.width/2),p.y+(r.top+r.height/2)-(v.top+v.height/2)));};
 const stageStyle:CSSProperties=scale?{width:stageW,height:stageH,transform:`translate3d(${-pan.x}px,${-pan.y}px,0)`}:{visibility:'hidden'};
 return <dialog ref={dialog} className={`${styles.dialog} ${open?styles.entering:styles.leaving}`} aria-labelledby="town-dialog-title" onCancel={e=>{e.preventDefault();onOpenChange(false);}} onClick={e=>{if(e.target===e.currentTarget)onOpenChange(false);}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
 <section className={`${styles.panel} ${shell.shell} ${shell.white}`}><header className={shell.header}><div><h2 id="town-dialog-title">Pick your patch</h2></div><DoneButton ref={close} onDone={()=>onOpenChange(false)}/></header>
 <div className={`${shell.body} ${styles.body}`}><div className={styles.frame} onKeyDown={onKeyDown}>
  <div ref={view} className={styles.map} tabIndex={0} role="region" aria-label="Island map. Tap a place to travel there; use the arrow keys to move the map." onFocus={onFocus} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onClickCapture={e=>{if(swallowClick.current){swallowClick.current=false;e.preventDefault();e.stopPropagation();}}}>
   <div ref={stage} className={styles.stage} data-eased={eased?'true':undefined} style={stageStyle}><IslandOverview markerPosition={position} roads={roads} buildings={buildings} onSelect={onSelect}/></div>
  </div>
  {ARROWS.map(({dir,label,rotate})=><button key={dir} type="button" className={styles.arrow} data-dir={dir} hidden={!scale||hidden(dir)} disabled={!can[dir]} aria-label={label} data-tip={label} onClick={()=>move(dir)}><Icon name="up" size={22} style={rotate?{transform:`rotate(${rotate}deg)`}:undefined}/></button>)}
 </div></div></section>
 </dialog>;
}
