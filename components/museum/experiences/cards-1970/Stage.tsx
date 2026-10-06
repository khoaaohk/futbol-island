'use client';
import {memo,useEffect,useMemo,useRef,useState} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import {GROUND,sample,sampleBall,solve,type Rig,type Pt} from './rig';
import type {Call,Scene,Fig} from './content';
import styles from './Experience.module.css';

/**
 * The replay window. Plays one practice call as back-lit silhouettes, then freezes on the last frame. Heat: one
 * requestAnimationFrame loop that runs only while a replay plays (≤ 4 s, or 7 s in slow motion), pauses while the tab is
 * hidden, and is cancelled on unmount; nothing animates while the visitor thinks. Reduced motion: no playback, just the key
 * still. The figures are drawn with the grounded rig in ./rig.ts.
 *
 * Polish pass (Oct 5 2026): the figures are tapered, filled silhouettes (shirt, shorts, calves, boots, a top rim light from the
 * floodlights) instead of round-capped sticks; the key moment plays in broadcast "bullet time" with an onion-skin trail on the
 * watched player (chronophotography, the 1970 way to show motion); and a camera follows the action on narrow screens, then
 * glides (a CSS transition, no loop) to the spot the verdict circles.
 */
type Props={scene:Scene;token:number;rate:number;reduced:boolean;onEnd:()=>void;revealed:Call|null};

