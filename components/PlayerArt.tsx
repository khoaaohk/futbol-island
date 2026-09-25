'use client';
import {useEffect,useId,useLayoutEffect,useRef} from 'react';
import type React from 'react';
import {portraitFeatures} from '@/lib/town/pixelPortrait';
import {countryArt,type Landmark} from '@/lib/town/countryArt';
import appearance from '@/lib/town/playerAppearance.json';
import photos from '@/lib/town/playerPhotos.json';
import starPhotos from '@/lib/town/playerPhotos.stars.json';
import futsalPhotos from '@/lib/town/playerPhotos.futsal.json';
import womenPhotos from '@/lib/town/playerPhotos.women.json';
import {useSceneryRest} from '@/lib/sceneryRest';
import styles from './PlayerArt.module.css';

/**
 * Illustrated player artwork in the island's coast style: flat shapes, cream highlights, the same
 * name-hashed features as the pixel avatar (so a player is recognisable everywhere). Decorative,
 * never a likeness. `layered` splits it into back / player / front planes for the card's parallax.
 */
const KITS={gold:{kit:'#f0b93c',deep:'#b8791f',trim:'#244d40',sky:['#ffd66b','#f59f5b']},blue:{kit:'#4f8fe0',deep:'#2c5ea6',trim:'#fff1d3',sky:['#8fd0f5','#3b73f5']}} as const;
type Team=keyof typeof KITS;

const mix=(a:string,b:string,t:number)=>{const p=(h:string)=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),x=p(a),y=p(b);return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*t).toString(16).padStart(2,'0')).join('');};
/** Flag white reads as island cream, flag black as deep ink, so every country sits in the art style. */
const paint=(c:string)=>c==='#ffffff'?'#fff1d3':c==='#000000'?'#26302c':c;
const INK='#1f3d36';
/** Riso ink: flag colours pulled slightly toward paper and ink so they print like the story films, not like flat screen colour. */
const riso=(c:string)=>c==='#fff1d3'?c:mix(mix(c,'#fff1d3',.06),'#3b3a4a',.06);

function LandmarkShape({kind,live=false}:{kind:Landmark;live?:boolean}){
 const cream='#fff1d3';
 switch(kind){
  case 'eiffel':return <g fill={INK}><path d="M-24 0 L-7 -42 L-4 -84 L0 -104 L4 -84 L7 -42 L24 0 H13 Q0 -20 -13 0Z"/><rect x="-11" y="-46" width="22" height="4"/><rect x="-6" y="-84" width="12" height="3"/></g>;
  case 'bigben':return <g fill={INK}><rect x="-9" y="-78" width="18" height="78"/><path d="M-11 -78 H11 L0 -104Z"/><circle cx="0" cy="-62" r="6" fill={cream}/><rect x="-40" y="-26" width="30" height="26"/><rect x="12" y="-20" width="36" height="20"/></g>;
  case 'windmill':return <g fill={INK}><path d="M-13 0 L-8 -48 H8 L13 0Z"/><path d="M-10 -48 Q0 -60 10 -48Z"/>{!live&&<g transform="translate(0 -52) rotate(20)">{[0,90,180,270].map(a=><rect key={a} x="-3" y="-44" width="7" height="42" transform={`rotate(${a})`}/>)}</g>}<rect x="-3" y="-14" width="6" height="14" fill={cream}/></g>;
  case 'colosseum':return <g fill={INK}><path d="M-46 0 V-34 Q0 -44 46 -34 V0Z"/>{[-36,-24,-12,0,12,24,36].map(x=><g key={x} fill={cream} opacity=".55"><rect x={x-4} y="-14" width="8" height="10" rx="4"/><rect x={x-4} y="-28" width="8" height="9" rx="4"/></g>)}</g>;
  case 'redeemer':return <g fill={INK}><path d="M-60 0 Q-20 -58 0 -62 Q24 -56 60 0Z"/><rect x="-2.5" y="-92" width="5" height="32"/><rect x="-16" y="-84" width="32" height="4" rx="2"/><circle cx="0" cy="-95" r="3.5"/></g>;
  case 'obelisk':return <g fill={INK}><path d="M-7 0 L-4 -92 L0 -102 L4 -92 L7 0Z"/><rect x="-40" y="-10" width="80" height="10"/></g>;
  case 'gate':return <g fill={INK}><rect x="-44" y="-44" width="88" height="8"/><rect x="-40" y="-50" width="80" height="6"/>{[-38,-24,-10,4,18,32].map(x=><rect key={x} x={x} y="-36" width="6" height="36"/>)}<path d="M-10 -50 L-6 -62 H6 L10 -50Z"/></g>;
  case 'spires':return <g fill={INK}>{[[-30,70],[-12,96],[6,104],[24,80]].map(([x,h])=><path key={x} d={`M${x-7} 0 V${-h+22} Q${x} ${-h} ${x+7} ${-h+22} V0Z`}/>)}</g>;
  case 'torii':return <g><path d="M-70 0 L-10 -70 Q0 -76 10 -70 L70 0Z" fill={INK} opacity=".55"/><path d="M-10 -70 Q0 -76 10 -70 L22 -56 Q0 -62 -22 -56Z" fill={cream}/><g fill="#bc002d"><rect x="-26" y="-40" width="6" height="40"/><rect x="20" y="-40" width="6" height="40"/><path d="M-36 -46 Q0 -52 36 -46 V-40 H-36Z"/><rect x="-28" y="-34" width="56" height="4"/></g></g>;
  case 'pyramids':return <g fill={INK}><path d="M-60 0 L-18 -56 L24 0Z"/><path d="M10 0 L38 -36 L66 0Z" opacity=".8"/></g>;
  case 'mountains':return <g><path d="M-80 0 L-36 -64 L-10 -30 L18 -80 L80 0Z" fill={INK}/><path d="M-36 -64 L-28 -52 L-36 -48 L-44 -52Z M18 -80 L28 -64 L18 -58 L8 -64Z" fill={cream}/></g>;
  case 'castle':return <g fill={INK}><rect x="-40" y="-34" width="80" height="34"/><rect x="-48" y="-56" width="18" height="56"/><rect x="30" y="-56" width="18" height="56"/>{[-48,-42,-36,30,36,42].map(x=><rect key={x} x={x} y="-62" width="5" height="7"/>)}{[-26,-14,-2,10,22].map(x=><rect key={x} x={x} y="-40" width="6" height="7"/>)}<rect x="-7" y="-18" width="14" height="18" rx="7" fill={cream} opacity=".6"/></g>;
  case 'belem':return <g fill={INK}><rect x="-16" y="-70" width="32" height="70"/><rect x="-22" y="-30" width="44" height="30"/>{[-16,-8,0,8].map(x=><rect key={x} x={x+1} y="-76" width="5" height="7"/>)}<rect x="-5" y="-56" width="10" height="14" rx="5" fill={cream} opacity=".6"/></g>;
  case 'palms':return <g fill={INK}>{[[-34,1],[4,-1],[40,1]].map(([x,d])=><g key={x} transform={`translate(${x} 0) scale(${d} 1)`}><path d="M-3 0 Q-8 -40 4 -70 L8 -68 Q-2 -40 3 0Z"/>{[-60,-25,15,50,90].map(a=><path key={a} d="M6 -69 Q24 -80 38 -70 Q22 -72 6 -66Z" transform={`rotate(${a} 6 -69)`}/>)}</g>)}</g>;
  case 'mosque':return <g fill={INK}><rect x="-34" y="-26" width="68" height="26"/><path d="M-24 -26 Q-24 -60 0 -64 Q24 -60 24 -26Z"/><rect x="-50" y="-78" width="7" height="78"/><rect x="43" y="-78" width="7" height="78"/><path d="M-50 -78 L-46.5 -90 L-43 -78Z M43 -78 L46.5 -90 L50 -78Z"/></g>;
  case 'skyline':return <g fill={INK}>{[[-60,40],[-44,70],[-26,52],[-10,90],[8,62],[26,78],[44,46],[58,58]].map(([x,h])=><rect key={x} x={x} y={-h} width="15" height={h}/>)}</g>;
  default:return <g fill={INK}><path d="M-70 0 Q-60 -34 0 -38 Q60 -34 70 0Z"/>{[-58,58].map(x=><g key={x}><rect x={x-2} y="-78" width="4" height="46"/><rect x={x-10} y="-84" width="20" height="8" rx="2" fill={cream}/></g>)}</g>;
 }
}

