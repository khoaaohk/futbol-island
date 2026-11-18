/**
 * Ball Blaster drawing (Nov 17 2026, docs/arcade-aaa/ballblaster-direction.md): one three.js scene in the arcade's comic print style
 * (lib/arcade/comic: banded light, violet halftone shadows, ink hulls baked into the geometry). A training pitch in a small stadium:
 * mown stripes, advert boards that the balls bounce off, stands with a painted crowd, floodlights, a flat comic sky.
 * Everything that moves is instanced: one draw per machine / prop kind, one for the balls, one for the pieces, one for the dust,
 * one for the aim arc. Pieces, dust and stars are fixed pools. Procedural geometry and small canvas textures only (made once).
 * Heat (AGENTS.md): low-power context, pixel ratio 1.5 on phones (2 on desktop), ONE shadow-casting sun, no post-processing, the shell
 * draws only while playing. The view makes its own canvas (a fresh one per mount: React's dev double mount never meets a lost context)
 * and frees everything in dispose().
 */
import * as T from 'three';
import {createComicUniforms,comicDotCell,aimComicSun,comicMaterial,COMIC_INK,COMIC_PAPER} from '../comic/shading';
import {inkedPart,partAt,bakeParts,comicStarGeometry} from '../comic/ink';
import {BB,K,halfW,BOARD_OUT,isMachine,type BallBlaster,type BlastEvent} from './core';

export const BB_COLORS={sky:'#8fd4ee',grass:'#4fb85c',grassMown:'#5fc76a',line:'#fff3d6',sun:'#ffc83a',red:'#f0452e',teal:'#19b5a5',ink:COMIC_INK,paper:COMIC_PAPER};
const PIECES=220,DUST=48,DOTS=40,STARS=8,TRAIL=90;
const PIECE_TONES:Record<number,string[]>={1:['#e8e2d4','#f0452e','#cfd8dc','#5b6072'],2:['#ff8a3c','#fff3d6','#ff8a3c'],3:['#ffc83a','#e0603a','#ffc83a'],4:['#19b5a5','#231a2e','#cfd8dc'],
 5:['#3a7bd5','#e8e2d4','#19b5a5'],6:['#ff65c8','#fff3d6','#ff65c8'],7:['#8d93a6','#ffc83a','#5b6072'],8:['#f0452e','#fff3d6','#ffd9a8','#f0452e'],
 10:['#c98a4b','#8a5a2e','#e0a865'],11:['#bfe9f5','#ffffff','#8fd0e6'],12:['#ff8a3c','#fff3d6'],13:['#2d2a33','#ffc83a','#2d2a33'],14:['#2f8fd8','#ffffff','#8fd0e6','#bfe9f5'],15:['#2d2a33','#ffc83a','#e8e2d4']};
const CAP:Record<number,number>={1:18,2:18,3:12,4:10,5:10,6:10,7:10,10:10,11:6,12:6,13:6,14:12,15:4};

/* ---- canvas textures (made once) ---- */
function canvasTex(w:number,h:number,paint:(g:CanvasRenderingContext2D)=>void){const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d')!);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
/** The pitch, 30 m x 64 m (x -15..15, z 6..-58), 16 px a metre: mown bands, our penalty box, the halfway line far away. */
function pitchTex(){const S=16;return canvasTex(30*S,64*S,g=>{const X=(x:number)=>(x+15)*S,Z=(z:number)=>(6-z)*S;
 for(let i=0;i<16;i++){g.fillStyle=i%2?BB_COLORS.grass:BB_COLORS.grassMown;g.fillRect(0,i*4*S,30*S,4*S);}
 g.strokeStyle=BB_COLORS.line;g.lineWidth=.14*S;g.lineCap='round';
 const line=(x0:number,z0:number,x1:number,z1:number)=>{g.beginPath();g.moveTo(X(x0),Z(z0));g.lineTo(X(x1),Z(z1));g.stroke();};
 line(-15,0,15,0);line(-9.16,0,-9.16,-5.5);line(9.16,0,9.16,-5.5);line(-9.16,-5.5,9.16,-5.5);// six-yard box... scaled to the pitch
 line(-13,0,-13,-16.5);line(13,0,13,-16.5);line(-13,-16.5,13,-16.5);
 g.beginPath();g.arc(X(0),Z(-11),.25*S,0,7);g.fillStyle=BB_COLORS.line;g.fill();
 g.beginPath();g.arc(X(0),Z(-11),9.15*S,Math.PI*.2,Math.PI*.8);g.stroke();
 line(-15,-52,15,-52);g.beginPath();g.arc(X(0),Z(-52),9.15*S,Math.PI,Math.PI*2);g.stroke();
 // printed grain: tiny ink flecks
 let r=7;const rnd=()=>{r=(r*16807)%2147483647;return r/2147483647;};g.fillStyle='rgba(35,26,46,.07)';for(let i=0;i<2600;i++)g.fillRect(rnd()*30*S,rnd()*64*S,2,2);});}
function boardTex(){return canvasTex(1024,64,g=>{const words=['FUTBOL ISLAND','PICK YOUR TARGET','STRIKE THROUGH THE BALL','BALL BLASTER'],cols=[BB_COLORS.red,BB_COLORS.teal,BB_COLORS.sun,'#2f8fd8'];
 let x=0,i=0;g.font='900 38px system-ui,sans-serif';g.textBaseline='middle';while(x<1024){const w=g.measureText(words[i%4]).width+60;g.fillStyle=cols[i%4];g.fillRect(x,0,w,64);g.fillStyle=i%4===2?COMIC_INK:COMIC_PAPER;g.fillText(words[i%4],x+30,34);g.fillStyle=COMIC_INK;g.fillRect(x+w-3,0,3,64);x+=w;i++;}
 g.fillStyle=COMIC_INK;g.fillRect(0,0,1024,4);g.fillRect(0,60,1024,4);});}
function crowdTex(){return canvasTex(512,128,g=>{g.fillStyle='#3a3350';g.fillRect(0,0,512,128);let r=11;const rnd=()=>{r=(r*16807)%2147483647;return r/2147483647;};
 const shirts=[BB_COLORS.red,BB_COLORS.teal,BB_COLORS.sun,'#fff3d6','#2f8fd8','#ff8a3c','#ff65c8'],skin=['#ffd9a8','#e8b07a','#b9774a','#8a5530'];
 for(let row=0;row<6;row++)for(let i=0;i<34;i++){const x=i*15+(row%2)*7+rnd()*3,y=12+row*20;g.fillStyle=shirts[Math.floor(rnd()*shirts.length)];g.fillRect(x-6,y+3,12,10);
  g.beginPath();g.arc(x,y,5,0,7);g.fillStyle=skin[Math.floor(rnd()*skin.length)];g.fill();g.lineWidth=1.5;g.strokeStyle=COMIC_INK;g.stroke();
  if(rnd()<.18){g.fillStyle=shirts[Math.floor(rnd()*shirts.length)];g.fillRect(x-1,y-14,2,10);g.fillRect(x-6,y-16,12,6);}}});}
function skyTex(){return canvasTex(1024,256,g=>{g.fillStyle=BB_COLORS.sky;g.fillRect(0,0,1024,256);g.fillStyle='#a6dff2';g.fillRect(0,150,1024,106);
 g.beginPath();g.arc(800,70,34,0,7);g.fillStyle='#fff1b0';g.fill();g.lineWidth=4;g.strokeStyle=COMIC_INK;g.stroke();
 const cloud=(x:number,y:number,s:number)=>{g.beginPath();for(const [dx,dy,r] of [[0,0,22],[24,-10,26],[52,0,20],[26,8,22]])g.arc(x+dx*s,y+dy*s,r*s,0,7);g.fillStyle=COMIC_PAPER;g.fill();g.lineWidth=3.5;g.strokeStyle=COMIC_INK;g.stroke();g.fillStyle=COMIC_PAPER;for(const [dx,dy,r] of [[0,0,20],[24,-10,24],[52,0,18],[26,8,20]]){g.beginPath();g.arc(x+dx*s,y+dy*s,r*s,0,7);g.fill();}};
 cloud(90,80,1.1);cloud(380,52,.8);cloud(600,110,1);cloud(930,150,.7);});}
/** A football: cream with ink pentagons, wrapped on a sphere. */
function ballTex(){return canvasTex(256,128,g=>{g.fillStyle='#fffaf0';g.fillRect(0,0,256,128);g.fillStyle=COMIC_INK;
 const pent=(cx:number,cy:number,r:number)=>{g.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}g.closePath();g.fill();};
 for(let i=0;i<4;i++){pent(32+i*64,40,15);pent(i*64,92,15);}pent(256,92,15);g.fillRect(0,0,256,7);g.fillRect(0,121,256,7);});}

