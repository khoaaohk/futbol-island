// Stadium Plaza's national flags (Nov 13 2026, owner): twelve football nations on the 14 poles lining the walk to the DRIP FC
// Stadium gate, alternating down both sides with no two neighbours alike (along a side or straight across the walk).
// Heat: ONE mesh, ONE material, ONE 512 × 256 canvas texture drawn once at build (procedural flags, no files): every pole, finial and
// cloth of the 14 flags is merged into it (1 draw call, frustum-culled as one; ~2.4k vertices). The cloth waves in the vertex shader
// (a travelling sine from the hoist, per-flag phase); per frame the CPU adds dt to one uniform and, only for a few seconds after a
// hit, decays up to 14 floats. No allocation per frame. Reduced motion: the cloth holds still and hits only sway (no flutter).
// Interaction: each pole + cloth is a 'flag' PropSpec over this mesh's own position buffer (lib/graphics/propReactions.ts), so a
// ball hit or the player walking into a pole sways the whole flag about its foot (pole and cloth together), and react() makes that
// flag's cloth flutter harder for ~1.6 s. Shadows: none of its own (the cloth's wave would need a matching depth material).
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type {PropSpec} from '../graphics/propReactions';

export const PLAZA_NATIONS=['brazil','argentina','france','germany','spain','england','italy','portugal','netherlands','mexico','usa','japan','uruguay'] as const;
export type Nation=typeof PLAZA_NATIONS[number];
export const NATION_NAMES:Record<Nation,string>={brazil:'Brazil',argentina:'Argentina',france:'France',germany:'Germany',spain:'Spain',england:'England',italy:'Italy',portugal:'Portugal',netherlands:'Netherlands',mexico:'Mexico',usa:'United States',japan:'Japan',uruguay:'Uruguay'};
/** Nation on each pole, in plazaFlagPoles() order: the north side west to east, then the south side west to east. The west end is
 *  the stadium gate, so pole 0 on each side is the front pair (owner, Nov 13: the United States and Japan at the front). Brazil
 *  flies twice (far apart); Argentina flies once (owner: the second Argentina became Uruguay). */
const NORTH:readonly Nation[]=['usa','brazil','france','spain','italy','netherlands','brazil'];
const SOUTH:readonly Nation[]=['japan','argentina','germany','england','portugal','mexico','uruguay'];
export function plazaFlagOrder(count=14):Nation[]{const half=Math.ceil(count/2),out:Nation[]=[];
 for(let k=0;k<count;k++){const side=k<half?0:1,i=side?k-half:k,run=side?SOUTH:NORTH;out.push(run[i%run.length]);}return out;}

/** Pole and cloth sizes (m): the pole's foot at y 0, the cloth's top at the pole's top less 0.25 m, the hoist on the pole's east side. */
export const FLAG={poleH:7.2,poleR:.08,cap:.12,capR:.12,w:1.9,h:1.15,y:6.4,segW:12,segH:4} as const;
/** The cloth's wave: base amplitude at the fly end (m), the extra while fluttering after a hit, wave number, speeds (rad/s). */
export const FLAG_WAVE={amp:.1,kickAmp:.3,k:7,speed:3.4,kickSpeed:4.5,kickSeconds:1.6} as const;
/** The walker counts as bumping a pole within this distance of its centre (the pole's collider 0.3 m + the walker's 0.32 m). */
export const BUMP_RADIUS=.62;

// --- The texture: 4 × 4 flag cells (128 × 80; 13 used) and two solid patches (pole white, finial gold) in the last row -------------------------------------
export const FLAG_CANVAS={w:512,h:512,cellW:128,cellH:80,cols:4} as const;
const SOLID={pole:{x:264,y:284,c:'#e9e4d6'},cap:{x:296,y:284,c:'#c9a227'}} as const;
export function flagCell(n:Nation){const i=PLAZA_NATIONS.indexOf(n),{cellW,cellH,cols}=FLAG_CANVAS;return {x:(i%cols)*cellW,y:Math.floor(i/cols)*cellH,w:cellW,h:cellH};}

