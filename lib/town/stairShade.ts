import * as T from 'three';
/** Leftovers A2 (owner shot 206, Nov 27 2026: "fix these stairs. looks like there are no lines and flat"): a stair block's own baked
 *  shading, as a per-vertex rgb multiplier for world.ts's batch bake (`userData.vertexTint`): no triangle, texture, material or draw.
 *  From the high play camera every tread top was one flat plane. Each tread now runs from a lighter nosing (its downhill edge) to a
 *  darker back (the soft shadow under the step above), and the riser it stands on is shaded; a small per-tread value jitter reads as
 *  separate stones. `dx, dz`: the flight's DOWNHILL direction in the geometry's own (unrotated) frame; `seed`: the tread's index. */
export const STAIR_SHADE={nosing:1.17,back:.76,riser:.66,riserFoot:.5,backFace:.86,jitter:.06} as const;
export function stairTint(g:T.BufferGeometry,dx:number,dz:number,seed=0):Float32Array{
 const P=g.getAttribute('position'),N=g.getAttribute('normal'),n=P.count,out=new Float32Array(n*3);
 g.computeBoundingBox();const b=g.boundingBox!,y0=b.min.y,y1=b.max.y;
 let lo=Infinity,hi=-Infinity;for(let i=0;i<n;i++){const a=P.getX(i)*dx+P.getZ(i)*dz;if(a<lo)lo=a;if(a>hi)hi=a;}
 const span=Math.max(1e-4,hi-lo),j=1+STAIR_SHADE.jitter*(((Math.sin(seed*12.9898+4.1)*43758.5453)%1+1)%1-.5)*2;
 for(let i=0;i<n;i++){const ny=N.getY(i),nf=N.getX(i)*dx+N.getZ(i)*dz;let f=1;
  if(ny>.5){const u=(P.getX(i)*dx+P.getZ(i)*dz-lo)/span;f=(STAIR_SHADE.back+(STAIR_SHADE.nosing-STAIR_SHADE.back)*u)*j;}
  else if(nf>.5){const u=y1-y0>.3?Math.min(1,(y1-P.getY(i))/.3):0;f=STAIR_SHADE.riser+(STAIR_SHADE.riserFoot-STAIR_SHADE.riser)*u;}// darker 0.3 m down: the face under the nosing
  else if(nf<-.5)f=STAIR_SHADE.backFace;
  out[i*3]=f;out[i*3+1]=f;out[i*3+2]=f*.98;}
 return out;
}
