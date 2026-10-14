'use client';
import type {CSSProperties,ReactNode} from 'react';
import type {TutorialArt} from '@/lib/tutorial/islandTutorial';
import styles from './IslandTutorial.module.css';

/**
 * Island Tutorial scene art, 420×260, drawn in the welcome tour's icon style (PocketArt: HuntBallArt, TipBookArt, CostumeHoodArt,
 * JobsArt): flat, rounded shapes with no outlines, a soft lighter stroke on the top-left and a slightly darker one on the
 * bottom-right, small soft ground shadows, on the tour's light cream paper. The palette is the tour's: #244d40 ink, #2e7867 teal,
 * #f08a2c orange, #f4c64a gold, #fff4dc cream; coins use the app's coin face (--coin-face / --coin-rim in app/globals.css).
 * The still picture is one SVG; each moving shape is its own HTML layer holding a full-scene <svg> (same viewBox, so it lands on
 * the same pixels) animated with a CSS transform — Chrome composites those, where animating SVG children would repaint the whole
 * picture every frame (see JourneyArrivalArt). Only the current scene is mounted, and its loops pause with the tutorial
 * (IslandTutorial.module.css).
 */
const INK='#244d40',DEEP='#24584a',TEAL='#2e7867',TEAL_L='#6fb59c',MINT='#beded1',GRASS='#8ec6a1',GRASS_D='#4f9a74',LEAF='#6f9c55',LEAF_L='#a9cf86',
 ORANGE='#f08a2c',ORANGE_D='#d9772f',PEACH='#ffd29a',CREAM='#fff4dc',WHITE='#fff9ec',PAGE='#f6e7c4',LINE='#c9b58f',GOLD='#f4c64a',GOLD_D='#c9a032',
 SAND='#f1d9a4',SAND_D='#d9b878',WOOD='#b8643a',WOOD_D='#94502e',PINK='#f0b1cc',ARROW='#32775c';
const VB='0 0 420 260',FONT="system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";

/** Shared paint: the coin face (the --coin-face gradient, drawn in SVG) and the football's clip. Duplicate ids resolve to the first. */
const Defs=()=><defs>
 <radialGradient id="tut-coin" cx="35%" cy="35%" r="92%"><stop offset="0" stopColor="#ffe58a"/><stop offset=".6" stopColor="#f2c230"/><stop offset="1" stopColor="#c99a12"/></radialGradient>
 <clipPath id="tut-ball"><circle cx="24" cy="23" r="18"/></clipPath>
</defs>;
function Still({children}:{children:ReactNode}){return <svg className={styles.layer} viewBox={VB} aria-hidden="true"><Defs/>{children}</svg>;}
/** A moving piece; `origin` (viewBox units) is its transform origin, as percentages of the layer (the stage keeps 420:260). */
function Piece({motion,origin=[210,130],delay,children}:{motion:string;origin?:[number,number];delay?:number;children:ReactNode}){
 const style:CSSProperties={transformOrigin:`${(origin[0]/420*100).toFixed(2)}% ${(origin[1]/260*100).toFixed(2)}%`,...(delay?{animationDelay:`${delay}s`}:{})};
 return <div className={`${styles.piece} ${styles[motion]??''}`} style={style}><svg viewBox={VB} aria-hidden="true"><Defs/>{children}</svg></div>;
}
/** The two-tone shading: a soft stroke along an edge (lighter on the top-left, darker on the bottom-right). */
const Stroke=({d,c,w=3,o=1}:{d:string;c:string;w?:number;o?:number})=><path d={d} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={o}/>;
const Shadow=({x,y,rx,ry=3,c=INK,o=.14}:{x:number;y:number;rx:number;ry?:number;c?:string;o?:number})=><ellipse cx={x} cy={y} rx={rx} ry={ry} fill={c} opacity={o}/>;

