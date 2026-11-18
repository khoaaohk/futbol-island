/**
 * Roll It In view (Nov 17 2026, docs/arcade-aaa/rollball-direction.md): three.js, one canvas, procedural only (canvas textures and
 * geometry made in code, no downloads). Realistic-but-arcade: lit terrain with a soft five-step toon ramp, baked edge light and
 * contact shade in vertex colours, rounded grass lips over rough cliffs that widen into the sea, glossy wet tiles, metal and mud,
 * toon water with moving shore foam, ink lines on every exposed terrain edge and ink hulls on the ball, crates and stars.
 * Puzzle readability: every plate / switch / cone / lock is joined to what it opens by a dashed cable on the ground that lights
 * and flows when its signal is on; gates have posts and lamps, bridges unfold plank by plank, lifts run on rails, fans blow streaks.
 * Heat (AGENTS.md): powerPreference low-power, pixel ratio capped (1.5 phone, 2 desktop), one shadow-casting sun (512 map on a
 * phone), no post-processing, terrain merged per module and surface, tufts / pebbles / tracks instanced (one draw each for the
 * level), only the ball's module, the one behind and two ahead are drawn, modules two behind are disposed, pooled particles,
 * nothing drawn on the menus. Measured in headless Chrome (swiftshader) on the heaviest modules: see the direction doc.
 */
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {RB,topAt,type World,type Piece,type Surf,type RollState,type RollEvent,type Theme} from './core';

const INK=0x231a2e;
export type ThemeLook={sky:[string,string,string];fog:number;deep:string;shallow:string;foam:string;hemi:[number,number,number];sun:[number,number];
 side:[string,string];isle:string;edge:number};
export const THEME_LOOK:Record<Theme,ThemeLook>={
 0:{sky:['#4fa9e0','#a9dcf5','#e4f3f8'],fog:0xd9eef4,deep:'#1f7fa3',shallow:'#43b8cf',foam:'#f4fdff',hemi:[0xeaf6ff,0x55703f,1.05],sun:[0xfff1d6,1.9],side:['#8a5a3a','#4e3322'],isle:'#5fb54a',edge:INK},
 1:{sky:['#2fa6e0','#8fd6f0','#fff1d0'],fog:0xf4ecd6,deep:'#0f8a9c',shallow:'#46d0cf',foam:'#ffffff',hemi:[0xfff6e0,0x9a7a4a,1.1],sun:[0xffe9c4,2],side:['#d9b27a','#9a7448'],isle:'#efd29a',edge:INK},
 2:{sky:['#c8607a','#f39a6a','#ffd9a8'],fog:0xf2c6a0,deep:'#2a4f78',shallow:'#4f86a8',foam:'#ffe9d6',hemi:[0xffe2c8,0x4a3a4a,1],sun:[0xffc89a,1.8],side:['#a2523e','#5e2c20'],isle:'#b9b2a6',edge:INK},
 3:{sky:['#070b20','#16224a','#2c3a6c'],fog:0x1c2850,deep:'#0b1f40',shallow:'#21497a',foam:'#cfe4ff',hemi:[0x7f96d8,0x141a30,.5],sun:[0xdfe8ff,1.75],side:['#4a5468','#20263a'],isle:'#3f8f4a',edge:0x0a0a14},
};

/* ---------------- procedural prints (made once per view) ---------------- */
function canvasTex(size:number,draw:(g:CanvasRenderingContext2D,s:number)=>void,repeat=true,h=size){
 const c=document.createElement('canvas');c.width=size;c.height=h;const g=c.getContext('2d')!;draw(g,size);const t=new T.CanvasTexture(c);
 if(repeat){t.wrapS=t.wrapT=T.RepeatWrapping;}t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
function rng(seed:number){let a=seed>>>0;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
/** a hash of a lattice point (0..1) and smooth value noise from it */
const hsh=(x:number,z:number)=>{let h=Math.imul((x|0)^0x9e3779b9,0x85ebca6b)^Math.imul((z|0)+0x632be5ab,0xc2b2ae35);h^=h>>>13;h=Math.imul(h,0x27d4eb2f);return((h^(h>>>16))>>>0)/4294967296;};
const vnoise=(x:number,z:number)=>{const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,sx=fx*fx*(3-2*fx),sz=fz*fz*(3-2*fz);
 const a=hsh(ix,iz),b=hsh(ix+1,iz),c=hsh(ix,iz+1),d=hsh(ix+1,iz+1);return a+(b-a)*sx+(c-a)*sz+(a-b-c+d)*sx*sz;};
const speck=(g:CanvasRenderingContext2D,s:number,r:()=>number,n:number,cols:string[],w:number,h:number)=>{for(let i=0;i<n;i++){g.fillStyle=cols[Math.floor(r()*cols.length)];g.fillRect(r()*s,r()*s,w,h);}};
/** A print per surface; the tile is in metres (UV = metres / tile). */
const SURF_TILE:Record<Surf,number>={grass:4,long:2.5,sand:3,ice:2,mud:3,wood:2,metal:1.5,rubber:2,stone:3};
function surfTex(k:Surf){
 const r=rng(k.length*977+k.charCodeAt(0));
 return canvasTex(256,(g,s)=>{
  switch(k){
   case 'grass':{g.fillStyle='#5cb247';g.fillRect(0,0,s,s);g.fillStyle='#4fa13d';g.fillRect(0,0,s,s/2);// mowed stripes
    speck(g,s,r,2600,['#6cc455','#478f37','#5aa944','#7fd064'],1.5,4);for(let i=0;i<40;i++){g.fillStyle='#ffffff22';g.beginPath();g.ellipse(r()*s,r()*s,3,2,0,0,7);g.fill();}break;}
   case 'long':{g.fillStyle='#3d8434';g.fillRect(0,0,s,s);for(let i=0;i<1500;i++){const x=r()*s,y=r()*s;g.strokeStyle=['#2b6727','#56a645','#3f8f36','#6fb553'][Math.floor(r()*4)];g.lineWidth=1.8;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+(r()-.5)*6,y-6,x+(r()-.5)*9,y-10-r()*8);g.stroke();}break;}
   case 'sand':{g.fillStyle='#f0d39a';g.fillRect(0,0,s,s);speck(g,s,r,2400,['#e3c283','#f8e2b4','#d6b274','#fff0cc'],1.4,1.4);
    for(let y=6;y<s;y+=18){g.strokeStyle='#d9b77a';g.lineWidth=2.5;g.beginPath();for(let x=0;x<=s;x+=8)g.lineTo(x,y+Math.sin(x/s*Math.PI*6+y)*3);g.stroke();
     g.strokeStyle='#fff3d2';g.lineWidth=1.5;g.beginPath();for(let x=0;x<=s;x+=8)g.lineTo(x,y-3+Math.sin(x/s*Math.PI*6+y)*3);g.stroke();}break;}
   case 'ice':{g.fillStyle='#bfe8f4';g.fillRect(0,0,s,s);const q=s/4;for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.fillStyle=(x+y)%2?'#b2e0ee':'#c9eef8';g.fillRect(x*q+2,y*q+2,q-4,q-4);}
    g.strokeStyle='#7fb4c6';g.lineWidth=3;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*q,0);g.lineTo(i*q,s);g.stroke();g.beginPath();g.moveTo(0,i*q);g.lineTo(s,i*q);g.stroke();}
    g.strokeStyle='#ffffffdd';g.lineWidth=5;g.lineCap='round';for(let i=0;i<7;i++){const x=r()*s,y=r()*s;g.beginPath();g.moveTo(x,y);g.lineTo(x+20,y-20);g.stroke();}
    g.fillStyle='#e8f8ff';for(let i=0;i<14;i++){g.beginPath();g.ellipse(r()*s,r()*s,6+r()*10,3+r()*4,.4,0,7);g.fill();}break;}
   case 'mud':{g.fillStyle='#62432a';g.fillRect(0,0,s,s);for(let i=0;i<70;i++){g.fillStyle=['#523621','#76543a','#5a3d26'][Math.floor(r()*3)];g.beginPath();g.ellipse(r()*s,r()*s,6+r()*20,4+r()*12,r()*3,0,7);g.fill();}
    for(let i=0;i<18;i++){const x=r()*s,y=r()*s;g.fillStyle='#3e2818';g.beginPath();g.ellipse(x,y,8+r()*10,4+r()*5,r()*3,0,7);g.fill();g.fillStyle='#a58a7055';g.beginPath();g.ellipse(x-2,y-2,4,2,0,0,7);g.fill();}
    speck(g,s,r,500,['#4a301b','#8a6a4a'],2,2);break;}
   case 'wood':{const n=4,pw=s/n;for(let i=0;i<n;i++){const x=i*pw;g.fillStyle=['#c98a4a','#bd7f42','#d29452','#c4864a'][i];g.fillRect(x,0,pw,s);
     g.strokeStyle='#a86c3688';g.lineWidth=1;for(let j=0;j<7;j++){const gx=x+4+r()*(pw-8);g.beginPath();g.moveTo(gx,0);g.bezierCurveTo(gx+4,s*.3,gx-4,s*.6,gx+2,s);g.stroke();}
     if(r()<.6){g.fillStyle='#8a5a2e';g.beginPath();g.ellipse(x+pw*(.3+r()*.4),r()*s,4,6,0,0,7);g.fill();}
     g.fillStyle='#5e3a1c';g.fillRect(x,0,3,s);g.fillStyle='#e0a868';g.fillRect(x+3,0,1.5,s);
     const yb=(i%2?.5:0)*s;g.fillStyle='#5e3a1c';g.fillRect(x,yb,pw,2.5);
     g.fillStyle='#3a2a1e';for(const yy of [yb+10,yb+s/2-10])for(const xx of [x+9,x+pw-9]){g.beginPath();g.arc(xx,(yy+s)%s,2.6,0,7);g.fill();}g.fillStyle='#d8d0c0';for(const yy of [yb+10,yb+s/2-10])for(const xx of [x+9,x+pw-9]){g.beginPath();g.arc(xx-.8,(yy+s)%s-.8,1,0,7);g.fill();}}break;}
   case 'metal':{g.fillStyle='#8f9ba4';g.fillRect(0,0,s,s);const st=24;for(let y=0;y<s;y+=st)for(let x=0;x<s;x+=st){const a=((x+y)/st)%2?.7:-.7;g.save();g.translate(x+st/2,y+st/2);g.rotate(a);
     g.fillStyle='#6f7b84';g.fillRect(-8,-1,16,4);g.fillStyle='#d6dee3';g.fillRect(-8,-2.5,16,2.5);g.restore();}
    g.strokeStyle='#5d6870';g.lineWidth=3;g.strokeRect(1.5,1.5,s-3,s-3);g.fillStyle='#c6ced4';for(const [x,y] of [[8,8],[s-8,8],[8,s-8],[s-8,s-8]]){g.beginPath();g.arc(x,y,3.5,0,7);g.fill();}break;}
   case 'rubber':{g.fillStyle='#e0473a';g.fillRect(0,0,s,s);g.fillStyle='#b8302a';for(let y=8;y<s;y+=16)for(let x=(y/16)%2?8:0;x<s;x+=16){g.beginPath();g.arc(x,y,4,0,7);g.fill();}break;}
   case 'stone':{g.fillStyle='#b9b0a2';g.fillRect(0,0,s,s);const q=s/4;for(let y=0;y<4;y++)for(let x=0;x<4;x++){const off=y%2?q/2:0;g.fillStyle=['#c4bcae','#b0a796','#bdb4a6','#a99f8f'][Math.floor(r()*4)];g.fillRect(x*q+off+2,y*q+2,q-4,q-4);
     if(off&&x===3){g.fillRect(2,y*q+2,q/2-4,q-4);}}speck(g,s,r,900,['#9c9384','#d2cabd','#8a8274'],2,2);
    g.fillStyle='#4f8a3a';for(let i=0;i<10;i++){const x=Math.floor(r()*4)*q,y=r()*s;g.fillRect(x-1,y,3,6);}break;}
  }
 });
}
/** cliff faces: soil strata, sandstone, brick, concrete; v runs up the face (2.2 m a tile) */
function sideTex(t:Theme){const L=THEME_LOOK[t],r=rng(31+t);return canvasTex(256,(g,s)=>{g.fillStyle=L.side[0];g.fillRect(0,0,s,s);
 if(t===2){for(let y=0;y<s;y+=16){g.fillStyle=L.side[1];g.fillRect(0,y,s,3);for(let x=(y/16)%2?0:20;x<s;x+=40){g.fillRect(x,y,3,16);g.fillStyle=r()<.5?'#b5604a':'#94483a';g.fillRect(x+3,y+3,37,13);g.fillStyle=L.side[1];}}}
 else if(t===3){g.fillStyle='#565f74';g.fillRect(0,0,s,s);for(let y=0;y<s;y+=64){g.fillStyle='#3a4256';g.fillRect(0,y,s,4);}for(let x=0;x<s;x+=128){g.fillStyle='#3a4256';g.fillRect(x,0,4,s);}speck(g,s,r,700,['#4a5266','#6a738a'],2,2);}
 else{for(let y=0;y<s;y+=10+Math.floor(r()*14)){g.fillStyle=r()<.5?L.side[1]+'66':'#ffffff1a';g.beginPath();g.moveTo(0,y);for(let x=0;x<=s;x+=16)g.lineTo(x,y+Math.sin(x*.05+y)*3+r()*2);g.lineTo(s,y+5);g.lineTo(0,y+5);g.fill();}
  for(let i=0;i<40;i++){g.fillStyle=r()<.5?L.side[1]:'#ffffff30';g.beginPath();g.ellipse(r()*s,r()*s,3+r()*7,2+r()*4,r()*3,0,7);g.fill();}
  if(t===0){g.fillStyle='#3f2a1c';for(let i=0;i<24;i++){const x=r()*s,y=s*.6+r()*s*.4;g.fillRect(x,y,1.5,6+r()*10);}}}
});}
function skyTex(L:ThemeLook){return canvasTex(8,(g,s)=>{const gr=g.createLinearGradient(0,0,0,128);gr.addColorStop(0,L.sky[0]);gr.addColorStop(.55,L.sky[1]);gr.addColorStop(1,L.sky[2]);g.fillStyle=gr;g.fillRect(0,0,s,128);},false,128);}
/** the far ring round the course: hills, a sea horizon with islands, a skyline, a floodlit bowl (fog-free, painted in fog colours) */
function backTex(t:Theme){const L=THEME_LOOK[t],r=rng(77+t),W=1024,H=256,base=H*.62;
 return canvasTex(W,(g)=>{g.clearRect(0,0,W,H);const fog='#'+new T.Color(L.fog).getHexString();
  const ridge=(y0:number,amp:number,col:string,f:number,ph:number)=>{g.fillStyle=col;g.beginPath();g.moveTo(0,H);for(let x=0;x<=W;x+=8)g.lineTo(x,y0-Math.abs(Math.sin(x/W*Math.PI*2*f+ph))*amp-Math.sin(x/W*Math.PI*2*f*2.7+ph*2)*amp*.25);g.lineTo(W,H);g.fill();};
  const clouds=(col:string)=>{g.fillStyle=col;for(let i=0;i<9;i++){const x=r()*W,y=20+r()*70,w=40+r()*70;for(let k=0;k<4;k++){g.beginPath();g.ellipse(x+k*w*.3,y-(k%2)*8,w*.32,w*.16,0,0,7);g.fill();}}};
  if(t===0){clouds('#ffffffcc');ridge(base,46,'#9cc7a8',3,0);ridge(base+10,28,'#7fb48a',5,1.3);g.fillStyle='#5f9a6c';for(let i=0;i<70;i++){const x=r()*W;g.beginPath();g.arc(x,base+6+r()*10,4+r()*5,0,7);g.fill();}}
  else if(t===1){clouds('#ffffffdd');g.fillStyle='#fff3c4';g.beginPath();g.arc(W*.3,base-60,26,0,7);g.fill();
   for(let i=0;i<6;i++){const x=r()*W,w=60+r()*120;g.fillStyle='#8fbf9a';g.beginPath();g.ellipse(x,base+4,w,14+r()*10,0,Math.PI,0);g.fill();g.strokeStyle='#5f8f6a';g.lineWidth=3;
    for(let k=0;k<2;k++){const px=x+(r()-.5)*w;g.beginPath();g.moveTo(px,base);g.quadraticCurveTo(px+6,base-20,px+3,base-34);g.stroke();g.fillStyle='#5f8f6a';g.beginPath();g.ellipse(px+3,base-34,12,4,0,0,7);g.fill();}}}
  else if(t===2){g.fillStyle='#ffd27a';g.beginPath();g.arc(W*.62,base-30,40,0,7);g.fill();
   for(const [col,hm,win] of [['#b0708a',70,'#ffd9a8'],['#7a4a68',50,'#ffcf7a']] as const){let x=0;while(x<W){const w=30+r()*50,h=20+r()*hm;g.fillStyle=col;g.fillRect(x,base-h,w,h+40);
     if(r()<.25){g.fillRect(x+w*.3,base-h-22,w*.4,22);g.fillRect(x+w*.3-4,base-h-26,w*.4+8,6);}g.fillStyle=win;for(let yy=base-h+6;yy<base;yy+=9)for(let xx=x+4;xx<x+w-4;xx+=8)if(r()<.35)g.fillRect(xx,yy,4,5);x+=w+2;}}}
  else{g.fillStyle='#ffffff';for(let i=0;i<120;i++)g.fillRect(r()*W,r()*base*.7,1.5,1.5);
   g.fillStyle='#232c4a';g.beginPath();g.moveTo(0,H);for(let x=0;x<=W;x+=8)g.lineTo(x,base-40-Math.sin(x/W*Math.PI*4)*12);g.lineTo(W,H);g.fill();
   for(let i=0;i<900;i++){g.fillStyle=['#e0473a','#ffc83a','#f4f0e6','#19b5a5','#4a9fe0'][Math.floor(r()*5)];const x=r()*W,y=base-34+r()*40-Math.sin(x/W*Math.PI*4)*12;g.fillRect(x,y,2,2);}
   for(let i=0;i<4;i++){const x=(i+.5)*W/4;g.fillStyle='#39425e';g.fillRect(x-2,base-110,4,80);g.fillStyle='#fff6c8';g.fillRect(x-14,base-122,28,12);g.fillStyle='#fff6c855';g.beginPath();g.arc(x,base-116,26,0,7);g.fill();}}
  // the lowest band fades into the fog so the ring meets the sea softly
  const gr=g.createLinearGradient(0,base-10,0,H);gr.addColorStop(0,fog+'00');gr.addColorStop(.45,fog+'ff');g.fillStyle=gr;g.fillRect(0,base-10,W,H-base+10);
 },true,H);}
