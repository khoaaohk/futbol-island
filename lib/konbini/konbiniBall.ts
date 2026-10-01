import {SHOT_WINDUP,ISLAND_SHOT,juggleContact} from '../town/walkBall';
/**
 * The Konbini's two ball actions (user, Sep 30 2026: "in the Konbini, add two actions. One is to shoot the ball, and add another
 * action."), pure (no three.js) so tests/konbini.cjs can run them in Node. lib/konbini/konbiniScene.ts steps it only while the ball
 * is off the feet, so an idle store still sleeps.
 *
 * SHOOT: the island's press-and-hold charge (same 0.18 s dead zone + 1.8 s ramp as Town.tsx finishShotHold and the Arcade room)
 * and the walkBall wind-up. Since Oct 1 2026 (user: "kicking inside the store isn't the same as outside. It should be just as
 * fast, with the same bouncing-around physics") the flight IS the island's: walkBall's ISLAND_SHOT constants (38–60 m/s, lift,
 * gravity 13, wall restitution .78, floor bounce .53, drag .33/.1, ≤ 12 cm substeps, the same recall rule) integrated in the
 * same order as walkBall's 'shot' step, so a tap shot traces the island's path exactly (tests/konbini.cjs §13 runs both side by
 * side). Indoors it rebounds off the store's real collision boxes (walls, front glass, shelves, counter, fridge) and a ceiling
 * at INDOOR_SHOT.ceiling with the same wall restitution; the shelves only wobble (konbiniScene), nothing moves or breaks.
 * Bounded: ≤ INDOOR_SHOT.maxSteps substeps a frame, no allocation per frame, stepped only while the ball is off the feet, and
 * recalled after the island's tapAge / chargedAge at the latest. Nothing is charged, bought or saved.
 *
 * KEEP-UPS: tap to touch the ball back up. walkBall's own juggle is an automatic looping routine with no way to miss, so a
 * streak needs its own timing: each touch lifts the ball ~0.65 m above the foot contact (walkBall `juggleContact('foot')`, the
 * same point the island's juggle meets), and the next tap must come while it drops back through the touch window (below
 * KEEPUP.window, falling). Miss it and the ball drops and rolls back to your feet. Walking the ball into a shelf drops it too.
 */
export type BallBox={minX:number;maxX:number;minZ:number;maxZ:number;/** The fixture index (shelf / counter / fridge), −1 for walls. */fi:number};
export type BallPlayer={x:number;z:number;yaw:number};
export type BallMode='feet'|'charging'|'windup'|'shot'|'return'|'keepup'|'drop';
export type BallEvent={type:'strike';speed:number}|{type:'hit';fi:number;speed:number;x:number;y:number;z:number}|{type:'bounce';speed:number}|{type:'returned'}
 |{type:'touch';streak:number}|{type:'early'}|{type:'drop';streak:number;reason:'missed'|'shelf'|'stopped'};
/** The store's walls: the room shell and the front sill (the glass doors count as a wall for the ball). */
export const BALL_ROOM={minX:-7.7,maxX:7.7,minZ:-5.9,maxZ:5.55};
/** The island shot (walkBall ISLAND_SHOT) plus the indoor-only bounds: the ball's own radius, the ceiling (walls are 3.6 m) and a
 *  substep cap (a 60 m/s ball at the 0.05 s frame clamp needs 25). */
export const INDOOR_SHOT={...ISLAND_SHOT,radius:.19,ceiling:3.4,maxSteps:96,windup:SHOT_WINDUP} as const;
export const KEEPUP={gravity:7.5,contact:.48,rise:.65,window:1.05,floor:.19};
/** Hold → power, exactly the island's curve (Town.tsx finishShotHold / arcadeRoomScene endShot). */
export const holdPower=(heldMs:number)=>Math.max(0,Math.min(1,(heldMs-180)/1800));
/** The island's launch for a charge 0..1 (walkBall 'windup' → 'shot'): 38 m/s and a 3.2 m/s hop for a tap, 60 m/s and 55 m/s up at full. */
export function indoorLaunch(charge:number){const c=Math.max(0,Math.min(1,charge));return {speed:ISLAND_SHOT.speed+ISLAND_SHOT.chargeSpeed*c,lift:ISLAND_SHOT.lift+ISLAND_SHOT.chargeLift*c};}
const touchSpeed=()=>Math.sqrt(2*KEEPUP.gravity*KEEPUP.rise);

