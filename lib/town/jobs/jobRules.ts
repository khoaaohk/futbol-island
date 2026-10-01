/** Pure job progress rules (no three.js): the scene feeds player positions, ball events and HUD button presses, and renders the run.
 *  Sep 30 2026 (user): every job has a real action. Work-step jobs (JobDef.work) arm a target when you stand at it and the HUD
 *  shows one action button (tap N times, or hold); Harvest day has its own shake / pull / twist / snip rules (below). */
import {REBOUND_WALL,type JobDef,type WorkStep,type HarvestSpot} from './jobCatalog';
import {OFFSIDE_CLIPS} from './offsideClips';
import {GARDEN_SPOTS,GARDEN_KIND,isTreeSpot} from './garden';
import {goodById} from '../market/goods';
export type Vec={x:number;y:number;z:number};
/** work → (deliver | shots) → done. Task jobs add: `call` (offside: waiting for the flag decision), `explain` (offside: the
 * frozen pass with the line drawn), `pump` (at the pump station, pumping the current ball). */
export type JobPhase='work'|'deliver'|'shots'|'watch'|'call'|'explain'|'pump'|'done';
/** A harvested item lying on the ground (a shaken-down fruit or a pulled root) until the player walks over it. `slot` = the
 *  scene instance (fruit: harvestSlots base + index; veg: the spot index). */
export type GroundItem={spot:number;good:string;x:number;z:number;age:number;kind:'fruit'|'veg';slot:number};
export type HarvestState={
 /** The spot the player can act on now (−1 = none). */
 near:number;
 /** Shake energy (0–1): each Shake tap adds, it drains when you stop; full = the tree drops fruit. */
 energy:number;
 /** Ripe fruit still hanging on each tree spot. */
 left:number[];
 /** The last full shake dropped nothing (the next one always drops: never unfair). */
 lastMiss:boolean;
 ground:GroundItem[];
 /** Root being pulled (−1 = none) and the pull meter (0 … HARVEST.pullMax). */
 pulling:number;pull:number;
 /** Greens: snips so far and the time since the first snip. */
 snips:number;snipClock:number;
 fruit:number;veg:number;
 /** Veg spots finished. */
 done:boolean[];
 /** Goods picked this shift, in order (the farmer's share is taken from these). */
 bag:string[];
 seed:number};
/** Garden shift (Sep 30 2026, docs/island-jobs.md §13). Spot i = GARDEN_SPOTS[i] = the job's target i. */
export type GardenShiftState={
 /** Pickable this shift: ripe in the garden, or made ripe for this shift so it can always be finished (garden.ts shiftRipeness). */
 ripe:boolean[];
 /** Picked this shift. */
 picked:boolean[];
 /** The spot the Pick button acts on (−1 = none). */
 near:number;
 fruit:number;veg:number;
 /** Goods in the basket, in pick order (the gardener's share comes from these). */
 bag:string[];
 /** Crops whose nutrition lesson was shown this shift (the first pick of each crop teaches it). */
 taught:string[]};
export type JobRun={def:JobDef;got:boolean[];next:number;carrying:number;phase:JobPhase;passes:number;shots:number;seconds:number;
 /** Task jobs: the current shirt / replay / ball. */
 step:number;
 /** Kit room: the last wrong peg tried (−1 = none); after one wrong try the beacon shows the right peg. */
 wrong:number;
 /** Offside: replay clock (s). Pump: gauge pressure (atm). */
 clock:number;pressure:number;
 /** Offside: was the last call right? */
 right:boolean|null;
 /** A short friendly feedback line for the HUD (never a penalty). */
 note:string;
 /** Work-step jobs: the target being worked (−1 = none, −2 = the drop-off). */
 at:number;
 /** Per target: steps finished, and the current step's progress (0–1). */
 stage:number[];work:number[];
 /** A hold step's button is down. */
 holding:boolean;
 /** Last player position (fruit falls toward the player; the line marker paints under them). */
 px:number;pz:number;
 harvest:HarvestState|null;
 garden:GardenShiftState|null;
 /** Wall rebounds (Sep 30 2026, user): the glowing shooting circle for the next target shot, whether the shot now flying was
  *  struck from inside it, and the seed that places the next circle. */
 spot:{x:number;z:number}|null;shotArmed:boolean;spotSeed:number};
export type JobEvent={type:'collect'|'pickup'|'return'|'deliver'|'pass'|'shot'|'phase'|'done'|'wrong'|'call'|'pump'
 |'work'|'step'|'hold'|'release'|'shake'|'drop'|'miss'|'tug'|'pop'|'snap'|'twist'|'unripe'|'snip'|'cut'|'gather'|'clear'|'pluck';
 index?:number;stage?:number;value?:number;good?:string;spot?:number;
 /** Garden: a free pick outside a shift (no basket in the hands; the produce goes to the market basket). */
 free?:boolean;
 /** Harvest `gather`: where the item lay (the character bends toward it). */
 x?:number;z?:number};
/** `hold`: the HUD sends `id` on press and `id:up` on release (pointer or Enter/Space held). */
export type JobAction={id:string;label:string;primary?:boolean;hold?:boolean};
/** Harvest day tuning: 3 quick taps (4 slower ones) shake a tree, or one Kick the tree (a full shake); the pull meter crosses the
 *  green zone in about 0.4 s. Reaches (Sep 30 2026, user: "make the radius of the farm jobs bigger"): trees 2.5 → 4.5 m (room to
 *  step back and pass the ball into the trunk), veg 1.5 → 2.25 m, walk-over pick-up 1.15 → 1.8 m, the Pick up button 3 m; the
 *  armed spot only changes to another one that is `switchMargin` nearer, so overlapping trees never flicker. */
