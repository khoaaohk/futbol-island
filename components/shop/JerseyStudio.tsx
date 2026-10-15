'use client';
/**
 * Futbol shop · Jersey studio (Oct 12 2026, v2 "draw your own"). Full-screen overlay; the shop lazy-loads it with next/dynamic.
 * Contract: default export, props {onClose(); onBuy?(design)}. Self-contained: its own small three.js scene
 * (./jerseyScene, imported only once the studio is open), its own save under JERSEY_KEY (auto-save + 3 slots).
 *
 * Kid UX (ages 7–12): the shared step pills (Style → Colours → Pattern → Draw → Crest → Name & number → Done — the shared
 * components/shop/StudioControls.tsx <StudioSteps>, same pill design as Boot and Ball, no progress bar), big tiles with drawn
 * thumbnails, 13 presets, one-tap kit palettes, a harmonious Randomise, hover / press previews on the 3D shirt, a "Looking
 * good!" Done moment, a full-screen Show-off turntable, save slots with thumbnails, and a Buy confirmation with the receipt.
 * Undo / redo cover every edit, including each drawn stroke.
 * DRAW: brush, spray, eraser, fill, straight line, stamps (circle, star, heart, stripe band), 3 sizes, kid colours + custom,
 * mirror, "paint on" lock, On shirt / Flat template view. The drawing is a layer between the pattern and the prints.
 * Every option is original: no real teams, crests, sponsors or kit makers. Tips teach football words and shirt history.
 */
import {useCallback,useEffect,useMemo,useReducer,useRef,useState,type CSSProperties,type PointerEvent as ReactPointerEvent,type ReactNode} from 'react';
import styles from './JerseyStudio.module.css';
import {BackButton} from '@/components/BackButton';
import CoinPill,{CoinIcon} from './CoinPill';
import {useArcadeWallet} from '@/lib/arcade/arcadeWallet';
import {
 type JerseyDesign,type JerseyCrest,type JerseySave,type PatternId,
 DEFAULT_JERSEY,PRESETS,PALETTE,KIT_PALETTES,SLEEVES,COLLARS,PATTERNS,FONTS,CREST_SHAPES,CREST_ICONS,SPONSORS,NAME_MAX,
 cleanName,nameProblem,cleanInitials,initialsOk,cleanNumber,numberTip,jerseyPrice,jerseyPriceParts,randomJersey,applyPalette,
 loadJerseySave,writeJerseySave,emptySave,validateJersey,sameJersey,bestInk,hasArt,jerseyHistory,
} from '@/lib/shop/jersey';
import {drawFlatShirt,drawCrest,FONT_FACES} from '@/lib/shop/jerseyPaint';
import {type ArtOp,type ArtShape,type ArtSize,artFullness} from '@/lib/shop/paint/artOps';
import type {JerseySceneApi,JerseyFocus,JerseyAngle,DrawConfig,DrawTool,PaintLock} from './jerseyScene';
import {StudioIconButton,StudioIconRow,StudioModeToggle,StudioSheetHandle,StudioSteps,StudioViewChips,studioSectionTitle,useStudioSheet} from './StudioControls';
import type {StageInsets} from '@/lib/shop/studioSheet';
import {countDesignSave} from '@/lib/analytics/shopEvents';

type Step='style'|'colours'|'pattern'|'draw'|'crest'|'name'|'done';
const STEPS:{id:Step;label:string}[]=[{id:'style',label:'Style'},{id:'colours',label:'Colours'},{id:'pattern',label:'Pattern'},{id:'draw',label:'Draw'},{id:'crest',label:'Crest'},{id:'name',label:'Name & number'},{id:'done',label:'Done'}];
const STEP_VIEW:Record<Step,[JerseyAngle,JerseyFocus]>={style:['front','full'],colours:['front','full'],pattern:['front','full'],draw:['front','full'],crest:['front','crest'],name:['back','back'],done:['front','full']};
const KID_INKS=['#15171a','#f7f3ea','#d7263d','#ff6b5b','#ff9f1c','#ffd23f','#a3d93a','#2e9e5b','#2ec4d6','#2554c7','#7b4bb7','#ff8fb8','#7a4b2a'];
const TOOLS:{id:DrawTool;label:string}[]=[{id:'brush',label:'Brush'},{id:'spray',label:'Spray'},{id:'line',label:'Line'},{id:'stamp',label:'Stamp'},{id:'fill',label:'Fill'},{id:'eraser',label:'Eraser'},{id:'hand',label:'Turn'}];
const STAMPS:{id:ArtShape;label:string}[]=[{id:'t',label:'Star'},{id:'h',label:'Heart'},{id:'c',label:'Circle'},{id:'r',label:'Stripe'}];
const LOCKS:{id:PaintLock;label:string}[]=[{id:'all',label:'Everywhere'},{id:'front',label:'Front'},{id:'back',label:'Back'},{id:'sleeves',label:'Sleeves'}];