export function createKonbiniBall(boxes:readonly BallBox[],emit:(e:BallEvent)=>void=()=>{}){
 const s={mode:'feet' as BallMode,x:0,y:.19,z:0,vx:0,vy:0,vz:0,age:0,charge:0,kick:0,yaw:0,streak:0,side:1 as 1|-1,sinceTouch:0,hits:0,shots:0};
 let hitCooldown=0;
 const r=INDOOR_SHOT.radius,WALL:BallBox={minX:0,maxX:0,minZ:0,maxZ:0,fi:-1};
 /** The box (or wall, fi −1) a ball centred at x,z would touch, else null. */
 function blockedAt(x:number,z:number):BallBox|null{
  if(x<BALL_ROOM.minX+r||x>BALL_ROOM.maxX-r||z<BALL_ROOM.minZ+r||z>BALL_ROOM.maxZ-r)return WALL;
  for(const o of boxes)if(x>o.minX-r&&x<o.maxX+r&&z>o.minZ-r&&z<o.maxZ+r)return o;return null;}
 /** The dribble point ahead of the feet, pulled in when a shelf is right there (the ball never starts inside a box). */
 const feetPoint=(p:BallPlayer,lead=.56)=>{for(let d=lead;d>0;d-=.08){const x=p.x+Math.sin(p.yaw)*d,z=p.z+Math.cos(p.yaw)*d;if(!blockedAt(x,z))return {x,z};}return {x:p.x,z:p.z};};
 function footContact(p:BallPlayer){const c=juggleContact('foot',s.side);return {x:p.x+Math.cos(p.yaw)*c.x+Math.sin(p.yaw)*c.z,z:p.z-Math.sin(p.yaw)*c.x+Math.cos(p.yaw)*c.z};}
 function toFeet(){s.mode='feet';s.vx=s.vy=s.vz=0;s.age=0;s.kick=0;s.charge=0;}
 function recall(){if(s.mode==='shot'||s.mode==='drop'){s.mode='return';s.age=0;}}
 function drop(reason:'missed'|'shelf'|'stopped'){const n=s.streak;s.mode='drop';s.age=0;s.vx*=.3;s.vz*=.3;s.streak=0;emit({type:'drop',streak:n,reason});}
 /**
  * Physics step shared by the shot and a dropped keep-up: walkBall's 'shot' step line for line (substeps ≤ ISLAND_SHOT.substep,
  * x then z axis-separated rebounds × wallBounce, gravity, a floor bounce × floorBounce above bounceMinVy, then the frame's drag),
  * against the store's boxes instead of the island's buildings, plus the ceiling. Returns true once it is at rest (the island's rule).
  */
 function roll(dt:number){
  const S=INDOOR_SHOT,steps=Math.min(S.maxSteps,Math.max(1,Math.ceil(Math.hypot(s.vx,s.vz)*dt/S.substep))),h=dt/steps;
  for(let i=0;i<steps;i++){
   const nx=s.x+s.vx*h,bx=blockedAt(nx,s.z);if(bx){hit(bx,Math.abs(s.vx));s.vx*=-S.wallBounce;}else s.x=nx;
   const nz=s.z+s.vz*h,bz=blockedAt(s.x,nz);if(bz){hit(bz,Math.abs(s.vz));s.vz*=-S.wallBounce;}else s.z=nz;
   s.vy-=S.gravity*h;s.y+=s.vy*h;
   if(s.y>S.ceiling-r){s.y=S.ceiling-r;if(s.vy>0){bounce(s.vy);s.vy=-s.vy*S.wallBounce;}}
   if(s.y<r){s.y=r;if(s.vy<-S.bounceMinVy){bounce(-s.vy);s.vy=-s.vy*S.floorBounce;}else s.vy=0;}
  }
  const drag=Math.exp(-(s.charge>0&&s.y>r+S.loftHeight?S.loftDrag:S.rollDrag)*dt);s.vx*=drag;s.vz*=drag;
  return Math.hypot(s.vx,s.vz)<S.restSpeed&&s.y<=r+S.restHeight;
 }
 function hit(b:BallBox,speed:number){if(hitCooldown>0||speed<.25)return;hitCooldown=.09;s.hits++;emit({type:'hit',fi:b.fi,speed,x:s.x,y:s.y,z:s.z});}
 /** A floor or ceiling bounce (the island's `impact` on landing): sound only, rate-limited like the wall hits. */
 function bounce(speed:number){if(hitCooldown>0||speed<1.2)return;hitCooldown=.09;emit({type:'bounce',speed});}
 return {
  state:s,blockedAt,
  /** Press: start charging (only from the feet; a ball in flight ignores it). */
  beginCharge(p:BallPlayer){if(s.mode!=='feet')return false;s.mode='charging';s.age=0;s.charge=0;s.yaw=p.yaw;const f=feetPoint(p,INDOOR_SHOT.lead);s.x=f.x;s.z=f.z;s.y=r;return true;},
  /** Release: the capped power from the island's hold curve; a tap (under 0.18 s) is a soft pass. */
  release(p:BallPlayer,heldMs:number){if(s.mode!=='charging'&&s.mode!=='feet')return false;s.charge=holdPower(heldMs);s.mode='windup';s.age=0;s.yaw=p.yaw;const f=feetPoint(p,INDOOR_SHOT.lead);s.x=f.x;s.z=f.z;s.y=r;return true;},
  cancelCharge(){if(s.mode==='charging')toFeet();},
  /** Keep-ups: tap to touch. From the feet it starts a streak; in the air it counts if the ball is dropping through the window. */
  tap(p:BallPlayer){
   if(s.mode==='feet'){const c=footContact(p);if(blockedAt(c.x,c.z))return false;s.mode='keepup';s.streak=1;s.side=1;s.x=c.x;s.z=c.z;s.y=KEEPUP.contact;s.vy=touchSpeed();s.sinceTouch=0;emit({type:'touch',streak:1});return true;}
   if(s.mode!=='keepup')return false;
   if(s.vy<0&&s.y<=KEEPUP.window){s.streak++;s.side=s.side===1?-1:1;s.vy=touchSpeed()*(s.y<KEEPUP.contact?1+(KEEPUP.contact-s.y)*.4:1);s.sinceTouch=0;emit({type:'touch',streak:s.streak});return true;}
   emit({type:'early'});return false;},
  /** Stop keep-ups on purpose (walking out, zoom, dialog): the ball simply comes back to the feet, the streak still counts. */
  settle(p:BallPlayer){if(s.mode==='keepup'){const n=s.streak;s.streak=0;emit({type:'drop',streak:n,reason:'stopped'});}if(s.mode==='charging'||s.mode==='windup'||s.mode==='keepup'){toFeet();const f=feetPoint(p);s.x=f.x;s.z=f.z;s.y=r;}else recall();},
  update(dt:number,p:BallPlayer){
   s.age+=dt;hitCooldown=Math.max(0,hitCooldown-dt);
   switch(s.mode){
    case 'feet':return;
    case 'charging':{s.charge=Math.max(0,Math.min(1,(s.age-.18)/1.8));s.yaw=p.yaw;s.kick=0;const f=feetPoint(p,INDOOR_SHOT.lead),k=1-Math.exp(-dt*18);s.x+=(f.x-s.x)*k;s.z+=(f.z-s.z)*k;s.y=r;return;}// the ball stays at the feet while you wind up
    case 'windup':{s.kick=Math.min(.36,s.age/INDOOR_SHOT.windup*.36);if(s.age<INDOOR_SHOT.windup)return;
     // Like walkBall, the strike frame already flies: the launch falls through into this frame's shot step (age = dt).
     const l=indoorLaunch(s.charge);s.mode='shot';s.age=dt;s.vx=Math.sin(s.yaw)*l.speed;s.vz=Math.cos(s.yaw)*l.speed;s.vy=l.lift;s.shots++;emit({type:'strike',speed:l.speed});}
    // falls through
    case 'shot':{s.kick=s.age<.6?.36+s.age/.6*.64:0;const rest=roll(dt);if(rest||s.age>(s.charge>0?INDOOR_SHOT.chargedAge:INDOOR_SHOT.tapAge))recall();return;}
    case 'drop':{s.kick=0;const rest=roll(dt);if(rest||s.age>1.2)recall();return;}
    case 'return':{// The island's recall (walkBall 'return'): a returnRate/s blend to the feet for returnTime s.
     const f=feetPoint(p),b=1-Math.exp(-dt*INDOOR_SHOT.returnRate);s.x+=(f.x-s.x)*b;s.z+=(f.z-s.z)*b;s.y+=(r-s.y)*b;s.kick=0;if(s.age>INDOOR_SHOT.returnTime){toFeet();s.x=f.x;s.z=f.z;s.y=r;emit({type:'returned'});}return;}
    case 'keepup':{
     s.sinceTouch+=dt;const c=footContact(p);
     // The ball stays in the aisle: a touch point inside a shelf (walking into it) drops the ball.
     if(blockedAt(c.x,c.z)){s.vx=Math.sin(p.yaw)*-.6;s.vz=Math.cos(p.yaw)*-.6;drop('shelf');return;}
     const k=1-Math.exp(-dt*20);s.x+=(c.x-s.x)*k;s.z+=(c.z-s.z)*k;s.vy-=KEEPUP.gravity*dt;s.y+=s.vy*dt;
     if(s.y<=KEEPUP.floor){s.y=KEEPUP.floor;s.vy=-s.vy*.35;s.vx=Math.sin(p.yaw)*.5;s.vz=Math.cos(p.yaw)*.5;drop('missed');}return;}
   }
  },
  /** 0..1 through the current keep-up flight, for the rig's juggle pose (touch at 0). */
  jugglePhase(){return s.mode==='keepup'?Math.min(1,s.sinceTouch/(2*touchSpeed()/KEEPUP.gravity)):0;},
  get moving(){return s.mode!=='feet';},
 };
}
export type KonbiniBall=ReturnType<typeof createKonbiniBall>;

