/**
 * The character side of island jobs (Sep 30 2026, docs/island-jobs.md §10). Pure (no three.js, no DOM) so it is testable.
 *
 * - `jobButtons`: the job's own action cluster, which replaces the default Kick / Juggle / Ride buttons while a job runs
 *   (Harvest day: Kick the tree · Pull/Twist/Snip · Pick up/Unload). `null` = keep the ball buttons (Wall rebounds).
 * - `rideAllowed`: every job is on foot; the ride button and the R key wait until the job ends.
 * - `poseForEvent` + `createJobMoves`: bounded, action-triggered character poses (lib/graphics/player.ts `job`), the
 *   Kick-the-tree sequence (step back, pass into the trunk, rebound, first touch) and where the player's own ball rests
 *   while the hands are busy (set down beside the player, back at the feet when they walk on).
 *
 * Heat: nothing here runs without a job. `update` is a few arithmetic ops while a pose, kick or parked ball exists and
 * returns at once otherwise; there is no timer, no loop and no allocation per frame beyond one small result object.
 */
import type {JobRun,JobEvent,JobAction} from './jobRules';
import {runActions,harvestPickable} from './jobRules';
import type {JobDef} from './jobCatalog';

// ---------------- Buttons ----------------
/** `slot`: where it sits in the default cluster (shoot = the big primary, juggle, ride). `key`: its desktop key. */
export type JobButton={slot:'shoot'|'juggle'|'ride';key:'Space'|'J'|'R';id:string;label:string;icon:string;hold?:boolean;enabled:boolean};
type SlotDef={ids:string[];label:string;icon:string|Record<string,string>};
const SLOT_KEYS=[['shoot','Space'],['juggle','J'],['ride','R']] as const;
/** Each job's action slots (index 0 = the primary button). Wall rebounds is a football drill: it keeps Juggle / Shoot. */
export const JOB_SLOTS:Record<string,SlotDef[]|null>={
 'farm-harvest':[{ids:['kick'],label:'Kick the tree',icon:'treekick'},{ids:['pull','twist','cut'],label:'Pull · twist · snip',icon:{pull:'pull',twist:'twist',cut:'snip'}},{ids:['pickup','unload'],label:'Pick up',icon:{pickup:'basket',unload:'basket'}}],
 'leaf-rake':[{ids:['rake'],label:'Hold to rake',icon:'rake'},{ids:['bag'],label:'Bag it',icon:'bag'},{ids:['empty'],label:'Empty the bag',icon:'bin'}],
 'ball-kid':[{ids:['box'],label:'Put it in the ball box',icon:'crate'},{ids:['pickup'],label:'Pick up the ball',icon:'scoop'}],
 'cone-setup':[{ids:['place'],label:'Place cone',icon:'cone'}],
 'line-painter':[{ids:['paint'],label:'Hold to paint',icon:'paint'}],
 'court-cleanup':[{ids:['pick'],label:'Pick up',icon:'scoop'},{ids:['toss'],label:'Toss in the bin',icon:'bin'}],
 'offside-flag':[{ids:['flag'],label:'Raise the flag',icon:'flag'},{ids:['play-on'],label:'Keep flag down',icon:'flagdown'},{ids:['next'],label:'Next replay',icon:'next'}],
 'ball-pump':[{ids:['pump'],label:'Pump',icon:'pump'},{ids:['release'],label:'Let air out',icon:'air'},{ids:['ready'],label:'Ball ready',icon:'check'}],
 'goal-anchor':[{ids:['hammer'],label:'Hammer',icon:'hammer'}],
 'match-day-snacks':[{ids:['drop'],label:'Drop it in',icon:'crate'},{ids:['take'],label:'Take a snack',icon:'take'}],
 'garden-shift':[{ids:['pluck'],label:'Pick',icon:'basket'},{ids:['crate'],label:'Drop in crate',icon:'crate'}],
 'wall-rebounds':null,
};
/** The cluster for the running job (`null` = keep the default ball buttons). Buttons stay in place, disabled until armed. */
export function jobButtons(r:JobRun|null):JobButton[]|null{
 if(!r||r.phase==='done')return null;const slots=JOB_SLOTS[r.def.id];if(!slots)return null;
 const acts:JobAction[]=r.harvest?harvestButtonActions(r):runActions(r);
 return slots.map((s,i)=>{const a=acts.find(x=>s.ids.includes(x.id)),id=a?.id??s.ids[0],[slot,key]=SLOT_KEYS[i];
  return {slot,key,id,label:a?.label??s.label,icon:typeof s.icon==='string'?s.icon:s.icon[id]??Object.values(s.icon)[0],hold:a?.hold,enabled:!!a};});
}
/** Harvest day: the kick, hands and basket slots are armed independently (a crop on the ground can be picked up at a tree). */
function harvestButtonActions(r:JobRun):JobAction[]{
 const out=runActions(r).filter(a=>a.id!=='pickup');
 if(r.phase==='work'&&r.harvest&&r.harvest.pulling<0&&harvestPickable(r).length)out.push({id:'pickup',label:'Pick up'});
 return out;
}
/** Every job is on foot (Sep 30 2026, user): rides wait until the job ends. */
export function rideAllowed(mode:string,jobActive:boolean){return !jobActive||mode==='walk';}
export const RIDE_WAIT_NOTE='Island jobs are on foot. Your rides wait until the job is done (or tap Stop job).';

