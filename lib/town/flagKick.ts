/**
 * Kicking a plaza flag pole (Nov 13 2026, owner N1): the island's Kick action at a prop, like the Summit Isle tree kick
 * (lib/town/summitTreeKick.ts). A fresh Kick press on foot with a pole within reach in front of the player takes the press (no
 * shot), steps to a stance the boot reaches from, plays the same `treekick` job pose, and at its contact the flag gets its own
 * animation (plazaFlags.ts kickFlag: the pole shakes hard and the cloth whips, then settles) plus the island's 'clank' cue.
 * Heat: off the plaza, one box test per frame; on it, one property read per frame and the pole search only on a press.
 * No allocation per frame (one stance object per kick). Reduced motion: the gentle version (plazaFlags.ts FLAG_KICK.reduced).
 */
import {TREE_KICK,leanFor} from './summitTreeKick';
import {WALKER_RADIUS,TRUNK_CLEARANCE} from './summitForage';
import {POSE_TIME} from './jobs/jobMoves';
import {TREE_KICK_CONTACT} from '../graphics/jobPoses';

/** The pole's collider half-size (westPark.ts: 0.3 × 0.3 box) as the "bark" radius; reach and cone as the tree kick. */
export const FLAG_POLE_KICK={poleR:.15,reach:TREE_KICK.reach,cone:TREE_KICK.cone,cooldown:TREE_KICK.cooldown,area:3} as const;
type Pt={x:number;z:number};
/** The pole a Kick press from (x, z) facing `yaw` goes to (forward = (sin, cos)), or −1 (the press is the usual shot). */
export function flagKickTarget(poles:readonly Pt[],x:number,z:number,yaw:number){
 const fx=Math.sin(yaw),fz=Math.cos(yaw),cos=Math.cos(FLAG_POLE_KICK.cone);let best=-1,bd:number=FLAG_POLE_KICK.reach;
 for(let k=0;k<poles.length;k++){const dx=poles[k].x-x,dz=poles[k].z-z;if(Math.abs(dx)>bd+1||Math.abs(dz)>bd+1)continue;const d=Math.hypot(dx,dz),gap=d-FLAG_POLE_KICK.poleR;
  if(gap>=bd||d>1e-6&&(dx*fx+dz*fz)/d<cos)continue;bd=gap;best=k;}
 return best;
}
/** Where the character stands to kick the pole from bearing `a` (pole → character): clear of its collider, the lean closing the gap. */
export function flagKickStance(pole:Pt,a:number){const dx=Math.cos(a),dz=Math.sin(a),r=FLAG_POLE_KICK.poleR,minRoot=r+TRUNK_CLEARANCE+WALKER_RADIUS+.04;
 return {root:{x:pole.x+dx*minRoot,z:pole.z+dz*minRoot},lean:leanFor(minRoot-r),face:Math.atan2(-dx,-dz)};}

export type FlagKickPorts={
 poles:readonly Pt[];
 /** The island's Kick press (Town's shot hold: a fresh object per press, null between) and how to take it (no shot follows). */
 pressed:()=>unknown;take:()=>void;
 /** Play the kick pose at the pole (Town: jobMoves.start('treekick', …) with the stance). */
 pose:(pole:Pt,how:{stand:Pt;lean:number;lead:number})=>void;
 /** The boot meets the pole: flag k, the kick's direction. */
 strike:(k:number,dx:number,dz:number)=>void;
 busy?:()=>boolean;
};
export type FlagKickInput={dt:number;x:number;z:number;yaw:number;onFoot:boolean;canEnter:boolean;reduced:boolean};

export function createFlagKick(ports:FlagKickPorts){
 const P=ports.poles,A=FLAG_POLE_KICK.area,xs=P.map(p=>p.x),zs=P.map(p=>p.z);
 const box={x0:Math.min(...xs)-A,x1:Math.max(...xs)+A,z0:Math.min(...zs)-A,z1:Math.max(...zs)+A};
 let lastPress:unknown=null,clock=0;const readyAt=new Float64Array(P.length);
 const kick={k:-1,t:0,dur:0,dx:0,dz:1,struck:false};
 const stats={presses:0,kicks:0,strikes:0,idle:0};
 return {stats,
  get kicking(){return kick.k>=0;},
  /** Per frame (Town's HUD block). */
  update(c:FlagKickInput){
   clock+=c.dt;
   if(kick.k>=0){kick.t+=c.dt;const p=kick.t/kick.dur;
    if(!kick.struck&&p>=TREE_KICK_CONTACT){kick.struck=true;stats.strikes++;ports.strike(kick.k,kick.dx,kick.dz);}
    if(p>=1)kick.k=-1;}
   if(c.x<box.x0||c.x>box.x1||c.z<box.z0||c.z>box.z1){lastPress=ports.pressed();stats.idle++;return;}// a press held walking in is not a new one
   const h=ports.pressed();if(!h){lastPress=null;return;}if(h===lastPress)return;lastPress=h;stats.presses++;
   if(!c.onFoot||!c.canEnter||kick.k>=0||ports.busy?.())return;
   const k=flagKickTarget(P,c.x,c.z,c.yaw);if(k<0||clock<readyAt[k])return;
   ports.take();readyAt[k]=clock+FLAG_POLE_KICK.cooldown;
   const pole=P[k],st=flagKickStance(pole,Math.atan2(c.z-pole.z,c.x-pole.x));
   const walk=Math.hypot(st.root.x-c.x,st.root.z-c.z),lead=Math.min(TREE_KICK.maxLead,walk>.05?walk/TREE_KICK.stepSpeed:0);
   let dx=pole.x-st.root.x,dz=pole.z-st.root.z;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
   kick.k=k;kick.t=-lead;kick.dur=(POSE_TIME.treekick??.8)*(c.reduced?.6:1);kick.dx=dx;kick.dz=dz;kick.struck=false;stats.kicks++;
   ports.pose(pole,{stand:st.root,lean:st.lean,lead});
  },
 };
}
export type FlagKick=ReturnType<typeof createFlagKick>;
