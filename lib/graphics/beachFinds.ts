/**
 * Beachcombing runtime (Oct 14 2026, docs/beachcombing.md): today's finds on the island beaches, their sparkles, the
 * "Pick up the scallop shell" prompt and the pickup (or put-back) animation. Rules, table, rotation and save:
 * lib/town/beachcombing.ts. Prompt, notes and the Shellbook: components/BeachcombHud.tsx.
 *
 * Heat:
 *  - ONE merged, vertex-coloured mesh per island for the day's finds (main island, Coral Cay, Summit Isle with its sandbar): no
 *    textures, no shadows, no transparency, one shared Lambert material. Only an island within 170 m of the player draws (and
 *    it is frustum-culled with its bounding sphere), so a beach costs 1 draw call, plus 1 for the sparkles.
 *  - Each island is built the first time the player comes within 240 m of it: its candidate spots are checked against the world
 *    once (a collider grid), one zone per frame. A picked find is collapsed in place (one vertex-range write), never rebuilt.
 *  - Sparkles: one instanced mesh (≤ 12 tiny instances) over the finds within 45 m, twinkling only then; hidden otherwise.
 *  - A pickup adds one small mesh for 0.4 s (a shell into the basket) or 1 s (an animal back to the sea), then disposes it.
 *  - No timers, no rAF, no listeners but one keydown (E takes when the prompt shows). Far from every beach, update() is a few
 *    box tests. `?beach=0` turns it all off (A/B heat runs).
 */
import * as T from 'three';
import {BEACH_ZONES,BEACHCOMB,beachFindById,zoneCandidates,spotOk,zoneSpots,localBeachDay,readBeach,writeBeach,recordFind,takenToday,promptLabel,findNote,beachStore,beachActions,
 type BeachCandidate,type BeachIsland,type BeachSave,type BeachSpot,type BeachShape,type BeachWorld} from '../town/beachcombing';
import {insideObstacle,type Obstacle} from '../town/simulation';
import {VENUES} from '../town/venues';

type Rect={x:number;z:number;w:number;d:number;kind?:string};
type Ports={
 /** Colliders (world.obstacles + buildings) and laid surfaces (paths, roads, courts, pitches) for the spot checks. */
 obstacles:readonly Obstacle[];paved:readonly Rect[];
 /** One sellable find into the market basket; how many went in (0 = the basket is full). */
 gather:(id:string)=>number;
 /** The one-off kindness reward for putting a living animal back (a unique id per spot and day; the wallet de-duplicates). */
 reward?:(id:string,coins:number,reason:string)=>void;
 /** The character's crouch-and-pick (or a look and a head shake for a look-only find) toward the find. */
 pose:(kind:'gpick'|'headshake',at:{x:number;z:number})=>void;
 busy?:()=>boolean;cue?:(kind:string)=>void;haptic?:()=>void;
 now?:()=>number;read?:()=>string|null;write?:(v:string)=>void;
};
export type BeachUpdate={
 dt:number;x:number;z:number;onFoot:boolean;canEnter:boolean;frozen:boolean;reduced:boolean;
 camera:T.Camera;width:number;height:number;
 /** The HUD arbiter's current 'enter' key (lib/ui/hudStack.ts), so exactly one prompt shows. */
 focusKey:string|null;
 ui:<E extends HTMLElement>(selector:string)=>E|null|undefined;place:(el:HTMLElement,x:number,y:number)=>void;hide:(el:HTMLElement,hidden:boolean)=>void;
};
const OFF=typeof location!=='undefined'&&typeof URLSearchParams!=='undefined'&&new URLSearchParams(location.search).get('beach')==='0';
const NEAR_BUILD=240,NEAR_DRAW=170,FOCUS_KEY='beach';