type Hood=[main:string,dark:string,light:string];
const ORANGE_HOOD:Hood=[ORANGE,ORANGE_D,PEACH],TEAL_HOOD:Hood=[TEAL,DEEP,TEAL_L];
/** The player: the welcome tour's cat-eared hood face (CostumeHoodArt) on a small rounded body. Feet at y+21. */
function Kid({x,y,s=1,shirt=TEAL,hood=ORANGE_HOOD,shadow=true}:{x:number;y:number;s?:number;shirt?:string;hood?:Hood;shadow?:boolean}){
 const [main,dark,light]=hood;
 return <g transform={`translate(${x} ${y}) scale(${s})`}>
  {shadow&&<Shadow x={0} y={21} rx={12}/>}
  <rect x="-7" y="9" width="5.6" height="12" rx="2.8" fill={INK}/><rect x="1.4" y="9" width="5.6" height="12" rx="2.8" fill={INK}/>
  <path d="M-11 12v-5q0-11 11-11t11 11v5q0 3-3 3h-16q-3 0-3-3z" fill={shirt}/>
  <Stroke d="M7.5 2q2 3 2 9" c={INK} w={3} o={.22}/><Stroke d="M-7 3q1-4 4-5.5" c={WHITE} w={2.4} o={.5}/>
  <g transform="translate(0 -14) scale(.62) translate(-24 -26)">
   <path d="M10 18 7 5l11 7zM38 18l3-13-11 7z" fill={dark}/>
   <path d="M11 15.5 9.4 9l5 3.4zM37 15.5l1.6-6.5-5 3.4z" fill={PINK}/>
   <path d="M24 8c11 0 17 8 17 18v15c0 2-2 3-4 3H11c-2 0-4-1-4-3V26C7 16 13 8 24 8z" fill={main}/>
   <ellipse cx="24" cy="27" rx="11" ry="10.5" fill={CREAM}/>
   <circle cx="19.5" cy="26" r="1.8" fill={INK}/><circle cx="28.5" cy="26" r="1.8" fill={INK}/>
   <path d="M21 31c1.8 1.6 4.2 1.6 6 0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round"/>
   <path d="M12 17c2-4 5-6 9-7" stroke={light} strokeWidth="3" fill="none" strokeLinecap="round"/>
  </g>
 </g>;
}
/** The welcome tour's football (HuntBallArt), centred on x,y with radius r. */
function Ball({x,y,r=9,shadow=false}:{x:number;y:number;r?:number;shadow?:boolean}){
 const k=r/18;
 return <>{shadow&&<ellipse cx={x} cy={y+r+2} rx={r*.8} ry={r*.15+1} fill={LEAF} opacity=".55"/>}<g transform={`translate(${x} ${y}) scale(${k}) translate(-24 -23)`}>
  <circle cx="24" cy="23" r="18" fill={WHITE}/>
  <g clipPath="url(#tut-ball)">
   <path d="M8 30c5 9 18 12 28 6" stroke="#d9cdb0" strokeWidth="5" fill="none" strokeLinecap="round"/>
   <path d="M24 16l7.1 5.2-2.7 8.3h-8.8l-2.7-8.3z" fill={INK}/>
   <path d="M24 16V8.5M31.1 21.2l7.2-2.3M28.4 29.5l4.4 6.1M19.6 29.5l-4.4 6.1M16.9 21.2l-7.2-2.3" stroke={INK} strokeWidth="2.2" strokeLinecap="round"/>
   <path d="M18.5 1.5h11L31 8.5l-7 3-7-3z" fill={INK}/>
   <path d="M39 13l6 2 1 9-6 1-3.2-6.3z" fill={INK}/><path d="M9 13l-6 2-1 9 6 1 3.2-6.3z" fill={INK}/>
   <path d="M35.5 34.5l5 .5-2 9-7 1-.6-6.5z" fill={INK}/><path d="M12.5 34.5l-5 .5 2 9 7 1 .6-6.5z" fill={INK}/>
  </g>
  <path d="M12 16c2-4.5 6-7.5 11-8.4" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".9"/>
 </g></>;
}
/** The app's coin: the --coin-face gradient with the --coin-rim inner ring. */
const Coin=({x,y,r=9}:{x:number;y:number;r?:number})=><g transform={`translate(${x} ${y})`}><circle r={r} fill="url(#tut-coin)"/><circle r={r-1} fill="none" stroke="rgb(150,110,0)" strokeOpacity=".35" strokeWidth="2"/></g>;
/** The welcome tour's open book with a gold star (TipBookArt), scaled. */
const Book=({x,y,s=1,star=true}:{x:number;y:number;s?:number;star?:boolean})=><g transform={`translate(${x} ${y}) scale(${s}) translate(-24 -26)`}>
 <path d="M4 14c7-2 14-1 20 3 6-4 13-5 20-3v26c-7-2-14-1-20 3-6-4-13-5-20-3z" fill={TEAL}/>
 <path d="M7 13c6-1.6 12-.6 17 3v24c-5-3.4-11-4.4-17-3z" fill={CREAM}/>
 <path d="M41 13c-6-1.6-12-.6-17 3v24c5-3.4 11-4.4 17-3z" fill={PAGE}/>
 <path d="M24 16v24" stroke={LINE} strokeWidth="1.6"/>
 <path d="M11 22c3-.6 6-.3 9 1M11 27.5c3-.6 6-.3 9 1M11 33c3-.6 6-.3 9 1M28 28.5c3-1.3 6-1.6 9-1M28 34c3-1.3 6-1.6 9-1" stroke={LINE} strokeWidth="2" fill="none" strokeLinecap="round"/>
 {star&&<Star x={33} y={13.5} r={6.6}/>}
</g>;
/** The tour's gold star (stroke #c9a032, 1 unit at icon size). */
function Star({x,y,r=8}:{x:number;y:number;r?:number}){
 const k=r/6.6;
 return <path transform={`translate(${x} ${y}) scale(${k}) translate(-33 -13.5)`} d="m33 7 2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7z" fill={GOLD} stroke={GOLD_D} strokeWidth={1/k*1.2} strokeLinejoin="round"/>;
}
/** A key cap: cream face on a soft darker edge (the tour's path stops: `box-shadow:0 4px 0 edge`). */
function Key({x,y,label,w=26}:{x:number;y:number;label:string;w?:number}){
 return <g transform={`translate(${x} ${y})`}><rect x="0" y="3.5" width={w} height="24" rx="7" fill={LINE}/><rect x="0" y="0" width={w} height="24" rx="7" fill={CREAM}/><Stroke d={`M5 5.5h${Math.max(4,w-14)}`} c={WHITE} w={2} o={.9}/><text x={w/2} y="16.5" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="12" fill={INK}>{label}</text></g>;
}
const Label=({x,y,children,anchor='middle',size=11,fill=INK}:{x:number;y:number;children:ReactNode;anchor?:'start'|'middle'|'end';size?:number;fill?:string})=><text x={x} y={y} textAnchor={anchor} fontFamily={FONT} fontWeight="800" fontSize={size} letterSpacing="1.2" fill={fill}>{children}</text>;
/** Calm sea: a soft teal band with a few mint ripples. */
const Sea=({y=190}:{y?:number})=><><path d={`M0 ${y}Q105 ${y-8} 210 ${y}T420 ${y}V260H0Z`} fill={TEAL_L}/>{[[30,y+22],[140,y+38],[260,y+20],[350,y+42]].map(([x,yy],i)=><Stroke key={i} d={`M${x} ${yy}q12-6 24 0t24 0`} c={MINT} w={3.5} o={.9}/>)}</>;
const Sun=()=><Piece motion="pulse" origin={[360,48]}><circle cx="360" cy="48" r="34" fill={GOLD} opacity=".22"/><circle cx="360" cy="48" r="24" fill={GOLD}/><Stroke d="M346 40q4-8 12-10" c="#ffe58a" w={4}/><Stroke d="M372 58q-4 5-10 7" c={GOLD_D} w={3.5} o={.5}/></Piece>;
const Cloud=({x,y,s=1}:{x:number;y:number;s?:number})=><g transform={`translate(${x} ${y}) scale(${s})`}><path d="M-26 8q-12 0-12-10t13-10q4-12 18-12t18 12q14 0 14 10t-12 10z" fill={MINT}/><Stroke d="M-28-4q2-6 8-7" c={WHITE} w={3} o={.8}/></g>;
/** Settings gear in a round cream button (the HUD's face). */
const Gear=({x,y}:{x:number;y:number})=><g transform={`translate(${x} ${y})`}><circle cy="3" r="16" fill={LINE}/><circle r="16" fill={CREAM}/><path d="M0-10.5v3M0 7.5v3M-10.5 0h3M7.5 0h3M-7.4-7.4l2.1 2.1M5.3 5.3l2.1 2.1M-7.4 7.4l2.1-2.1M5.3-5.3l2.1-2.1" stroke={INK} strokeWidth="3.6" strokeLinecap="round"/><circle r="6" fill="none" stroke={INK} strokeWidth="3.2"/></g>;

