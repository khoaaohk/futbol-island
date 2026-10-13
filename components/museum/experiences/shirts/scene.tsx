'use client';
import {memo,type KeyboardEvent as RKE,type ReactNode} from 'react';
import * as k from '../anatomy/iso-kit';
import {Solid,Line,Dots,Wire} from '../anatomy/draw';
import {Base,LabelPlate,Sphere,Tint,at,boxPts,depth,kOf,mix,onTop,post,pt,ringTop,seg,slab,type Frame,type FPlan} from '../anatomy/bench';
import {SPOTS,swatch,type Kits} from './data';
import {BOARD,BS,REF_AT,VATS,awayOf,pegOf,type Job} from './model';

/**
 * shirts · the kit room drawn in the anatomy style (Oct 12 2026, Paper theme): a bench with the tactics board (the 2-3-5 on
 * eleven pegs), the number press and eight dye vats. Solid paper parts, four-tone sides, hairlines, a soft halo. Colour only where
 * colour is the lesson: the kits and the dyes; red (your team) is the exhibit's one accent. Frame space: a from our goal line
 * towards theirs, b across (our right at +b), z up, so the bench lies landscape on a desktop and stands up on a phone.
 */
export const RED='#e4322b';
const TURF='#93ab78';
export const ROOM={plate:{a:-170,b:-128,w:510,d:256,r:12} as FPlan,press:{a:-96,b:-58},vats:VATS.map((_,i)=>({a:-128+(i%2)*40,b:6+Math.floor(i/2)*31}))};
export const roomPoints=()=>[...boxPts(ROOM.plate,-20,0),[ROOM.press.a,ROOM.press.b,92] as [number,number,number]];
const hex=(id:string)=>swatch(id).hex;
/** A flat-on-the-table transform at (a, b, z): text x runs along whichever floor axis is more horizontal on screen. */
export function flatMatrix(F:Frame,a:number,b:number,z:number,P:k.Projection){
 const o=pt(F,a,b,z,P),u=pt(F,a+1,b,z,P),v=pt(F,a,b+1,z,P),U=[u[0]-o[0],u[1]-o[1]],V=[v[0]-o[0],v[1]-o[1]];
 const [X,Y]=F.o==='wide'?[U,V]:[V,[-U[0],-U[1]]];
 const f=(n:number)=>Math.round(n*1000)/1000;
 return `matrix(${f(X[0])} ${f(X[1])} ${f(Y[0])} ${f(Y[1])} ${f(o[0])} ${f(o[1])})`;
}
/** A football shirt laid flat, centred on (0, 0), about 40 × 44 units. */
export const SHIRT_D='M-9 -21L-20 -16L-27 -4L-19 1L-15 -5L-15 21L15 21L15 -5L19 1L27 -4L20 -16L9 -21Q0 -13 -9 -21Z';

