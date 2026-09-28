/**
 * "Flag the offside" job: five short replays on a painted practice strip (no live match on it), judged by IFAB Law 11 (docs/island-jobs.md).
 * Pure data + maths, no three.js. Local pitch coordinates: `a` = metres past the halfway line toward the goal the attackers
 * are attacking (negative = the attackers' own half), `s` = metres in from the assistant referee's touchline.
 *
 * Law 11 (kid-simple, and what `offsideAtPass` checks): at the moment a team-mate plays the ball, a player is in an offside
 * position if they are in the opponents' half AND nearer the goal line than both the ball and the second-last opponent.
 * Level is onside. Being in an offside position is only an offence if the player then gets involved (every clip's receiver
 * plays the ball, so an offside position here always means "flag up").
 */
export type ClipTeam='att'|'def'|'gk';
export type ClipActor={team:ClipTeam;role?:'passer'|'receiver';keys:[t:number,a:number,s:number][]};
export type OffsideClip={id:string;title:string;actors:ClipActor[];pass:number;arrive:number;end:number;flag:boolean;why:string};
/** Referee practice strip on the grass south of the Coaches Centre rebound area: halfway line at x = 140, the assistant
 * referee's touchline at z = 2.8 (the far touchline 12 m north), and the attackers attack toward +x (goal line at x = 166). */
export const OFFSIDE_PITCH={halfX:140,touchZ:2.8,width:12,goalA:26,ownA:-10};
export const toWorld=(a:number,s:number)=>({x:OFFSIDE_PITCH.halfX+a,z:OFFSIDE_PITCH.touchZ-s});

const still=(a:number,s:number,end=2.9):[number,number,number][]=>[[0,a,s],[end,a,s]];
/** Defenders hold their line until the pass, then turn and chase back. */
const line=(a:number,s:number,pass=1.4):[number,number,number][]=>[[0,a,s],[pass,a,s],[2.9,a+2.5,s+.3]];
const keeper=(a=22,s=6.5):ClipActor=>({team:'gk',keys:still(a,s)});
const pass=(a0:number,a1:number):ClipActor=>({team:'att',role:'passer',keys:[[0,a0,8.5],[1.4,a1,8.5],[2.9,a1+1,8.5]]});
const run=(a0:number,a1:number,a2:number):ClipActor=>({team:'att',role:'receiver',keys:[[0,a0,5],[1.4,a1,5],[2.4,a2,5.5]]});
const back=(a:number)=>[{team:'def' as const,keys:line(a,3.2)},{team:'def' as const,keys:line(a,9.4)}];

export const OFFSIDE_CLIPS:OffsideClip[]=[
 {id:'level',title:'Replay 1 · Level',pass:1.4,arrive:2.4,end:2.9,flag:false,actors:[pass(-1,2),run(8,10,15),...back(10),keeper()],
  why:'Keep the flag down! When the pass was played, the attacker was exactly level with the second-last defender. Level is onside.'},
 {id:'beyond',title:'Replay 2 · Through ball',pass:1.4,arrive:2.4,end:2.9,flag:true,actors:[pass(0,3),run(12.5,13,17),...back(10),keeper()],
  why:'Flag up — offside! When the pass was played, the attacker was already nearer the goal line than the second-last defender (and the ball), in the other team\'s half.'},
 {id:'timed-run',title:'Replay 3 · Timed run',pass:1.4,arrive:2.4,end:2.9,flag:false,actors:[pass(-2,1),run(5.5,8.5,16),...back(10),keeper()],
  why:'Keep the flag down! Offside is judged at the moment the pass is played. The attacker was behind the defenders then — sprinting past them after the pass is a great run, not offside.'},
 {id:'own-half',title:'Replay 4 · Own half',pass:1.4,arrive:2.4,end:2.9,flag:false,actors:[pass(-6.5,-5),run(-4,-1.5,7),...back(2),keeper(20)],
  why:'Keep the flag down! The attacker was still in their own half when the pass was played, and you can never be offside in your own half.'},
 {id:'one-step',title:'Replay 5 · One step',pass:1.4,arrive:2.4,end:2.9,flag:true,actors:[pass(1,4),run(10,11,16),...back(10),keeper()],
  why:'Flag up — offside! Just one step (about a metre) past the second-last defender when the ball is played is still offside, because the attacker then played the ball.'},
];

/** Position of an actor at time t (linear between keys, held at the ends). */
export function actorAt(actor:ClipActor,t:number):{a:number;s:number}{
 const k=actor.keys;if(t<=k[0][0])return {a:k[0][1],s:k[0][2]};
 for(let i=1;i<k.length;i++)if(t<=k[i][0]){const [t0,a0,s0]=k[i-1],[t1,a1,s1]=k[i],f=(t-t0)/Math.max(1e-6,t1-t0);return {a:a0+(a1-a0)*f,s:s0+(s1-s0)*f};}
 const last=k[k.length-1];return {a:last[1],s:last[2]};
}
const byRole=(c:OffsideClip,role:'passer'|'receiver')=>c.actors.find(x=>x.role===role)!;
/** The ball sits at the passer's feet until the pass, then rolls to where the receiver will be when it arrives. */
export function ballAt(c:OffsideClip,t:number):{a:number;s:number}{
 const p=byRole(c,'passer'),r=byRole(c,'receiver');
 if(t<=c.pass){const q=actorAt(p,t);return {a:q.a+.6,s:q.s-.4};}
 const from=actorAt(p,c.pass),to=actorAt(r,c.arrive),f=Math.min(1,(t-c.pass)/(c.arrive-c.pass)),e=1-(1-f)*(1-f);
 const start={a:from.a+.6,s:from.s-.4};if(t>=c.arrive){const q=actorAt(r,t);return {a:q.a+.5,s:q.s-.3};}
 return {a:start.a+(to.a+.5-start.a)*e,s:start.s+(to.s-.3-start.s)*e};
}
/** The second-last defending player (keeper included) at time t: the offside line an assistant referee watches. */
export function secondLastDefender(c:OffsideClip,t:number){
 const depth=c.actors.filter(x=>x.team!=='att').map(x=>actorAt(x,t).a).sort((p,q)=>q-p);return depth[1]??depth[0]??0;
}
/** Law 11 at the moment of the pass: own half → onside; otherwise offside only if nearer the goal line than the ball AND the second-last opponent (level = onside). */
export function offsideAtPass(c:OffsideClip){
 const r=actorAt(byRole(c,'receiver'),c.pass),ball=ballAt(c,c.pass),lineA=secondLastDefender(c,c.pass);
 const inOpponentsHalf=r.a>0,beyondBall=r.a>ball.a,beyondLine=r.a>lineA+1e-6;
 return {offside:inOpponentsHalf&&beyondBall&&beyondLine,inOpponentsHalf,beyondBall,beyondLine,receiverA:r.a,lineA};
}
