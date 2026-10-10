'use client';
import {memo,useEffect,useMemo,useRef,useState,type PointerEventHandler} from 'react';
import {GROUND,sample,sampleBall,solve,type Rig,type Pt} from './rig';
import {WHISTLE_SFX,type Call,type Scene,type Fig,type Sfx} from './content';
import styles from './Experience.module.css';

/**
 * cards-1970 · the replay panel, drawn as a page of sports manga (Oct 9 2026 style pass, user: "the museum is a playground for
 * different styles"). Black ink on paper, screentone dots for every grey (SVG patterns, painted once, never per frame),
 * speed lines (流線) behind a running player, focus lines (集中線) that converge on the key moment, and hand-lettered sound
 * effects in katakana with an English gloss, as translated manga prints them. Only the cards (and the traffic-light lamps) are
 * in colour, so the decision is the one thing that glows.
 *
 * The panel is a pure picture of time `t`: the clip clock (Clip.tsx) owns playback, flick-scrubbing and springs, so every
 * stroke here, sound-effect pops included, is a function of t and scrubs backwards as well as forwards. Nothing animates here
 * on its own. Reduced motion: the clock sits on the key still. Figures come from the grounded rig in ./rig.ts.
 */
type Props={scene:Scene;t:number;playing:boolean;revealed:Call|null;scrub?:{down:PointerEventHandler<SVGSVGElement>;move:PointerEventHandler<SVGSVGElement>;up:PointerEventHandler<SVGSVGElement>}};

export const INK='#141414',PAPER='#f7f3e8',TONE='#141414';

/** The screentone sheets: three dot densities at the classic 45° screen, plus a gradation (dots fading out). */
export function Tones({id}:{id:string}){
 const dots=(n:string,step:number,r:number)=><pattern id={id+n} width={step} height={step} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx={step/2} cy={step/2} r={r} fill={TONE}/></pattern>;
 return <>
  {dots('L',6,.95)}{dots('M',5,1.35)}{dots('D',4.4,1.75)}
  <pattern id={id+'H'} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><line x1="0" y1="0" x2="0" y2="7" stroke={TONE} strokeWidth="1.1"/></pattern>
  <linearGradient id={id+'fadeG'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff"/><stop offset="1" stopColor="#000"/></linearGradient>
  <mask id={id+'fade'} maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill={`url(#${id}fadeG)`}/></mask>
 </>;
}

/** A tapered capsule from a (radius ra) to b (radius rb), as one path (both ends rounded, sweep 0 = the far side). */
function cap(a:Pt,b:Pt,ra:number,rb:number){
 let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const nx=-dy,ny=dx,f=(v:number)=>v.toFixed(1);
 return `M${f(a[0]+nx*ra)},${f(a[1]+ny*ra)}L${f(b[0]+nx*rb)},${f(b[1]+ny*rb)}A${rb},${rb} 0 0 0 ${f(b[0]-nx*rb)},${f(b[1]-ny*rb)}L${f(a[0]-nx*ra)},${f(a[1]-ny*ra)}A${ra},${ra} 0 0 0 ${f(a[0]+nx*ra)},${f(a[1]+ny*ra)}Z`;
}
const at=(a:Pt,b:Pt,k:number):Pt=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k];
function sideD(r:Rig,l:Rig['far']){
 return cap(r.shoulder,l.elbow,6.2,5)+cap(l.elbow,l.hand,5,3.6)+cap(l.hand,l.hand,4.4,4.4)
  +cap(r.hip,l.knee,12,7.4)+cap(l.knee,at(l.knee,l.ankle,.35),7.4,7)+cap(at(l.knee,l.ankle,.35),l.ankle,7,4.2)+cap(l.ankle,l.toe,5.2,3.6);
}
function bodyD(r:Rig,dir:number){
 const hd=r.head,nose:Pt=[hd[0]+(hd[0]-r.shoulder[0])*.02+dir*11.5,hd[1]+2];
 return cap(r.hip,r.shoulder,12.5,14.5)+cap(r.shoulder,hd,6,6)+cap(hd,hd,12,12)+cap(nose,nose,2.6,2.6);
}
/** Kits in ink: the attackers wear black (solid ink), the defenders white (paper with an ink line), the keeper a tone. */
const KIT:Record<string,{fill:string;num:string;far:string}>={a:{fill:INK,num:PAPER,far:'#3a3a3a'},d:{fill:PAPER,num:INK,far:'#d9d4c6'},k:{fill:'url(#c70M)',num:INK,far:'url(#c70L)'}};

