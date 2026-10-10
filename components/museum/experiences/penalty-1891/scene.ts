import * as T from 'three';
import {createPlayer,DIVE_KINDS,PLAYER_KICK_CONTACT,type DiveKind,type PlayerMotion,type PlayerRig,type SaveOutcome} from '@/lib/graphics/player';
import {createIslandLighting} from '@/lib/graphics/islandLighting';
import {applyCelebrationArms,celebrationJump,CELEBRATION_SECONDS} from '@/lib/graphics/celebrations';
import {createBallMaterial} from '@/lib/museum/wcBalls/ballViewer';
import TRIONDA_GLSL from '@/lib/museum/wcBalls/designs/2026-trionda';
import {DEFAULT_CUSTOMIZATION,beanLookFor,loadCustomization,playerOutfit,MAIN_PLAYER_NUMBER} from '@/lib/town/customization';
import {getQuizProgress} from '@/lib/town/quizProgress';
import {matchPlayerDress} from '@/lib/town/beanLooks';
import {BALL_R,GOAL_H,GOAL_W,MARK,POST_X,POWERS,WOBBLE,atKeeper,flightTime,keeperDepth,keeperTime,reach,toGoal,zoneOf,type Dive,type Era,type Power,type Result} from './model';

/**
 * penalty-1891 · the broadcast stage (Oct 5 2026 redesign). A lightweight three.js penalty: the island's own bean characters
 * (lib/graphics/player.ts with the bean skin, exactly as CharacterPreview builds them) — the visitor's saved character as the
 * kicker, seen over the shoulder, and a keeper in goal (keeper kit and gloves today; a cap and wool jersey in 1891). The keeper's
 * dives are the rig's own save types (side, collapse, tip, spring, stand: DIVE_KINDS), the host only moves his root, as the live
 * match does (lib/town/match/choreo.ts). A real-scale goal (7.32 × 2.44 m, 11 m away) with a shaded net that bulges, era-correct
 * markings (1891: the 12-yard line across the pitch, the dotted 18-yard line and the 6-yard arcs from each post), an era-correct
 * ball (wcBalls: 1891 laced leather, today's Trionda), and a soft stadium (or an 1891 ground) that reads as a crowd without noise.
 *
 * The teaching graphics are drawn on the goal plane like broadcast graphics: the keeper's reach (projected from 6 yards out in
 * 1891), the spray of where this aim and power can land (the model's own 360 wobble samples), the zone you're in and your shots.
 *
 * Framing: the camera sits behind and above the kicker and always looks at the goal; an off-centre frustum puts the goal's centre
 * in the middle of the visible stage (the part of the screen the panels leave free, from setInsets), at every size.
 *
 * Heat: render on demand. Nothing runs while you aim (a drag draws one frame per move); the loop runs only while something moves
 * (a shot ≈3 s, the keeper stepping out, the intro camera move) and sleeps after; it stops when the tab is hidden and everything
 * is disposed on unmount. One small shadow map.
 *
 * 16-bit pixel art (Oct 9 2026, museum styles pass): the stage renders into a LOW-RES drawing buffer (one buffer pixel = 2–4 CSS
 * pixels, ≈440 px on the long side, so far fewer pixels than the old DPR ≤1.5 render) that the browser upscales nearest-neighbour
 * (CSS image-rendering: pixelated). One cheap full-screen pass then gives it the console look: the frame is reduced to the Sega
 * Mega Drive's 9-bit colour (8 levels per channel) through a 4×4 Bayer ordered dither, with a one-pixel dark outline where a
 * figure meets a brighter background. The goal-plane graphics are drawn on a small canvas sampled nearest-neighbour (square
 * pixels, no smoothing). While a shot plays the stage is drawn at 30 frames a second (sprite-like cadence, half the GPU work).
 */
export type Insets={top:number;right:number;bottom:number;left:number};
export type Shot={x:number;y:number;result:Result};
export type SceneState={era:Era;power:Power;aimX:number;aimY:number;shots:readonly Shot[];mode:'intro'|'aim'|'flying'|'result'};
export type ShotPlan={x:number;y:number;dive:Dive;result:Result};
export type PenaltyScene={
 set(s:SceneState):void;
 setInsets(i:Insets):void;
 /** Run a shot: onImpact when the ball meets the keeper or the goal line, onDone when everything has settled. */
 shoot(plan:ShotPlan,onImpact:()=>void,onDone:()=>void):void;
 reset():void;
 /** Canvas pixels → goal-plane metres (x across, y up), using the aiming camera. */
 unproject(px:number,py:number):{x:number;y:number};
 /** World metres → canvas pixels, using the aiming camera. */
 project(x:number,y:number,z:number):{x:number;y:number};
 dispose():void;
};
type Opts={coarse:boolean;reducedMotion:boolean;onLayout?:()=>void};

const VR=.13;// the drawn ball's radius (a touch bigger than real, so it reads on a phone)
const KZ_TODAY=.32;// the keeper stands just off his line
const S0=new T.Vector3(-1.9,0,14.3);// the kicker's run-up starts here (off-axis, left of the camera line)
const RUN=.8,KICK_START=.6,KICK_DUR=.62,CONTACT=KICK_START+KICK_DUR*PLAYER_KICK_CONTACT,DIVE_S=1.6,HOLD_MS=80;
const STRIKE_X=-.14,STRIKE_Z=.62,KICK_SIDE=-1 as const;
/** Lateral distance from the keeper's root to his hands at the moment they meet the ball, per save type (sampled from the rig). */
const HAND_REACH:Record<DiveKind,number>={side:1,collapse:.8,tip:.85,spring:.95,smother:.4,stand:.45};
const clamp=(v:number,a:number,b:number)=>v<a?a:v>b?b:v,clamp01=(v:number)=>clamp(v,0,1),smooth=(v:number)=>{const t=clamp01(v);return t*t*(3-2*t);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const easeIO=(t:number)=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

// ── era looks ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
const ERA_LOOK={
 today:{zenith:'#16244a',horizon:'#f0a96c',mid:'#5b5a86',fog:'#6f6a87',fogNear:62,fogFar:190,grassA:'#2f7d3a',grassB:'#3a8c45',wear:'#6f7a3c',stripes:1,light:'sunset' as const},
 '1891':{zenith:'#8fa6bb',horizon:'#ece4d3',mid:'#c9cdc8',fog:'#cfccc0',fogNear:52,fogFar:170,grassA:'#4f7d3d',grassB:'#557f40',wear:'#7d7348',stripes:.25,light:'day' as const},
};

// ── textures (drawn once) ──────────────────────────────────────────────────────────────────────────────────────────────────
function rand(seed:number){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
function canvasTex(w:number,h:number,draw:(g:CanvasRenderingContext2D,w:number,h:number)=>void,repeatU=1){
 const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d')!;draw(g,w,h);
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;if(repeatU!==1){t.wrapS=T.RepeatWrapping;t.repeat.set(repeatU,1);}return t;}
/** A soft modern crowd: seat rows, aisles, and blurred people in muted kit colours (low contrast: it reads as a crowd, not noise). */
function crowdTexture(seed:number,dark:number){return canvasTex(512,256,(g,w,h)=>{const r=rand(seed);
 const bg=g.createLinearGradient(0,0,0,h);bg.addColorStop(0,`rgb(${22*dark|0},${26*dark|0},${44*dark|0})`);bg.addColorStop(1,`rgb(${36*dark|0},${40*dark|0},${60*dark|0})`);g.fillStyle=bg;g.fillRect(0,0,w,h);
 // Home end in gold, a few away colours: muted, soft, low contrast (a crowd, not confetti).
 const kits=['#b08a3e','#c49b4c','#9a7a3a','#4f7480','#8a8f9a','#a0603f','#6f7d8a'];
 g.filter='blur(2.4px)';
 for(let row=0;row<16;row++){const y=h-8-row*15.5;g.globalAlpha=1;g.fillStyle='rgba(8,10,20,.3)';g.fillRect(0,y+5,w,3);
  for(let x=2;x<w;x+=6.5+r()*3){if(x%128<7)continue;if(r()<.16)continue;
   const k=kits[(r()*kits.length)|0];g.globalAlpha=(.22+r()*.16)*dark;g.fillStyle=k;g.beginPath();g.ellipse(x,y,3.6,5,0,0,Math.PI*2);g.fill();
   g.fillStyle='#c9a58a';g.globalAlpha=.16*dark;g.beginPath();g.arc(x,y-6.5,2.4,0,Math.PI*2);g.fill();}}
 g.globalAlpha=1;g.filter='none';for(let x=0;x<w;x+=128){g.fillStyle='rgba(110,116,140,.12)';g.fillRect(x,0,6,h);}
 const haze=g.createLinearGradient(0,0,0,h);haze.addColorStop(0,'rgba(20,24,44,.35)');haze.addColorStop(1,'rgba(20,24,44,0)');g.fillStyle=haze;g.fillRect(0,0,w,h);
},10);}
/** An 1891 crowd: rows of standing spectators in dark coats with flat caps and bowlers, softly drawn. */
function victorianCrowd(){return canvasTex(512,192,(g,w,h)=>{const r=rand(1891);
 g.fillStyle='#a49c86';g.fillRect(0,0,w,h);
 const coats=['#3b3a3f','#4a3f35','#2f3440','#5a4a3a','#3d4637','#55504a','#6b5a44'],skins=['#e8cdb0','#d8b08c','#c9997a'];
 g.filter='blur(.9px)';
 for(let row=0;row<9;row++){const y=30+row*19;
  for(let x=-4;x<w+6;x+=8+r()*5){const c=coats[(r()*coats.length)|0];g.fillStyle=c;g.beginPath();g.ellipse(x,y+14,5.2,11,0,0,Math.PI*2);g.fill();
   g.fillStyle=skins[(r()*skins.length)|0];g.beginPath();g.arc(x,y-1,3.3,0,Math.PI*2);g.fill();
   g.fillStyle=r()<.5?'#2a2622':'#3e3a33';if(r()<.55){g.fillRect(x-4.2,y-5.6,8.4,2.2);g.fillRect(x-3,y-7.4,6,2);}else{g.beginPath();g.ellipse(x,y-4.3,4.6,2.6,0,Math.PI,0);g.fill();}}}
 g.filter='none';const fade=g.createLinearGradient(0,0,0,h);fade.addColorStop(0,'rgba(170,164,146,.55)');fade.addColorStop(.5,'rgba(170,164,146,0)');g.fillStyle=fade;g.fillRect(0,0,w,h);
},6);}
function adTexture(){return canvasTex(512,64,(g,w,h)=>{
 const bg=g.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#10284c');bg.addColorStop(1,'#0a1a33');g.fillStyle=bg;g.fillRect(0,0,w,h);
 g.font='800 21px system-ui,-apple-system,Arial,sans-serif';g.textBaseline='middle';g.textAlign='center';g.globalAlpha=.75;
 g.fillStyle='#e9e4d6';g.fillText('FUTBOL ISLAND',w*.28,h/2+1);g.fillStyle='#ffd84a';g.fillText('·',w*.58,h/2+1);g.fillStyle='#9fc6d6';g.fillText('FAIR PLAY',w*.78,h/2+1);
},14);}
function fasciaTexture(){return canvasTex(512,32,(g,w,h)=>{const bg=g.createLinearGradient(0,0,w,0);bg.addColorStop(0,'#1e5f74');bg.addColorStop(.5,'#e0a94a');bg.addColorStop(1,'#1e5f74');g.fillStyle=bg;g.fillRect(0,0,w,h);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,h-6,w,6);},6);}
function glowTexture(){return canvasTex(64,64,(g)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.2,'rgba(255,248,226,.55)');r.addColorStop(1,'rgba(255,240,210,0)');g.fillStyle=r;g.fillRect(0,0,64,64);});}

