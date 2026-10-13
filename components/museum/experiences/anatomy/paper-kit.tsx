'use client';
import {useEffect,useMemo,useRef,useState,type ReactNode,type RefObject} from 'react';
import {ISO_CSS,cameraOf,corners,cylinder,depthOf,extrude,fitProjection,insetPlan,iso,knurl,lineOnTop,pathOf,planOutline,ring,segment,sideArc,slabOf,
 translateAlong,type Plan,type Point3,type Projection} from './iso-kit';
import {Solid,Line} from './draw';

/**
 * The anatomy "Paper" theme for the museum's play exhibits (Oct 12 2026; user: every exhibit except the penalty kick uses the
 * anatomy isometric technical-illustration style, Paper theme: https://skills.wheresryan.sh/anatomy). Add-only shared file.
 *
 *  - PAPER_CSS / <PaperStyle/>: the kit's ISO_CSS plus the Paper tokens: off-white solids (tops #f7f7f3, sides #e9e9e4 /
 *    #dcdcd7, lit from the top left), dark-grey hairlines, a soft diffuse halo under each base plate, on a warm grey ground
 *    (#e0e0db). `.dark` and `.acc` recolour one solid (a dark team, the exhibit's one accent: set --acc on an ancestor).
 *  - useBox: an element's live pixel size, so the SVG viewBox IS the card (the drawing fills the screen at every size).
 *  - fit / toFloor / at / shift: fit a scene into the card; a pointer → the floor point under it; world → screen; a translate.
 *  - painted: back-to-front painter's order by depth key.
 *  - Parts: basePlate, peg (a table-football figure), Ball, rulerStrip, labelPlate, goalFrame, dialGauge.
 */
export const PAPER_CSS=ISO_CSS+`
.iso[data-theme="paper"]{
 --anatomy-page:#e0e0db;--anatomy-card:#e0e0db;--anatomy-text:#4a4a48;--anatomy-strong:#1d1d1b;--anatomy-muted:#7a7a76;
 --anatomy-paper:#f7f7f3;--anatomy-face:#fbfbf8;--anatomy-top:#f7f7f3;
 --anatomy-shade-0:#d3d3ce;--anatomy-shade-1:#dcdcd7;--anatomy-shade-2:#e3e3de;--anatomy-shade-3:#e9e9e4;
 --anatomy-lit-top:#ffffff;--anatomy-lit-shade:#efefeb;
 --anatomy-hi:#3a3a3c;--anatomy-mid:#6f6f72;--anatomy-lo:#98989a;--anatomy-faint:#c2c2bd;--anatomy-lit:#111111;
 --anatomy-halo:#4a4a44;--anatomy-halo-opacity:.34;--anatomy-dot:#3a3a3c;--anatomy-weight:.8px;
}
.iso[data-theme="paper"] .iso-svg{display:block;width:100%;height:100%;overflow:visible}
.iso[data-theme="paper"] .iso-halo{filter:blur(14px);transform:translateY(6px)}
.iso .dark>.iso-fill,.iso .dark>.iso-top{fill:#5c5c5e}
.iso .dark>.iso-shade[data-shade="0"]{fill:#3c3c3e}.iso .dark>.iso-shade[data-shade="1"]{fill:#454547}
.iso .dark>.iso-shade[data-shade="2"]{fill:#4d4d4f}.iso .dark>.iso-shade[data-shade="3"]{fill:#555557}
.iso .dark>.iso-line{stroke:#232325}
.iso .acc>.iso-fill,.iso .acc>.iso-top{fill:var(--acc)}
.iso .acc>.iso-shade{fill:var(--acc-d)}
.iso .acc>.iso-line{stroke:var(--acc-e)}
.iso .acc>.iso-line.iso-crease,.iso .acc>.iso-line.iso-bevel{stroke:var(--acc-d)}
.iso .band>.iso-fill,.iso .band>.iso-top{fill:var(--band)}
.iso .band>.iso-shade{fill:color-mix(in srgb,var(--band) 74%,#000)}
.iso .band>.iso-line{stroke:color-mix(in srgb,var(--band) 48%,#000)}
.iso .iso-line[data-tone="acc"]{stroke:var(--acc)}
.iso .iso-acc-fill{fill:var(--acc)}
.iso .iso-hit{fill:transparent;stroke:none;cursor:pointer;pointer-events:all}
.iso .iso-hit:focus{outline:none}
`;
export function PaperStyle(){return <style dangerouslySetInnerHTML={{__html:PAPER_CSS}}/>;}

