import * as T from 'three';
import * as SG from '../../../../lib/shop/bootGeometry';
import type {BootModel,StudType} from '../../../../lib/shop/boots';
import {weld,normalOf,type Mark,type Mesh,type V3} from './mesh';
/**
 * boots · how a boot is built, as geometry (Oct 12 2026; rebuilt Oct 13 2026 from the Kit Shop's boot, user: "these need to look
 * better, more like the shapes in the boot store. these don't look like futbol boots").
 *
 * Every boot is now SAMPLED from the shop's analytic boot (lib/shop/bootGeometry.ts, imported, never edited): its silhouette
 * (bootProfiles.ts, traced from the reference photos), the asymmetric foot plan, the leaning walls, the collar line dipping under
 * the ankle bones, toe spring and heel lift, the fold-over or slim tongue, the eyelet rows, the sock collar and lace cover, the fins,
 * the soleplate's wall, heel block, arch cut-out and waist, and each model's own stud layout and stud shapes. The shop renders a
 * 10k-triangle WebGL mesh; this exhibit draws every face as an SVG path, so the same surfaces are sampled here at a light level of
 * detail (about 2,000 faces whole, about 1,200 while it moves), then split into the layers a kid takes apart: studs, sole (the
 * plate), midsole (a stitched welt on the leather boots, an inner board on the modern ones), insole, heel counter, padding, lining,
 * upper, tongue, grip zone, sock collar, toe-cap / toe box and laces (or the lace cover).
 *
 * Each era picks the closest shop silhouette (facts.ts): the early-1900s boot is the 1979 classic raised over the ankle with a
 * laced leather shaft and a hard toe-cap, the 1950s boot the 1968 retro a little lower, the 1970s–80s the classic, the 1990s the
 * power boot with fins, today's the knit sock boot. Units here are millimetres (x heel → toe, y across with + the outside of the
 * foot, z up from the ground the studs stand on); the shop's decimetres (y up, z across) are converted once per point.
 */
export type StudKind='nailed'|'screw'|'moulded'|'blade'|'fg'|'sg'|'ag'|'tf'|'ic';
export type PartId='studs'|'sole'|'midsole'|'insole'|'foam'|'counter'|'lining'|'upper'|'tongue'|'grip'|'collar'|'toecap'|'laces';
export type BootSpec={
 /** The Kit Shop silhouette this boot is sampled from. */
 model:BootModel;
 /** A laced leather shaft over the ankle, this many mm above the heel's collar (the early boots). */
 shaft?:number;
 /** Lower the collar by this share around the ankle (0–.3): a lower cut than the shop model. */
 lower?:number;
 studs:StudKind;
 mats:{upper:string;lining:string;sole:string;mid:string;insole:string;counter:string;toecap:string;studs:string;tip?:string;laces:string;foam?:string;grip?:string;collar?:string;tongue?:string};
 toecap:'hard'|'stitched'|'box';laces:'laces'|'cover';tongue:'plain'|'fold'|'none';
 foam?:boolean;sock?:boolean;texture?:'fins'|'dots'|'knit'|'none';lacesColor:string;stitch?:string;
};
export type Part={id:PartId;meshes:Mesh[];marks:Mark[];anchor:{p:V3;n:V3|null};out:V3;inner:boolean;skin:boolean;box?:{r:number;z0:number;z1:number}};
/** `opening`: the rim of the opening the foot goes in (the collar, the shaft's top or the sock collar's top), for the tests. */
export type Boot={parts:Part[];C:V3;R:number;Rr:number;zMax:number;faces:number;opening:V3[]};

