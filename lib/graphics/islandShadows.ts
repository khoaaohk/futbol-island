import * as T from 'three';
import {SUMMIT_BOX,summitGridGround} from '../town/summitIsle';
import {SHADOW_EDGE_FADE} from './shadowEdgeFade';

/** The island sun's fixed offset from its target (Town: sun.position = target + SUN_OFFSET). */
export const SUN_OFFSET=[-288,252,198] as const;
const SUN_DISTANCE=Math.hypot(...SUN_OFFSET);
/** Receivers stand up to this high above the ground under them (roofs, the lighthouse gallery, tree tops). */
export const RECEIVER_HEADROOM=24;
/** The camera ray also meets roofs this high before it reaches the ground behind them. */
const ROOF_PLANE=20;
/** Casters above the receivers (tall trees and towers up-sun, a flying player) stay in front of the near plane: light-space metres. */
export const CASTER_DEPTH=60;
/** How far along a view ray the shadows reach: at least SHADOW_REACH m, or SHADOW_REACH_SCALE × the distance to the ground at the
 *  bottom of the view (so a high camera, whose whole view is small on screen, still gets shadows everywhere it sees). The walk view
 *  sees ≤ ~140 m on flat ground (ultrawide corners; phones ~110 m), so only downhill views from Summit Isle's top end inside the view (where they fade, never cut). */
export const SHADOW_REACH=145,SHADOW_REACH_SCALE=5;
const STEP=3,MARGIN=1.5,SIZE_STEP=1,DEPTH_STEP=8,REFIT_MOVE=1.5,HOLD_HEADROOM=1.5;
/** Ground height for the fit: Summit Isle's 2 m height grid (bilinear, cheap), 0 elsewhere (the parking deck's 6 m and every other
 *  raised floor sit inside RECEIVER_HEADROOM). */
export function islandGroundForShadows(x:number,z:number){
 return x<SUMMIT_BOX.minX||x>SUMMIT_BOX.maxX||z<SUMMIT_BOX.minZ||z>SUMMIT_BOX.maxZ?0:summitGridGround(x,z);
}

/** The light's basis (three.js lookAt from the sun toward its target): x = right, y = up, depth = away from the sun. */
export function sunBasis(){
 const m=new T.Matrix4().lookAt(new T.Vector3(...SUN_OFFSET),new T.Vector3(),new T.Vector3(0,1,0));
 const right=new T.Vector3().setFromMatrixColumn(m,0),up=new T.Vector3().setFromMatrixColumn(m,1),depth=new T.Vector3().setFromMatrixColumn(m,2).negate();
 return {right,up,depth};
}

export type ShadowFootprint={minX:number;maxX:number;minY:number;maxY:number;minZ:number;maxZ:number;
 /** Light-space x / y of the ground a quarter up from the bottom centre of the screen (near the followed player, the nearest, largest receivers): the anchor a capped box shrinks toward. */
 anchorX?:number;anchorY?:number};

/** Phone landscape shadow cap (batch 2, Oct 23 2026, docs/LANDSCAPE_AUDIT_OCT23.md): the portrait phone's walking box is ~116 × 46 m
 *  (5 336 m²) at 1536². Phone landscape (aspect > 1.3) keeps its box within SHADOW_LANDSCAPE_AREA_SCALE × that, so its texel density is
 *  never more than ~12 % coarser than portrait's (before: 128 × 124 m, 3× coarser). The landscape dolly (lib/town/walkControl.ts
 *  cameraDollyFor) already brings the walking box to ~62-74 × 66-84 m (≤ portrait), so the cap only bites on raised views (flying,
 *  Summit Isle downhill), where the far edge fades (shadowEdgeFade) instead of the near shadows going soft. Portrait, tablets and
 *  desktop: no cap (Infinity). The map size is unchanged (no extra cost at any heat tier). */
