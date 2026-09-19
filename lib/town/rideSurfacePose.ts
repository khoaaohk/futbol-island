import type {TravelMode} from './travelModes';
/** Match both wheel circles to stair surfaces; caller reuses the result. */
export function rideSurfacePose(mode:TravelMode,x:number,z:number,yaw:number,height:number,surface:(x:number,z:number)=>number,out:{height:number;pitch:number}){
 const scale=1.12,front=(mode==='scooter'?.5:.62)*scale,rear=(mode==='scooter'?-.4:-.53)*scale,radius=(mode==='scooter'?.12:mode==='bike'?.32:.24)*scale;
 const sx=Math.sin(yaw),sz=Math.cos(yaw);
 const floor=(distance:number)=>{const h=surface(x+sx*distance,z+sz*distance);return Math.abs(h-height)<=1.5?h:height;};
 const hf=floor(front),hr=floor(rear);out.pitch=Math.atan2(hr-hf,front-rear);out.height=height;
 if(hf===height&&hr===height)return out;
 const c=Math.cos(out.pitch),s=Math.sin(out.pitch);let support=-Infinity;
 for(const wheel of [rear,front]){
  const center=wheel*c+radius*s,cy=radius*c-wheel*s;
  for(let i=0;i<=16;i++){const offset=(i/8-1)*radius,bottom=cy-Math.sqrt(Math.max(0,radius*radius-offset*offset));support=Math.max(support,floor(center+offset)-bottom);}
 }
 // The scooter deck also spans the treads between its wheels.
 for(let i=0;i<=6;i++){const distance=rear+(front-rear)*i/6;support=Math.max(support,floor(distance*c)-(-distance*s+(mode==='scooter'?.13:.3)*scale));}
 out.height=support+.045;return out;
}
