import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createBuildingGlow} from '../../graphics/buildingGlow';
import {FISH_SPOTS,MARKET_STAND,type FishSpot} from './fishCatalog';
import type {FishingVisuals} from './fishingVisuals';
// Lazy-load pass (Oct 7 2026, docs/performance-guide.md): the angler/shoreline art (fishingVisuals.ts) and the caught-animal models
// (fishModels.ts) are not in the boot bundle. Their chunk is fetched once the player is within VISUALS_PREFETCH m of a spot, well
// before the 45 m at which the visuals are built; if a session starts first, the visuals join it as soon as the chunk lands.
const VISUALS_PREFETCH=100;
let visualsModule:typeof import('./fishingVisuals')|null=null,visualsLoading:Promise<void>|null=null;
const loadFishingVisuals=()=>{visualsLoading??=import('./fishingVisuals').then(m=>{visualsModule=m;},()=>{visualsLoading=null;});return visualsLoading;};
import {createFishingCamera} from './fishingCamera';
import {buildKioskGeometry,kioskVariant} from './fishingKiosk';
import {CAST_TIME,castPoint,planApproach,stepSession,type SessionEvent} from './fishingCore';
import {fishById} from './fishCatalog';
import {createDeepSeaBoat} from './deepSeaBoat';
import {DEEP_SEA_BOATS,boatBySpot} from './deepSeaBoatData';
import {aimCharge,type FishingSessionApi} from './fishingSession';
import {aimArea,aimPolar,clampAim,hotAt,hotspotSeed,planHotspots,quickCast,rememberCast,spookAt,HOTSPOT_RESEED,type AimArea,type CastMark,type Hotspot,type Landing} from './fishingAim';

/**
 * Fishing props on the island + the "Fish" / "Sell" prompts (docs/fishing.md).
 *
 * Heat budget: every fishing post (12 since Oct 5 2026: 6 main island, 3 causeway, 3 Coral Cay) is in ONE merged static mesh
 * (one draw, one shadow draw), the floats are one InstancedMesh (one draw), and the shared glow + ripple are hidden unless
 * the player is at a spot. Per frame, when the player is not near the water, update() is a distance check over the spots
 * (13 points) and nothing else: no matrix writes, no
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
/** Bottom of the fishing status card plus a gap on wide screens (FishingHost.module.css .message: top 88px, one line). */
const CATCH_MESSAGE_BOTTOM=88+48+10;
/** Phones: the catch card's bottom edge sits this far above the screen's bottom (the reel: 160 px + 28 px + a gap; safe area added by CSS). */
const CATCH_DOCK_BOTTOM=200;
type Colored={geometry:T.BufferGeometry;color:string};
function paint({geometry,color}:Colored){
 const g=geometry.index?geometry.toNonIndexed():geometry.clone();geometry.dispose();
 g.deleteAttribute('uv');const c=new T.Color(color),count=g.getAttribute('position').count,colors=new Float32Array(count*3);
 for(let i=0;i<count;i++){colors[i*3]=c.r;colors[i*3+1]=c.g;colors[i*3+2]=c.b;}
 g.setAttribute('color',new T.BufferAttribute(colors,3));return g;
}
const place=(g:T.BufferGeometry,x:number,y:number,z:number,rx=0,ry=0,rz=0,s:[number,number,number]=[1,1,1])=>g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(...s)));

/** A small "fishing post": tackle chest, notice board with a fish emblem, a little roof and two rods (matches the cabinet glow);
 *  each post gets its own deterministic look in ./fishingKiosk.ts. */
/** Where a fishing post's kiosk (the little bait/fish stall) stands: beside the standing spot, square to the cast. */
function kioskAt(s:FishSpot){if(s.boat)return {x:s.boat.prompt.x,z:s.boat.prompt.z};const dx=s.buoy.x-s.x,dz=s.buoy.z-s.z,l=Math.hypot(dx,dz)||1;return {x:s.x+(-dz/l)*KIOSK_OFFSET,z:s.z+(dx/l)*KIOSK_OFFSET};}
/** Solid footprints for every kiosk (Sep 30 2026: players walked straight through them). The cabinet is 1.2 × 0.7 m turned 45°,
 *  so its axis-aligned box is ≈1.34 m square; the standing spot (2.1 m away) stays clear. Pushed into world.obstacles in Town.tsx
 *  before the collision grids are built, so walking, rides and the ball all stop at the stall. */
