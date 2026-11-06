import * as T from 'three';
import type {MatchSim,TouchKind} from './match/matchSim';
import type {LiveVenue} from './venues';
import {bibColour} from './beanLooks';
import {createFxRings} from '../graphics/matchFxRings';
import type {createBallEffects} from '../graphics/ballEffects';
import {matchFxLevel} from './matchFxSetting';
/**
 * Kick effects for a live match (owner Nov 5 2026: "improve the tackling, passing, shooting … add trails, effects, and make this
 * feel more premium"; docs/join-live-game-design.md "Kick effects"). Read from the sim's touch ring (a friend's puppet sim gets the
 * same events from lib/town/match/puppetTouches.ts), so every phone on a match sees every kick, friends' included:
 *   kick    → the trail in the KICKER's team colour (purple for a lofted ball, flame for a power shot), its ribbon width and ghost
 *             count scaled by the ball's live speed (a soft pass is a light streak, a hard shot a full ribbon); a flare at the foot;
 *   lofted  → a landing ring where the ball will come down (a ballistic estimate from the drawn ball: works on puppets and replays);
 *   receive → a small "got it" ring closing on the receiver's feet;
 *   tackle  → a clean win: an impact burst + dust ring + sparkle between the two players; a poke-away: a sharp small ring at the ball;
 *   parry   → a white burst at the ball (the keeper's dive reads).
 * Levels: Full; Light (Island settings: the thin line only, no ribbon / ghosts / flares); calm (reduced motion: no trail, no flares,
 * only the still information rings: landing, got it). Heat: the ring pool is ONE instanced draw call while a ring lives (none at
 * rest) and the ribbon replaces the trail line (same draw count); no allocation per frame (pending events in a fixed ring).
 */
export const KICK_FX={/** sim units / s → 0..1 power */speed0:60,speedSpan:440,/** a puppet's shot: at least this fast and on target */shotLike:220,
 ribbonPass:[.035,.05],ribbonShot:[.07,.13],ghostsPass:[2,4],ghostsShot:[6,14],/** above the pitch lines (the join markers sit at +.13) */groundY:.15,gravity:13,ballY:.295} as const;
export type KickFxLevel='full'|'light'|'calm';
type Pending={kind:TouchKind;id:string;other:string|null;speed:number;team:'gold'|'blue';lofted:boolean;loose:boolean};
const clamp01=(v:number)=>v<0?0:v>1?1:v;
/** Off switch for before / after heat runs (window.__fi2FxOff = true: the old trail colours and none of the new effects). */
const fxOff=()=>!!(globalThis as {__fi2FxOff?:boolean}).__fi2FxOff;
export function kickPower(speed:number){return clamp01((speed-KICK_FX.speed0)/KICK_FX.speedSpan);}
/** A loose ball heading into a goal mouth within ~2 s (sim space: x 0..270, goals at y 8 / 392, mouth ±19 around x 135). */
export function shotLike(sim:MatchSim){const b=sim.ball,sp=Math.hypot(b.vx,b.vy);if(sp<KICK_FX.shotLike||Math.abs(b.vy)<1)return false;
 const gy=b.vy<0?8:392,t=(gy-b.y)/b.vy;if(!(t>0&&t<2.2))return false;return Math.abs(b.x+b.vx*t-135)<30;}