function Figure({fig,t,watch,ghost}:{fig:Fig;t:number;watch:boolean;ghost?:number}){
 const s=sample(fig.keys,t),r:Rig=solve(s.pose,s.x,s.lift,fig.dir);
 const far=sideD(r,r.far),near=sideD(r,r.near)+bodyD(r,fig.dir);
 if(ghost)return <path d={far+near} fill="none" stroke={INK} strokeWidth="1.2" opacity={ghost}/>;
 const kit=KIT[fig.id]??KIT.a;
 const mid=at(r.hip,r.shoulder,.52),ang=Math.atan2(r.shoulder[0]-r.hip[0],r.hip[1]-r.shoulder[1])*180/Math.PI;
 const shadow=Math.max(.15,1-s.lift/70),hx=(r.hip[0]+r.shoulder[0])/2;
 // An ink outline around the merged silhouette: a thick ink stroke under the fill (so overlaps never show a seam).
 return <g data-fig={fig.id}>
  <ellipse cx={hx} cy={GROUND+4} rx={34*shadow} ry={4.5} fill="url(#c70D)" opacity={.9*shadow}/>
  <path d={far} fill="none" stroke={INK} strokeWidth="5" strokeLinejoin="round"/><path d={far} fill={kit.far}/>
  <path d={near} fill="none" stroke={INK} strokeWidth="5.5" strokeLinejoin="round"/><path d={near} fill={kit.fill}/>
  <text x={mid[0]} y={mid[1]} transform={`rotate(${ang.toFixed(1)} ${mid[0].toFixed(1)} ${mid[1].toFixed(1)})`} textAnchor="middle" dominantBaseline="central" className={styles.num} fill={kit.num}>{fig.num}</text>
  {watch&&<path d={`M${r.head[0]-9},${r.head[1]-40} l9,11 l9,-11 z`} fill={INK} stroke={PAPER} strokeWidth="2" strokeLinejoin="round"/>}
 </g>;
}
function grabShape(scene:Scene,t:number){
 const g=scene.grab;if(!g||t<g.t0||t>g.t1)return null;
 const f=scene.figs.find(x=>x.id===g.from)!,to=scene.figs.find(x=>x.id===g.to)!;
 const a=sample(f.keys,t),b=sample(to.keys,t),ra=solve(a.pose,a.x,a.lift,f.dir),rb=solve(b.pose,b.x,b.lift,to.dir);
 const back=(k:number):Pt=>[rb.hip[0]+(rb.shoulder[0]-rb.hip[0])*k-12*to.dir,rb.hip[1]+(rb.shoulder[1]-rb.hip[1])*k];
 const h=ra.near.hand,p1=back(.8),p2=back(.4);
 return <path d={`M${h[0]},${h[1]} Q${(h[0]+p1[0])/2},${(h[1]+p1[1])/2-6} ${p1[0]},${p1[1]} L${p2[0]},${p2[1]} Q${(h[0]+p2[0])/2},${(h[1]+p2[1])/2+4} ${h[0]},${h[1]} Z`} fill={INK} stroke={INK} strokeWidth="2"/>;
}

/** The SVG's size in the page (a ResizeObserver, no polling). */
function useBox(){
 const ref=useRef<SVGSVGElement>(null),[box,setBox]=useState({aspect:2,wide:true});
 useEffect(()=>{const el=ref.current;if(!el||typeof ResizeObserver==='undefined')return;
  const ro=new ResizeObserver(([e])=>{const {width,height}=e.contentRect;if(width>0&&height>0)setBox(b=>{const n={aspect:Math.round(width/height*50)/50,wide:width>=600};return n.aspect===b.aspect&&n.wide===b.wide?b:n;});});
  ro.observe(el);return ()=>ro.disconnect();},[]);
 const a=box.aspect,H=box.wide?Math.min(560,Math.max(300,920/a)):Math.min(420,Math.max(262,390/a));
 return {ref,W:H*a,H,top:360-H,wide:box.wide};
}
const clampX=(cx:number,W:number)=>Math.max(-300,Math.min(1100-W,cx-W/2));
function rnd(seed:number){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}

