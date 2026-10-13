'use client';
import {memo,type ReactNode} from 'react';
import * as k from '../anatomy/iso-kit';
import {Solid,Line,Dots} from '../anatomy/draw';
import {Base,LabelPlate,Sphere,Tint,at,boxPts,depth,greyOf,kOf,mix,onTop,post,pt,ringTop,seg,slab,type Frame,type FPlan} from '../anatomy/bench';
import {GRASS,LEATHER,LEATHER_SEAM,polygon} from './geometry';
import {PIECES,ballPanels,ballAt,playerAt,rotate,axisQ,compose,PLAYERS,type BallKind,type Match,type Picture,type Quat} from './model';
import type {PanelKind} from './geometry';

/**
 * telstar-1970 · the two machines drawn in the anatomy style (Oct 12 2026, Paper theme): solid paper parts, four-tone sides, thin
 * hairlines, a soft halo under the base; colour only where colour is the lesson (the grass, the brown ball) and one red accent
 * (the gap to fill, the camera's ON AIR tally). Everything is in frame space (a along the model, b across, z up) so the same
 * model lies landscape or portrait and fills the play area.
 */
export const RED='#e4322b';
export const PENT_INK='#232325',HEX_PAPER='#f7f7f3';

// ── 1. The studio stand ────────────────────────────────────────────────────────────────────────────────────────────────
type Studio={plate:FPlan;ball:{a:number;b:number};R:number;cupZ:number;camera:{a:number;b:number;dir:1|-1};trays:Record<PanelKind,{a:number;b:number}>;monitor:{a:number;b:number};lamp:{a:number;b:number};label:{a:number;b:number}};
const WIDE:Studio={plate:{a:-210,b:-140,w:420,d:280,r:12},ball:{a:-10,b:-6},R:74,cupZ:46,
 camera:{a:-165,b:46,dir:1},trays:{pent:{a:112,b:-38},hex:{a:112,b:50}},monitor:{a:120,b:-128},lamp:{a:-150,b:-100},label:{a:-184,b:94}};
/** Standing tall (a phone): the camera behind the ball, the trays at the near end under the thumb. */
const TALL:Studio={plate:{a:-230,b:-130,w:430,d:260,r:12},ball:{a:-6,b:0},R:74,cupZ:46,
 camera:{a:140,b:-56,dir:-1},trays:{pent:{a:-168,b:-56},hex:{a:-168,b:56}},monitor:{a:148,b:52},lamp:{a:30,b:-104},label:{a:-96,b:72}};
export const studioOf=(F:Frame)=>F.o==='wide'?WIDE:TALL;
export const studioPoints=(F:Frame)=>{const s=studioOf(F);return [...boxPts(s.plate,-20,0),[s.ball.a,s.ball.b,s.cupZ+s.R*1.9] as [number,number,number],[s.lamp.a,s.lamp.b,142] as [number,number,number],[s.camera.a,s.camera.b,130] as [number,number,number]];};
export const ballCentre=(F:Frame,P:k.Projection)=>{const S=studioOf(F);return {c:pt(F,S.ball.a,S.ball.b,S.cupZ+S.R*.86,P),r:S.R*kOf(P)};};

