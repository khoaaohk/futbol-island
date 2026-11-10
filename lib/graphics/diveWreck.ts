import * as T from 'three';
import {diveFloor,diveWreckPose,type DiveSpot} from '../town/water/diveSpots';
import {diveWreckSize,type DiveArchSpot} from '../town/water/diveLayout';
import {diveSolidBar,diveSolidBox,diveSolidRound,type DiveSolid} from '../town/water/diveSolids';

/**
 * The dive room's shared builders and the two pieces the ISLAND also draws above the waterline (the stranded wreck and the rock
 * arch, lib/graphics/diveWreckTop.ts). Split out of diveRoom.ts on Nov 10 2026 (load-time pass, docs/performance-guide.md) so the
 * island boot chunk carries only these, and the room itself (diveRoom.ts, its fish models and shaders) loads with the first dive.
 */
export type C=[number,number,number];
export const col=(h:string|T.Color):C=>{const c=new T.Color(h);return [c.r,c.g,c.b];};
export const mix=(a:C,b:C,k:number):C=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
export const scl=(a:C,k:number):C=>[a[0]*k,a[1]*k,a[2]*k];
/** A small seeded random (mulberry32), so the reef is the same every dive. */
export function rng(seed:number){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}

/** Collects pieces into one non-indexed geometry (position, normal, colour; plus sway weight and seed for the swaying mesh). The
 *  pieces' own normals are kept (smooth rocks and brain coral, faceted branches), transformed by each piece's matrix. */
export class Merge{
 pos:number[]=[];nor:number[]=[];col:number[]=[];sway:number[]=[];seed:number[]=[];
 private v=new T.Vector3();private n=new T.Vector3();private nm=new T.Matrix3();
 add(g:T.BufferGeometry,m:T.Matrix4,paint:(p:T.Vector3,n:T.Vector3,local:T.Vector3)=>C,sway?:(local:T.Vector3)=>number,seed=0){
  const src=g.index?g.toNonIndexed():g;if(!src.getAttribute('normal'))src.computeVertexNormals();
  const P=src.getAttribute('position'),N=src.getAttribute('normal'),local=new T.Vector3();this.nm.getNormalMatrix(m);
  for(let i=0;i<P.count;i++){local.fromBufferAttribute(P,i);this.v.copy(local).applyMatrix4(m);this.n.fromBufferAttribute(N,i).applyMatrix3(this.nm).normalize();
   this.pos.push(this.v.x,this.v.y,this.v.z);this.nor.push(this.n.x,this.n.y,this.n.z);const c=paint(this.v,this.n,local);this.col.push(c[0],c[1],c[2]);
   if(sway){this.sway.push(sway(local));this.seed.push(seed);}}
  if(src!==g)src.dispose();g.dispose();
 }
 geometry(swaying=false){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.nor,3));
  g.setAttribute('color',new T.Float32BufferAttribute(this.col,3));if(swaying){g.setAttribute('aSway',new T.Float32BufferAttribute(this.sway,1));g.setAttribute('aSeed',new T.Float32BufferAttribute(this.seed,1));}
  g.computeBoundingSphere();return g;}
}
export const M=(x=0,y=0,z=0,rx=0,ry=0,rz=0,s:number|[number,number,number]=1)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),typeof s==='number'?new T.Vector3(s,s,s):new T.Vector3(...s));
/** Explore (Oct 22 2026, solid collision; lib/town/water/diveSolids.ts): a box solid from a piece's matrix (its local box of size sx, sy,
 *  sz centred at (ox, oy, oz)), a bar between two local points, a round solid. Built once with the room, from the same matrices. */
export const _sv=new T.Vector3(),_sa=new T.Vector3(),_sb=new T.Vector3(),_se=new T.Matrix4();
export type SolidSink=((s:DiveSolid)=>void)|null|undefined;
export function boxOf(tag:string,m:T.Matrix4,sx:number,sy:number,sz:number,ox=0,oy=0,oz=0,pad?:number){const e=m.elements,ax:number[]=[],h=[sx/2,sy/2,sz/2];
 for(let i=0;i<3;i++){const l=Math.hypot(e[i*4],e[i*4+1],e[i*4+2])||1;ax.push(e[i*4]/l,e[i*4+1]/l,e[i*4+2]/l);h[i]*=l;}
 _sv.set(ox,oy,oz).applyMatrix4(m);return diveSolidBox(tag,_sv.x,_sv.y,_sv.z,ax,h[0],h[1],h[2],pad);}
export function barOf(tag:string,m:T.Matrix4,a:[number,number,number],b:[number,number,number],r:number){_sa.set(...a).applyMatrix4(m);_sb.set(...b).applyMatrix4(m);void _se;
 return diveSolidBar(tag,_sa.x,_sa.y,_sa.z,_sb.x,_sb.y,_sb.z,r);}
