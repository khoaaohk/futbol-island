import * as k from '../anatomy/iso-kit';
import {INK,boxOf,byDepth,hull,innerAlpha,mix,prismSvg,shellAlpha,tones,type Box,type LabelAnchor,type V3} from '../anatomy/figure-kit';
import type {FigureSpec,FigureView} from '../anatomy/FigureStage';

/**
 * floodlights-1878 · "Switch on a floodlight" (museum-figures-3, figure kit v2). One floodlight on a tall mast beside a patch of
 * turf: drag it all the way round; See-through fades the lamp housing and the mast to ghosts and shows the reflector, the lamps
 * and the cable running from the power box, under the grass and up inside the mast. "Switch on" plays three steps on the figure's
 * own clock (no timers: the Paper loop runs only while the sequence moves, then sleeps): power on (the cable lights), the lamps
 * glow, the pitch is lit (a pool of light grows on the grass). Labels: Lamps, Reflector, Mast, Cable, Power box.
 *
 * Truth first (content.ts FIGURE_SAY; sources in content.ts): in 1878 the Bramall Lane lamps stood on wooden towers and the power
 * came from generators at the ground (no grid); a reflector sends the light forward; older floodlights needed to warm up, LED
 * floodlights light at once. The figure is a generic modern mast, not a plan of any ground; no numbers are claimed.
 * Parts: turf 4 + pool 2 + 4 prisms × ≤ 6 + cable 2 + 6 lamps + a beam + 5 labels × 7 ≈ 80 SVG elements (≤ 120 at every yaw).
 */
export const STEPS=[{id:'power',lit:['box','cable']},{id:'warm',lit:['lamp','reflector']},{id:'lit',lit:['lamp','mast']}] as const;
export type StepId=typeof STEPS[number]['id'];
/** Seconds between the steps of "Switch on". */
export const STEP_S=1.6;
const TURF_R=120,MAST_H=226,TILT=30*Math.PI/180,HC:V3=[12,0,238];
/** The way the lamps face: toward the pitch (+x), tipped down. */
export const FACE:V3=[Math.cos(TILT),0,-Math.sin(TILT)];
const UPW:V3=[Math.sin(TILT),0,Math.cos(TILT)];
/** A point of the lamp head: u along the way it faces, y across, w up the panel. */
export const head=(u:number,y:number,w:number):V3=>[HC[0]+u*FACE[0]+w*UPW[0],HC[1]+y,HC[2]+u*FACE[2]+w*UPW[2]];
const rect=(u:number,hy:number,hw:number):V3[]=>[head(u,-hy,-hw),head(u,hy,-hw),head(u,hy,hw),head(u,-hy,hw)];
const ringAt=(r:number,z:number,n=8):V3[]=>Array.from({length:n},(_,i)=>{const a=i*2*Math.PI/n+Math.PI/8;return [Math.cos(a)*r,Math.sin(a)*r,z] as V3;});
const BOX_AT:[number,number]=[-44,34],BOX_W=26,BOX_D=20,BOX_H=32;
const boxRing=(z:number):V3[]=>[[BOX_AT[0]-BOX_W/2,BOX_AT[1]-BOX_D/2,z],[BOX_AT[0]+BOX_W/2,BOX_AT[1]-BOX_D/2,z],[BOX_AT[0]+BOX_W/2,BOX_AT[1]+BOX_D/2,z],[BOX_AT[0]-BOX_W/2,BOX_AT[1]+BOX_D/2,z]];
export const LAMPS:[number,number][]=[[-20,-8],[0,-8],[20,-8],[-20,8],[0,8],[20,8]];
/** The pool of light on the grass, in front of the mast (where the lamps point). */
export const POOL:V3=[70,0,.4];
export const POINTS:V3[]=[...Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return [Math.cos(a)*TURF_R,Math.sin(a)*TURF_R,-5] as V3;}),[0,0,MAST_H],...rect(-9,34,21),...rect(9,34,21)];
const TURF='#5c8748',MAST='#b7bac0',HOUSING='#d9dad6',REFL='#cfd3da',BOX='#7d8f86',CABLE='#2a2a2c',GLOW='#ffe17a',OFF='#9a9a94';
const f1=(n:number)=>n.toFixed(1);