function Island(){return <>
 <Still><Sea y={184}/><Shadow x={150} y={204} rx={112} ry={12} c={TEAL} o={.3}/>
  <path d="M48 180Q30 120 104 110Q150 70 210 124Q280 150 214 196Q110 246 48 180Z" fill={SAND}/><Stroke d="M74 198Q132 220 204 192" c={SAND_D} w={6} o={.7}/>
  <path d="M72 166Q60 120 116 128Q150 100 184 142Q222 166 180 182Q104 210 72 166" fill={GRASS}/><Stroke d="M92 180Q140 194 184 174" c={GRASS_D} w={5} o={.45}/><Stroke d="M82 146Q94 128 116 132" c={LEAF_L} w={4}/>
  <path d="M110 184Q150 172 138 152T190 140" fill="none" stroke={CREAM} strokeWidth="8" strokeLinecap="round"/>
  <path d="M250 214Q300 200 360 212" fill="none" stroke={MINT} strokeWidth="4" strokeLinecap="round" strokeDasharray="3 10"/>
  <Shadow x={330} y={184} rx={17} ry={3.5} c={TEAL} o={.45}/><Ball x={330} y={158} r={20}/><Cloud x={260} y={60} s={.8}/><Gear x={392} y={226}/></Still>
 <Sun/>
 <Piece motion="sway" origin={[134,138]}><path d="M134 138v-38" stroke={INK} strokeWidth="3" strokeLinecap="round"/><path d="M135.5 100l26 9.5-26 10z" fill={ORANGE}/><Stroke d="M139 104l11 4" c={PEACH} w={2.4}/></Piece>
 <Piece motion="hop" origin={[160,150]}><Kid x={160} y={148} s={.85}/></Piece>
</>;}

function Walk(){return <>
 <Still><path d="M0 116Q110 92 210 110T420 98V260H0Z" fill={GRASS}/><Stroke d="M24 116Q100 98 180 110" c={LEAF_L} w={4} o={.9}/>
  <path d="M120 203Q180 123 250 163T380 123" fill="none" stroke={GRASS_D} strokeWidth="16" strokeLinecap="round" opacity=".3"/><path d="M120 200Q180 120 250 160T380 120" fill="none" stroke={CREAM} strokeWidth="16" strokeLinecap="round"/><path d="M120 200Q180 120 250 160T380 120" fill="none" stroke={ARROW} strokeWidth="3" strokeLinecap="round" strokeDasharray="2 11" opacity=".55"/>
  <circle cx="60" cy="200" r="38" fill={GRASS_D} opacity=".45"/><circle cx="60" cy="196" r="38" fill={CREAM} opacity=".92"/><Stroke d="M32 180q8-14 22-17" c={WHITE} w={3}/><Label x={60} y={252}>PHONE</Label>
  <Key x={306} y={174} label="W"/><Key x={278} y={204} label="A"/><Key x={306} y={204} label="S"/><Key x={334} y={204} label="D"/><Key x={366} y={204} label="⇧" w={34}/><Label x={340} y={252}>COMPUTER</Label>
  {[[200,230],[240,90],[30,140],[396,160]].map(([x,y],i)=><path key={i} d={`M${x-6} ${y}q2-8 6-10M${x} ${y}v-11M${x+6} ${y}q-2-8-6-10`} stroke={LEAF} strokeWidth="2.6" fill="none" strokeLinecap="round"/>)}
  <Cloud x={300} y={46} s={.7}/></Still>
 <Piece motion="stick" origin={[60,196]}><circle cx="60" cy="199" r="17" fill={GOLD_D}/><circle cx="60" cy="196" r="17" fill={GOLD}/><Stroke d="M50 190q3-6 10-7" c="#ffe58a" w={3.4}/></Piece>
 <Piece motion="keyPress" origin={[319,186]}><rect x="306" y="174" width="26" height="24" rx="7" fill={ORANGE}/><Stroke d="M311 179.5h12" c={PEACH} w={2}/><text x="319" y="190.5" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="12" fill={WHITE}>W</text></Piece>
 <Piece motion="walkPath" origin={[130,180]}><Kid x={130} y={174}/></Piece>
</>;}

