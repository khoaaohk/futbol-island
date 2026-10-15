/**
 * Summit Isle fruit trees runtime (Oct 13 2026; orchard, daily fruit, riding/flying, hands-on grip, GPU sway and ball hits Oct 14
 * 2026): the fruit hanging in today's fruiting trees, the "Shake the tree" prompt, the shake (the character grips the trunk and
 * pushes, the tree sways, leaves, the fruit falls and bounces), a kicked ball knocking fruit down, and the pickups into the market
 * basket. Rules and the save: lib/town/summitForage.ts. Orchard: lib/town/summitOrchard.ts. Prompt: components/ForagePrompt.tsx.
 *
 * The sequence from a ride or the air (user: "the shake the mango tree btn should show when riding or flying near … force to land
 * or switch to walking to shake the tree"): the tap asks the host to hop off (ground rides: the usual switch to walking) or to land
 * beside the trunk (jetpack / parachute: the usual guided landing to a clear spot a step out from the grip side); once on foot the
 * character walks the last step to the trunk, grips it and shakes. Input stays locked throughout (the landing and the pose hold it).
 *
 * Heat:
 *  - All the fruit is ONE instanced mesh (1 draw call, no shadow) sized to today's fruiting trees only (bare trees have no slots).
 *    Built the first time the player comes near Summit Isle; rebuilt only when the local day changes.
 *  - The sway is a vertex-shader rotation of just the shaken tree inside the island's baked prop meshes (summitIsleWorld.ts
 *    SUMMIT_TREE_SWAY): no shell mesh, no extra draw; the uniform angle goes back to exactly 0 when it settles.
 *  - Nothing animates at rest. Off the island update() is one box test; on it, a handful of distances for the prompt. Per-frame work
 *    only while a landing/hop-off wait, a shake, a sway, a fall or a pickup is under way (a few seconds).
 *  - Ball hits are tested only when the host reports a ball collision (no per-frame loop): a 8 m bucket grid of the fruit trees.
 *  - Leaves and the pickup sparkle share one pooled particle mesh (jobFx: hidden when idle). No timers, no rAF of its own; one
 *    keydown listener (E shakes when the prompt shows).
 * Reduced motion: a small sway, no leaves; the fruit lands at once; the hop-off / landing is the host's reduced version.
 */
import * as T from 'three';
import {createJobFx,type JobFx} from '../town/jobs/jobFx';
import {POSE_TIME} from '../town/jobs/jobMoves';
import {TREE_SHAKE_PUSHES} from './jobPoses';
import {FORAGE,FRUIT_LOOK,FORAGE_TIP,FOLLOW_CAMERA,fruitTreeSteps,hangingNow,capLeft,recordPick,dropCount,ballDropCount,readForage,writeForage,forageStore,forageActions,
 localForageDay,fruitingToday,fruitToday,dayHash,contactAt,type FruitTree,type ForageSave,type TreeSite} from '../town/summitForage';
import {SUMMIT_TREE_SITES,SUMMIT_TREE_SWAY,swayWeight} from '../town/summitIsleWorld';
import {countFruitShake} from '../analytics/summitEvents';
import {SUMMIT_BOX,SUMMIT_PATHS,SUMMIT_LANDMARKS,SUMMIT_CENTER,SUMMIT_VISUAL_DROP,summitGround,onSummitIsle,beachPoint,summitCameraPull} from '../town/summitIsle';
import {insideObstacle,type Obstacle} from '../town/simulation';
import {goodById} from '../town/market/goods';

