import {blocked,type Obstacle} from './simulation';
import {onIsland} from './shoreline';
import {fieldSurfaceHeight,VENUES} from './venues';
import {TRAVEL_MODES,type TravelMode} from './travelModes';
export type RideRamp={id:string;x:number;z:number;yaw:number;width:number;length:number;height:number;label:string;base?:number;cannon?:boolean;landingOnly?:boolean;target?:{x:number;z:number;height:number}};
type Point={x:number;z:number};
export function rampLocal(r:RideRamp,p:Point){const dx=p.x-r.x,dz=p.z-r.z;return {side:dx*Math.cos(r.yaw)-dz*Math.sin(r.yaw),along:dx*Math.sin(r.yaw)+dz*Math.cos(r.yaw)};}
export function rampSurface(ramps:RideRamp[],x:number,z:number){for(const r of ramps){const p=rampLocal(r,{x,z});if(Math.abs(p.side)<=r.width/2&&p.along>=0&&p.along<=r.length)return (r.base??0)+p.along/r.length*r.height;}return 0;}
/** Place ramps along clear road shoulders, with a full unobstructed landing corridor. */
export function planRideRamps(roads:{x:number;z:number;w:number;d:number;vertical:boolean}[],obstacles:Obstacle[]){
 const candidates:RideRamp[]=[];for(const road of roads){const length=road.vertical?road.d:road.w;for(let along=-length/2+12;along<length/2-45;along+=8)for(const side of [-7,7])for(const direction of [1,-1]){
 const x=road.x+(road.vertical?side:along),z=road.z+(road.vertical?along:side),yaw=road.vertical?(direction===1?0:Math.PI):(direction===1?Math.PI/2:-Math.PI/2),r={id:'',x,z,yaw,width:3.4,length:6,height:1.35,label:'SCAN • TIME YOUR RUN'};
 let clear=true;for(let d=-7;d<=49&&clear;d+=1.5)for(const across of [-2,0,2]){const px=x+Math.sin(yaw)*d+Math.cos(yaw)*across,pz=z+Math.cos(yaw)*d-Math.sin(yaw)*across;if(blocked(px,pz,obstacles,.9)||fieldSurfaceHeight(px,pz)>.02||VENUES.some(v=>Math.abs(px-v.x)<v.width/2+5&&Math.abs(pz-v.z)<v.length/2+5)){clear=false;break;}}
 if(clear)candidates.push(r);
 }}
 const chosen:RideRamp[]=[];for(const target of [{x:95,z:-35},{x:190,z:135}]){const r=candidates.filter(r=>chosen.every(c=>Math.hypot(c.x-r.x,c.z-r.z)>55)).sort((a,b)=>Math.hypot(a.x-target.x,a.z-target.z)-Math.hypot(b.x-target.x,b.z-target.z))[0];if(r)chosen.push({...r,id:'run-ramp-'+(chosen.length+1)});}for(const x of [110,130,150,30,50]){const r:RideRamp={id:'north-ramp',x,z:-212,yaw:Math.PI/2,width:3.4,length:6,height:1.35,label:'LOOK UP • TIME YOUR RUN'};let clear=true;for(let d=-8;d<49;d+=2)for(const side of [-2,0,2])if(!onIsland(x+d,-212+side)||blocked(x+d,-212+side,obstacles,1.2))clear=false;if(clear){chosen.push(r);break;}}return chosen;
}
/** Two linked roof jumps and a cannon finale use a clear lane on the south side of the Palm Coast roofs. */
export function planRoofRamps(roofs:(Obstacle&{height:number;name:string})[]){
 const result:RideRamp[]=[];
 for(const [from,to] of [['BAKERY','RUA DO SOL'],['RUA DO SOL','FISH MARKET']]){
  const a=roofs.find(r=>r.name===from),b=roofs.find(r=>r.name===to);if(!a||!b)continue;
  result.push({id:'roof-ramp-'+result.length,x:a.x+a.w/2-4,z:a.z+2.7,yaw:Math.PI/2,width:4,length:3,height:1.1,base:a.height,target:{x:b.x-1,z:b.z+2.7,height:b.height},label:'LOOK UP • FIND SPACE'});
 }const last=roofs.find(r=>r.name==='FISH MARKET');if(last){
 const x=last.x+last.w/2-4,z=last.z+2.7,target={x:64-16/3,z,height:2},yaw=Math.PI/2;
 result.push({id:'roof-ramp-finale',x,z,yaw,width:4,length:3,height:1.4,base:last.height,cannon:true,target,label:'FIND SPACE'});
 result.push({id:'roof-finale-landing',x:target.x+Math.sin(yaw)*(16/3),z:target.z+Math.cos(yaw)*(16/3),yaw:yaw+Math.PI,width:4,length:8,height:3,landingOnly:true,label:''});
 }return result;
}
export function createRampMotion(ramps:RideRamp[],obstacles:Obstacle[],roofs:(Obstacle&{height:number})[]=[],walls:(Obstacle&{top:number;floor:number})[]=[]){
 const state={phase:'idle' as 'idle'|'climb'|'air'|'land'|'splat',age:0,lift:0,pitch:0,roll:0,yaw:0,trickPitch:0,trickRoll:0,trickYaw:0,trickStretch:0,timeScale:1,ramp:null as RideRamp|null,speed:0,mode:'walk' as TravelMode,landings:0,launches:0};let cooldown=0,vy=0,gravity=20,launchVy=10,sign=1,lastRampId='',airDuration=1,impactHeight=0;
 const smooth=(a:number,b:number,value:number)=>{const t=Math.max(0,Math.min(1,(value-a)/(b-a)));return t*t*(3-2*t);};
 const reset=()=>{state.phase='idle';state.age=state.lift=state.pitch=state.roll=state.yaw=0;state.ramp=null;state.trickPitch=state.trickRoll=state.trickYaw=state.trickStretch=0;state.timeScale=1;cooldown=.7;};
 function enter(before:Point,p:Point,v:Point,mode:TravelMode,height=0){if((state.phase!=='idle'&&state.phase!=='land')||!['scooter','bike','moped'].includes(mode))return false;for(const r of ramps){const a=rampLocal(r,before),b=rampLocal(r,p),forward=v.x*Math.sin(r.yaw)+v.z*Math.cos(r.yaw);if((r.id!==lastRampId||(state.phase==='idle'&&cooldown<=0))&&Math.abs(height-((r.base??0)+Math.max(0,Math.min(1,b.along/r.length))*r.height))<.65&&b.along>=0&&b.along<r.length&&b.along>a.along&&Math.abs(b.side)<r.width/2-.2&&forward>(r.base ? 0.2 : 1.2)){state.phase='climb';state.ramp=r;state.mode=mode;state.age=0;state.speed=Math.min(38,Math.max(forward*1.45,TRAVEL_MODES[mode].maxSpeed*1.3));gravity=20;launchVy=r.cannon?18:10;if(r.cannon)state.speed=40;if(r.landingOnly){state.speed=32;launchVy=8;}if(r.target){const distance=Math.hypot(r.target.x-r.x-Math.sin(r.yaw)*r.length,r.target.z-r.z-Math.cos(r.yaw)*r.length),time=distance/state.speed,delta=r.target.height-(r.base??0)-r.height,peak=Math.max(r.cannon?5:2.5,delta+.8);gravity=((Math.sqrt(2*peak)+Math.sqrt(2*(peak-delta)))/time)**2;launchVy=Math.sqrt(2*gravity*peak);}airDuration=r.target?Math.hypot(r.target.x-r.x-Math.sin(r.yaw)*r.length,r.target.z-r.z-Math.cos(r.yaw)*r.length)/state.speed:2*launchVy/gravity;state.trickPitch=state.trickRoll=state.trickYaw=state.trickStretch=0;state.timeScale=1;lastRampId=r.id;state.lift=Math.max(0,b.along/r.length*r.height);state.launches++;sign=state.launches%2?1:-1;v.x=Math.sin(r.yaw)*state.speed;v.z=Math.cos(r.yaw)*state.speed;return true;}}return false;}
 function update(dt:number,p:Point,v:Point,mode:TravelMode,reduced=false):{owns:boolean;landed:boolean;crashed?:boolean;recovered?:boolean}{dt=Math.max(0,Math.min(.05,dt));cooldown=Math.max(0,cooldown-dt);if(state.phase==='idle')return {owns:false,landed:false};if(mode!==state.mode){reset();return {owns:false,landed:false};}
 // Slow only the finale jump clock: horizontal and vertical motion share dt,
 // preserving the landing trajectory without adding frames or scene effects.
 const progress=state.age/airDuration;
 const finale=state.phase==='air'&&state.ramp?.cannon&&!reduced;
 state.timeScale=finale?1-.82*smooth(.04,.22,progress)*(1-smooth(.72,.94,progress)):1;
 dt*=state.timeScale;state.age+=dt;
 if(state.phase==='splat'){v.x=v.z=0;state.lift=impactHeight*(1-smooth(.35,1.5,state.age));if(state.age>=1.5){reset();return {owns:true,landed:false,recovered:true};}return {owns:true,landed:false};}
 if(state.phase==='land'){const t=Math.min(1,state.age/.85),envelope=Math.exp(-4*t)*(1-t);state.roll=sign*Math.sin(t*Math.PI*5+.45)*.22*envelope;state.yaw=-sign*Math.sin(t*Math.PI*4)*.13*envelope;state.pitch=Math.cos(t*Math.PI*4)*.15*envelope;state.lift=Math.sin(t*Math.PI*2)**2*.08*envelope;if(t>=1)reset();return {owns:false,landed:false};}
 const r=state.ramp!,dx=Math.sin(r.yaw)*state.speed*dt,dz=Math.cos(r.yaw)*state.speed*dt,n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.15));for(let i=0;i<n;i++){if(blocked(p.x+dx/n,p.z+dz/n,(r.base||r.landingOnly)?walls.filter(w=>w.top>(r.base??0)+state.lift+.35&&w.floor<(r.base??0)+state.lift+1):obstacles,.8)){state.speed=0;if(r.landingOnly&&state.phase==='air'){state.phase='splat';state.age=0;impactHeight=state.lift;state.pitch=state.roll=state.yaw=0;v.x=v.z=0;return {owns:true,landed:false,crashed:true};}break;}p.x+=dx/n;p.z+=dz/n;}v.x=Math.sin(r.yaw)*state.speed*state.timeScale;v.z=Math.cos(r.yaw)*state.speed*state.timeScale;
 if(state.phase==='climb'){const t=Math.max(0,Math.min(1,rampLocal(r,p).along/r.length));state.lift=t*r.height;state.pitch=-Math.atan2(r.height,r.length)*Math.min(1,t*4);if(t>=1){state.phase='air';state.age=0;vy=launchVy;}else if(state.speed===0){reset();return {owns:false,landed:false};}}
 else{state.lift+=vy*dt-gravity*.5*dt*dt;vy-=gravity*dt;state.pitch=-.24+Math.min(1,state.age/1.15)*.42;state.roll=sign*Math.sin(state.age*Math.PI)*.055;if(r.cannon){const kick=Math.max(0,1-state.age/.85);state.pitch-=.65*kick;state.roll+=sign*Math.sin(state.age*12)*.55*kick;}if(r.cannon&&!reduced){const t=smooth(.12,.8,state.age/airDuration),envelope=Math.sin(Math.PI*t)**2;state.trickStretch=mode==='moped'?envelope:0;state.trickYaw=mode==='scooter'?sign*Math.PI*2*t:mode==='moped'?sign*.12*envelope:0;state.trickPitch=mode==='bike'?-Math.PI*2*t:0;state.trickRoll=mode==='moped'?sign*.18*envelope:mode==='bike'?sign*.18*envelope:0;}const floor=roofs.filter(b=>Math.abs(p.x-b.x)<b.w/2-.5&&Math.abs(p.z-b.z)<b.d/2-.5).reduce((h,b)=>Math.max(h,b.height),rampSurface(ramps,p.x,p.z));if(vy<0&&(r.base??0)+state.lift<=floor){state.phase='land';state.age=0;state.trickPitch=state.trickRoll=state.trickYaw=state.trickStretch=0;state.timeScale=1;state.lift=0;state.pitch=.15;state.landings++;return {owns:true,landed:true};}}
 return {owns:true,landed:false};}
 return {state,reset,enter,update};
}
