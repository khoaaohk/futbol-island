'use client';
import type {CSSProperties,ReactNode} from 'react';
import type {TutorialArt} from '@/lib/tutorial/islandTutorial';
import styles from './IslandTutorial.module.css';

/**
 * Island Tutorial scene art: flat riso prints in the Paths card's inks (JourneyArrivalArt), 420×260. The still print is one SVG;
 * each moving shape is its own HTML layer holding a full-scene <svg> (same viewBox, so it lands on the same pixels) animated with
 * a CSS transform — Chrome composites those, where animating SVG children would repaint the whole print every frame (see
 * JourneyArrivalArt). Only the current scene is mounted, and its loops pause with the tutorial (IslandTutorial.module.css).
 */
const INK='#173e37',PAPER='#fff1cf',CREAM='#faf2da',YELLOW='#ffd03e',BLUE='#1255ee',GREEN='#087451',FLAG='#ff6230',PINK='#fa8bd2',SAND='#f6d98c';
const VB='0 0 420 260';

function Still({children}:{children:ReactNode}){return <svg className={styles.layer} viewBox={VB} aria-hidden="true">{children}</svg>;}
/** A moving piece; `origin` (viewBox units) is its transform origin, as percentages of the layer (the stage keeps 420:260). */
function Piece({motion,origin=[210,130],delay,children}:{motion:string;origin?:[number,number];delay?:number;children:ReactNode}){
 const style:CSSProperties={transformOrigin:`${(origin[0]/420*100).toFixed(2)}% ${(origin[1]/260*100).toFixed(2)}%`,...(delay?{animationDelay:`${delay}s`}:{})};
 return <div className={`${styles.piece} ${styles[motion]??''}`} style={style}><svg viewBox={VB} aria-hidden="true">{children}</svg></div>;
}
/** Riso overprint: a pink plate a hair off register under the key plate. */
const Echo=({children}:{children:ReactNode})=><g transform="translate(2.5 2)" opacity=".5" style={{mixBlendMode:'multiply'}}>{children}</g>;
/** The player: the pink dot from the Paths card, grown a body. */
function Bean({x,y,s=1,shirt=BLUE}:{x:number;y:number;s?:number;shirt?:string}){
 return <g transform={`translate(${x} ${y}) scale(${s})`}><ellipse cx="0" cy="20" rx="11" ry="3.5" fill={INK} opacity=".18"/><path d="M-9 18v-14q0-9 9-9t9 9v14z" fill={shirt} stroke={INK} strokeWidth="2.5"/><circle cy="-13" r="9" fill={PINK} stroke={INK} strokeWidth="2.5"/><circle cx="3" cy="-14" r="1.6" fill={INK}/></g>;
}
const Ball=({x,y,r=9}:{x:number;y:number;r?:number})=><g transform={`translate(${x} ${y})`}><circle r={r} fill={CREAM} stroke={INK} strokeWidth="2"/><path d={`M0 ${-r*.4}l${r*.38} ${r*.28}-${r*.15} ${r*.45}h-${r*.46}l-${r*.15}-${r*.45}z`} fill={INK}/></g>;
const Coin=({x,y,r=9}:{x:number;y:number;r?:number})=><g transform={`translate(${x} ${y})`}><circle r={r} fill={YELLOW} stroke={INK} strokeWidth="2.2"/><circle r={r*.55} fill="none" stroke={INK} strokeWidth="1.4" opacity=".55"/></g>;
function Key({x,y,label,w=26}:{x:number;y:number;label:string;w?:number}){
 return <g transform={`translate(${x} ${y})`}><rect x="0" y="3" width={w} height="24" rx="5" fill={INK}/><rect x="0" y="0" width={w} height="24" rx="5" fill={PAPER} stroke={INK} strokeWidth="2"/><text x={w/2} y="17" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="12" fill={INK}>{label}</text></g>;
}
const Label=({x,y,children,anchor='middle',size=11}:{x:number;y:number;children:ReactNode;anchor?:'start'|'middle'|'end';size?:number})=><text x={x} y={y} textAnchor={anchor} fontFamily="Arial,sans-serif" fontWeight="800" fontSize={size} letterSpacing="1.4" fill={INK}>{children}</text>;
const Sea=({y=190}:{y?:number})=><><rect x="0" y={y} width="420" height={260-y} fill={BLUE}/><path d={`M0 ${y+18}q25-10 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0`} fill="none" stroke={CREAM} strokeWidth="5" strokeLinecap="round" opacity=".8"/></>;
const Sun=()=><Piece motion="pulse" origin={[360,48]}><circle cx="360" cy="48" r="26" fill={YELLOW}/><circle cx="360" cy="48" r="34" fill={YELLOW} opacity=".25"/></Piece>;