/** Lumpy, soft-edged rock: an icosphere pushed out by a few sines (smooth normals). */
export function rockGeo(seed:number,detail=1){const g=new T.IcosahedronGeometry(1,detail),p=g.getAttribute('position'),v=new T.Vector3();
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const k=1+.22*Math.sin(v.x*3.1+seed)*Math.cos(v.z*2.7+seed*1.3)+.12*Math.sin(v.y*5.3+seed*2.1);v.multiplyScalar(k);p.setXYZ(i,v.x,v.y,v.z);}
 g.computeVertexNormals();return g;}

/** The stranded wreck's frame (room-local): on the crest at diveWreckPose, its long axis (local x) along (sin yaw, cos yaw), the bow
 *  lifted (local z rotation) and listing (local x rotation). `flat` is the same place without the tilt (for what lies on the sand). */
export function diveWreckFrame(spot:DiveSpot){
 const w=spot.theme.wreck!,p=diveWreckPose(w,spot.floor),ry=new T.Matrix4().makeRotationY(w.yaw-Math.PI/2);
 const flat=new T.Matrix4().makeTranslation(p.x,p.y,p.z).multiply(ry);
 return {pose:p,flat,base:flat.clone().multiply(new T.Matrix4().makeRotationZ(p.pitch)).multiply(new T.Matrix4().makeRotationX(p.roll))};
}
/**
 * The wreck stranded on the reef (Oct 20 2026; user: "the boat can stick out of the water because it got stranded"): an open hull
 * wedged on the crest, bow up and listing, the near side broken open amidships (a swim-through gap under the hull), ribs, a mast,
 * barnacles, the style's own superstructure; what was spilled lies on the sand round it. Kid-friendly: nothing scary aboard. Built into
 * `S` with its own seeded random, so the room (everything) and the island's above-water piece (lib/graphics/diveWreckTop.ts, the
 * same triangles above the waterline) always match. `coral` grows coral on the hull (the room only).
 */
