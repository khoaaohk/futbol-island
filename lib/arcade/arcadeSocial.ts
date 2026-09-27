import type {PlayerMotion} from '../graphics/player';
import {SKILL_MOVES,type SkillMotion} from '../graphics/skillMoves';
export type ArcadeSocialAction='jump'|'wave'|'applaud'|'celebrate';
type Beat='highFive'|'fistBump'|'thankPasser'|'airplane'|'hop'|'wave'|'doubleFive'|'bounce'|'cheerRelay'|'keepUps';
export type SocialRoutine={name:string;beats:readonly Beat[];seconds:number;contactAt:number;tempo?:number;hopHeight?:number;responseDelay?:number};
const seconds=(beat:Beat)=>beat==='keepUps'?5.4:beat==='doubleFive'?3:beat==='bounce'?1.6:beat==='cheerRelay'?2.8:beat==='hop'?1.05:beat==='wave'?1.25:SKILL_MOVES[beat].seconds;
// Authored exchanges per visitor and button; three alternatives never share a generic fallback.
const exchanges:readonly Record<ArcadeSocialAction,readonly (readonly Beat[])[]>[]=[
 {wave:[['highFive','wave'],['doubleFive','thankPasser'],['fistBump','highFive','wave']],jump:[['hop','highFive'],['bounce','doubleFive'],['keepUps','highFive']],applaud:[['thankPasser','highFive'],['cheerRelay','doubleFive'],['wave','thankPasser','highFive']],celebrate:[['airplane','highFive'],['highFive','bounce'],['doubleFive','airplane']]},
 {wave:[['fistBump','wave'],['wave','fistBump','thankPasser'],['thankPasser','fistBump']],jump:[['hop','fistBump'],['fistBump','bounce'],['keepUps','fistBump']],applaud:[['fistBump','thankPasser'],['cheerRelay','fistBump'],['thankPasser','wave','fistBump']],celebrate:[['fistBump','airplane'],['airplane','wave','fistBump'],['bounce','fistBump','wave']]},
 {wave:[['hop','wave'],['wave','bounce','highFive'],['doubleFive','hop']],jump:[['bounce','highFive'],['hop','bounce','wave'],['keepUps','bounce']],applaud:[['hop','thankPasser'],['thankPasser','bounce'],['cheerRelay','hop','wave']],celebrate:[['bounce','airplane'],['airplane','hop','highFive'],['highFive','bounce','airplane']]},
 {wave:[['wave','thankPasser'],['thankPasser','wave','highFive'],['wave','fistBump','wave']],jump:[['wave','hop'],['thankPasser','hop','wave'],['keepUps','wave']],applaud:[['thankPasser','wave'],['cheerRelay','wave'],['wave','thankPasser','fistBump']],celebrate:[['wave','airplane'],['airplane','thankPasser','wave'],['thankPasser','highFive','airplane']]},
 {wave:[['airplane','wave'],['highFive','airplane','wave'],['fistBump','doubleFive']],jump:[['airplane','hop'],['bounce','cheerRelay'],['keepUps','airplane']],applaud:[['airplane','thankPasser'],['thankPasser','cheerRelay'],['cheerRelay','highFive','airplane']],celebrate:[['airplane','doubleFive'],['cheerRelay','airplane'],['doubleFive','bounce','wave']]},
 // Counter attendant stays behind the counter: seated/standing upper-body exchanges only.
 {wave:[['wave'],['wave','wave'],['wave','fistBump']],jump:[['thankPasser'],['thankPasser','thankPasser'],['thankPasser','fistBump']],applaud:[['highFive'],['doubleFive'],['highFive','thankPasser','wave']],celebrate:[['airplane'],['fistBump','airplane','thankPasser'],['airplane','wave','thankPasser']]},
];
const names=['High-five heroes','Cool teammates','Jumping buddies','Friendly fans','Victory partners','Prize-counter cheer'];
const tempos=[.94,1.08,.88,1.12,1,1.06],hops=[.25,.17,.34,.16,.3,.12];
const beatSeconds=(beat:Beat,tempo=1)=>seconds(beat)*(beat==='keepUps'?1:tempo);
/** Each button has a distinct, visitor-specific exchange and three authored variations. */
export function socialRoutine(id:number,action:ArcadeSocialAction,attendant=false,encounter=0):SocialRoutine{
 const index=attendant?5:id%5,variant=encounter%3,beats=exchanges[index][action][variant],tempo=tempos[index];
 let contactAt=.75,elapsed=0;for(const beat of beats){if(beat==='highFive'||beat==='fistBump'||beat==='thankPasser'||beat==='doubleFive'){contactAt=elapsed+beatSeconds(beat,tempo)*(beat==='doubleFive'?.25:beat==='thankPasser'?.65:.5);break;}elapsed+=beatSeconds(beat,tempo);}
 return{name:names[index]+['',' · Remix',' · Encore'][variant],beats,tempo,hopHeight:hops[index],responseDelay:index===2?.08:index===3?.22:.14,seconds:beats.reduce((n,b)=>n+beatSeconds(b,tempo),0)+.3,contactAt};
}
export function soloRoutine(action:ArcadeSocialAction):SocialRoutine{
 const beat:Beat=action==='jump'?'hop':action==='wave'?'wave':action==='applaud'?'thankPasser':'airplane';
 return{name:action,beats:[beat],seconds:seconds(beat),contactAt:.75};
}
export function keepUpAge(routine:SocialRoutine,age:number){let t=age;for(const beat of routine.beats){if(t<0)return -1;const duration=beatSeconds(beat,routine.tempo);if(t<=duration)return beat==='keepUps'?t:-1;t-=duration;}return -1;}
/** Reused native pose structs: no rig allocations and no independent animation clock. */
export function createSocialPose(){
 const skill:SkillMotion={type:'highFive',progress:0,side:1},jump={progress:0,height:.28};
 return (motion:PlayerMotion,routine:SocialRoutine,age:number,partner:boolean,reduced:boolean)=>{
  motion.skill=undefined;motion.jump=undefined;motion.juggle=undefined;motion.juggleTouch=undefined;motion.kickSide=undefined;motion.called=0;motion.ready=0;
  if(age<0)return;
  let t=age;for(const beat of routine.beats){const duration=beatSeconds(beat,routine.tempo);if(t>duration){t-=duration;continue;}
   const delayed=partner&&(beat==='wave'||beat==='hop'||beat==='thankPasser'||beat==='airplane')?(routine.responseDelay??0):0;
   const p=Math.max(0,Math.min(1,(t-delayed)/Math.max(.01,duration-delayed)));if(beat!=='keepUps')t/=routine.tempo??1;
   if(beat==='keepUps'){const start=partner?2.7:0,local=t-start;if(local>=0&&local<2.7){const touch=Math.min(2,Math.floor(local/1.05));motion.juggle=local<2.1?(local%1.05)/1.05:(local-2.1)/.6;motion.juggleTouch='foot';motion.kickSide=touch%2?1:-1;}else motion.ready=.25;}
   else if(beat==='doubleFive'){skill.type='highFive';skill.progress=(t%1.5)/1.5;skill.side=(partner?-1:1)*(t<1.5?1:-1) as -1|1;motion.skill=skill;}
   else if(beat==='bounce'){jump.progress=(t%.8)/.8;jump.height=reduced?.06:(routine.hopHeight??.2);motion.jump=jump;}
   else if(beat==='cheerRelay'){const first=t<1.4,local=(t%1.4)/1.4;if(first===partner){jump.progress=local;jump.height=reduced?.06:.25;motion.jump=jump;}else{skill.type='thankPasser';skill.progress=local;skill.side=partner?-1:1;motion.skill=skill;}}
   else if(beat==='hop'){jump.progress=p;jump.height=reduced?.08:(routine.hopHeight??.3)*(partner?.88:1);motion.jump=jump;}
   else if(beat==='wave')motion.called=Math.sin(p*Math.PI)*.85;
   else{skill.type=beat;skill.progress=p;skill.side=partner?-1:1;motion.skill=skill;}
   return;
  }
 };
}

