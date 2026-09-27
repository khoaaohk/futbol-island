import * as T from 'three';
import {createIslandArcadePlayer} from './islandArcadePlayer';
import type {BeanDress} from '../town/beanLooks';
export type {ArcadePoseOptions} from './arcadePlayerMotion';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/** Shared, original arcade art. One sun, bounded effects, no postprocessing chain. */
export function createArcadeStage(canvas:HTMLCanvasElement){
 const mobile=matchMedia('(pointer:coarse)').matches,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 const scene=new T.Scene();scene.background=new T.Color('#afcfd2');scene.fog=new T.Fog('#afcfd2',52,115);
 const camera=new T.PerspectiveCamera(38,1,.1,180),target=new T.Vector3();
 const hemi=new T.HemisphereLight('#fff0d3','#667762',1.3),sun=new T.DirectionalLight('#ffe1b0',2.5);sun.position.set(-14,24,10);sun.castShadow=true;sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);Object.assign(sun.shadow.camera,{left:-24,right:24,top:34,bottom:-24,near:1,far:90});sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;sun.shadow.radius=3;scene.add(hemi,sun,sun.target);
 const paper=document.createElement('canvas');paper.width=paper.height=128;const paint=paper.getContext('2d')!;paint.fillStyle='#fff';paint.fillRect(0,0,128,128);for(let i=0;i<2200;i++){paint.fillStyle=`rgba(74,64,38,${.035+Math.random()*.045})`;paint.fillRect(Math.random()*128,Math.random()*128,1,1);}const grain=new T.CanvasTexture(paper);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(20,20);grain.colorSpace=T.SRGBColorSpace;
 let defaultParent:T.Object3D=scene;
 const materials=new Map<string,T.MeshStandardMaterial>();
 function mat(color:string){let m=materials.get(color);if(!m){m=new T.MeshStandardMaterial({color,roughness:.8});materials.set(color,m);}return m;}
 const boxGeo=new RoundedBoxGeometry(1,1,1,2,.08),sphereGeo=new T.SphereGeometry(1,12,8),cylinderGeo=new T.CylinderGeometry(1,1,1,10);
 function box(x:number,y:number,z:number,w:number,h:number,d:number,color:string,parent:T.Object3D=defaultParent){const mesh=new T.Mesh(boxGeo,mat(color));mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function sphere(x:number,y:number,z:number,r:number,color:string,parent:T.Object3D=defaultParent){const mesh=new T.Mesh(sphereGeo,mat(color));mesh.position.set(x,y,z);mesh.scale.setScalar(r);mesh.castShadow=true;parent.add(mesh);return mesh;}
 function cylinder(x:number,y:number,z:number,r:number,h:number,color:string,parent:T.Object3D=defaultParent){const mesh=new T.Mesh(cylinderGeo,mat(color));mesh.position.set(x,y,z);mesh.scale.set(r,h,r);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function bar(x1:number,z1:number,x2:number,z2:number,y:number,r:number,color:string,parent:T.Object3D=defaultParent){const m=cylinder((x1+x2)/2,y,(z1+z2)/2,r,Math.hypot(x2-x1,z2-z1),color,parent);m.rotation.z=Math.PI/2;m.rotation.y=-Math.atan2(z2-z1,x2-x1);return m;}
 function ring(x:number,z:number,r:number,color:string){const m=new T.Mesh(new T.RingGeometry(r-.035,r,64),new T.MeshBasicMaterial({color,side:T.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(x,.03,z);scene.add(m);return m;}
 function goal(x:number,z:number,width:number){const root=new T.Group();root.position.set(x,0,z);scene.add(root);for(const side of[-1,1]){cylinder(side*width/2,1.05,0,.065,2.1,'#fff4da',root);bar(side*width/2,0,side*width/2,-1.1,.08,.045,'#fff4da',root);cylinder(side*width/2,.8,-1.1,.04,1.6,'#fff4da',root);}bar(-width/2,0,width/2,0,2.1,.065,'#fff4da',root);const points:number[]=[];for(let x=-width/2;x<=width/2+.01;x+=.25)points.push(x,.08,-1.1,x,1.6,-1.1,x,1.6,-1.1,x,2.1,0);for(let y=.1;y<=1.61;y+=.25)points.push(-width/2,y,-1.1,width/2,y,-1.1);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points,3));root.add(new T.LineSegments(geo,new T.LineBasicMaterial({color:'#d5e5df',transparent:true,opacity:.6})));return root;}
 function football(radius=.22){const root=new T.Group();sphere(0,0,0,radius,'#fff8e3',root);for(let i=0;i<8;i++){const a=i*Math.PI*.763,y=1-2*(i+.5)/8,r=Math.sqrt(1-y*y);const patch=sphere(Math.cos(a)*r*radius*.96,y*radius*.96,Math.sin(a)*r*radius*.96,radius*.28,'#294c49',root);patch.scale.multiplyScalar(.95);}scene.add(root);return root;}
 const islandPlayers:ReturnType<typeof createIslandArcadePlayer>[]=[];
 function player(color:string,dress?:BeanDress){const rig=createIslandArcadePlayer(color,reduced,islandPlayers.length,dress);islandPlayers.push(rig);scene.add(rig.root);return rig;}

 const ground=box(0,-.4,-8,90,.6,100,'#dbbd8e');ground.castShadow=false;(ground.material as T.MeshStandardMaterial).map=grain;
 // Tall scenery stays outside the playable space. Reused geometry/materials.
 const scenery=new T.Group();scene.add(scenery);defaultParent=scenery;for(const side of[-1,1])for(let i=0;i<5;i++){const x=side*(11+(i%2)*2),z=-34+i*14;
 cylinder(x,1.5,z,.15,3,'#916949');for(let j=0;j<5;j++){const leaf=sphere(x+Math.cos(j*1.256)*.72,3.1,z+Math.sin(j*1.256)*.72,1,'#307967');leaf.scale.set(1.35,.13,.43);leaf.rotation.y=-j*1.256;leaf.rotation.z=.22;}
 box(x+side*3,1.3,z+4,3.5,2.6,3,'#d68f74');box(x+side*3,2.65,z+4,3.8,.2,3.3,'#eacb9a');for(const dx of[-.9,.9])box(x+side*3+dx,1.5,z+5.52,.6,.75,.08,'#36566a');box(x+side*3,.65,z+5.55,.65,1.3,.1,'#578b81');box(x+side*3,2.25,z+5.75,3.6,.14,.65,'#edbd65');
 if(i%2===0){const lx=side*8.8,lz=z+3;cylinder(lx,2.2,lz,.065,4.4,'#324f56');box(lx,4.45,lz,.42,.24,.42,'#ffe3a0');const material=mat('#ffe3a0');material.emissive.set('#ffc46e');}
 }
 defaultParent=scene;for(const child of scenery.children)child.userData.baseZ=child.position.z;
 function scrollScenery(distance:number){for(const child of scenery.children)child.position.z=((child.userData.baseZ+distance+62)%70+70)%70-62;}
 const count=80,particleGeo=new T.IcosahedronGeometry(.065,0),particleMat=new T.MeshBasicMaterial({color:'#ffdd82'}),particles=new T.InstancedMesh(particleGeo,particleMat,count),life=new Float32Array(count),positions=new Float32Array(count*3),vel=new Float32Array(count*3),dummy=new T.Object3D();particles.instanceMatrix.setUsage(T.DynamicDrawUsage);particles.frustumCulled=false;scene.add(particles);let cursor=0,alive=false;for(let i=0;i<count;i++){dummy.scale.setScalar(0);dummy.updateMatrix();particles.setMatrixAt(i,dummy.matrix);}
 function burst(x:number,y:number,z:number,power=1){if(reduced)return;for(let i=0;i<Math.min(18,8+power*4);i++){const n=cursor++%count;life[n]=.45+Math.random()*.3;positions.set([x,y,z],n*3);vel.set([(Math.random()-.5)*3*power,1+Math.random()*2,(Math.random()-.5)*3*power],n*3);}alive=true;}
 const day=new T.Color('#afcfd2'),dusk=new T.Color('#677c9b'),warm=new T.Color('#ffe1b0'),cool=new T.Color('#b9d4ff');let lastLight=-1;
 function lighting(seconds:number){const night=T.MathUtils.smoothstep(seconds,35,180);if(Math.abs(night-lastLight)<.003)return;lastLight=night;(scene.background as T.Color).lerpColors(day,dusk,night);(scene.fog as T.Fog).color.copy(scene.background as T.Color);sun.color.lerpColors(warm,cool,night);sun.intensity=2.5-night*1.3;sun.position.set(-14+night*7,24-night*13,10);hemi.intensity=1.3-night*.25;mat('#ffe3a0').emissiveIntensity=.1+night*2;}
 function effects(dt:number){if(!alive)return;alive=false;for(let i=0;i<count;i++){if(life[i]<=0)continue;life[i]-=dt;const j=i*3;vel[j+1]-=dt*5;for(let k=0;k<3;k++)positions[j+k]+=vel[j+k]*dt;dummy.position.fromArray(positions,j);dummy.scale.setScalar(Math.max(0,life[i]*1.8));dummy.updateMatrix();particles.setMatrixAt(i,dummy.matrix);if(life[i]>0)alive=true;}particles.instanceMatrix.needsUpdate=true;}
 function fit(width:number,length:number,runner=false){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.clearViewOffset();camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();target.set(0,0,runner?-11:0);
  if(runner){camera.position.set(0,mobile?14:11,mobile?21:15);target.set(0,0,mobile?-10:-14);camera.lookAt(target);camera.updateMatrixWorld();return;}
  // Compose the court into the space between HUD and controls, not into a tiny
  // island in the centre. Binary search only on resize; no per-frame fitting.
  const top=h<520?82:mobile?143:132,bottom=h<520?100:mobile?157:146;
  const room=Math.max(.3,(h-top-bottom)/h),limitX=mobile?.93:.88,corner=new T.Vector3();let low=5,high=250;
  for(let i=0;i<22;i++){const distance=(low+high)/2;camera.position.set(0,distance,distance*.58);camera.lookAt(target);camera.updateMatrixWorld();let fits=true;for(const x of [-width/2,width/2])for(const z of [-length/2,length/2]){corner.set(x,0,z).project(camera);if(Math.abs(corner.x)>limitX||Math.abs(corner.y)>room)fits=false;}if(fits)high=distance;else low=distance;}
  camera.position.set(0,high,high*.58);camera.lookAt(target);camera.updateMatrixWorld();
  // The off-centre projection reserves unequal HUD/control margins without a
  // second viewport; pointer picking uses the same projection matrix.
  camera.setViewOffset(w,h,0,(bottom-top)/2,w,h);
  camera.far=Math.max(180,camera.position.length()+115);camera.updateProjectionMatrix();
  const fog=scene.fog as T.Fog;fog.near=camera.position.length()+28;fog.far=camera.position.length()+100;
 }
 const ray=new T.Raycaster(),pointer=new T.Vector2(),plane=new T.Plane(new T.Vector3(0,1,0),0),point=new T.Vector3();
 function pick(clientX:number,clientY:number){const r=canvas.getBoundingClientRect();pointer.set((clientX-r.left)/r.width*2-1,1-(clientY-r.top)/r.height*2);ray.setFromCamera(pointer,camera);return ray.ray.intersectPlane(plane,point);}
 function render(){renderer.render(scene,camera);}
 function dispose(){for(const rig of islandPlayers)rig.dispose();const geometries=new Set<T.BufferGeometry>(),mats=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.LineSegments){geometries.add(o.geometry);const list=Array.isArray(o.material)?o.material:[o.material];list.forEach(m=>mats.add(m));}});geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());grain.dispose();sun.shadow.map?.dispose();renderer.dispose();}
 return{resetPlayers:()=>islandPlayers.forEach(p=>p.resetPose()),scenery,effectsActive:()=>alive,scene,camera,renderer,mobile,reduced,box,sphere,cylinder,bar,ring,goal,football,player,burst,effects,lighting,scrollScenery,fit,pick,render,dispose};
}
export type ArcadeStage=ReturnType<typeof createArcadeStage>;