/* ---- inked props, built once ---- */
type Parts=T.BufferGeometry[];
const box=(w:number,h:number,d:number)=>new T.BoxGeometry(w,h,d),cyl=(a:number,b:number,h:number,s=10)=>new T.CylinderGeometry(a,b,h,s),sph=(r:number,s=10)=>new T.SphereGeometry(r,s,Math.max(6,s*.7|0));
function P(o:Parts,g:T.BufferGeometry,c:string,x:number,y:number,z:number,ry=0,rz=0,ink=.035,round=false){inkedPart(o,g,c,partAt(x,y,z,ry,rz),ink,round);}
function build(kind:number):T.BufferGeometry{const o:Parts=[];const W='#e8e2d4',S='#cfd8dc',D='#5b6072',I=COMIC_INK,Y=BB_COLORS.sun,R=BB_COLORS.red;
 const legs=(c:string,h=.42)=>{P(o,box(.17,h,.17),c,-.16,h/2,0);P(o,box(.17,h,.17),c,.16,h/2,0);P(o,box(.24,.08,.3),I,-.16,.04,.05,0,0,.02);P(o,box(.24,.08,.3),I,.16,.04,.05,0,0,.02);};
 const head=(y:number,c:string,eye=Y)=>{P(o,box(.5,.36,.42),c,0,y,0);P(o,box(.4,.13,.05),I,0,y+.02,.22,0,0,.015);P(o,sph(.05,8),eye,-.09,y+.02,.25,0,0,0,true);P(o,sph(.05,8),eye,.09,y+.02,.25,0,0,0,true);
  P(o,cyl(.016,.016,.2,6),I,0,y+.28,0,0,0,.012);P(o,sph(.055,8),R,0,y+.4,0,0,0,.02,true);};
 const key=(y:number)=>{P(o,box(.05,.05,.22),Y,0,y,-.34,0,0,.015);P(o,box(.3,.14,.04),Y,0,y,-.46,0,0,.02);};
 switch(kind){
  case K.robot:legs(D);P(o,box(.72,.62,.5),W,0,.74,0);P(o,box(.44,.3,.06),R,0,.78,.27,0,0,.02);P(o,box(.12,.34,.12),S,-.46,.74,0,0,.25);P(o,box(.12,.34,.12),S,.46,.74,0,0,-.25);head(1.27,S);key(.8);break;
  case K.cone:P(o,cyl(.06,.4,.82,12),'#ff8a3c',0,.47,0,0,0,.04,true);P(o,cyl(.17,.25,.16,12),COMIC_PAPER,0,.52,0,0,0,0,true);P(o,box(.84,.08,.84),'#ff8a3c',0,.05,0);
   P(o,sph(.1,8),COMIC_PAPER,-.1,.62,.2,0,0,.02,true);P(o,sph(.1,8),COMIC_PAPER,.1,.62,.2,0,0,.02,true);P(o,sph(.045,6),I,-.09,.62,.29,0,0,0,true);P(o,sph(.045,6),I,.11,.62,.29,0,0,0,true);break;
  case K.dummy:P(o,cyl(.1,.1,.3,8),D,0,.15,0,0,0,.02,true);P(o,cyl(.3,.36,.9,12),Y,0,.75,0,0,0,.04,true);P(o,box(1.05,.14,.14),Y,0,1.05,0);P(o,cyl(.31,.31,.12,12),R,0,.62,0,0,0,0,true);
   P(o,sph(.24,12),'#ffe3a0',0,1.42,0,0,0,.04,true);P(o,box(.2,.05,.04),I,0,1.42,.23,0,0,.01);break;
  case K.drone:P(o,box(.5,.18,.5),BB_COLORS.teal,0,.25,0);for(const [x,z] of [[-.38,-.38],[.38,-.38],[-.38,.38],[.38,.38]]){P(o,box(.32,.05,.06),I,x*.6,.3,z*.6,Math.atan2(z,x),0,.01);P(o,cyl(.2,.2,.04,12),S,x,.36,z,0,0,.02,true);}
   P(o,sph(.12,10),I,0,.2,.27,0,0,.02,true);P(o,sph(.06,8),'#8fd0e6',0,.2,.36,0,0,0,true);P(o,box(.06,.14,.06),R,0,.03,0,0,0,.01);break;
  case K.shield:legs(D);P(o,box(.72,.62,.5),BB_COLORS.teal,0,.74,0);head(1.27,S,'#ff8a3c');P(o,box(1.2,1.25,.12),'#3a7bd5',0,.86,.5);P(o,box(.8,.18,.04),COMIC_PAPER,0,.86,.58,0,0,0);P(o,box(.18,.8,.04),COMIC_PAPER,0,.86,.58,0,0,0);break;
  case K.dodger:P(o,cyl(.05,.05,.5,6),I,-.13,.25,0,0,0,.015);P(o,cyl(.05,.05,.5,6),I,.13,.25,0,0,0,.015);P(o,cyl(.13,.13,.08,8),D,-.13,.04,0,0,0,.02,true);P(o,cyl(.13,.13,.08,8),D,.13,.04,0,0,0,.02,true);
   P(o,box(.56,.5,.42),'#ff65c8',0,.76,0);P(o,box(.3,.1,.05),COMIC_PAPER,0,.8,.22,0,0,.01);head(1.22,'#ffd0ec');break;
  case K.armour:legs(D,.46);P(o,box(.9,.74,.62),'#8d93a6',0,.84,0);for(const x of [-.3,0,.3])P(o,box(.12,.62,.04),Y,x,.84,.32,0,0,.01);P(o,box(1.06,.22,.7),D,0,1.16,0);head(1.48,'#a9afc0',R);key(.86);break;
  case K.crate:P(o,box(.9,.86,.9),'#c98a4b',0,.43,0);for(const s of [-1,1]){P(o,box(.92,.1,.06),'#8a5a2e',0,.43+s*.3,.45,0,0,0);P(o,box(.06,.86,.92),'#8a5a2e',.45*s,.43,0,0,0,0);}P(o,box(.1,.9,.04),'#8a5a2e',0,.43,.46,0,.78,0);break;
  case K.glass:P(o,box(1.3,.1,.12),'#c98a4b',0,.05,0);P(o,box(1.3,.1,.12),'#c98a4b',0,1.55,0);P(o,box(.1,1.6,.12),'#c98a4b',-.62,.8,0);P(o,box(.1,1.6,.12),'#c98a4b',.62,.8,0);
   P(o,box(1.16,1.42,.05),'#bfe9f5',0,.8,0,0,0,0);P(o,box(.08,.9,.06),'#ffffff',-.2,.95,0,0,.6,0);P(o,box(.05,.5,.06),'#ffffff',.1,.7,0,0,.6,0);break;
  case K.tower:for(let i=0;i<3;i++){const y=i*.66;P(o,cyl(.07,.36,.66,12),'#ff8a3c',0,y+.36,0,0,0,.035,true);P(o,cyl(.17,.24,.12,12),COMIC_PAPER,0,y+.4,0,0,0,0,true);}P(o,box(.8,.06,.8),'#ff8a3c',0,.03,0);break;
  case K.tyres:for(let i=0;i<3;i++){P(o,cyl(.52,.52,.32,14),'#2d2a33',0,.18+i*.34,0,0,0,.035,true);P(o,cyl(.3,.3,.33,12),Y,0,.18+i*.34,0,0,0,0,true);}break;
  case K.barrel:P(o,cyl(.42,.42,.96,14),'#2f8fd8',0,.48,0,0,0,.04,true);for(const y of [.18,.78])P(o,cyl(.43,.43,.07,14),COMIC_PAPER,0,y,0,0,0,0,true);
   P(o,sph(.12,8),COMIC_PAPER,0,.5,.4,0,0,.02,true);P(o,cyl(.1,.12,.08,8),I,0,1,0,0,0,0,true);break;
  case K.board:P(o,box(.14,1.2,.14),D,-.75,.6,0);P(o,box(.14,1.2,.14),D,.75,.6,0);P(o,box(1.9,1.2,.3),'#2d2a33',0,1.75,0);
   for(const [x,w,h,yy] of [[-.45,.4,.08,2.1],[-.45,.4,.08,1.4],[-.65,.08,.6,1.75],[-.25,.08,.6,1.75],[.45,.4,.08,2.1],[.45,.4,.08,1.75],[.45,.4,.08,1.4],[.65,.08,.7,1.75]])P(o,box(w,h,.04),Y,x,yy,.16,0,0,0);break;
  default:P(o,box(.5,.5,.5),W,0,.25,0);
 }
 return bakeParts(o);}
