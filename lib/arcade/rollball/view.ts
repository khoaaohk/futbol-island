/**
 * Roll It In view (Nov 17 2026, docs/arcade-aaa/rollball-direction.md): three.js, one canvas, procedural only (canvas textures made
 * once, no downloads). Lit and shadowed so height reads (one shadow-casting sun that follows the ball, a blob under the ball), drawn
 * in the comic-print house style: toon shading in three steps, halftone surface prints, ink lines on every terrain edge and an ink
 * hull round the ball, crates, cones and posts.
 * Heat (AGENTS.md): powerPreference low-power, pixel ratio capped (1.5 phone, 2 desktop), one shadow map (512 on a phone), no
 * post-processing, terrain merged per module and surface (a handful of draw calls a module), modules disposed two behind the ball,
 * pooled dust / splash / trail, nothing drawn on the menus (the shell only calls render while playing), reduced motion: no shake,
 * no squash, fewer particles.
 */
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {RB,topAt,type World,type Piece,type Surf,type RollState,type RollEvent,type Theme} from './core';

const INK=0x231a2e;
export type ThemeLook={sky:[string,string];fog:number;water:string;waterDeep:string;hemi:[number,number,number];sun:[number,number];side:string;sideDark:string;edge:number};
export const THEME_LOOK:Record<Theme,ThemeLook>={
 0:{sky:['#7cc8ef','#e9f6ff'],fog:0xd7eef7,water:'#3aa6c7',waterDeep:'#227f9f',hemi:[0xeaf6ff,0x4a6b3a,1.05],sun:[0xfff1d6,1.9],side:'#8a5a3a',sideDark:'#5e3b26',edge:INK},
 1:{sky:['#5bc0e8','#fff1cc'],fog:0xf3ead2,water:'#2fc1c9',waterDeep:'#14909f',hemi:[0xfff6e0,0x9a7a4a,1.1],sun:[0xffe9c4,2],side:'#d9b27a',sideDark:'#a9824e',edge:INK},
 2:{sky:['#f08a5d','#ffd8a8'],fog:0xf2c7a2,water:'#3f6f9a',waterDeep:'#26496e',hemi:[0xffe2c8,0x4a3a4a,1],sun:[0xffc89a,1.8],side:'#a2523e',sideDark:'#6e3427',edge:INK},
 3:{sky:['#0f1838','#2a3a6a'],fog:0x1a2448,water:'#1d3f6e',waterDeep:'#0f2446',hemi:[0x9fb6ff,0x1a2238,.75],sun:[0xe8f0ff,2.3],side:'#4a5468',sideDark:'#2c3346',edge:0x0a0a14},
};

/* ---------------- procedural prints (made once per view) ---------------- */
function canvasTex(size:number,draw:(g:CanvasRenderingContext2D,s:number)=>void,repeat=true){
 const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d')!;draw(g,size);const t=new T.CanvasTexture(c);
 if(repeat){t.wrapS=t.wrapT=T.RepeatWrapping;}t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
function rng(seed:number){let a=seed>>>0;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
const dots=(g:CanvasRenderingContext2D,s:number,col:string,step:number,rad:number)=>{g.fillStyle=col;for(let y=0;y<s;y+=step)for(let x=(y/step)%2?step/2:0;x<s;x+=step){g.beginPath();g.arc(x,y,rad,0,7);g.fill();}};
/** A print per surface; the tile is in metres (UV = metres / tile). */
const SURF_TILE:Record<Surf,number>={grass:4,long:2,sand:3,ice:2,mud:2.5,wood:2,metal:1.5,rubber:2,stone:3};
function surfTex(k:Surf){
 const r=rng(k.length*977+k.charCodeAt(0));
 return canvasTex(128,(g,s)=>{
  switch(k){
   case 'grass':g.fillStyle='#5fb54a';g.fillRect(0,0,s,s);g.fillStyle='#4ea33d';g.fillRect(0,0,s,s/2);dots(g,s,'#3f8f33',8,1.1);for(let i=0;i<160;i++){g.fillStyle=r()<.5?'#77c75a':'#468f37';g.fillRect(r()*s,r()*s,1.5,4);}break;
   case 'long':g.fillStyle='#3f8a36';g.fillRect(0,0,s,s);for(let i=0;i<420;i++){const x=r()*s,y=r()*s;g.strokeStyle=r()<.5?'#2f6e2a':'#5aa847';g.lineWidth=1.6;g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-.5)*5,y-6-r()*5);g.stroke();}break;
   case 'sand':g.fillStyle='#f0d49a';g.fillRect(0,0,s,s);dots(g,s,'#dcb978',6,1);g.strokeStyle='#e2c283';g.lineWidth=2;for(let y=10;y<s;y+=22){g.beginPath();for(let x=0;x<=s;x+=8)g.lineTo(x,y+Math.sin(x/s*Math.PI*4)*3);g.stroke();}break;
   case 'ice':g.fillStyle='#bfe6f2';g.fillRect(0,0,s,s);g.strokeStyle='#7fb8cc';g.lineWidth=3;g.strokeRect(1.5,1.5,s/2-3,s/2-3);g.strokeRect(s/2+1.5,1.5,s/2-3,s/2-3);g.strokeRect(1.5,s/2+1.5,s/2-3,s/2-3);g.strokeRect(s/2+1.5,s/2+1.5,s/2-3,s/2-3);
    g.strokeStyle='#ffffffcc';g.lineWidth=4;for(let i=0;i<4;i++){const x=r()*s,y=r()*s;g.beginPath();g.moveTo(x,y);g.lineTo(x+14,y-14);g.stroke();}break;
   case 'mud':g.fillStyle='#6b4a2e';g.fillRect(0,0,s,s);for(let i=0;i<30;i++){g.fillStyle=r()<.5?'#583a22':'#7d5838';g.beginPath();g.ellipse(r()*s,r()*s,6+r()*12,4+r()*8,r()*3,0,7);g.fill();}dots(g,s,'#4a301b',10,1.4);break;
   case 'wood':g.fillStyle='#c98a4a';g.fillRect(0,0,s,s);for(let x=0;x<s;x+=s/4){g.fillStyle=r()<.5?'#bf7f40':'#d39552';g.fillRect(x+1,0,s/4-2,s);g.fillStyle='#7a4a24';g.fillRect(x,0,2,s);
     g.strokeStyle='#a86c36';g.lineWidth=1;for(let i=0;i<3;i++){g.beginPath();g.moveTo(x+6+r()*20,0);g.lineTo(x+6+r()*20,s);g.stroke();}g.fillStyle='#5a3418';g.fillRect(x+s/8-2,s*.2,3,3);g.fillRect(x+s/8-2,s*.8,3,3);}break;
   case 'metal':g.fillStyle='#9aa6ae';g.fillRect(0,0,s,s);g.fillStyle='#c4ced4';for(let y=0;y<s;y+=16)for(let x=(y/16)%2?8:0;x<s;x+=16){g.save();g.translate(x+4,y+4);g.rotate(.6);g.fillRect(-5,-1.5,10,3);g.restore();}g.fillStyle='#7c8890';g.fillRect(0,s-3,s,3);break;
   case 'rubber':g.fillStyle='#e0473a';g.fillRect(0,0,s,s);dots(g,s,'#b8302a',10,2.4);break;
   case 'stone':g.fillStyle='#b9b2a6';g.fillRect(0,0,s,s);dots(g,s,'#a59e92',7,1.2);g.strokeStyle='#8f887d';g.lineWidth=2;g.strokeRect(0,0,s/2,s/2);g.strokeRect(s/2,s/2,s/2,s/2);for(let i=0;i<60;i++){g.fillStyle=r()<.5?'#cfc8bc':'#9a9388';g.fillRect(r()*s,r()*s,2,2);}break;
  }
 });
}
function sideTex(look:ThemeLook){const r=rng(31);return canvasTex(128,(g,s)=>{g.fillStyle=look.side;g.fillRect(0,0,s,s);g.fillStyle=look.sideDark;for(let y=0;y<s;y+=16){g.fillRect(0,y,s,2);for(let x=(y/16)%2?0:16;x<s;x+=32)g.fillRect(x,y,2,16);}dots(g,s,look.sideDark,9,1.3);for(let i=0;i<40;i++){g.fillStyle='#ffffff18';g.fillRect(r()*s,r()*s,3,2);}});}
function waterTex(look:ThemeLook){return canvasTex(256,(g,s)=>{g.fillStyle=look.water;g.fillRect(0,0,s,s);dots(g,s,look.waterDeep,10,2.2);g.strokeStyle='#ffffffaa';g.lineWidth=3;g.lineCap='round';const r=rng(5);
 for(let i=0;i<22;i++){const x=r()*s,y=r()*s,w=12+r()*20;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+w/2,y-5,x+w,y);g.stroke();}});}