// ---- small drawn pieces -----------------------------------------------------------------------------------------------------
function useCanvas(draw:(ctx:CanvasRenderingContext2D,w:number,h:number)=>void,deps:string,w:number,h:number){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const c=ref.current;if(!c)return;const dpr=Math.min(2,window.devicePixelRatio||1);
  c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);const ctx=c.getContext('2d');if(!ctx)return;draw(ctx,c.width,c.height);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[deps,w,h]);
 return ref;
}
function ShirtThumb({design,size,pattern,back,prints,art,className}:{design:JerseyDesign;size:number;pattern?:PatternId;back?:boolean;prints?:boolean;art?:boolean;className?:string}){
 // redraw only when something it shows changes (pattern tiles ignore the name, number, crest, sponsor and drawing)
 const showArt=art??prints;
 const key=prints||showArt?JSON.stringify([design,back,prints,showArt]):JSON.stringify([design.sleeves,design.collar,design.cuffs,design.primary,design.secondary,design.accent,pattern??design.pattern,back]);
 const ref=useCanvas((ctx,w,h)=>drawFlatShirt(ctx,design,w,h,{pattern,back,prints,art:showArt}),key,size,size*.86);
 return <canvas ref={ref} className={className??styles.thumb} style={{width:size,height:size*.86}} aria-hidden="true"/>;
}
function CrestThumb({crest,size}:{crest:JerseyCrest;size:number}){
 const ref=useCanvas((ctx,w,h)=>{ctx.clearRect(0,0,w,h);drawCrest(ctx,crest,w/2,h/2,h*.9);},JSON.stringify(crest),size,size);
 return <canvas ref={ref} style={{width:size,height:size}} aria-hidden="true"/>;
}
const Coin=()=><CoinIcon/>;
const I={
 undo:<path d="M9 7 4 12l5 5M4.5 12H15a5 5 0 0 1 0 10h-2"/>,
 redo:<path d="m15 7 5 5-5 5M19.5 12H9a5 5 0 0 0 0 10h2"/>,
 dice:<><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" transform="rotate(-10 12 12)"/><g fill="currentColor" stroke="none" transform="rotate(-10 12 12)"><circle cx="8.3" cy="8.3" r="1.55"/><circle cx="15.7" cy="15.7" r="1.55"/><circle cx="12" cy="12" r="1.55"/><circle cx="15.7" cy="8.3" r="1.55"/><circle cx="8.3" cy="15.7" r="1.55"/></g></>,
 save:<><path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/></>,
 check:<path d="m5 12.5 4.2 4.2L19 7"/>,
 spin:<><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4.5h-4.5"/></>,
 hand:<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12m0-1.5V5a1.5 1.5 0 0 1 3 0v6m0-4a1.5 1.5 0 0 1 3 0v6.5c0 4-2.5 6.5-6 6.5-2.6 0-4-1.3-5.5-3.5L4 14.5a1.6 1.6 0 0 1 2.6-1.8L8 14.5"/>,
 swap:<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>,
 bulb:<><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.3 1 2.2h5.2c0-.9.4-1.7 1-2.2A6 6 0 0 0 12 3z"/></>,
 brush:<><path d="M14.5 4.5 19.5 9.5 11 18l-5-5z"/><path d="M6 13c-2.5.6-3 3-3 6 3 0 5.4-.5 6-3"/></>,
 spray:<><rect x="8" y="9" width="7" height="12" rx="2"/><path d="M10 9V6h3v3M17 5h.01M19 7h.01M19 3h.01M21 5h.01"/></>,
 line:<><path d="M5 19 19 5"/><circle cx="5" cy="19" r="1.6" fill="currentColor"/><circle cx="19" cy="5" r="1.6" fill="currentColor"/></>,
 stamp:<><path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.8z"/></>,
 fill:<><path d="m11 4 8 8-6.5 6.5a2 2 0 0 1-2.8 0L4.5 13.3a2 2 0 0 1 0-2.8z"/><path d="M4.5 12h13M20 15s2 2.4 2 3.6a2 2 0 0 1-4 0c0-1.2 2-3.6 2-3.6z"/></>,
 eraser:<><path d="m8 20-4.5-4.5a2 2 0 0 1 0-2.8L13 3.2a2 2 0 0 1 2.8 0l4.9 4.9a2 2 0 0 1 0 2.8L11 20z"/><path d="M8 20h12M7.5 9.5l7 7"/></>,
 mirror:<><path d="M12 3v18" strokeDasharray="2 2.6"/><path d="M9 7 4 12l5 5zM15 7l5 5-5 5z"/></>,
 trash:<><path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13"/></>,
 expand:<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>,
 close:<path d="M6 6l12 12M18 6 6 18"/>,
 flat:<><path d="M8 4 4 7l2 3 2-1v11h8V9l2 1 2-3-4-3c-.6 1.6-2.2 2.6-4 2.6S8.6 5.6 8 4z"/></>,
 shirt3d:<><path d="M8 4 4 7l2 3 2-1v11h8V9l2 1 2-3-4-3c-.6 1.6-2.2 2.6-4 2.6S8.6 5.6 8 4z"/><path d="M10 14c1.2.8 2.8.8 4 0" /></>,
};
const Ico=({name,size=22}:{name:keyof typeof I;size?:number})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{I[name]}</svg>;
function StampIcon({shape}:{shape:ArtShape}){
 return <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="currentColor">
  {shape==='c'?<circle cx="12" cy="12" r="8"/>:shape==='t'?<path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.8z"/>
   :shape==='h'?<path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>:<rect x="2" y="9" width="20" height="6" rx="1.5"/>}
 </svg>;
}

/** Drawn collar / sleeve icons for the Style tiles. */
function StyleIcon({kind}:{kind:string}){
 const body='M14 12 L24 8 Q32 12 40 8 L50 12 L58 26 L50 30 L48 26 L48 56 L16 56 L16 26 L14 30 L6 26 Z';
 const longBody='M14 12 L24 8 Q32 12 40 8 L50 12 L60 50 L52 52 L48 28 L48 56 L16 56 L16 28 L12 52 L4 50 Z';
 const neck:Record<string,ReactNode>={
  crew:<path d="M24 8 Q32 16 40 8" strokeWidth="3.4"/>,
  vneck:<path d="M24 8 L32 20 L40 8" strokeWidth="3.4"/>,
  polo:<><path d="M24 8 L30 18 L32 13 L34 18 L40 8" strokeWidth="3"/><path d="M32 18 V28"/><circle cx="32" cy="22" r="1.2"/><circle cx="32" cy="26" r="1.2"/></>,
  wrap:<><path d="M24 8 L32 18 L40 8" strokeWidth="3.4"/><path d="M40 8 L29 21" strokeWidth="3.4"/></>,
 };
 const long=kind==='long';
 return <svg viewBox="0 0 64 60" className={styles.styleIcon} aria-hidden="true">
  <path d={long?longBody:body} className={styles.iconBody}/>
  <g className={styles.iconTrim}>{neck[kind]??neck.crew}</g>
  {kind==='cuffsOn'&&<g className={styles.iconTrim}><path d="M50 30 L58 26" strokeWidth="4"/><path d="M6 26 L14 30" strokeWidth="4"/></g>}
 </svg>;
}

const tip=(text:string)=><p className={styles.tip}><Ico name="bulb" size={18}/><span>{text}</span></p>;
type PreviewFn=(make:()=>JerseyDesign)=>{onPointerEnter:(e:ReactPointerEvent)=>void;onPointerLeave:()=>void;onPointerDown:(e:ReactPointerEvent)=>void;onPointerCancel:()=>void};
function Swatches({value,onPick,colors=PALETTE.map(p=>p.hex),custom=true,label,preview}:{value:string;onPick:(hex:string,key?:string)=>void;colors?:string[];custom?:boolean;label:string;preview?:(hex:string)=>ReturnType<PreviewFn>}){
 return <div className={styles.swatches} role="group" aria-label={label}>
  {colors.map(hex=>{const p=PALETTE.find(x=>x.hex===hex);return <button key={hex} type="button" className={styles.swatch} style={{'--sw':hex} as CSSProperties} aria-pressed={value===hex} aria-label={p?.label??hex} title={p?.label} {...preview?.(hex)} onClick={()=>onPick(hex)}><span className={styles.swatchCheck}><Ico name="check" size={16}/></span></button>;})}
  {custom&&<label className={styles.customSwatch} title="Mix your own colour" data-on={!colors.includes(value)} style={{'--sw':value} as CSSProperties}>
   <input type="color" value={value} onChange={e=>onPick(e.target.value.toLowerCase(),'custom')} aria-label="Mix your own colour"/>
   <span aria-hidden="true">+</span>
  </label>}
 </div>;
}