/** How the player gets off to shake: hop off a ground ride, or land beside the trunk from the jetpack or parachute. */
export type ForageArrival='ride'|'fly';
type Ports={
 /** The island's colliders (world.obstacles), to choose reachable trees and landing spots clear of trunks and rocks. */
 obstacles:readonly Obstacle[];
 /** Start the character's grip-and-shake at this trunk (Town: jobMoves.start('treeshake', …)): walk `lead` seconds to `stand`
  *  (the root, clear of the trunk's collider), face the trunk, and close the last `lean` metres to the bark with the body. */
 pose:(trunk:{x:number;z:number},how:{stand:{x:number;z:number};lean:number;lead:number})=>void;
 /** Off the ride or out of the air: true when the host started it (a ground ride switches to walking at once; a flight lands at
  *  `spot`, a clear spot a step out from the trunk). */
 dismount?:(how:ForageArrival,spot:{x:number;z:number})=>boolean;
 /** The flight landed for a shake (the host's landing dust and thud). */
 touchdown?:()=>void;
 /** Busy with something else (a job, a kick, another pose): no shaking now. */
 busy?:()=>boolean;
 /** One fruit into the market basket; how many went in (0 = the basket is full). */
 gather:(good:string)=>number;
 /** Sounds: 'rustle' | 'thud' | 'pick' (islandSound's job cues). */
 cue?:(kind:string)=>void;
 haptic?:()=>void;
 now?:()=>number;random?:()=>number;
 read?:()=>string|null;write?:(v:string)=>void;
 sites?:()=>readonly TreeSite[];
 /** The baked props' sway uniforms (tests pass their own). */
 sway?:typeof SUMMIT_TREE_SWAY;
 /** The shake's last, strongest push on the tree at (x, z) (Town: a hidden ball stuck in that tree drops, coinHunt.treeHit). */
 shook?:(x:number,z:number)=>void;
 /** Milliseconds per frame for choosing the fruit trees (the first time the player nears the island). */
 budgetMs?:number;
};
export type ForageUpdate={
 dt:number;x:number;z:number;
 /** On foot on the ground (not flying, riding, falling or on a truck). */
 onFoot:boolean;canEnter:boolean;
 /** Not on foot but may still shake: on a scooter, bike or moped on the ground ('ride'), or on the jetpack / parachute ('fly'),
  *  never in street traffic or the truck. `air()`: height over the ground while flying (read only near a tree). */
 arrival?:ForageArrival|null;air?:()=>number;
 /** The fishing focus holds the island still: no work at all. */
 frozen:boolean;reduced:boolean;
 camera:T.Camera;width:number;height:number;
 /** The HUD arbiter's current 'enter' key (lib/ui/hudStack.ts), so exactly one prompt shows. */
 focusKey:string|null;
 ui:<E extends HTMLElement>(selector:string)=>E|null|undefined;place:(el:HTMLElement,x:number,y:number)=>void;hide:(el:HTMLElement,hidden:boolean)=>void;
};
type Slot={tree:number;k:number;mode:'hang'|'hidden'|'fall'|'ground'|'fly';hang:T.Vector3;pos:T.Vector3;vel:T.Vector3;bounces:number;age:number;spin:number;fly:T.Vector3};
const G=9.8,NEAR_BOX=40,BUCKET=8;
/** Walking pace of the step to the trunk (Town's job stand step, m/s) and the longest step the shake waits for. */
const STEP_SPEED=3.5,MAX_LEAD=1.4;
/** Give up waiting for a hop-off or landing after this long (s). */
const ARRIVAL_WAIT=6;
/** ?forage=0: the fruit trees are off (A/B heat runs, like ?fishfocus=0). */
const OFF=typeof location!=='undefined'&&typeof URLSearchParams!=='undefined'&&new URLSearchParams(location.search).get('forage')==='0';
const DUMMY=new T.Object3D(),Q=new T.Quaternion(),V=new T.Vector3();
const LEAF_TREE='#6f9a55',LEAF_PALM='#5b895e',SPARKLE=['#fff3b0','#ffe18a','#ffffff'];

/** Where fruit k hangs today: on the canopy's surface on the follow camera's side (it looks from +x +z), or clustered under a
 *  palm's, banana's or papaya's crown; the day's hash turns the positions round, so they differ from day to day. */
export function hangPoint(t:FruitTree,k:number,day=''):T.Vector3{
 const c=t.rig.crown,j=dayHash(day,t.id,3)-.5,cam=1.03;
 if(c.hang==='under'){const a=cam+(k-1)*1.1+j*1.2;return new T.Vector3(c.x+Math.cos(a)*(c.rx+.3*(t.kind==='palm'?0:.4)),c.y-(k%2)*c.ry,c.z+Math.sin(a)*(c.rx+.3*(t.kind==='palm'?0:.4)));}
 const a=cam+(k-1)*.95+j*1.4,el=[-.18,.22,-.45][(k+Math.floor((j+.5)*3))%3];
 return new T.Vector3(c.x+Math.cos(el)*Math.cos(a)*c.rx*.97,c.y+Math.sin(el)*c.ry*.97,c.z+Math.cos(el)*Math.sin(a)*c.rx*.97);
}