export const HARVEST={shakeTap:.4,shakeDecay:.4,pullRate:.8,pullMax:1.4,green:[.8,1.1] as const,snipWindow:1.4,pickupDelay:.8,pickupReach:1.8,pickupButtonReach:3,treeReach:4.5,vegReach:2.25,switchMargin:.6};
const harvestTask=(d:JobDef)=>d.task?.type==='harvest'?d.task:null;
const gardenTask=(d:JobDef)=>d.task?.type==='garden'?d.task:null;
/** First fruit instance of each tree spot (fruit instances are numbered tree by tree); −1 for veg spots. */
export function harvestSlots(spots:HarvestSpot[]){let n=0;return spots.map(s=>{if(s.action!=='shake')return -1;const b=n;n+=s.fruit??3;return b;});}
export const harvestFruitCount=(spots:HarvestSpot[])=>spots.reduce((n,s)=>n+(s.action==='shake'?s.fruit??3:0),0);
/** `gardenRipe`: Garden shift only, which spots are pickable this shift (default: all; the scene passes garden.ts shiftRipeness). */
export function startRun(def:JobDef,seed=1,gardenRipe?:boolean[]):JobRun{
 const h=harvestTask(def),gt=gardenTask(def);
 return {def,got:def.targets.map(()=>false),next:0,carrying:-1,phase:'work',passes:0,shots:0,seconds:0,step:0,wrong:-1,clock:0,pressure:def.task?.type==='pump'?def.task.start[0]:0,right:null,note:'',
  at:-1,stage:def.targets.map(()=>0),work:def.targets.map(()=>0),holding:false,px:0,pz:0,spot:null,shotArmed:false,spotSeed:(seed>>>0)||1,
  harvest:h?{near:-1,energy:0,left:h.spots.map(s=>s.action==='shake'?s.fruit??3:0),lastMiss:false,ground:[],pulling:-1,pull:0,snips:0,snipClock:0,fruit:0,veg:0,done:h.spots.map(()=>false),bag:[],seed:(seed>>>0)||1}:null,
  garden:gt?{ripe:def.targets.map((_,i)=>gardenRipe?.[i]??true),picked:def.targets.map(()=>false),near:-1,fruit:0,veg:0,bag:[],taught:[]}:null};
}
const taskTotal=(d:JobDef)=>d.task?.type==='sort'?d.task.items.length:d.task?.type==='offside'?d.task.clips:d.task?.type==='pump'?d.task.start.length:d.task?.type==='harvest'?d.task.fruitGoal+d.task.vegGoal:d.task?.type==='garden'?d.task.goal:d.targets.length;
export const offsideClip=(r:JobRun)=>OFFSIDE_CLIPS[Math.min(r.step,OFFSIDE_CLIPS.length-1)];
/** Items done so far and the job's total, for the HUD. */
export function runProgress(r:JobRun):{value:number;total:number}{
 if(r.def.kind==='rebound')return r.phase==='shots'||r.phase==='done'?{value:r.shots,total:REBOUND_WALL.shots}:{value:r.passes,total:REBOUND_WALL.passes};
 if(r.harvest){const t=taskTotal(r.def);return {value:r.phase==='work'?Math.min(t,r.harvest.fruit+r.harvest.veg):t,total:t};}
 if(r.garden){const t=taskTotal(r.def);return {value:r.phase==='work'?Math.min(t,r.garden.fruit+r.garden.veg):t,total:t};}
 // Offside: a right call counts the moment it is made (the replay then freezes to explain it); a wrong call never counts.
 if(r.def.task)return {value:r.phase==='done'?taskTotal(r.def):r.step+(r.def.kind==='offside'&&r.phase==='explain'&&r.right?1:0),total:taskTotal(r.def)};
 return {value:r.got.filter(Boolean).length,total:r.def.targets.length};
}
/** Fruit / veg still needed that are not already lying on the ground. */
function harvestNeed(r:JobRun){const h=r.harvest!,t=harvestTask(r.def)!;const lying=(k:'fruit'|'veg')=>h.ground.filter(g=>g.kind===k).length;
 return {fruit:Math.max(0,t.fruitGoal-h.fruit-lying('fruit')),veg:Math.max(0,t.vegGoal-h.veg-lying('veg'))};}
