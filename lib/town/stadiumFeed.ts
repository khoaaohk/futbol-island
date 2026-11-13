// DRIP FC Stadium: the big screen's BACK face (Nov 13 2026, owner: it was a plain black slab). While a match is live it shows the
// match like a broadcast feed, rendered from a camera high on the west stand that follows the ball; otherwise a static card with
// the stadium's wordmark.
// Heat (AGENTS.md "Mobile heat"): the feed is ONE extra low-res render (256 × 144, about the cost of a 1/40th-size frame) at most
// FEED_FPS times a second, and only while ALL of these hold: the player is within FEED_RADIUS of the stadium (bowl + plaza), a
// match is live there (a live venue or the NPC exhibition), the back face is inside the camera frustum and faces the camera, and the
// heat tier is not the lowest (Battery saver / hottest: the static card). Phones refresh at 4 fps. The feed render reuses this
// frame's shadow map (no shadow pass), sees only FEED_FAR m (no far island), and hides the crowd, both screen faces (no
// recursion) and the score bug while it draws. The card is one 256 × 144 canvas drawn once (again when the wordmark decodes). Off,
// far away or idle: a distance compare per frame. The first feed waits for renderer.compileAsync (the render-target variants of
// the stadium's programs compile in parallel, no hitch); until then the card shows.
import * as T from 'three';
import {STADIUM} from './westParkLayout';
import {SCREEN} from './stadiumSeats';
import {LOWEST_TIER} from '../graphics/heatTier';
import {DRIP_FC_ART,drawGateSign} from '../stadium/dripfc';

export const FEED_SIZE={w:256,h:144} as const;
/** Feed refreshes per second: desktop / phones (and any device once the heat tier is 2 or more). */
export const FEED_FPS={desktop:7,phone:4} as const;
/** The feed renders only within this distance of the stadium centre (m): the bowl and Stadium Plaza (its east end is ~153 m out). */
export const FEED_RADIUS=160;
/** The back face (card or feed) is shown within this distance; beyond it the slab's own dark paint shows (as before). */
export const CARD_RADIUS=190;
/** The broadcast camera's far plane (m): the bowl, not the island behind it. */
export const FEED_FAR=130;
/** The screen frame (stadiumWorld.ts): SCREEN.w + 1 by SCREEN.h + 1, 0.5 m deep, centred on (STADIUM.x, SCREEN.y, STADIUM.z + SCREEN.z).
 *  The back face looks south (+z), away from the pitch; the picture sits 2 cm proud of it. */
export const SCREEN_FRAME={w:SCREEN.w+1,h:SCREEN.h+1,depth:.5} as const;
export const BACK_FACE={x:STADIUM.x,y:SCREEN.y,z:STADIUM.z+SCREEN.z+SCREEN_FRAME.depth/2+.02,w:SCREEN.w,h:SCREEN.h} as const;

export type FeedMode='off'|'card'|'feed';
/** What the back face shows: nothing far away, the card unless a match is live near the stadium (and never at the lowest tier). */
export function feedMode(o:{dc:number;live:boolean;tier:number}):FeedMode{
 if(!(o.dc<CARD_RADIUS))return 'off';
 if(!o.live||!(o.dc<FEED_RADIUS)||o.tier>=LOWEST_TIER)return 'card';
 return 'feed';
}
/** Milliseconds between feed renders. */
export const feedInterval=(phone:boolean,tier:number)=>1000/(phone||tier>=2?FEED_FPS.phone:FEED_FPS.desktop);
/** A new feed frame is due: feed mode, the back face in view, the interval passed since the last render. */
export const feedDue=(mode:FeedMode,inView:boolean,nowMs:number,lastMs:number,intervalMs:number)=>mode==='feed'&&inView&&nowMs-lastMs>=intervalMs;
/** The broadcast camera for a ball at (bx, bz): high on the west stand at y 16 (above the west roof's front edge, x −44.5, which
 *  stays behind it), tracking along the touchline at 60% of the ball's run; it looks at the ball. Writes into `pos` / `look`. */
export function broadcastShot(bx:number,bz:number,pos:{x:number;y:number;z:number},look:{x:number;y:number;z:number}){
 const dz=Math.max(-50,Math.min(50,bz-STADIUM.z));
 pos.x=STADIUM.x-40;pos.y=16;pos.z=STADIUM.z+dz*.6;
 look.x=Math.max(STADIUM.x-30,Math.min(STADIUM.x+30,bx));look.y=0;look.z=STADIUM.z+dz;
}

