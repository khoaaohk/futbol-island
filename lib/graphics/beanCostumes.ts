import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {getCostume,type AnimalKind} from '../town/costumes';
import {getIslandCostume,ISLAND_COSTUMES} from '../town/islandCostumes';
import {BD,BeanMaterial,beanBodyDims,beanSkinOf,type BeanBodyDims,type BeanSkin} from './beanSkin';
import type {BeanBuild} from './beanLook';

/*
 * Bean costumes (docs/bean-characters/CONTRACT.md, lane E): the animal club costumes refit as "onesie + hood"
 * outfits for the bean body. The bean already is a mascot body, so a costume is:
 *
 *  - a HOOD: a soft rim framing the face panel plus the animal's ears / horns / mane / comb / antlers / snout visor
 *    on the head-top. The face panel is untouched, so the player's own face, skin tone and live expression show
 *    through (AGENTS.md: preserve the underlying character).
 *  - a ONESIE pattern on the bean (stripes, bands, patches, belly, orca saddle) in the club's documented mascot colours (no sash; a dog collar in kit colour)
 *    sash, painted into ONE small canvas per costume (shared by every wearer) and sampled by a BeanMaterial subclass,
 *    so the face atlas, expression cell and back number still come from lane A's per-instance data row.
 *  - limb bands (zebra legs, fox socks, bird shins), paws/hooves as mitten/boot tints: uniforms on a BeanMaterial
 *    subclass for the limbs mesh.
 *  - PARTS (tail, wings, fins, spikes, hood features): vertex-coloured, merged per joint (torso / lumbar / chest /
 *    shoulders / elbows) into at most 7 meshes with one shared material. Geometry is cached per costume × build and
 *    shared by every wearer; nothing animates or updates per frame (the parts ride the solver's joints).
 *
 * The rig switch: attachBeanCostumes(rig) wraps setAppearance. A costume with a bean version keeps the bean skin
 * active (lane A's setAppearance sees costume 'none', so the classic body and classic costume are never built);
 * any other id falls through to lane A's classic fallback unchanged. Classic style: a no-op.
 */

export const DARK=0x2a2e2c,CREAM=0xfff1d8,BEAK=0xf2a53a,PINK=0xf2a0a8;
const COIN_FOX='matchday-fox';
type Spec={id:string;animal:AnimalKind;c:number;a:number;k:number;b:number};
/** Club home-kit colours (user decision, Sep 25 2026; CLUB_KIT_COLOURS in lib/town/costumes.ts via islandCostumes). */
function specFor(id:string):Spec|undefined{
 if(!ISLAND_COSTUMES[id])return undefined;
 const animal=id===COIN_FOX?'fox':getCostume(id)?.animal;if(!animal)return undefined;
 const {color,accent,kitColor,chest}=getIslandCostume(id);return {id,animal,c:color,a:accent,k:kitColor,b:chest??(id===COIN_FOX?accent:CREAM)};
}
/** Every costume id with a bean version (all island costumes today). */
export const BEAN_COSTUME_IDS:readonly string[]=Object.keys(ISLAND_COSTUMES).filter(id=>!!specFor(id));
export function hasBeanCostume(id:string|null|undefined):boolean{return !!id&&id!=='none'&&BEAN_COSTUME_IDS.includes(id);}
/** Merged part meshes a costume may use (one per joint): the phone-heat budget checked by tests/bean-costumes.cjs. */
export const BEAN_COSTUME_MESH_BUDGET=7;

const mix=(a:number,b:number,t:number)=>new T.Color(a).lerp(new T.Color(b),t).getHex();
const hex=(n:number)=>'#'+n.toString(16).padStart(6,'0');

