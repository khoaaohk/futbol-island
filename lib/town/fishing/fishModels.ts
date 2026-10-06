import * as T from 'three';
import {fishById,type FishShape} from './fishCatalog';

/**
 * SPECIES MODELS for the caught / reeled animal (Oct 5 2026, user: "make sure they are what they say they are and not shape
 * of just a fish … this example is not a shrimp").
 *
 * Every species gets its defining anatomy in the island's low-poly, flat-shaded, vertex-coloured style: a curled segmented
 * shrimp with a fan tail and antennae, an octopus with 8 curling arms, a squid with fins and 2 long tentacles, sharks with a
 * tall dorsal, heterocercal tail and gill slits, billfish bills, a mola's disc, an anglerfish's teeth and glowing lure …
 *
 * Heat (AGENTS.md, docs/performance-guide.md "Species models"):
 *  - ONE merged, non-indexed geometry per species (position, normal, color, glow), built the first time that species is
 *    caught and cached for the page (CPU copy kept; the visuals free the GPU buffers on dispose). No textures.
 *  - Drawn with ONE shared material per role (held / reeled) — 1 draw each instead of the old 6-mesh placeholder.
 *  - The tail wag / arm sway is a vertex-shader term (fishingVisuals `fishMaterial`), driven by the uniforms the existing
 *    per-frame code sets; no new loop.
 *
 * Model convention (the FishingVisuals contract): the mouth / front is at local (-0.5, 0, 0), the body runs along +X to the
 * tail at about +0.5, +Y is up, Z is the animal's left/right. Size is then scaled by the catch length.
 */
type V=[number,number,number];type C=[number,number,number];
export type ShadowKind='fish'|'shark'|'ray'|'octopus'|'crab';
export type SpeciesModel={
 geometry:T.BufferGeometry;
 /** Wag: displacement `dir * amp * w² * sin(phase - p·k)`, w = clamp((p·axis - start)/span, 0, 1). */
 anim:{axis:V;start:number;span:number;dir:V;k:V;amp:number};
 /** Extra rotation when held up (radians): x tips a flat animal's back toward the camera, z turns it (octopus arms down). */
 hold:{x:number;z:number};
 shadow:ShadowKind;
 triangles:number;
};

const hex=(h:string):C=>{const c=new T.Color(h);return [c.r,c.g,c.b];};
const mixC=(a:C,b:C,k:number):C=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
const shade=(a:C,k:number):C=>[a[0]*k,a[1]*k,a[2]*k];
const hash=(n:number)=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const cell=(x:number,y:number,z:number)=>hash(Math.floor(x)*7.13+Math.floor(y)*157.7+Math.floor(z)*31.9);
const clamp01=(v:number)=>Math.max(0,Math.min(1,v));
const PI=Math.PI;
const BLACK=hex('#16201f'),WHITE=hex('#fbf7ea'),TOOTH=hex('#fffbef');
function M(x=0,y=0,z=0,rx=0,ry=0,rz=0,s:number|V=1){const m=new T.Matrix4();const sc=typeof s==='number'?new T.Vector3(s,s,s):new T.Vector3(...s);return m.compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),sc);}
const MIRROR=new T.Matrix4().makeScale(1,1,-1);

type Paint=(t:number,up:number,side:number,x:number)=>C;
type Loft={x0:number;x1:number;n:number;sides:number;h:(t:number)=>number;w:(t:number)=>number;c:(t:number)=>number;paint:Paint;glow?:number};
const X=(L:Loft,t:number)=>L.x0+(L.x1-L.x0)*t;

/** Collects flat-shaded, vertex-coloured triangles through a transform stack. */
class Builder{
 pos:number[]=[];col:number[]=[];glo:number[]=[];
 private m=new T.Matrix4();private va=new T.Vector3();private vb=new T.Vector3();private vc=new T.Vector3();private e1=new T.Vector3();private e2=new T.Vector3();
 tri(p:V,q:V,r:V,c:C,g=0){
  const a=this.va.set(p[0],p[1],p[2]).applyMatrix4(this.m),b=this.vb.set(q[0],q[1],q[2]).applyMatrix4(this.m),d=this.vc.set(r[0],r[1],r[2]).applyMatrix4(this.m);
  if(this.e1.subVectors(b,a).cross(this.e2.subVectors(d,a)).lengthSq()<1e-12)return;
  this.pos.push(a.x,a.y,a.z,b.x,b.y,b.z,d.x,d.y,d.z);for(let k=0;k<3;k++){this.col.push(c[0],c[1],c[2]);this.glo.push(g);}
 }
 quad(p:V,q:V,r:V,s:V,c:C,g=0){this.tri(p,q,r,c,g);this.tri(p,r,s,c,g);}
 at(m:T.Matrix4,fn:()=>void){const old=this.m.clone();this.m.multiply(m);fn();this.m.copy(old);}
 /** Both sides: once as given, once mirrored across z=0. */
 pair(fn:(s:number)=>void){fn(1);this.at(MIRROR,()=>fn(-1));}
 /** A body lofted along +X: elliptical rings (half-height h, half-width w, centre height c). Paint is per face (toon patches). */
 loft(L:Loft){
  const ring=(i:number)=>{const t=i/L.n,x=X(L,t),h=L.h(t),w=L.w(t),c=L.c(t),r:V[]=[];for(let k=0;k<=L.sides;k++){const a=k/L.sides*PI*2;r.push([x,c+h*Math.cos(a),w*Math.sin(a)]);}return r;};
  let prev=ring(0);
  for(let i=0;i<L.n;i++){const next=ring(i+1),t=(i+.5)/L.n,x=X(L,t);
   for(let k=0;k<L.sides;k++){const a=(k+.5)/L.sides*PI*2,c=L.paint(t,Math.cos(a),Math.sin(a),x);this.quad(prev[k],next[k],next[k+1],prev[k+1],c,L.glow??0);}
   prev=next;}
  for(const [t,end] of [[0,X(L,0)],[1,X(L,1)]] as const){if(L.h(t)<1e-3)continue;const r=ring(t*L.n),ctr:V=[end,L.c(t),0];for(let k=0;k<L.sides;k++)this.tri(ctr,r[k],r[k+1],L.paint(t,Math.cos((k+.5)/L.sides*PI*2),Math.sin((k+.5)/L.sides*PI*2),end));}
  return L;
 }
 /** Flat polygon in the local XY plane (or XZ), any simple contour (concave is fine). */
 poly(pts:[number,number][],c:C,opt:{plane?:'xy'|'xz';z?:number;g?:number}={}){
  const clean:[number,number][]=[];for(const p of pts){const q=clean[clean.length-1];if(!q||Math.hypot(p[0]-q[0],p[1]-q[1])>1e-4)clean.push(p);}
  if(clean.length>2&&Math.hypot(clean[0][0]-clean[clean.length-1][0],clean[0][1]-clean[clean.length-1][1])<1e-4)clean.pop();
  if(clean.length<3)return;
  const v2=clean.map(p=>new T.Vector2(p[0],p[1]));const tris=T.ShapeUtils.triangulateShape(v2,[]);const z=opt.z??0;
  const P=(i:number):V=>opt.plane==='xz'?[clean[i][0],z,clean[i][1]]:[clean[i][0],clean[i][1],z];
  for(const [a,b,d] of tris)this.tri(P(a),P(b),P(d),c,opt.g??0);
 }
 /** A flat disc stuck on a surface (eyes, spots, gill slits). */
 decal(p:V,n:V,r:number,c:C,opt:{sides?:number;sx?:number;g?:number;lift?:number;rot?:number}={}){
  const N=new T.Vector3(...n).normalize();let u=new T.Vector3(1,0,0).addScaledVector(N,-N.x);if(u.lengthSq()<.01)u=new T.Vector3(0,1,0).addScaledVector(N,-N.y);u.normalize();const v=new T.Vector3().crossVectors(N,u);
  if(opt.rot){const cu=Math.cos(opt.rot),su=Math.sin(opt.rot),u2=u.clone().multiplyScalar(cu).addScaledVector(v,su);v.multiplyScalar(cu).addScaledVector(u,-su);u=u2;}
  const sides=opt.sides??6,sx=opt.sx??1,lift=opt.lift??.004,ctr:V=[p[0]+N.x*lift,p[1]+N.y*lift,p[2]+N.z*lift];
  const pt=(k:number):V=>{const a=k/sides*PI*2+(sides===4?PI/4:0),cu=Math.cos(a)*r*sx,sv=Math.sin(a)*r;return [ctr[0]+u.x*cu+v.x*sv,ctr[1]+u.y*cu+v.y*sv,ctr[2]+u.z*cu+v.z*sv];};
  for(let k=0;k<sides;k++)this.tri(ctr,pt(k),pt(k+1),c,opt.g??0);
 }
 /** A tube along a polyline (parallel-transport frames), radius r(t), optional flattening of the cross-section. */
 tube(path:V[],r:(t:number)=>number,sides:number,paint:(t:number,a:number)=>C,opt:{g?:number;flat?:number;up?:V}={}){
  const P=path.map(p=>new T.Vector3(...p)),n=P.length;if(n<2)return;
  const tan=P.map((p,i)=>new T.Vector3().subVectors(P[Math.min(n-1,i+1)],P[Math.max(0,i-1)]).normalize());
  let nrm=new T.Vector3(...(opt.up??[0,1,0]));if(Math.abs(nrm.dot(tan[0]))>.95)nrm.set(0,0,1);nrm.addScaledVector(tan[0],-nrm.dot(tan[0])).normalize();
  const rings:V[][]=[];
  for(let i=0;i<n;i++){if(i>0){nrm.addScaledVector(tan[i],-nrm.dot(tan[i]));if(nrm.lengthSq()<1e-8)nrm.set(0,1,0);nrm.normalize();}const bin=new T.Vector3().crossVectors(tan[i],nrm),rr=r(i/(n-1)),ring:V[]=[];
   for(let k=0;k<=sides;k++){const a=k/sides*PI*2,cu=Math.cos(a)*rr*(opt.flat??1),sv=Math.sin(a)*rr;ring.push([P[i].x+nrm.x*cu+bin.x*sv,P[i].y+nrm.y*cu+bin.y*sv,P[i].z+nrm.z*cu+bin.z*sv]);}
   rings.push(ring);}
  for(let i=0;i<n-1;i++)for(let k=0;k<sides;k++)this.quad(rings[i][k],rings[i+1][k],rings[i+1][k+1],rings[i][k+1],paint((i+.5)/(n-1),(k+.5)/sides*PI*2),opt.g??0);
  for(const i of [0,n-1]){if(r(i/(n-1))<1e-3)continue;const c:V=[P[i].x,P[i].y,P[i].z];for(let k=0;k<sides;k++)this.tri(c,rings[i][k],rings[i][k+1],paint(i/(n-1),0),opt.g??0);}
 }
 /** Low-poly ellipsoid. paint(up, side, front) with unit-sphere coordinates. */
 blob(c:V,r:V,ws:number,hs:number,paint:(up:number,side:number,fx:number)=>C,opt:{g?:number;jitter?:number;seed?:number}={}){
  const pt=(i:number,j:number):V=>{const th=i/hs*PI,ph=j/ws*PI*2,jt=opt.jitter&&i>0&&i<hs?1+(hash((opt.seed??1)*31+i*17+(j%ws)*3)-.5)*opt.jitter:1;return [c[0]+r[0]*Math.sin(th)*Math.cos(ph)*jt,c[1]+r[1]*Math.cos(th)*jt,c[2]+r[2]*Math.sin(th)*Math.sin(ph)*jt];};
  for(let i=0;i<hs;i++)for(let j=0;j<ws;j++){const th=(i+.5)/hs*PI,ph=(j+.5)/ws*PI*2,col=paint(Math.cos(th),Math.sin(th)*Math.sin(ph),Math.sin(th)*Math.cos(ph));this.quad(pt(i,j),pt(i+1,j),pt(i+1,j+1),pt(i,j+1),col,opt.g??0);}
 }
 bead(c:V,r:number,col:C,g=0){const p=(x:number,y:number,z:number):V=>[c[0]+x*r,c[1]+y*r,c[2]+z*r];const pts=[p(1,0,0),p(0,1,0),p(-1,0,0),p(0,-1,0)];for(let k=0;k<4;k++){this.tri(p(0,0,1),pts[k],pts[(k+1)%4],col,g);this.tri(p(0,0,-1),pts[(k+1)%4],pts[k],col,g);}}
 cone(base:V,tip:V,r:number,col:C,sides=4){this.tube([base,tip],t=>r*(1-t),sides,()=>col);}
 geometry(){
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.pos,3));g.setAttribute('color',new T.Float32BufferAttribute(this.col,3));g.setAttribute('glow',new T.Float32BufferAttribute(this.glo,1));
  g.computeVertexNormals();g.computeBoundingSphere();return g;
 }
}