export function createStadiumFeed(parent:T.Object3D,o:{phone:boolean}){
 let mesh:T.Mesh|null=null,cardMat:T.MeshBasicMaterial|null=null,feedMat:T.MeshBasicMaterial|null=null,cardTex:T.CanvasTexture|null=null;
 let target:T.WebGLRenderTarget|null=null,cam:T.PerspectiveCamera|null=null,warm:'cold'|'warming'|'ready'='cold',last=-Infinity,mode:FeedMode='off',showing:'card'|'feed'|'none'='none';
 const frustum=new T.Frustum(),pv=new T.Matrix4(),box=new T.Box3(new T.Vector3(BACK_FACE.x-BACK_FACE.w/2,BACK_FACE.y-BACK_FACE.h/2,BACK_FACE.z-.05),new T.Vector3(BACK_FACE.x+BACK_FACE.w/2,BACK_FACE.y+BACK_FACE.h/2,BACK_FACE.z+.05));
 const shot={x:0,y:0,z:0},aim={x:0,y:0,z:0},hidden:T.Object3D[]=[];
 const stats={renders:0,skippedHidden:0};
 function build(){
  const canvas=document.createElement('canvas');canvas.width=FEED_SIZE.w;canvas.height=FEED_SIZE.h;
  cardTex=new T.CanvasTexture(canvas);cardTex.colorSpace=T.SRGBColorSpace;cardTex.generateMipmaps=false;cardTex.minFilter=T.LinearFilter;
  const paint=(img:HTMLImageElement|null)=>{const c=canvas.getContext?.('2d');if(!c)return;
   drawGateSign(c,FEED_SIZE.w,FEED_SIZE.h,img,'#0d1b22');
   c.fillStyle='#19b5a5';c.fillRect(0,0,FEED_SIZE.w,5);c.fillRect(0,FEED_SIZE.h-5,FEED_SIZE.w,5);
   cardTex!.needsUpdate=true;};
  paint(null);
  if(typeof Image!=='undefined'){const img=new Image();img.decoding='async';img.onload=()=>{if(cardTex)paint(img);};img.src=DRIP_FC_ART.wordmarkLight;}
  cardMat=new T.MeshBasicMaterial({map:cardTex,toneMapped:false});
  mesh=new T.Mesh(new T.PlaneGeometry(BACK_FACE.w,BACK_FACE.h),cardMat);mesh.name='stadium-screen-back';
  mesh.position.set(BACK_FACE.x,BACK_FACE.y,BACK_FACE.z);mesh.visible=false;mesh.castShadow=mesh.receiveShadow=false;mesh.matrixAutoUpdate=false;mesh.updateMatrix();
  parent.add(mesh);
 }
 function show(what:'card'|'feed'|'none'){
  if(what===showing)return;showing=what;if(!mesh)return;
  mesh.visible=what!=='none';if(what==='feed'&&feedMat)mesh.material=feedMat;else if(cardMat)mesh.material=cardMat;
 }
 function ensureTarget(renderer:T.WebGLRenderer,scene:T.Scene){
  if(target)return;
  target=new T.WebGLRenderTarget(FEED_SIZE.w,FEED_SIZE.h,{depthBuffer:true,stencilBuffer:false,generateMipmaps:false,minFilter:T.LinearFilter,magFilter:T.LinearFilter});
  // Tone mapping happens when the feed is drawn into the frame (the target holds the linear picture), so it matches the view.
  feedMat=new T.MeshBasicMaterial({map:target.texture,toneMapped:true});
  cam=new T.PerspectiveCamera(30,FEED_SIZE.w/FEED_SIZE.h,1,FEED_FAR);cam.userData.broadcastFeed=true;// sponsor "seen" counts skip it (surfaces.ts)
  warm='warming';
  const r=renderer as T.WebGLRenderer&{compileAsync?:(s:T.Object3D,c:T.Camera)=>Promise<unknown>};
  if(typeof r.compileAsync!=='function'){warm='ready';return;}
  const prev=renderer.getRenderTarget();
  try{renderer.setRenderTarget(target);const p=r.compileAsync(scene,cam);renderer.setRenderTarget(prev);p.then(()=>{warm='ready';},()=>{warm='ready';});}
  catch{renderer.setRenderTarget(prev);warm='ready';}
 }
 return {
  stats,
  get mode(){return mode;},get showing(){return showing;},get mesh(){return mesh;},get target(){return target;},
  /** Each frame from stadiumSit, right before the main render. dc = the player's distance from the stadium centre; ball = the
   *  live match's ball (null = no match); hide = what must not appear in the feed (the crowd, the front score screen). */
  update(renderer:T.WebGLRenderer,scene:T.Scene,camera:T.Camera,nowMs:number,dc:number,ball:{x:number;z:number}|null,tier:number,hide:readonly (T.Object3D|null|undefined)[]){
   mode=feedMode({dc,live:!!ball,tier});
   if(mode==='off'){show('none');return false;}
   if(!mesh)build();
   if(mode==='card'){show('card');return false;}
   // Feed mode: the back face must face the camera (the camera south of it) and be inside the frustum.
   camera.updateMatrixWorld();
   const inView=camera.position.z>BACK_FACE.z&&(pv.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse),frustum.setFromProjectionMatrix(pv).intersectsBox(box));
   if(!inView){stats.skippedHidden++;return false;}
   ensureTarget(renderer,scene);
   if(warm!=='ready'){show('card');return false;}
   if(!feedDue(mode,inView,nowMs,last,feedInterval(o.phone,tier))){show(last>-Infinity?'feed':'card');return false;}
   last=nowMs;broadcastShot(ball!.x,ball!.z,shot,aim);
   cam!.position.set(shot.x,shot.y,shot.z);cam!.lookAt(aim.x,aim.y,aim.z);cam!.updateMatrixWorld();
   hidden.length=0;for(const h of hide)if(h&&h.visible){h.visible=false;hidden.push(h);}
   if(mesh!.visible){mesh!.visible=false;hidden.push(mesh!);}// never inside its own picture
   const prev=renderer.getRenderTarget(),auto=renderer.shadowMap.autoUpdate,needs=renderer.shadowMap.needsUpdate;
   try{renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=false;// this frame's shadow map, no shadow pass
    renderer.setRenderTarget(target);renderer.render(scene,cam!);stats.renders++;}
   finally{renderer.setRenderTarget(prev);renderer.shadowMap.autoUpdate=auto;renderer.shadowMap.needsUpdate=needs;for(const h of hidden)h.visible=true;hidden.length=0;}
   showing='none';show('feed');
   return true;
  },
  dispose(){
   if(mesh){mesh.removeFromParent();mesh.geometry.dispose();}
   cardMat?.dispose();feedMat?.dispose();cardTex?.dispose();target?.dispose();
   mesh=null;cardMat=feedMat=null;cardTex=null;target=null;cam=null;warm='cold';showing='none';last=-Infinity;
  },
 };
}
export type StadiumFeed=ReturnType<typeof createStadiumFeed>;
