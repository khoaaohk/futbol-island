'use client';
/**
 * Football shop · Ball studio (Oct 12 2026; v2 the same day: "Draw your own design" plus a kid-UX pass). A walk-in customiser:
 * spin a realistic football, start from an idea (or Surprise me), pick its panels, colours, pattern and finish, PAINT ON THE
 * BALL ITSELF (brush, soft marker, eraser, fill-a-panel, line, stamps, mirror / ×5 symmetry), stick on stickers, flags, words
 * and a name/number, choose a size, save it (3 slots with thumbnails) and buy it (a clear confirm card).
 *
 * Lazy-loaded by the shop (next/dynamic); three.js and the stage load only when this opens (lib/shop/ballStage.ts) and are
 * disposed on close; the paint engine (lib/shop/ballPaint.ts) and the panel-id mirror (lib/shop/ballPanels.ts) load only when
 * there is a drawing or the Draw step opens. Data and rules: lib/shop/ball.ts. Heat: render on demand only (0 rAF at rest);
 * while painting the texture uploads only the dirty rectangle, at most ~30 times a second, and only while the finger moves.
 * Safety: drawings have no typed text (the tools can't type), the name filter still guards the name decal, and drawings live
 * only in the player's own save (BALL_KEY's art pool), never shared.
 * Learning: each layout, finish and size carries a short football fact (AGENTS.md: everything teaches the game).
 */
import {useCallback,useEffect,useMemo,useReducer,useRef,useState} from 'react';
import s from './BallStudio.module.css';
import {BackButton} from '@/components/BackButton';
import CoinPill,{CoinIcon} from './CoinPill';
import {useArcadeWallet} from '@/lib/arcade/arcadeWallet';
import {
 DEFAULT_BALL,FINISHES,FLAGS,FUTSAL_NOTE,LAYOUTS,MAX_DECALS,NAME_MAX,PALETTE,PATTERNS,PRESETS,QUOTES,SIZES,STICKER_IDS,
 artHash,artUrl,ballPrice,cleanNumber,filterSlotName,SLOT_NAME_MAX,cloneBall,filterNameInput,hasArt,isNameAllowed,layoutInfo,loadBallStore,markBallBought,priceLines,randomBall,saveBallCurrent,saveBallSlot,validateBall,
 type BallDecal,type BallDesign,type BallLayout,type BallStore,type DecalKind,type PatternTarget,type Vec3,
} from '@/lib/shop/ball';
import type {BallStage} from '@/lib/shop/ballStage';
import type {Painter,PaintTool,StampKind,Symmetry} from '@/lib/shop/ballPaint';
import type {BallSound} from '@/lib/shop/ballSound';
import {StudioIconButton,StudioIconRow,StudioSheetHandle,StudioSteps,studioSectionTitle,useStudioSheet} from './StudioControls';
import type {StageInsets} from '@/lib/shop/studioSheet';
import {countDesignSave} from '@/lib/analytics/shopEvents';
import {EDGE_IN,edgeTurnRate} from '@/lib/shop/ballPick';

type Props={onClose():void;onBuy?(design:BallDesign):void};
const STEPS=[{id:'panels',label:'Start'},{id:'colours',label:'Colours'},{id:'pattern',label:'Pattern'},{id:'finish',label:'Finish'},{id:'draw',label:'Draw'},{id:'stickers',label:'Stickers'},{id:'done',label:'Done'}] as const;
type StepId=typeof STEPS[number]['id'];
const DEFAULT_SIZE:Record<DecalKind,number>={sticker:.2,flag:.17,quote:.15,name:.16,number:.26};
type Mods={paint:typeof import('@/lib/shop/ballPaint');panels:typeof import('@/lib/shop/ballPanels')};
/** One Draw-step undo step: a stroke (pixels), a fill change, or both (Clear). */
type DrawStep={px:boolean;fills?:{before:string[];after:string[]}};
/** The Draw intro card shows once per device (a per-device UI hint: unversioned, so it is never part of a save code). */
const DRAW_INTRO_KEY='fi2-ball-draw-intro';

// ---- history (undo/redo) ----
type Hist={past:BallDesign[];present:BallDesign;future:BallDesign[]};
type Act={t:'set';d:BallDesign}|{t:'replace';d:BallDesign}|{t:'checkpoint'}|{t:'undo'}|{t:'redo'}|{t:'load';d:BallDesign};
const LIMIT=40;
function hist(h:Hist,a:Act):Hist{switch(a.t){
 case 'set':return {past:[...h.past,h.present].slice(-LIMIT),present:a.d,future:[]};
 case 'replace':return {...h,present:a.d};
 case 'checkpoint':return {past:[...h.past,h.present].slice(-LIMIT),present:h.present,future:[]};
 case 'undo':return h.past.length?{past:h.past.slice(0,-1),present:h.past[h.past.length-1],future:[h.present,...h.future]}:h;
 case 'redo':return h.future.length?{past:[...h.past,h.present],present:h.future[0],future:h.future.slice(1)}:h;
 case 'load':return {past:[],present:a.d,future:[]};}}