// ── shaders ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const PITCH_VERT=/* glsl */`varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const PITCH_FRAG=/* glsl */`
uniform float uEra;uniform vec3 uA,uB,uWear,uFog;uniform float uStripes,uFogNear,uFogFar;varying vec3 vW;
float h2(vec2 p){p=fract(p*vec2(.1031,.103));p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.x);}
float n2(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
float ln(float d,float w){float a=fwidth(d)*.85+1e-4;return 1.-smoothstep(w-a,w+a,abs(d));}
void main(){
 vec2 p=vW.xz;float W=.06;
 float stripe=step(.5,fract(p.y/5.5));vec3 c=mix(uA,uB,stripe*uStripes);
 c*=.9+.12*n2(p*2.3)+.1*n2(p*.31);
 float wear=exp(-pow(p.x/2.4,2.)-pow((p.y-.9)/1.5,2.))*.4+exp(-pow(p.x/.7,2.)-pow((p.y-11.)/.8,2.))*.3*(1.-uEra);
 c=mix(c,uWear,wear*(.55+.45*n2(p*5.)));
 float L=ln(p.y,W);
 if(uEra<.5){
  L=max(L,ln(p.y-5.5,W)*step(abs(p.x),9.16)*step(0.,p.y));L=max(L,ln(abs(p.x)-9.16,W)*step(p.y,5.5)*step(0.,p.y));
  L=max(L,ln(p.y-16.5,W)*step(abs(p.x),20.16));L=max(L,ln(abs(p.x)-20.16,W)*step(p.y,16.5)*step(0.,p.y));
  float r=length(p-vec2(0.,11.));L=max(L,1.-smoothstep(.11,.11+fwidth(r)*1.5,r));L=max(L,ln(r-9.15,W)*step(16.5,p.y));
 }else{
  float ax=max(abs(p.x)-3.66,0.);L=max(L,ln(length(vec2(ax,p.y))-5.49,W)*step(0.,p.y));
  L=max(L,ln(p.y-10.97,W));
  L=max(L,ln(p.y-16.46,W)*step(.45,fract(p.x/1.1)));
 }
 c=mix(c,vec3(.93,.94,.9),L*.9*step(0.,p.y+.06));
 float d=length(vW-cameraPosition);c=mix(c,uFog,smoothstep(uFogNear,uFogFar,d));
 gl_FragColor=vec4(c,1.);}`;
const SKY_VERT=/* glsl */`varying vec3 vD;void main(){vD=normalize(position);vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}`;
const SKY_FRAG=/* glsl */`uniform vec3 uZ,uH,uM;varying vec3 vD;void main(){float y=vD.y;vec3 c=mix(uH,uM,smoothstep(0.,.12,y));c=mix(c,uZ,smoothstep(.1,.55,y));gl_FragColor=vec4(c,1.);}`;
/** The net: a diamond mesh drawn analytically (crisp at any distance, fading to a soft veil when the holes get tiny); it bulges where the ball hits. */
const NET_VERT=/* glsl */`
attribute vec2 aM;attribute float aW;uniform vec3 uHit;uniform float uAmp;varying vec2 vM;varying float vF;
void main(){vec3 p=position;float g=exp(-(pow(p.x-uHit.x,2.)+pow(p.y-uHit.y,2.)*1.4)/.55);p.z-=uAmp*g*aW;p.y-=uAmp*g*aW*.25;vM=aM;
 vec4 mv=modelViewMatrix*vec4(p,1.);vF=-mv.z;gl_Position=projectionMatrix*mv;}`;
const NET_FRAG=/* glsl */`uniform vec3 uCol;uniform vec3 uFog;uniform float uFogNear,uFogFar;varying vec2 vM;varying float vF;
void main(){vec2 q=vec2(vM.x+vM.y,vM.x-vM.y)*(.7071/.12);vec2 f=abs(fract(q)-.5);float d=min(f.x,f.y);
 float w=length(fwidth(q));float line=1.-smoothstep(.035,.035+w,.5-max(f.x,f.y)+ .0);line=max(line,1.-smoothstep(0.,w*1.2+.03,d));
 float veil=smoothstep(.25,.6,w);float a=mix(line*.7,.16,veil);if(a<.02)discard;
 vec3 c=mix(uCol,uFog,smoothstep(uFogNear,uFogFar,vF));gl_FragColor=vec4(c,a);}`;

/** Buffer pixels: one per 2–4 CSS pixels, ≈440 on the long side (a 16-bit console's resolution, scaled to the screen). */
export const pixelScale=(w:number,h:number)=>Math.max(2,Math.min(4,Math.round(Math.max(w,h)/440)));
const POST_VERT=/* glsl */`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
/** 9-bit colour (8 levels a channel, the Mega Drive's palette space) through a 4×4 Bayer ordered dither, and a 1 px dark outline
 *  on the darker side of a strong edge (sprites in 16-bit games are outlined). A little extra saturation for the console punch. */
const POST_FRAG=/* glsl */`uniform sampler2D uTex;uniform vec2 uRes;varying vec2 vUv;
float bayer2(vec2 a){a=floor(a);return fract(a.x/2.+a.y*a.y*.75);}
float bayer(vec2 a){return bayer2(.5*a)*.25+bayer2(a);}// 4×4 ordered-dither threshold, 0..1
float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
void main(){vec2 d=1./uRes;vec3 c=texture2D(uTex,vUv).rgb;float l=lum(c);
 float n=max(max(lum(texture2D(uTex,vUv+vec2(d.x,0.)).rgb),lum(texture2D(uTex,vUv-vec2(d.x,0.)).rgb)),max(lum(texture2D(uTex,vUv+vec2(0.,d.y)).rgb),lum(texture2D(uTex,vUv-vec2(0.,d.y)).rgb)));
 c=mix(vec3(l),c,1.18);
 if(n-l>.30)c*=.38;
 float t=bayer(gl_FragCoord.xy);
 c=floor(clamp(c,0.,1.)*7.+t)/7.;
 gl_FragColor=vec4(c,1.);}`;

// ── the stage ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
export function createPenaltyScene(canvas:HTMLCanvasElement,opts:Opts):PenaltyScene{
 const renderer=new T.WebGLRenderer({canvas,antialias:false,alpha:false,powerPreference:'high-performance'});
 // Pixel art: the drawing buffer is low-res (DPR well under 1); the browser upscales it nearest-neighbour. Never above 1.5 on touch.
 let px=pixelScale(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(1/px,opts.coarse?1.5:2));
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene();scene.background=new T.Color('#16244a');
 const camera=new T.PerspectiveCamera(30,1,.1,600);
 const disposables:{dispose():void}[]=[];const keep=<X extends {dispose():void}>(x:X)=>{disposables.push(x);return x;};

 // Light: the island's own presets (so the beans look exactly as they do on the island), one shadow-casting sun.
 const hemi=new T.HemisphereLight(),sun=new T.DirectionalLight();sun.position.set(-9,16,21);sun.target.position.set(0,0,6);
 sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-9,right:9,top:11,bottom:-11,near:1,far:60});sun.shadow.bias=-.0008;sun.shadow.normalBias=.02;
 scene.add(hemi,sun,sun.target);const lighting=createIslandLighting(scene,hemi,sun,renderer);

 // Sky dome and fog.
 const skyU={uZ:{value:new T.Color()},uH:{value:new T.Color()},uM:{value:new T.Color()}};
 const sky=new T.Mesh(keep(new T.SphereGeometry(500,24,12)),keep(new T.ShaderMaterial({vertexShader:SKY_VERT,fragmentShader:SKY_FRAG,uniforms:skyU,side:T.BackSide,depthWrite:false})));sky.renderOrder=-10;sky.frustumCulled=false;scene.add(sky);
 scene.fog=new T.Fog('#6f6a87',62,190);

 // Pitch (analytic lines) + a shadow catcher over the playing area.
 const pitchU={uEra:{value:0},uA:{value:new T.Color()},uB:{value:new T.Color()},uWear:{value:new T.Color()},uFog:{value:new T.Color()},uStripes:{value:1},uFogNear:{value:38},uFogFar:{value:150}};
 const pitch=new T.Mesh(keep(new T.PlaneGeometry(260,200)),keep(new T.ShaderMaterial({vertexShader:PITCH_VERT,fragmentShader:PITCH_FRAG,uniforms:pitchU})));pitch.rotation.x=-Math.PI/2;pitch.position.set(0,0,20);scene.add(pitch);
 const catcher=new T.Mesh(keep(new T.PlaneGeometry(24,26)),keep(new T.ShadowMaterial({color:'#0b1d10',opacity:.38})));catcher.rotation.x=-Math.PI/2;catcher.position.set(0,.004,8);catcher.receiveShadow=true;scene.add(catcher);

 // Goal: posts and bar (12 cm), stanchions, and the net.
 const goal=new T.Group();scene.add(goal);
 const white=keep(new T.MeshStandardMaterial({color:'#f6f6f2',roughness:.35,metalness:0})),steel=keep(new T.MeshStandardMaterial({color:'#6d7480',roughness:.6}));
 const postG=keep(new T.CylinderGeometry(.06,.06,GOAL_H+.06,16)),barG=keep(new T.CylinderGeometry(.06,.06,GOAL_W+.24,16));
 for(const s of [-1,1]){const p=new T.Mesh(postG,white);p.position.set(s*(POST_X+.06),(GOAL_H+.06)/2,0);p.castShadow=true;goal.add(p);}
 const bar=new T.Mesh(barG,white);bar.rotation.z=Math.PI/2;bar.position.set(0,GOAL_H+.06,0);bar.castShadow=true;goal.add(bar);
 const stG=keep(new T.CylinderGeometry(.025,.025,1,8));
 const tube=(a:T.Vector3,b:T.Vector3)=>{const m=new T.Mesh(stG,steel);m.position.copy(a).add(b).multiplyScalar(.5);m.scale.y=a.distanceTo(b);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());goal.add(m);};
 for(const s of [-1,1]){tube(new T.Vector3(s*POST_X,GOAL_H,-.06),new T.Vector3(s*POST_X,2.2,-1.2));tube(new T.Vector3(s*POST_X,2.2,-1.2),new T.Vector3(s*POST_X,0,-2));}
 tube(new T.Vector3(-POST_X,0,-2),new T.Vector3(POST_X,0,-2));
 const netU={uHit:{value:new T.Vector3(0,1,0)},uAmp:{value:0},uCol:{value:new T.Color('#f3f3ee')},uFog:{value:new T.Color()},uFogNear:{value:38},uFogFar:{value:150}};
 const net=new T.Mesh(keep(netGeometry()),keep(new T.ShaderMaterial({vertexShader:NET_VERT,fragmentShader:NET_FRAG,uniforms:netU,transparent:true,depthWrite:false,side:T.DoubleSide,extensions:{derivatives:true} as never})));net.renderOrder=2;goal.add(net);

 // Teaching graphics on the goal plane (a canvas texture, redrawn only when the aim, power, era or shots change).
 const OV_W=11.2,OV_H=3.9,ovCanvas=document.createElement('canvas');ovCanvas.width=448;ovCanvas.height=Math.round(ovCanvas.width*OV_H/OV_W);// 40 texels a metre: chunky
 const ovTex=keep(new T.CanvasTexture(ovCanvas));ovTex.colorSpace=T.SRGBColorSpace;ovTex.magFilter=T.NearestFilter;ovTex.minFilter=T.NearestFilter;ovTex.generateMipmaps=false;
 const overlay=new T.Mesh(keep(new T.PlaneGeometry(OV_W,OV_H)),keep(new T.MeshBasicMaterial({map:ovTex,transparent:true,depthWrite:false,toneMapped:false,fog:false})));overlay.position.set(0,OV_H/2,.05);overlay.renderOrder=3;scene.add(overlay);

 // The 16-bit pass: copy the low-res frame, quantise it to 9-bit colour with an ordered dither, outline the figures.
 let fb=new T.FramebufferTexture(1,1);const postU={uTex:{value:fb as T.Texture},uRes:{value:new T.Vector2(1,1)}};
 const postMat=keep(new T.ShaderMaterial({vertexShader:POST_VERT,fragmentShader:POST_FRAG,uniforms:postU,depthTest:false,depthWrite:false,toneMapped:false}));
 const postScene=new T.Scene(),postCam=new T.OrthographicCamera(-1,1,1,-1,0,1),postQuad=new T.Mesh(keep(new T.PlaneGeometry(2,2)),postMat);postQuad.frustumCulled=false;postScene.add(postQuad);
 const bufSize=new T.Vector2();
 function sizePost(){renderer.getDrawingBufferSize(bufSize);const w=Math.max(1,bufSize.x|0),h=Math.max(1,bufSize.y|0);if(fb.image.width===w&&fb.image.height===h)return;
  fb.dispose();fb=new T.FramebufferTexture(w,h);postU.uTex.value=fb;postU.uRes.value.set(w,h);}

 // Environments: a modern stadium (today) and an 1891 ground.
 const glow=keep(glowTexture());
 const modern=buildModern(scene,keep,glow),old=buildOld(scene,keep);

 // Ball: the era's ball from the World Cup gallery's shading.
 const ballGeo=keep(new T.SphereGeometry(1,40,28));
 const LEATHER_GLSL=/* glsl */`Surf design(vec3 p){return leatherStrips(p,hex(0x8a5a2f),3.,true);}`;
 const ballMats={today:keep(createBallMaterial(TRIONDA_GLSL)),'1891':keep(createBallMaterial(LEATHER_GLSL))};
 const ball=new T.Mesh(ballGeo,ballMats.today);ball.scale.setScalar(VR);ball.castShadow=true;scene.add(ball);
 const ballQ=new T.Quaternion().setFromEuler(new T.Euler(.3,.8,.1));

 // Characters: the island's bean rig. Kicker = the visitor's own saved look; keeper = a match keeper (kit + gloves).
 let progress={completed:0,total:0};try{progress=getQuizProgress();}catch{/* first visit */}
 const custom=(()=>{try{return loadCustomization(progress.completed,progress.total);}catch{return {...DEFAULT_CUSTOMIZATION};}})();
 const kicker=createPlayer('you','home',true,true);kicker.setAppearance(custom);kicker.setBeanLook(beanLookFor(custom),playerOutfit(custom));kicker.setShirtNumber(MAIN_PLAYER_NUMBER);kicker.setExpression('focused');scene.add(kicker.root);
 const keeper=createPlayer('museum-penalty-keeper','away',true,true);keeper.setAppearance({...DEFAULT_CUSTOMIZATION,clothing:'coast',face:'deep'});keeper.setShirtNumber(1);scene.add(keeper.root);
 const todayKeeper=matchPlayerDress('museum-penalty-keeper','away',true,1);todayKeeper.look.headwear='none';
 const oldKeeper={look:{...todayKeeper.look,headwear:'cap' as const,headwearColor:'#2c2a2b',headwearColor2:'#3b3735',gloves:undefined,body:'#d9cdb4'},
  outfit:{kind:'kit' as const,shirt:'#ece3cf',shirt2:'#8a2d2b',shorts:'#22242c',socks:'#2c2b30',socks2:'#8a2d2b',boots:'#4a3220',number:null}};
 const kickerM:PlayerMotion={},keeperM:PlayerMotion={};

 // ── state ──
 let state:SceneState={era:'today',power:'firm',aimX:1.3,aimY:1.2,shots:[],mode:'intro'};
 let insets:Insets={top:0,right:0,bottom:0,left:0},cw=1,ch=1,disposed=false,raf=0,last=0,elapsed=0;
 let lookEra:Era|null=null,ovKey='';
 // Keeper position: walks between the line (today) and 6 yards out (1891).
 const keeperPos={x:0,z:KZ_TODAY,tz:KZ_TODAY};
 // Camera: intro (an establishing angle on the keeper) → aim (behind and above the kicker, looking at the goal).
 const POSE={intro:{pos:new T.Vector3(-6.4,1.45,7.2),look:new T.Vector3(.4,1.15,0)},aim:{pos:new T.Vector3(0,7.4,44),look:new T.Vector3(0,1.2,0)}};
 let camMix=0,camFrom=0,camTo=0,camT=1;// 0 = intro, 1 = aim
 let shake=0;
 type Run={plan:ShotPlan;t:number;era:Era;power:Power;contact:number;flight:number;impact:number;hit:number;end:number;
  path:Float32Array;pathT0:number;kind:DiveKind;outcome:SaveOutcome;dir:-1|1;height:number;diveStart:number;travel:number;kx:number;kz:number;hold:number;
  impacted:boolean;done:boolean;onImpact:()=>void;onDone:()=>void;cx:number;cz:number;face:number;caught:boolean;from:T.Vector3;to:T.Vector3;arc:number;curl:number};
 let run:Run|null=null;
 let settle=0;// seconds of idle rig updates still to draw (the rigs ease into a new pose)

 // ── framing ──
 const tmp=new T.Vector3(),tmp2=new T.Vector3(),inv=new T.Matrix4();
 const frustum={l:-1,r:1,t:1,b:-1};
 const AIM_PTS=[[-5.1,0,0],[5.1,0,0],[-5.1,3.1,0],[5.1,3.1,0],[0,0,11.35],[-1.9,0,14.7]].map(p=>new T.Vector3(...p));
 const INTRO_PTS=[[-POST_X-.5,0,0],[POST_X+.5,0,0],[-POST_X-.5,GOAL_H+.7,0],[POST_X+.5,GOAL_H+.7,0],[0,-.1,2.2]].map(p=>new T.Vector3(...p));
 const GOAL_C=new T.Vector3(0,GOAL_H/2,0);
 const aimCam=new T.PerspectiveCamera();const aimF={l:-1,r:1,t:1,b:-1};
 function fitFor(cam:T.Camera,pts:T.Vector3[],out:{l:number;r:number;t:number;b:number}){
  cam.updateMatrixWorld(true);inv.copy(cam.matrixWorld).invert();
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  for(const p of pts){tmp.copy(p).applyMatrix4(inv);const z=-tmp.z;if(z<=.05)continue;const x=tmp.x/z,y=tmp.y/z;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
  tmp.copy(GOAL_C).applyMatrix4(inv);const gx=tmp.x/-tmp.z;
  const sw=Math.max(40,cw-insets.left-insets.right),sh=Math.max(40,ch-insets.top-insets.bottom);
  const half=Math.max(maxX-gx,gx-minX),k=Math.max(2*half/sw,(maxY-minY)/sh);
  const scx=insets.left+sw/2,scy=insets.top+sh/2,vc=(maxY+minY)/2;
  out.l=gx-scx*k;out.r=out.l+cw*k;out.t=vc+scy*k;out.b=out.t-ch*k;return out;}
 const poseCam=(cam:T.Camera,mix:number)=>{const m=easeIO(mix);cam.position.lerpVectors(POSE.intro.pos,POSE.aim.pos,m);
  // Arc the move out a little to the side and up, so it reads as a crane, not a zoom.
  cam.position.x+=Math.sin(m*Math.PI)*-2.2;cam.position.y+=Math.sin(m*Math.PI)*1.2;
  tmp2.lerpVectors(POSE.intro.look,POSE.aim.look,m);cam.lookAt(tmp2);};
 /** Portrait stages are narrow: the camera comes closer and lower (a bigger kicker over the shoulder), and the goal spans the width. */
 function poseForStage(){const sw=cw-insets.left-insets.right,sh=ch-insets.top-insets.bottom,portrait=sw/Math.max(1,sh)<.9;
  POSE.aim.pos.set(0,portrait?5.0:7.4,portrait?24:44);POSE.aim.look.set(0,portrait?1.1:1.2,0);
  const m=portrait?4.45:5.1;for(const [i,x] of [[0,-m],[1,m],[2,-m],[3,m]] as const)AIM_PTS[i].x=x;
  const nx=portrait?-1.3:-1.9;if(!run&&nx!==S0.x){S0.x=nx;AIM_PTS[5].x=nx;settleNow();}}
 function applyCamera(){
  poseForStage();
  poseCam(camera,camMix);const a=fitFor(camera,INTRO_PTS,{l:0,r:0,t:0,b:0}),b=fitFor(camera,AIM_PTS,{l:0,r:0,t:0,b:0}),m=easeIO(camMix);
  frustum.l=lerp(a.l,b.l,m);frustum.r=lerp(a.r,b.r,m);frustum.t=lerp(a.t,b.t,m);frustum.b=lerp(a.b,b.b,m);
  const sx=shake>0?(Math.sin(elapsed*90)*shake):0,sy=shake>0?(Math.cos(elapsed*77)*shake):0,k=(frustum.r-frustum.l)/cw*2;
  const n=camera.near;camera.projectionMatrix.makePerspective((frustum.l+sx*k)*n,(frustum.r+sx*k)*n,(frustum.t+sy*k)*n,(frustum.b+sy*k)*n,n,camera.far);camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  poseCam(aimCam,1);fitFor(aimCam,AIM_PTS,aimF);}

 // ── era ──
 function applyEra(era:Era){if(lookEra===era)return;lookEra=era;const L=ERA_LOOK[era];
  skyU.uZ.value.set(L.zenith);skyU.uH.value.set(L.horizon);skyU.uM.value.set(L.mid);
  const fog=scene.fog as T.Fog;fog.color.set(L.fog);fog.near=L.fogNear;fog.far=L.fogFar;
  pitchU.uEra.value=era==='1891'?1:0;pitchU.uA.value.set(L.grassA);pitchU.uB.value.set(L.grassB);pitchU.uWear.value.set(L.wear);pitchU.uFog.value.set(L.fog);pitchU.uStripes.value=L.stripes;pitchU.uFogNear.value=L.fogNear;pitchU.uFogFar.value=L.fogFar;
  netU.uFog.value.set(L.fog);netU.uFogNear.value=L.fogNear;netU.uFogFar.value=L.fogFar;
  modern.visible=era==='today';old.visible=era==='1891';
  lighting.update(L.light,0,true);scene.background=new T.Color(L.zenith);
  const d=era==='1891'?oldKeeper:todayKeeper;keeper.setBeanLook(d.look,d.outfit);
  ball.material=ballMats[era];
  keeperPos.tz=era==='1891'?keeperDepth('1891'):KZ_TODAY;}

 // ── overlay drawing ──
 function drawOverlay(){
  const s=state,quiet=s.mode==='flying',show=s.mode!=='intro';
  const key=[s.era,s.power,s.aimX.toFixed(3),s.aimY.toFixed(3),s.shots.length,s.mode,run?.impacted?1:0].join('|');if(key===ovKey)return false;ovKey=key;
  const g=ovCanvas.getContext('2d')!,W=ovCanvas.width,H=ovCanvas.height,k=W/OV_W;
  const X=(x:number)=>(x+OV_W/2)*k,Y=(y:number)=>(OV_H-y)*k;
  g.clearRect(0,0,W,H);if(!show){ovTex.needsUpdate=true;return true;}
  g.save();g.lineCap='round';g.lineJoin='round';
  // The goal mouth's zones: the one you're aiming at lights up.
  const zone=zoneOf(s.aimX,s.aimY);
  const zones:[string,number,number,number,number][]=[['top-corner',-POST_X,-2.3,1.55,GOAL_H],['top-corner',2.3,POST_X,1.55,GOAL_H],['low-corner',-POST_X,-2.3,0,.95],['low-corner',2.3,POST_X,0,.95],['middle',-1.1,1.1,0,GOAL_H]];
  if(!quiet)for(const [z,x0,x1,y0,y1] of zones){const on=z===zone;g.fillStyle=on?'rgba(255,255,255,.13)':'rgba(255,255,255,.035)';g.fillRect(X(x0),Y(y1),(x1-x0)*k,(y1-y0)*k);
   g.setLineDash([2,3]);g.strokeStyle=on?'rgba(248,248,248,.7)':'rgba(248,248,248,.25)';g.lineWidth=1;g.strokeRect(X(x0),Y(y1),(x1-x0)*k,(y1-y0)*k);g.setLineDash([]);}
  // The keeper's reach (the model's oval; in 1891 its "shadow" from 6 yards out, as you see it from the ball).
  if(!quiet){const t=keeperTime(s.era,s.power),{a,b}=reach(t),c=toGoal(s.era,0,1),sc=s.era==='1891'?MARK/(MARK-keeperDepth('1891')):1;
   const rx=a*sc*k,ry=b*sc*k,cx=X(0),cy=Y(c.y);
   g.save();g.beginPath();g.rect(X(-POST_X-.4),Y(OV_H),(2*POST_X+.8)*k,(OV_H)*k);g.clip();
   // A flat fill and a 2-texel rim (pixel art has no soft gradients; the dither pass does the shading).
   g.fillStyle='rgba(88,216,248,.2)';g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);g.fill();g.strokeStyle='#58d8f8';g.lineWidth=2;g.stroke();g.restore();
   }
  // Your shot's spray: the model's own wobble samples for this aim and power (yellow lands on target, coral misses).
  if(!quiet){const wob=POWERS[s.power].wobble;
   for(const w of WOBBLE){const x=s.aimX+w[0]*wob,y=Math.max(BALL_R,s.aimY+w[1]*wob*.8),out=Math.abs(x)>POST_X||y>GOAL_H;g.fillStyle=out?'#f87858':'#f8d838';g.fillRect(Math.round(X(x)),Math.round(Y(y)),1,1);}}
  // Your earlier shots this round.
  for(const sh of s.shots.slice(-5)){const c=sh.result==='goal'?'#7ee081':sh.result==='saved'?'#5fd4e8':'#ff8a6b';const x=Math.round(X(sh.x)),y=Math.round(Y(sh.y));g.fillStyle='#000';g.fillRect(x-3,y-3,7,7);g.fillStyle=c;g.fillRect(x-2,y-2,5,5);}
  // The reticle.
  // The reticle: a pixel crosshair (four 2×4 ticks round a hollow square, outlined in black so it reads on the net).
  if(s.mode!=='result'){const x=Math.round(X(s.aimX)),y=Math.round(Y(s.aimY)),c=quiet?'#b89828':'#f8d838';
   const box=(bx:number,by:number,w:number,h:number)=>{g.fillStyle='#000';g.fillRect(bx-1,by-1,w+2,h+2);g.fillStyle=c;g.fillRect(bx,by,w,h);};
   box(x-6,y-1,4,2);box(x+3,y-1,4,2);box(x-1,y-6,2,4);box(x-1,y+3,2,4);box(x-1,y-1,2,2);}
  g.restore();ovTex.needsUpdate=true;return true;}

 // ── poses ──
 const ballPos=new T.Vector3(0,VR,MARK);
 const contactRoot=(face:number)=>({x:-(STRIKE_X*Math.cos(face)+STRIKE_Z*Math.sin(face)),z:MARK-(-STRIKE_X*Math.sin(face)+STRIKE_Z*Math.cos(face))});
 const clear=(m:PlayerMotion)=>{for(const key of Object.keys(m))delete (m as Record<string,unknown>)[key];};
 function idleKicker(dt:number){clear(kickerM);kickerM.facing=Math.atan2(ballPos.x-S0.x,ballPos.z-S0.z);kickerM.lookX=state.aimX;kickerM.lookY=state.aimY;kickerM.lookZ=0;
  kicker.update(S0.x,S0.z,dt,elapsed,opts.reducedMotion,kickerM);}
 function idleKeeper(dt:number){clear(keeperM);const moving=Math.abs(keeperPos.z-keeperPos.tz)>.02;
  keeperM.keeper=1;keeperM.facing=0;keeperM.lookX=ballPos.x;keeperM.lookY=ballPos.y;keeperM.lookZ=ballPos.z;
  if(moving){keeperM.runIntensity=.45;if(keeperPos.tz<keeperPos.z)keeperM.backpedal=1;}else{keeperM.stance='ready';keeperM.ready=1;}
  keeper.update(keeperPos.x,keeperPos.z,dt,elapsed,opts.reducedMotion,keeperM);}
 function stepKeeperWalk(dt:number){const d=keeperPos.tz-keeperPos.z;if(Math.abs(d)<.005){keeperPos.z=keeperPos.tz;return false;}const v=Math.sign(d)*Math.min(Math.abs(d),dt*(Math.abs(d)>1?4.2:2.4));keeperPos.z+=v;return true;}
 function placeBall(){ball.position.copy(ballPos);ball.quaternion.copy(ballQ);}

 // ── a shot ──
 function planRun(plan:ShotPlan,onImpact:()=>void,onDone:()=>void):Run{
  const era=state.era,power=state.power,flight=flightTime(power),kt=keeperTime(era,power),kz=era==='1891'?keeperDepth('1891'):KZ_TODAY;
  const k=atKeeper(era,plan.x,plan.y),saved=plan.result==='saved';
  // Which save the rig performs: the ball's height and distance choose the type (as the live match's choreo does).
  const toward=plan.dive==='stay'?(k.x>=0?1:-1):plan.dive==='left'?-1:1,ballSide=k.x>=0?1:-1,right=toward===ballSide;
  let kind:DiveKind,outcome:SaveOutcome,height:number,travel:number;
  const ax=Math.abs(k.x),h=k.y;
  if(plan.dive==='stay'){kind='stand';outcome=saved?'catch':'parry';height=clamp01((h-.2)/2.1);travel=0;}
  else{
   kind=h>=1.75?'tip':h<.55?(ax<1.7?'collapse':'side'):(ax<2.1&&h>=.75&&h<=1.6?'spring':'side');
   outcome=saved?(kind==='tip'?'tip':h<.55&&ax>2?'parry':'catch'):'parry';
   height=clamp01((h-.15)/2.05);
   if(!right){height=.35;kind='side';}
   const need=right?ax-HAND_REACH[kind]:1.3;travel=clamp(saved?need:right?need-.55:need,.15,2.6);}
  const D=DIVE_KINDS[kind],hitAt=CONTACT+flight*(MARK-kz)/MARK;
  const diveStart=CONTACT+kt-D.contact*DIVE_S;
  const face=Math.atan2(plan.x,-MARK);const c=contactRoot(face);
  // Where the flight ends: in the keeper's hands, at the goal line (frame / net), or past the goal.
  const stopF=saved?(MARK-kz-.25)/MARK:1;
  const impact=CONTACT+flight*stopF;
  const from=new T.Vector3(0,VR,MARK),to=new T.Vector3(plan.x,Math.max(VR,plan.y),0);
  const arc=POWERS[power].kmh<70?.32:POWERS[power].kmh<90?.2:.12,curl=(plan.x>=0?1:-1)*.12;
  const r:Run={plan,t:0,era,power,contact:CONTACT,flight,impact,hit:hitAt,end:0,path:new Float32Array(0),pathT0:impact,kind,outcome,dir:toward as -1|1,height,diveStart,travel,kx:keeperPos.x,kz,
   hold:saved?0:.65,impacted:false,done:false,onImpact,onDone,cx:c.x,cz:c.z,face,caught:false,from,to,arc,curl};
  r.path=simulateAfter(r);
  r.end=Math.max(diveStart+DIVE_S+r.hold,impact+(plan.result==='goal'?CELEBRATION_SECONDS*.7:1.5))+.1;
  return r;}
 /** The ball's flight, a straight line at the chosen speed (the model) with a little lift and curl for life. */
 function flightAt(r:Run,u:number,out:T.Vector3){out.lerpVectors(r.from,r.to,u);out.y+=4*u*(1-u)*r.arc;out.x+=Math.sin(Math.PI*u)*r.curl;return out;}
 /** After the impact: precomputed at 120 Hz (net, frame rebound, parry, over/wide), so seeking and reduced motion agree. */
 function simulateAfter(r:Run){
  const res=r.plan.result,p=new T.Vector3(),v=new T.Vector3(),dt=1/120,N=Math.round(2.6/dt),out=new Float32Array(N*3);
  const uEnd=(r.impact-r.contact)/r.flight;flightAt(r,uEnd,p);
  const speed=POWERS[r.power].kmh/3.6;v.copy(r.to).sub(r.from).normalize().multiplyScalar(speed);
  if(res==='saved'){if(r.outcome==='parry')v.set(r.dir*3.2,2.4,4.5);else if(r.outcome==='tip')v.set(r.dir*.6,4.2,-2.2);else v.set(0,0,0);}
  else if(res==='post'){v.set(-Math.sign(p.x)*3,1.2,speed*.45);}
  else if(res==='bar'){v.set(0,2.6,speed*.4);}
  let inNet=res==='goal',stopped=false;
  for(let i=0;i<N;i++){
   if(!(res==='saved'&&r.outcome==='catch')){
    if(inNet&&p.z<-1.45&&!stopped){v.multiplyScalar(.12);v.z=Math.max(v.z,-.4);stopped=true;}
    v.y-=9.8*dt;p.addScaledVector(v,dt);
    if(res==='wide'||res==='over'){if(p.z<-8.4){p.z=-8.4;v.z=Math.abs(v.z)*.15;v.x*=.3;}}
    if(inNet){p.z=Math.max(p.z,-1.9);p.x=clamp(p.x,-POST_X+VR,POST_X-VR);if(p.y>2.3-VR)p.y=2.3-VR;}
    if(p.y<VR){p.y=VR;if(v.y<0)v.y=-v.y*.42;v.x*=.86;v.z*=.86;if(Math.abs(v.y)<.4)v.y=0;}}
   out[i*3]=p.x;out[i*3+1]=p.y;out[i*3+2]=p.z;}
  return out;}
 const handL=new T.Vector3(),handR=new T.Vector3();
 function stepRun(r:Run,dt:number){
  const prev=r.t;r.t+=dt;
  // Hit-stop: on a goal the world holds for 80 ms when the ball meets the net.
  let t=r.t;if(r.plan.result==='goal'&&!opts.reducedMotion){const h=r.impact;if(t>h)t=Math.max(h,t-HOLD_MS/1000);}
  const wt=dt>0&&t===r.impact&&prev>r.impact?0:dt;
  // Kicker: run-up (gait comes from the travel), plant, strike; then a celebration or a sigh.
  clear(kickerM);
  const runU=clamp01(t/RUN),ease=runU<1?runU*runU*(3-2*runU)*.25+runU*.75:1;
  const kx=lerp(S0.x,r.cx,ease),kz=lerp(S0.z,r.cz,ease);
  const travelFace=Math.atan2(r.cx-S0.x,r.cz-S0.z);kickerM.facing=lerp(travelFace,r.face<0?r.face+2*Math.PI:r.face,smooth((t-.35)/.4));
  kickerM.runIntensity=.55*(1-smooth((t-.55)/.3));
  if(t>=KICK_START){const kp=clamp01((t-KICK_START)/KICK_DUR);if(kp<1){kickerM.kick=kp;kickerM.actionKind='shot';kickerM.powerKick=true;kickerM.shotPower=r.power==='soft'?.45:r.power==='firm'?.72:1;kickerM.kickSide=KICK_SIDE;kickerM.strikeX=STRIKE_X;kickerM.strikeZ=STRIKE_Z;}}
  let fx=kx,fz=kz;if(t>KICK_START+KICK_DUR){const f=smooth((t-KICK_START-KICK_DUR)/.5);fx=r.cx+Math.sin(r.face)*.35*f;fz=r.cz+Math.cos(r.face)*.35*f;}
  const after=t-r.impact-.25;
  if(after>0){if(r.plan.result==='goal'){const p=clamp01(after/CELEBRATION_SECONDS);kickerM.jump=opts.reducedMotion?undefined:celebrationJump(p);}
   else{kickerM.reaction='dejected';kickerM.reactionProgress=clamp01(after/2.4);}}
  kickerM.lookX=ball.position.x;kickerM.lookY=ball.position.y;kickerM.lookZ=ball.position.z;
  kicker.update(fx,fz,wt,elapsed,opts.reducedMotion,kickerM);
  if(after>0&&r.plan.result==='goal')applyCelebrationArms(kicker.root,clamp01(after/CELEBRATION_SECONDS));
  // Keeper: ready, a set as the kicker plants, then the rig's dive (the host moves the root, as in the live match).
  clear(keeperM);keeperM.keeper=1;keeperM.facing=0;
  const D=DIVE_KINDS[r.kind];let p=(t-r.diveStart)/DIVE_S;
  // A beaten keeper stays down a beat before he gets up.
  if(r.hold>0&&p>D.land+.06){const held=(t-r.diveStart-(D.land+.06)*DIVE_S);p=held<r.hold?D.land+.06:(t-r.hold-r.diveStart)/DIVE_S;}
  let x=r.kx,z=r.kz,lift=0;
  if(p<0){keeperM.stance='ready';keeperM.ready=1;const set=smooth((t-(r.diveStart-.32))/.22);
   // Weight shifts on the line while the kicker runs up, then the keeper's real-life timing: a small split-step hop that lands
   // just as he pushes off, loading his legs, with his weight already leaning a touch toward the side he has guessed.
   x=r.kx+Math.sin(t*7.5)*.07*(1-set)+r.dir*.09*set*(r.kind==='stand'?0:1);
   if(!opts.reducedMotion){const u=clamp01((t-(r.diveStart-.24))/.2);lift=u>0&&u<1?Math.sin(Math.PI*u)*.075:0;}}
  else if(p<1){keeperM.dive={progress:p,dir:r.dir,height:r.height,kind:r.kind,outcome:r.outcome};
   const m=1-Math.pow(1-clamp01((p-D.push)/(D.contact+.05-D.push)),2.2);x=r.kx+r.dir*r.travel*m;z=r.kz+.25*m;
   // High balls: the push-off carries the whole body up (the rig arcs the hips; the host owns the root's height).
   const u=clamp01((p-D.lift)/(D.land-D.lift));lift=p>D.lift&&p<D.land?4*u*(1-u)*Math.max(0,r.height-.4)*1.25:0;}
  else{x=r.kx+r.dir*r.travel;z=r.kz+.25;keeperM.stance='ready';}
  if(r.kind==='stand'||r.kind==='smother'){x=r.kx;z=r.kz;}
  keeperM.lookX=ball.position.x;keeperM.lookY=ball.position.y;keeperM.lookZ=ball.position.z;
  keeper.update(x,z,wt,elapsed,opts.reducedMotion,keeperM);keeper.root.position.y=lift;
  // Ball.
  if(t<r.contact){ball.position.copy(ballPos);}
  else if(t<r.impact){const u=(t-r.contact)/r.flight;flightAt(r,u,ball.position);spin(dt*(POWERS[r.power].kmh/3.6));}
  else{
   if(r.plan.result==='saved'&&r.outcome==='catch'){keeper.root.updateMatrixWorld(true);keeper.handPositions(handL,handR);handL.add(handR).multiplyScalar(.5);
    const g=smooth((t-r.impact)/.12);const q=r.path;tmp.set(q[0],q[1],q[2]);ball.position.lerpVectors(tmp,handL,g);ball.position.y=Math.max(VR,ball.position.y);}
   else{const i=Math.min(r.path.length/3-1,Math.floor((t-r.impact)*120));const px=ball.position.x,pz=ball.position.z;ball.position.set(r.path[i*3],r.path[i*3+1],r.path[i*3+2]);spin(Math.hypot(ball.position.x-px,ball.position.z-pz)/VR*.2);}
  }
  // Net bulge: a quick push and a few decaying ripples.
  if(r.plan.result==='goal'&&t>=r.impact){const a=t-r.impact;netU.uHit.value.set(r.to.x,r.to.y,0);netU.uAmp.value=.42*Math.exp(-a*3.2)*Math.cos(a*11)*smooth(a/.06);}
  else netU.uAmp.value=0;
  shake=r.plan.result==='goal'&&t>=r.impact&&t<r.impact+.16&&!opts.reducedMotion?1.6*(1-(t-r.impact)/.16):0;
  if(!r.impacted&&t>=r.impact){r.impacted=true;r.onImpact();}
  if(!r.done&&r.t>=r.end){r.done=true;netU.uAmp.value=0;shake=0;r.onDone();}
 }
 const spinAxis=new T.Vector3(1,0,0),spinQ=new T.Quaternion();
 function spin(a:number){spinQ.setFromAxisAngle(spinAxis,-a*3);ball.quaternion.premultiply(spinQ);}

 // ── loop (on demand) ──
 const busy=()=>!!run&&!run.done||camT<1||settle>0||Math.abs(keeperPos.z-keeperPos.tz)>.005||shake>0;
 function frame(now:number){
  raf=0;if(disposed||document.hidden)return;
  // 30 frames a second while something moves: the sprite cadence of a console game, and half the GPU work of 60.
  if(last&&now-last<31){raf=requestAnimationFrame(frame);return;}
  const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;elapsed+=dt;
  advance(dt);draw();
  if(busy())raf=requestAnimationFrame(frame);else last=0;}
 function advance(dt:number){
  if(camT<1){camT=Math.min(1,camT+dt/(1.5));camMix=lerp(camFrom,camTo,camT);}
  if(run&&!run.done)stepRun(run,dt);
  else if(run)settle=0;
  else if(!run){const walking=stepKeeperWalk(dt);if(walking||settle>0){idleKicker(dt);idleKeeper(dt);settle=Math.max(0,settle-dt);}if(!walking&&settle<=0)settle=0;placeBall();}
 }
 function draw(){applyCamera();drawOverlay();renderer.render(scene,camera);sizePost();renderer.copyFramebufferToTexture(fb);renderer.render(postScene,postCam);}
 const wake=()=>{if(!raf&&!disposed&&!document.hidden){raf=requestAnimationFrame(frame);}};
 /** One frame now-ish (aiming, layout): a single rAF, then sleep. */
 const request=wake;
 /** Ease the rigs into their current idle pose without drawing each step (instant, no loop). */
 function settleNow(){for(let i=0;i<30;i++){elapsed+=1/30;idleKicker(1/30);idleKeeper(1/30);}}
 const onVis=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else{wake();}};
 document.addEventListener('visibilitychange',onVis);

 function resize(){const w=canvas.clientWidth||1,h=canvas.clientHeight||1;if(w===cw&&h===ch)return;cw=w;ch=h;px=pixelScale(w,h);renderer.setPixelRatio(Math.min(1/px,opts.coarse?1.5:2));renderer.setSize(w,h,false);sizePost();camera.aspect=w/h;request();opts.onLayout?.();}
 const ro=new ResizeObserver(resize);ro.observe(canvas);
 resize();applyEra('today');placeBall();settleNow();keeperPos.z=keeperPos.tz;

 // Dev hook for the browser checks (frame strips, framing, sleep): not in production builds.
 if(process.env.NODE_ENV!=='production')(window as unknown as {__pk?:unknown}).__pk={
  get sleeping(){return raf===0;},
  get pixel(){renderer.getDrawingBufferSize(bufSize);return {px,buffer:[bufSize.x,bufSize.y]};},
  get debug(){return {run:run?{t:+run.t.toFixed(2),end:+run.end.toFixed(2),done:run.done}:null,camT,settle,kz:keeperPos.z,ktz:keeperPos.tz,shake};},
  goalCentre(){applyCamera();return api.project(0,GOAL_H/2,0);},
  stage(){return {left:insets.left,top:insets.top,width:cw-insets.left-insets.right,height:ch-insets.top-insets.bottom,cw,ch};},
  /** Bean check: draw one rig from CharacterPreview's own camera angle (rig-local offset 2.2, 1.85, 4.7 → look at hip height). */
  portrait(which:'kicker'|'keeper'){const rig=which==='kicker'?kicker:keeper,cam=new T.PerspectiveCamera(32,cw/ch,.1,200),yaw=rig.root.rotation.y,o=rig.root.position;
   const k=1.15;cam.position.set(o.x+k*(2.2*Math.cos(yaw)+4.7*Math.sin(yaw)),1.85,o.z+k*(-2.2*Math.sin(yaw)+4.7*Math.cos(yaw)));cam.lookAt(o.x,.95,o.z);ovKey='';overlay.visible=false;renderer.render(scene,cam);overlay.visible=true;},
  /** Plan a shot and draw it at t seconds (no loop): frame strips of the dives. */
  seek(plan:ShotPlan,t:number){cancelAnimationFrame(raf);raf=0;api.reset();run=planRun(plan,()=>{},()=>{});const step=1/60;for(let s=0;s<t;s+=step){elapsed+=step;stepRun(run,Math.min(step,t-s));}draw();
   keeper.root.updateMatrixWorld(true);keeper.handPositions(handL,handR);return {ball:[ball.position.x,ball.position.y,ball.position.z].map(v=>+v.toFixed(2)),hands:[handL.x,handL.y,handL.z,handR.x,handR.y,handR.z].map(v=>+v.toFixed(2)),root:[keeper.root.position.x,keeper.root.position.z].map(v=>+v.toFixed(2)),kind:run.kind,diveStart:+run.diveStart.toFixed(2),impact:+run.impact.toFixed(2),end:+run.end.toFixed(2)};},
 };

 const api:PenaltyScene={
  set(next){const prev=state;state=next;
   if(next.era!==prev.era){applyEra(next.era);if(opts.reducedMotion||next.mode==='intro'){keeperPos.z=keeperPos.tz;settleNow();}}
   if(prev.mode==='intro'&&next.mode!=='intro'){if(opts.reducedMotion){camMix=1;camT=1;}else{camFrom=camMix;camTo=1;camT=0;}}
   if(next.mode==='intro'&&prev.mode!=='intro'){camMix=0;camT=1;}
   wake();},
  setInsets(i){if(i.top===insets.top&&i.right===insets.right&&i.bottom===insets.bottom&&i.left===insets.left)return;insets=i;request();opts.onLayout?.();},
  shoot(plan,onImpact,onDone){
   if(run&&!run.done)return;api.reset();keeperPos.z=keeperPos.tz;
   settle=0;const r=planRun(plan,onImpact,onDone);run=r;
   if(opts.reducedMotion||document.hidden){// jump to the end: the same timeline, stepped without drawing
    for(let s=0;s<r.end+.05;s+=1/30){elapsed+=1/30;stepRun(r,1/30);}draw();return;}
   last=0;wake();},
  reset(){if(run&&!run.done)return;run=null;netU.uAmp.value=0;shake=0;placeBall();
   // Back to the idle pose: a short settle drawn on screen (the rigs land softly), or instantly with reduced motion.
   if(opts.reducedMotion){settleNow();}else{settleNow();settle=.25;}ovKey='';wake();},
  unproject(px,py){const f=aimF;const tx=f.l+(px/cw)*(f.r-f.l),ty=f.t-(py/ch)*(f.t-f.b);
   tmp.set(tx,ty,-1).transformDirection(aimCam.matrixWorld);const o=aimCam.position,s=-o.z/tmp.z;return {x:o.x+tmp.x*s,y:o.y+tmp.y*s};},
  project(x,y,z){inv.copy(aimCam.matrixWorld).invert();tmp.set(x,y,z).applyMatrix4(inv);const f=aimF,tx=tmp.x/-tmp.z,ty=tmp.y/-tmp.z;return {x:(tx-f.l)/(f.r-f.l)*cw,y:(f.t-ty)/(f.t-f.b)*ch};},
  dispose(){disposed=true;cancelAnimationFrame(raf);raf=0;ro.disconnect();document.removeEventListener('visibilitychange',onVis);
   if(process.env.NODE_ENV!=='production')delete (window as unknown as {__pk?:unknown}).__pk;
   kicker.dispose();keeper.dispose();disposables.forEach(d=>d.dispose());fb.dispose();sun.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();},
 };
 return api;
}

