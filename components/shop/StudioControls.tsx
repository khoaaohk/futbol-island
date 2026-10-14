'use client';
import {forwardRef,useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type ButtonHTMLAttributes,type CSSProperties,type KeyboardEvent as RKeyboardEvent,type PointerEvent as RPointerEvent,type ReactNode,type RefObject} from 'react';
import styles from './StudioControls.module.css';
import {SHEET_LABEL,SHEET_PHONE_QUERY,SHEET_SNAPS,clampDrag,loadSnap,nextSnap,sameInsets,saveSnap,settleSnap,snapHeights,stageInsets,stepSnap,type SheetSnap,type StageInsets} from '@/lib/shop/studioSheet';

/**
 * Shared stage controls for the Kit Shop studios (Boot, Jersey, Ball) — see StudioControls.module.css for the layout
 * contract (one fixed position, size and order per piece, shared by all three so they can't drift apart again). Each studio
 * keeps its own icons, labels, handlers and step-conditional rendering; these components only supply shared chrome.
 */

/** The top-right history + tools cluster. Stops a drag on the stage from starting under a tap on a button. */
export function StudioIconRow({children}:{children:ReactNode}){
 return <div className={styles.iconRow} data-studio-top="" onPointerDown={e=>e.stopPropagation()}>{children}</div>;
}

type IconBtnProps={label:string;pressed?:boolean;disabled?:boolean;onClick?():void;children:ReactNode}
 &Omit<ButtonHTMLAttributes<HTMLButtonElement>,'onClick'|'disabled'|'children'|'aria-label'|'aria-pressed'|'type'>;
/** One 44px round icon button in the shared gold face (pink when it's a pressed toggle, e.g. Pair or Help). */
export function StudioIconButton({label,pressed,disabled,onClick,children,className,...rest}:IconBtnProps){
 return <button type="button" className={className?`${styles.icon} ${className}`:styles.icon} aria-label={label} title={label}
  aria-pressed={pressed} disabled={disabled} onClick={onClick} {...rest}>{children}</button>;
}

/** The bottom-centre view/angle chip row (Boot's Hero…Sole, Jersey's Front…Back). Wraps rather than clipping or scrolling. */
export function StudioViewChips({children,label='Turn the view'}:{children:ReactNode;label?:string}){
 return <div className={styles.viewChips} data-studio-bottom="" role="group" aria-label={label}>{children}</div>;
}

/** The top-centre two-segment mode pill (On shirt/Flat, Paint/Spin). */
export function StudioModeToggle({children,label}:{children:ReactNode;label:string}){
 return <div className={styles.modeToggle} data-studio-top="" role="group" aria-label={label}>{children}</div>;
}

export type StudioStep={id:string;label:string;icon?:ReactNode};
type StudioStepsProps={
 /** The studio's own steps, in order: id, label and (optionally) an icon shown only while that step is active. */
 steps:StudioStep[];
 activeId:string;
 /** Whether a step counts as already done (a tinted badge); the active step never shows as done even if true is passed. */
 isDone(id:string,index:number):boolean;
 onSelect(id:string):void;
 label?:string;
};
/**
 * The step pill row at the top of a studio's bottom sheet (Boot, Jersey, Ball — Oct 14 2026, user: "these 2 look different…
 * use the design from ball studio and remove the bar"). One design for all three: a tan pill with a white numbered circle;
 * the active step is a dark pill with a gold circle holding that step's own icon, or its number if it has none. Scrolls
 * horizontally with a hidden scrollbar on phones; wraps on desktop. No progress bar — the pills and the active label carry
 * the progress. Each studio keeps its own step ids, labels, icons, click behaviour and "done" rule; only the chrome is shared.
 */
export const StudioSteps=forwardRef<HTMLElement,StudioStepsProps>(function StudioSteps({steps,activeId,isDone,onSelect,label='Steps'},ref){
 return <nav className={styles.steps} aria-label={label} ref={ref}>
  {steps.map((s,i)=>{const active=activeId===s.id,done=isDone(s.id,i)&&!active;
   return <button key={s.id} type="button" className={styles.stepBtn} aria-current={active?'step':undefined}
    data-done={done?'':undefined} data-step-id={s.id} data-step={s.id} onClick={()=>onSelect(s.id)}>
    <b>{active?(s.icon??i+1):i+1}</b>{s.label}
   </button>;})}
 </nav>;
});