// ---- Low-poly models (local metres, base on y = 0; a little larger than life so they read from the follow camera) ----
type Part={g:T.BufferGeometry;c:string};
const M4=new T.Matrix4(),Q4=new T.Quaternion(),E4=new T.Euler(),P4=new T.Vector3(),S4=new T.Vector3();
function part(out:Part[],g:T.BufferGeometry,c:string,x:number,y:number,z:number,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1){
 M4.compose(P4.set(x,y,z),Q4.setFromEuler(E4.set(rx,ry,rz)),S4.set(sx,sy,sz));const ng=g.index?g.toNonIndexed():g;if(ng!==g)g.dispose();ng.applyMatrix4(M4);out.push({g:ng,c});}
function shell(out:Part[],body:string,lip:string,s=1){part(out,new T.ConeGeometry(.13*s,.42*s,6),body,0,.11*s,0,0,0,Math.PI/2);part(out,new T.IcosahedronGeometry(.1*s,0),lip,-.2*s,.1*s,0,0,0,0,1,.8,1);}
function cowrie(out:Part[],body:string,top:string,s=1){part(out,new T.SphereGeometry(.15*s,7,5),body,0,.09*s,0,0,0,0,1.45,.75,1);part(out,new T.SphereGeometry(.1*s,6,4),top,0,.15*s,0,0,0,0,1.5,.45,.85);}
export function findParts(shape:BeachShape):Part[]{const o:Part[]=[];
 switch(shape){
  case 'scallop':part(o,new T.CylinderGeometry(.05,.33,.07,9,1,false,-1.25,2.5),'#f2a37e',0,.035,0);part(o,new T.CylinderGeometry(.04,.25,.05,9,1,false,-1.1,2.2),'#f8c9a8',0,.07,0);part(o,new T.BoxGeometry(.14,.05,.08),'#e48d68',.02,.03,0);break;
  case 'spiral':shell(o,'#e3c08f','#f6e3c4');break;
  case 'glass':part(o,new T.IcosahedronGeometry(.1,0),'#7fcfbf',0,.05,0,0,0,0,1,.55,1);part(o,new T.IcosahedronGeometry(.08,0),'#9bd98f',.17,.04,.08,0,1,0,1,.55,1);part(o,new T.IcosahedronGeometry(.07,0),'#a9dfe6',-.12,.035,.13,0,2,0,1,.55,1);break;
  case 'driftwood':part(o,new T.CylinderGeometry(.07,.1,1.15,5),'#a98a68',0,.08,0,0,0,Math.PI/2);part(o,new T.CylinderGeometry(.035,.05,.45,5),'#bea07c',.18,.07,.16,0,0,Math.PI/2+.1,1,1,1);o[o.length-1].g.rotateY(.9);break;
  case 'mussel':part(o,new T.SphereGeometry(.13,6,4),'#33405e',0,.06,0,0,.3,0,1.6,.45,.75);part(o,new T.SphereGeometry(.12,6,4),'#425a7a',.12,.055,.17,0,1.2,0,1.5,.45,.7);break;
  case 'crab':case 'hermit':{const red=shape==='crab'?'#d8573c':'#e2733f';
   if(shape==='crab')part(o,new T.SphereGeometry(.17,7,4),red,0,.1,0,0,0,0,1.3,.5,1);else shell(o,'#ead7b4','#f6e8cf',.9);
   const bx=shape==='crab'?0:.2,by=shape==='crab'?.08:.07;
   for(const sd of [-1,1]){part(o,new T.IcosahedronGeometry(.075,0),red,bx+.2,by,sd*.13);
    for(let k=0;k<3;k++)part(o,new T.BoxGeometry(.22,.03,.03),red,bx-.05+k*.08,by-.03,sd*.17,0,sd*(.5-k*.15),sd*-.3);
    part(o,new T.SphereGeometry(.03,4,3),'#2a2a2a',bx+.14,by+.09,sd*.05);}
   break;}
  case 'cowrie':cowrie(o,'#d99b62','#f3d6a8');break;
  case 'golden':cowrie(o,'#f2bf3c','#ffe28a',1.2);break;
  case 'sanddollar':part(o,new T.CylinderGeometry(.24,.24,.04,12),'#efe6cf',0,.02,0);for(let k=0;k<5;k++){const a=k/5*Math.PI*2;part(o,new T.BoxGeometry(.035,.012,.1),'#cdbd9c',Math.cos(a)*.08,.044,Math.sin(a)*.08,0,-a+Math.PI/2,0);}break;
  case 'starfish':part(o,new T.CylinderGeometry(.1,.1,.06,5),'#ee7d45',0,.04,0);
   for(let k=0;k<5;k++){const a=k/5*Math.PI*2,g=new T.ConeGeometry(.075,.32,4);g.rotateZ(-Math.PI/2);part(o,g,k%2?'#ee7d45':'#f08a52',Math.cos(a)*.2,.035,Math.sin(a)*.2,0,-a,0,1,.45,1);}break;
  case 'conch':part(o,new T.ConeGeometry(.2,.56,7),'#f0d2b4',0,.17,0,0,0,Math.PI/2);part(o,new T.SphereGeometry(.18,6,4),'#f3a3a0',-.2,.12,.04,0,0,0,1,.55,1.25);
   for(let k=0;k<3;k++)part(o,new T.ConeGeometry(.035,.12,4),'#e6c2a0',.05-k*.12,.33,0);break;
  case 'urchin':{part(o,new T.IcosahedronGeometry(.16,0),'#4f2f63',0,.12,0);const ico=new T.IcosahedronGeometry(1,0),pos=ico.getAttribute('position'),seen=new Set<string>();
   for(let i=0;i<pos.count;i++){const v=new T.Vector3().fromBufferAttribute(pos,i),k=v.toArray().map(n=>n.toFixed(2)).join();if(seen.has(k)||v.y< -.3)continue;seen.add(k);
    const g=new T.ConeGeometry(.025,.22,4);g.translate(0,.11,0);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize()));g.translate(v.x*.13,.12+v.y*.13,v.z*.13);part(o,g,'#6b4482',0,0,0);}
   ico.dispose();break;}
 }
 return o;
}
/** Merge parts (non-indexed) into one vertex-coloured geometry at a transform; returns the vertex count added. */
function appendParts(parts:Part[],m:T.Matrix4,pos:number[],nor:number[],col:number[]){const c=new T.Color(),n3=new T.Matrix3().getNormalMatrix(m),v=new T.Vector3();let added=0;
 for(const p of parts){const P=p.g.getAttribute('position'),N=p.g.getAttribute('normal');c.set(p.c);
  for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(m);pos.push(v.x,v.y,v.z);v.fromBufferAttribute(N,i).applyMatrix3(n3).normalize();nor.push(v.x,v.y,v.z);col.push(c.r,c.g,c.b);}added+=P.count;}
 return added;}
