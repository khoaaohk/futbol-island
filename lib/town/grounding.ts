import * as T from 'three';
import {spotHash} from './broadleafTrees';

// Grounding (owner, Nov 26 2026, shot 140: "the base of buildings and trees ... looks like it's just floating"). Things stand IN the
// world instead of on it:
//  1. CONTACT SHADING: one soft darkening on the ground round (and under) every foot: buildings, station houses and platforms, trees,
//     palms, benches, machines, lamps, signs. ONE mesh for the whole island (1 draw, no texture, no shadow pass): rings of vertices
//     whose colour is a screen-space MULTIPLIER (blend dst * src), so the same ring darkens sand, grass, paving, Day, Sunset and Night
//     by the same fraction and never paints a colour of its own. Sides turned away from the sun (already in the real shadow) take
//     less, so the two do not stack into black. Where the town's baked kerb shade (townDepth.ts contactShade) already ran, it is skipped.
//  2. DETAIL (merged into the island's 50 m paint batches by the caller: 0 draws): a stone skirting course at the foot of building
//     walls (cut at doors), sand drifted against walls and the platforms on the beach, a few grass tufts and stones at walls on the
//     lawn, a root flare with 2-3 roots under broadleaf trees, a concrete pad under vending machines. Dropped on the lowest heat tier.
// Deterministic: every choice reads spotHash(x, z). Nothing is a collider; nothing is placed on a road, a door or a machine's front.
// Switch: `?ground=0` restores the old look exactly (nothing here runs). GROUND_DEFAULT is the one line to ship / unship.

export const GROUND_DEFAULT=true;// `?ground=0` switches grounding off (before / after)
const query=(()=>{try{return typeof window!=='undefined'&&window.location&&typeof window.location.search==='string'?window.location.search:null;}catch{return null;}})();
let enabled=query===null?GROUND_DEFAULT:/[?&]ground=1(&|$)/.test(query)||(GROUND_DEFAULT&&!/[?&]ground=0(&|$)/.test(query));
/** Tests call this; the browser reads the URL once. */
export function setGrounding(on:boolean){enabled=on;}
export const groundingOn=()=>enabled;

export type FootKind='building'|'house'|'platform'|'tree'|'palm'|'bush'|'prop'|'machine'|'post';
/** A footprint in its own frame: half sizes along local x / z, turned by yaw (world = centre + R(yaw) local, as townDepth.ts).
 *  sides: which sides shade (bit 1 = local -z, 2 = +x, 4 = +z, 8 = -x; default all). fill: shade under it too (open props). */
export type Foot={kind:FootKind;x:number;z:number;hw:number;hd:number;yaw?:number;round?:boolean;sides?:number;fill?:boolean;
 /** a flat base height (decks, platforms): the ring lies there instead of on the ground */base?:number;
 /** metres the thing runs on under the drawn ground (tests: uprights sink, never sit on top) */sink?:number;
 /** a perimeter of its own (curved platforms): replaces the rectangle; same shape as loop() returns */path?:Edge[]};
export type Edge={p:[number,number];o:[number,number];side:number};
/** spread: metres of soft shade beyond the foot; k: the multiplier at the foot (1 = none); soil: the tree's leaf-litter tint. */
export const CONTACT:Record<FootKind,{spread:number;k:number;soil?:boolean}>={
 building:{spread:.95,k:.6},house:{spread:.9,k:.6},platform:{spread:.75,k:.62},tree:{spread:1.25,k:.66,soil:true},palm:{spread:.7,k:.72},
 bush:{spread:.45,k:.7},prop:{spread:.38,k:.66},machine:{spread:.42,k:.6},post:{spread:.26,k:.7}};
/** How much of the shade a side keeps when it faces away from the sun (it is in the real shadow already). */
export const SHADOW_SIDE_KEEP=.5;
/** A station platform's half length to its wall (trainWorld.ts: 5 m pieces, 2.53 m half boxes, STATION_HALF 15). */
export const PLATFORM_HW=15.03;
/** Leaf litter / soil under broadleaf trees: the multiplier's tint at the trunk (warm brown, so grass reads as soil, sand as damp). */
const SOIL_TINT=[1,.9,.72] as const;
/** The decal rides this far over the drawn layer (above the sand / lawn at -0.105 / -0.112 and the paths at -0.0375, under a foot). */
export const DECAL_LIFT=.025;
/** A foot's ring / roots follow the slope at most this far (a terrace wall's drop is not a slope: the ring stops there). */
export const clampLift=(d:number)=>Math.max(-.25,Math.min(.25,d));

export type GroundQuery={
 /** drawn ground height at (x, z) (the layer a decal or a drift lies on) */
 y:(x:number,z:number)=>number;
 /** true where the town's own baked contact shade already covers this point for this kind (townDepth.ts) */
 covered?:(kind:FootKind,x:number,z:number)=>boolean;
 /** the elevation's smooth lift (cheap): a ring follows the slope from its foot's height */
 lift?:(x:number,z:number)=>number;
 /** the sun's direction on the ground plane (unit) */
 sun:readonly [number,number];
};

const frame=(f:Foot)=>{const a=f.yaw??0,cs=Math.cos(a),sn=Math.sin(a);return (lx:number,lz:number):[number,number]=>[f.x+lx*cs+lz*sn,f.z-lx*sn+lz*cs];};
const rot=(f:Foot,dx:number,dz:number):[number,number]=>{const a=f.yaw??0,cs=Math.cos(a),sn=Math.sin(a);return [dx*cs+dz*sn,-dx*sn+dz*cs];};

/** The perimeter of a foot as a loop of {inner point, outward unit (world), side bit}. Rect corners get three outward steps (rounded). */
function loop(f:Foot):Edge[]{
 if(f.path)return f.path;
 const W=frame(f),out:{p:[number,number];o:[number,number];side:number}[]=[];
 if(f.round){const r=Math.max(f.hw,f.hd),n=r>.5?10:r>.2?8:6;for(let i=0;i<n;i++){const a=i/n*Math.PI*2+.35,c=Math.cos(a),s=Math.sin(a);out.push({p:W(c*r,s*r),o:rot(f,c,s),side:15});}return out;}
 const hw=f.hw,hd=f.hd,S:[number,number,number,number,number,number,number,number][]=[[-hw,-hd,1,0,0,-1,2*hw,1],[hw,-hd,0,1,1,0,2*hd,2],[hw,hd,-1,0,0,1,2*hw,4],[-hw,hd,0,-1,-1,0,2*hd,8]];
 S.forEach((s,k)=>{const prev=S[(k+3)%4],steps=Math.max(1,Math.min(6,Math.round(s[6]/4)));
  // the corner: previous side's normal, the diagonal, this side's normal (a rounded outer edge)
  const d=Math.SQRT1_2;out.push({p:W(s[0],s[1]),o:rot(f,prev[4],prev[5]),side:prev[7]|s[7]});out.push({p:W(s[0],s[1]),o:rot(f,(prev[4]+s[4])*d,(prev[5]+s[5])*d),side:prev[7]|s[7]});
  for(let i=0;i<steps;i++){const t=i/steps*s[6];out.push({p:W(s[0]+s[2]*t,s[1]+s[3]*t),o:rot(f,s[4],s[5]),side:s[7]});}});
 return out;
}

