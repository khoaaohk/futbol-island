/**
 * Island Line passengers (train Gameplay 3): ONE InstancedMesh for every passenger on every train (1 draw call, no shadow pass).
 * A passenger is a little island bean (the stadium crowd's mini-bean idea, people-sized): a rounded bean body in its shirt colour
 * with its own skin colour on the crown, a face with two eyes, two arms, legs (seated: thighs out over the bench edge and shins down;
 * standing: straight), and one prop (a football, a scarf, a bento box, a notebook). One geometry holds every variant; per-instance
 * attributes pick the variant in the vertex shader (the parts not used collapse to a point: no fragments) and colour it:
 *  iShirt (rgb), iSkin (rgb), iAccent (rgb: the scarf / headwear / bag), iFlags (x: seated 1 / standing 0, y: prop 0 none, 1 ball,
 *  2 scarf, 3 bento, 4 notebook, z: strap arm up 0 / 1, w: scale for the kid / grown-up).
 * Frame: origin on the car floor under the hips, +z = facing (the aisle when seated), y up; seat top PAX.seatY over the floor.
 * Built lazily on the first passenger shown; one Lambert program variant (compiled then).
 */
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Proportions (m): hips on the seat top, the bean from hip to crown, shirt line, face, eyes, shoulders, arm, leg sizes. */
export const PAX={seatY:.64,hip:.6,top:1.48,shirtTop:1.14,rings:[[0,.17],[.18,.21],[.46,.2],[.7,.16],[.84,.09]] as const,sides:8,depth:.86,
 eyeY:1.33,eyeX:.06,eyeR:.024,shoulderX:.22,shoulderY:1.08,armLen:.4,armR:.05,legR:.065,thigh:.42,legX:.1} as const;
/** Vertex part ids (aPart.x): which colour; aPart.y: the variant it belongs to (0 always, 1 seated, 2 standing, 3 arm down, 4 arm
 *  up, 10 + n: prop n). */