function Island(){return <>
 <Still><Sea y={176}/><Echo><path d="M48 180Q30 120 104 110Q150 70 210 124Q280 150 214 196Q110 246 48 180Z" fill={PINK}/></Echo><path d="M48 180Q30 120 104 110Q150 70 210 124Q280 150 214 196Q110 246 48 180Z" fill={YELLOW}/><path d="M72 166Q60 120 116 128Q150 100 184 142Q222 166 180 182Q104 210 72 166" fill={GREEN}/><path d="M110 184Q150 172 138 152T190 140" fill="none" stroke={CREAM} strokeWidth="8" strokeLinecap="round"/>
  <path d="M250 214Q300 190 360 206" fill="none" stroke={CREAM} strokeWidth="4" strokeDasharray="4 9"/><Ball x={330} y={150} r={20}/></Still>
 <Sun/>
 <Piece motion="sway" origin={[134,138]}><path d="M134 138v-38l28 10-28 11" fill={FLAG} stroke={INK} strokeWidth="3"/></Piece>
 <Piece motion="hop" origin={[160,150]}><Bean x={160} y={150} s={.9}/></Piece>
</>;}

function Walk(){return <>
 <Still><rect x="0" y="0" width="420" height="260" fill={SAND}/><Echo><path d="M120 200Q180 120 250 160T380 120" fill="none" stroke={PINK} strokeWidth="14" strokeLinecap="round"/></Echo><path d="M120 200Q180 120 250 160T380 120" fill="none" stroke={CREAM} strokeWidth="14" strokeLinecap="round"/><path d="M120 200Q180 120 250 160T380 120" fill="none" stroke={INK} strokeWidth="2" strokeDasharray="3 10" opacity=".5"/>
  <circle cx="60" cy="196" r="38" fill={INK} opacity=".12"/><circle cx="60" cy="196" r="38" fill="none" stroke={INK} strokeWidth="2.5"/><Label x={60} y={250}>PHONE</Label>
  <Key x={306} y={176} label="W"/><Key x={278} y={204} label="A"/><Key x={306} y={204} label="S"/><Key x={334} y={204} label="D"/><Key x={366} y={204} label="⇧" w={34}/><Label x={340} y={250}>COMPUTER</Label>
  <path d="M260 40q12-8 24 0" fill="none" stroke={GREEN} strokeWidth="5" strokeLinecap="round"/><path d="M40 60q14-10 28 0" fill="none" stroke={GREEN} strokeWidth="5" strokeLinecap="round"/></Still>
 <Piece motion="stick" origin={[60,196]}><circle cx="60" cy="196" r="17" fill={YELLOW} stroke={INK} strokeWidth="2.5"/></Piece>
 <Piece motion="keyPress" origin={[319,188]}><rect x="306" y="176" width="26" height="24" rx="5" fill={FLAG} opacity=".85"/><text x="319" y="193" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="12" fill={PAPER}>W</text></Piece>
 <Piece motion="walkPath" origin={[130,180]}><Bean x={130} y={176}/></Piece>
</>;}

