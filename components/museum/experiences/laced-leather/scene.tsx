'use client';
import {memo,type ReactNode} from 'react';
import * as k from '../anatomy/iso-kit';
import {Solid,Line,Dots} from '../anatomy/draw';
import {Base,LabelPlate,Sphere,Tint,at,boxPts,depth,kOf,mix,onTop,post,pt,ringTop,seg,slab,type Frame,type FPlan} from '../anatomy/bench';
import {MODERN_G,gramsAt,leatherTone,needleAngle,panSink,soakOfGrams,DIAL} from './model';
import {DMAX,ZONES} from './match';

/**
 * laced-leather · the weather machine and the rain match, drawn in the anatomy style (Oct 12 2026, Paper theme): solid paper
 * parts with four-tone sides, thin hairlines, a soft halo under the base. Colour only where colour is the lesson: the leather that
 * darkens as it drinks, the mud, and one blue accent for the water and the aim. Frame space: a along the model, b across, z up.
 */
export const BLUE='#2a5bd7';
const WATER='#6f93e0';

// ── 1. The rain machine ────────────────────────────────────────────────────────────────────────────────────────────────
export const RIG={plate:{a:-215,b:-125,w:430,d:250,r:12} as FPlan,scales:{leather:{a:-92,b:4},modern:{a:92,b:4}},R:38,H:204,posts:[[-196,-104],[196,-104],[-196,104],[196,104]] as const};
export const rigPoints=(H=RIG.H)=>[...boxPts(RIG.plate,-20,0),[-200,-110,H+30] as [number,number,number],[200,110,H+30] as [number,number,number]];
const PAN_Z=50;
/** One dial scale: a bevelled base, a dial face with a 300° scale and a needle, a column, a ribbed pan. */
function Scale({F,P,a,b,g}:{F:Frame;P:k.Projection;a:number;b:number;g:number}){
 const base:FPlan={a:a-62,b:b-52,w:124,d:124,r:8},[dx,dy]=at(F,a,b+38),top=26;
 const t=k.radialTicks(dx,dy,28,40,5,top+1.2,[2.4,5],P,DIAL.from,DIAL.span);
 const ang=needleAngle(g),tip:[number,number]=[dx+Math.sin(ang)*24,dy-Math.cos(ang)*24],tail:[number,number]=[dx-Math.sin(ang)*5,dy+Math.cos(ang)*5];
 const sink=panSink(g);
 return <g data-scale="">
  <Solid paths={slab(F,base,0,top,P,8,1.2)} tone="mid" inner={<Line d={k.ringSeam(k.roundedPlan({x:base.a,y:base.b,w:base.w,d:base.d,r:base.r},8).map(([x,y])=>at(F,x,y)),9,P)} tone="faint"/>}/>
  {/* the dial: a bezel ring proud of the top, the face, ticks, the needle, its hub */}
  <Solid paths={k.cylinder(dx,dy,32,top,1.2,P,56,.4)} tone="mid"/>
  <Line d={t.minor} tone="lo"/><Line d={t.major} tone="mid"/>
  <path d={k.lineOnTop(tail,tip,top+1.3,P)} className="iso-line" data-tone="lit" style={{strokeWidth:2,stroke:BLUE}} data-needle={g}/>
  <Dots points={[k.iso([dx,dy,top+1.3],P)]} size={1.6} tone="hi"/>
  <Dots points={[[a-54,b-44],[a+54,b-44],[a-54,b+64],[a+54,b+64]].map(([x,y])=>pt(F,x,y,top,P))} size={.6} tone="hi"/>
  <Solid paths={post(F,a,b-8,9,top,4,P,24)} tone="mid"/>
  <Solid paths={post(F,a,b-8,5,top+4,PAN_Z-top-4-sink,P,18)} tone="mid" crease="none"/>
  <Solid paths={post(F,a,b-8,46,PAN_Z-sink,6,P,64,.8)} tone="hi"/>
  <Line d={k.ring(...at(F,a,b-8),38,PAN_Z+6-sink,P,56)} tone="faint"/>
 </g>;
}
export const RigStatic=memo(function RigStatic({F,P,H=RIG.H}:{F:Frame;P:k.Projection;H?:number}){
 const r=RIG;
 return <g data-rig="">
  <Base F={F} p={r.plate} P={P} z={-14} h={12}/>
  <LabelPlate F={F} a={-30} b={78} w={60} d={22} z={0} P={P}/>
  {/* drip tray under both scales */}
  <Solid paths={slab(F,{a:-176,b:-70,w:352,d:140,r:6},0,4,P,6,.6)} tone="lo"/>
  <Line d={k.onTop(k.roundedPlan({x:-170,y:-64,w:340,d:128,r:4},6).map(([x,y])=>at(F,x,y)),4,P,true)} tone="faint"/>
  {/* the four posts (back ones first) */}
  {[...r.posts].sort((A,B)=>depth(F,A[0],A[1],0,P)-depth(F,B[0],B[1],0,P)).map(([a,b],i)=><g key={i}>
   <Solid paths={post(F,a,b,9,0,6,P,24,.5)} tone="mid"/>
   <Solid paths={post(F,a,b,4.2,6,H-6,P,18)} tone="mid" crease="none" inner={<Line d={[60,120,180,240].filter(z=>z<H-20).map(z=>k.sideArc(...at(F,a,b),4.2,z,P,10)).join('')} tone="faint"/>}/>
  </g>)}
 </g>;
});
/** The hood is drawn after the scales (it is above them): a frame with nozzles, the supply pipe, a valve wheel and the RAIN lamp. */
export function Hood({F,P,raining,H=RIG.H}:{F:Frame;P:k.Projection;raining:boolean;H?:number}){
 const hood:FPlan={a:-206,b:-114,w:412,d:228,r:8},pipe:FPlan={a:-176,b:-9,w:352,d:18,r:4};
 const nozzles=[RIG.scales.leather,RIG.scales.modern].flatMap(s=>[[-18,-18],[18,-18],[0,0],[-18,18],[18,18]].map(([da,db])=>[s.a+da,s.b-8+db] as const));
 return <g data-hood="">
  {nozzles.map(([a,b],i)=><Solid key={i} paths={post(F,a,b,3.2,H-12,12,P,14)} tone="mid" crease="none"/>)}
  <Solid paths={slab(F,hood,H,12,P,8,1.2)} tone="mid" inner={<Line d={k.ringSeam(k.roundedPlan({x:hood.a,y:hood.b,w:hood.w,d:hood.d,r:hood.r},8).map(([x,y])=>at(F,x,y)),H+6,P)} tone="faint"/>}/>
  <Line d={k.onTop(k.roundedPlan({x:hood.a+8,y:hood.b+8,w:hood.w-16,d:hood.d-16,r:4},8).map(([x,y])=>at(F,x,y)),H+12,P,true)} tone="lo"/>
  <Dots points={[[hood.a+5,hood.b+5],[hood.a+hood.w-5,hood.b+5],[hood.a+5,hood.b+hood.d-5],[hood.a+hood.w-5,hood.b+hood.d-5]].map(([a,b])=>pt(F,a,b,H+12,P))} size={.6} tone="hi"/>
  {[pipe.a+8,pipe.a+pipe.w-8].map((a,i)=><Solid key={i} paths={post(F,a,0,8,H+12,4,P,20)} tone="mid"/>)}
  <Tint paths={slab(F,pipe,H+16,14,P,6,.6)} color={raining?mix(BLUE,'#ffffff',.55):'#e9e9e4'} edge="hi"/>
  <Solid paths={post(F,0,-30,5,H+12,14,P,16)} tone="mid" crease="none"/>
  <Solid paths={post(F,0,-30,16,H+26,4,P,40,.5)} tone="hi"/>
  <Line d={k.knurl(...at(F,0,-30),16,H+26,H+30,40,P)} tone="faint"/>
  {raining?<Tint paths={post(F,180,-96,6,H+12,6,P,18)} color={BLUE}/>:<Solid paths={post(F,180,-96,6,H+12,6,P,18)} tone="mid"/>}
 </g>;
}
/** The two balls on their scales, the water on the tray and (while raining) the falling water. */
export function RigLive({F,P,soak,raining,H=RIG.H}:{F:Frame;P:k.Projection;soak:number;raining:boolean;H?:number}){
 const kk=kOf(P),R=RIG.R,g=gramsAt(soak),L=RIG.scales.leather,N=RIG.scales.modern;
 const ballC=(s:{a:number;b:number},gr:number)=>pt(F,s.a,s.b-8,PAN_Z+6-panSink(gr)+R*.98,P);
 const lc=ballC(L,g),nc=ballC(N,MODERN_G),r=R*kk;
 const rain=(s:{a:number;b:number},top:number)=>[[-18,-18],[18,-18],[0,0],[-18,18],[18,18],[-9,6],[9,-6]].map(([da,db])=>seg(F,s.a+da,s.b-8+db,H-14,s.a+da,s.b-8+db,top,P)).join('');
 const pool=Math.max(0,soak);
 return <g data-rig-live="">
  {pool>0&&<path d={onTop(F,k.circleRing(0,0,1,40).map(([x,y])=>[x*(40+pool*110),y*(16+pool*38)] as [number,number]),4.2,P,true)} fill={WATER} opacity={.1+pool*.16}/>}
  <Scale F={F} P={P} a={L.a} b={L.b} g={g}/>
  <Scale F={F} P={P} a={N.a} b={N.b} g={MODERN_G}/>
  <Sphere c={lc} r={r} color={leatherTone(soak)}><Lace c={lc} r={r} soak={soak}/></Sphere>
  <Sphere c={nc} r={r} color="#f7f7f3"><ModernPanels c={nc} r={r}/></Sphere>
  {soak>.15&&<Dots points={[0,1,2,3,4].slice(0,Math.round(soak*5)).map(i=>[lc[0]-r*.5+i*r*.25,lc[1]+r*.35+(i%2)*3] as k.Flat)} size={1.4} tone="hi"/>}
  {raining&&<g className="ll-rain"><Line d={rain(L,PAN_Z+R*2)} tone="blue" flow/><Line d={rain(N,PAN_Z+R*2)} tone="blue" flow/></g>}
 </g>;
}
/** The lace: a slot across the top with cross stitches (darker as the leather soaks). */
function Lace({c,r,soak}:{c:k.Flat;r:number;soak:number}){
 const [x,y]=[c[0]-r*.08,c[1]-r*.42],w=r*.62,ink=mix('#2a1a0c','#000000',soak*.5);
 return <g>
  <path d={`M${x-w/2} ${y}Q${x} ${y-r*.12} ${x+w/2} ${y}`} fill="none" stroke={ink} strokeWidth={Math.max(1.2,r*.05)} strokeLinecap="round"/>
  {[-.36,-.12,.12,.36].map(f=><path key={f} d={`M${x+w*f-r*.05} ${y-r*.1}L${x+w*f+r*.05} ${y+r*.06}`} stroke={mix('#f1dcc0',ink,soak*.6)} strokeWidth={Math.max(1,r*.035)} strokeLinecap="round"/>)}
  <path d={`M${c[0]-r*.86} ${c[1]+r*.1}Q${c[0]} ${c[1]+r*.36} ${c[0]+r*.9} ${c[1]-r*.05}M${c[0]-r*.2} ${c[1]-r*.96}Q${c[0]+r*.12} ${c[1]} ${c[0]-r*.1} ${c[1]+r*.98}`} fill="none" stroke={mix(leatherTone(soak),'#000000',.35)} strokeWidth={1}/>
 </g>;
}
/** A modern ball: a dark pentagon at the front, seams running from its corners to the rim (a stand-in for any modern size 5). */
function ModernPanels({c,r}:{c:k.Flat;r:number}){
 const [x,y]=[c[0]-r*.08,c[1]-r*.06],pts=Array.from({length:5},(_,i)=>{const t=-Math.PI/2+i*2*Math.PI/5;return [x+Math.cos(t)*r*.3,y+Math.sin(t)*r*.3] as const;});
 const rim=pts.map(([px,py])=>{const dx=px-x,dy=py-y,l=Math.hypot(dx,dy)||1;return [c[0]+dx/l*r*.97,c[1]+dy/l*r*.97] as const;});
 return <g>
  <path d={pts.map(([px,py],i)=>`M${px} ${py}Q${(px+rim[i][0])/2+(i%2?3:-3)} ${(py+rim[i][1])/2} ${rim[i][0]} ${rim[i][1]}`).join('')} fill="none" stroke="#77777a" strokeWidth={1}/>
  <path d={'M'+pts.map(p=>p.join(' ')).join('L')+'Z'} fill="#2e2e31" stroke="#1d1d1b" strokeWidth={.8}/>
 </g>;
}

