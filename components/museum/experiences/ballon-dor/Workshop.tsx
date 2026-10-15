'use client';
import {useId,useMemo,type KeyboardEvent as RKeyboardEvent,type PointerEvent as RPointerEvent} from 'react';
import {cameraOf,cylinder,depthOf,extrude,insetPlan,iso,knurl,lineOnTop,pathOf,planOutline,radialTicks,ring,sideArc,sideMatrix,sideSeam,slabOf,topMatrix,
 type Flat,type Plan,type Point3,type Projection} from '../anatomy/iso-kit';
import {FaceText} from '../anatomy/draw';
import {Ball,Line,Screw,Solid,basePlate,fit,labelPlate,painted,rulerStrip,scaleOf,type Item} from '../anatomy/paper-kit';
import {Tint,Sphere} from '../anatomy/bench';
import {POINTS,ERAS,tally} from './data';

/**
 * ballon-dor · THE GOLDEN BALL WORKSHOP, drawn with the anatomy kit in the Paper theme (Oct 14 2026 redo). One long bench with
 * three instruments the camera pans between:
 *  1. THE TURNTABLE SCALE: the trophy (a brass ball on its pyrite block) on a turntable you spin with a crank; the scale's dial
 *     reads 15 kg. Pull it apart and the ball and the block lift off into labelled layers (the needle drops to 0).
 *  2. THE TALLY MACHINE: drum counters for the men's awards by position (midfield and attack, defenders, goalkeeper), a women's
 *     drum and a year counter. Each pull of the side lever counts one more era and pushes that era's plate out of the slot.
 *  3. THE BALLOT DIAL: turn the place selector (1st to 10th) and the gauge reads the points one journalist's vote gives.
 */
export type Station=0|1|2;
export type Ctl='crank'|'lever'|'place';
export type View={station:number;spin:number;explode:number;pulls:number;pull:number;roll:number;plate:number;place:number;needle:number;needleB:number};
export const X0=[0,300,580] as const;
const GOLD='#d9b13f',PYRITE='#b3a37a';
const STATION_PTS=(i:number,e:number):Point3[]=>i===0?[[-100,-100,-16],[100,-100,-16],[-100,100,-16],[100,100,-16],[0,0,150+e*120]]
 :i===1?[[X0[1]-95,-70,-16],[X0[1]+125,-70,-16],[X0[1]-95,110,-16],[X0[1]+125,110,-16],[X0[1],0,140]]
 :[[X0[2]-85,-75,-16],[X0[2]+85,-75,-16],[X0[2]-85,80,-16],[X0[2]+85,80,-16],[X0[2],0,70]];
export const layoutOf=(w:number,h:number)=>w/Math.max(1,h)>1.1?{wide:true,az:40,el:30}:{wide:false,az:40,el:34};
/** The camera at a (fractional) station: a lerp of the two station fits (exact, projections are linear in origin and scale). */
export function projectionFor(w:number,h:number,station:number,explode:number,top:number,bottom:number,side:number):Projection{
 const L=layoutOf(w,h),o={pad:w<600?14:34,top,bottom,azimuth:L.az,elevation:L.el};
 const at=(i:number)=>{const p=fit(STATION_PTS(i,i===0?explode:0),w-side,h,o);return {...p,origin:[p.origin[0]+side,p.origin[1]] as Flat};};
 const a=at(Math.floor(station)),b=at(Math.min(2,Math.ceil(station))),t=station-Math.floor(station);
 return {origin:[a.origin[0]+(b.origin[0]-a.origin[0])*t,a.origin[1]+(b.origin[1]-a.origin[1])*t],scale:a.scale+(b.scale-a.scale)*t,azimuth:L.az,elevation:L.el};
}