const RIDES:[string,ReactNode][]=[
 ['WALK',<Bean key="w" x={0} y={-4} s={.7}/>],
 ['SCOOTER',<g key="s"><path d="M-14 10h24l6-24" fill="none" stroke={INK} strokeWidth="3"/><circle cx="-12" cy="12" r="5" fill={INK}/><circle cx="14" cy="12" r="5" fill={INK}/></g>],
 ['BIKE',<g key="b"><circle cx="-12" cy="8" r="9" fill="none" stroke={INK} strokeWidth="3"/><circle cx="13" cy="8" r="9" fill="none" stroke={INK} strokeWidth="3"/><path d="M-12 8l9-14h12l4 14M-3-6l-2-6" fill="none" stroke={INK} strokeWidth="3"/></g>],
 ['MOPED',<g key="m"><path d="M-16 6q0-14 16-14h10l6 14z" fill={FLAG} stroke={INK} strokeWidth="2.5"/><circle cx="-11" cy="10" r="5" fill={INK}/><circle cx="13" cy="10" r="5" fill={INK}/></g>],
 ['JETPACK',<g key="j"><rect x="-10" y="-14" width="8" height="22" rx="4" fill={YELLOW} stroke={INK} strokeWidth="2.5"/><rect x="2" y="-14" width="8" height="22" rx="4" fill={YELLOW} stroke={INK} strokeWidth="2.5"/><path d="M-6 10l-3 9 3-3 3 3zM6 10l-3 9 3-3 3 3z" fill={FLAG}/></g>]];
function Ride(){return <>
 <Still><rect x="0" y="0" width="420" height="260" fill={SAND}/><rect x="0" y="196" width="420" height="64" fill={INK} opacity=".82"/><path d="M0 228h420" stroke={CREAM} strokeWidth="4" strokeDasharray="22 16"/>
  {RIDES.map(([name,icon],i)=><g key={name} transform={`translate(${62+i*74} 92)`}><circle r="28" fill={i===1?YELLOW:PAPER} stroke={INK} strokeWidth="2.5"/>{icon}<text y="48" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="10" letterSpacing="1" fill={INK}>{name}</text></g>)}
  <path d="M96 92h18M170 92h18M244 92h18M318 92h18" stroke={INK} strokeWidth="2" strokeDasharray="3 4"/>
  <Key x={258} y={14} label="R"/><Key x={300} y={14} label="SPACE" w={58}/><Key x={364} y={14} label="J"/></Still>
 <Piece motion="drift" origin={[210,190]}><g transform="translate(200 170)"><path d="M-22 22h34l9-36" fill="none" stroke={INK} strokeWidth="3.5"/><circle cx="-20" cy="25" r="6" fill={INK}/><circle cx="18" cy="25" r="6" fill={INK}/></g><Bean x={196} y={170} s={.9}/></Piece>
</>;}

function Fly(){return <>
 <Still><rect x="0" y="0" width="420" height="260" fill="#cfe0f4"/><Sea y={222}/>
  <Echo><path d="M20 222v-60h50v60M80 222v-90h56v90M150 222v-44h44v44" fill={PINK}/></Echo>
  <path d="M20 222v-60h50v60zM80 222v-90h56v90zM150 222v-44h44v44zM330 222v-50h70v50z" fill={GREEN} stroke={INK} strokeWidth="2.5"/>
  <path d="M90 150h12M112 150h12M90 172h12M112 172h12M30 180h10M50 180h10" stroke={YELLOW} strokeWidth="5"/>
  <path d="M110 120Q200 20 300 80T330 168" fill="none" stroke={INK} strokeWidth="2" strokeDasharray="4 8" opacity=".55"/>
  <g transform="translate(365 166)"><path d="M-14 0h28M0-8v16" stroke={FLAG} strokeWidth="4" strokeLinecap="round"/></g><Label x={365} y={152} size={10}>LAND HERE</Label></Still>
 <Piece motion="rise" origin={[108,110]}><path d="M100 128l-4 18 6-6 6 6-4-18z" fill={FLAG}/><rect x="96" y="104" width="7" height="22" rx="3.5" fill={YELLOW} stroke={INK} strokeWidth="2"/><rect x="113" y="104" width="7" height="22" rx="3.5" fill={YELLOW} stroke={INK} strokeWidth="2"/><Bean x={108} y={104} s={.75}/></Piece>
 <Piece motion="glide" origin={[290,90]}><path d="M252 70q38-44 76 0q-10-6-19 0q-9-7-19 0q-10-7-19 0q-9-6-19 0z" fill={FLAG} stroke={INK} strokeWidth="2.5"/><path d="M256 70l34 34M324 70l-34 34M290 70v34" stroke={INK} strokeWidth="1.5"/><Bean x={290} y={112} s={.6}/></Piece>
</>;}