// ---- the studio ---------------------------------------------------------------------------------------------------------
export default function JerseyStudio({onClose,onBuy}:{onClose():void;onBuy?(design:JerseyDesign):void}){
 const wallet=useArcadeWallet();
 const initial=useMemo<JerseySave>(()=>typeof window==='undefined'?emptySave():loadJerseySave(),[]);
 const [h,dispatch]=useReducer(jerseyHistory,{design:initial.current,past:[],future:[],key:'',at:0});
 const d=h.design;
 const [save,setSave]=useState<JerseySave>(initial);
 const [step,setStep]=useState<Step>('style');
 const [visited,setVisited]=useState<Set<Step>>(()=>new Set(['style']));
 const [sceneState,setSceneState]=useState<'loading'|'ready'|'failed'>('loading');
 const [face,setFace]=useState<'front'|'back'>('front');
 const [angle,setAngle]=useState<JerseyAngle>('front');
 const [hint,setHint]=useState(true);
 const [toast,setToast]=useState<{id:number;text:string}|null>(null);
 const [confirm,setConfirm]=useState(false);
 const [slotPicker,setSlotPicker]=useState(false);
 const [replaceArm,setReplaceArm]=useState<number|null>(null);
 const [colorRole,setColorRole]=useState<'primary'|'secondary'|'accent'>('primary');
 const [crestRole,setCrestRole]=useState<'fill'|'ring'|'ink'>('fill');
 const [nameDraft,setNameDraft]=useState(d.name);
 const [nameMsg,setNameMsg]=useState<string|null>(null);
 const [slot,setSlot]=useState(()=>Math.max(0,initial.slots.findIndex(s=>!s)));
 const [draw,setDraw]=useState<DrawConfig>({tool:'brush',size:1,color:'#ffd23f',mirror:false,lock:'all',stamp:'t'});
 const [flat,setFlat]=useState(false);
 const [clearArm,setClearArm]=useState(false);
 const [showOff,setShowOff]=useState<'off'|'spinning'|'still'>('off');
 const contentRef=useRef<HTMLDivElement>(null),stepsRef=useRef<HTMLElement>(null),stage=useRef<HTMLDivElement>(null),sceneRef=useRef<JerseySceneApi|null>(null),designRef=useRef(d),pulseNext=useRef(false);
 const insetsRef=useRef<StageInsets|null>(null);
 // The resizable phone sheet (shared with Ball and Boot): the shirt re-fits to the stage's visible box as it moves.
 const sheet=useStudioSheet({stageRef:stage,fitOff:showOff!=='off',onInsets:i=>{insetsRef.current=i;sceneRef.current?.setInsets(i);}});
 const reduced=useMemo(()=>typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches,[]);
 designRef.current=d;

 const set=useCallback((patch:Partial<JerseyDesign>,key?:string,pulse=true)=>{pulseNext.current=pulse;dispatch({type:'set',design:{...designRef.current,...patch},key});},[]);
 const setCrest=useCallback((patch:Partial<JerseyCrest>,key?:string)=>{pulseNext.current=true;dispatch({type:'set',design:{...designRef.current,crest:{...designRef.current.crest,...patch}},key});},[]);
 const say=useCallback((text:string)=>setToast({id:Date.now(),text}),[]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(null),2200);return()=>clearTimeout(t);},[toast]);
 /** Hover (mouse) or press (touch) shows a choice on the 3D shirt before it is picked; leaving / scrolling puts it back. */
 const pv=useCallback<PreviewFn>(make=>({
  onPointerEnter:e=>{if(e.pointerType==='mouse')sceneRef.current?.preview(make());},
  onPointerLeave:()=>sceneRef.current?.preview(null),
  onPointerDown:e=>{if(e.pointerType!=='mouse')sceneRef.current?.preview(make());},
  onPointerCancel:()=>sceneRef.current?.preview(null),
 }),[]);

 // three.js scene: imported only now, disposed on close. Its callbacks read refs, so it is created once.
 const cb=useRef({onArt:(op:ArtOp)=>{void op;},onArtFull:()=>{},onArtMiss:()=>{},onShowOffEnd:()=>{}});
 cb.current={
  onArt:op=>{const cur=designRef.current;pulseNext.current=false;dispatch({type:'set',design:{...cur,art:{v:1,ops:[...(cur.art?.ops??[]),op]}}});},
  onArtFull:()=>say('Your shirt is full of art! Undo or clear to draw more.'),
  onArtMiss:()=>say(draw.lock==='all'?'Tap on the shirt to paint':`Painting is locked to the ${draw.lock}`),
  onShowOffEnd:()=>setShowOff(s=>s==='spinning'?'still':s),
 };
 useEffect(()=>{
  let api:JerseySceneApi|null=null,cancelled=false;
  import('./jerseyScene').then(m=>{
   if(cancelled||!stage.current)return;
   try{
    api=m.createJerseyScene(stage.current,{reducedMotion:reduced,onFace:setFace,onInteract:()=>setHint(false),
     onArt:op=>cb.current.onArt(op),onArtFull:()=>cb.current.onArtFull(),onArtMiss:()=>cb.current.onArtMiss(),onShowOffEnd:()=>cb.current.onShowOffEnd()});
    sceneRef.current=api;api.setInsets(insetsRef.current);api.setDesign(designRef.current);setSceneState('ready');
   }catch{setSceneState('failed');}
  }).catch(()=>{if(!cancelled)setSceneState('failed');});
  return()=>{cancelled=true;api?.dispose();sceneRef.current=null;};
 },[reduced]);
 useEffect(()=>{sceneRef.current?.setDesign(d,{pulse:pulseNext.current});pulseNext.current=false;},[d]);
 useEffect(()=>{const [f,focus]=STEP_VIEW[step];setAngle(f);sceneRef.current?.setView(f,focus);if(step==='done')sceneRef.current?.spin();},[step,sceneState]);
 // draw mode follows the step; the flat view only exists inside it
 useEffect(()=>{sceneRef.current?.setDraw(step==='draw'&&showOff==='off'?draw:null);},[step,draw,sceneState,showOff]);
 useEffect(()=>{sceneRef.current?.setFlat(step==='draw'&&flat&&showOff==='off');},[step,flat,sceneState,showOff]);
 useEffect(()=>{sceneRef.current?.showOff(showOff==='spinning');},[showOff]);
 // the drag hint fades by itself
 useEffect(()=>{const t=setTimeout(()=>setHint(false),6000);return()=>clearTimeout(t);},[]);
 useEffect(()=>{if(step==='draw')setHint(true);},[step]);
 useEffect(()=>{if(!hint)return;const t=setTimeout(()=>setHint(false),5000);return()=>clearTimeout(t);},[hint]);
 useEffect(()=>{if(!clearArm)return;const t=setTimeout(()=>setClearArm(false),3000);return()=>clearTimeout(t);},[clearArm]);
 useEffect(()=>{if(replaceArm==null)return;const t=setTimeout(()=>setReplaceArm(null),3000);return()=>clearTimeout(t);},[replaceArm]);

 // auto-save the design in progress (debounced)
 useEffect(()=>{const t=setTimeout(()=>{setSave(s=>{const next={...s,current:d};writeJerseySave(next);return next;});},450);return()=>clearTimeout(t);},[d]);
 // keep the page behind still
 useEffect(()=>{const o=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=o;};},[]);

 const stepIndex=STEPS.findIndex(s=>s.id===step);
 const goStep=(s:Step)=>{
  const to=STEPS.findIndex(x=>x.id===s);
  setStep(s);setVisited(v=>{const n=new Set(v);n.add(s);for(let i=0;i<to;i++)n.add(STEPS[i].id);return n;});
  contentRef.current?.scrollTo({top:0});
  requestAnimationFrame(()=>stepsRef.current?.querySelector(`[data-step="${s}"]`)?.scrollIntoView({block:'nearest',inline:'center',behavior:reduced?'auto':'smooth'}));
 };
 const next=STEPS[stepIndex+1],prev=STEPS[stepIndex-1];
 const price=jerseyPrice(d);
 const fullness=artFullness(d.art);

 const saveToSlot=(i:number)=>{
  const named=`${d.name.trim()?`${d.name.trim()} `:''}${d.number??''}`.trim()||`Design ${i+1}`;
  setSave(s=>{const slots=s.slots.slice();slots[i]={name:cleanName(named)||`Design ${i+1}`,design:d,savedAt:Date.now()};const n={...s,slots,current:d};writeJerseySave(n);return n;});
  setSlot(i);setSlotPicker(false);setReplaceArm(null);say(`Saved in slot ${i+1}`);countDesignSave('jersey');
 };
 const loadSlot=(i:number)=>{const sl=save.slots[i];if(!sl)return;pulseNext.current=true;const v=validateJersey(sl.design).design;dispatch({type:'set',design:v,key:'load'});setNameDraft(v.name);setSlot(i);setSlotPicker(false);say(`Loaded slot ${i+1}`);};
 const randomise=()=>{pulseNext.current=true;dispatch({type:'set',design:randomJersey({name:d.name,number:d.number,art:d.art,crest:d.crest})});say('Shuffled!');};
 const buy=()=>{setConfirm(false);setSave(s=>{const n={...s,current:d};writeJerseySave(n);return n;});if(onBuy)onBuy(validateJersey(d).design);else say('Take it to the till to buy!');};
 const setDrawCfg=(patch:Partial<DrawConfig>)=>setDraw(c=>({...c,...patch}));
 const lockTo=(lock:PaintLock)=>{setDrawCfg({lock});if(flat)return;const a:JerseyAngle=lock==='back'?'back':lock==='sleeves'?'left':'front';setAngle(a);sceneRef.current?.setView(a,lock==='sleeves'?'side':'full');};
 const turnTo=(a:JerseyAngle)=>{setAngle(a);if(sceneState==='ready')sceneRef.current?.setView(a,a==='left'||a==='right'?'side':step==='crest'&&a==='front'?'crest':step==='name'&&a==='back'?'back':'full');else if(a==='front'||a==='back')setFace(a);};

 // keyboard: undo/redo and Escape
 useEffect(()=>{
  const k=(e:KeyboardEvent)=>{
   const typing=(e.target as HTMLElement)?.closest?.('input,textarea');
   if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'&&!typing){e.preventDefault();dispatch({type:e.shiftKey?'redo':'undo'});}
   else if(e.key==='Escape'){if(confirm)setConfirm(false);else if(slotPicker)setSlotPicker(false);else if(showOff!=='off')setShowOff('off');else onClose();}
  };
  window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);
 },[confirm,slotPicker,showOff,onClose]);
 // undo/redo also restores the name box
 useEffect(()=>{setNameDraft(n=>cleanName(n)===d.name?n:d.name);},[d.name]);

 const onName=(raw:string)=>{
  const clean=cleanName(raw);setNameDraft(clean);
  const strip=clean!==raw.slice(0,NAME_MAX)&&raw.length>0;
  const problem=nameProblem(clean);
  setNameMsg(problem??(strip?'Letters, spaces and hyphens only.':null));
  if(!problem)set({name:clean},'name',false);
 };
 const setNumber=(n:number|null)=>set({number:n},'number',true);
 const savedSlots=save.slots.map((s,i)=>({s,i})).filter(x=>x.s);

 // ---- step bodies ---------------------------------------------------------------------------------------------------------
 let body:ReactNode=null;
 if(step==='style')body=<>
  <section className={styles.group}>
   <h3 className={studioSectionTitle}>Start from a design</h3>
   <div className={styles.presets}>
    {PRESETS.map(p=>{const make=()=>({...p.design,name:d.name,art:d.art});return <button key={p.id} type="button" className={styles.preset} aria-pressed={sameJersey(make(),d)} {...pv(make)} onClick={()=>{pulseNext.current=true;dispatch({type:'set',design:make()});}}>
     <ShirtThumb design={p.design} size={84}/><span>{p.label}</span></button>;})}
   </div>
  </section>
  {savedSlots.length>0&&<section className={styles.group}>
   <h3 className={studioSectionTitle}>Your saved designs</h3>
   <div className={styles.presets}>
    {savedSlots.map(({s,i})=><button key={i} type="button" className={styles.preset} {...pv(()=>validateJersey(s!.design).design)} onClick={()=>loadSlot(i)}>
     <ShirtThumb design={s!.design} art size={84}/><span>{s!.name}</span></button>)}
   </div>
  </section>}
  <section className={styles.group}>
   <h3 className={studioSectionTitle}>Sleeves</h3>
   <div className={styles.tiles2}>
    {SLEEVES.map(s=><button key={s.id} type="button" className={styles.tile} aria-pressed={d.sleeves===s.id} onClick={()=>set({sleeves:s.id})}><StyleIcon kind={s.id==='long'?'long':'short'}/><span>{s.label}</span></button>)}
   </div>
  </section>
  <section className={styles.group}>
   <h3 className={studioSectionTitle}>Collar</h3>
   <div className={styles.tiles4}>
    {COLLARS.map(c=><button key={c.id} type="button" className={styles.tile} aria-pressed={d.collar===c.id} onClick={()=>{set({collar:c.id});sceneRef.current?.setView('front','collar');}}><StyleIcon kind={c.id}/><span>{c.label}</span></button>)}
   </div>
   {tip(COLLARS.find(c=>c.id===d.collar)!.tip)}
  </section>
  <section className={styles.group}>
   <h3 className={studioSectionTitle}>Cuffs</h3>
   <div className={styles.tiles2}>
    <button type="button" className={styles.tile} aria-pressed={d.cuffs} onClick={()=>{set({cuffs:true});sceneRef.current?.setView('front','sleeve');}}><StyleIcon kind="cuffsOn"/><span>Rib cuffs</span></button>
    <button type="button" className={styles.tile} aria-pressed={!d.cuffs} onClick={()=>{set({cuffs:false});sceneRef.current?.setView('front','sleeve');}}><StyleIcon kind="short"/><span>Plain hem</span></button>
   </div>
  </section>
 </>;
 else if(step==='colours'){const roles=[{id:'primary',label:'Main'},{id:'secondary',label:'Second'},{id:'accent',label:'Trim'}] as const;
  const pickRole=(hex:string)=>({[colorRole]:hex,...(colorRole==='primary'&&d.textColor===d.primary?{textColor:bestInk(hex)}:{})});
  body=<>
  <section className={styles.group}>
   <h3 className={studioSectionTitle}>Kit palettes <small className={styles.h3Note}>one tap, all three colours</small></h3>
   <div className={styles.palettes}>
    {KIT_PALETTES.map(p=><button key={p.id} type="button" className={styles.paletteTile} aria-pressed={d.primary===p.colors[0]&&d.secondary===p.colors[1]&&d.accent===p.colors[2]}
     {...pv(()=>applyPalette(designRef.current,p.colors))} onClick={()=>{pulseNext.current=true;dispatch({type:'set',design:applyPalette(d,p.colors)});}}>
     <span className={styles.paletteDots} aria-hidden="true">{p.colors.map((c,i)=><i key={i} style={{background:c}}/>)}</span><span>{p.label}</span></button>)}
   </div>
  </section>
  <section className={styles.group}>
   <div className={styles.groupHead}><h3 className={studioSectionTitle}>Or pick each colour</h3>
    <button type="button" className={styles.roundSmall} aria-label="Swap main and second colours" title="Swap" onClick={()=>set({primary:d.secondary,secondary:d.primary})}><Ico name="swap" size={20}/></button></div>
   <div className={styles.roles}>
    {roles.map(r=><button key={r.id} type="button" className={styles.role} aria-pressed={colorRole===r.id} onClick={()=>setColorRole(r.id)}><span className={styles.roleDot} style={{background:d[r.id]}}/>{r.label}</button>)}
   </div>
   <Swatches label={`${roles.find(r=>r.id===colorRole)!.label} colour`} value={d[colorRole]} preview={hex=>pv(()=>({...designRef.current,...pickRole(hex)}))}
    onPick={(hex,key)=>set(pickRole(hex),key?`c-${colorRole}`:undefined,!key)}/>
   {tip(colorRole==='accent'?'Trim is the collar, the cuffs and the outline on your number.':colorRole==='secondary'?'The second colour paints the stripes, hoops, sash or checks.':'Teams wear a home kit and an away kit, so they never clash with the other team.')}
  </section>
 </>;}
 else if(step==='pattern')body=<>
  <section className={styles.group}>
   <h3 className={studioSectionTitle}>Pattern</h3>
   <div className={styles.patterns}>
    {PATTERNS.map(p=><button key={p.id} type="button" className={styles.patternTile} aria-pressed={d.pattern===p.id} {...pv(()=>({...designRef.current,pattern:p.id}))} onClick={()=>set({pattern:p.id})}>
     <ShirtThumb design={d} pattern={p.id} size={84}/><span>{p.label}</span></button>)}
   </div>
   {tip(PATTERNS.find(p=>p.id===d.pattern)!.tip)}
  </section>
 </>;
 else if(step==='draw'){
  const inks=[...new Set([d.primary,d.secondary,d.accent,...KID_INKS])];
  const sizeTool=draw.tool!=='fill'&&draw.tool!=='hand';
  body=<>
  <section className={styles.group}>
   <div className={styles.tools} role="group" aria-label="Drawing tools">
    {TOOLS.map(t=><button key={t.id} type="button" className={styles.toolTile} aria-pressed={draw.tool===t.id} data-tool={t.id} onClick={()=>setDrawCfg({tool:t.id})}>
     <Ico name={t.id==='hand'?'hand':t.id} size={26}/><span>{t.label}</span></button>)}
   </div>
  </section>
  {draw.tool==='stamp'&&<section className={styles.group}>
   <div className={styles.stamps} role="group" aria-label="Stamp">{STAMPS.map(s=><button key={s.id} type="button" className={styles.tile} aria-pressed={draw.stamp===s.id} data-stamp={s.id} style={{color:draw.color}} onClick={()=>setDrawCfg({stamp:s.id})}><StampIcon shape={s.id}/><span>{s.label}</span></button>)}</div>
  </section>}
  {draw.tool!=='eraser'&&draw.tool!=='hand'&&<section className={`${styles.group} ${styles.inkRow}`}>
   <Swatches label="Paint colour" value={draw.color} colors={inks} onPick={hex=>setDrawCfg({color:hex})}/>
  </section>}
  {sizeTool&&<section className={styles.group}>
   <div className={styles.sizeRow} role="group" aria-label="Size">
    {([0,1,2] as ArtSize[]).map(s=><button key={s} type="button" className={styles.sizeBtn} aria-pressed={draw.size===s} aria-label={['Small','Medium','Large'][s]} data-size={s} onClick={()=>setDrawCfg({size:s})}>
     <i style={{width:[8,15,24][s],height:[8,15,24][s],background:draw.tool==='eraser'?'#fff':draw.color}}/></button>)}
    <button type="button" className={styles.chip} aria-pressed={draw.mirror} data-mirror onClick={()=>setDrawCfg({mirror:!draw.mirror})}><Ico name="mirror" size={20}/>Mirror</button>
   </div>
  </section>}
  <section className={styles.group}>
   <div className={styles.groupHead}><h3 className={studioSectionTitle}>Paint on</h3>
    <div className={styles.meter} title="How much drawing space is left" aria-label={`Paint left: ${Math.round((1-fullness)*100)}%`}>
     <span>Paint left</span><i><b style={{width:`${Math.round((1-fullness)*100)}%`}} data-low={fullness>.85}/></i>
    </div></div>
   <div className={styles.locks} role="group" aria-label="Paint on">
    {LOCKS.map(l=><button key={l.id} type="button" aria-pressed={draw.lock===l.id} data-lock={l.id} onClick={()=>lockTo(l.id)}>{l.label}</button>)}
   </div>
  </section>
  <section className={styles.group}>
   <div className={styles.drawFoot}>
    <button type="button" className={clearArm?styles.chipWarn:styles.chip} disabled={!hasArt(d)} data-clear onClick={()=>{if(!clearArm){setClearArm(true);return;}setClearArm(false);set({art:undefined},undefined,false);say('Drawing cleared (Undo brings it back)');}}>
     <Ico name="trash" size={19}/>{clearArm?'Tap again to clear':'Clear drawing'}</button>
   </div>
   {tip(draw.tool==='fill'?'Fill colours a whole panel, or the inside of a shape you drew. Draw a ring first, then fill it!'
    :draw.tool==='stamp'?'Tap the shirt to stamp. The stripe stamp paints a band right across, like the hoops on a classic kit.'
    :draw.mirror?'Mirror paints both sides at once. Lots of kits are symmetrical, so they look the same from left and right.'
    :'Clubs often put a symbol of their home on the kit, like a ship for a port town or a castle. What says “island” to you?')}
  </section>
 </>;}
 else if(step==='crest'){const roles=[{id:'fill',label:'Badge'},{id:'ring',label:'Ring'},{id:'ink',label:'Letters'}] as const;
  body=<>
  <section className={`${styles.group} ${styles.crestTop}`}>
   <div className={styles.crestPreview}><CrestThumb crest={d.crest} size={104}/></div>
   <div className={styles.crestFields}>
    <label className={`${styles.fieldLabel} ${studioSectionTitle}`} htmlFor="jersey-initials">Initials</label>
    <input id="jersey-initials" className={styles.input} value={d.crest.initials} maxLength={3} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="ABC"
     onChange={e=>{const v=cleanInitials(e.target.value);if(v===''||initialsOk(v))setCrest({initials:v},'initials');}}/>
    <small className={styles.hintText}>1 to 3 letters</small>
   </div>
  </section>
  <section className={styles.group}>
   <h3 className={studioSectionTitle}>Shape</h3>
   <div className={styles.tiles3}>{CREST_SHAPES.map(s=><button key={s.id} type="button" className={styles.tile} aria-pressed={d.crest.shape===s.id} {...pv(()=>({...designRef.current,crest:{...designRef.current.crest,shape:s.id}}))} onClick={()=>setCrest({shape:s.id})}><CrestThumb crest={{...d.crest,shape:s.id}} size={48}/><span>{s.label}</span></button>)}</div>
  </section>
  <section className={styles.group}>
   <h3 className={studioSectionTitle}>Icon</h3>
   <div className={styles.tiles5}>{CREST_ICONS.map(s=><button key={s.id} type="button" className={styles.tile} aria-pressed={d.crest.icon===s.id} {...pv(()=>({...designRef.current,crest:{...designRef.current.crest,icon:s.id}}))} onClick={()=>setCrest({icon:s.id})}><CrestThumb crest={{...d.crest,icon:s.id,initials:''}} size={40}/><span>{s.label}</span></button>)}</div>
  </section>
  <section className={styles.group}>
   <h3 className={studioSectionTitle}>Crest colours</h3>
   <div className={styles.roles}>
    {roles.map(r=><button key={r.id} type="button" className={styles.role} aria-pressed={crestRole===r.id} onClick={()=>setCrestRole(r.id)}><span className={styles.roleDot} style={{background:d.crest[r.id]}}/>{r.label}</button>)}
    <button type="button" className={styles.chip} onClick={()=>setCrest({fill:d.secondary,ring:d.accent,ink:d.primary})}>Match kit</button>
   </div>
   <Swatches label={`Crest ${crestRole} colour`} value={d.crest[crestRole]} preview={hex=>pv(()=>({...designRef.current,crest:{...designRef.current.crest,[crestRole]:hex}}))} onPick={(hex,key)=>setCrest({[crestRole]:hex},key?`cc-${crestRole}`:undefined)}/>
  </section>
  <section className={styles.group}>
   <h3 className={studioSectionTitle}>Shirt sponsor</h3>
   <div className={styles.sponsors}>{SPONSORS.map(s=><button key={s.id} type="button" className={styles.sponsor} aria-pressed={d.sponsor===s.id} {...pv(()=>({...designRef.current,sponsor:s.id}))} onClick={()=>set({sponsor:s.id})}>
    <strong style={s.id==='none'?undefined:{fontFamily:FONT_FACES.classic.css}}>{s.id==='none'?'Nothing':s.line}</strong><small>{s.label}</small></button>)}</div>
   {tip(SPONSORS.find(s=>s.id===d.sponsor)!.tip)}
  </section>
 </>;}
 else if(step==='name')body=<>
  <section className={styles.group}>
   <label className={`${styles.fieldLabel} ${studioSectionTitle}`} htmlFor="jersey-name">Name on the back</label>
   <div className={styles.nameRow}>
    <input id="jersey-name" className={`${styles.input} ${styles.nameInput}`} value={nameDraft} maxLength={NAME_MAX} autoComplete="off" autoCapitalize="characters" spellCheck={false} enterKeyHint="done" placeholder="YOUR NAME"
     aria-invalid={!!nameMsg} aria-describedby="jersey-name-help" onFocus={()=>sceneRef.current?.setView('back','back')} onChange={e=>onName(e.target.value)}/>
    <span className={styles.counter} aria-hidden="true">{nameDraft.length}/{NAME_MAX}</span>
   </div>
   <small id="jersey-name-help" className={nameMsg?styles.warn:styles.hintText} role={nameMsg?'alert':undefined}>{nameMsg??'Letters, spaces and hyphens. Up to 12.'}</small>
  </section>
  <section className={styles.group}>
   <h3 className={studioSectionTitle}>Number</h3>
   <div className={styles.numberRow}>
    <button type="button" className={styles.stepper} aria-label="Number down" onClick={()=>setNumber(d.number==null?10:(d.number+99)%100)}>−</button>
    <input className={styles.numberInput} inputMode="numeric" pattern="[0-9]*" maxLength={2} aria-label="Shirt number" value={d.number??''} placeholder="–"
     onFocus={()=>sceneRef.current?.setView('back','back')} onChange={e=>setNumber(cleanNumber(e.target.value))}/>
    <button type="button" className={styles.stepper} aria-label="Number up" onClick={()=>setNumber(d.number==null?10:(d.number+1)%100)}>+</button>
    <button type="button" className={styles.chip} aria-pressed={d.number==null} onClick={()=>setNumber(d.number==null?10:null)}>No number</button>
   </div>
   <div className={styles.quickNums} role="group" aria-label="Classic numbers">{[1,4,7,8,9,10,11].map(n=><button key={n} type="button" aria-pressed={d.number===n} onClick={()=>setNumber(n)}>{n}</button>)}</div>
   {tip(numberTip(d.number))}
  </section>
  <section className={styles.group}>
   <h3 className={studioSectionTitle}>Font</h3>
   <div className={styles.tiles4}>{FONTS.map(f=><button key={f.id} type="button" className={styles.tile} aria-pressed={d.font===f.id} {...pv(()=>({...designRef.current,font:f.id}))} onClick={()=>set({font:f.id})}>
    <span className={styles.fontSample} style={{fontFamily:FONT_FACES[f.id].css,fontWeight:FONT_FACES[f.id].weight as CSSProperties['fontWeight'],transform:`scaleX(${FONT_FACES[f.id].squeeze})`}}>{d.number??10}</span><span>{f.label}</span></button>)}</div>
  </section>
  <section className={styles.group}>
   <h3 className={studioSectionTitle}>Print</h3>
   <div className={styles.toggles}>
    <button type="button" className={styles.chip} aria-pressed={d.outline} onClick={()=>set({outline:!d.outline})}>Outline</button>
    <button type="button" className={styles.chip} aria-pressed={d.frontNumber} onClick={()=>{set({frontNumber:!d.frontNumber});sceneRef.current?.setView('front','crest');}}>Number on front</button>
   </div>
   <Swatches label="Print colour" value={d.textColor} custom={false} preview={hex=>pv(()=>({...designRef.current,textColor:hex}))} onPick={hex=>set({textColor:hex})}
    colors={['#f7f3ea','#f1e2bf','#ffd23f','#ff9f1c','#ff6b5b','#2ec4d6','#2554c7','#1b2a4a','#2e9e5b','#15171a']}/>
  </section>
 </>;
 else body=<>
  <section className={`${styles.group} ${styles.doneTop}`}>
   <div className={styles.lookingGood} aria-live="polite"><span>Looking good!</span>{!reduced&&<i className={styles.confetti} aria-hidden="true">{Array.from({length:14},(_,i)=><b key={i}/>)}</i>}</div>
   <div className={styles.doneShirts}><ShirtThumb design={d} prints size={128} className={styles.bigThumb}/><ShirtThumb design={d} prints back size={128} className={styles.bigThumb}/></div>
   <div className={styles.doneBtns}>
    <button type="button" className={styles.chipMint} data-showoff-open onClick={()=>setShowOff('spinning')}><Ico name="expand" size={19}/>Show it off</button>
    <button type="button" className={styles.chip} onClick={()=>sceneRef.current?.spin()} data-shop-spin><Ico name="spin" size={18}/>Spin it</button>
   </div>
   <div className={styles.receipt}>
    <h3>Your kit</h3>
    <ul>{jerseyPriceParts(d).map(p=><li key={p.label}><span>{p.label}</span><b>{p.coins}</b></li>)}</ul>
    <p className={styles.total}><span>Total</span><b><Coin/>{price}</b></p>
   </div>
  </section>
  <section className={styles.group}>
   <h3 className={studioSectionTitle}>Save slots</h3>
   <div className={styles.slots}>
    {save.slots.map((sl,i)=><div key={i} className={styles.slot} data-active={slot===i}>
     {sl?<ShirtThumb design={sl.design} art size={64}/>:<span className={styles.slotEmpty} aria-hidden="true">{i+1}</span>}
     <span className={styles.slotName}><b>{sl?sl.name:`Slot ${i+1}`}</b><small>{sl?new Date(sl.savedAt).toLocaleDateString(undefined,{day:'numeric',month:'short'}):'Empty'}</small></span>
     <span className={styles.slotBtns}>
      <button type="button" className={styles.chip} onClick={()=>saveToSlot(i)}>{sl?'Save here':'Save'}</button>
      {sl&&<button type="button" className={styles.chipMint} onClick={()=>loadSlot(i)}>Load</button>}
     </span>
    </div>)}
   </div>
   {tip('Real kits are printed with heat: the colours go into the fabric so they never peel off.')}
  </section>
 </>;

 const drawing=step==='draw';
 return <div className={styles.studio} role="dialog" aria-modal="true" aria-labelledby="jersey-studio-title" data-scene={sceneState} data-step={step} data-showoff={showOff!=='off'||undefined} data-flat={(drawing&&flat)||undefined}>
  <header className={styles.header}>
   <BackButton onBack={onClose} label="Back"/>
   <h2 id="jersey-studio-title" className={styles.title}>Jersey Studio</h2>
   <CoinPill balance={wallet.balance} className={styles.headerCoins} data-coins/>
  </header>

  <div className={styles.stageWrap}>
   <div className={styles.stage} ref={stage}>
    <div className={styles.placeholder} aria-hidden={sceneState==='ready'}>
     {sceneState!=='ready'&&<ShirtThumb design={d} prints back={face==='back'} size={240} className={styles.placeholderShirt}/>}
     {sceneState==='loading'&&<span className={styles.loadingDots}><i/><i/><i/></span>}
    </div>
   </div>
   {showOff==='off'&&<StudioIconRow>
    <StudioIconButton label="Undo" disabled={!h.past.length} onClick={()=>dispatch({type:'undo'})}><Ico name="undo"/></StudioIconButton>
    <StudioIconButton label="Redo" disabled={!h.future.length} onClick={()=>dispatch({type:'redo'})}><Ico name="redo"/></StudioIconButton>
    <StudioIconButton label="Randomise" onClick={randomise}><Ico name="dice"/></StudioIconButton>
    <StudioIconButton label="Show it off (full screen)" data-showoff-open onClick={()=>setShowOff('spinning')}><Ico name="expand"/></StudioIconButton>
   </StudioIconRow>}
   {drawing&&showOff==='off'&&<StudioModeToggle label="Draw on the shirt or on a flat template">
    <button type="button" aria-pressed={!flat} onClick={()=>setFlat(false)}><Ico name="shirt3d" size={20}/>On shirt</button>
    <button type="button" aria-pressed={flat} onClick={()=>{setFlat(true);if(draw.lock==='all'&&(stage.current?.clientWidth??999)<600)setDrawCfg({lock:'front'});}}><Ico name="flat" size={20}/>Flat</button>
   </StudioModeToggle>}
   {sceneState==='ready'&&hint&&showOff==='off'&&<p className={styles.dragHint}><Ico name={drawing&&draw.tool!=='hand'?'brush':'hand'} size={18}/>
    {drawing&&draw.tool!=='hand'?(flat?'Draw on the flat shirt':'Draw on the shirt · two fingers to zoom'):'Drag to spin · pinch to zoom'}</p>}
   {!(drawing&&flat)&&showOff==='off'&&<StudioViewChips label="Turn the shirt">
    <button type="button" aria-pressed={drawing?angle==='front':face==='front'} onClick={()=>turnTo('front')}>Front</button>
    {drawing&&<button type="button" aria-pressed={angle==='left'} onClick={()=>turnTo('left')}>Left</button>}
    {drawing&&<button type="button" aria-pressed={angle==='right'} onClick={()=>turnTo('right')}>Right</button>}
    <button type="button" aria-pressed={drawing?angle==='back':face==='back'} onClick={()=>turnTo('back')}>Back</button>
   </StudioViewChips>}
   {showOff!=='off'&&<div className={styles.showOffBar}>
    <button type="button" className={styles.chipMint} onClick={()=>setShowOff('off')}><Ico name="close" size={18}/>Back to studio</button>
    {showOff==='still'&&<button type="button" className={styles.chip} onClick={()=>setShowOff('spinning')} data-shop-spin><Ico name="spin" size={18}/>Spin again</button>}
   </div>}
  </div>

  <div className={`${styles.sheet} ${sheet.sheetClass}`} {...sheet.sheetProps}>
   <StudioSheetHandle sheet={sheet}/>
   <StudioSteps ref={stepsRef} steps={STEPS} activeId={step} isDone={(id,i)=>visited.has(id as Step)&&i<stepIndex} onSelect={id=>goStep(id as Step)}/>
   <p className={styles.stepCount}>Step {stepIndex+1} of {STEPS.length} · <b>{STEPS[stepIndex].label}</b></p>
   <div className={styles.content} ref={contentRef}>
    <div key={step} className={styles.stepBody}>
     {body}
     <div className={styles.stepNav}>
      {prev&&<button type="button" className={styles.prevBtn} onClick={()=>goStep(prev.id)} aria-label={`Back to ${prev.label}`}><span aria-hidden="true">←</span></button>}
      {next&&<button type="button" className={styles.nextBtn} onClick={()=>goStep(next.id)}>Next: {next.label} <span aria-hidden="true">→</span></button>}
     </div>
    </div>
   </div>
   <div className={styles.actions}>
    <button type="button" className={styles.saveBtn} data-save-open onClick={()=>{setReplaceArm(null);setSlotPicker(true);}}><Ico name="save" size={20}/>Save</button>
    <button type="button" className={styles.buyBtn} data-buy-open onClick={()=>setConfirm(true)}>Buy for <Coin/><b>{price}</b></button>
   </div>
  </div>

  {toast&&<div key={toast.id} className={styles.toast} role="status"><Ico name="check" size={18}/>{toast.text}</div>}
  {slotPicker&&<div className={styles.confirmWrap} onClick={e=>{if(e.target===e.currentTarget)setSlotPicker(false);}}>
   <div className={`${styles.confirm} ${styles.slotSheet}`} role="dialog" aria-modal="true" aria-labelledby="jersey-save-title">
    <h3 id="jersey-save-title">Save your design</h3>
    <p>Pick a slot. You can load it again any time.</p>
    <div className={styles.slotCards}>
     {save.slots.map((sl,i)=><button key={i} type="button" className={styles.slotCard} data-slot={i} data-armed={replaceArm===i||undefined} onClick={()=>{if(sl&&replaceArm!==i){setReplaceArm(i);return;}saveToSlot(i);}}>
      {sl?<ShirtThumb design={sl.design} art size={84}/>:<span className={styles.slotCardEmpty} aria-hidden="true">+</span>}
      <b>{sl?sl.name:`Slot ${i+1}`}</b>
      <small>{sl?(replaceArm===i?'Tap again to replace':'Replace'):'Empty: save here'}</small>
     </button>)}
    </div>
    <button type="button" className={styles.chipMint} onClick={()=>setSlotPicker(false)}>Not now</button>
   </div>
  </div>}
  {confirm&&<div className={styles.confirmWrap} onClick={e=>{if(e.target===e.currentTarget)setConfirm(false);}}>
   <div className={styles.confirm} role="alertdialog" aria-modal="true" aria-labelledby="jersey-buy-title">
    <div className={styles.confirmShirts}><ShirtThumb design={d} prints size={128} className={styles.bigThumb}/><ShirtThumb design={d} prints back size={128} className={styles.bigThumb}/></div>
    <h3 id="jersey-buy-title">Buy this jersey?</h3>
    <ul className={styles.confirmList}>{jerseyPriceParts(d).map(p=><li key={p.label}><span>{p.label}</span><b>{p.coins}</b></li>)}</ul>
    <p>Total <b className={styles.costLine}><Coin/>{price} coins</b>.<br/>Your design is saved too.</p>
    <div className={styles.confirmBtns}>
     <button type="button" className={styles.chipMint} onClick={()=>setConfirm(false)}>Not yet</button>
     <button type="button" className={styles.buyBtn} autoFocus data-buy-confirm onClick={buy}>Buy it!</button>
    </div>
   </div>
  </div>}
 </div>;
}