/** Mega Mannequin: the boss, split so its arms swing. Red and white training kit, a big round head with painted eyebrows. */
function buildBoss(mat:T.Material){const g=new T.Group(),body:Parts=[],arm:Parts=[];const R=BB_COLORS.red,W='#fff3d6',I=COMIC_INK;
 P(body,box(.42,1.2,.42),'#5b6072',-.36,.6,0);P(body,box(.42,1.2,.42),'#5b6072',.36,.6,0);P(body,box(1.5,1.3,.9),R,0,1.85,0,0,0,.05);P(body,box(1.52,.3,.92),W,0,1.55,0,0,0,0);
 P(body,box(.5,.5,.05),W,0,2.05,.46,0,0,.02);P(body,box(.3,.06,.06),R,0,2.15,.5,0,0,0);
 P(body,sph(.62,14),'#ffd9a8',0,2.95,0,0,0,.05,true);P(body,box(.26,.07,.05),I,-.2,3.12,.58,0,.25,0);P(body,box(.26,.07,.05),I,.2,3.12,.58,0,-.25,0);
 P(body,sph(.08,8),I,-.2,2.98,.58,0,0,0,true);P(body,sph(.08,8),I,.2,2.98,.58,0,0,0,true);P(body,box(.36,.08,.05),I,0,2.72,.6,0,0,0);
 P(arm,box(.36,1.2,.36),R,0,-.5,0,0,0,.04);P(arm,sph(.24,10),'#ffd9a8',0,-1.15,0,0,0,.03,true);
 const b=new T.Mesh(bakeParts(body),mat);b.castShadow=true;g.add(b);const armG=bakeParts(arm),L=new T.Mesh(armG,mat),Rr=new T.Mesh(armG,mat);L.position.set(-.95,2.35,0);Rr.position.set(.95,2.35,0);L.castShadow=Rr.castShadow=true;g.add(L,Rr);
 g.userData.arms=[L,Rr];g.visible=false;return g;}