export function fishingKioskObstacles():{x:number;z:number;w:number;d:number}[]{
 const c=Math.SQRT1_2,size=(1.2+.7)*c;return FISH_SPOTS.filter(s=>!s.boat).map(s=>{const k=kioskAt(s);return {x:k.x,z:k.z,w:size,d:size};});
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
export function createFishingWorld(scene:T.Scene,player?:T.Object3D,session?:FishingSessionApi,renderer?:T.WebGLRenderer){
 // The fight's look for the visuals (one object, rewritten in place) and the last values written onto the HUD's arc.
 let lookSeen=-1;
 const fightLook={tension:0,lateral:{x:0,z:0},running:false,stun:0},arcShown={t:-1,p:-1};
 /** The deep-sea boat the player is fishing from (null on shore). */
 const liveBoat=()=>liveSpot>=0&&FISH_SPOTS[liveSpot].boat?boatOf.get(FISH_SPOTS[liveSpot].id)??null:null;
 const cam=createFishingCamera();let liveSpot=-1,visuals:FishingVisuals|null=null,fishing=false,stand={x:0,z:0},cast:Landing=castPoint(FISH_SPOTS[0],FISH_SPOTS[0]);const labelPoint=new T.Vector3();
 // Aimed casting (Oct 14 2026, fishingAim.ts): the aim area, this session's hotspots (re-placed every few minutes), the aim
 // preview, the recent casts (spooked water) and the session clock for the hotspots' drift. All per session, none at rest.
 let area:AimArea|null=null,hotspots:Hotspot[]=[],hotBucket=-1,sessionNo=0,aimLanding:Landing|null=null,clock=0;const castMarks:CastMark[]=[];
 const aimRay=new T.Raycaster(),aimPlane=new T.Plane(new T.Vector3(0,1,0),.43),aimHit=new T.Vector3(),aimNdc=new T.Vector2();
 const replanHotspots=(s:FishSpot,nowS:number)=>{if(!area)return;hotBucket=Math.floor(nowS/HOTSPOT_RESEED);hotspots=planHotspots(s,area,hotspotSeed(s.id,nowS,sessionNo));visuals?.setHotspots?.(hotspots);};
 /** A cast just started: where it lands (aimed or quick), and what the water there is like (hotspot, spooked). */
 /** Where an aim input lands (a screen point is cast onto the sea plane through the camera), clamped to the spot's water. */
 const landingFor=(input:NonNullable<FishingSessionApi['aimInput']>,camera:T.Camera):Landing|null=>{if(!area)return null;
  if(input.kind==='polar')return clampAim(area,aimPolar(area,input.u,input.charge!==undefined?aimCharge(performance.now()-input.charge):input.v));
  aimNdc.set(input.x,input.y);aimRay.setFromCamera(aimNdc,camera);return aimRay.ray.intersectPlane(aimPlane,aimHit)?clampAim(area,{x:aimHit.x,z:aimHit.z}):null;};
 const landCast=(api:FishingSessionApi,s:FishSpot,nowS:number,camera:T.Camera)=>{if(!area)return;
  const aimed=api.takeAimedCast();cast=(aimed&&landingFor(aimed,camera))||quickCast(area,Math.random);aimLanding=null;
  const hot=hotAt(hotspots,cast.x,cast.z,clock),spook=spookAt(castMarks,cast.x,cast.z,nowS);rememberCast(castMarks,cast.x,cast.z,nowS);
  api.session.mods={hot,spook};api.setWater(spook>=.3?'spooked':hot>=.3?'hot':'calm');visuals?.setCast?.(cast,cast.dir);};
 /** Near a spot (45 m) or fishing: the visuals exist; 80 m away and idle: they are disposed (docs/fishing-visuals-HANDOFF.md). */
 let catchLabelHeight=0;
 const nearAnySpot=(x:number,z:number,r:number)=>FISH_SPOTS.some(s=>Math.abs(x-s.x)<r&&Math.abs(z-s.z)<r);
 const makeVisuals=()=>{if(visualsModule&&player)return visualsModule.createFishingVisuals(scene,player,renderer);void loadFishingVisuals();return null;};
 const beat=(e:SessionEvent)=>{if(!visuals)return;if(e==='run')visuals.splash('small');else if(e==='leap')visuals.splash('hook');else if(e==='slip')visuals.nibble();if(e==='splash')visuals.splash('land');else if(e==='reel')visuals.nibble();else if(e==='nibble')visuals.nibble();else if(e==='bite')visuals.splash('bite');else if(e==='hooked')visuals.splash('hook');else if(e==='scared'||e==='escaped')visuals.splash('small');};
 const stopFishing=(api:FishingSessionApi)=>{liveBoat()?.ride(false);cam.ride(0);fishing=false;cam.end();visuals?.end();api.end();hideFloat(liveSpot,false);liveSpot=-1;area=null;hotspots=[];aimLanding=null;};
 const driver=player&&session?(c:FishingUpdate,near:number):number=>{
  // Paused under the Fishbook / market stand: the island renders one last frame after the player rig has re-posed,
  // so re-apply the frozen angler pose (arms, rod, line) with no time step instead of skipping it (the character used to snap).
  // Leaving ends the session BEFORE the pause check (Oct 15 2026, user: "fishing hud is showing when flying"): a stop, a walk
  // away, any ride / launch / teleport / water (onFoot false) ends it even under a dialog or the balances. canEnter only counts
  // unpaused: the Fishbook / stand / balances themselves make it false (Town's settingsRef) and must not end the session.
  if(fishing&&(session.takeStop()||Math.hypot(c.x-stand.x,c.z-stand.z)>1.3||!c.onFoot||!c.canEnter&&!session.paused))stopFishing(session);
  // The HUD only lives while THIS world fishes: a session left active by a previous world (a Fast Refresh / remount of Town
  // while fishing, "it happened when i was in the water and it refreshed") is ended here instead of floating over the island.
  if(!fishing&&session.getView().active)session.end();
  if(session.paused){if(fishing&&visuals)visuals.frame(0,c.elapsed,c.reduced);return near;}
  const pending=session.takePending();
  if(pending&&!fishing){const i=FISH_SPOTS.findIndex(s=>s.id===pending),s=FISH_SPOTS[i];
   if(s&&near===i){liveSpot=i;fishing=true;stand={x:c.x,z:c.z};area=aimArea(s,stand,c.height>c.width);cast=area.base;session.begin(s.id);hideFloat(i,true);
    sessionNo++;clock=0;aimLanding=null;liveBoat()?.ride(true);
    visuals??=makeVisuals();visuals?.begin(stand,cast,cast.dir);visuals?.setLook?.(session.look);lookSeen=session.lookRev;replanHotspots(s,c.now/1000);
    // The camera eases in and the player aims the first cast (Oct 14 2026: no automatic first throw any more).
    cam.begin(stand,cast.dir,cast.distance,undefined,s.camera);}}
  const events:SessionEvent[]=[];
  if(fishing){
   if(session.takeStop())stopFishing(session);
   else{const o=session.options;if(session.session.phase==='reeling')session.tickSpin(c.now);/* the finger's spin rate fades once it stops */
    events.push(...stepSession(session.session,FISH_SPOTS[liveSpot],c.dt,Math.random,{easy:c.reduced,out:cast.dir,approach:(r,f)=>planApproach(cast,r,f),lure:o.lure,roll:session.catchRoll??undefined}));if(events.length||session.session.phase==='reeling')session.handle(events);}
  }else session.takeStop();
  const taps=session.drainTapEvents();events.push(...taps);
  if(fishing){const s=FISH_SPOTS[liveSpot],nowS=c.now/1000,ph=session.session.phase;clock+=c.dt;
   // A lure (or float skin) chosen mid-session recolours the float within a frame: setLook bumps lookRev.
   if(session.lookRev!==lookSeen){lookSeen=session.lookRev;visuals?.setLook?.(session.look);}
   if(Math.floor(nowS/HOTSPOT_RESEED)!==hotBucket&&ph!=='approach'&&ph!=='nibble'&&ph!=='bite'&&ph!=='reeling')replanHotspots(s,nowS);
   // Aim preview: the HUD's input (a point on the screen, or a polar aim) clamped to the spot's water.
   const input=session.aimInput;aimLanding=input&&(ph==='ready'||ph==='caught')?landingFor(input,c.camera):null;
   visuals?.setAim?.(aimLanding);visuals?.setClock?.(clock);
   if(taps.includes('cast'))landCast(session,s,nowS,c.camera);
   if(taps.includes('cast'))liveBoat()?.kick();}
  // The fight (Oct 15 2026): its live values go straight onto the HUD's reel as CSS variables (no React render per frame) and to
  // the visuals; a run leans the boat and pulls the fish sideways. Screen right in the world is the camera's right vector on the water.
  const meter=fishing?session.fightMeter:null,arc=meter?c.ui<HTMLElement>('[data-fish-fight]'):null;
  if(meter){const e=c.camera.matrixWorld.elements,rl=Math.hypot(e[0],e[2])||1,rx=e[0]/rl,rz=e[2]/rl,amp=1.3*meter.side;
   fightLook.tension=meter.tension;fightLook.lateral.x=rx*amp;fightLook.lateral.z=rz*amp;fightLook.running=meter.running;fightLook.stun=meter.stun;
   if(arc&&(Math.abs(meter.tension-arcShown.t)>.004||Math.abs(meter.progress-arcShown.p)>.004)){arcShown.t=meter.tension;arcShown.p=meter.progress;arc.style.setProperty('--tension',meter.tension.toFixed(3));arc.style.setProperty('--progress',meter.progress.toFixed(3));}}
  else if(arcShown.t>=0){arcShown.t=arcShown.p=-1;}
  liveBoat()?.lean(meter?meter.side:0);
  // Visuals lifecycle + drive (no logic in the visuals; they only show the current state).
  const around=fishing||nearAnySpot(c.x,c.z,45);
  if(!visualsModule&&nearAnySpot(c.x,c.z,VISUALS_PREFETCH))void loadFishingVisuals();
  if(!visuals&&around){visuals=makeVisuals();if(visuals&&fishing){visuals.begin(stand,cast,cast.dir);visuals.setLook?.(session.look);visuals.setHotspots?.(hotspots);}}
  if(visuals&&!fishing&&!visuals.busy&&!nearAnySpot(c.x,c.z,80)){visuals.dispose();visuals=null;}
  if(visuals){
   visuals.setCoastVisible(around);
   if(fishing){const s=session.session,ph=s.phase;
    visuals.setPose(ph==='caught'?'holdUp':ph==='casting'?(s.t<.25?'windup':'cast'):ph==='bite'||ph==='reeling'&&s.dip>.1?'strike':'hold');
    visuals.setBobber(ph==='ready'?{kind:'hanging'}:ph==='casting'?{kind:'flying',progress:s.t/CAST_TIME}:ph==='reeling'?{kind:'reeling',progress:s.reelTaps/Math.max(1,s.reelTarget)}:ph==='bite'?{kind:'under'}:ph==='caught'?{kind:'hidden'}:{kind:'floating'});
    const f=s.fish?fishById(s.fish.id):undefined;
    visuals.showShadow(s.shadow&&f?{size:f.shadow,pos:{x:s.shadow.x,z:s.shadow.z},heading:s.shadow.heading+(ph==='scared'||ph==='escaped'?Math.PI:0),alpha:s.shadow.alpha,shape:f.shape,id:f.id,color:f.color,mode:ph==='nibble'||ph==='bite'?ph:ph==='scared'||ph==='escaped'?'flee':'swim'}:null);
    visuals.setReelingFish(ph==='reeling'&&f&&s.fish?{color:f.color,lengthCm:s.fish.size,shape:f.shape,id:f.id}:null);
    visuals.setFight?.(meter?fightLook:null);
    visuals.holdUpFish(ph==='caught'&&f&&s.fish?{color:f.color,lengthCm:s.fish.size,shape:f.shape,id:f.id}:null);
    for(const e of events)beat(e);}
   if(visuals.busy)visuals.frame(c.dt,c.elapsed,c.reduced);
  }
  if(fishing)cam.ride(liveBoat()?.motion.heave??0);
  const label=c.ui<HTMLElement>('[data-fish-catch]');
  if(label){const show=fishing&&!!visuals&&session.session.phase==='caught';
   if(show){visuals!.labelAnchor(labelPoint).project(c.camera);const narrow=c.width<560,px=(labelPoint.x+1)*c.width/2,py=(1-labelPoint.y)*c.height/2;
    // Beside the angler (the held-up fish stays visible); on narrow phones, docked just above the big reel (160 px at bottom
    // 28 px + safe area, see FishingHost.module.css .controls) so it never covers the angler or the reel.
    // QA11 D-2: beside the angler the card is centred on the fish, so its top must clear the status card ("Lanternfish! Keep
    // fishing or stop.", top 88px + one ~46px line, FishingHost.module.css): its height is read once per catch (not per frame).
    if(!narrow&&!catchLabelHeight&&label.dataset.dismissed===undefined)catchLabelHeight=label.offsetHeight;
    const minY=Math.max(150,CATCH_MESSAGE_BOTTOM+catchLabelHeight/2);
    label.dataset.side=narrow?'dock':'right';c.place(label,narrow?c.width/2:T.MathUtils.clamp(px+46,16,c.width-330),narrow?c.height-CATCH_DOCK_BOTTOM:Math.max(minY,Math.min(py,c.height-150)));}
   else catchLabelHeight=0;
   c.hide(label,!show);}
  return fishing?-1:near;
 }:null;
 const root=new T.Group();root.name='fishing-spots';scene.add(root);
 const geometries:T.BufferGeometry[]=[],materials:T.Material[]=[],textures:T.Texture[]=[];
 // The Deep Sea Boat has no post: its prompt floats over the rod holders (./deepSeaBoatData.ts).
 // One merged, vertex-coloured mesh for every fishing post.
 const all:T.BufferGeometry[]=[];
 // Each post has its own deterministic look (./fishingKiosk.ts, Oct 26 2026): same cabinet/footprint, still merged into this one mesh.
 for(const s of FISH_SPOTS){if(s.boat)continue;const k=kioskAt(s);all.push(buildKioskGeometry(kioskVariant(s.id),k.x,k.z,Math.PI/4));}
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
 const kioskBoxes=FISH_SPOTS.map(s=>{const a=s.boat?boatBySpot(s.id)?.afloat:null;if(a)return new T.Box3(new T.Vector3(a.x0,-.4,a.z0),new T.Vector3(a.x1,3,a.z1));const k=kioskAt(s);return new T.Box3(new T.Vector3(k.x-1.2,0,k.z-1.2),new T.Vector3(k.x+1.2,3.3,k.z+1.2));});
 const standBox=new T.Box3(new T.Vector3(MARKET_STAND.x-3.8,0,MARKET_STAND.z-4.6),new T.Vector3(MARKET_STAND.x+3.8,5.1,MARKET_STAND.z+4.6));
 const hit=new T.Vector3(),anchor=new T.Vector3();
 let glowSpot=-1,hoverKind='',hoverSpot=-1,hoverUntil=0,bobbing=false,lastHover=-1;
 const rippleAge={t:0};
 // The moored Deep Sea Boats: each built only near it (one shared merged mesh), registering its aft deck as a landable floor.
 const boats=DEEP_SEA_BOATS.map(b=>createDeepSeaBoat(scene,b)),boatOf=new Map(boats.map(b=>[b.boat.spotId as string,b]));

 function update(c:FishingUpdate){
  for(const b of boats)b.update(c);
  // Nearest spot within reach (on foot) — the only work when the player is away from the water.
  let near=-1,nearD=SPOT_REACH,closestFloat=Infinity;
  for(let i=0;i<FISH_SPOTS.length;i++){const s=FISH_SPOTS[i],d=Math.hypot(c.x-s.x,c.z-s.z);if(d<nearD&&(!s.boat||boatOf.get(s.id)?.deck)){near=i;nearD=d;}closestFloat=Math.min(closestFloat,Math.hypot(c.x-s.buoy.x,c.z-s.buoy.z));}
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
  // What would show if nothing else held the HUD focus (lib/ui/hudStack.ts arbitrates; `blocked` is its answer).
  const wantsFish=activeSpot>=0&&activeSpot===near,wantsSell=!wantsFish&&activeStand,wantsDistance=wantsFish?nearD:wantsSell?(nearStand?Math.hypot(c.x-MARKET_STAND.front.x,c.z-MARKET_STAND.front.z):-1):Infinity;
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
  return {hovered:hoverKey>=0,hoverStarted,wants:(wantsFish?'fish':wantsSell?'sell':null) as 'fish'|'sell'|null,wantsDistance};
 }
 return {update,spots:FISH_SPOTS,
  /** A session is on and its camera has arrived: Town freezes the background (lib/graphics/focusMode.ts). */
  get focused(){return fishing&&cam.arrived;},
  /** Where the angler stands (valid while `focused`). */
  get stand(){return stand;},
  /** Call right after the follow camera is placed (like vending.applyCamera): eases to the low shoreline shot while fishing. */
  applyCamera:(camera:T.PerspectiveCamera,dt:number,reduced:boolean)=>cam.apply(camera,dt,reduced),
  dispose(){if(fishing&&session)stopFishing(session);else if(session?.getView().active)session.end();boats.forEach(b=>b.dispose());visuals?.dispose();visuals=null;spotGlow.dispose();standGlow.dispose();spotGlowRoot.removeFromParent();standGlowRoot.removeFromParent();root.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(mat=>mat.dispose());textures.forEach(t=>t.dispose());floats.dispose();}};
}