export function addDiveWreck(S:Merge,spot:DiveSpot,phone:boolean,coral:((x:number,z:number,s:number,c:C,kind:number)=>void)|null,solid?:SolidSink){
 const add=(q:DiveSolid)=>{solid?.(q);};
 const wk=spot.theme.wreck;if(!wk)return;
 const r=rng(spot.blob*31+7),F=(x:number,z:number)=>diveFloor(x,z,spot.floor),{base,flat}=diveWreckFrame(spot);
 const wood=col(wk.style==='cargo'?'#6e5a4e':'#7a5a3c'),dark=col(wk.style==='cargo'?'#4c3f38':'#5a4129'),rust=col('#a8673e');
 const boxPaint=(c:C)=>(v:T.Vector3,n:T.Vector3)=>scl(c,.75+.25*n.y);
 const style=wk.style,{L,W:Wd,H}=diveWreckSize(style);
 const at=(x:number,y:number,z:number,rx=0,ry=0,rz=0,s:number|[number,number,number]=1)=>base.clone().multiply(M(x,y,z,rx,ry,rz,s));
 /** On the sand by the hull (hull-local x, z): flat, at the sand's own height there. */
 const onSand=(x:number,z:number,lift:number,rx=0,ry=0,rz=0)=>{const p=new T.Vector3(x,0,z).applyMatrix4(flat);return new T.Matrix4().makeTranslation(p.x,F(p.x,p.z)+lift,p.z).multiply(new T.Matrix4().extractRotation(flat)).multiply(M(0,0,0,rx,ry,rz));};
 const barnacles=(m:T.Matrix4,n:number,spread:[number,number,number])=>{const barn=col('#cfc6d8');for(let k=0;k<n;k++){const b=new T.IcosahedronGeometry(.06+r()*.06,0);
  S.add(b,m.clone().multiply(M((r()-.5)*spread[0],r()*spread[1],(r()-.5)*spread[2])),()=>scl(barn,.75+.25*r()));}};
 // Keel and ribs: U-shaped half rings across the beam (the hull's frame); the middle ribs stand bare (the swim-through gap).
 const keel=new T.BoxGeometry(L,.3,.4);keel.translate(0,.15,0);S.add(keel,at(0,0,0),boxPaint(dark));if(solid)add(boxOf('keel',at(0,0,0),L,.3,.4,0,.15,0));
 const ribs=style==='cargo'?9:style==='galleon'?10:7;
 for(let k=0;k<ribs;k++){const u=-L/2+.6+k/(ribs-1)*(L-1.2);if(style==='cargo'&&Math.abs(u)<1.4)continue;const taper=1-Math.pow(Math.abs(u)/(L/2),2)*.55;
  const rib=new T.TorusGeometry(Wd/2*taper,.1,4,8,Math.PI);rib.rotateZ(Math.PI);rib.rotateY(Math.PI/2);const rm=at(u,H*.85,0,0,0,0,[1,H/(Wd/2)*.8,1]);S.add(rib,rm,boxPaint(style==='cargo'?rust:wood));
  // its collider: the half ring (y = -R sin t, z = R cos t in the rib's frame) as 5 bars
  if(solid){const R=Wd/2*taper;for(let q=0;q<5;q++){const t0=q/5*Math.PI,t1=(q+1)/5*Math.PI;_sa.set(0,-R*Math.sin(t0),R*Math.cos(t0)).applyMatrix4(rm);_sb.set(0,-R*Math.sin(t1),R*Math.cos(t1)).applyMatrix4(rm);
   add(diveSolidBar('rib',_sa.x,_sa.y,_sa.z,_sb.x,_sb.y,_sb.z,.1));}}}
 // Planks: full on the far side, broken on the near side (a gap amidships you can swim through).
 for(let row=0;row<3;row++)for(const side of [-1,1]){const y=.35+row*H*.28,segs=style==='cargo'?2:3;
  for(let sg=0;sg<segs;sg++){if(side===1&&sg===1)continue;if(side===1&&row===2&&sg!==0)continue;const len=L/segs*.95,u=-L/2+len/2+sg*L/segs,taper=1-Math.pow(Math.abs(u)/(L/2),2)*.5;
   const pl=new T.BoxGeometry(len,.32,.08),pm=at(u,y,side*Wd/2*taper*(.82+row*.08),side*.12,0,(r()-.5)*.06);S.add(pl,pm,boxPaint(row%2?wood:dark));if(solid)add(boxOf('plank',pm,len,.32,.08));}}
 // Bow and stern posts, the style's own superstructure.
 const post=new T.CylinderGeometry(.14,.18,H*1.3,6);post.translate(0,H*.65,0);S.add(post.clone(),at(-L/2+.2,0,0,0,0,-.35),boxPaint(dark));S.add(post,at(L/2-.2,0,0,0,0,.25),boxPaint(dark));
 if(solid){add(barOf('stern-post',at(-L/2+.2,0,0,0,0,-.35),[0,0,0],[0,H*1.3,0],.17));add(barOf('bow-post',at(L/2-.2,0,0,0,0,.25),[0,0,0],[0,H*1.3,0],.17));}
 if(style==='galleon'){const castle=new T.BoxGeometry(2.6,1.6,Wd*.8);castle.translate(0,.8,0);if(solid)add(boxOf('castle',at(L/2-1.5,H*.7,0),2.6,1.6,Wd*.8,0,.8,0));S.add(castle,at(L/2-1.5,H*.7,0,0,0,0),(v,n,l)=>scl(l.y>.6&&Math.sin(l.x*9)>.3?dark:wood,.8+.2*n.y));
  // The main mast snapped part way up (a stub with a jagged top), the broken top lying across the sand beside the hull.
  const mast=new T.CylinderGeometry(.16,.2,4.4,7);mast.translate(0,2.2,0);S.add(mast,at(-1,.3,0,.12,0,.1),boxPaint(dark));if(solid)add(barOf('mast',at(-1,.3,0,.12,0,.1),[0,0,0],[0,4.4,0],.2));
  const snap=new T.ConeGeometry(.17,.5,7);snap.translate(0,4.6,0);S.add(snap,at(-1,.3,0,.12,0,.1),boxPaint(dark));
  const yard=new T.CylinderGeometry(.08,.08,3.2,5);yard.rotateX(Math.PI/2);S.add(yard,at(-1,3.6,0,.4,0,.1),boxPaint(dark));if(solid)add(barOf('yard',at(-1,3.6,0,.4,0,.1),[0,0,-1.6],[0,0,1.6],.08));
  const broken=new T.CylinderGeometry(.16,.18,5,7);broken.rotateZ(Math.PI/2);const bk=onSand(1.5,3.6,.12,0,.6,0);S.add(broken,bk,boxPaint(dark));if(solid)add(barOf('broken-mast',bk,[-2.5,0,0],[2.5,0,0],.18));}
 else if(style==='trawler'){const cabin=new T.BoxGeometry(2.2,1.5,Wd*.75);cabin.translate(0,.75,0);if(solid)add(boxOf('cabin',at(L/2-2,H*.55,0),2.2,1.5,Wd*.75,0,.75,0));S.add(cabin,at(L/2-2,H*.55,0),(v,n,l)=>Math.abs(l.y-1)<.22&&Math.abs(l.x)<.8?col('#2f4a58'):scl(col('#d8d2c2'),.75+.25*n.y));
  const mast=new T.CylinderGeometry(.1,.13,5.2,6);mast.translate(0,2.6,0);S.add(mast,at(-1.2,.3,0),boxPaint(rust));if(solid)add(barOf('mast',at(-1.2,.3,0),[0,0,0],[0,5.2,0],.13));const boom=new T.CylinderGeometry(.06,.06,3.2,5);boom.rotateZ(Math.PI/2);S.add(boom,at(-2.6,2.8,0,0,0,-.4),boxPaint(rust));if(solid)add(barOf('boom',at(-2.6,2.8,0,0,0,-.4),[-1.6,0,0],[1.6,0,0],.06));
  for(let k=0;k<6;k++){const f=new T.SphereGeometry(.16,6,4);S.add(f,onSand(-3+k*.9+(r()-.5)*.3,2.6+(r()-.5)*.5,.1),()=>col(k%2?'#f2a03a':'#e8e0cf'));}}
 else{// cargo: a bridge at the stern, a crane mast, containers spilled on the sand
  const bridge=new T.BoxGeometry(2.4,2,Wd*.8);bridge.translate(0,1,0);if(solid)add(boxOf('bridge',at(L/2-1.6,H*.6,0),2.4,2,Wd*.8,0,1,0));S.add(bridge,at(L/2-1.6,H*.6,0),(v,n,l)=>Math.abs(l.y-1.4)<.2?col('#2f4a58'):scl(col('#c8c2b6'),.75+.25*n.y));
  const crane=new T.CylinderGeometry(.12,.15,5,6);crane.translate(0,2.5,0);S.add(crane,at(-3,.3,0,0,0,.5),boxPaint(rust));if(solid)add(barOf('crane',at(-3,.3,0,0,0,.5),[0,0,0],[0,5,0],.15));
  for(let k=0;k<4;k++){const c=new T.BoxGeometry(2.2,1,1.1);c.translate(0,.5,0);const cx=-L/2-1.5+r()*3,cz=(k-1.5)*2.4,om=onSand(cx,cz,-.15,0,r()*1.2,(r()-.5)*.3);if(solid)add(boxOf('container',om,2.2,1,1.1,0,.5,0));S.add(c,om,(v,n,l)=>scl(col(['#c4553e','#3f7fb0','#e0b23a','#4f9a6a'][k]),(Math.sin(l.x*14)>.6?.75:1)*(.75+.25*n.y)));}}
 barnacles(at(0,.2,0),phone?36:52,[L*.9,H,Wd]);
 for(let k=0;k<(phone?8:12);k++){const u=(r()-.5)*L*.85,side=r()<.5?-1:1;const m=at(u,H*.6+r()*.4,side*Wd*.42);const p=new T.Vector3().setFromMatrixPosition(m);
  const s=.35+r()*.3,kind=k%2?4:1;if(coral)coral(p.x,p.z,s,col(spot.theme.coral[k%spot.theme.coral.length]),kind);}

}