function skyTex(look:ThemeLook){return canvasTex(64,(g,s)=>{const gr=g.createLinearGradient(0,0,0,s);gr.addColorStop(0,look.sky[0]);gr.addColorStop(1,look.sky[1]);g.fillStyle=gr;g.fillRect(0,0,s,s);},false);}
function toonRamp(){const d=new Uint8Array([90,90,90,255,175,175,175,255,255,255,255,255]);const t=new T.DataTexture(d,3,1,T.RGBAFormat);t.minFilter=t.magFilter=T.NearestFilter;t.needsUpdate=true;return t;}

/* ---------------- terrain geometry ---------------- */
type Acc={p:number[];u:number[]};
const tri=(a:Acc,x1:number,y1:number,z1:number,u1:number,v1:number,x2:number,y2:number,z2:number,u2:number,v2:number,x3:number,y3:number,z3:number,u3:number,v3:number)=>{a.p.push(x1,y1,z1,x2,y2,z2,x3,y3,z3);a.u.push(u1,v1,u2,v2,u3,v3);};
function geom(a:Acc){if(!a.p.length)return null;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(a.p,3));g.setAttribute('uv',new T.Float32BufferAttribute(a.u,2));g.computeVertexNormals();return g;}
/** Top and sides of one piece (dy left out: moving pieces are placed by their mesh). Lines: the ink outline. */
function pieceGeom(p:Piece,top:Acc,side:Acc,lines:number[],tile:number){
 const seg=p.kind===3?14:1,h=(x:number,z:number)=>topAt({...p,dy:0},x,z),X=(i:number)=>p.x0+(p.x1-p.x0)*i/seg,y0=Math.max(p.y0,RB.water-.4);
 for(let i=0;i<seg;i++){const xa=X(i),xb=X(i+1);
  tri(top,xa,h(xa,p.z0),p.z0,xa/tile,p.z0/tile,xa,h(xa,p.z1),p.z1,xa/tile,p.z1/tile,xb,h(xb,p.z0),p.z0,xb/tile,p.z0/tile);
  tri(top,xb,h(xb,p.z0),p.z0,xb/tile,p.z0/tile,xa,h(xa,p.z1),p.z1,xa/tile,p.z1/tile,xb,h(xb,p.z1),p.z1,xb/tile,p.z1/tile);
  // z0 side (faces -z) and z1 side (faces +z)
  for(const [z,flip] of [[p.z0,false],[p.z1,true]] as const){const ta=h(xa,z),tb=h(xb,z);
   if(!flip){tri(side,xa,y0,z,xa/2,y0/2,xa,ta,z,xa/2,ta/2,xb,y0,z,xb/2,y0/2);tri(side,xb,y0,z,xb/2,y0/2,xa,ta,z,xa/2,ta/2,xb,tb,z,xb/2,tb/2);}
   else{tri(side,xa,y0,z,xa/2,y0/2,xb,y0,z,xb/2,y0/2,xa,ta,z,xa/2,ta/2);tri(side,xb,y0,z,xb/2,y0/2,xb,tb,z,xb/2,tb/2,xa,ta,z,xa/2,ta/2);}
   lines.push(xa,ta+.005,z,xb,tb+.005,z);}
 }
 for(const [x,flip] of [[p.x0,true],[p.x1,false]] as const){const ta=h(x,p.z0),tb=h(x,p.z1);
  if(!flip){tri(side,x,y0,p.z0,p.z0/2,y0/2,x,ta,p.z0,p.z0/2,ta/2,x,y0,p.z1,p.z1/2,y0/2);tri(side,x,y0,p.z1,p.z1/2,y0/2,x,ta,p.z0,p.z0/2,ta/2,x,tb,p.z1,p.z1/2,tb/2);}
  else{tri(side,x,y0,p.z0,p.z0/2,y0/2,x,y0,p.z1,p.z1/2,y0/2,x,ta,p.z0,p.z0/2,ta/2);tri(side,x,y0,p.z1,p.z1/2,y0/2,x,tb,p.z1,p.z1/2,tb/2,x,ta,p.z0,p.z0/2,ta/2);}
  lines.push(x,ta+.005,p.z0,x,tb+.005,p.z1);
 }
 for(const [x,z] of [[p.x0,p.z0],[p.x1,p.z0],[p.x0,p.z1],[p.x1,p.z1]])lines.push(x,h(x,z),z,x,y0,z);
}

