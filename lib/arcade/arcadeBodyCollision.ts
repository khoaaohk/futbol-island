export type ArcadeBody={x:number;z:number};
export const ARCADE_BODY_SPACING=.84;
/** Resolve penetration along the contact normal, retaining tangential movement. */
export function separateArcadeBody(body:ArcadeBody,other:ArcadeBody){
 const dx=body.x-other.x,dz=body.z-other.z,d=Math.hypot(dx,dz);
 if(d>=ARCADE_BODY_SPACING)return false;
 const nx=d>.0001?dx/d:1,nz=d>.0001?dz/d:0;
 body.x=other.x+nx*ARCADE_BODY_SPACING;body.z=other.z+nz*ARCADE_BODY_SPACING;
 return true;
}
/** Nov 17 2026: a walk-to spot in front of a cabinet that no body blocks. A visitor playing a cabinet stands 0.7 m to one side of
 *  its centre, closer than the spacing, so a walk to the centre stopped short against them and never arrived. Slides the spot along
 *  the cabinet's front (lx, lz: unit lateral axis) to the nearest free place, writing it into `out`; keeps the centre if none is free. */
export function arcadeFreeSpot(bx:number,bz:number,lx:number,lz:number,people:readonly ArcadeBody[],out:ArcadeBody){
 for(const off of [0,.3,-.3,.55,-.55,.8,-.8]){const px=bx+lx*off,pz=bz+lz*off;let free=true;for(const o of people)if(Math.hypot(px-o.x,pz-o.z)<ARCADE_BODY_SPACING+.06){free=false;break;}
  if(free){out.x=px;out.z=pz;return true;}}
 out.x=bx;out.z=bz;return false;
}
/** A body stopped in the way of a walk (within reach, ahead of the walker): a waypoint that steps round it on the side the walker
 *  already leans to, a little past it. Null when nothing blocks or `allow` is false. */
export function arcadeDetour(x:number,z:number,target:ArcadeBody,people:readonly ArcadeBody[],allow=true):ArcadeBody|null{
 if(!allow)return null;const tx=target.x-x,tz=target.z-z,tl=Math.hypot(tx,tz);if(tl<.2)return null;const dx=tx/tl,dz=tz/tl;
 let best:ArcadeBody|null=null,bd=ARCADE_BODY_SPACING+.25;for(const o of people){const ox=o.x-x,oz=o.z-z,d=Math.hypot(ox,oz);if(d<bd&&ox*dx+oz*dz>0){bd=d;best=o;}}
 if(!best)return null;const px=-dz,pz=dx,side=((x-best.x)*px+(z-best.z)*pz)>=0?1:-1;
 return{x:best.x+px*side*(ARCADE_BODY_SPACING+.3)+dx*.5,z:best.z+pz*side*(ARCADE_BODY_SPACING+.3)+dz*.5};
}
