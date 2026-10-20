import * as T from 'three';
import {speciesModel} from '../town/fishing/fishModels';
import {DIVE_ROOM_R,DIVE_SURFACE_Y,diveCrestMask,diveDepthAt,diveFindPoint,diveFloor,diveRipple,diveWreckPose,type DiveFind,type DiveSpot} from '../town/water/diveSpots';
import {diveLayout,diveWreckSize,type DiveArchSpot} from '../town/water/diveLayout';
import {PITCH_TURF,ROOM_CEILING} from './waterTokens';
export {diveWreckSize};

/**
 * The dive's sealed underwater room (water phase P2, Oct 16 2026; docs/swimming-research.md §2.4, "P2 implemented: one spot").
 * User: "make sure the under water scene is robust with coral and fish swimming around."
 *
 * A small separate scene the island's renderer draws INSTEAD of the island while diving (the island is not rendered or stepped,
 * like a paused menu). Built when the dive starts, disposed when it ends: nothing stays allocated between dives.
 *
 * Oct 20 2026: one builder for every zone (diveSpots.ts DIVE_SPOTS): a 48 m room, the zone's theme (palette, plant mix, schools,
 * signature landmark, an optional wreck), all counts capped by DIVE_CAPS whatever the theme asks, so a zone costs about the same as
 * any other. Only the zone being dived is built. Later that day (user: "the dive zone is not really diving deep, but more about
 * going through a coral reef area ... the scenery should not have a drop off"): ONE smooth shallow reef, 4-6 m deep at the rim rising
 * gently to a crest 1.5-3 m under the surface (diveSpots.ts diveDepthAt), coral heads and sand lanes on it, the wreck stranded on
 * the crest with its top out of the water (addDiveWreck; the island shows that top: diveWreckTop.ts).
 *
 * What is in it (room-local metres; the surface at DIVE_SURFACE_Y):
 *  - ONE static vertex-coloured mesh: rippled sand (darker and bluer down the slope), low rocks round the rim, ~80 coral pieces of five kinds
 *    (branching, brain, table, tube, finger) in the island palette, the sunken goal with Paul's two flag boxes, the clam's lower
 *    shell, the treasure chest, the bubbling vent;
 *  - ONE swaying mesh: sea fans, anemones, kelp and seagrass tufts, bent in the vertex shader (a height-weighted sway on one time
 *    uniform, like the Summit trees: no per-mesh CPU work);
 *  - fish as INSTANCED draws, one per species (the fishing catalogue's articulated shapes, lib/town/fishing/fishModels.ts): six
 *    schools (68 fish) on precomputed loops and lazy figure-eights at different depths, a cownose ray gliding, a grouper, a big
 *    parrotfish and the octopus under the goal. Every path is a closed curve evaluated in the vertex shader from per-instance
 *    attributes + ONE time uniform (no boids, no CPU per fish), with the species' own tail wag;
 *  - a burst of 14 small damselfish that dart out of the coral when it is touched (the same shader, hidden until then);
 *  - god-ray streaks (ONE static additive fan mesh, no light), the bright surface overhead (ONE mesh), bubbles from the diver
 *    and the vent (ONE Points draw, moved in the vertex shader);
 *  - the clam's lid and pearl and the matchday coin (3 tiny meshes; the lid and coin move only while they animate);
 *  - THREE.Fog for depth, ONE hemisphere light, no shadows, no reflections, no render targets.
 * WHERE things are comes from the zone's shared layout (lib/town/water/diveLayout.ts, Oct 20 2026: "the dive spots don't look like the
 * area from above"): the coral heads, boulders, sea-grass patches, kelp stands, sand lanes, the pitch, the arch, the crates and the
 * wreck sit exactly where the island's shoal preview (divePreview.ts) shows them; only the pieces' shapes use the room's own random.
 * Per frame on the CPU: one time uniform, the player uniform for the bubbles, the follow camera and (briefly) the lid / coin.
 */
export const DIVE_FOG_COLOR_KEY='water';
export type DiveRoomOptions={phone:boolean;reduced:boolean;found:readonly string[];
 /** Heat tier 2+ / Battery saver: DIVE_LITE of every capped count. */
 lite?:boolean};
export type C=[number,number,number];
const col=(h:string|T.Color):C=>{const c=new T.Color(h);return [c.r,c.g,c.b];};
const mix=(a:C,b:C,k:number):C=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
const scl=(a:C,k:number):C=>[a[0]*k,a[1]*k,a[2]*k];
/** A small seeded random (mulberry32), so the reef is the same every dive. */
function rng(seed:number){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}

/** Collects pieces into one non-indexed geometry (position, normal, colour; plus sway weight and seed for the swaying mesh). The
 *  pieces' own normals are kept (smooth rocks and brain coral, faceted branches), transformed by each piece's matrix. */
export class Merge{
 pos:number[]=[];nor:number[]=[];col:number[]=[];sway:number[]=[];seed:number[]=[];
 private v=new T.Vector3();private n=new T.Vector3();private nm=new T.Matrix3();
 add(g:T.BufferGeometry,m:T.Matrix4,paint:(p:T.Vector3,n:T.Vector3,local:T.Vector3)=>C,sway?:(local:T.Vector3)=>number,seed=0){
  const src=g.index?g.toNonIndexed():g;if(!src.getAttribute('normal'))src.computeVertexNormals();
  const P=src.getAttribute('position'),N=src.getAttribute('normal'),local=new T.Vector3();this.nm.getNormalMatrix(m);
  for(let i=0;i<P.count;i++){local.fromBufferAttribute(P,i);this.v.copy(local).applyMatrix4(m);this.n.fromBufferAttribute(N,i).applyMatrix3(this.nm).normalize();
   this.pos.push(this.v.x,this.v.y,this.v.z);this.nor.push(this.n.x,this.n.y,this.n.z);const c=paint(this.v,this.n,local);this.col.push(c[0],c[1],c[2]);
   if(sway){this.sway.push(sway(local));this.seed.push(seed);}}
  if(src!==g)src.dispose();g.dispose();
 }
 geometry(swaying=false){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.nor,3));
  g.setAttribute('color',new T.Float32BufferAttribute(this.col,3));if(swaying){g.setAttribute('aSway',new T.Float32BufferAttribute(this.sway,1));g.setAttribute('aSeed',new T.Float32BufferAttribute(this.seed,1));}
  g.computeBoundingSphere();return g;}
}
const M=(x=0,y=0,z=0,rx=0,ry=0,rz=0,s:number|[number,number,number]=1)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),typeof s==='number'?new T.Vector3(s,s,s):new T.Vector3(...s));
/** Lumpy, soft-edged rock: an icosphere pushed out by a few sines (smooth normals). */
function rockGeo(seed:number,detail=1){const g=new T.IcosahedronGeometry(1,detail),p=g.getAttribute('position'),v=new T.Vector3();
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const k=1+.22*Math.sin(v.x*3.1+seed)*Math.cos(v.z*2.7+seed*1.3)+.12*Math.sin(v.y*5.3+seed*2.1);v.multiplyScalar(k);p.setXYZ(i,v.x,v.y,v.z);}
 g.computeVertexNormals();return g;}
/** A branching (staghorn) coral: a few levels of tapering branches, as one geometry. */
function branchGeo(r:()=>number,levels=3){const parts:T.BufferGeometry[]=[];
 const grow=(m:T.Matrix4,len:number,rad:number,level:number)=>{const c=new T.CylinderGeometry(rad*.65,rad,len,5,1);c.translate(0,len/2,0);c.applyMatrix4(m);parts.push(c);
  if(level<=0){const tip=new T.SphereGeometry(rad*.75,5,3);tip.translate(0,len,0);tip.applyMatrix4(m);parts.push(tip);return;}
  const n=2+(r()<.5?1:0);for(let i=0;i<n;i++){const a=i/n*Math.PI*2+r()*1.2,tilt=.45+r()*.4;
   grow(m.clone().multiply(new T.Matrix4().makeTranslation(0,len*(.75+r()*.2),0)).multiply(new T.Matrix4().makeRotationY(a)).multiply(new T.Matrix4().makeRotationZ(tilt)),len*(.62+r()*.2),rad*.7,level-1);}};
 grow(new T.Matrix4(),.45+r()*.25,.09,levels);return mergeGeos(parts);}
function mergeGeos(parts:T.BufferGeometry[]){
 let n=0;const flat=parts.map(p=>{const q=p.index?p.toNonIndexed():p;if(q!==p)p.dispose();q.computeVertexNormals();n+=q.getAttribute('position').count;return q;});
 const pos=new Float32Array(n*3),nor=new Float32Array(n*3);let o=0;
 for(const q of flat){pos.set(q.getAttribute('position').array as Float32Array,o*3);nor.set(q.getAttribute('normal').array as Float32Array,o*3);o+=q.getAttribute('position').count;q.dispose();}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));return g;}