/** Focus lines (集中線): thin ink wedges converging on a point, leaving a clear eye in the middle. Built once per centre. */
export function focusLines(cx:number,cy:number,inner:number,outer:number,n:number,seed:number){
 const r=rnd(seed);let d='';
 for(let i=0;i<n;i++){const a=i/n*Math.PI*2+r()*.05,w=.004+r()*.012,ri=inner*(1+r()*.7),ro=outer;
  const p=(ang:number,rad:number)=>`${(cx+Math.cos(ang)*rad).toFixed(1)},${(cy+Math.sin(ang)*rad).toFixed(1)}`;
  d+=`M${p(a,ri)}L${p(a-w,ro)}L${p(a+w,ro)}Z`;}
 return d;
}
/** Speed lines (流線): horizontal ink strokes of different lengths, trailing behind a runner. */
const SPEED=(()=>{const r=rnd(77);return Array.from({length:11},(_,i)=>({y:-96+i*9.5+r()*4,l:50+r()*110,o:r()*30,w:.8+r()*1.6}));})();

/** The stadium at night as a manga background: ink line art, a gradation tone for the sky, a dotted crowd. Drawn once. */
const Stadium=memo(function Stadium({goal}:{goal?:boolean}){
 const heads=useMemo(()=>{const r=rnd(1970),out:{x:number;y:number;s:number}[]=[];
  for(let row=0;row<3;row++)for(let x=-420+row*4;x<1220;x+=9+r()*6)out.push({x,y:256+row*12+r()*3,s:3.6+r()*1.4});return out;},[]);
 const flare=useMemo(()=>[70,730].map((x,i)=>focusLines(x,66,34,120,40,11+i)),[]);
 return <g aria-hidden="true">
  <rect x="-420" y="-260" width="1640" height="570" fill={PAPER}/>
  {/* night sky: a gradation tone, densest at the top */}
  <rect x="-420" y="-260" width="1640" height="480" fill="url(#c70D)" mask="url(#c70fade)" opacity=".85"/>
  {[70,730].map((x,i)=><g key={x}>
   <path d={flare[i]} fill={INK} opacity=".55"/>
   <circle cx={x} cy={66} r={34} fill={PAPER}/>
   <path d={`M${x-7},84 L${x-14},252 L${x+14},252 L${x+7},84 Z`} fill={PAPER} stroke={INK} strokeWidth="2"/>
   <path d={Array.from({length:8},(_,j)=>{const y=90+j*20,w=7+j*.9;return `M${x-w},${y} L${x+w},${y+20} M${x+w},${y} L${x-w},${y+20}`;}).join(' ')} stroke={INK} strokeWidth="1.2"/>
   <rect x={x-28} y={52} width={56} height={30} rx={4} fill={INK}/>
   {[0,1,2,3].map(a=>[0,1].map(b=><circle key={a+'-'+b} cx={x-18+a*12} cy={61+b*12} r={4} fill={PAPER}/>))}</g>)}
  {/* the stand: roof in solid ink, posts, the crowd in tone with inked heads */}
  <rect x="-420" y="236" width="1640" height="10" fill={INK}/>
  {Array.from({length:14},(_,i)=><rect key={i} x={-400+i*120} y={242} width={3} height={52} fill={INK}/>)}
  <rect x="-420" y="246" width="1640" height="46" fill="url(#c70L)"/>
  <g fill={PAPER} stroke={INK} strokeWidth="1.1">{heads.map((c,i)=><circle key={i} cx={c.x} cy={c.y} r={c.s}/>)}</g>
  <rect x="-420" y="290" width="1640" height="14" fill={INK}/>
  {Array.from({length:20},(_,i)=><rect key={i} x={-410+i*82} y={294} width={30+(i*37)%34} height={5} fill={PAPER}/>)}
  {/* the pitch: a light tone, two mowing bands, the touchline */}
  <rect x="-420" y="304" width="1640" height={GROUND-304} fill={PAPER}/>
  <rect x="-420" y="304" width="1640" height={GROUND-304} fill="url(#c70L)" opacity=".7"/>
  <line x1="-420" y1="311" x2="1220" y2="311" stroke={INK} strokeWidth="1"/>
  <rect x="-420" y={GROUND} width="1640" height="300" fill={PAPER}/>
  <rect x="-420" y={GROUND} width="1640" height="300" fill="url(#c70H)" opacity=".5"/>
  <line x1="-420" y1={GROUND+.6} x2="1220" y2={GROUND+.6} stroke={INK} strokeWidth="3"/>
  {goal&&<g stroke={INK} fill="none" strokeLinecap="round">
   {Array.from({length:9},(_,i)=><line key={i} x1={712+i*9} y1={82+i*1.5} x2={720+i*9.3} y2={GROUND} strokeWidth="1"/>)}
   {Array.from({length:10},(_,i)=><line key={'h'+i} x1={712} y1={100+i*23} x2={786+i*1.3} y2={110+i*22} strokeWidth="1"/>)}
   <path d={`M784,92 L800,${GROUND}`} strokeWidth="2"/>
   <line x1="712" y1={GROUND} x2="712" y2="80" strokeWidth="9"/><line x1="712" y1="80" x2="784" y2="92" strokeWidth="7"/>
   <line x1="712" y1={GROUND} x2="712" y2="80" strokeWidth="5" stroke={PAPER}/><line x1="712" y1="80" x2="784" y2="92" strokeWidth="3.5" stroke={PAPER}/>
  </g>}
 </g>;
});

