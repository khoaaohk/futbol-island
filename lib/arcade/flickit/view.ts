/**
 * Flick It drawing (Nov 21 2026, docs/arcade-aaa/flickit-direction.md): one three.js scene in the arcade's comic print style
 * (lib/arcade/comic: banded light, violet halftone shade, ink hulls baked into the geometry). Six places on the island, each with its
 * own camera: the place (scenery + every thing that never moves: walls, fences, posts, goal frames, poles) is baked into ONE
 * vertex-colour mesh when the stage loads; a painted ground sheet and a painted backdrop (the island coast) sit behind it.
 * Everything that moves is instanced: one draw per target kind, plus the ball, its trail, blob shadows, bits, stars and the aim ghost.
 * Heat (AGENTS.md): low-power context, pixel ratio 1.5 on phones (2 on desktop), ONE sun + a hemisphere, NO shadow map (blob
 * shadows), no post-processing, fixed pools, nothing allocated per frame; the shell draws only while playing (30 fps on phones).
 * The view makes its own canvas and frees everything in dispose().
 */
import * as T from 'three';
import {createComicUniforms,comicDotCell,aimComicSun,comicMaterial,COMIC_INK,COMIC_PAPER} from '../comic/shading';
import {inkedPart,partAt,bakeParts,comicStarGeometry} from '../comic/ink';
import {paintComicCoast,type ComicCoastPalette} from '../comic/backdrop';
import {FK,K,type FlickIt,type FlickEvent,type FlickCam,type StageDef,type Ent} from './core';

