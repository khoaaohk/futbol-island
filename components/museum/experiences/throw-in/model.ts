/**
 * throw-in · the model of THE THROW-IN TRAINER (Oct 14 2026 redo; user: "make it possible to turn knobs and things to make it do
 * something", like the stadiums' breakdown). Pure, no DOM: tests/museum-exp-throw-in.cjs runs it in Node.
 *
 * The object: a jointed wooden mannequin standing at the touchline on a heavy bench. Its controls set the throw, and the
 * referee's box on the bench judges it at once by IFAB Law 15: at the moment of delivering the ball the thrower must
 *  - stand facing the field of play (the trainer always faces the pitch);
 *  - have PART OF EACH FOOT on the touchline or on the ground outside the touchline;
 *  - throw the ball with both hands from behind and over the head.
 * A foul throw is retaken by the other team. Opponents stand at least 2 m from the thrower. No goal straight from a throw-in.
 *
 * World units are centimetres: X along the touchline, Y into the pitch (+), Z up. The touchline is the strip 0 ≤ Y ≤ 12 (Law 1:
 * lines are no wider than 12 cm, and they belong to the area they bound). A foot is 26 long, so a foot whose centre is at Y
 * still has part of it on the line while Y − 13 ≤ 12.
 */
export type Lift=0|1|2;
/** The trainer's settings: each foot's centre (Y, cm), the back foot's lift (flat, heel up, off the ground), hands, the arm knob (0..1). */
export type Rig={footL:number;footR:number;lift:Lift;hands:1|2;arm:number};
export const FAIR_RIG:Rig={footL:-6,footR:4,lift:0,hands:2,arm:.85};
export const START_RIG:Rig={footL:-8,footR:34,lift:0,hands:1,arm:.25};
export const LINE_W=12,FOOT_L=26,FOOT_MIN=-44,FOOT_MAX=46;
export const LIFTS=['Flat on the ground','Heel up, toes down','Foot off the ground'] as const;

export type Check='feet'|'ground'|'hands'|'over';
export const CHECKS:readonly Check[]=['feet','ground','hands','over'];
export const CHECK_NAME:Record<Check,string>={feet:'Feet on or behind the line',ground:'Both feet on the ground',hands:'Two hands',over:'Behind and over the head'};
export const REASON:Record<Check,string>={
 feet:'A whole foot is on the pitch. Part of each foot must be on the touchline or on the ground behind it.',
 ground:'A foot is off the ground. Part of each foot must touch the ground when you let go.',
 hands:'One hand. The Law says both hands.',
 over:'Not from behind and over the head. Start with the ball behind your head.',
};
export const FAIR_REASON='Part of each foot on the line or behind it, both on the ground, two hands, from behind and over the head.';

/** Where a foot is: wholly behind the line, touching it, or wholly on the pitch. */
export function footZone(y:number):'behind'|'on'|'pitch'{
 if(y+FOOT_L/2<0)return 'behind';
 if(y-FOOT_L/2>LINE_W)return 'pitch';
 return 'on';
}
export const footFair=(y:number)=>footZone(y)!=='pitch';
/** The back foot (the one further from the pitch) is the one the lift lever raises. */
export const backFoot=(r:Rig):'L'|'R'=>r.footL<=r.footR?'L':'R';

// ── The mannequin ───────────────────────────────────────────────────────────────────────────────────────────────────────
export type V3=[number,number,number];
export const BODY={thigh:45,shin:45,ankle:7,hipW:10,footX:13,torso:54,neck:9,head:11,shoulder:17,upper:29,fore:27,ball:11};
export type Joints={hipL:V3;hipR:V3;kneeL:V3;kneeR:V3;ankleL:V3;ankleR:V3;heelL:V3;heelR:V3;toeL:V3;toeR:V3;pelvis:V3;waist:V3;neck:V3;head:V3;
 shL:V3;shR:V3;elL:V3;elR:V3;haL:V3;haR:V3;ball:V3};
const D=Math.PI/180;
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mul=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
const len=(a:V3)=>Math.hypot(a[0],a[1],a[2]);
/** Shoulder and elbow from the arm knob: from the ball at the chest (0) to the ball behind the head (1). */
export const armAngles=(a:number)=>({sh:35+a*170,el:95-a*35});
/** A direction in the figure's side plane: `deg` from straight down, turning forward (+Y), then up, then back. */
const sag=(deg:number):V3=>[0,Math.sin(deg*D),-Math.cos(deg*D)];

