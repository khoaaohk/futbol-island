import {JUMP_V,stepJump,smoothLane,crossesPickup,goalPoints} from '../../components/games/runnerPhysics';
export type RunnerObject={lane:number;z:number;kind:'defender'|'cone'|'coin'|'goal';passed:boolean;openLane:number};
export function createRunnerGame(){return{time:0,distance:0,x:0,lane:0,y:0,vy:0,jumping:false,slide:0,boost:0,energy:0,score:0,goals:0,streak:0,lives:3,hurt:0,spawn:0,nextGoal:140,seed:47,objects:[] as RunnerObject[],event:0,message:'Read the defender. Find the open lane.'};}
export type RunnerGame=ReturnType<typeof createRunnerGame>;
function random(s:RunnerGame){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
export function runnerJump(s:RunnerGame){if(!s.jumping&&s.lives>0){s.jumping=true;s.vy=JUMP_V;s.slide=0;}}
export function runnerSlide(s:RunnerGame){if(!s.jumping&&s.lives>0)s.slide=.65;}
export function tickRunner(s:RunnerGame,dt:number){
 if(s.lives<=0)return;dt=Math.min(dt,.05);s.time+=dt;s.hurt=Math.max(0,s.hurt-dt);s.slide=Math.max(0,s.slide-dt);s.boost=Math.max(0,s.boost-dt);s.x=smoothLane(s.x,s.lane*2.4,dt);stepJump(s,dt);
 const speed=(13+Math.min(6,s.time*.045))*(s.boost>0?1.4:1);s.distance+=speed*dt;s.spawn-=dt;
 if(s.spawn<=0){s.spawn=1.05+random(s)*.45;const lane=Math.floor(random(s)*3)-1;s.objects.push({lane,z:-58,kind:random(s)<.5?'defender':'cone',passed:false,openLane:0},{lane:(lane+2)%3-1,z:-64,kind:'coin',passed:false,openLane:0});}
 if(s.distance>=s.nextGoal){s.nextGoal+=150;const lane=Math.floor(random(s)*3)-1;s.objects.push({lane:0,z:-60,kind:'goal',passed:false,openLane:lane});}
 for(const o of s.objects){const previous=o.z;o.z+=speed*dt;if(!o.passed&&crossesPickup(-previous,-o.z)){o.passed=true;const same=Math.abs(s.x-o.lane*2.4)<.85;if(o.kind==='goal'){if(Math.abs(s.x-o.openLane*2.4)<1.1){s.goals++;s.streak++;s.score+=goalPoints(s.boost>0,s.streak);s.message='Goal! Keep finding the open lane.';s.event++;}else{s.streak=0;s.message='Saved. Watch the open lane next time.';}}else if(same&&o.kind==='coin'){s.score+=25;s.energy++;if(s.energy===5){s.energy=0;s.boost=3;s.message='Five clean touches. Break away!';}s.event++;}else if(same&&s.hurt===0&&s.boost===0&&s.y<.9&&!(o.kind==='defender'&&s.slide>0)){s.lives--;s.streak=0;s.hurt=1.2;s.message=s.lives?'Find space before the next challenge.':'Full time. Try a new route.';s.event++;}}}
 for(let i=s.objects.length-1;i>=0;i--)if(s.objects[i].z>9)s.objects.splice(i,1);
}
