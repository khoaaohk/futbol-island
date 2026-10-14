/**
 * Summit Isle activities runtime (Oct 12 2026): the Sunset Kick challenge's hoops and the lookout telescope's eyepiece view.
 * Rules: lib/town/summitKick.ts and lib/town/telescope.ts; static props (start post, telescope stand): summitActivitiesWorld.ts;
 * HUDs: components/SummitKickHud.tsx and components/TelescopeView.tsx (they talk through lib/town/summitStore.ts).
 *
 * Heat: everything here is built on demand and disposed when it ends. While nothing is on, Town's calls cost a few comparisons:
 *  - update(): two distances to the start post and the stand (prompts), and a glint check only when a spotted glint waits
 *    to be collected (≤ 5 distances);
 *  - ball() / aim() / holdPlayer(): one phase check.
 * A round adds 5 hoop meshes (one shared geometry and material) and a chalk line, animated only while the round runs. The
 * telescope reuses Town's renderer and camera (narrower FOV, a longer far plane while it is up; the frame cap is untouched) and
 * adds 5 glint sprites that exist only while you look through it. No timers, no rAF of its own, no network but the one board
 * session request when a round starts.
 */
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {kickLayout,createKickRound,kickCoins,recordKickRound,sanitizeKickSave,behindLine,onKickPitch,HOOP_COUNT,KICK_RULES,KICK_RUN_PREFIX,KICK_PERFECT_REWARD,KICK_SAVE_KEY,type KickLayout,type KickRound,type KickHoop,type KickVec} from '../town/summitKick';
import {telescopeSpot,TELESCOPE_GLINTS,TELESCOPE_LANDMARKS,GLINT_COUNT,SCOPE,aimAt,viewDir,centredLandmark,centredGlint,panByDrag,panByStick,glintAt,spotGlint,collectGlint,seeLandmark,pendingGlints,glintRewardId} from '../town/telescope';
import {readTelescope,writeTelescope} from '../town/telescopeProgress';
import {kickStore,scopeStore,installSummitActions} from '../town/summitStore';
import {creditRun,creditOnce} from '../arcade/arcadeWallet';
import {beginBoardSession} from '../arcade/boardClient';
import {createLearnCoins,LEARN_COINS_EARNED} from '../town/learnCoins';

/** Start prompts show within this many metres of the post / stand (on foot). */
const REACH=3.4;
type Ports={
 /** Puts the player on the kick spot facing the goal, the ball at their feet. */
 teleport:(x:number,z:number,yaw:number)=>void;
 /** A small burst where a hoop pops (Town's ball effects). */
 impact:(x:number,y:number,z:number)=>void;
};
export type SummitUpdate={
 now:number;dt:number;elapsed:number;reduced:boolean;camera:T.Camera;width:number;height:number;
 x:number;z:number;
 /** On foot on the ground (not flying, riding or falling). */
 onFoot:boolean;canEnter:boolean;sunset:boolean;
 /** The HUD arbiter's current 'enter' key (lib/ui/hudStack.ts), so exactly one prompt shows. */
 focusKey:string|null;
 ui:<E extends HTMLElement>(selector:string)=>E|null|undefined;place:(el:HTMLElement,x:number,y:number)=>void;hide:(el:HTMLElement,hidden:boolean)=>void;
};
const cue=(detail:string)=>{if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('fi2-vending-cue',{detail}));};
const learnCoins=createLearnCoins({creditOnce:(id,game,amount,reason)=>creditOnce(id,game,amount,reason),notify:detail=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(LEARN_COINS_EARNED,{detail}));}});
const SUNSET_RING=new T.Color('#ffb04a'),DAY_RING=new T.Color('#ef6a3c'),SPOTTED=new T.Color('#9ff0b8'),GLINT=new T.Color('#fff2b0');

