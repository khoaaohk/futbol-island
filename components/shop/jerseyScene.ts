/**
 * Jersey studio 3D scene (Oct 12 2026). Imported with `await import('./jerseyScene')` when the studio opens, so three.js and the
 * mesh/painter code load only then.
 *
 * Heat rules (AGENTS.md "Mobile heat"; docs/performance-guide.md):
 *  - Renders ON DEMAND only: a frame is requested by a drag, pinch, wheel, edit, resize, an inertia spin, a camera tween or the
 *    one short auto-turn preview. When nothing moves, no requestAnimationFrame is pending (0 rAF at rest).
 *  - Pixel ratio ≤ 1.5 on phones (≤ 2 elsewhere); the design texture is 1024² on phones, 2048² on desktop, repainted and
 *    re-uploaded only after an edit (debounced). Two draw calls: the shirt body (one mesh) and the trims (collar, cuffs).
 *  - No shadows, no post-processing, one key light + a hemisphere fill; the AO is baked into vertex colours.
 *  - Paused while the tab is hidden; everything (renderer, geometries, materials, textures, listeners) is disposed on close.
 *  - prefers-reduced-motion: no auto-turn and no inertia; dragging turns the shirt in 45° steps; view changes are instant.
 *
 * v2 (Oct 12 2026), DRAW YOUR OWN DESIGN:
 *  - The atlas is composited from three cached canvases: base (pattern) → the child's art layer → prints (crest, sponsor, name,
 *    numbers), so prints stay crisp. Layered mode starts only when a design has art or the Draw step opens.
 *  - Painting: one finger (or the mouse) paints straight onto the 3D shirt. Pointer → UV comes from a PICK BUFFER: the shirt is
 *    rendered once into a small UV-encoded render target and read back when the view has changed, so each pointer move is an
 *    array lookup (no raycast against ~15k triangles). Strokes are drawn into the art layer on pointer events only.
 *  - Uploads: the dirty rect is re-composited and sent with texSubImage2D (+ mipmaps) at most every 33 ms (≤ 30/s) while
 *    painting, through a small staging canvas; a full upload happens only on a design edit or when leaving the flat view.
 *  - Flat view: a 2D template of the front / back / sleeves (the garment shape comes from the mesh UVs) for precise drawing.
 *    The WebGL canvas does not render while it is shown.
 *  - Show-off: a turntable that renders at ≤ 30 fps and stops by itself after three turns. 0 rAF at rest still holds.
 *  - Touch devices: every frame (spin, drag, inertia, tweens) at ≤ 30 fps on the island's 33.3 ms slot grid
 *    (lib/shop/studioFrameCap.ts); dt runs from the last rendered frame, so the inertia is frame-rate independent. Desktop: uncapped.
 */
import * as THREE from 'three';
import {type JerseyDesign} from '@/lib/shop/jersey';
import {paintAtlas,paintAtlasBase,paintAtlasPrints,JERSEY_SURFACE,regionAllowed,regionView} from '@/lib/shop/jerseyPaint';
import {buildJersey,type MeshData} from '@/lib/shop/jerseyShape';
import {frameCapSlot,studioFrameMs} from '@/lib/shop/studioFrameCap';
import {applyInsetOffset,fitDistance,sameInsets,type StageInsets} from '@/lib/shop/studioSheet';
import {type ArtOp,type ArtPoint,type ArtShape,type ArtSize,type PxRect,ART_GRID,ART_MAX_CHARS,ART_MAX_POINTS,StrokePainter,encodePoints,artFits,artStats,drawOp,renderArt,unionRect} from '@/lib/shop/paint/artOps';

export type JerseyFocus='full'|'crest'|'back'|'collar'|'sleeve'|'side';
export type JerseyAngle='front'|'back'|'left'|'right';
export type DrawTool='brush'|'spray'|'eraser'|'fill'|'line'|'stamp'|'hand';
export type PaintLock='all'|'front'|'back'|'sleeves';
export interface DrawConfig{tool:DrawTool;size:ArtSize;color:string;mirror:boolean;lock:PaintLock;stamp:ArtShape}
export interface JerseySceneOptions{reducedMotion:boolean;onFace?:(face:'front'|'back')=>void;onInteract?:()=>void;
 /** A finished stroke / stamp / fill (already on the shirt): the studio adds it to the design (one undo step). */
 onArt?:(op:ArtOp)=>void;
 /** The drawing hit its size cap. */
 onArtFull?:()=>void;
 /** A paint tap missed the shirt or the locked panel. */
 onArtMiss?:()=>void;
 onShowOffEnd?:()=>void}
export interface JerseySceneApi{
 setDesign(d:JerseyDesign,opts?:{pulse?:boolean}):void;
 /** Shows a design without committing it (hover / press preview); null restores the real one. */
 preview(d:JerseyDesign|null):void;
 setView(face:JerseyAngle,focus?:JerseyFocus):void;
 resetView():void;
 spin():void;
 /** Draw mode (null = off: one finger turns the shirt again). */
 setDraw(cfg:DrawConfig|null):void;
 /** The flat template view (draw mode only). */
 setFlat(on:boolean):void;
 showOff(on:boolean):void;
 /** Phones: the stage's visible box (CSS px off the host's top / bottom, lib/shop/studioSheet.ts); the shirt (and the flat
  *  template) is re-fitted and centred in it. null = the legacy whole-stage fit (desktop, show-off). */
 setInsets(i:StageInsets|null):void;
 stats():{renders:number;frames:number;paints:number;uploads:number;subUploads:number;pickRenders:number;flatDraws:number;rafPending:boolean;layered:boolean;textureSize:number;pixelRatio:number;calls:number;triangles:number};
 dispose():void;
}

const FOCI:Record<JerseyFocus,{tx:number;ty:number;zoom:number;el:number}>={
 full:{tx:0,ty:0,zoom:1,el:.07},
 crest:{tx:.05,ty:.16,zoom:.5,el:.05},
 back:{tx:0,ty:.1,zoom:.86,el:.04},
 collar:{tx:0,ty:.25,zoom:.5,el:.32},
 sleeve:{tx:.24,ty:.12,zoom:.62,el:.1},
 side:{tx:0,ty:.1,zoom:.78,el:.08},
};
const ANGLE:Record<JerseyAngle,number>={front:0,back:Math.PI,left:-Math.PI/2,right:Math.PI/2};
const PICK_VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
// UV packed into RGBA8 (16 bits per axis, +1 so a hit is never all-zero); back faces (the inside) are not paintable.
const PICK_FS='varying vec2 vUv;void main(){if(!gl_FrontFacing){gl_FragColor=vec4(0.0);return;}vec2 q=floor(clamp(vUv,0.0,1.0)*65534.0+1.0);'+
 'gl_FragColor=vec4(floor(q.x/256.0)/255.0,mod(q.x,256.0)/255.0,floor(q.y/256.0)/255.0,mod(q.y,256.0)/255.0);}';
