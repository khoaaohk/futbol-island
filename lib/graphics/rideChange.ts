import * as T from 'three';
/** A single, soft light pulse follows the rider while their footprint changes. */
export function createRideChange(){
 const root=new T.Group();root.name='ride-change-light';root.visible=false;
 const geometry=new T.RingGeometry(.86,1,48),material=new T.MeshBasicMaterial({color:'#fff0ac',transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending});
 const ring=new T.Mesh(geometry,material);ring.rotation.x=-Math.PI/2;root.add(ring);
 const sparkGeometry=new T.SphereGeometry(.065,6,4),sparkMaterial=new T.MeshBasicMaterial({color:'#baffec',transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});
 const sparks=Array.from({length:18},()=>{const mesh=new T.Mesh(sparkGeometry,sparkMaterial);root.add(mesh);return mesh;});let age=1,size=1;
 return {root,trigger(radius:number){age=0;size=radius;},update(dt:number,x:number,y:number,z:number,reduced:boolean){age+=dt;const t=age/.65;root.visible=t<1;if(!root.visible)return;root.position.set(x,y+.12,z);ring.scale.setScalar(size*(reduced?1:.35+t*1.4));material.opacity=(1-t)*(reduced?.25:.65);sparkMaterial.opacity=(1-t)*.7;sparks.forEach((spark,i)=>{spark.visible=!reduced;const a=i/18*Math.PI*2,r=size*(.2+t*1.5);spark.position.set(Math.cos(a)*r,Math.sin(t*Math.PI)*(.6+i%3*.3),Math.sin(a)*r);spark.scale.setScalar(1-t*.7);});},dispose(){root.removeFromParent();geometry.dispose();material.dispose();sparkGeometry.dispose();sparkMaterial.dispose();}};
}
