// West Stadium night lights (Nov 13 2026, owner: "make the stadium look alive at night"). No real light anywhere: everything here
// is merged geometry lit by the shared night factor (STADIUM_NIGHT, stadiumNight.ts), off by day.
//  - Roof lamps: a row of lamps under the front edge of both roofs. They are part of the roof meshes (stadiumWorld.ts, 0 draws),
//    so they fade with the roof (createRoofFade); their lenses glow through patchLampGlow (aGlow vertices).
//  - Lamp hardware (ONE mesh, 1 draw): the island's street-lamp post (world.ts's shape and colours) round the plaza, the bowl's
//    apron and the park trails; uplight fixtures at the foot of the stands' outer walls; bollards at the foot of every back stair;
//    two gate uplights and lenses under the gate arch. Lens vertices glow on the night factor. Each post / fixture has a collider.
//    The posts' warm ground pools are the island's night pools (world.ts lampSites, one stadium pool batch: 1 draw at night).
//  - Glow (ONE additive mesh, 1 draw, night only, none on phones at heat tier 2+): soft beams from every other roof lamp down to the
//    pitch edge, a faint haze sheet under each roof, pools at the bollards and fixtures, and washes up the gate pillars and arch.
//    The roof beams and haze fade with their roof (one uniform the roof fade writes when the opacity changes).
//  - The light the lamps throw on the stadium itself (pools on the seats under the roofs, the beam hits at the pitch edge, the
//    scalloped uplight washes up the outer walls) is a term in the stadium paint's night patch (stadiumNight.ts): 0 draws.
// Nothing per frame: the night factor and the roof fade are uniform writes made only when they change.
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type {Obstacle} from './simulation';
import {STADIUM_GATE,STADIUM_PLAZA,BOWL_APRON,PARK_TRAILS,PARK_SIGNS,TRAIL_WIDTH,pathPoints,onParkPaving,inPond,POND_RIM,onGrass,inStadiumFootprint,type P} from './westParkLayout';
import {onIsland} from './shoreline';
import {STANDS,ROOF,STAIR_WIDTH,GATE_ARCH_X,standBack,stairEnd,standWorld,type StandDef} from './stadiumSeats';
import {STADIUM_NIGHT,STADIUM_NIGHT_LIGHTS,patchLampGlow,registerStadiumNightObject,refreshStadiumNightObjects} from './stadiumNight';
import {effectiveTier,subscribeHeatTier} from '../graphics/heatTier';

/** The roof lamps (stand-local): depth under the slab just behind the front frame, every STADIUM_NIGHT_LIGHTS.lampEvery m along
 *  ±lampSpan; a lamp box w (along) × h × depth hung from the slab's underside. */
export const ROOF_LAMP={d:ROOF.front+.75,w:1.3,h:.28,depth:.55,y:ROOF.y-ROOF.thick/2-.14} as const;
export function roofLampAlongs(){const L=STADIUM_NIGHT_LIGHTS,out:number[]=[];for(let a=-L.lampSpan;a<=L.lampSpan+1e-6;a+=L.lampEvery)out.push(a);return out;}
/** The island's street-lamp post (world.ts): base, pole, cap and lamp head; the head is the lens. */
export const LAMP_POST={baseR:.19,baseH:.22,poleR:.065,poleH:4.2,cap:.62,head:.43,headH:.32,collider:.38,ground:-.115,pool:9} as const;
/** Where the posts go: 2.4 m out on the plaza's verges (5 a side, 15 m apart: Nov 13 2026, the old x list put pairs 9 m and 11 m apart,
 *  so the 12 m spacing rule dropped 4 of the 10; these stand 2+ m from every flag, west of the apron edge x -131, beside not on
 *  the x -106 trail mouths, far from the PLAZA sign and outside the flower beds), 1.6 m out round the apron, beside the trails; spacing and clearances. */