type Layout='waves'|'rays'|'bands'|'arches'|'stripes'|'hills';
const LAYOUTS:Layout[]=['waves','rays','bands','arches','stripes','hills'];
/** Seeded scene choices: every player gets their own composition, colour order, landmark placement and accent. */
function sceneFor(seed:number){
 let x=(seed^0x51ed270b)>>>0;const r=()=>{x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return x/4294967296;};
 const perms=[[0,1,2],[1,2,0],[2,0,1],[0,2,1],[1,0,2],[2,1,0]];
 return {layout:LAYOUTS[Math.floor(r()*LAYOUTS.length)],order:perms[Math.floor(r()*6)],flip:r()<.5?-1:1,sunX:.18+r()*.64,sunY:.14+r()*.18,sunR:22+r()*18,
  landX:.2+r()*.6,landS:.75+r()*.5,accent:(['bunting','confetti','stars','none'] as const)[Math.floor(r()*4)],skyTilt:r(),amp:.6+r()*.8,phase:r()*Math.PI*2,count:3+Math.floor(r()*3),r};
}

/** The scene body (no defs) at 240×240 units; `sc` from sceneFor. Shared by the card backdrop and the full-screen page backdrop. */
function Scene({id,sc,cols,art,live=false}:{id:string;sc:ReturnType<typeof sceneFor>;cols:string[];art:ReturnType<typeof countryArt>;live?:boolean}){
 const [a,b,c]=sc.order.map(i=>cols[i]),{flip,amp,phase}=sc,k=(n:number)=>Math.round(n*10)/10;
 const land=<g transform={`translate(${k(240*sc.landX)} 152) scale(${k(sc.landS)})`} opacity=".62"><LandmarkShape kind={art.landmark} live={live}/></g>;
 const sun=<circle cx={k(240*sc.sunX)} cy={k(240*sc.sunY)} r={k(sc.sunR)} fill="#fff1d3" opacity=".62"/>;
 let body:JSX.Element;
 switch(sc.layout){
  case 'rays':{const cx=240*sc.sunX,cy=240*sc.sunY;body=<>{Array.from({length:12},(_,i)=>{const a0=phase+i/12*Math.PI*2,a1=a0+Math.PI/12;return <path key={i} d={`M${k(cx)} ${k(cy)} L${k(cx+Math.cos(a0)*420)} ${k(cy+Math.sin(a0)*420)} L${k(cx+Math.cos(a1)*420)} ${k(cy+Math.sin(a1)*420)}Z`} fill={i%2?a:b} opacity=".55"/>;})}{sun}{land}<path d={`M-40 ${k(196-12*amp)} Q120 ${k(170+20*amp)} 280 ${k(190-8*amp)} V260 H-40Z`} fill={c}/></>;break;}
  case 'bands':{const ang=flip*(18+sc.skyTilt*20);body=<>{sun}{land}<g transform={`rotate(${k(ang)} 120 150)`}>{[a,b,c].map((col,i)=><rect key={i} x="-120" y={k(118+i*34*amp+ (i?8:0))} width="480" height={k(30+22*amp)} fill={col} opacity={i===0?.9:1}/>)}</g></>;break;}
  case 'arches':{body=<>{sun}{Array.from({length:sc.count+1},(_,i)=>{const rr=40+i*34*amp;return <path key={i} d={`M${k(120-rr*1.2)} 260 V${k(210-rr*.3)} A${k(rr*1.2)} ${k(rr*1.1)} 0 0 1 ${k(120+rr*1.2)} ${k(210-rr*.3)} V260Z`} fill={[a,b,c][i%3]} opacity={.95-i*.12}/>;}).reverse()}{land}</>;break;}
  case 'stripes':{const n=sc.count+3,w=320/n;body=<>{Array.from({length:n},(_,i)=><rect key={i} x={k(-40+i*w)} y="-40" width={k(w+.5)} height="320" fill={[a,b,c][i%3]} opacity=".42" transform={`skewX(${k(flip*(8+sc.skyTilt*12))})`}/>)}{sun}{land}<path d={`M-40 ${k(200-10*amp)} C 60 ${k(180+14*amp)} 170 ${k(214-10*amp)} 280 ${k(196)} V260 H-40Z`} fill={c}/></>;break;}
  case 'hills':{body=<>{sun}{land}{[a,b,c].map((col,i)=>{const y=150+i*30,h=26*amp;return <path key={i} d={`M-40 ${k(y)} C 30 ${k(y-h+flip*i*6)} 90 ${k(y+h*.4)} 150 ${k(y-h*.6)} S 250 ${k(y-h)} 280 ${k(y)} V260 H-40Z`} fill={col}/>;})}</>;break;}
  default:{body=<>{sun}{land}
   <path d={`M-40 150 C 30 ${k(112+flip*10*amp)} 90 190 160 142 S 250 122 280 150 V260 H-40Z`} fill={a} opacity=".95"/>
   <path d={`M-40 176 C 40 ${k(150-10*amp)} 110 215 190 170 S 260 170 280 185`} stroke={b} strokeWidth={k(18+8*amp)} fill="none" strokeLinecap="round"/>
   <path d="M-40 205 C 60 185 150 230 280 200 V260 H-40Z" fill={c}/></>;}
 }
 const acc=sc.accent==='bunting'?<g transform="translate(0 22)"><path d="M-10 10 Q120 34 250 10" stroke={INK} strokeWidth="1.5" fill="none" opacity=".5"/>{Array.from({length:10},(_,i)=>{const x=6+i*24,y=12+Math.sin((i+.5)/10*Math.PI)*11;return <path key={i} d={`M${x} ${k(y)} L${x+16} ${k(y+1)} L${x+8} ${k(y+16)}Z`} fill={[a,b,c][i%3]} stroke={INK} strokeOpacity=".25"/>;})}</g>
  :sc.accent==='confetti'?<g>{Array.from({length:16},(_,i)=>{const px=(i*73+Math.floor(phase*50))%240,py=(i*41+17)%140;return <rect key={i} x={px} y={py} width="6" height="3" rx="1" fill={[a,b,c,'#fff1d3'][i%4]} transform={`rotate(${(i*37)%180} ${px} ${py})`} opacity=".85"/>;})}</g>
  :sc.accent==='stars'?<g fill="#fff1d3" opacity=".8">{Array.from({length:9},(_,i)=>{const px=(i*61+Math.floor(phase*30))%230+5,py=(i*29+11)%110+6,s=2+(i%3);return <path key={i} d={`M${px} ${py-s*2} L${px+s*.6} ${py-s*.6} L${px+s*2} ${py} L${px+s*.6} ${py+s*.6} L${px} ${py+s*2} L${px-s*.6} ${py+s*.6} L${px-s*2} ${py} L${px-s*.6} ${py-s*.6}Z`}/>;})}</g>:null;
 return <>{body}{acc}<path d="M-40 206 C 60 186 150 231 280 201" stroke={INK} strokeWidth="2" fill="none" opacity=".16"/></>;
}


/** A box on the live scenery's 240-unit stage: [x, y, width, height]. */
type Box=[number,number,number,number];
/** Absolutely placed at `box` (stage units, relative to the parent piece's box origin `at`), turning about `o` (stage units). */
const place=([x,y,w,h]:Box,at:[number,number]=[0,0],o?:[number,number],clip=false):React.CSSProperties=>({position:'absolute',left:x-at[0],top:y-at[1],width:w,height:h,overflow:clip?'hidden':'visible',...(o?{transformOrigin:`${o[0]-x}px ${o[1]-y}px`}:{})});
/** One animated piece: its own small HTML box holding an <svg> whose viewBox is that box, so its CSS transform animation
 * runs on the compositor (Chrome never composites animations on SVG elements, the outer <svg> included). The same
 * animations on SVG children restyled, laid out and repainted the whole scene every frame. */
