import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {SHORE_GLSL,WATER_UNIFORMS} from '../../graphics/waterSurface';
import {distanceToLandableDeck} from '../landableDecks';

/**
 * Clear water for the fishing view (Oct 12 2026, "make the water more see-through where we can see coral and the fish and not just
 * shadows"). No refraction target, no extra pass:
 * - The shore strip (shoreWater.ts) is the see-through layer: for each water pixel it follows the view ray down to a sloping seabed
 *   (depth from the shore field, `uwDepthAt`), shades sand, ripples and caustics there and tints it by the water it crossed. Clear at
 *   the waterline, turquoise over the first metres, teal further out, then it fades into the island ocean.
 * - While fishing, the island ocean stops writing depth and draws after the other opaque meshes (`createOceanClear`), so everything
 *   under the surface (seabed props, fish, crabs, the catch) draws after the strip and shows through. Each of those shaders tints
 *   itself by its own depth with the same functions (`UNDERWATER_GLSL`), so coral, fish and sand agree.
 * - The seabed props (`buildSeabedProps`) are ONE merged, vertex-coloured mesh per spot: coral, sea grass and kelp (sway in the
 *   vertex shader, desktop only), starfish, shells, pebbles, rocks, urchins, and old pier piles with barnacles at the piers.
 * Detail follows the shared water uniform: 2 desktop (sway, two-read caustics), 1 phone (one-read caustics, no sway), 0 the governor's
 * slow / still path (no sway, no caustics). Reduced motion holds the water clock, so everything is still.
 */
export const UW_SURFACE=-.42;
/** Seabed depth (m below the surface) at signed shore distance d (m). Shared with the GLSL below. */
export const uwDepthAt=(d:number)=>.05+3.2*(1-Math.exp(-Math.max(d,0)/3.4));
/** Shared noise texture (shoreWater.createWaterNoise), set when the fishing water builds it. */
export const UW_UNIFORMS={uWaterNoise:{value:null as T.Texture|null}};

export const UNDERWATER_GLSL=/* glsl */`
uniform sampler2D uWaterNoise;
const float UW_Y=${UW_SURFACE.toFixed(3)};
// The water's own glow (like the island ocean's blue emissive): keeps it blue under the orange sunset light.
const float UW_GLOW=.45;
float uwDepthAt(float d){return .05+3.2*(1.-exp(-max(d,0.)/3.4));}
// Water colour by depth: clear turquoise in the shallows, teal deeper (linear).
vec3 uwTint(float h){return mix(vec3(.0,.42,.62),vec3(.004,.16,.32),smoothstep(1.,3.1,h));}
// What survives the water on the way to the eye (per channel: red goes first, so things turn aqua but keep their contrast);
// the rest is the water's own colour: col·T + tint·(1 − T). L = path length under water, h = depth.
vec3 uwTrans(float h,float L){return exp(-L*vec3(.36,.16,.07)-h*vec3(.36,.12,.05));}
// Moving caustics: a network of light lines from the noise texture's cell edges, wobbled by its soft channel (desktop: 2 reads,
// phone: 1, still/slow: none). Scroll rates are multiples of 1/500 per second, so the water clock's wrap never jumps.
float uwCaustic(vec2 xz){
 if(uWaterDetail<.5)return 0.;float t=uWaterTime;vec2 uv=xz*.5;
 float c=texture2D(uWaterNoise,uv+vec2(t*.012,t*.006)).r;
 // Desktop: a second network drifting the other way; where the two cross the light gathers and shimmers.
 if(uWaterDetail>1.5){float c2=texture2D(uWaterNoise,uv*.83+vec2(.37-t*.008,.11+t*.01)).r;c=c*.62+c2*.62+c*c2*.5;}
 return smoothstep(.3,.95,c);
}
`;
/** Up-facing irradiance from the scene lights, so the water colour follows the time of day exactly like the lit strip. */
const UW_LIGHT=/* glsl */`
 vec3 uwUp=normalize((viewMatrix*vec4(0.,1.,0.,0.)).xyz);vec3 uwIrr=ambientLightColor;
 #if NUM_HEMI_LIGHTS>0
 uwIrr+=getHemisphereLightIrradiance(hemisphereLights[0],uwUp);
 #endif
 #if NUM_DIR_LIGHTS>0
 uwIrr+=directionalLights[0].color*max(dot(uwUp,directionalLights[0].direction),0.);
 #endif
`;
/**
 * Patch a lit (Lambert / Standard) material that sits under the water: world position varying, caustics on up-facing surfaces and
 * the depth tint applied to the final light. `extraVertex` / `extraFragment` add the caller's own declarations.
 */