export type BallblasterView=ReturnType<typeof createBallblasterView>;
export type AimPick={x:number;y:number;z:number;lock:number};
export function createBallblasterView(host:HTMLElement,o:{reduced:boolean;mobile:boolean}){
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');canvas.dataset.ballblasterCanvas='';canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';host.prepend(canvas);
 const renderer=new T.WebGLRenderer({canvas,antialias:!o.mobile,powerPreference:'low-power',alpha:false});
 renderer.toneMapping=T.NoToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene();scene.background=new T.Color(BB_COLORS.sky);scene.fog=new T.Fog('#bfe6f2',48,110);
 const camera=new T.PerspectiveCamera(50,.5,.1,200);const camBase=new T.Vector3(0,4.6,6.6),look=new T.Vector3(0,0,-15);
 const ink=createComicUniforms({});
 const hemi=new T.HemisphereLight('#ffffff','#a79bb5',.55);scene.add(hemi);
 const sun=new T.DirectionalLight('#ffffff',2.6),toSun=new T.Vector3(-.55,.62,.56).normalize();sun.position.copy(toSun).multiplyScalar(40).add(new T.Vector3(0,0,-20));sun.target.position.set(0,0,-20);scene.add(sun,sun.target);
 sun.castShadow=true;const sc=sun.shadow.camera;sc.left=-26;sc.right=26;sc.top=36;sc.bottom=-36;sc.near=1;sc.far=110;sun.shadow.mapSize.set(o.mobile?1024:2048,o.mobile?1024:2048);sun.shadow.bias=-.0006;sun.shadow.normalBias=.03;
 const lit=(m:T.Material,rim=false)=>comicMaterial(m,{uniforms:ink,rim});
 const vmat=lit(new T.MeshLambertMaterial({vertexColors:true}));
 const owned:{dispose():void}[]=[vmat];const own=<X extends {dispose():void}>(x:X)=>{owned.push(x);return x;};

 /* ---- the ground and the stadium ---- */
 {const pt=own(pitchTex()),pm=own(lit(new T.MeshLambertMaterial({map:pt}))),pg=own(new T.PlaneGeometry(30,64));pg.rotateX(-Math.PI/2);const pitch=new T.Mesh(pg,pm);pitch.position.set(0,0,-26);pitch.receiveShadow=true;scene.add(pitch);
  const surround=own(new T.PlaneGeometry(140,140));surround.rotateX(-Math.PI/2);const sm=own(lit(new T.MeshLambertMaterial({color:'#3f9e4e'})));const s=new T.Mesh(surround,sm);s.position.set(0,-.02,-30);s.receiveShadow=true;scene.add(s);
  // advert boards on the slanted touchlines: the balls bounce off these
  const bt=own(boardTex());bt.wrapS=T.RepeatWrapping;bt.repeat.set(3.2,1);const bm=own(lit(new T.MeshLambertMaterial({map:bt}))),inkM=own(new T.MeshBasicMaterial({color:COMIC_INK}));
  const len=Math.hypot(52,52*.15),bg=own(new T.BoxGeometry(.22,.9,len)),tg=own(new T.BoxGeometry(.3,.08,len+.1));
  for(const s of [-1,1]){const zc=-25,xc=s*(halfW(zc)+BOARD_OUT+.11);const b=new T.Mesh(bg,bm);b.position.set(xc,.45,zc);b.rotation.y=-s*Math.atan(.15);b.castShadow=true;scene.add(b);const t=new T.Mesh(tg,inkM);t.position.set(xc,.92,zc);t.rotation.y=b.rotation.y;scene.add(t);}
  // the far stand, the side stands, the roof and floodlights
  const ct=own(crowdTex());ct.wrapS=T.RepeatWrapping;ct.repeat.set(3.5,1);const cm=own(lit(new T.MeshLambertMaterial({map:ct}))),steel=own(lit(new T.MeshLambertMaterial({color:'#5b6072'}))),roof=own(lit(new T.MeshLambertMaterial({color:'#e8e2d4'})));
  const stand=(x:number,z:number,w:number,ry:number)=>{const g=new T.Group();for(let i=0;i<4;i++){const geo=own(new T.BoxGeometry(w,1.6,2.2));
    const step=new T.Mesh(geo,[steel,steel,steel,steel,cm,steel]);step.position.set(0,.8+i*1.6,-i*2.2);g.add(step);}
   const rg=own(new T.BoxGeometry(w+1,.4,10));const r=new T.Mesh(rg,roof);r.position.set(0,8.4,-3.6);r.rotation.x=-.12;g.add(r);const fg=own(new T.BoxGeometry(w+1.04,.5,.12));const f=new T.Mesh(fg,inkM);f.position.set(0,8.6,1.4);f.rotation.x=-.12;g.add(f);
   g.position.set(x,0,z);g.rotation.y=ry;scene.add(g);};
  stand(0,-56,46,0);stand(-17.5,-22,40,Math.PI/2);stand(17.5,-22,40,-Math.PI/2);
  const lampG=own(new T.BoxGeometry(2.4,1.2,.3)),poleG=own(new T.CylinderGeometry(.18,.24,16,8)),lampM=own(new T.MeshBasicMaterial({color:'#fff6c8'}));
  for(const [x,z] of [[-15,-52],[15,-52],[-15,-6],[15,-6]]){const p=new T.Mesh(poleG,steel);p.position.set(x,8,z);scene.add(p);const l=new T.Mesh(lampG,lampM);l.position.set(x,16.4,z);l.lookAt(0,0,-25);scene.add(l);const e=new T.Mesh(own(new T.BoxGeometry(2.6,1.4,.2)),inkM);e.position.copy(l.position);e.quaternion.copy(l.quaternion);e.translateZ(-.12);scene.add(e);}
  const sk=own(skyTex()),skyM=own(new T.MeshBasicMaterial({map:sk,fog:false})),skyG=own(new T.PlaneGeometry(200,50));const sky=new T.Mesh(skyG,skyM);sky.position.set(0,18,-90);scene.add(sky);
  // our goal, just behind the kicker
  const post=own(new T.CylinderGeometry(.06,.06,2.44,8)),bar=own(new T.CylinderGeometry(.06,.06,7.32,8)),white=own(lit(new T.MeshLambertMaterial({color:'#fffaf0'})));
  for(const s of [-1,1]){const p=new T.Mesh(post,white);p.position.set(s*3.66,1.22,.4);p.castShadow=true;scene.add(p);}const cb=new T.Mesh(bar,white);cb.rotation.z=Math.PI/2;cb.position.set(0,2.44,.4);scene.add(cb);}

 /* ---- the kicker (a bean from behind) and the ball at its feet ---- */
 const bean=new T.Group();{const b:Parts=[];P(b,cyl(.28,.3,.62,12),BB_COLORS.teal,0,.62,0,0,0,.04,true);P(b,box(.18,.12,.04),COMIC_PAPER,0,.72,-.3,0,0,0);P(b,sph(.27,12),'#ffd9a8',0,1.15,0,0,0,.04,true);P(b,sph(.29,12),'#4a2f22',0,1.24,-.04,0,0,0,true);
  P(b,box(.14,.32,.14),'#1e2a44',-.12,.16,0,0,0,.03);const m=new T.Mesh(bakeParts(b),vmat);m.castShadow=true;bean.add(m);
  const l:Parts=[];P(l,box(.14,.34,.14),'#1e2a44',0,-.17,0,0,0,.03);P(l,box(.16,.08,.26),COMIC_INK,0,-.34,.05,0,0,.02);const leg=new T.Mesh(bakeParts(l),vmat);leg.position.set(.12,.34,0);leg.castShadow=true;bean.add(leg);bean.userData.leg=leg;}
 bean.position.set(BB.kx-.42,0,BB.kz+.42);bean.rotation.y=.25;scene.add(bean);
 const bt2=own(ballTex()),ballMat=own(lit(new T.MeshLambertMaterial({map:bt2}),true)),ballGeo=own(new T.SphereGeometry(1,20,14));
 const ready=new T.Mesh(ballGeo,ballMat);ready.scale.setScalar(BB.ballR);ready.position.set(BB.kx,BB.ballR,BB.kz);ready.castShadow=true;scene.add(ready);

 /* ---- instanced machines and props ---- */
 const kinds=[K.robot,K.cone,K.dummy,K.drone,K.shield,K.dodger,K.armour,K.crate,K.glass,K.tower,K.tyres,K.barrel,K.board];
 const inst=new Map<number,T.InstancedMesh>();
 for(const k of kinds){const geo=own(build(k)),m=new T.InstancedMesh(geo,vmat,CAP[k]);m.instanceMatrix.setUsage(T.DynamicDrawUsage);m.setColorAt(0,new T.Color(1,1,1));m.count=0;m.castShadow=true;m.frustumCulled=false;scene.add(m);inst.set(k,m);}
 const boss=buildBoss(vmat);scene.add(boss);
 const balls=new T.InstancedMesh(ballGeo,ballMat,BB.rack*4);balls.castShadow=true;balls.frustumCulled=false;balls.count=0;balls.setColorAt(0,new T.Color(1,1,1));scene.add(balls);
 const spin=Array.from({length:64},()=>new T.Quaternion());

 /* ---- pooled effects ---- */
 const pieceGeo=own(bakeParts((()=>{const p:Parts=[];P(p,new T.TetrahedronGeometry(.2),'#ffffff',0,0,0,0,0,.03);P(p,box(.2,.12,.16),'#ffffff',.06,.02,0,0,0,.03);return p;})()));
 const pieces=new T.InstancedMesh(pieceGeo,vmat,PIECES);pieces.frustumCulled=false;pieces.castShadow=true;pieces.count=PIECES;pieces.instanceMatrix.setUsage(T.DynamicDrawUsage);pieces.setColorAt(0,new T.Color(1,1,1));scene.add(pieces);
 const pc=Array.from({length:PIECES},()=>({on:false,x:0,y:0,z:0,vx:0,vy:0,vz:0,rx:0,ry:0,wx:0,wy:0,s:1,t:0,life:0}));let pieceI=0;
 const dustM=own(lit(new T.MeshLambertMaterial({color:'#fff3d6'}))),dustG=own(new T.IcosahedronGeometry(1,0));const dust=new T.InstancedMesh(dustG,dustM,DUST);dust.frustumCulled=false;dust.count=DUST;scene.add(dust);
 const dd=Array.from({length:DUST},()=>({on:false,x:0,y:0,z:0,vy:0,s:0,t:0,life:0}));let dustI=0;
 const trailM=own(new T.MeshBasicMaterial({color:'#fff3d6'})),trail=new T.InstancedMesh(own(new T.SphereGeometry(1,6,4)),trailM,TRAIL);trail.frustumCulled=false;trail.count=TRAIL;scene.add(trail);
 const tr=Array.from({length:TRAIL},()=>({on:false,x:0,y:0,z:0,t:0,s:0}));let trI=0;
 const starG=own(comicStarGeometry()),stars=Array.from({length:STARS},()=>{const g=new T.Group(),a=new T.Mesh(starG,own(new T.MeshBasicMaterial({color:COMIC_INK,depthTest:false,fog:false}))),b=new T.Mesh(starG,own(new T.MeshBasicMaterial({color:BB_COLORS.sun,depthTest:false,fog:false})));
  b.scale.setScalar(.78);b.position.z=.01;g.add(a,b);g.renderOrder=10;a.renderOrder=10;b.renderOrder=11;g.visible=false;scene.add(g);return {g,b:b.material as T.MeshBasicMaterial,t:0,life:0,s:1};});let starI=0;
 // the aim: a ring on the target, a dotted arc
 const ringG=own(new T.RingGeometry(.42,.58,32)),ringInk=own(new T.RingGeometry(.36,.66,32));ringG.rotateX(-Math.PI/2);ringInk.rotateX(-Math.PI/2);
 const ring=new T.Group(),ringM=own(new T.MeshBasicMaterial({color:BB_COLORS.sun,depthTest:false,fog:false}));{const a=new T.Mesh(ringInk,own(new T.MeshBasicMaterial({color:COMIC_INK,depthTest:false,fog:false})));const b=new T.Mesh(ringG,ringM);b.position.y=.01;a.renderOrder=12;b.renderOrder=13;ring.add(a,b);}ring.visible=false;scene.add(ring);
 const dotM=own(new T.MeshBasicMaterial({color:'#fff3d6',depthTest:false,fog:false})),dots=new T.InstancedMesh(own(new T.SphereGeometry(1,8,6)),dotM,DOTS);dots.renderOrder=12;dots.frustumCulled=false;dots.count=0;dots.setColorAt(0,new T.Color(1,1,1));scene.add(dots);
 const arc=new Float32Array(DOTS*3);
 type Aim={x:number;y:number;z:number;power:number;curl:number;lock:number}|null;let aim:Aim=null;

 /* ---- frame state ---- */
 const M=new T.Matrix4(),Q=new T.Quaternion(),E=new T.Euler(),V=new T.Vector3(),SV=new T.Vector3(),C1=new T.Color(),C2=new T.Color();
 let W=1,H=1,shake=0,kickT=9,lastT=0,bossShown=false,camPull=0;
 function resize(w:number,h:number,dpr:number){W=w;H=h;renderer.setPixelRatio(Math.min(o.mobile?1.5:2,dpr));renderer.setSize(w,h,false);camera.aspect=w/h;
  // keep the pitch's far width in view on narrow phones; wider screens see more of the stadium
  camera.fov=w/h<.62?54:w/h<1?48:42;camera.updateProjectionMatrix();comicDotCell(ink,renderer);}
 function spawnPieces(kind:number,x:number,y:number,z:number,n:number,force:number){const tones=PIECE_TONES[kind]??PIECE_TONES[1];
  for(let i=0;i<n;i++){const idx=pieceI,p=pc[idx];pieceI=(pieceI+1)%PIECES;const a=Math.random()*6.28,u=Math.random();p.on=true;p.x=x+(Math.random()-.5)*.5;p.y=y+(Math.random()-.3)*.6;p.z=z+(Math.random()-.5)*.5;
   p.vx=Math.cos(a)*force*(.4+u);p.vz=Math.sin(a)*force*(.4+u)-force*.3;p.vy=force*(.6+Math.random()*.9);p.wx=(Math.random()-.5)*16;p.wy=(Math.random()-.5)*16;p.rx=a;p.ry=u*6;p.s=.6+Math.random()*1.1;p.t=0;p.life=1.4+Math.random()*.6;
   pieces.setColorAt(idx,C1.set(tones[i%tones.length]));}
  if(pieces.instanceColor)pieces.instanceColor.needsUpdate=true;}
 function puff(x:number,y:number,z:number,n:number,size:number){for(let i=0;i<n;i++){const d=dd[dustI];dustI=(dustI+1)%DUST;d.on=true;d.x=x+(Math.random()-.5)*size;d.y=y+Math.random()*.2;d.z=z+(Math.random()-.5)*size;d.vy=.6+Math.random()*.8;d.s=size*(.25+Math.random()*.25);d.t=0;d.life=.5+Math.random()*.3;}}
 function star(x:number,y:number,z:number,s:number,color:string){const st=stars[starI];starI=(starI+1)%STARS;st.g.visible=true;st.g.position.set(x,y,z);st.t=0;st.life=.26;st.s=s;st.b.color.set(color);}
 function onEvent(e:BlastEvent){
  switch(e.type){
   case 'shot':kickT=0;break;
   case 'bounce':if(e.kind===0&&e.a>3)puff(e.x,0,e.z,2,.5);break;
   case 'hit':star(e.x,e.y,e.z,.7,'#fff3d6');shake=Math.max(shake,.05);spawnPieces(e.kind,e.x,e.y,e.z,3,2);break;
   case 'block':star(e.x,e.y,e.z,.6,'#8fd0e6');break;
   case 'break':{const big=e.kind===K.boss;spawnPieces(e.kind,e.x,e.y,e.z,big?60:e.kind===K.board?22:12,big?7:4.2);star(e.x,e.y+.2,e.z,big?2.4:1.1,e.b?BB_COLORS.sun:e.kind<10?BB_COLORS.sun:'#fff3d6');puff(e.x,0,e.z,big?8:3,big?2:.8);shake=Math.max(shake,big?.35:.12);if(big)camPull=1;break;}
   case 'boom':spawnPieces(K.barrel,e.x,.6,e.z,16,5.5);puff(e.x,0,e.z,8,2.4);star(e.x,1,e.z,1.8,'#8fd0e6');shake=Math.max(shake,.22);break;
   case 'topple':if(e.a===1){puff(e.x,0,e.z,5,1.4);shake=Math.max(shake,.1);}break;
   case 'leak':shake=Math.max(shake,.3);puff(e.x,0,0,6,1.2);break;
   case 'trick':star(e.x,Math.max(1,e.y),e.z,1.4,BB_COLORS.red);break;
  }
 }
 function reset(){for(const p of pc)p.on=false;for(const d of dd)d.on=false;for(const t of tr)t.on=false;for(const s of stars)s.g.visible=false;aim=null;shake=0;camPull=0;kickT=9;}
 /** The thing under a screen point (aim assist: a generous sphere), else the pitch under it. */
 const ray=new T.Raycaster(),ndc=new T.Vector2(),plane=new T.Plane(new T.Vector3(0,1,0),0),hitP=new T.Vector3(),center=new T.Vector3();
 function pick(g:BallBlaster|null,sx:number,sy:number):AimPick{ndc.set(sx/W*2-1,-(sy/H)*2+1);ray.setFromCamera(ndc,camera);let best=Infinity,res:AimPick|null=null;
  if(g)for(const e of g.state.ents){if(!e.on)continue;const cy=e.y+e.h*.5;center.set(e.x,cy,e.z);const r=Math.max(e.r,e.h*.5)*1.25+.25;const d=ray.ray.distanceSqToPoint(center);if(d>r*r)continue;const t=center.distanceTo(ray.ray.origin);if(t<best){best=t;res={x:e.x,y:e.kind===K.boss?2.2:cy,z:e.z,lock:e.id};}}
  if(res)return res;if(!ray.ray.intersectPlane(plane,hitP))return {x:0,y:.5,z:-20,lock:0};return {x:hitP.x,y:.5,z:Math.max(BB.farZ+2,Math.min(-1.5,hitP.z)),lock:0};}
 function project(x:number,y:number,z:number){V.set(x,y,z).project(camera);return {x:(V.x+1)/2*W,y:(1-V.y)/2*H,on:V.z<1};}
 function render(g:BallBlaster,now:number){
  const s=g.state,dt=Math.min(.05,lastT?now-lastT:1/60);lastT=now;const slow=s.cine>0?.3:1,fdt=dt*slow;
  // camera: a gentle shake, a slow pull toward a broken boss
  shake=o.reduced?0:Math.max(0,shake-dt*1.6);camPull=Math.max(0,camPull-dt*.5);
  camera.position.copy(camBase);if(shake>0){camera.position.x+=(Math.sin(now*71)*.5+Math.sin(now*43)*.5)*shake*.35;camera.position.y+=Math.sin(now*57)*shake*.25;}
  if(camPull>0&&!o.reduced)camera.position.lerp(SV.set(0,3.8,2),Math.sin(camPull*Math.PI)*.35);
  camera.lookAt(look);aimComicSun(ink,toSun,camera);
  // machines and props
  const counts=new Map<number,number>();for(const k of kinds)counts.set(k,0);let bossOn=false;
  for(const e of s.ents){if(!e.on)continue;
   if(e.kind===K.boss){bossOn=true;boss.visible=true;const w=Math.sin(e.t*3.2);boss.position.set(e.x,Math.abs(w)*.08,e.z);boss.rotation.set(0,0,w*.05);const sc=1+(e.flash>0?e.flash*.6:0);boss.scale.setScalar(sc);
    const arms=boss.userData.arms as T.Mesh[];arms[0].rotation.x=w*.6;arms[1].rotation.x=-w*.6;if(e.phase===2){arms[0].rotation.z=-.6;arms[1].rotation.z=.6;}continue;}
   const m=inst.get(e.kind);if(!m)continue;const i=counts.get(e.kind)!;if(i>=m.instanceMatrix.count)continue;counts.set(e.kind,i+1);
   const walk=isMachine(e.kind),ph=e.t*9+e.ph,pop=e.flash>0?1+e.flash*1.4:1;
   let sy=1,y=e.y;if(walk&&e.kind!==K.drone&&e.kind!==K.dummy)y+=Math.abs(Math.sin(ph))*.06;if(e.kind===K.dummy){const land=1-Math.min(1,e.y/.25);sy=1-land*.18;}
   E.set(e.kind===K.drone?Math.sin(e.t*2)*.15:0,e.kind===K.drone?e.t*.6:0,walk&&e.kind!==K.drone?Math.sin(ph)*.08:0);Q.setFromEuler(E);M.compose(V.set(e.x,y,e.z),Q,SV.set(pop,sy*pop,pop));m.setMatrixAt(i,M);
   C1.setRGB(1,1,1);if(e.gold)C1.setRGB(1.25,1.02,.35);if(e.kind===K.armour&&e.hp<e.max)C1.multiplyScalar(.72);if(e.flash>0)C1.lerp(C2.setRGB(2.2,2.2,2.2),Math.min(1,e.flash*6));m.setColorAt(i,C1);}
  for(const k of kinds){const m=inst.get(k)!;m.count=counts.get(k)!;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}
  if(!bossOn&&boss.visible)boss.visible=false;bossShown=bossOn;
  // balls: spin with their speed, a dotted trail in flight
  let bn=0;for(let i=0;i<s.balls.length;i++){const b=s.balls[i];if(!b.on)continue;const q=spin[i%64],sp=Math.hypot(b.vx,b.vz);if(sp>.1){Q.setFromAxisAngle(V.set(-b.vz/sp,0,b.vx/sp),sp*fdt/b.r);q.premultiply(Q);}
   M.compose(V.set(b.x,b.y,b.z),q,SV.setScalar(b.r));balls.setMatrixAt(bn,M);balls.setColorAt(bn,b.fire?C1.set('#ff8a3c'):b.r>BB.ballR?C1.set('#ffe9a0'):C1.setRGB(1,1,1));bn++;
   if(!o.reduced&&sp>8&&Math.random()<.7){const t=tr[trI];trI=(trI+1)%TRAIL;t.on=true;t.x=b.x;t.y=b.y;t.z=b.z;t.t=0;t.s=b.r*(b.fire?.8:.45);}}
  balls.count=bn;balls.instanceMatrix.needsUpdate=true;if(balls.instanceColor)balls.instanceColor.needsUpdate=true;
  ready.visible=s.rack>0&&kickT>.18&&!s.over;
  // the kick: the leg swings through
  kickT+=dt;const leg=bean.userData.leg as T.Object3D;leg.rotation.x=kickT<.3?-Math.sin(kickT/.3*Math.PI)*1.3:0;
  // pieces, dust, trail, stars
  for(let i=0;i<PIECES;i++){const p=pc[i];if(!p.on){M.makeScale(0,0,0);pieces.setMatrixAt(i,M);continue;}p.t+=fdt;if(p.t>p.life){p.on=false;M.makeScale(0,0,0);pieces.setMatrixAt(i,M);continue;}
   p.vy-=14*fdt;p.x+=p.vx*fdt;p.y+=p.vy*fdt;p.z+=p.vz*fdt;if(p.y<.06){p.y=.06;p.vy=-p.vy*.35;p.vx*=.6;p.vz*=.6;p.wx*=.6;p.wy*=.6;}p.rx+=p.wx*fdt;p.ry+=p.wy*fdt;
   const k=p.t>p.life-.3?(p.life-p.t)/.3:1;E.set(p.rx,p.ry,0);Q.setFromEuler(E);M.compose(V.set(p.x,p.y,p.z),Q,SV.setScalar(p.s*k));pieces.setMatrixAt(i,M);}
  pieces.instanceMatrix.needsUpdate=true;
  for(let i=0;i<DUST;i++){const d=dd[i];if(d.on){d.t+=fdt;if(d.t>d.life)d.on=false;}if(!d.on){M.makeScale(0,0,0);dust.setMatrixAt(i,M);continue;}const k=d.t/d.life;d.y+=d.vy*fdt;M.compose(V.set(d.x,d.y,d.z),Q.identity(),SV.setScalar(d.s*(.6+k*.8)*(1-k*k)));dust.setMatrixAt(i,M);}
  dust.instanceMatrix.needsUpdate=true;
  for(let i=0;i<TRAIL;i++){const t=tr[i];if(t.on){t.t+=dt;if(t.t>.22)t.on=false;}if(!t.on){M.makeScale(0,0,0);trail.setMatrixAt(i,M);continue;}M.compose(V.set(t.x,t.y,t.z),Q.identity(),SV.setScalar(t.s*(1-t.t/.22)));trail.setMatrixAt(i,M);}
  trail.instanceMatrix.needsUpdate=true;
  for(const st of stars){if(!st.g.visible)continue;st.t+=dt;if(st.t>st.life){st.g.visible=false;continue;}const k=st.t/st.life;st.g.quaternion.copy(camera.quaternion);st.g.scale.setScalar(st.s*(k<.3?.5+k/.3*.7:1.2-(k-.3)*.4));st.g.rotation.z+=dt*2;}
  // the aim
  if(aim&&!s.over){ring.visible=true;const gy=aim.lock?.03:.03;ring.position.set(aim.x,gy,aim.z);const pulse=1+Math.sin(now*12)*.06*(aim.power);ring.scale.setScalar((aim.lock?1.15:1)*pulse*(1+aim.z/-60));
   ringM.color.set(aim.power>=.9?BB_COLORS.red:BB_COLORS.sun);
   const n=g.predict(aim.x,aim.y,aim.z,aim.power,aim.curl,arc,DOTS);for(let i=0;i<n;i++){M.compose(V.set(arc[i*3],arc[i*3+1],arc[i*3+2]),Q.identity(),SV.setScalar(.06+.03*(1-i/n)));dots.setMatrixAt(i,M);dots.setColorAt(i,aim.power>=.9?C1.set('#ffb4a0'):C1.set('#fff3d6'));}
   dots.count=n;dots.instanceMatrix.needsUpdate=true;if(dots.instanceColor)dots.instanceColor.needsUpdate=true;}else{ring.visible=false;dots.count=0;}
  renderer.render(scene,camera);
 }
 return {
  resize,render,onEvent,reset,pick,project,
  setAim(a:Aim){aim=a;},
  get bossShown(){return bossShown;},
  get info(){return renderer.info.render;},
  get canvas(){return canvas;},
  dispose(){scene.traverse(obj=>{const m=obj as T.Mesh;if(m.geometry)m.geometry.dispose();const mat=m.material as T.Material|T.Material[]|undefined;if(Array.isArray(mat))mat.forEach(x=>x.dispose());else mat?.dispose();});
   for(const x of owned)x.dispose();for(const m of inst.values())m.dispose();balls.dispose();pieces.dispose();dust.dispose();trail.dispose();dots.dispose();
   renderer.dispose();renderer.forceContextLoss();canvas.remove();},
 };
}
