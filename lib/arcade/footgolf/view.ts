/**
 * FootGolf Island drawing (Nov 21 2026, docs/arcade-aaa/footgolf-direction.md): one three.js scene in the arcade's comic print style
 * (lib/arcade/comic: banded light, violet halftone shade on every slope, ink hulls baked into the geometry). One hole at a time:
 *  - the hole's heightfield (the same grid the physics samples, under 6k triangles) wearing a painted ground sheet: mown stripes,
 *    inked fairway and green edges, bunkers with rake lines, stone paths, painted tree shadows and downhill arrows on the green;
 *  - an apron ring that carries the land on to the coast and into the sea, with bigger hills further out (layers for depth), fog
 *    to the horizon and the house comic coast painted all round on one backdrop cylinder;
 *  - every still thing (walls, fences, hedges, rocks, bales, the fountain, the bridge, the landmark) baked into ONE vertex-colour mesh;
 *  - trees: one instanced draw per kind (round, palm, pine); the flag (a cloth of 18 vertices that flies with the wind), the cup,
 *    the ball, its blob shadow, the flight preview, a landing ring, a trail and one particle pool.
 * Cameras: a flyover from the green back to the tee, a behind-the-ball aim view (lower for a putt), a chase in flight that rises with
 * the ball, and a low view beside the cup when a rolling ball gets near it.
 * Heat (AGENTS.md): low-power context, pixel ratio 1.5 on phones, ONE sun + a hemisphere, NO shadow map, no post-processing, fixed pools,
 * nothing allocated per frame; the shell draws only while playing (30 fps on phones). The view makes its own canvas and frees all.
 * Pieces of Flick It's view (branch game-flickit: renderer setup, canvas textures, pools) were copied here, not imported.
 */
import * as T from 'three';
import {createComicUniforms,comicDotCell,aimComicSun,comicMaterial,COMIC_INK,COMIC_PAPER} from '../comic/shading';
import {inkedPart,partAt,bakeParts} from '../comic/ink';
import {paintComicCoast,type ComicCoastPalette} from '../comic/backdrop';
import {FG,S,heightAt,slopeAt,surfaceAt,type FootGolf,type FgEvent,type Hole,type KickKind} from './core';