/** The static studio: base, turntable, lamp, camera on its tripod, the monitor desk. Trays and the ball are drawn live. */
export const StudioStatic=memo(function StudioStatic({F,P,tally}:{F:Frame;P:k.Projection;tally:boolean}){
 const s=studioOf(F),{a:ba,b:bb}=s.ball,top=0;
 const [bx,by]=at(F,ba,bb);
 const ticks=k.radialTicks(bx,by,58,72,6,16,[2.2,4.2],P);
 // Camera: a tripod (three legs, a column, a pan head), the body with seams, a lens hood toward the ball, a handle and the tally.
 const cam=s.camera,head=72;
 const legs=[0,2.1,4.2].map(t=>[cam.a+Math.cos(t)*30,cam.b+Math.sin(t)*30] as const);
 const body:FPlan={a:cam.a-27,b:cam.b-20,w:54,d:40,r:4},hood:FPlan={a:cam.dir>0?cam.a+27:cam.a-47,b:cam.b-12,w:20,d:24,r:2};
 // The lamp stand at the back (a post on a weighted foot, a dish head).
 const L=s.lamp;
 // The monitor desk at the back right.
 const M=s.monitor,desk:FPlan={a:M.a-36,b:M.b-4,w:84,d:52,r:3},mon:FPlan={a:M.a-26,b:M.b+4,w:62,d:36,r:4};
 const scr=(u:number,v:number)=>pt(F,mon.a+4+u*(mon.w-8),mon.b+mon.d,36+8+v*30,P);
 return <g data-studio="">
  <Base F={F} p={s.plate} P={P} z={-14} h={12}/>
  <LabelPlate F={F} a={s.label.a} b={s.label.b} w={46} d={20} z={top} P={P}/>
  {/* lamp */}
  <Solid paths={post(F,L.a,L.b,16,top,4,P,28,.6)} tone="mid"/>
  <Solid paths={post(F,L.a,L.b,3,top+4,112,P,16)} tone="mid" crease="none"/>
  <Line d={[38,76].map(z=>k.sideArc(...at(F,L.a,L.b),3,top+4+z,P,12)).join('')} tone="faint"/>
  <Solid paths={post(F,L.a,L.b,7,116,10,P,20)} tone="mid"/>
  <Solid paths={post(F,L.a,L.b,24,126,14,P,40,.8)} tone="hi"/>
  <Line d={k.knurl(...at(F,L.a,L.b),24,126,140,30,P)} tone="faint"/>
  {/* turntable: drum, knurled ring, ticked top, stand, cup */}
  <path className="iso-halo" d={post(F,ba,bb,56,top-2,4,P,48).fill}/>
  <Solid paths={post(F,ba,bb,54,top,12,P,56,1)} tone="mid" inner={<Line d={k.sideArc(bx,by,54,top+6,P,40)} tone="faint"/>}/>
  <Solid paths={post(F,ba,bb,60,12,4,P,64,.8)} tone="hi"/>
  <Line d={k.knurl(bx,by,60,12,16,90,P)} tone="faint"/>
  <Line d={ticks.minor} tone="lo"/><Line d={ticks.major} tone="mid"/>
  <Line d={k.ring(bx,by,44,16,P,48)} tone="faint"/>
  <Solid paths={post(F,ba,bb,10,16,24,P,24)} tone="mid" crease="none"/>
  <Solid paths={post(F,ba,bb,22,40,6,P,36,.6)} tone="hi"/>
  {/* monitor desk */}
  <Solid paths={slab(F,desk,top,30,P,4,.6)} tone="mid" inner={<Line d={k.ringSeam([...[[desk.a,desk.b],[desk.a+desk.w,desk.b],[desk.a+desk.w,desk.b+desk.d],[desk.a,desk.b+desk.d]].map(([a,b])=>at(F,a,b))],22,P)} tone="faint"/>}/>
  <Solid paths={slab(F,{a:mon.a+18,b:mon.b+8,w:26,d:20,r:2},30,6,P,3)} tone="mid"/>
  <Solid paths={slab(F,mon,36,46,P,6,1)} tone="hi"/>
  <path d={k.pathOf([scr(0,0),scr(1,0),scr(1,1),scr(0,1)],true)} fill="#3a3a3c" stroke="var(--anatomy-hi)" strokeWidth=".6" vectorEffect="non-scaling-stroke"/>
  <Line d={[.2,.4,.6,.8].map(v=>k.pathOf([scr(0,v),scr(1,v)])).join('')} tone="mid"/>
  <Dots points={[pt(F,mon.a+mon.w-6,mon.b+mon.d,40,P),pt(F,mon.a+mon.w-12,mon.b+mon.d,40,P)]} size={1.1} tone="hi"/>
  {/* camera on its tripod */}
  {legs.map(([a,b],i)=><g key={i}><Line d={seg(F,cam.a,cam.b,head-6,a,b,top,P)} tone="hi"/><Solid paths={post(F,a,b,3.2,top,2,P,12)} tone="mid"/></g>)}
  <Solid paths={post(F,cam.a,cam.b,4,32,head-32,P,16)} tone="mid" crease="none"/>
  <Solid paths={post(F,cam.a,cam.b,9,32,6,P,20)} tone="mid"/>
  <Solid paths={slab(F,{a:cam.a-12,b:cam.b-12,w:24,d:24,r:3},head,8,P,3,.5)} tone="mid"/>
  <Solid paths={slab(F,body,head+8,40,P,6,1.2)} tone="hi" inner={<Line d={k.ringSeam(k.roundedPlan({x:body.a,y:body.b,w:body.w,d:body.d,r:body.r},6).map(([a,b])=>at(F,a,b)),head+30,P)} tone="faint"/>}/>
  <Solid paths={slab(F,{a:body.a+10,b:body.b+12,w:30,d:16,r:6},head+48,6,P,6)} tone="mid"/>
  <Solid paths={slab(F,hood,head+14,26,P,3,.6)} tone="mid"/>
  <Solid paths={slab(F,{a:cam.dir>0?hood.a+hood.w:hood.a-4,b:hood.b+3,w:4,d:18,r:1},head+17,20,P,2)} tone="hi"/>
  {[0,1,2,3].map(i=><Line key={i} d={onTop(F,[[body.a+6+i*5,body.b+4],[body.a+6+i*5,body.b+body.d-4]],head+48,P)} tone="faint"/>)}
  {tally?<Tint paths={post(F,body.a+8,body.b+8,4,head+48,5,P,16)} color={RED}/>:<Solid paths={post(F,body.a+8,body.b+8,4,head+48,5,P,16)} tone="mid"/>}
 </g>;
});

