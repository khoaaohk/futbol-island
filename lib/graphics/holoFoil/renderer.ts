/**
 * Holo foil renderer (card lab, Oct 8 2026): one WebGL2 context on one canvas over the large card's front face.
 * Heat rules (docs/performance-guide.md, "Holo foil card lab"):
 *  - one holo context on the page at a time (claimHoloContext: a new card takes it, the old one falls back to the CSS foil);
 *  - the canvas is capped at DPR 1.5 on touch devices and 2 on desktop (holoDpr);
 *  - the portrait mask is uploaded once per player; layout uniforms change only on resize;
 *  - it draws only when lib/graphics/holoFoil/loop.ts asks (no loop of its own);
 *  - draw cost is measured with EXT_disjoint_timer_query_webgl2 when the browser exposes it, otherwise as CPU submit time.
 */
import {HOLO_FRAGMENT,HOLO_VERTEX} from './shader';
import {PATTERN_INDEX,TIER_INDEX,TIER_LOOK,type HoloPattern,type HoloTier} from './patterns';
import type {HoloPose} from './loop';

export type Rect=[number,number,number,number];
export type HoloLayout={w:number;h:number;radii:[number,number,number,number];win:Rect;winR:number;text:[Rect,Rect];mask:Rect|null;paper:Rect|null};
export type HoloLook={pattern:HoloPattern;tier:HoloTier;intensity:number};
export type DrawTiming={cpuMs:number;gpuMs:number|null;gpuTimer:boolean};
export type HoloRenderer={
 resize(layout:HoloLayout,dpr:number):void;
 setLook(look:HoloLook):void;
 /** The player's packed riso mask (ink | tone), uploaded once; null clears it (the drawn-portrait fallback ellipse). */
 setMask(image:TexImageSource|null):void;
 draw(pose:HoloPose,glint:number):void;
 timing():DrawTiming;
 readonly canvasPx:[number,number];
 dispose(lose:boolean):void;
};

/** Why the WebGL foil is not used (the CSS foil shows instead), or null when it can be. */
export type FallbackReason='no-webgl2'|'reduced-motion'|'context-lost'|'taken'|'error';
type WinLike={WebGL2RenderingContext?:unknown;matchMedia?:(q:string)=>{matches:boolean}};
export function holoSupport(win:WinLike|undefined):FallbackReason|null{
 if(!win||typeof win.WebGL2RenderingContext==='undefined')return 'no-webgl2';
 if(win.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return 'reduced-motion';
 return null;
}

// ── One holo context on the page. A new claim makes the previous holder give its context up (it shows the CSS foil).
type Holder={release:()=>void};
let holder:Holder|null=null;
export function claimHoloContext(next:Holder){if(holder&&holder!==next){const old=holder;holder=null;old.release();}holder=next;}
export function releaseHoloContext(h:Holder){if(holder===h)holder=null;}
export const holoContextHolder=()=>holder;

/** The light follows the pointer (PlayerCard's spring px/py, -1..1); the arrival glint sweeps it across instead. */
export function lightFor(pose:HoloPose,glint:number,aspect:number):[number,number,number]{
 if(glint>=0){const g=glint*glint*(3-2*glint);return [-1.1+2.2*g,(-.55+.7*g)*aspect,.85];}
 return [pose.px*.62,pose.py*.5*aspect,.9];
}
/** CSS `perspective(1400px) rotateX(rx) rotateY(ry)` (y down, z toward the viewer): a world point in the card's own frame. */
export function toCard(rxDeg:number,ryDeg:number,v:[number,number,number]):[number,number,number]{
 const a=rxDeg*Math.PI/180,b=ryDeg*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);
 // world = Rx·Ry·local, so local = Ryᵀ·Rxᵀ·world
 const x=v[0],y=ca*v[1]+sa*v[2],z=-sa*v[1]+ca*v[2];
 return [cb*x-sb*z,y,sb*x+cb*z];
}

