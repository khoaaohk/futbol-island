import * as T from 'three';
import type {ArcadeStageLook} from './looks/stageLook';
import {createIslandArcadePlayer} from './islandArcadePlayer';
import type {BeanDress} from '../town/beanLooks';
export type {ArcadePoseOptions} from './arcadePlayerMotion';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Shared arcade stage plumbing (renderer, primitives, players, particles, fit, pick, dispose). One sun, bounded effects, no
 * postprocessing chain. Everything that decides how a game LOOKS comes from its `look` (lib/arcade/looks/<game>.ts). */
export function createArcadeStage(canvas:HTMLCanvasElement,look:ArcadeStageLook){
 const mobile=matchMedia('(pointer:coarse)').matches,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const renderer=new T.WebGLRenderer({canvas,antialias:look.renderer.antialias,powerPreference:look.renderer.powerPreference});
 renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?look.renderer.pixelRatioCap.mobile:look.renderer.pixelRatioCap.desktop));renderer.shadowMap.enabled=look.renderer.shadows;renderer.shadowMap.type=look.renderer.shadowType;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=look.renderer.toneMapping;renderer.toneMappingExposure=look.renderer.exposure;
 const scene=new T.Scene();scene.background=new T.Color(look.background);scene.fog=new T.Fog(look.fog.color,look.fog.near,look.fog.far);
 const camera=new T.PerspectiveCamera(look.camera.fov,1,look.camera.near,look.camera.far),target=new T.Vector3();
 const sunSize=mobile?look.sun.shadowMapSize.mobile:look.sun.shadowMapSize.desktop;
 const hemi=new T.HemisphereLight(look.hemi.sky,look.hemi.ground,look.hemi.intensity),sun=new T.DirectionalLight(look.sun.color,look.sun.intensity);sun.position.set(...look.sun.position);sun.castShadow=true;sun.shadow.mapSize.set(sunSize,sunSize);Object.assign(sun.shadow.camera,look.sun.frustum);sun.shadow.normalBias=look.sun.normalBias;sun.shadow.bias=look.sun.bias;sun.shadow.radius=look.sun.radius;scene.add(hemi,sun,sun.target);
 const neonColor=look.surface.color,neonEmissive=look.surface.emissive;
 const defaultParent:T.Object3D=scene;
 const materials=new Map<string,T.MeshStandardMaterial>();
 function mat(color:string){let m=materials.get(color);if(!m){m=new T.MeshStandardMaterial({color:neonColor(color),roughness:look.surface.roughness,emissive:neonEmissive(color)?neonColor(color):'#000000',emissiveIntensity:neonEmissive(color)?look.surface.emissiveIntensity:0});materials.set(color,m);}return m;}
 const boxGeo=new RoundedBoxGeometry(1,1,1,2,.08),sphereGeo=new T.SphereGeometry(1,12,8),cylinderGeo=new T.CylinderGeometry(1,1,1,10);
 function box(x:number,y:number,z:number,w:number,h:number,d:number,color:string,parent:T.Object3D=defaultParent){const mesh=new T.Mesh(boxGeo,mat(color));mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function sphere(x:number,y:number,z:number,r:number,color:string,parent:T.Object3D=defaultParent){const mesh=new T.Mesh(sphereGeo,mat(color));mesh.position.set(x,y,z);mesh.scale.setScalar(r);mesh.castShadow=true;parent.add(mesh);return mesh;}
 function cylinder(x:number,y:number,z:number,r:number,h:number,color:string,parent:T.Object3D=defaultParent){const mesh=new T.Mesh(cylinderGeo,mat(color));mesh.position.set(x,y,z);mesh.scale.set(r,h,r);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function bar(x1:number,z1:number,x2:number,z2:number,y:number,r:number,color:string,parent:T.Object3D=defaultParent){const m=cylinder((x1+x2)/2,y,(z1+z2)/2,r,Math.hypot(x2-x1,z2-z1),color,parent);m.rotation.z=Math.PI/2;m.rotation.y=-Math.atan2(z2-z1,x2-x1);return m;}
 function ring(x:number,z:number,r:number,color:string){const m=new T.Mesh(new T.RingGeometry(r-.035,r,64),new T.MeshBasicMaterial({color:neonColor(color),side:T.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(x,.03,z);scene.add(m);return m;}
 function goal(x:number,z:number,width:number){const root=new T.Group();root.position.set(x,0,z);scene.add(root);for(const side of[-1,1]){cylinder(side*width/2,1.05,0,.065,2.1,'#fff4da',root);bar(side*width/2,0,side*width/2,-1.1,.08,.045,'#fff4da',root);cylinder(side*width/2,.8,-1.1,.04,1.6,'#fff4da',root);}bar(-width/2,0,width/2,0,2.1,.065,'#fff4da',root);const points:number[]=[];for(let x=-width/2;x<=width/2+.01;x+=.25)points.push(x,.08,-1.1,x,1.6,-1.1,x,1.6,-1.1,x,2.1,0);for(let y=.1;y<=1.61;y+=.25)points.push(-width/2,y,-1.1,width/2,y,-1.1);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points,3));root.add(new T.LineSegments(geo,new T.LineBasicMaterial({color:'#95bce3',transparent:true,opacity:.6})));return root;}
 function football(radius=.22){const root=new T.Group();sphere(0,0,0,radius,look.ball.base,root);for(let i=0;i<8;i++){const a=i*Math.PI*.763,y=1-2*(i+.5)/8,r=Math.sqrt(1-y*y);const patch=sphere(Math.cos(a)*r*radius*.96,y*radius*.96,Math.sin(a)*r*radius*.96,radius*.28,look.ball.patch,root);patch.scale.multiplyScalar(.95);}scene.add(root);return root;}
 /* Heat (Nov 8 2026): the same ball as football() (white sphere + 8 dark patches, same sizes and colours) baked into ONE
  * vertex-coloured mesh: 1 draw instead of 9. Used for Breakaway's pooled coin balls, shot balls and one-two pass ball
  * (the runner's own ball keeps football(): its mission skins swap the patch materials). Geometry + material shared. */
 const flatBalls=new Map<number,T.BufferGeometry>();let flatBallMat:T.MeshStandardMaterial|undefined;
 function footballMerged(radius=.22){
  const white=mat(look.ball.base),dark=mat(look.ball.patch);
  if(white.emissiveIntensity>0||dark.emissiveIntensity>0)return football(radius);
  let geo=flatBalls.get(radius);
  if(!geo){const parts:T.BufferGeometry[]=[],add=(x:number,y:number,z:number,r:number,c:T.Color)=>{const g=sphereGeo.clone();g.scale(r,r,r);g.translate(x,y,z);const n=g.attributes.position.count,col=new Float32Array(n*3);for(let i=0;i<n;i++){col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}g.setAttribute('color',new T.BufferAttribute(col,3));parts.push(g);};
   add(0,0,0,radius,white.color);
   for(let i=0;i<8;i++){const a=i*Math.PI*.763,y=1-2*(i+.5)/8,r=Math.sqrt(1-y*y);add(Math.cos(a)*r*radius*.96,y*radius*.96,Math.sin(a)*r*radius*.96,radius*.28*.95,dark.color);}
   geo=mergeGeometries(parts)!;for(const g of parts)g.dispose();flatBalls.set(radius,geo);}
  flatBallMat??=new T.MeshStandardMaterial({vertexColors:true,roughness:look.surface.roughness});
  const root=new T.Group(),mesh=new T.Mesh(geo,flatBallMat);mesh.castShadow=true;root.add(mesh);scene.add(root);return root;}
 const islandPlayers:ReturnType<typeof createIslandArcadePlayer>[]=[];
 function player(color:string,dress?:BeanDress){const rig=createIslandArcadePlayer(color,reduced,islandPlayers.length,dress);islandPlayers.push(rig);scene.add(rig.root);return rig;}

 // Ground + backdrop come from the game's look (lib/arcade/looks/<game>.ts → environment()).
 const environment=look.environment({scene,mobile,reduced,mat,box,sphere,cylinder}),scenery=environment.scenery;
 for(const child of scenery.children)child.userData.baseZ=child.position.z;
 function scrollScenery(distance:number){for(const child of scenery.children)child.position.z=((child.userData.baseZ+distance+62)%70+70)%70-62;}
 const count=80,particleGeo=new T.IcosahedronGeometry(.065,0),particleMat=new T.MeshBasicMaterial({color:look.sparks.color}),particles=new T.InstancedMesh(particleGeo,particleMat,count),life=new Float32Array(count),positions=new Float32Array(count*3),vel=new Float32Array(count*3),dummy=new T.Object3D();particles.instanceMatrix.setUsage(T.DynamicDrawUsage);particles.frustumCulled=false;scene.add(particles);let cursor=0,alive=false;for(let i=0;i<count;i++){dummy.scale.setScalar(0);dummy.updateMatrix();particles.setMatrixAt(i,dummy.matrix);}
 function burst(x:number,y:number,z:number,power=1){if(reduced)return;for(let i=0;i<Math.min(18,8+power*4);i++){const n=cursor++%count;life[n]=.45+Math.random()*.3;positions.set([x,y,z],n*3);vel.set([(Math.random()-.5)*3*power,1+Math.random()*2,(Math.random()-.5)*3*power],n*3);}alive=true;}
 // Constant cabinet lighting: no day/night washout or extra light/shadow passes.
 function lighting(_seconds:number){}
 function effects(dt:number){if(!alive)return;alive=false;for(let i=0;i<count;i++){if(life[i]<=0)continue;life[i]-=dt;const j=i*3;vel[j+1]-=dt*5;for(let k=0;k<3;k++)positions[j+k]+=vel[j+k]*dt;dummy.position.fromArray(positions,j);dummy.scale.setScalar(Math.max(0,life[i]*1.8));dummy.updateMatrix();particles.setMatrixAt(i,dummy.matrix);if(life[i]>0)alive=true;}particles.instanceMatrix.needsUpdate=true;}
 function fit(width:number,length:number,runner=false,tennis=false,pinball=false){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.clearViewOffset();camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();target.set(0,0,runner?-11:0);
  if(runner){camera.position.set(0,mobile?14:11,mobile?21:15);target.set(0,0,mobile?-10:-14);camera.lookAt(target);camera.updateMatrixWorld();return;}
  // Compose the court into the space between HUD and controls, not into a tiny
  // island in the centre. Binary search only on resize; no per-frame fitting.
  // Short (landscape) pinball: its message sits ~74px up, so reclaim the rest.
   const short=pinball&&h<520,top=tennis?(mobile?64:80):short?92:(mobile?64:80),bottom=tennis?(h<520?100:mobile?174:146):short?122:(mobile?144:112);
  // Portrait phones get a more overhead court; short viewports tilt it enough
  // to fill the available width without sacrificing either baseline.
  const usableHeight=Math.max(1,h-top-bottom),courtRatio=length/width,viewRatio=usableHeight/Math.max(1,w);
  const tilt=tennis?(mobile?T.MathUtils.clamp(Math.sqrt(Math.max(.015,(courtRatio/viewRatio)**2-1)),.12,1.35):.58):short?T.MathUtils.clamp(Math.sqrt(Math.max(.2,(courtRatio/viewRatio)**2-1)),.82,1.8):(mobile?T.MathUtils.clamp(Math.sqrt(Math.max(.2,(courtRatio/viewRatio)**2-1)),.45,1.15):.82);
  const room=Math.max(.3,usableHeight/h),limitX=tennis?(mobile?.985:.88):.98,corner=new T.Vector3();let low=5,high=250;
  for(let i=0;i<22;i++){const distance=(low+high)/2;camera.position.set(0,distance,distance*tilt);camera.lookAt(target);camera.updateMatrixWorld();let fits=true,minY=Infinity,maxY=-Infinity;for(const x of [-width/2,width/2])for(const z of [-length/2,length/2]){corner.set(x,0,z).project(camera);minY=Math.min(minY,corner.y);maxY=Math.max(maxY,corner.y);if(Math.abs(corner.x)>limitX)fits=false;}if(maxY-minY>room*2)fits=false;if(fits)high=distance;else low=distance;}
  camera.position.set(0,high,high*tilt);camera.lookAt(target);camera.updateMatrixWorld();
  // The off-centre projection reserves unequal HUD/control margins without a
  // second viewport; pointer picking uses the same projection matrix.
  let minY=Infinity,maxY=-Infinity;for(const z of [-length/2,length/2]){corner.set(0,0,z).project(camera);minY=Math.min(minY,corner.y);maxY=Math.max(maxY,corner.y);}
  camera.setViewOffset(w,h,0,(bottom-top)/2-(minY+maxY)*h/4,w,h);
  camera.far=Math.max(180,camera.position.length()+115);camera.updateProjectionMatrix();
  const fog=scene.fog as T.Fog;fog.near=camera.position.length()+28;fog.far=camera.position.length()+100;
 }
 const ray=new T.Raycaster(),pointer=new T.Vector2(),plane=new T.Plane(new T.Vector3(0,1,0),0),point=new T.Vector3();
 function pick(clientX:number,clientY:number){const r=canvas.getBoundingClientRect();pointer.set((clientX-r.left)/r.width*2-1,1-(clientY-r.top)/r.height*2);ray.setFromCamera(pointer,camera);return ray.ray.intersectPlane(plane,point);}
 function render(){renderer.render(scene,camera);}
 function dispose(){const geometries=new Set<T.BufferGeometry>(),mats=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line||o instanceof T.Points||o instanceof T.Sprite){geometries.add(o.geometry);const list=Array.isArray(o.material)?o.material:[o.material];list.forEach(m=>mats.add(m));
  // Shadow-pass materials too (e.g. runnerTrack's shared bend depth material): their dispose listeners hold this renderer.
  for(const m of [o.customDepthMaterial,o.customDistanceMaterial])if(m)mats.add(m);}});
 // Rigs after the walk, so their shared bean geometries are collected too (a rig's dispose detaches its meshes). Sprites count:
 // three's Sprite geometry is one module-level BufferGeometry, which otherwise keeps every renderer that drew a sprite.
 for(const rig of islandPlayers)rig.dispose();geometries.forEach(g=>g.dispose());// Textures too, shared ones included (e.g. beanSkin's module-level face atlas): each renderer that uploaded a texture adds a 'dispose' listener holding its WebGL context, so a shared texture that is never disposed pins every past arcade renderer and its GPU memory (one live context per game visit; Chrome starts dropping contexts after ~16). Disposing only frees GPU copies: a renderer that still uses the texture re-uploads it on its next frame.
 const textures=new Set<T.Texture>();const addTexture=(v:unknown)=>{if((v as T.Texture|null)?.isTexture)textures.add(v as T.Texture);};
 // Maps on the material, and uniform holders such as BeanMaterial.beanUniforms ({beanFace:{value:atlas},…}).
 mats.forEach(m=>{for(const v of Object.values(m)){addTexture(v);if(v&&typeof v==='object'&&!(v as T.Texture).isTexture&&!Array.isArray(v))for(const u of Object.values(v as Record<string,unknown>))addTexture((u as {value?:unknown}|null)?.value);}m.dispose();});textures.forEach(t=>t.dispose());environment.dispose();sun.shadow.map?.dispose();renderer.dispose();/* The context is released once the canvas has really left the page: React StrictMode (dev) remounts on the same canvas, and a lost context cannot be reused ('The pitch couldn't load'). */setTimeout(()=>{if(!canvas.isConnected)renderer.forceContextLoss();},0);}
 return{resetPlayers:()=>islandPlayers.forEach(p=>p.resetPose()),scenery,effectsActive:()=>alive,scene,camera,renderer,mobile,reduced,box,sphere,cylinder,bar,ring,goal,football,footballMerged,player,burst,effects,lighting,scrollScenery,fit,pick,render,dispose};
}
export type ArcadeStage=ReturnType<typeof createArcadeStage>;