export const SHADOW_PORTRAIT_AREA=116*46,SHADOW_LANDSCAPE_AREA_SCALE=1.25;
export function shadowAreaCap(aspect:number,phone:boolean){return phone&&aspect>1.3?SHADOW_PORTRAIT_AREA*SHADOW_LANDSCAPE_AREA_SCALE:Infinity;}
/**
 * The receivers the camera can see, in light space (x, y across the shadow map, z = depth away from the sun).
 * Rays through a 9 × 7 grid of the screen are marched over the ground (the real terrain height, so Summit Isle's 0–55 m slopes are
 * covered where they actually are). Each ground hit and the ray's point ROOF_PLANE m above it add a receiver column from the ground
 * to RECEIVER_HEADROOM above it. Rays stop at the reach (see SHADOW_REACH); a ray that gets there in the air adds its column there.
 */
export function viewShadowFootprint(view:T.PerspectiveCamera,groundAt:(x:number,z:number)=>number=islandGroundForShadows,basis=sunBasis()):ShadowFootprint{
 view.updateMatrixWorld();
 const origin=view.position,ray=new T.Vector3(),p=new T.Vector3(),q=new T.Vector3(),f:ShadowFootprint={minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity,minZ:Infinity,maxZ:-Infinity};
 const column=(x:number,z:number)=>{const g=groundAt(x,z);for(const y of [g,g+RECEIVER_HEADROOM]){q.set(x,y,z);
  const lx=q.dot(basis.right),ly=q.dot(basis.up),lz=q.dot(basis.depth);
  if(lx<f.minX)f.minX=lx;if(lx>f.maxX)f.maxX=lx;if(ly<f.minY)f.minY=ly;if(ly>f.maxY)f.maxY=ly;if(lz<f.minZ)f.minZ=lz;if(lz>f.maxZ)f.maxZ=lz;}};
 const hitDistance=(limit:number)=>{let prev=0;
  for(let t=STEP;;t+=Math.max(STEP,t*.05)){const s=Math.min(t,limit);p.copy(origin).addScaledVector(ray,s);
   if(p.y<=groundAt(p.x,p.z)){let a=prev,b=s;for(let i=0;i<5;i++){const m=(a+b)/2;p.copy(origin).addScaledVector(ray,m);if(p.y<=groundAt(p.x,p.z))b=m;else a=m;}return b;}
   if(s>=limit)return -limit;prev=s;}};
 // The reach follows the ground distance at the bottom centre of the view.
 ray.set(0,-1,.5).unproject(view).sub(origin).normalize();
 const nearest=Math.abs(hitDistance(4000)),reach=Math.min(2000,Math.max(SHADOW_REACH,nearest*SHADOW_REACH_SCALE));
 {ray.set(0,-.5,.5).unproject(view).sub(origin).normalize();const d=Math.abs(hitDistance(reach));p.copy(origin).addScaledVector(ray,d);f.anchorX=p.dot(basis.right);f.anchorY=p.dot(basis.up);}
 for(let i=0;i<9;i++)for(let j=0;j<7;j++){
  ray.set(-1+i/4,-1+j/3,.5).unproject(view).sub(origin).normalize();
  const d=Math.abs(hitDistance(reach));p.copy(origin).addScaledVector(ray,d);column(p.x,p.z);
  // the same ray at roof height above the ground it reached (it meets a roof there before the ground behind it)
  if(ray.y<-1e-3){const back=Math.min(d,ROOF_PLANE/-ray.y);p.copy(origin).addScaledVector(ray,d-back);column(p.x,p.z);}
 }
 return f;
}

/**
 * The island's sun shadow box, fitted to what the camera sees every frame (Oct 14 2026, Summit Isle "shading that cuts off").
 *
 * Before: one fit per 4 m of camera height, made for a reference camera over FLAT ground at y = 0 (receivers 0–24 m), with the sun's
 * target pinned to y = 0. On Summit Isle (ground 0–55 m) that box no longer matched the ground the camera saw: on the 50 m terrace it
 * was ~310 m wide (3× the walk view's, so 3× softer shadows) and still missed the view's sides, so tree shadows ended on a long
 * straight diagonal (the box edge on the grass).
 *
 * Now: the box covers the receivers the camera actually sees (viewShadowFootprint, the real terrain heights), plus a margin and the
 * soft edge-fade band (shadowEdgeFade.ts) outside them. Its size changes in 1 m steps, grows at once (with 10% headroom on a re-grow)
 * and shrinks only after 20% slack; its depth range in 8 m steps, and its centre snaps to whole shadow texels, so a moving camera never shimmers. On flat
 * ground the box matches the old one (same map size, same texel density); on the summit it is ~3× smaller.
 * Cost: when the camera has moved ≥ 1.5 m (or turned), 63 rays marched over a bilinear height grid (~0.15–0.3 ms on a laptop); otherwise a few
 * dot products. No extra draws.
 */
