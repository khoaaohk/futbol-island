// West Stadium, phase 3b (Nov 12 2026, docs/stadium/PLAN.md): a crowd in the stands, heat-first.
// Nov 13 2026 (owner): the fans are mini beans in the island's bean look (a rounded bean body in the stand's shirt colour with the
// kid's own body colour on the crown, a face panel with two eyes, two little arms and a scarf), FAN_TRIS triangles each, still ONE
// InstancedMesh (1 draw call, no shadow pass): about a third of the 5,030 seats on desktop, fewer on phones and under heat-tier
// pressure (Battery saver: a handful). Built lazily the first time the player comes near; hidden beyond CROWD_RADIUS and
// frustum-culled by three when the bowl is off screen.
// Crowd life, all in the vertex shader from a few shared uniforms (no per-instance CPU work, the instance buffers are written once):
// the shared mood (stadiumMood.ts) drives an idle sway on its beat clock, arms pumping on the beat during a chant, sections standing
// with their arms up as the excitement climbs (a chance, a near miss, a goal), a Mexican wave travelling round the bowl now and then,
// scarves held up during a slow song, and the old goal bounce. A few big cloth flags wave in the stands (one merged mesh, one draw,
// a vertex wave like plazaFlags.ts). Between matches the stands sit still (nothing moves, nothing asks for frames).
// Reduced motion: no sway, pumping, wave, bounce or flag waving (sections still stand and scarves still rise, slowly). Hot devices
// (heat tier 2+): no wave or pumping, half the sway; phones at tier 2+ and everyone at tier 3+ drop the flags.
// The fans' seats are a fixed shuffled order (sorted by a per-seat key), so a lower fill is simply a smaller instance count; the
// seats at each span's ends (by the aisles and the stand ends) stay free (some hold the flags), and a shader uniform clears the fans
// round the player (their own seat, or where they walk along a row), so nobody sits in a fan.
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {effectiveTier} from '../graphics/heatTier';
import {STADIUM} from './westParkLayout';
import {BODY_COLOURS,SKIN_TONES} from './beanLooks';
import {stadiumMood,type StadiumMood} from './stadiumMood';
import {STANDS,ROWS,ROW_DEPTH,SEAT_DEPTH,SEAT_TOP,rowHeight,spanSeats,standSpans,standWorld,standYaw,SEAT_PITCH} from './stadiumSeats';

/** The highest fill key ever shown (desktop, tier 0: about 36 % of the seats); the instance buffer holds exactly these fans. */
export const CROWD_MAX_FILL=.5;
/** The crowd shows within this distance of the stadium centre (m): the bowl's far stand is ~85 m from the centre. */
export const CROWD_RADIUS=150;
/** Triangles per mini bean: body 56 (8 sides, 3 bands and a domed top; no bottom, it sits on the seat), two arms 6 each, the
 *  scarf 4 (a front and a back quad, collapsed to nothing unless it is held up). */
export const FAN_TRIS=72;
/** The goal bounce (s) and the fans cleared round the player (m). */
export const CHEER_TIME=2.6,CLEAR_RADIUS=1.1;
/** Seated friends whose seats the crowd keeps clear (more than this many seated friends in view: the rest may share a fan). */
export const CLEAR_FRIENDS=8;
/** The mini bean (m, fan space: y up from the seat, +z towards the pitch): body rings [y, radius], the top, depth squash, the
 *  shirt's top (the island bean's shirt band, BEAN_BANDS.shirt ≈ 0.585 of the height), the face panel and eyes, arms, scarf. */
export const BEAN={rings:[[0,.15],[.22,.2],[.47,.175],[.61,.11]] as const,top:.675,sides:8,depth:.9,shirtTop:.4,
 face:{y:.5,rx:.105,ry:.075},eye:{x:.042,y:.512,r:.017},shoulder:{x:.19,y:.43},arm:{len:.3,r:.045},scarf:{h:.13,lift:.06,z:.07}} as const;