// ---- Per-player record (localStorage, versioned) -------------------------------------------------------------------------------
export const BALL_RECORD_KEY='fi2-konbini-ball-v1';
export type BallRecord={v:1;best:number;shotTip:boolean};
type Store={getItem(k:string):string|null;setItem(k:string,v:string):void};
const store=():Store|null=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}};
export function readBallRecord(st:Store|null=store()):BallRecord{
 try{const raw=st?.getItem(BALL_RECORD_KEY);if(raw){const r=JSON.parse(raw);if(r&&r.v===1)return {v:1,best:Math.max(0,Math.floor(Number(r.best)||0)),shotTip:r.shotTip===true};}}catch{/* corrupt → fresh */}
 return {v:1,best:0,shotTip:false};}
function write(r:BallRecord,st:Store|null){try{st?.setItem(BALL_RECORD_KEY,JSON.stringify(r));}catch{/* private mode: the session still works */}}
/** A finished streak: saves it when it beats the best. */
export function recordStreak(n:number,st:Store|null=store()){const r=readBallRecord(st),newBest=n>r.best;if(newBest)write({...r,best:n},st);return {best:Math.max(r.best,n),newBest};}
/** The first-shot coaching tip shows once per player. Returns true the first time. */
export function takeShotTip(st:Store|null=store()){const r=readBallRecord(st);if(r.shotTip)return false;write({...r,shotTip:true},st);return true;}

