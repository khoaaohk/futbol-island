import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createBuildingGlow} from './buildingGlow';
import {machineStock,VENDING_MACHINES,VENDING_SIZE,type VendingMachine,type VendingMachineId} from '../town/vendingCatalog';
import {drawVendingProduct} from './vendingProductArt';
import {FACE_SIZE,VENDING_FACE_LAYOUT} from './vendingFaceLayout';

/**
 * Eight Japanese-style vending machines (lib/town/vendingCatalog.ts, docs/vending-machines.md).
 *
 * Cost: one merged mesh (one draw call, one shadow draw) per machine, frustum-culled; all eight share ONE material with one
 * 1024×1024 canvas atlas used as both colour and emissive map (the lit sign, glass, LED and tray glow without a light; eight compact glass tiles carry each cabinet’s own specials). The front
 * panels are placed from VENDING_FACE_LAYOUT, the same rects the in-use HTML face uses, so far and close-up are one machine. Cabinet colours are vertex colours. One hover glow (buildingGlow 'vending') is shared and moved to whichever machine is
 * targeted. Per frame, idle: eight distance checks and (desktop hover only) eight ray/box tests; glow, prompt and camera work
 * run only while a machine is targeted, fading, or the camera is zooming. In use, the camera frames the face straight on and
 * the HTML machine face (components/VendingMachine.tsx) is pinned onto VENDING_FACE: no extra meshes or textures at all.
 */
const ATLAS_W=1024,ATLAS_H=1024;
/** Drawn a little larger than life so the machine reads from the island camera (a 2.1 m cabinet would look child-height). */
export const VENDING_SCALE=1.3;
/** The interactive machine face (machine-local metres before VENDING_SCALE): including the top category panel, just proud of the
 * front. While a machine is in use, components/VendingFace.tsx pins its HTML face exactly onto this rectangle. Its panels are laid
 * out by VENDING_FACE_LAYOUT (lib/graphics/vendingFaceLayout.ts), the same rects the HTML face uses. */