/** The net's panels (roof, back, sides) as one mesh with metre coordinates for the pattern and a bulge weight. */
function netGeometry(){
 const pos:number[]=[],mesh:number[]=[],wt:number[]=[],idx:number[]=[];
 const panel=(nx:number,ny:number,at:(u:number,v:number)=>[number,number,number],uv:(u:number,v:number)=>[number,number],w:(u:number,v:number)=>number)=>{
  const base=pos.length/3;for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const u=i/nx,v=j/ny;pos.push(...at(u,v));mesh.push(...uv(u,v));wt.push(w(u,v));}
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=base+j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;idx.push(a,c,b,b,c,d);}};
 const X=POST_X,H=GOAL_H,edge=(u:number,v:number)=>Math.sin(Math.PI*u)*Math.sin(Math.PI*Math.min(1,v*1.2+.1));
 // roof: crossbar → back top
 panel(48,6,(u,v)=>[lerp(-X,X,u),lerp(H,2.2,v),lerp(-.06,-1.2,v)],(u,v)=>[u*2*X,v*1.22],(u,v)=>Math.sin(Math.PI*u)*v*.6);
 // back: top → ground
 panel(48,22,(u,v)=>[lerp(-X,X,u),lerp(2.2,0,v),lerp(-1.2,-2,v)],(u,v)=>[u*2*X,1.22+v*2.34],(u,v)=>edge(u,1-v)*.95+.05);
 // sides
 for(const s of [-1,1])panel(10,12,(u,v)=>{const zTop=lerp(-.06,-1.2,u),zBot=lerp(-.06,-2,u),yTop=lerp(H,2.2,u);return [s*X,lerp(0,yTop,v),lerp(zBot,zTop,v)];},(u,v)=>[u*2,v*2.4],()=>.15);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('aM',new T.Float32BufferAttribute(mesh,2));g.setAttribute('aW',new T.Float32BufferAttribute(wt,1));g.setIndex(idx);g.computeBoundingSphere();return g;
}

