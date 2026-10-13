import {Scene,pitch,floorLine,arcPoints,spot,goal,figure,ball,flag,reticle,path,panel,lamp,block,cylinder} from '../parts';
import {centreOn,type Camera} from '../iso';
import {clamp,lerp,easeOut} from '../loop';
import {RAMPS} from '../palette';

/**
 * pixeliso demo · a pitch corner (Oct 10 2026): the goal line runs along y (x = 0), the corner flag stands at (0, 0), the goal
 * mouth is 7.32 × 2.44 m, the 6-yard box is 5.5 m deep. Drag back from the ball (a slingshot) to aim and set power; let go to
 * kick. The keeper's reach shrinks as the kick gets harder (less time to react). Pure: tests import it.
 */
export const GOAL_W=7.32,GOAL_H=2.44,POST_A=3.5,POST_B=POST_A+GOAL_W,MID=(POST_A+POST_B)/2,KEEPER_X=.6;
export const BALL0={x:7.5,y:8.6} as const;
export const ROUND=5;
export type Result='goal'|'saved'|'wide'|'over';
export type Shot={ty:number;h:number;power:number;result:Result;dive:number};

/** Aim from a drag: pulling back from the ball by (dx, dy) world metres shoots the other way. Null = not toward goal. */
export function aimOf(pull:{x:number;y:number}):{ty:number;power:number}|null{
 const d={x:-pull.x,y:-pull.y},len=Math.hypot(d.x,d.y);if(len<.35||d.x>=-.05)return null;
 const t=BALL0.x/-d.x;return {ty:BALL0.y+d.y*t,power:clamp((len-.35)/4.6,0,1)};}
/** Height the ball crosses the goal line at (m): harder = higher. Past 0.82 power it clears the bar. */
export const heightOf=(power:number)=>.25+power*2.7;
/** Keeper reach along the line (m) for a kick of this power: 2.4 m for a soft one, 0.9 m for a full-power one. */
export const reachOf=(power:number)=>lerp(2.4,.9,power);
export const flightSeconds=(power:number)=>lerp(1.1,.55,power);
export function outcome(ty:number,power:number,keeperY=MID):{result:Result;dive:number}{
 const h=heightOf(power),dive=clamp(ty-keeperY,-reachOf(power),reachOf(power));
 if(ty<POST_A+.11||ty>POST_B-.11)return {result:'wide',dive};
 if(h>GOAL_H-.11)return {result:'over',dive};
 return {result:Math.abs(ty-keeperY)<=reachOf(power)&&h<2.1?'saved':'goal',dive};}

/** Where the ball is s seconds into a shot (and whether it has finished). */
export function flightAt(shot:Pick<Shot,'ty'|'h'|'power'|'result'>,s:number){
 const T=flightSeconds(shot.power),u=clamp(s/T,0,1);
 // To the line on a gentle arc, then on into the net (a goal), back off the keeper (saved), or on past the post / bar.
 const x=lerp(BALL0.x,0,u),y=lerp(BALL0.y,shot.ty,u),z=lerp(0,shot.h,u)+Math.sin(u*Math.PI)*(.5+shot.power*.4);
 if(u<1)return {x,y,z,done:false};
 const v=clamp((s-T)/.45,0,1),e=easeOut(v);
 if(shot.result==='goal')return {x:-1.7*e,y:shot.ty,z:shot.h*(1-e)+.0,done:v>=1};
 if(shot.result==='saved')return {x:1.8*e+.3,y:shot.ty+(shot.ty<MID?-1:1)*1.2*e,z:shot.h*(1-e),done:v>=1};
 return {x:-2.6*e,y:shot.ty+(shot.result==='wide'?(shot.ty<MID?-1:1)*1.4*e:0),z:shot.h+(shot.result==='over'?.8*e:0)-(shot.result==='wide'?shot.h*e:0),done:v>=1};}

