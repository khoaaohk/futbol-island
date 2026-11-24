// Street vehicle bodies (Nov 18 2026, owner: "improve the looks and feel of each car and truck while keeping down the heat").
// Every vehicle is ONE merged mesh with ONE material (it was four meshes, four materials, four shadow casters): paint, glass, tyres,
// trim and lamps are vertex colours. Wheels spin and the front pair steers in the vertex shader (a per-vertex pivot in `aPart`, one
// vec4 uniform per vehicle), and the lamps (head, brake, left and right indicators) glow through one more vec4, so none of that
// costs a draw call, a texture or a buffer upload. Faces nobody can see (undersides, faces pressed against another part, the inner
// wheel caps) are not built: each style comes in under the triangle count of the plain box car it replaces (tests/traffic-vehicles.cjs).
import * as T from 'three';
export type VehicleStyle='sedan'|'hatch'|'van'|'wagon'|'jeep'|'taxi'|'pickup';
/** Ordinary cars by traffic index (the two pickups are indices 7 and 8). */
export const CAR_STYLES:readonly VehicleStyle[]=['sedan','hatch','taxi','wagon','van','hatch','jeep','pickup','pickup','van','wagon'];
/** aPart.w: what a vertex belongs to. xyz is the wheel centre for wheels. */
export const PART={body:0,rearWheel:1,frontWheel:2,head:3,brake:4,left:5,right:6,strap:7} as const;
/** PART.strap (Island Line hand straps, Nov 24 2026): swings about its pivot (aPart.xyz, the strap rail) and glows like the interior
 *  (the left / night channel). Lateral: the car's curve lean, read from the instance matrix (4x the roll, outward). Fore-aft: one
 *  pendulum per train (uSway, from car 0's motion in onBeforeRender: O(1) per draw, no per-strap CPU work). Off with reduced motion. */
