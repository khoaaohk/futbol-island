import type {PlayerMotion} from '../player';
export const MOTION_STUDIES=[
 {id:'dribble',label:'Close-control dribble'},
 {id:'start-stop',label:'Accelerate → stop'},
 {id:'retreat-stop',label:'Backpedal → stop'},
 {id:'retreat-chase',label:'Backpedal → turn → chase'},
 {id:'cut45',label:'Anticipated 45° cut'},
 {id:'cut90',label:'Anticipated 90° cut'},
 {id:'shuffle',label:'Lateral shuffle → reverse'},
 {id:'receive-pass',label:'Run → receive → pass'},
 {id:'shot',label:'Approach → shoot → recover'},
] as const;
export type MotionStudyId=typeof MOTION_STUDIES[number]['id'];
export type StudySample={x:number;z:number;motion:PlayerMotion};
export const STUDY_DURATION=6;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{v=clamp(v);return v*v*(3-2*v);};
// Integral of smoothstep velocity, with continuous velocity and acceleration.
function ramp(t:number,d:number){if(t<=0)return 0;if(t>=d)return t-d/2;const u=t/d;return d*(u*u*u-.5*u*u*u*u);}
export function sampleMotionStudy(id:MotionStudyId,t:number,out:StudySample,mirror=false){
 const m=out.motion,side=mirror?-1:1;
 m.facing=0;m.runIntensity=.7;m.backpedal=0;m.jockey=0;m.stance=undefined;m.intentHeading=undefined;m.brake=0;m.receive=0;m.kick=undefined;m.actionKind=undefined;m.shotPower=undefined;m.dribbling=false;m.kickSide=side;m.resumePose=t===0;
 out.x=0;out.z=0;
 if(id==='dribble'){out.z=3*(ramp(t,.8)-ramp(t-4,.6));m.dribbling=true;m.runIntensity=.5;}
 else if(id==='start-stop'){out.z=4*(ramp(t,.8)-ramp(t-3,.55));m.runIntensity=.8;}
 else if(id==='retreat-stop'){out.z=-2*(ramp(t,.6)-ramp(t-3,.5));m.backpedal=t<3.6?1:0;m.jockey=.45;m.runIntensity=.4;}
 else if(id==='retreat-chase'){out.z=-2*ramp(t,.6)-3*ramp(t-2,.65);m.facing=side*Math.PI*ease((t-1.8)/.65);m.backpedal=1-ease((t-1.8)/.65);m.intentHeading=side*Math.PI;m.jockey=.4*m.backpedal;m.runIntensity=.4+.6*ease((t-2)/.65);}
 else if(id==='cut45'||id==='cut90'){
  const angle=side*(id==='cut45'?Math.PI/4:Math.PI/2),u=ease((t-2)/.65),distance=ramp(t-2,.65);
  out.x=3.4*Math.sin(angle)*distance;out.z=3.4*ramp(t,.7)+3.4*(Math.cos(angle)-1)*distance;
  m.facing=Math.atan2(Math.sin(angle)*u,1+(Math.cos(angle)-1)*u);m.intentHeading=t>1.65?angle:0;
 }
 else if(id==='shuffle'){out.x=side*1.1*(1-Math.cos(t*1.5));m.jockey=1;m.stance='ready';m.runIntensity=.2;}
 else{
  out.z=2.5*(ramp(t,.7)-ramp(t-2,.6));m.receive=id==='receive-pass'?Math.sin(Math.PI*clamp((t-1.5)/.6)):0;
  const kick=(t-2.4)/.8;if(kick>=0&&kick<1){m.kick=kick;m.actionKind=id==='shot'?'shot':'pass';m.shotPower=.8;}
 }
 return out;
}