/** Fish: per-instance path attributes (see the vertex shader below). */
type Swimmer={cx:number;cy:number;cz:number;r:number;omega:number;phase:number;eight:boolean;stretch:number;yaw:number;bob:number;wag:number;seed:number;scale:number;dir?:[number,number,number]};
const FISH_GLSL=/* glsl */`
attribute vec4 aPA;attribute vec4 aPB;attribute vec4 aPC;attribute vec4 aPD;
uniform float uDiveTime;uniform vec4 uBurst;uniform vec3 uWagAxis,uWagDir,uWagK,uWag;
// A closed path: a loop (aPB.z 0) or a lazy figure-eight (1), radius aPA.w, stretched aPB.w across, turned by aPD.x, bobbing aPD.y.
vec3 dvPath(float t){float th=aPB.x*t+aPB.y,r=aPA.w;vec3 p;
 if(aPB.z<.5||aPB.z>1.5)p=vec3(cos(th)*r,0.,sin(th)*r*aPB.w);else p=vec3(sin(th)*r,0.,sin(th)*cos(th)*r*aPB.w*2.);
 p.y=sin(th*2.+aPD.w)*aPD.y+sin(t*1.3+aPD.w*3.)*.08;float c=cos(aPD.x),s=sin(aPD.x);p.xz=vec2(c*p.x-s*p.z,s*p.x+c*p.z);return aPA.xyz+p;}
`;
const FISH_BASIS=/* glsl */`
 float dvT=uDiveTime;vec3 dvP=dvPath(dvT),dvF=dvPath(dvT+.12)-dvP;
 if(aPB.z>1.5){// the burst: dart out of the coral along aPC.xyz, then settle into the home loop round it
  float bt=max(0.,dvT-uBurst.w);vec3 bd=normalize(aPC.xyz);vec3 bp=uBurst.xyz+bd*3.4*(1.-exp(-1.5*bt))+vec3(0.,bt*.18,0.);
  float home=smoothstep(1.4,3.4,bt);dvP=mix(bp,dvP,home);dvF=mix(bd,normalize(dvF+vec3(1e-4)),home);}
 dvF=normalize(dvF+vec3(1e-5,0.,0.));vec3 dvS=normalize(cross(dvF,vec3(0.,1.,0.))+vec3(0.,0.,1e-5)),dvU=cross(dvS,dvF);
`;

/** Hand-built low-poly creatures for the instanced fish shader (the fishing catalogue has no turtle or jellyfish): ~1 unit long,
 *  facing −x like the fish models, vertex-coloured. */
export function creatureModel(kind:'turtle'|'jelly'){
 const parts:{g:T.BufferGeometry;c:C}[]=[];
 if(kind==='turtle'){
  const shell=new T.SphereGeometry(.38,8,5);shell.scale(1.1,.42,.85);parts.push({g:shell,c:col('#6f8a4a')});
  const belly=new T.SphereGeometry(.34,8,3,0,Math.PI*2,Math.PI/2,Math.PI/2);belly.scale(1.1,.25,.85);parts.push({g:belly,c:col('#d9cf9a')});
  const head=new T.SphereGeometry(.12,6,4);head.scale(1.3,.9,1);head.translate(-.5,.02,0);parts.push({g:head,c:col('#9bb27a')});
  for(const [x,z,l] of [[-.2,.36,.34],[-.2,-.36,.34],[.3,.28,.2],[.3,-.28,.2]] as const){const f=new T.BoxGeometry(l*.6,.04,l);f.rotateY(z>0?.5:-.5);f.translate(x,-.02,z);parts.push({g:f,c:col('#8aa66a')});}
 }else{
  const dome=new T.SphereGeometry(.4,10,5,0,Math.PI*2,0,Math.PI/2);dome.scale(1,.75,1);parts.push({g:dome,c:col('#cfd8ff')});
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2,t=new T.ConeGeometry(.04,.75,3);t.translate(Math.cos(a)*.22,-.37,Math.sin(a)*.22);parts.push({g:t,c:col('#f0d4ff')});}
 }
 const flat=parts.map(({g,c})=>{const q=g.index?g.toNonIndexed():g;if(q!==g)g.dispose();q.computeVertexNormals();const n=q.getAttribute('position').count,cl=new Float32Array(n*3);for(let i=0;i<n;i++)cl.set(c,i*3);q.setAttribute('color',new T.BufferAttribute(cl,3));return q;});
 let n=0;for(const q of flat)n+=q.getAttribute('position').count;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),cl=new Float32Array(n*3);let o=0;
 for(const q of flat){pos.set(q.getAttribute('position').array as Float32Array,o*3);nor.set(q.getAttribute('normal').array as Float32Array,o*3);cl.set(q.getAttribute('color').array as Float32Array,o*3);o+=q.getAttribute('position').count;q.dispose();}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setAttribute('color',new T.BufferAttribute(cl,3));
 return {geometry:g,anim:{axis:[1,0,0] as [number,number,number],start:kind==='turtle'?-.3:0,span:.5,dir:kind==='turtle'?[0,1,0] as [number,number,number]:[1,0,1] as [number,number,number],k:[0,0,0] as [number,number,number],amp:kind==='turtle'?.03:.04}};
}

/** Room content caps (the whole room, whatever the theme asks): coral pieces, sway plants, fish. Lite (heat tier 2+, Battery saver)
 *  takes LITE of each. */
export const DIVE_CAPS={coral:{phone:100,desktop:130},fans:{phone:16,desktop:22},anemones:{phone:14,desktop:18},kelpClumps:{phone:8,desktop:12},grass:{phone:30,desktop:44},fish:90} as const;
export const DIVE_LITE=.6;

