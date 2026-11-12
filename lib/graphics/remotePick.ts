// Public island, tap on a player (phase 1, Nov 11 2026; docs/multiplayer-public-island-plan-2026-11-11.md): which drawn remote player a
// tap lands on. Pure maths (no three.js, no DOM), run ONLY on a tap, never per frame; tests/mp-player-tap.cjs pins it.
//
// The rule: each candidate's capsule (feet to head, BODY_H x the drawn scale) is projected to the screen; the hit box is that on-screen
// body grown by HIT_GROW (1.3x) around its centre, never smaller than MIN_PX (44 px) in either direction, so never larger than 1.6x the
// body unless the 44 px floor needs it. Only players the avatar layer drew last frame (not hidden, not leaving, not over the room cap),
// drawn at >= MIN_FADE (a stranger fading out at the far edge is not tappable), within MAX_M (30 m) of the local player and in front of
// the camera. Overlap: the one nearest the camera wins. No raycast against meshes.

/** One drawn remote (remoteAvatars.tapSpots): feet position (world), drawn scale/fade k (0..1), horizontal distance from the local player. */
export interface TapSpot{id:number;x:number;y:number;z:number;k:number;d:number}
/** A projected point: px from the canvas' left / top, and the depth (NDC z: -1 near .. 1 far; outside = behind / clipped). */
export interface ScreenPoint{x:number;y:number;z:number}
export type Project=(x:number,y:number,z:number)=>ScreenPoint;

export const MAX_M=30,MIN_PX=44,HIT_GROW=1.3,MAX_GROW=1.6,MIN_FADE=.35,BODY_H=2.1,BODY_ASPECT=.42;
/** The card points just above their name label (remoteAvatars LABEL_Y 2.62 m), so it never covers the name. */
export const ANCHOR_H=3.2;
/** The card closes once the player is further than this (m) from you. */
export const CLOSE_M=35;

/** The hit box (px) of one on-screen body from its projected feet and head: centred on the body, at least MIN_PX each way. */
export function hitBox(feet:ScreenPoint,head:ScreenPoint):{cx:number;cy:number;w:number;h:number;bodyW:number;bodyH:number}{
 const bodyH=Math.max(1,Math.hypot(head.x-feet.x,head.y-feet.y)),bodyW=bodyH*BODY_ASPECT;
 return {cx:(feet.x+head.x)/2,cy:(feet.y+head.y)/2,w:Math.max(MIN_PX,bodyW*HIT_GROW),h:Math.max(MIN_PX,bodyH*HIT_GROW),bodyW,bodyH};
}

/** The id of the player the tap (px, canvas space) clearly lands on, or null (empty ground, too far, faded, behind the camera). */
export function pickRemote(tapX:number,tapY:number,spots:readonly TapSpot[],project:Project,maxM=MAX_M):number|null{
 let best:number|null=null,bz=Infinity;
 for(let i=0;i<spots.length;i++){
  const s=spots[i];
  if(!(s.k>=MIN_FADE)||!(s.d<=maxM))continue;
  const f=project(s.x,s.y,s.z),h=project(s.x,s.y+BODY_H*Math.min(1,s.k),s.z);
  if(!(f.z>-1&&f.z<1&&h.z>-1&&h.z<1))continue;
  const b=hitBox(f,h);
  if(Math.abs(tapX-b.cx)>b.w/2||Math.abs(tapY-b.cy)>b.h/2)continue;
  if(f.z<bz){bz=f.z;best=s.id;}
 }
 return best;
}

/** Where the card points (px, canvas space): just above the name label; null when off screen. */
export function anchorFor(s:TapSpot,project:Project):{x:number;y:number}|null{
 const h=project(s.x,s.y+ANCHOR_H*Math.min(1,Math.max(s.k,MIN_FADE)),s.z);
 return h.z>-1&&h.z<1?{x:h.x,y:h.y}:null;
}

/** Konbini (owner, Nov 12 2026): the nearer thing wins. True when the tapped point of the player's body is nearer the camera than the
 *  shelf the same tap hits (`objectDepth`; both camera-space depth in m, `depthOf` = world point to that depth); no shelf hit = the
 *  player. `up` = where on the body the tap landed (0 feet .. 1 head; the camera looks down, so a head tap is nearer than a feet tap). */
export function playerNearer(s:TapSpot,depthOf:(x:number,y:number,z:number)=>number,objectDepth:number|null,up=.5):boolean{
 if(objectDepth===null)return true;
 const u=Math.min(1,Math.max(0,Number.isFinite(up)?up:.5));
 return depthOf(s.x,s.y+BODY_H*Math.min(1,s.k)*u,s.z)<objectDepth;
}