// ---------------------------------------------------------------- onesie pattern (one 256² canvas per costume)
// U = around the bean (0 = front centre, .5 = back), V = height (0 = bottom, 1 = top). Face panel ≈ U 0±.13, V .6–.93.
const patterns=new Map<string,T.Texture>();
export function beanCostumePattern(id:string):T.Texture{
 const hit=patterns.get(id);if(hit)return hit;
 const s=specFor(id);const doc=typeof document!=='undefined'?document:undefined;
 const cv=doc?.createElement('canvas'),g=cv?.getContext('2d');
 if(!s||!cv||!g){const c=new T.Color(s?.c??0xffffff),t=new T.DataTexture(new Uint8Array([c.r*255,c.g*255,c.b*255,255]),1,1);t.needsUpdate=true;patterns.set(id,t);return t;}
 const S=256;cv.width=cv.height=S;
 const X=(u:number)=>u*S,Y=(v:number)=>(1-v)*S;
 const wrap=(draw:()=>void)=>{for(const o of [-1,0,1]){g.save();g.translate(o*S,0);draw();g.restore();}};
 const ell=(u:number,v:number,ru:number,rv:number,color:number,rot=0)=>wrap(()=>{g.fillStyle=hex(color);g.beginPath();g.ellipse(X(u),Y(v),ru*S,rv*S,rot,0,Math.PI*2);g.fill();});
 const band=(v0:number,v1:number,color:number)=>{g.fillStyle=hex(color);g.fillRect(0,Y(v1),S,(v1-v0)*S);};
 const ribbon=(f:(u:number)=>number,th:number,color:number)=>{g.fillStyle=hex(color);g.beginPath();for(let i=0;i<=64;i++)g.lineTo(X(i/64),Y(f(i/64)+th/2));for(let i=64;i>=0;i--)g.lineTo(X(i/64),Y(f(i/64)-th/2));g.fill();};
 const belly=(color:number,v=.34,rv=.24,ru=.15)=>ell(0,v,ru,rv,color);
 let seed=7;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;
 g.fillStyle=hex(s.c);g.fillRect(0,0,S,S);
 switch(s.animal){
  case 'wildcat':belly(s.b,.33,.22,.13);
   for(let i=0;i<5;i++)for(const side of [-1,1])ell(.5+side*.1,.2+i*.13,.1,.018,s.a,side*.35);break;
  case 'dinosaur':belly(s.b,.36,.3,.16);for(let i=0;i<5;i++)wrap(()=>{g.fillStyle=hex(mix(s.b,DARK,.15));g.fillRect(X(-.11),Y(.14+i*.09),.22*S,.012*S);});
   for(let i=0;i<16;i++)ell(.25+rand()*.5,.1+rand()*.75,.025,.02,mix(s.c,DARK,.12));break;
  case 'liverbird':case 'eagle':case 'vulture':case 'rooster':{
   const chest=s.animal==='vulture'?s.c:s.animal==='rooster'?mix(s.c,0xffffff,.12):s.b;
   belly(chest,.35,.26,.15);
   if(s.animal!=='vulture'&&s.animal!=='rooster')for(let r=0;r<4;r++)for(let i=-2;i<=2;i++)ell(i*.045+(r%2)*.022,.16+r*.08,.026,.02,mix(chest,0xffffff,.25));
   if(s.animal==='vulture'){g.fillStyle=hex(0x9fb0c4);g.fillRect(0,0,S,Y(.66));for(let i=0;i<3;i++)ribbon(u=>.67-i*.012+.01*Math.sin(u*Math.PI*10+i),.012,mix(0x9fb0c4,s.c,.35+i*.3));}
   // Club stripes / hoops on the bird: Atlético Mineiro's black-and-white stripes, Flamengo's red-and-black hoops.
   if(s.animal==='rooster')for(let i=0;i<8;i++){g.fillStyle=hex(s.a);g.fillRect(X(.08+i*.12),Y(.62),.045*S,.62*S);}
   if(s.animal==='vulture')for(const v of [.12,.3,.48])band(v,v+.07,s.a);
   break;}
  case 'lion':belly(s.b,.32,.22,.13);break;
  case 'fox':belly(s.b,.36,.28,.15);band(0,.06,DARK);
   // The reward fox wears a small football patch: it celebrates the island's hidden matchday balls.
   if(s.id===COIN_FOX){ell(0,.3,.05,.05,0xffffff);for(const [du,dv] of [[0,0],[-.03,.025],[.03,.025],[-.02,-.035],[.02,-.035]])ell(du,.3+dv,.011,.011,DARK);}
   break;
  case 'bear':belly(s.b,.34,.22,.14);break;
  case 'bee':for(const v of [.18,.38])band(v-.05,v+.05,s.a);band(0,.07,s.a);break;
  case 'goat':belly(s.b,.34,.22,.14);for(let i=0;i<6;i++)ell(.5+(rand()-.5)*.4,.2+rand()*.45,.04,.03,mix(s.c,DARK,.08));break;
  case 'zebra':for(let i=0;i<9;i++)ribbon(u=>.06+i*.085+.025*Math.sin(u*Math.PI*6+i),.036,s.a);break;
  case 'wolf':belly(s.b,.35,.26,.14);break;
  case 'lynx':belly(s.b,.34,.24,.14);for(let i=0;i<26;i++)ell(.15+rand()*.7,.1+rand()*.7,.016,.013,s.a);break;
  case 'puma':belly(s.b,.34,.24,.14);for(const u of [.13,.87])ell(u,.75,.03,.06,mix(s.c,DARK,.45));break;
  case 'pig':belly(s.b,.33,.22,.14);break;
  case 'orca':for(const u of [.14,.86])ell(u,.85,.055,.035,s.a,u<.5?.6:-.6);ell(0,.33,.2,.31,s.a);ell(0,.58,.1,.06,s.a);ell(.35,.22,.06,.08,s.a,.4);ell(.65,.22,.06,.08,s.a,-.4);break;
  case 'dog':belly(s.b,.34,.22,.14);ell(.62,.4,.09,.1,s.a);ell(.38,.18,.06,.06,s.a);break;
  case 'deer':belly(s.b,.34,.22,.13);for(let i=0;i<14;i++)ell(.3+rand()*.4,.3+rand()*.45,.018,.016,0xfff3dc);break;
  case 'giraffe':for(let y=0;y<7;y++)for(let x=0;x<9;x++){const u=(x+(y%2)*.5+(rand()-.5)*.3)/9,v=.05+(y+(rand()-.5)*.3)*.135,rr=[0,1,2,3,4,5].map(()=>.8+rand()*.4);
   wrap(()=>{g.fillStyle=hex(s.a);g.beginPath();for(let k=0;k<6;k++){const t=k/6*Math.PI*2,r=.038*S*rr[k];g.lineTo(X(u)+Math.cos(t)*r*1.1,Y(v)+Math.sin(t)*r);}g.fill();});}break;
 }
 // No sash (user decision, Sep 25 2026): the club colours live in the fur, hood, accents and paws. Only the dog keeps
 // a collar, because a collar is part of a dog's look; it takes the club kit colour (or the accent if that matches the fur).
 const dist=(x:number,y:number)=>{const p=new T.Color(x),q=new T.Color(y);return Math.hypot(p.r-q.r,p.g-q.g,p.b-q.b);};
 if(s.animal==='dog')band(.55,.59,dist(s.k,s.c)>.2?s.k:dist(s.a,s.c)>.2?s.a:DARK);
 const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;t.wrapS=T.RepeatWrapping;t.anisotropy=4;t.name='bean-costume-'+id;
 patterns.set(id,t);return t;
}

// ---------------------------------------------------------------- limb bands, paws and hooves
type Band=[number,number];// [start t (0 shoulder/hip → 1 hand/ankle), colour]
export type BeanCostumeLimbs={arm:Band[];leg:Band[];hand:number;boot:number;sole:number};
export function beanCostumeLimbs(id:string):BeanCostumeLimbs|undefined{
 const s=specFor(id);if(!s)return undefined;const c=s.c,a=s.a,sole=0xeee2cc;
 switch(s.animal){
  case 'zebra':return {arm:[[0,c],[.25,a],[.4,c],[.6,a],[.75,c]],leg:[[0,c],[.2,a],[.34,c],[.5,a],[.64,c],[.8,a]],hand:a,boot:DARK,sole};
  case 'bee':return {arm:[[0,a]],leg:[[0,a]],hand:a,boot:DARK,sole};
  case 'fox':return {arm:[[0,c],[.62,DARK]],leg:[[0,c],[.55,DARK]],hand:DARK,boot:DARK,sole};
  case 'liverbird':case 'eagle':case 'vulture':case 'rooster':return {arm:[[0,c]],leg:[[0,c],[.5,BEAK]],hand:c,boot:BEAK,sole:0xd48a24};
  case 'orca':case 'dinosaur':return {arm:[[0,c]],leg:[[0,c]],hand:c,boot:c,sole:a};
  case 'giraffe':return {arm:[[0,c],[.35,a],[.45,c]],leg:[[0,c],[.3,a],[.4,c],[.7,a],[.8,c]],hand:a,boot:DARK,sole};
  case 'goat':case 'deer':return {arm:[[0,c]],leg:[[0,c]],hand:c,boot:0x4a3a30,sole};
  case 'pig':return {arm:[[0,c]],leg:[[0,c]],hand:c,boot:mix(c,DARK,.4),sole};
  case 'lynx':return {arm:[[0,c]],leg:[[0,c]],hand:s.b,boot:s.b,sole};
  default:return {arm:[[0,c]],leg:[[0,c]],hand:a,boot:a,sole};
 }
}