/** Targets the player should head for now (used by the scene for the beacon and by tests to walk a run). */
export function runGoals(r:JobRun):{x:number;z:number}[]{
 const d=r.def;if(r.phase==='done')return [];
 if(r.phase==='deliver'&&d.deliver)return [d.deliver];
 if(r.harvest){const h=r.harvest,t=harvestTask(d)!,need=harvestNeed(r);if(h.ground.length)return h.ground.map(g=>({x:g.x,z:g.z}));
  return t.spots.filter((s,i)=>s.action==='shake'?need.fruit>0&&h.left[i]>0:need.veg>0&&!h.done[i]&&s.ripe!==false).map(s=>({x:s.x,z:s.z}));}
 if(r.garden){const g=r.garden;return GARDEN_SPOTS.filter((s,i)=>g.ripe[i]&&!g.picked[i]&&gardenKindOpen(r,GARDEN_KIND[s.good])).map(s=>({x:s.x,z:s.z}));}
 if(d.kind==='rebound')return r.phase==='shots'&&r.spot?[r.spot]:[d.targets[0]];
 if(d.task?.type==='sort'){if(r.carrying<0)return d.deliver?[d.deliver]:[];const slot=d.task.items[r.step]?.slot;return r.wrong>=0&&slot!==undefined?[d.targets[slot]]:[];}
 if(d.kind==='offside'||d.kind==='pump')return r.phase==='work'?[d.targets[0]]:[];
 if(d.kind==='carry')return r.carrying>=0&&d.deliver?[d.deliver]:[d.targets[r.next]];
 if(d.kind==='trail')return [d.targets[r.next]];
 return d.targets.filter((_,i)=>!r.got[i]);
}
const near=(p:Vec,q:{x:number;z:number},qy:number,r:number)=>Math.hypot(p.x-q.x,p.z-q.z)<=r&&Math.abs(p.y-qy)<1.6;
/** Distance from (x,z) to the trail between the last painted dash and the next one (the line marker's lane). */
export function trailOffset(r:JobRun,x:number,z:number){
 const t=r.def.targets,b=t[Math.min(r.next,t.length-1)],a=t[Math.max(0,r.next-1)],dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz;
 const u=l2?Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/l2)):0;return Math.hypot(x-(a.x+dx*u),z-(a.z+dz*u));
}
const doneWith=(r:JobRun,ev:JobEvent[])=>{r.phase='done';r.at=-1;r.holding=false;ev.push({type:'done'});};
/** Collect jobs: when every target is done, head for the drop-off (or finish). */
function afterCollect(r:JobRun,ev:JobEvent[]){const d=r.def;if(!r.got.every(Boolean)||r.phase!=='work')return;if(d.deliver){r.phase='deliver';r.at=-1;r.holding=false;ev.push({type:'phase'});}else doneWith(r,ev);}
/** Finish the current step at target i (and the target itself after its last step). */
function completeStep(r:JobRun,i:number,ev:JobEvent[]){
 const steps=r.def.work?.target??[];r.stage[i]++;r.work[i]=0;r.holding=false;ev.push({type:'step',index:i,stage:r.stage[i]-1});
 if(r.stage[i]<steps.length)return;
 if(r.def.kind==='collect'){r.got[i]=true;ev.push({type:'collect',index:i});afterCollect(r,ev);}
}
/** Advance by one frame at player position `p`. `floor(x,z)` gives the ground height at a target. */
export function stepRun(r:JobRun,p:Vec,dt:number,floor:(x:number,z:number)=>number):JobEvent[]{
 if(r.phase==='done')return [];const t=Math.max(0,Math.min(dt,.1));r.seconds+=t;r.px=p.x;r.pz=p.z;const d=r.def,ev:JobEvent[]=[],w=d.work;
 const reach=(q:{x:number;z:number},rad=d.radius)=>near(p,q,floor(q.x,q.z),rad);
 if(r.phase==='deliver'){if(!d.deliver)return ev;const at=reach(d.deliver,1.8);
  if(w?.deliver){r.at=at?-2:-1;return ev;}
  if(at){r.phase='done';ev.push({type:'deliver'},{type:'done'});}return ev;}
 if(r.harvest)return stepHarvest(r,p,t,floor,ev);
 if(r.garden)return stepGarden(r,p,floor,ev);
 const steps=w?.target;
 if(d.kind==='collect'){
  if(steps){let best=-1,bd=Infinity;d.targets.forEach((q,i)=>{if(r.got[i]||!reach(q))return;const dd=Math.hypot(p.x-q.x,p.z-q.z);if(dd<bd){bd=dd;best=i;}});
   r.at=best;const step=best>=0?steps[r.stage[best]]:undefined;
   if(step?.mode==='hold'&&r.holding){r.work[best]+=t/(step.time??1);if(r.work[best]>=1)completeStep(r,best,ev);}}
  else{d.targets.forEach((q,i)=>{if(!r.got[i]&&reach(q)){r.got[i]=true;ev.push({type:'collect',index:i});}});afterCollect(r,ev);}}
 else if(d.kind==='trail'){const q=d.targets[r.next];
  if(steps){r.at=q&&reach(q)?r.next:-1;
   // The marker paints only while its button is held: walking over a dash with the marker up leaves a gap to come back for.
   const off=trailOffset(r,p.x,p.z);r.note=r.holding&&off>1.6?'Off the line! Walk back onto the faded dashes.':!r.holding&&r.at>=0?'Hold Paint to put the marker down on this dash.':'';
   if(q&&r.at>=0&&r.holding){r.got[r.next]=true;ev.push({type:'collect',index:r.next});r.next++;if(r.next>=d.targets.length)doneWith(r,ev);}}
  else if(q&&reach(q)){r.got[r.next]=true;ev.push({type:'collect',index:r.next});r.next++;if(r.next>=d.targets.length){r.phase='done';ev.push({type:'done'});}}}
 else if(d.task?.type==='sort'){
  const item=d.task.items[r.step];if(!item)return ev;
  if(steps){r.at=r.carrying<0?(d.deliver&&reach(d.deliver,1.8)?-2:-1):d.targets.findIndex(q=>reach(q));}
  else if(r.carrying<0){if(d.deliver&&reach(d.deliver,1.8)){r.carrying=r.step;r.wrong=-1;r.note=item.clue;ev.push({type:'pickup',index:r.step});}}
  else d.targets.forEach((q,i)=>{if(r.carrying>=0&&reach(q))placeSortItem(r,i,ev);});
 }
 else if(d.kind==='offside'){
  if(r.phase==='work'){if(reach(d.targets[0])){r.phase='watch';r.clock=0;r.note='';ev.push({type:'phase'});}}
  else if(r.phase==='watch'){r.clock+=t;if(r.clock>=offsideClip(r).end){r.clock=offsideClip(r).end;r.phase='call';ev.push({type:'phase'});}}
 }
 else if(d.kind==='pump'){if(r.phase==='work'&&reach(d.targets[0])){r.phase='pump';r.note='';ev.push({type:'phase'});}}
 else if(d.kind==='carry'){
  if(steps)r.at=r.carrying<0?(d.targets[r.next]&&reach(d.targets[r.next])?r.next:-1):(d.deliver&&reach(d.deliver,1.8)?-2:-1);
  else if(r.carrying<0){const q=d.targets[r.next];if(q&&reach(q)){r.carrying=r.next;ev.push({type:'pickup',index:r.next});}}
  else if(d.deliver&&reach(d.deliver,1.8)){r.got[r.carrying]=true;ev.push({type:'return',index:r.carrying});r.carrying=-1;r.next++;if(r.next>=d.targets.length){r.phase='done';ev.push({type:'done'});}}
 }
 return ev;
}
/** Sort jobs: the carried item goes into crate/peg i (right: counted; wrong: a friendly clue, try again). */
function placeSortItem(r:JobRun,i:number,ev:JobEvent[]){
 const d=r.def;if(d.task?.type!=='sort')return;const task=d.task,item=task.items[r.step];if(!item)return;
 if(i===item.slot){r.got[i]=true;r.carrying=-1;r.wrong=-1;r.note=item.label?`${item.label} goes in the ${task.slots[i].toLowerCase()} ${task.slotNoun??'crate'}!`:`Shirt ${item.number} is on the ${task.slots[i].toLowerCase()} peg!`;ev.push({type:'return',index:i});r.step++;if(r.step>=taskTotal(d)){r.phase='done';r.at=-1;ev.push({type:'done'});}}
 else{r.wrong=i;r.note=`That's the ${task.slots[i].toLowerCase()} ${task.slotNoun??'peg'}. ${item.clue} Follow the arrow.`;ev.push({type:'wrong',index:i});}
}