const NEAR='#07080b',FAR='#1c1f28',RIM='#ffd29a';
const TEAM:Record<string,string>={a:'#ffd08a',d:'#9fd3ff',k:'#c5f27e'};

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
function Figure({fig,t,watch,ghost}:{fig:Fig;t:number;watch:boolean;ghost?:number}){
 const s=sample(fig.keys,t),r:Rig=solve(s.pose,s.x,s.lift,fig.dir);
 const far=sideD(r,r.far),near=sideD(r,r.near)+bodyD(r,fig.dir);
 if(ghost)return <path d={far+near} fill={NEAR} opacity={ghost}/>;
 const team=TEAM[fig.id]??TEAM.a;
 const mid=at(r.hip,r.shoulder,.52),ang=Math.atan2(r.shoulder[0]-r.hip[0],r.hip[1]-r.shoulder[1])*180/Math.PI;
 const sock=(l:Rig['far'],o:number)=>{const c=at(l.knee,l.ankle,.2),dx=l.ankle[0]-l.knee[0],dy=l.ankle[1]-l.knee[1],k=7.6/(Math.hypot(dx,dy)||1);
  return <line x1={c[0]-dy*k} y1={c[1]+dx*k} x2={c[0]+dy*k} y2={c[1]-dx*k} stroke={team} strokeWidth="3.2" opacity={o}/>;};
 const shadow=Math.max(.15,1-s.lift/70),hx=(r.hip[0]+r.shoulder[0])/2;
 return <g data-fig={fig.id}>
  <ellipse cx={hx} cy={GROUND+4} rx={34*shadow} ry={4.5} fill="#000" opacity={.45*shadow}/>
  {/* Rim light: the same shapes, nudged up toward the floodlights, under the silhouette. */}
  <path d={far} fill={RIM} opacity=".28" transform="translate(0 -1.6)"/>
  <path d={far} fill={FAR}/>{sock(r.far,.45)}
  <path d={near} fill={RIM} opacity=".55" transform="translate(0 -1.8)"/>
  <path d={near} fill={NEAR}/>{sock(r.near,.85)}
  <text x={mid[0]} y={mid[1]} transform={`rotate(${ang.toFixed(1)} ${mid[0].toFixed(1)} ${mid[1].toFixed(1)})`} textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="900" fill={team}>{fig.num}</text>
  {watch&&<path d={`M${r.head[0]-8},${r.head[1]-36} l8,9 l8,-9`} fill="none" stroke={RIM} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>}
 </g>;
}
function grabShape(scene:Scene,t:number){
 const g=scene.grab;if(!g||t<g.t0||t>g.t1)return null;
 const f=scene.figs.find(x=>x.id===g.from)!,to=scene.figs.find(x=>x.id===g.to)!;
 const a=sample(f.keys,t),b=sample(to.keys,t),ra=solve(a.pose,a.x,a.lift,f.dir),rb=solve(b.pose,b.x,b.lift,to.dir);
 const back=(k:number):Pt=>[rb.hip[0]+(rb.shoulder[0]-rb.hip[0])*k-12*to.dir,rb.hip[1]+(rb.shoulder[1]-rb.hip[1])*k];
 const h=ra.near.hand,p1=back(.8),p2=back(.4);
 return <path d={`M${h[0]},${h[1]} Q${(h[0]+p1[0])/2},${(h[1]+p1[1])/2-6} ${p1[0]},${p1[1]} L${p2[0]},${p2[1]} Q${(h[0]+p2[0])/2},${(h[1]+p2[1])/2+4} ${h[0]},${h[1]} Z`} fill={NEAR}/>;
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

/** The stadium at dusk: sky, lattice floodlights with beams, a roofed stand, ad boards and a floodlit pitch, drawn once. */
const Stadium=memo(function Stadium({goal}:{goal?:boolean}){
 const crowd=useMemo(()=>{const r=rnd(1970),out:{x:number;y:number;s:number;c:string}[]=[];
  for(let row=0;row<3;row++)for(let x=-420+row*4;x<1220;x+=8+r()*5)out.push({x,y:252+row*13+r()*4,s:4+r()*1.6,c:['#2c1f30','#33233a','#261b2b'][row]});return out;},[]);
 return <g aria-hidden="true">
  <defs>
   <linearGradient id="c70sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#14163a"/><stop offset=".4" stopColor="#40295a"/><stop offset=".72" stopColor="#c8644a"/><stop offset="1" stopColor="#f6bd78"/></linearGradient>
   <radialGradient id="c70flood"><stop offset="0" stopColor="#fff6dc" stopOpacity=".95"/><stop offset=".2" stopColor="#ffe2a8" stopOpacity=".4"/><stop offset="1" stopColor="#ffe2a8" stopOpacity="0"/></radialGradient>
   <linearGradient id="c70beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff2c8" stopOpacity=".22"/><stop offset="1" stopColor="#fff2c8" stopOpacity="0"/></linearGradient>
   <linearGradient id="c70pitch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2c387"/><stop offset=".55" stopColor="#c98d5a"/><stop offset="1" stopColor="#8a6244"/></linearGradient>
   <linearGradient id="c70fore" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a1512"/><stop offset=".4" stopColor="#0c0d10"/><stop offset="1" stopColor="#060709"/></linearGradient>
   <radialGradient id="c70sun" cx=".5" cy="1" r=".6"><stop offset="0" stopColor="#ffd39a" stopOpacity=".7"/><stop offset="1" stopColor="#ffd39a" stopOpacity="0"/></radialGradient>
  </defs>
  <rect x="-420" y="-260" width="1640" height="570" fill="url(#c70sky)"/>
  <ellipse cx="400" cy="250" rx="620" ry="150" fill="url(#c70sun)"/>
  {[70,730].map(x=>{const s=x<400?1:-1;return <g key={x}>
   <polygon points={`${x-22},80 ${x+26},80 ${x+s*260},${GROUND} ${x-s*120},${GROUND}`} fill="url(#c70beam)"/>
   <circle cx={x} cy={68} r={130} fill="url(#c70flood)"/>
   <path d={`M${x-7},84 L${x-14},250 L${x+14},250 L${x+7},84 Z`} fill="#16131f"/>
   <path d={Array.from({length:8},(_,i)=>{const y=90+i*20,w=7+i*.9;return `M${x-w},${y} L${x+w},${y+20} M${x+w},${y} L${x-w},${y+20}`;}).join(' ')} stroke="#2a2335" strokeWidth="1.2"/>
   <rect x={x-28} y={52} width={56} height={30} rx={4} fill="#16131f"/>
   {[0,1,2,3].map(i=>[0,1].map(j=><circle key={i+'-'+j} cx={x-18+i*12} cy={61+j*12} r={4} fill="#fff8e2"/>))}</g>;})}
  {/* The stand: a cantilever roof, three rows of fans, then the boards. */}
  <path d="M-420,236 L1220,236 L1220,244 L-420,244 Z" fill="#1d1626"/>
  {Array.from({length:14},(_,i)=><rect key={i} x={-400+i*120} y={240} width={3} height={56} fill="#1d1626"/>)}
  <rect x="-420" y="244" width="1640" height="56" fill="#3a2738" opacity=".55"/>
  {crowd.map((c,i)=><g key={i} fill={c.c}><circle cx={c.x} cy={c.y} r={c.s}/><path d={`M${c.x-c.s*1.7},${c.y+c.s*3.4} Q${c.x-c.s*1.6},${c.y+c.s*.9} ${c.x},${c.y+c.s*.9} Q${c.x+c.s*1.6},${c.y+c.s*.9} ${c.x+c.s*1.7},${c.y+c.s*3.4} Z`}/></g>)}
  <rect x="-420" y="290" width="1640" height="14" fill="#1a1420"/>
  {Array.from({length:20},(_,i)=><rect key={i} x={-410+i*82} y={293} width={30+(i*37)%34} height={4} rx={2} fill="#ffd29a" opacity=".14"/>)}
  <rect x="-420" y="289.5" width="1640" height="1" fill="#ffd29a" opacity=".35"/>
  {/* The floodlit pitch: warm haze far away, mowing bands, the touchline. */}
  <rect x="-420" y="304" width="1640" height={GROUND-304} fill="url(#c70pitch)"/>
  {[0,1,2].map(i=><rect key={i} x="-420" y={304+i*9} width="1640" height={4.5} fill="#000" opacity=".045"/>)}
  <rect x="-420" y="311" width="1640" height="1.2" fill="#fff" opacity=".3"/>
  <rect x="-420" y={GROUND} width="1640" height="300" fill="url(#c70fore)"/>
  <line x1="-420" y1={GROUND+.6} x2="1220" y2={GROUND+.6} stroke="#ffcf8a" strokeOpacity=".7" strokeWidth="1.2"/>
  {[0,1,2].map(i=><rect key={i} x="-420" y={GROUND+14+i*24} width="1640" height={11} fill="#fff" opacity={.035-i*.01}/>)}
  {goal&&<g stroke="#07080b" fill="none" strokeLinecap="round">
   {Array.from({length:9},(_,i)=><line key={i} x1={712+i*9} y1={82+i*1.5} x2={720+i*9.3} y2={GROUND} strokeWidth="1" strokeOpacity=".4"/>)}
   {Array.from({length:10},(_,i)=><line key={'h'+i} x1={712} y1={100+i*23} x2={786+i*1.3} y2={110+i*22} strokeWidth="1" strokeOpacity=".4"/>)}
   <path d={`M784,92 L800,${GROUND}`} strokeWidth="2" strokeOpacity=".8"/>
   <line x1="712" y1={GROUND} x2="712" y2="80" strokeWidth="8"/><line x1="712" y1="80" x2="784" y2="92" strokeWidth="6"/>
  </g>}
 </g>;
});

function Burst({x,y,k}:{x:number;y:number;k:number}){
 const pts=Array.from({length:16},(_,i)=>{const a=i*Math.PI/8,r=(i%2?7:22)*(.6+k*.8);return `${(x+Math.cos(a)*r).toFixed(1)},${(y+Math.sin(a)*r).toFixed(1)}`;}).join(' ');
 return <g opacity={1-k}><circle cx={x} cy={y} r={30*(.5+k)} fill="none" stroke="#fff4d6" strokeWidth={3*(1-k)}/><polygon points={pts} fill="#fff4d6"/></g>;
}

/** Where the action is at time t: the figures (not the keeper) and the ball, averaged over ±0.3 s so the camera eases. */
function actionX(scene:Scene,t:number){
 let sum=0,n=0;for(const dt of [-.3,-.15,0,.15,.3]){const u=Math.max(0,Math.min(scene.duration,t+dt));
  for(const f of scene.figs)if(!f.keeper){sum+=sample(f.keys,u).x;n++;}sum+=sampleBall(scene.ball,u).x;n++;}
 return sum/n;
}
/** Broadcast bullet time: the clock runs at 45% around the key moment on the first watch. */
const timeScale=(e:number,m:number)=>1-.55*Math.exp(-(((e-m)/.24)**2));

export function MatchStage({scene,token,rate,reduced,onEnd,revealed}:Props){
 const [t,setT]=useState(reduced?scene.moment:0);
 const end=useRef(onEnd);end.current=onEnd;
 useEffect(()=>{
  if(reduced){setT(scene.moment);end.current();return;}
  let raf=0,last=0,elapsed=0,whistled=false;
  const step=(now:number)=>{
   if(last)elapsed+=Math.min(.05,(now-last)/1000)*rate*(rate<1?1:timeScale(elapsed,scene.moment));last=now;
   const tt=Math.min(scene.duration,elapsed);setT(tt);
   if(scene.whistle!=null&&!whistled&&tt>=scene.whistle){whistled=true;museumSfx.whistle();}
   if(tt>=scene.duration){raf=0;end.current();return;}
   raf=requestAnimationFrame(step);
  };
  const vis=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else if(!raf&&elapsed<scene.duration){last=0;raf=requestAnimationFrame(step);}};
  setT(0);raf=requestAnimationFrame(step);document.addEventListener('visibilitychange',vis);
  return ()=>{cancelAnimationFrame(raf);raf=0;document.removeEventListener('visibilitychange',vis);};
 },[scene,token,rate,reduced]);
 const box=useBox(),n=scene.note,nx=n.x2!=null?(n.x+n.x2)/2:n.x;
 const playing=!reduced&&t<scene.duration;
 // Camera: wide screens sit near the scene's framing; narrow ones follow the action. Once judged, glide to the circled spot.
 const follow=box.wide?scene.focus*.75+actionX(scene,t)*.25:actionX(scene,t);
 const x0=clampX(revealed&&!playing?nx:follow,box.W);
 const ball=sampleBall(scene.ball,t),imp=scene.impact,ik=imp?(t-imp.t)/.45:-1;
 const watched=scene.figs.find(f=>f.num===scene.watch)!;
 const ghosts=playing&&Math.abs(t-scene.moment)<.5?[.18,.09].map((o,i)=>({o,t:Math.max(0,t-(i+1)*.08)})):[];
 const wx=sample(watched.keys,t).x;
 const lw=n.text.length*10.4+28,ly0=n.ly??n.y-(n.x2!=null?26:46),side=ly0<box.top+62,ly=side?n.y:ly0;
 const lx=Math.max(x0+lw/2+10,Math.min(x0+box.W-lw/2-10,side?n.x-38-lw/2:nx));
 return <svg ref={box.ref} className={styles.svg} viewBox={`0 ${box.top.toFixed(1)} ${box.W.toFixed(1)} ${box.H.toFixed(1)}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Practice call: silhouettes act out a moment. Watch number ${scene.watch}.`}>
  <defs><radialGradient id="c70spot"><stop offset="0" stopColor="#fff3d6" stopOpacity=".55"/><stop offset="1" stopColor="#fff3d6" stopOpacity="0"/></radialGradient></defs>
  <g className={styles.cam} data-glide={revealed&&!playing||undefined} style={{transform:`translate(${(-x0).toFixed(1)}px,0)`}}>
   <Stadium goal={scene.goal}/>
   <ellipse cx={wx} cy={GROUND+5} rx={58} ry={9} fill="url(#c70spot)"/>
   {ghosts.map(g=><Figure key={g.o} fig={watched} t={g.t} watch={false} ghost={g.o}/>)}
   {scene.figs.map(f=><Figure key={f.id} fig={f} t={t} watch={f.num===scene.watch}/>)}
   {grabShape(scene,t)}
   <ellipse cx={ball.x} cy={GROUND+4} rx={9*Math.max(.3,1-ball.y/150)} ry={2.6} fill="#000" opacity=".45"/>
   <g transform={`translate(${ball.x.toFixed(1)} ${(GROUND-7.5-ball.y).toFixed(1)})`}>
    <circle r="7.5" fill={NEAR}/><path d="M-5.6,-5 A7.5,7.5 0 0 1 5.6,-5" fill="none" stroke={RIM} strokeWidth="1.8" strokeLinecap="round" opacity=".85"/>
   </g>
   {imp&&ik>=0&&ik<1&&<Burst x={imp.x} y={imp.y} k={ik}/>}
   {revealed&&<g className={styles.note}>
    {n.x2!=null?<g stroke="#fff4d6" strokeWidth="2.5" fill="#fff4d6"><line x1={n.x+6} y1={n.y} x2={n.x2-6} y2={n.y} strokeDasharray="5 4"/><path d={`M${n.x},${n.y} l9,-6 v12 z M${n.x2},${n.y} l-9,-6 v12 z`} stroke="none"/></g>
     :<circle cx={n.x} cy={n.y} r="28" fill="none" stroke="#fff4d6" strokeWidth="2.5" strokeDasharray="6 5"/>}
    
    <g transform={`translate(${lx.toFixed(1)} ${ly.toFixed(1)})`}>
     <rect x={-lw/2} y={-16} width={lw} height={32} rx={16} fill="#fff4d6"/>
     <text textAnchor="middle" dominantBaseline="central" fontSize="17" fontWeight="800" fill="#121318">{n.text}</text>
    </g>
   </g>}
  </g>
 </svg>;
}