// ── The football's panel seams: the edges of a truncated icosahedron on a unit sphere ───────────────────────────────────────
type V=[number,number,number];
const SEAMS:V[][]=(()=>{const t=(1+Math.sqrt(5))/2,raw:V[]=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]];
 const n=(v:V):V=>{const l=Math.hypot(...v);return [v[0]/l,v[1]/l,v[2]/l];},vs=raw.map(n),lerp=(a:V,b:V,u:number):V=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
 const d0=Math.min(...vs.slice(1).map(v=>Math.hypot(v[0]-vs[0][0],v[1]-vs[0][1],v[2]-vs[0][2])));
 const edges:[number,number][]=[];for(let i=0;i<12;i++)for(let j=i+1;j<12;j++)if(Math.abs(Math.hypot(vs[i][0]-vs[j][0],vs[i][1]-vs[j][1],vs[i][2]-vs[j][2])-d0)<1e-6)edges.push([i,j]);
 const arc=(a:V,b:V)=>Array.from({length:6},(_,i)=>n(lerp(a,b,i/5)));const out:V[][]=[];
 for(const [i,j] of edges)out.push(arc(lerp(vs[i],vs[j],1/3),lerp(vs[i],vs[j],2/3)));// the middle third: between two hexagons
 for(let v=0;v<12;v++){const nb=edges.filter(e=>e[0]===v||e[1]===v).map(e=>lerp(vs[v],vs[e[0]===v?e[1]:e[0]],1/3));
  for(let a=0;a<nb.length;a++)for(let b=a+1;b<nb.length;b++)if(Math.hypot(nb[a][0]-nb[b][0],nb[a][1]-nb[b][1],nb[a][2]-nb[b][2])<d0*.4)out.push(arc(nb[a],nb[b]));}// the pentagons
 return out;})();

/** The golden ball at centre c (world radius r), turned by `spin` radians about the vertical. */
function GoldBall({P,c,r,spin}:{P:Projection;c:Point3;r:number;spin:number}){
 const {sinA,cosA,sinE,cosE}=cameraOf(P),view:V=[cosA*cosE,sinA*cosE,sinE],k=scaleOf(P),cs=Math.cos(spin),sn=Math.sin(spin);
 const segs:{d:string;o:number}[]=[];
 for(const line of SEAMS){const pts=line.map(([x,y,z]):V=>[x*cs-y*sn,x*sn+y*cs,z]);
  for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],f=((a[0]+b[0])*view[0]+(a[1]+b[1])*view[1]+(a[2]+b[2])*view[2])/2;if(f<=.05)continue;
   const A=iso([c[0]+a[0]*r,c[1]+a[1]*r,c[2]+a[2]*r],P),B=iso([c[0]+b[0]*r,c[1]+b[1]*r,c[2]+b[2]*r],P);segs.push({d:pathOf([A,B]),o:Math.min(1,(f-.05)*2.2)});}}
 const sc=iso(c,P);
 return <Sphere c={sc} r={r*k} color={GOLD}>
  <g>{segs.map((s,i)=><path key={i} d={s.d} stroke="#7a5a12" strokeWidth={1.1} opacity={s.o*.9} fill="none" strokeLinecap="round"/>)}</g>
  <circle cx={sc[0]-r*k*.38} cy={sc[1]-r*k*.42} r={r*k*.16} fill="#fff8dc" opacity={.75}/>
 </Sphere>;
}

// ── Static parts ─────────────────────────────────────────────────────────────────────────────────────────────────────────
const BENCH:Plan={x:-130,y:-115,w:830,d:235,r:16};
const SCALE:Plan={x:-88,y:-88,w:176,d:176,r:10};
const TALLY:Plan={x:X0[1]-80,y:-48,w:160,d:96,r:6};
const BALLOT:Plan={x:X0[2]-70,y:-46,w:140,d:100,r:6};
export const CRANK:[number,number]=[-66,66],DIAL:[number,number]=[66,66],SEL:[number,number]=[X0[2]-30,0],GAUGE:[number,number]=[X0[2]+34,0];
const LEVER={x:TALLY.x+TALLY.w,y:6,z:70,len:44};
const placeAngle=(p:number)=>(-135+(p-1)*30)*Math.PI/180;// 10 places over 270°
const needleAngle=(pts:number)=>(-135+pts/15*270)*Math.PI/180;