// ---------------------------------------------------------------- merged parts (per costume × build, shared by all wearers)
export type BeanCostumeJoint='torso'|'lumbar'|'chest'|'left-shoulder'|'right-shoulder'|'left-elbow'|'right-elbow';
const CHEST_Y=.32,LUMBAR_Y=.12;
const partCache=new Map<string,Map<BeanCostumeJoint,T.BufferGeometry>>();
/** Merged, vertex-coloured part geometry per joint (joint-local). Cached and never disposed (bounded: ids × 4 builds). */
export function beanCostumeParts(id:string,build:BeanBuild='regular'):Map<BeanCostumeJoint,T.BufferGeometry>|undefined{
 const key=id+'|'+build,hit=partCache.get(key);if(hit)return hit;
 const s=specFor(id);if(!s)return undefined;
 const out=buildParts(s,beanBodyDims(build));partCache.set(key,out);return out;
}
function buildParts(s:Spec,D:BeanBodyDims){
 const A=s.animal,id=s.id,span=D.H-D.y0,R=D.head.R,k=R/.21;
 const Y=new T.Vector3(0,1,0);
 const sp=(u:number,a:number)=>D.point(Math.min(1,Math.max(0,u)),a,new T.Vector3());
 const sn=(u:number,a:number)=>{const e=.004,p0=sp(u,a),pu=sp(Math.min(1,u+e),a).sub(sp(Math.max(0,u-e),a)),pa=sp(u,a+e).sub(sp(u,a-e));const n=new T.Vector3().crossVectors(pa,pu).normalize();if(n.dot(p0.clone().setY(0))<0&&u<.98)n.negate();if(u>.985||!Number.isFinite(n.x))n.set(0,1,0);return n;};
 const surf=(u:number,a:number,off=0)=>sp(u,a).addScaledVector(sn(u,a),off);
 const uAt=(y:number)=>(y-D.y0)/span;
 const faceTopU=Math.min(.97,uAt(D.faceY+D.faceRY*.98)),faceBotU=uAt(D.faceY-D.faceRY);
 const faceA=(u:number)=>D.faceRX/Math.max(.05,D.radius(u));
 const buckets=new Map<BeanCostumeJoint,T.BufferGeometry[]>();
 const tint=(geo:T.BufferGeometry,color:number|T.Color)=>{
  const g=geo.index?geo.toNonIndexed():geo;if(g!==geo)geo.dispose();
  for(const name of Object.keys(g.attributes))if(name!=='position'&&name!=='normal')g.deleteAttribute(name);
  if(!g.getAttribute('color')){const c=color instanceof T.Color?color:new T.Color(color),n=g.getAttribute('position').count,arr=new Float32Array(n*3);for(let i=0;i<n;i++){arr[i*3]=c.r;arr[i*3+1]=c.g;arr[i*3+2]=c.b;}g.setAttribute('color',new T.BufferAttribute(arr,3));}
  return g;
 };
 const push=(joint:BeanCostumeJoint,geo:T.BufferGeometry,color:number|T.Color)=>{const g=tint(geo,color);const list=buckets.get(joint)??[];list.push(g);buckets.set(joint,list);};
 // Torso-space geometry goes on the joint the bean follows at that height (lane A: spine weights), in joint space.
 const route=(y:number):BeanCostumeJoint=>y>CHEST_Y+.03?'chest':y>LUMBAR_Y-.01?'lumbar':'torso';
 const toJoint=(geo:T.BufferGeometry,joint:BeanCostumeJoint)=>{if(joint==='chest')geo.translate(0,-CHEST_Y,0);else if(joint==='lumbar')geo.translate(0,-LUMBAR_Y,0);return geo;};
 const put=(geo:T.BufferGeometry,color:number,pos:T.Vector3,dir:T.Vector3=Y,spin=0,joint?:BeanCostumeJoint)=>{
  geo.rotateY(spin);geo.applyQuaternion(new T.Quaternion().setFromUnitVectors(Y,dir.clone().normalize()));geo.translate(pos.x,pos.y,pos.z);
  const j=joint??route(pos.y);push(j,toJoint(geo,j),color);
 };
 const onS=(geo:T.BufferGeometry,color:number,u:number,a:number,off=0,tilt=0)=>put(geo,color,surf(u,a,off),sn(u,a).lerp(Y,tilt).normalize());
 const sph=(r:number,sx=1,sy=1,sz=1,w=10,h=7)=>{const g=new T.SphereGeometry(r,w,h);g.scale(sx,sy,sz);return g;};
 const cone=(r:number,h:number,seg=8,sz=1)=>{const g=new T.ConeGeometry(r,h,seg);g.translate(0,h/2,0);g.scale(1,1,sz);return g;};
 const cyl=(r0:number,r1:number,h:number,seg=8)=>{const g=new T.CylinderGeometry(r1,r0,h,seg);g.translate(0,h/2,0);return g;};
 const curveTube=(pts:T.Vector3[],r0:number,r1:number,seg=16,radial=7)=>{const cv=new T.CatmullRomCurve3(pts),g=new T.TubeGeometry(cv,seg,1,radial,false),pos=g.getAttribute('position'),v=new T.Vector3(),ring=radial+1;
  for(let i=0;i<pos.count;i++){const f=Math.floor(i/ring)/seg,c=cv.getPoint(f);v.fromBufferAttribute(pos,i).sub(c).multiplyScalar(r0+(r1-r0)*f).add(c);pos.setXYZ(i,v.x,v.y,v.z);}
  g.computeVertexNormals();return {g,cv};};
 const pair=(fn:(side:number)=>void)=>{fn(-1);fn(1);};
 const V=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);

 // ---- hood rim: a soft roll framing the face panel, so the face reads as "inside" the costume
 {const pts:T.Vector3[]=[];for(let i=0;i<28;i++){const t=i/28*Math.PI*2,y=D.faceY+Math.sin(t)*D.faceRY*1.06,u=uAt(y),a=Math.cos(t)*D.faceRX*1.06/Math.max(.05,D.radius(u));pts.push(surf(u,a,.004));}
  const rimColor=({lion:s.a,bee:s.a,zebra:s.a,fox:s.a,wolf:s.a,puma:s.a} as Partial<Record<AnimalKind,number>>)[A]??s.c;
  const g=new T.TubeGeometry(new T.CatmullRomCurve3(pts,true),40,.024*k,7,true);push('chest',g.translate(0,-CHEST_Y,0),rimColor);}
 // eyes that sit on top of a visor (kigurumi style), facing forward
 const visorEyes=(p:T.Vector3,spread:number,r:number)=>pair(side=>{const e=p.clone().add(V(side*spread,0,0));put(sph(r,1,1,.8),0xffffff,e);put(sph(r*.55,1,1,.6),0x1d1f1e,e.clone().add(V(side*r*.1,r*.1,r*.62)));});
 const cat=A==='wildcat'||A==='fox'||A==='lynx'||A==='puma'||A==='wolf';
 const bird=A==='liverbird'||A==='eagle'||A==='vulture'||A==='rooster';

 // ---- ears, horns, antlers, manes, crests
 if(cat)pair(side=>{
  const w=.075*k,aa=side*1.05,ua=.9;
  if(A==='puma'){// rounded, upright big-cat ears: dark backs, tawny fronts, pale insides
   const ww=w*1.45,uu=.92,a2=side*.98;onS(sph(ww,1,1.05,.42),mix(s.c,DARK,.55),uu,a2,-.006,.6);onS(sph(ww*.9,1,1,.38),s.c,uu,a2,.006,.6);onS(sph(ww*.52,1,.9,.3),s.a,uu,a2,.018,.6);return;}
  const h=({fox:.2,wolf:.17,wildcat:.15,lynx:.15} as Record<string,number>)[A]*(id===COIN_FOX?1.15:1)*k;
  onS(cone(w,h,8,.5),s.c,ua,aa,-.01,.45);
  onS(cone(w*.58,h*.7,8,.3),A==='fox'?CREAM:s.a,ua-.02,aa*.96,.01,.45);
  if(A==='fox'||A==='lynx'){const n=sn(ua,aa).lerp(Y,.45).normalize();put(cone(w*.32,h*(A==='lynx'?.55:.25),6,.5),DARK,surf(ua,aa,-.01).addScaledVector(n,h*.78),n);}
 });
 if(A==='bear')pair(side=>{onS(sph(.07*k,1,1,.55),s.c,.9,side*1.15,0,.4);onS(sph(.042*k,1,1,.4),s.a,.9,side*1.12,.012,.4);});
 if(A==='pig')pair(side=>{const n=sn(.9,side*1.1).lerp(V(side*.6,.5,.6),.6).normalize();put(cone(.07*k,.12*k,4,.35),s.c,surf(.9,side*1.1),n);put(cone(.04*k,.08*k,4,.2),s.a,surf(.9,side*1.08,.01),n);});
 if(A==='dog')pair(side=>{const dir=V(side*.55,-1,.05).normalize(),g=sph(1,.045*k,.13*k,.075*k,12,9);g.translate(0,.1*k,0);put(g,s.a,surf(.93,side*.95,-.005),dir);});
 if(A==='goat'||A==='deer'||A==='giraffe'||A==='zebra')pair(side=>{const n=V(side,.45,.1).normalize();put(sph(.03*k,1,2.1,.6),s.c,surf(.86,side*1.35,-.01).addScaledVector(n,.05),n);put(sph(.018*k,1,1.8,.4),A==='zebra'?s.a:PINK,surf(.86,side*1.33).addScaledVector(n,.052).add(V(0,0,.01)),n);});
 if(A==='goat'){pair(side=>{// curled billy-goat horns sweeping back and down
   const base=surf(.95,side*.55,-.01),P=(x:number,y:number,z:number)=>base.clone().add(V(side*x*k,y*k,z*k));
   const {g}=curveTube([P(0,0,.01),P(.05,.09,-.03),P(.13,.1,-.12),P(.18,0,-.13),P(.17,-.08,-.06),P(.12,-.07,0)],.034*k,.012*k,18);push('chest',g.translate(0,-CHEST_Y,0),s.a);});
  const beard=sph(1,.05*k,.075*k,.035*k);beard.translate(0,-.045*k,.01*k);put(beard,0xfffaf0,surf(faceBotU,0,-.005));
  const tip=cone(.03*k,.06*k,7,.7);tip.rotateX(Math.PI-.2);tip.translate(0,-.1*k,.02*k);put(tip,0xfffaf0,surf(faceBotU,0,-.005));}
 if(A==='deer')pair(side=>{// Kashima Antlers: the antlers are the costume's signature
  const base=surf(.95,side*.55),m=[base,base.clone().add(V(side*.05*k,.12*k,-.02*k)),base.clone().add(V(side*.12*k,.24*k,-.05*k)),base.clone().add(V(side*.16*k,.33*k,-.03*k))];
  push('chest',new T.TubeGeometry(new T.CatmullRomCurve3(m),12,.016*k,6,false).translate(0,-CHEST_Y,0),0xf3e2c0);
  for(const [f,ox,oy] of [[.35,-.05,.09],[.7,.07,.1]]){const p0=m[1].clone().lerp(m[2],f);push('chest',new T.TubeGeometry(new T.CatmullRomCurve3([p0,p0.clone().add(V(side*ox*k,oy*.6*k,.03*k)),p0.clone().add(V(side*ox*1.2*k,oy*k,.05*k))]),6,.012*k,6,false).translate(0,-CHEST_Y,0),0xf3e2c0);}
 });
 if(A==='giraffe')pair(side=>{const base=surf(.96,side*.5),n=V(side*.2,1,-.1).normalize();put(cyl(.018*k,.016*k,.13*k),s.c,base,n);put(sph(.028*k),s.a,base.clone().addScaledVector(n,.13*k),n);});
 if(A==='giraffe'||A==='zebra')for(let i=0;i<9;i++){const u=.99-i*.045,a=i===0?0:Math.PI;put(new T.BoxGeometry(.024*k,.07*k,.05*k).translate(0,.03*k,0),A==='zebra'?(i%2?s.c:s.a):s.a,surf(u,a,-.005),sn(u,a));}
 if(A==='lion'){// a mane round the face and over the hood: Dune's is a spiky sunburst, Canopy's broad and swept
  for(let i=0;i<22;i++){const t=i/22*Math.PI*2,y=D.faceY+.02+Math.sin(t)*D.faceRY*1.45,u=Math.min(.985,uAt(y)),a=Math.cos(t)*D.faceRX*1.45/Math.max(.06,D.radius(u));const n=sn(u,a).lerp(V(Math.cos(t),Math.sin(t),.2),.35).normalize();
   if(id==='chelsea')put(cone(.055*k,.13*k,5,.6),i%2?s.a:mix(s.a,0xffffff,.15),surf(u,a,-.02),n);else put(sph(.06*k,1,1.25,.7,8,6),i%2?s.a:mix(s.a,DARK,.15),surf(u,a),n);}
  pair(side=>onS(sph(.05*k,1,1,.5),s.c,.95,side*.8,.02,.3));}
 if(A==='lynx'||A==='wolf')pair(side=>{const u=uAt(D.faceY-.09),a=side*faceA(u)*1.25,col=A==='lynx'?s.b:s.a;put(cone(.05*k,(A==='lynx'?.11:.09)*k,5,.5),col,surf(u,a,-.01),V(side,-.55,.2).normalize());put(cone(.04*k,.08*k,5,.5),col,surf(u+.06,a*1.02,-.01),V(side,-.1,.2).normalize());});
 if(bird){// open beak: the upper beak is a visor over the face, the lower beak a shelf under the chin
  const p0=surf(faceTopU,0,-.01),len=({liverbird:.2,eagle:.16,vulture:.17,rooster:.11} as Record<string,number>)[A]*k,beakCol=A==='rooster'||A==='eagle'?BEAK:s.a,hooked=A==='eagle'||A==='vulture';
  const up=sph(1,.11*k,.05*k,len*.62,14,9);up.translate(0,0,len*.42);up.rotateX(.18);put(up,beakCol,p0);
  const tip=cone(.045*k,len*.55,10,.5);tip.rotateX(Math.PI/2+(hooked?.75:.35));tip.translate(0,-.005,len*.82);put(tip,beakCol,p0);
  const lo=sph(1,.085*k,.03*k,len*.42,12,8);lo.translate(0,0,len*.3);put(lo,beakCol,surf(faceBotU,0,-.012));
  visorEyes(p0.clone().add(V(0,.045*k,.02*k)),.055*k,.03*k);
  if(A==='eagle')pair(side=>put(new T.BoxGeometry(.075*k,.02*k,.03*k).rotateZ(side*-.35),mix(s.c,DARK,.3),p0.clone().add(V(side*.058*k,.085*k,.02*k))));
  if(A==='liverbird')for(let i=0;i<3;i++)onS(cone(.03*k,(.14-Math.abs(i-1)*.03)*k,6,.5),s.a,.97,(i-1)*.5+Math.PI,0,.7);
  if(A==='rooster'){const comb=0xd33a2c;// a natural red comb and wattle keep the rooster readable on any kit
   for(let i=0;i<4;i++)put(sph(.042*k,.55,1.3,1),comb,surf(i===0?.95:.99,0,.02).add(V(0,.03*k,(.08-i*.065)*k)));
   put(sph(.035*k,.8,1.3,.6),comb,surf(faceBotU-.01,0,.01),sn(faceBotU,0));}
  if(A==='vulture')for(let i=0;i<20;i++){const a=i/20*Math.PI*2,u=.565+.015*Math.sin(i*2.3);put(sph(.068*k,1,.85,.75,8,6),i%2?CREAM:0xf3e6cc,surf(u,a),sn(u,a));}
 }
 if(A==='bee')pair(side=>{const base=surf(.95,side*.55),tip=base.clone().add(V(side*.07*k,.17*k,.04*k));push('chest',new T.TubeGeometry(new T.CatmullRomCurve3([base,base.clone().add(V(side*.02*k,.1*k,0)),tip]),8,.01*k,6,false).translate(0,-CHEST_Y,0),s.a);put(sph(.03*k),s.a,tip);});
 if(A==='puma'){// big-cat muzzle over the face: pale whisker pads, a pink-brown nose, a dark mouth line and whisker dots
  const p0=surf(faceTopU,0,-.012),pad=mix(s.a,0xffffff,.35);
  pair(side=>put(sph(1,.058*k,.046*k,.07*k,12,8),pad,p0.clone().add(V(side*.04*k,-.004*k,.055*k))));
  put(sph(1,.05*k,.03*k,.05*k,10,7),pad,p0.clone().add(V(0,-.03*k,.05*k)));
  const nose=cone(.032*k,.036*k,3,.6);nose.rotateX(Math.PI);nose.rotateY(Math.PI);put(nose,0xa0615a,p0.clone().add(V(0,.05*k,.112*k)));
  put(new T.BoxGeometry(.006*k,.03*k,.006*k),0x3a2a26,p0.clone().add(V(0,.018*k,.122*k)));
  pair(side=>{for(let i=0;i<3;i++)put(sph(.007*k),0x3a2a26,p0.clone().add(V(side*(.035+i*.014)*k,(.012-i*.008)*k,(.115-i*.012)*k)));});
  visorEyes(p0.clone().add(V(0,.08*k,.025*k)),.068*k,.032*k);}
 if(A==='wolf'||A==='dog'||A==='pig'){// muzzle visor over the face with a nose, eyes on top
  const p0=surf(faceTopU,0,-.012);
  if(A==='pig'){const d=new T.CylinderGeometry(.075*k,.08*k,.07*k,16);d.rotateX(Math.PI/2);d.translate(0,.01*k,.06*k);put(d,mix(s.c,s.a,.35),p0);pair(side=>put(sph(.014*k,1,1.3,.4),mix(s.a,DARK,.4),p0.clone().add(V(side*.028*k,.01*k,.097*k))));visorEyes(p0.clone().add(V(0,.085*k,.02*k)),.06*k,.03*k);}
  else{const long=A==='wolf',m=sph(1,(long?.085:.1)*k,(long?.06:.065)*k,(long?.15:.11)*k,14,9);m.translate(0,.005*k,(long?.1:.075)*k);put(m,long?s.a:s.b,p0);
   put(sph((long?.03:.04)*k,1.2,.85,.9),0x2a2224,p0.clone().add(V(0,.04*k,(long?.235:.175)*k)));visorEyes(p0.clone().add(V(0,.08*k,.03*k)),.065*k,.032*k);}
 }
 if(A==='dinosaur'){// snout visor with nostrils, teeth and eyes over the face; spikes from the crown down the back
  const p0=surf(faceTopU,0,-.015),sn0=sph(1,.15*k,.07*k,.15*k,16,10);sn0.translate(0,.01*k,.09*k);put(sn0,s.c,p0);
  pair(side=>put(sph(.013*k,1,.7,.5),mix(s.c,DARK,.5),p0.clone().add(V(side*.045*k,.05*k,.225*k))));
  for(let i=-3;i<=3;i++){const g=cone(.018*k,.045*k,5);g.rotateX(Math.PI);const t=i/3.4;put(g,0xffffff,p0.clone().add(V(t*.12*k,-.045*k,(.1+.1*Math.cos(t*1.4))*k)));}
  visorEyes(p0.clone().add(V(0,.085*k,.06*k)),.07*k,.038*k);
  for(let i=0;i<8;i++){const u=.985-i*.105,a=Math.PI;put(cone(.055*k,(.16-i*.01)*k,5,.42),s.a,surf(u,a,-.012),sn(Math.min(u,.97),a).lerp(V(0,0,-1),i===0?.6:0).normalize(),Math.PI/2);}
 }
 if(A==='orca'){// eye patches are painted; the fin tells the two orcas apart (on the head for Swell, the back for Ripple)
  if(id==='nagoya')put(cone(.1*k,.2*k,6,.3),s.c,surf(.97,Math.PI,-.01),V(0,1,-.35).normalize());
  else{// a tall dorsal fin rising from the upper back, raked backwards: it shows above the shoulders from the front
   const f=cone(.1*k,.34*k,6,.22);f.translate(0,0,-.03*k);put(f,s.c,surf(.8,Math.PI,-.02),V(0,1,-.45).normalize());}
  // White eye patches on the front of the hood, above the face's top corners, so the orca reads head-on.
  pair(side=>{const u=Math.min(.95,faceTopU-.035),a=side*(faceA(u)*.95+.12),g=sph(1,.1*k,.042*k,.008*k,16,8);g.rotateZ(side*-.35);put(g,s.a,surf(u,a,.003),sn(u,a));});
 }

 // ---- tails (torso space, low on the back)
 const back=(u:number)=>surf(u,Math.PI),tb=back(.12),T3=(x:number,y:number,z:number)=>tb.clone().add(V(x,y,z));
 // A swishing S-curve: out behind, round to the right hip and tip up, so the tail shows from the front too.
 const swish=[T3(0,.02,.01),T3(.04,-.07,-.12),T3(.15,-.05,-.2),T3(.24,.07,-.17),T3(.27,.22,-.1)];
 if(A==='fox'||A==='wolf'){const big=A==='fox'?1.15:1,cv=new T.CatmullRomCurve3(swish),seg=18,radial=9,g=new T.TubeGeometry(cv,seg,1,radial,false),pos=g.getAttribute('position'),v=new T.Vector3(),end=cv.getPoint(1);
  for(let i=0;i<pos.count;i++){const f=Math.floor(i/(radial+1))/seg,c=cv.getPoint(f),r=(.03+Math.sin(Math.min(1,f*1.08)*Math.PI)*.06+(f>.97?-.02:0))*big;v.fromBufferAttribute(pos,i).sub(c).multiplyScalar(Math.max(.012,r)).add(c);pos.setXYZ(i,v.x,v.y,v.z);}
  g.computeVertexNormals();const gi=g.toNonIndexed();g.dispose();gi.deleteAttribute('uv');
  const tipC=new T.Color(A==='fox'?CREAM:mix(s.c,DARK,.35)),baseC=new T.Color(s.c),p2=gi.getAttribute('position'),arr=new Float32Array(p2.count*3);
  for(let i=0;i<p2.count;i++){v.fromBufferAttribute(p2,i);const c=v.distanceTo(end)<.085*big?tipC:baseC;arr[i*3]=c.r;arr[i*3+1]=c.g;arr[i*3+2]=c.b;}
  gi.setAttribute('color',new T.BufferAttribute(arr,3));push('torso',gi,baseC);put(sph(.028*big),tipC.getHex(),end,Y,0,'torso');}
 else if(A==='wildcat'||A==='puma'||A==='lion'||A==='zebra'||A==='giraffe'){
  const short=A==='zebra'||A==='giraffe',pts=short?[T3(0,.02,.01),T3(.02,-.06,-.1),T3(.05,-.16,-.14)]:A==='puma'?[T3(0,.02,.01),T3(.04,-.1,-.14),T3(.18,-.1,-.26),T3(.32,.05,-.24),T3(.37,.26,-.14),T3(.33,.36,-.08)]:swish;
  const {g,cv}=curveTube(pts,A==='puma'?.038:.034,A==='puma'?.03:.022,A==='puma'?22:16);push('torso',g,s.c);const end=cv.getPoint(1),tan=cv.getTangent(1);
  if(A==='wildcat'){for(let i=0;i<4;i++){const f=.3+i*.18,r=.034-.012*f,ring=new T.TorusGeometry(r+.002,.011,5,12),p=cv.getPoint(f);ring.applyQuaternion(new T.Quaternion().setFromUnitVectors(V(0,0,1),cv.getTangent(f)));push('torso',ring.translate(p.x,p.y,p.z),s.a);}put(sph(.03,1,1.2,1),s.a,end,tan,0,'torso');}
  if(A==='puma')put(sph(.036,1,1.6,1),DARK,end.clone().addScaledVector(tan,-.02),tan,0,'torso');
  if(A==='lion'||A==='zebra'||A==='giraffe'){put(cone(.05,.1,7),s.a,end.clone().addScaledVector(tan,-.02),tan,0,'torso');put(sph(.05,1,.8,1),s.a,end,Y,0,'torso');}
 }
 else if(A==='lynx')put(sph(.05,1,1.2,1),s.c,back(.15).add(V(0,0,-.03)),V(0,.3,-1),0,'torso');
 else if(A==='bear')put(sph(.055),s.c,back(.13),Y,0,'torso');
 else if(A==='deer'||A==='goat'){put(sph(.045,1,1.3,.7),s.c,back(.16).add(V(0,.02,-.02)),V(0,.6,-.8),0,'torso');if(A==='deer')put(sph(.03,1,1.2,.6),0xfff3dc,back(.16).add(V(0,.01,-.045)),V(0,.6,-.8),0,'torso');}
 else if(A==='pig')put(new T.TorusGeometry(.045,.015,6,16,Math.PI*1.75).rotateY(Math.PI/2),s.a,back(.16).add(V(0,0,-.045)),Y,0,'torso');
 else if(A==='dinosaur'){put(cone(.11,.38,8),s.c,back(.12).add(V(0,.02,.03)),V(0,-.35,-1).normalize(),0,'torso');for(let i=0;i<3;i++)put(cone(.035,.07,5,.45),s.a,back(.12).add(V(0,.06-i*.045,-.1-i*.09)),V(0,1,-.2).normalize(),Math.PI/2,'torso');}
 else if(A==='orca'){const p0=back(.1),pts=[p0,p0.clone().add(V(0,-.05,-.12)),p0.clone().add(V(0,-.07,-.22))];push('torso',new T.TubeGeometry(new T.CatmullRomCurve3(pts),8,.04,6,false),s.c);pair(side=>put(sph(.12,1,.22,.5),s.c,pts[2].clone().add(V(side*.06,-.01,-.02)),Y,side*.5,'torso'));}
 else if(bird){const n=A==='rooster'?5:3;for(let i=0;i<n;i++){const f=i-(n-1)/2,dir=V(f*.45,A==='rooster'?1.1-Math.abs(f)*.25:-.35,-1).normalize(),g=sph(A==='rooster'?.05:.055,1,.45,4.2);g.translate(0,0,-.2);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(V(0,0,-1),dir));const p=back(.16);push('torso',g.translate(p.x,p.y,p.z),A==='rooster'?(i%2?0x2f6b4f:DARK):i%2?s.a:s.c);}}
 else if(A==='bee'){put(cone(.03,.07,6),DARK,back(.08),V(0,-.3,-1).normalize(),0,'torso');pair(side=>{const g=sph(.19,.45,1,.05,14,8);g.translate(0,.15,0);put(g,0xe3f1f6,back(.55).add(V(side*.05,0,0)),V(side*.9,.8,-.45).normalize(),0,'chest');});}
 else if(A==='dog'){const b0=back(.15),pts=[b0,b0.clone().add(V(0,.07,-.07)),b0.clone().add(V(.02,.15,-.08))];push('torso',new T.TubeGeometry(new T.CatmullRomCurve3(pts),8,.025,6,false),s.c);put(sph(.03),s.a,pts[2],Y,0,'torso');
  put(new T.CylinderGeometry(.022,.022,.006,12).rotateX(Math.PI/2),0xf2c94c,surf(.525,0,.02));}

 // ---- wings (birds) and flippers (orca) on the solver's arm joints (joint-local: the arm hangs along -y)
 if(bird||A==='orca')for(const side of [-1,1] as const){
  const sh:BeanCostumeJoint=side<0?'left-shoulder':'right-shoulder',el:BeanCostumeJoint=side<0?'left-elbow':'right-elbow';
  if(A==='orca'){// broad paddle flippers angled out from the forearm, so they show from the front
   const g=sph(1,.03,.19,.1,12,8);g.translate(0,-.12,0);g.rotateZ(side*.5);g.rotateX(-.2);g.translate(side*.03,-.06,-.01);push(el,g,s.c);const w=sph(1,.031,.07,.05,10,6);w.translate(0,-.2,.02);w.rotateZ(side*.5);w.rotateX(-.2);w.translate(side*.03,-.06,-.01);push(el,w,s.a);continue;}
  const tone=(f:number)=>f%2?mix(s.c,DARK,.18):s.c;
  // A feather fringe on the outer side of the arm, broad in a front view.
  for(let f=0;f<4;f++){const len=.13+f*.025,g=sph(1,.05,len,.014,7,5);g.translate(0,-len*.9,0);g.rotateZ(side*(.35-f*.09));g.translate(side*.03,-.02-f*.03,-.01);push(sh,g,tone(f));}
  for(let f=0;f<3;f++){const len=.15-f*.01,g=sph(1,.048,len,.013,7,5);g.translate(0,-len*.9,0);g.rotateZ(side*(.3-f*.12));g.translate(side*.03,-.03-f*.04,-.012);push(el,g,f===2&&A!=='rooster'?(A==='vulture'?CREAM:s.a):tone(f+1));}
 }

 const out=new Map<BeanCostumeJoint,T.BufferGeometry>();
 for(const [joint,list] of buckets){const geo=mergeGeometries(list,false);list.forEach(g=>g.dispose());if(!geo)continue;geo.computeBoundingSphere();geo.name=`bean-costume-${id}-${joint}`;out.set(joint,geo);}
 return out;
}