/** Bowl sections (round the centre) that stand together, and the wave's half-width (radians). */
export const CROWD_SECTIONS=16,WAVE_WIDTH=.22;
/** Flags in the stands (desktop / phone) and their size (m). */
export const STAND_FLAGS={desktop:8,phone:6,poleH:3.3,poleR:.035,w:2.1,h:1.3,segW:8,segH:2,amp:.2,k:6,speed:3.8} as const;
export const FLAG_TRIS=STAND_FLAGS.segW*STAND_FLAGS.segH*2+6;

/** The fill key for this device and heat tier (lib/graphics/heatTier: 0 default … 4 lowest / Battery saver). About 0.72 × the
 *  key is the share of seats filled: desktop ~36 %, phone ~22 %, tier 2 ~16 / 9 %, saver ~5 %. */
export function crowdFill(phone:boolean,tier:number){
 if(tier>=4)return .07;if(tier>=2)return phone?.13:.22;if(tier>=1)return phone?.2:.35;return phone?.3:CROWD_MAX_FILL;
}
export type Fan={x:number;y:number;z:number;yaw:number;key:number;colour:string};
const hash=(a:number,b:number,c:number)=>{const s=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453;return s-Math.floor(s);};
const NEUTRAL=['#f4f1e6','#2b3a42','#e9b949','#7a4fa0'];
/** The filled seats, fullest first (sorted by key: a fill f takes the fans with key < f). Middle blocks and lower rows fill first. */
export function crowdSeats():Fan[]{
 const out:Fan[]=[];
 STANDS.forEach((s,si)=>{const yaw=standYaw(s),reach=Math.max(Math.abs(s.from),Math.abs(s.to));
  for(const [a0,a1] of standSpans(s).seats){const {n,start}=spanSeats(a0,a1);
   for(let k=1;k<n-1;k++){const sa=start+k*SEAT_PITCH;// k 0 and n-1: the seats by the aisle / stand end stay free
    for(let i=0;i<ROWS;i++){
     const w=.45+.4*(1-Math.abs(sa)/reach)+.15*(1-i/ROWS),h=hash(si,i,sa),key=h/w;if(key>=CROWD_MAX_FILL)continue;
     const p=standWorld(s,s.inner+i*ROW_DEPTH+SEAT_DEPTH-.04,sa),c=hash(sa,i,si+7);
     out.push({x:p.x,y:rowHeight(i)+SEAT_TOP,z:p.z,yaw,key,colour:c<.68?s.team[0]:c<.9?s.team[1]:NEUTRAL[Math.floor(c*97)%NEUTRAL.length]});
    }
   }
  }
 });
 return out.sort((p,q)=>p.key-q.key);
}
/** How many of the sorted fans a fill shows. */
export function crowdCount(fans:readonly Fan[],fill:number){let lo=0,hi=fans.length;while(lo<hi){const m=(lo+hi)>>1;if(fans[m].key<fill)lo=m+1;else hi=m;}return lo;}

/** aFan = (part, side, extra): part 0 body, 1 arm, 2 scarf; side −1 / +1 for an arm or a scarf edge; extra = the scarf vertex's
 *  height above the hands. */