export type DecalData={positions:number[];colors:number[];indices:number[];triangles:number;feet:number;skipped:number};
/** Soft contact-shade rings for every foot (positions in world space; colours = the screen multiplier, 1 = untouched). */
export function contactDecal(feet:readonly Foot[],g:GroundQuery):DecalData{
 const positions:number[]=[],colors:number[]=[],indices:number[]=[];let triangles=0,made=0,skipped=0;
 for(const f of feet){const spec=CONTACT[f.kind];if(!spec)continue;const L=loop(f),n=L.length,mask=f.sides??15,base0=positions.length/3;
  // one ground query per foot (the layered ground is costly to ask); the slope comes from the cheap lift function
  const y0=f.base!==undefined?f.base:g.y(f.x,f.z),l0=g.lift&&f.base===undefined?g.lift(f.x,f.z):0,hy=(x:number,z:number)=>(g.lift&&f.base===undefined?y0+clampLift(g.lift(x,z)-l0):y0)+(f.base===undefined&&(sandDrifts.list.length||sandDrifts.mounds.length)?driftLift(x,z):0);
  // three rings: at the foot (k), 30 % out (40 % of the shade left), the rim (none). Soil: the litter tint fades with the shade.
  const ring=(i:number,t:number,keep:number)=>{const q=L[i],x=q.p[0]+q.o[0]*spec.spread*t*(1+.18*(spotHash(q.p[0],q.p[1],3)-.5)),z=q.p[1]+q.o[1]*spec.spread*t*(1+.18*(spotHash(q.p[0],q.p[1],3)-.5));
   const away=-(q.o[0]*g.sun[0]+q.o[1]*g.sun[1]),sunK=away>0?1-(1-SHADOW_SIDE_KEEP)*away:1,d=(1-spec.k)*keep*sunK;
   positions.push(x,hy(x,z)+DECAL_LIFT,z);
   if(spec.soil){const s=keep;colors.push((1-d)*(1-(1-SOIL_TINT[0])*s),(1-d)*(1-(1-SOIL_TINT[1])*s),(1-d)*(1-(1-SOIL_TINT[2])*s));}
   else colors.push(1-d,1-d*1.03,1-d*1.1);};
  for(let i=0;i<n;i++)ring(i,0,1);for(let i=0;i<n;i++)ring(i,.3,.4);for(let i=0;i<n;i++)ring(i,1,0);
  let any=false;
  for(let i=0;i<n;i++){const j=(i+1)%n,a=L[i],b=L[j];if(!(a.side&b.side&mask)&&!f.round)continue;
   if(g.covered&&g.covered(f.kind,(a.p[0]+b.p[0])/2+a.o[0]*.2,(a.p[1]+b.p[1])/2+a.o[1]*.2)){skipped++;continue;}
   for(const r of [0,1]){const i0=base0+r*n+i,j0=base0+r*n+j,i1=i0+n,j1=j0+n;indices.push(i0,i1,j0,j0,i1,j1);triangles+=2;}any=true;}
  if(f.fill||f.round){const c=positions.length/3,cx=f.x,cz=f.z,d=1-spec.k;positions.push(cx,hy(cx,cz)+DECAL_LIFT,cz);
   if(spec.soil)colors.push((1-d)*SOIL_TINT[0],(1-d)*SOIL_TINT[1],(1-d)*SOIL_TINT[2]);else colors.push(1-d,1-d*1.03,1-d*1.1);
   for(let i=0;i<n;i++){indices.push(c,base0+(i+1)%n,base0+i);triangles++;}any=true;}
  if(any)made++;else{positions.length=base0*3;colors.length=base0*3;}}
 // every triangle faces up (the material is single sided)
 for(let t=0;t<indices.length;t+=3){const a=indices[t]*3,b=indices[t+1]*3,c=indices[t+2]*3,cr=(positions[b+2]-positions[a+2])*(positions[c]-positions[a])-(positions[b]-positions[a])*(positions[c+2]-positions[a+2]);
  if(cr<0){const s=indices[t+1];indices[t+1]=indices[t+2];indices[t+2]=s;}}
 return {positions,colors,indices,triangles,feet:made,skipped};
}