function toonRamp(){const v=[95,140,190,232,255],d=new Uint8Array(v.length*4);v.forEach((x,i)=>d.set([x,x,x,255],i*4));const t=new T.DataTexture(d,v.length,1,T.RGBAFormat);t.minFilter=t.magFilter=T.NearestFilter;t.needsUpdate=true;return t;}

/* ---------------- shaders: toon sea, shore foam, signal cables ---------------- */
const FOGF=`uniform vec3 uFog;uniform float uNear,uFar;uniform vec3 uCam;varying vec3 vW;vec3 fogged(vec3 c){return mix(c,uFog,smoothstep(uNear,uFar,distance(uCam,vW)));}`;
const VERT=`varying vec3 vW;varying vec2 vUv;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const SEA=`uniform float uT,uA;uniform vec3 uDeep,uShallow,uFoam;${FOGF}varying vec2 vUv;
void main(){vec2 p=vW.xz;float c=sin(p.x*.55+sin(p.y*.35+uT*.3)*1.6+uT*.4)*sin(p.y*.5+sin(p.x*.3-uT*.25)*1.4);
 float w=sin(p.x*1.1+uT*.9)*.5+sin(p.y*1.4-uT*.7+sin(p.x*.4))*.5;float m=floor(clamp(w*.25+c*.45+.5,0.,.999)*3.)/3.;
 vec3 col=mix(uDeep,uShallow,m*.6);float cr=sin(p.y*.8+sin(p.x*.22+uT*.35)*2.2+uT*.7);float l=smoothstep(.965,.985,cr)*step(.45,fract(p.x*.07+sin(p.y*.3)*.4+uT*.02));col=mix(col,uFoam,l*.6);
 gl_FragColor=vec4(fogged(col),uA);
 #include <colorspace_fragment>
}`;
const FOAM=`uniform float uT;uniform vec3 uShallow,uFoam;${FOGF}varying vec2 vUv;
void main(){float v=vUv.y;float b=fract(v*2.4-uT*.32+sin(vUv.x*1.3+uT*.4)*.12);float line=step(b,.16)*(1.-v)*step(.2,v);
 float edge=1.-smoothstep(.07,.15,v+sin(vUv.x*3.+uT*1.5)*.03);float a=max(edge,line*.9);
 gl_FragColor=vec4(fogged(mix(uShallow,uFoam,a)),max(a,(1.-v)*.5));
 #include <colorspace_fragment>
}`;
const CABLE=`uniform float uT,uOn,uFlash;uniform vec3 uCol;${FOGF}varying vec2 vUv;
void main(){float e=step(.34,abs(vUv.y-.5));float d=step(.5,fract(vUv.x*1.7-uT*2.4*uOn));
 vec3 off=mix(vec3(.17,.15,.22),uCol*.36,d);vec3 on=mix(uCol*.85,vec3(1.,.98,.88),d*.75);vec3 c=mix(off,on,uOn);c=mix(c,vec3(.137,.102,.18),e);c=mix(c,vec3(1.,.95,.6),uFlash*(1.-e*.6));
 gl_FragColor=vec4(fogged(c),1.);
 #include <colorspace_fragment>
}`;

/* ---------------- terrain geometry ---------------- */
type Acc={p:number[];u:number[];c:number[]};
const acc=():Acc=>({p:[],u:[],c:[]});
type V=[number,number,number,number,number,number];// x y z u v shade
const vtx=(a:Acc,v:V)=>{a.p.push(v[0],v[1],v[2]);a.u.push(v[3],v[4]);a.c.push(v[5],v[5],v[5]);};
const tri=(a:Acc,x:V,y:V,z:V)=>{vtx(a,x);vtx(a,y);vtx(a,z);};
const quad=(a:Acc,A:V,B:V,C:V,D:V)=>{tri(a,A,B,D);tri(a,D,B,C);};
function geom(a:Acc,colors=true){if(!a.p.length)return null;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(a.p,3));g.setAttribute('uv',new T.Float32BufferAttribute(a.u,2));
 if(colors)g.setAttribute('color',new T.Float32BufferAttribute(a.c,3));g.computeVertexNormals();return g;}
/** the highest still terrain top at (x,z) among modules lo..hi (-Infinity over the sea) */
function stillTop(w:World,x:number,z:number,lo:number,hi:number){let h=-Infinity;
 for(let m=Math.max(0,lo);m<=Math.min(w.mods.length-1,hi);m++){const P=w.mods[m];for(let i=P.p0;i<P.p1;i++){const p=w.pieces[i];if((p.role!==0&&p.role!==1)||p.hidden||x<p.x0||x>p.x1||z<p.z0||z>p.z1)continue;const t=p.role===1?p.a-1.1:topAt(p,x,z);if(t>h)h=t;}}return h;}
type Scatter={x:number;y:number;z:number;s:number;col:number;ry:number;flat?:number};
/**
 * One still piece: a subdivided top (smooth on hills, banks and pipes) shaded by baked light (a rim where the ground drops, contact
 * shade under a higher neighbour, a little noise), a rounded lip, and cliffs only where the ground really drops: rough and widening
 * into the sea, with shore foam round the waterline. Ink lines run along the exposed top edges.
 */
/** Hillshade exaggeration: gentle hills must read from the chase camera, not only at their cliff edges. */
const SLOPE_X=2.4;
function pieceGeom(w:World,pi:number,mi:number,top:Acc,side:Acc,foam:Acc,lines:number[],tufts:Scatter[],pebbles:Scatter[],lift:number){
 const p=w.pieces[pi],tile=SURF_TILE[p.surf],h=(x:number,z:number)=>topAt(p,Math.min(p.x1,Math.max(p.x0,x)),Math.min(p.z1,Math.max(p.z0,z)))+lift;
 const curvedX=p.kind===3||p.kind===6,curvedZ=p.kind===4||p.kind===5,W=p.x1-p.x0,L=p.z1-p.z0;
 const nx=Math.max(1,Math.min(24,Math.ceil(W/(curvedX?.35:.8)))),nz=Math.max(1,Math.min(40,Math.ceil(L/(curvedZ?.35:.8))));
 const shade=(x:number,z:number,y:number)=>{const gx=(h(x+.12,z)-h(x-.12,z))/.24*SLOPE_X,gz=(h(x,z+.12)-h(x,z-.12))/.24*SLOPE_X,nl=Math.hypot(gx,1,gz),dl=(-gx*.38+.88+gz*.31)/nl;// hillshade: slopes facing the sun (behind the camera) brighten, the far sides darken
  let s=(.94+(vnoise(x*.7,z*.7)-.5)*.16)*(.3+.7*Math.max(0,dl)/.88)*(1+Math.max(-.12,Math.min(.12,y*.1)));
  s*=1-Math.min(.3,Math.hypot(gx,gz)/SLOPE_X*.5);// any slope shades a band darker than the flat tops, so a hill's flanks and crest read apart
  for(const [dx,dz] of [[.45,0],[-.45,0],[0,.45],[0,-.45]]){const t=stillTop(w,x+dx,z+dz,mi-1,mi+1);if(t>y+.15)s-=.11;else if(t<y-.15)s+=.035;}return Math.max(.55,Math.min(1.12,s));};
 // on hills the mowing stripes are laid by the ground's length (stretched over the crest), so the slope reads
 const T0:V[][]=[],arcL=new Array(nx+1).fill(0),lastY:number[]=[];for(let j=0;j<=nz;j++){const row:V[]=[];const z=p.z0+L*j/nz;for(let i=0;i<=nx;i++){const x=p.x0+W*i/nx,y=h(x,z);if(j&&curvedZ)arcL[i]+=Math.hypot(L/nz,y-lastY[i])-L/nz;lastY[i]=y;row.push([x,y,z,x/tile,(z+arcL[i])/tile,shade(x,z,y)]);}T0.push(row);}
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)quad(top,T0[j][i],T0[j+1][i],T0[j+1][i+1],T0[j][i+1]);
 // the edges: walk each side in columns, keep only the exposed ones
 const edges:[number,number,number,number,number,number][]=[[p.x0,p.z0,p.x1,p.z0,0,-1],[p.x0,p.z1,p.x1,p.z1,0,1],[p.x0,p.z0,p.x0,p.z1,-1,0],[p.x1,p.z0,p.x1,p.z1,1,0]];
 const jit=(x:number,z:number)=>hsh(Math.round(x*4),Math.round(z*4));
 const offB=(x:number,z:number)=>.2+.3*jit(x,z),lip=.035,ROT=RB.water-.4;
 const r=rng(pi*131+mi*7),grassy=p.surf==='grass'||p.surf==='long',ends:{wet:boolean;ex:boolean}[][]=[];
 // shore foam stops halfway across a narrow channel, so the two banks' strips meet instead of stacking
 const foamW=(x:number,z:number,ex:number,ez:number,w0:number)=>{for(let d=.25;d<=2.4;d+=.25)if(stillTop(w,x+ex*(w0+d),z+ez*(w0+d),mi-1,mi+1)>RB.water-.05)return Math.max(.12,Math.min(1.15,d*.5-.04));return 1.15;};
 const wl=(t:number,ob:number)=>{const f=Math.max(0,Math.min(1,(t-.07-RB.water)/(t-.07-ROT)));return lip+(ob-lip)*f;};
 edges.forEach(([ax,az,bx,bz,ex,ez])=>{const len=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(len/.5)),info:{wet:boolean;ex:boolean}[]=[];
  for(let k=0;k<n;k++){const u0=k/n,u1=(k+1)/n,x0=ax+(bx-ax)*u0,z0=az+(bz-az)*u0,x1=ax+(bx-ax)*u1,z1=az+(bz-az)*u1,t0=h(x0,z0),t1=h(x1,z1);
   const nt=stillTop(w,(x0+x1)/2+ex*.08,(z0+z1)/2+ez*.08,mi-1,mi+1),own=(t0+t1)/2-lift;
   if(nt>=own-.05){info.push({wet:false,ex:false});continue;}
   const wet=nt===-Infinity,deep=own-(wet?ROT:nt),bigLip=deep>.15,yb=wet?ROT:nt-.01;info.push({wet,ex:true});
   const along=(x:number,z:number)=>(ex?z:x)/2.2,o0=wet?offB(x0,z0):0,o1=wet?offB(x1,z1):0,l0=bigLip?lip:0,l1=bigLip?lip:0;
   const A:V=[x0,t0,z0,x0/tile,z0/tile,.98],B:V=[x1,t1,z1,x1/tile,z1/tile,.98],Al:V=[x0+ex*l0,t0-(bigLip?.07:0),z0+ez*l0,(x0+ex*.07)/tile,(z0+ez*.07)/tile,.8],Bl:V=[x1+ex*l1,t1-(bigLip?.07:0),z1+ez*l1,(x1+ex*.07)/tile,(z1+ez*.07)/tile,.8];
   if(bigLip)quad(top,A,Al,Bl,B);
   const sh=(y:number)=>wet?.42+.5*Math.max(0,Math.min(1,(y-ROT)/1.7)):.62+.3*Math.max(0,Math.min(1,(y-yb)/.5));
   const As:V=[Al[0],Al[1],Al[2],along(x0,z0),Al[1]/2.2,sh(Al[1])],Bs:V=[Bl[0],Bl[1],Bl[2],along(x1,z1),Bl[1]/2.2,sh(Bl[1])];
   const Ab:V=[x0+ex*o0,yb,z0+ez*o0,along(x0,z0),yb/2.2,sh(yb)],Bb:V=[x1+ex*o1,yb,z1+ez*o1,along(x1,z1),yb/2.2,sh(yb)];
   quad(side,As,Ab,Bb,Bs);
   lines.push(x0,t0+.006,z0,x1,t1+.006,z1);
   if(wet){const w0=wl(t0,o0),w1=wl(t1,o1),y=RB.water+.015,a=(ex?z0:x0),b=(ex?z1:x1);
    const f0=foamW(x0,z0,ex,ez,w0),f1=foamW(x1,z1,ex,ez,w1);
    quad(foam,[x0+ex*w0,y,z0+ez*w0,a,0,1],[x0+ex*(w0+f0),y,z0+ez*(w0+f0),a,1,1],[x1+ex*(w1+f1),y,z1+ez*(w1+f1),b,1,1],[x1+ex*w1,y,z1+ez*w1,b,0,1]);}
   // tufts lean out over grassy lips; beach grass on dunes by the sea
   if(grassy||(p.surf==='sand'&&wet&&r()<.45))for(let q=0;q<(p.surf==='long'?3:grassy?2:1);q++){const u=r(),x=x0+(x1-x0)*u-ex*(.06+r()*.22),z=z0+(z1-z0)*u-ez*(.06+r()*.22);
    tufts.push({x,y:h(x,z)-lift,z,s:p.surf==='long'?1+r()*.5:p.surf==='sand'?1.1+r()*.5:.6+r()*.45,col:p.surf==='long'?(r()<.5?0x2f7a2c:0x4f9a3f):p.surf==='sand'?0xb9b25a:(r()<.5?0x4c9a3c:0x72c454),ry:r()*6});}
  }
  ends.push(info);});
 // corners where two exposed sea cliffs meet: close the wedge, the lip and the foam
 const cs:[number,number,number,number,number,boolean,number,boolean][]=[[p.x0,p.z0,0,2,0,false,0,false],[p.x1,p.z0,0,3,0,true,0,false],[p.x0,p.z1,1,2,0,false,0,true],[p.x1,p.z1,1,3,0,true,0,true]];
 for(const [cx,cz,ea,eb,,aEnd,,bEnd] of cs){const ia=ends[ea],ib=ends[eb],ca=aEnd?ia[ia.length-1]:ia[0],cb=bEnd?ib[ib.length-1]:ib[0];if(!ca.ex||!cb.ex||!ca.wet||!cb.wet)continue;
  const na=edges[ea],nb=edges[eb],t=h(cx,cz),ob=offB(cx,cz),ax=na[4],az=na[5],bx=nb[4],bz=nb[5];
  const C:V=[cx,t,cz,cx/tile,cz/tile,.98],La:V=[cx+ax*lip,t-.07,cz+az*lip,cx/tile,cz/tile,.8],Lb:V=[cx+bx*lip,t-.07,cz+bz*lip,cx/tile,cz/tile,.8];tri(top,C,La,Lb);
  const sh=(y:number)=>.42+.5*Math.max(0,Math.min(1,(y-ROT)/1.7)),u=(cx+cz)/2.2;
  quad(side,[La[0],La[1],La[2],u,La[1]/2.2,sh(La[1])],[cx+ax*ob,ROT,cz+az*ob,u,ROT/2.2,sh(ROT)],[cx+bx*ob,ROT,cz+bz*ob,u+.3,ROT/2.2,sh(ROT)],[Lb[0],Lb[1],Lb[2],u+.3,Lb[1]/2.2,sh(Lb[1])]);
  const wv=wl(t,ob),y=RB.water+.015,I:V=[cx+(ax+bx)*wv*.7,y,cz+(az+bz)*wv*.7,u,0,1],fa=foamW(cx,cz,ax,az,wv),fb=foamW(cx,cz,bx,bz,wv),fd=Math.min(fa,fb),O1:V=[cx+ax*(wv+fa),y,cz+az*(wv+fa),u,1,1],O2:V=[cx+bx*(wv+fb),y,cz+bz*(wv+fb),u+.5,1,1],Od:V=[cx+(ax+bx)*(wv+fd)*.75,y,cz+(az+bz)*(wv+fd)*.75,u+.25,1,1];
  tri(foam,I,O1,Od);tri(foam,I,Od,O2);}
 // scatter: long-grass clumps, shells on sand, puddles on mud, gravel on roofs
 const area=W*L,put=(n:number,f:(x:number,z:number)=>Scatter|null,list:Scatter[])=>{for(let i=0;i<n;i++){const x=p.x0+.15+r()*(W-.3),z=p.z0+.15+r()*(L-.3),s=f(x,z);if(s)list.push(s);}};
 if(p.surf==='long')put(Math.round(area*1.1),(x,z)=>({x,y:h(x,z)-lift,z,s:.8+r()*.5,col:r()<.5?0x2f7a2c:0x56a645,ry:r()*6}),tufts);
 if(p.surf==='grass')put(Math.round(area*.12),(x,z)=>({x,y:h(x,z)-lift,z,s:.6+r()*.4,col:0x72c454,ry:r()*6}),tufts);
 if(p.surf==='sand')put(Math.round(area*.3),(x,z)=>({x,y:h(x,z)-lift,z,s:.05+r()*.04,col:r()<.5?0xfff3e6:0xf2b8a8,ry:r()*6,flat:.45}),pebbles);
 if(p.surf==='mud')put(Math.round(area*.6),(x,z)=>({x,y:h(x,z)-lift-.01,z,s:.16+r()*.22,col:r()<.6?0x3b2414:0x553620,ry:r()*6,flat:.08}),pebbles);
 if(p.surf==='stone')put(Math.round(area*.12),(x,z)=>({x,y:h(x,z)-lift,z,s:.04+r()*.04,col:r()<.5?0x8a8274:0x9c9384,ry:r()*6,flat:.6}),pebbles);
}

/* ---------------- the ball: panels from the 12 icosahedron points (pentagons) ---------------- */
function ballGeom(r:number){
 const g=new T.IcosahedronGeometry(r,9).toNonIndexed(),pos=g.getAttribute('position'),n=pos.count,col=new Float32Array(n*3);
 const ico=new T.IcosahedronGeometry(1,0),ip=ico.getAttribute('position'),pent:T.Vector3[]=[],hex:T.Vector3[]=[];
 for(let i=0;i<ip.count;i++){const v=new T.Vector3().fromBufferAttribute(ip,i).normalize();if(!pent.some(q=>q.distanceTo(v)<1e-3))pent.push(v);}
 for(let i=0;i<ip.count;i+=3){const v=new T.Vector3().fromBufferAttribute(ip,i).add(new T.Vector3().fromBufferAttribute(ip,i+1)).add(new T.Vector3().fromBufferAttribute(ip,i+2)).normalize();hex.push(v);}
 ico.dispose();const c=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3(),m=new T.Vector3(),all=[...pent,...hex];
 for(let f=0;f<n;f+=3){a.fromBufferAttribute(pos,f);b.fromBufferAttribute(pos,f+1);m.fromBufferAttribute(pos,f+2);c.copy(a).add(b).add(m).normalize();
  let best=-2,second=-2,bi=0;all.forEach((q,i)=>{const d=c.dot(q);if(d>best){second=best;best=d;bi=i;}else if(d>second)second=d;});
  const ink=bi<12,seam=best-second<.006;const v=seam?.2:ink?.1:.97;
  for(let k=0;k<3;k++){col[(f+k)*3]=v;col[(f+k)*3+1]=v;col[(f+k)*3+2]=ink&&!seam?.13:v;}}
 g.setAttribute('color',new T.BufferAttribute(col,3));g.computeVertexNormals();return g;
}

export type RollballView=ReturnType<typeof createRollballView>;
export function createRollballView(canvas:HTMLCanvasElement,opts:{reduced:boolean;mobile:boolean}){
 const {reduced,mobile}=opts;
 const renderer=new T.WebGLRenderer({canvas,antialias:!mobile,powerPreference:'low-power',alpha:false});
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(56,1,.1,140);
 const ramp=toonRamp(),disposables:{dispose():void}[]=[ramp];
 const own=<X extends {dispose():void}>(x:X)=>{disposables.push(x);return x;};
 /* tops: toon prints; wet tiles, metal and mud get a moving highlight (phong); all carry the baked shade in vertex colours */
 const surfMat=new Map<Surf,T.Material>();
 const matFor=(k:Surf)=>{let m=surfMat.get(k);if(!m){const map=own(surfTex(k));
   m=own(k==='ice'?new T.MeshPhongMaterial({map,vertexColors:true,shininess:90,specular:0x9fdcff,side:T.DoubleSide}):k==='metal'?new T.MeshPhongMaterial({map,vertexColors:true,shininess:60,specular:0x8a96a0,side:T.DoubleSide})
    :k==='mud'?new T.MeshPhongMaterial({map,vertexColors:true,shininess:40,specular:0x4a3a2a,side:T.DoubleSide}):new T.MeshToonMaterial({map,gradientMap:ramp,vertexColors:true,side:T.DoubleSide}));surfMat.set(k,m);}return m;};
 const toon=(color:number|string,extra:Partial<T.MeshToonMaterialParameters>={})=>own(new T.MeshToonMaterial({color,gradientMap:ramp,...extra}));
 const inkMat=own(new T.MeshBasicMaterial({color:INK,side:T.BackSide}));
 const lineMat=own(new T.LineBasicMaterial({color:INK,transparent:true,opacity:.8}));
 const hull=(geo:T.BufferGeometry,scale=1.08)=>{const m=new T.Mesh(geo,inkMat);m.scale.setScalar(scale);return m;};

 /* light: hemisphere + one sun with a shadow that follows the ball */
 const hemi=new T.HemisphereLight(0xffffff,0x444444,1);scene.add(hemi);
 const sun=new T.DirectionalLight(0xffffff,2);sun.castShadow=true;const sm=mobile?512:1024;sun.shadow.mapSize.set(sm,sm);
 Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:1,far:40});sun.shadow.bias=-.0006;sun.shadow.normalBias=.03;sun.shadow.radius=3;scene.add(sun,sun.target);

 /* the sea, the shore foam and the cables share one set of uniforms (time, fog, camera) */
 const WU={uT:{value:0},uA:{value:1},uFog:{value:new T.Color()},uNear:{value:26},uFar:{value:70},uCam:{value:new T.Vector3()},uDeep:{value:new T.Color()},uShallow:{value:new T.Color()},uFoam:{value:new T.Color()}};
 const seaMat=own(new T.ShaderMaterial({uniforms:WU,vertexShader:VERT,fragmentShader:SEA}));
 const foamMat=own(new T.ShaderMaterial({uniforms:WU,vertexShader:VERT,fragmentShader:FOAM,transparent:true,depthWrite:false,side:T.DoubleSide}));
 const poolMat=own(new T.ShaderMaterial({uniforms:{...WU,uA:{value:.8}},vertexShader:VERT,fragmentShader:SEA,transparent:true,depthWrite:false}));
 const water=new T.Mesh(own(new T.PlaneGeometry(240,240)),seaMat);water.rotation.x=-Math.PI/2;water.position.y=RB.water;scene.add(water);
 const backMats:Partial<Record<Theme,T.MeshBasicMaterial>>={};
 const back=new T.Mesh(own(new T.CylinderGeometry(66,66,30,40,1,true)),undefined);back.position.y=RB.water+12;back.renderOrder=-1;scene.add(back);
 const skies:Partial<Record<Theme,T.Texture>>={};const sides:Partial<Record<Theme,T.MeshToonMaterial>>={};
 const fog=new T.Fog(0xffffff,26,70);scene.fog=fog;
 function setTheme(t:Theme){const L=THEME_LOOK[t];
  scene.background=skies[t]??=own(skyTex(L));fog.color.set(L.fog);hemi.color.set(L.hemi[0]);hemi.groundColor.set(L.hemi[1]);hemi.intensity=L.hemi[2];sun.color.set(L.sun[0]);sun.intensity=L.sun[1];
  WU.uFog.value.set(L.fog);WU.uDeep.value.set(L.deep);WU.uShallow.value.set(L.shallow);WU.uFoam.value.set(L.foam);
  back.material=backMats[t]??=(()=>{const tex=own(backTex(t));tex.repeat.set(3,1);return own(new T.MeshBasicMaterial({map:tex,transparent:true,side:T.BackSide,fog:false,depthWrite:false}));})();
  theme=t;lineMat.color.set(L.edge);}
 const sideMat=(t:Theme)=>sides[t]??=own(new T.MeshToonMaterial({map:own(sideTex(t)),gradientMap:ramp,vertexColors:true,side:T.DoubleSide}));
 let theme:Theme=0;

 /* shared shapes (low poly: the scenery is merged, these are reused) */
 const G={
  box:own(new T.BoxGeometry(1,1,1)),cyl:own(new T.CylinderGeometry(1,1,1,18)),cyl8:own(new T.CylinderGeometry(1,1,1,8)),cone:own(new T.ConeGeometry(.25,.62,16)),cone8:own(new T.ConeGeometry(1,1,8)),
  sphere:own(new T.SphereGeometry(1,20,14)),ball8:own(new T.IcosahedronGeometry(1,1)),hump:own(new T.SphereGeometry(1,12,5,0,Math.PI*2,0,Math.PI/2)),
  housing:own(new T.CylinderGeometry(.76,.84,.08,8)),cap:own(new T.CylinderGeometry(.56,.58,.07,24)),ring:own(new T.TorusGeometry(.5,.07,8,28)),lampRing:own(new T.TorusGeometry(.66,.045,6,24)),
  star:own((()=>{const s=new T.Shape();for(let i=0;i<10;i++){const a=i/10*Math.PI*2-Math.PI/2,r=i%2?.16:.36;i?s.lineTo(Math.cos(a)*r,Math.sin(a)*r):s.moveTo(Math.cos(a)*r,Math.sin(a)*r);}
   const g=new T.ExtrudeGeometry(s,{depth:.12,bevelEnabled:true,bevelSize:.03,bevelThickness:.03,bevelSegments:1});g.center();return g;})()),
  disc:own(new T.CircleGeometry(1,24)),splashRing:own(new T.RingGeometry(.82,1,32)),
  tuft:own((()=>{const p:number[]=[];for(let k=0;k<3;k++){const a=k*Math.PI/3,c=Math.cos(a)*.05,s=Math.sin(a)*.05,lx=Math.cos(a+1)*.03,lz=Math.sin(a+1)*.03;p.push(-c,0,-s,c,0,s,lx,.2,lz);}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.computeVertexNormals();return g;})()),
 };
 const crateTex=own(canvasTex(128,(g,s)=>{g.fillStyle='#c98a4a';g.fillRect(0,0,s,s);g.strokeStyle='#a86c3688';for(let y=4;y<s;y+=9){g.beginPath();g.moveTo(0,y);g.lineTo(s,y+3);g.stroke();}
  g.fillStyle='#8a5a2e';g.fillRect(0,0,s,16);g.fillRect(0,s-16,s,16);g.fillRect(0,0,16,s);g.fillRect(s-16,0,16,s);g.save();g.translate(s/2,s/2);g.rotate(Math.PI/4);g.fillRect(-s*.62,-7,s*1.24,14);g.restore();
  g.fillStyle='#3a2a1e';for(const [x,y] of [[8,8],[s-8,8],[8,s-8],[s-8,s-8]]){g.beginPath();g.arc(x,y,3,0,7);g.fill();}g.strokeStyle='#231a2e';g.lineWidth=4;g.strokeRect(2,2,s-4,s-4);},false));
 const M={
  crate:toon('#ffffff',{map:crateTex}),tball:toon('#ff8a3c'),tballBand:toon('#fff3d6'),post:toon('#e9e2d0'),
  switchOff:toon('#f0452e'),switchOn:toon('#19b5a5'),bumper:toon('#e0473a'),bumperTop:toon('#ffc83a'),lock:toon('#ffc83a'),gold:toon('#ffc83a',{emissive:new T.Color('#5a3a00')}),
  lampOff:toon('#f0452e',{emissive:new T.Color('#5a0a00')}),lampOn:toon('#7dffb0',{emissive:new T.Color('#19b56a'),emissiveIntensity:1.2}),
  plank:toon('#ffffff',{map:own(surfTex('wood'))}),liftMat:toon('#9aa6ae',{map:own(surfTex('metal'))}),
  fan:toon('#4a5468'),blade:toon('#e9e2d0'),
  streak:own(new T.MeshBasicMaterial({map:own(canvasTex(32,(g,s)=>{g.clearRect(0,0,s,s);for(let y=0;y<s;y+=8){g.fillStyle='#ffffff';g.fillRect(s/2-5,y,10,5);g.fillStyle='#bfefff';g.fillRect(s/2-8,y+1,3,3);g.fillRect(s/2+5,y+1,3,3);}},true)),transparent:true,depthWrite:false,side:T.DoubleSide,fog:false})),
  net:own(new T.MeshBasicMaterial({map:own(canvasTex(64,(g,s)=>{g.clearRect(0,0,s,s);g.strokeStyle='#fffdf6';g.lineWidth=3;for(let i=0;i<=s;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i,s);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(s,i);g.stroke();}})),transparent:true,side:T.DoubleSide,depthWrite:false})),
  goalPost:toon('#fffdf6'),blob:own(new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.28,depthWrite:false})),line:own(new T.MeshBasicMaterial({color:'#fffdf6'})),
    tuft:own(new T.MeshToonMaterial({color:0xffffff,gradientMap:ramp,side:T.DoubleSide})),pebble:own(new T.MeshToonMaterial({color:0xffffff,gradientMap:ramp})),
  trail:own(new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5,depthWrite:false})),
 };
 const dustTex=own(canvasTex(64,(g,s)=>{g.fillStyle='#ffffff';g.strokeStyle='#231a2e';g.lineWidth=5;g.beginPath();g.arc(s/2,s/2,s/2-5,0,7);g.fill();g.stroke();},false));
 const dropTex=own(canvasTex(64,(g,s)=>{g.fillStyle='#e9fbff';g.strokeStyle='#14607a';g.lineWidth=5;g.beginPath();g.arc(s/2,s/2,s/2-5,0,7);g.fill();g.stroke();},false));
 /* scenery round each module: three merged meshes a module (vertex-coloured toon, an atlas of windows / crowd / boards, lamps) */
 const atlas=own(canvasTex(192,(g)=>{const s=64,r=rng(9);g.fillStyle='#4a5468';g.fillRect(0,0,s,s);for(let y=6;y<s;y+=16)for(let x=6;x<s;x+=16){g.fillStyle=(x*7+y*3)%5<2?'#ffd97a':'#2c3346';g.fillRect(x,y,7,9);}
  g.fillStyle='#2c3346';g.fillRect(s,0,s,s);for(let y=3;y<s;y+=6)for(let x=2;x<s;x+=5){g.fillStyle=['#e0473a','#ffc83a','#f4f0e6','#19b5a5','#4a9fe0','#f39a6a'][Math.floor(r()*6)];g.beginPath();g.arc(s+x+r(),y,1.8,0,7);g.fill();}
  g.fillStyle='#f0452e';g.fillRect(2*s,0,s,s);g.fillStyle='#fff3d6';g.fillRect(2*s,s*.38,s,s*.24);g.fillStyle='#231a2e';g.fillRect(2*s,0,s,4);g.fillRect(2*s,s-4,s,4);},false,64));
 const vcMat=toon('#ffffff',{vertexColors:true}),atlasMat=toon('#ffffff',{map:atlas}),lampMat=own(new T.MeshBasicMaterial({color:'#fff6c8'}));
 const DECO_COL=['#7a5a3a','#3f9a4a','#f4f0e6','#f0452e','#9aa6ae','#fff6c8','#e9cd94','','#19b5a5','#ffc83a','#5fb54a','#2c2a36','','','#4a9fe0','#b9b2a6','#ff8a3c','#a2523e'];
 // 0 trunk, 1 leaves, 2 white, 3 red, 4 grey, 5 lamp, 6 sand, 7 windows, 8 teal, 9 sun, 10 island grass, 11 ink, 12 crowd, 13 ad board, 14 blue, 15 concrete, 16 orange, 17 brick
 const ATLAS:Record<number,number>={7:0,12:1,13:2};
 /** Merges posed copies of shared shapes into one geometry with a colour per part (one draw call). */
 function merger(){const parts:T.BufferGeometry[]=[];
  return {get n(){return parts.length;},
   add(g:T.BufferGeometry,col:string|number,x:number,y:number,z:number,sx=1,sy=1,sz=1,ry=0,rz=0,rx=0,atlasCell=-1){const c=g.index?g.toNonIndexed():g.clone();c.scale(sx,sy,sz);if(rx)c.rotateX(rx);if(rz)c.rotateZ(rz);if(ry)c.rotateY(ry);c.translate(x,y,z);
    for(const k of Object.keys(c.attributes))if(k!=='position'&&k!=='uv')c.deleteAttribute(k);const n=c.getAttribute('position').count;
    if(!c.getAttribute('uv'))c.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(n*2),2));
    if(atlasCell>=0){const uv=c.getAttribute('uv') as T.BufferAttribute;for(let i=0;i<n;i++)uv.setX(i,(atlasCell+Math.min(.98,Math.max(.02,uv.getX(i))))/3);}
    tc.set(col);const ca=new Float32Array(n*3);for(let i=0;i<n;i++){ca[i*3]=tc.r;ca[i*3+1]=tc.g;ca[i*3+2]=tc.b;}c.setAttribute('color',new T.BufferAttribute(ca,3));parts.push(c);},
   build(){if(!parts.length)return null;const m=mergeGeometries(parts);for(const g of parts)g.dispose();parts.length=0;if(m)m.computeVertexNormals();return m;}};}
 function deco(P:World['mods'][number],mi:number,w:World,theme:Theme,group:T.Group,geos:T.BufferGeometry[]){
  const r=rng(mi*7919+P.def.id.length*31+(theme+1)),VC=merger(),AT=merger(),LP=merger();let maxX=3;
  for(let i=P.p0;i<P.p1;i++){const p=w.pieces[i];maxX=Math.max(maxX,Math.abs(p.x0),Math.abs(p.x1));}
  const put=(g:T.BufferGeometry,m:number,x:number,y:number,z:number,sx=1,sy=1,sz=1,ry=0,rz=0)=>{if(m===5)LP.add(g,'#fff6c8',x,y,z,sx,sy,sz,ry,rz);else if(m in ATLAS)AT.add(g,'#ffffff',x,y,z,sx,sy,sz,ry,rz,0,ATLAS[m]);else VC.add(g,DECO_COL[m],x,y,z,sx,sy,sz,ry,rz);};
  const W0=RB.water;
  const isle=(x:number,z:number,rad:number,m:number)=>put(G.hump,m,x,W0-.15,z,rad,.55,rad*.9);
  const tree=(x:number,z:number,s=1)=>{put(G.cyl8,0,x,W0+.9*s,z,.12*s,1.2*s,.12*s);put(G.ball8,1,x,W0+1.9*s,z,.75*s,.8*s,.75*s);put(G.ball8,1,x+.35*s,W0+1.6*s,z+.25*s,.5*s,.5*s,.5*s);put(G.ball8,1,x-.3*s,W0+1.65*s,z-.2*s,.45*s,.45*s,.45*s);};
  const palm=(x:number,z:number,lean:number)=>{for(let j=0;j<6;j++)put(G.cyl8,0,x+lean*j*j*.03,W0+.5+j*.45,z,.13-j*.012,.48,.13-j*.012,0,-lean*j*.06);const tx=x+lean*1.1,ty=W0+3.1;
   for(let j=0;j<6;j++){const a=j*1.047;put(G.cone8,1,tx+Math.cos(a)*.7,ty-.15,z+Math.sin(a)*.7,.22,1.5,.5,-a,Math.PI/2+.35);}put(G.ball8,0,tx,ty,z,.18,.18,.18);};
  const n=Math.max(2,Math.round(P.def.len/4.5));
  for(let k=0;k<n;k++)for(const side of [-1,1]){if(r()<.2)continue;const z=P.z+(k+.3+r()*.4)*P.def.len/n,x=side*(maxX+2.3+r()*3.2),q=r();
   if(theme===0){isle(x,z,1.5,10);
    if(q<.35){tree(x,z,.9+r()*.4);if(r()<.5)tree(x+side*.9,z+.8,.7);}
    else if(q<.55){for(const lx of [-1,1])put(G.box,4,x+lx*1.05,W0+.6,z,.06,.7,.06);put(G.box,13,x,W0+.75,z,2.4,.55,.08,side>0?-Math.PI/2+.2:Math.PI/2-.2);}
    else if(q<.72){put(G.box,0,x,W0+.62,z,.45,.06,1.6);put(G.box,0,x+side*.2,W0+.85,z,.06,.4,1.6);for(const lz of [-.7,.7])put(G.box,11,x,W0+.45,z+lz,.4,.3,.06);}
    else if(q<.86){for(const lz of [-.8,.8])put(G.cyl8,2,x,W0+.75,z+lz,.05,.9,.05);put(G.box,2,x,W0+1.2,z,.07,.07,1.65);put(G.box,11,x+side*.4,W0+.75,z,.04,.04,1.6);}
    else for(let j=0;j<3;j++)put(G.cone8,16,x+(j-1)*.45,W0+.55,z+(r()-.5)*.6,.14,.32,.14);}
   else if(theme===1){isle(x,z,1.6,6);
    if(q<.45){palm(x,z,side*(.4+r()*.5));if(r()<.4)put(G.ball8,4,x-side*.8,W0+.35,z+.6,.35,.22,.3);}
    else if(q<.75){put(G.cyl8,2,x,W0+1.05,z,.04,1.6,.04);put(G.cone8,r()<.5?3:8,x,W0+1.95,z,1.3,.45,1.3);put(G.box,r()<.5?14:16,x+side*.6,W0+.55,z+.5,.5,.06,1.1,0,side*.45);}
    else{for(const [lx,lz] of [[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]])put(G.cyl8,2,x+lx,W0+1.1,z+lz,.05,1.6,.05);put(G.box,2,x,W0+2.1,z,1.1,.7,1.1);put(G.box,3,x,W0+2.55,z,1.3,.12,1.3);put(G.box,3,x,W0+1.9,z,1.12,.12,1.12);}}
   else if(theme===2){const h=1.6+r()*3.2,wd=1.7+r()*1.3,bx=x+side*wd*.35;put(G.box,7,bx,W0+h/2,z,wd,h+.3,wd*1.2);put(G.box,15,bx,W0+h+.22,z,wd*1.06,.14,wd*1.26);
    if(q<.4){for(const [lx,lz] of [[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]])put(G.cyl8,11,bx+lx,W0+h+.55,z+lz,.04,.7,.04);put(G.cyl8,0,bx,W0+h+1.2,z,.5,.75,.5);put(G.cone8,0,bx,W0+h+1.75,z,.55,.35,.55);}
    else if(q<.7){for(const lz of [-.55,.55])put(G.cyl8,4,bx,W0+h+.7,z+lz,.03,1,.03);put(G.box,11,bx,W0+h+1.15,z,.015,.015,1.1);
     [3,14,9].forEach((m,j)=>put(G.box,m,bx,W0+h+.95,z-.35+j*.35,.03,.32,.24));put(G.box,4,bx-side*.4,W0+h+.45,z+.3,.4,.3,.4);}
    else{put(G.box,17,bx+.3,W0+h+.55,z-.3,.3,.75,.3);put(G.box,4,bx-.3,W0+h+.42,z+.35,.5,.35,.45);}}
   else{if(k%2===0){isle(x,z,.9,4);put(G.cyl8,4,x,W0+3.2,z,.11,6.6,.11);put(G.box,11,x,W0+6.5,z,1.5,1,.3);put(G.box,5,x,W0+6.5,z-side*0+(-.17),1.3,.8,.06);}
    else{const sx=x+side*1.2;for(let j=0;j<3;j++)put(G.box,12,sx+side*j*.7,W0+.6+j*.55,z,.7,1.2+j*1.1,3.4);put(G.box,15,sx+side*2.1,W0+2.3,z,.15,4.6,3.4);
     put(G.cyl8,4,sx-side*.1,W0+2.4,z+1.5,.03,1.6,.03);put(G.box,[3,8,9][Math.floor(r()*3)],sx-side*.1,W0+3,z+1.2,.02,.36,.55);}}
  }
  for(const [mg,mat] of [[VC,vcMat],[AT,atlasMat],[LP,lampMat]] as const){const g=mg.build();if(g){geos.push(g);group.add(new T.Mesh(g,mat));}}
 }
 const PLATE_COL:Record<string,string>={latch:'#ffc83a',hold:'#19b5a5',heavy:'#19b5a5',timed:'#ff8a3c',stay:'#8f78b8',order:'#4a9fe0'};
 const plateMat:Record<string,T.MeshToonMaterial>=Object.fromEntries(Object.entries(PLATE_COL).map(([k,c])=>[k,toon(c)]));
 const litMat=toon('#fff3d6',{emissive:new T.Color('#ffc83a'),emissiveIntensity:.8}),ringOff=toon('#5a5866');
 const digitTex=[1,2,3].map(n=>own(canvasTex(64,(g,s)=>{g.clearRect(0,0,s,s);g.font='900 46px Arial';g.textAlign='center';g.textBaseline='middle';g.lineWidth=8;g.strokeStyle='#231a2e';g.strokeText(String(n),s/2,s/2+2);g.fillStyle='#fff3d6';g.fillText(String(n),s/2,s/2+2);},false)));
 const digitMat=digitTex.map(t=>own(new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false})));
 const iconTex=own(canvasTex(64,(g,s)=>{g.clearRect(0,0,s,s);g.fillStyle='#231a2e';g.fillRect(16,26,32,26);g.fillRect(26,14,12,14);},false)),iconMat=own(new T.MeshBasicMaterial({map:iconTex,transparent:true,depthWrite:false}));
 const quadGeo=own(new T.PlaneGeometry(1,1));
 const coneVC=own((()=>{const g=new T.ConeGeometry(.25,.62,12,4).toNonIndexed(),pa=g.getAttribute('position'),n=pa.count,ca=new Float32Array(n*3),o=new T.Color('#ff7a2a'),wt=new T.Color('#fff3d6');
  for(let f=0;f<n;f+=3){const y=(pa.getY(f)+pa.getY(f+1)+pa.getY(f+2))/3,c=Math.abs(y-.02)<.07?wt:o;for(let k=0;k<3;k++){ca[(f+k)*3]=c.r;ca[(f+k)*3+1]=c.g;ca[(f+k)*3+2]=c.b;}}g.setAttribute('color',new T.BufferAttribute(ca,3));g.computeVertexNormals();return g;})());

 /* the ball */
 const ballGeo=own(ballGeom(RB.r)),ball=new T.Group(),ballMesh=new T.Mesh(ballGeo,own(new T.MeshStandardMaterial({vertexColors:true,roughness:.42,metalness:0})));
 ballMesh.castShadow=true;const ballHull=hull(own(new T.SphereGeometry(RB.r,24,16)),1.09);ball.add(ballMesh,ballHull);scene.add(ball);
 const blob=new T.Mesh(G.disc,M.blob);blob.rotation.x=-Math.PI/2;blob.renderOrder=2;scene.add(blob);
 const carried=new T.Group();{const w=whistle();carried.add(w);}carried.visible=false;scene.add(carried);
 function whistle(){const g=new T.Group(),b=new T.Mesh(G.cyl,M.gold);b.scale.set(.14,.34,.14);b.rotation.z=Math.PI/2;const r=new T.Mesh(G.ring,M.gold);r.scale.setScalar(.28);r.position.x=-.22;g.add(b,r,(()=>{const h=hull(G.cyl,1);h.scale.set(.16,.37,.16);h.rotation.z=Math.PI/2;return h;})());return g;}

 /* pools: dust / spray (tinted per surface), drops, splash rings, the rolled track */
 type Part={s:T.Sprite;t:number;life:number;vx:number;vy:number;vz:number;g:number};
 const mkPool=(n:number,tex:T.Texture)=>Array.from({length:n},()=>{const s=new T.Sprite(own(new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false})));s.visible=false;scene.add(s);return {s,t:0,life:0,vx:0,vy:0,vz:0,g:2} as Part;});
 const dust=mkPool(reduced?12:32,dustTex),drops=mkPool(reduced?8:24,dropTex);
 const rings=Array.from({length:3},()=>{const m=new T.Mesh(G.splashRing,own(new T.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false,side:T.DoubleSide})));m.rotation.x=-Math.PI/2;m.visible=false;scene.add(m);return {m,t:9,d:0};});
 const TRAIL=110,trail=new T.InstancedMesh(G.disc,M.trail,TRAIL);trail.count=0;trail.renderOrder=1;trail.frustumCulled=false;scene.add(trail);let trailN=0,trailLast={x:1e9,z:1e9};
 const tm=new T.Matrix4(),tq=new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),-Math.PI/2),tv=new T.Vector3(),ts=new T.Vector3(),tc=new T.Color(),te=new T.Euler();
 const SURF_DUST:Partial<Record<Surf,number>>={grass:0xb7e08a,long:0x5aa847,sand:0xf3d9a4,mud:0x6b4a2e,ice:0xe9fbff,wood:0xe6c08a,stone:0xd8d0c2,metal:0xdde4ea,rubber:0xffd0c0};
 const TRACK:Partial<Record<Surf,number>>={sand:0xc79e62,mud:0x3b2414,long:0x2a6a26};
 const puff=(pool:Part[],x:number,y:number,z:number,n:number,spd:number,size:number,col=0xfff3d6,grav=2)=>{let k=0;for(const p of pool){if(k>=n)break;if(p.t<p.life)continue;k++;const a=Math.random()*Math.PI*2;
  p.t=0;p.life=.45+Math.random()*.3;p.g=grav;p.vx=Math.cos(a)*spd*(.5+Math.random());p.vz=Math.sin(a)*spd*(.5+Math.random());p.vy=spd*(.4+Math.random()*.8);p.s.position.set(x,y,z);p.s.scale.setScalar(size);p.s.material.color.setHex(col);p.s.visible=true;}};

 /* ---------------- the level ---------------- */
 type ModView={group:T.Group;disposed:boolean;geos:T.BufferGeometry[];extra:{dispose():void}[]};
 let world:World|null=null,mods:ModView[]=[];
 const dyn:{piece:number;mesh:T.Object3D}[]=[],plates:{i:number;cap:T.Mesh;ring:T.Mesh;timer?:T.Mesh}[]=[],posts:{i:number;g:T.Group;parts:T.Object3D[];fly:number;vel:T.Vector3[]}[]=[];
 const objs:{i:number;g:T.Object3D}[]=[],picks:{i:number;g:T.Object3D}[]=[],pools:{i:number;m:T.Mesh}[]=[],fans:{i:number;blades:T.Object3D;streaks:T.Mesh}[]=[];
 const gates:{i:number;lamps:T.Mesh[]}[]=[],bridges:{i:number;mesh:T.InstancedMesh;n:number;step:number}[]=[],cables:{mat:T.ShaderMaterial;src:()=>boolean}[]=[];
 let net:{mesh:T.Mesh;base:Float32Array;t:number}|null=null,tufts:T.InstancedMesh|null=null,pebbles:T.InstancedMesh|null=null;
 function clearLevel(){for(const m of mods)disposeMod(m);mods=[];dyn.length=plates.length=posts.length=objs.length=picks.length=pools.length=fans.length=gates.length=bridges.length=cables.length=0;net=null;trail.count=0;trailN=0;
  for(const im of [tufts,pebbles])if(im){scene.remove(im);im.dispose();}tufts=pebbles=null;}
 function disposeMod(m:ModView){if(m.disposed)return;m.disposed=true;scene.remove(m.group);for(const g of m.geos)g.dispose();for(const x of m.extra)x.dispose();}
 const instanced=(geo:T.BufferGeometry,mat:T.Material,list:Scatter[],cap:number)=>{const n=Math.min(cap,list.length);if(!n)return null;const im=new T.InstancedMesh(geo,mat,n);
  for(let i=0;i<n;i++){const s=list[i];te.set(0,s.ry,0);tq2.setFromEuler(te);tv.set(s.x,s.y,s.z);ts.set(s.s,s.flat?s.s*s.flat:s.s,s.s);tm.compose(tv,tq2,ts);im.setMatrixAt(i,tm);im.setColorAt(i,tc.setHex(s.col));}
  im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.computeBoundingSphere();scene.add(im);return im;};
 const tq2=new T.Quaternion();
 function setWorld(w:World){
  clearLevel();world=w;lastMod=-1;setTheme(w.mods[0].def.theme);const allTufts:Scatter[]=[],allPebbles:Scatter[]=[];
  w.mods.forEach((P,mi)=>{const th:Theme=P.def.id==='goal'&&mi>0?w.mods[mi-1].def.theme:P.def.theme;// the goal wears the level's last theme
   const group=new T.Group(),geos:T.BufferGeometry[]=[],extra:{dispose():void}[]=[],ST=merger();const tops=new Map<Surf,Acc>(),side=acc(),foam=acc(),lines:number[]=[];
   let nth=0;for(let i=P.p0;i<P.p1;i++){const p=w.pieces[i];if(p.role!==0||p.hidden)continue;let a=tops.get(p.surf);if(!a){a=acc();tops.set(p.surf,a);}pieceGeom(w,i,mi,a,side,foam,lines,allTufts,allPebbles,(nth++)*.0015);}
   for(const [k,a] of tops){const g=geom(a);if(!g)continue;geos.push(g);const m=new T.Mesh(g,matFor(k));m.receiveShadow=true;group.add(m);}
   {const g=geom(side);if(g){geos.push(g);const m=new T.Mesh(g,sideMat(th));m.receiveShadow=true;group.add(m);}}
   {const g=geom(foam,false);if(g){geos.push(g);const m=new T.Mesh(g,foamMat);m.renderOrder=1;group.add(m);}}
   if(lines.length){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(lines,3));geos.push(g);group.add(new T.LineSegments(g,lineMat));}
   const add=(o:T.Object3D)=>{group.add(o);return o;};
   // receivers: gates (posts, lamps, a rail-and-bar frame that sinks), bridges (planks that unfold), lifts (a deck on rails), pools, fans
   for(let i=P.r0;i<P.r1;i++){const r=w.recvs[i];
    if(r.kind==='gate'){const p=w.pieces[r.piece],h=r.wy,W=p.x1-p.x0,zc=(p.z0+p.z1)/2,frame=new T.Group();
     const FR=merger();FR.add(G.box,'#f0452e',(p.x0+p.x1)/2,h+.12,zc,W,.18,.3);FR.add(G.box,'#f0452e',(p.x0+p.x1)/2,h+1.0,zc,W,.18,.3);const nb=Math.max(2,Math.round(W/.32));for(let k=0;k<nb;k++)FR.add(G.cyl8,'#f4f0e6',p.x0+W*(k+.5)/nb,h+.56,zc,.05,.9,.05);
     {const g=FR.build()!;geos.push(g);const m=new T.Mesh(g,vcMat);m.castShadow=true;frame.add(m);}
     add(frame);dyn.push({piece:r.piece,mesh:frame});const lamps:T.Mesh[]=[];
     for(const x of [p.x0-.16,p.x1+.16]){const ph=h+1.45-RB.water;ST.add(G.box,'#4a5468',x,RB.water+ph/2,zc,.26,ph,.4);ST.add(G.box,'#2c2a36',x,h+1.42,zc,.32,.08,.46);const l=new T.Mesh(G.sphere,M.lampOff);l.scale.setScalar(.15);l.position.set(x,h+1.56,zc);add(l);lamps.push(l);}
     ST.add(G.box,'#4a5468',(p.x0+p.x1)/2,h-.1,zc,W,.2,p.z1-p.z0);gates.push({i,lamps});}
    else if(r.kind==='bridge'){const p=w.pieces[r.piece],n=Math.max(3,Math.round((p.z1-p.z0)/.34)),step=(p.z1-p.z0)/n,g=new T.BoxGeometry(p.x1-p.x0-.06,.12,step-.04);geos.push(g);
     const im=new T.InstancedMesh(g,M.plank,n);im.castShadow=true;im.receiveShadow=true;im.frustumCulled=false;extra.push(im);add(im);bridges.push({i,mesh:im,n,step});
     // the abutment posts each end
     for(const z of [p.z0-.1,p.z1+.1])for(const x of [p.x0-.08,p.x1+.08]){const ph=r.wy+.45-RB.water;ST.add(G.cyl8,'#7a5a3a',x,RB.water+ph/2,z,.09,ph,.09);}}
    else if(r.kind==='lift'){const p=w.pieces[r.piece],dg=new T.BoxGeometry(p.x1-p.x0,.35,p.z1-p.z0);dg.translate((p.x0+p.x1)/2,-.175,(p.z0+p.z1)/2);geos.push(dg);
     const deck=new T.Mesh(dg,M.liftMat);deck.castShadow=true;deck.receiveShadow=true;const gg=new T.Group();gg.add(deck);add(gg);dyn.push({piece:r.piece,mesh:gg});
     const rh=r.h+.6-RB.water;for(const x of [p.x0-.1,p.x1+.1])for(const z of [p.z0+.2,p.z1-.2]){ST.add(G.box,'#ffc83a',x,RB.water+rh/2,z,.12,rh,.12);}}
    else if(r.kind==='drain'){const m=new T.Mesh(quadGeo,poolMat);m.scale.set(r.x1-r.x0,r.z1-r.z0,1);m.rotation.x=-Math.PI/2;m.position.set((r.x0+r.x1)/2,r.wy,(r.z0+r.z1)/2);add(m);pools.push({i,m});}
    else if(r.kind==='fan'){const g=new T.Group(),house=new T.Mesh(G.cyl,M.fan);house.scale.set(1.15,.5,1.15);const blades=new T.Group();for(let k=0;k<5;k++){const b=new T.Mesh(G.box,M.blade);b.scale.set(.22,.05,.95);b.position.z=.5;b.rotation.z=.35;const arm=new T.Group();arm.rotation.y=k*Math.PI*2/5;arm.add(b);blades.add(arm);}
     blades.position.y=.3;const h=hull(G.cyl,1);h.scale.set(1.2,.52,1.2);const grill=new T.Mesh(G.ring,M.fan);grill.rotation.x=Math.PI/2;grill.scale.setScalar(2.2);grill.position.y=.32;g.add(house,blades,h,grill);
     g.position.set((r.x0+r.x1)/2,RB.water+.3,(r.z0+r.z1)/2);add(g);
     const sp:T.BufferGeometry[]=[],fr=rng(i*17);for(let k=0;k<14;k++){const c=new T.PlaneGeometry(.26,3.4);c.rotateY(k%2?Math.PI/2:0);c.rotateY(fr()*.6-.3);c.translate(r.x0+.3+fr()*(r.x1-r.x0-.6),RB.water+1.6+fr()*.6,r.z0+.4+fr()*(r.z1-r.z0-.8));sp.push(c);}
     const sg=mergeGeometries(sp);for(const x of sp)x.dispose();geos.push(sg);const streaks=new T.Mesh(sg,M.streak);streaks.visible=false;add(streaks);fans.push({i,blades,streaks});}}
   // plates: a dark housing, a coloured cap that sinks when pressed, a lamp ring that lights with its signal
   for(let i=P.pl0;i<P.pl1;i++){const pl=w.plates[i],cap=new T.Mesh(G.cap,plateMat[pl.kind]),ring=new T.Mesh(G.lampRing,ringOff);
    ST.add(G.housing,'#3a3846',pl.x,pl.y+.04,pl.z);cap.position.set(pl.x,pl.y+.1,pl.z);cap.receiveShadow=true;ring.rotation.x=-Math.PI/2;ring.position.set(pl.x,pl.y+.085,pl.z);add(cap);add(ring);
    const rec:{i:number;cap:T.Mesh;ring:T.Mesh;timer?:T.Mesh}={i,cap,ring};
    if(pl.kind==='order'||pl.kind==='heavy'){const d=new T.Mesh(quadGeo,pl.kind==='order'?digitMat[Math.min(2,pl.idx)]:iconMat);d.scale.setScalar(pl.kind==='order'?.7:.6);d.rotation.set(-Math.PI/2,0,Math.PI);/* the camera looks along +z: turned so the number reads upright */d.position.set(pl.x,pl.y+.142,pl.z);d.renderOrder=3;add(d);}
    if(pl.kind==='timed'||pl.kind==='stay'){const t=new T.Mesh(G.ring,litMat);t.rotation.x=-Math.PI/2;t.position.set(pl.x,pl.y+.15,pl.z);t.scale.setScalar(.8);add(t);rec.timer=t;}
    plates.push(rec);}
   for(let i=P.po0;i<P.po1;i++){const po=w.posts[i],g=new T.Group();g.position.set(po.x,po.y,po.z);const parts:T.Object3D[]=[];
    if(po.kind==='cone'){for(let k=0;k<3;k++){const c=new T.Group(),m=new T.Mesh(coneVC,vcMat);c.add(m);if(k===2)c.add(hull(G.cone,1.1));
      c.position.set(0,.31+k*.17,0);g.add(c);parts.push(c);/* a tall stack of three training cones, each rim showing */}}
    else if(po.kind==='bumper'){const b=new T.Mesh(G.cyl,M.bumper);b.scale.set(po.r,.7,po.r);b.position.y=.35;const t=new T.Mesh(G.cyl,M.bumperTop);t.scale.set(po.r*.7,.08,po.r*.7);t.position.y=.72;const h=hull(G.cyl,1);h.scale.set(po.r*1.08,.74,po.r*1.08);h.position.y=.35;g.add(b,t,h);parts.push(b);}
    else{const p=new T.Mesh(G.cyl,M.post);p.scale.set(po.r*.6,1.1,po.r*.6);p.position.y=.55;const h=hull(G.cyl,1);h.scale.set(po.r*.68,1.12,po.r*.68);h.position.y=.55;g.add(p,h);
     if(po.kind==='switch'){const lever=new T.Group(),bar=new T.Mesh(G.box,M.switchOff);bar.scale.set(.12,.7,.12);bar.position.y=.35;const knob=new T.Mesh(G.sphere,M.switchOff);knob.scale.setScalar(.16);knob.position.y=.72;lever.add(bar,knob);lever.position.y=1.05;lever.rotation.x=-.6;g.add(lever);parts.push(lever,bar,knob);}
     else{const lk=new T.Mesh(G.box,M.lock);lk.scale.set(.5,.46,.22);lk.position.y=1.2;const sh=new T.Mesh(G.ring,M.lock);sh.scale.setScalar(.36);sh.position.y=1.46;const kh=new T.Mesh(G.box,inkMat);kh.scale.set(.08,.18,.25);kh.position.y=1.18;g.add(lk,sh,kh,(()=>{const h=hull(G.box,1);h.scale.set(.56,.52,.28);h.position.y=1.2;return h;})());parts.push(lk,sh);}}
    add(g);posts.push({i,g,parts,fly:0,vel:parts.map(()=>new T.Vector3())});}
   // signal cables: each plate / switch / cone / lock to what it opens, laid on the ground; dashes flow when the signal is on
   {const srcs:{x:number;z:number;y:number;sig:number;col:string;on:()=>boolean}[]=[];
    for(let i=P.pl0;i<P.pl1;i++){const p=w.plates[i];srcs.push({x:p.x,z:p.z,y:p.y,sig:p.sig,col:PLATE_COL[p.kind],on:()=>p.lit});}
    for(let i=P.po0;i<P.po1;i++){const p=w.posts[i];if(p.sig<0)continue;const sg=p.sig;srcs.push({x:p.x,z:p.z,y:p.y,sig:sg,col:p.kind==='switch'?'#19b5a5':p.kind==='lock'?'#ffc83a':'#ff7a2a',on:()=>w.sig[sg]});}
    for(const s of srcs)for(let i=P.r0;i<P.r1;i++){const r=w.recvs[i];if(!r.need.includes(s.sig))continue;
     let tx:number,tz:number;
     if(r.kind==='gate'){tx=Math.abs(s.x-r.x0)<Math.abs(s.x-r.x1)?r.x0+.25:r.x1-.25;tz=s.z<r.z0?r.z0-.25:r.z1+.25;}
     else if(r.kind==='bridge'||r.kind==='fan'){tx=Math.max(r.x0+.2,Math.min(r.x1-.2,s.x));tz=s.z<(r.z0+r.z1)/2?r.z0-.3:r.z1+.3;}
     else{tx=Math.max(r.x0-.3,Math.min(r.x1+.3,s.x));tz=Math.max(r.z0-.3,Math.min(r.z1+.3,s.z));if(tx>r.x0&&tx<r.x1&&tz>r.z0&&tz<r.z1)tz=r.z0-.3;}
     const dx=tx-s.x,dz=tz-s.z,d=Math.hypot(dx,dz);if(d<.9)continue;const ux=dx/d,uz=dz/d,start=.72,n=Math.max(2,Math.ceil((d-start)/.22)),a=acc(),hw=.06;
     const hs:number[]=[];for(let k=0;k<=n;k++){const t=start+(d-start)*k/n,x=s.x+ux*t,z=s.z+uz*t;hs.push(stillTop(w,x,z,mi-1,mi+1));}
     const y0=hs.find(v=>v>-Infinity)??s.y;let last=y0;for(let k=0;k<=n;k++){if(hs[k]===-Infinity)hs[k]=last;else last=hs[k];}
     for(let k=0;k<n;k++){const t0=start+(d-start)*k/n,t1=start+(d-start)*(k+1)/n,x0=s.x+ux*t0,z0=s.z+uz*t0,x1=s.x+ux*t1,z1=s.z+uz*t1,ya=hs[k]+.03,yb=hs[k+1]+.03;
      quad(a,[x0-uz*hw,ya,z0+ux*hw,t0,0,1],[x1-uz*hw,yb,z1+ux*hw,t1,0,1],[x1+uz*hw,yb,z1-ux*hw,t1,1,1],[x0+uz*hw,ya,z0-ux*hw,t0,1,1]);}
     const g=geom(a,false);if(!g)continue;geos.push(g);const mat=new T.ShaderMaterial({uniforms:{...WU,uOn:{value:0},uFlash:{value:0},uCol:{value:new T.Color(s.col)}},vertexShader:VERT,fragmentShader:CABLE,side:T.DoubleSide});
     extra.push(mat);const m=new T.Mesh(g,mat);m.renderOrder=1;add(m);cables.push({mat,src:s.on});}}
   for(let i=P.o0;i<P.o1;i++){const o=w.objs[i];let g:T.Object3D;
    if(o.kind==='crate'){const gg=new T.Group(),m=new T.Mesh(G.box,M.crate);m.scale.setScalar(.9);m.castShadow=true;m.receiveShadow=true;const h=hull(G.box,1);h.scale.setScalar(.95);gg.add(m,h);g=gg;}
    else{const gg=new T.Group(),m=new T.Mesh(G.sphere,M.tball);m.scale.setScalar(o.r);m.castShadow=true;const band=new T.Mesh(G.ring,M.tballBand);band.scale.setScalar(o.r*1.9);band.rotation.y=Math.PI/2;const h=hull(G.sphere,1);h.scale.setScalar(o.r*1.1);gg.add(m,band,h);g=gg;}
    add(g);objs.push({i,g});}
   for(let i=P.k0;i<P.k1;i++){const k=w.picks[i];let g:T.Object3D;if(k.kind==='star'){const gg=new T.Group(),m=new T.Mesh(G.star,M.gold);gg.add(m,hull(G.star,1.14));g=gg;}else g=whistle();g.position.set(k.x,k.y,k.z);add(g);picks.push({i,g});}
   if(P.goal){const [gx,gz]=P.goal,gg=new T.Group(),gy=stillTop(w,gx,gz,mi,mi);const y0=gy>-Infinity?gy:0;
    for(const x of [-1.75,1.75]){const p=new T.Mesh(G.cyl,M.goalPost);p.scale.set(.1,1.5,.1);p.position.set(gx+x,y0+.75,gz-.55);p.castShadow=true;gg.add(p);const s=new T.Mesh(G.cyl8,M.goalPost);s.scale.set(.04,1.6,.04);s.rotation.x=-.75;s.position.set(gx+x,y0+.85,gz+.2);gg.add(s);}
    const bar=new T.Mesh(G.cyl,M.goalPost);bar.scale.set(.1,3.6,.1);bar.rotation.z=Math.PI/2;bar.position.set(gx,y0+1.5,gz-.55);bar.castShadow=true;gg.add(bar);
    const line=new T.Mesh(quadGeo,M.line);line.scale.set(3.6,.1,1);line.rotation.x=-Math.PI/2;line.position.set(gx,y0+.012,gz-.55);gg.add(line);
    const ng=new T.PlaneGeometry(3.5,1.5,10,5);geos.push(ng);const nm=new T.Mesh(ng,M.net);nm.position.set(gx,y0+.75,gz+.88);gg.add(nm);net={mesh:nm,base:Float32Array.from(ng.getAttribute('position').array as ArrayLike<number>),t:9};
    for(const x of [-1.72,1.72]){const s=new T.Mesh(quadGeo,M.net);s.scale.set(1.45,1.5,1);s.rotation.y=Math.PI/2;s.position.set(gx+x,y0+.75,gz+.17);gg.add(s);}
    const roof=new T.Mesh(quadGeo,M.net);roof.scale.set(3.5,1.45,1);roof.rotation.x=Math.PI/2;roof.position.set(gx,y0+1.5,gz+.17);gg.add(roof);add(gg);}
   deco(P,mi,w,th,group,geos);
   {const g=ST.build();if(g){geos.push(g);const m=new T.Mesh(g,vcMat);m.receiveShadow=true;group.add(m);}}
   scene.add(group);mods.push({group,disposed:false,geos,extra});});
  tufts=instanced(G.tuft,M.tuft,allTufts,700);pebbles=instanced(G.ball8,M.pebble,allPebbles,260);
 }

 /* ---------------- per frame ---------------- */
 const camPos=new T.Vector3(0,6,-6),camLook=new T.Vector3(0,0,3),q=new T.Quaternion(),ax=new T.Vector3();const UP=new T.Vector3(0,1,0),XA=new T.Vector3(1,0,0),nv=new T.Vector3();let slopeX=0,slopeZ=0,climb=0,taught=false,flashT=0;let squash=0,shake=0,lastT=0,lastMod=-1,sprayT=0;const prev={x:0,z:0};
 let lastSurf:Surf='grass';
 const shakeIt=(a:number)=>{if(reduced)return;shake=Math.max(shake,a);};
 function onEvent(e:RollEvent){
  switch(e.type){
   case 'plate':if(!taught){taught=true;flashT=1.8;}break;
   case 'land':if(e.a>2.2){squash=reduced?0:Math.min(.35,e.a*.04);puff(dust,e.x,e.y-RB.r+.05,e.z,Math.min(8,Math.round(e.a)),1.4,.26,SURF_DUST[lastSurf]??0xfff3d6);if(e.a>6)shakeIt(.12);}break;
   case 'splash':{puff(drops,e.x,RB.water+.1,e.z,reduced?6:18,3.2,.3,0xffffff,9);let k=0;for(const r of rings){if(r.t<1){continue;}r.t=0;r.d=k*.16;r.m.position.set(e.x,RB.water+.03,e.z);k++;if(k>=3)break;}if(e.a<0)shakeIt(.18);break;}
   case 'cone':{const p=posts.find(o=>o.i===e.a);if(p){p.fly=1;p.vel.forEach((v,k)=>v.set((Math.random()-.5)*3,3+k*1.2,2.5+Math.random()*2));}puff(dust,e.x,e.y+.2,e.z,6,1.6,.3);shakeIt(.1);break;}
   case 'goal':if(net)net.t=0;puff(dust,e.x,e.y,e.z,10,2,.3);break;
   case 'bump':{const p=posts.find(o=>o.i===e.a);if(p)p.fly=-.25;break;}
   case 'gate':if(e.b===1)puff(dust,e.x,e.y+.1,e.z,5,1.2,.32);break;
   case 'star':puff(dust,e.x,e.y,e.z,6,2.2,.2,0xffe27a);break;
   case 'respawn':case 'level':trail.count=0;trailN=0;break;
  }
 }
function render(s:RollState,now:number){
  const w=s.world;if(w!==world)setWorld(w);
  const dt=lastT?Math.min(.05,(now-lastT)/1000):0;lastT=now;const b=s.ball;lastSurf=b.surf;WU.uT.value=now/1000;
  // dispose modules two behind the ball (they are never visited again); draw only one behind and two ahead
  if(s.mod!==lastMod){lastMod=s.mod;for(let k=0;k<s.mod-1&&k<mods.length;k++)disposeMod(mods[k]);if(w.mods[s.mod].def.theme!==theme&&w.mods[s.mod].def.id!=='goal')setTheme(w.mods[s.mod].def.theme);
}
  {const into=b.z-w.mods[s.mod].z;mods.forEach((m,k)=>{m.group.visible=k<=s.mod+2&&(k>=s.mod||(k===s.mod-1&&into<8));});}
  // ball: position, roll (panels turn by the distance rolled), squash on a hard stop
  ball.position.set(b.x,b.y,b.z);
  const sp=Math.hypot(b.vx,b.vz),mx=b.x-prev.x,mz=b.z-prev.z,md=Math.hypot(mx,mz);prev.x=b.x;prev.z=b.z;
  if(md>1e-5&&md<2){ax.set(mz,0,-mx).normalize();q.setFromAxisAngle(ax,md/RB.r);ballMesh.quaternion.premultiply(q);}
  squash=Math.max(0,squash-dt*2.5);const sq=reduced?0:squash*Math.sin(Math.min(1,squash*6)*Math.PI);ball.scale.set(1+sq*.5,1-sq,1+sq*.5);ball.position.y-=sq*RB.r;
  ballHull.quaternion.copy(ballMesh.quaternion);
  // contact shadow straight below: smaller, softer and lighter with height
  let gh=-Infinity,gp:Piece|null=null;for(let i=w.mods[Math.max(0,s.mod-1)].p0;i<w.mods[Math.min(w.mods.length-1,s.mod+1)].p1;i++){const p=w.pieces[i];if(p.hidden||b.x<p.x0||b.x>p.x1||b.z<p.z0||b.z>p.z1)continue;const t=topAt(p,b.x,b.z);if(t<=b.y-RB.r+.3&&t>gh){gh=t;gp=p;}}
  // the shadow lies on the slope (tilted to the ground under the ball), and the camera rises on a climb
  slopeX=slopeZ=0;if(gp){const c=(v:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,v)),sx=c(b.x,gp.x0+.15,gp.x1-.15),sz=c(b.z,gp.z0+.15,gp.z1-.15);slopeX=(topAt(gp,sx+.15,sz)-topAt(gp,sx-.15,sz))/.3;slopeZ=(topAt(gp,sx,sz+.15)-topAt(gp,sx,sz-.15))/.3;if(Math.abs(slopeX)>1.2||Math.abs(slopeZ)>1.2)slopeX=slopeZ=0;}
  blob.quaternion.setFromUnitVectors(UP,nv.set(-slopeX,1,-slopeZ).normalize()).multiply(q.setFromAxisAngle(XA,-Math.PI/2));
  if(gh===-Infinity)gh=RB.water;{const hgt=Math.max(0,b.y-RB.r-gh);blob.position.set(b.x,gh+.025,b.z);blob.scale.setScalar(RB.r*Math.max(.55,1.05-hgt*.12));M.blob.opacity=Math.max(.05,.34-hgt*.07);}
  carried.visible=b.key;if(b.key){carried.position.set(b.x,b.y+.75+Math.sin(now/240)*.06,b.z);carried.rotation.y=now/500;}
  // the rolled track on sand, mud and long grass; spray kicked up by speed
  const tcol=TRACK[b.surf];
  if(!b.air&&tcol!==undefined&&Math.hypot(b.x-trailLast.x,b.z-trailLast.z)>.3){trailLast={x:b.x,z:b.z};tv.set(b.x,gh+.014,b.z);ts.set(.17,.17,.17);tm.compose(tv,tq,ts);const k=trailN%TRAIL;trail.setMatrixAt(k,tm);trail.setColorAt(k,tc.setHex(tcol));trailN++;trail.count=Math.min(TRAIL,trailN);trail.instanceMatrix.needsUpdate=true;if(trail.instanceColor)trail.instanceColor.needsUpdate=true;}
  if(!b.air&&!reduced&&sp>2.4){sprayT+=dt*sp*(b.surf==='sand'||b.surf==='mud'||b.surf==='ice'?2.2:1);while(sprayT>1){sprayT-=1;const k=-.3/Math.max(.1,sp);puff(dust,b.x+b.vx*k,gh+.08,b.z+b.vz*k,1,.9,b.surf==='mud'?.16:.13,SURF_DUST[b.surf]??0xfff3d6,b.surf==='ice'?6:4);}}
  // moving pieces, plates, posts, objects, pickups, pools, fans, net
  for(const d of dyn){const p=w.pieces[d.piece];d.mesh.position.y=p.dy;}
  for(const g of gates){const r=w.recvs[g.i];for(const l of g.lamps)l.material=r.open>.5?M.lampOn:M.lampOff;}
  for(const br of bridges){const r=w.recvs[br.i],p=w.pieces[r.piece];
   for(let k=0;k<br.n;k++){const t=Math.max(0,Math.min(1,(r.open*(br.n+4)-k)/4));if(t<=0){tv.set(0,-50,0);ts.set(0,0,0);tm.compose(tv,tq2.identity(),ts);br.mesh.setMatrixAt(k,tm);continue;}
    const th=(1-t)*Math.PI/2,hz=p.z0+k*br.step;te.set(th,0,0);tq2.setFromEuler(te);tv.set((p.x0+p.x1)/2,r.wy-.06-Math.sin(th)*br.step/2,hz+Math.cos(th)*br.step/2);ts.set(1,1,1);tm.compose(tv,tq2,ts);br.mesh.setMatrixAt(k,tm);}
   br.mesh.instanceMatrix.needsUpdate=true;}
  // the first plate pressed in a session makes its cable flash bright a few times: "this line opens that" with no words
  if(flashT>0)flashT=Math.max(0,flashT-dt);const fl=flashT>0?Math.max(0,Math.sin((1.8-flashT)*14))*Math.min(1,flashT*2):0;
  for(const c of cables){const u=c.mat.uniforms.uOn,want=c.src()?1:0;u.value+=(want-u.value)*Math.min(1,dt*6);c.mat.uniforms.uFlash.value=want&&!reduced?fl:0;}
  for(const pl of plates){const p=w.plates[pl.i];pl.cap.position.y=p.y+(p.pressed?.055:.1);pl.cap.material=p.lit?litMat:plateMat[p.kind];pl.ring.material=p.lit||p.pressed?litMat:ringOff;
   if(pl.timer){const f=p.kind==='timed'?(p.T?p.timer/p.T:0):(p.lit?1:p.T?Math.min(1,p.timer/p.T):0);pl.timer.visible=f>0;pl.timer.scale.setScalar(.5+.4*f);}}
  for(const po of posts){const p=w.posts[po.i];
   if(p.kind==='cone'){if(po.fly>0){po.parts.forEach((c,k)=>{const v=po.vel[k];v.y-=14*dt;c.position.addScaledVector(v,dt);c.rotation.x+=dt*(6+k);c.rotation.z+=dt*(3-k);if(c.position.y<-3)c.visible=false;});}else if(!p.down)po.parts.forEach((c,k)=>{c.position.set(0,.21+k*.07,0);c.rotation.set(0,0,0);c.visible=true;});else for(const c of po.parts)c.visible=false;}
   else if(p.kind==='switch'){const lever=po.parts[0];lever.rotation.x+=((p.on?.6:-.6)-lever.rotation.x)*Math.min(1,dt*14);const m=p.on?M.switchOn:M.switchOff;(po.parts[1] as T.Mesh).material=m;(po.parts[2] as T.Mesh).material=m;}
   else if(p.kind==='bumper'){if(po.fly<0){po.fly=Math.min(0,po.fly+dt);const k=1+Math.sin(-po.fly*Math.PI*4)*.15;po.g.scale.set(k,1,k);}}
   else if(p.kind==='lock'){po.parts[1].position.y=p.on?1.62:1.46;}
   if(!p.down&&p.kind==='cone'&&po.fly>0)po.fly=0;
  }
  for(const o of objs){const ob=w.objs[o.i];o.g.position.set(ob.x,ob.y,ob.z);if(ob.kind==='tball')o.g.rotation.x=ob.spin;}
  for(const k of picks){const p=w.picks[k.i];k.g.visible=!p.taken;if(!p.taken){k.g.rotation.y=now/(p.kind==='star'?380:600);k.g.position.y=p.y+Math.sin(now/300+k.i)*.08;}}
  for(const p of pools){const r=w.recvs[p.i];p.m.position.y=r.wy-r.open*.9;p.m.visible=r.open<.98;}
  for(const f of fans){const r=w.recvs[f.i],on=r.open>.5;f.blades.rotation.y+=dt*(on?22:.4);f.streaks.visible=on&&!reduced;if(on){const mt=M.streak.map;if(mt)mt.offset.y=-now/400;}}
  if(net&&net.t<1.2){net.t+=dt;const a=net.mesh.geometry.getAttribute('position') as T.BufferAttribute,arr=a.array as Float32Array;const k=Math.max(0,1-net.t/1.2),bx=b.x-net.mesh.position.x,by=b.y-net.mesh.position.y;
   for(let i=0;i<arr.length;i+=3){const x=net.base[i],y=net.base[i+1],d=Math.hypot(x-bx,y-by);arr[i+2]=net.base[i+2]+(Math.exp(-d*.9)*.55+Math.sin(d*5-net.t*18)*Math.exp(-d*.8)*.2)*k;}a.needsUpdate=true;}
  for(const pool of [dust,drops])for(const p of pool){if(p.t>=p.life){p.s.visible=false;continue;}p.t+=dt;p.vy-=p.g*dt;p.s.position.x+=p.vx*dt;p.s.position.y+=p.vy*dt;p.s.position.z+=p.vz*dt;const f=1-p.t/p.life;p.s.material.opacity=f;if(p.t>=p.life)p.s.visible=false;}
  for(const r of rings){if(r.t>=1){r.m.visible=false;continue;}r.t+=dt/.9;const t=Math.max(0,r.t-r.d);r.m.visible=t>0&&r.t<1;r.m.scale.setScalar(.3+t*2.6);(r.m.material as T.MeshBasicMaterial).opacity=Math.max(0,.9-t);}
  // camera: behind and above, leads a little in the travel direction, never dips into the water
  const lead=Math.min(2.2,sp*.25),fall=s.respawnIn>0;
  const tx=b.x*.75,ty=Math.max(RB.water+1,fall?camLook.y:b.y),tz=b.z+2.6+lead*Math.sign(b.vz||1)*.6;
  const k=1-Math.exp(-dt*(fall?1.5:5));camLook.x+=(tx-camLook.x)*k;camLook.y+=(ty-camLook.y)*k;camLook.z+=(tz-camLook.z)*k;
  climb+=((sp>.6?Math.max(0,slopeZ*Math.sign(b.vz||1)):0)-climb)*Math.min(1,dt*3);const px=b.x*.6,py=(fall?camPos.y:Math.max(b.y,0)+5.8+Math.min(1.8,climb*3.2)),pz=b.z-6.4-Math.min(.8,climb*1.4);camPos.x+=(px-camPos.x)*k;camPos.y+=(py-camPos.y)*k;camPos.z+=(pz-camPos.z)*k;
  camera.position.copy(camPos);if(shake>0){shake=Math.max(0,shake-dt*.8);camera.position.x+=(Math.random()-.5)*shake;camera.position.y+=(Math.random()-.5)*shake;}camera.lookAt(camLook);
  WU.uCam.value.copy(camera.position);water.position.x=camPos.x;water.position.z=camPos.z+40;back.position.x=camPos.x;back.position.z=camPos.z;
  sun.position.set(b.x+6,b.y+14,b.z-5);sun.target.position.set(b.x,b.y,b.z+2);
  renderer.render(scene,camera);
 }
 /** Screen position (CSS px) of a world point: the shell pins comic words there. */
 const pv=new T.Vector3();let cw=1,ch=1;
 function project(x:number,y:number,z:number){pv.set(x,y,z).project(camera);return {x:(pv.x+1)/2*cw,y:(1-pv.y)/2*ch,behind:pv.z>1};}
 function resize(w:number,h:number,dpr:number){cw=w;ch=h;renderer.setPixelRatio(Math.min(dpr,mobile?1.5:2));renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w/h<.75?62:50;camera.updateProjectionMatrix();}
 function snap(s:RollState){const b=s.ball;prev.x=b.x;prev.z=b.z;camPos.set(b.x*.6,Math.max(b.y,0)+5.8,b.z-6.4);camLook.set(b.x*.75,Math.max(RB.water+1,b.y),b.z+2.6);climb=0;lastT=0;lastMod=-1;}
 function dispose(){clearLevel();for(const p of [...dust,...drops])scene.remove(p.s);for(const r of rings)scene.remove(r.m);trail.dispose();for(const d of disposables)d.dispose();renderer.dispose();renderer.forceContextLoss();}
 return {render,onEvent,resize,project,snap,dispose,get renderer(){return renderer;},get info(){return renderer.info;}};
}