function withFan(g:T.BufferGeometry,part:number,side:(i:number)=>number,extra:(i:number)=>number=()=>0){
 const n=g.getAttribute('position').count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=part;a[i*3+1]=side(i);a[i*3+2]=extra(i);}
 g.setAttribute('aFan',new T.BufferAttribute(a,3));for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal'&&k!=='aFan')g.deleteAttribute(k);return g;
}
function beanBody(){
 const S=BEAN.sides,R=BEAN.rings,pos:number[]=[],idx:number[]=[];
 for(const [y,r] of R)for(let k=0;k<S;k++){const a=k/S*Math.PI*2;pos.push(Math.sin(a)*r,y,Math.cos(a)*r*BEAN.depth);}
 pos.push(0,BEAN.top,0);const top=R.length*S;
 for(let j=0;j<R.length-1;j++)for(let k=0;k<S;k++){const a=j*S+k,b=j*S+(k+1)%S,c=a+S,d=b+S;idx.push(a,b,d,a,d,c);}
 for(let k=0;k<S;k++)idx.push((R.length-1)*S+k,(R.length-1)*S+(k+1)%S,top);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return withFan(g,0,()=>0);
}
function beanArm(side:number){
 const {x,y}=BEAN.shoulder,{len,r}=BEAN.arm,pos:number[]=[],idx:number[]=[];
 for(const dy of [0,-len])for(let k=0;k<3;k++){const a=k/3*Math.PI*2+.5;pos.push(side*(x+.02)+Math.sin(a)*r,y+dy,Math.cos(a)*r);}
 for(let k=0;k<3;k++){const a=k,b=(k+1)%3;idx.push(a,a+3,b+3,a,b+3,b);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return withFan(g,1,()=>side);
}
function beanScarf(){
 // Two quads (front towards the pitch, back towards the stand); the shader hangs each edge from a hand.
 const h=BEAN.scarf.h,pos:number[]=[],nrm:number[]=[],side:number[]=[],up:number[]=[],idx:number[]=[];
 for(const f of [1,-1]){const o=pos.length/3;for(const [s,v] of [[-1,0],[1,0],[1,h],[-1,h]]){pos.push(s*.32,.75+v,BEAN.scarf.z);nrm.push(0,0,f);side.push(s);up.push(v);}
  if(f>0)idx.push(o,o+1,o+2,o,o+2,o+3);else idx.push(o,o+2,o+1,o,o+3,o+2);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nrm,3));g.setIndex(idx);
 return withFan(g,2,i=>side[i],i=>up[i]);
}
export function fanGeometry(){
 const parts=[beanBody(),beanArm(-1),beanArm(1),beanScarf()],g=mergeGeometries(parts)!;for(const p of parts)p.dispose();
 // Bounds over every pose (standing, arms up, the scarf held high): the instanced mesh's culling sphere is built from these.
 g.boundingBox=new T.Box3(new T.Vector3(-.5,-.05,-.4),new T.Vector3(.5,1.35,.4));g.boundingSphere=g.boundingBox.getBoundingSphere(new T.Sphere());
 return g;
}

/** The crowd's life uniforms for a mood (pure: tests read it). reduced = reduced motion; tier = the heat tier. */
export type CrowdLife={sway:number;pump:number;excite:number;wave:number;waveAngle:number;scarf:number;beat:number;flagSwing:number;moving:boolean};
export function crowdLife(m:Readonly<StadiumMood>,reduced:boolean,tier:number):CrowdLife{
 if(!m.live)return {sway:0,pump:0,excite:0,wave:0,waveAngle:0,scarf:0,beat:0,flagSwing:0,moving:false};
 const hot=tier>=2,calm=reduced;
 const slow=m.phase==='slow-song',chant=m.phase==='chant';
 return {
  sway:calm?0:(slow?1:chant?.6:.3)*(hot?.5:1),
  pump:calm||hot||!chant?0:.5+.5*Math.min(1,m.excitement*1.5),
  excite:m.excitement,
  wave:calm||hot?0:m.wave.on,waveAngle:m.wave.angle,
  scarf:m.scarves,
  beat:m.beat%16,
  flagSwing:calm?0:.4+.6*m.excitement,
  moving:!calm,
 };
}