export const FG_COLORS={sun:'#ffc83a',red:'#f0452e',teal:'#19b5a5',paper:COMIC_PAPER,ink:COMIC_INK,fairway:'#5cc063',green:'#8ee07a',rough:'#3f9a50',sand:'#f3d990',water:'#27b0c8'};
type Parts=T.BufferGeometry[];
const box=(w:number,h:number,d:number)=>new T.BoxGeometry(w,h,d),cyl=(r0:number,r1:number,h:number,n=10)=>new T.CylinderGeometry(r0,r1,h,n),cone=(r:number,h:number,n=8)=>new T.ConeGeometry(r,h,n),ico=(r:number,d=1)=>new T.IcosahedronGeometry(r,d);
function P(o:Parts,g:T.BufferGeometry,c:string,x:number,y:number,z:number,ry=0,rz=0,ink=.05,round=false){inkedPart(o,g,c,partAt(x,y,z,ry,rz),ink,round);}
const seeded=(s:number)=>{let r=s>>>0||1;return()=>{r=(r*16807)%2147483647;return r/2147483647;};};
function canvasTex(w:number,h:number,paint:(g:CanvasRenderingContext2D)=>void){const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d')!);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}

/* ---- the look of each place ---- */
type Place={sky:Partial<ComicCoastPalette>;sunX:number;fog:string;far:string;hills:number;shade:[number,number,number];hemi:string;hemiG:string};
const DAY:Partial<ComicCoastPalette>={top:'#58b6e8',mid:'#8fd4ee',haze:'#d6f1f5',sunCore:'#fffbe0',sunRing:'#fff1b0',sunRing2:'#ffe28a',cloudLit:'#ffffff',cloudShade:'#cfe6f2',headA:'#3f8f6a',headB:'#6fb880',seaFar:'#2b8fc0',seaNear:'#27b0b0'};
const GOLD:Partial<ComicCoastPalette>={...DAY,top:'#f29a5c',mid:'#f8be7a',haze:'#ffe0a8',cloudLit:'#fff0cc',cloudShade:'#f2a58a',headA:'#7a6a50',headB:'#b9965a'};
const PLACES:Record<string,Place>={
 jetty:{sky:DAY,sunX:.72,fog:'#d6f1f5',far:'#6fb880',hills:3,shade:[.55,.47,.74],hemi:'#ffffff',hemiG:'#a79bb5'},
 beach:{sky:{...DAY,top:'#3aa6e6',mid:'#7fd2f0',haze:'#e8f8f0'},sunX:.4,fog:'#e2f6f0',far:'#7cc08a',hills:2,shade:[.6,.5,.72],hemi:'#ffffff',hemiG:'#c9b08a'},
 plaza:{sky:GOLD,sunX:.3,fog:'#ffe0b4',far:'#9aa070',hills:4,shade:[.62,.44,.66],hemi:'#ffe6cc',hemiG:'#9a7a9a'},
 farm:{sky:{...GOLD,top:'#e98a4c',mid:'#f6b66c'},sunX:.62,fog:'#ffdcab',far:'#a8a85a',hills:7,shade:[.6,.45,.66],hemi:'#ffe6c8',hemiG:'#9a7a8a'},
 boardwalk:{sky:{...DAY,top:'#e9825c',mid:'#f6a968',haze:'#ffcf7a',cloudLit:'#ffe1b0',cloudShade:'#d9707a',headA:'#8a5a80',headB:'#c98a90'},sunX:.5,fog:'#ffd2a0',far:'#8a8a70',hills:3,shade:[.6,.42,.68],hemi:'#ffe0d0',hemiG:'#8a6a9a'},
 museum:{sky:DAY,sunX:.22,fog:'#d8f0f2',far:'#5aa870',hills:5,shade:[.55,.47,.74],hemi:'#ffffff',hemiG:'#a79bb5'},
 coral:{sky:{...DAY,top:'#2aa0e0',mid:'#6fd0f0',haze:'#d8fbf2',seaFar:'#1fa0c8',seaNear:'#22c0c0'},sunX:.66,fog:'#d8f8f2',far:'#5cc09a',hills:1.5,shade:[.55,.5,.74],hemi:'#ffffff',hemiG:'#9ad0c0'},
 summit:{sky:{...DAY,top:'#4a8ad0',mid:'#9cc8e8',haze:'#e4eef6',headA:'#6a7a9a',headB:'#9aa8c0'},sunX:.35,fog:'#dde8f2',far:'#7a90a8',hills:16,shade:[.5,.48,.76],hemi:'#f0f4ff',hemiG:'#8a8aa8'},
 stadium:{sky:{top:'#5a3a8a',mid:'#e9825c',haze:'#ffcf7a',sunCore:'#fff1b0',sunRing:'#ffc24a',sunRing2:'#ff8a3c',cloudLit:'#ffe1b0',cloudShade:'#d9707a',headA:'#4a3a6a',headB:'#8a5a80',seaFar:'#3a5a9a',seaNear:'#2a7a96'},sunX:.5,fog:'#f2b48a',far:'#6a6a80',hills:4,shade:[.52,.38,.68],hemi:'#ffd8c0',hemiG:'#7a5a8a'},
};
const SKYLINE:Record<string,'palms'|'town'|'trees'|'peaks'|'stands'>={jetty:'trees',beach:'palms',plaza:'town',farm:'trees',boardwalk:'town',museum:'trees',coral:'palms',summit:'peaks',stadium:'stands'};
function backdropTex(place:string){const W=2048,H=512,hz=.8,p=PLACES[place];return canvasTex(W,H,g=>{
 paintComicCoast(g,W,H,{width:W,height:H,sunX:p.sunX,horizon:hz,palette:p.sky,seed:place.length*13+7});const y0=H*hz,rnd=seeded(place.charCodeAt(0)*31+5),kind=SKYLINE[place];g.lineJoin='round';
 const ink=(w=3)=>{g.lineWidth=w;g.strokeStyle=COMIC_INK;g.stroke();};
 // far islands on the sea: two layers, the further one paler (aerial perspective in flat print colours)
 for(const [layer,col,hgt] of [[0,'#9cc9c0',38],[1,p.far,26]] as const){g.fillStyle=col;for(let i=0;i<5;i++){const x=rnd()*W,w=160+rnd()*260,h=hgt*(.6+rnd()*.8);g.beginPath();g.moveTo(x-w/2,y0+2+layer*4);g.quadraticCurveTo(x-w*.2,y0-h,x,y0-h*.9);g.quadraticCurveTo(x+w*.25,y0-h*1.1,x+w/2,y0+2+layer*4);g.closePath();g.fill();if(layer)ink(2);}}
 for(let i=0;i<36;i++){const x=(i+.2+rnd()*.6)/36*W,s=.6+rnd()*.6;
  if(kind==='palms'&&i%3===0){g.strokeStyle='#7a5a3a';g.lineWidth=5*s;g.beginPath();g.moveTo(x,y0+2);g.quadraticCurveTo(x+8*s,y0-30*s,x+16*s,y0-54*s);g.stroke();g.fillStyle='#2f9a5a';for(let l=0;l<5;l++){const a=l/5*Math.PI*2+rnd();g.beginPath();g.ellipse(x+16*s+Math.cos(a)*16*s,y0-54*s+Math.sin(a)*6*s,18*s,5*s,a*.4,0,7);g.fill();ink(1.5);}}
  else if(kind==='town'&&i%2===0){const w=30+rnd()*34,h=24+rnd()*50;g.fillStyle=['#ffd9a8','#f7b58a','#fff3d6','#f2957a','#bfe9f5'][i%5];g.beginPath();g.rect(x-w/2,y0-h,w,h+3);g.fill();ink(2.5);g.fillStyle=['#f0452e','#d9604f','#c9584a'][i%3];g.beginPath();g.moveTo(x-w/2-4,y0-h);g.lineTo(x,y0-h-14-rnd()*10);g.lineTo(x+w/2+4,y0-h);g.closePath();g.fill();ink(2.5);}
  else if(kind==='peaks'&&i%4===0){const w=220+rnd()*200,h=90+rnd()*80;g.fillStyle='#8a96b0';g.beginPath();g.moveTo(x-w/2,y0+2);g.lineTo(x,y0-h);g.lineTo(x+w/2,y0+2);g.closePath();g.fill();ink(3);g.fillStyle='#fff3d6';g.beginPath();g.moveTo(x-w*.12,y0-h*.76);g.lineTo(x,y0-h);g.lineTo(x+w*.12,y0-h*.76);g.lineTo(x+w*.04,y0-h*.68);g.lineTo(x-w*.04,y0-h*.8);g.closePath();g.fill();ink(2);}
  else if(kind==='stands'&&i%9===0){const w=300,h=70;g.fillStyle='#4a3a6a';g.beginPath();g.rect(x-w/2,y0-h,w,h);g.fill();ink(3);for(let k=0;k<400;k++){g.fillStyle=['#f0452e','#19b5a5','#ffc83a','#fff3d6'][k%4];g.fillRect(x-w/2+rnd()*w,y0-h+6+rnd()*(h-10),3,4);}g.fillStyle='#231a2e';g.fillRect(x-4,y0-h-80,8,80);g.fillStyle='#fffbe0';g.fillRect(x-24,y0-h-92,48,18);}
  else if(kind!=='town'&&kind!=='stands'){g.fillStyle=['#2f8a52','#3c9a5c','#278048'][i%3];g.beginPath();g.ellipse(x,y0-16*s,20*s,22*s,0,0,7);g.fill();ink(2);}}
});}

/* ---- the painted ground sheet over the hole's bounds ---- */
function groundTex(H:Hole,toSun:T.Vector3){const d=H.def,[x0,z0,x1,z1]=d.bounds,w=x1-x0,dd=z1-z0,ppm=Math.min(1024/w,1024/dd,11),CW=Math.round(w*ppm),CH=Math.round(dd*ppm);
 const X=(x:number)=>(x-x0)*ppm,Z=(z:number)=>(z-z0)*ppm,M=(m:number)=>m*ppm,rnd=seeded(H.ix*97+13);
 return canvasTex(CW,CH,g=>{
  // 1. surfaces at one pixel a metre, smoothed up (soft coasts and beaches)
  const lw=Math.ceil(w),lh=Math.ceil(dd),lc=document.createElement('canvas');lc.width=lw;lc.height=lh;const lg=lc.getContext('2d')!,img=lg.createImageData(lw,lh);
  const col=(s:number,y:number):[number,number,number]=>s===S.sand?[243,217,144]:s===S.water||y<FG.water?[60,170,170]:s===S.wood?[170,120,80]:[63+Math.min(30,y*3),154,80];
  for(let j=0;j<lh;j++)for(let i=0;i<lw;i++){const x=x0+i+.5,z=z0+j+.5,s=surfaceAt(H,x,z),y=heightAt(H,x,z),c=col(s===S.fairway||s===S.green||s===S.stone||s===S.tee?S.rough:s,y),o=(j*lw+i)*4;img.data[o]=c[0];img.data[o+1]=c[1];img.data[o+2]=c[2];img.data[o+3]=255;}
  lg.putImageData(img,0,0);g.imageSmoothingEnabled=true;g.drawImage(lc,0,0,CW,CH);
  // rough: mottled tufts
  for(let i=0;i<w*dd/5;i++){const x=x0+rnd()*w,z=z0+rnd()*dd,s=surfaceAt(H,x,z);if(s!==S.rough)continue;g.fillStyle=rnd()<.5?'rgba(35,26,46,.12)':'rgba(255,243,214,.10)';g.beginPath();g.ellipse(X(x),Z(z),M(.5+rnd()*1.3),M(.3+rnd()*.6),rnd()*3,0,7);g.fill();}
  const path=(c:{p:number[]})=>{g.beginPath();g.moveTo(X(c.p[0]),Z(c.p[1]));for(let i=2;i<c.p.length;i+=2)g.lineTo(X(c.p[i]),Z(c.p[i+1]));};
  g.lineCap='round';g.lineJoin='round';
  // the out-of-bounds line
  g.setLineDash([M(1.2),M(1.2)]);g.strokeStyle='rgba(255,243,214,.85)';g.lineWidth=M(.25);g.strokeRect(M(1.5),M(1.5),CW-M(3),CH-M(3));g.setLineDash([]);
  // 2. fairway: ink edge, colour, mown stripes clipped to it
  for(const c of d.fair){path(c);g.strokeStyle=COMIC_INK;g.lineWidth=M(c.w*2+.7);g.stroke();}
  const fc=document.createElement('canvas');fc.width=CW;fc.height=CH;const f=fc.getContext('2d')!;f.fillStyle=FG_COLORS.fairway;f.fillRect(0,0,CW,CH);
  f.save();f.translate(CW/2,CH/2);f.rotate(.5);f.fillStyle='#6fcf72';for(let s=-CH*1.5;s<CH*1.5;s+=M(7))f.fillRect(-CW*1.5,s,CW*3,M(3.5));f.restore();
  f.globalCompositeOperation='destination-in';f.lineCap='round';f.lineJoin='round';for(const c of d.fair){f.beginPath();f.moveTo(X(c.p[0]),Z(c.p[1]));for(let i=2;i<c.p.length;i+=2)f.lineTo(X(c.p[i]),Z(c.p[i+1]));f.lineWidth=M(c.w*2);f.stroke();}
  g.drawImage(fc,0,0);
  // stadium: the pitch markings on its fairway
  if(d.place==='stadium'){g.strokeStyle='rgba(255,243,214,.9)';g.lineWidth=M(.3);g.beginPath();g.arc(X(3),Z(-60),M(9.15),0,7);g.stroke();g.beginPath();g.moveTo(X(-8),Z(-60));g.lineTo(X(14),Z(-60));g.stroke();g.fillStyle='rgba(255,243,214,.9)';g.beginPath();g.arc(X(3),Z(-60),M(.4),0,7);g.fill();}
  // 3. stone paths: paving
  for(const c of d.stone){path(c);g.strokeStyle=COMIC_INK;g.lineWidth=M(c.w*2+.5);g.stroke();path(c);g.strokeStyle='#e2d2b2';g.lineWidth=M(c.w*2);g.stroke();
   g.save();path(c);g.lineWidth=M(c.w*2);g.strokeStyle='rgba(0,0,0,0)';g.stroke();g.restore();}
  for(const c of d.stone){for(let i=0;i+3<c.p.length;i+=2){const ax=c.p[i],az=c.p[i+1],bx=c.p[i+2],bz=c.p[i+3],L=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/L,uz=(bz-az)/L;g.strokeStyle='rgba(122,90,80,.45)';g.lineWidth=M(.08);
   for(let t=0;t<L;t+=1.1){const px=ax+ux*t,pz=az+uz*t;g.beginPath();g.moveTo(X(px-uz*c.w),Z(pz+ux*c.w));g.lineTo(X(px+uz*c.w),Z(pz-ux*c.w));g.stroke();}}}
  // 4. bunkers: a fat ink lip, sand, rake lines
  for(const s of d.sand){g.fillStyle=COMIC_INK;g.beginPath();g.ellipse(X(s[0]),Z(s[1]),M(s[2]+.35),M(s[3]+.35),0,0,7);g.fill();g.fillStyle=FG_COLORS.sand;g.beginPath();g.ellipse(X(s[0]),Z(s[1]),M(s[2]),M(s[3]),0,0,7);g.fill();
   g.save();g.clip();g.strokeStyle='rgba(190,150,90,.55)';g.lineWidth=M(.1);for(let k=-s[3];k<s[3];k+=.45){g.beginPath();g.moveTo(X(s[0]-s[2]),Z(s[1]+k));g.quadraticCurveTo(X(s[0]),Z(s[1]+k+.4),X(s[0]+s[2]),Z(s[1]+k));g.stroke();}g.restore();}
  // 5. the green: ink, fringe, colour, rings of mowing, downhill arrows
  const gr=H.green;g.fillStyle=COMIC_INK;g.beginPath();g.ellipse(X(gr.x),Z(gr.z),M(gr.rx+1.4),M(gr.rz+1.4),0,0,7);g.fill();g.fillStyle='#72cf6c';g.beginPath();g.ellipse(X(gr.x),Z(gr.z),M(gr.rx+1.1),M(gr.rz+1.1),0,0,7);g.fill();
  g.fillStyle=COMIC_INK;g.beginPath();g.ellipse(X(gr.x),Z(gr.z),M(gr.rx+.12),M(gr.rz+.12),0,0,7);g.fill();g.fillStyle=FG_COLORS.green;g.beginPath();g.ellipse(X(gr.x),Z(gr.z),M(gr.rx),M(gr.rz),0,0,7);g.fill();
  g.strokeStyle='rgba(255,255,255,.16)';g.lineWidth=M(.9);for(let k=.25;k<1;k+=.25){g.beginPath();g.ellipse(X(gr.x),Z(gr.z),M(gr.rx*k),M(gr.rz*k),0,0,7);g.stroke();}
  const sl=[0,0];g.fillStyle='rgba(35,26,46,.42)';
  for(let ax=-gr.rx+1;ax<gr.rx;ax+=2.1)for(let az=-gr.rz+1;az<gr.rz;az+=2.1){if((ax/gr.rx)**2+(az/gr.rz)**2>.8)continue;const x=gr.x+ax,z=gr.z+az;if(Math.hypot(x-H.cup[0],z-H.cup[1])<1.1)continue;slopeAt(H,x,z,sl);const m=Math.hypot(sl[0],sl[1]);if(m<.008)continue;
   const ux=-sl[0]/m,uz=-sl[1]/m,len=M(.45+Math.min(.5,m*7)),px=X(x),pz=Z(z),qx=-uz,qz=ux;g.beginPath();g.moveTo(px+ux*len,pz+uz*len);g.lineTo(px-ux*len*.5+qx*len*.6,pz-uz*len*.5+qz*len*.6);g.lineTo(px-ux*len*.15,pz-uz*len*.15);g.lineTo(px-ux*len*.5-qx*len*.6,pz-uz*len*.5-qz*len*.6);g.closePath();g.fill();}
  // 6. the tee box
  const [tx,tz]=d.tee;g.fillStyle='#74d47a';g.fillRect(X(tx-2.4),Z(tz-2.4),M(4.8),M(4.8));
  // 7. painted shadows (trees, walls, posts) on the sun's far side
  const sx=-toSun.x/toSun.y,sz=-toSun.z/toSun.y;g.fillStyle='rgba(35,26,46,.24)';
  for(let i=0;i<H.nt;i++){const o=i*4,s=H.trees[o+2],k=H.trees[o+3],hh=(k===1?5:k===2?3.6:3.4)*s,r=(k===1?1.8:k===2?1.5:2.1)*s;g.beginPath();g.ellipse(X(H.trees[o]+sx*hh*.7),Z(H.trees[o+1]+sz*hh*.7),M(r*1.15),M(r*.85),Math.atan2(sz,sx),0,7);g.fill();}
  g.strokeStyle='rgba(35,26,46,.24)';for(let i=0;i<H.nw;i++){const o=i*6,hh=H.walls[o+4];g.lineWidth=M(hh*.8);g.beginPath();g.moveTo(X(H.walls[o]+sx*hh*.4),Z(H.walls[o+1]+sz*hh*.4));g.lineTo(X(H.walls[o+2]+sx*hh*.4),Z(H.walls[o+3]+sz*hh*.4));g.stroke();}
  for(let i=0;i<H.np;i++){const o=i*5,r=H.posts[o+2],hh=H.posts[o+3];g.beginPath();g.ellipse(X(H.posts[o]+sx*hh*.5),Z(H.posts[o+1]+sz*hh*.5),M(r*1.1),M(r*.9),0,0,7);g.fill();}
 });}

/* ---- trees: three kinds, one instanced draw each ---- */
function treeGeo(kind:number){const o:Parts=[];
 if(kind===0){P(o,cyl(.16,.26,2.4,7),'#7a5232',0,1.2,0,0,0,.05,true);P(o,ico(2.1,1),'#3f9a52',0,3.6,0,0,0,.09,true);P(o,ico(1.35,0),'#58b864',.7,4.5,.5,0,0,.07,true);P(o,ico(1.2,0),'#2f8a4a',-.9,3,-.4,0,0,.07,true);}
 else if(kind===1){for(let i=0;i<4;i++)P(o,cyl(.15,.2,1.45,6),'#9a7048',i*.16,.7+i*1.35,0,0,-.08,.04,true);for(let i=0;i<7;i++){const a=i/7*Math.PI*2;P(o,box(2.6,.07,.6),i%2?'#3aa65a':'#2f8f4e',.64+Math.cos(a)*1.25,5.35-.25,Math.sin(a)*1.25,-a,-.35,.04);}P(o,ico(.24,0),'#7a5232',.64,5.25,.2,0,0,.03,true);}
 else{P(o,cyl(.14,.2,1.2,6),'#6a4a2e',0,.6,0,0,0,.04,true);P(o,cone(1.7,2.4,8),'#2f7a52',0,2.2,0,0,0,.08,true);P(o,cone(1.35,2.1,8),'#3c8f5e',0,3.4,0,0,0,.07,true);P(o,cone(.95,1.8,8),'#4aa068',0,4.5,0,0,0,.06,true);}
 return bakeParts(o);}

function ballTex(){return canvasTex(256,128,g=>{g.fillStyle='#fffaf0';g.fillRect(0,0,256,128);g.fillStyle=COMIC_INK;
 const spot=(x:number,y:number,r:number)=>{g.beginPath();for(let i=0;i<5;i++){const a=i/5*Math.PI*2-Math.PI/2;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r*.9);}g.closePath();g.fill();};
 for(const [x,y] of [[32,30],[96,64],[160,30],[224,64],[32,98],[160,98],[96,8],[224,120]])spot(x,y,15);
 g.strokeStyle='#d8cfbf';g.lineWidth=2;for(let x=0;x<256;x+=32){g.beginPath();g.moveTo(x,0);g.lineTo(x+16,128);g.stroke();}});}