// ── Static: bench, board, press body, vats ─────────────────────────────────────────────────────────────────────────────
export const RoomStatic=memo(function RoomStatic({F,P}:{F:Frame;P:k.Projection}){
 const {a0,a1,b0,b1}=BOARD,z=10,frame:FPlan={a:a0-10,b:b0-10,w:a1-a0+20,d:b1-b0+20,r:6},turf:FPlan={a:a0,b:b0,w:a1-a0,d:b1-b0,r:2};
 const L=(pts:[number,number][],closed=false)=>onTop(F,pts,z,P,closed);
 const box=(s:1|-1)=>{const g=s>0?a0:a1,d=s;return L([[g,-60],[g+d*49.5,-60],[g+d*49.5,60],[g,60]])+L([[g,-27],[g+d*16.5,-27],[g+d*16.5,27],[g,27]]);};
 const [cx,cy]=at(F,(a0+a1)/2,0);
 const goal=(g:number,d:number)=><g key={g}>
  <Solid paths={post(F,g,-11,1.4,z,10,P,10)} tone="hi" crease="none"/><Solid paths={post(F,g,11,1.4,z,10,P,10)} tone="hi" crease="none"/>
  <Solid paths={slab(F,{a:g-1.4,b:-12.4,w:2.8,d:24.8,r:.6},z+10,2,P,2)} tone="hi"/>
  <Line d={[-6,0,6].map(b=>seg(F,g,b,z+11,g-d*7,b,z,P)).join('')} tone="faint"/>
 </g>;
 const P2=ROOM.press,body:FPlan={a:P2.a-36,b:P2.b-32,w:72,d:64,r:4};
 return <g data-room="">
  <Base F={F} p={ROOM.plate} P={P} z={-14} h={12}/>
  <LabelPlate F={F} a={-150} b={-118} w={50} d={20} z={-2} P={P}/>
  {/* the board in its frame */}
  <Solid paths={slab(F,frame,-2,10,P,6,1)} tone="mid" inner={<Line d={k.ringSeam(k.roundedPlan({x:frame.a,y:frame.b,w:frame.w,d:frame.d,r:frame.r},6).map(([x,y])=>at(F,x,y)),3,P)} tone="faint"/>}/>
  <Tint paths={slab(F,turf,-2,12,P,2)} color={TURF} edge="mid" crease={false}/>
  {Array.from({length:10},(_,i)=>i%2?<path key={i} d={L([[a0+i*31.5,b0],[a0+(i+1)*31.5,b0],[a0+(i+1)*31.5,b1],[a0+i*31.5,b1]],true)} fill={mix(TURF,'#ffffff',.08)}/>:null)}
  <path className="sh-lines" d={[L([[a0,b0],[a1,b0],[a1,b1],[a0,b1]],true),L([[(a0+a1)/2,b0],[(a0+a1)/2,b1]]),k.ring(cx,cy,9.15*BS,z,P,48),box(1),box(-1)].join('')}/>
  <Dots points={[[(a0+a1)/2,0],[11*BS,0],[a1-11*BS,0]].map(([a,b])=>pt(F,a,b,z,P))} size={1.1} tone="hi"/>
  {goal(a0,-1)}{goal(a1,1)}
  <Dots points={[[a0-5,b0-5],[a1+5,b0-5],[a0-5,b1+5],[a1+5,b1+5]].map(([a,b])=>pt(F,a,b,8,P))} size={.6} tone="hi"/>
  {/* the number press: body with seams, a clock dial on top, the tray, the hopper of blank shirts, two guide posts */}
  <Solid paths={slab(F,body,0,36,P,6,1.2)} tone="mid" inner={<Line d={k.ringSeam(k.roundedPlan({x:body.a,y:body.b,w:body.w,d:body.d,r:body.r},6).map(([x,y])=>at(F,x,y)),12,P)} tone="faint"/>}/>
  {[0,1,2].map(i=><Line key={i} d={onTop(F,[[body.a+6,body.b+8+i*5],[body.a+22,body.b+8+i*5]],36,P)} tone="faint"/>)}
  <Solid paths={slab(F,{a:P2.a-30,b:P2.b-6,w:60,d:34,r:3},36,3,P,4,.5)} tone="hi"/>
  <Solid paths={slab(F,{a:P2.a+6,b:P2.b-30,w:26,d:22,r:2},36,18,P,4,.6)} tone="mid"/>
  {[0,1,2].map(i=><Solid key={i} paths={slab(F,{a:P2.a+8,b:P2.b-28,w:22,d:18,r:2},54+i*2.2,2,P,3)} tone="hi"/>)}
  {[-26,26].map(d=><Solid key={d} paths={post(F,P2.a+d,P2.b+12,2.2,39,52,P,12)} tone="mid" crease="none"/>)}
 </g>;
});

