/**
 * Pop-up target game drawing (working id `popup`, Nov 21 2026, docs/arcade-aaa/popup-direction.md): ONE three.js scene in the arcade's
 * comic print style (lib/arcade/comic: banded light, violet halftone shade, ink hulls baked into the geometry).
 * Each arena (arenas.ts) is drawn from the SAME boxes the rules bounce balls off: every box and deco piece becomes a little model
 * (shop, bus, boat, hut, tier...) baked into ONE vertex-colour mesh when the arena loads; a painted ground sheet and a painted backdrop
 * (the house comic coast with the arena's own skyline) sit behind it. Targets are instanced (one draw per model), and so are the balls,
 * the rack, the trail, blob shadows, bits and stars. The camera is the arena's own (core.ts viewFor: the rules aim with the same
 * numbers), with a fly-in, a small nudge toward each hit and a shake on big ones.
 * The flick/ball-flight/camera approach and a few helpers (canvas textures, the bits and stars pools, the ball texture) are copied
 * from Flick It's view.ts (branch game-flickit, not on main); nothing is imported from it.
 * Heat (AGENTS.md): low-power context, pixel ratio 1.5 on phones (2 on desktop), ONE sun + a hemisphere, NO shadow map (blob
 * shadows), no post-processing, fixed pools, nothing allocated per frame; the shell draws only while playing (30 fps on phones).
 */
import * as T from 'three';
import {createComicUniforms,comicDotCell,aimComicSun,comicMaterial,COMIC_INK,COMIC_PAPER} from '../comic/shading';
import {inkedPart,partAt,bakeParts,comicStarGeometry} from '../comic/ink';
import {paintComicCoast,type ComicCoastPalette} from '../comic/backdrop';
import {ARENAS,type PopArena,type PopBox} from './arenas';
import {K,KIND,PU,viewFor,type Popup,type PopEvent,type PopTarget} from './core';

const TONES=['#f0452e','#19b5a5','#ffc83a','#2f8fd8','#ff65c8','#fff3d6'];
type Parts=T.BufferGeometry[];
const box=(w:number,h:number,d:number)=>new T.BoxGeometry(w,h,d),cyl=(r0:number,r1:number,h:number,n=10)=>new T.CylinderGeometry(r0,r1,h,n),sph=(r:number,n=10)=>new T.SphereGeometry(r,n,Math.max(5,n-3)),cone=(r:number,h:number,n=8)=>new T.ConeGeometry(r,h,n);
function P(o:Parts,g:T.BufferGeometry,c:string,x:number,y:number,z:number,ry=0,rz=0,ink=.035,round=false){inkedPart(o,g,c,partAt(x,y,z,ry,rz),ink,round);}
const seeded=(s:number)=>{let r=s;return()=>{r=(r*16807)%2147483647;return r/2147483647;};};
function canvasTex(w:number,h:number,paint:(g:CanvasRenderingContext2D)=>void){const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d')!);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}

/* ---- the look of each arena's sky ---- */
const DAY:Partial<ComicCoastPalette>={top:'#58b6e8',mid:'#8fd4ee',haze:'#d6f1f5',sunCore:'#fffbe0',sunRing:'#fff1b0',sunRing2:'#ffe28a',cloudLit:'#ffffff',cloudShade:'#cfe6f2',headA:'#3f8f6a',headB:'#6fb880',seaFar:'#2b8fc0',seaNear:'#27b0b0'};
const SKY:Record<string,{p:Partial<ComicCoastPalette>;sunX:number;shade:[number,number,number];blob:number}>={
 plaza:{p:{top:'#f08a5c',mid:'#f6a968',haze:'#ffd08a',sunCore:'#fff1b0',sunRing:'#ffc24a',sunRing2:'#ff8a3c',cloudLit:'#ffe1b0',cloudShade:'#d9707a',headA:'#8a5a80',headB:'#c98a90',seaFar:'#3a6a9a',seaNear:'#2a8a9a'},sunX:.3,shade:[.62,.44,.66],blob:.3},
 harbour:{p:{...DAY,top:'#5ab8e6',mid:'#8fd4ee',haze:'#c9eef7'},sunX:.72,shade:[.55,.47,.74],blob:.28},
 training:{p:{...DAY,top:'#49a9e0',mid:'#86cdea',haze:'#bfe9f5'},sunX:.2,shade:[.55,.47,.74],blob:.3},
 beach:{p:{...DAY,top:'#2f9fe0',mid:'#7fd2f0',haze:'#e8f8f0'},sunX:.58,shade:[.62,.5,.7],blob:.26},
 stands:{p:{top:'#1a1648',mid:'#2c2560',haze:'#6a5aa8',sunCore:'#f6f2dc',sunRing:'#cdd8ff',sunRing2:'#7d8ad6',cloudLit:'#4b5594',cloudShade:'#2e3570',headA:'#141a44',headB:'#1f2658',seaFar:'#141a44',seaNear:'#141a44'},sunX:.82,shade:[.42,.38,.75],blob:.4},
};

/** The backdrop: the house comic coast with the arena's own skyline inked over it. */
function backdropTex(a:PopArena){const W=2048,H=512,hz=.84,sk=SKY[a.id]??SKY.training;return canvasTex(W,H,g=>{
 paintComicCoast(g,W,H,{width:W,height:H,sunX:sk.sunX,horizon:hz,palette:sk.p,seed:a.id.length*13+7});const y0=H*hz,rnd=seeded(a.id.charCodeAt(0)*31+5);g.lineJoin='round';
 const ink=(w=3)=>{g.lineWidth=w;g.strokeStyle=COMIC_INK;g.stroke();};
 if(a.id==='stands'){for(let tier=0;tier<3;tier++){const top=y0-170+tier*50,bot=top+56;g.fillStyle=['#1d2456','#252d68','#2d367a'][tier];g.beginPath();g.moveTo(0,bot);g.lineTo(0,top+10);for(let x=0;x<=W;x+=64)g.lineTo(x,top+Math.sin(x/260+tier)*8);g.lineTo(W,bot);g.closePath();g.fill();ink(3);
   for(let i=0;i<1600;i++){const x=rnd()*W,y=top+14+rnd()*36;g.fillStyle=TONES[Math.floor(rnd()*6)];g.globalAlpha=.5+rnd()*.45;g.fillRect(x,y,4,5);}g.globalAlpha=1;}
  for(const fx of [.12,.36,.64,.88]){const x=fx*W,y=y0-290;const gr=g.createRadialGradient(x,y,4,x,y,130);gr.addColorStop(0,'rgba(255,250,220,.95)');gr.addColorStop(.25,'rgba(205,216,255,.4)');gr.addColorStop(1,'rgba(205,216,255,0)');g.fillStyle=gr;g.fillRect(x-130,y-130,260,260);
   g.fillStyle='#0c0f2c';g.fillRect(x-4,y,8,130);g.fillStyle='#fffbe0';g.beginPath();g.rect(x-34,y-14,68,26);g.fill();ink(3);}
  g.fillStyle='#14183c';g.fillRect(0,y0-4,W,H-y0+4);return;}
 const n=a.id==='beach'?16:a.id==='plaza'?48:a.id==='harbour'?30:30;
 for(let i=0;i<n;i++){const x=(i+.2+rnd()*.6)/n*W,s=.7+rnd()*.7;
  if(a.id==='beach'){g.strokeStyle='#7a5a3a';g.lineWidth=7*s;g.beginPath();g.moveTo(x,y0+4);g.quadraticCurveTo(x+10*s,y0-40*s,x+22*s,y0-76*s);g.stroke();g.fillStyle='#2f9a5a';for(let l=0;l<6;l++){const an=l/6*Math.PI*2+rnd();g.beginPath();g.ellipse(x+22*s+Math.cos(an)*22*s,y0-76*s+Math.sin(an)*9*s,26*s,7*s,an*.4,0,7);g.fill();ink(2);}}
  else if(a.id==='plaza'){const w=34+rnd()*40,h=40+rnd()*80;g.fillStyle=['#ffd9a8','#f7b58a','#fff3d6','#f2957a','#e9c46a'][i%5];g.beginPath();g.rect(x-w/2,y0-h,w,h+4);g.fill();ink(3);g.fillStyle='#7a5a80';for(let wy=y0-h+10;wy<y0-10;wy+=18)for(let wx=x-w/2+7;wx<x+w/2-10;wx+=14)if(rnd()<.6)g.fillRect(wx,wy,7,9);
   g.fillStyle=['#f0452e','#d9604f','#c9584a'][i%3];g.beginPath();g.moveTo(x-w/2-5,y0-h);g.lineTo(x,y0-h-18-rnd()*12);g.lineTo(x+w/2+5,y0-h);g.closePath();g.fill();ink(3);}
  else if(a.id==='harbour'){if(i%4===0){g.fillStyle='#f0452e';g.fillRect(x-3,y0-150*s,6,150*s);g.beginPath();g.moveTo(x,y0-150*s);g.lineTo(x+80*s,y0-150*s);g.lineWidth=5;g.strokeStyle='#f0452e';g.stroke();}
   else{const w=40+rnd()*50,h=30+rnd()*50;g.fillStyle=['#e8e2d4','#d96c5a','#8fd4ee','#ffc83a'][i%4];g.beginPath();g.rect(x-w/2,y0-h,w,h+4);g.fill();ink(3);}}
  else{g.fillStyle=['#2f8a52','#3c9a5c','#278048'][i%3];g.beginPath();g.ellipse(x,y0-26*s,30*s,34*s,0,0,7);g.fill();ink(3);g.fillStyle='#7a5a3a';g.fillRect(x-3,y0-6,6,10);}}
 g.fillStyle=a.ground[0];g.fillRect(0,y0+3,W,H-y0);g.beginPath();g.moveTo(0,y0+3);g.lineTo(W,y0+3);ink(3);
});}

/** The ground sheet, 64 m x 64 m (x -32..32, z -50..14: the far end is the top of the canvas), 16 px a metre; water is painted in. */
function groundTex(a:PopArena){const S=16,W=64*S;return canvasTex(W,W,g=>{const X=(x:number)=>(x+32)*S,Z=(z:number)=>(z+50)*S,rnd=seeded(a.id.length*97+3);
 const line=(x0:number,z0:number,x1:number,z1:number)=>{g.beginPath();g.moveTo(X(x0),Z(z0));g.lineTo(X(x1),Z(z1));g.stroke();};
 const flecks=(n:number,c1:string,c2:string,len=3)=>{for(let i=0;i<n;i++){g.fillStyle=rnd()<.5?c1:c2;g.fillRect(rnd()*W,rnd()*W,1.5+rnd(),len+rnd()*len);}};
 const [c0,c1]=a.ground;g.fillStyle=c0;g.fillRect(0,0,W,W);
 switch(a.groundLook){
  case 'paving':for(let i=0;i<43;i++)for(let j=0;j<43;j++){g.fillStyle=['#e2cfa8','#d6c099','#ead9b6','#cdb78f'][(i*7+j*3+((i*j)%3))%4];g.fillRect(i*1.5*S+1,j*1.5*S+1,1.5*S-2,1.5*S-2);}
   g.fillStyle='#6a6478';g.fillRect(0,Z(-15),W,Z(-9.6)-Z(-15));g.fillStyle='#fff3d6';for(let x=0;x<W;x+=60)g.fillRect(x,Z(-12.4),34,5);g.fillStyle='#b8a27a';g.fillRect(0,Z(-15)-6,W,6);g.fillRect(0,Z(-9.6),W,6);
   g.strokeStyle='#fff3d6';g.lineWidth=.12*S;g.setLineDash([10,10]);g.beginPath();g.arc(X(0),Z(0),1.1*S,0,7);g.stroke();g.setLineDash([]);flecks(2500,'rgba(120,80,50,.12)','rgba(255,255,255,.14)',2);break;
  case 'quay':for(let i=0;i<32;i++)for(let j=0;j<32;j++){g.fillStyle=(i+j)%3?c0:c1;g.fillRect(i*2*S+1,j*2*S+1,2*S-2,2*S-2);}flecks(3000,'rgba(0,0,0,.1)','rgba(255,255,255,.12)',2);break;
  case 'grass':for(let i=0;i<16;i++){g.fillStyle=i%2?c0:c1;g.fillRect(0,i*4*S,W,4*S);}flecks(9000,'rgba(30,70,30,.16)','rgba(255,255,220,.12)');
   g.strokeStyle='#fff3d6';g.lineWidth=.14*S;g.lineCap='round';line(-30,-22.9,30,-22.9);line(-6.5,-22.9,-6.5,-16.9);line(11.7,-22.9,11.7,-16.9);line(-6.5,-16.9,11.7,-16.9);g.beginPath();g.arc(X(2.6),Z(-15.9),.2*S,0,7);g.fillStyle='#fff3d6';g.fill();
   g.beginPath();g.arc(X(0),Z(1.2),.35*S,0,7);g.fill();break;
  case 'sand':for(let i=0;i<80;i++){g.strokeStyle=i%2?'rgba(214,170,110,.5)':'rgba(255,246,214,.6)';g.lineWidth=2+rnd()*2;g.beginPath();const y=rnd()*W,x=rnd()*W;g.moveTo(x,y);g.bezierCurveTo(x+40,y-8,x+90,y+8,x+140+rnd()*80,y);g.stroke();}
   flecks(4000,'rgba(190,140,80,.25)','rgba(255,255,255,.3)',1.5);g.fillStyle='rgba(170,120,70,.45)';for(let i=0;i<10;i++){g.beginPath();g.ellipse(X(-2.9+(i%2)*.5),Z(8-i*.9),.14*S,.24*S,0,0,7);g.fill();}break;
  case 'pitch':for(let i=0;i<16;i++){g.fillStyle=i%2?c0:c1;g.fillRect(0,i*4*S,W,4*S);}flecks(7000,'rgba(10,40,20,.18)','rgba(255,255,255,.06)');
   g.strokeStyle='#dfe8ff';g.lineWidth=.14*S;line(-30,-4.2,30,-4.2);g.beginPath();g.arc(X(0),Z(6),8*S,Math.PI*1.15,Math.PI*1.85);g.stroke();g.beginPath();g.arc(X(0),Z(-.3),.3*S,0,7);g.fillStyle='#dfe8ff';g.fill();break;}
 // water (deco 'water'): painted with wave flecks and a foam edge
 for(const d of a.deco){if(d[7]!=='water')continue;const x0=X(d[0]-d[3]/2),x1=X(d[0]+d[3]/2),z0=Z(d[2]-d[5]/2),z1=Z(d[2]+d[5]/2);g.fillStyle=d[6];g.fillRect(x0,z0,x1-x0,z1-z0);
  g.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<260;i++){const x=x0+rnd()*(x1-x0),y=z0+rnd()*(z1-z0);g.fillRect(x,y,10+rnd()*14,2.5);}g.fillStyle='#fffaf0';for(let x=x0;x<x1;x+=22)g.fillRect(x+rnd()*8,z1-3-rnd()*3,14,3);}
});}