function hoopGeometry(r:number){
 const parts:T.BufferGeometry[]=[];const paint=(g:T.BufferGeometry,c:string)=>{const col=new T.Color(c),n=g.getAttribute('position').count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=col.r;a[i*3+1]=col.g;a[i*3+2]=col.b;}g.setAttribute('color',new T.BufferAttribute(a,3));g.deleteAttribute('uv');g.deleteAttribute('normal');return g.index?g.toNonIndexed():g;};
 // Eight alternating arcs (sunset orange / cream) in the ring's plane (x = 0 after the turn below: the hoop faces ±x).
 for(let i=0;i<8;i++){const g=new T.TorusGeometry(r,.055,6,6,Math.PI/4);g.rotateZ(i*Math.PI/4);parts.push(paint(g,i%2?'#fff3df':'#ffffff'));}
 const merged=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());merged.rotateY(Math.PI/2);return merged;
}
function glintTexture(){
 const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d')!;
 const grad=g.createRadialGradient(32,32,0,32,32,32);grad.addColorStop(0,'rgba(255,255,255,1)');grad.addColorStop(.25,'rgba(255,240,180,.9)');grad.addColorStop(1,'rgba(255,220,120,0)');
 g.fillStyle=grad;g.beginPath();g.arc(32,32,32,0,Math.PI*2);g.fill();
 // Four-point star rays.
 g.fillStyle='rgba(255,255,240,.95)';for(const [w,h] of [[3,30],[30,3]] as const){g.beginPath();g.ellipse(32,32,w,h,0,0,Math.PI*2);g.fill();}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;
}

