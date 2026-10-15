'use client';
import {forwardRef,useImperativeHandle,useMemo,useReducer} from 'react';
import {cylinder,depthOf,iso,knurl,lineOnTop,onTop,pathOf,ring,segment,sideSeam,slabOf,topMatrix,
 type Flat,type Plan,type Point3,type Projection} from '../anatomy/iso-kit';
import {Tint} from '../anatomy/bench';
import {Items} from '../anatomy/PaperStage';
import {POSES,figureItems,joints,pxPerCm,byDepth,type Fig} from '../anatomy/figure';
import {Line,Screw,Solid,basePlate,dialGauge,fit,labelPlate,needleD,painted,scaleOf,type Item} from '../anatomy/paper-kit';
import {BOX,GOAL_W,HALF,SIX,SPOT,crankAngle,type Era} from './model';

/**
 * keeper-hands-1912 · THE GLOVE-ZONE GANTRY (Oct 14 2026 redo, anatomy Paper style). A half pitch inlaid in a heavy bench, drawn
 * to scale from Law 1 (1 m = 4 units, the goal line at the back, halfway at the front):
 *  - an XY GANTRY: two side rails on blocks, a leadscrew along the right one, a bridge (two end trucks, two uprights and a beam
 *    with its own leadscrew) and a carriage on the beam with a rod down to the keeper's clamp;
 *  - two CRANKS: the Y crank on the front of the right rail (turn it: the bridge runs out from the goal line) and the X crank on
 *    the beam's end (turn it: the carriage runs across). Each handle turns with its screw, so it always shows where the keeper is;
 *  - the LAW SWITCH at the front left: a bat-handle toggle between 1887 (hands anywhere in your own half) and 1912 (only in the
 *    penalty area), with a lamp for each;
 *  - the ALLOWED AREA lights up on the grass (an accent field with an LED edge), and the keeper's gloves open round the ball
 *    where the hands may work, or close into fists with the ball at the feet where they may not.
 */
export const M=4;
const PITCH={w:HALF.w*M,d:HALF.d*M};
/** The plate: deeper on a phone, where the distance gauge in front is bigger (the half pitch is wider than deep). */
const plateOf=(wide:boolean):Plan=>({x:-PITCH.w/2-48,y:-46,w:PITCH.w+96,d:PITCH.d+(wide?104:150),r:14});
export const gaugeOf=(wide:boolean)=>wide?{x:0,y:PITCH.d+52,R:22}:{x:0,y:PITCH.d+76,R:36};
const RAIL_X=PITCH.w/2+22,BEAM_Z=78,UP_H=BEAM_Z-12;
export const SWITCH={x:-PITCH.w/2+14,y:PITCH.d+30},YCRANK={x:RAIL_X,y:PITCH.d+40,z:15,r:10},XCRANK={dx:12,z:BEAM_Z+3,r:8};
const KEEPER_CM=48/180;// the keeper is 48 units tall (12 m on this pitch: bigger than life, so the hands read)
const W=(x:number)=>x*M,Y=(y:number)=>y*M;
/** The rod's magnet clamp hovers just over the keeper's head. */
const CLAMP_Z=4.1+(180+12)*KEEPER_CM+1.2;

export type BoardView={pos:[number,number];era:Era;ok:boolean;lamp:number;focus:string|null};
export type BoardApi={draw():void;proj():Projection|null;crankCentre(axis:'x'|'y'):Flat|null;keeperAt():Flat|null};
type Layout={az:number;el:number;wide:boolean};