/** A spring-like pop, as a pure function of time since the cue (so it scrubs both ways): 0 → overshoot → 1. */
export const pop=(u:number)=>u<=0?0:1-Math.exp(-9*u)*Math.cos(15*u);

/** One hand-lettered sound effect: katakana in heavy brush-gothic with a thick paper outline, the gloss underneath. */
function Lettering({s,t}:{s:Sfx;t:number}){
 const u=t-s.t,k=pop(u),fade=u<.9?1:Math.max(0,1-(u-.9)/.5);if(k<=0||fade<=0)return null;const size=s.size??52;
 return <g transform={`translate(${s.x} ${s.y}) rotate(${s.rot}) scale(${k.toFixed(3)})`} opacity={fade.toFixed(3)} className={styles.sfx}>
  <text textAnchor="middle" fontSize={size} className={styles.sfxJa} stroke={PAPER} strokeWidth={size*.16} paintOrder="stroke" fill={INK}>{s.ja}</text>
  <text y={size*.62} textAnchor="middle" fontSize={size*.36} className={styles.sfxEn} stroke={PAPER} strokeWidth={5} paintOrder="stroke" fill={INK}>{s.en}</text>
 </g>;
}

/** Where the action is at time t: the figures (not the keeper) and the ball, averaged over ±0.3 s so the camera eases. */
function actionX(scene:Scene,t:number){
 let sum=0,n=0;for(const dt of [-.3,-.15,0,.15,.3]){const u=Math.max(0,Math.min(scene.duration,t+dt));
  for(const f of scene.figs)if(!f.keeper){sum+=sample(f.keys,u).x;n++;}sum+=sampleBall(scene.ball,u).x;n++;}
 return sum/n;
}

