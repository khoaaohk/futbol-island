// DRIP FC Stadium: the big screen's BACK face (Nov 13 2026, owner: it was a plain black slab). While a match is live it shows the
// match like a broadcast feed, rendered from a camera high on the west stand that follows the ball; otherwise a static card with
// the stadium's wordmark.
// Nov 13 2026, owner: the first feed was choppy (7 / 4 fps, a camera that jumped to each new ball spot) and not clear (256 × 144,
// wide framing) and had no broadcast graphics. Now (feedSpec): desktop 640 × 360 at 30 fps with 4× MSAA; phones 384 × 216 at
// 12 fps (2× MSAA, cheap on tile GPUs); heat tier 2+: 15 fps desktop / 6 fps phones; the lowest tier (Battery saver): the still
// card. Linear filtering, no mipmaps. The broadcast camera is a critically damped follow (smoothDamp: no snapping, slow enough that
// 6–12 fps still reads smooth) with tighter TV framing (the zoom keeps about FRAME_H m of pitch in the picture height). A TV
// overlay (the score box with team names and colours, the score and the match clock; the DRIP FC wordmark in the top-right corner)
// is ONE small canvas, redrawn and re-uploaded only when the score or the clock's second changes, and mixed over the picture in
// the back face's own fragment shader (after tone mapping: no extra draw, no extra pass, never mirrored: it shares the plane's uv).
// Heat (AGENTS.md "Mobile heat"): the feed is ONE extra low-res render at most feedSpec().fps times a second, and only while ALL of
// these hold: the player is within FEED_RADIUS of the stadium (bowl + plaza), a match is live there (a live venue or the NPC
// exhibition), the back face is inside the camera frustum and faces the camera, and the heat tier is not the lowest. The feed
// render reuses this frame's shadow map (no shadow pass), sees only FEED_FAR m (no far island), and hides the crowd, the stand
// flags, both screen faces (no recursion) and the score bug while it draws. Off, far away or idle: a distance compare per frame.
// The first feed waits for renderer.compileAsync (the render-target variants of the stadium's programs compile in parallel, no
// hitch); until then the card shows.
import * as T from 'three';
import {STADIUM} from './westParkLayout';
import {SCREEN} from './stadiumSeats';
import {LOWEST_TIER} from '../graphics/heatTier';
import {DRIP_FC_ART,WORDMARK_ASPECT,drawGateSign} from '../stadium/dripfc';
import type {ScreenScore} from './stadiumScreen';
import {broadcastView} from './broadcastView';

/** The still card's canvas (drawn once). */
export const FEED_SIZE={w:256,h:144} as const;
/** The live feed per device: render-target size, refreshes per second (cool / heat tier 2+) and MSAA samples. */
export const FEED_SPECS={
 desktop:{w:640,h:360,fps:30,hotFps:15,samples:4},
 phone:{w:384,h:216,fps:12,hotFps:6,samples:2},
} as const;
export const FEED_FPS={desktop:FEED_SPECS.desktop.fps,phone:FEED_SPECS.phone.fps} as const;
export function feedSpec(phone:boolean,tier:number){const s=phone?FEED_SPECS.phone:FEED_SPECS.desktop;return {w:s.w,h:s.h,samples:s.samples,fps:tier>=2?s.hotFps:s.fps};}
/** The feed renders only within this distance of the stadium centre (m): the bowl and Stadium Plaza (its east end is ~153 m out). */
export const FEED_RADIUS=160;
/** The back face (card or feed) is shown within this distance; beyond it the slab's own dark paint shows (as before). */
export const CARD_RADIUS=190;
/** The broadcast camera's far plane (m): the bowl, not the island behind it. */
export const FEED_FAR=130;
/** Broadcast camera: the picture shows about FRAME_H m of pitch top to bottom at the ball (TV framing), the follow's smooth
 *  times (s: the camera's run along the touchline, its aim, its zoom) and the fov limits (degrees). */