function MapScene(){return <>
 <Still><rect x="0" y="0" width="420" height="260" fill={BLUE}/><g transform="rotate(-4 210 140)"><rect x="70" y="40" width="280" height="190" rx="10" fill={PAPER} stroke={INK} strokeWidth="3"/>
  <Echo><path d="M110 170Q100 90 190 90Q280 70 300 140Q300 200 200 200Q120 210 110 170Z" fill={PINK}/></Echo><path d="M110 170Q100 90 190 90Q280 70 300 140Q300 200 200 200Q120 210 110 170Z" fill={YELLOW} stroke={INK} strokeWidth="2"/><path d="M140 160Q150 112 200 116Q250 110 262 150Q240 180 190 178Z" fill={GREEN}/>
  <ellipse cx="318" cy="198" rx="20" ry="11" fill={YELLOW} stroke={INK} strokeWidth="2"/><path d="M150 168Q220 140 300 196" fill="none" stroke={INK} strokeWidth="2" strokeDasharray="4 6"/>
  {[[160,140,'J'],[214,124,'F'],[244,160,'V']].map(([x,y,m])=><g key={String(m)} transform={`translate(${x} ${y})`}><circle r="10" fill={PAPER} stroke={INK} strokeWidth="2"/><text y="4.5" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="11" fill={INK}>{m}</text></g>)}</g>
  <Key x={378} y={14} label="M"/></Still>
 <Piece motion="bob" origin={[300,180]}><path d="M300 192c-12-14-14-20-14-26a14 14 0 0 1 28 0c0 6-2 12-14 26z" fill={FLAG} stroke={INK} strokeWidth="2.5"/><circle cx="300" cy="165" r="5" fill={PAPER}/></Piece>
</>;}

function Jobs(){return <>
 <Still><rect x="0" y="0" width="420" height="260" fill="#9fd28a"/><path d="M0 70h420" stroke={CREAM} strokeWidth="4"/><path d="M210 70v190" stroke={CREAM} strokeWidth="4"/><circle cx="210" cy="190" r="44" fill="none" stroke={CREAM} strokeWidth="4"/>
  <g transform="translate(70 120)"><rect x="-4" y="0" width="8" height="70" fill={INK}/><Echo><rect x="-38" y="-30" width="76" height="40" rx="6" fill={PINK}/></Echo><rect x="-38" y="-30" width="76" height="40" rx="6" fill={YELLOW} stroke={INK} strokeWidth="2.5"/><text y="-5" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="12" fill={INK}>JOB</text></g>
  {[[300,200],[322,214],[342,198],[290,222],[356,222]].map(([x,y],i)=><path key={i} d={`M${x} ${y}q8-10 16 0q-8 8-16 0z`} fill={i%2?FLAG:'#d98a2b'} stroke={INK} strokeWidth="1.5"/>)}
  <rect x="266" y="10" width="140" height="40" rx="20" fill={INK}/><Coin x={290} y={30} r={11}/><text x="312" y="37" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="18" fill={PAPER}>24</text><text x="340" y="36" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="12" fill={PAPER}>coins</text></Still>
 <Piece motion="sway" origin={[256,214]}><path d="M226 140l30 74" stroke="#8a5a2b" strokeWidth="5" strokeLinecap="round"/><path d="M246 208l26 10-6 8-26-10z" fill={INK}/><Bean x={226} y={168}/></Piece>
 <Piece motion="coinUp" origin={[260,110]}><Coin x={260} y={110}/></Piece>
 <Piece motion="coinUp2" origin={[290,100]}><Coin x={290} y={100}/></Piece>
 <Piece motion="coinUp3" origin={[320,112]}><Coin x={320} y={112}/></Piece>
</>;}

