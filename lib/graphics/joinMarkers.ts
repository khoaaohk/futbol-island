import * as T from 'three';
// Join a live game (slice 1, Nov 4 2026): the on-pitch markers for the player who joined.
// - Compass ring at your feet in your bib colour with ONE chevron pointing at the goal you attack (who am I + which way).
// - The pass assist marker: a thin ring at the teammate a Pass reaches, and the compass shape (smaller) at the runner a
//   Forward pass would find, its chevron along his run.
// One shared material (bib colour, set once on join), two small geometries built once, ≤ 3 draw calls and only while
// joined; positions written into existing objects, no per-frame allocation.
// Owner Nov 4 2026 (kids): the Pass target is a bigger, brighter ring with a soft pulsing halo (+1 draw call), and while
// Shoot is held the goal mouth shows five soft glowing aim marks (one InstancedMesh, +1 draw call, only while aiming):
// the picked one large and bright, the others small. Transform / opacity only; reduced motion: no pulse. The head chevron is the existing hidden-
// player pin (lib/graphics/hiddenPlayerMarker.ts pinAt).
function compassGeometry(inner:number,outer:number,segments:number){
  const pos:number[]=[];
  for(let i=0;i<segments;i++){
    const a0=i/segments*Math.PI*2,a1=(i+1)/segments*Math.PI*2;
    const p=(r:number,a:number)=>[Math.sin(a)*r,0,Math.cos(a)*r];
    pos.push(...p(inner,a0),...p(outer,a0),...p(outer,a1),...p(inner,a0),...p(outer,a1),...p(inner,a1));
  }
  // chevron beyond the ring along +z (local "forward")
  const base=outer+.08,tip=outer+.55,half=.36,notch=outer+.3;
  pos.push(-half,0,base,0,0,tip,0,0,notch, 0,0,notch,0,0,tip,half,0,base);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.computeBoundingSphere();return g;
}
function ringGeometry(inner:number,outer:number,segments:number){const g=new T.RingGeometry(inner,outer,segments);g.rotateX(-Math.PI/2);return g;}
export function createJoinMarkers(scene:T.Scene){
  const material=new T.MeshBasicMaterial({color:'#ffd23f',transparent:true,opacity:.92,depthWrite:false,side:T.DoubleSide});
  const compassGeo=compassGeometry(.72,.9,40);
  const make=(g:T.BufferGeometry,name:string)=>{const m=new T.Mesh(g,material);m.name=name;m.visible=false;m.renderOrder=3;m.frustumCulled=false;scene.add(m);return m;};
  const compass=make(compassGeo,'join-compass'),forward=make(compassGeo,'join-forward-target');forward.scale.setScalar(.7);
  const passMat=new T.MeshBasicMaterial({color:'#ffd23f',transparent:true,opacity:1,depthWrite:false,side:T.DoubleSide,toneMapped:false});
  const haloMat=new T.MeshBasicMaterial({color:'#ffd23f',transparent:true,opacity:.3,depthWrite:false,side:T.DoubleSide,toneMapped:false,blending:T.AdditiveBlending});
  const passGeo=ringGeometry(.6,.86,40),haloGeo=ringGeometry(.86,1.32,40);
  const pass=new T.Mesh(passGeo,passMat),halo=new T.Mesh(haloGeo,haloMat);pass.name='join-pass-target';halo.name='join-pass-halo';
  for(const m of [pass,halo]){m.visible=false;m.renderOrder=3;m.frustumCulled=false;scene.add(m);}
  // Aim marks: a soft glow + ring drawn once into a 64 px canvas; five billboards in one instanced draw.
  const cv=document.createElement('canvas');cv.width=cv.height=64;const cx=cv.getContext('2d');
  if(cx){const g=cx.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.28,'rgba(255,255,255,.9)');g.addColorStop(.5,'rgba(255,255,255,.28)');g.addColorStop(1,'rgba(255,255,255,0)');cx.fillStyle=g;cx.fillRect(0,0,64,64);cx.strokeStyle='rgba(255,255,255,.95)';cx.lineWidth=4;cx.beginPath();cx.arc(32,32,22,0,Math.PI*2);cx.stroke();}
  const aimTex=new T.CanvasTexture(cv);aimTex.colorSpace=T.SRGBColorSpace;
  const aimGeo=new T.PlaneGeometry(1,1),aimMat=new T.MeshBasicMaterial({map:aimTex,transparent:true,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending});
  const aims=new T.InstancedMesh(aimGeo,aimMat,5);aims.name='join-aim-marks';aims.visible=false;aims.renderOrder=4;aims.frustumCulled=false;scene.add(aims);
  const aimM=new T.Matrix4(),aimP=new T.Vector3(),aimS=new T.Vector3(),aimC=new T.Color(),AIM_ON=new T.Color('#fff4cf'),AIM_OFF=new T.Color('#e9b94a').multiplyScalar(.7);
  for(let i=0;i<5;i++)aims.setColorAt(i,AIM_OFF);
  let aimSel=-2;
  return {
    setColour(hex:string){material.color.set(hex);passMat.color.set(hex).lerp(AIM_ON,.25);haloMat.color.set(hex);},
    hide(){compass.visible=pass.visible=halo.visible=forward.visible=aims.visible=false;},
    /** Your feet: ring + chevron toward the goal (world yaw of the attack direction). */
    you(x:number,y:number,z:number,attackYaw:number){compass.visible=true;compass.position.set(x,y+.135,z);compass.rotation.y=attackYaw;},
    /** The assist's Pass target (NaN hides it). */
    passTarget(x:number,y:number,z:number,time:number,reduced:boolean){pass.visible=halo.visible=Number.isFinite(x);if(!pass.visible)return;pass.position.set(x,y+.14,z);halo.position.set(x,y+.13,z);
      const w=reduced?0:Math.sin(time*4.2);pass.scale.setScalar(1+.06*w);halo.scale.setScalar(1+.12*w);haloMat.opacity=reduced?.3:.24+.14*(w*.5+.5);},
    /** Shoot held: the five aim marks on the goal mouth (`pts` = 5 world points, x y z each; null hides them), `sel` the
     *  picked one (-1 = auto-aim, all small). Billboards facing the camera; colours written only when the pick changes. */
    aim(pts:ArrayLike<number>|null,sel:number,camera:T.Camera,time:number,reduced:boolean){
      aims.visible=!!pts;if(!pts)return;
      for(let i=0;i<5;i++){const on=i===sel,k=on?1.25*(reduced?1:1+.08*Math.sin(time*7)):sel<0?.8:.66;aimP.set(pts[i*3],pts[i*3+1],pts[i*3+2]);aimS.set(k,k,k);aimM.compose(aimP,camera.quaternion,aimS);aims.setMatrixAt(i,aimM);}
      aims.instanceMatrix.needsUpdate=true;
      if(sel!==aimSel){aimSel=sel;for(let i=0;i<5;i++)aims.setColorAt(i,aimC.copy(i===sel?AIM_ON:AIM_OFF));if(aims.instanceColor)aims.instanceColor.needsUpdate=true;}
    },
    /** The Forward-pass runner (NaN hides it); chevron along his run toward the goal. */
    forwardTarget(x:number,y:number,z:number,yaw:number){forward.visible=Number.isFinite(x);if(!forward.visible)return;forward.position.set(x,y+.14,z);forward.rotation.y=yaw;},
    dispose(){[compass,pass,halo,forward,aims].forEach(m=>m.removeFromParent());compassGeo.dispose();material.dispose();passGeo.dispose();haloGeo.dispose();passMat.dispose();haloMat.dispose();aimGeo.dispose();aimMat.dispose();aimTex.dispose();aims.dispose();},
  };
}