export function createIslandShadowFit(light:T.DirectionalLight,groundAt:(x:number,z:number)=>number=islandGroundForShadows){
 const basis=sunBasis(),target=new T.Vector3(),last=new T.Vector3(),lastQuat=new T.Quaternion();
 let rel:ShadowFootprint|null=null,areaCap=Infinity,halfX=0,halfY=0,nearOff=0,farOff=0,lastAspect=0,lastFov=0,lastZoom=0,lastMap=0,stale=true;
 const stats={refits:0,resizes:0,capped:0};
 let hold=false;
 function update(view:T.PerspectiveCamera){
  view.updateMatrixWorld();
  if(stale||!rel||view.position.distanceToSquared(last)>REFIT_MOVE*REFIT_MOVE||view.quaternion.angleTo(lastQuat)>.01||view.aspect!==lastAspect||view.fov!==lastFov||view.zoom!==lastZoom){
   const f=viewShadowFootprint(view,groundAt,basis),cx=view.position.dot(basis.right),cy=view.position.dot(basis.up),cz=view.position.dot(basis.depth);
   // Stored relative to the camera, so the box follows the camera smoothly between refits (the drift stays inside MARGIN).
   rel={minX:f.minX-cx,maxX:f.maxX-cx,minY:f.minY-cy,maxY:f.maxY-cy,minZ:f.minZ-cz,maxZ:f.maxZ-cz,anchorX:(f.anchorX??(f.minX+f.maxX)/2)-cx,anchorY:(f.anchorY??(f.minY+f.maxY)/2)-cy};
   last.copy(view.position);lastQuat.copy(view.quaternion);lastAspect=view.aspect;lastFov=view.fov;lastZoom=view.zoom;stale=false;stats.refits++;
  }
  const cx=view.position.dot(basis.right),cy=view.position.dot(basis.up),cz=view.position.dot(basis.depth);
  let minX=cx+rel.minX,maxX=cx+rel.maxX,minY=cy+rel.minY,maxY=cy+rel.maxY;const minZ=cz+rel.minZ,maxZ=cz+rel.maxZ;
  // Phone landscape cap (shadowAreaCap): shrink the receiver box toward the near ground (the footprint anchor) until it fits the area.
  const area=(maxX-minX)*(maxY-minY);
  if(area>areaCap){const k=Math.sqrt(areaCap/area),ax=Math.min(maxX,Math.max(minX,cx+rel.anchorX!)),ay=Math.min(maxY,Math.max(minY,cy+rel.anchorY!));
   minX=ax+(minX-ax)*k;maxX=ax+(maxX-ax)*k;minY=ay+(minY-ay)*k;maxY=ay+(maxY-ay)*k;stats.capped++;}
  // Half sizes: the footprint + margin, widened so the edge-fade band lies outside it; 1 m steps; a re-grow takes 10% headroom (few resizes on a climb), shrink after 20% slack.
  const size=(need:number,current:number)=>{need=(need+MARGIN)/(1-2*SHADOW_EDGE_FADE);const q=Math.ceil(need/SIZE_STEP)*SIZE_STEP;if(q>current)return current>0?Math.ceil(need*(hold?HOLD_HEADROOM:1.1)/SIZE_STEP)*SIZE_STEP:q;return q<current*.8&&!hold?q:current;};
  const hx=size((maxX-minX)/2,halfX),hy=size((maxY-minY)/2,halfY),map=light.shadow.mapSize.x;
  const shadowCamera=light.shadow.camera;let dirty=false;
  if(hx!==halfX||hy!==halfY||map!==lastMap||shadowCamera.right!==hx||shadowCamera.top!==hy){
   halfX=hx;halfY=hy;lastMap=map;stats.resizes++;dirty=true;
   Object.assign(shadowCamera,{left:-hx,right:hx,bottom:-hy,top:hy});
   // 2 texels of normal offset (quality pass: no acne on parapets at the fitted size; islandHeat keeps 2 texels when a tier resizes the map).
   light.shadow.normalBias=2*Math.max(2*hx,2*hy)/Math.max(1,map);
  }
  // Centre on whole texels (no shimmer as the camera moves); depth origin in 8 m steps.
  const texelX=2*halfX/light.shadow.mapSize.x,texelY=2*halfY/light.shadow.mapSize.y;
  const tx=Math.round((minX+maxX)/2/texelX)*texelX,ty=Math.round((minY+maxY)/2/texelY)*texelY,tz=Math.round((minZ+maxZ)/2/DEPTH_STEP)*DEPTH_STEP;
  target.set(0,0,0).addScaledVector(basis.right,tx).addScaledVector(basis.up,ty).addScaledVector(basis.depth,tz);
  light.target.position.copy(target);light.position.copy(target).addScaledVector(basis.depth,-SUN_DISTANCE);
  // Near/far (distance from the light): receivers' depth range, casters up to CASTER_DEPTH in front; 8 m steps with slack.
  const needNear=minZ-tz-CASTER_DEPTH,needFar=maxZ-tz+4;
  if(needNear<nearOff||needNear>nearOff+3*DEPTH_STEP)nearOff=Math.floor(needNear/DEPTH_STEP)*DEPTH_STEP;
  if(needFar>farOff||needFar<farOff-3*DEPTH_STEP)farOff=Math.ceil(needFar/DEPTH_STEP)*DEPTH_STEP;
  const near=Math.max(.5,SUN_DISTANCE+nearOff),far=SUN_DISTANCE+farOff;
  if(shadowCamera.near!==near||shadowCamera.far!==far){shadowCamera.near=near;shadowCamera.far=far;dirty=true;}
  if(dirty)shadowCamera.updateProjectionMatrix();
 }
 return {stats,update,
  /** Refit on the next update (resize, a watch view handing the light back). */
  invalidate(){stale=true;halfX=halfY=0;},
  /** The receiver-box area cap (m², light space; shadowAreaCap): Infinity = none. A change refits on the next update. */
  setAreaCap(cap:number){if(cap!==areaCap){areaCap=cap;stale=true;}},
  get areaCap(){return areaCap;},
  /** Held (the zipline ride, ~15 s: a fast camera dropping 40 m and a look-around): the box only grows, with more headroom, and
   *  never shrinks until released, so the shadow texels don't change size (every shadow edge re-quantising) a dozen times. */
  hold(on:boolean){hold=on;},
  get half(){return {x:halfX,y:halfY};}};
}

