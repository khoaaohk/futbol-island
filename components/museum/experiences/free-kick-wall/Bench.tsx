'use client';
import {memo,useMemo} from 'react';
import {cylinder,depthOf,extrude,insetPlan,iso,lineOnTop,pathOf,planOutline,ring,segment,sideArc,sideSeam,slabOf,topMatrix,type Flat,type Plane,type Point3,type Projection} from '../anatomy/iso-kit';
import {FaceText} from '../anatomy/draw';
import {Ball,Line,Peg,Screw,Solid,basePlate,dialGauge,fit,goalFrame,labelPlate,needleD,painted,rulerStrip,shift,type Item} from '../anatomy/paper-kit';
import {APART,ATTACK_GAP,BAR,JUMP,LYING_BACK,POST,SPOT,WALL_MIN,aimX,attackerSpot,curveOf,kmh,wallGeom,type Controls,type PartId,type Pt,type V2,type Wall} from './model';
import {Hit,Knob,Post,Rod,Spring,kScale,type KnobSpec} from './rig-parts';

/**
 * free-kick-wall · THE FREE-KICK TEST BENCH (Oct 14 2026 redo; user: "make it possible to turn knobs and things to make it do
 * something", "like the stadiums: a breakdown of the layers"). One crafted instrument in the anatomy Paper theme:
 *  - a heavy base plate on feet with a green felt pitch to scale (10 world units = 1 m): mow stripes, the goal line, the 5.5 m
 *    and 16.5 m lines, the penalty mark and its arc (the arc is 9.15 m from the mark), a metre ruler along the near edge;
 *  - the goal to scale (7.32 × 2.44 m) with its net, and the keeper on a sprung carriage on a rail along the goal line;
 *  - the wall: table-football players on a carriage that runs on a rail marked in metres (9.15 m in the accent), a height staff
 *    beside it with a telltale that records how high the ball went past, the referee's foam line;
 *  - the kicking rig: a turntable (aim) under a gantry, a leg on a pivot pulled back by a coil spring, the ball on its spot;
 *  - the control desk: the POWER knob (winds the spring), the LIFT lever, the CONTACT pin on a printed ball (where the boot meets
 *    the ball: that is the spin), and a dial gauge for the ball speed.
 * Static parts are built once per projection (a memoised layer); the moving parts are re-built from the model on each change.
 */
export const M=10;
/** Pitch metres → world: X = metres out from the goal line, Y = metres to the kicker's LEFT (the kit's world is drawn mirrored). */
export const W=(x:number,y:number,z=0):Point3=>[y*M,-x*M,z*M];
const wv=(v:V2):Plane=>[v.y,-v.x];// a pitch direction → a world direction
const PLATE={x:-24,y:-64,w:330,d:128,r:14},FELT={x:-17,y:-57,w:268,d:114,r:6},DESK={x:256,y:-60,w:42,d:120,r:4},DESK_H=12;
const B=W(SPOT.x,SPOT.y);// the ball's spot (world)
const TT_R=19,TT_TOP=2.8,BALL_DRAW=1.8,LEG_L=25,PIVOT_Z=29;
export const CTL={
 gauge:{x:277,y:-42,z:DESK_H,R:11} as KnobSpec,
 power:{x:277,y:-17,z:DESK_H,R:8.4} as KnobSpec,
 lift:{x:277,y:8,z:DESK_H},
 contact:{x:277,y:36,z:DESK_H,R:11},
};
export const LIFT_ANG=35,LEVER_L=16;
/** The lever's tip for a lift (degrees 4–26): pulled back towards you = more lift. */
/** The lever swings across the view (along X on a wide card, along Y on a phone), so its lean always reads. */
export const leverAxis=(P:Projection)=>(P.azimuth??45)>30?'x':'y';
export const leverTip=(lift:number,ax:'x'|'y'):Point3=>{const f=(lift-4)/22,a=(-LIFT_ANG+2*LIFT_ANG*f)*Math.PI/180,o=Math.sin(a)*LEVER_L;
 return [CTL.lift.x+(ax==='x'?o:0),CTL.lift.y+(ax==='y'?o:0),CTL.lift.z+3+Math.cos(a)*LEVER_L];};
/** The contact pin: + = right of the ball's middle as the kicker sees it (world −Y). */
export const pinAt=(contact:number):Point3=>[CTL.contact.x,CTL.contact.y-contact*8,CTL.contact.z+1.4];
/** The rig's aim, as world directions: f towards the aim point, s to the kicker's right. */
export function rigFrame(aim:number){const ax=aimX(aim),l=Math.hypot(ax-SPOT.x,SPOT.y),u={x:(ax-SPOT.x)/l,y:-SPOT.y/l};
 return {f:wv(u),s:wv({x:-u.y,y:u.x})};}
export const ballRest=():Point3=>[B[0],B[1],TT_TOP+BALL_DRAW];