export type DemoState={pull:{x:number;y:number}|null;shot:Shot|null;t:number;flagFrame:number;goals:number};
/** The camera: the goal mouth area centred in the buffer. */
export const cameraFor=(w:number,h:number):Camera=>centreOn(w,h,3.2,7.6,0,[0,8]);

/** Build the scene for a state (pure). */
export function buildScene(s:DemoState):Scene{
 const sc=new Scene();
 // Floor: mown grass far past the buffer, then the lines.
 sc.add(pitch(-24,-24,60,60,{band:2,axis:'x'}));
 sc.add(floorLine([[0,-6],[0,20]]),floorLine([[-6,0],[18,0]]));// goal line, touchline
 sc.add(floorLine(arcPoints(0,0,1,0,Math.PI/2,8)));// corner arc
 sc.add(floorLine([[0,POST_A-5.5],[5.5,POST_A-5.5],[5.5,POST_B+5.5],[0,POST_B+5.5]]));// 6-yard box
 sc.add(floorLine([[16.5,-6],[16.5,20]]),spot(11,MID));
 // Behind the goal: an ad board and a floodlight (a machine with a lamp and a screen).
 sc.add(panel(-2.6,-4.6,0,4,1.1,{face:'y',ramp:'blue',screen:'#002400',text:`GOALS ${s.goals}`,id:'board'}));
 sc.add(cylinder(-1.6,1.4,0,.16,2.6,'steel'),block(-1.95,1.05,2.6,.7,.7,.45,'steel',{ink:true}),lamp(-1.6,1.4,3.25,{r:7}));
 sc.add(flag(0,0,{frame:s.flagFrame}));
 // The goal (net behind, frame in front) and the keeper.
 const ball0=s.shot?flightAt(s.shot,s.t):{x:BALL0.x,y:BALL0.y,z:0,done:false};
 const bulge=s.shot?.result==='goal'&&s.t>flightSeconds(s.shot.power)?{u:s.shot.ty-POST_A,z:s.shot.h,amt:.6*Math.min(1,(s.t-flightSeconds(s.shot.power))/.3)}:null;
 sc.add(goal(0,POST_A,{bulge}));
 const T=s.shot?flightSeconds(s.shot.power):1,dv=s.shot?clamp((s.t-T*.35)/(T*.6),0,1):0,ky=MID+(s.shot?s.shot.dive*easeOut(dv):0);
 const diving=s.shot&&dv>0&&Math.abs(s.shot.dive)>.6;
 sc.add(figure(KEEPER_X,ky,diving?.3*Math.sin(dv*Math.PI):0,{kit:'keeper',pose:diving?'dive':'ready',flip:(s.shot?.dive??0)<0,hair:'brown',skin:'light',id:'keeper'}));
 // The striker, behind the ball.
 const kicking=s.shot&&s.t<.35;
 sc.add(figure(BALL0.x+1.1,BALL0.y-.5,0,{kit:'red',pose:kicking?'kick':s.shot?.result==='goal'&&s.t>T+.2?'cheer':'stand',facing:'back',flip:true,hair:'black',skin:'mid',id:'striker'}));
 // Ball.
 sc.add(ball(ball0.x,ball0.y,ball0.z,{frame:Math.floor(s.t*12),id:'ball'}));
 // Aim: the reticle where it crosses the line and the dotted path.
 const aim=s.pull&&!s.shot?aimOf(s.pull):null;
 if(aim){const h=heightOf(aim.power),c=aim.ty<POST_A||aim.ty>POST_B||h>GOAL_H?RAMPS.red[3]:RAMPS.gold[2];
  sc.add(reticle(0,aim.ty,{colour:c}),path(Array.from({length:9},(_,i)=>{const u=i/8;return [lerp(BALL0.x,0,u),lerp(BALL0.y,aim.ty,u),lerp(0,h,u)+Math.sin(u*Math.PI)*(.5+aim.power*.4)] as const;}),c));}
 return sc;
}
