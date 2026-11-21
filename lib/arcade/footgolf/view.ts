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
import {createComicUniforms,comicDotCell,aimComicSun,comicMaterial,comicTree,COMIC_INK,COMIC_PAPER} from '../comic/shading';
import {createIslandArcadePlayer} from '../islandArcadePlayer';
import type {ArcadePoseOptions} from '../arcadePlayerMotion';
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
/** Where each place's landmark stands (the flyover frames it behind the flag). */
const LANDMARK:Record<string,[number,number]>={jetty:[6,-68],beach:[22,-34],plaza:[-48,-30],farm:[-33,-86],boardwalk:[34,-64],museum:[0,-78],coral:[14,-34],summit:[4,-150],stadium:[0,-156]};
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
  f.save();f.translate(CW/2,CH/2);f.rotate(.5);f.fillStyle='#74d576';for(let s=-CH*1.5;s<CH*1.5;s+=M(7))f.fillRect(-CW*1.5,s,CW*3,M(3.5));f.restore();
  // every fairway piece into one mask first (destination-in per piece would keep only where the pieces overlap: a split fairway vanished)
  const mc=document.createElement('canvas');mc.width=CW;mc.height=CH;const mg=mc.getContext('2d')!;mg.lineCap='round';mg.lineJoin='round';for(const c of d.fair){mg.beginPath();mg.moveTo(X(c.p[0]),Z(c.p[1]));for(let i=2;i<c.p.length;i+=2)mg.lineTo(X(c.p[i]),Z(c.p[i+1]));mg.lineWidth=M(c.w*2);mg.stroke();}
  f.globalCompositeOperation='destination-in';f.drawImage(mc,0,0);
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
  // (the downhill arrows are drawn sharp on the decal sheet, decalTex)
  // 6. the tee box
  const [tx,tz]=d.tee;g.fillStyle='#74d47a';g.fillRect(X(tx-2.4),Z(tz-2.4),M(4.8),M(4.8));
  // the tee box mown in a check, with divots (kicked-out turf), and a worn patch behind it where players stand: texture under the lens
  g.fillStyle='rgba(255,255,255,.10)';for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i+j)%2)g.fillRect(X(tx-2.4+i*1.2),Z(tz-2.4+j*1.2),M(1.2),M(1.2));
  for(let i=0;i<26;i++){const x=tx+(rnd()-.5)*5.6,z=tz+(rnd()-.5)*5+1.4;g.fillStyle=rnd()<.5?'rgba(122,90,64,.55)':'rgba(35,26,46,.22)';g.beginPath();g.ellipse(X(x),Z(z),M(.12+rnd()*.14),M(.07+rnd()*.06),rnd()*3,0,7);g.fill();}
  {const gd=g.createRadialGradient(X(tx),Z(tz+5),M(.5),X(tx),Z(tz+5),M(4));gd.addColorStop(0,'rgba(196,170,110,.35)');gd.addColorStop(1,'rgba(196,170,110,0)');g.fillStyle=gd;g.fillRect(X(tx-5),Z(tz+1),M(10),M(8));}
  // cloud shadows: a few big soft patches over the whole sheet (light and shade across the open fairway read as distance)
  for(let i=0;i<5;i++){const cx=X(x0+rnd()*w),cz=Z(z0+rnd()*dd),r=M(9+rnd()*10),gd=g.createRadialGradient(cx,cz,r*.2,cx,cz,r);gd.addColorStop(0,'rgba(35,26,46,.13)');gd.addColorStop(1,'rgba(35,26,46,0)');g.fillStyle=gd;g.beginPath();g.ellipse(cx,cz,r*1.4,r,rnd()*3,0,7);g.fill();}
  // 7. painted shadows (trees, walls, posts) on the sun's far side
  const sx=-toSun.x/toSun.y,sz=-toSun.z/toSun.y;g.fillStyle='rgba(35,26,46,.24)';
  for(let i=0;i<H.nt;i++){const o=i*4,s=H.trees[o+2],k=H.trees[o+3],hh=(k===1?5:k===2?3.6:3.4)*s,r=(k===1?1.8:k===2?1.5:2.1)*s;g.beginPath();g.ellipse(X(H.trees[o]+sx*hh*.7),Z(H.trees[o+1]+sz*hh*.7),M(r*1.15),M(r*.85),Math.atan2(sz,sx),0,7);g.fill();}
  g.strokeStyle='rgba(35,26,46,.24)';for(let i=0;i<H.nw;i++){const o=i*6,hh=H.walls[o+4];g.lineWidth=M(hh*.8);g.beginPath();g.moveTo(X(H.walls[o]+sx*hh*.4),Z(H.walls[o+1]+sz*hh*.4));g.lineTo(X(H.walls[o+2]+sx*hh*.4),Z(H.walls[o+3]+sz*hh*.4));g.stroke();}
  for(let i=0;i<H.np;i++){const o=i*5,r=H.posts[o+2],hh=H.posts[o+3];g.beginPath();g.ellipse(X(H.posts[o]+sx*hh*.5),Z(H.posts[o+1]+sz*hh*.5),M(r*1.1),M(r*.9),0,0,7);g.fill();}
 });}

/* ---- trees: three kinds, one instanced draw each ---- */
function treeGeo(kind:number){const o:Parts=[];
 if(kind===0){P(o,new T.CylinderGeometry(.16,.26,2.4,6,1,true),'#7a5232',0,1.2,0,0,0,.05,true);P(o,ico(2.1,1),'#3f9a52',0,3.6,0,0,0,.09,true);P(o,ico(1.35,0),'#58b864',.7,4.5,.5,0,0,.07,true);P(o,ico(1.2,0),'#2f8a4a',-.9,3,-.4,0,0,.07,true);}
 else if(kind===1){for(let i=0;i<3;i++)P(o,new T.CylinderGeometry(.15,.2,1.85,5,1,true),'#9a7048',i*.21,.9+i*1.75,0,0,-.08,.04,true);for(let i=0;i<7;i++){const a=i/7*Math.PI*2;P(o,box(2.6,.07,.6),i%2?'#3aa65a':'#2f8f4e',.64+Math.cos(a)*1.25,5.35-.25,Math.sin(a)*1.25,-a,-.35,.04);}P(o,ico(.24,0),'#7a5232',.64,5.25,.2,0,0,.03,true);}
 else{P(o,new T.CylinderGeometry(.14,.2,1.2,5,1,true),'#6a4a2e',0,.6,0,0,0,.04,true);P(o,cone(1.7,2.4,8),'#2f7a52',0,2.2,0,0,0,.08,true);P(o,cone(1.35,2.1,8),'#3c8f5e',0,3.4,0,0,0,.07,true);P(o,cone(.95,1.8,8),'#4aa068',0,4.5,0,0,0,.06,true);}
 return bakeParts(o);}

function ballTex(){return canvasTex(256,128,g=>{g.fillStyle='#fffaf0';g.fillRect(0,0,256,128);g.fillStyle=COMIC_INK;
 const spot=(x:number,y:number,r:number)=>{g.beginPath();for(let i=0;i<5;i++){const a=i/5*Math.PI*2-Math.PI/2;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r*.9);}g.closePath();g.fill();};
 for(const [x,y] of [[32,30],[96,64],[160,30],[224,64],[32,98],[160,98],[96,8],[224,120]])spot(x,y,15);
 g.strokeStyle='#d8cfbf';g.lineWidth=2;for(let x=0;x<256;x+=32){g.beginPath();g.moveTo(x,0);g.lineTo(x+16,128);g.stroke();}});}
