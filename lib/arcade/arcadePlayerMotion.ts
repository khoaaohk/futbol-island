/** Reused pose state. Visual articulation only; never delays gameplay contact. */
export type ArcadePoseOptions={vx?:number;vz?:number;charge?:number;slide?:number;stun?:number;celebrate?:number;anticipate?:number;stride?:number;dribbling?:boolean;
 /** Contact coordinates in unscaled rig-local metres; latched for the follow-through. */
 strikeX?:number;strikeZ?:number;shotPower?:number;actionKind?:'pass'|'shot'|'loft';
 receive?:number;receiveProgress?:number;
 keeper?:number;jockey?:number;dive?:import('../graphics/player').PlayerMotion['dive'];jumpProgress?:number;jumpHeight?:number;
 reaction?:import('../graphics/player').PlayerMotion['reaction'];reactionProgress?:number;
 skill?:import('../graphics/player').PlayerMotion['skill'];move?:import('../graphics/player').PlayerMotion['move'];
};
export function createArcadePlayerMotion(){return{initialized:false,yaw:0,stride:0,effort:0,hit:0,slide:0,ready:0,charge:0,stun:0,celebrate:0,bank:0,pitch:0,vx:0,vz:0,bodyY:0,bodyX:0,bodyZ:0,chestY:0,headY:0,scaleX:1,scaleY:1,hips:new Float64Array(2),knees:new Float64Array(2),ankles:new Float64Array(2),rolls:new Float64Array(2),arms:new Float64Array(2),elbows:new Float64Array(2)};}
export type ArcadePlayerMotion=ReturnType<typeof createArcadePlayerMotion>;
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const blend=(a:number,b:number,rate:number,dt:number)=>a+(b-a)*(1-Math.exp(-rate*dt));
export function stepArcadePlayerMotion(s:ArcadePlayerMotion,dt:number,speed:number,facing:number,kick=0,jump=0,lean=0,o?:ArcadePoseOptions,reduced=false){
 if(!s.initialized){s.yaw=facing;s.initialized=true;}
 if(dt<=0)return s;dt=Math.min(.05,dt);
 const turn=Math.atan2(Math.sin(facing-s.yaw),Math.cos(facing-s.yaw));s.yaw+=turn*(1-Math.exp(-dt*(kick>0?30:18)));
 const vx=o?.vx??Math.sin(facing)*speed,vz=o?.vz??Math.cos(facing)*speed,ax=(vx-s.vx)/dt,az=(vz-s.vz)/dt;
 const forward=Math.sin(s.yaw)*vx+Math.cos(s.yaw)*vz,lateral=Math.cos(s.yaw)*vx-Math.sin(s.yaw)*vz;
 s.vx=vx;s.vz=vz;s.effort=blend(s.effort,clamp(speed/7,0,1),14,dt);s.hit=blend(s.hit,clamp(kick,0,1.4),kick>s.hit?35:20,dt);
 s.slide=blend(s.slide,clamp(o?.slide??0,0,1),18,dt);s.ready=blend(s.ready,clamp(o?.anticipate??0,0,1),16,dt);s.charge=blend(s.charge,clamp(o?.charge??0,0,1),15,dt);s.stun=blend(s.stun,clamp(o?.stun??0,0,1),18,dt);s.celebrate=blend(s.celebrate,clamp(o?.celebrate??0,0,1),14,dt);
 s.stride=o?.stride??s.stride+dt*(3.5+Math.min(12,speed)*.95)*s.effort;
 s.bank=blend(s.bank,clamp(lean*.11+turn*.16+lateral*.015,-.28,.28),12,dt);
 s.pitch=blend(s.pitch,clamp((Math.sin(s.yaw)*ax+Math.cos(s.yaw)*az)*.008,-.17,.18),11,dt);
 const crouch=s.ready*.07+s.charge*.085+s.slide*.31,swing=Math.sin(s.stride),air=clamp(jump*3,0,1),strideSize=(.09+s.effort*.19)*(1-s.slide)*(1-s.hit*.48)*(1-s.charge*.5);
 const plantedZ=swing*strideSize;
 s.bodyY=.095+Math.sqrt(.535*.535-plantedZ*plantedZ)-.65-crouch-air*.035;
 s.bodyX=s.effort*.1+s.pitch-s.hit*.12+s.charge*.16-s.slide*.5+s.stun*.28;
 s.bodyZ=reduced?0:-s.bank+Math.sin(s.stride)*s.stun*.14;
 s.chestY=(reduced?0:swing*s.effort*.075)-s.hit*.24+s.charge*.17;s.headY=clamp(turn*.35,-.3,.3)-s.chestY*.55;
 s.scaleX=1+(reduced?0:s.hit*.025);s.scaleY=1-(reduced?0:s.hit*.018);
 for(let i=0;i<2;i++){
  const phase=s.stride+i*Math.PI,cycle=Math.sin(phase),lift=Math.max(0,Math.cos(phase))*.105*s.effort*(1-s.slide);
  // Stance foot stays at ground level; only the recovery half lifts. Solve the
  // two leg segments so crouching and landing bend the knee instead of sinking boots.
  let z=cycle*strideSize*(Math.abs(forward)<.2?0:Math.sign(forward)),y=.095+lift-(.65+s.bodyY);
  if(i===1){z+=s.hit*.33-s.charge*.14;y+=s.hit*.2+s.charge*.035;}
  z+=s.slide*(i===0?.36:-.18);y+=s.slide*(i===0?.07:.04);
  const distance=clamp(Math.hypot(z,y),.065,.539),direction=Math.atan2(-z,-y),alpha=Math.acos(clamp((.28*.28+distance*distance-.26*.26)/(.56*distance),-1,1));
  s.hips[i]=direction-alpha-air*(i===0?.35:-.25);
  s.knees[i]=Math.PI-Math.acos(clamp((.28*.28+.26*.26-distance*distance)/(.1456),-1,1))+air*.4;
  s.ankles[i]=-s.hips[i]-s.knees[i]+Math.max(0,-cycle-.5)*.2*s.effort*(1-s.slide);
  s.rolls[i]=(i===0?-.045:.045)+cycle*clamp(lateral/7,-1,1)*s.effort*.22+s.bank*.12;
  s.arms[i]=cycle*s.effort*.55+s.hit*(i===0?-.35:.4)-s.charge*.3-s.celebrate*2.35+s.slide*.5;
  s.elbows[i]=-.35-Math.max(0,cycle)*s.effort*.65-s.ready*.45-s.charge*.55;
 }
 return s;
}
