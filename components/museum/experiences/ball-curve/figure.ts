import * as k from '../anatomy/iso-kit';
import {INK,boxOf,byDepth,clamp,innerAlpha,mix,norm3,prismSvg,spherePath,tones,type Box,type LabelAnchor,type V3} from '../anatomy/figure-kit';
import type {FigureSpec,FigureView} from '../anatomy/FigureStage';

/**
 * ball-curve · "Kick it" (museum-figures-3, figure kit v2). A spinning ball, a wall and a goal on a patch of turf (a teaching
 * model: the ball is drawn big so you can see the air). Drag it all the way round; "Show the air" (the kit's see-through) shows
 * the air flowing past the spinning ball, bent off to one side, and the sideways force arrow; Labels: Spin, Air flow, Force,
 * Curve path. "Kick it" plays three steps on the figure's own clock (no timers; the Paper loop sleeps at rest): kick with spin,
 * the air bends, the ball curves round the wall into the goal. "Curl left / right" mirrors the spin, the air and the curve.
 *
 * Truth first (content.ts FIGURE_SAY; the exhibit's sources): the spinning ball drags the air round and throws it off one side;
 * the air pushes the ball the other way (the Magnus effect); the ball curves the way its front turns; sidespin curves, backspin
 * lifts, topspin dips; Roberto Carlos, Brazil v France, 1997, outside of the left foot. No speeds or spin rates are claimed.
 * Parts: turf 4 + wall 3 × ≤ 6 + goal 3 × ≤ 6 + net 1 + ball 4 + spin 2 + air 4 + force 2 + path 1 + 4 labels × 7 ≈ 85 (≤ 120).
 */
export const STEPS=[{id:'kick',lit:['spin']},{id:'air',lit:['air','force']},{id:'curve',lit:['path','force']}] as const;
export type StepId=typeof STEPS[number]['id'];
export const STEP_S=1.6;
/** The ball's radius (a teaching model: big beside the goal, so the air shows). */
export const R=15;
const TURF_R=132,GX=104,GW=42,GH=46,WALL_X=-14,WALL_Y=[-22,0,22],WALL_R=9,WALL_H=46;
export const START:V3=[-112,0,R];
/** The curve in world terms: out round the wall, back into the goal (side +1 bends toward -y, -1 toward +y; the figure passes
 * -side so the curl you SEE from behind the ball matches the Curl left / right button). */
export function pathAt(t:number,side:number):V3{const u=1-t,cy=104*side,gy=-16*side;
 return [START[0]*u*u-8*t*u+(GX+12)*t*t,2*t*u*cy+t*t*gy,R+28*Math.sin(Math.PI*t)];}
/** The direction of flight at t (the path's tangent on the floor). */
export function headingAt(t:number,side:number):V3{const a=pathAt(Math.max(0,t-.01),side),b=pathAt(Math.min(1,t+.01),side);return norm3([b[0]-a[0],b[1]-a[1],0]);}
export const WALL=WALL_Y.map(y=>[WALL_X,y] as const);
export const POINTS:V3[]=[...Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return [Math.cos(a)*TURF_R,Math.sin(a)*TURF_R,-5] as V3;}),[0,0,WALL_H+6],[GX,GW,GH],[GX,-GW,GH]];
const TURF='#6e9c52',WALLC='#2a5bd7',POST='#f7f7f3',BALL='#f7f7f3',PANEL='#1d1d1b',AIR='#5aa9d6';
const f1=(n:number)=>n.toFixed(1);
const oct=(x:number,y:number,r:number,z:number):V3[]=>Array.from({length:8},(_,i)=>{const a=i*Math.PI/4+Math.PI/8;return [x+Math.cos(a)*r,y+Math.sin(a)*r,z] as V3;});
const bar=(a:V3,b:V3,r:number):[V3[],V3[]]=>{const d=norm3([b[0]-a[0],b[1]-a[1],b[2]-a[2]]),up:V3=Math.abs(d[2])>.9?[1,0,0]:[0,0,1];
 const s1=norm3([d[1]*up[2]-d[2]*up[1],d[2]*up[0]-d[0]*up[2],d[0]*up[1]-d[1]*up[0]]),s2:V3=[d[1]*s1[2]-d[2]*s1[1],d[2]*s1[0]-d[0]*s1[2],d[0]*s1[1]-d[1]*s1[0]];
 const ring=(p:V3)=>[[1,1],[-1,1],[-1,-1],[1,-1]].map(([i,j])=>[p[0]+(s1[0]*i+s2[0]*j)*r,p[1]+(s1[1]*i+s2[1]*j)*r,p[2]+(s1[2]*i+s2[2]*j)*r] as V3);return [ring(a),ring(b)];};