// ---- small inline icons ----
const sv=(d:React.ReactNode,vb='0 0 24 24')=><svg viewBox={vb} aria-hidden>{d}</svg>;
const st2={fill:'none',stroke:'currentColor',strokeWidth:2.6,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
const I={
 close:sv(<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>),
 undo:sv(<path d="M9 7L4 12l5 5M4.5 12H15a5 5 0 010 10h-2" {...st2} strokeWidth={2.8}/>),
 redo:sv(<path d="M15 7l5 5-5 5M19.5 12H9a5 5 0 000 10h2" {...st2} strokeWidth={2.8}/>),
 dice:sv(<><rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" strokeWidth="2.6"/><circle cx="8.5" cy="8.5" r="1.7" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.7" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.7" fill="currentColor"/></>),
 ball:sv(<><circle cx="12" cy="12" r="10" fill="#fff" stroke="#1d1f24" strokeWidth="1.6"/><path d="M12 7.2l3.3 2.4-1.3 3.9h-4l-1.3-3.9z" fill="#1d1f24"/><path d="M12 2v5.2M15.3 9.6l4.9-1.8M14 13.5l3 4.1M10 13.5l-3 4.1M8.7 9.6L3.8 7.8" stroke="#1d1f24" strokeWidth="1.3"/></>),
 reset:sv(<path d="M4 12a8 8 0 108-8 8 8 0 00-6.3 3M4 4v4h4" {...st2}/>),
 save:sv(<><path d="M5 4h11l3 3v13H5z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round"/><path d="M8 4v5h7V4M8 20v-6h8v6" fill="none" stroke="currentColor" strokeWidth="2.2"/></>),
 prev:sv(<path d="M15 5l-7 7 7 7" {...st2} strokeWidth={3}/>),
 next:sv(<path d="M9 5l7 7-7 7" {...st2} strokeWidth={3}/>),
 minus:sv(<path d="M6 12h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>),
 plus:sv(<path d="M6 12h12M12 6v12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>),
 turn:sv(<path d="M19 12a7 7 0 11-2.1-5M19 4v4h-4" {...st2}/>),
 bin:sv(<path d="M5 7h14M9 7V4.5h6V7M7 7l1 13h8l1-13" {...st2} strokeWidth={2.4}/>),
 check:sv(<path d="M5 12.5l4.2 4.2L19 7" {...st2} strokeWidth={3.2}/>),
 hand:sv(<path d="M9 11V5.5a1.5 1.5 0 013 0V10m0-1.5a1.5 1.5 0 013 0V11m0-1a1.5 1.5 0 013 0v4.5a6.5 6.5 0 01-6.5 6.5h-.6a6 6 0 01-4.6-2.2L4.6 15a1.5 1.5 0 012.3-1.9L9 15" {...st2} strokeWidth={2}/>),
 bulb:sv(<path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0012 3z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>),
 shuffle:sv(<path d="M3 7h3.5c4.5 0 6.5 10 11 10H21M3 17h3.5c1.8 0 3.1-1.6 4.3-3.6M21 7h-3.5c-1.8 0-3.1 1.6-4.3 3.6M18 4l3 3-3 3M18 14l3 3-3 3" {...st2} strokeWidth={2.2}/>),
 expand:sv(<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" {...st2}/>),
 spin:sv(<><path d="M20 12a8 8 0 01-14.9 4M4 12a8 8 0 0114.9-4" {...st2}/><path d="M19 3.5V8h-4.5M5 20.5V16h4.5" {...st2}/></>),
 tl:sv(<path d="M15 5l-7 7 7 7" {...st2} strokeWidth={3.2}/>),tr:sv(<path d="M9 5l7 7-7 7" {...st2} strokeWidth={3.2}/>),
 tu:sv(<path d="M5 15l7-7 7 7" {...st2} strokeWidth={3.2}/>),td:sv(<path d="M5 9l7 7 7-7" {...st2} strokeWidth={3.2}/>),
 brush:sv(<><path d="M14.5 4.5l5 5-7.8 7.8-5-5z" {...st2} strokeWidth={2.2}/><path d="M6.7 12.3c-2.7.3-3.6 2.6-3.7 7.7 4.6-.2 7.2-1.2 7.7-4" {...st2} strokeWidth={2.2}/></>),
 marker:sv(<><path d="M15 3.5l5.5 5.5L10 19.5H4.5V14z" {...st2} strokeWidth={2.2}/><path d="M12.5 6l5.5 5.5" {...st2} strokeWidth={2.2}/><path d="M3 21.5h9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".45"/></>),
 eraser:sv(<><path d="M9 20l-5-5L14.5 4.5l6 6L11 20z" {...st2} strokeWidth={2.2}/><path d="M9 9.5l6 6M9 20h11" {...st2} strokeWidth={2.2}/></>),
 fill:sv(<><path d="M5 11l7-7 7.5 7.5-7 7z" {...st2} strokeWidth={2.2}/><path d="M5 11h14.5" {...st2} strokeWidth={2.2}/><path d="M20.5 16s-1.8 2.2-1.8 3.4a1.8 1.8 0 003.6 0c0-1.2-1.8-3.4-1.8-3.4z" fill="currentColor"/></>),
 line:sv(<><path d="M5 19L19 5" {...st2} strokeWidth={3}/><circle cx="5" cy="19" r="2.4" fill="currentColor"/><circle cx="19" cy="5" r="2.4" fill="currentColor"/></>),
 stamp:sv(<><path d="M9 3h6l-1 7h-4z" {...st2} strokeWidth={2.2}/><path d="M4 14a2 2 0 012-2h12a2 2 0 012 2v3H4zM6 20.5h12" {...st2} strokeWidth={2.2}/></>),
 symOff:sv(<circle cx="12" cy="12" r="4.5" fill="currentColor"/>),
 symMirror:sv(<><path d="M12 3v18" stroke="currentColor" strokeWidth="2" strokeDasharray="2.5 2.5"/><path d="M9.5 8L4 12l5.5 4zM14.5 8L20 12l-5.5 4z" fill="currentColor"/></>),
 symRadial:sv(<>{[0,1,2,3,4].map(k=>{const a=-Math.PI/2+k*Math.PI*2/5;return <circle key={k} cx={12+Math.cos(a)*7} cy={12+Math.sin(a)*7} r="2.6" fill="currentColor"/>;})}<circle cx="12" cy="12" r="1.6" fill="currentColor"/></>),
};
const STEP_ICON:Record<StepId,React.ReactNode>={
 panels:sv(<path d="M12 3l2.6 5.6 6 .6-4.5 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L3.4 9.2l6-.6z" fill="currentColor"/>),
 colours:sv(<><path d="M12 3a9 9 0 100 18c1.5 0 2-1 2-2s-1-1.6-1-2.6 1-1.4 2-1.4h2a4 4 0 004-4c0-4.4-4-8-9-8z" fill="none" stroke="currentColor" strokeWidth="2.2"/><circle cx="7.5" cy="11" r="1.6" fill="currentColor"/><circle cx="10" cy="7" r="1.6" fill="currentColor"/><circle cx="15" cy="7.5" r="1.6" fill="currentColor"/></>),
 pattern:sv(<path d="M3 9c3-3 6 3 9 0s6 3 9 0M3 15c3-3 6 3 9 0s6 3 9 0" {...st2} strokeWidth={2.4}/>),
 finish:sv(<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" fill="currentColor"/>),
 draw:I.brush,
 stickers:sv(<><path d="M5 4h10l4 4v12H5z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/><path d="M15 4v4h4" fill="none" stroke="currentColor" strokeWidth="2.2"/><circle cx="12" cy="13.5" r="3" fill="currentColor"/></>),
 done:I.check,
};
/** The shared step pills (components/shop/StudioControls.tsx <StudioSteps>) — built once from STEPS/STEP_ICON. */
const STEP_DEFS=STEPS.map(x=>({id:x.id,label:x.label,icon:STEP_ICON[x.id]}));
const TOOLS:{id:PaintTool;label:string;icon:React.ReactNode}[]=[{id:'brush',label:'Brush',icon:I.brush},{id:'marker',label:'Marker',icon:I.marker},{id:'eraser',label:'Eraser',icon:I.eraser},
 {id:'fill',label:'Fill',icon:I.fill},{id:'line',label:'Line',icon:I.line},{id:'stamp',label:'Stamps',icon:I.stamp}];
const STAMP_ICON:Record<StampKind,React.ReactNode>={
 star:sv(<path d="M12 2.5l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.7 6.2 20l1.4-6.4-4.9-4.4 6.5-.7z" fill="currentColor"/>),
 heart:sv(<path d="M12 21C7 17 2.5 13.6 2.5 8.6 2.5 5.6 4.8 3.5 7.4 3.5c1.9 0 3.5 1 4.6 2.6 1.1-1.6 2.7-2.6 4.6-2.6 2.6 0 4.9 2.1 4.9 5.1 0 5-4.5 8.4-9.5 12.4z" fill="currentColor"/>),
 circle:sv(<circle cx="12" cy="12" r="8.5" fill="currentColor"/>),
 bolt:sv(<path d="M14 2L5 13.5h6L9.5 22 19 9.5h-6.2L14 2z" fill="currentColor"/>),
};
const SYMS:{id:Symmetry;label:string;icon:React.ReactNode}[]=[{id:'off',label:'Off',icon:I.symOff},{id:'mirror',label:'Mirror',icon:I.symMirror},{id:'radial5',label:'×5',icon:I.symRadial}];

/** Little panel-layout icons (generic geometry, drawn here). */
function LayoutIcon({id,a,b,c}:{id:BallLayout;a:string;b:string;c:string}){
 const ring=<circle cx="32" cy="32" r="29" fill="none" stroke="#24382f" strokeWidth="2.5"/>;
 const shade=<><circle cx="32" cy="32" r="29" fill="url(#lg-shade)"/><ellipse cx="23" cy="20" rx="9" ry="5" fill="#fff" opacity=".55" transform="rotate(-30 23 20)"/></>;
 const defs=<defs><radialGradient id="lg-shade" cx=".38" cy=".32" r=".75"><stop offset=".55" stopColor="#000" stopOpacity="0"/><stop offset="1" stopColor="#000" stopOpacity=".38"/></radialGradient><clipPath id={`lc-${id}`}><circle cx="32" cy="32" r="29"/></clipPath></defs>;
 const pent=(cx:number,cy:number,r:number,rot:number)=>Array.from({length:5},(_,i)=>{const t=rot+i*Math.PI*2/5;return `${(cx+Math.cos(t)*r).toFixed(1)},${(cy+Math.sin(t)*r).toFixed(1)}`;}).join(' ');
 let art:React.ReactNode=null;
 if(id==='classic32')art=<g stroke="#24382f" strokeWidth="1.2"><rect width="64" height="64" fill={b}/><polygon points={pent(32,32,10,-Math.PI/2)} fill={a}/>{[0,1,2,3,4].map(i=>{const t=-Math.PI/2+Math.PI/5+i*Math.PI*2/5;return <polygon key={i} points={pent(32+Math.cos(t)*27,32+Math.sin(t)*27,10,t+Math.PI)} fill={a}/>;})}{[0,1,2,3,4].map(i=>{const t=-Math.PI/2+i*Math.PI*2/5;return <line key={i} x1={32+Math.cos(t)*10} y1={32+Math.sin(t)*10} x2={32+Math.cos(t)*21} y2={32+Math.sin(t)*21}/>;})}</g>;
 if(id==='panel26')art=<g stroke="#24382f" strokeWidth="1.2"><rect width="64" height="64" fill={b}/><rect x="22" y="22" width="20" height="20" fill={a}/><path d="M22 22L12 12M42 22L52 12M42 42L52 52M22 42L12 52" /><polygon points="22,22 12,12 22,8" fill={c}/><polygon points="42,22 52,12 56,22" fill={c}/><polygon points="42,42 52,52 42,56" fill={c}/><polygon points="22,42 12,52 8,42" fill={c}/><path d="M22 8H42M56 22V42M42 56H22M8 42V22" fill="none"/></g>;
 if(id==='panel14')art=<g stroke="#24382f" strokeWidth="1.2"><rect width="64" height="64" fill={b}/><rect x="23" y="23" width="18" height="18" fill={a}/><path d="M23 23L14 14M41 23L50 14M41 41L50 50M23 41L14 50" fill="none"/><rect x="25" y="-6" width="14" height="14" fill={a}/><rect x="25" y="56" width="14" height="14" fill={a}/><rect x="-6" y="25" width="14" height="14" fill={a}/><rect x="56" y="25" width="14" height="14" fill={a}/></g>;
 if(id==='propeller6')art=<g stroke="#24382f" strokeWidth="1.4"><rect width="64" height="64" fill={b}/><path d="M32 32C24 22 28 10 20 2L-2 4V30C8 30 18 26 32 32Z" fill={a}/><path d="M32 32C42 42 38 54 46 62L66 60V36C56 34 46 38 32 32Z" fill={a}/><path d="M32 32C42 24 52 28 62 18L60 -2H36C34 8 38 20 32 32Z" fill={c}/><path d="M32 32C22 40 12 36 2 46L4 66H28C30 56 26 44 32 32Z" fill={c}/></g>;
 if(id==='panel8')art=<g stroke="#24382f" strokeWidth="1.4"><rect width="64" height="64" fill={b}/><path d="M32 -2C26 10 38 22 32 32S26 54 32 66H-2V-2Z" fill={a}/><path d="M32 32C42 26 54 38 66 32V66H32C26 54 38 42 32 32Z" fill={a}/><path d="M-2 32C10 26 22 38 32 32" fill="none"/></g>;
 if(id==='leather18')art=<g stroke="#4a2c12" strokeWidth="1.3"><rect width="64" height="64" fill={a}/><rect x="24" y="-2" width="16" height="68" fill={b}/><path d="M24 -2V66M40 -2V66" strokeDasharray="2 2.2" stroke="#3a2210"/><path d="M28 16L36 20M36 16L28 20M28 24L36 28M36 24L28 28M28 32L36 36M36 32L28 36M28 40L36 44M36 40L28 44" stroke={c} strokeWidth="2.2" strokeLinecap="round"/></g>;
 return <svg viewBox="0 0 64 64" aria-hidden>{defs}<g clipPath={`url(#lc-${id})`}>{art}</g>{shade}{ring}</svg>;
}
/** A CSS mini ball in the design's colours (presets, slots without a picture). */
function MiniBall({d}:{d:BallDesign}){
 const {a,b,c}=d.colors,bg=d.layout==='leather18'?`repeating-linear-gradient(90deg,${a} 0 30%,${b} 30% 62%,${a} 62% 100%)`:d.layout==='propeller6'?`conic-gradient(from 20deg,${a} 0 33%,${b} 0 66%,${c} 0)`:d.layout==='panel8'?`conic-gradient(${a} 0 25%,${b} 0 50%,${a} 0 75%,${b} 0)`:d.layout==='classic32'?`radial-gradient(circle at 50% 50%,${a} 0 22%,transparent 23%),radial-gradient(circle at 10% 18%,${a} 0 14%,transparent 15%),radial-gradient(circle at 92% 22%,${a} 0 14%,transparent 15%),radial-gradient(circle at 22% 95%,${a} 0 14%,transparent 15%),radial-gradient(circle at 85% 92%,${a} 0 14%,transparent 15%),${b}`:`linear-gradient(135deg,${a} 0 35%,${b} 35% 70%,${c} 70%)`;
 const P=d.pattern,pat=P.kind==='none'?'':P.kind==='stripes'?`linear-gradient(180deg,transparent 0 38%,${P.c1} 38% 62%,transparent 62%)`:P.kind==='stars'||P.kind==='confetti'?`radial-gradient(circle at 30% 35%,${P.c1} 0 8%,transparent 9%),radial-gradient(circle at 70% 62%,${P.c2} 0 7%,transparent 8%),radial-gradient(circle at 55% 22%,${P.c1} 0 5%,transparent 6%)`:`linear-gradient(180deg,${P.c1}cc 0 18%,transparent 18% 82%,${P.c2}cc 82%)`;
 return <span className={s.miniBall} style={{background:pat?`${pat}, ${bg}`:bg}} aria-hidden/>;
}
const FINISH_CSS:Record<string,React.CSSProperties>={
 gloss:{background:'radial-gradient(circle at 34% 28%,#fff 0 9%,#ffe7e7 13%,#e8423f 38%,#9d1d1b 100%)'},
 matte:{background:'radial-gradient(circle at 40% 35%,#ff7a74 0%,#e8423f 45%,#b0302d 100%)'},
 dimple:{background:'radial-gradient(circle,#0000 38%,#0000002e 42%,#0000 52%) 0 0/7px 7px,radial-gradient(circle at 34% 28%,#fff 0 6%,#3aa7ff 34%,#1a5fa8 100%)'},
 leather:{background:'repeating-radial-gradient(circle at 30% 40%,#0000 0 2px,#00000014 2px 3px),radial-gradient(circle at 36% 30%,#d8a066 0%,#8b5a2b 55%,#4e2e12 100%)'},
 holo:{background:'radial-gradient(circle at 34% 28%,#fff 0 7%,#fff0 20%),conic-gradient(from 30deg,#ff8ad8,#ffe27a,#8af7c4,#7ac8ff,#c69bff,#ff8ad8)'},
 metal:{background:'radial-gradient(circle at 34% 28%,#fff 0 6%,#fff0 22%),linear-gradient(160deg,#f6f6f6,#9aa3ad 40%,#e9edf1 55%,#6b737c 100%)'},
};
const isLight=(hex:string)=>{const n=parseInt(hex.slice(1),16);return (.2126*(n>>16&255)+.7152*(n>>8&255)+.0722*(n&255))/255>.7;};
const uid=()=>Math.random().toString(36).slice(2,9);
const rgbOf=(h:string):[number,number,number]=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const buzz=()=>{try{navigator.vibrate?.(8);}catch{}};

export default function BallStudio({onClose,onBuy}:Props){
 const [h,dispatch]=useReducer(hist,undefined,()=>({past:[],present:cloneBall(DEFAULT_BALL),future:[]}));
 const design=h.present;
 const [step,setStep]=useState<StepId>('panels');
 const [visited,setVisited]=useState<Set<StepId>>(()=>new Set(['panels']));
 const [group,setGroup]=useState<'a'|'b'|'c'>('a');
 const [patSlot,setPatSlot]=useState<'c1'|'c2'>('c1');
 const [tray,setTray]=useState<'sticker'|'flag'|'quote'|'name'>('sticker');
 const [sel,setSel]=useState(-1);
 const [ready,setReady]=useState(false);
 const [failed,setFailed]=useState(false);
 const [saving,setSaving]=useState(false);
 const [sheet,setSheet]=useState<{thumb:string}|null>(null);
 const [confirm,setConfirm]=useState<{thumb:string}|null>(null);
 const [showoff,setShowoff]=useState(false);
 const [store,setStore]=useState<BallStore|null>(null);
 const [toast,setToast]=useState<{id:number;text:string}|null>(null);
 const [nameDraft,setNameDraft]=useState('');
 const [nameWarn,setNameWarn]=useState('');
 const [numDraft,setNumDraft]=useState(10);
 const [textColor,setTextColor]=useState('#ffffff');
 const [hint,setHint]=useState<string|null>(null);
 const [bump,setBump]=useState(0);
 const [preview,setPreview]=useState<BallDesign|null>(null);
 const [bursts,setBursts]=useState<{id:number;s:number;y:number}[]>([]);
 // Draw step
 const [tool,setTool]=useState<PaintTool>('brush');
 const [bsize,setBsize]=useState(1);
 const [stamp,setStamp]=useState<StampKind>('star');
 const [sym,setSym]=useState<Symmetry>('off');
 const [ink,setInk]=useState('#e8423f');
 const [intro,setIntro]=useState(false);// the one-time Draw intro card
 const [,setDrawRev]=useState(0);
 const wallet=useArcadeWallet();
 const canvasRef=useRef<HTMLCanvasElement>(null),stageRef=useRef<BallStage|null>(null),designRef=useRef(design);designRef.current=design;
 const stageElRef=useRef<HTMLDivElement>(null),insetsRef=useRef<StageInsets|null>(null);
 const rootRef=useRef<HTMLDivElement>(null),cursorRef=useRef<HTMLDivElement>(null),soundRef=useRef<BallSound|null>(null);
 const storeRef=useRef<BallStore|null>(null);storeRef.current=store;
 const reduced=useRef(false),coarseRef=useRef(false),stepRef=useRef(step);stepRef.current=step;
 const viewRef=useRef<()=>void>(()=>{});
 const modsRef=useRef<Mods|null>(null),modsP=useRef<Promise<Mods>|null>(null),painterRef=useRef<Painter|null>(null);
 const artMem=useRef<Record<string,string>>({});
 const sess=useRef({artId:'',fillsKey:'',checkpointed:false,loading:0});
 const dUndo=useRef<DrawStep[]>([]),dRedo=useRef<DrawStep[]>([]);
 const encTimer=useRef(0),encPending=useRef(false);
 const say=useCallback((text:string)=>setToast({id:Date.now(),text}),[]);

 // ---- the paint engine: loaded only when there's a drawing or the Draw step opens ----
 const ensureMods=useCallback(()=>{if(modsRef.current)return Promise.resolve(modsRef.current);
  if(!modsP.current)modsP.current=Promise.all([import('@/lib/shop/ballPaint'),import('@/lib/shop/ballPanels')]).then(([paint,panels])=>(modsRef.current={paint,panels}));return modsP.current;},[]);
 const attach=useCallback(()=>{const p=painterRef.current,st=stageRef.current;if(p&&st)st.attachPaint(p.buf,p.W,p.H);},[]);
 const ensurePainter=useCallback(()=>ensureMods().then(m=>{if(!painterRef.current){painterRef.current=m.paint.createPainter();attach();}return painterRef.current;}),[ensureMods,attach]);
 /** Push the painter's dirty rectangle to the stage (throttled there) and show/hide the layer. */
 const flushDirty=useCallback(()=>{const p=painterRef.current,st=stageRef.current;if(!p||!st)return;st.paintDirty(p.takeDirty());st.setDrawVisible(!p.empty||p.drawing);},[]);
 const fillsKey=(f:string[])=>f.join(',');
 const resetDrawHist=useCallback(()=>{dUndo.current=[];dRedo.current=[];painterRef.current?.resetHistory();setDrawRev(r=>r+1);},[]);

 // Load the auto-saved design once.
 useEffect(()=>{const st=loadBallStore();setStore(st);storeRef.current=st;dispatch({t:'load',d:st.current});
  const nm=st.current.decals.find(x=>x.kind==='name');if(nm){setNameDraft(nm.ref);setTextColor(nm.color);}const nu=st.current.decals.find(x=>x.kind==='number');if(nu)setNumDraft(Number(nu.ref));},[]);
 // Auto-save (debounced) whenever the design changes; drawings not yet in the pool travel in artMem.
 useEffect(()=>{setSaving(true);const t=window.setTimeout(()=>{saveBallCurrent(design,undefined,artMem.current);setSaving(false);},450);return ()=>clearTimeout(t);},[design]);
 // Price bump micro-animation.
 const price=useMemo(()=>ballPrice(design),[design]);const lastPrice=useRef(price);
 useEffect(()=>{if(lastPrice.current!==price){lastPrice.current=price;setBump(b=>b+1);}},[price]);

 // The stage: three.js loads only now; everything is disposed on close.
 useEffect(()=>{let dead=false;const canvas=canvasRef.current;if(!canvas)return;
  reduced.current=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse=window.matchMedia('(pointer: coarse)').matches||Math.min(window.innerWidth,window.innerHeight)<600;coarseRef.current=coarse;
  import('@/lib/shop/ballSound').then(m=>{if(!dead)soundRef.current=m.createBallSound();}).catch(()=>{});
  const onBounce=(v:number)=>{soundRef.current?.kick(v);if(v<1&&!reduced.current){const id=Date.now()+Math.random(),sb=stageRef.current?.screenBall(),top=stageElRef.current?.getBoundingClientRect().top??0;
   setBursts(b=>[...b.slice(-3),{id,s:v,y:sb?sb.y+sb.r-top-6:-1}]);window.setTimeout(()=>setBursts(b=>b.filter(x=>x.id!==id)),700);}};
  import('@/lib/shop/ballStage').then(({createBallStage})=>{if(dead)return;
   try{const st=createBallStage(canvas,{coarse,reducedMotion:reduced.current,onBounce,onView:()=>viewRef.current()});stageRef.current=st;st.setDesign(designRef.current);st.setInsets(insetsRef.current);attach();flushDirty();if(stepRef.current!=='draw')st.preview();setReady(true);
    if(typeof window!=='undefined'&&(process.env.NODE_ENV!=='production'||location.pathname.startsWith('/shop-lab')))(window as unknown as {__fiBallStage?:BallStage}).__fiBallStage=st;}
   catch(err){console.warn('ball studio: no WebGL',err);setFailed(true);}}).catch(()=>setFailed(true));
  return ()=>{dead=true;clearTimeout(encTimer.current);stageRef.current?.dispose();stageRef.current=null;soundRef.current?.close();soundRef.current=null;const w=window as unknown as {__fiBallStage?:BallStage};if(w.__fiBallStage)delete w.__fiBallStage;};},[attach,flushDirty]);
 const shown=preview??design;
 useEffect(()=>{stageRef.current?.setDesign(shown);},[shown,ready]);
 useEffect(()=>{stageRef.current?.setSelected(step==='stickers'?sel:-1);},[sel,ready,step]);
 useEffect(()=>{if(sel>=design.decals.length)setSel(-1);},[design.decals.length,sel]);
 useEffect(()=>{if(!hint)return;const t=window.setTimeout(()=>setHint(null),4200);return ()=>clearTimeout(t);},[hint]);
 useEffect(()=>{if(ready)setHint('Drag to spin · pinch to zoom');},[ready]);
 useEffect(()=>{if(!toast)return;const t=window.setTimeout(()=>setToast(null),2400);return ()=>clearTimeout(t);},[toast]);

 // ---- the drawing follows the design: a different art id (undo, a slot, a preset…) reloads the pixels ----
 useEffect(()=>{const S=sess.current,id=design.art.id;if(id===S.artId)return;S.artId=id;const tok=++S.loading;
  if(!id){const p=painterRef.current;if(p){p.load(null);flushDirty();}resetDrawHist();return;}
  const url=artUrl(id,storeRef.current,artMem.current);if(!url)return;
  void ensurePainter().then(p=>modsRef.current!.paint.decodeDrawing(url).then(px=>{if(tok!==sess.current.loading)return;p.load(px);flushDirty();resetDrawHist();}));
 },[design.art.id,store,ensurePainter,flushDirty,resetDrawHist]);
 useEffect(()=>{const S=sess.current,k=fillsKey(design.art.fills);if(k===S.fillsKey)return;S.fillsKey=k;resetDrawHist();},[design.art.fills,resetDrawHist]);
 useEffect(()=>{if(step==='draw')void ensurePainter();},[step,ensurePainter]);

 const commit=useCallback((d:BallDesign)=>dispatch({t:'set',d:validateBall(d)}),[]);
 const edit=useCallback((fn:(d:BallDesign)=>void)=>{const d=cloneBall(designRef.current);fn(d);commit(d);},[commit]);
 /** Replace the present design without a new undo step (Draw-step changes, after one checkpoint per visit). */
 const replace=(d:BallDesign)=>{const v=validateBall(d);designRef.current=v;dispatch({t:'replace',d:v});};
 const checkpointOnce=()=>{if(!sess.current.checkpointed){dispatch({t:'checkpoint'});sess.current.checkpointed=true;}};

 // ---- drawing → saved image (debounced after strokes; flushed before leaving, saving, buying, closing) ----
 const flushEncode=useCallback(():BallDesign=>{clearTimeout(encTimer.current);const p=painterRef.current,m=modsRef.current;
  if(!encPending.current||!p||!m)return designRef.current;encPending.current=false;
  const url=m.paint.encodeDrawing(p);if(url===null){say('That drawing is too busy to save. Try the eraser a little!');return designRef.current;}
  const id=url?artHash(url):'';if(url)artMem.current[id]=url;sess.current.artId=id;
  if(id===designRef.current.art.id)return designRef.current;const d=cloneBall(designRef.current);d.art.id=id;replace(d);return designRef.current;},[say]);
 const scheduleEncode=()=>{encPending.current=true;clearTimeout(encTimer.current);encTimer.current=window.setTimeout(flushEncode,700);};
 const setFills=(f:string[])=>{const d=cloneBall(designRef.current);d.art.fills=f;const v=validateBall(d);sess.current.fillsKey=fillsKey(v.art.fills);designRef.current=v;dispatch({t:'replace',d:v});};
 // The studio keeps the same number of Draw steps as the painter (HISTORY_STEPS), and drops px steps the painter dropped.
 const drawPush=(e:DrawStep)=>{dUndo.current.push(e);const m=modsRef.current,p=painterRef.current;if(m&&p)m.paint.alignDrawHistory(dUndo.current,p.steps);else if(dUndo.current.length>40)dUndo.current.shift();dRedo.current=[];checkpointOnce();setDrawRev(r=>r+1);};
 const drawUndo=()=>{const e=dUndo.current.pop();if(!e)return;dRedo.current.push(e);if(e.px&&painterRef.current?.undo()){flushDirty();scheduleEncode();}if(e.fills)setFills(e.fills.before);setDrawRev(r=>r+1);};
 const drawRedo=()=>{const e=dRedo.current.pop();if(!e)return;dUndo.current.push(e);if(e.px&&painterRef.current?.redo()){flushDirty();scheduleEncode();}if(e.fills)setFills(e.fills.after);setDrawRev(r=>r+1);};
 const clearDrawing=()=>{const p=painterRef.current,f=designRef.current.art.fills;const px=!!p&&p.clear(),hasF=f.some(Boolean);if(!px&&!hasF){say('Nothing to clear yet. Draw something!');return;}
  if(px){flushDirty();scheduleEncode();}if(hasF)setFills([]);drawPush({px,fills:hasF?{before:[...f],after:[]}:undefined});say('Cleared! Press undo to bring it back.');};
 const doFill=(dir:Vec3)=>{const st=stageRef.current,m=modsRef.current;if(!st||!m)return;const {right,up}=st.viewAxes();const d=designRef.current,n=layoutInfo(d.layout).panels;
  const cur=d.art.fills.length===n?[...d.art.fills]:Array<string>(n).fill('');
  const ids=[...new Set(m.paint.symmetryMaps(sym,right,up).map(f=>m.panels.panelAt(d.layout,f(dir)).id))].filter(i=>i<n);
  const off=ids.every(i=>cur[i]===ink),after=[...cur];ids.forEach(i=>{after[i]=off?'':ink;});
  drawPush({px:false,fills:{before:cur,after}});setFills(after);soundRef.current?.pop(off?.8:1.15);buzz();};
 const undo=()=>{if(step==='draw')drawUndo();else dispatch({t:'undo'});};
 const redo=()=>{if(step==='draw')drawRedo();else dispatch({t:'redo'});};
 const canUndo=step==='draw'?dUndo.current.length>0:h.past.length>0,canRedo=step==='draw'?dRedo.current.length>0:h.future.length>0;

 const goto=(id:StepId)=>{if(step==='draw'&&id!=='draw'){flushEncode();sess.current.checkpointed=false;}
  setStep(id);setVisited(v=>new Set(v).add(id));setPreview(null);if(id!=='stickers')setSel(-1);
  // Draw: the ball stops at once and never spins by itself here (audit P0.1); the first visit shows the intro card.
  if(id==='draw'){const st=stageRef.current;if(st){st.grab();st.release(0,0);}
   let seen=true;try{seen=!!localStorage.getItem(DRAW_INTRO_KEY);}catch{}
   if(!seen)setIntro(true);else setHint(matchMedia('(pointer: coarse)').matches?'Paint on the ball · arrows turn it':'Drag to paint · arrows or right-drag turn');}
  else setIntro(false);};
 const introDone=()=>{setIntro(false);try{localStorage.setItem(DRAW_INTRO_KEY,'1');}catch{}};
 /** The show-off spin after a preset / Surprise / a loaded slot, except in the Draw step (the ball holds still there). */
 const spinShow=()=>{if(stepRef.current!=='draw')stageRef.current?.preview();};
 const idx=STEPS.findIndex(x=>x.id===step);
 const decalEditable=step==='stickers';
 const painting=step==='draw'&&!showoff;
 // The resizable phone sheet (shared with Boot and Jersey): the ball re-fits to the stage's visible box as it moves.
 const panel=useStudioSheet({stageRef:stageElRef,fitOff:showoff,onInsets:i=>{insetsRef.current=i;stageRef.current?.setInsets(i);
  const el=stageElRef.current;if(el){el.style.setProperty('--insT',`${i?.top??0}px`);el.style.setProperty('--insB',`${i?.bottom??0}px`);}}});// the turn arrows sit in the visible box
 const close=()=>{const d=flushEncode();saveBallCurrent(d,undefined,artMem.current);onClose();};

 // ---- decals ----
 const frontDir=():Vec3=>{const st=stageRef.current;if(!st)return [0,0,1];const b=st.screenBall();return st.pick(b.x,b.y-b.r*.06)??[0,0,1];};
 /** A free spot near the front of the ball so a new decal doesn't cover another: the first candidate (screen offsets in
  *  ball radii) whose angular gap to every decal is bigger than both half-widths. */
 const freeDir=(kind:DecalKind,prefer:[number,number][]):Vec3=>{const st=stageRef.current;if(!st)return [0,0,1];const b=st.screenBall(),rad=b.r;
  const asp=(k:DecalKind)=>k==='name'?2.6:k==='quote'?3.4:k==='flag'?1.5:1,half=(k:DecalKind,sz:number)=>Math.min(sz*asp(k),.95)*.8+sz*.2;
  let best:Vec3=frontDir(),bestGap=-9;
  for(const [fx,fy] of prefer){const d=st.pick(b.x+fx*rad,b.y-b.r*.06+fy*rad);if(!d)continue;
   let gap=9;for(const x of designRef.current.decals){const a=Math.acos(Math.max(-1,Math.min(1,d[0]*x.dir[0]+d[1]*x.dir[1]+d[2]*x.dir[2])));gap=Math.min(gap,a-half(x.kind,x.size)-half(kind,DEFAULT_SIZE[kind])*.6);}
   if(gap>0)return d;if(gap>bestGap){bestGap=gap;best=d;}}
  return best;};
 const SPOTS:[number,number][]=[[0,0],[0,.45],[0,-.45],[-.4,.2],[.4,.2],[-.4,-.25],[.4,-.25],[0,.7],[0,-.7]];
 const addDecal=useCallback((kind:DecalKind,ref:string,dir:Vec3,color='#ffffff')=>{const d=cloneBall(designRef.current);if(d.decals.length>=MAX_DECALS){say(`That's ${MAX_DECALS}, the most a ball can hold!`);return -1;}
  const st=stageRef.current,rot=st?st.uprightRot(dir):0;d.decals.push({id:uid(),kind,ref,color,dir,rot,size:DEFAULT_SIZE[kind]});commit(d);const i=d.decals.length-1;setSel(i);soundRef.current?.pop();buzz();return i;},[commit,say]);
 /** One tap puts it on the ball, on a free spot facing you, selected: then drag it where you like. */
 const place=(kind:DecalKind,ref:string)=>{if(designRef.current.decals.length>=MAX_DECALS){say(`That's ${MAX_DECALS}, the most a ball can hold!`);return;}
  const i=addDecal(kind,ref,freeDir(kind,SPOTS),kind==='quote'?textColor:'#ffffff');if(i>=0)setHint('Drag it to move it · pinch or ± to resize');};
 const changeSel=(fn:(x:BallDecal)=>void)=>{if(sel<0)return;edit(d=>{const x=d.decals[sel];if(x)fn(x);});};
 const removeSel=()=>{if(sel<0)return;edit(d=>{d.decals.splice(sel,1);});setSel(-1);};

 // ---- pointer gestures on the stage ----
 type Mode='none'|'rotate'|'decal'|'pinch'|'paint'|'tap';
 const g=useRef<{pts:Map<number,{x:number;y:number}>;mode:Mode;sx:number;sy:number;t0:number;lx:number;ly:number;lt:number;vx:number;vy:number;moved:boolean;
  d0:number;size0:number;zoomRatio:number;mx:number;my:number;live:BallDesign|null;di:number;screenRot:number;tapDir:Vec3|null;lastTap:{t:number;x:number;y:number}}>({pts:new Map(),mode:'none',sx:0,sy:0,t0:0,lx:0,ly:0,lt:0,vx:0,vy:0,moved:false,d0:1,size0:.2,zoomRatio:1,mx:0,my:0,live:null,di:-1,screenRot:0,tapDir:null,lastTap:{t:0,x:0,y:0}});
 const pdist=()=>{const p=[...g.current.pts.values()];return p.length<2?1:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);};
 const pmid=()=>{const p=[...g.current.pts.values()];return p.length<2?{x:0,y:0}:{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2};};
 const strokeOpts=()=>{const st=stageRef.current!,m=modsRef.current!,{right,up}=st.viewAxes();
  return {tool:tool as Exclude<PaintTool,'fill'>,rgb:rgbOf(ink),size:tool==='stamp'?m.paint.STAMP_SIZES[bsize]:m.paint.brushSizes(coarseRef.current)[bsize],sym,right,up,stamp};};
 // Edge turn (audit P0.4): while the finger paints in the outer 15% of the ball (or just past the rim), each frame turns the
 // ball toward it (<= 1.4 rad/s, eased in) and lays ink at the clamped point, so a line goes round the ball. Reduced motion:
 // no turn, the rim clamp only. Runs inside the stage's capped frame, only while held at the edge.
 const edge=useRef({on:false,t:0});
 const edgeFrame=useRef<(dt:number)=>boolean>(()=>false);
 edgeFrame.current=(dt:number)=>{const G=g.current,st=stageRef.current,p=painterRef.current;if(!st||!p||G.mode!=='paint'||reduced.current)return false;
  const h=st.pickRim(G.lx,G.ly),now=performance.now();if(!h||h.r<=EDGE_IN){edge.current.on=false;return false;}
  if(!edge.current.on)edge.current={on:true,t:now};st.turnToward(h.dir,edgeTurnRate(h.r,now-edge.current.t)*dt);
  const d=st.pickRim(G.lx,G.ly);if(d){if(!G.tapDir)p.jump(d.dir);p.to(d.dir);G.tapDir=d.dir;G.moved=true;flushDirty();}return true;};
 /** Touch: show the brush ring for a moment at touch-down so the kid sees the size (the ring follows the mouse on desktop). */
 const ghostRing=(e:React.PointerEvent)=>{const c=cursorRef.current;if(!c||e.pointerType==='mouse')return;const r=e.currentTarget.getBoundingClientRect();
  c.style.transform=`translate(${e.clientX-r.left}px,${e.clientY-r.top}px)`;c.removeAttribute('data-ghost');void c.offsetWidth;c.setAttribute('data-ghost','');};
 const onDown=(e:React.PointerEvent)=>{const st=stageRef.current;if(!st)return;(e.target as Element).setPointerCapture?.(e.pointerId);const G=g.current;G.pts.set(e.pointerId,{x:e.clientX,y:e.clientY});setHint(null);
  if(G.pts.size===1){G.sx=G.lx=e.clientX;G.sy=G.ly=e.clientY;G.t0=G.lt=performance.now();G.vx=G.vy=0;G.moved=false;G.tapDir=null;
   const dir=st.pick(e.clientX,e.clientY),p=painterRef.current;
   if(painting&&e.button!==2&&dir&&p&&modsRef.current){st.grab();// the finger stops the ball at once: no streak from leftover spin
    if(tool==='fill'||tool==='stamp'){G.mode='tap';G.tapDir=dir;return;}
    G.mode='paint';G.tapDir=dir;p.begin(strokeOpts(),dir);flushDirty();edge.current.on=false;st.setFrameHook(dt=>edgeFrame.current(dt));ghostRing(e);return;}
   const hit=dir&&decalEditable?st.decalAt(dir):-1;
   if(hit>=0){G.mode='decal';G.di=hit;setSel(hit);const x=designRef.current.decals[hit];G.screenRot=st.screenRot(x.dir,x.rot);G.live=null;}
   else{G.mode='rotate';st.grab();}}
  else if(G.pts.size===2){if(G.mode==='rotate')st.release(0,0);if(G.mode==='decal'&&G.live){dispatch({t:'replace',d:G.live});}
   // A palm or a second finger keeps the line (audit P0.2): only a stroke under 150 ms old is dropped (a two-finger start).
   if(G.mode==='paint'){const p=painterRef.current;st.setFrameHook(null);if(p){if(performance.now()-G.t0<150)p.cancel();else if(p.end()){drawPush({px:true});scheduleEncode();}}flushDirty();}
   G.mode='pinch';G.moved=true;G.d0=pdist();G.zoomRatio=1;G.live=null;const m=pmid();G.mx=m.x;G.my=m.y;st.grab();
   const x=sel>=0&&decalEditable?designRef.current.decals[sel]:null;G.size0=x?.size??.2;}};
 const onMove=(e:React.PointerEvent)=>{const G=g.current,st=stageRef.current;
  if(e.pointerType==='mouse'&&cursorRef.current){const c=cursorRef.current,r=e.currentTarget.getBoundingClientRect();c.style.transform=`translate(${e.clientX-r.left}px,${e.clientY-r.top}px)`;}
  if(!st||!G.pts.has(e.pointerId))return;G.pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(G.mode==='pinch'){if(G.pts.size<2)return;const r=pdist()/G.d0,m=pmid();
   if(sel>=0&&decalEditable&&designRef.current.decals[sel]){if(!G.live){dispatch({t:'checkpoint'});G.live=cloneBall(designRef.current);}G.live.decals[sel].size=Math.min(.55,Math.max(.1,G.size0*r));st.setDesign(G.live);}
   else{st.zoomBy(r/G.zoomRatio);G.zoomRatio=r;st.drag(m.x-G.mx,m.y-G.my);}G.mx=m.x;G.my=m.y;return;}
  const dx=e.clientX-G.lx,dy=e.clientY-G.ly,now=performance.now(),dt=Math.max(1,now-G.lt);
  // Painting: every coalesced sample (120 Hz screens, styluses) is used; just past the rim (<= 1.3 R) the point is clamped to
  // the rim; further out the pen lifts (tapDir=null), so coming back starts a new segment instead of a jump line.
  if(G.mode==='paint'){const p=painterRef.current;if(!p)return;const ne=e.nativeEvent,co=tool==='line'?[]:ne.getCoalescedEvents?.()??[];let h=null;
   for(const ev of co.length?co:[ne]){h=st.pickRim(ev.clientX,ev.clientY);const dir=h?.dir??null;if(dir){if(!G.tapDir)p.jump(dir);p.to(dir);G.moved=true;}G.tapDir=dir;}
   flushDirty();G.lx=e.clientX;G.ly=e.clientY;G.lt=now;if(h&&h.r>EDGE_IN&&!reduced.current)st.wake();return;}
  if(!G.moved&&Math.hypot(e.clientX-G.sx,e.clientY-G.sy)<7)return;G.moved=true;
  if(G.mode==='tap'){G.mode='rotate';st.grab();}
  if(G.mode==='rotate'){st.drag(dx,dy);G.vx=G.vx*.6+dx/dt*1000*.4;G.vy=G.vy*.6+dy/dt*1000*.4;}
  else if(G.mode==='decal'){const dir=st.pick(e.clientX,e.clientY);if(dir){if(!G.live){dispatch({t:'checkpoint'});G.live=cloneBall(designRef.current);}const x=G.live.decals[G.di];if(x){x.dir=dir;x.rot=st.uprightRot(dir,G.screenRot);st.setDesign(G.live);}}}
  G.lx=e.clientX;G.ly=e.clientY;G.lt=now;};
 const onUp=(e:React.PointerEvent)=>{const G=g.current,st=stageRef.current;if(!G.pts.has(e.pointerId))return;G.pts.delete(e.pointerId);if(!st)return;
  if(G.mode==='pinch'){
   // One finger left (audit P0.3): it turns the ball from where it is now (no zoom snap, no flip).
   if(G.pts.size===1){if(G.live)dispatch({t:'replace',d:validateBall(G.live)});G.live=null;const [rest]=[...G.pts.values()];
    G.mode='rotate';G.lx=rest.x;G.ly=rest.y;G.lt=performance.now();G.vx=G.vy=0;G.moved=true;st.grab();}
   else if(G.pts.size>=2){G.d0=pdist();G.zoomRatio=1;const m=pmid();G.mx=m.x;G.my=m.y;if(G.live&&sel>=0)G.size0=G.live.decals[sel]?.size??G.size0;}
   else{if(G.live)dispatch({t:'replace',d:validateBall(G.live)});G.live=null;G.mode='none';st.release(0,0);}return;}
  if(G.pts.size)return;
  if(G.mode==='paint'){G.mode='none';st.setFrameHook(null);st.release(0,0);const p=painterRef.current;if(p&&p.end()){drawPush({px:true});scheduleEncode();}flushDirty();return;}
  if(G.mode==='tap'){G.mode='none';st.release(0,0);const dir=G.tapDir,p=painterRef.current;if(!dir||!p)return;
   if(tool==='fill')doFill(dir);else{p.begin(strokeOpts(),dir);if(p.end()){drawPush({px:true});scheduleEncode();soundRef.current?.pop(1.3);buzz();}flushDirty();}return;}
  const tap=!G.moved&&performance.now()-G.t0<400;
  if(G.mode==='rotate'){const idle=performance.now()-G.lt>90;st.release(tap||idle?0:G.vx,tap||idle?0:G.vy);}
  if(G.mode==='decal'&&G.live){dispatch({t:'replace',d:validateBall(G.live)});}
  G.live=null;G.mode='none';
  if(tap)onTap(e.clientX,e.clientY);};
 const onTap=(x:number,y:number)=>{const st=stageRef.current;if(!st)return;const G=g.current,dir=st.pick(x,y);
  if(showoff){st.kick();return;}
  const now=performance.now();if(now-G.lastTap.t<330&&Math.hypot(x-G.lastTap.x,y-G.lastTap.y)<30){st.reset();G.lastTap.t=0;return;}G.lastTap={t:now,x,y};
  if(dir&&decalEditable){const i=st.decalAt(dir);setSel(i);}else if(!dir)setSel(-1);};
 const onWheel=useCallback((e:WheelEvent)=>{e.preventDefault();stageRef.current?.zoomBy(e.deltaY<0?1.07:1/1.07);},[]);
 useEffect(()=>{const c=canvasRef.current;if(!c)return;c.addEventListener('wheel',onWheel,{passive:false});return ()=>c.removeEventListener('wheel',onWheel);},[onWheel]);
 // Keyboard: arrows turn the ball, Ctrl/Cmd+Z undo, Shift+Ctrl/Cmd+Z redo, Escape closes the top layer.
 const keyRef=useRef<(e:KeyboardEvent)=>void>(()=>{});
 keyRef.current=(e:KeyboardEvent)=>{const t=e.target as HTMLElement;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'))return;
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey)redo();else undo();return;}
  const st=stageRef.current;if(!st)return;if(e.key==='ArrowLeft')st.step(-1,0);else if(e.key==='ArrowRight')st.step(1,0);else if(e.key==='ArrowUp')st.step(0,-1);else if(e.key==='ArrowDown')st.step(0,1);
  else if(e.key==='Escape'){if(confirm)setConfirm(null);else if(sheet)setSheet(null);else if(showoff)exitShow();else if(sel>=0)setSel(-1);else close();}};
 useEffect(()=>{const k=(e:KeyboardEvent)=>keyRef.current(e);window.addEventListener('keydown',k);return ()=>window.removeEventListener('keydown',k);},[]);

 // ---- thumbnails for stickers and flags (drawn once, on the client) ----
 const [thumbs,setThumbs]=useState<Record<string,string>>({});
 useEffect(()=>{if(step!=='stickers'||thumbs['sticker:star'])return;let dead=false;import('@/lib/shop/ballArt').then(({decalImage})=>{if(dead)return;const out:Record<string,string>={};
  for(const id of STICKER_IDS)out[`sticker:${id}`]=decalImage('sticker',id,'#fff','',120).canvas.toDataURL();
  for(const f of FLAGS)out[`flag:${f.code}`]=decalImage('flag',f.code,'#fff','',96).canvas.toDataURL();setThumbs(out);});return ()=>{dead=true;};},[step,thumbs]);
 const [patThumbs,setPatThumbs]=useState<Record<string,string>>({});
 useEffect(()=>{if(step!=='pattern')return;let dead=false;import('@/lib/shop/ballArt').then(({drawPatternMask})=>{if(dead)return;const c=document.createElement('canvas');c.width=128;c.height=64;const g2=c.getContext('2d')!;const out:Record<string,string>={};
  const hx=(v:string)=>[parseInt(v.slice(1,3),16),parseInt(v.slice(3,5),16),parseInt(v.slice(5,7),16)];const base=hx(design.colors.b==='#1d1f24'?design.colors.a:design.colors.b),c1=hx(design.pattern.c1),c2=hx(design.pattern.c2);
  for(const p of PATTERNS){drawPatternMask(c,p.id,design.pattern.seed);const img=g2.getImageData(0,0,128,64),px=img.data;for(let i=0;i<px.length;i+=4){const r=px[i]/255,gg=px[i+1]/255;for(let k=0;k<3;k++){let v=base[k];v=v+(c1[k]-v)*r;v=v+(c2[k]-v)*gg;px[i+k]=v;}px[i+3]=255;}
   g2.putImageData(img,0,0);out[p.id]=c.toDataURL();}setPatThumbs(out);});return ()=>{dead=true;};},[step,design.colors.a,design.colors.b,design.pattern.c1,design.pattern.c2,design.pattern.seed]);

 const L=layoutInfo(design.layout),groupsList=(['a','b','c'] as const).slice(0,L.groups.length);
 useEffect(()=>{if(!groupsList.includes(group))setGroup('a');},[groupsList,group]);
 /** Desktop live preview: hovering a choice shows it on the ball; leaving puts the design back (touch: a tap applies, undoable). */
 const hover=(fn:(d:BallDesign)=>void)=>({onPointerEnter:(e:React.PointerEvent)=>{if(e.pointerType!=='mouse')return;const d=cloneBall(designRef.current);fn(d);setPreview(validateBall(d));},onPointerLeave:()=>setPreview(null)});
 const pick=(fn:(d:BallDesign)=>void)=>{setPreview(null);edit(fn);};
 const setColour=(hex:string)=>pick(d=>{d.colors[group]=hex;});
 const setLayout=(d:BallDesign,l:BallLayout)=>{if(d.layout!==l)d.art.fills=[];d.layout=l;if(l==='leather18'&&d.finish!=='leather')d.finish='leather';else if(l!=='leather18'&&d.finish==='leather')d.finish='gloss';};
 const applyPreset=(p:BallDesign)=>{const cur=designRef.current;commit({...cloneBall(p),decals:cur.decals,size:cur.size,futsal:cur.futsal,art:{id:cur.art.id,fills:p.layout===cur.layout?cur.art.fills:[]}});setPreview(null);spinShow();soundRef.current?.pop(.9);};
 const surprise=()=>{commit(randomBall(designRef.current));setPreview(null);spinShow();soundRef.current?.pop(1.2);};
 const snap=(n:number)=>{try{return stageRef.current?.snapshot(n)??'';}catch{return '';}};
 const openBuy=()=>{flushEncode();setSel(-1);window.setTimeout(()=>setConfirm({thumb:snap(200)}),0);};
 const doBuy=()=>{const d=validateBall(flushEncode());markBallBought(d,undefined,artMem.current);setStore(loadBallStore());setConfirm(null);
  if(onBuy)onBuy(d);stageRef.current?.kick();say(onBuy?'It’s yours! Find it in My kit.':'Ask at the till to buy your ball!');};
 const openSlots=()=>{flushEncode();setSel(-1);setStore(loadBallStore());window.setTimeout(()=>setSheet({thumb:snap(96)}),0);};
 const slotSave=(i:number,name:string)=>{const d=flushEncode();if(saveBallSlot(i,name,d,Date.now(),undefined,artMem.current,sheet?.thumb)){setStore(loadBallStore());say('Saved! Your ball is safe.');soundRef.current?.pop(1.1);countDesignSave('ball');}else say('This browser could not save.');};
 const slotLoad=(i:number)=>{const sl=store?.slots[i];if(!sl)return;commit(sl.design);setSheet(null);setSel(-1);say(`Loaded ${sl.name}`);spinShow();};
 const enterShow=()=>{flushEncode();setSel(-1);setShowoff(true);setPreview(null);try{const r=rootRef.current;if(r?.requestFullscreen&&!document.fullscreenElement)void r.requestFullscreen().catch(()=>{});}catch{}
  window.setTimeout(()=>{stageRef.current?.resize();stageRef.current?.reset();window.setTimeout(()=>stageRef.current?.spin(6),480);},60);};
 function exitShow(){setShowoff(false);try{if(document.fullscreenElement)void document.exitFullscreen().catch(()=>{});}catch{}window.setTimeout(()=>{stageRef.current?.resize();stageRef.current?.reset();},60);}
 useEffect(()=>{const f=()=>{if(!document.fullscreenElement&&showoff)setShowoff(false);};document.addEventListener('fullscreenchange',f);return ()=>document.removeEventListener('fullscreenchange',f);},[showoff]);
 const kick=()=>{stageRef.current?.kick();};

 // Name & number decals: one of each, updated in place.
 const nameIdx=design.decals.findIndex(x=>x.kind==='name'),numIdx=design.decals.findIndex(x=>x.kind==='number');
 const onName=(raw:string)=>{const f=filterNameInput(raw);setNameWarn(f!==raw.slice(0,NAME_MAX)&&raw.length<=NAME_MAX+1?'Only letters, spaces and hyphens.':raw.length>NAME_MAX?`Up to ${NAME_MAX} letters.`:'');setNameDraft(f);};
 const nameOk=nameDraft.trim().length>0&&isNameAllowed(nameDraft.trim());
 const putName=()=>{const n=nameDraft.trim();if(!isNameAllowed(n)){setNameWarn('Let’s pick a different name.');return;}
  if(nameIdx>=0){edit(d=>{d.decals[nameIdx].ref=n;d.decals[nameIdx].color=textColor;});setSel(nameIdx);stageRef.current?.pop(nameIdx);}else addDecal('name',n,freeDir('name',SPOTS),textColor);};
 const putNumber=()=>{const n=cleanNumber(numDraft);if(n===null)return;if(numIdx>=0){edit(d=>{d.decals[numIdx].ref=String(n);d.decals[numIdx].color=textColor;});setSel(numIdx);stageRef.current?.pop(numIdx);}
  else addDecal('number',String(n),freeDir('number',[[0,.45],[0,-.45],[0,0],[-.4,.2],[.4,.2],[-.4,-.25],[.4,-.25]]),textColor);};
 const setTextCol=(hex:string)=>{setTextColor(hex);const selD=sel>=0?design.decals[sel]:null;if(selD&&(selD.kind==='name'||selD.kind==='number'||selD.kind==='quote'))changeSel(x=>{x.color=hex;});};

 const selDecal=sel>=0?design.decals[sel]:null;
 const nextStep=idx<STEPS.length-1?STEPS[idx+1]:null;
 const nextCta=nextStep?<button className={s.nextCta} onClick={()=>goto(nextStep.id)}>Next: {nextStep.label}{I.next}</button>:null;
 const swatchRow=(cur:string,set:(hex:string)=>void,label:string,hov?:(hex:string)=>ReturnType<typeof hover>|object)=><div className={s.swatches} role="group" aria-label={label}>
  {PALETTE.map(c=><button key={c.hex} className={`${s.sw} ${isLight(c.hex)?s.light:''}`} style={{background:c.hex}} aria-label={c.name} title={c.name} aria-pressed={cur===c.hex} onClick={()=>set(c.hex)} {...(hov?hov(c.hex):{})}/>)}
  <label className={`${s.sw} ${s.custom}`} title="Any colour"><span className={s.sr}>Pick any colour</span><input type="color" value={cur} onChange={e=>set(e.target.value)}/></label></div>;
 const brushPxNow=()=>{const st=stageRef.current;if(!st)return 20;const R=st.screenBall().r;const m=modsRef.current;const r=m?(tool==='stamp'?m.paint.STAMP_SIZES[bsize]:m.paint.brushSizes(coarseRef.current)[bsize]):.042;return Math.max(8,r*R*2);};
 const brushPx=brushPxNow();
 // The ring follows zoom and resizes (audit P1.6): the stage calls this whenever its camera moves.
 viewRef.current=()=>{const c=cursorRef.current;if(!c)return;const px=brushPxNow();c.style.width=c.style.height=`${px}px`;c.style.marginLeft=c.style.marginTop=`${-px/2}px`;};

 const pane=(()=>{switch(step){
  case 'panels':return <div className={s.pane} key="panels">
   <h2 className={`${s.h2} ${studioSectionTitle}`}>Start from an idea</h2>
   <div className={s.presets}>
    <button className={`${s.preset} ${s.surprise}`} onClick={surprise} data-shop-own-cue><span className={s.diceBall}>{I.dice}</span>Surprise me!</button>
    {PRESETS.map(p=><button key={p.id} className={s.preset} onClick={()=>applyPreset(p.design)} data-shop-own-cue {...hover(d=>{const n=cloneBall(p.design);Object.assign(d,{...n,decals:d.decals,size:d.size,futsal:d.futsal,art:{id:d.art.id,fills:n.layout===d.layout?d.art.fills:[]}});})}><MiniBall d={p.design}/>{p.label}</button>)}</div>
   <h2 className={`${s.h2} ${studioSectionTitle}`}>Choose your panels <small>{L.panels} panels</small></h2>
   <div className={s.tiles}>{LAYOUTS.map(l=><button key={l.id} className={s.tile} aria-pressed={design.layout===l.id} onClick={()=>pick(d=>setLayout(d,l.id))} {...hover(d=>setLayout(d,l.id))}>
    <span className={s.tileArt}><LayoutIcon id={l.id} a={design.colors.a} b={design.colors.b} c={design.colors.c}/></span>{l.label}<small>{l.panels} panels</small></button>)}</div>
   <p className={s.fact}>{I.bulb}<span><b>Did you know?</b>{L.fact}</span></p>{nextCta}</div>;
  case 'colours':return <div className={s.pane} key="colours">
   <h2 className={`${s.h2} ${studioSectionTitle}`}>Colour your panels</h2>
   <div className={s.groups}>{groupsList.map((k,i)=><button key={k} className={s.groupBtn} aria-pressed={group===k} onClick={()=>setGroup(k)}><i style={{background:design.colors[k]}}/>{L.groups[i]}</button>)}</div>
   {swatchRow(design.colors[group],setColour,`Colour for ${L.groups[groupsList.indexOf(group)]}`,hex=>hover(d=>{d.colors[group]=hex;}))}
   <div className={s.row} style={{marginTop:14}}><button className={s.chip} onClick={()=>edit(d=>{const t=d.colors.a;d.colors.a=d.colors.b;d.colors.b=t;})}>{I.shuffle}Swap first two</button>
    <button className={s.chip} onClick={surprise} data-shop-own-cue>{I.dice}Surprise colours</button></div>{nextCta}</div>;
  case 'pattern':return <div className={s.pane} key="pattern">
   <h2 className={`${s.h2} ${studioSectionTitle}`}>Add a pattern</h2>
   <div className={s.tiles}>{PATTERNS.map(p=><button key={p.id} className={s.tile} aria-pressed={design.pattern.kind===p.id} onClick={()=>pick(d=>{d.pattern.kind=p.id;})} {...hover(d=>{d.pattern.kind=p.id;})}>
    <span className={`${s.tileArt} ${s.patArt}`}>{patThumbs[p.id]?<img src={patThumbs[p.id]} alt=""/>:null}</span>{p.label}</button>)}</div>
   {design.pattern.kind!=='none'&&<>
    <h3 className={s.h3}>Pattern colours</h3>
    <div className={s.groups}>{(['c1','c2'] as const).map((k,i)=><button key={k} className={s.groupBtn} aria-pressed={patSlot===k} onClick={()=>setPatSlot(k)}><i style={{background:design.pattern[k]}}/>{i?'Second colour':'Main colour'}</button>)}</div>
    {swatchRow(design.pattern[patSlot],hex=>pick(d=>{d.pattern[patSlot]=hex;}),'Pattern colour',hex=>hover(d=>{d.pattern[patSlot]=hex;}))}
    <h3 className={s.h3}>Paint it on</h3>
    <div className={s.row}>{(['all',...groupsList] as PatternTarget[]).map(k=><button key={k} className={s.chip} aria-pressed={design.pattern.on===k} onClick={()=>edit(d=>{d.pattern.on=k;})}>{k==='all'?'Whole ball':L.groups[['a','b','c'].indexOf(k)]}</button>)}
     <button className={s.chip} onClick={()=>edit(d=>{d.pattern.seed=(d.pattern.seed*7+13)%9999;})}>{I.shuffle}Shuffle</button></div></>}{nextCta}</div>;
  case 'finish':{const F=FINISHES.find(f=>f.id===design.finish)!;return <div className={s.pane} key="finish">
   <h2 className={`${s.h2} ${studioSectionTitle}`}>Pick a finish</h2>
   <div className={s.tiles}>{FINISHES.map(f=><button key={f.id} className={s.tile} aria-pressed={design.finish===f.id} onClick={()=>pick(d=>{d.finish=f.id;})} {...hover(d=>{d.finish=f.id;})}><span className={s.finish} style={FINISH_CSS[f.id]}/>{f.label}</button>)}</div>
   <p className={s.fact}>{I.bulb}<span><b>{F.label}</b>{F.fact}</span></p>{nextCta}</div>;}
  case 'draw':return <div className={s.pane} key="draw" data-draw-pane>
   <h2 className={`${s.h2} ${studioSectionTitle}`}>Draw on your ball</h2>
   <div className={s.tools} role="group" aria-label="Drawing tools">{TOOLS.map(t=><button key={t.id} className={s.tool} aria-pressed={tool===t.id} onClick={()=>setTool(t.id)} data-tool={t.id}>{t.icon}<span>{t.label}</span></button>)}</div>
   {tool==='stamp'&&<div className={s.stamps} role="group" aria-label="Stamps">{(['star','heart','circle','bolt'] as StampKind[]).map(k=><button key={k} className={s.stampBtn} aria-pressed={stamp===k} aria-label={`${k==='bolt'?'Lightning':k[0].toUpperCase()+k.slice(1)} stamp`} onClick={()=>setStamp(k)} style={{color:ink}}>{STAMP_ICON[k]}</button>)}</div>}
   <div className={s.drawRow}>
    <div className={s.seg} role="group" aria-label="Size">{[0,1,2].map(i=><button key={i} aria-pressed={bsize===i} aria-label={['Small','Medium','Big'][i]} onClick={()=>setBsize(i)}><i style={{width:8+i*7,height:8+i*7,background:tool==='eraser'?'#fffaf0':ink}}/></button>)}</div>
    <div className={s.seg} role="group" aria-label="Symmetry">{SYMS.map(x=><button key={x.id} aria-pressed={sym===x.id} onClick={()=>setSym(x.id)} title={x.id==='off'?'No copies':x.id==='mirror'?'Mirror: a copy on the other side':'×5: five copies all round the ball'}>{x.icon}<span>{x.label}</span></button>)}</div>
   </div>
   {tool!=='eraser'?swatchRow(ink,setInk,'Paint colour'):<p className={s.ok}>The eraser rubs out your drawing. Pick a brush to paint again.</p>}
   <div className={s.row} style={{marginTop:12}}><button className={s.chip} onClick={clearDrawing}>{I.bin}Clear drawing</button></div>
   <p className={s.fact}>{I.hand}<span><b>{tool==='fill'?'Fill a panel':tool==='stamp'?'Stamps':sym==='radial5'?'×5 magic':'How to draw'}</b>{tool==='fill'?'Tap any panel to paint it. Tap it again to take the colour off.':tool==='stamp'?'Tap the ball to stamp. Try ×5 for a ring of stars!':sym==='radial5'?'Everything you draw is copied five times round the ball, like the five sides of a pentagon.':'Paint with one finger. Spin the ball with two fingers, or switch to Spin.'}</span></p>{nextCta}</div>;
  case 'stickers':return <div className={s.pane} key="stickers">
   <h2 className={`${s.h2} ${studioSectionTitle}`}>Stickers &amp; words <small className={s.count} aria-label={`${design.decals.length} of ${MAX_DECALS} used`}>{Array.from({length:MAX_DECALS},(_,i)=><i key={i} data-on={i<design.decals.length?'':undefined}/>)}</small></h2>
   <div className={s.tabs} role="group" aria-label="Sticker kind">{(['sticker','flag','quote','name'] as const).map(k=><button key={k} aria-pressed={tray===k} onClick={()=>setTray(k)}>{k==='sticker'?'Stickers':k==='flag'?'Flags':k==='quote'?'Words':'Name'}</button>)}</div>
   {tray==='sticker'&&<div className={s.trays}>{STICKER_IDS.map(id=><button key={id} className={s.item} aria-label={`${id} sticker`} disabled={design.decals.length>=MAX_DECALS} onClick={()=>place('sticker',id)} data-shop-own-cue>{thumbs[`sticker:${id}`]?<img src={thumbs[`sticker:${id}`]} alt=""/>:null}</button>)}</div>}
   {tray==='flag'&&<div className={`${s.trays} ${s.flags}`}>{FLAGS.map(f=><button key={f.code} className={s.item} aria-label={`${f.name} flag`} title={f.name} disabled={design.decals.length>=MAX_DECALS} onClick={()=>place('flag',f.code)} data-shop-own-cue>{thumbs[`flag:${f.code}`]?<img src={thumbs[`flag:${f.code}`]} alt="" style={{height:'78%'}}/>:null}<span className={s.flagName}>{f.name}</span></button>)}</div>}
   {tray==='quote'&&<div className={s.quotes}>{QUOTES.map(q=><button key={q.id} className={s.quote} disabled={design.decals.length>=MAX_DECALS} onClick={()=>place('quote',q.id)} data-shop-own-cue>{q.text}</button>)}</div>}
   {tray==='name'&&<>
    <div className={s.field}><input value={nameDraft} onChange={e=>onName(e.target.value)} placeholder="Type your name" maxLength={NAME_MAX+1} aria-label="Name for your ball" autoComplete="off" autoCapitalize="words" spellCheck={false} enterKeyHint="done" onKeyDown={e=>{if(e.key==='Enter')putName();}}/>
     <span className={s.left}>{NAME_MAX-nameDraft.length}</span><button className={`${s.chip} ${s.goldChip}`} disabled={!nameOk} onClick={putName} data-shop-own-cue>{nameIdx>=0?'Update':'Put on ball'}</button></div>
    {nameWarn?<p className={s.warn} role="status">{nameWarn}</p>:nameDraft&&!nameOk?<p className={s.warn} role="status">Let’s pick a different name.</p>:<p className={s.ok}>Letters, spaces and hyphens, up to {NAME_MAX}.</p>}
    <h3 className={s.h3}>Your number</h3>
    <div className={s.stepper}><button className={s.nav} aria-label="Number down" onClick={()=>setNumDraft(n=>(n+99)%100)}>{I.minus}</button><output aria-live="polite">{numDraft}</output><button className={s.nav} aria-label="Number up" onClick={()=>setNumDraft(n=>(n+1)%100)}>{I.plus}</button>
     <button className={`${s.chip} ${s.goldChip}`} onClick={putNumber} data-shop-own-cue>{numIdx>=0?'Update':'Put on ball'}</button></div>
    <h3 className={s.h3}>Letter colour</h3>
    <div className={s.mini}>{PALETTE.filter((_,i)=>i<13).map(c=><button key={c.hex} className={`${s.sw} ${isLight(c.hex)?s.light:''}`} style={{background:c.hex}} aria-label={c.name} aria-pressed={textColor===c.hex} onClick={()=>setTextCol(c.hex)}/>)}</div></>}
   {design.decals.length>=MAX_DECALS?<p className={s.full}>Your ball is full! Tap a sticker on the ball and press the bin to swap it.</p>:
    tray==='name'?<p className={s.fact}>{I.bulb}<span><b>Like the pros</b>Players often have their name or number printed on their own training balls so they never get mixed up.</span></p>:
    <p className={s.fact}>{I.hand}<span><b>How to stick</b>Tap one and it jumps onto the ball. Drag it to move it, pinch to resize.</span></p>}{nextCta}</div>;
  case 'done':return <div className={s.pane} key="done">
   <h2 className={`${s.h2} ${studioSectionTitle}`}>Pick your size</h2>
   <div className={s.sizes}>{SIZES.map(z=><button key={z.id} className={s.tile} aria-pressed={design.size===z.id} onClick={()=>edit(d=>{d.size=z.id;})}><span className={s.sizeBall} style={{width:30+z.id*7,height:30+z.id*7}}/>{z.label}</button>)}</div>
   <p className={s.fact}>{I.bulb}<span><b>Size {design.size}</b>{SIZES.find(z=>z.id===design.size)!.note} Kids usually play with size 3 or 4.</span></p>
   <button className={s.toggle} aria-pressed={design.futsal} onClick={()=>edit(d=>{d.futsal=!d.futsal;})}><span><b>Futsal ball</b>{FUTSAL_NOTE}</span><i className={s.switch}/></button>
   <div className={s.bill} aria-label="Price">{priceLines(design).map(l=><div key={l.label}><span>{l.label}</span><span>{l.coins}</span></div>)}<div><span>Total</span><span>{price} coins</span></div></div>
   <div className={s.row} style={{marginTop:14}}><button className={s.chip} onClick={enterShow}>{I.expand}Show it off</button></div></div>;
 }})();

 return <div ref={rootRef} className={s.root} role="dialog" aria-modal="true" aria-label="Ball studio" data-ball-studio data-step={step} data-show={showoff?'':undefined}>
   <div className={s.top}>
    <BackButton onBack={close} label="Back"/>
    <div className={s.titleBox}><h1 className={s.title}>Ball Studio</h1><div className={s.sub} data-saving={saving?'':undefined}><i className={s.savedDot}/>{saving?'Saving…':'Saved'}</div></div>
    <CoinPill balance={wallet.balance} className={s.headerCoins} data-coins/>
   </div>
  <div ref={stageElRef} className={s.stage} data-painting={painting?'':undefined} data-tool={painting?tool:undefined} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onContextMenu={e=>{if(step==='draw')e.preventDefault();}}>
   <div className={s.spot}/>
   <canvas ref={canvasRef} className={s.canvas} aria-label={painting?'Your football. Drag on it to paint; drag outside it, two fingers or the arrows turn it.':'Your football. Drag to spin it, pinch to zoom, double-tap to reset.'} role="img"/>
   {painting&&<div ref={cursorRef} className={s.cursor} aria-hidden style={{width:brushPx,height:brushPx,marginLeft:-brushPx/2,marginTop:-brushPx/2,borderColor:tool==='eraser'?'#244d40':ink}}/>}
   {bursts.map(b=><span key={b.id} className={s.burst} style={{'--s':.6+b.s*.8,...(b.y>0?{top:b.y}:null)} as React.CSSProperties} aria-hidden>{Array.from({length:7},(_,i)=><i key={i} style={{'--a':`${i*51+10}deg`} as React.CSSProperties}/>)}</span>)}
   {!showoff&&<StudioIconRow>
    <StudioIconButton label="Undo" disabled={!canUndo} onClick={undo}>{I.undo}</StudioIconButton>
    <StudioIconButton label="Redo" disabled={!canRedo} onClick={redo}>{I.redo}</StudioIconButton>
    <StudioIconButton label="Randomise" onClick={surprise}>{I.dice}</StudioIconButton>
    <StudioIconButton label="Show it off (full screen)" onClick={enterShow}>{I.expand}</StudioIconButton>
    <StudioIconButton label="Reset view" onClick={()=>stageRef.current?.reset()}>{I.reset}</StudioIconButton>
   </StudioIconRow>}
   {showoff&&<StudioIconRow>
    <StudioIconButton label="Spin it" onClick={()=>stageRef.current?.spin(5)} data-shop-spin>{I.spin}</StudioIconButton>
    <StudioIconButton label="Reset view" onClick={()=>stageRef.current?.reset()}>{I.reset}</StudioIconButton>
   </StudioIconRow>}
   {!ready&&<div className={s.loading}>{failed?<span>This device can’t show the 3D ball, but you can still design it.</span>:<><span className={s.loadBall}/><span>Pumping up your ball…</span></>}</div>}
   {hint&&ready&&!showoff?<div className={s.hint} key={hint}>{I.hand}{hint}</div>:null}
   {/* Turn arrows (audit P1.1): always there in the Draw step, so a finger on the ball only ever paints. Each tap turns 30°. */}
   {painting&&<div className={s.turnPad} role="group" aria-label="Turn the ball" onPointerDown={e=>e.stopPropagation()}>
    <button className={`${s.turnBtn} ${s.tUp}`} aria-label="Turn the ball up" onClick={()=>stageRef.current?.turn(0,-1)} data-ball-turn="up">{I.tu}</button>
    <button className={`${s.turnBtn} ${s.tDown}`} aria-label="Turn the ball down" onClick={()=>stageRef.current?.turn(0,1)} data-ball-turn="down">{I.td}</button>
    <button className={`${s.turnBtn} ${s.tLeft}`} aria-label="Turn the ball left" onClick={()=>stageRef.current?.turn(-1,0)} data-ball-turn="left">{I.tl}</button>
    <button className={`${s.turnBtn} ${s.tRight}`} aria-label="Turn the ball right" onClick={()=>stageRef.current?.turn(1,0)} data-ball-turn="right">{I.tr}</button></div>}
   {painting&&intro&&ready&&<div className={s.intro} role="dialog" aria-label="How to draw on the ball" onPointerDown={e=>e.stopPropagation()} data-draw-intro>
    <p>{I.brush}<span><b>Finger on the ball</b> paints. The ball holds still.</span></p>
    <p>{I.tr}<span><b>Arrows</b>, or drag off the ball, turn it.</span></p>
    <p>{I.hand}<span><b>Paint to the edge</b> and the ball turns for you.</span></p>
    <button className={s.introOk} onClick={introDone}>Got it</button></div>}
   {selDecal&&decalEditable&&!showoff&&<div className={s.decalBar} onPointerDown={e=>e.stopPropagation()} role="toolbar" aria-label="Selected sticker">
    <button aria-label="Smaller" onClick={()=>changeSel(x=>{x.size=Math.max(.1,x.size/1.15);})}>{I.minus}</button>
    <button aria-label="Bigger" onClick={()=>changeSel(x=>{x.size=Math.min(.55,x.size*1.15);})}>{I.plus}</button>
    <button aria-label="Turn" onClick={()=>changeSel(x=>{x.rot+=Math.PI/8;})}>{I.turn}</button>
    <button className={s.del} aria-label="Remove sticker" onClick={removeSel}>{I.bin}</button>
    <button className={s.okBtn} aria-label="Done with this sticker" onClick={()=>setSel(-1)}>{I.check}</button></div>}
   {!(selDecal&&decalEditable)&&<div className={s.kickWrap} data-studio-top="" onPointerDown={e=>e.stopPropagation()}>
    <button className={s.kick} onClick={kick} data-shop-own-cue><span>{I.ball}</span>Kick!</button></div>}
   {showoff&&<button className={s.showClose} onClick={exitShow} onPointerDown={e=>e.stopPropagation()}>{I.close}Back to designing</button>}
   {toast&&<div key={toast.id} className={s.toast} role="status">{toast.text}</div>}
  </div>
  <section className={`${s.sheet} ${panel.sheetClass}`} {...panel.sheetProps} aria-label="Design your ball">
   <StudioSheetHandle sheet={panel}/>
   <StudioSteps steps={STEP_DEFS} activeId={step} isDone={id=>visited.has(id as StepId)} onSelect={id=>goto(id as StepId)}/>
   <div className={s.body}>{pane}</div>
   <div className={s.foot}>
    <button className={s.save} onClick={openSlots}>{I.save}Save</button>
    <button className={s.buy} onClick={openBuy} aria-label={`Buy for ${price} coins`}>Buy for <CoinIcon size={22}/><span key={bump} className={s.price} data-bump={bump?'':undefined}>{price}</span></button>
   </div>
  </section>
  {sheet&&<div className={s.modalWrap} onClick={e=>{if(e.target===e.currentTarget)setSheet(null);}}>
   <div className={s.modal} role="dialog" aria-label="Your saved balls">
    <h2 className={s.h2}>Your saved balls <button className={s.iconBtn} aria-label="Close saved balls" onClick={()=>setSheet(null)}>{I.close}</button></h2>
    <p className={s.modalNote}>Your ball saves itself as you go. Keep up to 3 favourites here.</p>
    {[0,1,2].map(i=><SlotRow key={i} i={i} slot={store?.slots[i]??null} onSave={slotSave} onLoad={slotLoad}/>)}
   </div></div>}
  {confirm&&<div className={s.modalWrap} onClick={e=>{if(e.target===e.currentTarget)setConfirm(null);}}>
   <div className={`${s.modal} ${s.confirm}`} role="dialog" aria-label="Buy your ball" data-buy-confirm>
    {confirm.thumb?<img className={s.confirmBall} src={confirm.thumb} alt="Your ball"/>:<MiniBall d={design}/>}
    <h2 className={s.h2c}>Buy this ball?</h2>
    <p className={s.confirmLine}>{layoutInfo(design.layout).label} · size {design.size}{design.futsal?' · futsal':''}{hasArt(design)?' · your drawing':''}</p>
    <div className={s.confirmPrice}><CoinIcon size={32}/><b>{price}</b> coins</div>
    {(()=>{const short=price-wallet.balance;return short>0&&onBuy?<p className={s.warnBox} role="status">You have {wallet.balance} coins. Play games and do jobs on the island to earn {short} more!</p>:<p className={s.okLine}>You have {wallet.balance} coins{onBuy?`. After this: ${wallet.balance-price}.`:'.'}</p>;})()}
    <div className={s.confirmBtns}><button className={s.save} onClick={()=>setConfirm(null)}>Not yet</button>
     <button className={s.buy} disabled={!!onBuy&&wallet.balance<price} onClick={doBuy} data-buy-yes data-shop-own-cue>{I.check}Yes, buy it!</button></div>
   </div></div>}
 </div>;
}

function SlotRow({i,slot,onSave,onLoad}:{i:number;slot:BallStore['slots'][number];onSave(i:number,name:string):void;onLoad(i:number):void}){
 const [name,setName]=useState(slot?.name??`My ball ${i+1}`);
 useEffect(()=>{setName(slot?.name??`My ball ${i+1}`);},[slot,i]);
 return <div className={s.slot} data-slot={i}>{slot?.thumb?<img className={s.slotThumb} src={slot.thumb} alt=""/>:slot?<MiniBall d={slot.design}/>:<span className={s.miniBall} style={{background:'repeating-conic-gradient(#efe1bf 0 25%,#f8efd9 0 50%) 0 0/14px 14px'}} aria-hidden/>}
  <div className={s.slotBody}><input value={name} onChange={e=>setName(filterSlotName(e.target.value))} aria-label={`Name for slot ${i+1}`} maxLength={SLOT_NAME_MAX}/>
   <small>{slot?`${layoutInfo(slot.design.layout).label} · ${ballPrice(slot.design)} coins`:'Empty slot'}</small></div>
  <div className={s.slotBtns}><button className={s.primary} onClick={()=>onSave(i,name)} data-shop-own-cue>{slot?'Save over':'Save here'}</button>{slot&&<button onClick={()=>onLoad(i)}>Load</button>}</div></div>;
}
