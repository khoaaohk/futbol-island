/**
 * Bug flight and motion (Oct 20 2026, docs/island-jobs.md §15 "Bug flight"): pure per-bug simulation for lib/graphics/bugSwarm.ts,
 * no three.js, no allocation per step. Every bug is velocity-integrated with eased steering (no snapping or teleport): it wanders
 * on curved paths round its BUG_HOMES spot, and each movement style (BugMove in bugSpecies.ts) has its own profile:
 *  - butterflies: slow big flaps with glides and a gentle bob, land on flowers and open / close their wings;
 *  - moths: quicker, wobbly flutter; bees: a fast buzz, hovering at flowers then bumbling on; dragonflies: stiff hovers then
 *    sudden darts; damselflies: slow hovers, wings folded up when perched; fireflies: slow drifting with a pulsing lantern;
 *  - beetles: trundle on six walking legs and now and then a clumsy flight (cases up, wings out); tiger beetles dash and stop;
 *    grasshoppers / crickets walk and spring in hop arcs; cicadas sit then buzz to the next spot; ants march; caterpillars inch;
 *    stick insects sway; the mantis stalks and turns its head; the jumping spider waits then jumps.
 * Body yaw follows the velocity (eased), pitch follows climbing (or the slope underfoot) and the body rolls into turns.
 * Animal Crossing manners: a running player is noticed within the species' `alert` metres and the bug drifts / flees away from
 * them (fliers take off, crawlers scurry); walking slowly shrinks that to alert × sneak × 0.7, standing still to × 0.35, so common
 * bugs (sneak 0) let you walk right up and rare ones are skittish. After fleeing it eases back home.
 */
import type {BugMove} from '../town/jobs/bugSpecies';

export type FlightProfile={
 /** Lives in the air (lands only to perch) or on the ground (walks; may fly / hop now and then). */
 air:boolean;flies:boolean;
 /** Cruise speed (m/s, game scale), steering ease (1/s), walking speed. */
 speed:number;accel:number;walk:number;
 /** Flight height above the ground (m). */
 lo:number;hi:number;
 /** Wings in flight: flaps per second, amplitude and mid angle (rad); at rest: mid angle, amplitude, rate. */
 hz:number;amp:number;base:number;restBase:number;restAmp:number;restHz:number;
 /** Share of flight spent gliding (wings held, butterflies); sideways weave (m/s); hover holds at targets (bees, dragonflies). */
 glide:number;weave:number;hover:boolean;
 /** Seconds flying / walking before landing or pausing, and resting. */
 busy:readonly [number,number];rest:readonly [number,number];
 /** Ground bugs: the share of rests that end in a flight, a hop, or a dash instead of a walk. */
 flyChance:number;hop:number;dash:boolean;
 /** Leg cycle rate while walking (rad/s) and stride. */
 legHz:number;stride:number;
 /** Body sway at rest (stick insect, mantis head-scan) in rad. */
 sway:number;
};
const P=(o:Partial<FlightProfile>):FlightProfile=>({air:true,flies:true,speed:1.5,accel:2,walk:.3,lo:.6,hi:2,hz:3,amp:.9,base:.3,restBase:0,restAmp:0,restHz:.3,
 glide:0,weave:.4,hover:false,busy:[5,9],rest:[3,6],flyChance:0,hop:0,dash:false,legHz:9,stride:.04,sway:0,...o});
