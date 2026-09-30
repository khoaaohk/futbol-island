// Event → action layer for live matches (docs/pass-puzzle/CONTRACT.md, lane B).
// The sim reports touches (MatchSim.touches ring); this turns each one into a per-player
// one-shot `reaction` + `reactionProgress` and a squash-spring impulse (`squash` +
// `squashSerial`), and marks the called receiver (`called`) and his marker (`ready`).
// Pure bookkeeping: no loops of its own, no allocation per frame, no three.js.
// Teaching purpose: a child sees HOW the ball was controlled (chest, thigh, header), that a
// heavy touch costs balance, that a defender reading the lane slides or blocks, and that a
// receiver asks for the ball while the nearest defender gets set to react.
// Lane B (docs/bean-characters/CONTRACT.md) adds the keeper DIVE and the jumping HEADER: both are read
// ahead from the sim (a shot about to beat the keeper's reach, a cross dropping onto a head) so the take-off
// comes before the contact, exactly as a coach teaches it: set early, meet the ball at the top.
import type {PlayerMotion,DiveKind,SaveOutcome,SignatureMove} from '../../graphics/player';
import type {MatchSim,TouchEvent} from './matchSim';
import {shotHeightAt,shotProgress} from '../shotPlacement';

export type Reaction=NonNullable<PlayerMotion['reaction']>;

/** Kick wind-up in real seconds: a square-on strike takes .26 s, a full about-turn .56 s.
 * Same formula as the pass-puzzle engine (lib/passPuzzle); live play scales it by the game speed. */
export const windupSeconds=(turnRadians:number)=>.26+Math.min(Math.PI,Math.abs(turnRadians))/Math.PI*.3;
/** The share of a wind-up spent turning; the leg swing itself always takes the base .26 s. */
export const windupTurnShare=(turnRadians:number)=>1-.26/windupSeconds(turnRadians);

/** Real seconds each one-shot action lasts. */
export const REACTION_SECONDS:Record<Reaction,number>={chest:.72,thigh:.56,header:.6,stumble:.9,deflect:.55,slide:.95,dejected:2.4};
/** Real seconds of a full keeper dive (set → push-off → flight → land → up) and of a jump (load → peak → land). */
export const DIVE_SECONDS=1.6,JUMP_SECONDS=.95;
/** Progress at which the hands meet the ball / the head meets the ball (= DIVE_PHASE.contact, JUMP_PHASE.peak in player.ts). */
export const DIVE_CONTACT=.3,JUMP_PEAK=.47;
/** A save further than this (sim units) from the keeper is made at full stretch (= MatchSim diveAt). */
export const DIVE_MIN_GAP=3.5;
/** Hands meet the ball at this dive progress, per save type (= DIVE_KINDS[kind].contact in player.ts). */
export const DIVE_KIND_CONTACT:Record<DiveKind,number>={side:.3,collapse:.22,tip:.31,spring:.28,smother:.24,stand:.3};
/** Signature moves: ball contact progress and real seconds (= MOVE_PHASE in player.ts). */
export const MOVE_CONTACT:Record<SignatureMove,number>={bicycle:.36,scissor:.33,divingHeader:.3,volley:.42,backHeel:.45,soleRoll:.25,flickUp:.38};
export const MOVE_SECONDS:Record<SignatureMove,number>={bicycle:1.5,scissor:1.3,divingHeader:1.4,volley:.8,backHeel:.6,soleRoll:.8,flickUp:.7};
/** Which acrobatic finish meets a ball whose sim height at the contact is `h` (m; its centre is h + .19 above the feet),
 *  so the striking limb is where the ball is (tests/player-signature-moves.cjs checks it against the rig's contact):
 *  bicycle — boot ≈ 1.9 m, balls 1.45…1.95 with the back to goal; scissor — boot ≈ 1.45 m, balls .9…1.45 side-on;
 *  diving header — head ≈ .85 m, a low cross .4….9; volley — boot ≈ .12 + .71·height (≤ .83), dropping balls ≤ .9.
 *  null = leave it to the jumping header (a high ball side-on). */