// ── Maths ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
export const easeOut=(t:number)=>1-(1-clamp(t,0,1))**3;
export const easeInOut=(t:number)=>{const u=clamp(t,0,1);return u<.5?4*u*u*u:1-(-2*u+2)**3/2;};
/** Exponential follow that snaps to rest, so the loop can stop. */
export const follow=(cur:number,target:number,dt:number,tau=.12,eps=1e-3)=>{const n=cur+(target-cur)*(1-Math.exp(-dt/tau));return Math.abs(target-n)<eps?target:n;};

// ── The card and the camera ───────────────────────────────────────────────────────────────────────────────────────────
export function useBox<T extends HTMLElement>():[RefObject<T>,{w:number;h:number}]{
 const ref=useRef<T>(null),[box,setBox]=useState({w:0,h:0});
 useEffect(()=>{const el=ref.current;if(!el)return;
  const read=()=>{const r=el.getBoundingClientRect(),w=Math.round(r.width),h=Math.round(r.height);setBox(b=>w===b.w&&h===b.h?b:{w,h});};
  read();if(typeof ResizeObserver==='undefined'){addEventListener('resize',read);return()=>removeEventListener('resize',read);}
  const ro=new ResizeObserver(read);ro.observe(el);return()=>ro.disconnect();},[]);
 return [ref,box];
}
/** Fit world points into a w × h card, leaving `top` px for the card's text and `bottom` px for its corner labels. */
export function fit(points:Point3[],w:number,h:number,{pad=28,top=0,bottom=0,azimuth=45,elevation=30}:{pad?:number;top?:number;bottom?:number;azimuth?:number;elevation?:number}={}):Projection{
 // a point under the floor (a plate's underside) also counts at the floor (its top face), which can sit higher on screen
 const all=[...points,...points.filter(p=>p[2]<0).map(([x,y]):Point3=>[x,y,0])];
 return fitProjection(all,Math.max(40,w),Math.max(40,h-bottom),{pad,headroom:top,azimuth,elevation});
}
/** Screen (viewBox) point → the world point on the plane z under it (the projection is orthographic, so it inverts exactly). */
export function toFloor(sx:number,sy:number,P:Projection,z=0):[number,number]{
 const {sinA,cosA,sinE,cosE,k}=cameraOf(P),u=(sx-P.origin[0])/k,v=((sy-P.origin[1])/k+z*cosE)/sinE;
 return [u*sinA+v*cosA,-u*cosA+v*sinA];
}
/** A pointer event → viewBox coordinates (the viewBox is the element's own pixel size). */
export const local=(e:{clientX:number;clientY:number},el:Element):[number,number]=>{const r=el.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
export const at=(p:Point3,P:Projection)=>iso(p,P);
/** A translate that moves a part built at the world origin to p. */
export const shift=(P:Projection,p:Point3)=>translateAlong(P,p);
export const depth=(p:Point3,P:Projection)=>depthOf(p,P);
export const scaleOf=(P:Projection)=>cameraOf(P).k;

export type Item={k:number;id:string;n:ReactNode};
/** Paint back to front: ascending depth (larger = nearer the viewer). */
export const painted=(items:Item[])=>[...items].sort((a,b)=>a.k-b.k).map(i=><g key={i.id}>{i.n}</g>);

// ── Parts ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const byDepth=(pts:[number,number][],P:Projection)=>[...pts].sort((a,b)=>depthOf([a[0],a[1],0],P)-depthOf([b[0],b[1],0],P));
/** Screws: a ring and a dot. */
export function Screw({x,y,z,P,r=1.6}:{x:number;y:number;z:number;P:Projection;r?:number}){
 const [cx,cy]=iso([x,y,z],P);return <g><Line d={ring(x,y,r,z,P,16)} tone="lo"/><circle cx={cx} cy={cy} r={.9} fill="var(--anatomy-dot)" opacity={.55}/></g>;
}
/** A heavy base plate on turned feet: halo, feet, a slab with a bevel, an inset groove, corner screws. Top face at z = 0. */
export function basePlate(id:string,plan:Plan,P:Projection,{h=8,feet=6,inset=14,groove=true}:{h?:number;feet?:number;inset?:number;groove?:boolean}={}):Item[]{
 const out:Item[]=[],z0=-h-feet;
 out.push({k:-1e9,id:id+'-halo',n:<path className="iso-halo" d={slabOf(plan,z0,h+feet,P).fill}/>});
 byDepth(corners(plan,inset),P).forEach(([x,y],i)=>{out.push({k:-1e8+i,id:`${id}-foot${i}`,n:<>
  <Solid paths={cylinder(x,y,6.4,z0,1.6,P,28)} tone="lo"/><Solid paths={cylinder(x,y,4.8,z0+1.6,feet-1.6,P,28)} tone="mid"/></>});});
 out.push({k:-1e7,id:id+'-slab',n:<Solid paths={slabOf(plan,-h,h,P,8,1.4)} tone="mid">
  {groove&&<Line d={planOutline(insetPlan(plan,5),0,P)} tone="faint"/>}
  {corners(plan,9).map(([x,y],i)=><Screw key={i} x={x} y={y} z={0} P={P}/>)}
 </Solid>});
 return out;
}
/** A ruler strip lying on a top face along x (ticks hang from its far edge): minor every `step`, major every `every`. */
export function rulerStrip(id:string,x0:number,x1:number,y:number,z:number,P:Projection,{d=6,step=4,every=5,k}:{d?:number;step?:number;every?:number;k?:number}={}):Item{
 const ticks:string[]=[],major:string[]=[];let i=0;
 for(let x=x0+2;x<=x1-2+1e-9;x+=step,i++){(i%every===0?major:ticks).push(lineOnTop([x,y],[x,y+(i%every===0?d*.62:d*.34)],z+.6,P));}
 return {k:k??depthOf([(x0+x1)/2,y,z],P),id,n:<Solid paths={slabOf({x:x0,y,w:x1-x0,d,r:1},z,.6,P,3)} tone="lo" crease="none">
  <Line d={ticks.join('')} tone="lo"/><Line d={major.join('')} tone="mid"/></Solid>};
}
/** A small label plate with three printed rule lines and two screws. */
export function labelPlate(id:string,plan:Plan,z:number,P:Projection,k?:number):Item{
 const {x,y,w,d}=plan;
 return {k:k??depthOf([x+w/2,y+d/2,z],P),id,n:<Solid paths={slabOf(plan,z,.8,P,4)} tone="mid">
  <Line d={planOutline(insetPlan(plan,1.6),z+.8,P)} tone="faint"/>
  {[.36,.55,.72].map((f,i)=><Line key={i} d={lineOnTop([x+w*.18,y+d*f],[x+w*(i===2?.55:.82),y+d*f],z+.8,P)} tone="lo" free/>)}
  <circle cx={iso([x+2.4,y+d/2,z+.8],P)[0]} cy={iso([x+2.4,y+d/2,z+.8],P)[1]} r={.9} fill="var(--anatomy-dot)" opacity={.5}/>
  <circle cx={iso([x+w-2.4,y+d/2,z+.8],P)[0]} cy={iso([x+w-2.4,y+d/2,z+.8],P)[1]} r={.9} fill="var(--anatomy-dot)" opacity={.5}/>
 </Solid>};
}

/** A ball with sphere shading (orthographic: a sphere is a circle of radius r·k). Light from the top left. */
export function Ball({cx,cy,r,look='paper',edge='hi',seams=true}:{cx:number;cy:number;r:number;look?:'paper'|'dark'|'acc';edge?:'hi'|'lit'|'mid';seams?:boolean}){
 const f=look==='acc'?'var(--acc)':look==='dark'?'#5a5a5c':'var(--anatomy-paper)',s0=look==='acc'?'var(--acc-d)':look==='dark'?'#3a3a3c':'var(--anatomy-shade-0)',
  hi=look==='acc'?'var(--acc-l)':look==='dark'?'#78787a':'#ffffff';
 return <g className="iso-ball">
  <circle cx={cx} cy={cy} r={r} fill={s0}/>
  <circle cx={cx-r*.14} cy={cy-r*.14} r={r*.84} fill={f}/>
  <circle cx={cx-r*.34} cy={cy-r*.36} r={r*.36} fill={hi} opacity={.8}/>
  {seams&&r>3&&<path d={`M${cx-r*.92} ${cy+r*.12}Q${cx} ${cy+r*.6} ${cx+r*.92} ${cy+r*.12}M${cx-r*.06} ${cy-r*.98}Q${cx+r*.42} ${cy} ${cx-r*.06} ${cy+r*.98}`} className="iso-line" data-tone={look==='paper'?'lo':'mid'} fill="none"/>}
  <circle cx={cx} cy={cy} r={r} className="iso-line" data-tone={edge} fill="none"/>
 </g>;
}
/** A ball part built at the origin (world radius r, resting on z = 0): a soft contact shadow and the shaded sphere. */
export function BallPart({P,r,look='paper',lift=0,shadow=true}:{P:Projection;r:number;look?:'paper'|'dark'|'acc';lift?:number;shadow?:boolean}){
 const k=cameraOf(P).k,[cx,cy]=iso([0,0,r+lift],P);
 return <g>{shadow&&<path className="iso-halo" style={{opacity:lift>0?.16:.28,filter:'blur(3px)',transform:'none'}} d={cylinder(0,0,r*.9,0,.1,P,20).fill}/>}<Ball cx={cx} cy={cy} r={r*k} look={look} edge={look==='acc'?'mid':'hi'}/></g>;
}

export type PegLook='paper'|'dark'|'lit';
/**
 * A table-football figure (a peg) built at the ORIGIN, standing on z = 0: a base disc, a turned body, a coloured collar band,
 * a shoulder ring and a ball head. Move it with shift(P, [x, y, z]). `lying` (radians in the floor plane) lays it down (a dive,
 * a fall); `band` is a CSS colour for the collar (team colour); `lift` hops it (a cheer).
 */
export function Peg({P,look='paper',band,h=17,lying=null,lift=0,ring:ringOn=false}:{P:Projection;look?:PegLook;band?:string;h?:number;lying?:number|null;lift?:number;ring?:boolean}){
 const n=useMemo(()=>pegNode(P,look,band,h,lying,lift,ringOn),[P,look,band,h,lying,lift,ringOn]);return n;
}
function pegNode(P:Projection,look:PegLook,band:string|undefined,h:number,lying:number|null,lift:number,ringOn:boolean){
 const cls=look==='dark'?'dark':undefined,lit=look==='lit',sk=cameraOf(P).k;
 const bandSolid=(paths:ReturnType<typeof cylinder>)=>band?<g style={{['--band' as string]:band}}><Solid paths={paths} tone="hi" className="band"/></g>:null;
 const halo=<path className="iso-halo" style={{opacity:.3,filter:'blur(3px)',transform:'none'}} d={cylinder(0,0,5.2,0,.1,P,20).fill}/>;
 const hoop=ringOn?<path d={ring(0,0,8.5,.2,P,40)} fill="none" stroke="var(--acc)" strokeWidth={2.2} vectorEffect="non-scaling-stroke"/>:null;
 if(lying!=null){
  const c=Math.cos(lying),s=Math.sin(lying),L=h*.8,r=3.4,pts:[number,number][]=[];
  for(let i=0;i<=8;i++){const a=-Math.PI/2+Math.PI*i/8;pts.push([c*(L/2)+Math.cos(a)*r*c-Math.sin(a)*r*s,s*(L/2)+Math.cos(a)*r*s+Math.sin(a)*r*c]);}
  for(let i=0;i<=8;i++){const a=Math.PI/2+Math.PI*i/8;pts.push([-c*(L/2)+Math.cos(a)*r*c-Math.sin(a)*r*s,-s*(L/2)+Math.cos(a)*r*s+Math.sin(a)*r*c]);}
  const head=iso([c*(L/2+2.6),s*(L/2+2.6),3.2],P);
  return <g>{hoop}<path className="iso-halo" style={{opacity:.3,filter:'blur(3px)',transform:'none'}} d={extrude(pts,0,.1,P,{convex:true}).fill}/>
   <Solid paths={extrude(pts,0,5,P,{convex:true})} tone="hi" className={cls} lit={lit}/>
   {band&&<path d={pathOf([iso([c*1.5-s*r,s*1.5+c*r,2.5],P),iso([c*1.5+s*r,s*1.5-c*r,5],P)])} stroke={band} strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke"/>}
   <Ball cx={head[0]} cy={head[1]} r={2.9*sk} look={look==='dark'?'dark':'paper'} seams={false} edge={lit?'lit':'hi'}/></g>;
 }
 const z=lift,head=iso([0,0,z+h+.6],P);
 return <g>
  {hoop}{halo}
  <Solid paths={cylinder(0,0,4.8,z,1.6,P,28,.3)} tone="hi" className={cls} lit={lit}/>
  <Solid paths={cylinder(0,0,2.8,z+1.6,h-5.6,P,24)} tone="hi" className={cls} lit={lit} inner={<Line d={sideArc(0,0,2.8,z+5,P,16)} tone="faint"/>}/>
  {band?bandSolid(cylinder(0,0,3.3,z+h-9.6,3.2,P,24)):null}
  <Solid paths={cylinder(0,0,3.6,z+h-6.4,2,P,24,.3)} tone="hi" className={cls} lit={lit}/>
  <Ball cx={head[0]} cy={head[1]} r={2.9*sk} look={look==='dark'?'dark':'paper'} seams={false} edge={lit?'lit':'hi'}/>
 </g>;
}

/**
 * A goal frame on the line x = gx between y = y0 and y1. `era` 'today': two posts and a crossbar (height gh) with a net back to
 * gx − depthM; '1863': two bare posts with pennant flags, no bar, no net. Returns the BACK items (net) and the FRONT items (posts,
 * bar) separately, so players can be painted between them.
 */
export function goalFrame(id:string,gx:number,y0:number,y1:number,P:Projection,{gh=24,dm=12,era='today',r=.9}:{gh?:number;dm?:number;era?:'today'|'1863';r?:number}={}):{back:Item[];front:Item[]}{
 const back:Item[]=[],front:Item[]=[],kBack=depthOf([gx-dm,(y0+y1)/2,0],P);
 if(era==='today'){
  const net:string[]=[],bx=gx-dm;
  for(let y=y0;y<=y1+1e-6;y+=(y1-y0)/14)net.push(segment([bx,y,0],[bx,y,gh*.82],P),segment([bx,y,gh*.82],[gx,y,gh],P));
  for(let z=0;z<=gh*.82+1e-6;z+=gh*.82/6)net.push(segment([bx,y0,z],[bx,y1,z],P));
  for(let i=1;i<=3;i++){const f=i/4;net.push(segment([gx-dm*f,y0,gh*(1-.18*f)],[gx-dm*f,y1,gh*(1-.18*f)],P));}
  for(const y of [y0,y1]){for(let i=0;i<=4;i++){const f=i/4;net.push(segment([gx-dm*f,y,0],[gx-dm*f,y,gh*(1-.18*f)],P));}
   for(let z=0;z<=gh*.82+1e-6;z+=gh*.82/6)net.push(segment([gx,y,z*gh/(gh*.82)],[bx,y,z],P));}
  back.push({k:kBack,id:id+'-net',n:<g><Line d={net.join('')} tone="faint"/>
   <Solid paths={slabOf({x:bx-.6,y:y0-.6,w:1.2,d:y1-y0+1.2,r:.5},0,.6,P,3)} tone="lo" crease="none"/></g>});
  for(const y of [y0,y1])front.push({k:depthOf([gx,y,gh/2],P)+.5,id:`${id}-post${y}`,n:<Solid paths={cylinder(gx,y,r,0,gh,P,16)} tone="hi"/>});
  front.push({k:depthOf([gx,(y0+y1)/2,gh],P)+.6,id:id+'-bar',n:<Solid paths={slabOf({x:gx-r,y:y0,w:r*2,d:y1-y0,r:r*.9},gh-r,r*2,P,3)} tone="hi"/>});
 }else{
  for(const y of [y0,y1]){front.push({k:depthOf([gx,y,gh/2],P)+.5,id:`${id}-post${y}`,n:<g>
   <Solid paths={cylinder(gx,y,r,0,gh*1.25,P,16)} tone="hi"/>
   <path d={pathOf([iso([gx,y,gh*1.25-.4],P),iso([gx-5.5,y+.4,gh*1.25-2.6],P),iso([gx,y,gh*1.25-5.2],P)],true)} className="iso-acc-fill" stroke="var(--acc-e)" strokeWidth={.8} vectorEffect="non-scaling-stroke"/>
  </g>});}
 }
 return {back,front};
}

/** A face-up dial gauge (a stopwatch) at (x, y) on z: a puck, a knurled bezel, ticks. The needle is drawn by the caller. */
export function dialGauge(id:string,x:number,y:number,z:number,R:number,P:Projection,k?:number):Item{
 const top=z+5,t:string[]=[],tm:string[]=[];
 for(let i=0;i<60;i++){const a=i/60*Math.PI*2,big=i%5===0,ri=R-2.2-(big?3:1.5),ro=R-2.2;(big?tm:t).push(lineOnTop([x+Math.sin(a)*ri,y-Math.cos(a)*ri],[x+Math.sin(a)*ro,y-Math.cos(a)*ro],top,P));}
 return {k:k??depthOf([x,y,z],P),id,n:<g>
  <Solid paths={cylinder(x,y,R+1.2,z-2,2,P,48,.4)} tone="mid"/>
  <Solid paths={cylinder(x,y,R,z,5,P,64,.6)} tone="hi" inner={<Line d={knurl(x,y,R,z+.6,z+4.4,72,P,.2)} tone="faint"/>}/>
  <Line d={ring(x,y,R-1.6,top,P,64)} tone="lo"/>
  <Line d={t.join('')} tone="lo"/><Line d={tm.join('')} tone="mid"/>
  <Solid paths={cylinder(x,y-R-1.4,1.6,z+1.2,3,P,16)} tone="mid"/>
 </g>};
}
/** The dial's needle path for a fraction 0..1 of a turn (clockwise from 12), as a `d` for a <path> you update by ref. */
export function needleD(x:number,y:number,top:number,R:number,f:number,P:Projection){
 const a=f*Math.PI*2;return lineOnTop([x-Math.sin(a)*2.5,y+Math.cos(a)*2.5],[x+Math.sin(a)*(R-4),y-Math.cos(a)*(R-4)],top+.3,P);
}
export {Solid,Line};
export type {Plan,Point3,Projection};