export const FLICK_COLORS={sun:'#ffc83a',red:'#f0452e',teal:'#19b5a5',paper:COMIC_PAPER,ink:COMIC_INK,blue:'#2f8fd8',pink:'#ff65c8'};
const TONES=['#f0452e','#19b5a5','#ffc83a','#2f8fd8','#ff65c8','#fff3d6'];
type Parts=T.BufferGeometry[];
const box=(w:number,h:number,d:number)=>new T.BoxGeometry(w,h,d),cyl=(r0:number,r1:number,h:number,n=10)=>new T.CylinderGeometry(r0,r1,h,n),sph=(r:number,n=10)=>new T.SphereGeometry(r,n,Math.max(5,n-3)),cone=(r:number,h:number,n=8)=>new T.ConeGeometry(r,h,n);
function P(o:Parts,g:T.BufferGeometry,c:string,x:number,y:number,z:number,ry=0,rz=0,ink=.035,round=false){inkedPart(o,g,c,partAt(x,y,z,ry,rz),ink,round);}
const seeded=(s:number)=>{let r=s;return()=>{r=(r*16807)%2147483647;return r/2147483647;};};
function canvasTex(w:number,h:number,paint:(g:CanvasRenderingContext2D)=>void){const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d')!);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}

/* ---- the look of each place ---- */
type Place={sky:Partial<ComicCoastPalette>;sunX:number;fog:string;ground:string;sunI:number;hemi:string;hemiG:string;hemiI:number;shade:[number,number,number];blob:number};
const DAY:Partial<ComicCoastPalette>={top:'#58b6e8',mid:'#8fd4ee',haze:'#d6f1f5',sunCore:'#fffbe0',sunRing:'#fff1b0',sunRing2:'#ffe28a',cloudLit:'#ffffff',cloudShade:'#cfe6f2',headA:'#3f8f6a',headB:'#6fb880',seaFar:'#2b8fc0',seaNear:'#27b0b0'};
const PLACES:Record<string,Place>={
 garden:{sky:DAY,sunX:.7,fog:'#d6f1f5',ground:'#57b85f',sunI:2.6,hemi:'#ffffff',hemiG:'#a79bb5',hemiI:.55,shade:[.55,.47,.74],blob:.3},
 plaza:{sky:{...DAY,top:'#f29a5c',mid:'#f8be7a',haze:'#ffe0a8',cloudLit:'#fff0cc',cloudShade:'#f2a58a',headA:'#8a5a80',headB:'#c98a90'},sunX:.36,fog:'#ffe0b4',ground:'#e3b98a',sunI:2.5,hemi:'#ffe6cc',hemiG:'#9a7a9a',hemiI:.6,shade:[.62,.44,.66],blob:.3},
 pitch:{sky:{...DAY,top:'#4aa8e0',mid:'#86cdea'},sunX:.2,fog:'#cfeef2',ground:'#4fae5a',sunI:2.6,hemi:'#ffffff',hemiG:'#a79bb5',hemiI:.55,shade:[.55,.47,.74],blob:.3},
 beach:{sky:{...DAY,top:'#3aa6e6',mid:'#7fd2f0',haze:'#e8f8f0'},sunX:.55,fog:'#dff5f0',ground:'#f0d59a',sunI:2.8,hemi:'#ffffff',hemiG:'#c9b08a',hemiI:.6,shade:[.62,.5,.7],blob:.26},
 roof:{sky:{top:'#7a4a9a',mid:'#e9825c',haze:'#ffcf7a',sunCore:'#fff1b0',sunRing:'#ffc24a',sunRing2:'#ff8a3c',cloudLit:'#ffe1b0',cloudShade:'#d9707a',headA:'#5a3a70',headB:'#9a5a80',seaFar:'#3a5a9a',seaNear:'#2a7a96'},sunX:.44,fog:'#f2b48a',ground:'#6a6478',sunI:2.4,hemi:'#ffd0b0',hemiG:'#7a5a8a',hemiI:.62,shade:[.5,.36,.66],blob:.3},
 stadium:{sky:{top:'#0e1238',mid:'#1c2460',haze:'#33408a',sunCore:'#f6f2dc',sunRing:'#cdd8ff',sunRing2:'#7d8ad6',cloudLit:'#4b5594',cloudShade:'#2e3570',headA:'#141a44',headB:'#1f2658',seaFar:'#141a44',seaNear:'#141a44'},sunX:.82,fog:'#232a62',ground:'#2f7a4a',sunI:2.2,hemi:'#aab6ff',hemiG:'#2a2448',hemiI:.75,shade:[.4,.38,.75],blob:.4},
};

/** The backdrop: the house comic coast (banded sky, sun, clouds, headlands, sea) with each place's own skyline inked over it. */
function backdropTex(place:string){const W=2048,H=512,hz=.845,p=PLACES[place];return canvasTex(W,H,g=>{
 paintComicCoast(g,W,H,{width:W,height:H,sunX:p.sunX,horizon:hz,palette:p.sky,seed:place.length*13+7});const y0=H*hz,rnd=seeded(place.charCodeAt(0)*31+5);g.lineJoin='round';
 const ink=(w=3)=>{g.lineWidth=w;g.strokeStyle=COMIC_INK;g.stroke();};
 if(place==='stadium'){// stands all round, a crowd of dots, floodlights with halos
  for(let tier=0;tier<3;tier++){const top=y0-150+tier*46,bot=top+52;g.fillStyle=['#1d2456','#252d68','#2d367a'][tier];g.beginPath();g.moveTo(0,bot);g.lineTo(0,top+10);for(let x=0;x<=W;x+=64)g.lineTo(x,top+Math.sin(x/260+tier)*8);g.lineTo(W,bot);g.closePath();g.fill();ink(3);
   for(let i=0;i<1500;i++){const x=rnd()*W,y=top+14+rnd()*34;g.fillStyle=TONES[Math.floor(rnd()*6)];g.globalAlpha=.55+rnd()*.4;g.fillRect(x,y,4,5);}g.globalAlpha=1;}
  g.fillStyle='#f0452e';g.fillRect(0,y0-14,W,16);g.fillStyle='#fff3d6';for(let x=20;x<W;x+=170){g.fillRect(x,y0-11,96,10);}g.fillStyle='#14183c';g.fillRect(0,y0+2,W,H-y0);
  for(const fx of [.14,.38,.62,.86]){const x=fx*W,y=y0-250;const gr=g.createRadialGradient(x,y,4,x,y,120);gr.addColorStop(0,'rgba(255,250,220,.95)');gr.addColorStop(.25,'rgba(205,216,255,.4)');gr.addColorStop(1,'rgba(205,216,255,0)');g.fillStyle=gr;g.fillRect(x-120,y-120,240,240);
   g.fillStyle='#0c0f2c';g.fillRect(x-4,y,8,110);g.fillStyle='#fffbe0';g.beginPath();g.rect(x-34,y-14,68,26);g.fill();ink(3);}
 }else{// a line of roofs, trees or palms along the horizon
  const town=place==='plaza'||place==='roof',n=place==='beach'?14:town?46:30;
  for(let i=0;i<n;i++){const x=(i+.2+rnd()*.6)/n*W,s=.7+rnd()*.7;
   if(place==='beach'){g.strokeStyle='#7a5a3a';g.lineWidth=7*s;g.beginPath();g.moveTo(x,y0+4);g.quadraticCurveTo(x+10*s,y0-40*s,x+22*s,y0-76*s);g.stroke();g.fillStyle='#2f9a5a';for(let l=0;l<6;l++){const a=l/6*Math.PI*2+rnd();g.beginPath();g.ellipse(x+22*s+Math.cos(a)*22*s,y0-76*s+Math.sin(a)*9*s,26*s,7*s,a*.4,0,7);g.fill();ink(2);}}
   else if(town){const w=34+rnd()*40,h=(place==='roof'?50:36)+rnd()*(place==='roof'?120:60);g.fillStyle=place==='roof'?['#4a3a6a','#5a4478','#3a2f58'][i%3]:['#ffd9a8','#f7b58a','#fff3d6','#f2957a','#bfe9f5'][i%5];g.beginPath();g.rect(x-w/2,y0-h,w,h+4);g.fill();ink(3);
    g.fillStyle=place==='roof'?'#ffc83a':'#7a5a80';for(let wy=y0-h+10;wy<y0-10;wy+=18)for(let wx=x-w/2+7;wx<x+w/2-10;wx+=14)if(rnd()<.6)g.fillRect(wx,wy,7,9);
    if(place==='plaza'){g.fillStyle=['#f0452e','#d9604f','#c9584a'][i%3];g.beginPath();g.moveTo(x-w/2-5,y0-h);g.lineTo(x,y0-h-18-rnd()*12);g.lineTo(x+w/2+5,y0-h);g.closePath();g.fill();ink(3);}}
   else{g.fillStyle=['#2f8a52','#3c9a5c','#278048'][i%3];g.beginPath();g.ellipse(x,y0-26*s,30*s,34*s,0,0,7);g.fill();ink(3);g.fillStyle='#7a5a3a';g.fillRect(x-3,y0-6,6,10);}}
  g.fillStyle=p.ground;g.fillRect(0,y0+3,W,H-y0);g.beginPath();g.moveTo(0,y0+3);g.lineTo(W,y0+3);ink(3);}
});}

/** The ground sheet, 64 m x 64 m (x -32..32, z -50..14: the far end is the top of the canvas), 16 px a metre. */
function groundTex(place:string,ents:readonly Ent[]){const S=16,W=64*S;return canvasTex(W,W,g=>{const X=(x:number)=>(x+32)*S,Z=(z:number)=>(z+50)*S,rnd=seeded(place.length*97+3);
 const line=(x0:number,z0:number,x1:number,z1:number)=>{g.beginPath();g.moveTo(X(x0),Z(z0));g.lineTo(X(x1),Z(z1));g.stroke();};
 const flecks=(n:number,a:string,b:string,len=3)=>{for(let i=0;i<n;i++){g.fillStyle=rnd()<.5?a:b;g.fillRect(rnd()*W,rnd()*W,1.5+rnd(),len+rnd()*len);}};
 if(place==='garden'||place==='pitch'||place==='stadium'){const night=place==='stadium',A=night?['#2c7848','#32844f']:place==='pitch'?['#49ad57','#55b962']:['#55b85e','#61c46a'];
  for(let i=0;i<16;i++){g.fillStyle=A[i%2];g.fillRect(0,i*4*S,W,4*S);}flecks(9000,'rgba(30,70,30,.16)','rgba(255,255,220,.12)');
  if(place==='garden'){for(let i=0;i<260;i++){const x=rnd()*W,y=rnd()*W;g.fillStyle=rnd()<.5?'#fff3d6':'#ffc83a';g.beginPath();g.arc(x,y,2+rnd()*1.5,0,7);g.fill();}
   g.fillStyle='rgba(150,110,60,.5)';g.beginPath();g.ellipse(X(0),Z(-.2),1.6*S,1.1*S,0,0,7);g.fill();g.fillStyle='#d9c7a0';for(let i=0;i<9;i++){g.beginPath();g.ellipse(X(-8.5+Math.sin(i)*.3),Z(4-i*2.6),.7*S,.5*S,i,0,7);g.fill();}}
  else{g.strokeStyle=night?'#dfe8ff':'#fff3d6';g.lineWidth=.14*S;g.lineCap='round';const gl=ents.find(e=>e.k===K.goal),gx=gl?gl.x:0,gz=gl?gl.z:-18;
   line(-30,gz,30,gz);line(gx-9,gz,gx-9,gz+7.5);line(gx+9,gz,gx+9,gz+7.5);line(gx-9,gz+7.5,gx+9,gz+7.5);line(gx-4.4,gz,gx-4.4,gz+2.6);line(gx+4.4,gz,gx+4.4,gz+2.6);line(gx-4.4,gz+2.6,gx+4.4,gz+2.6);
   g.beginPath();g.arc(X(gx),Z(gz+5),.2*S,0,7);g.fillStyle=g.strokeStyle as string;g.fill();g.beginPath();g.arc(X(gx),Z(gz+5),4.2*S,Math.PI*.2,Math.PI*.8);g.stroke();line(-30,gz+22,30,gz+22);
   g.fillStyle='rgba(255,243,214,.9)';g.beginPath();g.arc(X(0),Z(0),.3*S,0,7);g.fill();}}
 else if(place==='plaza'){g.fillStyle='#e6bd8e';g.fillRect(0,0,W,W);for(let i=0;i<43;i++)for(let j=0;j<43;j++){g.fillStyle=['#e9c497','#deb284','#f0cfa4','#d9a878'][(i*7+j*3+((i*j)%3))%4];g.fillRect(i*1.5*S+1,j*1.5*S+1,1.5*S-2,1.5*S-2);}
  g.strokeStyle='#b8845a';g.lineWidth=.35*S;for(const r of [5,9.5]){g.beginPath();g.arc(X(0),Z(-22),r*S,0,7);g.stroke();}g.fillStyle='#c9925f';g.beginPath();g.arc(X(0),Z(-22),4.2*S,0,7);g.fill();flecks(2500,'rgba(120,80,50,.14)','rgba(255,255,255,.14)',2);
  g.strokeStyle='#fff3d6';g.lineWidth=.12*S;g.setLineDash([10,10]);g.beginPath();g.arc(X(0),Z(0),1.2*S,0,7);g.stroke();g.setLineDash([]);}
 else if(place==='beach'){g.fillStyle='#f2d9a0';g.fillRect(0,0,W,W);for(let i=0;i<70;i++){g.strokeStyle=i%2?'rgba(214,170,110,.5)':'rgba(255,246,214,.6)';g.lineWidth=2+rnd()*2;g.beginPath();const y=rnd()*W,x=rnd()*W;g.moveTo(x,y);g.bezierCurveTo(x+40,y-8,x+90,y+8,x+140+rnd()*80,y);g.stroke();}
  flecks(4000,'rgba(190,140,80,.25)','rgba(255,255,255,.3)',1.5);g.fillStyle='#e0bf85';g.fillRect(0,Z(-32.5),W,2.5*S);g.fillStyle='#bfeee6';g.fillRect(0,0,W,Z(-32.5));g.fillStyle='#27b0b0';g.fillRect(0,0,W,Z(-34));g.fillStyle='#fff';for(let x=0;x<W;x+=22)g.fillRect(x+rnd()*8,Z(-33.4)+rnd()*6,14,3);
  g.fillStyle='rgba(170,120,70,.45)';for(let i=0;i<10;i++){g.beginPath();g.ellipse(X(-1.2+(i%2)*.5),Z(9-i*.9),.14*S,.24*S,0,0,7);g.fill();}}
 else{g.fillStyle='#5f5a6e';g.fillRect(0,0,W,W);flecks(5000,'rgba(0,0,0,.14)','rgba(255,255,255,.08)',2);g.fillStyle='#2f9a8f';g.fillRect(X(-9),Z(-26),18*S,32*S);g.fillStyle='#38ada0';g.fillRect(X(-6),Z(-14),12*S,10*S);
  g.strokeStyle='#fff3d6';g.lineWidth=.14*S;g.strokeRect(X(-9),Z(-26),18*S,32*S);line(-9,-10,9,-10);g.beginPath();g.arc(X(0),Z(-10),3*S,0,7);g.stroke();g.strokeRect(X(-4),Z(-26),8*S,6*S);
  g.fillStyle='#4a4558';for(let i=0;i<8;i++)g.fillRect(X(-30+i*8),0,.3*S,W);}
});}

/** The ball: paper white with ink patches and one red and one teal panel, so the spin reads. */
function ballTex(){return canvasTex(256,128,g=>{g.fillStyle='#fffaf0';g.fillRect(0,0,256,128);const spot=(u:number,v:number,r:number,c:string)=>{for(const du of [-256,0,256]){g.fillStyle=c;g.beginPath();g.ellipse(u*256+du,v*128,r/Math.max(.35,Math.sin(v*Math.PI)),r,0,0,7);g.fill();}};
 for(let i=0;i<5;i++){spot(i/5+.1,.3,11,i===0?'#f0452e':COMIC_INK);spot(i/5,.7,11,i===2?'#19b5a5':COMIC_INK);}spot(.5,.02,16,COMIC_INK);spot(.5,.98,16,COMIC_INK);});}
function blobTex(){return canvasTex(64,64,g=>{const r=g.createRadialGradient(32,32,2,32,32,31);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.6,'rgba(255,255,255,.75)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);});}
function netTex(){const t=canvasTex(64,64,g=>{g.clearRect(0,0,64,64);g.strokeStyle='#fffaf0';g.lineWidth=3;for(let i=0;i<=64;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i,64);g.moveTo(0,i);g.lineTo(64,i);g.stroke();}});t.wrapS=t.wrapT=T.RepeatWrapping;return t;}

/* ---- target models (unit-size, origin at the collider's centre; white parts take the instance colour) ---- */
const WHITE='#ffffff';
function modelFor(k:number):T.BufferGeometry{const o:Parts=[];switch(k){
 case K.can:P(o,cyl(.16,.16,.4,10),WHITE,0,0,0,0,0,.03,true);P(o,cyl(.165,.165,.1,10),'#fff3d6',0,.02,0,0,0,0,true);P(o,cyl(.13,.13,.02,10),'#cfd8dc',0,.2,0,0,0,0,true);break;
 case K.crate:P(o,box(.68,.68,.68),'#c98a4b',0,0,0,0,0,.04);for(const s of [-1,1]){P(o,box(.7,.1,.7),'#8a5a2e',0,s*.27,0,0,0,0);P(o,box(.1,.5,.7),'#a8703a',s*.27,0,0,0,0,0);}P(o,box(.5,.08,.71),'#8a5a2e',0,0,0,0,.78,0);break;
 case K.bottle:P(o,cyl(.11,.11,.36,9),WHITE,0,-.1,0,0,0,.028,true);P(o,cyl(.045,.11,.12,9),WHITE,0,.14,0,0,0,.028,true);P(o,cyl(.05,.05,.07,8),'#fff3d6',0,.24,0,0,0,.02,true);P(o,cyl(.114,.114,.12,9),'#fff3d6',0,-.1,0,0,0,0,true);break;
 case K.cone:P(o,box(.4,.05,.4),'#ff8a3c',0,-.215,0,0,0,.03);P(o,cyl(.03,.16,.44,9),'#ff8a3c',0,.02,0,0,0,.03,true);P(o,cyl(.075,.105,.1,9),'#fff3d6',0,.05,0,0,0,0,true);break;
 case K.barrel:P(o,cyl(.42,.42,1.2,12),WHITE,0,0,0,0,0,.045,true);for(const y of [-.36,.36])P(o,cyl(.44,.44,.08,12),'#fff3d6',0,y,0,0,0,0,true);P(o,cyl(.34,.34,.03,12),'#231a2e',0,.6,0,0,0,0,true);break;
 case K.balloon:P(o,sph(.44,12),WHITE,0,0,0,0,0,.03,true);P(o,cone(.08,.12,6),WHITE,0,-.47,0,0,0,0,true);P(o,box(.015,.9,.015),COMIC_INK,0,-.95,0,0,0,0);P(o,sph(.1,6),'#ffffff',-.14,.16,.34,0,0,0,true);break;
 case K.hoop:{const g=new T.TorusGeometry(1,.085,7,22),h=new T.TorusGeometry(1,.125,6,22);inkedPart(o,g,(t)=>Math.floor(t/28)%2?'#ffffff':'#e8e2d4',new T.Matrix4(),0);const hi=h.toNonIndexed();h.dispose();hi.deleteAttribute('uv');const p=hi.attributes.position.array as Float32Array;for(let i=0;i<p.length;i+=9){const a=p[i+3],b=p[i+4],c=p[i+5];p[i+3]=p[i+6];p[i+4]=p[i+7];p[i+5]=p[i+8];p[i+6]=a;p[i+7]=b;p[i+8]=c;}hi.deleteAttribute('normal');hi.computeVertexNormals();const col=new Float32Array(p.length),ic=new T.Color(COMIC_INK);for(let i=0;i<p.length;i+=3){col[i]=ic.r;col[i+1]=ic.g;col[i+2]=ic.b;}hi.setAttribute('color',new T.BufferAttribute(col,3));o.push(hi);break;}
 case K.tyre:{const g=new T.TorusGeometry(1,.3,8,18);inkedPart(o,g,(t)=>Math.floor(t/16)%3===0?'#5b5266':'#3a3340',new T.Matrix4(),0);break;}
 case K.bin:P(o,cyl(.55,.47,1.1,12),WHITE,0,0,0,0,0,.045,true);P(o,cyl(.6,.6,.09,12),'#fff3d6',0,.52,0,0,0,.03,true);P(o,cyl(.5,.5,.03,12),'#231a2e',0,.57,0,0,0,0,true);P(o,box(.5,.3,.03),'#fff3d6',0,-.05,.5,0,0,0);break;
 case K.bell:P(o,sph(.3,10),'#ffc83a',0,.08,0,0,0,.035,true);P(o,cyl(.3,.42,.34,10),'#ffc83a',0,-.14,0,0,0,.035,true);P(o,sph(.1,6),'#8a5a2e',0,-.36,0,0,0,.02,true);P(o,box(.08,.2,.08),'#8a5a2e',0,.44,0,0,0,.02);break;
 case K.shutter:P(o,box(.9,1,.07),WHITE,0,0,0,0,0,.035);for(let i=0;i<5;i++)P(o,box(.72,.07,.09),'#fff3d6',0,-.36+i*.18,0,0,0,0);break;
 case K.sign:P(o,cyl(.5,.5,.07,16).rotateX(Math.PI/2),'#f0452e',0,0,0,0,0,.035,false);P(o,cyl(.4,.4,.09,16).rotateX(Math.PI/2),'#fff3d6',0,0,0,0,0,0);P(o,box(.34,.2,.12),COMIC_INK,-.04,-.02,0,0,0,0);P(o,box(.2,.09,.12),COMIC_INK,.2,.06,0,0,0,0);P(o,cyl(.07,.07,.13,8).rotateX(Math.PI/2),'#ffc83a',-.06,-.02,0,0,0,0);break;
 case K.trolley:P(o,box(1.8,.7,1),'#fff3d6',0,-.05,0,0,0,.04);P(o,box(1.84,.16,1.04),WHITE,0,.02,0,0,0,0);for(const s of [-1,1]){P(o,cyl(.2,.2,.1,10).rotateX(Math.PI/2),COMIC_INK,s*.6,-.38,.52,0,0,.02);P(o,box(.05,.6,.05),'#8d93a6',s*.8,.6,0,0,0,.015);}
  for(let i=0;i<5;i++)P(o,box(.4,.08,1.2),i%2?'#fff3d6':WHITE,-.8+i*.4,.92,0,0,0,i?0:.03);P(o,sph(.2,8),'#ff65c8',-.3,.42,0,0,0,.025,true);P(o,sph(.2,8),'#fff3d6',.3,.42,0,0,0,.025,true);break;
 case K.keeper:P(o,box(.7,.8,.4),'#19b5a5',0,-.05,0,0,0,.04);P(o,box(.5,.42,.4),'#cfd8dc',0,.58,0,0,0,.035);P(o,box(.34,.1,.06),COMIC_INK,0,.6,.21,0,0,0);P(o,box(.12,.12,.08),'#ffc83a',-.1,.64,.24,0,0,0);P(o,box(.12,.12,.08),'#ffc83a',.1,.64,.24,0,0,0);
  for(const s of [-1,1]){P(o,box(.5,.16,.16),'#cfd8dc',s*.56,.2,0,0,s*.5,.025);P(o,box(.26,.3,.2),'#ffc83a',s*.84,.38,0,0,0,.03);P(o,box(.2,.5,.24),'#5b6072',s*.2,-.62,0,0,0,.03);}P(o,cyl(.03,.03,.2,6),'#f0452e',0,.88,0,0,0,.015,true);P(o,sph(.07,6),'#f0452e',0,1,0,0,0,.015,true);break;
 default:/* mannequin */P(o,box(.56,1.25,.14),'#ffc83a',0,-.1,0,0,0,.04);P(o,cyl(.2,.2,.14,10).rotateX(Math.PI/2),'#ffc83a',0,.68,0,0,0,.04);P(o,box(.5,.12,.4),'#5b6072',0,-.84,0,0,0,.03);P(o,box(.4,.08,.15),'#f0452e',0,.2,0,0,0,0);
 }return bakeParts(o);}

/* ---- scenery: the place, baked with every thing that never moves ---- */
function scenery(place:string,ents:readonly Ent[]):T.BufferGeometry{const o:Parts=[],rnd=seeded(place.length*53+11);
 const B=(c:string,x:number,y:number,z:number,w:number,h:number,d:number,ry=0,ink=.05)=>P(o,box(w,h,d),c,x,y,z,ry,0,ink);
 const Cy=(c:string,x:number,y:number,z:number,r:number,h:number,ink=.05,r1=r)=>P(o,cyl(r1,r,h,10),c,x,y,z,0,0,ink,true);
 const tree=(x:number,z:number,s=1)=>{Cy('#8a5a2e',x,1.1*s,z,.22*s,2.2*s);P(o,sph(1.3*s,8),'#2f9a5a',x,3*s,z,0,0,.07,true);P(o,sph(.9*s,7),'#3fae68',x+.8*s,2.5*s,z+.3,0,0,.06,true);P(o,sph(.9*s,7),'#27884c',x-.8*s,2.6*s,z-.2,0,0,.06,true);};
 const palm=(x:number,z:number,s=1)=>{for(let i=0;i<4;i++)Cy(i%2?'#a8703a':'#8a5a2e',x+i*.22*s,(.6+i*1.2)*s,z,.2*s,1.25*s,.045);const tx=x+.8*s,ty=5*s;for(let l=0;l<6;l++){const a=l/6*Math.PI*2;P(o,box(2.4*s,.07,.6*s),l%2?'#2f9a5a':'#3fae68',tx+Math.cos(a)*1.1*s,ty-.25*s,z+Math.sin(a)*1.1*s,-a,-.35,.04);}P(o,sph(.2*s,6),'#8a5a2e',tx,ty-.3*s,z+.2,0,0,.03,true);};
 const house=(x:number,z:number,w:number,h:number,d:number,wall:string,roof:string,ry=0)=>{B(wall,x,h/2,z,w,h,d,ry,.07);P(o,cyl(.01,w*.78,h*.5,4).rotateY(Math.PI/4),roof,x,h+h*.25,z,ry,0,.07,true);B('#7a5a80',x-w*.22,h*.55,z+d/2+.02,w*.2,h*.26,.06,ry,.03);B('#7a5a80',x+w*.22,h*.55,z+d/2+.02,w*.2,h*.26,.06,ry,.03);B('#8a5a2e',x,h*.22,z+d/2+.02,w*.16,h*.44,.06,ry,.03);};
 const flags=(x0:number,x1:number,y:number,z:number,n:number)=>{B(COMIC_INK,(x0+x1)/2,y+.22,z,x1-x0,.03,.03,0,0);for(let i=0;i<n;i++)P(o,cone(.2,.42,3).rotateX(Math.PI),TONES[i%5],x0+(i+.5)/n*(x1-x0),y-.02,z,0,0,.025,true);};
 const lamp=(x:number,z:number,h=4.4)=>{Cy('#5b6072',x,h/2,z,.09,h,.035);B('#fff3d6',x,h+.12,z,.5,.26,.5,0,.035);};
 switch(place){
 case 'garden':{for(let i=0;i<34;i++){const x=-17+i,h=2.1+((i*7)%5)*.08;B(i%2?'#d9a25f':'#c98a4b',x,h/2,-19,.92,h,.12,0,.04);}B('#8a5a2e',0,1.5,-18.9,34,.14,.1,0,0);
  for(const s of [-1,1])for(let i=0;i<9;i++)P(o,sph(1.4,7),i%2?'#2f9a5a':'#3fae68',s*(10.5+((i*3)%2)*.5),.9,3-i*2.7,0,0,.07,true);
  house(-13,-25,9,5,6,'#fff3d6','#f0452e');house(13.5,-27,8,4.4,6,'#bfe9f5','#d9604f');tree(7.5,-16.5,1.25);tree(-8.4,-15,1);
  B('#8a5a2e',-7,1.3,-12.6,2.2,2.6,1.8,0,.06);P(o,cyl(.01,1.8,1,4).rotateY(Math.PI/4),'#5b6072',-7,3.05,-12.6,0,0,.06,true);
  for(const x of [5.2,9.2])Cy('#cfd8dc',x,1.35,-14.5,.06,2.7,.03);B(COMIC_INK,7.2,2.6,-14.5,4,.03,.03,0,0);['#f0452e','#19b5a5','#ffc83a','#2f8fd8'].forEach((c,i)=>{B(c,5.9+i*.86,2.2,-14.5,.62,.74,.05,0,.03);B('#fff3d6',5.9+i*.86,2.3,-14.47,.2,.2,.03,0,0);});
  for(let i=0;i<7;i++)P(o,sph(.26,6),['#ff65c8','#ffc83a','#f0452e'][i%3],-9.6+rnd()*.6,.3,-2-i*1.5,0,0,.03,true);break;}
 case 'plaza':{const cols=['#ffd9a8','#f7b58a','#fff3d6','#f2957a','#bfe9f5','#ffe6a0'];for(let i=0;i<9;i++){const x=-22+i*5.5,h=6+((i*5)%4)*1.3;B(cols[i%6],x,h/2,-30,5.2,h,5,0,.09);B(['#f0452e','#19b5a5','#ffc83a'][i%3],x,2.9,-27.2,4.4,.2,1.2,0,.05);for(let w=0;w<3;w++){B('#7a5a80',x-1.5+w*1.5,h-1.4,-27.45,.8,1.1,.08,0,.035);B('#8a5a2e',x-1.5+w*1.5,1.2,-27.45,.9,2,.08,0,.035);}}
  for(const s of [-1,1])for(let i=0;i<4;i++){const z=-2-i*6.4,h=5.5+((i*3)%3)*1.2;B(cols[(i+s+3)%6],s*15,h/2,z,5,h,6,0,.09);B(['#19b5a5','#f0452e'][i%2],s*12.2,2.8,z,1.1,.18,4.6,0,.05);B('#7a5a80',s*12.45,h-1.5,z,.08,1.1,1,0,.035);}
  Cy('#cfd8dc',0,.3,-22,3.2,.6,.07);Cy('#8fd4ee',0,.62,-22,2.9,.06,0);Cy('#cfd8dc',0,1.2,-22,.4,1.8,.05);Cy('#cfd8dc',0,2.1,-22,1.3,.2,.05,.9);P(o,sph(.4,8),'#19b5a5',0,2.6,-22,0,0,.04,true);
  flags(-12,12,6.2,-20,16);flags(-12,12,5.6,-9,16);for(const [x,z] of [[-8,-17],[8,-18],[-9,-4],[9.5,-5]])lamp(x,z);
  for(const [x,z,c] of [[7.5,-13,'#f0452e'],[-8.5,-7.5,'#19b5a5'],[8.6,-8.4,'#ffc83a']] as const){Cy('#fff3d6',x,.74,z,.6,.06,.03);Cy('#5b6072',x,.37,z,.06,.74,.02);Cy('#8a5a2e',x,1.3,z,.04,2.6,.02);P(o,cone(1.3,.6,8),c,x,2.7,z,0,0,.05,true);}
  B('#8a5a2e',0,5.4,-13,.9,.9,.5,0,.05);break;}
 case 'pitch':{B('#fff3d6',-6,2,-33,22,4,5,0,.09);B('#f0452e',-6,4.3,-32.6,23,.6,6,0,.07);for(let i=0;i<7;i++)B('#7a5a80',-15+i*3,2.3,-30.45,1.6,1.2,.08,0,.035);B('#19b5a5',-6,.9,-30.4,3,1.8,.1,0,.04);
  for(let i=0;i<7;i++)tree(-26+i*4.2+rnd(),-27-rnd()*3,1.2+rnd()*.4);for(let i=0;i<4;i++)tree(14+i*4,-30-rnd()*2,1.3);
  for(const x of [-16,14]){Cy('#8d93a6',x,5,-26,.16,10,.05);B('#fff3d6',x,10.2,-26,2.2,1.1,.4,0,.05);}
  B('#2f8fd8',11,1,-12,1.6,2,5,0,.07);B('#bfe9f5',10.2,1.2,-12,.1,1.2,4.4,0,.03);B('#8a5a2e',10.4,.4,-12,.5,.12,4.2,0,.03);
  for(let i=0;i<5;i++)P(o,sph(.24,7),'#fffaf0',-9.2+rnd()*1.4,.24,-2.5-rnd()*1.6,0,0,.028,true);B('#f0452e',-8.6,.3,-4.4,1.6,.6,1,0,.04);
  for(const x of [-18,17]){Cy('#fff3d6',x,.9,-16,.04,1.8,.02);B('#f0452e',x+.3,1.55,-16,.6,.4,.03,0,.02);}
  for(let i=0;i<24;i++)B(TONES[i%5],-23+i*2,.5,-22.5,1.9,1,.14,0,.04);break;}
 case 'beach':{for(const [x,z,s] of [[-9,-20,1.25],[9.5,-23,1.4],[-12.5,-9,1.1],[12,-11,1.15],[-5,-27,1.2],[5.5,-28,1.05]] as const)palm(x,z,s);
  ['#f0452e','#19b5a5','#ffc83a','#2f8fd8'].forEach((c,i)=>{const x=-15+i*3.1;B('#fff3d6',x,1.3,-25.5,2.6,2.6,2.6,0,.06);for(let k=0;k<3;k++)B(c,x-.86+k*.86,1.3,-24.18,.43,2.6,.05,0,0);P(o,cyl(.01,2.1,1.1,4).rotateY(Math.PI/4),c,x,3.15,-25.5,0,0,.06,true);});
  for(const [x,z,c] of [[9,-6,'#f0452e'],[-9.5,-15,'#ffc83a'],[12.5,-18,'#19b5a5']] as const){Cy('#8a5a2e',x,1.2,z,.05,2.4,.02);P(o,cone(1.5,.7,8),c,x,2.6,z,0,0,.05,true);B(c==='#f0452e'?'#19b5a5':'#f0452e',x+.7,.06,z+.9,.9,.08,1.9,.4,.03);}
  B('#2f8fd8',14,.5,-31,4.4,.9,1.6,.3,.06);B('#fff3d6',14,1.05,-31,4.6,.2,1.8,.3,.04);Cy('#8a5a2e',14,2.4,-31,.06,3,.02);P(o,cone(1.2,2.4,3),'#fff3d6',14.5,2.6,-31,.3,0,.04,true);
  for(let i=0;i<5;i++){P(o,sph(.3+rnd()*.2,6),'#cfd8dc',-14+rnd()*3,.15,-29+rnd()*2,0,0,.03,true);}P(o,cyl(.6,.7,.5,8),'#e8c98a',-7,.25,-3.5,0,0,.04,true);P(o,cyl(.3,.4,.4,8),'#e8c98a',-7,.7,-3.5,0,0,.04,true);P(o,cone(.2,.4,3),'#f0452e',-7,1.1,-3.5,0,0,.02,true);break;}
 case 'roof':{for(const s of [-1,1]){for(let i=0;i<9;i++)Cy('#8d93a6',s*9.6,2.2,6-i*4,.07,4.4,.03);for(const y of [.1,2.2,4.4])B('#8d93a6',s*9.6,y,-10,.08,.08,32,0,.02);for(let i=0;i<32;i++)B('#a9aec0',s*9.6,2.2,5.5-i,.03,4.3,.03,0,0);}
  for(let i=0;i<10;i++)Cy('#8d93a6',-9+i*2,2.2,-26,.07,4.4,.03);for(const y of [.1,2.2,4.4])B('#8d93a6',0,y,-26,19.2,.08,.08,0,.02);for(let i=0;i<38;i++)B('#a9aec0',-9.25+i*.5,2.2,-26,.03,4.3,.03,0,0);
  Cy('#c98a4b',-14,3.4,-18,1.7,3.2,.07);P(o,cone(1.9,1,10),'#8a5a2e',-14,5.5,-18,0,0,.06,true);for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]])B('#5b6072',-14+dx*1.1,.9,-18+dz*1.1,.14,1.8,.14,0,.03);
  for(const [x,z] of [[13,-8],[14,-14],[12.6,-21]] as const){B('#cfd8dc',x,.6,z,2,1.2,1.4,0,.05);Cy('#5b6072',x,1.24,z,.5,.08,.03);}
  for(let i=0;i<7;i++){const x=-27+i*9+rnd()*2,h=3+rnd()*9;B(['#4a3a6a','#5a4478','#6a4a80'][i%3],x,h/2-6,-40-rnd()*6,7,h+12,7,0,.1);for(let w=0;w<5;w++)B('#ffc83a',x-2.4+w*1.2,h-1.6-((w*3)%2)*1.6,-36.4,.6,.8,.06,0,0);}
  Cy('#5b6072',11,3.4,-25,.05,6.8,.02);B('#5b6072',11,5.6,-25,1.6,.05,.05,0,.015);B('#5b6072',11,6.2,-25,1,.05,.05,0,.015);flags(-9.6,9.6,4.8,-14,14);break;}
 default:{for(let i=0;i<20;i++)B(TONES[i%5],-28.5+i*3,.55,-25,2.9,1.1,.2,0,.05);for(const s of [-1,1])for(let i=0;i<9;i++)B(TONES[(i+2)%5],s*17,.55,4-i*3.2,.2,1.1,3.1,0,.05);
  for(let t=0;t<4;t++){B(['#1d2456','#252d68','#2d367a','#353f8a'][t],0,1.6+t*1.5,-28-t*2.2,60,1.5,2.2,0,.07);for(const s of [-1,1])B(['#1d2456','#252d68','#2d367a','#353f8a'][t],s*(19+t*2.2),1.6+t*1.5,-9,2.2,1.5,40,0,.07);}
  for(let i=0;i<230;i++){const t=Math.floor(rnd()*4),side=rnd()<.6?0:rnd()<.5?-1:1,c=TONES[Math.floor(rnd()*6)];if(side===0)B(c,-28+rnd()*56,2.65+t*1.5,-27.6-t*2.2,.5,.6,.4,0,0);else B(c,side*(18.6+t*2.2),2.65+t*1.5,8-rnd()*34,.4,.6,.5,0,0);}
  for(const [x,z] of [[-22,-34],[22,-34]] as const){Cy('#8d93a6',x,7,z,.3,14,.07);B('#fffbe0',x,14.6,z,4.4,2.2,.5,x<0?.5:-.5,.07);}
  B('#231a2e',9,9,-36,9,3.4,.6,-.2,.08);B('#ffc83a',9,9.4,-35.6,7.6,.9,.1,-.2,0);B('#fff3d6',9,8.2,-35.6,5,.5,.1,-.2,0);break;}}
 // the things in play that never move
 for(const e of ents){switch(e.k){
  case K.block:{const c=place==='garden'?'#d9a25f':place==='plaza'?'#fff3d6':place==='roof'?'#c9584a':place==='beach'?'#c98a4b':'#cfd8dc';B(c,e.x,e.y,e.z,e.hx*2,e.hy*2,e.hz*2,0,.05);B(place==='roof'?'#8a3a3a':'#8a5a2e',e.x,e.y+e.hy,e.z,e.hx*2+.12,.1,e.hz*2+.12,0,.035);
   if(e.hy>1){P(o,cyl(.01,e.hx*1.5,.9,4).rotateY(Math.PI/4),'#5b6072',e.x,e.y+e.hy+.5,e.z,0,0,.06,true);B('#231a2e',e.x-.8,1.55,e.z+e.hz+.01,.94,1.04,.04,0,0);B('#231a2e',e.x+.8,1.55,e.z+e.hz+.01,.94,1.04,.04,0,0);}break;}
  case K.fence:{const n=Math.round(e.hx*2/.5);for(let i=0;i<=n;i++)B(i%4===0?'#8d93a6':'#cfd8dc',e.x-e.hx+i*.5,e.y,e.z,i%4===0?.12:.05,e.hy*2,.08,0,i%4===0?.03:.012);for(const y of [.25,e.hy,e.hy*2-.06])B('#8d93a6',e.x,y,e.z,e.hx*2,.07,.1,0,.02);break;}
  case K.post:Cy(e.hx>.09?'#8a5a2e':'#fffaf0',e.x,e.ey/2,e.z,e.hx,e.ey,.03);break;
  case K.bar:P(o,cyl(e.hx,e.hx,e.ex,8).rotateZ(Math.PI/2),'#fffaf0',e.x+e.ex/2,e.y,e.z,0,0,.03,false);break;
  case K.hoop:Cy('#8d93a6',e.x,(e.y-e.hx)/2,e.z,.05,e.y-e.hx,.02);B('#5b6072',e.x,.05,e.z,.7,.1,.5,0,.03);break;
  case K.bell:B('#8a5a2e',e.x,e.y+.62,e.z,.9,.12,.12,0,.03);break;
  case K.tyre:if(e.mo===2){const top=e.by+e.len;for(const s of [-1,1])Cy('#8a5a2e',e.x+s*2.6,top/2+.1,e.z,.12,top+.2,.04);B('#8a5a2e',e.x,top+.2,e.z,5.6,.2,.2,0,.04);}else B(COMIC_INK,e.x,e.y+e.hx+.35,e.z,.04,.7,.04,0,0);break;}}
 return bakeParts(o);}