function Piece({box,at,o,clip,className,style,children}:{box:Box;at?:[number,number];o?:[number,number];clip?:boolean;className?:string;style?:React.CSSProperties;children:React.ReactNode}){
 return <div className={className} style={{...place(box,at,o,clip),...style}}><svg className={styles.pieceArt} viewBox={box.join(' ')} aria-hidden="true">{children}</svg></div>;
}
/** A moving group holding pieces (e.g. a drifting cloud that also bobs). */
function Group({box,className,style,children}:{box:Box;className?:string;style?:React.CSSProperties;children:React.ReactNode}){
 return <div className={className} style={{...place(box),...style}}>{children}</div>;
}
const useIsoLayoutEffect=typeof window==='undefined'?useEffect:useLayoutEffect;
export {SCENERY_WAKE_EVENT} from '@/lib/sceneryRest';

/**
 * Live country scenery over the static riso backdrop (card window only): drifting clouds, birds, the country's flag
 * waving by its landmark, and landmark motion (windmill sails). Pure CSS transform animations on a few small shapes —
 * no JS loop and no re-filtering; paused while a film plays, off for reduced motion. Each moving shape is its own small
 * composited box on a 240-unit stage that is scaled to cover the layer like the backdrop's `slice` viewBox (measured on
 * resize only), so an open card costs no main-thread style, layout or paint per frame.
 */
function LiveScenery({seed,country,className}:{seed:number;country?:string;className:string}){
 const ref=useRef<HTMLDivElement>(null);
 useIsoLayoutEffect(()=>{const el=ref.current,stage=el?.firstElementChild as HTMLElement|null;if(!el||!stage)return;
  const fit=()=>{const w=el.clientWidth,h=el.clientHeight,s=Math.max(w,h)/240;stage.style.transform=`translate(${((w-240*s)/2).toFixed(2)}px,${((h-240*s)/2).toFixed(2)}px) scale(${s.toFixed(4)})`;};
  fit();const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(fit);observer?.observe(el);return ()=>observer?.disconnect();},[]);
  // Rest: moves for 6 s after the card appears and after any interaction, then freezes on its frame (lib/sceneryRest.ts).
  useSceneryRest(ref);
 const art=countryArt(country),cols=art.flag.map(paint).map(riso),sc=sceneFor(seed),k=(n:number)=>Math.round(n*10)/10;
 let x=(seed^0x7a3d)>>>0;const r=()=>{x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return x/4294967296;};
 const [a,b,c]=sc.order.map(i=>cols[i]),solid=(col:string)=>col==='#fff1d3'?'#fff6e4':col;
 const lx=240*sc.landX,ls=sc.landS,top=152-(art.landmark==='eiffel'?104:art.landmark==='bigben'?104:art.landmark==='redeemer'?95:70)*ls;
 const poleX=k(lx+(sc.landX>.5?-40:40)*ls),poleTop=k(152-82*ls),sx=240*sc.sunX,sy=240*sc.sunY;
 const clouds=Array.from({length:4},(_,i)=>({far:i<2,y:k(i<2?10+r()*30:34+r()*46),s:k(i<2?.8+r()*.4:1.3+r()*.7),dur:k(i<2?70+r()*30:34+r()*18),delay:k(-r()*90),i}));
 const flock=Array.from({length:3+Math.floor(r()*3)},(_,i)=>({dx:i*9,dy:Math.abs(i-1.5)*5,i}));
 const wave=(y:number,amp:number,len:number)=>{let d=`M-240 ${y}`;for(let px=-240;px<=480;px+=len)d+=` q${len/4} ${-amp} ${len/2} 0 t${len/2} 0`;return d+` V260 H-240Z`;};
 const petals=art.landmark==='torii'||art.landmark==='palms'?Array.from({length:8},(_,i)=>({x:k(r()*240),dur:k(7+r()*6),delay:k(-r()*12),i})):[];
 // Same draw order of the seeded values as before: the flock's duration, delay, then height.
 const birdDur=k(15+r()*8),birdDelay=k(-r()*20),fy=k(26+r()*40);
 const cloudBox=(cl:{y:number;s:number}):Box=>[-4*cl.s-2,cl.y-6*cl.s-2,60*cl.s+4,22*cl.s+4];
 const cloud=(cl:typeof clouds[number],near:boolean)=>{const box=cloudBox(cl);
  return <Group key={(near?'n':'f')+cl.i} box={box} className={styles.cloud} style={{animationDuration:`${cl.dur}s`,animationDelay:`${cl.delay}s`}}>
   <Piece box={box} at={[box[0],box[1]]} className={styles.bob} style={near?{animationDelay:`${-cl.i}s`}:undefined}>
    {near?<g transform={`translate(0 ${cl.y}) scale(${cl.s})`}><path d="M0 12 Q2 2 14 4 Q20 -6 32 2 Q44 -2 46 8 Q56 10 52 16 H2 Q-4 16 0 12Z" fill="#fff6e4" opacity=".92"/><path d="M4 16 H50" stroke={INK} strokeOpacity=".14" strokeWidth="2"/></g>
    :<g transform={`translate(0 ${cl.y}) scale(${cl.s})`} opacity=".7"><path d="M0 12 Q2 2 14 4 Q20 -6 32 2 Q44 -2 46 8 Q56 10 52 16 H2 Q-4 16 0 12Z" fill="#fff6e4"/></g>}
   </Piece>
  </Group>;};
 const pivot=(px:number,py:number,half:number):Box=>[px-half,py-half,half*2,half*2];
 const L=k(ls),sun:[number,number]=[k(sx),k(sy)],land:[number,number]=[k(lx),k(top)];
 const flagY=k(poleTop+1),birdW=flock[flock.length-1].dx+18,birdBox:Box=[-1,fy-4.5,birdW,13];
 return <div ref={ref} className={className}>
  <div className={styles.stage}>
   {/* sun rays turn slowly behind a breathing sun */}
   <Piece box={pivot(sun[0],sun[1],58)} o={sun} className={styles.rays} style={{opacity:.5}}><g transform={`translate(${sun[0]} ${sun[1]})`}>{Array.from({length:12},(_,i)=><path key={i} d="M-3 -30 L0 -58 L3 -30Z" fill="#fff6e4" transform={`rotate(${i*30})`}/>)}</g></Piece>
   {clouds.filter(cl=>cl.far).map(cl=>cloud(cl,false))}
   {/* landmark life */}
   {art.landmark==='windmill'&&(()=>{const P:[number,number]=[k(lx),k(152-52*ls)];return <Piece box={pivot(P[0],P[1],47*L)} o={P} className={styles.sails} style={{opacity:.7}}><g transform={`translate(${P[0]} ${P[1]}) scale(${L})`}>{[0,90,180,270].map(an=><rect key={an} x="-3.5" y="-46" width="8" height="44" fill={INK} transform={`rotate(${an})`}/>)}</g></Piece>;})()}
   {art.landmark==='bigben'&&(()=>{const P:[number,number]=[k(lx),k(152-62*ls)];return <Piece box={pivot(P[0],P[1],6*L)} o={P} className={styles.hand}><g transform={`translate(${P[0]} ${P[1]}) scale(${L})`}><rect x="-.8" y="-5.5" width="1.6" height="5.5" fill={INK}/></g></Piece>;})()}
   {art.landmark==='eiffel'&&<Piece box={[land[0]-90,land[1]-40,180,40]} o={land} className={styles.beam}><g transform={`translate(${land[0]} ${land[1]})`}><path d="M0 0 L-90 -40 L-90 -20Z" fill="#fff6e4" opacity=".55"/><path d="M0 0 L90 -40 L90 -20Z" fill="#fff6e4" opacity=".55"/></g></Piece>}
   {art.landmark==='redeemer'&&<Piece box={pivot(land[0],land[1],31)} o={land} className={styles.rays} style={{opacity:.55}}><g transform={`translate(${land[0]} ${land[1]})`}>{Array.from({length:10},(_,i)=><path key={i} d="M-2 -8 L0 -30 L2 -8Z" fill="#fff6e4" transform={`rotate(${i*36})`}/>)}</g></Piece>}
   {/* the mist drifts ±30: its clipped box always covers the visible stage */}
   {art.landmark==='mountains'&&<Piece box={[-34,104,308,30]} clip className={styles.mist}><path d="M-120 118 Q-60 108 0 118 T120 118 T240 118 T360 118 V132 H-120Z" fill="#fff6e4" opacity=".55"/></Piece>}
   {/* the country's flag ripples by its landmark (each strip turns about its own left-centre, as with fill-box) */}
   <svg style={place([0,0,240,240])} viewBox="0 0 240 240" aria-hidden="true"><line x1={poleX} y1={poleTop} x2={poleX} y2="154" stroke={INK} strokeWidth="2"/><circle cx={poleX} cy={poleTop} r="1.8" fill={INK}/></svg>
   {[0,1,2,3].map(j=><Piece key={j} box={[poleX+j*9,flagY,9.4,21.2]} o={[poleX+j*9,flagY+10.6]} className={styles.flagStrip} style={{animationDelay:`${-j*.18}s`}}><g transform={`translate(${poleX} ${flagY})`}>{[a,b,c].map((col,i)=><rect key={i} x={j*9} y={i*7} width="9.4" height="7.2" fill={solid(col)}/>)}</g></Piece>)}
   {/* a flock in V formation (each wing flaps about its own centre, as with fill-box) */}
   <Group box={birdBox} className={styles.bird} style={{animationDuration:`${birdDur}s`,animationDelay:`${birdDelay}s`}}>
    {flock.map(bd=><Piece key={bd.i} box={[bd.dx,bd.dy+fy-2.5,16,2.5]} at={[birdBox[0],birdBox[1]]} o={[bd.dx+8,bd.dy+fy-1.25]} className={styles.wings} style={{animationDelay:`${-bd.i*.12}s`}}><path d={`M${bd.dx} ${bd.dy+fy} q4 -5 8 0 q4 -5 8 0`} stroke={INK} strokeWidth="1.9" fill="none" strokeLinecap="round"/></Piece>)}
   </Group>
   {clouds.filter(cl=>!cl.far).map(cl=>cloud(cl,true))}
   {/* petals fall and turn about the stage corner, as the SVG groups did (transform-origin 0 0) */}
   {petals.map(p=><Piece key={'p'+p.i} box={[p.x,-11.5,6,3]} o={[0,0]} className={styles.petal} style={{animationDuration:`${p.dur}s`,animationDelay:`${p.delay}s`}}><path transform={`translate(${p.x} -10)`} d="M0 0 q3 -3 6 0 q-3 3 -6 0Z" fill={art.landmark==='torii'?'#f6a3c4':'#6ccdb0'}/></Piece>)}
   {/* rolling ground in two layers: the far one slow, the near one faster (clipped boxes cover the stage through the roll) */}
   <Piece box={[-4,204,308,58]} clip className={styles.rollSlow}><path d={wave(212,5,60)} fill={solid(b)} opacity=".55"/></Piece>
   <Piece box={[-4,218,308,44]} clip className={styles.rollFast}><path d={wave(226,6,48)} fill={solid(c)} opacity=".8"/></Piece>
  </div>
 </div>;
}

