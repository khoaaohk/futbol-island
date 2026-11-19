import * as T from 'three';
/** Reuse arc-length positions (20 cm spacing) and headings. Headings (Nov 18 2026) are central differences of those samples, blended
 *  between neighbours: routes are tangent-continuous now (lib/graphics/streetTraffic.ts `segment`), so no source-curve lookup per
 *  frame is needed and the heading never steps. */
export function createTrafficRouteSamples(path:T.CurvePath<T.Vector3>){
 const count=Math.max(2,Math.ceil(path.getLength()/.2)),points=new Float64Array((count+1)*3),dirs=new Float64Array((count+1)*2),point=new T.Vector3();
 for(let i=0;i<=count;i++){path.getPointAt(i/count,point);points[i*3]=point.x;points[i*3+1]=point.y;points[i*3+2]=point.z;}
 for(let i=0;i<=count;i++){const a=Math.max(0,i-1)*3,b=Math.min(count,i+1)*3,x=points[b]-points[a],z=points[b+2]-points[a+2],l=Math.hypot(x,z)||1;dirs[i*2]=x/l;dirs[i*2+1]=z/l;}
 return {
  sample(t:number,out:T.Vector3){const at=T.MathUtils.clamp(t,0,1)*count,i=Math.min(count-1,Math.floor(at)),f=at-i,j=i*3;return out.set(points[j]+(points[j+3]-points[j])*f,points[j+1]+(points[j+4]-points[j+1])*f,points[j+2]+(points[j+5]-points[j+2])*f);},
  /** Unit-ish travel direction on the ground plane at `t` (x and z set, y 0). */
  tangent(t:number,out:T.Vector3){const at=T.MathUtils.clamp(t,0,1)*count,i=Math.min(count-1,Math.floor(at)),f=at-i,j=i*2;return out.set(dirs[j]+(dirs[j+2]-dirs[j])*f,0,dirs[j+1]+(dirs[j+3]-dirs[j+1])*f);},
 };
}