/** Flag spots: the free aisle-end seat (k = 0) of chosen spans in the upper rows; the cloth flies along the row. */
export function standFlagSpots(count:number){
 const out:{x:number;y:number;z:number;dx:number;dz:number;team:readonly [string,string]}[]=[];
 const per=STANDS.map((s):number=>s.axis==="x"?3:2);let total=per.reduce((a,b)=>a+b,0);
 const take=STANDS.map((_,i)=>per[i]);while(total>count){const i=take.indexOf(Math.max(...take));take[i]--;total--;}
 STANDS.forEach((s,si)=>{const spans=standSpans(s).seats;
  for(let j=0;j<take[si];j++){const sp=spans[Math.floor((j+.5)/take[si]*spans.length)],{start}=spanSeats(sp[0],sp[1]),row=ROWS-2-(j%2);
   const p=standWorld(s,s.inner+row*ROW_DEPTH+SEAT_DEPTH-.04,start),dir=s.axis==='x'?{dx:0,dz:1}:{dx:1,dz:0};
   out.push({x:p.x,y:rowHeight(row)+SEAT_TOP-.1,z:p.z,...dir,team:s.team});}
 });
 return out;
}
export function standFlagGeometry(spots:ReturnType<typeof standFlagSpots>){
 const F=STAND_FLAGS,parts:T.BufferGeometry[]=[],c0=new T.Color(),c1=new T.Color(),grey=new T.Color('#c9ccd1');
 spots.forEach((p,k)=>{
  const pole=new T.CylinderGeometry(F.poleR,F.poleR,F.poleH,3,1,true);pole.translate(p.x,p.y+F.poleH/2,p.z);
  const cloth=new T.PlaneGeometry(F.w,F.h,F.segW,F.segH);
  // The cloth in the (row, up) plane, its hoist on the pole, its face towards the pitch.
  const cp=cloth.getAttribute('position') as T.BufferAttribute,wave:number[]=[];
  for(let i=0;i<cp.count;i++){const u=(cp.getX(i)+F.w/2)/F.w,v=cp.getY(i);wave.push(u);const a=F.poleR+u*F.w,y=p.y+F.poleH-.05-F.h/2+v;cp.setXYZ(i,p.x+p.dx*a,y,p.z+p.dz*a);}
  cloth.computeVertexNormals();
  for(const [g,isCloth] of [[pole,false],[cloth,true]] as const){const n=g.getAttribute('position').count,info=new Float32Array(n*4),base=new Float32Array(n*3),col=new Float32Array(n*3),col2=new Float32Array(n*3);
   const uv=g.getAttribute('uv') as T.BufferAttribute;c0.set(p.team[0]);c1.set(p.team[1]);
   for(let i=0;i<n;i++){info.set([isCloth?wave[i]:-1,k,p.dx,p.dz],i*4);base.set([p.x,p.y,p.z],i*3);const a=isCloth?c0:grey,b=isCloth?c1:grey;col.set([a.r,a.g,a.b],i*3);col2.set([b.r,b.g,b.b],i*3);}
   g.setAttribute('aFlagInfo',new T.BufferAttribute(info,4));g.setAttribute('aFlagBase',new T.BufferAttribute(base,3));g.setAttribute('color',new T.BufferAttribute(col,3));g.setAttribute('aColor2',new T.BufferAttribute(col2,3));
   if(!isCloth)for(let i=0;i<n;i++)uv.setY(i,.5);parts.push(g);}
 });
 const g=mergeGeometries(parts)!;for(const p of parts)p.dispose();g.computeBoundingSphere();if(g.boundingSphere)g.boundingSphere.radius+=3;return g;
}