function RisoDefs({id,seed}:{id:string;seed:number}){
 return <filter id={`${id}riso`} x="-10%" y="-10%" width="120%" height="120%">
  <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed={seed%97} result="warp"/>
  <feDisplacementMap in="SourceGraphic" in2="warp" scale="5" xChannelSelector="R" yChannelSelector="G" result="cut"/>
  <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed={(seed>>3)%97} result="grain"/>
  <feColorMatrix in="grain" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.5 1.62" result="speckle"/>
  <feComposite in="cut" in2="speckle" operator="in"/>
 </filter>;
}

function Backdrop({id,f,country,live=false}:{id:string;f:{seed:number};country?:string;live?:boolean}){
 const art=countryArt(country),cols=art.flag.map(paint).map(riso),sc=sceneFor(f.seed);
 const [a,b,c]=sc.order.map(i=>cols[i]);
 const sky0=mix(a==='#fff1d3'?b:a,'#fff1d3',.32+sc.skyTilt*.15),sky1=mix(b==='#fff1d3'?c:b,'#fff1d3',.1+sc.skyTilt*.12);
 return <>
  <defs><linearGradient id={`${id}sky`} x1={sc.flip<0?0:1} y1="0" x2={sc.flip<0?1:0} y2="1"><stop offset="0" stopColor={sky0}/><stop offset="1" stopColor={sky1}/></linearGradient><RisoDefs id={id} seed={f.seed}/></defs>
  <rect x="-40" y="-40" width="320" height="300" fill="#f3ead6"/>
  <g filter={`url(#${id}riso)`}><rect x="-40" y="-40" width="320" height="300" fill={`url(#${id}sky)`}/><Scene id={id} sc={sc} cols={cols} art={art} live={live}/></g>
 </>;
}

/**
 * Full-screen page backdrop that matches a player's card: the island's smooth coast shapes (the same
 * geometry as /stories/paths/playbook-coast.svg — base, left sweep, right sweep, ribbon) with no riso
 * texture, recoloured from the card's own flag palette in the card's colour order.
 */
export function PlayerBackdrop({name,className}:{name:string;className?:string}){
 const {look,country}=lookFor(name);
 return <CoastBackdrop seed={look.seed} country={country} className={className}/>;
}
function CoastBackdrop({seed,country,className}:{seed:number;country?:string;className?:string}){
 const cols=countryArt(country).flag.map(paint).map(riso),sc=sceneFor(seed);
 const [a,b,c]=sc.order.map(i=>cols[i]);
 // Keep the page lively: cream flag colours become a pale tint of a neighbouring colour.
 const solid=(x:string,alt:string,t:number)=>x==='#fff1d3'?mix(alt,'#fff1d3',t):x;
 const base=mix(solid(a,b,.55),'#fff1d3',.38),left=solid(b,c,.35),right=solid(c,a,.4),ribbon=mix(solid(a,c,.3),'#fff1d3',.12);
 const flip=sc.flip<0;
 return <svg className={className} viewBox="0 0 1600 1200" preserveAspectRatio="none" aria-hidden="true">
  <g transform={flip?'translate(1600 0) scale(-1 1)':undefined}>
   <rect width="1600" height="1200" fill={base}/>
   <path d="M0 0H650C470 230 600 380 360 650S120 1020 0 1200Z" fill={left}/>
   <path d="M1600 0H1410C1020 350 1300 600 970 860S1150 1100 1250 1200H1600Z" fill={right}/>
   <path d="M0 900C340 670 430 1150 900 980S1340 860 1600 1030" fill="none" stroke={ribbon} strokeWidth="120"/>
  </g>
 </svg>;
}

export type HairStyle='short'|'buzz'|'afro'|'medium'|'bald'|'long'|'curly'|'dreads'|'bun'|'slick'|'fade'|'mohawk';
export type Facial='none'|'stubble'|'mustache'|'beard';
export type Look={skin:string;skinShade:string;hair:string;hairShade:string;eye:string;style:HairStyle;facial:Facial;headband:boolean;seed:number};
const HASH_STYLES:HairStyle[]=['short','buzz','afro','medium','bald','long'],HASH_FACIAL:Facial[]=['none','stubble','mustache','beard'];
type Authored={skin:number;hair:number;style:HairStyle;facial:Facial;headband:boolean;country:string};
const AUTHORED=appearance as unknown as Record<string,Authored>;
// Same palettes as the pixel avatar (lib/town/pixelPortrait.ts), lightest → darkest skin.
const SKIN_TONES=['#f2c79b','#e8b381','#d99a6c','#c17a49','#9c5c33','#7a4726','#5a3620'],HAIR_TONES=['#111111','#2a1a0e','#4a2f18','#6b4423','#916a3d','#c79a4e','#e6cf94','#8a8f96','#b0342a'];
const tone=(hex:string,f:number)=>'#'+[1,3,5].map(i=>Math.round(Math.min(255,parseInt(hex.slice(i,i+2),16)*f)).toString(16).padStart(2,'0')).join('');
/** The authored look (lib/town/playerAppearance.json) when there is one, else the name-hashed look; plus the player's country. */
export function lookFor(name:string):{look:Look;country?:string}{
 const base=hashedLook(name),a=AUTHORED[name];
 if(!a||typeof a!=='object'||Array.isArray(a))return {look:base};
 const skin=SKIN_TONES[a.skin]??base.skin,hair=HAIR_TONES[a.hair]??base.hair;
 return {look:{...base,skin,skinShade:tone(skin,.82),hair,hairShade:tone(hair,.72),style:a.style,facial:a.facial,headband:!!a.headband},country:a.country};
}
/** Generated look from the name hash: the fallback when a player has no authored appearance. */
export function hashedLook(name:string):Look{const f=portraitFeatures(name);return {...f,style:HASH_STYLES[f.style]??'short',facial:HASH_FACIAL[f.facial]??'none',headband:false};}