const STRAP_ROLL=4,STRAP_W=4.4,STRAP_DAMP=1.6,STRAP_GAIN=.75,STRAP_MAX=.12;
let reducedMotion:MediaQueryList|null|undefined;
const motionOk=()=>{if(reducedMotion===undefined)reducedMotion=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;return !reducedMotion?.matches;};
/** Triangles of the box vehicles these replace (Nov 17 2026 build): the budget a style must not exceed. */
export const OLD_TRIANGLES={car:276,pickup:524} as const;
export const WHEEL_RADIUS=.32;
const TRIM='#2b3534',TYRE='#262e2e',HUB='#c9cfc9',GLASS='#6f9a97',CREAM='#efe1bd',HEAD='#fff1c2',TAIL='#c93a2c',AMBER='#ffa52b',CHROME='#b9c2c0';
type V=[number,number,number];
function builder(){
 const pos:number[]=[],nor:number[]=[],col:number[]=[],part:number[]=[],c=new T.Color(),a=new T.Vector3(),b=new T.Vector3(),n=new T.Vector3();
 /** One triangle; the normal is flipped to face away from `inside`. */
 const tri=(p:V,q:V,r:V,color:string,inside:V,tag:readonly number[])=>{
  a.set(q[0]-p[0],q[1]-p[1],q[2]-p[2]);b.set(r[0]-p[0],r[1]-p[1],r[2]-p[2]);n.crossVectors(a,b).normalize();
  const flip=n.x*(p[0]-inside[0])+n.y*(p[1]-inside[1])+n.z*(p[2]-inside[2])<0;if(flip)n.negate();
  c.set(color);for(const v of flip?[p,r,q]:[p,q,r]){pos.push(v[0],v[1],v[2]);nor.push(n.x,n.y,n.z);col.push(c.r,c.g,c.b);part.push(tag[0],tag[1],tag[2],tag[3]);}
 };
 const NONE=[0,0,0,0] as const;
 const quad=(p:V,q:V,r:V,s:V,color:string,inside:V,tag:readonly number[]=NONE)=>{tri(p,q,r,color,inside,tag);tri(p,r,s,color,inside,tag);};
 /** A box that may taper: a w0 x d0 rectangle at height y, a w1 x d1 rectangle h above it (shifted `shift` along z). `faces` picks
  *  from t(op) u(nder) f(ront, +z) b(ack) l(eft, +x) r(ight); the underside is left out unless asked for. */
 const hull=(x:number,y:number,z:number,w0:number,d0:number,h:number,color:string,o:{w1?:number;d1?:number;shift?:number;faces?:string;top?:string}={})=>{
  const w1=o.w1??w0,d1=o.d1??d0,s=o.shift??0,faces=o.faces??'tfblr',inside:V=[x,y+h/2,z+s/2];
  const A:V=[x-w0/2,y,z-d0/2],B:V=[x+w0/2,y,z-d0/2],C:V=[x+w0/2,y,z+d0/2],D:V=[x-w0/2,y,z+d0/2];
  const E:V=[x-w1/2,y+h,z+s-d1/2],F:V=[x+w1/2,y+h,z+s-d1/2],G:V=[x+w1/2,y+h,z+s+d1/2],H:V=[x-w1/2,y+h,z+s+d1/2];
  if(faces.includes('t'))quad(E,F,G,H,o.top??color,inside);if(faces.includes('u'))quad(A,B,C,D,color,inside);
  if(faces.includes('f'))quad(D,C,G,H,color,inside);if(faces.includes('b'))quad(A,B,F,E,color,inside);
  if(faces.includes('l'))quad(B,C,G,F,color,inside);if(faces.includes('r'))quad(A,D,H,E,color,inside);
 };
 /** A flat panel facing along z (dir ±1) at depth z: lamps, grilles, plates, windows. */
 const panelZ=(x:number,y:number,z:number,w:number,h:number,dir:number,color:string,kind=0)=>quad([x-w/2,y-h/2,z],[x+w/2,y-h/2,z],[x+w/2,y+h/2,z],[x-w/2,y+h/2,z],color,[x,y,z-dir],[0,0,0,kind]);
 /** A flat panel facing along x (dir ±1): side windows, stripes. z0/z1 at the bottom edge, top edge shifted by `lean`. */
 const panelX=(x:number,y:number,z:number,d:number,h:number,dir:number,color:string,lean=0,inset=0)=>quad([x,y-h/2,z-d/2],[x,y-h/2,z+d/2],[x-dir*inset,y+h/2,z+d/2+lean],[x-dir*inset,y+h/2,z-d/2+lean],color,[x-dir,y,z]);
 /** An eight-sided wheel on the x axis: tread, outer cap and a hub bar that makes the spin readable. No inner cap (never seen). */
 const wheel=(x:number,y:number,z:number,front:boolean,r=WHEEL_RADIUS,width=.22)=>{
  const side=Math.sign(x),xo=x+side*width/2,xi=x-side*width/2,tag=[x,y,z,front?PART.frontWheel:PART.rearWheel],N=8,inside:V=[xi,y,z];
  const ring=(k:number,px:number):V=>{const t=k/N*Math.PI*2+Math.PI/N;return [px,y+Math.cos(t)*r,z+Math.sin(t)*r];};
  for(let k=0;k<N;k++)quad(ring(k,xi),ring(k+1,xi),ring(k+1,xo),ring(k,xo),TYRE,[x,y,z],tag);
  for(let k=1;k<N-1;k++)tri(ring(0,xo),ring(k,xo),ring(k+1,xo),TYRE,inside,tag);
  const xh=xo+side*.012,u=r*.66,v=r*.2;quad([xh,y-u,z-v],[xh,y-u,z+v],[xh,y+u,z+v],[xh,y+u,z-v],HUB,inside,tag);
 };
 const done=()=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setAttribute('aPart',new T.Float32BufferAttribute(part,4));g.computeBoundingSphere();g.computeBoundingBox();return g;};
 return {hull,quad,panelZ,panelX,wheel,done};
}
type B=ReturnType<typeof builder>;
/** Bumpers, grille, plates, lamps and mirrors shared by every style. `nose`/`tail`: z of the front and rear faces; `y`: lamp height. */
function fittings(b:B,o:{w:number;nose:number;tail:number;y:number;mirrorY:number;mirrorZ:number;mirrorX:number;bumper?:string}){
 const {w,nose,tail,y}=o,bumper=o.bumper??TRIM;
 b.hull(0,.3,nose+.03,w+.04,.14,.17,bumper,{faces:'tflr'});b.hull(0,.3,tail-.03,w+.04,.14,.17,bumper,{faces:'tblr'});
 b.panelZ(0,y-.02,nose+.012,w*.42,.2,1,TRIM);b.panelZ(0,y-.2,nose+.105,.44,.11,1,CREAM);b.panelZ(0,y-.2,tail-.105,.44,.11,-1,CREAM);
 for(const side of [-1,1]){const lamp=w/2-.2,blink=side>0?PART.left:PART.right;
  b.panelZ(side*lamp,y,nose+.012,.26,.16,1,HEAD,PART.head);b.panelZ(side*(lamp+.01),y-.17,nose+.012,.22,.07,1,AMBER,blink);
  b.panelZ(side*lamp,y,tail-.012,.26,.14,-1,TAIL,PART.brake);b.panelZ(side*(lamp+.01),y-.15,tail-.012,.22,.07,-1,AMBER,blink);
  b.hull(side*o.mirrorX,o.mirrorY,o.mirrorZ,.16,.09,.12,TRIM,{faces:side>0?'tfbl':'tfbr'});}
}
function wheels(b:B,track:number,z:number){for(const side of [-1,1]){b.wheel(side*track,.31,z,true);b.wheel(side*track,.31,-z,false);}}
/** A car: lower body, a tapered glass cabin with a painted roof, and whatever makes the style its own. */
function car(style:Exclude<VehicleStyle,'pickup'>,paint:string){
 const b=builder();
 if(style==='van'){
  // Tall box van: short bonnet, high roof, a roof rack with two crates.
  b.hull(0,.3,0,1.74,3.4,.62,paint,{w1:1.7,d1:3.34});b.hull(0,.92,-.28,1.7,2.78,.78,paint,{w1:1.56,d1:2.5,shift:-.08});
  b.quad([-.72,1.1,1.073],[.72,1.1,1.073],[.68,1.62,.927],[-.68,1.62,.927],GLASS,[0,1.3,0]);
  for(const side of [-1,1]){b.panelX(side*.845,1.33,.52,.7,.44,side,GLASS,-.03,.035);b.panelX(side*.845,1.33,-.75,1.3,.44,side,GLASS,0,.035);}
  for(const z of [-.95,.05])b.hull(0,1.7,z-.3,1.3,.06,.1,TRIM,{faces:'tfb'});b.hull(.2,1.8,-.95,.7,.6,.3,'#b98a5a');b.hull(-.3,1.8,-.15,.55,.5,.22,'#7f9c8b');
  fittings(b,{w:1.74,nose:1.7,tail:-1.7,y:.72,mirrorY:1.12,mirrorZ:1,mirrorX:.93});wheels(b,.83,1.05);return b.done();}
 if(style==='jeep'){
  // Boxy open-country car: upright cabin, flat bonnet, roof rails, a spare wheel cover on the back.
  b.hull(0,.36,0,1.74,3.3,.56,paint,{w1:1.7,d1:3.26});b.hull(0,.92,-.42,1.64,2.1,.62,GLASS,{w1:1.56,d1:1.9,faces:'tfblr',top:paint});
  for(const side of [-1,1]){b.hull(side*.66,1.54,-.42,.07,1.7,.07,TRIM,{faces:'tfb'+(side>0?'l':'r')});b.panelX(side*.83,1.23,-.42,.12,.62,side,paint,0,.04);}
  b.hull(0,.62,-1.72,.62,.16,.62,TYRE,{faces:'tblr'});b.hull(0,.92,1.08,1.2,.5,.05,TRIM,{faces:'t'});
  fittings(b,{w:1.74,nose:1.65,tail:-1.65,y:.76,mirrorY:1.02,mirrorZ:.62,mirrorX:.93,bumper:CHROME});wheels(b,.83,1.05);return b.done();}
 // Sedan, taxi, hatchback, wagon: one lower body, cabins of different lengths.
 const long=style==='wagon',short=style==='hatch',len=short?3.2:3.4,half=len/2;
 b.hull(0,.3,0,1.7,len,.54,paint,{w1:1.62,d1:len-.1});
 const cz=long?-.38:short?-.3:-.12,d0=long?2.3:short?1.95:2,d1=long?1.85:short?1.4:1.1,shift=long?-.1:short?-.18:-.06;
 b.hull(0,.84,cz,1.52,d0,.5,GLASS,{w1:1.3,d1,shift,top:paint});
 for(const side of [-1,1])b.panelX(side*.772,1.09,cz+shift*.5+(long?.2:0),.11,.5,side,paint,0,.11);// the door pillar
 if(long){// Estate with a roof rack and a surfboard: this is an island.
  for(const z of [-.95,-.05])b.hull(0,1.34,cz+shift+.5+z,1.2,.06,.07,TRIM,{faces:'tfb'});b.hull(.12,1.41,cz+shift,.46,1.9,.07,'#f2efe2',{w1:.4,d1:1.7,top:'#8fd0c4'});}
 if(style==='taxi'){b.hull(0,1.34,cz+shift,.5,.2,.16,'#fff6d8',{w1:.42,d1:.16});for(const side of [-1,1])b.panelX(side*.842,.6,0,1.5,.1,side,TRIM,0,.008);}
 if(style==='sedan')b.hull(0,.84,-half+.14,1.5,.12,.09,paint,{faces:'tfblr'});// boot lip spoiler
 if(short)for(const side of [-1,1])b.panelX(side*.846,.5,0,2.1,.08,side,CREAM,0,.004);// side stripe
 fittings(b,{w:1.7,nose:half,tail:-half,y:.66,mirrorY:.9,mirrorZ:cz+d0/2-.28,mirrorX:.9});wheels(b,.83,short?1:1.05);return b.done();
}
/** The collectible pickup: same bed (floor, walls, landing ring, rider seat) as before, a real cab and trim. `bedY` is the bed-floor
 *  box centre (lower for bean riders, who also get the cooler seat); `variant` 0 has a roof light bar, 1 a bull bar. */