const linear=(hex:string)=>new T.Color(hex);
export function createStadiumCrowd(parent:T.Object3D,phone:boolean){
 let mesh:T.InstancedMesh|null=null,flags:T.Mesh|null=null,fans:Fan[]=[],cheer=0,shownFill=-1;
 const uniforms={uCheer:{value:0},uTime:{value:0},uClear:{value:new T.Vector3(0,0,-1)},uClearF:{value:Array.from({length:CLEAR_FRIENDS},()=>new T.Vector3(0,0,-1))},
  uBeat:{value:0},uSway:{value:0},uPump:{value:0},uExcite:{value:0},uWave:{value:new T.Vector2(0,0)},uScarf:{value:0},uCentre:{value:new T.Vector2(STADIUM.x,STADIUM.z)},
  uBodyPal:{value:BODY_COLOURS.slice(0,8).map(linear)},uSkinPal:{value:SKIN_TONES.slice(1,7).map(linear)}};
 const flagUniforms={uClock:{value:0},uFlagSwing:{value:0},uClear:uniforms.uClear};
 let life:CrowdLife=crowdLife(stadiumMood(),false,0);
 function build(){
  fans=crowdSeats();
  const mat=new T.MeshLambertMaterial();
  const B=BEAN,g=(x:number)=>x.toFixed(4);
  mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,uniforms);
   sh.vertexShader=`attribute vec3 aFan;
uniform float uCheer;uniform float uTime;uniform vec3 uClear;uniform vec3 uClearF[${CLEAR_FRIENDS}];
uniform float uBeat;uniform float uSway;uniform float uPump;uniform float uExcite;uniform vec2 uWave;uniform float uScarf;uniform vec2 uCentre;
uniform vec3 uBodyPal[8];uniform vec3 uSkinPal[6];
varying vec3 vFanP;varying float vFanPart;varying vec3 vFanBody;varying vec3 vFanSkin;varying float vFanU;
vec2 fanRot(vec2 p,float a){float c=cos(a),s=sin(a);return vec2(p.x*c-p.y*s,p.x*s+p.y*c);}
`+sh.vertexShader
    .replace('#include <color_vertex>',`#include <color_vertex>
 vec3 fanAt=vec3(instanceMatrix[3][0],instanceMatrix[3][1],instanceMatrix[3][2]);
 float fanH=fract(sin(dot(fanAt.xz,vec2(12.9898,78.233)))*43758.5453),fanH2=fract(fanH*7.13+.37);
 vec2 fanRel=fanAt.xz-uCentre;float fanAng=atan(fanRel.y,fanRel.x);
 float fanSect=floor((fanAng+3.14159265)/6.2831853*${g(CROWD_SECTIONS)}),sectH=fract(sin(fanSect*78.233+1.7)*43758.5453);
 // Sections stand as the excitement climbs (each section its own threshold, a little jitter per fan); the wave lifts a band.
 float fanStand=smoothstep(0.,.1,uExcite-(.42+.45*sectH)-(fanH-.5)*.06);
 float fanD=abs(mod(fanAng-uWave.y+3.14159265,6.2831853)-3.14159265);
 float fanUp=max(max(fanStand,uWave.x*exp(-fanD*fanD/${g(WAVE_WIDTH*WAVE_WIDTH)})),uCheer);
 float fanScarf=step(fanH2,.75)*smoothstep(fanH*.5,fanH*.5+.4,uScarf);
 float fanBeat=uBeat*3.14159265;
 float armA=mix(.15,1.5+.9*max(0.,sin(fanBeat*2.+fanH*.6)),uPump*step(fanH2,.4));
 armA=mix(armA,2.72,fanScarf);armA=mix(armA,2.55+.15*sin(uTime*9.+fanH*6.),fanUp);
 vFanPart=aFan.x;vFanP=position;vFanU=aFan.y*.5+.5;
 int fanB=int(fanH2*7.99),fanS=int(fract(fanH*3.71)*5.99);vFanBody=uBodyPal[fanB];vFanSkin=uSkinPal[fanS];
 vec2 fanPivot=vec2(aFan.y*${g(B.shoulder.x)},${g(B.shoulder.y)});`)
    .replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
 if(aFan.x>.5&&aFan.x<1.5)objectNormal.xy=fanRot(objectNormal.xy,aFan.y*armA);`)
    .replace('#include <begin_vertex>',`#include <begin_vertex>
 if(aFan.x>.5&&aFan.x<1.5){transformed.xy=fanPivot+fanRot(transformed.xy-fanPivot,aFan.y*armA);}
 else if(aFan.x>1.5){vec2 hand=fanPivot+fanRot(vec2(aFan.y*.02,-${g(B.arm.len)}),aFan.y*armA);
  transformed=vec3(hand.x+aFan.y*.04,hand.y-${g(B.scarf.lift)}+aFan.z,${g(B.scarf.z)});transformed*=step(.5,fanScarf*(1.-fanUp));}
 float fanY=transformed.y/${g(B.top)};
 transformed.y*=1.+.12*fanUp;transformed.y+=fanUp*.3+uCheer*max(0.,sin(uTime*13.+fanH*6.2832))*.3;
 transformed.x+=uSway*.05*sin(fanBeat+sectH*.8)*fanY;
 transformed*=1.-step(distance(fanAt.xz,uClear.xy),uClear.z);
 for(int i=0;i<${CLEAR_FRIENDS};i++)transformed*=1.-step(distance(fanAt.xz,uClearF[i].xy),uClearF[i].z);`);
   sh.fragmentShader=`varying vec3 vFanP;varying float vFanPart;varying vec3 vFanBody;varying vec3 vFanSkin;varying float vFanU;
`+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec3 fanCol=vFanBody;
 if(vFanPart<.5){
  fanCol=vFanP.y<${g(B.shirtTop)}?vColor:vFanBody;
  if(vFanP.z>0.){vec2 f=(vFanP.xy-vec2(0.,${g(B.face.y)}))/vec2(${g(B.face.rx)},${g(B.face.ry)});if(dot(f,f)<1.)fanCol=vFanSkin;
   vec2 e=vec2(abs(vFanP.x)-${g(B.eye.x)},vFanP.y-${g(B.eye.y)});if(dot(e,e)<${g(B.eye.r*B.eye.r)})fanCol=vec3(.02,.02,.03);}
 }else if(vFanPart>1.5)fanCol=fract(vFanU*4.)<.5?vColor:vec3(.92,.92,.9);
 diffuseColor.rgb=fanCol;`);
  };
  mat.customProgramCacheKey=()=>'stadium-crowd-bean';
  mesh=new T.InstancedMesh(fanGeometry(),mat,fans.length);mesh.name='stadium-crowd';mesh.castShadow=mesh.receiveShadow=false;
  const m=new T.Matrix4(),q=new T.Quaternion(),one=new T.Vector3(1,1,1),up=new T.Vector3(0,1,0),c=new T.Color(),at=new T.Vector3();
  fans.forEach((f,i)=>{m.compose(at.set(f.x,f.y-.045,f.z),q.setFromAxisAngle(up,f.yaw),one);mesh!.setMatrixAt(i,m);mesh!.setColorAt(i,c.set(f.colour));});
  mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  // Bounds over every fan (the culling sphere covers the bowl; three culls the one draw when it is off screen).
  mesh.computeBoundingSphere();mesh.computeBoundingBox();mesh.matrixAutoUpdate=false;mesh.updateMatrix();
  parent.add(mesh);
  // The stand flags: one merged mesh, one draw, waving in the vertex shader.
  const fm=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}),F=STAND_FLAGS;
  fm.onBeforeCompile=sh=>{Object.assign(sh.uniforms,flagUniforms);
   sh.vertexShader=`attribute vec4 aFlagInfo;attribute vec3 aFlagBase;attribute vec3 aColor2;uniform float uClock;uniform float uFlagSwing;uniform vec3 uClear;
varying vec3 vFlagC2;varying float vFlagV;
`+sh.vertexShader
    .replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
 vFlagC2=aColor2;vFlagV=uv.y;
 vec2 fDir=aFlagInfo.zw,fNrm=vec2(-fDir.y,fDir.x);float fU=max(aFlagInfo.x,0.),fK=aFlagInfo.y;
 float fArg=fU*${g(F.k)}-uClock*${g(F.speed)}+fK*1.7,fAmp=${g(F.amp)}*(.6+.6*uFlagSwing);
 float fPhi=uFlagSwing*.28*sin(uClock*1.6+fK*2.1);
 if(aFlagInfo.x>=0.){float dn=(fAmp*sin(fArg)+fU*fAmp*${g(F.k)}*cos(fArg))/${g(F.w)};vec3 n3=vec3(fNrm.x,0.,fNrm.y)-vec3(fDir.x,0.,fDir.y)*dn;objectNormal=normalize(n3);}`)
    .replace('#include <begin_vertex>',`#include <begin_vertex>
 {vec3 r=transformed-aFlagBase;float a=dot(r.xz,fDir),n=dot(r.xz,fNrm),y=r.y;
  if(aFlagInfo.x>=0.)n+=fU*fAmp*sin(fArg);
  float c=cos(fPhi),s=sin(fPhi),a2=a*c+y*s,y2=-a*s+y*c;
  transformed=aFlagBase+vec3(fDir.x,0.,fDir.y)*a2+vec3(fNrm.x,0.,fNrm.y)*n+vec3(0.,y2,0.);
  if(distance(aFlagBase.xz,uClear.xy)<uClear.z+.8)transformed=aFlagBase;}`);
   sh.fragmentShader=`varying vec3 vFlagC2;varying float vFlagV;
`+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 diffuseColor.rgb=abs(vFlagV-.5)<.17?vFlagC2:vColor;`);
  };
  fm.customProgramCacheKey=()=>'stadium-stand-flags';
  flags=new T.Mesh(standFlagGeometry(standFlagSpots(phone?F.phone:F.desktop)),fm);flags.name='stadium-stand-flags';flags.castShadow=flags.receiveShadow=false;
  flags.matrixAutoUpdate=false;flags.updateMatrix();parent.add(flags);
 }
 return {
  /** Each frame near the stadium: dc = the player's distance from the centre; (x, z, onStand) = where to keep fans away;
   *  friends = seats other players sit in (stadiumSeatShare remoteSeatSpots), kept clear too. The crowd's life comes from the
   *  shared mood (stadiumMood.ts, stepped by stadiumSit just before). */
  update(dc:number,x:number,z:number,onStand:boolean,dt:number,reduced:boolean,friends:readonly {x:number;z:number}[]=[]){
   const near=dc<CROWD_RADIUS;
   if(!near){if(mesh?.visible)mesh.visible=false;if(flags?.visible)flags.visible=false;return;}
   if(!mesh)build();const me=mesh!,tier=effectiveTier();if(!me.visible)me.visible=true;
   const showFlags=!(tier>=3||(phone&&tier>=2));if(flags&&flags.visible!==showFlags)flags.visible=showFlags;
   const fill=crowdFill(phone,tier);if(fill!==shownFill){shownFill=fill;me.count=crowdCount(fans,fill);}
   const cl=uniforms.uClear.value;if(onStand){cl.set(x,z,CLEAR_RADIUS);}else if(cl.z>0)cl.z=-1;
   const cf=uniforms.uClearF.value;for(let i=0;i<CLEAR_FRIENDS;i++){const f=friends[i],v=cf[i];if(f)v.set(f.x,f.z,SEAT_PITCH*.75);else if(v.z>0)v.z=-1;}
   if(cheer>0){cheer=Math.max(0,cheer-dt);uniforms.uTime.value+=dt;uniforms.uCheer.value=reduced?0:Math.min(1,cheer/.6)*Math.min(1,(CHEER_TIME-cheer)/.15);}
   else if(uniforms.uCheer.value)uniforms.uCheer.value=0;
   // Crowd life: a handful of uniform writes from the mood (no per-instance work).
   const L=life=crowdLife(stadiumMood(),reduced,tier),u=uniforms;
   u.uBeat.value=L.beat;u.uSway.value=L.sway;u.uPump.value=L.pump;u.uExcite.value=L.excite;u.uWave.value.set(L.wave,L.waveAngle);u.uScarf.value=L.scarf;
   if(cheer<=0&&L.moving){u.uTime.value+=dt;if(u.uTime.value>600)u.uTime.value-=600;}// the arms' little wiggle while up
   flagUniforms.uFlagSwing.value=L.flagSwing;if(L.moving){const c=flagUniforms.uClock;c.value+=dt;if(c.value>600)c.value-=600;}
  },
  /** A goal: the stands bounce for CHEER_TIME (the frames run anyway: the match is on). */
  cheer(){cheer=CHEER_TIME;},
  get cheering(){return cheer>0;},
  get mesh(){return mesh;},get flags(){return flags;},get count(){return mesh?mesh.count:0;},
  /** The uniforms the shader reads (tests and the debug hooks). */
  get uniforms(){return uniforms;},get life(){return life;},
  dispose(){if(!mesh)return;mesh.removeFromParent();mesh.geometry.dispose();(mesh.material as T.Material).dispose();mesh.dispose();mesh=null;
   if(flags){flags.removeFromParent();flags.geometry.dispose();(flags.material as T.Material).dispose();flags=null;}},
 };
}
export type StadiumCrowd=ReturnType<typeof createStadiumCrowd>;