// ---- Teaching content ------------------------------------------------------------------------------------------------------------
/**
 * Verified coaching points (Sep 30 2026):
 * - The FA, England Football Learning, "Different passing techniques in football" (2023): the inside of the foot is the technique
 *   players master first and "a great way to pass the ball accurately"; lock (tighten) the ankle for a good connection; for a
 *   powerful pass, strike through the middle of the ball with the laces or instep.
 *   https://learn.englandfootball.com/articles-and-resources/coaching/resources/2023/Different-passing-techniques-in-football
 * - The FA, "Different finishing techniques in football" (2022): laces finishes strike with the top of the foot for power.
 *   https://learn.englandfootball.com/articles-and-resources/coaching/resources/2022/Different-finishing-techniques-in-football
 * - FIFA Training Centre, Beach soccer block 1 "Passing" (already cited on the island).
 *   https://www.fifatrainingcentre.com/en/practice/beach-soccer/block-1/passing.php
 * - Keep-ups: FIFA Training Centre "Ages 4-8: Coaching children to master ball control" and The FA "Pro Secrets: 5 steps to
 *   master ball control" (juggling with feet, then thighs and head, builds touch and coordination); the laces contact is the FA
 *   finishing article's "top of the foot".
 *   https://www.fifatrainingcentre.com/en/practice/grassroots/grassroots-and-youth-football-essentials/grassroots-coaching-essentials/coaching-children-to-master-ball-control.php
 *   https://pledge.thefa.com/pro-secrets-5-steps-to-master-ball-control-now
 */
export const BALL_SOURCES=[
 {title:'The FA: Different passing techniques in football',url:'https://learn.englandfootball.com/articles-and-resources/coaching/resources/2023/Different-passing-techniques-in-football'},
 {title:'The FA: Different finishing techniques in football',url:'https://learn.englandfootball.com/articles-and-resources/coaching/resources/2022/Different-finishing-techniques-in-football'},
 {title:'FIFA Training Centre: Coaching children to master ball control',url:'https://www.fifatrainingcentre.com/en/practice/grassroots/grassroots-and-youth-football-essentials/grassroots-coaching-essentials/coaching-children-to-master-ball-control.php'},
];
export const SHOT_TIP='Strike through the middle of the ball to keep it low. For accuracy, pass with the inside of your foot and lock your ankle.';
export const KEEPUP_TIPS:readonly {at:number;text:string}[]=[
 {at:5,text:'5 in a row! Lock your ankle and use your laces: soft little touches.'},
 {at:10,text:'10! Keep your eyes on the ball and each touch about knee high.'},
 {at:20,text:'20! Next, try a thigh touch in between: feet, thighs, then head.'},
];
export const keepUpTip=(streak:number)=>KEEPUP_TIPS.find(t=>t.at===streak)?.text??null;
/** The cashier's once-per-visit reaction to a shot (Sharks Beach is the island's beach pitch). */
export const cashierShotLine=(shop:'main'|'cay')=>shop==='cay'?'Nice touch! Keep it soft in here, the big shots are for the beach court 😉':'Nice touch! Save the power shots for Sharks Beach 😉';
