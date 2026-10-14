/**
 * Football shop · Ball studio stage (Oct 12 2026): the small three.js scene behind components/shop/BallStudio.tsx.
 *
 * Heat rules (docs/performance-guide.md, AGENTS.md):
 *  - render on demand: nothing runs at rest. `invalidate()` asks for ONE frame; the rAF chain continues only while something
 *    moves (throw inertia, the opening spin preview, a kick, a zoom/reset ease, a sticker pop) and stops by itself;
 *  - 2 draw calls (the ball: one ShaderMaterial; the contact shadow: one textured quad). The backdrop is CSS;
 *  - phones: pixel ratio ≤ 1.5, a 64×48 sphere, textures ≤ 1024² (pattern mask 1024×512, decal atlas 1024²), no motion blur;
 *  - the pattern mask and the decal atlas are redrawn and re-uploaded only when they change, debounced (moving or resizing a
 *    decal is a uniform change, recolouring a pattern is a uniform change);
 *  - the Draw step's layer (lib/shop/ballPaint.ts) is a DataTexture over the painter's own buffer, created only once there is a
 *    drawing; strokes upload just their dirty rectangle (texSubImage2D through renderer.copyTextureToTexture), at most one
 *    upload per 33 ms (≈ 30 a second), and only while the finger moves; no mipmaps, so no per-upload mip rebuild;
 *  - touch devices: ≤ 30 fps while anything moves (lib/shop/studioFrameCap.ts: the island's 33.3 ms slot grid; dt is measured
 *    from the last rendered frame, so the inertia is frame-rate independent); desktop is uncapped;
 *  - sleeps while the tab is hidden; dispose() frees every geometry, material, texture and the GL context.
 * prefers-reduced-motion: no spin preview, no throw inertia, drags turn the ball in 15° steps, the kick is a single quarter turn.
 */
import * as T from 'three';
import {BALL_VERT,ballFrag,MAX_FILLS,MAX_SHADER_DECALS} from './ballShader';
import {decalImage,drawPatternMask,loadDecalFonts} from './ballArt';
import {QUOTES,type BallDecal,type BallDesign,type BallLayout,type Vec3} from './ball';
import {frameCapSlot,studioFrameMs} from './studioFrameCap';

export type StageOpts={coarse:boolean;reducedMotion:boolean;
 /** Called when the kicked ball leaves the foot (strength 1) and on each bounce (0..1): the studio plays the sound. */
 onBounce?:(strength:number)=>void};
export type StageStats={renders:number;rafs:number;uploads:number;programs:number;drawUploads:number;drawTexels:number};
export type DrawRect={x0:number;y0:number;x1:number;y1:number};
export type BallStage={
 setDesign(d:BallDesign):void;
 setSelected(i:number):void;
 /** Local (ball-space) unit direction under a client point, or null when the point misses the ball. */
 pick(x:number,y:number):Vec3|null;
 /** Index of the top-most decal under a ball-space direction, or −1. */
 decalAt(dir:Vec3):number;
 /** Decal turn that makes it upright on screen at dir (plus `offset`). */
 uprightRot(dir:Vec3,offset?:number):number;
 /** Current screen-relative turn of a decal (so a drag keeps it). */
 screenRot(dir:Vec3,rot:number):number;
 grab():void;drag(dx:number,dy:number):void;release(vx:number,vy:number):void;
 zoomBy(f:number):void;reset():void;kick():void;preview():void;pop(i:number):void;
 /** Reduced-motion/keyboard turn: one 30° step. */
 step(dx:number,dy:number):void;
 /** Draw step: show the painter's buffer (premultiplied RGBA, w×h) on the ball; the stage keeps a texture over it. */
 attachPaint(buf:Uint8ClampedArray,w:number,h:number):void;
 /** The painter changed this rectangle: upload it soon (throttled to ~30 uploads a second). */
 paintDirty(r:DrawRect|null):void;
 setDrawVisible(on:boolean):void;
 /** The screen's right and up directions in ball space (for symmetry and upright stamps). */
 viewAxes():{right:Vec3;up:Vec3};
 /** A square picture of the ball (thumbnails): renders one frame and crops round the ball. */
 snapshot(size:number):string;
 /** Spin for a while (show-off mode), then stop by itself. */
 spin(seconds:number):void;
 /** Test hook: the shader's panel id/group under each client point (GPU read-back), or null off the ball. */
 debugPanelIds(pts:[number,number][]):({id:number;grp:number}|null)[];
 setPaused(p:boolean):void;resize():void;dispose():void;
 stats:StageStats;renderer:T.WebGLRenderer;
};

