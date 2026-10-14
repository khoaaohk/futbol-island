/**
 * Summit Isle fruit trees runtime (Oct 13 2026): the fruit hanging in the island's fruit trees, the "Shake the tree" prompt, the
 * shake (the character's push pose, the canopy's damped sway, leaves, the fruit falling and bouncing) and the pickups into the
 * market basket. Rules and the save: lib/town/summitForage.ts. Prompt and notes: components/ForagePrompt.tsx.
 *
 * Heat:
 *  - All the fruit on the island is ONE instanced mesh (1 draw call, no shadow): hanging, falling, lying and flying-to-hand fruit
 *    are instances of it. Built the first time the player comes near Summit Isle; frustum-culled with a fixed bounding sphere.
 *  - Nothing animates at rest. Off the island update() is one box test; on it, a handful of distances for the prompt and one
 *    comparison for the regrow clock. Per-frame work only while a shake, a sway, a fall or a pickup is under way (a few seconds).
 *  - The canopy sway is a copy of the shaken tree's canopy (same shape and colours, a touch larger, no shadow) that tilts about
 *    the trunk top while it sways; it is the only extra draw call and exists only then (the trees themselves are baked scenery).
 *  - Leaves and the pickup sparkle share one pooled particle mesh (jobFx: 36 instances, hidden when idle).
 *  - No timers, no rAF of its own; one keydown listener (E shakes when the prompt shows). The host skips update() while the
 *    fishing focus holds the island still (frozen).
 * Reduced motion: no sway or leaves; the fruit lands at once (the pickups and the basket work the same).
 */
import * as T from 'three';
import {createJobFx,type JobFx} from '../town/jobs/jobFx';
import {POSE_TIME} from '../town/jobs/jobMoves';
import {TREE_SHAKE_PUSHES} from './jobPoses';
import {FORAGE,FRUIT_LOOK,FORAGE_TIP,FOLLOW_CAMERA,fruitTreeSteps,hangingNow,capLeft,recordPick,dropCount,readForage,writeForage,nextRegrowAt,forageStore,forageActions,
 type FruitTree,type ForageSave,type TreeSite} from '../town/summitForage';
import {SUMMIT_TREE_SITES} from '../town/summitIsleWorld';
import {SUMMIT_BOX,SUMMIT_PATHS,SUMMIT_LANDMARKS,SUMMIT_CENTER,SUMMIT_VISUAL_DROP,summitGround,onSummitIsle,beachPoint,summitCameraPull} from '../town/summitIsle';
import {insideObstacle,type Obstacle} from '../town/simulation';
import {goodById} from '../town/market/goods';

type Ports={
 /** The island's colliders (world.obstacles), to choose reachable trees and landing spots clear of trunks and rocks. */
 obstacles:readonly Obstacle[];
 /** Start the character's push-and-shake at this trunk (Town: jobMoves.start('treeshake', …), which steps up and faces it). */
 pose:(trunk:{x:number;z:number})=>void;
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
 /** Milliseconds per frame for choosing the fruit trees (the first time the player nears the island). */
 budgetMs?:number;
};
export type ForageUpdate={
 dt:number;x:number;z:number;
 /** On foot on the ground (not flying, riding, falling or on a truck). */
 onFoot:boolean;canEnter:boolean;
 /** The fishing focus holds the island still: no work at all. */
 frozen:boolean;reduced:boolean;
 camera:T.Camera;width:number;height:number;
 /** The HUD arbiter's current 'enter' key (lib/ui/hudStack.ts), so exactly one prompt shows. */
 focusKey:string|null;
 ui:<E extends HTMLElement>(selector:string)=>E|null|undefined;place:(el:HTMLElement,x:number,y:number)=>void;hide:(el:HTMLElement,hidden:boolean)=>void;
};
type Slot={tree:number;k:number;mode:'hang'|'hidden'|'fall'|'ground'|'fly';hang:T.Vector3;pos:T.Vector3;vel:T.Vector3;bounces:number;age:number;spin:number;fly:T.Vector3};
const G=9.8,NEAR_BOX=40;
/** ?forage=0: the fruit trees are off (A/B heat runs, like ?fishfocus=0). */
const OFF=typeof location!=='undefined'&&typeof URLSearchParams!=='undefined'&&new URLSearchParams(location.search).get('forage')==='0';
const DUMMY=new T.Object3D(),Q=new T.Quaternion(),V=new T.Vector3(),M=new T.Matrix4(),AX=new T.Vector3();
const LEAF_TREE='#6f9a55',LEAF_PALM='#5b895e',SPARKLE=['#fff3b0','#ffe18a','#ffffff'];