function Fishing(){return <>
 <Still><rect x="0" y="0" width="420" height="120" fill="#cfe0f4"/><Sea y={120}/><path d="M0 150q30-6 60 0t60 0 60 0 60 0 60 0 60 0 60 0" fill="none" stroke={CREAM} strokeWidth="3" opacity=".6"/>
  <Echo><rect x="0" y="100" width="150" height="22" fill={PINK}/></Echo><rect x="0" y="100" width="150" height="22" fill="#c98a4b" stroke={INK} strokeWidth="2.5"/><path d="M30 122v40M110 122v40" stroke={INK} strokeWidth="6"/>
  <path d="M120 64Q220 40 270 138" fill="none" stroke={INK} strokeWidth="1.5"/><path d="M106 96L128 58" stroke="#8a5a2b" strokeWidth="5" strokeLinecap="round"/>
  <g transform="translate(330 20)"><path d="M0 30h80v60H0z" fill={PAPER} stroke={INK} strokeWidth="2.5"/><path d="M-6 30l10-22h72l10 22z" fill={FLAG} stroke={INK} strokeWidth="2.5"/><text x="40" y="66" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="12" fill={INK}>ROSA</text></g></Still>
 <Still><Bean x={100} y={84}/></Still>
 <Piece motion="drift" origin={[230,200]}><path d="M200 200q20-14 46 0q-26 14-46 0zM246 200l14-9v18z" fill={INK} opacity=".35"/></Piece>
 <Piece motion="bob" origin={[270,140]}><circle cx="270" cy="140" r="8" fill={FLAG} stroke={INK} strokeWidth="2"/><path d="M262 140h16" stroke={PAPER} strokeWidth="3"/></Piece>
 <Piece motion="pulse" origin={[300,108]}><rect x="276" y="94" width="58" height="26" rx="13" fill={YELLOW} stroke={INK} strokeWidth="2.5"/><text x="305" y="112" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="12" fill={INK}>HOOK!</text></Piece>
</>;}

function Spend(){return <>
 <Still><rect x="0" y="0" width="420" height="260" fill={SAND}/><rect x="0" y="214" width="420" height="46" fill={GREEN}/>
  <g transform="translate(26 0)"><Echo><rect x="140" y="20" width="130" height="200" rx="10" fill={PINK}/></Echo><rect x="140" y="20" width="130" height="200" rx="10" fill={FLAG} stroke={INK} strokeWidth="3"/><rect x="152" y="34" width="106" height="130" rx="4" fill={PAPER} stroke={INK} strokeWidth="2"/>
  {[0,1,2,3].map(r=>[0,1,2].map(c=><g key={`${r}${c}`} transform={`translate(${170+c*35} ${52+r*31})`}>{r===0?<rect x="-9" y="-11" width="18" height="22" rx="2" fill={c===1?YELLOW:BLUE} stroke={INK} strokeWidth="1.5"/>:r===1?<Ball x={0} y={0} r={9}/>:r===2?<rect x="-10" y="-9" width="20" height="16" rx="2" fill={c===0?GREEN:PINK} stroke={INK} strokeWidth="1.5"/>:<circle r="8" fill={c===2?YELLOW:CREAM} stroke={INK} strokeWidth="1.5"/>}<rect x="-14" y="13" width="28" height="3" fill={INK} opacity=".25"/></g>))}
  <rect x="160" y="176" width="90" height="28" rx="4" fill={INK}/><rect x="244" y="102" width="14" height="4" fill={INK}/></g><Label x={150} y={244} size={10}>CARDS · BALLS · RIDES · BOOKS</Label></Still>
 <Piece motion="coinUp" origin={[110,90]}><Coin x={110} y={90}/></Piece>
 <Piece motion="bobSlow" origin={[364,150]}><path d="M338 120q0-26 26-26t26 26v58h-52z" fill={BLUE} stroke={INK} strokeWidth="3"/><path d="M348 140h32v24h-32z" fill={YELLOW} stroke={INK} strokeWidth="2"/><path d="M354 100q10-16 20 0" fill="none" stroke={INK} strokeWidth="3"/><Label x={364} y={200} size={10}>BACKPACK</Label></Piece>
</>;}

