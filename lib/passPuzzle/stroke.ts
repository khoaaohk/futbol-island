/** Draw-the-pass stroke reader: pitch-metre points → a Kick. Pure and cheap. */
import type {StrokePoint,PuzzleWorld,Kick,Vec2} from './types';
import {clamp,travel,MEET_SPEED} from './sim';
import {geoOf} from './physics';

export const HOLD_R=0.4;          // m: how still "holding still" is
export const HOLD_MIN=0.25;       // s before loft starts
export const HOLD_RAMP=0.45;      // s to full loft
export const LOFT_MIN=0.15;       // the first held moment already gives a real chip
export const HEADER_LOFT=0.5;     // lofted end near a teammate at ≥ this → header
export const TEAMMATE_R=1.4;      // m: "on a teammate" (feet zone)
export const HEAD_R=0.8;          // m: the head zone: a lofted end this close to the teammate is a header
export const MOUTH_DEPTH=1.0;     // m in front of the goal line that counts as the goal mouth
export const POWER_LEN=30;        // m of stroke for full power
export const CURL_FULL=0.22;      // bow / chord for full curl
export const CURL_DEAD=0.35;      // m of bow ignored (finger wobble)

function readGesture(points:StrokePoint[],world:PuzzleWorld):Kick{
  const s=world.state,geo=geoOf(world.scenario);
  const ball=s.ball.p;
  const n=points.length;
  const end=n?points[n-1]:{x:ball.x,z:ball.z+1,t:0};
  // hold at the end → loft
  let j=n-1;
  while(j>0&&Math.hypot(points[j-1].x-end.x,points[j-1].z-end.z)<=HOLD_R)j--;
  const hold=n?end.t-points[Math.max(0,j)].t:0;
  const loft=hold<HOLD_MIN?0:clamp(LOFT_MIN+(1-LOFT_MIN)*(hold-HOLD_MIN)/HOLD_RAMP,0,1);
  // Distance controls automatic power; scribbling cannot add free energy.
  const st=n?points[0]:end,cx=end.x-st.x,cz=end.z-st.z,chord=Math.hypot(cx,cz);
  let power=clamp(chord/POWER_LEN,0.1,1);
  // Integrate the signed bow over the chord. One bad pointer sample no longer
  // dictates spin; a deliberate smooth curve still retains its full shape.
  let curl=0;
  if(chord>1&&n>2){
    const ux=cx/chord,uz=cz/chord;let area=0,previousAlong=0,previousBow=0;
    for(let i=1;i<n;i++){const dx=points[i].x-st.x,dz=points[i].z-st.z,along=clamp(dx*ux+dz*uz,previousAlong,chord),bow=dx*uz-dz*ux;
      area+=(along-previousAlong)*(bow+previousBow)*.5;previousAlong=along;previousBow=bow;}
    const dev=area/chord*(Math.PI/2);
    // Automatic pace accounts for the intentional smooth arc, never accumulated
    // raw zigzags. Integrate a sine bow with 16 bounded samples.
    let arc=0;for(let i=0;i<=16;i++){const slope=Math.PI*dev/chord*Math.cos(Math.PI*i/16);arc+=Math.sqrt(1+slope*slope)*(i===0||i===16?.5:1);}
    power=clamp(chord*arc/16/POWER_LEN,.1,1);
    if(Math.abs(dev)>CURL_DEAD)curl=clamp((dev-Math.sign(dev)*CURL_DEAD)/(CURL_FULL*chord),-1,1);
  }
  // where does it end?
  const beyond=end.z>=geo.goalZ;
  let near=-1,nd=1e9;
  for(let i=0;i<s.attackers.length;i++){
    if(i===s.carrier)continue;
    const a=s.attackers[i].p,d=Math.hypot(a.x-end.x,a.z-end.z);
    if(d<=TEAMMATE_R&&d<nd){nd=d;near=i;}
  }
  if(near>=0&&!beyond){
    const a=s.attackers[near].p,target:Vec2={x:a.x,z:a.z};
    // header only for a well-lofted end right on the teammate; a chip that ends near him is to feet
    return {kind:loft>=HEADER_LOFT&&nd<=HEAD_R?'header':'pass-feet',target,receiver:near,curl,loft,power};
  }
  if(end.z>=geo.goalZ-MOUTH_DEPTH&&Math.abs(end.x)<=geo.halfGoal+0.6){
    return {kind:'shot',target:{x:clamp(end.x,-(geo.halfGoal-0.25),geo.halfGoal-0.25),z:geo.goalZ},curl,loft,power};
  }
  // empty grass: the attacker who gets there first is the runner
  let rec:number|undefined,bt=3.5;
  for(let i=0;i<s.attackers.length;i++){
    if(i===s.carrier)continue;
    const a=s.attackers[i].p,t=travel(Math.hypot(a.x-end.x,a.z-end.z),MEET_SPEED);
    if(t<bt){bt=t;rec=i;}
  }
  const k:Kick={kind:'pass-space',target:{x:end.x,z:end.z},curl,loft,power};
  if(rec!=null)k.receiver=rec;
  return k;
}

export type PassControlMode='auto'|'ground'|'lift'|'shoot';
export type PassControlOptions={mode?:PassControlMode;power?:number;shotHeight?:number};
/** Explicit controls share one interpretation for preview and actual release. */
export function readStroke(points:StrokePoint[],world:PuzzleWorld,options:PassControlOptions={}):Kick{
 const kick=readGesture(points,world),mode=options.mode??'auto';
 if(mode==='ground'){kick.loft=0;if(kick.kind==='header')kick.kind='pass-feet';}
 if(mode==='lift'){kick.loft=.65;if(kick.kind==='pass-feet')kick.kind='header';}
 if(mode==='shoot'){
  const gestureLoft=kick.loft;
  const geo=geoOf(world.scenario),ball=world.state.ball.p,end=points.at(-1)??ball,forward=end.z-ball.z;
  const x=end.z>=geo.goalZ-1?end.x:forward>.5?ball.x+(end.x-ball.x)*(geo.goalZ-ball.z)/forward:end.x;
  kick.kind='shot';kick.receiver=undefined;kick.target={x:clamp(x,-geo.halfGoal+.25,geo.halfGoal-.25),z:geo.goalZ};kick.loft=0;
  if(Number.isFinite(options.shotHeight))kick.shotHeight=clamp(options.shotHeight!,0,1);
  else kick.shotHeight=gestureLoft;
 }
 if(options.power!==undefined&&Number.isFinite(options.power))kick.power=clamp(options.power,.1,1);
 return kick;
}