export type Mode='bench'|'apart';
const BENCH_PTS:Point3[]=[[PLATE.x,PLATE.y,-16],[PLATE.x+PLATE.w,PLATE.y,-16],[PLATE.x,PLATE.y+PLATE.d,-16],[PLATE.x+PLATE.w,PLATE.y+PLATE.d,-16],[0,-38,BAR*M+2],[0,38,BAR*M+2],[B[0],B[1],PIVOT_Z+4]];
export function useBenchProjection(w:number,h:number,top:number,bottom:number,mode:Mode,wall:Wall){
 return useMemo(()=>{if(!w||!h)return null;const wide=w/Math.max(1,h-top)>1.1;
  if(mode==='apart'){const g=wallGeom(wall),pts:Point3[]=[];
   for(const s of [-g.half-2.2,g.half+2.4])for(const u of [-2.4,1.9])for(const z of [0,2.6]){pts.push(W(g.c.x+g.side.x*s+g.u.x*u,g.c.y+g.side.y*s+g.u.y*u,z));}
   const right=wide?Math.min(330,w*.3):0,P=fit(pts,w-right,h,{pad:wide?40:14,top,bottom:bottom+(wide?0:70),azimuth:wide?58:24,elevation:wide?24:30});return P;}
  return fit(BENCH_PTS,w,h,{pad:wide?-6:-10,top,bottom,azimuth:wide?54:11,elevation:wide?38:42});},[w,h,top,bottom,mode,wall]);
}

export type BenchView={
 c:Controls;wall:Wall;leg:number;
 ball:{x:number;y:number;z:number;d:number}|null;
 trace:{pts:readonly Pt[];upto:number;preview:boolean}|null;
 keeper:{x:number;dive:number};jump:number;
 measure:{m:number;spray:number}|null;sprayed:boolean;
 telltale:number|null;apart:number;focus:PartId|null;active:string|null;mode:Mode;showLying:boolean;
 hot:readonly string[];
};

const FELT_C='#86b17f',STRIPE_C='#8fb988',RED='#c8372d',KEEPER='#e2b622';