// ---- Harvest day ----
function rand(h:HarvestState){let a=h.seed=(h.seed+0x6D2B79F5)|0;a=Math.imul(a^a>>>15,1|a);a=a+Math.imul(a^a>>>7,61|a)^a;return((a^a>>>14)>>>0)/4294967296;}
function harvestDone(r:JobRun,ev:JobEvent[]){
 const h=r.harvest!,t=harvestTask(r.def)!;if(r.phase!=='work'||h.fruit<t.fruitGoal||h.veg<t.vegGoal)return;
 for(const g of h.ground)ev.push({type:'clear',index:g.slot,value:g.kind==='fruit'?0:1});h.ground=[];h.pulling=-1;h.pull=0;r.holding=false;h.near=-1;
 r.phase='deliver';r.at=-1;r.note='';ev.push({type:'phase'});
}
function stepHarvest(r:JobRun,p:Vec,t:number,floor:(x:number,z:number)=>number,ev:JobEvent[]){
 const h=r.harvest!,spots=harvestTask(r.def)!.spots;
 h.energy=Math.max(0,h.energy-HARVEST.shakeDecay*t);
 if(h.snips>0){h.snipClock+=t;if(h.snipClock>HARVEST.snipWindow){h.snips=0;r.note='';}}
 if(h.pulling>=0){h.pull+=HARVEST.pullRate*t;const s=spots[h.pulling],away=Math.hypot(p.x-s.x,p.z-s.z)>HARVEST.vegReach+.8;
  if(h.pull>=HARVEST.pullMax||away){ev.push({type:'snap',index:h.pulling});r.note=away?'You let go of the leaves.':'Too long! It slipped back into the ground. Let go in the green.';h.pulling=-1;h.pull=0;r.holding=false;}}
 for(const g of [...h.ground]){g.age+=t;if(g.age<HARVEST.pickupDelay||Math.hypot(p.x-g.x,p.z-g.z)>HARVEST.pickupReach||Math.abs(p.y-floor(g.x,g.z))>=1.6)continue;
  gatherItem(r,g,ev);r.note='';}
 const need=harvestNeed(r);let best=-1,bd=Infinity,held=Infinity;
 spots.forEach((s,i)=>{const ok=s.action==='shake'?need.fruit>0&&h.left[i]>0:!h.done[i]&&(s.ripe===false||need.veg>0);if(!ok)return;
  const dd=Math.hypot(p.x-s.x,p.z-s.z);if(dd>(s.action==='shake'?HARVEST.treeReach:HARVEST.vegReach)||Math.abs(p.y-floor(s.x,s.z))>=1.6)return;
  if(i===h.near)held=dd;if(dd<bd){bd=dd;best=i;}});
 // Hysteresis: keep the armed spot until another one is clearly nearer (overlapping tree reaches never flicker).
 if(held<Infinity&&best!==h.near&&bd>held-HARVEST.switchMargin)best=h.near;
 if(h.pulling>=0)best=h.pulling;
 if(best!==h.near){h.near=best;if(h.pulling<0&&!h.ground.length)r.note='';h.snips=0;}
 harvestDone(r,ev);return ev;
}
/** Fallen crops the Pick up button reaches now (landed, within HARVEST.pickupButtonReach of the player). */
export function harvestPickable(r:JobRun){const h=r.harvest;if(!h||r.phase!=='work')return [];return h.ground.filter(g=>g.age>=HARVEST.pickupDelay&&Math.hypot(r.px-g.x,r.pz-g.z)<=HARVEST.pickupButtonReach);}
function gatherItem(r:JobRun,g:GroundItem,ev:JobEvent[]){const h=r.harvest!,task=harvestTask(r.def)!;h.ground.splice(h.ground.indexOf(g),1);
 if(g.kind==='fruit'?h.fruit<task.fruitGoal:h.veg<task.vegGoal){if(g.kind==='fruit')h.fruit++;else h.veg++;h.bag.push(g.good);}
 ev.push({type:'gather',index:g.slot,good:g.good,spot:g.spot,value:g.kind==='fruit'?0:1,x:g.x,z:g.z});}
