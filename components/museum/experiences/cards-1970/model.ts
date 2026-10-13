import type {Call} from './content';
import {POSES,mixPose,runAt,type Fig,type Kit,type Pose,type PoseName} from '../anatomy/figure';

/**
 * cards-1970 · "Ref at match speed" (Oct 12 2026 anatomy Paper rebuild of the Oct 10 game; user: a ref game with readable fouls,
 * "showing the right card at speed", and "I can't tell what is a foul or not" about generic animations). Pure model: no DOM, so
 * tests/museum-exp-cards-1970.cjs runs it in Node.
 *
 * Nine made-up practice moments (no real players), each judged by the IFAB Laws of the Game, Law 12. Each is a short film of
 * paper mannequins on a table-top pitch: #9 (white shirt) attacks, #4 (grey shirt) defends, and YOU are the referee. While it
 * plays at match speed you blow the whistle the moment you SEE a foul, or let a fair challenge run on. A whistle freezes the
 * film and replays the contact slowly under a magnifier; then you show the card: none (a free kick), yellow or red. Ken
 * Aston's traffic light beside the pitch lights the colour you chose and the referee holds the card up.
 *
 * Scoring (per moment, 200 max): a fair challenge you let run on = 200. A foul: whistle after the contact = 50 + up to 50 for
 * speed (full within 0.25 s, nothing extra after 1.5 s); a whistle more than 0.1 s BEFORE the contact is "too early" (0 for
 * the whistle); the right card +100. A missed foul or a whistle on a fair challenge = 0.
 *
 * World: centimetres. The play runs along +x; y is across the pitch (+y toward the viewer); z is up.
 */
export type Card='none'|'yellow'|'red';
export type Answer={whistle:boolean;card:Card};
/** A pose name, or 'run' (the stride cycle). */
export type FPose=PoseName|'run';
export type Key={t:number;x:number;y:number;/** heading, degrees */h:number;pose:FPose};
export type BallKey={t:number;x:number;y:number;z?:number};
export type Actor={id:string;num:number;kit:Kit;keys:Key[]};
export type Moment={
 id:string;
 /** What the referee should do. card = the card the right call shows (none = a free kick, or play on when whistle is false). */
 answer:Answer;
 /** Who gets the card / gives the free kick (shirt number). */
 who:number;
 T:number;tc:number;
 /** Where to look: the contact (or, on a dive, the empty gap), and whether bodies really touched. */
 contact:{x:number;y:number;z:number;hit:boolean};
 actors:Actor[];
 ball:BallKey[];
 /** a shirt being pulled: from the puller's hand to the shirt, between t0 and t1 */
 pull?:{t0:number;t1:number};
 goal?:boolean;
 verdict:string;law:string;why:string;
 /** One short line naming what to watch (shown before the film). */
 watch:string;
 /** What the slow replay under the magnifier shows, in one line: the thing that makes it a foul, or fair. */
 tell:string;
};
const K=(t:number,x:number,y:number,h:number,pose:FPose):Key=>({t,x,y,h,pose});
const B=(t:number,x:number,y:number,z=0):BallKey=>({t,x,y,z});