/** Hair geometry in the 240-unit figure space. Fills come from the print pass: `fill` the main mass, `shade` the back hair, `light` faded sides. */
function Hair({style,front,fill,shade,light}:{style:HairStyle;front:boolean;fill:string;shade:string;light:string}){
 if(!front){
  if(style==='afro')return <circle cx="120" cy="84" r="58" fill={fill}/>;
  if(style==='long')return <path d="M70 90 Q70 40 120 38 Q170 40 170 90 L176 172 Q150 184 120 180 Q90 184 64 172Z" fill={shade}/>;
  if(style==='dreads')return <g fill={shade}>{[74,86,98,142,154,166].map((x,i)=><rect key={x} x={x-5} y="80" width="11" height={82+(i%3)*10} rx="5"/>)}</g>;
  if(style==='bun')return <circle cx="120" cy="40" r="17" fill={fill}/>;
  return null;
 }
 switch(style){
  case 'bald':return null;
  case 'buzz':return <path d="M80 92 Q80 52 120 50 Q160 52 160 92 Q150 70 120 68 Q90 70 80 92Z" fill={light}/>;
  case 'afro':return <path d="M74 96 Q70 44 120 40 Q172 44 166 96 Q160 70 140 66 Q120 78 100 66 Q80 70 74 96Z" fill={fill}/>;
  case 'medium':return <path d="M76 100 Q70 46 122 42 Q172 46 166 98 Q160 76 150 70 Q126 82 96 66 Q84 76 76 100Z" fill={fill}/>;
  case 'long':return <path d="M78 98 Q74 44 120 42 Q168 44 162 98 Q156 70 134 64 Q112 74 92 70 Q82 80 78 98Z" fill={fill}/>;
  case 'curly':return <g fill={fill}><path d="M80 94 Q78 54 120 50 Q162 54 160 94 Q152 72 120 70 Q88 72 80 94Z"/>{[86,100,114,128,142,154].map((x,i)=><circle key={x} cx={x} cy={i%2?52:58} r="11"/>)}</g>;
  case 'dreads':return <g fill={fill}><path d="M78 96 Q76 46 120 44 Q164 46 162 96 Q150 70 120 68 Q90 70 78 96Z"/>{[92,106,120,134,148].map(x=><rect key={x} x={x-5} y="40" width="10" height="26" rx="5"/>)}</g>;
  case 'bun':return <path d="M80 94 Q80 50 120 48 Q160 50 160 94 Q152 66 120 64 Q88 66 80 94Z" fill={fill}/>;
  case 'slick':return <path d="M80 90 Q78 46 122 44 Q164 48 160 90 Q154 64 120 62 Q92 62 80 90Z" fill={fill}/>;
  case 'fade':return <g><path d="M81 98 Q81 62 120 60 Q159 62 159 98 Q154 80 120 78 Q86 80 81 98Z" fill={light}/><path d="M90 74 Q90 50 121 49 Q151 51 150 74 Q138 65 120 66 Q102 65 90 74Z" fill={fill}/></g>;
  case 'mohawk':return <g><path d="M80 96 Q80 58 120 56 Q160 58 160 96 Q152 74 120 72 Q88 74 80 96Z" fill={light}/><path d="M108 70 Q106 36 120 30 Q134 36 132 70Z" fill={fill}/></g>;
  default:return <path d="M78 94 Q76 48 120 46 Q164 48 162 94 Q156 70 140 66 Q120 74 98 66 Q84 72 78 94Z" fill={fill}/>;
 }
}
/** Strand lines (ink linework) and sheen cuts (knocked out of the ink) that follow each hairstyle, in hair space. */
const STRANDS:Partial<Record<HairStyle,string>>={
 short:'M92 60 Q108 52 128 54 M86 76 Q100 62 118 62 M132 58 Q150 62 156 80',
 medium:'M90 58 Q110 48 134 52 M82 82 Q92 62 112 60 M140 60 Q158 68 160 90',
 long:'M92 58 Q110 50 132 52 M84 84 Q90 64 110 62 M140 62 Q156 70 158 94 M72 110 Q70 140 70 168 M168 110 Q170 140 172 168',
 slick:'M92 60 Q116 50 146 58 M88 72 Q116 60 152 70 M86 84 Q114 70 156 82',
 bun:'M90 64 Q108 54 130 56 M86 80 Q98 66 118 64 M134 60 Q150 64 154 82',
 fade:'M98 60 Q116 52 140 58',mohawk:'M116 40 Q120 52 118 66 M124 38 Q126 52 126 66',
 curly:'M92 56 q4 -6 8 0 M112 52 q4 -6 8 0 M132 54 q4 -6 8 0',afro:'M92 50 q5 -7 10 0 M114 44 q5 -7 10 0 M136 48 q5 -7 10 0 M84 70 q5 -7 10 0 M146 70 q5 -7 10 0',
};