export const FLIGHT_PROFILES:Record<BugMove,FlightProfile>={
 'butterfly-glide':P({speed:1.6,accel:1.5,lo:.9,hi:2.8,hz:2.4,amp:.95,base:.4,restBase:1.25,restAmp:.3,restHz:.35,glide:.35,weave:.7,busy:[6,11],rest:[3,6]}),
 'moth-flutter':P({speed:1.3,accel:2.6,lo:.6,hi:2.2,hz:5.5,amp:.8,base:.25,restBase:.05,restAmp:.04,restHz:.5,weave:1.5,busy:[6,10],rest:[3,6]}),
 'bee-hover':P({speed:2.1,accel:3.2,lo:.35,hi:1.4,hz:26,amp:.55,base:.2,restBase:-.05,weave:.6,hover:true,busy:[5,8],rest:[2,4]}),
 'dragonfly-dart':P({speed:5.2,accel:5.5,lo:.7,hi:1.9,hz:17,amp:.28,base:.04,restBase:.02,restAmp:.02,restHz:.4,weave:.15,hover:true,busy:[6,10],rest:[2.5,5]}),
 'damsel-hover':P({speed:1.4,accel:2.4,lo:.35,hi:1.2,hz:12,amp:.5,base:.25,restBase:1.4,restAmp:.04,weave:.3,hover:true,busy:[5,8],rest:[3,6]}),
 'firefly-drift':P({speed:.75,accel:.9,lo:.5,hi:2.4,hz:9,amp:.45,base:.25,weave:.8,busy:[1e9,1e9],rest:[0,0]}),
 'beetle-trundle':P({air:false,speed:1.8,accel:2.2,walk:.32,lo:.6,hi:1.6,hz:13,amp:.55,base:.2,busy:[3,6],rest:[2,5],flyChance:.25,legHz:10,stride:.05}),
 'ground-dash':P({air:false,speed:2.2,accel:3,walk:2.1,lo:.4,hi:1,hz:15,amp:.5,base:.2,busy:[.5,1.4],rest:[1,2.6],flyChance:.12,dash:true,legHz:28,stride:.06}),
 'hop-arc':P({air:false,speed:1.6,accel:3,walk:.22,lo:.3,hi:.8,hz:13,amp:.5,base:.2,busy:[1.5,3],rest:[1,3],hop:.65,legHz:8,stride:.04}),
 'cicada-hop':P({air:false,speed:2.4,accel:3,walk:.12,lo:.6,hi:1.5,hz:18,amp:.45,base:.2,busy:[1,2],rest:[4,8],flyChance:.7,legHz:6,stride:.03}),
 'ant-march':P({air:false,flies:false,walk:.5,busy:[3,7],rest:[.4,1.2],legHz:16,stride:.05}),
 'inchworm-crawl':P({air:false,flies:false,walk:.14,busy:[4,8],rest:[1,3],legHz:5,stride:.6}),
 'still-sway':P({air:false,flies:false,walk:.09,busy:[1,2.5],rest:[5,9],legHz:3,stride:.04,sway:.12}),
 'mantis-stalk':P({air:false,flies:false,walk:.16,busy:[1.5,3],rest:[3,6],legHz:4,stride:.05,sway:.35}),
 'spider-jump':P({air:false,flies:false,walk:.25,busy:[.8,1.6],rest:[1.5,4],hop:.7,legHz:14,stride:.04}),
};

export const enum Mode{Fly=0,Hover=1,Perch=2,Walk=3,Idle=4,Hop=5,Hidden=6}
/** Speeds (m/s) that read as running / moving (the island walk tops out at 3.7 m/s; STICK_WALK_FLOOR walking is ~1.3 m/s). */
export const PLAYER_RUN=2.4,PLAYER_STILL=.35;
/** Hard top speed for any bug (m/s): with dt ≤ 0.25 s a step can never jump more than this × dt (the no-teleport guarantee). */
export const BUG_MAX_SPEED=7;
/** Seconds after a catch before a new bug of that species turns up at its home. */
export const BUG_RESPAWN_S=45;