/** Three dark spots on the ball (unit directions round a centre), turned by the spin. */
const SPOTS:V3[]=[[0,1,0],[0,-.5,.866],[0,-.5,-.866]].map(c=>norm3([.35,c[1],c[2]]));
const spot=(c:V3,phi:number):V3[]=>{const out:V3[]=[],up:V3=Math.abs(c[2])>.9?[1,0,0]:[0,0,1],a=norm3([c[1]*up[2]-c[2]*up[1],c[2]*up[0]-c[0]*up[2],c[0]*up[1]-c[1]*up[0]]),b:V3=[c[1]*a[2]-c[2]*a[1],c[2]*a[0]-c[0]*a[2],c[0]*a[1]-c[1]*a[0]];
 for(let i=0;i<5;i++){const t=i*2*Math.PI/5,d=norm3([c[0]+.42*(a[0]*Math.cos(t)+b[0]*Math.sin(t)),c[1]+.42*(a[1]*Math.cos(t)+b[1]*Math.sin(t)),c[2]+.42*(a[2]*Math.cos(t)+b[2]*Math.sin(t))]);
  const cs=Math.cos(phi),sn=Math.sin(phi);out.push([d[0]*cs-d[1]*sn,d[0]*sn+d[1]*cs,d[2]]);}return out;};