/** Per-player face geometry from a seed: head shape, jaw, eyes, brows, nose, mouth and ears all vary. */
function faceShape(seed:number){
 let x=(seed^0x9e3779b9)>>>0;const r=()=>{x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return x/4294967296;};
 return {w:36+r()*9,top:52+r()*6,chin:150+r()*10,jaw:r(),eyeGap:13+r()*6,eyeY:103+r()*6,eyeRx:5.2+r()*2.6,eyeRy:4.2+r()*2.4,tilt:(r()-.5)*10,
  brow:3.5+r()*3.5,browArch:-3+r()*7,browLift:r()*4,nose:r(),noseLen:12+r()*9,mouthW:9+r()*8,smile:3+r()*9,grin:r()<.25,ear:.8+r()*.45,neck:14+r()*6};
}
/** Everything a print pass needs, in the 240-unit figure space (the print frame is "-8 -8 256 320", the photo masks' 4:5). */
function figureGeom(f:Look){
 const g=faceShape(f.seed),L=120-g.w,R=120+g.w,jawY=g.chin-18,jawIn=g.jaw<.33?18:g.jaw<.66?10:4; // pointed, round, square
 const head=`M${L} 100 Q${L} ${g.top} 120 ${g.top} Q${R} ${g.top} ${R} 100 L${R-2} ${jawY-10} Q${R-jawIn} ${g.chin-4} 120 ${g.chin} Q${L+jawIn} ${g.chin-4} ${L+2} ${jawY-10}Z`;
 const hairFit=`translate(120 ${(g.top-54).toFixed(1)}) scale(${(g.w/40).toFixed(3)} 1) translate(-120 0)`;
 const eyeL=120-g.eyeGap-2,eyeR=120+g.eyeGap+2,browY=g.eyeY-11-g.browLift,mouthY=Math.min(g.chin-14,g.eyeY+g.noseLen+16);
 const nose=g.nose<.34?`M121 ${g.eyeY+4} Q126 ${g.eyeY+g.noseLen} 124 ${g.eyeY+g.noseLen+3}`:g.nose<.67?`M122 ${g.eyeY+2} L126 ${g.eyeY+g.noseLen} Q124 ${g.eyeY+g.noseLen+4} 121 ${g.eyeY+g.noseLen+3}`:`M123 ${g.eyeY+6} Q128 ${g.eyeY+g.noseLen} 125 ${g.eyeY+g.noseLen+2}`;
 const shadow=`M${R-20} ${g.top+6} Q${R} ${g.top+18} ${R} 100 Q${R-1} ${jawY} 124 ${g.chin-1} Q${R-10} ${jawY-10} ${R-14} 96 Q${R-16} ${g.top+20} ${R-20} ${g.top+6}Z`;
 const nw=g.neck*1.2,neck=`M${120-nw} ${g.chin-20} H${120+nw} V180 Q120 192 ${120-nw} 180Z`;
 const chinShadow=`M${120-nw} ${g.chin-8} Q120 ${g.chin+12} ${120+nw} ${g.chin-8} V${g.chin+4} Q120 ${g.chin+20} ${120-nw} ${g.chin+4}Z`;
 const beard=`M${L+4} 116 Q${L+8} ${g.chin-6} 120 ${g.chin+2} Q${R-8} ${g.chin-6} ${R-4} 116 Q${R-10} ${mouthY-2} ${R-22} ${mouthY} Q120 ${mouthY-8} ${L+22} ${mouthY} Q${L+10} ${mouthY-2} ${L+4} 116Z`;
 const stubble=`M${L+6} 118 Q${L+12} ${g.chin-6} 120 ${g.chin} Q${R-12} ${g.chin-6} ${R-6} 118 Q${R-14} ${mouthY+4} 120 ${mouthY+6} Q${L+14} ${mouthY+4} ${L+6} 118Z`;
 const mustache=`M${120-g.mouthW-2} ${mouthY-3} Q120 ${mouthY-11} ${120+g.mouthW+2} ${mouthY-3} Q${120+g.mouthW/2} ${mouthY+1} 120 ${mouthY-2} Q${120-g.mouthW/2} ${mouthY+1} ${120-g.mouthW-2} ${mouthY-3}Z`;
 const eye=(cx:number,s:number)=>({cx,cy:g.eyeY,rx:g.eyeRx*.95,ry:g.eyeRy*.55,rot:s*g.tilt*.5});
 return {g,L,R,jawY,head,hairFit,eyes:[eye(eyeL,1),eye(eyeR,-1)],eyeL,eyeR,browY,mouthY,nose,shadow,neck,chinShadow,beard,stubble,mustache};
}
/** Shirt: sloping shoulders filling the print frame, a V collar, raglan seams, folds and a small crest. */
const SHIRT='M-12 316 C-10 256 0 214 38 200 C64 191 88 184 100 172 L140 172 C152 184 176 191 202 200 C240 214 250 256 252 316Z';
const SHIRT_SHADE='M166 186 C184 194 196 196 204 202 C238 218 248 258 252 316 H188 C192 282 190 236 166 186Z';
const SHIRT_LINES='M92 178 C80 220 58 262 48 316 M148 178 C160 220 182 262 192 316 M70 250 Q84 272 80 304 M176 244 Q166 270 170 304';
const V_NECK='M100 172 L120 200 L140 172Z',CREST='M146 226 h14 v8 q0 8 -7 11 q-7 -3 -7 -11z';
/** Halftone screens: dot coverage steps (as in scripts/fetch-player-photos.py: ink at 45°, tone at 15°). */
const SCREEN=[.1,.2,.32,.46,.62,.8],PITCH=3.4;
/** The big card shows the print ~4× larger: a finer screen keeps the dots near the photo masks' on-screen size. */
const BIG_PITCH=1.6;
const lum=(hex:string)=>{const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);return .2126*r+.7152*g+.0722*b;};
const clamp01=(n:number)=>Math.max(0,Math.min(1,n));
function Screens({id,ink,tone,f,pitch=PITCH}:{id:string;ink:string;tone:string;f:Look;pitch?:number}){
 const set=(kind:Drum,angle:number,colour:string)=>SCREEN.map((c,i)=><pattern key={kind+i} id={`${id}${kind}${i}`} patternUnits="userSpaceOnUse" width={pitch} height={pitch} patternTransform={`rotate(${angle})`}><circle cx={pitch/2} cy={pitch/2} r={(pitch*Math.sqrt(c/Math.PI)).toFixed(2)} fill={colour}/></pattern>);
 return <>{set('i',45,ink)}{set('t',15,tone)}{set('s',75,skinInk(f))}{set('h',75,hairInk(f))}</>;
}
/**
 * Drums: `i` deep-green ink (linework, hair, the deepest shadows), `t` the flag-colour tone (kit, background),
 * `s` a warm skin ink in the player's own skin colour (all skin, so every skin depth prints as a natural warm tone,
 * never green), `h` light or red hair printed in its own colour so it doesn't vanish into the paper.
 */
type Drum='i'|'t'|'s'|'h';
const skinInk=(f:Look)=>mix(f.skin,'#8a3f24',.3);
/** Light hair ink: the hair colour a little deeper, so blonde still prints against cream paper. */
const hairInk=(f:Look)=>mix(f.hair,'#7a4a1c',.32);
/** A fill for coverage c (0..1) on one drum: nothing, the nearest halftone screen, or solid ink. */
const screen=(id:string,kind:Drum,colour:string)=>(c:number)=>c<.05?'none':c>.9?colour:`url(#${id}${kind}${SCREEN.reduce((best,s,i)=>Math.abs(s-c)<Math.abs(SCREEN[best]-c)?i:best,0)})`;

/**
 * How dark each part is (0 paper … 1 solid), from the authored skin and hair so players stay recognisable. Both drums
 * print that one value map like the photo script does: the ink carries the darks, the tone the midtones.
 */
function valuesFor(f:Look){
 const d=clamp01((.8-lum(f.skin))/.56),h=clamp01((.83-lum(f.hair))/.76),red=parseInt(f.hair.slice(1,3),16)-parseInt(f.hair.slice(3,5),16)>90;
 const skin=.22+d*.38,hair=red?.52:.44+h*.56;
 return {d,h,red,skin,shade:Math.min(.9,skin+.28-d*.06),hair,dark:hair>.88,kit:.5,kitShade:.76};
}
/** Ink takes the darks (nothing in the highlights); tone the lights and mids, capped so the flag colour stays a tint. */
const inkOf=(v:number)=>clamp01((v-.13)/.74),toneOf=(v:number)=>Math.min(.5,v*.72);

/** One value region: paper under it (white, so it vanishes under multiply) then its screen, so a denser region replaces, never stacks on, the one below. */
const ell=(cx:number,cy:number,rx:number,ry:number)=>`M${(cx-rx).toFixed(1)} ${cy.toFixed(1)}a${rx.toFixed(1)} ${ry.toFixed(1)} 0 1 0 ${(rx*2).toFixed(1)} 0a${rx.toFixed(1)} ${ry.toFixed(1)} 0 1 0 ${(-rx*2).toFixed(1)} 0Z`;
function FigureValues({id,f,kind,colour}:{id:string;f:Look;kind:'i'|'t';colour:string}){
 const G=figureGeom(f),{g}=G,V=valuesFor(f),at=screen(id,kind,colour),s=(v:number)=>at(kind==='i'?inkOf(v):toneOf(v));
 // Skin: the tone pass prints it in the warm skin ink (coverage rises with skin depth and shading); the green ink
 // only touches skin in its deepest shadows, lightly, so faces never read green.
 const warm=screen(id,'s',skinInk(f)),skinFill=(v:number,shadow:number)=>kind==='t'?warm(clamp01(.42+(v-.22)*1.05)):at(shadow*(.35+.65*V.d));
 const R=({d,v,sk}:{d:string;v:number;sk?:number})=><><path d={d} fill="#fff"/><path d={d} fill={sk===undefined?s(v):skinFill(v,sk)}/></>;
 // Light and red hair print in their own colour on the tone pass; dark hair stays with the ink.
 const ownHair=kind==='t'&&(V.red||V.h<.55),hairTone=screen(id,'h',hairInk(f));
 const hs=(v:number)=>ownHair?hairTone(V.red?.8:.8):s(v);
 const H=({front,v,light}:{front:boolean;v:number;light:number})=><g transform={G.hairFit}><Hair style={f.style} front={front} fill="#fff" shade="#fff" light="#fff"/><Hair style={f.style} front={front} fill={hs(v)} shade={hs(Math.min(1,v+.1))} light={ownHair?hairTone(.46):s(light)}/></g>;
 const ears=[G.L,G.R].map(x=>ell(x,108,9*g.ear,13*g.ear)).join('');
 return <>
  <H front={false} v={V.hair} light={V.hair}/>
  {/* shirt: a mid value, the far side and the near arm in shadow */}
  <R d={SHIRT} v={V.kit}/><R d={SHIRT_SHADE} v={V.kitShade}/>
  <R d="M-12 316 C-10 256 0 214 38 200 C52 195 62 192 70 190 C40 214 30 260 28 316Z" v={V.kitShade-.1}/>
  {/* neck in shadow, darkest under the chin */}
  <R d={G.neck} v={V.shade} sk={.1}/><R d={V_NECK} v={V.shade+.08} sk={.16}/><R d={G.chinShadow} v={V.shade+.14} sk={.28}/>
  {/* ears and head: lit side, far-side shadow, eye sockets, lips, facial hair */}
  <R d={ears} v={V.skin+.1} sk={0}/>
  <R d={G.head} v={V.skin} sk={0}/>
  <R d={G.shadow} v={V.shade} sk={.12}/>
  <R d={G.eyes.map(e=>ell(e.cx,e.cy-3,e.rx+5,e.ry+5)).join('')} v={V.skin+.12} sk={.1}/>
  <R d={ell(120,G.mouthY+1,g.mouthW*.75,3.4)} v={V.skin+.14} sk={0}/>
  <R d={ell(120,G.mouthY+6,g.mouthW*.55,2.8)} v={V.skin+.24} sk={.1}/>
  {f.facial==='beard'&&<R d={G.beard} v={Math.max(.72,V.hair)}/>}
  {f.facial==='stubble'&&<path d={G.stubble} fill={kind==='t'?'none':at(.2)}/>}
  <H front v={V.hair} light={V.hair*.55}/>
 </>;
}

