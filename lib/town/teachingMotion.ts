import {lessonPositions,lessonVisualFrame,lessonStepSeconds,type FieldLesson} from './formatLessons';
import {fieldPoint,type Venue} from './venues';
import type {PlayerMotion} from '../graphics/player';
import {SKILL_MOVES,skillBall,skillFrame,type SkillMove} from '../graphics/skillMoves';
type Point={x:number;z:number};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const smooth=(n:number)=>{const t=clamp(n);return t*t*(3-2*t);};
export const TEACHING_RELEASE=.18,TEACHING_ARRIVAL=.82;
export const shortTurn=(a:number,b:number,t:number)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*smooth(t);
const heading=(a:Point,b:Point)=>Math.atan2(b.x-a.x,b.z-a.z);
function owner(poses:Map<string,Point>,ball:Point){let id:string|undefined,best=1.8;for(const [key,p]of poses){const d=Math.hypot(p.x-ball.x,p.z-ball.z);if(d<best){best=d;id=key;}}return id;}
const cache=new WeakMap<FieldLesson,ReturnType<typeof makePlans>>();
function makePlans(lesson:FieldLesson,v:Venue){return lesson.steps.flatMap((authored,step)=>{
 const beats=authored.beats?.length?authored.beats:[{start:0,end:1}];
 return beats.map((beat,index)=>{
   const a=lessonPositions(lesson,step,beat.start),b=lessonPositions(lesson,step,beat.end),start=new Map([...a.positions].map(([id,p])=>[id,fieldPoint(v,p)])),end=new Map([...b.positions].map(([id,p])=>[id,fieldPoint(v,p)])),from=fieldPoint(v,a.ball),to=fieldPoint(v,b.ball),source=owner(start,from),receiver=owner(end,to);
   const releaseProgress=beat.start+(beat.end-beat.start)*TEACHING_RELEASE,arrivalProgress=beat.start+(beat.end-beat.start)*TEACHING_ARRIVAL;
   const releaseSample=lessonPositions(lesson,step,releaseProgress),arrivalSample=lessonPositions(lesson,step,arrivalProgress);
   return{step,beat:index,start,end,from,to,source,receiver,releaseProgress,arrivalProgress,releaseRoot:source?fieldPoint(v,releaseSample.positions.get(source)!):from,arrivalRoot:receiver?fieldPoint(v,arrivalSample.positions.get(receiver)!):to};
 });
});}
/** Geometry, not actor names or a preferred right foot, determines open hips and contact side. */
export function receivingPose(at:Point,incoming:Point,outgoing:Point,opponents:Point[]=[]){
 const ix=incoming.x-at.x,iz=incoming.z-at.z,ox=outgoing.x-at.x,oz=outgoing.z-at.z,il=Math.hypot(ix,iz),ol=Math.hypot(ox,oz);
 const inYaw=il>.01?Math.atan2(ix,iz):Math.PI,outYaw=ol>.01?Math.atan2(ox,oz):inYaw;
 let open=shortTurn(inYaw,outYaw,.5);
 // Opposed directions use the intended continuation, as in the original live first touch.
 if(Math.abs(Math.abs(Math.atan2(Math.sin(outYaw-inYaw),Math.cos(outYaw-inYaw)))-Math.PI)<.01)open=outYaw;
 const lateral=ix*Math.cos(open)-iz*Math.sin(open);
 const pressed=opponents.some(p=>Math.hypot(p.x-at.x,p.z-at.z)<2.4&&(p.x-at.x)*Math.sin(open)+(p.z-at.z)*Math.cos(open)<0);
 const side: -1|1=(lateral<0?1:-1)*(pressed?-1:1) as -1|1;
 return{facing:open,kickSide:side};
}
/** Where a keeper's distribution lets go of the ball (skillMoves' authored hand path). */
const KEEPER_RELEASE:Partial<Record<SkillMove,number>>={keeperThrow:.5,keeperRoll:.46,keeperPunt:.42};
const wrapAngle=(a:number)=>Math.atan2(Math.sin(a),Math.cos(a));
/** Where an actor faced at the end of the previous step (a skill turns from there), cached per lesson. */
const priorCache=new WeakMap<FieldLesson,Map<string,number>>();
function priorFacing(lesson:FieldLesson,v:Venue,step:number,id:string,fallback:number):number{
 if(step<=0)return fallback;let c=priorCache.get(lesson);if(!c){c=new Map();priorCache.set(lesson,c);}
 const key=step+':'+id,hit=c.get(key);if(hit!==undefined)return hit;
 const previous:PlayerMotion|undefined=teachingMotion(lesson,v,step-1,1).motions.get(id),f:number=previous?.facing??fallback;c.set(key,f);return f;
}
/** The step's skill (FieldStep.skill) at this progress: pose progress, facing basis, and the ball on the move's
 *  authored path (weight 1 through the action, handed back to the lesson's ball over the recovery). */