export function createDiveRoom(spot:DiveSpot,opt:DiveRoomOptions){
 const th=spot.theme,fl=spot.floor,r=rng(9173+spot.blob*101),phone=opt.phone,lite=opt.lite?DIVE_LITE:1,lay=diveLayout(spot);
 const F=(x:number,z:number)=>diveFloor(x,z,fl);
 const cap=(k:keyof Omit<typeof DIVE_CAPS,'fish'>,m:number)=>Math.round(DIVE_CAPS[k][phone?'phone':'desktop']*Math.min(1,m)*lite);
 const scene=new T.Scene();scene.name='dive-room';scene.background=new T.Color(th.water);scene.fog=new T.Fog(th.water,th.fog[0]*.6,th.fog[1]);
 const hemi=new T.HemisphereLight(th.light[0],th.light[1],th.light[2]*.78);/* shallow reef: softer, so the sand is not washed out (water audit #5) */scene.add(hemi);
 const camera=new T.PerspectiveCamera(58,1,.1,th.fog[1]+6);camera.name='dive-camera';
 const uTime={value:0};
 const fp={x:0,y:0,z:0};const findPt=(id:string)=>{const f=spot.finds.find(q=>q.id===id);return f?diveFindPoint(f,{x:0,y:0,z:0},fl):null;};
 const wk=th.wreck,wreckHalf=wk?(wk.style==='galleon'?7:wk.style==='cargo'?8.5:4.8):0;
 const offWreck=(x:number,z:number,gap:number)=>{if(!wk)return true;const c=Math.cos(wk.yaw),s=Math.sin(wk.yaw),dx=x-wk.x,dz=z-wk.z,u=dx*s+dz*c,v=dx*c-dz*s;return Math.abs(u)>wreckHalf+gap||Math.abs(v)>2.6+gap;};
 const clearOf=(x:number,z:number,gap:number)=>spot.finds.every(f=>Math.hypot(f.x-x,f.z-z)>gap)&&Math.hypot(x,z-13)>2.6&&offWreck(x,z,gap*.5);

 // ---- The static reef: ONE draw.
 const S=new Merge();
 const sandA=col(th.sand[0]),sandB=col(th.sand[1]),deepTint=col(th.water),turfC=col(PITCH_TURF);
 {const N=phone?52:68,R=DIVE_ROOM_R+9,g=new T.PlaneGeometry(R*2,R*2,N,N);g.rotateX(-Math.PI/2);const p=g.getAttribute('position');
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,F(x,z));}g.computeVertexNormals();
  // The sand: bright on the crest, shading toward the water's colour down the slope (deeper water reads darker and bluer, like the
  // shore shallows from the beach); ripples, soft patches and a faint sun-net of brighter lines on the crest (vertex colour only).
  S.add(g,new T.Matrix4(),(v,n)=>{const rip=diveRipple(v.x,v.z),patch=.5+.5*Math.sin(v.x*.33+1.1)*Math.sin(v.z*.29-.6),t=diveCrestMask(v.x,v.z,fl),dp=diveDepthAt(v.x,v.z,fl);
   const net=Math.pow(Math.abs(Math.sin(v.x*1.1+Math.sin(v.z*.7)*1.6)*Math.sin(v.z*1.05+Math.sin(v.x*.8)*1.4)),.6);
   // Paul's old pitch: a soft algae turf over its rectangle (the layout's), the green rectangle seen from above.
   const pt=lay.pitch,turf=pt?Math.max(0,Math.min(1,(.8-Math.max(Math.abs(v.x-pt.cx)-pt.half,pt.z0-v.z,v.z-pt.z1))/1.4)):0;
   return mix(mix(scl(mix(sandA,sandB,.25+.55*rip*rip),(.86+.14*patch)*(.75+.25*n.y)*(1+.1*net*t)),turfC,.32*turf),deepTint,Math.min(.65,.12+Math.max(0,dp-1.6)*.13));});}
 const rockA=col(th.rock[0]),rockB=col(th.rock[1]);
 const paintRock=(v:T.Vector3,n:T.Vector3)=>scl(mix(rockA,rockB,.5+.5*n.y),.85+.15*Math.sin(v.x*2.3+v.z*1.7));
 // Low reef rocks round the deeper rim (the fog finishes the view; their tops stay under the surface), boulders on the reef slope,
 // scattered stones.
 const ringN=Math.round((phone?18:24)*Math.max(.7,lite));
 for(let i=0;i<ringN;i++){const a=i/ringN*Math.PI*2+r()*.2,d=DIVE_ROOM_R+2.5+r()*4,x=Math.cos(a)*d,z=Math.sin(a)*d,s=Math.min(2.4+r()*2.6,(diveDepthAt(x,z,fl)-1.2)/1.1);
  S.add(rockGeo(i*1.7,1),M(x,F(x,z)+s*.15,z,r()*.5,r()*6,r()*.5,[s*1.2,s*(.7+r()*.5),s]),paintRock);}
 lay.rocks.forEach(({x,z,s},i)=>S.add(rockGeo(30+i,1),M(x,F(x,z)+s*.2,z,r()*.4,r()*6,r()*.4,[s*1.4,s,s*1.2]),paintRock));// the layout's boulders (the preview's dark spots)
 for(let i=0;i<(phone?10:14);i++){let x=0,z=0;for(let k=0;k<20;k++){const a=r()*Math.PI*2,d=4+r()*(DIVE_ROOM_R-4);x=Math.cos(a)*d;z=Math.sin(a)*d;if(clearOf(x,z,2.2))break;}
  const s=.3+r()*.45;S.add(rockGeo(50+i,1),M(x,F(x,z)+s*.2,z,0,r()*6,0,[s*1.3,s*.8,s]),paintRock);}
 // Coral heads: seeded per zone, mostly on the crest and up the reef slope (fewer down in the deeper rim water), with sand lanes
 // between them to swim along.
 const corals=th.coral.map(h=>col(h));
 // The heads are the layout's clusters (the darker patches seen from above), each with its own main colour and height cap.
 const heads=lay.clusters;
 // Every coral piece stays well under the surface (the crest is shallow): its size is capped by the water over its sand.
 // Each kind's height per unit of scale (a branching coral is the tallest), so a piece's top stays under its cap.
 const CORAL_H=[2.2,.45,.8,1.05,.7];
 const coralPiece=(x:number,z:number,s0:number,base:C,kind:number,hCap=Infinity)=>{const s=Math.max(.2,Math.min(s0,Math.min(diveDepthAt(x,z,fl)-.9,hCap)/CORAL_H[kind])),y=F(x,z)-.05,tip=mix(base,[1,1,1],.35),yaw=r()*6.28;
  if(kind===0){S.add(branchGeo(r,phone?2:3),M(x,y,z,0,yaw,0,s*1.4),(v,n,l)=>scl(mix(base,tip,Math.min(1,l.y/1.4)),.8+.2*n.y));}
  else if(kind===1){const g=new T.IcosahedronGeometry(.55,phone?1:2),p=g.getAttribute('position'),v=new T.Vector3();
   for(let k=0;k<p.count;k++){v.fromBufferAttribute(p,k);const groove=Math.sin(v.x*16+Math.sin(v.z*13)*2.2+v.y*9);v.multiplyScalar(1+.04*groove);v.y=Math.max(-.1,v.y*.62);p.setXYZ(k,v.x,v.y,v.z);}g.computeVertexNormals();
   S.add(g,M(x,y+.05,z,0,yaw,0,s),(v,n,l)=>scl(base,.72+.28*(.5+.5*Math.sin(l.x*16+Math.sin(l.z*13)*2.2+l.y*9))));}
  else if(kind===2){const st=new T.CylinderGeometry(.07,.12,.5,6);st.translate(0,.25,0);const top=new T.CylinderGeometry(.75,.6,.1,phone?10:14);top.translate(0,.55,0);
   S.add(mergeGeos([st,top]),M(x,y,z,(r()-.5)*.2,yaw,(r()-.5)*.2,s*1.2),(v,n,l)=>scl(l.y>.48?mix(base,tip,n.y>.5?.3:0):base,.75+.25*Math.abs(n.y)));}
  else if(kind===3){const parts:T.BufferGeometry[]=[];const n=5+Math.floor(r()*5);for(let k=0;k<n;k++){const hh=.3+r()*.7,c=new T.CylinderGeometry(.07+r()*.04,.09,hh,6,1,true);c.translate((r()-.5)*.45,hh/2,(r()-.5)*.45);c.rotateZ((r()-.5)*.3);parts.push(c);}
   S.add(mergeGeos(parts),M(x,y,z,0,yaw,0,s),(v,n,l)=>scl(mix(base,tip,Math.min(1,Math.max(0,l.y-.25)*1.5)),.8+.2*Math.abs(n.x)));}
  else{const parts:T.BufferGeometry[]=[new T.SphereGeometry(.35,7,4,0,Math.PI*2,0,Math.PI/2)];const n=6+Math.floor(r()*6);
   for(let k=0;k<n;k++){const aa=r()*6.28,dd=r()*.28,c=new T.CapsuleGeometry(.06,.2+r()*.25,2,5);c.translate(Math.cos(aa)*dd,.3+r()*.15,Math.sin(aa)*dd);parts.push(c);}
   S.add(mergeGeos(parts),M(x,y,z,0,yaw,0,s),(v,n)=>scl(base,.78+.22*n.y));}};
 // The pieces share out over the clusters by area (every cluster gets at least two), inside each one's radius; 60 % in its own hue.
 const coralCount=cap('coral',th.mix.coral),area=heads.reduce((n,h)=>n+h.r*h.r,0)||1;
 heads.forEach(h=>{const n=Math.max(2,Math.round(coralCount*h.r*h.r/area));
  for(let i=0,placed=0;i<n*3&&placed<n;i++){const a=r()*Math.PI*2,d=Math.pow(r(),.8)*h.r,x=h.x+Math.cos(a)*d,z=h.z+Math.sin(a)*d;
   if(!clearOf(x,z,1.2))continue;placed++;
   coralPiece(x,z,(.6+r()*.7)*(1-.35*d/h.r),corals[r()<.6?h.hue%corals.length:Math.floor(r()*corals.length)],Math.floor(r()*5),h.h);}});
 const boxPaint=(c:C)=>(v:T.Vector3,n:T.Vector3)=>scl(c,.75+.25*n.y);
 const ballGeo=()=>new T.IcosahedronGeometry(.22,1);
 const paintBall=(v:T.Vector3,n:T.Vector3,l:T.Vector3)=>{const k=Math.abs(l.x)+Math.abs(l.y)*1.3+Math.abs(l.z)*.7;return Math.sin(k*28)>.55?col('#2a2f36'):scl(col('#f4f1e6'),.8+.2*n.y);};
 const barnacles=(m:T.Matrix4,n:number,spread:[number,number,number])=>{const barn=col('#cfc6d8');for(let k=0;k<n;k++){const b=new T.IcosahedronGeometry(.06+r()*.06,0);
  S.add(b,m.clone().multiply(M((r()-.5)*spread[0],r()*spread[1],(r()-.5)*spread[2])),()=>scl(barn,.75+.25*r()));}};
 // ---- The signature landmark.
 const relic=findPt('relic')??{x:0,y:1,z:-6};
 if(lay.pitch){// the sunken goal (a youth goal, half sunk and tilted) with Paul's two flag boxes; barnacles on the frame (the layout's pitch)
  const pt=lay.pitch,gx=pt.goal.x,gz=pt.goal.z,gy=F(gx,gz),W=pt.goal.w,H=pt.goal.h,tilt=.12;const white=col('#e8e6dc'),rust=col('#b8794a');
  const post=(px:number)=>{const c=new T.CylinderGeometry(.07,.07,H,7);c.translate(px,H/2,0);return c;};
  const bar=new T.CylinderGeometry(.07,.07,W,7);bar.rotateZ(Math.PI/2);bar.translate(0,H,0);const gm=M(gx,gy-.15,gz,tilt,pt.goal.yaw,.06);
  S.add(mergeGeos([post(-W/2),post(W/2),bar]),gm,(v,n,l)=>mix(white,rust,.25+.25*Math.sin(l.x*7+l.y*5)));barnacles(gm.clone().multiply(M(0,0,0)),22,[W,H,.15]);
  [[-.7,0,col('#3a6fd8'),col('#f4f1e6')],[.7,.6,col('#e0322b'),col('#f2c14e')]].forEach(([dx,tip,a,b])=>{const bx=gx+(dx as number),bz=gz+1.6,by=F(bx,bz);
   const box=new T.BoxGeometry(.55,.45,.55);box.translate(0,.22,0);S.add(box,M(bx,by,bz,0,.3,tip as number),boxPaint(a as C));
   const flag=new T.BoxGeometry(.32,.2,.02);flag.translate(.18,.62,0);const pole=new T.CylinderGeometry(.015,.015,.5,4);pole.translate(0,.45,0);
   S.add(mergeGeos([flag,pole]),M(bx,by,bz,0,.3,tip as number),(v,n,l)=>l.x>.03?(b as C):col('#3a3f44'));});
  // The old pitch: faded halfway line and centre circle stones on the shelf (stones, not paint: the sand mesh is too coarse).
  for(let k=0;k<26;k++){const a=k/26*Math.PI*2,x=pt.cx+Math.cos(a)*pt.circle,z=pt.cz+Math.sin(a)*pt.circle;S.add(new T.CylinderGeometry(.18,.2,.06,6),M(x,F(x,z)+.02,z),()=>col('#efe8d4'));}
  // The layout's lines (halfway, goal line, touchlines, the box): the same lines the island's preview draws pale on the sand.
  for(const [a,b] of pt.lines){const len=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(1,Math.round(len/1.5));
   for(let k=0;k<=n;k++){const x=a.x+(b.x-a.x)*k/n,z=a.z+(b.z-a.z)*k/n;S.add(new T.CylinderGeometry(.18,.2,.06,6),M(x,F(x,z)+.02,z),()=>col('#efe8d4'));}}
 }else if(lay.arches.length){// a coral-crusted rock arch over the sand channel between the two reef heads, its crown breaking the
  // surface (the island shows that crown: diveWreckTop.ts), coral on its back, a small cave mouth beside it
  addDiveArch(S,spot,lay.arches[0],(x,z,y)=>{const g=new T.IcosahedronGeometry(.4,1);g.scale(1,.5,1);S.add(g,M(x,y,z,0,r()*6,0),boxPaint(corals[Math.floor(r()*corals.length)]));});
  const cx=lay.arches[0].x+1,cz=lay.arches[0].z-6,cy=F(cx,cz),ch=Math.max(.6,Math.min(2.2,DIVE_SURFACE_Y-cy-2.2)),cs=Math.min(1,(ch+.6)/2.2);// its top kept under the surface
  for(let k=0;k<5;k++){const a=k/4*Math.PI,x=cx+Math.cos(a)*2.4,y=cy+Math.sin(a)*ch;S.add(rockGeo(120+k,1),M(x,y,cz,0,r()*6,0,[1.4*cs,1.2*cs,1.6*cs]),paintRock);}
 }else if(lay.crates.length){// spilled ball crates colonised by coral, balls half-buried in the sand (the layout's crates and balls)
  const wood=col('#8a6440');for(let k=0;k<lay.crates.length;k++){const {x,z,yaw}=lay.crates[k];
   const y=F(x,z),tilt=(r()-.5)*.5;const box=new T.BoxGeometry(1.1,.7,.8);box.translate(0,.3,0);S.add(box,M(x,y,z,tilt,yaw,0),(v,n,l)=>scl(wood,(Math.abs(l.y-.3)>.3||Math.abs(l.x)>.5?.65:.9)*(.8+.2*n.y)));
   for(let b=0;b<2;b++)S.add(ballGeo(),M(x+(r()-.5)*.6,y+.75,z+(r()-.5)*.4,r(),r(),r()),paintBall);
   if(r()<.6)coralPiece(x+.2,z,.45,corals[k%corals.length],4);}
  for(const {x,z} of lay.balls)S.add(ballGeo(),M(x,F(x,z)+.12,z,r(),r(),r()),paintBall);
 }
 // ---- The wreck (the biggest zones): an open, broken hull to swim through, a mast, ribs, barnacles and coral on it, its cargo.
 if(wk){const wood=col(wk.style==='cargo'?'#6e5a4e':'#7a5a3c'),dark=col(wk.style==='cargo'?'#4c3f38':'#5a4129');addDiveWreck(S,spot,phone,coralPiece);
  // The cargo, at the relic find (the futbol tie-in): the island's cup, the away kit bag, an open crate of balls.
  const ry=F(relic.x,relic.z);
  if(wk.cargo==='trophy'){const pts=[[0,0],[.22,0],[.08,.1],[.06,.35],[.24,.55],[.28,.85],[.0,.85]].map(([x,y])=>new T.Vector2(x,y));
   S.add(new T.LatheGeometry(pts,10),M(relic.x,ry+.05,relic.z,.1,0,.08,1.1),(v,n)=>scl(col('#ffcf4a'),.75+.35*Math.max(0,n.y)+.1));
   const plinth=new T.BoxGeometry(.6,.25,.6);plinth.translate(0,-.05,0);S.add(plinth,M(relic.x,ry,relic.z),boxPaint(dark));}
  else if(wk.cargo==='kitbag'){const bag=new T.CylinderGeometry(.35,.35,1.1,8);bag.rotateZ(Math.PI/2);S.add(bag,M(relic.x,ry+.35,relic.z,0,.4,0),boxPaint(col('#2a5fb0')));
   const shirt=new T.BoxGeometry(.8,.05,.7);S.add(shirt,M(relic.x+.6,ry+.1,relic.z+.5,0,.8,.1),(v,n,l)=>Math.abs(l.x)<.12?col('#ffffff'):col('#e0322b'));}
  else{const crate=new T.BoxGeometry(1.2,.6,.9);crate.translate(0,.3,0);S.add(crate,M(relic.x,ry,relic.z,0,.3,0),(v,n,l)=>scl(wood,(Math.abs(l.x)>.55?.65:.9)*(.8+.2*n.y)));
   for(let b=0;b<4;b++)S.add(ballGeo(),M(relic.x-.35+b*.24,ry+.75,relic.z+(b%2?.15:-.15),r(),r(),r()),paintBall);}
 }else if(th.signature!=='goal'){// the zone's own relic without a wreck: a small marker object at the find, half in the sand
  const ry=F(relic.x,relic.z);
  if(th.signature==='rays'){const w=new T.CylinderGeometry(.06,.06,.32,8);w.rotateZ(Math.PI/2);S.add(mergeGeos([w,new T.SphereGeometry(.12,8,5)]),M(relic.x,ry+.12,relic.z,0,.6,0),()=>col('#d9dde2'));}
  else if(th.signature==='arch'){const boot=new T.BoxGeometry(.6,.25,.25);boot.translate(.1,.12,0);const top=new T.BoxGeometry(.25,.35,.25);top.translate(-.12,.3,0);S.add(mergeGeos([boot,top]),M(relic.x,ry,relic.z,0,.5,.1),(v,n,l)=>l.y<.05?col('#e8e6dc'):col('#1f2a33'));}
  else if(th.signature==='turtles'){const band=new T.TorusGeometry(.28,.07,5,12);band.rotateX(Math.PI/2);S.add(band,M(relic.x,ry+.1,relic.z,.15,0,0),()=>col('#f2c14e'));}
 }
 // The clam's lower shell (the lid and the pearl are their own meshes below).
 const clamAt=findPt('clam')??{x:-7,y:.5,z:6};const clamBase=col('#7c6bb8'),clamRim=col('#e8d8f4');
 {const g=new T.SphereGeometry(.7,phone?10:14,6,0,Math.PI*2,Math.PI/2,Math.PI/2),p=g.getAttribute('position'),v=new T.Vector3();
  for(let k=0;k<p.count;k++){v.fromBufferAttribute(p,k);const a=Math.atan2(v.z,v.x);v.x*=1+.08*Math.cos(a*7);v.z*=.75;v.y*=.6;p.setXYZ(k,v.x,v.y,v.z);}g.computeVertexNormals();
  S.add(g,M(clamAt.x,F(clamAt.x,clamAt.z)+.28,clamAt.z,0,.4,0),(v,n,l)=>mix(clamBase,clamRim,Math.max(0,1+l.y*3)*.6));}
 // The treasure: a small half-buried chest, its lid propped open.
 const chestAt=findPt('treasure')??{x:4,y:.5,z:-10};
 {const wood=col('#7a5232'),band=col('#d9a441'),cy=F(chestAt.x,chestAt.z);
  const body=new T.BoxGeometry(.9,.45,.6);body.translate(0,.2,0);const lid=new T.BoxGeometry(.9,.08,.6);lid.translate(0,.04,-.3);lid.rotateX(-1.1);lid.translate(0,.42,-.3+.3);
  S.add(mergeGeos([body,lid]),M(chestAt.x,cy-.08,chestAt.z,0,-.5,.08),(v,n,l)=>Math.abs(l.x)>.38||Math.abs(l.x)<.05?band:scl(wood,.8+.2*n.y));}
 // The vent: a little rock chimney the bubbles stream from (seeded on the shelf).
 const vent={x:-5,z:9};for(let k=0;k<20;k++){const x=(r()-.5)*28,z=4+r()*12;if(clearOf(x,z,2.5)){vent.x=x;vent.z=z;break;}}
 {const vy=F(vent.x,vent.z);S.add(rockGeo(77,1),M(vent.x,vy+.2,vent.z,0,0,0,[.6,.55,.6]),paintRock);
  const c=new T.CylinderGeometry(.18,.32,.45,7,1,true);c.translate(0,.62,0);S.add(c,M(vent.x,vy,vent.z),(v,n)=>scl(rockA,.6+.3*n.y));}
 const reefMat=new T.MeshLambertMaterial({vertexColors:true});reefMat.name='dive-reef';
 const reef=new T.Mesh(S.geometry(),reefMat);reef.name='dive-reef';reef.matrixAutoUpdate=false;scene.add(reef);

 // ---- The swaying life: sea fans, anemones, kelp, seagrass. ONE draw, bent in the vertex shader.
 const W=new Merge();
 const fans=th.fan.map(h=>col(h)),anem=th.anemone.map(h=>col(h)),kelp=th.kelp.map(h=>col(h));
 const spotNear=(gap:number,minR=3,maxR=DIVE_ROOM_R)=>{for(let k=0;k<30;k++){const a=r()*Math.PI*2,d=minR+r()*(maxR-minR),x=Math.cos(a)*d,z=Math.sin(a)*d;if(clearOf(x,z,gap))return {x,z};}return {x:maxR,z:0};};
 const headAt=(i:number)=>heads.length?heads[i%heads.length]:{x:0,z:0};
 for(let i=0,n=cap('fans',th.mix.fans);i<n;i++){const h=headAt(i),a=r()*6.28,d=1.2+r()*2.2,x=h.x+Math.cos(a)*d,z=h.z+Math.sin(a)*d;if(!clearOf(x,z,1.4))continue;
  const c=fans[i%fans.length],sz=.8+r()*.8,pos:number[]=[],segs=9;
  for(let k=0;k<segs;k++){const a0=-1.1+k/segs*2.2,a1=-1.1+(k+1)/segs*2.2;pos.push(0,0,0,Math.sin(a0)*sz,.25+Math.cos(a0)*sz*1.2,0,Math.sin(a1)*sz,.25+Math.cos(a1)*sz*1.2,0);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.computeVertexNormals();
  W.add(g,M(x,F(x,z)-.05,z,0,r()*6.28,0),(v,n,l)=>scl(c,.7+.3*(.5+.5*Math.sin(Math.atan2(l.x,l.y)*22))*(.6+.4*Math.min(1,l.y))),l=>Math.min(1,l.y/(sz*1.3)),r()*6.28);}
 for(let i=0,n=cap('anemones',th.mix.anemones);i<n;i++){const h=headAt(i*3+1),a=r()*6.28,d=.8+r()*2.6,x=h.x+Math.cos(a)*d,z=h.z+Math.sin(a)*d;if(!clearOf(x,z,1.4))continue;
  const c=anem[i%anem.length],tipC=mix(c,[1,1,1],.45),y=F(x,z)-.03,parts:T.BufferGeometry[]=[];const base=new T.CylinderGeometry(.22,.28,.25,8);base.translate(0,.12,0);parts.push(base);
  const n2=phone?14:22;for(let k=0;k<n2;k++){const aa=k/n2*6.28+r()*.2,rr=.08+r()*.14,len=.35+r()*.3,t=new T.ConeGeometry(.035,len,3);t.translate(0,len/2,0);t.rotateZ(.35+rr*1.5);t.rotateY(aa);t.translate(Math.cos(aa)*rr,.24,-Math.sin(aa)*rr);parts.push(t);}
  W.add(mergeGeos(parts),M(x,y,z,0,0,0,.9+r()*.5),(v,n,l)=>l.y<.25?scl(c,.7):mix(c,tipC,Math.min(1,(l.y-.25)*2.5)),l=>Math.max(0,Math.min(1,(l.y-.2)*2)),r()*6.28);}
 // Kelp: tall ribbons in clumps (the kelp forest reaches up toward the surface), swaying the most at the top.
 // The layout's kelp stands (the Kelp Forest's reach to just under the surface: the dark tops seen from above).
 const strands=Math.max(2,Math.round((phone?3:4)*lite));
 for(const cl of lay.kelp){
  for(let k=0;k<strands;k++){const x=cl.x+(r()-.5)*2.6,z=cl.z+(r()-.5)*2.6,y0=F(x,z),H=Math.max(.8,Math.min(DIVE_SURFACE_Y-y0-.6,cl.h*(.8+r()*.2))),segs=phone?6:9,wd=.22+r()*.1,c=kelp[Math.floor(r()*kelp.length)];
   const pos:number[]=[];for(let s2=0;s2<segs;s2++){const ya=s2/segs*H,yb=(s2+1)/segs*H,w0=wd*(1-s2/segs*.4),w1=wd*(1-(s2+1)/segs*.4),o0=Math.sin(s2*.9)*.12,o1=Math.sin((s2+1)*.9)*.12;
    pos.push(-w0+o0,ya,0,w0+o0,ya,0,w1+o1,yb,0,-w0+o0,ya,0,w1+o1,yb,0,-w1+o1,yb,0);}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.computeVertexNormals();
   W.add(g,M(x,y0-.1,z,0,r()*6.28,0),(v,n,l)=>scl(c,.65+.35*Math.min(1,l.y/H)),l=>Math.min(1,l.y/H)*1.6,r()*6.28);}}
 // Sea grass in the layout's patches (the meadow seen from above), a few strays elsewhere.
 const gArea=lay.grass.reduce((n,g)=>n+g.r*g.r,0)||1,gPick=()=>{let t=r()*gArea;for(const g of lay.grass){t-=g.r*g.r;if(t<=0)return g;}return lay.grass[0];};
 for(let i=0,n=cap('grass',th.mix.grass);i<n;i++){const gp=lay.grass.length&&i%8?gPick():null,ga=r()*6.28,gd=gp?Math.sqrt(r())*gp.r:0;
  const p=gp?{x:gp.x+Math.cos(ga)*gd,z:gp.z+Math.sin(ga)*gd}:spotNear(1.2,2.5,DIVE_ROOM_R+2),c=mix(kelp[i%kelp.length],sandB,.15),pos:number[]=[],nb=6;
  for(let k=0;k<nb;k++){const a=k/nb*6.28+r(),h=.3+r()*.45,bx=Math.cos(a)*.08,bz=Math.sin(a)*.08,lean=.15;pos.push(bx-.03,0,bz,bx+.03,0,bz,bx+Math.cos(a)*lean,h,bz+Math.sin(a)*lean);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.computeVertexNormals();
  W.add(g,M(p.x,F(p.x,p.z)-.02,p.z),(v,n,l)=>scl(c,.7+.6*l.y),l=>Math.min(1,l.y*2),r()*6.28);}
 const swayAmp={value:opt.reduced?.25:1};
 const swayMat=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});swayMat.name='dive-sway';
 swayMat.onBeforeCompile=sh=>{sh.uniforms.uDiveTime=uTime;sh.uniforms.uSwayAmp=swayAmp;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uDiveTime,uSwayAmp;attribute float aSway,aSeed;')
   .replace('#include <begin_vertex>',/* glsl */`#include <begin_vertex>
    float sw=aSway*aSway*uSwayAmp;transformed.x+=sin(uDiveTime*1.1+aSeed+position.y*.6)*.22*sw;transformed.z+=cos(uDiveTime*.83+aSeed*1.7+position.y*.4)*.14*sw;`);};
 swayMat.customProgramCacheKey=()=>'dive-sway-v1';
 const sway=new T.Mesh(W.geometry(true),swayMat);sway.name='dive-sway';sway.frustumCulled=false;sway.matrixAutoUpdate=false;scene.add(sway);

 // ---- Fish: one instanced draw per species, every path in the vertex shader. The theme picks the schools (SCHOOLS keys).
 const fishMeshes:T.Mesh[]=[];
 const school=(id:string|undefined,shape:string|undefined,color:string|undefined,list:Swimmer[],name:string,custom?:ReturnType<typeof creatureModel>,glow?:string)=>{
  const model=custom??speciesModel(id,shape as never,color),src=model.geometry,g=new T.InstancedBufferGeometry();
  for(const a of ['position','normal','color'])g.setAttribute(a,new T.BufferAttribute((src.getAttribute(a).array as Float32Array).slice(),src.getAttribute(a).itemSize));
  if(custom)src.dispose();
  const n=list.length,A=new Float32Array(n*4),B=new Float32Array(n*4),Cc=new Float32Array(n*4),D=new Float32Array(n*4);
  list.forEach((f,i)=>{A.set([f.cx,f.cy,f.cz,f.r],i*4);B.set([f.omega,f.phase,f.dir?2:f.eight?1:0,f.stretch],i*4);Cc.set([...(f.dir??[0,0,0]),f.scale],i*4);D.set([f.yaw,f.bob,f.wag,f.seed],i*4);});
  g.setAttribute('aPA',new T.InstancedBufferAttribute(A,4));g.setAttribute('aPB',new T.InstancedBufferAttribute(B,4));g.setAttribute('aPC',new T.InstancedBufferAttribute(Cc,4));g.setAttribute('aPD',new T.InstancedBufferAttribute(D,4));
  g.instanceCount=n;g.boundingSphere=new T.Sphere(new T.Vector3(0,0,0),60);
  const an=model.anim,mat=new T.MeshLambertMaterial({vertexColors:true,...(glow?{emissive:new T.Color(glow),transparent:true,opacity:.82,depthWrite:false}:{})});mat.name='dive-fish-'+name;
  const wag={uWagAxis:{value:new T.Vector3(...an.axis)},uWagDir:{value:new T.Vector3(...an.dir)},uWagK:{value:new T.Vector3(...an.k)},uWag:{value:new T.Vector3(an.start,Math.max(.01,an.span),an.amp)}};
  mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,wag,{uDiveTime:uTime,uBurst});
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+FISH_GLSL)
    .replace('#include <beginnormal_vertex>',FISH_BASIS+'vec3 objectNormal=normalize(-dvF*normal.x+dvU*normal.y-dvS*normal.z);')
    .replace('#include <begin_vertex>',/* glsl */`vec3 transformed=vec3(position);
     float dvW=clamp((dot(transformed,uWagAxis)-uWag.x)/uWag.y,0.,1.);transformed+=uWagDir*uWag.z*dvW*dvW*sin(dvT*aPD.z+aPD.w*7.-dot(transformed,uWagK));
     transformed*=aPC.w;transformed=dvP-dvF*transformed.x+dvU*transformed.y-dvS*transformed.z;`);};
  mat.customProgramCacheKey=()=>'dive-fish-v1';
  const mesh=new T.Mesh(g,mat);mesh.name='dive-fish-'+name;mesh.frustumCulled=false;mesh.matrixAutoUpdate=false;if(glow)mesh.renderOrder=1;scene.add(mesh);fishMeshes.push(mesh);return mesh;};
 const uBurst={value:new T.Vector4(0,0,0,-1e4)};
 const shoal=(n:number,c:{x:number;y:number;z:number},R:number,omega:number,eight:boolean,size:[number,number],spread:number,extra:Partial<Swimmer>={})=>
  Array.from({length:Math.max(1,Math.round(n*lite))},(_,i)=>({cx:c.x,cy:c.y+(r()-.5)*spread*1.2,cz:c.z,r:R+(r()-.5)*spread*2,omega,phase:(extra.phase??0)-i*.035*Math.sign(omega||1)+(r()-.5)*spread/Math.max(R,1),eight,stretch:extra.stretch??1,yaw:extra.yaw??0,bob:extra.bob??.3,wag:extra.wag??9,seed:r()*6.28,scale:size[0]+r()*(size[1]-size[0])} as Swimmer));
 // Heights (Oct 20 2026 shallow reef): every path stays between the sand and the surface. Over the crest that is only 1.5-3 m of
 // water, so the open-water schools swim high (y ≈ 2-2.6, under the surface, over the crest's sand) and the reef fish just over
 // their own coral head (fy). The wreck's fish weave round the stranded hull, ray paths glide low over the flat crest.
 const fy=(x:number,z:number,over:number)=>Math.min(DIVE_SURFACE_Y-.75,F(x,z)+over),top=DIVE_SURFACE_Y-1;
 const wx=wk?wk.x:0,wz=wk?wk.z:-10,h0=headAt(0),h1=headAt(1),h2=headAt(2),wy=fy(wx,wz,1.2);
 const SCHOOLS:Record<string,()=>void>={
  anchovy:()=>school('anchovy',undefined,undefined,shoal(phone?20:26,{x:0,y:top-.1,z:-4},8.5,.2,true,[.32,.42],.5,{stretch:.8,yaw:.4,wag:13,bob:.15}),'anchovy'),
  'blue-tang':()=>school(undefined,'round','#2c5ee8',shoal(12,{x:h0.x,y:fy(h0.x,h0.z,1.3),z:h0.z},3.6,.33,false,[.36,.46],.4,{bob:.15}),'blue-tang'),
  'yellow-tang':()=>school(undefined,'round','#ffd21f',shoal(10,{x:h1.x,y:fy(h1.x,h1.z,1.2),z:h1.z},3.2,-.37,false,[.32,.42],.4,{bob:.15,phase:2}),'yellow-tang'),
  snapper:()=>school('red-snapper',undefined,undefined,shoal(8,{x:wx,y:wy,z:wz},wk?wreckHalf+1.5:7,.15,true,[.55,.7],.4,{stretch:wk?.35:.7,yaw:wk?-wk.yaw:-.3,bob:.2,phase:1}),'snapper'),
  anthias:()=>school(undefined,'round','#ff7a3a',shoal(12,{x:h2.x,y:fy(h2.x,h2.z,1.1),z:h2.z},2.6,.45,true,[.24,.3],.4,{bob:.15,phase:3,wag:15}),'anthias'),
  bigeye:()=>school('bigeye',undefined,undefined,shoal(7,{x:wx,y:wy-.3,z:wz},2.6,.42,false,[.34,.42],.3),'bigeye'),
  trevally:()=>school('golden-trevally',undefined,undefined,shoal(6,{x:0,y:top,z:-2},14,-.1,false,[.6,.75],.4,{stretch:.85,bob:.2,phase:4}),'trevally'),
  grouper:()=>school('grouper',undefined,undefined,[{cx:wx+1,cy:wy-.4,cz:wz+1,r:3.8,omega:-.11,phase:0,eight:false,stretch:.6,yaw:.3,bob:.1,wag:4,seed:2,scale:1.3}],'grouper'),
  parrotfish:()=>school(undefined,'round','#22c4a2',[{cx:h1.x,cy:F(h1.x,h1.z)+1.6,cz:h1.z,r:2.4,omega:.16,phase:1,eight:true,stretch:.9,yaw:0,bob:.2,wag:6,seed:3,scale:.95}],'parrotfish'),
  octopus:()=>school('octopus',undefined,undefined,[{cx:relic.x+.5,cy:F(relic.x,relic.z)+.55,cz:relic.z-.3,r:.35,omega:.25,phase:0,eight:true,stretch:1,yaw:0,bob:.1,wag:3,seed:4,scale:.85}],'octopus'),
  ray:()=>school('cownose-ray',undefined,undefined,[0,1,2].map(i=>({cx:lay.raySpots[i]?.x??0,cy:top-.5+i*.2,cz:lay.raySpots[i]?.z??-9,r:lay.raySpots[i]?.r??6+i*2.5,omega:.08+i*.015,phase:i*2.1,eight:i===1,stretch:.7,yaw:.9*i,bob:.4,wag:2.2,seed:1+i,scale:2-i*.3})),'ray'),
  'eagle-ray':()=>school(undefined,'ray','#3a4a5e',[{cx:0,cy:top,cz:0,r:13,omega:-.06,phase:.5,eight:true,stretch:.6,yaw:.4,bob:.15,wag:2,seed:7,scale:2.6}],'eagle-ray'),
  'ray-small':()=>school(undefined,'ray','#c9b48a',shoal(4,{x:0,y:fy(0,-9,.5),z:-9},4,.12,false,[.8,1.1],.2,{bob:.05,wag:2.5}),'ray-small'),
  eel:()=>school(undefined,'eel','#6b7a3a',[{cx:wx-1,cy:F(wx-1,wz)+.6,cz:wz,r:1.6,omega:.2,phase:0,eight:true,stretch:.8,yaw:wk?-wk.yaw:0,bob:.2,wag:7,seed:5,scale:1.4}],'eel'),
  seahorse:()=>school(undefined,'seahorse','#f2a03a',shoal(5,{x:0,y:fy(0,6,.9),z:6},5,.05,false,[.3,.36],.5,{bob:.15,wag:3}),'seahorse'),
  jelly:()=>school(undefined,undefined,undefined,shoal(phone?10:14,{x:0,y:top-.2,z:-6},7,.04,true,[.8,1.2],.5,{bob:.25,wag:2,stretch:.8}),'jelly',creatureModel('jelly'),'#4a3a7a'),
  turtle:()=>school(undefined,undefined,undefined,[0,1,2,3].map(i=>({cx:lay.bowl?.x??fl.cx,cy:fy(lay.bowl?.x??fl.cx,lay.bowl?.z??fl.cz,.8)+i*.3,cz:lay.bowl?.z??fl.cz,r:3.5+i*1.3,omega:(i%2?-1:1)*(.1-i*.012),phase:i*1.6,eight:false,stretch:.85,yaw:0,bob:.35,wag:1.4,seed:i,scale:1.5+r()*.5})),'turtle',creatureModel('turtle')),
 };
 for(const k of th.fish)SCHOOLS[k]?.();
 // The burst: damselfish hidden in the coral until it is touched.
 const coralAt=findPt('coral')??{x:7,y:1,z:6};
 const burst=school(undefined,'round','#1f8bff',Array.from({length:14},(_,i)=>{const a=i/14*Math.PI*2+r()*.3,up=.2+r()*.6;
  return {cx:coralAt.x,cy:coralAt.y+.4+(r()-.5)*.6,cz:coralAt.z,r:1.3+r()*.6,omega:.55+r()*.2,phase:a,eight:false,stretch:1,yaw:0,bob:.2,wag:16,seed:r()*6.28,scale:.22+r()*.08,dir:[Math.cos(a),up,Math.sin(a)] as [number,number,number]};}),'burst');
 burst.visible=false;

 // ---- God rays: long soft streaks slanting down from the surface. ONE static additive draw, no light.
 {const pos:number[]=[],cl:number[]=[],n=phone?11:16;
  for(let i=0;i<n;i++){const x=-18+i/(n-1)*36+(r()-.5)*2,z=-20+r()*34,w=.5+r()*1.1,len=2.4+r()*1.8,sl=.35,a=.07+r()*.06;
   const top=[[x-w,DIVE_SURFACE_Y,z],[x+w,DIVE_SURFACE_Y,z]],bot=[[x-w*1.6+sl*len,DIVE_SURFACE_Y-len,z+.4*len*.3],[x+w*1.6+sl*len,DIVE_SURFACE_Y-len,z+.4*len*.3]];
   pos.push(...top[0],...top[1],...bot[1],...top[0],...bot[1],...bot[0]);for(const k of [a,a,0,a,0,0])cl.push(.75,.95,1,k);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(cl,4));
  const m=new T.MeshBasicMaterial({vertexColors:true,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false});m.name='dive-rays';
  const rays=new T.Mesh(g,m);rays.name='dive-rays';rays.renderOrder=2;rays.matrixAutoUpdate=false;scene.add(rays);}
 // ---- The surface overhead: bright, with a soft sun patch and caustic-like mottling painted in the vertex colours.
 {const N=phone?24:36,R=DIVE_ROOM_R+12,g=new T.PlaneGeometry(R*2,R*2,N,N);g.rotateX(Math.PI/2);g.translate(0,DIVE_SURFACE_Y,0);const p=g.getAttribute('position'),cl:number[]=[];
  const deep=col(th.water),light=col(ROOM_CEILING);
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),sun=Math.exp(-(x*x+(z+2)*(z+2))/60),mott=.5+.5*Math.sin(x*.9+Math.sin(z*.7)*2)*Math.sin(z*.8+Math.sin(x*.6)*2);
   const c=mix(mix(deep,light,.3+.22*mott),[1,1,.95],sun*.35);cl.push(...c);}
  g.setAttribute('color',new T.Float32BufferAttribute(cl,3));const m=new T.MeshBasicMaterial({vertexColors:true});m.name='dive-surface';
  const surf=new T.Mesh(g,m);surf.name='dive-surface';surf.matrixAutoUpdate=false;scene.add(surf);}
 // ---- Bubbles: the vent's stream and the diver's breath. ONE Points draw; each bubble rises and loops in the vertex shader.
 const uPlayer={value:new T.Vector3(0,DIVE_SURFACE_Y-1,0)},uBubbleScale={value:300};
 {const NV=phone?28:40,NP=phone?12:16,n=NV+NP,A=new Float32Array(n*4),K=new Float32Array(n),pos=new Float32Array(n*3);
  for(let i=0;i<n;i++){const player=i>=NV;A.set([(r()-.5)*(player?.25:.4),(r()-.5)*(player?.25:.4),player?.9+r()*.6:.7+r()*.6,r()*10],i*4);K[i]=player?1:0;}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('aB',new T.BufferAttribute(A,4));g.setAttribute('aKind',new T.BufferAttribute(K,1));
  const ventY=F(vent.x,vent.z)+.85;
  const m=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uDiveTime:uTime,uPlayer,uScale:uBubbleScale,uFogFar:{value:th.fog[1]}},
   vertexShader:/* glsl */`attribute vec4 aB;attribute float aKind;uniform float uDiveTime,uScale,uFogFar;uniform vec3 uPlayer;varying float vA;
    void main(){vec3 p;float life;
     if(aKind<.5){float h=${(DIVE_SURFACE_Y-ventY).toFixed(2)};float y=mod(uDiveTime*aB.z+aB.w,h);life=y/h;p=vec3((${vent.x.toFixed(2)})+aB.x+sin(y*2.+aB.w)*.12,(${ventY.toFixed(2)})+y,(${vent.z.toFixed(2)})+aB.y);}
     else{float c=2.6,a=mod(uDiveTime+aB.w,c);life=a/c;p=uPlayer+vec3(aB.x+sin(a*5.+aB.w)*.08,.4+a*aB.z,aB.y);}
     vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=uScale*(aKind<.5?.07:.05)*(.7+.6*fract(aB.w))/max(.5,-mv.z);
     vA=(1.-smoothstep(.75,1.,life))*smoothstep(0.,.06,life)*(1.-smoothstep(uFogFar*.5,uFogFar,-mv.z));}`,
   fragmentShader:/* glsl */`varying float vA;void main(){vec2 d=gl_PointCoord-.5;float r=length(d);if(r>.5)discard;float ring=smoothstep(.32,.45,r)*(1.-smoothstep(.45,.5,r));
    float hi=smoothstep(.16,0.,length(d-vec2(-.15,-.15)));gl_FragColor=vec4(.88,.97,1.,(ring*.85+hi*.9+.12)*vA);}`});
  m.name='dive-bubbles';const pts=new T.Points(g,m);pts.name='dive-bubbles';pts.frustumCulled=false;pts.renderOrder=3;scene.add(pts);}
 // ---- The clam's lid and pearl, and the treasure coin (tiny meshes; they move only while they animate).
 const lidGeo=new T.SphereGeometry(.7,phone?10:14,6,0,Math.PI*2,0,Math.PI/2);{const p=lidGeo.getAttribute('position'),v=new T.Vector3();
  for(let k=0;k<p.count;k++){v.fromBufferAttribute(p,k);const a=Math.atan2(v.z,v.x);v.x*=1+.08*Math.cos(a*7);v.z*=.75;v.y*=.5;p.setXYZ(k,v.x,v.y,v.z+.52);}lidGeo.computeVertexNormals();}
 const lidMat=new T.MeshLambertMaterial({color:'#8e7dcc',side:T.DoubleSide});lidMat.name='dive-clam-lid';
 // The hinge sits on the shell's back edge (z −0.52 in the shell's frame, turned with it); the lid lifts its front edge.
 const lid=new T.Mesh(lidGeo,lidMat);lid.name='dive-clam-lid';const lidHinge=new T.Group();lidHinge.rotation.order='YXZ';lidHinge.rotation.y=.4;
 lidHinge.position.set(clamAt.x-Math.sin(.4)*.52,F(clamAt.x,clamAt.z)+.3,clamAt.z-Math.cos(.4)*.52);lidHinge.add(lid);scene.add(lidHinge);
 const pearlMat=new T.MeshLambertMaterial({color:'#fbf6ff',emissive:'#6e6a80'});pearlMat.name='dive-pearl';
 const pearl=new T.Mesh(new T.SphereGeometry(.13,12,8),pearlMat);pearl.name='dive-pearl';pearl.position.set(clamAt.x,F(clamAt.x,clamAt.z)+.36,clamAt.z);pearl.visible=false;scene.add(pearl);
 const coinMat=new T.MeshLambertMaterial({color:'#ffc93c',emissive:'#7a5208'});coinMat.name='dive-coin';
 const coin=new T.Mesh(new T.CylinderGeometry(.2,.2,.05,18),coinMat);coin.name='dive-coin';coin.rotation.order='YXZ';coin.rotation.x=Math.PI/2;
 const coinHome=new T.Vector3(chestAt.x,F(chestAt.x,chestAt.z)+.55,chestAt.z);coin.position.copy(coinHome);coin.visible=!opt.found.includes('treasure');scene.add(coin);
 let lidT=-1,lidOpen=0,coinT=-1;

 // ---- The follow camera: behind and a little above the diver, eased; kept under the surface and over the sand.
 const camPos=new T.Vector3(0,DIVE_SURFACE_Y-1,8),camLook=new T.Vector3(),tmp=new T.Vector3();let camInit=false;
 function follow(dt:number,d:{x:number;y:number;z:number;yaw:number}){
  const fx=Math.sin(d.yaw),fz=Math.cos(d.yaw);tmp.set(d.x-fx*6.2,d.y+1.1,d.z-fz*6.2);
  {const cr=Math.hypot(tmp.x,tmp.z),lim=DIVE_ROOM_R+1.5;if(cr>lim){tmp.x*=lim/cr;tmp.z*=lim/cr;}}// never back into the rock ring
  tmp.y=Math.min(DIVE_SURFACE_Y-.55,Math.max(F(tmp.x,tmp.z)+.6,tmp.y));
  const k=camInit?1-Math.exp(-dt*3.2):1;camPos.lerp(tmp,k);camLook.lerp(tmp.set(d.x+fx*3,d.y-.45,d.z+fz*3),camInit?1-Math.exp(-dt*5):1);camInit=true;
  camera.position.copy(camPos);camera.lookAt(camLook);
 }
 const triangles=()=>{let t=0;scene.traverse(o=>{const m=o as T.Mesh;if(!m.isMesh||!o.name.startsWith('dive-'))return;const g=m.geometry as T.BufferGeometry&{instanceCount?:number};const n=(g.index?g.index.count:g.getAttribute('position').count)/3;t+=n*(g.instanceCount&&Number.isFinite(g.instanceCount)?g.instanceCount:1);});return Math.round(t);};
 let disposed=false;
 return {scene,camera,uTime,
  /** Draws (meshes and points in the room, not counting the diver's rig) and triangles, for the budget test and the docs. */
  stats(){let draws=0;scene.traverse(o=>{if(((o as T.Mesh).isMesh||(o as T.Points).isPoints)&&o.name.startsWith('dive-'))draws++;});return {draws,triangles:triangles(),fish:fishMeshes.reduce((n,m)=>n+((m.geometry as T.InstancedBufferGeometry).instanceCount||0),0)-(burst.geometry as T.InstancedBufferGeometry).instanceCount};},
  /** One frame: the time uniform (fish, sway, bubbles), the bubbles' origin, the camera, and the lid / coin while they animate. */
  frame(t:number,dt:number,diver:{x:number;y:number;z:number;yaw:number}){
   uTime.value=t;uPlayer.value.set(diver.x,diver.y+.9,diver.z);follow(dt,diver);
   if(lidT>=0){lidT+=dt;lidOpen=Math.min(1,lidT/1.1);lidHinge.rotation.x=-.9*(lidOpen*lidOpen*(3-2*lidOpen));if(lidT>6){lidT=-2;}}
   else if(lidT<-1){lidT+=dt;lidOpen=Math.max(0,1-(lidT+2)/1.2);lidHinge.rotation.x=-.9*lidOpen;if(lidOpen<=0){lidT=-1;pearl.visible=false;}}
   if(coin.visible){coin.rotation.y=t*1.6;if(coinT>=0){coinT+=dt;coin.position.y=coinHome.y+coinT*1.4;coin.scale.setScalar(Math.max(.01,1-coinT/1.2));if(coinT>1.2){coin.visible=false;coinT=-1;}}}
  },
  /** The size of a bubble (pixels at 1 m), from the drawing buffer's height. */
  setViewport(width:number,height:number,aspect:number){uBubbleScale.value=height;if(camera.aspect!==aspect){camera.aspect=aspect;camera.updateProjectionMatrix();}void width;},
  /** The find's interaction: the coral's burst, the clam opening (visual only), the coin rising into your coins. */
  use(find:DiveFind,t:number){
   if(find.kind==='burst'){uBurst.value.set(coralAt.x,coralAt.y+.3,coralAt.z,t);burst.visible=true;}
   else if(find.kind==='clam'){lidT=0;pearl.visible=true;}
   else if(find.kind==='treasure'&&coin.visible&&coinT<0)coinT=0;
  },
  /** Where a find's prompt floats (room-local), written into `out`. */
  anchor(find:DiveFind,out:T.Vector3){diveFindPoint(find,fp,fl);return out.set(fp.x,fp.y+.9,fp.z);},
  get disposed(){return disposed;},
  /** Free everything the room made (the diver's rig must be taken out first: it belongs to the island). */
  dispose(){if(disposed)return;disposed=true;
   scene.traverse(o=>{const m=o as T.Mesh;if(m.isMesh||(o as T.Points).isPoints){m.geometry.dispose();const mats=Array.isArray(m.material)?m.material:[m.material];mats.forEach(x=>x.dispose());}});
   scene.clear();scene.background=null;scene.fog=null;},
 };
}
export type DiveRoom=ReturnType<typeof createDiveRoom>;