const PART={shirt:0,skin:1,dark:2,eye:3,prop:4,accent:5} as const;
export const PAX_TRIS_MAX=372;
function tag(g:T.BufferGeometry,part:number,variant:number){
 const out=g.index?g.toNonIndexed():g;if(out!==g)g.dispose();const n=out.getAttribute('position').count,a=new Float32Array(n*2);for(let i=0;i<n;i++){a[i*2]=part;a[i*2+1]=variant;}
 for(const k of Object.keys(out.attributes))if(k!=='position'&&k!=='normal')out.deleteAttribute(k);if(!out.getAttribute('normal'))out.computeVertexNormals();
 out.setAttribute('aPart',new T.BufferAttribute(a,2));return out;
}
/** The bean body: shirt below the shirt line, skin above (two lathe pieces so each has one colour). */
function bean(){
 const R=PAX.rings,S=PAX.sides,mk=(from:number,to:number,cap:boolean)=>{const pos:number[]=[],idx:number[]=[];const rs:number[][]=[];
  for(let j=0;j<R.length;j++){const y=R[j][0]+PAX.hip;if(y<from-1e-6||y>to+1e-6)continue;rs.push([y,R[j][1]]);}
  // cut rings at the shirt line (interpolated radius)
  const at=(y:number)=>{for(let j=0;j<R.length-1;j++){const a=R[j][0]+PAX.hip,b=R[j+1][0]+PAX.hip;if(y>=a&&y<=b){const k=(y-a)/(b-a);return R[j][1]+(R[j+1][1]-R[j][1])*k;}}return R[R.length-1][1];};
  if(!rs.length||rs[0][0]>from+1e-6)rs.unshift([from,at(from)]);if(rs[rs.length-1][0]<to-1e-6&&to<PAX.top-1e-3)rs.push([to,at(to)]);
  for(const [y,r] of rs)for(let k=0;k<S;k++){const a=k/S*Math.PI*2;pos.push(Math.sin(a)*r,y,Math.cos(a)*r*PAX.depth);}
  for(let j=0;j<rs.length-1;j++)for(let k=0;k<S;k++){const a=j*S+k,b=j*S+(k+1)%S,c=a+S,d=b+S;idx.push(a,b,d,a,d,c);}
  if(cap){const t=pos.length/3;pos.push(0,PAX.top,0);for(let k=0;k<S;k++)idx.push((rs.length-1)*S+k,(rs.length-1)*S+(k+1)%S,t);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;};
 return [tag(mk(PAX.hip,PAX.shirtTop,false),PART.shirt,0),tag(mk(PAX.shirtTop,PAX.hip+R[R.length-1][0],true),PART.skin,0)];
}
const box=(w:number,h:number,d:number,x:number,y:number,z:number,rx=0)=>{const g=new T.BoxGeometry(w,h,d);if(rx)g.rotateX(rx);g.translate(x,y,z);return g;};
function parts(){
 const out:T.BufferGeometry[]=[...bean()];
 // eyes: two little dark boxes on the face
 for(const s of [-1,1])out.push(tag(box(PAX.eyeR*2,PAX.eyeR*2.4,.02,s*PAX.eyeX,PAX.eyeY,PAX.rings[3][1]*PAX.depth*1.05),PART.eye,0));
 // seated legs: thighs forward along +z at the seat top, shins down to the floor
 for(const s of [-1,1]){out.push(tag(box(PAX.legR*2,PAX.legR*2,PAX.thigh,s*PAX.legX,PAX.seatY+.02,PAX.thigh/2-.02),PART.dark,1));
  out.push(tag(box(PAX.legR*2,PAX.seatY,PAX.legR*2,s*PAX.legX,PAX.seatY/2,PAX.thigh-.06),PART.dark,1));
  out.push(tag(box(.09,.06,.16,s*PAX.legX,.03,PAX.thigh),PART.dark,1));
  // standing legs
  out.push(tag(box(PAX.legR*2,PAX.hip+.02,PAX.legR*2,s*PAX.legX,(PAX.hip+.02)/2,0),PART.dark,2));out.push(tag(box(.09,.06,.16,s*PAX.legX,.03,.04),PART.dark,2));}
 // arms: down at the sides (both), or the right one up to a strap (variant 4 replaces the right arm's variant 3)
 const arm=(s:number,up:boolean)=>{const g=new T.CylinderGeometry(PAX.armR,PAX.armR*.9,PAX.armLen,5,1);g.translate(0,-PAX.armLen/2,0);if(up)g.rotateZ(s*(Math.PI-.25));else g.rotateX(-.25);g.translate(s*PAX.shoulderX,PAX.shoulderY,0);return g;};
 out.push(tag(arm(-1,false),PART.shirt,0),tag(arm(1,false),PART.shirt,3),tag(arm(1,true),PART.shirt,4));
 // props: a football on the lap / under the arm, a scarf round the neck, a bento box on the lap, a notebook in the hands
 {const g=new T.IcosahedronGeometry(.11,0);g.translate(0,PAX.seatY+.2,.3);out.push(tag(g,PART.prop,11));}
 out.push(tag(box(.42,.09,.3,0,PAX.shirtTop+.02,0),PART.accent,12),tag(box(.1,.34,.04,.1,PAX.shirtTop-.15,.2),PART.accent,12));
 out.push(tag(box(.26,.1,.18,0,PAX.seatY+.14,.3),PART.accent,13),tag(box(.27,.02,.19,0,PAX.seatY+.2,.3),PART.prop,13));
 out.push(tag(box(.16,.02,.22,0,PAX.seatY+.33,.32,-.6),PART.accent,14));
 return out;
}
export function passengerGeometry(){
 const ps=parts(),g=mergeGeometries(ps)!;for(const p of ps)p.dispose();
 g.boundingBox=new T.Box3(new T.Vector3(-.6,-.05,-.4),new T.Vector3(.6,1.9,.8));g.boundingSphere=g.boundingBox.getBoundingSphere(new T.Sphere());return g;
}
const VERT_HEAD=`attribute vec2 aPart;attribute vec3 iShirt;attribute vec3 iSkin;attribute vec3 iAccent;attribute vec4 iFlags;varying vec3 vPax;
`;
const VERT_BODY=`
 float pv=aPart.y;bool keep=pv<.5||(pv>.5&&pv<1.5&&iFlags.x>.5)||(pv>1.5&&pv<2.5&&iFlags.x<.5)||(pv>2.5&&pv<3.5&&iFlags.z<.5)||(pv>3.5&&pv<4.5&&iFlags.z>.5)||(pv>10.5&&abs(pv-10.-iFlags.y)<.5);
 if(!keep)transformed=vec3(0.);
 transformed*=iFlags.w;
 float pp=aPart.x;vPax=pp<.5?iShirt:pp<1.5?iSkin:pp<2.5?iShirt*.32+vec3(.06):pp<3.5?vec3(.08,.07,.07):pp<4.5?vec3(.93,.91,.86):iAccent;
`;
/** The shared material: Lambert with the per-instance colour (vPax) in place of the diffuse colour. */
export function passengerMaterial(){
 const m=new T.MeshLambertMaterial({color:0xffffff});
 m.onBeforeCompile=sh=>{sh.vertexShader=VERT_HEAD+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>'+VERT_BODY);
  sh.fragmentShader='varying vec3 vPax;\n'+sh.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );','vec4 diffuseColor = vec4( diffuse*vPax, opacity );');};
 m.customProgramCacheKey=()=>'train-pax-1';return m;
}
/** One InstancedMesh with room for `max` passengers and its instance attributes. */
export function createPassengerMesh(max:number){
 const g=passengerGeometry(),attr=(n:number)=>{const a=new T.InstancedBufferAttribute(new Float32Array(max*n),n);a.setUsage(T.DynamicDrawUsage);return a;};
 const shirt=attr(3),skin=attr(3),accent=attr(3),flags=attr(4);g.setAttribute('iShirt',shirt);g.setAttribute('iSkin',skin);g.setAttribute('iAccent',accent);g.setAttribute('iFlags',flags);
 const mesh=new T.InstancedMesh(g,passengerMaterial(),max);mesh.name='train-passengers';mesh.frustumCulled=false;mesh.count=0;mesh.castShadow=mesh.receiveShadow=false;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
 return {mesh,shirt,skin,accent,flags,dispose(){mesh.removeFromParent();g.dispose();(mesh.material as T.Material).dispose();}};
}