function staticItems(P:Projection):Item[]{
 const out:Item[]=[...basePlate('bench',BENCH,P,{h:10,feet:6,inset:24})],kz=(x:number,y:number,z:number)=>depthOf([x,y,z],P);
 out.push(rulerStrip('ruler',BENCH.x+40,BENCH.x+BENCH.w-40,BENCH.y+BENCH.d-14,0,P,{d:7,step:5,every:5,k:-9e6}));
 out.push(labelPlate('label',{x:X0[1]-40,y:BENCH.y+BENCH.d-34,w:80,d:14,r:1.5},0,P,-8.9e6));
 // 1. The scale: a heavy base with a seam and screws, the scale dial (face up) and the crank's boss.
 out.push({k:kz(0,0,0)-50,id:'scale',n:<Solid paths={slabOf(SCALE,0,22,P,8,1.4)} tone="mid" inner={<>{[7,15].map(z=><Line key={z} d={sideSeam(SCALE,z,P,8)} tone="faint"/>)}</>}>
  <Line d={planOutline(insetPlan(SCALE,6),22,P,8)} tone="faint"/>
  {[[-78,-78],[78,-78],[-78,78],[78,78]].map(([x,y],i)=><Screw key={i} x={x} y={y} z={22} P={P} r={1.8}/>)}
 </Solid>});
 {const [x,y]=DIAL,top=26;const t=radialTicks(x,y,15,30,5,top,[1.6,3.2],P,-Math.PI*.75,Math.PI*1.5);
  out.push({k:kz(x,y,22),id:'dial',n:<g><Solid paths={cylinder(x,y,17,22,4,P,48,.5)} tone="mid" inner={<Line d={knurl(x,y,17,22.6,25.4,48,P,.2)} tone="faint"/>}/>
   <path d={cylinder(x,y,14.6,top,0,P,48).top} fill="#fbfbf8"/><Line d={t.minor} tone="lo"/><Line d={t.major} tone="mid"/>
   <FaceText transform={topMatrix([x-4.6,y+8],top,P,'x')} size={3.6} tone="mid">kg</FaceText></g>});}
 // 2. The tally machine's cabinet, its front windows and the plate slot.
 out.push({k:kz(X0[1],0,0)-40,id:'tally',n:<Solid paths={slabOf(TALLY,0,96,P,6,1.2)} tone="mid" inner={<>{[30,92].map(z=><Line key={z} d={sideSeam(TALLY,z,P,6)} tone="faint"/>)}</>}>
  <Line d={planOutline(insetPlan(TALLY,5),96,P,6)} tone="faint"/>
  {[[TALLY.x+8,-40],[TALLY.x+TALLY.w-8,-40],[TALLY.x+8,40],[TALLY.x+TALLY.w-8,40]].map(([x,y],i)=><Screw key={i} x={x} y={y} z={96} P={P} r={1.8}/>)}
 </Solid>});
 out.push({k:kz(LEVER.x,LEVER.y,LEVER.z)-1,id:'leverBoss',n:<g><Solid paths={slabOf({x:LEVER.x,y:LEVER.y-12,w:5,d:24,r:2},LEVER.z-14,28,P,4,.6)} tone="mid"/>
  <Solid paths={slabOf({x:LEVER.x,y:LEVER.y-30,w:3,d:56,r:1},LEVER.z-50,64,P,3)} tone="lo" crease="none"/></g>});
 // 3. The ballot box: a slab, the place selector's numbered ring and the points gauge's face.
 out.push({k:kz(X0[2],0,0)-40,id:'ballot',n:<Solid paths={slabOf(BALLOT,0,30,P,6,1.2)} tone="mid" inner={<Line d={sideSeam(BALLOT,10,P,6)} tone="faint"/>}>
  <Line d={planOutline(insetPlan(BALLOT,5),30,P,6)} tone="faint"/>
  {[[BALLOT.x+8,-38],[BALLOT.x+BALLOT.w-8,-38],[BALLOT.x+8,38],[BALLOT.x+BALLOT.w-8,38]].map(([x,y],i)=><Screw key={i} x={x} y={y} z={30} P={P} r={1.6}/>)}
 </Solid>});
 {const [x,y]=SEL;out.push({k:kz(x,y,30)-1,id:'selRing',n:<g><Solid paths={cylinder(x,y,27,30,2.4,P,56,.5)} tone="hi"/>
  {Array.from({length:10},(_,i)=>{const a=placeAngle(i+1),px=x+Math.sin(a)*21.5,py=y+Math.cos(a)*21.5;return <g key={i}>
   <path d={lineOnTop([x+Math.sin(a)*24.2,y+Math.cos(a)*24.2],[x+Math.sin(a)*26.4,y+Math.cos(a)*26.4],32.4,P)} className="iso-line" data-tone="mid"/>
   <FaceText transform={topMatrix([px-1.6,py+1.6],32.4,P,'x')} size={4} tone="hi">{String(i+1)}</FaceText></g>;})}</g>});}
 {const [x,y]=GAUGE,top=36;const t=radialTicks(x,y,22,30,5,top,[2,4],P,-Math.PI*.75,Math.PI*1.5);
  out.push({k:kz(x,y,30)-1,id:'gauge',n:<g><Solid paths={cylinder(x,y,25,30,6,P,56,.6)} tone="mid" inner={<Line d={knurl(x,y,25,30.6,35.4,64,P,.2)} tone="faint"/>}/>
   <path d={cylinder(x,y,22.4,top,0,P,56).top} fill="#fbfbf8"/><Line d={t.minor} tone="lo"/><Line d={t.major} tone="mid"/>
   {[0,5,10,15].map(v=>{const a=needleAngle(v),px=x+Math.sin(a)*14,py=y+Math.cos(a)*14;return <FaceText key={v} transform={topMatrix([px-2,py+1.6],top,P,'x')} size={3.6} tone="mid">{String(v)}</FaceText>;})}
  </g>});}
 // Three engraved plates along the front edge: the voters' three criteria (numbered; the words are on the card).
 [0,1,2].forEach(i=>{const pl:Plan={x:BALLOT.x+12+i*40,y:BALLOT.y+BALLOT.d-22,w:34,d:14,r:1.5};
  out.push({k:kz(pl.x+17,pl.y+7,30)+1,id:'crit'+i,n:<Solid paths={slabOf(pl,30,1,P,3)} tone="mid">
   <Line d={planOutline(insetPlan(pl,1.4),31,P,3)} tone="faint"/>
   <FaceText transform={topMatrix([pl.x+3,pl.y+10],31,P,'x')} size={8} tone="hi">{String(i+1)}</FaceText>
   {[.36,.64].map((f,j)=><Line key={j} d={lineOnTop([pl.x+11,pl.y+pl.d*f],[pl.x+(j?22:30),pl.y+pl.d*f],31,P)} tone="lo" free/>)}
  </Solid>});});
 // A stack of 100 ballot cards beside the box.
 for(let i=0;i<9;i++)out.push({k:kz(X0[2]+95,-60,i)+i*.01,id:'card'+i,n:<Solid paths={slabOf({x:X0[2]+80+(i%2)*.8,y:-75+(i%3)*.6,w:30,d:22,r:1},i*1.2,1.2,P,3)} tone="hi" crease="none"/>});
 return out;
}