export type FlightBug={
 id:string;prof:FlightProfile;hx:number;hz:number;wander:number;alert:number;sneak:number;
 x:number;y:number;z:number;vx:number;vy:number;vz:number;tx:number;ty:number;tz:number;g:number;
 yaw:number;pitch:number;roll:number;mode:Mode;timer:number;fleeT:number;seed:number;
 /** Wing / leg state for the shader (eased so a change never snaps): flap phase, rate, amplitude, mid angle, case opening. */
 flap:number;fhz:number;famp:number;fbase:number;open:number;leg:number;legAmp:number;legHz:number;
 /** Hop arc (start, length, time). */
 h0x:number;h0z:number;h0y:number;hT:number;hD:number;
 gliding:number;clock:number;fade:number;respawn:number;landing:boolean;hoverT:number;ftx:number;ftz:number;
};
export type Floor=(x:number,z:number)=>number;

/** Seeded random in [0, 1) stored on the bug (mulberry32 step). */
export function rand(b:FlightBug){b.seed=(b.seed+0x6d2b79f5)>>>0;let t=b.seed;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}
const range=(b:FlightBug,r:readonly [number,number])=>r[0]+(r[1]-r[0])*rand(b);
const ease=(k:number,dt:number)=>1-Math.exp(-k*dt);
function angleTo(a:number,b:number){let d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d;}

export function createFlightBug(o:{id:string;move:BugMove;x:number;z:number;wander:number;alert:number;sneak:number;seed:number},floor:Floor):FlightBug{
 const prof=FLIGHT_PROFILES[o.move],g=floor(o.x,o.z);
 const b:FlightBug={id:o.id,prof,hx:o.x,hz:o.z,wander:Math.max(1.5,o.wander),alert:o.alert,sneak:o.sneak,x:o.x,y:g,z:o.z,vx:0,vy:0,vz:0,tx:o.x,ty:g,tz:o.z,g,
  yaw:0,pitch:0,roll:0,mode:prof.air?Mode.Fly:Mode.Idle,timer:0,fleeT:0,seed:o.seed>>>0,flap:0,fhz:prof.hz,famp:0,fbase:prof.restBase,open:0,leg:0,legAmp:0,legHz:prof.legHz,
  h0x:0,h0z:0,h0y:0,hT:0,hD:1,gliding:0,clock:0,fade:1,respawn:0,landing:false,hoverT:0,ftx:0,ftz:0};
 placeHome(b,floor);return b;
}
/** (Re)start at a random spot near home, settled (perched / idle, or drifting for fireflies). */
export function placeHome(b:FlightBug,floor:Floor){
 const a=rand(b)*Math.PI*2,r=b.wander*.6*Math.sqrt(rand(b));b.x=b.hx+Math.cos(a)*r;b.z=b.hz+Math.sin(a)*r;b.g=floor(b.x,b.z);
 b.vx=b.vy=b.vz=0;b.yaw=rand(b)*Math.PI*2;b.pitch=b.roll=0;b.fleeT=0;b.landing=false;
 if(b.prof.air&&b.prof.rest[1]===0){b.mode=Mode.Fly;b.y=b.g+(b.prof.lo+b.prof.hi)/2;b.timer=1e9;pickTarget(b,floor);}
 else if(b.prof.air){b.mode=Mode.Perch;b.y=b.g+perchY(b);b.timer=range(b,b.prof.rest)*rand(b);b.tx=b.x;b.ty=b.y;b.tz=b.z;}
 else{b.mode=Mode.Idle;b.y=b.g;b.timer=range(b,b.prof.rest)*rand(b);b.tx=b.x;b.ty=b.y;b.tz=b.z;}
}
/** Perched height above the ground: on a flower head or a grass tip. */
const perchY=(b:FlightBug)=>.18+(b.seed%7)*.03;
const leash=(b:FlightBug)=>b.wander+(b.prof.air||b.prof.flies?4:1.5);
/** Keep a point within the bug's leash of home. */
function clampHome(b:FlightBug){const dx=b.tx-b.hx,dz=b.tz-b.hz,d=Math.hypot(dx,dz),L=leash(b);if(d>L){b.tx=b.hx+dx/d*L;b.tz=b.hz+dz/d*L;}}
function pickTarget(b:FlightBug,floor:Floor,far=1){
 // Prefer a point ahead-ish of the current heading so paths curve instead of zig-zagging.
 for(let k=0;k<3;k++){const a=b.yaw+(rand(b)-.5)*Math.PI*1.4,r=(.6+rand(b)*1.6)*far;b.tx=b.x+Math.sin(a)*r*b.wander*.5;b.tz=b.z+Math.cos(a)*r*b.wander*.5;
  if(Math.hypot(b.tx-b.hx,b.tz-b.hz)<=b.wander)break;
  if(k===2){const a2=rand(b)*Math.PI*2,r2=b.wander*Math.sqrt(rand(b));b.tx=b.hx+Math.cos(a2)*r2;b.tz=b.hz+Math.sin(a2)*r2;}}
 clampHome(b);b.ty=floor(b.tx,b.tz)+b.prof.lo+(b.prof.hi-b.prof.lo)*rand(b);
}

