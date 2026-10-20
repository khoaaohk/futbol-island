'use client';
import {useCallback,useEffect,useMemo,useRef,useState,type CSSProperties,type ReactNode} from 'react';
import {
 COLOUR_ZONES,DECAL_LIMIT,DECAL_ZONES,DEFAULT_BOOTS,FINISHES,FLAGS,MODELS,NAME_MAX,PALETTE,PATTERNS,PRESETS,QUOTES,SLOT_COUNT,STICKER_IDS,STUDS,STUD_FINISHES,UPPERS,
 bootPrice,bootPriceLines,cleanName,flagUrl,loadBootSaves,modelOf,nameAllowed,randomBoots,storeBootSaves,validateBoots,
 type BootDecal,type BootDesign,type BootModel,type BootSaves,type ColourZone,type DecalKind,type DecalZone,type StudFinish,type StudType,
} from '@/lib/shop/boots';
import {BackButton} from '@/components/BackButton';
import CoinPill,{CoinIcon} from './CoinPill';
import {useArcadeWallet} from '@/lib/arcade/arcadeWallet';
import {STICKERS,stickerDataUrl} from '@/lib/shop/bootStickers';
import {BOOT_GLYPHS} from '@/lib/shop/bootGlyphs';
import type {BootScene,BootView,DecalPatch} from '@/lib/shop/bootScene';
import {StudioIconButton,StudioIconRow,StudioSheetHandle,StudioSteps,StudioViewChips,studioSectionTitle,useStudioSheet} from './StudioControls';
import type {StageInsets} from '@/lib/shop/studioSheet';
import {countDesignSave} from '@/lib/analytics/shopEvents';
import {countBootStyle} from '@/lib/analytics/sponsorEvents';
import styles from './BootStudio.module.css';

/**
 * Boot studio (Oct 12 2026): design your own football boots. Full-screen overlay with its own small three.js scene
 * (lib/shop/bootScene.ts, loaded on open, disposed on close). The shop lazy-loads this with next/dynamic.
 * Steps: Shape → Style → Colours → Pattern → Studs → Stickers & flags → Name → Done. Save and "Buy for N coins" are always visible.
 * Shape (Oct 12 2026): thirteen boot models inspired by famous eras and styles (no brands), each a real 3D silhouette; "Start from a
 * look" pairs a model with a colourway. The thumbnails are the models' real side silhouettes (lib/shop/bootGlyphs.ts).
 * Heat: the scene draws only when something changes (no loop at rest), see bootScene.ts.
 */
type Props={onClose():void;onBuy?(design:BootDesign):void};
const STEPS=['Shape','Style','Colours','Pattern','Studs','Stickers & flags','Name','Done'] as const;
/** Step indices (the Shape step comes first). */
const ST={shape:0,style:1,colours:2,pattern:3,studs:4,decals:5,name:6,done:7} as const;
/** The shared step pills (components/shop/StudioControls.tsx <StudioSteps>): one entry per STEPS label, id = its index. */
const STEP_DEFS=STEPS.map((label,i)=>({id:String(i),label}));
const ZONE_VIEW:Record<ColourZone,BootView>={toe:'front',mid:'side',heel:'heel',collar:'top',laces:'tongue',soleplate:'sole',studs:'sole',tips:'sole',accent:'side'};
const DECAL_VIEW:Record<DecalZone,BootView>={outside:'side',inside:'inside',toe:'front',heel:'heel',tongue:'tongue'};
const VIEW_CHIPS:{id:BootView;label:string}[]=[{id:'hero',label:'Hero'},{id:'side',label:'Outside'},{id:'inside',label:'Inside'},{id:'top',label:'Top'},{id:'heel',label:'Heel'},{id:'sole',label:'Sole'}];
const QUICK_NUMBERS=[7,9,10,11,23];
const SPOTS:[number,number][]=[[0,0],[-.6,.35],[.6,-.3],[-.6,-.4],[.6,.4],[0,.6],[0,-.6],[-.3,0]];
const lum=(hex:string)=>{const n=parseInt(hex.slice(1),16);return ((n>>16&255)*.2126+(n>>8&255)*.7152+(n&255)*.0722)/255;};
const newId=()=>'d'+Math.random().toString(36).slice(2,9);
const HISTORY=40;