const smoothPath=(pts:V[],n:number):V[]=>new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))).getPoints(n).map(v=>[v.x,v.y,v.z]);
/** Surface point and normal of a loft at body fraction t and ring angle a (0 = top, ±π/2 = sides). */
function surf(L:Loft,t:number,a:number,out=0):{p:V;n:V}{
 const x=X(L,t),h=L.h(t),w=L.w(t),c=L.c(t),n=new T.Vector3(0,Math.cos(a)/Math.max(h,.01),Math.sin(a)/Math.max(w,.01)).normalize();
 return {p:[x+n.x*out,c+h*Math.cos(a)+n.y*out,w*Math.sin(a)+n.z*out],n:[n.x,n.y,n.z]};
}
/** Nose → max → tail profile. q < 1 is a blunt, rounded head; q ≈ 1 a pointed snout. */
const profile=(H:number,peak:number,q:number,ped:number)=>(t:number)=>t<peak?H*Math.pow(1-(1-t/peak)**2,q):H*(ped+(1-ped)*Math.cos(PI/2*(t-peak)/(1-peak)));

type FinShape='tri'|'round'|'spiny'|'sickle'|'low'|'sail'|'square'|'rounded';
type FinSpec={t0:number;t1:number;h:number;shape:FinShape;c?:string;tip?:string;sweep?:number;spines?:number};
const FIN_HT:Record<FinShape,(u:number,i:number)=>number>={
 tri:u=>u<.4?u/.4:Math.pow((1-u)/.6,1.5),
 rounded:u=>Math.pow(Math.sin(PI*Math.min(1,u*1.05)),.7),
 round:u=>Math.pow(Math.sin(PI*u),.6),
 spiny:(u,i)=>Math.pow(Math.sin(PI*Math.min(1,u*1.1)),.35)*(i%2?.55:1),
 sickle:u=>u<.22?u/.22:Math.pow((1-u)/.78,2.4),
 low:u=>Math.min(1,u*7,(1-u)*7),
 sail:u=>u<.12?u/.12:1-.45*Math.pow((u-.12)/.88,1.6),
 square:u=>Math.min(1,u*6,(1-u)*3),
};
/** A median fin on the loft's top or belly line. */
function fin(b:Builder,L:Loft,f:FinSpec,where:'top'|'bottom',def:C){
 const s=where==='top'?1:-1,n=f.shape==='spiny'?(f.spines??8)*2+1:f.shape==='sail'||f.shape==='low'?14:8,col=f.c?hex(f.c):def,sweep=f.sweep??(f.shape==='tri'||f.shape==='sickle'?.55:.15);
 const base:[number,number][]=[],top:[number,number][]=[];
 const build=(lo:number,ht:(u:number,i:number)=>number)=>{base.length=0;top.length=0;
  for(let i=0;i<n;i++){const u=i/(n-1),t=f.t0+(f.t1-f.t0)*u,x=X(L,t),y=L.c(t)+s*L.h(t)*.88,hh=f.h*ht(u,i);base.push([x+sweep*hh*lo,y+s*hh*lo]);top.push([x+sweep*hh,y+s*hh]);}
  return [...base,...top.reverse()];};
 b.poly(build(0,FIN_HT[f.shape]),col);
 if(f.tip){const tc=hex(f.tip);for(const z of [.003,-.003])b.poly(build(.62,FIN_HT[f.shape]),tc,{z});}
}
type TailKind='fork'|'crescent'|'round'|'square'|'shark'|'lunate'|'thresher'|'tri'|'clavus'|'none'|'slight';
function tail(b:Builder,L:Loft,kind:TailKind,TH:number,col:C,tip?:C){
 if(kind==='none')return;
 const xb=X(L,1)-.025,p=Math.max(.012,L.h(1)),TL=.5-xb,cy=L.c(1);
 const sh:Record<Exclude<TailKind,'none'>,[number,number][]>={
  fork:[[0,p],[TL*.5,TH*.62],[TL,TH],[TL*.72,TH*.28],[TL*.46,0],[TL*.72,-TH*.28],[TL,-TH],[TL*.5,-TH*.62],[0,-p]],
  slight:[[0,p],[TL*.55,TH*.75],[TL,TH],[TL*.82,0],[TL,-TH],[TL*.55,-TH*.75],[0,-p]],
  crescent:[[0,p*.8],[TL*.3,TH*.45],[TL*.72,TH*.92],[TL,TH*1.08],[TL*.62,TH*.42],[TL*.48,0],[TL*.62,-TH*.42],[TL,-TH*1.08],[TL*.72,-TH*.92],[TL*.3,-TH*.45],[0,-p*.8]],
  round:[[0,p],[TL*.4,TH*.75],[TL*.78,TH*.82],[TL*.98,TH*.45],[TL,0],[TL*.98,-TH*.45],[TL*.78,-TH*.82],[TL*.4,-TH*.75],[0,-p]],
  square:[[0,p],[TL*.55,TH*.85],[TL,TH],[TL*.96,0],[TL,-TH],[TL*.55,-TH*.85],[0,-p]],
  shark:[[0,p],[TL*.55,TH*.82],[TL,TH*1.3],[TL*.9,TH*1.08],[TL*.74,TH*.5],[TL*.58,TH*.18],[TL*.4,-TH*.04],[TL*.5,-TH*.6],[TL*.24,-TH*.42],[0,-p]],
  lunate:[[0,p],[TL*.45,TH*.6],[TL,TH*1.25],[TL*.72,TH*.55],[TL*.5,0],[TL*.72,-TH*.5],[TL*.95,-TH*1.05],[TL*.42,-TH*.55],[0,-p]],
  thresher:[[0,p],[TL*.45,TH*.32],[TL,TH*.62],[TL*.97,TH*.5],[TL*.42,TH*.1],[TL*.16,-TH*.04],[TL*.2,-TH*.5],[TL*.06,-TH*.3],[0,-p]],
  tri:[[0,p],[TL*.32,TH],[TL*.62,TH*.42],[TL*.7,TH*.14],[TL,TH*.12],[TL,-TH*.12],[TL*.7,-TH*.14],[TL*.62,-TH*.42],[TL*.32,-TH],[0,-p]],
  clavus:[[0,p],[TL*.45,p*.98],[TL*.75,p*.8],[TL*.6,p*.55],[TL,p*.42],[TL*.72,p*.18],[TL,0],[TL*.72,-p*.18],[TL,-p*.42],[TL*.6,-p*.55],[TL*.75,-p*.8],[TL*.45,-p*.98],[0,-p]],
 };
 const pts=sh[kind],maxY=Math.max(...pts.map(p=>Math.abs(p[1])));
 b.at(M(xb,cy,0),()=>{b.poly(pts,col);
  // Coloured lobe tips (blacktip, whitetip): a small triangle at each lobe's point.
  if(tip)pts.forEach((p,i)=>{if(Math.abs(p[1])<maxY*.85)return;const a=pts[i-1],c=pts[i+1];if(!a||!c)return;const tri:[number,number][]=[p,[p[0]+(a[0]-p[0])*.4,p[1]+(a[1]-p[1])*.4],[p[0]+(c[0]-p[0])*.4,p[1]+(c[1]-p[1])*.4]];for(const z of [.003,-.003])b.poly(tri,tip,{z});});});
}
/** Paired pectoral (or pelvic) fins: a leaf at the body side, swept back and drooping. */
function pectoral(b:Builder,L:Loft,t:number,len:number,col:C,o:{a?:number;droop?:number;sweep?:number;wide?:number;tip?:C;round?:boolean}={}){
 const leaf:[number,number][]=o.round?[[0,0],[len*.2,len*.42*(o.wide??1)],[len*.7,len*.55*(o.wide??1)],[len,len*.25*(o.wide??1)],[len*.85,-.01]]:[[0,0],[len*.3,len*.42*(o.wide??1)],[len,len*.32*(o.wide??1)],[len*.72,-.01]];
 b.pair(()=>{const {p}=surf(L,t,o.a??1.95);b.at(M(p[0],p[1],p[2]*.92,o.droop??.55,-(o.sweep??.45),0),()=>{b.poly(leaf,col,{plane:'xz'});if(o.tip)b.poly(leaf.map(([x,z]):[number,number]=>[len*.62+x*.38,z*.6+.004]),o.tip,{plane:'xz',z:.003});});});
}
function eyes(b:Builder,L:Loft,t:number,a:number,r:number,o:{iris?:C;ring?:C;bead?:boolean;g?:number}={}){
 b.pair(()=>{const {p,n}=surf(L,t,a);if(o.bead){b.bead([p[0],p[1],p[2]+r*.3],r,o.iris??BLACK,o.g??0);return;}b.decal(p,n,r,o.ring??WHITE,{sides:7});b.decal(p,n,r*.58,o.iris??BLACK,{sides:6,lift:.007,g:o.g});});
}
/** A thin line drawn on both flanks (cod's pale and haddock's black lateral lines). up(t) = cos of the ring angle. */
function lateralLine(b:Builder,L:Loft,t0:number,t1:number,up:(t:number)=>number,r:number,col:C){
 b.pair(()=>{const pts:V[]=[];for(let i=0;i<=14;i++){const t=t0+(t1-t0)*i/14;pts.push(surf(L,t,Math.acos(up(t)),.002).p);}b.tube(pts,()=>r,3,()=>col);});
}
function finlets(b:Builder,L:Loft,t0:number,t1:number,n:number,col:C,sz:number){
 for(let i=0;i<n;i++){const t=t0+(t1-t0)*i/(n-1),x=X(L,t);for(const s of [1,-1]){const y=L.c(t)+s*L.h(t)*.85;b.poly([[x-sz*.6,y],[x+sz*.9,y+s*sz*1.1],[x+sz*.5,y]],col);}}
}
const countershade=(top:C,side:C,belly:C,line=.15):Paint=>(_t,up)=>up>line+.25?top:up>line?mixC(side,top,.5):up>-.45?side:belly;

type FishOpts={x1:number;H:number;W:number;peak?:number;q?:number;ped?:number;sag?:number;n?:number;sides?:number;c?:(t:number)=>number;
 top:string;side?:string;belly:string;line?:number;paint?:(base:C,t:number,up:number,side:number,x:number)=>C;
 tail:TailKind;tailH?:number;tailC?:string;finC?:string;dorsal?:FinSpec[];anal?:FinSpec[];
 pect?:{t:number;len:number;a?:number;droop?:number;sweep?:number;wide?:number;c?:string;round?:boolean};pelvic?:{t:number;len:number;c?:string};
 eye?:{t:number;a?:number;r:number;iris?:string;ring?:string};mouth?:{t:number;len:number;a?:number;c?:string}};
