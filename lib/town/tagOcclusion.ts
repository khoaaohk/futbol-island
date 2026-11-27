// Name tags behind solid structures (owner, Nov 26 2026, shot 139: "Drip · LET'S TALK" drew on top of the stadium's big screen
// while the townsperson stood behind it). Island name tags draw with depthTest off (so they read over train cars and the café
// awning, shots 82 / 87), which also put them through anything solid. Now the ONE shown tag is hidden while the line from its
// anchor (the tag's centre) to the camera passes through a big solid: a building's block, the stadium's big screen (frame and
// back), its stands' back and end walls, its roofs (slab, fascia, front frame) and the gate. Small or see-through pieces (rails,
// umbrellas, lamp posts, awnings, train cars) never hide a tag, and a solid that holds the anchor or the camera is skipped, so a
// shopkeeper under their own roof or a camera tucked into a wall keeps the tag.
// Cost: the solid list is built once (buildings + ~70 stadium boxes); one segment test per solid with a cheap bounds reject first,
// only for the shown tag, at most ~8 times a second (TAG_OCCLUSION.interval). No allocation per check.
import {stadiumFlightSolids,type FlightSolid,type FlightSolidKind} from './stadiumFlight';

/** An oriented box: centre (x, z), half sizes hw along (c, s) and hd along (−s, c), world heights y0..y1. */
export type TagSolid={x:number;z:number;hw:number;hd:number;c:number;s:number;y0:number;y1:number;reach:number;kind:string};
export const TAG_OCCLUSION={interval:.12} as const;
/** The stadium's pieces that hide a tag: the big ones (no posts, masts, flags or lamp heads: thin, the tag reads past them). */
export const TAG_STADIUM_KINDS:readonly FlightSolidKind[]=['screen','stand','standEnd','roof','fascia','gate','sign'];

const fromFlight=(q:FlightSolid):TagSolid=>({x:q.x,z:q.z,hw:q.hw,hd:q.hd,c:q.c,s:q.s,y0:q.y0,y1:q.y1,reach:q.reach,kind:'stadium-'+q.kind});
/** The occluders: every building block (axis aligned, ground to its roof) and the stadium's solid structure. */
export function tagOccluderSolids(buildings:readonly {x:number;z:number;w:number;d:number;height:number;name?:string}[]):TagSolid[]{
 const out:TagSolid[]=buildings.filter(b=>b.height>2.5&&b.w>1.5&&b.d>1.5).map(b=>({x:b.x,z:b.z,hw:b.w/2,hd:b.d/2,c:1,s:0,y0:0,y1:b.height,reach:Math.hypot(b.w,b.d)/2,kind:'building:'+(b.name??'')}));
 for(const q of stadiumFlightSolids())if(!q.round&&TAG_STADIUM_KINDS.includes(q.kind))out.push(fromFlight(q));
 return out;
}

const insideSolid=(x:number,y:number,z:number,q:TagSolid)=>{if(y<q.y0||y>q.y1)return false;const dx=x-q.x,dz=z-q.z;
 return Math.abs(dx*q.c+dz*q.s)<=q.hw&&Math.abs(-dx*q.s+dz*q.c)<=q.hd;};
/** Segment a → b against an oriented box (slab test in the box's own frame). */
export function segmentHitsSolid(ax:number,ay:number,az:number,bx:number,by:number,bz:number,q:TagSolid){
 const ox=ax-q.x,oz=az-q.z,dx=bx-ax,dz=bz-az;
 const u0=ox*q.c+oz*q.s,du=dx*q.c+dz*q.s,v0=-ox*q.s+oz*q.c,dv=-dx*q.s+dz*q.c;
 let t0=0,t1=1;
 const slab=(a:number,d:number,lo:number,hi:number)=>{if(Math.abs(d)<1e-9)return a>=lo&&a<=hi;let p=(lo-a)/d,r=(hi-a)/d;if(p>r){const t=p;p=r;r=t;}
  if(p>t0)t0=p;if(r<t1)t1=r;return t0<=t1;};
 return slab(u0,du,-q.hw,q.hw)&&slab(v0,dv,-q.hd,q.hd)&&slab(ay,by-ay,q.y0,q.y1);
}
/** Is the line from the tag anchor (a) to the camera (c) blocked? Solids holding either end are skipped. */
export function tagBlocked(solids:readonly TagSolid[],ax:number,ay:number,az:number,cx:number,cy:number,cz:number){
 const x0=Math.min(ax,cx),x1=Math.max(ax,cx),z0=Math.min(az,cz),z1=Math.max(az,cz),y0=Math.min(ay,cy),y1=Math.max(ay,cy);
 for(const q of solids){
  if(q.x+q.reach<x0||q.x-q.reach>x1||q.z+q.reach<z0||q.z-q.reach>z1||q.y1<y0||q.y0>y1)continue;
  if(!segmentHitsSolid(ax,ay,az,cx,cy,cz,q))continue;
  if(insideSolid(ax,ay,az,q)||insideSolid(cx,cy,cz,q))continue;
  return true;
 }
 return false;
}

/** Throttled check for the one shown tag: re-tests every TAG_OCCLUSION.interval s, or at once when the tagged townsperson changes. */
export function createTagOcclusion(solids:readonly TagSolid[],interval:number=TAG_OCCLUSION.interval){
 let wait=0,owner:unknown=null,hidden=false;
 return {
  solids,
  get hidden(){return hidden;},
  update(dt:number,who:unknown,ax:number,ay:number,az:number,cx:number,cy:number,cz:number){
   wait-=dt;if(who===owner&&wait>0)return hidden;
   owner=who;wait=interval;hidden=tagBlocked(solids,ax,ay,az,cx,cy,cz);return hidden;
  },
 };
}