/** The ball: paper white with ink patches and one red and one teal panel, so the spin reads (Flick It's ball). */
function ballTex(){return canvasTex(256,128,g=>{g.fillStyle='#fffaf0';g.fillRect(0,0,256,128);const spot=(u:number,v:number,r:number,c:string)=>{for(const du of [-256,0,256]){g.fillStyle=c;g.beginPath();g.ellipse(u*256+du,v*128,r/Math.max(.35,Math.sin(v*Math.PI)),r,0,0,7);g.fill();}};
 for(let i=0;i<5;i++){spot(i/5+.1,.3,11,i===0?'#f0452e':COMIC_INK);spot(i/5,.7,11,i===2?'#19b5a5':COMIC_INK);}spot(.5,.02,16,COMIC_INK);spot(.5,.98,16,COMIC_INK);});}
function blobTex(){return canvasTex(64,64,g=>{const r=g.createRadialGradient(32,32,2,32,32,31);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.6,'rgba(255,255,255,.75)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);});}

/* ---- target models: origin at the FEET (the hinge), facing +z (the camera); 1.5 m tall at scale 1; white parts take the instance colour ---- */
const WHITE='#ffffff';
const bull=(o:Parts,y:number,z:number,r:number)=>{P(o,cyl(r,r,.06,18).rotateX(Math.PI/2),'#fff3d6',0,y,z,0,0,.025);P(o,cyl(r*.66,r*.66,.07,18).rotateX(Math.PI/2),'#f0452e',0,y,z+.005,0,0,0);P(o,cyl(r*.33,r*.33,.08,14).rotateX(Math.PI/2),'#fff3d6',0,y,z+.01,0,0,0);};
const face=(o:Parts,y:number,z:number,skin='#f2b98a')=>{P(o,cyl(.2,.2,.1,14).rotateX(Math.PI/2),skin,0,y,z,0,0,.03);P(o,box(.05,.07,.04),COMIC_INK,-.07,y+.03,z+.06,0,0,0);P(o,box(.05,.07,.04),COMIC_INK,.07,y+.03,z+.06,0,0,0);P(o,box(.12,.025,.04),COMIC_INK,0,y-.07,z+.06,0,0,0);};
function targetModel(k:number,variant=0):T.BufferGeometry{const o:Parts=[];switch(k){
 case K.dummy:// a wooden cut-out player on a hinge plate, a bullseye on the shirt
  P(o,box(.7,.12,.5),'#8a5a2e',0,.06,0,0,0,.03);P(o,box(.12,.3,.1),'#5b6072',0,.25,0,0,0,.02);
  P(o,box(.68,.78,.14),WHITE,0,.72,0,0,0,.04);P(o,box(.3,.34,.14),'#3a3540',-.17,.22+.05,0,0,0,.03);P(o,box(.3,.34,.14),'#3a3540',.17,.27,0,0,0,.03);
  P(o,box(.2,.5,.12),WHITE,-.44,.82,0,0,.35,.03);P(o,box(.2,.5,.12),WHITE,.44,.82,0,0,-.35,.03);bull(o,.74,.08,.25);face(o,1.3,0);P(o,box(.42,.1,.2),COMIC_INK,0,1.48,0,0,0,.02);break;
 case K.peeker:// a flat cardboard defender, arms out wide
  P(o,box(.66,.86,.06),WHITE,0,.83,0,0,0,.035);P(o,box(.16,.42,.06),'#fff3d6',-.2,.21,0,0,0,.03);P(o,box(.16,.42,.06),'#fff3d6',.2,.21,0,0,0,.03);
  P(o,box(.62,.14,.06),WHITE,-.58,1.05,0,0,.5,.03);P(o,box(.62,.14,.06),WHITE,.58,1.05,0,0,-.5,.03);P(o,box(.34,.12,.07),'#fff3d6',0,.95,.01,0,0,0);
  face(o,1.38,0);P(o,box(.44,.12,.12),'#8a5a2e',0,1.56,0,0,0,.02);break;
 case K.armour:// a dummy holding a bin lid
  P(o,box(.7,.12,.5),'#8a5a2e',0,.06,0,0,0,.03);P(o,box(.7,.8,.16),WHITE,0,.72,0,0,0,.04);P(o,box(.3,.34,.14),'#3a3540',-.17,.27,0,0,0,.03);P(o,box(.3,.34,.14),'#3a3540',.17,.27,0,0,0,.03);
  face(o,1.3,0);P(o,cyl(.24,.24,.16,10),'#8d93a6',0,1.52,0,0,0,.03,true);
  P(o,cyl(.46,.46,.08,16).rotateX(Math.PI/2),'#cfd8dc',0,.78,.2,0,0,.04);P(o,cyl(.3,.3,.09,16).rotateX(Math.PI/2),'#a9aec0',0,.78,.22,0,0,0);P(o,box(.2,.08,.08),'#5b6072',0,.78,.28,0,0,.02);break;
 case K.balloon:P(o,box(.015,.62,.015),COMIC_INK,0,.31,0,0,0,0);P(o,cone(.08,.12,6),WHITE,0,.66,0,0,0,.02,true);P(o,sph(.48,12),WHITE,0,1.1,0,0,0,.035,true);P(o,sph(.11,6),'#ffffff',-.16,1.28,.36,0,0,0,true);break;
 case K.gold:// the gold mascot: a round lion-ish fellow with a star on his chest
  P(o,cyl(.32,.4,.7,12),'#ffc83a',0,.55,0,0,0,.04,true);P(o,sph(.36,12),'#ffc83a',0,1.18,0,0,0,.04,true);P(o,sph(.5,10),'#f0a020',0,1.2,-.12,0,0,.04,true);P(o,sph(.36,12),'#ffd95a',0,1.18,.04,0,0,0,true);
  P(o,box(.06,.09,.04),COMIC_INK,-.11,1.22,.38,0,0,0);P(o,box(.06,.09,.04),COMIC_INK,.11,1.22,.38,0,0,0);P(o,sph(.07,6),'#f0452e',0,1.1,.4,0,0,0,true);
  P(o,cyl(.18,.18,.06,5).rotateX(Math.PI/2),'#fff3d6',0,.62,.36,0,0,.02);P(o,cyl(.12,.12,.4,8),'#ffc83a',-.42,.7,0,0,.9,.03,true);P(o,cyl(.12,.12,.4,8),'#ffc83a',.42,.7,0,0,-.9,.03,true);P(o,box(.5,.2,.3),'#8a5a2e',0,.1,0,0,0,.03);break;
 case K.bag:// a net bag of balls
  P(o,sph(.5,9),'#fff3d6',0,.55,0,0,0,.035,true);for(const [x,y,z] of [[-.22,.4,.3],[.2,.42,.3],[0,.78,.28],[-.3,.75,.05],[.3,.72,.08]] as const)P(o,sph(.2,8),x===0?'#f0452e':'#fffaf0',x,y,z,0,0,.025,true);
  P(o,cyl(.08,.2,.3,8),'#19b5a5',0,1.1,0,0,0,.03,true);P(o,box(.05,.3,.05),COMIC_INK,0,1.33,0,0,0,0);break;
 case K.friend:if(variant===0){// the coach: teal tracksuit, cap, clipboard
   P(o,box(.32,.7,.26),'#2a6b8a',0,.35,0,0,0,.035);P(o,box(.62,.62,.32),'#19b5a5',0,.98,0,0,0,.04);P(o,box(.08,.62,.33),'#fff3d6',-.18,.98,0,0,0,0);P(o,box(.08,.62,.33),'#fff3d6',.18,.98,0,0,0,0);
   P(o,sph(.24,10),'#c98a5a',0,1.48,0,0,0,.035,true);P(o,box(.05,.07,.04),COMIC_INK,-.08,1.5,.22,0,0,0);P(o,box(.05,.07,.04),COMIC_INK,.08,1.5,.22,0,0,0);P(o,box(.14,.03,.04),COMIC_INK,0,1.4,.22,0,0,0);
   P(o,cyl(.25,.26,.12,12),'#f0452e',0,1.66,0,0,0,.03,true);P(o,box(.3,.04,.22),'#f0452e',0,1.62,.2,0,0,.02);P(o,box(.32,.42,.04),'#c98a4b',.3,.95,.2,0,.2,.025);P(o,box(.26,.3,.05),'#fffaf0',.3,.93,.21,0,.2,0);}
  else{// the referee: black shirt with yellow, whistle, a card held up
   P(o,box(.32,.7,.26),'#231a2e',0,.35,0,0,0,.035);P(o,box(.62,.62,.32),'#231a2e',0,.98,0,0,0,.04);P(o,box(.63,.1,.33),'#ffc83a',0,1.22,0,0,0,0);
   P(o,sph(.24,10),'#f2b98a',0,1.48,0,0,0,.035,true);P(o,box(.05,.07,.04),COMIC_INK,-.08,1.5,.22,0,0,0);P(o,box(.05,.07,.04),COMIC_INK,.08,1.5,.22,0,0,0);P(o,sph(.04,5),'#cfd8dc',0,1.38,.24,0,0,0,true);
   P(o,box(.16,.5,.16),'#231a2e',.42,1.32,0,0,-.2,.03);P(o,box(.22,.3,.04),'#ffc83a',.5,1.72,.04,0,-.2,.025);P(o,box(.42,.1,.2),COMIC_INK,0,1.68,0,0,0,.02);}break;
 }return bakeParts(o);}
/** The runner: what rides this arena's rail, with a bullseye. Origin at the bottom, facing +z. */
function runnerModel(kind:PopArena['runner']):T.BufferGeometry{const o:Parts=[];switch(kind){
 case 'trolley':P(o,box(1.3,.6,.7),'#f0452e',0,.55,0,0,0,.04);for(const s of [-1,1])P(o,cyl(.16,.16,.1,10).rotateX(Math.PI/2),COMIC_INK,s*.45,.16,.36,0,0,.02);P(o,box(.08,.7,.08),'#8d93a6',.62,1,0,0,.3,.02);for(let i=0;i<4;i++)P(o,sph(.16,8),TONES[i],-.4+i*.27,.95,0,0,0,.02,true);bull(o,.58,.37,.24);break;
 case 'duck':P(o,sph(.5,10),'#ffc83a',0,.45,0,0,0,.04,true);P(o,sph(.3,10),'#ffc83a',.35,.95,.05,0,0,.04,true);P(o,cone(.12,.26,6).rotateZ(-Math.PI/2),'#ff8a3c',.7,.92,.05,0,0,.02,true);P(o,box(.05,.07,.04),COMIC_INK,.45,1.02,.3,0,0,0);P(o,cone(.2,.4,5).rotateZ(Math.PI/2),'#ffc83a',-.6,.55,0,0,0,.03,true);bull(o,.45,.5,.2);break;
 case 'cart':P(o,box(1.2,.5,.8),'#2f8fd8',0,.45,0,0,0,.04);for(const s of [-1,1])P(o,cyl(.2,.2,.12,10).rotateX(Math.PI/2),COMIC_INK,s*.42,.2,.42,0,0,.02);for(let i=0;i<5;i++)P(o,cone(.12,.3,8),'#ff8a3c',-.45+i*.22,.85,0,0,0,.02,true);bull(o,.46,.42,.22);break;
 case 'boat':P(o,box(1.6,.45,.8),'#f0452e',0,.25,0,0,0,.04);P(o,box(1.7,.12,.86),'#fff3d6',0,.5,0,0,0,.02);P(o,box(.06,1.3,.06),'#8a5a2e',0,1.1,0,0,0,.02);P(o,cone(.5,1,3),'#fff3d6',.25,1.1,0,0,0,.03,true);bull(o,.27,.42,.2);break;
 default:// a mascot in a team shirt running
  P(o,box(.3,.4,.24),'#2f8fd8',0,.2,0,0,0,.03);P(o,box(.7,.66,.34),'#ffc83a',0,.75,0,0,0,.04);P(o,sph(.33,10),'#ffc83a',0,1.32,0,0,0,.04,true);P(o,sph(.12,6),'#ffc83a',-.24,1.56,0,0,0,.03,true);P(o,sph(.12,6),'#ffc83a',.24,1.56,0,0,0,.03,true);
  P(o,box(.06,.09,.04),COMIC_INK,-.1,1.36,.3,0,0,0);P(o,box(.06,.09,.04),COMIC_INK,.1,1.36,.3,0,0,0);bull(o,.75,.19,.22);}
 return bakeParts(o);}

/* ---- scenery: every box and deco piece as a model, baked into one mesh ---- */
function scenery(a:PopArena):T.BufferGeometry{const o:Parts=[],rnd=seeded(a.id.length*53+11);
 const B=(c:string,x:number,y:number,z:number,w:number,h:number,d:number,ry=0,ink=.05)=>P(o,box(w,h,d),c,x,y,z,ry,0,ink);
 const Cy=(c:string,x:number,y:number,z:number,r:number,h:number,ink=.05,r1=r,n=10)=>P(o,cyl(r1,r,h,n),c,x,y,z,0,0,ink,true);
 const tree=(x:number,z:number,s=1)=>{Cy('#8a5a2e',x,1.1*s,z,.22*s,2.2*s);P(o,sph(1.3*s,8),'#2f9a5a',x,3*s,z,0,0,.07,true);P(o,sph(.9*s,7),'#3fae68',x+.8*s,2.5*s,z+.3,0,0,.06,true);P(o,sph(.9*s,7),'#27884c',x-.8*s,2.6*s,z-.2,0,0,.06,true);};
 const palm=(x:number,z:number,s=1)=>{for(let i=0;i<4;i++)Cy(i%2?'#a8703a':'#8a5a2e',x+i*.22*s,(.6+i*1.2)*s,z,.2*s,1.25*s,.045);const tx=x+.8*s,ty=5*s;for(let l=0;l<6;l++){const an=l/6*Math.PI*2;P(o,box(2.4*s,.07,.6*s),l%2?'#2f9a5a':'#3fae68',tx+Math.cos(an)*1.1*s,ty-.25*s,z+Math.sin(an)*1.1*s,-an,-.35,.04);}};
 const roofPyr=(c:string,x:number,y:number,z:number,w:number,h:number)=>P(o,cyl(.01,w*.74,h,4).rotateY(Math.PI/4),c,x,y+h/2,z,0,0,.06,true);
 const piece=(q:PopBox)=>{const [x,y,z,w,h,d,c,look]=q,cy=y+h/2,front=z+d/2+.02;switch(look){
  case 'shop':B(c,x,cy,z,w,h,d,0,.08);B('#fff3d6',x,y+h-.2,z,w+.3,.4,d+.3,0,.05);// cornice
   B(['#f0452e','#19b5a5','#2f8fd8'][Math.abs(Math.round(x))%3],x,y+2.9,front+.5,w*.86,.18,1.1,0,.04);for(let i=0;i<6;i++)B(i%2?'#fff3d6':['#f0452e','#19b5a5','#2f8fd8'][Math.abs(Math.round(x))%3],x-w*.43+w*.86*(i+.5)/6,y+2.75,front+1.03,w*.86/6,.3,.05,0,0);
   B('#7a5a80',x-w*.24,y+1.35,front,w*.3,1.9,.06,0,.03);B('#bfe9f5',x-w*.24,y+1.35,front+.02,w*.26,1.7,.04,0,0);B('#8a5a2e',x+w*.22,y+1.1,front,1.1,2.2,.06,0,.03);
   for(const wx of [-w*.33,w*.33])if(h>7)B('#7a5a80',x+wx,y+h-2.2,front,1.1,1.3,.06,0,.03);break;
  case 'flowerbox':B(c,x,cy,z,w,h,d,0,.04);for(let i=0;i<6;i++)P(o,sph(.17,6),['#ff65c8','#ffc83a','#fff3d6'][i%3],x-w/2+.2+i*(w-.4)/5,y+h+.08,z,0,0,.02,true);
   B('#3a2f58',x,y+h+1.1,z-d/2-.0,w*.95,2.2,.06,0,.035);B('#5a4478',x,y+h+1.1,z-d/2+.01,w*.8,1.9,.04,0,0);for(const s of [-1,1])B('#19b5a5',x+s*(w*.6),y+h+1.1,z-d/2+.03,w*.28,2.1,.06,0,.03);break;
  case 'crate':B(c,x,cy,z,w,h,d,0,.05);for(const s of [-1,1])B('#8a5a2e',x,y+h/2+s*h*.38,front-.01,w*1.01,h*.12,.04,0,0);B('#a8703a',x,cy,front,w*.12,h*.8,.04,0,0);break;
  case 'bus':B(c,x,y+.3+(h-.3)/2,z,w,h-.3,d,0,.08);B('#bfe9f5',x,y+h*.66,front,w*.9,h*.3,.04,0,.03);for(let i=0;i<5;i++)B(c,x-w*.45+w*.9*i/4,y+h*.66,front+.02,.1,h*.3,.04,0,0);
   B('#fff3d6',x,y+h-.08,z,w+.06,.16,d+.06,0,.03);B('#ffc83a',x,y+h*.38,front,w,.14,.04,0,0);for(const s of [-1,1])P(o,cyl(.38,.38,.3,12).rotateX(Math.PI/2),COMIC_INK,x+s*w*.32,y+.36,front-.1,0,0,.02);
   B('#fff3d6',x-w/2-.02,y+h*.75,z,.06,.4,d*.8,0,.02);break;
  case 'kiosk':B(c,x,cy-.3,z,w,h-.6,d,0,.06);P(o,cyl(.01,w*.85,.9,4).rotateY(Math.PI/4),'#f0452e',x,y+h-.15,z,0,0,.06,true);B('#3a2f58',x,y+h*.58,front,w*.7,.7,.05,0,.03);B('#fff3d6',x,y+h*.4,front+.15,w*.8,.1,.35,0,.03);break;
  case 'fountain':Cy('#cfd8dc',x,y+h/2,z,w/2,h,.06,w/2,14);Cy('#8fd4ee',x,y+h-.02,z,w/2-.15,.06,0,w/2-.15,14);Cy('#cfd8dc',x,y+h+.5,z,.18,1,.04);P(o,sph(.3,8),'#8fd4ee',x,y+h+1.05,z,0,0,.03,true);break;
  case 'hedge':for(let i=0;i<4;i++)P(o,sph(h*.62,8),i%2?'#3f9a5c':'#4fae68',x-w/2+w*(i+.5)/4,y+h*.55,z,0,0,.05,true);B('#2f8a52',x,y+h*.35,z,w,h*.7,d,0,.04);break;
  case 'bin':Cy(c,x,cy,z,w/2,h,.05,w/2*1.06,12);Cy('#8d93a6',x,y+h+.04,z,w/2*1.1,.1,.03,w/2*1.1,12);B('#ffc83a',x,y+h*.5,z+w/2,.3,.2,.04,0,0);break;
  case 'warehouse':B(c,x,cy,z,w,h,d,0,.09);B('#fff3d6',x,y+h+.15,z,w+.2,.3,d+.2,0,.05);for(let i=0;i<2;i++){const dx=x-w*.25+i*w*.5;B('#5b6072',dx,y+1.6,front,w*.36,3.2,.05,0,.04);for(let s=0;s<6;s++)B('#8d93a6',dx,y+.3+s*.5,front+.02,w*.36,.06,.03,0,0);}
   B('#231a2e',x,y+h-1,front,w*.5,.8,.05,0,.03);B('#ffc83a',x,y+h-1,front+.02,w*.45,.5,.04,0,0);break;
  case 'boat':B(c,x,y+h*.35,z,w,h*.7,d,0,.07);P(o,cyl(d/2,d/2,h*.7,8).rotateZ(Math.PI/2).scale(.4,1,1),c,x+w/2,y+h*.35,z,0,0,.05,true);B('#fff3d6',x,y+h*.72,z,w+.1,.14,d+.1,0,.03);B('#fff3d6',x-w*.2,y+h*.9,z,w*.36,.5,d*.7,0,.05);B('#7a5a80',x-w*.2,y+h*.95,z+d*.35+.01,w*.3,.22,.04,0,0);
   Cy('#8a5a2e',x+w*.15,y+h*.7+1.2,z,.05,2.4,.02);break;
  case 'barrel':Cy(c,x,cy,z,w/2,h,.045,w/2,12);for(const yy of [.2,.8])Cy('#fff3d6',x,y+h*yy,z,w/2*1.04,.07,0,w/2*1.04,12);break;
  case 'quayedge':B(c,x,cy,z,w,h,d,0,.05);B('#ffc83a',x,y+h-.02,z+d/2-.06,w,.04,.1,0,0);for(let i=-6;i<=6;i++)Cy('#5b6072',i*4.5,y+h+.2,z,.14,.4,.03);break;
  case 'crane':B(c,x,cy,z,w,h,w,0,.04);B('#f0452e',x+2.5,y+h-.3,z,6,.35,.35,0,.04);B(COMIC_INK,x+5,y+h-1.8,z,.04,3,.04,0,0);B('#ffc83a',x+5,y+h-3.4,z,.5,.3,.5,0,.03);break;
  case 'lighthouse':for(let i=0;i<5;i++)Cy(i%2?'#f0452e':c,x,y+i*h/6+h/12,z,w/2*(1-i*.05),h/6,.05,w/2*(1-(i+1)*.05),12);Cy('#ffc83a',x,y+h*.9,z,w*.32,h/9,.04,w*.32,10);P(o,cone(w*.4,h*.1,10),'#f0452e',x,y+h,z,0,0,.04,true);break;
  case 'shed':B(c,x,cy,z,w,h,d,0,.08);P(o,cyl(.01,w*.72,1.4,4).rotateY(Math.PI/4).scale(1,1,d/w),'#8a3a3a',x,y+h+.7,z,0,0,.07,true);B('#8a5a2e',x+w*.25,y+1.05,front,1,2.1,.05,0,.03);B('#7a5a80',x-w*.25,y+h*.6,front,1.1,.9,.05,0,.03);break;
  case 'goal':for(const s of [-1,1])Cy('#fffaf0',x+s*w/2,y+h/2,z,.06,h,.03);P(o,cyl(.06,.06,w,8).rotateZ(Math.PI/2),'#fffaf0',x,y+h,z,0,0,.03);for(let i=1;i<12;i++)B('#e8e2d4',x-w/2+w*i/12,y+h/2,z-.6,.02,h,.02,0,0);for(let i=1;i<5;i++)B('#e8e2d4',x,y+h*i/5,z-.6,w,.02,.02,0,0);
   for(const s of [-1,1])B('#e8e2d4',x+s*w/2,y+h/2,z-.3,.03,h,.6,0,0);break;
  case 'wallm':for(let i=0;i<5;i++){const mx=x-w/2+w*(i+.5)/5;B(c,mx,y+h*.45,z,w/5*.8,h*.9,d,0,.04);P(o,cyl(.18,.18,d,10).rotateX(Math.PI/2),c,mx,y+h+.05,z,0,0,.04);B('#f0452e',mx,y+h*.55,z+d/2+.01,w/5*.5,.12,.03,0,0);B('#5b6072',mx,y+.06,z,w/5*.7,.12,d*2,0,.02);}break;
  case 'tyres':{const n=Math.max(2,Math.round(h/.38));for(let i=0;i<n;i++)P(o,new T.TorusGeometry(w*.36,w*.14,6,14).rotateX(Math.PI/2),i%2?'#3a3540':'#5b5266',x,y+.19+i*(h-.38)/(n-1),z,0,0,.03,true);break;}
  case 'board':B(c,x,cy,z,w,h,d,0,.05);B('#fff3d6',x,cy,front,w*.7,h*.4,.04,0,0);B(COMIC_INK,x-w*.15,cy,front+.01,w*.2,h*.2,.03,0,0);B('#ffc83a',x+w*.2,cy,front+.01,w*.15,h*.25,.03,0,0);break;
  case 'cage':B(c,x,y+.05,z,w,.1,d,0,.03);for(const sx of [-1,1])for(const sz of [-1,1])B(c,x+sx*w/2,cy,z+sz*d/2,.08,h,.08,0,.02);B(c,x,y+h,z,w,.08,d,0,.02);for(let i=0;i<5;i++)P(o,sph(.2,7),'#fffaf0',x-.4+i*.2,y+.3+(i%2)*.3,z+(i%3-1)*.3,0,0,.02,true);break;
  case 'fence':B(c,x,y+h*.55,z,w,h*.1,d,0,.03);for(let i=0;i<Math.round(w/1.2);i++)B(c,x-w/2+i*1.2,cy,z,.1,h,d*1.2,0,.02);B('#3a8a5a',x,cy,z-.05,w,h*.9,.04,0,0);break;
  case 'cones':P(o,cone(w*.5,h*1.4,8),c,x,y+h*.7,z,0,0,.03,true);P(o,cone(w*.5,h*1.4,8),c,x+.7,y+h*.7,z-.6,0,0,.03,true);break;
  case 'hut':B(c,x,cy,z,w,h,d,0,.07);for(let i=0;i<4;i++)B(i%2?'#fff3d6':c,x-w*.375+i*w*.25,cy,front,w*.25,h,.04,0,0);P(o,cyl(.01,w*.8,1,4).rotateY(Math.PI/4),c,x,y+h+.5,z,0,0,.06,true);B('#3a2f58',x,y+h*.38,front+.02,w*.36,h*.76,.04,0,.03);break;
  case 'tower':for(const sx of [-1,1])for(const sz of [-1,1])B('#fff3d6',x+sx*w*.38,y+h*.3,z+sz*d*.38,.14,h*.6,.14,0,.03);B('#f0452e',x,y+h*.6+.6,z,w,1.2,d,0,.06);B('#bfe9f5',x,y+h*.6+.65,front,w*.7,.5,.04,0,.03);P(o,cyl(.01,w*.78,.7,4).rotateY(Math.PI/4),'#fff3d6',x,y+h+.15,z,0,0,.05,true);Cy('#8a5a2e',x,y+h+1,z,.04,1.6,.02);B('#f0452e',x+.35,y+h+1.5,z,.7,.45,.03,0,.02);break;
  case 'castle':B(c,x,cy,z,w,h,d,0,.05);for(const s of [-1,1])Cy(c,x+s*w*.38,y+h+.2,z,.2,.4,.03);P(o,cone(.12,.4,3),'#f0452e',x,y+h+.3,z,0,0,.02,true);break;
  case 'deckchair':B('#8a5a2e',x,y+.25,z,w,.5,d*.9,0,.03);P(o,box(w*.9,.06,d*1.2),c,x,y+.8,z,0,0,.03);B('#fff3d6',x,y+.8+.04,z,w*.3,.05,d*1.1,0,0);B('#8a5a2e',x,y+h*.75,z-d*.4,w,h*.5,.08,0,.03);break;
  case 'tier':{B(c,x,cy,z,w,h,d,0,.07);const rows=2;for(let r=0;r<rows;r++){const ry=y+h*(r+1)/(rows+.5),rz=z+d/2-d*(r+.5)/rows*.6;B('#fff3d6',x,ry,rz+.2,w,.12,.4,0,.02);
    for(let i=0;i<Math.round(w/.9);i++){if(rnd()<.35)continue;const sx=x-w/2+.45+i*.9;B(TONES[Math.floor(rnd()*6)],sx,ry+.32,rz,.42,.5,.36,0,.02);P(o,sph(.16,6),['#f2b98a','#c98a5a','#8a5a3a'][Math.floor(rnd()*3)],sx,ry+.7,rz,0,0,.02,true);}}
   B('#231a2e',x,y+h-.06,z+d/2+.02,w,.12,.06,0,0);break;}
  case 'score':B(c,x,cy,z,w,h,d,0,.08);B('#ffc83a',x,cy+.4,z+d/2+.02,w*.8,1,.04,0,0);B('#fff3d6',x-1.4,cy-.7,z+d/2+.02,1.6,.9,.04,0,0);B('#fff3d6',x+1.4,cy-.7,z+d/2+.02,1.6,.9,.04,0,0);for(const s of [-1,1])B('#5b6072',x+s*w*.4,y-h*.4,z,.25,h*.8,.25,0,.03);break;
  case 'dugout':B(c,x,cy,z,w,h,d,0,.06);B('#bfe9f5',x,y+h*.6,z+d/2+.02,w*.8,h*.5,.04,0,.02);B('#fff3d6',x,y+h,z,w+.2,.1,d+.2,0,.02);break;
  case 'floodlight':Cy('#8d93a6',x,y+h/2,z,w*.2,h,.04);B('#fffbe0',x,y+h+.6,z+.3,3.6,1.6,.4,0,.06);for(let i=0;i<4;i++)B('#ffffff',x-1.3+i*.87,y+h+.6,z+.52,.6,1.2,.04,0,0);break;
  case 'tunnel':B(c,x,y+h/2,z,w,h,d,0,.04);B('#f0452e',x,y+h+.15,z,w+.4,.3,d+.2,0,.03);break;
  case 'tree':tree(x,z,h/5.4);break;
  case 'palm':palm(x,z,h/7);break;
  case 'lamp':Cy(c,x,y+h/2,z,.09,h,.035);B('#fff3d6',x,y+h+.12,z,.5,.3,.5,0,.035);B(c,x,y+h+.32,z,.6,.1,.6,0,.02);break;
  case 'umbrella':Cy('#8a5a2e',x,y+h/2,z,.05,h,.02);P(o,cone(1.5,.7,8),c,x,y+h+.1,z,0,0,.05,true);B(c==='#f0452e'?'#19b5a5':'#f0452e',x+.7,y+.06,z+.9,.9,.08,1.9,.4,.03);break;
  case 'water':break;// painted on the ground sheet
  default:B(c,x,cy,z,w,h,d,0,.05);}};
 for(const q of a.boxes)piece(q);for(const q of a.deco)piece(q);
 // the kick spot: a little rack stand for the balls and a chalk mark
 const [bx,,bz]=a.ball;B('#8a5a2e',bx+.95,.12,bz+.25,1.4,.08,.34,0,.025);for(const s of [-1,1])B('#5b6072',bx+.95+s*.6,.06,bz+.25,.08,.12,.3,0,.015);
 // a few big near props cut the frame (depth cue)
 if(a.id==='plaza'){for(const s of [-1,1])P(o,sph(.5,7),'#ff65c8',s*3.4,.5,1.6,0,0,.04,true);}
 if(a.id==='beach'){B('#c98a4b',-6.4,.5,1.4,1.4,1,1.2,.3,.05);}
 if(a.id==='training'){for(const s of [-1,1])P(o,cone(.28,.6,8),'#ff8a3c',s*2.4,.3,2.6,0,0,.03,true);}
 return bakeParts(o);}

const BITS=140,TRAIL=60,BLOBS=48,STARS=8,BALLS=24,RACK=6;
const M=new T.Matrix4(),Q=new T.Quaternion(),Q2=new T.Quaternion(),V=new T.Vector3(),SC=new T.Vector3(),E=new T.Euler(),CC=new T.Color(),AX=new T.Vector3(),WHITE_C=new T.Color('#ffffff');
const easeBack=(u:number)=>{const c=1.9;u=Math.max(0,Math.min(1,u));return 1+(c+1)*Math.pow(u-1,3)+c*Math.pow(u-1,2);};
export type PopupView=ReturnType<typeof createPopupView>;
export function createPopupView(host:HTMLElement,o:{reduced:boolean;mobile:boolean}){
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');canvas.dataset.popupCanvas='';canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';host.prepend(canvas);
 const renderer=new T.WebGLRenderer({canvas,antialias:!o.mobile,powerPreference:'low-power',alpha:false});renderer.toneMapping=T.NoToneMapping;
 const scene=new T.Scene(),bg=new T.Color('#8fd4ee');scene.background=bg;const fog=new T.Fog('#d6f1f5',22,95);scene.fog=fog;
 const camera=new T.PerspectiveCamera(60,.5,.1,400),ink=createComicUniforms({});
 const hemi=new T.HemisphereLight('#ffffff','#a79bb5',.55),sun=new T.DirectionalLight('#ffffff',2.6),toSun=new T.Vector3(-.45,.7,.55).normalize();sun.position.copy(toSun).multiplyScalar(40);scene.add(hemi,sun,sun.target);
 const owned:{dispose():void}[]=[],own=<X extends {dispose():void}>(x:X)=>{owned.push(x);return x;};
 const lit=<X extends T.Material>(m:X,rim=false)=>comicMaterial(own(m),{uniforms:ink,rim});
 const vmat=lit(new T.MeshLambertMaterial({vertexColors:true}));
 const backMat=own(new T.MeshBasicMaterial({fog:false,side:T.BackSide})),back=new T.Mesh(own(new T.CylinderGeometry(150,150,96,40,1,true,Math.PI/2,Math.PI)),backMat);back.position.set(0,34,0);back.frustumCulled=false;scene.add(back);
 const underMat=lit(new T.MeshLambertMaterial({color:'#57b85f'})),under=new T.Mesh(own(new T.PlaneGeometry(420,420).rotateX(-Math.PI/2)),underMat);under.position.y=-.03;scene.add(under);
 const groundMat=lit(new T.MeshLambertMaterial({color:'#ffffff'})),ground=new T.Mesh(own(new T.PlaneGeometry(64,64).rotateX(-Math.PI/2)),groundMat);ground.position.set(0,0,-18);scene.add(ground);
 const place=new T.Mesh(new T.BufferGeometry(),vmat);place.frustumCulled=false;scene.add(place);
 let backTex:T.Texture|null=null,groundT:T.Texture|null=null,arena:PopArena=ARENAS[0];
 const mk=(geo:T.BufferGeometry,mat:T.Material,n:number)=>{const m=new T.InstancedMesh(geo,mat,n);m.instanceMatrix.setUsage(T.DynamicDrawUsage);m.setColorAt(0,CC.set('#ffffff'));m.count=0;m.visible=false;m.frustumCulled=false;scene.add(m);return m;};
 // targets: one instanced mesh per model (the coach and the referee are two; the runner is rebuilt per arena)
 const tmesh:T.InstancedMesh[]=[];const slotOf=(k:number,id:number)=>k===K.friend?(id%2?8:9):k;
 for(const k of [K.dummy,K.peeker,K.armour,K.balloon,K.runner,K.gold,K.bag])tmesh[k]=mk(k===K.runner?new T.BufferGeometry():own(targetModel(k)),vmat,k===K.dummy||k===K.balloon?8:5);
 tmesh[8]=mk(own(targetModel(K.friend,0)),vmat,2);tmesh[9]=mk(own(targetModel(K.friend,1)),vmat,2);
 const ballMat=lit(new T.MeshLambertMaterial({map:own(ballTex())}),true),ballGeo=own(new T.SphereGeometry(1,18,12)),balls=mk(ballGeo,ballMat,BALLS),rack=mk(ballGeo,ballMat,RACK);
 const blobs=mk(own(new T.PlaneGeometry(2,2).rotateX(-Math.PI/2)),own(new T.MeshBasicMaterial({map:own(blobTex()),transparent:true,depthWrite:false,color:COMIC_INK,opacity:.3})),BLOBS);blobs.renderOrder=1;
 const fxMat=own(new T.MeshBasicMaterial({color:'#ffffff'})),trail=mk(own(new T.SphereGeometry(1,8,6)),fxMat,TRAIL),bits=mk(own(new T.BoxGeometry(1,1,1)),fxMat,BITS);
 const topMat=own(new T.MeshBasicMaterial({color:'#ffffff',depthTest:false,fog:false,transparent:true})),stars=mk(own(comicStarGeometry()),topMat,STARS*2);stars.renderOrder=10;
 const bp=new Float32Array(BITS*8),bc=new Float32Array(BITS*3);let bi=0;
 const tp=new Float32Array(TRAIL*5);let ti=0;// x y z t0 tone
 const sp=new Float32Array(STARS*6);let si=0;
 const spin:T.Quaternion[]=Array.from({length:BALLS},()=>new T.Quaternion()),trailAt=new Float32Array(BALLS);
 function burst(x:number,y:number,z:number,n:number,cols:readonly string[],speed:number,size=.12){if(o.reduced)n=Math.ceil(n/3);for(let i=0;i<n;i++){const j=bi++%BITS,an=Math.random()*6.283,u=Math.random();bp[j*8]=x;bp[j*8+1]=y;bp[j*8+2]=z;bp[j*8+3]=Math.cos(an)*speed*(.3+u);bp[j*8+4]=speed*(.4+Math.random()*.9);bp[j*8+5]=Math.sin(an)*speed*(.3+u)*.6+speed*.3;bp[j*8+6]=.7+Math.random()*.5;bp[j*8+7]=size*(.6+Math.random()*.8);CC.set(cols[i%cols.length]);bc[j*3]=CC.r;bc[j*3+1]=CC.g;bc[j*3+2]=CC.b;}}
 function star(x:number,y:number,z:number,size:number,tone:number){const j=si++%STARS;sp[j*6]=x;sp[j*6+1]=y;sp[j*6+2]=z;sp[j*6+3]=now;sp[j*6+4]=size;sp[j*6+5]=tone;}

 /* ---- camera: the arena's own (the rules aim through the same numbers) ---- */
 let W=1,H=1,now=0,lastT=0,introT=1,shake=0,nudgeW=0;const base=new T.Vector3(),look=new T.Vector3(),nudge=new T.Vector3(),cp=new T.Vector3(),cl=new T.Vector3();
 function measure(){const v=viewFor(arena.cam,W/H);base.set(v.p[0],v.p[1],v.p[2]);look.set(v.l[0],v.l[1],v.l[2]);camera.fov=v.fov;camera.aspect=W/H;camera.position.copy(base);camera.lookAt(look);camera.updateProjectionMatrix();camera.updateMatrixWorld();}
 function resize(w:number,h:number,dpr:number){W=w;H=h;renderer.setPixelRatio(Math.min(o.mobile?1.5:2,dpr));renderer.setSize(w,h,false);comicDotCell(ink,renderer);measure();}
 function setArena(ix:number,intro=true){arena=ARENAS[((ix%ARENAS.length)+ARENAS.length)%ARENAS.length];const sk=SKY[arena.id]??SKY.training;
  backTex?.dispose();groundT?.dispose();backTex=backdropTex(arena);groundT=groundTex(arena);backMat.map=backTex;backMat.needsUpdate=true;groundMat.map=groundT;groundMat.needsUpdate=true;underMat.color.set(arena.ground[1]);
  place.geometry.dispose();place.geometry=scenery(arena);const rm=tmesh[K.runner];rm.geometry.dispose();rm.geometry=runnerModel(arena.runner);
  bg.set(arena.fog);fog.color.set(arena.fog);sun.color.set(arena.sun[0]);sun.intensity=arena.sun[1];hemi.color.set(arena.hemi[0]);hemi.groundColor.set(arena.hemi[1]);hemi.intensity=arena.hemi[2];
  ink.uInkShade.value.setRGB(sk.shade[0],sk.shade[1],sk.shade[2]);(blobs.material as T.MeshBasicMaterial).opacity=sk.blob;
  bp.fill(0);sp.fill(-9);tp.fill(-9);shake=0;nudgeW=0;measure();introT=intro&&!o.reduced?0:1;}

 function onEvent(e:PopEvent){
  switch(e.type){
   case 'pop':burst(e.x,e.y-.6,e.z+.3,e.kind===K.gold?10:5,e.kind===K.gold?['#ffc83a','#fff3d6']:['#fff3d6','#d9c7a0'],1.6,.08);if(e.kind===K.gold)star(e.x,e.y,e.z,1.2,1);break;
   case 'knock':{const big=e.kind===K.gold||e.kind===K.armour||e.a>=4;star(e.x,e.y,e.z,1.1+Math.min(1,e.a*.12)+(big?.4:0),e.a>=3?1:0);shake=Math.max(shake,big?.26:.14);nudge.set(e.x,e.y,e.z);nudgeW=1;
    const cols=e.kind===K.balloon?[TONES[e.b%5],'#ffffff']:e.kind===K.dummy||e.kind===K.armour?['#c98a4b','#8a5a2e','#fff3d6','#f0452e']:e.kind===K.peeker?['#fff3d6','#d9c7a0','#2f8fd8']:e.kind===K.gold?['#ffc83a','#fff3d6','#ffe28a']:e.kind===K.bag?['#fffaf0','#19b5a5']:['#fff3d6','#ffc83a'];
    burst(e.x,e.y,e.z,e.kind===K.balloon?18:e.kind===K.gold?26:12,cols,e.kind===K.balloon?5:3.8,e.kind===K.balloon?.1:.13);break;}
   case 'hit':star(e.x,e.y,e.z,.9,2);shake=Math.max(shake,.12);burst(e.x,e.y,e.z,8,['#cfd8dc','#ffffff','#8d93a6'],4,.1);break;
   case 'friend':shake=Math.max(shake,.2);burst(e.x,e.y,e.z,6,['#f0452e','#fff3d6'],2.5,.1);break;
   case 'multi':for(let i=0;i<3;i++)burst(e.x+(i-1)*1.4,e.y+.6,e.z,14,TONES,6,.14);star(e.x,e.y+1,e.z,2.4,1);shake=.3;break;
   case 'thud':if(e.a>.3)burst(e.x,e.y,e.z,4,['#fff3d6','#cfd8dc'],2,.07);break;
   case 'bounce':burst(e.x,.05,e.z,4,arena.groundLook==='sand'?['#f2d9a0','#e0bf85']:arena.groundLook==='grass'||arena.groundLook==='pitch'?['#7fd486','#fff3d6']:['#fff3d6','#cfd8dc'],1.6,.07);break;
   case 'flick':burst(arena.ball[0],.1,arena.ball[2],5,['#fff3d6','#d9c7a0'],2,.08);break;
   case 'power':burst(e.x,e.y,e.z,22,e.a===1?['#ffc83a','#fff3d6','#f0452e']:['#19b5a5','#fff3d6'],6,.13);break;}}

 const blobAt=(n:number,x:number,y:number,z:number,r:number)=>{if(n>=BLOBS||r<=.01)return n;SC.set(r,1,r);Q.identity();M.compose(V.set(x,y+.02,z),Q,SC);blobs.setMatrixAt(n,M);return n+1;};
 /** One target's pose: hinge flip for the hatches, slide for the side spots, spring for balloons and rails; the knock-down by kind. */
 function pose(t:PopTarget,clock:number):number{
  let x=t.x,y=t.by,z=t.z,sc=t.s,rx=0,ry=0,rz=0;const id=t.id,k=t.kind;
  const ee=t.st===2?1:easeBack(t.e);
  if(t.st!==4){
   if(t.rail>=0){sc*=Math.max(0,ee);rz=Math.sin(clock*9+id)*.06;y+=Math.abs(Math.sin(clock*9+id))*.08*t.s;}
   else if(k===K.balloon){y=t.y-KIND[k].h*t.s*.02;sc*=Math.max(0,ee);rz=Math.sin(clock*1.6+id)*.12;}
   else if(t.dir===0){rx=-(1-ee)*Math.PI/2;rz=Math.sin(clock*2.4+id)*.035;}
   else{y=t.by;rz=(t.dir===2?-1:1)*(1-Math.min(1,t.e))*.4+Math.sin(clock*2.4+id)*.035;}
   if(k===K.friend&&t.flash>0){rz+=Math.sin(clock*40)*.08*t.flash;}
  }else{const a=t.t,u=Math.min(1,a/.28),fade=a>PU.knockT-.22?Math.max(0,(PU.knockT-a)/.22):1;
   switch(k){
    case K.balloon:sc*=a<.1?1+a*3:0;y=t.y;break;
    case K.peeker:ry=a*18*(t.kx>=0?1:-1);x+=t.kx*a*7;z+=t.kz*a*7;y+=a*5-a*a*9;sc*=fade;break;
    case K.runner:rz=-a*9*(t.vx>=0?1:-1);x+=t.vx*a*.6+t.kx*a*3;y+=Math.max(0,a*4-a*a*7);sc*=fade;break;
    case K.gold:ry=a*14;y+=a*2.5;sc*=fade*(1+a*.3);break;
    case K.bag:SC.set(1,1,1);sc*=fade;rx=-u*Math.PI/2;break;
    default:{const bounce=u>=1?Math.sin(Math.min(1,(a-.28)/.3)*Math.PI)*.12:0;rx=-(u*u*Math.PI/2*1.04)+bounce;rz=-t.kx*.35*u;sc*=fade;}}}
  E.set(rx,ry,rz);Q.setFromEuler(E);SC.set(sc,sc,sc);M.compose(V.set(x,y,z),Q,SC);return sc;}

 function render(g:Popup|null,clock:number){now=clock;const dt=Math.min(.1,Math.max(0,clock-lastT));lastT=clock;
  for(const m of tmesh)if(m)m.count=0;let nb=0;
  if(g){const s=g.state;
   for(const t of s.targets){if(!t.on)continue;const m=tmesh[slotOf(t.kind,t.id)];if(!m||m.count>=m.instanceMatrix.count)continue;const i=m.count++;const sc=pose(t,clock);m.setMatrixAt(i,M);
    const c=t.kind===K.dummy?TONES[t.id%4]:t.kind===K.peeker?['#2f8fd8','#f0452e','#19b5a5'][t.id%3]:t.kind===K.armour?(t.hp>1?'#5b6072':'#f0452e'):t.kind===K.balloon?TONES[t.id%5]:'#ffffff';
    CC.set(c);if(t.flash>0)CC.lerp(WHITE_C,Math.min(1,t.flash*1.4));m.setColorAt(i,CC);
    if(t.kind!==K.balloon&&t.st!==4)nb=blobAt(nb,t.x,t.by,t.z,.7*sc*Math.max(0,Math.min(1,t.e)));}
   // balls in flight: spin along the flight, a trail, a blob shadow
   let n=0;for(let i=0;i<s.balls.length&&n<BALLS;i++){const b=s.balls[i];if(!b.on)continue;const spd=Math.hypot(b.vx,b.vy,b.vz);AX.set(b.vz,0,-b.vx);if(AX.lengthSq()>1e-6){AX.normalize();Q.setFromAxisAngle(AX,spd*dt*1.2);spin[i].premultiply(Q);}
    SC.set(.19,.19,.19);M.compose(V.set(b.x,b.y,b.z),spin[i],SC);balls.setMatrixAt(n++,M);nb=blobAt(nb,b.x,0,b.z,.26*Math.max(.35,1-b.y*.08));
    if(clock-trailAt[i]>.016){trailAt[i]=clock;const j=ti++%TRAIL;tp[j*5]=b.x;tp[j*5+1]=b.y;tp[j*5+2]=b.z;tp[j*5+3]=clock;tp[j*5+4]=s.triple>0||b.f%3===0?1:0;}}
   balls.count=n;balls.visible=n>0;if(n)balls.instanceMatrix.needsUpdate=true;
   // the rack at the spot: the next ball on the chalk mark, the others on the stand
   {const [bx,by,bz]=arena.ball;let r=0;Q.identity();const left=Math.min(RACK,s.rack);for(let i=0;i<left;i++){if(i===0)V.set(bx,by+.08,bz);else V.set(bx+.45+i*.27,.35,bz+.25);SC.set(i===0?.19:.13,i===0?.19:.13,i===0?.19:.13);M.compose(V,Q,SC);rack.setMatrixAt(r++,M);}
    if(s.triple>0)for(const d of [-.42,.42]){if(r>=RACK)break;V.set(bx+d,by+.04,bz+.1);SC.set(.16,.16,.16);M.compose(V,Q,SC);rack.setMatrixAt(r++,M);}
    rack.count=r;rack.visible=r>0;if(r)rack.instanceMatrix.needsUpdate=true;if(left>0)nb=blobAt(nb,bx,0,bz,.28);}
  }else{balls.count=0;balls.visible=false;rack.count=0;rack.visible=false;}
  for(const m of tmesh){if(!m)continue;m.visible=m.count>0;if(m.count){m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}}
  // trail
  {let n=0;Q.identity();for(let j=0;j<TRAIL;j++){const age=clock-tp[j*5+3];if(age<0||age>.32)continue;const r=.13*(1-age/.32);SC.set(r,r,r);M.compose(V.set(tp[j*5],tp[j*5+1],tp[j*5+2]),Q,SC);trail.setMatrixAt(n,M);trail.setColorAt(n,CC.set(tp[j*5+4]?'#ffc83a':'#fffaf0'));n++;}
   trail.count=n;trail.visible=n>0;if(n){trail.instanceMatrix.needsUpdate=true;trail.instanceColor!.needsUpdate=true;}}
  // bits
  {let n=0;for(let j=0;j<BITS;j++){const o8=j*8;if(bp[o8+6]<=0)continue;bp[o8+6]-=dt;bp[o8+4]-=PU.g*.8*dt;bp[o8]+=bp[o8+3]*dt;bp[o8+1]+=bp[o8+4]*dt;bp[o8+2]+=bp[o8+5]*dt;if(bp[o8+1]<.04){bp[o8+1]=.04;bp[o8+4]*=-.4;bp[o8+3]*=.6;bp[o8+5]*=.6;}
    const r=bp[o8+7]*Math.min(1,bp[o8+6]*3);E.set(bp[o8+6]*9,j,bp[o8+6]*7);Q.setFromEuler(E);SC.set(r,r,r*.4);M.compose(V.set(bp[o8],bp[o8+1],bp[o8+2]),Q,SC);bits.setMatrixAt(n,M);bits.setColorAt(n,CC.setRGB(bc[j*3],bc[j*3+1],bc[j*3+2]));n++;}
   bits.count=n;bits.visible=n>0;if(n){bits.instanceMatrix.needsUpdate=true;bits.instanceColor!.needsUpdate=true;}}
  blobs.count=nb;blobs.visible=nb>0;if(nb)blobs.instanceMatrix.needsUpdate=true;
  // camera: a fly-in from high and wide, a small nudge toward each hit, shake on big ones
  if(introT<1)introT=Math.min(1,introT+dt/1.1);const ie=1-Math.pow(1-introT,3);
  cp.copy(base);cl.copy(look);
  if(nudgeW>0&&!o.reduced){V.copy(nudge).sub(base).normalize().multiplyScalar(.22*nudgeW);cp.add(V);cl.lerp(nudge,.03*nudgeW);nudgeW=Math.max(0,nudgeW-dt*3);}
  if(ie<1){cp.y+=(1-ie)*5;cp.z+=(1-ie)*6;cp.x+=(1-ie)*(arena.id==='beach'?-3:2);}
  if(shake>0&&!o.reduced){cp.x+=Math.sin(clock*71)*shake*.3;cp.y+=Math.cos(clock*93)*shake*.3;shake=Math.max(0,shake-dt*1.6);}
  camera.position.copy(cp);camera.lookAt(cl);aimComicSun(ink,toSun,camera);
  // stars (face the camera)
  {let n=0;for(let j=0;j<STARS;j++){const age=now-sp[j*6+3];if(age<0||age>.42)continue;const u=age/.42,r=sp[j*6+4]*(u<.25?u/.25:1-(u-.25)/.75*.5),d=Math.max(.3,camera.position.distanceTo(V.set(sp[j*6],sp[j*6+1],sp[j*6+2]))*.07);Q.copy(camera.quaternion);E.set(0,0,j*1.3+u*.5);Q2.setFromEuler(E);Q.multiply(Q2);
    SC.set(r*d*1.25,r*d*1.25,1);M.compose(V,Q,SC);stars.setMatrixAt(n,M);stars.setColorAt(n++,CC.set(COMIC_INK));SC.set(r*d,r*d,1);M.compose(V,Q,SC);stars.setMatrixAt(n,M);stars.setColorAt(n++,CC.set(['#fff3d6','#ffc83a','#ffffff'][sp[j*6+5]]));}
   stars.count=n;stars.visible=n>0;if(n){stars.instanceMatrix.needsUpdate=true;stars.instanceColor!.needsUpdate=true;}}
  renderer.render(scene,camera);}

 return {resize,render,setArena,onEvent,
  /** True while the fly-in, a nudge, a shake or bits are still moving (the shell keeps drawing on a card). */
  busy:()=>introT<1,
  get arena(){return arena;},
  /** World -> stage px (for the score words). */
  project(x:number,y:number,z:number){V.set(x,y,z).project(camera);return {x:(V.x+1)/2*W,y:(1-V.y)/2*H,on:V.z<1};},
  info:()=>({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,textures:renderer.info.memory.textures,geometries:renderer.info.memory.geometries,programs:renderer.info.programs?.length??0}),
  dispose(){backTex?.dispose();groundT?.dispose();place.geometry.dispose();for(const m of tmesh)if(m){m.geometry.dispose();m.dispose();}for(const m of [blobs,trail,bits,stars,balls,rack])m.dispose();for(const x of owned)x.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();},
 };
}
void COMIC_PAPER;
