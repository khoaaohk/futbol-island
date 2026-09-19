import * as T from 'three';
import type {RideRamp} from '../town/rideRamps';
export function createRideRampVisuals(ramps:RideRamp[]){
 const root=new T.Group();root.name='ride-boost-ramps';const geometries:T.BufferGeometry[]=[],materials:T.Material[]=[];const bursts:{id:string;ramp:RideRamp;rings:T.Mesh<T.TorusGeometry,T.MeshBasicMaterial>[]}[]=[];
 const wood=new T.MeshStandardMaterial({color:'#bd8958',roughness:.9}),edge=new T.MeshStandardMaterial({color:'#294f43',roughness:.8});materials.push(wood,edge);
 for(const r of ramps){const group=new T.Group();group.name=r.id;group.position.set(r.x,(r.base??0)+.025,r.z);group.rotation.y=r.yaw;root.add(group);
 const shape=new T.Shape();shape.moveTo(0,0);shape.lineTo(r.length,0);shape.lineTo(r.length,r.height);shape.closePath();const wedge=new T.ExtrudeGeometry(shape,{depth:r.width,bevelEnabled:false});wedge.rotateY(-Math.PI/2);wedge.translate(r.width/2,0,0);geometries.push(wedge);const body=new T.Mesh(wedge,wood);body.castShadow=true;body.receiveShadow=true;group.add(body);
 const mat=new T.MeshStandardMaterial({color:'#39776c',roughness:.8});materials.push(mat);const g=new T.PlaneGeometry(r.width-.15,Math.hypot(r.length,r.height));geometries.push(g);const top=new T.Mesh(g,mat);top.position.set(0,r.height/2+.014,r.length/2);top.rotation.x=-Math.PI/2-Math.atan2(r.height,r.length);top.receiveShadow=true;group.add(top);
 for(const side of [-1,1]){const railGeo=new T.BoxGeometry(.1,.09,Math.hypot(r.length,r.height));geometries.push(railGeo);const rail=new T.Mesh(railGeo,edge);rail.position.set(side*(r.width/2-.03),r.height/2+.035,r.length/2);rail.rotation.x=-Math.atan2(r.height,r.length);group.add(rail);}
 if(r.cannon){const rings=[];for(let i=0;i<3;i++){const g=new T.TorusGeometry(.65,.075,5,20),m=new T.MeshBasicMaterial({color:i===1?'#fff4c6':'#a6ead4',transparent:true,opacity:0,depthWrite:false});geometries.push(g);materials.push(m);const ring=new T.Mesh(g,m);ring.visible=false;group.add(ring);rings.push(ring);}bursts.push({id:r.id,ramp:r,rings});}
 }
 return {root,update(state:{phase:string;age:number;ramp:RideRamp|null},reduced:boolean){for(const burst of bursts)for(const [i,ring]of burst.rings.entries()){const t=state.age-i*.065;ring.visible=!reduced&&state.ramp?.id===burst.id&&state.phase==='air'&&t>=0&&t<.65;if(ring.visible){ring.position.set(0,burst.ramp.height+.65+t*3,burst.ramp.length+t*8);ring.scale.setScalar(.65+t*3);ring.material.opacity=(1-t/.65)*.75;}}},dispose(){root.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