function harvestAction(r:JobRun,id:string,ev:JobEvent[]){
 const h=r.harvest!,task=harvestTask(r.def)!,spots=task.spots;
 // Pick up (Sep 30 2026): bend down for every landed crop within reach, without walking right onto it.
 if(id==='pickup'){const list=harvestPickable(r);if(!list.length)return;for(const g of list)gatherItem(r,g,ev);r.note='';harvestDone(r,ev);return;}
 if(id==='pull:up'){if(h.pulling<0)return;const i=h.pulling,v=h.pull,s=spots[i];h.pulling=-1;h.pull=0;r.holding=false;
  if(v>=HARVEST.green[0]&&v<=HARVEST.green[1]){h.done[i]=true;const a=Math.atan2(r.pz-s.z,r.px-s.x);h.ground.push({spot:i,good:s.good,x:s.x+Math.cos(a)*.75,z:s.z+Math.sin(a)*.75,age:0,kind:'veg',slot:i});
   r.note=`Pop! Pick up your ${s.good.replace('-',' ')}.`;ev.push({type:'pop',index:i,good:s.good});}
  else{r.note=v<HARVEST.green[0]?'Too early: it sprang back. Hold a little longer.':'Too late: it slipped. Let go in the green.';ev.push({type:'snap',index:i});}
  return;}
 const i=h.near,s=spots[i];if(!s||r.phase!=='work')return;
 // Kick the tree (Sep 30 2026, user): the ball passed firmly into the trunk is one full shake; `shake` taps still add energy.
 if(s.action==='shake'&&(id==='shake'||id==='kick')){
  const need=harvestNeed(r);if(h.left[i]<=0||need.fruit<=0)return;
  h.energy=Math.min(1.2,h.energy+(id==='kick'?1:HARVEST.shakeTap));ev.push({type:'shake',index:i,value:h.energy});
  if(h.energy<1){r.note='Keep shaking! Tap fast.';return;}
  h.energy=0;const roll=rand(h);let n=roll<.2?0:roll<.75?1:2;if(h.lastMiss&&n===0)n=1;n=Math.min(n,h.left[i],need.fruit);
  if(!n){h.lastMiss=true;r.note=id==='kick'?'Nothing fell that time. Kick it again: firm and on target!':'Nothing fell that time. Shake again!';ev.push({type:'miss',index:i});return;}
  h.lastMiss=false;const base=harvestSlots(spots)[i],total=s.fruit??3,a0=Math.atan2(r.pz-s.z,r.px-s.x);
  for(let k=0;k<n;k++){const slot=base+total-h.left[i];h.left[i]--;const a=a0+(k?.8:-.4)+(rand(h)-.5)*.5,rad=1.3+rand(h)*.5;
   h.ground.push({spot:i,good:s.good,x:s.x+Math.cos(a)*rad,z:s.z+Math.sin(a)*rad,age:0,kind:'fruit',slot});ev.push({type:'drop',index:slot,spot:i,good:s.good});}
  r.note=n>1?'Two fell! Walk near them and tap Pick up.':'One fell! Walk near it and tap Pick up.';return;}
 if(s.action==='pull'&&id==='pull'&&!h.done[i]&&h.pulling<0){h.pulling=i;h.pull=0;r.holding=true;r.note='';ev.push({type:'tug',index:i});return;}
 if(s.action==='twist'&&id==='twist'&&!h.done[i]){
  if(s.ripe===false){r.note=`Not ready yet: this ${s.good} is still green. Find a red one (follow the arrow).`;ev.push({type:'unripe',index:i});return;}
  h.done[i]=true;if(h.veg<task.vegGoal){h.veg++;h.bag.push(s.good);}r.note=`Twisted off! The ${s.good} is in your basket.`;ev.push({type:'twist',index:i,good:s.good});harvestDone(r,ev);return;}
 if(s.action==='cut'&&id==='cut'&&!h.done[i]){
  if(!h.snips){h.snips=1;h.snipClock=0;r.note='Snip! Once more to cut.';ev.push({type:'snip',index:i});return;}
  h.snips=0;h.done[i]=true;if(h.veg<task.vegGoal){h.veg++;h.bag.push(s.good);}r.note='Cut! The greens are in your basket.';ev.push({type:'cut',index:i,good:s.good});harvestDone(r,ev);}
}
function harvestActions(r:JobRun):JobAction[]{
 const h=r.harvest!,spots=harvestTask(r.def)!.spots;if(r.phase!=='work')return [];
 if(h.pulling<0&&!spots[h.near]&&harvestPickable(r).length)return [{id:'pickup',label:'Pick up',primary:true}];
 if(h.pulling>=0)return [{id:'pull',label:'Pulling… let go in the green!',primary:true,hold:true}];
 const s=spots[h.near];if(!s)return [];
 if(s.action==='shake')return [{id:'kick',label:'Kick the tree',primary:true}];
 if(s.action==='pull')return [{id:'pull',label:'Hold to pull',primary:true,hold:true}];
 if(s.action==='twist')return [{id:'twist',label:'Twist & pick',primary:true}];
 return [{id:'cut',label:h.snips?'Snip again!':'Snip',primary:true}];
}
function harvestHint(r:JobRun){
 const h=r.harvest!,t=harvestTask(r.def)!,s=t.spots[h.near],need=harvestNeed(r);if(r.phase!=='work')return '';
 const head=`Fruit ${Math.min(h.fruit,t.fruitGoal)}/${t.fruitGoal} · Veg ${Math.min(h.veg,t.vegGoal)}/${t.vegGoal}. `;
 if(h.pulling>=0)return head+'Let go when the needle is in the green!';
 if(r.note)return head+r.note;
 if(h.ground.length)return head+'Walk near the fallen crops and tap Pick up (or walk over them).';
 if(s)return head+(s.action==='shake'?'Kick the tree: pass it firmly into the trunk, then control the rebound.':s.action==='pull'?'Hold Pull, and let go when the needle is in the green.':s.action==='twist'?`Twist it off if it's ripe (red).`:'Snip twice quickly to cut the greens.');
 return head+(need.fruit>0?'Follow the arrow to a tree with ripe fruit.':'Now the veg: follow the arrow into the fields.');
}

// ---- Garden shift (Sep 30 2026, docs/island-jobs.md §13) ----
/** Garden tuning: the Pick button arms the nearest unpicked spot inside its reach (garden.ts: beds 2.3 m, trees 2.6 m); a ripe spot
 *  wins over a green one up to `ripeBias` metres further away, and the armed spot only changes to one `switchMargin` nearer. */
export const GARDEN={ripeBias:1,switchMargin:.4};
/** The shift's mix tip (only words from the garden's own produce lessons, lib/town/market/goods.ts strawberry + tomato). */
export const GARDEN_TIP="Mix colours on your plate: fruit is your muscles' sprint fuel, and colourful veg gives vitamins and minerals that help you recover between matches.";
/** Can one more of this kind still count? The last places in the basket are kept for the kind still missing from the mix. */
function gardenKindOpen(r:JobRun,kind:'fruit'|'veg'){const g=r.garden!,t=gardenTask(r.def)!,have=kind==='fruit'?g.fruit:g.veg,missing=kind==='fruit'?Math.max(0,t.vegGoal-g.veg):Math.max(0,t.fruitGoal-g.fruit);
 return g.fruit+g.veg<t.goal&&have<t.goal-missing;}