// ---------------- Poses ----------------
/** Rig poses (lib/graphics/player.ts PlayerMotion.job). One-shots run for POSE_TIME seconds; held poses come every frame. */
export type JobPoseKind='gpick'|'reachpick'|'headshake'|'carrybasket'|'tipbasket'|'firsttouch'|'pull'|'pop'|'slip'|'twist'|'nope'|'snip'|'pick'|'rake'|'stuff'|'toss'|'scoop'|'carryball'|'throwin'|'carrystack'|'place'|'push'|'mallet'|'drop'|'take'|'carrycard'|'control'|'flaghold'|'flagup'|'flagdown'|'kneel';
/** Poses that move only the arms, torso and head: the legs keep walking, dribbling or juggling. */
export const UPPER_POSES=new Set<JobPoseKind>(['carrybasket','carryball','carrystack','carrycard','push','flaghold','firsttouch']);
/** `upper`: only the arms, torso and head (the legs keep walking). */
export type JobPose={kind:JobPoseKind;progress:number;tug?:number;upper?:boolean;
 /** Garden shift: the left hand carries the basket through the pose (free picking has no basket). */
 basket?:boolean;
 /** Held poses at a place (the root being pulled, the leaf pile, the pump): face it and step up to it. */
 target?:{x:number;z:number}};