/** Kensington High Street at night, 1966: a car waits at the junction; the wet road reflects whichever lamp is lit. */
const BLOCKS=[[-200,170,70],[-10,150,40],[160,190,90],[370,130,30],[520,170,80],[710,260,50]] as const;
const LAMP:Record<Call,string>={red:'#ff3b30',yellow:'#ffb020',none:'#39e07a'};
export function StreetStage({lit}:{lit:Call|null}){
 const win=useMemo(()=>{const r=rnd(1966),o:{x:number;y:number;on:boolean}[]=[];for(const [bx,bw,top] of BLOCKS)for(let y=top+22;y<262;y+=30)for(let x=bx+14;x<bx+bw-18;x+=26)o.push({x,y,on:r()<.32});return o;},[]);
 const rain=useMemo(()=>{const r=rnd(7),o:{x:number;y:number;l:number}[]=[];for(let i=0;i<90;i++)o.push({x:-300+r()*1300,y:-120+r()*420,l:8+r()*12});return o;},[]);
 const box=useBox(),x0=box.wide?clampX(430,box.W):Math.max(-300,Math.min(620,1100)-box.W),signX=box.wide?172:x0+14;
 return <svg ref={box.ref} className={styles.svg} viewBox={`0 ${box.top.toFixed(1)} ${box.W.toFixed(1)} ${box.H.toFixed(1)}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label="A night street in London in 1966: a car waits at a traffic light on Kensington High Street.">
  <defs>
   <linearGradient id="c70night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#05070f"/><stop offset="1" stopColor="#1a2242"/></linearGradient>
   <linearGradient id="c70road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#11141d"/><stop offset="1" stopColor="#05060a"/></linearGradient>
   {(Object.keys(LAMP) as Call[]).map(c=><g key={c}>
    <radialGradient id={'c70wet'+c}><stop offset="0" stopColor={LAMP[c]} stopOpacity=".55"/><stop offset=".5" stopColor={LAMP[c]} stopOpacity=".16"/><stop offset="1" stopColor={LAMP[c]} stopOpacity="0"/></radialGradient>
    <radialGradient id={'c70halo'+c}><stop offset="0" stopColor={LAMP[c]} stopOpacity=".6"/><stop offset=".35" stopColor={LAMP[c]} stopOpacity=".18"/><stop offset="1" stopColor={LAMP[c]} stopOpacity="0"/></radialGradient></g>)}
   <clipPath id="c70roadClip"><rect x="-420" y="301" width="1640" height="220"/></clipPath>
   <linearGradient id="c70beamH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffe7a6" stopOpacity=".28"/><stop offset="1" stopColor="#ffe7a6" stopOpacity="0"/></linearGradient>
  </defs>
  <g style={{transform:`translate(${(-x0).toFixed(1)}px,0)`}}>
   <rect x="-420" y="-260" width="1640" height="580" fill="url(#c70night)"/>
   {BLOCKS.map(([x,w,top])=><g key={x}><rect x={x} y={top} width={w} height={300-top} fill="#0b0e1a"/><rect x={x} y={top} width={w} height={3} fill="#1c2340"/></g>)}
   {win.map((w,i)=><rect key={i} x={w.x} y={w.y} width={12} height={16} rx={1} fill={w.on?'#f2c66d':'#141a2e'} opacity={w.on?.78:1}/>)}
   <g transform={`translate(${signX.toFixed(1)} 150)`}><rect width="176" height="44" rx="3" fill="#f4f1e8"/><rect x="3" y="3" width="170" height="38" rx="2" fill="none" stroke="#111" strokeWidth="1.5"/>
    <text x="10" y="23" fontSize="11.5" fontWeight="800" fill="#111" dominantBaseline="central" textLength="128" lengthAdjust="spacingAndGlyphs">KENSINGTON HIGH ST</text><text x="146" y="23" fontSize="12.5" fontWeight="800" fill="#c8102e" dominantBaseline="central">W8</text></g>
   <rect x="-420" y="300" width="1640" height="220" fill="url(#c70road)"/>
   <rect x="-420" y="298" width="1640" height="4" fill="#1d2233"/>
   {[-300,-140,20,180].map(x=><rect key={x} x={x} y={350} width={90} height={2.5} rx={1} fill="#d9d4c4" opacity=".16"/>)}
   {/* the lit lamp: halo and a long soft reflection on the wet road */}
   {(Object.keys(LAMP) as Call[]).map(c=><g key={c} className={styles.glow} data-on={lit===c||undefined}>
    <circle cx="586" cy="163" r="90" fill={`url(#c70halo${c})`}/>
    <ellipse cx="586" cy="300" rx="34" ry="110" fill={`url(#c70wet${c})`} clipPath="url(#c70roadClip)"/>
   </g>)}
   <g fill="#05060a"><rect x="583" y="196" width="6" height="104"/><rect x="571" y="126" width="30" height="76" rx="6"/></g>
   {(['red','yellow','none'] as Call[]).map((c,i)=><g key={c}>
    <circle cx="586" cy={142+i*22} r="8" fill={lit===c?LAMP[c]:'#1c1f27'} className={styles.streetLamp}/>
    <path d={`M576,${136+i*22} A11,11 0 0 1 596,${136+i*22}`} fill="none" stroke="#05060a" strokeWidth="3"/></g>)}
   {/* a 1960s saloon, its driver in a hat */}
   <g transform="translate(370 300)">
    <path d="M2,-12 Q0,-28 14,-31 L44,-35 Q56,-55 74,-58 L116,-59 Q132,-58 146,-37 L176,-33 Q186,-31 186,-18 L186,-10 Q186,-6 180,-6 L6,-6 Q2,-6 2,-12 Z" fill="#05060a"/>
    <path d="M60,-52 Q70,-54 112,-55 Q124,-54 134,-38 L56,-36 Z" fill="#1d2440"/>
    <path d="M96,-38 L96,-46 Q100,-52 106,-46 L106,-38 Z M93,-47 L109,-47 L107,-51 L95,-51 Z" fill="#05060a"/>
    <line x1="88" y1="-55" x2="88" y2="-36" stroke="#05060a" strokeWidth="3"/>
    {[36,150].map(x=><g key={x}><circle cx={x} cy="-8" r="12.5" fill="#05060a"/><circle cx={x} cy="-8" r="5" fill="#2a3047"/></g>)}
    <ellipse cx="184" cy="-22" rx="3" ry="4.5" fill="#ffe7a6"/><path d="M185,-22 L340,-52 L340,8 Z" fill="url(#c70beamH)"/>
    <ellipse cx="94" cy="2" rx="100" ry="4" fill="#000" opacity=".5"/>
   </g>
   <g stroke="#9fb0e0" strokeOpacity=".18" strokeWidth="1">{rain.map((d,i)=><line key={i} x1={d.x} y1={d.y} x2={d.x-3} y2={d.y+d.l}/>)}</g>
  </g>
 </svg>;
}