export const MOMENTS:readonly Moment[]=[
 {id:'shoulder',answer:{whistle:false,card:'none'},who:4,T:2.8,tc:1.25,contact:{x:-40,y:-22,z:140,hit:true},
  watch:'Number 4 (grey) chases number 9 (white) for the ball.',tell:'Shoulder to shoulder, the ball close, not too hard: a fair charge.',
  actors:[
   {id:'A',num:9,kit:'light',keys:[K(0,-520,30,0,'run'),K(1.1,-90,12,0,'run'),K(1.25,-40,10,-6,'charge'),K(1.45,10,26,8,'stumble'),K(1.8,80,40,4,'run'),K(2.8,260,56,0,'run')]},
   {id:'D',num:4,kit:'grey',keys:[K(0,-600,-80,0,'run'),K(1.1,-90,-50,6,'run'),K(1.25,-40,-46,12,'charge'),K(1.5,40,-30,0,'run'),K(2.8,470,-24,0,'run')]}],
  ball:[B(0,-450,30),B(1.25,10,-6),B(1.6,120,-24),B(2.8,560,-28)],
  verdict:'Play on. A fair charge!',law:'Law 12 · a fair challenge',
  why:'Shoulder to shoulder, with the ball close and not too hard: that is a fair charge. Number 4 won the ball. No foul, no card.'},
 {id:'tackle',answer:{whistle:false,card:'none'},who:4,T:2.8,tc:1.3,contact:{x:-22,y:14,z:12,hit:true},
  watch:'Number 4 (grey) slides in as number 9 (white) runs at goal.',tell:'The slide touched the ball first. Number 9 jumped clear.',
  actors:[
   {id:'A',num:9,kit:'light',keys:[K(0,-520,0,0,'run'),K(1.15,-110,0,0,'run'),K(1.3,-50,0,0,'hurdle'),K(1.55,30,0,0,'hurdle'),K(1.75,90,0,0,'run'),K(2.8,330,0,0,'run')]},
   {id:'D',num:4,kit:'grey',keys:[K(0,170,330,-118,'stand'),K(.5,130,260,-118,'run'),K(1.0,40,120,-112,'run'),K(1.15,14,80,-110,'slide'),K(1.4,-6,24,-110,'slide'),K(1.9,-14,4,-110,'slide'),K(2.3,-14,4,-110,'crouch'),K(2.8,-14,4,-110,'stand')]}],
  ball:[B(0,-450,0),B(1.2,-36,0),B(1.32,-22,6),B(1.9,-80,-170),B(2.8,-110,-280)],
  verdict:'Play on. No foul!',law:'Law 12 · a fair tackle',
  why:'Number 4 slid in and played the ball, not the player, and nobody was put in danger. So there is no foul and no card. Good tackling is part of the game.'},
 {id:'trip',answer:{whistle:true,card:'none'},who:4,T:2.8,tc:1.35,contact:{x:-52,y:4,z:16,hit:true},
  watch:'Number 4 (grey) steps across as number 9 (white) dribbles past.',tell:'A late foot across the path took the legs, not the ball.',
  actors:[
   {id:'A',num:9,kit:'light',keys:[K(0,-520,0,0,'run'),K(1.3,-40,0,0,'run'),K(1.5,30,0,4,'stumble'),K(1.8,90,4,4,'fall'),K(2.1,124,6,4,'lie'),K(2.8,124,6,4,'lie')]},
   {id:'D',num:4,kit:'grey',keys:[K(0,220,190,-150,'stand'),K(.6,160,150,-150,'run'),K(1.1,46,70,-148,'run'),K(1.25,18,50,-150,'trip'),K(1.65,12,48,-150,'trip'),K(1.95,16,52,-150,'stand'),K(2.8,16,52,-150,'stand')]}],
  ball:[B(0,-450,0),B(1.2,40,0),B(1.6,230,10),B(2.8,390,20)],
  verdict:'Foul! Free kick, but no card.',law:'Law 12 · careless',
  why:'Number 4 was late and clumsy and tripped number 9, so it is a foul and a free kick. Careless means not taking enough care. The Law says a careless foul needs no card, and saying sorry helps too.'},
 {id:'push',answer:{whistle:true,card:'none'},who:4,T:2.8,tc:1.3,contact:{x:-38,y:0,z:122,hit:true},
  watch:'Number 4 (grey) runs up behind number 9 (white).',tell:'Two hands in number 9’s back: a push.',
  actors:[
   {id:'A',num:9,kit:'light',keys:[K(0,-400,0,0,'run'),K(1.3,-18,0,0,'run'),K(1.45,30,0,0,'stumble'),K(1.75,100,0,0,'fall'),K(2.0,128,0,0,'lie'),K(2.8,128,0,0,'lie')]},
   {id:'D',num:4,kit:'grey',keys:[K(0,-540,0,0,'run'),K(1.2,-122,0,0,'run'),K(1.3,-100,0,0,'push'),K(1.7,-84,0,0,'push'),K(2.0,-76,0,0,'stand'),K(2.8,-76,0,0,'stand')]}],
  ball:[B(0,-340,0),B(1.3,40,0),B(2.0,240,10),B(2.8,340,10)],
  verdict:'Foul! Free kick, but no card.',law:'Law 12 · pushing',
  why:'Pushing an opponent in the back is a foul, so it is a free kick to the other team. It was careless, not dangerous, so there is no card.'},
 {id:'shirt',answer:{whistle:true,card:'yellow'},who:4,T:2.9,tc:1.25,contact:{x:-34,y:-8,z:128,hit:true},pull:{t0:1.25,t1:1.9},
  watch:'Number 9 (white) breaks clear. Number 4 (grey) chases.',tell:'A hand on the shirt held number 9 back from a clear run.',
  actors:[
   {id:'A',num:9,kit:'light',keys:[K(0,-360,0,0,'run'),K(1.2,-20,0,0,'run'),K(1.3,4,0,0,'held'),K(1.9,40,0,0,'held'),K(2.2,52,0,0,'stand'),K(2.9,52,0,0,'stand')]},
   {id:'D',num:4,kit:'grey',keys:[K(0,-500,-14,0,'run'),K(1.2,-128,-14,0,'run'),K(1.25,-112,-14,0,'reach'),K(1.9,-62,-14,0,'reach'),K(2.2,-62,-14,0,'stand'),K(2.9,-62,-14,0,'stand')]}],
  ball:[B(0,-300,0),B(1.2,50,0),B(2.2,350,20),B(2.9,460,30)],
  verdict:'Yellow card.',law:'Law 12 · stopping a promising attack',
  why:'Number 9 was running clear with the ball. Number 4 held the shirt to stop them. Holding is a foul, and unfairly stopping a promising attack is a yellow card.'},
 {id:'dive',answer:{whistle:true,card:'yellow'},who:9,T:2.8,tc:1.35,contact:{x:62,y:14,z:50,hit:false},
  watch:'Number 4 (grey) comes to meet number 9 (white).',tell:'Look at the gap: nobody touched number 9.',
  actors:[
   {id:'A',num:9,kit:'light',keys:[K(0,-520,0,0,'run'),K(1.25,-60,0,0,'run'),K(1.35,-30,0,0,'stumble'),K(1.55,16,0,0,'fall'),K(1.8,44,0,0,'lie'),K(2.8,44,0,0,'lie')]},
   {id:'D',num:4,kit:'grey',keys:[K(0,300,30,180,'stand'),K(.6,240,30,180,'run'),K(1.0,186,30,180,'run'),K(1.2,176,30,180,'stand'),K(1.7,176,30,180,'stand'),K(2.0,176,30,180,'point'),K(2.8,176,30,180,'point')]}],
  ball:[B(0,-450,0),B(1.25,0,0),B(1.6,90,0),B(2.8,180,20)],
  verdict:'Yellow card for diving.',law:'Law 12 · unsporting behaviour',
  why:'Look at the gap: nobody touched number 9. Pretending to be fouled is trying to trick the referee, so it is a yellow card. The game restarts with a free kick to the other team.'},
 {id:'shin',answer:{whistle:true,card:'yellow'},who:4,T:2.8,tc:1.3,contact:{x:-24,y:6,z:40,hit:true},
  watch:'Number 9 (white) passes the ball on. Number 4 (grey) charges in.',tell:'The ball was long gone. The kick hit the shin, late and hard.',
  actors:[
   {id:'A',num:9,kit:'light',keys:[K(0,-520,0,0,'run'),K(.8,-190,0,0,'run'),K(.9,-160,0,-30,'pass'),K(1.05,-110,0,0,'run'),K(1.3,-30,0,0,'run'),K(1.45,6,0,0,'stumble'),K(1.7,56,0,0,'fall'),K(2.0,80,0,0,'lie'),K(2.8,80,0,0,'lie')]},
   {id:'D',num:4,kit:'grey',keys:[K(0,440,40,180,'run'),K(1.1,96,16,180,'run'),K(1.25,58,10,180,'kick'),K(1.6,46,10,180,'kick'),K(1.9,52,10,180,'stand'),K(2.8,52,10,180,'stand')]}],
  ball:[B(0,-450,0),B(.9,-130,0),B(1.3,120,-230),B(2.8,320,-390)],
  verdict:'Yellow card.',law:'Law 12 · reckless',
  why:'The ball had already gone, and number 4 kicked number 9 on the shin, late and hard. That is reckless: not caring about the danger to the other player. A reckless foul is a yellow card.'},
 {id:'studs',answer:{whistle:true,card:'red'},who:4,T:3,tc:1.4,contact:{x:-20,y:0,z:44,hit:true},
  watch:'Number 4 (grey) chases number 9 (white) from behind.',tell:'Both feet off the ground, studs up, from behind.',
  actors:[
   {id:'A',num:9,kit:'light',keys:[K(0,-340,0,0,'run'),K(1.35,0,0,0,'run'),K(1.5,40,0,0,'stumble'),K(1.8,100,0,0,'fall'),K(2.1,122,0,0,'lie'),K(3,122,0,0,'lie')]},
   {id:'D',num:4,kit:'grey',keys:[K(0,-620,0,0,'run'),K(1.0,-230,0,0,'run'),K(1.18,-172,0,0,'run'),K(1.3,-128,0,0,'studs'),K(1.5,-96,0,0,'studs'),K(1.75,-80,0,0,'slide'),K(2.3,-80,0,0,'slide'),K(3,-80,0,0,'crouch')]}],
  ball:[B(0,-280,0),B(1.35,60,0),B(1.6,140,0),B(3,340,10)],
  verdict:'Red card: serious foul play.',law:'Law 12 · excessive force',
  why:'Number 4 jumped in from behind with both feet and the studs showing. That puts the other player in danger of a bad injury. A tackle that endangers a player’s safety is a red card: off.'},
 {id:'handball',answer:{whistle:true,card:'red'},who:5,T:2.8,tc:1.2,contact:{x:-392,y:44,z:196,hit:true},goal:true,
  watch:'Number 9 (white) shoots. The keeper is down.',tell:'Number 5 is not the keeper, and a raised hand stopped a sure goal.',
  actors:[
   {id:'G',num:1,kit:'keeper',keys:[K(0,-410,-170,90,'lie'),K(2.8,-410,-170,90,'lie')]},
   {id:'A',num:9,kit:'light',keys:[K(0,330,30,180,'run'),K(.4,262,26,180,'run'),K(.55,240,26,180,'kick'),K(.9,230,26,180,'stand'),K(1.7,230,26,180,'point'),K(2.8,230,26,180,'point')]},
   {id:'D',num:5,kit:'grey',keys:[K(0,-380,62,0,'stand'),K(.95,-380,62,0,'stand'),K(1.05,-380,62,0,'armUp'),K(1.6,-380,62,0,'armUp'),K(1.8,-380,62,0,'stand'),K(2.8,-380,62,0,'stand')]}],
  ball:[B(0,200,26),B(.55,200,26),B(1.2,-388,44,186),B(1.5,-330,50,80),B(1.8,-290,60,0),B(2.8,-210,74,0)],
  verdict:'Red card, and a penalty.',law:'Law 12 · stopping a goal with a hand',
  why:'The keeper was beaten and the ball was going in. Number 5 is not the goalkeeper, but stopped it with a hand. Stopping a sure goal by handball is a red card, and here it also gives a penalty kick.'},
];