export const POSE_TIME:Partial<Record<JobPoseKind,number>>={gpick:.85,reachpick:.8,headshake:.9,tipbasket:.6,pop:.6,slip:.5,twist:.5,nope:.4,snip:.3,pick:.42,stuff:.45,toss:.6,scoop:.5,throwin:.7,place:.5,mallet:.42,drop:.45,take:.4,control:.35,firsttouch:.4,flagup:.9,flagdown:.7};
/** Which one-shot a job event plays (and at what: `spot` = a target index, `item` = the event's x/z, `deliver` = the drop-off). */
export function poseForEvent(def:JobDef,e:JobEvent):{kind:JobPoseKind;at?:'spot'|'item'|'deliver';basket?:boolean}|null{
 const t=e.type;
 // Garden (shift and free picking, Sep 30 2026): crouch-pick from a bed, reach up on tiptoe into a tree, a look and a head shake
 // at a green one (or one the mix does not need), tip the basket into the crate. `free` picks have no basket in the hand.
 if(def.kind==='garden'){const basket=!e.free;
  if(t==='pluck')return {kind:e.value===1?'reachpick':'gpick',at:'item',basket};if(t==='unripe'||t==='wrong')return {kind:'headshake',at:'item',basket};
  if(t==='deliver')return {kind:'tipbasket',at:'deliver',basket:true};return null;}
 if(def.kind==='harvest'){
  if(t==='pop')return {kind:'pop',at:'spot'};if(t==='snap')return {kind:'slip',at:'spot'};
  if(t==='twist')return {kind:'twist',at:'spot'};if(t==='unripe')return {kind:'nope',at:'spot'};
  if(t==='snip'||t==='cut')return {kind:'snip',at:'spot'};if(t==='gather')return {kind:'pick',at:'item'};
  if(t==='deliver')return {kind:'toss',at:'deliver'};return null;}
 switch(def.id){
  case 'leaf-rake':return t==='step'&&e.stage===1?{kind:'stuff',at:'spot'}:t==='deliver'?{kind:'toss',at:'deliver'}:null;
  case 'ball-kid':return t==='pickup'?{kind:'scoop',at:'spot'}:t==='return'?{kind:'drop',at:'deliver'}:null;
  case 'cone-setup':return t==='collect'?{kind:'place',at:'spot'}:null;
  case 'court-cleanup':return t==='collect'?{kind:'pick',at:'spot'}:t==='deliver'?{kind:'toss',at:'deliver'}:null;
  case 'goal-anchor':return t==='work'?{kind:'mallet',at:'spot'}:null;
  case 'match-day-snacks':return t==='pickup'?{kind:'take',at:'deliver'}:t==='return'||t==='wrong'?{kind:'drop',at:'spot'}:null;
  case 'offside-flag':return t==='call'?{kind:e.value===1?'flagup':'flagdown'}:null;
  case 'wall-rebounds':return t==='pass'?{kind:'firsttouch'}:null;
 }
 return null;
}
/** Held (per-frame) poses from the run state: pulling a root, raking, pushing the marker, carrying, kneeling at the pump. */
export function heldPose(r:JobRun|null,clock:number,sinceStroke:number):JobPose|null{
 if(!r||r.phase==='done')return null;const id=r.def.id;
 const task=r.def.task;
 if(r.harvest&&r.harvest.pulling>=0&&task?.type==='harvest'){const sp=task.spots[r.harvest.pulling];return {kind:'pull',progress:0,tug:Math.min(1,r.harvest.pull/1.1),target:{x:sp.x,z:sp.z}};}
 if(id==='leaf-rake'&&r.holding){const t=r.def.targets[r.at];return {kind:'rake',progress:(clock*1.6)%1,target:t?{x:t.x,z:t.z}:undefined};}
 if(id==='line-painter'&&r.phase==='work')return {kind:'push',progress:0,upper:true,tug:r.holding?1:0};
 if(id==='ball-kid'&&r.carrying>=0)return {kind:'carryball',progress:0,upper:true};
 if(id==='cone-setup'&&r.got.some(g=>!g))return {kind:'carrystack',progress:0,upper:true};
 if(id==='match-day-snacks'&&r.carrying>=0)return {kind:'carrycard',progress:0,upper:true};
 if(id==='offside-flag')return {kind:'flaghold',progress:0,upper:true};
 if(id==='garden-shift')return {kind:'carrybasket',progress:0,upper:true,basket:true};
 if(id==='ball-pump'&&r.phase==='pump'){const t=r.def.targets[0];return {kind:'kneel',progress:0,tug:Math.max(0,1-sinceStroke/.28),target:{x:t.x,z:t.z-1}};}
 return null;
}
/** Poses that need free hands: the player's own ball is set down beside them first. */
export const HANDS_POSES=new Set<JobPoseKind>(['gpick','reachpick','tipbasket','pull','pop','slip','twist','nope','snip','pick','rake','stuff','toss','scoop','throwin','place','mallet','drop','take','kneel']);
/** Poses that hold the player still (they end quickly, or when the button is released). */
const STILL_POSES=new Set<JobPoseKind>(['gpick','reachpick','headshake','tipbasket','pull','pop','slip','twist','nope','snip','pick','rake','stuff','toss','scoop','throwin','place','mallet','drop','take','kneel','flagup','flagdown']);
/** How close to its target the character steps for a pose (metres, target centre to feet). */
const STAND_OFF:Partial<Record<JobPoseKind,number>>={gpick:1,reachpick:.55,headshake:1.1,tipbasket:.85,kneel:.6,rake:1.05,pull:.62,twist:.55,nope:.55,snip:.6,scoop:.55,place:.5,mallet:.75,drop:.8,take:.8,stuff:.6,toss:1.1};