export function patchUnderwater(sh:T.WebGLProgramParametersWithUniforms,extra:{uniforms?:Record<string,T.IUniform>;vertexHead?:string;vertexBody?:string;fragmentHead?:string;colorBody?:string;beforeTint?:string}={}){
 Object.assign(sh.uniforms,WATER_UNIFORMS,UW_UNIFORMS,extra.uniforms??{});
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vUwPos;uniform float uWaterTime,uWaterDetail;\n'+(extra.vertexHead??''))
  .replace('#include <begin_vertex>','#include <begin_vertex>\n'+(extra.vertexBody??''))
  .replace('#include <project_vertex>','#include <project_vertex>\n{vec4 uwp=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nuwp=instanceMatrix*uwp;\n#endif\nvUwPos=(modelMatrix*uwp).xyz;}');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vUwPos;\n'+SHORE_GLSL+UNDERWATER_GLSL+(extra.fragmentHead??''))
  .replace('#include <color_fragment>','#include <color_fragment>\n'+(extra.colorBody??''))
  .replace('#include <opaque_fragment>',/* glsl */`{
   float uwH=max(0.,UW_Y-vUwPos.y);vec3 uwV=normalize(vUwPos-cameraPosition);float uwL=uwH/max(.12,-uwV.y);
   ${UW_LIGHT}
   float uwC=uwCaustic(vUwPos.xz)*max(dot(normal,uwUp),0.)*smoothstep(3.2,.2,uwH);
   outgoingLight+=reflectedLight.directDiffuse*uwC*1.1+uwIrr*RECIPROCAL_PI*diffuseColor.rgb*uwC*.25;
   ${extra.beforeTint??''}
   // Lighter than the sand's (×0.45): coral, fish and crabs keep their colours and stand out from the seabed (stylised, for reading).
   vec3 uwT=uwTrans(uwH*.45,uwL*.45);outgoingLight=outgoingLight*uwT+uwTint(uwH)*(uwIrr*RECIPROCAL_PI*.85+UW_GLOW)*(1.-uwT);
  }
  #include <opaque_fragment>`);
}
/** The light snippet for the strip shader (it needs the same lit water colour). */
export const UW_LIGHT_GLSL=UW_LIGHT;

/**
 * While fishing, the island ocean (world.ts 'surrounding-ocean', owned elsewhere) must not hide what is under the surface: it stops
 * writing depth and draws after the other opaque meshes (so opaque island geometry below the waterline stays covered). Two render
 * state flags, no shader change, no recompile; restored exactly when the fishing water has faded out.
 */