/** The shared bony-fish body: loft + median fins + tail + pectorals + eyes + mouth line. */
function fish(b:Builder,o:FishOpts){
 const top=hex(o.top),side=hex(o.side??o.belly),belly=hex(o.belly),base=countershade(top,side,belly,o.line??.15),finC=hex(o.finC??o.top);
 const L:Loft={x0:-.5,x1:o.x1,n:o.n??16,sides:o.sides??10,h:profile(o.H,o.peak??.35,o.q??.6,o.ped??.15),w:profile(o.W,o.peak??.35,o.q??.6,(o.ped??.15)*.7),c:o.c??(t=>-(o.sag??0)*Math.sin(PI*t)),
  paint:(t,up,sd,x)=>{const c=base(t,up,sd,x);return o.paint?o.paint(c,t,up,sd,x):c;}};
 b.loft(L);
 for(const f of o.dorsal??[])fin(b,L,f,'top',finC);
 for(const f of o.anal??[])fin(b,L,f,'bottom',finC);
 tail(b,L,o.tail,o.tailH??o.H*1.05,o.tailC?hex(o.tailC):finC);
 if(o.pect)pectoral(b,L,o.pect.t,o.pect.len,o.pect.c?hex(o.pect.c):mixC(finC,side,.4),o.pect);
 if(o.pelvic)pectoral(b,L,o.pelvic.t,o.pelvic.len,o.pelvic.c?hex(o.pelvic.c):mixC(finC,belly,.4),{a:2.6,droop:1.1,sweep:.5});
 if(o.mouth){const m=o.mouth;b.pair(()=>{const {p,n}=surf(L,m.t,m.a??1.75);b.decal(p,n,m.len*.3,hex(m.c??'#2a2422'),{sides:4,sx:3.2,lift:.004});});}
 if(o.eye)eyes(b,L,o.eye.t,o.eye.a??1.05,o.eye.r,{iris:o.eye.iris?hex(o.eye.iris):undefined,ring:o.eye.ring?hex(o.eye.ring):undefined});
 return L;
}
/** A row of decal spots on both flanks. */
function spots(b:Builder,L:Loft,list:[number,number,number][],col:C,g=0,sides=6){b.pair(()=>{for(const [t,a,r] of list){const {p,n}=surf(L,t,a);b.decal(p,n,r,col,{sides,g});}});}
function barbel(b:Builder,from:V,to:V,r:number,col:C){b.tube(smoothPath([from,[(from[0]+to[0])/2-.01,(from[1]+to[1])/2-.01,(from[2]+to[2])/2],to],4),t=>r*(1-t*.7),3,()=>col);}
function teethRow(b:Builder,L:Loft,t0:number,t1:number,a:number,n:number,size:number,down=true){
 b.pair(()=>{for(let i=0;i<n;i++){const t=t0+(t1-t0)*i/Math.max(1,n-1),{p}=surf(L,t,a,.002),z=p[2]+.002,s=down?-1:1;b.poly([[p[0]-size*.5,p[1]],[p[0],p[1]+s*size*1.6],[p[0]+size*.5,p[1]]],TOOTH,{z});}});
}

// ---------------------------------------------------------------- sharks
type SharkOpts={top:string;belly:string;H?:number;W?:number;x1?:number;q?:number;peak?:number;dorsal?:number;dorsalT?:number;d2?:number;d2T?:number;pect?:number;pectWide?:number;
 tail?:'shark'|'lunate'|'thresher';tailH?:number;tip?:string;roundFins?:boolean;teeth?:boolean;gills?:number;line?:number;paint?:(base:C,t:number,up:number,side:number,x:number)=>C;sag?:number;n?:number};
function shark(b:Builder,o:SharkOpts){
 const top=hex(o.top),belly=hex(o.belly),H=o.H??.1,line=o.line??-.15,tip=o.tip?hex(o.tip):undefined;
 const L:Loft={x0:-.5,x1:o.x1??.2,n:o.n??16,sides:10,h:profile(H,o.peak??.32,o.q??.75,.13),w:profile(o.W??H*.9,o.peak??.32,o.q??.75,.1),c:t=>-(o.sag??0)*Math.sin(PI*t)+H*.08*(1-t),
  paint:(t,up,sd,x)=>{const c=up>line+.12?top:up>line?mixC(top,belly,.5):belly;return o.paint?o.paint(c,t,up,sd,x):c;}};
 b.loft(L);
 const finC=shade(top,.92);
 fin(b,L,{t0:o.dorsalT??.36,t1:(o.dorsalT??.36)+.17,h:o.dorsal??H*1.25,shape:o.roundFins?'rounded':'tri',sweep:o.roundFins?.25:.6,tip:o.tip},'top',finC);
 if(o.d2!==0)fin(b,L,{t0:o.d2T??.8,t1:(o.d2T??.8)+.07,h:o.d2??H*.4,shape:'tri',sweep:.5},'top',finC);
 fin(b,L,{t0:.78,t1:.85,h:H*.32,shape:'tri',sweep:.5},'bottom',finC);
 fin(b,L,{t0:.58,t1:.66,h:H*.38,shape:'tri',sweep:.5},'bottom',finC);
 tail(b,L,o.tail??'shark',o.tailH??H*1.35,finC,tip);
 pectoral(b,L,.3,o.pect??.24,finC,{a:2.05,droop:.5,sweep:.55,wide:o.pectWide??1,tip,round:o.roundFins});
 // Five gill slits (hammerheads and whale sharks too), a dark crescent mouth underneath, a dark eye.
 b.pair(()=>{for(let k=0;k<(o.gills??5);k++){const {p,n}=surf(L,.19+k*.022,1.5);b.decal(p,n,H*.32,shade(top,.55),{sides:4,sx:.13});}
  const m=surf(L,.075,2.45);b.decal(m.p,m.n,H*.3,hex('#3a2a2a'),{sides:5,sx:1.7});});
 if(o.teeth)teethRow(b,L,.045,.1,2.35,4,.014);
 eyes(b,L,.095,1.2,H*.12,{bead:true,iris:hex('#101818')});
 return L;
}

// ---------------------------------------------------------------- billfish / tuna family
function scombrid(b:Builder,o:{top:string;belly:string;side?:string;H:number;W:number;x1?:number;finlet:string;d1?:FinSpec;d2:FinSpec;a1:FinSpec;pect?:number;paint?:FishOpts['paint']}){
 const L=fish(b,{x1:o.x1??.3,H:o.H,W:o.W,peak:.42,q:.72,ped:.07,n:20,sides:12,top:o.top,side:o.side,belly:o.belly,line:.05,paint:o.paint,tail:'crescent',tailH:o.H*1.5,
  dorsal:[o.d1??{t0:.3,t1:.48,h:o.H*.6,shape:'spiny',spines:6},o.d2],anal:[o.a1],pect:{t:.33,len:o.pect??.14,a:1.7,droop:.25,sweep:.7,wide:.6},pelvic:{t:.38,len:.05},eye:{t:.12,r:o.H*.18},mouth:{t:.04,len:o.H*.25,a:1.85}});
 finlets(b,L,.74,.96,6,hex(o.finlet),.016);
 // Keels on the narrow tail stock.
 b.pair(()=>{const {p}=surf(L,.97,PI/2);b.poly([[p[0]-.04,p[1]],[p[0],p[1]+.01],[p[0]+.04,p[1]],[p[0],p[1]-.01]],shade(hex(o.top),.8),{z:p[2]+.004});});
 return L;
}
function billfish(b:Builder,o:{top:string;belly:string;H:number;bill:'flat'|'spear';sail?:boolean;dorsal:FinSpec;bars?:string;spots?:boolean}){
 const top=hex(o.top),bar=o.bars?hex(o.bars):null;
 const L=fish(b,{x1:.3,H:o.H,W:o.H*.62,peak:.4,q:.8,ped:.07,n:20,sides:10,top:o.top,belly:o.belly,line:-.05,tail:'crescent',tailH:o.H*1.75,c:t=>-.006*Math.sin(PI*t),
  paint:bar?(c,t,up)=>up>-.4&&t>.2&&t<.85&&Math.sin(t*58)>.45?mixC(c,bar,.75):c:undefined,
  dorsal:[o.dorsal,{t0:.86,t1:.9,h:o.H*.3,shape:'tri'}],anal:[{t0:.55,t1:.66,h:o.H*.8,shape:'sickle',sweep:.7},{t0:.86,t1:.9,h:o.H*.28,shape:'tri'}],
  pect:{t:.22,len:.16,a:2,droop:.6,sweep:.7,wide:.55},eye:{t:.1,r:o.H*.2},mouth:{t:.03,len:o.H*.22,a:1.9}});
 // Shift the body back so the bill tip sits at -0.5: the body is drawn from -.5 already, so the bill points beyond … instead
 // we draw the bill from the snout forward and let the whole model be translated by the caller (see BILL).
 const bx=-.5,len=BILL;
 if(o.bill==='flat')b.loft({x0:bx-len,x1:bx+.04,n:4,sides:6,h:t=>.006+t*.01,w:t=>.012+t*.022,c:t=>.005*(1-t),paint:()=>shade(top,.75)});
 else b.tube([[bx-len,.012,0],[bx+.03,.006,0]],t=>.004+t*.012,5,()=>shade(top,.7));
 if(o.spots)b.pair(()=>{for(let i=0;i<9;i++){const t=o.dorsal.t0+(o.dorsal.t1-o.dorsal.t0)*(.1+i*.09),x=X(L,t),y=L.c(t)+L.h(t)*.88+o.dorsal.h*(.35+.3*(i%2));b.decal([x+.04,y,.004],[0,0,1],.012,hex('#152a4f'),{sides:5});}});
 return L;
}
const BILL=.32;