const BLANK=()=>{const t=new T.DataTexture(new Uint8Array([0,0,0,255]),1,1);t.needsUpdate=true;return t;};
function frame(dir:Vec3,rot:number):{up:T.Vector3;d:T.Vector3}{
 const d=new T.Vector3(...dir).normalize(),n=Math.abs(d.y)>.97?new T.Vector3(0,0,1):new T.Vector3(0,1,0);
 const t=n.sub(d.clone().multiplyScalar(n.dot(d))).normalize();return {up:t.applyAxisAngle(d,rot),d};
}
/** The atan chart the shader uses for decals: (angle right, angle up) of p around the decal centre. */
function chart(p:T.Vector3,dir:Vec3,rot:number){const {up,d}=frame(dir,rot),r=new T.Vector3().crossVectors(up,d).normalize(),u=new T.Vector3().crossVectors(d,r);const cd=p.dot(d);
 return {x:Math.atan2(p.dot(r),cd),y:Math.atan2(p.dot(u),cd),front:cd};}
/** Effective half-size of a decal: wide text shrinks so it never wraps more than ~55° each side. */
export function decalHalf(size:number,aspect:number){const h=Math.min(size,.95/Math.max(aspect,.2));return {w:h*aspect,h};}
const linear=(hex:string)=>new T.Color(hex);