function pickup(paint:string,bedY:number,coolerSeat:boolean,variant:number){
 const b=builder(),floor=bedY+.06;
 // POLISH 3 (owner shot 61, bed z-fighting): the lower body's top (y .86) was the bean bed floor's height exactly (bedY .8 + .06), so
 // the two fought across the bed. The body's top is now only drawn ahead of the bed (under the cab and bonnet); the bed floor, walls,
 // tailgate and cab back close the box above it. The landing ring stands 2 cm over the floor (was 1.2 cm: it shimmered far off).
 b.hull(0,.38,0,2,4.4,.48,paint,{w1:1.96,d1:4.36,faces:'fblr'});b.quad([-.98,.86,.17],[.98,.86,.17],[.98,.86,2.18],[-.98,.86,2.18],paint,[0,0,1.2]);
 b.quad([-.95,floor,-2.05],[.95,floor,-2.05],[.95,floor,.17],[-.95,floor,.17],CREAM,[0,0,-.95]);
 for(const side of [-1,1])b.hull(side*.94,.84,-.95,.14,2.4,.54,paint,{faces:'tfblr'});
 b.hull(0,.84,-2.12,2,.14,.54,paint,{faces:'tfb'});
 // Landing ring on the bed floor (it was a 200-triangle torus): a flat twelve-sided band.
 for(let k=0;k<12;k++){const t0=k/12*Math.PI*2,t1=(k+1)/12*Math.PI*2,y=floor+.02,p=(t:number,r:number):V=>[Math.cos(t)*r,y,-.95+Math.sin(t)*r];b.quad(p(t0,.43),p(t1,.43),p(t1,.53),p(t0,.53),paint,[0,0,-.95]);}
 if(coolerSeat){b.hull(0,.86,-1.25,.7,.46,.43,'#5f8f9c',{faces:'fblr'});b.hull(0,1.27,-1.25,.72,.48,.04,CREAM);}
 // Cab: painted doors, tapered glass, a roof with a small overhang.
 b.hull(0,.86,.8,1.9,1.3,.36,paint);b.hull(0,1.22,.8,1.82,1.3,.46,GLASS,{w1:1.66,d1:1.05,shift:-.04,faces:'fblr'});
 b.hull(0,1.68,.76,1.78,1.22,.09,paint);
 for(const side of [-1,1])b.panelX(side*.922,1.44,.74,.1,.46,side,paint,-.04,.08);
 if(variant===0){b.hull(0,1.77,.62,.9,.14,.1,TRIM);for(const side of [-1,1])b.panelZ(side*.26,1.82,.692,.28,.07,1,AMBER);}
 else{b.hull(0,.5,2.3,1.5,.07,.5,CHROME,{faces:'tflr'});}
 fittings(b,{w:2,nose:2.2,tail:-2.2,y:.68,mirrorY:1.2,mirrorZ:1.2,mirrorX:1.04,bumper:variant?CHROME:TRIM});wheels(b,.83,1.05);
 // The front wheels sit under the bonnet, the rear under the bed: same axles as the old pickup (truckRampPose samples ±1.05).
 return b.done();
}
export function buildVehicleGeometry(style:VehicleStyle,paint:string,options:{bedY?:number;coolerSeat?:boolean;variant?:number}={}){
 return style==='pickup'?pickup(paint,options.bedY??.92,options.coolerSeat??false,options.variant??0):car(style,paint);
}
/** One material per vehicle (its own wheel and lamp uniforms), one shader program for all of them.
 *  `wheel` = (cos spin, sin spin, body pitch, steer); `lamp` = (head, brake/tail, indicator: + left / - right, body roll).
 *  The body pitches and rolls on its suspension (the group's rotation); the wheel vertices take those two small angles back out
 *  (y += z*pitch - x*roll about the wheel centre), so the tyres stay on the road. Pass 0, 0 when the tilt is the ground's (a ramp). */