// ---------------------------------------------------------------- shapes that are not a fish body
function shrimp(b:Builder,o:{body:string;belly:string;speckle:string}){
 const body=hex(o.body),belly=hex(o.belly),spk=hex(o.speckle),dark=shade(body,.72);
 const sp=(t:number,a:number,base:C)=>hash(Math.floor(t*40)*13+Math.floor(a*3))>.78?spk:base;
 // Carapace: a smooth shield over the head, pointed rostrum forward.
 b.loft({x0:-.42,x1:-.05,n:8,sides:9,h:t=>.1*Math.pow(Math.sin(PI*(.15+t*.75)),.6),w:t=>.08*Math.pow(Math.sin(PI*(.15+t*.75)),.6),c:t=>.03+t*.01,paint:(t,up,_s,x)=>sp(t,up+x,up>-.3?body:belly)});
 b.cone([-.4,.06,0],[-.5,.05,0],.018,body,4);
 // Abdomen: six tapering segments curling down and forward under the body (the shrimp's curl), seams darker.
 const path=smoothPath([[-.08,.04,0],[.06,.07,0],[.18,.05,0],[.27,-.02,0],[.31,-.12,0],[.27,-.21,0],[.18,-.26,0]],24);
 b.tube(path,t=>.088*(1-t*.55)*(1-.1*Math.pow(Math.abs(Math.sin(t*PI*6)),8)),9,(t,a)=>{const seg=(t*6)%1;return seg<.12?dark:sp(t,a,Math.cos(a)>-.25?body:belly);},{up:[0,1,0]});
 // Fan tail: telson and two uropods each side, spread like a fan.
 const end=new T.Vector3(...path[path.length-1]),dir=new T.Vector3(...path[path.length-1]).sub(new T.Vector3(...path[path.length-3])).normalize(),ang=Math.atan2(dir.y,dir.x);
 b.at(M(end.x,end.y,end.z,0,0,ang),()=>{for(const [spread,lenK] of [[0,1],[.38,.95],[-.38,.95],[.7,.8],[-.7,.8]] as const)b.at(M(0,0,0,.9,spread,0),()=>b.poly([[0,0],[.06*lenK,.035],[.13*lenK,.02],[.14*lenK,-.01],[.06*lenK,-.03]],spread===0?dark:mixC(body,belly,.35),{plane:'xz'}));});
 // Long whip antennae sweeping back over the body, short antennules and the flat antennal scales.
 b.pair(s=>{b.tube(smoothPath([[-.4,.05,.03],[-.5,.13,.05],[-.38,.24,.07],[-.05,.27,.08],[.3,.2,.1],[.55,.08,.12]],18),t=>.007*(1-t*.6),3,()=>dark);
  b.tube(smoothPath([[-.41,.04,.02],[-.5,.08,.04],[-.56,.11,.05]],5),t=>.005,3,()=>dark);
  b.at(M(-.43,.02,.05,.3,.25,0),()=>b.poly([[0,0],[-.09,.012],[-.11,-.01],[-.02,-.02]],mixC(body,belly,.5),{plane:'xz'}));
  void s;
  // Eyes on short stalks.
  b.tube([[-.36,.08,.03],[-.39,.115,.055]],()=>.012,4,()=>body);b.bead([-.39,.12,.06],.024,BLACK);
  // Five pairs of thin walking legs and the swimmerets under the tail.
  for(let i=0;i<5;i++){const x=-.32+i*.06;b.tube(smoothPath([[x,-.04,.03],[x-.02,-.1,.06],[x-.05,-.16,.07]],4),()=>.006,3,()=>mixC(body,belly,.5));}
  for(let i=0;i<5;i++){const p=path[3+i*3];b.tube([[p[0],p[1]-.06,.025],[p[0]-.035,p[1]-.11,.04]],()=>.008,3,()=>belly);}
 });
}
function octopus(b:Builder,o:{body:string;belly:string}){
 const body=hex(o.body),pale=hex(o.belly),dark=shade(body,.78);
 // Mantle (the "head" sac) leads at -X; the eyes sit on bumps where it meets the arms.
 b.blob([-.3,.05,0],[.2,.15,.15],10,7,(up,_s,fx)=>fx<-.3&&up>.2?mixC(body,pale,.15):cell(up*4,fx*4,3)>.82?dark:body,{jitter:.08,seed:4});
 b.pair(()=>{b.blob([-.12,.07,.09],[.06,.055,.05],6,4,()=>body);b.decal([-.11,.09,.135],[0,.3,1],.026,hex('#f3e2b0'),{sides:6});b.decal([-.11,.09,.135],[0,.3,1],.016,BLACK,{sides:4,sx:1.6,lift:.008});});
 // Eight arms from the crown, trailing back and curling at the tips, pale suckers on the inner side.
 for(let i=0;i<8;i++){const a=(i+.5)/8*PI*2,ca=Math.cos(a),sa=Math.sin(a),len=.5+.06*hash(i);const pts:V[]=[];
  for(let k=0;k<=12;k++){const u=k/12,x=-.08+u*len,rad=.07+u*.12;let cy=ca*rad,cz=sa*rad;
   // The last third curls back inward.
   const curl=Math.max(0,(u-.62)/.38)*PI*(1.2+.3*(i%2));const r2=rad-.05*Math.sin(curl);cy=ca*r2;cz=sa*r2;pts.push([x-Math.sin(curl)*.05,cy+(-.02)+Math.sin(u*PI*2+i)*.02,cz]);}
  b.tube(smoothPath(pts,14),t=>.045*(1-t*.85),5,(t,ang)=>Math.cos(ang)<-.4&&t>.1&&Math.floor(t*14)%2===0?pale:body);}
}
function squid(b:Builder,o:{body:string;belly:string}){
 const body=hex(o.body),pale=hex(o.belly),dot=shade(body,.7);
 // Long mantle trailing to a point at +X with two diamond fins; head with big eyes; arms forward (toward the hook).
 b.loft({x0:-.16,x1:.5,n:12,sides:9,h:t=>.075*Math.pow(1-t,.55)+.002,w:t=>.07*Math.pow(1-t,.55)+.002,c:()=>0,paint:(t,up)=>up<-.3?pale:cell(t*14,up*3,1)>.7?dot:body});
 b.pair(()=>b.poly([[.22,0],[.37,.13],[.5,0],[.4,0]],shade(body,.95),{plane:'xz'}));
 b.blob([-.21,0,0],[.07,.06,.06],8,5,(up)=>up<-.3?pale:body);
 b.pair(()=>{b.decal([-.21,.015,.058],[0,.2,1],.032,WHITE,{sides:7});b.decal([-.21,.015,.058],[0,.2,1],.02,BLACK,{sides:6,lift:.008});});
 for(let i=0;i<8;i++){const a=(i+.5)/8*PI*2,ca=Math.cos(a),sa=Math.sin(a);
  b.tube(smoothPath([[-.26,ca*.03,sa*.03],[-.36,ca*.045,sa*.045],[-.44,ca*.04+.01,sa*.04],[-.47,ca*.025+.02,sa*.02]],8),t=>.016*(1-t*.8),4,()=>body);}
 // Two long feeding tentacles with clubs.
 b.pair(()=>{b.tube(smoothPath([[-.26,-.01,.012],[-.4,-.04,.03],[-.52,-.03,.05],[-.6,.0,.06]],10),()=>.008,4,()=>body);b.blob([-.63,.005,.062],[.04,.014,.02],6,3,()=>shade(body,.9));});
}
function ray(b:Builder,o:{top:string;belly:string;cownose?:boolean;spine?:boolean;spots?:string}){
 const top=hex(o.top),belly=hex(o.belly);
 // Outline radius per bearing (0 = forward, -X): a diamond for stingrays; swept, pointed wings and a notched snout for cownose.
 const outline=(th:number)=>{const c=Math.cos(th),s=Math.abs(Math.sin(th));
  // An L1 "diamond": front/back half-length a, half-span b, slightly rounded.
  const a=o.cownose?(c>0?.2:.16):(c>0?.27:.22),bb=o.cownose?.58:.5;return 1/(Math.abs(c)/a+s/bb)*(1+.06*Math.sin(2*Math.atan2(s,c))**2);};
 const cx=-.2,N=24,R=[0,.35,.7,1],hump=o.cownose?.07:.05;
 const pt=(i:number,k:number,up:number):V=>{const th=k/N*PI*2,r=outline(th)*R[i],sweep=Math.pow(Math.abs(Math.sin(th)),4)*R[i]*(o.cownose?.2:.08);return [cx-Math.cos(th)*r+sweep,up*hump*(1-R[i]*R[i])*(up>0?1:.45),Math.sin(th)*r];};
 for(const up of [1,-1])for(let i=0;i<R.length-1;i++)for(let k=0;k<N;k++){const c=up>0?(o.spots&&hash(i*40+k)>.7?hex(o.spots):i===0?shade(top,1.06):top):belly;
  if(up>0)b.quad(pt(i,k,up),pt(i+1,k,up),pt(i+1,k+1,up),pt(i,k+1,up),c);else b.quad(pt(i,k,up),pt(i,k+1,up),pt(i+1,k+1,up),pt(i+1,k,up),c);}
 if(o.cownose){b.blob([-.43,.0,0],[.07,.05,.11],7,4,()=>top);b.pair(()=>b.blob([-.49,-.02,.05],[.035,.02,.05],5,3,()=>shade(top,.92)));}
 // Eyes and spiracles on top, the long whip tail behind.
 b.pair(()=>{b.bead([o.cownose?-.4:-.33,hump*.8,.07],.02,BLACK);b.decal([-.25,hump*.85,.06],[0,1,0],.014,shade(top,.6),{sides:5});});
 b.tube(smoothPath([[.02,0,0],[.2,.0,0],[.36,.02,0],[.55,.04,0],[.72,.06,0]],10),t=>.022*(1-t*.9),4,()=>shade(top,.85));
 if(o.spine)b.poly([[.18,.02],[.3,.05],[.3,.025]],hex('#f0e7c8'),{z:0});
}
function crab(b:Builder,o:{body:string;belly:string;claw:string;tip?:string;kind:'edible'|'swimming'|'blue'|'coconut'}){
 const body=hex(o.body),belly=hex(o.belly),claw=hex(o.claw),tip=hex(o.tip??'#1a1a1a'),leg=mixC(body,belly,.25);
 const wide=o.kind==='blue'?.36:o.kind==='coconut'?.2:.3,lenX=o.kind==='coconut'?.17:.17;
 // Carapace (pie-crust scallops on the edible crab, side spines on the blue crab), the coconut crab's tucked abdomen.
 b.blob([-.06,0,0],[lenX,.085,wide*.72],12,6,(up,side,fx)=>up<-.3?belly:o.kind==='edible'&&up<.25&&fx<.2&&Math.floor((Math.atan2(side,fx)+PI)*5)%2===0?shade(body,.85):cell(fx*5,side*5,up*2)>.85?shade(body,.88):body);
 if(o.kind==='blue')b.pair(()=>b.cone([-.08,0,wide*.66],[-.1,.01,wide*.66+.12],.022,body,4));
 if(o.kind==='coconut')b.blob([.17,-.02,0],[.14,.07,.12],8,5,(up)=>up<0?belly:shade(body,1.05));
 b.pair(()=>{
  // Eyes on stalks at the front edge.
  b.tube([[-.2,.05,.03],[-.24,.1,.04]],()=>.01,4,()=>body);b.bead([-.245,.105,.04],.018,BLACK);
  // Claws: arm, then a fat palm with two fingers.
  const big=o.kind==='coconut'?1.25:1;
  b.tube(smoothPath([[-.12,-.01,wide*.55],[-.22,0,wide*.75],[-.32,.02,wide*.62]],5),()=>.035*big,5,()=>claw);
  b.blob([-.38,.02,wide*.5],[.08*big,.05*big,.045*big],7,4,(up)=>up<-.4?belly:claw);
  b.cone([-.43,.04,wide*.46],[-.53,.035,wide*.38],.022*big,tip,4);b.cone([-.43,.0,wide*.46],[-.51,-.005,wide*.4],.018*big,tip,4);
  // Four walking legs, jointed, splayed out (the swimming crab's last pair are paddles).
  for(let i=0;i<4;i++){const x=-.1+i*.07,z0=wide*.6,paddle=o.kind==='swimming'&&i===3;
   const fan=(i-1.5)*.06;b.tube(smoothPath([[x,-.01,z0],[x+fan*.5,.06,z0+.14],[x+fan,-.03,z0+.27],[x+fan*1.3+.02,-.1,z0+.32]],6),t=>.022*(1-t*.6)*(o.kind==='coconut'?1.3:1),4,(t)=>t>.85?shade(leg,.7):leg);
   if(paddle)b.blob([x+fan*1.3+.02,-.09,z0+.34],[.05,.01,.035],6,3,()=>shade(leg,.9));}
 });
}
function lobster(b:Builder,o:{body:string;belly:string;spot:string}){
 const body=hex(o.body),belly=hex(o.belly),spot=hex(o.spot),dark=shade(body,.7);
 b.loft({x0:-.35,x1:-.02,n:8,sides:10,h:t=>.085*Math.pow(Math.sin(PI*(.12+t*.8)),.5),w:t=>.08*Math.pow(Math.sin(PI*(.12+t*.8)),.5),c:()=>.01,paint:(t,up)=>up<-.4?belly:cell(t*9,up*3,0)>.8?spot:body});
 for(let i=0;i<10;i++){const x=-.32+(i%5)*.06,z=i<5?.04:-.04;b.cone([x,.08,z],[x+.015,.12,z*1.3],.012,dark,3);}
 b.tube(smoothPath([[-.04,.01,0],[.15,.0,0],[.33,-.02,0],[.4,-.04,0]],15),t=>.075*(1-t*.4),10,(t,a)=>(t*6)%1<.13?dark:Math.cos(a)<-.35?belly:hash(Math.floor(t*30)+Math.floor(a*2)*7)>.75?spot:body);
 b.at(M(.4,-.04,0,0,0,-.1),()=>{for(const [s,l] of [[0,1],[.45,.9],[-.45,.9],[.85,.75],[-.85,.75]] as const)b.at(M(0,0,0,0,s,0),()=>b.poly([[0,0],[.05*l,.04],[.11*l,.035],[.12*l,-.02],[.04*l,-.03]],s===0?dark:body,{plane:'xz'}));});
 b.pair(()=>{
  // Very long, thick, spiny antennae (no big claws: that is what makes it a spiny lobster).
  const ant=smoothPath([[-.33,.05,.04],[-.5,.1,.09],[-.62,.12,.16],[-.66,.05,.26],[-.6,-.04,.34]],16);b.tube(ant,t=>.022*(1-t*.75),5,(t)=>Math.floor(t*12)%2?body:dark);
  for(let i=1;i<6;i++){const p=ant[i*3];b.cone(p,[p[0]-.02,p[1]+.03,p[2]+.01],.007,dark,3);}
  b.tube(smoothPath([[-.35,.02,.02],[-.45,.03,.03],[-.5,.05,.035]],4),()=>.006,3,()=>dark);
  b.bead([-.34,.09,.035],.02,BLACK);
  for(let i=0;i<5;i++){const x=-.3+i*.055;b.tube(smoothPath([[x,-.04,.05],[x-.01,-.06,.12],[x-.03,-.13,.16]],4),()=>.01,3,()=>i%2?body:spot);}
 });
}
function shell(b:Builder,o:{outer:string;inner:string;kind:'oyster'|'pearl'|'mussel'}){
 const out=hex(o.outer),inn=hex(o.inner),ridge=shade(out,.78);
 if(o.kind==='mussel'){
  // A long blue-black wedge, pointed at the hinge (front), growth lines and the purple-white inner lip.
  for(const s of [1,-1])b.blob([0,s*.02,0],[.4,.06,.17],12,4,(up,side,fx)=>up*s<-.5?inn:Math.floor((fx+1)*9)%3===0?shade(out,1.25):out,{});
  b.decal([.2,.08,0],[0,1,0],.08,shade(out,1.4),{sides:6,sx:2});
  return;}
 // Rough, irregular layered oyster valves; the pearl oyster is rounder, gapes open, and shows its pearl.
 const pearl=o.kind==='pearl',rx=pearl?.3:.36,rz=pearl?.28:.22;
 b.blob([0,-.02,0],[rx,.07,rz],12,5,(up,side,fx)=>up>.5?inn:Math.floor((Math.hypot(side,fx))*8)%2===0?ridge:out,{jitter:pearl?.04:.22,seed:3});
 const lid=()=>b.blob([0,0,0],[rx,.05,rz],12,4,(up,side,fx)=>up<-.5?inn:Math.floor(Math.hypot(side,fx)*9)%2===0?ridge:out,{jitter:pearl?.04:.25,seed:9});
 if(pearl){b.at(M(rx*.8,.02,0,0,0,.55),()=>b.at(M(-rx*.8,0,0),lid));b.blob([-.02,.05,0],[.055,.055,.055],8,6,()=>hex('#f6f1ea'),{g:.15});}
 else b.at(M(0,.05,0),lid);
}
function seahorse(b:Builder,o:{body:string;belly:string}){
 const body=hex(o.body),pale=hex(o.belly),dark=shade(body,.72);
 const trunk=smoothPath([[-.27,.3,0],[-.17,.2,0],[-.14,.05,0],[-.16,-.08,0],[-.1,-.2,0],[-.02,-.29,0],[.06,-.3,0],[.09,-.24,0],[.05,-.19,0],[.0,-.21,0]],30);
 b.tube(trunk,t=>t<.05?.07:t<.45?.085*(1-.3*((t-.05)/.4))+.02*Math.sin(t*PI*2):Math.max(.01,.075*(1-(t-.45)/.6)),8,(t,a)=>(t*16)%1<.16?dark:Math.cos(a)<-.2&&t<.45?pale:body,{up:[1,0,0]});
 // Belly bulge.
 b.blob([-.19,.06,0],[.07,.13,.065],7,5,(up,_s,fx)=>fx<0?pale:body);
 // Horse head: skull, long tube snout forward, coronet spikes on top, a small fan dorsal fin on the back.
 b.blob([-.27,.33,0],[.085,.07,.06],8,5,()=>body);
 b.tube([[-.33,.31,0],[-.5,.27,0]],t=>.026-t*.006,6,()=>shade(body,.95));
 for(let i=0;i<4;i++)b.cone([-.27+i*.025,.39,0],[-.25+i*.03,.45+(i%2)*.02,0],.014,dark,3);
 b.poly([[-.06,.07],[.02,.12],[.04,.06],[.02,-.02],[-.06,-.02]],mixC(body,pale,.4));
 b.pair(()=>{b.decal([-.27,.34,.06],[0,.1,1],.022,WHITE,{sides:6});b.decal([-.27,.34,.06],[0,.1,1],.013,BLACK,{lift:.008});b.at(M(-.2,.27,.06,0,0,-.6),()=>b.poly([[0,0],[.04,.03],[.05,-.01]],pale,{plane:'xy'}));});
}