export const STADIUM_LAMPS={plazaOut:2.4,plazaX:[-131,-116,-101,-86,-71],apronOut:1.6,apronEvery:24,trailEvery:26,trailStart:12,trailOut:TRAIL_WIDTH/2+1.4,
 spacing:12,pavingClear:.75,signClear:5,obstacleClear:.6,canopyClear:.5} as const;
/** The PLAZA district sign (westPark.ts) the posts keep clear of, like the park signs. */
const PLAZA_SIGN:P=[-58,STADIUM_PLAZA.maxZ+3.5];

export type StadiumLampCandidate={x:number;z:number;kind:'plaza'|'apron'|'trail'};
/** Candidate post positions (pure): the build drops the ones that meet paving, water, signs, props or trees. */
export function stadiumLampCandidates():StadiumLampCandidate[]{
 const out:StadiumLampCandidate[]=[],C=STADIUM_LAMPS,P_=STADIUM_PLAZA;
 for(const z of [P_.minZ-C.plazaOut,P_.maxZ+C.plazaOut])for(const x of C.plazaX)out.push({x,z,kind:'plaza'});
 // Round the apron's outer edge (a rounded rectangle), one every apronEvery m.
 {const {x:cx,z:cz,w,d,r}=BOWL_APRON,R=r+C.apronOut,a=w/2-r,b=d/2-r,pts:P[]=[];
  for(const [sx,sz,a0] of [[a,b,0],[-a,b,Math.PI/2],[-a,-b,Math.PI],[a,-b,Math.PI*1.5]] as const)for(let i=0;i<=16;i++){const t=a0+i/16*Math.PI/2;pts.push([cx+sx+Math.cos(t)*R,cz+sz+Math.sin(t)*R]);}
  pts.push(pts[0]);for(const p of sampleEvery(pts,C.apronEvery,C.apronEvery/2))out.push({x:p.x,z:p.z,kind:'apron'});}
 // Beside the trails, alternating sides.
 for(const t of PARK_TRAILS){let side=1;for(const p of sampleEvery(pathPoints(t.curve),C.trailEvery,C.trailStart)){out.push({x:p.x+p.nx*side*C.trailOut,z:p.z+p.nz*side*C.trailOut,kind:'trail'});side=-side;}}
 return out;
}
function sampleEvery(pts:readonly P[],every:number,start:number){
 const out:{x:number;z:number;nx:number;nz:number}[]=[];let s=0,next=start;
 for(let i=1;i<pts.length;i++){const [ax,az]=pts[i-1],[bx,bz]=pts[i],l=Math.hypot(bx-ax,bz-az);if(!l)continue;
  while(next<=s+l){const k=(next-s)/l;out.push({x:ax+(bx-ax)*k,z:az+(bz-az)*k,nx:-(bz-az)/l,nz:(bx-ax)/l});next+=every;}s+=l;}
 return out;
}
type Clearance={obstacles:readonly Obstacle[];trees:readonly {x:number;z:number;visualW?:number}[]};
/** The candidates that are clear: on the lawn, off every walk path and the plaza (onParkPaving), out of the pond and the bowl,
 *  clear of the signs, of every prop's collider (flags, benches, beds, trunks) and of tree canopies, 12 m apart. */
export function stadiumLampPosts(c:Clearance){
 const C=STADIUM_LAMPS,kept:StadiumLampCandidate[]=[],local=c.obstacles.filter(o=>o.x<-40),trees=c.trees.filter(o=>o.x<-40);
 for(const p of stadiumLampCandidates()){const {x,z}=p;
  if(x>-55||!onIsland(x,z)||!onGrass(x,z)||onParkPaving(x,z,C.pavingClear)||inStadiumFootprint(x,z,2)||inPond(x,z,POND_RIM+1.5))continue;
  if([...PARK_SIGNS,PLAZA_SIGN].some(([sx,sz])=>Math.hypot(x-sx,z-sz)<C.signClear))continue;
  if(local.some(o=>Math.abs(x-o.x)<o.w/2+C.obstacleClear&&Math.abs(z-o.z)<o.d/2+C.obstacleClear))continue;
  if(trees.some(t=>Math.hypot(x-t.x,z-t.z)<(t.visualW??1)/2+C.canopyClear))continue;
  if(kept.some(k=>Math.hypot(x-k.x,z-k.z)<C.spacing))continue;
  kept.push(p);}
 return kept;
}