/** Where things are on screen. */
export function anchors(v:View,P:Projection){
 const e=v.explode;
 return {ball:iso([0,0,104+e*92+44],P),block:iso([20,10,48+e*40],P),scale:iso([DIAL[0],DIAL[1],26],P),plate:iso([X0[1],48+v.plate*44,12],P)};
}

export function Scene({w,h,P,v,onCtlDown,onCtlKey}:{w:number;h:number;P:Projection;v:View;onCtlDown:(c:Ctl,e:RPointerEvent<SVGElement>)=>void;onCtlKey:(c:Ctl,e:RKeyboardEvent<SVGElement>)=>void}){
 const uid=useId().replace(/:/g,'');
 const stat=useMemo(()=>staticItems(P),[P]);
 const k=scaleOf(P),items:Item[]=[...stat],kz=(x:number,y:number,z:number)=>depthOf([x,y,z],P),e=v.explode;
 // ── 1. turntable, block, ball, crank, needle
 const tick=radialTicks(0,0,62,48,4,30,[2,4],P,v.spin,Math.PI*2);
 items.push({k:kz(0,0,22),id:'platter',n:<g data-spin={v.spin.toFixed(2)}><Solid paths={cylinder(0,0,66,22,8,P,72,.8)} tone="hi" inner={<Line d={sideArc(0,0,66,26,P,48)} tone="faint"/>}/>
  <Line d={tick.minor} tone="lo"/><Line d={tick.major} tone="mid"/><Line d={ring(0,0,40,30,P,56)} tone="faint"/>
  <path d={lineOnTop([Math.sin(v.spin)*44,Math.cos(v.spin)*44],[Math.sin(v.spin)*60,Math.cos(v.spin)*60],30.1,P)} stroke="var(--acc-e)" strokeWidth={3} strokeLinecap="round"/></g>});
 // the pyrite block: two irregular crystal steps, turned with the platter
 const rot=(pts:[number,number][])=>pts.map(([x,y]):[number,number]=>[x*Math.cos(v.spin)-y*Math.sin(v.spin),x*Math.sin(v.spin)+y*Math.cos(v.spin)]);
 const lo=rot([[-30,-16],[-12,-31],[18,-27],[32,-6],[26,20],[4,32],[-22,26],[-34,4]]),hi=rot([[-20,-12],[-4,-22],[16,-16],[22,2],[14,18],[-6,22],[-22,10]]);
 const bz=e*40;
 items.push({k:kz(0,0,40)+2,id:'block',n:<g data-layer="block"><path className="iso-halo" style={{opacity:.25*(1-e)}} d={extrude(lo,30,1,P).fill}/>
  <Tint paths={extrude(lo,30+bz,22,P,{bevel:.8})} color={PYRITE} edge="hi"/>
  <Tint paths={extrude(hi,52+bz,10,P,{bevel:.6})} color="#c2b285" edge="hi"/>
  <path d={pathOf(lo.slice(0,4).map(([x,y])=>iso([x*.7,y*.7,52+bz],P)))} className="iso-line" data-tone="faint" fill="none"/></g>});
 const ballC:Point3=[0,0,104+e*92];
 items.push({k:kz(0,0,104)+4,id:'ball',n:<g data-layer="ball">
  {e>.02&&<path d={pathOf([iso([0,0,62+bz],P),iso([0,0,ballC[2]-40],P)])} stroke="var(--anatomy-faint)" strokeWidth={1.2} strokeDasharray="4 4"/>}
  <GoldBall P={P} c={ballC} r={40} spin={v.spin}/></g>});
 {const [x,y]=CRANK,a=v.spin,hx=x+Math.sin(a)*20,hy=y+Math.cos(a)*20;
  items.push({k:kz(x,y,22)+30,id:'crank',n:<g data-crank>
   <Solid paths={cylinder(x,y,9,22,6,P,36,.5)} tone="mid" inner={<Line d={knurl(x,y,9,22.6,27.4,36,P,.2)} tone="faint"/>}/>
   <Solid paths={extrude(armRing(x,y,hx,hy,4),28,3,P)} tone="hi"/>
   <Solid paths={cylinder(hx,hy,4.6,31,14,P,24,.5)} tone="hi" lit/>
   <Solid paths={cylinder(hx,hy,5.4,45,2.4,P,24,.6)} tone="hi"/>
   <circle cx={iso([x,y,31],P)[0]} cy={iso([x,y,31],P)[1]} r={1.5} fill="var(--anatomy-dot)"/></g>});}
 {const [x,y]=DIAL,a=-Math.PI*.75+v.needle/15*Math.PI*1.5;
  items.push({k:kz(x,y,26)+1,id:'needle',n:<g data-kg={Math.round(v.needle)}><path d={lineOnTop([x-Math.sin(a)*3,y-Math.cos(a)*3],[x+Math.sin(a)*12,y+Math.cos(a)*12],26.2,P)} stroke="#c8372d" strokeWidth={2} strokeLinecap="round"/>
   <circle cx={iso([x,y,26.2],P)[0]} cy={iso([x,y,26.2],P)[1]} r={1.6} fill="var(--anatomy-dot)"/></g>});}
 // ── 2. the tally machine's front: year counter, four drum windows, the plate slot; the plate; the lever.
 const T=tally(v.pulls),prev=tally(Math.max(0,v.pulls-1)),roll=v.roll;
 const face=(u:number,z:number)=>sideMatrix([TALLY.x+u,TALLY.y+TALLY.d],z,P,'left');
 const win=(id:string,u:number,z:number,wd:number,ht:number,now:string,before:string)=>{const cid=`${uid}-${id}`;
  return <g key={id} transform={face(u,z)} data-drum={id} data-value={now}>
   <rect x={-1.5} y={-1.5} width={wd+3} height={ht+3} rx={2} fill="#3a3a3c"/>
   <clipPath id={cid}><rect x={0} y={0} width={wd} height={ht} rx={1.2}/></clipPath>
   <g clipPath={`url(#${cid})`}><rect x={0} y={0} width={wd} height={ht} fill="#f7f3e3"/>
    {[...now].map((ch,i)=>{const b=before[i]??ch,moving=b!==ch&&roll<1,cw=wd/now.length;return <g key={i}>
     {i>0&&<path d={`M${i*cw} 0V${ht}`} stroke="#c9c2a8" strokeWidth={.6}/>}
     {moving&&<text x={i*cw+cw/2} y={ht*.78-roll*ht} textAnchor="middle" fontSize={ht*.8} className={'bd-digit'}>{b}</text>}
     <text x={i*cw+cw/2} y={ht*.78+(moving?(1-roll)*ht:0)} textAnchor="middle" fontSize={ht*.8} className="bd-digit">{ch}</text></g>;})}
    <rect x={0} y={0} width={wd} height={ht*.22} fill="#000" opacity={.12}/><rect x={0} y={ht*.78} width={wd} height={ht*.22} fill="#000" opacity={.1}/></g>
  </g>;};
 const p2=(n:number)=>String(n).padStart(2,'0');
 items.push({k:kz(X0[1],TALLY.y+TALLY.d,48)+1,id:'tallyFace',n:<g>
  {win('year',50,88,60,15,T.year?String(T.year):'----',prev.year?String(prev.year):'----')}
  {win('mf',12,58,28,15,p2(T.mf),p2(prev.mf))}{win('df',50,58,28,15,p2(T.df),p2(prev.df))}{win('gk',88,58,28,15,p2(T.gk),p2(prev.gk))}{win('women',126,58,24,15,p2(T.women),p2(prev.women))}
  <g transform={face(0,36)}>
   {[['ATT · MID',26],['DEF',64],['GK',102],['W',138]].map(([t,u])=><text key={t} x={u as number} y={0} textAnchor="middle" fontSize={5} className="bd-engrave">{t}</text>)}
   <path d={'M120 -26V2'} stroke="#8a8a86" strokeWidth={.8}/>
   <rect x={34} y={12} width={92} height={8} rx={2} fill="#3a3a3c"/>
  </g></g>});
 // the plate sliding out of the slot (it carries the era's name, engraved)
 if(v.pulls>0&&v.plate>.02){const pl:Plan={x:X0[1]-44,y:TALLY.y+TALLY.d,w:88,d:Math.max(3,34*v.plate),r:2},z=16,out=pl.d;
  items.push({k:kz(X0[1],TALLY.y+TALLY.d+out,z)+2,id:'plate',n:<g data-plate={ERAS[v.pulls-1].label}>
   <Tint paths={slabOf(pl,z,2.2,P,3,.4)} color="#d6b85a" edge="hi"/>
   {v.plate>.85&&<>
   <FaceText transform={topMatrix([pl.x+8,pl.y+pl.d-12],z+2.2,P,'x')} size={9} tone="hi">{ERAS[v.pulls-1].label}</FaceText>
   {[0,1].map(i=><path key={i} d={lineOnTop([pl.x+8,pl.y+pl.d-20-i*5],[pl.x+pl.w-10-i*20,pl.y+pl.d-20-i*5],z+2.2,P)} stroke="#8a6a1c" strokeWidth={.8}/>)}</>}
  </g>});}
 {const a=(.9-v.pull*1.5),p0=iso([LEVER.x+6,LEVER.y,LEVER.z],P),end=iso([LEVER.x+6,LEVER.y+Math.cos(a)*LEVER.len*.35,LEVER.z+Math.sin(a)*LEVER.len],P);
  items.push({k:kz(LEVER.x+10,LEVER.y,LEVER.z)+40,id:'lever',n:<g data-lever={v.pull.toFixed(2)}><Rod a={p0} b={end} r={2.6*k}/>
   <Ball cx={end[0]} cy={end[1]} r={7*k} look="acc" edge="mid" seams={false}/>
   <circle cx={p0[0]} cy={p0[1]} r={4*k} fill="var(--anatomy-paper)" className="iso-line" data-tone="hi"/><circle cx={p0[0]} cy={p0[1]} r={1.2} fill="var(--anatomy-dot)"/></g>});}
 // ── 3. selector knob and gauge needle
 {const [x,y]=SEL,a=placeAngle(v.place);
  items.push({k:kz(x,y,32)+2,id:'sel',n:<g data-place={v.place}>
   <Solid paths={cylinder(x,y,15,32.4,9,P,48,.6)} tone="hi" inner={<Line d={knurl(x,y,15,33.2,40.6,48,P,.2)} tone="faint"/>}/>
   <Solid paths={extrude(armRing(x,y,x+Math.sin(a)*19,y+Math.cos(a)*19,3.2),41.4,2,P)} tone="hi"/>
   <path d={lineOnTop([x+Math.sin(a)*4,y+Math.cos(a)*4],[x+Math.sin(a)*18,y+Math.cos(a)*18],43.5,P)} stroke="var(--acc-e)" strokeWidth={2.4} strokeLinecap="round"/></g>});}
 {const [x,y]=GAUGE,a=needleAngle(v.needleB);
  items.push({k:kz(x,y,36)+1,id:'gNeedle',n:<g data-points={POINTS[v.place-1]}>
   <path d={lineOnTop([x-Math.sin(a)*4,y-Math.cos(a)*4],[x+Math.sin(a)*19,y+Math.cos(a)*19],36.2,P)} stroke="#c8372d" strokeWidth={2.2} strokeLinecap="round"/>
   <circle cx={iso([x,y,36.2],P)[0]} cy={iso([x,y,36.2],P)[1]} r={2} fill="var(--anatomy-dot)"/></g>});}
 const hits=hitTargets(v,P);
 return <svg className="iso-svg" viewBox={`0 0 ${w} ${h}`} role="group" aria-label="The golden ball workshop">
  <style>{'.bd-digit{font-family:ui-monospace,Menlo,monospace;font-weight:700;fill:#1d1d1b}.bd-engrave{font-family:ui-monospace,Menlo,monospace;font-weight:600;fill:#4a4a48}'}</style>
  <g>{painted(items)}</g>
  <g data-hits>{hits.filter(x=>x.on).map(x=><circle key={x.c} cx={x.at[0]} cy={x.at[1]} r={x.r} className="iso-hit" data-ctl={x.c} tabIndex={0} role={x.role} aria-label={x.label}
   aria-valuetext={x.value} onPointerDown={ev=>onCtlDown(x.c,ev)} onKeyDown={ev=>onCtlKey(x.c,ev)}/>)}</g>
 </svg>;
}

