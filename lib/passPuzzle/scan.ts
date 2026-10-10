/**
 * "Look up" scan: the coach's read of every simple pass on the frozen pitch. For each teammate it
 * predicts the ground pass a child would draw straight to their feet and grades the lane (clear /
 * tight / blocked / offside / save). Pure and bounded: one predict() per teammate (≤ 5), run once per
 * aim when the child asks for it, and once per release for the takeaway (never per frame).
 */
import type {PuzzleWorld,StrokePoint,Vec2} from './types';
import {predict} from './world';
import {readStroke} from './stroke';
import {laneStatus,type LaneStatus} from './explain';

export type ScanLane={receiver:number;from:Vec2;to:Vec2;status:LaneStatus};

/** The straight ground pass to each teammate's feet, graded. Empty unless the world is aiming. */
export function scanLanes(world:PuzzleWorld):ScanLane[]{
  const s=world.state;if(s.phase!=='aiming')return [];
  const b=s.ball.p,out:ScanLane[]=[];
  s.attackers.forEach((a,i)=>{
    if(i===s.carrier)return;
    // The same stroke a finger draws: ball → feet, no hold (ground), no bow (no curl).
    const pts:StrokePoint[]=[{x:b.x,z:b.z,t:0},{x:(b.x+a.p.x)/2,z:(b.z+a.p.z)/2,t:.2},{x:a.p.x,z:a.p.z,t:.4}];
    let status:LaneStatus|null=null;
    try{const k=readStroke(pts,world,{mode:'ground'});if(k.kind==='shot')return;status=laneStatus(predict(world,k));}catch{status=null;}
    if(status)out.push({receiver:i,from:{x:b.x,z:b.z},to:{x:a.p.x,z:a.p.z},status});
  });
  return out;
}

/** Teammates the child could not have reached with a simple pass (for the third-man takeaway). */
export const shutLanes=(lanes:ScanLane[])=>lanes.filter(l=>l.status==='blocked'||l.status==='offside'||l.status==='save').map(l=>l.receiver);
