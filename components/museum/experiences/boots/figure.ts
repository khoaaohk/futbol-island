import * as k from '../anatomy/iso-kit';
import {INK,boxOf,byDepth,clamp,hull,innerAlpha,prismSvg,shellAlpha,tones,type Box,type LabelAnchor,type Swatch,type V3} from '../anatomy/figure-kit';
import type {FigureSpec,FigureView} from '../anatomy/FigureStage';
import {PALETTE} from '../../../../lib/shop/boots';

/**
 * boots · "Run, plant, kick" (museum-figures-2, figure kit v2). One football boot on a patch of turf: drag it all the way round;
 * See-through fades the upper to a ghost and shows the layers inside (insole, heel counter, toe box) over the soleplate and studs;
 * "Screw-in" swaps the moulded studs for screw-in ones (see-through shows their screws); Labels light while you touch them; the
 * swatches recolour the upper in the Kit Shop's boot colours (lib/shop/boots.ts PALETTE), so it ties to the shop; "Real" is the
 * black leather of the Kit Shop's Retro Leather. "Run, plant, kick" plays three steps: the sole bends at the ball of the foot,
 * the studs bite the turf, the upper meets the ball, each lighting its parts.
 *
 * Truth first (facts.ts FIGURE_SAY; the exhibit's sources): a stiff heel counter cups the heel, a toe box keeps the front in
 * shape, the soleplate carries the studs and bends under the ball of the foot, studs grip the grass; moulded studs are part of
 * the sole, screw-in studs can be changed for the pitch. Parts: ~5 prisms × ≤ 6 + 10 studs + laces ≈ 60 SVG elements.
 */
const L=130,BX=55;
/** The half width of the boot's outline at x (heel at -L, toe at +L): round heel, widest at the ball of the foot, a narrow toe. */
export const halfWidth=(x:number)=>{const t=clamp((x+90)/140,0,1),w=30+14*t*t*(3-2*t)-(x>60?(x-60)*.12:0);return w*Math.pow(Math.max(0,1-(x/L)**2),.42);};
/** The outline ring between x0 and x1, pulled in by `inset`, at height z (16 points: a near-convex foot shape). */
export function ring(x0:number,x1:number,inset:number,z:number,n=10):V3[]{const a=Math.max(x0,-L+.5),b=Math.min(x1,L-.5),out:V3[]=[];
 for(let i=0;i<n;i++){const x=a+(b-a)*i/(n-1);out.push([x,Math.max(1,halfWidth(x)-inset),z]);}
 for(let i=n-1;i>=0;i--){const x=a+(b-a)*i/(n-1);out.push([x,-Math.max(1,halfWidth(x)-inset),z]);}return out;}
export const STUDS:[number,number][]=[[112,0],[88,16],[88,-16],[62,25],[62,-25],[34,22],[34,-22],[-80,17],[-80,-17],[-108,0]];
const SOLE=13,UP=18,T1=44,T2=64,T3=80;
export const POINTS:V3[]=[[-L-6,-62,-4],[L+6,62,-4],[-L-6,62,-4],[L+6,-62,-4],[-L,0,110],[L,0,70],[0,0,110]];
export const BOOT_SWATCHES:readonly Swatch[]=['White','Red','Royal','Volt','Gold'].map(n=>{const p=PALETTE.find(q=>q.name===n)!;return {id:n.toLowerCase(),name:n,hex:p.hex};});
const REAL='#18191d',SOLE_C='#3a3d42',INSOLE='#e9dcc0',COUNTER='#c8a46a',TOEBOX='#c8a46a',TURF='#7fae5a',STUD='#2b2d31',METAL='#c9ccd2',LACE='#f6f3ea';
export const STEPS=[{id:'run',lit:['soleplate','insole']},{id:'plant',lit:['studs','heel']},{id:'kick',lit:['upper','toebox']}] as const;
export type StepId=typeof STEPS[number]['id'];
const f1=(n:number)=>n.toFixed(1);