export function createBallStage(canvas:HTMLCanvasElement,opts:StageOpts):BallStage{
 const {coarse,reducedMotion:reduced}=opts;
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'default',preserveDrawingBuffer:false});
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NeutralToneMapping;renderer.toneMappingExposure=1.04;renderer.setClearColor(0,0);
 const dpr=()=>Math.min(window.devicePixelRatio||1,coarse?1.5:2);
 const stats:StageStats={renders:0,rafs:0,uploads:0,programs:0,drawUploads:0,drawTexels:0};
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(24,1,.1,60);
 const geo=coarse?new T.SphereGeometry(1,64,48):new T.SphereGeometry(1,112,80);
 const outer=new T.Group(),inner=new T.Group();outer.add(inner);scene.add(outer);
 // ---- textures: pattern mask, decal atlas, contact shadow ----
 const PW=coarse?1024:2048,PH=PW/2,AS=coarse?1024:2048;
 const patCanvas=document.createElement('canvas');patCanvas.width=PW;patCanvas.height=PH;
 const patTex=new T.CanvasTexture(patCanvas);patTex.colorSpace=T.NoColorSpace;patTex.wrapS=T.RepeatWrapping;patTex.anisotropy=4;
 const atlas=document.createElement('canvas');atlas.width=AS;atlas.height=AS;
 const atlasTex=new T.CanvasTexture(atlas);atlasTex.colorSpace=T.SRGBColorSpace;atlasTex.premultiplyAlpha=true;atlasTex.flipY=false;atlasTex.anisotropy=4;
 const sc=document.createElement('canvas');sc.width=sc.height=128;{const g=sc.getContext('2d')!,gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba(38,30,18,.55)');gr.addColorStop(.35,'rgba(38,30,18,.26)');gr.addColorStop(.7,'rgba(38,30,18,.06)');gr.addColorStop(1,'rgba(38,30,18,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);}
 const shadowTex=new T.CanvasTexture(sc);shadowTex.colorSpace=T.SRGBColorSpace;
 const shadowMat=new T.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false,toneMapped:false});
 const shadow=new T.Mesh(new T.PlaneGeometry(3.2,3.2),shadowMat);shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.005;shadow.renderOrder=-1;scene.add(shadow);
 const blank=BLANK();
 const uniforms={uColA:{value:new T.Color()},uColB:{value:new T.Color()},uColC:{value:new T.Color()},uFinish:{value:0},
  uPat:{value:patTex as T.Texture},uPatC1:{value:new T.Color()},uPatC2:{value:new T.Color()},uPatMask:{value:new T.Vector3(1,1,1)},uPatOn:{value:0},
  uDecalTex:{value:blank as T.Texture},uDecalN:{value:0},uSel:{value:-1},
  uDDir:{value:Array.from({length:MAX_SHADER_DECALS},()=>new T.Vector3(0,0,1))},uDUp:{value:Array.from({length:MAX_SHADER_DECALS},()=>new T.Vector3(0,1,0))},
  uDSize:{value:Array.from({length:MAX_SHADER_DECALS},()=>new T.Vector4(.2,.2,0,0))},uDRect:{value:Array.from({length:MAX_SHADER_DECALS},()=>new T.Vector4())},
  uBlur:{value:0},uBlurAxis:{value:new T.Vector3(0,1,0)},uDetail:{value:1},
  uFill:{value:Array.from({length:MAX_FILLS},()=>new T.Vector4(0,0,0,0))},uDraw:{value:blank as T.Texture},uDrawOn:{value:0},uDebug:{value:0}};
 const programs=new Map<BallLayout,T.ShaderMaterial>();
 const matFor=(l:BallLayout)=>{let m=programs.get(l);if(!m){m=new T.ShaderMaterial({vertexShader:BALL_VERT,fragmentShader:ballFrag(l,!coarse),uniforms});m.name=`shop-ball-${l}`;programs.set(l,m);stats.programs=programs.size;}return m;};
 const ball=new T.Mesh(geo,matFor('classic32'));inner.add(ball);

 // ---- motion state ----
 const REST=new T.Quaternion().setFromEuler(new T.Euler(.38,-.42,.06));
 const q=REST.clone(),omega=new T.Vector3(),tmpQ=new T.Quaternion(),tmpV=new T.Vector3(),inv=new T.Quaternion();
 let zoom=1,zoomTo=1,held=false,raf=0,last=0,slot=0,paused=false,disposed=false,hidden=document.hidden;const capMs=studioFrameMs();
 let preview=0,previewLen=2.4;// seconds of opening spin left / its length
 let kick:{t:number;y:number;vy:number;bounce:number;squash:number}|null=null;
 let resetAnim:{t:number;from:T.Quaternion;z0:number}|null=null;
 const pops:number[]=Array(MAX_SHADER_DECALS).fill(1);let popping=false;
 let stepAcc={x:0,y:0};
 let design:BallDesign|null=null,futsal=false;
 let decals:BallDecal[]=[],aspects:number[]=[],atlasKeys='',patKey='',patTimer=0,atlasTimer=0;

 function placeCamera(){const w=canvas.clientWidth||1,h=canvas.clientHeight||1;camera.aspect=w/h;
  // Fit like a product shot: the ball's radius is `f` of the view height (≈62% of the shorter side across), leaving room for the bounce.
  const t=Math.tan(T.MathUtils.degToRad(camera.fov/2)),f=w>=h?.3:.31*w/h,dist=1/(t*f*2)/zoom,elev=T.MathUtils.degToRad(9);
  camera.position.set(0,Math.sin(elev)*dist,Math.cos(elev)*dist);camera.lookAt(0,-.04,0);camera.updateProjectionMatrix();
  // Fine surface detail (dimples, grain) fades when the ball is small on screen so it never shimmers.
  uniforms.uDetail.value=Math.min(1,Math.max(.25,h*dpr()*f*zoom/260));}
 function resize(){const w=canvas.clientWidth||1,h=canvas.clientHeight||1;renderer.setPixelRatio(dpr());renderer.setSize(w,h,false);placeCamera();invalidate();}

 function render(){holderSync();uploadDraw();renderer.render(scene,camera);stats.renders++;}
 // ---- the Draw step's layer ----
 let drawTex:T.DataTexture|null=null,drawPending:DrawRect|null=null,drawTimer=0,lastDrawUp=-1e9,drawFirst=true;
 const box=new T.Box2(),dst=new T.Vector2();
 function uploadDraw(){if(!drawTex||!drawPending)return;const now=performance.now();
  if(now-lastDrawUp<30){scheduleDraw();return;}
  const r=drawPending;drawPending=null;lastDrawUp=now;stats.drawUploads++;stats.drawTexels+=(r.x1-r.x0)*(r.y1-r.y0);
  if(drawFirst){drawFirst=false;drawTex.needsUpdate=true;stats.uploads++;return;}// the first upload is the whole texture
  box.min.set(r.x0,r.y0);box.max.set(r.x1,r.y1);dst.set(r.x0,r.y0);renderer.copyTextureToTexture(drawTex,drawTex,box,dst);}
 function scheduleDraw(){if(drawTimer||disposed)return;const wait=Math.max(0,33-(performance.now()-lastDrawUp));
  if(wait<1&&!raf){invalidate();return;}drawTimer=window.setTimeout(()=>{drawTimer=0;invalidate();},Math.max(1,wait));}
 function holderSync(){inner.quaternion.copy(q);}
 function active(){return held?false:(omega.lengthSq()>4e-4||preview>0||!!kick||!!resetAnim||Math.abs(zoom-zoomTo)>1e-3||popping);}
 function tick(now:number){raf=0;stats.rafs++;if(disposed||paused||hidden)return;
  // touch devices: 30 fps (an early vsync is skipped; the chain still ends when nothing moves)
  if(capMs){const next=frameCapSlot(now,slot,capMs);if(next<0){raf=requestAnimationFrame(tick);return;}slot=next;}
  const dt=Math.min(.05,last?(now-last)/1000:1/60);last=now;
  if(preview>0){preview-=dt;const k=Math.max(0,preview)/previewLen,long=previewLen>3;omega.set(.06,long?2*Math.min(1,k*3):3.2*k*k+.05*k,0);if(preview<=0)omega.set(0,0,0);}
  if(!held&&preview<=0){omega.multiplyScalar(Math.exp(-dt*(kick?1.1:2.6)));if(omega.lengthSq()<4e-4)omega.set(0,0,0);}
  const sp=omega.length();if(sp>1e-5){tmpQ.setFromAxisAngle(tmpV.copy(omega).normalize(),sp*dt);q.premultiply(tmpQ);}
  if(resetAnim){resetAnim.t=Math.min(1,resetAnim.t+dt/.45);const e=1-Math.pow(1-resetAnim.t,3);q.slerpQuaternions(resetAnim.from,REST,e);zoomTo=1;zoom=resetAnim.z0+(1-resetAnim.z0)*e;placeCamera();if(resetAnim.t>=1)resetAnim=null;}
  else if(Math.abs(zoom-zoomTo)>1e-3){zoom+=(zoomTo-zoom)*Math.min(1,dt*14);if(Math.abs(zoom-zoomTo)<1e-3)zoom=zoomTo;placeCamera();}
  if(kick){const g=futsal?-26:-22;kick.t+=dt;kick.vy+=g*dt;kick.y+=kick.vy*dt;kick.squash=Math.max(0,kick.squash-dt*5);
   if(kick.y<=0){kick.y=0;if(kick.vy<-1.2&&kick.bounce<4){const v=Math.abs(kick.vy);opts.onBounce?.(Math.min(1,v/6));kick.vy=-kick.vy*(futsal?.32:.58);kick.bounce++;kick.squash=Math.min(.12,v*.012+.03);}else if(kick.squash<=0)kick=null;else kick.vy=0;}
   const y=kick?.y??0,s=kick?.squash??0;outer.position.y=y;outer.scale.set(1+s*.6,1-s,1+s*.6);outer.position.y=y-s;
   const k=1/(1+y*.55);shadow.scale.setScalar(.75+.25*k);shadowMat.opacity=.35+.65*k;}
  else{outer.position.y=0;outer.scale.set(1,1,1);shadow.scale.setScalar(1);shadowMat.opacity=1;}
  if(popping){popping=false;for(let i=0;i<pops.length;i++)if(pops[i]<1){pops[i]=Math.min(1,pops[i]+dt/.32);popping=popping||pops[i]<1;}applyDecalUniforms();}
  // Motion blur ≈ a 1/50 s shutter (desktop only), in ball space.
  if(!coarse){const b=Math.min(1,sp/50);uniforms.uBlur.value=b>.03?b:0;if(b>.03){inv.copy(q).invert();uniforms.uBlurAxis.value.copy(omega).normalize().applyQuaternion(inv);}}
  render();
  if(active())raf=requestAnimationFrame(tick);else{last=0;uniforms.uBlur.value=0;}
 }
 function invalidate(){if(!raf&&!disposed&&!paused&&!hidden){last=0;raf=requestAnimationFrame(tick);}}
 const vis=()=>{hidden=document.hidden;if(hidden){cancelAnimationFrame(raf);raf=0;}else invalidate();};document.addEventListener('visibilitychange',vis);
 const ro=new ResizeObserver(resize);ro.observe(canvas);
 const lost=(e:Event)=>{e.preventDefault();cancelAnimationFrame(raf);raf=0;};canvas.addEventListener('webglcontextlost',lost);

 // ---- design → uniforms / textures ----
 function applyDecalUniforms(){const n=Math.min(decals.length,MAX_SHADER_DECALS);
  for(let i=0;i<n;i++){const d=decals[i],{up}=frame(d.dir,d.rot),pk=pops[i]<1?easeBack(pops[i]):1,hs=decalHalf(d.size,aspects[i]||1);
   uniforms.uDDir.value[i].set(...d.dir).normalize();uniforms.uDUp.value[i].copy(up);uniforms.uDSize.value[i].set(Math.max(.001,hs.w*pk),Math.max(.001,hs.h*pk),0,0);}
  uniforms.uDecalN.value=atlasKeys?n:0;}
 const easeBack=(t:number)=>{const c=1.9;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2);};
 const keyOf=(d:BallDecal)=>`${d.kind}|${d.ref}|${d.kind==='name'||d.kind==='number'||d.kind==='quote'?d.color:''}`;
 let fontsReady=false;loadDecalFonts().then(()=>{fontsReady=true;if(!disposed&&decals.length){atlasKeys='~';redrawAtlas();}});
 function redrawAtlas(){const g=atlas.getContext('2d')!;g.clearRect(0,0,AS,AS);const cw=AS/2,ch=AS/4;
  decals.slice(0,MAX_SHADER_DECALS).forEach((d,i)=>{const text=d.kind==='quote'?(QUOTES.find(x=>x.id===d.ref)?.text??''):d.ref;
   const img=decalImage(d.kind,d.ref,d.color,text,ch*.98),a=img.aspect;aspects[i]=a;
   let w=cw-8,h=w/a;if(h>ch-8){h=ch-8;w=h*a;}const x=(i%2)*cw+(cw-w)/2,y=Math.floor(i/2)*ch+(ch-h)/2;g.drawImage(img.canvas,x,y,w,h);
   uniforms.uDRect.value[i].set(x/AS,y/AS,w/AS,h/AS);});
  atlasTex.needsUpdate=true;stats.uploads++;uniforms.uDecalTex.value=atlasTex;atlasKeys=decals.map(keyOf).join('§')||'';if(!decals.length)atlasKeys='';
  void fontsReady;applyDecalUniforms();invalidate();}
 function setDesign(d:BallDesign){design=d;futsal=d.futsal;
  const fills=d.art?.fills??[];for(let i=0;i<MAX_FILLS;i++){const f=fills[i];const v=uniforms.uFill.value[i];if(f){const c=linear(f);v.set(c.r,c.g,c.b,1);}else v.set(0,0,0,0);}
  const m=matFor(d.layout);if(ball.material!==m)ball.material=m;
  uniforms.uColA.value.copy(linear(d.colors.a));uniforms.uColB.value.copy(linear(d.colors.b));uniforms.uColC.value.copy(linear(d.colors.c));
  uniforms.uFinish.value=['gloss','matte','dimple','leather','holo','metal'].indexOf(d.finish);
  uniforms.uPatC1.value.copy(linear(d.pattern.c1));uniforms.uPatC2.value.copy(linear(d.pattern.c2));
  const on=d.pattern.on;uniforms.uPatMask.value.set(on==='all'||on==='a'?1:0,on==='all'||on==='b'?1:0,on==='all'||on==='c'?1:0);
  const pk=`${d.pattern.kind}|${d.pattern.seed}`;
  if(pk!==patKey){patKey=pk;clearTimeout(patTimer);if(d.pattern.kind==='none'){uniforms.uPatOn.value=0;}else{patTimer=window.setTimeout(()=>{if(disposed)return;drawPatternMask(patCanvas,d.pattern.kind,d.pattern.seed);patTex.needsUpdate=true;stats.uploads++;uniforms.uPatOn.value=1;invalidate();},70);}}
  // New decals pop in; the atlas is redrawn (debounced) only when what's printed changes.
  const prevIds=decals.map(x=>x.id);decals=d.decals.slice(0,MAX_SHADER_DECALS);
  decals.forEach((x,i)=>{if(prevIds.length&&!prevIds.includes(x.id)&&!reduced){pops[i]=0;popping=true;}else if(!prevIds.includes(x.id))pops[i]=1;else pops[i]=pops[prevIds.indexOf(x.id)]??1;});
  const keys=decals.map(keyOf).join('§');
  if(keys!==atlasKeys){clearTimeout(atlasTimer);if(!decals.length){atlasKeys='';applyDecalUniforms();}else atlasTimer=window.setTimeout(()=>{if(!disposed)redrawAtlas();},60);}
  else applyDecalUniforms();
  invalidate();}

 // ---- picking ----
 const ray=new T.Raycaster(),ndc=new T.Vector2();
 function pick(x:number,y:number):Vec3|null{const r=canvas.getBoundingClientRect();ndc.set((x-r.left)/r.width*2-1,-((y-r.top)/r.height)*2+1);ray.setFromCamera(ndc,camera);
  const c=outer.position,o=ray.ray.origin,d=ray.ray.direction,oc=tmpV.copy(o).sub(c),b=oc.dot(d),cc=oc.lengthSq()-1,disc=b*b-cc;if(disc<0)return null;
  const t=-b-Math.sqrt(disc);const hit=o.clone().addScaledVector(d,t).sub(c).normalize();inv.copy(q).invert();hit.applyQuaternion(inv);return [hit.x,hit.y,hit.z];}
 function decalAt(dir:Vec3){const p=new T.Vector3(...dir);for(let i=Math.min(decals.length,MAX_SHADER_DECALS)-1;i>=0;i--){const d=decals[i],c=chart(p,d.dir,d.rot);if(c.front<.15)continue;const hs=decalHalf(d.size,aspects[i]||1);
   if(Math.abs(c.x)<=hs.w+.03&&Math.abs(c.y)<=hs.h+.03)return i;}return -1;}
 /** Angle of the screen's up direction in the decal's tangent frame at dir (ball space). */
 function camUpAngle(dir:Vec3){const {up:t0,d}=frame(dir,0);inv.copy(q).invert();const cu=new T.Vector3(0,1,0).applyQuaternion(inv);cu.sub(d.clone().multiplyScalar(cu.dot(d)));if(cu.lengthSq()<1e-6)return 0;cu.normalize();
  return Math.atan2(new T.Vector3().crossVectors(t0,cu).dot(d),t0.dot(cu));}

 resize();
 function viewAxes(){camera.updateMatrixWorld();inv.copy(q).invert();const e=camera.matrixWorld.elements;
  const r=new T.Vector3(e[0],e[1],e[2]).applyQuaternion(inv).normalize(),u=new T.Vector3(e[4],e[5],e[6]).applyQuaternion(inv).normalize();
  return {right:[r.x,r.y,r.z] as Vec3,up:[u.x,u.y,u.z] as Vec3};}
 function snapshot(size:number){render();const w=canvas.width,h=canvas.height;
  const c=new T.Vector3().copy(outer.position).project(camera),cx=(c.x*.5+.5)*w,cy=(-c.y*.5+.5)*h;
  const dist=camera.position.distanceTo(outer.position),rpx=h/2/(Math.tan(T.MathUtils.degToRad(camera.fov/2))*dist),side=rpx*2.3;
  const o=document.createElement('canvas');o.width=o.height=size;const g=o.getContext('2d')!;g.fillStyle='#fbefcf';g.fillRect(0,0,size,size);
  g.drawImage(canvas,cx-side/2,cy-side/2,side,side,0,0,size,size);let url=o.toDataURL('image/webp',.72);if(!url.startsWith('data:image/webp'))url=o.toDataURL('image/jpeg',.72);o.width=o.height=1;return url;}
 function debugPanelIds(pts:[number,number][]){const gl=renderer.getContext(),r=canvas.getBoundingClientRect(),px=new Uint8Array(4);
  uniforms.uDebug.value=1;holderSync();renderer.render(scene,camera);
  const out=pts.map(([x,y])=>{if(!pick(x,y))return null;const bx=Math.floor((x-r.left)/r.width*canvas.width),by=Math.floor((1-(y-r.top)/r.height)*canvas.height);
   gl.readPixels(bx,by,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);return {id:px[0],grp:px[1]};});
  uniforms.uDebug.value=0;render();return out;}
 return {
  setDesign,
  setSelected(i){uniforms.uSel.value=i;invalidate();},
  pick,decalAt,
  uprightRot(dir,offset=0){return camUpAngle(dir)+offset;},
  screenRot(dir,rot){return rot-camUpAngle(dir);},
  grab(){held=true;preview=0;omega.set(0,0,0);resetAnim=null;stepAcc={x:0,y:0};},
  drag(dx,dy){const k=2.9/Math.max(200,canvas.clientHeight);
   if(reduced){stepAcc.x+=dx*k;stepAcc.y+=dy*k;const S=Math.PI/12;let moved=false;
    while(Math.abs(stepAcc.x)>=S){const s=Math.sign(stepAcc.x)*S;q.premultiply(tmpQ.setFromAxisAngle(tmpV.set(0,1,0),s));stepAcc.x-=s;moved=true;}
    while(Math.abs(stepAcc.y)>=S){const s=Math.sign(stepAcc.y)*S;q.premultiply(tmpQ.setFromAxisAngle(tmpV.set(1,0,0),s));stepAcc.y-=s;moved=true;}
    if(moved)invalidate();return;}
   q.premultiply(tmpQ.setFromAxisAngle(tmpV.set(0,1,0),dx*k));q.premultiply(tmpQ.setFromAxisAngle(tmpV.set(1,0,0),dy*k));invalidate();},
  release(vx,vy){held=false;if(!reduced){const k=2.9/Math.max(200,canvas.clientHeight);omega.set(vy*k,vx*k,0);if(omega.length()>14)omega.setLength(14);}invalidate();},
  zoomBy(f){zoomTo=Math.min(1.75,Math.max(.72,zoomTo*f));if(reduced){zoom=zoomTo;placeCamera();}invalidate();},
  reset(){omega.set(0,0,0);preview=0;if(reduced){q.copy(REST);zoom=zoomTo=1;placeCamera();invalidate();return;}resetAnim={t:0,from:q.clone(),z0:zoom};invalidate();},
  kick(){preview=0;resetAnim=null;if(reduced){opts.onBounce?.(1);q.premultiply(tmpQ.setFromAxisAngle(tmpV.set(1,0,0),-Math.PI/2));invalidate();return;}
   omega.set(-16-Math.random()*4,(Math.random()-.5)*8,(Math.random()-.5)*3);kick={t:0,y:0,vy:futsal?3.2:4.6,bounce:0,squash:.08};opts.onBounce?.(1);invalidate();},
  preview(){if(reduced)return;preview=previewLen=2.4;invalidate();},
  pop(i){if(reduced||i<0||i>=pops.length)return;pops[i]=0;popping=true;invalidate();},
  attachPaint(buf,w,h){if(drawTex)return;drawTex=new T.DataTexture(new Uint8Array(buf.buffer,buf.byteOffset,buf.length),w,h,T.RGBAFormat,T.UnsignedByteType);
   drawTex.colorSpace=T.SRGBColorSpace;drawTex.magFilter=T.LinearFilter;drawTex.minFilter=T.LinearFilter;drawTex.generateMipmaps=false;drawTex.wrapS=T.RepeatWrapping;drawTex.wrapT=T.ClampToEdgeWrapping;
   drawTex.flipY=false;drawTex.premultiplyAlpha=false;drawFirst=true;uniforms.uDraw.value=drawTex;drawPending={x0:0,y0:0,x1:w,y1:h};scheduleDraw();},
  paintDirty(r){if(!drawTex||!r)return;drawPending=drawPending?{x0:Math.min(drawPending.x0,r.x0),y0:Math.min(drawPending.y0,r.y0),x1:Math.max(drawPending.x1,r.x1),y1:Math.max(drawPending.y1,r.y1)}:{...r};scheduleDraw();},
  setDrawVisible(on){const v=on&&drawTex?1:0;if(uniforms.uDrawOn.value!==v){uniforms.uDrawOn.value=v;invalidate();}},
  viewAxes,snapshot,debugPanelIds,
  spin(seconds){if(reduced)return;preview=previewLen=Math.max(.5,seconds);resetAnim=null;invalidate();},
  step(dx,dy){const S=Math.PI/6;if(dx)q.premultiply(tmpQ.setFromAxisAngle(tmpV.set(0,1,0),dx*S));if(dy)q.premultiply(tmpQ.setFromAxisAngle(tmpV.set(1,0,0),dy*S));invalidate();},
  setPaused(p){paused=p;if(p){cancelAnimationFrame(raf);raf=0;}else invalidate();},
  resize,
  dispose(){disposed=true;cancelAnimationFrame(raf);raf=0;clearTimeout(patTimer);clearTimeout(atlasTimer);clearTimeout(drawTimer);drawTex?.dispose();drawTex=null;ro.disconnect();document.removeEventListener('visibilitychange',vis);canvas.removeEventListener('webglcontextlost',lost);
   for(const m of programs.values())m.dispose();programs.clear();geo.dispose();patTex.dispose();atlasTex.dispose();shadowTex.dispose();blank.dispose();shadow.geometry.dispose();shadowMat.dispose();
   renderer.renderLists.dispose();renderer.dispose();renderer.forceContextLoss();patCanvas.width=patCanvas.height=atlas.width=atlas.height=sc.width=sc.height=1;void design;},
  stats,renderer,
 };
}