/** How far (m) this bug notices the player at their current speed (Animal Crossing sneaking). */
export function noticeRadius(alert:number,sneak:number,playerSpeed:number){
 // A rider (scooter / bike / moped on a Bug squad shift) is noticed a little earlier the faster they go (≤ 1.6 × at 10 m/s).
 return playerSpeed>PLAYER_RUN?alert*Math.min(1.6,1+Math.max(0,playerSpeed-5)*.12):playerSpeed>PLAYER_STILL?alert*sneak*.7:alert*sneak*.35;
}
const TURNS=[0,1.2,-1.2] as const;
/** Scare a bug away from (fx, fz): fliers take off up and away, crawlers scurry, hoppers spring. Smooth: it only sets targets. */
export function startle(b:FlightBug,fx:number,fz:number,floor:Floor){
 if(b.mode===Mode.Hidden)return;
 let ax=b.x-fx,az=b.z-fz;const l=Math.hypot(ax,az)||1;ax/=l;az/=l;
 // Away, or 70° to either side if the leash would pull it back towards the player: keep the target farthest from them.
 const dist=b.alert+2.5;let bx=b.x,bz=b.z,best=-1;
 for(const turn of TURNS){const c=Math.cos(turn),s=Math.sin(turn);b.tx=b.x+(ax*c-az*s)*dist;b.tz=b.z+(ax*s+az*c)*dist;clampHome(b);
  const d=Math.hypot(b.tx-fx,b.tz-fz);if(d>best){best=d;bx=b.tx;bz=b.tz;}}
 b.tx=bx;b.tz=bz;b.fleeT=1.6+b.sneak*1.6;
 const g=floor(b.tx,b.tz);
 if(b.prof.air||b.prof.flies){b.mode=Mode.Fly;b.landing=false;b.ty=g+b.prof.hi+.6;b.timer=b.fleeT+1+rand(b)*2;}
 else if(b.prof.hop>0){b.ftx=b.tx;b.ftz=b.tz;startHop(b,floor,true);}
 else{b.mode=Mode.Walk;b.ty=g;b.timer=b.fleeT;}
}
function startHop(b:FlightBug,floor:Floor,flee=false){
 if(!flee){const a=b.yaw+(rand(b)-.5)*1.6,r=(.5+rand(b))*(b.prof.speed>1?1.6:.8);b.tx=b.x+Math.sin(a)*r;b.tz=b.z+Math.cos(a)*r;
  if(Math.hypot(b.tx-b.hx,b.tz-b.hz)>b.wander){b.tx=b.x+(b.hx-b.x)*.3;b.tz=b.z+(b.hz-b.z)*.3;}clampHome(b);}
 else{const dx=b.tx-b.x,dz=b.tz-b.z,d=Math.hypot(dx,dz)||1,r=Math.min(d,2.2);b.tx=b.x+dx/d*r;b.tz=b.z+dz/d*r;}
 b.mode=Mode.Hop;b.h0x=b.x;b.h0z=b.z;b.h0y=b.y;b.hT=0;b.hD=.3+Math.hypot(b.tx-b.x,b.tz-b.z)*.15;b.ty=floor(b.tx,b.tz);
 b.yaw+=angleTo(b.yaw,Math.atan2(b.tx-b.x,b.tz-b.z))*.8;
}