export type TeachingSkill={id:string;type:SkillMove;side:-1|1;progress:number;yaw:number;ball?:{x:number;y:number;z:number};weight:number;release?:{x:number;y:number;z:number};keeper:boolean};
export function teachingMotion(lesson:FieldLesson,v:Venue,step:number,progress:number){
 let plans=cache.get(lesson);if(!plans){plans=makePlans(lesson,v);cache.set(lesson,plans);}
 const visual=lessonVisualFrame(lesson,step,progress),planIndex=plans.findIndex(p=>p.step===step&&p.beat===visual.index),plan=plans[planIndex],t=visual.progress,sample=lessonPositions(lesson,step,progress),poses=new Map([...sample.positions].map(([id,p])=>[id,fieldPoint(v,p)]));
 const pass=!!plan.source&&plan.source!==plan.receiver&&Math.hypot(plan.to.x-plan.from.x,plan.to.z-plan.from.z)>2;
 const boundary=(index:number,id:string,at:Point)=>{const prior=index>0?plans[index-1].from:plan.from,next=plans[Math.min(index,plans.length-1)].to;const foes=lesson.offense.some(p=>p.id===id)?lesson.defense:lesson.offense,frame=index>planIndex?plan.end:plan.start;return receivingPose(at,prior,next,foes.flatMap(p=>frame.has(p.id)?[frame.get(p.id)!]:[]));};
 const before=lessonPositions(lesson,step,Math.max(visual.start,progress-.012)).positions,after=lessonPositions(lesson,step,Math.min(visual.end,progress+.012)).positions;
 const releaseRoot=plan.releaseRoot;
 const releaseFacing=heading(plan.start.get(plan.source??'')??plan.from,plan.to);
 const sourceSide=plan.source?boundary(planIndex,plan.source,plan.start.get(plan.source)!).kickSide:1;
 const release={x:releaseRoot.x+Math.sin(releaseFacing)*.79+Math.cos(releaseFacing)*sourceSide*.108,z:releaseRoot.z+Math.cos(releaseFacing)*.79-Math.sin(releaseFacing)*sourceSide*.108};
 // Both ends belong to authored contact frames, never to a later moving passer.
 const arrivalRoot=plan.arrivalRoot;
 const arrivalPose=plan.receiver?boundary(planIndex+1,plan.receiver,plan.end.get(plan.receiver)!):undefined;
 const arrival=arrivalPose?{x:arrivalRoot.x+Math.sin(arrivalPose.facing)*.58+Math.cos(arrivalPose.facing)*arrivalPose.kickSide*.108,z:arrivalRoot.z+Math.cos(arrivalPose.facing)*.58-Math.sin(arrivalPose.facing)*arrivalPose.kickSide*.108}:plan.to;
 const motions=new Map<string,PlayerMotion>();
 for(const [id,p]of poses){const a=plan.start.get(id)!,b=plan.end.get(id)!,distance=Math.hypot(b.x-a.x,b.z-a.z),defender=lesson.defense.some(actor=>actor.id===id),near=Math.hypot(p.x-fieldPoint(v,sample.ball).x,p.z-fieldPoint(v,sample.ball).z)<8;
 const tangent=heading(fieldPoint(v,before.get(id)!),fieldPoint(v,after.get(id)!));
 const motion:PlayerMotion={facing:distance>.05&&!defender&&!near?tangent:heading(p,fieldPoint(v,sample.ball)),turnSmoothing:12,samplePose:{speed:Math.hypot(fieldPoint(v,after.get(id)!).x-fieldPoint(v,before.get(id)!).x,fieldPoint(v,after.get(id)!).z-fieldPoint(v,before.get(id)!).z)/Math.max(.001,Math.min(visual.end,progress+.012)-Math.max(visual.start,progress-.012))/lessonStepSeconds(lesson.steps[step]),distance:distance*smooth(t),heading:tangent},jockey:defender&&near?1:0};
 if(id===plan.source){const pose=boundary(planIndex,id,a);Object.assign(motion,pose);if(pass){motion.facing=shortTurn(pose.facing,heading(a,plan.to),t/TEACHING_RELEASE);motion.actionKind='pass';motion.kick=t<TEACHING_RELEASE?.36*t/TEACHING_RELEASE:t<.4?.36+.64*(t-TEACHING_RELEASE)/(.4-TEACHING_RELEASE):undefined;}else{motion.dribbling=distance>.1;motion.facing=distance>.1?shortTurn(pose.facing,tangent,t/.35):pose.facing;motion.receive=distance<=.1?.35:0;}}
 if(pass&&id===plan.source&&t>.4&&distance>.1)motion.facing=shortTurn(heading(a,plan.to),tangent,(t-.4)/.3);
 if(pass&&id===plan.receiver){const pose=boundary(planIndex+1,id,b);Object.assign(motion,pose);motion.receive=smooth((t-.65)/.17);motion.receiveProgress=clamp((t-.82)/.18);const scan=Math.sin(Math.PI*clamp((t-.2)/.4));motion.scanYaw=scan*.5*pose.kickSide;}
 motions.set(id,motion);
 }
 // A named skill move in this step (a turn, a shield, a keeper's roll-out): the root stays on the authored path, the
 // pose and the ball follow the move, and the move's own heading turns the player into the path's new direction.
 let skill:TeachingSkill|undefined;const sk=lesson.steps[step]?.skill,type=sk?.type as SkillMove|undefined;
 if(sk&&type&&SKILL_MOVES[type]&&poses.has(sk.id)){
  const spec=SKILL_MOVES[type],keeper=type in KEEPER_RELEASE,stepSec=lessonStepSeconds(lesson.steps[step]),start=sk.start??0;
  const pc=keeper?KEEPER_RELEASE[type]!:spec.contacts.length?spec.contacts[spec.contacts.length-1].p:spec.phases[0];
  // A keeper lets go exactly on the lesson's release, a defender blocks the pass as it arrives (the move's build-up
  // leads into it); other moves meet the ball at their own tempo unless authored.
  const receiving=pass&&plan.receiver===sk.id,after=spec.seconds/stepSec;
  const at=sk.at??(keeper&&pass&&plan.source===sk.id?plan.releaseProgress:receiving?plan.arrivalProgress:Math.min(.95,start+pc*after));
  const from=sk.start??(receiving?Math.max(0,at-pc*after):0);
  // (a block recovers a little quicker, so it is back on its feet before the step ends)
  const p=progress<from?-1:progress<at?pc*(progress-from)/Math.max(1e-6,at-from):pc+(progress-at)/Math.max(1e-6,after*(receiving?.75:1));
  if(p>=0&&p<1){
   const a0=lessonPositions(lesson,step,0).positions.get(sk.id)!,a1=lessonPositions(lesson,step,1).positions.get(sk.id)!,A=fieldPoint(v,a0),B=fieldPoint(v,a1);
   const moved=Math.hypot(B.x-A.x,B.z-A.z)>.3||!!sk.toward,prior=priorFacing(lesson,v,step,sk.id,boundary(planIndex,sk.id,plan.start.get(sk.id)??A).facing);
   // Facing basis: a keeper faces the pass; a player who travels ends the move facing the new direction (side chosen
   // so the turn starts closest to where he was facing); one who stays turns from where he faced.
   const endYaw=(side:-1|1)=>skillFrame(type,1,side,{x:0,z:0,heading:0}).heading;
   let side:-1|1=sk.side??1,yaw=prior;
   if(keeper&&pass)yaw=heading(A,plan.to);
   else if(receiving)yaw=heading(fieldPoint(v,lessonPositions(lesson,step,at).positions.get(sk.id)!),plan.from);
   else if(moved){const travel=sk.toward?heading(A,fieldPoint(v,sk.toward)):heading(A,B);if(!sk.side)side=Math.abs(wrapAngle(travel-endYaw(1)-prior))<=Math.abs(wrapAngle(travel-endYaw(-1)-prior))?1:-1;yaw=travel-endYaw(side);}
   const m=motions.get(sk.id)!,fr=skillFrame(type,p,side,{x:0,z:0,heading:0});
   m.skill={type,progress:p,side};m.facing=yaw+fr.heading;m.turnSmoothing=30;m.kick=undefined;m.receive=0;m.dribbling=false;m.keeper=keeper?1:m.keeper;
   const root=poses.get(sk.id)!,c=Math.cos(yaw),sn=Math.sin(yaw),toWorld=(q:number,at:{x:number;z:number})=>{const b=skillBall(type,q,side),f=skillFrame(type,q,side,{x:0,z:0,heading:0});if(!b)return undefined;const lx=b.x-f.x,lz=b.z-f.z;return {x:at.x+lx*c+lz*sn,y:.295+(b.y-.19),z:at.z-lx*sn+lz*c};};
   const rec=spec.phases[2],hand=keeper?(p<pc?1:0):p<=rec?1:1-(p-rec)/(1-rec),blend=smooth(p/.06);
   // A receiving defender only poses (the lesson's pass brings the ball to his boot).
   skill={id:sk.id,type,side,progress:p,yaw,ball:receiving?undefined:toWorld(p,root),weight:receiving?0:smooth(hand)*blend,keeper};
  }
  // The pass leaves from the keeper's hand (the lesson samples this once per beat, whatever the frame).
  if(keeper&&pass&&plan.source===sk.id){
   const yaw=heading(fieldPoint(v,lessonPositions(lesson,step,0).positions.get(sk.id)!),plan.to),side=sk.side??1,c=Math.cos(yaw),sn=Math.sin(yaw);
   const r=fieldPoint(v,lessonPositions(lesson,step,at).positions.get(sk.id)!),b=skillBall(type,pc,side),f=skillFrame(type,pc,side,{x:0,z:0,heading:0});
   if(b){const lx=b.x-f.x,lz=b.z-f.z,release={x:r.x+lx*c+lz*sn,y:.295+(b.y-.19),z:r.z-lx*sn+lz*c};if(skill)skill.release=release;else skill={id:sk.id,type,side,progress:p<0?0:1,yaw,weight:0,keeper,release};}
  }
 }
 return{skill,poses,motions,source:plan.source,receiver:plan.receiver,pass,release,releaseRoot,arrival,arrivalRoot,contactFrame:{beat:visual.index,releaseProgress:plan.releaseProgress,arrivalProgress:plan.arrivalProgress},from:plan.from,to:plan.to,ball:fieldPoint(v,sample.ball),travel:smooth((t-TEACHING_RELEASE)/(TEACHING_ARRIVAL-TEACHING_RELEASE)),landed:pass&&t>=TEACHING_ARRIVAL};
}