/** A panel tray with its stack (up to six pieces drawn), as one tappable group. */
export function Tray({F,P,kind,left,hot}:{F:Frame;P:k.Projection;kind:PanelKind;left:number;hot:boolean}){
 const t=studioOf(F).trays[kind],plan:FPlan={a:t.a-38,b:t.b-38,w:76,d:76,r:6},[cx,cy]=at(F,t.a,t.b);
 const shape=(z:number)=>{const n=kind==='pent'?5:6,ring:k.Plane[]=Array.from({length:n},(_,i)=>{const ang=i/n*Math.PI*2+.3;return [cx+Math.cos(ang)*26,cy+Math.sin(ang)*26];});return k.extrude(ring,z,3.2,P);};
 const n=Math.min(6,left);
 return <g data-tray={kind}>
  <Solid paths={slab(F,plan,0,9,P,6,.8)} tone="mid"/>
  <Line d={k.onTop(k.roundedPlan({x:plan.a+5,y:plan.b+5,w:plan.w-10,d:plan.d-10,r:3},4).map(([a,b])=>at(F,a,b)),9,P,true)} tone={hot?'hi':'lo'}/>
  {Array.from({length:n},(_,i)=>kind==='pent'?<Tint key={i} paths={shape(9+i*3.4)} color={PENT_INK} edge="hi"/>:<Solid key={i} paths={shape(9+i*3.4)} tone="hi"/>)}
  <Dots points={[[plan.a+6,plan.b+6],[plan.a+plan.w-6,plan.b+6],[plan.a+6,plan.b+plan.d-6],[plan.a+plan.w-6,plan.b+plan.d-6]].map(([a,b])=>pt(F,a,b,9,P))} size={.6} tone="hi"/>
 </g>;
}
/** The hit area of a tray (its whole hull, stack included), for the pointer. */
export const trayHull=(F:Frame,P:k.Projection,kind:PanelKind)=>{const t=studioOf(F).trays[kind];return slab(F,{a:t.a-40,b:t.b-40,w:80,d:80,r:6},0,32,P,4).fill;};