function geometryOf(pos:number[],nor:number[],col:number[]){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.computeBoundingSphere();return g;}
/** ~1.7× life size: at the follow camera's ~38 m a real-size shell is a speck (checked in phone screenshots). */
const SHAPE_SCALE=1.7;
/** The yaw and scale a find lies at (from its spot key, so every device draws it the same). */
function spotMatrix(s:BeachSpot,m=new T.Matrix4()){let h=0;for(let i=0;i<s.key.length;i++)h=(h*31+s.key.charCodeAt(i))|0;const yaw=(h>>>0)%628/100;
 return m.compose(P4.set(s.x,s.y,s.z),Q4.setFromEuler(E4.set(0,yaw,0)),S4.setScalar(SHAPE_SCALE));}

/** The colliders and laid surfaces a spot must stay off (Town builds it from the world it has; tests from the built town). */
export function beachWorld(obstacles:readonly Obstacle[],paved:readonly Rect[]):BeachWorld{
 const CELL=4,key=(i:number,j:number)=>i*8192+j,cells=new Map<number,Obstacle[]>();
 for(const o of obstacles){const r=Math.max(o.w,o.d)/2+1.2;for(let i=Math.floor((o.x-r)/CELL);i<=Math.floor((o.x+r)/CELL);i++)for(let j=Math.floor((o.z-r)/CELL);j<=Math.floor((o.z+r)/CELL);j++){const k=key(i,j);let l=cells.get(k);if(!l)cells.set(k,l=[]);l.push(o);}}
 // A long natural 'sand' area is the Summit Sandbar itself (world.ts lists it for landings), not a court: finds may lie on it.
 const rects=[...paved.filter(r=>!(r.kind==='sand'&&Math.max(r.w,r.d)>60)),...VENUES.map(v=>({x:v.x,z:v.z,w:v.width+6,d:v.length+6}))];
 return {blocked:(x,z,pad)=>{const l=cells.get(key(Math.floor(x/CELL),Math.floor(z/CELL)));return !!l&&l.some(o=>insideObstacle(x,z,o,pad));},
  paved:(x,z,pad)=>rects.some(r=>Math.abs(x-r.x)<r.w/2+pad&&Math.abs(z-r.z)<r.d/2+pad)};
}

