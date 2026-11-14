/**
 * Kicking a prop with the Kick button (kick audit, Nov 13 2026, owner: "lamps and street lights need to react if the ball is kicked
 * against them ... when kicking the gashapon machine, it should shake"). The plaza flag kick (lib/town/flagKick.ts) for the rest of
 * the island's compact solids: street lamps, posts, bollards, lifebuoy stands and gashapon machines. A fresh Kick press on foot,
 * with one of them within reach in front of the player, takes the press (no shot), steps to a stance the boot reaches from, plays
 * the tree kick's `treekick` pose, and at its contact the prop gets its own kick reaction (lib/graphics/propReactions.ts hit: the
 * lamp sways and its head swings, the gashapon machine shakes and its capsules rattle) with its sound.
 * A ball shot into any of them (and into every other registered prop) reacts through the walking ball's `blocked` hook as before.
 * With the ball at the player's feet or under their control (`hasBall`), the press is always the shot (coordinator, Nov 13 2026:
 * kids must not lose shots on lamp-lined streets); the prop kick is for a player whose ball is away. The facing cone is 35°.
 * Heat: idle and between presses, one property read per frame; the target search (one 8 m grid cell block) only on a new press.
 * No allocation per frame. Reduced motion: the pose is quicker and the reaction is the gentle one (propReactions REDUCED_GAIN).
 */
import {TREE_KICK,leanFor} from './summitTreeKick';
import {WALKER_RADIUS,TRUNK_CLEARANCE} from './summitForage';
import {POSE_TIME} from './jobs/jobMoves';
import {TREE_KICK_CONTACT} from '../graphics/jobPoses';
import type {PropReactionKind,PropSpec} from '../graphics/propReactions';

/** The kinds a Kick press goes to, with each one's solid radius (its collider's half size, m). 0 = from its bounds (a gashapon
 *  cabinet). Wide or low props (signs, benches, fences, tables, planters, nets) are not Kick targets: a shot into them reacts. */
export const PROP_KICK={kinds:{lamp:.19,pole:.1,bollard:.2,lifebuoy:.1,gashapon:0} as Partial<Record<PropReactionKind,number>>,
 reach:TREE_KICK.reach,cone:35*Math.PI/180,cooldown:TREE_KICK.cooldown,
 /** The kick's speed as the reaction sees it (m/s): a firm, not full-power, hit (propReactions strength ≈ .6). */
 push:17,
 cell:8,maxRadius:.7} as const;

export type PropKickTarget={x:number;z:number;r:number;y:number;kind:PropReactionKind};
/** The Kick targets among the registered props (pure): each kind in PROP_KICK.kinds, at its bounds' centre. */
export function propKickTargets(specs:readonly PropSpec[]):PropKickTarget[]{
 const out:PropKickTarget[]=[];
 for(const s of specs){const r0=PROP_KICK.kinds[s.kind];if(r0===undefined)continue;
  const r=r0||Math.min(PROP_KICK.maxRadius,Math.min(s.max.x-s.min.x,s.max.z-s.min.z)/2);
  out.push({x:(s.min.x+s.max.x)/2,z:(s.min.z+s.max.z)/2,r,y:s.min.y+Math.min(1,(s.max.y-s.min.y)/2),kind:s.kind});}
 return out;
}
type Pt={x:number;z:number};
/** The target a Kick press from (x, z) facing `yaw` goes to (forward = (sin, cos)), or −1 (the press is the usual shot). */
export function propKickTarget(targets:readonly PropKickTarget[],near:Iterable<number>,x:number,z:number,yaw:number){
 const fx=Math.sin(yaw),fz=Math.cos(yaw),cos=Math.cos(PROP_KICK.cone);let best=-1,bd:number=PROP_KICK.reach;
 for(const k of near){const t=targets[k],dx=t.x-x,dz=t.z-z;if(Math.abs(dx)>bd+1||Math.abs(dz)>bd+1)continue;const d=Math.hypot(dx,dz),gap=d-t.r;
  if(gap>=bd||d>1e-6&&(dx*fx+dz*fz)/d<cos)continue;bd=gap;best=k;}
 return best;
}
/** Where the character stands to kick the target from bearing `a` (target → character): clear of its solid, the lean closing the gap. */
export function propKickStance(t:PropKickTarget,a:number){const dx=Math.cos(a),dz=Math.sin(a),minRoot=t.r+TRUNK_CLEARANCE+WALKER_RADIUS+.04;
 return {root:{x:t.x+dx*minRoot,z:t.z+dz*minRoot},lean:leanFor(minRoot-t.r),face:Math.atan2(-dx,-dz)};}

