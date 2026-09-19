import * as T from 'three';
/** One arrival burst, driven by the island frame loop. No input lock. */
export function createCharacterArrival(scene:T.Scene){
 const root=new T.Group();root.name='character-teleport-arrival';scene.add(root);
 const teal=new T.MeshBasicMaterial({color:0x84e9cf,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}),gold=new T.MeshBasicMaterial({color:0xffe39b,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide});
 const ringGeo=new T.RingGeometry(.9,1,32),beamGeo=new T.CylinderGeometry(.65,1,4,12,1,true),sparkGeo=new T.OctahedronGeometry(.065,0);
 const rings=[teal,gold].map((m,i)=>{const ring=new T.Mesh(ringGeo,m);ring.rotation.x=-Math.PI/2;ring.position.y=.04+i*.04;root.add(ring);return ring;});
 const beam=new T.Mesh(beamGeo,teal);beam.position.y=2;root.add(beam);
 const sparks=Array.from({length:12},(_,i)=>{const s=new T.Mesh(sparkGeo,gold);root.add(s);return s;});
 let age=0;const duration=3.5;
 function update(dt:number,x:number,y:number,z:number,reduced:boolean,visible:boolean){
  age=Math.min(duration,age+Math.max(0,Math.min(.05,dt)));const t=age/duration;root.visible=visible&&t<1&&!reduced;
  if(!root.visible)return 1;
  root.position.set(x,y,z);const fade=Math.sin(t*Math.PI)*(1-t);teal.opacity=fade*.24;gold.opacity=fade*.9;
  rings[0].scale.setScalar(.65+t*1.8);rings[1].scale.setScalar(.55+t*1.35);rings[1].position.y=.1+t*2.5;
  beam.scale.set(1-t*.35,1,1-t*.35);
  sparks.forEach((s,i)=>{const a=i*Math.PI/6+t*.7,r=.55+t*.75;s.position.set(Math.cos(a)*r,.25+(i%4)*.55+t*1.5,Math.sin(a)*r);s.rotation.y=t*2;s.scale.setScalar(1-t*.6);});
  const u=Math.min(1,t/.6);return .12+.88*(1-Math.pow(1-u,3));
 }
 return {root,update,restart(){age=0;root.visible=false;},getState:()=>({age,done:age>=duration}),dispose(){root.removeFromParent();ringGeo.dispose();beamGeo.dispose();sparkGeo.dispose();teal.dispose();gold.dispose();}};
}