export function createOceanClear(scene:T.Scene){
 let ocean:T.Mesh|null=null,saved:{depthWrite:boolean;renderOrder:number}|null=null;
 return {
  set(on:boolean){
   if(on===!!saved)return;
   ocean??=(scene.getObjectByName('surrounding-ocean') as T.Mesh|undefined)??null;const m=ocean?.material as T.Material|undefined;if(!ocean||!m||Array.isArray(m))return;
   if(on){saved={depthWrite:m.depthWrite,renderOrder:ocean.renderOrder};m.depthWrite=false;ocean.renderOrder=Math.max(ocean.renderOrder,.25);}
   else if(saved){m.depthWrite=saved.depthWrite;ocean.renderOrder=saved.renderOrder;saved=null;}
  },
 };
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Seabed props
export type SeabedStyle='cay'|'causeway'|'beach'|'pier';
export const PIER_SPOTS=new Set(['east-pier','south-pier','west-pier','harbour-wall']);
export function seabedStyle(spot:{id:string;area?:string}):SeabedStyle{return spot.area==='cay'?'cay':spot.area==='causeway'?'causeway':PIER_SPOTS.has(spot.id)?'pier':'beach';}
type Field={box:T.Vector4;n:number;size:number;lift:Float32Array;distance(x:number,z:number):number};
const C=(hex:string)=>new T.Color(hex);
/** One prop piece: local geometry (y up from its base), colour from base to tip, sway weight by height (0 = rigid). */
function paint(g:T.BufferGeometry,base:T.Color,tip:T.Color,sway:number,twoSided=false){
 let geo=g.index?g.toNonIndexed():g;if(geo!==g)g.dispose();geo.deleteAttribute('uv');geo.deleteAttribute('normal');
 // Thin pieces (blades, ribbons, fans) get both windings, so the mesh can cull back faces (closed shapes never shade their hidden side).
 if(twoSided){const a=geo.getAttribute('position').array as ArrayLike<number>,n=a.length,out=new Float32Array(n*2);out.set(a as Float32Array);
  for(let i=0;i<n;i+=9){out[n+i]=a[i];out[n+i+1]=a[i+1];out[n+i+2]=a[i+2];out[n+i+3]=a[i+6];out[n+i+4]=a[i+7];out[n+i+5]=a[i+8];out[n+i+6]=a[i+3];out[n+i+7]=a[i+4];out[n+i+8]=a[i+5];}
  const d=new T.BufferGeometry();d.setAttribute('position',new T.BufferAttribute(out,3));geo.dispose();geo=d;}
 geo.computeBoundingBox();const bb=geo.boundingBox!,h=Math.max(.001,bb.max.y-bb.min.y),p=geo.getAttribute('position'),n=p.count;
 const col=new Float32Array(n*3),sw=new Float32Array(n),c=new T.Color();
 for(let i=0;i<n;i++){const k=T.MathUtils.clamp((p.getY(i)-bb.min.y)/h,0,1);c.copy(base).lerp(tip,k);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;sw[i]=sway*k;}
 geo.setAttribute('color',new T.BufferAttribute(col,3));geo.setAttribute('aSway',new T.BufferAttribute(sw,1));
 if(!geo.getAttribute('normal'))geo.computeVertexNormals();return geo;
}
const M4=new T.Matrix4(),Q=new T.Quaternion(),E=new T.Euler(),V=new T.Vector3(),S=new T.Vector3();
const put=(g:T.BufferGeometry,x:number,y:number,z:number,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>g.applyMatrix4(M4.compose(V.set(x,y,z),Q.setFromEuler(E.set(rx,ry,rz)),S.set(sx,sy,sz)));

const PALETTE={
 coral:['#e0559b','#b05ad6','#ff8a5c','#ffcf3f','#f26b8a','#8f6bf0','#ff9f2e','#e84f6a'].map(C),
 coralTip:['#ffd0ea','#e8c8ff','#ffe2c4','#fff4b0','#ffd6df','#d8ccff','#ffe0a8','#ffc4cc'].map(C),
 rock:['#8d8a80','#9c9282','#7f7e78','#a4998a'].map(C),algae:C('#8a9a5a'),
 grass:C('#2f7a3a'),grassTip:C('#8fd06a'),kelp:C('#6a5a1e'),kelpTip:C('#c8b44a'),
 star:['#ff7a2e','#e2453a','#9a4fd0','#3f7fe0','#ffb02e'].map(C),
 shell:['#fff1dc','#ffd2c8','#f4e3b5','#ffe9f0'].map(C),urchin:C('#3b2350'),urchinTip:C('#7b4fa0'),
 wood:C('#4a3a2a'),woodTip:C('#6a5a40'),barnacle:C('#e9e4d6'),mussel:C('#1f2533'),
};
type Rng=()=>number;
function rock(r:Rng,s:number,algae:boolean){const i=Math.floor(r()*4);return paint(put(new T.IcosahedronGeometry(s,0),0,s*.18,0,(r()-.5)*.4,r()*6,(r()-.5)*.4,1,.55,1+r()*.3),PALETTE.rock[i],algae?PALETTE.rock[i].clone().lerp(PALETTE.algae,.55):PALETTE.rock[i].clone().multiplyScalar(1.15),0);}
function pebbles(r:Rng,parts:T.BufferGeometry[],x:number,y:number,z:number,count:number){for(let i=0;i<count;i++){const s=.04+r()*.06;parts.push(put(paint(new T.IcosahedronGeometry(s,0),PALETTE.rock[Math.floor(r()*4)].clone().multiplyScalar(.9+r()*.4),PALETTE.shell[0],0),x+(r()-.5)*.6,y+s*.3,z+(r()-.5)*.6,(r()-.5)*.5,r()*3,0,1,.7,1));}}
const tipOf=(ci:number,k=.4)=>PALETTE.coral[ci].clone().lerp(PALETTE.coralTip[ci],k);
function brain(r:Rng,s:number,ci:number){return paint(put(new T.IcosahedronGeometry(s,1),0,s*.2,0,0,r()*6,0,1,.68,1),PALETTE.coral[ci].clone().multiplyScalar(.8),tipOf(ci,.3),0);}
function branch(r:Rng,h:number,ci:number){
 const parts:T.BufferGeometry[]=[],n=4+Math.floor(r()*4);
 for(let i=0;i<n;i++){const len=h*(.6+r()*.5),a=r()*Math.PI*2,tilt=.15+r()*.55,g=new T.CylinderGeometry(.018,.045,len,4,1).translate(0,len/2,0);g.rotateZ(tilt);g.rotateY(a);parts.push(g);
  if(r()<.6){const l2=len*.45,g2=new T.CylinderGeometry(.012,.025,l2,4,1).translate(0,l2/2,0);g2.rotateZ(tilt+.6);g2.rotateY(a+.4);g2.translate(Math.sin(tilt)*Math.cos(a)*len*.55,Math.cos(tilt)*len*.55,-Math.sin(tilt)*Math.sin(a)*len*.55);parts.push(g2);}}
 const g=mergeGeometries(parts.map(p=>p.toNonIndexed()))!;parts.forEach(p=>p.dispose());return paint(g,PALETTE.coral[ci].clone().multiplyScalar(.75),tipOf(ci,.55),0);
}
function fan(r:Rng,h:number,ci:number){const g=new T.CircleGeometry(h,7,0,Math.PI);g.rotateY(r()*Math.PI);return paint(g,PALETTE.coral[ci].clone().multiplyScalar(.8),tipOf(ci,.35),.5,true);}
function table(r:Rng,s:number,ci:number){const top=new T.CylinderGeometry(s,s*.85,.06,7).translate(0,s*.55,0),stem=new T.CylinderGeometry(.04,.07,s*.55,5).translate(0,s*.275,0);const g=mergeGeometries([top.toNonIndexed(),stem.toNonIndexed()])!;top.dispose();stem.dispose();g.rotateY(r()*6);return paint(g,PALETTE.coral[ci].clone().multiplyScalar(.75),tipOf(ci,.3),0);}
function anemone(r:Rng,s:number,ci:number){const parts:T.BufferGeometry[]=[];const n=7;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,g=new T.ConeGeometry(.022,s,3).translate(0,s/2,0);g.rotateZ(.35+r()*.3);g.rotateY(a);parts.push(g.toNonIndexed());g.dispose();}
 parts.push(new T.CylinderGeometry(.06,.07,.06,6).translate(0,.03,0).toNonIndexed());const g=mergeGeometries(parts)!;parts.forEach(p=>p.dispose());return paint(g,PALETTE.coral[ci].clone().multiplyScalar(.8),tipOf(ci,.5),.6);}
function grass(r:Rng,h:number){const pos:number[]=[],n=5+Math.floor(r()*5);
 for(let i=0;i<n;i++){const a=r()*Math.PI*2,x=Math.cos(a)*.08*r(),z=Math.sin(a)*.08*r(),hh=h*(.6+r()*.5),lean=(r()-.5)*.25,w=.025+r()*.015,ca=Math.cos(a+1.57),sa=Math.sin(a+1.57);
  pos.push(x-ca*w,0,z-sa*w, x+ca*w,0,z+sa*w, x+lean,hh,z+lean*.5);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));return paint(g,PALETTE.grass,PALETTE.grassTip,1,true);}