export function createVehicleMaterial(){
 const wheel=new T.Vector4(1,0,0,0),lamp=new T.Vector4(0,0,0,0),sway=new T.Vector4(0,0,0,0);
 const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.7});
 // the strap pendulum (only for a geometry that has straps: trainCarModel sets userData.straps): car 0's speed from its instance
 // position, a smoothed acceleration, a damped spring toward the swing that acceleration gives (braking: straps swing forward)
 let pt=-1,px=0,pz=0,ps=0,acc=0,th=0,om=0,dx=0,dz=1;
 material.onBeforeRender=(_r,_s,_c,geo,obj)=>{
  if(!geo.userData.straps||!(obj as T.InstancedMesh).isInstancedMesh)return;
  if(!motionOk()){sway.set(0,0,0,0);pt=-1;return;}
  const now=performance.now()/1000,dt=now-pt;if(dt<.004&&pt>=0)return;// a second pass in the same frame
  const e=(obj as T.InstancedMesh).instanceMatrix.array,x=e[12],z=e[14];
  if(pt<0||dt>.3||Math.hypot(x-px,z-pz)>8){pt=now;px=x;pz=z;ps=acc=th=om=0;sway.set(0,0,0,1);return;}
  const mx=x-px,mz=z-pz,d=Math.hypot(mx,mz),sp=d/dt;if(d>1e-4){dx=mx/d;dz=mz/d;}
  acc+=((sp-ps)/dt-acc)*(1-Math.exp(-5*dt));ps=sp;pt=now;px=x;pz=z;
  const want=Math.max(-STRAP_MAX,Math.min(STRAP_MAX,-acc*STRAP_GAIN/9.8));
  om+=(-STRAP_W*STRAP_W*(th-want)-STRAP_DAMP*om)*dt;th=Math.max(-.18,Math.min(.18,th+om*dt));sway.set(dx*th,0,dz*th,1);};
 material.onBeforeCompile=shader=>{
  shader.uniforms.uWheel={value:wheel};shader.uniforms.uLamp={value:lamp};shader.uniforms.uSway={value:sway};
  shader.vertexShader='attribute vec4 aPart;\nuniform vec4 uWheel;\nuniform vec4 uLamp;\nuniform vec4 uSway;\nvarying float vGlow;\n'+shader.vertexShader
   .replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
float fiW=aPart.w;
bool fiWheel=fiW>.5&&fiW<2.5;bool fiSteer=fiW>1.5&&fiW<2.5;
if(fiWheel){objectNormal.yz=vec2(objectNormal.y*uWheel.x-objectNormal.z*uWheel.y,objectNormal.y*uWheel.y+objectNormal.z*uWheel.x);
 if(fiSteer)objectNormal.xz=vec2(objectNormal.x+objectNormal.z*uWheel.w,objectNormal.z-objectNormal.x*uWheel.w);}`)
   .replace('#include <begin_vertex>',`#include <begin_vertex>
if(fiWheel){vec3 fiQ=transformed-aPart.xyz;fiQ.yz=vec2(fiQ.y*uWheel.x-fiQ.z*uWheel.y,fiQ.y*uWheel.y+fiQ.z*uWheel.x);
 if(fiSteer){float fiC=1.-.5*uWheel.w*uWheel.w;fiQ.xz=vec2(fiQ.x*fiC+fiQ.z*uWheel.w,fiQ.z*fiC-fiQ.x*uWheel.w);}
 transformed=aPart.xyz+fiQ;transformed.y+=aPart.z*uWheel.z-aPart.x*uLamp.w;}
#ifdef USE_INSTANCING
if(fiW>6.5&&uSway.w>.5){vec3 fiQ=transformed-aPart.xyz;float fiR=${STRAP_ROLL.toFixed(2)}*instanceMatrix[0].y,fiF=dot(instanceMatrix[2].xyz,uSway.xyz),fiCr=cos(fiR),fiSr=sin(fiR),fiCf=cos(fiF),fiSf=sin(fiF);
 fiQ.xy=vec2(fiQ.x*fiCr-fiQ.y*fiSr,fiQ.x*fiSr+fiQ.y*fiCr);fiQ.zy=vec2(fiQ.z*fiCf-fiQ.y*fiSf,fiQ.z*fiSf+fiQ.y*fiCf);transformed=aPart.xyz+fiQ;}
#endif
vGlow=fiW<2.5?0.:fiW<3.5?uLamp.x:fiW<4.5?uLamp.y:fiW<5.5||fiW>6.5?max(uLamp.z,0.):max(-uLamp.z,0.);`);
  shader.fragmentShader='varying float vGlow;\n'+shader.fragmentShader.replace('vec3 totalEmissiveRadiance = emissive;','vec3 totalEmissiveRadiance = vColor.rgb * vGlow;');
 };
 material.customProgramCacheKey=()=>'street-vehicle-v6';
 return {material,wheel,lamp};
}
export const triangleCount=(g:T.BufferGeometry)=>g.getAttribute('position').count/3;