export const BROADCAST={frameH:18,smoothPos:1.6,smoothLook:.85,smoothFov:2.2,minFov:11,maxFov:24,camX:-40,camY:16,track:.8} as const;
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
export const feedInterval=(phone:boolean,tier:number)=>1000/feedSpec(phone,tier).fps;
/** A new feed frame is due: feed mode, the back face in view, the interval passed since the last render (less a small slack, so
 *  a 30 fps feed on a 60 Hz display renders every second frame, not every third when a frame lands a hair early). */
export const feedDue=(mode:FeedMode,inView:boolean,nowMs:number,lastMs:number,intervalMs:number)=>mode==='feed'&&inView&&nowMs-lastMs>=intervalMs-Math.min(4,intervalMs*.15);
/** The broadcast camera's TARGET for a ball at (bx, bz): high on the west stand at y 16 (above the west roof's front edge, x −44.5,
 *  which stays behind it), tracking along the touchline at 80 % of the ball's run; it looks at the ball. Writes into `pos` / `look`. */
export function broadcastShot(bx:number,bz:number,pos:{x:number;y:number;z:number},look:{x:number;y:number;z:number}){
 const dz=Math.max(-50,Math.min(50,bz-STADIUM.z));
 pos.x=STADIUM.x+BROADCAST.camX;pos.y=BROADCAST.camY;pos.z=STADIUM.z+dz*BROADCAST.track;
 look.x=Math.max(STADIUM.x-30,Math.min(STADIUM.x+30,bx));look.y=0;look.z=STADIUM.z+dz;
}
/** The fov (degrees) that frames BROADCAST.frameH m at distance d. */
export const broadcastFov=(d:number)=>Math.max(BROADCAST.minFov,Math.min(BROADCAST.maxFov,2*Math.atan(BROADCAST.frameH/2/Math.max(1,d))*180/Math.PI));
/** A critically damped follow (Unity's SmoothDamp): moves `s.x` towards `target` over about `time` s with velocity `s.v`; no overshoot
 *  at a still target, no snap when the target jumps. */