type Isle={island:BeachIsland;zones:typeof BEACH_ZONES[number][];box:{minX:number;maxX:number;minZ:number;maxZ:number};valid:Record<string,BeachCandidate[]>;checked:number;
 spots:BeachSpot[];mesh:T.Mesh|null;ranges:Map<string,[number,number]>;day:string};
type Anim={spot:BeachSpot;mesh:T.Mesh;t:number;dur:number;mode:'basket'|'sea'|'look';from:T.Vector3};

export function createBeachFinds(scene:T.Scene,ports:Ports){
 const now=ports.now??(()=>Date.now()),cue=(k:string)=>ports.cue?.(k);
 const root=new T.Group();root.name='beach-finds';scene.add(root);
 const mat=new T.MeshLambertMaterial({color:'#ffffff',vertexColors:true,flatShading:true,emissive:'#3a2a14',emissiveIntensity:.22});
 let world:BeachWorld|null=null;const getWorld=()=>world??=beachWorld(ports.obstacles,ports.paved);
 const isles:Isle[]=(['main','cay','summit'] as BeachIsland[]).map(island=>{const zones=BEACH_ZONES.filter(z=>z.island===island);let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
  for(const z of zones)for(const c of zoneCandidates(z)){minX=Math.min(minX,c.x);maxX=Math.max(maxX,c.x);minZ=Math.min(minZ,c.z);maxZ=Math.max(maxZ,c.z);}
  return {island,zones,box:{minX,maxX,minZ,maxZ},valid:{},checked:0,spots:[],mesh:null,ranges:new Map(),day:''};});
 let save:BeachSave=readBeach(now(),ports.read);let day=localBeachDay(now()),dayClock=0;
 const persist=(s:BeachSave)=>{save=s;writeBeach(s,ports.write);};
 const boxDist=(b:Isle['box'],x:number,z:number)=>Math.hypot(Math.max(0,b.minX-x,x-b.maxX),Math.max(0,b.minZ-z,z-b.maxZ));
 const stats={islands:0,spots:0,checks:0,taken:0,putBack:0,looked:0,busyFrames:0,idleFrames:0,get drawn(){return isles.filter(i=>i.mesh?.visible).length+(sparkles.visible?1:0)+anims.length;}};

 // ---- sparkles: one instanced mesh, the nearest finds only
 const sparkGeo=new T.OctahedronGeometry(.16,0),sparkMat=new T.MeshBasicMaterial({color:'#fff4c4'});
 const sparkles=new T.InstancedMesh(sparkGeo,sparkMat,BEACHCOMB.maxSparkles);sparkles.name='beach-sparkles';sparkles.frustumCulled=false;sparkles.visible=false;sparkles.count=0;root.add(sparkles);
 const D=new T.Object3D();let sparkTime=0,sparkList:BeachSpot[]=[],sparkPick=0;

 /** Build one island: check its candidates (a zone per call) and, when all are checked, draw today's untaken finds. */
 function step(isle:Isle){
  if(isle.checked<isle.zones.length){const z=isle.zones[isle.checked++],w=getWorld();const list=zoneCandidates(z);stats.checks+=list.length;isle.valid[z.id]=list.filter(c=>spotOk(c,w));return;}
  draw(isle);
 }
 function draw(isle:Isle){
  if(isle.mesh){isle.mesh.removeFromParent();isle.mesh.geometry.dispose();isle.mesh=null;}
  isle.day=day;isle.spots=isle.zones.flatMap(z=>zoneSpots(day,z,isle.valid[z.id]??[]));isle.ranges.clear();
  const taken=new Set(takenToday(save,now())),pos:number[]=[],nor:number[]=[],col:number[]=[],m=new T.Matrix4();let at=0;
  for(const s of isle.spots){const f=beachFindById(s.find)!;
   // Taken today: gone, except a look-only urchin, which stays where it lives.
   if(taken.has(s.key)&&f.care!=='look')continue;
   const parts=findParts(f.shape),n=appendParts(parts,spotMatrix(s,m),pos,nor,col);parts.forEach(p=>p.g.dispose());isle.ranges.set(s.key,[at,n]);at+=n;}
  stats.islands=isles.filter(i=>i.day).length;stats.spots=isles.reduce((n,i)=>n+i.spots.length,0);
  if(!at)return;
  const g=geometryOf(pos,nor,col);(g.getAttribute('position') as T.BufferAttribute).setUsage(T.DynamicDrawUsage);
  const mesh=new T.Mesh(g,mat);mesh.name=`beach-finds-${isle.island}`;mesh.castShadow=false;mesh.receiveShadow=false;mesh.matrixAutoUpdate=false;mesh.updateMatrix();root.add(mesh);isle.mesh=mesh;
 }
 /** A taken find leaves the merged mesh: its vertices collapse onto one point (no rebuild). */
 function collapse(isle:Isle,key:string){const r=isle.ranges.get(key);if(!r||!isle.mesh)return;const a=isle.mesh.geometry.getAttribute('position') as T.BufferAttribute,arr=a.array as Float32Array,[s,n]=r;
  const x=arr[s*3],y=arr[s*3+1],z=arr[s*3+2];for(let i=s;i<s+n;i++){arr[i*3]=x;arr[i*3+1]=y;arr[i*3+2]=z;}a.clearUpdateRanges();a.addUpdateRange(s*3,n*3);a.needsUpdate=true;isle.ranges.delete(key);}

 // ---- taking a find
 let near:{isle:Isle;spot:BeachSpot}|null=null,promptShown=false,lastLabel='';
 const anims:Anim[]=[];const player={x:0,z:0,onFoot:false,reduced:false};
 const available=(s:BeachSpot,taken:readonly string[])=>!taken.includes(s.key);
 function take(){
  if(!near||!player.onFoot||ports.busy?.())return false;
  const {isle,spot}=near,f=beachFindById(spot.find)!,t0=now(),first=!save.tip&&f.care==='sell',firstKind=!save.kind&&f.care==='putBack';
  let added=true;
  if(f.care==='sell'){added=ports.gather(f.id)>0;if(!added){beachStore.note(findNote(f,{added,first,firstKind,coins:0}));return false;}}
  persist({...recordFind(save,spot.key,f.id,t0),tip:save.tip||first,kind:save.kind||firstKind});
  if(f.care==='putBack'&&f.value>0)ports.reward?.(`beach:${localBeachDay(t0)}:${spot.key}`,f.value,`Kind to sea life · ${f.name}`);
  ports.pose(f.care==='look'?'headshake':'gpick',{x:spot.x,z:spot.z});ports.haptic?.();if(f.care!=='look')cue('pick');
  if(f.care!=='look'){
   const parts=findParts(f.shape),m=new T.Matrix4(),pos:number[]=[],nor:number[]=[],col:number[]=[];appendParts(parts,m,pos,nor,col);parts.forEach(p=>p.g.dispose());
   const mesh=new T.Mesh(geometryOf(pos,nor,col),mat);mesh.name='beach-find-moving';spotMatrix(spot,mesh.matrix);mesh.matrix.decompose(mesh.position,mesh.quaternion,mesh.scale);root.add(mesh);
   collapse(isle,spot.key);
   anims.push({spot,mesh,t:0,dur:f.care==='sell'?.42:1.1,mode:f.care==='sell'?'basket':'sea',from:mesh.position.clone()});
  }
  if(f.care==='sell')stats.taken++;else if(f.care==='putBack')stats.putBack++;else stats.looked++;
  beachStore.note({...findNote(f,{added,first,firstKind,coins:f.care==='putBack'?f.value:0}),merge:first||firstKind?undefined:f.id});
  near=null;
  return true;
 }
 function onKey(e:KeyboardEvent){if(e.key.toLowerCase()!=='e'||e.repeat||!promptShown)return;const el=e.target as HTMLElement|null;if(el&&(el.tagName==='INPUT'||el.tagName==='TEXTAREA'||el.isContentEditable))return;if(take())e.preventDefault();}
 if(typeof window!=='undefined')window.addEventListener('keydown',onKey);
 beachActions.take=()=>{take();};

 const anchor=new T.Vector3();
 return {
  root,stats,
  /** Debug, tests and screenshots: today's finds on every built island (and whether each is still there). */
  view(){const taken=takenToday(save,now());return {day,islands:isles.map(i=>({island:i.island,built:!!i.day,spots:i.spots.map(s=>({key:s.key,find:s.find,x:s.x,y:s.y,z:s.z,taken:taken.includes(s.key)}))})),save,near:near?.spot.key??null};},
  /** Build every island now (tests, screenshots). */
  buildAll(){for(const i of isles)while(!i.day)step(i);},
  /** Dev and heat runs only: today's finds back on the sand. */
  refill(){persist({...save,taken:[]});for(const i of isles)if(i.day)draw(i);},
  take,
  update(c:BeachUpdate):{key:string;distance:number}|null{
   const prompt=c.ui<HTMLButtonElement>('[data-beach-find]');
   if(OFF){if(prompt&&!prompt.hidden)c.hide(prompt,true);return null;}
   player.x=c.x;player.z=c.z;player.onFoot=c.onFoot;player.reduced=c.reduced;
   if(c.frozen){if(promptShown&&prompt)c.hide(prompt,true);promptShown=false;return null;}
   // A new local day: new finds in new places (checked every few seconds, not every frame).
   dayClock+=c.dt;if(dayClock>4){dayClock=0;const d=localBeachDay(now());if(d!==day){day=d;save=readBeach(now(),ports.read);for(const i of isles)if(i.day)draw(i);}}
   let work=false,best:typeof near=null,bestD:number=BEACHCOMB.reach;
   const taken=takenToday(save,now());
   for(const isle of isles){const d=boxDist(isle.box,c.x,c.z);
    if(!isle.day){if(d<NEAR_BUILD){step(isle);work=true;}continue;}
    const show=d<NEAR_DRAW;if(isle.mesh&&isle.mesh.visible!==show)isle.mesh.visible=show;
    if(d>BEACHCOMB.sparkle)continue;
    if(c.onFoot&&c.canEnter&&!anims.some(a=>a.mode==='basket'))for(const s of isle.spots){const dx=s.x-c.x,dz=s.z-c.z;if(Math.abs(dx)>bestD||Math.abs(dz)>bestD||!available(s,taken))continue;const e=Math.hypot(dx,dz);if(e<bestD){bestD=e;best={isle,spot:s};}}}
   near=best;
   // ---- sparkles over the nearest untaken finds (the list is refreshed four times a second)
   sparkPick-=c.dt;if(sparkPick<=0){sparkPick=.25;sparkList=[];
    for(const isle of isles){if(!isle.day||boxDist(isle.box,c.x,c.z)>BEACHCOMB.sparkle)continue;for(const s of isle.spots)if(available(s,taken)&&Math.hypot(s.x-c.x,s.z-c.z)<BEACHCOMB.sparkle)sparkList.push(s);}
    sparkList.sort((a,b)=>Math.hypot(a.x-c.x,a.z-c.z)-Math.hypot(b.x-c.x,b.z-c.z));sparkList.length=Math.min(sparkList.length,BEACHCOMB.maxSparkles);}
   if(sparkList.length){work=true;sparkTime+=c.reduced?0:c.dt;
    sparkList.forEach((s,i)=>{const ph=(s.x*1.7+s.z*.9)%6.28,tw=c.reduced?1:.55+.45*Math.max(0,Math.sin(sparkTime*2.6+ph));
     D.position.set(s.x,s.y+.75+.06*Math.sin(sparkTime*1.4+ph),s.z);D.rotation.set(0,sparkTime*1.5+ph,0);D.scale.set(tw*.8,tw*1.5,tw*.8);D.updateMatrix();sparkles.setMatrixAt(i,D.matrix);});
    sparkles.count=sparkList.length;sparkles.instanceMatrix.needsUpdate=true;if(!sparkles.visible)sparkles.visible=true;}
   else if(sparkles.visible){sparkles.visible=false;sparkles.count=0;}
   // ---- pickups under way
   for(let i=anims.length-1;i>=0;i--){const a=anims[i];work=true;a.t+=c.dt;const k=Math.min(1,a.t/a.dur);
    if(a.mode==='basket'){// up and into the player's hands, shrinking
     const e=k*k*(3-2*k);a.mesh.position.set(a.from.x+(c.x-a.from.x)*e,a.from.y+(a.from.y+1.1-a.from.y)*e+Math.sin(k*Math.PI)*.6,a.from.z+(c.z-a.from.z)*e);a.mesh.scale.setScalar(SHAPE_SCALE*Math.max(.05,1-k*.85));}
    else{// gently down the beach to the water, then under the sea
     const go=Math.min(1,k/.8);a.mesh.position.set(a.from.x+a.spot.sx*1.8*go,a.from.y-(k>.8?(k-.8)*1.2:0),a.from.z+a.spot.sz*1.8*go);
     a.mesh.rotation.y+=Math.sin(a.t*18)*.02;if(k>.8)a.mesh.scale.setScalar(SHAPE_SCALE*Math.max(.05,1-(k-.8)*4));}
    if(c.reduced||k>=1){a.mesh.removeFromParent();a.mesh.geometry.dispose();anims.splice(i,1);}}
   if(work)stats.busyFrames++;else stats.idleFrames++;
   // ---- the prompt
   const want=near?{key:FOCUS_KEY,distance:bestD}:null;
   if(near){const l=promptLabel(beachFindById(near.spot.find)!);if(l!==lastLabel){lastLabel=l;beachStore.set({label:l});}}
   if(prompt){let hidden=!(want&&c.focusKey===FOCUS_KEY);
    if(!hidden&&near){anchor.set(near.spot.x,near.spot.y+1.3,near.spot.z).project(c.camera);hidden=anchor.z< -1||anchor.z>1;
     if(!hidden)c.place(prompt,T.MathUtils.clamp((anchor.x+1)*c.width/2,120,c.width-120),T.MathUtils.clamp((1-anchor.y)*c.height/2,90,c.height-160));}
    if(prompt.hidden!==hidden)c.hide(prompt,hidden);promptShown=!hidden;}
   return want;
  },
  dispose(){if(typeof window!=='undefined')window.removeEventListener('keydown',onKey);beachActions.take=()=>{};beachStore.reset();
   for(const a of anims){a.mesh.geometry.dispose();}anims.length=0;
   for(const i of isles){if(i.mesh){i.mesh.geometry.dispose();i.mesh=null;}}
   root.removeFromParent();sparkles.dispose();sparkGeo.dispose();sparkMat.dispose();mat.dispose();},
 };
}
export type BeachFinds=ReturnType<typeof createBeachFinds>;
