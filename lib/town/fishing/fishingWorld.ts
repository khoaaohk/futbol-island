import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createBuildingGlow} from '../../graphics/buildingGlow';
import {FISH_SPOTS,MARKET_STAND,type FishSpot} from './fishCatalog';
import {createFishingVisuals,type FishingVisuals} from './fishingVisuals';
import {createFishingCamera} from './fishingCamera';
import {CAST_TIME,castPoint,planApproach,stepSession,type SessionEvent} from './fishingCore';
import {fishById} from './fishCatalog';
import {createDeepSeaBoat} from './deepSeaBoat';
import {BOAT_AFLOAT} from './deepSeaBoatData';
import type {FishingSessionApi} from './fishingSession';

/**
 * Fishing props on the island + the "Fish" / "Sell" prompts (docs/fishing.md).
 *
 * Heat budget: all five fishing posts are ONE merged static mesh (one draw, one shadow draw), the floats are one
 * InstancedMesh (one draw), and the shared glow + ripple are hidden unless the player is at a spot. Per frame, when the
 * player is not near the water, update() is a distance check over five points and nothing else: no matrix writes, no
 * material changes, no wake-ups of the sleeping island loop (it never requests frames itself). The Deep Sea Boat
 * (./deepSeaBoat.ts) adds one more distance check; its single merged mesh exists only within 260 m of the mooring.
 */
export type FishingUpdate={
 x:number;z:number;
 /** Walking on the ground (not flying, falling or riding a truck). */
 onFoot:boolean;
 /** Same gate as building entries: not in a lesson, field menu or overlay. */
 canEnter:boolean;
 /** The hover ray when a desktop pointer is over the canvas, already set from the camera; null otherwise. */
 ray:T.Raycaster|null;
 now:number;dt:number;elapsed:number;reduced:boolean;
 camera:T.Camera;width:number;height:number;
 /** Coarse pointer / narrow screen: show only the nearest prompt. */
 mobile:boolean;
 /** Another prompt (building entry, truck) already owns the mobile slot. */
 blocked:boolean;
 ui:<E extends HTMLElement>(selector:string)=>E|null|undefined;
 place:(el:HTMLElement,left:number,top:number)=>void;
 hide:(el:HTMLElement,hidden:boolean)=>void;
};

const SPOT_REACH=6.2,BOB_RANGE=45,KIOSK_OFFSET=2.1;
type Colored={geometry:T.BufferGeometry;color:string};
function paint({geometry,color}:Colored){
 const g=geometry.index?geometry.toNonIndexed():geometry.clone();geometry.dispose();
 g.deleteAttribute('uv');const c=new T.Color(color),count=g.getAttribute('position').count,colors=new Float32Array(count*3);
 for(let i=0;i<count;i++){colors[i*3]=c.r;colors[i*3+1]=c.g;colors[i*3+2]=c.b;}
 g.setAttribute('color',new T.BufferAttribute(colors,3));return g;
}
const place=(g:T.BufferGeometry,x:number,y:number,z:number,rx=0,ry=0,rz=0,s:[number,number,number]=[1,1,1])=>g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(...s)));

/** A small "fishing post": tackle chest, notice board with a fish emblem, a little roof and two rods (matches the cabinet glow). */
function kioskParts(rocks:boolean):Colored[]{
 const parts:Colored[]=[
  {geometry:new T.BoxGeometry(1.2,1.25,.7).translate(0,.625,0),color:'#a67d55'},
  {geometry:new T.BoxGeometry(1.26,.12,.76).translate(0,1.28,0),color:'#7a5a3e'},
  {geometry:new T.BoxGeometry(.5,.1,.04).translate(0,.95,.37),color:'#e6c477'},
  {geometry:new T.BoxGeometry(1.12,1.3,.08).translate(0,2.02,-.2),color:'#fff0cf'},
  {geometry:new T.BoxGeometry(1.22,.1,.12).translate(0,1.38,-.2),color:'#477c6a'},
  {geometry:new T.BoxGeometry(1.4,.12,.9).translate(0,2.8,.05),color:'#bd7657'},
  {geometry:place(new T.IcosahedronGeometry(.26,0),0,2.08,-.14,0,0,0,[1.5,.7,.25]),color:'#3f7a78'},
  {geometry:place(new T.ConeGeometry(.17,.3,3),.5,2.08,-.14,0,0,-Math.PI/2),color:'#3f7a78'},
  {geometry:place(new T.SphereGeometry(.04,6,4),-.2,2.14,-.08),color:'#fff0cf'},
 ];
 for(const side of [-1,1]){
  parts.push({geometry:place(new T.CylinderGeometry(.022,.03,2.6,5),side*.42,1.95,.36,.28,0,side*.12),color:'#6e5540'});
  parts.push({geometry:place(new T.CylinderGeometry(.07,.07,.08,8),side*.42,1.05,.46,Math.PI/2,0,0),color:'#d6a15d'});
 }
 if(rocks)for(const [x,z,r] of [[-1.3,.6,.42],[1.5,.2,.5],[-.6,1.4,.3],[1.1,1.3,.36]] as const)parts.push({geometry:place(new T.IcosahedronGeometry(r,0),x,r*.35,z,0,x,0,[1,.62,1]),color:'#a39a88'});
 return parts;
}