export function createSummitActivities(scene:T.Scene,ports:Ports){
 // Positions are computed lazily (first prompt check), from the island's shape as it is now.
 let layout:KickLayout|null=null,spot:ReturnType<typeof telescopeSpot>|null=null;
 const ensure=()=>{if(!layout)layout=kickLayout();if(!spot)spot=telescopeSpot();return {layout:layout!,spot:spot!};};
 const anchor=new T.Vector3();

 // ---------------------------------------------------------------------------------------------------- kick challenge
 let phase:'idle'|'intro'|'playing'|'done'='idle',round:KickRound|null=null,roundNo=0,prevMode='',hoopsRoot:T.Group|null=null;
 /** A pending move to the kick spot, and whether the player has reached the pitch since the round began. */
 let teleport:{x:number;z:number;yaw:number}|null=null,onPitch=false;
 let hoopGeo:T.BufferGeometry|null=null,hoopMat:T.MeshBasicMaterial|null=null,lineGeo:T.BufferGeometry|null=null,lineMat:T.MeshBasicMaterial|null=null;
 const hoopMeshes=new Map<string,T.Mesh>(),popAge=new Map<string,number>();
 const prev:KickVec={x:0,y:0,z:0};let pops=0;
 function buildHoops(L:KickLayout){
  disposeHoops();
  hoopGeo=hoopGeometry(KICK_RULES.hoopRadius);hoopMat=new T.MeshBasicMaterial({vertexColors:true,color:SUNSET_RING.clone(),toneMapped:false});
  hoopsRoot=new T.Group();hoopsRoot.name='summit-kick-hoops';
  for(const h of L.hoops){const m=new T.Mesh(hoopGeo,hoopMat);m.name='summit-kick-hoop-'+h.id;m.position.set(h.x,h.y,h.z);m.castShadow=m.receiveShadow=false;hoopsRoot.add(m);hoopMeshes.set(h.id,m);}
  // The chalk line the shots count from (a thin strip across the middle of the pitch).
  lineGeo=new T.PlaneGeometry(.14,9);lineGeo.rotateX(-Math.PI/2);lineMat=new T.MeshBasicMaterial({color:'#fbf3dc',transparent:true,opacity:.85,depthWrite:false});
  const line=new T.Mesh(lineGeo,lineMat);line.name='summit-kick-line';line.position.set(L.lineX,L.ground+.03,L.spot.z);line.renderOrder=1;hoopsRoot.add(line);
  scene.add(hoopsRoot);
 }
 function disposeHoops(){if(hoopsRoot){hoopsRoot.removeFromParent();hoopsRoot=null;}hoopMeshes.clear();popAge.clear();hoopGeo?.dispose();hoopMat?.dispose();lineGeo?.dispose();lineMat?.dispose();hoopGeo=lineGeo=null;hoopMat=lineMat=null;}
 const readSave=()=>{try{return sanitizeKickSave(JSON.parse(localStorage.getItem(KICK_SAVE_KEY)??'null'));}catch{return sanitizeKickSave(null);}};
 const viewOf=()=>{const s=round?.state;return {hits:s?.hits??0,kicks:s?.kicks??0,secondsLeft:Math.ceil(round?.timeLeft??KICK_RULES.seconds)};};
 function startKick(){if(phase!=='idle'||scope.active)return;phase='intro';kickStore.set({phase:'intro',result:null,note:'',hits:0,kicks:0,maxKicks:KICK_RULES.kicks,hoops:HOOP_COUNT,secondsLeft:KICK_RULES.seconds});cue('select');}
 function beginRound(){
  if(phase!=='intro'&&phase!=='done')return;
  const L=ensure().layout;buildHoops(L);round=createKickRound(L,performance.now());roundNo++;prevMode='';
  beginBoardSession('kick');// the play token for the island board, issued as the round starts
  // Applied at the start of the next island tick (holdPlayer), inside the loop like any other move.
  teleport={x:L.spot.x,z:L.spot.z,yaw:L.spot.yaw};onPitch=false;
  phase='playing';kickStore.set({phase:'playing',result:null,note:'Shoot from behind the chalk line (a kick moves you a step closer). Tap Kick for the low hoops, hold Kick a moment for the high ones.',...viewOf(),popped:'',pops});cue('confirm');
 }
 function endKick(){if(phase==='playing')round?.quit();phase='idle';teleport=null;round=null;disposeHoops();kickStore.set({phase:'idle',result:null,note:'',popped:''});}
 function pop(h:KickHoop){
  popAge.set(h.id,0);pops++;ports.impact(h.x,h.y,h.z);cue('pop');try{navigator.vibrate?.(18);}catch{}
  kickStore.set({...viewOf(),popped:h.label,pops,note:round&&round.hoopsLeft>0?`${h.label}! ${round.hoopsLeft} to go.`:''});
 }
 function finishRound(){
  if(!round)return;const s=round.state,end=s.end??'kicks',score=round.score,quit=end==='quit';
  let best=readSave().best,newBest=false;
  if(!quit){const r=recordKickRound(readSave(),{hits:s.hits,score:score.total});newBest=r.newBest;best=r.save.best;try{localStorage.setItem(KICK_SAVE_KEY,JSON.stringify(r.save));}catch{/* private mode */}}
  phase='done';
  const result={end,hits:s.hits,kicks:s.kicks,seconds:Math.round(s.elapsed),score:score.total,hoopPoints:score.hoops,accuracy:score.accuracy,speed:score.speed,best,newBest,coins:0,round:roundNo};
  kickStore.set({phase:'done',result,...viewOf(),note:''});cue(s.hits===HOOP_COUNT?'equip':'confirm');
  const coins=quit?0:kickCoins(s.hits);
  if(coins>0)void creditRun(`${KICK_RUN_PREFIX}${Date.now().toString(36)}-${roundNo}`,'island',coins,`Summit Kick · ${s.hits}/${HOOP_COUNT} hoops`).then(paid=>{const v=kickStore.get();if(v.result&&v.result.round===result.round)kickStore.set({result:{...v.result,coins:paid}});if(paid>0)cue('coin');});
  if(s.hits===HOOP_COUNT)void learnCoins.pay('explore',KICK_PERFECT_REWARD,'Summit Kick: all five hoops');
 }

 // ---------------------------------------------------------------------------------------------------- telescope
 const scope={active:false,yaw:0,pitch:0,zoom:0,blend:1,arrived:false,restore:false,hold:0,holdId:'',label:'',
  start:{p:new T.Vector3(),q:new T.Quaternion(),fov:SCOPE.normalFov as number,far:500},normal:{fov:SCOPE.normalFov as number,far:500}};
 let glintRoot:T.Group|null=null,glintMat:T.SpriteMaterial|null=null,glintTex:T.Texture|null=null,spottedMat:T.SpriteMaterial|null=null;
 const glintSprites=new Map<string,T.Sprite>();
 const aimer=new T.PerspectiveCamera(),eyeV=new T.Vector3(),lookV=new T.Vector3(),targetQ=new T.Quaternion();
 let pending=pendingGlints(readTelescopeSafe());
 function readTelescopeSafe(){try{return readTelescope();}catch{return {version:1 as const,spotted:[],collected:[],seen:[]};}}
 function buildGlints(){
  disposeGlints();const save=readTelescopeSafe();
  glintTex=glintTexture();glintMat=new T.SpriteMaterial({map:glintTex,color:GLINT,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
  spottedMat=glintMat.clone();spottedMat.color=SPOTTED.clone();
  glintRoot=new T.Group();glintRoot.name='telescope-glints';
  for(const g of TELESCOPE_GLINTS){if(save.collected.includes(g.id))continue;const sp=new T.Sprite(save.spotted.includes(g.id)?spottedMat:glintMat);sp.position.set(g.x,g.y,g.z);sp.renderOrder=3;glintRoot.add(sp);glintSprites.set(g.id,sp);}
  scene.add(glintRoot);
 }
 function disposeGlints(){if(glintRoot){glintRoot.removeFromParent();glintRoot=null;}glintSprites.clear();glintMat?.dispose();spottedMat?.dispose();glintTex?.dispose();glintMat=spottedMat=null;glintTex=null;}
 const scopeFound=()=>readTelescopeSafe().spotted.length;
 function openScope(){
  if(scope.active||phase==='playing')return;const {spot:s}=ensure();
  const first=TELESCOPE_LANDMARKS[0],v=aimAt(s.eye,first);
  scope.active=true;scope.yaw=v.yaw;scope.pitch=v.pitch;scope.zoom=0;scope.blend=0;scope.arrived=false;scope.hold=0;scope.holdId='';scope.label='';scope.restore=false;
  buildGlints();
  scopeStore.set({active:true,zoom:0,label:null,spotting:null,found:scopeFound(),total:GLINT_COUNT,note:'Drag (or use the stick) to look around. Find the places, and look for glints!'});
  cue('category');
 }
 function exitScope(){if(!scope.active)return;scope.active=false;scope.restore=true;disposeGlints();scopeStore.set({active:false,label:null,spotting:null,note:''});cue('previous');}
 const fov=()=>SCOPE.fov[scope.zoom]??SCOPE.fov[0];
 function pan(dx:number,dy:number){if(!scope.active)return;const v=panByDrag(scope,dx,dy,fov());scope.yaw=v.yaw;scope.pitch=v.pitch;}
 function zoom(){if(!scope.active)return;scope.zoom=(scope.zoom+1)%SCOPE.fov.length;scopeStore.set({zoom:scope.zoom});cue('select');}
 function spotted(id:string){
  const g=TELESCOPE_GLINTS.find(x=>x.id===id);if(!g)return;const next=spotGlint(readTelescopeSafe(),id);writeTelescope(next);pending=pendingGlints(next);
  const sp=glintSprites.get(id);if(sp&&spottedMat)sp.material=spottedMat;
  const v=scopeStore.get();scopeStore.set({found:next.spotted.length,spotting:null,note:`Glint spotted! ${g.clue} It’s on your map now.`,notes:v.notes+1});cue('equip');
 }

 const off=installSummitActions({startKick,beginRound,exitKick:endKick,openScope,exitScope,pan,zoom});

 return {
  get kickPhase(){return phase;},get scopeActive(){return scope.active;},
  get layout(){return ensure().layout;},get scopeSpot(){return ensure().spot;},
  /** Telescope mode owns the stick and keys (they pan the eyepiece); the player stands still. True = skip the walk this tick. */
  holdPlayer(input:{x:number;z:number;kick:boolean;juggle:boolean;shotPower?:number;charging?:boolean},keys:ReadonlySet<string>,dt:number){
   if(teleport){const t=teleport;teleport=null;ports.teleport(t.x,t.z,t.yaw);}
   if(!scope.active)return false;
   const kx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+input.x,kz=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+input.z;
   if(kx||kz){const v=panByStick(scope,Math.max(-1,Math.min(1,kx)),Math.max(-1,Math.min(1,kz)),dt,fov());scope.yaw=v.yaw;scope.pitch=v.pitch;}
   input.kick=input.juggle=false;input.shotPower=0;input.charging=false;return true;
  },
  /** Tap-shot aim help during a round: toward the nearest low hoop within 18° of the facing (like the pier ring's); null = leave it. */
  aim(p:{x:number;z:number},yaw:number):number|null{
   if(phase!=='playing'||!layout||!round||!behindLine(layout,p.x))return null;
   let best:number|null=null,bestD=18*Math.PI/180;
   for(const h of layout.hoops){if(round.popped.has(h.id)||h.y-layout.ground>1)continue;const a=Math.atan2(h.x-p.x,h.z-p.z),d=Math.abs(Math.atan2(Math.sin(a-yaw),Math.cos(a-yaw)));if(d<bestD){bestD=d;best=a;}}
   return best;
  },
  /** After each walking-ball step: counts kicks (a new shot), tests the ball's path through the hoops, ends a shot. */
  ball(b:{mode:string;x:number;y:number;z:number},kicker:{x:number;z:number}){
   if(phase!=='playing'||!round){prevMode=b.mode;return;}
   const cur={x:b.x,y:b.y,z:b.z};
   if(b.mode==='shot'&&prevMode!=='shot'){const r=round.kick(kicker.x);
    if(r==='close')kickStore.set({note:'Too close! Step back behind the chalk line to shoot.'});
    else if(r==='counted'){kickStore.set({...viewOf(),note:''});const h=round.ball(prev,cur);if(h)pop(h);}}
   else if(b.mode==='shot'){const h=round.ball(prev,cur);if(h)pop(h);}
   if(prevMode==='shot'&&b.mode!=='shot')round.shotOver();
   prev.x=cur.x;prev.y=cur.y;prev.z=cur.z;prevMode=b.mode;
  },
  /** Per frame (Town's HUD block): prompts, the round clock, hoop animation, the eyepiece readout, glint collection. */
  update(c:SummitUpdate):{key:string;distance:number}|null{
   // Glints waiting to be collected: only then any work (a handful of distances).
   if(pending.length&&c.onFoot&&!scope.active){const g=glintAt(readTelescopeSafe(),c.x,c.z);if(g){const next=collectGlint(readTelescopeSafe(),g.id);writeTelescope(next);pending=pendingGlints(next);cue('coin');
    void learnCoins.pay('explore',glintRewardId(g.id),`You found the telescope glint at ${g.name}`);}}
   // ---- the round
   if(phase==='playing'&&round&&layout){
    round.step(c.dt);
    const inside=onKickPitch(layout,c.x,c.z);if(inside)onPitch=true;
    if(!teleport&&onPitch&&(!c.onFoot||!inside))round.leave();
    if(round.state.phase==='done')finishRound();else kickStore.set({secondsLeft:Math.ceil(round.timeLeft),sunset:c.sunset});
   }
   if(hoopsRoot&&hoopMat){
    const t=c.elapsed;if(phase==='playing'){hoopMat.color.copy(c.sunset?SUNSET_RING:DAY_RING);}
    for(const [id,m] of hoopMeshes){const age=popAge.get(id);
     if(age!==undefined){const a=age+c.dt;popAge.set(id,a);if(a>.32){if(m.visible)m.visible=false;}else m.scale.setScalar(1+a*2.4);continue;}
     if(phase==='playing'&&!c.reduced){m.rotation.x=t*1.2;m.scale.setScalar(1+.04*Math.sin(t*4+m.position.z));}}
   }
   // ---- the eyepiece
   if(scope.active){
    const s=spot!,f=fov();
    const lm=centredLandmark(s.eye,scope.yaw,scope.pitch,f);const id=lm?.id??'';
    if(id!==scope.label){scope.label=id;scopeStore.set({label:lm?{id:lm.id,name:lm.name,line:lm.line}:null});if(lm){const save=readTelescopeSafe(),next=seeLandmark(save,lm.id);if(next!==save)writeTelescope(next);}}
    const spottedSet=new Set(readTelescopeSafe().spotted),g=centredGlint(s.eye,scope.yaw,scope.pitch,f,spottedSet);
    if(g&&scope.arrived){if(scope.holdId!==g.id){scope.holdId=g.id;scope.hold=0;}scope.hold+=c.dt;const p=Math.min(1,scope.hold/SCOPE.spotSeconds);
     if(p>=1){scope.holdId='';scope.hold=0;spotted(g.id);}else scopeStore.set({spotting:{id:g.id,progress:Math.round(p*10)/10}});}
    else if(scope.holdId){scope.holdId='';scope.hold=0;scopeStore.set({spotting:null});}
    // Glints keep a steady size on screen (scaled with distance and zoom) and twinkle.
    const k=Math.tan(f*Math.PI/360)*.075;let i=0;
    for(const [gid,sp] of glintSprites){const gl=TELESCOPE_GLINTS.find(x=>x.id===gid)!,d=Math.hypot(gl.x-s.eye.x,gl.y-s.eye.y,gl.z-s.eye.z);
     sp.scale.setScalar(d*k*(c.reduced?1:.8+.35*Math.sin(c.elapsed*5.5+i*1.7)));i++;}
   }
   // ---- prompts (world-anchored, like the fishing post's)
   let want:{key:string;distance:number}|null=null;
   const kickPrompt=c.ui<HTMLButtonElement>('[data-summit-kick-start]'),scopePrompt=c.ui<HTMLButtonElement>('[data-telescope-open]');
   if(!kickPrompt&&!scopePrompt)return null;
   const near=c.onFoot&&c.canEnter&&!scope.active&&phase==='idle';
   let dk=Infinity,ds=Infinity,L:KickLayout|null=null,S:typeof spot=null;
   // Cheap box test first: both posts are on Summit Isle (x > 400), so the main island never computes the layout.
   if(near&&c.x>400){const e=ensure();L=e.layout;S=e.spot;dk=Math.hypot(c.x-L.post.x,c.z-L.post.z);ds=Math.hypot(c.x-S.x,c.z-S.z);}
   if(dk<REACH&&dk<=ds)want={key:'summit-kick',distance:dk};else if(ds<REACH)want={key:'telescope',distance:ds};
   const show=(el:HTMLButtonElement|null|undefined,visible:boolean,x:number,y:number,z:number)=>{if(!el)return;let hidden=!visible;
    if(!hidden){anchor.set(x,y,z).project(c.camera);hidden=anchor.z< -1||anchor.z>1;if(!hidden)c.place(el,T.MathUtils.clamp((anchor.x+1)*c.width/2,75,c.width-75),T.MathUtils.clamp((1-anchor.y)*c.height/2,90,c.height-160));}
    c.hide(el,hidden);};
   show(kickPrompt,!!want&&want.key==='summit-kick'&&c.focusKey==='summit-kick',L?.post.x??0,(L?.ground??0)+2.9,L?.post.z??0);
   show(scopePrompt,!!want&&want.key==='telescope'&&c.focusKey==='telescope',S?.x??0,(S?.ground??0)+2.1,S?.z??0);
   return want;
  },
  /** Call after the follow camera is placed (like fishing.applyCamera): the eyepiece view, or the way back to the normal one. */
  applyCamera(camera:T.PerspectiveCamera,dt:number,reduced:boolean){
   if(scope.restore){scope.restore=false;camera.fov=scope.normal.fov;camera.far=scope.normal.far;camera.updateProjectionMatrix();return;}
   if(!scope.active)return;
   const s=spot!;
   if(scope.blend===0){scope.start.p.copy(camera.position);scope.start.q.copy(camera.quaternion);scope.start.fov=camera.fov;scope.normal.fov=camera.fov;scope.normal.far=camera.far;}
   scope.blend=reduced?1:Math.min(1,scope.blend+dt/.65);const e=scope.blend*scope.blend*(3-2*scope.blend);
   eyeV.set(s.eye.x,s.eye.y,s.eye.z);const d=viewDir(scope.yaw,scope.pitch);lookV.set(s.eye.x+d.x,s.eye.y+d.y,s.eye.z+d.z);
   aimer.position.copy(eyeV);aimer.up.set(0,1,0);aimer.lookAt(lookV);targetQ.copy(aimer.quaternion);
   camera.position.lerpVectors(scope.start.p,eyeV,e);camera.quaternion.slerpQuaternions(scope.start.q,targetQ,e);
   const want=scope.start.fov+(fov()-scope.start.fov)*e;
   // Zoom changes ease too (a quick lens move), once arrived.
   const next=scope.blend>=1?camera.fov+(fov()-camera.fov)*Math.min(1,dt*(reduced?60:9)):want;
   if(Math.abs(next-camera.fov)>1e-3||camera.far!==SCOPE.far){camera.fov=next;camera.far=SCOPE.far;camera.updateProjectionMatrix();}
   camera.updateMatrixWorld();
   if(scope.blend>=1)scope.arrived=true;
  },
  dispose(){off();disposeHoops();disposeGlints();round=null;phase='idle';scope.active=false;},
 };
}
export type SummitActivities=ReturnType<typeof createSummitActivities>;
