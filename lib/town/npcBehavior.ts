export type NpcPoint={x:number;y:number;z:number};
export type NpcRoutineMode='rest'|'walk'|'work'|'approach'|'social'|'greet';
export type NpcRoutine={mode:NpcRoutineMode;age:number;clock:number;waypoint:number;target:NpcPoint;partner:string|null;socialCooldown:number;wasNear:boolean;waveTime:number;speed:number;restDuration:number;workDuration:number};
export type NpcRoutineActor={id:string;position:NpcPoint;home:{x:number;z:number};worker:boolean;route:NpcPoint[];routine:NpcRoutine;near:boolean;stunned:boolean};
export function createNpcRoutine(index:number,worker:boolean,home:NpcPoint):NpcRoutine{return {mode:worker?'work':'rest',age:0,clock:0,waypoint:0,target:{...home},partner:null,socialCooldown:8+index%4*2,wasNear:false,waveTime:0,speed:.65+(index%4)*.09,restDuration:3+index%4,workDuration:15+index%4*3};}
const distance=(a:NpcPoint,b:NpcPoint)=>Math.hypot(a.x-b.x,a.z-b.z,a.y-b.y);
/** Every route segment is checked, including the height at intermediate samples. */
export function safeNpcPath(a:NpcPoint,b:NpcPoint,isWalkable:(x:number,z:number)=>boolean,heightAt:(x:number,z:number)=>number){const steps=Math.max(1,Math.ceil(distance(a,b)/.2));let height=a.y;for(let i=0;i<=steps;i++){const t=i/steps,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,y=heightAt(x,z);if(!isWalkable(x,z)||Math.abs(y-height)>.15)return false;height=y;}return Math.abs(height-b.y)<.15;}
export function advanceNpcRoutines(actors:NpcRoutineActor[],dt:number,canTravel:(a:NpcPoint,b:NpcPoint)=>boolean,frozen:ReadonlySet<string>=new Set()){
 dt=Math.min(Math.max(dt,0),.1);if(!dt)return;
 const byId=new Map(actors.map(actor=>[actor.id,actor]));
 const reset=(actor:NpcRoutineActor)=>{const r=actor.routine;r.partner=null;r.age=0;r.socialCooldown=24;r.mode=actor.worker&&distance(actor.position,{...actor.home,y:actor.position.y})>.12?'walk':actor.worker?'work':'rest';r.target={...actor.home,y:actor.position.y};};
 // A visitor or a ball interruption takes priority over an ambient conversation.
 for(const actor of actors){if(frozen.has(actor.id))continue;const r=actor.routine;r.clock+=dt;r.socialCooldown=Math.max(0,r.socialCooldown-dt);if((actor.near||actor.stunned)&&r.partner){const partner=byId.get(r.partner);reset(actor);if(partner)reset(partner);}if(actor.stunned)continue;
  if(actor.near){if(!r.wasNear){r.waveTime=0;r.mode='greet';r.age=0;}r.wasNear=true;r.waveTime+=dt;continue;}
  if(r.wasNear){r.wasNear=false;reset(actor);}
 }
 // Two neighbors agree on facing spots, with enough space between their bodies.
 for(const actor of actors){if(frozen.has(actor.id))continue;const r=actor.routine;if(actor.near||actor.stunned||r.partner||r.socialCooldown>0)continue;
  const partner=actors.find(other=>other.id>actor.id&&!frozen.has(other.id)&&!other.near&&!other.stunned&&!other.routine.partner&&other.routine.socialCooldown<=0&&distance(actor.position,other.position)>1.8&&distance(actor.position,other.position)<7);
  if(!partner)continue;const length=distance(actor.position,partner.position),dx=(partner.position.x-actor.position.x)/length,dz=(partner.position.z-actor.position.z)/length,mid={x:(actor.position.x+partner.position.x)/2,z:(actor.position.z+partner.position.z)/2};
  const a={x:mid.x-dx*.95,y:actor.position.y,z:mid.z-dz*.95},b={x:mid.x+dx*.95,y:partner.position.y,z:mid.z+dz*.95};
  if(Math.abs(actor.position.y-partner.position.y)>.2||!canTravel(actor.position,a)||!canTravel(partner.position,b))continue;
  for(const [person,target,friend] of [[actor,a,partner],[partner,b,actor]] as const){person.routine.mode='approach';person.routine.target=target;person.routine.partner=friend.id;person.routine.age=0;}
 }
 for(const actor of actors){if(frozen.has(actor.id))continue;const r=actor.routine;if(actor.near||actor.stunned)continue;r.age+=dt;
  if(r.mode==='social'){const partner=byId.get(r.partner??'');if(!partner){reset(actor);continue;}if(partner.routine.mode==='approach'){r.age=0;continue;}if(r.age>6){reset(actor);reset(partner);}continue;}
  if(r.mode==='work'){if(r.age>=r.workDuration){r.mode='rest';r.age=0;}continue;}
  if(r.mode==='rest'){if(r.age<r.restDuration)continue;r.age=0;if(actor.worker){r.target={...actor.home,y:actor.position.y};r.mode=distance(actor.position,r.target)>.12?'walk':'work';continue;}if(actor.route.length<2)continue;r.waypoint=(r.waypoint+1)%actor.route.length;r.target={...actor.route[r.waypoint]};if(canTravel(actor.position,r.target))r.mode='walk';continue;}
  if(r.mode==='walk'||r.mode==='approach'){
   if(r.mode==='approach'&&r.age>12){const partner=byId.get(r.partner??'');reset(actor);if(partner)reset(partner);continue;}
   const remaining=distance(actor.position,r.target);if(remaining<.08){r.mode=r.mode==='approach'?'social':actor.worker?'work':'rest';r.age=0;continue;}
   const step=Math.min(remaining,r.speed*dt),next={x:actor.position.x+(r.target.x-actor.position.x)/remaining*step,y:actor.position.y+(r.target.y-actor.position.y)/remaining*step,z:actor.position.z+(r.target.z-actor.position.z)/remaining*step};
   if(canTravel(actor.position,next)&&!actors.some(other=>other!==actor&&distance(next,other.position)<1.15)){Object.assign(actor.position,next);}else if(r.mode==='walk'){r.mode='rest';r.age=0;}
  }
 }
}