/** The deep-green ink drum: the dark values plus linework and features. */
function InkPass({id,f,ink}:{id:string;f:Look;ink:string}){
 const G=figureGeom(f),{g}=G,V=valuesFor(f),s=screen(id,'i',ink),line={stroke:ink,fill:'none',strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
 const strands=STRANDS[f.style],brow=V.hair>.5||V.d>.5?ink:s(.62);
 return <>
  <g mask={`url(#${id}knock)`}>
   <rect x="-8" y="-8" width="256" height="320" fill={s(.1)}/>
   <FigureValues id={id} f={f} kind="i" colour={ink}/>
   <path d={SHIRT_LINES} {...line} strokeWidth="1.2" opacity=".7"/>
   <path d={CREST} {...line} strokeWidth="1.3"/>
   <path d="M100 172 L120 200 L140 172" {...line} strokeWidth="4.5"/>
   <path d={G.nose} {...line} strokeWidth="2.2" stroke={s(.8)}/>
   <g transform={G.hairFit}>
    {!V.dark&&strands&&<path d={strands} {...line} strokeWidth="1.3" opacity=".75"/>}
    {f.headband&&<path d="M79 84 Q120 70 161 84 M79 92 Q120 78 161 92" {...line} strokeWidth="1.3"/>}
   </g>
  </g>
  {/* features stay crisp above the knock-outs */}
  {G.eyes.map((e,i)=><g key={i} transform={`rotate(${e.rot.toFixed(1)} ${e.cx} ${e.cy})`}>
   <circle cx={e.cx+.6} cy={e.cy+.2} r={Math.min(3.2,e.ry*1.15)} fill={ink}/>
   <path d={`M${e.cx-e.rx-1.5} ${e.cy+.6} Q${e.cx} ${e.cy-e.ry*2.2} ${e.cx+e.rx+1.5} ${e.cy-.4}`} {...line} strokeWidth="2.2"/>
  </g>)}
  <path d={`M${G.eyeL-9} ${G.browY+2-g.browArch*.3} Q${G.eyeL} ${G.browY-g.browArch} ${G.eyeL+8} ${G.browY+1}`} {...line} stroke={brow} strokeWidth={g.brow*.9}/>
  <path d={`M${G.eyeR-8} ${G.browY+1} Q${G.eyeR} ${G.browY-g.browArch} ${G.eyeR+9} ${G.browY+2-g.browArch*.3}`} {...line} stroke={brow} strokeWidth={g.brow*.9}/>
  <path d={`M116 ${g.eyeY+g.noseLen+3} q2 1.6 4 0 M122.5 ${g.eyeY+g.noseLen+3} q2 1.6 4 0`} {...line} strokeWidth="1.8"/>
  {f.facial==='mustache'&&<path d={G.mustache} fill={V.hair>.5?ink:s(.8)}/>}
  <path d={`M${120-g.mouthW} ${G.mouthY} Q120 ${G.mouthY+g.smile*.3} ${120+g.mouthW} ${G.mouthY}`} {...line} strokeWidth="2.2"/>
 </>;
}

/** The flag-colour tone drum: the same values, lighter, printed under the ink with a paper tint behind the player. */
function TonePass({id,f,tone}:{id:string;f:Look;tone:string}){
 return <g mask={`url(#${id}knock)`}>
  <rect x="-8" y="-8" width="256" height="320" fill={screen(id,'t',tone)(.1)}/>
  <FigureValues id={id} f={f} kind="t" colour={tone}/>
 </g>;
}

/** Shared defs for both drums: the screens, the side fade (like the photo vignette), and paper knock-outs (eye whites, headband, sheen, highlights). */
function PrintDefs({id,f,ink,tone,pitch}:{id:string;f:Look;ink:string;tone:string;pitch?:number}){
 const G=figureGeom(f),{g}=G,V=valuesFor(f),strands=STRANDS[f.style];
 return <defs>
  <Screens id={id} ink={ink} tone={tone} f={f} pitch={pitch}/>
  <linearGradient id={`${id}fade`} gradientUnits="userSpaceOnUse" x1="-8" x2="248" y1="0" y2="0"><stop offset=".1" stopColor="#000"/><stop offset=".3" stopColor="#fff"/><stop offset=".7" stopColor="#fff"/><stop offset=".9" stopColor="#000"/></linearGradient>
  <mask id={`${id}knock`} maskUnits="userSpaceOnUse" x="-8" y="-8" width="256" height="320">
   <rect x="-8" y="-8" width="256" height="320" fill={`url(#${id}fade)`}/>
   <rect x="72" y="-8" width="96" height="200" fill="#fff"/>
   {/* light falls from the upper left: forehead, cheekbone and nose bridge print lighter */}
   <g fill="#000" opacity=".16"><ellipse cx={G.L+g.w*.6} cy={g.top+20} rx={g.w*.45} ry="9"/><ellipse cx={G.eyeL-3} cy={g.eyeY+15} rx="9" ry="6"/><ellipse cx="119" cy={g.eyeY+g.noseLen*.5} rx="2.6" ry={g.noseLen*.45}/><ellipse cx="116" cy={g.chin-8} rx="7" ry="3.5"/></g>
   {G.eyes.map((e,i)=><ellipse key={i} cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} transform={`rotate(${e.rot.toFixed(1)} ${e.cx} ${e.cy})`} fill="#000"/>)}
   <g transform={G.hairFit}>
    {f.headband&&<path d="M79 84 Q120 70 161 84 L161 92 Q120 78 79 92Z" fill="#000"/>}
    {V.dark&&strands&&<path d={strands} stroke="#000" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity=".8"/>}
    {f.style==='bald'&&<path d="M94 66 Q112 56 132 62" stroke="#000" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".7"/>}
   </g>
  </mask>
 </defs>;
}

/** The body outline only (hair, head, neck, shirt): for the not-yet-collected silhouette. */
function FigureShape({f,fill}:{f:Look;fill:string}){
 const G=figureGeom(f),{g}=G;
 return <g fill={fill}>
  <g transform={G.hairFit}><Hair style={f.style} front={false} fill={fill} shade={fill} light={fill}/></g>
  <path d={SHIRT}/><path d={G.neck}/>
  {[G.L,G.R].map(x=><ellipse key={x} cx={x} cy="108" rx={9*g.ear} ry={13*g.ear}/>)}
  <path d={G.head}/>
  <g transform={G.hairFit}><Hair style={f.style} front fill={fill} shade={fill} light={fill}/></g>
 </g>;
}