export function acrobaticMove(h:number,back:number,header:boolean):{kind:SignatureMove;height:number}|null{
 if(h>=1.45)return back>.35&&h<=1.95?{kind:'bicycle',height:0}:null;
 if(h>=.9)return {kind:'scissor',height:0};
 if(h>=.4&&header)return {kind:'divingHeader',height:0};
 return {kind:'volley',height:clamp((h-.03)/.71,0,1)};
}
const hash=(a:string,b:number)=>{let h=b|0;for(let i=0;i<a.length;i++)h=Math.imul(h^a.charCodeAt(i),16777619);return (h>>>0)%1000;};
/** Header snap after the reaction starts (the 'header' pose peaks at ~46 % of its .6 s). */
const HEADER_SNAP=.28;
/** Ball height (m) at the touch that chooses the body part. */
export const TOUCH_HEIGHT={header:1.45,chest:.85,thigh:.4};

/** Body part for a controlled ball at this height; undefined = an ordinary foot touch. */
export function heightReaction(height:number):Reaction|undefined{
 return height>=TOUCH_HEIGHT.header?'header':height>=TOUCH_HEIGHT.chest?'chest':height>=TOUCH_HEIGHT.thigh?'thigh':undefined;
}

export type TouchAction={id:string;reaction?:Reaction;squash:number;delay:number};
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));

/** Pure mapping from one sim touch to the actions it causes (tested in tests/choreo.cjs).
 * `sim` supplies roles, positions and speeds at the moment the event is read. */
export function touchActions(ev:TouchEvent,sim:Pick<MatchSim,'players'|'ids'>,out:TouchAction[]=[]):TouchAction[]{
 out.length=0;
 const p=sim.players[ev.id];if(!p)return out;
 const pace=clamp(ev.speed/340,0,1),runner=Math.hypot(p.vx,p.vy);
 const push=(id:string,reaction:Reaction|undefined,squash:number,delay=0)=>{out.push({id,reaction,squash:clamp(squash,-3.5,4),delay});};
 switch(ev.kind){
  case 'receive':{
   // Keepers take it in the hands: a small catch squash, no outfield body part.
   if(p.isGK){push(ev.id,undefined,-1-pace);break;}
   const part=heightReaction(ev.height);
   // A header stretches up into the ball; every other control cushions down into it.
   push(ev.id,part,part==='header'?2.2+pace:-(1.1+pace*1.8+(ev.heavy?.8:0)));
   break;
  }
  case 'intercept':{
   const part=heightReaction(ev.height);
   // Reading the lane: a pacey ball is blocked (deflect), a runner lunges in with a slide.
   const reaction=part??(ev.speed>=240?'deflect':runner>=40?'slide':undefined);
   push(ev.id,reaction,reaction==='header'?2.4:-(1.6+pace*1.4));
   break;
  }
  case 'tackle':{
   push(ev.id,p.isGK||runner>=25?'slide':undefined,-1.8);
   if(ev.other&&sim.players[ev.other])push(ev.other,'stumble',-2.6);
   break;
  }
  case 'heavy':push(ev.id,'stumble',-2.8);break;
  case 'parry':push(ev.id,'deflect',2);break;
  case 'kick':push(ev.id,undefined,1.4+clamp(ev.speed/460,0,1)*2.4);break;
  case 'goal':{
   // Everyone on the conceding side drops their shoulders, staggered so it isn't a drill.
   let k=0;for(const id of sim.ids){const q=sim.players[id];if(q.team!==ev.team)push(id,'dejected',-1.2,.1+(k++%4)*.12);}
   break;
  }
 }
 return out;
}

type Dive={start:number;dir:-1|1;height:number;facing:number;kind:DiveKind;motion:{progress:number;dir:-1|1;height:number;kind:DiveKind;outcome:SaveOutcome}};
type Move={start:number;kind:SignatureMove;facing?:number;motion:{kind:SignatureMove;progress:number;side:-1|1;height:number}};
type Jump={start:number;motion:{progress:number;height:number}};
type State={reaction?:Reaction;start:number;dur:number;squash:number;serial:number;pending:number;pendingAt:number;touchHeight:number;touchAt:number;dive?:Dive;jump?:Jump;move?:Move;cool?:number};