function Arcade(){return <>
 <Still><rect x="0" y="0" width="420" height="260" fill="#2b2f6b"/><path d="M0 220h420v40H0z" fill={INK}/>
  {[50,160,270].map((x,i)=><g key={x} transform={`translate(${x} 50)`}><Echo><path d="M0 180V20Q0 0 20 0h60q20 0 20 20v160z" fill={PINK}/></Echo><path d="M0 180V20Q0 0 20 0h60q20 0 20 20v160z" fill={[FLAG,YELLOW,GREEN][i]} stroke={INK} strokeWidth="3"/><rect x="12" y="20" width="76" height="58" rx="6" fill={INK}/><rect x="10" y="96" width="80" height="14" rx="4" fill={PAPER} stroke={INK} strokeWidth="2"/><circle cx="30" cy="103" r="4" fill={FLAG}/><circle cx="70" cy="103" r="4" fill={BLUE}/></g>)}
  <rect x="66" y="155" width="68" height="16" rx="3" fill={PAPER}/><text x="100" y="167" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="10" fill={INK}>STRIKERS</text><rect x="176" y="155" width="68" height="16" rx="3" fill={PAPER}/><text x="210" y="167" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="10" fill={INK}>PINBALL</text><rect x="286" y="155" width="68" height="16" rx="3" fill={PAPER}/><text x="320" y="167" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="10" fill={INK}>PUZZLES</text>
  <g transform="translate(386 20)"><Coin x={0} y={14} r={11}/><text x="0" y="48" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="16" fill={PAPER}>×3</text></g></Still>
 <Piece motion="hop" origin={[100,104]}><Ball x={100} y={104} r={8}/></Piece>
 <Piece motion="blink" origin={[210,90]}><path d="M190 92h40M210 72v40" stroke={YELLOW} strokeWidth="5" strokeLinecap="round"/></Piece>
 <Piece motion="pulse" origin={[320,90]}><path d="M296 104l20-26 10 12 18-20" fill="none" stroke={PINK} strokeWidth="4" strokeLinecap="round"/></Piece>
</>;}