export function MatchStage({scene,t,playing,revealed,scrub}:Props){
 const box=useBox(),n=scene.note,nx=n.x2!=null?(n.x+n.x2)/2:n.x;
 // Camera: wide screens sit near the scene's framing; narrow ones follow the action. Once judged, frame the circled spot.
 const follow=box.wide?scene.focus*.75+actionX(scene,t)*.25:actionX(scene,t);
 const x0=clampX(revealed&&!playing?nx:follow,box.W);
 const ball=sampleBall(scene.ball,t);
 const watched=scene.figs.find(f=>f.num===scene.watch)!;
 const ws=sample(watched.keys,t),wPrev=sample(watched.keys,Math.max(0,t-.06)),speed=(ws.x-wPrev.x)/.06;
 // Focus lines converge on the key moment: strongest at it, gone 0.35 s either side.
 const near=Math.max(0,1-Math.abs(t-scene.moment)/.35);
 const focus=useMemo(()=>focusLines(scene.impact?.x??nx,scene.impact?.y??n.y-40,150,900,96,scene.id.length*13),[scene,nx,n.y]);
 const ghosts=Math.abs(t-scene.moment)<.5?[.5,.28].map((o,i)=>({o,t:Math.max(0,t-(i+1)*.09)})):[];
 const sfx=scene.whistle!=null?[...scene.sfx,{t:scene.whistle,x:(scene.impact?.x??nx)-150,y:120,ja:WHISTLE_SFX.ja,en:WHISTLE_SFX.en,rot:-6,size:46}]:scene.sfx;
 const lw=n.text.length*11.5+34,ly0=n.ly??n.y-(n.x2!=null?26:52),side=ly0<box.top+62,ly=side?n.y:ly0;
 const lx=Math.max(x0+lw/2+10,Math.min(x0+box.W-lw/2-10,side?n.x-38-lw/2:nx));
 return <svg ref={box.ref} className={styles.svg} viewBox={`0 ${box.top.toFixed(1)} ${box.W.toFixed(1)} ${box.H.toFixed(1)}`} preserveAspectRatio="xMidYMid slice"
  role="img" aria-label={`Practice call drawn as a manga panel. Watch number ${scene.watch}.`} onPointerDown={scrub?.down} onPointerMove={scrub?.move} onPointerUp={scrub?.up} onPointerCancel={scrub?.up} data-scrub={scrub?'':undefined}>
  <defs><Tones id="c70"/></defs>
  <g className={styles.cam} data-glide={revealed&&!playing||undefined} style={{transform:`translate(${(-x0).toFixed(1)}px,0)`}}>
   <Stadium goal={scene.goal}/>
   {near>0&&<path d={focus} fill={INK} opacity={(near*.9).toFixed(3)}/>}
   {Math.abs(speed)>120&&<g opacity={Math.min(1,(Math.abs(speed)-120)/260).toFixed(3)} stroke={INK} strokeLinecap="round">
    {SPEED.map((l,i)=>{const x=ws.x-Math.sign(speed)*(26+l.o),y=GROUND-60+l.y*.62;return <line key={i} x1={x} y1={y} x2={x-Math.sign(speed)*l.l} y2={y} strokeWidth={l.w}/>;})}</g>}
   {ghosts.map(g=><Figure key={g.o} fig={watched} t={g.t} watch={false} ghost={g.o}/>)}
   {scene.figs.map(f=><Figure key={f.id} fig={f} t={t} watch={f.num===scene.watch}/>)}
   {grabShape(scene,t)}
   <ellipse cx={ball.x} cy={GROUND+4} rx={9*Math.max(.3,1-ball.y/150)} ry={2.6} fill="url(#c70D)"/>
   <g transform={`translate(${ball.x.toFixed(1)} ${(GROUND-7.5-ball.y).toFixed(1)})`}>
    <circle r="8" fill={PAPER} stroke={INK} strokeWidth="2.4"/><path d="M-2.6,-3.4 l5,0 l1.6,4.6 l-4.1,3 l-4.1,-3 z" fill={INK}/>
   </g>
   {sfx.map((s,i)=><Lettering key={i} s={s} t={t}/>)}
   {revealed&&<g className={styles.note}>
    {n.x2!=null?<g stroke={INK} strokeWidth="3" fill={INK}><line x1={n.x+6} y1={n.y} x2={n.x2-6} y2={n.y} strokeDasharray="6 4"/><path d={`M${n.x},${n.y} l9,-6 v12 z M${n.x2},${n.y} l-9,-6 v12 z`} stroke="none"/></g>
     :<circle cx={n.x} cy={n.y} r="30" fill="none" stroke={INK} strokeWidth="3.5" strokeDasharray="7 5"/>}
    {/* the caption as a jagged shout balloon */}
    <g transform={`translate(${lx.toFixed(1)} ${ly.toFixed(1)})`}>
     <path d={balloon(lw,40)} fill={PAPER} stroke={INK} strokeWidth="3" strokeLinejoin="round"/>
     <text textAnchor="middle" dominantBaseline="central" className={styles.balloonText} fill={INK}>{n.text}</text>
    </g>
   </g>}
  </g>
 </svg>;
}
/** A shout balloon: a rounded box with a zig-zag edge (manga's "loud" balloon). */
function balloon(w:number,h:number){
 const pts:string[]=[],n=Math.max(10,Math.round(w/16));
 for(let i=0;i<n*2;i++){const a=i/(n*2)*Math.PI*2,r=i%2?1:1.18,x=Math.cos(a)*(w/2+8)*r,y=Math.sin(a)*(h/2+6)*(i%2?1:1.22);pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);}
 return `M${pts.join('L')}Z`;
}

