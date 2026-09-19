import * as T from 'three';
/** Back-face shells follow the rig's own animated parts without changing its size. */
export function createCharacterGlow(root:T.Object3D,options:{outlineScale?:number;auraScale?:T.Vector3}={}){
 const sources:T.Mesh[]=[];root.traverse(object=>{if(object instanceof T.Mesh)sources.push(object);});
 const materials=[.045,.095].map((width,index)=>new T.ShaderMaterial({uniforms:{width:{value:width*(options.outlineScale??1)},strength:{value:0},tint:{value:new T.Color(index?'#48baff':'#83f2cf')}},vertexShader:'uniform float width; void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position+normal*width,1.0);}',fragmentShader:'uniform vec3 tint; uniform float strength; void main(){gl_FragColor=vec4(tint,strength);}',side:T.BackSide,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));
 const shells:T.Mesh[]=[];for(const source of sources)for(const material of materials){const shell=new T.Mesh(source.geometry,material);shell.name='character-selection-glow';shell.raycast=()=>{};shell.visible=false;source.add(shell);shells.push(shell);}
 const aura=new T.Group();aura.name='character-orbit-aura';root.add(aura);aura.visible=false;if(options.auraScale)aura.scale.copy(options.auraScale);
 const auraMaterials=['#ffe080','#7ff3d2'].map(color=>new T.MeshBasicMaterial({color,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}));
 const auraGeometries:T.BufferGeometry[]=[],orbits:T.Mesh[]=[],sparks:T.Mesh[]=[];
 for(let i=0;i<3;i++){const points:T.Vector3[]=[];for(let j=0;j<=36;j++){const t=j/36,angle=t*Math.PI*1.6,r=.53+Math.sin(t*Math.PI)*.12;points.push(new T.Vector3(Math.cos(angle)*r,.15+t*1.9,Math.sin(angle)*r));}const geometry=new T.TubeGeometry(new T.CatmullRomCurve3(points),48,.018,5,false);auraGeometries.push(geometry);const arc=new T.Mesh(geometry,auraMaterials[i%2]);arc.name='selection-orbit';arc.raycast=()=>{};aura.add(arc);orbits.push(arc);}
 const sparkGeometry=new T.SphereGeometry(.035,5,4);auraGeometries.push(sparkGeometry);
 for(let i=0;i<18;i++){const spark=new T.Mesh(sparkGeometry,auraMaterials[i%2]);spark.scale.set(.7,2.6,.7);spark.raycast=()=>{};aura.add(spark);sparks.push(spark);}
 let amount=0,time=0;
 return {update(hovered:boolean,dt:number,reduced:boolean){amount=reduced?Number(hovered):T.MathUtils.damp(amount,Number(hovered),14,dt);materials[0].uniforms.strength.value=amount*.7;materials[1].uniforms.strength.value=amount*.22;const visible=amount>.01;if(aura.visible!==visible){shells.forEach(shell=>shell.visible=visible);aura.visible=visible;}if(!reduced)time+=Math.min(dt,.05);if(!visible)return;auraMaterials[0].opacity=amount*.8;auraMaterials[1].opacity=amount*.6;
 orbits.forEach((arc,i)=>{arc.rotation.y=(reduced?0:time*3.4)+i*Math.PI*2/3;arc.rotation.z=Math.sin(i*2)*.13;});
 sparks.forEach((spark,i)=>{const rise=(i/18+(reduced?0:time*.65))%1,angle=i*2.4+(reduced?0:time*4),radius=.55+Math.sin(rise*Math.PI)*.18;spark.position.set(Math.cos(angle)*radius,.1+rise*2.2,Math.sin(angle)*radius);spark.scale.setScalar(.6+Math.sin(rise*Math.PI)*.5);spark.scale.y*=2.6;});
 },dispose(){shells.forEach(shell=>shell.removeFromParent());materials.forEach(material=>material.dispose());aura.removeFromParent();auraGeometries.forEach(geometry=>geometry.dispose());auraMaterials.forEach(material=>material.dispose());}};
}
