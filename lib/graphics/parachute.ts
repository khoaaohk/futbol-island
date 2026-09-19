import * as T from 'three';
export function createParachute(){
 const root=new T.Group();root.name='player-parachute';const canopy=new T.Group();root.add(canopy);
 const green=new T.MeshStandardMaterial({color:'#4bdaac',side:T.DoubleSide,roughness:.7,transparent:true}),blue=new T.MeshStandardMaterial({color:'#4baae8',side:T.DoubleSide,roughness:.7,transparent:true}),dark=new T.MeshStandardMaterial({color:'#31524e'}),ropeMaterial=new T.LineBasicMaterial({color:'#f3eed7'}),geometries:T.BufferGeometry[]=[];
 for(let i=0;i<8;i++){const geometry=new T.SphereGeometry(2.5,6,8,i*Math.PI/4,Math.PI/4,0,Math.PI/2);geometries.push(geometry);const mesh=new T.Mesh(geometry,i%2?green:blue);mesh.scale.y=.48;mesh.position.y=5.2;mesh.castShadow=true;canopy.add(mesh);}
 for(const x of [-1,1])for(const z of [-1,1]){const geometry=new T.BufferGeometry().setFromPoints([new T.Vector3(x*.32,1.6,z*.12),new T.Vector3(x*1.65,5.2,z*1.65)]);geometries.push(geometry);canopy.add(new T.Line(geometry,ropeMaterial));}
 const pack=new T.Group();pack.name='discarded-jetpack';
 const cylinder=new T.CylinderGeometry(.17,.2,.7,8);geometries.push(cylinder);for(const x of [-.25,.25]){const mesh=new T.Mesh(cylinder,dark);mesh.position.x=x;pack.add(mesh);}root.add(pack);
 let wasOpen=false,dropAge=0,coverAge=2,detached=false,detachedAge=0,releaseYaw=0;const drop=new T.Vector3(),landing=new T.Vector3();
 const handLocal=new T.Vector3();
 return {root,attachHands(left:T.Vector3,right:T.Vector3){
  if(!wasOpen)return;canopy.updateWorldMatrix(true,false);const width=(canopy.children[0] as T.Mesh).scale.x;let i=0;
  for(const child of canopy.children){if(!(child instanceof T.Line))continue;const side=i<2?-1:1,z=i%2===0?-1:1;handLocal.copy(side<0?left:right);canopy.worldToLocal(handLocal);const positions=child.geometry.getAttribute('position') as T.BufferAttribute;positions.setXYZ(0,handLocal.x,handLocal.y,handLocal.z);positions.setXYZ(1,side*Math.SQRT1_2*2.5*width,5.2,z*Math.SQRT1_2*2.5*width);positions.needsUpdate=true;child.geometry.computeBoundingSphere();i++;}
 },covering:()=>coverAge<.65,update(x:number,y:number,z:number,yaw:number,open:boolean,age:number,dt:number,floor:number,reduced:boolean,cut=false){
  if(!open&&!wasOpen&&(detached?detachedAge:coverAge)>=1.5){canopy.visible=false;pack.visible=false;return;}
  if(open&&!wasOpen){drop.set(x,y+1,z);dropAge=0;coverAge=2;detached=false;}
  if(wasOpen&&!open){landing.set(x,y,z);releaseYaw=yaw;detached=cut;detachedAge=0;coverAge=cut?2:0;}
  wasOpen=open;const inflation=reduced?1:T.MathUtils.smoothstep(age,0,.45);
  canopy.children.forEach(child=>{if(child instanceof T.Line)child.visible=open;else if(child instanceof T.Mesh)child.scale.set(open?.6+.4*inflation:1,open?.12+.36*inflation:.48,open?.6+.4*inflation:1);});
  green.opacity=blue.opacity=1;
  if(open){canopy.visible=true;canopy.position.set(x,y,z);canopy.rotation.set(0,yaw,reduced?0:Math.sin(age*2)*.045);canopy.scale.setScalar(1);}
  else{
    if(detached)detachedAge+=dt;else coverAge+=dt;
    const releaseAge=detached?detachedAge:coverAge;
    canopy.visible=releaseAge<1.5;
    if(canopy.visible){
      // The released fabric loses its dome and billows upward in place. Keep
      // the lower rim above the head rather than dragging cloth through it.
      const settle=T.MathUtils.smoothstep(releaseAge,.05,1.1),flat=1-settle*.85;
      const billow=reduced?0:Math.sin(Math.min(1,releaseAge/1.5)*Math.PI)*.45;
      canopy.position.set(landing.x,landing.y+5.2*(1-flat)+billow,landing.z);
      canopy.rotation.set(0,releaseYaw,0);canopy.scale.set(1+settle*.08,flat,1+settle*.08);
      green.opacity=blue.opacity=1-T.MathUtils.smoothstep(releaseAge,.35,1.5);
    }
  }
  pack.visible=open&&drop.y>floor+.4;if(pack.visible){dropAge+=dt;drop.y=Math.max(floor+.3,drop.y-dropAge*16*dt);pack.position.copy(drop);pack.position.x+=Math.sin(yaw)*dropAge*1.5;pack.rotation.set(dropAge*4,yaw,dropAge*2);}
 },dispose(){root.removeFromParent();geometries.forEach(g=>g.dispose());green.dispose();blue.dispose();dark.dispose();ropeMaterial.dispose();}};
}