/** Kensington High Street at night, 1966, in ink: a car waits at the junction; only the lit lamp is in colour. */
const BLOCKS=[[-200,170,70],[-10,150,40],[160,190,90],[370,130,30],[520,170,80],[710,260,50]] as const;
const LAMP:Record<Call,string>={red:'#e60012',yellow:'#ffc400',none:'#00a85a'};
const THOUGHT:Record<Call,{line:string;sfx:string}>={yellow:{line:'Yellow… careful!',sfx:'ハッ'},red:{line:'Red… STOP! You’re off!',sfx:'ピカッ'},none:{line:'Green… play on.',sfx:'スッ'}};
export function StreetStage({lit}:{lit:Call|null}){
 const win=useMemo(()=>{const r=rnd(1966),o:{x:number;y:number;on:boolean}[]=[];for(const [bx,bw,top] of BLOCKS)for(let y=top+22;y<262;y+=30)for(let x=bx+14;x<bx+bw-18;x+=26)o.push({x,y,on:r()<.32});return o;},[]);
 const rain=useMemo(()=>{const r=rnd(7),o:{x:number;y:number;l:number}[]=[];for(let i=0;i<70;i++)o.push({x:-300+r()*1300,y:-120+r()*420,l:14+r()*20});return o;},[]);
 const glow=useMemo(()=>focusLines(586,163,40,240,64,3),[]);
 const box=useBox(),x0=box.wide?clampX(430,box.W):Math.max(-300,Math.min(620,1100)-box.W),signX=box.wide?172:x0+14;
 const th=lit?THOUGHT[lit]:null;
 return <svg ref={box.ref} className={styles.svg} viewBox={`0 ${box.top.toFixed(1)} ${box.W.toFixed(1)} ${box.H.toFixed(1)}`} preserveAspectRatio="xMidYMid slice" role="img"
  aria-label={`A manga panel: a night street in London in 1966. A car waits at a traffic light on Kensington High Street.${th?` The driver thinks: ${th.line}`:''}`}>
  <defs><Tones id="c70s"/></defs>
  <g style={{transform:`translate(${(-x0).toFixed(1)}px,0)`}}>
   <rect x="-420" y="-260" width="1640" height="580" fill={PAPER}/>
   <rect x="-420" y="-260" width="1640" height="560" fill="url(#c70sD)"/>
   {BLOCKS.map(([x,w,top])=><g key={x}><rect x={x} y={top} width={w} height={300-top} fill={INK}/><rect x={x} y={top} width={w} height={300-top} fill="url(#c70sH)" opacity=".35"/></g>)}
   {win.map((w,i)=><rect key={i} x={w.x} y={w.y} width={12} height={16} fill={w.on?PAPER:'url(#c70sM)'}/>)}
   <g transform={`translate(${signX.toFixed(1)} 150)`}><rect width="176" height="44" rx="3" fill={PAPER} stroke={INK} strokeWidth="2"/><rect x="4" y="4" width="168" height="36" rx="2" fill="none" stroke={INK} strokeWidth="1.5"/>
    <text x="10" y="23" fontSize="11.5" fontWeight="800" fill={INK} dominantBaseline="central" textLength="128" lengthAdjust="spacingAndGlyphs">KENSINGTON HIGH ST</text><text x="146" y="23" fontSize="12.5" fontWeight="800" fill={INK} dominantBaseline="central">W8</text></g>
   <rect x="-420" y="300" width="1640" height="220" fill={PAPER}/>
   <rect x="-420" y="300" width="1640" height="220" fill="url(#c70sM)" opacity=".8"/>
   <line x1="-420" y1="300" x2="1220" y2="300" stroke={INK} strokeWidth="3"/>
   {[-300,-140,20,180].map(x=><rect key={x} x={x} y={350} width={90} height={4} fill={PAPER}/>)}
   {/* the lit lamp: focus lines burst from it and its colour runs down the wet road */}
   {lit&&<g key={lit} className={styles.burst}><path d={glow} fill={PAPER}/><ellipse cx="586" cy="330" rx="26" ry="70" fill={LAMP[lit]} opacity=".5"/></g>}
   <g fill={INK}><rect x="583" y="196" width="6" height="104"/><rect x="569" y="124" width="34" height="80" rx="6" stroke={PAPER} strokeWidth="2"/></g>
   {(['red','yellow','none'] as Call[]).map((c,i)=><circle key={c} cx="586" cy={142+i*22} r="8" fill={lit===c?LAMP[c]:'url(#c70sM)'} stroke={PAPER} strokeWidth="1.5" className={styles.streetLamp}/>)}
   {/* a 1960s saloon, its driver in a hat */}
   <g transform="translate(370 300)">
    <path d="M2,-12 Q0,-28 14,-31 L44,-35 Q56,-55 74,-58 L116,-59 Q132,-58 146,-37 L176,-33 Q186,-31 186,-18 L186,-10 Q186,-6 180,-6 L6,-6 Q2,-6 2,-12 Z" fill={INK} stroke={PAPER} strokeWidth="2"/>
    <path d="M60,-52 Q70,-54 112,-55 Q124,-54 134,-38 L56,-36 Z" fill="url(#c70sL)" stroke={PAPER} strokeWidth="1.5"/>
    <path d="M96,-38 L96,-46 Q100,-52 106,-46 L106,-38 Z M93,-47 L109,-47 L107,-51 L95,-51 Z" fill={INK}/>
    <line x1="88" y1="-55" x2="88" y2="-36" stroke={INK} strokeWidth="3"/>
    {[36,150].map(x=><g key={x}><circle cx={x} cy="-8" r="12.5" fill={INK} stroke={PAPER} strokeWidth="2"/><circle cx={x} cy="-8" r="5" fill={PAPER}/></g>)}
    <path d="M185,-22 L340,-52 L340,8 Z" fill={PAPER} opacity=".85"/>
   </g>
   <g stroke={PAPER} strokeWidth="1.3" opacity=".7">{rain.map((d,i)=><line key={i} x1={d.x} y1={d.y} x2={d.x-4} y2={d.y+d.l}/>)}</g>
   {/* the driver's thought: a cloud balloon with trailing bubbles, and the lamp's sound effect */}
   {th&&<g key={'t'+lit} className={styles.thought}>
    <circle cx="470" cy="236" r="5" fill={PAPER} stroke={INK} strokeWidth="2"/><circle cx="488" cy="214" r="8" fill={PAPER} stroke={INK} strokeWidth="2"/>
    <path d={cloud(380,150,220,56)} fill={PAPER} stroke={INK} strokeWidth="2.5"/>
    <text x="490" y="178" textAnchor="middle" dominantBaseline="central" className={styles.balloonText} fill={INK}>{th.line}</text>
    <text x="650" y="110" textAnchor="middle" fontSize="44" className={styles.sfxJa} stroke={INK} strokeWidth="7" paintOrder="stroke" fill={LAMP[lit!]} transform="rotate(-8 650 110)">{th.sfx}</text>
   </g>}
  </g>
 </svg>;
}
/** A thought cloud: bumps around an ellipse. */
function cloud(x:number,y:number,w:number,h:number){
 const cx=x+w/2,cy=y+h/2,n=12;let d='';
 for(let i=0;i<n;i++){const a0=i/n*Math.PI*2,a1=(i+1)/n*Math.PI*2,p=(a:number)=>`${(cx+Math.cos(a)*w/2).toFixed(1)},${(cy+Math.sin(a)*h/2).toFixed(1)}`;
  d+=(i?'':`M${p(a0)}`)+`A${(w/n*1.1).toFixed(1)},${(h/5).toFixed(1)} 0 0 1 ${p(a1)}`;}
 return d+'Z';
}