/** The rock arch (Moon Arch; the layout's arch): rock pieces along a half ring spanning z at x, a crown of boulders on top breaking
 *  the surface (the island's above-water piece is the same build cut at the waterline: diveWreckTop.ts), coral on its back (`coral`,
 *  the room only). Its own seeded random, so the room and the island's crown always match. */
export function addDiveArch(S:Merge,spot:DiveSpot,a:DiveArchSpot,solid?:SolidSink,coral?:((x:number,z:number,y:number)=>void)|null){
 const r=rng(spot.blob*53+11),{rock}=spot.theme,rockA=col(rock[0]),rockB=col(rock[1]);
 const paint=(v:T.Vector3,n:T.Vector3)=>scl(mix(rockA,rockB,.5+.5*n.y),.85+.15*Math.sin(v.x*2.3+v.z*1.7));
 const top=a.base+a.R*1.15;
 for(let k=0;k<=10;k++){const t=k/10*Math.PI,z=a.z+Math.cos(t)*a.R,y=a.base+Math.sin(t)*a.R*1.15,s=(1.05+.25*Math.sin(k*1.7))*a.R/3.6;
  const ax=a.x+(r()-.5)*.3;S.add(rockGeo(90+k,1),M(ax,y,z,r(),r()*6,r(),[s*1.3,s,s*1.1]),paint);solid?.(diveSolidRound('arch',ax,y,z,s*1.1,s*1.1,s*1.1));if(coral&&k%3===1)coral(a.x,z,y+s*.8);}
 // The crown: a stack of boulders on the arch's top, the highest reaching a.crown (out of the water).
 const h=a.crown-top;for(let k=0;k<4;k++){const s=.9+.35*(3-k)/3,y=top+h*(k+1)/4-s*.5,cx=a.x+(r()-.5)*.6,cz=a.z+(r()-.5)*1.2;S.add(rockGeo(140+k,1),M(cx,y,cz,r(),r()*6,r(),[s*1.2,s,s*1.3]),paint);solid?.(diveSolidRound('arch-crown',cx,y,cz,s*1.15,s,s*1.15));}
}
