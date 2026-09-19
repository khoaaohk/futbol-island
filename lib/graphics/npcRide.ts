import * as T from 'three';
import {createVehicle} from './vehicle';
import {DEFAULT_CUSTOMIZATION} from '../town/customization';
export function createNpcRide(kind:'skateboard'|'scooter',id:string){
 const vehicle=kind==='scooter'?createVehicle():null,root=vehicle?.root??new T.Group();root.name='npc-'+kind+'-'+id;
 const geometry:T.BufferGeometry[]=[],materials:T.Material[]=[];
 if(vehicle){vehicle.setCustomization({...DEFAULT_CUSTOMIZATION,scooter:'coast'});vehicle.update('scooter',0,0,0,0,0);}
 else{const deck=new T.MeshStandardMaterial({color:'#b277b0',roughness:.7}),wheel=new T.MeshStandardMaterial({color:'#e9c47b'});materials.push(deck,wheel);const g=new T.BoxGeometry(.32,.075,.92);geometry.push(g);const mesh=new T.Mesh(g,deck);mesh.position.y=.16;root.add(mesh);
  const w=new T.CylinderGeometry(.065,.065,.09,10);geometry.push(w);for(const x of [-.18,.18])for(const z of [-.3,.3]){const m=new T.Mesh(w,wheel);m.rotation.z=Math.PI/2;m.position.set(x,.075,z);root.add(m);}
 }
 root.traverse(o=>{o.userData.npcId=id;if(o instanceof T.Mesh)o.castShadow=true;});
 root.visible=false;
 return {root,update(x:number,y:number,z:number,yaw:number,dt:number,speed:number,visible:boolean){vehicle?.update('scooter',x,z,yaw,dt,speed);root.position.set(x,y,z);root.rotation.y=yaw;root.visible=visible;},dispose(){if(vehicle)vehicle.dispose();else{root.removeFromParent();geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}}};
}
