import * as T from 'three';
/** Reusable clipping buffers: one field projection creates no temporary geometry. */
export function createPitchVisibility(){
 const a=Array.from({length:12},()=>new T.Vector3()),b=Array.from({length:12},()=>new T.Vector3());
 return (camera:T.Camera,x:number,y:number,z:number,width:number,length:number)=>{
  a[0].set(x-width/2,y,z-length/2).project(camera);a[1].set(x+width/2,y,z-length/2).project(camera);a[2].set(x+width/2,y,z+length/2).project(camera);a[3].set(x-width/2,y,z+length/2).project(camera);
  for(let i=0;i<4;i++)if(a[i].z<=-1||a[i].z>=1)return Infinity;
  let input=a,output=b,count=4;
  for(let plane=0;plane<4;plane++){let next=0;const axis=plane<2?'x':'y',sign=plane%2?-1:1;
   for(let i=0;i<count;i++){const p=input[i],q=input[(i+1)%count],dp=1-sign*p[axis],dq=1-sign*q[axis];if(dp>=0)output[next++].copy(p);if((dp>=0)!==(dq>=0))output[next++].copy(p).lerp(q,dp/(dp-dq));}
   const swap=input;input=output;output=swap;count=next;if(count<3)return Infinity;
  }
  let sx=0,sy=0;for(let i=0;i<count;i++){sx+=input[i].x;sy+=input[i].y;}return Math.hypot(sx/count,sy/count);
 };
}
