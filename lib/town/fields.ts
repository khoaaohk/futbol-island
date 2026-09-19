import * as T from 'three';
import {ISLAND_SHORE,shoreSandWidth} from './shoreline';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {VENUES,FIELD_SURFACE_Y} from './venues';
import {GOAL_DEPTH,goalPostRadius} from './goalCollisions';
export function buildFormatFields(scene:T.Scene){
 const roots=new Map<string,T.Group>();const owned:(T.Material|T.BufferGeometry)[]=[];
 const cream=new T.LineBasicMaterial({color:'#f5eed5'});owned.push(cream);
 const frameMaterial=new T.MeshStandardMaterial({color:'#fff6df',roughness:.48});
 const netMaterial=new T.LineBasicMaterial({color:'#c6d4cc',transparent:true,opacity:.68});owned.push(frameMaterial,netMaterial);
 for(const v of VENUES){const root=new T.Group();root.name='venue-'+v.id;root.position.set(v.x,v.elevation??0,v.z);scene.add(root);roots.set(v.id,root);
 const material=new T.MeshStandardMaterial({color:v.surface,roughness:.94});const geom=new T.BoxGeometry(v.width+6,.14,v.length+6);owned.push(material,geom);const surface=new T.Mesh(geom,material);surface.position.y=FIELD_SURFACE_Y-.07;surface.receiveShadow=true;root.add(surface);
 const pts:number[]=[];const seg=(a:number,b:number,c:number,d:number)=>pts.push(a,.115,b,c,.115,d);const w=v.width/2,l=v.length/2;
 const rect=(x:number,z:number,width:number,length:number)=>{seg(x-width/2,z-length/2,x+width/2,z-length/2);seg(x+width/2,z-length/2,x+width/2,z+length/2);seg(x+width/2,z+length/2,x-width/2,z+length/2);seg(x-width/2,z+length/2,x-width/2,z-length/2);};
 const arc=(x:number,z:number,r:number,start=0,end=Math.PI*2)=>{for(let i=0;i<48;i++){const a=start+(end-start)*i/48,b=start+(end-start)*(i+1)/48;seg(x+Math.cos(a)*r,z+Math.sin(a)*r,x+Math.cos(b)*r,z+Math.sin(b)*r);}};
 rect(0,0,v.width,v.length);seg(-w,0,w,0);arc(0,0,v.id==='futsal'?3:v.id==='11v11'?9.15:Math.min(7,v.width*.15));
 for(const side of [-1,1]){
 if(v.id==='futsal'){const end=side*l;for(const hand of [-1,1]){const center=hand*1.5;const start=side<0?(hand<0?Math.PI/2:0):(hand<0?Math.PI:Math.PI*1.5);arc(center,end,6,start,start+Math.PI/2);}seg(-1.5,end-side*6,1.5,end-side*6);}
 else{const depth=v.id==='11v11'?16.5:v.id==='9v9'?13:10,width=v.id==='11v11'?40.32:v.id==='9v9'?29:23;rect(0,side*(l-depth/2),width,depth);rect(0,side*(l-2.5),v.goalWidth+8,5);}
 const goal=new T.Group();goal.name='goal-'+v.id+'-'+side;root.add(goal);
 const goalPts:number[]=[];const line=(a:number[],b:number[])=>goalPts.push(...a,...b);
 const gw=v.goalWidth/2,base=FIELD_SURFACE_Y,h=base+v.goalHeight,z=side*l,back=z+side*GOAL_DEPTH;
 // Solid round posts and crossbar read independently from the finer netting.
 const tubes:T.BufferGeometry[]=[];
 const tube=(a:number[],b:number[],radius:number)=>{const from=new T.Vector3(...a),to=new T.Vector3(...b),g=new T.CylinderGeometry(radius,radius,from.distanceTo(to),10);g.applyMatrix4(new T.Matrix4().compose(from.clone().add(to).multiplyScalar(.5),new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),to.sub(from).normalize()),new T.Vector3(1,1,1)));tubes.push(g);};
 const radius=goalPostRadius(v.id);
 for(const x of [-gw,gw]){
  tube([x,base,z],[x,h,z],radius);tube([x,base+.035,z],[x,base+.035,back],.035);
  tube([x,base,back],[x,h-.12,back],.035);tube([x,h,z],[x,h-.12,back],.035);
 }
 tube([-gw,h,z],[gw,h,z],radius);tube([-gw,base+.035,back],[gw,base+.035,back],.035);
 tube([-gw,h-.12,back],[gw,h-.12,back],.035);
 const frameGeo=mergeGeometries(tubes)!;tubes.forEach(g=>g.dispose());owned.push(frameGeo);
 const frame=new T.Mesh(frameGeo,frameMaterial);frame.name='solid-goal-frame';frame.castShadow=true;frame.receiveShadow=true;goal.add(frame);
 const cols=Math.ceil(v.goalWidth/.25),rows=Math.ceil(v.goalHeight/.25);
 for(let i=0;i<=cols;i++){const x=-gw+i*v.goalWidth/cols;line([x,base,back],[x,h-.12,back]);line([x,h,z],[x,h-.12,back]);}
 for(let i=0;i<=rows;i++){const y=base+i*v.goalHeight/rows;line([-gw,Math.min(y,h-.12),back],[gw,Math.min(y,h-.12),back]);for(const x of [-gw,gw])line([x,y,z],[x,Math.min(y,h-.12),back]);}
 for(const x of [-gw,gw])for(let i=1;i<6;i++){const t=i/6,zz=z+(back-z)*t;line([x,base,zz],[x,h-.12*t,zz]);}
 const netGeo=new T.BufferGeometry();netGeo.setAttribute('position',new T.Float32BufferAttribute(goalPts,3));owned.push(netGeo);const net=new T.LineSegments(netGeo,netMaterial);net.name='goal-net';goal.add(net);}

 const lineGeo=new T.BufferGeometry();lineGeo.setAttribute('position',new T.Float32BufferAttribute(pts,3));owned.push(lineGeo);root.add(new T.LineSegments(lineGeo,cream));
 }
 const outline=new T.Shape();ISLAND_SHORE.forEach((p,i)=>i?outline.lineTo(p.x,-p.z):outline.moveTo(p.x,-p.z));outline.closePath();
 const landMat=new T.MeshStandardMaterial({color:'#dfc99e',roughness:1}),landGeo=new T.ExtrudeGeometry(outline,{depth:.7,bevelEnabled:false,steps:1});owned.push(landMat,landGeo);const land=new T.Mesh(landGeo,landMat);land.name='curved-island-foundation';land.rotation.x=-Math.PI/2;land.position.y=-.82;land.receiveShadow=true;scene.add(land);

 // A continuous sand ribbon follows the coast, including the sheltered inlet.
 const sandPositions:number[]=[],sandIndices:number[]=[];
 ISLAND_SHORE.forEach((p,i)=>{const prev=ISLAND_SHORE[(i+ISLAND_SHORE.length-1)%ISLAND_SHORE.length],next=ISLAND_SHORE[(i+1)%ISLAND_SHORE.length],dx=next.x-prev.x,dz=next.z-prev.z,length=Math.hypot(dx,dz);const width=shoreSandWidth(p);
 sandPositions.push(p.x,-.105,p.z,p.x-dz/length*width,-.105,p.z+dx/length*width);
 const a=i*2,b=((i+1)%ISLAND_SHORE.length)*2;sandIndices.push(a,b,a+1,b,b+1,a+1);
 });
 const sandGeo=new T.BufferGeometry();sandGeo.setAttribute('position',new T.Float32BufferAttribute(sandPositions,3));sandGeo.setIndex(sandIndices);sandGeo.computeVertexNormals();const sandMat=new T.MeshStandardMaterial({color:'#f1d6a1',roughness:1,side:T.DoubleSide});owned.push(sandGeo,sandMat);const sand=new T.Mesh(sandGeo,sandMat);sand.name='continuous-sandy-shore';sand.receiveShadow=true;scene.add(sand);
 return {roots,dispose(){for(const root of roots.values())root.removeFromParent();land.removeFromParent();sand.removeFromParent();for(const item of owned)item.dispose();}};
}