const TAU=Math.PI*2;
const wrapAngle=(a:number)=>((a%TAU)+TAU+Math.PI)%TAU-Math.PI;

function knitNormalMap(){
 // Sports-jersey pique: a fine honeycomb of tiny dimples (the breathable eyelet mesh of real kits), as a tiling normal map.
 const N=128,h=new Float32Array(N*N),cell=8;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const row=Math.floor(y/cell),ox=(row&1)*cell/2;
  const cx=((x+ox)%cell)-cell/2+.5,cy=(y%cell)-cell/2+.5,r=Math.hypot(cx*1.1,cy)/(cell*.5);
  h[y*N+x]=1-.85*Math.pow(Math.max(0,1-r*r*1.3),2)+.08*Math.sin(y/cell*Math.PI*2);
 }
 const data=new Uint8Array(N*N*4),s=2.2;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const at=(i:number,j:number)=>h[((j+N)%N)*N+((i+N)%N)];
  const dx=(at(x+1,y)-at(x-1,y))*s,dy=(at(x,y+1)-at(x,y-1))*s,l=Math.hypot(dx,dy,1);
  const o=(y*N+x)*4;data[o]=(-dx/l*.5+.5)*255;data[o+1]=(dy/l*.5+.5)*255;data[o+2]=(1/l*.5+.5)*255;data[o+3]=255;
 }
 const t=new THREE.DataTexture(data,N,N,THREE.RGBAFormat);
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;
 t.repeat.set(24,24);t.needsUpdate=true;return t;
}
function ribNormalMap(){
 const W=32,H=4,data=new Uint8Array(W*H*4);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const dx=Math.sin(x/W*TAU)*1.4,l=Math.hypot(dx,1),o=(y*W+x)*4;
  data[o]=(-dx/l*.5+.5)*255;data[o+1]=128;data[o+2]=(1/l*.5+.5)*255;data[o+3]=255;
 }
 const t=new THREE.DataTexture(data,W,H,THREE.RGBAFormat);
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;
}
/** Fabric touches for MeshStandardMaterial: stitched seams + creases (body only), a darker inside, and a soft cloth sheen. */
function fabric(mat:THREE.MeshStandardMaterial,seams:boolean){
 mat.onBeforeCompile=shader=>{
  if(seams){
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute vec2 seam;\nvarying vec2 vSeam;')
    .replace('#include <begin_vertex>','#include <begin_vertex>\nvSeam=seam;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vSeam;')
    .replace('#include <map_fragment>',`#include <map_fragment>
 {
  float d=vSeam.x,fw=fwidth(d)+1e-6;
  float crease=1.0-smoothstep(0.0,0.0026+fw,d);
  float dash=smoothstep(0.08,0.2,fract(vSeam.y/0.0058))*(1.0-smoothstep(0.62,0.74,fract(vSeam.y/0.0058)));
  float w=0.00062+fw*0.6;
  float st=max(1.0-smoothstep(w*0.45,w,abs(d-0.0052)),1.0-smoothstep(w*0.45,w,abs(d-0.0094)))*dash;
  float vis=1.0-smoothstep(0.0011,0.0032,fw);
  diffuseColor.rgb*=1.0-0.3*crease;
  diffuseColor.rgb*=1.0-0.3*st*vis;
 }`);
  }
  shader.fragmentShader=shader.fragmentShader
   .replace('#include <color_fragment>','#include <color_fragment>\nif(!gl_FrontFacing)diffuseColor.rgb*=0.48;')
   .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.indirectDiffuse+=diffuseColor.rgb*pow(1.0-saturate(dot(normal,geometryViewDir)),3.0)*0.32;');
 };
}

function toGeometry(m:MeshData,withSeam:boolean){
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(m.position,3));
 g.setAttribute('normal',new THREE.BufferAttribute(m.normal,3));
 g.setAttribute('uv',new THREE.BufferAttribute(m.uv,2));
 g.setAttribute('color',new THREE.BufferAttribute(withSeam?m.color:new Float32Array(m.color),3));
 if(withSeam)g.setAttribute('seam',new THREE.BufferAttribute(m.seam,2));
 g.setIndex(new THREE.BufferAttribute(m.index,1));
 g.computeBoundingSphere();
 return g;
}