export function makeBootFigure(){
 /** flex: heel lifted round the ball of the foot (rad); sink: studs into the turf; swing: the whole boot tips toe-down to kick. */
 const st={screw:false,flex:0,sink:0,swing:0,to:{flex:0,sink:0,swing:0}};
 const pose=(p:readonly number[]):V3=>{let [x,y,z]=p;
  const w=clamp((BX-x)/40,0,1),a=st.flex*w*w*(3-2*w);if(a){const dx=x-BX,c=Math.cos(a),s=Math.sin(a);x=BX+dx*c+z*s;z=z*c-dx*s;}
  if(st.swing){const c=Math.cos(st.swing),s=Math.sin(st.swing),dx=x+40,dz=z;x=-40+dx*c+dz*s;z=dz*c-dx*s+28*st.swing/.35;}
  return [x,y,z-st.sink];};
 const posed=(r:readonly V3[])=>r.map(pose);
 const draw=(v:FigureView)=>{const P=v.P,x=v.xray,sa=shellAlpha(x),ia=innerAlpha(x),on=(id:string)=>v.active.has(id),kk=k.cameraOf(P).k;
  // Turf: a round patch (iso-kit solid, its own colours).
  let s=`<path class="iso-halo" d="${k.cylinder(0,0,142,-5,1,P,40).fill}"/>`;
  const turf=k.cylinder(0,0,138,-5,5,P,48,1),tt=tones(TURF);
  s+=`<path d="${turf.fill}" fill="${tt.m}"/><path d="${turf.top}" fill="${tt.l}"/><path d="${turf.outline}" fill="none" stroke="${INK}" stroke-width=".9"/>`;
  type It={box:Box;svg:string};const items:It[]=[],inner:It[]=[];
  const prism=(r0:V3[],r1:V3[],hex:string,id:string,opt:{ghost?:number;lit?:boolean;alpha?:number}={})=>{const b=posed(r0),t=posed(r1);
   return {box:boxOf(b,t),svg:prismSvg(b,t,hex,v,{...opt,attrs:` data-part="${id}"`})};};
  // Studs: a silhouette each (moulded = part of the sole, dark; screw-in = metal), their screws inside when you see through.
  let screws='';
  for(const [sx,sy] of STUDS){const r0=st.screw?5.2:4.4,r1=st.screw?6:6.2,pts:V3[]=[];
   for(let i=0;i<8;i++){const a=i*Math.PI/4;pts.push([sx+Math.cos(a)*r0,sy+Math.sin(a)*r0,0],[sx+Math.cos(a)*r1,sy+Math.sin(a)*r1,SOLE]);}
   const q=posed(pts),h=k.pathOf(hull(q.map(p=>k.iso(p,P))),true),lit=on('studs');
   items.push({box:boxOf(q),svg:`<path data-stud="${st.screw?'screw':'moulded'}" d="${h}" fill="${st.screw?METAL:STUD}" stroke="${lit?'var(--accent)':INK}" stroke-width="${lit?1.6:.8}"/>`});
   if(st.screw){const a=k.iso(pose([sx,sy,SOLE-2]),P),b=k.iso(pose([sx,sy,SOLE+6]),P);screws+=`M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`;}}
  // The soleplate (it carries the studs and bends at the ball of the foot).
  items.push(prism(ring(-L,L,0,SOLE),ring(-L,L,0,UP),SOLE_C,'soleplate',{lit:on('soleplate')}));
  const hex=v.swatchHex??REAL,ghost=x>0?sa:undefined;
  // The upper: the foot part, the instep and the heel collar (the shell that fades in the see-through).
  const U1=prism(ring(-L,L,1,UP),ring(-L,L,1,T1),hex,'upper',{ghost,lit:on('upper')}),U2=prism(ring(-L+2,62,7,T1),ring(-L+2,62,7,T2),hex,'upper',{ghost,lit:on('upper')}),
   U3=prism(ring(-L+4,-46,5,T2),ring(-L+4,-46,5,T3),hex,'upper',{ghost,lit:on('upper')});
  items.push(U1,U2,U3);
  // The layers inside: insole, heel counter, toe box.
  if(x>0){inner.push(prism(ring(-L+5,L-6,6,UP),ring(-L+5,L-6,6,UP+3),INSOLE,'insole',{alpha:ia,lit:on('insole')}),
   prism(ring(-L+2,-86,2.5,UP+3),ring(-L+2,-86,2.5,58),COUNTER,'heel',{alpha:ia,lit:on('heel')}),
   prism(ring(98,L-2,2.5,UP+3),ring(98,L-2,2.5,38),TOEBOX,'toebox',{alpha:ia,lit:on('toebox')}));}
  for(const it of byDepth(items,v.V))s+=it.svg;
  if(screws)s+=`<path data-screws d="${screws}" stroke="#8a8d93" stroke-width="${f1(Math.max(2,kk*2.4))}" stroke-linecap="round" opacity="${(x>0?ia:0).toFixed(3)}"/>`;
  for(const it of byDepth(inner,v.V))s+=it.svg;
  // The ankle opening and the laces on top (always facing up, so seen from any side).
  const open=posed(ring(-118,-60,9,T3+.2)).map(p=>k.iso(p,P));
  s+=`<path data-opening d="${k.pathOf(open,true)}" fill="#2a2a2c" fill-opacity="${(x>0?sa:1).toFixed(3)}" stroke="${INK}" stroke-width=".8"/>`;
  let lace='';for(let i=0;i<6;i++){const xa=-40+i*18,xb=xa+18,ya=halfWidth(xa)-15,yb=halfWidth(xb)-15;
   const a=k.iso(pose([xa,(i%2?-1:1)*ya,T2+.4]),P),b=k.iso(pose([xb,(i%2?1:-1)*yb,T2+.4]),P);lace+=`M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`;}
  s+=`<path data-laces d="${lace}" fill="none" stroke="${on('laces')?'var(--accent)':LACE}" stroke-width="${f1(Math.max(2,kk*2.6))}" stroke-linecap="round" opacity="${(x>0?Math.max(sa,.4):1).toFixed(3)}"/>`;
  // Labels: no part ever hides its tag (the boot's parts are all around it); tap one and the boot turns to face it.
  const labels:LabelAnchor[]=[{id:'upper',text:'Upper',at:pose([90,halfWidth(90)-2,32]),normal:[0,1,0],keep:true},{id:'laces',text:'Laces',at:pose([10,0,T2+.5])},
   {id:'soleplate',text:'Soleplate',at:pose([-20,halfWidth(-20),12]),normal:[0,1,0],keep:true},{id:'studs',text:st.screw?'Screw-in studs':'Moulded studs',at:pose([62,25,2])}];
  if(x>.5)labels.push({id:'insole',text:'Insole',at:pose([0,0,UP+3])},{id:'heel',text:'Heel counter',at:pose([-L+4,0,48]),normal:[-1,0,0],keep:true},{id:'toebox',text:'Toe box',at:pose([L-8,0,32]),normal:[1,0,0],keep:true});
  const xs:number[]=[],ys:number[]=[];for(const p of POINTS){const q=k.iso(p,P);xs.push(q[0]);ys.push(q[1]);}
  return {svg:s,labels,obj:{l:Math.min(...xs),r:Math.max(...xs),t:Math.min(...ys),b:Math.max(...ys)}};};
 const spec:FigureSpec={id:'boot',points:POINTS,front:{yaw:60,pitch:28},seeThrough:true,labels:true,swatches:BOOT_SWATCHES,swatchLabel:'Real',draw,
  tick:dt=>{let moving=false;for(const key of ['flex','sink','swing'] as const){const d=st.to[key]-st[key];if(Math.abs(d)<1e-3){st[key]=st.to[key];continue;}st[key]+=d*(1-Math.exp(-dt/.12));moving=true;}return moving;}};
 return {spec,
  get screw(){return st.screw;},setScrew(on:boolean){st.screw=on;},
  /** One step of "Run, plant, kick" (null = stand still); reduced motion jumps to the pose. */
  pose(step:StepId|null,reduced:boolean){st.to={flex:step==='run'?.32:0,sink:step==='plant'?4:0,swing:step==='kick'?.35:0};if(reduced){st.flex=st.to.flex;st.sink=st.to.sink;st.swing=st.to.swing;}},
  get state(){return {flex:st.flex,sink:st.sink,swing:st.swing};},
 };
}
