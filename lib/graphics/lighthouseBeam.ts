// Lighthouse beam (East Jetty, Oct 13 2026; user: "the lighthouse at night should work like a real lighthouse, subtle like
// that shows"). A slow rotating sweep from the lantern plus a brighter flash when it points at the camera, like a real
// lighthouse's characteristic. Heat: no scene lights (emissive + additive meshes only — the lighthouse's lit lantern glass
// already glows through the shared '#ffe8ae' lamp-lens material, lib/town/world.ts updateTrafficSignals); this file only adds
// the rotating sweep. One merged two-arm wedge mesh for the beam and one camera-facing sprite for the flash core — 2 extra
// draw calls total, built once, only actually drawn when lit (night/dusk; by day the target opacity is 0 and the group hides
// once settled, so 0 draws). The rotation is a single `beam.rotation.y` write per call from the island's existing frame loop —
// no animation timer of its own — and freezes into a steady glow when `steady` is set (reduced motion, the heat governor's
// slow state or a higher heat tier — callers already compute this combined flag for stillWater/backgroundFrozen) or when the
// lighthouse is far from the player or outside the camera frustum (distance + frustum check, caySharks.ts's pattern), and the
// whole group hides outright beyond LIGHTHOUSE_HIDE_DISTANCE. `dt` 0 (menus, fishing focus mode) freezes everything, the same
// convention world.updateFerry / world.updateSharks already use. No canvas/DOM: both gradients are plain DataTextures,
// computed once at build time.
import * as T from 'three';

/** Seconds per full rotation — a real lighthouse's characteristic period (the spec's 8–12 s range). */
export const LIGHTHOUSE_BEAM_PERIOD=10;
/** Distance (m) beyond which the whole beam hides (no draws): mirrors caySharks.ts's region cutoff (220 m). */
export const LIGHTHOUSE_HIDE_DISTANCE=220;
/** Distance (m) beyond which the beam stays visible but stops animating (skips the per-frame rotation work). */
export const LIGHTHOUSE_ANIMATE_DISTANCE=140;
export type LighthouseMode='day'|'sunset'|'night';
/** Subtle by design: low peak opacity so the sweep never washes out the scene. */
const TARGET_OPACITY:Record<LighthouseMode,number>={day:0,sunset:.09,night:.22};
const TARGET_HALO:Record<LighthouseMode,number>={day:0,sunset:.25,night:.6};

/** Folds an angle (radians) into (−π/2, π/2]: the lighthouse has two beam arms 180° apart, so "closest alignment" only
 *  needs the angle modulo π. Pure, exported for tests. */
export function foldHalfTurn(a:number){let d=a%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;else if(d<-Math.PI)d+=Math.PI*2;if(d>Math.PI/2)d-=Math.PI;else if(d<-Math.PI/2)d+=Math.PI;return d;}
/** How closely a beam pointing at `beamAngle` aligns with the direction to the camera at `cameraAngle` (both in the same
 *  rotation.y basis: see `cameraAngleTo`): 1 when either arm points straight at the camera, falling off a quarter-turn away.
 *  Pure, exported for tests. */
export function beamAlignment(beamAngle:number,cameraAngle:number){return Math.max(0,Math.cos(foldHalfTurn(cameraAngle-beamAngle)));}
/** The angle that, written to `group.rotation.y`, would point the beam's local +x arm straight at (dx,dz) from the lamp
 *  (three's Y-rotation convention: local (L,0,0) → world (L·cosθ, 0, −L·sinθ)). Exported for tests. */
export function cameraAngleTo(dx:number,dz:number){return Math.atan2(-dz,dx);}

function gradientTexture(w:number,h:number,fn:(u:number,v:number)=>number){
 const data=new Uint8Array(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=(x+.5)/w,v=(y+.5)/h,a=Math.max(0,Math.min(1,fn(u,v))),byte=Math.round(a*255),i=(y*w+x)*4;data[i]=data[i+1]=data[i+2]=data[i+3]=byte;}
 const tex=new T.DataTexture(data,w,h,T.RGBAFormat);tex.needsUpdate=true;tex.colorSpace=T.SRGBColorSpace;return tex;
}
/** The wedge's soft fade: bright near the lamp (u 0), fading with distance (u 1) and softly at the beam's edges (v 0/1) —
 *  a fresnel-ish alpha gradient without a custom shader. */
function buildWedgeTexture(){return gradientTexture(32,16,(u,v)=>{const edge=1-Math.abs(v-.5)*2,dist=Math.pow(1-u,1.6);return edge*dist;});}
/** A soft round glow for the flash/core sprite. */
function buildHaloTexture(){return gradientTexture(24,24,(u,v)=>{const d=Math.hypot(u-.5,v-.5)*2;return Math.max(0,1-d);});}

/** One arm's wedge: an apex at the lamp and two soft fans (the horizontal sweep width, plus a little vertical thickness), so
 *  it reads as a tapered cone-shaped shaft from most angles without true 3D geometry — a cheap "crossed planes" light-shaft
 *  trick (double-sided material, so no second winding is needed). `drop` angles the far end down toward the sea. */