// ---------------------------------------------------------------- the species table
type Spec=(b:Builder)=>Partial<Omit<SpeciesModel,'geometry'|'triangles'>>|void;
const FISH_ANIM:SpeciesModel['anim']={axis:[1,0,0],start:0,span:.5,dir:[0,.35,1],k:[5,0,0],amp:.07};
const mottle=(dark:C,freq:number,thr:number)=>(c:C,t:number,up:number,side:number)=>up>-.5&&cell(t*freq,up*freq*.3,side*2)>thr?mixC(c,dark,.7):c;
const SPECIES:Record<string,Spec>={
 // ---- the ten shared species
 shrimp:b=>{shrimp(b,{body:'#a07a58',belly:'#e6cfae',speckle:'#5e4532'});return {anim:{axis:[1,0,0],start:.05,span:.3,dir:[0,1,0],k:[6,0,0],amp:.025},shadow:'fish'};},
 sardine:b=>{const L=fish(b,{x1:.32,H:.1,W:.055,peak:.38,q:.7,ped:.12,top:'#2f6f88',side:'#c9d6dc',belly:'#f1f4f2',tail:'fork',tailH:.12,finC:'#6f8fa6',dorsal:[{t0:.42,t1:.55,h:.06,shape:'tri'}],anal:[{t0:.78,t1:.88,h:.025,shape:'square'}],pect:{t:.22,len:.07},pelvic:{t:.5,len:.035},eye:{t:.1,r:.028},mouth:{t:.03,len:.02}});
  spots(b,L,[.26,.33,.4,.47,.54].map((t,i):[number,number,number]=>[t,.78+(i%2)*.08,.013]),hex('#1d2f3c'));},
 mackerel:b=>{const bar=hex('#13303a');const L=scombrid(b,{top:'#2e6f6c',side:'#cfdbd2',belly:'#f2f4ec',H:.11,W:.07,finlet:'#3f6f6a',d1:{t0:.28,t1:.42,h:.07,shape:'spiny',spines:6},d2:{t0:.6,t1:.68,h:.045,shape:'tri'},a1:{t0:.62,t1:.7,h:.035,shape:'tri'},pect:.09,
  // Wavy dark tiger bars over the green-blue back, the mackerel's signature.
  paint:(c,t,up)=>up>.2&&t>.12&&t<.95&&Math.sin(t*70+Math.sin(up*9+t*20)*1.6)>.15?mixC(c,bar,.85):c});void L;},
 'sea-bass':b=>{const L=fish(b,{x1:.3,H:.15,W:.075,peak:.4,q:.65,ped:.18,top:'#5e7078',side:'#bcc6c8',belly:'#eef0e6',tail:'slight',tailH:.15,finC:'#7b8a90',
  dorsal:[{t0:.28,t1:.5,h:.11,shape:'spiny',spines:8},{t0:.55,t1:.75,h:.07,shape:'round'}],anal:[{t0:.62,t1:.76,h:.06,shape:'spiny',spines:3}],pect:{t:.3,len:.09},pelvic:{t:.35,len:.05},eye:{t:.12,r:.03},mouth:{t:.06,len:.05,a:1.65}});
  spots(b,L,[[.22,1.25,.03]],hex('#2c3a40'),0,5);},
 herring:b=>{fish(b,{x1:.32,H:.11,W:.05,peak:.42,q:.72,ped:.12,sag:.012,top:'#2c6a8a',side:'#d4dee4',belly:'#f4f6f6',line:.25,tail:'fork',tailH:.13,finC:'#7f97a8',dorsal:[{t0:.4,t1:.52,h:.06,shape:'tri'}],anal:[{t0:.76,t1:.88,h:.025,shape:'square'}],pect:{t:.22,len:.07},pelvic:{t:.5,len:.035},eye:{t:.1,r:.032},mouth:{t:.03,len:.025,a:1.5}});},
 cod:b=>{const L=fish(b,{x1:.32,H:.14,W:.11,peak:.32,q:.55,ped:.16,top:'#7f6f45',side:'#c8b98c',belly:'#f2ead0',tail:'square',tailH:.13,finC:'#8a7a52',
  paint:(c,t,up,side)=>up>-.3&&cell(t*30,up*6,side*3)>.72?mixC(c,hex('#4f4127'),.75):c,
  dorsal:[{t0:.28,t1:.4,h:.075,shape:'round'},{t0:.44,t1:.62,h:.065,shape:'round'},{t0:.66,t1:.85,h:.055,shape:'round'}],anal:[{t0:.46,t1:.64,h:.05,shape:'round'},{t0:.68,t1:.85,h:.045,shape:'round'}],pect:{t:.27,len:.09,round:true},pelvic:{t:.22,len:.05},eye:{t:.11,r:.028},mouth:{t:.04,len:.04,a:1.8}});
  lateralLine(b,L,.15,.96,t=>.35-.25*Math.sin(t*PI),.007,hex('#f1e9cc'));barbel(b,[-.46,-.08,0],[-.45,-.17,0],.008,hex('#e9dcae'));},
 haddock:b=>{const L=fish(b,{x1:.32,H:.13,W:.09,peak:.32,q:.6,ped:.15,top:'#4a4752',side:'#b9b8bc',belly:'#f1f0ea',tail:'slight',tailH:.13,finC:'#55525c',
  dorsal:[{t0:.26,t1:.38,h:.12,shape:'tri',sweep:.3},{t0:.44,t1:.62,h:.06,shape:'round'},{t0:.66,t1:.84,h:.05,shape:'round'}],anal:[{t0:.46,t1:.64,h:.045,shape:'round'},{t0:.68,t1:.84,h:.04,shape:'round'}],pect:{t:.27,len:.09},pelvic:{t:.22,len:.05},eye:{t:.11,r:.028},mouth:{t:.04,len:.035,a:1.85}});
  // The dark "thumbprint" (St Peter's mark) above the pectoral fin.
  spots(b,L,[[.3,1.05,.04]],hex('#141418'),0,7);lateralLine(b,L,.12,.97,t=>.4-.25*Math.sin(t*PI),.007,hex('#141418'));barbel(b,[-.46,-.07,0],[-.46,-.12,0],.006,hex('#d8d6cc'));},
 tuna:b=>{scombrid(b,{top:'#1b3358',side:'#9fb0bf',belly:'#e6ecef',H:.17,W:.14,finlet:'#f1c232',d2:{t0:.56,t1:.64,h:.07,shape:'tri'},a1:{t0:.58,t1:.66,h:.065,shape:'tri'},pect:.13});return {anim:{...FISH_ANIM,start:.2,amp:.05}};},
 shark:b=>{shark(b,{top:'#76858f',belly:'#eef0ee'});return {shadow:'shark',anim:{...FISH_ANIM,start:-.1,amp:.08}};},
 octopus:b=>{octopus(b,{body:'#c25d4f',belly:'#f3c2a6'});return {anim:{axis:[1,0,0],start:-.05,span:.5,dir:[0,.75,.65],k:[5,0,9],amp:.06},hold:{x:0,z:-PI/2},shadow:'octopus'};},
 // ---- Harbour Wall
 anchovy:b=>{const L=fish(b,{x1:.32,H:.085,W:.05,peak:.4,q:.85,ped:.13,top:'#3f7a74',side:'#c8d2cf',belly:'#eff1ec',tail:'fork',tailH:.11,finC:'#7d99a8',
  paint:(c,t,up)=>Math.abs(up)<.18&&t>.15?hex('#e6eef0'):c,dorsal:[{t0:.42,t1:.52,h:.05,shape:'tri'}],anal:[{t0:.62,t1:.74,h:.025,shape:'square'}],pect:{t:.22,len:.06},eye:{t:.1,r:.026},mouth:{t:.11,len:.05,a:1.8}});
  b.cone([-.47,.0,0],[-.53,-.005,0],.022,hex('#3f7a74'),5);void L;},
 'short-mackerel':b=>{const L=scombrid(b,{top:'#2e5f78',side:'#c4d2d6',belly:'#eef2ea',H:.15,W:.07,finlet:'#6c8f9a',d1:{t0:.28,t1:.42,h:.08,shape:'spiny',spines:6},d2:{t0:.58,t1:.67,h:.05,shape:'tri'},a1:{t0:.6,t1:.69,h:.04,shape:'tri'},pect:.09});
  spots(b,L,[.22,.3,.38,.46,.54,.62].map((t,i):[number,number,number]=>[t,.55+(i%2)*.2,.012]),hex('#1d3946'));},
 hake:b=>{fish(b,{x1:.33,H:.1,W:.07,peak:.3,q:.75,ped:.14,top:'#6f7b86',side:'#c3c9cf',belly:'#f0f1ed',tail:'square',tailH:.09,finC:'#7e8a94',
  dorsal:[{t0:.24,t1:.34,h:.07,shape:'tri'},{t0:.38,t1:.93,h:.045,shape:'low'}],anal:[{t0:.42,t1:.93,h:.04,shape:'low'}],pect:{t:.25,len:.09},pelvic:{t:.2,len:.04},eye:{t:.1,r:.03},mouth:{t:.06,len:.07,a:1.7,c:'#14161a'}});},
 'red-snapper':b=>{const L=fish(b,{x1:.3,H:.17,W:.075,peak:.4,q:.85,ped:.17,top:'#c8463c',side:'#e56d5c',belly:'#f6c3a8',line:.3,tail:'slight',tailH:.16,finC:'#cf4d42',
  dorsal:[{t0:.24,t1:.52,h:.1,shape:'spiny',spines:10},{t0:.52,t1:.78,h:.08,shape:'round'}],anal:[{t0:.62,t1:.78,h:.07,shape:'tri'}],pect:{t:.3,len:.11},pelvic:{t:.34,len:.06},eye:{t:.14,r:.032,ring:'#f04a3a'},mouth:{t:.03,len:.035,a:1.9}});void L;},
 'yellowfin-tuna':b=>{scombrid(b,{top:'#1c3459',side:'#a6b4c0',belly:'#ecefe9',H:.16,W:.13,finlet:'#f4d03f',d2:{t0:.56,t1:.62,h:.24,shape:'sickle',c:'#f4d03f'},a1:{t0:.57,t1:.63,h:.22,shape:'sickle',c:'#f4d03f'},pect:.17,
  paint:(c,t,up)=>Math.abs(up-.05)<.14&&t>.12&&t<.75?hex('#e8c64a'):c});return {anim:{...FISH_ANIM,start:.2,amp:.05}};},
 barracuda:b=>{const L=fish(b,{x1:.34,H:.08,W:.06,peak:.45,q:.95,ped:.25,top:'#55636d',side:'#c3cbcd',belly:'#eef1ec',line:.2,tail:'fork',tailH:.11,finC:'#5e6a72',
  paint:(c,t,up)=>up>.15&&t>.2&&t<.9&&Math.sin(t*44)>.35?hex('#3a464e'):c,
  dorsal:[{t0:.36,t1:.44,h:.06,shape:'tri'},{t0:.72,t1:.79,h:.045,shape:'tri'}],anal:[{t0:.72,t1:.79,h:.04,shape:'tri'}],pect:{t:.25,len:.06},pelvic:{t:.42,len:.04},eye:{t:.15,r:.024},mouth:{t:.07,len:.07,a:1.65,c:'#2a1c1c'}});
  // Underbite jaw and fangs.
  b.cone([-.44,-.025,0],[-.54,-.02,0],.022,hex('#55636d'),5);teethRow(b,L,.04,.12,1.75,5,.012);},
 'blue-shark':b=>{shark(b,{top:'#2f5fa8',belly:'#f0f3f5',H:.08,W:.07,q:.95,pect:.34,pectWide:.7,dorsal:.09,line:-.3});return {shadow:'shark',anim:{...FISH_ANIM,start:-.1,amp:.08}};},
 hammerhead:b=>{const L=shark(b,{top:'#6c7b88',belly:'#eef1f1',H:.1,q:.5,dorsal:.17,d2:.03});
  // The hammer: a flat, wide head blade with an eye at each end.
  b.loft({x0:-.53,x1:-.38,n:4,sides:8,h:t=>.025+.005*Math.sin(PI*t),w:t=>.2*Math.pow(Math.sin(PI*(.12+t*.76)),.4),c:()=>.02,paint:(t,up)=>up>-.2?hex('#6c7b88'):hex('#eef1f1')});
  b.pair(()=>{b.bead([-.46,.03,.2],.022,BLACK);});void L;return {shadow:'shark',hold:{x:.65,z:0},anim:{...FISH_ANIM,start:-.1,amp:.08}};},
 sawshark:b=>{shark(b,{top:'#8b8a7c',belly:'#eeede2',H:.075,W:.08,x1:.24,q:.7,dorsal:.07,d2:.06,d2T:.62,pect:.17,pectWide:1.3,sag:0});
  // The long, flat saw with side teeth and two barbels halfway along.
  b.loft({x0:-.82,x1:-.46,n:4,sides:6,h:()=>.01,w:t=>.016+t*.024,c:()=>.005,paint:()=>hex('#9b9a8a')});
  b.pair(()=>{for(let i=0;i<8;i++){const x=-.8+i*.045,w=.016+(x+.82)/.36*.024;b.poly([[x,w],[x+.006,w+.022],[x+.014,w]],TOOTH,{plane:'xz'});}barbel(b,[-.65,-.005,.02],[-.6,-.06,.04],.004,hex('#c9c7b4'));});
  return {shadow:'shark',anim:{...FISH_ANIM,start:-.1,amp:.08}};},
 'great-white':b=>{shark(b,{top:'#7f8a93',belly:'#fbfbf8',H:.135,W:.12,q:.62,peak:.36,dorsal:.17,tail:'lunate',tailH:.17,teeth:true,line:-.05,pect:.25});return {shadow:'shark',anim:{...FISH_ANIM,start:-.1,amp:.07}};},
 // ---- South Pier
 'red-mullet':b=>{const L=fish(b,{x1:.3,H:.12,W:.07,peak:.32,q:.45,ped:.15,top:'#c9533f',side:'#e98a6c',belly:'#f8dcc6',line:.3,tail:'fork',tailH:.12,finC:'#e5a07c',
  paint:(c,t,up)=>Math.abs(up-.05)<.07&&t>.2&&t<.9?hex('#e9b84f'):c,dorsal:[{t0:.3,t1:.42,h:.07,shape:'spiny',spines:5},{t0:.58,t1:.7,h:.05,shape:'round'}],anal:[{t0:.6,t1:.72,h:.04,shape:'round'}],pect:{t:.28,len:.08},pelvic:{t:.3,len:.05},eye:{t:.18,a:.8,r:.028},mouth:{t:.03,len:.02,a:2.1}});
  // Two long chin barbels for feeling in the sand.
  b.pair(()=>barbel(b,[-.44,-.06,.012],[-.39,-.18,.03],.008,hex('#f4e3b0')));void L;},
 bonito:b=>{scombrid(b,{top:'#24456c',side:'#b9c4cd',belly:'#ebeff0',H:.13,W:.1,finlet:'#4a6a8c',d2:{t0:.55,t1:.62,h:.05,shape:'tri'},a1:{t0:.58,t1:.65,h:.05,shape:'tri'},pect:.1,
  // Slanted dark stripes over the back.
  paint:(c,t,up)=>up>.2&&t>.15&&Math.sin(t*60+up*7)>.4?hex('#0f2440'):c});},
 'horse-mackerel':b=>{const L=fish(b,{x1:.31,H:.12,W:.065,peak:.35,q:.7,ped:.12,top:'#4e7682',side:'#c9d3d0',belly:'#eef1ea',tail:'fork',tailH:.13,finC:'#6f8c93',
  dorsal:[{t0:.3,t1:.42,h:.07,shape:'spiny',spines:6},{t0:.46,t1:.9,h:.04,shape:'low'}],anal:[{t0:.55,t1:.9,h:.035,shape:'low'}],pect:{t:.26,len:.11,wide:.6},eye:{t:.11,r:.04},mouth:{t:.04,len:.03,a:1.7}});
  // Bony scutes along the lateral line, which dips down halfway.
  b.pair(()=>{for(let i=0;i<14;i++){const t=.2+i*.055,up=t<.4?.45:.0,{p,n}=surf(L,Math.min(.98,t),Math.acos(up));b.decal(p,n,.016,hex('#8fa4a6'),{sides:4,sx:1.6,lift:.006});}});
  spots(b,L,[[.2,1.0,.018]],hex('#1d2e33'));},
 dorado:b=>{fish(b,{x1:.3,H:.16,W:.06,peak:.15,q:.25,ped:.12,top:'#2f8a7a',side:'#c9b84a',belly:'#f2d65a',line:.45,tail:'fork',tailH:.17,tailC:'#d9c04a',finC:'#2f6fa0',
  paint:(c,t,up,side)=>up>-.3&&up<.6&&cell(t*26,up*5,side*2)>.8?hex('#2a7fc1'):c,
  dorsal:[{t0:.05,t1:.9,h:.07,shape:'low'}],anal:[{t0:.5,t1:.9,h:.05,shape:'low'}],pect:{t:.2,len:.08},pelvic:{t:.24,len:.05},eye:{t:.1,a:1.2,r:.026},mouth:{t:.02,len:.03,a:1.9}});},
 mako:b=>{shark(b,{top:'#2f4f8a',belly:'#f2f5f6',H:.11,W:.1,q:.95,tail:'lunate',tailH:.15,teeth:true,line:-.1});return {shadow:'shark',anim:{...FISH_ANIM,start:-.1,amp:.08}};},
 thresher:b=>{shark(b,{top:'#5a5f8a',belly:'#eceef2',H:.09,W:.08,x1:-.02,q:.6,tail:'thresher',tailH:.3,dorsalT:.42,d2:.02,pect:.18});
  return {shadow:'shark',anim:{...FISH_ANIM,start:-.15,span:.65,amp:.1}};},
 'whale-shark':b=>{const L=shark(b,{top:'#3f5a72',belly:'#e8eef0',H:.12,W:.15,q:.3,peak:.3,dorsal:.12,d2:.04,tail:'lunate',tailH:.15,line:-.25,
  });
  {const list:[number,number,number][]=[];for(let i=0;i<34;i++){const t=.08+.8*hash(i*3.1),a=.25+1.35*hash(i*7.7);list.push([t,a,.011+.006*hash(i)]);}spots(b,L,list,hex('#eef3f2'),0,5);
   b.pair(()=>{for(let k=0;k<5;k++){const t=.3+k*.1;b.tube([.5,.9,1.3].map(a=>surf(L,t,a,.002).p),()=>.006,3,()=>hex('#dfe8ea'));}});}
  // Wide, flat mouth right at the front of the broad head; ridges along the back.
  b.decal([-.505,.0,0],[-1,0,0],.11,hex('#1d2833'),{sides:6,sx:.25,rot:PI/2});void L;return {shadow:'shark',anim:{...FISH_ANIM,start:-.1,amp:.06}};},
 'oceanic-whitetip':b=>{shark(b,{top:'#6b767d',belly:'#f0f1ee',H:.1,q:.45,dorsal:.16,pect:.32,pectWide:1.3,roundFins:true,tip:'#fbfbf5'});return {shadow:'shark',anim:{...FISH_ANIM,start:-.1,amp:.08}};},
 // ---- Lifebuoy Point
 oyster:b=>{shell(b,{outer:'#a9a089',inner:'#efe9da',kind:'oyster'});return {anim:{...FISH_ANIM,amp:0},hold:{x:1.1,z:0},shadow:'crab'};},
 'pearl-oyster':b=>{shell(b,{outer:'#6f6f7c',inner:'#e8e4ee',kind:'pearl'});return {anim:{...FISH_ANIM,amp:0},hold:{x:1.0,z:0},shadow:'crab'};},
 stingray:b=>{ray(b,{top:'#6e6a5c',belly:'#efe9d6',spine:true});return {anim:{axis:[0,0,1],start:.1,span:.4,dir:[0,1,0],k:[3,0,0],amp:.04},hold:{x:1.35,z:-PI/2},shadow:'ray'};},
 'gummy-shark':b=>{shark(b,{top:'#8d8f93',belly:'#efede6',H:.085,q:.5,d2:.07,d2T:.65,paint:(c,t,up,side)=>up>0&&cell(t*30,up*5,side*3)>.83?hex('#f4f2ea'):c});return {shadow:'shark',anim:{...FISH_ANIM,start:-.1,amp:.08}};},
 'port-jackson':b=>{const L=shark(b,{top:'#a08c6c',belly:'#efe5cf',H:.12,W:.1,q:.3,peak:.22,dorsal:.1,dorsalT:.38,d2:.08,d2T:.62,
  // Dark harness bands across the back and through the eye.
  paint:(c,t,up)=>up>-.2&&(Math.abs(t-.12)<.025||Math.abs(t-.32)<.04||(up>.3&&Math.abs(t-.48)<.05))?hex('#3a2e24'):c});
  b.pair(()=>{b.blob([-.38,.075,.05],[.05,.02,.025],5,3,()=>hex('#8c7a5c'));});
  b.cone([-.08,.13,0],[-.06,.2,0],.008,hex('#f0e7d0'),3);void L;return {shadow:'shark',anim:{...FISH_ANIM,start:-.1,amp:.08}};},
 seahorse:b=>{seahorse(b,{body:'#b8563f',belly:'#f0c29a'});return {anim:{axis:[0,-1,0],start:.15,span:.2,dir:[1,0,0],k:[0,6,0],amp:.03},shadow:'fish'};},
 'pacific-seahorse':b=>{seahorse(b,{body:'#c99a45',belly:'#f2dca0'});return {anim:{axis:[0,-1,0],start:.15,span:.2,dir:[1,0,0],k:[0,6,0],amp:.03},shadow:'fish'};},
 'bull-shark':b=>{shark(b,{top:'#787a73',belly:'#efeee5',H:.14,W:.13,q:.35,peak:.36,dorsal:.14,line:-.1});return {shadow:'shark',anim:{...FISH_ANIM,start:-.1,amp:.07}};},
 blacktip:b=>{shark(b,{top:'#8a8f86',belly:'#f2f1ea',H:.1,q:.6,tip:'#141617',dorsal:.13});return {shadow:'shark',anim:{...FISH_ANIM,start:-.1,amp:.08}};},
 // ---- North Beach Rocks
 'edible-crab':b=>{crab(b,{body:'#b0683f',belly:'#f0c89c',claw:'#a65a36',kind:'edible'});return {anim:{...FISH_ANIM,amp:0},hold:{x:1.15,z:-PI/2},shadow:'crab'};},
 'swimming-crab':b=>{crab(b,{body:'#7e6f45',belly:'#efe0b4',claw:'#7e6f45',tip:'#2f3a5a',kind:'swimming'});return {anim:{...FISH_ANIM,amp:0},hold:{x:1.15,z:-PI/2},shadow:'crab'};},
 'blue-crab':b=>{crab(b,{body:'#5f7a6a',belly:'#efe2c4',claw:'#3f74c0',tip:'#e0533a',kind:'blue'});return {anim:{...FISH_ANIM,amp:0},hold:{x:1.15,z:-PI/2},shadow:'crab'};},
 mussel:b=>{shell(b,{outer:'#1f2638',inner:'#d8cfe0',kind:'mussel'});return {anim:{...FISH_ANIM,amp:0},hold:{x:1.0,z:0},shadow:'crab'};},
 eel:b=>{const top=hex('#4d4c30'),bel=hex('#d6cf8f');const L:Loft={x0:-.5,x1:.5,n:24,sides:8,h:t=>.045*Math.pow(Math.sin(PI*Math.min(1,t*1.15+.04)),.35)*(t>.9?(1-t)*10*.7+.3:1),w:t=>.04*Math.pow(Math.sin(PI*Math.min(1,t*1.15+.04)),.35),c:t=>.06*Math.sin(t*PI*2.2),paint:(_t,up)=>up>-.2?top:bel};
  b.loft(L);fin(b,L,{t0:.35,t1:.99,h:.03,shape:'low'},'top',shade(top,.9));fin(b,L,{t0:.5,t1:.99,h:.025,shape:'low'},'bottom',shade(top,.9));
  pectoral(b,L,.1,.04,shade(top,.9),{a:1.6,droop:.2,round:true});eyes(b,L,.04,1.0,.012);
  return {anim:{axis:[1,0,0],start:-.3,span:.8,dir:[0,.5,.85],k:[9,0,0],amp:.06}};},
 'spiny-lobster':b=>{lobster(b,{body:'#a8523a',belly:'#efc08e',spot:'#f2d6a2'});return {anim:{...FISH_ANIM,amp:0},hold:{x:.7,z:0},shadow:'crab'};},
 'coconut-crab':b=>{crab(b,{body:'#4b5fa8',belly:'#e3b590',claw:'#4b5fa8',tip:'#2a2a48',kind:'coconut'});return {anim:{...FISH_ANIM,amp:0},hold:{x:1.15,z:-PI/2},shadow:'crab'};},
 'nurse-shark':b=>{const L=shark(b,{top:'#9c8a66',belly:'#ece2c6',H:.09,W:.1,x1:.08,q:.3,dorsal:.09,dorsalT:.55,d2:.07,d2T:.7,tail:'thresher',tailH:.14,roundFins:true,line:-.3});
  b.pair(()=>barbel(b,[-.49,-.01,.025],[-.53,-.06,.03],.006,hex('#c9b78f')));void L;return {shadow:'shark',anim:{...FISH_ANIM,start:-.1,amp:.08}};},
 'sand-tiger':b=>{shark(b,{top:'#8f8465',belly:'#ece5cc',H:.11,q:.85,dorsal:.1,dorsalT:.42,d2:.09,d2T:.68,teeth:true,sag:.008,
  paint:(c,t,up,side)=>up>-.1&&t>.25&&cell(t*30,up*5,side*3)>.8?hex('#5e4f35'):c});return {shadow:'shark',anim:{...FISH_ANIM,start:-.1,amp:.08}};},
 // ---- West Cove
 'cownose-ray':b=>{ray(b,{top:'#8a6c4c',belly:'#efe2cc',cownose:true});return {anim:{axis:[0,0,1],start:.15,span:.4,dir:[0,1,0],k:[3,0,0],amp:.05},hold:{x:1.35,z:-PI/2},shadow:'ray'};},
 'tope-shark':b=>{shark(b,{top:'#80858a',belly:'#efeeea',H:.08,q:.95,d2:.04,tailH:.12});return {shadow:'shark',anim:{...FISH_ANIM,start:-.1,amp:.08}};},
 wobbegong:b=>{const L=shark(b,{top:'#9a7f55',belly:'#e8d8b0',H:.06,W:.13,x1:.2,q:.25,peak:.25,dorsal:.06,dorsalT:.6,d2:.05,d2T:.75,roundFins:true,line:-.6,pect:.2,pectWide:1.5,
  // Carpet pattern: pale rings and dark saddles.
  paint:(c,t,up,side)=>up>-.5?(cell(t*24,up*4,side*3)>.7?hex('#e3cfa0'):Math.sin(t*40)>.6?hex('#5e4a2e'):c):c});
  // Frilly skin lobes round the mouth.
  b.pair(()=>{for(let i=0;i<6;i++){const a=.15+i*.2,{p}=surf(L,.06+i*.02,1.4+a*.4);b.cone(p,[p[0]-.02,p[1]-.04,p[2]+.03],.012,hex('#b8995f'),3);}});
  return {shadow:'shark',hold:{x:.6,z:0},anim:{...FISH_ANIM,start:-.1,amp:.06}};},
 arowana:b=>{const L=fish(b,{x1:.3,H:.11,W:.055,peak:.4,q:.75,ped:.25,top:'#7e7a43',side:'#d8c87a',belly:'#efe6c0',tail:'round',tailH:.1,finC:'#a68f4a',c:t=>-.03*Math.sin(PI*t)+.03*t,
  // Big, plate-like scales.
  paint:(c,t,up)=>up>-.6&&up<.7&&(Math.floor(t*22+up*2)+Math.floor(up*4))%2===0?mixC(c,hex('#fff2c0'),.35):c,
  dorsal:[{t0:.66,t1:.96,h:.06,shape:'low'}],anal:[{t0:.6,t1:.96,h:.07,shape:'low'}],pect:{t:.2,len:.09},pelvic:{t:.4,len:.05},eye:{t:.1,a:.9,r:.03},mouth:{t:.06,len:.06,a:.8}});
  // Upturned jaw with two chin barbels pointing forward.
  b.pair(()=>barbel(b,[-.49,.02,.008],[-.58,.04,.025],.007,hex('#c9b56a')));void L;},
 piranha:b=>{const L=fish(b,{x1:.28,H:.2,W:.08,peak:.45,q:.5,ped:.14,top:'#5f6a6a',side:'#a8b3b0',belly:'#d9573f',line:-.15,tail:'square',tailH:.15,tailC:'#2f3434',finC:'#606a6a',
  paint:(c,t,up,side)=>up>-.5&&cell(t*30,up*6,side*3)>.85?hex('#3f4846'):c,
  dorsal:[{t0:.42,t1:.6,h:.09,shape:'round'},{t0:.82,t1:.88,h:.03,shape:'round'}],anal:[{t0:.6,t1:.85,h:.06,shape:'low',c:'#d9573f'}],pect:{t:.32,len:.07,c:'#d9573f'},pelvic:{t:.42,len:.04,c:'#d9573f'},eye:{t:.16,r:.03,ring:'#f2a33a'},mouth:{t:.04,len:.03,a:2.0}});
  // Jutting lower jaw packed with triangular teeth.
  b.blob([-.46,-.07,0],[.06,.04,.05],6,4,()=>hex('#c7503b'));teethRow(b,L,.0,.07,1.85,4,.016,false);},
 'sandbar-shark':b=>{shark(b,{top:'#9b927c',belly:'#efebdd',H:.11,q:.55,dorsal:.24,dorsalT:.3});return {shadow:'shark',anim:{...FISH_ANIM,start:-.1,amp:.08}};},
 'reef-shark':b=>{shark(b,{top:'#717c79',belly:'#eef0ea',H:.11,q:.6,dorsal:.15});return {shadow:'shark',anim:{...FISH_ANIM,start:-.1,amp:.08}};},
 'dusky-shark':b=>{shark(b,{top:'#454e57',belly:'#e6e9e8',H:.1,q:.7,dorsal:.13,pect:.3,pectWide:.8});return {shadow:'shark',anim:{...FISH_ANIM,start:-.1,amp:.08}};},
 'lemon-shark':b=>{shark(b,{top:'#b3a35a',belly:'#f3edc8',H:.11,q:.4,dorsal:.12,d2:.11,d2T:.66});return {shadow:'shark',anim:{...FISH_ANIM,start:-.1,amp:.08}};},
 coelacanth:b=>{const blue=hex('#2f4372');const L=fish(b,{x1:.3,H:.16,W:.1,peak:.4,q:.55,ped:.3,top:'#2f4372',side:'#3d5487',belly:'#6f84b0',tail:'tri',tailH:.16,finC:'#2a3c66',
  dorsal:[{t0:.3,t1:.42,h:.1,shape:'round'}],eye:{t:.12,r:.03,iris:'#3a3020',ring:'#f2e6b8'},mouth:{t:.05,len:.04,a:1.8}});
  // Lobed, limb-like fins: a fleshy stalk ending in a fan (2nd dorsal, anal, pectorals, pelvics).
  const lobe=(t:number,a:number,dir:V,len:number)=>{const {p}=surf(L,t,a);const e:V=[p[0]+dir[0]*len,p[1]+dir[1]*len,p[2]+dir[2]*len];b.tube([p,e],tt=>.028*(1-tt*.4),5,()=>blue);b.blob([e[0]+dir[0]*.03,e[1]+dir[1]*.03,e[2]+dir[2]*.03],[.045,.035,.012],6,3,()=>hex('#24345a'));};
  spots(b,L,Array.from({length:14},(_,i):[number,number,number]=>[.12+.8*hash(i*5.3),.5+2.1*hash(i*2.9),.018+.01*hash(i)]),hex('#e8edf3'),0,6);
  lobe(.66,0,[.5,.85,0],.06);lobe(.66,PI,[.5,-.85,0],.06);
  b.pair(()=>{lobe(.3,2.0,[.5,-.4,.75],.06);lobe(.52,2.6,[.4,-.8,.4],.05);});},
 // ---- Deep Sea Boat
 squid:b=>{squid(b,{body:'#d9868f',belly:'#f6d7cf'});return {anim:{axis:[-1,0,0],start:.2,span:.35,dir:[0,.7,.7],k:[0,0,8],amp:.03},hold:{x:.75,z:0},shadow:'octopus'};},
 lanternfish:b=>{const L=fish(b,{x1:.32,H:.11,W:.06,peak:.3,q:.5,ped:.18,top:'#1c2440',side:'#3f4f70',belly:'#8b9bc4',tail:'fork',tailH:.12,finC:'#2c3656',
  dorsal:[{t0:.42,t1:.56,h:.06,shape:'round'},{t0:.86,t1:.9,h:.02,shape:'round'}],anal:[{t0:.6,t1:.78,h:.04,shape:'round'}],pect:{t:.25,len:.06},eye:{t:.12,a:1.25,r:.045,iris:'#0a0d18',ring:'#c9d4ff'},mouth:{t:.06,len:.05,a:1.75}});
  // Rows of glowing photophores along the belly and flank.
  const glow=hex('#9ef0ff');spots(b,L,[...Array.from({length:9},(_,i):[number,number,number]=>[.18+i*.085,2.35,.014]),...Array.from({length:7},(_,i):[number,number,number]=>[.25+i*.1,1.9,.012]),[.95,1.6,.012]],glow,1,5);},
 grouper:b=>{const L=fish(b,{x1:.3,H:.17,W:.13,peak:.35,q:.4,ped:.25,top:'#6c5a3e',side:'#9a8460',belly:'#dccb9f',line:-.1,tail:'round',tailH:.13,finC:'#5d4d35',
  paint:mottle(hex('#3f3322'),14,.55),
  dorsal:[{t0:.28,t1:.55,h:.07,shape:'spiny',spines:9},{t0:.55,t1:.85,h:.07,shape:'round'}],anal:[{t0:.62,t1:.85,h:.07,shape:'round'}],pect:{t:.3,len:.12,round:true},pelvic:{t:.32,len:.06},eye:{t:.14,a:.85,r:.028}});
  // Big lips: a thick, jutting lower jaw and upper lip.
  b.blob([-.47,-.05,0],[.07,.035,.075],7,4,()=>hex('#b89a6a'));b.blob([-.47,.0,0],[.06,.028,.07],7,4,()=>hex('#8a7350'));
  b.decal([-.53,-.025,0],[-1,0,0],.03,hex('#2a1f18'),{sides:6,sx:.6,rot:PI/2});void L;},
 sailfish:b=>{const L=billfish(b,{top:'#1f4f86',belly:'#e9eff4',H:.11,bill:'spear',sail:true,dorsal:{t0:.12,t1:.78,h:.3,shape:'sail',c:'#25539a'},bars:'#8fb8e8',spots:true});void L;return {anim:{...FISH_ANIM,start:.25,amp:.05}};},
 anglerfish:b=>{const body=hex('#3f352d');const L=fish(b,{x1:.25,H:.22,W:.19,peak:.32,q:.35,ped:.2,top:'#3f352d',side:'#4f4337',belly:'#8c7c68',line:-.3,tail:'round',tailH:.12,finC:'#2f2822',
  dorsal:[{t0:.66,t1:.85,h:.06,shape:'round'}],anal:[{t0:.68,t1:.85,h:.05,shape:'round'}],pect:{t:.5,len:.08,round:true},eye:{t:.24,a:.7,r:.022,ring:'#cbbf9a'}});
  // Huge gaping mouth (dark inside) full of long fangs, under-slung jaw.
  b.decal([-.5,-.02,0],[-1,0,0],.15,hex('#1a0e10'),{sides:8,sx:.8,rot:PI/2,lift:.02});
  b.blob([-.4,-.15,0],[.12,.05,.16],8,4,()=>shade(body,1.1));
  b.pair(()=>{for(let i=0;i<5;i++){const z=.03+i*.03,x=-.52+i*.012;b.cone([x,.08-i*.005,z],[x-.005,.0,z],.012,TOOTH,3);b.cone([x+.01,-.13,z],[x,-.05,z],.012,TOOTH,3);}});
  // The fishing-rod spine on the head and its glowing lure.
  b.tube(smoothPath([[-.35,.2,0],[-.38,.32,0],[-.48,.36,0],[-.56,.3,0]],8),()=>.008,4,()=>hex('#5a4c3e'));
  b.blob([-.57,.27,0],[.035,.035,.035],6,4,()=>hex('#fff1a8'),{g:1});void L;
  return {anim:{...FISH_ANIM,start:.1,amp:.05}};},
 swordfish:b=>{billfish(b,{top:'#3b4256',belly:'#e1e4e8',H:.12,bill:'flat',dorsal:{t0:.18,t1:.32,h:.18,shape:'sickle',sweep:.4}});return {anim:{...FISH_ANIM,start:.25,amp:.05}};},
 'blue-marlin':b=>{billfish(b,{top:'#163f7c',belly:'#e3ebf2',H:.12,bill:'spear',dorsal:{t0:.16,t1:.72,h:.16,shape:'sail',c:'#1d3f78'},bars:'#9ac8f0'});return {anim:{...FISH_ANIM,start:.25,amp:.05}};},
 'ocean-sunfish':b=>{const L=fish(b,{x1:.32,H:.3,W:.08,peak:.42,q:.45,ped:.75,top:'#7f8b96',side:'#9aa5ae',belly:'#d8dee2',line:-.2,tail:'clavus',finC:'#7a8590',
  dorsal:[{t0:.72,t1:.86,h:.3,shape:'sickle',sweep:.35}],anal:[{t0:.72,t1:.86,h:.28,shape:'sickle',sweep:.35}],pect:{t:.3,len:.06,a:1.6,droop:.1,round:true},eye:{t:.12,a:1.0,r:.03}});
  // Small round mouth at the front.
  b.decal([-.5,-.02,0],[-1,0,0],.025,hex('#2e3338'),{sides:6});void L;return {anim:{axis:[0,1,0],start:.2,span:.2,dir:[1,0,.3],k:[0,0,0],amp:.06}};},
};
/** Fallbacks when a species id has no entry (new species added later): the right animal type in the species' colours. */
function byShape(b:Builder,shape:FishShape|undefined,color:string,belly:string):ReturnType<Spec>{
 switch(shape){
  case 'shrimp':shrimp(b,{body:color,belly,speckle:'#5e4532'});return;
  case 'octopus':octopus(b,{body:color,belly});return {hold:{x:0,z:-PI/2},shadow:'octopus'};
  case 'squid':squid(b,{body:color,belly});return {hold:{x:.75,z:0},shadow:'octopus'};
  case 'crab':crab(b,{body:color,belly,claw:color,kind:'edible'});return {anim:{...FISH_ANIM,amp:0},hold:{x:1.15,z:-PI/2},shadow:'crab'};
  case 'lobster':lobster(b,{body:color,belly,spot:belly});return {anim:{...FISH_ANIM,amp:0},hold:{x:.7,z:0},shadow:'crab'};
  case 'ray':ray(b,{top:color,belly});return {hold:{x:1.35,z:-PI/2},shadow:'ray'};
  case 'shell':shell(b,{outer:color,inner:belly,kind:'oyster'});return {anim:{...FISH_ANIM,amp:0},hold:{x:1.1,z:0},shadow:'crab'};
  case 'seahorse':seahorse(b,{body:color,belly});return;
  case 'shark':case 'hammerhead':shark(b,{top:color,belly});return {shadow:'shark'};
  case 'billfish':billfish(b,{top:color,belly,H:.12,bill:'spear',dorsal:{t0:.16,t1:.4,h:.15,shape:'sickle'}});return;
  default:fish(b,{x1:.3,H:shape==='round'?.15:.11,W:.07,top:color,belly,tail:'fork',dorsal:[{t0:.35,t1:.6,h:.07,shape:'round'}],anal:[{t0:.62,t1:.78,h:.04,shape:'round'}],pect:{t:.25,len:.08},eye:{t:.1,r:.03}});return;
 }
}