/** The stranded wreck's frame (room-local): on the crest at diveWreckPose, its long axis (local x) along (sin yaw, cos yaw), the bow
 *  lifted (local z rotation) and listing (local x rotation). `flat` is the same place without the tilt (for what lies on the sand). */
export function diveWreckFrame(spot:DiveSpot){
 const w=spot.theme.wreck!,p=diveWreckPose(w,spot.floor),ry=new T.Matrix4().makeRotationY(w.yaw-Math.PI/2);
 const flat=new T.Matrix4().makeTranslation(p.x,p.y,p.z).multiply(ry);
 return {pose:p,flat,base:flat.clone().multiply(new T.Matrix4().makeRotationZ(p.pitch)).multiply(new T.Matrix4().makeRotationX(p.roll))};
}
/**
 * The wreck stranded on the reef (Oct 20 2026; user: "the boat can stick out of the water because it got stranded"): an open hull
 * wedged on the crest, bow up and listing, the near side broken open amidships (a swim-through gap under the hull), ribs, a mast,
 * barnacles, the style's own superstructure; what was spilled lies on the sand round it. Kid-friendly: nothing scary aboard. Built into
 * `S` with its own seeded random, so the room (everything) and the island's above-water piece (lib/graphics/diveWreckTop.ts, the
 * same triangles above the waterline) always match. `coral` grows coral on the hull (the room only).
 */