export const Board=forwardRef<BoardApi,{w:number;h:number;view:{current:BoardView};top:number;bottom:number}>(function Board({w,h,view,top,bottom},ref){
 const [,bump]=useReducer((n:number)=>n+1,0);
 const L:Layout=w/Math.max(1,h)>1.1?{az:54,el:32,wide:true}:{az:78,el:52,wide:false};
 const P=useMemo(()=>{if(!w||!h)return null;const pts:Point3[]=[];
  const PLATE=plateOf(L.wide);for(const [x,y] of [[PLATE.x,PLATE.y],[PLATE.x+PLATE.w,PLATE.y],[PLATE.x,PLATE.y+PLATE.d],[PLATE.x+PLATE.w,PLATE.y+PLATE.d]])pts.push([x,y,-16],[x,y,0]);
  pts.push([-RAIL_X,0,BEAM_Z+8],[RAIL_X+20,0,BEAM_Z+8],[-RAIL_X,PITCH.d,BEAM_Z+8],[RAIL_X+20,PITCH.d,BEAM_Z+8]);
  return fit(pts,w,h,{pad:L.wide?16:4,top,bottom,azimuth:L.az,elevation:L.el});},[w,h,top,bottom,L.az,L.el,L.wide]);
 const stat=useMemo(()=>P?staticItems(P,L.wide):[],[P,L.wide]);
 useImperativeHandle(ref,()=>({draw:()=>bump(),proj:()=>P,
  crankCentre:(a)=>{if(!P)return null;const [,y]=view.current.pos;return a==='y'?iso([YCRANK.x,YCRANK.y,YCRANK.z],P):iso([RAIL_X+XCRANK.dx,Y(y),XCRANK.z],P);},
  keeperAt:()=>{if(!P)return null;const [x,y]=view.current.pos;return iso([W(x),Y(y),18],P);}}),[P]);// eslint-disable-line react-hooks/exhaustive-deps
 if(!P)return null;
 const v=view.current,items:Item[]=[...stat],[x,y]=v.pos;
 items.push(...zones(P,v.era));
 items.push(...gantry(P,x,y,v.focus));
 items.push(keeper(P,x,y,v.ok));
 items.push(...lawSwitch(P,v.era,v.lamp,v.focus==='switch'));
 items.push(gaugeLive(P,gaugeOf(L.wide),y,v.era));
 return <svg className="iso-svg" viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false" data-board>{painted(items)}</svg>;
});