function kelp(r:Rng,h:number){const pos:number[]=[],strands=3+Math.floor(r()*3);
 // Narrow wavy ribbons, each turning a little as it rises, with a small leaf every other segment.
 for(let s=0;s<strands;s++){const a=r()*Math.PI*2,ox=Math.cos(a)*.14*r(),oz=Math.sin(a)*.14*r(),w=.028+r()*.018,seg=6,hh=h*(.65+r()*.35);let yaw=r()*Math.PI;
  for(let i=0;i<seg;i++){const y0=hh*i/seg,y1=hh*(i+1)/seg,b0=Math.sin(i*1.1+a)*.07,b1=Math.sin((i+1)*1.1+a)*.07,y2=yaw+.35;const c0=Math.cos(yaw)*w,s0=Math.sin(yaw)*w,c1=Math.cos(y2)*w,s1=Math.sin(y2)*w;
   pos.push(ox-c0+b0,y0,oz-s0, ox+c0+b0,y0,oz+s0, ox+c1+b1,y1,oz+s1, ox-c0+b0,y0,oz-s0, ox+c1+b1,y1,oz+s1, ox-c1+b1,y1,oz-s1);
   if(i%2===1){const lx=ox+b1,ly=y1,lz=oz,dir=i%4===1?1:-1;pos.push(lx,ly,lz, lx+dir*Math.cos(yaw)*.14,ly+.05,lz+dir*Math.sin(yaw)*.14, lx,ly+.1,lz);}
   yaw=y2;}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));return paint(g,PALETTE.kelp,PALETTE.kelpTip,1,true);}
