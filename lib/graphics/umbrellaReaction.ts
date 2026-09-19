import * as T from 'three';

/** Finite kick feedback. Particles are created on demand and sleep when empty. */
export function createUmbrellaReaction(){
 const entries:{mesh:T.Mesh;x:number;y:number;z:number;floor:number;radius:number;targets:T.Box3[];age:number;popped:boolean}[]=[];
 const active=new Set<typeof entries[number]>();
 const particles:{mesh:T.Mesh;age:number;vx:number;vy:number;vz:number}[]=[];
 let particleGeometry:T.OctahedronGeometry|undefined,particleMaterial:T.MeshBasicMaterial|undefined;
 function burst(e:typeof entries[number]){
  particleGeometry??=new T.OctahedronGeometry(.09,0);
  particleMaterial??=new T.MeshBasicMaterial({color:0xffe8b0});
  for(let i=0;i<10;i++){
   let p=particles.find(p=>!p.mesh.visible);
   if(!p){if(particles.length>=30)break;const mesh=new T.Mesh(particleGeometry,particleMaterial);p={mesh,age:0,vx:0,vy:0,vz:0};particles.push(p);}
   e.mesh.parent?.add(p.mesh);const angle=i*Math.PI*2/10;
   p.mesh.position.set(e.x+Math.cos(angle)*e.radius*.6,e.y,e.z+Math.sin(angle)*e.radius*.6);p.mesh.visible=true;p.mesh.scale.setScalar(1);
   p.age=0;p.vx=Math.cos(angle)*2.5;p.vz=Math.sin(angle)*2.5;p.vy=1.8+(i%3)*.3;
  }
 }
 return {
  register(mesh:T.Mesh,floor:number,linked:T.Mesh[]=[]){mesh.userData.umbrellaAnimated=true;const targets=linked.map(target=>{target.updateWorldMatrix(true,false);return new T.Box3().setFromObject(target).expandByScalar(.3);});entries.push({targets,mesh,x:mesh.position.x,y:mesh.position.y,z:mesh.position.z,floor,radius:mesh.geometry instanceof T.ConeGeometry?mesh.geometry.parameters.radius:2,age:0,popped:false});},
  hit(x:number,y:number,z:number,speed:number,reduced:boolean){
   if(speed<2)return false;
   for(const e of entries){if(active.has(e)||y<e.floor||y>e.y+.6)continue;
    const nearCanopy=Math.hypot(x-e.x,z-e.z)<=(y>e.y-.6?e.radius+.2:Math.min(e.radius,1.9));
    const nearFurniture=!nearCanopy&&e.targets.some(b=>x>=b.min.x&&x<=b.max.x&&z>=b.min.z&&z<=b.max.z&&y<=b.max.y+.45);
    if(!nearCanopy&&!nearFurniture)continue;
    if(!reduced){e.age=0;e.popped=false;active.add(e);}return true;
   }return false;
  },
  dispose(){active.clear();for(const e of entries){e.mesh.removeFromParent();e.mesh.geometry.dispose();}entries.length=0;for(const p of particles)p.mesh.removeFromParent();particles.length=0;particleGeometry?.dispose();particleMaterial?.dispose();},
  update(dt:number,reduced:boolean){for(const e of active){
   e.age+=dt;const t=e.age;
   if(reduced||t>=2.35){e.mesh.scale.set(1,1,1);e.mesh.position.y=e.y;e.mesh.rotation.z=0;e.mesh.updateMatrix();active.delete(e);continue;}
   let width:number,height:number,drop:number;
   if(t<.12){const fold=Math.sin(t/.12*Math.PI/2);width=1-.84*fold;height=1+1.8*fold;drop=.65*fold;}
   else if(t<1.12){const wind=(t-.12);width=.16+.035*Math.sin(wind*Math.PI*6);height=2.8+.08*Math.sin(wind*Math.PI*6);drop=.65;}
   else{
    if(!e.popped){burst(e);e.popped=true;}
    const u=t-1.12,open=Math.min(1,u/.16),bounce=u>.16?Math.sin((u-.16)*22)*Math.exp(-(u-.16)*3.8)*.16:0;
    // Quick opening, small spring bounces, then one broad final stretch.
    const stretch=.22*Math.exp(-(((u-.82)/.13)**2));
    width=.16+.84*open+bounce+stretch;height=2.8-1.8*open-bounce*.7-stretch*.4;drop=.65*(1-open);
   }
   e.mesh.scale.set(width,height,width);e.mesh.position.y=e.y-drop;e.mesh.rotation.z=.1*drop;e.mesh.updateMatrix();
  }
  for(const p of particles){if(!p.mesh.visible)continue;p.age+=dt;if(reduced||p.age>=.7){p.mesh.visible=false;continue;}p.vy-=5*dt;p.mesh.position.x+=p.vx*dt;p.mesh.position.y+=p.vy*dt;p.mesh.position.z+=p.vz*dt;p.mesh.scale.setScalar(1-p.age/.7);}
 },
 };
}
