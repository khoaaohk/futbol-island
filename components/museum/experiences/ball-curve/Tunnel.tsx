'use client';
import {memo,useMemo} from 'react';
import {cylinder,depthOf,extrude,insetPlan,iso,lineOnTop,pathOf,planOutline,ring,segment,sideArc,sideRing,sideSeam,slabOf,topMatrix,type Flat,type Point3,type Projection} from '../anatomy/iso-kit';
import {FaceText} from '../anatomy/draw';
import {Line,Screw,Solid,basePlate,dialGauge,fit,labelPlate,needleD,painted,type Item} from '../anatomy/paper-kit';
import {Hit,Knob,Spring,kScale,type KnobSpec} from '../free-kick-wall/rig-parts';
import {SPIN_MAX,WEIGHT,circulation,magnus,smokeLines,spinRateOf,windOf} from './physics';
import {BigBall,FlatArrow} from './parts';

/**
 * ball-curve · Fig. 1, THE WIND TUNNEL (Oct 14 2026 redo; user: "turn knobs and things to make it do something"). A Magnus
 * demonstrator on a bench: a clear tunnel on two plinths with a dark floor (so the smoke shows), a fan in a housing at the inlet
 * (its CRANK on top sets the wind), a smoke rake of nine nozzles, the ball on a spindle on a sprung carriage that slides across
 * the tunnel (the push moves it, the springs hold it), the SPIN knob on the control box, a dial gauge that reads the push. The
 * smoke lines are streamlines from physics.ts: they split round the ball, crowd on the side whose surface moves with the air, and
 * leave thrown to the other side; the accent arrow is the push, the other way.
 * World: x along the tunnel (the air blows +x), y across, z up; the ball's centre is at (BX, carriage y, BZ).
 */
export const T={x0:0,x1:220,y0:-36,y1:36,floor:14,top:72},BX=112,BZ=T.floor+30,BR=12;
const HOUSE={x:-36,y:-44,w:36,d:88,r:3},PLATE={x:-46,y:-54,w:288,d:136,r:14},BOX={x:96,y:48,w:84,d:24,r:3};
export const CRANK:KnobSpec={x:-18,y:0,z:T.top+2,R:7,span:300};
export const SPINK:KnobSpec={x:116,y:60,z:12,R:7.6,span:270};
const GAUGE={x:158,y:60,z:12,R:9.2};
/** How far the push moves the carriage across the tunnel at the biggest push (world units). */
export const CARRIAGE_MAX=7;
export type TunnelView={fan:number;spin:number;phase:number;yaw:number;flow:number;active:string|null;showForce:boolean};
export function useTunnelProjection(w:number,h:number,top:number,bottom:number){
 return useMemo(()=>{if(!w||!h)return null;const wide=w/Math.max(1,h-top)>1.1;
  const pts:Point3[]=[[PLATE.x,PLATE.y,-16],[PLATE.x+PLATE.w,PLATE.y,-16],[PLATE.x,PLATE.y+PLATE.d,-16],[PLATE.x+PLATE.w,PLATE.y+PLATE.d,-16],[HOUSE.x,0,T.top+12],[T.x1,0,T.top+2]];
  return fit(pts,w,h,{pad:wide?20:-8,top,bottom,azimuth:wide?60:16,elevation:wide?34:40});},[w,h,top,bottom]);
}
/** The tunnel's numbers for a fan and spin setting: wind (m/s), spin (turns/s), push (N), the carriage's offset. */
export function tunnelState(fan:number,spin:number){
 const U=windOf(fan),n=spinRateOf(spin),F=magnus(U,n),Fmax=magnus(windOf(1),SPIN_MAX);
 return {U,n,F,g:circulation(U,n),shift:CARRIAGE_MAX*F/Fmax,ofWeight:F/WEIGHT};
}
const YS=[-30,-22,-15,-9,-3.5,3.5,9,15,22,30];