export function createSummitForage(scene:T.Scene,ports:Ports){
 const now=ports.now??(()=>Date.now()),rand=ports.random??Math.random,cue=(k:string)=>ports.cue?.(k),U=ports.sway??SUMMIT_TREE_SWAY;
 const root=new T.Group();root.name='summit-fruit-trees';
 let built=false,pool:FruitTree[]=[],trees:FruitTree[]=[],slots:Slot[]=[],save:ForageSave|null=null,mesh:T.InstancedMesh|null=null,geo:T.BufferGeometry|null=null,mat:T.MeshStandardMaterial|null=null;
 let fx:JobFx|null=null,dirty=false,day='',dawn:number[]=[];
 /** The shake under way: the tree, its clock (negative while stepping in), the pushes done, the push direction (player → trunk). */
 let shake:{tree:number;t:number;dur:number;pushes:number;dir:T.Vector2;dropped:boolean}|null=null;
 /** Waiting for the hop-off or landing before the shake. */
 let arriving:{tree:number;how:ForageArrival;age:number}|null=null;
 /** The sway after a shake or a ball hit: a damped spring on the tree's tilt about its base (only while it moves). */
 let sway:{tree:number;ang:number;vel:number;axis:T.Vector3;pivot:T.Vector3;h:number;bend:number}|null=null;
 /** A bare tree hit by the ball today: the shader sway alone (no fruit to move). */
 let bareSway:{ang:number;vel:number}|null=null;
 let near=-1,promptShown=false,lastLabel='',moving=0;const hitAt=new Map<number,number>();
 const player={x:0,z:0,onFoot:false,reduced:false,arrival:null as ForageArrival|null};
 const stats={built:false,trees:0,fruiting:0,fruit:0,shakes:0,dropped:0,picked:0,ballHits:0,busyFrames:0,idleFrames:0,get swaying(){return !!sway;},get moving(){return moving;}};
 const persist=(s:ForageSave)=>{save=s;writeForage(s,ports.write);};
 const note=(text:string,tip=false)=>{const v=forageStore.get();forageStore.set({note:text,notes:v.notes+1,tip});};
 const ground=(x:number,z:number)=>summitGround(x,z)-SUMMIT_VISUAL_DROP;
 /** Summit Isle's colliders in 4 m cells (filled at build): Simulation's blocked() scans every collider and re-tests the land
  *  shape, too slow for the few thousand checks the tree choice makes. */
 const cells=new Map<number,Obstacle[]>(),CELL=4,key=(i:number,j:number)=>i*8192+j;
 const hits=(x:number,z:number)=>{const l=cells.get(key(Math.floor(x/CELL),Math.floor(z/CELL)));return !!l&&l.some(o=>insideObstacle(x,z,o,.32));};
 const walkable=(x:number,z:number)=>!hits(x,z)&&onSummitIsle(x,z);
 /** Today's fruiting trees in BUCKET m cells, for ball hits. */
 const buckets=new Map<number,number[]>();

 /** The tree choice runs a few checks per frame (≤ ports.budgetMs, default 3 ms) the first time the player nears the island. */
 let chooser:Generator<void,FruitTree[],void>|null=null;
 const clock=()=>typeof performance!=='undefined'?performance.now():Date.now();
 function choose(){
  if(!chooser){const sites=(ports.sites??(()=>SUMMIT_TREE_SITES))();
   for(const o of ports.obstacles){if(o.x<SUMMIT_BOX.minX-5||o.x>SUMMIT_BOX.maxX+5||o.z<SUMMIT_BOX.minZ-5||o.z>SUMMIT_BOX.maxZ+5)continue;const r=Math.max(o.w,o.d)/2+.4;
    for(let i=Math.floor((o.x-r)/CELL);i<=Math.floor((o.x+r)/CELL);i++)for(let j=Math.floor((o.z-r)/CELL);j<=Math.floor((o.z+r)/CELL);j++){const k=key(i,j);let l=cells.get(k);if(!l)cells.set(k,l=[]);l.push(o);}}
   chooser=fruitTreeSteps(sites,{walkable:onSummitIsle,blocked:hits,ground,paths:SUMMIT_PATHS,landing:SUMMIT_LANDMARKS.sandbarLanding,
    beach:(x,z)=>beachPoint(Math.atan2(z-SUMMIT_CENTER.z,x-SUMMIT_CENTER.x),.5),view:(x,z,y)=>summitCameraPull(x,z,y,x+FOLLOW_CAMERA.x,y+FOLLOW_CAMERA.y,z+FOLLOW_CAMERA.z)});}
  const until=clock()+(ports.budgetMs??3);let r=chooser.next();while(!r.done&&clock()<until)r=chooser.next();
  if(r.done){chooser=null;pool=r.value;built=true;stats.built=true;stats.trees=pool.length;if(pool.length){save=readForage(now(),ports.read);fx=createJobFx(root);scene.add(root);}buildDay();}
 }
 /** Today's fruit: only the day's fruiting trees get slots (instances), with the day's count and positions. */
 function buildDay(){
  if(mesh){mesh.removeFromParent();mesh.dispose();mesh=null;}endSway();slots=[];trees=[];dawn=[];buckets.clear();
  day=localForageDay(now());if(!pool.length)return;
  if(save&&save.day!==day)save=readForage(now(),()=>JSON.stringify(save));
  const fruiting=fruitingToday(pool,day);trees=pool.filter(t=>fruiting.has(t.id));stats.fruiting=trees.length;
  geo??=new T.IcosahedronGeometry(1,1);mat??=new T.MeshStandardMaterial({color:'#ffffff',roughness:.5,emissive:'#4a3510',emissiveIntensity:.3});
  const c=new T.Color();
  trees.forEach((t,ti)=>{dawn[ti]=fruitToday(day,t.id);for(let k=0;k<dawn[ti];k++){const h=hangPoint(t,k,day);slots.push({tree:ti,k,mode:'hidden',hang:h,pos:h.clone(),vel:new T.Vector3(),bounces:0,age:0,spin:0,fly:new T.Vector3()});}
   const b=Math.floor(t.x/BUCKET)*8192+Math.floor(t.z/BUCKET);let l=buckets.get(b);if(!l)buckets.set(b,l=[]);l.push(ti);});
  mesh=new T.InstancedMesh(geo,mat,Math.max(1,slots.length));mesh.name='summit-fruit';mesh.castShadow=false;mesh.receiveShadow=false;mesh.count=slots.length;
  slots.forEach((s,i)=>mesh!.setColorAt(i,c.set(FRUIT_LOOK[trees[s.tree].fruit].color)));
  for(let i=0;i<slots.length;i++)paint(i,true);
  mesh.computeBoundingSphere();if(mesh.boundingSphere)mesh.boundingSphere.radius+=4;// falls land within a few metres of the trees
  root.add(mesh);refresh();
 }
 /** The sway's tilt of a point on the swaying tree (the shader's formula, for the hanging fruit). */
 function swayed(p:T.Vector3,out:T.Vector3){const sw=sway!;const w=swayWeight(p.y-sw.pivot.y,sw.h,sw.bend);Q.setFromAxisAngle(sw.axis,sw.ang*w);return out.copy(p).sub(sw.pivot).applyQuaternion(Q).add(sw.pivot);}
 /** Instance matrix of slot i (hidden = zero scale where it hangs, so the bounding sphere never reaches the origin). */
 function paint(i:number,hide=false){if(!mesh)return;const s=slots[i],t=trees[s.tree],L=FRUIT_LOOK[t.fruit];
  if(hide||s.mode==='hidden'){DUMMY.position.copy(s.hang);DUMMY.rotation.set(0,0,0);DUMMY.scale.setScalar(0);}
  else{let p=s.pos;if(s.mode==='hang'){p=s.hang;if(sway&&sway.tree===s.tree&&sway.ang!==0)p=swayed(s.hang,V);}
   const shrink=s.mode==='fly'?Math.max(.05,1-s.age/.32):1;DUMMY.position.copy(p);DUMMY.rotation.set(s.mode==='ground'?Math.PI/2*(L.stretch[1]>1.2?1:0):s.spin*s.age,s.k*1.3,0);
   DUMMY.scale.set(L.r*L.stretch[0]*shrink,L.r*L.stretch[1]*shrink,L.r*L.stretch[2]*shrink);}
  DUMMY.updateMatrix();mesh.setMatrixAt(i,DUMMY.matrix);dirty=true;}
 const inUse=(s:Slot)=>s.mode==='fall'||s.mode==='ground'||s.mode==='fly';
 const fallenFrom=(ti:number)=>slots.reduce((n,s)=>n+(s.tree===ti&&(s.mode==='fall'||s.mode==='ground')?1:0),0);
 const hangingSlots=(ti:number)=>slots.filter(s=>s.tree===ti&&s.mode==='hang');
 /** Hanging fruit per tree, recounted only when fruit changes state (the prompt reads it every frame). */
 let hangCount:number[]=[];
 const recount=()=>{hangCount=trees.map(()=>0);for(const s of slots)if(s.mode==='hang')hangCount[s.tree]++;stats.fruit=hangCount.reduce((a,b)=>a+b,0);};
 /** Hanging fruit = what the tree carried at dawn, less what was picked today, less any lying under it. */
 function refresh(){if(!save||!mesh)return;const t0=now();
  trees.forEach((t,ti)=>{const want=Math.max(0,hangingNow(save!,t.id,t0,dawn[ti])-fallenFrom(ti));let have=hangingSlots(ti).length;
   for(const s of slots){if(s.tree!==ti||inUse(s)||have===want)continue;const i=slots.indexOf(s);
    if(have<want&&s.mode==='hidden'){s.mode='hang';have++;paint(i);}else if(have>want&&s.mode==='hang'){s.mode='hidden';have--;paint(i);}}});
  recount();
 }
 const label=(t:FruitTree)=>`Shake the ${FRUIT_LOOK[t.fruit].tree}`;
 /** The side to grip tree `ti` from: its clear side nearest the player. */
 function gripSide(t:FruitTree){const want=Math.atan2(player.z-t.rig.grip.z,player.x-t.rig.grip.x);let best=t.sides[0]??want,bd=Infinity;
  for(const a of t.sides){const d=Math.abs(Math.atan2(Math.sin(a-want),Math.cos(a-want)));if(d<bd){bd=d;best=a;}}return best;}
 /** Walk up, grip and shake tree ti (the player is on foot). */
 function begin(ti:number){const t=trees[ti],a=gripSide(t),c=contactAt(t,a),g=t.rig.grip;
  const walk=Math.hypot(c.root.x-player.x,c.root.z-player.z),lead=Math.min(MAX_LEAD,walk>.05?walk/STEP_SPEED:0);
  const dir=new T.Vector2(g.x-c.root.x,g.z-c.root.z);if(dir.lengthSq()<1e-4)dir.set(0,1);dir.normalize();
  shake={tree:ti,t:-lead,dur:(POSE_TIME.treeshake??1)*(player.reduced?.6:1),pushes:0,dir,dropped:false};stats.shakes++;
  if(sway&&sway.tree!==ti)endSway();
  ports.pose({x:g.x,z:g.z},{stand:c.root,lean:c.lean,lead});ports.haptic?.();
 }
 function startShake(){
  if(!built||near<0||shake||arriving||ports.busy?.())return false;
  const ti=near,t=trees[ti];if(!hangCount[ti])return false;
  if(player.onFoot){begin(ti);return true;}
  if(!player.arrival||!ports.dismount)return false;
  // Off the ride / out of the air first: a flight lands a step out from the grip side (that spot was checked clear at the choice).
  const a=gripSide(t),c=contactAt(t,a),spot={x:c.root.x+Math.cos(a)*1,z:c.root.z+Math.sin(a)*1};
  if(!ports.dismount(player.arrival,spot))return false;
  arriving={tree:ti,how:player.arrival,age:0};ports.haptic?.();return true;
 }
 function startSway(ti:number){bareSway=null;if(sway&&sway.tree===ti)return sway;if(sway)endSway();const t=trees[ti];
  sway={tree:ti,ang:0,vel:0,axis:new T.Vector3(1,0,0),pivot:new T.Vector3(t.x,t.y,t.z),h:t.rig.sway.h,bend:t.rig.sway.bend};
  U.tree.value=t.tid;U.pivot.value.copy(sway.pivot);U.height.value=sway.h;U.bend.value=sway.bend;U.angle.value=0;return sway;}
 function endSway(){if(!sway)return;const ti=sway.tree;sway=null;U.angle.value=0;U.tree.value=0;
  slots.forEach((s,i)=>{if(s.tree===ti&&s.mode==='hang')paint(i);});}
 /** A shove on tree ti along `dir` (player → trunk, or the ball's travel): the tree tilts away from it. */
 function shove(ti:number,dir:T.Vector2,strength:number){const sw=startSway(ti);sw.axis.set(dir.y,0,-dir.x).normalize();U.axis.value.copy(sw.axis);sw.vel+=strength*(player.reduced?.35:1);}
 function push(){const sh=shake!,t=trees[sh.tree],last=sh.pushes===TREE_SHAKE_PUSHES.length-1;
  cue('rustle');ports.haptic?.();if(last)ports.shook?.(t.x,t.z);
  // The strongest push is the last one: the fruit drops on it.
  shove(sh.tree,sh.dir,last?1.35:.9);
  if(!player.reduced){const c=t.rig.crown;fx!.burst(c.x,c.y+.3,c.z,t.kind==='palm'||c.hang==='under'?LEAF_PALM:LEAF_TREE,4,1.5,.5,true,1.5);}
 }
 /** A landing spot for a falling fruit: on `away`'s side of the trunk, fanned out 1.6–2.6 m, on walkable ground. */
 function landing(t:FruitTree,n:number,away:T.Vector2){const back=Math.atan2(-away.y,-away.x);
  for(let tryN=0;tryN<8;tryN++){const a=back+((n%3)-1)*.75+(rand()-.5)*.5+(tryN?(tryN%2?1:-1)*tryN*.4:0),r=1.6+rand()*1;const x=t.x+Math.cos(a)*r,z=t.z+Math.sin(a)*r;
   if(walkable(x,z)&&Math.abs(ground(x,z)-t.y)<1.2)return {x,z};}
  return {x:player.x,z:player.z};}
 /** Up to `n` fruit fall from tree ti, landing on `away`'s side. Returns how many fell. */
 function drop(ti:number,count:(hanging:number,allowed:number)=>number,away:T.Vector2){const t=trees[ti];if(!save)return 0;
  const onGround=slots.filter(s=>s.mode==='fall'||s.mode==='ground').length,allowed=capLeft(save,now())-onGround;
  const hanging=hangingSlots(ti),n=count(hanging.length,allowed);
  if(n<=0){if(allowed<=0&&hanging.length)note(`You've foraged ${FORAGE.dailyCap} fruit today. Leave the rest for the birds. More tomorrow!`);return 0;}
  for(let j=0;j<n;j++){const s=hanging[hanging.length-1-j],i=slots.indexOf(s),L=FRUIT_LOOK[t.fruit],to=landing(t,j,away),gy=ground(to.x,to.z)+L.r*L.stretch[1]*.85;
   // From where it hangs right now (the canopy is mid-sway), a small hop up, landing on the spot.
   if(sway&&sway.tree===ti)swayed(s.hang,s.pos);else s.pos.copy(s.hang);
   s.mode='fall';s.bounces=0;s.age=0;s.spin=(rand()-.5)*10;
   if(player.reduced){s.pos.set(to.x,gy,to.z);s.vel.set(0,0,0);s.mode='ground';paint(i);continue;}
   const vy=.6+j*.25,h=Math.max(.2,s.pos.y-gy),tf=(vy+Math.sqrt(vy*vy+2*G*h))/G;s.vel.set((to.x-s.pos.x)/tf,vy,(to.z-s.pos.z)/tf);paint(i);}
  stats.dropped+=n;recount();
  if(player.reduced)cue('thud');
  return n;
 }
 function pick(i:number){const s=slots[i],t=trees[s.tree],good=goodById(t.fruit);if(!save||!good)return false;
  const added=ports.gather(good.id);
  if(!added){if(forageStore.get().note!=='Your basket is full! Sell some at a farm stand, then come back for it.')note('Your basket is full! Sell some at a farm stand, then come back for it.');return false;}
  const first=!save.tip;persist({...recordPick(save,t.id,now()),tip:true});stats.picked++;
  s.mode='fly';s.age=0;s.fly.set(s.pos.x,s.pos.y,s.pos.z);cue('pick');ports.haptic?.();
  if(!player.reduced)fx!.burst(s.pos.x,s.pos.y+.15,s.pos.z,SPARKLE[stats.picked%3],8,1.1,2.6,false,.9);
  if(first)note(FORAGE_TIP,true);else note(`+1 ${good.name} in your basket`);
  return true;}

 function onKey(e:KeyboardEvent){if(e.key.toLowerCase()!=='e'||e.repeat||!promptShown)return;const el=e.target as HTMLElement|null;if(el&&(el.tagName==='INPUT'||el.tagName==='TEXTAREA'||el.isContentEditable))return;if(startShake())e.preventDefault();}
 if(typeof window!=='undefined')window.addEventListener('keydown',onKey);
 forageActions.shake=()=>{startShake();};

 const anchor=new T.Vector3();
 return {
  root,stats,
  get trees():readonly FruitTree[]{const b=ports.budgetMs;ports.budgetMs=Infinity;while(!built)choose();ports.budgetMs=b;return pool;},
  get busy(){return !!shake||!!sway||!!arriving||moving>0;},
  /** Debug and tests: today's fruiting trees (hanging fruit now), the whole pool, and the fruit on the ground or falling. */
  view(){return {day,pool:pool.map(t=>t.id),trees:trees.map((t,ti)=>({id:t.id,fruit:t.fruit,form:t.form??t.kind,x:t.x,z:t.z,y:t.y,tid:t.tid,stand:t.stand,grip:t.rig.grip,hanging:hangingSlots(ti).length,dawn:dawn[ti]})),
   fallen:slots.filter(s=>s.mode==='fall'||s.mode==='ground').map(s=>({tree:trees[s.tree].id,mode:s.mode,x:s.pos.x,y:s.pos.y,z:s.pos.z,bounces:s.bounces})),
   swaying:!!sway,swayTree:sway?trees[sway.tree].tid:0,shaking:!!shake,arriving:arriving?{tree:trees[arriving.tree].id,how:arriving.how}:null,save};},
  /** Dev and heat runs only (scratch probes): every tree full again and today's count back to 0. */
  refill(){if(!save)return;persist({...save,today:0,trees:{}});refresh();},
  /** Tap / E: shake the tree in reach (from a ride or the air: hop off or land first). */
  shake:startShake,
  /** A kicked ball met a collider at (x, y, z) moving (vx, vz): if that is a fruit tree's trunk or lower canopy and the ball is
   *  fast enough, the tree sways and drops 1–2 fruit (today's fruiting trees only; a bare tree just sways). Called by the host
   *  only on a ball collision, so nothing runs at rest. */
  ballHit(x:number,y:number,z:number,vx:number,vz:number){
   if(!built||!pool.length||OFF)return false;const speed=Math.hypot(vx,vz);if(speed<FORAGE.ballMin)return false;
   let hit=-1,bare:FruitTree|null=null;
   for(let i=-1;i<=1&&hit<0;i++)for(let j=-1;j<=1&&hit<0;j++){const l=buckets.get((Math.floor(x/BUCKET)+i)*8192+Math.floor(z/BUCKET)+j);if(!l)continue;
    for(const ti of l){const t=trees[ti],c=t.rig.crown,d=Math.hypot(t.x-x,t.z-z);if(d<t.rig.baseR+.7&&y<t.y+3||c.hang==='canopy'&&Math.hypot(c.x-x,c.z-z)<c.rx&&Math.abs(c.y-y)<c.ry+.3){hit=ti;break;}}}
   if(hit<0){for(const t of pool)if(Math.hypot(t.x-x,t.z-z)<t.rig.baseR+.7&&y<t.y+3){bare=t;break;}if(!bare)return false;}
   const t0=now(),tid=hit>=0?trees[hit].tid:bare!.tid;if(t0-(hitAt.get(tid)??-1e9)<600)return true;hitAt.set(tid,t0);stats.ballHits++;
   const dir=new T.Vector2(vx,vz).normalize();cue('rustle');ports.haptic?.();
   if(hit<0){// a bare tree today: it sways (shader only), nothing falls
    const b=bare!;if(sway)endSway();U.tree.value=b.tid;U.pivot.value.set(b.x,b.y,b.z);U.height.value=b.rig.sway.h;U.bend.value=b.rig.sway.bend;U.axis.value.set(dir.y,0,-dir.x);
    bareSway={ang:0,vel:Math.min(1.2,speed/9)*(player.reduced?.35:1)};return true;}
   bareSway=null;shove(hit,dir,Math.min(1.5,.5+speed/10));
   if(!shake){const n=drop(hit,(h,a)=>ballDropCount(speed,h,a),new T.Vector2(-dir.x,-dir.y));if(n>0)countFruitShake(trees[hit].fruit,'ball');}
   return true;},
  /** Per frame (Town's HUD block): the prompt, the arrival, the shake, sway, falls and pickups. Off the island: one box test. */
  update(c:ForageUpdate):{key:string;distance:number}|null{
   const prompt=c.ui<HTMLButtonElement>('[data-summit-forage]');
   if(OFF){if(prompt&&!prompt.hidden)c.hide(prompt,true);return null;}
   const onIsle=c.x>SUMMIT_BOX.minX-NEAR_BOX&&c.x<SUMMIT_BOX.maxX+NEAR_BOX&&c.z>SUMMIT_BOX.minZ-NEAR_BOX&&c.z<SUMMIT_BOX.maxZ+NEAR_BOX;
   if(c.frozen||!onIsle&&!shake&&!sway&&!bareSway&&!moving&&!arriving){if(promptShown&&prompt){c.hide(prompt,true);}promptShown=false;near=-1;stats.idleFrames++;return null;}
   if(!built){choose();if(!built){stats.idleFrames++;return null;}}
   if(!mesh&&!pool.length){if(prompt&&!prompt.hidden)c.hide(prompt,true);return null;}
   player.x=c.x;player.z=c.z;player.onFoot=c.onFoot;player.reduced=c.reduced;player.arrival=c.onFoot?null:c.arrival??null;
   // A new local day: a fresh set of fruiting trees (rare: only when playing across midnight).
   if(!shake&&!arriving&&!moving&&localForageDay(now())!==day)buildDay();
   let work=false;
   // ---- off the ride / out of the air, then the shake (the host locks input meanwhile)
   if(arriving){work=true;arriving.age+=c.dt;
    if(c.onFoot){const a=arriving;arriving=null;if(a.how==='fly')ports.touchdown?.();if(hangCount[a.tree]&&!ports.busy?.())begin(a.tree);}
    else if(arriving.age>ARRIVAL_WAIT)arriving=null;}
   // ---- the shake: stepping in (t < 0), then a shove at each of the pose's push peaks; the fruit drops on the last
   if(shake){work=true;shake.t+=c.dt;const k=shake.t/shake.dur;
    while(shake&&shake.pushes<TREE_SHAKE_PUSHES.length&&k>=TREE_SHAKE_PUSHES[shake.pushes]){push();shake.pushes++;if(shake.pushes===TREE_SHAKE_PUSHES.length&&!shake.dropped){shake.dropped=true;const n=drop(shake.tree,(h,a)=>dropCount(rand(),h,a),shake.dir);if(n>0)countFruitShake(trees[shake.tree].fruit,'hand');}}
    if(shake&&k>=1){if(!shake.dropped){const n=drop(shake.tree,(h,a)=>dropCount(rand(),h,a),shake.dir);if(n>0)countFruitShake(trees[shake.tree].fruit,'hand');}shake=null;}}
   // ---- the sway: a damped spring (≈1.6 Hz) on the shader's angle, back to exactly 0 once it settles
   if(sway){work=true;const w=2*Math.PI*1.6,dt=Math.min(c.dt,.05);sway.vel+=(-w*w*sway.ang-2*.2*w*sway.vel)*dt;sway.ang+=sway.vel*dt;
    if(!shake&&Math.abs(sway.ang)<.002&&Math.abs(sway.vel)<.03)endSway();
    else{U.angle.value=sway.ang;slots.forEach((s,i)=>{if(s.tree===sway!.tree&&s.mode==='hang')paint(i);});}}
   if(bareSway){work=true;const w=2*Math.PI*1.6,dt=Math.min(c.dt,.05);bareSway.vel+=(-w*w*bareSway.ang-2*.2*w*bareSway.vel)*dt;bareSway.ang+=bareSway.vel*dt;
    if(Math.abs(bareSway.ang)<.002&&Math.abs(bareSway.vel)<.03){bareSway=null;U.angle.value=0;U.tree.value=0;}else U.angle.value=bareSway.ang;}
   // ---- falling, lying and flying-to-hand fruit
   moving=0;
   for(let i=0;i<slots.length;i++){const s=slots[i];if(!inUse(s))continue;moving++;work=true;const t=trees[s.tree],L=FRUIT_LOOK[t.fruit];s.age+=c.dt;
    if(s.mode==='fall'){const dt=Math.min(c.dt,.05);s.vel.y-=G*dt;s.pos.addScaledVector(s.vel,dt);const gy=ground(s.pos.x,s.pos.z)+L.r*L.stretch[1]*.85;
     if(s.pos.y<=gy){s.pos.y=gy;if(s.bounces===0)cue('thud');
      if(s.vel.y<-1.1&&s.bounces<3){s.vel.y=-s.vel.y*.36;s.vel.x*=.45;s.vel.z*=.45;s.bounces++;}else{s.mode='ground';s.age=0;s.vel.set(0,0,0);}}
     paint(i);}
    else if(s.mode==='ground'){
     // Picked up by walking over it (after a moment's rest, once the shake is over); back up the tree if left behind.
     const d=Math.hypot(s.pos.x-c.x,s.pos.z-c.z);
     if(s.age>.35&&!shake&&c.onFoot&&d<=FORAGE.pickup)pick(i);
     else if(d>FORAGE.forget){s.mode='hang';paint(i);refresh();}}
    else if(s.mode==='fly'){const k=Math.min(1,s.age/.32);if(c.reduced||k>=1){s.mode='hidden';paint(i);refresh();continue;}
     const gy=ground(c.x,c.z)+1.1;s.pos.set(s.fly.x+(c.x-s.fly.x)*k,s.fly.y+(gy-s.fly.y)*k+Math.sin(k*Math.PI)*.5,s.fly.z+(c.z-s.fly.z)*k);paint(i);}}
   if(fx&&fx.busy){work=true;fx.update(c.dt);}
   if(dirty&&mesh){mesh.instanceMatrix.needsUpdate=true;dirty=false;}
   if(work)stats.busyFrames++;else stats.idleFrames++;
   // ---- the prompt: the nearest fruiting tree with fruit within reach (on foot, riding, or flying low; nothing else on)
   near=-1;const reach=c.onFoot?FORAGE.reach:player.arrival==='ride'?FORAGE.reachRide:player.arrival==='fly'?FORAGE.reachFly:0;let best=reach;
   if(reach&&c.canEnter&&!shake&&!arriving)for(let ti=0;ti<trees.length;ti++){if(!hangCount[ti])continue;const t=trees[ti],dx=t.x-c.x,dz=t.z-c.z;if(Math.abs(dx)>best||Math.abs(dz)>best)continue;const d=Math.hypot(dx,dz);if(d<best){best=d;near=ti;}}
   // Flying: only low over it (read the height only when a tree is in reach).
   if(near>=0&&player.arrival==='fly'&&!((c.air?.()??Infinity)<=FORAGE.flyHeight))near=-1;
   const want=near>=0?{key:'forage',distance:best}:null;
   if(near>=0){const l=label(trees[near]);if(l!==lastLabel){lastLabel=l;forageStore.set({label:l});}}
   if(prompt){let hidden=!(want&&c.focusKey==='forage');
    if(!hidden){const t=trees[near];anchor.set(t.x,t.top.y+.5,t.z).project(c.camera);// above the canopy, clear of the fruit
     hidden=anchor.z< -1||anchor.z>1;
     if(!hidden)c.place(prompt,T.MathUtils.clamp((anchor.x+1)*c.width/2,115,c.width-115),// a longer label than Enter: kept on screen
     T.MathUtils.clamp((1-anchor.y)*c.height/2,90,c.height-160));}
    c.hide(prompt,hidden);promptShown=!hidden;}
   return want;
  },
  dispose(){if(typeof window!=='undefined')window.removeEventListener('keydown',onKey);forageActions.shake=()=>{};forageStore.reset();
   endSway();bareSway=null;U.angle.value=0;U.tree.value=0;fx?.dispose();root.removeFromParent();geo?.dispose();mat?.dispose();mesh?.dispose();
   mesh=null;geo=null;mat=null;fx=null;shake=null;arriving=null;slots=[];trees=[];pool=[];built=false;},
 };
}
export type SummitForage=ReturnType<typeof createSummitForage>;