export function makeFloodlightFigure(){
 /** p: power along the cable, g: the lamps' glow, r: the pool of light (all 0…1, eased toward `to`); t: the sequence clock. */
 const st={p:0,g:0,r:0,to:{p:0,g:0,r:0},t:-1,step:-1,onStep:null as null|((i:number)=>void)};
 const aim=(i:number)=>{st.step=i;st.to={p:i>=0?1:0,g:i>=1?1:0,r:i>=2?1:0};st.onStep?.(i);};
 const draw=(v:FigureView)=>{const P=v.P,x=v.xray,sa=shellAlpha(x),ia=innerAlpha(x),on=(id:string)=>v.active.has(id),kk=k.cameraOf(P).k;
  const sp=(p:V3)=>k.iso(p,P),line=(pts:V3[])=>k.pathOf(pts.map(sp));
  // Turf: a round patch, a little brighter where the light falls.
  let s=`<path class="iso-halo" d="${k.cylinder(0,0,TURF_R+4,-5,1,P,40).fill}"/>`;
  const turf=k.cylinder(0,0,TURF_R,-5,5,P,48,1),tt=tones(mix(TURF,'#8fc06a',st.r*.35));
  s+=`<path d="${turf.fill}" fill="${tt.m}"/><path d="${turf.top}" fill="${tt.l}"/><path d="${turf.outline}" fill="none" stroke="${INK}" stroke-width=".9"/>`;
  // The pool of light: grows on the grass in the last step (kept inside the turf).
  if(st.r>.01)for(const [scale,op] of [[1,.42],[.55,.5]] as const){const rad=58*st.r*scale,pts:V3[]=[];
   for(let i=0;i<28;i++){const a=i*2*Math.PI/28;let px=POOL[0]+Math.cos(a)*rad*1.25,py=Math.sin(a)*rad;const d=Math.hypot(px,py);if(d>TURF_R-3){px*=(TURF_R-3)/d;py*=(TURF_R-3)/d;}pts.push([px,py,POOL[2]]);}
   s+=`<path data-pool d="${k.pathOf(pts.map(sp),true)}" fill="${GLOW}" opacity="${(op*st.r).toFixed(3)}"/>`;}
  // The beam: a soft cone from the glass to the pool while the lamps shine (under the solids, so it never veils them).
  if(st.g>.05&&st.r>.05){const pts=[...rect(9,30,18).map(sp)];for(let i=0;i<12;i++){const a=i*Math.PI/6;pts.push(sp([POOL[0]+Math.cos(a)*58*st.r*1.25,Math.sin(a)*58*st.r,POOL[2]]));}
   s+=`<path data-beam d="${k.pathOf(hull(pts),true)}" fill="${GLOW}" opacity="${(.16*st.g*st.r).toFixed(3)}"/>`;}
  // The cable on the ground, from the power box to the foot of the mast (lit in the accent as the power runs along it).
  const ground:V3[]=[[BOX_AT[0]+BOX_W/2,BOX_AT[1],.6],[-6,BOX_AT[1],.6],[0,0,.6]];
  const cableHot=st.p>.02||on('cable'),cw=f1(Math.max(2,kk*2.2));
  s+=`<path data-part="cable" d="${line(ground)}" fill="none" stroke="${cableHot?'var(--accent)':CABLE}" stroke-width="${cw}" stroke-linecap="round"/>`;
  type It={box:Box;svg:string};const items:It[]=[];
  // The power box.
  const b0=boxRing(0),b1=boxRing(BOX_H);items.push({box:boxOf(b0,b1),svg:prismSvg(b0,b1,BOX,v,{lit:on('box'),attrs:' data-part="box"'})});
  // The mast (a tapered steel pole on a concrete footing); a ghost in the see-through, so the cable inside shows.
  const m0=ringAt(6.5,0),m1=ringAt(3.6,MAST_H);items.push({box:boxOf(m0,m1),svg:prismSvg(m0,m1,MAST,v,{ghost:x>0?sa:undefined,lit:on('mast'),attrs:' data-part="mast"'})});
  // The lamp head: the housing (a shell), its front glass facing the pitch.
  const h0=rect(-9,34,21),h1=rect(9,34,21);items.push({box:boxOf(h0,h1),svg:prismSvg(h0,h1,HOUSING,v,{ghost:x>0?sa:undefined,lit:on('lamp'),attrs:' data-part="housing"'})});
  for(const it of byDepth(items,v.V))s+=it.svg;
  // Inside (see-through): the cable up the mast, the reflector bowl behind the lamps.
  if(x>0){s+=`<path data-part="cable-up" d="${line([[0,0,.6],[0,0,MAST_H],head(-6,0,0)])}" fill="none" stroke="${cableHot?'var(--accent)':CABLE}" stroke-width="${cw}" stroke-linecap="round" opacity="${ia.toFixed(3)}"/>`;
   s+=prismSvg(rect(-7,14,7),rect(5,31,18),REFL,v,{alpha:ia,lit:on('reflector'),attrs:' data-part="reflector"'});}
  // The lamps: seen through the front glass when it faces you, or through the ghost; they glow as they warm up.
  const front=FACE[0]*v.V[0]+FACE[1]*v.V[1]+FACE[2]*v.V[2]>.02;
  if(front||x>.05){const rad=f1(Math.max(2.5,kk*5.5)),col=mix(OFF,GLOW,st.g),a=front?1:ia;
   for(const [y,w] of LAMPS){const q=sp(head(9.2,y,w));s+=`<circle data-lamp cx="${f1(q[0])}" cy="${f1(q[1])}" r="${rad}" fill="${col}" stroke="${on('lamp')?'var(--accent)':INK}" stroke-width=".8" opacity="${a.toFixed(3)}"/>`;}}
  // Labels: every tag can be reached from every side (tap one and the figure turns to face its part).
  const labels:LabelAnchor[]=[{id:'lamp',text:'Lamps',at:head(9,0,20),normal:FACE,keep:true},{id:'mast',text:'Mast',at:[0,0,MAST_H*.55]},
   {id:'cable',text:'Cable',at:[-20,BOX_AT[1],.6]},{id:'box',text:'Power box',at:[BOX_AT[0],BOX_AT[1],BOX_H]}];
  if(x>.5)labels.push({id:'reflector',text:'Reflector',at:head(-2,0,-15)});
  const xs:number[]=[],ys:number[]=[];for(const p of POINTS){const q=sp(p);xs.push(q[0]);ys.push(q[1]);}
  return {svg:s,labels,obj:{l:Math.min(...xs),r:Math.max(...xs),t:Math.min(...ys),b:Math.max(...ys)}};};
 const ease=(key:'p'|'g'|'r',dt:number)=>{const d=st.to[key]-st[key];if(Math.abs(d)<1e-3){st[key]=st.to[key];return false;}st[key]+=d*(1-Math.exp(-dt/.3));return true;};
 const spec:FigureSpec={id:'floodlight',points:POINTS,front:{yaw:35,pitch:24},pitch:[12,50],seeThrough:true,labels:true,draw,
  tick:dt=>{let moving=false;
   if(st.t>=0){st.t+=dt;const i=Math.min(STEPS.length-1,Math.floor(st.t/STEP_S));if(i!==st.step)aim(i);if(st.t>=STEPS.length*STEP_S)st.t=-1;else moving=true;}
   for(const key of ['p','g','r'] as const)moving=ease(key,dt)||moving;return moving;}};
 return {spec,
  set onStep(f:null|((i:number)=>void)){st.onStep=f;},
  /** "Switch on": the three steps on the figure's clock. Reduced motion: one step per press, each landing at once. */
  switchOn(reduced:boolean){if(reduced){const i=Math.min(STEPS.length-1,st.step+1);aim(i);st.p=st.to.p;st.g=st.to.g;st.r=st.to.r;return;}st.t=0;st.step=-1;},
  /** Lights off: back to the dark (eased, or at once). */
  switchOff(reduced:boolean){st.t=-1;st.step=-1;st.to={p:0,g:0,r:0};if(reduced){st.p=0;st.g=0;st.r=0;}},
  get running(){return st.t>=0;},
  get state(){return {p:st.p,g:st.g,r:st.r,step:st.step};},
 };
}