const CACHE=new Map<string,SpeciesModel>();
/** The cached model for a species (built on first use). `id` wins; otherwise the shape picks a generic animal of that type. */
export function speciesModel(id:string|undefined,shape?:FishShape,color='#6f8fa6'):SpeciesModel{
 const key=id&&SPECIES[id]?id:`shape:${shape}:${color}`;
 const hit=CACHE.get(key);if(hit)return hit;
 const b=new Builder(),f=id?fishById(id):undefined;
 const extra=((id&&SPECIES[id]?SPECIES[id](b):byShape(b,shape??f?.shape,f?.color??color,f?.belly??'#e8e4d6'))||{}) as Partial<Omit<SpeciesModel,'geometry'|'triangles'>>;
 // Bills are drawn ahead of the snout: slide the whole model back so the bill tip is the front at -0.5.
 const geometry=b.geometry();
 // Billfish bills, the saw shark's saw and the thresher's tail reach past the usual box: refit those to -0.5…+0.5 along X.
 if(id&&['sailfish','swordfish','blue-marlin','sawshark','thresher'].includes(id)){geometry.computeBoundingBox();const bb=geometry.boundingBox!,s=1.05/(bb.max.x-bb.min.x);geometry.translate(-bb.min.x,0,0);geometry.scale(s,s,s);geometry.translate(-.5,0,0);geometry.computeBoundingSphere();}
 const model:SpeciesModel={geometry,anim:extra.anim??FISH_ANIM,hold:extra.hold??{x:0,z:0},shadow:extra.shadow??'fish',triangles:geometry.getAttribute('position').count/3};
 CACHE.set(key,model);return model;
}
/** Every species id with its own model (tests). */
export const MODELLED_SPECIES=Object.keys(SPECIES);
/** Free the GPU copies (the CPU arrays stay cached, so the next session re-uploads instead of rebuilding). */
export function releaseSpeciesModels(){for(const m of CACHE.values())m.geometry.dispose();}