type Keep=<X extends {dispose():void}>(x:X)=>X;
/** Today's stadium: LED boards, a two-tier bowl of soft crowd, a lit fascia and floodlights along the roof. */
function buildModern(scene:T.Scene,keep:Keep,glow:T.Texture){
 const g=new T.Group();scene.add(g);
 const ad=keep(adTexture());const adMat=keep(new T.MeshBasicMaterial({map:ad,toneMapped:false}));
 const board=new T.Mesh(keep(new T.PlaneGeometry(90,.95)),adMat);board.position.set(0,.48,-8.5);g.add(board);
 for(const s of [-1,1]){const b=new T.Mesh(keep(new T.PlaneGeometry(40,.95)),adMat);b.position.set(s*32,.48,14);b.rotation.y=-s*Math.PI/2;g.add(b);}
 const bowl=(pts:[number,number][],mat:T.Material)=>{const m=new T.Mesh(keep(new T.LatheGeometry(pts.map(([r,y])=>new T.Vector2(r,y)),72,Math.PI*.5,Math.PI)),mat);m.scale.set(1.25,1,1);m.position.set(0,0,10);g.add(m);return m;};
 // The lathe's start angle .5π sweeps the far half of the bowl (behind the goal and both sides).
 const wall=keep(new T.MeshBasicMaterial({color:'#1a2030',side:T.DoubleSide}));
 bowl([[27,0],[27,2.2],[28.5,2.2]],wall);
 const low=keep(crowdTexture(7,1)),high=keep(crowdTexture(19,.82));
 bowl([[28.5,2.2],[44,13]],keep(new T.MeshBasicMaterial({map:low,side:T.DoubleSide})));
 bowl([[44,13],[44.2,15.2]],keep(new T.MeshBasicMaterial({map:keep(fasciaTexture()),side:T.DoubleSide,toneMapped:false})));
 bowl([[44.2,15.2],[54,24.5]],keep(new T.MeshBasicMaterial({map:high,side:T.DoubleSide})));
 bowl([[54,24.5],[58,27.5],[60,27.6]],keep(new T.MeshBasicMaterial({color:'#121725',side:T.DoubleSide})));
 // Floodlights: little lamp banks on the roof rim with soft glows (sprites, additive).
 const lampMat=keep(new T.SpriteMaterial({map:glow,color:'#fff4dc',blending:T.AdditiveBlending,depthWrite:false,transparent:true,toneMapped:false,fog:false}));
 for(let i=0;i<9;i++){const a=Math.PI*(.62+i*.095),r=56.5,x=Math.sin(a)*r*1.25,z=10+Math.cos(a)*r;
  const s=new T.Sprite(lampMat);s.position.set(x,27.4,z);s.scale.set(9,9,1);g.add(s);
  const core=new T.Sprite(lampMat);core.position.set(x,27.4,z);core.scale.set(2.6,2.6,1);g.add(core);}
 return g;}