/** The clock dial on the press: 60 s round the face, the needle at the seconds left. */
export function Clock({F,P,secs,hot}:{F:Frame;P:k.Projection;secs:number;hot:boolean}){
 const P2=ROOM.press,[x,y]=at(F,P2.a-20,P2.b-18),z=36,t=k.radialTicks(x,y,11,60,5,z+1.2,[1.4,3],P);
 const ang=(Math.max(0,Math.min(60,secs))/60)*Math.PI*2,tip:k.Plane=[x+Math.sin(ang)*9,y-Math.cos(ang)*9];
 return <g data-clock={Math.ceil(secs)}>
  <Solid paths={k.cylinder(x,y,13,z,1.2,P,40,.4)} tone="hi"/>
  <Line d={t.minor} tone="faint"/><Line d={t.major} tone="mid"/>
  <path d={k.lineOnTop([x,y],tip,z+1.3,P)} fill="none" stroke={hot?RED:'#1d1d1b'} strokeWidth={1.6} strokeLinecap="round"/>
  <Dots points={[k.iso([x,y,z+1.3],P)]} size={1.2} tone="hi"/>
 </g>;
}
/** The stamp head over the tray: it drops (a CSS transform transition, no frame loop) when a shirt is numbered. */
export function Stamp({F,P,down}:{F:Frame;P:k.Projection;down:boolean}){
 const P2=ROOM.press,drop=k.screenRise(20,P);
 return <g data-stamp={down?'down':'up'} style={{transform:`translateY(${down?drop:0}px)`,transition:'transform .16s cubic-bezier(.3,.7,.2,1)'}}>
  <Solid paths={slab(F,{a:P2.a-30,b:P2.b+4,w:60,d:16,r:3},70,10,P,4,.8)} tone="mid"/>
  <Solid paths={post(F,P2.a,P2.b+12,4,80,10,P,16)} tone="mid" crease="none"/>
  <Solid paths={post(F,P2.a,P2.b+12,9,90,4,P,24,.5)} tone="hi"/>
  <Line d={k.knurl(...at(F,P2.a,P2.b+12),9,90,94,26,P)} tone="faint"/>
 </g>;
}
/** The shirt on the press tray (its number printed), or a blank one waiting for dye. Tap or drag it. */
export function TrayShirt({F,P,n,color,onDown}:{F:Frame;P:k.Projection;n:number|null;color:string;onDown?:(e:React.PointerEvent)=>void}){
 const P2=ROOM.press,m=flatMatrix(F,P2.a,P2.b+12,39.2,P);
 return <g data-tray-shirt={n??'blank'} className="sh-grab" onPointerDown={onDown}>
  <g transform={m}>
   <path d={SHIRT_D} transform="scale(.82)" fill={color} stroke="#3a3a3c" strokeWidth={.7} vectorEffect="non-scaling-stroke"/>
   {n!=null&&<text y={6} textAnchor="middle" className="sh-shirtnum">{n}</text>}
  </g>
 </g>;
}
/** Eight dye vats: a tub with its dye on top. Each is a button. */
export function Vats({F,P,flash,wrong,onPick,disabled}:{F:Frame;P:k.Projection;flash:string|null;wrong:string|null;onPick:(id:string)=>void;disabled:boolean}){
 const list=ROOM.vats.map((v,i)=>({...v,id:VATS[i]})).sort((A,B)=>depth(F,A.a,A.b,0,P)-depth(F,B.a,B.b,0,P));
 return <g data-vats="">{list.map(v=>{const [x,y]=at(F,v.a,v.b),c=hex(v.id),hot=flash==='vat-'+v.id,bad=wrong==='vat-'+v.id;
  const key=(e:RKE)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onPick(v.id);}};
  return <g key={v.id} data-vat-3d={v.id} role="button" tabIndex={disabled?-1:0} aria-label={`${swatch(v.id).name} dye`} onClick={()=>!disabled&&onPick(v.id)} onKeyDown={key} className="sh-vat">
   <path className="iso-halo" d={k.cylinder(x,y,14,-1,2,P,24).fill}/>
   <Solid paths={k.cylinder(x,y,13,0,15,P,36,.6)} tone="mid" inner={<Line d={k.sideArc(x,y,13,6,P,20)} tone="faint"/>}/>
   <path d={k.ring(x,y,10.5,15.2,P,32)} fill={c} stroke="#3a3a3c" strokeWidth={.6} vectorEffect="non-scaling-stroke"/>
   {(hot||bad)&&<path d={k.ring(x,y,16,15.2,P,32)} fill="none" stroke={bad?RED:'#1d1d1b'} strokeWidth={2}/>}
  </g>;})}</g>;
}