export function Bench({P,w,h,v}:{P:Projection;w:number;h:number;v:BenchView}){
 const items:Item[]=[];
 const g=wallGeom(v.wall),k=kScale(P);
 const at=(x:number,y:number,z=0)=>iso(W(x,y,z),P),dk=(x:number,y:number,z=0)=>depthOf(W(x,y,z),P);
 const ap=v.mode==='apart'?v.apart:0,off=(id:PartId)=>({x:g.u.x*APART[id].u*ap+g.side.x*APART[id].s*ap,y:g.u.y*APART[id].u*ap+g.side.y*APART[id].s*ap,z:APART[id].z*ap});

 // ── The wall's rail (metres from the ball, 9.15 in the accent) and the carriage ──
 {const r0=4,r1=13.6,p0={x:SPOT.x+g.u.x*r0,y:SPOT.y+g.u.y*r0},p1={x:SPOT.x+g.u.x*r1,y:SPOT.y+g.u.y*r1},sd={x:g.side.x*.14,y:g.side.y*.14};
  const q=(p:V2,s:number):Plane=>{const a=W(p.x+sd.x*s,p.y+sd.y*s);return [a[0],a[1]];};
  const railRing=[q(p0,-1),q(p1,-1),q(p1,1),q(p0,1)];
  const ticks:string[]=[];for(let m=r0;m<=r1+1e-6;m+=1){const p={x:SPOT.x+g.u.x*m,y:SPOT.y+g.u.y*m},a=W(p.x-g.side.x*.14,p.y-g.side.y*.14,.07),b=W(p.x+g.side.x*.14,p.y+g.side.y*.14,.07);ticks.push(pathOf([iso(a,P),iso(b,P)]));}
  const mk={x:SPOT.x+g.u.x*WALL_MIN,y:SPOT.y+g.u.y*WALL_MIN};
  items.push({k:-5e6,id:'rail',n:<g data-rail><Solid paths={extrude(railRing,0,.7,P)} tone="mid" crease="none"/><Line d={ticks.join('')} tone="hi"/>
   <path d={pathOf([iso(W(mk.x-g.side.x*.2,mk.y-g.side.y*.2,.075),P),iso(W(mk.x+g.side.x*.2,mk.y+g.side.y*.2,.075),P)])} stroke="var(--accent)" strokeWidth={3} vectorEffect="non-scaling-stroke"/></g>});
 }
 // the foam line (sprayed at 9.15 m), drawn as far as the can has got
 const lineAt=(m:number,f:number)=>{const c={x:SPOT.x+g.u.x*m,y:SPOT.y+g.u.y*m},o=g.half+.7,e0={x:c.x+g.side.x*o,y:c.y+g.side.y*o},e1={x:c.x-g.side.x*(g.half+.5),y:c.y-g.side.y*(g.half+.5)},
  e={x:e0.x+(e1.x-e0.x)*f,y:e0.y+(e1.y-e0.y)*f},w2={x:g.u.x*.13,y:g.u.y*.13};
  return {e,d:pathOf([W(e0.x-w2.x,e0.y-w2.y,.01),W(e.x-w2.x,e.y-w2.y,.01),W(e.x+w2.x,e.y+w2.y,.01),W(e0.x+w2.x,e0.y+w2.y,.01)].map(p=>iso(p,P)),true)};};
 const spray=v.measure?v.measure.spray:v.sprayed?1:0;
 if(spray>0){const o=off('line'),L=lineAt(WALL_MIN+(o.x*g.u.x+o.y*g.u.y),spray);
  items.push({k:-4e6,id:'foam',n:<path d={L.d} fill="#ffffff" stroke="#b9b9b2" strokeWidth={.8} vectorEffect="non-scaling-stroke" data-foam={spray.toFixed(2)}/>});
  if(v.measure&&spray<1){const c=W(L.e.x,L.e.y);items.push({k:depthOf(c,P)+.3,id:'can',n:<g transform={shift(P,c)} data-spray-can>
   <Solid paths={cylinder(0,0,.9,0,2.6,P,20)} tone="hi" className="acc"/><Solid paths={cylinder(0,0,.5,2.6,.9,P,16)} tone="mid"/></g>});}
 }
 // the carriage under the wall, then the players (they rise when they jump; in the breakdown they jump and stay up)
 {const pad=.32,a={x:g.a.x-g.side.x*pad,y:g.a.y-g.side.y*pad},b={x:g.b.x+g.side.x*pad,y:g.b.y+g.side.y*pad},du={x:g.u.x*.11,y:g.u.y*.11};
  const ringW=[W(a.x-du.x,a.y-du.y),W(b.x-du.x,b.y-du.y),W(b.x+du.x,b.y+du.y),W(a.x+du.x,a.y+du.y)].map(p=>[p[0],p[1]] as Plane);
  items.push({k:dk(g.c.x,g.c.y)-30,id:'carriage',n:<g data-carriage={v.wall.dist.toFixed(2)}><Solid paths={extrude(ringW,.7,1.1,P)} tone="mid"/>
   {[a,b].map((p,i)=><circle key={i} cx={at(p.x,p.y,.18)[0]} cy={at(p.x,p.y,.18)[1]} r={.9} fill="var(--anatomy-dot)" opacity={.55}/>)}</g>});
  const lift=Math.max(v.jump,ap)*JUMP*M+1.8,band=v.hot.includes('wall')?'var(--accent)':RED;
  g.players.forEach((q,i)=>items.push({k:dk(q.x,q.y)+i*.01,id:'wp'+i,n:<g transform={shift(P,W(q.x,q.y))} data-wall-player={i}><Peg P={P} band={band} h={18} lift={lift}/></g>}));
 }
 // the player lying behind a jumping wall (the 2020s answer to the low shot)
 if(v.showLying){const o=off('lying'),c={x:g.c.x+g.u.x*LYING_BACK+o.x,y:g.c.y+g.u.y*LYING_BACK+o.y},sw=wv(g.side);
  items.push({k:dk(c.x,c.y)-1,id:'lying',n:<g transform={shift(P,W(c.x,c.y))} data-lying><Peg P={P} band={RED} h={18} lying={Math.atan2(sw[1],sw[0])}/></g>});}
 // the height staff beside the wall's inner end: ticks every 0.1 m, the telltale where the ball went past
 {const s={x:g.b.x+g.side.x*.75,y:g.b.y+g.side.y*.75},sw=wv(g.side),uw=wv(g.u),base=W(s.x,s.y);
  const face=(z:number,len:number)=>segment([base[0]-uw[0]*.6,base[1]-uw[1]*.6,z],[base[0]-uw[0]*.6+sw[0]*len,base[1]-uw[1]*.6+sw[1]*len,z],P);
  const tk:string[]=[],tm:string[]=[];for(let i=0;i<=26;i++)(i%5?tk:tm).push(face(1.4+i,i%5?.7:1.2));
  const plank=[[-.6,-.6],[.6,-.6],[.6,.6],[-.6,.6]].map(([a,b])=>[base[0]+uw[0]*a+sw[0]*b,base[1]+uw[1]*a+sw[1]*b] as Plane);
  items.push({k:depthOf(base,P),id:'staff',n:<g data-staff>
   <Solid paths={cylinder(base[0],base[1],2.4,0,1.4,P,24,.3)} tone="mid"/>
   <Solid paths={extrude(plank,1.4,27.4,P)} tone="hi"/>
   <Line d={tk.join('')} tone="lo"/><Line d={tm.join('')} tone="hi"/>
   <path d={face(1.4+BAR*M,1.2)} stroke={KEEPER} strokeWidth={2} vectorEffect="non-scaling-stroke"/>
   {v.telltale!=null&&<g data-telltale={v.telltale.toFixed(2)}><Solid paths={extrude(plank.map(([x,y])=>[base[0]+(x-base[0])*1.7,base[1]+(y-base[1])*1.7] as Plane),1.4+v.telltale*M-.7,1.4,P)} tone="hi" className="acc"/></g>}
  </g>});
 }
 // the attacker 1 m from the wall (the 2019 rule) and a 1 m rule between them: in the breakdown only
 if(v.mode==='apart'){const o=off('gap'),a0=attackerSpot(v.wall),a={x:a0.x+o.x,y:a0.y+o.y},e={x:g.b.x+o.x,y:g.b.y+o.y},fw={x:-g.u.x*.5,y:-g.u.y*.5};
  const r0=W(e.x+fw.x,e.y+fw.y,.02),r1=W(a.x+fw.x,a.y+fw.y,.02),uw=wv(g.u),w2=[uw[0]*.5,uw[1]*.5];
  const rul=[[r0[0]-w2[0],r0[1]-w2[1]],[r1[0]-w2[0],r1[1]-w2[1]],[r1[0]+w2[0],r1[1]+w2[1]],[r0[0]+w2[0],r0[1]+w2[1]]] as Plane[];
  const tk:string[]=[];for(let i=0;i<=10;i++){const t=i/10,x=r0[0]+(r1[0]-r0[0])*t,y=r0[1]+(r1[1]-r0[1])*t;tk.push(lineOnTop([x-w2[0],y-w2[1]],[x-w2[0]*(i%5?.2:-.2),y-w2[1]*(i%5?.2:-.2)],.7,P));}
  items.push({k:depthOf(r0,P)+2,id:'gapRule',n:<g data-gap-rule><Solid paths={extrude(rul,.1,.6,P)} tone="hi" className="acc"/><Line d={tk.join('')} tone="hi"/></g>});
  items.push({k:dk(a.x,a.y),id:'attacker',n:<g transform={shift(P,W(a.x,a.y))} data-attacker><Peg P={P} band="#2a5bd7" h={18}/></g>});
 }

 // ── The keeper on his sprung carriage ──
 {const kx=v.keeper.x+v.keeper.dive,Y=-kx*M,X=7;
  items.push({k:depthOf([X,0,0],P)-20,id:'krail',n:<g><Solid paths={slabOf({x:X-1.2,y:-35,w:2.4,d:70,r:.6},0,1.4,P,3)} tone="mid"/>
   {[-35,35].map(y=><Solid key={y} paths={slabOf({x:X-1.8,y:y-(y<0?0:2),w:3.6,d:2,r:.5},0,3.6,P,3)} tone="mid"/>)}</g>});
  items.push({k:depthOf([X,Y,0],P)-1,id:'ksprings',n:<g data-keeper-springs><Spring a={[X,-33,2.4]} b={[X,Y-3,2.4]} r={1.3} turns={Math.max(3,Math.abs(Y+33)/3.4)} P={P}/>
   <Spring a={[X,Y+3,2.4]} b={[X,33,2.4]} r={1.3} turns={Math.max(3,Math.abs(33-Y)/3.4)} P={P}/>
   <Solid paths={slabOf({x:X-2.6,y:Y-3,w:5.2,d:6,r:.8},1.4,2.2,P,3)} tone="hi"/></g>});
  const down=Math.abs(v.keeper.dive)>.7,lying=down?(v.keeper.dive<0?Math.PI/2:-Math.PI/2):null;
  items.push({k:depthOf([X,Y,0],P),id:'keeper',n:<g transform={shift(P,[X,Y,3.6])} data-keeper={kx.toFixed(2)}><Peg P={P} band={KEEPER} h={19} lying={lying}/></g>});
 }

 // ── The kicking rig: the turntable, the gantry, the leg, its spring ──
 {const {f,s}=rigFrame(v.c.aim),th=v.leg*Math.PI/180,piv:Point3=[B[0]-f[0]*3.2,B[1]-f[1]*3.2,PIVOT_Z];
  const dir:Point3=[-f[0]*Math.sin(th),-f[1]*Math.sin(th),-Math.cos(th)],boot:Point3=[piv[0]+dir[0]*LEG_L,piv[1]+dir[1]*LEG_L,piv[2]+dir[2]*LEG_L];
  const cs=-v.c.contact*1.3,bt:Point3=[boot[0]+s[0]*cs*-1,boot[1]+s[1]*cs*-1,boot[2]];
  const kB=depthOf([B[0],B[1],0],P);
  // turntable top (turns with the aim): pointer, screws
  const scr=[45,135,225,315].map(d=>{const a=d*Math.PI/180;return [B[0]+(f[0]*Math.cos(a)+s[0]*Math.sin(a))*13,B[1]+(f[1]*Math.cos(a)+s[1]*Math.sin(a))*13] as Plane;});
  items.push({k:kB-40,id:'ttop',n:<g data-turntable={v.c.aim.toFixed(1)}>
   <Solid paths={cylinder(B[0],B[1],16.4,1.5,TT_TOP-1.5,P,56,.5)} tone="hi" lit={v.active==='aim'}/>
   <path d={pathOf([iso([B[0]+f[0]*4,B[1]+f[1]*4,TT_TOP],P),iso([B[0]+f[0]*15.4,B[1]+f[1]*15.4,TT_TOP],P)])} stroke="var(--accent)" strokeWidth={2.4} strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
   {scr.map(([x,y],i)=><Screw key={i} x={x} y={y} z={TT_TOP} P={P} r={1.1}/>)}
   <Line d={ring(B[0],B[1],3.4,TT_TOP,P,24)} tone="lo"/></g>});
  // the back post (the spring's anchor) and the two gantry posts, a cross axle
  const anc:Point3=[B[0]-f[0]*13.5,B[1]-f[1]*13.5,0],post=(p:Point3,h2:number,id:string)=>({k:depthOf([p[0],p[1],h2/2],P),id,n:<Post x={p[0]} y={p[1]} z={TT_TOP} r={1.2} h={h2} P={P}/>});
  const pL:Point3=[piv[0]-s[0]*9,piv[1]-s[1]*9,0],pR:Point3=[piv[0]+s[0]*9,piv[1]+s[1]*9,0];
  items.push(post(anc,15,'anchor'),post(pL,PIVOT_Z+1.4-TT_TOP,'postL'),post(pR,PIVOT_Z+1.4-TT_TOP,'postR'));
  const cap=(p:Point3,id:string)=>({k:depthOf([p[0],p[1],PIVOT_Z],P)+.2,id,n:<Solid paths={cylinder(p[0],p[1],2,PIVOT_Z+.6,2.2,P,20,.4)} tone="mid"/>});
  items.push(cap(pL,'capL'),cap(pR,'capR'));
  const ax0=iso([pL[0],pL[1],PIVOT_Z+1.5],P),ax1=iso([pR[0],pR[1],PIVOT_Z+1.5],P);
  items.push({k:depthOf(piv,P)+.1,id:'axle',n:<Rod a={ax0} b={ax1} r={1*k}/>});
  // the leg: thigh to the knee block, shin, the boot (dark) whose side moves with the contact pin
  const knee:Point3=[piv[0]+dir[0]*LEG_L*.5,piv[1]+dir[1]*LEG_L*.5,piv[2]+dir[2]*LEG_L*.5];
  const sp0:Point3=[anc[0],anc[1],TT_TOP+14],sp1:Point3=[piv[0]+dir[0]*9,piv[1]+dir[1]*9,piv[2]+dir[2]*9];
  items.push({k:depthOf(knee,P)+1,id:'leg',n:<g data-leg={v.leg.toFixed(1)}>
   <Spring a={sp0} b={sp1} r={1.2} turns={7+v.leg/12} P={P} tone={v.active==='power'?'lit':'hi'}/>
   <Rod a={iso(piv,P)} b={iso(knee,P)} r={2.9*k}/>
   <Rod a={iso(knee,P)} b={iso(bt,P)} r={2.2*k}/>
   <Rod a={iso([bt[0]-dir[0]*5.5,bt[1]-dir[1]*5.5,bt[2]-dir[2]*5.5],P)} b={iso([bt[0]-dir[0]*2.6,bt[1]-dir[1]*2.6,bt[2]-dir[2]*2.6],P)} r={2.5*k} tint="#2a5bd7"/>
   <circle cx={iso(knee,P)[0]} cy={iso(knee,P)[1]} r={3.3*k} fill="var(--anatomy-paper)" className="iso-line" data-tone="hi"/><circle cx={iso(knee,P)[0]} cy={iso(knee,P)[1]} r={.9} fill="var(--anatomy-dot)"/>
   <Rod a={iso([bt[0]-f[0]*2.2,bt[1]-f[1]*2.2,bt[2]+.3],P)} b={iso([bt[0]+f[0]*3.2,bt[1]+f[1]*3.2,bt[2]-.5],P)} r={2.4*k} dark/>
   <Rod a={iso([bt[0]-f[0]*1.6,bt[1]-f[1]*1.6,bt[2]+1.4],P)} b={iso([bt[0]+f[0]*.6,bt[1]+f[1]*.6,bt[2]+1],P)} r={1.9*k} dark/>
   <circle cx={iso(piv,P)[0]} cy={iso(piv,P)[1]} r={2.4*k} fill="var(--anatomy-paper)" className="iso-line" data-tone="hi"/><circle cx={iso(piv,P)[0]} cy={iso(piv,P)[1]} r={.9} fill="var(--anatomy-dot)"/>
  </g>});
 }

 // ── The flight: the trace and its shadow on the felt (dashed while it is the preview) ──
 const vz=(p:{z:number;d:number})=>p.z*M+(TT_TOP+BALL_DRAW-1.1)*Math.max(0,1-p.d/3);
 if(v.trace&&v.trace.pts.length>1){const pts=v.trace.pts.slice(0,Math.max(2,v.trace.upto));
  items.push({k:-3e6,id:'shadow',n:<path d={pathOf(pts.map(q=>at(q.x,q.y,0)))} className="fk-shadow"/>});
  items.push({k:9e8,id:'trace',n:<path d={pathOf(pts.map(q=>iso([q.y*M,-q.x*M,vz(q)],P)))} className={v.trace.preview?'fk-preview':'fk-flight'} data-trace={v.trace.preview?'preview':'shot'}/>});}
 // ── The ball ──
 {const b=v.ball,p:Point3=b?[b.y*M,-b.x*M,vz(b)]:ballRest(),c=iso(p,P),gnd=iso([p[0],p[1],b?0:TT_TOP],P);
  items.push({k:b?depthOf(p,P)+.5:depthOf([B[0],B[1],0],P)+3,id:'ball',n:<g data-ball>
   <ellipse cx={gnd[0]} cy={gnd[1]} rx={BALL_DRAW*k*.9} ry={BALL_DRAW*k*.45} className="iso-halo" style={{filter:'blur(1.5px)',transform:'none',opacity:.32}}/>
   <Ball cx={c[0]} cy={c[1]} r={BALL_DRAW*k} edge="lit"/></g>});}

 // ── The measuring wheel and the referee, rolling out 9.15 m beside the wall ──
 if(v.measure){const m=v.measure.m,o=-(g.half+1.1),c={x:SPOT.x+g.u.x*m+g.side.x*o,y:SPOT.y+g.u.y*m+g.side.y*o},hub=W(c.x,c.y,.56),R=5.6,uw=wv(g.u);
  const rim:Flat[]=[],sp:string[]=[];for(let i=0;i<=36;i++){const a=i/36*Math.PI*2;rim.push(iso([hub[0]+uw[0]*Math.cos(a)*R,hub[1]+uw[1]*Math.cos(a)*R,hub[2]+Math.sin(a)*R],P));}
  const turn=m/.42;for(let i=0;i<6;i++){const a=turn+i*Math.PI/3;sp.push(pathOf([iso(hub,P),iso([hub[0]+uw[0]*Math.cos(a)*R*.92,hub[1]+uw[1]*Math.cos(a)*R*.92,hub[2]+Math.sin(a)*R*.92],P)]));}
  const ref={x:c.x-g.u.x*1.15,y:c.y-g.u.y*1.15},hand=W(ref.x+g.u.x*.25,ref.y+g.u.y*.25,1.05);
  items.push({k:depthOf(hub,P)+1,id:'wheel',n:<g data-wheel={m.toFixed(2)}>
   <path d={pathOf(rim,true)} fill="var(--anatomy-paper)" stroke="var(--anatomy-shade-0)" strokeWidth={3} vectorEffect="non-scaling-stroke"/>
   <path d={pathOf(rim,true)} fill="none" className="iso-line" data-tone="hi"/><Line d={sp.join('')} tone="mid"/>
   <Rod a={iso(hub,P)} b={iso(hand,P)} r={.55*k}/><circle cx={iso(hub,P)[0]} cy={iso(hub,P)[1]} r={1.1*k} fill="var(--accent)"/></g>});
  items.push({k:dk(ref.x,ref.y),id:'ref',n:<g transform={shift(P,W(ref.x,ref.y))} data-referee><Peg P={P} look="dark" band="#f7f7f3" h={17.5}/></g>});
 }

 // ── The control desk's moving parts ──
 {const pw=CTL.power,lv=CTL.lift,ct=CTL.contact;
  items.push({k:5e7,id:'power',n:<Knob k={pw} P={P} value={v.c.power} active={v.active==='power'}/>});
  // the lift lever: a boss, the bar, a ball knob
  const tip=leverTip(v.c.lift,leverAxis(P)),piv:Point3=[lv.x,lv.y,lv.z+3];
  items.push({k:5e7+1,id:'lever',n:<g data-lever={v.c.lift.toFixed(1)}>
   <Solid paths={cylinder(lv.x,lv.y,2.6,lv.z+1.6,2.4,P,20,.4)} tone="mid"/>
   <Rod a={iso(piv,P)} b={iso(tip,P)} r={1*k} lit={v.active==='lift'}/>
   <Ball cx={iso(tip,P)[0]} cy={iso(tip,P)[1]} r={2.8*k} seams={false} look={v.active==='lift'?'acc':'paper'} edge="hi"/></g>});
  // the contact pin on the printed ball
  const pin=pinAt(v.c.contact);
  items.push({k:5e7+2,id:'pin',n:<g data-pin={v.c.contact.toFixed(2)}>
   {v.active==='contact'&&<path d={ring(ct.x,ct.y,ct.R+3,ct.z+1.4,P,48)} fill="none" stroke="var(--accent)" strokeWidth={2} vectorEffect="non-scaling-stroke"/>}
   <Solid paths={cylinder(pin[0],pin[1],1.9,pin[2],4.4,P,20,.3)} tone="hi" className="acc"/>
   <Solid paths={cylinder(pin[0],pin[1],2.6,pin[2]+4.4,1.2,P,24,.3)} tone="hi" lit/></g>});
  // the speed gauge's needle (full turn = 120 km/h)
  const sp=kmh(16+14*v.c.power);
  items.push({k:5e7+3,id:'needle',n:<g data-speed={sp}><path d={needleD(CTL.gauge.x,CTL.gauge.y,CTL.gauge.z+5,CTL.gauge.R,sp/120,P)} stroke="var(--accent)" strokeWidth={2.2} strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
   <circle cx={iso([CTL.gauge.x,CTL.gauge.y,CTL.gauge.z+5.3],P)[0]} cy={iso([CTL.gauge.x,CTL.gauge.y,CTL.gauge.z+5.3],P)[1]} r={1.6} fill="var(--anatomy-hi)"/></g>});
 }

 // ── Hit targets: the controls are real sliders (focus + arrow keys); they sit on top of everything ──
 const hits:JSX.Element[]=[];
 if(v.mode==='bench'){
  const kc=(s:KnobSpec)=>iso([s.x,s.y,s.z+7.6],P),R=Math.max(22,10*k);
  hits.push(<Hit key="power" id="power" c={kc(CTL.power)} r={R} label="Power knob: winds the leg's spring" value={v.c.power} min={0} max={1} text={`${kmh(16+14*v.c.power)} km/h`}/>);
  hits.push(<Hit key="lift" id="lift" c={iso(leverTip(v.c.lift,leverAxis(P)),P)} r={R} label="Lift lever: how steeply the ball leaves the ground" value={v.c.lift} min={4} max={26} text={`${Math.round(v.c.lift)} degrees`}/>);
  hits.push(<Hit key="contact" id="contact" c={iso([CTL.contact.x,CTL.contact.y,CTL.contact.z+3],P)} r={Math.max(24,12*k)} label="Contact pin: where the boot meets the ball" value={v.c.contact} min={-1} max={1}
   text={Math.abs(v.c.contact)<.05?'the middle: no spin':`${Math.round(Math.abs(v.c.contact)*100)}% ${v.c.contact<0?'left':'right'} of the middle: it curves ${curveOf(v.c.contact)>0?'right':'left'}`}/>);
  const tt:Flat[]=[];for(let i=0;i<40;i++){const a=i/40*Math.PI*2;tt.push(iso([B[0]+Math.cos(a)*(TT_R+3),B[1]+Math.sin(a)*(TT_R+3),TT_TOP],P));}
  hits.push(<Hit key="aim" id="aim" d={pathOf(tt,true)} label="Turntable: aim the leg" value={v.c.aim} min={-24} max={20} text={`${Math.abs(Math.round(v.c.aim))} degrees ${v.c.aim<0?'left':v.c.aim>0?'right':'straight'}`}/>);
  if(v.hot.includes('wall')){const pts=[g.a,g.b].flatMap(p=>[at(p.x-g.u.x*.9,p.y-g.u.y*.9,0),at(p.x-g.u.x*.9,p.y-g.u.y*.9,2.1),at(p.x+g.u.x*.9,p.y+g.u.y*.9,2.1),at(p.x+g.u.x*.9,p.y+g.u.y*.9,0)]);
   hits.push(<Hit key="wall" id="wall" d={hull(pts)} label="The wall's carriage: slide it along its rail" value={v.wall.dist} min={4} max={13.6} text={`${v.wall.dist.toFixed(1)} metres from the ball`}/>);}
 }
 return <svg className="iso-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-hidden="true" focusable="false">
  <BenchStatic P={P} mode={v.mode}/>
  {painted(items)}
  <g data-hits>{hits}</g>
 </svg>;
}
/** The convex hull of screen points as a closed path (a hit target round a group of parts). */
function hull(pts:Flat[]){const s=[...pts].sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o:Flat,a:Flat,b:Flat)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lo:Flat[]=[],up:Flat[]=[];for(const p of s){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
 for(const p of [...s].reverse()){while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}
 return pathOf([...lo.slice(0,-1),...up.slice(0,-1)],true);}

