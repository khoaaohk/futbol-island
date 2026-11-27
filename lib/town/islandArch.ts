import * as T from 'three';
import {SoftBoxGeometry,puffBall} from '../graphics/softBox';
import type {HutPart} from './thatchHut';

/**
 * Island gateway arch (Nov 27 2026, owner shot 171 on "CAUSEWAY · MAIN ISLAND": "make this more island feel, more round if needed").
 * Used by the Coral Cay welcome arch and the East Jetty arch. Local frame: centred on the road line at the ground, the road running
 * along x, the posts at z = +-half. Parts (plain geometry + optional per-vertex tint; the caller `put`s them, 0 new draws):
 * - posts: ringed palm-trunk lathes (radius `postR` = the old square post's half width, so the footprint and colliders are unchanged),
 *   rope lashing bands, a puffy knob on top;
 * - a bowed driftwood lintel (rounded ends) resting on the posts above the sign plank, with a ragged palm-thatch canopy along it;
 * - the sign plank: a fat rounded board behind the (unchanged, flat) sign faces;
 * - two small lanterns hanging under the lintel and a fern cluster at each post foot.
 * `low` (Battery saver / heat tier >= 2 at build): fewer sides.
 */
const hash=(a:number,b=0)=>{const v=Math.sin(a*127.1+b*311.7)*43758.5453;return v-Math.floor(v);};
export type ArchSpec={half:number;postR:number;postTop:number;plankY:number;plankH:number;plankW:number;plankT:number;low?:boolean};

function lathe(prof:[number,number][],n:number,shade:(k:number)=>number):{geo:T.BufferGeometry;tint:Float32Array}{
 const pts=prof.map(([r,y])=>new T.Vector2(r,y)),g=new T.LatheGeometry(pts,n),P=g.getAttribute('position'),tint=new Float32Array(P.count*3);
 // LatheGeometry orders vertices by segment, then profile point
 for(let i=0;i<P.count;i++){const k=i%pts.length,v=shade(k)*(.95+.1*hash(i));tint[i*3]=v;tint[i*3+1]=v*.97;tint[i*3+2]=v*.92;}
 return {geo:g,tint};
}

export function islandArch(s:ArchSpec):HutPart[]{
 const parts:HutPart[]=[],n=s.low?8:12,R=s.postR;
 for(const side of [-1,1]){const z=side*s.half;
  // palm trunk: rings every ~0.5 m (a fat ring, then the waist), from just under the ground to the post top
  const prof:[number,number][]=[[0,-.25],[R*1.08,-.25]];const ring=.5,count=Math.max(4,Math.round(s.postTop/ring));
  for(let k=0;k<count;k++){const y0=k*s.postTop/count,y1=(k+1)*s.postTop/count;prof.push([R*1.06,y0+.04],[R*.97,(y0+y1)/2],[R*1.04,y1-.05]);}
  prof.push([R*.8,s.postTop+.06],[0,s.postTop+.1]);
  const t=lathe(prof,n,k=>{if(k<2)return .7;const m=(k-2)%3;return m===0?1.05:m===1?.86:.96;});t.geo.translate(0,0,z);parts.push({geo:t.geo,color:'#a07b55',tint:t.tint});
  // rope lashings
  for(const y of [1.05,s.postTop-.55]){const g=new T.TorusGeometry(R*1.1,.06,5,s.low?10:16);g.rotateX(Math.PI/2);g.translate(0,y,z);parts.push({geo:g,color:'#d2b47c'});}
  // knob on top
  const kb=puffBall(R*.62);kb.scale(1,.7,1);kb.translate(0,s.postTop+.12,z);parts.push({geo:kb,color:'#b8916a'});
  // fern cluster at the foot (puffy leaves)
  for(let k=0;k<5;k++){const a=k/5*6.283+side,b=puffBall(.28+.08*hash(k,side));b.scale(1.3,.55,.8);b.rotateY(a);b.translate(Math.cos(a)*(R+.35),.16,z+Math.sin(a)*(R+.35));parts.push({geo:b,color:k%2?'#4f8a52':'#6fa35a'});}
 }
 // the sign plank: rounded in its own plane, nearly flat on its faces (the sign planes sit just proud)
 {const g=new SoftBoxGeometry(s.plankT,s.plankH,s.plankW,{seg:s.low?0:1,puff:1.4,maxR:[.05,s.plankH*.42,s.plankH*.42]});g.translate(0,s.plankY,0);parts.push({geo:g,color:'#b08a5e'});}
 // bowed driftwood lintel over the plank, resting on the post tops, rounded ends
 {const yEnd=s.postTop+.05,yMid=s.postTop+.45,L=s.half+.7,curve=new T.QuadraticBezierCurve3(new T.Vector3(0,yEnd,-L),new T.Vector3(0,yMid*2-yEnd,0),new T.Vector3(0,yEnd,L));
  const g=new T.TubeGeometry(curve,s.low?12:20,.3,s.low?6:9,false);parts.push({geo:g,color:'#9a7550'});
  for(const e of [-1,1]){const b=puffBall(.3);b.translate(0,yEnd,e*L);parts.push({geo:b,color:'#9a7550'});}
  // palm-thatch canopy along the lintel: two sloping strips with a ragged, scalloped drooping eave
  const cols=s.low?14:26,pos:number[]=[],tint:number[]=[],idx:number[]=[];
  for(const sx of [-1,1]){const base=pos.length/3;
   for(let c=0;c<=cols;c++){const u=c/cols,zz=-L-.3+u*(2*L+.6),p=curve.getPoint(Math.min(1,Math.max(0,(zz+L)/(2*L)))),y0=p.y+.42,droop=.12*(.5+.5*Math.cos(u*cols*Math.PI))+.06*hash(c,sx);
    for(const [ox,oy] of [[0,0],[.45,-.22],[.85,-.5-droop]] as [number,number][]){pos.push(sx*ox,y0+oy,zz);const v=(.8+.3*hash(c*2.3,sx))*(oy===0?1.08:ox<.5?1:.75);tint.push(v,v*.97,v*.8);}}
   for(let c=0;c<cols;c++)for(let r=0;r<2;r++){const a=base+c*3+r,b=a+3;if(sx>0)idx.push(a,b,b+1,a,b+1,a+1);else idx.push(a,b+1,b,a,a+1,b+1);}}
  const tg=new T.BufferGeometry();tg.setAttribute('position',new T.Float32BufferAttribute(pos,3));tg.setIndex(idx);tg.computeVertexNormals();
  tg.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(pos.length/3*2),2));parts.push({geo:tg,color:'#c9a45c',tint:new Float32Array(tint)});
  // two lanterns hanging under the lintel, between the posts and the road
  const under=s.plankY-s.plankH/2;
  for(const e of [-1,1]){const zz=e*(s.half-1.4),cord=new T.CylinderGeometry(.015,.015,.4,4,1,true);cord.translate(0,under-.18,zz);parts.push({geo:cord,color:'#3a2f25'});
   const lt=puffBall(.17);lt.scale(1,1.25,1);lt.translate(0,under-.5,zz);parts.push({geo:lt,color:'#ffd27a'});}}
 return parts;
}