type Ctx=Pick<CanvasRenderingContext2D,'fillStyle'|'fillRect'|'beginPath'|'moveTo'|'lineTo'|'closePath'|'fill'|'arc'|'ellipse'|'strokeStyle'|'lineWidth'|'stroke'|'save'|'restore'|'rect'|'clip'>;
const bandsH=(c:Ctx,x:number,y:number,w:number,h:number,cols:readonly string[],weights:readonly number[]=cols.map(()=>1))=>{
 const tot=weights.reduce((a,b)=>a+b,0);let yy=y;cols.forEach((col,i)=>{const hh=h*weights[i]/tot;c.fillStyle=col;c.fillRect(x,yy,w,hh+.5);yy+=hh;});};
const bandsV=(c:Ctx,x:number,y:number,w:number,h:number,cols:readonly string[],weights:readonly number[]=cols.map(()=>1))=>{
 const tot=weights.reduce((a,b)=>a+b,0);let xx=x;cols.forEach((col,i)=>{const ww=w*weights[i]/tot;c.fillStyle=col;c.fillRect(xx,y,ww+.5,h);xx+=ww;});};
const disc=(c:Ctx,x:number,y:number,r:number,col:string)=>{c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
/** One flag, simplified but recognisable at plaza distance (emblems reduced to a few shapes). */
export function drawNationFlag(c:Ctx,n:Nation,x:number,y:number,w:number,h:number){
 c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
 const cx=x+w/2,cy=y+h/2;
 switch(n){
  case 'brazil':{c.fillStyle='#009c3b';c.fillRect(x,y,w,h);
   c.fillStyle='#ffdf00';c.beginPath();c.moveTo(x+w*.08,cy);c.lineTo(cx,y+h*.1);c.lineTo(x+w*.92,cy);c.lineTo(cx,y+h*.9);c.closePath();c.fill();
   disc(c,cx,cy,h*.24,'#002776');
   c.strokeStyle='#ffffff';c.lineWidth=h*.05;c.beginPath();c.arc(cx+h*.05,cy+h*.55,h*.62,Math.PI*1.33,Math.PI*1.72);c.stroke();// the band
   c.fillStyle='#ffffff';for(const [dx,dy] of [[-.08,.1],[.06,.13],[.12,.04],[-.02,.16]])c.fillRect(cx+dx*h-1,cy+dy*h-1,2,2);// stars
   break;}
  case 'argentina':bandsH(c,x,y,w,h,['#74acdf','#ffffff','#74acdf']);disc(c,cx,cy,h*.11,'#f6b40e');
   c.strokeStyle='#f6b40e';c.lineWidth=1.5;for(let i=0;i<16;i++){const a=i*Math.PI/8;c.beginPath();c.moveTo(cx+Math.cos(a)*h*.12,cy+Math.sin(a)*h*.12);c.lineTo(cx+Math.cos(a)*h*.17,cy+Math.sin(a)*h*.17);c.stroke();}
   break;
  case 'france':bandsV(c,x,y,w,h,['#0055a4','#ffffff','#ef4135']);break;
  case 'germany':bandsH(c,x,y,w,h,['#000000','#dd0000','#ffce00']);break;
  case 'spain':bandsH(c,x,y,w,h,['#aa151b','#f1bf00','#aa151b'],[1,2,1]);
   c.fillStyle='#aa151b';c.fillRect(x+w*.24,y+h*.36,w*.1,h*.26);c.fillStyle='#c8b100';c.fillRect(x+w*.24,y+h*.31,w*.1,h*.05);// the arms, simplified
   break;
  case 'england':c.fillStyle='#ffffff';c.fillRect(x,y,w,h);c.fillStyle='#ce1124';c.fillRect(cx-h*.1,y,h*.2,h);c.fillRect(x,cy-h*.1,w,h*.2);break;
  case 'italy':bandsV(c,x,y,w,h,['#009246','#ffffff','#ce2b37']);break;
  case 'portugal':{bandsV(c,x,y,w,h,['#006600','#ff0000'],[2,3]);const sx=x+w*.4;
   c.strokeStyle='#ffe000';c.lineWidth=h*.05;c.beginPath();c.arc(sx,cy,h*.22,0,Math.PI*2);c.stroke();// the armillary sphere
   c.fillStyle='#ff0000';c.fillRect(sx-h*.12,cy-h*.14,h*.24,h*.27);c.fillStyle='#ffffff';c.fillRect(sx-h*.08,cy-h*.1,h*.16,h*.19);
   c.fillStyle='#003399';c.fillRect(sx-h*.025,cy-h*.06,h*.05,h*.11);// the shield, simplified
   break;}
  case 'netherlands':bandsH(c,x,y,w,h,['#ae1c28','#ffffff','#21468b']);break;
  case 'mexico':bandsV(c,x,y,w,h,['#006847','#ffffff','#ce1126']);
   c.strokeStyle='#3d7a2a';c.lineWidth=2;c.beginPath();c.arc(cx,cy+h*.02,h*.17,Math.PI*.15,Math.PI*.85);c.stroke();// the wreath
   c.fillStyle='#8c5a2b';c.beginPath();c.ellipse(cx,cy-h*.02,h*.1,h*.13,0,0,Math.PI*2);c.fill();// the eagle, simplified
   c.fillStyle='#5a3a1a';c.beginPath();c.ellipse(cx+h*.05,cy-h*.12,h*.04,h*.035,0,0,Math.PI*2);c.fill();
   break;
  case 'uruguay':{for(let i=0;i<9;i++){c.fillStyle=i%2?'#0038a8':'#ffffff';c.fillRect(x,y+h*i/9,w,h/9+.5);}
   const sw=w*.36,sh=h*5/9;c.fillStyle='#ffffff';c.fillRect(x,y,sw,sh);const sx=x+sw/2,sy=y+sh/2;disc(c,sx,sy,h*.1,'#fcd116');// the Sun of May
   c.strokeStyle='#fcd116';c.lineWidth=1.5;for(let i=0;i<16;i++){const a=i*Math.PI/8;c.beginPath();c.moveTo(sx+Math.cos(a)*h*.11,sy+Math.sin(a)*h*.11);c.lineTo(sx+Math.cos(a)*h*.17,sy+Math.sin(a)*h*.17);c.stroke();}
   break;}
  case 'usa':{for(let i=0;i<13;i++){c.fillStyle=i%2?'#ffffff':'#b22234';c.fillRect(x,y+h*i/13,w,h/13+.5);}
   const cw=w*.4,ch=h*7/13;c.fillStyle='#3c3b6e';c.fillRect(x,y,cw,ch);
   for(let r=0;r<5;r++)for(let k=0;k<(r%2?5:6);k++)disc(c,x+cw*(k+(r%2?1:.5))/6.1,y+ch*(r+.6)/5.2,1.3,'#ffffff');// stars, simplified
   break;}
  case 'japan':c.fillStyle='#ffffff';c.fillRect(x,y,w,h);disc(c,cx,cy,h*.3,'#bc002d');break;
 }
 c.restore();
}
/** The whole texture: each flag in its cell (bled 2 px into the cell edge), and the two solid patches. */
export function drawFlagCanvas(c:Ctx){
 c.fillStyle='#2a2a2a';c.fillRect(0,0,FLAG_CANVAS.w,FLAG_CANVAS.h);
 for(const n of PLAZA_NATIONS){const r=flagCell(n);drawNationFlag(c,n,r.x,r.y,r.w,r.h);}
 for(const s of Object.values(SOLID)){c.fillStyle=s.c;c.fillRect(s.x-8,s.y-8,24,16);}
}

/** The merged geometry for poles at `poles` with nations `order`: per flag a pole, a finial and a (segW × segH) cloth, in that
 *  order, `perFlag` vertices each. Attributes: position (world), normal, uv, aWave (0 at the hoist .. 1 at the fly; −1 off the
 *  cloth) and aFlag (the flag's index). */
export function plazaFlagGeometry(poles:readonly {x:number;z:number}[],order:readonly Nation[]){
 const {w:TW,h:TH}=FLAG_CANVAS,parts:T.BufferGeometry[]=[];
 const solid=(g:T.BufferGeometry,s:{x:number;y:number},k:number)=>{const uv=g.getAttribute('uv') as T.BufferAttribute;for(let i=0;i<uv.count;i++)uv.setXY(i,s.x/TW,1-s.y/TH);
  g.setAttribute('aWave',new T.Float32BufferAttribute(new Array(uv.count).fill(-1),1));g.setAttribute('aFlag',new T.Float32BufferAttribute(new Array(uv.count).fill(k),1));return g;};
 poles.forEach((p,k)=>{
  const pole=new T.CylinderGeometry(FLAG.poleR,FLAG.poleR,FLAG.poleH,8,1);pole.translate(p.x,FLAG.poleH/2,p.z);parts.push(solid(pole,SOLID.pole,k));
  const cap=new T.CylinderGeometry(FLAG.capR,FLAG.capR,FLAG.cap,8,1);cap.translate(p.x,FLAG.poleH+FLAG.cap/2-.0,p.z);parts.push(solid(cap,SOLID.cap,k));
  const cloth=new T.PlaneGeometry(FLAG.w,FLAG.h,FLAG.segW,FLAG.segH),cell=flagCell(order[k]),uv=cloth.getAttribute('uv') as T.BufferAttribute,pos=cloth.getAttribute('position') as T.BufferAttribute;
  const wave=new Float32Array(uv.count);
  for(let i=0;i<uv.count;i++){const u=uv.getX(i),v=uv.getY(i);wave[i]=(pos.getX(i)+FLAG.w/2)/FLAG.w;
   uv.setXY(i,(cell.x+2+u*(cell.w-4))/TW,1-(cell.y+2+(1-v)*(cell.h-4))/TH);}
  cloth.translate(p.x+FLAG.poleR*.75+FLAG.w/2,FLAG.y,p.z);
  cloth.setAttribute('aWave',new T.BufferAttribute(wave,1));cloth.setAttribute('aFlag',new T.Float32BufferAttribute(new Array(uv.count).fill(k),1));parts.push(cloth);
 });
 const perFlag=parts.slice(0,3).reduce((n,g)=>n+g.getAttribute('position').count,0);
 const merged=mergeGeometries(parts)!;for(const g of parts)g.dispose();
 return {geometry:merged,perFlag};
}

/** The cloth's wave, shared by the shader and the tests: displacement along the cloth's normal (z) at hoist distance u (0..1). */
export const waveOffset=(u:number,t:number,flag:number,kick:number)=>u<0?0:u*(FLAG_WAVE.amp+FLAG_WAVE.kickAmp*kick)*Math.sin(u*FLAG_WAVE.k-t*(FLAG_WAVE.speed+FLAG_WAVE.kickSpeed*kick)+flag*1.7);

export function createPlazaFlags(poles:readonly {x:number;z:number}[],order:readonly Nation[]=plazaFlagOrder(poles.length)){
 const n=poles.length,{geometry,perFlag}=plazaFlagGeometry(poles,order);
 const canvas=typeof document!=='undefined'?document.createElement('canvas'):null;
 if(canvas){canvas.width=FLAG_CANVAS.w;canvas.height=FLAG_CANVAS.h;const c=canvas.getContext('2d');if(c)drawFlagCanvas(c);}
 const texture=new T.CanvasTexture(canvas as HTMLCanvasElement);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
 const kick=new Float32Array(n),uTime={value:0},uKick={value:kick};
 const material=new T.MeshStandardMaterial({map:texture,roughness:.85,side:T.DoubleSide});
 material.onBeforeCompile=sh=>{
  sh.uniforms.uTime=uTime;sh.uniforms.uKick=uKick;
  const W=FLAG_WAVE,f=(x:number)=>x.toFixed(4);
  sh.vertexShader=sh.vertexShader.replace('#include <common>',`#include <common>
attribute float aWave;attribute float aFlag;uniform float uTime;uniform float uKick[${n}];`)
   .replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
float fKick=uKick[int(aFlag+.5)],fU=max(aWave,0.),fAmp=${f(W.amp)}+${f(W.kickAmp)}*fKick,fArg=fU*${f(W.k)}-uTime*(${f(W.speed)}+${f(W.kickSpeed)}*fKick)+aFlag*1.7;
float fWave=fU*fAmp*sin(fArg);
if(aWave>=0.){float dzdx=(fAmp*sin(fArg)+fU*fAmp*${f(W.k)}*cos(fArg))/${f(FLAG.w)};objectNormal=normalize(vec3(-dzdx,0.,1.));}`)
   .replace('#include <begin_vertex>',`#include <begin_vertex>
if(aWave>=0.){transformed.z+=fWave;transformed.y+=fU*.035*sin(fArg*.7+1.3);transformed.x-=fU*fU*.04*(1.-cos(fArg));}`);
 };
 material.customProgramCacheKey=()=>'plaza-flags-'+n;
 const mesh=new T.Mesh(geometry,material);mesh.name='plaza-flags';mesh.castShadow=false;mesh.receiveShadow=true;
 mesh.userData.ownDraw=true;mesh.userData.skipRoofObstacle=true;mesh.matrixAutoUpdate=false;mesh.updateMatrix();geometry.computeBoundingSphere();
 const position=geometry.getAttribute('position') as T.BufferAttribute;
 const propSpecs:PropSpec[]=poles.map((p,k)=>({kind:'flag',parts:[{attribute:position,start:k*perFlag,count:perFlag}],
  min:{x:p.x-FLAG.capR,y:0,z:p.z-.6},max:{x:p.x+FLAG.poleR+FLAG.w,y:FLAG.poleH+FLAG.cap,z:p.z+.6},pivot:{x:p.x,y:0,z:p.z}}));
 let live=0,touching=-1;const xs=poles.map(p=>p.x),zs=poles.map(p=>p.z),area={x0:Math.min(...xs)-1,x1:Math.max(...xs)+1,z0:Math.min(...zs)-1,z1:Math.max(...zs)+1};
 const stats={reacts:0,bumps:0,kickUpdates:0};
 return {
  mesh,material,texture,propSpecs,poles,order,kick,uniforms:{uTime,uKick},stats,perFlag,
  /** Each frame: the wave's clock (held still under reduced motion) and the flutter's decay (only while one is running). */
  update(dt:number,reduced=false){
   if(!reduced&&dt>0)uTime.value=(uTime.value+dt)%(Math.PI*200);
   if(!live)return;stats.kickUpdates++;let any=0;const d=dt/FLAG_WAVE.kickSeconds;
   for(let k=0;k<n;k++)if(kick[k]>0){kick[k]=reduced?0:Math.max(0,kick[k]-d);if(kick[k]>0)any++;}
   live=any;
  },
  /** A hit at (x, z) (a ball, or the walker): the nearest flag within 2.5 m of its pole flutters harder, by speed (m/s). */
  react(x:number,z:number,speed:number,reduced=false){
   if(reduced)return -1;let best=-1,bd=6.25;
   for(let k=0;k<n;k++){const d=(poles[k].x-x)**2+(poles[k].z-z)**2;if(d<bd){bd=d;best=k;}}
   if(best<0)return -1;kick[best]=Math.max(kick[best],Math.min(1,.45+speed/20));live=1;stats.reacts++;return best;
  },
  /** The walker at (x, z): the pole they just walked into (once per contact), or −1. One box test away from the plaza. */
  bump(x:number,z:number){
   if(touching<0&&(x<area.x0||x>area.x1||z<area.z0||z>area.z1))return -1;
   if(touching>=0){const p=poles[touching];if((p.x-x)**2+(p.z-z)**2<(BUMP_RADIUS+.3)**2)return -1;touching=-1;}
   for(let k=0;k<n;k++){const p=poles[k];if(Math.abs(p.x-x)<BUMP_RADIUS&&Math.abs(p.z-z)<BUMP_RADIUS&&(p.x-x)**2+(p.z-z)**2<BUMP_RADIUS**2){touching=k;stats.bumps++;return k;}}
   return -1;
  },
  dispose(){mesh.removeFromParent();geometry.dispose();material.dispose();texture.dispose();},
 };
}
export type PlazaFlags=ReturnType<typeof createPlazaFlags>;