const BITS=110,TRAIL=40,BLOBS=44,GHOST=26,STARS=6,ROPES=4;
const M=new T.Matrix4(),Q=new T.Quaternion(),Q2=new T.Quaternion(),V=new T.Vector3(),V2=new T.Vector3(),SC=new T.Vector3(),E=new T.Euler(),CC=new T.Color(),AX=new T.Vector3(),ZERO=new T.Matrix4().makeScale(0,0,0);
export type FlickitView=ReturnType<typeof createFlickitView>;
export function createFlickitView(host:HTMLElement,o:{reduced:boolean;mobile:boolean}){
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');canvas.dataset.flickitCanvas='';canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';host.prepend(canvas);
 const renderer=new T.WebGLRenderer({canvas,antialias:!o.mobile,powerPreference:'low-power',alpha:false});renderer.toneMapping=T.NoToneMapping;
 const scene=new T.Scene(),bg=new T.Color('#8fd4ee');scene.background=bg;const fog=new T.Fog('#d6f1f5',60,170);scene.fog=fog;
 const camera=new T.PerspectiveCamera(60,.5,.1,400),ink=createComicUniforms({});
 const hemi=new T.HemisphereLight('#ffffff','#a79bb5',.55),sun=new T.DirectionalLight('#ffffff',2.6),toSun=new T.Vector3(-.5,.66,.56).normalize();sun.position.copy(toSun).multiplyScalar(40);scene.add(hemi,sun,sun.target);
 const owned:{dispose():void}[]=[],own=<X extends {dispose():void}>(x:X)=>{owned.push(x);return x;};
 const lit=<X extends T.Material>(m:X,rim=false)=>comicMaterial(own(m),{uniforms:ink,rim});
 const vmat=lit(new T.MeshLambertMaterial({vertexColors:true}));
 // place: backdrop, underlay, ground sheet, scenery (rebuilt per stage)
 const backMat=own(new T.MeshBasicMaterial({fog:false,side:T.BackSide})),back=new T.Mesh(own(new T.CylinderGeometry(150,150,96,40,1,true,Math.PI/2,Math.PI)),backMat);back.position.set(0,34,0);back.frustumCulled=false;scene.add(back);
 const underMat=lit(new T.MeshLambertMaterial({color:'#57b85f'})),under=new T.Mesh(own(new T.PlaneGeometry(420,420).rotateX(-Math.PI/2)),underMat);under.position.y=-.03;scene.add(under);
 const groundMat=lit(new T.MeshLambertMaterial({color:'#ffffff'})),ground=new T.Mesh(own(new T.PlaneGeometry(64,64).rotateX(-Math.PI/2)),groundMat);ground.position.set(0,0,-18);scene.add(ground);
 const place=new T.Mesh(new T.BufferGeometry(),vmat);place.frustumCulled=false;scene.add(place);
 const netMat=own(new T.MeshBasicMaterial({map:own(netTex()),transparent:true,alphaTest:.3,side:T.DoubleSide,opacity:.85})),net=new T.Mesh(own(new T.BoxGeometry(1,1,1)),netMat);net.visible=false;scene.add(net);
 let backTex:T.Texture|null=null,groundT:T.Texture|null=null;
 // instanced things
 const inst=new Map<number,T.InstancedMesh>(),kinds=[K.can,K.crate,K.bottle,K.cone,K.barrel,K.balloon,K.hoop,K.tyre,K.bin,K.bell,K.shutter,K.sign,K.trolley,K.keeper,K.wall];
 const mk=(geo:T.BufferGeometry,mat:T.Material,n:number)=>{const m=new T.InstancedMesh(geo,mat,n);m.instanceMatrix.setUsage(T.DynamicDrawUsage);m.setColorAt(0,CC.set('#ffffff'));m.count=0;m.visible=false;m.frustumCulled=false;scene.add(m);return m;};
 for(const k of kinds)inst.set(k,mk(own(modelFor(k)),vmat,k===K.can||k===K.bottle?24:k===K.balloon||k===K.wall?12:8));
 const ballMat=lit(new T.MeshLambertMaterial({map:own(ballTex())}),true),ballG=new T.Group(),ball=new T.Mesh(own(new T.SphereGeometry(FK.R,20,14)),ballMat);ballG.add(ball);scene.add(ballG);
 const blobs=mk(own(new T.PlaneGeometry(2,2).rotateX(-Math.PI/2)),own(new T.MeshBasicMaterial({map:own(blobTex()),transparent:true,depthWrite:false,color:COMIC_INK,opacity:.3})),BLOBS);blobs.renderOrder=1;
 const fxMat=own(new T.MeshBasicMaterial({color:'#ffffff'})),trail=mk(own(new T.SphereGeometry(1,8,6)),fxMat,TRAIL),bits=mk(own(new T.BoxGeometry(1,1,1)),fxMat,BITS),ropes=mk(own(new T.BoxGeometry(1,1,1)),fxMat,ROPES);
 const topMat=own(new T.MeshBasicMaterial({color:'#ffffff',depthTest:false,fog:false,transparent:true})),ghost=mk(own(new T.SphereGeometry(1,8,6)),topMat,GHOST),stars=mk(own(comicStarGeometry()),topMat,STARS*2);ghost.renderOrder=12;stars.renderOrder=10;
 // pools
 const bp=new Float32Array(BITS*8),bc=new Float32Array(BITS*3);let bi=0;// x y z vx vy vz life size
 const tp=new Float32Array(TRAIL*4);let ti=0,tn=0,trailAt=0;
 const sp=new Float32Array(STARS*6);let si=0;// x y z t0 size tone
 let ghostN=0;const ghostP=new Float32Array(GHOST*3);
 function burst(x:number,y:number,z:number,n:number,cols:readonly string[],speed:number,size=.12){if(o.reduced)n=Math.ceil(n/3);for(let i=0;i<n;i++){const j=bi++%BITS,a=Math.random()*6.283,u=Math.random();bp[j*8]=x;bp[j*8+1]=y;bp[j*8+2]=z;bp[j*8+3]=Math.cos(a)*speed*(.3+u);bp[j*8+4]=speed*(.4+Math.random()*.9);bp[j*8+5]=Math.sin(a)*speed*(.3+u);bp[j*8+6]=.7+Math.random()*.5;bp[j*8+7]=size*(.6+Math.random()*.8);CC.set(cols[i%cols.length]);bc[j*3]=CC.r;bc[j*3+1]=CC.g;bc[j*3+2]=CC.b;}}
 function star(x:number,y:number,z:number,size:number,tone:number,now:number){const j=si++%STARS;sp[j*6]=x;sp[j*6+1]=y;sp[j*6+2]=z;sp[j*6+3]=now;sp[j*6+4]=size;sp[j*6+5]=tone;}

 /* ---- camera ---- */
 let W=1,H=1,def:StageDef|null=null,vfov=60,now=0,introT=1,followW=0,shake=0,kickAt=-9,punch=0,slow=0,lastT=0,held=false;
 const base=new T.Vector3(0,2,5),look=new T.Vector3(0,1,-10),cp=new T.Vector3(),cl=new T.Vector3(),fl=new T.Vector3(),flickCam:FlickCam={yaw:0,gain:.5,off:0};
 const spinQ=new T.Quaternion(),lastBall=new T.Vector3();
 function measure(){if(!def)return;const wide=W>H;vfov=wide?def.cam.fov*.7:def.cam.fov;base.set(def.cam.p[0],def.cam.p[1],def.cam.p[2]);look.set(def.cam.l[0],def.cam.l[1],def.cam.l[2]);
  if(wide){V.copy(base).sub(look).multiplyScalar(.12);base.add(V);}camera.fov=vfov;camera.aspect=W/H;camera.position.copy(base);camera.updateProjectionMatrix();
  // keep the ball in the frame on any screen: clear of the hint at the bottom and of the edges (the look-at point gives way)
  for(let i=0;i<24;i++){camera.lookAt(look);camera.updateMatrixWorld();V.set(0,FK.R,0).project(camera);const nx=(V.x+1)/2,ny=(1-V.y)/2;let ok=true;if(ny>.76){look.y-=.35;ok=false;}else if(ny<.6){look.y+=.25;ok=false;}if(nx<.2){look.x-=.4;ok=false;}else if(nx>.8){look.x+=.4;ok=false;}if(ok)break;}
  camera.lookAt(look);camera.updateMatrixWorld();
  const f=(H/2)/Math.tan(vfov*Math.PI/360),yaw=Math.atan2(look.x-base.x,-(look.z-base.z));V.set(0,FK.R,0).project(camera);const bx=(V.x+1)/2*W,by=(1-V.y)/2*H;
  V.set(base.x+Math.sin(yaw)*800,0,base.z-Math.cos(yaw)*800).project(camera);const hy=(1-V.y)/2*H;flickCam.yaw=yaw;flickCam.gain=Math.max(.42,Math.min(.75,(by-hy)/f));flickCam.off=Math.max(-.3,Math.min(.3,(bx-W/2)/f));}
 function resize(w:number,h:number,dpr:number){W=w;H=h;renderer.setPixelRatio(Math.min(o.mobile?1.5:2,dpr));renderer.setSize(w,h,false);comicDotCell(ink,renderer);measure();}

 function setStage(g:FlickIt,intro=true){const s=g.state;def=s.stage;const p=PLACES[def.place]??PLACES.garden;
  backTex?.dispose();groundT?.dispose();backTex=backdropTex(def.place);groundT=groundTex(def.place,s.ents);backMat.map=backTex;backMat.needsUpdate=true;groundMat.map=groundT;groundMat.needsUpdate=true;underMat.color.set(p.ground);
  place.geometry.dispose();place.geometry=scenery(def.place,s.ents);
  bg.set(p.fog);fog.color.set(p.fog);sun.intensity=p.sunI;hemi.color.set(p.hemi);hemi.groundColor.set(p.hemiG);hemi.intensity=p.hemiI;ink.uInkShade.value.setRGB(p.shade[0],p.shade[1],p.shade[2]);(blobs.material as T.MeshBasicMaterial).opacity=p.blob;
  const gl=s.ents.find(e=>e.k===K.goal);net.visible=!!gl;if(gl){net.scale.set(gl.hx*2,gl.hy*2,1.6);net.position.set(gl.x,gl.y,gl.z-.82);(netMat.map as T.Texture).repeat.set(gl.hx*3,gl.hy*3);}
  // instance colours (fixed per stage)
  for(const m of inst.values()){m.count=0;m.visible=false;}
  for(const e of s.ents){const m=inst.get(e.k);if(!m)continue;const i=m.count++;m.visible=true;const c=e.k===K.can?TONES[e.tone%3]:e.k===K.bottle?['#19b5a5','#2f8fd8','#ff65c8','#ffc83a'][e.tone]:e.k===K.barrel?['#2f8fd8','#f0452e'][e.tone%2]:e.k===K.balloon?TONES[e.id%5]:e.k===K.bin?'#19b5a5':e.k===K.shutter?'#2f8fd8':e.k===K.trolley?'#f0452e':e.k===K.hoop?['#f0452e','#ffc83a','#19b5a5'][e.id%3]:'#ffffff';m.setColorAt(i,CC.set(c));}
  for(const m of inst.values())if(m.instanceColor)m.instanceColor.needsUpdate=true;
  tn=0;ghostN=0;bp.fill(0);sp.fill(-9);followW=0;shake=0;spinQ.identity();measure();introT=intro&&!o.reduced?0:1;held=false;}

 function onEvent(e:FlickEvent,g:FlickIt){const s=g.state,src=e.id>=0?s.ents[e.id]:null,tone=src?TONES[src.tone%TONES.length]:'#fff3d6';
  switch(e.type){
   case 'kick':kickAt=now;tn=0;ghostN=0;burst(0,.1,0,8,['#fff3d6','#d9c7a0'],2.2,.09);held=false;break;
   case 'hit':if(!src)break;star(e.x,e.y,e.z,src.k===K.goal?2.2:1.1+e.a*.18,e.a>1?1:0,now);shake=Math.min(.3,.08+e.a*.04);
    burst(e.x,e.y,e.z,src.k===K.crate?12:8,src.k===K.crate?['#c98a4b','#8a5a2e','#fff3d6']:src.k===K.barrel?['#8fd4ee','#ffffff','#2f8fd8']:[tone,'#fff3d6','#ffc83a'],src.k===K.barrel?5:3.6,src.k===K.crate?.16:.11);break;
   case 'pop':burst(e.x,e.y,e.z,14,[TONES[e.id%5],'#ffffff'],4.4,.1);star(e.x,e.y,e.z,1.3,2,now);break;
   case 'trick':star(e.x,e.y+.6,e.z,2.3,1,now);burst(e.x,e.y,e.z,18,TONES,5.5,.12);shake=.25;break;
   case 'goal':burst(e.x,e.y,e.z-.5,26,TONES,6,.13);shake=.3;break;
   case 'ping':case 'block':case 'saved':case 'weak':shake=Math.max(shake,.12);burst(s.ball.x,s.ball.y,s.ball.z,5,['#fff3d6','#ffc83a'],2.6,.07);break;
   case 'bounce':if(e.a>4)burst(s.ball.x,.05,s.ball.z,5,def?.place==='beach'?['#f2d9a0','#e0bf85']:def?.place==='plaza'||def?.place==='roof'?['#fff3d6','#cfd8dc']:['#7fd486','#fff3d6'],1.8,.07);break;
   case 'tee':held=false;break;
   case 'level':if(e.a>0)for(let i=0;i<3;i++)burst(look.x+(i-1)*3,3.5,look.z,16,TONES,6,.14);break;}}

 function setInst(m:T.InstancedMesh,i:number,x:number,y:number,z:number,s:number){SC.set(s,s,s);M.compose(V.set(x,y,z),Q,SC);m.setMatrixAt(i,M);}
 function render(g:FlickIt,t:number,slowMo=0){now=t;const s=g.state,b=s.ball,dt=Math.min(.1,Math.max(0,t-lastT));lastT=t;slow+=(slowMo-slow)*Math.min(1,dt*10);
  // things
  for(const m of inst.values())m.count=0;let nb=0,nr=0;const blob=(x:number,y:number,z:number,r:number)=>{if(nb>=BLOBS)return;const k=Math.max(.35,1-y*.12);SC.set(r*k,1,r*k);Q.identity();M.compose(V.set(x,.02,z),Q,SC);blobs.setMatrixAt(nb++,M);};
  const rope=(x:number,y0:number,y1:number,z:number,x1=x)=>{if(nr>=ROPES)return;V.set((x+x1)/2,(y0+y1)/2,z);E.set(0,0,Math.atan2(x-x1,y1-y0));Q.setFromEuler(E);SC.set(.035,Math.hypot(x1-x,y1-y0),.035);M.compose(V,Q,SC);ropes.setMatrixAt(nr,M);ropes.setColorAt(nr++,CC.set(COMIC_INK));};
  for(const e of s.ents){const m=inst.get(e.k);if(!m)continue;const i=m.count++,age=s.t-e.hitT,wob=age<1.2?Math.exp(-age*3.2)*Math.sin(age*22)*Math.min(1,e.hitV/14):0;Q.identity();let sc=1,x=e.x,y=e.y,z=e.z;
   switch(e.cls){
    case 0:if(e.st!==0){AX.set(e.ax,0,e.az);Q.setFromAxisAngle(AX,e.rot);}else if(wob){AX.set(1,0,0);Q.setFromAxisAngle(AX,wob*.22);}blob(x,y,z,Math.max(e.hx,e.hz)*1.5);break;
    case 1:if(e.done){sc=0;}else{AX.set(0,0,1);Q.setFromAxisAngle(AX,Math.sin(t*1.3+e.id)*.12);blob(x,y,z,.42);}break;
    case 2:{E.set(0,e.yaw+wob*.5,e.k===K.tyre&&e.mo===2?-Math.atan2(e.x-e.bx,e.len):0);Q.setFromEuler(E);sc=e.hx*(1+(e.done&&age<.4?Math.sin(age/.4*Math.PI)*.18:0));blob(x,y,z,e.hx*.9);if(e.mo===2)rope(e.x,e.y+e.hx,e.by+e.len,e.z,e.bx);break;}
    case 3:AX.set(1,0,0);Q.setFromAxisAngle(AX,wob*.12);blob(x,.6,z,.85);if(e.done&&age<.5)y+=Math.sin(age/.5*Math.PI)*.12;break;
    case 4:AX.set(1,0,0);Q.setFromAxisAngle(AX,(age<4?Math.exp(-age*.9)*Math.sin(age*9)*.7:0));y+=.02;break;
    case 5:if(e.k===K.shutter){const a=e.done?Math.min(1,age*2.6):0;E.set(0,-a*1.9*(e.tone%2?1:-1),0);Q.setFromEuler(E);x+=(e.tone%2?1:-1)*.45*(1-Math.cos(a*1.9));z-=Math.sin(a*1.9)*.45*.9;}
     else if(e.k===K.sign){E.set(0,e.done?Math.min(age,2.2)*14*Math.exp(-Math.min(age,2.2)*.9):0,0);Q.setFromEuler(E);}else{AX.set(0,0,1);Q.setFromAxisAngle(AX,wob*.16);blob(x,y,z,1.5);}break;
    default:if(e.k===K.keeper){AX.set(0,0,1);Q.setFromAxisAngle(AX,Math.cos(e.w*s.t+e.ph)*-.22+wob*.2);blob(x,y,z,.8);}else{AX.set(1,0,0);Q.setFromAxisAngle(AX,wob*.3);blob(x,y,z,.5);}}
   setInst(m,i,x,y,z,sc);}
  for(const m of inst.values()){m.visible=m.count>0;if(m.count)m.instanceMatrix.needsUpdate=true;}
  // ball: squash on the kick, stretch along the flight, spin
  const flying=s.phase==='fly',spd=Math.hypot(b.vx,b.vy,b.vz),k=Math.max(0,1-(t-kickAt)/.16);ballG.position.set(b.x,b.y,b.z);
  if(flying&&spd>1){V.set(b.vx,b.vy,b.vz).normalize();Q.setFromUnitVectors(V2.set(0,0,1),V);ballG.quaternion.copy(Q);const st=Math.min(.22,spd*.006)+k*.3;ballG.scale.set(1-st*.5,1-st*.5,1+st);
   AX.set(b.vz,0,-b.vx).normalize();Q.setFromAxisAngle(AX,spd*dt*(b.y>FK.R+.03?1.4:1/FK.R)*(slow>.5?.35:1));Q2.setFromAxisAngle(V2.set(0,1,0),-b.spin*16*dt*(slow>.5?.35:1));spinQ.premultiply(Q).premultiply(Q2);ball.quaternion.copy(ballG.quaternion).invert().multiply(spinQ);}
  else{ballG.quaternion.identity();ballG.scale.set(1,1,1);ball.quaternion.copy(spinQ);}
  ballG.visible=!(s.phase==='wait'&&b.y>FK.R+.1&&spd===0&&s.ents.some(e=>e.cls===3&&e.x===b.x&&e.z===b.z));blob(b.x,b.y,b.z,.34);
  // trail: the spin's colour (teal = bending left, red = right, sun = dipping)
  if(flying&&t-trailAt>.012){trailAt=t;const j=ti++%TRAIL;tp[j*4]=b.x;tp[j*4+1]=b.y;tp[j*4+2]=b.z;tp[j*4+3]=t;if(tn<TRAIL)tn++;}
  {let n=0;const sh=s.shot,c=Math.abs(sh.spin)>.2?(sh.spin<0?'#19b5a5':'#f0452e'):sh.top>.25?'#ffc83a':'#fffaf0';Q.identity();for(let i=0;i<tn;i++){const j=((ti-1-i)%TRAIL+TRAIL)%TRAIL,age=t-tp[j*4+3],life=slow>.3?.9:.5;if(age>life)continue;const r=.16*(1-age/life)*(i%3===2?.6:1);SC.set(r,r,r);M.compose(V.set(tp[j*4],tp[j*4+1],tp[j*4+2]),Q,SC);trail.setMatrixAt(n,M);trail.setColorAt(n,CC.set(i%3===2?'#fffaf0':c));n++;}
   trail.count=n;trail.visible=n>0;if(n){trail.instanceMatrix.needsUpdate=true;trail.instanceColor!.needsUpdate=true;}}
  // bits
  {let n=0;Q.identity();for(let j=0;j<BITS;j++){const o8=j*8;if(bp[o8+6]<=0)continue;bp[o8+6]-=dt;bp[o8+4]-=FK.g*dt;bp[o8]+=bp[o8+3]*dt;bp[o8+1]+=bp[o8+4]*dt;bp[o8+2]+=bp[o8+5]*dt;if(bp[o8+1]<.04){bp[o8+1]=.04;bp[o8+4]*=-.4;bp[o8+3]*=.6;bp[o8+5]*=.6;}
    const r=bp[o8+7]*Math.min(1,bp[o8+6]*3);E.set(bp[o8+6]*9,j,bp[o8+6]*7);Q.setFromEuler(E);SC.set(r,r,r);M.compose(V.set(bp[o8],bp[o8+1],bp[o8+2]),Q,SC);bits.setMatrixAt(n,M);bits.setColorAt(n,CC.setRGB(bc[j*3],bc[j*3+1],bc[j*3+2]));n++;}
   bits.count=n;bits.visible=n>0;if(n){bits.instanceMatrix.needsUpdate=true;bits.instanceColor!.needsUpdate=true;}}
  blobs.count=nb;blobs.visible=nb>0;blobs.instanceMatrix.needsUpdate=true;ropes.count=nr;ropes.visible=nr>0;if(nr){ropes.instanceMatrix.needsUpdate=true;ropes.instanceColor!.needsUpdate=true;}
  // camera: fly in over the layout, sit at the stage's own angle, chase the ball, cut back
  if(introT<1)introT=Math.min(1,introT+dt/2.4);const ie=1-Math.pow(1-introT,3);
  if(flying){held=true;followW=Math.min(1,followW+dt*2.2);}else if(s.phase==='tee'||s.phase==='done')followW=Math.max(0,followW-dt*(o.reduced?9:4.5));
  if(flying||(held&&s.phase==='wait')){if(flying){const hv=Math.hypot(b.vx,b.vz)||1;V.set(b.x-b.vx/hv*5.2,Math.max(1.3,b.y+1.5),b.z-b.vz/hv*5.2);if(V.z>base.z)V.z=base.z;if(V.z<-11)V.z=-11;/* never chase into the scenery behind the targets */V.x=Math.max(-6,Math.min(6,V.x));fl.lerp(V,Math.min(1,dt*5));}lastBall.lerp(V.set(b.x,b.y,b.z),Math.min(1,dt*9));}
  else if(followW===0){fl.copy(base);lastBall.set(0,FK.R,0);}
  const fw=o.reduced?0:followW*followW*(3-2*followW)*.78;cp.copy(base).lerp(fl,fw);cl.copy(look).lerp(lastBall,fw*.9);
  if(ie<1){const a=(1-ie)*1.15,dx=base.x-look.x,dz=base.z-look.z,r=1+(1-ie)*.9;cp.set(look.x+(dx*Math.cos(a)-dz*Math.sin(a))*r,base.y+(1-ie)*7,look.z+(dx*Math.sin(a)+dz*Math.cos(a))*r);cl.copy(look);cl.y*=ie;}
  if(shake>0&&!o.reduced){cp.x+=Math.sin(t*71)*shake*.35;cp.y+=Math.cos(t*93)*shake*.35;shake=Math.max(0,shake-dt*1.4);}
  punch+=((slow>.3?1:0)-punch)*Math.min(1,dt*8);camera.position.copy(cp);camera.lookAt(cl);const fv=vfov-punch*7+(ie<1?(1-ie)*8:0);if(Math.abs(camera.fov-fv)>.01){camera.fov=fv;camera.updateProjectionMatrix();}aimComicSun(ink,toSun,camera);
  // stars (face the camera) and the aim ghost
  {let n=0;for(let j=0;j<STARS;j++){const age=t-sp[j*6+3];if(age<0||age>.42)continue;const u=age/.42,r=sp[j*6+4]*(u<.25?u/.25:1-(u-.25)/.75*.5),d=Math.max(.3,camera.position.distanceTo(V.set(sp[j*6],sp[j*6+1],sp[j*6+2]))*.07);Q.copy(camera.quaternion);E.set(0,0,j*1.3+u*.5);Q2.setFromEuler(E);Q.multiply(Q2);
    SC.set(r*d*1.25,r*d*1.25,1);M.compose(V,Q,SC);stars.setMatrixAt(n,M);stars.setColorAt(n++,CC.set(COMIC_INK));SC.set(r*d,r*d,1);M.compose(V,Q,SC);stars.setMatrixAt(n,M);stars.setColorAt(n++,CC.set(['#fff3d6','#ffc83a','#ffffff'][sp[j*6+5]]));}
   stars.count=n;stars.visible=n>0;if(n){stars.instanceMatrix.needsUpdate=true;stars.instanceColor!.needsUpdate=true;}}
  {const n=s.phase==='tee'?ghostN:0;Q.identity();for(let i=0;i<n;i++){const r=.07+.05*(.5+.5*Math.sin(t*5-i*.7));SC.set(r,r,r);M.compose(V.set(ghostP[i*3],ghostP[i*3+1],ghostP[i*3+2]),Q,SC);ghost.setMatrixAt(i,M);ghost.setColorAt(i,CC.set(i%2?'#fff3d6':'#ffc83a'));}
   ghost.count=n;ghost.visible=n>0;if(n){ghost.instanceMatrix.needsUpdate=true;ghost.instanceColor!.needsUpdate=true;}}
  renderer.render(scene,camera);}

 return {resize,render,setStage,onEvent,
  /** How this stage's camera turns a swipe into a kick (core.ts flickToShot). */
  flickCam:()=>flickCam,
  /** The aim ghost: flight points from core.ts predict (xyz), n of them; 0 hides it. */
  setGhost(p:Float32Array,n:number){ghostN=Math.max(0,Math.min(GHOST,n-3));for(let i=0;i<ghostN*3;i++)ghostP[i]=p[i+9];},
  /** True while the fly-in or the cut back to the spot is still moving (the shell keeps drawing). */
  busy:()=>introT<1||followW>0,
  project(x:number,y:number,z:number){V.set(x,y,z).project(camera);return {x:(V.x+1)/2*W,y:(1-V.y)/2*H,on:V.z<1};},
  info:()=>({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,textures:renderer.info.memory.textures,geometries:renderer.info.memory.geometries,programs:renderer.info.programs?.length??0}),
  dispose(){backTex?.dispose();groundT?.dispose();place.geometry.dispose();for(const m of inst.values())m.dispose();for(const m of [blobs,trail,bits,ropes,ghost,stars])m.dispose();for(const x of owned)x.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();},
 };
}
void ZERO;