function blobTex(){return canvasTex(64,64,g=>{const r=g.createRadialGradient(32,32,4,32,32,30);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.6,'rgba(255,255,255,.75)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);});}

/* ---- the baked scenery of one hole ---- */
function scenery(H:Hole,flags:number[]):T.BufferGeometry{const o:Parts=[],d=H.def,y=(x:number,z:number)=>heightAt(H,x,z),rnd=seeded(H.ix*53+9);
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
 dress(o,H,rnd,at,flags);
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

/* ---- dressing (polish pass, Nov 21 2026): island props per place, the tee, all baked into the scenery mesh (no extra draw) ----
 * Props sit in the rough well off the line (10 m past a fairway edge, clear of the green and tee) or outside the bounds: they are
 * pictures, not colliders, so they keep out of where a ball normally goes. Pennant poles are baked; their cloths fly in `flutter`. */
function fairDist(H:Hole,x:number,z:number){let best=1e9;for(const c of H.def.fair){const p=c.p;if(p.length<4){best=Math.min(best,Math.hypot(x-p[0],z-p[1])-c.w);continue;}
 for(let i=0;i+3<p.length;i+=2){const ax=p[i],az=p[i+1],dx=p[i+2]-ax,dz=p[i+3]-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz||1)));best=Math.min(best,Math.hypot(x-ax-dx*t,z-az-dz*t)-c.w);}}return best;}
function dress(o:Parts,H:Hole,rnd:()=>number,at:(x:number,z:number)=>number,flags:number[]){const d=H.def,[x0,z0,x1,z1]=d.bounds,gr=H.green,[tx,tz]=d.tee;
 const L=(x:number,z:number,ry:number,lx:number,lz:number):[number,number]=>[x+lx*Math.cos(ry)+lz*Math.sin(ry),z-lx*Math.sin(ry)+lz*Math.cos(ry)];
 const used:number[]=[];
 /** a free spot: off the line, dry, clear of the green, the tee and other props; `out` lets it go past the bounds */
 const spot=(near=10,far=26,out=8):[number,number]|null=>{for(let k=0;k<40;k++){const x=x0-out+rnd()*(x1-x0+out*2),z=z0-out+rnd()*(z1-z0+out*2),f=fairDist(H,x,z);if(f<near||f>far)continue;
  if(Math.hypot((x-gr.x)/(gr.rx+9),(z-gr.z)/(gr.rz+9))<1||Math.hypot(x-tx,z-tz)<8||at(x,z)<FG.water+.35)continue;let ok=true;for(let i=0;i<used.length;i+=2)if(Math.hypot(x-used[i],z-used[i+1])<3.2){ok=false;break;}
  if(!ok)continue;used.push(x,z);return [x,z];}return null;};
 const flag=(x:number,z:number,h:number)=>{const gy=at(x,z);P(o,cyl(.045,.055,h,6),'#fff3d6',x,gy+h/2,z,0,0,.025,true);if(flags.length<40)flags.push(x,gy+h-.3,z,.55);};
 const bench=(x:number,z:number,ry:number)=>{const gy=at(x,z);P(o,box(1.7,.09,.48),'#c98a4b',x,gy+.46,z,ry,0,.025);const [bx,bz]=L(x,z,ry,0,-.24);P(o,box(1.7,.42,.07),'#b97a40',bx,gy+.78,bz,ry,0,.025);
  for(const s of [-.7,.7]){const [lx,lz]=L(x,z,ry,s,0);P(o,box(.08,.44,.42),'#5a4a5a',lx,gy+.22,lz,ry,0,.02);}};
 const lamp=(x:number,z:number,h=3.4)=>{const gy=at(x,z);P(o,cyl(.06,.09,h,6),'#3a2f58',x,gy+h/2,z,0,0,.025,true);P(o,ico(.24,0),'#fff1b0',x,gy+h+.1,z,0,0,.035,true);};
 const stall=(x:number,z:number,ry:number,c:string)=>{const gy=at(x,z);P(o,box(2.2,1,1.1),'#e9d6b2',x,gy+.5,z,ry,0,.04);for(const s of [-1,1]){const [px,pz]=L(x,z,ry,s*1.05,.45);P(o,box(.08,1.3,.08),'#6a4a3a',px,gy+1.6,pz,ry,0,.02);}
  for(let i=0;i<4;i++){const [rx,rz]=L(x,z,ry,-.975+i*.65,0);P(o,box(.65,.14,1.6),i%2?'#fff3d6':c,rx,gy+2.3,rz,ry,.12,.025);}
  for(let i=0;i<3;i++){const [fx,fz]=L(x,z,ry,-.6+i*.6,.2);P(o,ico(.16,0),['#ffc83a','#f0452e','#8ee07a'][i],fx,gy+1.12,fz,0,0,.02,true);}};
 const umbrella=(x:number,z:number,c:string,towel:string)=>{const gy=at(x,z);P(o,cyl(.05,.05,2.2,5),'#fff3d6',x,gy+1.1,z,0,0,.02,true);P(o,cone(1.3,.55,10),c,x,gy+2.3,z,0,0,.04,true);P(o,box(.9,.04,1.8),towel,x+.9,gy+.03,z+.3,.3,0,.015);};
 const boat=(x:number,z:number,ry:number,c:string,mast=false)=>{const gy=FG.water;P(o,box(3.6,.7,1.4),c,x,gy+.15,z,ry,0,.05);const [bx,bz]=L(x,z,ry,2.05,0),bow=new T.CylinderGeometry(.01,.98,.7,4,1);bow.rotateY(Math.PI/4);bow.scale(1,1,.72);bow.rotateZ(-Math.PI/2);P(o,bow,c,bx,gy+.15,bz,ry,0,.04);
  P(o,box(3.4,.12,1.2),'#fff3d6',x,gy+.52,z,ry,0,.02);if(mast){P(o,cyl(.05,.06,4.2,5),'#fff3d6',x,gy+2.6,z,0,0,.025,true);const sail=new T.CylinderGeometry(.01,1.3,3.2,3,1);sail.scale(1,1,.12);P(o,sail,'#fffaf0',x+.6,gy+2.6,z,ry,0,.03);}
  else{const [cx,cz]=L(x,z,ry,-.5,0);P(o,box(1.3,.8,1),'#fffaf0',cx,gy+.95,cz,ry,0,.04);P(o,box(1.5,.1,1.2),FG_COLORS.red,cx,gy+1.4,cz,ry,0,.025);}};
 const cow=(x:number,z:number,ry:number,sheep=false)=>{const gy=at(x,z);if(sheep){P(o,ico(.48,0),'#fffaf0',x,gy+.6,z,ry,0,.05,true);const [hx,hz]=L(x,z,ry,.5,0);P(o,box(.28,.32,.26),'#3a2f3a',hx,gy+.72,hz,ry,0,.025);
   for(const a of [-1,1])for(const b of [-1,1]){const [lx,lz]=L(x,z,ry,a*.22,b*.18);P(o,box(.08,.36,.08),'#3a2f3a',lx,gy+.18,lz,ry,0,.015);}return;}
  P(o,box(1.5,.75,.68),'#fffaf0',x,gy+.95,z,ry,0,.05);const [px,pz]=L(x,z,ry,-.2,.35);P(o,box(.6,.42,.04),'#3a2f3a',px,gy+1.02,pz,ry,0,0);const [qx,qz]=L(x,z,ry,.35,-.35);P(o,box(.45,.35,.04),'#3a2f3a',qx,gy+.9,qz,ry,0,0);
  const [hx,hz]=L(x,z,ry,.9,0);P(o,box(.48,.44,.46),'#fffaf0',hx,gy+1.15,hz,ry,0,.035);const [mx,mz]=L(x,z,ry,1.14,0);P(o,box(.12,.24,.36),'#ff9a8a',mx,gy+1.04,mz,ry,0,.015);
  for(const a of [-1,1])for(const b of [-1,1]){const [lx,lz]=L(x,z,ry,a*.55,b*.24);P(o,box(.14,.62,.14),'#fffaf0',lx,gy+.31,lz,ry,0,.02);}};
 const rocks=(x:number,z:number,s=1)=>{for(let i=0;i<3;i++){const r=(.55+rnd()*.7)*s;P(o,new T.DodecahedronGeometry(r,0),i%2?'#a89a94':'#c2b6ae',x+(rnd()-.5)*2.2*s,at(x,z)+r*.45,z+(rnd()-.5)*2.2*s,rnd()*3,0,.06,true);}};
 const statue=(x:number,z:number)=>{const gy=at(x,z);P(o,box(1.3,1.4,1.3),'#e9d6b2',x,gy+.7,z,.3,0,.05);P(o,cyl(.2,.28,1.2,8),'#b9824a',x,gy+2,z,0,0,.04,true);P(o,ico(.22,1),'#c99252',x,gy+2.8,z,0,0,.03,true);P(o,box(.14,.8,.14),'#a8723e',x+.2,gy+1.7,z+.2,0,.5,.025);P(o,ico(.18,1),'#fff3d6',x+.5,gy+1.55,z+.35,0,0,.025,true);};
 const topiary=(x:number,z:number)=>{const gy=at(x,z);P(o,cyl(.35,.28,.55,8),'#c9584a',x,gy+.27,z,0,0,.03,true);P(o,ico(.62,1),'#2f8a4a',x,gy+1.1,z,0,0,.05,true);P(o,ico(.36,1),'#3a9a54',x,gy+1.85,z,0,0,.04,true);};
 const bales=(x:number,z:number,ry:number)=>{const gy=at(x,z);for(let i=0;i<3;i++){const [bx,bz]=L(x,z,ry,i*1.05-1.05,0);P(o,box(1,.5,.55),i%2?'#e8c45a':'#d9b04a',bx,gy+.25,bz,ry,0,.03);}const [cx,cz]=L(x,z,ry,-.5,0);P(o,box(1,.5,.55),'#e8c45a',cx,gy+.75,cz,ry,0,.03);};
 // the tee: a kerb round the box, bigger ball markers, a sign (its face is drawn by the decal), a bench, a pennant
 for(const s of [-1,1]){P(o,ico(.15,1),FG_COLORS.red,tx+s*2.1,at(tx+s*2.1,tz-1.6)+.2,tz-1.6,0,0,.03,true);P(o,ico(.07,0),'#fff3d6',tx+s*2.1-.06,at(tx+s*2.1,tz-1.6)+.26,tz-1.72,0,0,0,true);}
 {const sx=tx+SIGN[0],sz=tz+SIGN[1],gy=at(sx,sz);for(const s of [-.7,.7])P(o,box(.12,1.5,.12),'#6a4a3a',sx+s,gy+.75,sz-.06,0,0,.025);P(o,box(1.9,1,.1),COMIC_INK,sx,gy+1.45,sz-.1,0,0,0);}
 bench(tx+4,tz+1.6,-.35);flag(tx+3.4,tz-1.2,3.2);
 // a few lamp posts or flags along the line far out on both sides give the eye a scale to the green
 const side=(n:number,f:(x:number,z:number,i:number)=>void,near=10,far=24,out=6)=>{for(let i=0;i<n;i++){const p=spot(near,far,out);if(p)f(p[0],p[1],i);}};
 const C=['#f0452e','#19b5a5','#ffc83a','#2f8fd8','#ff9a8a','#d6b0f0'];
 switch(d.place){
  case 'jetty':boat(-24,-25.5,.15,'#2f8fd8');boat(-31,-15.5,-.2,FG_COLORS.red,true);boat(-12,-29,.5,FG_COLORS.teal);for(let i=0;i<4;i++){const x=-18-i*5.5;P(o,ico(.35,0),i%2?'#fff3d6':FG_COLORS.red,x,FG.water+.15,-13-i*1.5,0,0,.03,true);}
   for(let t=0;t<20;t+=6.5)lamp(-16-t,-21.6,2.6);flag(-36,-18.6,3.4);
   side(3,(x,z,i)=>i%2?bench(x,z,rnd()*6):(()=>{const gy=at(x,z);for(let k=0;k<3;k++)P(o,box(.7,.7,.7),'#c98a4b',x+k*.75,gy+.35,z+(k%2)*.3,rnd(),0,.03);})());side(4,(x,z)=>rocks(x,z,.8),12,30,10);break;
  case 'beach':side(7,(x,z,i)=>umbrella(x,z,C[i%6],C[(i+2)%6]),9,22,6);side(4,(x,z,i)=>{const gy=at(x,z);P(o,ico(.35,1),C[i%6],x,gy+.35,z,0,0,.03,true);},8,20,4);
   side(3,(x,z,i)=>{const gy=at(x,z);P(o,box(.5,2.1,.12),C[(i+3)%6],x,gy+1,z,rnd()*3,.25,.03);},9,22,4);flag(22,-36.5,7.2);flag(-30,-58,3.4);break;
  case 'plaza':side(5,(x,z,i)=>stall(x,z,Math.atan2(-x,0)+(rnd()-.5)*.4,C[i%6]),9,20,0);side(4,(x,z)=>bench(x,z,rnd()*6),9,20,0);side(7,(x,z)=>lamp(x,z),8,18,0);flag(-48,-30,21);break;
  case 'farm':side(4,(x,z)=>cow(x,z,rnd()*6),10,26,6);side(6,(x,z)=>cow(x,z,rnd()*6,true),10,26,6);side(3,(x,z)=>bales(x,z,rnd()*6),10,24,4);flag(-25,-90,13);
   {const p=spot(12,26,4);if(p){const [x,z]=p,gy=at(x,z);P(o,box(2.2,1.1,1.4),FG_COLORS.red,x,gy+.95,z,.4,0,.05);P(o,box(.9,.9,1.2),'#fff3d6',x-.5,gy+1.9,z+.2,.4,0,.04);for(const [a,b,r] of [[-.8,.75,.6],[-.8,-.75,.6],[.8,.75,.42],[.8,-.75,.42]] as const){const [wx,wz]=L(x,z,.4,a,b),g=cyl(r,r,.3,10);g.rotateX(Math.PI/2);P(o,g,'#3a2f3a',wx,gy+r,wz,.4,0,.04,true);}}}break;
  case 'boardwalk':for(let t=-44;t<40;t+=8){lamp(t,-37.2,3);lamp(t+4,-41.8,3);}side(3,(x,z,i)=>stall(x,z,rnd()*6,C[i%6]),10,22,4);side(3,(x,z)=>bench(x,z,rnd()*6),10,22,4);flag(-46,-36,4);flag(38,-36,4);break;
  case 'museum':side(3,(x,z)=>statue(x,z),9,18,0);side(8,(x,z)=>topiary(x,z),9,20,0);side(3,(x,z)=>bench(x,z,rnd()*6),9,20,0);side(4,(x,z)=>lamp(x,z),9,20,0);flag(-14,-70,9);flag(14,-70,9);break;
  case 'coral':side(6,(x,z)=>rocks(x,z,1),8,26,10);boat(-24,-62,.6,'#fffaf0',true);boat(30,-20,-.4,FG_COLORS.teal);side(2,(x,z,i)=>umbrella(x,z,C[i],C[i+2]),8,18,2);flag(14,-34,4.8);break;
  case 'summit':side(8,(x,z)=>rocks(x,z,1.3),10,30,10);side(6,(x,z)=>flag(x,z,3.6),9,18,0);{const x=-6,z=-150,gy=at(x,z);for(let i=0;i<5;i++)P(o,new T.DodecahedronGeometry(.55-i*.07,0),'#b2a69e',x,gy+.35+i*.65,z,rnd()*3,0,.05,true);}break;
  case 'stadium':for(const s of [-1,1]){P(o,box(.8,24,.8),'#3a2f58',s*44,at(s*44,-150)+12,-150,0,0,.06);P(o,box(6,2.4,.8),'#fffbe0',s*44,at(s*44,-150)+24,-150,0,0,.06);
    for(let t=0;t<9;t++){const z=-30-t*11;P(o,box(.2,.9,7),C[t%6],s*24,at(s*24,z)+.45,z,0,0,.03);}
    for(let r=0;r<3;r++)for(let k=0;k<18;k++){const z=-95-k*3.3+(r%2)*1.6,x=s*(36+r*5)-s*3.4;P(o,box(.5,.6,.5),C[(k+r*2+(s>0?1:0))%6],x,at(s*36,-120)+2.4+r*2.2,z,0,0,0);}}
   for(let r=0;r<3;r++)for(let k=0;k<22;k++){const x=-33+k*3.1+(r%2)*1.5;P(o,box(.5,.6,.5),C[(k+r)%6],x,at(0,-158)+2.4+r*2.2,-152.6-r*4,0,0,0);}
   flag(-8,-150,1.6);flag(14,-150,1.6);flag(-16,-34,4);flag(16,-34,4);break;
 }
 // then the filler, within the hole's triangle budget (heavy landmark holes get fewer tufts and bushes): see SCENERY_TRIS
 const tris=()=>{let t=0;for(const g of o)t+=g.attributes.position.count/3;return t;};
 // grass tufts (baked, two-sided blades, no ink): both edges of every fairway, the green's fringe, the tee box
 {let tn=0;const tuftMax=Math.min(TUFTS,Math.max(80,Math.floor((SCENERY_TRIS-2600-tris())/6)));const M=new T.Matrix4(),Qt=new T.Quaternion(),Vt=new T.Vector3(),St=new T.Vector3(),UPt=new T.Vector3(0,1,0);
  const tuft=(x:number,z:number)=>{if(tn>=tuftMax||surfaceAt(H,x,z)!==S.rough)return;const sc=.7+rnd()*.8;Qt.setFromAxisAngle(UPt,rnd()*6.28);St.set(sc,sc*(.8+rnd()*.5),sc);Vt.set(x,heightAt(H,x,z)-.02,z);M.compose(Vt,Qt,St);const g=tuftGeo();g.applyMatrix4(M);o.push(g);tn++;};
  for(const c of d.fair){const q=c.p;for(let i=0;i+3<q.length;i+=2){const ax=q[i],az=q[i+1],dx=q[i+2]-ax,dz=q[i+3]-az,Ln=Math.hypot(dx,dz)||1,ux=dx/Ln,uz=dz/Ln;
   for(let t=0;t<Ln;t+=.55)for(const sd of [-1,1]){const off=c.w+.35+rnd()*rnd()*3.2;tuft(ax+ux*t-uz*off*sd,az+uz*t+ux*off*sd);}}}
  for(let a=0;a<6.28;a+=.16){const r=1.6+rnd()*1.8;tuft(gr.x+Math.cos(a)*(gr.rx+r),gr.z+Math.sin(a)*(gr.rz+r));}
  for(let i=0;i<40;i++){const a=rnd()*6.28,r=2.9+rnd()*1.8;tuft(tx+Math.cos(a)*r,tz+Math.sin(a)*r);}}
 // bushes (baked: no draw of their own): at the foot of the hole's trees, then clumps in the far rough and on the land past the bounds
 {const bush=(x:number,z:number,s:number,y:number)=>{const r=rnd()*6;P(o,ico(.95*s,0),'#2f8a4a',x,y+.6*s,z,r,0,.06,true);P(o,ico(.7*s,0),'#3f9a52',x+.8*s*Math.cos(r),y+.45*s,z+.8*s*Math.sin(r),r,0,0);P(o,ico(.6*s,0),'#58b864',x-.6*s*Math.cos(r+1),y+.5*s,z-.6*s*Math.sin(r+1),0,0,0);};
  let nb=0;const bushMax=Math.max(6,Math.min(BUSH,Math.floor((SCENERY_TRIS-tris())/80)));for(let i=0;i<H.nt;i++){const t=H.trees.subarray(i*4,i*4+4);for(let k=0;k<2;k++){const a=rnd()*6.28,r=1.6+rnd()*1.2,x=t[0]+Math.cos(a)*r,z=t[1]+Math.sin(a)*r;bush(x,z,.7+rnd()*.5,heightAt(H,x,z)-.15);nb++;}}
  for(let i=0;i<BUSH*4&&nb<bushMax;i++){const x=x0-14+rnd()*(x1-x0+28),z=z0-14+rnd()*(z1-z0+28),f=fairDist(H,x,z),gy=heightAt(H,Math.max(x0,Math.min(x1,x)),Math.max(z0,Math.min(z1,z)));
   if(f<7.5||gy<FG.water+.4||Math.hypot((x-gr.x)/(gr.rx+6),(z-gr.z)/(gr.rz+6))<1||Math.hypot(x-tx,z-tz)<6)continue;
   const inB=x>x0&&x<x1&&z>z0&&z<z1,y=inB?heightAt(H,x,z):gy-.4;for(let k=0;k<(i%3?1:3)&&nb<bushMax;k++){bush(x+(rnd()-.5)*3,z+(rnd()-.5)*3,.6+rnd()*.7,y-.1);nb++;}}}
}
/** A grass tuft: four blades, one triangle each, dark at the root (no ink; one instanced draw for every tuft on the hole). */
function tuftGeo(){const pos:number[]=[],col:number[]=[],C1=new T.Color('#2f7a42'),C2=new T.Color('#8fd477');
 for(let i=0;i<3;i++){const a=i/3*Math.PI+.3,c=Math.cos(a),s=Math.sin(a),lean=(i-1.5)*.12,h=.32+(i%2)*.14;const A=[-c*.07,0,-s*.07],B=[c*.07,0,s*.07],Tp=[lean*c+s*.04,h,lean*s];pos.push(...A,...B,...Tp,...B,...A,...Tp);for(let k=0;k<2;k++)col.push(C1.r,C1.g,C1.b,C1.r,C1.g,C1.b,C2.r,C2.g,C2.b);}
 const g=new T.BufferGeometry(),n=new Float32Array(pos.length);for(let i=1;i<n.length;i+=3)n[i]=1;g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(n,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));return g;}