const clamp01=(x:number)=>Math.max(0,Math.min(1,x));
const sm=(a:number,b:number,x:number)=>{const t=clamp01((x-a)/(b-a));return t*t*(3-2*t);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
export const LEN=SG.BOOT_L*100,X0=-LEN/2;
/** Stations along the foot, dense at both ends (cosine spacing). */
export const stations=(n:number)=>Array.from({length:n+1},(_,i)=>.5-.5*Math.cos(Math.PI*i/n));

/** The shop's stud layout for each of the exhibit's plates (nailed leather and screw-ins sit where the moulded studs would). */
const STUD_TYPE:Record<StudKind,StudType>={nailed:'fg',screw:'sg',moulded:'fg',blade:'blade',fg:'fg',sg:'sg',ag:'ag',tf:'turf',ic:'indoor'};

/** Make every face of a mesh wind outward from an axis (the renderer shades and culls by the winding). */
function orient(m:Mesh,axis:(p:V3)=>V3){
 let vote=0;for(const f of m.faces){const pts=f.map(i=>m.verts[i]),n=normalOf(pts),c=pts.reduce((a,p)=>[a[0]+p[0]/pts.length,a[1]+p[1]/pts.length,a[2]+p[2]/pts.length] as V3,[0,0,0] as V3),o=axis(c);
  vote+=Math.sign(n[0]*(c[0]-o[0])+n[1]*(c[1]-o[1])+n[2]*(c[2]-o[2]));}
 if(vote<0)m.faces=m.faces.map(f=>[...f].reverse());return m;
}
/** Quads between consecutive rows of a rows × cols grid. */
function grid(rows:number,cols:number,o=0,wrap=false){const f:number[][]=[];for(let i=0;i<rows-1;i++)for(let j=0;j<(wrap?cols:cols-1);j++){const a=o+i*cols+j,b=o+i*cols+(j+1)%cols;f.push([a,a+cols,b+cols,b]);}return f;}

const cache=new Map<string,Boot>();
/** Build (or reuse) a boot at a level of detail (1 at rest, .6 in motion, about .5 for thumbnails and the balance). */
export function buildBoot(sp:BootSpec,detail=1):Boot{
 const key=JSON.stringify(sp)+'@'+detail,hit=cache.get(key);if(hit)return hit;
 const prev=SG.shape().id;SG.useShape(sp.model);
 let b:Boot;try{b=build(sp,detail);}finally{SG.useShape(prev);}
 if(cache.size>40)cache.delete(cache.keys().next().value!);cache.set(key,b);return b;
}

function build(sp:BootSpec,detail:number):Boot{
 const sh=SG.shape(),type=STUD_TYPE[sp.studs],flat=type==='indoor',plate=sh.plate,parts:Part[]=[];
 const ink=sp.stitch??'#2a2622';
 // ── the studs first: they set the ground ────────────────────────────────────────────────────────────────────────────────
 const lay=flat?[]:SG.studLayout(type);
 const depth=(st:SG.StudSpot)=>sp.studs==='nailed'?.12:sp.studs==='screw'?.13:SG.STUD_DEPTH[st.shape]*st.scale;
 let g=Infinity;for(const st of lay)g=Math.min(g,SG.underAt(st.x,st.z,type)+.003-depth(st));
 if(!lay.length)for(let s=0;s<=1;s+=.02)g=Math.min(g,SG.plateUnder(s,0,type)-.002);
 // the shop's decimetres (y up, z across) → millimetres (z up from the ground, y across)
 const lowK=(s:number)=>1-(sp.lower??0)*(1-sm(.3,.46,s));
 const mm=(x:number,y:number,z:number):V3=>[x*100,z*100,(y-g)*100];
 const upV=(v:T.Vector3):V3=>{const s=SG.sAt(v.x),yb=SG.base(s);return mm(v.x,yb+(v.y-yb)*lowK(s),v.z);};
 const nrm=(s:number,phi:number):V3=>{const n=SG.surfaceNormal(Math.min(.997,Math.max(.003,s)),phi);return [n.x,n.z,n.y];};
 const add=(p:V3,n:V3,d:number):V3=>[p[0]+n[0]*d,p[1]+n[1]*d,p[2]+n[2]*d];
 /** A point on the upper at (s, φ), `d` mm out along the normal (negative: inward). */
 const S=(s:number,phi:number,d=0):V3=>{const p=upV(SG.surface(s,phi));return d?add(p,nrm(s,phi),d):p;};
 // the boot's axis (for winding): the plan's centre line at mid height
 const axis=(p:V3):V3=>{const s=SG.sAt(p[0]/100),pl=SG.plan(s);return [p[0],pl.zc*100,(SG.base(s)+.3-g)*100];};
 const mesh=(part:PartId,mat:string,verts:V3[],faces:number[][],o:Partial<Mesh>={},ax:(p:V3)=>V3=axis):Mesh=>orient(weld({part,mat,verts,faces,...o}),ax);
 const NR=Math.max(12,Math.round(30*detail)),M=Math.max(4,Math.round(8*detail)),us=stations(NR);
 const open=(s:number)=>SG.isOpen(s);
 const rowsUpTo=(a:number,b:number,n:number)=>Array.from({length:n+1},(_,i)=>lerp(a,b,.5-.5*Math.cos(Math.PI*i/n)));

 // ── Studs ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 {const meshes:Mesh[]=[],marks:Mark[]=[];let anchor:V3=[0,0,0];const n0=detail>=.8?10:8;
  const circ=(r:number,n=n0):[number,number][]=>Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2;return [Math.cos(a)*r,Math.sin(a)*r];});
  const supe=(w:number,d:number,e:number,n=n0+2):[number,number][]=>Array.from({length:n},(_,i)=>{const t=i/n*Math.PI*2,c=Math.cos(t),s=Math.sin(t);return [w/2*Math.sign(c)*Math.abs(c)**(2/e),d/2*Math.sign(s)*Math.abs(s)**(2/e)];});
  const outline=(shape:SG.StudShape):{ol:[number,number][];tip:[number,number]}=>{switch(shape){
   case 'blade':return {ol:supe(.17,.052,3.2),tip:[.76,.44]};case 'bladeThin':return {ol:supe(.16,.04,3.2),tip:[.74,.45]};case 'bladeRound':return {ol:supe(.15,.062,2.3),tip:[.82,.7]};
   case 'slim':return {ol:supe(.19,.038,2.8),tip:[.66,.5]};case 'cluster':return {ol:supe(.094,.034,2.6),tip:[.72,.5]};
   case 'chevron':return {ol:[[.06,0],[-.026,.084],[-.06,.066],[.004,0],[-.06,-.066],[-.026,-.084]],tip:[.82,.78]};
   case 'tri':return {ol:[[.072,0],[.02,.03],[-.05,.054],[-.05,0],[-.05,-.054],[.02,-.03]],tip:[.62,.56]};
   case 'halfmoon':{const p:[number,number][]=[[-.018,-.05]];for(let i=1;i<6;i++){const a=-Math.PI/2+i*Math.PI/6;p.push([-.018+Math.cos(a)*.062,Math.sin(a)*.05]);}p.push([-.018,.05]);return {ol:p,tip:[.66,.62]};}
   case 'ag':return {ol:circ(.044,8),tip:[.8,.8]};case 'nub':return {ol:circ(.03,6),tip:[.6,.6]};case 'pod':return {ol:circ(.05),tip:[.62,.62]};
   case 'coneShort':return {ol:circ(.05),tip:[.66,.66]};default:return {ol:circ(.054),tip:[.6,.6]};}};
  /** A drafted stud: rings at the plate, half way and the tip, a fan cap. In mm, centred on (x, z) of the shop plan. */
  const studMesh=(mat:string,x:number,z:number,yaw:number,sc:number,ol:[number,number][],top:number,h:number,tip:[number,number],o:Partial<Mesh>={}):Mesh=>{
   const cy=Math.cos(yaw),sy=Math.sin(yaw),verts:V3[]=[],n=ol.length,faces:number[][]=[];
   const ring=(y:number,kx:number,kz:number)=>{for(const [a,b] of ol){const lx=a*kx*sc,lz=b*kz*sc;verts.push(mm(x+lx*cy+lz*sy,y,z-lx*sy+lz*cy));}};
   ring(top+.004,1,1);ring(top-h*.55,lerp(1,tip[0],.55),lerp(1,tip[1],.55));ring(top-h,tip[0],tip[1]);
   for(let r=0;r<2;r++)for(let i=0;i<n;i++){const j=(i+1)%n;faces.push([r*n+i,r*n+j,(r+1)*n+j,(r+1)*n+i]);}
   verts.push(mm(x,top-h-.004,z));const c=verts.length-1;for(let i=0;i<n;i++)faces.push([2*n+(i+1)%n,2*n+i,c]);
   const ax=mm(x,0,z);return orient({part:'studs',mat,verts,faces,...o},p=>[ax[0],ax[1],p[2]]);};
  const mat=sp.mats.studs,tip=sp.mats.tip??mat;
  lay.forEach((st,i)=>{const top=SG.underAt(st.x,st.z,type)+.003,h=depth(st);
   if(i===0)anchor=mm(st.x,top-h*.5,st.z);
   if(sp.studs==='nailed'){// three stacked leather layers and three nail heads underneath
    meshes.push(studMesh(mat,st.x,st.z,0,1,circ(.074,n0),top,h,[.86,.86]));
    const b=mm(st.x,top-h,st.z);for(const [dx,dy] of [[-2,-1.6],[2,-1.6],[0,2.2]]){marks.push({part:'studs',pts:[[b[0]+dx,b[1]+dy,b[2]]],n:[0,0,-1],w:0,color:'#5b5f66',dots:true,r:.9});
     marks.push({part:'studs',pts:[[b[0]+dx,b[1]+dy,b[2]+.6],[b[0]+dx,b[1]+dy,b[2]+h*100+plate.t*80]],n:null,w:.55,color:'#6b7078',xray:true,bias:4});}
   }else if(sp.studs==='screw'||type==='sg'){// a body that screws onto a steel thread, and an aluminium or metal tip
    const r=st.shape==='sgShort'?.052:.062;
    meshes.push(studMesh(mat,st.x,st.z,0,1,circ(r),top,h*.55,[.92,.92]));meshes.push(studMesh(tip,st.x,st.z,0,1,circ(r*.9),top-h*.55+.003,h*.45+.003,[.62,.62]));
    meshes.push(studMesh('steel',st.x,st.z,0,1,circ(.026,8),top+plate.t*.85,plate.t*.85,[1,1],{xray:true,bias:3}));
    const c=mm(st.x,top,st.z);for(let q=1;q<=3;q++)marks.push({part:'studs',pts:circ(2.8,10).map(([a,b2])=>[c[0]+a,c[1]+b2,c[2]+q*plate.t*20] as V3).concat([[c[0]+2.8,c[1],c[2]+q*plate.t*20]]),n:null,w:.35,color:'#4d5157',xray:true,bias:4});
   }else{const {ol,tip:tk}=outline(st.shape);meshes.push(studMesh(mat,st.x,st.z,st.yaw,st.scale,ol,top,h,tk));
    if(type==='ag'){const c=mm(st.x,top-h,st.z);marks.push({part:'studs',pts:circ(2.4,10).map(([a,b2])=>[c[0]+a,c[1]+b2,c[2]] as V3).concat([[c[0]+2.4,c[1],c[2]]]),n:[0,0,-1],w:.5,color:'#1d1d1b'});}}
  });
  if(flat){// a flat gum sole: a herringbone tread and a pivot circle underneath
   for(let s=.06;s<.95;s+=.05){if(s>.32&&s<.46)continue;const pl=SG.plan(s),x=SG.sx(s),y=SG.plateUnder(s,0,type)-.0005;
    marks.push({part:'studs',pts:[-1,-.5,0,.5,1].map((f,i)=>mm(x+(i%2?.04:-.04),y,pl.zc+(f<0?pl.med:pl.lat)*f*.86)),n:[0,0,-1],w:.6,color:'#6d5a43'});}
   const pc=SG.sx(.7),pl=SG.plan(.7),py=SG.plateUnder(.7,0,type)-.0008;
   marks.push({part:'studs',pts:Array.from({length:21},(_,i)=>{const a=i/20*Math.PI*2;return mm(pc+Math.cos(a)*.16,py,pl.zc+Math.sin(a)*.16);}),n:[0,0,-1],w:.7,color:'#6d5a43'});
   anchor=mm(pc,py,pl.zc);}
  parts.push({id:'studs',meshes,marks,anchor:{p:anchor,n:null},out:[0,0,-118],inner:false,skin:sp.studs==='nailed'});}

 // ── The plate (sole) and the midsole: a welt on the leather boots, an inner board on the modern ones ───────────────────────
 const welt=plate.welt&&!flat,weltLo=.013;
 const edgeN=(s:number,side:0|1):[number,number]=>{if(s<=1e-4)return [-1,0];if(s>=1-1e-4)return [1,0];const e=.003,pt=(t:number)=>{const p=SG.plan(t);return [SG.sx(t),p.zc+(side?p.lat:-p.med)];};
  const a=pt(Math.max(0,s-e)),c=pt(Math.min(1,s+e)),dx=c[0]-a[0],dz=c[1]-a[1],n=side?[-dz,dx]:[dz,-dx],l=Math.hypot(n[0],n[1])||1;return [n[0]/l,n[1]/l];};
 const plateRows=(()=>{const n=Math.max(14,Math.round(26*detail)),r=stations(n).map(t=>t);for(const s of [SG.HEEL_BREAST-.006,SG.HEEL_BREAST+.004])r.push(s);return [...new Set(r)].sort((a,b)=>a-b);})();
 {const KU=detail>=.8?4:3,verts:V3[]=[],rows:number[][]=[];let NC=0;
  for(const s of plateRows){const yb=SG.base(s),H=SG.hsec(s),pl=SG.plan(s),cup=1-sm(.02,.22,s);
   const h=Math.min(H*.9,SG.wallHeight(s,type)),phiW=Math.asin(Math.min(1,h/Math.max(1e-4,H)));
   const side=(sd:0|1)=>{const out:V3[]=[],[nx,nz]=edgeN(s,sd),sgn=sd?1:-1,yE=SG.plateUnder(s,sgn,type);
    for(const k of [0,.5]){const phi=sd?Math.PI-phiW*(1-k):phiW*(1-k),p=SG.surface(s,phi),n=SG.surfaceNormal(Math.min(.997,Math.max(.003,s)),phi),th=.006+(.0012+.004*cup)*k*2;
     out.push(mm(p.x+n.x*th,p.y+n.y*th,p.z+n.z*th));}
    const ex=SG.sx(s),ez=pl.zc+sgn*(sd?pl.lat:pl.med),o0=.0085+.007*cup,fl=plate.flare,thick=Math.max(.004,yb-yE),r=Math.min(plate.bevel,thick*.45);
    const inset=flat?0:plate.waist[sd]*sm(SG.HEEL_BREAST,.35,s)*(1-sm(.49,.585,s))+(plate.heelIn??0)*(1-sm(.2,.3,s));
    const at=(o:number,y:number)=>out.push(mm(ex+nx*o,y,ez+nz*o));
    at(o0+fl*.55,yb-(welt?weltLo:.0015));at(o0+fl-inset*.5,Math.max(yE+r+.001,yb-(welt?weltLo+.003:.006)));at(o0+fl-inset,yE+r);at(o0+fl-inset-r,yE);
    return out;};
   const A=side(0),B=side(1),bm=A[A.length-1],bl=B[B.length-1],row=[...A];
   for(let k=1;k<KU;k++){const t=k/KU,x=lerp(bm[0],bl[0],t),z=lerp(bm[1],bl[1],t);row.push([x,z,(SG.plateUnder(s,-1+2*t,type)-g)*100]);}
   row.push(...B.reverse());NC=row.length;rows.push([verts.length]);verts.push(...row);}
  const m=mesh('sole',sp.mats.sole,verts,grid(plateRows.length,NC),{two:false,inner:sp.mats.sole,bias:0,layer:6},p=>{const s=SG.sAt(p[0]/100),pl=SG.plan(s);return [p[0],pl.zc*100,(SG.base(s)-plate.t*.5-g)*100];});
  const marks:Mark[]=[];
  if(!welt&&!flat)for(const sd of [0,1] as const)marks.push({part:'sole',pts:plateRows.filter(s=>s>.03&&s<.97).map(s=>{const pl=SG.plan(s),[nx,nz]=edgeN(s,sd),sgn=sd?1:-1,o=.0088+.007*(1-sm(.02,.22,s))+plate.flare*.8;
   return mm(SG.sx(s)+nx*o,SG.base(s)-.004,pl.zc+sgn*(sd?pl.lat:pl.med)+nz*o);}),n:[0,sd?1:-1,0],w:.35,color:'rgba(0,0,0,.3)'});
  const s5=.42,p5=SG.plan(s5);
  parts.push({id:'sole',meshes:[m],marks,anchor:{p:mm(SG.sx(s5),SG.base(s5)-plate.t*.6,p5.zc+p5.lat+.01),n:[0,1,0]},out:[0,0,-86],inner:false,skin:true});}
 {const verts:V3[]=[],K=3,rs=plateRows.filter(s=>s>0&&s<1);rs.unshift(0);rs.push(1);
  // welt: a stitched ledge round the boot, proud of the upper; board: a thin layer inside the plate
  const w=(s:number,sd:0|1)=>welt?.0085+.007*(1-sm(.02,.22,s))+plate.flare+.006:-.012;
  const y0=(s:number)=>SG.base(s)-(welt?weltLo:.009),y1=(s:number)=>SG.base(s)-(welt?.003:.001);
  for(const s of rs){const pl=SG.plan(s),ex=SG.sx(s);
   for(const top of [0,1])for(let k=0;k<=K;k++){const t=k/K,sd:0|1=t<.5?0:1,f=-1+2*t,[nx,nz]=edgeN(s,sd),side=Math.abs(f),o=w(s,sd)*side;
    verts.push(mm(ex+nx*o*(k===0||k===K?1:0),top?y1(s):y0(s),pl.zc+(f<0?pl.med:pl.lat)*f+nz*o));}}
  const row=(K+1)*2,faces:number[][]=[];
  for(let i=0;i<rs.length-1;i++){const a=i*row,b=(i+1)*row;
   for(let k=0;k<K;k++){faces.push([a+K+1+k,b+K+1+k,b+K+2+k,a+K+2+k]);faces.push([a+k+1,b+k+1,b+k,a+k]);}
   faces.push([a,b,b+K+1,a+K+1]);faces.push([a+K+1+K,b+K+1+K,b+K,a+K]);}
  const m=mesh('midsole',sp.mats.mid,verts,faces,{bias:0,layer:2},p=>{const s=SG.sAt(p[0]/100),pl=SG.plan(s);return [p[0],pl.zc*100,(y0(s)+y1(s))*50-g*100];});
  const marks:Mark[]=[];
  if(welt)for(const sd of [0,1] as const)marks.push({part:'midsole',pts:rs.filter(s=>s>.02&&s<.98).map(s=>{const pl=SG.plan(s),[nx,nz]=edgeN(s,sd),sgn=sd?1:-1,o=w(s,sd)*.8;
   return mm(SG.sx(s)+nx*o,y1(s)+.0002,pl.zc+sgn*(sd?pl.lat:pl.med)+nz*o);}),n:[0,0,1],w:0,color:ink,on:sp.mats.mid,dots:true,r:.5});
  const s6=.62,p6=SG.plan(s6);
  parts.push({id:'midsole',meshes:[m],marks,anchor:{p:mm(SG.sx(s6),y0(s6),p6.zc+p6.lat+(welt?.02:0)),n:[0,1,0]},out:[0,0,-58],inner:!welt,skin:welt});}

 // ── Insole ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 // The footbed closes the bottom of the upper wall to wall and heel to toe (Oct 13 2026, user: "can see through the boots"):
 // it is drawn while the boot is whole, so looking into the collar shows the insole, never the studs or the turntable. Its top
 // reaches a little past the walls (hidden under them) so the coarser rows never leave a gap at the edge.
 {const verts:V3[]=[],K=3,rs=stations(Math.max(10,Math.round(NR/2)));
  for(const s of rs){const pl=SG.plan(s),ex=SG.sx(s);for(const y of [SG.base(s)+.004,SG.base(s)+.03])for(let k=0;k<=K;k++){const f=-1+2*k/K,w=y>SG.base(s)+.01?1.03:.97;verts.push(mm(ex,y,pl.zc+(f<0?pl.med:pl.lat)*f*w));}}
  const row=(K+1)*2,faces:number[][]=[];const n=rs.length;
  for(let i=0;i<n-1;i++){const a=i*row,b=(i+1)*row;for(let k=0;k<K;k++){faces.push([a+K+1+k,b+K+1+k,b+K+2+k,a+K+2+k]);faces.push([a+k+1,b+k+1,b+k,a+k]);}
   faces.push([a,b,b+K+1,a+K+1]);faces.push([a+K+1+K,b+K+1+K,b+K,a+K]);}
  for(let k=0;k<K;k++){faces.push([k,k+1,K+2+k,K+1+k]);const e=(n-1)*row;faces.push([e+k+1,e+k,e+K+1+k,e+K+2+k]);}
  const m=mesh('insole',sp.mats.insole,verts,faces,{bias:.4,layer:3,floor:true},p=>{const s=SG.sAt(p[0]/100),pl=SG.plan(s);return [p[0],pl.zc*100,(SG.base(s)+.017-g)*100];});
  parts.push({id:'insole',meshes:[m],marks:[],anchor:{p:mm(SG.sx(.4),SG.base(.4)+.03,SG.plan(.4).zc),n:[0,0,1]},out:[0,0,-30],inner:false,skin:false});}

 // ── The upper: both walls sampled from the shop surface, the ankle opening cut at its collar line ──────────────────────────
 /** A loft over the upper's surface: rows `rs`, both walls from the sole edge up to the collar (or over the top when closed). */
 const shell=(part:PartId,mat:string,inner:string,rs:number[],m:number,pt:(s:number,phi:number)=>V3,tTo=(s:number)=>SG.rimPhi(s),o:Partial<Mesh>={})=>{
  const verts:V3[]=[],faces:number[][]=[];
  for(const side of [-1,1]){const base=verts.length;
   for(const s of rs){const pr=tTo(s);for(let j=0;j<=m;j++){const t=j/m,phi=side<0?pr*t:Math.PI-pr*t;verts.push(pt(s,phi));}}
   faces.push(...grid(rs.length,m+1,base).map(f=>side>0?f.reverse():f));}
  return mesh(part,mat,verts,faces,{inner,two:true,soft:true,shell:true,...o});};
 const upperRows=[...new Set([...us,SG.S_THROAT-.004,SG.S_THROAT])].sort((a,b)=>a-b);
 const rimPt=(s:number,side:number,d=0)=>S(s,side<0?SG.rimPhi(s):Math.PI-SG.rimPhi(s),d);
 const shaft=sp.shaft?sp.shaft/100:0;
 // the leather shaft of an early boot: from the collar line up round the ankle, open at the front for the laces
 const shaftInfo=(()=>{if(!shaft)return null;
  const R=Math.max(3,Math.round(5*detail)),N=Math.max(10,Math.round(20*detail)),sF=SG.S_THROAT-.012;
  const loop:{s:number;side:number}[]=[];for(let i=0;i<=N;i++)loop.push({s:lerp(sF,.004,i/N),side:-1});for(let i=N;i>=0;i--)loop.push({s:lerp(sF,.004,i/N),side:1});
  const lo=loop.map(q=>rimPt(q.s,q.side)),len=[0];for(let i=1;i<lo.length;i++)len.push(len[i-1]+Math.hypot(lo[i][0]-lo[i-1][0],lo[i][1]-lo[i-1][1],lo[i][2]-lo[i-1][2]));
  const L=len[len.length-1],cx=lo.reduce((a,p)=>a+p[0],0)/lo.length+8,cy=lo.reduce((a,p)=>a+p[1],0)/lo.length,zTop=Math.max(...lo.map(p=>p[2]))+shaft*100;
  const rx=31,ry=27,a0=Math.asin(6.5/ry);
  const top=lo.map((_,i)=>{const t=len[i]/L,a=-a0-(Math.PI*2-2*a0)*t;return [cx+Math.cos(a)*rx-6,cy+Math.sin(a)*ry,zTop+3*Math.cos(a)] as V3;});
  const rows:V3[][]=[];for(let r=0;r<=R;r++){const h=r/R,e=1-(1-h)**2.2;rows.push(lo.map((p,i)=>[lerp(p[0],top[i][0],e),lerp(p[1],top[i][1],e),lerp(p[2],top[i][2],h)] as V3));}
  return {rows,n:lo.length,zTop,front:(side:number,h:number):V3=>{const r=rows.map(rw=>rw[side<0?0:rw.length-1]);const f=h*(r.length-1),i=Math.min(r.length-2,Math.floor(f)),t=f-i;return [lerp(r[i][0],r[i+1][0],t),lerp(r[i][1],r[i+1][1],t),lerp(r[i][2],r[i+1][2],t)];}};})();
 let opening:V3[]=shaftInfo?shaftInfo.rows[shaftInfo.rows.length-1]:[...upperRows.filter(s=>open(s)).map(s=>rimPt(s,-1)),...upperRows.filter(s=>open(s)).reverse().map(s=>rimPt(s,1))];
 {const meshes:Mesh[]=[shell('upper',sp.mats.upper,sp.mats.lining,upperRows,M,(s,phi)=>S(s,phi))],marks:Mark[]=[];
  // the collar's padded rim: the upper's top edge rolled in to the lining
  const ou=upperRows.filter(s=>open(s)),verts:V3[]=[],faces:number[][]=[];
  if(!shaftInfo)for(const side of [-1,1]){const b=verts.length;ou.forEach(s=>{verts.push(rimPt(s,side));verts.push(rimPt(s,side,-3.2));});for(let i=0;i<ou.length-1;i++){const a=b+i*2;faces.push(side>0?[a+1,a+3,a+2,a]:[a,a+2,a+3,a+1]);}}
  if(faces.length)meshes.push(orient(weld({part:'upper',mat:sp.foam?(sp.mats.foam??'foam'):sp.mats.lining,inner:sp.mats.lining,verts,faces,two:true,bias:.3,soft:true}),p=>{const q=axis(p);return [q[0],q[1],p[2]+40];}));
  if(shaftInfo){const {rows,n}=shaftInfo,v=rows.flat(),f=grid(rows.length,n);
   meshes.push(orient(weld({part:'upper',mat:sp.mats.upper,inner:sp.mats.lining,verts:v,faces:f,two:true,soft:true,shell:true,bias:.2}),p=>{const c=rows[0].reduce((a,q)=>[a[0]+q[0]/n,a[1]+q[1]/n,0] as V3,[0,0,0] as V3);return [c[0],c[1],p[2]];}));
   // a stitched seam where the shaft meets the quarter
   marks.push({part:'upper',pts:rows[0].filter((_,i)=>i%2===0),n:null,w:0,color:ink,on:sp.mats.upper,dots:true,r:.42,bias:.8});}
  // fins (the 1990s power boot): rubber ridges over the strike zone, both sides of the lacing, as on the shop's model
  if(sp.texture==='fins'){const e=sh.eyes,edge=e.hw+.04,NS=Math.max(4,Math.round(6*detail)),lo=Math.asin(.16),rowsN=Math.max(8,Math.round(SG.FIN_ROWS*detail));
   const runs:{s:number;p0:number;p1:number}[]=[];
   for(let k=0;k<rowsN;k++){const s=lerp(.55,.9,k/(rowsN-1));if(s>e.s1+.045)runs.push({s,p0:lo,p1:Math.PI-lo});else{runs.push({s,p0:lo,p1:SG.phiAcross(s,sh.laceC-edge)});runs.push({s,p0:Math.PI-lo,p1:SG.phiAcross(s,sh.laceC+edge)});}}
   const fv:V3[]=[],ff:number[][]=[];
   for(const r of runs){const o=fv.length;
    for(let i=0;i<=NS;i++){const t=i/NS,phi=lerp(r.p0,r.p1,t),s=Math.min(1,Math.max(0,r.s+.06*Math.abs(Math.sin(phi))-.03)),p=S(s,phi),n=nrm(s,phi),pa=S(Math.min(1,s+.01),phi),
      tg:V3=[pa[0]-p[0],pa[1]-p[1],pa[2]-p[2]],l=Math.hypot(...tg)||1,h=2*Math.min(1,t/.12,(1-t)/.12)**.6;
     for(const [x,y] of [[-1.2,-.2],[0,1],[1.2,-.2]] as const)fv.push(add(add(p,[tg[0]/l,tg[1]/l,tg[2]/l],x*1.8),n,y*h));}
    const run=orient({part:'upper',mat:'rubber',verts:fv,faces:grid(NS+1,3,o)},axis);ff.push(...run.faces);}
   meshes.push(weld({part:'upper',mat:'rubber',verts:fv,faces:ff,bias:3.5,soft:true}));}
  // seams and stitching from the shop's design: the heel overlay's front edge, a quilted toe, a stitched side panel, the vamp's toe line
  for(const side of [-1,1]){
   const hb:V3[]=[];for(let k=0;k<=6;k++){const yr=.04+.9*k/6,s=Math.max(.02,SG.heelBorder(yr)),H=SG.hsec(s),rimH=SG.rim(s)/H;if(yr>rimH-.02)break;const phi=Math.asin(Math.min(1,yr));hb.push(S(s,side<0?phi:Math.PI-phi,.35));}
   if(hb.length>1)marks.push({part:'upper',pts:hb,n:[0,side,0],w:.4,color:ink,on:sp.mats.upper,bias:2.5});
   marks.push({part:'upper',pts:us.filter(s=>s>.03&&s<.97).map(s=>S(s,side<0?.08:Math.PI-.08,.3)),n:[0,side,0],w:0,color:ink,on:sp.mats.upper,dots:true,r:.38,bias:.8});
   const quilt=sp.toecap!=='hard'&&(sh.feat.quilt||sh.relief.quilt)?(sh.id==='classic'?7:4):0;
   for(let q=0;q<=quilt;q++){const pts:V3[]=[];for(let k=0;k<=8;k++){const yr=.08+.9*k/8,s=.705+.085*yr+.012*Math.sin(yr*9)+q*.08/SG.BOOT_L;if(s>.985)break;const phi=Math.asin(Math.min(.999,yr));pts.push(S(s,side<0?phi:Math.PI-phi,.35));}
    if(pts.length>1)marks.push({part:'upper',pts,n:[.25,side*.75,.4],w:q?.3:.4,color:q?mixInk(ink):ink,on:sp.mats.upper,bias:2.5});}
   if(sh.feat.panel){const box:V3[]=[];const P4=[[.23,.2],[.63,.2],[.63,.58],[.23,.58],[.23,.2]] as const;for(let i=0;i<4;i++)for(let k=0;k<=4;k++){const s=lerp(P4[i][0],P4[i+1][0],k/4),yr=lerp(P4[i][1],P4[i+1][1],k/4),ph=Math.asin(yr);box.push(S(s,side<0?ph:Math.PI-ph,.35));}
    marks.push({part:'upper',pts:box,n:[0,side,0],w:0,color:ink,on:sp.mats.upper,dots:true,r:.38,bias:.8});}
  }
  if(sp.texture==='knit')for(let yr=.14;yr<.95;yr+=.12)for(const side of [-1,1]){const phi=Math.asin(yr);marks.push({part:'upper',pts:us.filter(s=>s>.06&&s<.97&&SG.rim(s)/SG.hsec(s)>yr+.02).map(s=>S(s,side<0?phi:Math.PI-phi,.25)),n:[0,side,0],w:.3,color:'rgba(0,0,0,.16)',bias:.5});}
  const s7=.55,ph7=Math.PI-Math.asin(.45);
  parts.push({id:'upper',meshes,marks:marks.filter(k=>k.pts.length>0),anchor:{p:S(s7,ph7),n:nrm(s7,ph7)},out:[0,0,0],inner:false,skin:true});}

 // ── Heel counter (between the upper and the lining) ───────────────────────────────────────────────────────────────────────
 {const cs=rowsUpTo(0,.27,Math.max(5,Math.round(9*detail))),top0=.55*SG.rim(0);
  const hc=(s:number)=>top0*(1-.6*sm(.04,.27,s));
  const m=shell('counter',sp.mats.counter,sp.mats.counter,cs,Math.max(3,M-3),(s,phi)=>S(s,phi,-1.3),s=>Math.asin(Math.min(.99,hc(s)/SG.hsec(s))),{soft:true});
  parts.push({id:'counter',meshes:[m],marks:[],anchor:{p:S(.05,Math.PI-.5,-1.3),n:[-.4,1,0]},out:[-108,0,34],inner:true,skin:false});}
 // ── Foam padding round the heel and ankle ─────────────────────────────────────────────────────────────────────────────────
 if(sp.foam){const fs=upperRows.filter(s=>open(s)&&s<SG.S_THROAT-.02);
  const m=shell('foam',sp.mats.foam??'foam',sp.mats.foam??'foam',fs,3,(s,phi)=>{const pr=SG.rimPhi(s),t=Math.min(phi,Math.PI-phi)/pr,ph=lerp(pr*.55,pr*.985,t);return S(s,phi<Math.PI/2?ph:Math.PI-ph,-2.6);});
  parts.push({id:'foam',meshes:[m],marks:[],anchor:{p:S(.1,Math.PI-SG.rimPhi(.1)*.8,-2.6),n:[0,1,0]},out:[-84,-56,112],inner:true,skin:false});}
 // ── Lining ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 {const ls=[...new Set([...stations(Math.max(10,Math.round(20*detail))),SG.S_THROAT-.004,SG.S_THROAT])].sort((a,b)=>a-b).filter(s=>s>.004&&s<.99);
  const m=shell('lining',sp.mats.lining,sp.mats.lining,ls,Math.max(3,M-2),(s,phi)=>S(s,phi,-3.2));
  parts.push({id:'lining',meshes:[m],marks:[],anchor:{p:S(.42,.6,-3.2),n:[0,-1,0]},out:[-30,-110,58],inner:true,skin:true});}

 // ── Tongue: the shop's own curve (a slim tongue, or a long tongue folded forward over the laces) ────────────────────────────
 const laceLine=(s:number,lift:number)=>{const phi=SG.phiAcross(s,sh.laceC),p=SG.surface(s,phi),n=SG.surfaceNormal(s,phi);return p.addScaledVector(n,lift);};
 const hasTongue=sp.tongue!=='none'&&!sp.sock&&sp.laces!=='cover';
 if(hasTongue){const e=sh.eyes,tg=sh.tongue,fold=sp.tongue==='fold'&&tg.kind==='fold'&&!shaftInfo;
  let curve:T.Curve<T.Vector3>,fv=2;
  if(fold){const c=SG.tongueCurve();curve=c.curve;fv=c.fold;}
  else{const top=shaftInfo?(shaftInfo.zTop/100+g):SG.base(.392)+Math.min(tg.top,SG.hsec(.392)+.13)*lowK(.37);
   const zc=(s:number)=>SG.plan(s).zc+sh.laceC*.8;
   const back=(p:V3)=>new T.Vector3(p[0]/100,p[2]/100+g,p[1]/100);
   const pts=shaftInfo?(()=>{const f=(h:number)=>{const a=shaftInfo.front(-1,h),c=shaftInfo.front(1,h);return back([(a[0]+c[0])/2-4,(a[1]+c[1])/2,(a[2]+c[2])/2]);};const t=f(1);t.y+=.06;return [laceLine(e.s0+.09,-.012),laceLine(e.s0+.02,.006),f(0),f(.5),t];})()
    :[laceLine(e.s0+.09,-.012),laceLine(e.s0+.02,.006),new T.Vector3(SG.sx(.392),SG.base(.392)+(top-SG.base(.392))*.82,zc(.392)),new T.Vector3(SG.sx(.36),top,zc(.36))];
   curve=new T.CatmullRomCurve3(pts,false,'catmullrom',.5);}
  const NB=Math.max(6,Math.round((fold?16:9)*detail)),NA=4,front:V3[]=[],tan=new T.Vector3(),side=new T.Vector3(0,0,1),upv=new T.Vector3();const dirs:V3[]=[];
  // a folded tongue's flap ends after the first lace rows, so the laces read as criss-cross laces over the eyelets below it
  const end=fold?Math.min(1,fv+(1-fv)*.6):1;// (a folded tongue is leather on both sides: its flap is its back)
  for(let i=0;i<NB;i++){const u=i/(NB-1),bb=u*end,c=curve.getPointAt(bb);curve.getTangentAt(bb,tan);upv.crossVectors(tan,side).normalize();
   let w:number,bend=.04;
   if(!fold){w=lerp(tg.w,tg.w*1.15,bb);if(bb>.78)w*=Math.sqrt(Math.max(0,1-((bb-.78)/.22)**2))*.7+.3;if(shaftInfo)w*=.85;}
   else{const f=sm(fv-.06,fv+.12,bb);w=lerp(lerp(tg.w,tg.w*1.15,Math.min(1,bb/fv)),tg.flapW,f);bend=lerp(.04,.07,f);if(u>.8)w*=Math.sqrt(Math.max(0,1-((u-.8)/.2)**2))*.55+.45;}
   const inward=upv.clone().multiplyScalar(-Math.max(-1,Math.min(1,upv.y*3)));const sg=Math.sign(upv.y||1);dirs.push([upv.x*sg,upv.z*sg,upv.y*sg]);
   for(let j=0;j<NA;j++){const a=-1+2*j/(NA-1),P=c.clone().addScaledVector(side,a*w).addScaledVector(inward,bend*a*a).addScaledVector(upv,.006*Math.sign(upv.y||1));front.push(upV(P));}}
  const m=weld({part:'tongue',mat:sp.mats.tongue??sp.mats.upper,inner:fold?sp.mats.tongue??sp.mats.upper:sp.mats.lining,verts:front,faces:grid(NB,NA),two:true,soft:true,bias:fold?6:-.4});// a folded flap lies over the top laces
  const mid=front[Math.floor(NB*.5)*NA+1];
  {let vote=0;const raw=grid(NB,NA);raw.forEach((f,i)=>{const r=Math.floor(i/(NA-1));if(fold&&r/(NB-1)*end<fv+.05)return;// a folded tongue faces out on its flap
    const n=normalOf(f.map(k=>front[k])),d=dirs[r];vote+=n[0]*d[0]+n[1]*d[1]+n[2]*d[2];});
   if(vote<0)m.faces=m.faces.map(f=>[...f].reverse());}
  parts.push({id:'tongue',meshes:[m],marks:[],anchor:{p:front[Math.floor(NB*(fold?.75:.6))*NA+1]??mid,n:null},out:[24,0,96],inner:false,skin:true});}

 // ── Grip zone (modern): a coated patch on the inside of the forefoot ───────────────────────────────────────────────────────
 if(sp.texture==='dots'||sp.mats.grip){const gs=rowsUpTo(.56,.9,Math.max(4,Math.round(7*detail))),K=4;
  const f=(s:number,t:number)=>S(s,Math.asin(lerp(.22,.8,t)),1.3);
  const verts:V3[]=[];for(const s of gs)for(let k=0;k<=K;k++)verts.push(f(s,k/K));
  const marks:Mark[]=[];for(const s of gs)for(let k=1;k<K;k++)marks.push({part:'grip',pts:[f(s,k/K)],n:nrm(s,Math.asin(lerp(.22,.8,k/K))),w:0,color:'rgba(0,0,0,.4)',dots:true,r:.8});
  const m=mesh('grip',sp.mats.grip??'grip',verts,grid(gs.length,K+1),{inner:sp.mats.upper,two:true,bias:.8,soft:true});
  parts.push({id:'grip',meshes:[m],marks,anchor:{p:f(.74,.5),n:[0,-1,0]},out:[40,-80,124],inner:false,skin:false});}

 // ── Sock collar (modern): the shop's knit collar, from the collar line up the leg ──────────────────────────────────────────
 if(sp.sock){const height=sh.sockTop,N=Math.max(12,Math.round(22*detail)),ROWS=Math.max(3,Math.round(5*detail));
  const loop:V3[]=[];for(let i=0;i<=N;i++){const s=lerp(.006,SG.S_THROAT-.004,i/N);loop.push(S(s,SG.rimPhi(s)));}
  const sT=SG.S_THROAT-.004,pr=SG.rimPhi(sT);for(let i=1;i<5;i++){const phi=lerp(pr,Math.PI-pr,i/5),p=S(sT+.012,phi);loop.push([p[0],p[1],p[2]+2*Math.sin(Math.PI*i/5)]);}
  for(let i=N;i>=0;i--){const s=lerp(.006,SG.S_THROAT-.004,i/N);loop.push(S(s,Math.PI-SG.rimPhi(s)));}
  const n=loop.length,ctr=loop.reduce((a,p)=>[a[0]+p[0]/n,a[1]+p[1]/n,a[2]+p[2]/n] as V3,[0,0,0] as V3);
  const low=Math.max(0,Math.min(1,(1.08-height)/.3)),rx=(.245+.02*low)*100,ry=(.215+.018*low)*100;
  const ank=mm(SG.sx(.19),SG.base(.19)+height,SG.plan(.19).zc);
  const verts:V3[]=[];
  for(let r=0;r<=ROWS;r++){const h=r/ROWS;for(const p of loop){const a=Math.atan2(p[1]-ctr[1],p[0]-ctr[0]),top:V3=[ank[0]+Math.cos(a)*rx,ank[1]+Math.sin(a)*ry,ank[2]+2*Math.cos(a)];
   const b0:V3=[lerp(p[0],ctr[0],.03),lerp(p[1],ctr[1],.03),p[2]-2.5],e=1-(1-h)**3.4,waist=Math.sin(Math.PI*Math.max(0,Math.min(1,(h-.25)/.6)))*1.2;
   verts.push([lerp(b0[0],top[0],e)-Math.cos(a)*waist,lerp(b0[1],top[1],e)-Math.sin(a)*waist,lerp(b0[2],top[2],h*(2-h)*.55+h*.45)]);}}
  opening=verts.slice(ROWS*n,(ROWS+1)*n);
  const marks:Mark[]=[];for(let k=0;k<n;k+=2)marks.push({part:'collar',pts:Array.from({length:ROWS+1},(_,r)=>verts[r*n+k]),n:null,w:.3,color:'rgba(0,0,0,.18)',bias:.6});
  const m=orient(weld({part:'collar',mat:sp.mats.collar??sp.mats.upper,inner:sp.mats.lining,verts,faces:grid(ROWS+1,n,0,true),two:true,soft:true,shell:true,bias:.2}),p=>[ctr[0],ctr[1],p[2]]);
  parts.push({id:'collar',meshes:[m],marks,anchor:{p:verts[ROWS*n+Math.round(n*.75)],n:null},out:[-40,0,132],inner:false,skin:false});}

 // ── Toe-cap: a hard cap over the toes (early), a stitched leather cap, or today's thin toe box inside ────────────────────────
 {const inside=sp.toecap==='box',d=inside?-1.6:sp.toecap==='hard'?1.5:.6,ts=rowsUpTo(0,1,Math.max(4,Math.round(7*detail))),m2=Math.max(4,M);
  const sBack=(yr:number)=>(sp.toecap==='hard'?.76:.79)+.05*yr;
  const verts:V3[]=[],faces:number[][]=[];
  for(const side of [-1,1]){const b=verts.length;for(const t of ts)for(let j=0;j<=m2;j++){const yr=inside?j/m2:.035+.965*j/m2,phi=Math.asin(Math.min(.999,yr))*(side<0?1:-1)+(side<0?0:Math.PI),s=lerp(sBack(yr),1,t);verts.push(S(s,phi,d));}faces.push(...grid(ts.length,m2+1,b).map(f=>side>0?f.reverse():f));}
  // an outer cap is one-sided (its inside is the upper) and sorts well ahead of the upper's bigger faces, so its edge stays clean
  const m=mesh('toecap',sp.mats.toecap,verts,faces,{inner:sp.mats.toecap,two:inside,twoApart:true,soft:true,bias:inside?-.4:9});
  const marks:Mark[]=[];if(!inside)for(const side of [-1,1])marks.push({part:'toecap',pts:Array.from({length:m2+1},(_,j)=>{const yr=j/m2,phi=Math.asin(Math.min(.999,yr));return S(sBack(yr)+.012,side<0?phi:Math.PI-phi,d+.3);}),n:[.3,side*.6,.5],w:0,color:ink,on:sp.mats.toecap,dots:true,r:.42,bias:1.2});
  parts.push({id:'toecap',meshes:[m],marks,anchor:{p:S(.9,Math.PI-.9,d),n:[.6,.4,.6]},out:[104,0,26],inner:inside,skin:!inside});}

 // ── Laces on the shop's eyelet rows (criss-crossed, a bow on top), or the shop's lace cover ─────────────────────────────────
 {const rows=SG.eyeletRows(),marks:Mark[]=[],meshes:Mesh[]=[],FACING=.011;
  const onL=(s:number,phi:number,lift:number)=>{const p=SG.surface(s,phi),n=SG.surfaceNormal(s,phi);return upV(p.addScaledVector(n,FACING+lift));};
  let anchor:V3=onL(rows[Math.floor(rows.length/2)].s,rows[0].phiOut,0);
  if(sp.laces==='cover'){const e=sh.eyes,W=e.hw+.095,s0=e.s0-.035,s1=e.s1+.035,NA=5,NS=Math.max(5,Math.round(9*detail)),verts:V3[]=[];
   for(let i=0;i<NS;i++){const t=i/(NS-1),s=lerp(s0,s1,t),along=1-sm(.72,1,t);for(let j=0;j<NA;j++){const a=-1+2*j/(NA-1),phi=SG.phiAcross(s,sh.laceC+a*W),dome=.036*Math.pow(Math.max(0,1-a*a),.3)*along-.002;
    verts.push(S(s,phi,dome*100));}}
   meshes.push(mesh('laces',sp.mats.laces,verts,grid(NS,NA),{inner:sp.mats.lining,two:true,bias:1.5,soft:true}));
   for(let i=0;i<rows.length-1;i++){const a=rows[i],b=rows[i+1];marks.push({part:'laces',pts:[onL(a.s,a.phiIn,0),onL(b.s,b.phiOut,0)],n:null,w:1.4,color:sp.lacesColor,xray:true,bias:-.5},{part:'laces',pts:[onL(a.s,a.phiOut,0),onL(b.s,b.phiIn,0)],n:null,w:1.4,color:sp.lacesColor,xray:true,bias:-.5});}
   anchor=verts[Math.floor(NS/2)*NA+NA-1];
  }else{
   const seg=(a:{s:number;phi:number},b:{s:number;phi:number},hi:number,bias:number)=>{const pts:V3[]=[];for(let i=0;i<=4;i++){const t=i/4;pts.push(onL(lerp(a.s,b.s,t),lerp(a.phi,b.phi,t),.003+(.008+hi)*Math.sin(Math.PI*t)**.6));}
    const sm2=(a.s+b.s)/2,pm=(a.phi+b.phi)/2;// lit side only: the lacing never shows through the boot from below
    marks.push({part:'laces',pts,n:nrm(sm2,pm),w:2.1,color:sp.lacesColor,bias:bias+4});};
   const n=rows.length;seg({s:rows[n-1].s,phi:rows[n-1].phiIn},{s:rows[n-1].s,phi:rows[n-1].phiOut},0,.5);
   for(let k=n-1;k>0;k--){const a=rows[k],b=rows[k-1];seg({s:a.s,phi:a.phiIn},{s:b.s,phi:b.phiOut},.004,.62);seg({s:a.s,phi:a.phiOut},{s:b.s,phi:b.phiIn},0,.5);}
   for(const r of rows)for(const phi of [r.phiIn,r.phiOut])marks.push({part:'laces',pts:[onL(r.s,phi,-.001)],n:nrm(r.s,phi),w:0,color:'#2a2a2c',dots:true,r:1.5,bias:4});
   // up the shaft's slit (the early boots): eyelets on both edges and crossings between them
   if(shaftInfo){const H=[.15,.38,.61,.84],ey=(side:number,h:number)=>{const p=shaftInfo.front(side,h);return [p[0]-1.5,p[1]-side*1.6,p[2]] as V3;};
    for(let i=0;i<H.length;i++){for(const side of [-1,1])marks.push({part:'laces',pts:[ey(side,H[i])],n:null,w:0,color:'#2a2a2c',dots:true,r:1.5,bias:.4});
     if(i){marks.push({part:'laces',pts:[ey(-1,H[i-1]),ey(1,H[i])],n:null,w:2.1,color:sp.lacesColor,bias:.6},{part:'laces',pts:[ey(1,H[i-1]),ey(-1,H[i])],n:null,w:2.1,color:sp.lacesColor,bias:.5});}}
    const r0=rows[0];marks.push({part:'laces',pts:[onL(r0.s,r0.phiIn,.004),ey(1,H[0])],n:null,w:2.1,color:sp.lacesColor,bias:.5},{part:'laces',pts:[onL(r0.s,r0.phiOut,.004),ey(-1,H[0])],n:null,w:2.1,color:sp.lacesColor,bias:.6});}
   if(!(sp.tongue==='fold'&&sh.tongue.kind==='fold')||shaftInfo){// a small bow at the top row (on a shaft: at the top of the slit)
    const top=rows[0],o:V3=shaftInfo?(()=>{const p=shaftInfo.front(1,.9),q=shaftInfo.front(-1,.9);return [(p[0]+q[0])/2+1,(p[1]+q[1])/2,(p[2]+q[2])/2+1.5] as V3;})():onL(top.s,(top.phiIn+top.phiOut)/2,.02);
    for(const s of [-1,1]){marks.push({part:'laces',pts:[o,[o[0]-2,o[1]+s*6.5,o[2]+3.5],[o[0]-7,o[1]+s*9.5,o[2]+4],[o[0]-8.5,o[1]+s*5.5,o[2]+1.2],o],n:shaftInfo?null:[0,0,1],w:2,color:sp.lacesColor,bias:.9});
     marks.push({part:'laces',pts:[o,[o[0]+4,o[1]+s*5,o[2]-1],[o[0]+9,o[1]+s*8,o[2]-5]],n:shaftInfo?null:[0,0,1],w:2,color:sp.lacesColor,bias:.9});}}}
  parts.push({id:'laces',meshes,marks,anchor:{p:anchor,n:[0,0,1]},out:[40,0,sp.laces==='cover'?104:150],inner:false,skin:sp.laces==='cover'});}

 // what lies under the footbed: the studs, the plate below the foot and the welt or board (drawn first while the boot is whole
 // and seen from above, so the floor and the upper always cover them)
 const baseZ=(x:number)=>(SG.base(SG.sAt(Math.max(-LEN/2,Math.min(LEN/2,x))/100))-g)*100;
 for(const p of parts){if(p.id!=='studs'&&p.id!=='sole'&&p.id!=='midsole')continue;
  for(const k of p.marks)k.low=true;
  for(const m of p.meshes){if(p.id==='studs'||welt){m.low=true;continue;}const low=new Set<number>();// (a welt covers the plate's edge)
   m.faces.forEach((f,i)=>{let z=0;for(const j of f)z+=m.verts[j][2]-baseZ(m.verts[j][0]);if(z/f.length<=-.2)low.add(i);});m.low=low;}}
 const ORDER:PartId[]=['studs','sole','midsole','insole','counter','foam','lining','upper','tongue','grip','collar','toecap','laces'];
 parts.sort((p,q)=>ORDER.indexOf(p.id)-ORDER.indexOf(q.id));
 // Rotation centre and reach (for a fit that never changes while it turns), centred on the boot's length.
 let zMax=0,R=0,faces=0,x0=Infinity,x1=-Infinity;
 for(const p of parts)for(const m of p.meshes){faces+=m.faces.length;for(const v of m.verts){zMax=Math.max(zMax,v[2]);x0=Math.min(x0,v[0]);x1=Math.max(x1,v[0]);}}
 const C:V3=[(x0+x1)/2,0,zMax/2];let Rr=0;
 for(const p of parts){const b={r:0,z0:Infinity,z1:-Infinity};for(const m of p.meshes)for(const v of m.verts){b.r=Math.max(b.r,Math.hypot(v[0]-C[0],v[1]-C[1]));b.z0=Math.min(b.z0,v[2]);b.z1=Math.max(b.z1,v[2]);Rr=Math.max(Rr,Math.hypot(v[1],v[2]-C[2]));}
  if(!p.meshes.length){b.z0=p.anchor.p[2];b.z1=p.anchor.p[2];}p.box=b;R=Math.max(R,b.r);}
 return {parts,C,R,Rr,zMax,faces,opening};
}
/** A lighter stitch colour for the quilting rows. */
function mixInk(ink:string){return ink.startsWith('#')&&ink.length===7?ink+'aa':ink;}
export {normalOf};