/** The shaken tree's canopy, copied from lib/town/summitIsleWorld.ts tree() / palm() (keep in step), 7% larger so it covers the
 *  baked one while it tilts. Vertex colours, positions relative to the sway pivot. */
function canopyCopy(t:FruitTree,pivot:T.Vector3){
 const parts:T.BufferGeometry[]=[],m=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),p=new T.Vector3(),sc=new T.Vector3();
 const add=(g:T.BufferGeometry,hex:string,x:number,y:number,z:number,rx:number,ry:number,rz:number,sx=1,sy=1,sz=1)=>{
  m.compose(p.set(x-pivot.x,y-pivot.y,z-pivot.z),q.setFromEuler(e.set(rx,ry,rz)),sc.set(sx,sy,sz));const ng=g.index?g.toNonIndexed():g;if(ng!==g)g.dispose();ng.applyMatrix4(m);
  const c=new T.Color(hex),n=ng.getAttribute('position').count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=c.r;a[i*3+1]=c.g;a[i*3+2]=c.b;}ng.setAttribute('color',new T.BufferAttribute(a,3));ng.deleteAttribute('uv');parts.push(ng);};
 const i=t.seed,s=t.size,k=1.07;
 if(t.kind==='tree'){
  add(new T.IcosahedronGeometry(1.7*s*k,0),i%3?'#5b895e':'#4f7f55',t.x,t.y+2.9*s,t.z,0,i,0);
  add(new T.IcosahedronGeometry(1.15*s*k,0),i%2?'#6f9a62':'#5b895e',t.x+.6*s,t.y+3.9*s,t.z-.3*s,0,i*2,0);
 }else{const {x:tx,y:ty,z:tz}=t.top;
  for(let f=0;f<6;f++){const a=f/6*Math.PI*2+i;add(new T.BoxGeometry(2.6,.06,.5),f%2?'#5b895e':'#3f7a4f',tx+Math.cos(a)*1.15,ty-.25,tz+Math.sin(a)*1.15,0,-a,-.42,1.04,1.6,1.08);}
  add(new T.IcosahedronGeometry(.28*k,0),'#7a5a3a',tx,ty-.35,tz,0,0,0);}
 // Merge by hand (no extra import): positions, normals, colours of the non-indexed parts.
 let n=0;for(const g of parts)n+=g.getAttribute('position').count;
 const pos=new Float32Array(n*3),nor=new Float32Array(n*3),colr=new Float32Array(n*3);let o=0;
 for(const g of parts){const P=g.getAttribute('position'),N=g.getAttribute('normal'),C=g.getAttribute('color');pos.set(P.array as Float32Array,o*3);nor.set(N.array as Float32Array,o*3);colr.set(C.array as Float32Array,o*3);o+=P.count;g.dispose();}
 const out=new T.BufferGeometry();out.setAttribute('position',new T.BufferAttribute(pos,3));out.setAttribute('normal',new T.BufferAttribute(nor,3));out.setAttribute('color',new T.BufferAttribute(colr,3));out.computeBoundingSphere();return out;
}
/** The pivot a tree sways about: halfway up the trunk, so the canopy visibly swings (a palm: just under its crown). */
const pivotOf=(t:FruitTree)=>t.kind==='tree'?new T.Vector3(t.x,t.y+1.1*t.size,t.z):new T.Vector3(t.top.x,t.top.y-1.2,t.top.z);
/** Where fruit k hangs: half out of the canopy on the follow camera's side (it looks from +x +z), so it reads at a glance. */
function hangPoint(t:FruitTree,k:number):T.Vector3{
 const cam=1.03,j=((t.seed*37)%10)/10-.5;
 if(t.kind==='palm'){const a=cam+(k-1)*1.1+j*.4;return new T.Vector3(t.top.x+Math.cos(a)*.46,t.top.y-.62-(k%2)*.14,t.top.z+Math.sin(a)*.46);}
 const s=t.size,c=new T.Vector3(t.x,t.y+2.9*s,t.z),R=1.7*s*.97,a=cam+(k-1)*.95+j*.5,el=[-.18,.22,-.45][k%3];
 return c.add(new T.Vector3(Math.cos(el)*Math.cos(a)*R,Math.sin(el)*R,Math.cos(el)*Math.sin(a)*R));
}

