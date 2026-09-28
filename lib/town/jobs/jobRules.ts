/** Pure job progress rules (no three.js): the scene feeds player positions and ball events, and renders the run. */
import {REBOUND_WALL,type JobDef} from './jobCatalog';
import {OFFSIDE_CLIPS} from './offsideClips';
export type Vec={x:number;y:number;z:number};
/** work → (deliver | shots) → done. Task jobs add: `call` (offside: waiting for the flag decision), `explain` (offside: the
 * frozen pass with the line drawn), `pump` (at the pump station, pumping the current ball). */
export type JobPhase='work'|'deliver'|'shots'|'watch'|'call'|'explain'|'pump'|'done';
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
 note:string};
export type JobEvent={type:'collect'|'pickup'|'return'|'deliver'|'pass'|'shot'|'phase'|'done'|'wrong'|'call'|'pump';index?:number};
export type JobAction={id:string;label:string;primary?:boolean};
export function startRun(def:JobDef):JobRun{return {def,got:def.targets.map(()=>false),next:0,carrying:-1,phase:'work',passes:0,shots:0,seconds:0,step:0,wrong:-1,clock:0,pressure:def.task?.type==='pump'?def.task.start[0]:0,right:null,note:''};}
const taskTotal=(d:JobDef)=>d.task?.type==='sort'?d.task.items.length:d.task?.type==='offside'?d.task.clips:d.task?.type==='pump'?d.task.start.length:d.targets.length;
export const offsideClip=(r:JobRun)=>OFFSIDE_CLIPS[Math.min(r.step,OFFSIDE_CLIPS.length-1)];
/** Items done so far and the job's total, for the HUD. */
export function runProgress(r:JobRun):{value:number;total:number}{
 if(r.def.kind==='rebound')return r.phase==='shots'||r.phase==='done'?{value:r.shots,total:REBOUND_WALL.shots}:{value:r.passes,total:REBOUND_WALL.passes};
 // Offside: a right call counts the moment it is made (the replay then freezes to explain it); a wrong call never counts.
 if(r.def.task)return {value:r.phase==='done'?taskTotal(r.def):r.step+(r.def.kind==='offside'&&r.phase==='explain'&&r.right?1:0),total:taskTotal(r.def)};
 return {value:r.got.filter(Boolean).length,total:r.def.targets.length};
}
/** Targets the player should head for now (used by the scene for the beacon and by tests to walk a run). */
export function runGoals(r:JobRun):{x:number;z:number}[]{
 const d=r.def;if(r.phase==='done')return [];
 if(r.phase==='deliver'&&d.deliver)return [d.deliver];
 if(d.kind==='rebound')return [d.targets[0]];
 if(d.task?.type==='sort'){if(r.carrying<0)return d.deliver?[d.deliver]:[];const slot=d.task.items[r.step]?.slot;return r.wrong>=0&&slot!==undefined?[d.targets[slot]]:[];}
 if(d.kind==='offside'||d.kind==='pump')return r.phase==='work'?[d.targets[0]]:[];
 if(d.kind==='carry')return r.carrying>=0&&d.deliver?[d.deliver]:[d.targets[r.next]];
 if(d.kind==='trail')return [d.targets[r.next]];
 return d.targets.filter((_,i)=>!r.got[i]);
}
const near=(p:Vec,q:{x:number;z:number},qy:number,r:number)=>Math.hypot(p.x-q.x,p.z-q.z)<=r&&Math.abs(p.y-qy)<1.6;
/** Advance by one frame at player position `p`. `floor(x,z)` gives the ground height at a target. */
export function stepRun(r:JobRun,p:Vec,dt:number,floor:(x:number,z:number)=>number):JobEvent[]{
 if(r.phase==='done')return [];r.seconds+=Math.max(0,Math.min(dt,.1));const d=r.def,ev:JobEvent[]=[];
 const reach=(q:{x:number;z:number},rad=d.radius)=>near(p,q,floor(q.x,q.z),rad);
 if(r.phase==='deliver'){if(d.deliver&&reach(d.deliver,1.8)){r.phase='done';ev.push({type:'deliver'},{type:'done'});}return ev;}
 if(d.kind==='collect'){d.targets.forEach((t,i)=>{if(!r.got[i]&&reach(t)){r.got[i]=true;ev.push({type:'collect',index:i});}});
  if(r.got.every(Boolean)){if(d.deliver){r.phase='deliver';ev.push({type:'phase'});}else{r.phase='done';ev.push({type:'done'});}}}
 else if(d.kind==='trail'){const t=d.targets[r.next];if(t&&reach(t)){r.got[r.next]=true;ev.push({type:'collect',index:r.next});r.next++;if(r.next>=d.targets.length){r.phase='done';ev.push({type:'done'});}}}
 else if(d.task?.type==='sort'){
  const item=d.task.items[r.step];if(!item)return ev;
  if(r.carrying<0){if(d.deliver&&reach(d.deliver,1.8)){r.carrying=r.step;r.wrong=-1;r.note=item.clue;ev.push({type:'pickup',index:r.step});}}
  else d.targets.forEach((t,i)=>{if(r.carrying<0||!reach(t))return;
   if(i===item.slot){r.got[i]=true;r.carrying=-1;r.wrong=-1;r.note=`Shirt ${item.number} is on the ${d.task!.type==='sort'?d.task!.slots[i].toLowerCase():''} peg!`;ev.push({type:'return',index:i});r.step++;if(r.step>=taskTotal(d)){r.phase='done';ev.push({type:'done'});}}
   else if(r.wrong!==i){r.wrong=i;r.note=`That's the ${(d.task as {slots:string[]}).slots[i].toLowerCase()} peg. ${item.clue} Follow the arrow.`;ev.push({type:'wrong',index:i});}});
 }
 else if(d.kind==='offside'){
  if(r.phase==='work'){if(reach(d.targets[0])){r.phase='watch';r.clock=0;r.note='';ev.push({type:'phase'});}}
  else if(r.phase==='watch'){r.clock+=Math.max(0,Math.min(dt,.1));if(r.clock>=offsideClip(r).end){r.clock=offsideClip(r).end;r.phase='call';ev.push({type:'phase'});}}
 }
 else if(d.kind==='pump'){if(r.phase==='work'&&reach(d.targets[0])){r.phase='pump';r.note='';ev.push({type:'phase'});}}
 else if(d.kind==='carry'){
  if(r.carrying<0){const t=d.targets[r.next];if(t&&reach(t)){r.carrying=r.next;ev.push({type:'pickup',index:r.next});}}
  else if(d.deliver&&reach(d.deliver,1.8)){r.got[r.carrying]=true;ev.push({type:'return',index:r.carrying});r.carrying=-1;r.next++;if(r.next>=d.targets.length){r.phase='done';ev.push({type:'done'});}}
 }
 return ev;
}
/** Rebound job ball events: a clean wall return (juggle) or a shot that hit the painted target. */
export function reboundEvent(r:JobRun,kind:'pass'|'shot'):JobEvent[]{
 if(r.def.kind!=='rebound'||r.phase==='done')return [];
 if(kind==='pass'&&r.phase==='work'){r.passes++;const ev:JobEvent[]=[{type:'pass'}];if(r.passes>=REBOUND_WALL.passes){r.phase='shots';ev.push({type:'phase'});}return ev;}
 if(kind==='shot'&&r.phase==='shots'){r.shots++;const ev:JobEvent[]=[{type:'shot'}];if(r.shots>=REBOUND_WALL.shots){r.phase='done';ev.push({type:'done'});}return ev;}
 return [];
}
/** Does a ball contact at (x,y,z) land inside the rebound wall's painted target square? */
export function hitsReboundTarget(x:number,y:number,z:number,groundY=0){
 const w=REBOUND_WALL,t=w.target;return Math.abs(z-w.z)<.8&&Math.abs(x-t.x)<=t.halfWidth+.2&&y-groundY>=t.bottom-.2&&y-groundY<=t.top+.2;
}
/** A wall-juggle return counts only on the practice wall. */
export function onReboundWall(target:{x:number;z:number}|null|undefined){return !!target&&Math.abs(target.z-REBOUND_WALL.z)<1&&Math.abs(target.x-REBOUND_WALL.x)<=REBOUND_WALL.halfWidth;}