/** The print frame: the photo masks' 4:5, framed on head and shoulders like the photos. */
const PRINT_VIEW='16 14 208 260';
/**
 * A drawn player printed like the riso photo portraits: the same two drums (flag-colour tone at a small
 * misregistration, deep-green ink over it, both multiplied) over the same cream paper arch, so drawn and photo
 * cards read as one set. Static SVG patterns and one mask per card: no filters, no canvas, no animation.
 */
function RisoPrint({id,f,country,cls,pitch}:{id:string;f:Look;country?:string;cls:{paper:string;tone:string;ink:string};pitch?:number}){
 const tone=toneInk(country);
 return <>
  <span className={cls.paper}/>
  <svg className={cls.tone} viewBox={PRINT_VIEW} preserveAspectRatio="xMidYMax meet"><PrintDefs id={id} f={f} ink={INK} tone={tone} pitch={pitch}/><TonePass id={id} f={f} tone={tone}/></svg>
  <svg className={cls.ink} viewBox={PRINT_VIEW} preserveAspectRatio="xMidYMax meet"><InkPass id={id} f={f} ink={INK}/></svg>
 </>;
}

function Foreground({f}:{f:{seed:number}}){
 const dots=[0,1,2,3,4,5].map(i=>{const s=(f.seed>>(i*3))&7;return {x:18+i*40+s*2,y:18+((s*23+i*37)%70),c:['#fff1d3','#f0a0d0','#ffd66b','#6ccdb0'][(s+i)%4],r:3+(s%3)};});
 return <>
  {dots.map((d,i)=><rect key={i} x={d.x} y={d.y} width={d.r*2} height={d.r} rx="1" fill={d.c} transform={`rotate(${(i*47)%90-45} ${d.x} ${d.y})`} opacity=".9"/>)}
 </>;
}

export type PlayerPhoto={slug:string;article:string;file:string;artist:string;license:string;licenseUrl:string};
/** A freely licensed Wikimedia photo, pre-printed as riso ink masks (scripts/fetch-player-photos.py), when one exists. */
/** Photo manifests are split by batch (legends / current stars / futsal) so separate agents never write the same file; later batches win. */
const PHOTOS:Record<string,PlayerPhoto>={...(photos as Record<string,PlayerPhoto>),...(starPhotos as Record<string,PlayerPhoto>),...(futsalPhotos as Record<string,PlayerPhoto>),...(womenPhotos as Record<string,PlayerPhoto>)};
export const photoFor=(name:string):PlayerPhoto|undefined=>PHOTOS[name];
/** The riso halftone ink: the flag's strongest colour, never its white or black. */
const toneInk=(country?:string)=>countryArt(country).flag.find(c=>c!=='#ffffff'&&c!=='#000000')??'#e9798b';

/** Flag white prints as island cream and flag black as deep ink (same rule as PlayerThumb's flag bands). */
const bandsFor=(country?:string)=>{const [a,b,c]=countryArt(country).flag.map(paint);return a===c?`linear-gradient(160deg,${a} 0 38%,${b} 38% 62%,${a} 62%)`:`linear-gradient(160deg,${a} 0 34%,${b} 34% 67%,${c} 67%)`;};

/**
 * Player artwork. With a photo (the photoFor manifests) the portrait is the riso-printed photo; without one it is
 * the drawn player printed the same way (RisoPrint), so a page of mixed cards reads as one set.
 * - `layered`: the big PlayerCard's parallax planes (live country scene, portrait, foreground).
 * - `size`: a square list thumbnail (PlayerThumb's fallback): flag bands, paper arch, head and shoulders.
 * - neither: fills its positioned parent (MiniCard's picture window): the coast backdrop and the portrait.
 * - `silhouette`: a not-yet-collected card: the player's outline as a dark screen on plain card stock.
 */
export default function PlayerArt({name,team='gold',layered=false,size,look,country,silhouette=false}:{name:string;team?:Team;layered?:boolean;size?:number;look?:Look;country?:string;silhouette?:boolean}){
 const id=useId().replace(/:/g,''),authored=lookFor(name),f=look??authored.look;country=country??authored.country;
 void team;
 const view='0 0 240 240',photo=photoFor(name);
 if(silhouette)return <svg className={styles.flat} viewBox="0 0 240 240" width={size} height={size} aria-hidden="true">
  <defs><pattern id={`${id}sh`} patternUnits="userSpaceOnUse" width={PITCH} height={PITCH} patternTransform="rotate(45)"><circle cx={PITCH/2} cy={PITCH/2} r={PITCH*.46} fill="#33403a"/></pattern></defs>
  <rect width="240" height="240" rx="40" fill="#c9bc9d"/><path d="M40 240 V112 A80 80 0 0 1 200 112 V240Z" fill="#d8ccb0"/>
  <svg x="12" y="0" width="216" height="240" viewBox={PRINT_VIEW} preserveAspectRatio="xMidYMax meet"><g opacity=".8"><FigureShape f={f} fill={`url(#${id}sh)`}/></g></svg>
 </svg>;
 if(!layered&&size!=null){
  const mask=(part:'ink'|'tone')=>photo?{WebkitMaskImage:`url(/players/${photo.slug}-${part}.webp)`,maskImage:`url(/players/${photo.slug}-${part}.webp)`}:{};
  return <span className={styles.thumb} style={{width:size,height:size,background:bandsFor(country)}} aria-hidden="true">
   {photo?<><span className={styles.thumbPaper}/><span className={`${styles.thumbMask} ${styles.thumbTone}`} style={{...mask('tone'),background:toneInk(country)}}/><span className={`${styles.thumbMask} ${styles.ink}`} style={mask('ink')}/></>
   :<RisoPrint id={id} f={f} country={country} cls={{paper:styles.thumbPaper,tone:`${styles.print} ${styles.thumbPrint} ${styles.thumbTone}`,ink:`${styles.print} ${styles.thumbPrint} ${styles.printInk}`}}/>}
  </span>;
 }
 if(!layered)return <span className={styles.fill} aria-hidden="true">
  <CoastBackdrop seed={f.seed} country={country} className={styles.fillBackdrop}/>
  <span className={styles.fillPortrait}>
   {photo?<><span className={styles.fillPaper}/>
    <span className={`${styles.maskPart} ${styles.tone}`} style={{background:toneInk(country),WebkitMaskImage:`url(/players/${photo.slug}-tone.webp)`,maskImage:`url(/players/${photo.slug}-tone.webp)`}}/>
    <span className={`${styles.maskPart} ${styles.ink}`} style={{WebkitMaskImage:`url(/players/${photo.slug}-ink.webp)`,maskImage:`url(/players/${photo.slug}-ink.webp)`}}/></>
   :<RisoPrint id={id} f={f} country={country} cls={{paper:styles.fillPaper,tone:`${styles.print} ${styles.printTone} ${styles.small}`,ink:`${styles.print} ${styles.printInk}`}}/>}
  </span>
 </span>;
 return <div className={styles.layers} aria-hidden="true">
  <svg className={`${styles.layer} ${styles.back}`} viewBox={view} preserveAspectRatio="xMidYMid slice"><Backdrop id={id} f={f} country={country} live/></svg>
  <LiveScenery seed={f.seed} country={country} className={`${styles.layer} ${styles.back} ${styles.live}`}/>
  <div className={`${styles.layer} ${styles.mid} ${styles.riso}`}>
   {photo?<>
    <span className={styles.paper}/>
    <span className={styles.tone} style={{background:toneInk(country),WebkitMaskImage:`url(/players/${photo.slug}-tone.webp)`,maskImage:`url(/players/${photo.slug}-tone.webp)`}}/>
    <span className={styles.ink} style={{WebkitMaskImage:`url(/players/${photo.slug}-ink.webp)`,maskImage:`url(/players/${photo.slug}-ink.webp)`}}/>
   </>:<RisoPrint id={id} f={f} country={country} cls={{paper:styles.paper,tone:`${styles.print} ${styles.printTone}`,ink:`${styles.print} ${styles.printInk}`}} pitch={BIG_PITCH}/>}
  </div>
  <svg className={`${styles.layer} ${styles.front}`} viewBox={view} preserveAspectRatio="xMidYMax slice"><Foreground f={f}/></svg>
 </div>;
}