function Explore(){return <>
 <Still><rect x="0" y="0" width="420" height="260" fill="#cfe0f4"/><Sea y={200}/><Echo><path d="M30 210Q120 60 210 90Q300 60 400 210z" fill={PINK}/></Echo><path d="M30 210Q120 60 210 90Q300 60 400 210z" fill={GREEN} stroke={INK} strokeWidth="2.5"/><path d="M150 120Q210 100 270 120" fill="none" stroke={CREAM} strokeWidth="5" strokeLinecap="round"/>
  <g transform="translate(300 96)"><path d="M0 0l-10 34M0 0l10 34M0 0v34" stroke={INK} strokeWidth="3"/><rect x="-26" y="-14" width="44" height="12" rx="5" transform="rotate(-16)" fill={YELLOW} stroke={INK} strokeWidth="2.5"/></g>
  <path d="M120 200q20-26 44 0z" fill="#0b5a3f" stroke={INK} strokeWidth="2"/><Label x={210} y={248} size={11}>SUMMIT ISLE</Label></Still>
 <Piece motion="sway" origin={[100,170]}><path d="M100 170v-40" stroke="#8a5a2b" strokeWidth="6"/><circle cx="100" cy="116" r="26" fill="#0b5a3f" stroke={INK} strokeWidth="2.5"/><circle cx="90" cy="112" r="5" fill={FLAG}/><circle cx="108" cy="122" r="5" fill={FLAG}/><circle cx="104" cy="104" r="5" fill={YELLOW}/></Piece>
 <Piece motion="peek" origin={[142,190]}><Ball x={142} y={190} r={10}/></Piece>
 <Piece motion="blink" origin={[360,40]}><path d="M360 26v28M346 40h28M351 31l18 18M369 31l-18 18" stroke={YELLOW} strokeWidth="3" strokeLinecap="round"/></Piece>
 <Still><Bean x={240} y={110} s={.8}/></Still>
</>;}

function Museum(){return <>
 <Still><rect x="0" y="0" width="420" height="260" fill={SAND}/><rect x="0" y="222" width="420" height="38" fill={GREEN}/>
  <Echo><path d="M70 90L210 30l140 60z" fill={PINK}/></Echo><path d="M70 90L210 30l140 60z" fill={PAPER} stroke={INK} strokeWidth="3"/><text x="210" y="78" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="11" letterSpacing="2" fill={INK}>HISTORY MUSEUM</text>
  <rect x="80" y="90" width="260" height="14" fill={PAPER} stroke={INK} strokeWidth="2.5"/>{[96,140,264,308].map(x=><rect key={x} x={x} y="104" width="16" height="104" fill={PAPER} stroke={INK} strokeWidth="2.5"/>)}<rect x="70" y="208" width="280" height="14" fill={PAPER} stroke={INK} strokeWidth="2.5"/>
  <rect x="170" y="112" width="80" height="96" fill={INK}/>
  <g transform="translate(40 150)"><path d="M0 40v-40h12l2 24q20 4 22 16z" fill={FLAG} stroke={INK} strokeWidth="2.5"/></g>
  <g transform="translate(366 160)"><rect x="-14" y="10" width="28" height="30" rx="2" fill={PAPER} stroke={INK} strokeWidth="2"/><path d="M-12 10l12-14 12 14" fill={BLUE} stroke={INK} strokeWidth="2"/><Label x={0} y={56} size={9}>RULES 1863</Label></g></Still>
 <Piece motion="pulse" origin={[210,170]}><path d="M194 132h32v10q0 20-16 24q-16-4-16-24zM204 166h12v12h8v8h-28v-8h8z" fill={YELLOW} stroke={PAPER} strokeWidth="2"/></Piece>
 <Piece motion="hop" origin={[150,226]}><Bean x={150} y={220} s={.7}/></Piece>
</>;}

function People(){return <>
 <Still><rect x="0" y="0" width="420" height="260" fill={SAND}/><rect x="0" y="210" width="420" height="50" fill="#c9b27c"/>
  <g transform="translate(250 30)"><rect x="0" y="22" width="150" height="160" fill={PAPER} stroke={INK} strokeWidth="3"/><Echo><rect x="-6" y="0" width="162" height="28" fill={PINK}/></Echo><rect x="-6" y="0" width="162" height="28" fill="#22366b" stroke={INK} strokeWidth="2.5"/><text x="75" y="19" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="14" letterSpacing="2" fill={PAPER}>KIT SHOP</text>
   <path d="M40 60l14-8h12q4 8 12 0h12l14 8-8 14-8-4v44H56V70l-8 4z" fill={FLAG} stroke={INK} strokeWidth="2.5"/><text x="75" y="102" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="18" fill={PAPER}>10</text><Ball x={40} y={160} r={12}/><path d="M86 168v-14h10l2 9q14 2 14 5z" fill={YELLOW} stroke={INK} strokeWidth="2"/></g>
  <Key x={20} y={222} label="E"/><Label x={54} y={239} anchor="start" size={11}>TALK</Label></Still>
 <Still><Bean x={70} y={176} shirt={GREEN}/></Still>
 <Piece motion="bob" origin={[150,170]}><Bean x={150} y={176} shirt={YELLOW}/></Piece>
 <Piece motion="pulse" origin={[110,104]}><path d="M70 80h80q10 0 10 10v22q0 10-10 10h-46l-14 12 2-12h-22q-10 0-10-10V90q0-10 10-10z" fill={PAPER} stroke={INK} strokeWidth="2.5"/><circle cx="96" cy="101" r="4" fill={INK}/><circle cx="110" cy="101" r="4" fill={INK}/><circle cx="124" cy="101" r="4" fill={INK}/></Piece>
</>;}