/** The one material: dst * src (no colour of its own), no fog, no tone mapping, under the other transparents, never z-fights. */
export function groundingMaterial(){
 return new T.ShaderMaterial({vertexColors:true,transparent:true,depthWrite:false,fog:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:0,polygonOffsetUnits:-4,// Nov 26 2026: constant units only (DECAL_LIFT does the rest); a slope factor outranked the paving above (tests/roundabout-junctions.cjs)
  blending:T.CustomBlending,blendEquation:T.AddEquation,blendSrc:T.ZeroFactor,blendDst:T.SrcColorFactor,
  vertexShader:'varying vec3 vC;void main(){vC=color;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'varying vec3 vC;void main(){gl_FragColor=vec4(vC,1.0);}'});
}
export function decalMesh(d:DecalData){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(d.positions,3));geo.setAttribute('color',new T.Float32BufferAttribute(d.colors,3));
 geo.setIndex(d.indices);geo.computeBoundingSphere();const m=new T.Mesh(geo,groundingMaterial());m.name='island-grounding';m.renderOrder=-1;m.castShadow=false;m.receiveShadow=false;
 m.userData.ownDraw=true;m.userData.skipRoofObstacle=true;m.userData.depthOwn=true;m.matrixAutoUpdate=false;m.updateMatrix();return m;}

// ---- Detail pieces (vertex lists per colour and 50 m cell; the caller makes plain-paint meshes that the batching pass merges) -------
export type Piece={colour:string;tris:number[]};// world-space triangles (x, y, z) x 3, any winding (fixed to face out of `inside`)
export class Pieces{cells=new Map<string,{x:number;z:number;colour:string;pos:number[];tint:number[]}>();triangles=0;counts:Record<string,number>={};
 add(colour:string,tris:number[][],inside:[number,number,number]|null,what:string){const c0=tris[0],ox=Math.floor(c0[0]/50)*50+25,oz=Math.floor(c0[2]/50)*50+25,k=colour+'|'+ox+':'+oz;
  let c=this.cells.get(k);if(!c){c={x:ox,z:oz,colour,pos:[],tint:[]};this.cells.set(k,c);}
  for(let i=0;i+2<tris.length;i+=3){let a=tris[i],b=tris[i+1],d=tris[i+2];
   const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=d[0]-a[0],vy=d[1]-a[1],vz=d[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
   if(inside){const cx=(a[0]+b[0]+d[0])/3-inside[0],cy=(a[1]+b[1]+d[1])/3-inside[1],cz=(a[2]+b[2]+d[2])/3-inside[2];if(nx*cx+ny*cy+nz*cz<0){const s=b;b=d;d=s;}}
   c.pos.push(a[0]-ox,a[1],a[2]-oz,b[0]-ox,b[1],b[2]-oz,d[0]-ox,d[1],d[2]-oz);for(const q of [a,b,d]){const t=q[3]??1;c.tint.push(t,t,t);}this.triangles++;}
  this.counts[what]=(this.counts[what]??0)+1;}
}

export type Span={a:[number,number];b:[number,number];o:[number,number]};// a wall's foot from a to b, outward unit o
/** Drifts only on walls facing the sun (dot > this): on a shaded side the shadow map's normal offset lit them as pale strips (a5). */
export const DRIFT_SUN=.3;
/** Sand drifts are drawn with the beach's OWN material (fields.ts merges them into the sand ribbon: same ripples, mottle, light and
 *  shadow; 0 draws). A plain-paint drift read as a pale block against the shader sand (shots/north-close-a2). World-space triangles. */
export const sandDrifts:{positions:number[];list:{ax:number;az:number;ux:number;uz:number;ox:number;oz:number;len:number;h0:number;h1:number;w:number;e:number}[];
 /** round sand mounds at the foot of palms and posts on the beach (grounding 2) */mounds:{x:number;z:number;r:number;h:number}[]}={positions:[],list:[],mounds:[]};
/** Hand the drifts to the beach mesh once (fields.ts); empty when grounding is off or on the lowest tier. */
export function takeSandDrifts(){const p=sandDrifts.positions;sandDrifts.positions=[];return p;}
/** How high a drift lifts the ground at (x, z) (the contact shade rides over it). */
export function driftLift(x:number,z:number){let best=0;for(const m of sandDrifts.mounds){const d=Math.hypot(x-m.x,z-m.z);if(d<m.r){const h=m.h*Math.min(1,(m.r-d)/(m.r*.55));if(h>best)best=h;}}for(const d of sandDrifts.list){const px=x-d.ax,pz=z-d.az,t=px*d.ux+pz*d.uz,o=px*d.ox+pz*d.oz;if(t<0||t>d.len||o<-.05||o>d.w)continue;
 const along=t<d.e?t/d.e:t>d.len-d.e?(d.len-t)/d.e:1,h=(d.h0+(d.h1-d.h0)*t/d.len)*Math.max(0,1-Math.max(0,o)/d.w)*along;if(h>best)best=h;}return best;}
/** A drift of sand along a wall's foot: a low wedge against the wall, tapered at both ends (4 triangles, facing up / out). */
export function drift(s:Span,y:(x:number,z:number)=>number){
 const len=Math.hypot(s.b[0]-s.a[0],s.b[1]-s.a[1]);if(len<.6)return;const ux=(s.b[0]-s.a[0])/len,uz=(s.b[1]-s.a[1])/len,h0=spotHash(s.a[0],s.a[1],5),h=.07+.08*h0,w=.3+.25*spotHash(s.b[0],s.b[1],6),e=Math.min(.45,len*.25),h1=h*(.75+.4*spotHash(s.b[0],s.a[1],7));
 const at=(t:number,out:number,up:number):number[]=>{const x=s.a[0]+ux*t+s.o[0]*out,z=s.a[1]+uz*t+s.o[1]*out;return [x,y(x,z)+up,z];};
 const A0=at(e,-.03,h),B0=at(len-e,-.03,h1),A1=at(e*.6,w,-.02),B1=at(len-e*.6,w*(.8+.3*h0),-.02),Ae=at(0,-.03,-.02),Be=at(len,-.03,-.02);
 const tris=[A0,B0,B1,A0,B1,A1,A0,A1,Ae,B0,Be,B1],inside=at(len/2,-.6,-.4);
 for(let i=0;i<tris.length;i+=3){let a=tris[i],b=tris[i+1],d=tris[i+2];const ux2=b[0]-a[0],uy=b[1]-a[1],uz2=b[2]-a[2],vx=d[0]-a[0],vy=d[1]-a[1],vz=d[2]-a[2],nx=uy*vz-uz2*vy,ny=uz2*vx-ux2*vz,nz=ux2*vy-uy*vx;
  if(nx*((a[0]+b[0]+d[0])/3-inside[0])+ny*((a[1]+b[1]+d[1])/3-inside[1])+nz*((a[2]+b[2]+d[2])/3-inside[2])<0){const q=b;b=d;d=q;}sandDrifts.positions.push(...a,...b,...d);}
 sandDrifts.list.push({ax:s.a[0],az:s.a[1],ux,uz,ox:s.o[0],oz:s.o[1],len,h0:h,h1,w,e});
}
/** A grass tuft: three thin blades from one root, leaning out (6 triangles, both faces). */
export function tuft(P:Pieces,x:number,z:number,y:number,colour:string,scale=1){
 const yaw=spotHash(x,z,8)*Math.PI*2,tris:number[][]=[];
 for(let k=0;k<3;k++){const a=yaw+k*2.1,h=(.16+.1*spotHash(x+k,z,9))*scale,lean=.07*scale,bw=.035*scale,cx=Math.cos(a),cz=Math.sin(a);
  const l=[x-cz*bw,y-.02,z+cx*bw],r=[x+cz*bw,y-.02,z-cx*bw],t=[x+cx*lean,y+h,z+cz*lean];tris.push(l,r,t,r,l,t);}
 P.add(colour,tris,null,'tuft');// both faces kept as written (no inside test)
}
/** A small low stone half in the ground (an irregular flattened pyramid, 5 triangles). */
export function stone(P:Pieces,x:number,z:number,y:number,colour:string){
 const r=.06+.06*spotHash(x,z,10),h=r*(.55+.4*spotHash(z,x,11)),yaw=spotHash(x,z,12)*6.28,pts=[0,1,2,3,4].map(k=>{const a=yaw+k*1.2566,q=r*(.8+.4*spotHash(x+k,z,13));return [x+Math.cos(a)*q,y-.015,z+Math.sin(a)*q];}),top=[x,y+h,z];
 const tris:number[][]=[];for(let k=0;k<5;k++)tris.push(pts[k],pts[(k+1)%5],top);P.add(colour,tris,[x,y-.5,z],'stone');
}
/** Grounding 2: a low round mound of beach sand round a trunk / post (r: the trunk, R: the rim; in the sand's own material, 0 draws).
 *  Two rings (rim just under the sand, a shoulder at 75 %) and a collar hugging the trunk: 3n triangles, all facing up. */
export function sandMound(x:number,z:number,y:number,r:number,R:number,h:number,n=8){
 const tw=spotHash(x,z,40)*6.28,ring=(q:number,up:number,k:number)=>{const a=tw+k/n*Math.PI*2,j=q*(1+.12*(spotHash(x+k,z,41)-.5));return [x+Math.cos(a)*j,y+up,z+Math.sin(a)*j];};
 const tri=(a:number[],b:number[],d:number[])=>{const ux=b[0]-a[0],uz=b[2]-a[2],vx=d[0]-a[0],vz=d[2]-a[2];if(uz*vx-ux*vz<0)sandDrifts.positions.push(...a,...d,...b);else sandDrifts.positions.push(...a,...b,...d);};
 for(let k=0;k<n;k++){const k1=(k+1)%n,a0=ring(R,-.025,k),a1=ring(R,-.025,k1),b0=ring(r+(R-r)*.45,h*.72,k),b1=ring(r+(R-r)*.45,h*.72,k1),c0=ring(r*.92,h,k),c1=ring(r*.92,h,k1);
  tri(a0,a1,b1);tri(a0,b1,b0);tri(b0,b1,c1);}
 sandDrifts.mounds.push({x,z,r:R,h});
}
/** A collar round a post's foot on paving / lawn: a short 7-sided frustum (concrete), r..r*1.45, 9 cm proud (14 triangles). */
export function collar(P:Pieces,x:number,z:number,y:number,r:number,colour:string,h=.09){
 const n=7,tris:number[][]=[],p=(k:number,q:number,up:number)=>{const a=k/n*Math.PI*2+.3;return [x+Math.cos(a)*q,y+up,z+Math.sin(a)*q];};
 for(let k=0;k<n;k++){tris.push(p(k,r*1.45,-.04),p(k+1,r*1.45,-.04),p(k+1,r*1.12,h),p(k,r*1.45,-.04),p(k+1,r*1.12,h),p(k,r*1.12,h));}
 P.add(colour,tris,[x,y-.3,z],'collar');
}
/** A ring of bare soil round a palm on the lawn (a jagged flat 8-gon, 8 triangles). */
export function soilRing(P:Pieces,x:number,z:number,y:number,R:number,colour:string){
 const n=8,c=[x,y+.012,z],tris:number[][]=[],p=(k:number)=>{const a=k/n*Math.PI*2,q=R*(.82+.3*spotHash(x+k,z,42));return [x+Math.cos(a)*q,y+.006,z+Math.sin(a)*q];};
 for(let k=0;k<n;k++)tris.push(c,p(k),p(k+1));P.add(colour,tris,[x,y-1,z],'soil');
}
/** A coconut lying in the sand / grass (an 8-face octahedron, squashed; decorative: dropped first on battery saver). */
export function coconut(P:Pieces,x:number,z:number,y:number,colour:string){
 const r=.085+.02*spotHash(x,z,43),c:[number,number,number]=[x,y+r*.55,z],tw=spotHash(z,x,44)*6.28,eq=[0,1,2,3].map(k=>[x+Math.cos(tw+k*1.5708)*r,y+r*.55,z+Math.sin(tw+k*1.5708)*r]),top=[x,y+r*1.35,z],bot=[x,y-.02,z],tris:number[][]=[];
 for(let k=0;k<4;k++){tris.push(eq[k],eq[(k+1)%4],top,eq[(k+1)%4],eq[k],bot);}P.add(colour,tris,c,'coconut');
}
/** A fallen dry frond lying flat: a tapered blade with a slight curl (6 triangles, both faces; decorative). */
export function frond(P:Pieces,x:number,z:number,y:number,a:number,colour:string){
 const L=1.1+.5*spotHash(x,z,45),cx=Math.cos(a),cz=Math.sin(a),px=-cz,pz=cx,pt=(t:number,w:number)=>[x+cx*L*t+px*w,y+.018+.05*Math.sin(t*3.1),z+cz*L*t+pz*w];
 const s0=pt(0,0),l1=pt(.35,.16),r1=pt(.35,-.12),l2=pt(.75,.1),r2=pt(.75,-.08),tip=pt(1,0),tris=[s0,l1,r1,l1,l2,r1,r1,l2,r2,l2,tip,r2];
 const both:number[][]=[];for(let i=0;i<tris.length;i+=3)both.push(tris[i],tris[i+1],tris[i+2],tris[i],tris[i+2],tris[i+1]);P.add(colour,both,null,'frond');
}
/** A root flare round a trunk of radius r at (x, z): a 7-sided skirt widening into the ground plus 2-3 roots running out (~26 tris). */
export function rootFlare(P:Pieces,x:number,z:number,y:number,r:number,colour:string,at:(x:number,z:number)=>number=()=>y){
 const n=7,top=.32+.12*spotHash(x,z,14),R=r*1.75,tris:number[][]=[];
 for(let k=0;k<n;k++){const a0=k/n*Math.PI*2,a1=(k+1)/n*Math.PI*2,p=(a:number,q:number,h:number)=>{const px=x+Math.cos(a)*q,pz=z+Math.sin(a)*q;return [px,(h<0?at(px,pz):y)+h,pz];};
  tris.push(p(a0,r*.98,top),p(a1,r*.98,top),p(a1,R,-.03),p(a0,r*.98,top),p(a1,R,-.03),p(a0,R,-.03));}
 P.add(colour,tris,[x,y+top*.4,z],'flare');
 const roots=2+Math.floor(spotHash(x,z,15)*2);
 for(let i=0;i<roots;i++){const a=spotHash(x,z,16+i)*Math.PI*2,len=.45+.45*spotHash(z,x,17+i),w=r*.42,cx=Math.cos(a),cz=Math.sin(a),px=-cz,pz=cx,h=.14+.06*spotHash(x+i,z,18);
  const tx=x+cx*(r+len),tz=z+cz*(r+len),s0=[x+cx*r*.9+px*w,y-.02,z+cz*r*.9+pz*w],s1=[x+cx*r*.9-px*w,y-.02,z+cz*r*.9-pz*w],ridge=[x+cx*r*.95,y+h,z+cz*r*.95],tip=[tx,Math.min(y,at(tx,tz))-.03,tz];
  P.add(colour,[s0,ridge,tip,ridge,s1,tip],[x+cx*(r+len*.3),y-.3,z+cz*(r+len*.3)],'root');}
}
/** A thin slab (pad / skirting course): an axis box turned by yaw, outer faces + top only (no bottom; 10 triangles). */
export function slab(P:Pieces,cx:number,cz:number,hw:number,hd:number,yaw:number,y0:number,y1:number,colour:string,what:string,faces=15){
 const W=frame({kind:'prop',x:cx,z:cz,hw,hd,yaw}),c=[W(-hw,-hd),W(hw,-hd),W(hw,hd),W(-hw,hd)],tris:number[][]=[];
 const v=(i:number,y:number)=>[c[i][0],y,c[i][1]];tris.push(v(0,y1),v(1,y1),v(2,y1),v(0,y1),v(2,y1),v(3,y1));
 const bits=[1,2,4,8];for(let k=0;k<4;k++)if(faces&bits[k]){const a=k,b=(k+1)%4;tris.push(v(a,y0),v(b,y0),v(b,y1),v(a,y0),v(b,y1),v(a,y1));}
 P.add(colour,tris,[cx,(y0+y1)/2,cz],what);
}

// ---- The island pass (world.ts calls it once, after every prop has moved and before the batching pass) ----------------------------
type Rect={x:number;z:number;w:number;d:number};
export type GroundingInput={
 town:T.Object3D;
 buildings:readonly (Rect&{height:number;name:string;cornerRadius?:number})[];
 machines:readonly {x:number;z:number;y?:number;yaw:number;station?:boolean}[];machineSize:{w:number;d:number};
 stations:readonly {id:string;x:number;z:number;tx:number;tz:number;side:number;/** the line at u m along from the station's centre (curved platforms) */at?:(u:number)=>{x:number;z:number;tx:number;tz:number}}[];
 /** the drawn ground's height (the town's layered paving where it has one) */
 ground:(x:number,z:number)=>number;
 /** what the ground is: sand gets drifts, lawn tufts / stones, the rest neither */
 surface:(x:number,z:number)=>'sand'|'lawn'|'other';
 /** roads, paths, pitches: no detail piece lands here */
 keepClear:(x:number,z:number)=>boolean;
 covered?:GroundQuery['covered'];
 lift?:(x:number,z:number)=>number;
 /** catenary poles (trainWorld.ts catenaryFeet): a contact shade, and a sand mound round the footing on the beach */
 masts?:readonly {x:number;z:number;r:number}[];
 /** beach umbrella poles (untagged): a contact shade and a sand mound where the pole goes in */
 umbrellas?:readonly {x:number;z:number}[];
 sun:readonly [number,number];
 /** lowest heat tier: contact shade only */
 low:boolean;
 put:(g:T.BufferGeometry,colour:string,x:number,y:number,z:number)=>T.Mesh;
};
type Kind='tree'|'palm'|'bush'|'prop'|'post'|null;
const KIND:Record<string,Kind>={tree:'tree',palm:'palm',bush:'bush',bench:'prop',table:'prop',planter:'prop',stall:'prop',gashapon:'prop',crate:'prop',
 lamp:'post',pole:'post',signal:'post',flag:'post',sign:'post',post:'post',bollard:'post',lifebuoy:'post'};
export const GROUND_COLOURS={sand:'#d9b06c',stone:'#8f877a',stoneLight:'#a79f90',grass:'#5d7f4a',grassLight:'#7c9a57',pad:'#b9b1a2',soil:'#6f5b41',coconut:'#6b4a2b',frond:'#a8915a'} as const;
export type GroundingStats={feet:number;decalTriangles:number;skipped:number;detailTriangles:number;pieces:Record<string,number>;ms:number;byKind:Record<string,number>};
export const groundingStats:{value:GroundingStats|null;feet:Foot[];spans:{kind:string;x:number;z:number}[]}={value:null,feet:[],spans:[]};

export function buildGrounding(I:GroundingInput):{decal:T.Mesh|null;stats:GroundingStats}{
 const t0=typeof performance!=='undefined'?performance.now():0,feet:Foot[]=[],byKind:Record<string,number>={},P=new Pieces(),bb=new T.Box3(),v=new T.Vector3();
 const push=(f:Foot)=>{feet.push(f);byKind[f.kind]=(byKind[f.kind]??0)+1;};
 const spans:{s:Span;what:'wall'|'platform'}[]=[],gaps:Rect[]=[];sandDrifts.positions=[];sandDrifts.list=[];sandDrifts.mounds=[];
 // Things that must stay clear of detail: every machine's front (its use spot) and body.
 for(const m of I.machines){const fx=Math.sin(m.yaw),fz=Math.cos(m.yaw);gaps.push({x:m.x+fx*.7,z:m.z+fz*.7,w:2.2,d:2.2});}
 // 1. Props (tagged groups), after every move: the lowest 35 cm of each group is its foot.
 const groups=new Map<unknown,{kind:Kind;tag:string;meshes:T.Mesh[]}>();
 I.town.traverse(o=>{if(!(o instanceof T.Mesh)||o.userData.train||o.userData.depthOwn)return;const tag=o.userData.propTag as {kind:string}|undefined;if(!tag)return;const kind=KIND[tag.kind]??null;if(!kind)return;
  let g=groups.get(tag);if(!g)groups.set(tag,g={kind,tag:tag.kind,meshes:[]});g.meshes.push(o);});
 for(const [,g] of groups){let minY=Infinity;for(const m of g.meshes){bb.setFromObject(m);if(bb.min.y<minY)minY=bb.min.y;}
  const foot=new T.Box3();let colour:string|null=null,lowest=Infinity;
  for(const m of g.meshes){bb.setFromObject(m);if(bb.min.y>minY+.35)continue;
   if(g.kind==='tree'||g.kind==='palm'){const p=m.geometry.getAttribute('position');for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);if(v.y<minY+.35)foot.expandByPoint(v);}}
   else foot.union(bb);
   if(bb.min.y<lowest){lowest=bb.min.y;const c=(m.material as T.MeshStandardMaterial).color;colour=c?'#'+c.getHexString():null;}}
  if(foot.isEmpty())continue;const x=(foot.min.x+foot.max.x)/2,z=(foot.min.z+foot.max.z)/2,hw=(foot.max.x-foot.min.x)/2,hd=(foot.max.z-foot.min.z)/2,gy=I.ground(x,z);
  if(minY>gy+1.2||minY<gy-1)continue;// on a roof or under a deck: not ground
  const base=minY>gy+.25?minY:undefined;// on a deck or a pier: the ring lies on the deck
  if(g.kind==='tree'||g.kind==='palm'||g.kind==='bush'){const r=Math.max(.12,Math.min(hw,hd,.6));push({kind:g.kind,x,z,hw:r,hd:r,round:true,base,sink:gy-minY});
   if(!I.low&&g.kind==='tree'&&base===undefined&&colour&&r<.45&&!I.keepClear(x,z)){const l0=I.lift?I.lift(x,z):0;rootFlare(P,x,z,gy,r,colour,(px,pz)=>gy+(I.lift?clampLift(I.lift(px,pz)-l0):0));}
   // Grounding 2 (palms): a low sand mound on the beach, a ring of bare soil on the lawn; now and then a coconut or a fallen frond
   // (decorative: the lowest tier drops them first). The trunk itself sinks and flares in world.ts palmParts.
   if(g.kind==='palm'&&base===undefined&&!I.keepClear(x,z)){const kind=I.surface(x,z);
    if(kind==='sand'){sandMound(x,z,gy,.2,.62+.18*spotHash(x,z,46),.085+.03*spotHash(z,x,47));P.counts.mound=(P.counts.mound??0)+1;}
    else if(kind==='lawn')soilRing(P,x,z,gy,.5+.12*spotHash(x,z,46),GROUND_COLOURS.soil);
    if(!I.low&&kind!=='other'){const h=spotHash(x,z,48),ga=spotHash(z,x,49)*6.28;
     const spot=(a:number,d:number):[number,number]|null=>{const px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;return I.keepClear(px,pz)?null:[px,pz];};
     if(h<.3)for(let i=0;i<1+(h<.1?1:0);i++){const q=spot(ga+i*.9,.5+.45*spotHash(x+i,z,50));if(q)coconut(P,q[0],q[1],I.ground(q[0],q[1])+driftLift(q[0],q[1]),GROUND_COLOURS.coconut);}
     if(h>.82){const a=ga+2.4,q=spot(a,.35);if(q&&spot(a,1.5))frond(P,q[0],q[1],I.ground(q[0],q[1]),a,GROUND_COLOURS.frond);}}}}
  else if(g.kind==='post'){const long=Math.max(hw,hd)>2.2*Math.min(hw,hd);push(long?{kind:'post',x,z,hw:Math.max(hw,.06),hd:Math.max(hd,.06),fill:true,base}:{kind:'post',x,z,hw:Math.max(.07,Math.min(hw,hd)),hd:Math.max(.07,Math.min(hw,hd)),round:true,base});
   // Grounding 2: a single post (not a two-legged sign or a rail run) gets a sand mound on the beach or a concrete collar elsewhere
   // (lamps carry their own stepped plinth in world.ts; flags / signals on decks keep theirs).
   if(!long&&base===undefined&&g.tag!=='lamp'){const r=Math.max(.04,Math.min(hw,hd,.16)),kind=I.surface(x,z);
    if(kind==='sand'&&!I.keepClear(x,z)){sandMound(x,z,gy,r,Math.min(.5,r*2.6+.14),.055,7);P.counts.mound=(P.counts.mound??0)+1;}
    else if(!I.low)collar(P,x,z,gy,r,GROUND_COLOURS.pad);}}
  else push({kind:'prop',x,z,hw,hd,fill:true,base});}
 // 1b. Catenary poles (train meshes are skipped above): the footing's shade, a sand mound on the beach.
 for(const m of I.masts??[]){const gy=I.ground(m.x,m.z);if(gy>m.r+5)continue;push({kind:'post',x:m.x,z:m.z,hw:m.r,hd:m.r,round:true});
  if(I.surface(m.x,m.z)==='sand'&&!I.keepClear(m.x,m.z)){sandMound(m.x,m.z,gy,m.r*1.3,.62,.07,8);P.counts.mound=(P.counts.mound??0)+1;}}
 for(const u of I.umbrellas??[]){const gy=I.ground(u.x,u.z);push({kind:'post',x:u.x,z:u.z,hw:.07,hd:.07,round:true});
  if(I.surface(u.x,u.z)==='sand'&&!I.keepClear(u.x,u.z)){sandMound(u.x,u.z,gy,.06,.36,.05,7);P.counts.mound=(P.counts.mound??0)+1;}}
 // 2. Vending machines (their own meshes, Town.tsx): a pad on the ground, a ring round it.
 for(const m of I.machines){const hw=I.machineSize.w/2,hd=I.machineSize.d/2,gy=I.ground(m.x,m.z),on=m.y===undefined||m.y<gy+.25;
  push({kind:'machine',x:m.x,z:m.z,hw,hd,yaw:m.yaw,fill:true,base:on?undefined:m.y});
  if(!I.low&&on&&!m.station)slab(P,m.x,m.z,hw+.09,hd+.09,m.yaw,gy-.06,Math.min(gy+.08,(m.y??gy+.1)+.02),GROUND_COLOURS.pad,'pad');}
 // 3. Buildings: the ring, a skirting course on the body's walls (cut where anything stands against the wall: doors, steps, benches).
 const cell=new Map<string,number[]>(),boxes:T.Box3[]=[];
 I.town.traverse(o=>{if(!(o instanceof T.Mesh)||o.userData.depthOwn)return;const b=new T.Box3().setFromObject(o);if(b.isEmpty())return;const i=boxes.push(b)-1;
  for(let cx=Math.floor(b.min.x/16);cx<=Math.floor(b.max.x/16);cx++)for(let cz=Math.floor(b.min.z/16);cz<=Math.floor(b.max.z/16);cz++){const k=cx+':'+cz,l=cell.get(k);if(l)l.push(i);else cell.set(k,[i]);}});
 const near=(r:Rect)=>{const out=new Set<number>();for(let cx=Math.floor((r.x-r.w/2)/16);cx<=Math.floor((r.x+r.w/2)/16);cx++)for(let cz=Math.floor((r.z-r.d/2)/16);cz<=Math.floor((r.z+r.d/2)/16);cz++)for(const i of cell.get(cx+':'+cz)??[])out.add(i);return [...out].map(i=>boxes[i]);};
 for(const b of I.buildings){const gy=I.ground(b.x,b.z);push({kind:'building',x:b.x,z:b.z,hw:b.w/2,hd:b.d/2});
  if(I.low||(b.cornerRadius??0)>.3)continue;
  const list=near({x:b.x,z:b.z,w:b.w+2,d:b.d+2});
  // the body: a mesh covering most of the footprint, standing on the ground, taller than 2 m
  const body=list.find(q=>q.min.y<gy+.4&&q.max.y-q.min.y>2&&(q.max.x-q.min.x)>b.w*.8&&(q.max.z-q.min.z)>b.d*.8&&(q.max.x-q.min.x)<b.w+.3&&(q.max.z-q.min.z)<b.d+.3);if(!body)continue;
  const x0=body.min.x,x1=body.max.x,z0=body.min.z,z1=body.max.z;
  const sides:[number,number,number,number,number,number][]=[[x0,z0,x1,z0,0,-1],[x1,z0,x1,z1,1,0],[x1,z1,x0,z1,0,1],[x0,z1,x0,z0,-1,0]];
  for(const [ax,az,bx,bz,ox,oz] of sides){const len=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/len,uz=(bz-az)/len,cuts:[number,number][]=[];
   // anything (not the body, not a roof overhead) that reaches within 30 cm of this wall's foot cuts the course there
   const bx0=ox?(ox>0?x1:x0-.3):Math.min(ax,bx),bx1=ox?(ox>0?x1+.3:x0):Math.max(ax,bx),bz0=oz?(oz>0?z1:z0-.3):Math.min(az,bz),bz1=oz?(oz>0?z1+.3:z0):Math.max(az,bz);
   for(const q of list){if(q===body||q.min.y>gy+.6||q.max.y<gy+.15||(q.max.y-q.min.y<.3&&(q.max.x-q.min.x)*(q.max.z-q.min.z)>2))continue;// flat paving / lawn pieces do not cut; doors, steps, benches, planters do
    if(q.max.x<bx0||q.min.x>bx1||q.max.z<bz0||q.min.z>bz1)continue;
    const ta=(q.min.x-ax)*ux+(q.min.z-az)*uz,tb=(q.max.x-ax)*ux+(q.max.z-az)*uz;cuts.push([Math.min(ta,tb)-.15,Math.max(ta,tb)+.15]);}
   for(const g of gaps){const t=(g.x-ax)*ux+(g.z-az)*uz,o=(g.x-ax)*ox+(g.z-az)*oz;if(o>-.5&&o<1.6)cuts.push([t-1,t+1]);}
   cuts.sort((p,q)=>p[0]-q[0]);let t=0;const runs:[number,number][]=[];for(const c of cuts){if(c[0]>t)runs.push([t,Math.min(c[0],len)]);t=Math.max(t,c[1]);}if(t<len)runs.push([t,len]);
   for(const [r0,r1] of runs){if(r1-r0<.5)continue;const mx=ax+ux*(r0+r1)/2+ox*.012,mz=az+uz*(r0+r1)/2+oz*.012,hl=(r1-r0)/2,yaw=Math.atan2(-uz,ux),g0=I.ground(mx,mz);
    slab(P,mx,mz,hl,.035,yaw,g0-.06,g0+.24+.03*spotHash(b.x,b.z,20),GROUND_COLOURS.stone,'skirting',1|2|8);// outward is always local -z here
    spans.push({s:{a:[ax+ux*r0+ox*.047,az+uz*r0+oz*.047],b:[ax+ux*r1+ox*.047,az+uz*r1+oz*.047],o:[ox,oz]},what:'wall'});}}}
 // 4. Stations: the house (back and ends) and the platform (back past the house, and both ends) on the beach / lawn.
 for(const st of I.stations){const south=st.id==='south',v0=1.45,v1=south?8.1:5.45,sg=st.side,nx=st.tz*sg,nz=-st.tx*sg,yaw=Math.atan2(-st.tz,st.tx);
  // on the curve (the house, spans and drifts follow a bending platform: Coral Cay's ends sit 1.2 m off its centre's straight line)
  const P2=(u:number,vv:number):[number,number]=>{if(!st.at)return [st.x+st.tx*u+nx*vv,st.z+st.tz*u+nz*vv];const f=st.at(u);return [f.x+f.tz*sg*vv,f.z-f.tx*sg*vv];};
  // local +z is (-tz, tx) = -sg * outward: the back (far from the line) is local -z when sg = 1
  const back=sg>0?1:4;
  // The ring starts AT the platform's wall (v1, the 5 m pieces end at +-15.03), not at the buried footing's outer edge 0.42 m out:
  // a ring from there left an undarkened band between the wall and the shade, which read as a pale strip on the shaded side (owner
  // shot 143, Nov 26). The footing slope lies inside the ring now and darkens with it.
  // The perimeter follows the line (Coral Cay's platform bends 1.2 m over its length: a straight box left a pale gap at its ends).
  {const at=st.at??((u:number)=>({x:st.x+st.tx*u,z:st.z+st.tz*u,tx:st.tx,tz:st.tz})),H=PLATFORM_HW,path:Edge[]=[];
   const Q=(u:number,vv:number):{p:[number,number];t:[number,number];n:[number,number]}=>{const f=at(u),n:[number,number]=[f.tz*sg,-f.tx*sg];return {p:[f.x+n[0]*vv,f.z+n[1]*vv],t:[f.tx,f.tz],n};};
   const corner=(q:{p:[number,number]},a:[number,number],b:[number,number],sa:number,sb:number)=>{const l=Math.hypot(a[0]+b[0],a[1]+b[1])||1;
    path.push({p:q.p,o:a,side:sa|sb},{p:q.p,o:[(a[0]+b[0])/l,(a[1]+b[1])/l],side:sa|sb});};
   const N=12;// front (track side, bit 1, never shaded), +u end (2), back (4), -u end (8)
   {const q=Q(-H,v0);corner(q,[-q.t[0],-q.t[1]],[-q.n[0],-q.n[1]],8,1);}
   for(let i=0;i<N;i++){const q=Q(-H+2*H*i/N,v0);path.push({p:q.p,o:[-q.n[0],-q.n[1]],side:1});}
   {const q=Q(H,v0);corner(q,[-q.n[0],-q.n[1]],q.t,1,2);path.push({p:q.p,o:q.t,side:2});}
   {const q=Q(H,v1);corner(q,q.t,q.n,2,4);}
   for(let i=0;i<N;i++){const q=Q(H-2*H*i/N,v1);path.push({p:q.p,o:q.n,side:4});}
   {const q=Q(-H,v1);corner(q,q.n,[-q.t[0],-q.t[1]],4,8);path.push({p:q.p,o:[-q.t[0],-q.t[1]],side:8});}
   const c=P2(0,(v0+v1)/2);push({kind:'platform',x:c[0],z:c[1],hw:H,hd:(v1-v0)/2,yaw,sides:south?2|8:4|2|8,path});}
  if(!south){const hv0=v1-.3,hv1=v1+4.6+.3,c=P2(0,(hv0+hv1)/2);push({kind:'house',x:c[0],z:c[1],hw:4.3,hd:(hv1-hv0)/2,yaw,sides:back|2|8,fill:true});// fill: the sand seen under the raised deck's edge is in its shade
   const sp=(u0:number,va:number,u1:number,vb:number,o:[number,number],what:'wall'|'platform')=>spans.push({s:{a:P2(u0,va),b:P2(u1,vb),o},what});
   const out:[number,number]=[nx,nz],ta=st.at?st.at(15):st,tb=st.at?st.at(-15):st,along:[number,number]=[ta.tx,ta.tz],back2:[number,number]=[-tb.tx,-tb.tz];
   sp(-4.3,hv1+.02,-.95,hv1+.02,out,'wall');sp(.95,hv1+.02,4.3,hv1+.02,out,'wall');// the machine stands at the back's middle
   sp(4.32,hv1,4.32,hv0+.3,along,'wall');sp(-4.32,hv0+.3,-4.32,hv1,back2,'wall');
   sp(-15,v1+.44,-4.6,v1+.44,out,'platform');sp(4.6,v1+.44,15,v1+.44,out,'platform');
   sp(15.44,v1+.4,15.44,v0+.5,along,'platform');sp(-15.44,v0+.5,-15.44,v1+.4,back2,'platform');}
  else{const out:[number,number]=[st.tx,st.tz];spans.push({s:{a:P2(15.44,v0+.5),b:P2(15.44,v1),o:out},what:'platform'},{s:{a:P2(-15.44,v1),b:P2(-15.44,v0+.5),o:[-st.tx,-st.tz]},what:'platform'});}}
 // 5. Drifts on sand, tufts and stones on the lawn, along every span (split in seeded runs; never on a road / path, a door or a machine).
 if(!I.low)for(const {s,what} of spans){const len=Math.hypot(s.b[0]-s.a[0],s.b[1]-s.a[1]);if(len<.6)continue;const ux=(s.b[0]-s.a[0])/len,uz=(s.b[1]-s.a[1])/len;
  for(let t=.2+.6*spotHash(s.a[0],s.a[1],21);t<len-.4;){const run=Math.min(len-t,.9+2.2*spotHash(s.a[0]+t,s.a[1],22)),mx=s.a[0]+ux*(t+run/2)+s.o[0]*.3,mz=s.a[1]+uz*(t+run/2)+s.o[1]*.3;
   const kind=I.surface(mx,mz),clear=!I.keepClear(mx,mz)&&!I.keepClear(mx+s.o[0]*.4,mz+s.o[1]*.4)&&!gaps.some(g=>Math.abs(mx-g.x)<g.w/2&&Math.abs(mz-g.z)<g.d/2);
   if(clear&&kind==='sand'&&s.o[0]*I.sun[0]+s.o[1]*I.sun[1]>DRIFT_SUN&&spotHash(mx,mz,23)<.85){drift({a:[s.a[0]+ux*t,s.a[1]+uz*t],b:[s.a[0]+ux*(t+run),s.a[1]+uz*(t+run)],o:s.o},I.ground);P.counts.drift=(P.counts.drift??0)+1;}
   else if(clear&&kind==='lawn'&&spotHash(mx,mz,24)<.45){const n=1+Math.floor(spotHash(mz,mx,25)*3);
    for(let i=0;i<n;i++){const at=t+run*spotHash(mx+i,mz,26),out=.06+.22*spotHash(mx,mz+i,27),x=s.a[0]+ux*at+s.o[0]*out,z=s.a[1]+uz*at+s.o[1]*out,gy=I.ground(x,z);
     if(spotHash(x,z,28)<.72)tuft(P,x,z,gy,spotHash(x,z,29)<.5?GROUND_COLOURS.grass:GROUND_COLOURS.grassLight,.8+.5*spotHash(z,x,30));else stone(P,x,z,gy,spotHash(x,z,31)<.5?GROUND_COLOURS.stone:GROUND_COLOURS.stoneLight);}}
   t+=run+.3+1.2*spotHash(s.a[0],s.a[1]+t,32);}}
 // 6. Build: the one decal mesh, and the detail pieces as plain-paint meshes per colour and 50 m cell (the caller's batching merges them).
 const d=contactDecal(feet,{y:I.ground,lift:I.lift,covered:I.covered,sun:I.sun}),decal=d.triangles?decalMesh(d):null;
 for(const c of P.cells.values()){if(!c.pos.length)continue;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(c.pos,3));g.computeVertexNormals();
  const m=I.put(g,c.colour,c.x,0,c.z);m.userData.skipRoofObstacle=true;m.userData.groundDetail=true;if(c.tint.some(t=>t!==1))m.userData.vertexTint=new Float32Array(c.tint);}
 const stats:GroundingStats={feet:d.feet,decalTriangles:d.triangles,skipped:d.skipped,detailTriangles:P.triangles,pieces:P.counts,ms:Math.round(((typeof performance!=='undefined'?performance.now():0)-t0)*10)/10,byKind};
 groundingStats.value=stats;groundingStats.feet=feet;groundingStats.spans=spans.map(q=>({kind:q.what,x:(q.s.a[0]+q.s.b[0])/2,z:(q.s.a[1]+q.s.b[1])/2}));
 return {decal,stats};
}