export const ROUND=6;
/** Scoring constants. */
export const PLAYON_PTS=200,WHISTLE_BASE=50,WHISTLE_SPEED=50,CARD_PTS=100,EARLY=.1,FAST=.25,SLOW=1.5;
export const maxRound=(n=ROUND)=>n*200;
export const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));

/** A small seeded random (mulberry32) so a round can be replayed in a test. */
export function rng(seed:number){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
const shuffle=<T,>(xs:readonly T[],r:()=>number)=>{const a=[...xs];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
/**
 * A round of ROUND moments that covers every kind of call: one fair challenge (play on), one careless foul (free kick, no
 * card), two yellows, one red, and one more from what is left, in a shuffled order.
 */
export function makeRound(seed=Date.now()):Moment[]{
 const r=rng(seed),by=(f:(m:Moment)=>boolean)=>shuffle(MOMENTS.filter(f),r);
 const fair=by(m=>!m.answer.whistle),care=by(m=>m.answer.whistle&&m.answer.card==='none'),yel=by(m=>m.answer.card==='yellow'),red=by(m=>m.answer.card==='red');
 const pick=[fair[0],care[0],yel[0],yel[1],red[0]];
 const rest=shuffle(MOMENTS.filter(m=>!pick.includes(m)),r);pick.push(rest[0]);
 return shuffle(pick,r);
}

export type Outcome={points:number;whistlePts:number;cardPts:number;early:boolean;missed:boolean;wrongWhistle:boolean;right:boolean};
/**
 * Score a moment. `whistleAt` = film time of the whistle (null = no whistle: play ran on); `card` = the card shown (null if no
 * whistle); `timed` = false in the turn-based (reduced-motion) version, where a right whistle gets the full 100.
 */
export function judge(m:Moment,whistleAt:number|null,card:Card|null,timed=true):Outcome{
 const o:Outcome={points:0,whistlePts:0,cardPts:0,early:false,missed:false,wrongWhistle:false,right:false};
 if(!m.answer.whistle){if(whistleAt==null){o.points=PLAYON_PTS;o.right=true;}else o.wrongWhistle=true;return o;}
 if(whistleAt==null){o.missed=true;return o;}
 const dt=whistleAt-m.tc;
 if(dt< -EARLY)o.early=true;
 else o.whistlePts=WHISTLE_BASE+(timed?Math.round(WHISTLE_SPEED*(1-clamp((dt-FAST)/(SLOW-FAST),0,1))):WHISTLE_SPEED);
 if(card===m.answer.card)o.cardPts=CARD_PTS;
 o.right=!o.early&&o.cardPts>0;o.points=o.whistlePts+o.cardPts;return o;
}
export function verdictLine(right:number,total:number,early:number){
 if(right===total)return 'Every call right, at match speed. That is refereeing.';
 if(early>=2)return 'Quick whistle! But a referee waits to SEE the contact before blowing.';
 if(right>=total-2)return 'A good match, ref. Watch the feet and the force, then decide.';
 return 'Match speed is hard. Read Law 12’s three steps below, then play again.';
}
/** The traffic-light colour for a call (Ken Aston's idea: yellow means careful, red means stop; green = play on). */
export const lampOf=(c:Card|'go'):'green'|'yellow'|'red'=>c==='yellow'?'yellow':c==='red'?'red':'green';
export const callOf=(a:Answer):Call=>a.card;

// ── The film ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
const smooth=(u:number)=>u*u*(3-2*u);
function seg<T extends {t:number}>(ks:readonly T[],t:number){let i=0;while(i<ks.length-1&&t>=ks[i+1].t)i++;const k=ks[i],n=ks[Math.min(ks.length-1,i+1)];
 return {k,n,u:n===k||n.t===k.t?0:clamp((t-k.t)/(n.t-k.t),0,1)};}
const lerp=(a:number,b:number,u:number)=>a+(b-a)*u;
const lerpAngle=(a:number,b:number,u:number)=>{let d=((b-a)%360+540)%360-180;return a+d*u;};
const poseOf=(p:FPose,t:number,phase:number):Pose=>p==='run'?runAt(t,phase):POSES[p];
/** Every actor as a paper figure at film time t. Positions move linearly between keys; poses blend smoothly. */
export function actorsAt(m:Moment,t:number):Fig[]{
 return m.actors.map((a,i)=>{const {k,n,u}=seg(a.keys,t),e=smooth(u);
  return {id:a.id,x:lerp(k.x,n.x,u),y:lerp(k.y,n.y,u),h:lerpAngle(k.h,n.h,e),pose:mixPose(poseOf(k.pose,t,i*.5),poseOf(n.pose,t,i*.5),e),kit:a.kit};});
}
export function ballAt(m:Moment,t:number){const {k,n,u}=seg(m.ball,t);return {x:lerp(k.x,n.x,u),y:lerp(k.y,n.y,u),z:lerp(k.z??0,n.z??0,u)};}
/** The screen-independent box the camera frames for a moment (cm): where the action is (keys from 0.7 s on, the ball around the
 *  contact), so the run-ups may start off the card and the players are drawn as big as the card allows. */
export function frameOf(m:Moment){const xs:number[]=[m.contact.x],ys:number[]=[m.contact.y];
 for(const a of m.actors)for(const k of a.keys)if(k.t>=.7){xs.push(k.x);ys.push(k.y);}
 for(const b of m.ball)if(b.t>=.5&&b.t<=m.tc+.8){xs.push(b.x);ys.push(b.y);}
 return {x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys),cx:m.contact.x,cy:m.contact.y};}
/** Where the referee (you) stands, and Ken Aston's traffic light, for a moment. */
export const refSpot=(m:Moment,narrow=false)=>narrow?{x:m.contact.x+(m.goal?260:150),y:-190}:m.goal?{x:120,y:-300}:{x:300,y:-250};
/** On a tall (phone) card the light stands just behind the play, so it is in the picture. */
export const lightSpot=(m:Moment,narrow=false)=>narrow?{x:m.contact.x+(m.goal?120:-110),y:-330}:m.goal?{x:330,y:-360}:{x:520,y:-340};