const DARK='#384443',FIXTURE='#2b3634',LENS='#ffe8ae',APRON_Y=-.08;
type Part=T.BufferGeometry;
const tag=(g:T.BufferGeometry,colour:string,glow:number):Part=>{const n=g.getAttribute('position').count,c=new T.Color(colour),col=new Float32Array(n*3);
 for(let i=0;i<n;i++)col.set([c.r,c.g,c.b],i*3);g.setAttribute('color',new T.BufferAttribute(col,3));g.setAttribute('aGlow',new T.BufferAttribute(new Float32Array(n).fill(glow),1));return g;};
/** A roof-lamp box (stand-local depth / along / height centre) for the roof mesh: aGlow 1 (the whole box is the lens). */
export function roofLampPart(s:StandDef,a:number,centre:T.Vector3){const p=standWorld(s,ROOF_LAMP.d,a),long=s.axis==='x';
 const g=new T.BoxGeometry(long?ROOF_LAMP.depth:ROOF_LAMP.w,ROOF_LAMP.h,long?ROOF_LAMP.w:ROOF_LAMP.depth);g.translate(p.x-centre.x,ROOF_LAMP.y-centre.y,p.z-centre.z);return tag(g,'#f5eed5',1);}
/** Tags a roof piece as plain paint (aGlow 0), so the roof's pieces and lamps merge. */
export const noGlow=(g:T.BufferGeometry)=>{g.setAttribute('aGlow',new T.BufferAttribute(new Float32Array(g.getAttribute('position').count),1));return g;};