/** Section titles inside a studio sheet ("Start from an idea", "Choose your panels", "Upper"…): one shared brush size and
 *  spacing for Ball, Boot and Jersey (Oct 14 2026, user: "reduce the text for start from an idea and choose panels and all other
 *  section titles"). Each studio adds this class next to its own heading class; the meta/subtitle stays on the baseline. */
export const studioSectionTitle=styles.sectionTitle;

// ---- the resizable phone sheet (lib/shop/studioSheet.ts has the pure snap / fit logic) ----
export type StudioSheet={
 /** ≤ 899px wide: the sheet is resizable (desktop keeps its side panel untouched). */
 phone:boolean;snap:SheetSnap;heights:Record<SheetSnap,number>;
 setSnap(s:SheetSnap):void;
 /** Spread on the studio's sheet element: its ref, the live height on phones, and data-sheet-* hooks for the shared CSS. */
 sheetProps:{ref:(el:HTMLElement|null)=>void;style?:CSSProperties;'data-sheet-snap':SheetSnap};
 /** Add to the sheet's own className: the shared snap transition (phones only). */
 sheetClass:string;
 handleProps:{onPointerDown(e:RPointerEvent<HTMLButtonElement>):void;onPointerMove(e:RPointerEvent<HTMLButtonElement>):void;
  onPointerUp(e:RPointerEvent<HTMLButtonElement>):void;onPointerCancel(e:RPointerEvent<HTMLButtonElement>):void;
  onClick():void;onKeyDown(e:RKeyboardEvent<HTMLButtonElement>):void};
};
type SheetOpts={
 /** The element the 3D canvas fills (its client rect is the stage). */
 stageRef:RefObject<HTMLElement>;
 /** Called when the stage's visible box changes: insets in CSS px on phones, null on desktop / when `fitOff`. */
 onInsets(ins:StageInsets|null):void;
 /** Show-off (full-screen) mode: no sheet over the stage, so no insets. */
 fitOff?:boolean;
};
const rectOf=(el:Element)=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height};};
/**
 * The shared phone bottom sheet (Ball, Boot and Jersey studios, Oct 14 2026): three snap heights, drag / tap / keyboard to
 * change them, the last one remembered per device, and the stage's visible box reported to the studio's scene so the model is
 * re-fitted (centred, as large as fits) whenever the sheet or the stage chrome moves. Heat: the drag writes the height straight
 * to the element (no React render per move); the scene redraws only from its own ResizeObserver / an inset change, so frames
 * are drawn only while the sheet is dragged or settling, never at rest.
 */