export function addDiveWreck(S:Merge,spot:DiveSpot,phone:boolean,coral:((x:number,z:number,s:number,c:C,kind:number)=>void)|null){
 const wk=spot.theme.wreck;if(!wk)return;
 const r=rng(spot.blob*31+7),F=(x:number,z:number)=>diveFloor(x,z,spot.floor),{base,flat}=diveWreckFrame(spot);
 const wood=col(wk.style==='cargo'?'#6e5a4e':'#7a5a3c'),dark=col(wk.style==='cargo'?'#4c3f38':'#5a4129'),rust=col('#a8673e');
 const boxPaint=(c:C)=>(v:T.Vector3,n:T.Vector3)=>scl(c,.75+.25*n.y);
 const style=wk.style,{L,W:Wd,H}=diveWreckSize(style);
 const at=(x:number,y:number,z:number,rx=0,ry=0,rz=0,s:number|[number,number,number]=1)=>base.clone().multiply(M(x,y,z,rx,ry,rz,s));
 /** On the sand by the hull (hull-local x, z): flat, at the sand's own height there. */
 const onSand=(x:number,z:number,lift:number,rx=0,ry=0,rz=0)=>{const p=new T.Vector3(x,0,z).applyMatrix4(flat);return new T.Matrix4().makeTranslation(p.x,F(p.x,p.z)+lift,p.z).multiply(new T.Matrix4().extractRotation(flat)).multiply(M(0,0,0,rx,ry,rz));};
 const barnacles=(m:T.Matrix4,n:number,spread:[number,number,number])=>{const barn=col('#cfc6d8');for(let k=0;k<n;k++){const b=new T.IcosahedronGeometry(.06+r()*.06,0);
  S.add(b,m.clone().multiply(M((r()-.5)*spread[0],r()*spread[1],(r()-.5)*spread[2])),()=>scl(barn,.75+.25*r()));}};
 // Keel and ribs: U-shaped half rings across the beam (the hull's frame); the middle ribs stand bare (the swim-through gap).
 const keel=new T.BoxGeometry(L,.3,.4);keel.translate(0,.15,0);S.add(keel,at(0,0,0),boxPaint(dark));
 const ribs=style==='cargo'?9:style==='galleon'?10:7;
 for(let k=0;k<ribs;k++){const u=-L/2+.6+k/(ribs-1)*(L-1.2);if(style==='cargo'&&Math.abs(u)<1.4)continue;const taper=1-Math.pow(Math.abs(u)/(L/2),2)*.55;
  const rib=new T.TorusGeometry(Wd/2*taper,.1,4,8,Math.PI);rib.rotateZ(Math.PI);rib.rotateY(Math.PI/2);S.add(rib,at(u,H*.85,0,0,0,0,[1,H/(Wd/2)*.8,1]),boxPaint(style==='cargo'?rust:wood));}
 // Planks: full on the far side, broken on the near side (a gap amidships you can swim through).
 for(let row=0;row<3;row++)for(const side of [-1,1]){const y=.35+row*H*.28,segs=style==='cargo'?2:3;
  for(let sg=0;sg<segs;sg++){if(side===1&&sg===1)continue;if(side===1&&row===2&&sg!==0)continue;const len=L/segs*.95,u=-L/2+len/2+sg*L/segs,taper=1-Math.pow(Math.abs(u)/(L/2),2)*.5;
   const pl=new T.BoxGeometry(len,.32,.08);S.add(pl,at(u,y,side*Wd/2*taper*(.82+row*.08),side*.12,0,(r()-.5)*.06),boxPaint(row%2?wood:dark));}}
 // Bow and stern posts, the style's own superstructure.
 const post=new T.CylinderGeometry(.14,.18,H*1.3,6);post.translate(0,H*.65,0);S.add(post.clone(),at(-L/2+.2,0,0,0,0,-.35),boxPaint(dark));S.add(post,at(L/2-.2,0,0,0,0,.25),boxPaint(dark));
 if(style==='galleon'){const castle=new T.BoxGeometry(2.6,1.6,Wd*.8);castle.translate(0,.8,0);S.add(castle,at(L/2-1.5,H*.7,0,0,0,0),(v,n,l)=>scl(l.y>.6&&Math.sin(l.x*9)>.3?dark:wood,.8+.2*n.y));
  // The main mast snapped part way up (a stub with a jagged top), the broken top lying across the sand beside the hull.
  const mast=new T.CylinderGeometry(.16,.2,4.4,7);mast.translate(0,2.2,0);S.add(mast,at(-1,.3,0,.12,0,.1),boxPaint(dark));
  const snap=new T.ConeGeometry(.17,.5,7);snap.translate(0,4.6,0);S.add(snap,at(-1,.3,0,.12,0,.1),boxPaint(dark));
  const yard=new T.CylinderGeometry(.08,.08,3.2,5);yard.rotateX(Math.PI/2);S.add(yard,at(-1,3.6,0,.4,0,.1),boxPaint(dark));
  const broken=new T.CylinderGeometry(.16,.18,5,7);broken.rotateZ(Math.PI/2);S.add(broken,onSand(1.5,3.6,.12,0,.6,0),boxPaint(dark));}
 else if(style==='trawler'){const cabin=new T.BoxGeometry(2.2,1.5,Wd*.75);cabin.translate(0,.75,0);S.add(cabin,at(L/2-2,H*.55,0),(v,n,l)=>Math.abs(l.y-1)<.22&&Math.abs(l.x)<.8?col('#2f4a58'):scl(col('#d8d2c2'),.75+.25*n.y));
  const mast=new T.CylinderGeometry(.1,.13,5.2,6);mast.translate(0,2.6,0);S.add(mast,at(-1.2,.3,0),boxPaint(rust));const boom=new T.CylinderGeometry(.06,.06,3.2,5);boom.rotateZ(Math.PI/2);S.add(boom,at(-2.6,2.8,0,0,0,-.4),boxPaint(rust));
  for(let k=0;k<6;k++){const f=new T.SphereGeometry(.16,6,4);S.add(f,onSand(-3+k*.9+(r()-.5)*.3,2.6+(r()-.5)*.5,.1),()=>col(k%2?'#f2a03a':'#e8e0cf'));}}
 else{// cargo: a bridge at the stern, a crane mast, containers spilled on the sand
  const bridge=new T.BoxGeometry(2.4,2,Wd*.8);bridge.translate(0,1,0);S.add(bridge,at(L/2-1.6,H*.6,0),(v,n,l)=>Math.abs(l.y-1.4)<.2?col('#2f4a58'):scl(col('#c8c2b6'),.75+.25*n.y));
  const crane=new T.CylinderGeometry(.12,.15,5,6);crane.translate(0,2.5,0);S.add(crane,at(-3,.3,0,0,0,.5),boxPaint(rust));
  for(let k=0;k<4;k++){const c=new T.BoxGeometry(2.2,1,1.1);c.translate(0,.5,0);const cx=-L/2-1.5+r()*3,cz=(k-1.5)*2.4;S.add(c,onSand(cx,cz,-.15,0,r()*1.2,(r()-.5)*.3),(v,n,l)=>scl(col(['#c4553e','#3f7fb0','#e0b23a','#4f9a6a'][k]),(Math.sin(l.x*14)>.6?.75:1)*(.75+.25*n.y)));}}
 barnacles(at(0,.2,0),phone?36:52,[L*.9,H,Wd]);
 for(let k=0;k<(phone?8:12);k++){const u=(r()-.5)*L*.85,side=r()<.5?-1:1;const m=at(u,H*.6+r()*.4,side*Wd*.42);const p=new T.Vector3().setFromMatrixPosition(m);
  const s=.35+r()*.3,kind=k%2?4:1;if(coral)coral(p.x,p.z,s,col(spot.theme.coral[k%spot.theme.coral.length]),kind);}

}