export function createSummitForage(scene:T.Scene,ports:Ports){
 const now=ports.now??(()=>Date.now()),rand=ports.random??Math.random,cue=(k:string)=>ports.cue?.(k);
 const root=new T.Group();root.name='summit-fruit-trees';
 let built=false,trees:FruitTree[]=[],slots:Slot[]=[],save:ForageSave|null=null,mesh:T.InstancedMesh|null=null,geo:T.BufferGeometry|null=null,mat:T.MeshStandardMaterial|null=null;
 let shellMat:T.MeshStandardMaterial|null=null,fx:JobFx|null=null,nextRegrow=0,dirty=false;
 /** The shake under way: the tree, its clock, the pushes done, the push direction (player → trunk). */
 let shake:{tree:number;t:number;dur:number;pushes:number;dir:T.Vector2;dropped:boolean}|null=null;
 /** The sway after a shake: a damped spring on the canopy's tilt about its pivot (only while it moves). */
 let sway:{tree:number;ang:number;vel:number;axis:T.Vector3;pivot:T.Vector3;shell:T.Mesh}|null=null;
 let near=-1,promptShown=false,lastLabel='',moving=0;
 const player={x:0,z:0,onFoot:false,reduced:false};
 const stats={built:false,trees:0,fruit:0,shakes:0,dropped:0,picked:0,busyFrames:0,idleFrames:0,get swaying(){return !!sway;},get moving(){return moving;}};
 const readSave=()=>readForage(now(),ports.read);
 const persist=(s:ForageSave)=>{save=s;writeForage(s,ports.write);};
 const note=(text:string,tip=false)=>{const v=forageStore.get();forageStore.set({note:text,notes:v.notes+1,tip});};
 const ground=(x:number,z:number)=>summitGround(x,z)-SUMMIT_VISUAL_DROP;
 /** Summit Isle's colliders in 4 m cells (filled at build): Simulation's blocked() scans every collider and re-tests the land
  *  shape, too slow for the few thousand checks the tree choice makes. */
 const cells=new Map<number,Obstacle[]>(),CELL=4,key=(i:number,j:number)=>i*8192+j;
 const hits=(x:number,z:number)=>{const l=cells.get(key(Math.floor(x/CELL),Math.floor(z/CELL)));return !!l&&l.some(o=>insideObstacle(x,z,o,.32));};
 const walkable=(x:number,z:number)=>!hits(x,z)&&onSummitIsle(x,z);

 /** The tree choice runs a few checks per frame (≤ ports.budgetMs, default 3 ms) the first time the player nears the island. */
 let chooser:Generator<void,FruitTree[],void>|null=null;
 const clock=()=>typeof performance!=='undefined'?performance.now():Date.now();
 function choose(){
  if(!chooser){const sites=(ports.sites??(()=>SUMMIT_TREE_SITES))();
   // Only the Summit Isle colliders matter here: bucketed once, so the reachability checks stay cheap.
   for(const o of ports.obstacles){if(o.x<SUMMIT_BOX.minX-5||o.x>SUMMIT_BOX.maxX+5||o.z<SUMMIT_BOX.minZ-5||o.z>SUMMIT_BOX.maxZ+5)continue;const r=Math.max(o.w,o.d)/2+.4;
    for(let i=Math.floor((o.x-r)/CELL);i<=Math.floor((o.x+r)/CELL);i++)for(let j=Math.floor((o.z-r)/CELL);j<=Math.floor((o.z+r)/CELL);j++){const k=key(i,j);let l=cells.get(k);if(!l)cells.set(k,l=[]);l.push(o);}}
   chooser=fruitTreeSteps(sites,{walkable:onSummitIsle,blocked:hits,ground,paths:SUMMIT_PATHS,landing:SUMMIT_LANDMARKS.sandbarLanding,
    beach:(x,z)=>beachPoint(Math.atan2(z-SUMMIT_CENTER.z,x-SUMMIT_CENTER.x),.5),view:(x,z,y)=>summitCameraPull(x,z,y,x+FOLLOW_CAMERA.x,y+FOLLOW_CAMERA.y,z+FOLLOW_CAMERA.z)});}
  const until=clock()+(ports.budgetMs??3);let r=chooser.next();while(!r.done&&clock()<until)r=chooser.next();
  if(r.done){chooser=null;trees=r.value;build();}
 }
 function build(){
  built=true;stats.built=true;
  stats.trees=trees.length;if(!trees.length)return;
  save=readSave();
  geo=new T.IcosahedronGeometry(1,1);mat=new T.MeshStandardMaterial({color:'#ffffff',roughness:.5,emissive:'#4a3510',emissiveIntensity:.3});
  mesh=new T.InstancedMesh(geo,mat,trees.length*FORAGE.perTree);mesh.name='summit-fruit';mesh.castShadow=false;mesh.receiveShadow=false;
  const c=new T.Color();
  trees.forEach((t,ti)=>{for(let k=0;k<FORAGE.perTree;k++){const h=hangPoint(t,k);slots.push({tree:ti,k,mode:'hidden',hang:h,pos:h.clone(),vel:new T.Vector3(),bounces:0,age:0,spin:0,fly:new T.Vector3()});
   mesh!.setColorAt(ti*FORAGE.perTree+k,c.set(FRUIT_LOOK[t.fruit].color));}});
  for(let i=0;i<slots.length;i++){paint(i,true);}
  mesh.computeBoundingSphere();if(mesh.boundingSphere)mesh.boundingSphere.radius+=4;// falls land within a few metres of the trees
  fx=createJobFx(root);root.add(mesh);scene.add(root);
  refresh();
 }
 /** Instance matrix of slot i (hidden = zero scale where it hangs, so the bounding sphere never reaches the origin). */
 function paint(i:number,hide=false){if(!mesh)return;const s=slots[i],t=trees[s.tree],L=FRUIT_LOOK[t.fruit];
  if(hide||s.mode==='hidden'){DUMMY.position.copy(s.hang);DUMMY.rotation.set(0,0,0);DUMMY.scale.setScalar(0);}
  else{let p=s.pos;if(s.mode==='hang'){p=s.hang;if(sway&&sway.tree===s.tree&&sway.ang!==0){Q.setFromAxisAngle(sway.axis,sway.ang);p=V.copy(s.hang).sub(sway.pivot).applyQuaternion(Q).add(sway.pivot);}}
   const shrink=s.mode==='fly'?Math.max(.05,1-s.age/.32):1;DUMMY.position.copy(p);DUMMY.rotation.set(s.mode==='ground'?Math.PI/2*(L.stretch[1]>1.2?1:0):s.spin*s.age,s.k*1.3,0);
   DUMMY.scale.set(L.r*L.stretch[0]*shrink,L.r*L.stretch[1]*shrink,L.r*L.stretch[2]*shrink);}
  DUMMY.updateMatrix();mesh.setMatrixAt(i,DUMMY.matrix);dirty=true;}
 const inUse=(s:Slot)=>s.mode==='fall'||s.mode==='ground'||s.mode==='fly';
 const fallenFrom=(ti:number)=>slots.reduce((n,s)=>n+(s.tree===ti&&(s.mode==='fall'||s.mode==='ground')?1:0),0);
 const hangingSlots=(ti:number)=>slots.filter(s=>s.tree===ti&&s.mode==='hang');
 /** Hanging fruit per tree, recounted only when fruit changes state (the prompt reads it every frame). */
 let hangCount:number[]=[];
 const recount=()=>{hangCount=trees.map(()=>0);for(const s of slots)if(s.mode==='hang')hangCount[s.tree]++;stats.fruit=hangCount.reduce((a,b)=>a+b,0);};
 /** Hanging fruit = the save's count minus any lying under the tree (regrow shows here). */
 function refresh(){if(!save||!mesh)return;const t0=now();nextRegrow=Infinity;
  trees.forEach((t,ti)=>{const want=Math.max(0,hangingNow(save!,t.id,t0)-fallenFrom(ti));let have=hangingSlots(ti).length;
   for(let k=0;k<FORAGE.perTree&&have!==want;k++){const i=ti*FORAGE.perTree+k,s=slots[i];if(inUse(s))continue;
    if(have<want&&s.mode==='hidden'){s.mode='hang';have++;paint(i);}else if(have>want&&s.mode==='hang'){s.mode='hidden';have--;paint(i);}}
   const at=nextRegrowAt(save!,t.id,t0);if(at)nextRegrow=Math.min(nextRegrow,at);});
  recount();
 }
 const label=(t:FruitTree)=>`Shake the ${FRUIT_LOOK[t.fruit].tree}`;

 function startShake(){
  if(!built||near<0||shake||!player.onFoot||ports.busy?.())return false;
  const ti=near,t=trees[ti];if(!hangCount[ti])return false;
  const dir=new T.Vector2(t.x-player.x,t.z-player.z);if(dir.lengthSq()<1e-4)dir.set(0,1);dir.normalize();
  shake={tree:ti,t:0,dur:(POSE_TIME.treeshake??1)*(player.reduced?.6:1),pushes:0,dir,dropped:false};stats.shakes++;
  if(sway&&sway.tree!==ti)endSway();
  ports.pose({x:t.x,z:t.z});ports.haptic?.();
  return true;
 }
 function startSway(ti:number){if(sway&&sway.tree===ti)return sway;if(sway)endSway();const t=trees[ti],pivot=pivotOf(t);
  shellMat??=new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.85});
  const shell=new T.Mesh(canopyCopy(t,pivot),shellMat);shell.name='summit-fruit-tree-sway';shell.position.copy(pivot);shell.castShadow=false;shell.receiveShadow=true;root.add(shell);
  sway={tree:ti,ang:0,vel:0,axis:new T.Vector3(),pivot,shell};return sway;}
 function endSway(){if(!sway)return;const ti=sway.tree;sway.shell.removeFromParent();sway.shell.geometry.dispose();sway=null;
  slots.forEach((s,i)=>{if(s.tree===ti&&s.mode==='hang')paint(i);});}
 function push(){const sh=shake!,t=trees[sh.tree];
  cue('rustle');ports.haptic?.();
  if(!player.reduced){const sw=startSway(sh.tree);
   // Tilt away from the push first: the axis is horizontal, across the push direction.
   sw.axis.set(sh.dir.y,0,-sh.dir.x).normalize();sw.vel+=1.15;
   const leafY=t.kind==='tree'?t.y+3.2*t.size:t.top.y-.2;fx!.burst(t.kind==='tree'?t.x:t.top.x,leafY,t.kind==='tree'?t.z:t.top.z,t.kind==='tree'?LEAF_TREE:LEAF_PALM,4,1.5,.5,true,1.5);}
 }
 /** A landing spot for a falling fruit: on the player's side of the trunk, fanned out 1.6–2.6 m, on walkable ground. */
 function landing(t:FruitTree,n:number){const back=Math.atan2(-shake!.dir.y,-shake!.dir.x);
  for(let tryN=0;tryN<8;tryN++){const a=back+((n%3)-1)*.75+(rand()-.5)*.5+(tryN?(tryN%2?1:-1)*tryN*.4:0),r=1.6+rand()*1;const x=t.x+Math.cos(a)*r,z=t.z+Math.sin(a)*r;
   if(walkable(x,z)&&Math.abs(ground(x,z)-t.y)<1.2)return {x,z};}
  return {x:player.x,z:player.z};}
 function drop(){const sh=shake!,ti=sh.tree,t=trees[ti];if(!save)return;
  const onGround=slots.filter(s=>s.mode==='fall'||s.mode==='ground').length,allowed=capLeft(save,now())-onGround;
  const hanging=hangingSlots(ti),n=dropCount(rand(),hanging.length,allowed);
  if(n<=0){if(allowed<=0)note(`You've foraged ${FORAGE.dailyCap} fruit today. Leave the rest for the birds. More tomorrow!`);return;}
  for(let j=0;j<n;j++){const s=hanging[hanging.length-1-j],i=slots.indexOf(s),L=FRUIT_LOOK[t.fruit],to=landing(t,j),gy=ground(to.x,to.z)+L.r*L.stretch[1]*.85;
   // From where it hangs right now (the canopy is mid-sway), a small hop up, landing on the spot.
   if(sway&&sway.tree===ti){Q.setFromAxisAngle(sway.axis,sway.ang);s.pos.copy(s.hang).sub(sway.pivot).applyQuaternion(Q).add(sway.pivot);}else s.pos.copy(s.hang);
   s.mode='fall';s.bounces=0;s.age=0;s.spin=(rand()-.5)*10;
   if(player.reduced){s.pos.set(to.x,gy,to.z);s.vel.set(0,0,0);s.mode='ground';paint(i);continue;}
   const vy=.6+j*.25,h=Math.max(.2,s.pos.y-gy),tf=(vy+Math.sqrt(vy*vy+2*G*h))/G;s.vel.set((to.x-s.pos.x)/tf,vy,(to.z-s.pos.z)/tf);paint(i);}
  stats.dropped+=n;recount();
  if(player.reduced)cue('thud');
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
  get trees():readonly FruitTree[]{const b=ports.budgetMs;ports.budgetMs=Infinity;while(!built)choose();ports.budgetMs=b;return trees;},
  get busy(){return !!shake||!!sway||moving>0;},
  /** Debug and tests: each fruit tree (hanging fruit now) and the fruit on the ground or falling. */
  view(){return {trees:trees.map((t,ti)=>({id:t.id,fruit:t.fruit,x:t.x,z:t.z,y:t.y,stand:t.stand,hanging:hangingSlots(ti).length})),
   fallen:slots.filter(s=>s.mode==='fall'||s.mode==='ground').map(s=>({tree:trees[s.tree].id,mode:s.mode,x:s.pos.x,y:s.pos.y,z:s.pos.z,bounces:s.bounces})),
   swaying:!!sway,shaking:!!shake,save};},
  /** Dev and heat runs only (scratch probes): every tree full again and today's count back to 0. */
  refill(){if(!save)return;persist({...save,today:0,trees:{}});refresh();},
  /** Tap / E: shake the tree in reach. */
  shake:startShake,
  /** Per frame (Town's HUD block): the prompt, the shake, sway, falls and pickups. Off the island: one box test. */
  update(c:ForageUpdate):{key:string;distance:number}|null{
   const prompt=c.ui<HTMLButtonElement>('[data-summit-forage]');
   if(OFF){if(prompt&&!prompt.hidden)c.hide(prompt,true);return null;}
   const onIsle=c.x>SUMMIT_BOX.minX-NEAR_BOX&&c.x<SUMMIT_BOX.maxX+NEAR_BOX&&c.z>SUMMIT_BOX.minZ-NEAR_BOX&&c.z<SUMMIT_BOX.maxZ+NEAR_BOX;
   if(c.frozen||!onIsle&&!shake&&!sway&&!moving){if(promptShown&&prompt){c.hide(prompt,true);}promptShown=false;near=-1;stats.idleFrames++;return null;}
   if(!built){choose();if(!built){stats.idleFrames++;return null;}}
   if(!mesh){if(prompt&&!prompt.hidden)c.hide(prompt,true);return null;}
   player.x=c.x;player.z=c.z;player.onFoot=c.onFoot;player.reduced=c.reduced;
   const t0=now();if(t0>=nextRegrow)refresh();
   let work=false;
   // ---- the shake: a shove at each of the pose's push peaks; the fruit drops on the last
   if(shake){work=true;shake.t+=c.dt;const k=shake.t/shake.dur;
    while(shake&&shake.pushes<TREE_SHAKE_PUSHES.length&&k>=TREE_SHAKE_PUSHES[shake.pushes]){push();shake.pushes++;if(shake.pushes===TREE_SHAKE_PUSHES.length&&!shake.dropped){shake.dropped=true;drop();}}
    if(shake&&k>=1){if(!shake.dropped)drop();shake=null;}}
   // ---- the sway: a damped spring (≈1.6 Hz), removed once it settles
   if(sway){work=true;const w=2*Math.PI*1.6,dt=Math.min(c.dt,.05);sway.vel+=(-w*w*sway.ang-2*.2*w*sway.vel)*dt;sway.ang+=sway.vel*dt;
    if(!shake&&Math.abs(sway.ang)<.002&&Math.abs(sway.vel)<.03)endSway();
    else{sway.shell.quaternion.setFromAxisAngle(sway.axis,sway.ang);slots.forEach((s,i)=>{if(s.tree===sway!.tree&&s.mode==='hang')paint(i);});}}
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
   // ---- the prompt: the nearest tree with fruit within reach (on foot, nothing else on)
   near=-1;let best:number=FORAGE.reach;
   if(c.onFoot&&c.canEnter&&!shake)for(let ti=0;ti<trees.length;ti++){if(!hangCount[ti])continue;const t=trees[ti],dx=t.x-c.x,dz=t.z-c.z;if(Math.abs(dx)>best||Math.abs(dz)>best)continue;const d=Math.hypot(dx,dz);if(d<best){best=d;near=ti;}}
   const want=near>=0?{key:'forage',distance:best}:null;
   if(near>=0){const l=label(trees[near]);if(l!==lastLabel){lastLabel=l;forageStore.set({label:l});}}
   if(prompt){let hidden=!(want&&c.focusKey==='forage');
    if(!hidden){const t=trees[near];anchor.set(t.x,t.top.y+.5,t.z).project(c.camera);// above the canopy, clear of the fruithidden=anchor.z< -1||anchor.z>1;
     if(!hidden)c.place(prompt,T.MathUtils.clamp((anchor.x+1)*c.width/2,115,c.width-115),// a longer label than Enter: kept on screen
     T.MathUtils.clamp((1-anchor.y)*c.height/2,90,c.height-160));}
    c.hide(prompt,hidden);promptShown=!hidden;}
   return want;
  },
  dispose(){if(typeof window!=='undefined')window.removeEventListener('keydown',onKey);forageActions.shake=()=>{};forageStore.reset();
   endSway();fx?.dispose();root.removeFromParent();geo?.dispose();mat?.dispose();shellMat?.dispose();mesh?.dispose();
   mesh=null;geo=null;mat=null;shellMat=null;fx=null;shake=null;slots=[];trees=[];built=false;},
 };
}
export type SummitForage=ReturnType<typeof createSummitForage>;