export function Tunnel({P,w,h,v}:{P:Projection;w:number;h:number;v:TunnelView}){
 const st=tunnelState(v.fan,v.spin),k=kScale(P),dy=st.shift,cDepth=depthOf([BX,dy,BZ],P);
 const items:Item[]=[];
 // the smoke: streamlines in the plane z = BZ, split into the part behind the ball and the part in front of it
 const lines=useMemo(()=>st.U<1?YS.map(y=>[[T.x0+16,y],[T.x0+16+6,y]] as [number,number][]):smokeLines({a:BR+1.2,U:st.U,g:st.g,x0:T.x0+16-BX,x1:T.x1-6-BX,ys:YS}).map(l=>l.map(([x,y])=>[x+BX,y+dy] as [number,number])),[st.U,st.g,dy]);
 const back:string[]=[],front:string[]=[];
 for(const l of lines){let run:Flat[]=[],isFront:boolean|null=null;
  for(const [x,y] of l){const f=depthOf([x,y,BZ],P)>cDepth;if(isFront!==null&&f!==isFront){run.push(iso([x,y,BZ],P));(isFront?front:back).push(pathOf(run));run=[];}isFront=f;run.push(iso([x,y,BZ],P));}
  if(run.length>1)(isFront?front:back).push(pathOf(run));}
 const smokeStyle={strokeDashoffset:-v.flow} as React.CSSProperties;
 items.push({k:cDepth-100,id:'smokeBack',n:<g data-smoke="back"><path d={back.join('')} className="bc-smoke-under"/><path d={back.join('')} className="bc-smoke" style={smokeStyle}/></g>});
 // the carriage, its springs, the spindle and the ball
 const cy=dy;
 items.push({k:cDepth-60,id:'carriage',n:<g data-carriage={dy.toFixed(2)}>
  <Spring a={[BX,T.y0+1,T.floor+3.2]} b={[BX,cy-6,T.floor+3.2]} r={1.8} turns={Math.max(4,(cy-6-T.y0)/3)} P={P}/>
  <Solid paths={slabOf({x:BX-7,y:cy-6,w:14,d:12,r:1.4},T.floor+1,4,P,3,.4)} tone="hi"/>
  <Solid paths={cylinder(BX,cy,4.4,T.floor+5,4,P,28,.4)} tone="mid" inner={<Line d={sideArc(BX,cy,4.4,T.floor+7,P,20)} tone="faint"/>}/>
  <Solid paths={cylinder(BX,cy,1.1,T.floor+9,BZ-BR-T.floor-8,P,14)} tone="hi"/>
 </g>});
 items.push({k:cDepth+60,id:'spring2',n:<Spring a={[BX,cy+6,T.floor+3.2]} b={[BX,T.y1-1,T.floor+3.2]} r={1.8} turns={Math.max(4,(T.y1-1-cy-6)/3)} P={P}/>});
 const yawNow=v.yaw;
 items.push({k:cDepth,id:'ball',n:<g data-tunnel-ball><BigBall c={[BX,cy,BZ]} r={BR} P={P} spin={{yaw:yawNow}} edge={v.active==='spin'?'lit':'hi'}/>
  {Math.abs(v.spin)>.02&&<SpinMarks P={P} c={[BX,cy,BZ]} r={BR} s={Math.sign(v.spin)}/>}</g>});
 items.push({k:cDepth+100,id:'smokeFront',n:<g data-smoke="front"><path d={front.join('')} className="bc-smoke-under"/><path d={front.join('')} className="bc-smoke" style={smokeStyle}/></g>});
 // the push: a flat accent arrow from the ball's side, as long as the push
 if(v.showForce&&Math.abs(st.F)>.05){const s=Math.sign(st.F),L=6+Math.abs(st.F)/magnus(30,SPIN_MAX)*26;
  items.push({k:depthOf([BX,cy+s*(BR+L/2),BZ],P)+(s>0?150:-150),id:'push',n:<g data-push={st.F.toFixed(2)}><FlatArrow a={[BX,cy+s*(BR+1.5)]} b={[BX,cy+s*(BR+1.5+L)]} z={BZ} w={3.4} P={P}/></g>});}

 // the fan blades turning in the duct face (x = 0), the crank on top of the housing, the spin knob, the push gauge
 const fanPts=(a:number,r0:number,r1:number,twist:number)=>[0,1,2,3,4,5,6,7].map(t=>{const u=t/7,rr=r0+(r1-r0)*u,aa=a+twist*u;return iso([T.x0+.6,Math.cos(aa)*rr,BZ+Math.sin(aa)*rr],P);});
 const blades:string[]=[];for(let i=0;i<5;i++){const a=v.phase+i*Math.PI*2/5,p1=fanPts(a,5,24,.5),p2=fanPts(a+.42,5,24,.5).reverse();blades.push(pathOf([...p1,...p2],true));}
 items.push({k:depthOf([T.x0,0,BZ],P)-300,id:'fan',n:<g data-fan={v.fan.toFixed(2)}><path d={blades.join('')} fill="var(--anatomy-paper)" stroke="var(--anatomy-hi)" strokeWidth={.8} vectorEffect="non-scaling-stroke"/>
  <path d={sideRing([T.x0+.8,0,BZ],5.2,'x',P,28)} fill="var(--anatomy-shade-1)" stroke="var(--anatomy-hi)" strokeWidth={.8} vectorEffect="non-scaling-stroke"/></g>});
 items.push({k:9e7,id:'crank',n:<CrankPart P={P} value={v.fan} active={v.active==='fan'}/>});
 items.push({k:9e7+1,id:'spinknob',n:<Knob k={SPINK} P={P} value={(v.spin+1)/2} steps={10} active={v.active==='spin'}/>});
 items.push({k:9e7+2,id:'gauge-needle',n:<path d={needleD(GAUGE.x,GAUGE.y,GAUGE.z+5,GAUGE.R,Math.abs(st.F)/(2*WEIGHT),P)} stroke="var(--accent)" strokeWidth={2.2} strokeLinecap="round" vectorEffect="non-scaling-stroke" data-gauge={st.F.toFixed(2)}/>});
 // the controls as sliders (focus + arrow keys); the crank's handle and the knob's cap are the targets
 const R=Math.max(22,9*k),hc=crankHandle(v.fan);
 const hits=[<Hit key="fan" id="fan" c={iso([hc[0],hc[1],CRANK.z+9],P)} r={R} label="Fan crank: turn it to blow the wind" value={v.fan} min={0} max={1} text={`${Math.round(st.U*3.6)} km/h wind`}/>,
  <Hit key="spin" id="spin" c={iso([SPINK.x,SPINK.y,SPINK.z+7.6],P)} r={R} label="Spin knob: spin the ball one way or the other" value={v.spin} min={-1} max={1} text={Math.abs(st.n)<.05?'not spinning':`${Math.abs(st.n).toFixed(1)} turns a second, the ${st.n>0?'near':'far'} side moving with the air`}/>];
 return <svg className="iso-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-hidden="true" focusable="false">
  <TunnelBack P={P}/>
  {painted(items)}
  <TunnelFront P={P}/>
  <g data-hits>{hits}</g>
 </svg>;
}
/** Two small accent arrows on the ball's equator, showing which way its surface moves on each side (the near side with +s). */
function SpinMarks({P,c,r,s}:{P:Projection;c:Point3;r:number;s:number}){
 // the near side (+y): its surface moves +x when s > 0, i.e. the angle round the ball falls
 const arc=()=>{const pts:Flat[]=[];for(let i=0;i<=10;i++){const a=Math.PI/2+.42*s-.84*s*i/10;pts.push(iso([c[0]+Math.cos(a)*r*1.12,c[1]+Math.sin(a)*r*1.12,c[2]],P));}return pts;};
 const head=(pts:Flat[])=>{const a=pts[pts.length-2],b=pts[pts.length-1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l;
  return pathOf([[b[0]-ux*7-uy*4,b[1]-uy*7+ux*4],b,[b[0]-ux*7+uy*4,b[1]-uy*7-ux*4]]);};
 const near=arc();
 return <g data-spin-marks={s}><path d={pathOf(near)} className="bc-spin"/><path d={head(near)} className="bc-spin"/></g>;
}
/** The crank's handle position for a fan setting (on top of the housing, turning round its hub). */
export function crankHandle(v:number):[number,number]{const span=(CRANK.span??300)*Math.PI/180,a=Math.PI-span/2+span*v;return [CRANK.x+Math.sin(a)*11,CRANK.y-Math.cos(a)*11];}
function CrankPart({P,value,active}:{P:Projection;value:number;active:boolean}){
 const z=CRANK.z,[hx,hy]=crankHandle(value),hub=iso([CRANK.x,CRANK.y,z+4.6],P),hd=iso([hx,hy,z+4.6],P),k=kScale(P);
 const ticks:string[]=[],span=(CRANK.span??300)*Math.PI/180;for(let i=0;i<=10;i++){const a=Math.PI-span/2+span*i/10,r0=12.6,r1=i%5===0?15.6:14.2;ticks.push(lineOnTop([CRANK.x+Math.sin(a)*r0,CRANK.y-Math.cos(a)*r0],[CRANK.x+Math.sin(a)*r1,CRANK.y-Math.cos(a)*r1],z,P));}
 return <g data-crank={value.toFixed(2)}>
  <Line d={ticks.join('')} tone="hi"/>
  {active&&<path d={ring(CRANK.x,CRANK.y,17,z,P,48)} fill="none" stroke="var(--accent)" strokeWidth={2} vectorEffect="non-scaling-stroke"/>}
  <Solid paths={cylinder(CRANK.x,CRANK.y,5,z,2.4,P,32,.4)} tone="mid"/>
  <path d={`M${hub[0]} ${hub[1]}L${hd[0]} ${hd[1]}`} stroke="var(--anatomy-hi)" strokeWidth={3.4*k+1.4} strokeLinecap="round"/>
  <path d={`M${hub[0]} ${hub[1]}L${hd[0]} ${hd[1]}`} stroke="var(--anatomy-shade-1)" strokeWidth={3.4*k} strokeLinecap="round"/>
  <Solid paths={cylinder(CRANK.x,CRANK.y,2.6,z+2.4,3.2,P,20,.3)} tone="hi"/>
  <Solid paths={cylinder(hx,hy,2.4,z+3,8,P,20,.4)} tone="hi" className="acc"/>
  <Solid paths={cylinder(hx,hy,2.9,z+11,1.4,P,20,.4)} tone="hi" lit/>
 </g>;
}

/** Everything behind the tunnel's contents: the bench, the plinths, the floor, the back glass, the fan housing, the rake, the box. */
const TunnelBack=memo(function TunnelBack({P}:{P:Projection}){
 const items=useMemo(()=>{const out:Item[]=[...basePlate('plate',PLATE,P,{h:10,feet:8,inset:22})],kz=(x:number,y:number,z:number)=>depthOf([x,y,z],P);
  // plinths and the dark floor with a grid (so the smoke reads)
  for(const x of [20,170])out.push({k:-5e6+x,id:'plinth'+x,n:<Solid paths={slabOf({x,y:-30,w:30,d:60,r:2},0,T.floor-3,P,4,.6)} tone="mid" inner={<Line d={sideSeam({x,y:-30,w:30,d:60,r:2},5,P,4)} tone="faint"/>}/>});
  const fl={x:T.x0,y:T.y0,w:T.x1-T.x0,d:T.y1-T.y0,r:1},grid:string[]=[];
  for(let x=T.x0+10;x<T.x1;x+=10)grid.push(lineOnTop([x,T.y0+1],[x,T.y1-1],T.floor,P));for(let y=T.y0+8;y<T.y1;y+=8)grid.push(lineOnTop([T.x0+1,y],[T.x1-1,y],T.floor,P));
  out.push({k:-4e6,id:'floor',n:<g><Solid paths={slabOf(fl,T.floor-3,3,P,3,.4)} tone="hi" className="dark"/><path d={grid.join('')} stroke="#6c6c6e" strokeWidth={.7} fill="none" vectorEffect="non-scaling-stroke"/></g>});
  // the cross rail the carriage runs on
  out.push({k:-3.9e6,id:'xrail',n:<Solid paths={slabOf({x:BX-2.2,y:T.y0,w:4.4,d:T.y1-T.y0,r:.8},T.floor,1.2,P,3)} tone="mid"/>});
  // the back glass (far side) and the far frame bars
  const pane=(y:number)=>pathOf([iso([T.x0,y,T.floor],P),iso([T.x1,y,T.floor],P),iso([T.x1,y,T.top],P),iso([T.x0,y,T.top],P)],true);
  out.push({k:-3.8e6,id:'backGlass',n:<g><path d={pane(T.y0)} className="bc-glass"/>
   {[T.x0,73,147,T.x1].map(x=><Solid key={x} paths={slabOf({x:x-1.4,y:T.y0-1.4,w:2.8,d:2.8,r:.4},T.floor,T.top-T.floor,P,2)} tone="mid"/>)}
   <Solid paths={slabOf({x:T.x0,y:T.y0-1.4,w:T.x1-T.x0,d:2.8,r:.4},T.top-2.4,2.4,P,2)} tone="mid"/></g>});
  // the fan housing: a box with a round duct and a grille, screws, the crank's scale on top
  const H=HOUSE,top=T.top+2;
  out.push({k:-3.7e6,id:'house',n:<g><Solid paths={slabOf(H,0,top,P,4,1)} tone="mid" inner={<Line d={sideSeam(H,top-10,P,4)} tone="faint"/>}>
   <Line d={planOutline(insetPlan(H,3),top,P,4)} tone="faint"/>
   {[[H.x+4,H.y+4],[H.x+H.w-4,H.y+4],[H.x+4,H.y+H.d-4],[H.x+H.w-4,H.y+H.d-4]].map(([x,y],i)=><Screw key={i} x={x} y={y} z={top} P={P} r={1.2}/>)}
   <FaceText transform={topMatrix([H.x+H.w-4,8],top,P,'y')} size={2.6} tone="mid">WIND</FaceText>
  </Solid>
   <path d={sideRing([T.x0+.2,0,BZ],27,'x',P,48)} fill="#3c3c3e" stroke="var(--anatomy-hi)" strokeWidth={.8} vectorEffect="non-scaling-stroke"/>
   <path d={sideRing([T.x0+.3,0,BZ],24,'x',P,48)} fill="none" stroke="#5c5c5e" strokeWidth={.8} vectorEffect="non-scaling-stroke"/></g>});
  // the smoke rake: a bar across the tunnel with nine nozzles, and the outlet's straightener grid
  const rx=T.x0+14,nz:string[]=[];for(const y of YS)nz.push(segment([rx,y,BZ],[rx+2.4,y,BZ],P));
  out.push({k:-3.6e6,id:'rake',n:<g><Solid paths={slabOf({x:rx-2,y:T.y0+1,w:2.6,d:T.y1-T.y0-2,r:.6},BZ-1.3,2.6,P,2)} tone="hi"/><Line d={nz.join('')} tone="hi"/>
   <Solid paths={cylinder(rx-.7,T.y0+6,1,T.floor,BZ-T.floor-1.3,P,12)} tone="mid"/></g>});
  const og:string[]=[];for(let y=T.y0+6;y<T.y1;y+=6)og.push(segment([T.x1,y,T.floor],[T.x1,y,T.top],P));for(let z=T.floor+6;z<T.top;z+=6)og.push(segment([T.x1,T.y0,z],[T.x1,T.y1,z],P));
  out.push({k:-3.5e6,id:'outlet',n:<g><path d={og.join('')} stroke="var(--anatomy-lo)" strokeWidth={.6} fill="none" vectorEffect="non-scaling-stroke"/></g>});
  // the control box on the near side: the spin knob's scale, the push gauge, a label plate, an engraved name
  out.push({k:kz(BOX.x,BOX.y,0)+5e6,id:'box',n:<Solid paths={slabOf(BOX,0,12,P,4,1)} tone="mid" inner={<Line d={sideSeam(BOX,5,P,4)} tone="faint"/>}>
   <Line d={planOutline(insetPlan(BOX,2.4),12,P,4)} tone="faint"/>
   <FaceText transform={topMatrix([BOX.x+3,BOX.y+BOX.d-3],12,P,'x')} size={2.4} tone="mid">SPIN</FaceText>
   <FaceText transform={topMatrix([GAUGE.x-6,BOX.y+BOX.d-3],12,P,'x')} size={2.4} tone="mid">PUSH</FaceText>
  </Solid>});
  out.push({...dialGauge('gauge',GAUGE.x,GAUGE.y,GAUGE.z,GAUGE.R,P),k:kz(BOX.x,BOX.y,0)+5e6+1});
  out.push(labelPlate('label',{x:BOX.x+4,y:BOX.y+3,w:16,d:8,r:1},12,P,kz(BOX.x,BOX.y,0)+5e6+2));
  return out;},[P]);
 return <g data-static="back">{painted(items)}</g>;
});
/** In front of everything inside: the near glass with two glints, the near frame bars and the top rail. */
const TunnelFront=memo(function TunnelFront({P}:{P:Projection}){
 const pane=pathOf([iso([T.x0,T.y1,T.floor],P),iso([T.x1,T.y1,T.floor],P),iso([T.x1,T.y1,T.top],P),iso([T.x0,T.y1,T.top],P)],true);
 const roof=pathOf([iso([T.x0,T.y0,T.top],P),iso([T.x1,T.y0,T.top],P),iso([T.x1,T.y1,T.top],P),iso([T.x0,T.y1,T.top],P)],true);
 const glint=(x:number)=>pathOf([iso([x,T.y1,T.floor+8],P),iso([x+22,T.y1,T.top-6],P)]);
 return <g data-static="front">
  <path d={roof} className="bc-glass" style={{opacity:.5}}/>
  <path d={pane} className="bc-glass"/>
  <path d={glint(36)+glint(46)+glint(170)} className="bc-glint"/>
  {[T.x0,T.x1].map(x=><Solid key={x} paths={slabOf({x:x-1.4,y:T.y1-1.4,w:2.8,d:2.8,r:.4},T.floor,T.top-T.floor,P,2)} tone="mid"/>)}
  <path d={pathOf([iso([T.x0,T.y1,T.top],P),iso([T.x1,T.y1,T.top],P)])} className="iso-line" data-tone="lo"/>
  <Solid paths={slabOf({x:T.x1-1.4,y:T.y0,w:2.8,d:T.y1-T.y0,r:.4},T.top-2.4,2.4,P,2)} tone="mid"/>
  <Solid paths={slabOf({x:T.x0,y:T.y1-1.4,w:T.x1-T.x0,d:2.8,r:.4},T.floor-1,2,P,2)} tone="mid"/>
 </g>;
});