export function useStudioSheet({stageRef,onInsets,fitOff=false}:SheetOpts):StudioSheet{
 const [phone,setPhone]=useState(false),[viewH,setViewH]=useState(844),[snap,setSnapState]=useState<SheetSnap>('default');
 const heights=useMemo(()=>snapHeights(viewH),[viewH]);
 const sheetEl=useRef<HTMLElement|null>(null),drag=useRef<{id:number;y:number;h:number;t:number;v:number;moved:boolean}|null>(null),dragged=useRef(false);
 const phoneRef=useRef(phone);phoneRef.current=phone;
 const fitOffRef=useRef(fitOff);fitOffRef.current=fitOff;
 const onInsetsRef=useRef(onInsets);onInsetsRef.current=onInsets;
 const last=useRef<StageInsets|null|undefined>(undefined);
 useEffect(()=>{if(typeof window==='undefined')return;const mq=window.matchMedia(SHEET_PHONE_QUERY);
  const upd=()=>{setPhone(mq.matches);setViewH(window.innerHeight);};upd();setSnapState(loadSnap());
  mq.addEventListener?.('change',upd);window.addEventListener('resize',upd);
  return ()=>{mq.removeEventListener?.('change',upd);window.removeEventListener('resize',upd);};},[]);
 const setSnap=useCallback((s:SheetSnap)=>{setSnapState(s);saveSnap(s);},[]);
 /** Measures the stage's visible box and tells the scene only when it changed (a resize, a snap, a control appearing). */
 const measure=useCallback(()=>{const host=stageRef.current,sheet=sheetEl.current;let ins:StageInsets|null=null;
  if(host&&phoneRef.current&&!fitOffRef.current&&sheet&&sheet.getClientRects().length){
   const root=host.closest('[role=dialog]')??host.parentElement??host;
   const tops=[...root.querySelectorAll('[data-studio-top]')].map(rectOf),bottoms=[...root.querySelectorAll('[data-studio-bottom]')].map(rectOf);
   ins=stageInsets(rectOf(host),tops,[...bottoms,rectOf(sheet)]);}
  if(last.current!==undefined&&sameInsets(last.current,ins))return;last.current=ins;onInsetsRef.current(ins);},[stageRef]);
 // after every render (a control may have appeared or gone) and whenever the stage or the sheet changes size
 useLayoutEffect(()=>{measure();});
 useEffect(()=>{if(typeof ResizeObserver==='undefined')return;const ro=new ResizeObserver(()=>measure());
  if(stageRef.current)ro.observe(stageRef.current);if(sheetEl.current)ro.observe(sheetEl.current);return ()=>ro.disconnect();},[measure,stageRef,phone]);
 const ref=useCallback((el:HTMLElement|null)=>{sheetEl.current=el;},[]);
 /** Ends a drag: the sheet eases (CSS, ~220 ms) from where the finger left it to the chosen snap. */
 const settleTo=useCallback((s:SheetSnap)=>{const el=sheetEl.current;if(el){delete el.dataset.sheetDragging;void el.offsetHeight;el.style.height=`${heights[s]}px`;}setSnap(s);},[heights,setSnap]);
 const handleProps:StudioSheet['handleProps']={
  onPointerDown(e){if(!phoneRef.current||e.button>0)return;const el=sheetEl.current;if(!el)return;
   try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* synthetic */}
   drag.current={id:e.pointerId,y:e.clientY,h:el.getBoundingClientRect().height,t:performance.now(),v:0,moved:false};dragged.current=false;},
  onPointerMove(e){const d=drag.current,el=sheetEl.current;if(!d||d.id!==e.pointerId||!el)return;const dy=e.clientY-d.y;
   if(!d.moved&&Math.abs(dy)<6)return;if(!d.moved){d.moved=true;el.dataset.sheetDragging='';}
   const now=performance.now(),prev=parseFloat(el.style.height)||d.h,next=clampDrag(heights,d.h-dy),dt=Math.max(1,now-d.t);
   d.v=d.v*.5+(next-prev)/dt*.5;d.t=now;el.style.height=`${next}px`;},
  onPointerUp(e){const d=drag.current,el=sheetEl.current;if(!d||d.id!==e.pointerId)return;drag.current=null;if(!d.moved||!el)return;
   dragged.current=true;settleTo(settleSnap(heights,parseFloat(el.style.height)||d.h,performance.now()-d.t>120?0:d.v));},
  onPointerCancel(e){const d=drag.current,el=sheetEl.current;if(!d||d.id!==e.pointerId)return;drag.current=null;if(!d.moved||!el)return;
   dragged.current=true;settleTo(settleSnap(heights,parseFloat(el.style.height)||d.h));},
  onClick(){if(dragged.current){dragged.current=false;return;}settleTo(nextSnap(snap));},
  onKeyDown(e){const k=e.key;const to=k==='ArrowUp'||k==='PageUp'?stepSnap(snap,1):k==='ArrowDown'||k==='PageDown'?stepSnap(snap,-1):k==='Home'?'compact':k==='End'?'tall':null;
   if(!to)return;e.preventDefault();e.stopPropagation();if(to!==snap)settleTo(to);},
 };
 return {phone,snap,heights,setSnap,
  sheetProps:{ref,'data-sheet-snap':snap,style:phone?{height:`${heights[snap]}px`}:undefined},
  sheetClass:styles.sheetResizable,handleProps};
}

/**
 * The sheet's drag handle (phones only; hidden ≥ 900px): a full-width 44px strip with the little grab bar. Drag to resize live,
 * tap to cycle compact → default → tall, Up / Down (also Page Up / Down, Home / End) to change the snap from the keyboard.
 */
export function StudioSheetHandle({sheet}:{sheet:StudioSheet}){
 const i=SHEET_SNAPS.indexOf(sheet.snap);
 return <button type="button" role="slider" className={styles.sheetHandle} aria-label="Resize panel" aria-orientation="vertical"
  aria-valuemin={0} aria-valuemax={SHEET_SNAPS.length-1} aria-valuenow={i} aria-valuetext={SHEET_LABEL[sheet.snap]} title="Drag or tap to resize"
  data-sheet-handle="" {...sheet.handleProps}/>;
}