// ── Small parts ─────────────────────────────────────────────────────────────────────────────────────────────────────────
export function Rod({a,b,r}:{a:Flat;b:Flat;r:number}){
 const d=`M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 return <g><path d={d} stroke="var(--anatomy-hi)" strokeWidth={r*2+1.4} strokeLinecap="round" fill="none"/><path d={d} stroke="var(--anatomy-shade-1)" strokeWidth={r*2} strokeLinecap="round" fill="none"/>
  <path d={`M${(a[0]-nx*r*.35).toFixed(1)} ${(a[1]-ny*r*.35).toFixed(1)}L${(b[0]-nx*r*.35).toFixed(1)} ${(b[1]-ny*r*.35).toFixed(1)}`} stroke="#fff" strokeWidth={r*.6} strokeLinecap="round" fill="none" opacity={.9}/></g>;
}
/** A leadscrew along an axis: a thin rod with thread marks every 2 units. */
function Screwshaft({P,a,b}:{P:Projection;a:Point3;b:Point3}){
 const s=scaleOf(P),n=Math.round(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])/2.2),marks:string[]=[];
 for(let i=1;i<n;i++){const f=i/n,p:Point3=[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];marks.push(segment([p[0],p[1],p[2]+1.1],[p[0]+(a[0]===b[0]?.7:0),p[1]+(a[1]===b[1]?.7:0),p[2]-1.1],P));}
 return <g><Rod a={iso(a,P)} b={iso(b,P)} r={1.1*s}/><Line d={marks.join('')} tone="lo"/></g>;
}
/** A crank: a wheel in the plane across `axis`, a spoke to the handle, a knob on the handle; `ang` is the handle's turn. */
export function Crank({P,c,r,axis,ang,focus,hit,label}:{P:Projection;c:Point3;r:number;axis:'x'|'y';ang:number;focus:boolean;hit:string;label:string}){
 const s=scaleOf(P),at=(rr:number,a:number,out=0):Point3=>axis==='y'?[c[0]+Math.sin(a)*rr,c[1]+out,c[2]+Math.cos(a)*rr]:[c[0]+out,c[1]+Math.sin(a)*rr,c[2]+Math.cos(a)*rr];
 const rim=Array.from({length:40},(_,i)=>iso(at(r,i/40*Math.PI*2),P)),rimIn=Array.from({length:40},(_,i)=>iso(at(r-2.2,i/40*Math.PI*2),P));
 const knob=iso(at(r-1.5,ang,4),P),hub=iso(c,P),grip=iso(at(r-1.5,ang),P);
 const spokes=[0,1,2].map(i=>pathOf([hub,iso(at(r-2,ang+i*Math.PI*2/3),P)]));
 return <g data-crank={hit}>
  <path d={pathOf(rim,true)} fill="var(--anatomy-shade-2)" stroke="var(--anatomy-hi)" strokeWidth={.8} vectorEffect="non-scaling-stroke"/>
  <path d={pathOf(rimIn,true)} fill="var(--anatomy-paper)" stroke="var(--anatomy-mid)" strokeWidth={.6} vectorEffect="non-scaling-stroke"/>
  {spokes.map((d,i)=><path key={i} d={d} stroke="var(--anatomy-hi)" strokeWidth={1.8*s} strokeLinecap="round"/>)}
  <circle cx={hub[0]} cy={hub[1]} r={2.4*s} fill="var(--anatomy-paper)" stroke="var(--anatomy-hi)" strokeWidth={.8} vectorEffect="non-scaling-stroke"/>
  <Rod a={grip} b={knob} r={1.3*s}/>
  <circle cx={knob[0]} cy={knob[1]} r={2.8*s} fill="var(--accent)" stroke="var(--acc-e)" strokeWidth={.8} vectorEffect="non-scaling-stroke"/>
  {focus&&<path d={pathOf(Array.from({length:40},(_,i)=>iso(at(r+3.5,i/40*Math.PI*2),P)),true)} fill="none" stroke="var(--accent)" strokeWidth={1.6} vectorEffect="non-scaling-stroke"/>}
  <circle className="iso-hit" cx={hub[0]} cy={hub[1]} r={Math.max(26,(r+4)*s)} data-hit={hit} tabIndex={0} role="slider" aria-label={label}/>
 </g>;
}

// ── Static: plate, grass with the Law 1 lines, rails, goal, label plate ──────────────────────────────────────────────────
function staticItems(P:Projection,wide:boolean):Item[]{
 const out:Item[]=[...basePlate('plate',plateOf(wide),P,{h:10,feet:7,inset:22})],K=-5e6;
 const grass='#cfe0c3',stripe='#c3d8b6',hw=PITCH.w/2,stripes:string[]=[];
 for(let yy=0,i=0;yy<PITCH.d;yy+=PITCH.d/8,i++)if(i%2)stripes.push(onTop([[-hw+1,yy],[hw-1,yy],[hw-1,Math.min(PITCH.d,yy+PITCH.d/8)],[-hw+1,Math.min(PITCH.d,yy+PITCH.d/8)]],1.6,P,true));
 const chalk=(d:string,wd=1.1)=><path d={d} fill="none" stroke="#fbfbf6" strokeWidth={wd} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>;
 const rect=(x0:number,y0:number,x1:number,y1:number)=>onTop([[x0,y0],[x0,y1],[x1,y1],[x1,y0]],1.6,P);
 const arc=(cx:number,cy:number,r:number,a0:number,a1:number)=>onTop(Array.from({length:25},(_,i)=>{const a=a0+(a1-a0)*i/24;return [cx+Math.cos(a)*r,cy+Math.sin(a)*r] as [number,number];}),1.6,P);
 const dArc=Math.acos((BOX.d-SPOT)/9.15);
 out.push({k:K,id:'grass',n:<g>
  <Tint paths={slabOf({x:-hw-6,y:-6,w:PITCH.w+12,d:PITCH.d+12,r:2},0,1.6,P,3)} color={grass} edge="mid"/>
  {stripes.map((d,i)=><path key={i} d={d} fill={stripe}/>)}
  {chalk(onTop([[-hw,0],[hw,0],[hw,PITCH.d],[-hw,PITCH.d]],1.6,P,true),1.3)}
  {chalk(rect(-W(BOX.hw),0,W(BOX.hw),Y(BOX.d)))}{chalk(rect(-W(SIX.hw),0,W(SIX.hw),Y(SIX.d)))}
  {chalk(arc(0,Y(SPOT),W(9.15),Math.PI/2-dArc,Math.PI/2+dArc))}
  {chalk(arc(0,PITCH.d,W(9.15),Math.PI,Math.PI*2),1.1)}
  <circle cx={iso([0,Y(SPOT),1.6],P)[0]} cy={iso([0,Y(SPOT),1.6],P)[1]} r={1.4} fill="#fbfbf6"/>
  <circle cx={iso([0,PITCH.d,1.6],P)[0]} cy={iso([0,PITCH.d,1.6],P)[1]} r={1.4} fill="#fbfbf6"/>
 </g>});
 // The rails: blocks, a rail on top, the right one with its leadscrew; end stops.
 for(const sx of [-1,1]){const x=sx*RAIL_X,r:Plan={x:x-4,y:-30,w:8,d:PITCH.d+56,r:1.5};
  out.push({k:K+1+sx,id:'rail'+sx,n:<g>
   {[-24,PITCH.d*.33,PITCH.d*.66,PITCH.d+18].map(yy=><Solid key={yy} paths={slabOf({x:x-7,y:yy-5,w:14,d:10,r:1.5},0,5,P,3,.4)} tone="mid"><Screw x={x-4} y={yy} z={5} P={P} r={.9}/><Screw x={x+4} y={yy} z={5} P={P} r={.9}/></Solid>)}
   <Solid paths={slabOf(r,5,4,P,3,.5)} tone="mid" inner={<Line d={sideSeam(r,7,P,3)} tone="faint"/>}><Line d={lineOnTop([x,-28],[x,PITCH.d+24],9,P)} tone="faint"/></Solid>
   {[-36,PITCH.d+26].map(yy=><Solid key={yy} paths={slabOf({x:x-6,y:yy,w:12,d:6,r:1.2},5,9,P,3,.4)} tone="mid"/>)}
  </g>});}
 out.push({k:K+3,id:'screwY',n:<Screwshaft P={P} a={[RAIL_X+9,-30,12]} b={[RAIL_X+9,PITCH.d+34,12]}/>});
 // The Y crank's bearing block (the crank itself turns, so it is drawn live).
 out.push({k:depthOf([YCRANK.x,YCRANK.y-6,0],P),id:'ybear',n:<Solid paths={slabOf({x:YCRANK.x+3,y:YCRANK.y-12,w:12,d:8,r:1.5},0,YCRANK.z+4,P,3,.5)} tone="mid" inner={<Line d={sideSeam({x:YCRANK.x+3,y:YCRANK.y-12,w:12,d:8,r:1.5},6,P,3)} tone="faint"/>}/>});
 // The goal, behind the goal line.
 const gw=W(GOAL_W/2),gh=W(2.44)*1.6,dm=12,net:string[]=[];
 for(let x=-gw;x<=gw+1e-6;x+=gw/6)net.push(segment([x,-dm,0],[x,-dm,gh*.8],P),segment([x,-dm,gh*.8],[x,0,gh],P));
 for(let z=0;z<=gh*.8+1e-6;z+=gh*.8/5)net.push(segment([-gw,-dm,z],[gw,-dm,z],P));
 for(const x of [-gw,gw])for(let i=0;i<=4;i++){const f=i/4;net.push(segment([x,-dm*f,0],[x,-dm*f,gh-gh*.2*f],P));}
 out.push({k:depthOf([0,-dm,0],P),id:'net',n:<Line d={net.join('')} tone="faint"/>});
 for(const x of [-gw,gw])out.push({k:depthOf([x,0,gh/2],P),id:'post'+x,n:<Solid paths={cylinder(x,0,1.2,1.6,gh,P,14)} tone="hi"/>});
 out.push({k:depthOf([0,0,gh],P)+.5,id:'bar',n:<Solid paths={slabOf({x:-gw,y:-1.2,w:gw*2,d:2.4,r:1},gh,2.4,P,3)} tone="hi"/>});
 out.push(labelPlate('label',{x:62,y:PITCH.d+26,w:48,d:16,r:1.5},0,P,K+5));
 out.push(dialGauge('gauge',gaugeOf(wide).x,gaugeOf(wide).y,0,gaugeOf(wide).R,P));
 return out;
}

// ── The distance gauge: metres out from the goal line (a full turn is 60 m); the allowed band in the accent ─────────────────
function gaugeLive(P:Projection,G:{x:number;y:number;R:number},ky:number,era:Era):Item{
 const top=5,band=(m:number)=>onTop(Array.from({length:33},(_,i)=>{const a=i/32*m/60*Math.PI*2;return [G.x+Math.sin(a)*(G.R-6.5),G.y-Math.cos(a)*(G.R-6.5)] as [number,number];}),top+.2,P);
 const reach=era==='before'?HALF.d:BOX.d;
 return {k:depthOf([G.x,G.y,0],P)+1,id:'gaugeLive',n:<g data-gauge={Math.round(ky)}>
  <path d={band(reach)} fill="none" stroke="var(--accent)" strokeWidth={3.2} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={.85}/>
  <path d={needleD(G.x,G.y,top,G.R,ky/60,P)} stroke="var(--anatomy-lit)" strokeWidth={1.6} strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
  <path d={ring(G.x,G.y,2,top+.4,P,16)} fill="var(--anatomy-paper)" stroke="var(--anatomy-hi)" strokeWidth={.8} vectorEffect="non-scaling-stroke"/>
 </g>};
}

// ── The lit area: the whole half (before 1912) or the penalty area (from 1912) ───────────────────────────────────────────
function zones(P:Projection,era:Era):Item[]{
 const hw=PITCH.w/2,z=1.7,half=onTop([[-hw,0],[hw,0],[hw,PITCH.d],[-hw,PITCH.d]],z,P,true),box=onTop([[-W(BOX.hw),0],[W(BOX.hw),0],[W(BOX.hw),Y(BOX.d)],[-W(BOX.hw),Y(BOX.d)]],z,P,true);
 const zone=(id:string,d:string,on:boolean)=><g data-zone={id} data-on={on||undefined} style={{opacity:on?1:0,transition:'opacity .35s ease'}}>
  <path d={d} fill="var(--accent)" opacity={.24}/>
  <path d={d} fill="none" stroke="var(--accent)" strokeWidth={6} opacity={.18} strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
  <path d={d} fill="none" stroke="var(--accent)" strokeWidth={1.8} strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
 </g>;
 return [{k:-4e6,id:'zones',n:<g>{zone('half',half,era==='before')}{zone('box',box,era==='after')}</g>}];
}

// ── The gantry: trucks, uprights, beam, X screw, carriage, rod, the X crank ──────────────────────────────────────────────
function gantry(P:Projection,kx:number,ky:number,focus:string|null):Item[]{
 const out:Item[]=[],yb=Y(ky),xk=W(kx);
 for(const sx of [-1,1]){const x=sx*RAIL_X;
  out.push({k:depthOf([x,yb,UP_H/2],P),id:'up'+sx,n:<g>
   <Solid paths={slabOf({x:x-8,y:yb-11,w:16,d:22,r:2},9,6,P,4,.6)} tone="mid">{[[-5,-8],[5,-8],[-5,8],[5,8]].map(([a,b],i)=><Screw key={i} x={x+a} y={yb+b} z={15} P={P} r={.9}/>)}</Solid>
   <Solid paths={slabOf({x:x-3.2,y:yb-3.2,w:6.4,d:6.4,r:1},15,UP_H-3,P,3)} tone="hi" inner={<Line d={sideSeam({x:x-3.2,y:yb-3.2,w:6.4,d:6.4,r:1},30,P,3)} tone="faint"/>}/>
  </g>});}
 // The beam in segments across x (so the keeper and the carriage sort with it) and its leadscrew in front.
 const xs=[-RAIL_X-6,-100,-50,0,50,100,RAIL_X+6];
 for(let i=0;i<xs.length-1;i++){const a=xs[i],b=xs[i+1];
  out.push({k:depthOf([(a+b)/2,yb,BEAM_Z],P),id:'beam'+i,n:<g>
   <Solid paths={slabOf({x:a,y:yb-4,w:b-a,d:8,r:.5},BEAM_Z-3,7,P,2)} tone="hi"/>
   <Screwshaft P={P} a={[a+(i===0?8:0),yb+6,BEAM_Z+1]} b={[b-(i===xs.length-2?8:0),yb+6,BEAM_Z+1]}/>
  </g>});}
 // The carriage on the beam and the rod down to the keeper's clamp.
 const s=scaleOf(P);
 out.push({k:depthOf([xk,yb,BEAM_Z],P)+3,id:'carriage',n:<g data-carriage>
  <Rod a={iso([xk,yb,BEAM_Z-4],P)} b={iso([xk,yb,CLAMP_Z+2],P)} r={1.3*s}/>
  <Solid paths={cylinder(xk,yb,3.6,CLAMP_Z,2.4,P,20,.3)} tone="mid"/>
  <Solid paths={slabOf({x:xk-9,y:yb-8,w:18,d:16,r:2},BEAM_Z-6,12,P,4,.6)} tone="hi" lit inner={<Line d={sideSeam({x:xk-9,y:yb-8,w:18,d:16,r:2},BEAM_Z-1,P,4)} tone="faint"/>}>
   {[[-6,-5],[6,-5],[-6,5],[6,5]].map(([a,b],i)=><Screw key={i} x={xk+a} y={yb+b} z={BEAM_Z+6} P={P} r={.9}/>)}
  </Solid>
 </g>});
 // The X crank on the beam's right end, riding with the bridge.
 out.push({k:depthOf([RAIL_X+XCRANK.dx,yb,BEAM_Z],P)+2,id:'xcrank',n:<g>
  <Solid paths={slabOf({x:RAIL_X+3,y:yb-5,w:6,d:10,r:1},BEAM_Z-4,8,P,3,.4)} tone="mid"/>
  <Crank P={P} c={[RAIL_X+XCRANK.dx,yb,XCRANK.z]} r={XCRANK.r} axis="x" ang={crankAngle(kx)} focus={focus==='xcrank'} hit="xcrank" label="Across crank: turn it to move the keeper across the pitch"/>
 </g>});
 out.push({k:depthOf([YCRANK.x,YCRANK.y,YCRANK.z],P)+4,id:'ycrank',n:<Crank P={P} c={[YCRANK.x+9,YCRANK.y,YCRANK.z]} r={YCRANK.r} axis="y" ang={crankAngle(ky)} focus={focus==='ycrank'} hit="ycrank" label="Out crank: turn it to move the keeper out from the goal line"/>});
 return out;
}

// ── The keeper: a mannequin on a puck, gloves open round the ball or closed into fists ───────────────────────────────────
function keeper(P:Projection,kx:number,ky:number,ok:boolean):Item{
 const X=W(kx),Yk=Y(ky),o=iso([X,Yk,0],P),Pf:Projection={...P,scale:P.scale*KEEPER_CM,origin:o};
 const f:Fig={id:'gk',x:0,y:0,h:90,pose:ok?{...POSES.catch,shL:96,elL:36,shR:96,elR:36,abL:18,abR:18}:{...POSES.stand,shL:-4,elL:22,shR:4,elR:22,abL:16,abR:16},kit:'keeper'};
 const its=byDepth(figureItems(f,Pf)),j=joints(f),k=pxPerCm(Pf),hl=iso(j.handL,Pf),hr=iso(j.handR,Pf);
 const glove=(c:Flat,side:number)=>ok?<g data-glove="open">
   {[-1.05,-.45,.15,.75].map((a,i)=>{const ang=-Math.PI/2+a*side*.9,len=11*k;return <path key={i} d={`M${c[0]} ${c[1]}L${c[0]+Math.cos(ang)*len} ${c[1]+Math.sin(ang)*len}`} stroke="var(--acc-e)" strokeWidth={5.6*k+1.2} strokeLinecap="round"/>;})}
   {[-1.05,-.45,.15,.75].map((a,i)=>{const ang=-Math.PI/2+a*side*.9,len=11*k;return <path key={'f'+i} d={`M${c[0]} ${c[1]}L${c[0]+Math.cos(ang)*len} ${c[1]+Math.sin(ang)*len}`} stroke="var(--accent)" strokeWidth={5.6*k} strokeLinecap="round"/>;})}
   <circle cx={c[0]} cy={c[1]} r={8.4*k} fill="var(--accent)" stroke="var(--acc-e)" strokeWidth={.8} vectorEffect="non-scaling-stroke"/>
   <circle cx={c[0]-1.6*k} cy={c[1]-1.8*k} r={2.2*k} fill="#fff" opacity={.45}/>
  </g>:<g data-glove="fist"><circle cx={c[0]} cy={c[1]} r={5*k} fill="#6a6a64" stroke="var(--anatomy-hi)" strokeWidth={.8} vectorEffect="non-scaling-stroke"/>
   <path d={`M${c[0]-3*k} ${c[1]-1*k}L${c[0]+3*k} ${c[1]-1*k}`} stroke="#3a3a3c" strokeWidth={.8} vectorEffect="non-scaling-stroke"/></g>;
 const mid:Flat=[(hl[0]+hr[0])/2,(hl[1]+hr[1])/2-6*k],ballR=11*k*1.35,feet=iso([0,22,11*1.35],Pf);
 const ball=(c:Flat)=><g data-keeper-ball={ok?'held':'feet'}><circle cx={c[0]} cy={c[1]} r={ballR+.6} fill="var(--anatomy-hi)"/><circle cx={c[0]} cy={c[1]} r={ballR} fill="var(--anatomy-paper)"/>
  <circle cx={c[0]-ballR*.25} cy={c[1]-ballR*.3} r={ballR*.4} fill="#fff"/>{[0,2.1,4.2].map(a=><circle key={a} cx={c[0]+Math.cos(a+.6)*ballR*.5} cy={c[1]+Math.sin(a+.6)*ballR*.5} r={ballR*.2} fill="var(--anatomy-hi)" opacity={.7}/>)}</g>;
 const puck=cylinder(X,Yk,9,1.7,2.4,P,32,.4),shadow=cylinder(X,Yk,9.6,1.7,.1,P,24).fill;
 return {k:depthOf([X,Yk,14],P),id:'keeper',n:<g data-keeper data-ok={ok||undefined}>
  <path className="iso-halo" style={{opacity:.3,filter:'blur(3px)',transform:'none'}} d={shadow}/>
  <Solid paths={puck} tone="mid"/><Line d={ring(X,Yk,6,4.1,P,24)} tone="faint"/>
  <g transform={`translate(0 ${(-4.1*Math.cos((P.elevation??30)*Math.PI/180)*scaleOf(P)).toFixed(2)})`}>
   <Items items={its}/>
   {ok?<>{glove(hl,1)}{glove(hr,-1)}{ball(mid)}</>:<>{glove(hl,1)}{glove(hr,-1)}{ball(feet)}</>}
  </g>
 </g>};
}

// ── The Law switch: a plate, a bat-handle toggle, two lamps and their years ──────────────────────────────────────────────
function lawSwitch(P:Projection,era:Era,lamp:number,focus:boolean):Item[]{
 const S=SWITCH,s=scaleOf(P),pl:Plan={x:S.x-26,y:S.y-11,w:52,d:22,r:3},a=(-.55+lamp*1.1),tip:Point3=[S.x+Math.sin(a)*18,S.y,6+Math.cos(a)*18];
 const lampAt=(x:number,on:boolean)=>{const p=cylinder(x,S.y-3,3,4,1.6,P,20),c=iso([x,S.y-3,5.6],P);return <g data-lamp={on?'on':'off'}>
  {on&&<circle cx={c[0]} cy={c[1]} r={6*s} fill="var(--accent)" opacity={.22}/>}
  <path d={p.fill} fill={on?'var(--accent)':'#cfcfc8'} stroke="var(--anatomy-hi)" strokeWidth={.7} vectorEffect="non-scaling-stroke"/><path d={p.top} fill={on?'var(--acc-l)':'#e4e4de'}/></g>;};
 const text=(x:number,t:string,on:boolean)=><text transform={topMatrix([x,S.y+7.4],4,P,'x')} fontSize={5.4} className="iso-face-text" data-tone={on?'hi':'lo'} textAnchor="middle" style={{fontWeight:700}}>{t}</text>;
 const hub=iso([S.x,S.y,6],P);
 return [{k:depthOf([S.x,S.y,0],P),id:'switch',n:<g data-switch={era}>
  <path className="iso-halo" style={{opacity:.25}} d={slabOf(pl,0,4,P).fill}/>
  <Solid paths={slabOf(pl,0,4,P,4,.6)} tone="mid">{[[-22,-7],[22,-7],[-22,7],[22,7]].map(([x,y],i)=><Screw key={i} x={S.x+x} y={S.y+y} z={4} P={P} r={.9}/>)}</Solid>
  {lampAt(S.x-15,era==='before')}{lampAt(S.x+15,era==='after')}
  {text(S.x-15,'1887',era==='before')}{text(S.x+15,'1912',era==='after')}
  <Solid paths={cylinder(S.x,S.y,5,4,2.4,P,28,.4)} tone="mid" inner={<Line d={knurl(S.x,S.y,5,4,6.4,24,P,.3)} tone="faint"/>}/>
  <Rod a={hub} b={iso(tip,P)} r={1.4*s}/>
  <circle cx={iso(tip,P)[0]} cy={iso(tip,P)[1]} r={3.8*s} fill="var(--anatomy-paper)" stroke="var(--anatomy-hi)" strokeWidth={.8} vectorEffect="non-scaling-stroke"/>
  <circle cx={iso(tip,P)[0]-1.2*s} cy={iso(tip,P)[1]-1.4*s} r={1.3*s} fill="#fff"/>
  {focus&&<path d={planOutlineRound(pl,P)} fill="none" stroke="var(--accent)" strokeWidth={1.6} vectorEffect="non-scaling-stroke"/>}
  <circle className="iso-hit" cx={hub[0]} cy={hub[1]-6*s} r={Math.max(26,22*s)} data-hit="switch" tabIndex={0} role="switch" aria-checked={era==='after'}
   aria-label={`Law switch: ${era==='before'?'1887 rule, hands anywhere in your own half':'1912 rule, hands only in the penalty area'}`}/>
 </g>}];
}
const planOutlineRound=(pl:Plan,P:Projection)=>onTop([[pl.x-2,pl.y-2],[pl.x+pl.w+2,pl.y-2],[pl.x+pl.w+2,pl.y+pl.d+2],[pl.x-2,pl.y+pl.d+2]],4.2,P,true);
