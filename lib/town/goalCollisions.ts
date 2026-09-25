import {VENUES,FIELD_SURFACE_Y,type Format,type Venue} from './venues';
import type {Obstacle} from './simulation';
export const GOAL_DEPTH=1.4;
export const goalPostRadius=(format:Format)=>format==='futsal'?.055:.065;
export type GoalBarrier=Obstacle&{floor:number;top:number};
/** Open front, solid side/rear netting and posts; elevation keeps rooftop goals off the street. */
export const GOAL_BARRIERS:GoalBarrier[]=VENUES.flatMap(v=>[-1,1].flatMap(side=>{
 const front=v.z+side*v.length/2,back=front+side*GOAL_DEPTH,floor=(v.elevation??0)+FIELD_SURFACE_Y,top=floor+v.goalHeight,thickness=goalPostRadius(v.id)*2;
 return [
  ...[-1,1].map(hand=>({x:v.x+hand*v.goalWidth/2,z:(front+back)/2,w:thickness,d:GOAL_DEPTH+thickness,floor,top})),
  {x:v.x,z:back,w:v.goalWidth+thickness,d:.07,floor,top}
 ];
}));
export function goalBarriersAt(height:number){return GOAL_BARRIERS.filter(b=>height+1.7>b.floor&&height<b.top);}

export type FramePoint={x:number;y:number;z:number};
export type FrameHit=FramePoint&{t:number;nx:number;ny:number;nz:number;part:'post'|'crossbar'};
const FRAME_ENDS=[-1,1] as const;
/** Swept sphere against the three round tubes. End caps include the post/bar joins. */
export function sweepGoalFrame(from:FramePoint,to:FramePoint,radius:number,out:FrameHit,venues:readonly Venue[]=VENUES){
 out.t=Infinity;
 for(const venue of venues)for(const side of FRAME_ENDS){
  const z=venue.z+side*venue.length/2,r=radius+goalPostRadius(venue.id);
  if(Math.min(from.z,to.z)>z+r||Math.max(from.z,to.z)<z-r)continue;
  const bottom=(venue.elevation??0)+FIELD_SURFACE_Y,top=bottom+venue.goalHeight,half=venue.goalWidth/2;
  if(Math.max(from.y,to.y)<bottom-r||Math.min(from.y,to.y)>top+r)continue;
  sweepTube(from,to,venue.x-half,bottom,z,venue.x-half,top,z,r,'post',out);
  sweepTube(from,to,venue.x+half,bottom,z,venue.x+half,top,z,r,'post',out);
  sweepTube(from,to,venue.x-half,top,z,venue.x+half,top,z,r,'crossbar',out);
 }
 return Number.isFinite(out.t);
}
function sweepTube(a:FramePoint,b:FramePoint,x:number,y:number,z:number,ex:number,ey:number,ez:number,r:number,part:FrameHit['part'],out:FrameHit){
 const vertical=y!==ey,length=vertical?ey-y:ex-x,dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z;
 const ux=vertical?0:1,uy=vertical?1:0,along=(a.x-x)*ux+(a.y-y)*uy,travel=dx*ux+dy*uy;
 const rx=a.x-x-ux*along,ry=a.y-y-uy*along,rz=a.z-z,vx=dx-ux*travel,vy=dy-uy*travel;
 const aa=vx*vx+vy*vy+dz*dz,bb=rx*vx+ry*vy+rz*dz,cc=rx*rx+ry*ry+rz*rz-r*r,disc=bb*bb-aa*cc;
 if(aa>1e-12&&disc>=0){const t=cc<0?0:(-bb-Math.sqrt(disc))/aa,at=along+travel*t;
  if(at>=0&&at<=length)recordFrameHit(a,dx,dy,dz,t,x+ux*at,y+uy*at,z,r,part,out);
 }
 sweepCap(a,dx,dy,dz,x,y,z,r,part,out);sweepCap(a,dx,dy,dz,ex,ey,ez,r,part,out);
}
function sweepCap(a:FramePoint,dx:number,dy:number,dz:number,x:number,y:number,z:number,r:number,part:FrameHit['part'],out:FrameHit){
 const ox=a.x-x,oy=a.y-y,oz=a.z-z,aa=dx*dx+dy*dy+dz*dz,bb=ox*dx+oy*dy+oz*dz,cc=ox*ox+oy*oy+oz*oz-r*r,disc=bb*bb-aa*cc;
 if(aa>1e-12&&disc>=0)recordFrameHit(a,dx,dy,dz,cc<0?0:(-bb-Math.sqrt(disc))/aa,x,y,z,r,part,out);
}
function recordFrameHit(a:FramePoint,dx:number,dy:number,dz:number,t:number,x:number,y:number,z:number,r:number,part:FrameHit['part'],out:FrameHit){
 if(t<0||t>1||t>=out.t)return;
 const nx=a.x+dx*t-x,ny=a.y+dy*t-y,nz=a.z+dz*t-z,n=Math.hypot(nx,ny,nz);
 if(n<1e-9||(dx*nx+dy*ny+dz*nz)>=0)return; // An existing overlap may separate.
 out.t=t;out.nx=nx/n;out.ny=ny/n;out.nz=nz/n;out.x=x+out.nx*(r+.002);out.y=y+out.ny*(r+.002);out.z=z+out.nz*(r+.002);out.part=part;
}