/** An 1891 ground: a white rail, a standing crowd on a grass bank in coats, flat caps and bowlers, a wooden pavilion, trees and mill chimneys. */
function buildOld(scene:T.Scene,keep:Keep){
 const g=new T.Group();g.visible=false;scene.add(g);
 const paint=keep(new T.MeshStandardMaterial({color:'#efeadc',roughness:.8}));
 const postG=keep(new T.BoxGeometry(.08,1.05,.08)),posts=new T.InstancedMesh(postG,paint,60),m=new T.Matrix4();
 for(let i=0;i<60;i++){m.makeTranslation(-30+i*1.02*1,.52,-4.6);posts.setMatrixAt(i,m);}g.add(posts);
 for(const y of [.55,.98]){const rail=new T.Mesh(keep(new T.BoxGeometry(62,.07,.06)),paint);rail.position.set(0,y,-4.6);g.add(rail);}
 const bankMat=keep(new T.MeshBasicMaterial({map:keep(victorianCrowd())}));
 const bank=new T.Mesh(keep(new T.PlaneGeometry(90,7.4)),bankMat);bank.position.set(0,1.75,-8.6);bank.rotation.x=-.5;g.add(bank);
 for(const s of [-1,1]){const side=new T.Mesh(keep(new T.PlaneGeometry(40,7.4)),bankMat);side.position.set(s*30,1.75,10);side.rotation.set(0,-s*Math.PI/2,0);side.rotateX(-.5);g.add(side);}
 // Pavilion
 const wood=keep(new T.MeshStandardMaterial({color:'#6d4b33',roughness:.9})),trim=keep(new T.MeshStandardMaterial({color:'#efe6d2',roughness:.8})),roof=keep(new T.MeshStandardMaterial({color:'#7c3a2c',roughness:.85}));
 const pav=new T.Group();const body=new T.Mesh(keep(new T.BoxGeometry(14,4.2,5)),wood);body.position.y=2.1;pav.add(body);
 const band=new T.Mesh(keep(new T.BoxGeometry(14.2,.35,5.2)),trim);band.position.y=4.1;pav.add(band);
 const rf=new T.Mesh(keep(new T.CylinderGeometry(0,4.6,2.6,4,1)),roof);rf.rotation.y=Math.PI/4;rf.scale.set(2.2,1,1.05);rf.position.y=5.55;pav.add(rf);
 const clock=new T.Mesh(keep(new T.CylinderGeometry(.55,.55,.12,24)),trim);clock.rotation.x=Math.PI/2;clock.position.set(0,5.2,2.55);pav.add(clock);
 pav.position.set(-13,1.6,-16);g.add(pav);
 const shed=pav.clone();shed.scale.set(.6,.75,.8);shed.position.set(15,1.4,-15);g.add(shed);
 // Trees and chimneys in the haze
 const leaf=keep(new T.MeshStandardMaterial({color:'#3e5a3a',roughness:1,flatShading:true})),treeG=keep(new T.IcosahedronGeometry(1,1));
 const r=rand(7);for(let i=0;i<26;i++){const t=new T.Mesh(treeG,leaf);const s=3+r()*2.6;t.scale.set(s*1.1,s*1.3,s);t.position.set(-70+i*5.6+r()*2,4+r()*2.2,-27-r()*8);g.add(t);}
 const brick=keep(new T.MeshStandardMaterial({color:'#8a6a5a',roughness:1}));
 for(const [x,h] of [[-34,26],[22,32],[40,22]]){const c=new T.Mesh(keep(new T.CylinderGeometry(.9,1.4,h,10)),brick);c.position.set(x,h/2,-70);g.add(c);}
 return g;}
