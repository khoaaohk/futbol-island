import * as T from 'three';

/** A single reusable triangle buffer makes field markings legible on mobile. */
export function createTeachingGround(){
 const geometry=new T.BufferGeometry(),positions=new T.Float32BufferAttribute(new Float32Array(49152),3),colors=new T.Float32BufferAttribute(new Float32Array(49152),3);
 geometry.setAttribute('position',positions);geometry.setAttribute('color',colors);positions.setUsage(T.DynamicDrawUsage);colors.setUsage(T.DynamicDrawUsage);
 const material=new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.8,depthWrite:false,side:T.DoubleSide,toneMapped:false});
 const mesh=new T.Mesh(geometry,material);mesh.name='teaching-ground-markings';mesh.frustumCulled=false;let count=0,widthScale=1;
 function triangle(a:T.Vector3,b:T.Vector3,c:T.Vector3,color:number[]){if(count+9>positions.array.length)return;positions.array.set([a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z],count);colors.array.set([...color,...color,...color],count);count+=9;}
 function line(a:T.Vector3,b:T.Vector3,color:number[],width=.16){width*=widthScale;const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);if(len<.001)return;const x=-dz/len*width*.5,z=dx/len*width*.5;const aa=new T.Vector3(a.x+x,a.y,a.z+z),ab=new T.Vector3(a.x-x,a.y,a.z-z),ba=new T.Vector3(b.x+x,b.y,b.z+z),bb=new T.Vector3(b.x-x,b.y,b.z-z);triangle(aa,ab,ba,color);triangle(ab,bb,ba,color);}
 function arrow(a:T.Vector3,b:T.Vector3,color:number[],size=.65){const d=b.clone().sub(a);d.y=0;if(d.length()<.01)return;d.normalize();const side=new T.Vector3(-d.z,0,d.x).multiplyScalar(Math.max(size*.45,.2*widthScale)),base=b.clone().addScaledVector(d,-size);triangle(b,base.clone().add(side),base.clone().sub(side),color);}
 function dashedLine(a:T.Vector3,b:T.Vector3,color:number[],width=.14){const length=a.distanceTo(b);for(let d=0;d<length;d+=1.1)line(a.clone().lerp(b,d/length),a.clone().lerp(b,Math.min(length,d+.65)/length),color,width);}
 function outline(center:T.Vector3,rx:number,rz:number,color:number[],rect=false){let previous=new T.Vector3(center.x+rx,center.y,center.z);if(rect){const p=[[-rx,-rz],[rx,-rz],[rx,rz],[-rx,rz]].map(([x,z])=>new T.Vector3(center.x+x,center.y,center.z+z));for(let i=0;i<4;i++)line(p[i],p[(i+1)%4],color,.14);}else for(let i=1;i<=32;i++){const a=i/32*Math.PI*2,next=new T.Vector3(center.x+Math.cos(a)*rx,center.y,center.z+Math.sin(a)*rz);line(previous,next,color,.13);previous=next;}}
 return {mesh,line,dashedLine,arrow,outline,setWidthScale(value:number){widthScale=T.MathUtils.clamp(value,1,3.5);},reset(){count=0;widthScale=1;},finish(){geometry.setDrawRange(0,count/3);positions.needsUpdate=true;colors.needsUpdate=true;},dispose(){geometry.dispose();material.dispose();mesh.removeFromParent();}};
}

export type TeachingHitArea={answer:number;at:T.Vector3;from?:T.Vector3;rx:number;rz:number;rect?:boolean};
export function teachingAreaContains(area:TeachingHitArea,p:T.Vector3){const x=(p.x-area.at.x)/area.rx,z=(p.z-area.at.z)/area.rz;return area.rect?Math.abs(x)<=1&&Math.abs(z)<=1:x*x+z*z<=1;}