function stepGarden(r:JobRun,p:Vec,floor:(x:number,z:number)=>number,ev:JobEvent[]){
 const g=r.garden!;let best=-1,bs=Infinity,held=Infinity;
 GARDEN_SPOTS.forEach((s,i)=>{if(g.picked[i])return;const dd=Math.hypot(p.x-s.x,p.z-s.z);if(dd>s.reach||Math.abs(p.y-floor(s.x,s.z))>=1.6)return;
  const score=dd+(g.ripe[i]?0:GARDEN.ripeBias);if(i===g.near)held=score;if(score<bs){bs=score;best=i;}});
 if(held<Infinity&&best!==g.near&&bs>held-GARDEN.switchMargin)best=g.near;
 if(best!==g.near){g.near=best;r.note='';}
 return ev;
}
function gardenAction(r:JobRun,id:string,ev:JobEvent[]){
 const g=r.garden!,t=gardenTask(r.def)!,i=g.near,s=GARDEN_SPOTS[i];if(id!=='pluck'||!s||g.picked[i]||r.phase!=='work')return;
 const good=goodById(s.good),name=(good?.name??s.good).toLowerCase(),kind=GARDEN_KIND[s.good];
 if(!g.ripe[i]){r.note=`Not ripe yet: this ${name} is still green. Leave it to grow and find a ripe one (follow the arrow).`;ev.push({type:'unripe',index:i,x:s.x,z:s.z,value:isTreeSpot(s)?1:0});return;}
 if(!gardenKindOpen(r,kind)){const other=kind==='fruit'?'veg':'fruit',n=kind==='fruit'?t.vegGoal-g.veg:t.fruitGoal-g.fruit;
  r.note=`Your basket needs ${n} more ${other} for a good mix: look for ${other==='veg'?'tomatoes or carrots':'strawberries, oranges or cherries'} (follow the arrow).`;ev.push({type:'wrong',index:i,x:s.x,z:s.z});return;}
 g.picked[i]=true;if(kind==='fruit')g.fruit++;else g.veg++;g.bag.push(s.good);
 const first=!g.taught.includes(s.good);if(first)g.taught.push(s.good);
 r.note=`+1 ${good?.name??s.good}.${first&&good?' '+good.lesson:''}`;
 ev.push({type:'pluck',index:i,good:s.good,value:isTreeSpot(s)?1:0,x:s.x,z:s.z});
 if(g.fruit+g.veg>=t.goal){r.phase='deliver';r.at=-1;g.near=-1;ev.push({type:'phase'});}
}
function gardenHint(r:JobRun){
 const g=r.garden!,t=gardenTask(r.def)!,s=GARDEN_SPOTS[g.near];
 const head=`Basket ${Math.min(t.goal,g.fruit+g.veg)}/${t.goal} · fruit ${g.fruit} · veg ${g.veg} (at least ${t.fruitGoal} of each). `;
 if(r.note)return head+r.note;
 if(s)return head+(g.ripe[g.near]?(isTreeSpot(s)?'Reach up and tap Pick.':'Crouch down and tap Pick.'):'This one looks green… tap Pick to check it.');
 return head+GARDEN_TIP;
}

/** How far outside a job's area the player may wander before the shift ends. */
export const JOB_AREA_MARGIN=45;
/** True when (x,z) is more than JOB_AREA_MARGIN outside the box around a job's sign, targets and drop-off (horizontal only). */
export function outsideJobArea(def:{board:{x:number;z:number};targets?:{x:number;z:number}[];deliver?:{x:number;z:number}|null;areaMargin?:number},x:number,z:number){
 const pts=[def.board,...(def.targets??[]),...(def.deliver?[def.deliver]:[])];let x0=Infinity,x1=-Infinity,z0=Infinity,z1=-Infinity;
 for(const q of pts){x0=Math.min(x0,q.x);x1=Math.max(x1,q.x);z0=Math.min(z0,q.z);z1=Math.max(z1,q.z);}
 const dx=Math.max(x0-x,0,x-x1),dz=Math.max(z0-z,0,z-z1);return Math.hypot(dx,dz)>(def.areaMargin??JOB_AREA_MARGIN);
}
/** The next shooting circle: a new distance (6–14 m) and angle (≤ 55° off square) to the target, on the lawn, at least 3 m from
 *  the last one. Seeded, so a run replays the same circles. */