let starShape:T.Shape|null=null;
function star(r:Rng,s:number){starShape??=new T.Shape(Array.from({length:10},(_,i)=>{const a=i/10*Math.PI*2,rr=i%2?.38:1;return new T.Vector2(Math.sin(a)*rr,Math.cos(a)*rr);}));
 const g=new T.ExtrudeGeometry(starShape,{depth:.25,bevelEnabled:false,steps:1});g.rotateX(-Math.PI/2);g.scale(s,s,s);g.rotateY(r()*6);const c=PALETTE.star[Math.floor(r()*PALETTE.star.length)];return paint(g,c.clone().multiplyScalar(.85),c.clone().lerp(C('#fff0d8'),.25),0);}
function shell(r:Rng){const c=PALETTE.shell[Math.floor(r()*4)];
 if(r()<.55){const s=.05+r()*.04,g=new T.SphereGeometry(s,6,3,0,Math.PI*2,0,Math.PI/2);g.scale(1,.4,.85);g.rotateY(r()*6);return paint(g,c.clone().multiplyScalar(.85),c,0);}
 const g=new T.ConeGeometry(.04,.13,6);g.rotateZ(Math.PI/2+.2);g.translate(0,.035,0);g.rotateY(r()*6);return paint(g,c,C('#ffb08a'),0);}
function urchin(r:Rng){const parts:T.BufferGeometry[]=[new T.IcosahedronGeometry(.07,0).toNonIndexed()];for(let i=0;i<10;i++){const g=new T.ConeGeometry(.012,.12,3).translate(0,.1,0);g.rotateX(r()*Math.PI);g.rotateY(r()*6);parts.push(g.toNonIndexed());g.dispose();}
 const g=mergeGeometries(parts)!;parts.forEach(p=>p.dispose());g.translate(0,.05,0);return paint(g,PALETTE.urchin,PALETTE.urchinTip,0);}
function pile(r:Rng,h:number){const parts:T.BufferGeometry[]=[paint(new T.CylinderGeometry(.15,.17,h,7).translate(0,h/2,0),PALETTE.wood,PALETTE.woodTip,0)];
 for(let i=0;i<14;i++){const a=r()*Math.PI*2,y=h*(.25+r()*.7),g=new T.ConeGeometry(.035,.045,5).rotateZ(-Math.PI/2).translate(.16,y,0);g.rotateY(a);parts.push(paint(g,PALETTE.barnacle.clone().multiplyScalar(.85),PALETTE.barnacle,0));}
 for(let i=0;i<9;i++){const a=r()*Math.PI*2,y=h*(.1+r()*.45),g=new T.IcosahedronGeometry(.04,0).scale(.7,1.5,.7).translate(.17,y,0);g.rotateY(a);parts.push(paint(g,PALETTE.mussel,PALETTE.mussel.clone().lerp(C('#3d4f7a'),.6),0));}
 return parts;}