export function hitTargets(v:View,P:Projection){
 const k=scaleOf(P),R=(n:number)=>Math.max(24,n*k),st=Math.round(v.station);
 return [
  {c:'crank' as Ctl,at:iso([CRANK[0]+Math.sin(v.spin)*20,CRANK[1]+Math.cos(v.spin)*20,40],P),r:R(14),on:st===0,role:'slider',label:'Crank: turn the turntable',value:`${Math.round(((v.spin*180/Math.PI)%360+360)%360)} degrees`},
  {c:'lever' as Ctl,at:iso([LEVER.x+6,LEVER.y+Math.cos(.9-v.pull*1.5)*LEVER.len*.35,LEVER.z+Math.sin(.9-v.pull*1.5)*LEVER.len],P),r:R(16),on:st===1,role:'button',label:'Tally lever: pull to count the next era',value:''},
  {c:'place' as Ctl,at:iso([SEL[0],SEL[1],38],P),r:R(26),on:st===2,role:'slider',label:'Place selector: 1st to 10th',value:`place ${v.place}`},
 ];
}
export const placeFromAngle=(rad:number)=>{let d=rad*180/Math.PI;while(d>180)d-=360;while(d<-180)d+=360;return Math.max(1,Math.min(10,Math.round((d+135)/30)+1));};
/** A flat bar from (x0, y0) to (x1, y1), half-width w, as a floor ring. */
function armRing(x0:number,y0:number,x1:number,y1:number,w:number):[number,number][]{
 const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,nx=-dy/l*w,ny=dx/l*w;
 const ring2:[number,number][]=[];
 for(let i=0;i<=10;i++){const a=-Math.PI/2+Math.PI*i/10;ring2.push([x1+Math.cos(a)*dx/l*w+Math.sin(a)*nx,y1+Math.cos(a)*dy/l*w+Math.sin(a)*ny]);}
 for(let i=0;i<=10;i++){const a=Math.PI/2+Math.PI*i/10;ring2.push([x0+Math.cos(a)*dx/l*w+Math.sin(a)*nx,y0+Math.cos(a)*dy/l*w+Math.sin(a)*ny]);}
 return ring2;
}
/** A round bar between two screen points. */
function Rod({a,b,r}:{a:Flat;b:Flat;r:number}){
 const d=`M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 return <g><path d={d} stroke="var(--anatomy-hi)" strokeWidth={r*2+1.6} strokeLinecap="round" fill="none"/>
  <path d={d} stroke="var(--anatomy-shade-1)" strokeWidth={r*2} strokeLinecap="round" fill="none"/>
  <path d={`M${(a[0]-nx*r*.35).toFixed(1)} ${(a[1]-ny*r*.35).toFixed(1)}L${(b[0]-nx*r*.35).toFixed(1)} ${(b[1]-ny*r*.35).toFixed(1)}`} stroke="#ffffff" strokeWidth={r*.7} strokeLinecap="round" fill="none" opacity={.9}/></g>;
}