/** The beams' glow material: additive, unlit, night-scaled; uRoofFade (west, east roof opacity) fades the roof beams and haze. */
function glowMaterial(){
 return new T.ShaderMaterial({name:'stadium-night-glow',transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:true,
  uniforms:T.UniformsUtils.merge([T.UniformsLib.fog,{uNight:{value:0},uRoofFade:{value:new T.Vector2(1,1)}}]),
  vertexShader:`#include <common>
#include <fog_pars_vertex>
attribute vec3 aTint;attribute vec3 aShape;varying vec3 vTint;varying vec3 vShape;varying vec2 vUv;
void main(){vTint=aTint;vShape=aShape;vUv=uv;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
  fragmentShader:`#include <common>
#include <fog_pars_fragment>
uniform float uNight;uniform vec2 uRoofFade;varying vec3 vTint;varying vec3 vShape;varying vec2 vUv;
void main(){float a;
 if(vShape.y<.5){float e=clamp(min(vUv.x,1.-vUv.x)/max(vShape.x,.001),0.,1.);a=e*e*(3.-2.*e)*pow(vUv.y,1.6);}
 else{vec2 p=vUv*2.-1.;a=clamp(1.-dot(p,p),0.,1.);a*=a;}
 float fade=vShape.z<.5?uRoofFade.x:vShape.z<1.5?uRoofFade.y:1.;
 vec3 c=vTint*a*uNight*fade;
#ifdef USE_FOG
 #ifdef FOG_EXP2
 float ff=1.-exp(-fogDensity*fogDensity*vFogDepth*vFogDepth);
 #else
 float ff=smoothstep(fogNear,fogFar,vFogDepth);
 #endif
 c*=1.-ff;
#endif
 gl_FragColor=vec4(c,1.);}`,
 });
}

/** Phones (coarse pointer) at heat tier 2+ keep the lamps but drop the beams and glows. */
const coarse=()=>typeof window!=='undefined'&&typeof window.matchMedia==='function'&&window.matchMedia('(pointer:coarse)').matches;
export const beamsAllowed=(phone=coarse(),tier:number=effectiveTier())=>!(phone&&tier>=2);
let tierHooked=false;

export type StadiumLightsTools={obstacles:Obstacle[];assets:{kind:string;x:number;z:number;w:number;d:number;visualW?:number;visualD?:number}[];
 add:(o:T.Object3D)=>void;materials:T.Material[];roofFade:{value:T.Vector2}};
export type StadiumLampSite={x:number;z:number;ground:number;poolWidth:number;poolDepth:number;chunk:string};

export function buildStadiumLights(t:StadiumLightsTools){
 const parts:Part[]=[],glow:{pos:number[];uv:number[];tint:number[];shape:number[];idx:number[]}={pos:[],uv:[],tint:[],shape:[],idx:[]};
 let verts=0;const push=(g:Part)=>{parts.push(g);verts+=g.getAttribute('position').count;};
 const lampBox=(w:number,h:number,d:number,colour:string,x:number,y:number,z:number,lit=0)=>{const g=new T.BoxGeometry(w,h,d);g.translate(x,y,z);push(tag(g,colour,lit));};
 const lampCyl=(r:number,h:number,colour:string,x:number,y:number,z:number,lit=0)=>{const g=new T.CylinderGeometry(r,r,h,8);g.translate(x,y,z);push(tag(g,colour,lit));};
 const W=STADIUM_NIGHT_LIGHTS.warm;
 /** A glow quad: corners (bl, br, tr, tl) with v=1 along the top edge (tl-tr) — the bright end of a gradient. */
 const quad=(c:readonly T.Vector3[],strength:number,soft:number,mode:0|1,roof:0|1|2)=>{const o=glow.pos.length/3;
  for(const v of c)glow.pos.push(v.x,v.y,v.z);glow.uv.push(0,0,1,0,1,1,0,1);
  for(let i=0;i<4;i++){glow.tint.push(W[0]*strength,W[1]*strength,W[2]*strength);glow.shape.push(soft,mode,roof);}
  glow.idx.push(o,o+1,o+2,o,o+2,o+3);};
 const V=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
 const pool=(x:number,z:number,r:number,y:number,strength:number)=>quad([V(x-r,y,z+r),V(x+r,y,z+r),V(x+r,y,z-r),V(x-r,y,z-r)],strength,0,1,2);
 const stats={posts:0,fixtures:0,bollards:0,beams:0,colliders:0};
 // Kick reactions (kick audit, Nov 13 2026; lib/graphics/propReactions.ts): each post / bollard / fixture's vertex run in the one
 // merged lamp mesh (mergeGeometries keeps the parts' order), so world.ts can make a PropSpec of it. Build-time only.
 const runs:{kind:'lamp'|'bollard';start:number;count:number}[]=[];
 const run=(kind:'lamp'|'bollard',build:()=>void)=>{const start=verts;build();runs.push({kind,start,count:verts-start});};
 const collide=(x:number,z:number,w:number,d:number)=>{t.obstacles.push({x,z,w,d});stats.colliders++;};

 // --- Lamp posts round the plaza, the apron and the trails (the island's post, its pool in world.ts's night pools) -------------
 const posts=stadiumLampPosts({obstacles:t.obstacles,trees:t.assets.filter(a=>a.kind==='tree'||a.kind==='palm')});
 const L=LAMP_POST,b0=L.ground,sites:StadiumLampSite[]=[];
 for(const {x,z} of posts){
  run('lamp',()=>{lampCyl(L.baseR,L.baseH,DARK,x,b0+L.baseH/2,z);lampCyl(L.poleR,L.poleH,DARK,x,b0+L.poleH/2,z);
  lampBox(L.cap,.12,L.cap,DARK,x,b0+4.22,z);lampBox(L.head,L.headH,L.head,LENS,x,b0+3.99,z,1);});
  collide(x,z,L.collider,L.collider);t.assets.push({kind:'stadium-lamp',x,z,w:L.collider,d:L.collider,visualW:.65,visualD:.65});
  sites.push({x,z,ground:-.02,poolWidth:L.pool,poolDepth:L.pool,chunk:'stadium'});stats.posts++;}

 // --- Uplights at the foot of each stand's outer wall (their wash is the paint patch's), clear of stairs, posts and gates -----
 const roofPosts=[-50,-38,-12,12,38,50];
 const local=(s:StandDef,d:number,a:number,depth:number,along:number)=>{const p=standWorld(s,d,a),long=s.axis==='x';return {x:p.x,z:p.z,w:long?depth:along,d:long?along:depth};};
 for(const s of STANDS){const back=standBack(s),span=s.axis==='x'?48:32,every=STADIUM_NIGHT_LIGHTS.washEvery;
  for(let a=-span;a<=span;a+=every){
   if(s.stairs.some(c=>Math.abs(a-c)<STAIR_WIDTH/2+1)||(s.roof&&roofPosts.some(p=>Math.abs(a-p)<1.2))||(s.gap&&Math.abs(a)<STADIUM_GATE.halfWidth+1.5)||(s.id==='south'&&Math.abs(a)<9))continue;
   const f=local(s,back+.45,a,.4,.55),lens=local(s,back+.45,a,.3,.45);
   run('bollard',()=>{lampBox(f.w,.22,f.d,FIXTURE,f.x,APRON_Y+.11,f.z);lampBox(lens.w,.04,lens.d,LENS,lens.x,APRON_Y+.24,lens.z,1);});collide(f.x,f.z,f.w,f.d);
   const p=standWorld(s,back+1.1,a);pool(p.x,p.z,1.3,-.05,.28);stats.fixtures++;}
 }
 // --- Bollards either side of every back stair's foot -------------------------------------------------------------------------
 for(const s of STANDS)for(const c of s.stairs)for(const side of [-1,1]){const p=standWorld(s,stairEnd(s)+.35,c+side*(STAIR_WIDTH/2+.35));
  run('bollard',()=>{lampCyl(.11,.8,FIXTURE,p.x,APRON_Y+.4,p.z);lampCyl(.13,.14,LENS,p.x,APRON_Y+.87,p.z,1);lampCyl(.15,.05,FIXTURE,p.x,APRON_Y+.965,p.z);});
  collide(p.x,p.z,.3,.3);pool(p.x,p.z,1.5,-.05,.4);stats.bollards++;}
 // --- The gate: two uplights at the pillars' plaza feet washing them, and three lenses under the arch over the walk in ------------
 {const G=STADIUM_GATE,gx=GATE_ARCH_X;
  // Nov 13 2026: each lamp sits 0.5 m in from its pillar's middle (toward the walk), so a shot at the ball-hunt target on the
  // pillar's plaza face (stadiumBalls.ts, 0.2 m out from the middle) is not stopped by the lamp's collider first.
  for(const sz of [-1,1]){const z=G.z+sz*(G.halfWidth+.4),x=gx+1.5,lz=z-sz*.5;
   run('bollard',()=>{lampBox(.5,.22,.5,FIXTURE,x,APRON_Y+.11,lz);lampBox(.4,.04,.4,LENS,x,APRON_Y+.24,lz,1);});collide(x,lz,.5,.5);stats.fixtures++;
   // The pillar's plaza face (x gx+.8, 1.6 m wide): the foot corners take v=1, so it is bright at the foot, fading up.
   quad([V(gx+.82,9.6,z+.85),V(gx+.82,9.6,z-.85),V(gx+.82,0,z-.85),V(gx+.82,0,z+.85)],.22,.25,0,2);
   pool(x,lz,1.4,-.05,.3);}
  for(const dz of [-4,0,4])lampBox(.9,.08,.45,LENS,gx,8.16,G.z+dz,1);
  quad([V(gx+.73,10.6,G.z+8.6),V(gx+.73,10.6,G.z-8.6),V(gx+.73,8.2,G.z-8.6),V(gx+.73,8.2,G.z+8.6)],.1,.1,0,2);}

 // --- Roof beams and haze (the lamps themselves are in the roof meshes) ---------------------------------------------------------
 STANDS.filter(s=>s.roof).forEach((s,ri)=>{const roof=ri as 0|1,long=s.axis==='x',alongDir=long?V(0,0,1):V(1,0,0);
  roofLampAlongs().forEach((a,k)=>{if(k%2)return;
   const top=standWorld(s,ROOF_LAMP.d,a),hit=standWorld(s,STADIUM_NIGHT_LIGHTS.beamHit,a),T0=V(top.x,ROOF_LAMP.y-ROOF_LAMP.h/2,top.z),T1=V(hit.x,0,hit.z);
   const axis=T1.clone().sub(T0),across=axis.clone().cross(alongDir).normalize();
   for(const dir of [alongDir,across]){const w0=dir.clone().multiplyScalar(.45),w1=dir.clone().multiplyScalar(2.4);
    quad([T1.clone().sub(w1),T1.clone().add(w1),T0.clone().add(w0),T0.clone().sub(w0)],.14,.5,0,roof);}
   stats.beams++;});
  const lo=standWorld(s,36,0),hi=standWorld(s,ROOF.front+.3,0),span=STADIUM_NIGHT_LIGHTS.lampSpan+2,a0=alongDir.clone().multiplyScalar(span);
  const top=V(hi.x,ROOF.y-.6,hi.z),bottom=V(lo.x,1.2,lo.z);
  quad([bottom.clone().sub(a0),bottom.clone().add(a0),top.clone().add(a0),top.clone().sub(a0)],.04,.06,0,roof);});

 // --- Meshes ---------------------------------------------------------------------------------------------------------------------
 const lampGeometry=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());lampGeometry.computeBoundingSphere();
 const lampMaterial=patchLampGlow(new T.MeshStandardMaterial({vertexColors:true,roughness:.7}));t.materials.push(lampMaterial);
 const lamps=new T.Mesh(lampGeometry,lampMaterial);lamps.name='stadium-night-lamps';
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(glow.pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(glow.uv,2));
 g.setAttribute('aTint',new T.Float32BufferAttribute(glow.tint,3));g.setAttribute('aShape',new T.Float32BufferAttribute(glow.shape,3));g.setIndex(glow.idx);g.computeBoundingSphere();
 const glowMat=glowMaterial();glowMat.uniforms.uNight=STADIUM_NIGHT;glowMat.uniforms.uRoofFade=t.roofFade;t.materials.push(glowMat);
 const beams=new T.Mesh(g,glowMat);beams.name='stadium-night-glow';beams.renderOrder=2;
 for(const m of [lamps,beams]){m.castShadow=m.receiveShadow=false;m.matrixAutoUpdate=false;m.updateMatrix();m.userData.ownDraw=true;m.userData.skipRoofObstacle=true;t.add(m);}
 const unregister=registerStadiumNightObject(beams,()=>beamsAllowed());
 if(!tierHooked){tierHooked=true;subscribeHeatTier(()=>refreshStadiumNightObjects());}// one module-wide hook: a tier change re-checks the beams
 const tris=(geo:T.BufferGeometry)=>(geo.index?geo.index.count:geo.getAttribute('position').count)/3;
 return {lamps,beams,lampSites:sites,posts,propRuns:runs,stats:{...stats,lampTriangles:tris(lampGeometry),glowTriangles:tris(g)},dispose:()=>{unregister();lampGeometry.dispose();g.dispose();}};
}
export type StadiumLights=ReturnType<typeof buildStadiumLights>;