export function makeCurveFigure(){
 /** side: +1 curls right, -1 left; phi: the ball's spin angle; u: how far along the curve (0 at the spot, 1 in the goal);
  *  air: the air bending (0…1); t: the sequence clock (-1 = still). */
 const st={side:1,phi:0,u:0,air:0,airTo:0,t:-1,step:-1,onStep:null as null|((i:number)=>void)};
 const aim=(i:number)=>{st.step=i;st.airTo=i>=1?1:0;st.onStep?.(i);};
 const draw=(v:FigureView)=>{const P=v.P,x=v.xray,ia=innerAlpha(x),on=(id:string)=>v.active.has(id),kk=k.cameraOf(P).k,sd=-st.side;// iso-kit's screen is the mirror of the world (R×U = -V), so a curl that looks right is -y
  const sp=(p:V3)=>k.iso(p,P),line=(pts:V3[],closed=false)=>k.pathOf(pts.map(sp),closed);
  let s=`<path class="iso-halo" d="${k.cylinder(0,0,TURF_R+4,-5,1,P,40).fill}"/>`;
  const turf=k.cylinder(0,0,TURF_R,-5,5,P,48,1),tt=tones(TURF);
  s+=`<path d="${turf.fill}" fill="${tt.m}"/><path d="${turf.top}" fill="${tt.l}"/><path d="${turf.outline}" fill="none" stroke="${INK}" stroke-width=".9"/>`;
  // The curve path (dashed; bold and lit once the ball flies).
  const path:V3[]=[];for(let i=0;i<=24;i++)path.push(pathAt(i/24,sd));
  const lit=on('path');s+=`<path data-part="path" d="${line(path)}" fill="none" stroke="${lit?'var(--accent)':INK}" stroke-width="${lit?2.4:1.2}" stroke-dasharray="6 5" opacity="${lit||st.step>=2?1:.55}"/>`;
  type It={box:Box;svg:string};const items:It[]=[];
  // The wall: three blue blocks standing where a defensive wall would.
  for(const [wx,wy] of WALL){const a=oct(wx,wy,WALL_R,0),b=oct(wx,wy,WALL_R*.85,WALL_H);items.push({box:boxOf(a,b),svg:prismSvg(a,b,WALLC,v,{attrs:' data-part="wall"'})});}
  // The goal: two posts and the crossbar, a light net behind.
  const net:V3[]=[[GX,-GW,0],[GX+22,-GW,0],[GX+22,-GW,GH*.8],[GX+22,GW,GH*.8],[GX+22,GW,0],[GX,GW,0]];
  s+=`<path data-net d="${line(net)}M${line([[GX+22,-GW,GH*.8],[GX,-GW,GH]]).slice(1)}M${line([[GX+22,GW,GH*.8],[GX,GW,GH]]).slice(1)}" fill="none" stroke="${INK}" stroke-width=".7" opacity=".55"/>`;
  for(const [a,b] of [[[GX,-GW,0],[GX,-GW,GH]],[[GX,GW,0],[GX,GW,GH]],[[GX,-GW,GH],[GX,GW,GH]]] as [V3,V3][]){const [r0,r1]=bar(a,b,2.2);items.push({box:boxOf(r0,r1),svg:prismSvg(r0,r1,POST,v,{attrs:' data-part="goal"'})});}
  // The ball: a white disc, three spots turned by the spin, a ring outline.
  const B=pathAt(st.u,sd),bc=sp(B),rad=R*kk*1.0;
  let ball=`<circle data-part="ball" cx="${f1(bc[0])}" cy="${f1(bc[1])}" r="${f1(rad)}" fill="${BALL}"/>`;
  let spots='';for(const c of SPOTS){const dirs=spot(c,st.phi);if(dirs.every(d=>d[0]*v.V[0]+d[1]*v.V[1]+d[2]*v.V[2]<0))continue;spots+=spherePath(dirs,bc,rad,v);}
  if(spots)ball+=`<path d="${spots}" fill="${PANEL}"/>`;
  ball+=`<circle cx="${f1(bc[0])}" cy="${f1(bc[1])}" r="${f1(rad)}" fill="none" stroke="${INK}" stroke-width="1"/>`;
  items.push({box:[[B[0]-R,B[1]-R,B[2]-R],[B[0]+R,B[1]+R,B[2]+R]],svg:ball});
  for(const it of byDepth(items,v.V))s+=it.svg;
  // The spin: an arrow round the ball's middle, turning the way the front turns (seen from above: clockwise curls right).
  const d=headingAt(st.u,sd),n:V3=[d[1],-d[0],0],turn=-sd,arc:V3[]=[];// n: the flight's right-hand side
  for(let i=0;i<=14;i++){const ang=turn*((i/14)*Math.PI*1.3-Math.PI*.65),r2=R*1.35;
   const vx=d[0]*Math.cos(ang)-d[1]*Math.sin(ang),vy=d[0]*Math.sin(ang)+d[1]*Math.cos(ang);arc.push([B[0]-vx*r2,B[1]-vy*r2,B[2]]);}
  const e1=arc[arc.length-1],e0=arc[arc.length-2],ed=norm3([e1[0]-e0[0],e1[1]-e0[1],0]),en:V3=[-ed[1],ed[0],0],hs=R*.45;
  const head:V3[]=[[e1[0]+ed[0]*hs,e1[1]+ed[1]*hs,e1[2]],[e1[0]+en[0]*hs*.6,e1[1]+en[1]*hs*.6,e1[2]],[e1[0]-en[0]*hs*.6,e1[1]-en[1]*hs*.6,e1[2]]];
  const spinLit=on('spin'),spinCol=spinLit?'var(--accent)':INK;
  s+=`<g data-part="spin"><path d="${line(arc)}" fill="none" stroke="${spinCol}" stroke-width="${spinLit?2.6:1.8}" stroke-linecap="round"/><path d="${line(head,true)}" fill="${spinCol}"/></g>`;
  // Show the air: streamlines flowing past the ball (in the ball's frame, from ahead to behind), thrown off to the -side, and
  // the force arrow pushing the ball the other way (+side). Bend grows with `air`.
  const air=Math.max(st.air,st.step>=1?st.air:0);
  if(x>0){const flowLit=on('air'),ac=flowLit?'var(--accent)':AIR;let fl='';
   for(const o of [-1.9,-1.05,1.05,1.9]){const pts:V3[]=[];
    for(let i=0;i<=16;i++){const along=3.4-i*(7.2/16),lat0=o,round=Math.max(0,1-Math.abs(along)/1.4)*(Math.sign(o)*(1.25-Math.min(1.25,Math.abs(o)))*1.2),
     wake=along<0?(-along)*.42*air*(-sd):0,bulge=air*.25*(-sd)*Math.max(0,1-Math.abs(along)/1.6);
     const lat=lat0+round+wake+bulge;pts.push([B[0]+d[0]*along*R+n[0]*lat*R,B[1]+d[1]*along*R+n[1]*lat*R,B[2]]);}
    fl+=line(pts);}
   s+=`<path data-part="air" d="${fl}" fill="none" stroke="${ac}" stroke-width="${flowLit?2.2:1.6}" stroke-linecap="round" stroke-dasharray="7 4" opacity="${(ia*(.55+.45*Math.max(air,.3))).toFixed(3)}"/>`;
   if(air>.05){const fLit=on('force'),fc=fLit?'var(--accent)':'#e4322b',len=R*(1.2+1.6*air),o:V3=[B[0]+n[0]*sd*R*1.05,B[1]+n[1]*sd*R*1.05,B[2]],tip:V3=[o[0]+n[0]*sd*len,o[1]+n[1]*sd*len,B[2]];
    const hw=R*.4,hb:V3=[tip[0]-n[0]*sd*hw*1.3,tip[1]-n[1]*sd*hw*1.3,B[2]];
    s+=`<g data-part="force" opacity="${ia.toFixed(3)}"><path d="${line([o,hb])}" stroke="${fc}" stroke-width="${f1(Math.max(3,kk*3.2))}" stroke-linecap="round"/><path d="${line([tip,[hb[0]+d[0]*hw,hb[1]+d[1]*hw,B[2]],[hb[0]-d[0]*hw,hb[1]-d[1]*hw,B[2]]],true)}" fill="${fc}"/></g>`;}}
  // Labels: Spin and Curve path always; Air flow and Force while the air is shown.
  const mid=pathAt(.5,sd);
  const labels:LabelAnchor[]=[{id:'spin',text:'Spin',at:[B[0],B[1],B[2]+R*1.05]},{id:'path',text:'Curve path',at:mid}];
  if(x>.5){labels.push({id:'air',text:'Air flow',at:[B[0]-d[0]*R*3.2+n[0]*(-1.05-.9*air*sd)*R*sd,B[1]-d[1]*R*3.2+n[1]*(-1.05-.9*air*sd)*R*sd,B[2]]});
   if(air>.05)labels.push({id:'force',text:'Force',at:[B[0]+n[0]*sd*R*(2.3+1.6*air),B[1]+n[1]*sd*R*(2.3+1.6*air),B[2]]});}
  const xs:number[]=[],ys:number[]=[];for(const p of POINTS){const q=sp(p);xs.push(q[0]);ys.push(q[1]);}
  return {svg:s,labels,obj:{l:Math.min(...xs),r:Math.max(...xs),t:Math.min(...ys),b:Math.max(...ys)}};};
 const spec:FigureSpec={id:'curve',points:POINTS,front:{yaw:200,pitch:32},pitch:[20,70],seeThrough:true,seeThroughLabel:'Show the air',labels:true,draw,
  tick:dt=>{let moving=false;
   if(st.t>=0){st.t+=dt;const i=Math.min(STEPS.length-1,Math.floor(st.t/STEP_S));if(i!==st.step)aim(i);
    st.phi+=dt*7*st.side;if(st.step>=2)st.u=clamp((st.t-2*STEP_S)/(STEP_S*.9),0,1);
    if(st.t>=STEPS.length*STEP_S){st.t=-1;st.u=1;}else moving=true;}
   const da=st.airTo-st.air;if(Math.abs(da)>1e-3){st.air+=da*(1-Math.exp(-dt/.25));moving=true;}else st.air=st.airTo;
   return moving;}};
 const reset=()=>{st.t=-1;st.step=-1;st.u=0;st.airTo=0;st.air=0;st.phi=0;};
 return {spec,
  set onStep(f:null|((i:number)=>void)){st.onStep=f;},
  /** "Kick it": the three steps on the figure's clock. Reduced motion: one step per press, each landing at once. */
  kick(reduced:boolean){if(reduced){const i=Math.min(STEPS.length-1,st.step+1);aim(i);st.air=st.airTo;st.phi+=.9*st.side;st.u=i>=2?1:0;return;}reset();st.t=0;},
  /** Back on the spot, still. */
  reset,
  get side(){return st.side;},
  setSide(sd:1|-1){st.side=sd;},
  get running(){return st.t>=0;},
  get state(){return {u:st.u,air:st.air,step:st.step,phi:st.phi,side:st.side};},
 };
}