export type SeabedProps={mesh:T.Mesh;triangles:number;dispose():void};
/**
 * Build the merged seabed for one spot: scatter round the angler's view of the water (seeded by spot, so it never changes), on the
 * same seabed the strip draws (uwDepthAt of the shore field), kept under the surface, and away from underwater island ground.
 */
export function buildSeabedProps(field:Field,style:SeabedStyle,stand:{x:number;z:number},dir:{x:number;z:number},phone:boolean,seed:number,halfWidth=9):SeabedProps{
 let s=Math.abs(Math.floor(seed))%2147483646+1;const r:Rng=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};
 const {box,n}=field,texel=field.size/n,parts:T.BufferGeometry[]=[],k=phone?.55:1,ux=dir.x,uz=dir.z;
 const liftAt=(x:number,z:number)=>{const i=Math.floor((x-box.x)/texel),j=Math.floor((z-box.y)/texel);return i<0||j<0||i>=n||j>=n?-.5:field.lift[j*n+i];};
 // Points in the water the fishing camera looks at: a along the cast (out from the angler), b across it.
 const aView=halfWidth<6?11:15;
 // The camera looks back at the angler from out over the water, so the view widens with distance out (a wedge, like the fish).
 const at=(dMin:number,dMax:number,aMax=aView,spread=1)=>{for(let t=0;t<40;t++){const a=-1+r()*(aMax+1),b=(r()*2-1)*halfWidth*spread*(.65+Math.max(0,a)/14),x=stand.x+ux*a+uz*b,z=stand.z+uz*a-ux*b,d=field.distance(x,z);
  if(d>=dMin&&d<=dMax&&liftAt(x,z)<-.45)return {x,z,d,depth:uwDepthAt(d),y:UW_SURFACE-uwDepthAt(d)};}return null;};
 const add=(g:T.BufferGeometry,p:{x:number;y:number;z:number},scale=1)=>{parts.push(put(g,p.x,p.y,p.z,0,0,0,scale,scale,scale));};
 /** Keep a piece of height h under the surface (10 cm clearance): shrink it in shallow water. */
 const fit=(h:number,depth:number)=>Math.min(1,Math.max(.25,(depth-.12)/h));
 const coralCluster=(rich:boolean,small=false)=>{const p=at(1.4,7.5);if(!p)return;const items=(rich?4:2)+Math.floor(r()*(rich?4:3));
  for(let i=0;i<items;i++){const q={x:p.x+(r()-.5)*1.3,z:p.z+(r()-.5)*1.3,y:0};const d=field.distance(q.x,q.z);if(d<1.3)continue;const depth=uwDepthAt(d);q.y=UW_SURFACE-depth;
   const ci=Math.floor(r()*PALETTE.coral.length),kind=r(),sz=(small?.6:1)*(.75+r()*.6);
   if(kind<.26){const h=.22*sz;add(brain(r,h,ci),q,fit(h*1.2,depth));}
   else if(kind<.56){const h=.48*sz;add(branch(r,h,ci),q,fit(h,depth));}
   else if(kind<.72){const h=.4*sz;add(fan(r,h,ci),q,fit(h,depth));}
   else if(kind<.8){const h=.24*sz;add(table(r,h,ci),q,fit(h*.7,depth));}
   else{const h=.2*sz;add(anemone(r,h,ci),q,fit(h,depth));}}
  if(rich&&r()<.6){const q=at(1.4,7.5);if(q)add(star(r,.09+r()*.05),q);}};
 const counts:Record<SeabedStyle,{coral:number;rich:boolean;grass:number;kelp:number;rocks:number;pebbles:number;stars:number;shells:number;urchins:number;piles:number}>={
  cay:{coral:18,rich:true,grass:5,kelp:0,rocks:8,pebbles:6,stars:10,shells:12,urchins:4,piles:0},
  causeway:{coral:7,rich:false,grass:12,kelp:3,rocks:9,pebbles:7,stars:9,shells:10,urchins:3,piles:0},
  beach:{coral:6,rich:false,grass:16,kelp:6,rocks:14,pebbles:10,stars:9,shells:12,urchins:3,piles:0},
  pier:{coral:5,rich:false,grass:7,kelp:6,rocks:12,pebbles:8,stars:9,shells:9,urchins:5,piles:9},
 };
 const c=counts[style],N=(v:number)=>Math.max(v?1:0,Math.round(v*k));
 for(let i=0;i<N(c.coral);i++)coralCluster(c.rich,!c.rich);
 for(let i=0;i<N(c.grass);i++){const p=at(.9,10);if(!p)continue;const tufts=2+Math.floor(r()*4);for(let j=0;j<tufts;j++){const q={x:p.x+(r()-.5)*1.2,z:p.z+(r()-.5)*1.2,y:0};const d=field.distance(q.x,q.z);if(d<.7)continue;const depth=uwDepthAt(d);q.y=UW_SURFACE-depth;const h=.25+r()*.3;add(grass(r,h),q,fit(h,depth));}}
 for(let i=0;i<N(c.kelp);i++){const p=at(3,10);if(!p)continue;const h=Math.min(1.5,p.depth-.35)*(.7+r()*.3);if(h>.4)add(kelp(r,h),p);}
 for(let i=0;i<N(c.rocks);i++){const p=at(.6,10);if(!p)continue;const sz=.14+r()*.26;add(rock(r,sz,r()<.35),p,fit(sz*.8,p.depth));if(style==='pier'&&r()<.7)for(let j=0;j<5;j++){const g=new T.ConeGeometry(.03,.04,5);g.translate((r()-.5)*sz,sz*.45,(r()-.5)*sz);parts.push(put(paint(g,PALETTE.barnacle.clone().multiplyScalar(.85),PALETTE.barnacle,0),p.x,p.y,p.z));}}
 for(let i=0;i<N(c.pebbles);i++){const p=at(.4,9);if(p)pebbles(r,parts,p.x,p.y,p.z,3+Math.floor(r()*4));}
 for(let i=0;i<N(c.stars);i++){const p=at(.6,9);if(p)add(star(r,.08+r()*.06),p);}
 for(let i=0;i<N(c.shells);i++){const p=at(.3,8);if(p)add(shell(r),p);}
 for(let i=0;i<N(c.urchins);i++){const p=at(1.2,8);if(p)add(urchin(r),p);}
 // Old piles off the pier edge: cut off under the surface, crusted with barnacles and mussels.
 if(c.piles){let made=0;for(let t=0;t<220&&made<N(c.piles);t++){const p=at(.5,4.5,aView+4,1.6);if(!p)continue;if(distanceToLandableDeck(p.x,p.z)>2.2)continue;const h=Math.min(p.depth-.25,.5+r()*.8);if(h<.3)continue;for(const g of pile(r,h))parts.push(put(g,p.x,p.y,p.z));made++;}}
 const geometry=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());geometry.computeBoundingSphere();
 const material=new T.MeshLambertMaterial({vertexColors:true,flatShading:true,transparent:true});
 material.onBeforeCompile=sh=>patchUnderwater(sh,{vertexHead:'attribute float aSway;',
  // Sea grass, kelp, fans and anemones sway (desktop only; phones and the slow/still path hold them).
  vertexBody:'if(uWaterDetail>1.5&&aSway>0.){float ph=position.x*.71+position.z*.53,w=aSway*aSway;transformed.x+=w*.11*sin(uWaterTime*1.256+ph);transformed.z+=w*.07*sin(uWaterTime*1.004+ph*1.7);}',
  fragmentHead:''});
 material.customProgramCacheKey=()=>'fishing-seabed-props-v1';
 const mesh=new T.Mesh(geometry,material);mesh.name='fishing-seabed';mesh.renderOrder=.55;mesh.matrixAutoUpdate=false;mesh.raycast=()=>{};
 return {mesh,triangles:geometry.getAttribute('position').count/3,dispose(){mesh.removeFromParent();geometry.dispose();material.dispose();}};
}