/** Quality pass: the isolated watch view looks at one pitch from a high, angled camera, so the view-based fit spanned ~680 × 190 m of
 * light space (≈ 67 cm per texel under the players). Fit the shadow camera to the watched pitch instead (receivers only: the pitch
 * box ± halfW/halfD around the sun target, yMin–yMax tall; casters above share their light-space x/y and are kept by a deep near). */
export function fitShadowsToBox(light:T.DirectionalLight,halfW:number,halfD:number,yMin:number,yMax:number){
 const shadowView=new T.OrthographicCamera();shadowView.position.set(...SUN_OFFSET);shadowView.lookAt(0,0,0);shadowView.updateMatrixWorld();
 const point=new T.Vector3();let left=Infinity,right=-Infinity,bottom=Infinity,top=-Infinity,near=Infinity,far=-Infinity;
 for(const x of [-halfW,halfW])for(const z of [-halfD,halfD])for(const y of [yMin,yMax]){point.set(x,y,z).applyMatrix4(shadowView.matrixWorldInverse);
  left=Math.min(left,point.x);right=Math.max(right,point.x);bottom=Math.min(bottom,point.y);top=Math.max(top,point.y);near=Math.min(near,-point.z);far=Math.max(far,-point.z);}
 const camera=light.shadow.camera,margin=2;
 Object.assign(camera,{left:Math.floor(left-margin),right:Math.ceil(right+margin),bottom:Math.floor(bottom-margin),top:Math.ceil(top+margin),near:Math.max(.1,near-60),far:far+32});
 camera.updateProjectionMatrix();light.shadow.needsUpdate=true;
 light.shadow.normalBias=2*Math.max(camera.right-camera.left,camera.top-camera.bottom)/Math.max(1,light.shadow.mapSize.x);
}