// ── 2. The rain match ──────────────────────────────────────────────────────────────────────────────────────────────────
export const M2W=10;// world units per metre along the lane
export const LANE={plate:{a:-52,b:-112,w:478,d:224,r:12} as FPlan,turf:{a:-38,b:-96,w:450,d:180,r:4} as FPlan,ruler:{b:66,d:9}};
export const lanePoints=()=>[...boxPts(LANE.plate,-20,0),[DMAX*M2W,0,70] as [number,number,number]];
const TURF='#8ba46e';
/** The pitch: base, turf slab, mud along the kick line (worse as the minutes go by), a metre ruler and the scenery players. */
export const LaneStatic=memo(function LaneStatic({F,P,minute}:{F:Frame;P:k.Projection;minute:number}){
 const T=LANE.turf,z=4,ru=LANE.ruler;
 const mud=.25+minute/90*.75;
 const minor:string[]=[],major:string[]=[],nums:ReactNode[]=[];
 for(let m=0;m<=40;m++){const a=m*M2W;if(a>T.a+T.w-6)break;const big=m%5===0;(big?major:minor).push(onTop(F,[[a,ru.b+.8],[a,ru.b+.8+(big?5:2.6)]],z+.6,P));
  if(big&&m>0){const [x,y]=pt(F,a,ru.b+ru.d+5,z+.6,P);nums.push(<text key={m} x={x} y={y} className="ll-num" textAnchor="middle">{m}</text>);}}
 const scenery=[[60,-66],[150,-78],[255,-62],[330,-82],[110,-40]] as const;
 return <g data-lane="">
  <Base F={F} p={LANE.plate} P={P} z={-14} h={12} ruler={false}/>
  <Tint paths={slab(F,T,-2,6,P,4,.6)} color={TURF} edge="hi"/>
  {[[30,6,22],[90,-10,30],[150,8,26],[210,-4,34],[270,10,24],[330,-6,28]].map(([a,b,r],i)=><path key={i} d={onTop(F,k.circleRing(0,0,1,28).map(([x,y])=>[a+x*r*(1+mud),b+y*r*.55*(1+mud)] as [number,number]),z,P,true)} fill="#5b3f24" opacity={(.1+mud*.32).toFixed(2)}/>)}
  <path d={onTop(F,[[0,0],[T.a+T.w-10,0]],z,P)} className="iso-line" data-tone="faint"/>
  <Solid paths={slab(F,{a:-30,b:ru.b,w:T.w-16,d:ru.d,r:1},z,.8,P,3)} tone="lo" crease="none"/>
  <Line d={minor.join('')} tone="lo"/><Line d={major.join('')} tone="mid"/>
  {nums}
  <LabelPlate F={F} a={LANE.plate.a+18} b={LANE.plate.b+12} w={44} d={18} z={-2} P={P}/>
  {scenery.map(([a,b],i)=><Peg key={i} F={F} P={P} a={a} b={b} ink/>)}
  {[[T.a+4,T.b+4],[T.a+T.w-4,T.b+4],[T.a+4,T.b+T.d-4],[T.a+T.w-4,T.b+T.d-4]].map(([a,b],i)=><g key={'f'+i}><Solid paths={post(F,a,b,1.2,z,20,P,8)} tone="hi" crease="none"/><path d={k.pathOf([pt(F,a,b,z+20,P),pt(F,a+9,b,z+17,P),pt(F,a,b,z+14,P)],true)} fill="var(--anatomy-face)" className="iso-line" data-tone="hi"/></g>)}
 </g>;
});
/** A player peg: a round body and a ball head on a soft shadow. */
export function Peg({F,P,a,b,ink=false,band,lift=0}:{F:Frame;P:k.Projection;a:number;b:number;ink?:boolean;band?:string;lift?:number}){
 const kk=kOf(P),z=4+lift,body=post(F,a,b,7,z,20,P,20),h=pt(F,a,b,z+26,P),s=pt(F,a,b,4,P);
 return <g data-peg="">
  <ellipse className="iso-halo" cx={s[0]} cy={s[1]} rx={9*kk} ry={4.4*kk}/>
  {ink?<Tint paths={body} color="#b9b9b4"/>:<Solid paths={body} tone="hi" inner={band?<path d={k.sideArc(...at(F,a,b),7,z+12,P,16)} stroke={band} strokeWidth={2.4} fill="none"/>:undefined}/>}
  <Sphere c={h} r={6*kk} color={ink?'#c4c4bf':'#f2f2ee'}/>
 </g>;
}
/** The pass: you, the team-mate with the 3 / 2 / 1 rings, the dry-ball marker, the ball (and its shadow), where it landed. */
export function LaneLive({F,P,target,aim,ball,landed,grams,leather,kicking}:{F:Frame;P:k.Projection;target:number;aim:number|null;ball:{u:number;z:number}|null;landed:number|null;grams:number;leather:boolean;kicking:boolean}){
 const kk=kOf(P),z=4,ta=target*M2W,items:{d:number;el:ReactNode}[]=[];
 const rings=<g key="rings" data-zones="">{ZONES.map((r,i)=><path key={r} d={ringTop(F,ta,0,r*M2W,z,P,48)} className="iso-line" data-tone={i===0?'hi':'mid'} fill={i===0?mix(BLUE,'#ffffff',.7):'none'} fillOpacity={i===0?.85:0} style={i===0?{stroke:BLUE}:undefined}/>)}</g>;
 items.push({d:-1e9,el:rings});
 if(aim!=null&&!ball)items.push({d:-1e8,el:<g key="aim" data-aim={aim.toFixed(1)}>
  <path d={ringTop(F,aim*M2W,0,9,z,P,32)} fill="none" stroke={BLUE} strokeWidth={2}/>
  <path d={onTop(F,[[aim*M2W-15,0],[aim*M2W+15,0]],z,P)+onTop(F,[[aim*M2W,-15],[aim*M2W,15]],z,P)} stroke={BLUE} strokeWidth={1.4}/>
  <path d={onTop(F,[[0,0],[aim*M2W,0]],z,P)} stroke={BLUE} strokeWidth={1.4} strokeOpacity={.5}/>
 </g>});
 if(landed!=null)items.push({d:-1e8+1,el:<g key="land" data-landed={landed.toFixed(1)}><path d={ringTop(F,landed*M2W,0,6,z,P,24)} fill="#1d1d1b" fillOpacity={.18} className="iso-line" data-tone="hi"/></g>});
 items.push({d:depth(F,ta,0,0,P),el:<Peg key="mate" F={F} P={P} a={ta} b={0} band={BLUE}/>});
 items.push({d:depth(F,-16,10,0,P),el:<Peg key="me" F={F} P={P} a={-16+(kicking?6:0)} b={10} band={BLUE}/>});
 const b=ball??{u:0,z:0},ba=b.u*M2W,r=7,c=pt(F,ba,0,z+r+b.z*M2W,P),sh=pt(F,ba,0,z,P);
 items.push({d:depth(F,ba,0,0,P)+.5,el:<g key="ball" data-ball-at={b.u.toFixed(1)}>
  <Sphere c={c} r={r*kk} color={leather?leatherTone(soakOfGrams(grams)):'#f7f7f3'} shadow={{c:sh,rx:r*kk*(1-Math.min(.5,b.z*.04)),ry:r*kk*.42}}/>
 </g>});
 return <>{items.sort((x,y)=>x.d-y.d).map(i=>i.el)}</>;
}
/** Screen geometry of the kick line, to turn a pointer into metres along it. */
export const laneAxis=(F:Frame,P:k.Projection)=>{const o=pt(F,0,0,4,P),e=pt(F,M2W,0,4,P);return {o,du:[e[0]-o[0],e[1]-o[1]] as k.Flat};};
export const metresAt=(F:Frame,P:k.Projection,x:number,y:number)=>{const {o,du}=laneAxis(F,P);return ((x-o[0])*du[0]+(y-o[1])*du[1])/(du[0]*du[0]+du[1]*du[1]);};
export {MODERN_G};
