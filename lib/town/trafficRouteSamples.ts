import * as T from 'three';
/** Reuse arc-length positions; sharp joins retain the source curve's heading. */
export function createTrafficRouteSamples(path:T.CurvePath<T.Vector3>){
 const count=Math.max(2,Math.ceil(path.getLength()/.2)),points=new Float64Array((count+1)*3),point=new T.Vector3();
 for(let i=0;i<=count;i++){path.getPointAt(i/count,point);points.set([point.x,point.y,point.z],i*3);}
 return {sample(t:number,out:T.Vector3){const at=T.MathUtils.clamp(t,0,1)*count,i=Math.min(count-1,Math.floor(at)),f=at-i,j=i*3;return out.set(points[j]+(points[j+3]-points[j])*f,points[j+1]+(points[j+4]-points[j+1])*f,points[j+2]+(points[j+5]-points[j+2])*f);}};
}