export function createHoloRenderer(canvas:HTMLCanvasElement,onLost:()=>void):HoloRenderer|null{
 let gl:WebGL2RenderingContext|null=null;
 try{gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'}) as WebGL2RenderingContext|null;}catch{gl=null;}
 if(!gl||gl.isContextLost())return null;
 const g=gl;
 const lost=(event:Event)=>{event.preventDefault();onLost();};
 canvas.addEventListener('webglcontextlost',lost);
 const compile=(type:number,src:string)=>{const s=g.createShader(type)!;g.shaderSource(s,src);g.compileShader(s);
  if(!g.getShaderParameter(s,g.COMPILE_STATUS)){const log=g.getShaderInfoLog(s);g.deleteShader(s);throw new Error('holo shader: '+log);}return s;};
 let program:WebGLProgram;
 try{const vs=compile(g.VERTEX_SHADER,HOLO_VERTEX),fs=compile(g.FRAGMENT_SHADER,HOLO_FRAGMENT);program=g.createProgram()!;
  g.attachShader(program,vs);g.attachShader(program,fs);g.linkProgram(program);g.deleteShader(vs);g.deleteShader(fs);
  if(!g.getProgramParameter(program,g.LINK_STATUS))throw new Error('holo link: '+g.getProgramInfoLog(program));}
 catch(error){console.warn(error);canvas.removeEventListener('webglcontextlost',lost);return null;}
 g.useProgram(program);
 const vao=g.createVertexArray();g.bindVertexArray(vao);
 const buf=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,buf);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),g.STATIC_DRAW);
 const aPos=g.getAttribLocation(program,'aPos');g.enableVertexAttribArray(aPos);g.vertexAttribPointer(aPos,2,g.FLOAT,false,0,0);
 const U=(n:string)=>g.getUniformLocation(program,n);
 const u={size:U('uSize'),px:U('uPx'),radii:U('uRadii'),win:U('uWin'),winR:U('uWinR'),text0:U('uText0'),text1:U('uText1'),maskRect:U('uMaskRect'),hasMask:U('uHasMask'),
  maskShift:U('uMaskShift'),paper:U('uPaper'),mask:U('uMask'),cam:U('uCam'),light:U('uLightPos'),glint:U('uGlint'),pattern:U('uPattern'),tier:U('uTier'),strength:U('uStrength'),centre:U('uCentre')};
 const tex=g.createTexture();g.activeTexture(g.TEXTURE0);g.bindTexture(g.TEXTURE_2D,tex);
 g.texImage2D(g.TEXTURE_2D,0,g.RGBA,1,1,0,g.RGBA,g.UNSIGNED_BYTE,new Uint8Array(4));g.uniform1i(u.mask,0);
 g.disable(g.BLEND);g.clearColor(0,0,0,0);
 let layout:HoloLayout|null=null,hasMask=false,maskShift:[number,number]=[0,0];
 const px:[number,number]=[0,0];
 // Draw cost. GPU timer queries resolve a frame or more later; a pending one is read on the next draw (or never, at rest).
 const timerExt=g.getExtension('EXT_disjoint_timer_query_webgl2') as {TIME_ELAPSED_EXT:number;GPU_DISJOINT_EXT:number}|null;
 const pending:WebGLQuery[]=[];const gpuSamples:number[]=[],cpuSamples:number[]=[];
 const keep=(list:number[],v:number)=>{list.push(v);if(list.length>60)list.shift();};
 const readQueries=()=>{if(!timerExt)return;const disjoint=g.getParameter(timerExt.GPU_DISJOINT_EXT);
  while(pending.length&&g.getQueryParameter(pending[0],g.QUERY_RESULT_AVAILABLE)){const q=pending.shift()!;
   if(!disjoint)keep(gpuSamples,g.getQueryParameter(q,g.QUERY_RESULT)/1e6);g.deleteQuery(q);}};
 const mean=(list:number[])=>list.length?list.reduce((a,b)=>a+b,0)/list.length:0;
 return {
  get canvasPx(){return px;},
  resize(next,dpr){layout=next;const w=Math.max(1,Math.round(next.w*dpr)),h=Math.max(1,Math.round(next.h*dpr));
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}px[0]=w;px[1]=h;g.viewport(0,0,w,h);
   g.uniform2f(u.size,next.w,next.h);g.uniform1f(u.px,w/next.w);g.uniform4f(u.radii,...next.radii);g.uniform4f(u.win,...next.win);g.uniform1f(u.winR,next.winR);
   g.uniform4f(u.text0,...next.text[0]);g.uniform4f(u.text1,...next.text[1]);
   if(next.mask)g.uniform4f(u.maskRect,...next.mask);g.uniform4f(u.paper,...(next.paper??[0,0,0,0]));g.uniform1f(u.hasMask,hasMask&&next.mask?1:0);
   // Pattern centre: the portrait's chest/head, in the shader's units (face 100 wide, centred).
   const cx=next.win[0]+next.win[2]*.5,cy=next.win[1]+next.win[3]*.42;g.uniform2f(u.centre,(cx-next.w/2)/next.w*100,(cy-next.h/2)/next.w*100);},
  setLook(look){const t=TIER_LOOK[look.tier];g.uniform1i(u.pattern,PATTERN_INDEX[look.pattern]);g.uniform1i(u.tier,TIER_INDEX[look.tier]);g.uniform1f(u.strength,t.strength*look.intensity);},
  setMask(image){g.bindTexture(g.TEXTURE_2D,tex);
   if(image){g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL,false);g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
    g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,image);g.generateMipmap(g.TEXTURE_2D);
    g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR_MIPMAP_LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);
    g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);hasMask=true;}
   else hasMask=false;
   g.uniform1f(u.hasMask,hasMask&&layout?.mask?1:0);},
  draw(pose,glint){if(!layout||g.isContextLost())return;const t0=performance.now();readQueries();
   const aspect=layout.h/layout.w,D=1400/layout.w;
   const cam=toCard(pose.rx,pose.ry,[0,0,D]),light=toCard(pose.rx,pose.ry,lightFor(pose,glint,aspect));
   // The portrait plane's parallax (PlayerArt .mid: −6 / −4 px at full tilt).
   const sx=-6*pose.px,sy=-4*pose.py;if(sx!==maskShift[0]||sy!==maskShift[1]){maskShift=[sx,sy];g.uniform2f(u.maskShift,sx,sy);}
   g.uniform3f(u.cam,...cam);g.uniform3f(u.light,...light);g.uniform1f(u.glint,glint);
   let q:WebGLQuery|null=null;if(timerExt&&pending.length<4){q=g.createQuery();if(q)g.beginQuery(timerExt.TIME_ELAPSED_EXT,q);}
   g.drawArrays(g.TRIANGLES,0,3);
   if(q&&timerExt){g.endQuery(timerExt.TIME_ELAPSED_EXT);pending.push(q);}
   keep(cpuSamples,performance.now()-t0);},
  timing:()=>{readQueries();return {cpuMs:mean(cpuSamples),gpuMs:timerExt&&gpuSamples.length?mean(gpuSamples):null,gpuTimer:!!timerExt};},
  dispose(lose){canvas.removeEventListener('webglcontextlost',lost);
   if(!g.isContextLost()){for(const q of pending)g.deleteQuery(q);g.deleteTexture(tex);g.deleteBuffer(buf);g.deleteVertexArray(vao);g.deleteProgram(program);
    if(lose)g.getExtension('WEBGL_lose_context')?.loseContext();}},
 };
}
