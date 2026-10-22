import * as k from '../anatomy/iso-kit';
import {INK,boxOf,byDepth,innerAlpha,isFacing,mix,norm3,prismSvg,shellAlpha,tones,type Box,type LabelAnchor,type V3} from '../anatomy/figure-kit';
import type {FigureSpec,FigureView} from '../anatomy/FigureStage';

/**
 * stadiums · "Fill the stadium" (museum-figures-3, figure kit v2). A simple generic stadium bowl (not one of the seven: the detailed
 * turntable models stay as they are, ~4,000 SVG elements each, far over the figure cap) that turns all the way round: four
 * two-tier stands round a pitch, a roof ring over them, the players' tunnel, a floodlight mast in each open corner. See-through
 * lifts the roof ring and fades it to a ghost, so the stand tiers, the tunnel and the pitch show; Labels: Roof, Stand tiers, Tunnel,
 * Pitch, Floodlights. "Fill the stadium" plays three steps on the figure's own clock (no timers; the Paper loop sleeps at rest):
 * the lower tier fills, the upper tier fills, then the floodlights come on and the teams walk out of the tunnel.
 *
 * Truth first (data.ts FIGURE_SAY): tiers step the rows up so fans see over the heads in front; roofs keep the rain off; the
 * tunnel leads from the dressing rooms to the pitch; floodlights on masts or roofs light evening matches. No numbers are claimed.
 * Parts: plinth 4 + pitch ≤ 6 + lines 1 + 4 stands × ≤ 6 + 4 roof slabs × ≤ 6 + crowd ≤ 3 a facing stand + tunnel 2 + 4 masts × 2 + glow 1 +
 * 5 labels × 7 ≈ 108 (the roof is one path a slab in the see-through); ≤ 120 at every yaw (tests).
 */
export const STEPS=[{id:'lower',lit:['tiers']},{id:'upper',lit:['tiers','roof']},{id:'kickoff',lit:['floodlights','tunnel','pitch']}] as const;
export type StepId=typeof STEPS[number]['id'];
export const STEP_S=1.6;
const PX=52,PY=34,HX=58,HY=40,D=34,H=30,DM=17,H1=13,FRONT=5,ROOF_IN=12,BASE_R=126;
/** How far the roof ring lifts in the see-through. */
export const LIFT=30;
/** One stand: its side (0 +x, 1 +y, 2 -x, 3 -y), the inner edge's half-length and its distance from the centre. */
export const SIDES=[0,1,2,3] as const;
const sideFrame=(i:number)=>{const out:V3=[[1,0,0],[0,1,0],[-1,0,0],[0,-1,0]][i] as V3,along:V3=[-out[1],out[0],0],inner=i%2?HY:HX,half=i%2?HX:HY;return {out,along,inner,half};};
/** A point of stand i: `d` out from its inner edge, `a` along it, at height z. */
export const standPt=(i:number,d:number,a:number,z:number):V3=>{const f=sideFrame(i);return [f.out[0]*(f.inner+d)+f.along[0]*a,f.out[1]*(f.inner+d)+f.along[1]*a,z];};
/** The stand's profile (two tiers with a step between): front wall, lower slope, the step, upper slope, back wall. */
const PROFILE:[number,number][]=[[0,0],[D,0],[D,H],[DM,H1+4],[DM,H1],[0,FRONT]];
const profileRing=(i:number,a:number):V3[]=>PROFILE.map(([d,z])=>standPt(i,d,a,z));
/** The seating slopes' outward-up normals (lower tier and upper tier) for stand i. */
const slopeN=(i:number,run:number,rise:number):V3=>{const f=sideFrame(i);return norm3([-f.out[0]*rise,-f.out[1]*rise,run]);};
/** The players' tunnel: under the stand on side 3 (-y), at the halfway line. */
export const TUNNEL_SIDE=3,TUNNEL_W=6,TUNNEL_H=4.2;
const MASTS=[[1,1],[-1,1],[-1,-1],[1,-1]].map(([sx,sy])=>[sx*(HX+D*.55),sy*(HY+D*.55)] as const);
const MAST_H=74;
export const POINTS:V3[]=[...Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return [Math.cos(a)*BASE_R,Math.sin(a)*BASE_R,-6] as V3;}),[0,0,MAST_H+4],[0,0,H+4+LIFT]];
const GRASS='#5f9a4c',STAND='#d9d9d4',ROOF='#f2f2ee',BASE='#e3e3de',MAST='#b7bac0',GLOW='#ffe17a';
const CROWD=['#e4322b','#2a5bd7','#f2c230'];
const f1=(n:number)=>n.toFixed(1);