// ---------------------------------------------------------------- materials
const CLAY=/* glsl */`
{
 vec3 vd=normalize(vViewPosition);float fres=pow(1.-clamp(dot(normal,vd),0.,1.),2.5);
 outgoingLight+=reflectedLight.indirectDiffuse*(.22+fres*.55);
}`;
let partMaterial:T.MeshStandardMaterial|undefined;
/** One vertex-colour clay material for every costume's parts (never disposed). */
export function beanCostumePartMaterial(){
 if(partMaterial)return partMaterial;
 const m=new T.MeshStandardMaterial({vertexColors:true,roughness:.58,metalness:0});m.name='bean-costume-parts';
 m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <opaque_fragment>',CLAY+'\n#include <opaque_fragment>');};
 m.customProgramCacheKey=()=>'bean-costume-parts-v1';
 return partMaterial=m;
}
/** Where the costume fragment code goes in lane A's shaders (tests check both are found). */
export const BODY_HOOK=' // Derivatives outside the region branches',LIMB_HOOK=' diffuseColor.rgb=col;\n}';
const BODY_PARS=/* glsl */`
uniform sampler2D uCostumePattern;
float costumeRad(float u,vec4 s0){
 float uu=clamp(u,0.,1.),e=abs(2.*uu-1.),n=uu>.5?2.3:2.1;
 return s0.y*pow(max(0.,1.-pow(e,n)),1./n)*(1.+s0.w*(uu-.5))*(1.+.04*sin(uu*6.2831853-1.2));
}`;
const BODY_CODE=/* glsl */`
 { float cr=max(costumeRad(u,bt(${BD.shape0})),.02),ca=vBeanBack.x/cr+3.14159265;
   // U wraps at the front centre: take its screen derivatives from the face coordinate there (continuous at the
   // front) and from the back coordinate elsewhere, so the mip level never jumps (no seam line down the belly).
   vec2 gb=vec2(dFdx(vBeanBack.x),dFdy(vBeanBack.x)),gf=vec2(dFdx(vBeanFace.x),dFdy(vBeanFace.x));
   float front=step(1.5707963,abs(ca-3.14159265));vec2 gu=mix(gb,gf,front)/(cr*6.2831853),gv=vec2(dFdx(u),dFdy(u));
   col=textureGrad(uCostumePattern,vec2(ca/6.2831853,clamp(u,.002,.998)),vec2(gu.x,gv.x),vec2(gu.y,gv.y)).rgb; }
`;
const LIMB_PARS=/* glsl */`
uniform vec4 uCostumeArm[6];uniform vec4 uCostumeLeg[6];uniform vec3 uCostumeHand;uniform vec3 uCostumeBoot;uniform vec3 uCostumeSole;
vec3 costumeBand(vec4 b[6],float t){vec3 c=b[0].rgb;for(int i=1;i<6;i++)if(b[i].w>=0.&&t>=b[i].w)c=b[i].rgb;return c;}`;
const LIMB_CODE=/* glsl */`
 { float ct=vBeanS.x/max(vBeanS.x+vBeanS.y,1e-3);
   if(vBeanPaint<-1.5)col=costumeBand(uCostumeLeg,ct);
   else if(vBeanPaint<-.5)col=costumeBand(uCostumeArm,ct);
   else if(abs(vBeanPaint-${BD.boots}.)<.5)col=vBeanS.z<-.062?uCostumeSole:uCostumeBoot;
   else if(abs(vBeanPaint-${BD.hands}.)<.5)col=uCostumeHand; }
`;
/** Applies the costume patch after lane A's own shader patch; returns whether each hook was found. */
export function patchCostumeShader(kind:'body'|'limbs',shader:{fragmentShader:string}){
 const [hook,pars,code]=kind==='body'?[BODY_HOOK,BODY_PARS,BODY_CODE]:[LIMB_HOOK,LIMB_PARS,LIMB_CODE];
 if(!shader.fragmentShader.includes(hook))return false;
 shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\n'+pars).replace(hook,kind==='body'?code+hook:code+hook);
 return true;
}
function costumeMaterial(kind:'body'|'limbs',data:T.Texture,uniforms:Record<string,T.IUniform>){
 const m=new BeanMaterial(kind,data),base=m.onBeforeCompile;
 m.onBeforeCompile=(sh,r)=>{base.call(m,sh,r);Object.assign(sh.uniforms,uniforms);patchCostumeShader(kind,sh);};
 m.customProgramCacheKey=()=>'bean-costume-'+kind+'-v1';m.name='bean-costume-'+kind;
 m.userData.costumeUniforms=uniforms;
 return m;
}
const linear=(n:number)=>new T.Color(n);
function bandUniform(bands:Band[]){return Array.from({length:6},(_,i)=>{const b=bands[i];if(!b)return new T.Vector4(0,0,0,-1);const c=linear(b[1]);return new T.Vector4(c.r,c.g,c.b,b[0]);});}