export type SocialPoint={x:number;z:number};
/** Event-only bounded grid search. Diagonals cannot cut across furniture corners. */
export function socialPath(from:SocialPoint,to:SocialPoint,free:(x:number,z:number)=>boolean):SocialPoint[]|null{
 const width=57,height=45,size=width*height,step=.5,minX=-14,minZ=-11;
 const cell=(p:SocialPoint)=>Math.max(0,Math.min(height-1,Math.round((p.z-minZ)/step)))*width+Math.max(0,Math.min(width-1,Math.round((p.x-minX)/step)));
 const start=cell(from),end=cell(to),parents=new Int32Array(size).fill(-2),queue=new Int32Array(size),pass=new Int8Array(size);
 const clear=(id:number)=>{if(id<0||id>=size)return false;if(!pass[id])pass[id]=free(minX+(id%width)*step,minZ+Math.floor(id/width)*step)?1:-1;return pass[id]===1;};
 if(!free(to.x,to.z)||!clear(end))return null;
 let head=0,tail=1;queue[0]=start;parents[start]=-1;
 while(head<tail&&parents[end]===-2){const id=queue[head++],cx=id%width,cz=Math.floor(id/width);for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
  if((!dx&&!dz)||cx+dx<0||cx+dx>=width||cz+dz<0||cz+dz>=height)continue;const next=id+dz*width+dx;
  if(parents[next]!==-2||!clear(next)||(dx&&dz&&(!clear(id+dx)||!clear(id+dz*width))))continue;
  parents[next]=id;queue[tail++]=next;
 }}
 if(parents[end]===-2)return null;
 const points:SocialPoint[]=[to];for(let id=end;id!==start;id=parents[id])points.push({x:minX+(id%width)*step,z:minZ+Math.floor(id/width)*step});points.reverse();
 return points;
}