/** The parts that never move, built once per projection. */
const BenchStatic=memo(function BenchStatic({P,mode}:{P:Projection;mode:Mode}){
 const items=useMemo(()=>staticItems(P,mode),[P,mode]);
 return <g data-static>{painted(items)}</g>;
});
function staticItems(P:Projection,mode:Mode):Item[]{
 const out:Item[]=[...basePlate('plate',PLATE,P,{h:10,feet:8,inset:22})];
 // the felt: a green inlay with mow stripes every 2 m
 const stripes:string[]=[];for(let y=0;y<25;y+=4){const x0=Math.max(FELT.x,y*M),x1=Math.min(FELT.x+FELT.w,(y+2)*M);if(x1>x0)stripes.push(planOutline({x:x0,y:FELT.y,w:x1-x0,d:FELT.d,r:0},.42,P,1));}
 out.push({k:-9e6,id:'felt',n:<g data-felt><Solid paths={slabOf(FELT,0,.4,P,4)} tone="mid" crease="none"/>
  <path d={slabOf(FELT,0,.4,P,4).top} fill={FELT_C}/><path d={stripes.join('')} fill={STRIPE_C}/>
  <Line d={planOutline(FELT,.4,P,4)} tone="mid"/></g>});
 // the pitch's white lines: goal line, 5.5 m, 16.5 m, the penalty mark and its arc (9.15 m from the mark)
 const L=(pts:[number,number][])=>pathOf(pts.map(([x,y])=>iso(W(x,y,.045),P)));
 const half=FELT.d/2/M-.15,arc:[number,number][]=[];for(let i=0;i<=40;i++){const a=Math.PI*.25+Math.PI*.5*i/40,x=Math.cos(a)*9.15,y=11+Math.sin(a)*9.15;if(y>=16.5&&Math.abs(x)<=half)arc.push([x,y]);}
 const marks=[L([[-half,0],[half,0]]),L([[-half,5.5],[half,5.5]]),L([[-half,16.5],[half,16.5]]),L(arc)];
 out.push({k:-8.9e6,id:'lines',n:<g data-lines><path d={marks.join('')} fill="none" stroke="#ffffff" strokeWidth={2.4} strokeLinejoin="round" vectorEffect="non-scaling-stroke" opacity={.95}/>
<path d={ring(110,0,.9,.045,P,16)} fill="#ffffff" stroke="none"/></g>});
 // the metre ruler along the near edge, a label plate on the desk front
 out.push(rulerStrip('ruler',-2,248,57.5,0,P,{d:5,step:M,every:5}));
 // the turntable's fixed ring with its degree scale
 const ticks:string[]=[],major:string[]=[];for(let d=-40;d<=40;d+=4){const a=Math.PI+d*Math.PI/180,big=d%20===0,r1=TT_R-.6,r0=r1-(big?2.4:1.3);
  (big?major:ticks).push(lineOnTop([B[0]+Math.cos(a)*r0,B[1]+Math.sin(a)*r0],[B[0]+Math.cos(a)*r1,B[1]+Math.sin(a)*r1],1.5,P));}
 out.push({k:depthOf([B[0],B[1],0],P)-60,id:'tbase',n:<g><Solid paths={cylinder(B[0],B[1],TT_R,0,1.5,P,64,.4)} tone="mid" inner={<Line d={sideArc(B[0],B[1],TT_R,.7,P,40)} tone="faint"/>}/>
  <Line d={ticks.join('')} tone="lo"/><Line d={major.join('')} tone="hi"/></g>});
 // the goal and the keeper's rail
 const gf=goalFrame('goal',0,-POST*M,POST*M,P,{gh:BAR*M,dm:16,era:'today',r:.8});out.push(...gf.back,...gf.front);
 // the control desk: a bevelled block, a seam, scales for the lever, the printed ball for the contact pin, the speed gauge
 const D=DESK,top=DESK_H,lv=CTL.lift,ct=CTL.contact;
 out.push({k:4e7,id:'desk',n:<Solid paths={slabOf(D,0,top,P,6,1.2)} tone="mid" inner={<Line d={sideSeam(D,top*.42,P,6)} tone="faint"/>}>
  <Line d={planOutline(insetPlan(D,3.4),top,P,6)} tone="faint"/>
  {[[D.x+4,D.y+4],[D.x+D.w-4,D.y+4],[D.x+4,D.y+D.d-4],[D.x+D.w-4,D.y+D.d-4]].map(([x,y],i)=><Screw key={i} x={x} y={y} z={top} P={P} r={1.3}/>)}
  {/* engraved names beside each control */}
  <FaceText transform={topMatrix([D.x+D.w-5.2,CTL.gauge.y+4],top,P,'y')} size={2.6} tone="mid">KM/H</FaceText>
  <FaceText transform={topMatrix([D.x+D.w-5.2,CTL.power.y+5],top,P,'y')} size={2.6} tone="mid">POWER</FaceText>
  <FaceText transform={topMatrix([D.x+D.w-5.2,lv.y+3.4],top,P,'y')} size={2.6} tone="mid">LIFT</FaceText>
  <FaceText transform={topMatrix([D.x+D.w-5.2,ct.y+6.6],top,P,'y')} size={2.6} tone="mid">CONTACT</FaceText>
 </Solid>});
 // the lever's quadrant: a slotted plate along X with ticks (the lever leans toward you for more lift)
 const ax=leverAxis(P),qd=ax==='x'?{x:lv.x-13,y:lv.y-2.4,w:26,d:4.8,r:1.2}:{x:lv.x-2.4,y:lv.y-13,w:4.8,d:26,r:1.2},qt:string[]=[];
 for(let i=0;i<=11;i++){const o=-11+i*2,l=i%5===0?1.6:.9;qt.push(ax==='x'?lineOnTop([lv.x+o,lv.y-2.4],[lv.x+o,lv.y-2.4+l],top+1.6,P):lineOnTop([lv.x-2.4,lv.y+o],[lv.x-2.4+l,lv.y+o],top+1.6,P));}
 const slot=ax==='x'?lineOnTop([lv.x-11,lv.y],[lv.x+11,lv.y],top+1.6,P):lineOnTop([lv.x,lv.y-11],[lv.x,lv.y+11],top+1.6,P);
 out.push({k:4e7+1,id:'quadrant',n:<Solid paths={slabOf(qd,top,1.6,P,3,.3)} tone="hi"><Line d={slot} tone="hi"/><Line d={qt.join('')} tone="lo"/></Solid>});
 // the printed ball: a disc, the ball's outline, a crosshair, a slot across it
 const ballLines=[ring(ct.x,ct.y,8.4,top+1.4,P,48),lineOnTop([ct.x-8.4,ct.y],[ct.x+8.4,ct.y],top+1.4,P),ring(ct.x,ct.y,2.4,top+1.4,P,20)].join('');
 out.push({k:4e7+2,id:'cdisc',n:<g><Solid paths={cylinder(ct.x,ct.y,ct.R,top,1.4,P,48,.4)} tone="hi" inner={<Line d={sideArc(ct.x,ct.y,ct.R,top+.7,P,30)} tone="faint"/>}/>
  <Line d={ballLines} tone="lo"/><path d={slabOf({x:ct.x-.8,y:ct.y-9,w:1.6,d:18,r:.8},top+1.4,.01,P,3).top} fill="var(--anatomy-shade-0)"/><Line d={planOutline({x:ct.x-.8,y:ct.y-9,w:1.6,d:18,r:.8},top+1.4,P,3)} tone="mid"/></g>});
 out.push({...dialGauge('gauge',CTL.gauge.x,CTL.gauge.y,top,CTL.gauge.R,P),k:4e7+3});
 out.push(labelPlate('label',{x:D.x+10,y:D.y+D.d-17,w:22,d:9,r:1},top,P,4e7+4));
 if(mode==='apart')return out;
 return out;
}