function addArm(positions:number[],uvs:number[],indices:number[],dir:1|-1,length:number,halfWidth:number,halfHeight:number,drop:number){
 const base=positions.length/3;
 const push=(x:number,y:number,z:number,u:number,v:number)=>{positions.push(x*dir,y,z);uvs.push(u,v);};
 push(0,0,0,0,.5);// 0 apex (the lamp)
 push(length,-drop,halfWidth,1,0);// 1 horizontal fan, left
 push(length,-drop,-halfWidth,1,1);// 2 horizontal fan, right
 push(length,-drop+halfHeight,0,1,0);// 3 vertical fan, top
 push(length,-drop-halfHeight,0,1,1);// 4 vertical fan, bottom
 indices.push(base,base+1,base+2, base,base+3,base+4);
}
/** Both arms (180° apart in local space; `group.rotation.y` sweeps the whole thing) in one geometry: 10 vertices, 4
 *  triangles — one draw call, negligible vertex cost. */
function buildBeamGeometry(length:number,halfWidth:number,halfHeight:number,drop:number){
 const positions:number[]=[],uvs:number[]=[],indices:number[]=[];
 addArm(positions,uvs,indices,1,length,halfWidth,halfHeight,drop);
 addArm(positions,uvs,indices,-1,length,halfWidth,halfHeight,drop);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();
 return g;
}

export type LighthouseBeam=ReturnType<typeof createLighthouseBeam>;
/**
 * Builds the beam at `origin` (x,z world), lamp height `lampY`. Call `update` once per island frame, next to
 * world.updateFerry / world.updateSharks in components/Town.tsx; it costs little more than a few scalars when the
 * lighthouse is hidden, far, off-screen or frozen.
 */
export function createLighthouseBeam(scene:T.Scene,origin:{x:number;z:number},lampY:number){
 const group=new T.Group();group.name='east-pier-lighthouse-beam';group.position.set(origin.x,lampY,origin.z);group.visible=false;scene.add(group);
 const wedgeTexture=buildWedgeTexture(),haloTexture=buildHaloTexture();
 const beamGeometry=buildBeamGeometry(78,9.6,3.1,9.2);
 const beamMaterial=new T.MeshBasicMaterial({map:wedgeTexture,color:'#ffe3ad',transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false,side:T.DoubleSide,opacity:0});
 const beam=new T.Mesh(beamGeometry,beamMaterial);beam.name='east-pier-lighthouse-sweep';beam.castShadow=false;beam.receiveShadow=false;beam.frustumCulled=true;
 group.add(beam);
 const haloMaterial=new T.SpriteMaterial({map:haloTexture,color:'#fff2cf',transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false,opacity:0});
 const halo=new T.Sprite(haloMaterial);halo.name='east-pier-lighthouse-flash';halo.scale.set(3.4,3.4,1);halo.position.set(0,.1,0);
 group.add(halo);
 let phase=0,opacity=0,haloBase=0;
 const frustum=new T.Frustum(),viewProjection=new T.Matrix4(),sphere=new T.Sphere(group.position,10);
 const stats={awake:0,rotated:0};
 function update(dt:number,mode:LighthouseMode,steady:boolean,camera:T.Camera,player:{x:number;z:number},immediate=false){
  const target=TARGET_OPACITY[mode],live=dt>0||immediate,t=immediate?1:1-Math.exp(-Math.max(0,dt)*2.2);
  if(live){opacity+=(target-opacity)*t;if(Math.abs(opacity-target)<.0015)opacity=target;}
  if(opacity<=.0015){group.visible=false;beamMaterial.opacity=0;haloMaterial.opacity=0;return;}
  const dx=player.x-origin.x,dz=player.z-origin.z,distance=Math.hypot(dx,dz),distanceVisible=distance<LIGHTHOUSE_HIDE_DISTANCE;
  group.visible=distanceVisible;
  if(!distanceVisible)return;
  stats.awake++;
  const haloTarget=TARGET_HALO[mode]*(opacity/Math.max(target,.0001));
  if(live)haloBase+=(haloTarget-haloBase)*t;
  // Reduced motion / the heat governor's slow state / a higher tier: a steady glow, no sweep. A frozen flat wedge can land
  // edge-on to the camera by chance and read as broken, so the shaft itself hides and only the always-camera-facing halo
  // sprite shows — a plain, angle-proof "lit lantern" glow instead of a stuck-looking beam.
  if(steady){beamMaterial.opacity=0;haloMaterial.opacity=Math.min(1,haloBase*.85);return;}
  beamMaterial.opacity=opacity;
  viewProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(viewProjection);
  const onScreen=distance<LIGHTHOUSE_ANIMATE_DISTANCE&&frustum.intersectsSphere(sphere);
  const animate=dt>0&&onScreen;
  if(animate){phase=(phase+dt/LIGHTHOUSE_BEAM_PERIOD*Math.PI*2)%(Math.PI*2);stats.rotated++;}
  beam.rotation.y=phase;
  if(!onScreen){haloMaterial.opacity=haloBase*.6;return;}
  const cameraAngle=cameraAngleTo(camera.position.x-origin.x,camera.position.z-origin.z);
  const alignment=beamAlignment(phase,cameraAngle);
  haloMaterial.opacity=Math.min(1,haloBase*(.5+alignment*1.6));
 }
 return {group,beam,halo,stats,update,
  dispose(){group.removeFromParent();beamGeometry.dispose();beamMaterial.dispose();haloMaterial.dispose();wedgeTexture.dispose();haloTexture.dispose();}};
}
