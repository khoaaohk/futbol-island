/**
 * Ball Blaster drawing (Nov 17 2026, docs/arcade-aaa/ballblaster-direction.md): one three.js scene in the arcade's comic print style
 * (lib/arcade/comic: banded light, violet halftone shadows, ink hulls baked into the geometry). A training pitch in a small stadium at
 * day, sunset or night (it turns every three waves): mown checks, advert boards the balls bounce off, tiered stands with a two-frame
 * crowd, floodlight towers with glow cards, a goal and net at the far end, an island skyline painted into the sky.
 * The stadium is baked into a handful of merged meshes (vertex colour + three textured sheets). Everything that moves is instanced:
 * one draw per machine kind, one for all the eyes, one for the wind-up keys, one for the drone rotors, balls, chunks, springs and
 * bolts, dust, trail, aim dots. Empty instanced meshes are hidden (no draw). Pools are fixed. Canvas textures are made once (the sky
 * repaints its own canvas when the time of day turns).
 * Heat (AGENTS.md): low-power context, pixel ratio 1.5 on phones (2 on desktop), ONE shadow-casting sun, no post-processing, the shell
 * draws only while playing (30 fps on phones). The view makes its own canvas (a fresh one per mount: React's dev double mount never
 * meets a lost context) and frees everything in dispose().
 */
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createComicUniforms,comicDotCell,aimComicSun,comicMaterial,comicTree,COMIC_INK,COMIC_PAPER} from '../comic/shading';
import {inkedPart,partAt,bakeParts,comicStarGeometry,flipFaces} from '../comic/ink';
import {createIslandArcadePlayer} from '../islandArcadePlayer';
import type {ArcadePoseOptions} from '../arcadePlayerMotion';
import {BB,K,UNLOCK,halfW,BOARD_OUT,isMachine,type BallBlaster,type BlastEvent} from './core';

export const BB_COLORS={sky:'#8fd4ee',grass:'#4fb85c',grassMown:'#5fc76a',line:'#fff3d6',sun:'#ffc83a',red:'#f0452e',teal:'#19b5a5',ink:COMIC_INK,paper:COMIC_PAPER};
const PIECES=180,BITS=18,DUST=48,DOTS=40,STARS=8,TRAIL=90,EYES=120,KEYS=40,ROTORS=40;
const PIECE_TONES:Record<number,string[]>={1:['#e8e2d4','#f0452e','#cfd8dc','#5b6072'],2:['#ff8a3c','#fff3d6','#ff8a3c'],3:['#ffc83a','#e0603a','#ffc83a'],4:['#19b5a5','#231a2e','#cfd8dc'],
 5:['#3a7bd5','#e8e2d4','#19b5a5'],6:['#ff65c8','#fff3d6','#ff65c8'],7:['#8d93a6','#ffc83a','#5b6072'],8:['#f0452e','#fff3d6','#ffd9a8','#f0452e'],
 10:['#c98a4b','#8a5a2e','#e0a865'],11:['#bfe9f5','#ffffff','#8fd0e6'],12:['#ff8a3c','#fff3d6'],13:['#2d2a33','#ffc83a','#2d2a33'],14:['#2f8fd8','#ffffff','#8fd0e6','#bfe9f5'],15:['#2d2a33','#ffc83a','#e8e2d4']};
const CAP:Record<number,number>={1:18,2:18,3:12,4:10,5:10,6:10,7:10,10:10,11:6,12:6,13:6,14:12,15:4};
/** Machines are drawn this much bigger than their rules size: toys you can read from the far end of the pitch. */
const MSCALE=1.3,PSCALE=1.12;
/** The island bean kicker's scale (the rig is about 1.6 m tall: this keeps the old stand-in's height against the ball and machines). */
const BEAN_S=.92;
/** Where each machine's eyes sit (local, before MSCALE): height, forward, half-gap, size; one = a single big lens. */
const EYE:Record<number,{y:number;z:number;g:number;s:number;one?:boolean}>={1:{y:1.3,z:.23,g:.11,s:.085},2:{y:.6,z:.21,g:.1,s:.1},3:{y:1.47,z:.2,g:.08,s:.065},4:{y:.22,z:.27,g:0,s:.12,one:true},
 5:{y:1.62,z:.22,g:.11,s:.085},6:{y:1.2,z:.23,g:.1,s:.09},7:{y:1.5,z:.24,g:.12,s:.075}};
/** The wind-up key on the back: height, back offset, size. */
const KEY:Record<number,{y:number;z:number;s:number}>={1:{y:.86,z:-.27,s:1},5:{y:.86,z:-.27,s:1},6:{y:.8,z:-.23,s:.85},7:{y:.9,z:-.33,s:1.25}};
/** Times of day: the sky turns every three waves. */
const TOD=[
 {top:'#5ab8e6',low:'#c4ecf7',fog:'#c4e8f2',sun:'#ffffff',sunI:2.6,hemi:'#ffffff',hemiG:'#a79bb5',hemiI:.55,glow:.18,turf:1,crowd:1,pool:'#000000',cloud:'#fff8e8',cloudShade:'#cfe6f2',orb:'#fff1b0',hill:'#3f8f5a',hill2:'#5aa86a'},
 {top:'#d9604f',low:'#ffc36a',fog:'#f3b48a',sun:'#ffd3a0',sunI:2.35,hemi:'#ffd0b0',hemiG:'#8a6a9a',hemiI:.62,glow:.55,turf:.92,crowd:.9,pool:'#000000',cloud:'#ffe3b5',cloudShade:'#f2957a',orb:'#fff1b0',hill:'#6a3f6a',hill2:'#8f5a72'},
 {top:'#121842',low:'#3a4386',fog:'#2a3166',sun:'#cdd8ff',sunI:1.15,hemi:'#7d8ad6',hemiG:'#1c1830',hemiI:.62,glow:1,turf:.34,crowd:.62,pool:'#a89c74',cloud:'#4b5594',cloudShade:'#2e3570',orb:'#f6f2dc',hill:'#1d2350',hill2:'#2b326a'},
] as const;

/* ---- canvas textures (made once) ---- */
function canvasTex(w:number,h:number,paint:(g:CanvasRenderingContext2D)=>void){const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d')!);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
const seeded=(s:number)=>{let r=s;return ()=>{r=(r*16807)%2147483647;return r/2147483647;};};
/** The pitch, 30 m x 64 m (x -15..15, z 6..-58), 16 px a metre: mown checks, blade flecks, the lines, darker turf outside the boards. */
function pitchTex(){const S=16;return canvasTex(30*S,64*S,g=>{const X=(x:number)=>(x+15)*S,Z=(z:number)=>(6-z)*S;
 for(let i=0;i<16;i++)for(let j=0;j<6;j++){const a=(i+j)%2;g.fillStyle=i%2?(a?'#4cb45a':'#52ba5f'):(a?'#5ec66a':'#64cc70');g.fillRect(j*5*S,i*4*S,5*S,4*S);}
 const rnd=seeded(7);for(let i=0;i<9000;i++){const x=rnd()*30*S,y=rnd()*64*S;g.fillStyle=rnd()<.5?'rgba(35,70,30,.16)':'rgba(255,255,220,.12)';g.fillRect(x,y,1.5,3+rnd()*3);}
 // outside the slanted boards: deeper turf, so the lane reads as the stage
 g.fillStyle='#3a8a47';for(const s of [-1,1]){g.beginPath();g.moveTo(X(s*(halfW(6)+BOARD_OUT)),Z(6));g.lineTo(X(s*(halfW(-58)+BOARD_OUT)),Z(-58));g.lineTo(X(s*15),Z(-58));g.lineTo(X(s*15),Z(6));g.closePath();g.fill();}
 g.strokeStyle=BB_COLORS.line;g.lineWidth=.16*S;g.lineCap='round';
 const line=(x0:number,z0:number,x1:number,z1:number)=>{g.beginPath();g.moveTo(X(x0),Z(z0));g.lineTo(X(x1),Z(z1));g.stroke();};
 line(-15,0,15,0);line(-9.16,0,-9.16,-5.5);line(9.16,0,9.16,-5.5);line(-9.16,-5.5,9.16,-5.5);
 line(-13,0,-13,-16.5);line(13,0,13,-16.5);line(-13,-16.5,13,-16.5);
 g.beginPath();g.arc(X(0),Z(-11),.25*S,0,7);g.fillStyle=BB_COLORS.line;g.fill();
 g.beginPath();g.arc(X(0),Z(-11),9.15*S,Math.PI*.2,Math.PI*.8);g.stroke();
 line(-15,-52,15,-52);line(-9.16,-52,-9.16,-46.5);line(9.16,-52,9.16,-46.5);line(-9.16,-46.5,9.16,-46.5);g.beginPath();g.arc(X(0),Z(-30),9.15*S,0,Math.PI*2);g.stroke();line(-15,-30,15,-30);});}
/** Invented island sponsors on the touchline boards (no real brands). */
function boardTex(){return canvasTex(1024,64,g=>{const words=['PALM POP SODA','REEF RADIO 98','MANGO MOO MILK','FUTBOL ISLAND','SANDY SOX','LAGOON LEMONADE','KOKO KRUMBS','BALL BLASTER'],cols=[BB_COLORS.red,BB_COLORS.teal,BB_COLORS.sun,'#2f8fd8',COMIC_PAPER,'#ff8a3c','#ff65c8',COMIC_INK];
 let x=0,i=0;g.textBaseline='middle';while(x<1024){const k=i%words.length;g.font=k%3===1?'italic 900 36px system-ui,sans-serif':'900 38px system-ui,sans-serif';const w=g.measureText(words[k]).width+56;g.fillStyle=cols[k];g.fillRect(x,0,w,64);
  g.fillStyle=k===2||k===4?COMIC_INK:k===7?BB_COLORS.sun:COMIC_PAPER;g.fillText(words[k],x+28,34);g.fillStyle=COMIC_INK;g.fillRect(x+w-4,0,4,64);x+=w;i++;}
 g.fillStyle=COMIC_INK;g.fillRect(0,0,1024,5);g.fillRect(0,59,1024,5);});}
/** The crowd in two frames (top half, bottom half): the shell flips between them, so the stands bob and cheer. */
function crowdTex(){return canvasTex(512,256,g=>{const shirts=[BB_COLORS.red,BB_COLORS.teal,BB_COLORS.sun,'#fff3d6','#2f8fd8','#ff8a3c','#ff65c8'],skin=['#ffd9a8','#e8b07a','#b9774a','#8a5530'];
 for(const f of [0,1]){const rnd=seeded(11);const oy=f*128;g.fillStyle='#3a3350';g.fillRect(0,oy,512,128);g.fillStyle='#2c263f';for(let row=0;row<6;row++)g.fillRect(0,oy+row*21+17,512,4);
  for(let row=0;row<6;row++)for(let i=0;i<34;i++){const x=i*15+(row%2)*7+rnd()*3,up=rnd()<.35,jump=f===1&&up?-4:0,y=oy+12+row*21+jump,shirt=shirts[Math.floor(rnd()*shirts.length)];
   g.fillStyle=shirt;g.fillRect(x-6,y+3,12,10);if(f===1&&up){g.fillRect(x-8,y-9,3,11);g.fillRect(x+5,y-9,3,11);}
   g.beginPath();g.arc(x,y,5,0,7);g.fillStyle=skin[Math.floor(rnd()*skin.length)];g.fill();g.lineWidth=1.5;g.strokeStyle=COMIC_INK;g.stroke();
   if(rnd()<.14){g.fillStyle=shirts[Math.floor(rnd()*shirts.length)];g.fillRect(x-1,y-15+(f?-3:0),2,10);g.fillRect(x-7,y-18+(f?-3:0),14,7);}}}});}
/** The sky for one time of day: banded comic sky, sun or moon, inked clouds, an island skyline with palms along the bottom. */
function paintSky(g:CanvasRenderingContext2D,tod:number){const P=TOD[tod],W=1024,H=384;
 const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,P.top);gr.addColorStop(.72,P.low);gr.addColorStop(1,P.low);g.fillStyle=gr;g.fillRect(0,0,W,H);
 const rnd=seeded(5+tod);
 if(tod===2){g.fillStyle='#fff6d8';for(let i=0;i<90;i++){const x=rnd()*W,y=rnd()*H*.6,s=rnd()<.15?3:1.6;g.fillRect(x,y,s,s);}}
 g.beginPath();g.arc(tod===1?520:790,tod===1?196:70,tod===1?40:24,0,7);g.fillStyle=P.orb;g.fill();g.lineWidth=4;g.strokeStyle=COMIC_INK;g.stroke();
 if(tod===2){g.beginPath();g.arc(799,64,21,0,7);g.fillStyle=P.top;g.fill();}
 const cloud=(x:number,y:number,s:number)=>{const lobes=[[0,0,22],[24,-10,26],[52,0,20],[26,8,22]];g.beginPath();for(const [dx,dy,r] of lobes)g.arc(x+dx*s,y+dy*s,r*s,0,7);g.fillStyle=COMIC_INK;g.fill();
  for(const [dx,dy,r] of lobes){g.beginPath();g.arc(x+dx*s,y+dy*s,(r-2.5)*s,0,7);g.fillStyle=P.cloudShade;g.fill();}
  for(const [dx,dy,r] of lobes){g.beginPath();g.arc(x+dx*s-2*s,y+dy*s-4*s,(r-5)*s,0,7);g.fillStyle=P.cloud;g.fill();}};
 cloud(70,120,.8);cloud(330,90,.55);cloud(560,150,.7);cloud(880,160,.5);cloud(220,190,.45);cloud(700,100,.5);
 // the island beyond the stadium: two hill bands and palms
 const hill=(y0:number,amp:number,col:string,seed:number)=>{g.beginPath();g.moveTo(0,H);for(let x=0;x<=W;x+=16)g.lineTo(x,y0-Math.abs(Math.sin(x*.006+seed))*amp-Math.sin(x*.021+seed*2)*amp*.25);g.lineTo(W,H);g.closePath();g.fillStyle=col;g.fill();g.lineWidth=3;g.strokeStyle=COMIC_INK;g.stroke();};
 hill(236,16,P.hill2,1);hill(250,10,P.hill,4);
 for(const [x,h] of [[120,24],[140,18],[470,26],[760,22],[778,16],[960,24]]){const y=250;g.lineWidth=3;g.strokeStyle=COMIC_INK;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+8,y-h*.5,x+4,y-h);g.stroke();
  g.fillStyle=P.hill;for(let k=0;k<5;k++){const a=-Math.PI*.95+k*Math.PI*.24;g.beginPath();g.ellipse(x+4+Math.cos(a)*7,y-h+Math.sin(a)*3,8,2.5,a,0,7);g.fill();g.lineWidth=2;g.stroke();}}}