/* ---------------- the ball: panels from the 12 icosahedron points (pentagons) ---------------- */
function ballGeom(r:number){
 const g=new T.IcosahedronGeometry(r,9).toNonIndexed(),pos=g.getAttribute('position'),n=pos.count,col=new Float32Array(n*3);
 // a truncated icosahedron: 12 pentagon centres (the icosahedron's points) and 20 hexagon centres (its faces)
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
 const surfMat=new Map<Surf,T.MeshToonMaterial>();
 const matFor=(k:Surf)=>{let m=surfMat.get(k);if(!m){m=own(new T.MeshToonMaterial({map:own(surfTex(k)),gradientMap:ramp}));surfMat.set(k,m);}return m;};
 const toon=(color:number|string,extra:Partial<T.MeshToonMaterialParameters>={})=>own(new T.MeshToonMaterial({color,gradientMap:ramp,...extra}));
 const inkMat=own(new T.MeshBasicMaterial({color:INK,side:T.BackSide}));
 const lineMat=own(new T.LineBasicMaterial({color:INK,transparent:true,opacity:.85}));
 const hull=(geo:T.BufferGeometry,scale=1.08)=>{const m=new T.Mesh(geo,inkMat);m.scale.setScalar(scale);return m;};

 /* light: hemisphere + one sun with a shadow that follows the ball */
 const hemi=new T.HemisphereLight(0xffffff,0x444444,1);scene.add(hemi);
 const sun=new T.DirectionalLight(0xffffff,2);sun.castShadow=true;const sm=mobile?512:1024;sun.shadow.mapSize.set(sm,sm);
 Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:1,far:40});sun.shadow.bias=-.0006;sun.shadow.normalBias=.03;sun.shadow.radius=3;scene.add(sun,sun.target);

 /* water: one big plane, its print drifts */
 const waterMats:Partial<Record<Theme,{mat:T.MeshToonMaterial;tex:T.Texture}>>={};
 const water=new T.Mesh(own(new T.PlaneGeometry(220,220)),undefined);water.rotation.x=-Math.PI/2;water.position.y=RB.water;water.receiveShadow=true;scene.add(water);
 const skies:Partial<Record<Theme,T.Texture>>={};const sides:Partial<Record<Theme,T.MeshToonMaterial>>={};
 function setTheme(t:Theme){const L=THEME_LOOK[t];
  scene.background=skies[t]??=own(skyTex(L));scene.fog=new T.Fog(L.fog,26,70);hemi.color.set(L.hemi[0]);hemi.groundColor.set(L.hemi[1]);hemi.intensity=L.hemi[2];sun.color.set(L.sun[0]);sun.intensity=L.sun[1];
  const w=waterMats[t]??=(()=>{const tex=own(waterTex(L));tex.repeat.set(40,40);return {tex,mat:own(new T.MeshToonMaterial({map:tex,gradientMap:ramp}))};})();water.material=w.mat;theme=t;lineMat.color.set(L.edge);}
 const sideMat=(t:Theme)=>sides[t]??=own(new T.MeshToonMaterial({map:own(sideTex(THEME_LOOK[t])),gradientMap:ramp}));
 let theme:Theme=0;

 /* shared shapes */
 const G={
  box:own(new T.BoxGeometry(1,1,1)),cyl:own(new T.CylinderGeometry(1,1,1,18)),cone:own(new T.ConeGeometry(.3,.42,16)),
  sphere:own(new T.SphereGeometry(1,20,14)),plate:own(new T.CylinderGeometry(.6,.66,.1,28)),ring:own(new T.TorusGeometry(.5,.07,8,28)),
  star:own((()=>{const s=new T.Shape();for(let i=0;i<10;i++){const a=i/10*Math.PI*2-Math.PI/2,r=i%2?.16:.36;i?s.lineTo(Math.cos(a)*r,Math.sin(a)*r):s.moveTo(Math.cos(a)*r,Math.sin(a)*r);}
   const g=new T.ExtrudeGeometry(s,{depth:.12,bevelEnabled:true,bevelSize:.03,bevelThickness:.03,bevelSegments:1});g.center();return g;})()),
  disc:own(new T.CircleGeometry(1,24)),
 };
 const M={
  ballInk:inkMat,crate:toon('#c98a4a',{map:own(surfTex('wood'))}),tball:toon('#ff8a3c'),cone:toon('#ff7a2a'),coneStripe:toon('#fff3d6'),post:toon('#e9e2d0'),
  switchOff:toon('#f0452e'),switchOn:toon('#19b5a5'),bumper:toon('#e0473a'),bumperTop:toon('#ffc83a'),lock:toon('#ffc83a'),gold:toon('#ffc83a',{emissive:new T.Color('#5a3a00')}),
  gate:toon('#f4f0e6',{map:own(canvasTex(64,(g,s)=>{g.fillStyle='#f4f0e6';g.fillRect(0,0,s,s);g.fillStyle='#f0452e';for(let x=-s;x<s;x+=16){g.beginPath();g.moveTo(x,s);g.lineTo(x+8,s);g.lineTo(x+8+s,0);g.lineTo(x+s,0);g.fill();}}))}),
  fan:toon('#4a5468'),blade:toon('#e9e2d0'),net:own(new T.MeshBasicMaterial({map:own(canvasTex(64,(g,s)=>{g.clearRect(0,0,s,s);g.strokeStyle='#fffdf6';g.lineWidth=3;for(let i=0;i<=s;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i,s);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(s,i);g.stroke();}})),transparent:true,side:T.DoubleSide,depthWrite:false})),
  goalPost:toon('#fffdf6'),blob:own(new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.28,depthWrite:false})),
  pool:own(new T.MeshToonMaterial({color:'#38b8d0',gradientMap:ramp,transparent:true,opacity:.86})),
  dust:own(new T.SpriteMaterial({map:own(canvasTex(64,(g,s)=>{g.fillStyle='#fff3d6';g.strokeStyle='#231a2e';g.lineWidth=5;g.beginPath();g.arc(s/2,s/2,s/2-5,0,7);g.fill();g.stroke();},false)),transparent:true,depthWrite:false})),
  splash:own(new T.SpriteMaterial({map:own(canvasTex(64,(g,s)=>{g.fillStyle='#e9fbff';g.strokeStyle='#14607a';g.lineWidth=5;g.beginPath();g.arc(s/2,s/2,s/2-5,0,7);g.fill();g.stroke();},false)),transparent:true,depthWrite:false})),
  trail:own(new T.MeshBasicMaterial({color:'#b9925a',transparent:true,opacity:.55,depthWrite:false})),
 };
 /* scenery round each module: one merged mesh a module (groups: one per material), built from these parts */
 const decoMats=[toon('#7a5a3a'),toon('#3f9a4a'),toon('#f4f0e6'),toon('#f0452e'),toon('#9aa6ae'),toon('#fff6c8',{emissive:new T.Color('#fff2b0'),emissiveIntensity:1}),toon('#d9b27a'),toon('#4a5468',{map:own(canvasTex(64,(g,s)=>{g.fillStyle='#4a5468';g.fillRect(0,0,s,s);for(let y=6;y<s;y+=16)for(let x=6;x<s;x+=16){g.fillStyle=(x*7+y*3)%5<2?'#ffd97a':'#2c3346';g.fillRect(x,y,7,9);}}))}),toon('#19b5a5'),toon('#ffc83a')];
 // 0 trunk, 1 leaves, 2 white, 3 red, 4 grey, 5 lamp, 6 sand, 7 windows, 8 teal, 9 sun
 function deco(P:World['mods'][number],mi:number,w:World,theme:Theme):T.Mesh|null{
  const r=rng(mi*7919+P.def.id.length*31+(theme+1)),parts:T.BufferGeometry[]=[],mats:number[]=[];let maxX=3;
  for(let i=P.p0;i<P.p1;i++){const p=w.pieces[i];maxX=Math.max(maxX,Math.abs(p.x0),Math.abs(p.x1));}
  const put=(g:T.BufferGeometry,m:number,x:number,y:number,z:number,sx=1,sy=1,sz=1,ry=0)=>{const c=g.clone();c.scale(sx,sy,sz);c.rotateY(ry);c.translate(x,y,z);if(c.index)parts.push(c.toNonIndexed());else parts.push(c);c.deleteAttribute?.('normal');mats.push(m);};
  const isle=(x:number,z:number,rad:number,m=6)=>put(G.cyl,m,x,RB.water+.25,z,rad,.9,rad);
  const n=Math.max(2,Math.round(P.def.len/5));
  for(let k=0;k<n;k++)for(const side of [-1,1]){if(r()<.25)continue;const z=P.z+(k+.3+r()*.4)*P.def.len/n,x=side*(maxX+2.2+r()*3.5),t=theme;
   if(t===0){if(r()<.5){isle(x,z,1.1,1);put(G.cyl,0,x,RB.water+1.2,z,.14,1.6,.14);put(G.sphere,1,x,RB.water+2.4,z,.9,1,.9);put(G.sphere,1,x+.4,RB.water+2,z+.3,.6,.7,.6);}
    else{isle(x,z,1.4,1);put(G.box,2,x,RB.water+1.05,z,.1,.9,2.2);put(G.box,3,x+side*-.06,RB.water+1.15,z,.04,.42,2);}}
   else if(t===1){isle(x,z,1.3);if(r()<.6){const lean=(r()-.5)*.5;for(let j=0;j<5;j++)put(G.cyl,0,x+lean*j*.3,RB.water+.8+j*.5,z,.12-j*.01,.5,.12-j*.01);
     for(let j=0;j<5;j++)put(G.cone,1,x+lean*1.5+Math.cos(j*1.26)*.75,RB.water+3.2,z+Math.sin(j*1.26)*.75,1.2,.35,3.2,-j*1.26);}
    else{put(G.cyl,2,x,RB.water+1.4,z,.04,1.8,.04);put(G.cone,r()<.5?3:8,x,RB.water+2.35,z,3.4,.9,3.4);}}
   else if(t===2){const h=1.5+r()*3.5,wd=1.6+r()*1.4;put(G.box,7,x+side*wd*.3,RB.water+h/2,z,wd,h+.3,wd*1.2);put(G.box,4,x+side*wd*.3,RB.water+h+.25,z,wd*1.05,.2,wd*1.25);
    if(r()<.5){put(G.cyl,3,x+side*wd*.3,RB.water+h+.75,z,.35,.8,.35);}else put(G.box,2,x+side*wd*.3+.3,RB.water+h+.5,z+.3,.18,.7,.18);}
   else{if(k%2===0){put(G.cyl,4,x,RB.water+3,z,.12,6.5,.12);put(G.box,4,x,RB.water+6.3,z,1.3,.9,.3,0);put(G.box,5,x,RB.water+6.3,z-.17,1.1,.7,.06);isle(x,z,.8,4);}
    else{put(G.box,7,x+side*1.2,RB.water+1.2,z,2.2,2.6,3.2);put(G.box,3,x+side*.1,RB.water+2.5,z,.3,.25,3.2);}}
  }
  if(!parts.length)return null;
  for(const g of parts){for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='uv')g.deleteAttribute(k);if(!g.getAttribute('uv'))g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(g.getAttribute('position').count*2),2));}
  // one group per material, in material order
  const order=parts.map((g,i)=>i).sort((a,b)=>mats[a]-mats[b]),sorted=order.map(i=>parts[i]),merged=mergeGeometries(sorted,true);for(const g of parts)g.dispose();if(!merged)return null;
  merged.groups.forEach((gr,i)=>{gr.materialIndex=mats[order[i]];});merged.computeVertexNormals();
  const m=new T.Mesh(merged,decoMats);m.receiveShadow=false;return m;
 }
 const plateMat:Record<string,T.MeshToonMaterial>={latch:toon('#ffc83a'),hold:toon('#19b5a5'),heavy:toon('#19b5a5'),timed:toon('#ff8a3c'),stay:toon('#8f78b8'),order:toon('#4a9fe0')};
 const litMat=toon('#fff3d6',{emissive:new T.Color('#ffc83a'),emissiveIntensity:.8});
 const digitTex=[1,2,3].map(n=>own(canvasTex(64,(g,s)=>{g.clearRect(0,0,s,s);g.font='900 46px Arial';g.textAlign='center';g.textBaseline='middle';g.lineWidth=8;g.strokeStyle='#231a2e';g.strokeText(String(n),s/2,s/2+2);g.fillStyle='#fff3d6';g.fillText(String(n),s/2,s/2+2);},false)));
 const digitMat=digitTex.map(t=>own(new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false})));
 const iconTex=own(canvasTex(64,(g,s)=>{g.clearRect(0,0,s,s);g.fillStyle='#231a2e';g.fillRect(16,26,32,26);g.fillRect(26,14,12,14);},false)),iconMat=own(new T.MeshBasicMaterial({map:iconTex,transparent:true,depthWrite:false}));

 /* the ball */
 const ballGeo=own(ballGeom(RB.r)),ball=new T.Group(),ballMesh=new T.Mesh(ballGeo,own(new T.MeshStandardMaterial({vertexColors:true,roughness:.45,metalness:0})));
 ballMesh.castShadow=true;const ballHull=hull(own(new T.SphereGeometry(RB.r,24,16)),1.09);ball.add(ballMesh,ballHull);scene.add(ball);
 const blob=new T.Mesh(G.disc,M.blob);blob.rotation.x=-Math.PI/2;blob.renderOrder=2;scene.add(blob);
 const carried=new T.Group();{const w=whistle();carried.add(w);}carried.visible=false;scene.add(carried);
 function whistle(){const g=new T.Group(),b=new T.Mesh(G.cyl,M.gold);b.scale.set(.14,.34,.14);b.rotation.z=Math.PI/2;const r=new T.Mesh(G.ring,M.gold);r.scale.setScalar(.28);r.position.x=-.22;g.add(b,r,(()=>{const h=hull(G.cyl,1);h.scale.set(.16,.37,.16);h.rotation.z=Math.PI/2;return h;})());return g;}

 /* pools */
 const dust:{s:T.Sprite;t:number;life:number;vx:number;vy:number;vz:number}[]=Array.from({length:reduced?10:28},()=>{const s=new T.Sprite(M.dust);s.visible=false;scene.add(s);return {s,t:0,life:0,vx:0,vy:0,vz:0};});
 const drops:{s:T.Sprite;t:number;life:number;vx:number;vy:number;vz:number}[]=Array.from({length:reduced?8:24},()=>{const s=new T.Sprite(M.splash);s.visible=false;scene.add(s);return {s,t:0,life:0,vx:0,vy:0,vz:0};});
 const TRAIL=90,trail=new T.InstancedMesh(G.disc,M.trail,TRAIL);trail.count=0;trail.renderOrder=1;scene.add(trail);let trailN=0,trailLast={x:1e9,z:1e9};const tm=new T.Matrix4(),tq=new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),-Math.PI/2),tv=new T.Vector3(),ts=new T.Vector3();
 const puff=(pool:typeof dust,x:number,y:number,z:number,n:number,spd:number,size:number)=>{let k=0;for(const p of pool){if(k>=n)break;if(p.t<p.life)continue;k++;const a=Math.random()*Math.PI*2;
  p.t=0;p.life=.45+Math.random()*.3;p.vx=Math.cos(a)*spd*(.5+Math.random());p.vz=Math.sin(a)*spd*(.5+Math.random());p.vy=spd*(.4+Math.random()*.8);p.s.position.set(x,y,z);p.s.scale.setScalar(size);p.s.visible=true;}};

 /* ---------------- the level ---------------- */
 type ModView={group:T.Group;disposed:boolean;geos:T.BufferGeometry[]};
 let world:World|null=null,mods:ModView[]=[];
 const dyn:{piece:number;mesh:T.Object3D}[]=[],plates:{i:number;mesh:T.Mesh;cap:T.Mesh;ring?:T.Mesh}[]=[],posts:{i:number;g:T.Group;parts:T.Object3D[];fly:number;vel:T.Vector3[]}[]=[];
 const objs:{i:number;g:T.Object3D}[]=[],picks:{i:number;g:T.Object3D}[]=[],pools:{i:number;m:T.Mesh}[]=[],fans:{i:number;blades:T.Object3D}[]=[];
 let net:{mesh:T.Mesh;base:Float32Array;t:number}|null=null;
 function clearLevel(){for(const m of mods)disposeMod(m);mods=[];dyn.length=plates.length=posts.length=objs.length=picks.length=pools.length=fans.length=0;net=null;trail.count=0;trailN=0;}
 function disposeMod(m:ModView){if(m.disposed)return;m.disposed=true;scene.remove(m.group);for(const g of m.geos)g.dispose();}
 function setWorld(w:World){
  clearLevel();world=w;setTheme(w.mods[0].def.theme);
  w.mods.forEach((P,mi)=>{const th:Theme=P.def.id==='goal'&&mi>0?w.mods[mi-1].def.theme:P.def.theme;// the goal wears the level's last theme
   const group=new T.Group(),geos:T.BufferGeometry[]=[];const tops=new Map<Surf,Acc>(),side:Acc={p:[],u:[]},lines:number[]=[];
   for(let i=P.p0;i<P.p1;i++){const p=w.pieces[i];if(p.role!==0||p.hidden)continue;let a=tops.get(p.surf);if(!a){a={p:[],u:[]};tops.set(p.surf,a);}pieceGeom(p,a,side,lines,SURF_TILE[p.surf]);}
   for(const [k,a] of tops){const g=geom(a);if(!g)continue;geos.push(g);const m=new T.Mesh(g,matFor(k));m.receiveShadow=true;group.add(m);}
   {const g=geom(side);if(g){geos.push(g);const m=new T.Mesh(g,sideMat(th));m.receiveShadow=true;group.add(m);}}
   if(lines.length){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(lines,3));geos.push(g);group.add(new T.LineSegments(g,lineMat));}
   // moving pieces: their own mesh, moved by dy
   for(let i=P.p0;i<P.p1;i++){const p=w.pieces[i];if(p.role===0)continue;const a:Acc={p:[],u:[]},sd:Acc={p:[],u:[]},ln:number[]=[];pieceGeom({...p,y0:p.role===1?p.y0:topAt({...p,dy:0},p.x0,p.z0)-.35},a,sd,ln,SURF_TILE[p.surf]);
    const g=new T.Group(),gt=geom(a)!,gs=geom(sd)!,gl=new T.BufferGeometry();gl.setAttribute('position',new T.Float32BufferAttribute(ln,3));geos.push(gt,gs,gl);
    const mt=new T.Mesh(gt,p.role===1?M.gate:matFor(p.surf)),ms=new T.Mesh(gs,p.role===1?M.gate:sideMat(th));mt.castShadow=ms.castShadow=true;mt.receiveShadow=true;g.add(mt,ms,new T.LineSegments(gl,lineMat));
    group.add(g);dyn.push({piece:i,mesh:g});}
   for(let i=P.pl0;i<P.pl1;i++){const pl=w.plates[i],base=new T.Mesh(G.plate,M.post),cap=new T.Mesh(G.plate,plateMat[pl.kind]);base.scale.set(1.08,.6,1.08);base.position.set(pl.x,pl.y+.02,pl.z);cap.scale.set(.86,1,.86);cap.position.set(pl.x,pl.y+.07,pl.z);cap.receiveShadow=true;
    group.add(base,cap);const rec:{i:number;mesh:T.Mesh;cap:T.Mesh;ring?:T.Mesh}={i,mesh:base,cap};
    if(pl.kind==='order'){const d=new T.Mesh(own(new T.PlaneGeometry(.7,.7)),digitMat[Math.min(2,pl.idx)]);d.rotation.x=-Math.PI/2;d.position.set(pl.x,pl.y+.14,pl.z);d.renderOrder=3;group.add(d);}
    if(pl.kind==='heavy'){const d=new T.Mesh(own(new T.PlaneGeometry(.6,.6)),iconMat);d.rotation.x=-Math.PI/2;d.position.set(pl.x,pl.y+.14,pl.z);d.renderOrder=3;group.add(d);}
    if(pl.kind==='timed'||pl.kind==='stay'){const r=new T.Mesh(G.ring,litMat);r.rotation.x=-Math.PI/2;r.position.set(pl.x,pl.y+.13,pl.z);r.scale.setScalar(.95);group.add(r);rec.ring=r;}
    plates.push(rec);}
   for(let i=P.po0;i<P.po1;i++){const po=w.posts[i],g=new T.Group();g.position.set(po.x,po.y,po.z);const parts:T.Object3D[]=[];
    if(po.kind==='cone'){for(let k=0;k<3;k++){const c=new T.Group(),m=new T.Mesh(G.cone,M.cone),st=new T.Mesh(G.cyl,M.coneStripe);st.scale.set(.2,.05,.2);st.position.y=.02;m.castShadow=true;c.add(m,st,(()=>{const h=hull(G.cone,1.12);return h;})());
      c.position.set(0,.21+k*.16,0);g.add(c);parts.push(c);}}
    else if(po.kind==='bumper'){const b=new T.Mesh(G.cyl,M.bumper);b.scale.set(po.r,.7,po.r);b.position.y=.35;b.castShadow=true;const t=new T.Mesh(G.cyl,M.bumperTop);t.scale.set(po.r*.7,.08,po.r*.7);t.position.y=.72;const h=hull(G.cyl,1);h.scale.set(po.r*1.08,.74,po.r*1.08);h.position.y=.35;g.add(b,t,h);parts.push(b);}
    else{const p=new T.Mesh(G.cyl,M.post);p.scale.set(po.r*.6,1.1,po.r*.6);p.position.y=.55;p.castShadow=true;const h=hull(G.cyl,1);h.scale.set(po.r*.68,1.12,po.r*.68);h.position.y=.55;g.add(p,h);
     if(po.kind==='switch'){const lever=new T.Group(),bar=new T.Mesh(G.box,M.switchOff);bar.scale.set(.12,.7,.12);bar.position.y=.35;const knob=new T.Mesh(G.sphere,M.switchOff);knob.scale.setScalar(.16);knob.position.y=.72;lever.add(bar,knob);lever.position.y=1.05;lever.rotation.x=-.6;g.add(lever);parts.push(lever,bar,knob);}
     else{const lk=new T.Mesh(G.box,M.lock);lk.scale.set(.5,.46,.22);lk.position.y=1.2;const sh=new T.Mesh(G.ring,M.lock);sh.scale.setScalar(.36);sh.position.y=1.46;const kh=new T.Mesh(G.box,inkMat);kh.scale.set(.08,.18,.25);kh.position.y=1.18;g.add(lk,sh,kh,(()=>{const h=hull(G.box,1);h.scale.set(.56,.52,.28);h.position.y=1.2;return h;})());parts.push(lk,sh);}}
    group.add(g);posts.push({i,g,parts,fly:0,vel:parts.map(()=>new T.Vector3())});}
   for(let i=P.o0;i<P.o1;i++){const o=w.objs[i];let g:T.Object3D;
    if(o.kind==='crate'){const gg=new T.Group(),m=new T.Mesh(G.box,M.crate);m.scale.setScalar(.9);m.castShadow=true;m.receiveShadow=true;const h=hull(G.box,1);h.scale.setScalar(.95);gg.add(m,h);g=gg;}
    else{const gg=new T.Group(),m=new T.Mesh(G.sphere,M.tball);m.scale.setScalar(o.r);m.castShadow=true;const h=hull(G.sphere,1);h.scale.setScalar(o.r*1.1);gg.add(m,h);g=gg;}
    group.add(g);objs.push({i,g});}
   for(let i=P.k0;i<P.k1;i++){const k=w.picks[i];let g:T.Object3D;if(k.kind==='star'){const gg=new T.Group(),m=new T.Mesh(G.star,M.gold);m.castShadow=true;gg.add(m);g=gg;}else g=whistle();g.position.set(k.x,k.y,k.z);group.add(g);picks.push({i,g});}
   for(let i=P.r0;i<P.r1;i++){const r=w.recvs[i];
    if(r.kind==='drain'){const m=new T.Mesh(own(new T.PlaneGeometry(r.x1-r.x0,r.z1-r.z0)),M.pool);m.rotation.x=-Math.PI/2;m.position.set((r.x0+r.x1)/2,r.wy,(r.z0+r.z1)/2);group.add(m);pools.push({i,m});}
    if(r.kind==='fan'){const g=new T.Group(),house=new T.Mesh(G.cyl,M.fan);house.scale.set(1.15,.5,1.15);const blades=new T.Group();for(let k=0;k<4;k++){const b=new T.Mesh(G.box,M.blade);b.scale.set(.18,.06,1);b.position.z=.5;const arm=new T.Group();arm.rotation.y=k*Math.PI/2;arm.add(b);blades.add(arm);}
     blades.position.y=.3;const h=hull(G.cyl,1);h.scale.set(1.2,.52,1.2);g.add(house,blades,h);g.position.set((r.x0+r.x1)/2,RB.water+.3,(r.z0+r.z1)/2);group.add(g);fans.push({i,blades});}}
   if(P.goal){const [gx,gz]=P.goal,gg=new T.Group();
    for(const x of [-1.75,1.75]){const p=new T.Mesh(G.cyl,M.goalPost);p.scale.set(.09,1.5,.09);p.position.set(gx+x,.75,gz-.55);p.castShadow=true;gg.add(p);}
    const bar=new T.Mesh(G.cyl,M.goalPost);bar.scale.set(.09,3.5,.09);bar.rotation.z=Math.PI/2;bar.position.set(gx,1.5,gz-.55);gg.add(bar);
    const ng=own(new T.PlaneGeometry(3.5,1.5,10,5));const nm=new T.Mesh(ng,M.net);nm.position.set(gx,.75,gz+.88);gg.add(nm);net={mesh:nm,base:Float32Array.from(ng.getAttribute('position').array as ArrayLike<number>),t:9};
    for(const x of [-1.72,1.72]){const s=new T.Mesh(own(new T.PlaneGeometry(1.45,1.5)),M.net);s.rotation.y=Math.PI/2;s.position.set(gx+x,.75,gz+.17);gg.add(s);}
    const roof=new T.Mesh(own(new T.PlaneGeometry(3.5,1.45)),M.net);roof.rotation.x=Math.PI/2;roof.position.set(gx,1.5,gz+.17);gg.add(roof);group.add(gg);}
   {const d=deco(P,mi,w,th);if(d){geos.push(d.geometry);group.add(d);}}
   scene.add(group);mods.push({group,disposed:false,geos});});
 }

 /* ---------------- per frame ---------------- */
 const camPos=new T.Vector3(0,6,-6),camLook=new T.Vector3(0,0,3),q=new T.Quaternion(),ax=new T.Vector3();let squash=0,shake=0,lastT=0,lastMod=-1;const prev={x:0,z:0};
 const shakeIt=(a:number)=>{if(reduced)return;shake=Math.max(shake,a);};
 function onEvent(e:RollEvent){
  switch(e.type){
   case 'land':if(e.a>2.2){squash=reduced?0:Math.min(.35,e.a*.04);puff(dust,e.x,e.y-RB.r+.05,e.z,Math.min(8,Math.round(e.a)),1.4,.28);if(e.a>6)shakeIt(.12);}break;
   case 'splash':puff(drops,e.x,RB.water+.1,e.z,reduced?6:18,3.2,.3);if(e.a<0)shakeIt(.18);break;
   case 'cone':{const p=posts.find(o=>o.i===e.a);if(p){p.fly=1;p.vel.forEach((v,k)=>v.set((Math.random()-.5)*3,3+k*1.2,2.5+Math.random()*2));}puff(dust,e.x,e.y+.2,e.z,6,1.6,.3);shakeIt(.1);break;}
   case 'goal':if(net)net.t=0;puff(dust,e.x,e.y,e.z,10,2,.3);break;
   case 'bump':{const p=posts.find(o=>o.i===e.a);if(p)p.fly=-.25;break;}
   case 'gate':if(e.b===1)puff(dust,e.x,e.y+.1,e.z,5,1.2,.32);break;
   case 'star':puff(dust,e.x,e.y,e.z,6,2.2,.2);break;
   case 'respawn':case 'level':trail.count=0;trailN=0;break;
  }
 }
 function render(s:RollState,now:number){
  const w=s.world;if(w!==world)setWorld(w);
  const dt=lastT?Math.min(.05,(now-lastT)/1000):0;lastT=now;const b=s.ball;
  // dispose modules two behind the ball (they are never visited again)
  if(s.mod!==lastMod){lastMod=s.mod;for(let k=0;k<s.mod-1&&k<mods.length;k++)disposeMod(mods[k]);if(w.mods[s.mod].def.theme!==theme&&w.mods[s.mod].def.id!=='goal')setTheme(w.mods[s.mod].def.theme);}
  // ball: position, roll (panels turn by the distance rolled), squash on a hard stop
  ball.position.set(b.x,b.y,b.z);
  const sp=Math.hypot(b.vx,b.vz),mx=b.x-prev.x,mz=b.z-prev.z,md=Math.hypot(mx,mz);prev.x=b.x;prev.z=b.z;
  if(md>1e-5&&md<2){ax.set(mz,0,-mx).normalize();q.setFromAxisAngle(ax,md/RB.r);ballMesh.quaternion.premultiply(q);}// the panels turn by the distance rolled
  squash=Math.max(0,squash-dt*2.5);const sq=reduced?0:squash*Math.sin(Math.min(1,squash*6)*Math.PI);ball.scale.set(1+sq*.5,1-sq,1+sq*.5);ball.position.y-=sq*RB.r;
  ballHull.quaternion.copy(ballMesh.quaternion);
  // blob shadow straight below on the ground
  {let gh=-Infinity;for(let i=w.mods[Math.max(0,s.mod-1)].p0;i<w.mods[Math.min(w.mods.length-1,s.mod+1)].p1;i++){const p=w.pieces[i];if(b.x<p.x0||b.x>p.x1||b.z<p.z0||b.z>p.z1)continue;const t=topAt(p,b.x,b.z);if(t<=b.y-RB.r+.3&&t>gh)gh=t;}
   if(gh===-Infinity)gh=RB.water;const hgt=Math.max(0,b.y-RB.r-gh);blob.position.set(b.x,gh+.02,b.z);blob.scale.setScalar(RB.r*(1.05+hgt*.25));(blob.material as T.MeshBasicMaterial).opacity=Math.max(.06,.3-hgt*.06);}
  carried.visible=b.key;if(b.key){carried.position.set(b.x,b.y+.75+Math.sin(now/240)*.06,b.z);carried.rotation.y=now/500;}
  // sand keeps a track
  if(!b.air&&b.surf==='sand'&&Math.hypot(b.x-trailLast.x,b.z-trailLast.z)>.32){trailLast={x:b.x,z:b.z};tv.set(b.x,b.y-RB.r+.012,b.z);ts.set(.17,.17,.17);tm.compose(tv,tq,ts);trail.setMatrixAt(trailN%TRAIL,tm);trailN++;trail.count=Math.min(TRAIL,trailN);trail.instanceMatrix.needsUpdate=true;}
  // moving pieces, plates, posts, objects, pickups, pools, fans, net
  for(const d of dyn){const p=w.pieces[d.piece];d.mesh.position.y=p.dy;d.mesh.visible=p.role!==2||p.dy>-3.9;}
  for(const pl of plates){const p=w.plates[pl.i];pl.cap.position.y=p.y+(p.pressed?.035:.07);pl.cap.material=p.lit?litMat:plateMat[p.kind];
   if(pl.ring){const f=p.kind==='timed'?(p.T?p.timer/p.T:0):(p.lit?1:p.T?Math.min(1,p.timer/p.T):0);pl.ring.visible=f>0;pl.ring.scale.setScalar(.6+.4*f);}}
  for(const po of posts){const p=w.posts[po.i];
   if(p.kind==='cone'){if(po.fly>0){po.parts.forEach((c,k)=>{const v=po.vel[k];v.y-=14*dt;c.position.addScaledVector(v,dt);c.rotation.x+=dt*(6+k);c.rotation.z+=dt*(3-k);if(c.position.y<-3)c.visible=false;});}else if(!p.down)po.parts.forEach((c,k)=>{c.position.set(0,.21+k*.16,0);c.rotation.set(0,0,0);c.visible=true;});}
   else if(p.kind==='switch'){const lever=po.parts[0];lever.rotation.x+=((p.on?.6:-.6)-lever.rotation.x)*Math.min(1,dt*14);const m=p.on?M.switchOn:M.switchOff;(po.parts[1] as T.Mesh).material=m;(po.parts[2] as T.Mesh).material=m;}
   else if(p.kind==='bumper'){if(po.fly<0){po.fly=Math.min(0,po.fly+dt);const k=1+Math.sin(-po.fly*Math.PI*4)*.15;po.g.scale.set(k,1,k);}}
   else if(p.kind==='lock'){po.parts[1].position.y=p.on?1.62:1.46;}
   if(!p.down&&p.kind==='cone'&&po.fly>0)po.fly=0;
  }
  for(const o of objs){const ob=w.objs[o.i];o.g.position.set(ob.x,ob.y,ob.z);if(ob.kind==='tball')o.g.rotation.x=ob.spin;}
  for(const k of picks){const p=w.picks[k.i];k.g.visible=!p.taken;if(!p.taken){k.g.rotation.y=now/(p.kind==='star'?380:600);k.g.position.y=p.y+Math.sin(now/300+k.i)*.08;}}
  for(const p of pools){const r=w.recvs[p.i];p.m.position.y=r.wy-r.open*.9;p.m.visible=r.open<.98;}
  for(const f of fans){const r=w.recvs[f.i];f.blades.rotation.y+=dt*(r.open>.5?22:.4);if(r.open>.5&&!reduced&&Math.random()<dt*14)puff(dust,r.x0+Math.random()*(r.x1-r.x0),RB.water+.6,r.z0+Math.random()*(r.z1-r.z0),1,1.2,.16);}
  if(net&&net.t<1.2){net.t+=dt;const a=net.mesh.geometry.getAttribute('position') as T.BufferAttribute,arr=a.array as Float32Array;const k=Math.max(0,1-net.t/1.2),bx=b.x-net.mesh.position.x,by=b.y-net.mesh.position.y;
   for(let i=0;i<arr.length;i+=3){const x=net.base[i],y=net.base[i+1],d=Math.hypot(x-bx,y-by);arr[i+2]=net.base[i+2]+Math.sin(d*5-net.t*18)*Math.exp(-d*.8)*.35*k;}a.needsUpdate=true;}
  for(const pool of [dust,drops])for(const p of pool){if(p.t>=p.life){p.s.visible=false;continue;}p.t+=dt;p.vy-=(pool===drops?9:2)*dt;p.s.position.x+=p.vx*dt;p.s.position.y+=p.vy*dt;p.s.position.z+=p.vz*dt;const f=1-p.t/p.life;p.s.material.opacity=f;if(p.t>=p.life)p.s.visible=false;}
  if(waterMats[theme])waterMats[theme]!.tex.offset.set(now*.00002,now*.00004);
  // camera: behind and above, leads a little in the travel direction, never dips into the water
  const lead=Math.min(2.2,sp*.25),fall=s.respawnIn>0;
  const tx=b.x*.75,ty=Math.max(RB.water+1,fall?camLook.y:b.y),tz=b.z+2.6+lead*Math.sign(b.vz||1)*.6;
  const k=1-Math.exp(-dt*(fall?1.5:5));camLook.x+=(tx-camLook.x)*k;camLook.y+=(ty-camLook.y)*k;camLook.z+=(tz-camLook.z)*k;
  const px=b.x*.6,py=(fall?camPos.y:Math.max(b.y,0)+5.8),pz=b.z-6.4;camPos.x+=(px-camPos.x)*k;camPos.y+=(py-camPos.y)*k;camPos.z+=(pz-camPos.z)*k;
  camera.position.copy(camPos);if(shake>0){shake=Math.max(0,shake-dt*.8);camera.position.x+=(Math.random()-.5)*shake;camera.position.y+=(Math.random()-.5)*shake;}camera.lookAt(camLook);
  sun.position.set(b.x+6,b.y+14,b.z-5);sun.target.position.set(b.x,b.y,b.z+2);
  renderer.render(scene,camera);
 }
 /** Screen position (CSS px) of a world point: the shell pins comic words there. */
 const pv=new T.Vector3();let cw=1,ch=1;
 function project(x:number,y:number,z:number){pv.set(x,y,z).project(camera);return {x:(pv.x+1)/2*cw,y:(1-pv.y)/2*ch,behind:pv.z>1};}
 function resize(w:number,h:number,dpr:number){cw=w;ch=h;renderer.setPixelRatio(Math.min(dpr,mobile?1.5:2));renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w/h<.75?62:50;camera.updateProjectionMatrix();}
 function snap(s:RollState){const b=s.ball;prev.x=b.x;prev.z=b.z;camPos.set(b.x*.6,Math.max(b.y,0)+5.8,b.z-6.4);camLook.set(b.x*.75,Math.max(RB.water+1,b.y),b.z+2.6);lastT=0;}
 function dispose(){clearLevel();for(const p of [...dust,...drops])scene.remove(p.s);trail.dispose();for(const d of disposables)d.dispose();renderer.dispose();renderer.forceContextLoss();}
 return {render,onEvent,resize,project,snap,dispose,get renderer(){return renderer;},get info(){return renderer.info;}};
}