export function nextReboundSpot(r:JobRun,prev:{x:number;z:number}|null){
 const S=REBOUND_WALL.spot,t=REBOUND_WALL.target,L=S.lawn;let best:{x:number;z:number}|null=null;
 for(let k=0;k<40;k++){let a=r.spotSeed=(r.spotSeed+0x6D2B79F5)|0;a=Math.imul(a^a>>>15,1|a);a=a+Math.imul(a^a>>>7,61|a)^a;const u=((a^a>>>14)>>>0)/4294967296;
  const v=((Math.imul(a,2654435761)>>>0)%100000)/100000,ang=(u*2-1)*S.arc,d=S.min+v*(S.max-S.min),p={x:t.x+Math.sin(ang)*d,z:REBOUND_WALL.face+Math.cos(ang)*d};
  if(p.x<L.x0||p.x>L.x1||p.z<L.z0||p.z>L.z1||S.avoid.some(q=>Math.hypot(p.x-q.x,p.z-q.z)<S.clear))continue;best=p;if(!prev||Math.hypot(p.x-prev.x,p.z-prev.z)>=S.minMove)return p;}
 return best&&(!prev||Math.hypot(best.x-prev.x,best.z-prev.z)>=S.minMove)?best:{x:prev&&prev.x<t.x?t.x+3:t.x-3,z:REBOUND_WALL.face+8};
}
/** Rebound job ball events: a clean wall return (juggle) or a shot that hit the painted target (counts only from the circle). */
export function reboundEvent(r:JobRun,kind:'pass'|'shot'):JobEvent[]{
 if(r.def.kind!=='rebound'||r.phase==='done')return [];
 if(kind==='pass'&&r.phase==='work'){r.passes++;const ev:JobEvent[]=[{type:'pass'}];if(r.passes>=REBOUND_WALL.passes){r.phase='shots';r.spot=nextReboundSpot(r,null);r.shotArmed=false;r.note='';ev.push({type:'phase'});}return ev;}
 if(kind==='shot'&&r.phase==='shots'){if(!r.shotArmed){r.note='Step into the glowing circle to shoot: that one did not count.';return [];}
  r.shots++;r.note='On target!';const ev:JobEvent[]=[{type:'shot'}];if(r.shots>=REBOUND_WALL.shots){r.phase='done';r.spot=null;ev.push({type:'done'});}return ev;}
 return [];
}
/** A target shot is struck at (x,z): it can count only from inside the circle. */
export function reboundShotStart(r:JobRun,x:number,z:number){
 if(r.def.kind!=='rebound'||r.phase!=='shots'||!r.spot)return false;const inside=Math.hypot(x-r.spot.x,z-r.spot.z)<=REBOUND_WALL.spot.radius;
 r.shotArmed=inside;r.note=inside?'':'Step into the glowing circle to shoot: that one did not count.';return inside;
}
/** The shot is over (hit or miss): an attempt from the circle moves the circle to a new angle. */
export function reboundShotEnd(r:JobRun){
 if(r.def.kind!=='rebound'||!r.shotArmed)return false;r.shotArmed=false;if(r.phase!=='shots')return true;
 r.spot=nextReboundSpot(r,r.spot);r.note=`${r.note==='On target!'?'On target! ':'Missed. '}New angle: open your body to the target before you strike.`;return true;
}
/** Does a ball contact at (x,y,z) land inside the rebound wall's painted target square? */
export function hitsReboundTarget(x:number,y:number,z:number,groundY=0){
 const w=REBOUND_WALL,t=w.target;return Math.abs(z-w.z)<.8&&Math.abs(x-t.x)<=t.halfWidth+.2&&y-groundY>=t.bottom-.2&&y-groundY<=t.top+.2;
}
/** A wall-juggle return counts only on the practice wall. */
export function onReboundWall(target:{x:number;z:number}|null|undefined){return !!target&&Math.abs(target.z-REBOUND_WALL.z)<1&&Math.abs(target.x-REBOUND_WALL.x)<=REBOUND_WALL.halfWidth;}