export function makeStadiumFigure(){
 /** fill: how many of the three crowd steps are in (eased 0…3); lights: the floodlights (0…1); t: the sequence clock. */
 const st={fill:0,fillTo:0,lights:0,lightsTo:0,t:-1,step:-1,onStep:null as null|((i:number)=>void)};
 const aim=(i:number)=>{st.step=i;st.fillTo=i<0?0:Math.min(3,i+1);st.lightsTo=i>=2?1:0;st.onStep?.(i);};
 const draw=(v:FigureView)=>{const P=v.P,x=v.xray,sa=shellAlpha(x),ia=innerAlpha(x),on=(id:string)=>v.active.has(id),kk=k.cameraOf(P).k;
  const sp=(p:V3)=>k.iso(p,P),poly=(pts:V3[])=>k.pathOf(pts.map(sp),true);
  // The plinth.
  let s=`<path class="iso-halo" d="${k.cylinder(0,0,BASE_R+4,-6,1,P,40).fill}"/>`;const base=k.cylinder(0,0,BASE_R,-6,5,P,56,1),bt=tones(BASE);
  s+=`<path d="${base.fill}" fill="${bt.m}"/><path d="${base.top}" fill="${bt.l}"/><path d="${base.outline}" fill="none" stroke="${INK}" stroke-width=".9"/>`;
  // The pitch: a green slab with its halfway line and centre circle; brighter under the floodlights.
  const p0:V3[]=[[-PX-3,-PY-3,-1],[PX+3,-PY-3,-1],[PX+3,PY+3,-1],[-PX-3,PY+3,-1]],p1=p0.map(q=>[q[0],q[1],1] as V3);
  s+=prismSvg(p0,p1,mix(GRASS,'#8fd06a',st.lights*.45),v,{lit:on('pitch'),attrs:' data-part="pitch"'});
  let lines=poly([[-PX,-PY,1.05],[PX,-PY,1.05],[PX,PY,1.05],[-PX,PY,1.05]])+k.pathOf([sp([0,-PY,1.05]),sp([0,PY,1.05])]);
  {const c:V3[]=[];for(let i=0;i<20;i++){const a=i*Math.PI/10;c.push([Math.cos(a)*9,Math.sin(a)*9,1.05]);}lines+=poly(c);}
  s+=`<path data-pitch-lines d="${lines}" fill="none" stroke="#f7f7f3" stroke-width="1" opacity=".85"/>`;
  type It={box:Box;svg:string};const items:It[]=[];
  // The stands: one prism each (two tiers in its profile), the crowd's dots on whichever slopes face you.
  for(const i of SIDES){const f=sideFrame(i),r0=profileRing(i,-f.half),r1=profileRing(i,f.half),crowd=['','',''];
   let svg=prismSvg(r0,r1,STAND,v,{lit:on('tiers'),attrs:` data-part="stand" data-side="${i}"`});
   // the crowd: rows of dots on the lower slope (step 1) and the upper slope (steps 2 and 3)
   const tiers:[number,number,number,number,number][]=[[1.5,DM-1.5,FRONT,H1,0],[DM+1.5,D-1.5,H1+4,H,1]];
   for(const [d0,d1,z0,z1,tier] of tiers){const n=slopeN(i,d1-d0,z1-z0);if(!isFacing(n,v.V))continue;
    for(let row=0;row<3;row++){const u=(row+.5)/3,d=d0+(d1-d0)*u,z=z0+(z1-z0)*u+.6,step=tier===0?0:row<2?1:2;if(st.fill<=step+.02)continue;
     const share=Math.min(1,st.fill-step),cols=Math.max(4,Math.round(f.half/4)),dot=Math.max(1.4,kk*2.2);
     for(let c=0;c<cols;c++){if((c*37+row*11+i*7)%100/100>share)continue;const a=-f.half+3+(2*f.half-6)*(c+.5)/cols;
      if(i===TUNNEL_SIDE&&tier===0&&Math.abs(a)<TUNNEL_W+2)continue;const q=sp(standPt(i,d,a,z));crowd[step]+=`M${f1(q[0]-dot/2)} ${f1(q[1]-dot/2)}h${f1(dot)}v${f1(dot)}h${f1(-dot)}z`;}}}
   crowd.forEach((d,c)=>{if(d)svg+=`<path data-crowd="${c+1}" d="${d}" fill="${CROWD[c]}"/>`;});
   // the tunnel: a dark opening in the front wall of the stand on side 3, facing the pitch
   if(i===TUNNEL_SIDE&&isFacing([-f.out[0],-f.out[1],0],v.V)){const tl=on('tunnel');
    svg+=`<path data-part="tunnel" d="${poly([standPt(i,0,-TUNNEL_W,0),standPt(i,0,TUNNEL_W,0),standPt(i,0,TUNNEL_W,TUNNEL_H),standPt(i,0,-TUNNEL_W,TUNNEL_H)])}" fill="#2a2a2c" stroke="${tl?'var(--accent)':INK}" stroke-width="${tl?2:.8}"/>`;}
   items.push({box:boxOf(r0,r1),svg});}
  // The floodlight masts in the open corners: a pole and a lamp panel turned to the pitch, glowing when on.
  for(const [mx,my] of MASTS){const top:V3=[mx,my,MAST_H],lit=on('floodlights'),hd=norm3([-mx,-my,0]),side:V3=[-hd[1],hd[0],0],w=7,hh=4;
   const head:V3[]=[[mx+side[0]*w,my+side[1]*w,MAST_H-hh],[mx-side[0]*w,my-side[1]*w,MAST_H-hh],[mx-side[0]*w,my-side[1]*w,MAST_H+hh],[mx+side[0]*w,my+side[1]*w,MAST_H+hh]];
   const facing=isFacing(hd,v.V),col=mix(facing?'#9a9a94':'#c9ccd2',GLOW,facing?st.lights:0);
   items.push({box:[[mx-w,my-w,0],[mx+w,my+w,MAST_H+hh]],svg:`<g data-part="mast"><path d="${k.pathOf([sp([mx,my,0]),sp(top)])}" stroke="${lit?'var(--accent)':MAST}" stroke-width="${f1(Math.max(2,kk*2.6))}" stroke-linecap="round"/><path d="${poly(head)}" fill="${col}" stroke="${lit?'var(--accent)':INK}" stroke-width="${lit?1.6:.8}"/></g>`});}
  for(const it of byDepth(items,v.V))s+=it.svg;
  // See-through: the tunnel's way under the stand (dashed, from the dressing rooms to the pitch).
  if(x>0){const tl=on('tunnel');s+=`<path data-part="tunnel-way" d="${k.pathOf([sp(standPt(TUNNEL_SIDE,D+4,0,.5)),sp(standPt(TUNNEL_SIDE,-6,0,.5))])}" stroke="${tl?'var(--accent)':INK}" stroke-width="${f1(Math.max(2,kk*2.4))}" stroke-dasharray="5 4" opacity="${ia.toFixed(3)}"/>`;}
  // The roof ring: four slabs over the upper tiers; lifted and ghosted in the see-through.
  const lift=LIFT*x,roofs:It[]=[],z0=H+1+lift,z1=H+3.5+lift;
  for(const i of SIDES){const f=sideFrame(i),ring=(z:number):V3[]=>[standPt(i,ROOF_IN,-f.half,z),standPt(i,ROOF_IN,f.half,z),standPt(i,D+1,f.half,z),standPt(i,D+1,-f.half,z)];
   const a=ring(z0),b=ring(z1);
   roofs.push({box:boxOf(a,b),svg:prismSvg(a,b,ROOF,v,{ghost:x>0?sa:undefined,lit:on('roof'),attrs:` data-part="roof" data-side="${i}"`})});}
  for(const it of byDepth(roofs,v.V))s+=it.svg;
  // The light: a soft glow over the pitch while the floodlights are on.
  if(st.lights>.02)s+=`<path data-glow d="${poly([[-PX,-PY,1.2],[PX,-PY,1.2],[PX,PY,1.2],[-PX,PY,1.2]])}" fill="${GLOW}" opacity="${(.22*st.lights).toFixed(3)}"/>`;
  // Labels: every tag reachable from every side (tap one and the stadium turns to face it).
  const labels:LabelAnchor[]=[{id:'roof',text:'Roof',at:standPt(1,(ROOF_IN+D)/2,0,z1)},{id:'tiers',text:'Stand tiers',at:standPt(0,DM*.5,0,(FRONT+H1)/2),normal:slopeN(0,DM,H1-FRONT),keep:true},
   {id:'tunnel',text:'Tunnel',at:standPt(TUNNEL_SIDE,0,0,TUNNEL_H*.6),normal:[0,1,0],keep:true},{id:'pitch',text:'Pitch',at:[PX*.45,PY*.3,1]},{id:'floodlights',text:'Floodlights',at:[MASTS[0][0],MASTS[0][1],MAST_H]}];
  const xs:number[]=[],ys:number[]=[];for(const p of POINTS){const q=sp(p);xs.push(q[0]);ys.push(q[1]);}
  return {svg:s,labels,obj:{l:Math.min(...xs),r:Math.max(...xs),t:Math.min(...ys),b:Math.max(...ys)}};};
 const ease=(dt:number)=>{let m=false;const a=st.fillTo-st.fill,b=st.lightsTo-st.lights;
  if(Math.abs(a)>1e-3){st.fill+=a*(1-Math.exp(-dt/.35));m=true;}else st.fill=st.fillTo;
  if(Math.abs(b)>1e-3){st.lights+=b*(1-Math.exp(-dt/.3));m=true;}else st.lights=st.lightsTo;return m;};
 const spec:FigureSpec={id:'stadium',points:POINTS,front:{yaw:30,pitch:36},pitch:[22,70],seeThrough:true,labels:true,draw,
  tick:dt=>{let moving=false;
   if(st.t>=0){st.t+=dt;const i=Math.min(STEPS.length-1,Math.floor(st.t/STEP_S));if(i!==st.step)aim(i);if(st.t>=STEPS.length*STEP_S)st.t=-1;else moving=true;}
   return ease(dt)||moving;}};
 return {spec,
  set onStep(f:null|((i:number)=>void)){st.onStep=f;},
  /** "Fill the stadium": three steps on the figure's clock. Reduced motion: one step per press, each landing at once. */
  fill(reduced:boolean){if(reduced){aim(Math.min(STEPS.length-1,st.step+1));st.fill=st.fillTo;st.lights=st.lightsTo;return;}st.t=0;st.step=-1;},
  /** Empty again (eased, or at once). */
  empty(reduced:boolean){st.t=-1;st.step=-1;st.fillTo=0;st.lightsTo=0;if(reduced){st.fill=0;st.lights=0;}},
  get running(){return st.t>=0;},
  get state(){return {fill:st.fill,lights:st.lights,step:st.step};},
 };
}