// ── Live: pegs, players, the other team, the referee, clashes ───────────────────────────────────────────────────────────
export type Fig={id:string;a:number;b:number;color:string|null;label?:string;ring?:boolean;role:keyof Kits|'peg'};
/** A player peg: a round body (its kit colour, or a hollow paper body before it is dyed) and a ball head. */
function Player({F,P,f}:{F:Frame;P:k.Projection;f:Fig}){
 const kk=kOf(P),z=10,body=post(F,f.a,f.b,6.5,z,17,P,20),head=pt(F,f.a,f.b,z+22,P),s=pt(F,f.a,f.b,z,P);
 return <g data-fig={f.id} opacity={f.color?1:.62}>
  {f.ring&&<path d={ringTop(F,f.a,f.b,11,z,P,28)} fill={mix(RED,'#ffffff',.75)} stroke={RED} strokeWidth={1.6}/>}
  <ellipse className="iso-halo" cx={s[0]} cy={s[1]} rx={8*kk} ry={4*kk}/>
  {f.color?<Tint paths={body} color={f.color}/>:<Solid paths={body} tone="lo"/>}
  <Sphere c={head} r={5*kk} color={f.color?'#f2e3d0':'#f7f7f3'}/>
  {f.label&&<g transform={`translate(${head[0]} ${head[1]-5*kk-12})`} className="sh-tag"><rect x={-11} y={-9} width={22} height={17} rx={4}/><text y={4} textAnchor="middle">{f.label}</text></g>}
 </g>;
}
export function BoardLive({F,P,hung,kits,job,wrongPeg,flashPeg,clashWith,onPeg,pegsLive}:{F:Frame;P:k.Projection;hung:ReadonlySet<number>;kits:Partial<Kits>;job:Job|null;wrongPeg:number|null;flashPeg:number|null;clashWith:(keyof Kits)|null;onPeg:(n:number)=>void;pegsLive:boolean}){
 const z=10,items:{d:number;el:ReactNode}[]=[],figs:Fig[]=[];
 for(const s of SPOTS){const p=pegOf(s);
  if(hung.has(s.n))figs.push({id:'home-'+s.n,a:p.a,b:p.b,color:s.n===1?(kits.homeGk?hex(kits.homeGk):'#c9c9c4'):hex(kits.home??'red'),label:String(s.n),role:s.n===1?'homeGk':'home',ring:job==='homeGk'&&s.n===1});
  else{const [x,y]=at(F,p.a,p.b),bad=wrongPeg===s.n;
   const key=(e:RKE)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onPeg(s.n);}};
   items.push({d:depth(F,p.a,p.b,0,P),el:<g key={'peg'+s.n} data-peg-3d={s.n} role="button" tabIndex={pegsLive?0:-1} aria-label={`${s.role}: hang the shirt here`} className="sh-peg" onClick={()=>pegsLive&&onPeg(s.n)} onKeyDown={key}>
    <path d={k.ring(x,y,22,z,P,24)} fill="transparent" stroke="none"/>
    <path d={k.ring(x,y,bad?13:9,z,P,28)} fill={bad?mix(RED,'#ffffff',.55):flashPeg===s.n?'#ffffff':mix('#93ab78','#ffffff',.25)} className="iso-line" data-tone={bad?'hi':'mid'} style={bad?{stroke:RED,strokeWidth:2}:undefined}/>
    <Solid paths={k.cylinder(x,y,3.4,z,8,P,16,.3)} tone="hi"/>
   </g>});}}
 if(job||kits.away)for(const s of SPOTS){const p=awayOf(s);figs.push({id:'away-'+s.n,a:p.a,b:p.b,color:s.n===1?(kits.awayGk?hex(kits.awayGk):null):(kits.away?hex(kits.away):null),role:s.n===1?'awayGk':'away',ring:(job==='away'&&s.n!==1)||(job==='awayGk'&&s.n===1)});}
 if(job||kits.referee)figs.push({id:'ref',a:REF_AT.a,b:REF_AT.b,color:kits.referee?hex(kits.referee):null,role:'referee',ring:job==='referee'});
 for(const f of figs)items.push({d:depth(F,f.a,f.b,0,P),el:<Player key={f.id} F={F} P={P} f={f}/>});
 // A clash: a red wire from the kit being dyed to the one it looks like, its ends on both players.
 if(job&&clashWith){const from=figs.find(f=>f.role===job),to=figs.find(f=>f.role===clashWith);
  if(from&&to)items.push({d:1e9,el:<g key="clash" data-clash={clashWith}><Wire from={pt(F,from.a,from.b,z+30,P)} to={pt(F,to.a,to.b,z+30,P)} tone="red" size={2.2}/></g>});}
 return <>{items.sort((x,y)=>x.d-y.d).map(i=>i.el)}</>;
}
/** Screen points of the empty pegs (for dropping a dragged shirt). */
export const pegScreens=(F:Frame,P:k.Projection,hung:ReadonlySet<number>)=>SPOTS.filter(s=>!hung.has(s.n)).map(s=>{const p=pegOf(s);return {n:s.n,xy:pt(F,p.a,p.b,10,P)};});
export const trayScreen=(F:Frame,P:k.Projection)=>pt(F,ROOM.press.a,ROOM.press.b+12,39,P);
