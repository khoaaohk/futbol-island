/**
 * "JOB" badges over every job sign (Sep 30 2026, user: "the job signs are hard to find … an indicator above them saying Job
 * that glows"). docs/island-jobs.md §12.
 *
 * Heat (docs/performance-guide.md): ONE instanced quad mesh (one draw) with ONE small canvas texture (a gold pixel-button pill
 * with a dark rim, a coin and a soft glow halo baked in) for all badges. Nothing runs while no badge is in range: `update`
 * does one cheap distance pass and returns, the mesh hidden. In range (≤ RANGE m and inside the camera frustum) the badges
 * face the camera, bob and pulse slowly, and keep a minimum on-screen size. Reduced motion: no bob or pulse. No DOM.
 * States: hidden while that job is running; dimmed (greyed, a little smaller) once it has been done today, since later shifts
 * pay less (jobEconomy.ts), so a child is steered to a fresh, full-pay job.
 */
import * as T from 'three';
export type BadgeSpot={id:string;x:number;y:number;z:number};
const RANGE=75,BASE_W=1.75,BASE_H=.875;
function badgeTexture(){
 if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');if(!g)return null;
 // Quieter look (user, Sep 30 2026: "less noticeable … no icon … a little see-through, like the pink score"): a translucent
 // pink pill with cream JOB lettering, no coin, no glow halo.
 const pill=(x:number,y:number,w:number,h:number,r:number)=>{g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h);};
 // Neon green (user, Sep 30 2026: neon pink, then "change that to a neon green instead"; the same green as the sign glow): a green
 // neon halo, a bright green pill with a light tube rim, dark lettering for contrast.
 const halo=g.createRadialGradient(128,64,20,128,64,70);halo.addColorStop(0,'rgba(53,237,139,.55)');halo.addColorStop(1,'rgba(53,237,139,0)');g.fillStyle=halo;g.fillRect(0,0,256,128);
 g.shadowColor='#35ed8b';g.shadowBlur=14;g.fillStyle='rgba(46,232,120,.9)';pill(58,32,140,64,32);g.fill();g.shadowBlur=0;
 g.strokeStyle='#c9ffdc';g.lineWidth=4;pill(60,34,136,60,30);g.stroke();
 g.fillStyle='#0d3b23';g.font='900 36px Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('JOB',128,65);
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;
}
export function createJobBadges(root:T.Object3D,spots:BadgeSpot[]){
 const tex=badgeTexture(),geo=new T.PlaneGeometry(BASE_W,BASE_H),mat=new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,toneMapped:false,color:'#ffffff'});
 const mesh=new T.InstancedMesh(geo,mat,Math.max(1,spots.length));mesh.name='job-badges';mesh.frustumCulled=false;mesh.visible=false;mesh.renderOrder=3;root.add(mesh);
 const hidden=new T.Matrix4().makeScale(0,0,0),m=new T.Matrix4(),v=new T.Vector3(),s=new T.Vector3(),c=new T.Color(),frustum=new T.Frustum(),pv=new T.Matrix4();
 for(let i=0;i<spots.length;i++){mesh.setMatrixAt(i,hidden);mesh.setColorAt(i,c.set('#ffffff'));}
 let time=0,active:string|null=null,done=new Set<string>(),colorsKey='';
 /** `active`: the running job (its badge hides); `doneToday`: jobs already worked today (dimmed). */
 function setState(activeId:string|null,doneToday:string[]){active=activeId;const key=doneToday.slice().sort().join(',');if(key===colorsKey)return;colorsKey=key;done=new Set(doneToday);
  // Every badge looks the same neon pink (user, Sep 30 2026: a dimmed "done today" badge looked different); the offer card says
  // when a later shift pays less.
  spots.forEach((_p,i)=>mesh.setColorAt(i,c.set('#ffffff')));if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;}
 /** Per frame after the camera is placed. Returns how many badges were drawn (0 = idle: nothing animated). */
 function update(camera:T.PerspectiveCamera,dt:number,reduced:boolean,visible:boolean){
  if(!visible){if(mesh.visible)mesh.visible=false;return 0;}
  const cx=camera.position.x,cz=camera.position.z;let any=false;
  for(const p of spots)if(p.id!==active&&Math.hypot(p.x-cx,p.z-cz)<RANGE+40){any=true;break;}
  if(!any){if(mesh.visible)mesh.visible=false;return 0;}
  time+=dt;pv.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(pv);let shown=0;
  const q=camera.quaternion,fov=Math.tan(camera.fov*Math.PI/360);
  spots.forEach((p,i)=>{v.set(p.x,p.y,p.z);const d=camera.position.distanceTo(v);
   if(p.id===active||d>RANGE+40||!frustum.containsPoint(v)){mesh.setMatrixAt(i,hidden);return;}
   const bob=reduced?0:Math.sin(time*1.6+i*1.3)*.06,pulse=1;// no pulse: the badge stays quiet
   // At least ~5 % of the view height on screen, so a far sign still reads; never smaller than its base size.
   const k=Math.max(1,d*fov*2*.045/BASE_H)*pulse;
   v.y+=bob+(k-1)*BASE_H*.5;m.compose(v,q,s.set(k,k,k));mesh.setMatrixAt(i,m);shown++;});
  mesh.visible=shown>0;mesh.instanceMatrix.needsUpdate=true;return shown;
 }
 return {mesh,update,setState,dispose(){mesh.removeFromParent();mesh.dispose();geo.dispose();mat.dispose();tex?.dispose();}};
}
