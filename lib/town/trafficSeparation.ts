export type VehicleFootprint={x:number;z:number;yaw:number;width:number;length:number};
/** Positive separating-axis overlap means padded oriented footprints intersect. */
export function vehicleOverlap(a:VehicleFootprint,b:VehicleFootprint){
 const ax=Math.cos(a.yaw),az=-Math.sin(a.yaw),bx=Math.cos(b.yaw),bz=-Math.sin(b.yaw),dx=b.x-a.x,dz=b.z-a.z;
 let depth=Infinity;
 for(let i=0;i<4;i++){const x=i===0?ax:i===1?-az:i===2?bx:-bz,z=i===0?az:i===1?ax:i===2?bz:bx;
  const ar=Math.abs(x*ax+z*az)*(a.width/2+.1)+Math.abs(-x*az+z*ax)*(a.length/2+.1),br=Math.abs(x*bx+z*bz)*(b.width/2+.1)+Math.abs(-x*bz+z*bx)*(b.length/2+.1),overlap=ar+br-Math.abs(dx*x+dz*z);
  if(overlap<=0)return 0;depth=Math.min(depth,overlap);
 }return depth;
}
/** Existing overlaps can separate, but cannot deepen or move through the other car. */
export function canSeparateVehicle(current:VehicleFootprint,next:VehicleFootprint,other:VehicleFootprint){
 const after=vehicleOverlap(next,other);if(after===0)return true;
 const before=vehicleOverlap(current,other);if(before===0||after>before+1e-6)return false;
 const oldDistance=(current.x-other.x)**2+(current.z-other.z)**2,newDistance=(next.x-other.x)**2+(next.z-other.z)**2;
 return newDistance>oldDistance+1e-8;
}