// ---------------- Controller ----------------
type P={x:number;z:number};type P3={x:number;y:number;z:number};
export type PlayerIn={x:number;z:number;y:number;yaw:number};
/** Per frame for the host (Town.tsx). */
export type JobFrame={
 pose:JobPose|null;
 /** Face this heading (radians) while acting. */
 facing?:number;
 /** Kick the tree: the rig's kick progress (contact at KICK_CONTACT), the stepping legs and the visual step-back (metres). */
 kick?:number;shotStep?:number;back?:number;
 /** Ease the player to this spot (the host checks it is walkable). */
 stand:P|null;
 /** The player's own ball, world position; null = the normal dribble at the feet. */
 ball:P3|null;
 /** Hold movement input (the pose ends quickly). */
 still:boolean;
 /** The ball has just reached the feet again (the host resets its dribble). */
 caught:boolean;
};
export const KICK_CONTACT=.36;
/** Kick-the-tree timeline (seconds): approach to the kicking spot, two steps back, two steps in, the strike. */
export const TREE_KICK={standOff:2.2,ballOff:1.6,back:.9,tBack:.32,tIn:.24,tStrike:.5,ballSpeed:11,reboundSpeed:6.5,control:.16,maxApproach:.45,trunk:.28};
type Kick={trunk:P;stand:P;ballAt:P;dir:P;age:number;tA:number;tOut:number;tHome:number;phase:'approach'|'back'|'in'|'strike'|'out'|'home'|'control';from:P3;hit:boolean;onHit:()=>void;reduced:boolean;phaseAge:number};
export function createJobMoves(){
 let pose:{kind:JobPoseKind;age:number;dur:number;target:P|null;basket:boolean}|null=null,kick:Kick|null=null;
 /** The player's own ball set down while the hands work (`origin`: where the player stood). */
 let park:{at:P3;origin:P;returning:number;from:P3|null}|null=null;
 const yawTo=(a:P,b:P)=>Math.atan2(b.x-a.x,b.z-a.z);
 const standFor=(kind:JobPoseKind,player:P,target:P|null):P|null=>{const off=STAND_OFF[kind];if(off===undefined||!target)return null;
  const d=Math.hypot(target.x-player.x,target.z-player.z);if(d<.05)return null;const k=Math.max(0,d-off)/d;if(d<=off+.15)return null;return {x:player.x+(target.x-player.x)*k,z:player.z+(target.z-player.z)*k};};
 function parkBall(p:PlayerIn,floor:(x:number,z:number)=>number,from:P3|null){if(park&&park.returning<0)return;
  // Beside the right foot and a little behind, clear of the hands and of the crop in front.
  const rx=Math.cos(p.yaw),rz=-Math.sin(p.yaw),bx=Math.sin(p.yaw),bz=Math.cos(p.yaw),x=p.x-rx*.72-bx*.25,z=p.z-rz*.72-bz*.25;
  park={at:{x,y:floor(x,z)+.2,z},origin:{x:p.x,z:p.z},returning:-1,from};}
 /** Start a one-shot pose (from a job event). `ball`: where the player's ball is now (to set it down from there). `basket`: the
  *  Garden shift basket stays in the left hand. */
 function start(kind:JobPoseKind,p:PlayerIn,target:P|null,floor:(x:number,z:number)=>number,reduced:boolean,ball:P3|null=null,basket=false){
  if(kick&&kind!=='pick')return;const dur=(POSE_TIME[kind]??.4)*(reduced?.6:1);
  pose={kind,age:0,dur,target,basket};if(HANDS_POSES.has(kind))parkBall(p,floor,ball);
 }
 /** Kick the tree: set the ball on the line to the trunk, step back, strike it in; `onHit` fires when it meets the trunk. */
 function startKick(trunk:P,p:PlayerIn,reduced:boolean,ball:P3|null,onHit:()=>void,canStand:(x:number,z:number)=>boolean){
  if(kick)return false;const d=Math.hypot(trunk.x-p.x,trunk.z-p.z)||1,dir={x:(trunk.x-p.x)/d,z:(trunk.z-p.z)/d};
  let stand={x:trunk.x-dir.x*TREE_KICK.standOff,z:trunk.z-dir.z*TREE_KICK.standOff};if(!canStand(stand.x,stand.z))stand={x:p.x,z:p.z};
  const sd=Math.hypot(trunk.x-stand.x,trunk.z-stand.z),ballOff=Math.min(TREE_KICK.ballOff,Math.max(.7,sd-.6));
  const ballAt={x:trunk.x-dir.x*ballOff,z:trunk.z-dir.z*ballOff},move=Math.hypot(stand.x-p.x,stand.z-p.z);
  kick={trunk,stand,ballAt,dir,age:0,phaseAge:0,tA:reduced?0:Math.min(TREE_KICK.maxApproach,Math.max(.14,move/5)),tOut:Math.max(.08,(ballOff-TREE_KICK.trunk)/TREE_KICK.ballSpeed),tHome:0,phase:'approach',from:ball??{x:p.x+dir.x*.56,y:0,z:p.z+dir.z*.56},hit:false,onHit,reduced};
  pose=null;park=null;return true;
 }
 const smooth=(k:number)=>{const t=Math.max(0,Math.min(1,k));return t*t*(3-2*t);};
 function update(dt:number,p:PlayerIn,floor:(x:number,z:number)=>number,held:JobPose|null):JobFrame{
  const out:JobFrame={pose:null,stand:null,ball:null,still:false,caught:false};
  if(kick){const k=kick,feet={x:k.stand.x+k.dir.x*.56,z:k.stand.z+k.dir.z*.56},face=yawTo(k.stand,k.trunk),gy=(q:P)=>floor(q.x,q.z)+.2;
   k.age+=dt;k.phaseAge+=dt;out.still=true;out.facing=face;out.stand=k.stand;const next=(ph:Kick['phase'])=>{k.phase=ph;k.phaseAge=0;};
   if(k.phase==='approach'){const u=k.tA?smooth(k.phaseAge/k.tA):1;out.ball={x:k.from.x+(k.ballAt.x-k.from.x)*u,y:gy(k.ballAt),z:k.from.z+(k.ballAt.z-k.from.z)*u};out.shotStep=k.tA?Math.min(1,k.phaseAge/k.tA)*.5:undefined;
    if(k.phaseAge>=k.tA)next(k.reduced?'strike':'back');}
   if(k.phase==='back'){const u=k.phaseAge/TREE_KICK.tBack;out.back=TREE_KICK.back*smooth(u);out.shotStep=Math.min(1,u)*.5;out.ball={x:k.ballAt.x,y:gy(k.ballAt),z:k.ballAt.z};if(u>=1)next('in');}
   if(k.phase==='in'){const u=k.phaseAge/TREE_KICK.tIn;out.back=TREE_KICK.back*(1-smooth(u));out.shotStep=.5+Math.min(1,u)*.5;out.ball={x:k.ballAt.x,y:gy(k.ballAt),z:k.ballAt.z};if(u>=1)next('strike');}
   if(k.phase==='strike'){const T=TREE_KICK.tStrike*(k.reduced?.6:1),u=Math.min(1,k.phaseAge/T);out.kick=u;
    if(u<KICK_CONTACT){out.ball={x:k.ballAt.x,y:gy(k.ballAt),z:k.ballAt.z};}
    else if(k.reduced){if(!k.hit){k.hit=true;k.onHit();}out.ball=null;}
    else{const f=Math.min(1,(k.phaseAge-KICK_CONTACT*T)/k.tOut),hitAt={x:k.trunk.x-k.dir.x*TREE_KICK.trunk,z:k.trunk.z-k.dir.z*TREE_KICK.trunk};
     out.ball={x:k.ballAt.x+(hitAt.x-k.ballAt.x)*f,y:gy(k.ballAt)+Math.sin(f*Math.PI)*.12,z:k.ballAt.z+(hitAt.z-k.ballAt.z)*f};
     if(f>=1&&!k.hit){k.hit=true;k.onHit();k.tHome=Math.max(.25,Math.hypot(feet.x-hitAt.x,feet.z-hitAt.z)/TREE_KICK.reboundSpeed);k.from={...out.ball};}}
    if(u>=1&&(k.hit||k.reduced)){if(k.reduced){kick=null;out.caught=true;out.still=false;return out;}if(k.hit)next('home');}}
   if(k.phase==='home'){const f=Math.min(1,k.phaseAge/k.tHome);out.ball={x:k.from.x+(feet.x-k.from.x)*f,y:gy(feet)+Math.sin(f*Math.PI)*.35,z:k.from.z+(feet.z-k.from.z)*f};out.pose={kind:'control',progress:0};
    if(f>=1)next('control');}
   if(k.phase==='control'){const u=Math.min(1,k.phaseAge/TREE_KICK.control);out.pose={kind:'control',progress:.5+u*.5};out.ball={x:feet.x,y:gy(feet),z:feet.z};if(u>=1){kick=null;out.caught=true;out.still=false;}}
   return out;}
  if(pose){pose.age+=dt;const k=Math.min(1,pose.age/pose.dur);out.pose={kind:pose.kind,progress:k,...(pose.basket?{basket:true}:{})};out.still=STILL_POSES.has(pose.kind);
   if(pose.target){out.facing=yawTo(p,pose.target);out.stand=standFor(pose.kind,p,pose.target);}if(k>=1)pose=null;}
  else if(held){out.pose=held;out.still=STILL_POSES.has(held.kind)&&!held.upper;if(HANDS_POSES.has(held.kind))parkBall(p,floor,null);
   if(held.target){out.facing=yawTo(p,held.target);out.stand=standFor(held.kind,p,held.target);}}
  if(park){
   if(park.returning<0&&!out.pose&&Math.hypot(p.x-park.origin.x,p.z-park.origin.z)>.6){park.returning=0;park.from={...park.at};}
   if(park.returning>=0){park.returning+=dt;const f=Math.min(1,park.returning/.3),feet={x:p.x+Math.sin(p.yaw)*.56,z:p.z+Math.cos(p.yaw)*.56};
    out.ball={x:park.at.x+(feet.x-park.at.x)*smooth(f),y:floor(feet.x,feet.z)+.2+Math.sin(f*Math.PI)*.15,z:park.at.z+(feet.z-park.at.z)*smooth(f)};if(f>=1){park=null;out.caught=true;}}
   else out.ball={...park.at};
  }
  return out;
 }
 /** Job over (done, quit, left the area): drop every pose and give the ball back to the feet at once. */
 function reset(){const had=!!(pose||kick||park);pose=null;kick=null;park=null;return had;}
 /** Job over (bug A9, Sep 30 2026): the ball goes back to the feet and a Kick the tree stops, but a one-shot pose already playing
  *  (the last toss, basket tip, throw-in, cone, hammer blow or snack drop) plays to its end instead of being cut off. */
 function end(){kick=null;park=null;if(pose&&POSE_TIME[pose.kind]===undefined)pose=null;}
 return {start,startKick,update,reset,end,parkBall,
  get busy(){return !!kick||!!pose&&STILL_POSES.has(pose.kind);},get kicking(){return !!kick;},get parked(){return !!park;},get posing(){return pose?.kind??null;}};
}
export type JobMoves=ReturnType<typeof createJobMoves>;