/** One per live match. `consume` once per frame after the sim steps; `apply` per posed player.
 *  `yaw` is the venue's turn (a pitch whose long axis is not world z, e.g. the east–west beach court): every facing this
 *  layer computes in the pitch's own frame is turned by it before it reaches the rig. */
export function createChoreo(yaw=0){
 const states=new Map<string,State>(),actions:TouchAction[]=[];
 let clock=0,seen=0,caller:string|null=null,marker:string|null=null,callWeight=0,markerWeight=0;
 const state=(id:string)=>{let s=states.get(id);if(!s){s={start:0,dur:0,squash:0,serial:0,pending:0,pendingAt:-1,touchHeight:0,touchAt:-1};states.set(id,s);}return s;};
 const airborne=(a:{start:number}|undefined,dur:number)=>!!a&&clock-a.start<dur;
 function startDive(id:string,contactIn:number,dir:-1|1,height:number,facing:number,kind:DiveKind='side',outcome:SaveOutcome='catch'){
  const s=state(id),lead=DIVE_KIND_CONTACT[kind]*DIVE_SECONDS;facing+=yaw;
  // Still in the set (before the push-off): re-time and re-aim on the fresh read (the shot slows, the keeper moves).
  if(s.dive&&(clock-s.dive.start)/DIVE_SECONDS<.06){const m=s.dive.motion;s.dive.start=clock+contactIn-lead;s.dive.dir=m.dir=dir;s.dive.height=m.height=height;s.dive.facing=facing;s.dive.kind=m.kind=kind;m.outcome=outcome;return;}
  // A new shot (a rebound) may interrupt a dive once the keeper is getting up.
  if(airborne(s.dive,DIVE_SECONDS)&&(clock-s.dive!.start)/DIVE_SECONDS<.6)return;
  s.dive={start:clock+contactIn-lead,dir,height,facing,kind,motion:{progress:0,dir,height,kind,outcome}};
  if(s.reaction&&s.reaction!=='dejected')s.reaction=undefined;
 }
 function startMove(id:string,kind:SignatureMove,contactIn:number,side:-1|1,height:number,facing?:number){
  const s=state(id),start=clock+contactIn-MOVE_CONTACT[kind]*MOVE_SECONDS[kind];if(facing!==undefined)facing+=yaw;
  if(s.move&&s.move.kind===kind&&(clock-s.move.start)/MOVE_SECONDS[kind]<.08){s.move.start=start;s.move.facing=facing;s.move.motion.side=side;s.move.motion.height=height;return;}
  if(s.move&&clock-s.move.start<MOVE_SECONDS[s.move.kind])return;
  s.move={start,kind,facing,motion:{kind,progress:0,side,height}};
  if(s.reaction&&s.reaction!=='dejected')s.reaction=undefined;
 }
 function startJump(id:string,contactIn:number,ballHeight:number){
  const s=state(id);if(airborne(s.jump,JUMP_SECONDS))return;
  // Lift so the forehead (≈1.62 m standing; the ball centre sits .3 m above its sim height) meets it at the peak.
  s.jump={start:clock+contactIn-JUMP_PEAK*JUMP_SECONDS,motion:{progress:0,height:clamp(ballHeight+.3-1.62,.12,.5)}};
  s.reaction='header';s.start=clock+contactIn-HEADER_SNAP;s.dur=REACTION_SECONDS.header;
 }
 /** Reads the sim ahead of the contact: a shot the keeper can't shuffle to in time → dive toward it (the hands
  * arrive with the ball); a header cross dropping onto its target → the target and the nearest challenger jump. */
 function anticipate(sim:MatchSim){
  const rate=sim.windupScale;if(!(rate>0))return;
  const v=sim.venue,sx=v.width/250,sz=v.length/380,b=sim.ball;
  if(sim.shotActive&&Math.abs(b.vy)>1){
   let gk:string|null=null;for(const id of sim.ids){const q=sim.players[id];if(q.isGK&&q.team!==sim.possession){gk=id;break;}}
   const g=gk?sim.players[gk]:undefined;
   const cur=states.get(gk!)?.dive;
   if(g&&(!cur||!airborne(cur,DIVE_SECONDS)||(clock-cur.start)/DIVE_SECONDS<.08||(clock-cur.start)/DIVE_SECONDS>=.6)){
    // When does the shot enter the keeper's reach (he saves it there), relative to his own shuffle?
    const rx=b.x-g.x,ry=b.y-g.y,wx=b.vx-g.vx,wy=b.vy-g.vy,R=sim.saveReach,ww=wx*wx+wy*wy,rw=rx*wx+ry*wy,rr=rx*rx+ry*ry;
    const disc=rw*rw-ww*(rr-R*R);
    let tC=rr<=R*R?0:rw<0&&disc>=0&&ww>0?(-rw-Math.sqrt(disc))/ww:-1,reach=true;
    // …but never before the strike's keep-out has run out (the sim can't stop it earlier).
    if(tC>=0){tC=Math.max(tC,sim.flightHold);if((rx+wx*tC)**2+(ry+wy*tC)**2>R*R)tC=-1;}
    let ox=rx+wx*tC,oy=ry+wy*tC;
    // Out of reach altogether: he still throws himself at it where it crosses his line (and is beaten).
    if(tC<0){const tA=(g.y-b.y)/b.vy;tC=tA;ox=b.x+b.vx*tA-g.x;oy=0;reach=false;}
    const contactIn=tC/rate,dist=Math.hypot(ox,oy);
    const k=sim.lastKick,h=k.shotHeight>0?shotHeightAt(k,shotProgress(k,g.y),v.goalHeight):.3,top=v.goalHeight;
    // The save type follows the ball: at the body a standing catch; one-on-one a smother; a ground shot near him
    // a collapse; the top corner a diving tip; mid height within a few metres a spring save; else the full stretch.
    const oneOnOne=reach&&!!shotFrom&&Math.hypot(shotFrom.x-g.x,shotFrom.y-g.y)<34&&h<.9;
    const kind:DiveKind=oneOnOne?'smother':reach&&dist<DIVE_MIN_GAP?'stand':h<.5&&dist<10?'collapse':h>=.72*top?'tip':h>=.6&&h<=1.5&&dist<8?'spring':'side';
    if(tC>=0&&contactIn<=DIVE_KIND_CONTACT[kind]*DIVE_SECONDS&&(kind==='stand'||kind==='smother'||dist>=DIVE_MIN_GAP)&&(reach||dist<2.2*R)){
     // Facing the shot (against the ball's travel): with f = (−vx·sx, −vy·sz) in world metres and the rig's
     // +x = (fz, −fx), the dive side is the sign of ox·sx·fz − oy·sz·fx. The hands follow the sim's outcome.
     const fx=-b.vx*sx,fz=-b.vy*sz,out=sim.saveOutcome,outcome:SaveOutcome=out==='goal'?'parry':out;
     startDive(gk!,contactIn,ox*sx*fz-oy*sz*fx>=0?1:-1,clamp(h/Math.max(.5,top-.45),0,1),Math.atan2(fx,fz),kind,outcome);
    }
   }
  }
  // A save made at full stretch without an early read (a shot struck inside the keeper's reaction time).
  const kd=sim.keeperDive;
  if(kd&&!airborne(states.get(kd.id)?.dive,DIVE_SECONDS)){
   const g=sim.players[kd.id];
   // Facing out of his goal (sim +y toward the centre spot): the dive side is the sign of dx × fy.
   if(g){const fy=Math.sign(200-g.y)||1;startDive(kd.id,0,(kd.x-g.x)*fy>=0?1:-1,.4,Math.atan2(0,fy));}
  }
  const a=sim.aerial,target=b.target?sim.players[b.target]:undefined,sp=Math.hypot(b.vx,b.vy);
  signatureMoves(sim,rate,sx,sz);
  const acroMove=b.target?states.get(b.target)?.move:undefined,finishing=!!acroMove&&acroMove.kind!=='soleRoll'&&acroMove.kind!=='flickUp'&&acroMove.kind!=='backHeel'&&airborne(acroMove,MOVE_SECONDS[acroMove.kind]);
  if(a&&a.header&&target&&!b.owner&&sp>1&&!finishing){
   const {tC,hC:h}=predictClaim(sim,target,sim.receptionRadius),contactIn=tC/rate;
   if(tC>=0&&contactIn<=JUMP_PEAK*JUMP_SECONDS){
    if(h>=TOUCH_HEIGHT.header&&h<=2.3){
     startJump(b.target!,contactIn,h);
     // Contested in the air: the nearest outfield opponent goes up with him.
     let best:string|null=null,bestD=10;
     for(const id of sim.ids){const q=sim.players[id];if(q.team===target.team||q.isGK)continue;const d=Math.hypot(q.x-target.x,q.y-target.y);if(d<bestD){bestD=d;best=id;}}
     if(best)startJump(best,contactIn,h-.1);
    }
   }
  }
 }
 let shotFrom:{x:number;y:number}|null=null,shotWas=false;
 const claim={tC:-1,hC:0};
 /** When (sim s) and how high the lofted ball becomes playable inside `t`'s control radius: air drag as in the sim
  *  (friction 2.2 × .35 while lofted), the strike keep-out, and the playable window (≤ 1.2 m, or a header ≤ 2.1 m
  *  after the peak). tC = −1 when it won't. */
 function predictClaim(sim:MatchSim,t:{x:number;y:number},R:number){
  const b=sim.ball,a=sim.aerial;claim.tC=-1;claim.hC=0;if(!a)return claim;
  for(let q=0;q<=1.6;q+=.01){const f=(1-Math.exp(-.77*q))/.77,bx=b.x+b.vx*f,by=b.y+b.vy*f,u=(a.t+q)/a.dur,hh=u>=1?0:a.peak*Math.sin(Math.PI*u);
   if(q>=sim.flightHold&&Math.hypot(bx-t.x,by-t.y)<R&&(hh<=1.2||a.header&&hh<=2.1&&u>.5)){claim.tC=q;claim.hC=hh;break;}}
  return claim;
 }
 /** Signature moves in live play, sparingly and in context:
  * - an acrobatic finish the sim will take first time (sim.acrobatic): bicycle (high ball, back to goal), scissor
  *   (high/mid ball side-on), diving header (low cross), volley / half-volley (dropping ball), timed to the contact;
  * - a back heel for a short pass to a team-mate behind (instead of the about-turn wind-up);
  * - futsal (rarely elsewhere): the sole roll when shielding under pressure, the flick-up to beat a man. */
 function signatureMoves(sim:MatchSim,rate:number,sx:number,sz:number){
  const b=sim.ball,a=sim.aerial,ac=sim.acrobatic,futsal=sim.venue.id==='futsal';
  if(ac&&a&&!b.owner&&b.target===ac.to){
   const t=sim.players[ac.to],R=sim.receptionRadius;
   if(t&&!airborne(states.get(ac.to)?.move,MOVE_SECONDS.bicycle)||t&&(clock-(states.get(ac.to)!.move!.start))/MOVE_SECONDS[states.get(ac.to)!.move!.kind]<.08){
    // When and how high will he meet it? (the sim claims inside the control radius once the ball is playable)
    const {tC,hC}=predictClaim(sim,t,R);
    const contactIn=tC/rate;
    if(tC>=0&&contactIn<=.56){
     let keeperY=200;for(const id of sim.ids){const q=sim.players[id];if(q.isGK&&q.team===t.team)keeperY=q.y;}
     const gy=keeperY<200?392:8,gx=135-t.x,gz=gy-t.y,gl=Math.hypot(gx,gz)||1,vl=Math.hypot(b.vx,b.vy)||1;
     const back=(b.vx*gx+b.vy*gz)/(vl*gl),toGoal=Math.atan2(gx*sx,gz*sz),toBall=Math.atan2(-b.vx*sx,-b.vy*sz);
     // The ball's side relative to a facing: the kicking leg is on the side it comes from.
     const sideOf=(f:number)=>{const fx=Math.sin(f),fz=Math.cos(f);return (-b.vx*sx*fz+b.vy*sz*fx)>=0?1:-1 as -1|1;};
     let kind:SignatureMove|null=null,facing=toGoal,height=0;
     const pick=acrobaticMove(hC,back,a.header);
     if(pick){kind=pick.kind;height=pick.height;if(kind==='bicycle')facing=toBall;else if(kind==='divingHeader'){const bx=Math.sin(toGoal)+Math.sin(toBall),bz=Math.cos(toGoal)+Math.cos(toBall);facing=Math.atan2(bx,bz);}}
     if(kind)startMove(ac.to,kind,contactIn,sideOf(facing),height,facing);
     // Beach soccer's signature finish, taught when it happens (FIFA Beach Soccer Laws 2024-25, Law 12).
     if(sim.isBeach&&(kind==='bicycle'||kind==='scissor'))sim.teach(kind==='bicycle'?'Overhead kick!':'Scissor kick!','Beach laws protect a player trying an overhead or scissor kick: opponents may not unfairly stop it','overhead',25);
     else if(sim.isBeach&&kind==='volley')sim.teach('Volley!','On sand the ball rarely rolls true, so beach players strike it out of the air before it lands','volley',40);
    }
   }
  }
  // Back heel: a short pass to a team-mate behind him, flicked behind the standing leg instead of turning.
  const wu=sim.kickWindup;
  if(wu&&wu.kind==='pass'&&wu.to&&wu.turn>2.3){
   const q=sim.players[wu.id],t=sim.players[wu.to];
   if(q&&t&&!q.isGK&&Math.hypot(t.x-q.x,t.y-q.y)<28&&hash(wu.id+wu.to,Math.floor(wu.dur*1e4))%2===0){
    const dx=(t.x-q.x)*sx,dz=(t.y-q.y)*sz,facing=Math.atan2(-dx,-dz),lat=dx*Math.cos(facing)-dz*Math.sin(facing);
    startMove(wu.id,'backHeel',wu.t/rate,lat>=0?1:-1,0,facing);
   }
  }
  // Futsal skills on the ball (rarely in the bigger formats).
  const o=b.owner,op=o?sim.players[o]:undefined;
  for(const id of sim.ids){const st=states.get(id);if(st?.move&&(st.move.kind==='soleRoll'&&(id!==o||wu?.id===id)||st.move.kind==='flickUp'&&id!==o&&wu?.id!==id)&&(clock-st.move.start)/MOVE_SECONDS[st.move.kind]<MOVE_CONTACT[st.move.kind])st.move=undefined;}
  // [combos] when the sim plays its own sole rolls and flicks (lib/town/match/combos.ts, which moves the ball and
  // times the pose to it), these cosmetic triggers stay off so the two never double up.
  if(op&&o&&!op.isGK&&!wu&&!sim.combos){
   const st=state(o);
   if((!st.move||clock-st.move.start>=MOVE_SECONDS[st.move.kind])&&clock>=(st.cool??0)){
    let fd=Infinity,fdx=0,fdy=0;for(const id of sim.ids){const q=sim.players[id];if(q.team===op.team||q.isGK)continue;const d=Math.hypot(q.x-op.x,q.y-op.y);if(d<fd){fd=d;fdx=q.x-op.x;fdy=q.y-op.y;}}
    const speed=Math.hypot(op.vx,op.vy),roll=hash(o,Math.floor(clock/2));
    const ahead=speed>1&&fd<Infinity?(op.vx*fdx+op.vy*fdy)/(speed*fd):0,side=(roll&1?1:-1) as -1|1;
    if(fd<8&&speed>25&&ahead>.6&&roll%(futsal?3:40)===0){startMove(o,'flickUp',MOVE_CONTACT.flickUp*MOVE_SECONDS.flickUp,side,0);st.cool=clock+(futsal?5:12);}
    else if(fd<9&&speed<35&&roll%(futsal?3:45)===0){startMove(o,'soleRoll',MOVE_CONTACT.soleRoll*MOVE_SECONDS.soleRoll,side,0);st.cool=clock+MOVE_SECONDS.soleRoll+(futsal?.4:6);}
   }
  }
 }
 function consume(sim:MatchSim,realDt:number){
  clock+=Math.max(0,realDt);
  // Where the shot was struck from (one-on-ones are smothered).
  const shotNow=sim.shotActive;if(shotNow&&!shotWas)shotFrom={x:sim.ball.x,y:sim.ball.y};if(!shotNow)shotFrom=null;shotWas=shotNow;
  const ring=sim.touches,latest=sim.touchSerial;
  // A match that was asleep longer than the ring only replays the newest touches.
  for(let serial=Math.max(seen+1,latest-ring.length+1);serial<=latest;serial++){
   const ev=ring[(serial-1)%ring.length];if(ev.serial!==serial)continue;
   touchActions(ev,sim,actions);
   // The ball height of a control, so the view can drop the ball from chest/thigh/head to the feet.
   if(ev.kind==='receive'||ev.kind==='intercept'||ev.kind==='tackle'){const s=state(ev.id);s.touchHeight=ev.kind==='tackle'?0:ev.height;s.touchAt=clock;}
   for(const a of actions){const s=state(a.id);
    if(a.delay>0){s.pending=a.squash;s.pendingAt=clock+a.delay;}
    else{s.squash=a.squash;s.serial++;}
    // A header met at the top of a jump already runs on the jump's clock; a diving keeper's parry is the dive.
    if(a.reaction&&(a.reaction==='header'&&airborne(s.jump,JUMP_SECONDS)||airborne(s.dive,DIVE_SECONDS)))continue;
    if(a.reaction){s.reaction=a.reaction;s.start=clock+a.delay;s.dur=REACTION_SECONDS[a.reaction];}
    // A new foot touch ends a stale body pose instead of replaying it.
    else if(a.squash<0&&s.reaction&&s.reaction!=='dejected')s.reaction=undefined;
   }
  }
  seen=latest;
  anticipate(sim);
  // Called receiver + ready marker: while a pass is being wound up or is travelling.
  const call=sim.callFor,cp=call?sim.players[call]:undefined;
  if(!cp){caller=null;marker=null;callWeight=markerWeight=0;return;}
  const wind=sim.kickWindup,ball=sim.ball;
  // The arm drops as the ball arrives so the receiver's hands are free for the touch.
  const d=wind?Infinity:Math.hypot(ball.x-cp.x,ball.y-cp.y);
  callWeight=wind?1:clamp((d-10)/14,0,1);
  if(caller!==call)marker=null;caller=call;
  let best:string|null=null,bestD=Infinity,prevD=Infinity;
  for(const id of sim.ids){const q=sim.players[id];if(q.team===cp.team||q.isGK)continue;const dd=Math.hypot(q.x-cp.x,q.y-cp.y);if(dd<bestD){bestD=dd;best=id;}if(id===marker)prevD=dd;}
  // Hysteresis: keep the current marker unless another is clearly closer.
  if(marker&&prevD<bestD+3){best=marker;bestD=prevD;}
  marker=bestD<26?best:null;markerWeight=marker?clamp((26-bestD)/14,0,1):0;
 }
 /** Writes the choreo fields onto a live player's motion (always set, so stale poses clear).
  * `pace` is the player's live pace (sim speed / 84): the ready stance fades out at a run. */
 function apply(id:string,motion:PlayerMotion,pace:number){
  const s=states.get(id);
  if(s){
   if(s.pendingAt>=0&&clock>=s.pendingAt){s.squash=s.pending;s.serial++;s.pendingAt=-1;}
   const t=s.reaction?(clock-s.start)/s.dur:0;
   if(s.reaction&&t>=1)s.reaction=undefined;
   motion.reaction=s.reaction&&t>=0?s.reaction:undefined;motion.reactionProgress=motion.reaction?t:undefined;
   motion.squash=s.serial?s.squash:undefined;motion.squashSerial=s.serial||undefined;
   // Dive / jump (reused objects: no allocation per frame). The diving keeper faces the shot, not his travel.
   const dp=s.dive?(clock-s.dive.start)/DIVE_SECONDS:-1;
   if(s.dive&&dp>=1)s.dive=undefined;
   if(s.dive&&dp>=0){s.dive.motion.progress=dp;motion.dive=s.dive.motion;motion.facing=s.dive.facing;}else motion.dive=undefined;
   const jp=s.jump?(clock-s.jump.start)/JUMP_SECONDS:-1;
   if(s.jump&&jp>=1)s.jump=undefined;
   if(s.jump&&jp>=0){s.jump.motion.progress=jp;motion.jump=s.jump.motion;}else motion.jump=undefined;
   // Signature move: owns the body (no strike clip on top), facing where the move needs it.
   const mp=s.move?(clock-s.move.start)/MOVE_SECONDS[s.move.kind]:-1;
   if(s.move&&mp>=1)s.move=undefined;
   if(s.move&&mp>=0){s.move.motion.progress=mp;motion.move=s.move.motion;if(s.move.facing!==undefined)motion.facing=s.move.facing;// The flick-up keeps the ball through a wind-up and hands over to the strike just after its contact (a self-volley).
    if(s.move.kind!=='soleRoll'&&(s.move.kind!=='flickUp'||mp<MOVE_CONTACT.flickUp+.1)){motion.kick=undefined;motion.receive=undefined;}}else motion.move=undefined;
  }else{motion.reaction=undefined;motion.reactionProgress=undefined;motion.squash=undefined;motion.squashSerial=undefined;motion.dive=undefined;motion.jump=undefined;motion.move=undefined;}
  motion.called=id===caller&&callWeight>0?callWeight:0;
  const run=clamp((pace-.35)/.25,0,1),calm=1-run*run*(3-2*run);
  motion.ready=id===marker&&markerWeight>0?markerWeight*calm:0;
 }
 return {consume,apply,get clock(){return clock;},get caller(){return caller;},get marker(){return marker;},reactionOf(id:string){return states.get(id)?.reaction;},/** Ball height of this player's current control; 0 once the cushion is over (≤ 1.5 real s). */
  touchHeight(id:string){const s=states.get(id);return s&&s.touchAt>=0&&clock-s.touchAt<1.5?s.touchHeight:0;},
  /** Progress of this player's dive / jump (0..1), undefined when none. */
  diveOf(id:string){const s=states.get(id);return s?.dive?(clock-s.dive.start)/DIVE_SECONDS:undefined;},
  /** This player's signature move and its progress, undefined when none. */
  moveOf(id:string){const s=states.get(id);return s?.move?{kind:s.move.kind,progress:(clock-s.move.start)/MOVE_SECONDS[s.move.kind]}:undefined;},
  /** Height (m) the held ball rises above the feet during a flick-up (0 otherwise). */
  ballLift(id:string|null){if(!id)return 0;const m=states.get(id)?.move;if(!m||m.kind!=='flickUp')return 0;const p=(clock-m.start)/MOVE_SECONDS.flickUp,c=MOVE_CONTACT.flickUp;return p>c&&p<1?.75*Math.sin(Math.PI*(p-c)/(1-c)):0;},
  jumpOf(id:string){const s=states.get(id);return s?.jump?(clock-s.jump.start)/JUMP_SECONDS:undefined;},
  reset(){states.clear();caller=marker=null;callWeight=markerWeight=0;}};
}
export type Choreo=ReturnType<typeof createChoreo>;
