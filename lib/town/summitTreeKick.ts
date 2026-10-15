/**
 * Summit Isle tree kick (Oct 15 2026, user under a round tree and a beach palm: "update animation for kicking these trees and all
 * trees on the mountain island"). Pure rules: which trunk a Kick press goes to, where the character stands so the striking boot
 * meets the bark, how hard each kind sways, the per-tree cooldown, the leaves and the one-time teaching line.
 *
 * Runtime: lib/graphics/fruitTrees.ts (the kick rides on the forage runtime: the baked props' vertex-shader sway
 * (summitIsleWorld.ts SUMMIT_TREE_SWAY), the pooled jobFx particles for the leaves, the ForagePrompt note for the lesson and the
 * island's job cues for the sound: no new mesh, material, loop or audio). Pose: lib/graphics/jobPoses.ts `treekick` (played by
 * jobMoves like the forage push). Tests: tests/summit-tree-kick.cjs.
 *
 * Teaching (AGENTS.md): the first kick shows one coaching line that ties a clean strike on a trunk to striking a ball: plant the
 * standing foot beside the target and strike through the middle with the laces, not the toe.
 */
import {WALKER_RADIUS,TRUNK_CLEARANCE,type TreeSite} from './summitForage';

export const TREE_KICK={
 /** A Kick press goes to a trunk whose bark is within this many metres of the player's root... */
 reach:1.6,
 /** ...and within this angle (radians) either side of the facing; otherwise the press is the usual shot. */
 cone:1.15,
 /** The striking boot's toe forward of the character's root at contact (rig metres at height 1: jobPoses.ts treekick `fr` at
  *  TREE_KICK_CONTACT plus the boot; measured on the real rig in tests/summit-tree-kick.cjs). */
 toeReach:.65,
 /** The body may close at most this much toward the trunk (the pose's visual lean, like the push's hands-on lean). */
 maxLean:.3,
 /** Per-tree cooldown (s): mashing Kick, or a ball straight after a kick, never piles impulses. */
 cooldown:.6,
 /** Sway impulse (rad/s on the tilt about the base) per kind; palms bend more at the top through their rig's `bend`. */
 impulse:{tree:2.2,palm:1.8},// Oct 15 2026 (user, via my recommendation): raised from 1.25 / 1.05 (peak ≈ 4.7°) so the hit reads clearly on a phone
 /** Leaves per kick: round trees shed small leaf quads, palms a few narrow fronds (pooled jobFx particles). */
 leaves:{tree:4,palm:3},
 /** Walking pace of the step to the stance (Town's job step, m/s) and the longest step the kick waits for. */
 stepSpeed:3.5,maxLead:1.2,
} as const;
/** Where a kick strikes the trunk (metres over the base) and the sway's rest test (rad, rad/s). */
export const KICK_HEIGHT=.3;

/** Shown once per device (the forage note) on the first kick. Plain coaching, nothing made up. */
export const TREE_KICK_LESSON='Kick it like a laces strike: plant your standing foot beside the target and swing through the middle, not a toe poke.';
export const TREE_KICK_LESSON_KEY='fi2-tree-kick-lesson-v1';

export type KickStance={
 /** The character's root: on the bearing `a` from the trunk, clear of its collider (base radius + clearance + the walker). */
 root:{x:number;z:number};
 /** The body closes this much more toward the trunk (visual), so the toe reaches the bark. */
 lean:number;
 /** Facing (radians, Town's yaw: forward = (sin, cos)) toward the trunk. */
 face:number;
};
/** The stance for kicking `site` from bearing `a` (radians, trunk → character): the root just clear of the trunk's collider and the
 *  lean that puts the striking toe on the bark. */
export function kickStance(site:Pick<TreeSite,'x'|'z'|'rig'>,a:number):KickStance{
 const dx=Math.cos(a),dz=Math.sin(a),r=site.rig.baseR,minRoot=r+TRUNK_CLEARANCE+WALKER_RADIUS+.04;
 return {root:{x:site.x+dx*minRoot,z:site.z+dz*minRoot},lean:leanFor(minRoot-r),face:Math.atan2(-dx,-dz)};
}
/** The lean (m) that closes a `gap` (root to bark) for the striking toe, within TREE_KICK.maxLean. */
export const leanFor=(gap:number)=>Math.max(0,Math.min(TREE_KICK.maxLean,gap-TREE_KICK.toeReach));
/** The trunk a Kick press from (x, z) facing `yaw` goes to: the nearest bark within TREE_KICK.reach inside the facing cone, or
 *  null (the press is a normal shot). Called on a press only, never per frame. */
export function kickTarget<S extends Pick<TreeSite,'x'|'z'|'rig'>>(sites:readonly S[],x:number,z:number,yaw:number):S|null{
 const fx=Math.sin(yaw),fz=Math.cos(yaw),cos=Math.cos(TREE_KICK.cone);let best:S|null=null,bd:number=TREE_KICK.reach;
 for(const s of sites){const dx=s.x-x,dz=s.z-z;if(Math.abs(dx)>bd+1||Math.abs(dz)>bd+1)continue;const d=Math.hypot(dx,dz),bark=d-s.rig.baseR;
  if(bark>=bd||d>1e-6&&(dx*fx+dz*fz)/d<cos)continue;bd=bark;best=s;}
 return best;
}
/** The leaf burst of a kick on this site: colour, count, speed, lift and size for jobFx.burst (fronds for palms, bananas and papayas). */
export function kickLeaves(site:Pick<TreeSite,'kind'|'rig'>){
 const frond=site.kind==='palm'||site.rig.crown.hang==='under';
 return frond?{color:'#5b895e',count:TREE_KICK.leaves.palm,speed:1.2,up:.3,size:2.2}:{color:'#6f9a55',count:TREE_KICK.leaves.tree,speed:1.5,up:.5,size:1.5};
}