/** A side-view boot glyph in a design's colours and its model's real silhouette (presets, models, saves, the Done card). */
type GlyphDesign=Pick<BootDesign,'colors'|'collar'|'studs'>&Partial<Pick<BootDesign,'model'|'laces'>>;
function BootGlyph({d,size=96}:{d:GlyphDesign;size?:number}){
 const c=d.colors,id=useMemo(()=>'g'+Math.random().toString(36).slice(2,7),[]),g=BOOT_GLYPHS[d.model??'speed']??BOOT_GLYPHS.speed,laces=d.laces??'visible',ink='#203a33';
 const studs=d.studs==='indoor'||d.studs==='futsal'?[]:d.studs==='turf'||d.studs==='ag'?[20,27,34,41,48,55,62,69,76,83,90,97]:d.studs==='sg'||d.studs==='sgmix'?[22,74,96]:[18,29,72,85,99];
 const collar=d.collar==='sock'?g.sock:d.collar==='mid'?g.mid:undefined,tongue=d.collar==='low'&&laces!=='laceless'?g.tongue:undefined;
 return <svg width={size} height={size*62/120} viewBox="0 0 120 62" aria-hidden="true" className={styles.glyph}>
  <defs><clipPath id={id}><path d={g.body}/></clipPath></defs>
  {collar&&<path d={collar} fill={c.collar} stroke={ink} strokeWidth="1.4" strokeLinejoin="round"/>}
  <g clipPath={`url(#${id})`}><rect x="0" y="0" width="120" height="62" fill={c.mid}/><path d={g.toe} fill={c.toe}/><path d={g.heel} fill={c.heel}/></g>
  <path d={g.body} fill="none" stroke={ink} strokeWidth="1.6" strokeLinejoin="round"/>
  {g.fins&&<path d={g.fins} fill="none" stroke={c.accent} strokeWidth="2.2" strokeLinecap="round"/>}
  {laces==='visible'&&g.laces&&<path d={g.laces} stroke={c.laces} strokeWidth="2.6" strokeLinecap="round"/>}
  {tongue&&<path d={tongue} fill={c.mid} stroke={ink} strokeWidth="1.3" strokeLinejoin="round"/>}
  {laces==='covered'&&g.cover&&<path d={g.cover} fill={c.laces} stroke={ink} strokeWidth="1.3" strokeLinejoin="round"/>}
  <path d={g.sole} fill={c.soleplate} stroke={ink} strokeWidth="1.3" strokeLinejoin="round"/>
  {studs.map(x=><rect key={x} x={x} y={g.ground+.5} width={d.studs==='turf'||d.studs==='ag'?3:5} height={d.studs==='turf'?3:d.studs==='ag'?4.5:6} rx="1.4" fill={c.studs} stroke={ink} strokeWidth="1.1"/>)}
 </svg>;
}
function Coin(){return <CoinIcon/>;}
function Sym({name}:{name:'undo'|'redo'|'dice'|'pair'|'save'|'trash'|'minus'|'plus'|'rotl'|'rotr'|'check'|'eye'}){
 const d={undo:'M9 7 4 12l5 5M4 12h11a5 5 0 0 1 0 10h-3',redo:'m15 7 5 5-5 5m5-5H9a5 5 0 0 0 0 10h3',
  dice:'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01',
  pair:'M3 15c0-5 2-9 5-9l2 3c3 1 5 2 6 4 1 1 1 3-1 3H3zM9 20h12c2 0 2-3 1-4-1-2-3-3-6-4',save:'M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6',
  trash:'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',minus:'M5 12h14',plus:'M12 5v14M5 12h14',rotl:'M4 12a8 8 0 1 0 3-6M4 4v4h4',rotr:'M20 12a8 8 0 1 1-3-6M20 4v4h-4',check:'m5 12 4 4L19 6',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'}[name];
 return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d}/></svg>;
}
/** Sole diagram for the stud tiles (heel on the left, toe on the right). */
const FG_DOTS=[[20,14],[20,30],[30,10],[30,34],[64,9],[64,35],[78,9],[78,34],[92,13],[92,30],[100,22],[78,22]];
const HEEL_DOTS=FG_DOTS.slice(0,4),FORE=FG_DOTS.slice(4,10);
const blade=(x:number,y:number,a:number,i:number,w=10,h=3.6)=><rect key={i} x={x-w/2} y={y-h/2} width={w} height={h} rx={h/2} transform={`rotate(${a} ${x} ${y})`}/>;
const chev=(x:number,y:number,flip:boolean,i:number)=><path key={i} d={flip?`M${x-4} ${y}l6-5M${x-4} ${y}l6 5`:`M${x+4} ${y}l-6-5M${x+4} ${y}l-6 5`} stroke="#203a33" strokeWidth="3" strokeLinecap="round" fill="none"/>;
const FORE_ANG=[-8,8,-10,10,-30,30];
function StudGlyph({type}:{type:StudType}){
 const ink='#203a33';
 const dots:Record<StudType,ReactNode>={
  fg:<g fill={ink}>{FG_DOTS.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3.4"/>)}</g>,
  blade:<g fill={ink}>{[[20,14,40],[20,30,-40],[32,10,0],[32,34,0],[64,9,-8],[64,35,8],[78,9,-10],[78,35,10],[92,12,-30],[92,31,30],[101,18,-70],[101,27,70]].map(([x,y,a],i)=>blade(x,y,a,i))}</g>,
  hybrid:<g fill={ink}>{HEEL_DOTS.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3.4"/>)}{FORE.map(([x,y],i)=>blade(x,y,FORE_ANG[i],10+i))}<circle cx="78" cy="22" r="3"/><circle cx="66" cy="22" r="2.6"/></g>,
  chevron:<g>{HEEL_DOTS.map(([x,y],i)=>chev(x,y,true,i))}{FORE.map(([x,y],i)=>chev(x,y,false,10+i))}{chev(80,22,false,20)}</g>,
  sg:<g>{[[22,14],[22,30],[66,9],[66,35],[92,12],[92,31]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="4.6" fill={ink}/><circle cx={x} cy={y} r="2.2" fill="#d9dde2"/></g>)}</g>,
  sgmix:<g>{[[20,14],[20,30],[66,9],[66,35],[92,12],[92,31]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="4.6" fill={ink}/><circle cx={x} cy={y} r="2.2" fill="#d9dde2"/></g>)}{[[34,12],[34,32],[80,11],[80,33],[79,22],[101,20]].map(([x,y],i)=><circle key={'m'+i} cx={x} cy={y} r="2.8" fill={ink}/>)}</g>,
  ag:<g fill="none" stroke={ink} strokeWidth="1.6">{Array.from({length:40},(_,i)=>{const col=i%10,row=Math.floor(i/10),x=16+col*9.4,y=10+row*8+(col%2?4:0);return (x>42&&x<60&&y>12&&y<32)||y>36?null:<circle key={i} cx={x} cy={y} r="2.3"/>;})}</g>,
  turf:<g fill={ink}>{Array.from({length:60},(_,i)=>{const x=14+(i%15)*6.4,y=10+Math.floor(i/15)*7.5+((i%15)%2?3:0);return x>44&&x<58&&y>14&&y<30?null:<circle key={i} cx={x} cy={y} r="1.6"/>;})}</g>,
  indoor:<g stroke={ink} strokeWidth="1.4" fill="none">{Array.from({length:14},(_,i)=><path key={i} d={`M${14+i*7} 8l4 6-4 6 4 6-4 6 4 6`}/>)}</g>,
  futsal:<g stroke={ink} fill="none">{[[80,22,9],[80,22,5],[22,22,7],[22,22,3.5],[100,19,4]].map(([x,y,r],i)=><circle key={i} cx={x} cy={y} r={r} strokeWidth="1.6"/>)}<g fill={ink} stroke="none">{Array.from({length:24},(_,i)=><circle key={i} cx={40+(i%8)*4.5} cy={12+Math.floor(i/8)*9} r="1"/>)}</g></g>,
  split:<g fill={ink}><path d="M42 8h20v28H42z" fill="#3a3d44"/>{HEEL_DOTS.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3.4"/>)}{FORE.map(([x,y],i)=>blade(x,y,FORE_ANG[i],10+i,10,2.6))}{blade(80,20,80,20,8,2.6)}</g>,
  carbon:<g><path d="M34 12h44v20H34z" fill="#2b2d33"/><path d="M36 12l8 20M44 12l8 20M52 12l8 20M60 12l8 20M68 12l8 20" stroke="#5a5f6a" strokeWidth="2"/>
   <g fill={ink}>{HEEL_DOTS.map(([x,y],i)=><path key={i} d={`M${x-5} ${y}l7-4.5v9z`}/>)}</g>{FORE.map(([x,y],i)=>chev(x,y,false,10+i))}</g>,
 };
 return <svg viewBox="0 0 116 44" width="116" height="44" aria-hidden="true"><path d="M10 22c0-9 5-14 14-14 22 0 44-3 70-2 10 1 18 7 18 16s-8 15-18 16c-26 1-48-2-70-2-9 0-14-5-14-14z" fill="#f5efe0" stroke="#203a33" strokeWidth="1.8"/>{dots[type]}</svg>;
}
/** A stud swatch for the finish tiles. */
function StudFinishGlyph({f,c,tip}:{f:StudFinish;c:string;tip:string}){
 const id=useMemo(()=>'sf'+Math.random().toString(36).slice(2,7),[]);
 return <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><defs><linearGradient id={id} x1="0" x2="1">
  {f==='chrome'?<><stop offset="0" stopColor="#fff"/><stop offset=".35" stopColor={c}/><stop offset=".6" stopColor="#fff"/><stop offset="1" stopColor={c}/></>:<><stop offset="0" stopColor={c}/><stop offset="1" stopColor={c}/></>}</linearGradient></defs>
  <path d="M8 6h24l-4 26h-16z" fill={`url(#${id})`} fillOpacity={f==='translucent'?.55:1} stroke="#203a33" strokeWidth="1.8"/>
  {f==='tipped'&&<path d="M10.8 24h18.4l-1.2 8h-16z" fill={tip} stroke="#203a33" strokeWidth="1.4"/>}
  {(f==='glossy'||f==='translucent'||f==='chrome')&&<path d="M13 9l-1 15" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".8"/>}
 </svg>;
}
const STUD_GROUPS:{id:typeof STUDS[number]['group'];label:string}[]=[{id:'grass',label:'Dry grass'},{id:'wet',label:'Wet grass'},{id:'artificial',label:'Artificial pitches'},{id:'indoor',label:'Indoor floors'},{id:'elite',label:'Elite plates'}];

export default function BootStudio({onClose,onBuy}:Props){
 const wallet=useArcadeWallet();
 const [saves,setSaves]=useState<BootSaves|null>(null);
 const [design,setDesignState]=useState<BootDesign>(DEFAULT_BOOTS);
 const hist=useRef<{past:BootDesign[];future:BootDesign[]}>({past:[],future:[]});
 const [,bumpHist]=useState(0);
 const [step,setStep]=useState(0);
 const [zoneC,setZoneC]=useState<ColourZone>('mid');
 const [tab,setTab]=useState<DecalKind>('sticker');
 const [zoneD,setZoneD]=useState<DecalZone>('outside');
 const [selected,setSelected]=useState<string|null>(null);
 const [pair,setPair]=useState(false);
 const [view,setViewState]=useState<BootView|null>('hero');
 const [ready,setReady]=useState(false),[failed,setFailed]=useState(false);
 const [toast,setToast]=useState<{text:string;n:number}|null>(null);
 const [saveOpen,setSaveOpen]=useState(false);
 const [nameDraft,setNameDraft]=useState(''),[nameError,setNameError]=useState('');
 const canvasRef=useRef<HTMLCanvasElement|null>(null),sceneRef=useRef<BootScene|null>(null);
 const stageRef=useRef<HTMLDivElement>(null),insetsRef=useRef<StageInsets|null>(null);
 // The resizable phone sheet (shared with Ball and Jersey): the boot re-fits to the stage's visible box as it moves.
 const pairRef=useRef(false);
 /** Phones: the CSS plinth follows the fitted boot (its centre and its scale, the same span/height bounds bootScene uses). */
 const placePlinth=useCallback(()=>{const el=stageRef.current,i=insetsRef.current;if(!el)return;
  if(!i){el.removeAttribute('data-fit');return;}
  const w=el.clientWidth||1,h=el.clientHeight||1,vis=Math.max(1,h-i.top-i.bottom),span=(pairRef.current?3.7:3.15)*.94;
  const ppw=Math.min(w/1.06/span,vis/1.1/1.9);
  el.dataset.fit='';el.style.setProperty('--fit-cy',`${Math.round(i.top+vis/2)}px`);el.style.setProperty('--fit-ppw',`${ppw.toFixed(1)}px`);},[]);
 const sheet=useStudioSheet({stageRef,onInsets:i=>{insetsRef.current=i;sceneRef.current?.setInsets(i);placePlinth();}});
 const designRef=useRef(design);
 const stepRef=useRef(step);stepRef.current=step;
 const selRef=useRef(selected);selRef.current=selected;

 // Load the saves after mount (localStorage is client-only).
 useEffect(()=>{const s=loadBootSaves();setSaves(s);designRef.current=s.current;setDesignState(s.current);setNameDraft(s.current.name);},[]);
 // Auto-save the design in progress (debounced).
 useEffect(()=>{if(!saves)return;const t=setTimeout(()=>{const next={...saves,current:design};storeBootSaves(next);},350);return()=>clearTimeout(t);},[design,saves]);

 const say=useCallback((text:string)=>setToast({text,n:Date.now()}),[]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(null),2200);return()=>clearTimeout(t);},[toast]);

 /** Apply a change with undo history. History is written here, never inside a state updater (StrictMode runs those twice). */
 const commit=useCallback((next:BootDesign|((d:BootDesign)=>BootDesign))=>{
  const prev=designRef.current,n=validateBoots(typeof next==='function'?next(prev):next);if(JSON.stringify(n)===JSON.stringify(prev))return;
  const h=hist.current;h.past.push(prev);if(h.past.length>HISTORY)h.past.shift();h.future=[];designRef.current=n;setDesignState(n);bumpHist(x=>x+1);
 },[]);
 const undo=useCallback(()=>{const h=hist.current;const p=h.past.pop();if(!p)return;h.future.push(designRef.current);designRef.current=p;setDesignState(p);setNameDraft(p.name);bumpHist(x=>x+1);},[]);
 const redo=useCallback(()=>{const h=hist.current;const f=h.future.pop();if(!f)return;h.past.push(designRef.current);designRef.current=f;setDesignState(f);setNameDraft(f.name);bumpHist(x=>x+1);},[]);

 const commitRef=useRef(commit);commitRef.current=commit;
 const setView=useCallback((v:BootView)=>{setViewState(v);sceneRef.current?.setView(v);},[]);

 // The scene: loaded on open, disposed on close.
 useEffect(()=>{
  let alive=true,scene:BootScene|null=null;
  const coarse=window.matchMedia('(pointer:coarse)').matches||Math.min(window.innerWidth,window.innerHeight)<700;
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  import('@/lib/shop/bootScene').then(({createBootScene})=>{
   if(!alive||!canvasRef.current)return;
   try{scene=createBootScene(canvasRef.current,{coarse,reducedMotion,
    onTap:hit=>{
     if(!hit)return;
     if(stepRef.current===ST.decals){
      if(hit.decal&&!hit.decal.startsWith('__')){setSelected(hit.decal);return;}
      setZoneD(hit.zone);
      const id=selRef.current;
      if(id)commitRef.current(d=>({...d,decals:d.decals.map(x=>x.id===id?{...x,zone:hit.zone,x:hit.x,y:hit.y}:x)}));
      else say('Now pick a sticker for this spot');
     }else if(stepRef.current===ST.colours){setZoneC(hit.paint);}
    },
    onDecalMove:(id,patch:DecalPatch,done)=>{if(done)commitRef.current(d=>({...d,decals:d.decals.map(x=>x.id===id?{...x,...patch}:x)}));},
    onManualTurn:()=>{setViewState(null);},
   });}catch(err){console.warn('boot studio: no WebGL',err);setFailed(true);return;}
   sceneRef.current=scene;scene.setInsets(insetsRef.current);scene.setDesign(designRef.current);setReady(true);
   const w=window as unknown as {__bootStudio?:unknown};if(location.pathname.startsWith('/shop-lab'))w.__bootStudio=scene;
  }).catch(err=>{console.warn('boot studio failed to load',err);setFailed(true);});
  return()=>{alive=false;sceneRef.current=null;scene?.dispose();const w=window as unknown as {__bootStudio?:unknown};if(w.__bootStudio===scene)delete w.__bootStudio;};
 },[say]);
 useEffect(()=>{sceneRef.current?.setDesign(design);},[design,ready]);
 useEffect(()=>{sceneRef.current?.setEditing(step===ST.decals);sceneRef.current?.setSelected(step===ST.decals?selected:null);},[step,selected,ready]);
 useEffect(()=>{sceneRef.current?.setPair(pair);pairRef.current=pair;placePlinth();},[pair,ready,placePlinth]);
 // Each step turns the boot to what it edits.
 useEffect(()=>{if(!ready)return;const v:BootView=step===ST.studs?'sole':step===ST.name?'heel':step===ST.decals?DECAL_VIEW[zoneD]:step===ST.colours?ZONE_VIEW[zoneC]:'hero';setView(v);
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[step,ready]);
 // keyboard: undo / redo / escape
 useEffect(()=>{const k=(e:KeyboardEvent)=>{const t=e.target as HTMLElement|null;if(t&&/INPUT|TEXTAREA/.test(t.tagName))return;
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();}
  else if(e.key==='Escape'){if(saveOpen)setSaveOpen(false);else if(selRef.current)setSelected(null);else onClose();}};
  window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);},[undo,redo,saveOpen,onClose]);

 const price=bootPrice(design),lines=bootPriceLines(design);
 const sel=design.decals.find(d=>d.id===selected)??null;
 const setColour=(z:ColourZone,hex:string)=>commit(d=>({...d,colors:{...d.colors,[z]:hex}}));
 const pickZoneC=(z:ColourZone)=>{setZoneC(z);setView(ZONE_VIEW[z]);};
 const pickZoneD=(z:DecalZone)=>{setZoneD(z);setView(DECAL_VIEW[z]);if(sel)commit(d=>({...d,decals:d.decals.map(x=>x.id===sel.id?{...x,zone:z,x:0,y:0}:x)}));};
 const addDecal=(kind:DecalKind,ref:string)=>{
  if(design.decals.length>=DECAL_LIMIT){say(`${DECAL_LIMIT} is the most. Remove one first.`);return;}
  const used=design.decals.filter(d=>d.zone===zoneD).map(d=>[d.x,d.y]);
  // the free spot farthest from the stickers already in this zone
  const spot=SPOTS.map(p=>({p,d:Math.min(9,...used.map(([ux,uy])=>Math.hypot(ux-p[0],uy-p[1])))})).sort((a,b)=>b.d-a.d||0)[0].p;
  const id=newId(),base=zoneD==='heel'?design.colors.heel:zoneD==='toe'?design.colors.toe:design.colors.mid;
  const decal:BootDecal={id,kind,ref,zone:zoneD,x:spot[0],y:spot[1],size:kind==='quote'?1.1:1,rot:0,...(kind==='quote'?{tint:lum(base)>.55?'#18191d':'#f6f3ea'}:{})};
  commit(d=>({...d,decals:[...d.decals,decal]}));setSelected(id);setView(DECAL_VIEW[zoneD]);
 };
 const patchSel=(p:Partial<BootDecal>)=>{if(sel)commit(d=>({...d,decals:d.decals.map(x=>x.id===sel.id?{...x,...p}:x)}));};
 const removeSel=()=>{if(!sel)return;commit(d=>({...d,decals:d.decals.filter(x=>x.id!==sel.id)}));setSelected(null);};
 // a random look keeps the shape you picked (the dice is for colours and parts; the Shape step is for the model)
 const randomise=()=>{commit(d=>({...randomBoots(Math.random,{decals:d.decals,name:d.name,number:d.number,heelText:d.heelText,flag:d.flag,flagSpot:d.flagSpot}),model:d.model}));say('Fresh look!');};
 const applyPreset=(id:string)=>{const p=PRESETS.find(x=>x.id===id);if(p){commit(d=>({...d,...p.design}));setView('side');}};
 const pickModel=(m:BootModel)=>{commit(d=>({...d,model:m}));setView('side');};
 const model=modelOf(design.model),free=!model.collar;
 const typeName=(raw:string)=>{const n=cleanName(raw);setNameDraft(n);if(!nameAllowed(n)){setNameError('Let’s pick a different name.');return;}setNameError('');commit(d=>({...d,name:n.trim(),heelText:n.trim()?'name':d.heelText}));};
 const saveSlot=(i:number)=>{if(!saves)return;const slots=[...saves.slots];const prev=slots[i];slots[i]={name:prev?.name??(design.name?`${design.name}’s boots`.slice(0,NAME_MAX):`Boots ${i+1}`),design,at:Date.now()};
  const next={...saves,slots,current:design};setSaves(next);storeBootSaves(next);say('Saved!');countDesignSave('boots');countBootStyle(design.model,design.pattern);};
 const renameSlot=(i:number,raw:string)=>{if(!saves)return;const s=saves.slots[i];if(!s)return;const n=cleanName(raw);if(!nameAllowed(n))return;const slots=[...saves.slots];slots[i]={...s,name:n||`Boots ${i+1}`};const next={...saves,slots};setSaves(next);storeBootSaves(next);};
 const loadSlot=(i:number)=>{const s=saves?.slots[i];if(!s)return;commit(s.design);setNameDraft(s.design.name);setSaveOpen(false);say('Loaded');};
 const buy=()=>{const d=validateBoots(design);onBuy?.(d);};

 const stepBody=():ReactNode=>{switch(step){
  case ST.shape:return <>
   <div className={styles.modelCard} aria-live="polite"><BootGlyph d={design} size={112}/><div><h3>{model.label} <small>{model.era}</small></h3><p>{model.blurb}</p></div></div>
   <Section title="Start from a look" hint="A famous boot shape in a fresh colourway">
    <div className={styles.presets}>{PRESETS.map(p=><button key={p.id} type="button" className={styles.preset} aria-label={`${p.label}, ${p.sub}`} onClick={()=>applyPreset(p.id)}><BootGlyph d={p.design} size={96}/><span>{p.label}</span><small>{p.sub}</small></button>)}</div>
   </Section>
   <Section title="Just the shape" hint="Keeps your colours">
    <div className={styles.modelRow}>{MODELS.map(m=><button key={m.id} type="button" className={styles.modelTile} aria-pressed={design.model===m.id} onClick={()=>pickModel(m.id)}>
     <BootGlyph d={{...design,model:m.id,collar:m.collar??design.collar,laces:m.laces??design.laces}} size={88}/><strong>{m.label}</strong><small>{m.era}</small></button>)}</div>
   </Section></>;
  case ST.style:return <>
   <Section title="Upper" hint="What the boot is made of">
    <div className={styles.tiles3}>{UPPERS.map(u=><Tile key={u.id} on={design.upper===u.id} onClick={()=>commit(d=>({...d,upper:u.id}))} label={u.label} note={u.note}><span className={`${styles.fabric} ${styles['fab_'+u.id]}`}/></Tile>)}</div>
   </Section>
   {free?<><Section title="Collar">
    <div className={styles.tiles3}>
     <Tile on={design.collar==='low'} onClick={()=>commit(d=>({...d,collar:'low'}))} label="Low cut" note="Free ankles"><span className={styles.collarIcon} data-kind="low"/></Tile>
     <Tile on={design.collar==='mid'} onClick={()=>commit(d=>({...d,collar:'mid'}))} label="Mid collar" note="A little knit cuff"><span className={styles.collarIcon} data-kind="mid"/></Tile>
     <Tile on={design.collar==='sock'} onClick={()=>commit(d=>({...d,collar:'sock'}))} label="Sock collar" note="Hugs the ankle"><span className={styles.collarIcon} data-kind="sock"/></Tile>
    </div>
   </Section>
   <Section title="Laces">
    <div className={styles.tiles3}>
     <Tile on={design.laces==='visible'} onClick={()=>commit(d=>({...d,laces:'visible'}))} label="Laces" note="Tie them tight"><span className={styles.laceIcon} data-kind="visible"/></Tile>
     <Tile on={design.laces==='covered'} onClick={()=>commit(d=>({...d,laces:'covered'}))} label="Lace cover" note="Laces under a lid"><span className={styles.laceIcon} data-kind="covered"/></Tile>
     <Tile on={design.laces==='laceless'} onClick={()=>commit(d=>({...d,laces:'laceless'}))} label="Laceless" note="A smooth strike zone"><span className={styles.laceIcon} data-kind="laceless"/></Tile>
    </div>
   </Section></>
   :<p className={styles.learn}><b>{model.label}:</b> the collar and laces are part of this shape ({model.collar==='sock'?'a sock collar':model.collar==='mid'?'a knit mid collar':'a low cut'}, {model.laces==='covered'?'laces under a cover':model.laces==='laceless'?'no laces':'laces'}). Pick “Modern Speed” in Shape to choose your own.</p>}
  </>;
  case ST.colours:return <>
   <Section title="Pick a part" hint="Or tap the boot">
    <div className={styles.zoneRow}>{COLOUR_ZONES.map(z=><button key={z.id} type="button" className={styles.zoneChip} aria-pressed={zoneC===z.id} onClick={()=>pickZoneC(z.id)}>
     <span className={styles.zoneDot} style={{'--c':design.colors[z.id]} as CSSProperties}/>{z.label}</button>)}</div>
    <p className={styles.zoneHint}>{COLOUR_ZONES.find(z=>z.id===zoneC)?.hint}</p>
   </Section>
   <Section title="Colour">
    <div className={styles.palette}>{PALETTE.map(p=><button key={p.hex} type="button" className={styles.swatch} aria-label={p.name} aria-pressed={design.colors[zoneC]===p.hex} style={{'--c':p.hex} as CSSProperties} onClick={()=>setColour(zoneC,p.hex)}>
     {design.colors[zoneC]===p.hex&&<span className={styles.swatchCheck} style={{color:lum(p.hex)>.6?'#203a33':'#fff'}}><Sym name="check"/></span>}</button>)}
     <label className={`${styles.swatch} ${styles.custom}`} aria-label="Any colour"><input type="color" value={design.colors[zoneC]} onChange={e=>setColour(zoneC,e.target.value)}/><span>+</span></label>
    </div>
   </Section>
   <Section title="Finish">
    <div className={styles.tiles4}>{FINISHES.map(f=><Tile key={f.id} on={design.finish===f.id} onClick={()=>commit(d=>({...d,finish:f.id}))} label={f.label}><span className={`${styles.finish} ${styles['fin_'+f.id]}`} style={{'--c':design.colors.mid} as CSSProperties}/></Tile>)}</div>
   </Section></>;
  case ST.pattern:return <>
   <Section title="Pattern" hint="Painted over the middle and toe">
    <div className={styles.tiles3}>{PATTERNS.map(p=><Tile key={p.id} on={design.pattern===p.id} onClick={()=>commit(d=>({...d,pattern:p.id}))} label={p.label}>
     <span className={`${styles.pattern} ${styles['pat_'+p.id]}`} style={{'--c':design.colors.mid,'--a':design.colors.accent} as CSSProperties}/></Tile>)}</div>
   </Section>
   <Section title="Pattern colour">
    <div className={styles.palette}>{PALETTE.map(p=><button key={p.hex} type="button" className={styles.swatch} aria-label={p.name} aria-pressed={design.colors.accent===p.hex} style={{'--c':p.hex} as CSSProperties} onClick={()=>setColour('accent',p.hex)}>
     {design.colors.accent===p.hex&&<span className={styles.swatchCheck} style={{color:lum(p.hex)>.6?'#203a33':'#fff'}}><Sym name="check"/></span>}</button>)}</div>
   </Section></>;
  case ST.studs:{const flat=design.studs==='indoor'||design.studs==='futsal';return <>
   <Section title="Studs" hint="Different pitches need different grip">
    {STUD_GROUPS.map(g=><div key={g.id} className={styles.studGroup}><h4 className={styles.studGroupTitle}>{g.label}</h4>
     <div className={styles.studList}>{STUDS.filter(s=>s.group===g.id).map(s=><button key={s.id} type="button" className={styles.studTile} aria-pressed={design.studs===s.id} onClick={()=>{commit(d=>({...d,studs:s.id}));setView('sole');}}>
      <StudGlyph type={s.id}/><span className={styles.studText}><strong>{s.label} <small>{s.short}</small></strong><span>{s.pitch}</span></span></button>)}</div></div>)}
   </Section>
   {!flat&&<Section title="Stud finish" hint="How the studs look">
    <div className={styles.tiles5}>{STUD_FINISHES.map(f=><Tile key={f.id} on={design.studFinish===f.id} onClick={()=>{commit(d=>({...d,studFinish:f.id}));setView('sole');}} label={f.label}><StudFinishGlyph f={f.id} c={design.colors.studs} tip={design.colors.tips}/></Tile>)}</div>
   </Section>}
   <Section title={flat?'Sole colour':'Stud colour'}>
    <div className={styles.palette}>{PALETTE.map(p=>{const z:ColourZone=flat?'soleplate':'studs';return <button key={p.hex} type="button" className={styles.swatch} aria-label={p.name} aria-pressed={design.colors[z]===p.hex} style={{'--c':p.hex} as CSSProperties} onClick={()=>setColour(z,p.hex)}>
     {design.colors[z]===p.hex&&<span className={styles.swatchCheck} style={{color:lum(p.hex)>.6?'#203a33':'#fff'}}><Sym name="check"/></span>}</button>;})}</div>
   </Section>
   {!flat&&design.studFinish==='tipped'&&<Section title="Tip colour">
    <div className={styles.palette}>{PALETTE.map(p=><button key={p.hex} type="button" className={styles.swatch} aria-label={'Tips '+p.name} aria-pressed={design.colors.tips===p.hex} style={{'--c':p.hex} as CSSProperties} onClick={()=>setColour('tips',p.hex)}>
     {design.colors.tips===p.hex&&<span className={styles.swatchCheck} style={{color:lum(p.hex)>.6?'#203a33':'#fff'}}><Sym name="check"/></span>}</button>)}</div>
   </Section>}
  </>;}
  case ST.decals:return <>
   <Section title="Where?" hint="Tap a spot, or tap the boot">
    <div className={styles.zoneRow}>{DECAL_ZONES.map(z=><button key={z.id} type="button" className={styles.zoneChip} aria-pressed={zoneD===z.id} onClick={()=>pickZoneD(z.id)}>{z.label}<small>{design.decals.filter(d=>d.zone===z.id).length||''}</small></button>)}</div>
   </Section>
   {sel&&<div className={styles.selCard} key={sel.id}>
    <span className={styles.selThumb}>{thumb(sel.kind,sel.ref)}</span>
    <div className={styles.selTools}>
     <button type="button" aria-label="Smaller" onClick={()=>patchSel({size:Math.max(.5,+(sel.size-.15).toFixed(2))})}><Sym name="minus"/></button>
     <button type="button" aria-label="Bigger" onClick={()=>patchSel({size:Math.min(1.6,+(sel.size+.15).toFixed(2))})}><Sym name="plus"/></button>
     <button type="button" aria-label="Turn left" onClick={()=>patchSel({rot:Math.max(-60,sel.rot-15)})}><Sym name="rotl"/></button>
     <button type="button" aria-label="Turn right" onClick={()=>patchSel({rot:Math.min(60,sel.rot+15)})}><Sym name="rotr"/></button>
     <button type="button" aria-label="Remove sticker" className={styles.remove} onClick={removeSel}><Sym name="trash"/></button>
     <button type="button" className={styles.doneSel} onClick={()=>setSelected(null)}>Done</button>
    </div>
    {sel.kind==='quote'&&<div className={styles.tintRow}>{['#f6f3ea','#18191d','#e8b33a','#d7262e','#2253d6','#2fa65a','#ff7cc8'].map(h=><button key={h} type="button" aria-label={'Text colour '+h} aria-pressed={sel.tint===h} className={styles.tint} style={{'--c':h} as CSSProperties} onClick={()=>patchSel({tint:h})}/>)}</div>}
    <p className={styles.selHint}>Drag it on the boot · pinch to size and twist</p>
   </div>}
   <div className={styles.tabs} role="tablist">{(['sticker','flag','quote'] as const).map(t=><button key={t} type="button" role="tab" aria-selected={tab===t} className={styles.tab} onClick={()=>setTab(t)}>{t==='sticker'?'Stickers':t==='flag'?'Flags':'Words'}</button>)}
    <span className={styles.count} aria-label={`${design.decals.length} of ${DECAL_LIMIT} placed`}>{design.decals.length}/{DECAL_LIMIT}</span></div>
   {tab==='sticker'&&<div className={styles.stickerGrid}>{STICKER_IDS.map(id=><button key={id} type="button" className={styles.sticker} aria-label={'Add '+STICKERS[id].label} onClick={()=>addDecal('sticker',id)}>
    {/* eslint-disable-next-line @next/next/no-img-element */}<img src={stickerDataUrl(id)} alt="" width={56} height={56}/></button>)}</div>}
   {tab==='flag'&&<div className={styles.flagGrid}>{FLAGS.map(f=><button key={f.code} type="button" className={styles.flagBtn} aria-label={'Add the flag of '+f.name} onClick={()=>addDecal('flag',f.code)}>
    {/* eslint-disable-next-line @next/next/no-img-element */}<img src={flagUrl(f.code)} alt="" width={48} height={36} loading="lazy"/><span>{f.name}</span></button>)}</div>}
   {tab==='quote'&&<div className={styles.quoteGrid}>{QUOTES.map(q=><button key={q.id} type="button" className={styles.quote} onClick={()=>addDecal('quote',q.id)}>{q.text}</button>)}</div>}
  </>;
  case ST.name:return <>
   <Section title="Your name" hint="Stitched on the heel">
    <div className={styles.nameRow}><input className={styles.nameInput} value={nameDraft} maxLength={NAME_MAX} placeholder="Type your name" autoComplete="off" spellCheck={false}
     aria-invalid={!!nameError} aria-describedby="boot-name-note" onChange={e=>typeName(e.target.value)}/><span className={styles.nameCount}>{nameDraft.length}/{NAME_MAX}</span></div>
    <p id="boot-name-note" className={nameError?styles.nameError:styles.nameNote}>{nameError||'Letters, spaces and dashes only.'}</p>
   </Section>
   <Section title="Shirt number">
    <div className={styles.numberRow}>
     <button type="button" className={styles.numBtn} aria-label="Number down" onClick={()=>commit(d=>({...d,number:Math.max(0,(d.number??1)-1),heelText:'number'}))}><Sym name="minus"/></button>
     <output className={styles.numOut} aria-live="polite">{design.number??'–'}</output>
     <button type="button" className={styles.numBtn} aria-label="Number up" onClick={()=>commit(d=>({...d,number:Math.min(99,(d.number??-1)+1),heelText:'number'}))}><Sym name="plus"/></button>
     <div className={styles.quickNums}>{QUICK_NUMBERS.map(n=><button key={n} type="button" aria-pressed={design.number===n} onClick={()=>commit(d=>({...d,number:n,heelText:'number'}))}>{n}</button>)}</div>
    </div>
   </Section>
   <Section title="On the heel">
    <div className={styles.seg}>
     <button type="button" aria-pressed={design.heelText==='name'} disabled={!design.name} onClick={()=>commit(d=>({...d,heelText:'name'}))}>Name</button>
     <button type="button" aria-pressed={design.heelText==='number'} onClick={()=>commit(d=>({...d,heelText:'number',number:d.number??10}))}>Number</button>
    </div>
   </Section>
   <Section title="Flag badge" hint="Your country or your family’s">
    <div className={styles.seg}>
     <button type="button" aria-pressed={design.flagSpot==='tongue'} onClick={()=>{commit(d=>({...d,flagSpot:'tongue'}));setView('tongue');}}>Tongue</button>
     <button type="button" aria-pressed={design.flagSpot==='heel'} onClick={()=>{commit(d=>({...d,flagSpot:'heel'}));setView('heel');}}>Heel</button>
     <button type="button" aria-pressed={!design.flag} onClick={()=>commit(d=>({...d,flag:null}))}>None</button>
    </div>
    <div className={`${styles.flagGrid} ${styles.flagGridSmall}`}>{FLAGS.map(f=><button key={f.code} type="button" className={styles.flagBtn} aria-pressed={design.flag===f.code} aria-label={f.name} onClick={()=>{commit(d=>({...d,flag:f.code}));setView(design.flagSpot==='heel'?'heel':'tongue');}}>
     {/* eslint-disable-next-line @next/next/no-img-element */}<img src={flagUrl(f.code)} alt="" width={48} height={36} loading="lazy"/><span>{f.name}</span></button>)}</div>
   </Section></>;
  default:return <div className={styles.doneCard}>
   <div className={styles.doneHead}><BootGlyph d={design} size={150}/><div><h3>{design.name?`${design.name}’s boots`:'Your boots'}</h3>
    <p>{model.label} · {STUDS.find(s=>s.id===design.studs)!.label} · {UPPERS.find(u=>u.id===design.upper)!.label} · {FINISHES.find(f=>f.id===design.finish)!.label}</p></div></div>
   <ul className={styles.receipt}>{lines.map(l=><li key={l.label}><span>{l.label}</span><b>{l.coins}</b></li>)}<li className={styles.total}><span>Total</span><b><Coin/>{price}</b></li></ul>
   <p className={styles.learn}><b>Coach’s tip:</b> {STUDS.find(s=>s.id===design.studs)!.pitch}</p>
   <p className={styles.learn}><b>About this shape ({model.era}):</b> {model.blurb}</p>
   <div className={styles.doneActions}><button type="button" className={styles.mint} onClick={()=>{setView('hero');sceneRef.current?.setPair(true);setPair(true);}}><Sym name="pair"/>See the pair</button>
    <button type="button" className={styles.mint} onClick={()=>setSaveOpen(true)}><Sym name="save"/>Save to a slot</button></div>
  </div>;
 }};
 function thumb(kind:DecalKind,ref:string){
  // eslint-disable-next-line @next/next/no-img-element
  if(kind==='sticker')return <img src={stickerDataUrl(ref as typeof STICKER_IDS[number])} alt="" width={44} height={44}/>;
  // eslint-disable-next-line @next/next/no-img-element
  if(kind==='flag')return <img src={flagUrl(ref)} alt="" width={44} height={33}/>;
  return <span className={styles.quoteThumb}>{QUOTES.find(q=>q.id===ref)?.text}</span>;
 }

 const canUndo=hist.current.past.length>0,canRedo=hist.current.future.length>0;
 return <div className={styles.studio} role="dialog" aria-modal="true" aria-labelledby="boot-studio-title" data-step={step}>
  <header className={styles.header}>
   <BackButton onBack={onClose} label="Back" className={styles.headerBack}/>
   <h2 id="boot-studio-title" className={styles.title}>Boot Studio</h2>
   <CoinPill balance={wallet.balance} className={styles.headerCoins} data-coins/>
  </header>

  <div ref={stageRef} className={styles.stage}>
   <div className={styles.sweep} aria-hidden="true"><span className={styles.plinth}/></div>
   <canvas ref={canvasRef} className={styles.canvas} aria-label="Your boot. Drag to spin, pinch to zoom, double-tap to reset." role="img"/>
   {!ready&&!failed&&<div className={styles.loading}><BootGlyph d={design} size={140}/><span>Lacing up…</span></div>}
   {failed&&<div className={styles.loading}><BootGlyph d={design} size={140}/><span>3D is off on this device, but you can still design.</span></div>}
   <StudioIconRow>
    <StudioIconButton label="Undo" disabled={!canUndo} onClick={undo}><Sym name="undo"/></StudioIconButton>
    <StudioIconButton label="Redo" disabled={!canRedo} onClick={redo}><Sym name="redo"/></StudioIconButton>
    <StudioIconButton label="Randomise" onClick={randomise}><Sym name="dice"/></StudioIconButton>
    <StudioIconButton label={pair?'Show one boot':'Show the pair'} pressed={pair} onClick={()=>setPair(p=>!p)}><Sym name="pair"/></StudioIconButton>
   </StudioIconRow>
   <StudioViewChips label="Turn the boot">{VIEW_CHIPS.map(v=><button key={v.id} type="button" aria-pressed={view===v.id} onClick={()=>setView(v.id)}>{v.label}</button>)}</StudioViewChips>
   {toast&&<p key={toast.n} className={styles.toast} role="status">{toast.text}</p>}
  </div>

  <section className={`${styles.sheet} ${sheet.sheetClass}`} {...sheet.sheetProps}>
   <StudioSheetHandle sheet={sheet}/>
   <StudioSteps steps={STEP_DEFS} activeId={String(step)} isDone={(_,i)=>i<step} onSelect={id=>setStep(Number(id))}/>
   <div className={styles.panel} key={step}>
    {stepBody()}
    <div className={styles.stepNav}>
     {step>0&&<button type="button" className={styles.back} onClick={()=>setStep(step-1)}>Back</button>}
     {step<STEPS.length-1&&<button type="button" className={styles.next} onClick={()=>setStep(step+1)}>Next: {STEPS[step+1]}</button>}
    </div>
   </div>
   <footer className={styles.actions}>
    <button type="button" className={styles.save} onClick={()=>setSaveOpen(o=>!o)} aria-expanded={saveOpen}><Sym name="save"/><span>Save</span></button>
    <button type="button" className={styles.buy} onClick={buy}><span>Buy for</span><Coin/><b key={price} className={styles.price}>{price}</b></button>
   </footer>
  </section>

  {saveOpen&&saves&&<div className={styles.saveLayer} onClick={e=>{if(e.target===e.currentTarget)setSaveOpen(false);}}>
   <div className={styles.saveCard} role="dialog" aria-label="Save slots">
    <h3>Your boot locker</h3><p>Keep up to {SLOT_COUNT} designs. Your newest changes are always kept too.</p>
    {saves.slots.map((s,i)=><div key={i} className={styles.slot}>
     {s?<BootGlyph d={s.design} size={84}/>:<span className={styles.emptySlot}>Empty</span>}
     <div className={styles.slotBody}>{s?<input className={styles.slotName} defaultValue={s.name} maxLength={NAME_MAX} aria-label={`Name of slot ${i+1}`} onBlur={e=>renameSlot(i,e.target.value)}/>:<strong>Slot {i+1}</strong>}
      <div className={styles.slotBtns}><button type="button" className={styles.slotSave} onClick={()=>saveSlot(i)}>{s?'Save over':'Save here'}</button>{s&&<button type="button" className={styles.slotLoad} onClick={()=>loadSlot(i)}>Load</button>}</div></div>
    </div>)}
    <button type="button" className={styles.closeSave} onClick={()=>setSaveOpen(false)}>Close</button>
   </div>
  </div>}
 </div>;
}

function Section({title,hint,children}:{title:string;hint?:string;children:ReactNode}){
 return <section className={styles.section}><h3 className={`${styles.h3} ${studioSectionTitle}`}>{title}{hint&&<small>{hint}</small>}</h3>{children}</section>;
}
function Tile({on,onClick,label,note,children}:{on:boolean;onClick():void;label:string;note?:string;children?:ReactNode}){
 return <button type="button" className={styles.tile} aria-pressed={on} onClick={onClick}>{children}<strong>{label}</strong>{note&&<small>{note}</small>}{on&&<span className={styles.tick} aria-hidden="true"><Sym name="check"/></span>}</button>;
}