export const VENDING_FACE={x0:-FACE_SIZE.w/2,x1:FACE_SIZE.w/2,y0:.16,y1:.16+FACE_SIZE.h,z:VENDING_SIZE.d/2+.02} as const;
/** Screen margin around the face in the close-up (fraction of the viewport per side). */
const FACE_MARGIN_X=.03,FACE_MARGIN_Y=.04;
const L=VENDING_FACE_LAYOUT;
/** Atlas rectangles (px). Face panels keep the aspect of their layout rect so nothing is stretched. */
const R={
 white:[2,2,6,6],glass:(i:number)=>[i%4*256,8+Math.floor(i/4)*212,256,211.5],led:[0,440,368,101],coin:[376,440,112,101],tray:[0,550,356,100],sticker:[364,550,148,89],
};
/** Page one of every machine, painted on the glass so the far machine already shows what the close-up shows. */
function roundRect(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}
/** Original machine-front art (docs/vending-visuals-HANDOFF.md: Astra's to replace). Mirrors components/VendingFace.module.css. */
function drawAtlas(machines:VendingMachine[]){
 const pending:{src:string;x:number;y:number;w:number;h:number}[]=[];
 const canvas=document.createElement('canvas');canvas.width=ATLAS_W;canvas.height=ATLAS_H;const c=canvas.getContext('2d')!;
 c.fillStyle='#1a1d24';c.fillRect(0,0,ATLAS_W,ATLAS_H);c.fillStyle='#ffffff';c.fillRect(0,0,10,10);
 c.textAlign='center';c.textBaseline='middle';
 // Glass: dark frame, light shelves, shelf header (prev · row label · next) and six product slots with lit push buttons.
 machines.forEach((machine,index)=>{const tile=R.glass(index);c.save();c.translate(tile[0],tile[1]);c.scale(.5,.5);const PAGE_ONE=machineStock(machine.id).flatMap(row=>row.items).slice(0,6).map(item=>({...item,kind:item.kind==='gear'?item.storeItem!.category:item.kind,special:item.row==='special'}));const [X,Y,W,H]=[0,0,512,423],G=L.glass,px=(r:{x:number;y:number;w:number;h:number})=>[X+(r.x-G.x)/G.w*W,Y+(r.y-G.y)/G.h*H,r.w/G.w*W,r.h/G.h*H];
  c.fillStyle='#23272e';c.fillRect(X,Y,W,H);const b=8,g=c.createLinearGradient(0,Y,0,Y+H);g.addColorStop(0,'#81a6a5');g.addColorStop(1,'#8aafab');c.fillStyle=g;c.fillRect(X+b,Y+b,W-2*b,H-2*b);
  c.fillStyle='#3a6470';c.beginPath();c.moveTo(X+b,Y+b);c.lineTo(X+W*.075,Y+H*.04);c.lineTo(X+W*.075,Y+H*.96);c.lineTo(X+b,Y+H-b);c.closePath();c.fill();
  c.fillStyle='#adc9bd';c.beginPath();c.moveTo(X+W-b,Y+b);c.lineTo(X+W*.925,Y+H*.04);c.lineTo(X+W*.925,Y+H*.96);c.lineTo(X+W-b,Y+H-b);c.closePath();c.fill();
  for(const r of [L.prev,L.next]){const [x,y,w,h]=px(r);c.fillStyle='#23272e';roundRect(c,x,y,w,h,8);c.fill();c.fillStyle='#fff1d3';c.beginPath();const cx=x+w/2,cy=y+h/2,d=r===L.prev?-1:1;c.moveTo(cx+d*9,cy);c.lineTo(cx-d*7,cy-10);c.lineTo(cx-d*7,cy+10);c.fill();}
  {const [x,y,w,h]=px(L.label),gg=c.createLinearGradient(x,0,x+w,0);gg.addColorStop(0,'#ffb800');gg.addColorStop(.5,'#ffe27a');gg.addColorStop(1,'#ffb800');c.fillStyle=gg;roundRect(c,x,y,w,h,8);c.fill();
   c.fillStyle='#5a2a00';c.font='900 21px system-ui,sans-serif';c.fillText(`SPECIALS  1/${Math.ceil(machineStock(machine.id).flatMap(row=>row.items).length/6)}`,x+w/2,y+h/2+1);}
  for(let row=0;row<2;row++){
   const r=L.slots[row*L.cols],[x,y,w,h]=px({x:r.x,y:r.y+r.h*.53,w:.91,h:r.h*.46});
   const shelf=c.createLinearGradient(0,y,0,y+h);shelf.addColorStop(0,'#b5cfcc');shelf.addColorStop(.03,'#b5cfcc');shelf.addColorStop(.04,'#557986');shelf.addColorStop(.96,'#466574');shelf.addColorStop(1,'#263e50');c.fillStyle=shelf;
   c.fillRect(x,y,w,h);
  }
  L.slots.forEach((r,i)=>{const [x,y,w,h]=px(r),item=PAGE_ONE[i];if(!item)return;
   const pushY=y+h*L.slotPush.y,pushH=h*L.slotPush.h,nameY=y+h*.59,winH=h*.53-6;
   // Contact shadow anchors the miniature to the continuous shelf below it.
   const shadow=c.createRadialGradient(x+w/2,y+winH-1,1,x+w/2,y+winH-1,w*.36);shadow.addColorStop(0,'#1d354b55');shadow.addColorStop(1,'#1d354b00');c.save();c.translate(0,(y+winH)*.8);c.scale(1,.2);c.fillStyle=shadow;c.fillRect(x,y-80,w,160);c.restore();
   const cx=x+w/2,cy=y+4+winH/2,s=Math.min(w,winH)*.3;
   if(item.kind==='ball'||item.kind==='pack'){pending.push({src:`/vending/products/${item.kind==='ball'?machine.id+'-ball':'pack'}.png`,x:tile[0]+(x+4)*.5,y:tile[1]+(y+4)*.5,w:(w-8)*.5,h:winH*.5});}else {const size=Math.min((w-10)/1.7,winH/1.86);drawVendingProduct(c,item.id,item.kind,cx,y+4+winH-size*.86,size,false);}
   c.fillStyle='#fff1d3';c.font='800 19px system-ui,sans-serif';const words=item.label.split(' '),lines:string[]=[''];for(const word of words){const i=lines.length-1,trial=lines[i]?lines[i]+' '+word:word;if((c.measureText(trial)?.width??trial.length*10)>w-8&&lines[i])lines.push(word);else lines[i]=trial;}lines.slice(0,2).forEach((label,j)=>c.fillText(label,cx,nameY+12+j*21,w-8));
   c.fillStyle='#1c1f25';roundRect(c,x+6,pushY,w-12,pushH,pushH/2);c.fill();c.fillStyle='#56606b';c.beginPath();c.arc(x+6+pushH*.7,pushY+pushH/2,pushH*.18,0,Math.PI*2);c.fill();
   c.fillStyle='#f2b62c';c.beginPath();c.arc(cx-12,pushY+pushH/2,pushH*.24,0,Math.PI*2);c.fill();c.fillStyle='#7cf29a';c.font='800 19px ui-monospace,Menlo,monospace';c.fillText(String(item.price),cx+10,pushY+pushH/2+1);});
  c.fillStyle='rgba(255,255,255,.3)';c.beginPath();c.moveTo(X+W*.28,Y);c.lineTo(X+W*.4,Y);c.lineTo(X+W*.22,Y+H);c.lineTo(X+W*.1,Y+H);c.fill();c.restore();});
 // LED display: the greeting the close-up opens with.
 {const [x,y,w,h]=R.led;c.fillStyle='#0a0f0b';c.fillRect(x,y,w,h);c.fillStyle='#152018';c.fillRect(x+5,y+5,w-10,h-10);c.textAlign='left';c.fillStyle='#7cf29a';c.font='800 24px ui-monospace,Menlo,monospace';c.fillText('いらっしゃいませ!',x+18,y+h*.36);
  c.fillStyle='#b6f5c6';c.font='600 17px system-ui,sans-serif';c.fillText('Pick an item',x+18,y+h*.7);c.textAlign='center';}
 // Coin panel: balance digits, coin slot mouth, label.
 {const [x,y,w,h]=R.coin,g=c.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#b9bfc8');g.addColorStop(.35,'#e1e4e9');g.addColorStop(1,'#c3c8d0');c.fillStyle=g;c.fillRect(x,y,w,h);
  c.fillStyle='#152018';roundRect(c,x+18,y+8,w-36,22,4);c.fill();c.fillStyle='#7cf29a';c.font='900 16px ui-monospace,Menlo,monospace';c.fillText('- - -',x+w/2,y+20);
  c.fillStyle='#50565f';roundRect(c,x+w/2-9,y+36,18,40,8);c.fill();c.fillStyle='#1b1d21';roundRect(c,x+w/2-5,y+40,10,32,5);c.fill();c.fillStyle='#2b3440';c.font='900 13px system-ui,sans-serif';c.fillText('COINS',x+w/2,y+h-12);}
 // Pickup tray: dark opening with its flap.
 {const [x,y,w,h]=R.tray;c.fillStyle='#2b2f36';c.fillRect(x,y,w,h);c.fillStyle='#0c0d10';c.fillRect(x+8,y+8,w-16,h-16);const floor=c.createLinearGradient(0,y+h*.58,0,y+h);floor.addColorStop(0,'#202b34');floor.addColorStop(1,'#11191f');c.fillStyle=floor;c.fillRect(x+8,y+h*.58,w-16,h*.34);c.fillStyle='#56616c';c.fillRect(x+8,y+8,w-16,20);c.fillStyle='#85919b';c.fillRect(x+8,y+26,w-16,2);c.fillStyle='#89959c';c.fillRect(x+8,y+h-8,w-16,3);c.fillStyle='#9aa3ad';c.font='900 18px ui-monospace,Menlo,monospace';c.textAlign='right';c.fillText('PUSH',x+w-14,y+h-18);c.textAlign='center';}
 // Sticker.
 {const [x,y,w,h]=R.sticker;c.fillStyle='#fffdf6';roundRect(c,x+2,y+2,w-4,h-4,8);c.fill();c.fillStyle='#3a3f47';c.font='800 15px system-ui,sans-serif';c.fillText('Island Shop',x+w/2,y+h*.36);c.fillText('No real money',x+w/2,y+h*.66);}
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=2;map.name='vending-atlas';
 const glow=document.createElement('canvas');glow.width=ATLAS_W;glow.height=ATLAS_H;const e=glow.getContext('2d')!;e.drawImage(canvas,0,0);e.fillStyle='#000000';e.fillRect(0,0,12,12);e.globalAlpha=.55;e.fillRect(R.coin[0],R.coin[1],R.coin[2],R.coin[3]);e.fillRect(R.sticker[0],R.sticker[1],R.sticker[2],R.sticker[3]);e.globalAlpha=1;
 const emissiveMap=new T.CanvasTexture(glow);emissiveMap.colorSpace=T.SRGBColorSpace;emissiveMap.name='vending-atlas-glow';
 let disposed=false;const images:HTMLImageElement[]=[];
 if(typeof Image!=='undefined')for(const p of pending){const img=new Image();images.push(img);img.onload=()=>{if(disposed)return;const ball=p.src.includes('-ball'),scale=Math.min(p.w/img.width,p.h/img.height)*(ball?1.35:1),w=img.width*scale,h=img.height*scale;c.save();c.beginPath();c.rect(p.x,p.y,p.w,p.h);c.clip();c.drawImage(img,p.x+(p.w-w)/2,p.y+(p.h-h)/2,w,h);c.restore();map.needsUpdate=true;};img.src=p.src;}
 return {map,emissiveMap,dispose(){disposed=true;for(const img of images)img.onload=null;map.dispose();emissiveMap.dispose();}};
}
/** Remap a geometry's UVs into an atlas rectangle (or a single texel for plain painted parts). */
function atlasUV(geometry:T.BufferGeometry,[x,y,w,h]:number[]){const uv=geometry.getAttribute('uv') as T.BufferAttribute;for(let i=0;i<uv.count;i++)uv.setXY(i,(x+uv.getX(i)*w)/ATLAS_W,1-(y+(1-uv.getY(i))*h)/ATLAS_H);uv.needsUpdate=true;return geometry;}
function paint(geometry:T.BufferGeometry,color:string){const c=new T.Color(color),n=geometry.getAttribute('position').count,a=new Float32Array(n*3);for(let i=0;i<n;i++)c.toArray(a,i*3);geometry.setAttribute('color',new T.BufferAttribute(a,3));return geometry;}
function buildMachineGeometry(m:VendingMachine,index:number){
 const {w,d,h}=VENDING_SIZE,front=d/2,parts:T.BufferGeometry[]=[],dark=new T.Color(m.color).multiplyScalar(.62).getStyle();
 const box=(bw:number,bh:number,bd:number,x:number,y:number,z:number,color:string)=>parts.push(paint(atlasUV(new T.BoxGeometry(bw,bh,bd).translate(x,y,z),R.white),color));
 const panel=(pw:number,ph:number,x:number,y:number,rect:number[],z=front+.006)=>parts.push(paint(atlasUV(new T.PlaneGeometry(pw,ph).translate(x,y,z),rect),'#ffffff'));
 /** A face panel placed by its VENDING_FACE_LAYOUT rect (fractions of the face, y from the top). */
 const facePanel=(r:{x:number;y:number;w:number;h:number},rect:number[],z?:number)=>{const F=VENDING_FACE;panel(r.w*FACE_SIZE.w,r.h*FACE_SIZE.h,F.x0+(r.x+r.w/2)*FACE_SIZE.w,F.y1-(r.y+r.h/2)*FACE_SIZE.h,rect,z);};
 box(w,h-.16,d,0,.08+(h-.16)/2,0,m.color);                     // cabinet
 box(w+.04,.07,d+.04,0,h-.045,0,dark);                         // top cap
 // Recessed side trim, slim metal face rails and two stable rubber feet.
 box(.065,h-.34,.10,-w/2+.03,h/2,front+.045,m.light);
 box(.065,h-.34,.10,w/2-.03,h/2,front+.045,m.light);
 box(.24,.07,d*.72,-w*.3,.02,0,'#182b2e');box(.24,.07,d*.72,w*.3,.02,0,'#182b2e');
 for(let i=0;i<2;i++)box(.26,.022,.009,w*.28,.26+i*.10,-d/2-.006,dark);
 box(w-.02,.08,d-.02,0,.04,0,'#2c3036');                       // plinth
 box(w+.012,.06,d+.012,0,.12,0,m.light);                       // accent band (under the face)
 // Stepped metal bezel projects beyond the printed glass; all details stay in
 // this same merged mesh/material, including the recessed service-panel surrounds.
 const surround=(r:{x:number;y:number;w:number;h:number},depth:number)=>{
  const pw=r.w*FACE_SIZE.w,ph=r.h*FACE_SIZE.h,cx=VENDING_FACE.x0+(r.x+r.w/2)*FACE_SIZE.w,cy=VENDING_FACE.y1-(r.y+r.h/2)*FACE_SIZE.h;
  box(pw+.018,.025,depth,cx,cy+ph/2,front+depth/2,'#c5d1cd');
  box(pw+.018,.032,depth,cx,cy-ph/2,front+depth/2,'#52636b');
  box(.025,ph,depth,cx-pw/2,cy,front+depth/2,'#9bafb1');
  box(.025,ph,depth,cx+pw/2,cy,front+depth/2,'#36434f');
 };
 surround(L.glass,.075);surround(L.tray,.085);
 // Raised lower sill catches the light below the dark pickup recess.
 box(L.tray.w*FACE_SIZE.w,.028,.105,0,VENDING_FACE.y1-(L.tray.y+L.tray.h)*FACE_SIZE.h,front+.055,'#a7b7b9');
 // Shelf lips project slightly forward of the backing: the close view and
 // distant machine share the same pair of real, continuous metal shelves.
 for(let row=0;row<2;row++){const r=L.slots[row*L.cols];
  box(.91*FACE_SIZE.w,.022,.052,0,VENDING_FACE.y1-(r.y+r.h*.55)*FACE_SIZE.h,front+.032,'#b8cbcc');
 }
 facePanel(L.glass,R.glass(index),front+.01);                         // glass: header + six product slots
 facePanel(L.led,R.led);facePanel(L.coin,R.coin);facePanel(L.tray,R.tray);
 const merged=mergeGeometries(parts.map(g=>g.toNonIndexed()))!;parts.forEach(g=>g.dispose());merged.computeBoundingSphere();merged.computeBoundingBox();return merged;
}