/** Where each part of the wall is on screen in the breakdown (the leader lines and number badges point here). */
export function partAnchors(P:Projection,wall:Wall,e:number):Record<PartId,Flat>{
 const g=wallGeom(wall),o=(id:PartId)=>({x:g.u.x*APART[id].u*e+g.side.x*APART[id].s*e,y:g.u.y*APART[id].u*e+g.side.y*APART[id].s*e});
 const lift=(e*JUMP*M+1.8)/M,mid=g.players[Math.floor(g.players.length/2)]??g.c,first=g.players[0]??g.c;
 const ln=o('line'),ly=o('lying'),gp=o('gap'),at0=attackerSpot(wall);
 const p=(x:number,y:number,z:number)=>iso(W(x,y,z),P);
 return {
  line:p(g.c.x+g.u.x*0+ln.x+g.side.x*(g.half+.3),g.c.y+ln.y+g.side.y*(g.half+.3),0),
  players:p(mid.x,mid.y,lift+1.95),
  jump:p(first.x-g.side.x*.05,first.y-g.side.y*.05,lift*.5),
  lying:p(g.c.x+g.u.x*LYING_BACK+ly.x-g.side.x*.6,g.c.y+g.u.y*LYING_BACK+ly.y-g.side.y*.6,.25),
  gap:p((g.b.x+at0.x)/2+gp.x-g.u.x*.5,(g.b.y+at0.y)/2+gp.y-g.u.y*.5,.06),
 };
}
export {ATTACK_GAP};