// ---------------------------------------------------------------- wearing a costume on a bean rig
type Joints=Record<BeanCostumeJoint,T.Object3D>;
const JOINT_NAMES:Record<BeanCostumeJoint,string>={torso:'armor-torso',lumbar:'player-lumbar',chest:'player-chest','left-shoulder':'left-shoulder','right-shoulder':'right-shoulder','left-elbow':'left-elbow','right-elbow':'right-elbow'};
export type BeanCostumeState={id:string;build:BeanBuild;meshes:T.Mesh[]};
type Wearable={root:T.Object3D;setAppearance:(value:any)=>void;setBeanLook:(...a:any[])=>void;setShirtNumber:(n:number|null)=>void;dispose:()=>void};// eslint-disable-line @typescript-eslint/no-explicit-any
/**
 * Lets a bean rig wear bean costumes (the switch that replaces lane A's classic fallback). Idempotent; returns the
 * rig. Without a bean skin (classic style) it changes nothing. Costume ids without a bean version (none today) keep
 * the classic fallback.
 */
export function attachBeanCostumes<R extends Wearable>(rig:R):R{
 const skin=beanSkinOf(rig);
 if(!skin||(rig as {beanCostumeWear?:unknown}).beanCostumeWear)return rig;
 const find=(name:string)=>rig.root.getObjectByName(name);
 const joints={} as Joints;for(const [k,n] of Object.entries(JOINT_NAMES)){const o=find(n);if(!o)return rig;joints[k as BeanCostumeJoint]=o;}
 const [bodyMesh,limbMesh,...headMeshes]=skin.meshes;
 const baseBody=bodyMesh.material as BeanMaterial,baseLimbs=limbMesh.material as BeanMaterial;
 let state:BeanCostumeState|undefined,bodyMat:BeanMaterial|undefined,limbMat:BeanMaterial|undefined;
 const layerMasks=new Map<T.Object3D,number>();
 const takeOff=()=>{
  if(!state)return;
  for(const m of state.meshes)m.removeFromParent();
  bodyMesh.material=baseBody;limbMesh.material=baseLimbs;bodyMat?.dispose();limbMat?.dispose();bodyMat=limbMat=undefined;
  for(const [o,mask] of layerMasks)o.layers.mask=mask;layerMasks.clear();
  state=undefined;
 };
 const putOn=(id:string)=>{
  const build=(skin.look.build??'regular') as BeanBuild;
  if(state&&state.id===id&&state.build===build)return;
  takeOff();
  const parts=beanCostumeParts(id,build),limbs=beanCostumeLimbs(id);if(!parts||!limbs)return;
  const data=baseBody.beanUniforms.beanData.value!;
  bodyMat=costumeMaterial('body',data,{uCostumePattern:{value:beanCostumePattern(id)}});
  limbMat=costumeMaterial('limbs',data,{uCostumeArm:{value:bandUniform(limbs.arm)},uCostumeLeg:{value:bandUniform(limbs.leg)},uCostumeHand:{value:linear(limbs.hand)},uCostumeBoot:{value:linear(limbs.boot)},uCostumeSole:{value:linear(limbs.sole)}});
  bodyMesh.material=bodyMat;limbMesh.material=limbMat;
  // Hair and hats go under the hood. Layers, not .visible: lane A owns the visibility of its meshes.
  for(const o of headMeshes){layerMasks.set(o,o.layers.mask);o.layers.set(31);}
  const meshes:T.Mesh[]=[],mat=beanCostumePartMaterial();
  for(const [joint,geo] of parts){const mesh=new T.Mesh(geo,mat);mesh.name='bean-costume-'+joint;mesh.castShadow=true;mesh.receiveShadow=true;
   mesh.userData.playerId=bodyMesh.userData.playerId;mesh.userData.costumeId=id;mesh.userData.beanCostume=true;
   joints[joint].add(mesh);mesh.updateMatrix();mesh.matrixAutoUpdate=false;meshes.push(mesh);}
  state={id,build,meshes};
 };
 const {setAppearance,setBeanLook,setShirtNumber,dispose}=rig;
 // Lane A's hook re-hides every non-skin mesh (its classic-body capture) on setAppearance / setShirtNumber /
 // setBeanLook-with-a-number. The costume parts are not classic meshes, so show them again after each of those calls.
 // (Bug fix, Sep 25 2026: equipping a costume in the town showed no hood, tail or wings because Town calls
 // setBeanLook, which sets the shirt number, right after setAppearance.)
 const show=()=>{if(state)for(const m of state.meshes)m.visible=true;};
 rig.setAppearance=(value:{costume?:string|null})=>{
  const id=value?.costume;
  if(hasBeanCostume(id)){setAppearance({...value,costume:'none'});putOn(id!);show();}
  else{takeOff();setAppearance(value);}
 };
 rig.setBeanLook=(...args:unknown[])=>{setBeanLook(...args);if(state)putOn(state.id);show();};
 rig.setShirtNumber=(n:number|null)=>{setShirtNumber(n);show();};
 rig.dispose=()=>{takeOff();dispose();};
 Object.defineProperty(rig,'beanCostumeWear',{value:{get state(){return state;},skin:skin as BeanSkin},enumerable:false,configurable:true});
 return rig;
}
/** The bean costume a rig is wearing (undefined when none, or when it shows the classic fallback). */
export function beanCostumeOf(rig:object):BeanCostumeState|undefined{return (rig as {beanCostumeWear?:{state?:BeanCostumeState}}).beanCostumeWear?.state;}