function signTexture(){
 const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');
 if(g){g.fillStyle='#294f43';g.fillRect(0,0,512,96);g.strokeStyle='#f4cc7c';g.lineWidth=6;g.strokeRect(5,5,502,86);g.fillStyle='#fff0cf';g.font='bold 40px system-ui,Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('ROSA BUYS · FISH · PRODUCE · CARDS',256,50,480);}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;
}

/**
 * `player` + `session` enable live fishing in the island view (docs/fishing.md): the HUD starts a session, this module
 * steps it each frame, drives the rig (camera, rod, float, shadow) and places the in-world catch label.
 */
export function createFishingWorld(scene:T.Scene,player?:T.Object3D,session?:FishingSessionApi){
 const cam=createFishingCamera();let liveSpot=-1,visuals:FishingVisuals|null=null,fishing=false,stand={x:0,z:0},cast=castPoint(FISH_SPOTS[0],FISH_SPOTS[0]);const labelPoint=new T.Vector3();
 /** Near a spot (45 m) or fishing: the visuals exist; 80 m away and idle: they are disposed (docs/fishing-visuals-HANDOFF.md). */
 const nearAnySpot=(x:number,z:number,r:number)=>FISH_SPOTS.some(s=>Math.abs(x-s.x)<r&&Math.abs(z-s.z)<r);
 const beat=(e:SessionEvent)=>{if(!visuals)return;if(e==='splash')visuals.splash('land');else if(e==='reel'||e==='pull')visuals.nibble();else if(e==='nibble')visuals.nibble();else if(e==='bite')visuals.splash('bite');else if(e==='hooked')visuals.splash('hook');else if(e==='scared'||e==='escaped')visuals.splash('small');};
 const stopFishing=(api:FishingSessionApi)=>{fishing=false;cam.end();visuals?.end();api.end();hideFloat(liveSpot,false);liveSpot=-1;};
 const driver=player&&session?(c:FishingUpdate,near:number):number=>{
  // Paused under the Fishbook / market stand: the island renders one last frame after the player rig has re-posed,
  // so re-apply the frozen angler pose (arms, rod, line) with no time step instead of skipping it (the character used to snap).
  if(session.paused){if(fishing&&visuals)visuals.frame(0,c.elapsed,c.reduced);return near;}
  const pending=session.takePending();
  if(pending&&!fishing){const i=FISH_SPOTS.findIndex(s=>s.id===pending),s=FISH_SPOTS[i];
   if(s&&near===i){liveSpot=i;fishing=true;stand={x:c.x,z:c.z};cast=castPoint(s,stand);session.begin(s.id);hideFloat(i,true);
    visuals??=createFishingVisuals(scene,player);visuals.begin(stand,cast,cast.dir);
    cam.begin(stand,cast.dir,cast.distance,()=>{if(fishing&&session.session.phase==='ready')session.tap();},s.camera);}}
  const events:SessionEvent[]=[];
  if(fishing){
   if(session.takeStop()||Math.hypot(c.x-stand.x,c.z-stand.z)>1.3||!c.onFoot||!c.canEnter)stopFishing(session);
   else{events.push(...stepSession(session.session,FISH_SPOTS[liveSpot],c.dt,Math.random,{easy:c.reduced,out:cast.dir,approach:(r,f)=>planApproach(cast,r,f)}));if(events.length||session.session.phase==='reeling')session.handle(events);}
  }else session.takeStop();
  events.push(...session.drainTapEvents());
  // Visuals lifecycle + drive (no logic in the visuals; they only show the current state).
  const around=fishing||nearAnySpot(c.x,c.z,45);
  if(!visuals&&around)visuals=createFishingVisuals(scene,player);
  if(visuals&&!fishing&&!visuals.busy&&!nearAnySpot(c.x,c.z,80)){visuals.dispose();visuals=null;}
  if(visuals){
   visuals.setCoastVisible(around);
   if(fishing){const s=session.session,ph=s.phase;
    visuals.setPose(ph==='caught'?'holdUp':ph==='casting'?(s.t<.25?'windup':'cast'):ph==='bite'||ph==='reeling'&&s.dip>.1?'strike':'hold');
    visuals.setBobber(ph==='ready'?{kind:'hanging'}:ph==='casting'?{kind:'flying',progress:s.t/CAST_TIME}:ph==='reeling'?{kind:'reeling',progress:s.reelTaps/Math.max(1,s.reelTarget)}:ph==='bite'?{kind:'under'}:ph==='caught'?{kind:'hidden'}:{kind:'floating'});
    const f=s.fish?fishById(s.fish.id):undefined;
    visuals.showShadow(s.shadow&&f?{size:f.shadow,pos:{x:s.shadow.x,z:s.shadow.z},heading:s.shadow.heading+(ph==='scared'||ph==='escaped'?Math.PI:0),alpha:s.shadow.alpha}:null);
    visuals.setReelingFish(ph==='reeling'&&f&&s.fish?{color:f.color,lengthCm:s.fish.size,shape:f.shape}:null);
    visuals.holdUpFish(ph==='caught'&&f&&s.fish?{color:f.color,lengthCm:s.fish.size,shape:f.shape}:null);
    for(const e of events)beat(e);}
   if(visuals.busy)visuals.frame(c.dt,c.elapsed,c.reduced);
  }
  const label=c.ui<HTMLElement>('[data-fish-catch]');
  if(label){const show=fishing&&!!visuals&&session.session.phase==='caught';
   if(show){visuals!.labelAnchor(labelPoint).project(c.camera);const narrow=c.width<560,px=(labelPoint.x+1)*c.width/2,py=(1-labelPoint.y)*c.height/2;
    // Beside the angler (the held-up fish stays visible); on narrow phones, docked just above the Fishbook/Cast actions
    // (actions: 58px buttons at bottom 28px + safe area, see FishingHost.module.css) so it never covers the angler.
    label.dataset.side=narrow?'dock':'right';c.place(label,narrow?c.width/2:T.MathUtils.clamp(px+46,16,c.width-330),narrow?c.height-100:T.MathUtils.clamp(py,150,c.height-150));}
   c.hide(label,!show);}
  return fishing?-1:near;
 }:null;
 const root=new T.Group();root.name='fishing-spots';scene.add(root);
 const geometries:T.BufferGeometry[]=[],materials:T.Material[]=[],textures:T.Texture[]=[];
 // The Deep Sea Boat has no post: its prompt floats over the rod holders (./deepSeaBoatData.ts).
 const kioskAt=(s:FishSpot)=>{if(s.boat)return {x:s.boat.prompt.x,z:s.boat.prompt.z};const dx=s.buoy.x-s.x,dz=s.buoy.z-s.z,l=Math.hypot(dx,dz)||1;return {x:s.x+(-dz/l)*KIOSK_OFFSET,z:s.z+(dx/l)*KIOSK_OFFSET};};
 // One merged, vertex-coloured mesh for every fishing post.
 const all:T.BufferGeometry[]=[];
 for(const s of FISH_SPOTS){if(s.boat)continue;const k=kioskAt(s);for(const part of kioskParts(s.id==='north-rocks'||s.id==='west-cove')){const g=paint(part);g.applyMatrix4(new T.Matrix4().makeRotationY(Math.PI/4));g.translate(k.x,0,k.z);all.push(g);}}
 const merged=mergeGeometries(all)!;all.forEach(g=>g.dispose());geometries.push(merged);
 const kioskMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:.85});materials.push(kioskMaterial);
 const kiosks=new T.Mesh(merged,kioskMaterial);kiosks.name='fishing-posts';kiosks.castShadow=true;kiosks.receiveShadow=true;kiosks.matrixAutoUpdate=false;kiosks.updateMatrix();root.add(kiosks);
 // Floats: red over white, one instanced draw.
 const floatGeo=mergeGeometries([paint({geometry:new T.SphereGeometry(.26,10,6,0,Math.PI*2,0,Math.PI/2),color:'#e0513f'}),paint({geometry:new T.SphereGeometry(.26,10,6,0,Math.PI*2,Math.PI/2,Math.PI/2),color:'#fff3df'}),paint({geometry:new T.CylinderGeometry(.03,.03,.4,5).translate(0,.4,0),color:'#294f43'})])!;geometries.push(floatGeo);
 const floatMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:.5});materials.push(floatMaterial);
 const floats=new T.InstancedMesh(floatGeo,floatMaterial,FISH_SPOTS.length);floats.name='fishing-floats';floats.frustumCulled=false;
 const m=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),one=new T.Vector3(1,1,1);
 const hideFloat=(i:number,hidden:boolean)=>{if(i<0)return;if(hidden)floats.setMatrixAt(i,m.makeScale(0,0,0));else setFloat(i,0,0);floats.instanceMatrix.needsUpdate=true;};
 const setFloat=(i:number,bob:number,tilt:number)=>{const b=FISH_SPOTS[i].buoy;q.setFromEuler(e.set(tilt,0,tilt*.6));floats.setMatrixAt(i,m.compose(v.set(b.x,-.36+bob,b.z),q,one));};
 FISH_SPOTS.forEach((_,i)=>setFloat(i,0,0));floats.instanceMatrix.needsUpdate=true;root.add(floats);
 // One ripple ring, shown only around the active spot's float.
 const rippleGeo=new T.RingGeometry(.55,.7,28);rippleGeo.rotateX(-Math.PI/2);geometries.push(rippleGeo);
 const rippleMaterial=new T.MeshBasicMaterial({color:'#e9fbf4',transparent:true,opacity:0,depthWrite:false});materials.push(rippleMaterial);
 const ripple=new T.Mesh(rippleGeo,rippleMaterial);ripple.name='fishing-ripple';ripple.visible=false;ripple.raycast=()=>{};root.add(ripple);
 // Market stand: a "we buy" sign and a fish crate on the existing stall (no new footprint, no new collision).
 const signTex=signTexture();textures.push(signTex);
 const signMaterial=new T.MeshStandardMaterial({map:signTex,roughness:.8});materials.push(signMaterial);
 // Two meshes at the stand: the printed sign (front + rear planes) and one vertex-coloured frame + fish crate.
 const signGeo=mergeGeometries([new T.PlaneGeometry(5.6,1.05).translate(0,0,.06),new T.PlaneGeometry(5.6,1.05).rotateY(Math.PI).translate(0,0,-.06)])!;signGeo.translate(MARKET_STAND.x,4.4,MARKET_STAND.z+4.25);geometries.push(signGeo);
 root.add(Object.assign(new T.Mesh(signGeo,signMaterial),{name:'market-stand-sign'}));
 const standParts:T.BufferGeometry[]=[paint({geometry:new T.BoxGeometry(5.7,1.15,.08).translate(MARKET_STAND.x,4.4,MARKET_STAND.z+4.25),color:'#294f43'}),paint({geometry:new T.BoxGeometry(.9,.2,1.1).translate(MARKET_STAND.x-2,1.1,MARKET_STAND.z-1.5),color:'#8fb3c2'})];
 for(const post of [-2.6,2.6])standParts.push(paint({geometry:new T.CylinderGeometry(.05,.05,1.2,6).translate(MARKET_STAND.x+post,3.75,MARKET_STAND.z+4.25),color:'#294f43'}));
 for(let n=0;n<4;n++)standParts.push(paint({geometry:place(new T.IcosahedronGeometry(.16,0),MARKET_STAND.x-2+(n%2-.5)*.34,1.28,MARKET_STAND.z-1.5+(Math.floor(n/2)-.5)*.46,0,.3*n,0,[1.8,.6,.8]),color:['#6f8fa6','#3f7a78','#9b8a5e','#c9655a'][n]}));
 const standGeo=mergeGeometries(standParts)!;standParts.forEach(g=>g.dispose());geometries.push(standGeo);
 root.add(Object.assign(new T.Mesh(standGeo,kioskMaterial),{name:'market-stand-frame'}));
 root.traverse(o=>{if(o!==kiosks&&o!==floats){o.matrixAutoUpdate=false;o.updateMatrix();}});

 // Glows reuse the island's building outline effect: one travelling glow for the posts, one for the stand.
 const spotGlowRoot=new T.Group();spotGlowRoot.name='fishing-spot-selection';spotGlowRoot.rotation.y=Math.PI/4;scene.add(spotGlowRoot);
 const spotGlow=createBuildingGlow(spotGlowRoot,1.2,.7,2.9,'cabinet');
 const standGlowRoot=new T.Group();standGlowRoot.name='market-stand-selection';standGlowRoot.position.set(MARKET_STAND.x,0,MARKET_STAND.z);standGlowRoot.scale.set(7.8/8.4,4/4.74,9.2/17.4);scene.add(standGlowRoot);
 const standGlow=createBuildingGlow(standGlowRoot,8.4,17.4,4.7,'ferry');
 const kioskBoxes=FISH_SPOTS.map(s=>{if(s.boat)return new T.Box3(new T.Vector3(BOAT_AFLOAT.x0,-.4,BOAT_AFLOAT.z0),new T.Vector3(BOAT_AFLOAT.x1,3,BOAT_AFLOAT.z1));const k=kioskAt(s);return new T.Box3(new T.Vector3(k.x-1.2,0,k.z-1.2),new T.Vector3(k.x+1.2,3.3,k.z+1.2));});
 const standBox=new T.Box3(new T.Vector3(MARKET_STAND.x-3.8,0,MARKET_STAND.z-4.6),new T.Vector3(MARKET_STAND.x+3.8,5.1,MARKET_STAND.z+4.6));
 const hit=new T.Vector3(),anchor=new T.Vector3();
 let glowSpot=-1,hoverKind='',hoverSpot=-1,hoverUntil=0,bobbing=false,lastHover=-1;
 const rippleAge={t:0};
 // The moored Deep Sea Boat: built only near it, one merged mesh, registers its aft deck as a landable floor.
 const boat=createDeepSeaBoat(scene);

 function update(c:FishingUpdate){
  boat.update(c);
  // Nearest spot within reach (on foot) — the only work when the player is away from the water.
  let near=-1,nearD=SPOT_REACH,closestFloat=Infinity;
  for(let i=0;i<FISH_SPOTS.length;i++){const s=FISH_SPOTS[i],d=Math.hypot(c.x-s.x,c.z-s.z);if(d<nearD&&(!s.boat||boat.deck)){near=i;nearD=d;}closestFloat=Math.min(closestFloat,Math.hypot(c.x-s.buoy.x,c.z-s.buoy.z));}
  if(!c.onFoot||!c.canEnter)near=-1;
  // ---- Live fishing session ----
  // ---- Live fishing: the state machine drives the camera and the (swappable) visuals ----
  if(driver&&session)near=driver(c,near);
  const nearStand=c.onFoot&&c.canEnter&&Math.abs(c.x-MARKET_STAND.front.x)<4.2&&Math.abs(c.z-MARKET_STAND.z)<4.6;
  // Desktop hover, like buildings: pointing at a post or the stall shows its prompt from a distance.
  let overSpot=-1,overStand=false;
  if(c.ray&&c.canEnter){
   let best=Infinity;
   for(let i=0;i<kioskBoxes.length;i++)if(c.ray.ray.intersectBox(kioskBoxes[i],hit)){const d=hit.distanceToSquared(c.ray.ray.origin);if(d<best){best=d;overSpot=i;}}
   if(c.ray.ray.intersectBox(standBox,hit)&&hit.distanceToSquared(c.ray.ray.origin)<best){overStand=true;overSpot=-1;}
  }
  if(overSpot>=0){hoverKind='spot';hoverSpot=overSpot;hoverUntil=c.now+450;}else if(overStand){hoverKind='stand';hoverUntil=c.now+450;}
  const fishPrompt=c.ui<HTMLButtonElement>('[data-fish-enter]'),standPrompt=c.ui<HTMLButtonElement>('[data-market-enter]');
  const lingerSpot=!c.mobile&&c.canEnter&&(hoverKind==='spot'&&c.now<hoverUntil||!!fishPrompt?.matches(':hover'))?hoverSpot:-1;
  const lingerStand=!c.mobile&&c.canEnter&&(hoverKind==='stand'&&c.now<hoverUntil||!!standPrompt?.matches(':hover'));
  let activeSpot=fishing?-1:near>=0?near:lingerSpot,activeStand=!fishing&&(nearStand||lingerStand);
  if(c.blocked){activeSpot=-1;activeStand=false;}else if(activeSpot>=0&&activeStand)activeStand=false;
  // Prompts.
  const show=(el:HTMLButtonElement|null|undefined,visible:boolean,x:number,y:number,z:number)=>{
   if(!el)return;let hidden=!visible;
   if(!hidden){anchor.set(x,y,z).project(c.camera);hidden=anchor.z< -1||anchor.z>1;if(!hidden)c.place(el,T.MathUtils.clamp((anchor.x+1)*c.width/2,75,c.width-75),T.MathUtils.clamp((1-anchor.y)*c.height/2,90,c.height-160));}
   c.hide(el,hidden);
  };
  if(fishPrompt){
   const s=FISH_SPOTS[activeSpot];
   if(s&&fishPrompt.dataset.spot!==s.id){fishPrompt.dataset.spot=s.id;fishPrompt.setAttribute('aria-label',`Fish at ${s.name}`);}
   // The Fish prompt needs you at the water's edge (hovering from afar only highlights the post).
   const k=s?kioskAt(s):null;show(fishPrompt,!!s&&activeSpot===near,k?.x??0,s?.boat?.prompt.y??3.6,k?.z??0);
  }
  show(standPrompt,activeStand,MARKET_STAND.x-1,4.8,MARKET_STAND.z+3);
  // Glows (hidden draws when inactive).
  if(activeSpot>=0&&activeSpot!==glowSpot){const k=kioskAt(FISH_SPOTS[activeSpot]);spotGlowRoot.position.set(k.x,0,k.z);glowSpot=activeSpot;}
  spotGlow.update(activeSpot>=0&&!FISH_SPOTS[activeSpot].boat,c.dt,c.reduced);standGlow.update(activeStand,c.dt,c.reduced);
  // Floats bob only while the player is close enough to see them; reset once on leaving.
  const bob=!c.reduced&&closestFloat<BOB_RANGE;
  if(bob){for(let i=0;i<FISH_SPOTS.length;i++){const b=FISH_SPOTS[i].buoy;if(i!==liveSpot&&Math.hypot(c.x-b.x,c.z-b.z)<BOB_RANGE)setFloat(i,Math.sin(c.elapsed*1.8+i*1.7)*.05,Math.sin(c.elapsed*1.3+i)*.08);}floats.instanceMatrix.needsUpdate=true;}
  else if(bobbing){FISH_SPOTS.forEach((_,i)=>{if(i!==liveSpot)setFloat(i,0,0);});floats.instanceMatrix.needsUpdate=true;}
  bobbing=bob;
  const rip=near>=0&&!c.reduced;
  if(rip){const b=FISH_SPOTS[near].buoy;rippleAge.t=(rippleAge.t+Math.min(c.dt,.05)*.55)%1;ripple.position.set(b.x,-.4,b.z);ripple.scale.setScalar(.7+rippleAge.t*1.6);rippleMaterial.opacity=.5*(1-rippleAge.t);ripple.updateMatrix();}
  if(ripple.visible!==rip)ripple.visible=rip;
  const hoverKey=overSpot>=0?overSpot:overStand?99:-1,hoverStarted=hoverKey>=0&&hoverKey!==lastHover;lastHover=hoverKey;
  return {hovered:hoverKey>=0,hoverStarted};
 }
 return {update,spots:FISH_SPOTS,
  /** Call right after the follow camera is placed (like vending.applyCamera): eases to the low shoreline shot while fishing. */
  applyCamera:(camera:T.PerspectiveCamera,dt:number,reduced:boolean)=>cam.apply(camera,dt,reduced),
  dispose(){boat.dispose();visuals?.dispose();visuals=null;spotGlow.dispose();standGlow.dispose();spotGlowRoot.removeFromParent();standGlowRoot.removeFromParent();root.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(mat=>mat.dispose());textures.forEach(t=>t.dispose());floats.dispose();}};
}