function blobTex(){return canvasTex(64,64,g=>{const r=g.createRadialGradient(32,32,4,32,32,30);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.6,'rgba(255,255,255,.75)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);});}

/* ---- the baked scenery of one hole ---- */
function scenery(H:Hole):T.BufferGeometry{const o:Parts=[],d=H.def,y=(x:number,z:number)=>heightAt(H,x,z),rnd=seeded(H.ix*53+9);
 // colliders
 for(let i=0;i<H.nw;i++){const w=H.walls.subarray(i*6,i*6+6),dx=w[2]-w[0],dz=w[3]-w[1],L=Math.hypot(dx,dz),ry=Math.atan2(-dz,dx),k=w[5];
  const n=Math.max(1,Math.ceil(L/(k===1?2.5:4)));for(let s=0;s<n;s++){const t0=s/n,t1=(s+1)/n,mx=w[0]+dx*(t0+t1)/2,mz=w[1]+dz*(t0+t1)/2,seg=L/n,gy=y(mx,mz);
   if(k===0)P(o,box(seg+.02,w[4],.5),s%2?'#d9c7a8':'#cdb894',mx,gy+w[4]/2-.1,mz,ry,0,.05);
   else if(k===1){P(o,box(.16,w[4]+.2,.16),'#8a5a3a',w[0]+dx*t0,y(w[0]+dx*t0,w[1]+dz*t0)+w[4]/2,w[1]+dz*t0,ry,0,.03);P(o,box(seg,.12,.06),'#c98a4b',mx,gy+w[4]*.8,mz,ry,0,.025);P(o,box(seg,.12,.06),'#c98a4b',mx,gy+w[4]*.4,mz,ry,0,.025);}
   else if(k===2)P(o,box(seg+.1,w[4],1.1),s%2?'#2f8a4a':'#3a9a54',mx,gy+w[4]/2-.05,mz,ry,0,.07);
   else{P(o,box(seg,.08,.1),'#b07a4a',mx,gy+w[4],mz,ry,0,.025);P(o,box(.1,w[4],.1),'#8a5a3a',w[0]+dx*t0,gy+w[4]/2,w[1]+dz*t0,ry,0,.025);}}}
 for(let i=0;i<H.np;i++){const p=H.posts.subarray(i*5,i*5+5),gy=y(p[0],p[1]),k=p[4];
  if(k===0){P(o,new T.DodecahedronGeometry(p[2]*1.05,0),'#a89a94',p[0],gy+p[3]*.4,p[1],rnd()*3,0,.08,true);P(o,new T.DodecahedronGeometry(p[2]*.6,0),'#c2b6ae',p[0]+p[2]*.5,gy+p[3]*.75,p[1]-p[2]*.2,rnd()*3,0,.06,true);}
  else if(k===1){const g=cyl(p[2],p[2],p[3],10);g.rotateZ(Math.PI/2);P(o,g,'#e8c45a',p[0],gy+p[2]*.9,p[1],rnd()*3,0,.06,true);}
  else if(k===2){P(o,cyl(p[2],p[2]+.2,.7,16),'#d9c7a8',p[0],gy+.35,p[1],0,0,.06,true);P(o,cyl(p[2]-.25,p[2]-.25,.06,16),FG_COLORS.water,p[0],gy+.68,p[1],0,0,0);P(o,cyl(.35,.5,1.4,10),'#cdb894',p[0],gy+1.2,p[1],0,0,.05,true);P(o,cyl(1.1,.8,.3,12),'#d9c7a8',p[0],gy+1.9,p[1],0,0,.05,true);P(o,ico(.4,0),'#bfe9f5',p[0],gy+2.3,p[1],0,0,.04,true);}
  else if(p[2]>.5){// a plinth with a bronze footballer on it (the museum's statue)
   P(o,box(p[2]*1.6,p[3],p[2]*1.6),'#e9d6b2',p[0],gy+p[3]/2,p[1],.4,0,.05);P(o,cyl(.22,.3,1.3,8),'#b9824a',p[0],gy+p[3]+.65,p[1],0,0,.04,true);P(o,ico(.24,1),'#c99252',p[0],gy+p[3]+1.5,p[1],0,0,.03,true);P(o,box(.16,.9,.16),'#a8723e',p[0]+.2,gy+p[3]+.35,p[1]+.25,0,.5,.03);P(o,ico(.2,1),'#fff3d6',p[0]+.55,gy+p[3]+.2,p[1]+.4,0,0,.03,true);}
  else{P(o,cyl(p[2],p[2],p[3],8),'#fff3d6',p[0],gy+p[3]/2,p[1],0,0,.04,true);P(o,box(.9,.5,.06),FG_COLORS.red,p[0]+.45,gy+p[3]-.3,p[1],0,0,.03);}}
 // the bridge deck
 if(d.bridge){const c=d.bridge.c,dx=c.p[2]-c.p[0],dz=c.p[3]-c.p[1],L=Math.hypot(dx,dz),ry=Math.atan2(-dz,dx);for(let t=0;t<L;t+=.6){const x=c.p[0]+dx*t/L,z=c.p[1]+dz*t/L;P(o,box(.5,.12,c.w*2),t%1.2<.6?'#c98a4b':'#b97a40',x,H.deckY+.02,z,ry,0,.02);}
  for(const s of [-1,1])for(let t=0;t<=L;t+=L/3){const x=c.p[0]+dx*t/L-dz/L*s*c.w,z=c.p[1]+dz*t/L+dx/L*s*c.w;P(o,cyl(.18,.18,2.4,6),'#8a5a3a',x,H.deckY-.9,z,0,0,.03,true);}}
 // tee markers
 P(o,ico(.13,0),FG_COLORS.red,d.tee[0]-2.2,y(d.tee[0]-2.2,d.tee[1])+.12,d.tee[1],0,0,.025,true);P(o,ico(.13,0),FG_COLORS.red,d.tee[0]+2.2,y(d.tee[0]+2.2,d.tee[1])+.12,d.tee[1],0,0,.025,true);
 // the landmark of each place
 const at=(x:number,z:number)=>Math.max(FG.water,y(x,z));
 const house=(x:number,z:number,w:number,h:number,dp:number,c:string,roof:string,ry=0)=>{const gy=at(x,z);P(o,box(w,h,dp),c,x,gy+h/2-.2,z,ry,0,.07);const r=new T.CylinderGeometry(.01,w*.62,1.6,4,1);r.rotateY(Math.PI/4);r.scale(1,1,dp/w);P(o,r,roof,x,gy+h+.6,z,ry,0,.06);
  for(let k=0;k<Math.floor(w/1.6);k++)P(o,box(.6,.8,.05),'#7a5a80',x-w/2+1+k*1.6,gy+h*.6,z+dp/2+.02,ry,0,0);};
 switch(d.place){
  case 'jetty':{const x=6,z=-68,gy=at(x,z);for(let i=0;i<5;i++)P(o,cyl(1.55-i*.12,1.65-i*.12,2.6,14),i%2?'#fff3d6':FG_COLORS.red,x,gy+1.3+i*2.6,z,0,0,.08,true);P(o,cyl(1.3,1.3,.3,14),COMIC_INK,x,gy+13.2,z,0,0,0,true);P(o,cyl(.95,.95,1.5,10),'#fff1b0',x,gy+14,z,0,0,.05,true);P(o,cone(1.35,1.4,12),FG_COLORS.red,x,gy+15.4,z,0,0,.06,true);
   for(let t=0;t<20;t+=1.2)P(o,box(1.1,.14,3),'#b97a40',-16-t,.7,-20,0,0,.02);for(let t=0;t<20;t+=4)for(const s of [-1,1])P(o,cyl(.15,.15,2.6,6),'#6a4a2e',-16-t,-.4,-20+s*1.3,0,0,.03,true);P(o,box(3.2,.8,1.4),'#2f8fd8',-30,.3,-24,.2,0,.06);break;}
  case 'beach':for(let i=0;i<6;i++)house(-30,-8-i*9,4,3,3.4,['#ff9a8a','#ffd36a','#8fd4ee','#a6e3a1','#ffb27a','#d6b0f0'][i],'#fff3d6',Math.PI/2);
   P(o,box(2.6,.2,2.6),'#fff3d6',22,4.6,-34,0,0,.05);for(const s of [-1,1])for(const q of [-1,1])P(o,cyl(.1,.1,4.6,6),'#b97a40',22+s*1.1,2.3,-34+q*1.1,0,0,.03,true);P(o,box(2.8,1.6,2.8),FG_COLORS.red,22,5.5,-34,0,0,.05);
   for(let i=0;i<4;i++){const x=-18+i*2,z=-40-i*8,gy=at(x,z);P(o,cyl(.05,.05,2.2,5),'#fff3d6',x,gy+1.1,z,0,0,.02,true);P(o,cone(1.3,.6,10),i%2?FG_COLORS.red:FG_COLORS.teal,x,gy+2.3,z,0,0,.04,true);}break;
  case 'plaza':for(let i=0;i<7;i++){house(-54,-10-i*13,6,4+(i%3)*1.8,8,['#ffd9a8','#f7b58a','#fff3d6','#f2957a','#bfe9f5'][i%5],['#f0452e','#d9604f','#c9584a'][i%3],Math.PI/2);house(25,-6-i*13,6,4+((i+1)%3)*1.6,8,['#fff3d6','#bfe9f5','#ffd9a8'][i%3],['#c9584a','#f0452e'][i%2],-Math.PI/2);}
   for(let i=0;i<5;i++)house(-50+i*14,-106,9,5+(i%2)*2,6,['#f7b58a','#fff3d6','#ffd9a8'][i%3],'#d9604f');{const gy=at(-46,-30);P(o,box(4,14,4),'#e9d6b2',-48,gy+7,-30,0,0,.08);P(o,cone(3.2,4,4),FG_COLORS.red,-48,gy+16,-30,Math.PI/4,0,.07);P(o,cyl(1,1,.2,14),'#fff3d6',-48,gy+11,-27.9,0,Math.PI/2,.04,true);}break;
  case 'farm':{const x=-33,z=-86,gy=at(x,z);P(o,box(9,5,7),'#d8463a',x,gy+2.3,z,0,0,.09);const r=new T.CylinderGeometry(.01,6.2,2.6,4,1);r.rotateY(Math.PI/4);r.scale(1,1,.8);P(o,r,'#6a4a3a',x,gy+5.9,z,0,0,.07);P(o,box(3,3.4,.1),'#fff3d6',x,gy+1.6,z+3.55,0,0,0);
   P(o,cyl(2.2,2.2,10,12),'#c9d2dc',x+8,gy+5,z-2,0,0,.08,true);P(o,new T.SphereGeometry(2.2,12,6,0,Math.PI*2,0,Math.PI/2),'#a8b4c0',x+8,gy+10,z-2,0,0,.06,true);
   for(let i=0;i<6;i++){const fx=30+i*2.6;P(o,box(.14,1.2,.14),'#8a5a3a',fx,at(fx,-20)+.6,-20,0,0,.03);P(o,box(2.6,.1,.06),'#c98a4b',fx+1.3,at(fx,-20)+.9,-20,0,0,.02);}
   const wx=34,wz=-104,wy=at(wx,wz);P(o,cyl(1.2,1.8,8,8),'#fff3d6',wx,wy+4,wz,0,0,.07,true);P(o,cone(1.6,1.6,8),'#8a5a3a',wx,wy+8.8,wz,0,0,.05,true);for(let i=0;i<4;i++)P(o,box(.5,5.2,.08),'#e9d6b2',wx+Math.cos(i*Math.PI/2+.4)*2.6,wy+8+Math.sin(i*Math.PI/2+.4)*2.6,wz+1.3,0,i*Math.PI/2+.4+Math.PI/2,.03);break;}
  case 'boardwalk':for(let t=-46;t<40;t+=1)P(o,box(.95,.16,4),t%2?'#c98a4b':'#b97a40',t,at(t,-39)+.25,-39.5,0,0,.02);
   for(let i=0;i<6;i++)house(-40+i*7,-30,5,3.2,4,['#ff9a8a','#ffd36a','#8fd4ee','#a6e3a1','#ffb27a','#d6b0f0'][i],'#fff3d6');
   {const cx=34,cz=-64,cy=at(cx,cz)+11;P(o,box(.5,11,.5),'#6a5a7a',cx-2,cy-5.5,cz,0,.18,.04);P(o,box(.5,11,.5),'#6a5a7a',cx+2,cy-5.5,cz,0,-.18,.04);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;P(o,box(.12,9.6,.12),'#fff3d6',cx,cy,cz,0,a,.02);P(o,box(1.3,1.1,1.1),['#f0452e','#19b5a5','#ffc83a','#2f8fd8'][i%4],cx+Math.cos(a)*4.8,cy+Math.sin(a)*4.8,cz,0,0,.05);}}break;
  case 'museum':{const x=0,z=-78,gy=at(x,z);P(o,box(30,7,9),'#fff3d6',x,gy+3.3,z-1,0,0,.1);P(o,box(31,.8,10),'#e9d6b2',x,gy+7.1,z-1,0,0,.06);const r=new T.CylinderGeometry(.01,16,3,3,1);r.rotateZ(0);r.scale(1,1,.3);P(o,r,'#e9d6b2',x,gy+8.9,z+2.4,0,0,.07);
   for(let i=0;i<8;i++)P(o,cyl(.42,.48,6.2,10),'#fffaf0',x-12.6+i*3.6,gy+3.1,z+4,0,0,.04,true);for(let i=0;i<3;i++)P(o,box(26-i*2,.35,1.2),'#d9c7a8',x,gy+.15+i*.35,z+5.6+(2-i)*1.1,0,0,.03);
   for(const s of [-1,1]){P(o,box(1,2.2,1),'#cdb894',x+s*16,gy+1.1,z+8,0,0,.04);P(o,ico(.9,1),'#d9c7a8',x+s*16,gy+2.9,z+8,0,0,.05,true);}
   for(let i=0;i<6;i++)for(const s of [-1,1])P(o,ico(.9,0),'#2f8a4a',s*(20+(i%2)*2),at(s*20,-10-i*10)+.8,-10-i*10,0,0,.06,true);break;}
  case 'coral':for(let i=0;i<14;i++){const a=rnd()*6.28,r=14+rnd()*12,x=2+Math.cos(a)*r,z=-30+Math.sin(a)*r*1.3;if(y(x,z)>FG.water-.3)continue;P(o,cone(.5+rnd()*.6,1+rnd(),6),['#ff8a7a','#ffb07a','#ff65c8','#ffd36a'][i%4],x,y(x,z)+.4,z,0,0,.04,true);}
   {const gy=at(14,-34);P(o,box(3,2,3),'#c98a4b',14,gy+1,-34,0,0,.06);const r=new T.CylinderGeometry(.01,2.6,1.6,4,1);r.rotateY(Math.PI/4);P(o,r,'#e8c45a',14,gy+2.8,-34,0,0,.05);}
   for(let i=0;i<5;i++)P(o,new T.DodecahedronGeometry(1+rnd(),0),'#b8aca4',-14+rnd()*30,.1,-62-rnd()*8,rnd()*3,0,.07,true);break;
  case 'summit':{const x=4,z=-150,gy=at(x,z);P(o,cyl(.08,.08,7,6),'#fff3d6',x,gy+3.5,z,0,0,.03,true);P(o,box(2.4,1.4,.05),FG_COLORS.teal,x+1.2,gy+6.2,z,0,0,.02);
   for(let i=0;i<6;i++)P(o,new T.DodecahedronGeometry(.6-i*.06,0),'#a89a94',x-4,gy+.4+i*.75,z+2,rnd()*3,0,.05,true);
   for(let i=0;i<14;i++){const s=rnd()<.5?-1:1,rx=s*(28+rnd()*18),rz=-10-rnd()*140;P(o,new T.DodecahedronGeometry(2+rnd()*3,0),rnd()<.5?'#9a8e8a':'#b2a69e',rx,y(rx,rz)+.5,rz,rnd()*3,0,.1,true);}break;}
  case 'stadium':{for(const s of [-1,1]){for(let t=0;t<3;t++)P(o,box(10,2.2,60),['#4a3a6a','#5a4478','#6a4e88'][t],s*(36+t*5),at(s*36,-120)+1+t*2.2,-122,0,0,.08);
    P(o,box(.8,24,.8),'#3a2f58',s*48,at(s*48,-90)+12,-90,0,0,.06);P(o,box(6,2.4,.8),'#fffbe0',s*48,at(s*48,-90)+24,-90,0,0,.06);}
   for(let t=0;t<3;t++)P(o,box(70,2.2,8),['#4a3a6a','#5a4478','#6a4e88'][t],0,at(0,-158)+1+t*2.2,-156-t*4,0,0,.08);
   P(o,box(1.2,4.2,1.2),'#e9d6b2',-5.2,at(-5.2,-112)+2,-112,0,0,.06);P(o,box(1.2,4.2,1.2),'#e9d6b2',1.2,at(1.2,-112)+2,-112,0,0,.06);P(o,box(8,1.4,.9),FG_COLORS.red,-2,at(-2,-112)+4.6,-112,0,0,.06);P(o,box(5,.7,.05),'#fff3d6',-2,at(-2,-112)+4.6,-111.5,0,0,0);break;}
 }
 return bakeParts(o);}

/* ---- the apron: the land around the hole, then the coast, then the sea floor ---- */
function apronGeo(H:Hole,place:Place){const [x0,z0,x1,z1]=H.def.bounds,cx=(x0+x1)/2,cz=(z0+z1)/2,hw=(x1-x0)/2,hd=(z1-z0)/2,NA=72,RINGS=[-1.5,6,16,30,50,76,110,150],rnd=seeded(H.ix*7+3),ph=rnd()*6;
 const pos=new Float32Array(NA*RINGS.length*3),col=new Float32Array(NA*RINGS.length*3),C=new T.Color();
 for(let a=0;a<NA;a++){const t=a/NA*Math.PI*2,c=Math.cos(t),s=Math.sin(t),m=Math.max(Math.abs(c)/hw,Math.abs(s)/hd),ex=cx+c/m,ez=cz+s/m,eh=heightAt(H,Math.max(x0,Math.min(x1,ex)),Math.max(z0,Math.min(z1,ez)));
  for(let r=0;r<RINGS.length;r++){const d=RINGS[r],x=ex+c*d,z=ez+s*d,land=eh>FG.water+.3?1:0,hill=(Math.sin(t*5+ph)*.5+Math.sin(t*11+ph*2)*.3+.6)*place.hills*Math.min(1,Math.max(0,d)/40)*(1-Math.max(0,(d-90)/60));
   let h=r===0?eh-.08:eh*(1-Math.min(1,d/110))+hill*land-3.2*Math.min(1,Math.max(0,(d-70)/60));if(!land)h=Math.min(eh,-1.6)-d*.02;
   const i=(r*NA+a)*3;pos[i]=x;pos[i+1]=h;pos[i+2]=z;
   C.set(h<FG.water+.1?'#d8c98e':h<FG.water+.6?FG_COLORS.sand:place.hills>10&&h>6?(r%2?'#9a96a8':'#8a8aa0'):r%2?'#3f9a50':'#47a356');col[i]=C.r;col[i+1]=C.g;col[i+2]=C.b;}}
 const idx:number[]=[];for(let r=0;r+1<RINGS.length;r++)for(let a=0;a<NA;a++){const b=(a+1)%NA,i0=r*NA+a,i1=r*NA+b,i2=(r+1)*NA+a,i3=(r+1)*NA+b;idx.push(i0,i2,i1,i1,i2,i3);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('color',new T.BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();return g;}

function terrainGeo(H:Hole){const W=H.nx+1,n=W*(H.nz+1),pos=new Float32Array(n*3),uv=new Float32Array(n*2),[x0,z0,x1,z1]=H.def.bounds;
 for(let j=0;j<=H.nz;j++)for(let i=0;i<=H.nx;i++){const k=j*W+i,x=H.x0+i*H.cs,z=H.z0+j*H.cs;pos[k*3]=x;pos[k*3+1]=H.h[k];pos[k*3+2]=z;uv[k*2]=(x-x0)/(x1-x0);uv[k*2+1]=1-(z-z0)/(z1-z0);}
 const idx=new Uint32Array(H.nx*H.nz*6);let q=0;for(let j=0;j<H.nz;j++)for(let i=0;i<H.nx;i++){const a=j*W+i,b=a+1,c=a+W,d=c+1;idx[q++]=a;idx[q++]=c;idx[q++]=b;idx[q++]=b;idx[q++]=c;idx[q++]=d;}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(new T.BufferAttribute(idx,1));g.computeVertexNormals();return g;}

export type CamMode='flyover'|'aim'|'chase'|'cup'|'still';
const PREVIEW=90,TRAIL=18,BITS=48,DECO=36;
export type FootgolfView=ReturnType<typeof createFootgolfView>;
export function createFootgolfView(host:HTMLElement,o:{reduced:boolean;mobile:boolean}){
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');canvas.dataset.footgolfCanvas='';canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';host.prepend(canvas);
 const renderer=new T.WebGLRenderer({canvas,antialias:!o.mobile,powerPreference:'low-power',alpha:false});renderer.toneMapping=T.NoToneMapping;
 const scene=new T.Scene(),bg=new T.Color('#8fd4ee');scene.background=bg;const fog=new T.Fog('#d6f1f5',90,330);scene.fog=fog;
 const camera=new T.PerspectiveCamera(52,.5,.1,700),ink=createComicUniforms({});
 const hemi=new T.HemisphereLight('#ffffff','#a79bb5',.55),sun=new T.DirectionalLight('#ffffff',2.6),toSun=new T.Vector3(-.62,.56,.55).normalize();sun.position.copy(toSun).multiplyScalar(60);scene.add(hemi,sun,sun.target);
 const owned:{dispose():void}[]=[],own=<X extends {dispose():void}>(x:X)=>{owned.push(x);return x;};
 const lit=<X extends T.Material>(m:X,rim=false)=>comicMaterial(own(m),{uniforms:ink,rim});
 const vmat=lit(new T.MeshLambertMaterial({vertexColors:true}));
 const backMat=own(new T.MeshBasicMaterial({fog:false,side:T.BackSide})),back=new T.Mesh(own(new T.CylinderGeometry(420,420,200,48,1,true)),backMat);back.position.y=62;back.frustumCulled=false;scene.add(back);
 const sea=new T.Mesh(own(new T.PlaneGeometry(1800,1800).rotateX(-Math.PI/2)),lit(new T.MeshLambertMaterial({color:FG_COLORS.water})));sea.position.y=FG.water;scene.add(sea);
 const groundMat=lit(new T.MeshLambertMaterial({color:'#ffffff'})),ground=new T.Mesh(new T.BufferGeometry(),groundMat);ground.frustumCulled=false;scene.add(ground);
 const apron=new T.Mesh(new T.BufferGeometry(),vmat);apron.frustumCulled=false;scene.add(apron);
 const place=new T.Mesh(new T.BufferGeometry(),vmat);place.frustumCulled=false;scene.add(place);
 let groundT:T.Texture|null=null,backTex:T.Texture|null=null;
 const mk=(geo:T.BufferGeometry,mat:T.Material,n:number)=>{const m=new T.InstancedMesh(geo,mat,n);m.instanceMatrix.setUsage(T.DynamicDrawUsage);m.count=0;m.frustumCulled=false;scene.add(m);return m;};
 const trees=[0,1,2].map(k=>mk(own(treeGeo(k)),vmat,16+DECO));
 // the pin: cup rim + hole + pole; the flag cloth (2 x 9 vertices, moved with the wind)
 const pinParts:Parts=[];inkedPart(pinParts,cyl(.03,.03,2.4,6),(t)=>Math.floor(t/4)%2?'#fff3d6':FG_COLORS.red,partAt(0,1.2,0),.025,true);const pinG=bakeParts(pinParts);
 const pin=new T.Mesh(own(pinG),vmat);scene.add(pin);
 const hole=new T.Mesh(own(new T.CircleGeometry(FG.cupR,20).rotateX(-Math.PI/2)),own(new T.MeshBasicMaterial({color:'#2a2034'})));hole.renderOrder=1;scene.add(hole);
 const rim=new T.Mesh(own(new T.RingGeometry(FG.cupR,FG.cupR+.05,24).rotateX(-Math.PI/2)),own(new T.MeshBasicMaterial({color:'#fffaf0'})));scene.add(rim);
 const clothG=own(new T.PlaneGeometry(.95,.6,8,1)),cloth=new T.Mesh(clothG,lit(new T.MeshLambertMaterial({color:FG_COLORS.red,side:T.DoubleSide}),true));scene.add(cloth);const clothBase=Float32Array.from(clothG.attributes.position.array as Float32Array);
 // the ball, its shadow, the preview, the landing ring, the trail, bits
 const ballMat=lit(new T.MeshLambertMaterial({map:own(ballTex())}),true),ball=new T.Mesh(own(new T.SphereGeometry(FG.R,20,14)),ballMat);scene.add(ball);
 const blob=new T.Mesh(own(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2)),own(new T.MeshBasicMaterial({map:own(blobTex()),transparent:true,depthWrite:false,color:COMIC_INK,opacity:.42})));blob.renderOrder=2;scene.add(blob);
 const topMat=own(new T.MeshBasicMaterial({color:'#ffffff',depthTest:false,fog:false,transparent:true}));
 const ghost=mk(own(new T.SphereGeometry(1,8,6)),topMat,PREVIEW);ghost.renderOrder=12;
 const landRing=new T.Mesh(own(new T.RingGeometry(.55,.8,24).rotateX(-Math.PI/2)),own(new T.MeshBasicMaterial({color:FG_COLORS.sun,depthTest:false,transparent:true,fog:false})));landRing.renderOrder=11;landRing.visible=false;scene.add(landRing);
 const fxMat=own(new T.MeshBasicMaterial({color:'#ffffff'})),trail=mk(own(new T.SphereGeometry(1,6,4)),fxMat,TRAIL),bits=mk(own(new T.BoxGeometry(1,1,1)),fxMat,BITS);
 const M4=new T.Matrix4(),Q=new T.Quaternion(),Qb=new T.Quaternion(),V=new T.Vector3(),V2=new T.Vector3(),SC=new T.Vector3(),CC=new T.Color(),UP=new T.Vector3(0,1,0),AX=new T.Vector3(),SL=[0,0];
 const bp=new Float32Array(BITS*8),bc=new Float32Array(BITS*3);let bi=0;const tp=new Float32Array(TRAIL*4);let ti=0,trailAt=0;
 let ghostN=0;const ghostP=new Float32Array(PREVIEW*3);
 function burst(x:number,y:number,z:number,n:number,cols:readonly string[],speed:number,size=.1){if(o.reduced)n=Math.ceil(n/3);for(let i=0;i<n;i++){const j=bi++%BITS,a=Math.random()*6.283,u=Math.random();bp[j*8]=x;bp[j*8+1]=y;bp[j*8+2]=z;bp[j*8+3]=Math.cos(a)*speed*(.3+u);bp[j*8+4]=speed*(.5+Math.random()*.9);bp[j*8+5]=Math.sin(a)*speed*(.3+u);bp[j*8+6]=.6+Math.random()*.5;bp[j*8+7]=size*(.6+Math.random()*.8);CC.set(cols[i%cols.length]);bc[j*3]=CC.r;bc[j*3+1]=CC.g;bc[j*3+2]=CC.b;}}
 // camera state
 const cam={mode:'still' as CamMode,pos:new T.Vector3(0,20,30),look:new T.Vector3(),tPos:new T.Vector3(),tLook:new T.Vector3(),fly:0,flyDur:4.6,yaw:0,kind:'long' as KickKind,lastT:0,orbit:0,cx:0,cz:-1};
 let H:Hole|null=null,W=1,Hh=1,lastBX=0,lastBZ=0,flagWave=0;
 function measure(){camera.aspect=W/Hh;camera.fov=W/Hh<.75?60:50;
  // upright phones: the kick picker covers the bottom fifth, so the picture is shifted up (a sheared frustum: no zoom, no extra cost)
  const lift=Math.round(Hh*(W/Hh<.8?.17:.13));camera.setViewOffset(W,Hh,0,lift,W,Hh);camera.updateProjectionMatrix();}
 function resize(w:number,h:number,dpr:number){W=w;Hh=h;renderer.setPixelRatio(Math.min(o.mobile?1.5:2,dpr));renderer.setSize(w,h,false);comicDotCell(ink,renderer);measure();}
 function setHole(g:FootGolf){const s=g.state;H=s.hole;const p=PLACES[H.def.place]??PLACES.jetty;
  backTex?.dispose();backTex=backdropTex(H.def.place);backTex.wrapS=T.RepeatWrapping;backTex.repeat.set(2,1);backMat.map=backTex;backMat.needsUpdate=true;
  groundT?.dispose();groundT=groundTex(H,toSun);groundMat.map=groundT;groundMat.needsUpdate=true;
  ground.geometry.dispose();ground.geometry=terrainGeo(H);apron.geometry.dispose();apron.geometry=apronGeo(H,p);place.geometry.dispose();place.geometry=scenery(H);
  fog.color.set(p.fog);bg.set(p.fog);ink.uInkShade.value.setRGB(...p.shade);hemi.color.set(p.hemi);hemi.groundColor.set(p.hemiG);
  const [x0,z0,x1,z1]=H.def.bounds;back.position.x=(x0+x1)/2;back.position.z=(z0+z1)/2;
  // trees: the hole's own + decoration on the land outside the bounds
  const n=[0,0,0],rnd=seeded(H.ix*131+7);const put=(k:number,x:number,z:number,s:number,y:number,r:number)=>{const m=trees[k];if(n[k]>=m.instanceMatrix.count)return;Q.setFromAxisAngle(UP,r);SC.set(s,s,s);V.set(x,y,z);M4.compose(V,Q,SC);m.setMatrixAt(n[k]++,M4);};
  for(let i=0;i<H.nt;i++){const t=H.trees.subarray(i*4,i*4+4);put(t[3],t[0],t[1],t[2],heightAt(H,t[0],t[1])-.1,rnd()*6);}
  const ap=apron.geometry.attributes.position as T.BufferAttribute,decoKind=H.def.place==='beach'||H.def.place==='coral'?1:H.def.place==='summit'||H.def.place==='museum'||H.def.place==='jetty'?2:0;
  for(let i=0;i<DECO*3&&n[decoKind]<16+DECO-2;i++){const v=72+Math.floor(rnd()*72*3);const y=ap.getY(v);if(y<FG.water+.6)continue;put(i%5===0&&decoKind!==1?0:decoKind,ap.getX(v)+(rnd()-.5)*6,ap.getZ(v)+(rnd()-.5)*6,.9+rnd()*.7,y-.3,rnd()*6);}
  trees.forEach((m,k)=>{m.count=n[k];m.instanceMatrix.needsUpdate=true;});
  const cy=H.cupY;hole.position.set(H.cup[0],cy+.012,H.cup[1]);rim.position.set(H.cup[0],cy+.014,H.cup[1]);pin.position.set(H.cup[0],cy,H.cup[1]);cloth.position.set(H.cup[0],cy+2.1,H.cup[1]);
  ghostN=0;ghost.count=0;landRing.visible=false;trail.count=0;for(let i=0;i<TRAIL;i++)tp[i*4+3]=0;ti=0;for(let i=0;i<BITS;i++)bp[i*8+6]=0;
  cam.yaw=0;startFlyover(s.ball.x,s.ball.z);lastBX=s.ball.x;lastBZ=s.ball.z;}
 function startFlyover(bx:number,bz:number){if(!H)return;cam.mode='flyover';cam.fly=0;cam.flyDur=o.reduced?.01:Math.min(6,3.2+H.metres/60);void bx;void bz;}
 const routePt=(u:number,out:T.Vector3)=>{const r=H!.route;let total=0;for(let i=2;i<r.length;i+=2)total+=Math.hypot(r[i]-r[i-2],r[i+1]-r[i-1]);let want=u*total;
  for(let i=2;i<r.length;i+=2){const L=Math.hypot(r[i]-r[i-2],r[i+1]-r[i-1]);if(want<=L||i===r.length-2){const t=Math.min(1,want/(L||1));out.set(r[i-2]+(r[i]-r[i-2])*t,0,r[i-1]+(r[i+1]-r[i-1])*t);return out;}want-=L;}return out.set(r[0],0,r[1]);};
 function aimPose(g:FootGolf,outPos:T.Vector3,outLook:T.Vector3){const b=g.state.ball,putt=cam.kind==='putt',dist=putt?3.6:cam.kind==='pass'?6:8,ht=putt?1.35:cam.kind==='pass'?2.8:4.4,fx=Math.sin(cam.yaw),fz=-Math.cos(cam.yaw);
  outPos.set(b.x-fx*dist,0,b.z-fz*dist);const gy=heightAt(H!,outPos.x,outPos.z);outPos.y=Math.max(gy+ht*.6,b.y+ht,FG.water+1);
  const ahead=putt?Math.min(9,Math.max(3,g.cupDist()*.9)):cam.kind==='pass'?18:32;outLook.set(b.x+fx*ahead,0,b.z+fz*ahead);outLook.y=Math.max(heightAt(H!,outLook.x,outLook.z),FG.water)+(putt?.1:.2);}
 const ease=(t:number)=>t<.5?2*t*t:1-(-2*t+2)**2/2;
 function updateCamera(g:FootGolf,dt:number,now:number){if(!H)return;const s=g.state,b=s.ball;let k=1-Math.exp(-dt*4);
  if(cam.mode==='flyover'){cam.fly+=dt/cam.flyDur;const u=ease(Math.min(1,cam.fly));
   // from high behind the green, down the hole, to the aim view at the tee
   routePt(1-u*.98,V);const gy=Math.max(heightAt(H,V.x,V.z),0);routePt(Math.min(1,1-u*.98+.18+u*.0),V2);
   const up=34*(1-u)+6*u,side=(1-u)*18;cam.tPos.set(V.x-(V2.x-V.x)*.0+side,gy+up,V.z+(1-u)*22);cam.tLook.set(H.cup[0]*(1-u)+V2.x*u,heightAt(H,H.cup[0],H.cup[1])*(1-u)+(gy+1)*u,H.cup[1]*(1-u)+V2.z*u);
   if(cam.fly>=1){cam.mode='aim';aimPose(g,cam.tPos,cam.tLook);}k=cam.fly<.05?1:1-Math.exp(-dt*6);}
  else if(cam.mode==='aim'){aimPose(g,cam.tPos,cam.tLook);k=1-Math.exp(-dt*5);}
  else if(cam.mode==='chase'){const vh=Math.hypot(b.vx,b.vz);if(vh>.4){V.set(b.vx/vh,0,b.vz/vh);}else V.set(Math.sin(cam.yaw),0,-Math.cos(cam.yaw));
   const gy=Math.max(heightAt(H,b.x,b.z),FG.water),air=Math.max(0,b.y-gy),back=b.air?8.5:7;cam.tPos.set(b.x-V.x*back,Math.max(b.y,gy)+3.2+air*.35,b.z-V.z*back);
   const ty=Math.max(heightAt(H,cam.tPos.x,cam.tPos.z),FG.water)+1.2;if(cam.tPos.y<ty)cam.tPos.y=ty;cam.tLook.set(b.x+V.x*3,b.y+.3-air*.1,b.z+V.z*3);k=1-Math.exp(-dt*(b.air?2.6:3.2));
   // a rolling ball near the cup: the low view beside the cup
   const dx=H.cup[0]-b.x,dz=H.cup[1]-b.z,d=Math.hypot(dx,dz);if(!b.air&&!b.rest&&d<6&&vh>.25&&(dx*b.vx+dz*b.vz)>0){cam.mode='cup';cam.cx=dx/d;cam.cz=dz/d;}}
  else if(cam.mode==='cup'){const nx=cam.cx,nz=cam.cz;cam.tPos.set(H.cup[0]+nx*1.6-nz*1.9,H.cupY+.55,H.cup[1]+nz*1.6+nx*1.9);cam.tLook.set((b.x+H.cup[0]*2)/3,H.cupY+.1,(b.z+H.cup[1]*2)/3);k=1-Math.exp(-dt*3);}
  else{cam.orbit+=dt*.05;}
  cam.pos.lerp(cam.tPos,k);cam.look.lerp(cam.tLook,k);camera.position.copy(cam.pos);camera.lookAt(cam.look);void now;}
 function render(g:FootGolf,now:number){if(!H||g.state.hole!==H)setHole(g);if(!H)return;const s=g.state,b=s.ball,dt=Math.min(.1,cam.lastT?now-cam.lastT:1/30);cam.lastT=now;
  if(cam.mode!=='flyover'){if((s.phase==='fly'||s.phase==='roll'))cam.mode=cam.mode==='cup'?'cup':'chase';else if(s.phase==='aim')cam.mode='aim';}
  updateCamera(g,dt,now);
  // the ball: position, roll by distance travelled
  ball.position.set(b.x,b.y,b.z);const mx=b.x-lastBX,mz=b.z-lastBZ,md=Math.hypot(mx,mz);if(md>1e-5&&md<5){AX.set(mz,0,-mx).normalize();Qb.setFromAxisAngle(AX,md/FG.R);ball.quaternion.premultiply(Qb);}lastBX=b.x;lastBZ=b.z;
  const gy=heightAt(H,b.x,b.z),above=Math.max(0,b.y-FG.R-gy),showBall=s.phase!=='holed'&&!(s.phase==='done'&&s.results[s.results.length-1]?.holed);ball.visible=showBall&&s.phase!=='splash';
  blob.visible=ball.visible&&gy>FG.water-.05;blob.position.set(b.x,gy+.03,b.z);const bs=.5+above*.06;blob.scale.set(bs,1,bs);(blob.material as T.MeshBasicMaterial).opacity=Math.max(.12,.42-above*.03);
  slopeAt(H,b.x,b.z,SL);V.set(-SL[0],1,-SL[1]).normalize();blob.quaternion.setFromUnitVectors(UP,V);
  // flag: out when the ball is close on the green, flies with the wind
  // the flag comes out (lifted away) when the ball is on the green near the cup, as players take it out to putt
  const near=Math.hypot(b.x-H.cup[0],b.z-H.cup[1])<10&&s.phase!=='done';const lift=near?3:0;pin.position.y+=((H.cupY+lift)-pin.position.y)*Math.min(1,dt*3);pin.visible=cloth.visible=pin.position.y<H.cupY+2.6;cloth.position.y=pin.position.y+2.1;
  const ws=Math.hypot(H.wind[0],H.wind[1]),wa=Math.atan2(H.wind[0],H.wind[1]);flagWave+=dt*(3+ws*1.4);cloth.rotation.y=wa-Math.PI/2;
  const cp=clothG.attributes.position as T.BufferAttribute,arr=cp.array as Float32Array;for(let i=0;i<cp.count;i++){const x0=clothBase[i*3]+.475,y0=clothBase[i*3+1];arr[i*3]=x0*(.55+Math.min(.45,ws*.1));arr[i*3+1]=y0-(1-Math.min(1,ws/4))*x0*.6;arr[i*3+2]=Math.sin(flagWave-x0*5)*x0*.12*(o.reduced?.3:1);}cp.needsUpdate=true;
  // preview
  ghost.count=ghostN;
  // trail while flying
  if(b.air&&!o.reduced&&now-trailAt>.04){trailAt=now;const j=ti++%TRAIL;tp[j*4]=b.x;tp[j*4+1]=b.y;tp[j*4+2]=b.z;tp[j*4+3]=1;}
  let tn=0;for(let i=0;i<TRAIL;i++){const l=tp[i*4+3];if(l<=0)continue;tp[i*4+3]=l-dt*2.2;const sz=FG.R*.8*Math.max(0,l);if(sz<=0)continue;SC.set(sz,sz,sz);V.set(tp[i*4],tp[i*4+1],tp[i*4+2]);Q.identity();M4.compose(V,Q,SC);trail.setMatrixAt(tn,M4);trail.setColorAt(tn,CC.set('#fff3d6'));tn++;}
  trail.count=tn;trail.instanceMatrix.needsUpdate=true;if(trail.instanceColor)trail.instanceColor.needsUpdate=true;
  let bn=0;for(let i=0;i<BITS;i++){const j=i*8;if(bp[j+6]<=0)continue;bp[j+6]-=dt;bp[j+4]-=9.8*dt;bp[j]+=bp[j+3]*dt;bp[j+1]+=bp[j+4]*dt;bp[j+2]+=bp[j+5]*dt;const sz=bp[j+7]*Math.min(1,bp[j+6]*2);if(sz<=0)continue;SC.set(sz,sz,sz);V.set(bp[j],bp[j+1],bp[j+2]);Q.setFromAxisAngle(UP,bp[j+6]*7);M4.compose(V,Q,SC);bits.setMatrixAt(bn,M4);CC.setRGB(bc[i*3],bc[i*3+1],bc[i*3+2]);bits.setColorAt(bn,CC);bn++;}
  bits.count=bn;bits.instanceMatrix.needsUpdate=true;if(bits.instanceColor)bits.instanceColor.needsUpdate=true;
  aimComicSun(ink,toSun,camera);sun.position.copy(toSun).multiplyScalar(60).add(cam.look);sun.target.position.copy(cam.look);
  renderer.render(scene,camera);}
 /** The dotted flight for the aim: n points from core.predict. */
 function setPreview(buf:Float32Array,n:number,landing:boolean){ghostN=n;const cam2=camera.position;for(let i=0;i<n;i++){V.set(buf[i*3],buf[i*3+1],buf[i*3+2]);const d=V.distanceTo(cam2),sz=Math.max(.06,Math.min(.4,d*.011))*(i===n-1?1.4:1);SC.set(sz,sz,sz);Q.identity();M4.compose(V,Q,SC);ghost.setMatrixAt(i,M4);ghost.setColorAt(i,CC.set(i%2?'#fff3d6':'#ffc83a'));}
  ghost.count=n;ghost.instanceMatrix.needsUpdate=true;if(ghost.instanceColor)ghost.instanceColor.needsUpdate=true;
  if(landing&&n>1&&H){const x=buf[(n-1)*3],z=buf[(n-1)*3+2];landRing.position.set(x,Math.max(heightAt(H,x,z),FG.water)+.05,z);landRing.visible=true;}else landRing.visible=false;}
 function onEvent(e:FgEvent){if(!H)return;switch(e.type){
  case 'kick':burst(e.x,e.y,e.z,6,['#5cc063','#3f9a50','#fff3d6'],2.2,.07);ghostN=0;ghost.count=0;landRing.visible=false;break;
  case 'land':case 'bounce':if(e.k===S.sand)burst(e.x,e.y,e.z,10,['#f3d990','#e8c88a'],2.4,.09);else if(e.a>4)burst(e.x,e.y,e.z,5,['#5cc063','#8ee07a'],1.6,.06);break;
  case 'plug':burst(e.x,e.y,e.z,16,['#f3d990','#e8c88a','#fff3d6'],3,.1);break;
  case 'splash':burst(e.x,FG.water+.05,e.z,22,['#ffffff','#bfe9f5','#27b0c8'],4.2,.12);break;
  case 'leaves':burst(e.x,e.y,e.z,14,['#3f9a52','#58b864','#2f8a4a'],2,.12);break;
  case 'wall':if(e.a>2)burst(e.x,e.y,e.z,5,['#d9c7a8','#fff3d6'],1.4,.06);break;
  case 'cup':burst(H.cup[0],H.cupY+.2,H.cup[1],18,['#ffc83a','#f0452e','#19b5a5','#fff3d6'],3.4,.1);break;
  case 'tee':break;}}
 return{
  setHole,render,resize,setPreview,onEvent,startFlyover,
  setAim(yaw:number,kind:KickKind){cam.yaw=yaw;cam.kind=kind;},
  skipFlyover(){if(cam.mode==='flyover')cam.fly=1;},
  get flying(){return cam.mode==='flyover';},
  get camMode(){return cam.mode;},
  /** For the drag: the screen-space direction of the aim, so a drag reads the same whichever way the camera looks. */
  project(x:number,y:number,z:number){V.set(x,y,z).project(camera);return {x:(V.x+1)/2*W,y:(1-V.y)/2*Hh,on:V.z<1};},
  info:()=>({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,textures:renderer.info.memory.textures,geometries:renderer.info.memory.geometries,programs:renderer.info.programs?.length??0}),
  dispose(){backTex?.dispose();groundT?.dispose();ground.geometry.dispose();apron.geometry.dispose();place.geometry.dispose();for(const m of [...trees,ghost,trail,bits])m.dispose();for(const x of owned)x.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();},
 };
}
