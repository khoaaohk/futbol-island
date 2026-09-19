import * as T from 'three';
/** One shared selection glow follows whichever talkable local is under the pointer. */
export function createNpcHover(scene:T.Scene,name='npc-hover-glow'){
 const root=new T.Group();root.name=name;root.visible=false;scene.add(root);
 const ringGeometry=new T.RingGeometry(.43,.54,40),ringMaterial=new T.MeshBasicMaterial({color:'#ffe093',transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false,toneMapped:false});
 const ring=new T.Mesh(ringGeometry,ringMaterial);ring.rotation.x=-Math.PI/2;ring.position.y=.035;root.add(ring);
 const haloGeometry=new T.RingGeometry(.39,.72,40),haloMaterial=new T.MeshBasicMaterial({color:'#8df0c8',transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending});
 const halo=new T.Mesh(haloGeometry,haloMaterial);halo.rotation.x=-Math.PI/2;halo.position.y=.03;root.add(halo);
 const geometry=new T.CylinderGeometry(.38,.55,2.1,32,1,true);geometry.translate(0,1.05,0);
 const material=new T.ShaderMaterial({uniforms:{strength:{value:0},time:{value:0}},vertexShader:'varying float height; void main(){height=position.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying float height;uniform float strength;uniform float time;void main(){float edge=pow(1.0-height/2.1,2.0);float sweep=exp(-pow((height-mod(time,2.8)+.3)/.18,2.0));gl_FragColor=vec4(.65,1.0,.82,strength*(edge*.12+sweep*.1)*(1.0-smoothstep(1.7,2.1,height)));}',transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending});
 root.add(new T.Mesh(geometry,material));root.traverse(o=>o.raycast=()=>{});
 let amount=0,time=0;
 return {update(target:{id:string;x:number;y:number;z:number}|null,dt:number,reduced:boolean){if(target){if(root.userData.npcId!==target.id)amount=0;root.userData.npcId=target.id;root.position.set(target.x,target.y,target.z);}amount=reduced?Number(!!target):T.MathUtils.damp(amount,Number(!!target),14,Math.min(dt,.05));root.visible=amount>.01;if(!reduced)time+=dt;ringMaterial.opacity=amount*.9;haloMaterial.opacity=amount*.22;material.uniforms.strength.value=amount;material.uniforms.time.value=reduced?0:time*.9;},dispose(){root.removeFromParent();ringGeometry.dispose();haloGeometry.dispose();geometry.dispose();ringMaterial.dispose();haloMaterial.dispose();material.dispose();}};
}
