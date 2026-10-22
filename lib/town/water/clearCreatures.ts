import * as T from 'three';
import {seaTurtleGeometry} from '../../graphics/seaTurtle';

/**
 * Ambient sea life for the clear water window (Oct 19 2026, "I would like to see fish and other sea creatures moving").
 * Four tiny low-poly kinds, each ONE geometry (drawn as ONE InstancedMesh in clearWindow.ts): reef fish (~44 triangles), sea turtle
 * (seaTurtle.ts, ~440 triangles near / 160 / 31 far), jellyfish (~50), crab (~60). Facing -X (head), +Y up, centred on the origin, about 1 m long. Vertex colours are the paint
 * (pale belly, deeper back; the instance colour tints them); `aW` is the per-vertex motion weight the shader reads (tail / flippers /
 * tentacles / legs). Built on first use, a few hundred vertices in all. The fishing models (fishModels.ts) were too heavy for this
 * layer's budget (herring 393 triangles each), so these are their own simplified shapes.
 */
type Vec=[number,number,number];
type Part={pos:number[];nor:number[];col:number[];w:number[]};
const part=():Part=>({pos:[],nor:[],col:[],w:[]});
const tmpN=new T.Vector3(),tmpA=new T.Vector3(),tmpB=new T.Vector3(),tmpC=new T.Vector3();
function push(p:Part,a:Vec,b:Vec,c:Vec,ca:Vec,cb:Vec,cc:Vec,wa:number,wb:number,wc:number){
 tmpA.set(...a);tmpB.set(...b);tmpC.set(...c);tmpN.crossVectors(tmpB.sub(tmpA),tmpC.sub(tmpA)).normalize();
 for(const [v,col,w] of [[a,ca,wa],[b,cb,wb],[c,cc,wc]] as [Vec,Vec,number][]){p.pos.push(...v);p.nor.push(tmpN.x,tmpN.y,tmpN.z);p.col.push(...col);p.w.push(w);}
}
const rgb=(h:string):Vec=>{const c=new T.Color(h);return [c.r,c.g,c.b];};
const mix=(a:Vec,b:Vec,k:number):Vec=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
/** A flat triangle, drawn from both sides. */
function tri2(p:Part,a:Vec,b:Vec,c:Vec,col:Vec,w:[number,number,number]=[0,0,0]){push(p,a,b,c,col,col,col,w[0],w[1],w[2]);push(p,a,c,b,col,col,col,w[0],w[2],w[1]);}
/** A low-poly ellipsoid (flat shaded): back colour on top, belly colour below; `weight(x, y, z)` is the motion weight. */
function blob(p:Part,r:Vec,at:Vec,back:Vec,belly:Vec,seg:number,ring:number,weight:(x:number,y:number,z:number)=>number=()=>0,top=Math.PI){
 const g=new T.SphereGeometry(1,seg,ring,0,Math.PI*2,0,top).toNonIndexed(),pos=g.getAttribute('position');
 for(let i=0;i<pos.count;i+=3){const v:Vec[]=[],cl:Vec[]=[],ww:number[]=[];
  for(let j=0;j<3;j++){const x=pos.getX(i+j),y=pos.getY(i+j),z=pos.getZ(i+j);v.push([x*r[0]+at[0],y*r[1]+at[1],z*r[2]+at[2]]);cl.push(mix(belly,back,Math.max(0,Math.min(1,y*.9+.5))));ww.push(weight(x*r[0]+at[0],y*r[1]+at[1],z*r[2]+at[2]));}
  if(v[0][0]===v[1][0]&&v[0][1]===v[1][1]&&v[0][2]===v[1][2])continue;if(v[1][0]===v[2][0]&&v[1][1]===v[2][1]&&v[1][2]===v[2][2])continue;if(v[0][0]===v[2][0]&&v[0][1]===v[2][1]&&v[0][2]===v[2][2])continue;
  push(p,v[0],v[1],v[2],cl[0],cl[1],cl[2],ww[0],ww[1],ww[2]);}
 g.dispose();
}
function build(p:Part){
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p.pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(p.nor,3));
 g.setAttribute('color',new T.Float32BufferAttribute(p.col,3));g.setAttribute('aW',new T.Float32BufferAttribute(p.w,1));
 // aTw zeros: "not a turtle" for the turtle shader library when a material is shared (zoneLife.ts).
 g.setAttribute('aTw',new T.Float32BufferAttribute(new Float32Array(p.w.length*4),4));return g;
}
export type CreatureKind='fish'|'turtle'|'jelly'|'crab';
export function creatureGeometry(kind:CreatureKind):T.BufferGeometry{
 const p=part();
 if(kind==='fish'){
  const back=rgb('#cfd8dc'),belly=rgb('#ffffff'),fin=rgb('#e6edf0');
  blob(p,[.36,.17,.1],[-.06,0,0],back,belly,6,4);
  tri2(p,[.28,0,0],[.52,.17,0],[.52,-.17,0],fin,[0,1,1]);
  tri2(p,[-.12,.13,0],[.1,.13,0],[0,.3,0],fin);
 }else if(kind==='turtle'){
  return seaTurtleGeometry();// the realistic low-poly sea turtle (seaTurtle.ts: three LOD bands, posed in the shader by aTw)
 }else if(kind==='jelly'){
  const bell=rgb('#ffffff'),rim=rgb('#f2d6ff'),tent=rgb('#ffe2f6');
  blob(p,[.3,.22,.3],[0,0,0],bell,rim,8,3,()=>0,Math.PI/2);
  for(let i=0;i<4;i++){const a=i*Math.PI/2+.4,x=Math.cos(a)*.14,z=Math.sin(a)*.14;tri2(p,[x-.03,-.01,z],[x+.03,-.01,z],[x*1.6,-.55,z*1.6],tent,[0,0,1]);}
  for(let i=0;i<2;i++){const a=i*Math.PI+1.2,x=Math.cos(a)*.08,z=Math.sin(a)*.08;tri2(p,[x-.04,-.01,z],[x+.04,-.01,z],[x,-.38,z],rim,[0,0,1]);}
 }else{
  const shell=rgb('#ffffff'),under=rgb('#d9b9a0'),leg=rgb('#e8cdb8');
  blob(p,[.2,.08,.15],[0,.08,0],shell,under,6,3);
  for(const s of [-1,1]){blob(p,[.07,.04,.06],[-.2,.09,s*.2],shell,under,4,2);
   for(let i=0;i<3;i++){const x=-.06+i*.09;tri2(p,[x-.015,.06,s*.1],[x+.015,.06,s*.1],[x+.03,0,s*.3],leg,[0,0,1]);}}
 }
 return build(p);
}