/** A football: cream with ink pentagons; the ink band along the top is the outline's colour (the hull samples it). */
function ballTex(){return canvasTex(256,128,g=>{g.fillStyle='#fffaf0';g.fillRect(0,0,256,128);g.fillStyle=COMIC_INK;
 const pent=(cx:number,cy:number,r:number)=>{g.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}g.closePath();g.fill();};
 g.strokeStyle=COMIC_INK;g.lineWidth=2.5;for(let i=0;i<5;i++){const x=i*51.2;g.beginPath();g.moveTo(x+25,38);g.lineTo(x,90);g.moveTo(x+25,38);g.lineTo(x+51,90);g.moveTo(x+25,38);g.lineTo(x+25,10);g.moveTo(x,90);g.lineTo(x,118);g.stroke();}
 for(let i=0;i<5;i++){pent(25.6+i*51.2,38,15);pent(i*51.2,90,15);}pent(256,90,15);g.fillRect(0,0,256,9);g.fillRect(0,119,256,9);});}
function blobTex(){return canvasTex(64,64,g=>{const r=g.createRadialGradient(32,32,8,32,32,31);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.6,'rgba(255,255,255,.8)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);});}
function netTex(){return canvasTex(128,128,g=>{g.clearRect(0,0,128,128);g.strokeStyle='#fff8ea';g.lineWidth=3;for(let i=0;i<=128;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i,128);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(128,i);g.stroke();}});}
/** Night floodlight pools on the pitch (an emissive map, same layout as pitchTex): four soft warm ovals under the towers' beams. */
function poolTex(){const S=4;return canvasTex(30*S,64*S,g=>{const X=(x:number)=>(x+15)*S,Z=(z:number)=>(6-z)*S;g.fillStyle='#000';g.fillRect(0,0,30*S,64*S);
 for(const [x,z,rx,rz] of [[-5.5,-4,8,9],[5.5,-15,8,10],[-4.5,-29,8,10],[4.5,-43,9,11],[0,-52,10,8]]){g.save();g.translate(X(x),Z(z));g.scale(rx,rz);const r=g.createRadialGradient(0,0,0,0,0,S);r.addColorStop(0,'rgba(255,255,255,.95)');r.addColorStop(.55,'rgba(255,255,255,.5)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.beginPath();g.arc(0,0,S,0,7);g.fill();g.restore();}});}
function glowTex(){return canvasTex(128,128,g=>{const r=g.createRadialGradient(64,64,4,64,64,64);r.addColorStop(0,'rgba(255,250,220,1)');r.addColorStop(.25,'rgba(255,236,170,.75)');r.addColorStop(1,'rgba(255,220,140,0)');g.fillStyle=r;g.fillRect(0,0,128,128);});}

/* ---- inked props, built once ---- */
type Parts=T.BufferGeometry[];
const box=(w:number,h:number,d:number)=>new T.BoxGeometry(w,h,d),cyl=(a:number,b:number,h:number,s=8)=>new T.CylinderGeometry(a,b,h,s),sph=(r:number,s=8)=>new T.SphereGeometry(r,s,Math.max(4,s*.6|0));
const tor=(r:number,t:number)=>new T.TorusGeometry(r,t,4,8).rotateX(Math.PI/2);
function P(o:Parts,g:T.BufferGeometry,c:string,x:number,y:number,z:number,ry=0,rz=0,ink=.035,round=false){inkedPart(o,g,c,partAt(x,y,z,ry,rz),ink,round);}
function build(kind:number):T.BufferGeometry{const o:Parts=[];const W='#efe8d8',S='#cfd8dc',D='#5b6072',I=COMIC_INK,Y=BB_COLORS.sun,R=BB_COLORS.red,PA=COMIC_PAPER;
 const legs=(c:string,h=.42)=>{P(o,box(.18,h,.18),c,-.17,h/2,0);P(o,box(.18,h,.18),c,.17,h/2,0);P(o,box(.26,.1,.34),I,-.17,.05,.06,0,0,.02);P(o,box(.26,.1,.34),I,.17,.05,.06,0,0,.02);};
 const head=(y:number,c:string,ant=R)=>{P(o,box(.52,.4,.44),c,0,y,0);P(o,box(.3,.09,.04),I,0,y-.11,.23,0,0,.012);for(const x of [-.09,0,.09])P(o,box(.035,.06,.03),PA,x,y-.11,.25,0,0,0);
  for(const s of [-1,1])P(o,box(.08,.14,.14),Y,s*.29,y,0,0,0,.02);P(o,box(.03,.24,.03),I,0,y+.32,0,0,0,.012);P(o,sph(.07,6),ant,0,y+.46,0,0,0,.025,true);};
 switch(kind){
  case K.robot:legs(D);P(o,box(.74,.64,.52),W,0,.75,0);P(o,box(.46,.32,.06),R,0,.79,.27,0,0,.02);for(const x of [-.17,.17])P(o,box(.05,.05,.03),PA,x,.9,.31,0,0,0);P(o,box(.2,.06,.03),Y,0,.7,.31,0,0,0);
   P(o,box(.13,.38,.13),S,-.48,.74,.04,0,.35);P(o,box(.13,.38,.13),S,.48,.74,.04,0,-.35);P(o,box(.17,.15,.17),R,-.56,.53,.08,0,0,.025);P(o,box(.17,.15,.17),R,.56,.53,.08,0,0,.025);head(1.3,S);break;
  case K.cone:P(o,cyl(.07,.42,.86,12),'#ff8a3c',0,.49,0,0,0,.045,true);P(o,cyl(.18,.27,.17,12),PA,0,.5,0,0,0,0,true);P(o,box(.9,.09,.9),'#ff8a3c',0,.05,0);
   P(o,box(.04,.3,.04),I,-.33,.45,.05,0,.9,.012);P(o,box(.04,.3,.04),I,.33,.45,.05,0,-.9,.012);P(o,sph(.06,6),PA,-.46,.56,.05,0,0,.015,true);P(o,sph(.06,6),PA,.46,.56,.05,0,0,.015,true);
   P(o,box(.16,.04,.03),I,0,.4,.25,0,0,0);break;
  case K.dummy:P(o,cyl(.26,.3,.08,12),D,0,.04,0,0,0,.025,true);for(let i=0;i<4;i++)P(o,tor(.13,.025),i%2?S:'#8d93a6',0,.12+i*.055,0,0,0,0);
   P(o,cyl(.3,.36,.86,12),Y,0,.73,0,0,0,.045,true);P(o,box(1.1,.16,.16),Y,0,1.03,0);P(o,cyl(.31,.31,.12,12),R,0,.58,0,0,0,0,true);P(o,box(.5,.09,.02),R,0,.86,.31,0,0,0);
   P(o,sph(.25,12),'#ffe3a0',0,1.45,0,0,0,.045,true);P(o,box(.1,.03,.03),I,-.08,1.56,.22,0,.3,0);P(o,box(.1,.03,.03),I,.08,1.56,.22,0,-.3,0);P(o,box(.12,.035,.03),I,0,1.36,.23,0,0,0);break;
  case K.drone:P(o,box(.56,.2,.56),BB_COLORS.teal,0,.25,0);P(o,box(.3,.06,.3),PA,0,.37,0,0,0,.015);for(const [x,z] of [[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]]){P(o,box(.36,.06,.07),I,x*.6,.3,z*.6,Math.atan2(-z,x),0,.01);P(o,cyl(.05,.05,.1,6),D,x,.34,z,0,0,.012,true);}
   P(o,sph(.17,10),I,0,.22,.25,0,0,0,true);P(o,box(.06,.14,.06),R,0,.06,0,0,0,.01);P(o,box(.2,.04,.04),R,0,.02,0,0,0,.01);break;
  case K.shield:legs(D);P(o,box(.74,.64,.52),BB_COLORS.teal,0,.75,0);head(1.62,S,'#ff8a3c');P(o,box(1.25,1.3,.12),'#3a7bd5',0,.86,.52);P(o,box(.84,.2,.04),PA,0,.86,.6,0,0,0);P(o,box(.2,.84,.04),PA,0,.86,.6,0,0,0);
   for(const s of [-1,1])P(o,box(.06,1.1,.04),'#2a5fae',s*.52,.86,.6,0,0,0);P(o,box(.2,.32,.2),S,0,1.32,0);break;
  case K.dodger:P(o,cyl(.24,.24,.1,14),'#2d2a33',0,.24,0,0,Math.PI/2,.03,true);P(o,cyl(.1,.1,.11,8),Y,0,.24,0,0,Math.PI/2,0,true);P(o,box(.06,.36,.06),I,0,.5,0,0,0,.012);
   P(o,sph(.36,12),'#ff65c8',0,.92,0,0,0,.045,true);P(o,sph(.22,10),'#ffd0ec',0,.9,.18,0,0,0,true);P(o,sph(.24,12),'#ff65c8',0,1.24,0,0,0,.04,true);
   for(const s of [-1,1]){P(o,cyl(.015,.015,.26,5),I,s*.12,1.48,0,0,-s*.4,.01);P(o,sph(.05,6),Y,s*.18,1.6,0,0,0,.015,true);}P(o,box(.1,.03,.03),I,0,1.1,.22,0,0,0);break;
  case K.armour:legs(D,.48);P(o,box(.94,.78,.64),'#8d93a6',0,.88,0);for(const x of [-.3,0,.3])P(o,box(.13,.66,.04),Y,x,.88,.33,0,.35,.01);P(o,box(1.12,.24,.72),D,0,1.2,0);
   for(const s of [-1,1])P(o,sph(.2,10),'#a9afc0',s*.6,1.24,0,0,0,.03,true);P(o,box(.56,.42,.48),'#a9afc0',0,1.52,0);P(o,box(.5,.1,.04),I,0,1.6,.25,0,0,0);
   P(o,box(.14,.04,.03),I,-.12,1.6,.27,0,-.35,0);P(o,box(.14,.04,.03),I,.12,1.6,.27,0,.35,0);break;
  case K.crate:P(o,box(.9,.86,.9),'#c98a4b',0,.43,0);for(const s of [-1,1]){P(o,box(.92,.1,.06),'#8a5a2e',0,.43+s*.3,.45,0,0,0);P(o,box(.06,.86,.92),'#8a5a2e',.45*s,.43,0,0,0,0);}P(o,box(.1,.9,.04),'#8a5a2e',0,.43,.46,0,.78,0);break;
  case K.glass:P(o,box(1.3,.1,.12),'#c98a4b',0,.05,0);P(o,box(1.3,.1,.12),'#c98a4b',0,1.55,0);P(o,box(.1,1.6,.12),'#c98a4b',-.62,.8,0);P(o,box(.1,1.6,.12),'#c98a4b',.62,.8,0);
   P(o,box(1.16,1.42,.05),'#bfe9f5',0,.8,0,0,0,0);P(o,box(.08,.9,.06),'#ffffff',-.2,.95,0,0,.6,0);P(o,box(.05,.5,.06),'#ffffff',.1,.7,0,0,.6,0);break;
  case K.tower:for(let i=0;i<3;i++){const y=i*.66;P(o,cyl(.07,.36,.66,12),'#ff8a3c',0,y+.36,0,0,0,.035,true);P(o,cyl(.17,.24,.12,12),COMIC_PAPER,0,y+.4,0,0,0,0,true);}P(o,box(.8,.06,.8),'#ff8a3c',0,.03,0);break;
  case K.tyres:for(let i=0;i<3;i++){P(o,cyl(.52,.52,.32,14),'#2d2a33',0,.18+i*.34,0,0,0,.035,true);P(o,cyl(.3,.3,.33,12),Y,0,.18+i*.34,0,0,0,0,true);}break;
  case K.barrel:P(o,cyl(.42,.42,.96,14),'#2f8fd8',0,.48,0,0,0,.04,true);for(const y of [.18,.78])P(o,cyl(.43,.43,.07,14),COMIC_PAPER,0,y,0,0,0,0,true);
   P(o,sph(.12,8),COMIC_PAPER,0,.5,.4,0,0,.02,true);P(o,cyl(.1,.12,.08,8),I,0,1,0,0,0,0,true);P(o,box(.08,.2,.02),'#bfe9f5',-.16,.6,.4,0,0,0);break;
  case K.board:P(o,box(.14,1.2,.14),D,-.75,.6,0);P(o,box(.14,1.2,.14),D,.75,.6,0);P(o,box(1.9,1.2,.3),'#2d2a33',0,1.75,0);
   for(const [x,w,h,yy] of [[-.45,.4,.08,2.1],[-.45,.4,.08,1.4],[-.65,.08,.6,1.75],[-.25,.08,.6,1.75],[.45,.4,.08,2.1],[.45,.4,.08,1.75],[.45,.4,.08,1.4],[.65,.08,.7,1.75]])P(o,box(w,h,.04),Y,x,yy,.16,0,0,0);break;
  default:P(o,box(.5,.5,.5),W,0,.25,0);
 }
 return bakeParts(o);}
/** One googly eye (white, ink rim, pupil toward +z), unit radius. */
function eyeGeo(){const o:Parts=[];P(o,sph(1,8),'#ffffff',0,0,0,0,0,.22,true);P(o,sph(.5,6),COMIC_INK,0,.05,.62,0,0,0,true);P(o,box(.2,.2,.1),'#ffffff',.14,.24,1.02,0,0,0);return bakeParts(o);}
/** A wind-up key: stem along +z (out of the back is -z, so the instance flips it), butterfly bow. */
function keyGeo(){const o:Parts=[];P(o,cyl(.04,.04,.26,6).rotateX(Math.PI/2),BB_COLORS.sun,0,0,-.13,0,0,.015,true);P(o,box(.42,.2,.05),BB_COLORS.sun,0,0,-.3,0,0,.025);P(o,box(.1,.1,.06),'#e0a020',0,0,-.3,0,0,0);return bakeParts(o);}
function rotorGeo(){const o:Parts=[];P(o,box(.46,.025,.08),'#cfd8dc',0,0,0,0,0,.015);P(o,box(.08,.025,.46),'#cfd8dc',0,0,0,0,0,.015);P(o,cyl(.05,.05,.05,6),COMIC_INK,0,.02,0,0,0,0,true);return bakeParts(o);}
/** Mega Mannequin: the boss, 5 m of training-kit toy. The body is baked three times (all armour, shoulder and thigh plates gone,
 * helmet and chest frame gone too) and swapped as its phases turn, so the plates cost no extra draw. The glowing chest dial is its
 * weak spot (one basic-material disc that pulses faster each phase); its eyes ride in the machines' instanced eye mesh. */
function buildBoss(mat:T.Material,key:T.BufferGeometry){const g=new T.Group();const R=BB_COLORS.red,W='#fff3d6',I=COMIC_INK,G='#8d93a6',G2='#6c7186',Y=BB_COLORS.sun,SK='#ffd9a8';
 const disc=(r:number,d:number)=>new T.CylinderGeometry(r,r,d,20).rotateX(Math.PI/2);
 const mk=(plA:boolean,plB:boolean)=>{const o:Parts=[];
  for(const s of [-1,1]){P(o,box(.56,1.45,.56),'#5b6072',s*.42,.8,0);P(o,box(.68,.24,.84),I,s*.42,.12,.1,0,0,.02);P(o,box(.6,.2,.6),W,s*.42,1.28,0,0,0,.02);}
  P(o,box(1.5,.36,.86),'#3d4152',0,1.62,0,0,0,.04);P(o,box(1.9,1.5,1.02),R,0,2.5,0,0,0,.05);P(o,box(1.92,.26,1.04),W,0,1.88,0,0,0,0);
  P(o,box(.18,1.2,.06),W,-.62,2.55,.52,0,0,0);P(o,box(.18,1.2,.06),W,.62,2.55,.52,0,0,0);
  P(o,disc(.44,.12),I,0,2.55,.5,0,0,0);P(o,cyl(.26,.3,.32,10),SK,0,3.32,0,0,0,.03,true);
  P(o,sph(.72,16),SK,0,3.86,0,0,0,.05,true);P(o,box(1.46,.05,.05),'#e0b98a',0,3.86,.0,0,0,0);
  P(o,box(.34,.1,.06),I,-.26,4.16,.66,0,.32,0);P(o,box(.34,.1,.06),I,.26,4.16,.66,0,-.32,0);P(o,box(.46,.1,.06),I,0,3.56,.66,0,0,0);P(o,box(.09,.16,.06),I,-.24,3.6,.66,0,.5,0);P(o,box(.09,.16,.06),I,.24,3.6,.66,0,-.5,0);
  if(plA)for(const s of [-1,1]){P(o,box(.8,.34,.86),G,s*1.12,3.28,0,0,s*-.28,.05);P(o,box(.82,.09,.88),Y,s*1.12,3.2,0,0,s*-.28,0);P(o,box(.64,.6,.14),G2,s*.42,1.0,.32,0,0,.04);P(o,box(.64,.09,.16),Y,s*.42,1.12,.33,0,0,0);}
  if(plB){P(o,box(1.56,.46,1.56),G,0,4.42,0,0,0,.05);P(o,box(1.58,.1,1.58),Y,0,4.3,0,0,0,0);P(o,box(1.56,.12,.42),G2,0,4.16,.78,0,0,.03);
   P(o,box(1.24,.24,.12),G,0,3.08,.54,0,0,.03);P(o,box(1.24,.24,.12),G,0,2.02,.54,0,0,.03);P(o,box(.24,.86,.12),G,-.5,2.55,.54,0,0,.03);P(o,box(.24,.86,.12),G,.5,2.55,.54,0,0,.03);
   for(const [x,y] of [[-.5,3.08],[.5,3.08],[-.5,2.02],[.5,2.02]])P(o,sph(.07,6),Y,x,y,.62,0,0,0);}
  return bakeParts(o);};
 const geos=[mk(true,true),mk(false,true),mk(false,false)];
 const arm:Parts=[];P(arm,box(.5,1.36,.5),R,0,-.55,0,0,0,.045);P(arm,box(.52,.24,.52),W,0,-1.02,0,0,0,0);P(arm,sph(.36,10),SK,0,-1.36,0,0,0,.04,true);
 const b=new T.Mesh(geos[0],mat);b.castShadow=true;g.add(b);const armG=bakeParts(arm),L=new T.Mesh(armG,mat),Rr=new T.Mesh(armG,mat);L.position.set(-1.2,3.0,0);Rr.position.set(1.2,3.0,0);L.castShadow=Rr.castShadow=true;g.add(L,Rr);
 const coreG=disc(.3,.1),coreM=new T.MeshBasicMaterial({color:Y}),core=new T.Mesh(coreG,coreM);core.position.set(0,2.55,.55);g.add(core);
 const k=new T.Mesh(key,mat);k.position.set(0,2.6,-.56);k.scale.setScalar(2.4);k.rotation.x=-.4;g.add(k);
 g.userData={arms:[L,Rr],key:k,armG,body:b,geos,core,coreM,coreG,ph:0};g.visible=false;return g;}
/** Where the boss's two eyes sit in its own space (before its 1.15 scale), and their size. */
const BOSS_EYE={y:3.94,z:.66,g:.27,s:.17};
/** Merge plain (indexed or not) geometries that share position/normal/uv; uv scaled per part (texture repeat baked in). */
function sheet(parts:{g:T.BufferGeometry;m:T.Matrix4;u?:number;v?:number}[]){const out=parts.map(({g,m,u=1,v=1})=>{const n=g.index?g.toNonIndexed():g.clone();g.dispose();const uv=n.attributes.uv as T.BufferAttribute;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*u,uv.getY(i)*v);n.applyMatrix4(m);return n;});
 const g=mergeGeometries(out)!;for(const p of out)p.dispose();return g;}
const mAt=(x:number,y:number,z:number,rx=0,ry=0,rz=0)=>new T.Matrix4().makeRotationFromEuler(new T.Euler(rx,ry,rz)).setPosition(x,y,z);

export type BallblasterView=ReturnType<typeof createBallblasterView>;
export type AimPick={x:number;y:number;z:number;lock:number};
export function createBallblasterView(host:HTMLElement,o:{reduced:boolean;mobile:boolean}){
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');canvas.dataset.ballblasterCanvas='';canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';host.prepend(canvas);
 const renderer=new T.WebGLRenderer({canvas,antialias:!o.mobile,powerPreference:'low-power',alpha:false});
 renderer.toneMapping=T.NoToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene();scene.background=new T.Color(TOD[0].low);const fog=new T.Fog(TOD[0].fog,52,120);scene.fog=fog;
 // the camera sits low behind the kicker so the machines loom as they come; wide screens sit a little higher and further back
 const camera=new T.PerspectiveCamera(56,.5,.1,260);const camBase=new T.Vector3(0,5.4,8.2),look=new T.Vector3(0,.4,-15);let baseFov=56;
 const ink=createComicUniforms({});
 const hemi=new T.HemisphereLight('#ffffff','#a79bb5',.55);scene.add(hemi);
 const sun=new T.DirectionalLight('#ffffff',2.6),toSun=new T.Vector3(-.55,.62,.56).normalize();sun.position.copy(toSun).multiplyScalar(40).add(new T.Vector3(0,0,-20));sun.target.position.set(0,0,-20);scene.add(sun,sun.target);
 sun.castShadow=true;const sc=sun.shadow.camera;sc.left=-16;sc.right=16;sc.top=34;sc.bottom=-30;sc.near=1;sc.far=110;sun.shadow.mapSize.set(o.mobile?1024:2048,o.mobile?1024:2048);sun.shadow.bias=-.0006;sun.shadow.normalBias=.03;
 const lit=(m:T.Material,rim=false)=>comicMaterial(m,{uniforms:ink,rim});
 const vmat=lit(new T.MeshLambertMaterial({vertexColors:true}));
 const owned:{dispose():void}[]=[vmat];const own=<X extends {dispose():void}>(x:X)=>{owned.push(x);return x;};

 /* ---- the ground and the stadium: a few merged meshes ---- */
 const crowdT=own(crowdTex());crowdT.wrapS=T.RepeatWrapping;crowdT.repeat.set(1,.5);
 const skyT=own(canvasTex(1024,384,g=>paintSky(g,0)));let tod=0;
 let pitchM:T.Material|null=null,turfM:T.Material|null=null,crowdM:T.Material|null=null;type LM=T.MeshLambertMaterial;
 const glowM=own(new T.MeshBasicMaterial({map:own(glowTex()),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,opacity:TOD[0].glow}));
 {const pt=own(pitchTex()),pm=pitchM=own(lit(new T.MeshLambertMaterial({map:pt,emissiveMap:own(poolTex()),emissive:'#000000'}))),pg=own(new T.PlaneGeometry(30,64));pg.rotateX(-Math.PI/2);const pitch=new T.Mesh(pg,pm);pitch.position.set(0,0,-26);pitch.receiveShadow=true;scene.add(pitch);
  const surround=own(new T.PlaneGeometry(160,160));surround.rotateX(-Math.PI/2);const sm=turfM=own(lit(new T.MeshLambertMaterial({color:'#3a8a47'})));const s=new T.Mesh(surround,sm);s.position.set(0,-.02,-40);scene.add(s);
  const st:Parts=[],St='#5b6072',St2='#4a4f63',Rf='#e8e2d4',I=COMIC_INK;
  // advert boards on the slanted touchlines (the balls bounce off these) and one behind the far goal
  const len=Math.hypot(52,52*.15),ad:{g:T.BufferGeometry;m:T.Matrix4;u?:number;v?:number}[]=[];
  for(const s of [-1,1]){const zc=-25,xc=s*(halfW(zc)+BOARD_OUT+.11),ry=-s*Math.atan(.15);ad.push({g:new T.PlaneGeometry(len,.9),m:mAt(xc-s*.12,.45,zc,0,ry-s*Math.PI/2,0),u:4.2});
   P(st,box(.22,.9,len),St2,xc,.45,zc,ry,0,0);P(st,box(.32,.09,len+.1),I,xc,.94,zc,ry,0,0);}
  ad.push({g:new T.PlaneGeometry(30,1),m:mAt(0,.5,-57.4),u:2.4});ad.push({g:new T.PlaneGeometry(50,1.3),m:mAt(0,10.9,-59.9),u:4});P(st,box(50.4,1.5,.2),COMIC_INK,0,10.9,-60.05,0,0,0);P(st,box(30,1,.2),St2,0,.5,-57.55,0,0,0);P(st,box(30.1,.1,.3),I,0,1.02,-57.5,0,0,0);
  const adT=own(boardTex());adT.wrapS=T.RepeatWrapping;const am=own(lit(new T.MeshLambertMaterial({map:adT})));const adMesh=new T.Mesh(own(sheet(ad)),am);scene.add(adMesh);
  // stands: four tiers each, crowd on the risers, a roof with an ink fascia
  const crowd:{g:T.BufferGeometry;m:T.Matrix4;u?:number;v?:number}[]=[];
  const R0=BB_COLORS.red;
  const stand=(x:number,z:number,w:number,ry:number)=>{const M=mAt(x,0,z,0,ry,0),put=(g:T.BufferGeometry,c:string,lx:number,ly:number,lz:number,rx=0,ink=0)=>inkedPart(st,g,c,new T.Matrix4().multiplyMatrices(M,mAt(lx,ly,lz,rx)),ink);
   for(let i=0;i<6;i++){put(box(w,1.5,2.1),i%2?St:St2,0,.8+i*1.5,-i*2.1);crowd.push({g:new T.PlaneGeometry(w,1.5),m:new T.Matrix4().multiplyMatrices(M,mAt(0,.8+i*1.5,-i*2.1+1.06)),u:w/13});}
   put(box(w+1,11.4,.4),St2,0,5.7,-11.7);put(box(w+1,.4,14),Rf,0,11.6,-6,-.1,.06);put(box(w+1.1,.6,.14),R0,0,12.25,.9,-.1);
   for(let i=-2;i<=2;i++)put(box(.22,11.8,.22),St2,i*w/5,5.9,-.3);};
  stand(0,-61,50,0);stand(-19.5,-24,44,Math.PI/2);stand(19.5,-24,44,-Math.PI/2);
  const cm=crowdM=own(lit(new T.MeshLambertMaterial({map:crowdT})));const crowdMesh=new T.Mesh(own(sheet(crowd)),cm);scene.add(crowdMesh);
  // floodlight towers: a lattice mast, a lamp bank facing the pitch, a glow card in front of it
  const glows:{g:T.BufferGeometry;m:T.Matrix4}[]=[];
  for(const [x,z] of [[-13,-74],[13,-74],[-26,-40],[26,-40]]){P(st,cyl(.22,.34,23,6),St,x,11.5,z,0,0,.05,true);for(let k=0;k<7;k++)P(st,box(.9,.08,.08),St2,x,2+k*3,z,k*.8,0,0);
   const head=new T.Object3D();head.position.set(x,23.6,z);head.lookAt(0,0,-26);head.updateMatrix();
   const lamp:Parts=[];P(lamp,box(3.2,1.8,.4),'#2d2a33',0,0,0,0,0,.08);for(let r=0;r<2;r++)for(let c=0;c<4;c++)P(lamp,box(.6,.6,.06),'#fff6c8',-1.14+c*.76,-.42+r*.84,.22,0,0,0);
   for(const g of lamp){g.applyMatrix4(head.matrix);st.push(g);}
   const gp=new T.Vector3(0,0,1.2).applyMatrix4(head.matrix),gq=new T.Object3D();gq.position.copy(gp);gq.lookAt(camBase);gq.updateMatrix();glows.push({g:new T.PlaneGeometry(9,9),m:gq.matrix.clone()});}
  const glowMesh=new T.Mesh(own(sheet(glows)),glowM);glowMesh.renderOrder=2;scene.add(glowMesh);
  // the far goal and its net
  const WH='#fffaf0';for(const s of [-1,1]){P(st,cyl(.07,.07,2.44,8),WH,s*3.66,1.22,-52,0,0,.035,true);P(st,box(.05,.05,2.2),'#cfd8dc',s*3.66,.03,-53.1,0,0,0);P(st,cyl(.03,.03,2.6,5),'#cfd8dc',s*3.66,1.2,-54.2,0,0,0,true);}
  P(st,cyl(.07,.07,7.46,8),WH,0,2.44,-52,0,Math.PI/2,.035,true);
  const net=own(sheet([{g:new T.PlaneGeometry(7.32,2.44),m:mAt(0,1.22,-54.2),u:6,v:2},{g:new T.PlaneGeometry(7.32,2.26),m:mAt(0,2.2,-53.1,-Math.PI/2+.5),u:6,v:2},
   {g:new T.PlaneGeometry(2.2,2.44),m:mAt(-3.66,1.22,-53.1,0,Math.PI/2),u:2,v:2},{g:new T.PlaneGeometry(2.2,2.44),m:mAt(3.66,1.22,-53.1,0,-Math.PI/2),u:2,v:2}]));
  const nt=own(netTex());nt.wrapS=nt.wrapT=T.RepeatWrapping;const netM=own(new T.MeshLambertMaterial({map:nt,alphaTest:.4,side:T.DoubleSide}));scene.add(new T.Mesh(net,netM));
  const statics=new T.Mesh(own(bakeParts(st)),vmat);scene.add(statics);
  const skyM=own(new T.MeshBasicMaterial({map:skyT,fog:false})),skyG=own(new T.PlaneGeometry(180,68));const sky=new T.Mesh(skyG,skyM);sky.position.set(0,27,-104);scene.add(sky);}

 /* ---- the kicker: the player's own island bean (their saved look and outfit) seen from behind, and the ball at its feet ----
  * The shared arcade rig (lib/arcade/islandArcadePlayer.ts, as Breakaway and Tennis use it), printed in the comic bands. One rig,
  * no extra light or pass. Its kick starts at the rig's contact phase on the frame the ball leaves, so the boot meets the ball. */
 const kicker=createIslandArcadePlayer(BB_COLORS.teal,o.reduced,0);kicker.useMainAppearance();
 const bean=kicker.root;bean.name='ballblaster-kicker';bean.scale.setScalar(BEAN_S);bean.position.set(BB.kx-.42,0,BB.kz+.42);
 comicTree(bean,{uniforms:ink});bean.traverse(x=>{if((x as T.Mesh).isMesh){x.castShadow=true;x.receiveShadow=false;}});scene.add(bean);
 const kickPose:ArcadePoseOptions={anticipate:.35};let kickNow=false,stunT=0,cheerT=0,shotPower=.5;
 const bt2=own(ballTex()),ballMat=own(lit(new T.MeshLambertMaterial({map:bt2}),true));
 const ballGeo=own((()=>{const s=new T.SphereGeometry(1,20,14).toNonIndexed(),h=new T.SphereGeometry(1.16,12,9).toNonIndexed();const uv=h.attributes.uv as T.BufferAttribute;for(let i=0;i<uv.count;i++)uv.setXY(i,.5,.985);flipFaces(h);const g=mergeGeometries([s,h])!;s.dispose();h.dispose();return g;})());
 const ready=new T.Mesh(ballGeo,ballMat);ready.scale.setScalar(BB.ballR);ready.position.set(BB.kx,BB.ballR,BB.kz);ready.castShadow=true;scene.add(ready);

 /* ---- instanced machines and props, their eyes, keys and rotors ---- */
 const kinds=[K.robot,K.cone,K.dummy,K.drone,K.shield,K.dodger,K.armour,K.crate,K.glass,K.tower,K.tyres,K.barrel,K.board];
 const inst=new Map<number,T.InstancedMesh>();
 const mkInst=(geo:T.BufferGeometry,n:number,shadow=true)=>{const m=new T.InstancedMesh(geo,vmat,n);m.instanceMatrix.setUsage(T.DynamicDrawUsage);m.setColorAt(0,new T.Color(1,1,1));m.count=0;m.visible=false;m.castShadow=shadow;m.frustumCulled=false;scene.add(m);return m;};
 for(const k of kinds)inst.set(k,mkInst(own(build(k)),CAP[k],false));
 const blobG=own(new T.PlaneGeometry(2,2));blobG.rotateX(-Math.PI/2);const blobs=new T.InstancedMesh(blobG,own(new T.MeshBasicMaterial({map:own(blobTex()),transparent:true,depthWrite:false,color:COMIC_INK,opacity:.34})),48);blobs.frustumCulled=false;blobs.count=0;blobs.visible=false;blobs.renderOrder=1;scene.add(blobs);
 const eyeG=own(eyeGeo()),keyG=own(keyGeo());
 const eyes=mkInst(eyeG,EYES,false),keys=mkInst(keyG,KEYS,false),rotors=mkInst(own(rotorGeo()),ROTORS,false);
 const boss=buildBoss(vmat,keyG);scene.add(boss);
 const balls=new T.InstancedMesh(ballGeo,ballMat,BB.rack*4);balls.castShadow=true;balls.frustumCulled=false;balls.count=0;balls.visible=false;balls.setColorAt(0,new T.Color(1,1,1));scene.add(balls);
 const spin=Array.from({length:64},()=>new T.Quaternion());

 /* ---- pooled effects ---- */
 const pieceGeo=own(bakeParts((()=>{const p:Parts=[];P(p,box(.32,.24,.26),'#ffffff',0,0,0,.4,.3,.035);return p;})()));
 const pieces=mkInst(pieceGeo,PIECES,false);pieces.visible=true;pieces.count=0;
 const pc=Array.from({length:PIECES},()=>({on:false,c:new T.Color(),x:0,y:0,z:0,vx:0,vy:0,vz:0,rx:0,ry:0,wx:0,wy:0,s:1,t:0,life:0}));let pieceI=0;
 const bitGeo=own(bakeParts((()=>{const p:Parts=[];for(let i=0;i<2;i++)P(p,tor(.1,.026),'#cfd8dc',0,i*.07,0,0,0,0);P(p,cyl(.035,.035,.18,6),'#8d93a6',.24,.06,0,0,Math.PI/2,.015,true);P(p,cyl(.07,.07,.05,6),'#ffc83a',.33,.06,0,0,Math.PI/2,.015,true);return p;})()));
 const bits=mkInst(bitGeo,BITS,false);
 const bt=Array.from({length:BITS},()=>({on:false,x:0,y:0,z:0,vx:0,vy:0,vz:0,rx:0,ry:0,wx:0,wy:0,s:1,t:0,life:0}));let bitI=0;
 const dustG=own(bakeParts((()=>{const p:Parts=[];P(p,new T.IcosahedronGeometry(1,0),'#efe6cf',0,0,0,0,0,.16,true);return p;})()));const dust=mkInst(dustG,DUST,false);
 const dd=Array.from({length:DUST},()=>({on:false,x:0,y:0,z:0,vy:0,vx:0,vz:0,s:0,t:0,life:0}));let dustI=0;
 const trailM=own(new T.MeshBasicMaterial({color:'#ffffff'})),trail=new T.InstancedMesh(own(new T.IcosahedronGeometry(1,0)),trailM,TRAIL);trail.frustumCulled=false;trail.count=0;trail.visible=false;trail.setColorAt(0,new T.Color(1,1,1));scene.add(trail);
 const tr=Array.from({length:TRAIL},()=>({on:false,x:0,y:0,z:0,dx:0,dy:0,dz:1,t:0,s:0,c:0}));let trI=0;
 const TRAIL_C=[new T.Color('#fff3d6'),new T.Color('#ffc83a'),new T.Color('#f0452e'),new T.Color('#ffe9a0')];
 const starG=own(comicStarGeometry()),stars=Array.from({length:STARS},()=>{const g=new T.Group(),a=new T.Mesh(starG,own(new T.MeshBasicMaterial({color:COMIC_INK,depthTest:false,fog:false}))),b=new T.Mesh(starG,own(new T.MeshBasicMaterial({color:BB_COLORS.sun,depthTest:false,fog:false})));
  b.scale.setScalar(.78);b.position.z=.01;g.add(a,b);g.renderOrder=10;a.renderOrder=10;b.renderOrder=11;g.visible=false;scene.add(g);return {g,b:b.material as T.MeshBasicMaterial,t:0,life:0,s:1};});let starI=0;
 // the aim: a ring on the target, a dotted arc
 const ringG=own(new T.RingGeometry(.42,.58,32)),ringInk=own(new T.RingGeometry(.36,.66,32));ringG.rotateX(-Math.PI/2);ringInk.rotateX(-Math.PI/2);
 const ring=new T.Group(),ringM=own(new T.MeshBasicMaterial({color:BB_COLORS.sun,depthTest:false,fog:false}));{const a=new T.Mesh(ringInk,own(new T.MeshBasicMaterial({color:COMIC_INK,depthTest:false,fog:false})));const b=new T.Mesh(ringG,ringM);b.position.y=.01;a.renderOrder=12;b.renderOrder=13;ring.add(a,b);}ring.visible=false;scene.add(ring);
 const dotM=own(new T.MeshBasicMaterial({color:'#fff3d6',depthTest:false,fog:false})),dots=new T.InstancedMesh(own(new T.SphereGeometry(1,8,6)),dotM,DOTS);dots.renderOrder=12;dots.frustumCulled=false;dots.count=0;dots.visible=false;dots.setColorAt(0,new T.Color(1,1,1));scene.add(dots);
 const arc=new Float32Array(DOTS*3);
 type Aim={x:number;y:number;z:number;power:number;curl:number;lock:number}|null;let aim:Aim=null;

 /* ---- time of day ---- */
 function setTod(i:number){tod=i;const p=TOD[i];paintSky((skyT.image as HTMLCanvasElement).getContext('2d')!,i);skyT.needsUpdate=true;(scene.background as T.Color).set(p.low);fog.color.set(p.fog);
  sun.color.set(p.sun);sun.intensity=p.sunI;hemi.color.set(p.hemi);hemi.groundColor.set(p.hemiG);hemi.intensity=p.hemiI;glowM.opacity=p.glow;
  // night reads as night: darker turf lit in floodlight pools, eyes that glow, a hotter additive ball trail (uniform swaps only)
  (pitchM as LM).color.setScalar(p.turf);(pitchM as LM).emissive.set(p.pool);(turfM as LM).color.set('#3a8a47').multiplyScalar(p.turf);(crowdM as LM).color.setScalar(p.crowd);night=i===2;
  const ec=eyes.instanceColor;if(ec){(ec.array as Float32Array).fill(night?1.9:1);for(let k=2;k<ec.array.length;k+=3)(ec.array as Float32Array)[k]=night?1.25:1;ec.needsUpdate=true;}
  trailM.blending=night?T.AdditiveBlending:T.NormalBlending;trailM.needsUpdate=true;}

 /* ---- frame state ---- */
 const M=new T.Matrix4(),M2=new T.Matrix4(),Q=new T.Quaternion(),Q2=new T.Quaternion(),E=new T.Euler(),V=new T.Vector3(),V2=new T.Vector3(),SV=new T.Vector3(),C1=new T.Color(),C2=new T.Color(),ZV=new T.Vector3(0,0,1),XV=new T.Vector3(1,0,0);
 let night=false,W=1,H=1,shake=0,kickT=9,lastT=0,bossShown=false,camPull=0,push=0,hype=0,crowdT0=0;
 function resize(w:number,h:number,dpr:number){W=w;H=h;renderer.setPixelRatio(Math.min(o.mobile?1.5:2,dpr));renderer.setSize(w,h,false);camera.aspect=w/h;
  // portrait: low and close with a wide lens (the near lane still fits); wide screens: a longer lens from a little higher
  const a=w/h;if(a<.62){baseFov=60;camBase.set(0,5.3,8.6);look.set(0,.3,-15);}else if(a<1){baseFov=50;camBase.set(0,5.6,8.6);look.set(0,.3,-16);}else{baseFov=40;camBase.set(0,6,9.6);look.set(0,.2,-17);}
  camera.fov=baseFov;camera.updateProjectionMatrix();comicDotCell(ink,renderer);}
 function spawnPieces(kind:number,x:number,y:number,z:number,n:number,force:number,nb=0){const tones=PIECE_TONES[kind]??PIECE_TONES[1];
  for(let i=0;i<n;i++){const idx=pieceI,p=pc[idx];pieceI=(pieceI+1)%PIECES;const a=Math.random()*6.28,u=Math.random();p.on=true;p.x=x+(Math.random()-.5)*.6;p.y=y+(Math.random()-.3)*.7;p.z=z+(Math.random()-.5)*.6;
   p.vx=Math.cos(a)*force*(.4+u);p.vz=Math.sin(a)*force*(.4+u)-force*.25;p.vy=force*(.7+Math.random()*.9);p.wx=(Math.random()-.5)*14;p.wy=(Math.random()-.5)*14;p.rx=a;p.ry=u*6;p.s=.7+Math.random()*.9;p.t=0;p.life=1.5+Math.random()*.6;
   p.c.set(tones[i%tones.length]);}
  for(let i=0;i<nb;i++){const b=bt[bitI];bitI=(bitI+1)%BITS;const a=Math.random()*6.28;b.on=true;b.x=x;b.y=y+.2;b.z=z;b.vx=Math.cos(a)*force*.7;b.vz=Math.sin(a)*force*.7;b.vy=force*(1+Math.random()*.6);b.wx=(Math.random()-.5)*20;b.wy=(Math.random()-.5)*20;b.rx=0;b.ry=0;b.s=.9+Math.random()*.5;b.t=0;b.life=1.6;}}
 function puff(x:number,y:number,z:number,n:number,size:number){for(let i=0;i<n;i++){const d=dd[dustI];dustI=(dustI+1)%DUST;const a=Math.random()*6.28;d.on=true;d.x=x+(Math.random()-.5)*size*.5;d.y=y+.1+Math.random()*.2;d.z=z+(Math.random()-.5)*size*.5;
  d.vx=Math.cos(a)*size*1.2;d.vz=Math.sin(a)*size*1.2;d.vy=.5+Math.random()*.8;d.s=size*(.11+Math.random()*.12);d.t=0;d.life=.45+Math.random()*.3;}}
 function star(x:number,y:number,z:number,s:number,color:string){const st=stars[starI];starI=(starI+1)%STARS;st.g.visible=true;st.g.position.set(x,y,z);st.t=0;st.life=.28;st.s=s;st.b.color.set(color);}
 function onEvent(e:BlastEvent){
  switch(e.type){
   case 'shot':kickT=0;kickNow=true;shotPower=Math.max(.35,Math.min(1,e.a/BB.powerShot));if(e.a>=BB.powerShot&&!o.reduced)push=1;break;
   case 'bounce':if(e.kind===0&&e.a>2.5)puff(e.x,0,e.z,e.a>5?4:2,.5);break;
   case 'hit':star(e.x,e.y,e.z,.75,'#fff3d6');shake=Math.max(shake,.06);spawnPieces(e.kind,e.x,e.y,e.z,4,2.2,1);break;
   case 'block':star(e.x,e.y,e.z,.65,'#8fd0e6');spawnPieces(5,e.x,e.y,e.z,2,1.6);break;
   case 'break':{const big=e.kind===K.boss,mach=e.kind<10;spawnPieces(e.kind,e.x,e.y,e.z,big?60:e.kind===K.board?22:mach?16:12,big?7:4.6,big?14:mach?4:0);
    star(e.x,e.y+.2,e.z,big?2.6:1.25,e.b?BB_COLORS.sun:mach?BB_COLORS.sun:'#fff3d6');puff(e.x,0,e.z,big?10:5,big?2.2:1);shake=Math.max(shake,big?.4:.14);hype=Math.max(hype,big?3:.8);if(big){camPull=1;cheerT=1;}break;}
   case 'boom':spawnPieces(K.barrel,e.x,.6,e.z,18,5.5);puff(e.x,0,e.z,9,2.4);star(e.x,1,e.z,1.9,'#8fd0e6');shake=Math.max(shake,.24);hype=Math.max(hype,1);break;
   case 'topple':if(e.a===1){puff(e.x,0,e.z,6,1.4);shake=Math.max(shake,.1);}break;
   case 'leak':shake=Math.max(shake,.3);stunT=1;puff(e.x,0,0,6,1.2);break;
   case 'trick':star(e.x,Math.max(1,e.y),e.z,1.5,BB_COLORS.red);hype=Math.max(hype,1.5);break;
  }
 }
 function reset(){for(const p of pc)p.on=false;for(const b of bt)b.on=false;for(const d of dd)d.on=false;for(const t of tr)t.on=false;for(const s of stars)s.g.visible=false;aim=null;shake=0;camPull=0;push=0;kickT=9;kickNow=false;stunT=cheerT=0;kicker.resetPose();if(tod!==0)setTod(0);}
 /** The thing under a screen point (aim assist: a generous sphere), else the pitch under it. */
 const ray=new T.Raycaster(),ndc=new T.Vector2(),plane=new T.Plane(new T.Vector3(0,1,0),0),hitP=new T.Vector3(),center=new T.Vector3();
 function pick(g:BallBlaster|null,sx:number,sy:number):AimPick{ndc.set(sx/W*2-1,-(sy/H)*2+1);ray.setFromCamera(ndc,camera);let best=Infinity,res:AimPick|null=null;
  if(g)for(const e of g.state.ents){if(!e.on)continue;const cy=e.y+e.h*.5;center.set(e.x,cy,e.z);const r=Math.max(e.r,e.h*.5)*1.25+.25;const d=ray.ray.distanceSqToPoint(center);if(d>r*r)continue;const t=center.distanceTo(ray.ray.origin);if(t<best){best=t;res={x:e.x,y:e.kind===K.boss?2.2:cy,z:e.z,lock:e.id};}}
  if(res)return res;if(!ray.ray.intersectPlane(plane,hitP))return {x:0,y:.5,z:-20,lock:0};return {x:hitP.x,y:.5,z:Math.max(BB.farZ+2,Math.min(-1.5,hitP.z)),lock:0};}
 function project(x:number,y:number,z:number){V.set(x,y,z).project(camera);return {x:(V.x+1)/2*W,y:(1-V.y)/2*H,on:V.z<1};}
 function render(g:BallBlaster,now:number,frozen=false){
  const s=g.state,rdt=Math.min(.05,lastT?now-lastT:1/60);lastT=now;const dt=frozen?0:rdt,slow=s.cine>0?.3:1,fdt=dt*slow;
  const want=s.wave>0?Math.floor((s.wave-1)/3)%3:0;if(want!==tod)setTod(want);
  // camera: a gentle shake, a push on a power shot, a slow pull toward a broken boss
  shake=o.reduced?0:Math.max(0,shake-rdt*1.6);camPull=Math.max(0,camPull-rdt*.5);push=Math.max(0,push-rdt*2.2);
  camera.position.copy(camBase);if(shake>0){camera.position.x+=(Math.sin(now*71)*.5+Math.sin(now*43)*.5)*shake*.35;camera.position.y+=Math.sin(now*57)*shake*.25;}
  if(push>0){const k=Math.sin(Math.min(1,push)*Math.PI)*.9;camera.position.z-=k;camera.position.y-=k*.25;}
  if(camPull>0&&!o.reduced)camera.position.lerp(SV.set(0,3.4,1.5),Math.sin(camPull*Math.PI)*.4);
  const fov=baseFov-(push>0?Math.sin(push*Math.PI)*2.5:0);if(Math.abs(camera.fov-fov)>.01){camera.fov=fov;camera.updateProjectionMatrix();}
  camera.lookAt(look);aimComicSun(ink,toSun,camera);
  // crowd: a two-frame bob, faster after a big break
  hype=Math.max(0,hype-rdt);crowdT0+=rdt*(hype>0?9:2.2);crowdT.offset.y=(Math.floor(crowdT0)%2)*.5;
  // eyes look at the nearest ball in flight, else at the kicker
  let lookX=bean.position.x,lookY=1.2,lookZ=bean.position.z;for(const b of s.balls)if(b.on&&b.z<lookZ-1){lookX=b.x;lookY=b.y;lookZ=b.z;break;}
  // machines and props
  const counts=new Map<number,number>();for(const k of kinds)counts.set(k,0);let bossOn=false,en=0,kn=0,rn=0,bn2=0;
  for(const e of s.ents){if(!e.on)continue;
   const f=e.flash>0?Math.min(1,e.flash/.18):0;
   if(e.kind===K.boss){bossOn=true;boss.visible=true;const w=Math.sin(e.t*3.2);boss.position.set(e.x,Math.abs(w)*.1,e.z);boss.rotation.set(-f*.25,0,w*.06);const sc=1.15;boss.scale.set(sc*(1+f*.25),sc*(1-f*.18),sc*(1+f*.25));
    const ud=boss.userData as {arms:T.Mesh[];key:T.Mesh;body:T.Mesh;geos:T.BufferGeometry[];core:T.Mesh;coreM:T.MeshBasicMaterial;ph:number};ud.arms[0].rotation.x=w*.6;ud.arms[1].rotation.x=-w*.6;ud.arms[0].rotation.z=e.phase===2?-.6:0;ud.arms[1].rotation.z=e.phase===2?.6:0;
    // armour plates clatter off as the phases turn (the next baked body, inked grey chunks, a star and a shake)
    if(e.phase!==ud.ph){if(e.phase>ud.ph){const up=e.phase===1?3.4:4.6;spawnPieces(K.armour,e.x,up,e.z+.4,e.phase===1?14:18,4.2,3);star(e.x,up,e.z+.6,1,'#fff3d6');shake=Math.max(shake,.22);}ud.ph=e.phase;ud.body.geometry=ud.geos[Math.min(2,e.phase)];}
    // the weak spot: a chest dial that pulses (faster and redder each phase) and flashes white when hit
    const pulse=.5+.5*Math.sin(now*(4+e.phase*4));ud.coreM.color.set(e.phase===2?'#ff4a2a':'#ffb21f').lerp(C2.setRGB(1,1,.92),pulse*.4);if(f>0)ud.coreM.color.setRGB(1,1,1);ud.core.scale.setScalar(1+pulse*.12+e.phase*.12+f*.4);
    boss.updateMatrixWorld();const pop=1+f*.9;
    for(const sgn of [-1,1])if(en<EYES){V.set(sgn*BOSS_EYE.g,BOSS_EYE.y,BOSS_EYE.z).applyMatrix4(boss.matrixWorld);M2.lookAt(V,V2.set(lookX,lookY,lookZ),T.Object3D.DEFAULT_UP);Q2.setFromRotationMatrix(M2);Q2.multiply(Q.setFromAxisAngle(T.Object3D.DEFAULT_UP,Math.PI));const r=BOSS_EYE.s*sc*pop;M2.compose(V,Q2,SV.set(r,r,r));eyes.setMatrixAt(en++,M2);}
    ud.key.rotation.z+=dt*(e.phase===2?9:4);continue;}
   const m=inst.get(e.kind);if(!m)continue;const i=counts.get(e.kind)!;if(i>=m.instanceMatrix.count)continue;counts.set(e.kind,i+1);
   const walk=isMachine(e.kind),ph=e.t*9+e.ph,sc=(walk?MSCALE:PSCALE);
   let sy=1,y=e.y,rx=0,rz=0,ry=0;
   if(walk&&e.kind!==K.drone&&e.kind!==K.dummy){y+=Math.abs(Math.sin(ph))*.07;rz=Math.sin(ph)*.09;}
   if(e.kind===K.cone){y+=Math.abs(Math.sin(ph*1.3))*.08;sy=1-Math.abs(Math.cos(ph*1.3))*.08;}
   if(e.kind===K.dummy){const land=1-Math.min(1,e.y/.25);sy=1-land*.22;}
   if(e.kind===K.drone){rx=Math.sin(e.t*2)*.15;ry=e.t*.6;}
   if(e.kind===K.dodger)rz=Math.sin(ph*.5)*.16;
   rx-=f*.3;const sx=sc*(1+f*.3),syy=sc*sy*(1-f*.2);
   E.set(rx,ry,rz);Q.setFromEuler(E);M.compose(V.set(e.x,y,e.z),Q,SV.set(sx,syy,sx));m.setMatrixAt(i,M);
   C1.setRGB(1,1,1);if(e.gold)C1.setRGB(1.25,1.02,.35);if(e.kind===K.armour&&e.hp<e.max)C1.multiplyScalar(.72);if(f>0)C1.lerp(C2.setRGB(2.2,2.2,2.2),Math.min(1,f*1.2));m.setColorAt(i,C1);
   if(bn2<48){M2.compose(V.set(e.x,.02,e.z),Q2.identity(),SV.set(e.r*sc*1.05,1,e.r*sc*.85*(e.kind===K.drone?.8:1)));blobs.setMatrixAt(bn2++,M2);}
   const ey=EYE[e.kind];
   if(ey&&en+2<=EYES){const blink=((e.t+e.ph)%3.7)<.12?.15:1,pop=1+f*.9;for(const sgn of ey.one?[0]:[-1,1]){V.set(sgn*ey.g,ey.y,ey.z).applyMatrix4(M);
     M2.lookAt(V,V2.set(lookX,lookY,lookZ),T.Object3D.DEFAULT_UP);Q2.setFromRotationMatrix(M2);
     // lookAt points -z at the target; the pupil is on +z, so turn it round
     Q2.multiply(Q.setFromAxisAngle(T.Object3D.DEFAULT_UP,Math.PI));const r=ey.s*sc*pop;M2.compose(V,Q2,SV.set(r,r*blink,r));eyes.setMatrixAt(en++,M2);}
    E.set(rx,ry,rz);Q.setFromEuler(E);}
   const kk=KEY[e.kind];
   if(kk&&kn<KEYS){V.set(0,kk.y,kk.z).applyMatrix4(M);Q2.copy(Q).multiply(Q.setFromAxisAngle(XV,.35)).multiply(Q.setFromAxisAngle(ZV,e.t*3.5+e.ph));
    M2.compose(V,Q2,SV.setScalar(kk.s*sc));keys.setMatrixAt(kn++,M2);E.set(rx,ry,rz);Q.setFromEuler(E);}
   if(e.kind===K.drone&&rn+4<=ROTORS)for(const [lx,lz] of [[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]]){V.set(lx,.4,lz).applyMatrix4(M);Q2.copy(Q).multiply(Q.setFromAxisAngle(T.Object3D.DEFAULT_UP,now*40+lx*3));M2.compose(V,Q2,SV.setScalar(sc));rotors.setMatrixAt(rn++,M2);E.set(rx,ry,rz);Q.setFromEuler(E);}
  }
  // between waves the near pitch is quiet, so the next wave lines up at the far end, marching on the spot as dark silhouettes
  // (the new kind steps out in full colour and hops); it reuses the machines' instanced meshes, so it adds no draw of its own
  const lull=(s.mode==='break'||s.mode==='intro')&&!s.over,lullK=lull?Math.min(1,(s.mode==='break'?2.6:1.2)-s.modeT):0;
  if(lull){const nw=s.wave+1,list=UNLOCK.filter(u=>u.wave<=nw),fresh=list.find(u=>u.wave===nw)?.k??0,n=Math.min(7,3+(nw>>1)),z=-46+lullK*2,w=halfW(z)-1.2;
   for(let j=0;j<n;j++){const kd=fresh&&j===(n>>1)?fresh:list[(j*3+nw)%list.length].k,m=inst.get(kd);if(!m)continue;const i=counts.get(kd)!;if(i>=m.instanceMatrix.count)continue;counts.set(kd,i+1);
    const ph=now*7+j*1.3,hop=kd===fresh?Math.abs(Math.sin(now*5))*.35:Math.abs(Math.sin(ph))*.06,x=n>1?-w+2*w*j/(n-1):0;
    M.compose(V.set(x,(kd===K.drone?2.1:0)+hop,z+(kd===fresh?1.2:0)),Q.setFromEuler(E.set(0,0,Math.sin(ph)*.08)),SV.setScalar(MSCALE*Math.min(1,lullK*1.6)));m.setMatrixAt(i,M);
    m.setColorAt(i,kd===fresh?C1.setRGB(1.1,1.1,1.1):C1.setRGB(.24,.22,.32));}}
  for(const k of kinds){const m=inst.get(k)!;m.count=counts.get(k)!;m.visible=m.count>0;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}
  blobs.count=bn2;blobs.visible=bn2>0;blobs.instanceMatrix.needsUpdate=true;eyes.count=en;eyes.visible=en>0;eyes.instanceMatrix.needsUpdate=true;keys.count=kn;keys.visible=kn>0;keys.instanceMatrix.needsUpdate=true;rotors.count=rn;rotors.visible=rn>0;rotors.instanceMatrix.needsUpdate=true;
  if(!bossOn&&boss.visible)boss.visible=false;bossShown=bossOn;
  // balls: spin with their speed, stretch along it, a comic speed trail (fire burns, giant glows gold)
  let bn=0;for(let i=0;i<s.balls.length;i++){const b=s.balls[i];if(!b.on)continue;const q=spin[i%64],sp=Math.hypot(b.vx,b.vz);if(sp>.1){Q.setFromAxisAngle(V.set(-b.vz/sp,0,b.vx/sp),sp*fdt/b.r);q.premultiply(Q);}
   const v3=Math.hypot(b.vx,b.vy,b.vz),st=o.reduced?1:1+Math.min(.32,v3/38*.32);
   if(st>1.01){V2.set(b.vx/v3,b.vy/v3,b.vz/v3);Q2.setFromUnitVectors(ZV,V2);M.makeRotationFromQuaternion(Q2);M2.makeScale(1/Math.sqrt(st),1/Math.sqrt(st),st);M.multiply(M2);M2.makeRotationFromQuaternion(Q2.invert());M.multiply(M2);M2.makeRotationFromQuaternion(q);M.multiply(M2);
    M2.makeScale(b.r,b.r,b.r);M.multiply(M2);M.setPosition(b.x,b.y,b.z);}else M.compose(V.set(b.x,b.y,b.z),q,SV.setScalar(b.r));
   balls.setMatrixAt(bn,M);balls.setColorAt(bn,b.fire?C1.set('#ff9a4a'):b.r>BB.ballR?C1.set('#ffe9a0'):C1.setRGB(1,1,1));bn++;
   if(!o.reduced&&sp>7&&dt>0){const n=b.fire?2:1;for(let k=0;k<n;k++){const t=tr[trI];trI=(trI+1)%TRAIL;t.on=true;t.x=b.x-b.vx*.012*k+(b.fire?(Math.random()-.5)*.2:0);t.y=b.y+(b.fire?Math.random()*.15:0);t.z=b.z-b.vz*.012*k;
    const l=v3||1;t.dx=b.vx/l;t.dy=b.vy/l;t.dz=b.vz/l;t.t=0;t.s=b.r*(b.fire?.95:b.r>BB.ballR?.6:.5);t.c=b.fire?(k?2:1):b.r>BB.ballR?3:0;}}}
  // stray balls roll back to the rack between waves (cosmetic; the rules' rack refills on its own clock)
  if(lull&&s.wave>0&&!o.reduced)for(let j=0;j<3&&bn<balls.instanceMatrix.count;j++){const t=Math.min(1,Math.max(0,lullK*1.25-j*.18)),e2=1-(1-t)*(1-t),sx=[-6.5,5.5,-2.5][j],sz=[-24,-18,-30][j];
   const x=sx+(BB.kx+.7-sx)*e2,z=sz+(BB.kz-.2-sz)*e2,d=Math.hypot(BB.kx+.7-sx,BB.kz-.2-sz)*e2;if(t>=1)continue;
   M.compose(V.set(x,BB.ballR,z),Q.setFromAxisAngle(XV,d/BB.ballR),SV.setScalar(BB.ballR));balls.setMatrixAt(bn,M);balls.setColorAt(bn,C1.setRGB(1,1,1));bn++;}
  balls.count=bn;balls.visible=bn>0;balls.instanceMatrix.needsUpdate=true;if(balls.instanceColor)balls.instanceColor.needsUpdate=true;
  ready.visible=s.rack>0&&kickT>.18&&!s.over;
  // the kick: while aiming the boot draws back (the rig's held shot, deeper with power); the shot frame starts the rig's strike at
  // its contact phase (the ball leaves now), then the follow-through settles into the ready stance. A new shot restarts it cleanly.
  kickT+=dt;stunT=Math.max(0,stunT-dt*1.6);cheerT=Math.max(0,cheerT-dt*.7);
  {const held=!!aim&&!s.over&&s.rack>0&&!kickNow,tx=aim?aim.x:BB.kx,tz=aim?Math.min(aim.z,BB.kz-4):-20,bx=bean.position.x,bz=bean.position.z;
   const f=Math.atan2(tx-bx,tz-bz),wx=BB.kx-bx,wz=BB.kz-bz,c=Math.cos(f),sn=Math.sin(f);
   kickPose.charge=held?.25+aim!.power*.75:0;kickPose.shotPower=held?aim!.power:shotPower;kickPose.strikeX=(wx*c-wz*sn)/BEAN_S;kickPose.strikeZ=(wx*sn+wz*c)/BEAN_S;
   kickPose.anticipate=s.over?0:.35;kickPose.stun=stunT;kickPose.celebrate=cheerT*.8;
   kicker.pose(dt,0,f,kickNow?1:0,0,0,kickPose);kickNow=false;}
  // chunks, springs and bolts, dust, trail, stars
  // live particles are packed into the low instances, so a pool costs only what is alive
  let pn=0;for(let i=0;i<PIECES;i++){const p=pc[i];if(!p.on)continue;p.t+=fdt;if(p.t>p.life){p.on=false;continue;}
   p.vy-=14*fdt;p.x+=p.vx*fdt;p.y+=p.vy*fdt;p.z+=p.vz*fdt;if(p.y<.08){p.y=.08;p.vy=-p.vy*.38;p.vx*=.6;p.vz*=.6;p.wx*=.6;p.wy*=.6;}p.rx+=p.wx*fdt;p.ry+=p.wy*fdt;
   const k=p.t>p.life-.3?(p.life-p.t)/.3:1;E.set(p.rx,p.ry,0);Q.setFromEuler(E);M.compose(V.set(p.x,p.y,p.z),Q,SV.setScalar(p.s*k));pieces.setMatrixAt(pn,M);pieces.setColorAt(pn,p.c);pn++;}
  pieces.count=pn;pieces.visible=pn>0;pieces.instanceMatrix.needsUpdate=true;if(pieces.instanceColor)pieces.instanceColor.needsUpdate=true;
  let bm=0;for(let i=0;i<BITS;i++){const p=bt[i];if(!p.on)continue;p.t+=fdt;if(p.t>p.life){p.on=false;continue;}
   p.vy-=14*fdt;p.x+=p.vx*fdt;p.y+=p.vy*fdt;p.z+=p.vz*fdt;if(p.y<.06){p.y=.06;p.vy=-p.vy*.55;p.vx*=.7;p.vz*=.7;}p.rx+=p.wx*fdt;p.ry+=p.wy*fdt;
   const k=p.t>p.life-.3?(p.life-p.t)/.3:1;E.set(p.rx,p.ry,0);Q.setFromEuler(E);M.compose(V.set(p.x,p.y,p.z),Q,SV.setScalar(p.s*k));bits.setMatrixAt(bm++,M);}
  bits.count=bm;bits.visible=bm>0;bits.instanceMatrix.needsUpdate=true;
  let dm=0;for(let i=0;i<DUST;i++){const d=dd[i];if(!d.on)continue;d.t+=fdt;if(d.t>d.life){d.on=false;continue;}const k=d.t/d.life;d.y+=d.vy*fdt;d.x+=d.vx*fdt*(1-k);d.z+=d.vz*fdt*(1-k);
   M.compose(V.set(d.x,d.y,d.z),Q.identity(),SV.setScalar(d.s*(.7+k*.9)*(1-k*k)));dust.setMatrixAt(dm++,M);}
  dust.count=dm;dust.visible=dm>0;dust.instanceMatrix.needsUpdate=true;
  let tm=0;for(let i=0;i<TRAIL;i++){const t=tr[i];if(!t.on)continue;t.t+=dt;if(t.t>.22){t.on=false;continue;}const k=(1-t.t/.22)*(night?1.35:1);
   Q.setFromUnitVectors(ZV,V2.set(t.dx,t.dy,t.dz));M.compose(V.set(t.x,t.y,t.z),Q,SV.set(t.s*k,t.s*k,t.s*k*(t.c===1||t.c===2?1.6:2.6)));trail.setMatrixAt(tm,M);trail.setColorAt(tm,TRAIL_C[t.c]);tm++;}
  trail.count=tm;trail.visible=tm>0;trail.instanceMatrix.needsUpdate=true;if(trail.instanceColor)trail.instanceColor.needsUpdate=true;
  for(const st of stars){if(!st.g.visible)continue;st.t+=rdt;if(st.t>st.life){st.g.visible=false;continue;}const k=st.t/st.life,near=Math.min(1,st.g.position.distanceTo(camera.position)/16);st.g.quaternion.copy(camera.quaternion);st.g.scale.setScalar(st.s*near*(k<.3?.5+k/.3*.7:1.2-(k-.3)*.4));st.g.rotation.z+=rdt*2;}
  // the aim
  if(aim&&!s.over){ring.visible=true;ring.position.set(aim.x,.03,aim.z);const pulse=1+Math.sin(now*12)*.06*(aim.power);ring.scale.setScalar((aim.lock?1.15:1)*pulse*(1+aim.z/-60));
   ringM.color.set(aim.power>=.9?BB_COLORS.red:BB_COLORS.sun);
   const n=g.predict(aim.x,aim.y,aim.z,aim.power,aim.curl,arc,DOTS);for(let i=0;i<n;i++){M.compose(V.set(arc[i*3],arc[i*3+1],arc[i*3+2]),Q.identity(),SV.setScalar(.06+.03*(1-i/n)));dots.setMatrixAt(i,M);dots.setColorAt(i,aim.power>=.9?C1.set('#ffb4a0'):C1.set('#fff3d6'));}
   dots.count=n;dots.visible=n>0;dots.instanceMatrix.needsUpdate=true;if(dots.instanceColor)dots.instanceColor.needsUpdate=true;}else{ring.visible=false;dots.count=0;dots.visible=false;}
  renderer.render(scene,camera);
 }
 return {
  resize,render,onEvent,reset,pick,project,
  setAim(a:Aim){aim=a;},
  get bossShown(){return bossShown;},
  get info(){return renderer.info.render;},
  get canvas(){return canvas;},
  dispose(){const tex=new Set<T.Texture>(),addT=(v:unknown)=>{if((v as T.Texture|null)?.isTexture)tex.add(v as T.Texture);};
   // the rig's textures too (shared ones such as the bean face atlas hold this renderer otherwise; see arcadeStage dispose)
   bean.traverse(x=>{const m=(x as T.Mesh).material as T.Material|T.Material[]|undefined;for(const mm of m?(Array.isArray(m)?m:[m]):[])for(const v of Object.values(mm)){addT(v);if(v&&typeof v==='object'&&!(v as T.Texture).isTexture&&!Array.isArray(v))for(const u of Object.values(v as Record<string,unknown>))addT((u as {value?:unknown}|null)?.value);}});
   kicker.dispose();tex.forEach(t=>t.dispose());scene.traverse(obj=>{const m=obj as T.Mesh;if(m.geometry)m.geometry.dispose();const mat=m.material as T.Material|T.Material[]|undefined;if(Array.isArray(mat))mat.forEach(x=>x.dispose());else mat?.dispose();});
   for(const x of owned)x.dispose();for(const m of inst.values())m.dispose();eyes.dispose();keys.dispose();rotors.dispose();balls.dispose();pieces.dispose();bits.dispose();dust.dispose();trail.dispose();dots.dispose();blobs.dispose();for(const bg of (boss.userData as {geos:T.BufferGeometry[]}).geos)bg.dispose();
   renderer.dispose();renderer.forceContextLoss();canvas.remove();},
 };
}