export function createJerseyScene(host:HTMLElement,opts:JerseySceneOptions):JerseySceneApi{
 const coarse=typeof matchMedia!=='undefined'&&matchMedia('(pointer:coarse)').matches;
 const phone=coarse||Math.min(screen.width,screen.height)<768;
 const pixelRatio=Math.min(window.devicePixelRatio||1,phone?1.5:2);
 const texSize=phone?1024:2048;
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power',preserveDrawingBuffer:false});
 renderer.setPixelRatio(pixelRatio);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1.02;
 renderer.setClearColor(0x000000,0);
 const canvas=renderer.domElement;
 canvas.style.cssText='display:block;width:100%;height:100%;touch-action:none;outline:none';
 canvas.setAttribute('aria-hidden','true');
 host.appendChild(canvas);

 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(30,1,.1,20);
 scene.add(new THREE.HemisphereLight(0xfff3df,0x3e4a44,1.1));
 const key=new THREE.DirectionalLight(0xfffaf2,2.7);key.position.set(-2.3,2.5,2.1);scene.add(key);

 // design texture (one CanvasTexture, repainted on edit)
 const atlas=document.createElement('canvas');atlas.width=atlas.height=texSize;
 const actx=atlas.getContext('2d')!;
 const design=new THREE.CanvasTexture(atlas);
 design.colorSpace=THREE.SRGBColorSpace;design.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),phone?2:4);
 design.minFilter=THREE.LinearMipmapLinearFilter;design.generateMipmaps=true;
 const knit=knitNormalMap(),rib=ribNormalMap();
 // v2 layers (created on first use): base pattern, the art layer, prints; plus a small staging canvas for sub-rect uploads
 let baseC:HTMLCanvasElement|null=null,layerC:HTMLCanvasElement|null=null,printsC:HTMLCanvasElement|null=null,stageC:HTMLCanvasElement|null=null;
 let bctx:CanvasRenderingContext2D|null=null,lctx:CanvasRenderingContext2D|null=null,pctx:CanvasRenderingContext2D|null=null;
 let layered=false,baseKey='',printsKey='',shownKey='',applied:ArtOp[]=[];
 const bodyMat=new THREE.MeshStandardMaterial({map:design,normalMap:knit,normalScale:new THREE.Vector2(.4,.4),roughness:.74,metalness:0,vertexColors:true,side:THREE.DoubleSide});
 fabric(bodyMat,true);
 const trimMat=new THREE.MeshStandardMaterial({normalMap:rib,normalScale:new THREE.Vector2(.6,.6),roughness:.86,metalness:0,vertexColors:true,side:THREE.DoubleSide});
 fabric(trimMat,false);
 const group=new THREE.Group(),inner=new THREE.Group();inner.position.y=-.37;group.add(inner);scene.add(group);
 let body:THREE.Mesh|null=null,trim:THREE.Mesh|null=null,shapeKey='',current:JerseyDesign|null=null,previewD:JerseyDesign|null=null;
 const shown=()=>previewD??current;
 let halfW=.45;

 // ---- state -----------------------------------------------------------------------------------------------------------
 const st={yaw:0,el:FOCI.full.el,zoom:1,tx:0,ty:0,vel:0,scale:1};
 let tween:{from:typeof st;to:Partial<typeof st>;t0:number;dur:number}|null=null;
 let auto:{t0:number;dur:number;from:number;to:number}|null=null;
 let pulse:number|null=null;
 let raf=0,last=0,disposed=false,renders=0,frames=0,paints=0,uploads=0,subUploads=0,pickRenders=0,flatDraws=0,face:'front'|'back'='front';
 let showoff:{until:number}|null=null,lastRender=0,flatOn=false,texStale=false,slot=0;const capMs=studioFrameMs();
 let paintTimer:ReturnType<typeof setTimeout>|undefined,firstPaint=true;
 const reduced=opts.reducedMotion;

 let insets:StageInsets|null=null;
 const request=()=>{if(!raf&&!disposed&&!document.hidden){raf=requestAnimationFrame(frame);}};
 function fit(){
  const w=host.clientWidth||1,h=host.clientHeight||1;
  renderer.setSize(w,h,false);camera.aspect=w/h;applyInsetOffset(camera,w,h,insets);
 }
 function applyCamera(){
  // fit the shirt (sleeves included) with room for the Front/Back toggle under it: the view centre sits a little low
  // phones (the resizable sheet, Oct 14 2026): fit the visible box between the icon row and the view chips / sheet, centred
  // there by a view offset (fit()), so no low-sitting allowance for the toggle is needed; desktop keeps the legacy fit
  const w=host.clientWidth||1,h=host.clientHeight||1;
  const halfH=insets?.4:Math.max(.45,(halfW*1.1)/camera.aspect)*1.12;
  const dist=(insets?fitDistance({fov:camera.fov,w,h,insets,halfW:halfW*1.1,halfH:.4,fillW:1/1.06,fillH:.98}):halfH/Math.tan(THREE.MathUtils.degToRad(camera.fov/2)))*st.zoom;
  const cy=insets?st.ty:st.ty-halfH*.13*Math.min(1,st.zoom);
  camera.position.set(st.tx,cy+Math.sin(st.el)*dist,Math.cos(st.el)*dist);
  camera.lookAt(st.tx,cy,0);
  group.rotation.y=st.yaw;group.scale.setScalar(st.scale);
  const f=Math.cos(wrapAngle(st.yaw))>=0?'front':'back';
  if(f!==face){face=f;opts.onFace?.(f);}
 }
 function frame(now:number){
  raf=0;frames++;
  if(flatOn){last=0;return;}// the flat view is 2D: the WebGL canvas is hidden and does not render
  // touch devices: 30 fps (an early vsync is skipped; nothing is scheduled once nothing moves)
  if(capMs){const next=frameCapSlot(now,slot,capMs);if(next<0){request();return;}slot=next;}
  const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;
  let moving=false;
  if(showoff){st.yaw+=.85*dt;if(now>showoff.until){showoff=null;st.yaw=wrapAngle(st.yaw);opts.onShowOffEnd?.();}else moving=true;
   // the turntable renders at ≤ 30 fps (half the frames of a 60 Hz screen)
   if(showoff&&now-lastRender<30){request();return;}}
  if(tween){const p=Math.min(1,(now-tween.t0)/tween.dur),e=1-Math.pow(1-p,3);
   for(const k of Object.keys(tween.to) as (keyof typeof st)[])st[k]=tween.from[k]+((tween.to[k] as number)-tween.from[k])*e;
   if(p>=1)tween=null;else moving=true;}
  if(auto){const p=Math.max(0,Math.min(1,(now-auto.t0)/auto.dur)),e=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;st.yaw=auto.from+(auto.to-auto.from)*e;if(p>=1){auto=null;st.yaw=wrapAngle(st.yaw);}else moving=true;}
  if(st.vel){st.yaw+=st.vel*dt;st.vel*=Math.exp(-3.2*dt);if(Math.abs(st.vel)<.07)st.vel=0;else moving=true;}
  if(pulse!=null){const p=Math.min(1,(now-pulse)/320);st.scale=1+.022*Math.sin(p*Math.PI);if(p>=1){pulse=null;st.scale=1;}else moving=true;}
  applyCamera();
  renderer.render(scene,camera);renders++;lastRender=now;
  if(moving)request();else last=0;
 }

 // ---- design --------------------------------------------------------------------------------------------------------------
 function trimColours(d:JerseyDesign){
  if(!trim)return;
  const role=(trim.userData.role as Float32Array),col=trim.geometry.getAttribute('color') as THREE.BufferAttribute;
  const a=new THREE.Color(d.accent).convertSRGBToLinear(),b=new THREE.Color('#f4efe2').convertSRGBToLinear();
  for(let i=0;i<role.length;i++){const c=role[i]===1?b:a;col.setXYZ(i,c.r,c.g,c.b);}
  col.needsUpdate=true;
 }
 function rebuild(d:JerseyDesign){
  const k=`${d.sleeves}|${d.collar}|${d.cuffs}`;if(k===shapeKey)return;shapeKey=k;
  const m=buildJersey({sleeves:d.sleeves,collar:d.collar,cuffs:d.cuffs});
  body?.geometry.dispose();trim?.geometry.dispose();
  if(body)inner.remove(body);if(trim)inner.remove(trim);
  body=new THREE.Mesh(toGeometry(m.body,true),bodyMat);
  trim=new THREE.Mesh(toGeometry(m.trim,false),trimMat);trim.userData.role=m.trim.role;
  inner.add(body,trim);
  halfW=d.sleeves==='long'?.62:.45;
  template=null;pickSig='';
 }
 const keyBase=(d:JerseyDesign)=>`${d.pattern}${d.primary}${d.secondary}${d.accent}`;
 const keyPrints=(d:JerseyDesign)=>JSON.stringify([d.name,d.number,d.font,d.outline,d.frontNumber,d.textColor,d.accent,d.primary,d.crest,d.sponsor]);
 function canvas2d(){const c=document.createElement('canvas');c.width=c.height=texSize;return c;}
 function ensureLayers(){
  if(layered)return;layered=true;
  baseC=canvas2d();layerC=canvas2d();printsC=canvas2d();stageC=document.createElement('canvas');
  bctx=baseC.getContext('2d')!;lctx=layerC.getContext('2d')!;pctx=printsC.getContext('2d')!;
  baseKey=printsKey='';applied=[];
 }
 /** Brings the art layer up to the design's ops: appends new ops, or replays everything after an undo / load / clear. */
 function syncLayer(d:JerseyDesign):boolean{
  const ops=d.art?.ops??[];
  const prefix=ops.length>=applied.length&&applied.every((o,i)=>o===ops[i]);
  if(prefix&&ops.length===applied.length)return false;
  if(prefix){for(let i=applied.length;i<ops.length;i++)drawOp(lctx!,layerC!,texSize,JERSEY_SURFACE,ops[i]);}
  else renderArt(lctx!,layerC!,texSize,JERSEY_SURFACE,{v:1,ops});
  applied=ops.slice();return true;
 }
 function paint(){
  const d=shown();if(!d||disposed)return;
  if(!layered&&d.art?.ops.length)ensureLayers();
  if(!layered){
   const k=JSON.stringify({...d,art:undefined});if(k===shownKey)return;shownKey=k;
   paintAtlas(actx,d,texSize);
  }else{
   let changed=false;
   const bk=keyBase(d);if(bk!==baseKey){baseKey=bk;paintAtlasBase(bctx!,d,texSize);changed=true;}
   const pk=keyPrints(d);if(pk!==printsKey){printsKey=pk;pctx!.clearRect(0,0,texSize,texSize);paintAtlasPrints(pctx!,d,texSize);changed=true;}
   if(syncLayer(d))changed=true;
   if(!changed&&!texStale)return;
   actx.drawImage(baseC!,0,0);actx.drawImage(layerC!,0,0);actx.drawImage(printsC!,0,0);
  }
  paints++;
  if(flatOn){flatDraw(null);texStale=true;return;}
  texStale=false;
  design.needsUpdate=true;uploads++;
  request();
 }
 function schedulePaint(){
  clearTimeout(paintTimer);
  if(firstPaint){firstPaint=false;paint();return;}
  paintTimer=setTimeout(paint,110);
 }
 const fontsReady=new Set<string>();
 function ensureFont(d:JerseyDesign){
  if(d.font!=='brush'||fontsReady.has('brush')||!document.fonts)return;
  fontsReady.add('brush');
  document.fonts.load('48px IslandBrush').then(()=>{if(!disposed){shownKey='';printsKey='';schedulePaint();}}).catch(()=>{});
 }

 // ---- view ------------------------------------------------------------------------------------------------------------------
 function animateTo(to:Partial<typeof st>,dur=520){
  auto=null;st.vel=0;
  if(reduced){Object.assign(st,to);tween=null;request();return;}
  tween={from:{...st},to,t0:performance.now(),dur};request();
 }
 function setView(f:JerseyAngle,focus:JerseyFocus='full'){
  showoff=null;
  const target=ANGLE[f];
  const cur=st.yaw,delta=wrapAngle(target-cur);
  const F=FOCI[focus];
  animateTo({yaw:cur+delta,zoom:F.zoom,tx:F.tx,ty:F.ty,el:F.el});
 }

 // ---- input -------------------------------------------------------------------------------------------------------------------
 const pts=new Map<number,{x:number;y:number}>();
 let lastMove=0,rawYaw=0,pinch:{d:number;zoom:number;mx:number;my:number;tx:number;ty:number}|null=null;
 let lastTap=0,downAt={x:0,y:0,t:0};
 const STEP=Math.PI/4;
 function interrupt(){auto=null;tween=null;showoff=null;st.vel=0;opts.onInteract?.();}
 function onDown(e:PointerEvent){
  if(e.button>0)return;
  if(drawCfg&&drawCfg.tool!=='hand'&&!pts.size&&!stroke){
   try{canvas.setPointerCapture(e.pointerId);}catch{/* synthetic pointer */}
   interrupt();strokeStart(e,uvFromScene);return;
  }
  if(stroke&&stroke.pointer!==e.pointerId){// a second finger: drop the stroke and pinch instead
   const first={x:stroke.lastX,y:stroke.lastY},id=stroke.pointer;strokeCancel();pts.set(id,first);
  }
  try{canvas.setPointerCapture(e.pointerId);}catch{/* synthetic pointer */}pts.set(e.pointerId,{x:e.clientX,y:e.clientY});interrupt();
  rawYaw=st.yaw;lastMove=performance.now();downAt={x:e.clientX,y:e.clientY,t:lastMove};
  if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),zoom:st.zoom,mx:(a.x+b.x)/2,my:(a.y+b.y)/2,tx:st.tx,ty:st.ty};}
 }
 function onMove(e:PointerEvent){
  if(stroke&&stroke.pointer===e.pointerId){strokeMove(e,uvFromScene);return;}
  if(drawCfg&&!pts.size)hover(e,uvFromScene);
  const p=pts.get(e.pointerId);if(!p)return;
  const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  const now=performance.now();
  if(pts.size>=2&&pinch){
   const [a,b]=[...pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y)||1;
   st.zoom=THREE.MathUtils.clamp(pinch.zoom*pinch.d/d,.42,1.3);
   const worldPerPx=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.position.distanceTo(new THREE.Vector3(st.tx,st.ty,0))/(host.clientHeight||1);
   st.tx=THREE.MathUtils.clamp(pinch.tx-((a.x+b.x)/2-pinch.mx)*worldPerPx,-.4,.4);
   st.ty=THREE.MathUtils.clamp(pinch.ty+((a.y+b.y)/2-pinch.my)*worldPerPx,-.3,.35);
   request();return;
  }
  const dYaw=dx*.0105;
  if(reduced){rawYaw+=dYaw;const snapped=Math.round(rawYaw/STEP)*STEP;if(snapped!==st.yaw){st.yaw=snapped;request();}}
  else{st.yaw+=dYaw;const dt=Math.max(8,now-lastMove)/1000;st.vel=st.vel*.4+(dYaw/dt)*.6;st.el=THREE.MathUtils.clamp(st.el+dy*.004,-.12,.5);request();}
  lastMove=now;
 }
 function onUp(e:PointerEvent){
  if(stroke&&stroke.pointer===e.pointerId){strokeEnd(e,uvFromScene,e.type==='pointercancel');return;}
  if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);
  if(pts.size<2)pinch=null;
  if(pts.size===1){const [p]=[...pts.values()];void p;st.vel=0;return;}
  const now=performance.now();
  const tap=Math.hypot(e.clientX-downAt.x,e.clientY-downAt.y)<10&&now-downAt.t<300;
  if(tap){if(now-lastTap<320){lastTap=0;resetView();return;}lastTap=now;st.vel=0;return;}
  if(reduced||now-lastMove>90){st.vel=0;return;}
  st.vel=THREE.MathUtils.clamp(st.vel,-9,9);request();
 }
 function onWheel(e:WheelEvent){e.preventDefault();interrupt();st.zoom=THREE.MathUtils.clamp(st.zoom*Math.exp(e.deltaY*.0012),.42,1.3);request();}
 function onKey(e:KeyboardEvent){
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();interrupt();const d=e.key==='ArrowLeft'?-STEP:STEP;animateTo({yaw:st.yaw+d},280);}
 }
 // ---- drawing --------------------------------------------------------------------------------------------------------------
 let drawCfg:DrawConfig|null=null;
 type UvFn=(x:number,y:number)=>{u:number;v:number;upp:number}|null;
 interface Stroke{pointer:number;tool:DrawTool;painter:StrokePainter|null;pts:ArtPoint[];chars:number;baseChars:number;basePts:number;
  lastG:{x:number;y:number}|null;up:boolean;full:boolean;start:{u:number;v:number;region:number;x:number;y:number}|null;lastX:number;lastY:number}
 let stroke:Stroke|null=null;
 const MIN_STEP=10;// grid units between kept points (≈ 1.7 mm of cloth)
 // the brush ring (follows the pointer with a CSS transform: no layout, no WebGL) and the straight-line preview
 const ring=document.createElement('div'),lineEl=document.createElement('div');
 ring.style.cssText='position:absolute;left:0;top:0;z-index:4;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1.5px #17352bb3,inset 0 0 0 1px #17352b66;pointer-events:none;display:none;will-change:transform';
 lineEl.style.cssText='position:absolute;left:0;top:0;z-index:4;height:6px;border-radius:9px;transform-origin:0 50%;pointer-events:none;display:none;opacity:.85';
 ring.setAttribute('aria-hidden','true');lineEl.setAttribute('aria-hidden','true');
 host.appendChild(ring);host.appendChild(lineEl);
 let ringPx=20;
 function placeRing(x:number,y:number,diam:number|null){
  const r=host.getBoundingClientRect();
  if(diam!=null&&Math.abs(diam-ringPx)>.5){ringPx=Math.max(6,Math.min(220,diam));ring.style.width=ring.style.height=`${ringPx}px`;ring.style.margin=`${-ringPx/2}px 0 0 ${-ringPx/2}px`;}
  ring.style.transform=`translate(${x-r.left}px,${y-r.top}px)`;ring.style.display='block';
 }
 const toolUnit=()=>{const c=drawCfg!;const S=JERSEY_SURFACE;return c.tool==='stamp'?S.stamp[c.size]*2:c.tool==='spray'?S.brush[c.size]*1.7:c.tool==='fill'?S.brush[0]:S.brush[c.size];};

 // pick buffer: UV under each CSS pixel of the stage for the current view
 let pickRT:THREE.WebGLRenderTarget|null=null,pickBuf:Uint8Array|null=null,pickW=0,pickH=0,pickScale=1,pickSig='',pickRect:DOMRect|null=null;
 const pickMat=new THREE.ShaderMaterial({vertexShader:PICK_VS,fragmentShader:PICK_FS,side:THREE.DoubleSide,blending:THREE.NoBlending});
 const occMat=new THREE.MeshBasicMaterial({color:0x000000,side:THREE.DoubleSide});
 const sig=()=>`${st.yaw.toFixed(4)}|${st.el.toFixed(4)}|${st.zoom.toFixed(4)}|${st.tx.toFixed(4)}|${st.ty.toFixed(4)}|${st.scale}|${host.clientWidth}x${host.clientHeight}|${insets?`${insets.top},${insets.bottom}`:''}|${shapeKey}`;
 function ensurePick(){
  if(!body||!trim)return false;
  const s=sig();pickRect=canvas.getBoundingClientRect();if(s===pickSig&&pickBuf)return true;
  const cw=Math.max(1,host.clientWidth),ch=Math.max(1,host.clientHeight);
  pickScale=Math.min(1,900/Math.max(cw,ch));const w=Math.max(1,Math.round(cw*pickScale)),h=Math.max(1,Math.round(ch*pickScale));
  if(!pickRT||pickW!==w||pickH!==h){pickRT?.dispose();pickRT=new THREE.WebGLRenderTarget(w,h,{depthBuffer:true,stencilBuffer:false});pickW=w;pickH=h;pickBuf=new Uint8Array(w*h*4);}
  applyCamera();
  const bm=body.material,tm=trim.material;body.material=pickMat;trim.material=occMat;
  const prevTarget=renderer.getRenderTarget();
  renderer.setRenderTarget(pickRT);renderer.setClearColor(0x000000,0);renderer.clear(true,true,false);renderer.render(scene,camera);
  renderer.readRenderTargetPixels(pickRT,0,0,w,h,pickBuf!);
  renderer.setRenderTarget(prevTarget);body.material=bm;trim.material=tm;
  pickSig=s;pickRenders++;return true;
 }
 function pickAt(px:number,py:number):[number,number]|null{
  const x=Math.round(px),y=pickH-1-Math.round(py);if(x<0||y<0||x>=pickW||y>=pickH)return null;
  const o=(y*pickW+x)*4,b=pickBuf!;if(!b[o]&&!b[o+1])return null;
  return[((b[o]*256+b[o+1])-1)/65534,1-((b[o+2]*256+b[o+3])-1)/65534];
 }
 /** Client point → atlas unit coords on the 3D shirt (+ unit length per CSS px, for the brush ring). */
 const uvFromScene:UvFn=(cx,cy)=>{
  if(!pickBuf||!pickRect)return null;
  const px=(cx-pickRect.left)*pickScale,py=(cy-pickRect.top)*pickScale;
  const p=pickAt(px,py);if(!p)return null;
  const a=pickAt(px+2,py),b=pickAt(px,py+2);
  let upp=0;if(a&&b&&Math.abs(a[0]-p[0])<.05&&Math.abs(b[1]-p[1])<.05)upp=(Math.hypot(a[0]-p[0],a[1]-p[1])+Math.hypot(b[0]-p[0],b[1]-p[1]))/4*pickScale;
  return{u:p[0],v:p[1],upp};
 };
 function hover(e:PointerEvent,uvAt:UvFn){
  if(!drawCfg||drawCfg.tool==='hand'||(e.pointerType==='touch'))return;
  if(uvAt===uvFromScene&&(raf||tween||auto))return;// the view is still moving
  if(uvAt===uvFromScene&&!ensurePick())return;
  const hit=uvAt(e.clientX,e.clientY);
  placeRing(e.clientX,e.clientY,hit&&hit.upp>0?toolUnit()/hit.upp:null);
 }

 // dirty-rect flushes: composite the touched rect, then upload it (≤ 30 per second) or redraw the flat view
 let dirty:PxRect|null=null,flushTimer:ReturnType<typeof setTimeout>|undefined,lastFlush=0;
 function markDirty(r:PxRect|null){
  if(!r)return;dirty=unionRect(dirty,r);if(flushTimer)return;
  const wait=(flatOn?16:33)-(performance.now()-lastFlush);
  if(wait<=0)flush();else flushTimer=setTimeout(()=>{flushTimer=undefined;flush();},wait);
 }
 function flush(){
  if(!dirty||disposed||!layered)return;
  const x=Math.max(0,Math.floor(dirty.x0)),y=Math.max(0,Math.floor(dirty.y0));
  const w=Math.min(texSize,Math.ceil(dirty.x1))-x,h=Math.min(texSize,Math.ceil(dirty.y1))-y;dirty=null;lastFlush=performance.now();
  if(w<=0||h<=0)return;
  actx.drawImage(baseC!,x,y,w,h,x,y,w,h);actx.drawImage(layerC!,x,y,w,h,x,y,w,h);actx.drawImage(printsC!,x,y,w,h,x,y,w,h);
  if(flatOn){flatDraw({x0:x,y0:y,x1:x+w,y1:y+h});texStale=true;return;}
  uploadRect(x,y,w,h);request();
 }
 function uploadRect(x:number,y:number,w:number,h:number){
  const p=renderer.properties.get(design) as {__webglTexture?:WebGLTexture;__version?:number};
  if(!p.__webglTexture||p.__version!==design.version||!stageC){design.needsUpdate=true;uploads++;return;}
  try{
   const gl=renderer.getContext();
   if(stageC.width!==w||stageC.height!==h){stageC.width=w;stageC.height=h;}
   const sctx=stageC.getContext('2d')!;sctx.globalCompositeOperation='copy';sctx.drawImage(atlas,x,y,w,h,0,0,w,h);
   renderer.state.bindTexture(gl.TEXTURE_2D,p.__webglTexture);
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.pixelStorei(gl.UNPACK_ALIGNMENT,4);
   gl.texSubImage2D(gl.TEXTURE_2D,0,x,texSize-y-h,gl.RGBA,gl.UNSIGNED_BYTE,stageC);// flipY: canvas rows y..y+h land at GL rows H−y−h..H−y
   gl.generateMipmap(gl.TEXTURE_2D);subUploads++;
  }catch{design.needsUpdate=true;uploads++;}
 }

 function commit(op:ArtOp){
  const art={v:1 as const,ops:[...applied,op]};
  if(!artFits(art)){renderArt(lctx!,layerC!,texSize,JERSEY_SURFACE,{v:1,ops:applied});markDirty({x0:0,y0:0,x1:texSize,y1:texSize});opts.onArtFull?.();return;}
  applied=art.ops;opts.onArt?.(op);
 }
 const toGrid=(u:number,v:number)=>({x:Math.max(0,Math.min(ART_GRID-1,Math.round(u*ART_GRID))),y:Math.max(0,Math.min(ART_GRID-1,Math.round(v*ART_GRID)))});
 function strokeStart(e:PointerEvent,uvAt:UvFn){
  const cfg=drawCfg!;ensureLayers();if(!lctx)return;
  if(uvAt===uvFromScene&&!ensurePick())return;
  const hit=uvAt(e.clientX,e.clientY),region=hit?JERSEY_SURFACE.regionAt(hit.u,hit.v):-1,ok=!!hit&&regionAllowed(cfg.lock,region);
  if(hit&&e.pointerType!=='touch')placeRing(e.clientX,e.clientY,hit.upp>0?toolUnit()/hit.upp:null);
  if(cfg.tool==='stamp'||cfg.tool==='fill'){
   if(!ok){opts.onArtMiss?.();return;}
   const g=toGrid(hit!.u,hit!.v),m=cfg.mirror?1:0;
   const op:ArtOp=cfg.tool==='stamp'?['p',cfg.stamp,cfg.color,m,g.x,g.y,cfg.size]:['f',cfg.color,m,g.x,g.y];
   if(!artFits({v:1,ops:[...applied,op]})){opts.onArtFull?.();return;}
   markDirty(drawOp(lctx,layerC!,texSize,JERSEY_SURFACE,op));commit(op);return;
  }
  const s=artStats({v:1,ops:applied});
  stroke={pointer:e.pointerId,tool:cfg.tool,painter:null,pts:[],chars:0,baseChars:s.chars+24,basePts:s.points,lastG:null,up:true,full:false,start:null,lastX:e.clientX,lastY:e.clientY};
  if(cfg.tool==='line'){
   if(!ok){stroke=null;opts.onArtMiss?.();return;}
   stroke.start={u:hit!.u,v:hit!.v,region,x:e.clientX,y:e.clientY};
   lineEl.style.background=cfg.color;lineEl.style.height=`${Math.max(4,hit!.upp>0?JERSEY_SURFACE.brush[cfg.size]/hit!.upp:6)}px`;return;
  }
  stroke.painter=new StrokePainter(lctx,JERSEY_SURFACE,texSize,cfg.tool==='spray'?'s':cfg.tool==='eraser'?'e':'b',cfg.size,cfg.color,cfg.mirror?1:0);
  strokeSample(e.clientX,e.clientY,uvAt);
 }
 function strokeSample(cx:number,cy:number,uvAt:UvFn){
  const s=stroke!,cfg=drawCfg!;if(s.full)return;
  const hit=uvAt(cx,cy);
  if(!hit||!regionAllowed(cfg.lock,JERSEY_SURFACE.regionAt(hit.u,hit.v))){s.up=true;return;}
  const g=toGrid(hit.u,hit.v);
  if(!s.up&&s.lastG&&Math.hypot(g.x-s.lastG.x,g.y-s.lastG.y)<MIN_STEP)return;
  const dx=s.lastG?g.x-s.lastG.x:99,dy=s.lastG?g.y-s.lastG.y:99,cost=s.up||!s.lastG||dx<-32||dx>31||dy<-32||dy>31?5:2;
  if(s.baseChars+s.chars+cost>ART_MAX_CHARS||s.basePts+s.pts.length+1>ART_MAX_POINTS){s.full=true;opts.onArtFull?.();return;}
  s.pts.push(s.up?{x:g.x,y:g.y,up:true}:{x:g.x,y:g.y});s.chars+=cost;
  markDirty(s.painter!.add(g.x,g.y,s.up));s.up=false;s.lastG=g;
 }
 function strokeMove(e:PointerEvent,uvAt:UvFn){
  const s=stroke!;s.lastX=e.clientX;s.lastY=e.clientY;
  if(e.pointerType!=='touch')placeRing(e.clientX,e.clientY,null);
  if(s.tool==='line'){
   const a=s.start!,r=host.getBoundingClientRect(),dx=e.clientX-a.x,dy=e.clientY-a.y;
   lineEl.style.display='block';lineEl.style.width=`${Math.hypot(dx,dy)}px`;
   lineEl.style.transform=`translate(${a.x-r.left}px,${a.y-r.top-lineEl.offsetHeight/2}px) rotate(${Math.atan2(dy,dx)}rad)`;return;
  }
  const list=typeof e.getCoalescedEvents==='function'?e.getCoalescedEvents():[];
  if(list.length)for(const c of list)strokeSample(c.clientX,c.clientY,uvAt);else strokeSample(e.clientX,e.clientY,uvAt);
 }
 function strokeEnd(e:PointerEvent,uvAt:UvFn,cancelled:boolean){
  const s=stroke!,cfg=drawCfg;stroke=null;lineEl.style.display='none';
  try{canvas.releasePointerCapture(e.pointerId);}catch{/* fine */}
  if(cancelled||!cfg){strokeRevert();return;}
  if(s.tool==='line'){
   const a=s.start!,hit=uvAt(e.clientX,e.clientY);
   const same=!!hit&&JERSEY_SURFACE.regionAt(hit.u,hit.v)===a.region;
   const p0=toGrid(a.u,a.v),p1=same?toGrid(hit!.u,hit!.v):p0;
   const op:ArtOp=['b',cfg.size,cfg.color,cfg.mirror?1:0,encodeLine(p0,p1)];
   markDirty(drawOp(lctx!,layerC!,texSize,JERSEY_SURFACE,op));commit(op);return;
  }
  if(!s.pts.length)return;
  const kind=s.tool==='spray'?'s':s.tool==='eraser'?'e':'b';
  commit([kind,cfg.size,cfg.color,cfg.mirror?1:0,encodePoints(s.pts)]);
 }
 function strokeRevert(){if(!lctx)return;renderArt(lctx,layerC!,texSize,JERSEY_SURFACE,{v:1,ops:applied});markDirty({x0:0,y0:0,x1:texSize,y1:texSize});}
 function strokeCancel(){if(!stroke)return;const id=stroke.pointer;stroke=null;lineEl.style.display='none';try{canvas.releasePointerCapture(id);}catch{/* fine */}strokeRevert();}

 // ---- flat template view ----------------------------------------------------------------------------------------------------
 const flatC=document.createElement('canvas');
 flatC.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:none;touch-action:none;z-index:1';
 flatC.setAttribute('aria-hidden','true');host.appendChild(flatC);
 const fctx=flatC.getContext('2d')!;
 let template:HTMLCanvasElement|null=null;
 const fl={view:{x:0,y:0,w:1,h:1},scale:1,ox:0,oy:0,dpr:1};
 /** Garment shape per panel, drawn from the mesh's own UV triangles: outside it is dimmed in the flat view. */
 function buildTemplate(){
  const T=512,c=document.createElement('canvas');c.width=c.height=T;const x=c.getContext('2d')!;
  x.fillStyle='rgba(36,77,64,.62)';x.fillRect(0,0,T,T);
  const g=body?.geometry;if(g){
   const uv=g.getAttribute('uv') as THREE.BufferAttribute,ix=g.getIndex()!;
   x.globalCompositeOperation='destination-out';x.beginPath();
   for(let i=0;i<ix.count;i+=3){for(let k=0;k<3;k++){const j=ix.getX(i+k),px=uv.getX(j)*T,py=(1-uv.getY(j))*T;if(k===0)x.moveTo(px,py);else x.lineTo(px,py);}x.closePath();}
   x.fillStyle='#000';x.fill();x.lineWidth=1.2;x.strokeStyle='#000';x.stroke();
  }
  template=c;
 }
 function flatLayout(){
  const dpr=Math.min(window.devicePixelRatio||1,phone?1.5:2),W=host.clientWidth,H=host.clientHeight;
  flatC.width=Math.max(1,Math.round(W*dpr));flatC.height=Math.max(1,Math.round(H*dpr));fl.dpr=dpr;
  const view=regionView(drawCfg?.lock??'all'),pad=14,top=insets?Math.max(14,insets.top):64,bottom=insets?Math.max(14,insets.bottom+6):26;
  fl.view=view;fl.scale=Math.max(1,Math.min((W-pad*2)/view.w,(H-top-bottom)/view.h));
  fl.ox=(W-view.w*fl.scale)/2;fl.oy=top+(H-top-bottom-view.h*fl.scale)/2;
 }
 function flatDraw(r:PxRect|null){
  if(!flatOn)return;flatDraws++;
  if(!template)buildTemplate();
  const {view,scale,ox,oy,dpr}=fl,S=texSize;
  fctx.save();fctx.setTransform(dpr,0,0,dpr,0,0);
  if(r){// only the dirty part
   const x0=ox+(r.x0/S-view.x)*scale,y0=oy+(r.y0/S-view.y)*scale;
   fctx.beginPath();fctx.rect(x0-1,y0-1,(r.x1-r.x0)/S*scale+2,(r.y1-r.y0)/S*scale+2);fctx.clip();
  }else fctx.clearRect(0,0,flatC.width/dpr,flatC.height/dpr);
  fctx.imageSmoothingEnabled=true;
  fctx.drawImage(atlas,view.x*S,view.y*S,view.w*S,view.h*S,ox,oy,view.w*scale,view.h*scale);
  if(template)fctx.drawImage(template,view.x*512,view.y*512,view.w*512,view.h*512,ox,oy,view.w*scale,view.h*scale);
  // panel labels and (mirror mode) the centre line
  fctx.font='800 12px system-ui,Arial,sans-serif';fctx.textAlign='center';fctx.textBaseline='top';
  for(let i=0;i<4;i++){
   const rc=JERSEY_SURFACE.rect(i);if(rc.x+rc.w<view.x||rc.x>view.x+view.w||rc.y+rc.h<view.y||rc.y>view.y+view.h)continue;
   const cx=ox+(rc.x+rc.w/2-view.x)*scale,ty=oy+(rc.y-view.y)*scale+4;
   const label=['FRONT','BACK','LEFT SLEEVE','RIGHT SLEEVE'][i];
   fctx.fillStyle='rgba(255,242,205,.92)';const tw=fctx.measureText(label).width+14;fctx.beginPath();fctx.roundRect?.(cx-tw/2,ty,tw,18,9);fctx.fill();
   fctx.fillStyle='#244d40';fctx.fillText(label,cx,ty+3);
   if(drawCfg?.mirror&&i<2){fctx.setLineDash([6,6]);fctx.strokeStyle='rgba(36,77,64,.55)';fctx.lineWidth=1.5;fctx.beginPath();fctx.moveTo(cx,ty+22);fctx.lineTo(cx,oy+(rc.y+rc.h-view.y)*scale);fctx.stroke();fctx.setLineDash([]);}
  }
  fctx.restore();
 }
 const uvFromFlat:UvFn=(cx,cy)=>{
  const r=flatC.getBoundingClientRect(),x=cx-r.left,y=cy-r.top;
  const u=fl.view.x+(x-fl.ox)/fl.scale,v=fl.view.y+(y-fl.oy)/fl.scale;
  if(u<0||v<0||u>1||v>1||JERSEY_SURFACE.regionAt(u,v)<0)return null;
  return{u,v,upp:1/fl.scale};
 };
 function onFlatDown(e:PointerEvent){if(e.button>0||!drawCfg||drawCfg.tool==='hand'||stroke)return;try{flatC.setPointerCapture(e.pointerId);}catch{/* synthetic */}opts.onInteract?.();strokeStart(e,uvFromFlat);}
 function onFlatMove(e:PointerEvent){if(stroke&&stroke.pointer===e.pointerId)strokeMove(e,uvFromFlat);else if(!stroke)hover(e,uvFromFlat);}
 function onFlatUp(e:PointerEvent){if(stroke&&stroke.pointer===e.pointerId)strokeEnd(e,uvFromFlat,e.type==='pointercancel');}
 function onLeave(){ring.style.display='none';}
 flatC.addEventListener('pointerdown',onFlatDown);flatC.addEventListener('pointermove',onFlatMove);
 flatC.addEventListener('pointerup',onFlatUp);flatC.addEventListener('pointercancel',onFlatUp);
 flatC.addEventListener('pointerleave',onLeave);canvas.addEventListener('pointerleave',onLeave);
 function setFlat(on:boolean){
  on=on&&!!drawCfg;if(on===flatOn)return;strokeCancel();
  if(on){ensureLayers();flatOn=true;if(raf){cancelAnimationFrame(raf);raf=0;}flatC.style.display='block';canvas.style.visibility='hidden';flatLayout();
   if(current)paint();flatDraw(null);}
  else{flatOn=false;flatC.style.display='none';canvas.style.visibility='';ring.style.display='none';
   if(texStale){texStale=false;design.needsUpdate=true;uploads++;}request();}
 }

 canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointermove',onMove);
 canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);
 canvas.addEventListener('wheel',onWheel,{passive:false});
 canvas.tabIndex=0;canvas.addEventListener('keydown',onKey);
 const ro=new ResizeObserver(()=>{fit();if(flatOn){flatLayout();flatDraw(null);}request();});ro.observe(host);
 const onVis=()=>{if(document.hidden){if(raf){cancelAnimationFrame(raf);raf=0;}last=0;}else request();};
 document.addEventListener('visibilitychange',onVis);
 fit();

 function resetView(){setView('front','full');}

 const api:JerseySceneApi={
  setDesign(d,o){
   const first=!current;current=d;previewD=null;rebuild(d);trimColours(d);ensureFont(d);
   // a stroke the scene just drew comes back as the same op objects: nothing to repaint
   const onlyArt=!first&&layered&&(d.art?.ops??[]).length===applied.length&&applied.every((op,i)=>op===d.art!.ops[i])&&keyBase(d)===baseKey&&keyPrints(d)===printsKey;
   if(!onlyArt)schedulePaint();
   if(first&&!reduced){auto={t0:performance.now()+350,dur:4200,from:st.yaw,to:st.yaw+TAU};}
   else if(o?.pulse&&!reduced&&!drawCfg)pulse=performance.now();
   if(!onlyArt||pulse!=null||auto)request();
  },
  preview(d){
   if(disposed||(d===previewD))return;previewD=d;const s=shown();if(!s)return;
   rebuild(s);trimColours(s);ensureFont(s);clearTimeout(paintTimer);paintTimer=setTimeout(paint,60);
  },
  setView(f,focus){if(flatOn)return;setView(f,focus);},resetView,
  spin(){if(reduced){setView('front');return;}st.vel=0;showoff=null;if(tween)delete tween.to.yaw;const from=wrapAngle(st.yaw);auto={t0:performance.now(),dur:1700,from,to:TAU};request();},
  setDraw(cfg){
   const was=drawCfg;drawCfg=cfg;
   if(cfg){ensureLayers();if(current&&!was)paint();canvas.style.cursor=cfg.tool==='hand'?'':'crosshair';flatC.style.cursor=cfg.tool==='hand'?'default':'crosshair';
    if(cfg.tool==='hand')ring.style.display='none';
    if(flatOn&&(!was||was.lock!==cfg.lock||was.mirror!==cfg.mirror)){flatLayout();flatDraw(null);}}
   else{strokeCancel();if(flatOn)setFlat(false);canvas.style.cursor='';ring.style.display='none';}
  },
  setFlat,
  showOff(on){
   if(on){if(flatOn)setFlat(false);interrupt();
    if(reduced){setView('front','full');opts.onShowOffEnd?.();return;}
    animateTo({zoom:FOCI.full.zoom,tx:0,ty:0,el:FOCI.full.el},420);showoff={until:performance.now()+3*TAU/.85*1000};request();}
   else{showoff=null;st.yaw=wrapAngle(st.yaw);request();}
  },
  setInsets(i){if(disposed||sameInsets(i,insets))return;insets=i?{...i}:null;fit();if(flatOn){flatLayout();flatDraw(null);}request();},
  stats(){return{renders,frames,paints,uploads,subUploads,pickRenders,flatDraws,rafPending:raf!==0,layered,textureSize:texSize,pixelRatio,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};},
  dispose(){
   if(disposed)return;disposed=true;
   if(raf)cancelAnimationFrame(raf);raf=0;clearTimeout(paintTimer);clearTimeout(flushTimer);stroke=null;
   ro.disconnect();document.removeEventListener('visibilitychange',onVis);
   canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('pointermove',onMove);
   canvas.removeEventListener('pointerup',onUp);canvas.removeEventListener('pointercancel',onUp);
   canvas.removeEventListener('wheel',onWheel);canvas.removeEventListener('keydown',onKey);canvas.removeEventListener('pointerleave',onLeave);
   flatC.removeEventListener('pointerdown',onFlatDown);flatC.removeEventListener('pointermove',onFlatMove);
   flatC.removeEventListener('pointerup',onFlatUp);flatC.removeEventListener('pointercancel',onFlatUp);flatC.removeEventListener('pointerleave',onLeave);
   body?.geometry.dispose();trim?.geometry.dispose();
   bodyMat.dispose();trimMat.dispose();design.dispose();knit.dispose();rib.dispose();
   pickRT?.dispose();pickMat.dispose();occMat.dispose();pickBuf=null;
   renderer.dispose();renderer.forceContextLoss();
   canvas.remove();flatC.remove();ring.remove();lineEl.remove();atlas.width=atlas.height=1;
   for(const c of[baseC,layerC,printsC,stageC,template,flatC])if(c){c.width=c.height=1;}
   baseC=layerC=printsC=stageC=template=null;bctx=lctx=pctx=null;applied=[];
   const w=window as unknown as {__jerseyStudio?:unknown};if(w.__jerseyStudio)delete w.__jerseyStudio;
  },
 };
 if((window as unknown as {__fiJerseyDebug?:boolean}).__fiJerseyDebug)(window as unknown as {__jerseyStudio:unknown}).__jerseyStudio={renderer,scene,camera,api,THREE};
 return api;
}

/** A straight line is a two-point brush op (one point when it ends where it began). */
function encodeLine(a:{x:number;y:number},b:{x:number;y:number}){return encodePoints(a.x===b.x&&a.y===b.y?[{...a,up:true}]:[{...a,up:true},b]);}