export type PropKickPorts={
 targets:readonly PropKickTarget[];
 /** The island's Kick press (Town's shot hold: a fresh object per press, null between) and how to take it (no shot follows). */
 pressed:()=>unknown;take:()=>void;
 /** Play the kick pose at the target (Town: jobMoves.start('treekick', …) with the stance). */
 pose:(at:Pt,how:{stand:Pt;lean:number;lead:number})=>void;
 /** The boot meets the prop: target t, the kick's direction (unit) and speed. */
 strike:(t:PropKickTarget,vx:number,vz:number)=>void;
 busy?:()=>boolean;
 /** The ball is at the player's feet or under their control: the press stays the shot. */
 hasBall?:()=>boolean;
};
export type PropKickInput={dt:number;x:number;z:number;yaw:number;onFoot:boolean;canEnter:boolean;reduced:boolean};

export function createPropKick(ports:PropKickPorts){
 const P=ports.targets,C=PROP_KICK.cell,grid=new Map<number,number[]>(),key=(cx:number,cz:number)=>(cx+2048)*4096+(cz+2048);
 P.forEach((t,i)=>{const k=key(Math.floor(t.x/C),Math.floor(t.z/C));const list=grid.get(k);if(list)list.push(i);else grid.set(k,[i]);});
 const near:number[]=[];
 let lastPress:unknown=null,clock=0;const readyAt=new Float64Array(P.length);
 const kick={k:-1,t:0,dur:0,dx:0,dz:1,struck:false};
 const stats={presses:0,kicks:0,strikes:0,searches:0};
 return {stats,
  get kicking(){return kick.k>=0;},
  get count(){return P.length;},
  /** Per frame (Town's HUD block, after the tree and flag kicks have had the press). */
  update(c:PropKickInput){
   clock+=c.dt;
   if(kick.k>=0){kick.t+=c.dt;const p=kick.t/kick.dur;
    if(!kick.struck&&p>=TREE_KICK_CONTACT){kick.struck=true;stats.strikes++;ports.strike(P[kick.k],kick.dx*PROP_KICK.push,kick.dz*PROP_KICK.push);}
    if(p>=1)kick.k=-1;}
   const h=ports.pressed();if(!h){lastPress=null;return;}if(h===lastPress)return;lastPress=h;stats.presses++;
   if(!c.onFoot||!c.canEnter||kick.k>=0||ports.busy?.()||ports.hasBall?.())return;
   near.length=0;stats.searches++;const cx=Math.floor(c.x/C),cz=Math.floor(c.z/C);
   for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const list=grid.get(key(cx+i,cz+j));if(list)for(const k of list)near.push(k);}
   const k=propKickTarget(P,near,c.x,c.z,c.yaw);if(k<0||clock<readyAt[k])return;
   ports.take();readyAt[k]=clock+PROP_KICK.cooldown;
   const t=P[k],st=propKickStance(t,Math.atan2(c.z-t.z,c.x-t.x));
   const walk=Math.hypot(st.root.x-c.x,st.root.z-c.z),lead=Math.min(TREE_KICK.maxLead,walk>.05?walk/TREE_KICK.stepSpeed:0);
   let dx=t.x-st.root.x,dz=t.z-st.root.z;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
   kick.k=k;kick.t=-lead;kick.dur=(POSE_TIME.treekick??.8)*(c.reduced?.6:1);kick.dx=dx;kick.dz=dz;kick.struck=false;stats.kicks++;
   ports.pose(t,{stand:st.root,lean:st.lean,lead});
  },
 };
}
export type PropKick=ReturnType<typeof createPropKick>;