export function createKickFx(root:T.Group,venue:LiveVenue,trail:ReturnType<typeof createBallEffects>){
 const rings=createFxRings();root.add(rings.mesh);
 const white=new T.Color('#fff7df'),lift=(hex:string)=>new T.Color(hex).lerp(white,.32);
 const team={gold:lift(bibColour(venue.id,true)),blue:lift(bibColour(venue.id,false))},teamHex={gold:'#'+team.gold.getHexString(),blue:'#'+team.blue.getHexString()};
 const purple=new T.Color('#b877ff'),flame=new T.Color('#ff8a3d'),dust=new T.Color('#cfc6ad'),flash=new T.Color('#fffbe8');
 const pending:Pending[]=Array.from({length:8},()=>({kind:'kick' as TouchKind,id:'',other:null,speed:0,team:'gold' as const,lofted:false,loose:false}));let pendN=0,seen=-1;
 /** What the HUD / camera read (liveJoinRuntime): serials bump once per event on an enabled (drawn) field. */
 const view={kickSerial:0,kickBy:'',kickPower:0,kickShot:false,tackleSerial:0,tackleBy:'',tackleFrom:'',tackleClean:false,receiveSerial:0,receiveBy:''};
 const stats={kicks:0,receives:0,tackles:0,pokes:0,saves:0,goals:0,flares:0,landing:0,bursts:0,level:'full' as KickFxLevel};
 let netHit:((x:number,y:number,z:number,vx:number,vz:number,reduced:boolean)=>void)|null=null;
 let kickTeam:'gold'|'blue'|null=null,kickShot=false,level:KickFxLevel='full',off=false;
 const p0=new T.Vector3(),vel=new T.Vector3(),landAt=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3();let hasPrev=false,landSeeded=false;
 /** Every update (drawn or not): consume the ring so nothing plays late; queue the new events only while `enabled`. */
 function consume(sim:MatchSim,enabled:boolean,reduced:boolean){
  off=fxOff();level=reduced?'calm':matchFxLevel()==='light'?'light':'full';stats.level=level;
  const ring=sim.touches,latest=sim.touchSerial;if(seen<0)seen=latest;
  if(!enabled){pendN=0;seen=latest;return;}
  for(let s=Math.max(seen+1,latest-ring.length+1);s<=latest;s++){const ev=ring[(s-1)%ring.length];if(ev.serial!==s)continue;
   if(ev.kind==='kick'){kickTeam=ev.team;kickShot=!!sim.shotActive||shotLike(sim);view.kickSerial++;view.kickBy=ev.id;view.kickPower=kickPower(ev.speed);view.kickShot=kickShot;stats.kicks++;}
   else if(ev.kind==='tackle'){view.tackleSerial++;view.tackleBy=ev.id;view.tackleFrom=ev.other??'';view.tackleClean=sim.ball.owner===ev.id;stats.tackles++;if(!view.tackleClean)stats.pokes++;}
   else if(ev.kind==='receive'||ev.kind==='intercept'){view.receiveSerial++;view.receiveBy=ev.id;stats.receives++;}
   else if(ev.kind==='parry')stats.saves++;
   if(pendN<pending.length){const q=pending[pendN++];q.kind=ev.kind;q.id=ev.id;q.other=ev.other;q.speed=ev.speed;q.team=ev.team;q.lofted=!!sim.ball.lofted;q.loose=sim.ball.owner===null;}}
  seen=latest;
  if(sim.ball.owner)kickShot=false;
 }
 /** The trail's colour this frame (matchEffects): a power shot stays flame orange, a lofted ball purple, else the kicker's side. */
 function colour(sim:MatchSim,shot:boolean,power:boolean){
  if(off)return shot?(power?'#ff7a2e':'#eee4c4'):sim.ball.lofted?'#b877ff':sim.possession==='blue'?'#609de3':'#efbb54';
  return shot&&power?'#ff7a2e':sim.ball.lofted?'#b877ff':teamHex[kickTeam??(sim.possession==='blue'?'blue':'gold')];
 }
 /** Shot flight for the trail: the owner's flag, or (a friend's puppet) the shot latched at the kick. */
 const isShot=(sim:MatchSim)=>!!sim.shotActive||!off&&kickShot&&!sim.ball.owner;
 /** After the ball mesh is placed (matchEffects.trail): spawn the queued rings, size the trail, advance the pool. */
 function draw(sim:MatchSim,ball:T.Vector3,dt:number,flying:boolean,at:((id:string,out:T.Vector3)=>boolean)|null){
  const full=level==='full'&&!off,calm=level==='calm',power=kickPower(Math.hypot(sim.ball.vx,sim.ball.vy)),shot=isShot(sim);
  // trail shape: a ribbon + ghosts by live power (Full); Light: the thin line, no ghosts; off: the old look
  if(off){trail.shape.ribbon=0;trail.shape.ghosts=14;}
  else if(!full){trail.shape.ribbon=0;trail.shape.ghosts=0;}
  else{const R=shot?KICK_FX.ribbonShot:KICK_FX.ribbonPass,G=shot?KICK_FX.ghostsShot:KICK_FX.ghostsPass;trail.shape.ribbon=R[0]+(R[1]-R[0])*power;trail.shape.ghosts=Math.round(G[0]+(G[1]-G[0])*power);}
  for(let i=0;i<pendN&&!off;i++){const q=pending[i],c=q.lofted&&q.kind==='kick'?purple:team[q.team];
   if(q.kind==='kick'){if(!full)continue;const pw=kickPower(q.speed);rings.spawn('flare',ball.x,KICK_FX.groundY,ball.z,sim.powerShot&&q.kind==='kick'&&isShot(sim)?flame:c,.75+.7*pw);stats.flares++;
    if(pw>.55)rings.spawn('dust',ball.x,KICK_FX.groundY,ball.z,dust,.7+.5*pw);}
   else if(q.kind==='receive'||q.kind==='intercept'){if(q.speed<25)continue;if(at&&at(q.id,a))rings.spawn('got',a.x,KICK_FX.groundY,a.z,c,calm?.8:1);}
   else if(q.kind==='tackle'){if(calm)continue;
    if(!q.loose&&at&&at(q.id,a)){if(q.other&&at(q.other,b))a.lerp(b,.5);rings.spawn('impact',a.x,KICK_FX.groundY,a.z,c,1.15);rings.spawn('dust',a.x,KICK_FX.groundY,a.z,flash,1);if(full)trail.impact(a.x,.55,a.z);}
    else{rings.spawn('poke',ball.x,KICK_FX.groundY,ball.z,c,1);if(full)trail.impact(ball.x,ball.y,ball.z);}}
   else if(q.kind==='goal'){netHit?.(ball.x,ball.y+(venue.elevation??0),ball.z,vel.x,vel.z,calm);stats.goals++;}// the net ripples (Town: propReactions, vertex sway)
   else if(q.kind==='parry'&&!calm){rings.spawn('impact',ball.x,Math.max(KICK_FX.groundY,ball.y-.25),ball.z,flash,.8);if(full)trail.impact(ball.x,ball.y,ball.z);}}
  pendN=0;
  // landing ring: where a lofted ball comes down (finite-difference velocity of the DRAWN ball, smoothed; constant gravity)
  if(dt>0){if(hasPrev){a.subVectors(ball,p0).divideScalar(dt);vel.lerp(a,.35);}p0.copy(ball);hasPrev=true;}
  const lofted=!off&&flying&&!!sim.ball.lofted&&!sim.ball.owner,h=ball.y-KICK_FX.ballY;
  if(lofted&&h>.25&&dt>0){const g=KICK_FX.gravity,t=(vel.y+Math.sqrt(Math.max(0,vel.y*vel.y+2*g*h)))/g;
   a.set(ball.x+vel.x*t,KICK_FX.groundY,ball.z+vel.z*t);if(!landSeeded){landAt.copy(a);landSeeded=true;}else landAt.lerp(a,.25);
   rings.landing(true,landAt.x,KICK_FX.groundY,landAt.z,purple);stats.landing++;}
  else{rings.landing(false,0,0,0,null);if(!lofted)landSeeded=false;}
  rings.update(dt,true,calm);
 }
 /** Keeper saves + body moves (Nov 5 2026, lib/town/liveBodyFx.ts): one-off rings at a world point (x, z; y = the ball's height for
  *  a save). catch: a "got it" ring closing on the hands; save (parry / tip): a white burst; beat: a sharp ring at the beaten
  *  defender's feet; shoulder: a small impact. Big saves add the dust ring + sparkle. Light keeps the rings (no sparkle), calm
  *  (reduced motion) none: the same levels as every other effect here. */
 function burst(kind:'save'|'catch'|'beat'|'shoulder',x:number,y:number,z:number,teamOf:'gold'|'blue',big:boolean){
  if(off||level==='calm')return;const c=team[teamOf],full=level==='full';stats.bursts++;
  if(kind==='catch'){rings.spawn('got',x,KICK_FX.groundY,z,c,big?1.25:.95);if(big){rings.spawn('impact',x,Math.max(KICK_FX.groundY,y-.25),z,flash,.9);if(full)trail.impact(x,y,z);}}
  else if(kind==='save'){rings.spawn('impact',x,Math.max(KICK_FX.groundY,y-.25),z,flash,big?1.35:1);if(big)rings.spawn('dust',x,KICK_FX.groundY,z,flash,1.1);if(full)trail.impact(x,y,z);}
  else if(kind==='beat'){rings.spawn('poke',x,KICK_FX.groundY,z,c,1.1);if(full)rings.spawn('dust',x,KICK_FX.groundY,z,dust,.75);}
  else rings.spawn('impact',x,KICK_FX.groundY,z,c,.75);
 }
 return {consume,colour,isShot,draw,burst,view,stats,rings,/** Town (via fieldRuntime.setNetHit): a goal billows the net at the ball, world space. */set netHit(f:typeof netHit){netHit=f;},hide(){rings.update(0,false,false);hasPrev=false;},dispose(){rings.dispose();}};
}