/** The step being worked at the armed target, or the drop-off step. */
export function currentStep(r:JobRun):WorkStep|null{
 const w=r.def.work;if(!w)return null;if(r.at===-2)return w.deliver??null;
 if(r.def.kind==='trail')return r.phase==='work'?w.target?.[0]??null:null;
 if(r.at<0||!w.target)return null;if(r.def.kind==='sort'||r.def.kind==='carry')return w.target[0];return w.target[r.stage[r.at]]??null;
}
/** Buttons the HUD shows right now. */
export function runActions(r:JobRun):JobAction[]{
 if(r.def.kind==='offside'){if(r.phase==='call')return [{id:'flag',label:'Raise the flag',primary:true},{id:'play-on',label:'Keep flag down'}];
  if(r.phase==='explain')return [{id:'next',label:r.right?(r.step+1>=taskTotal(r.def)?'Finish':'Next replay'):'Watch again',primary:true}];}
 if(r.def.kind==='pump'&&r.phase==='pump')return [{id:'pump',label:'Pump',primary:true},{id:'release',label:'Let air out'},{id:'ready',label:'Ball ready'}];
 if(r.harvest&&r.at!==-2)return harvestActions(r);
 if(r.garden&&r.at!==-2)return r.phase==='work'&&r.garden.near>=0?[{id:'pluck',label:'Pick',primary:true}]:[];
 const step=currentStep(r);if(!step||r.phase==='done')return [];
 if(r.def.kind==='sort'&&r.at>=0&&r.carrying<0)return [];
 if(r.def.kind==='sort'&&r.at===-2&&r.carrying>=0)return [];
 if(r.def.kind==='carry'&&r.at>=0&&r.carrying>=0)return [];
 const n=step.count??1,done=r.at>=0?Math.round(r.work[r.at]*n):0;
 return [{id:step.id,label:step.mode==='hold'&&r.holding?step.busy??step.label:n>1?`${step.label} (${done}/${n})`:step.label,primary:true,hold:step.mode==='hold'}];
}
/** A HUD button press. Mistakes only explain and let you try again; they never cost coins or progress. */
export function runAction(r:JobRun,id:string):JobEvent[]{
 const d=r.def,ev:JobEvent[]=[];
 if(d.kind==='offside'){const clip=offsideClip(r);
  if(r.phase==='call'&&(id==='flag'||id==='play-on')){r.right=(id==='flag')===clip.flag;r.phase='explain';r.clock=clip.pass;r.note=r.right?`Good call! ${clip.why}`:`Not quite. ${clip.why}`;ev.push({type:'call',value:id==='flag'?1:0});}
  else if(r.phase==='explain'&&id==='next'){if(r.right){r.step++;ev.push({type:'return',index:r.step-1});if(r.step>=taskTotal(d)){r.phase='done';r.note='';ev.push({type:'done'});return ev;}}
   r.phase='watch';r.clock=0;r.right=null;r.note='';ev.push({type:'phase'});}
 }
 if(d.task?.type==='pump'&&r.phase==='pump'){const t=d.task,shown=(p:number)=>p.toFixed(2);
  if(id==='pump'){r.pressure=Math.min(1.6,Math.round((r.pressure+t.step)*100)/100);r.note=r.pressure>t.max?`${shown(r.pressure)} atm — too hard! Let a little air out.`:r.pressure>=t.min?`${shown(r.pressure)} atm — in the green zone. Press Ball ready.`:`${shown(r.pressure)} atm — still soft. Keep pumping.`;ev.push({type:'pump',value:r.pressure});}
  else if(id==='release'){r.pressure=Math.max(0,Math.round((r.pressure-t.release)*100)/100);r.note=`${shown(r.pressure)} atm — some air let out.`;ev.push({type:'release',value:r.pressure});}
  else if(id==='ready'){
   if(r.pressure>=t.min&&r.pressure<=t.max){r.note=`Ball ${r.step+1} is match-ready at ${shown(r.pressure)} atm!`;r.step++;ev.push({type:'return',index:r.step-1});
    if(r.step>=t.start.length){r.phase='done';ev.push({type:'done'});}else r.pressure=t.start[r.step];}
   else{r.note=r.pressure<t.min?`Squeeze test: too soft (${shown(r.pressure)} atm). The green zone is ${t.min}–${t.max}.`:`Squeeze test: too hard (${shown(r.pressure)} atm). Let some air out.`;ev.push({type:'wrong'});}
  }
 }
 if(d.work)workAction(r,id,ev);
 return ev;
}
/** Work-step buttons (and the drop-off action). A hold step sends `id` on press and `id:up` on release. */
function workAction(r:JobRun,id:string,ev:JobEvent[]){
 const d=r.def,w=d.work!;
 if(r.at===-2&&w.deliver&&id===w.deliver.id){
  if(d.kind==='sort'){const item=d.task?.type==='sort'?d.task.items[r.step]:undefined;if(item&&r.carrying<0){r.carrying=r.step;r.wrong=-1;r.note=item.clue;ev.push({type:'pickup',index:r.step});}return;}
  if(d.kind==='carry'){if(r.carrying<0)return;r.got[r.carrying]=true;ev.push({type:'return',index:r.carrying});r.carrying=-1;r.next++;r.at=-1;if(r.next>=d.targets.length)doneWith(r,ev);return;}
  if(r.phase==='deliver'){ev.push({type:'deliver'});doneWith(r,ev);}return;}
 if(r.harvest){harvestAction(r,id,ev);return;}
 if(r.garden){gardenAction(r,id,ev);return;}
 if(id.endsWith(':up')){if(r.holding){r.holding=false;ev.push({type:'release',index:r.at});}return;}
 if(d.kind==='trail'){if(id==='paint'&&r.phase==='work'&&!r.holding){r.holding=true;ev.push({type:'hold',index:r.next});
   // Pressing Paint while already on the next dash paints it straight away.
   const q=d.targets[r.next];if(q&&r.at===r.next){r.got[r.next]=true;ev.push({type:'collect',index:r.next});r.next++;if(r.next>=d.targets.length)doneWith(r,ev);}}return;}
 if(r.at<0)return;const i=r.at;
 if(d.kind==='sort'){if(id==='drop'&&r.carrying>=0)placeSortItem(r,i,ev);return;}
 if(d.kind==='carry'){if(id==='pickup'&&r.carrying<0&&i===r.next){r.carrying=i;ev.push({type:'pickup',index:i});}return;}
 const step=w.target?.[r.stage[i]];if(!step||id!==step.id)return;
 if(step.mode==='hold'){if(!r.holding){r.holding=true;ev.push({type:'hold',index:i});}return;}
 const n=step.count??1;r.work[i]=Math.min(1,r.work[i]+1/n);ev.push({type:'work',index:i,stage:r.stage[i],value:r.work[i]});
 if(r.work[i]>=1-1e-9)completeStep(r,i,ev);
}
/** The HUD instruction line ('' = use the job's howTo). */
export function runHint(r:JobRun):string{
 const d=r.def;
 if(r.harvest&&r.phase==='work')return harvestHint(r);
 if(r.garden&&r.phase==='work')return gardenHint(r);
 if(d.kind==='rebound')return r.phase==='shots'?`${r.note?r.note+' ':''}Shoot from the glowing circle into the target square (${r.shots}/${REBOUND_WALL.shots}).`:`Face the wall and press Juggle: ${r.passes}/${REBOUND_WALL.passes} wall passes. Every return is a first touch.`;
 if(d.task?.type==='sort'){const item=d.task.items[r.step];if(!item)return '';const t=d.task,source=t.source,noun=t.itemNoun??'shirt';
  if(r.at===-2&&r.carrying<0&&d.work?.deliver)return `${d.work.deliver.hint}${r.step?` (${r.step} packed)`:''}`;
  if(r.carrying>=0&&r.at>=0&&r.wrong!==r.at&&d.work)return `${item.clue} Tap Drop it in if this is the right crate.`;
  return r.note&&(r.carrying>=0||r.wrong>=0)?r.note:r.carrying>=0?item.clue:r.step===0?`Go to the ${source??'kit hamper'} and take the first ${noun}.`:`${r.note} Take the next ${noun} from the ${source??'hamper'}.`;}
 if(d.kind==='offside'){if(r.phase==='work')return 'Walk to your touchline spot (follow the arrow).';const clip=offsideClip(r);
  if(r.phase==='watch')return `${clip.title}: watch the attacker with the white ring when the pass is played…`;if(r.phase==='call')return `${clip.title}: offside or not when the pass was played?`;return r.note;}
 if(d.kind==='pump'){if(r.phase==='work')return 'Walk to the pump station (follow the arrow).';return r.note||`Ball ${r.step+1}: ${r.pressure.toFixed(2)} atm. Pump it into the green zone (0.6–1.1).`;}
 if(d.work){const step=currentStep(r);
  if(d.kind==='trail'&&r.phase==='work')return r.note||(r.holding?'Keep walking over the faded dashes in order.':step?.hint??'');
  if(r.at===-2&&step)return step.hint;
  if(r.at>=0&&step&&!(d.kind==='carry'&&r.carrying>=0)){const n=step.count??1;return n>1?`${step.hint} (${Math.round(r.work[r.at]*n)}/${n})`:step.hint;}
 }
 return '';
}