/** The studio Telstar: 32 panels turned by q, the gap at the front rimmed in red. */
export function StudioBall({F,P,q,done,target,wrong}:{F:Frame;P:k.Projection;q:Quat;done:ReadonlySet<number>;target:number|null;wrong:boolean}){
 const {c,r}=ballCentre(F,P),list=ballPanels(q,c[0],c[1],r);
 return <g data-ball="">
  <circle cx={c[0]} cy={c[1]} r={r} fill="#e9e8e2"/>
  {list.map(p=>{const on=done.has(p.i),t=p.i===target,l=Math.max(0,p.light);
   const fill=!on?(t?(wrong?'#f1c9c5':'#f6dedb'):'#e2e1da'):p.kind==='pent'?mix('#18181a','#55555a',l*.8):mix('#d6d6cf','#ffffff',.25+l*.75);
   return <path key={p.i} d={p.d} fill={fill} stroke={!on?'#b9b8b2':'#77777a'} strokeWidth={.6} vectorEffect="non-scaling-stroke" strokeLinejoin="round" data-panel={p.kind} data-done={on||undefined}/>;})}
  {target!=null&&list.filter(p=>p.i===target&&p.z>0).map(p=><path key="t" d={p.d} fill="none" stroke={RED} strokeWidth={2.2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" data-gap-rim=""/>)}
  <circle cx={c[0]} cy={c[1]} r={r} fill="url(#ts-ballshade)" pointerEvents="none"/>
  <circle className="iso-line" data-tone="hi" cx={c[0]} cy={c[1]} r={r} fill="none"/>
 </g>;
}
export const BallShadeDefs=()=><defs><radialGradient id="ts-ballshade" cx=".34" cy=".3" r=".85"><stop offset="0" stopColor="#ffffff" stopOpacity=".28"/><stop offset=".5" stopColor="#ffffff" stopOpacity="0"/><stop offset="1" stopColor="#000000" stopOpacity=".22"/></radialGradient></defs>;
/** The piece under the finger while dragging (screen space): a flat pentagon or hexagon. */
export function Ghost({kind,x,y,r}:{kind:PanelKind;x:number;y:number;r:number}){
 return <g data-ghost={kind} style={{pointerEvents:'none'}}>
  <ellipse className="iso-halo" cx={x+6} cy={y+r*.9} rx={r*.9} ry={r*.3}/>
  <polygon points={polygon(PIECES[kind].sides,x,y,r)} fill={kind==='pent'?PENT_INK:HEX_PAPER} stroke="var(--anatomy-hi)" strokeWidth={1} vectorEffect="non-scaling-stroke"/>
 </g>;
}

// ── 2. On air: the table-top pitch ─────────────────────────────────────────────────────────────────────────────────────
export const M2W=30;// world units per metre
export const PITCH={turf:{a:-200,b:-138,w:400,d:276,r:4} as FPlan};
/** The base and the touchline camera: in front (b+) when the model lies wide, at the near end (a−) when it stands tall. */
export const pitchOf=(o:Frame['o'])=>o==='wide'?{plate:{a:-222,b:-156,w:444,d:342,r:12} as FPlan,rig:{a:0,b:164,da:0,db:-1}}:{plate:{a:-268,b:-156,w:490,d:312,r:12} as FPlan,rig:{a:-236,b:0,da:1,db:0}};
export const pitchPoints=(F:Frame)=>{const q=pitchOf(F.o);return [...boxPts(q.plate,-20,0),[q.rig.a,q.rig.b,70] as [number,number,number],[-180,-120,40] as [number,number,number]];};
/** Field metres → frame. */
export const fieldAt=(x:number,y:number):[number,number]=>[(x-6)*M2W,(y-4)*M2W];
export const GRASS_B='#557a3a';
const paint=(hex:string,pic:Picture)=>pic==='bw'?greyOf(hex):hex;

export const PitchStatic=memo(function PitchStatic({F,P,picture}:{F:Frame;P:k.Projection;picture:Picture}){
 const T=PITCH.turf,z=4;
 const stripes:ReactNode[]=[];
 for(let i=0;i<13;i++){const a0=T.a+i*T.w/13,a1=a0+T.w/13;if(i%2)stripes.push(<path key={i} d={onTop(F,[[a0,T.b],[a1,T.b],[a1,T.b+T.d],[a0,T.b+T.d]],z,P,true)} fill={paint(GRASS_B,picture)}/>);}
 const line=(pts:[number,number][],closed=false)=>onTop(F,pts,z,P,closed);
 const X=180,Y=120;
 const [cx,cy]=at(F,0,0);
 const goal=(s:1|-1)=>{const a=s*X;return <g key={s}>
  <Solid paths={post(F,a,-36,2.2,z,26,P,12)} tone="hi" crease="none"/><Solid paths={post(F,a,36,2.2,z,26,P,12)} tone="hi" crease="none"/>
  <Solid paths={slab(F,{a:a-2,b:-38,w:4,d:76,r:1},z+26,4,P,2)} tone="hi"/>
  <Line d={[-24,-12,0,12,24].map(b=>seg(F,a,b,z+28,a+s*14,b,z,P)).join('')} tone="faint"/>
  <Line d={seg(F,a+s*14,-36,z,a+s*14,36,z,P)} tone="lo"/>
 </g>;};
 const flags=[[-X,-Y],[X,-Y],[-X,Y],[X,Y]] as const;
 const Q=pitchOf(F.o),R=Q.rig,lens={a:R.a+R.da*20-9,b:R.b+R.db*20-9,w:18,d:18,r:2};
 return <g data-pitch="">
  <Base F={F} p={Q.plate} P={P} z={-14} h={12}/>
  <Tint paths={slab(F,T,-2,6,P,4,.6)} color={paint(GRASS,picture)} edge="hi"/>
  {stripes}
  <g className="ts-lines"><path d={[line([[-X,-Y],[X,-Y],[X,Y],[-X,Y]],true),line([[0,-Y],[0,Y]]),k.ring(cx,cy,2.4*M2W,z,P,48),
   line([[-X,-60],[-X+60,-60],[-X+60,60],[-X,60]]),line([[X,-60],[X-60,-60],[X-60,60],[X,60]])].join('')}/></g>
  <Dots points={[pt(F,0,0,z,P),pt(F,-X+44,0,z,P),pt(F,X-44,0,z,P)]} size={1.2} tone="hi"/>
  {goal(-1)}{goal(1)}
  {flags.map(([a,b],i)=><g key={i}><Solid paths={post(F,a,b,1.2,z,20,P,8)} tone="hi" crease="none"/><path d={k.pathOf([pt(F,a,b,z+20,P),pt(F,a+8,b,z+17,P),pt(F,a,b,z+14,P)],true)} fill="var(--anatomy-face)" className="iso-line" data-tone="hi"/></g>)}
  <LabelPlate F={F} a={Q.plate.a+30} b={Q.plate.b+Q.plate.d-30} w={44} d={18} z={-2} P={P}/>
  {/* The TV camera at the near touchline, looking at the pitch. */}
  <Solid paths={slab(F,{a:R.a-20,b:R.b-20,w:40,d:40,r:3},-2,10,P,3,.6)} tone="mid"/>
  <Solid paths={post(F,R.a,R.b,4,8,22,P,14)} tone="mid" crease="none"/>
  <Solid paths={slab(F,{a:R.a-15,b:R.b-15,w:30,d:30,r:3},30,22,P,4,.8)} tone="hi"/>
  <Solid paths={slab(F,lens,34,15,P,3)} tone="mid"/>
 </g>;
});
/** The tally lamp on the touchline camera: red while the ball is on air. */
export const Tally=({F,P,on}:{F:Frame;P:k.Projection;on:boolean})=>{const R=pitchOf(F.o).rig,p=post(F,R.a-R.da*7+R.db*6,R.b-R.db*7-R.da*6,3.4,52,4,P,14);
 return on?<Tint paths={p} color={RED}/>:<Solid paths={p} tone="mid"/>;};

/** Players and the ball at time t, back to front. */
export function PitchLive({F,P,m,t,ball,picture}:{F:Frame;P:k.Projection;m:Match;t:number;ball:BallKind;picture:Picture}){
 const kk=kOf(P),items:{d:number;el:ReactNode}[]=[];
 for(let p=0;p<PLAYERS;p++){const q=playerAt(m,p,t),[a,b]=fieldAt(q.x,q.y),bob=q.moving?Math.abs(Math.sin(t*9+p))*2:0,team=p%2===0;
  const body=post(F,a,b,7,bob,18,P,20),head=pt(F,a,b,bob+24,P);
  items.push({d:depth(F,a,b,0,P),el:<g key={'p'+p} data-player={p}>
   <ellipse className="iso-halo" cx={pt(F,a,b,4,P)[0]} cy={pt(F,a,b,4,P)[1]} rx={9*kk} ry={4.4*kk}/>
   {team?<Tint paths={body} color="#2e2e31"/>:<Solid paths={body} tone="hi"/>}
   <Sphere c={head} r={6*kk} color={team?'#3a3a3d':'#f2f2ee'}/>
  </g>});}
 const b=ballAt(m,t),[ba,bb]=fieldAt(b.x,b.y),r=6,zc=4+r+b.z*M2W*.7;
 const c=pt(F,ba,bb,zc,P),sh=pt(F,ba,bb,4.2,P);
 items.push({d:depth(F,ba,bb,0,P)+.5,el:<g key="ball" data-tv-ball={ball}>
  {ball==='leather'
   ?<Sphere c={c} r={r*kk} color={paint(LEATHER,picture)} edge={false} glint={false} shadow={{c:sh,rx:r*kk*.9,ry:r*kk*.4}}>
     <path d={`M${c[0]-r*kk*.7} ${c[1]-r*kk*.1}Q${c[0]} ${c[1]-r*kk*.6} ${c[0]+r*kk*.7} ${c[1]-r*kk*.1}`} fill="none" stroke={paint(LEATHER_SEAM,picture)} strokeWidth={1}/>
    </Sphere>
   :<TvTelstar c={c} r={r*kk} t={t} sh={sh}/>}
 </g>});
 return <>{items.sort((x,y)=>x.d-y.d).map(i=>i.el)}</>;
}
/** The Telstar on the TV pitch: white with black pentagons, rolling. */
function TvTelstar({c,r,t,sh}:{c:k.Flat;r:number;t:number;sh:k.Flat}){
 const q=compose(axisQ([1,.3,0],t*4.2),axisQ([0,1,0],.4)),list=ballPanels(q,c[0],c[1],r);void rotate;
 return <g>
  <ellipse className="iso-halo" cx={sh[0]} cy={sh[1]} rx={r*.9} ry={r*.4}/>
  <circle cx={c[0]} cy={c[1]} r={r} fill="#f7f7f3"/>
  {list.filter(p=>p.kind==='pent').map(p=><path key={p.i} d={p.d} fill="#161618"/>)}
  <circle cx={c[0]} cy={c[1]} r={r} fill="url(#ts-ballshade)"/>
  <circle cx={c[0]} cy={c[1]} r={r} fill="none" stroke="#161618" strokeWidth={.8}/>
 </g>;
}
/** The ball's screen point at time t (for scoring). */
export const ballScreen=(F:Frame,P:k.Projection,m:Match,t:number)=>{const b=ballAt(m,t),[a,bb]=fieldAt(b.x,b.y);return pt(F,a,bb,4+6+b.z*M2W*.7,P);};
export const ballPx=(P:k.Projection)=>6*kOf(P);
export const ringAround=ringTop;