/** The decal sheet: the green's slope arrows at ~35 px a metre (the ground sheet is ~10) and the tee sign's face. */
const SIGN=[-1.6,-8.5],DECAL_G=768,DECAL_H=960,GREEN_PAD=1.6;
function decalTex(H:Hole,num:string){return canvasTex(DECAL_G,DECAL_H,g=>{const gr=H.green,ex=gr.rx+GREEN_PAD,ez=gr.rz+GREEN_PAD,X=(x:number)=>(x-gr.x+ex)/(ex*2)*DECAL_G,Z=(z:number)=>(z-gr.z+ez)/(ez*2)*DECAL_G,mx=DECAL_G/(ex*2),mz=DECAL_G/(ez*2);
 g.clearRect(0,0,DECAL_G,DECAL_H);const sl=[0,0];g.lineJoin='round';
 for(let ax=-gr.rx+1;ax<gr.rx;ax+=2.3)for(let az=-gr.rz+1;az<gr.rz;az+=2.3){const ox=(Math.abs(Math.round(az/2.3))%2)*1.15,x=gr.x+ax+ox,z=gr.z+az;if(((x-gr.x)/gr.rx)**2+((z-gr.z)/gr.rz)**2>.82)continue;if(Math.hypot(x-H.cup[0],z-H.cup[1])<1)continue;
  slopeAt(H,x,z,sl);const m=Math.hypot(sl[0],sl[1]);if(m<.006)continue;const ux=-sl[0]/m,uz=-sl[1]/m,len=.2+Math.min(.26,m*3.5),qx=-uz,qz=ux,px=X(x),pz=Z(z);
  // a fat chevron pointing downhill: ink outline, cream fill (two chevrons for a steep spot)
  const chev=(cx:number,cz:number)=>{g.beginPath();g.moveTo(cx+ux*len*mx,cz+uz*len*mz);g.lineTo(cx+(-ux*len*.55+qx*len*.75)*mx,cz+(-uz*len*.55+qz*len*.75)*mz);g.lineTo(cx+(-ux*len*.1)*mx,cz+(-uz*len*.1)*mz);g.lineTo(cx+(-ux*len*.55-qx*len*.75)*mx,cz+(-uz*len*.55-qz*len*.75)*mz);g.closePath();
   g.lineWidth=Math.max(3,mx*.09);g.strokeStyle='rgba(35,26,46,.85)';g.stroke();g.fillStyle=m>.05?'#ffc83a':'#fff3d6';g.fill();};
  chev(px,pz);if(m>.07)chev(px-ux*len*.8*mx,pz-uz*len*.8*mz);}
 // the tee sign: paper, ink frame, the hole number big, the name and par
 const y0=DECAL_G,W=384,Hs=192;g.fillStyle=COMIC_PAPER;g.fillRect(0,y0,W,Hs);g.strokeStyle=COMIC_INK;g.lineWidth=12;g.strokeRect(6,y0+6,W-12,Hs-12);
 g.fillStyle=FG_COLORS.sun;g.fillRect(18,y0+18,120,Hs-36);g.strokeRect(18,y0+18,120,Hs-36);g.fillStyle=COMIC_INK;g.textAlign='center';g.textBaseline='middle';g.font='900 108px "Arial Black",Arial,sans-serif';g.fillText(num,78,y0+Hs/2+6);
 g.textAlign='left';g.font='900 40px "Arial Black",Arial,sans-serif';g.fillText(`PAR ${H.def.par}`,158,y0+62);g.font='800 30px Arial,sans-serif';g.fillText(`${Math.round(H.metres)} m`,158,y0+112);g.fillStyle=FG_COLORS.teal;g.fillRect(158,y0+140,190,14);});}