export function smoothDamp(s:{x:number;v:number},target:number,time:number,dt:number){
 if(!(dt>0))return s.x;
 const w=2/Math.max(1e-4,time),x=w*dt,e=1/(1+x+.48*x*x+.235*x*x*x),c=s.x-target,t=(s.v+w*c)*dt,from=s.x;
 s.v=(s.v-w*t)*e;s.x=target+(c+t)*e;
 if((target-from>0)===(s.x>target)){s.x=target;s.v=0;}// never past the target
 return s.x;
}
/** The overlay's clock: the sim's seconds as m:ss. */
export const feedClock=(seconds:number)=>{const s=Math.max(0,Math.floor(Number.isFinite(seconds)?seconds:0));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
/** The overlay's change key (a redraw only when this changes: a goal or the clock's second). */
export const overlayKey=(s:ScreenScore)=>`${s.home}|${s.away}|${s.gold}|${s.blue}|${feedClock(s.clock??(s.minute-1)*60)}|${s.exhibition?1:0}`;

type Ctx2D=CanvasRenderingContext2D;
/** Draw the TV overlay on a transparent w × h canvas: the score box top left, the wordmark top right. */
export function drawOverlay(c:Ctx2D,w:number,h:number,s:ScreenScore,colours:{home:string;away:string},logo:(CanvasImageSource&{width:number;height:number})|null){
 c.clearRect(0,0,w,h);
 const k=h/360,pad=Math.round(16*k),bh=Math.round(30*k),y=pad,font=(px:number,wt=800)=>`${wt} ${Math.round(px*k)}px system-ui,-apple-system,"Segoe UI",sans-serif`;
 c.textBaseline='middle';c.textAlign='left';
 const home=s.home.slice(0,3).toUpperCase(),away=s.away.slice(0,3).toUpperCase(),score=`${s.gold}-${s.blue}`,clock=feedClock(s.clock??(s.minute-1)*60);
 c.font=font(17);const tw=Math.max(c.measureText(home).width,c.measureText(away).width),sw=(c.font=font(18,900),c.measureText(score).width);
 c.font=font(15,700);const cw=c.measureText(clock).width;
 const chip=Math.round(6*k),gap=Math.round(9*k),teamW=chip+gap+tw+gap,scoreW=sw+gap*2,clockW=cw+gap*2,x0=pad;
 // Dark box: [chip HOME] [score] [AWAY chip] then the clock in a lighter tab.
 c.fillStyle='rgba(10,20,28,.88)';c.fillRect(x0,y,teamW*2+scoreW,bh);
 c.fillStyle='#19b5a5';c.fillRect(x0+teamW*2+scoreW,y,clockW,bh);
 c.fillStyle=colours.home;c.fillRect(x0,y,chip,bh);c.fillStyle=colours.away;c.fillRect(x0+teamW*2+scoreW-chip,y,chip,bh);
 c.fillStyle='#ffffff';c.font=font(17);c.fillText(home,x0+chip+gap,y+bh/2+k);
 c.textAlign='right';c.fillText(away,x0+teamW*2+scoreW-chip-gap,y+bh/2+k);
 c.textAlign='center';c.font=font(18,900);c.fillStyle='#ffffff';c.fillRect(x0+teamW,y,scoreW,bh);c.fillStyle='#0d1b22';c.fillText(score,x0+teamW+scoreW/2,y+bh/2+k);
 c.font=font(15,700);c.fillStyle='#0d1b22';c.fillText(clock,x0+teamW*2+scoreW+clockW/2,y+bh/2+k);
 if(s.exhibition){c.textAlign='left';c.font=font(11,800);const t='EXHIBITION',ew=c.measureText(t).width+gap*2;c.fillStyle='rgba(10,20,28,.78)';c.fillRect(x0,y+bh,ew,Math.round(18*k));c.fillStyle='#ffd23f';c.fillText(t,x0+gap,y+bh+Math.round(9*k)+k);}
 // The wordmark, top right (white letters with a soft shadow so it reads on grass and on the stands).
 const lh=Math.round(30*k),lw=lh*WORDMARK_ASPECT;
 if(logo){c.save();c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=4*k;c.globalAlpha=.92;c.drawImage(logo,w-pad-lw,y,lw,lh);c.restore();}
 else{c.textAlign='right';c.font=`italic 900 ${Math.round(20*k)}px system-ui,sans-serif`;c.fillStyle='rgba(255,255,255,.9)';c.fillText('DRIP FC',w-pad,y+bh/2);}
}

export function createStadiumFeed(parent:T.Object3D,o:{phone:boolean;colours?:{home:string;away:string}}){
 const colours=o.colours??{home:'#d6453d',away:'#2f6fb5'};
 let mesh:T.Mesh|null=null,cardMat:T.MeshBasicMaterial|null=null,feedMat:T.MeshBasicMaterial|null=null,cardTex:T.CanvasTexture|null=null;
 let target:T.WebGLRenderTarget|null=null,cam:T.PerspectiveCamera|null=null,warm:'cold'|'warming'|'ready'='cold',last=-Infinity,mode:FeedMode='off',showing:'card'|'feed'|'none'='none';
 let overlay:HTMLCanvasElement|null=null,overlayTex:T.CanvasTexture|null=null,overlayShown='',logo:HTMLImageElement|null=null,logoReady=false,rendered=-Infinity;
 const frustum=new T.Frustum(),feedFrustum=new T.Frustum(),pv=new T.Matrix4(),box=new T.Box3(new T.Vector3(BACK_FACE.x-BACK_FACE.w/2,BACK_FACE.y-BACK_FACE.h/2,BACK_FACE.z-.05),new T.Vector3(BACK_FACE.x+BACK_FACE.w/2,BACK_FACE.y+BACK_FACE.h/2,BACK_FACE.z+.05));
 const shot={x:0,y:0,z:0},aim={x:0,y:0,z:0},hidden:T.Object3D[]=[];
 // The damped camera state (per axis: value + velocity).
 const P={x:{x:0,v:0},y:{x:0,v:0},z:{x:0,v:0}},A={x:{x:0,v:0},y:{x:0,v:0},z:{x:0,v:0}},Fv={x:20,v:0};
 const stats={renders:0,skippedHidden:0,overlayDraws:0,snaps:0};
 /** Debug / measuring: force the still card even while the feed could run (window.__fi2.stadiumSit.broadcast.forceCard). */
 const debug={forceCard:false};
 function build(){
  const canvas=document.createElement('canvas');canvas.width=FEED_SIZE.w;canvas.height=FEED_SIZE.h;
  cardTex=new T.CanvasTexture(canvas);cardTex.colorSpace=T.SRGBColorSpace;cardTex.generateMipmaps=false;cardTex.minFilter=T.LinearFilter;
  const paint=(img:HTMLImageElement|null)=>{const c=canvas.getContext?.('2d');if(!c)return;
   drawGateSign(c,FEED_SIZE.w,FEED_SIZE.h,img,'#0d1b22');
   c.fillStyle='#19b5a5';c.fillRect(0,0,FEED_SIZE.w,5);c.fillRect(0,FEED_SIZE.h-5,FEED_SIZE.w,5);
   cardTex!.needsUpdate=true;};
  paint(null);
  if(typeof Image!=='undefined'){const img=new Image();img.decoding='async';img.onload=()=>{logoReady=true;overlayShown='';if(cardTex)paint(img);};img.src=DRIP_FC_ART.wordmarkLight;logo=img;}
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
  const spec=feedSpec(o.phone,0);
  target=new T.WebGLRenderTarget(spec.w,spec.h,{depthBuffer:true,stencilBuffer:false,generateMipmaps:false,minFilter:T.LinearFilter,magFilter:T.LinearFilter,samples:spec.samples});
  overlay=document.createElement('canvas');overlay.width=spec.w;overlay.height=spec.h;
  overlayTex=new T.CanvasTexture(overlay);overlayTex.colorSpace=T.SRGBColorSpace;overlayTex.generateMipmaps=false;overlayTex.minFilter=T.LinearFilter;
  // Tone mapping happens when the feed is drawn into the frame (the target holds the linear picture), so it matches the view; the
  // overlay mixes in after it (graphics keep their own colours), on the same uv as the picture.
  feedMat=new T.MeshBasicMaterial({map:target.texture,toneMapped:true});
  const uOverlay={value:overlayTex};
  feedMat.onBeforeCompile=sh=>{sh.uniforms.uOverlay=uOverlay;
   sh.fragmentShader='uniform sampler2D uOverlay;\n'+sh.fragmentShader.replace('#include <tonemapping_fragment>',`#include <tonemapping_fragment>
 vec4 feedOv=texture2D(uOverlay,vMapUv);gl_FragColor.rgb=mix(gl_FragColor.rgb,feedOv.rgb,feedOv.a);`);};
  feedMat.customProgramCacheKey=()=>'stadium-feed-overlay';
  cam=new T.PerspectiveCamera(20,spec.w/spec.h,1,FEED_FAR);cam.userData.broadcastFeed=true;// sponsor "seen" counts skip it (surfaces.ts)
  warm='warming';
  const r=renderer as T.WebGLRenderer&{compileAsync?:(s:T.Object3D,c:T.Camera)=>Promise<unknown>};
  if(typeof r.compileAsync!=='function'){warm='ready';return;}
  const prev=renderer.getRenderTarget();
  try{renderer.setRenderTarget(target);const p=r.compileAsync(scene,cam);renderer.setRenderTarget(prev);p.then(()=>{warm='ready';},()=>{warm='ready';});}
  catch{renderer.setRenderTarget(prev);warm='ready';}
 }
 function drawOverlayIfChanged(s:ScreenScore|null){
  if(!overlay||!overlayTex||!s)return;const key=overlayKey(s)+(logoReady?'|L':'');if(key===overlayShown)return;overlayShown=key;
  const c=overlay.getContext?.('2d');if(!c)return;drawOverlay(c,overlay.width,overlay.height,s,colours,logoReady?logo:null);overlayTex.needsUpdate=true;stats.overlayDraws++;
 }
 /** Move the broadcast camera towards this ball's shot (damped); snaps only on the first render or after a long gap. */
 function aimCamera(bx:number,bz:number,nowMs:number){
  broadcastShot(bx,bz,shot,aim);
  const gap=(nowMs-rendered)/1000;rendered=nowMs;
  if(!(gap<2)){P.x.x=shot.x;P.y.x=shot.y;P.z.x=shot.z;A.x.x=aim.x;A.y.x=aim.y;A.z.x=aim.z;P.x.v=P.y.v=P.z.v=A.x.v=A.y.v=A.z.v=0;
   Fv.x=broadcastFov(Math.hypot(aim.x-shot.x,aim.y-shot.y,aim.z-shot.z));Fv.v=0;stats.snaps++;}
  else{const dt=Math.min(.5,gap),B=BROADCAST;
   smoothDamp(P.x,shot.x,B.smoothPos,dt);smoothDamp(P.y,shot.y,B.smoothPos,dt);smoothDamp(P.z,shot.z,B.smoothPos,dt);
   smoothDamp(A.x,aim.x,B.smoothLook,dt);smoothDamp(A.y,aim.y,B.smoothLook,dt);smoothDamp(A.z,aim.z,B.smoothLook,dt);
   smoothDamp(Fv,broadcastFov(Math.hypot(A.x.x-P.x.x,A.y.x-P.y.x,A.z.x-P.z.x)),B.smoothFov,dt);}
  cam!.position.set(P.x.x,P.y.x,P.z.x);cam!.lookAt(A.x.x,A.y.x,A.z.x);
  if(Math.abs(cam!.fov-Fv.x)>.01){cam!.fov=Fv.x;cam!.updateProjectionMatrix();}
  cam!.updateMatrixWorld();feedFrustum.setFromProjectionMatrix(pv.multiplyMatrices(cam!.projectionMatrix,cam!.matrixWorldInverse));
 }
 return {
  stats,debug,
  get mode(){return mode;},get showing(){return showing;},get mesh(){return mesh;},get target(){return target;},get camera(){return cam;},get overlay(){return overlay;},
  /** Each frame from stadiumSit, right before the main render. dc = the player's distance from the stadium centre; ball = the
   *  live match's ball (null = no match); hide = what must not appear in the feed (the crowd, the flags, the front score screen);
   *  score = the front screen's score (stadiumScreen.ts) for the overlay. */
  update(renderer:T.WebGLRenderer,scene:T.Scene,camera:T.Camera,nowMs:number,dc:number,ball:{x:number;z:number}|null,tier:number,hide:readonly (T.Object3D|null|undefined)[],score:ScreenScore|null=null){
   mode=debug.forceCard&&ball?(dc<CARD_RADIUS?'card':'off'):feedMode({dc,live:!!ball,tier});
   broadcastView.frustum=null;// set again below only while the feed renders (fieldRuntime then draws what the feed camera sees)
   if(mode==='off'){show('none');return false;}
   if(!mesh)build();
   if(mode==='card'){show('card');return false;}
   // Feed mode: the back face must face the camera (the camera south of it) and be inside the frustum.
   camera.updateMatrixWorld();
   const inView=camera.position.z>BACK_FACE.z&&(pv.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse),frustum.setFromProjectionMatrix(pv).intersectsBox(box));
   if(!inView){stats.skippedHidden++;return false;}
   ensureTarget(renderer,scene);
   if(warm!=='ready'){show('card');return false;}
   if(rendered>-Infinity)broadcastView.frustum=feedFrustum;// next frame's matches pose and draw for the feed camera too
   const every=feedInterval(o.phone,tier);
   if(!feedDue(mode,inView,nowMs,last,every)){show(last>-Infinity?'feed':'card');return false;}
   last=nowMs-last<every*1.5?last+every:nowMs;/* keep the cadence (no drift from the early-frame slack) */aimCamera(ball!.x,ball!.z,nowMs);drawOverlayIfChanged(score);
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
   broadcastView.frustum=null;
   if(mesh){mesh.removeFromParent();mesh.geometry.dispose();}
   cardMat?.dispose();feedMat?.dispose();cardTex?.dispose();overlayTex?.dispose();target?.dispose();
   mesh=null;cardMat=feedMat=null;cardTex=overlayTex=null;overlay=null;target=null;cam=null;warm='cold';showing='none';last=-Infinity;rendered=-Infinity;overlayShown='';
  },
 };
}
export type StadiumFeed=ReturnType<typeof createStadiumFeed>;