/** The rock arch (Moon Arch; the layout's arch): rock pieces along a half ring spanning z at x, a crown of boulders on top breaking
 *  the surface (the island's above-water piece is the same build cut at the waterline: diveWreckTop.ts), coral on its back (`coral`,
 *  the room only). Its own seeded random, so the room and the island's crown always match. */
export function addDiveArch(S:Merge,spot:DiveSpot,a:DiveArchSpot,coral:((x:number,z:number,y:number)=>void)|null){
 const r=rng(spot.blob*53+11),{rock}=spot.theme,rockA=col(rock[0]),rockB=col(rock[1]);
 const paint=(v:T.Vector3,n:T.Vector3)=>scl(mix(rockA,rockB,.5+.5*n.y),.85+.15*Math.sin(v.x*2.3+v.z*1.7));
 const top=a.base+a.R*1.15;
 for(let k=0;k<=10;k++){const t=k/10*Math.PI,z=a.z+Math.cos(t)*a.R,y=a.base+Math.sin(t)*a.R*1.15,s=(1.05+.25*Math.sin(k*1.7))*a.R/3.6;
  S.add(rockGeo(90+k,1),M(a.x+(r()-.5)*.3,y,z,r(),r()*6,r(),[s*1.3,s,s*1.1]),paint);if(coral&&k%3===1)coral(a.x,z,y+s*.8);}
 // The crown: a stack of boulders on the arch's top, the highest reaching a.crown (out of the water).
 const h=a.crown-top;for(let k=0;k<4;k++){const s=.9+.35*(3-k)/3,y=top+h*(k+1)/4-s*.5;S.add(rockGeo(140+k,1),M(a.x+(r()-.5)*.6,y,a.z+(r()-.5)*1.2,r(),r()*6,r(),[s*1.2,s,s*1.3]),paint);}
}