/** Two-bone leg: the knee bends forward, in the plane of hip and ankle. */
function knee(hip:V3,ankle:V3):V3{
 const d:V3=[ankle[0]-hip[0],ankle[1]-hip[1],ankle[2]-hip[2]],L=Math.min(len(d),BODY.thigh+BODY.shin-1e-6),u=mul(d,1/(len(d)||1));
 const a=L/2,h=Math.sqrt(Math.max(0,BODY.thigh**2-a*a));
 // forward, perpendicular to the leg, in the Y–Z plane
 let f:V3=[0,u[2],-u[1]];if(f[1]<0)f=mul(f,-1);const fl=len(f)||1;f=mul(f,1/fl);
 return add(add(hip,mul(u,a)),mul(f,h));
}

/** Every joint, from the settings. `swing` (0..1) is the throw: the arms come over and forward. */
export function joints(r:Rig,swing=0):Joints{
 const back=backFoot(r);
 const foot=(side:'L'|'R'):{ankle:V3;heel:V3;toe:V3}=>{const y=side==='L'?r.footL:r.footR,x=(side==='L'?-1:1)*BODY.footX,lifted=side===back?r.lift:0;
  const heelY=y-FOOT_L/2+4,toeY=y+FOOT_L/2;
  if(lifted===1){const toe:V3=[x,toeY,2],heel:V3=[x,heelY+3,13];return {toe,heel,ankle:[x,heelY+5,BODY.ankle+12]};}
  if(lifted===2){const lift=14;return {toe:[x,toeY,2+lift],heel:[x,heelY,4+lift],ankle:[x,heelY+2,BODY.ankle+lift+2]};}
  return {toe:[x,toeY,2],heel:[x,heelY,4],ankle:[x,heelY+2,BODY.ankle]};};
 const fL=foot('L'),fR=foot('R');
 // The pelvis sits over the feet, as high as the longer reach allows (a little knee bend always).
 const py=(fL.ankle[1]+fR.ankle[1])/2-2,reach=(BODY.thigh+BODY.shin)*.985;
 const zOf=(an:V3,hx:number)=>an[2]+Math.sqrt(Math.max(0,reach*reach-(an[1]-py)**2-(an[0]-hx)**2));
 const pz=Math.min(zOf(fL.ankle,-BODY.hipW),zOf(fR.ankle,BODY.hipW));
 const hipL:V3=[-BODY.hipW,py,pz],hipR:V3=[BODY.hipW,py,pz],pelvis:V3=[0,py,pz];
 const {sh,el}=armAngles(r.arm),s=Math.max(0,Math.min(1,swing));
 // The trunk arches back a little with the ball behind the head, and whips forward in the throw.
 const lean=-r.arm*9+s*22,up=sag(180+lean);// pointing up, tipped forward by lean
 const waist=add(pelvis,mul(up,16)),neck=add(pelvis,mul(up,BODY.torso)),head=add(neck,mul(up,BODY.neck+BODY.head));
 const shBase=add(neck,mul(up,-6)),shL:V3=[-BODY.shoulder,shBase[1],shBase[2]],shR:V3=[BODY.shoulder,shBase[1],shBase[2]];
 const armOf=(base:V3,side:-1|1,shA:number,elA:number,inX:number):{el:V3;ha:V3}=>{
  const e=add(base,add(mul(sag(shA+lean),BODY.upper),[side*-2,0,0]));
  const h=add(e,mul(sag(shA+elA+lean),BODY.fore));return {el:e,ha:[side*inX,h[1],h[2]]};};
 const shA=sh-(sh-110)*s*1.35,elA=el*(1-s*.85);
 const R=armOf(shR,1,shA,elA,BODY.ball-1);
 let L=armOf(shL,-1,shA,elA,BODY.ball-1),ball:V3;
 if(r.hands===2)ball=[0,(L.ha[1]+R.ha[1])/2,(L.ha[2]+R.ha[2])/2];
 else{L=armOf(shL,-1,12,14,BODY.shoulder+4);const fwd=sag(shA+elA+lean);ball=add(add(R.ha,[-BODY.ball+3,0,0]),mul(fwd,6));}
 return {hipL,hipR,kneeL:knee(hipL,fL.ankle),kneeR:knee(hipR,fR.ankle),ankleL:fL.ankle,ankleR:fR.ankle,heelL:fL.heel,heelR:fR.heel,toeL:fL.toe,toeR:fR.toe,
  pelvis,waist,neck,head,shL,shR,elL:L.el,elR:R.el,haL:L.ha,haR:R.ha,ball};
}
/** Behind and over the head: the ball's centre is above the top of the head and not in front of it. Measured on the figure. */
export function overHead(r:Rig){const j=joints(r);return j.ball[2]>=j.head[2]+BODY.head*.6&&j.ball[1]<=j.head[1]+2;}
/** The smallest arm-knob setting that is behind and over the head (the green arc on the knob's dial). */
export const OVER_FROM=(()=>{for(let a=0;a<=1.0001;a+=.005)if(overHead({...FAIR_RIG,arm:a}))return Math.round(a*1000)/1000;return 1;})();