/** Steer the velocity towards the target (eased), with a sideways weave so paths curve; arrive slowly. */
function steer(b:FlightBug,dt:number,speed:number,arrive:number,threeD:boolean){
 const dx=b.tx-b.x,dy=threeD?b.ty-b.y:0,dz=b.tz-b.z,d=Math.hypot(dx,dy,dz)||1e-6,want=speed*Math.min(1,d/arrive);
 const w=b.prof.weave*Math.sin(b.clock*1.3+(b.seed&255)*.1);
 let ux=dx/d*want+(-dz/d)*w,uy=dy/d*want,uz=dz/d*want+(dx/d)*w;
 if(threeD)uy+=Math.sin(b.clock*2.1+(b.seed&63))*b.prof.weave*.25;
 const k=ease(b.prof.accel,dt);b.vx+=(ux-b.vx)*k;b.vz+=(uz-b.vz)*k;b.vy+=(uy-b.vy)*k;
 const s=Math.hypot(b.vx,b.vy,b.vz);if(s>BUG_MAX_SPEED){const f=BUG_MAX_SPEED/s;b.vx*=f;b.vy*=f;b.vz*=f;}
 return d;
}

export type StepCtx={px:number;pz:number;pspeed:number;floor:Floor};
/** Advance one bug by dt (≤ 0.25 s). Returns true when it noticed the player this step (it is now fleeing). */
export function stepBug(b:FlightBug,dt:number,c:StepCtx):boolean{
 if(dt<=0)return false;
 if(b.mode===Mode.Hidden){b.respawn-=dt;if(b.respawn<=0){placeHome(b,c.floor);b.fade=0;}return false;}
 b.clock+=dt;b.fade=Math.min(1,b.fade+dt*1.5);
 const p=b.prof;let noticed=false;
 if(b.fleeT>0)b.fleeT-=dt;
 else{const d=Math.hypot(c.px-b.x,c.pz-b.z);if(d<noticeRadius(b.alert,b.sneak,c.pspeed)){startle(b,c.px,c.pz,c.floor);noticed=true;}}
 const fleeing=b.fleeT>0,boost=fleeing?2.2:1;
 b.timer-=dt;
 let flying=false,walking=false;
 switch(b.mode){
  case Mode.Fly:{flying=true;
   const d=steer(b,dt,p.speed*boost*(fleeing?1:(p.hover?1:.85)),p.hover?1.4:.8,true);
   if(b.landing){if(Math.hypot(b.tx-b.x,b.tz-b.z)<.35&&b.y-b.g<.05){b.mode=Mode.Idle;b.landing=false;b.timer=range(b,p.rest);}}
   else{
    if(d<.45&&!fleeing){if(p.hover&&rand(b)<.7){b.mode=Mode.Hover;b.hoverT=1+rand(b)*1.6;}else pickTarget(b,c.floor);}
    if(b.timer<=0&&!fleeing){// time to land: a perch spot (fliers) or the ground (walkers that flew)
     pickTarget(b,c.floor,.6);
     if(p.air){b.ty=c.floor(b.tx,b.tz)+perchY(b);b.mode=Mode.Perch;b.timer=range(b,p.rest);}
     else{b.ty=c.floor(b.tx,b.tz);b.landing=true;}}}
   if(p.glide>0){if(b.gliding>0)b.gliding-=dt;else if(rand(b)<p.glide*dt*.6)b.gliding=.6+rand(b)*1.2;}
   break;}
  case Mode.Hover:{flying=true;// hold position (a tiny jitter), then dart / bumble on
   const k=ease(p.accel*1.4,dt);b.vx+=(Math.sin(b.clock*3.1)*.12-b.vx)*k;b.vz+=(Math.cos(b.clock*2.7)*.12-b.vz)*k;b.vy+=(Math.sin(b.clock*4.3)*.08-b.vy)*k;
   b.hoverT-=dt;if(b.hoverT<=0){if(b.timer<=0||rand(b)<.2){b.mode=Mode.Perch;pickTarget(b,c.floor,.4);b.ty=c.floor(b.tx,b.tz)+perchY(b);b.timer=range(b,p.rest);}else{b.mode=Mode.Fly;pickTarget(b,c.floor,1.3);}}
   break;}
  case Mode.Perch:{// fly in to the perch, settle, rest (wings slowly opening / closing), take off
   const d=Math.hypot(b.tx-b.x,b.ty-b.y,b.tz-b.z);
   if(d>.06){flying=true;steer(b,dt,p.speed*.7,1.2,true);}
   else{const k=ease(4,dt);b.vx-=b.vx*k;b.vy-=b.vy*k;b.vz-=b.vz*k;b.x+=(b.tx-b.x)*k;b.y+=(b.ty-b.y)*k;b.z+=(b.tz-b.z)*k;}
   if(b.timer<=0&&d<.3){b.mode=Mode.Fly;pickTarget(b,c.floor);b.timer=range(b,p.busy);}
   break;}
  case Mode.Walk:{walking=true;
   const sp=p.walk*(fleeing?3:1);steer(b,dt,sp,.25,false);b.vy=0;
   if(Math.hypot(b.tx-b.x,b.tz-b.z)<.15)pickWalkTarget(b);
   if(b.timer<=0&&!fleeing){b.mode=Mode.Idle;b.timer=range(b,p.rest);}
   break;}
  case Mode.Idle:{const k=ease(6,dt);b.vx-=b.vx*k;b.vz-=b.vz*k;b.vy=0;
   if(b.timer<=0){const r=rand(b);
    if(p.flies&&r<p.flyChance){b.mode=Mode.Fly;pickTarget(b,c.floor,1.4);b.timer=range(b,p.busy)+1;}
    else if(p.hop>0&&r<p.flyChance+p.hop)startHop(b,c.floor);
    else{b.mode=Mode.Walk;b.timer=range(b,p.busy);pickWalkTarget(b);}}
   break;}
  case Mode.Hop:{flying=true;b.hT+=dt;const k=Math.min(1,b.hT/b.hD),nx=b.h0x+(b.tx-b.h0x)*k,nz=b.h0z+(b.tz-b.h0z)*k;
   const g=c.floor(nx,nz),ground=b.h0y+(b.ty-b.h0y)*k,arc=Math.sin(k*Math.PI)*(.1+Math.hypot(b.tx-b.h0x,b.tz-b.h0z)*.25),ny=Math.max(g,ground+arc);
   const idt=1/dt;b.vx=(nx-b.x)*idt;b.vy=(ny-b.y)*idt;b.vz=(nz-b.z)*idt;
   if(k>=1){b.mode=Mode.Idle;b.timer=range(b,p.rest)*(b.fleeT>0?.3:1);if(b.fleeT>0&&Math.hypot(b.ftx-b.x,b.ftz-b.z)>.6){b.tx=b.ftx;b.tz=b.ftz;startHop(b,c.floor,true);}}
   break;}
 }
 // Integrate (hops set velocity from their arc so this lands exactly on it).
 b.x+=b.vx*dt;b.z+=b.vz*dt;b.g=c.floor(b.x,b.z);
 if(b.mode===Mode.Hop)b.y+=b.vy*dt;
 else if(flying||b.mode===Mode.Perch||b.mode===Mode.Hover||b.mode===Mode.Fly){b.y+=b.vy*dt;const min=b.g+(b.mode===Mode.Perch?.12:b.landing?0:.25);if(b.y<min){b.y+=(min-b.y)*ease(10,dt);if(b.vy<0)b.vy*=.5;}}
 else b.y=b.g;
 orient(b,dt,c.floor,walking);animate(b,dt,flying,walking,fleeing);
 return noticed;
}
function pickWalkTarget(b:FlightBug){
 const a=b.yaw+(rand(b)-.5)*2.2,r=.4+rand(b)*1.4;b.tx=b.x+Math.sin(a)*r;b.tz=b.z+Math.cos(a)*r;
 if(Math.hypot(b.tx-b.hx,b.tz-b.hz)>b.wander){b.tx=b.x+(b.hx-b.x)*.4;b.tz=b.z+(b.hz-b.z)*.4;}clampHome(b);
}
function orient(b:FlightBug,dt:number,floor:Floor,walking:boolean){
 const p=b.prof,h=Math.hypot(b.vx,b.vz);let yawRate=0;
 if(h>.05){const d=angleTo(b.yaw,Math.atan2(b.vx,b.vz)),k=ease(walking?5:p.speed>4?9:4,dt);b.yaw+=d*k;yawRate=d*k/dt;}
 else if(p.sway>0&&b.mode===Mode.Idle)b.yaw+=Math.sin(b.clock*.6+(b.seed&31))*p.sway*dt*.6;// the mantis turns its head to scan
 if(b.yaw>Math.PI)b.yaw-=Math.PI*2;else if(b.yaw<-Math.PI)b.yaw+=Math.PI*2;
 let pitch=0,roll=0;
 if(b.mode===Mode.Walk||b.mode===Mode.Idle){const s=Math.sin(b.yaw),c=Math.cos(b.yaw),ga=floor(b.x+s*.3,b.z+c*.3),gb=floor(b.x-s*.3,b.z-c*.3);pitch=-Math.atan2(ga-gb,.6);
  if(p.sway>0)roll=Math.sin(b.clock*1.1+(b.seed&15))*p.sway;}
 else{pitch=-Math.atan2(b.vy,Math.max(h,.3))*.7;roll=Math.max(-.6,Math.min(.6,-yawRate*h*.12));if(b.mode===Mode.Perch&&h<.1)pitch=0;}
 const k=ease(5,dt);b.pitch+=(pitch-b.pitch)*k;b.roll+=(roll-b.roll)*k;
}
function animate(b:FlightBug,dt:number,flying:boolean,walking:boolean,fleeing:boolean){
 const p=b.prof;let hz=p.restHz,amp=p.restAmp,base=p.restBase,open=0;
 if(flying&&b.mode!==Mode.Hop){hz=p.hz*(fleeing?1.25:1);amp=b.gliding>0?.06:p.amp;base=b.gliding>0?p.base*.6:p.base;open=1;}
 else if(b.mode===Mode.Hop&&p.flies){hz=p.hz;amp=p.amp*.8;base=p.base;open=.7;}
 if(p.air&&p.rest[1]===0)open=1;// fireflies always flying
 const k=ease(flying?8:3,dt);b.fhz+=(hz-b.fhz)*k;b.famp+=(amp-b.famp)*k;b.fbase+=(base-b.fbase)*k;b.open+=(open-b.open)*ease(open>b.open?7:2.5,dt);
 b.flap=(b.flap+dt*b.fhz*Math.PI*2)%(Math.PI*2000);
 const moving=walking&&Math.hypot(b.vx,b.vz)>.03;b.legAmp+=((moving?p.stride:0)-b.legAmp)*ease(6,dt);b.legHz=p.legHz*(fleeing?2:1);b.leg=(b.leg+dt*b.legHz)%(Math.PI*2000);
}
/** Catch: hide the bug (it turns up again at home after BUG_RESPAWN_S). */
export function hideBug(b:FlightBug,respawn=BUG_RESPAWN_S){b.mode=Mode.Hidden;b.respawn=respawn;b.vx=b.vy=b.vz=0;}