/** Buttons the HUD shows for task jobs right now. */
export function runActions(r:JobRun):JobAction[]{
 if(r.def.kind==='offside'){if(r.phase==='call')return [{id:'flag',label:'Raise the flag',primary:true},{id:'play-on',label:'Keep flag down'}];
  if(r.phase==='explain')return [{id:'next',label:r.right?(r.step+1>=taskTotal(r.def)?'Finish':'Next replay'):'Watch again',primary:true}];}
 if(r.def.kind==='pump'&&r.phase==='pump')return [{id:'pump',label:'Pump',primary:true},{id:'release',label:'Let air out'},{id:'ready',label:'Ball ready'}];
 return [];
}
/** A HUD button press. Mistakes only explain and let you try again; they never cost coins or progress. */
export function runAction(r:JobRun,id:string):JobEvent[]{
 const d=r.def,ev:JobEvent[]=[];
 if(d.kind==='offside'){const clip=offsideClip(r);
  if(r.phase==='call'&&(id==='flag'||id==='play-on')){r.right=(id==='flag')===clip.flag;r.phase='explain';r.clock=clip.pass;r.note=r.right?`Good call! ${clip.why}`:`Not quite. ${clip.why}`;ev.push({type:'call'});}
  else if(r.phase==='explain'&&id==='next'){if(r.right){r.step++;ev.push({type:'return',index:r.step-1});if(r.step>=taskTotal(d)){r.phase='done';r.note='';ev.push({type:'done'});return ev;}}
   r.phase='watch';r.clock=0;r.right=null;r.note='';ev.push({type:'phase'});}
 }
 if(d.task?.type==='pump'&&r.phase==='pump'){const t=d.task,shown=(p:number)=>p.toFixed(2);
  if(id==='pump'){r.pressure=Math.min(1.6,Math.round((r.pressure+t.step)*100)/100);r.note=r.pressure>t.max?`${shown(r.pressure)} atm — too hard! Let a little air out.`:r.pressure>=t.min?`${shown(r.pressure)} atm — in the green zone. Press Ball ready.`:`${shown(r.pressure)} atm — still soft. Keep pumping.`;ev.push({type:'pump'});}
  else if(id==='release'){r.pressure=Math.max(0,Math.round((r.pressure-t.release)*100)/100);r.note=`${shown(r.pressure)} atm — some air let out.`;ev.push({type:'pump'});}
  else if(id==='ready'){
   if(r.pressure>=t.min&&r.pressure<=t.max){r.note=`Ball ${r.step+1} is match-ready at ${shown(r.pressure)} atm!`;r.step++;ev.push({type:'return',index:r.step-1});
    if(r.step>=t.start.length){r.phase='done';ev.push({type:'done'});}else r.pressure=t.start[r.step];}
   else{r.note=r.pressure<t.min?`Squeeze test: too soft (${shown(r.pressure)} atm). The green zone is ${t.min}–${t.max}.`:`Squeeze test: too hard (${shown(r.pressure)} atm). Let some air out.`;ev.push({type:'wrong'});}
  }
 }
 return ev;
}
/** The HUD instruction line for task jobs ('' = use the job's howTo). */
export function runHint(r:JobRun):string{
 const d=r.def;
 if(d.task?.type==='sort'){const item=d.task.items[r.step];if(!item)return '';return r.note&&(r.carrying>=0||r.wrong>=0)?r.note:r.carrying>=0?item.clue:r.step===0?'Go to the kit hamper and take the first shirt.':`${r.note} Take the next shirt from the hamper.`;}
 if(d.kind==='offside'){if(r.phase==='work')return 'Walk to your touchline spot (follow the arrow).';const clip=offsideClip(r);
  if(r.phase==='watch')return `${clip.title}: watch the attacker with the white ring when the pass is played…`;if(r.phase==='call')return `${clip.title}: offside or not when the pass was played?`;return r.note;}
 if(d.kind==='pump'){if(r.phase==='work')return 'Walk to the pump station (follow the arrow).';return r.note||`Ball ${r.step+1}: ${r.pressure.toFixed(2)} atm. Pump it into the green zone (0.6–1.1).`;}
 return '';
}