/** The referee's call: fair, or a foul throw with every reason, in the order of the four flags. */
export function judge(r:Rig){
 const fouls:Check[]=[];
 if(!footFair(r.footL)||!footFair(r.footR))fouls.push('feet');
 if(r.lift===2)fouls.push('ground');
 if(r.hands!==2)fouls.push('hands');
 if(!overHead(r))fouls.push('over');
 return {fair:fouls.length===0,fouls};
}
/** Law 15: a foul throw is retaken by the OTHER team. */
export const afterFoul=()=>'other team' as const;
/** Law 15: the throw-in goes to the opponents of the player who last touched the ball. */
export const throwTo=(lastTouch:'red'|'blue')=>lastTouch==='red'?'blue':'red';
/** Law 15: no goal straight from a throw-in: into their goal is a goal kick, into your own is a corner. */
export const directIntoGoal=(goal:'theirs'|'ours')=>goal==='theirs'?'goal kick':'corner kick';

// ── The throw ────────────────────────────────────────────────────────────────────────────────────────────────────────────
/** The aim dial (degrees from straight into the pitch, + = along the line to the right) and the power lever (0..1). */
export const AIM_MAX=65,MIN_D=250,MAX_D=1100,CATCH=130,MIN_GAP=200;
export const distanceOf=(power:number)=>MIN_D+Math.max(0,Math.min(1,power))*(MAX_D-MIN_D);
export function landing(aim:number,power:number):[number,number]{const a=Math.max(-AIM_MAX,Math.min(AIM_MAX,aim))*D,d=distanceOf(power);return [Math.sin(a)*d,LINE_W+Math.cos(a)*d];}
export const flightTime=(power:number)=>.55+distanceOf(power)/1400;
/** The ball's height at fraction u of the flight: from over the head, a lob that peaks higher for longer throws. */
export const lobZ=(power:number,u:number)=>220*(1-u)+12*u+4*(60+distanceOf(power)*.12)*u*(1-u);
export type Player={x:number;y:number;rail:[number,number]};
export type Round={id:'feet'|'line'|'free';title:string;goal:string;tip:string;mates:Player[];defs:Player[];target:number};
/** Three situations. Team-mates and defenders stand on rails across the model pitch; every defender is at least 2 m away. */
export const ROUNDS:readonly Round[]=[
 {id:'feet',title:'To feet',goal:'Throw it to your team-mate’s feet.',tip:'Short and simple: aim straight at him, not too hard.',
  mates:[{x:-120,y:420,rail:[-260,40]}],defs:[{x:260,y:700,rail:[120,420]}],target:0},
 {id:'line',title:'Down the line',goal:'Your winger is free down the line. Reach him before the defender.',tip:'Turn the aim dial along the line and give it more power.',
  mates:[{x:640,y:330,rail:[420,760]}],defs:[{x:180,y:560,rail:[60,360]}],target:0},
 {id:'free',title:'Find the free player',goal:'Two team-mates. One is marked. Throw to the free one.',tip:'A defender stands next to the right-hand player. Look left.',
  mates:[{x:-560,y:520,rail:[-700,-380]},{x:380,y:690,rail:[240,560]}],defs:[{x:400,y:560,rail:[260,560]}],target:0},
];
export type Result='caught'|'intercepted'|'loose'|'foul';
/** Who gets the ball where it lands: the nearest player within reach; a defender who is nearer wins it. */
export function resolve(round:Round,aim:number,power:number,rig:Rig):{result:Result;mate:number;at:[number,number]}{
 const at=landing(aim,power);
 if(!judge(rig).fair)return {result:'foul',mate:-1,at};
 const dist=(p:Player)=>Math.hypot(p.x-at[0],p.y-at[1]);
 let mi=-1,md=Infinity;round.mates.forEach((m,i)=>{const d=dist(m);if(d<md){md=d;mi=i;}});
 const dd=Math.min(...round.defs.map(dist));
 if(dd<=CATCH&&dd<md)return {result:'intercepted',mate:mi,at};
 if(md<=CATCH&&mi===round.target)return {result:'caught',mate:mi,at};
 if(md<=CATCH)return {result:'intercepted',mate:mi,at};
 return {result:'loose',mate:mi,at};
}
/** The aim and power that land a throw right on a player (for tests, and to check every round can be won). */
export function solve(p:{x:number;y:number}){const dy=p.y-LINE_W,d=Math.hypot(p.x,dy);return {aim:Math.atan2(p.x,dy)/D,power:(d-MIN_D)/(MAX_D-MIN_D)};}
export const TRIES=3;