/** Its mesh: a grid draped on the green (heights from the same heightfield, a hair above) + the sign's face quad. */
function decalGeo(H:Hole){const gr=H.green,ex=gr.rx+GREEN_PAD,ez=gr.rz+GREEN_PAD,N=22,pos:number[]=[],uv:number[]=[],idx:number[]=[],vG=DECAL_G/DECAL_H;
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const u=i/N,v=j/N,x=gr.x-ex+u*ex*2,z=gr.z-ez+v*ez*2;pos.push(x,heightAt(H,x,z)+.035,z);uv.push(u,1-v*vG);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+1,c=a+N+1,d=c+1;idx.push(a,c,b,b,c,d);}
 const [tx,tz]=H.def.tee,sx=tx+SIGN[0],sz=tz+SIGN[1]-.03,gy=heightAt(H,sx,sz)+1.45,b=pos.length/3,u1=384/DECAL_G;
 pos.push(sx-.92,gy-.46,sz,sx+.92,gy-.46,sz,sx-.92,gy+.46,sz,sx+.92,gy+.46,sz);uv.push(0,0,u1,0,0,1-vG,u1,1-vG);idx.push(b,b+1,b+2,b+1,b+3,b+2);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);return g;}

export type CamMode='flyover'|'aim'|'chase'|'cup'|'still';
const FLAG_C=['#f0452e','#ffc83a','#19b5a5','#2f8fd8','#ff65c8'],KICKER_S=.95,PREVIEW=90,TRAIL=18,BITS=48,DECO=24,BUSH=44,TUFTS=420,SCENERY_TRIS=10400,FLUT=36,BIRDS=5;
export type FootgolfView=ReturnType<typeof createFootgolfView>;
export function createFootgolfView(host:HTMLElement,o:{reduced:boolean;mobile:boolean}){
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');canvas.dataset.footgolfCanvas='';canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';host.prepend(canvas);
 const renderer=new T.WebGLRenderer({canvas,antialias:!o.mobile,powerPreference:'low-power',alpha:false});renderer.toneMapping=T.NoToneMapping;
 const scene=new T.Scene(),bg=new T.Color('#8fd4ee');scene.background=bg;const fog=new T.Fog('#d6f1f5',55,310);scene.fog=fog;
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
 // cloths that move: pennants on the baked poles and gulls (two wings each), one triangle per instance, one draw
 const flutG=own(new T.BufferGeometry());flutG.setAttribute('position',new T.Float32BufferAttribute([0,0,-.5,0,0,.5,1,0,0],3));flutG.computeVertexNormals();
 const flutter=mk(flutG,own(new T.MeshBasicMaterial({color:'#ffffff',side:T.DoubleSide})),FLUT),flags:number[]=[];let flutT=0;
 // the decal sheet: sharp slope chevrons on the green + the tee sign's face (one texture, one draw)
 const decalMat=own(new T.MeshBasicMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})),decal=new T.Mesh(new T.BufferGeometry(),decalMat);decal.frustumCulled=false;decal.renderOrder=1;scene.add(decal);let decalT:T.Texture|null=null;
 // the pin: cup rim + hole + pole; the flag cloth (2 x 9 vertices, moved with the wind)
 const pinParts:Parts=[];inkedPart(pinParts,cyl(.03,.03,2.4,6),(t)=>Math.floor(t/4)%2?'#fff3d6':FG_COLORS.red,partAt(0,1.2,0),.025,true);const pinG=bakeParts(pinParts);
 const pin=new T.Mesh(own(pinG),vmat);scene.add(pin);
 const hole=new T.Mesh(own(new T.CircleGeometry(FG.cupR,20).rotateX(-Math.PI/2)),own(new T.MeshBasicMaterial({color:'#2a2034'})));hole.renderOrder=1;scene.add(hole);
 const rim=new T.Mesh(own(new T.RingGeometry(FG.cupR,FG.cupR+.05,24).rotateX(-Math.PI/2)),own(new T.MeshBasicMaterial({color:'#fffaf0'})));scene.add(rim);
 const clothG=own(new T.PlaneGeometry(.95,.6,8,1)),cloth=new T.Mesh(clothG,lit(new T.MeshLambertMaterial({color:FG_COLORS.red,side:T.DoubleSide}),true));scene.add(cloth);const clothBase=Float32Array.from(clothG.attributes.position.array as Float32Array);
 // the ball, its shadow, the preview, the landing ring, the trail, bits
 const ballMat=lit(new T.MeshLambertMaterial({map:own(ballTex())}),true),ball=new T.Mesh(own(new T.SphereGeometry(FG.R,20,14)),ballMat);scene.add(ball);
 /* the kicker: the player's own island bean (saved look and outfit) on the shared arcade rig (lib/arcade/islandArcadePlayer.ts, as Ball
  * Blaster uses it), printed in the comic bands. It stands left of the ball (a right-footed kick), backs off as the drag pulls (the
  * run-up wind-up), strikes on the frame the ball leaves and follows through, then waits where it kicked; it walks up to the next lie.
  * Hidden for a putt (the low putt camera would look through it). No extra light or pass. */
 const kicker=createIslandArcadePlayer(FG_COLORS.teal,o.reduced,0);kicker.useMainAppearance();
 const bean=kicker.root;bean.name='footgolf-kicker';bean.scale.setScalar(KICKER_S);comicTree(bean,{uniforms:ink});scene.add(bean);
 const kp:ArcadePoseOptions={anticipate:.3},kick={x:0,z:0,f:0,charge:0,shown:0,now:false,cheer:0,power:.6,bx:0,bz:0,set:false,putt:false};
 const blob=new T.Mesh(own(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2)),own(new T.MeshBasicMaterial({map:own(blobTex()),transparent:true,depthWrite:false,color:COMIC_INK,opacity:.42})));blob.renderOrder=2;scene.add(blob);
 const topMat=own(new T.MeshBasicMaterial({color:'#ffffff',depthTest:false,fog:false,transparent:true}));
 const ghost=mk(own(new T.SphereGeometry(1,8,6)),topMat,PREVIEW);ghost.renderOrder=12;
 const landRing=new T.Mesh(own(new T.RingGeometry(.55,.8,24).rotateX(-Math.PI/2)),own(new T.MeshBasicMaterial({color:FG_COLORS.sun,depthTest:false,transparent:true,fog:false})));landRing.renderOrder=11;landRing.visible=false;scene.add(landRing);
 const fxMat=own(new T.MeshBasicMaterial({color:'#ffffff'})),trail=mk(own(new T.SphereGeometry(1,6,4)),fxMat,TRAIL),bits=mk(own(new T.BoxGeometry(1,1,1)),fxMat,BITS);
 const M4=new T.Matrix4(),Q=new T.Quaternion(),Qb=new T.Quaternion(),V=new T.Vector3(),V2=new T.Vector3(),SC=new T.Vector3(),CC=new T.Color(),UP=new T.Vector3(0,1,0),XA=new T.Vector3(1,0,0),ZA=new T.Vector3(0,0,1),Qa=new T.Quaternion(),Qc=new T.Quaternion(),AX=new T.Vector3(),SL=[0,0];
 const bp=new Float32Array(BITS*8),bc=new Float32Array(BITS*3);let bi=0;const tp=new Float32Array(TRAIL*4);let ti=0,trailAt=0;
 let ghostN=0;const ghostP=new Float32Array(PREVIEW*3);
 function burst(x:number,y:number,z:number,n:number,cols:readonly string[],speed:number,size=.1){if(o.reduced)n=Math.ceil(n/3);for(let i=0;i<n;i++){const j=bi++%BITS,a=Math.random()*6.283,u=Math.random();bp[j*8]=x;bp[j*8+1]=y;bp[j*8+2]=z;bp[j*8+3]=Math.cos(a)*speed*(.3+u);bp[j*8+4]=speed*(.5+Math.random()*.9);bp[j*8+5]=Math.sin(a)*speed*(.3+u);bp[j*8+6]=.6+Math.random()*.5;bp[j*8+7]=size*(.6+Math.random()*.8);CC.set(cols[i%cols.length]);bc[j*3]=CC.r;bc[j*3+1]=CC.g;bc[j*3+2]=CC.b;}}
 // camera state
 const cam={mode:'still' as CamMode,pos:new T.Vector3(0,20,30),look:new T.Vector3(),tPos:new T.Vector3(),tLook:new T.Vector3(),fly:0,flyDur:4.6,yaw:0,kind:'long' as KickKind,lastT:0,orbit:0,cx:0,cz:-1};
 let H:Hole|null=null,W=1,Hh=1,lastBX=0,lastBZ=0,flagWave=0;
 function measure(){camera.aspect=W/Hh;camera.fov=fovFor();
  // upright phones: the kick picker covers the bottom fifth, so the picture is shifted up (a sheared frustum: no zoom, no extra cost)
  const lift=Math.round(Hh*(W/Hh<.8?.17:.13));camera.setViewOffset(W,Hh,0,lift,W,Hh);camera.updateProjectionMatrix();}
 function resize(w:number,h:number,dpr:number){W=w;Hh=h;renderer.setPixelRatio(Math.min(o.mobile?1.5:2,dpr));renderer.setSize(w,h,false);comicDotCell(ink,renderer);measure();}
 function setHole(g:FootGolf){const s=g.state;H=s.hole;const p=PLACES[H.def.place]??PLACES.jetty;
  backTex?.dispose();backTex=backdropTex(H.def.place);backTex.wrapS=T.RepeatWrapping;backTex.repeat.set(2,1);backMat.map=backTex;backMat.needsUpdate=true;
  groundT?.dispose();groundT=groundTex(H,toSun);groundMat.map=groundT;groundMat.needsUpdate=true;
  ground.geometry.dispose();ground.geometry=terrainGeo(H);apron.geometry.dispose();apron.geometry=apronGeo(H,p);place.geometry.dispose();flags.length=0;place.geometry=scenery(H,flags);
  decalT?.dispose();decalT=decalTex(H,String(H.ix+1));decalMat.map=decalT;decalMat.needsUpdate=true;decal.geometry.dispose();decal.geometry=decalGeo(H);
  fog.color.set(p.fog);bg.set(p.fog);ink.uInkShade.value.setRGB(...p.shade);hemi.color.set(p.hemi);hemi.groundColor.set(p.hemiG);
  const [x0,z0,x1,z1]=H.def.bounds;back.position.x=(x0+x1)/2;back.position.z=(z0+z1)/2;
  // trees: the hole's own + decoration on the land outside the bounds
  const n=[0,0,0],rnd=seeded(H.ix*131+7);const put=(k:number,x:number,z:number,s:number,y:number,r:number)=>{const m=trees[k];if(n[k]>=m.instanceMatrix.count)return;Q.setFromAxisAngle(UP,r);SC.set(s,s,s);V.set(x,y,z);M4.compose(V,Q,SC);m.setMatrixAt(n[k]++,M4);};
  for(let i=0;i<H.nt;i++){const t=H.trees.subarray(i*4,i*4+4);put(t[3],t[0],t[1],t[2],heightAt(H,t[0],t[1])-.1,rnd()*6);}
  const ap=apron.geometry.attributes.position as T.BufferAttribute,decoKind=H.def.place==='beach'||H.def.place==='coral'?1:H.def.place==='summit'||H.def.place==='museum'||H.def.place==='jetty'?2:0;
  for(let i=0;i<DECO*3&&n[decoKind]<16+DECO-2;i++){const v=72+Math.floor(rnd()*72*3);const y=ap.getY(v);if(y<FG.water+.6)continue;put(i%5===0&&decoKind!==1?0:decoKind,ap.getX(v)+(rnd()-.5)*6,ap.getZ(v)+(rnd()-.5)*6,.9+rnd()*.7,y-.3,rnd()*6);}
  trees.forEach((m,k)=>{m.count=n[k];m.instanceMatrix.needsUpdate=true;});
  const cy=H.cupY;hole.position.set(H.cup[0],cy+.012,H.cup[1]);rim.position.set(H.cup[0],cy+.014,H.cup[1]);pin.position.set(H.cup[0],cy,H.cup[1]);cloth.position.set(H.cup[0],cy+2.1,H.cup[1]);
  {let fi=0;for(let i=0;i<flags.length&&fi<FLUT-BIRDS*2;i+=4)flutter.setColorAt(fi++,CC.set(FLAG_C[(i/4)%FLAG_C.length]));for(let k=0;k<BIRDS*2;k++)flutter.setColorAt(fi++,CC.set('#3a2f58'));flutter.count=fi;if(flutter.instanceColor)flutter.instanceColor.needsUpdate=true;}
  kick.set=false;kick.charge=0;
  ghostN=0;ghost.count=0;landRing.visible=false;trail.count=0;for(let i=0;i<TRAIL;i++)tp[i*4+3]=0;ti=0;for(let i=0;i<BITS;i++)bp[i*8+6]=0;
  cam.yaw=0;startFlyover(s.ball.x,s.ball.z);lastBX=s.ball.x;lastBZ=s.ball.z;}
 function startFlyover(bx:number,bz:number){if(!H)return;cam.mode='flyover';cam.fly=0;cam.flyDur=o.reduced?.01:Math.min(6,3.2+H.metres/60);void bx;void bz;}
 const routePt=(u:number,out:T.Vector3)=>{const r=H!.route;let total=0;for(let i=2;i<r.length;i+=2)total+=Math.hypot(r[i]-r[i-2],r[i+1]-r[i-1]);let want=u*total;
  for(let i=2;i<r.length;i+=2){const L=Math.hypot(r[i]-r[i-2],r[i+1]-r[i-1]);if(want<=L||i===r.length-2){const t=Math.min(1,want/(L||1));out.set(r[i-2]+(r[i]-r[i-2])*t,0,r[i-1]+(r[i+1]-r[i-1])*t);return out;}want-=L;}return out.set(r[0],0,r[1]);};
 /* The aim view (polish pass): low over the kicker's shoulder, so the ball and the kicker sit in the lower third and the hole, its
  * landmark and the coast fill the top half. Lower and closer for the short kicks; the lens narrows a little for a putt (fovFor). */
 function aimPose(g:FootGolf,outPos:T.Vector3,outLook:T.Vector3){const b=g.state.ball,k=cam.kind,putt=k==='putt',dist=putt?3.3:k==='pass'?5.6:k==='chip'?6.3:6.8,ht=putt?1.2:k==='pass'?2.1:k==='chip'?2.7:2.5,fx=Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),side=putt?0:.7;
  outPos.set(b.x-fx*dist-fz*side,0,b.z-fz*dist+fx*side);const gy=heightAt(H!,outPos.x,outPos.z);outPos.y=Math.max(gy+ht*.75,b.y+ht,FG.water+1);
  const ahead=putt?Math.min(9,Math.max(3,g.cupDist()*.9)):k==='pass'?20:k==='chip'?26:34;outLook.set(b.x+fx*ahead,0,b.z+fz*ahead);outLook.y=Math.max(heightAt(H!,outLook.x,outLook.z),FG.water)+(putt?.05:k==='pass'?1.3:k==='chip'?2:2.3);}
 /** The lens per shot: wide for a long kick (the whole hole in view), tighter for a putt; wider again on a wide screen (side scenery). */
 function fovFor(){const a=W/Hh,base=a<.75?58:a>1.5?54:50;if(cam.mode==='aim')return base+(cam.kind==='long'?2:cam.kind==='chip'?1:cam.kind==='pass'?-2:-6);return base;}
 const ease=(t:number)=>t<.5?2*t*t:1-(-2*t+2)**2/2;
 function updateCamera(g:FootGolf,dt:number,now:number){if(!H)return;const s=g.state,b=s.ball;let k=1-Math.exp(-dt*4);
  if(cam.mode==='flyover'){cam.fly+=dt/cam.flyDur;const u=ease(Math.min(1,cam.fly));
   /* a low cinematic pull-back (polish pass): it opens beside the green with the landmark behind the flag, swings round behind the
    * green's front and backs down the fairway, rising a little over the middle to show the shape, and lands on the aim view at the tee */
   const r=Math.max(0,.8-u*.8);routePt(Math.min(1,r+.4),V2);routePt(r,V);const dx=V2.x-V.x,dz=V2.z-V.z,dl=Math.hypot(dx,dz)||1,lm=LANDMARK[H.def.place]??H.cup,side=(-dz*(lm[0]-H.cup[0])+dx*(lm[1]-H.cup[1]))>0?-1:1,sw=(1-u)*(1-u)*12*side;
   const gy=Math.max(heightAt(H,V.x,V.z),FG.water);cam.tPos.set(V.x-dz/dl*sw,gy+3.4+Math.sin(u*Math.PI)*4.5,V.z+dx/dl*sw);
   const lk=Math.min(1,u*1.25);const fx0=H.cup[0]*.65+lm[0]*.35,fz0=H.cup[1]*.65+lm[1]*.35;cam.tLook.set(fx0*(1-lk)+V2.x*lk,(H.cupY+4.5)*(1-lk)+(Math.max(heightAt(H,V2.x,V2.z),FG.water)+3)*lk,fz0*(1-lk)+V2.z*lk);
   if(u>.8){aimPose(g,V,V2);const t=(u-.8)/.2;cam.tPos.lerp(V,t);cam.tLook.lerp(V2,t);}
   if(cam.fly>=1){cam.mode='aim';aimPose(g,cam.tPos,cam.tLook);}k=cam.fly<.03?1:1-Math.exp(-dt*5);}
  else if(cam.mode==='aim'){aimPose(g,cam.tPos,cam.tLook);k=1-Math.exp(-dt*5);}
  else if(cam.mode==='chase'){const vh=Math.hypot(b.vx,b.vz);if(vh>.4){V.set(b.vx/vh,0,b.vz/vh);}else V.set(Math.sin(cam.yaw),0,-Math.cos(cam.yaw));
   const gy=Math.max(heightAt(H,b.x,b.z),FG.water),air=Math.max(0,b.y-gy),putt=s.lastShot?.kind==='putt',back=b.air?8.5:putt?3.8:7;cam.tPos.set(b.x-V.x*back,Math.max(b.y,gy)+(putt?1.5:3.2)+air*.35,b.z-V.z*back);
   const ty=Math.max(heightAt(H,cam.tPos.x,cam.tPos.z),FG.water)+1.2;if(cam.tPos.y<ty)cam.tPos.y=ty;cam.tLook.set(b.x+V.x*3,b.y+.3-air*.1,b.z+V.z*3);k=1-Math.exp(-dt*(b.air?2.6:3.2));
   // a rolling ball near the cup: the low view beside the cup
   const dx=H.cup[0]-b.x,dz=H.cup[1]-b.z,d=Math.hypot(dx,dz);if(!b.air&&!b.rest&&d<4.5&&s.kickFrom>7&&vh>.25&&(dx*b.vx+dz*b.vz)>0){cam.mode='cup';cam.cx=dx/d;cam.cz=dz/d;}}
  else if(cam.mode==='cup'){// beyond the cup, a little to one side, low: the ball rolls toward the lens and into the hole
   const nx=cam.cx,nz=cam.cz;cam.tPos.set(H.cup[0]+nx*3.2-nz*1.3,H.cupY+1.05,H.cup[1]+nz*3.2+nx*1.3);cam.tLook.set((b.x+H.cup[0])/2,H.cupY-.35,(b.z+H.cup[1])/2);k=1-Math.exp(-dt*2.4);}
  else{cam.orbit+=dt*.05;}
  cam.pos.lerp(cam.tPos,k);cam.look.lerp(cam.tLook,k);camera.position.copy(cam.pos);camera.lookAt(cam.look);void now;
  const fv=fovFor();if(Math.abs(fv-camera.fov)>.02){camera.fov+=(fv-camera.fov)*Math.min(1,dt*4);camera.updateProjectionMatrix();}}
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
  // the kicker (see where it is made)
  {const aiming=s.phase==='aim';let vx=0,vz=0;
   if(aiming){kick.putt=cam.kind==='putt';const fx=Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),back=.62+kick.charge*.8,sx=b.x-fx*back+fz*.36,sz=b.z-fz*back-fx*.36;
    if(!kick.set||Math.hypot(sx-kick.x,sz-kick.z)>4){kick.x=sx;kick.z=sz;kick.set=true;}else{const kk=1-Math.exp(-dt*7),nx=kick.x+(sx-kick.x)*kk,nz=kick.z+(sz-kick.z)*kk;vx=(nx-kick.x)/dt;vz=(nz-kick.z)/dt;kick.x=nx;kick.z=nz;}
    kick.f=Math.atan2(fx,fz);kick.bx=b.x;kick.bz=b.z;}
   const c=Math.cos(kick.f),sn=Math.sin(kick.f),wx=kick.bx-kick.x,wz=kick.bz-kick.z;kp.strikeX=(wx*c-wz*sn)/KICKER_S;kp.strikeZ=(wx*sn+wz*c)/KICKER_S;
   kp.charge=aiming&&kick.charge>.02?.25+kick.charge*.75:0;kp.shotPower=aiming&&kick.charge>.02?kick.charge:kick.power;kp.vx=vx;kp.vz=vz;kp.anticipate=aiming?.3:0;kp.celebrate=kick.cheer*.8;
   kp.actionKind=cam.kind==='chip'?'loft':cam.kind==='long'?'shot':'pass';kick.cheer=Math.max(0,kick.cheer-dt*.6);
   bean.visible=!kick.putt;if(bean.visible){bean.position.set(kick.x,0,kick.z);kicker.pose(dt,0,kick.f,kick.now?1:0,0,0,kp);bean.position.y=Math.max(heightAt(H,kick.x,kick.z),FG.water);}kick.now=false;}
  // pennants on their poles (to the wind) and the gulls over the hole
  {flutT+=o.reduced?dt*.3:dt;let fi=0;const wy=Math.atan2(-H.wind[1],H.wind[0]),ws=Math.hypot(H.wind[0],H.wind[1]);
   for(let i=0;i<flags.length&&fi<FLUT-BIRDS*2;i+=4){Qa.setFromAxisAngle(UP,wy+Math.sin(flutT*(3+ws)+i)*.22);Qc.setFromAxisAngle(XA,Math.PI/2);Q.multiplyQuaternions(Qa,Qc);
    SC.set(1.05*(.86+.14*Math.sin(flutT*(6+ws)+i*1.7)),1,flags[i+3]);V.set(flags[i],flags[i+1],flags[i+2]);M4.compose(V,Q,SC);flutter.setMatrixAt(fi++,M4);}
   const [tx,tz]=H.def.tee,mx=(tx+H.cup[0])/2,mz=(tz+H.cup[1])/2;
   for(let k=0;k<BIRDS;k++){const a=flutT*(.16+k*.035)*(k%2?1:-1)+k*1.3,R=16+k*6,x=mx+Math.cos(a)*R,z=mz+Math.sin(a)*R*1.4,y=Math.max(heightAt(H,tx,tz),0)+15+k*2.6,hx=-Math.sin(a)*(k%2?1:-1),hz=Math.cos(a)*(k%2?1:-1),fl=Math.sin(flutT*6.5+k*2.1)*.55;
    Qa.setFromAxisAngle(UP,Math.atan2(hx,hz));V.set(x,y,z);for(const w of [1,-1]){Qc.setFromAxisAngle(ZA,fl*w);Q.multiplyQuaternions(Qa,Qc);SC.set(1.1*w,1,.42);M4.compose(V,Q,SC);flutter.setMatrixAt(fi++,M4);}}
   flutter.instanceMatrix.needsUpdate=true;}
  aimComicSun(ink,toSun,camera);sun.position.copy(toSun).multiplyScalar(60).add(cam.look);sun.target.position.copy(cam.look);
  renderer.render(scene,camera);}
 /** The dotted flight for the aim: n points from core.predict. */
 function setPreview(buf:Float32Array,n:number,landing:boolean){ghostN=n;const cam2=camera.position;for(let i=0;i<n;i++){V.set(buf[i*3],buf[i*3+1],buf[i*3+2]);const d=V.distanceTo(cam2),sz=Math.max(.06,Math.min(.4,d*.011))*(i===n-1?1.4:1);SC.set(sz,sz,sz);Q.identity();M4.compose(V,Q,SC);ghost.setMatrixAt(i,M4);ghost.setColorAt(i,CC.set(i%2?'#fff3d6':'#ffc83a'));}
  ghost.count=n;ghost.instanceMatrix.needsUpdate=true;if(ghost.instanceColor)ghost.instanceColor.needsUpdate=true;
  if(landing&&n>1&&H){const x=buf[(n-1)*3],z=buf[(n-1)*3+2];landRing.position.set(x,Math.max(heightAt(H,x,z),FG.water)+.05,z);landRing.visible=true;}else landRing.visible=false;}
 function onEvent(e:FgEvent){if(!H)return;switch(e.type){
  case 'kick':burst(e.x,e.y,e.z,6,['#5cc063','#3f9a50','#fff3d6'],2.2,.07);kick.now=true;kick.power=Math.min(1,.35+kick.charge*.65);kick.charge=0;ghostN=0;ghost.count=0;landRing.visible=false;break;
  case 'land':case 'bounce':if(e.k===S.sand)burst(e.x,e.y,e.z,10,['#f3d990','#e8c88a'],2.4,.09);else if(e.a>4)burst(e.x,e.y,e.z,5,['#5cc063','#8ee07a'],1.6,.06);break;
  case 'plug':burst(e.x,e.y,e.z,16,['#f3d990','#e8c88a','#fff3d6'],3,.1);break;
  case 'splash':burst(e.x,FG.water+.05,e.z,22,['#ffffff','#bfe9f5','#27b0c8'],4.2,.12);break;
  case 'leaves':burst(e.x,e.y,e.z,14,['#3f9a52','#58b864','#2f8a4a'],2,.12);break;
  case 'wall':if(e.a>2)burst(e.x,e.y,e.z,5,['#d9c7a8','#fff3d6'],1.4,.06);break;
  case 'cup':kick.cheer=1;burst(H.cup[0],H.cupY+.15,H.cup[1],14,['#ffc83a','#f0452e','#19b5a5','#fff3d6'],2.2,.05);break;
  case 'tee':break;}}
 return{
  setHole,render,resize,setPreview,onEvent,startFlyover,
  setAim(yaw:number,kind:KickKind){cam.yaw=yaw;cam.kind=kind;},
  /** The drag's power (0 = none): the kicker backs off into its run-up. */
  setCharge(p:number){kick.charge=Math.max(0,Math.min(1,p));},
  skipFlyover(){if(cam.mode==='flyover')cam.fly=1;},
  get flying(){return cam.mode==='flyover';},
  get camMode(){return cam.mode;},
  get camInfo(){return {mode:cam.mode,pos:camera.position.toArray().map(v=>+v.toFixed(2)),look:cam.look.toArray().map(v=>+v.toFixed(2)),ground:H?+heightAt(H,camera.position.x,camera.position.z).toFixed(2):0};},
  /** For the drag: the screen-space direction of the aim, so a drag reads the same whichever way the camera looks. */
  project(x:number,y:number,z:number){V.set(x,y,z).project(camera);return {x:(V.x+1)/2*W,y:(1-V.y)/2*Hh,on:V.z<1};},
  info:()=>({parts:(()=>{const out:Record<string,number>={};const cnt=(r:T.Object3D)=>{let t=0;r.traverse(x=>{const m=x as T.Mesh;if(!m.isMesh||!m.geometry.attributes.position)return;const g=m.geometry;t+=(g.index?g.index.count:g.attributes.position.count)/3*((m as T.InstancedMesh).isInstancedMesh?(m as T.InstancedMesh).count:1);});return Math.round(t);};
   out.bean=cnt(bean);out.trees=trees.reduce((t,m)=>t+cnt(m),0);out.ground=cnt(ground);out.apron=cnt(apron);out.decal=cnt(decal);out.flut=cnt(flutter);out.back=cnt(back);out.ball=cnt(ball);return out;})(),scenery:place.geometry.attributes.position?place.geometry.attributes.position.count/3:0,tris:(()=>{let t=0;scene.traverse(x=>{const m=x as T.Mesh;if(!m.isMesh||!m.visible)return;let v:T.Object3D|null=m;while(v){if(!v.visible)return;v=v.parent;}const g=m.geometry;if(!g.attributes.position)return;const n=(g.index?g.index.count:g.attributes.position.count)/3;t+=n*((m as T.InstancedMesh).isInstancedMesh?(m as T.InstancedMesh).count:1);});return Math.round(t);})(),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,textures:renderer.info.memory.textures,geometries:renderer.info.memory.geometries,programs:renderer.info.programs?.length??0}),
  dispose(){backTex?.dispose();groundT?.dispose();decalT?.dispose();ground.geometry.dispose();apron.geometry.dispose();place.geometry.dispose();decal.geometry.dispose();for(const m of [...trees,ghost,trail,bits,flutter])m.dispose();
   // the rig's textures too (shared ones such as the bean face atlas hold this renderer otherwise; as Ball Blaster does)
   const tex=new Set<T.Texture>(),addT=(v:unknown)=>{if((v as T.Texture|null)?.isTexture)tex.add(v as T.Texture);};
   bean.traverse(x=>{const m=(x as T.Mesh).material as T.Material|T.Material[]|undefined;for(const mm of m?(Array.isArray(m)?m:[m]):[])for(const v of Object.values(mm)){addT(v);if(v&&typeof v==='object'&&!(v as T.Texture).isTexture&&!Array.isArray(v))for(const u of Object.values(v as Record<string,unknown>))addT((u as {value?:unknown}|null)?.value);}});
   kicker.dispose();tex.forEach(t=>t.dispose());for(const x of owned)x.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();},
 };
}
