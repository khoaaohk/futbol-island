import {lessonPositions,lessonVisualFrame,type FieldLesson} from './formatLessons';
import {fieldPoint,type Venue} from './venues';
import type {PlayerMotion} from '../graphics/player';
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
 return beats.map((beat,index)=>{const a=lessonPositions(lesson,step,beat.start),b=lessonPositions(lesson,step,beat.end),start=new Map([...a.positions].map(([id,p])=>[id,fieldPoint(v,p)])),end=new Map([...b.positions].map(([id,p])=>[id,fieldPoint(v,p)])),from=fieldPoint(v,a.ball),to=fieldPoint(v,b.ball);return{step,beat:index,start,end,from,to,source:owner(start,from),receiver:owner(end,to)};});
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
export function teachingMotion(lesson:FieldLesson,v:Venue,step:number,progress:number){
 let plans=cache.get(lesson);if(!plans){plans=makePlans(lesson,v);cache.set(lesson,plans);}
 const visual=lessonVisualFrame(lesson,step,progress),planIndex=plans.findIndex(p=>p.step===step&&p.beat===visual.index),plan=plans[planIndex],t=visual.progress,sample=lessonPositions(lesson,step,progress),poses=new Map([...sample.positions].map(([id,p])=>[id,fieldPoint(v,p)]));
 const pass=!!plan.source&&plan.source!==plan.receiver&&Math.hypot(plan.to.x-plan.from.x,plan.to.z-plan.from.z)>2;
 const boundary=(index:number,id:string,at:Point)=>{const prior=index>0?plans[index-1].from:plan.from,next=plans[Math.min(index,plans.length-1)].to;const foes=lesson.offense.some(p=>p.id===id)?lesson.defense:lesson.offense,frame=index>planIndex?plan.end:plan.start;return receivingPose(at,prior,next,foes.flatMap(p=>frame.has(p.id)?[frame.get(p.id)!]:[]));};
 const before=lessonPositions(lesson,step,Math.max(visual.start,progress-.012)).positions,after=lessonPositions(lesson,step,Math.min(visual.end,progress+.012)).positions;
 const motions=new Map<string,PlayerMotion>();
 for(const [id,p]of poses){const a=plan.start.get(id)!,b=plan.end.get(id)!,distance=Math.hypot(b.x-a.x,b.z-a.z),defender=lesson.defense.some(actor=>actor.id===id),near=Math.hypot(p.x-fieldPoint(v,sample.ball).x,p.z-fieldPoint(v,sample.ball).z)<8;
 const tangent=heading(fieldPoint(v,before.get(id)!),fieldPoint(v,after.get(id)!));
 const motion:PlayerMotion={facing:distance>.05&&!defender&&!near?tangent:heading(p,fieldPoint(v,sample.ball)),turnSmoothing:12};
 if(id===plan.source){const pose=boundary(planIndex,id,a);Object.assign(motion,pose);if(pass){motion.facing=shortTurn(pose.facing,heading(a,plan.to),t/TEACHING_RELEASE);motion.kick=t<TEACHING_RELEASE?.36*t/TEACHING_RELEASE:t<.4?.36+.64*(t-TEACHING_RELEASE)/(.4-TEACHING_RELEASE):undefined;}else{motion.dribbling=distance>.1;motion.facing=distance>.1?shortTurn(pose.facing,tangent,t/.35):pose.facing;motion.receive=distance<=.1?.35:0;}}
 if(pass&&id===plan.receiver){const pose=boundary(planIndex+1,id,b);Object.assign(motion,pose);motion.receive=smooth((t-.65)/.17);}
 motions.set(id,motion);
 }
 return{poses,motions,source:plan.source,receiver:plan.receiver,pass,from:plan.from,to:plan.to,ball:fieldPoint(v,sample.ball),travel:smooth((t-TEACHING_RELEASE)/(TEACHING_ARRIVAL-TEACHING_RELEASE)),landed:pass&&t>=TEACHING_ARRIVAL};
}