export type VendingUpdate={now:number;dt:number;reduced:boolean;hoverRay:T.Raycaster|null;canEnter:boolean;flying:boolean;flightHeight:number;
 location:{x:number;z:number};groundY:number;camera:T.Camera;width:number;height:number;hidePrompt:boolean;
 prompt:HTMLButtonElement|null;placeUI:(el:HTMLElement,x:number,y:number)=>void;setUIHidden:(el:HTMLElement,hidden:boolean)=>void;onHoverStart:()=>void};
export function createVendingMachines(scene:T.Scene){
 const atlas=drawAtlas(VENDING_MACHINES);
 const material=new T.MeshStandardMaterial({map:atlas.map,emissiveMap:atlas.emissiveMap,emissive:'#ffffff',emissiveIntensity:.8,vertexColors:true,roughness:.5,metalness:.08});
 material.name='vending-machine';
 // Printed/lit face panels keep their authored colours as the HTML controls fade in.
 // Only the plain cabinet texel receives scene lighting; no extra mesh or render pass.
 material.toneMapped=false;
 material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`#include <opaque_fragment>
 #ifdef USE_MAP
 if(vMapUv.y < .99 || vMapUv.x > .01) gl_FragColor.rgb = diffuseColor.rgb;
 #endif`);};
 material.customProgramCacheKey=()=>'vending-printed-face-v1';
 const root=new T.Group();root.name='vending-machines';scene.add(root);
 const S=VENDING_SCALE,w=VENDING_SIZE.w*S,d=VENDING_SIZE.d*S,h=VENDING_SIZE.h*S;
 const entries=VENDING_MACHINES.map((m,i)=>{
  const geometry=buildMachineGeometry(m,i),mesh=new T.Mesh(geometry,material);mesh.name=`vending-${m.id}`;mesh.castShadow=true;mesh.receiveShadow=true;
  mesh.position.set(m.x,m.y,m.z);mesh.rotation.y=m.yaw;mesh.scale.setScalar(S);mesh.updateMatrix();mesh.matrixAutoUpdate=false;root.add(mesh);mesh.updateMatrixWorld(true);
  const box=new T.Box3().setFromObject(mesh);const fx=Math.sin(m.yaw),fz=Math.cos(m.yaw);
  return {machine:m,mesh,geometry,box,front:{x:m.x+fx*1.5,z:m.z+fz*1.5},dir:new T.Vector3(fx,0,fz)};
 });
 /** Collision footprints (axis-aligned, covering the rotated cabinet). */
 const obstacles=entries.map(({machine:m})=>{const c=Math.abs(Math.cos(m.yaw)),s=Math.abs(Math.sin(m.yaw));return {x:m.x,z:m.z,w:+(c*w+s*d).toFixed(2),d:+(s*w+c*d).toFixed(2)};});
 const glowRoot=new T.Group();glowRoot.name='vending-selection';scene.add(glowRoot);const glow=createBuildingGlow(glowRoot,w,d,h,'vending');
 let target:VendingMachineId|null=null,glowUntil=0,hovered:VendingMachineId|null=null;const hit=new T.Vector3(),projected=new T.Vector3();
 const pick=(ray:T.Raycaster)=>{let best:VendingMachineId|null=null,bestD=Infinity;for(const e of entries)if(ray.ray.intersectBox(e.box,hit)){const dd=hit.distanceToSquared(ray.ray.origin);if(dd<bestD){bestD=dd;best=e.machine.id;}}return best;};
 // Camera zoom toward the glass front.
 let zoom:{id:VendingMachineId;t:number;dir:1|-1;onArrive?:()=>void;onDone?:()=>void}|null=null;
 const zoomPos=new T.Vector3(),zoomLook=new T.Vector3(),followLook=new T.Vector3(),mixLook=new T.Vector3(),viewDir=new T.Vector3(-16,-23,-33).normalize();
 const ease=(t:number)=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 let lastCamera:T.PerspectiveCamera|null=null,faceListener:((corners:{x:number;y:number}[])=>void)|null=null;
 const faceCorner=new T.Vector3();
 type Entry=(typeof entries)[number];
 /** A level three-quarter camera fits the face and a sliver of the cabinet side. */
 const faceView=(e:Entry,camera:T.PerspectiveCamera,position:T.Vector3,look:T.Vector3,viewportHeight=typeof window==='undefined'?800:window.innerHeight)=>{
  const F=VENDING_FACE,tanV=Math.tan(T.MathUtils.degToRad(camera.fov)/2),aspect=camera.aspect||1;
  // Category navigation now occupies the former sign area; fit the same complete
  // face on every viewport, including short landscape phones.
  const top=F.y1,fw=(F.x1-F.x0)*S,fh=(top-F.y0)*S;
  // A shallow three-quarter view reveals the cabinet's right side. Reserve room
  // for its depth and the nearer front edge instead of clipping the controls.
  const angle=viewportHeight<500?-.14:-.40,cs=Math.cos(angle),sn=Math.sin(angle),sideDepth=Math.abs(sn);
  const side=new T.Vector3(e.dir.z,0,-e.dir.x);
  const angledDist=Math.max(fh/2/(1-2*FACE_MARGIN_Y)/tanV,(fw*cs+VENDING_SIZE.d*S*sideDepth)/2/(1-2*FACE_MARGIN_X)/(tanV*aspect))+fw*sideDepth/2;
  look.set(e.machine.x,e.machine.y+(F.y0+top)/2*S,e.machine.z).addScaledVector(e.dir,F.z*S).addScaledVector(side,-.15*S);
  position.copy(look).addScaledVector(e.dir,angledDist*cs).addScaledVector(side,angledDist*sn);
 };
 const faceNDC=(e:Entry,camera:T.Camera)=>{camera.updateMatrixWorld();const F=VENDING_FACE;
  return [[F.x0,F.y1],[F.x1,F.y1],[F.x1,F.y0],[F.x0,F.y0]].map(([x,y])=>{faceCorner.set(x,y,F.z).applyMatrix4(e.mesh.matrixWorld).project(camera);return {x:faceCorner.x,y:faceCorner.y};});
 };
 return {
  root,obstacles,entries,pick:(ray:T.Raycaster)=>pick(ray),
  get target(){return target;},
  get hovered(){return hovered;},
  /** The close-up would look through the player: hide them (and their ride) once the zoom is under way. */
  get hidesPlayer(){return zoom!==null&&zoom.t>.5;},
  get zooming(){return zoom!==null&&zoom.t<1&&zoom.dir===1||zoom!==null&&zoom.dir===-1;},
  get focused(){return zoom?.id??null;},
  /** Hover glow, nearby detection and the "Go" prompt. Returns the targeted machine. */
  update(o:VendingUpdate):VendingMachineId|null{
   const over=o.hoverRay&&o.canEnter?pick(o.hoverRay):null;if(over&&over!==hovered)o.onHoverStart();hovered=over;
   let near:VendingMachineId|null=null,nearD=Infinity;
   if(o.canEnter&&!over)for(const e of entries){const m=e.machine;
    const dist=o.flying?Math.hypot(m.x-o.location.x,m.z-o.location.z):Math.hypot(e.front.x-o.location.x,e.front.z-o.location.z);
    const ok=o.flying?dist<12&&o.flightHeight<m.y+40:dist<3.2&&Math.abs(o.groundY-m.y)<1.2;
    if(ok&&dist<nearD){nearD=dist;near=m.id;}}
   const next=zoom?zoom.id:(over??near);
   if(next&&next!==target){const e=entries.find(x=>x.machine.id===next)!;glowRoot.position.copy(e.mesh.position);glowRoot.rotation.y=e.machine.yaw;glowRoot.updateMatrixWorld(true);}
   target=next;if(target)glowUntil=o.now+1200;
   if(target||o.now<glowUntil)glow.update(Boolean(target)&&!zoom,o.dt,o.reduced);
   if(o.prompt){let hidden=!target||!!zoom||o.hidePrompt;if(!hidden){const e=entries.find(x=>x.machine.id===target)!;projected.set(e.machine.x,e.machine.y+h+.55,e.machine.z).project(o.camera);hidden=projected.z< -1||projected.z>1;
     if(!hidden)o.placeUI(o.prompt,T.MathUtils.clamp((projected.x+1)*o.width/2,60,o.width-60),T.MathUtils.clamp((1-projected.y)*o.height/2,70,o.height-120));}
    if(!hidden&&o.prompt.dataset.vending!==target)o.prompt.dataset.vending=target!;o.setUIHidden(o.prompt,hidden);}
   return target;
  },
  /** Start the zoom in; `onArrive` runs once the camera reaches the glass (immediately with reduced motion). */
  focus(id:VendingMachineId,onArrive:()=>void){zoom={id,t:zoom?.id===id?zoom.t:0,dir:1,onArrive};},
  /** Zoom back out to the follow camera. */
  release(onDone?:()=>void){if(!zoom){onDone?.();return;}zoom.dir=-1;zoom.onArrive=undefined;zoom.onDone=onDone;},
  cancel(){zoom=null;},
  /** Call right after the follow camera is placed; blends toward the machine front. Returns true while it owns the camera. */
  applyCamera(camera:T.PerspectiveCamera,dt:number,reduced:boolean){
   if(!zoom)return false;const e=entries.find(x=>x.machine.id===zoom!.id)!;
   zoom.t=reduced?(zoom.dir>0?1:0):T.MathUtils.clamp(zoom.t+zoom.dir*Math.min(dt,.05)/(zoom.dir>0?1:.8),0,1);
   const k=ease(zoom.t);
   faceView(e,camera,zoomPos,zoomLook);
   followLook.copy(camera.position).addScaledVector(viewDir,40);
   camera.position.lerp(zoomPos,k);if(e.machine.id==='market')camera.position.y+=Math.sin(Math.PI*k)*7;mixLook.lerpVectors(followLook,zoomLook,k);camera.lookAt(mixLook);lastCamera=camera;
   if(zoom.dir>0&&zoom.t>=1&&zoom.onArrive){const fn=zoom.onArrive;zoom.onArrive=undefined;fn();}
   // Arrived: tell the machine-face layer where the face sits on screen (only on awake frames; the paused island sleeps).
   if(zoom&&zoom.dir>0&&zoom.t>=1&&faceListener)faceListener(faceNDC(e,camera));
   if(zoom.dir<0&&zoom.t<=0){const fn=zoom.onDone;zoom=null;fn?.();}
   return true;
  },
  /** Straight-on camera target that fits the machine face (VENDING_FACE) on this screen; used by the zoom and tests. */
  faceView(id:VendingMachineId,camera:T.PerspectiveCamera,position:T.Vector3,look:T.Vector3,viewportHeight?:number){const e=entries.find(x=>x.machine.id===id);if(e)faceView(e,camera,position,look,viewportHeight);},
  /** The machine face's four corners (top-left, top-right, bottom-right, bottom-left) in normalized device coordinates, from
   * the last zoom camera, or null when not zoomed. */
  faceNow():{x:number;y:number}[]|null{if(!zoom||!lastCamera)return null;const e=entries.find(x=>x.machine.id===zoom!.id)!;return faceNDC(e,lastCamera);},
  /** Called with the face corners on every awake frame while zoomed in; returns an unsubscribe. */
  watchFace(fn:(corners:{x:number;y:number}[])=>void){faceListener=fn;return()=>{if(faceListener===fn)faceListener=null;};},
  dispose(){glow.dispose();glowRoot.removeFromParent();root.removeFromParent();entries.forEach(e=>e.geometry.dispose());material.dispose();atlas.dispose();},
 };
}
export type VendingMachines=ReturnType<typeof createVendingMachines>;