const Wheel=({x,y,r=5}:{x:number;y:number;r?:number})=><><circle cx={x} cy={y} r={r} fill={INK}/><circle cx={x} cy={y} r={r*.36} fill={CREAM}/></>;
const RIDES:[string,ReactNode][]=[
 ['WALK',<Kid key="w" x={0} y={-5} s={.62} shadow={false}/>],
 ['SCOOTER',<g key="s"><path d="M-14 10h22l6-23M11-13h8" fill="none" stroke={TEAL} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/><Wheel x={-12} y={12}/><Wheel x={14} y={12}/></g>],
 ['BIKE',<g key="b"><circle cx="-12" cy="8" r="8.5" fill="none" stroke={INK} strokeWidth="3"/><circle cx="13" cy="8" r="8.5" fill="none" stroke={INK} strokeWidth="3"/><path d="M-12 8l9-14h12l4 14M-3-6l-2-6" fill="none" stroke={ORANGE} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M-9-13h8" stroke={INK} strokeWidth="3" strokeLinecap="round"/></g>],
 ['MOPED',<g key="m"><path d="M-17 6q0-14 16-14h10l7 14z" fill={ORANGE}/><Stroke d="M-11-1q3-4 9-4.5" c={PEACH} w={2.6}/><Stroke d="M12 4l-3-6" c={ORANGE_D} w={2.6} o={.8}/><Wheel x={-11} y={10}/><Wheel x={13} y={10}/></g>],
 ['JETPACK',<g key="j"><path d="M-6 9l-3.5 10 3.5-3 3.5 3zM6 9l-3.5 10 3.5-3 3.5 3z" fill={ORANGE}/><path d="M-6 10l-1.6 5 1.6-1.4 1.6 1.4zM6 10l-1.6 5 1.6-1.4 1.6 1.4z" fill={PEACH}/><rect x="-11" y="-15" width="9" height="24" rx="4.5" fill={GOLD}/><rect x="2" y="-15" width="9" height="24" rx="4.5" fill={GOLD}/><Stroke d="M-8.5-11v6M4.5-11v6" c="#ffe58a" w={2.2}/><Stroke d="M-4.5 2v4M8.5 2v4" c={GOLD_D} w={2.2} o={.7}/></g>]];
function Ride(){return <>
 <Still><path d="M0 182Q210 168 420 182V210H0Z" fill={GRASS}/><Stroke d="M20 182Q120 172 220 175" c={LEAF_L} w={4}/><path d="M0 200Q210 190 420 200V260H0Z" fill={DEEP}/><path d="M0 230Q210 222 420 230" fill="none" stroke={CREAM} strokeWidth="4" strokeLinecap="round" strokeDasharray="20 18" opacity=".75"/>
  <path d="M96 104h18M170 104h18M244 104h18M318 104h18" stroke={ARROW} strokeWidth="3" strokeLinecap="round" strokeDasharray="1 6"/>
  {RIDES.map(([name,icon],i)=><g key={name} transform={`translate(${62+i*74} 104) scale(.88)`}><circle cy="4" r="28" fill={i===1?GOLD_D:LINE}/><circle r="28" fill={i===1?GOLD:CREAM}/><Stroke d="M-19-12q5-10 15-14" c={i===1?'#ffe58a':WHITE} w={3}/>{icon}<text y="50" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="10" letterSpacing="1" fill={INK}>{name}</text></g>)}
  <Key x={258} y={14} label="R"/><Key x={300} y={14} label="SPACE" w={58}/><Key x={364} y={14} label="J"/></Still>
 <Piece motion="drift" origin={[210,192]}><g transform="translate(200 174)"><path d="M-22 22h34l9-36M18-15h10" fill="none" stroke={TEAL} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><Wheel x={-20} y={25} r={6}/><Wheel x={18} y={25} r={6}/></g><Kid x={196} y={172} s={.9} shadow={false}/></Piece>
</>;}

/** A rounded house: wall with a lighter left edge and darker right edge, a roof, and gold windows. */
function House({x,y,w,h,wall,roof,windows=[]}:{x:number;y:number;w:number;h:number;wall:string;roof?:string;windows?:[number,number][]}){
 return <g><rect x={x} y={y} width={w} height={h} rx="6" fill={wall}/><rect x={x+w-7} y={y+4} width="5" height={h-8} rx="2.5" fill={INK} opacity=".12"/><Stroke d={`M${x+4} ${y+8}v${Math.max(6,h-20)}`} c={WHITE} w={2.6} o={.45}/>
  {roof&&<path d={`M${x-5} ${y+2}Q${x+w/2} ${y-26} ${x+w+5} ${y+2}z`} fill={roof}/>}
  {windows.map(([wx,wy],i)=><rect key={i} x={x+wx} y={y+wy} width="11" height="12" rx="3" fill={GOLD}/>)}</g>;
}
function Fly(){return <>
 <Still><Cloud x={210} y={46} s={.8}/><Cloud x={64} y={70} s={.6}/><Sea y={224}/>
  <House x={20} y={164} w={50} h={60} wall={SAND} roof={ORANGE} windows={[[10,14],[29,14],[10,36]]}/>
  <House x={80} y={132} w={56} h={92} wall={SAND_D} windows={[[10,14],[33,14],[10,38],[33,38],[10,62]]}/>
  <House x={150} y={180} w={44} h={44} wall={PINK} roof={TEAL_L} windows={[[8,14],[25,14]]}/>
  <House x={330} y={176} w={70} h={48} wall={SAND} windows={[[12,18],[47,18]]}/>
  <path d="M110 120Q200 20 300 80T340 166" fill="none" stroke={ARROW} strokeWidth="3" strokeLinecap="round" strokeDasharray="1 9" opacity=".6"/>
  <ellipse cx="365" cy="175" rx="20" ry="5" fill={GOLD} opacity=".55"/><path d="M355 166l20 18M375 166l-20 18" stroke={ORANGE} strokeWidth="4.5" strokeLinecap="round"/><Label x={365} y={152} size={10}>LAND HERE</Label></Still>
 <Piece motion="rise" origin={[108,110]}><path d="M99 128l-4 16 5-4 5 4-4-16z" fill={ORANGE}/><path d="M115 128l-4 16 5-4 5 4-4-16z" fill={ORANGE}/><path d="M100 130l-1.6 6 1.6-1.2 1.6 1.2zM116 130l-1.6 6 1.6-1.2 1.6 1.2z" fill={PEACH}/><rect x="95" y="104" width="8" height="24" rx="4" fill={GOLD}/><rect x="113" y="104" width="8" height="24" rx="4" fill={GOLD}/><Kid x={108} y={104} s={.75} shadow={false}/></Piece>
 <Piece motion="glide" origin={[290,90]}><path d="M256 72l34 30M324 72l-34 30M290 72v30" stroke={INK} strokeWidth="1.6" opacity=".55"/><path d="M250 72q40-48 80 0q-10-6-20 0q-10-7-20 0q-10-7-20 0q-10-6-20 0z" fill={ORANGE}/><path d="M290 36q-10 14-10 34q10-7 20 0q0-20-10-34z" fill={PEACH}/><Stroke d="M260 58q8-12 20-17" c={WHITE} w={3} o={.6}/><Kid x={290} y={110} s={.6} shadow={false}/></Piece>
</>;}

function MapScene(){return <>
 <Still><Shadow x={212} y={236} rx={150} ry={9} o={.12}/><g transform="rotate(-4 210 140)"><rect x="70" y="44" width="280" height="190" rx="14" fill={LINE}/><rect x="70" y="40" width="280" height="190" rx="14" fill={WHITE}/>
  <rect x="84" y="54" width="252" height="162" rx="10" fill={TEAL_L}/>{[[100,74],[290,80],[110,200]].map(([x,y],i)=><Stroke key={i} d={`M${x} ${y}q8-5 16 0t16 0`} c={MINT} w={3}/>)}
  <path d="M110 170Q100 90 190 90Q280 70 300 140Q300 200 200 200Q120 210 110 170Z" fill={SAND}/><Stroke d="M130 192Q190 210 270 186" c={SAND_D} w={5} o={.7}/><path d="M140 160Q150 112 200 116Q250 110 262 150Q240 180 190 178Z" fill={GRASS}/><Stroke d="M152 136Q166 118 190 118" c={LEAF_L} w={4}/>
  <ellipse cx="318" cy="198" rx="20" ry="11" fill={SAND}/><path d="M150 168Q220 140 300 196" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeDasharray="1 7" opacity=".6"/>
  <path d="M163 44v186M256 44v186" stroke={LINE} strokeWidth="2" opacity=".35"/>
  {[[160,140,'J'],[214,124,'F'],[244,160,'V']].map(([x,y,m])=><g key={String(m)} transform={`translate(${x} ${y})`}><circle cy="2.5" r="10" fill={LINE}/><circle r="10" fill={CREAM}/><text y="4.5" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="11" fill={INK}>{m}</text></g>)}</g>
  <Key x={378} y={14} label="M"/></Still>
 <Piece motion="bob" origin={[300,180]}><Shadow x={300} y={194} rx={7} ry={2.4} o={.22}/><path d="M300 192c-12-14-14-20-14-26a14 14 0 0 1 28 0c0 6-2 12-14 26z" fill={ORANGE}/><Stroke d="M290 160q3-6 9-7" c={PEACH} w={2.6}/><circle cx="300" cy="165" r="5" fill={WHITE}/></Piece>
</>;}

function Jobs(){return <>
 <Still><path d="M0 76Q210 60 420 76V260H0Z" fill={GRASS}/>{[0,1,2].map(i=><rect key={i} x={i*140+70} y="72" width="70" height="188" fill={LEAF_L} opacity=".25"/>)}<Stroke d="M20 78Q120 66 200 68" c={LEAF_L} w={4}/>
  <path d="M210 70v190" stroke={CREAM} strokeWidth="4" opacity=".75"/><circle cx="210" cy="196" r="44" fill="none" stroke={CREAM} strokeWidth="4" opacity=".75"/>
  <Shadow x={70} y={196} rx={22} ry={4} c={LEAF} o={.55}/><rect x="66" y="136" width="9" height="60" rx="4.5" fill={WOOD}/><Stroke d="M73 142v48" c={WOOD_D} w={2.4} o={.6}/>
  <g transform="translate(70 104) scale(1.8) translate(-24 -24)">
   <rect x="8" y="7" width="30" height="37" rx="4" fill={WOOD}/><rect x="11.5" y="11" width="23" height="29.5" rx="2" fill={CREAM}/><rect x="16" y="4.5" width="14" height="7" rx="2.5" fill="#d9a93c"/><circle cx="23" cy="8" r="1.6" fill={INK}/>
   <path d="M15 19l2.6 2.6L22 17" stroke={GRASS_D} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M25 19.5h6.5M15 27h8M15 33h6" stroke={LINE} strokeWidth="2.4" strokeLinecap="round"/>
   <path d="M36.5 25 43 42h-13z" fill={ORANGE}/><path d="M33.4 34h6.2" stroke={CREAM} strokeWidth="2.6" strokeLinecap="round"/><rect x="28" y="41" width="17" height="3.4" rx="1.7" fill={ORANGE_D}/>
  </g>
  <rect x="48" y="160" width="44" height="20" rx="10" fill={GOLD}/><text x="70" y="174" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="11" letterSpacing="1" fill={INK}>JOB</text>
  {[[300,200],[322,214],[342,198],[290,222],[356,222]].map(([x,y],i)=><path key={i} d={`M${x} ${y}q8-10 16 0q-8 8-16 0z`} fill={[ORANGE,GOLD,ORANGE_D][i%3]}/>)}
  <rect x="266" y="13" width="140" height="40" rx="20" fill={INK} opacity=".2"/><rect x="266" y="10" width="140" height="40" rx="20" fill={DEEP}/><Coin x={290} y={30} r={11}/><text x="310" y="37" fontFamily={FONT} fontWeight="800" fontSize="18" fill={CREAM}>24</text><text x="338" y="36" fontFamily={FONT} fontWeight="700" fontSize="12" fill={MINT}>coins</text></Still>
 <Piece motion="sway" origin={[256,214]}><path d="M226 140l30 74" stroke={WOOD} strokeWidth="5" strokeLinecap="round"/><g transform="rotate(21 256 214)"><rect x="240" y="210" width="34" height="8" rx="4" fill={WOOD_D}/><path d="M244 218v6M252 218v6M260 218v6M268 218v6" stroke={WOOD_D} strokeWidth="2.6" strokeLinecap="round"/></g><Kid x={226} y={168}/></Piece>
 <Piece motion="coinUp" origin={[260,110]}><Coin x={260} y={110}/></Piece>
 <Piece motion="coinUp2" origin={[290,100]}><Coin x={290} y={100}/></Piece>
 <Piece motion="coinUp3" origin={[320,112]}><Coin x={320} y={112}/></Piece>
</>;}

const Fruit=({x,y,r=6,c=ORANGE}:{x:number;y:number;r?:number;c?:string})=><><circle cx={x} cy={y} r={r} fill={c}/><Stroke d={`M${x-r*.5} ${y-r*.25}q${r*.2}-${r*.45} ${r*.6}-${r*.55}`} c={PEACH} w={Math.max(1.4,r*.3)}/></>;
function Fishing(){return <>
 <Still><Cloud x={200} y={46} s={.7}/><Sea y={128}/><Shadow x={250} y={210} rx={90} ry={22} c={TEAL} o={.22}/>
  <path d="M286 118Q350 104 420 110V140Q350 132 286 140Z" fill={SAND}/><Stroke d="M300 134Q350 128 410 132" c={SAND_D} w={4} o={.6}/>
  <path d="M30 122v40M110 122v40" stroke={WOOD_D} strokeWidth="7" strokeLinecap="round"/><rect x="-6" y="100" width="156" height="22" rx="6" fill={WOOD}/><Stroke d="M4 105h136" c="#d4875a" w={3}/><path d="M40 103v16M80 103v16M120 103v16" stroke={WOOD_D} strokeWidth="2" opacity=".5"/>
  <path d="M126 60Q220 40 270 136" fill="none" stroke={INK} strokeWidth="1.5" opacity=".7"/><path d="M106 96L128 58" stroke={WOOD} strokeWidth="5" strokeLinecap="round"/>
  <g transform="translate(330 20)"><Shadow x={40} y={92} rx={44} ry={4} c={SAND_D} o={.7}/><rect x="0" y="30" width="80" height="60" rx="6" fill={WHITE}/><rect x="72" y="34" width="5" height="52" rx="2.5" fill={INK} opacity=".1"/>
   <path d="M-6 32l10-24h72l10 24z" fill={ORANGE}/><path d="M12 8l-4 24h14l2-24zM40 8v24h14l-2-24z" fill={CREAM}/><path d="M-6 32q7 8 13 0t15 0 14 0 14 0 14 0 15 0 7 0" fill={ORANGE}/>
   <text x="40" y="56" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="12" letterSpacing="1" fill={INK}>ROSA</text>
   <rect x="6" y="64" width="68" height="20" rx="5" fill={PAGE}/><Fruit x={18} y={72} r={6}/><Fruit x={31} y={73} r={5.5} c={GOLD}/><path d="M44 73q8-7 18 0q-10 7-18 0zM62 73l7-5v10z" fill={TEAL}/></g></Still>
 <Still><Kid x={100} y={79}/></Still>
 <Piece motion="drift" origin={[230,200]}><path d="M200 200q20-14 46 0q-26 14-46 0zM246 200l14-9v18z" fill={TEAL} opacity=".55"/></Piece>
 <Piece motion="bob" origin={[270,140]}><Shadow x={270} y={146} rx={11} ry={2.6} c={TEAL} o={.5}/><circle cx="270" cy="140" r="8" fill={WHITE}/><path d="M262 140a8 8 0 0 1 16 0z" fill={ORANGE}/><Stroke d="M265.5 136q1.5-2.6 4-3.2" c={PEACH} w={1.8}/></Piece>
 <Piece motion="pulse" origin={[305,107]}><rect x="276" y="97" width="58" height="26" rx="13" fill={GOLD_D}/><rect x="276" y="94" width="58" height="26" rx="13" fill={GOLD}/><text x="305" y="111.5" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="12" fill={INK}>HOOK!</text></Piece>
</>;}

function Spend(){return <>
 <Still><path d="M0 214Q210 204 420 214V260H0Z" fill={GRASS}/><Stroke d="M20 214Q100 207 180 208" c={LEAF_L} w={4}/>
  <g transform="translate(48 0)"><Shadow x={205} y={221} rx={74} ry={5} c={LEAF} o={.6}/><rect x="140" y="20" width="130" height="200" rx="16" fill={ORANGE}/><rect x="256" y="30" width="8" height="180" rx="4" fill={ORANGE_D} opacity=".8"/><Stroke d="M147 34v60" c={PEACH} w={3}/>
   <rect x="152" y="34" width="106" height="130" rx="9" fill={WHITE}/>
   {[0,1,2,3].map(r=>[0,1,2].map(c=><g key={`${r}${c}`} transform={`translate(${170+c*35} ${52+r*31})`}>
    {r===0?<g><rect x="-9" y="-11" width="18" height="22" rx="3" fill={c===1?GOLD:TEAL}/><Stroke d="M-5-7v5" c={WHITE} w={1.6} o={.6}/></g>:r===1?<Ball x={0} y={0} r={9}/>:r===2?<g><path d="M-10 6h14l4-14" fill="none" stroke={c===1?ORANGE:TEAL} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="-8" cy="7.5" r="3.2" fill={INK}/><circle cx="7" cy="7.5" r="3.2" fill={INK}/></g>:<Book x={0} y={1} s={.46} star={c===1}/>}
    <rect x="-14" y="13" width="28" height="3" rx="1.5" fill={LINE} opacity=".7"/></g>))}
   <rect x="160" y="176" width="90" height="28" rx="8" fill={DEEP}/><Stroke d="M168 184h30" c={TEAL_L} w={2.4} o={.6}/><rect x="244" y="100" width="14" height="5" rx="2.5" fill={INK}/></g>
  <Label x={176} y={246} size={10}>CARDS · BALLS · RIDES · BOOKS</Label></Still>
 <Piece motion="coinUp" origin={[110,90]}><Coin x={110} y={90}/></Piece>
 <Piece motion="bobSlow" origin={[364,150]}><Shadow x={364} y={184} rx={26} ry={3.5} c={LEAF} o={.6}/><path d="M354 102q10-18 20 0" fill="none" stroke={DEEP} strokeWidth="4" strokeLinecap="round"/><path d="M338 120q0-26 26-26t26 26v52q0 6-6 6h-40q-6 0-6-6z" fill={TEAL}/><Stroke d="M345 116q3-12 13-16" c={TEAL_L} w={3}/><Stroke d="M384 122v46" c={DEEP} w={3.5} o={.6}/><rect x="347" y="138" width="34" height="26" rx="7" fill={GOLD}/><Stroke d="M352 145h12" c="#ffe58a" w={2.2}/><Label x={364} y={200} size={10}>BACKPACK</Label></Piece>
</>;}

function Arcade(){return <>
 <Still><path d="M0 214Q210 206 420 214V260H0Z" fill={DEEP}/><Stroke d="M20 222Q120 215 220 216" c={TEAL} w={4}/>
  <path d="M0 26Q105 44 210 26T420 26" fill="none" stroke={LINE} strokeWidth="1.6" opacity=".7"/>{[30,80,130,180,240,290,340].map((x,i)=><circle key={x} cx={x} cy={26+Math.sin(x/66.8*Math.PI)*8} r="4.5" fill={[GOLD,ORANGE,TEAL_L][i%3]}/>)}
  {[50,160,270].map((x,i)=><g key={x} transform={`translate(${x} 50)`}><Shadow x={50} y={170} rx={54} ry={5} o={.22}/><path d="M0 168V22Q0 0 22 0h56q22 0 22 22v146q0 4-4 4H4q-4 0-4-4z" fill={[ORANGE,GOLD,TEAL][i]}/>
   <rect x="88" y="10" width="7" height="154" rx="3.5" fill={INK} opacity=".12"/><Stroke d="M7 24q2-14 15-16" c={[PEACH,'#ffe58a',TEAL_L][i]} w={3}/>
   <rect x="12" y="20" width="76" height="58" rx="9" fill="#1f3f36"/><rect x="10" y="94" width="80" height="16" rx="8" fill={CREAM}/><circle cx="30" cy="102" r="4.5" fill={ORANGE}/><circle cx="70" cy="102" r="4.5" fill={TEAL}/></g>)}
  {[100,210,320].map((x,i)=><g key={x}><rect x={x-34} y="155" width="68" height="18" rx="9" fill={WHITE}/><text x={x} y="167.5" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="10" fill={INK}>{['STRIKERS','PINBALL','PUZZLES'][i]}</text></g>)}
  <path d="M84 120h32" stroke={GRASS} strokeWidth="3" strokeLinecap="round" opacity=".6"/>
  <g transform="translate(388 64)"><Coin x={0} y={0} r={12}/><text x="0" y="32" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="16" fill={INK}>×3</text></g></Still>
 <Piece motion="hop" origin={[100,112]}><Ball x={100} y={106} r={8}/></Piece>
 <Piece motion="blink" origin={[210,99]}><Star x={210} y={99} r={13}/></Piece>
 <Piece motion="pulse" origin={[320,99]}><path d="M296 112l20-26 10 12 18-20" fill="none" stroke={MINT} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="344" cy="78" r="4.5" fill={PINK}/></Piece>
</>;}

function Explore(){return <>
 <Still><Cloud x={236} y={44} s={.7}/><Sea y={204}/><path d="M30 210Q120 60 210 90Q300 60 400 210z" fill={GRASS}/><Stroke d="M60 186Q110 104 170 92" c={LEAF_L} w={5}/><Stroke d="M300 120Q360 160 380 200" c={GRASS_D} w={6} o={.4}/>
  <path d="M150 120Q210 100 270 120" fill="none" stroke={CREAM} strokeWidth="6" strokeLinecap="round"/>
  <g transform="translate(300 96)"><Shadow x={0} y={35} rx={14} ry={3} c={GRASS_D} o={.5}/><path d="M0 0l-10 34M0 0l10 34M0 0v34" stroke={INK} strokeWidth="3" strokeLinecap="round"/><g transform="rotate(-16)"><rect x="-26" y="-15" width="44" height="13" rx="6.5" fill={GOLD}/><rect x="14" y="-17" width="8" height="17" rx="4" fill={GOLD_D}/><Stroke d="M-21-11h22" c="#ffe58a" w={2.4}/></g></g>
  <Label x={210} y={248} size={11}>SUMMIT ISLE</Label></Still>
 <Piece motion="sway" origin={[100,170]}><Shadow x={100} y={171} rx={18} ry={3.5} c={GRASS_D} o={.5}/><path d="M100 170v-40" stroke={WOOD} strokeWidth="7" strokeLinecap="round"/><circle cx="100" cy="116" r="27" fill={LEAF}/><Stroke d="M80 108q4-12 16-15" c={LEAF_L} w={4}/><Stroke d="M118 128q-4 7-12 10" c={GRASS_D} w={4} o={.5}/><Fruit x={90} y={114} r={5.5}/><Fruit x={110} y={124} r={5.5}/><Fruit x={106} y={102} r={5} c={GOLD}/></Piece>
 <Piece motion="peek" origin={[142,190]}><Ball x={142} y={188} r={10}/></Piece>
 <Still><path d="M118 202q4-24 24-24t26 24z" fill={LEAF}/><Stroke d="M126 194q4-9 13-11" c={LEAF_L} w={3}/></Still>
 <Piece motion="blink" origin={[360,40]}><Star x={360} y={40} r={13}/></Piece>
 <Still><Kid x={240} y={108} s={.8}/></Still>
</>;}

function Museum(){return <>
 <Still><circle cx="210" cy="150" r="140" fill={MINT} opacity=".75"/><path d="M0 222Q210 214 420 222V260H0Z" fill={GRASS}/><Stroke d="M20 224Q110 218 200 218" c={LEAF_L} w={4}/>
  <Shadow x={210} y={224} rx={150} ry={5} o={.14}/>
  <path d="M68 92L210 30l142 62z" fill={WHITE}/><Stroke d="M100 82L210 36" c={CREAM} w={3}/><path d="M76 88h268" stroke={LINE} strokeWidth="3" opacity=".6"/><text x="210" y="78" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="11" letterSpacing="2" fill={INK}>HISTORY MUSEUM</text>
  <rect x="78" y="90" width="264" height="14" rx="4" fill={PAGE}/>{[96,140,264,308].map(x=><g key={x}><rect x={x} y="104" width="16" height="104" rx="3" fill={WHITE}/><rect x={x+11} y="106" width="4" height="100" rx="2" fill={LINE} opacity=".6"/></g>)}<rect x="68" y="208" width="284" height="14" rx="4" fill={PAGE}/>
  <path d="M170 208v-80q0-16 16-16h48q16 0 16 16v80z" fill={DEEP}/>
  <g transform="translate(40 150)"><Shadow x={20} y={42} rx={20} ry={3}/><path d="M0 40v-36q0-4 4-4h6q4 0 4 4l1 20q20 4 21 12v4z" fill={ORANGE}/><Stroke d="M4 6v14" c={PEACH} w={2.6}/><path d="M0 40h36" stroke={INK} strokeWidth="3" strokeLinecap="round"/></g>
  <Book x={372} y={180} s={.95}/><Label x={372} y={216} size={9}>RULES 1863</Label></Still>
 <Piece motion="pulse" origin={[210,165]}><path d="M194 132h32v10q0 20-16 24q-16-4-16-24zM205 164h10v10h8v8h-26v-8h8z" fill={GOLD}/><path d="M194 136h-6q0 12 9 14M226 136h6q0 12-9 14" fill="none" stroke={GOLD} strokeWidth="3"/><Stroke d="M200 138q0 12 5 18" c="#ffe58a" w={3}/><Stroke d="M220 140q-1 10-5 15" c={GOLD_D} w={2.6} o={.6}/></Piece>
 <Piece motion="hop" origin={[150,226]}><Kid x={150} y={207} s={.7}/></Piece>
</>;}

function People(){return <>
 <Still><circle cx="325" cy="110" r="120" fill={MINT} opacity=".75"/><path d="M0 210Q210 200 420 210V260H0Z" fill={SAND}/><Stroke d="M20 212Q100 205 180 206" c={WHITE} w={3.5} o={.7}/>
  <g transform="translate(250 30)"><Shadow x={75} y={182} rx={84} ry={5} o={.14}/><rect x="0" y="22" width="150" height="160" rx="8" fill={WHITE}/><rect x="140" y="30" width="6" height="146" rx="3" fill={LINE} opacity=".6"/>
   <rect x="-6" y="0" width="162" height="30" rx="10" fill={DEEP}/><text x="75" y="20" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="14" letterSpacing="2" fill={CREAM}>KIT SHOP</text>
   <path d="M40 60l14-8h12q4 8 12 0h12l14 8-8 14-8-4v44H56V70l-8 4z" fill={ORANGE} strokeLinejoin="round"/><Stroke d="M60 72v28" c={PEACH} w={3}/><text x="77" y="100" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="18" fill={WHITE}>10</text>
   <Ball x={40} y={160} r={12} shadow/><path d="M86 168v-12q0-3 3-3h5q3 0 3 3l1 6q14 2 14 6z" fill={GOLD}/><path d="M86 168h26" stroke={INK} strokeWidth="2.6" strokeLinecap="round"/></g>
  <Key x={20} y={222} label="E"/><Label x={54} y={239} anchor="start" size={11}>TALK</Label></Still>
 <Still><Kid x={70} y={176}/></Still>
 <Piece motion="bob" origin={[150,170]}><Kid x={150} y={176} shirt={GOLD} hood={TEAL_HOOD}/></Piece>
 <Piece motion="pulse" origin={[110,104]}><path d="M70 83h80q10 0 10 10v22q0 10-10 10h-46l-14 12 2-12h-22q-10 0-10-10V93q0-10 10-10z" fill={LINE}/><path d="M70 80h80q10 0 10 10v22q0 10-10 10h-46l-14 12 2-12h-22q-10 0-10-10V90q0-10 10-10z" fill={WHITE}/><circle cx="96" cy="101" r="4" fill={INK}/><circle cx="110" cy="101" r="4" fill={INK}/><circle cx="124" cy="101" r="4" fill={INK}/></Piece>
</>;}

/** Path stops in the Paths map inks (IslandOnboarding PATH_STOPS): gold for Watch / now, mint for done. */
function Learn(){return <>
 <Still><path d="M0 120Q120 92 230 112T420 84V260H0Z" fill={MINT}/><Stroke d="M30 120Q110 100 200 108" c={WHITE} w={4} o={.7}/>
  <path d="M30 223Q120 203 120 153T220 103 330 63 400 43" fill="none" stroke={TEAL_L} strokeWidth="16" strokeLinecap="round" opacity=".45"/><path d="M30 220Q120 200 120 150T220 100 330 60 400 40" fill="none" stroke={CREAM} strokeWidth="16" strokeLinecap="round"/><path d="M30 220Q120 200 120 150T220 100 330 60 400 40" fill="none" stroke={ARROW} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 9" opacity=".6"/>
  {([[40,218,'done'],[118,160,'done'],[220,100,'now'],[330,62,'lock']] as const).map(([x,y,s])=><g key={String(x)} transform={`translate(${x} ${y})`}>
   <circle cy="3.5" r="16" fill={s==='done'?'#3f8f66':s==='now'?GOLD_D:LINE}/><circle r="16" fill={s==='done'?GRASS:s==='now'?'#f4d57a':PAGE}/>
   {s==='done'?<path d="M-6 0l4 4.5 8-9" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>:s==='now'?<path d="M-4-6.5l10 6.5-10 6.5z" fill={INK}/>:<g opacity=".6"><rect x="-6" y="-1" width="12" height="9" rx="2.5" fill={INK}/><path d="M-3.5-1v-3a3.5 3.5 0 0 1 7 0v3" fill="none" stroke={INK} strokeWidth="2.2"/></g>}</g>)}
  <g transform="translate(30 66)"><rect y="4" width="74" height="52" rx="10" fill={LINE}/><rect width="74" height="52" rx="10" fill={WHITE}/><circle cx="37" cy="26" r="15" fill={ORANGE}/><path d="M33 19l11 7-11 7z" fill={WHITE}/></g>
  <g transform="translate(126 52) rotate(5)"><rect y="4" width="60" height="52" rx="10" fill={GOLD_D}/><rect width="60" height="52" rx="10" fill={GOLD}/><Stroke d="M7 10q3-4 9-4" c="#ffe58a" w={2.6}/><text x="30" y="37" textAnchor="middle" fontFamily="IslandBrush,Arial,sans-serif" fontSize="30" fill={INK}>?</text></g>
  <g transform="translate(250 170)">{['FUTSAL','7v7','9v9','11v11'].map((f,i)=><g key={f} transform={`translate(${(i%2)*78} ${Math.floor(i/2)*34})`}><rect y="3" width="70" height="26" rx="13" fill={LINE}/><rect width="70" height="26" rx="13" fill={WHITE}/><text x="35" y="17.5" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="11" fill={INK}>{f}</text></g>)}</g></Still>
 <Piece motion="pulse" origin={[220,100]}><circle cx="220" cy="100" r="23" fill="none" stroke={GOLD} strokeWidth="3.5" opacity=".8"/></Piece>
 <Piece motion="hop" origin={[220,78]}><Kid x={220} y={66} s={.7} shadow={false}/></Piece>
</>;}

const SCENES:Record<TutorialArt,()=>JSX.Element>={island:Island,walk:Walk,ride:Ride,fly:Fly,map:MapScene,jobs:Jobs,spend:Spend,arcade:Arcade,explore:Explore,museum:Museum,fishing:Fishing,people:People,learn:Learn};
export default function IslandTutorialArt({art,className}:{art:TutorialArt;className?:string}){
 const Scene=SCENES[art];
 return <div className={`${className??''} ${styles.scene}`} data-tutorial-art={art} aria-hidden="true"><Scene/></div>;
}