function Learn(){return <>
 <Still><rect x="0" y="0" width="420" height="260" fill={BLUE}/><Echo><path d="M30 220Q120 200 120 150T220 100 330 60 400 40" fill="none" stroke={PINK} strokeWidth="14" strokeLinecap="round"/></Echo><path d="M30 220Q120 200 120 150T220 100 330 60 400 40" fill="none" stroke={CREAM} strokeWidth="14" strokeLinecap="round"/>
  {[[40,218,'done'],[118,160,'done'],[220,100,'now'],[330,62,'lock']].map(([x,y,s])=><g key={String(x)} transform={`translate(${x} ${y})`}><circle r="16" fill={s==='done'?GREEN:s==='now'?YELLOW:'#7e9788'} stroke={INK} strokeWidth="2.5"/>{s==='done'?<path d="M-6 0l4 5 8-9" fill="none" stroke={PAPER} strokeWidth="3" strokeLinecap="round"/>:s==='lock'?<path d="M-5 -1h10v8h-10zM-3 -1v-4a3 3 0 0 1 6 0v4" fill="none" stroke={PAPER} strokeWidth="2"/>:null}</g>)}
  <g transform="translate(30 66)"><rect width="74" height="52" rx="8" fill={PAPER} stroke={INK} strokeWidth="2.5"/><path d="M30 14l18 12-18 12z" fill={FLAG}/></g>
  <g transform="translate(126 52) rotate(5)"><rect width="60" height="52" rx="8" fill={YELLOW} stroke={INK} strokeWidth="2.5"/><text x="30" y="37" textAnchor="middle" fontFamily="IslandBrush,Arial,sans-serif" fontSize="30" fill={INK}>?</text></g>
  <g transform="translate(250 170)">{['FUTSAL','7v7','9v9','11v11'].map((f,i)=><g key={f} transform={`translate(${(i%2)*78} ${Math.floor(i/2)*34})`}><rect width="70" height="26" rx="13" fill={PAPER} stroke={INK} strokeWidth="2"/><text x="35" y="17.5" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="11" fill={INK}>{f}</text></g>)}</g></Still>
 <Piece motion="pulse" origin={[220,100]}><circle cx="220" cy="100" r="22" fill="none" stroke={YELLOW} strokeWidth="3"/></Piece>
 <Piece motion="hop" origin={[220,78]}><Bean x={220} y={74} s={.7}/></Piece>
</>;}

const SCENES:Record<TutorialArt,()=>JSX.Element>={island:Island,walk:Walk,ride:Ride,fly:Fly,map:MapScene,jobs:Jobs,spend:Spend,arcade:Arcade,explore:Explore,museum:Museum,fishing:Fishing,people:People,learn:Learn};
export default function IslandTutorialArt({art,className}:{art:TutorialArt;className?:string}){
 const Scene=SCENES[art];
 return <div className={`${className??''} ${styles.scene}`} data-tutorial-art={art} aria-hidden="true"><Scene/></div>;
}
